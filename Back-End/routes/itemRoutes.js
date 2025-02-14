const express = require('express');
const router = express.Router();
const itemController = require('../Controllers/itemController');

// Add item route
router.post('/add', itemController.addItem);

// Get specific item route
router.get('/:id', itemController.getItem);

// Get seller's items route
router.get('/seller/items', itemController.getSellerItems);

module.exports = router;