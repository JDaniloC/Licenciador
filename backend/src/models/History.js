const mongoose = require('mongoose');

const HistorySchema = new mongoose.Schema({
    who: String,
    what: String,
    when: Date
});

module.exports = mongoose.model('History', HistorySchema);