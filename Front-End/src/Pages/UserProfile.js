import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/userprofile.css';
import { User, Mail, Phone, Shield, Edit2, Save, X, Calendar, AlertCircle, CheckCircle, Loader } from 'lucide-react';
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
    const [isSubmitting, setIsSubmitting] = useState(false);
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
            setIsSubmitting(true);
            setError(null);
            
            const token = localStorage.getItem('token');
            
            if (!token) {
                setError('Please log in to update your profile');
                setIsSubmitting(false);
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
            setIsSubmitting(false);
            
            setTimeout(() => {
                setUpdateSuccess(false);
            }, 3000);
    
            // Refetch user profile data
            fetchUserProfile();
    
        } catch (err) {
            console.error('Profile update error:', err);
            setError(err.response?.data?.message || 'Failed to update profile');
            setIsSubmitting(false);
            
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

    const getUserLevelColor = (level) => {
        switch(level) {
            case 1: return 'admin';
            case 2: return 'seller';
            case 3: return 'buyer';
            default: return 'default';
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

    const formatDate = (dateString) => {
        if (!dateString) return 'Not available';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    if (loading) {
        return (
            <>
                {renderNavBar()}
                <div className="userprofile-container">
                    <div className="userprofile-loading">
                        <Loader className="loading-spinner" size={40} />
                        <p>Loading your profile...</p>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (error) {
        return (
            <>
                {renderNavBar()}
                <div className="userprofile-container">
                    <div className="userprofile-error">
                        <AlertCircle size={24} />
                        <p>{error}</p>
                        <button 
                            className="retry-button"
                            onClick={fetchUserProfile}
                        >
                            Try Again
                        </button>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            {renderNavBar()}
            <div className="userprofile-container">
                <div className="userprofile-card">
                    <div className="userprofile-header">
                        <div className="userprofile-title-area">
                            <h1>User Profile</h1>
                            <div className={`userprofile-badge ${getUserLevelColor(userData?.userLevel)}`}>
                                {getUserLevel(userData?.userLevel)}
                            </div>
                        </div>
                        {!isEditing && (
                            <button
                                className="edit-button"
                                onClick={() => setIsEditing(true)}
                                aria-label="Edit profile"
                            >
                                <Edit2 className="edit-icon" />
                                <span>Edit</span>
                            </button>
                        )}
                    </div>
                    
                    {updateSuccess && (
                        <div className="success-message">
                            <CheckCircle size={20} />
                            Profile updated successfully!
                        </div>
                    )}

                    {error && isEditing && (
                        <div className="error-message">
                            <AlertCircle size={20} />
                            {error}
                        </div>
                    )}

                    <div className="userprofile-content">
                        <div className="userprofile-user-initial">
                            {userData?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>

                        <div className="userprofile-fields-container">
                            <div className="userprofile-field">
                                <User className="userprofile-icon" />
                                <div className="userprofile-field-content">
                                    <label>Full Name</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="name"
                                            value={editedData.name || ''}
                                            onChange={handleInputChange}
                                            className="edit-input"
                                            placeholder="Enter your full name"
                                        />
                                    ) : (
                                        <p>{userData?.name || 'Not set'}</p>
                                    )}
                                </div>
                            </div>

                            <div className="userprofile-field">
                                <Mail className="userprofile-icon" />
                                <div className="userprofile-field-content">
                                    <label>Email Address</label>
                                    <p className="email-value">{userData?.email}</p>
                                </div>
                            </div>

                            <div className="userprofile-field">
                                <Phone className="userprofile-icon" />
                                <div className="userprofile-field-content">
                                    <label>Mobile Number</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="mobile"
                                            value={editedData.mobile || ''}
                                            onChange={handleInputChange}
                                            className="edit-input"
                                            placeholder="Enter your mobile number"
                                        />
                                    ) : (
                                        <p>{userData?.mobile || 'Not set'}</p>
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

                            <div className="userprofile-field">
                                <Calendar className="userprofile-icon" />
                                <div className="userprofile-field-content">
                                    <label>Member Since</label>
                                    <p>{formatDate(userData?.createdAt)}</p>
                                </div>
                            </div>
                        </div>

                        {isEditing && (
                            <div className="button-group">
                                <button
                                    className="save-button"
                                    onClick={handleUpdate}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader className="button-icon spin" size={18} />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="button-icon" size={18} />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                                <button
                                    className="cancel-button"
                                    onClick={cancelEdit}
                                    disabled={isSubmitting}
                                >
                                    <X className="button-icon" size={18} />
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