const express = require('express');
const router = express.Router();
// Change this line to import all controller functions correctly
const { 
    registerUser, 
    loginUser, 
    logoutUser, 
    getUserProfile,
    updateProfile,
    forgotPassword,
    resendOTP,
    resetPassword,
    getAllSellers,
    removeSeller,
    getAllCustomers,
    getCustomerById,
    updateCustomerStatus


} = require('../Controllers/userController');

// Auth routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

// Change this line to use the imported function directly
router.get('/profile', getUserProfile);  
router.put('/profile', updateProfile);

// Route to initiate forgot password process
router.post('/forgot-password', forgotPassword);

// Route to resend OTP
router.post('/resend-otp', resendOTP);

// Route to reset password with OTP verification
router.post('/reset-password', resetPassword);


// Add route for getting all sellers - admin only
router.get('/sellers',  getAllSellers);

// Add route for removing a seller - admin only
router.delete('/sellers/:id',  removeSeller);

// Routes for customer management
router.get(
    '/customers', 
 
    getAllCustomers
);

router.get(
    '/customers/:id', 
    getCustomerById
);

router.patch(
    '/customers/:id/status', 
    updateCustomerStatus
);

module.exports = router;