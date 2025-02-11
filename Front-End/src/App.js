import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Home from './Pages/Home';
import Register from './Pages/Register';
import Login from './Pages/Login';
import SellerDashboard from './Pages/seller/SellerDashboard';
import AddStore from './Pages/seller/AddStore';
import AdminDashboard from './Pages/admin/AdminDashboard';

// Import protected routes
//import { BuyerProtectedRoute, SellerProtectedRoute, AdminProtectedRoute } from './components/ProtectedRoutes';
//import BuyerProtectedRoute from './Components/BuyerProtectedRoute';
import SellerProtectedRoute from './components/SellerProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import StoreList from './Pages/seller/StoreList';
import StoreDetails from './Pages/seller/StoreDetails';



function App() {
  return (
    <Router>
      <div> <ToastContainer position="top-center" autoClose={3000} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/seller-dashboard" element={<SellerProtectedRoute><SellerDashboard /></SellerProtectedRoute>} />
        <Route path="/add-store" element={<SellerProtectedRoute><AddStore /></SellerProtectedRoute>} />
        <Route path="/stores" element={<SellerProtectedRoute><StoreList /></SellerProtectedRoute>} />
        <Route path="/store/:id" element={<SellerProtectedRoute><StoreDetails /></SellerProtectedRoute>} />
        <Route path="/admin-dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
      </Routes>
      </div>
    </Router>
  );
}

export default App;
