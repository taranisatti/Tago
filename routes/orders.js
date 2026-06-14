const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// @route   POST /api/orders
// @desc    Place a new order (Requires Authentication)
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Cannot place an empty order' });
    }

    const { fullName, addressLine, city, postalCode, country } = shippingAddress || {};
    if (!fullName || !addressLine || !city || !postalCode || !country) {
      return res.status(400).json({ message: 'Shipping address fields are required' });
    }

    let calculatedTotal = 0;
    const verifiedItems = [];

    // Verify stock and price from database rather than trusting client-provided prices
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.product} not found` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Not enough stock available for ${product.name}` });
      }

      // Deduct from stock
      product.stock -= item.quantity;
      await product.save();

      verifiedItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price
      });

      calculatedTotal += product.price * item.quantity;
    }

    // Create the order object
    const newOrder = new Order({
      user: req.user.id,
      items: verifiedItems,
      totalAmount: calculatedTotal,
      shippingAddress: {
        fullName,
        addressLine,
        city,
        postalCode,
        country
      },
      paymentMethod: paymentMethod || 'Mock Card'
    });

    const savedOrder = await newOrder.save();

    res.status(201).json({
      message: 'Order created successfully',
      order: savedOrder
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during order creation', error: error.message });
  }
});

// @route   GET /api/orders/my-orders
// @desc    Get current user's order history (Requires Authentication)
// @access  Private
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.product', 'name imageUrl description')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving your order history', error: error.message });
  }
});

// @route   GET /api/orders
// @desc    Get all orders (Admin only)
// @access  Private
router.get('/', auth, admin, async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'username email fullName')
      .populate('items.product', 'name imageUrl description price')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving all orders', error: error.message });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status (Admin only)
// @access  Private
router.put('/:id/status', auth, admin, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Please provide a valid order status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    await order.save();

    res.json({ message: `Order status updated to ${status}`, order });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating order status', error: error.message });
  }
});

module.exports = router;
