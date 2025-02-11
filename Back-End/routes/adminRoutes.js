// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../Controllers/adminController');

// For development/testing, you can temporarily remove the isAdmin middleware
// Once you have authentication set up, you can add it back

// Without auth middleware for now
router.get('/seller-requests', adminController.getSellerRequests);
router.put('/update-seller-status', adminController.updateSellerStatus);

module.exports = router;