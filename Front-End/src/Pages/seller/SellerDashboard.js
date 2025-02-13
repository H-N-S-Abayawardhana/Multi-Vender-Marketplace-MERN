import React from 'react';
import SellerNavBar from '../../components/seller/sellerNavBar.js'; 
import Footer from '../../components/Footer';
import DashSquares from '../../components/seller/dashboardsquares';

const SellerDashboard = () => {
    return (
        <>
        <SellerNavBar /> 
        <div className="s-dash-container">
             
            <DashSquares />
            
            
        </div>
        <Footer />
        </>
    );
};

export default SellerDashboard;