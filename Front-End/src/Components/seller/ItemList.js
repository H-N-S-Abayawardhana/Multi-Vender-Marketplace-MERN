// ItemList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../css/seller/itemlist.css';

const ItemList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const sellerEmail = localStorage.getItem('email'); // Get email from localStorage
        const response = await axios.get(`http://localhost:9000/api/items/seller/items?email=${sellerEmail}`);
        setItems(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch items. Please try again later.');
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

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
              <p className="itemlist-price">${item.price.toFixed(2)}</p>
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ItemList;