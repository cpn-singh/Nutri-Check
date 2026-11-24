import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// Anatomical centers matched to Blender humanoid mesh (Three.js coordinates: Y=up, Z=front, X=sides)
const ANATOMICAL_FAT_REGIONS = [
  // 1. Abdomen & Deep Belly (Y: 0.92, Z: 0.04)
  { center: new THREE.Vector3(0, 0.92, 0.04), radius: 0.28, zoneKey: 'visceral_abdomen', morphKey: 'Waist_Wide', factor: 1.2 },
  // 2. Left & Right Flanks / Love Handles (Y: 0.90, X: ±0.17, Z: -0.04)
  { center: new THREE.Vector3(-0.17, 0.90, -0.04), radius: 0.24, zoneKey: 'love_handles_flanks', morphKey: 'Waist_Wide', factor: 1.0 },
  { center: new THREE.Vector3(0.17, 0.90, -0.04), radius: 0.24, zoneKey: 'love_handles_flanks', morphKey: 'Waist_Wide', factor: 1.0 },
  // 3. Thighs & Hips (Gynoid fat distribution)
  // Left Mid-Thigh (Y: 0.56, X: -0.13, Z: 0.02)
  { center: new THREE.Vector3(-0.13, 0.56, 0.02), radius: 0.25, zoneKey: 'hips_thighs', morphKey: 'Heavy', factor: 1.3 },
  // Right Mid-Thigh (Y: 0.56, X: 0.13, Z: 0.02)
  { center: new THREE.Vector3(0.13, 0.56, 0.02), radius: 0.25, zoneKey: 'hips_thighs', morphKey: 'Heavy', factor: 1.3 },
  // Left Upper Thigh & Gluteal Hip (Y: 0.72, X: -0.16, Z: 0.0)
  { center: new THREE.Vector3(-0.16, 0.72, 0.0), radius: 0.26, zoneKey: 'hips_thighs', morphKey: 'Heavy', factor: 1.2 },
  // Right Upper Thigh & Gluteal Hip (Y: 0.72, X: 0.16, Z: 0.0)
  { center: new THREE.Vector3(0.16, 0.72, 0.0), radius: 0.26, zoneKey: 'hips_thighs', morphKey: 'Heavy', factor: 1.2 },
  // 4. Chest / Upper Torso (Y: 1.24, Z: 0.04)
  { center: new THREE.Vector3(0, 1.24, 0.04), radius: 0.24, zoneKey: 'chest_torso', morphKey: 'Heavy', factor: 0.9 },
  // 5. Upper Arms (Y: 1.20, X: ±0.32, Z: -0.04)
  { center: new THREE.Vector3(-0.32, 1.20, -0.04), radius: 0.22, zoneKey: 'arms_back', morphKey: 'Heavy', factor: 0.8 },
  { center: new THREE.Vector3(0.32, 1.20, -0.04), radius: 0.22, zoneKey: 'arms_back', morphKey: 'Heavy', factor: 0.8 },
];

