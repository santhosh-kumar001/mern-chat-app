const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    user: String,
    text: String,
    role: String,
    isEdited: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', MessageSchema);