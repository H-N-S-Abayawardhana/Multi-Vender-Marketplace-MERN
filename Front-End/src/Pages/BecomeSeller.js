// becomeseller.js
import React, { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import '../css/becomeseller.css';

const BecomeSeller = () => {
    // Get email from localStorage
    const [email, setEmail] = useState('');
    
    useEffect(() => {
        const userEmail = localStorage.getItem('email') || '';
        setEmail(userEmail);
    }, []);

    const [formData, setFormData] = useState({
        // Personal Information
        fullName: '',
        mobileNumber: '',
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const response = await fetch('http://localhost:9000/api/seller/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    email: email
                }),
            });

            if (response.ok) {
                // Handle successful submission
                alert('Seller registration submitted successfully!');
                // Redirect or show success message
            } else {
                // Handle errors
                alert('Failed to submit seller registration');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while submitting the form');
        }
    };

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
                            <input
                                type="email"
                                className="becomeseller-input"
                                value={email}
                                disabled
                            />
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
            <Footer />
        </div>
    );
};

export default BecomeSeller;