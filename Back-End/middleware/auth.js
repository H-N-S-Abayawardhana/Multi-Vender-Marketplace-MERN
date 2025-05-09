const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: 'No authentication token, authorization denied' });
        }

        // Verify token 
        const decoded = jwt.verify(token, 'EDCVFRTGBNHY'); 
        
        
        req.user = { id: decoded.id };
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

module.exports = auth;
