from check_mpfb import execute_blender_code

code = """
import bpy
mpfb_ops = [attr for attr in dir(bpy.ops) if 'mpfb' in attr.lower()]
print("MPFB ops groups:", mpfb_ops)
for grp in mpfb_ops:
    op_obj = getattr(bpy.ops, grp)
    print(grp, [o for o in dir(op_obj) if not o.startswith('_')])
"""

res = execute_blender_code(code)
print(res['result']['result'])
