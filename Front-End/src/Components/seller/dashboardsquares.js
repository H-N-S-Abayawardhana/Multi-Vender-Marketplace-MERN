import React from 'react';
import '../../css/seller/sellerdashboard.css';

const dashboardsquares = () => {
    return (
        <div>

            <h1 className="s-dash-title">Seller Dashboard</h1>
            <div className="s-dash-grid">
                <button className="s-dash-box">Create a Store</button>
                <button className="s-dash-box">My Stores</button>
                <button className="s-dash-box">Sales</button>
                <button className="s-dash-box">Customers</button>
                <button className="s-dash-box">Messages</button>
                <button className="s-dash-box">Analytics</button>
            </div>
            </div>
  
    );
};

export default dashboardsquares;
