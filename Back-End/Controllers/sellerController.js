// controllers/sellerController.js
const Seller = require('../Models/Seller');

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
                status: 'pending' // Default status for new applications
            });

            await newSeller.save();

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