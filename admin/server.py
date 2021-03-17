from http.server import HTTPServer, SimpleHTTPRequestHandler

def run(server_class=HTTPServer, addr="localhost", port=8000):
    server_address = (addr, port)
    httpd = server_class(server_address, SimpleHTTPRequestHandler)

    print(f"Starting httpd server on {addr}:{port}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    httpd.server_close()

if __name__ == "__main__":
    run(addr='0.0.0.0', port=80)