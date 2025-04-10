const User = require('../Models/userModel');
const SessionLog = require('../Models/sessionLogModel');
const Store = require('../Models/Store');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

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


// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Generate a 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: email,
    subject: 'Password Reset OTP',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4a90e2;">Password Reset Request</h2>
        <p>We received a request to reset your password. Please use the following One-Time Password (OTP) to complete the process:</p>
        <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
          ${otp}
        </div>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
        <p style="margin-top: 30px; font-size: 12px; color: #888;">This is an automated email. Please do not reply to this message.</p>
      </div>
    `
  };

  return await transporter.sendMail(mailOptions);
};

const getUserProfile = async (req, res) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                message: 'Authentication required. Please provide valid token.' 
            });
        }

        const token = authHeader.split(' ')[1];
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Find user using decoded email
        const user = await User.findOne({ email: decoded.email });
        
        if (!user) {
            return res.status(404).json({ 
                message: 'User not found' 
            });
        }

        res.status(200).json({
            name: user.name,
            email: user.email,
            mobile: user.mobile,
            userLevel: user.userLevel,
            lastLogin: user.lastLogin
        });
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ 
            message: 'Error fetching user profile', 
            error: error.message 
        });
    }
};

    // Update user profile
    const updateProfile = async (req, res) => {
        try {
            // Get token from Authorization header
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({ 
                    message: 'Authentication required. Please provide valid token.' 
                });
            }
    
            const token = authHeader.split(' ')[1];
            
            // Verify token
            const decoded = jwt.verify(token, JWT_SECRET);
            
            // Find user using decoded email
            const user = await User.findOne({ email: decoded.email });
            
            if (!user) {
                return res.status(404).json({ 
                    message: 'User not found' 
                });
            }
    
            const { name, mobile } = req.body;
    
            // Validation
            if (!name && !mobile) {
                return res.status(400).json({ message: 'No update data provided' });
            }
    
            // Validate input
            const validation = validateInput({ 
                name: name || user.name, 
                email: user.email,
                password: 'dummypass', // password validation is skipped for update
                mobile: mobile || user.mobile
            });
    
            if (!validation.isValid) {
                return res.status(400).json({ 
                    message: "Validation failed", 
                    errors: validation.errors 
                });
            }
    
            // Build update object
            const updateFields = {};
            if (name) updateFields.name = name.trim();
            if (mobile) updateFields.mobile = mobile;
    
            // Update user
            const updatedUser = await User.findOneAndUpdate(
                { email: decoded.email },
                { $set: updateFields },
                { new: true, runValidators: true }
            ).select('-password');
    
            res.status(200).json({
                message: "Profile updated successfully",
                user: {
                    name: updatedUser.name,
                    email: updatedUser.email,
                    mobile: updatedUser.mobile,
                    userLevel: updatedUser.userLevel
                }
            });
        } catch (error) {
            console.error('Update profile error:', error);
            if (error.name === 'ValidationError') {
                return res.status(400).json({ message: error.message });
            }
            res.status(500).json({ 
                message: "Profile update failed", 
                error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
            });
        }
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

const forgotPassword = async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }
  
      const user = await User.findOne({ email: email.toLowerCase() });
  
      if (!user) {
        return res.status(200).json({ message: 'If your email is registered, you will receive an OTP shortly' });
      }
  
      const otp = generateOTP();
      const hashedOTP = await bcrypt.hash(otp, 10);
  
      const expiry = new Date();
      expiry.setMinutes(expiry.getMinutes() + 10);
  
      user.resetPasswordToken = hashedOTP;
      user.resetPasswordExpires = expiry;
      await user.save();
  
      await sendOTPEmail(user.email, otp);
  
      res.status(200).json({ message: 'OTP sent to your email address' });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ message: 'Server error. Please try again later.' });
    }
  };
  
  const resendOTP = async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }
  
      const user = await User.findOne({ email: email.toLowerCase() });
  
      if (!user) {
        return res.status(200).json({ message: 'If your email is registered, you will receive an OTP shortly' });
      }
  
      const otp = generateOTP();
      const hashedOTP = await bcrypt.hash(otp, 10);
  
      const expiry = new Date();
      expiry.setMinutes(expiry.getMinutes() + 10);
  
      user.resetPasswordToken = hashedOTP;
      user.resetPasswordExpires = expiry;
      await user.save();
  
      await sendOTPEmail(user.email, otp);
  
      res.status(200).json({ message: 'New OTP sent to your email address' });
    } catch (error) {
      console.error('Resend OTP error:', error);
      res.status(500).json({ message: 'Server error. Please try again later.' });
    }
  };
  
  const resetPassword = async (req, res) => {
    try {
      const { email, otp, newPassword } = req.body;
  
      if (!email || !otp || !newPassword) {
        return res.status(400).json({ message: 'Email, OTP, and new password are required' });
      }
  
      const user = await User.findOne({
        email: email.toLowerCase(),
        resetPasswordExpires: { $gt: Date.now() }
      });
  
      if (!user) {
        return res.status(400).json({ message: 'Password reset request is invalid or has expired' });
      }
  
      const isOTPValid = await bcrypt.compare(otp, user.resetPasswordToken);
  
      if (!isOTPValid) {
        return res.status(400).json({ message: 'Invalid OTP' });
      }
  
      const hashedPassword = await bcrypt.hash(newPassword, 10);
  
      user.password = hashedPassword;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
  
      res.status(200).json({ message: 'Password has been reset successfully' });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ message: 'Server error. Please try again later.' });
    }
  };
// @desc    Get all sellers with store information
// @route   GET /api/users/sellers
// @access  Private/Admin
const getAllSellers = async (req, res) => {
    try {
      // Find all users with userLevel = 2 (sellers)
      const sellers = await User.find({ userLevel: 2 });
      
      // Array to store seller data with store information
      const sellerData = [];
      
      // For each seller, check if they have a store
      for (const seller of sellers) {
        // Check if the seller has a store using their email
        const store = await Store.findOne({ email: seller.email });
        
        // Add seller data with store information
        sellerData.push({
          _id: seller._id,
          name: seller.name,
          email: seller.email,
          mobile: seller.mobile,
          lastLogin: seller.lastLogin,
          isActive: seller.isActive,
          createdAt: seller.createdAt,
          hasStore: Boolean(store),
          storeId: store ? store.storeId : null,
          storeName: store ? store.storeName : null
        });
      }
      
      res.status(200).json({
        success: true,
        count: sellerData.length,
        data: sellerData
      });
    } catch (error) {
      console.error('Error fetching sellers:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching sellers',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
      });
    }
  };
  
  // @desc    Remove a seller
  // @route   DELETE /api/users/sellers/:id
  // @access  Private/Admin
  const removeSeller = async (req, res) => {
    try {
      const seller = await User.findById(req.params.id);
      
      // Check if seller exists
      if (!seller) {
        return res.status(404).json({
          success: false,
          message: `Seller not found with id of ${req.params.id}`
        });
      }
      
      // Check if user is actually a seller
      if (seller.userLevel !== 2) {
        return res.status(400).json({
          success: false,
          message: `User with id ${req.params.id} is not a seller`
        });
      }
      
      // Check if seller has a store
      const store = await Store.findOne({ email: seller.email });
      
      // Remove store if exists
      if (store) {
        await Store.findByIdAndDelete(store._id);
      }
      
      // Remove seller
      await User.findByIdAndDelete(req.params.id);
      
      res.status(200).json({
        success: true,
        data: {}
      });
    } catch (error) {
      console.error('Error removing seller:', error);
      res.status(500).json({
        success: false,
        message: 'Error removing seller',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
      });
    }
  };

// @desc    Get all customers (users with userLevel = 3)
// @route   GET /api/users/customers
// @access  Private (Admin and Seller)
const getAllCustomers = async (req, res) => {
    try {
        const customers = await User.find({ userLevel: 3, isActive: true })
            .select('name email mobile lastLogin createdAt')
            .sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            count: customers.length,
            data: customers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching customers',
            error: error.message
        });
    }
};

// @desc    Get customer details by ID
// @route   GET /api/users/customers/:id
// @access  Private (Admin and Seller)
const getCustomerById = async (req, res) => {
    try {
        const customer = await User.findOne({ 
            _id: req.params.id,
            userLevel: 3
        });
        
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: customer
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching customer details',
            error: error.message
        });
    }
};

// @desc    Update customer active status
// @route   PATCH /api/users/customers/:id/status
// @access  Private (Admin only)
const updateCustomerStatus = async (req, res) => {
    try {
        const { isActive } = req.body;
        
        if (isActive === undefined) {
            return res.status(400).json({
                success: false,
                message: 'isActive status is required'
            });
        }
        
        const customer = await User.findOneAndUpdate(
            { _id: req.params.id, userLevel: 3 },
            { isActive },
            { new: true, runValidators: true }
        );
        
        if (!customer) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: `Customer status ${isActive ? 'activated' : 'deactivated'} successfully`,
            data: customer
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating customer status',
            error: error.message
        });
    }
};
 


module.exports = {
    getUserProfile,
    updateProfile,
    registerUser,
    loginUser,
    logoutUser,
    forgotPassword,
    resendOTP,
    resetPassword,
    getAllSellers,
    removeSeller,
    getAllCustomers,
    getCustomerById,
    updateCustomerStatus,
    USER_LEVELS
};