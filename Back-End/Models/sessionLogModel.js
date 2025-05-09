const mongoose = require('mongoose');

const sessionLogSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    token: {
        type: String,
        required: true
    },
    loginTime: {
        type: Date,
        required: true,
        default: Date.now
    },
    logoutTime: {
        type: Date,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('SessionLog', sessionLogSchema);