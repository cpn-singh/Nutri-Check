from check_mpfb import execute_blender_code

code = """
import bpy

o = bpy.data.objects.get("Body_Female") or bpy.data.objects.get("Body_Male")
# find vertices in waist region Z between 0.8 and 1.1
waist_verts = [v for v in o.data.vertices if 0.8 <= v.co.z <= 1.1]
min_y = min(v.co.y for v in waist_verts)
max_y = max(v.co.y for v in waist_verts)
avg_y = sum(v.co.y for v in waist_verts) / len(waist_verts)
print(f"Waist verts Y range: min={min_y:.4f}, max={max_y:.4f}, avg={avg_y:.4f}")

# Belly frontmost vertex (facing camera / front of body)
frontmost = max(waist_verts, key=lambda v: v.co.y)
print(f"Frontmost waist vertex (Belly): X={frontmost.co.x:.4f}, Y={frontmost.co.y:.4f}, Z={frontmost.co.z:.4f}")
"""

res = execute_blender_code(code)
print(res['result']['result'])
