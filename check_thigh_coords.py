from check_mpfb import execute_blender_code

code = """
import bpy

o = bpy.data.objects.get("Body_Female") or bpy.data.objects.get("Body_Male")

# Thighs: Z between 0.45 and 0.75, left (X < -0.06) and right (X > 0.06)
l_thigh = [v for v in o.data.vertices if 0.45 <= v.co.z <= 0.75 and v.co.x < -0.05]
r_thigh = [v for v in o.data.vertices if 0.45 <= v.co.z <= 0.75 and v.co.x > 0.05]

print("Left Thigh verts:", len(l_thigh))
print("Left Thigh center:", (sum(v.co.x for v in l_thigh)/len(l_thigh), sum(v.co.y for v in l_thigh)/len(l_thigh), sum(v.co.z for v in l_thigh)/len(l_thigh)))

print("Right Thigh verts:", len(r_thigh))
print("Right Thigh center:", (sum(v.co.x for v in r_thigh)/len(r_thigh), sum(v.co.y for v in r_thigh)/len(r_thigh), sum(v.co.z for v in r_thigh)/len(r_thigh)))
"""

res = execute_blender_code(code)
print(res['result']['result'])
