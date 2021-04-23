const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
    email: String,
    seller: String,
    license: Array,
    updateTime: Date
});

module.exports = mongoose.model('Client', ClientSchema); //Client é o nome e ClientSchema é o parâmetro.

//Essa parada é as entidades da aplicação.
//Schema é coisa do mongoose.