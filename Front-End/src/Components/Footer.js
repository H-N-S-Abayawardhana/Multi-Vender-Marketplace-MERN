import React, { useState } from 'react';
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
  FaCcAmex,
  FaChevronDown,
  FaChevronUp,
  FaShoppingCart,
  FaStore,
  FaUserCircle,
  FaShieldAlt,
  FaGlobe
} from 'react-icons/fa';
import '../css/Footer.css';
import logo from '../assets/images/logo.png';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [expandedCategory, setExpandedCategory] = useState(null);

  // Categories for a multi-vendor marketplace
  const categories = [
    { name: 'Electronics', slug: 'electronics' },
    { name: 'Clothing', slug: 'clothing' },
    { name: 'Home', slug: 'home' },
    { name: 'Books', slug: 'books' },
    { name: 'Sports', slug: 'sports' },
    { name: 'Toys', slug: 'toys' },
    { name: 'Beauty', slug: 'beauty' },
    { name: 'Automotive', slug: 'automotive' },
    { name: 'Garden', slug: 'garden' },
    { name: 'Health', slug: 'health' },
    { name: 'Pet Supplies', slug: 'pet-supplies' },
    { name: 'Office Products', slug: 'office' },
    { name: 'Music', slug: 'music' },
    { name: 'Movies', slug: 'movies' },
    { name: 'Food', slug: 'food' },
    { name: 'Art', slug: 'art' },
    { name: 'Collectibles', slug: 'collectibles' },
    { name: 'Jewelry', slug: 'jewelry' },
    { name: 'Tools', slug: 'tools' }
  ];

  // Divide categories into columns
  const categoryColumns = [
    categories.slice(0, 7),
    categories.slice(7, 14),
    categories.slice(14)
  ];

  // Toggle mobile accordion
  const toggleCategory = (index) => {
    setExpandedCategory(expandedCategory === index ? null : index);
  };

  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="container">
          <div className="row">
            <div className="col-lg-4 col-md-12 mb-5 mb-lg-0">
              <div className="footer-about">
                <img 
                  src={logo}
                  alt="TrolleyMart Logo" 
                  height="50" 
                  className="mb-4"
                />
                <h4 className="text-white">Shop with confidence</h4>
                <p className="text-light-50 mb-4">
                  TrolleyMart connects you with thousands of trusted sellers worldwide. 
                  Find everything you need from electronics to collectibles, all in one place.
                </p>
                <div className="download-app mb-4">
                  <p className="text-light mb-2">Get our app:</p>
                  <div className="d-flex gap-2">
                    <a href="#" className="btn btn-outline-light btn-sm">
                      <FaStore className="me-2" /> App Store
                    </a>
                    <a href="#" className="btn btn-outline-light btn-sm">
                      <FaShoppingCart className="me-2" /> Google Play
                    </a>
                  </div>
                </div>
                <div className="social-icons d-flex gap-3">
                  <a href="#" className="social-icon" aria-label="Facebook">
                    <FaFacebookF />
                  </a>
                  <a href="#" className="social-icon" aria-label="Twitter">
                    <FaTwitter />
                  </a>
                  <a href="#" className="social-icon" aria-label="Instagram">
                    <FaInstagram />
                  </a>
                  <a href="#" className="social-icon" aria-label="LinkedIn">
                    <FaLinkedinIn />
                  </a>
                </div>
              </div>
            </div>

            {/* Categories - Desktop View */}
            <div className="col-lg-5 col-md-12 d-none d-lg-block">
              <div className="row">
                <div className="col-12 mb-4">
                  <h5 className="footer-heading">Shop by Category</h5>
                </div>
                {categoryColumns.map((column, columnIndex) => (
                  <div className="col-4" key={`column-${columnIndex}`}>
                    <ul className="footer-links">
                      {column.map((category, index) => (
                        <li key={`category-${index}`}>
                          <Link to={`/category/${category.slug}`}>
                            {category.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Categories - Mobile Accordion */}
            <div className="col-md-12 d-lg-none mb-4">
              <div className="footer-accordion">
                <div 
                  className="footer-accordion-header" 
                  onClick={() => toggleCategory(0)}
                >
                  <h5 className="footer-heading mb-0">Shop by Category</h5>
                  {expandedCategory === 0 ? <FaChevronUp /> : <FaChevronDown />}
                </div>
                {expandedCategory === 0 && (
                  <div className="footer-accordion-content">
                    <div className="row">
                      {categoryColumns.map((column, columnIndex) => (
                        <div className="col-6 col-sm-4" key={`mobile-column-${columnIndex}`}>
                          <ul className="footer-links">
                            {column.map((category, index) => (
                              <li key={`mobile-category-${index}`}>
                                <Link to={`/category/${category.slug}`}>
                                  {category.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="col-lg-3 col-md-12">
              <div className="row">
                {/* Quick Links */}
                <div className="col-md-6 col-lg-12 mb-4">
                  <h5 className="footer-heading">Customer Service</h5>
                  <ul className="footer-links">
                    <li><Link to="/help-center">Help Center</Link></li>
                    <li><Link to="/returns">Returns & Refunds</Link></li>
                    <li><Link to="/shipping">Shipping Info</Link></li>
                    <li><Link to="/track-order">Track Your Order</Link></li>
                    <li><Link to="/contact">Contact Us</Link></li>
                  </ul>
                </div>

                {/* About TrolleyMart */}
                <div className="col-md-6 col-lg-12 mb-4">
                  <h5 className="footer-heading">About TrolleyMart</h5>
                  <ul className="footer-links">
                    <li><Link to="/about">About Us</Link></li>
                    <li><Link to="/careers">Careers</Link></li>
                    <li><Link to="/sell">Sell on TrolleyMart</Link></li>
                    <li><Link to="/affiliate">Affiliate Program</Link></li>
                    <li><Link to="/blog">Blog</Link></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust and Security Section */}
      <div className="footer-middle">
        <div className="container">
          <div className="row">
            <div className="col-12 text-center mb-4">
              <h4 className="text-white">Why shop with TrolleyMart?</h4>
            </div>
          </div>
          <div className="row justify-content-center">
            <div className="col-6 col-md-3 mb-4">
              <div className="trust-badge">
                <FaShieldAlt className="trust-icon" />
                <h6>Buyer Protection</h6>
                <p>Full refund if you don't receive your order</p>
              </div>
            </div>
            <div className="col-6 col-md-3 mb-4">
              <div className="trust-badge">
                <FaLock className="trust-icon" />
                <h6>Secure Payments</h6>
                <p>Multiple payment methods with encryption</p>
              </div>
            </div>
            <div className="col-6 col-md-3 mb-4">
              <div className="trust-badge">
                <FaTruck className="trust-icon" />
                <h6>Global Shipping</h6>
                <p>Delivery from local and international sellers</p>
              </div>
            </div>
            <div className="col-6 col-md-3 mb-4">
              <div className="trust-badge">
                <FaUserCircle className="trust-icon" />
                <h6>24/7 Support</h6>
                <p>Help available whenever you need it</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="footer-newsletter">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8 col-lg-6 text-center">
              <h4 className="text-white mb-3">Stay updated with TrolleyMart</h4>
              <p className="mb-4">Subscribe to receive exclusive deals, trending products, and personalized recommendations.</p>
              <form className="newsletter-form">
                <div className="input-group mb-3">
                  <input 
                    type="email" 
                    className="form-control" 
                    placeholder="Your email address" 
                    aria-label="Your email address"
                  />
                  <button 
                    className="btn btn-primary" 
                    type="submit"
                  >
                    Subscribe
                  </button>
                </div>
                <div className="form-text text-light-50">
                  By subscribing, you agree to our <Link to="/privacy" className="text-white">Privacy Policy</Link>.
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="footer-bottom">
        <div className="container">
          <div className="row gy-4 align-items-center">
            <div className="col-lg-6 col-md-6 text-center text-md-start">
              <p className="mb-0 footer-copyright">
                © {currentYear} TrolleyMart Inc. All rights reserved.
              </p>
              <div className="footer-legal mt-2">
                <Link to="/terms">Terms of Service</Link>
                <Link to="/privacy">Privacy Policy</Link>
                <Link to="/cookies">Cookie Settings</Link>
                <Link to="/accessibility">Accessibility</Link>
              </div>
            </div>
            <div className="col-lg-6 col-md-6 text-center text-md-end">
              <div className="d-flex flex-column align-items-center align-items-md-end">
                <div className="language-selector mb-3">
                  <FaGlobe className="me-2" />
                  <select className="form-select-sm bg-transparent text-white border-0">
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>
                <div className="payment-methods">
                  <FaPaypal />
                  <FaCcVisa />
                  <FaCcMastercard />
                  <FaCcAmex />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;