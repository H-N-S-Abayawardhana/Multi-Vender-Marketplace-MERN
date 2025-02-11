// Backend - controllers/storeController.js
const Store = require('../Models/Store');
const multer = require('multer');
const path = require('path');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');  // Make sure this directory exists
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
}).fields([
  { name: 'logo', maxCount: 1 },
  { name: 'banner', maxCount: 1 }
]);

exports.addStore = async (req, res) => {
  upload(req, res, async function(err) {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    try {
      const { storeName, email, phone, address, description, userEmail } = req.body;

      // Check if the email matches the logged-in user's email
      if (email !== userEmail) {
        return res.status(400).json({
          success: false,
          message: 'The email must match your login email'
        });
      }

      // Check if store already exists with this email
      const existingStore = await Store.findOne({ email });
      if (existingStore) {
        return res.status(400).json({
          success: false,
          message: 'A store with this email already exists'
        });
      }

      // Create new store with image paths
      const store = new Store({
        storeName,
        email,
        phone,
        address,
        description,
        owner: userEmail,
        logo: req.files.logo ? `/uploads/${req.files.logo[0].filename}` : null,
        banner: req.files.banner ? `/uploads/${req.files.banner[0].filename}` : null
      });

      await store.save();

      res.status(201).json({
        success: true,
        message: 'Store created successfully',
        store
      });
    } catch (error) {
      console.error('Error in addStore:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  });
};