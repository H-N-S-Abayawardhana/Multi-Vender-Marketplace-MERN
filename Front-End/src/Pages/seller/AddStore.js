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
  const [activeStep, setActiveStep] = useState(1);

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
  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    
    if (!formData.storeName.trim()) {
      errors.storeName = 'Store name is required';
    }
    
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      errors.phone = 'Please enter a valid phone number';
    }
    
    if (!formData.address.trim()) {
      errors.address = 'Address is required';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    } else if (formData.description.length < 20) {
      errors.description = 'Description should be at least 20 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear specific field error when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
    
    setError('');
  };

  const handleImageChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      if (files[0].size > 5 * 1024 * 1024) {
        setFormErrors({
          ...formErrors,
          [name]: `${name === 'logo' ? 'Logo' : 'Banner'} image must be less than 5MB`
        });
        return;
      }

      if (!files[0].type.match(/^image\/(jpeg|jpg|png|gif)$/)) {
        setFormErrors({
          ...formErrors,
          [name]: `${name === 'logo' ? 'Logo' : 'Banner'} must be an image file (JPEG, PNG, or GIF)`
        });
        return;
      }

      setFormData({
        ...formData,
        [name]: files[0]
      });

      // Clear error for this field
      if (formErrors[name]) {
        setFormErrors({
          ...formErrors,
          [name]: ''
        });
      }

      const previewUrl = URL.createObjectURL(files[0]);
      if (name === 'logo') {
        setPreviewLogo(previewUrl);
      } else {
        setPreviewBanner(previewUrl);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('addstore-sell-dropzone-active');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('addstore-sell-dropzone-active');
  };

  const handleDrop = (e, fieldName) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('addstore-sell-dropzone-active');
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      // Create a new event-like object
      const mockEvent = {
        target: {
          name: fieldName,
          files: files
        }
      };
      handleImageChange(mockEvent);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Scroll to the first error
      const firstErrorField = Object.keys(formErrors)[0];
      if (firstErrorField) {
        document.getElementsByName(firstErrorField)[0]?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
      return;
    }
    
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
        toast.success('Store created successfully!', { 
          position: 'top-center',
          autoClose: 3000
        });
        
        // Delay navigation to show the success message
        setTimeout(() => {
          navigate('/seller-dashboard');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while creating the store');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    // Validate current step fields before proceeding
    let canProceed = true;
    const errors = {};
    
    if (activeStep === 1) {
      if (!formData.storeName.trim()) {
        errors.storeName = 'Store name is required';
        canProceed = false;
      }
      
      if (!formData.phone.trim()) {
        errors.phone = 'Phone number is required';
        canProceed = false;
      } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
        errors.phone = 'Please enter a valid phone number';
        canProceed = false;
      }
    }
    
    setFormErrors(errors);
    
    if (canProceed) {
      setActiveStep(activeStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Scroll to the first error
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        document.getElementsByName(firstErrorField)[0]?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    }
  };

  const prevStep = () => {
    setActiveStep(activeStep - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderStepIndicator = () => {
    return (
      <div className="addstore-sell-steps">
        <div className={`addstore-sell-step ${activeStep >= 1 ? 'addstore-sell-step-active' : ''}`}>
          <div className="addstore-sell-step-number">1</div>
          <div className="addstore-sell-step-label">Basic Info</div>
        </div>
        <div className="addstore-sell-step-connector"></div>
        <div className={`addstore-sell-step ${activeStep >= 2 ? 'addstore-sell-step-active' : ''}`}>
          <div className="addstore-sell-step-number">2</div>
          <div className="addstore-sell-step-label">Store Media</div>
        </div>
        <div className="addstore-sell-step-connector"></div>
        <div className={`addstore-sell-step ${activeStep >= 3 ? 'addstore-sell-step-active' : ''}`}>
          <div className="addstore-sell-step-number">3</div>
          <div className="addstore-sell-step-label">Description</div>
        </div>
      </div>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="addstore-sell-loading-container">
        <div className="addstore-sell-loading-spinner"></div>
        <div className="addstore-sell-loading-message">
          Checking authentication status...
        </div>
      </div>
    );
  }

  return (
    <>
      <SellerNavBar />
      <ToastContainer />

      <div className="addstore-sell-container">
        <div className="addstore-sell-header">
          <h1 className="addstore-sell-main-title">Create Your Store</h1>
          <p className="addstore-sell-subtitle">Start selling your products by setting up your store profile</p>
        </div>
        
        {renderStepIndicator()}
        
        <div className="addstore-sell-content">
          {error && (
            <div className="addstore-sell-error-box">
              <div className="addstore-sell-error-icon">!</div>
              <div className="addstore-sell-error-message">{error}</div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="addstore-sell-form">
            {activeStep === 1 && (
              <div className="addstore-sell-step-content">
                <h2 className="addstore-sell-step-title">Basic Information</h2>
                
                <div className="addstore-sell-form-group">
                  <label className="addstore-sell-label" htmlFor="storeName">
                    Store Name <span className="addstore-sell-required">*</span>
                  </label>
                  <input
                    type="text"
                    id="storeName"
                    name="storeName"
                    value={formData.storeName}
                    onChange={handleChange}
                    className={`addstore-sell-input ${formErrors.storeName ? 'addstore-sell-input-error' : ''}`}
                    placeholder="Enter your store name"
                  />
                  {formErrors.storeName && (
                    <div className="addstore-sell-error-text">{formErrors.storeName}</div>
                  )}
                </div>

                <div className="addstore-sell-form-group">
                  <label className="addstore-sell-label" htmlFor="email">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    className="addstore-sell-input addstore-sell-input-disabled"
                    readOnly
                    disabled
                  />
                  <div className="addstore-sell-helper-text">This email is from your account and cannot be changed</div>
                </div>

                <div className="addstore-sell-form-group">
                  <label className="addstore-sell-label" htmlFor="phone">
                    Phone Number <span className="addstore-sell-required">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`addstore-sell-input ${formErrors.phone ? 'addstore-sell-input-error' : ''}`}
                    placeholder="Enter your phone number"
                  />
                  {formErrors.phone && (
                    <div className="addstore-sell-error-text">{formErrors.phone}</div>
                  )}
                </div>

                <div className="addstore-sell-buttons-container">
                  <button 
                    type="button" 
                    className="addstore-sell-next-button" 
                    onClick={nextStep}
                  >
                    Continue to Store Media
                  </button>
                </div>
              </div>
            )}
            
            {activeStep === 2 && (
              <div className="addstore-sell-step-content">
                <h2 className="addstore-sell-step-title">Store Media</h2>
                
                <div className="addstore-sell-form-group">
                  <label className="addstore-sell-label">
                    Store Logo <span className="addstore-sell-optional">(Optional)</span>
                  </label>
                  <div 
                    className={`addstore-sell-dropzone ${formErrors.logo ? 'addstore-sell-dropzone-error' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, 'logo')}
                  >
                    {previewLogo ? (
                      <div className="addstore-sell-preview-container">
                        <img src={previewLogo} alt="Logo Preview" className="addstore-sell-logo-preview-img" />
                        <button 
                          type="button" 
                          className="addstore-sell-remove-image" 
                          onClick={() => {
                            setPreviewLogo(null);
                            setFormData({...formData, logo: null});
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="addstore-sell-dropzone-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="17 8 12 3 7 8"></polyline>
                            <line x1="12" y1="3" x2="12" y2="15"></line>
                          </svg>
                        </div>
                        <div className="addstore-sell-dropzone-text">
                          <span className="addstore-sell-dropzone-primary">Drop your logo here or click to upload</span>
                          <span className="addstore-sell-dropzone-secondary">Supports: JPG, PNG, GIF (Max. 5MB)</span>
                        </div>
                        <input
                          type="file"
                          name="logo"
                          id="logo"
                          onChange={handleImageChange}
                          className="addstore-sell-file-input"
                          accept="image/*"
                        />
                      </>
                    )}
                  </div>
                  {formErrors.logo && (
                    <div className="addstore-sell-error-text">{formErrors.logo}</div>
                  )}
                  <div className="addstore-sell-helper-text">A square logo works best. Recommended size: 512×512px</div>
                </div>

                <div className="addstore-sell-form-group">
                  <label className="addstore-sell-label">
                    Store Banner <span className="addstore-sell-optional">(Optional)</span>
                  </label>
                  <div 
                    className={`addstore-sell-dropzone ${formErrors.banner ? 'addstore-sell-dropzone-error' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, 'banner')}
                  >
                    {previewBanner ? (
                      <div className="addstore-sell-preview-container">
                        <img src={previewBanner} alt="Banner Preview" className="addstore-sell-banner-preview-img" />
                        <button 
                          type="button" 
                          className="addstore-sell-remove-image" 
                          onClick={() => {
                            setPreviewBanner(null);
                            setFormData({...formData, banner: null});
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="addstore-sell-dropzone-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="17 8 12 3 7 8"></polyline>
                            <line x1="12" y1="3" x2="12" y2="15"></line>
                          </svg>
                        </div>
                        <div className="addstore-sell-dropzone-text">
                          <span className="addstore-sell-dropzone-primary">Drop your banner here or click to upload</span>
                          <span className="addstore-sell-dropzone-secondary">Supports: JPG, PNG, GIF (Max. 5MB)</span>
                        </div>
                        <input
                          type="file"
                          name="banner"
                          id="banner"
                          onChange={handleImageChange}
                          className="addstore-sell-file-input"
                          accept="image/*"
                        />
                      </>
                    )}
                  </div>
                  {formErrors.banner && (
                    <div className="addstore-sell-error-text">{formErrors.banner}</div>
                  )}
                  <div className="addstore-sell-helper-text">A wide banner works best. Recommended size: 1200×300px</div>
                </div>

                <div className="addstore-sell-buttons-container">
                  <button 
                    type="button" 
                    className="addstore-sell-back-button" 
                    onClick={prevStep}
                  >
                    Back
                  </button>
                  <button 
                    type="button" 
                    className="addstore-sell-next-button" 
                    onClick={nextStep}
                  >
                    Continue to Description
                  </button>
                </div>
              </div>
            )}
            
            {activeStep === 3 && (
              <div className="addstore-sell-step-content">
                <h2 className="addstore-sell-step-title">Store Details</h2>
                
                <div className="addstore-sell-form-group">
                  <label className="addstore-sell-label" htmlFor="address">
                    Store Address <span className="addstore-sell-required">*</span>
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={`addstore-sell-textarea ${formErrors.address ? 'addstore-sell-textarea-error' : ''}`}
                    placeholder="Enter your store's physical address"
                    rows="3"
                  ></textarea>
                  {formErrors.address && (
                    <div className="addstore-sell-error-text">{formErrors.address}</div>
                  )}
                </div>

                <div className="addstore-sell-form-group">
                  <label className="addstore-sell-label" htmlFor="description">
                    Store Description <span className="addstore-sell-required">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className={`addstore-sell-textarea ${formErrors.description ? 'addstore-sell-textarea-error' : ''}`}
                    placeholder="Describe your store, products, specialties, and why customers should shop with you"
                    rows="6"
                  ></textarea>
                  {formErrors.description && (
                    <div className="addstore-sell-error-text">{formErrors.description}</div>
                  )}
                  <div className="addstore-sell-textarea-counter">
                    {formData.description.length} characters
                    {formData.description.length < 20 && 
                      <span className="addstore-sell-counter-warning"> (minimum 20 characters)</span>
                    }
                  </div>
                </div>

                <div className="addstore-sell-buttons-container">
                  <button 
                    type="button" 
                    className="addstore-sell-back-button" 
                    onClick={prevStep}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className={`addstore-sell-submit ${loading ? 'addstore-sell-submit-loading' : ''}`}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="addstore-sell-spinner"></span>
                        <span>Creating Store...</span>
                      </>
                    ) : 'Create Store'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AddStore;