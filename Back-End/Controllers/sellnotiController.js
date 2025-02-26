const SellerNotification = require('../Models/sellnotiModel');

// Create new notification
exports.createNotification = async (email, message) => {
    try {
        console.log('Creating notification for:', email, message);
        const notification = new SellerNotification({
            email,
            message
        });
        await notification.save();
        return { success: true, notification };
    } catch (error) {
        console.error('Error creating notification:', error);
        return { success: false, error: error.message };
    }
};

// Get notifications for a specific email
exports.getSellerNotifications = async (req, res) => {
    try {
        const email = req.params.email;
        console.log('Fetching notifications for email:', email);
        const notifications = await SellerNotification.find({ email })
            .sort({ createdAt: -1 });
        console.log('Found notifications:', notifications);
        res.status(200).json(notifications);
    } catch (error) {
        console.error('Error in getSellerNotifications:', error);
        res.status(500).json({ error: error.message });
    }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
    try {
        const notificationId = req.params.id;
        const updatedNotification = await SellerNotification.findByIdAndUpdate(
            notificationId, 
            { isRead: true },
            { new: true } // Return the updated document
        );
        
        if (!updatedNotification) {
            return res.status(404).json({ error: 'Notification not found' });
        }
        
        res.status(200).json({ 
            message: 'Notification marked as read',
            notification: updatedNotification
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get unread notification count for a specific email
exports.getUnreadCount = async (req, res) => {
    try {
        const email = req.params.email;
        const count = await SellerNotification.countDocuments({ 
            email, 
            isRead: false 
        });
        
        res.status(200).json({ count });
    } catch (error) {
        console.error('Error getting unread count:', error);
        res.status(500).json({ error: error.message });
    }
};