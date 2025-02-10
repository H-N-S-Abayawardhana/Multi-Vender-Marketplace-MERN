import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import '../css/register.css'

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
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

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
            newErrors.mobile = 'Invalid mobile number format';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
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
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
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
                toast.success('Registration successful!');
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

    return (
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
            />
            <div className="register-page-left">
                <div className="register-page-overlay"></div>
                <div className="register-page-left-content">
                    <h2>New here?</h2>
                    <p>Sign up and start shopping!</p>
                </div>
            </div>
            
            <div className="register-page-right">
                <div className="register-page-form-container">
                    <h2>Sign Up</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="register-page-form-group">
                            <input
                                type="text"
                                name="name"
                                placeholder="Name"
                                value={formData.name}
                                onChange={handleChange}
                                className={errors.name ? 'register-page-error' : ''}
                            />
                            {errors.name && <span className="register-page-error-message">{errors.name}</span>}
                        </div>

                        <div className="register-page-form-group">
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                                className={errors.email ? 'register-page-error' : ''}
                            />
                            {errors.email && <span className="register-page-error-message">{errors.email}</span>}
                        </div>

                        <div className="register-page-form-group">
                            <input
                                type="tel"
                                name="mobile"
                                placeholder="Mobile Number"
                                value={formData.mobile}
                                onChange={handleChange}
                                className={errors.mobile ? 'register-page-error' : ''}
                            />
                            {errors.mobile && <span className="register-page-error-message">{errors.mobile}</span>}
                        </div>

                        <div className="register-page-form-group register-page-password-input">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                className={errors.password ? 'register-page-error' : ''}
                            />
                            <button 
                                type="button" 
                                className="register-page-toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                            {errors.password && <span className="register-page-error-message">{errors.password}</span>}
                        </div>

                        <div className="register-page-form-group register-page-password-input">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                placeholder="Confirm Password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={errors.confirmPassword ? 'register-page-error' : ''}
                            />
                            <button 
                                type="button" 
                                className="register-page-toggle-password"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                            {errors.confirmPassword && <span className="register-page-error-message">{errors.confirmPassword}</span>}
                        </div>

                        {errors.submit && <div className="register-page-error-message register-page-submit-error">{errors.submit}</div>}

                        <button 
                            type="submit" 
                            className="register-page-submit-button"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Signing up...' : 'Sign Up'}
                        </button>
                    </form>

                    <p className="register-page-login-link">
                        Already have an account? <Link to="/login">Sign In</Link>
                    </p>
                </div>
            </div>     
        </div>
    );
};

export default Register;