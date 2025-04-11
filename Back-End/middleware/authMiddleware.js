const jwt = require('jsonwebtoken');
const User = require('../Models/userModel');

const isAdmin = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No authentication token, access denied'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
                // Get user from database
        const user = await User.findById(decoded.userId);
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if user is admin
        if (user.userLevel !== 1) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin only.'
            });
        }

        // Add user to request object
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Token is invalid',
            error: error.message
        });
    }
};

module.exports = { isAdmin };