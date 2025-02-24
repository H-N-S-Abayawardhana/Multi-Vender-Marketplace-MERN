import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaUser, FaBell } from 'react-icons/fa';
import Swal from 'sweetalert2';
import logo from '../assets/images/logo.png';

const NavBar = () => {
  const navigate = useNavigate();
  const [isPendingSeller, setIsPendingSeller] = useState(false);
  const isLoggedIn = !!localStorage.getItem('token');
  const userEmail = localStorage.getItem('email');

  useEffect(() => {
    const checkSellerStatus = async () => {
      if (isLoggedIn && userEmail) {
        console.log('Checking status for email:', userEmail); // Debug log
        try {
          const response = await fetch(`http://localhost:9000/api/seller/status/${userEmail}`);
          const data = await response.json();
          console.log('API Response:', data); // Debug log
          
          setIsPendingSeller(data.status === 'pending');
          console.log('isPendingSeller set to:', data.status === 'pending'); // Debug log
        } catch (error) {
          console.error('Error checking seller status:', error);
        }
      }
    };
  
    checkSellerStatus();
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

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <img 
            src={logo} 
            alt="E-Commerce Logo" 
            height="80"
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

        {isLoggedIn && isPendingSeller && (
          <div
            style={{
              backgroundColor: "#fff285",
              border: "1px solid #9d9444",
              borderRadius: "0.5rem",
              padding: "1rem",
              marginBottom: "1px",
              color: "#958a2f",
              marginLeft: "400px",
            }}
          >
            Your Seller request is processing...
          </div>
        )}

        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-center">
            <li className="nav-item mx-3">
              <a className="nav-link position-relative" href="#" onClick={handleCartClick}>
                <FaShoppingCart size={20} />
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  0
                  <span className="visually-hidden">items in cart</span>
                </span>
              </a>
            </li>

            <li className="nav-item mx-3">
              <a className="nav-link position-relative" href="#" onClick={handleNotificationClick}>
                <FaBell size={20} />
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  0
                  <span className="visually-hidden">unread notifications</span>
                </span>
              </a>
            </li>

            {isLoggedIn ? (
              <>
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
                      <Link className="dropdown-item" to="/user-profile">
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
                {!isPendingSeller && (
                  <li className="nav-item mx-3">
                    <Link className="btn btn-primary" to="/become-seller">
                      Become a Seller
                    </Link>
                  </li>
                )}
              </>
            ) : (
              <>
                <li className="nav-item mx-3">
                  <Link className="btn btn-primary" to="/login">
                    Become a Seller
                  </Link>
                </li>
                <li className="nav-item mx-3">
                  <Link className="btn btn-outline-dark" to="/login">
                    Sign In
                  </Link>
                </li>
                <li className="nav-item mx-3">
                  <Link className="btn btn-dark" to="/register">
                    Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;