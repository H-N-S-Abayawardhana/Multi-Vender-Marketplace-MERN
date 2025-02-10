import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/login.css';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // Handle cleanup of previous session
        const cleanup = async () => {
            const sessionId = localStorage.getItem('sessionId');
            if (sessionId) {
                try {
                    await axios.post('http://localhost:9000/api/users/logout', { sessionId });
                } catch (error) {
                    console.error('Cleanup error:', error);
                }
                localStorage.clear();
            }
        };
        cleanup();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError('');
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
                setError('Invalid user level');
                break;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await axios.post('http://localhost:9000/api/users/login', formData);
            const { user, token, sessionId, expiresIn } = response.data;

            // Save session details
            localStorage.setItem('token', token);
            localStorage.setItem('sessionId', sessionId);
            localStorage.setItem('userLevel', user.userLevel);
            localStorage.setItem('userData', JSON.stringify({
                id: user.id,
                name: user.name,
                email: user.email,
                userLevel: user.userLevel
            }));

            // Set session timeout
            setTimeout(() => {
                handleLogout();
            }, expiresIn * 1000);

            handleUserNavigation(user.userLevel);

        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        const sessionId = localStorage.getItem('sessionId');
        if (sessionId) {
            try {
                await axios.post('http://localhost:9000/api/users/logout', { sessionId });
            } catch (error) {
                console.error('Logout error:', error);
            }
        }
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
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
                <div className="form-group">
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
                    className={isLoading ? 'loading' : ''}
                >
                    {isLoading ? 'Logging in...' : 'Login'}
                </button>
            </form>
        </div>
    );
};

export default Login;