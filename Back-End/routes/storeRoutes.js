const express = require('express');
const router = express.Router();
const storeController = require('../Controllers/storeController');

router.post('/add', storeController.addStore);
router.get('/user-stores', storeController.getUserStores);
router.get('/:id', storeController.getStoreById);

module.exports = router;