// src/components/ProtectedRoutes/SellerProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const SellerProtectedRoute = ({ children }) => {
    const isAuthenticated = localStorage.getItem('token');
    const userLevel = parseInt(localStorage.getItem('userLevel'));

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    if (userLevel !== 2) {
        if (userLevel === 3) return <Navigate to="/" />;
        if (userLevel === 1) return <Navigate to="/admin-dashboard" />;
        return <Navigate to="/login" />;
    }

    return children;
};

export default SellerProtectedRoute;