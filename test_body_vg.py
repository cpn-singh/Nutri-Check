from check_mpfb import execute_blender_code

code = """
import bpy

obj = bpy.data.objects.get("Human")
vg_names = [vg.name for vg in obj.vertex_groups]
print("Body group exists:", 'body' in vg_names)

# In MPFB, vertices in 'body' vertex group belong to the actual human skin
body_vg = obj.vertex_groups.get('body')
body_indices = set()
for v in obj.data.vertices:
    for g in v.groups:
        if g.group == body_vg.index and g.weight > 0.5:
            body_indices.add(v.index)

print(f"Total vertices: {len(obj.data.vertices)}, Body skin vertices: {len(body_indices)}")
"""

res = execute_blender_code(code)
print(res['result']['result'])
