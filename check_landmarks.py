from check_mpfb import execute_blender_code

code = """
import bpy

o = bpy.data.objects.get("Body_Female") or bpy.data.objects.get("Body_Male")

# 1. Belly / Abdomen (Z: 0.82 to 1.05, front Y)
belly = [v for v in o.data.vertices if 0.82 <= v.co.z <= 1.02 and v.co.y > -0.15]
print("Belly center:", (sum(v.co.x for v in belly)/len(belly), sum(v.co.y for v in belly)/len(belly), sum(v.co.z for v in belly)/len(belly)))

# 2. Chest (Z: 1.15 to 1.35, front Y)
chest = [v for v in o.data.vertices if 1.15 <= v.co.z <= 1.35 and v.co.y > -0.15]
print("Chest center:", (sum(v.co.x for v in chest)/len(chest), sum(v.co.y for v in chest)/len(chest), sum(v.co.z for v in chest)/len(chest)))

# 3. Flanks (Z: 0.85 to 1.05, sides abs(X) > 0.14)
flanks = [v for v in o.data.vertices if 0.85 <= v.co.z <= 1.05 and abs(v.co.x) > 0.14]
print("Flanks Y center:", sum(v.co.y for v in flanks)/len(flanks))

# 4. Hips / Glutes (Z: 0.65 to 0.85)
hips = [v for v in o.data.vertices if 0.65 <= v.co.z <= 0.85]
print("Hips center:", (sum(v.co.x for v in hips)/len(hips), sum(v.co.y for v in hips)/len(hips), sum(v.co.z for v in hips)/len(hips)))
"""

res = execute_blender_code(code)
print(res['result']['result'])
