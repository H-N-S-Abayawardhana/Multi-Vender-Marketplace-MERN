const express = require('express');
const router = express.Router();
const storeController = require('../Controllers/storeController');

router.post('/add', storeController.addStore);
router.get('/user-stores', storeController.getUserStores);

module.exports = router;