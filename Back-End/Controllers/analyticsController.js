const Order = require('../Models/Order');

exports.getSellerOrderStats = async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ success: false, message: 'Seller email is required' });
    }

    // Get orders for the specific seller
    const orders = await Order.find({ sellerEmail: email });
    
    if (!orders || orders.length === 0) {
      return res.json({ 
        success: true, 
        message: 'No orders found for this seller',
        data: {
          totalOrders: 0,
          totalRevenue: 0,
          ordersByStatus: {},
          revenueByMonth: [],
          ordersByMonth: [],
          topSellingItems: []
        }
      });
    }

    // Calculate total orders and revenue
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((total, order) => total + order.totalAmount, 0);
    
    // Calculate orders by status
    const ordersByStatus = orders.reduce((acc, order) => {
      acc[order.orderStatus] = (acc[order.orderStatus] || 0) + 1;
      return acc;
    }, {});

    // Group orders by month
    const ordersByMonth = Array(12).fill(0);
    const revenueByMonth = Array(12).fill(0);
    
    orders.forEach(order => {
      const orderDate = new Date(order.orderDate);
      const month = orderDate.getMonth();
      ordersByMonth[month]++;
      revenueByMonth[month] += order.totalAmount;
    });

    // Format revenue and orders by month as array of objects for charts
    const monthlyData = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 0; i < 12; i++) {
      monthlyData.push({
        month: monthNames[i],
        orders: ordersByMonth[i],
        revenue: revenueByMonth[i]
      });
    }

    // Get top selling items
    const itemCounts = {};
    orders.forEach(order => {
      const itemTitle = order.itemDetails.title;
      itemCounts[itemTitle] = (itemCounts[itemTitle] || 0) + order.itemDetails.quantity;
    });
    
    const topSellingItems = Object.entries(itemCounts)
      .map(([title, count]) => ({ title, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    res.json({
      success: true,
      data: {
        totalOrders,
        totalRevenue,
        ordersByStatus,
        monthlyData,
        topSellingItems
      }
    });
  } catch (error) {
    console.error('Error getting seller stats:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};