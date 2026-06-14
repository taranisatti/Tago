const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// @route   GET /api/admin/analytics
// @desc    Get dashboard counts & revenue metrics
// @access  Private (Admin only)
router.get('/analytics', auth, admin, async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments({});
    const totalOrders = await Order.countDocuments({});
    const totalCustomers = await User.countDocuments({});
    
    // Low stock count: products with stock <= 5
    const lowStockProducts = await Product.countDocuments({ stock: { $lte: 5 } });

    // Total revenue: sum of totalAmount of all orders
    const orders = await Order.find({});
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    res.json({
      totalProducts,
      totalOrders,
      totalCustomers,
      totalRevenue,
      lowStockProducts
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving analytics data', error: error.message });
  }
});

module.exports = router;
