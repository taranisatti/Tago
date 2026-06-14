# TAGO E-Commerce Platform

TAGO is a modern full-stack e-commerce platform designed for lifestyle, fashion, and everyday essentials. The platform features a premium lavender-and-white user interface, secure authentication, shopping cart functionality, checkout workflow, user profile management, address book management, and a complete administrative dashboard for inventory and order management.

## 🔗 Live Demo

🌐 **Live Website:** https://tago-6eze.onrender.com

📂 **GitHub Repository:** https://github.com/taranisatti/Tago

---

## 🌟 Features

### Customer Features

* User Registration & Login
* JWT Authentication
* Product Catalog
* Product Search
* Product Details Page
* Shopping Cart
* Quantity Management
* Checkout System
* Order Placement
* Order History
* User Dashboard
* Profile Management
* Address Book Management
* Notification Preferences
* Responsive Design

### Admin Features

* Secure Admin Dashboard
* Product Inventory Management
* Add Products
* Edit Products
* Delete Products
* Order Management
* Customer Management
* Analytics Overview
* Revenue Tracking
* Low Stock Monitoring

### UI & Experience

* Premium Lavender & White Theme
* Modern Responsive Layout
* Mobile-Friendly Design
* Dynamic Product Cards
* Image Preview Support
* Automatic Image Fallback System
* INR Currency Formatting
* Smooth User Experience

---

## 🛠️ Tech Stack

### Frontend

* HTML5
* CSS3
* JavaScript (ES6)
* LocalStorage

### Backend

* Node.js
* Express.js
* JWT Authentication
* Cookie Parser

### Database

* MongoDB Atlas
* Mongoose

### Deployment

* Render
* GitHub

---

## 📁 Project Structure

```text
TAGO/
├── config/
│   └── db.js
├── middleware/
│   ├── auth.js
│   └── admin.js
├── models/
│   ├── User.js
│   ├── Product.js
│   └── Order.js
├── routes/
│   ├── auth.js
│   ├── users.js
│   ├── products.js
│   ├── orders.js
│   └── admin.js
├── public/
│   ├── css/
│   ├── js/
│   ├── index.html
│   ├── product.html
│   ├── cart.html
│   ├── checkout.html
│   ├── auth.html
│   ├── dashboard.html
│   └── admin.html
├── scripts/
│   └── seed.js
├── server.js
├── package.json
└── README.md
```

---

## 🚀 Running Locally

### 1. Clone Repository

```bash
git clone https://github.com/taranisatti/Tago.git
cd Tago
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### 4. Seed Database

```bash
npm run seed
```

This will populate the database with sample products.

### 5. Start Server

```bash
npm start
```

Open:

```text
http://localhost:5000
```

---

## 🛒 Core Functionality

### Authentication

* Secure JWT Authentication
* Protected Routes
* User Session Management

### Product Management

* Browse Products
* Search Products
* Product Details
* Product Ratings

### Cart & Checkout

* Add to Cart
* Remove Items
* Quantity Updates
* Checkout Flow
* Address Autofill

### User Dashboard

* Profile Settings
* Address Book
* Password Updates
* Order History
* Preferences

### Admin Dashboard

* Product CRUD Operations
* Customer Management
* Order Management
* Revenue Analytics
* Inventory Tracking

---

## 💰 Currency Support

All pricing is displayed in Indian Rupees (INR).

Examples:

* ₹999
* ₹1,299
* ₹2,999
* ₹7,999

The application uses Indian number formatting for a localized shopping experience.

---

## 🔒 Security Features

* Password Hashing using bcrypt
* JWT Authentication
* Role-Based Authorization
* Admin Route Protection
* Secure MongoDB Atlas Integration
* Environment Variable Configuration

---

## 🌐 Deployment

### Live Deployment

**Render URL:** https://tago-6eze.onrender.com

### Recommended Platforms

* Render
* Railway
* Fly.io

### Environment Variables Required

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

---

## 📸 Screenshots

Add screenshots here after deployment:

* Home Page
* Product Details Page
* Shopping Cart
* Checkout Page
* User Dashboard
* Admin Dashboard

---

## 👨‍💻 Author

**Tarani Satti**

GitHub: https://github.com/taranisatti

---

## 📄 License

This project was developed for educational, portfolio, and learning purposes.
