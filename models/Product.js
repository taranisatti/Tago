const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative'],
  },
  imageUrl: {
    type: String,
    required: [true, 'Product image URL is required'],
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    trim: true,
  },
  stock: {
    type: Number,
    required: [true, 'Product stock is required'],
    default: 10,
    min: [0, 'Stock cannot be negative'],
  },
  rating: {
    type: Number,
    default: 4.5,
  },
  numReviews: {
    type: Number,
    default: 12,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Product', productSchema);
