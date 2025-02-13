const express = require('express');
const router = express.Router();
// Change this line to import all controller functions correctly
const { 
    registerUser, 
    loginUser, 
    logoutUser, 
    getUserProfile  // Add this import
} = require('../Controllers/userController');

// Auth routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

// Change this line to use the imported function directly
router.get('/profile', getUserProfile);  

module.exports = router;