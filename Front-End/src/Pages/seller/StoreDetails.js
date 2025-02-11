import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';

const StoreDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
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
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch store details');
      } finally {
        setLoading(false);
      }
    };

    fetchStoreDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2">Loading store details...</p>
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

  if (!store) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Store not found</p>
          <Link 
            to="/stores" 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Back to Stores
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <Link 
          to="/stores" 
          className="text-blue-500 hover:text-blue-600"
        >
          ← Back to Stores
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="h-80 relative">
          {store.banner ? (
            <img
              src={`http://localhost:9000${store.banner}`}
              alt={store.storeName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">No Banner Image</span>
            </div>
          )}
        </div>

        <div className="p-8">
          <div className="flex items-center mb-6">
            <div className="w-24 h-24 rounded-full overflow-hidden mr-6">
              {store.logo ? (
                <img
                  src={`http://localhost:9000${store.logo}`}
                  alt={`${store.storeName} logo`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">No Logo</span>
                </div>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">{store.storeName}</h1>
              <p className="text-gray-500">Created on: {new Date(store.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Store Information</h2>
              <div className="space-y-3">
                <p><strong>Email:</strong> {store.email}</p>
                <p><strong>Phone:</strong> {store.phone}</p>
                <p><strong>Address:</strong> {store.address}</p>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Description</h2>
              <p className="text-gray-600">{store.description}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreDetails;