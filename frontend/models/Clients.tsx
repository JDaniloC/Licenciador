import mongoose from 'mongoose';

interface License {
    botName: string,
    timestamp: number
    updateTime: number,
}

export interface ClientSchema {
    email: string,
    seller: string,
    license: Array<License>,
    updateTime: Date
}

const ClientModel = new mongoose.Schema({
    email: String,
    seller: String,
    license: Array,
    updateTime: Date
});

export default mongoose.models.Client || 
    mongoose.model('Client', ClientModel);