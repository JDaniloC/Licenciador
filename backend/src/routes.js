const {Router} = require('express');
const Clients = require('./controllers/Clients');
const Bots = require('./controllers/Bots');
const Sellers = require('./controllers/Sellers');
const Login = require('./controllers/Session');
const Licensor = require('./controllers/Licensor');

const routes = Router();

routes.post('/clients', Clients.store);
routes.get('/clients', Clients.show);
routes.delete('/clients', Clients.destroy);
routes.put('/clients', Clients.update); 


routes.get('/bots', Bots.index);
routes.post('/bots', Bots.store);
routes.delete('/bots', Bots.destroy);

routes.post('/sellers', Sellers.store);
routes.get('/sellers', Sellers.index);
routes.delete('/sellers', Sellers.destroy);
// routes.put('/sellers', Sellers.update); 

routes.post('/login', Login.store);
routes.post('/licenses', Licensor.store);

//Você tirou um elemento do express que foi o router, onde ela contêm o post, delete, put, get.

module.exports = routes;