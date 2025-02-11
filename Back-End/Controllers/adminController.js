// controllers/adminController.js
const Seller = require('../Models/Seller');
const User = require('../Models/userModel');
const mongoose = require('mongoose');

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
        // Start a session for the transaction
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const { email, status } = req.body;

            const validStatuses = ['approved', 'rejected'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid status'
                });
            }

            // Update seller status
            const seller = await Seller.findOneAndUpdate(
                { 'personalInfo.email': email },
                { status },
                { new: true, session }
            );
            
            if (!seller) {
                await session.abortTransaction();
                return res.status(404).json({
                    success: false,
                    message: 'Seller not found'
                });
            }

            // If status is approved, update user level
            if (status === 'approved') {
                const user = await User.findOneAndUpdate(
                    { email: email },
                    { userLevel: 2 },
                    { new: true, session }
                );

                if (!user) {
                    await session.abortTransaction();
                    return res.status(404).json({
                        success: false,
                        message: 'User not found'
                    });
                }
            }

            // Commit the transaction
            await session.commitTransaction();

            res.status(200).json({
                success: true,
                message: `Seller status updated to ${status}`,
                seller
            });

        } catch (error) {
            // If error occurs, abort transaction
            await session.abortTransaction();
            console.error('Error updating seller status:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating seller status',
                error: error.message
            });
        } finally {
            // End the session
            session.endSession();
        }
    }
};

module.exports = adminController;