from check_mpfb import execute_blender_code

code = """
import bpy

for o in bpy.data.objects:
    if o.type == 'MESH':
        print("Mesh object:", o.name)
        min_x = min(v.co.x for v in o.data.vertices)
        max_x = max(v.co.x for v in o.data.vertices)
        min_y = min(v.co.y for v in o.data.vertices)
        max_y = max(v.co.y for v in o.data.vertices)
        min_z = min(v.co.z for v in o.data.vertices)
        max_z = max(v.co.z for v in o.data.vertices)
        print(f"X: [{min_x:.3f}, {max_x:.3f}]")
        print(f"Y: [{min_y:.3f}, {max_y:.3f}]")
        print(f"Z: [{min_z:.3f}, {max_z:.3f}]")
"""

res = execute_blender_code(code)
print(res['result']['result'])
