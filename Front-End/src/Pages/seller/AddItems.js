import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../css/seller/additems.css';

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

  // Predefined categories list
  const predefinedCategories = [
    'Electronics',
    'Clothing',
    'Home',
    'Books',
    'Sports',
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

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

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
    setImages([...e.target.files]);
    toast.success('Images uploaded successfully');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.title.trim() || !formData.category) {
      toast.error('Please fill in all required fields');
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
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'An error occurred while adding the item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="additems-container">
      <ToastContainer />
      <h1 className="additems-title">Add New Item</h1>

      <form onSubmit={handleSubmit} className="additems-form">
        {/* Basic Information */}
        <section className="additems-section">
          <h2 className="additems-section-title">Basic Information</h2>
          <div className="additems-input-group">
            <label className="additems-label">Seller Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              className="additems-input"
              readOnly
              disabled
              style={{ backgroundColor: '#f0f0f0' }}
            />
          </div>

          <div className="additems-input-group">
            <label className="additems-label">Title*</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="additems-input"
              required
            />
          </div>

          <div className="additems-input-group">
            <label className="additems-label">Description*</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="additems-input"
              rows="4"
              required
            />
          </div>

          <div className="additems-input-group">
            <label className="additems-label">Category*</label>
            <div className="category-input-container" ref={suggestionRef}>
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
                  className="add-custom-category-btn"
                >
                  Add Custom
                </button>
              )}
              {showSuggestions && filteredCategories.length > 0 && (
                <div className="category-suggestions">
                  {filteredCategories.map((category, index) => (
                    <div
                      key={index}
                      className="category-suggestion-item"
                      onClick={() => handleCategorySelect(category)}
                    >
                      {category}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="additems-input-group">
            <label className="additems-label">Brand</label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              className="additems-input"
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
            />
          </div>

          <div className="additems-input-group">
            <label className="additems-label">Color (Optional)</label>
            <input
              type="text"
              name="color"
              value={formData.color}
              onChange={handleChange}
              className="additems-input"
            />
          </div>

          <div className="additems-input-group">
            <label className="additems-label">Material (Optional)</label>
            <input
              type="text"
              name="material"
              value={formData.material}
              onChange={handleChange}
              className="additems-input"
            />
          </div>

          <div className="additems-input-group">
            <label className="additems-label">Condition*</label>
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
        </section>

        {/* Images Upload */}
        <section className="additems-section">
          <h2 className="additems-section-title">Images</h2>
          <div className="additems-input-group">
            <label className="additems-label">Upload Images* (Maximum 3)</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="additems-file-input"
              required
            />
          </div>
        </section>

        {/* Shipping Details */}
        <section className="additems-section">
          <h2 className="additems-section-title">Shipping Details</h2>
          <div className="additems-input-group">
            <label className="additems-label">Shipping Method*</label>
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

          <div className="additems-input-group">
            <label className="additems-label">Shipping Cost*</label>
            <input
              type="number"
              name="shippingDetails.cost"
              value={formData.shippingDetails.cost}
              onChange={handleChange}
              className="additems-input"
              required
            />
          </div>

          <div className="additems-input-group">
            <label className="additems-label">Handling Time (days)*</label>
            <input
              type="number"
              name="shippingDetails.handlingTime"
              value={formData.shippingDetails.handlingTime}
              onChange={handleChange}
              className="additems-input"
              required
            />
          </div>

          <div className="additems-input-group">
            <label className="additems-label">
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
              />
              International Shipping Available
            </label>
          </div>
        </section>

        {/* Price Information */}
        <section className="additems-section">
          <h2 className="additems-section-title">Pricing</h2>
          <div className="additems-input-group">
            <label className="additems-label">Price*</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="additems-input"
              required
            />
          </div>

          <div className="additems-input-group">
            <label className="additems-label">Quantity*</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className="additems-input"
              required
              min="1"
            />
          </div>
        </section>

        <button
          type="submit"
          disabled={loading}
          className="additems-submit-button"
        >
          {loading ? 'Adding Item...' : 'Add Item'}
        </button>
      </form>
    </div>
  );
};

export default AddItem;