// Frontend - AddStore.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddStore = () => {
  const navigate = useNavigate();
  
  const [userEmail, setUserEmail] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [previewLogo, setPreviewLogo] = useState(null);
  const [previewBanner, setPreviewBanner] = useState(null);

  useEffect(() => {
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
    description: '',
    logo: null,
    banner: null
  });

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

  const handleImageChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      // Check file size (limit to 5MB)
      if (files[0].size > 5 * 1024 * 1024) {
        setError(`${name === 'logo' ? 'Logo' : 'Banner'} image must be less than 5MB`);
        return;
      }

      // Check file type
      if (!files[0].type.match(/^image\/(jpeg|jpg|png|gif)$/)) {
        setError(`${name === 'logo' ? 'Logo' : 'Banner'} must be an image file (JPEG, PNG, or GIF)`);
        return;
      }

      setFormData({
        ...formData,
        [name]: files[0]
      });

      // Create preview URL
      const previewUrl = URL.createObjectURL(files[0]);
      if (name === 'logo') {
        setPreviewLogo(previewUrl);
      } else {
        setPreviewBanner(previewUrl);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      // Create FormData object to handle file uploads
      const submitFormData = new FormData();
      submitFormData.append('storeName', formData.storeName);
      submitFormData.append('email', formData.email);
      submitFormData.append('phone', formData.phone);
      submitFormData.append('address', formData.address);
      submitFormData.append('description', formData.description);
      submitFormData.append('userEmail', userEmail);
      
      if (formData.logo) {
        submitFormData.append('logo', formData.logo);
      }
      if (formData.banner) {
        submitFormData.append('banner', formData.banner);
      }

      const response = await axios.post('http://localhost:9000/api/stores/add', 
        submitFormData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
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
          <label className="block mb-2">Store Logo:</label>
          <input
            type="file"
            name="logo"
            onChange={handleImageChange}
            className="w-full p-2 border rounded"
            accept="image/*"
          />
          {previewLogo && (
            <div className="mt-2">
              <img src={previewLogo} alt="Logo Preview" className="w-32 h-32 object-cover rounded" />
            </div>
          )}
        </div>

        <div className="mb-4">
          <label className="block mb-2">Store Banner:</label>
          <input
            type="file"
            name="banner"
            onChange={handleImageChange}
            className="w-full p-2 border rounded"
            accept="image/*"
          />
          {previewBanner && (
            <div className="mt-2">
              <img src={previewBanner} alt="Banner Preview" className="w-full h-40 object-cover rounded" />
            </div>
          )}
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