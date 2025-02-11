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

      {stores.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">You haven't created any stores yet.</p>
          <Link 
            to="/add-store" 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Create Your First Store
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stores.map((store) => (
            <Link
              to={`/store/${store._id}`}
              key={store._id}
              className="block h-[500px] border rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="h-1/2 relative">
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
              
              <div className="p-6 h-1/2">
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden mr-4">
                    {store.logo ? (
                      <img
                        src={`http://localhost:9000${store.logo}`}
                        alt={`${store.storeName} logo`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-xs text-gray-400">No Logo</span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold">{store.storeName}</h3>
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-2">{store.description}</p>
                
                <div className="text-sm text-gray-500">
                  <p className="mb-1"><strong>Email:</strong> {store.email}</p>
                  <p className="mb-1"><strong>Phone:</strong> {store.phone}</p>
                  <p className="mb-1"><strong>Address:</strong> {store.address}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default StoreList;