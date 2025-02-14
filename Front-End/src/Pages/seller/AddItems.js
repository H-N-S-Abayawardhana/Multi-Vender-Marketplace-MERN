import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
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
  useEffect(() => {
    const userEmail = localStorage.getItem('email');
    if (userEmail) {
      setFormData(prev => ({
        ...prev,
        email: userEmail
      }));
    }
  }, []);

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files.length > 3) {
      toast.error('Maximum 3 images allowed', {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
      return;
    }
    setImages([...e.target.files]);
    toast.success('Images uploaded successfully', {
      position: "top-center",
      autoClose: 2000
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation checks
    if (!formData.title.trim()) {
      toast.error('Please enter a title', {
        position: "top-center",
        autoClose: 3000
      });
      setLoading(false);
      return;
    }

    if (!formData.category) {
      toast.error('Please select a category', {
        position: "top-center",
        autoClose: 3000
      });
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
          position: "top-center",
          autoClose: 2000,
          onClose: () => navigate(`/store`)
        });
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'An error occurred while adding the item';
      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
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
             {/* Add this new email field */}
             <div className="additems-input-group">
              <label className="additems-label">Seller Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                className="additems-input"
                readOnly
                disabled
                style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
              />
            </div>
            <div className="additems-input-group">
              <label className="additems-label">Title</label>
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
              <label className="additems-label">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="additems-select"
                required
              >
                <option value="">Select Category</option>
                <option value="Electronics">Electronics</option>
                <option value="Clothing">Clothing</option>
                <option value="Home">Home</option>
              </select>
            </div>

            <div className="additems-input-group">
              <label className="additems-label">Condition</label>
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
        </section>

        {/* Images Upload */}
        <section className="additems-section">
          <h2 className="additems-section-title">Images</h2>
          <div className="additems-input-group">
            <label className="additems-label">
              Upload Images (Maximum 3)
            </label>
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

        {/* Price Information */}
        <section className="additems-section">
          <h2 className="additems-section-title">Pricing</h2>
          <div className="additems-input-group">
            <div className="additems-input-group">
              <label className="additems-label">Price</label>
              <div className="additems-price-input">
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="additems-input"
                  required
                />
              </div>
            </div>

            <div className="additems-input-group">
              <label className="additems-label">Quantity</label>
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