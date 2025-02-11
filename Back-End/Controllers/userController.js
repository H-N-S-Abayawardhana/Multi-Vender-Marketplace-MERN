const User = require('../Models/userModel');
const SessionLog = require('../Models/sessionLogModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Use environment variable for JWT secret
const JWT_SECRET = process.env.JWT_SECRET || "EDCVFRTGBNHY"; 

// User Levels
const USER_LEVELS = {
    ADMIN: 1,
    SELLER: 2,
    BUYER: 3
};

// Enhanced input validation helper
const validateInput = ({ name, email, password, mobile, confirmPassword }) => {
    const errors = {};
    
    // Name validation
    if (!name || name.trim().length < 2) {
        errors.name = 'Name must be at least 2 characters long';
    }
    
    // Email validation
    if (!email) {
        errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
        errors.email = 'Invalid email format';
    }
    
    // Password validation
    if (!password) {
        errors.password = 'Password is required';
    } else if (password.length < 6) {
        errors.password = 'Password must be at least 6 characters long';
    }

    // Confirm password validation
    if (confirmPassword !== undefined && password !== confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
    }
    
    // Mobile validation
    if (mobile) {
        if (!/^\d{10}$/.test(mobile)) {
            errors.mobile = 'Mobile number must be 10 digits';
        }
    }
    
    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

// 📌 Register a new user
const registerUser = async (req, res) => {
    try {
        const { name, email, password, mobile, confirmPassword } = req.body;

        // Enhanced validation
        const validation = validateInput({ 
            name, 
            email, 
            password, 
            mobile, 
            confirmPassword 
        });

        if (!validation.isValid) {
            return res.status(400).json({ 
                message: "Validation failed", 
                errors: validation.errors 
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [
                { email: email.toLowerCase() },
                { mobile: mobile }
            ]
        });

        if (existingUser) {
            const field = existingUser.email === email.toLowerCase() ? 'email' : 'mobile';
            return res.status(400).json({ 
                message: `User with this ${field} already exists`,
                field: field
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user (Default: Buyer)
        const newUser = new User({
            name: name.trim(),
            email: email.toLowerCase(),
            mobile: mobile,
            password: hashedPassword,
            userLevel: USER_LEVELS.BUYER,
            createdAt: new Date(),
            lastLogin: new Date()
        });

        await newUser.save();

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: newUser._id, 
                userLevel: newUser.userLevel,
                email: newUser.email
            },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(201).json({ 
            message: "User registered successfully",
            token,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                mobile: newUser.mobile,
                userLevel: newUser.userLevel
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            message: "Registration failed", 
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// 📌 Login user function 
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                message: "Email and password are required" 
            });
        }

        // Check if login is with email or mobile
        const user = await User.findOne({
            $or: [
                { email: email.toLowerCase() },
                { mobile: email } // Allow login with mobile number
            ]
        }).select('+password +lastLogin +loginAttempts');

        if (!user) {
            return res.status(401).json({ 
                message: "Invalid credentials" 
            });
        }

        // Check for too many login attempts
        if (user.loginAttempts >= 5) {
            const lockoutTime = 15 * 60 * 1000;
            const timeSinceLastAttempt = Date.now() - user.lastLoginAttempt;
            
            if (timeSinceLastAttempt < lockoutTime) {
                return res.status(429).json({ 
                    message: "Too many login attempts. Please try again later." 
                });
            } else {
                user.loginAttempts = 0;
            }
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            user.loginAttempts = (user.loginAttempts || 0) + 1;
            user.lastLoginAttempt = new Date();
            await user.save();
            
            return res.status(401).json({ 
                message: "Invalid credentials" 
            });
        }

        // Reset login attempts and update last login
        user.loginAttempts = 0;
        user.lastLoginAttempt = null;
        user.lastLogin = new Date();
        await user.save();

        // Generate token
        const token = jwt.sign(
            { 
                id: user._id, 
                userLevel: user.userLevel,
                email: user.email
            },
            JWT_SECRET,
            { expiresIn: '60m' }
        );

        // Create session log
        const sessionLog = new SessionLog({
            email: user.email,
            token: token,
            loginTime: new Date()
        });
        await sessionLog.save();

        res.json({
            message: "Login successful",
            token,
            expiresIn: 3600,
            sessionId: sessionLog._id,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                mobile: user.mobile,
                userLevel: user.userLevel,
                lastLogin: user.lastLogin
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            message: "Login failed", 
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Logout handler remains the same
const logoutUser = async (req, res) => {
    try {
        const { sessionId } = req.body;
        
        if (!sessionId) {
            return res.status(400).json({
                message: "Session ID is required"
            });
        }

        const sessionLog = await SessionLog.findById(sessionId);
        if (sessionLog && sessionLog.isActive) {
            sessionLog.logoutTime = new Date();
            sessionLog.isActive = false;
            await sessionLog.save();
        }

        res.json({ message: "Logged out successfully" });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            message: "Logout failed",
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    USER_LEVELS
};