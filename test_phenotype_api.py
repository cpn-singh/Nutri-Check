from check_mpfb import execute_blender_code

code = """
import bpy

# Inspect MPFB panel properties on scene or object
print("Scene properties:", [k for k in bpy.context.scene.keys() if 'mpfb' in k.lower()])
for k in dir(bpy.context.scene):
    if 'mpfb' in k.lower():
        print(f"scene.{k} = {getattr(bpy.context.scene, k)}")

# Check MPFB operators for setting phenotypes
target_ops = [attr for attr in dir(bpy.ops.mpfb) if 'target' in attr or 'preset' in attr or 'pheno' in attr or 'human' in attr]
print("Relevant ops:", target_ops)
"""

res = execute_blender_code(code)
print(res['result']['result'])
