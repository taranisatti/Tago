// Format price to INR style with Indian numbering system, e.g. ₹1,25,000
window.formatPrice = function(price) {
  const num = Number(price);
  if (isNaN(num)) return '₹0';
  return `₹${Math.round(num).toLocaleString('en-IN')}`;
};

// Global fallback handler for broken image loads
window.handleImageError = function(img) {
  img.onerror = null;
  img.src = 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600&auto=format&fit=crop';
};

// LocalStorage Cart Utilities
const cartUtils = {
  getCart() {
    return JSON.parse(localStorage.getItem('tago_cart')) || [];
  },
  
  saveCart(cart) {
    localStorage.setItem('tago_cart', JSON.stringify(cart));
    this.updateBadge();
  },
  
  addToCart(product, quantity = 1) {
    let cart = this.getCart();
    const existingIndex = cart.findIndex(item => item.product === product._id);
    
    if (existingIndex > -1) {
      cart[existingIndex].quantity += Number(quantity);
    } else {
      cart.push({
        product: product._id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        category: product.category,
        quantity: Number(quantity)
      });
    }
    
    this.saveCart(cart);
    showToast(`${product.name} added to cart!`, 'success');
  },
  
  updateQuantity(productId, quantity) {
    let cart = this.getCart();
    const index = cart.findIndex(item => item.product === productId);
    if (index > -1) {
      cart[index].quantity = Number(quantity);
      if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
      }
      this.saveCart(cart);
    }
  },
  
  removeFromCart(productId) {
    let cart = this.getCart();
    const filtered = cart.filter(item => item.product !== productId);
    this.saveCart(filtered);
    showToast('Item removed from cart', 'success');
  },
  
  clearCart() {
    localStorage.removeItem('tago_cart');
    this.updateBadge();
  },
  
  updateBadge() {
    const badge = document.getElementById('cartBadge');
    if (badge) {
      const cart = this.getCart();
      const count = cart.reduce((total, item) => total + item.quantity, 0);
      if (count > 0) {
        badge.textContent = count;
        badge.style.display = 'flex';
      } else {
        badge.style.display = 'none';
      }
    }
  }
};

// Toast Notifications System
function showToast(message, type = 'success') {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }

  // Remove existing show/success/error classes
  toast.className = 'toast';
  
  // Force a browser reflow to reset animations
  void toast.offsetWidth;
  
  toast.textContent = message;
  toast.className = `toast show ${type}`;

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Global Auth State and Navbar Init
document.addEventListener('DOMContentLoaded', async () => {
  // Set up initial cart count
  cartUtils.updateBadge();
  
  // Setup Search Input Event
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    // Populate query from url if exists
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');
    if (searchQuery) {
      searchInput.value = searchQuery;
    }
    
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        window.location.href = `/index.html?search=${encodeURIComponent(query)}`;
      }
    });
  }

  // Check login status & update Navbar links dynamically
  const authLinks = document.getElementById('authLinks');
  if (authLinks) {
    try {
      const user = await API.getMe();
      // User is logged in
      const displayName = user.fullName || user.username;
      const avatarChar = displayName.charAt(0).toUpperCase();
      const profilePicUrl = user.profilePicture || '';
      const avatarHtml = profilePicUrl 
        ? `<img src="${profilePicUrl}" alt="${displayName}" class="nav-avatar-img">`
        : `<div class="nav-avatar-txt">${avatarChar}</div>`;

      authLinks.innerHTML = `
        <li class="profile-dropdown-container">
          <button class="profile-dropdown-btn" id="profileDropdownBtn" aria-haspopup="true" aria-expanded="false">
            ${avatarHtml}
            <span class="nav-username">${displayName}</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="dropdown-chevron"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </button>
          <div class="profile-dropdown-menu" id="profileDropdownMenu">
            <div class="dropdown-user-info">
              <span class="dropdown-user-name">${displayName}</span>
              <span class="dropdown-user-email">${user.email}</span>
            </div>
            <hr class="dropdown-divider">
            ${user.role === 'admin' ? `
            <a href="/admin.html" class="dropdown-item" style="color: var(--accent-dark); font-weight: 600;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="stroke: var(--accent-dark);"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
              Admin Dashboard
            </a>
            <hr class="dropdown-divider">
            ` : ''}
            <a href="/dashboard.html?tab=orders" class="dropdown-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
              My Orders
            </a>
            <a href="/dashboard.html?tab=profile" class="dropdown-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
              Settings
            </a>
            <hr class="dropdown-divider">
            <a href="#" id="navLogoutBtn" class="dropdown-item logout-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              Logout
            </a>
          </div>
        </li>
      `;

      // Set up click handler to toggle dropdown
      const dropdownBtn = document.getElementById('profileDropdownBtn');
      const dropdownMenu = document.getElementById('profileDropdownMenu');
      
      dropdownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const expanded = dropdownBtn.getAttribute('aria-expanded') === 'true';
        dropdownBtn.setAttribute('aria-expanded', !expanded);
        dropdownMenu.classList.toggle('show');
      });

      // Close dropdown when clicking outside
      document.addEventListener('click', () => {
        dropdownBtn.setAttribute('aria-expanded', 'false');
        dropdownMenu.classList.remove('show');
      });

      // Hook up logout functionality
      const logoutBtn = document.getElementById('navLogoutBtn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
          e.preventDefault();
          try {
            await API.logout();
            showToast('Logged out successfully', 'success');
            setTimeout(() => {
              window.location.href = '/index.html';
            }, 1000);
          } catch (error) {
            showToast('Logout failed', 'error');
          }
        });
      }
    } catch (err) {
      // User is not logged in
      authLinks.innerHTML = `
        <li><a href="/auth.html" id="navLoginLink">Login / Register</a></li>
      `;
    }
  }
});
