import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/userprofile.css';
import { User, Mail, Phone, Shield, Edit2, Save, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import SellerNavBar from '../components/seller/sellerNavBar.js';
import AdminNavBar from '../components/admin/adminNavBar.js';
import Footer from '../components/Footer';

const UserProfile = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [updateSuccess, setUpdateSuccess] = useState(false);
    const [editedData, setEditedData] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        fetchUserProfile();
    }, [navigate]);

    const fetchUserProfile = async () => {
        try {
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
            setEditedData(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Profile fetch error:', err);
            setError(err.response?.data?.message || 'Failed to load user profile');
            setLoading(false);
            
            if (err.response?.status === 401) {
                localStorage.clear();
                navigate('/login');
            }
        }
    };

    const handleUpdate = async () => {
        try {
            const token = localStorage.getItem('token');
            
            if (!token) {
                setError('Please log in to update your profile');
                navigate('/login');
                return;
            }
    
            const response = await axios.put(
                'http://localhost:9000/api/users/profile',
                editedData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
    
            setUserData(response.data);
            setIsEditing(false);
            setUpdateSuccess(true);
            
            setTimeout(() => {
                setUpdateSuccess(false);
            }, 3000);
    
            // Refetch user profile data
            fetchUserProfile();
    
        } catch (err) {
            console.error('Profile update error:', err);
            setError(err.response?.data?.message || 'Failed to update profile');
            
            if (err.response?.status === 401) {
                localStorage.clear();
                navigate('/login');
            }
        }
    };
    

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const cancelEdit = () => {
        setEditedData(userData);
        setIsEditing(false);
        setError(null);
    };

    const getUserLevel = (level) => {
        switch(level) {
            case 1: return 'Admin';
            case 2: return 'Seller';
            case 3: return 'Buyer';
            default: return 'Unknown';
        }
    };

    const renderNavBar = () => {
        const userLevel = userData?.userLevel;
        
        switch(userLevel) {
            case 1:
                return <AdminNavBar />;
            case 2:
                return <SellerNavBar />;
            case 3:
                return <NavBar />;
            default:
                return <NavBar />; // Default to regular NavBar if userLevel is undefined or invalid
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
                <div className="userprofile-error">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <>
            {renderNavBar()}
            <div className="userprofile-container">
                <div className="userprofile-card">
                    <div className="userprofile-header">
                        <h1>User Profile</h1>
                        <div className="userprofile-badge">
                            {getUserLevel(userData?.userLevel)}
                        </div>
                        {!isEditing && (
                            <button
                                className="edit-button"
                                onClick={() => setIsEditing(true)}
                            >
                                <Edit2 className="edit-icon" />
                            </button>
                        )}
                    </div>
                    
                    {updateSuccess && (
                        <div className="success-message">
                            Profile updated successfully!
                        </div>
                    )}

                    <div className="userprofile-content">
                        <div className="userprofile-field">
                            <User className="userprofile-icon" />
                            <div className="userprofile-field-content">
                                <label>Name</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="name"
                                        value={editedData.name || ''}
                                        onChange={handleInputChange}
                                        className="edit-input"
                                    />
                                ) : (
                                    <p>{userData?.name}</p>
                                )}
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
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="mobile"
                                        value={editedData.mobile || ''}
                                        onChange={handleInputChange}
                                        className="edit-input"
                                    />
                                ) : (
                                    <p>{userData?.mobile}</p>
                                )}
                            </div>
                        </div>

                        <div className="userprofile-field">
                            <Shield className="userprofile-icon" />
                            <div className="userprofile-field-content">
                                <label>Account Type</label>
                                <p>{getUserLevel(userData?.userLevel)}</p>
                            </div>
                        </div>

                        {isEditing && (
                            <div className="button-group">
                                <button
                                    className="save-button"
                                    onClick={handleUpdate}
                                >
                                    <Save className="button-icon" />
                                    Save Changes
                                </button>
                                <button
                                    className="cancel-button"
                                    onClick={cancelEdit}
                                >
                                    <X className="button-icon" />
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default UserProfile;