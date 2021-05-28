import mongoose from 'mongoose';

const HistoryModel = new mongoose.Schema({
    who: String, what: String, when: Date
});

export default mongoose.models.History || 
    mongoose.model('History', HistoryModel);