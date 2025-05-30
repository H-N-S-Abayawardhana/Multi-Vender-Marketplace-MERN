const Item = require('../Models/Item');
const Store = require('../Models/Store'); 
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');  
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB limit
  fileFilter: function(req, file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb('Error: Images Only! (jpeg, jpg, png)');
    }
  }
}).array('images', 3);  // Maximum 3 images

const itemController = {
  // Add a new item
  addItem: async (req, res) => {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      try {
        // Check if images were uploaded
        if (!req.files || req.files.length === 0) {
          return res.status(400).json({ error: 'Please upload at least one image' });
        }

        // Process form data
        const itemData = {
          ...req.body,
          images: req.files.map(file => `/uploads/${file.filename}`)
        };

        // Parse JSON strings back to objects
        if (itemData.dimensions) {
          itemData.dimensions = JSON.parse(itemData.dimensions);
        }
        if (itemData.shippingDetails) {
          itemData.shippingDetails = JSON.parse(itemData.shippingDetails);
        }
        if (itemData.returnPolicy) {
          itemData.returnPolicy = JSON.parse(itemData.returnPolicy);
        }
        if (itemData.paymentMethods) {
          itemData.paymentMethods = JSON.parse(itemData.paymentMethods);
        }

        const newItem = new Item(itemData);
        await newItem.save();

        res.status(201).json({
          message: 'Item added successfully',
          item: newItem
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  },

  // Get a single item by ID
  getItem: async (req, res) => {
    try {
      const item = await Item.findById(req.params.id);
      if (!item) {
        return res.status(404).json({ error: 'Item not found' });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get all items
  getAllItems: async (req, res) => {
    try {
      const items = await Item.find()
        .sort({ createdAt: -1 }); // Sort by newest first
      
      res.json(items);
    } catch (error) {
      console.error('Error fetching all items:', error);
      res.status(500).json({ error: error.message });
    }
  },

  // Check if store exists for item addition
  checkStoreForItem: async (req, res) => {
    try {
      const { email } = req.params;
      const store = await Store.findOne({ email });
      
      res.json({
        exists: !!store,
        storeId: store?._id
      });
    } catch (error) {
      console.error('Error in checkStoreForItem:', error);
      res.status(500).json({
        error: 'Error checking store existence',
        message: error.message
      });
    }
  },

  // Get items by seller email
  getSellerItems: async (req, res) => {
    try {
      const items = await Item.find({ email: req.query.email });
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get featured items
  getFeaturedItems: async (req, res) => {
    try {
      // items with higher price as "featured"
      
      const featuredItems = await Item.find({})
        .sort({ price: -1 })
        .limit(4);
      
      res.status(200).json(featuredItems);
    } catch (error) {
      console.error('Error fetching featured items:', error);
      res.status(500).json({ message: 'Error fetching featured items' });
    }
  },

  // Get trending items
  getTrendingItems: async (req, res) => {
    try {
      //  most recently viewed/high quantity items as "trending"
      
      const trendingItems = await Item.find({})
        .sort({ createdAt: -1 })
        .limit(4);
      
      res.status(200).json(trendingItems);
    } catch (error) {
      console.error('Error fetching trending items:', error);
      res.status(500).json({ message: 'Error fetching trending items' });
    }
  },

  // Get new arrivals
  getNewArrivals: async (req, res) => {
    try {
      // Get most recently added items
      const newArrivals = await Item.find({})
        .sort({ createdAt: -1 })
        .limit(4);
      
      res.status(200).json(newArrivals);
    } catch (error) {
      console.error('Error fetching new arrivals:', error);
      res.status(500).json({ 
        message: 'Error fetching new arrivals',
        error: error.message 
      });
    }
  },

  getItemsByCategories: async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 4;
      let categories = req.query.categories;
      
      // Parse categories properly
      if (!categories) {
        return res.status(400).json({ message: 'Categories parameter is required' });
      }

      let categoryArray;
      if (Array.isArray(categories)) {
        categoryArray = categories;
      } else if (typeof categories === 'string') {
        try {
          categoryArray = JSON.parse(categories);
        } catch (e) {
          categoryArray = categories.includes(',') ? categories.split(',') : [categories];
        }
      } else {
        return res.status(400).json({ message: 'Invalid categories parameter format' });
      }
      
      // Create an object to store items by category
      const itemsByCategory = {};
      
      // Process each category
      for (const category of categoryArray) {
        const items = await Item.find({ category })
          .sort({ createdAt: -1 })
          .limit(limit);
        
        itemsByCategory[category] = items;
      }
      
      res.status(200).json(itemsByCategory);
    } catch (error) {
      console.error('Error fetching items by categories:', error);
      res.status(500).json({ 
        message: 'Error fetching items by categories',
        error: error.message 
      });
    }
  },

  // Update an item by seller
  updateItem: async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      const { id } = req.params;
      const updateData = req.body;
      const sellerEmail = req.query.email;

      // Verify the item belongs to the seller
      const item = await Item.findById(id);
      if (!item) {
        return res.status(404).json({ message: 'Item not found' });
      }

      if (item.email !== sellerEmail) {
        return res.status(403).json({ message: 'You do not have permission to update this item' });
      }

      // Convert price and quantity strings to numbers
      if (updateData.price) {
        updateData.price = parseFloat(updateData.price);
      }
      
      if (updateData.quantity) {
        updateData.quantity = parseInt(updateData.quantity);
      }
      
      if (updateData.startingBid) {
        updateData.startingBid = parseFloat(updateData.startingBid);
      }

      // Parse JSON strings back to objects if they exist
      const objectFields = ['dimensions', 'shippingDetails', 'returnPolicy', 'paymentMethods'];
      objectFields.forEach(field => {
        if (updateData[field]) {
          try {
            updateData[field] = typeof updateData[field] === 'string' 
              ? JSON.parse(updateData[field]) 
              : updateData[field];
          } catch (e) {
            console.error(`Error parsing ${field}:`, e);
            // Keep the original value if parsing fails
            updateData[field] = item[field];
          }
        }
      });

      // Handle image uploads if included in the update
      if (req.files && req.files.length > 0) {
        // Remove old images from the server
        if (item.images && item.images.length > 0) {
          item.images.forEach(imagePath => {
            const fullPath = path.join(__dirname, '..', imagePath);
            if (fs.existsSync(fullPath)) {
              fs.unlinkSync(fullPath);
            }
          });
        }

        // Add new image paths to the update data
        updateData.images = req.files.map(file => `/uploads/${file.filename}`);
      }

      console.log('Update data being applied:', updateData);

      const updatedItem = await Item.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      return res.status(200).json(updatedItem);
    } catch (error) {
      console.error('Update item error:', error);
      return res.status(500).json({ 
        message: 'Failed to update item', 
        error: error.message,
        details: error.errors ? Object.keys(error.errors).map(key => ({
          field: key,
          message: error.errors[key].message
        })) : undefined
      });
    }
  });
},

  // Delete an item by seller
  deleteItem: async (req, res) => {
    try {
      const { id } = req.params;
      const sellerEmail = req.query.email;

      // Find the item
      const item = await Item.findById(id);
      if (!item) {
        return res.status(404).json({ message: 'Item not found' });
      }

      // Verify the item belongs to the seller
      if (item.email !== sellerEmail) {
        return res.status(403).json({ message: 'You do not have permission to delete this item' });
      }

      // Delete images from the server
      if (item.images && item.images.length > 0) {
        item.images.forEach(imagePath => {
          const fullPath = path.join(__dirname, '..', imagePath);
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        });
      }

      // Delete the item from the database
      await Item.findByIdAndDelete(id);

      return res.status(200).json({ message: 'Item deleted successfully' });
    } catch (error) {
      console.error('Delete item error:', error);
      return res.status(500).json({ message: 'Failed to delete item', error: error.message });
    }
  }
};

module.exports = itemController;