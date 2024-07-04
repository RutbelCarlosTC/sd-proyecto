import os
import subprocess
import random
import socket

def get_random_port(min=49152, max=65535):
    return random.randint(min, max)

def get_ip_address():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # Doesn't even have to be reachable
        s.connect(('10.254.254.254', 1))
        IP = s.getsockname()[0]
    except Exception:
        IP = '127.0.0.1'
    finally:
        s.close()
    return IP

def start_server(port):
    subprocess.Popen(['node', 'server.js', str(port)])

def start_client(server_ip, port):
    print(f"Conectate a http://{server_ip}:{port} en tu navegador")

if __name__ == "__main__":
    role = input("Ingresa 'host' para iniciar server o 'client' para unirme: ").strip().lower()

    if role == 'host':
        port = get_random_port()
        ip_address = get_ip_address()
        start_server(port)
        print("Ingrese a su navegador...")
        print(f"Su sala es: http://localhost:{port}")
        print("Para tus colaboradores: ")
        print(f"IP de la sala: {ip_address}")
        print(f"HOST de la sala: {port}")
        print(f"Dirección completa http://{ip_address}:{port}")
    elif role == 'client':
        server_ip = input("Ingrese IP de la sala: ").strip()
        port = input("Ingrese HOST de la sala: ").strip()
        start_client(server_ip, port)
    else:
        print("Invalid input. Please enter 'host' or 'client'.")

