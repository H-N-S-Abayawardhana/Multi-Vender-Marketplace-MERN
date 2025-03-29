import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaBell } from 'react-icons/fa';
import axios from 'axios';
import Swal from 'sweetalert2';
import logo from '../../assets/images/logo.png';

const AdminNavBar = () => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  // Improved ResizeObserver error handler with broader catch pattern
  useEffect(() => {
    const handleResizeError = function(e) {
      if (e && e.message && (
          e.message.includes('ResizeObserver loop') || 
          e.message.includes('ResizeObserver')
        )) {
        // Prevent the error from bubbling up
        e.stopImmediatePropagation();
        // Avoid console error by returning true
        return true;
      }
    };
    
    // Capture errors at window level
    window.addEventListener('error', handleResizeError, { capture: true });
    
    // Cleanup on unmount
    return () => {
      window.removeEventListener('error', handleResizeError, { capture: true });
    };
  }, []);

  // Safer fetch unread notifications count with better error handling
  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get('http://localhost:9000/api/notifications');
      if (response && response.data && response.data.data) {
        const unreadNotifications = response.data.data.filter(notification => !notification.isRead);
        setUnreadCount(unreadNotifications.length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Don't update state on error to maintain previous valid count
    }
  };

  // Fetch count when component mounts and set up interval with cleanup
  useEffect(() => {
    // Initial fetch
    fetchUnreadCount();
    
    // Set up polling interval with more realistic timing
    const interval = setInterval(fetchUnreadCount, 60000); // Check every minute instead of 30s
    
    // Cleanup interval on unmount
    return () => {
      clearInterval(interval);
    };
  }, []);

  const handleNotificationClick = (e) => {
    e.preventDefault();
    navigate('/admin-notifications');
  };

  // Improved logout handler with better state management
  const handleLogout = async () => {
    try {
      // Get session info before clearing
      const sessionId = localStorage.getItem('sessionId');
      
      // Prevent multiple logout attempts
      if (!sessionId) {
        navigate('/', { replace: true });
        return;
      }
      
      // Clear localStorage first to prevent UI state issues
      localStorage.clear();
      
      // Delay navigation slightly to allow cleanup
      setTimeout(() => {
        // Show logout success message before final navigation
        Swal.fire({
          title: 'Logged Out!',
          text: 'You have been successfully logged out',
          icon: 'success',
          confirmButtonColor: '#3085d6',
          timer: 1500,
          willClose: () => {
            // Navigate after the Swal modal is closed
            navigate('/', { replace: true });
          }
        });
      }, 100);
      
      // Make API call in background without waiting for response
      try {
        await fetch('http://localhost:9000/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
        });
      } catch (err) {
        // Silently handle API errors since user is already logged out locally
        console.error('Background logout request failed:', err);
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Clear localStorage as fallback even if there was an error
      localStorage.clear();
      
      Swal.fire({
        title: 'Error!',
        text: 'There was an issue during logout, but you have been logged out successfully.',
        icon: 'warning',
        confirmButtonColor: '#3085d6',
        willClose: () => {
          navigate('/', { replace: true });
        }
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