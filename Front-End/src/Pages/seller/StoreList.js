// Frontend - components/StoreList.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

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
      <div className="container mx-auto p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2">Loading stores...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (stores.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center">
          <p className="text-gray-600 mb-4">You haven't created any stores yet.</p>
          <Link 
            to="/add-store" 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Create Your First Store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Your Stores</h2>
        <Link 
          to="/add-store" 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add New Store
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stores.map((store) => (
          <div 
            key={store._id} 
            className="border rounded-lg shadow-lg overflow-hidden"
          >
            {store.banner && (
              <div className="h-48 overflow-hidden">
                <img 
                  src={`http://localhost:9000${store.banner}`}
                  alt={store.storeName}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="p-4">
              <div className="flex items-center mb-4">
                {store.logo && (
                  <img 
                    src={`http://localhost:9000${store.logo}`}
                    alt={`${store.storeName} logo`}
                    className="w-12 h-12 rounded-full object-cover mr-3"
                  />
                )}
                <h3 className="text-xl font-semibold">{store.storeName}</h3>
              </div>
              
              <p className="text-gray-600 mb-2">{store.description}</p>
              
              <div className="text-sm text-gray-500">
                <p><strong>Email:</strong> {store.email}</p>
                <p><strong>Phone:</strong> {store.phone}</p>
                <p><strong>Address:</strong> {store.address}</p>
              </div>
              
              <div className="mt-4 text-sm text-gray-400">
                Created on: {new Date(store.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoreList;