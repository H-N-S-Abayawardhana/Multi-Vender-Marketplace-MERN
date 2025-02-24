import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const SellerProtectedRoute = ({ children }) => {
    const isAuthenticated = localStorage.getItem('token');
    const userLevel = parseInt(localStorage.getItem('userLevel'));
    const loginTimestamp = localStorage.getItem('loginTimestamp');

    // Function to clear authentication data
    const clearAuthData = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userLevel');
        localStorage.removeItem('loginTimestamp');
    };

    // Check if session has expired (1 minute = 60000 milliseconds)
    const isSessionExpired = () => {
        if (!loginTimestamp) return true;
        const sessionDuration = 3600000; // 1 Hour
        const currentTime = new Date().getTime();
        return currentTime - parseInt(loginTimestamp) > sessionDuration;
    };

    useEffect(() => {
        // Set up interval to check session expiration
        const intervalId = setInterval(() => {
            if (isAuthenticated && isSessionExpired()) {
                clearAuthData();
                // Force re-render by updating state
                window.location.reload();
            }
        }, 1000); // Check every second

        // If session is already expired on mount, clear data
        if (isSessionExpired()) {
            clearAuthData();
        }

        // Cleanup interval on unmount
        return () => clearInterval(intervalId);
    }, [isAuthenticated]);

    // Check authentication and session expiration
    if (!isAuthenticated || isSessionExpired()) {
        clearAuthData();
        return <Navigate to="/login" />;
    }

    // Check user level
    if (userLevel !== 2) {
        if (userLevel === 3) return <Navigate to="/" />;
        if (userLevel === 1) return <Navigate to="/admin-dashboard" />;
        return <Navigate to="/login" />;
    }

    return children;
};

export default SellerProtectedRoute;