// routes/reviewRoutes.js

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');

// Review Schema
const reviewSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  user: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Review = mongoose.model('Review', reviewSchema);

// Get all reviews for a specific item
router.get('/:itemId', async (req, res) => {
  try {
    const itemId = req.params.itemId;
    
    // Validate if itemId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ message: 'Invalid item ID' });
    }
    
    const reviews = await Review.find({ itemId }).sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit a review
router.post('/', async (req, res) => {
  try {
    const { itemId, rating, comment, user } = req.body;
    
    // Validate required fields
    if (!itemId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Please provide valid item ID and rating (1-5)' });
    }
    
    // Validate if itemId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ message: 'Invalid item ID' });
    }
    
    // Create new review
    const review = new Review({
      itemId,
      user: user || 'Anonymous',
      rating,
      comment: comment || '',
      createdAt: new Date()
    });
    
    await review.save();
    
    // Update item's average rating (you'll need to implement this in your Item model)
    // This is a basic implementation - you might want to optimize it for larger applications
    const Item = mongoose.model('Item');
    const allReviews = await Review.find({ itemId });
    
    const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / allReviews.length;
    
    await Item.findByIdAndUpdate(itemId, { 
      rating: averageRating, 
      reviews: allReviews.length 
    });
    
    res.status(201).json(review);
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Optional: Delete a review (can be restricted to admin or review author)
router.delete('/:reviewId', auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Check if user is authorized to delete (implement as needed)
    
    await review.remove();
    
    // Update item's average rating after deletion
    const itemId = review.itemId;
    const Item = mongoose.model('Item');
    const allReviews = await Review.find({ itemId });
    
    let averageRating = 0;
    if (allReviews.length > 0) {
      const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
      averageRating = totalRating / allReviews.length;
    }
    
    await Item.findByIdAndUpdate(itemId, { 
      rating: averageRating, 
      reviews: allReviews.length 
    });
    
    res.json({ message: 'Review removed' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;