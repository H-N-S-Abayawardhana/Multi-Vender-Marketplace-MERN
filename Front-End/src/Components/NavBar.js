import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaUser, FaBell, FaSearch, FaBars, FaTimes } from 'react-icons/fa';
import Swal from 'sweetalert2';
import logo from '../assets/images/logo.png';
import '../css/NavBar.css'; 

const NavBar = () => {
  const navigate = useNavigate();
  const [isPendingSeller, setIsPendingSeller] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const isLoggedIn = !!localStorage.getItem('token');
  const userEmail = localStorage.getItem('email');

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
    Swal.fire({
      title: 'Shopping Cart',
      text: 'Your shopping cart is empty!',
      icon: 'info',
      confirmButtonColor: '#3085d6',
      confirmButtonText: 'Continue Shopping'
    });
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

        {/* Search Bar */}
        {/* <form className="user-navbar-search-form" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search products..."
            className="user-navbar-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="user-navbar-search-button">
            <FaSearch />
          </button>
        </form> */}

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
              <Link className="user-navbar-link" to="/shop-now">Shop</Link>
            </li>
            <li className="user-navbar-item">
              <Link className="user-navbar-link" to="/categories">Categories</Link>
            </li>
            <li className="user-navbar-item">
              <Link className="user-navbar-link" to="/">Deals</Link>
            </li>
          </ul>

          {/* User Actions */}
          <div className="user-navbar-actions">
            <button className="user-navbar-icon-btn" onClick={handleCartClick}>
              <FaShoppingCart />
              <span className="user-navbar-badge">0</span>
            </button>

            <button className="user-navbar-icon-btn" onClick={handleNotificationClick}>
              <FaBell />
              <span className="user-navbar-badge">0</span>
            </button>

            {isLoggedIn ? (
              <div className="user-navbar-profile">
                <button 
                  className="user-navbar-profile-btn" 
                  onClick={() => {
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
                  <Link className="user-navbar-dropdown-item" to="/orders">
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
                {!isPendingSeller && (
                  <Link className="user-navbar-seller-btn" to="/become-seller">
                    Become a Seller
                  </Link>
                )}
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