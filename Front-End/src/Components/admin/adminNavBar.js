import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaBell } from 'react-icons/fa';
import axios from 'axios';
import Swal from 'sweetalert2';
import logo from '../../assets/images/logo.png';

const AdminNavBar = () => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread notifications count
  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get('http://localhost:9000/api/notifications');
      const unreadNotifications = response.data.data.filter(notification => !notification.isRead);
      setUnreadCount(unreadNotifications.length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Fetch count when component mounts and set up interval
  useEffect(() => {
    fetchUnreadCount();
    
    // Set up polling interval to check for new notifications
    const interval = setInterval(fetchUnreadCount, 30000); // Check every 30 seconds
    
    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  const handleNotificationClick = (e) => {
    e.preventDefault();
    navigate('/admin-notifications');
  };

  const handleLogout = async () => {
    try {
      const sessionId = localStorage.getItem('sessionId');
      
      const response = await fetch('http://localhost:9000/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });

      if (response.ok) {
        localStorage.clear();
        
        Swal.fire({
          title: 'Logged Out!',
          text: 'You have been successfully logged out',
          icon: 'success',
          confirmButtonColor: '#3085d6',
          timer: 1500
        });

        navigate('/');
      } else {
        throw new Error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to logout. Please try again.',
        icon: 'error',
        confirmButtonColor: '#3085d6'
      });
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
      <div className="container">
        <Link className="navbar-brand" to="/admin">
          <img 
            src={logo} 
            alt="Admin Dashboard Logo" 
            height="40"
            className="d-inline-block align-top"
          />
        </Link>

        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-center">
            <li className="nav-item mx-3">
              <Link className="nav-link d-flex align-items-center" to="/admin-dashboard">
                Dashboard
              </Link>
            </li>

            <li className="nav-item mx-3">
              <Link 
                to="/admin-notifications"
                className="nav-link position-relative"
                onClick={handleNotificationClick}
              >
                <FaBell size={20} />
                {unreadCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {unreadCount}
                    <span className="visually-hidden">unread notifications</span>
                  </span>
                )}
              </Link>
            </li>

            <li className="nav-item dropdown mx-3">
              <a 
                className="nav-link dropdown-toggle" 
                href="#"
                id="profileDropdown" 
                role="button" 
                data-bs-toggle="dropdown" 
                aria-expanded="false"
              >
                <FaUser size={20} />
              </a>
              <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="profileDropdown">
                <li>
                  <Link className="dropdown-item" to="/admin-profile">
                    Profile
                  </Link>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button 
                    className="dropdown-item" 
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavBar;