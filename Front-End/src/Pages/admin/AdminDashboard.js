import React from 'react';
import AdminNavBar from '../../components/admin/adminNavBar.js';
import Footer from '../../components/Footer';
import DashSquares from '../../components/admin/dashboardsquares'


const AdminDashboard = () => {
    return (
        <div className="a-dash-container">
            <AdminNavBar />
            
            <DashSquares/>

            <Footer />
        </div>
    );
};

export default AdminDashboard;

