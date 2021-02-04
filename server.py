from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import unquote
from datetime import timedelta
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
    
    def _json(self, data):
        content = json.dumps(data)
        return content.encode("utf-8")
    
    def get_sellers(self, email = None):
        with open("database.json", encoding='utf-8') as file:
            dic = json.load(file)['sellers']
        return dic if email is None else dic.get(email)
    
    def get_clients(self, email = None):
        with open("database.json", encoding='utf-8') as file:
            dic = json.load(file)['clients']
        return dic if email is None else dic.get(email)

    def get_bots(self):
        with open("database.json", encoding='utf-8') as file:
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

    def save_client(self, email, data):
        with open("database.json", encoding='utf-8') as file:
            dic = json.load(file)
        
        if dic['clients'].get(email): 
            dic['clients'][email]["licenses"].update(
                data["licenses"])
        else: 
            dic['clients'][email] = data
        
        with open("database.json", 'w', 
            encoding='utf-8') as file:
            json.dump(dic, file, indent = 2)

    def delete_seller(self, email):
        with open("database.json", encoding='utf-8') as file:
            dic = json.load(file)
        del dic['sellers'][email]
        with open("database.json", 'w', encoding='utf-8') as file:
            json.dump(dic, file, indent = 2)

    def delete_client(self, email):
        with open("database.json", encoding='utf-8') as file:
            dic = json.load(file)
        del dic['clients'][email]
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
        elif self.path == "/licenses":
            self.give_license(post_data)

    def do_DELETE(self):
        self._set_headers(200)
        content_length = int(self.headers['Content-Length'])
        delete_data = json.loads(
            self.rfile.read(content_length
        ).decode("utf-8"))
        if self.path == "/clients":
            email = delete_data["email"]
            if self.get_clients(email):
                self.delete_client(email)
        elif self.path == "/sellers":
            email = delete_data["email"]
            if self.get_sellers(email):
                self.delete_seller(email)

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
            data['tests'] = int(data['licenses']) * 2
            data['show'] = data['show']
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
        self.save_client(email, data)
        self.wfile.write(self._json(data))

    def search_clients(self, email, bot):
        client_list = self.get_clients()
        clients = {}
        for name, info in client_list.items():
            if info["seller"] == email and bot in info["licenses"]:
                info['licenses'][bot] = timedelta(
                    seconds = info['licenses'][bot] - time.time()
                ).days
                clients[name] = info
        self.wfile.write(self._json(clients))

    def give_license(self, data):
        seller = self.get_sellers(data["seller"])
        if data["free"] and seller["tests"] > 0:
            client = { "licenses": { 
                data["bot"]: time.time() + 86400 * 3
            }}
            seller["tests"] -= 1
        elif seller["licenses"] > 0:
            client = { "licenses": { 
                data["bot"]: time.time() + 86400 * 31
            }}
            seller["licenses"] -= 1
        else: client = {}
        if client:
            self.save_seller(data['seller'], seller)
            self.save_client(data["client"], client)
            timestamp = client['licenses'][data['bot']]
        else:
            timestamp = time.time()
        self.wfile.write(self._json({
            "licenses": seller["licenses"],
            "tests": seller["tests"], 
            "time": timedelta(
                seconds = timestamp - time.time()
            ).days
        }))

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