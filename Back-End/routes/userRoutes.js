const express = require('express');
const router = express.Router();
// Change this line to import all controller functions correctly
const { 
    registerUser, 
    loginUser, 
    logoutUser, 
    getUserProfile,
    updateProfile
} = require('../Controllers/userController');

// Auth routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

// Change this line to use the imported function directly
router.get('/profile', getUserProfile);  
router.put('/profile', updateProfile);

module.exports = router;