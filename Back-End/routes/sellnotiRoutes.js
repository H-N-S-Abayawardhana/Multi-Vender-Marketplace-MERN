// routes/sellnotiRoutes.js
const express = require('express');
const router = express.Router();
const sellnotiController = require('../Controllers/sellnotiController');

// Get notifications for a specific email
router.get('/notifications/:email', sellnotiController.getSellerNotifications);

// Get unread notification count for a specific email
router.get('/notifications/:email/unread', sellnotiController.getUnreadCount);

// Mark notification as read
router.put('/notifications/:id/read', sellnotiController.markAsRead);

module.exports = router;