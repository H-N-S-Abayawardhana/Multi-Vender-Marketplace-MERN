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
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    
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
            setLoading(true);
            const response = await fetch(`http://localhost:9000/api/seller/check-status/${userEmail}`);
            const data = await response.json();
            
            if (data.exists) {
                setHasExistingApplication(true);
                setApplicationStatus(data.status);
            }
        } catch (error) {
            console.error('Error checking application status:', error);
            toast.error('Unable to check application status. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const [formData, setFormData] = useState({
        // User Registration Information
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

    const validateForm = (step) => {
        if (step === 1) {
            if (!formData.fullName.trim()) {
                toast.error('Please enter your full name');
                return false;
            }
            
            if (!isLoggedIn) {
                if (!formData.email || !/^\S+@\S+\.\S+$/.test(formData.email)) {
                    toast.error('Please enter a valid email address');
                    return false;
                }
                
                if (!formData.mobileNumber.trim()) {
                    toast.error('Please enter your mobile number');
                    return false;
                }
                
                if (formData.password.length < 6) {
                    toast.error('Password must be at least 6 characters long');
                    return false;
                }
                
                if (formData.password !== formData.confirmPassword) {
                    toast.error('Passwords do not match');
                    return false;
                }
            }
            
            if (!formData.dob) {
                toast.error('Please enter your date of birth');
                return false;
            }
            
            return true;
        }
        
        if (step === 2) {
            if (!formData.businessName.trim()) {
                toast.error('Please enter your business name');
                return false;
            }
            
            if (!formData.businessType) {
                toast.error('Please select your business type');
                return false;
            }
            
            if (!formData.businessRegistrationNumber.trim()) {
                toast.error('Please enter your business registration number');
                return false;
            }
            
            if (!formData.taxIdentificationNumber.trim()) {
                toast.error('Please enter your tax identification number');
                return false;
            }
            
            if (!formData.businessAddress.trim()) {
                toast.error('Please enter your business address');
                return false;
            }
            
            if (!formData.businessContactNumber.trim()) {
                toast.error('Please enter your business contact number');
                return false;
            }
            
            if (!formData.businessEmail || !/^\S+@\S+\.\S+$/.test(formData.businessEmail)) {
                toast.error('Please enter a valid business email address');
                return false;
            }
            
            return true;
        }
        
        return true;
    };

    const nextStep = () => {
        if (validateForm(currentStep)) {
            setCurrentStep(currentStep + 1);
            window.scrollTo(0, 0);
        }
    };

    const prevStep = () => {
        setCurrentStep(currentStep - 1);
        window.scrollTo(0, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm(currentStep)) return;

        try {
            setLoading(true);
            let userResponse;
            let userEmail = email;
            
            // If user is not logged in, register users first
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
                toast.success('Application submitted successfully! We will review your information and notify you of the decision.', {
                    position: "top-center",
                    autoClose: 5000,
                });
                
                setHasExistingApplication(true);
                setApplicationStatus('pending');
                
                // Reset form and go to step 1
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
                setCurrentStep(1);
            } else {
                throw new Error(sellerData.message || 'Seller registration failed');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error(error.message || 'An error occurred. Please try again later.', {
                position: "top-center",
                autoClose: 5000,
            });
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = () => {
        switch(applicationStatus) {
            case 'approved': return 'becomeseller-status-approved';
            case 'rejected': return 'becomeseller-status-rejected';
            default: return 'becomeseller-status-pending';
        }
    };

    if (loading) {
        return (
            <div>
                <NavBar />
                <div className="becomeseller-container">
                    <div className="becomeseller-loading">
                        <div className="becomeseller-spinner"></div>
                        <p>Loading, please wait...</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (hasExistingApplication) {
        return (
            <div>
                <NavBar />
                <div className="becomeseller-container">
                    <div className="becomeseller-status-card">
                        <div className={`becomeseller-status-header ${getStatusColor()}`}>
                            <h1 className="becomeseller-title">Seller Application Status</h1>
                            <div className="becomeseller-status-badge">
                                {applicationStatus.toUpperCase()}
                            </div>
                        </div>
                        
                        <div className="becomeseller-status-body">
                            {applicationStatus === 'pending' && (
                                <div className="becomeseller-status-message">
                                    <div className="becomeseller-status-icon pending">
                                        <i className="fas fa-clock"></i>
                                    </div>
                                    <div className="becomeseller-status-content">
                                        <h2>Under Review</h2>
                                        <p>Your application is currently being reviewed by our team. This process typically takes 1-3 business days. We'll notify you via email once a decision has been made.</p>
                                        <div className="becomeseller-info-box">
                                            <p>If you have any questions regarding your application, please contact our seller support team at <a href="mailto:seller-support@example.com">seller-support@example.com</a></p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {applicationStatus === 'approved' && (
                                <div className="becomeseller-status-message">
                                    <div className="becomeseller-status-icon approved">
                                        <i className="fas fa-check-circle"></i>
                                    </div>
                                    <div className="becomeseller-status-content">
                                        <h2>Congratulations!</h2>
                                        <p>Your seller account has been approved. You can now access the seller dashboard and start listing your products.</p>
                                        <button className="becomeseller-dashboard-btn">
                                            Go to Seller Dashboard
                                        </button>
                                    </div>
                                </div>
                            )}
                            
                            {applicationStatus === 'rejected' && (
                                <div className="becomeseller-status-message">
                                    <div className="becomeseller-status-icon rejected">
                                        <i className="fas fa-times-circle"></i>
                                    </div>
                                    <div className="becomeseller-status-content">
                                        <h2>Application Not Approved</h2>
                                        <p>Unfortunately, your application was not approved at this time. This could be due to incomplete information or not meeting our eligibility criteria.</p>
                                        <div className="becomeseller-info-box">
                                            <p>You may submit a new application after 30 days. For more information about why your application was rejected, please contact our seller support team.</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
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
                <div className="becomeseller-header">
                    <h1 className="becomeseller-title">Become a Seller</h1>
                    <p className="becomeseller-subtitle">Join our marketplace and start selling your products to millions of customers</p>
                </div>
                
                <div className="becomeseller-progress">
                    <div className={`becomeseller-progress-step ${currentStep >= 1 ? 'active' : ''}`}>
                        <div className="becomeseller-progress-number">1</div>
                        <div className="becomeseller-progress-label">Personal Information</div>
                    </div>
                    <div className="becomeseller-progress-line"></div>
                    <div className={`becomeseller-progress-step ${currentStep >= 2 ? 'active' : ''}`}>
                        <div className="becomeseller-progress-number">2</div>
                        <div className="becomeseller-progress-label">Business Information</div>
                    </div>
                    <div className="becomeseller-progress-line"></div>
                    <div className={`becomeseller-progress-step ${currentStep >= 3 ? 'active' : ''}`}>
                        <div className="becomeseller-progress-number">3</div>
                        <div className="becomeseller-progress-label">Review & Submit</div>
                    </div>
                </div>
                
                <form onSubmit={handleSubmit}>
                    {/* Step 1: Personal Information */}
                    {currentStep === 1 && (
                        <div className="becomeseller-section becomeseller-section-active">
                            <h2 className="becomeseller-section-title">
                                <span className="becomeseller-section-number">1</span>
                                Personal Information
                            </h2>
                            
                            <div className="becomeseller-form-row">
                                <div className="becomeseller-form-group">
                                    <label className="becomeseller-label">Full Name <span className="becomeseller-required">*</span></label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        className="becomeseller-input"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        placeholder="Enter your full name"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="becomeseller-form-row">
                                <div className="becomeseller-form-group">
                                    <label className="becomeseller-label">Email <span className="becomeseller-required">*</span></label>
                                    {isLoggedIn ? (
                                        <div className="becomeseller-input-with-icon">
                                            <input
                                                type="email"
                                                className="becomeseller-input"
                                                value={email}
                                                disabled
                                            />
                                            <span className="becomeseller-input-icon">
                                                <i className="fas fa-lock"></i>
                                            </span>
                                        </div>
                                    ) : (
                                        <input
                                            type="email"
                                            name="email"
                                            className="becomeseller-input"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="Enter your email address"
                                            required
                                        />
                                    )}
                                </div>

                                <div className="becomeseller-form-group">
                                    <label className="becomeseller-label">Mobile Number <span className="becomeseller-required">*</span></label>
                                    <input
                                        type="tel"
                                        name="mobileNumber"
                                        className="becomeseller-input"
                                        value={formData.mobileNumber}
                                        onChange={handleChange}
                                        placeholder="Enter your mobile number"
                                        required
                                    />
                                </div>
                            </div>

                            {!isLoggedIn && (
                                <div className="becomeseller-form-row">
                                    <div className="becomeseller-form-group">
                                        <label className="becomeseller-label">Password <span className="becomeseller-required">*</span></label>
                                        <input
                                            type="password"
                                            name="password"
                                            className="becomeseller-input"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="Create a password (min. 6 characters)"
                                            required
                                            minLength="6"
                                        />
                                        <span className="becomeseller-input-hint">Must be at least 6 characters long</span>
                                    </div>

                                    <div className="becomeseller-form-group">
                                        <label className="becomeseller-label">Confirm Password <span className="becomeseller-required">*</span></label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            className="becomeseller-input"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="Confirm your password"
                                            required
                                            minLength="6"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="becomeseller-form-row">
                                <div className="becomeseller-form-group">
                                    <label className="becomeseller-label">Date of Birth <span className="becomeseller-required">*</span></label>
                                    <input
                                        type="date"
                                        name="dob"
                                        className="becomeseller-input"
                                        value={formData.dob}
                                        onChange={handleChange}
                                        required
                                    />
                                    <span className="becomeseller-input-hint">You must be at least 18 years old</span>
                                </div>
                            </div>

                            <div className="becomeseller-button-group">
                                <button type="button" className="becomeseller-next-btn" onClick={nextStep}>
                                    Next Step <i className="fas fa-arrow-right"></i>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Business Information */}
                    {currentStep === 2 && (
                        <div className="becomeseller-section becomeseller-section-active">
                            <h2 className="becomeseller-section-title">
                                <span className="becomeseller-section-number">2</span>
                                Business Information
                            </h2>
                            
                            <div className="becomeseller-form-row">
                                <div className="becomeseller-form-group">
                                    <label className="becomeseller-label">Business Name <span className="becomeseller-required">*</span></label>
                                    <input
                                        type="text"
                                        name="businessName"
                                        className="becomeseller-input"
                                        value={formData.businessName}
                                        onChange={handleChange}
                                        placeholder="Enter your business name"
                                        required
                                    />
                                </div>

                                <div className="becomeseller-form-group">
                                    <label className="becomeseller-label">Business Type <span className="becomeseller-required">*</span></label>
                                    <select
                                        name="businessType"
                                        className="becomeseller-input becomeseller-select"
                                        value={formData.businessType}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select Business Type</option>
                                        <option value="Individual">Individual</option>
                                        <option value="Sole Proprietorship">Sole Proprietorship</option>
                                        <option value="LLC">LLC</option>
                                        <option value="Corporation">Corporation</option>
                                        <option value="Partnership">Partnership</option>
                                    </select>
                                </div>
                            </div>

                            <div className="becomeseller-form-row">
                                <div className="becomeseller-form-group">
                                    <label className="becomeseller-label">Business Registration Number <span className="becomeseller-required">*</span></label>
                                    <input
                                        type="text"
                                        name="businessRegistrationNumber"
                                        className="becomeseller-input"
                                        value={formData.businessRegistrationNumber}
                                        onChange={handleChange}
                                        placeholder="Enter registration number"
                                        required
                                    />
                                </div>

                                <div className="becomeseller-form-group">
                                    <label className="becomeseller-label">Tax Identification Number <span className="becomeseller-required">*</span></label>
                                    <input
                                        type="text"
                                        name="taxIdentificationNumber"
                                        className="becomeseller-input"
                                        value={formData.taxIdentificationNumber}
                                        onChange={handleChange}
                                        placeholder="Enter tax ID number"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="becomeseller-form-group">
                                <label className="becomeseller-label">Business Address <span className="becomeseller-required">*</span></label>
                                <textarea
                                    name="businessAddress"
                                    className="becomeseller-input becomeseller-textarea"
                                    value={formData.businessAddress}
                                    onChange={handleChange}
                                    placeholder="Enter your complete business address"
                                    required
                                    rows="3"
                                />
                            </div>

                            <div className="becomeseller-form-row">
                                <div className="becomeseller-form-group">
                                    <label className="becomeseller-label">Business Contact Number <span className="becomeseller-required">*</span></label>
                                    <input
                                        type="tel"
                                        name="businessContactNumber"
                                        className="becomeseller-input"
                                        value={formData.businessContactNumber}
                                        onChange={handleChange}
                                        placeholder="Enter business phone number"
                                        required
                                    />
                                </div>

                                <div className="becomeseller-form-group">
                                    <label className="becomeseller-label">Business Email <span className="becomeseller-required">*</span></label>
                                    <input
                                        type="email"
                                        name="businessEmail"
                                        className="becomeseller-input"
                                        value={formData.businessEmail}
                                        onChange={handleChange}
                                        placeholder="Enter business email"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="becomeseller-button-group">
                                <button type="button" className="becomeseller-back-btn" onClick={prevStep}>
                                    <i className="fas fa-arrow-left"></i> Previous
                                </button>
                                <button type="button" className="becomeseller-next-btn" onClick={nextStep}>
                                    Next Step <i className="fas fa-arrow-right"></i>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Review & Submit */}
                    {currentStep === 3 && (
                        <div className="becomeseller-section becomeseller-section-active">
                            <h2 className="becomeseller-section-title">
                                <span className="becomeseller-section-number">3</span>
                                Review & Submit
                            </h2>
                            
                            <div className="becomeseller-review-section">
                                <h3 className="becomeseller-review-title">Personal Information</h3>
                                <div className="becomeseller-review-grid">
                                    <div className="becomeseller-review-item">
                                        <div className="becomeseller-review-label">Full Name:</div>
                                        <div className="becomeseller-review-value">{formData.fullName}</div>
                                    </div>
                                    
                                    <div className="becomeseller-review-item">
                                        <div className="becomeseller-review-label">Email:</div>
                                        <div className="becomeseller-review-value">{isLoggedIn ? email : formData.email}</div>
                                    </div>
                                    
                                    <div className="becomeseller-review-item">
                                        <div className="becomeseller-review-label">Mobile Number:</div>
                                        <div className="becomeseller-review-value">{formData.mobileNumber}</div>
                                    </div>
                                    
                                    <div className="becomeseller-review-item">
                                        <div className="becomeseller-review-label">Date of Birth:</div>
                                        <div className="becomeseller-review-value">{formData.dob}</div>
                                    </div>
                                </div>
                                
                                <button type="button" className="becomeseller-edit-btn" onClick={() => setCurrentStep(1)}>
                                    <i className="fas fa-edit"></i> Edit
                                </button>
                            </div>
                            
                            <div className="becomeseller-review-section">
                                <h3 className="becomeseller-review-title">Business Information</h3>
                                <div className="becomeseller-review-grid">
                                    <div className="becomeseller-review-item">
                                        <div className="becomeseller-review-label">Business Name:</div>
                                        <div className="becomeseller-review-value">{formData.businessName}</div>
                                    </div>
                                    
                                    <div className="becomeseller-review-item">
                                        <div className="becomeseller-review-label">Business Type:</div>
                                        <div className="becomeseller-review-value">{formData.businessType}</div>
                                    </div>
                                    
                                    <div className="becomeseller-review-item">
                                        <div className="becomeseller-review-label">Registration Number:</div>
                                        <div className="becomeseller-review-value">{formData.businessRegistrationNumber}</div>
                                    </div>
                                    
                                    <div className="becomeseller-review-item">
                                        <div className="becomeseller-review-label">Tax ID Number:</div>
                                        <div className="becomeseller-review-value">{formData.taxIdentificationNumber}</div>
                                    </div>
                                    
                                    <div className="becomeseller-review-item">
                                        <div className="becomeseller-review-label">Business Address:</div>
                                        <div className="becomeseller-review-value">{formData.businessAddress}</div>
                                    </div>
                                    
                                    <div className="becomeseller-review-item">
                                        <div className="becomeseller-review-label">Business Contact:</div>
                                        <div className="becomeseller-review-value">{formData.businessContactNumber}</div>
                                    </div>
                                    
                                    <div className="becomeseller-review-item">
                                        <div className="becomeseller-review-label">Business Email:</div>
                                        <div className="becomeseller-review-value">{formData.businessEmail}</div>
                                    </div>
                                </div>
                                
                                <button type="button" className="becomeseller-edit-btn" onClick={() => setCurrentStep(2)}>
                                    <i className="fas fa-edit"></i> Edit
                                </button>
                            </div>
                            
                            <div className="becomeseller-agreement">
                                <label className="becomeseller-checkbox-container">
                                    <input type="checkbox" required />
                                    <span className="becomeseller-checkmark"></span>
                                    <span className="becomeseller-agreement-text">
                                        I confirm that all the information provided is accurate and complete. I have read and agree to the <a href="#" className="becomeseller-link">Terms & Conditions</a> and <a href="#" className="becomeseller-link">Seller Agreement</a>.
                                    </span>
                                </label>
                            </div>

                            <div className="becomeseller-button-group">
                                <button type="button" className="becomeseller-back-btn" onClick={prevStep}>
                                    <i className="fas fa-arrow-left"></i> Previous
                                </button>
                                <button type="submit" className="becomeseller-submit-btn">
                                    Submit Application
                                </button>
                            </div>
                        </div>
                    )}
                </form>
                
                <div className="becomeseller-benefits">
                    <h3 className="becomeseller-benefits-title">Benefits of Becoming a Seller</h3>
                    <div className="becomeseller-benefits-grid">
                        <div className="becomeseller-benefit-card">
                            <div className="becomeseller-benefit-icon">
                                <i className="fas fa-globe"></i>
                            </div>
                            <h4>Reach Millions</h4>
                            <p>Access our global customer base and expand your market reach</p>
                        </div>
                        
                        <div className="becomeseller-benefit-card">
                            <div className="becomeseller-benefit-icon">
                                <i className="fas fa-chart-line"></i>
                            </div>
                            <h4>Grow Revenue</h4>
                            <p>Increase your sales through our marketing and promotional efforts</p>
                        </div>
                        
                        <div className="becomeseller-benefit-card">
                            <div className="becomeseller-benefit-icon">
                                <i className="fas fa-truck"></i>
                            </div>
                            <h4>Easy Logistics</h4>
                            <p>Utilize our fulfillment network for efficient order processing</p>
                        </div>
                        
                        <div className="becomeseller-benefit-card">
                            <div className="becomeseller-benefit-icon">
                                <i className="fas fa-headset"></i>
                            </div>
                            <h4>Dedicated Support</h4>
                            <p>Get personalized assistance from our seller support team</p>
                        </div>
                    </div>
                </div>
            </div>
            <ToastContainer />
            <Footer />
        </div>
    );
};

export default BecomeSeller;