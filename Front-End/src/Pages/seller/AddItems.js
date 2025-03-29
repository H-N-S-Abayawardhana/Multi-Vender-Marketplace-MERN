import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../css/seller/additems.css';
import SellerNavBar from '../../components/seller/sellerNavBar';
import Footer from '../../components/Footer';

const AddItem = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    condition: 'New',
    email: '',
    description: '',
    brand: '',
    model: '',
    dimensions: {
      length: '',
      width: '',
      height: '',
      weight: ''
    },
    color: '',
    material: '',
    price: '',
    listingType: 'Fixed',
    startingBid: '',
    quantity: 1,
    shippingDetails: {
      method: 'Standard',
      cost: '',
      handlingTime: '',
      internationalShipping: false
    },
    paymentMethods: ['PayPal', 'Credit Card'],
    returnPolicy: {
      acceptsReturns: false,
      returnPeriod: 30,
      conditions: ''
    }
  });

  // New state for category management
  const [categoryInput, setCategoryInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const suggestionRef = useRef(null);
  const [activeStep, setActiveStep] = useState(1);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState([]);

  // Predefined categories list
  const predefinedCategories = [
    'Computer',
    'Clothing',
    'Home',
    'Books',
    'Toys',
    'Beauty',
    'Automotive',
    'Garden',
    'Health',
    'Pet Supplies',
    'Office Products',
    'Music',
    'Movies',
    'Food',
    'Art',
    'Collectibles',
    'Jewelry',
    'Tools'
  ];

  useEffect(() => {
    const userEmail = localStorage.getItem('email');
    if (userEmail) {
      setFormData(prev => ({
        ...prev,
        email: userEmail
      }));
    }
  }, []);

  // Filter categories based on input
  useEffect(() => {
    if (categoryInput) {
      const filtered = predefinedCategories.filter(category =>
        category.toLowerCase().includes(categoryInput.toLowerCase())
      );
      setFilteredCategories(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredCategories([]);
      setShowSuggestions(false);
    }
  }, [categoryInput]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Check if store exists when component mounts
  useEffect(() => {
    const checkStoreExists = async () => {
      const token = localStorage.getItem('token');
      const userEmail = localStorage.getItem('email');
      
      if (!token || !userEmail) {
        toast.error('Please login first');
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:9000/api/items/check-store/${userEmail}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        if (!response.data.exists) {
          navigate('/add-store');
          toast.error('Please create a store first to add items');
          return;
        }

        setFormData(prev => ({
          ...prev,
          email: userEmail
        }));

      } catch (error) {
        if (error.response?.status === 401) {
          toast.error('Session expired. Please login again');
          navigate('/login');
        } else {
          toast.error('Error checking store existence');
          navigate('/add-store');
        }
      }
    };

    checkStoreExists();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle category selection or custom category addition
  const handleCategorySelect = (category) => {
    setFormData(prev => ({
      ...prev,
      category
    }));
    setCategoryInput(category);
    setShowSuggestions(false);
  };

  const handleAddCustomCategory = () => {
    if (categoryInput.trim()) {
      handleCategorySelect(categoryInput.trim());
      toast.success('Custom category added successfully');
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files.length > 3) {
      toast.error('Maximum 3 images allowed');
      return;
    }
    
    const files = [...e.target.files];
    setImages(files);

    // Generate previews
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreview(previews);
    
    toast.success('Images uploaded successfully');
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);

    const newPreviews = [...imagePreview];
    URL.revokeObjectURL(newPreviews[index]); // Clean up the URL
    newPreviews.splice(index, 1);
    setImagePreview(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.title.trim() || !formData.category || !images.length) {
      toast.error('Please fill in all required fields and upload at least one image');
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (typeof formData[key] === 'object') {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      images.forEach(image => {
        formDataToSend.append('images', image);
      });

      const response = await axios.post('http://localhost:9000/api/items/add', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data) {
        toast.success('Item added successfully!', {
          onClose: () => navigate('/stores')
        });
        
        // Clean up object URLs
        imagePreview.forEach(url => URL.revokeObjectURL(url));
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'An error occurred while adding the item');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (activeStep < 4) {
      setActiveStep(activeStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const validateStep = (step) => {
    switch(step) {
      case 1:
        return formData.title.trim() && formData.description.trim() && formData.category;
      case 2:
        return images.length > 0;
      case 3:
        return formData.shippingDetails.cost && formData.shippingDetails.handlingTime;
      default:
        return true;
    }
  };

  return (
    <>
    <SellerNavBar/>
    <div className="additems-container">
      
      <ToastContainer position="top-center" autoClose={3000} />
      
      <div className="additems-header">
        <h1 className="additems-title">Add New Item</h1>
        <p className="additems-subtitle">List your product in our marketplace</p>
      </div>

      <div className="additems-progress-container">
        <div className="additems-progress-bar">
          <div className="additems-progress-steps">
            <div className={`additems-step ${activeStep >= 1 ? 'additems-step-active' : ''}`}>
              <div className="additems-step-number">1</div>
              <div className="additems-step-text">Basic Info</div>
            </div>
            <div className={`additems-step ${activeStep >= 2 ? 'additems-step-active' : ''}`}>
              <div className="additems-step-number">2</div>
              <div className="additems-step-text">Images</div>
            </div>
            <div className={`additems-step ${activeStep >= 3 ? 'additems-step-active' : ''}`}>
              <div className="additems-step-number">3</div>
              <div className="additems-step-text">Shipping</div>
            </div>
            <div className={`additems-step ${activeStep >= 4 ? 'additems-step-active' : ''}`}>
              <div className="additems-step-number">4</div>
              <div className="additems-step-text">Pricing</div>
            </div>
          </div>
          <div className="additems-progress-line">
            <div 
              className="additems-progress-line-fill" 
              style={{ width: `${(activeStep - 1) * 33.33}%` }}
            ></div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="additems-form">
        {/* Step 1: Basic Information */}
        {activeStep === 1 && (
          <section className="additems-section">
            <h2 className="additems-section-title">Basic Information</h2>
            <div className="additems-section-content">
              <div className="additems-input-group">
                <label className="additems-label">Seller Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  className="additems-input additems-input-disabled"
                  readOnly
                  disabled
                />
              </div>

              <div className="additems-input-group">
                <label className="additems-label">Title<span className="additems-required">*</span></label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="additems-input"
                  placeholder="Enter product title"
                  required
                />
              </div>

              <div className="additems-input-group">
                <label className="additems-label">Description<span className="additems-required">*</span></label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="additems-textarea"
                  rows="4"
                  placeholder="Describe your product in detail"
                  required
                />
              </div>

              <div className="additems-input-group">
                <label className="additems-label">Category<span className="additems-required">*</span></label>
                <div className="additems-category-container" ref={suggestionRef}>
                  <input
                    type="text"
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                    className="additems-input"
                    placeholder="Search or enter custom category"
                    required
                  />
                  {categoryInput && (
                    <button
                      type="button"
                      onClick={handleAddCustomCategory}
                      className="additems-custom-category-btn"
                    >
                      Add Category
                    </button>
                  )}
                  {showSuggestions && filteredCategories.length > 0 && (
                    <div className="additems-category-suggestions">
                      {filteredCategories.map((category, index) => (
                        <div
                          key={index}
                          className="additems-category-suggestion-item"
                          onClick={() => handleCategorySelect(category)}
                        >
                          {category}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="additems-two-col">
                <div className="additems-input-group">
                  <label className="additems-label">Brand</label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    className="additems-input"
                    placeholder="e.g. Samsung, Nike"
                  />
                </div>

                <div className="additems-input-group">
                  <label className="additems-label">Model</label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    className="additems-input"
                    placeholder="e.g. Galaxy S21, Air Max"
                  />
                </div>
              </div>

              <div className="additems-two-col">
                <div className="additems-input-group">
                  <label className="additems-label">Color</label>
                  <input
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    className="additems-input"
                    placeholder="e.g. Black, Red, Blue"
                  />
                </div>

                <div className="additems-input-group">
                  <label className="additems-label">Material</label>
                  <input
                    type="text"
                    name="material"
                    value={formData.material}
                    onChange={handleChange}
                    className="additems-input"
                    placeholder="e.g. Leather, Cotton, Metal"
                  />
                </div>
              </div>

              <div className="additems-input-group">
                <label className="additems-label">Condition<span className="additems-required">*</span></label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  className="additems-select"
                  required
                >
                  <option value="New">New</option>
                  <option value="Used">Used</option>
                  <option value="Refurbished">Refurbished</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            
            <div className="additems-buttons">
              <button 
                type="button" 
                className="additems-next-button"
                onClick={nextStep}
                disabled={!validateStep(1)}
              >
                Next: Upload Images
              </button>
            </div>
          </section>
        )}

        {/* Step 2: Images Upload */}
        {activeStep === 2 && (
          <section className="additems-section">
            <h2 className="additems-section-title">Images</h2>
            <div className="additems-section-content">
              <div className="additems-input-group">
                <label className="additems-label">Upload Images<span className="additems-required">*</span> (Maximum 3)</label>
                <div className="additems-file-upload">
                  <input
                    type="file"
                    id="image-upload"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="additems-file-input"
                    required
                  />
                  <label htmlFor="image-upload" className="additems-file-label">
                    <span className="additems-file-icon">📷</span>
                    <span className="additems-file-text">Choose Files</span>
                  </label>
                </div>
                
                <div className="additems-image-preview-container">
                  {imagePreview.length > 0 ? (
                    imagePreview.map((src, index) => (
                      <div key={index} className="additems-image-preview">
                        <img src={src} alt={`Preview ${index + 1}`} />
                        <button 
                          type="button" 
                          className="additems-remove-image" 
                          onClick={() => removeImage(index)}
                        >
                          ×
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="additems-no-images">
                      No images selected yet
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="additems-buttons">
              <button type="button" className="additems-back-button" onClick={prevStep}>
                Back: Basic Info
              </button>
              <button 
                type="button" 
                className="additems-next-button"
                onClick={nextStep}
                disabled={!validateStep(2)}
              >
                Next: Shipping Details
              </button>
            </div>
          </section>
        )}

        {/* Step 3: Shipping Details */}
        {activeStep === 3 && (
          <section className="additems-section">
            <h2 className="additems-section-title">Shipping Details</h2>
            <div className="additems-section-content">
              <div className="additems-input-group">
                <label className="additems-label">Shipping Method<span className="additems-required">*</span></label>
                <select
                  name="shippingDetails.method"
                  value={formData.shippingDetails.method}
                  onChange={handleChange}
                  className="additems-select"
                  required
                >
                  <option value="Standard">Standard</option>
                  <option value="Express">Express</option>
                  <option value="Priority">Priority</option>
                </select>
              </div>

              <div className="additems-two-col">
                <div className="additems-input-group">
                  <label className="additems-label">Shipping Cost (LKR)<span className="additems-required">*</span></label>
                  <input
                    type="number"
                    name="shippingDetails.cost"
                    value={formData.shippingDetails.cost}
                    onChange={handleChange}
                    className="additems-input"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="additems-input-group">
                  <label className="additems-label">Handling Time (days)<span className="additems-required">*</span></label>
                  <input
                    type="number"
                    name="shippingDetails.handlingTime"
                    value={formData.shippingDetails.handlingTime}
                    onChange={handleChange}
                    className="additems-input"
                    placeholder="1"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="additems-checkbox-group">
                <label className="additems-checkbox-label">
                  <input
                    type="checkbox"
                    name="shippingDetails.internationalShipping"
                    checked={formData.shippingDetails.internationalShipping}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      shippingDetails: {
                        ...prev.shippingDetails,
                        internationalShipping: e.target.checked
                      }
                    }))}
                    className="additems-checkbox"
                  />
                  <span className="additems-checkbox-text">International Shipping Available</span>
                </label>
              </div>
            </div>
            
            <div className="additems-buttons">
              <button type="button" className="additems-back-button" onClick={prevStep}>
                Back: Images
              </button>
              <button 
                type="button" 
                className="additems-next-button"
                onClick={nextStep}
                disabled={!validateStep(3)}
              >
                Next: Pricing
              </button>
            </div>
          </section>
        )}

        {/* Step 4: Price Information */}
        {activeStep === 4 && (
          <section className="additems-section">
            <h2 className="additems-section-title">Pricing</h2>
            <div className="additems-section-content">
              <div className="additems-two-col">
                <div className="additems-input-group">
                  <label className="additems-label">Price (LKR)<span className="additems-required">*</span></label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="additems-input"
                    placeholder="0.00"
                    min="0.01"
                    step="0.01"
                    required
                  />
                </div>

                <div className="additems-input-group">
                  <label className="additems-label">Quantity<span className="additems-required">*</span></label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    className="additems-input"
                    placeholder="1"
                    required
                    min="1"
                  />
                </div>
              </div>

              <div className="additems-summary">
                <h3 className="additems-summary-title">Item Summary</h3>
                <div className="additems-summary-content">
                  <div className="additems-summary-row">
                    <span>Title:</span>
                    <span>{formData.title || 'Not provided'}</span>
                  </div>
                  <div className="additems-summary-row">
                    <span>Category:</span>
                    <span>{formData.category || 'Not provided'}</span>
                  </div>
                  <div className="additems-summary-row">
                    <span>Price:</span>
                    <span>LKR {formData.price || '0.00'}</span>
                  </div>
                  <div className="additems-summary-row">
                    <span>Shipping:</span>
                    <span>LKR {formData.shippingDetails.cost || '0.00'} ({formData.shippingDetails.method})</span>
                  </div>
                  <div className="additems-summary-row">
                    <span>Images:</span>
                    <span>{images.length} uploaded</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="additems-buttons">
              <button type="button" className="additems-back-button" onClick={prevStep}>
                Back: Shipping
              </button>
              <button
                type="submit"
                disabled={loading}
                className="additems-submit-button"
              >
                {loading ? (
                  <span className="additems-loading">
                    <span className="additems-spinner"></span>
                    Adding Item...
                  </span>
                ) : 'List Item Now'}
              </button>
            </div>
          </section>
        )}
      </form>
    </div>
    <Footer/>
    </>
  );
};

export default AddItem;