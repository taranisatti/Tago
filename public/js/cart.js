document.addEventListener('DOMContentLoaded', () => {
  const cartLayout = document.getElementById('cartLayout');
  const emptyCartState = document.getElementById('emptyCartState');
  const cartItemsContainer = document.getElementById('cartItemsContainer');
  const cartSubtotal = document.getElementById('cartSubtotal');
  const cartTotal = document.getElementById('cartTotal');
  const checkoutBtn = document.getElementById('checkoutBtn');

  renderCart();

  function renderCart() {
    const cart = cartUtils.getCart();

    if (cart.length === 0) {
      cartLayout.style.display = 'none';
      emptyCartState.style.display = 'block';
      return;
    }

    cartLayout.style.display = 'grid';
    emptyCartState.style.display = 'none';
    cartItemsContainer.innerHTML = '';

    let subtotal = 0;

    cart.forEach(item => {
      const itemRow = document.createElement('div');
      itemRow.className = 'cart-item';
      itemRow.innerHTML = `
        <img src="${item.imageUrl || 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=100'}" alt="${item.name}" class="cart-item-img" onerror="handleImageError(this)">
        <div class="cart-item-info">
          <span class="cart-item-category">${item.category}</span>
          <h3 class="cart-item-name"><a href="/product.html?id=${item.product}">${item.name}</a></h3>
          <div class="cart-item-price">${formatPrice(item.price)}</div>
        </div>
        
        <div class="cart-item-actions">
          <div class="quantity-selector" style="transform: scale(0.9);">
            <button class="quantity-btn dec-qty" data-id="${item.product}">&minus;</button>
            <div class="quantity-val">${item.quantity}</div>
            <button class="quantity-btn inc-qty" data-id="${item.product}">&plus;</button>
          </div>
          
          <button class="remove-item-btn" data-id="${item.product}" title="Remove Item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
          </button>
        </div>
      `;

      // Event listeners
      itemRow.querySelector('.dec-qty').addEventListener('click', () => {
        if (item.quantity > 1) {
          cartUtils.updateQuantity(item.product, item.quantity - 1);
          renderCart();
        } else {
          // If 1, clicking minus removes it
          cartUtils.removeFromCart(item.product);
          renderCart();
        }
      });

      itemRow.querySelector('.inc-qty').addEventListener('click', () => {
        // Increment quantity. In a production app, we would verify with backend stock,
        // but since we keep it locally, we will increment. When ordering, the API validates.
        cartUtils.updateQuantity(item.product, item.quantity + 1);
        renderCart();
      });

      itemRow.querySelector('.remove-item-btn').addEventListener('click', () => {
        cartUtils.removeFromCart(item.product);
        renderCart();
      });

      cartItemsContainer.appendChild(itemRow);
      subtotal += item.price * item.quantity;
    });

    cartSubtotal.textContent = formatPrice(subtotal);
    cartTotal.textContent = formatPrice(subtotal);
  }

  // Handle Checkout Click
  checkoutBtn.addEventListener('click', async () => {
    try {
      // Check if user is authenticated
      await API.getMe();
      // Auth successful, proceed to checkout
      window.location.href = '/checkout.html';
    } catch (err) {
      // Not authenticated, redirect to Login with a return URL
      showToast('Please login to checkout', 'info');
      setTimeout(() => {
        window.location.href = '/auth.html?redirect=checkout.html';
      }, 1500);
    }
  });
});
