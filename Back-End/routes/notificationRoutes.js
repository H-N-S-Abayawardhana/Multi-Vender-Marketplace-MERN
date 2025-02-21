// routes/notificationRoutes.js
const router = require('express').Router();
const notificationController = require('../Controllers/notificationController');

router.get('/', notificationController.getNotifications);
router.put('/:notificationId/mark-read', notificationController.markAsRead);
router.put('/mark-all-read', notificationController.markAllAsRead);

module.exports = router;