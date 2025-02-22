// frontend/src/pages/SellerNotifications.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../css/seller/selernoti.css';

const SellerNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const email = localStorage.getItem('email');
      
      if (!email) {
        setError('No email found in storage');
        setLoading(false);
        return;
      }

      console.log('Fetching notifications for:', email); // Debug log
      const response = await axios.get(`http://localhost:9000/api/notifications/${email}`);
      console.log('Notifications response:', response.data); // Debug log
      
      setNotifications(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`http://localhost:9000/api/notifications/${id}/read`);
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  if (loading) {
    return <div className="sellnoti-loading">Loading notifications...</div>;
  }

  if (error) {
    return <div className="sellnoti-error">{error}</div>;
  }

  return (
    <div className="sellnoti-container">
      <h2 className="sellnoti-title">Seller Notifications</h2>
      <div className="sellnoti-list">
        {notifications.length === 0 ? (
          <p className="sellnoti-empty">No notifications found</p>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification._id}
              className={`sellnoti-item ${!notification.isRead ? 'sellnoti-unread' : ''}`}
              onClick={() => markAsRead(notification._id)}
            >
              <p className="sellnoti-message">{notification.message}</p>
              <span className="sellnoti-date">
                {new Date(notification.createdAt).toLocaleDateString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SellerNotifications;