function MannequinMesh({ body3D, zones }) {
  const groupRef = useRef();
  const modelType = body3D?.model === 'female' ? 'female' : 'male';
  const modelPath = `/models/body_${modelType}.glb`;
  
  const { scene } = useGLTF(modelPath);

  // Clone scene so materials/vertex colors are cleanly isolated
  const clonedScene = useMemo(() => scene.clone(true), [scene]);

  // Target morph weights (0.0 to 1.0)
  const targetWeights = useMemo(() => {
    const weights = body3D?.morph_weights || {};
    return {
      Thin: Math.max(0.0, Math.min(1.0, weights.Thin ?? 0.0)),
      Heavy: Math.max(0.0, Math.min(1.0, weights.Heavy ?? 0.0)),
      Waist_Wide: Math.max(0.0, Math.min(1.0, weights.Waist_Wide ?? 0.0)),
      Muscular: Math.max(0.0, Math.min(1.0, weights.Muscular ?? 0.0)),
    };
  }, [body3D]);

  const heightScale = body3D?.height_scale || 1.0;

  // Setup vertex colors buffer on cloned mesh
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

  // Frame loop: Lerp morph targets + smooth, human-friendly warm coral highlight
  useFrame((state, delta) => {
    const lerpFactor = Math.min(1.0, delta * 8.0);
    const t = state.clock.getElapsedTime();
    // Gentle natural breathing rhythm (calm 2.8-second cycle, no harsh flashing)
    const breathFactor = 0.70 + 0.30 * ((Math.sin(t * 2.2) + 1.0) / 2.0);

    clonedScene.traverse((child) => {
      if (child.isMesh) {
        // 1. Morph target lerp
        if (child.morphTargetDictionary && child.morphTargetInfluences) {
          const dict = child.morphTargetDictionary;
          const influences = child.morphTargetInfluences;

          Object.entries(targetWeights).forEach(([key, targetVal]) => {
            if (key in dict) {
              const index = dict[key];
              influences[index] = THREE.MathUtils.lerp(influences[index], targetVal, lerpFactor);
            }
          });
        }

        // 2. Human-chosen warm coral-rose highlight matching modern health UI aesthetic
        if (child.geometry && child.geometry.attributes.color) {
          const posAttr = child.geometry.attributes.position;
          const colorAttr = child.geometry.attributes.color;
          const colors = colorAttr.array;
          const count = posAttr.count;

          // Clean cool porcelain baseline (matches site's slate-50 / sky-50 vibe)
          const baseR = 0.92, baseG = 0.94, baseB = 0.96;
          // Rich, unmistakable, vibrant red highlight with high opacity
          const highlightR = 0.96, highlightG = 0.12, highlightB = 0.18;

          const heavyVal = targetWeights.Heavy || 0.0;
          const waistVal = targetWeights.Waist_Wide || 0.0;

          let hasActiveFat = heavyVal > 0.02 || waistVal > 0.02;
          if (zones) {
            hasActiveFat = hasActiveFat || Object.values(zones).some(z => z.is_blinking || z.score >= 35);
          }

          if (hasActiveFat) {
            for (let i = 0; i < count; i++) {
              const vx = posAttr.getX(i);
              const vy = posAttr.getY(i);
              const vz = posAttr.getZ(i);

              let maxHeat = 0.0;

              for (let j = 0; j < ANATOMICAL_FAT_REGIONS.length; j++) {
                const reg = ANATOMICAL_FAT_REGIONS[j];
                let intensity = 0.0;

                // Priority 1: Check clinical zone score
                if (zones && zones[reg.zoneKey]) {
                  const z = zones[reg.zoneKey];
                  if (z.is_blinking || z.score >= 35) {
                    intensity = Math.min(1.0, 0.70 + ((z.score - 35) / 65) * 0.30);
                  }
                }

                // Priority 2: Fallback to morph weight
                if (intensity === 0.0) {
                  const activeVal = reg.morphKey === 'Waist_Wide' ? waistVal : heavyVal;
                  if (activeVal > 0.02) {
                    intensity = Math.min(1.0, 0.45 + activeVal * reg.factor * 1.5);
                  }
                }

                if (intensity <= 0.01) continue;

                const dx = vx - reg.center.x;
                const dy = vy - reg.center.y;
                const dz = vz - reg.center.z;
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                if (dist < reg.radius) {
                  const falloff = 0.5 * (1.0 + Math.cos((Math.PI * dist) / reg.radius));
                  // Boost opacity power curve so red is rich, deep and clearly visible
                  const heat = Math.pow(falloff, 0.65) * intensity * 1.35;
                  if (heat > maxHeat) maxHeat = heat;
                }
              }

              // Calm organic breathing pulse (minimum floor at 0.78 for solid visibility)
              const finalHeat = Math.min(1.0, maxHeat * breathFactor);

              colors[i * 3] = THREE.MathUtils.lerp(baseR, highlightR, finalHeat);
              colors[i * 3 + 1] = THREE.MathUtils.lerp(baseG, highlightG, finalHeat);
              colors[i * 3 + 2] = THREE.MathUtils.lerp(baseB, highlightB, finalHeat);
            }
          } else {
            // Restore neutral clean porcelain
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

  return (
    <group
      ref={groupRef}
      scale={[heightScale, heightScale, heightScale]}
      position={[0, -0.92, 0]}
    >
      <primitive object={clonedScene} />
    </group>
  );
}

useGLTF.preload('/models/body_male.glb');
useGLTF.preload('/models/body_female.glb');

export default function BodyViewer3D({ body3D, zones, className = "h-[460px]", showStats = true }) {
  const morphs = body3D?.morph_weights || {};
  
  const hasExtraFatFromMorphs = (morphs.Heavy || 0) > 0.04 || (morphs.Waist_Wide || 0) > 0.04;
  const hasExtraFatFromZones = zones ? Object.values(zones).some(z => z.is_blinking || z.score >= 35) : false;
  const hasExtraFat = hasExtraFatFromMorphs || hasExtraFatFromZones;

  // Identify top region name for friendly status badge
  let topZoneName = "";
  if (zones) {
    const activeList = Object.values(zones).filter(z => z.is_blinking || z.score >= 35);
    if (activeList.length > 0) {
      activeList.sort((a, b) => b.score - a.score);
      topZoneName = activeList[0].key === 'hips_thighs' ? 'Thighs' : (activeList[0].key === 'visceral_abdomen' ? 'Abdomen' : 'Waist');
    }
  }

  return (
    <div className={`w-full bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl relative flex flex-col ${className}`}>
      {/* Top Clean Non-Overlapping HUD Header */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        {/* Left Badge: Unified Matte Highlight Theme */}
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl backdrop-blur-md shadow-md border transition-all duration-300 ${
          hasExtraFat 
            ? 'bg-rose-950/30 border-rose-900/40 text-rose-200/90' 
            : 'bg-slate-900/90 border-slate-700/80 text-slate-200'
        }`}>
          <span className={`w-2 h-2 rounded-full shrink-0 ${hasExtraFat ? 'bg-rose-400/90 animate-pulse' : 'bg-teal-400/80'}`} />
          <span className="text-[11px] font-semibold tracking-tight">
            {hasExtraFat ? `Focus Area: ${topZoneName || 'Adiposity'}` : "3D Morph Preview"}
          </span>
          <span className={`text-[10px] capitalize pl-1.5 border-l ${hasExtraFat ? 'text-rose-300/70 border-rose-900/40' : 'text-slate-400 border-slate-700'}`}>
            {body3D?.model || 'male'}
          </span>
        </div>

        {/* Right Badge: Rotation Hint */}
        <div className="text-[10px] font-medium text-slate-300 bg-slate-900/90 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-slate-800 shadow-md">
          ↔️ 360° Drag
        </div>
      </div>

      {/* WebGL Canvas with Generous Top Padding */}
      <div className="w-full flex-1 pt-4">
        <Canvas
          camera={{ position: [0, 0.12, 2.85], fov: 40 }}
          gl={{ antialias: true, alpha: true }}
        >
          {/* Soft Studio Lighting */}
          <ambientLight intensity={0.85} />
          <directionalLight position={[3, 5, 4]} intensity={1.45} color="#ffffff" />
          <directionalLight position={[-4, 2, -3]} intensity={0.8} color="#38bdf8" />
          <pointLight position={[0, -1, 2]} intensity={0.6} color="#818cf8" />

          {/* Horizontal-Only Orbit Controls */}
          <OrbitControls
            enablePan={false}
            minDistance={1.6}
            maxDistance={4.2}
            minPolarAngle={Math.PI / 2}
            maxPolarAngle={Math.PI / 2}
            enableDamping={true}
            dampingFactor={0.08}
          />

          {/* Scaled & Morphed Body Mesh with Real-time Surface Heatmap */}
          <MannequinMesh body3D={body3D} zones={zones} />
        </Canvas>
      </div>

      {/* Bottom Live Morph Weights Badge - Refined Matte Palette */}
      {showStats && (
        <div className="bg-slate-900/90 border-t border-slate-800/70 p-2.5 sm:px-3 backdrop-blur-md">
          <div className="grid grid-cols-4 gap-2 text-center">
            {/* Thin */}
            <div className={`py-1.5 px-1 rounded-xl border transition-all duration-300 ${
              (morphs.Thin || 0) > 0.04 
                ? 'bg-slate-800/70 border-slate-700/80' 
                : 'bg-slate-900/50 border-slate-800/60'
            }`}>
              <span className="text-[10px] text-slate-400 font-medium block truncate">Thin</span>
              <span className={`text-xs font-semibold ${
                (morphs.Thin || 0) > 0.04 ? 'text-slate-200' : 'text-slate-500'
              }`}>
                {((morphs.Thin || 0) * 100).toFixed(0)}%
              </span>
            </div>

            {/* Heavy */}
            <div className={`py-1.5 px-1 rounded-xl border transition-all duration-300 ${
              (morphs.Heavy || 0) > 0.04 
                ? 'bg-amber-950/20 border-amber-900/30' 
                : 'bg-slate-900/50 border-slate-800/60'
            }`}>
              <span className="text-[10px] text-slate-400 font-medium block truncate">Heavy</span>
              <span className={`text-xs font-semibold ${
                (morphs.Heavy || 0) > 0.04 ? 'text-amber-200/90' : 'text-slate-500'
              }`}>
                {((morphs.Heavy || 0) * 100).toFixed(0)}%
              </span>
            </div>

            {/* Waist Wide */}
            <div className={`py-1.5 px-1 rounded-xl border transition-all duration-300 ${
              (morphs.Waist_Wide || 0) > 0.04 
                ? 'bg-rose-950/20 border-rose-900/30' 
                : 'bg-slate-900/50 border-slate-800/60'
            }`}>
              <span className="text-[10px] text-slate-400 font-medium block truncate">Waist Wide</span>
              <span className={`text-xs font-semibold ${
                (morphs.Waist_Wide || 0) > 0.04 ? 'text-rose-200/90' : 'text-slate-500'
              }`}>
                {((morphs.Waist_Wide || 0) * 100).toFixed(0)}%
              </span>
            </div>

            {/* Muscular */}
            <div className={`py-1.5 px-1 rounded-xl border transition-all duration-300 ${
              (morphs.Muscular || 0) > 0.04 
                ? 'bg-teal-950/20 border-teal-900/30' 
                : 'bg-slate-900/50 border-slate-800/60'
            }`}>
              <span className="text-[10px] text-slate-400 font-medium block truncate">Muscular</span>
              <span className={`text-xs font-semibold ${
                (morphs.Muscular || 0) > 0.04 ? 'text-teal-200/90' : 'text-slate-500'
              }`}>
                {((morphs.Muscular || 0) * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
