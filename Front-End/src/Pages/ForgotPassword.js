import React, { useState } from 'react';
import axios from 'axios';
import '../css/ForgotPassword.css'
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

const ForgotPassword = () => {
  // Form states
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI control states
  const [step, setStep] = useState(1); // 1: Email entry, 2: OTP verification & password reset
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [otpSent, setOtpSent] = useState(false);
  const [otpExpiry, setOtpExpiry] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  
  // Handle the initial email submission
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });
    
    try {
      const response = await axios.post('http://localhost:9000/api/users/forgot-password', { email });
      setMessage({ text: 'OTP sent to your email address.', type: 'success' });
      setOtpSent(true);
      setStep(2);
      
      // Set OTP expiry time - 10 minutes from now
      const expiryTime = new Date();
      expiryTime.setMinutes(expiryTime.getMinutes() + 10);
      setOtpExpiry(expiryTime);
      setTimeLeft(10 * 60); // 10 minutes in seconds
      
      // Start countdown timer
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (error) {
      setMessage({
        text: error.response?.data?.message || 'Failed to send OTP. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle OTP verification and password reset
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!otp || otp.length < 6) {
      setMessage({ text: 'Please enter a valid OTP.', type: 'error' });
      return;
    }
    
    if (newPassword.length < 6) {
      setMessage({ text: 'Password must be at least 6 characters long.', type: 'error' });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setMessage({ text: 'Passwords do not match.', type: 'error' });
      return;
    }
    
    setLoading(true);
    setMessage({ text: '', type: '' });
    
    try {
      const response = await axios.post('http://localhost:9000/api/users/reset-password', {
        email,
        otp,
        newPassword
      });
      
      setMessage({ 
        text: 'Password has been reset successfully. You can now login with your new password.',
        type: 'success' 
      });
      
      // Clear form fields after successful reset
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setOtpSent(false);
      
      // Add a delay before redirecting to login
      setTimeout(() => {
        window.location.href = '/login';
      }, 3000);
      
    } catch (error) {
      setMessage({
        text: error.response?.data?.message || 'Failed to reset password. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle resend OTP
  const handleResendOTP = async () => {
    setLoading(true);
    setMessage({ text: '', type: '' });
    
    try {
      const response = await axios.post('http://localhost:9000/api/users/resend-otp', { email });
      
      setMessage({ text: 'New OTP sent to your email address.', type: 'success' });
      setTimeLeft(10 * 60); // Reset timer to 10 minutes
      
      // Reset OTP expiry time
      const expiryTime = new Date();
      expiryTime.setMinutes(expiryTime.getMinutes() + 10);
      setOtpExpiry(expiryTime);
      
      // Start countdown timer
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (error) {
      setMessage({
        text: error.response?.data?.message || 'Failed to send new OTP.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Format time left
  const formatTimeLeft = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Go back to email step
  const handleGoBack = () => {
    setStep(1);
    setOtpSent(false);
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setMessage({ text: '', type: '' });
  };
  
  return (
    <>
    <NavBar/>
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <h2 className="forgot-password-title">Reset Password</h2>
        
        {message.text && (
          <div className={`forgot-password-message ${message.type}`}>
            {message.text}
          </div>
        )}
        
        {step === 1 ? (
          // Step 1: Email entry form
          <form onSubmit={handleSendOTP} className="forgot-password-form">
            <div className="forgot-password-form-group">
              <label htmlFor="email" className="forgot-password-label">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                className="forgot-password-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your registered email"
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="forgot-password-button"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
            
            <div className="forgot-password-links">
              <a href="/login" className="forgot-password-link">Back to Login</a>
            </div>
          </form>
        ) : (
          // Step 2: OTP verification and password reset form
          <form onSubmit={handleResetPassword} className="forgot-password-form">
            <div className="forgot-password-form-group">
              <label htmlFor="otp" className="forgot-password-label">
                One Time Password (OTP)
              </label>
              <input
                type="text"
                id="otp"
                className="forgot-password-input"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter the OTP sent to your email"
                required
              />
              {timeLeft > 0 && (
                <div className="forgot-password-timer">
                  OTP expires in: {formatTimeLeft(timeLeft)}
                </div>
              )}
            </div>
            
            <div className="forgot-password-form-group">
              <label htmlFor="newPassword" className="forgot-password-label">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                className="forgot-password-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter your new password"
                required
                minLength={6}
              />
            </div>
            
            <div className="forgot-password-form-group">
              <label htmlFor="confirmPassword" className="forgot-password-label">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                className="forgot-password-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                required
                minLength={6}
              />
            </div>
            
            <button 
              type="submit" 
              className="forgot-password-button"
              disabled={loading}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
            
            <div className="forgot-password-actions">
              <button 
                type="button" 
                className="forgot-password-secondary-button"
                onClick={handleGoBack}
              >
                Change Email
              </button>
              
              <button 
                type="button" 
                className="forgot-password-secondary-button"
                onClick={handleResendOTP}
                disabled={loading || timeLeft > 0}
              >
                {timeLeft > 0 ? `Resend OTP in ${formatTimeLeft(timeLeft)}` : 'Resend OTP'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
    <Footer/>
    </>
  );
};

export default ForgotPassword;