const express = require('express');
const router = express.Router();
const itemController = require('../Controllers/itemController');

// IMPORTANT: Put specific routes BEFORE parameter routes
// Route to fetch featured items
router.get('/featured', itemController.getFeaturedItems);

// Route to fetch trending items
router.get('/trending', itemController.getTrendingItems);

// Route to fetch new arrivals
router.get('/new-arrivals', itemController.getNewArrivals);

// Route to fetch items by categories
router.get('/by-categories', itemController.getItemsByCategories);

// Get all items route
router.get('/all', itemController.getAllItems);

// Get seller's items route 
router.get('/seller/items', itemController.getSellerItems);

// Route to check if store exists before adding item
router.get('/check-store/:email', itemController.checkStoreForItem);

// Add item route
router.post('/add', itemController.addItem);

// IMPORTANT: Put parameter routes LAST
// Get specific item route
router.get('/:id', itemController.getItem);

module.exports = router;