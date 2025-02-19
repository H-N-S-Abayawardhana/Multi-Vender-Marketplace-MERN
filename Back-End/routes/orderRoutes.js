// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const orderController = require('../Controllers/orderController');

router.post('/create', orderController.createOrder);
router.get('/user', orderController.getOrdersByUser);
router.get('/seller', orderController.getOrdersBySeller);

module.exports = router;