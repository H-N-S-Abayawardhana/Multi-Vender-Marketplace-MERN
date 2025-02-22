import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../css/admin/adminnotification.css';
import AdminNavBar from '../../components/admin/adminNavBar';
import Footer from '../../components/Footer';

const AdminNotificationPage = () => {
    const [notifications, setNotifications] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await axios.get('http://localhost:9000/api/notifications');
            setNotifications(response.data.data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            await axios.put(`http://localhost:9000/api/notifications/${notificationId}/mark-read`);
            fetchNotifications();
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await axios.put('http://localhost:9000/api/notifications/mark-all-read');
            fetchNotifications();
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    const handleViewMore = (notification) => {
        if (notification.type === 'seller_request') {
            navigate(`/seller-requests`);
        }
    };

    return (
        <>
        <AdminNavBar/>
        <div className="admin-notification-container">
            <div className="notification-header">
                <h1>Notifications</h1>
                <button 
                    className="mark-all-read-btn"
                    onClick={handleMarkAllAsRead}
                >
                    Mark All as Read
                </button>
            </div>

            <div className="notifications-list">
                {notifications.map((notification) => (
                    <div 
                        key={notification._id}
                        className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
                    >
                        <div className="notification-content">
                            <h3>{notification.title}</h3>
                            <p>{notification.message}</p>
                            <span className="notification-time">
                                {new Date(notification.createdAt).toLocaleString()}
                            </span>
                        </div>
                        <div className="notification-actions">
                            <button 
                                className="view-more-btn"
                                onClick={() => handleViewMore(notification)}
                            >
                                View More
                            </button>
                            {!notification.isRead && (
                                <button 
                                    className="mark-read-btn"
                                    onClick={() => handleMarkAsRead(notification._id)}
                                >
                                    Mark as Read
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
          <Footer/>      
        </>
    );
};

export default AdminNotificationPage;