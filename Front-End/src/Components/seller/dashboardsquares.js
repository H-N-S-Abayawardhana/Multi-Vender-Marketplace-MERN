import React from 'react';
import { useNavigate } from "react-router-dom";
import '../../css/seller/sellerdashboard.css';

const DashboardSquares = () => {
    const navigate = useNavigate();

    return (
        <div>
            <h1 className="s-dash-title">Seller Dashboard</h1>
            <div className="s-dash-grid">
                <button className="s-dash-box" onClick={() => navigate("/add-store")}>  Create a Store  </button>
                   
                <button className="s-dash-box" onClick={() => navigate("/stores")}>  My Stores  </button>

                <button className="s-dash-box" onClick={() => navigate("/add-items")}>  Add New Items  </button>
                <button className="s-dash-box">Customers</button>
                <button className="s-dash-box">Messages</button>
                <button className="s-dash-box">Analytics</button>
            </div>
        </div>
    );
};

export default DashboardSquares;
