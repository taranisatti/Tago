document.addEventListener('DOMContentLoaded', async () => {
  let currentUser = null;
  let savedAddresses = [];

  // 1. Authenticate user
  try {
    currentUser = await API.getMe();
  } catch (err) {
    showToast('Please login to access checkout', 'error');
    window.location.href = '/auth.html?redirect=checkout.html';
    return;
  }

  // 2. Validate Cart
  const cart = cartUtils.getCart();
  if (cart.length === 0) {
    showToast('Your cart is empty', 'error');
    setTimeout(() => {
      window.location.href = '/index.html';
    }, 1000);
    return;
  }

  // 3. Load Saved Addresses for Autofill
  try {
    savedAddresses = await API.getAddresses();
    if (savedAddresses && savedAddresses.length > 0) {
      const dropdownContainer = document.getElementById('savedAddressesDropdownContainer');
      const dropdown = document.getElementById('savedAddressesSelect');
      
      dropdownContainer.style.display = 'flex';
      
      savedAddresses.forEach(addr => {
        const option = document.createElement('option');
        option.value = addr._id;
        option.textContent = `${addr.fullName} - ${addr.addressLine}, ${addr.city} ${addr.isDefault ? '(Default)' : ''}`;
        dropdown.appendChild(option);
      });

      // Auto-select and fill default address
      const defaultAddr = savedAddresses.find(a => a.isDefault);
      if (defaultAddr) {
        dropdown.value = defaultAddr._id;
        autofillShippingForm(defaultAddr);
      }

      // Handle dropdown selection change
      dropdown.addEventListener('change', (e) => {
        const selectedId = e.target.value;
        if (selectedId) {
          const addr = savedAddresses.find(a => a._id === selectedId);
          if (addr) autofillShippingForm(addr);
        } else {
          clearShippingForm();
        }
      });
    }
  } catch (addrErr) {
    console.error('Failed to load saved addresses', addrErr);
  }

  function autofillShippingForm(addr) {
    document.getElementById('fullName').value = addr.fullName || '';
    document.getElementById('addressLine').value = addr.addressLine || '';
    document.getElementById('city').value = addr.city || '';
    document.getElementById('state').value = addr.state || '';
    document.getElementById('postalCode').value = addr.postalCode || '';
    document.getElementById('country').value = addr.country || '';
  }

  function clearShippingForm() {
    document.getElementById('fullName').value = '';
    document.getElementById('addressLine').value = '';
    document.getElementById('city').value = '';
    document.getElementById('state').value = '';
    document.getElementById('postalCode').value = '';
    document.getElementById('country').value = '';
  }

  // 4. Render Order Summary
  const summaryContainer = document.getElementById('checkoutSummaryItems');
  const subtotalText = document.getElementById('checkoutSubtotal');
  const totalText = document.getElementById('checkoutTotal');
  const placeOrderBtn = document.getElementById('placeOrderBtn');

  summaryContainer.innerHTML = '';
  let subtotal = 0;

  cart.forEach(item => {
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.justifyContent = 'space-between';
    row.style.alignItems = 'center';
    row.style.padding = '0.75rem 0';
    row.style.borderBottom = '1px solid var(--border-color)';
    row.innerHTML = `
      <div>
        <div style="font-weight: 600; font-size: 0.95rem; color: var(--text-dark);">${item.name}</div>
        <div style="font-size: 0.8rem; color: var(--text-light);">Qty: ${item.quantity} &times; ${formatPrice(item.price)}</div>
      </div>
      <div style="font-family: 'Outfit'; font-weight: 600; color: var(--text-dark);">${formatPrice(item.price * item.quantity)}</div>
    `;
    summaryContainer.appendChild(row);
    subtotal += item.price * item.quantity;
  });

  subtotalText.textContent = formatPrice(subtotal);
  totalText.textContent = formatPrice(subtotal);

  // 5. Mock Credit Card Input Mirroring
  const cardNo = document.getElementById('cardNo');
  const cardName = document.getElementById('cardName');
  const cardExpiry = document.getElementById('cardExpiry');

  const cardNoPreview = document.getElementById('cardNoPreview');
  const cardNamePreview = document.getElementById('cardNamePreview');
  const cardExpiryPreview = document.getElementById('cardExpiryPreview');

  cardNo.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    let formattedValue = '';
    for (let i = 0; i < value.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formattedValue += ' ';
      }
      formattedValue += value[i];
    }
    e.target.value = formattedValue;
    cardNoPreview.textContent = formattedValue || '•••• •••• •••• ••••';
  });

  cardName.addEventListener('input', (e) => {
    cardNamePreview.textContent = e.target.value.toUpperCase() || 'CARDHOLDER NAME';
  });

  cardExpiry.addEventListener('input', (e) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length > 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    e.target.value = value;
    cardExpiryPreview.textContent = value || 'MM/YY';
  });

  // 6. Submit Order
  placeOrderBtn.addEventListener('click', async (e) => {
    e.preventDefault();

    // Fields values
    const fullName = document.getElementById('fullName').value.trim();
    const addressLine = document.getElementById('addressLine').value.trim();
    const city = document.getElementById('city').value.trim();
    const state = document.getElementById('state').value.trim();
    const postalCode = document.getElementById('postalCode').value.trim();
    const country = document.getElementById('country').value.trim();

    const cNo = cardNo.value.trim();
    const cName = cardName.value.trim();
    const cExp = cardExpiry.value.trim();
    const cCvv = document.getElementById('cardCvv').value.trim();

    // Basic Validations
    if (!fullName || !addressLine || !city || !state || !postalCode || !country) {
      showToast('Please fill out all shipping details', 'error');
      return;
    }

    if (!cNo || !cName || !cExp || !cCvv) {
      showToast('Please complete all mock payment fields', 'error');
      return;
    }

    if (cNo.replace(/\s/g, '').length < 16) {
      showToast('Mock Card number must be 16 digits long', 'error');
      return;
    }

    if (cCvv.length < 3) {
      showToast('Mock Card CVV must be 3 digits long', 'error');
      return;
    }

    const itemsPayload = cart.map(item => ({
      product: item.product,
      quantity: item.quantity,
      price: item.price
    }));

    // In Order model, shippingAddress properties are fullName, addressLine, city, postalCode, country.
    // We append state to city or addressLine, or simply pass it as part of shippingAddress.
    // Passing state is fine, and we can format addressLine to include state so it displays in Order History cleanly:
    const shippingAddress = {
      fullName,
      addressLine: addressLine + (state ? `, ${state}` : ''),
      city,
      postalCode,
      country
    };

    placeOrderBtn.disabled = true;
    placeOrderBtn.textContent = 'Processing Mock Order...';

    try {
      await API.createOrder(itemsPayload, shippingAddress, 'Mock Credit Card');
      showToast('Order placed successfully! Redirecting...', 'success');
      
      // Clear Cart
      cartUtils.clearCart();

      // Redirect to Dashboard (Order list)
      setTimeout(() => {
        window.location.href = '/dashboard.html?tab=orders';
      }, 1500);

    } catch (err) {
      showToast(err.message || 'Failed to place order. Try again.', 'error');
      placeOrderBtn.disabled = false;
      placeOrderBtn.textContent = 'Place Mock Order';
    }
  });
});
