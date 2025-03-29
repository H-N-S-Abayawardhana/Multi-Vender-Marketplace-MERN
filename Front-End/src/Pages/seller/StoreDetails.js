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
          <i className="fas fa-exclamation-triangle"></i>
          <p>{error}</p>
          <Link to="/stores" className="storedetails-sell-btn storedetails-sell-btn-primary">
            Return to Stores
          </Link>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="storedetails-sell-container">
        <div className="storedetails-sell-error">
          <i className="fas fa-store-slash"></i>
          <p>Store not found</p>
          <Link to="/stores" className="storedetails-sell-btn storedetails-sell-btn-primary">
            Back to Stores
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <SellerNavBar />
      <div className="storedetails-sell-wrapper">
        <div className="storedetails-sell-container">
          <div className="storedetails-sell-header">
            <Link to="/stores" className="storedetails-sell-back-link">
              <i className="fas fa-arrow-left"></i> Back to Stores
            </Link>
            <div className="storedetails-sell-action-buttons">
              <button
                onClick={handleEdit}
                className="storedetails-sell-btn storedetails-sell-btn-primary"
                disabled={isEditing}
              >
                <i className="fas fa-edit"></i> Edit Store
              </button>
              <button
                onClick={handleDelete}
                className="storedetails-sell-btn storedetails-sell-btn-danger"
              >
                <i className="fas fa-trash-alt"></i> Delete Store
              </button>
            </div>
          </div>

          {isEditing ? (
            <div className="storedetails-sell-card storedetails-sell-edit-card">
              <div className="storedetails-sell-form">
                <h2 className="storedetails-sell-edit-title">Edit Store Information</h2>
                <form onSubmit={handleUpdateStore}>
                  <div className="storedetails-sell-form-group">
                    <label className="storedetails-sell-label">
                      <i className="fas fa-store"></i> Store Name
                    </label>
                    <input
                      type="text"
                      name="storeName"
                      value={editForm.storeName}
                      onChange={handleEditChange}
                      className="storedetails-sell-input"
                      placeholder="Enter store name"
                      required
                    />
                  </div>
                  
                  <div className="storedetails-sell-form-group">
                    <label className="storedetails-sell-label">
                      <i className="fas fa-phone-alt"></i> Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={editForm.phone}
                      onChange={handleEditChange}
                      className="storedetails-sell-input"
                      placeholder="Enter phone number"
                      required
                    />
                  </div>

                  <div className="storedetails-sell-form-group">
                    <label className="storedetails-sell-label">
                      <i className="fas fa-map-marker-alt"></i> Address
                    </label>
                    <textarea
                      name="address"
                      value={editForm.address}
                      onChange={handleEditChange}
                      className="storedetails-sell-textarea"
                      placeholder="Enter store address"
                      required
                    />
                  </div>

                  <div className="storedetails-sell-form-group">
                    <label className="storedetails-sell-label">
                      <i className="fas fa-align-left"></i> Description
                    </label>
                    <textarea
                      name="description"
                      value={editForm.description}
                      onChange={handleEditChange}
                      className="storedetails-sell-textarea"
                      placeholder="Enter store description"
                      rows="4"
                      required
                    />
                  </div>

                  <div className="storedetails-sell-form-buttons">
                    <button
                      type="submit"
                      className="storedetails-sell-btn storedetails-sell-btn-success"
                    >
                      <i className="fas fa-save"></i> Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="storedetails-sell-btn storedetails-sell-btn-secondary"
                    >
                      <i className="fas fa-times"></i> Cancel
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
                    <i className="fas fa-image"></i>
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
                      <div className="storedetails-sell-logo-placeholder">
                        <i className="fas fa-store"></i>
                      </div>
                    )}
                  </div>
                  <div className="storedetails-sell-store-info">
                    <h1 className="storedetails-sell-store-name">{store.storeName}</h1>
                    <div className="storedetails-sell-date">
                      <i className="fas fa-calendar-alt"></i>
                      <span>Created on: {new Date(store.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric'
                      })}</span>
                    </div>
                  </div>
                </div>

                <div className="storedetails-sell-stats">
                  <div className="storedetails-sell-stat-item">
                    <i className="fas fa-box"></i>
                    <div className="storedetails-sell-stat-content">
                      <span className="storedetails-sell-stat-value">{store.products?.length || 0}</span>
                      <span className="storedetails-sell-stat-label">Products</span>
                    </div>
                  </div>
                  <div className="storedetails-sell-stat-item">
                    <i className="fas fa-shopping-cart"></i>
                    <div className="storedetails-sell-stat-content">
                      <span className="storedetails-sell-stat-value">{store.orders?.length || 0}</span>
                      <span className="storedetails-sell-stat-label">Orders</span>
                    </div>
                  </div>
                  <div className="storedetails-sell-stat-item">
                    <i className="fas fa-star"></i>
                    <div className="storedetails-sell-stat-content">
                      <span className="storedetails-sell-stat-value">{store.rating || "N/A"}</span>
                      <span className="storedetails-sell-stat-label">Rating</span>
                    </div>
                  </div>
                </div>

                <div className="storedetails-sell-info-grid">
                  <div className="storedetails-sell-info-section">
                    <h2><i className="fas fa-info-circle"></i> Store Information</h2>
                    <div className="storedetails-sell-info-item">
                      <i className="fas fa-envelope"></i>
                      <div>
                        <strong>Email:</strong>
                        <span>{store.email}</span>
                      </div>
                    </div>
                    <div className="storedetails-sell-info-item">
                      <i className="fas fa-phone-alt"></i>
                      <div>
                        <strong>Phone:</strong>
                        <span>{store.phone}</span>
                      </div>
                    </div>
                    <div className="storedetails-sell-info-item">
                      <i className="fas fa-map-marker-alt"></i>
                      <div>
                        <strong>Address:</strong>
                        <span>{store.address}</span>
                      </div>
                    </div>
                  </div>

                  <div className="storedetails-sell-info-section">
                    <h2><i className="fas fa-align-left"></i> Description</h2>
                    <p className="storedetails-sell-description">{store.description}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
                  <div className="storedetails-sell-items-section">
          <div className="storedetails-sell-items-header">
            <h2 className="storedetails-sell-items-title">
              <i className="fas fa-box"></i> Store Products
            </h2>
            <Link to={`/add-items`} className="storedetails-sell-btn storedetails-sell-btn-primary">
              <i className="fas fa-plus"></i> Add Items
            </Link>
          </div>
          <ItemList storeId={id} />
        </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default StoreDetails;