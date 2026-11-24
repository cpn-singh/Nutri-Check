from check_mpfb import execute_blender_code

code = """
import bpy

# Test deleting helpers
ret = bpy.ops.mpfb.delete_helpers()
print("delete_helpers ret:", ret)

obj = bpy.data.objects.get("Human")
print("Vertex count after delete_helpers:", len(obj.data.vertices))
print("Polygon count after delete_helpers:", len(obj.data.polygons))

min_z = min(v.co.z for v in obj.data.vertices)
max_z = max(v.co.z for v in obj.data.vertices)
print(f"New Z bounds: min={min_z:.4f}, max={max_z:.4f}, height={max_z - min_z:.4f}")

# Check existing shape keys if any
if obj.data.shape_keys:
    print("Shape key blocks:", [b.name for b in obj.data.shape_keys.key_blocks])
"""

res = execute_blender_code(code)
print(res['result']['result'])
