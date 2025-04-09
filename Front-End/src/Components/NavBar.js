import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaShoppingCart, FaUser, FaBell, FaSearch, FaBars, FaTimes } from 'react-icons/fa';
import Swal from 'sweetalert2';
import logo from '../assets/images/logo.png';
import '../css/NavBar.css'; 

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isPendingSeller, setIsPendingSeller] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const isLoggedIn = !!localStorage.getItem('token');
  const userEmail = localStorage.getItem('email');

  // Add a ResizeObserver error handler to fix the Windows laptop issue
  useEffect(() => {
    const handleResizeError = function(e) {
      if (e.message === 'ResizeObserver loop completed with undelivered notifications.' || 
          e.message === 'ResizeObserver loop limit exceeded') {
        e.stopImmediatePropagation();
        return true;
      }
    };
    
    window.addEventListener('error', handleResizeError, true);
    
    return () => {
      window.removeEventListener('error', handleResizeError, true);
    };
  }, []);

  // Get cart count from localStorage
  useEffect(() => {
    const updateCartCount = () => {
      const savedCart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
      setCartItemCount(savedCart.length);
    };

    // Initial load
    updateCartCount();

    // Listen for cart updates from other components
    window.addEventListener('cartUpdated', updateCartCount);

    // Cleanup
    return () => {
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);

  useEffect(() => {
    const checkSellerStatus = async () => {
      if (isLoggedIn && userEmail) {
        try {
          const response = await fetch(`http://localhost:9000/api/seller/status/${userEmail}`);
          const data = await response.json();
          setIsPendingSeller(data.status === 'pending');
        } catch (error) {
          console.error('Error checking seller status:', error);
        }
      }
    };
  
    checkSellerStatus();

    // Add scroll event listener
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isLoggedIn, userEmail]);

  const handleCartClick = (e) => {
    e.preventDefault();
    // Navigate to cart page instead of showing alert
    navigate('/cart');
  };

  const handleNotificationClick = (e) => {
    e.preventDefault();
    Swal.fire({
      title: 'Notifications',
      text: 'You have no new notifications',
      icon: 'info',
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Ok'
    });
  };

  const handleLogout = async () => {
    try {
      // Close dropdown menu if open
      const dropdown = document.getElementById('profileDropdown');
      if (dropdown && dropdown.classList.contains('user-navbar-dropdown-show')) {
        dropdown.classList.remove('user-navbar-dropdown-show');
      }
      
      const sessionId = localStorage.getItem('sessionId');
      
      // First clear localStorage before making API call
      // This ensures UI updates immediately even if server call takes time
      const tempSessionId = sessionId; // Save ID before clearing
      localStorage.clear();
      
      // Show logout success message before navigation
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
      
      // Make API call in background without waiting for it
      fetch('http://localhost:9000/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId: tempSessionId }),
      }).catch(err => {
        console.error('Background logout request failed:', err);
      });
      
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

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Handle click outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdown = document.getElementById('profileDropdown');
      const profileBtn = document.querySelector('.user-navbar-profile-btn');
      
      if (dropdown && 
          !dropdown.contains(event.target) && 
          profileBtn && 
          !profileBtn.contains(event.target)) {
        dropdown.classList.remove('user-navbar-dropdown-show');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Check if a path is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className={`user-navbar-main ${scrolled ? 'user-navbar-scrolled' : ''}`}>
      <div className="user-navbar-container">
        {/* Logo */}
        <Link className="user-navbar-logo" to="/">
          <img 
            src={logo} 
            alt="E-Commerce Logo" 
            className="user-navbar-logo-img"
          />
        </Link>

        {/* Mobile Menu Toggle */}
        <button 
          className="user-navbar-menu-toggle" 
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
        >
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* Main Navigation */}
        <div className={`user-navbar-menu ${isMenuOpen ? 'user-navbar-menu-active' : ''}`}>
          {/* Seller Status Notification */}
          {isLoggedIn && isPendingSeller && (
            <div className="user-navbar-seller-status">
              <span>Your Seller request is processing...</span>
            </div>
          )}

          {/* Navigation Links */}
          <ul className="user-navbar-nav">
          <li className="user-navbar-item">
              <Link 
                className={`user-navbar-link ${isActive('/') && location.pathname === '/' ? 'user-navbar-link-active' : ''}`} 
                to="/"
              >
                Home
              </Link>
            </li>
            <li className="user-navbar-item">
              <Link 
                className={`user-navbar-link ${isActive('/shop-now') ? 'user-navbar-link-active' : ''}`} 
                to="/shop-now"
              >
                Shop
              </Link>
            </li>
            <li className="user-navbar-item">
              <Link 
                className={`user-navbar-link ${isActive('/categories') ? 'user-navbar-link-active' : ''}`} 
                to="/categories"
              >
                Categories
              </Link>
            </li>
          
            {/* New Become Seller navigation item, only shown if not pending */}
            {!isPendingSeller && (
              <li className="user-navbar-item">
                <Link 
                  className={`user-navbar-link ${isActive('/become-seller') ? 'user-navbar-link-active' : ''}`} 
                  to="/become-seller"
                >
                  Become Seller
                </Link>
              </li>
            )}
          </ul>

          {/* User Actions */}
          <div className="user-navbar-actions">
            <button className="user-navbar-icon-btn" onClick={handleCartClick}>
              <FaShoppingCart />
              <span className="user-navbar-badge">{cartItemCount}</span>
            </button>

            <button className="user-navbar-icon-btn" onClick={handleNotificationClick}>
              <FaBell />
              <span className="user-navbar-badge">0</span>
            </button>

            {isLoggedIn ? (
              <div className="user-navbar-profile">
                <button 
                  className="user-navbar-profile-btn" 
                  onClick={(e) => {
                    e.stopPropagation();
                    const dropdown = document.getElementById('profileDropdown');
                    dropdown.classList.toggle('user-navbar-dropdown-show');
                  }}
                >
                  <FaUser />
                </button>
                <div className="user-navbar-dropdown" id="profileDropdown">
                  <Link className="user-navbar-dropdown-item" to="/user-profile">
                    My Profile
                  </Link>
                  <Link className="user-navbar-dropdown-item" to="/my-ordered-items">
                    My Orders
                  </Link>
                  <Link className="user-navbar-dropdown-item" to="/wishlist">
                    Wishlist
                  </Link>
                  <div className="user-navbar-dropdown-divider"></div>
                  <button 
                    className="user-navbar-dropdown-item" 
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="user-navbar-auth">
                <Link className="user-navbar-login-btn" to="/login">
                  Sign In
                </Link>
                <Link className="user-navbar-signup-btn" to="/register">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;