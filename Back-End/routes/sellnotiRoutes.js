// routes/sellnotiRoutes.js
const express = require('express');
const router = express.Router();
const sellnotiController = require('../Controllers/sellnotiController');

// Get notifications for a specific email
router.get('/notifications/:email', sellnotiController.getSellerNotifications);

// Mark notification as read
router.put('/notifications/:id/read', async (req, res) => {
    try {
        const notificationId = req.params.id;
        await sellnotiController.markAsRead(req, res);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;