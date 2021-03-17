const mongoose = require('mongoose');

const BotSchema = new mongoose.Schema({
    name: String,
    title: String,
    imageURL: String,
});

module.exports = mongoose.model('Bot', BotSchema);