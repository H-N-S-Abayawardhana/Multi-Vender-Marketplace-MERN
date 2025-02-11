import React from 'react';
import SellerNavBar from '../../components/seller/sellerNavBar.js'; 
import Footer from '../../components/Footer';
import DashSquares from '../../components/seller/dashboardsquares';

const SellerDashboard = () => {
    return (
        <div className="s-dash-container">
            <SellerNavBar />  
            <DashSquares />
            <Footer />
        </div>
    );
};

export default SellerDashboard;