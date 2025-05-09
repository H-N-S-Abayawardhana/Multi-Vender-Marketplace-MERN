const express = require('express');
const router = express.Router();
const analyzeController = require('../Controllers/analyzeController');
// const authMiddleware = require('../middleware/authMiddleware');


// Get all sellers
router.get('/sellers',  analyzeController.getAllSellers);

// Get analytics for a specific seller
router.get('/seller/:sellerEmail',  analyzeController.getSellerAnalytics);

module.exports = router;