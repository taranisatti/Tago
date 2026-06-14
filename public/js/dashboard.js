document.addEventListener('DOMContentLoaded', () => {
  const sidebarUserName = document.getElementById('sidebarUserName');
  const sidebarUserEmail = document.getElementById('sidebarUserEmail');
  const sidebarAvatar = document.getElementById('sidebarAvatar');
  const logoutBtn = document.getElementById('logoutBtnDashboard');

  // Tab Sidebar Selectors
  const navButtons = document.querySelectorAll('.sidebar-nav-btn[data-tab]');
  const panels = document.querySelectorAll('.dashboard-tab-panel');

  // Active User State
  let currentUser = null;

  // 1. Tab Navigation logic
  function switchTab(tabId, updateUrl = true) {
    // Update active nav button
    navButtons.forEach(btn => {
      if (btn.getAttribute('data-tab') === tabId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Show active panel, hide others
    panels.forEach(panel => {
      if (panel.id === `panel-${tabId}`) {
        panel.classList.add('active');
      } else {
        panel.classList.remove('active');
      }
    });

    // Populate data based on tab
    if (tabId === 'orders') {
      loadOrders();
    } else if (tabId === 'addresses') {
      loadAddresses();
    }

    // Update URL parameter without reload
    if (updateUrl) {
      const relativePath = window.location.pathname + `?tab=${tabId}`;
      history.pushState(null, '', relativePath);
    }
  }

  // 2. Immediately switch tab visually on load (synchronous to prevent flashing)
  const urlParams = new URLSearchParams(window.location.search);
  const startTab = urlParams.get('tab') || 'orders';
  switchTab(startTab, false);

  // Bind sidebar buttons
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      switchTab(tabId);
    });
  });

  // 3. Authenticate user and populate settings forms asynchronously
  initDashboard();

  async function initDashboard() {
    try {
      currentUser = await API.getMe();
      updateUserSidebarUI(currentUser);
      initializeProfileForm(currentUser);
      initializePreferencesForm(currentUser);
      
      // If we are on the addresses tab, reload it with the loaded currentUser context
      if (startTab === 'addresses') {
        loadAddresses();
      }
    } catch (err) {
      showToast('Please login to access your dashboard', 'error');
      window.location.href = '/auth.html?redirect=dashboard.html';
    }
  }

  // Helper: Update Sidebar User Display
  function updateUserSidebarUI(user) {
    const displayName = user.fullName || user.username;
    sidebarUserName.textContent = displayName;
    sidebarUserEmail.textContent = user.email;

    sidebarAvatar.innerHTML = '';
    if (user.profilePicture) {
      const img = document.createElement('img');
      img.src = user.profilePicture;
      img.alt = displayName;
      img.className = 'sidebar-avatar-img';
      // If image fails to load, fallback to text avatar
      img.onerror = () => {
        sidebarAvatar.textContent = displayName.charAt(0).toUpperCase();
      };
      sidebarAvatar.appendChild(img);
    } else {
      sidebarAvatar.textContent = displayName.charAt(0).toUpperCase();
    }
  }

  // Helper: Update Large Profile Avatar in profile tab
  function updateLargeAvatarUI(user) {
    const avatarLarge = document.getElementById('profileAvatarLarge');
    if (!avatarLarge) return;
    
    const displayName = user.fullName || user.username;
    avatarLarge.innerHTML = '';
    
    if (user.profilePicture) {
      const img = document.createElement('img');
      img.src = user.profilePicture;
      img.alt = displayName;
      img.className = 'sidebar-avatar-img';
      img.onerror = () => {
        avatarLarge.textContent = displayName.charAt(0).toUpperCase();
      };
      avatarLarge.appendChild(img);
    } else {
      avatarLarge.textContent = displayName.charAt(0).toUpperCase();
    }
  }

  // 3. Logout Handler
  logoutBtn.addEventListener('click', async () => {
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


  /* ==========================================================================
     TAB 1: ORDERS HISTORY
     ========================================================================== */
  async function loadOrders() {
    const ordersListEl = document.getElementById('ordersList');
    ordersListEl.innerHTML = '<p style="color: var(--text-light); text-align: center; padding: 2rem;">Loading your orders...</p>';

    try {
      const orders = await API.getMyOrders();

      if (!orders || orders.length === 0) {
        ordersListEl.innerHTML = `
          <div class="no-orders-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 1rem;"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
            <h3 style="margin-bottom: 0.5rem; color: var(--text-dark);">No Orders Found</h3>
            <p style="color: var(--text-light); margin-bottom: 1.5rem;">You have not placed any orders yet.</p>
            <a href="/index.html" class="btn btn-primary btn-sm">Shop Products</a>
          </div>
        `;
        return;
      }

      ordersListEl.innerHTML = '';

      orders.forEach(order => {
        const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        const orderCard = document.createElement('div');
        orderCard.className = 'order-card';
        
        let itemsHtml = '';
        order.items.forEach(item => {
          const pName = item.product ? item.product.name : 'Unknown Product';
          const pImage = item.product && item.product.imageUrl ? item.product.imageUrl : 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=100';

          itemsHtml += `
            <div class="order-item-row">
              <div class="order-item-details">
                <img src="${pImage}" alt="${pName}" class="order-item-thumb" onerror="handleImageError(this)">
                <div>
                  <div class="order-item-title">${pName}</div>
                  <div class="order-item-price-qty">Qty: ${item.quantity} &times; ${formatPrice(item.price)}</div>
                </div>
              </div>
              <div style="font-family: 'Outfit'; font-weight: 600; color: var(--text-dark);">${formatPrice(item.price * item.quantity)}</div>
            </div>
          `;
        });

        const statusClass = order.status ? order.status.toLowerCase() : 'pending';

        orderCard.innerHTML = `
          <div class="order-header">
            <div class="order-meta-info">
              <div>
                <div style="font-size: 0.65rem; text-transform: uppercase; color: var(--text-light);">Order ID</div>
                <div style="font-family: monospace; font-size: 0.85rem; word-break: break-all;">${order._id}</div>
              </div>
              <div>
                <div style="font-size: 0.65rem; text-transform: uppercase; color: var(--text-light);">Date Placed</div>
                <div>${orderDate}</div>
              </div>
              <div>
                <div style="font-size: 0.65rem; text-transform: uppercase; color: var(--text-light);">Total Paid</div>
                <div style="font-family: 'Outfit'; font-weight: 700; color: var(--accent-dark);">${formatPrice(order.totalAmount)}</div>
              </div>
            </div>
            <span class="order-status ${statusClass}">${order.status}</span>
          </div>
          <div class="order-body">
            <div style="margin-bottom: 1.5rem;">
              ${itemsHtml}
            </div>
            <div style="border-top: 1px solid #f0f0f0; padding-top: 1rem; font-size: 0.85rem;">
              <div style="font-weight: 600; color: var(--text-dark); margin-bottom: 0.25rem;">Shipping Destination:</div>
              <div style="color: var(--text-main);">
                <strong>${order.shippingAddress.fullName}</strong><br>
                ${order.shippingAddress.addressLine}, ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}, ${order.shippingAddress.country}
              </div>
            </div>
          </div>
        `;

        ordersListEl.appendChild(orderCard);
      });

    } catch (error) {
      console.error('Error fetching orders:', error);
      ordersListEl.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: #ff4d4d;">
          <p>Failed to load order history. Please try again later.</p>
        </div>
      `;
    }
  }


  /* ==========================================================================
     TAB 2: PROFILE SETTINGS
     ========================================================================== */
  const profileForm = document.getElementById('profileSettingsForm');
  const profileFullName = document.getElementById('profileFullName');
  const profileEmail = document.getElementById('profileEmail');
  const profilePhone = document.getElementById('profilePhone');
  const profilePictureUrl = document.getElementById('profilePictureUrl');
  const profileUsername = document.getElementById('profileUsername');

  function initializeProfileForm(user) {
    profileFullName.value = user.fullName || '';
    profileEmail.value = user.email || '';
    profilePhone.value = user.phone || '';
    profilePictureUrl.value = user.profilePicture || '';
    profileUsername.value = user.username || '';
    updateLargeAvatarUI(user);

    // Watch for profile picture url adjustments and dynamically preview
    profilePictureUrl.addEventListener('change', () => {
      const tempUser = { ...currentUser, profilePicture: profilePictureUrl.value.trim() };
      updateLargeAvatarUI(tempUser);
    });
  }

  profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const fullName = profileFullName.value.trim();
    const email = profileEmail.value.trim();
    const phone = profilePhone.value.trim();
    const profilePicture = profilePictureUrl.value.trim();

    try {
      const res = await API.updateProfile(fullName, email, phone, profilePicture);
      currentUser = res.user;
      
      // Update UI displays
      updateUserSidebarUI(currentUser);
      updateLargeAvatarUI(currentUser);
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update profile.', 'error');
    }
  });


  /* ==========================================================================
     TAB 3: ADDRESS BOOK MANAGEMENT
     ========================================================================== */
  const addNewAddressBtn = document.getElementById('addNewAddressBtn');
  const addressFormModal = document.getElementById('addressFormModal');
  const closeAddressModalBtn = document.getElementById('closeAddressModalBtn');
  const cancelAddressModalBtn = document.getElementById('cancelAddressModalBtn');
  const addressForm = document.getElementById('addressForm');
  const addressModalTitle = document.getElementById('addressModalTitle');
  const hiddenAddressId = document.getElementById('addressIdHidden');

  // Input selectors
  const addrFullName = document.getElementById('addrFullName');
  const addrLine = document.getElementById('addrLine');
  const addrCity = document.getElementById('addrCity');
  const addrState = document.getElementById('addrState');
  const addrPostalCode = document.getElementById('addrPostalCode');
  const addrCountry = document.getElementById('addrCountry');
  const addrPhone = document.getElementById('addrPhone');
  const addrIsDefault = document.getElementById('addrIsDefault');

  // Open Add address modal
  addNewAddressBtn.addEventListener('click', () => {
    addressModalTitle.textContent = 'Add New Address';
    hiddenAddressId.value = '';
    addressForm.reset();
    
    // Safely check if currentUser is loaded and has addresses
    const hasNoAddresses = currentUser && currentUser.addresses ? currentUser.addresses.length === 0 : true;
    addrIsDefault.checked = hasNoAddresses;
    
    addressFormModal.classList.add('show');
  });

  // Close address modal
  function closeAddressModal() {
    addressFormModal.classList.remove('show');
  }
  closeAddressModalBtn.addEventListener('click', closeAddressModal);
  cancelAddressModalBtn.addEventListener('click', closeAddressModal);

  // Load Addresses list
  async function loadAddresses() {
    const listGrid = document.getElementById('addressesListGrid');
    listGrid.innerHTML = '<p style="color: var(--text-light); text-align: center; padding: 2rem;">Loading addresses...</p>';

    try {
      // Reload profile to get freshest address list
      currentUser = await API.getMe();
      const addresses = currentUser.addresses || [];

      if (addresses.length === 0) {
        listGrid.innerHTML = `
          <div style="grid-column: 1/-1; text-align: center; padding: 3rem 1rem; border: 1px dashed var(--border-color); border-radius: var(--border-radius-md); background: var(--light-gray);">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 1rem;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
            <h4 style="margin-bottom: 0.25rem;">No Addresses Saved</h4>
            <p style="color: var(--text-light); font-size: 0.85rem;">Add a shipping destination to enjoy faster checkout.</p>
          </div>
        `;
        return;
      }

      listGrid.innerHTML = '';

      addresses.forEach(addr => {
        const card = document.createElement('div');
        card.className = `address-card ${addr.isDefault ? 'default' : ''}`;
        
        card.innerHTML = `
          ${addr.isDefault ? '<span class="default-address-badge">Default</span>' : ''}
          <h4 class="address-recipient">${addr.fullName}</h4>
          <p class="address-details">
            ${addr.addressLine}<br>
            ${addr.city}, ${addr.state} ${addr.postalCode}<br>
            ${addr.country}<br>
            ${addr.phone ? 'Phone: ' + addr.phone : ''}
          </p>
          <div class="address-card-actions">
            <button class="address-action-btn edit-btn" data-id="${addr._id}">Edit</button>
            <button class="address-action-btn delete-btn" data-id="${addr._id}">Delete</button>
            ${!addr.isDefault ? `<button class="address-action-btn default-btn" data-id="${addr._id}">Set Default</button>` : ''}
          </div>
        `;

        // Bind address card operations
        card.querySelector('.edit-btn').addEventListener('click', () => {
          addressModalTitle.textContent = 'Edit Address';
          hiddenAddressId.value = addr._id;
          
          addrFullName.value = addr.fullName;
          addrLine.value = addr.addressLine;
          addrCity.value = addr.city;
          addrState.value = addr.state;
          addrPostalCode.value = addr.postalCode;
          addrCountry.value = addr.country;
          addrPhone.value = addr.phone || '';
          addrIsDefault.checked = addr.isDefault;

          addressFormModal.classList.add('show');
        });

        card.querySelector('.delete-btn').addEventListener('click', async () => {
          if (confirm('Are you sure you want to delete this address?')) {
            try {
              const res = await API.deleteAddress(addr._id);
              currentUser.addresses = res.addresses;
              showToast('Address removed successfully', 'success');
              loadAddresses();
            } catch (err) {
              showToast('Failed to delete address', 'error');
            }
          }
        });

        if (!addr.isDefault) {
          card.querySelector('.default-btn').addEventListener('click', async () => {
            try {
              const res = await API.setDefaultAddress(addr._id);
              currentUser.addresses = res.addresses;
              showToast('Default address updated', 'success');
              loadAddresses();
            } catch (err) {
              showToast('Failed to set default address', 'error');
            }
          });
        }

        listGrid.appendChild(card);
      });

    } catch (err) {
      listGrid.innerHTML = '<p style="color: #ff4d4d; text-align: center; padding: 2rem;">Failed to retrieve Address Book details.</p>';
    }
  }

  // Address Submit handler (Create or Update)
  addressForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const addressId = hiddenAddressId.value;
    const payload = {
      fullName: addrFullName.value.trim(),
      addressLine: addrLine.value.trim(),
      city: addrCity.value.trim(),
      state: addrState.value.trim(),
      postalCode: addrPostalCode.value.trim(),
      country: addrCountry.value.trim(),
      phone: addrPhone.value.trim(),
      isDefault: addrIsDefault.checked
    };

    try {
      let res;
      if (addressId) {
        // Edit existing
        res = await API.updateAddress(addressId, payload);
        showToast('Address updated successfully', 'success');
      } else {
        // Create new
        res = await API.addAddress(payload);
        showToast('Address saved successfully', 'success');
      }

      currentUser.addresses = res.addresses;
      closeAddressModal();
      loadAddresses();
    } catch (err) {
      showToast(err.message || 'Failed to save address details.', 'error');
    }
  });


  /* ==========================================================================
     TAB 4: SECURITY PASSWORD CHANGES
     ========================================================================== */
  const changePasswordForm = document.getElementById('changePasswordForm');
  const currentPasswordInput = document.getElementById('securityCurrentPassword');
  const newPasswordInput = document.getElementById('securityNewPassword');
  const confirmPasswordInput = document.getElementById('securityConfirmPassword');

  changePasswordForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const currentPassword = currentPasswordInput.value;
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    try {
      await API.changePassword(currentPassword, newPassword);
      showToast('Password changed successfully!', 'success');
      changePasswordForm.reset();
    } catch (err) {
      showToast(err.message || 'Failed to change password. Validate current password.', 'error');
    }
  });


  /* ==========================================================================
     TAB 5: NOTIFICATION PREFERENCES
     ========================================================================== */
  const preferencesForm = document.getElementById('preferencesForm');
  const prefOrderUpdates = document.getElementById('prefOrderUpdates');
  const prefPromotions = document.getElementById('prefPromotions');

  function initializePreferencesForm(user) {
    if (user.preferences && user.preferences.notificationPreferences) {
      prefOrderUpdates.checked = !!user.preferences.notificationPreferences.orderUpdates;
      prefPromotions.checked = !!user.preferences.notificationPreferences.promotions;
    }
  }

  preferencesForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const orderUpdates = prefOrderUpdates.checked;
    const promotions = prefPromotions.checked;

    try {
      const res = await API.updatePreferences(orderUpdates, promotions);
      currentUser.preferences = res.preferences;
      showToast('Notification preferences saved', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update preferences.', 'error');
    }
  });

});
