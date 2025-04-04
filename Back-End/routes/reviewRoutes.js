const express = require('express');
const router = express.Router();
const reviewController = require('../Controllers/reviewController');
const auth = require('../middleware/auth');

// Get all reviews for a specific item
router.get('/:itemId', reviewController.getReviewsByItemId);

// Submit a review
router.post('/', reviewController.createReview);

// Delete a review (protected by auth middleware)
router.delete('/:reviewId', auth, reviewController.deleteReview);

module.exports = router;