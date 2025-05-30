const mongoose = require('mongoose');

const sellerSchema = new mongoose.Schema({
    personalInfo: {
        fullName: {
            type: String,
            required: [true, 'Full name is required']
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true
        },
        mobileNumber: {
            type: String,
            required: [true, 'Mobile number is required'],
            trim: true
        },
        dob: {
            type: Date,
            required: [true, 'Date of birth is required']
        }
    },
    businessInfo: {
        businessName: {
            type: String,
            required: [true, 'Business name is required'],
            trim: true
        },
        businessType: {
            type: String,
            required: [true, 'Business type is required'],
            enum: ['Individual', 'Sole Proprietorship', 'LLC', 'Corporation']
        },
        businessRegistrationNumber: {
            type: String,
            required: [true, 'Business registration number is required'],
            unique: true,
            trim: true
        },
        taxIdentificationNumber: {
            type: String,
            required: [true, 'Tax identification number is required'],
            unique: true,
            trim: true
        },
        businessAddress: {
            type: String,
            required: [true, 'Business address is required'],
            trim: true
        },
        businessContactNumber: {
            type: String,
            required: [true, 'Business contact number is required'],
            trim: true
        },
        businessEmail: {
            type: String,
            required: [true, 'Business email is required'],
            lowercase: true,
            trim: true
        }
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    documents: [{
        documentType: String,
        documentUrl: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    verificationNotes: {
        type: String,
        trim: true
    }
});

// Update the updatedAt timestamp before saving
sellerSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Add indexes for frequently queried fields
sellerSchema.index({ 'personalInfo.email': 1 });
sellerSchema.index({ 'businessInfo.businessRegistrationNumber': 1 });
sellerSchema.index({ status: 1 });

const Seller = mongoose.model('Seller', sellerSchema);

module.exports = Seller;