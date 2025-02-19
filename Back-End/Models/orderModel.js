// Models/orderModel.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: [true, 'User email is required'],
    trim: true
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: [true, 'Item ID is required']
  },
  itemDetails: {
    title: String,
    price: Number,
    image: String,
    quantity: {
      type: Number,
      default: 1
    }
  },
  shippingDetails: {
    fullName: {
      type: String,
      required: [true, 'Full name is required']
    },
    email: {
      type: String,
      required: [true, 'Email is required']
    },
    phone: {
      type: String,
      required: [true, 'Phone is required']
    },
    address: {
      type: String,
      required: [true, 'Address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    zipCode: {
      type: String,
      required: [true, 'ZIP code is required']
    }
  },
  paymentDetails: {
    cardNumber: String, // Last 4 digits only
    cardExpiry: String
  },
  orderStatus: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required']
  }
}, {
  timestamps: true
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;