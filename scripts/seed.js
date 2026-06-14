const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Product = require('../models/Product');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const products = [
  {
    name: "Minimalist Cotton T-Shirt",
    description: "A classic, breathable t-shirt made from 100% organic cotton in soft sand. Perfect for everyday wear.",
    price: 999,
    imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop",
    category: "T-Shirts",
    stock: 15,
    rating: 4.8,
    numReviews: 24
  },
  {
    name: "TAGO Oversized Tee",
    description: "Premium heavyweight cotton tee with a modern drop-shoulder design and minimal branding.",
    price: 1299,
    imageUrl: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&auto=format&fit=crop",
    category: "T-Shirts",
    stock: 20,
    rating: 4.5,
    numReviews: 18
  },
  {
    name: "Signature Lavender Hoodie",
    description: "Extra soft organic cotton-fleece hoodie in TAGO's signature lavender color.",
    price: 2999,
    imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&auto=format&fit=crop",
    category: "Hoodies",
    stock: 12,
    rating: 4.9,
    numReviews: 32
  },
  {
    name: "Classic Cozy Hoodie",
    description: "Heavyweight hoodie with a warm brushed interior in soft heather gray.",
    price: 2499,
    imageUrl: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&auto=format&fit=crop",
    category: "Hoodies",
    stock: 18,
    rating: 4.6,
    numReviews: 15
  },
  {
    name: "Everyday Canvas Tote",
    description: "Durable cotton-canvas tote bag featuring internal compartments for your everyday essentials.",
    price: 799,
    imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop",
    category: "Tote Bags",
    stock: 25,
    rating: 4.4,
    numReviews: 9
  },
  {
    name: "Eco-Cotton Tote Bag",
    description: "Reusable, lightweight grocery and beach tote with reinforced handles in off-white canvas.",
    price: 599,
    imageUrl: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=600&auto=format&fit=crop",
    category: "Tote Bags",
    stock: 30,
    rating: 4.3,
    numReviews: 14
  },
  {
    name: "Insulated Flask 24oz",
    description: "Double-walled vacuum insulated stainless steel water bottle in minimalist white. Keeps cold for 24 hours.",
    price: 1499,
    imageUrl: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop",
    category: "Water Bottles",
    stock: 15,
    rating: 4.7,
    numReviews: 21
  },
  {
    name: "Wireless ANC Headphones",
    description: "Premium sound quality with active noise cancellation, smart voice controls, and 30-hour battery life.",
    price: 7999,
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop",
    category: "Headphones",
    stock: 8,
    rating: 4.8,
    numReviews: 40
  },
  {
    name: "Hardcover Grid Journal",
    description: "A5 hardcover notebook with 160 pages of thick, acid-free grid paper. Elegant lavender linen cover.",
    price: 599,
    imageUrl: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600&auto=format&fit=crop",
    category: "Notebooks",
    stock: 40,
    rating: 4.5,
    numReviews: 12
  },
  {
    name: "A5 Softcover Sketchbook",
    description: "Eco-friendly blank pages with an elegant softcover. Ideal for drawing, journaling, and sketching.",
    price: 399,
    imageUrl: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&auto=format&fit=crop",
    category: "Notebooks",
    stock: 35,
    rating: 4.2,
    numReviews: 8
  },
  {
    name: "Silicone Phone Case",
    description: "Ultra-slim liquid silicone case featuring a soft microfiber lining. Fits latest devices in soft lavender.",
    price: 699,
    imageUrl: "https://images.unsplash.com/photo-1601597111158-2fceff270190?w=600&auto=format&fit=crop",
    category: "Phone Cases",
    stock: 50,
    rating: 4.6,
    numReviews: 27
  },
  {
    name: "Commuter Laptop Backpack",
    description: "Minimalist waterproof roll-top backpack featuring a 15-inch padded laptop compartment.",
    price: 3499,
    imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop",
    category: "Backpacks",
    stock: 10,
    rating: 4.7,
    numReviews: 19
  }
];

const seedProducts = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tago';
    await mongoose.connect(mongoURI);
    console.log('Connected to Database for seeding.');
    
    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products.');
    
    // Insert new products
    await Product.insertMany(products);
    console.log('Successfully seeded 12 premium products.');

    // Seed Admin User
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      // Generate secure random password
      const securePassword = crypto.randomBytes(8).toString('hex'); // 16 characters hex
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(securePassword, salt);

      const adminUser = new User({
        username: 'admin',
        email: 'admin@tago.com',
        password: hashedPassword,
        fullName: 'TAGO Admin',
        role: 'admin'
      });

      await adminUser.save();
      console.log('==================================================');
      console.log(' [ADMIN CREATED SUCCESSFULLY]');
      console.log(' Email:    admin@tago.com');
      console.log(` Password: ${securePassword}`);
      console.log('==================================================');
    } else {
      console.log('Admin account already exists. Skipping admin creation.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error(`Seeding error: ${error.message}`);
    process.exit(1);
  }
};

seedProducts();
