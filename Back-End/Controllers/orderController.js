const Order = require('../Models/Order');
const Item = require('../Models/Item');
const { sendOrderStatusUpdateEmail, sendOrderConfirmationEmail } = require('../utils/emailService');

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
        sellerEmail: item.email, 
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

  // Get orders for a specific user
  getUserOrders: async (req, res) => {
    try {
      const { email } = req.params;
      
      if (!email) {
        return res.status(400).json({ success: false, message: 'User email is required' });
      }

      const orders = await Order.find({ userEmail: email })
        .populate('itemId')
        .sort({ orderDate: -1 });
      
      if (!orders.length) {
        return res.status(200).json({ success: true, orders: [], message: 'No orders found for this user' });
      }

      return res.status(200).json({ success: true, orders });
    } catch (error) {
      console.error('Error fetching user orders:', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch orders', error: error.message });
    }
  },

  //Update the status of an order (by seller)
  updateOrderStatus: async (req, res) => {
    try {
      const { orderId } = req.params;
      const { status, sendNotification, buyerEmail, itemTitle, sellerEmail } = req.body;
      
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
      
      
      order.orderStatus = status;
      await order.save();
      
      // Send email notification if requested
      if (sendNotification && buyerEmail) {
        // If itemTitle wasn't provided in request but we have the order, use the order's item title
        const emailItemTitle = itemTitle || (order.itemDetails && order.itemDetails.title) || 'your order';
        // If sellerEmail wasn't provided in request but we have the order, use the order's seller email
        const emailSellerEmail = sellerEmail || order.sellerEmail;
        
        await sendOrderStatusUpdateEmail(
          buyerEmail,
          orderId,
          status,
          emailItemTitle,
          emailSellerEmail
        );
      }
      
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

  sendConfirmation : async (req, res) => {
    try {
      const orderData = req.body;
      
      // Send the confirmation email
      const emailSent = await sendOrderConfirmationEmail(orderData);
      
      if (emailSent) {
        return res.status(200).json({
          success: true,
          message: 'Order confirmation email sent successfully'
        });
      } else {
        return res.status(500).json({
          success: false,
          message: 'Failed to send order confirmation email'
        });
      }
    } catch (error) {
      console.error('Error sending confirmation email:', error);
      return res.status(500).json({
        success: false,
        message: 'Error sending confirmation email',
        error: error.message
      });
    }
  }
  
};

module.exports = orderController;