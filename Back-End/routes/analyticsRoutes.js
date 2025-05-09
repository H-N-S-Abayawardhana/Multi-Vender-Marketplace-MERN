// routes/analyticsRoutes.js
const express = require('express');
const router = express.Router();
const analyticsController = require('../Controllers/analyticsController');

router.get('/seller-stats', analyticsController.getSellerOrderStats);

module.exports = router;

// Add this to your main app.js or server.js
// app.use('/api/analytics', require('./routes/analyticsRoutes'));