// UserItemList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, CreditCard } from 'lucide-react';
import '../../src/css/useritemlist.css'

const UserItemList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get('http://localhost:9000/api/items/all');
        setItems(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch items. Please try again later.');
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const handleAddToCart = (item) => {
    // TODO: Implement cart functionality
    console.log('Added to cart:', item);
  };

  const handleBuyNow = (item) => {
    // TODO: Implement buy functionality
    console.log('Buy now:', item);
  };

  if (loading) {
    return <div className="user-itemlist-loading">Loading...</div>;
  }

  if (error) {
    return <div className="user-itemlist-error">{error}</div>;
  }

  if (items.length === 0) {
    return <div className="user-itemlist-empty">No items available at the moment.</div>;
  }

  return (
    <div className="user-itemlist-container">
      <h2 className="user-itemlist-title">Available Items</h2>
      <div className="user-itemlist-grid">
        {items.map((item) => (
          <div key={item._id} className="user-itemlist-card">
            <div className="user-itemlist-image-container">
              {item.images && item.images.length > 0 && (
                <img 
                  src={item.images[0]} 
                  alt={item.title} 
                  className="user-itemlist-image"
                />
              )}
              {item.quantity < 5 && item.quantity > 0 && (
                <span className="user-itemlist-low-stock">
                  Only {item.quantity} left!
                </span>
              )}
              {item.quantity === 0 && (
                <span className="user-itemlist-out-of-stock">
                  Out of Stock
                </span>
              )}
            </div>
            <div className="user-itemlist-content">
              <h3 className="user-itemlist-item-title">{item.title}</h3>
              <p className="user-itemlist-price">${item.price.toFixed(2)}</p>
              <div className="user-itemlist-details">
                <span className="user-itemlist-condition">{item.condition}</span>
                <span className="user-itemlist-category">{item.category}</span>
              </div>
              <p className="user-itemlist-description">
                {item.description?.slice(0, 100)}
                {item.description?.length > 100 ? '...' : ''}
              </p>
              <div className="user-itemlist-buttons">
                <button 
                  className="user-itemlist-cart-btn"
                  onClick={() => handleAddToCart(item)}
                  disabled={item.quantity === 0}
                >
                  <ShoppingCart size={18} />
                  Add to Cart
                </button>
                <button 
                  className="user-itemlist-buy-btn"
                  onClick={() => handleBuyNow(item)}
                  disabled={item.quantity === 0}
                >
                  <CreditCard size={18} />
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserItemList;