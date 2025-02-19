import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../../css/seller/storedetails.css';
import SellerNavBar from '../../components/seller/sellerNavBar.js'; 
import Footer from '../../components/Footer';
import ItemList from '../../components/seller/ItemList.js';

const StoreDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    storeName: '',
    phone: '',
    address: '',
    description: ''
  });

  useEffect(() => {
    fetchStoreDetails();
  }, [id]);

  const fetchStoreDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:9000/api/stores/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setStore(response.data.store);
        setEditForm({
          storeName: response.data.store.storeName,
          phone: response.data.store.phone,
          address: response.data.store.address,
          description: response.data.store.description
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch store details');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdateStore = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:9000/api/stores/${id}`,
        editForm,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setStore(response.data.store);
        setIsEditing(false);
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Store updated successfully'
        });
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.message || 'Failed to update store'
      });
    }
  };

  const handleDelete = async () => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
      });

      if (result.isConfirmed) {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:9000/api/stores/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        Swal.fire(
          'Deleted!',
          'Your store has been deleted.',
          'success'
        );
        navigate('/stores');
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.message || 'Failed to delete store'
      });
    }
  };

  if (loading) {
    return (
      <div className="storedetails-sell-container">
        <div className="storedetails-sell-loading">
          <div className="storedetails-sell-spinner"></div>
          <p>Loading store details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="storedetails-sell-container">
        <div className="storedetails-sell-error">
          {error}
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="storedetails-sell-container">
        <div className="storedetails-sell-error">
          <p>Store not found</p>
          <Link 
            to="/stores" 
            className="storedetails-sell-btn storedetails-sell-btn-primary"
          >
            Back to Stores
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
    <SellerNavBar />
    <div className="storedetails-sell-container">
      <div className="storedetails-sell-header">
        <Link 
          to="/stores" 
          className="storedetails-sell-back-link"
        >
          ← Back to Stores
        </Link>
        <div className="storedetails-sell-action-buttons">
          <button
            onClick={handleEdit}
            className="storedetails-sell-btn storedetails-sell-btn-primary"
            disabled={isEditing}
          >
            Edit Store
          </button>
          <button
            onClick={handleDelete}
            className="storedetails-sell-btn storedetails-sell-btn-danger"
          >
            Delete Store
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="storedetails-sell-card">
          <div className="storedetails-sell-form">
            <h2 className="storedetails-sell-store-name">Edit Store</h2>
            <form onSubmit={handleUpdateStore}>
              <div className="storedetails-sell-form-group">
                <label className="storedetails-sell-label">Store Name</label>
                <input
                  type="text"
                  name="storeName"
                  value={editForm.storeName}
                  onChange={handleEditChange}
                  className="storedetails-sell-input"
                  required
                />
              </div>
              
              <div className="storedetails-sell-form-group">
                <label className="storedetails-sell-label">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={editForm.phone}
                  onChange={handleEditChange}
                  className="storedetails-sell-input"
                  required
                />
              </div>

              <div className="storedetails-sell-form-group">
                <label className="storedetails-sell-label">Address</label>
                <textarea
                  name="address"
                  value={editForm.address}
                  onChange={handleEditChange}
                  className="storedetails-sell-textarea"
                  required
                />
              </div>

              <div className="storedetails-sell-form-group">
                <label className="storedetails-sell-label">Description</label>
                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={handleEditChange}
                  className="storedetails-sell-textarea"
                  required
                />
              </div>

              <div className="storedetails-sell-form-buttons">
                <button
                  type="submit"
                  className="storedetails-sell-btn storedetails-sell-btn-primary"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="storedetails-sell-btn storedetails-sell-btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="storedetails-sell-card">
          <div className="storedetails-sell-banner">
            {store.banner ? (
              <img
                src={`http://localhost:9000${store.banner}`}
                alt={store.storeName}
              />
            ) : (
              <div className="storedetails-sell-banner-placeholder">
                <span>No Banner Image</span>
              </div>
            )}
          </div>

          <div className="storedetails-sell-content">
            <div className="storedetails-sell-profile">
              <div className="storedetails-sell-logo">
                {store.logo ? (
                  <img
                    src={`http://localhost:9000${store.logo}`}
                    alt={`${store.storeName} logo`}
                  />
                ) : (
                  <div className="storedetails-sell-banner-placeholder">
                    <span>No Logo</span>
                  </div>
                )}
              </div>
              <div>
                <h1 className="storedetails-sell-store-name">{store.storeName}</h1>
                <p className="storedetails-sell-date">
                  Created on: {new Date(store.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="storedetails-sell-info-grid">
              <div className="storedetails-sell-info-section">
                <h2>Store Information</h2>
                <div className="storedetails-sell-info-item">
                  <strong>Email:</strong> {store.email}
                </div>
                <div className="storedetails-sell-info-item">
                  <strong>Phone:</strong> {store.phone}
                </div>
                <div className="storedetails-sell-info-item">
                  <strong>Address:</strong> {store.address}
                </div>
              </div>

              <div className="storedetails-sell-info-section">
                <h2>Description</h2>
                <p className="storedetails-sell-description">{store.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    <ItemList/>
    <Footer />
    </>
  );
};

export default StoreDetails;