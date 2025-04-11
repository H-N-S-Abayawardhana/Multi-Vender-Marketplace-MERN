const User = require('../Models/userModel');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

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

// Controller for initiating forgot password process
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      // For security reasons, don't reveal that the email doesn't exist
      return res.status(200).json({ message: 'If your email is registered, you will receive an OTP shortly' });
    }
    
    // Generate OTP
    const otp = generateOTP();
    
    // Hash OTP before storing (for security)
    const hashedOTP = await bcrypt.hash(otp, 10);
    
    // Set OTP expiry (10 minutes)
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 10);
    
    // Update user with reset token info
    user.resetPasswordToken = hashedOTP;
    user.resetPasswordExpires = expiry;
    await user.save();
    
    // Send OTP email
    await sendOTPEmail(user.email, otp);
    
    res.status(200).json({ message: 'OTP sent to your email address' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// Controller for resending OTP
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      // For security reasons, don't reveal that the email doesn't exist
      return res.status(200).json({ message: 'If your email is registered, you will receive an OTP shortly' });
    }
    
    // Generate new OTP
    const otp = generateOTP();
    
    // Hash OTP before storing
    const hashedOTP = await bcrypt.hash(otp, 10);
    
    // Set new OTP expiry (10 minutes)
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 10);
    
    // Update user with new reset token info
    user.resetPasswordToken = hashedOTP;
    user.resetPasswordExpires = expiry;
    await user.save();
    
    // Send new OTP email
    await sendOTPEmail(user.email, otp);
    
    res.status(200).json({ message: 'New OTP sent to your email address' });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// Controller for resetting password with OTP verification
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, OTP, and new password are required' });
    }
    
    // Find user by email
    const user = await User.findOne({ 
      email: email.toLowerCase(),
      resetPasswordExpires: { $gt: Date.now() } // Check if reset token is still valid
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Password reset request is invalid or has expired' });
    }
    
    // Verify OTP
    const isOTPValid = await bcrypt.compare(otp, user.resetPasswordToken);
    
    if (!isOTPValid) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update user password and clear reset token fields
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