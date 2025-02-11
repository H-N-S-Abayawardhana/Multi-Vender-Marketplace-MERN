const Store = require('../Models/Store');

exports.addStore = async (req, res) => {
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

    // Create new store
    const store = new Store({
      storeName,
      email,
      phone,
      address,
      description,
      owner: userEmail
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
};