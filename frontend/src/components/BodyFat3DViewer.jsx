import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// Exact anatomical centers matched to the Blender humanoid vertices
const FAT_ZONES_COORDINATES = {
  visceral_abdomen: [
    { pos: new THREE.Vector3(0, 0.92, 0.04), radius: 0.28, name: "Abdomen & Deep Belly" }
  ],
  love_handles_flanks: [
    { pos: new THREE.Vector3(-0.17, 0.90, -0.04), radius: 0.24, name: "Left Flank" },
    { pos: new THREE.Vector3(0.17, 0.90, -0.04), radius: 0.24, name: "Right Flank" }
  ],
  hips_thighs: [
    // Mid Thighs (Left & Right)
    { pos: new THREE.Vector3(-0.13, 0.56, 0.02), radius: 0.26, name: "Left Mid-Thigh" },
    { pos: new THREE.Vector3(0.13, 0.56, 0.02), radius: 0.26, name: "Right Mid-Thigh" },
    // Upper Thighs & Gluteal Hips
    { pos: new THREE.Vector3(-0.16, 0.72, 0.0), radius: 0.26, name: "Left Upper Thigh" },
    { pos: new THREE.Vector3(0.16, 0.72, 0.0), radius: 0.26, name: "Right Upper Thigh" },
    // Lower Thighs (above knee)
    { pos: new THREE.Vector3(-0.12, 0.45, 0.03), radius: 0.22, name: "Left Lower Thigh" },
    { pos: new THREE.Vector3(0.12, 0.45, 0.03), radius: 0.22, name: "Right Lower Thigh" }
  ],
  chest_torso: [
    { pos: new THREE.Vector3(0, 1.24, 0.04), radius: 0.24, name: "Chest / Torso" }
  ],
  arms_back: [
    { pos: new THREE.Vector3(-0.32, 1.20, -0.04), radius: 0.22, name: "Left Upper Arm" },
    { pos: new THREE.Vector3(0.32, 1.20, -0.04), radius: 0.22, name: "Right Upper Arm" }
  ]
};

