const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Use environment variable for JWT secret
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key"; // Make sure to set this in .env

// User Levels
const USER_LEVELS = {
    ADMIN: 1,
    SELLER: 2,
    BUYER: 3
};

// Input validation helper
const validateInput = ({ name, email, password }) => {
    const errors = [];
    
    if (email && !/\S+@\S+\.\S+/.test(email)) {
        errors.push('Invalid email format');
    }
    
    if (password && password.length < 6) {
        errors.push('Password must be at least 6 characters long');
    }
    
    if (name && name.length < 2) {
        errors.push('Name must be at least 2 characters long');
    }
    
    return errors;
};

// 📌 Register a new user
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate input
        const validationErrors = validateInput({ name, email, password });
        if (validationErrors.length > 0) {
            return res.status(400).json({ 
                message: "Validation failed", 
                errors: validationErrors 
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ 
                message: "User already exists",
                field: "email"
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user (Default: Buyer)
        const newUser = new User({
            name: name.trim(),
            email: email.toLowerCase(),
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
            { expiresIn: '24h' }
        );

        res.status(201).json({ 
            message: "User registered successfully",
            token,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
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

// 📌 Login user
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Input validation
        if (!email || !password) {
            return res.status(400).json({ 
                message: "Email and password are required" 
            });
        }

        // Find user and select additional fields needed
        const user = await User.findOne({ email: email.toLowerCase() })
            .select('+password +lastLogin +loginAttempts');

        if (!user) {
            return res.status(401).json({ 
                message: "Invalid credentials" 
            });
        }

        // Check for too many login attempts
        if (user.loginAttempts >= 5) {
            const lockoutTime = 15 * 60 * 1000; // 15 minutes
            const timeSinceLastAttempt = Date.now() - user.lastLoginAttempt;
            
            if (timeSinceLastAttempt < lockoutTime) {
                return res.status(429).json({ 
                    message: "Too many login attempts. Please try again later." 
                });
            } else {
                // Reset attempts after lockout period
                user.loginAttempts = 0;
            }
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            user.loginAttempts = (user.loginAttempts || 0) + 1;
            user.lastLoginAttempt = new Date();
            await user.save();
            
            return res.status(401).json({ 
                message: "Invalid credentials" 
            });
        }

        // Reset login attempts on successful login
        user.loginAttempts = 0;
        user.lastLoginAttempt = null;
        user.lastLogin = new Date();
        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: user._id, 
                userLevel: user.userLevel,
                email: user.email
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
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

module.exports = {
    registerUser,
    loginUser,
    USER_LEVELS
};