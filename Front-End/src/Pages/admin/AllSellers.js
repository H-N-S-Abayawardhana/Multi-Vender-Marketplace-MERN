import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaStore, FaUserTimes, FaSearch } from 'react-icons/fa';
import { BiTime } from 'react-icons/bi';
import { toast } from 'react-toastify';
import '../../css/admin/AllSellers.css';
import AdminNavBar from '../../components/admin/adminNavBar';
import Footer from '../../components/Footer';

const AllSellers = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  // Fetch all sellers on component mount
  useEffect(() => {
    fetchSellers();
  }, []);

  // Function to fetch all sellers
  const fetchSellers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:9000/api/users/sellers', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setSellers(response.data.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch sellers');
      console.error('Error fetching sellers:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to delete a seller
  const deleteSeller = async (id) => {
    setDeleteLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:9000/api/users/sellers/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setSellers(sellers.filter(seller => seller._id !== id));
      toast.success('Seller deleted successfully');
      setConfirmDelete(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete seller');
      console.error('Error deleting seller:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Format date to readable format
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Filter sellers based on search term
  const filteredSellers = sellers.filter(seller => 
    seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seller.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seller.mobile.includes(searchTerm)
  );

  return (
    <>
    <AdminNavBar/>
    <div className="all-sellers-container">
      <div className="all-sellers-header">
        <h1>All Sellers</h1>
        <div className="all-sellers-search">
          <FaSearch className="all-sellers-search-icon" />
          <input
            type="text"
            placeholder="Search by name, email or mobile..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="all-sellers-loading">
          <div className="all-sellers-spinner"></div>
          <p>Loading sellers...</p>
        </div>
      ) : (
        <>
          <div className="all-sellers-stats">
            <div className="all-sellers-stat-card">
              <h3>Total Sellers</h3>
              <p>{sellers.length}</p>
            </div>
            <div className="all-sellers-stat-card">
              <h3>With Stores</h3>
              <p>{sellers.filter(seller => seller.hasStore).length}</p>
            </div>
            <div className="all-sellers-stat-card">
              <h3>Without Stores</h3>
              <p>{sellers.filter(seller => !seller.hasStore).length}</p>
            </div>
          </div>

          {filteredSellers.length === 0 ? (
            <div className="all-sellers-empty">
              <p>No sellers found matching your search.</p>
            </div>
          ) : (
            <div className="all-sellers-table-container">
              <table className="all-sellers-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Mobile</th>
                    <th>Store</th>
                    <th>Last Login</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSellers.map((seller) => (
                    <tr key={seller._id} className={seller.isActive ? '' : 'all-sellers-inactive'}>
                      <td>{seller.name}</td>
                      <td>{seller.email}</td>
                      <td>{seller.mobile}</td>
                      <td>
                        {seller.hasStore ? (
                          <div className="all-sellers-store">
                            <FaStore className="all-sellers-store-icon" />
                            <span title={seller.storeName}>{seller.storeName}</span>
                          </div>
                        ) : (
                          <span className="all-sellers-no-store">No Store</span>
                        )}
                      </td>
                      <td>
                        <div className="all-sellers-date">
                          <BiTime className="all-sellers-time-icon" />
                          {formatDate(seller.lastLogin)}
                        </div>
                      </td>
                      <td>{formatDate(seller.createdAt)}</td>
                      <td>
                        {confirmDelete === seller._id ? (
                          <div className="all-sellers-confirm">
                            <button 
                              className="all-sellers-confirm-yes"
                              onClick={() => deleteSeller(seller._id)}
                              disabled={deleteLoading}
                            >
                              {deleteLoading ? 'Deleting...' : 'Yes'}
                            </button>
                            <button 
                              className="all-sellers-confirm-no"
                              onClick={() => setConfirmDelete(null)}
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            className="all-sellers-delete-btn"
                            onClick={() => setConfirmDelete(seller._id)}
                          >
                            <FaUserTimes /> Remove
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
    <Footer/>
    </>
  );
};

export default AllSellers;