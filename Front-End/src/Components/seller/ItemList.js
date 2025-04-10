// ItemList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash } from 'react-icons/fa';
import EditItemModal from '../../components/seller/EditItemModal';
import '../../css/seller/itemlist.css';

const ItemList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const sellerEmail = localStorage.getItem('email');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:9000/api/items/seller/items?email=${sellerEmail}`);
      setItems(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch items. Please try again later.');
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setCurrentItem(item);
    setShowEditModal(true);
  };

  const handleUpdate = async (updatedItem, itemImages) => {
    try {
      const formData = new FormData();
      
      // Add all item data to formData
      Object.keys(updatedItem).forEach(key => {
        if (key !== 'images' && key !== '_id') {
          if (typeof updatedItem[key] === 'object' && updatedItem[key] !== null) {
            formData.append(key, JSON.stringify(updatedItem[key]));
          } else {
            formData.append(key, updatedItem[key]);
          }
        }
      });
      
      // Add new images if any
      if (itemImages && itemImages.length > 0) {
        for (let i = 0; i < itemImages.length; i++) {
          formData.append('images', itemImages[i]);
        }
      }

      await axios.put(
        `http://localhost:9000/api/items/${updatedItem._id}?email=${sellerEmail}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setShowEditModal(false);
      await fetchItems(); // Refresh the items list
    } catch (err) {
      console.error('Failed to update item:', err);
      alert('Failed to update item. Please try again.');
    }
  };

  const confirmDelete = (itemId) => {
    setDeleteConfirm(itemId);
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  const handleDelete = async (itemId) => {
    try {
      await axios.delete(`http://localhost:9000/api/items/${itemId}?email=${sellerEmail}`);
      await fetchItems(); // Refresh the items list
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Failed to delete item:', err);
      alert('Failed to delete item. Please try again.');
    }
  };

  if (loading) {
    return <div className="itemlist-loading">Loading...</div>;
  }

  if (error) {
    return <div className="itemlist-error">{error}</div>;
  }

  if (items.length === 0) {
    return <div className="itemlist-empty">No items found. Start adding items to your inventory!</div>;
  }

  return (
    <div className="itemlist-container">
      <h2 className="itemlist-title">Your Listed Items</h2>
      <div className="itemlist-grid">
        {items.map((item) => (
          <div key={item._id} className="itemlist-card">
            <div className="itemlist-image-container">
              {item.images && item.images.length > 0 && (
                <img 
                  src={`http://localhost:9000${item.images[0]}`} 
                  alt={item.title} 
                  className="user-itemlist-image"
                />
              )}
            </div>
            <div className="itemlist-content">
              <h3 className="itemlist-item-title">{item.title}</h3>
              <p className="itemlist-price">LKR {item.price.toFixed(2)}</p>
              <p className="itemlist-category">{item.category}</p>
              <div className="itemlist-details">
                <span className="itemlist-condition">{item.condition}</span>
                <span className="itemlist-quantity">Stock: {item.quantity}</span>
              </div>
              <p className="itemlist-description">
                {item.description?.slice(0, 100)}
                {item.description?.length > 100 ? '...' : ''}
              </p>
              <div className="itemlist-status">
                <span className="itemlist-listing-type">{item.listingType}</span>
                {item.listingType === 'Auction' && (
                  <span className="itemlist-bid">
                    Starting bid: ${item.startingBid}
                  </span>
                )}
              </div>
              <div className="itemlist-actions">
                <button 
                  className="itemlist-edit-btn"
                  onClick={() => handleEdit(item)}
                >
                  <FaEdit /> Edit
                </button>
                
                {deleteConfirm === item._id ? (
                  <div className="itemlist-confirm-delete">
                    <p>Are you sure?</p>
                    <button 
                      className="itemlist-confirm-yes" 
                      onClick={() => handleDelete(item._id)}
                    >
                      Yes
                    </button>
                    <button 
                      className="itemlist-confirm-no" 
                      onClick={cancelDelete}
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button 
                    className="itemlist-delete-btn"
                    onClick={() => confirmDelete(item._id)}
                  >
                    <FaTrash /> Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showEditModal && (
        <EditItemModal
          item={currentItem}
          onClose={() => setShowEditModal(false)}
          onSave={handleUpdate}
        />
      )}
    </div>
  );
};

export default ItemList;