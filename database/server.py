from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import unquote
from datetime import timedelta
from database import DATABASE
import json, hashlib, time

class Server(BaseHTTPRequestHandler):
    def _set_headers(self, code = 204):
        self.send_response(code)
        self.send_header("Content-type", "application/json")
        self.send_header('Access-Control-Allow-Origin', '*')                
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, DELETE')
        self.send_header("Access-Control-Allow-Headers", "X-Requested-With") 
        self.end_headers()
    
    def do_HEAD(self):
        self._set_headers()
    
    def _send_response(self, data):
        content = json.dumps(data)
        self.wfile.write(content.encode("utf-8"))

    def get_path(self):
        texto = unquote(self.path)
        try:
            path, query = texto.split("?", 1)
            
            values = query.split("&")
            dic = {}
            for value in values:
                key, value = value.split("=", 1)
                dic[key] = value
        except: path, dic = self.path, {}
        return path, dic

    def get_request_data(self):
        content_length = int(self.headers['Content-Length'])
        data = json.loads(
            self.rfile.read(content_length
        ).decode("utf-8"))
        return data

    def do_GET(self):
        '''
        Routes to GET method
        '''
        self._set_headers(200)
        path, query = self.get_path()
        email = query.get('email')
        if path == "/login":
            self.login(email, query['password'])
        elif path == "/bots":
            self._send_response(DATABASE.get_bots())
        elif path == "/sellers" and DATABASE.is_admin(email):
            self._send_response(DATABASE.get_sellers())
        elif path == "/clients":
            self.search_clients(email, query["bot"])
        else:
            self.not_found() 

    def do_POST(self):
        '''
        Routes to POST method
        '''
        self._set_headers(200)
        post_data = self.get_request_data()
        if self.path == '/login':
            self.login(post_data['email'], post_data['password'])
        elif self.path == "/sellers":
            self.add_seller(post_data)
        elif self.path == "/clients":
            self.add_client(post_data)
        elif self.path == "/licenses":
            self.give_license(post_data)

    def do_DELETE(self):
        self._set_headers(200)
        delete_data = self.get_request_data()
        if self.path == "/clients":
            email = delete_data["email"]
            if DATABASE.get_clients(email):
                DATABASE.delete_client(email)
        elif self.path == "/sellers":
            email = delete_data["email"]
            if DATABASE.get_sellers(email):
                DATABASE.delete_seller(email)

    def login(self, email, password):
        password = hashlib.md5(
            password.encode("utf-8")
        ).hexdigest()

        conta = DATABASE.get_sellers(email)
        result = {}
        if conta:
            secret = conta.get('password')
            if not secret:
                conta['password'] = password
                DATABASE.save_seller(email, conta)
            conta['email'] = email
            del conta['password']
            result = conta
        
        self._send_response(result)

    def add_seller(self, data = None):
        if data and DATABASE.is_admin(data["admin"]):
            email = data.pop('email')
            data['type'] = "seller"
            data['licenses'] = int(data['licenses'])
            data['tests'] = int(data['licenses']) * 2
            data['show'] = data['show']
            DATABASE.save_seller(email, data)
        self._send_response(data)

    def add_client(self, data):
        email = data["client"]
        data = {
            "seller": data["seller"],
            "licenses": {
                data["bot"]: 0
            }
        }
        DATABASE.save_client(email, data)
        self._send_response(data)

    def search_clients(self, email, bot):
        client_list = DATABASE.get_clients()
        clients = {}
        for name, info in client_list.items():
            if info["seller"] == email and bot in info["licenses"]:
                info['licenses'][bot] = timedelta(
                    seconds = info['licenses'][bot] - time.time()
                ).days
                clients[name] = info
            elif name == email and bot in info["licenses"]:
                clients[name] = {
                    "timestamp": info['licenses'][bot]
                }
        self._send_response(clients)

    def give_license(self, data):
        seller = DATABASE.get_sellers(data["seller"])
        bot = data["bot"]
        if bot not in seller["botlist"]:
            self._set_headers(401)
            time_days = 0
        else:
            now = time.time()
            if data["free"] and seller["tests"] > 0:
                client = { "licenses": { 
                    bot: now + 86400 * 3
                }}
                seller["tests"] -= 1
            elif seller["licenses"] > 0:
                client = { "licenses": { 
                    bot: now + 86400 * 31
                }}
                seller["licenses"] -= 1
            else: client = {}
            if client:
                DATABASE.save_seller(data["seller"], seller)
                DATABASE.save_client(data["client"], client)
                timestamp = client['licenses'][data['bot']]
            else:
                timestamp = now
            time_days = timedelta(
                seconds = timestamp - now
            ).days
        self._send_response({
            "licenses": seller["licenses"],
            "tests": seller["tests"], 
            "time": time_days
        })

    def not_found(self):
        self._set_headers(404)
        self._send_response({
            "error": "Not Found page"
        })

    def do_OPTIONS(self):           
        self._set_headers(201)

def run(server_class=HTTPServer, handler_class=Server, 
    addr="localhost", port=8000):
    server_address = (addr, port)
    httpd = server_class(server_address, handler_class)

    print(f"Starting httpd server on {addr}:{port}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    httpd.server_close()

if __name__ == "__main__":
    run(addr='0.0.0.0', port=8000)