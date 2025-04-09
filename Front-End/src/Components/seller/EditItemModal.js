// EditItemModal.js
import React, { useState } from 'react';
import '../../css/seller/editItemModal.css';

const EditItemModal = ({ item, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    ...item,
    price: item.price.toString(),
    quantity: item.quantity.toString(),
  });
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageChange = (e) => {
    setImages([...e.target.files]);
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

    if (formData.listingType === 'Auction' && (!formData.startingBid || formData.startingBid <= 0)) {
      newErrors.startingBid = 'A valid starting bid is required for auctions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Prepare data for submission
      const updatedItem = {
        ...formData,
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
              <option value="Electronics">Electronics</option>
              <option value="Clothing">Clothing</option>
              <option value="Home & Garden">Home & Garden</option>
              <option value="Toys & Games">Toys & Games</option>
              <option value="Sports & Outdoors">Sports & Outdoors</option>
              <option value="Books & Media">Books & Media</option>
              <option value="Health & Beauty">Health & Beauty</option>
              <option value="Automotive">Automotive</option>
              <option value="Other">Other</option>
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

          <div className="form-group">
            <label htmlFor="brand">Brand (Optional)</label>
            <input
              type="text"
              id="brand"
              name="brand"
              value={formData.brand || ''}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="model">Model (Optional)</label>
            <input
              type="text"
              id="model"
              name="model"
              value={formData.model || ''}
              onChange={handleChange}
            />
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
            />
            <small>Select multiple files to upload more than one image</small>
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