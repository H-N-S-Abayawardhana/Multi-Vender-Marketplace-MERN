// src/components/ProtectedRoutes/BuyerProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const BuyerProtectedRoute = ({ children }) => {
    const isAuthenticated = localStorage.getItem('token');
    const userLevel = parseInt(localStorage.getItem('userLevel'));

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    if (userLevel !== 3) {
        if (userLevel === 2) return <Navigate to="/seller-dashboard" />;
        if (userLevel === 1) return <Navigate to="/admin-dashboard" />;
        return <Navigate to="/login" />;
    }

    return children;
};

export default BuyerProtectedRoute;