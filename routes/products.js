const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

function isValidImageUrl(url) {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

// @route   GET /api/products
// @desc    Get all products, with optional search and category filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(query);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving products', error: error.message });
  }
});

// @route   GET /api/products/:id
// @desc    Get product details by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching product details', error: error.message });
  }
});

// @route   POST /api/products
// @desc    Create a new product (Admin only)
// @access  Private
router.post('/', auth, admin, async (req, res) => {
  try {
    const { name, description, price, imageUrl, category, stock } = req.body;

    if (!name || !price || !category || stock === undefined) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (imageUrl && !isValidImageUrl(imageUrl)) {
      return res.status(400).json({ message: 'Invalid image URL format. Must start with http:// or https://' });
    }

    const newProduct = new Product({
      name,
      description: description || '',
      price: Number(price),
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600',
      category,
      stock: Number(stock)
    });

    await newProduct.save();
    res.status(201).json({ message: 'Product created successfully', product: newProduct });
  } catch (error) {
    res.status(500).json({ message: 'Server error creating product', error: error.message });
  }
});

// @route   PUT /api/products/:id
// @desc    Update a product (Admin only)
// @access  Private
router.put('/:id', auth, admin, async (req, res) => {
  try {
    const { name, description, price, imageUrl, category, stock } = req.body;

    if (imageUrl && !isValidImageUrl(imageUrl)) {
      return res.status(400).json({ message: 'Invalid image URL format. Must start with http:// or https://' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = Number(price);
    if (imageUrl !== undefined) product.imageUrl = imageUrl;
    if (category !== undefined) product.category = category;
    if (stock !== undefined) product.stock = Number(stock);

    await product.save();
    res.json({ message: 'Product updated successfully', product });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating product', error: error.message });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product (Admin only)
// @access  Private
router.delete('/:id', auth, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting product', error: error.message });
  }
});

module.exports = router;
