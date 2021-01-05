from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import unquote
import json, hashlib, threading

class Server(BaseHTTPRequestHandler):
    def _set_headers(self, code = 204):
        self.send_response(code)
        self.send_header("Content-type", "application/json")
        self.send_header('Access-Control-Allow-Origin', '*')                
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header("Access-Control-Allow-Headers", "X-Requested-With") 
        self.end_headers()
    
    def do_HEAD(self):
        self._set_headers()
    
    def _json(self, data):
        """This just generates an HTML document that includes `message`
        in the body. Override, or re-write this do do more interesting stuff.
        """
        content = json.dumps(data)
        return content.encode("utf-8")
    
    def get_sellers(self, email = None):
        with open("database.json") as file:
            dic = json.load(file)['sellers']
        return dic if email is None else dic.get(email)
    
    def get_clients(self, email = None):
        with open("database.json") as file:
            dic = json.load(file)['clients']
        return dic if email is None else dic.get(email)

    def get_bots(self):
        with open("database.json") as file:
            botlist = json.load(file)['bots']
        return botlist

    def save_seller(self, email, user):
        with open("database.json", encoding='utf-8') as file:
            dic = json.load(file)
        
        if dic['sellers'].get(email): 
            dic['sellers'][email].update(user)
        else: 
            dic['sellers'][email] = user
        
        with open("database.json", 'w', encoding='utf-8') as file:
            json.dump(dic, file, indent = 2)

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

    def do_GET(self):
        '''
        Routes to GET method
        '''
        self._set_headers(200)
        path, query = self.get_path()
        if path == "/login":
            self.login(query['email'], query['password'])
        elif path == "/bots":
            self.wfile.write(self._json(self.get_bots()))
        elif path == "/sellers":
            self.sellers()
        elif path == "/clients":
            self.search_clients(
                query["email"], query["bot"])
        else:
            self.not_found() 

    def do_POST(self):
        '''
        Routes to POST method
        '''
        self._set_headers(200)
        content_length = int(self.headers['Content-Length'])
        post_data = json.loads(
            self.rfile.read(content_length
        ).decode("utf-8"))
        if self.path == '/login':
            self.login(post_data['email'], post_data['password'])
        elif self.path == "/sellers":
            self.sellers(post_data)
        elif self.path == "/clients":
            self.add_client(post_data)

    def login(self, email, password):
        password = hashlib.md5(
            password.encode("utf-8")
        ).hexdigest()
        
        conta = self.get_sellers(email)
        result = {}
        if conta:
            secret = conta.get('password')
            if not secret:
                conta['password'] = password
                self.save_seller(email, conta)
            conta['email'] = email
            del conta['password']
            result = conta

        self.wfile.write(self._json(result))
    
    def sellers(self, data = None):
        if data:
            email = data.pop('email')
            data['type'] = "seller"
            data['licenses'] = int(data['licenses'])
            self.save_seller(email, data)
        else:
            data = self.get_sellers()
        self.wfile.write(self._json(data))

    def add_client(self, data):
        email = data["client"]
        data = {
            "seller": data["seller"],
            "licenses": {
                data["bot"]: 0
            }
        }
        self.wfile.write(self._json(bots))

    def search_clients(self, email, bot):
        clients = self.get_clients()
        bots = {}
        for name, info in clients.items():
            if info["seller"] == email and bot in info["licenses"]:
                bots[name] = info
        self.wfile.write(self._json(bots))

    def not_found(self):
        self._set_headers(404)
        self.wfile.write(self._json({
            "error": "Not Found page"
        }))

    def do_OPTIONS(self):           
        self._set_headers(201)

def run(server_class=HTTPServer, handler_class=Server, addr="localhost", port=8000):
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