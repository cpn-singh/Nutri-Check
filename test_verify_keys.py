from check_mpfb import execute_blender_code

code = """
import bpy
for mesh in bpy.data.meshes:
    print(f"Mesh: {mesh.name}, Shape keys: {[k.name for k in mesh.shape_keys.key_blocks] if mesh.shape_keys else 'None'}")
"""

res = execute_blender_code(code)
print(res['result']['result'])
