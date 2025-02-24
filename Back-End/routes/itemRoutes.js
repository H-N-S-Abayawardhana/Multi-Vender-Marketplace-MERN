// itemRoutes.js
const express = require('express');
const router = express.Router();
const itemController = require('../Controllers/itemController');

// Get all items route - This should come first
router.get('/all', itemController.getAllItems);

// Get seller's items route - This should come before /:id route
router.get('/seller/items', itemController.getSellerItems);

// Add item route
router.post('/add', itemController.addItem);

// Get specific item route - This should come last
router.get('/:id', itemController.getItem);

// Route to check if store exists before adding item
router.get('/check-store/:email',  itemController.checkStoreForItem);

module.exports = router;
