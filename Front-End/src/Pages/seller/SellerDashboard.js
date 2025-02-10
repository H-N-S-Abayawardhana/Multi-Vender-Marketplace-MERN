import React from 'react';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer';
import DashSquares from '../../components/seller/dashboardsquares'


const SellerDashboard = () => {
    return (
        <div className="s-dash-container">
            <NavBar />
            
            <DashSquares/>

            <Footer />
        </div>
    );
};

export default SellerDashboard;
