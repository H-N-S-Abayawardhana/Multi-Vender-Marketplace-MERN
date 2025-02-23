import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import '../css/becomeseller.css';

const BecomeSeller = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [email, setEmail] = useState('');
    const [hasExistingApplication, setHasExistingApplication] = useState(false);
    const [applicationStatus, setApplicationStatus] = useState('');
    
    useEffect(() => {
        const userEmail = localStorage.getItem('email');
        if (userEmail) {
            setIsLoggedIn(true);
            setEmail(userEmail);
            checkExistingApplication(userEmail);
        }
    }, []);

    const checkExistingApplication = async (userEmail) => {
        try {
            const response = await fetch(`http://localhost:9000/api/seller/check-status/${userEmail}`);
            const data = await response.json();
            
            if (data.exists) {
                setHasExistingApplication(true);
                setApplicationStatus(data.status);
            }
        } catch (error) {
            console.error('Error checking application status:', error);
        }
    };

    const [formData, setFormData] = useState({
        // User Registration Information (for non-logged in users)
        fullName: '',
        email: '',
        mobileNumber: '',
        password: '',
        confirmPassword: '',
        
        // Personal Information
        dob: '',
        
        // Business Information
        businessName: '',
        businessType: '',
        businessRegistrationNumber: '',
        taxIdentificationNumber: '',
        businessAddress: '',
        businessContactNumber: '',
        businessEmail: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const validateForm = () => {
        if (!isLoggedIn) {
            if (formData.password !== formData.confirmPassword) {
                toast.error('Passwords do not match!');
                return false;
            }
            if (formData.password.length < 6) {
                toast.error('Password must be at least 6 characters long!');
                return false;
            }
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        try {
            let userResponse;
            let userEmail = email;
            
            // If user is not logged in, register them first
            if (!isLoggedIn) {
                userResponse = await fetch('http://localhost:9000/api/users/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: formData.fullName,
                        email: formData.email,
                        mobile: formData.mobileNumber,
                        password: formData.password
                    }),
                });

                const userData = await userResponse.json();
                
                if (!userResponse.ok) {
                    throw new Error(userData.message || 'User registration failed');
                }

                // Store email in localStorage after successful registration
                localStorage.setItem('email', formData.email);
                userEmail = formData.email;
                setEmail(formData.email);
                setIsLoggedIn(true);
            }

            // Submit seller application
            const sellerResponse = await fetch('http://localhost:9000/api/seller/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    email: userEmail,
                    status: 'pending', // Initial status for admin review
                    submissionDate: new Date().toISOString(),
                    applicationId: Date.now().toString(), // Unique identifier for the application
                }),
            });

            const sellerData = await sellerResponse.json();

            if (sellerResponse.ok) {
                toast.success('Seller application submitted successfully! Please wait for admin approval.', {
                    position: "top-center",
                    autoClose: 5000,
                });
                
                setHasExistingApplication(true);
                setApplicationStatus('pending');
                
                // Reset form
                setFormData({
                    fullName: '',
                    email: '',
                    mobileNumber: '',
                    password: '',
                    confirmPassword: '',
                    dob: '',
                    businessName: '',
                    businessType: '',
                    businessRegistrationNumber: '',
                    taxIdentificationNumber: '',
                    businessAddress: '',
                    businessContactNumber: '',
                    businessEmail: ''
                });
            } else {
                throw new Error(sellerData.message || 'Seller registration failed');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error(error.message || 'An error occurred. Please try again later.', {
                position: "top-center",
                autoClose: 5000,
            });
        }
    };

    if (hasExistingApplication) {
        return (
            <div>
                <NavBar />
                <div className="becomeseller-container">
                    <h1 className="becomeseller-title">Seller Application Status</h1>
                    <div className="application-status-container">
                        <h2>Your application is {applicationStatus}</h2>
                        {applicationStatus === 'pending' && (
                            <p>Your application is currently under review. We will notify you once it has been processed.</p>
                        )}
                        {applicationStatus === 'approved' && (
                            <p>Congratulations! Your seller account has been approved. You can now access the seller dashboard.</p>
                        )}
                        {applicationStatus === 'rejected' && (
                            <p>Unfortunately, your application was not approved at this time. You may submit a new application after 30 days.</p>
                        )}
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div>
            <NavBar />
            <div className="becomeseller-container">
                <h1 className="becomeseller-title">Apply for Seller Account</h1>
                
                <form onSubmit={handleSubmit}>
                    {/* Personal Information Section */}
                    <div className="becomeseller-section">
                        <h2 className="becomeseller-section-title">1. Personal Information</h2>
                        
                        <div className="becomeseller-form-group">
                            <label className="becomeseller-label">Full Name</label>
                            <input
                                type="text"
                                name="fullName"
                                className="becomeseller-input"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="becomeseller-form-group">
                            <label className="becomeseller-label">Email</label>
                            {isLoggedIn ? (
                                <input
                                    type="email"
                                    className="becomeseller-input"
                                    value={email}
                                    disabled
                                />
                            ) : (
                                <input
                                    type="email"
                                    name="email"
                                    className="becomeseller-input"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            )}
                        </div>

                        <div className="becomeseller-form-group">
                            <label className="becomeseller-label">Mobile Number</label>
                            <input
                                type="tel"
                                name="mobileNumber"
                                className="becomeseller-input"
                                value={formData.mobileNumber}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {!isLoggedIn && (
                            <>
                                <div className="becomeseller-form-group">
                                    <label className="becomeseller-label">Password</label>
                                    <input
                                        type="password"
                                        name="password"
                                        className="becomeseller-input"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        minLength="6"
                                    />
                                </div>

                                <div className="becomeseller-form-group">
                                    <label className="becomeseller-label">Confirm Password</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        className="becomeseller-input"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        minLength="6"
                                    />
                                </div>
                            </>
                        )}

                        <div className="becomeseller-form-group">
                            <label className="becomeseller-label">Date of Birth</label>
                            <input
                                type="date"
                                name="dob"
                                className="becomeseller-input"
                                value={formData.dob}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {/* Business Information Section */}
                    <div className="becomeseller-section">
                        <h2 className="becomeseller-section-title">2. Business Information</h2>
                        
                        <div className="becomeseller-form-group">
                            <label className="becomeseller-label">Business Name</label>
                            <input
                                type="text"
                                name="businessName"
                                className="becomeseller-input"
                                value={formData.businessName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="becomeseller-form-group">
                            <label className="becomeseller-label">Business Type</label>
                            <select
                                name="businessType"
                                className="becomeseller-input"
                                value={formData.businessType}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Business Type</option>
                                <option value="Individual">Individual</option>
                                <option value="Sole Proprietorship">Sole Proprietorship</option>
                                <option value="LLC">LLC</option>
                                <option value="Corporation">Corporation</option>
                            </select>
                        </div>

                        <div className="becomeseller-form-group">
                            <label className="becomeseller-label">Business Registration Number</label>
                            <input
                                type="text"
                                name="businessRegistrationNumber"
                                className="becomeseller-input"
                                value={formData.businessRegistrationNumber}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="becomeseller-form-group">
                            <label className="becomeseller-label">Tax Identification Number</label>
                            <input
                                type="text"
                                name="taxIdentificationNumber"
                                className="becomeseller-input"
                                value={formData.taxIdentificationNumber}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="becomeseller-form-group">
                            <label className="becomeseller-label">Business Address</label>
                            <textarea
                                name="businessAddress"
                                className="becomeseller-input"
                                value={formData.businessAddress}
                                onChange={handleChange}
                                required
                                rows="3"
                            />
                        </div>

                        <div className="becomeseller-form-group">
                            <label className="becomeseller-label">Business Contact Number</label>
                            <input
                                type="tel"
                                name="businessContactNumber"
                                className="becomeseller-input"
                                value={formData.businessContactNumber}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="becomeseller-form-group">
                            <label className="becomeseller-label">Business Email</label>
                            <input
                                type="email"
                                name="businessEmail"
                                className="becomeseller-input"
                                value={formData.businessEmail}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="becomeseller-submit-btn">
                        Submit Application
                    </button>
                </form>
            </div>
            <ToastContainer />
            <Footer />
        </div>
    );
};

export default BecomeSeller;