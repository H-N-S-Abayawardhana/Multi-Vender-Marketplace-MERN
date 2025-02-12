import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../../css/seller/storelist.css';
import SellerNavBar from '../../components/seller/sellerNavBar.js'; 
import Footer from '../../components/Footer';

const StoreList = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const userEmail = localStorage.getItem('email') || 
          (localStorage.getItem('userData') && JSON.parse(localStorage.getItem('userData')).email);

        if (!userEmail) {
          setError('User not authenticated');
          setLoading(false);
          return;
        }

        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:9000/api/stores/user-stores`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          params: {
            userEmail: userEmail
          }
        });

        if (response.data.success) {
          setStores(response.data.stores);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch stores');
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  if (loading) {
    return (
      <div className="storelist-sell-loading">
        <div className="storelist-sell-spinner"></div>
        <p>Loading stores...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="storelist-sell-container">
        <div className="storelist-sell-error">
          {error}
        </div>
      </div>
    );
  }

  return (
    <>
    <SellerNavBar />
    <div className="storelist-sell-container">
      <div className="storelist-sell-header">
        <h2>My Stores</h2>

      </div>

      {stores.length === 0 ? (
        <div className="storelist-sell-empty">
          <p>You haven't created any stores yet.</p>
          <Link to="/add-store" className="storelist-sell-create-button">
            Create Your First Store
          </Link>
        </div>
      ) : (
        <div className="storelist-sell-grid">
          {stores.map((store) => (
            <Link
              to={`/store/${store._id}`}
              key={store._id}
              className="storelist-sell-card"
            >
              <div className="storelist-sell-banner">
                {store.banner ? (
                  <img
                    src={`http://localhost:9000${store.banner}`}
                    alt={store.storeName}
                  />
                ) : (
                  <div className="storelist-sell-no-banner">
                    <span>No Banner Image</span>
                  </div>
                )}
              </div>
              
              <div className="storelist-sell-content">
                <div className="storelist-sell-store-header">
                  <div className="storelist-sell-logo">
                    {store.logo ? (
                      <img
                        src={`http://localhost:9000${store.logo}`}
                        alt={`${store.storeName} logo`}
                      />
                    ) : (
                      <div className="storelist-sell-no-logo">
                        <span>No Logo</span>
                      </div>
                    )}
                  </div>
                  <h3>{store.storeName}</h3>
                </div>
                
                <p className="storelist-sell-description">{store.description}</p>
                
                <div className="storelist-sell-details">
                  <div className="storelist-sell-detail-item">
                    <span className="storelist-sell-detail-label">Email:</span>
                    <span className="storelist-sell-detail-value">{store.email}</span>
                  </div>
                  <div className="storelist-sell-detail-item">
                    <span className="storelist-sell-detail-label">Phone:</span>
                    <span className="storelist-sell-detail-value">{store.phone}</span>
                  </div>
                  <div className="storelist-sell-detail-item">
                    <span className="storelist-sell-detail-label">Address:</span>
                    <span className="storelist-sell-detail-value">{store.address}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
    <Footer />
    </>
  );
};

export default StoreList;