import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import Home from './Pages/Home';
import Register from './Pages/Register';
import Login from './Pages/Login';
import SellerDashboard from './Pages/SellerDashboard';
import AdminDashboard from './Pages/AdminDashboard';

// Import protected routes
//import { BuyerProtectedRoute, SellerProtectedRoute, AdminProtectedRoute } from './components/ProtectedRoutes';
//import BuyerProtectedRoute from './Components/BuyerProtectedRoute';
import SellerProtectedRoute from './components/SellerProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/seller-dashboard" element={<SellerProtectedRoute><SellerDashboard /></SellerProtectedRoute>} />
        <Route path="/admin-dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
