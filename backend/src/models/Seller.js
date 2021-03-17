const mongoose = require('mongoose');

const SellerSchema = new mongoose.Schema({
    email: String,
    type: String,
    password: String,
    licenses: Number, 
    botlist: Array, 
    show: Boolean, 
    tests: Number,
}); 

module.exports = mongoose.model('Seller', SellerSchema);