from check_mpfb import execute_blender_code

code = """
import bpy

obj = bpy.data.objects.get("Human")
print("Human properties:", [k for k in obj.keys() if not k.startswith('_')])
print("Human vertex count:", len(obj.data.vertices))
print("Human polygon count:", len(obj.data.polygons))
print("Human vertex groups:", [g.name for g in obj.vertex_groups])
print("Shape keys:", obj.data.shape_keys)

# Check bounding box in Z
min_z = min(v.co.z for v in obj.data.vertices)
max_z = max(v.co.z for v in obj.data.vertices)
print(f"Z range: min={min_z:.4f}, max={max_z:.4f}, height={max_z - min_z:.4f}")

# Check materials
print("Materials:", [m.name for m in obj.data.materials if m])
"""

res = execute_blender_code(code)
print(res['result']['result'])
