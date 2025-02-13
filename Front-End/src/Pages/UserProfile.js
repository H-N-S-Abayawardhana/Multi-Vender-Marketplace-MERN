import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/userprofile.css';
import { User, Mail, Phone, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                // Get token from localStorage instead of email
                const token = localStorage.getItem('token');
                
                if (!token) {
                    setError('Please log in to view your profile');
                    setLoading(false);
                    navigate('/login');
                    return;
                }

                const response = await axios.get('http://localhost:9000/api/users/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                setUserData(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Profile fetch error:', err);
                setError(err.response?.data?.message || 'Failed to load user profile');
                setLoading(false);
                
                if (err.response?.status === 401) {
                    localStorage.clear(); // Clear all auth data
                    navigate('/login');
                }
            }
        };

        fetchUserProfile();
    }, [navigate]);

    const getUserLevel = (level) => {
        switch(level) {
            case 1: return 'Admin';
            case 2: return 'Seller';
            case 3: return 'Buyer';
            default: return 'Unknown';
        }
    };

    if (loading) {
        return (
            <div className="userprofile-container">
                <div className="userprofile-loading">Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="userprofile-container">
                <div className="userprofile-error">{error}</div>
            </div>
        );
    }

    return (
        <div className="userprofile-container">
            <div className="userprofile-card">
                <div className="userprofile-header">
                    <h1>User Profile</h1>
                    <div className="userprofile-badge">
                        {getUserLevel(userData?.userLevel)}
                    </div>
                </div>
                
                <div className="userprofile-content">
                    <div className="userprofile-field">
                        <User className="userprofile-icon" />
                        <div className="userprofile-field-content">
                            <label>Name</label>
                            <p>{userData?.name}</p>
                        </div>
                    </div>

                    <div className="userprofile-field">
                        <Mail className="userprofile-icon" />
                        <div className="userprofile-field-content">
                            <label>Email</label>
                            <p>{userData?.email}</p>
                        </div>
                    </div>

                    <div className="userprofile-field">
                        <Phone className="userprofile-icon" />
                        <div className="userprofile-field-content">
                            <label>Mobile</label>
                            <p>{userData?.mobile}</p>
                        </div>
                    </div>

                    <div className="userprofile-field">
                        <Shield className="userprofile-icon" />
                        <div className="userprofile-field-content">
                            <label>Account Type</label>
                            <p>{getUserLevel(userData?.userLevel)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;