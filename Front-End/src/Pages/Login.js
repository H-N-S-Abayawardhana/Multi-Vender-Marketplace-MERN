import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEnvelope, FaLock, FaSignInAlt } from 'react-icons/fa';
import '../css/login.css';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const cleanup = async () => {
            const sessionId = localStorage.getItem('sessionId');
            if (sessionId) {
                try {
                    await axios.post('http://localhost:9000/api/users/logout', { sessionId });
                    toast.info('Previous session cleared.', { 
                        position: 'top-center',
                        icon: '🔄' 
                    });
                } catch (error) {
                    console.error('Logout error:', error);
                }
                localStorage.clear();
            }
        };
        cleanup();
    }, []);

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
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

    const handleUserNavigation = (userLevel) => {
        switch (userLevel) {
            case 3:
                navigate('/');                
                break;
            case 2:
                navigate('/seller-dashboard');
                break;
            case 1:
                navigate('/admin-dashboard');
                break;
            default:
                toast.error('Invalid user level.', { position: 'top-center' });
                break;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast.error('Please correct the form errors', {
                position: 'top-center',
                icon: '⚠️'
            });
            return;
        }
        
        setIsLoading(true);

        try {
            const response = await axios.post('http://localhost:9000/api/users/login', formData);
            const { user, token, sessionId, expiresIn } = response.data;
            
            localStorage.setItem('loginTimestamp', new Date().getTime().toString());
            localStorage.setItem('token', token);
            localStorage.setItem('email', user.email);            
            localStorage.setItem('sessionId', sessionId);
            localStorage.setItem('userLevel', user.userLevel);
            localStorage.setItem('userData', JSON.stringify({
                id: user.id,
                name: user.name,
                email: user.email,
                userLevel: user.userLevel
            }));

            setTimeout(() => {
                handleLogout();
            }, expiresIn * 1000);

            toast.success('Login successful!', { 
                position: 'top-center',
                icon: '✅'
            });
            
            handleUserNavigation(user.userLevel);

        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
            toast.error(errorMessage, { 
                position: 'top-center',
                icon: '❌'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        const sessionId = localStorage.getItem('sessionId');
        if (sessionId) {
            try {
                await axios.post('http://localhost:9000/api/users/logout', { sessionId });
                toast.info('Logged out successfully.', { 
                    position: 'top-center',
                    icon: '👋'
                });
            } catch (error) {
                console.error('Logout error:', error);
            }
        }
        localStorage.clear();
        navigate('/login');
    };

    return (
        <>
        <NavBar/>
        <div className="login-page-container">
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
                theme="colored"
            />
            <div className="login-page-left">
                <div className="login-page-form-container">
                    <div className="login-page-form-header">
                        <h2>Welcome Back</h2>
                        <p className="login-page-form-subheader">Sign in to continue your journey</p>
                    </div>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="login-page-form-group">
                            <div className="login-page-input-wrapper">
                                <FaEnvelope className="login-page-input-icon" />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email Address"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                    className={errors.email ? 'login-page-error' : ''}
                                />
                            </div>
                            {errors.email && <span className="login-page-error-message">{errors.email}</span>}
                        </div>
                        
                        <div className="login-page-form-group">
                            <div className="login-page-input-wrapper">
                                <FaLock className="login-page-input-icon" />
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                    className={errors.password ? 'login-page-error' : ''}
                                />
                            </div>
                            {errors.password && <span className="login-page-error-message">{errors.password}</span>}
                        </div>
                        
                        <div className="login-page-forgot-password">
                            <Link to="/forgot-password">Forgot Password?</Link>
                        </div>
                        
                        <button 
                            type="submit" 
                            className="login-page-submit-button"
                            disabled={isLoading}
                        >
                            {isLoading ? 
                                'Signing in...' : 
                                <>
                                    <span>Sign In</span>
                                    <FaSignInAlt className="login-page-button-icon" />
                                </>
                            }
                        </button>
                    </form>
                    
                    <div className="login-page-divider">
                        <span>OR</span>
                    </div>
                    
                    <p className="login-page-register-link">
                        Don't have an account? <Link to="/register">Sign Up</Link>
                    </p>
                </div>
            </div>
            
            <div className="login-page-right">
                <div className="login-page-right-content">
                    <h2>Ready to Shop?</h2>
                    <p>Access your account to browse our exclusive collection.</p>
                </div>
            </div>
        </div>
        <Footer/>
        </>
    );
};

export default Login;