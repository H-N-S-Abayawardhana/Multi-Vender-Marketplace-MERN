// Backend - models/Store.js
const mongoose = require('mongoose');

// Function to generate store ID
function generateStoreId() {
  // Generate a random 6-digit number
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const storeSchema = new mongoose.Schema({
  storeId: {
    type: String,
    unique: true,
    required: true,
    default: generateStoreId
  },
  storeName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  logo: {
    type: String,
    default: null
  },
  banner: {
    type: String,
    default: null
  },
  owner: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Store', storeSchema);