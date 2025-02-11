const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logoutUser } = require('../controllers/userController');

// Your existing routes
router.post('/register', registerUser);
router.post('/login', loginUser);
// Add the new logout route
router.post('/logout', logoutUser);

module.exports = router;