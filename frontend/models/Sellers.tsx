import mongoose from 'mongoose';

export interface SellerSchema {
    email: String,
    password: String,
    type: String,
    tests: Number,
    licenses: Number, 
    showBots: Boolean, 
    botList: Array<string>, 
}

const SellerModel = new mongoose.Schema({
    email: String,
    type: String,
    password: String,
    licenses: Number, 
    botList: Array, 
    showBots: Boolean, 
    tests: Number,
}); 

export default mongoose.models.Seller || 
    mongoose.model('Seller', SellerModel);