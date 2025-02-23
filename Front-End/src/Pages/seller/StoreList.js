import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import '../../css/seller/storelist.css';
import SellerNavBar from '../../components/seller/sellerNavBar.js'; 
import Footer from '../../components/Footer';

const StoreList = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
          // If user has exactly one store, redirect to that store's details page
          if (response.data.stores.length === 1) {
            navigate(`/store/${response.data.stores[0]._id}`);
            return;
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch stores');
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, [navigate]);

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

  // Only render the store list page if the user has no stores
  return (
    <>
    <SellerNavBar />
    <div className="storelist-sell-container">
      <div className="storelist-sell-header">
        <h2>My Store</h2>
      </div>

      <div className="storelist-sell-empty">
        <p>You haven't created a store yet.</p>
        <Link to="/add-store" className="storelist-sell-create-button">
          Create Your Store
        </Link>
      </div>
    </div>
    <Footer />
    </>
  );
};

export default StoreList;