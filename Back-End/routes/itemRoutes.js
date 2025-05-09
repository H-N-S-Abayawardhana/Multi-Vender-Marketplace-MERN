const express = require('express');
const router = express.Router();
const itemController = require('../Controllers/itemController');
const multer = require('multer');
const path = require('path');

// Configure multer for image upload (this should ideally be in a separate middleware file)
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB limit
  fileFilter: function(req, file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Images Only! (jpeg, jpg, png)');
    }
  }
});

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

// Add item route - NOTE: We don't need the upload middleware here as it's already in the controller
router.post('/add', itemController.addItem);

// Get specific item route
router.get('/:id', itemController.getItem);

// Update item route - We don't need the upload middleware here as it's in the controller
router.put('/:id', itemController.updateItem);

// Delete item route
router.delete('/:id', itemController.deleteItem);

module.exports = router;