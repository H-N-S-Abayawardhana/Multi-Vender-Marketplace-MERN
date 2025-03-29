import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaBell } from 'react-icons/fa';
import axios from 'axios';
import Swal from 'sweetalert2';
import logo from '../../assets/images/logo.png';

const SellerNavBar = () => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  // Improved ResizeObserver error handler
  useEffect(() => {
    // This function prevents ResizeObserver errors from being shown in the console
    const handleResizeError = (event) => {
      if (event && event.message && event.message.includes('ResizeObserver')) {
        event.stopPropagation();
        event.preventDefault();
        return true;
      }
    };
    
    // Add error event listener with capture phase to catch the error early
    window.addEventListener('error', handleResizeError, { capture: true });
    
    // Cleanup on unmount
    return () => {
      window.removeEventListener('error', handleResizeError, { capture: true });
    };
  }, []);

  // Fetch unread notifications count
  const fetchUnreadCount = async () => {
    try {
      const email = localStorage.getItem('email');
      if (!email) return;
      
      const response = await axios.get(`http://localhost:9000/api/notifications/${email}`);
      if (response && response.data) {
        const unreadNotifications = response.data.filter(notification => !notification.isRead);
        setUnreadCount(unreadNotifications.length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Keep existing count on error
    }
  };

  // Fetch notification count on mount and set up polling
  useEffect(() => {
    fetchUnreadCount();
    
    // Check for new notifications every minute
    const interval = setInterval(fetchUnreadCount, 60000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  // Navigate to notifications page
  const handleNotificationClick = (e) => {
    e.preventDefault();
    navigate('/seller-notifications');
  };

  // Fixed logout handler to address ResizeObserver issues
  const handleLogout = () => {
    // Get session info before clearing localStorage
    const sessionId = localStorage.getItem('sessionId');
    
    // Clear localStorage first
    localStorage.clear();
    
    // Use this flag to prevent multiple logout attempts
    let isLoggingOut = true;
    
    try {
      // Show logout message first, then navigate
      Swal.fire({
        title: 'Logged Out!',
        text: 'You have been successfully logged out',
        icon: 'success',
        confirmButtonColor: '#3085d6',
        timer: 1500,
        willClose: () => {
          // Only navigate once
          if (isLoggingOut) {
            isLoggingOut = false;
            navigate('/', { replace: true });
          }
        }
      });
      
      // Make API call in background if sessionId exists
      if (sessionId) {
        fetch('http://localhost:9000/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
        }).catch(err => {
          console.error('Background logout request failed:', err);
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
      
      // Ensure user still gets logged out even if there's an error
      if (isLoggingOut) {
        isLoggingOut = false;
        navigate('/', { replace: true });
      }
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
      <div className="container">
        {/* Logo */}
        <Link className="navbar-brand" to="/">
          <img 
            src={logo} 
            alt="E-Commerce Logo" 
            height="40"
            className="d-inline-block align-top"
          />
        </Link>

        {/* Toggle button for mobile */}
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

        {/* Navbar content */}
        <div className="collapse navbar-collapse" id="navbarContent">
          {/* All items aligned to the right */}
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-center">
            {/* Seller Dashboard Link */}
            <li className="nav-item mx-3">
              <Link className="nav-link" to="/seller-dashboard">
                Dashboard
              </Link>
            </li>

            {/* Seller Products Link */}
            <li className="nav-item mx-3">
              <Link className="nav-link" to="/my-products">
                My Products
              </Link>
            </li>

            {/* Seller Orders Link */}
            <li className="nav-item mx-3">
              <Link className="nav-link" to="/my-orders">
                Orders
              </Link>
            </li>

            {/* Notification Icon */}
            <li className="nav-item mx-3">
              <Link 
                to="/seller-notifications" 
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

            {/* Profile Dropdown */}
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
                  <Link className="dropdown-item" to="/seller-profile">
                    Seller Profile
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/seller/settings">
                    Settings
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

export default SellerNavBar;