import React from 'react';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer';
import DashSquares from '../../components/admin/dashboardsquares'


const AdminDashboard = () => {
    return (
        <div className="a-dash-container">
            <NavBar />
            
            <DashSquares/>

            <Footer />
        </div>
    );
};

export default AdminDashboard;

