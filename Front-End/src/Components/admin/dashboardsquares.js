import React from 'react';
import { useNavigate } from "react-router-dom";
import '../../css/admin/admindashboard.css';

const DashboardSquares = () => {  
    const navigate = useNavigate();

    return (
        <div>
            <h1 className="a-dash-title">Admin Dashboard</h1>
            <div className="a-dash-grid">
                <button className="a-dash-box" onClick={() => navigate("/seller-requests")}>Manage Sellers</button>
                <button className="a-dash-box">Manage Stores</button>
                <button className="a-dash-box">Manage Users</button>
                <button className="a-dash-box">Customers</button>
                <button className="a-dash-box">Messages</button>
                <button className="a-dash-box">Analytics</button>
            </div>
        </div>
    );
};

export default DashboardSquares;


