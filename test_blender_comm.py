import socket
import json

def send_blender_command(command_type, params=None):
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.connect(('127.0.0.1', 9876))
    payload = {"type": command_type, "params": params or {}}
    msg = json.dumps(payload)
    # The protocol sends 4-byte length prefix or newline? Let's check how it reads
    s.sendall(msg.encode('utf-8'))
    # Wait for response
    data = b""
    while True:
        chunk = s.recv(4096)
        if not chunk:
            break
        data += chunk
        if b"\n" in chunk or len(chunk) < 4096:
            break
    s.close()
    return data.decode('utf-8')

if __name__ == "__main__":
    try:
        res = send_blender_command("get_scene_info")
        print("Success:", res)
    except Exception as e:
        print("Exception:", e)
