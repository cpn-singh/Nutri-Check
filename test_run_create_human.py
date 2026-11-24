from check_mpfb import execute_blender_code

code = """
import bpy

# 1. Clear default scene
for obj in list(bpy.data.objects):
    bpy.data.objects.remove(obj, do_unlink=True)
for col in list(bpy.data.collections):
    bpy.data.collections.remove(col)

print("Scene objects before:", len(bpy.data.objects))
ret = bpy.ops.mpfb.create_human()
print("create_human ret:", ret)
print("Scene objects after:", [o.name for o in bpy.data.objects])
for o in bpy.data.objects:
    print(f"Object: {o.name}, type: {o.type}, dim: {o.dimensions}, loc: {o.location}")
"""

res = execute_blender_code(code)
print(res['result']['result'])
