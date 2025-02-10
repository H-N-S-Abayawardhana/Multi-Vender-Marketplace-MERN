import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './Pages/Home';
import Register from './Pages/Register';
import Login from './Pages/Login';
import SellerDashboard from './Pages/SellerDashboard';
import AdminDashboard from './Pages/AdminDashboard';

// Import protected routes
//import { BuyerProtectedRoute, SellerProtectedRoute, AdminProtectedRoute } from './components/ProtectedRoutes';
import BuyerProtectedRoute from './Components/BuyerProtectedRoute';
import SellerProtectedRoute from './Components/SellerProtectedRoute';
import AdminProtectedRoute from './Components/AdminProtectedRoute';



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<BuyerProtectedRoute><Home /></BuyerProtectedRoute>} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/seller-dashboard" element={<SellerProtectedRoute><SellerDashboard /></SellerProtectedRoute>} />
        <Route path="/admin-dashboard" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
