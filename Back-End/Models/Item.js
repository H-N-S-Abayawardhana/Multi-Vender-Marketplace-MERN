// models/Item.js
const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true
  },
  condition: {
    type: String,
    required: true,
    enum: ['New', 'Used', 'Refurbished', 'Other']
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  description: String,
  brand: String,
  model: String,
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    weight: Number
  },
  color: String,
  material: String,
  price: {
    type: Number,
    required: true
  },
  listingType: {
    type: String,
    enum: ['Fixed', 'Auction'],
    default: 'Fixed'
  },
  startingBid: Number,
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  shippingDetails: {
    method: String,
    cost: Number,
    handlingTime: Number,
    internationalShipping: Boolean
  },
  paymentMethods: [{
    type: String
  }],
  returnPolicy: {
    acceptsReturns: Boolean,
    returnPeriod: Number,
    conditions: String
  },
  images: [{
    type: String,
    required: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  
 
});

module.exports = mongoose.model('Item', itemSchema);
