// routes/orderRoutes.js
const express = require('express');
const orderController = require('../Controllers/orderController');
const router = express.Router();

// Route to create a new order
router.post('/create', orderController.createOrder);

// Route to get all orders for a specific user
router.get('/user/:email', orderController.getUserOrders);

// Route to get a specific order by ID
router.get('/:id', orderController.getOrderById);

// Route to update order status
router.patch('/:id/status', orderController.updateOrderStatus);

module.exports = router;