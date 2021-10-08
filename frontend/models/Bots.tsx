import mongoose from 'mongoose';

export interface BotSchema {
    name: string,
    title: string,
    imageURL: string,
    extraInfo: object
};

const BotModel = new mongoose.Schema({
    name: String,
    title: String,
    imageURL: String,
    extraInfo: Object
});

export default mongoose.models.Bot || 
    mongoose.model('Bot', BotModel);