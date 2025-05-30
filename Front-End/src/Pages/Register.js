import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { FaEye, FaEyeSlash, FaUser, FaEnvelope, FaMobile, FaLock, FaCheck } from 'react-icons/fa';
import '../css/register.css';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile: '',
        password: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState({
        score: 0,
        message: ''
    });

    useEffect(() => {
        if (formData.password) {
            checkPasswordStrength(formData.password);
        }
    }, [formData.password]);

    const checkPasswordStrength = (password) => {
        let score = 0;
        let message = '';

        if (password.length >= 8) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/[a-z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^A-Za-z0-9]/.test(password)) score += 1;

        switch (score) {
            case 0:
            case 1:
                message = 'Weak';
                break;
            case 2:
            case 3:
                message = 'Medium';
                break;
            case 4:
            case 5:
                message = 'Strong';
                break;
            default:
                message = '';
        }

        setPasswordStrength({ score, message });
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        } else if (formData.name.length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!formData.mobile) {
            newErrors.mobile = 'Mobile number is required';
        } else if (!/^\d{10}$/.test(formData.mobile)) {
            newErrors.mobile = 'Mobile number must be 10 digits';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        } else if (passwordStrength.score < 3) {
            newErrors.password = 'Please choose a stronger password';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error on change
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleBlur = (e) => {
        const { name } = e.target;
        setTouched(prev => ({
            ...prev,
            [name]: true
        }));
        
        // Validate single field on blur
        validateField(name);
    };

    const validateField = (fieldName) => {
        const newErrors = { ...errors };
        
        switch (fieldName) {
            case 'name':
                if (!formData.name.trim()) {
                    newErrors.name = 'Name is required';
                } else if (formData.name.length < 2) {
                    newErrors.name = 'Name must be at least 2 characters';
                } else {
                    delete newErrors.name;
                }
                break;
                
            case 'email':
                if (!formData.email) {
                    newErrors.email = 'Email is required';
                } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
                    newErrors.email = 'Invalid email format';
                } else {
                    delete newErrors.email;
                }
                break;
                
            case 'mobile':
                if (!formData.mobile) {
                    newErrors.mobile = 'Mobile number is required';
                } else if (!/^\d{10}$/.test(formData.mobile)) {
                    newErrors.mobile = 'Mobile number must be 10 digits';
                } else {
                    delete newErrors.mobile;
                }
                break;
                
            case 'password':
                if (!formData.password) {
                    newErrors.password = 'Password is required';
                } else if (formData.password.length < 6) {
                    newErrors.password = 'Password must be at least 6 characters';
                } else if (passwordStrength.score < 3) {
                    newErrors.password = 'Please choose a stronger password';
                } else {
                    delete newErrors.password;
                }
                
                // Also validate confirm password if it has been entered
                if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
                    newErrors.confirmPassword = 'Passwords do not match';
                } else if (formData.confirmPassword) {
                    delete newErrors.confirmPassword;
                }
                break;
                
            case 'confirmPassword':
                if (!formData.confirmPassword) {
                    newErrors.confirmPassword = 'Please confirm your password';
                } else if (formData.password !== formData.confirmPassword) {
                    newErrors.confirmPassword = 'Passwords do not match';
                } else {
                    delete newErrors.confirmPassword;
                }
                break;
                
            default:
                break;
        }
        
        setErrors(newErrors);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.error('Please correct the form errors');
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post('http://localhost:9000/api/users/register', {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                mobile: formData.mobile
            });
            
            if (response.data) {
                toast.success('Registration successful! Redirecting to login...');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Registration failed. Please try again.';
            toast.error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const getPasswordStrengthBarClass = () => {
        switch (passwordStrength.score) {
            case 0: return 'register-page-password-strength-bar-empty';
            case 1: case 2: return 'register-page-password-strength-bar-weak';
            case 3: case 4: return 'register-page-password-strength-bar-medium';
            case 5: return 'register-page-password-strength-bar-strong';
            default: return 'register-page-password-strength-bar-empty';
        }
    };

    return (
        <>
        <NavBar/>
        <div className="register-page-container">
            <ToastContainer 
                position="top-center"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                className="register-page-toast"
            />
            <div className="register-page-left">
                <div className="register-page-overlay"></div>
                <div className="register-page-left-content">
                    <h2>Welcome to Our Store</h2>
                    <p>Create an account to start your shopping journey</p>
                    <div className="register-page-benefits">
                        <div className="register-page-benefit-item">
                            <FaCheck /> Fast Checkout
                        </div>
                        <div className="register-page-benefit-item">
                            <FaCheck /> Order Tracking
                        </div>
                        <div className="register-page-benefit-item">
                            <FaCheck /> Exclusive Deals
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="register-page-right">
                <div className="register-page-form-container">
                    <h2>Create Account</h2>
                    <p className="register-page-form-subtitle">Please fill in the details below</p>
                    
                    <form onSubmit={handleSubmit} noValidate>
                        <div className="register-page-form-group">
                            <div className="register-page-input-with-icon">
                                <FaUser className="register-page-input-icon" />
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Full Name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={touched.name && errors.name ? 'register-page-error' : ''}
                                    aria-label="Full Name"
                                />
                            </div>
                            {touched.name && errors.name && <span className="register-page-error-message">{errors.name}</span>}
                        </div>

                        <div className="register-page-form-group">
                            <div className="register-page-input-with-icon">
                                <FaEnvelope className="register-page-input-icon" />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email Address"
                                    value={formData.email}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={touched.email && errors.email ? 'register-page-error' : ''}
                                    aria-label="Email Address"
                                />
                            </div>
                            {touched.email && errors.email && <span className="register-page-error-message">{errors.email}</span>}
                        </div>

                        <div className="register-page-form-group">
                            <div className="register-page-input-with-icon">
                                <FaMobile className="register-page-input-icon" />
                                <input
                                    type="tel"
                                    name="mobile"
                                    placeholder="Mobile Number"
                                    value={formData.mobile}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={touched.mobile && errors.mobile ? 'register-page-error' : ''}
                                    aria-label="Mobile Number"
                                    maxLength="10"
                                />
                            </div>
                            {touched.mobile && errors.mobile && <span className="register-page-error-message">{errors.mobile}</span>}
                        </div>

                        <div className="register-page-form-group">
                            <div className="register-page-input-with-icon register-page-password-input">
                                <FaLock className="register-page-input-icon" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={touched.password && errors.password ? 'register-page-error' : ''}
                                    aria-label="Password"
                                />
                                <button 
                                    type="button" 
                                    className="register-page-toggle-password"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                            {formData.password && (
                                <div className="register-page-password-strength">
                                    <div className="register-page-password-strength-bar">
                                        <div 
                                            className={`register-page-password-strength-bar-fill ${getPasswordStrengthBarClass()}`}
                                            style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                                        ></div>
                                    </div>
                                    <span className="register-page-password-strength-text">
                                        {passwordStrength.message}
                                    </span>
                                </div>
                            )}
                            {touched.password && errors.password && <span className="register-page-error-message">{errors.password}</span>}
                            {!errors.password && formData.password && (
                                <div className="register-page-password-hints">
                                    <p>Password should contain:</p>
                                    <ul>
                                        <li className={formData.password.length >= 8 ? 'valid' : ''}>
                                            At least 8 characters
                                        </li>
                                        <li className={/[A-Z]/.test(formData.password) ? 'valid' : ''}>
                                            Uppercase letter
                                        </li>
                                        <li className={/[0-9]/.test(formData.password) ? 'valid' : ''}>
                                            Number
                                        </li>
                                        <li className={/[^A-Za-z0-9]/.test(formData.password) ? 'valid' : ''}>
                                            Special character
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div className="register-page-form-group">
                            <div className="register-page-input-with-icon register-page-password-input">
                                <FaLock className="register-page-input-icon" />
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    placeholder="Confirm Password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={touched.confirmPassword && errors.confirmPassword ? 'register-page-error' : ''}
                                    aria-label="Confirm Password"
                                />
                                <button 
                                    type="button" 
                                    className="register-page-toggle-password"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                >
                                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                            {touched.confirmPassword && errors.confirmPassword && 
                                <span className="register-page-error-message">{errors.confirmPassword}</span>
                            }
                        </div>

                        <div className="register-page-terms">
                            <p>By creating an account, you agree to our <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a></p>
                        </div>

                        <button 
                            type="submit" 
                            className="register-page-submit-button"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="register-page-loading-spinner">
                                    <span className="register-page-loading-spinner-inner"></span>
                                    <span>Creating Account...</span>
                                </span>
                            ) : 'Create Account'}
                        </button>
                    </form>

                    <p className="register-page-login-link">
                        Already have an account? <Link to="/login">Sign In</Link>
                    </p>
                </div>
            </div>     
        </div>
        <Footer/>
        </>
    );
};

export default Register;