// 3D Blender Mannequin Model with Direct Surface Heatmap Vertex Coloring & Morph Targets
function BlenderMannequinMesh({ inputs, zones }) {
  const groupRef = useRef();
  const { weight_kg, height_cm, biological_sex, body_build, waist_cm, hip_cm, thigh_cm } = inputs;
  const isMale = biological_sex === 'male';
  const modelPath = isMale ? '/models/body_male.glb' : '/models/body_female.glb';
  
  const { scene } = useGLTF(modelPath);

  // Clone scene so materials/vertex colors are cleanly isolated
  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  // Compute Shape Key weights based on user metrics
  const bmi = weight_kg / (((height_cm || 172) / 100) ** 2);
  const whtr = (waist_cm || (height_cm * 0.46)) / height_cm;

  const targetWeights = useMemo(() => {
    const thin = bmi < 21.0 ? Math.max(0.0, Math.min(1.0, (21.0 - bmi) / 6.0)) : 0.0;
    let heavy = bmi > 23.0 ? Math.max(0.0, Math.min(1.0, (bmi - 23.0) / 15.0)) : 0.0;
    
    // Direct anatomical adjustments for hips and thighs
    if (!isMale && hip_cm && hip_cm >= 100.0) {
      heavy = Math.max(heavy, Math.min(0.35, (hip_cm - 100.0) / 40.0));
    }
    if (!isMale && thigh_cm && thigh_cm >= 60.0) {
      heavy = Math.max(heavy, Math.min(0.35, (thigh_cm - 60.0) / 30.0));
    }

    const waistWide = whtr > 0.45 ? Math.max(0.0, Math.min(1.0, (whtr - 0.45) / 0.20)) : 0.0;
    const muscular = body_build === 'muscular' ? 0.8 : (body_build === 'average' ? 0.2 : 0.0);

    return {
      Thin: thin,
      Heavy: heavy,
      Waist_Wide: waistWide,
      Muscular: muscular,
    };
  }, [bmi, whtr, body_build, isMale, hip_cm, thigh_cm]);

  // Extract active excess fat zones (flanks, abdomen, thighs, etc.)
  const activeFatCenters = useMemo(() => {
    const list = [];
    if (!zones) return list;

    Object.entries(zones).forEach(([key, z]) => {
      // If zone has elevated score or is marked blinking
      if (z.is_blinking || z.score >= 35) {
        const centers = FAT_ZONES_COORDINATES[key] || [];
        const intensity = Math.min(1.0, 0.75 + ((z.score - 35) / 65) * 0.25);
        centers.forEach((c) => {
          list.push({
            pos: c.pos,
            radius: c.radius * 1.08,
            intensity,
            name: c.name,
            score: z.score
          });
        });
      }
    });

    // Also link morph target weights directly: if Heavy is high, include thighs/hips
    if (targetWeights.Heavy > 0.05) {
      const thighCenters = FAT_ZONES_COORDINATES.hips_thighs || [];
      thighCenters.forEach((c) => {
        if (!list.some(item => item.name === c.name)) {
          list.push({
            pos: c.pos,
            radius: c.radius * 1.08,
            intensity: Math.min(0.70 + targetWeights.Heavy * 0.45, 1.0),
            name: c.name,
            score: Math.round(targetWeights.Heavy * 80)
          });
        }
      });
    }

    return list;
  }, [zones, targetWeights]);

  // Setup vertex colors on the mesh geometry once
  useEffect(() => {
    clonedScene.traverse((child) => {
      if (child.isMesh && child.geometry) {
        const geom = child.geometry;
        const count = geom.attributes.position.count;
        if (!geom.attributes.color) {
          const colors = new Float32Array(count * 3);
          for (let i = 0; i < count; i++) {
            colors[i * 3] = 0.92;
            colors[i * 3 + 1] = 0.94;
            colors[i * 3 + 2] = 0.96;
          }
          geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        }

        if (child.material) {
          child.material = child.material.clone();
          child.material.vertexColors = true;
          child.material.roughness = 0.42;
          child.material.metalness = 0.04;
        }
      }
    });
  }, [clonedScene]);

  // Frame loop: Lerp morph targets + calm breathing human-friendly coral highlight
  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const lerpFactor = Math.min(1.0, delta * 8.0);
    // Smooth natural breathing rate (2.8 second cycle)
    const breathFactor = 0.70 + 0.30 * ((Math.sin(t * 2.2) + 1.0) / 2.0);

    // Gentle 360 degree rotation
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.35;
    }

    clonedScene.traverse((child) => {
      if (child.isMesh) {
        // 1. Lerp morph targets
        if (child.morphTargetDictionary && child.morphTargetInfluences) {
          const dict = child.morphTargetDictionary;
          const influences = child.morphTargetInfluences;
          Object.entries(targetWeights).forEach(([key, targetVal]) => {
            if (key in dict) {
              const idx = dict[key];
              influences[idx] = THREE.MathUtils.lerp(influences[idx], targetVal, lerpFactor);
            }
          });
        }

        // 2. Human-chosen warm coral-rose highlight (refined thermal medical scan)
        if (child.geometry && child.geometry.attributes.color) {
          const posAttr = child.geometry.attributes.position;
          const colorAttr = child.geometry.attributes.color;
          const colors = colorAttr.array;
          const count = posAttr.count;

          const baseR = 0.92, baseG = 0.94, baseB = 0.96;
          // Rich, unmistakable, vibrant red highlight with high opacity
          const highlightR = 0.96, highlightG = 0.12, highlightB = 0.18;

          if (activeFatCenters.length > 0) {
            for (let i = 0; i < count; i++) {
              const vx = posAttr.getX(i);
              const vy = posAttr.getY(i);
              const vz = posAttr.getZ(i);

              let maxHeat = 0.0;

              for (let j = 0; j < activeFatCenters.length; j++) {
                const fatCenter = activeFatCenters[j];
                const dx = vx - fatCenter.pos.x;
                const dy = vy - fatCenter.pos.y;
                const dz = vz - fatCenter.pos.z;
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                if (dist < fatCenter.radius) {
                  const falloff = 0.5 * (1.0 + Math.cos((Math.PI * dist) / fatCenter.radius));
                  // Boost opacity power curve so the red is prominent, deep and clearly visible
                  const heat = Math.pow(falloff, 0.65) * fatCenter.intensity * 1.35;
                  if (heat > maxHeat) maxHeat = heat;
                }
              }

              const activeHeat = Math.min(1.0, maxHeat * breathFactor);

              colors[i * 3] = THREE.MathUtils.lerp(baseR, highlightR, activeHeat);
              colors[i * 3 + 1] = THREE.MathUtils.lerp(baseG, highlightG, activeHeat);
              colors[i * 3 + 2] = THREE.MathUtils.lerp(baseB, highlightB, activeHeat);
            }
          } else {
            // Restore neutral porcelain
            for (let i = 0; i < count; i++) {
              colors[i * 3] = baseR;
              colors[i * 3 + 1] = baseG;
              colors[i * 3 + 2] = baseB;
            }
          }

          colorAttr.needsUpdate = true;
        }
      }
    });
  });

  const heightScale = Math.min(Math.max((height_cm || 172) / 170.0, 0.85), 1.15);

  return (
    <group ref={groupRef} scale={[heightScale, heightScale, heightScale]} position={[0, -0.85, 0]}>
      <primitive object={clonedScene} />

      {/* Floating 3D Badge Tag - Unified Matte Highlight Theme */}
      {activeFatCenters.length > 0 && (
        <Html
          distanceFactor={3.6}
          position={[0, 0.65, 0.28]}
          center
        >
          <div className="pointer-events-none select-none bg-slate-900/95 backdrop-blur-md text-rose-200/90 text-[10px] font-medium px-3 py-1 rounded-full border border-rose-900/40 shadow-xl flex items-center gap-1.5 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400/90 animate-pulse" />
            <span>Target Area: Regional Adiposity</span>
          </div>
        </Html>
      )}
    </group>
  );
}

