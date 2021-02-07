import json

class Database:
    def __init__(self, filepath: str) -> None:
        self.filepath = filepath
    
    # Getters 
    def get_database(self) -> dict:
        with open(self.filepath, encoding='utf-8') as file:
            database = json.load(file)
        return database

    def get_sellers(self, email:str = "") -> list:
        sellers = self.get_database()['sellers']
        return sellers if email == "" else sellers.get(email)
    
    def get_clients(self, email:str = "") -> list:
        clients = self.get_database()['clients']
        return clients if email == "" else clients.get(email)

    def get_bots(self) -> dict:
        return self.get_database()["bots"]

    # Setters
    def save_database(self, database: dict) -> None:
        with open(self.filepath, 'w', encoding='utf-8') as file:
            json.dump(database, file, indent = 2)

    def save_seller(self, email:str, user:str):
        database = self.get_database()
        
        if database['sellers'].get(email): 
            database['sellers'][email].update(user)
        else: 
            database['sellers'][email] = user
        
        self.save_database(database)

    def save_client(self, email, data):
        database = self.get_database()
        
        if database['clients'].get(email): 
            database['clients'][email]["licenses"].update(
                data["licenses"])
        else: 
            database['clients'][email] = data
        
        self.save_database(database)

    # Deleters
    def delete_seller(self, email):
        database = self.get_database()
        del database['sellers'][email]
        self.save_database(database)

    def delete_client(self, email):
        database = self.get_database()
        del database['clients'][email]
        self.save_database(database)

    # Verifiers
    def is_admin(self, email):
        admin = self.get_sellers(email)
        return admin["type"] == "admin"

DATABASE = Database("database.json")