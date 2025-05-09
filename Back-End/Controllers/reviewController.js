const mongoose = require('mongoose');
const Review = require('../Models/Review');

// Get all reviews for a specific item
exports.getReviewsByItemId = async (req, res) => {
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
};

// Submit a review
exports.createReview = async (req, res) => {
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
    
    // Update item's average rating
    await updateItemRating(itemId);
    
    res.status(201).json(review);
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a review
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    
    // Check if user is authorized to delete (implement as needed)
    
    const itemId = review.itemId;
    await Review.findByIdAndDelete(req.params.reviewId); // Using findByIdAndDelete instead of remove()
    
    // Update item's average rating after deletion
    await updateItemRating(itemId);
    
    res.json({ message: 'Review removed' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to update item rating
async function updateItemRating(itemId) {
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
}