useGLTF.preload('/models/body_male.glb');
useGLTF.preload('/models/body_female.glb');

export default function BodyFat3DViewer({ inputs, fatDistribution }) {
  const zones = fatDistribution?.zones || {};
  const anyExcess = fatDistribution?.any_excess_fat;

  return (
    <div className="w-full bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative">
      {/* HUD Header */}
      <div className="absolute top-3.5 left-4 right-4 z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pointer-events-none">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/90 border border-slate-700/80 text-[11px] font-medium text-slate-300 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400/80" />
            3D ANATOMICAL SCANNER
          </div>
          <h3 className="text-white text-base font-bold mt-1 tracking-tight flex items-center gap-2">
            Adiposity Distribution Map ({inputs.biological_sex === 'male' ? 'Male' : 'Female'})
            {anyExcess && (
              <span className="text-[11px] font-medium bg-rose-950/20 text-rose-200/90 border border-rose-900/40 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400/90 animate-pulse" /> Focus Highlight Active
              </span>
            )}
          </h3>
        </div>

        <div className="text-[11px] text-slate-300 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 self-start sm:self-auto">
          ↔️ Drag to rotate 360°
        </div>
      </div>

      {/* 3D WebGL Canvas */}
      <div className="w-full h-[450px] sm:h-[500px]">
        <Canvas
          camera={{ position: [0, 0.1, 2.7], fov: 42 }}
          gl={{ antialias: true, alpha: true }}
        >
          {/* Studio Lighting */}
          <ambientLight intensity={0.85} />
          <directionalLight position={[3, 5, 4]} intensity={1.45} color="#ffffff" />
          <directionalLight position={[-4, 2, -3]} intensity={0.8} color="#38bdf8" />
          <pointLight position={[0, -1, 2]} intensity={0.6} color="#818cf8" />

          {/* Interactive Controls (Horizontal-only to prevent flipping upside down) */}
          <OrbitControls
            enablePan={false}
            minDistance={1.6}
            maxDistance={4.2}
            minPolarAngle={Math.PI / 2}
            maxPolarAngle={Math.PI / 2}
            enableDamping={true}
            dampingFactor={0.08}
          />

          {/* Mannequin Mesh with Direct Surface Thermal Coloring */}
          <BlenderMannequinMesh inputs={inputs} zones={zones} />
        </Canvas>
      </div>

      {/* Bottom Diagnosis HUD Bar */}
      <div className="bg-slate-900/95 border-t border-slate-800/80 p-4 sm:p-5 backdrop-blur-md">
        <div className="flex items-start gap-3">
          <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${anyExcess ? 'bg-rose-400/90 animate-pulse' : 'bg-teal-400/80'}`} />
          <div className="flex-1">
            <div className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <span>{anyExcess ? "Surface Adiposity Signal: Regional Focus Active" : "Surface Adiposity Signal: Optimal Balance"}</span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {fatDistribution?.ai_summary}
            </p>
          </div>
        </div>

        {/* Breakdown chips of each zone */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-4 pt-3 border-t border-slate-800">
          {Object.values(zones).map((z) => (
            <div
              key={z.key}
              className={`p-2 rounded-xl border text-center transition-all ${
                z.is_blinking
                  ? 'bg-rose-950/20 border-rose-900/40 text-slate-200'
                  : 'bg-slate-900/50 border-slate-800/60 text-slate-400'
              }`}
            >
              <div className="text-[10px] font-medium text-slate-400 truncate">{z.name.split('(')[0]}</div>
              <div className={`text-xs font-bold mt-0.5 ${z.is_blinking ? 'text-rose-200/90' : 'text-slate-400'}`}>
                {z.score} <span className="text-[9px] font-normal text-slate-500">/100</span>
              </div>
              <div className="text-[9px] mt-0.5 text-slate-400">
                {z.is_blinking ? 'Target Area' : 'Optimal'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
