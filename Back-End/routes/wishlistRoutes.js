// routes/wishlist.routes.js
const express = require('express');
const router = express.Router();
const wishlistController = require('../Controllers/wishlistController');

// Add item to wishlist
router.post('/', wishlistController.addToWishlist);

// Get all wishlist items for a user
router.get('/', wishlistController.getWishlist);

// Get detailed wishlist with item information
router.get('/detailed', wishlistController.getDetailedWishlist);

// Remove item from wishlist
router.delete('/:itemId', wishlistController.removeFromWishlist);

module.exports = router;