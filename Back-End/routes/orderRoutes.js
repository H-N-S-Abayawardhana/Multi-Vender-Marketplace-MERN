const express = require('express');
const router = express.Router();
const orderController = require('../Controllers/orderController');

router.post('/create', orderController.createOrder);
router.get('/user', orderController.getOrdersByUser);
router.get('/seller', orderController.getOrdersBySeller);
router.put('/:orderId/status', orderController.updateOrderStatus);
router.put('/api/orders/:orderId/status', orderController.updateOrderStatus);
router.get('/user/:email', orderController.getUserOrders);



module.exports = router;