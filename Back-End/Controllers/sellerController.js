const Seller = require('../Models/Seller');
const Notification = require('../Models/Notification');

const sellerController = {
    // Register new seller
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
    },

    // Get seller status by email
    getSellerStatus: async (req, res) => {
        try {
            const { email } = req.params;
            console.log('Checking status for email:', email); // Debug log
            
            const seller = await Seller.findOne({ 'personalInfo.email': email });
            console.log('Found seller:', seller); // Debug log
            
            if (!seller) {
                return res.status(200).json({ 
                    success: true,
                    status: null 
                });
            }
            
            res.status(200).json({
                success: true,
                status: seller.status
            });

        } catch (error) {
            console.error('Error in getSellerStatus:', error);
            res.status(500).json({
                success: false,
                message: 'Error checking seller status',
                error: error.message
            });
        }
    }
};

module.exports = sellerController;