const User = require('../Models/userModel');
const Order = require('../Models/Order');

// Get all sellers
exports.getAllSellers = async (req, res) => {
  try {
    const sellers = await User.find({ userLevel: 2 })
      .select('name email');
    
    res.status(200).json({
      success: true,
      count: sellers.length,
      data: sellers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching sellers',
      error: error.message
    });
  }
};

// Get seller analytics by email
exports.getSellerAnalytics = async (req, res) => {
  try {
    const { sellerEmail } = req.params;
    
    // Verify the seller exists
    const seller = await User.findOne({ email: sellerEmail, userLevel: 2 });
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }
    
    // Get basic metrics
    const totalOrders = await Order.countDocuments({ sellerEmail });
    const orders = await Order.find({ sellerEmail });
    
    // Calculate total revenue
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    
    // Get order status distribution
    const orderStatusCounts = await Order.aggregate([
      { $match: { sellerEmail } },
      { $group: { _id: "$orderStatus", count: { $sum: 1 } } }
    ]);
    
    // Format order status for charts
    const orderStatusData = {
      labels: [],
      values: []
    };
    
    orderStatusCounts.forEach(status => {
      orderStatusData.labels.push(status._id);
      orderStatusData.values.push(status.count);
    });
    
    // Get monthly sales data for the past 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlySales = await Order.aggregate([
      { 
        $match: { 
          sellerEmail,
          orderDate: { $gte: sixMonthsAgo } 
        } 
      },
      {
        $group: {
          _id: { 
            year: { $year: "$orderDate" },
            month: { $month: "$orderDate" }
          },
          revenue: { $sum: "$totalAmount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    
    // Format monthly data for charts
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlySalesData = {
      labels: [],
      revenue: [],
      orders: []
    };
    
    monthlySales.forEach(month => {
      const monthName = monthNames[month._id.month - 1];
      const label = `${monthName} ${month._id.year}`;
      monthlySalesData.labels.push(label);
      monthlySalesData.revenue.push(month.revenue);
      monthlySalesData.orders.push(month.count);
    });
    
    // Get top selling items
    const topItems = await Order.aggregate([
      { $match: { sellerEmail } },
      { $group: { 
        _id: "$itemId", 
        title: { $first: "$itemDetails.title" },
        totalSold: { $sum: "$itemDetails.quantity" },
        totalRevenue: { $sum: "$totalAmount" }
      }},
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        sellerInfo: {
          name: seller.name,
          email: seller.email
        },
        summary: {
          totalOrders,
          totalRevenue,
          averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
        },
        orderStatusData,
        monthlySalesData,
        topItems
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching seller analytics',
      error: error.message
    });
  }
};