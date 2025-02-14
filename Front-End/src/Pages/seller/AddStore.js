import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../css/seller/addstore.css';
import SellerNavBar from '../../components/seller/sellerNavBar.js'; 
import Footer from '../../components/Footer';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddStore = () => {
  const navigate = useNavigate();
  
  const [userEmail, setUserEmail] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [previewLogo, setPreviewLogo] = useState(null);
  const [previewBanner, setPreviewBanner] = useState(null);

  useEffect(() => {
    const storedEmail = localStorage.getItem('email');
    const storedUserData = localStorage.getItem('userData');
    const storedToken = localStorage.getItem('token');

    if (storedEmail || (storedUserData && JSON.parse(storedUserData).email)) {
      setUserEmail(storedEmail || JSON.parse(storedUserData).email);
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      navigate('/login');
    }
  }, [navigate]);

  const [formData, setFormData] = useState({
    storeName: '',
    email: '',
    phone: '',
    address: '',
    description: '',
    logo: null,
    banner: null
  });

  useEffect(() => {
    if (userEmail) {
      setFormData(prev => ({
        ...prev,
        email: userEmail
      }));
    }
  }, [userEmail]);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleImageChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      if (files[0].size > 5 * 1024 * 1024) {
        setError(`${name === 'logo' ? 'Logo' : 'Banner'} image must be less than 5MB`);
        return;
      }

      if (!files[0].type.match(/^image\/(jpeg|jpg|png|gif)$/)) {
        setError(`${name === 'logo' ? 'Logo' : 'Banner'} must be an image file (JPEG, PNG, or GIF)`);
        return;
      }

      setFormData({
        ...formData,
        [name]: files[0]
      });

      const previewUrl = URL.createObjectURL(files[0]);
      if (name === 'logo') {
        setPreviewLogo(previewUrl);
      } else {
        setPreviewBanner(previewUrl);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const submitFormData = new FormData();
      submitFormData.append('storeName', formData.storeName);
      submitFormData.append('email', formData.email);
      submitFormData.append('phone', formData.phone);
      submitFormData.append('address', formData.address);
      submitFormData.append('description', formData.description);
      submitFormData.append('userEmail', userEmail);
      
      if (formData.logo) {
        submitFormData.append('logo', formData.logo);
      }
      if (formData.banner) {
        submitFormData.append('banner', formData.banner);
      }

      const response = await axios.post('http://localhost:9000/api/stores/add', 
        submitFormData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        navigate('/seller-dashboard');
        toast.success('Store Added Successfully!', { position: 'top-center' });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while creating the store');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="addstore-sell-loading-container">
        <div className="addstore-sell-loading-message">
          Checking authentication status...
        </div>
      </div>
    );
  }

  return (
    <>
    <SellerNavBar />

    <div className="addstore-sell-container">
      
      <div className="addstore-sell-content">
        <h2 className="addstore-sell-title">Add New Store</h2>
        {error && <div className="addstore-sell-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="addstore-sell-form">
          <div className="addstore-sell-form-group">
            <label className="addstore-sell-label">Store Name:</label>
            <input
              type="text"
              name="storeName"
              value={formData.storeName}
              onChange={handleChange}
              className="addstore-sell-input"
              required
            />
          </div>

          <div className="addstore-sell-form-group">
            <label className="addstore-sell-label">Email (from your login):</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              className="addstore-sell-input addstore-sell-input-disabled"
              readOnly
              disabled
            />
          </div>

          <div className="addstore-sell-form-group">
            <label className="addstore-sell-label">Store Logo:</label>
            <input
              type="file"
              name="logo"
              onChange={handleImageChange}
              className="addstore-sell-file-input"
              accept="image/*"
            />
            {previewLogo && (
              <div className="addstore-sell-preview addstore-sell-logo-preview">
                <img src={previewLogo} alt="Logo Preview" />
              </div>
            )}
          </div>

          <div className="addstore-sell-form-group">
            <label className="addstore-sell-label">Store Banner:</label>
            <input
              type="file"
              name="banner"
              onChange={handleImageChange}
              className="addstore-sell-file-input"
              accept="image/*"
            />
            {previewBanner && (
              <div className="addstore-sell-preview addstore-sell-banner-preview">
                <img src={previewBanner} alt="Banner Preview" />
              </div>
            )}
          </div>

          <div className="addstore-sell-form-group">
            <label className="addstore-sell-label">Phone:</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="addstore-sell-input"
              required
            />
          </div>

          <div className="addstore-sell-form-group">
            <label className="addstore-sell-label">Address:</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="addstore-sell-textarea"
              required
            />
          </div>

          <div className="addstore-sell-form-group">
            <label className="addstore-sell-label">Description:</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="addstore-sell-textarea"
              required
            />
          </div>

          <button
            type="submit"
            className={`addstore-sell-submit ${loading ? 'addstore-sell-submit-loading' : ''}`}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Store'}
          </button>
        </form>
      </div>
    </div>
    <Footer />
    </>
  );
};

export default AddStore;