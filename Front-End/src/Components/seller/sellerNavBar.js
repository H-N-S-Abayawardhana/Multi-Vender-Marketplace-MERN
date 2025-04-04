import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaUser, FaBell } from 'react-icons/fa';
import axios from 'axios';
import Swal from 'sweetalert2';
import logo from '../../assets/images/logo.png';

const SellerNavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
        confirmButtonColor: '#E35D00',
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

  // Check if the current path matches the link path
  const isActive = (path) => {
    return location.pathname === path;
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
              <Link 
                className="nav-link" 
                to="/seller-dashboard"
              >
                <span className={isActive('/seller-dashboard') ? 'active-nav-item' : ''}>
                  Dashboard
                </span>
              </Link>
            </li>

            {/* Seller Products Link */}
            <li className="nav-item mx-3">
              <Link 
                className="nav-link" 
                to="/my-products"
              >
                <span className={isActive('/my-products') ? 'active-nav-item' : ''}>
                  My Products
                </span>
              </Link>
            </li>

            {/* Seller Orders Link */}
            <li className="nav-item mx-3">
              <Link 
                className="nav-link" 
                to="/seller-orders"
              >
                <span className={isActive('/seller-orders') ? 'active-nav-item' : ''}>
                  Orders
                </span>
              </Link>
            </li>

            {/* Notification Icon */}
            <li className="nav-item mx-3">
              <Link 
                to="/seller-notifications" 
                className="nav-link position-relative"
                onClick={handleNotificationClick}
              >
                <span className={isActive('/seller-notifications') ? 'active-nav-item' : ''}>
                  <FaBell size={20} />
                </span>
                {unreadCount > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill" style={{ backgroundColor: '#E35D00' }}>
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
                  <Link 
                    className="dropdown-item" 
                    to="/seller-profile"
                  >
                    <span className={isActive('/seller-profile') ? 'active-dropdown-item' : ''}>
                      Seller Profile
                    </span>
                  </Link>
                </li>
                <li>
                  <Link 
                    className="dropdown-item" 
                    to="/seller/settings"
                  >
                    <span className={isActive('/seller/settings') ? 'active-dropdown-item' : ''}>
                      Settings
                    </span>
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
      
      {/* Add CSS for hover styles and active indicators */}
      <style jsx>{`
        .nav-link:hover {
          background-color: rgba(255, 241, 231, 0.3);
          border-radius: 0.25rem;
        }
        
        .dropdown-item:hover {
          background-color: rgba(255, 241, 231, 0.5);
        }
        
        button.dropdown-item:hover {
          background-color: rgba(255, 241, 231, 0.5);
          color: #E35D00;
        }
        
        .active-nav-item {
          text-decoration: underline;
          text-decoration-color: #E35D00;
          text-decoration-thickness: 2px;
          text-underline-offset: 5px;
          padding: 8px 12px;
          background-color: rgba(255, 241, 231, 0.4);
          border-radius: 4px;
          font-weight: 500;
        }
        
        .active-dropdown-item {
          text-decoration: underline;
          text-decoration-color: #E35D00;
          text-decoration-thickness: 2px;
          text-underline-offset: 3px;
          font-weight: 500;
        }
      `}</style>
    </nav>
  );
};

export default SellerNavBar;