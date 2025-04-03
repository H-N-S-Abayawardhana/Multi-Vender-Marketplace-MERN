const Order = require('../Models/Order');
const Item = require('../Models/Item');

const orderController = {
  createOrder: async (req, res) => {
    try {
      // Get the item details to verify and get seller email
      const item = await Item.findById(req.body.itemId);
      if (!item) {
        return res.status(404).json({ message: 'Item not found' });
      }

      // Verify item is in stock
      if (item.quantity < 1) {
        return res.status(400).json({ message: 'Item is out of stock' });
      }

      // Create the order
      const orderData = {
        ...req.body,
        sellerEmail: item.email, // Add seller's email
        orderStatus: 'Pending',
        orderDate: new Date()
      };

      const newOrder = new Order(orderData);
      await newOrder.save();

      // Update item quantity
      await Item.findByIdAndUpdate(
        req.body.itemId,
        { $inc: { quantity: -1 } }
      );

      res.status(201).json({
        message: 'Order created successfully',
        order: newOrder
      });
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ message: 'Error creating order', error: error.message });
    }
  },

  //Update the status of an order (by seller)
  updateOrderStatus: async (req, res) => {
    try {
      const { orderId } = req.params;
      const { status } = req.body;
      
      // Validate the status is one of the allowed values
      const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid order status' });
      }
      
      // Find the order and update its status
      const order = await Order.findById(orderId);
      
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      // Optional: Check if the seller is authorized to update this order
      // if (order.sellerEmail !== req.query.email) {
      //   return res.status(403).json({ message: 'Unauthorized to update this order' });
      // }
      
      order.orderStatus = status;
      await order.save();
      
      res.json({ message: 'Order status updated successfully', order });
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ message: 'Error updating order status', error: error.message });
    }
  },
  

  getOrdersByUser: async (req, res) => {
    try {
      const orders = await Order.find({ userEmail: req.query.email })
        .sort({ orderDate: -1 });
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching orders', error: error.message });
    }
  },

  getOrdersBySeller: async (req, res) => {
    try {
      const orders = await Order.find({ sellerEmail: req.query.email })
        .sort({ orderDate: -1 });
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching orders', error: error.message });
    }
  },

  
// Add this method to your orderController.js
updateOrderStatus: async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    // Validate the status is one of the allowed values
    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }
    
    // Find the order and update its status
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Optional: Check if the seller is authorized to update this order
    // if (order.sellerEmail !== req.query.email) {
    //   return res.status(403).json({ message: 'Unauthorized to update this order' });
    // }
    
    order.orderStatus = status;
    await order.save();
    
    res.json({ message: 'Order status updated successfully', order });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Error updating order status', error: error.message });
  }
}


  
};


module.exports = orderController;
