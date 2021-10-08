import mongoose from 'mongoose';

const BotSchema = new mongoose.Schema({
    name: String,
    title: String,
    imageURL: String,
    extraInfo: Object
});

export default mongoose.models.Bot || 
    mongoose.model('Bot', BotSchema);