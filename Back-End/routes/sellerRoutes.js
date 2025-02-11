// routes/sellerRoutes.js
const express = require('express');
const router = express.Router();
const sellerController = require('../Controllers/sellerController');

router.post('/register', sellerController.registerSeller);

module.exports = router;