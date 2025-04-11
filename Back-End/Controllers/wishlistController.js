const Wishlist = require('../Models/Wishlist');
const Item = require('../Models/Item'); 

// Add item to wishlist
exports.addToWishlist = async (req, res) => {
  try {
    const { itemId, email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Validate item exists
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Check if already in wishlist
    const existing = await Wishlist.findOne({ email, itemId });
    if (existing) {
      return res.status(200).json({ message: 'Item already in wishlist' });
    }

    // Create new wishlist entry
    const wishlistItem = new Wishlist({
      email,
      itemId
    });

    await wishlistItem.save();
    res.status(201).json({ message: 'Item added to wishlist', item: wishlistItem });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ message: 'Failed to add item to wishlist', error: error.message });
  }
};

// Get all wishlist items for a user
exports.getWishlist = async (req, res) => {
  try {
    // Get email from query parameters
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ message: 'Email parameter is required' });
    }

    // Get wishlist items
    const wishlistItems = await Wishlist.find({ email });
    
    res.status(200).json(wishlistItems);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ message: 'Failed to fetch wishlist', error: error.message });
  }
};

// Remove item from wishlist
exports.removeFromWishlist = async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ message: 'Email parameter is required' });
    }

    const result = await Wishlist.findOneAndDelete({ email, itemId });
    
    if (!result) {
      return res.status(404).json({ message: 'Item not found in wishlist' });
    }
    
    res.status(200).json({ message: 'Item removed from wishlist' });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ message: 'Failed to remove item from wishlist', error: error.message });
  }
};

// Get detailed wishlist with item information
exports.getDetailedWishlist = async (req, res) => {
  try {
    // Get email from query parameters
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ message: 'Email parameter is required' });
    }

    // Get wishlist items with item details
    const wishlistItems = await Wishlist.find({ email }).populate('itemId');
    
    res.status(200).json(wishlistItems);
  } catch (error) {
    console.error('Error fetching detailed wishlist:', error);
    res.status(500).json({ message: 'Failed to fetch detailed wishlist', error: error.message });
  }
};