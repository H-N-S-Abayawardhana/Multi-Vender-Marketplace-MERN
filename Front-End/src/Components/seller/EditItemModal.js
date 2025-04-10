import React, { useState, useEffect } from 'react';
import '../../css/seller/editItemModal.css';

const EditItemModal = ({ item, onClose, onSave }) => {
  // Ensure nested objects are properly initialized
  const [formData, setFormData] = useState({
    ...item,
    price: item.price.toString(),
    quantity: item.quantity.toString(),
    startingBid: item.startingBid ? item.startingBid.toString() : '',
    dimensions: item.dimensions || {
      length: '',
      width: '',
      height: '',
      weight: ''
    },
    shippingDetails: item.shippingDetails || {
      method: 'Standard',
      cost: '',
      handlingTime: '',
      internationalShipping: false
    },
    returnPolicy: item.returnPolicy || {
      acceptsReturns: false,
      returnPeriod: 30,
      conditions: ''
    },
    paymentMethods: item.paymentMethods || ['PayPal', 'Credit Card']
  });
  
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle checkbox inputs
    if (type === 'checkbox') {
      if (name.includes('.')) {
        const [parent, child] = name.split('.');
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: checked
          }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: checked
        }));
      }
      return;
    }
    
    // Handle nested properties
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

  const handleImageChange = (e) => {
    if (e.target.files.length > 3) {
      setErrors({...errors, images: 'Maximum 3 images allowed'});
      return;
    }
    setImages([...e.target.files]);
    setErrors({...errors, images: null});
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.condition) {
      newErrors.condition = 'Condition is required';
    }

    if (!formData.price || isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'A valid price is required';
    }

    if (!formData.quantity || isNaN(parseInt(formData.quantity)) || parseInt(formData.quantity) < 1) {
      newErrors.quantity = 'A valid quantity is required';
    }

    if (formData.listingType === 'Auction' && (!formData.startingBid || parseFloat(formData.startingBid) <= 0)) {
      newErrors.startingBid = 'A valid starting bid is required for auctions';
    }

    if (formData.shippingDetails && !formData.shippingDetails.cost) {
      newErrors['shippingDetails.cost'] = 'Shipping cost is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Prepare data for submission - keep original item ID
      const updatedItem = {
        ...formData,
        _id: item._id,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        startingBid: formData.startingBid ? parseFloat(formData.startingBid) : undefined,
      };
      
      onSave(updatedItem, images);
    }
  };

  return (
    <div className="edit-modal-overlay">
      <div className="edit-modal-content">
        <div className="edit-modal-header">
          <h2>Edit Item</h2>
          <button className="edit-modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="edit-item-form">
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={errors.title ? 'input-error' : ''}
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={errors.category ? 'input-error' : ''}
            >
              <option value="">Select a category</option>
              <option value="Computer">Computers</option>
              <option value="Clothing">Clothing</option>
              <option value="Home">Home</option>
              <option value="Books">Books</option>
              <option value="Toys">Toys & Games</option>
              <option value="Beauty">Beauty</option>
              <option value="Automotive">Automotive</option>
              <option value="Garden">Garden</option>
              <option value="Health">Health</option>
              <option value="Pet Supplies">Pet Supplies</option>
              <option value="Office Products">Office Products</option>
              <option value="Music">Music</option>
              <option value="Movies">Movies</option>
              <option value="Food">Food</option>
              <option value="Art">Art</option>
              <option value="Collectibles">Collectibles</option>
              <option value="Jewelry">Jewelry</option>
              <option value="Tools">Tools</option>
            </select>
            {errors.category && <span className="error-message">{errors.category}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="condition">Condition</label>
            <select
              id="condition"
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              className={errors.condition ? 'input-error' : ''}
            >
              <option value="">Select condition</option>
              <option value="New">New</option>
              <option value="Used">Used</option>
              <option value="Refurbished">Refurbished</option>
              <option value="Other">Other</option>
            </select>
            {errors.condition && <span className="error-message">{errors.condition}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              rows="4"
            />
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label htmlFor="price">Price (LKR)</label>
              <input
                type="number"
                id="price"
                name="price"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                className={errors.price ? 'input-error' : ''}
              />
              {errors.price && <span className="error-message">{errors.price}</span>}
            </div>

            <div className="form-group half">
              <label htmlFor="quantity">Quantity</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                min="1"
                value={formData.quantity}
                onChange={handleChange}
                className={errors.quantity ? 'input-error' : ''}
              />
              {errors.quantity && <span className="error-message">{errors.quantity}</span>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="listingType">Listing Type</label>
            <select
              id="listingType"
              name="listingType"
              value={formData.listingType}
              onChange={handleChange}
            >
              <option value="Fixed">Fixed Price</option>
              <option value="Auction">Auction</option>
            </select>
          </div>

          {formData.listingType === 'Auction' && (
            <div className="form-group">
              <label htmlFor="startingBid">Starting Bid (LKR)</label>
              <input
                type="number"
                id="startingBid"
                name="startingBid"
                min="0"
                step="0.01"
                value={formData.startingBid || ''}
                onChange={handleChange}
                className={errors.startingBid ? 'input-error' : ''}
              />
              {errors.startingBid && <span className="error-message">{errors.startingBid}</span>}
            </div>
          )}

          <div className="form-row">
            <div className="form-group half">
              <label htmlFor="brand">Brand (Optional)</label>
              <input
                type="text"
                id="brand"
                name="brand"
                value={formData.brand || ''}
                onChange={handleChange}
              />
            </div>

            <div className="form-group half">
              <label htmlFor="model">Model (Optional)</label>
              <input
                type="text"
                id="model"
                name="model"
                value={formData.model || ''}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Shipping Details */}
          <div className="form-section">
            <h3>Shipping Details</h3>
            
            <div className="form-row">
              <div className="form-group half">
                <label htmlFor="shippingMethod">Shipping Method</label>
                <select
                  id="shippingMethod"
                  name="shippingDetails.method"
                  value={formData.shippingDetails?.method || 'Standard'}
                  onChange={handleChange}
                >
                  <option value="Standard">Standard</option>
                  <option value="Express">Express</option>
                  <option value="Priority">Priority</option>
                </select>
              </div>
              
              <div className="form-group half">
                <label htmlFor="shippingCost">Shipping Cost (LKR)</label>
                <input
                  type="number"
                  id="shippingCost"
                  name="shippingDetails.cost"
                  min="0"
                  step="0.01"
                  value={formData.shippingDetails?.cost || ''}
                  onChange={handleChange}
                  className={errors['shippingDetails.cost'] ? 'input-error' : ''}
                />
                {errors['shippingDetails.cost'] && 
                  <span className="error-message">{errors['shippingDetails.cost']}</span>}
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group half">
                <label htmlFor="handlingTime">Handling Time (days)</label>
                <input
                  type="number"
                  id="handlingTime"
                  name="shippingDetails.handlingTime"
                  min="1"
                  value={formData.shippingDetails?.handlingTime || ''}
                  onChange={handleChange}
                />
              </div>
              
              <div className="form-group half checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="shippingDetails.internationalShipping"
                    checked={formData.shippingDetails?.internationalShipping || false}
                    onChange={handleChange}
                  />
                  International Shipping Available
                </label>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="images">Images (Optional - Upload new to replace existing)</label>
            <div className="current-images">
              {item.images && item.images.length > 0 && (
                <div>
                  <p>Current Images:</p>
                  <div className="image-preview-container">
                    {item.images.map((img, index) => (
                      <img 
                        key={index} 
                        src={`http://localhost:9000${img}`} 
                        alt={`Item ${index + 1}`} 
                        className="image-preview"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <input
              type="file"
              id="images"
              name="images"
              onChange={handleImageChange}
              multiple
              accept="image/*"
              className={errors.images ? 'input-error' : ''}
            />
            {errors.images && <span className="error-message">{errors.images}</span>}
            <small>Select multiple files to upload more than one image (max 3)</small>
          </div>

          <div className="edit-modal-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="save-button">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditItemModal;