import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../css/admin/admin-view-stores.css';
import AdminNavBar from '../../components/admin/adminNavBar';
import Footer from '../../components/Footer';

const AllStores = () => {
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [message, setMessage] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const response = await axios.get('http://localhost:9000/api/stores');
      setStores(response.data.stores);
    } catch (error) {
      console.error('Error fetching stores:', error);
    }
  };

  const handleMessageSubmit = (e, store) => {
    e.preventDefault();
    
    alert(`Message sent to ${store.sellerInfo.name}: ${message}`);
    setMessage('');
    setShowModal(false);
  };

  const MessageModal = ({ store, onClose }) => (
    <div className="admin-view-stores-modal">
      <div className="admin-view-stores-modal-content">
        <span className="admin-view-stores-modal-close" onClick={onClose}>&times;</span>
        <h3>Send Message to {store.sellerInfo.name}</h3>
        <form onSubmit={(e) => handleMessageSubmit(e, store)}>
          <textarea
            className="admin-view-stores-textarea"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
            required
          />
          <button type="submit" className="admin-view-stores-button">
            Send Message
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      <AdminNavBar />
      <div className="admin-view-stores-container">
        <div className="admin-view-stores-header">
          <h1 className="admin-view-stores-title">All Stores</h1>
        </div>
        
        <div className="admin-view-stores-grid">
          {stores.map((store) => (
            <div key={store._id} className="admin-view-stores-card">
              <div className="admin-view-stores-banner-container">
                <img 
                  src={`http://localhost:9000${store.banner || '/default-banner.jpg'}`} 
                  alt={`${store.storeName} banner`}
                  className="admin-view-stores-banner"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x150?text=No+Banner';
                  }}
                />
              </div>
              
              <div className="admin-view-stores-logo-container">
                <img 
                  src={`http://localhost:9000${store.logo || '/default-logo.jpg'}`} 
                  alt={`${store.storeName} logo`}
                  className="admin-view-stores-logo"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/80x80?text=Logo';
                  }}
                />
              </div>
              
              <div className="admin-view-stores-content">
                <h2 className="admin-view-stores-store-name">{store.storeName}</h2>
                <p className="admin-view-stores-description">{store.description || "No description available"}</p>
                
                <div className="admin-view-stores-seller-info">
                  <h3 className="admin-view-stores-seller-title">Seller Information</h3>
                  <p><strong>Name:</strong> {store.sellerInfo?.name || "N/A"}</p>
                  <p><strong>Email:</strong> {store.sellerInfo?.email || "N/A"}</p>
                  <p><strong>Phone:</strong> {store.sellerInfo?.phone || "N/A"}</p>
                </div>
                
                <button
                  className="admin-view-stores-button"
                  onClick={() => {
                    setSelectedStore(store);
                    setShowModal(true);
                  }}
                >
                  Contact Seller
                </button>
              </div>
            </div>
          ))}
        </div>

        {showModal && selectedStore && (
          <MessageModal
            store={selectedStore}
            onClose={() => {
              setShowModal(false);
              setSelectedStore(null);
              setMessage('');
            }}
          />
        )}
      </div>
      <Footer />
    </>
  );
};

export default AllStores;