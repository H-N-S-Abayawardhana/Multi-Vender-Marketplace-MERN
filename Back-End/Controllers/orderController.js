// controllers/orderController.js
const Order = require('../Models/orderModel');
const Item = require('../Models/Item'); 

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const {
      userEmail,
      itemId,
      itemDetails,
      shippingDetails,
      paymentDetails,
      orderStatus,
      totalAmount
    } = req.body;

    // Validate that the item exists and has enough stock
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({
        status: 'fail',
        message: 'Item not found'
      });
    }

    if (item.quantity <= 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Item is out of stock'
      });
    }

    // Create new order
    const newOrder = await Order.create({
      userEmail,
      itemId,
      itemDetails,
      shippingDetails,
      paymentDetails,
      orderStatus,
      orderDate: new Date(),
      totalAmount
    });

    // Update item quantity
    await Item.findByIdAndUpdate(itemId, {
      $inc: { quantity: -1 }
    });

    res.status(201).json({
      status: 'success',
      data: {
        order: newOrder
      }
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Get all orders for a user
exports.getUserOrders = async (req, res) => {
  try {
    const userEmail = req.params.email;
    
    const orders = await Order.find({ userEmail })
      .sort({ orderDate: -1 });
    
    res.status(200).json({
      status: 'success',
      results: orders.length,
      data: {
        orders
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        status: 'fail',
        message: 'Order not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        order
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus },
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!order) {
      return res.status(404).json({
        status: 'fail',
        message: 'Order not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        order
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};