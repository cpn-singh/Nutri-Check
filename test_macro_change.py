from check_mpfb import execute_blender_code

code = """
import bpy

scene = bpy.context.scene
print("Initial gender:", scene.mpfb_macropanel_gender)
scene.mpfb_macropanel_gender = 1.0  # 1.0 = Male, 0.0 = Female
print("Changed gender to 1.0:", scene.mpfb_macropanel_gender)

# Check if object has updated or if an update function needs to run
import sys
for mod_name, mod in sys.modules.items():
    if 'mpfb' in mod_name and 'macro' in mod_name:
        print("Found macro module:", mod_name)
"""

res = execute_blender_code(code)
print(res['result']['result'])
