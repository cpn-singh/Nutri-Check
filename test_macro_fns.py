from check_mpfb import execute_blender_code

code = """
import sys
mod = sys.modules['bl_ext.blender_org.mpfb.ui.model._macrosubpanel']
print("Macro functions in _macrosubpanel:", [attr for attr in dir(mod) if not attr.startswith('__')])
import inspect
for name in dir(mod):
    val = getattr(mod, name)
    if inspect.isfunction(val):
        print("Function:", name, inspect.signature(val))
"""

res = execute_blender_code(code)
print(res['result']['result'])
