# TAGO E-Commerce Platform

TAGO is a modern, premium e-commerce platform designed for lifestyle, fashion, and everyday essentials. It features a Shopify-style minimal lavender and white aesthetic, clean typography, dynamic storefront routing, an Address Book CRUD settings dashboard, a secure Administrative Dashboard, and automated currency conversions to Indian Rupees (INR).

---

## 🌟 Key Features

* **Premium Minimalist UI**: Tailored using the elegant `Outfit` font and a curated lavender and white styling scheme.
* **Redesigned Luxury Brand Logo**: Features a custom-designed typography wordmark with a stylized ring-slash `O` vector and matching favicon.
* **User Settings & Address Book**: A responsive user dashboard to edit profiles, manage notification preferences, and perform CRUD operations on an address book with dynamic default-selection mechanics.
* **Secure Administrative Dashboard**:
  * Protected by dual backend middlewares: standard `auth.js` (JWT token verification) and `admin.js` (role authorization validation).
  * Real-time metrics overview (Revenue in INR, orders count, stock status, low stock alert counter, customer metrics).
  * Product Inventory Management (Add, Edit, and Delete products with dynamic form image previews).
  * Customer Orders Management (View billing details, shipping addresses, items breakdown, and update dispatch statuses).
  * Registration analytics showing registered customers (restricted safe fields, never exposes password hashes, addresses, or private details).
* **Robust Image Loader**: Image inputs accept format-free CDN and Unsplash URLs, validating formats via browser-native load states. If image loading fails, the storefront automatically renders a premium desk-gear placeholder.
* **Local Cart & Checkout**: Fully operational local shopping cart enabling quantity increments, item removals, dynamic subtotal calculations, and address autofills.

---

## 🛠️ Tech Stack

* **Frontend**: Vanilla HTML5, Vanilla CSS3 (custom CSS variables, responsive grids, media queries), Vanilla Javascript (async-await, LocalStorage).
* **Backend**: Node.js, Express.js, cookie-parser, jsonwebtoken (JWT).
* **Database**: MongoDB & Mongoose.

---

## 🚀 Running Locally

### 1. Prerequisites
Ensure you have the following installed on your machine:
* [Node.js](https://nodejs.org/) (v16.x or higher recommended)
* [MongoDB](https://www.mongodb.com/try/download/community) (either running locally or a connection string to MongoDB Atlas)

### 2. Environment Setup
Create a `.env` file in the root directory of the project and populate the following keys:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_uri
JWT_SECRET=your_custom_jwt_secret_phrase
```

### 3. Install Dependencies
Run the package installation command:
```bash
npm install
```

### 4. Seed Database
Replenish your database catalog with 12 premium products and initialize the secure Admin account:
```bash
npm run seed
```
> ⚠️ **Note**: Seeding will print the secure generated password for the default administrator account (`admin@tago.com`) to the console. Save it for accessing the Admin Dashboard.

### 5. Start Server
Launch the Express server:
```bash
npm run start
```
Open `http://localhost:5000` in your browser.

### 6. Run Verification Tests
To run the automated verification suite validating API protections, role limits, product CRUD, and order status updates:
```bash
node scratch/test.js
```
*(Ensure the backend server is running on port 5000 first).*

---

## 🌐 Deployment Guide

### Why Netlify doesn't work out-of-the-box
If you deploy this repository directly to Netlify, you will likely get a **"Page Not Found" (404)** error or find that the page loads but login/database functions fail. This is because:
1. **Directory Structure**: Netlify is a static hosting platform. By default, it expects `index.html` at the repository root. In this project, the frontend files are inside the `/public` folder.
2. **Missing Backend**: Netlify serves static pages, but it does **not** run long-running Node/Express backend servers (`node server.js`). Thus, any requests to `/api/*` endpoints fail with connection errors or 404s.

### Recommended Deployment Method
For full-stack Node.js + Express + MongoDB apps, it is recommended to host the backend on a server-hosting provider and optionally link it to a static site host:

#### Option A: Unified Host (Recommended for Simplest Setup)
Deploy the entire repository to a provider that supports server-side Node.js:
* **Render** ([render.com](https://render.com/))
* **Railway** ([railway.app](https://railway.app/))
* **Fly.io** ([fly.io](https://fly.io/))

These platforms will automatically detect the `package.json`, install dependencies, run the server, and serve the static `/public` folder side-by-side. You will only need to configure the `.env` variables (`MONGO_URI`, `JWT_SECRET`) in their web consoles.

#### Option B: Split Frontend (Netlify) + Backend (Render/Railway)
If you specifically want to keep the frontend on Netlify:
1. **Deploy the backend** code (`server.js`, `routes/`, `models/`, `middleware/`, `config/`) to Render or Railway.
2. **Configure Netlify Publish Directory**: Set the Netlify **Publish directory** option to `public`. This tells Netlify to find `index.html` inside `/public` and serve it at the root URL.
3. **Connect API**: Modify the base endpoint URL inside `public/js/api.js` to point to your deployed backend URL (e.g. `https://your-tago-backend.onrender.com`) instead of the relative path `/api`.
