// controllers/itemController.js
const Item = require('../Models/Item');
const multer = require('multer');
const path = require('path');

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'public/uploads/');  // Make sure this directory exists
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

  getSellerItems: async (req, res) => {
    try {
      const items = await Item.find({ email: req.query.email });
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = itemController;