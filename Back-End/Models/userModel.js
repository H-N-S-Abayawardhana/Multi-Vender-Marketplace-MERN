const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    userLevel: { type: Number, default: 3 } // Default: Normal User (Buyer)
});

module.exports = mongoose.model('User', userSchema);
