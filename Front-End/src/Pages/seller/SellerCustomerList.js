import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaUserAlt, FaSearch, FaSort, FaPhone, FaEnvelope } from 'react-icons/fa';
import { BiTime } from 'react-icons/bi';
import { toast } from 'react-toastify';
import '../../css/admin/CustomersList.css';
import AdminNavBar from '../../components/seller/sellerNavBar';
import Footer from '../../components/Footer';

const CustomersList = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
    const [currentPage, setCurrentPage] = useState(1);
    const [customersPerPage] = useState(10);

    // Fetch all customers on component mount
    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');
                
                const response = await axios.get('http://localhost:9000/api/users/customers', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                
                setCustomers(response.data.data);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || 'Error fetching customers');
                toast.error(err.response?.data?.message || 'Error fetching customers');
                setLoading(false);
            }
        };

        fetchCustomers();
    }, []);

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to first page on new search
    };

    // Handle sort
    const requestSort = (key) => {
        let direction = 'asc';
        
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        
        setSortConfig({ key, direction });
    };

    // Format date for display
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Format time since last login
    const getTimeSinceLastLogin = (lastLoginDate) => {
        const lastLogin = new Date(lastLoginDate);
        const now = new Date();
        const diffTime = Math.abs(now - lastLogin);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
            if (diffHours === 0) {
                const diffMinutes = Math.floor(diffTime / (1000 * 60));
                return `${diffMinutes} minutes ago`;
            }
            return `${diffHours} hours ago`;
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 30) {
            return `${diffDays} days ago`;
        } else {
            return formatDate(lastLoginDate);
        }
    };

    // Filter and sort customers
    const filteredCustomers = customers.filter(customer => 
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.mobile.includes(searchTerm)
    );

    const sortedCustomers = [...filteredCustomers].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
            return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
    });

    // Pagination
    const indexOfLastCustomer = currentPage * customersPerPage;
    const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
    const currentCustomers = sortedCustomers.slice(indexOfFirstCustomer, indexOfLastCustomer);
    
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <>
        <AdminNavBar/>
        <div className="all-users-container">
            <div className="all-users-header">
                <h1 className="all-users-title">Customer Management</h1>
                <div className="all-users-search-container">
                    <FaSearch className="all-users-search-icon" />
                    <input
                        type="text"
                        placeholder="Search customers by name, email or phone..."
                        className="all-users-search-input"
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                </div>
            </div>

            {loading ? (
                <div className="all-users-loading">
                    <div className="all-users-spinner"></div>
                    <p>Loading customers...</p>
                </div>
            ) : error ? (
                <div className="all-users-error">
                    <p>{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="all-users-retry-btn"
                    >
                        Retry
                    </button>
                </div>
            ) : (
                <>
                    <div className="all-users-stats">
                        <div className="all-users-stat-card">
                            <div className="all-users-stat-icon">
                                <FaUserAlt />
                            </div>
                            <div className="all-users-stat-info">
                                <h3>Total Customers</h3>
                                <p>{customers.length}</p>
                            </div>
                        </div>
                    </div>

                    {filteredCustomers.length === 0 ? (
                        <div className="all-users-no-results">
                            <p>No customers found matching "{searchTerm}"</p>
                            <button 
                                onClick={() => setSearchTerm('')}
                                className="all-users-clear-search"
                            >
                                Clear Search
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="all-users-table-container">
                                <table className="all-users-table">
                                    <thead>
                                        <tr>
                                            <th onClick={() => requestSort('name')}>
                                                Customer Name
                                                {sortConfig.key === 'name' && (
                                                    <FaSort className={`all-users-sort-icon ${sortConfig.direction}`} />
                                                )}
                                            </th>
                                            <th onClick={() => requestSort('email')}>
                                                Email
                                                {sortConfig.key === 'email' && (
                                                    <FaSort className={`all-users-sort-icon ${sortConfig.direction}`} />
                                                )}
                                            </th>
                                            <th onClick={() => requestSort('mobile')}>
                                                Phone
                                                {sortConfig.key === 'mobile' && (
                                                    <FaSort className={`all-users-sort-icon ${sortConfig.direction}`} />
                                                )}
                                            </th>
                                            <th onClick={() => requestSort('lastLogin')}>
                                                Last Login
                                                {sortConfig.key === 'lastLogin' && (
                                                    <FaSort className={`all-users-sort-icon ${sortConfig.direction}`} />
                                                )}
                                            </th>
                                            <th onClick={() => requestSort('createdAt')}>
                                                Joined
                                                {sortConfig.key === 'createdAt' && (
                                                    <FaSort className={`all-users-sort-icon ${sortConfig.direction}`} />
                                                )}
                                            </th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentCustomers.map((customer) => (
                                            <tr key={customer._id}>
                                                <td className="all-users-name-cell">
                                                    <div className="all-users-avatar">
                                                        {customer.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="all-users-name">
                                                        {customer.name}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="all-users-contact">
                                                        <FaEnvelope className="all-users-contact-icon" />
                                                        <span>{customer.email}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="all-users-contact">
                                                        <FaPhone className="all-users-contact-icon" />
                                                        <span>{customer.mobile}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="all-users-login-time">
                                                        <BiTime className="all-users-time-icon" />
                                                        <span>{getTimeSinceLastLogin(customer.lastLogin)}</span>
                                                    </div>
                                                </td>
                                                <td>{formatDate(customer.createdAt)}</td>
                                                <td>
                                                    <div className="all-users-actions">
                                                        <Link 
                                                            to={`/admin/customers/${customer._id}`}
                                                            className="all-users-view-btn" disabled
                                                        >
                                                            View Details
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {filteredCustomers.length > customersPerPage && (
                                <div className="all-users-pagination">
                                    <button
                                        onClick={() => paginate(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="all-users-page-btn"
                                    >
                                        Previous
                                    </button>
                                    
                                    {Array.from({ length: Math.ceil(filteredCustomers.length / customersPerPage) }).map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => paginate(index + 1)}
                                            className={`all-users-page-btn ${currentPage === index + 1 ? 'active' : ''}`}
                                        >
                                            {index + 1}
                                        </button>
                                    ))}
                                    
                                    <button
                                        onClick={() => paginate(currentPage + 1)}
                                        disabled={currentPage === Math.ceil(filteredCustomers.length / customersPerPage)}
                                        className="all-users-page-btn"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </>
            )}
        </div>
        <Footer/>
        </>
    );
};

export default CustomersList;