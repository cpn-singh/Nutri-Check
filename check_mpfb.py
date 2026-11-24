import socket
import json
import sys

def execute_blender_code(code: str):
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(60)
    s.connect(('127.0.0.1', 9876))
    payload = {"type": "execute_code", "params": {"code": code}}
    s.sendall(json.dumps(payload).encode('utf-8'))
    
    # Read response
    chunks = []
    while True:
        try:
            chunk = s.recv(8192)
            if not chunk:
                break
            chunks.append(chunk)
            # Try to decode and check if complete JSON
            combined = b"".join(chunks).decode('utf-8', errors='ignore')
            if combined.endswith('\n') or combined.endswith('}'):
                try:
                    data = json.loads(combined)
                    s.close()
                    return data
                except json.JSONDecodeError:
                    pass
        except socket.timeout:
            break
    s.close()
    return json.loads(b"".join(chunks).decode('utf-8', errors='ignore'))

check_code = """
import bpy
import addon_utils

installed = [mod.bl_info.get('name', mod.__name__) for mod in addon_utils.modules()]
mpfb_modules = [m for m in installed if 'mpfb' in m.lower() or 'makehuman' in m.lower()]
print("MPFB matches:", mpfb_modules)

# Check user extensions/addons enabled
enabled = [a for a in bpy.context.preferences.addons.keys()]
print("Enabled addons with mpfb:", [a for a in enabled if 'mpfb' in a.lower()])
"""

if __name__ == "__main__":
    res = execute_blender_code(check_code)
    print("Execution Result:", res)
