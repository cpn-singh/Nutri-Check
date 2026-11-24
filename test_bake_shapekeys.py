from check_mpfb import execute_blender_code

code = """
import bpy
import sys
mod = sys.modules['bl_ext.blender_org.mpfb.ui.model._macrosubpanel']

obj = bpy.data.objects.get("Human")
print("Obj shape keys before:", [k.name for k in obj.data.shape_keys.key_blocks] if obj.data.shape_keys else None)
mod._general_set_target_value('gender', 1.0)
mod._general_set_target_value('age', 0.5)
mod._general_set_target_value('muscle', 0.5)
mod._general_set_target_value('weight', 0.5)
print("Updated successfully!")

# Let's check bake_shapekeys
print("bake_shapekeys op:", bpy.ops.mpfb.bake_shapekeys)
ret = bpy.ops.mpfb.bake_shapekeys()
print("bake_shapekeys result:", ret)
print("Obj shape keys after bake:", [k.name for k in obj.data.shape_keys.key_blocks] if obj.data.shape_keys else None)
"""

res = execute_blender_code(code)
print(res['result']['result'])
