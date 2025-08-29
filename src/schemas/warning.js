const mongoose = require('mongoose');

const warningSchema = new mongoose.Schema({
    userId: { type: String, required: true }, 
    warningLevel: { type: Number, default: 0 }, 
    lastWarningDate: { type: Date, default: Date.now } 
});

// Uyarı modeli
const Warning = mongoose.model('Warning', warningSchema);

module.exports = Warning;