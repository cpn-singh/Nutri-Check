from check_mpfb import execute_blender_code

code = """
import bpy

# Set up clean camera facing +Y
cam_data = bpy.data.cameras.new("InspectorCam")
cam_obj = bpy.data.objects.new("InspectorCam", cam_data)
bpy.context.scene.collection.objects.link(cam_obj)
cam_obj.location = (0.0, -3.2, 0.9)
cam_obj.rotation_euler = (1.5708, 0, 0) # 90 deg looking along +Y
bpy.context.scene.camera = cam_obj

# Set up studio lighting
light_data = bpy.data.lights.new("InspectorSun", type='SUN')
light_data.energy = 2.5
light_obj = bpy.data.objects.new("InspectorSun", light_data)
bpy.context.scene.collection.objects.link(light_obj)
light_obj.location = (2.0, -2.0, 3.0)
light_obj.rotation_euler = (0.785, 0.35, 0.5)

# Render settings
bpy.context.scene.render.resolution_x = 768
bpy.context.scene.render.resolution_y = 1024
bpy.context.scene.render.image_settings.file_format = 'PNG'
bpy.context.scene.render.filepath = "C:/Users/cpnsi/OneDrive/Desktop/health_website/preview_test.png"
bpy.ops.render.render(write_still=True)
print("Preview rendered successfully!")
"""

res = execute_blender_code(code)
print(res['result']['result'])
