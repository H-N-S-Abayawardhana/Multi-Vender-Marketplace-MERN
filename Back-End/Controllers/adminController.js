// controllers/adminController.js
const Seller = require('../Models/Seller');

const adminController = {
    // Get seller requests filtered by status
    getSellerRequests: async (req, res) => {
        try {
            const { status } = req.query;
            
            // Validate status parameter
            const validStatuses = ['pending', 'approved', 'rejected'];
            if (status && !validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid status parameter'
                });
            }

            // Build query based on status
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

    // Update seller status
    updateSellerStatus: async (req, res) => {
        try {
            const { email, status } = req.body;

            // Validate status
            const validStatuses = ['approved', 'rejected'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid status'
                });
            }

            const seller = await Seller.findOne({ 'personalInfo.email': email });
            
            if (!seller) {
                return res.status(404).json({
                    success: false,
                    message: 'Seller not found'
                });
            }

            seller.status = status;
            await seller.save();

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