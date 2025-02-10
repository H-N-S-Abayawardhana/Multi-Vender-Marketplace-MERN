import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaFacebookF, 
  FaTwitter, 
  FaInstagram, 
  FaLinkedinIn,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCreditCard,
  FaLock,
  FaTruck,
  FaPaypal,
  FaCcVisa,
  FaCcMastercard,
  FaCcAmex
} from 'react-icons/fa';
import '../css/Footer.css';
import logo from '../assets/images/logo.png';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark text-light pt-5 pb-3">
      <div className="container">
        {/* Main Footer Content */}
        <div className="row gy-4">
          {/* Company Info */}
          <div className="col-lg-3 col-md-6">
            <img 
              src={logo}
              alt="TrolleyMart Logo" 
              height="40" 
              className="mb-4"
            />
            <p className="text-light-50 mb-4">
              Your one-stop destination for all your shopping needs. Quality products, 
              competitive prices, and excellent customer service.
            </p>
            <div className="social-icons d-flex gap-3 mb-4">
              <a href="#" className="text-light social-icon p-2 rounded-circle">
                <FaFacebookF size={18} />
              </a>
              <a href="#" className="text-light social-icon p-2 rounded-circle">
                <FaTwitter size={18} />
              </a>
              <a href="#" className="text-light social-icon p-2 rounded-circle">
                <FaInstagram size={18} />
              </a>
              <a href="#" className="text-light social-icon p-2 rounded-circle">
                <FaLinkedinIn size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-lg-3 col-md-6">
            <h5 className="mb-4 fw-bold">Quick Links</h5>
            <ul className="list-unstyled">
              <li className="mb-3">
                <Link to="/about" className="text-light text-decoration-none hover-link">
                  About Us
                </Link>
              </li>
              <li className="mb-3">
                <Link to="/contact" className="text-light text-decoration-none hover-link">
                  Contact Us
                </Link>
              </li>
              <li className="mb-3">
                <Link to="/terms" className="text-light text-decoration-none hover-link">
                  Terms & Conditions
                </Link>
              </li>
              <li className="mb-3">
                <Link to="/privacy" className="text-light text-decoration-none hover-link">
                  Privacy Policy
                </Link>
              </li>
              <li className="mb-3">
                <Link to="/faq" className="text-light text-decoration-none hover-link">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-lg-3 col-md-6">
            <h5 className="mb-4 fw-bold">Contact Info</h5>
            <ul className="list-unstyled">
              <li className="mb-3 d-flex align-items-center">
                <FaPhoneAlt className="me-3 text-primary" />
                <span>+1 234 567 8900</span>
              </li>
              <li className="mb-3 d-flex align-items-center">
                <FaEnvelope className="me-3 text-primary" />
                <span>support@trolleymart.com</span>
              </li>
              <li className="mb-3 d-flex align-items-start">
                <FaMapMarkerAlt className="me-3 text-primary mt-1" />
                <span>123 Shopping Street, Market City, ST 12345</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-lg-3 col-md-6">
            <h5 className="mb-4 fw-bold">Newsletter</h5>
            <p className="mb-4">Subscribe to receive updates and special offers!</p>
            <form className="newsletter-form">
              <div className="input-group mb-3">
                <input 
                  type="email" 
                  className="form-control form-control-lg bg-dark text-light border-secondary" 
                  placeholder="Your email" 
                  aria-label="Your email"
                />
              </div>
              <button 
                className="btn btn-primary w-100 btn-lg" 
                type="submit"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="row mt-5 py-4 border-top border-secondary">
          <div className="col-md-4 text-center mb-3 mb-md-0">
            <div className="trust-badge p-3">
              <FaCreditCard className="fs-2 mb-2 text-primary" />
              <p className="mb-0 fw-bold">Secure Payment</p>
            </div>
          </div>
          <div className="col-md-4 text-center mb-3 mb-md-0">
            <div className="trust-badge p-3">
              <FaLock className="fs-2 mb-2 text-primary" />
              <p className="mb-0 fw-bold">Safe Shopping</p>
            </div>
          </div>
          <div className="col-md-4 text-center">
            <div className="trust-badge p-3">
              <FaTruck className="fs-2 mb-2 text-primary" />
              <p className="mb-0 fw-bold">Worldwide Delivery</p>
            </div>
          </div>
        </div>

        {/* Copyright and Payment Methods */}
        <div className="row mt-4 pt-4 border-top border-secondary">
          <div className="col-md-6 text-center text-md-start mb-3 mb-md-0">
            <p className="mb-0">
              © {currentYear} TrolleyMart. All rights reserved.
            </p>
          </div>
          <div className="col-md-6 text-center text-md-end">
            <div className="payment-methods d-flex gap-3 justify-content-md-end justify-content-center">
              <FaPaypal size={32} className="text-secondary" />
              <FaCcVisa size={32} className="text-secondary" />
              <FaCcMastercard size={32} className="text-secondary" />
              <FaCcAmex size={32} className="text-secondary" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;