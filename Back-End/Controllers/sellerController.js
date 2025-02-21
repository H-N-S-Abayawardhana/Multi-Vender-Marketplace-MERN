const Seller = require('../Models/Seller');
const Notification = require('../Models/Notification');

const sellerController = {
    registerSeller: async (req, res) => {
        try {
            const {
                fullName,
                email,
                mobileNumber,
                dob,
                businessName,
                businessType,
                businessRegistrationNumber,
                taxIdentificationNumber,
                businessAddress,
                businessContactNumber,
                businessEmail
            } = req.body;

            // Create new seller
            const newSeller = new Seller({
                personalInfo: {
                    fullName,
                    email,
                    mobileNumber,
                    dob
                },
                businessInfo: {
                    businessName,
                    businessType,
                    businessRegistrationNumber,
                    taxIdentificationNumber,
                    businessAddress,
                    businessContactNumber,
                    businessEmail
                },
                status: 'pending'
            });

            await newSeller.save();

            // Create notification for admin
            const notification = new Notification({
                recipient: 'admin',
                type: 'seller_request',
                title: 'New Seller Application',
                message: `${fullName} has submitted a seller application`,
                referenceId: newSeller._id,
                isRead: false
            });

            await notification.save();

            res.status(201).json({
                success: true,
                message: 'Seller application submitted successfully',
                data: newSeller
            });

        } catch (error) {
            console.error('Error in registerSeller:', error);
            res.status(500).json({
                success: false,
                message: 'Error submitting seller application',
                error: error.message
            });
        }
    }
};

module.exports = sellerController;