// controllers/itemController.js
const Item = require('../Models/Item');
const Store = require('../Models/Store'); 
const multer = require('multer');
const path = require('path');

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');  // Upload directory without 'public/'
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

// Example for getNewArrivals
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
}
  
};

module.exports = itemController;