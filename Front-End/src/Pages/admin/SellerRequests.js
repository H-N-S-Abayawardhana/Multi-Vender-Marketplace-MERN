// pages/admin/SellerRequests.js
import React, { useState, useEffect } from 'react';
import '../../css/admin/adminSellerRequests.css';

const SellerRequests = () => {
    const [requests, setRequests] = useState([]);
    const [filter, setFilter] = useState('pending'); // 'pending', 'approved', 'rejected'
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, [filter]);

    const fetchRequests = async () => {
        try {
            const response = await fetch(`http://localhost:9000/api/admin/seller-requests?status=${filter}`);
            const data = await response.json();
            if (data.success) {
                setRequests(data.requests);
            }
            setLoading(false);
        } catch (error) {
            console.error('Error fetching requests:', error);
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (email, newStatus) => {
        try {
            const response = await fetch('http://localhost:9000/api/admin/update-seller-status', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    status: newStatus
                })
            });

            const data = await response.json();
            
            if (data.success) {
                // Refresh the requests list
                fetchRequests();
                alert(`Seller request ${newStatus} successfully`);
            } else {
                alert('Failed to update status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Error updating status');
        }
    };

    if (loading) {
        return <div className="ad-sell-container">Loading...</div>;
    }

    return (
        <div className="ad-sell-container">
            <h1 className="ad-sell-title">Seller Applications</h1>
            
            <div className="ad-sell-filters">
                <button 
                    className={`ad-sell-filter-btn ${filter === 'pending' ? 'active' : ''}`}
                    onClick={() => setFilter('pending')}
                >
                    Pending
                </button>
                <button 
                    className={`ad-sell-filter-btn ${filter === 'approved' ? 'active' : ''}`}
                    onClick={() => setFilter('approved')}
                >
                    Approved
                </button>
                <button 
                    className={`ad-sell-filter-btn ${filter === 'rejected' ? 'active' : ''}`}
                    onClick={() => setFilter('rejected')}
                >
                    Rejected
                </button>
            </div>

            {requests.length === 0 ? (
                <div className="ad-sell-no-requests">
                    No {filter} requests found
                </div>
            ) : (
                requests.map((request) => (
                    <div key={request._id} className="ad-sell-card">
                        <div className="ad-sell-header">
                            <span className="ad-sell-name">{request.personalInfo.fullName}</span>
                            <span className={`ad-sell-status ad-sell-status-${request.status}`}>
                                {request.status.toUpperCase()}
                            </span>
                        </div>

                        <div className="ad-sell-details">
                            <div className="ad-sell-detail-group">
                                <div className="ad-sell-label">Email</div>
                                <div className="ad-sell-value">{request.personalInfo.email}</div>
                            </div>

                            <div className="ad-sell-detail-group">
                                <div className="ad-sell-label">Business Name</div>
                                <div className="ad-sell-value">{request.businessInfo.businessName}</div>
                            </div>

                            <div className="ad-sell-detail-group">
                                <div className="ad-sell-label">Business Type</div>
                                <div className="ad-sell-value">{request.businessInfo.businessType}</div>
                            </div>

                            <div className="ad-sell-detail-group">
                                <div className="ad-sell-label">Registration Number</div>
                                <div className="ad-sell-value">{request.businessInfo.businessRegistrationNumber}</div>
                            </div>
                        </div>

                        {request.status === 'pending' && (
                            <div className="ad-sell-actions">
                                <button 
                                    className="ad-sell-btn ad-sell-btn-approve"
                                    onClick={() => handleStatusUpdate(request.personalInfo.email, 'approved')}
                                >
                                    Approve
                                </button>
                                <button 
                                    className="ad-sell-btn ad-sell-btn-reject"
                                    onClick={() => handleStatusUpdate(request.personalInfo.email, 'rejected')}
                                >
                                    Reject
                                </button>
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );
};

export default SellerRequests;