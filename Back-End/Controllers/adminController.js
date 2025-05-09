const Seller = require('../Models/Seller');
const User = require('../Models/userModel');
const { createNotification } = require('./sellnotiController');

const adminController = {
    getSellerRequests: async (req, res) => {
        try {
            const { status } = req.query;
            
            const validStatuses = ['pending', 'approved', 'rejected'];
            if (status && !validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid status parameter'
                });
            }

            const query = status ? { status } : {};
            const requests = await Seller.find(query);
            
            res.status(200).json({
                success: true,
                requests
            });
        } catch (error) {
            console.error('Error fetching seller requests:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching seller requests',
                error: error.message
            });
        }
    },

    updateSellerStatus: async (req, res) => {
        try {
            const { email, status } = req.body;
            console.log('Updating status for:', email, status); // Debug log

            const validStatuses = ['approved', 'rejected'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid status'
                });
            }

            // First, check if the seller exists
            const existingSeller = await Seller.findOne({ 'personalInfo.email': email });
            if (!existingSeller) {
                return res.status(404).json({
                    success: false,
                    message: 'Seller not found'
                });
            }

            // If we're approving the seller, check if the user exists first
            if (status === 'approved') {
                const existingUser = await User.findOne({ email: email });
                if (!existingUser) {
                    return res.status(404).json({
                        success: false,
                        message: 'User not found'
                    });
                }
            }

            // Update seller status
            const seller = await Seller.findOneAndUpdate(
                { 'personalInfo.email': email },
                { 'status': status },
                { new: true }
            );

            // If status is approved, update user level and create notification
            if (status === 'approved') {
                await User.findOneAndUpdate(
                    { email: email },
                    { userLevel: 2 },
                    { new: true }
                );

                // Create notification for approved seller
                const notificationResult = await createNotification(
                    email,
                    'Congratulations ! Your seller request has been approved'
                );
                console.log('Notification creation result:', notificationResult); // Debug log
            }

            res.status(200).json({
                success: true,
                message: `Seller status updated to ${status}`,
                seller
            });

        } catch (error) {
            console.error('Error updating seller status:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating seller status',
                error: error.message
            });
        }
    }
};

module.exports = adminController;