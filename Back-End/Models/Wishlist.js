const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

wishlistSchema.index({ email: 1, itemId: 1 }, { unique: true });

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

module.exports = Wishlist;