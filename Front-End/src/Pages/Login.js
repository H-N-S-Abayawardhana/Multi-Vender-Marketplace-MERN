import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../css/login.css';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const cleanup = async () => {
            const sessionId = localStorage.getItem('sessionId');
            if (sessionId) {
                try {
                    await axios.post('http://localhost:9000/api/users/logout', { sessionId });
                    toast.info('Previous session cleared.', { position: 'top-right' });
                } catch (error) {
                    toast.error('Error clearing previous session.', { position: 'top-right' });
                }
                localStorage.clear();
            }
        };
        cleanup();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
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
                toast.error('Invalid user level.', { position: 'top-right' });
                break;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await axios.post('http://localhost:9000/api/users/login', formData);
            const { user, token, sessionId, expiresIn } = response.data;

            localStorage.setItem('token', token);
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

            toast.success('Login successful!', { position: 'top-center' });
            handleUserNavigation(user.userLevel);

        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
            toast.error(errorMessage, { position: 'top-center' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        const sessionId = localStorage.getItem('sessionId');
        if (sessionId) {
            try {
                await axios.post('http://localhost:9000/api/users/logout', { sessionId });
                toast.info('Logged out successfully.', { position: 'top-center' });
            } catch (error) {
                toast.error('Logout error.', { position: 'top-right' });
            }
        }
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div className="login-page-container">
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <div className="login-page-form-group">
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={isLoading}
                        required
                    />
                </div>
                <div className="login-page-form-group">
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        disabled={isLoading}
                        required
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={isLoading}
                    className={isLoading ? 'login-page-loading' : ''}
                >
                    {isLoading ? 'Logging in...' : 'Login'}
                </button>
            </form>
        </div>
    );
};

export default Login;
