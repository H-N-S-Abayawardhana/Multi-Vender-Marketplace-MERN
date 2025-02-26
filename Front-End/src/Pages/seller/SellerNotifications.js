import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../css/seller/selernoti.css';
import SellerNavBar from '../../components/seller/sellerNavBar';
import Footer from '../../components/Footer';

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

      const response = await axios.get(`http://localhost:9000/api/notifications/${email}`);
      
      if (response.data) {
        setNotifications(response.data);
        setError(null);
      } else {
        setNotifications([]);
      }
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
      
      // Update local state to reflect the change immediately without refetching
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification._id === id
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // Get all unread notification IDs
      const unreadIds = notifications
        .filter(notification => !notification.isRead)
        .map(notification => notification._id);
      
      if (unreadIds.length === 0) return;
      
      // Mark each notification as read
      await Promise.all(
        unreadIds.map(id => axios.put(`http://localhost:9000/api/notifications/${id}/read`))
      );
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({ ...notification, isRead: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  if (loading) {
    return (
      <>
        <SellerNavBar />
        <div className="sellnoti-loading">Loading notifications...</div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <SellerNavBar />
      <div className="sellnoti-container">
        <div className="sellnoti-header">
          <h2 className="sellnoti-title">Seller Notifications</h2>
          {notifications.some(notification => !notification.isRead) && (
            <button 
              className="sellnoti-mark-all-btn" 
              onClick={markAllAsRead}
            >
              Mark All as Read
            </button>
          )}
        </div>
        
        <div className="sellnoti-list">
          {notifications.length === 0 ? (
            <p className="sellnoti-empty">No notifications found</p>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification._id}
                className={`sellnoti-item ${!notification.isRead ? 'sellnoti-unread' : ''}`}
              >
                <div className="sellnoti-content">
                  <p className="sellnoti-message">{notification.message}</p>
                  <span className="sellnoti-date">
                    {new Date(notification.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {!notification.isRead && (
                  <button 
                    className="sellnoti-read-btn"
                    onClick={() => markAsRead(notification._id)}
                  >
                    Mark as Read
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SellerNotifications;