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

exports.getUserStores = async (req, res) => {
    try {
      const { userEmail } = req.query;
  
      if (!userEmail) {
        return res.status(400).json({
          success: false,
          message: 'User email is required'
        });
      }
  
      const stores = await Store.find({ owner: userEmail })
        .sort({ createdAt: -1 }); // Sort by newest first
  
      res.status(200).json({
        success: true,
        stores
      });
    } catch (error) {
      console.error('Error in getUserStores:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  exports.getStoreById = async (req, res) => {
    try {
      const store = await Store.findById(req.params.id);
      
      if (!store) {
        return res.status(404).json({
          success: false,
          message: 'Store not found'
        });
      }
  
      res.status(200).json({
        success: true,
        store
      });
    } catch (error) {
      console.error('Error in getStoreById:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };

  exports.updateStore = async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = {
        storeName: req.body.storeName,
        phone: req.body.phone,
        address: req.body.address,
        description: req.body.description,
      };
  
      const store = await Store.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );
  
      if (!store) {
        return res.status(404).json({
          success: false,
          message: 'Store not found'
        });
      }
  
      res.status(200).json({
        success: true,
        store,
        message: 'Store updated successfully'
      });
    } catch (error) {
      console.error('Error in updateStore:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };
  
  exports.deleteStore = async (req, res) => {
    try {
      const { id } = req.params;
      const store = await Store.findByIdAndDelete(id);
  
      if (!store) {
        return res.status(404).json({
          success: false,
          message: 'Store not found'
        });
      }
  
      res.status(200).json({
        success: true,
        message: 'Store deleted successfully'
      });
    } catch (error) {
      console.error('Error in deleteStore:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  };