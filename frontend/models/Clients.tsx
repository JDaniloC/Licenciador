import mongoose from 'mongoose';

export interface License {
    botName: string,
    timestamp: number
    updateTime: number,
}

export interface ClientSchema {
    email: string,
    seller: string,
    license: Array<License>,
    updateTime: Date
    password: string;
}

const ClientModel = new mongoose.Schema({
    email: String,
    seller: String,
    license: Array,
    updateTime: Date,
    password: String
});

export default mongoose.models.Client || 
    mongoose.model('Client', ClientModel);