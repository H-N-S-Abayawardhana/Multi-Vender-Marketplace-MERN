// Frontend - AddStore.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddStore = () => {
  const navigate = useNavigate();
  
  // Get user data from localStorage
  const [userEmail, setUserEmail] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check localStorage for authentication data
    const storedEmail = localStorage.getItem('email');
    const storedUserData = localStorage.getItem('userData');
    const storedToken = localStorage.getItem('token');

    if (storedEmail || (storedUserData && JSON.parse(storedUserData).email)) {
      setUserEmail(storedEmail || JSON.parse(storedUserData).email);
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      navigate('/login');
    }
  }, [navigate]);

  const [formData, setFormData] = useState({
    storeName: '',
    email: '',
    phone: '',
    address: '',
    description: ''
  });

  // Update form data when userEmail is set
  useEffect(() => {
    if (userEmail) {
      setFormData(prev => ({
        ...prev,
        email: userEmail
      }));
    }
  }, [userEmail]);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:9000/api/stores/add', 
        {
          ...formData,
          userEmail
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while creating the store');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          Checking authentication status...
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Add New Store</h2>
      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      
      <form onSubmit={handleSubmit} className="max-w-lg">
        <div className="mb-4">
          <label className="block mb-2">Store Name:</label>
          <input
            type="text"
            name="storeName"
            value={formData.storeName}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Email (from your login):</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            className="w-full p-2 border rounded bg-gray-100"
            readOnly
            disabled
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Phone:</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Address:</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Description:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Store'}
        </button>
      </form>
    </div>
  );
};

export default AddStore;