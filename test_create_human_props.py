from check_mpfb import execute_blender_code

code = """
import bpy
op = bpy.ops.mpfb.create_human
props = op.get_rna_type().properties
print("create_human props:", [p.identifier for p in props if not p.identifier.startswith('rna_')])
"""

res = execute_blender_code(code)
print(res['result']['result'])
