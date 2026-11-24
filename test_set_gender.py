from check_mpfb import execute_blender_code

code = """
import sys
mod = sys.modules['bl_ext.blender_org.mpfb.ui.model._macrosubpanel']
print("Targets in _MACROTARGETS:", mod._MACROTARGETS)
print("Testing setting gender to male (1.0)...")
mod._general_set_target_value('gender', 1.0)
print("Done set_target_value gender 1.0")
"""

res = execute_blender_code(code)
print(res['result']['result'])
