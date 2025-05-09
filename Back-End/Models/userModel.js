const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters long']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
            'Please enter a valid email address'
        ]
    },
    mobile: {
        type: String,
        required: [true, 'Mobile number is required'],
        trim: true,
        match: [
            /^\d{10}$/,
            'Please enter a valid 10-digit mobile number'
        ]
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false
    },
    userLevel: {
        type: Number,
        required: true,
        default: 3,  // Default is BUYER
        enum: {
            values: [1, 2, 3],  
            message: 'Invalid user level'
        }
    },
    lastLogin: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    },
    loginAttempts: {
        type: Number,
        default: 0
    },
    lastLoginAttempt: {
        type: Date
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    emailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: String,
    emailVerificationExpires: Date
}, {
    timestamps: true,
    toJSON: {
        transform: function(doc, ret) {
            delete ret.password;
            delete ret.resetPasswordToken;
            delete ret.resetPasswordExpires;
            delete ret.emailVerificationToken;
            delete ret.emailVerificationExpires;
            delete ret.__v;
            return ret;
        }
    }
});

//index for email lookup optimization
userSchema.index({ email: 1 });

//index for mobile lookup optimization
userSchema.index({ mobile: 1 });

// Virtual for user's full profile URL
userSchema.virtual('profileUrl').get(function() {
    return `/users/${this._id}`;
});

// Method to check if password reset token is valid
userSchema.methods.isResetTokenValid = function() {
    return this.resetPasswordExpires && this.resetPasswordExpires > Date.now();
};

// Method to check if email verification token is valid
userSchema.methods.isVerificationTokenValid = function() {
    return this.emailVerificationExpires && this.emailVerificationExpires > Date.now();
};

// Method to check if account is locked
userSchema.methods.isAccountLocked = function() {
    if (this.loginAttempts >= 5) {
        const lockoutTime = 15 * 60 * 1000; // 15 minutes
        return this.lastLoginAttempt && 
               (Date.now() - this.lastLoginAttempt) < lockoutTime;
    }
    return false;
};

// Static method to find active users
userSchema.statics.findActive = function() {
    return this.find({ isActive: true });
};

// Pre-save middleware to ensure email is lowercase
userSchema.pre('save', function(next) {
    if (this.isModified('email')) {
        this.email = this.email.toLowerCase();
    }
    next();
});

// Pre-save middleware to trim name and mobile
userSchema.pre('save', function(next) {
    if (this.isModified('name')) {
        this.name = this.name.trim();
    }
    if (this.isModified('mobile')) {
        this.mobile = this.mobile.trim();
    }
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;