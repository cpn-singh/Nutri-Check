"""
Automated Pipeline in Blender via MCP socket:
1. Clears scene completely.
2. For each sex (Male=1.0, Female=0.0):
   a. Generates neutral MPFB human base mesh (height ~1.70m, standing upright at Z=0, facing +Y).
   b. Deletes helpers and helper vertex groups so only clean body surface mesh remains.
   c. Bakes all internal macro keys into clean base geometry.
   d. Assigns neutral medical/studio matte mannequin material (roughness=0.6, metalness=0.05, tint=#f1f5f9).
   e. Adds 'Basis' shape key.
   f. Generates 4 clean, smooth anatomically proportional shape keys:
      - 'Thin': slimmer limbs, narrower torso and hips
      - 'Heavy': increased overall body volume across torso, hips, arms, thighs
      - 'Waist_Wide': expanded abdominal/midsection circumference only
      - 'Muscular': broader shoulders, fuller chest/arms/legs, defined waist
   g. Takes viewport preview renders for each shape key at 1.0 to ensure zero tearing/distortion.
   h. Resets all shape keys back to 0.0.
   i. Exports clean GLB with Draco mesh compression enabled:
      - body_male.glb
      - body_female.glb
"""

import socket
import json
import os
import sys

def run_blender_script(script_str):
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(180)
    s.connect(('127.0.0.1', 9876))
    payload = {"type": "execute_code", "params": {"code": script_str}}
    s.sendall(json.dumps(payload).encode('utf-8'))
    
    chunks = []
    while True:
        try:
            chunk = s.recv(16384)
            if not chunk:
                break
            chunks.append(chunk)
            combined = b"".join(chunks).decode('utf-8', errors='ignore')
            if combined.endswith('\n') or combined.endswith('}'):
                try:
                    data = json.loads(combined)
                    s.close()
                    return data
                except json.JSONDecodeError:
                    pass
        except socket.timeout:
            break
    s.close()
    return json.loads(b"".join(chunks).decode('utf-8', errors='ignore'))

