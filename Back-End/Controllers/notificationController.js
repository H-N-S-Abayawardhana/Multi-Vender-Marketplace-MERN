const Notification = require('../Models/Notification');

const notificationController = {
    // Get notifications for a specific user
    getNotifications: async (req, res) => {
        try {
            const notifications = await Notification.find({ recipient: 'admin' })
                .sort({ createdAt: -1 })
                .limit(20);
            
            res.json({ success: true, data: notifications });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    

    // Mark notification as read
    markAsRead: async (req, res) => {
        try {
            const { notificationId } = req.params;
            await Notification.findByIdAndUpdate(notificationId, { isRead: true });
            res.json({ success: true, message: 'Notification marked as read' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    // Mark all notifications as read
    markAllAsRead: async (req, res) => {
        try {
            await Notification.updateMany(
                { recipient: 'admin', isRead: false },
                { isRead: true }
            );
            res.json({ success: true, message: 'All notifications marked as read' });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
    
};



module.exports = notificationController;