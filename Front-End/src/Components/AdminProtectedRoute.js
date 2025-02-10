// src/components/ProtectedRoutes/AdminProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminProtectedRoute = ({ children }) => {
    const isAuthenticated = localStorage.getItem('token');
    const userLevel = parseInt(localStorage.getItem('userLevel'));

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    if (userLevel !== 1) {
        if (userLevel === 3) return <Navigate to="/" />;
        if (userLevel === 2) return <Navigate to="/seller-dashboard" />;
        return <Navigate to="/login" />;
    }

    return children;
};

export default AdminProtectedRoute;