blender_worker_code = """
import bpy
import math
import mathutils
import sys
import os

export_dir = "C:/Users/cpnsi/OneDrive/Desktop/health_website/frontend/public/models"
preview_dir = "C:/Users/cpnsi/OneDrive/Desktop/health_website"
os.makedirs(export_dir, exist_ok=True)

mod = sys.modules.get('bl_ext.blender_org.mpfb.ui.model._macrosubpanel')

def clear_entire_scene():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()
    for mesh in list(bpy.data.meshes):
        bpy.data.meshes.remove(mesh)
    for mat in list(bpy.data.materials):
        bpy.data.materials.remove(mat)

def setup_studio_lighting_and_cam():
    # Camera
    cam_data = bpy.data.cameras.new("FrontCam")
    cam_obj = bpy.data.objects.new("FrontCam", cam_data)
    bpy.context.scene.collection.objects.link(cam_obj)
    cam_obj.location = (0.0, -3.2, 0.88)
    cam_obj.rotation_euler = (math.radians(90), 0, 0)
    bpy.context.scene.camera = cam_obj

    # Key light
    key_light = bpy.data.lights.new("KeyLight", type='SUN')
    key_light.energy = 2.2
    key_obj = bpy.data.objects.new("KeyLight", key_light)
    bpy.context.scene.collection.objects.link(key_obj)
    key_obj.location = (2.0, -3.0, 3.5)
    key_obj.rotation_euler = (math.radians(45), math.radians(20), math.radians(30))

    # Fill light
    fill_light = bpy.data.lights.new("FillLight", type='SUN')
    fill_light.energy = 1.0
    fill_light.color = (0.85, 0.92, 1.0)
    fill_obj = bpy.data.objects.new("FillLight", fill_light)
    bpy.context.scene.collection.objects.link(fill_obj)
    fill_obj.location = (-2.5, -2.5, 2.0)
    fill_obj.rotation_euler = (math.radians(60), math.radians(-30), math.radians(-40))

def create_matte_material(name):
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    bsdf = nodes.get("Principled BSDF")
    if bsdf:
        # Smooth neutral porcelain mannequin tone
        bsdf.inputs['Base Color'].default_value = (0.91, 0.93, 0.96, 1.0)
        bsdf.inputs['Roughness'].default_value = 0.55
        if 'Metallic' in bsdf.inputs:
            bsdf.inputs['Metallic'].default_value = 0.05
    return mat

def build_mannequin(sex_name, gender_val):
    clear_entire_scene()
    setup_studio_lighting_and_cam()

    print(f"--- Generating {sex_name} Mannequin ---")
    bpy.ops.mpfb.create_human()
    
    # Configure baseline phenotypes
    mod._general_set_target_value('gender', gender_val)
    mod._general_set_target_value('age', 0.5)
    mod._general_set_target_value('muscle', 0.5)
    mod._general_set_target_value('weight', 0.5)
    mod._general_set_target_value('height', 0.5)
    mod._general_set_target_value('proportions', 0.5)
    if gender_val == 0.0:
        mod._general_set_target_value('cupsize', 0.45)
        mod._general_set_target_value('firmness', 0.5)

    # Delete all helper geometry
    bpy.ops.mpfb.delete_helpers()
    
    # Bake internal shape keys into clean static base mesh
    bpy.ops.mpfb.bake_shapekeys()
    
    obj = bpy.data.objects.get("Human")
    obj.name = f"Body_{sex_name}"

    # Align feet exactly to Z = 0
    bpy.context.view_layer.update()
    min_z = min(v.co.z for v in obj.data.vertices)
    for v in obj.data.vertices:
        v.co.z -= min_z
    bpy.context.view_layer.update()

    # Scale precisely to ~1.70m height if needed
    current_height = max(v.co.z for v in obj.data.vertices)
    if current_height > 0:
        scale_fac = 1.70 / current_height
        for v in obj.data.vertices:
            v.co *= scale_fac
    bpy.context.view_layer.update()

    # Assign smooth neutral material
    mat = create_matte_material(f"Matte_{sex_name}")
    obj.data.materials.clear()
    obj.data.materials.append(mat)
    
    # Smooth shading
    for poly in obj.data.polygons:
        poly.use_smooth = True

    # --- ADD BASIS AND 4 SHAPE KEYS ---
    # 1. Basis
    basis = obj.shape_key_add(name="Basis", from_mix=False)
    
    # Cache basis coords
    basis_coords = [mathutils.Vector(v.co) for v in obj.data.vertices]

    # Helper function for smooth gaussian bell falloff
    def smooth_falloff(z, z_center, radius):
        dist = abs(z - z_center)
        if dist >= radius:
            return 0.0
        # Cosine bell
        return 0.5 * (1.0 + math.cos(math.pi * dist / radius))

    # 2. Thin Shape Key (slimmer limbs, narrower torso and hips)
    thin_key = obj.shape_key_add(name="Thin", from_mix=False)
    for i, co in enumerate(basis_coords):
        z = co.z
        x = co.x
        y = co.y
        new_co = mathutils.Vector(co)
        
        # Upper Torso (Z: 0.85 to 1.45)
        if 0.85 <= z <= 1.45:
            f = smooth_falloff(z, 1.15, 0.35)
            new_co.x *= (1.0 - 0.12 * f)
            new_co.y *= (1.0 - 0.14 * f)
        # Abdomen / Waist (Z: 0.65 to 1.1)
        elif 0.65 <= z <= 1.1:
            f = smooth_falloff(z, 0.88, 0.25)
            new_co.x *= (1.0 - 0.15 * f)
            new_co.y *= (1.0 - 0.18 * f)
        # Hips & Thighs (Z: 0.35 to 0.95)
        elif 0.35 <= z <= 0.95:
            f = smooth_falloff(z, 0.65, 0.35)
            new_co.x *= (1.0 - 0.10 * f)
            new_co.y *= (1.0 - 0.12 * f)
        # Limbs (arms / legs away from center axis)
        if abs(x) > 0.15:
            new_co.x *= 0.93
            new_co.y *= 0.93

        thin_key.data[i].co = new_co

    # 3. Heavy Shape Key (increased overall volume across torso, hips, arms, thighs)
    heavy_key = obj.shape_key_add(name="Heavy", from_mix=False)
    for i, co in enumerate(basis_coords):
        z = co.z
        x = co.x
        y = co.y
        new_co = mathutils.Vector(co)
        
        # Abdomen & Flanks (significant expansion)
        if 0.60 <= z <= 1.25:
            f = smooth_falloff(z, 0.92, 0.35)
            new_co.x *= (1.0 + 0.26 * f)
            new_co.y += (0.09 * f) if y > 0 else (0.04 * f)
        # Chest / Upper Torso
        if 0.95 <= z <= 1.45:
            f = smooth_falloff(z, 1.2, 0.3)
            new_co.x *= (1.0 + 0.15 * f)
            new_co.y *= (1.0 + 0.16 * f)
        # Hips & Glutes & Thighs
        if 0.35 <= z <= 0.95:
            f = smooth_falloff(z, 0.68, 0.35)
            new_co.x *= (1.0 + 0.20 * f)
            new_co.y += (0.06 * f) if y < 0 else (0.07 * f)
        # Limbs thickness (arms & calves)
        if abs(x) > 0.18 and 0.8 <= z <= 1.4: # Arms
            new_co.x *= 1.14
            new_co.y *= 1.14
        if abs(x) > 0.08 and 0.1 <= z <= 0.65: # Legs
            new_co.x *= 1.12
            new_co.y *= 1.12

        heavy_key.data[i].co = new_co

    # 4. Waist_Wide Shape Key (expanded abdominal/midsection circumference only)
    waist_key = obj.shape_key_add(name="Waist_Wide", from_mix=False)
    for i, co in enumerate(basis_coords):
        z = co.z
        y = co.y
        new_co = mathutils.Vector(co)
        
        # Isolated waist/belly ring (Z: 0.70 to 1.15)
        if 0.70 <= z <= 1.15:
            f = smooth_falloff(z, 0.92, 0.25)
            # Expand outwards in X and specifically forward in Y (+Y belly protrusion)
            new_co.x *= (1.0 + 0.28 * f)
            if y > 0:
                new_co.y += (0.12 * f)
            else:
                new_co.y -= (0.04 * f)

        waist_key.data[i].co = new_co

    # 5. Muscular Shape Key (broader shoulders, fuller chest/arms/legs, defined waist)
    muscular_key = obj.shape_key_add(name="Muscular", from_mix=False)
    for i, co in enumerate(basis_coords):
        z = co.z
        x = co.x
        y = co.y
        new_co = mathutils.Vector(co)
        
        # Shoulders & Deltoids (Z: 1.25 to 1.55)
        if 1.25 <= z <= 1.55 and abs(x) > 0.12:
            f = smooth_falloff(z, 1.40, 0.20)
            new_co.x *= (1.0 + 0.16 * f)
            new_co.y *= (1.0 + 0.14 * f)
        # Pectorals / Chest (Z: 1.05 to 1.38, frontal)
        if 1.05 <= z <= 1.38:
            f = smooth_falloff(z, 1.22, 0.20)
            if y > 0:
                new_co.y += (0.06 * f)
            new_co.x *= (1.0 + 0.08 * f)
        # Tight / Tapered Waist (Z: 0.75 to 1.05) - V-taper
        if 0.75 <= z <= 1.05:
            f = smooth_falloff(z, 0.90, 0.18)
            new_co.x *= (1.0 - 0.06 * f)
            new_co.y *= (1.0 - 0.05 * f)
        # Biceps & Forearms
        if abs(x) > 0.20 and 0.85 <= z <= 1.40:
            new_co.x *= 1.18
            new_co.y *= 1.18
        # Quads & Calves definition
        if 0.20 <= z <= 0.70 and abs(x) > 0.08:
            f = smooth_falloff(z, 0.45, 0.25)
            new_co.x *= (1.0 + 0.12 * f)
            new_co.y *= (1.0 + 0.12 * f)

        muscular_key.data[i].co = new_co

    # --- VIEWPORT PREVIEWS INSPECTION ---
    bpy.context.scene.render.resolution_x = 600
    bpy.context.scene.render.resolution_y = 900
    bpy.context.scene.render.image_settings.file_format = 'PNG'

    keys_to_test = ["Basis", "Thin", "Heavy", "Waist_Wide", "Muscular"]
    for k_name in keys_to_test:
        # Reset all keys to 0
        for k in obj.data.shape_keys.key_blocks:
            k.value = 0.0
        
        if k_name != "Basis":
            obj.data.shape_keys.key_blocks[k_name].value = 1.0

        bpy.context.view_layer.update()
        img_path = f"{preview_dir}/preview_{sex_name.lower()}_{k_name.lower()}.png"
        bpy.context.scene.render.filepath = img_path
        bpy.ops.render.render(write_still=True)
        print(f"Rendered preview: {img_path}")

    # Reset all shape keys back to 0.0 before export
    for k in obj.data.shape_keys.key_blocks:
        k.value = 0.0
    bpy.context.view_layer.update()

    # --- EXPORT TO GLB WITH SHAPE KEYS & DRACO ---
    out_glb = f"{export_dir}/body_{sex_name.lower()}.glb"
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj

    bpy.ops.export_scene.gltf(
        filepath=out_glb,
        export_format='GLB',
        use_selection=True,
        export_apply=False, # keep shape keys intact!
        export_morph=True,  # shape keys included!
        export_morph_normal=True,
        export_draco_mesh_compression_enable=True,
        export_draco_mesh_compression_level=7,
        export_materials='EXPORT'
    )
    print(f"Exported clean compressed GLB to: {out_glb}")

# Run both Male and Female
build_mannequin("Male", 1.0)
build_mannequin("Female", 0.0)
print("ALL MANNEQUIN CREATION AND EXPORT FINISHED SUCCESSFULLY!")
"""

if __name__ == "__main__":
    print("Sending generation pipeline to Blender...")
    res = run_blender_script(blender_worker_code)
    print("Blender Response:", res)
