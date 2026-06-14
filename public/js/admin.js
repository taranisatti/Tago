document.addEventListener('DOMContentLoaded', async () => {
  let currentUser = null;

  console.log('[Admin Auth] Starting admin authentication checks...');

  // 1. Authenticate user as Admin
  try {
    currentUser = await API.getMe();
    console.log('[Admin Auth] API.getMe() response:', currentUser);
    if (!currentUser) {
      console.warn('[Admin Auth] No user resolved, redirecting to login...');
      showToast('Please login to access the admin portal', 'error');
      window.location.href = '/auth.html?redirect=admin.html';
      return;
    }
    console.log('[Admin Auth] User resolved. Role:', currentUser.role);
    if (currentUser.role !== 'admin') {
      console.error('[Admin Auth] Access denied: User is not an admin. Role found:', currentUser.role);
      showToast('Access Denied: Admin role required', 'error');
      setTimeout(() => {
        window.location.href = '/index.html';
      }, 1500);
      return;
    }
    console.log('[Admin Auth] User authenticated successfully as admin. Access granted.');
  } catch (err) {
    console.error('[Admin Auth] Exception caught during authentication:', err);
    showToast('Please login to access the admin portal', 'error');
    window.location.href = '/auth.html?redirect=admin.html';
    return;
  }

  // 2. Populate Admin profile in sidebar
  const sidebarUserName = document.getElementById('sidebarUserName');
  const sidebarUserEmail = document.getElementById('sidebarUserEmail');
  const sidebarAvatar = document.getElementById('sidebarAvatar');

  if (currentUser) {
    const displayName = currentUser.fullName || currentUser.username;
    sidebarUserName.textContent = displayName;
    sidebarUserEmail.textContent = currentUser.email;
    sidebarAvatar.textContent = displayName.charAt(0).toUpperCase();
  }

  // 3. Tab switching logic
  const tabButtons = document.querySelectorAll('.sidebar-nav-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');

      // Update active button classes
      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update active panel classes
      tabPanels.forEach(p => p.classList.remove('active'));
      const activePanel = document.getElementById(`panel-${tabId}`);
      if (activePanel) {
        activePanel.classList.add('active');
      }

      // Load data corresponding to selected tab
      if (tabId === 'overview') loadOverview();
      if (tabId === 'products') loadProducts();
      if (tabId === 'orders') loadOrders();
      if (tabId === 'customers') loadCustomers();
    });
  });

  // Load initial panel data
  loadOverview();

  // ----------------------------------------------------
  // Tab 1: Overview / Analytics Loader
  // ----------------------------------------------------
  async function loadOverview() {
    try {
      const analytics = await API.adminGetAnalytics();
      
      document.getElementById('statRevenue').textContent = formatPrice(analytics.totalRevenue);
      document.getElementById('statOrders').textContent = analytics.totalOrders;
      document.getElementById('statProducts').textContent = analytics.totalProducts;
      document.getElementById('statCustomers').textContent = analytics.totalCustomers;
      
      const lowStockEl = document.getElementById('statLowStock');
      lowStockEl.textContent = analytics.lowStockProducts;
      if (analytics.lowStockProducts > 0) {
        lowStockEl.classList.add('low-stock-warning');
      } else {
        lowStockEl.classList.remove('low-stock-warning');
      }
    } catch (err) {
      showToast('Failed to load overview analytics', 'error');
    }
  }

  // ----------------------------------------------------
  // Tab 2: Products Inventory Management
  // ----------------------------------------------------
  const productsTableBody = document.getElementById('adminProductsTableBody');
  const productModal = document.getElementById('productModal');
  const productForm = document.getElementById('productForm');
  const modalProductId = document.getElementById('modalProductId');
  const productModalTitle = document.getElementById('productModalTitle');

  // Image URL validation and preview logic
  const modalProdImage = document.getElementById('modalProdImage');
  const imagePreviewContainer = document.getElementById('imagePreviewContainer');
  const modalProdImagePreview = document.getElementById('modalProdImagePreview');
  const imageWarning = document.getElementById('imageWarning');

  let previewLoadSuccess = true;
  let isUrlFormatValid = true;

  function validateAndPreviewImage() {
    const url = modalProdImage.value.trim();
    if (!url) {
      imagePreviewContainer.style.display = 'none';
      imageWarning.style.display = 'none';
      previewLoadSuccess = true;
      isUrlFormatValid = true;
      return;
    }

    // Verify protocol format (http:// or https://)
    try {
      const parsed = new URL(url);
      isUrlFormatValid = parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch (_) {
      isUrlFormatValid = false;
    }

    if (!isUrlFormatValid) {
      console.warn('[Admin Image Validation] Invalid URL format:', url);
      imagePreviewContainer.style.display = 'none';
      imageWarning.textContent = '⚠️ Warning: Invalid image URL format. Must start with http:// or https://';
      imageWarning.style.display = 'block';
      previewLoadSuccess = false;
      return;
    }

    // Attempt to load image in preview
    console.log('[Admin Image Validation] Attempting to load image preview:', url);
    modalProdImagePreview.src = url;
  }

  // Preview Load Event Handlers
  modalProdImagePreview.onload = () => {
    console.log('[Admin Image Validation] Preview image loaded successfully.');
    previewLoadSuccess = true;
    imageWarning.style.display = 'none';
    imagePreviewContainer.style.display = 'block';
  };

  modalProdImagePreview.onerror = () => {
    console.warn('[Admin Image Validation] Preview image failed to load.');
    previewLoadSuccess = false;
    // Set preview src to fallback so it shows a preview of what will actually render
    modalProdImagePreview.onerror = null; // prevent infinite loops
    modalProdImagePreview.src = 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600&auto=format&fit=crop';
    imageWarning.textContent = '⚠️ Warning: Image failed to load. Storefront will show fallback placeholder.';
    imageWarning.style.display = 'block';
    imagePreviewContainer.style.display = 'block';
  };

  modalProdImage.addEventListener('input', validateAndPreviewImage);

  // Open modal for Adding
  document.getElementById('openAddProductBtn').addEventListener('click', () => {
    productForm.reset();
    modalProductId.value = '';
    productModalTitle.textContent = 'Add Product';
    imagePreviewContainer.style.display = 'none';
    imageWarning.style.display = 'none';
    previewLoadSuccess = true;
    isUrlFormatValid = true;
    productModal.classList.add('show');
  });

  // Close modals
  const closeProductModal = () => {
    productModal.classList.remove('show');
  };
  document.getElementById('closeProductModalBtn').addEventListener('click', closeProductModal);
  document.getElementById('cancelProductModalBtn').addEventListener('click', closeProductModal);

  async function loadProducts() {
    try {
      const products = await API.getProducts();
      productsTableBody.innerHTML = '';

      if (products.length === 0) {
        productsTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-light);">No products found in database.</td></tr>`;
        return;
      }

      products.forEach(p => {
        const tr = document.createElement('tr');
        const imgUrl = p.imageUrl || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=100';
        const isLowStock = p.stock <= 5;
        
        tr.innerHTML = `
          <td><img src="${imgUrl}" alt="${p.name}" class="admin-product-thumb" onerror="handleImageError(this)"></td>
          <td style="font-weight: 600; color: var(--text-dark);">${p.name}</td>
          <td>${p.category}</td>
          <td style="text-align: right; font-family: 'Outfit'; font-weight: 500;">${formatPrice(p.price)}</td>
          <td style="text-align: right; font-family: 'Outfit'; font-weight: 600;" class="${isLowStock ? 'low-stock-warning' : ''}">${p.stock}</td>
          <td style="text-align: center;">
            <div class="btn-action-container" style="justify-content: center;">
              <button class="btn-sm btn-edit edit-prod-btn" data-id="${p._id}">Edit</button>
              <button class="btn-sm btn-delete delete-prod-btn" data-id="${p._id}">Delete</button>
            </div>
          </td>
        `;

        // Bind Actions
        tr.querySelector('.edit-prod-btn').addEventListener('click', () => editProduct(p));
        tr.querySelector('.delete-prod-btn').addEventListener('click', () => deleteProduct(p._id));

        productsTableBody.appendChild(tr);
      });
    } catch (err) {
      showToast('Failed to load products list', 'error');
    }
  }

  // Edit Product details click handler
  function editProduct(product) {
    productForm.reset();
    modalProductId.value = product._id;
    productModalTitle.textContent = 'Edit Product';

    document.getElementById('modalProdName').value = product.name || '';
    document.getElementById('modalProdCategory').value = product.category || '';
    document.getElementById('modalProdPrice').value = product.price || 0;
    document.getElementById('modalProdStock').value = product.stock || 0;
    document.getElementById('modalProdImage').value = product.imageUrl || '';
    document.getElementById('modalProdDesc').value = product.description || '';

    // Run preview and check validity immediately
    validateAndPreviewImage();

    productModal.classList.add('show');
  }

  // Submit Product Form (Create / Update)
  productForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = modalProductId.value;
    const productData = {
      name: document.getElementById('modalProdName').value.trim(),
      category: document.getElementById('modalProdCategory').value.trim(),
      price: Number(document.getElementById('modalProdPrice').value),
      stock: Number(document.getElementById('modalProdStock').value),
      imageUrl: document.getElementById('modalProdImage').value.trim(),
      description: document.getElementById('modalProdDesc').value.trim()
    };

    if (!productData.name || !productData.category || productData.price < 0 || productData.stock < 0) {
      showToast('Please fill out all required fields correctly', 'error');
      return;
    }

    if (productData.imageUrl && !isUrlFormatValid) {
      showToast('Please provide a valid image URL (http:// or https://)', 'error');
      return;
    }

    try {
      if (id) {
        // Edit product
        await API.adminUpdateProduct(id, productData);
        showToast('Product updated successfully', 'success');
      } else {
        // Add product
        await API.adminCreateProduct(productData);
        showToast('Product created successfully', 'success');
      }
      closeProductModal();
      loadProducts();
      loadOverview();
    } catch (err) {
      showToast(err.message || 'Failed to save product details', 'error');
    }
  });

  // Delete product details handler
  async function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      try {
        await API.adminDeleteProduct(productId);
        showToast('Product deleted successfully', 'success');
        loadProducts();
        loadOverview();
      } catch (err) {
        showToast(err.message || 'Failed to delete product', 'error');
      }
    }
  }

  // ----------------------------------------------------
  // Tab 3: Orders Management
  // ----------------------------------------------------
  const ordersTableBody = document.getElementById('adminOrdersTableBody');
  const orderDetailsModal = document.getElementById('orderDetailsModal');

  // Close order modal handlers
  const closeOrderModal = () => orderDetailsModal.classList.remove('show');
  document.getElementById('closeOrderModalBtn').addEventListener('click', closeOrderModal);
  document.getElementById('closeOrderModalFooterBtn').addEventListener('click', closeOrderModal);

  async function loadOrders() {
    try {
      const orders = await API.adminGetOrders();
      ordersTableBody.innerHTML = '';

      if (orders.length === 0) {
        ordersTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-light);">No customer orders found.</td></tr>`;
        return;
      }

      orders.forEach(order => {
        const tr = document.createElement('tr');
        const dateStr = new Date(order.createdAt).toLocaleDateString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric'
        });
        const buyerName = order.user ? (order.user.fullName || order.user.username) : 'Guest/Deleted User';
        
        tr.innerHTML = `
          <td style="font-family: monospace; font-size: 0.8rem; color: var(--text-light);">${order._id}</td>
          <td>${dateStr}</td>
          <td style="font-weight: 500; color: var(--text-dark);">${buyerName}</td>
          <td style="text-align: right; font-family: 'Outfit'; font-weight: 600;">${formatPrice(order.totalAmount)}</td>
          <td>
            <select class="status-select select-order-status" data-id="${order._id}">
              <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
              <option value="Processing" ${order.status === 'Processing' ? 'selected' : ''}>Processing</option>
              <option value="Shipped" ${order.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
              <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
              <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
            </select>
          </td>
          <td style="text-align: center;">
            <button class="btn-sm btn-view view-order-details-btn" data-id="${order._id}">View Details</button>
          </td>
        `;

        // Bind Change Listener on Status Dropdown
        const select = tr.querySelector('.select-order-status');
        select.addEventListener('change', async (e) => {
          const newStatus = e.target.value;
          try {
            await API.adminUpdateOrderStatus(order._id, newStatus);
            showToast(`Order status updated to ${newStatus}`, 'success');
            loadOverview(); // update revenue counts if status affects metrics
          } catch (err) {
            showToast(err.message || 'Failed to update order status', 'error');
            // reset select value
            select.value = order.status;
          }
        });

        // Bind Details Modal Click
        tr.querySelector('.view-order-details-btn').addEventListener('click', () => showOrderDetails(order));

        ordersTableBody.appendChild(tr);
      });
    } catch (err) {
      showToast('Failed to load customer orders', 'error');
    }
  }

  // Display detail list of single Order
  function showOrderDetails(order) {
    const dateStr = new Date(order.createdAt).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    const buyerName = order.user ? (order.user.fullName || order.user.username) : 'Guest';
    const buyerEmail = order.user ? order.user.email : '-';

    document.getElementById('detailOrderId').textContent = order._id;
    document.getElementById('detailOrderDate').textContent = dateStr;
    document.getElementById('detailCustName').textContent = buyerName;
    document.getElementById('detailCustEmail').textContent = buyerEmail;

    // Address
    const addr = order.shippingAddress;
    document.getElementById('detailShippingAddr').textContent = `${addr.fullName}, ${addr.addressLine}, ${addr.city} - ${addr.postalCode}, ${addr.country}`;

    // Items list
    const container = document.getElementById('detailOrderItemsContainer');
    container.innerHTML = '';
    
    order.items.forEach(item => {
      const itemEl = document.createElement('div');
      itemEl.className = 'order-detail-item';
      const prodName = item.product ? item.product.name : 'Deleted Product';
      
      itemEl.innerHTML = `
        <div>
          <div style="font-weight: 600; color: var(--text-dark);">${prodName}</div>
          <div style="font-size: 0.75rem; color: var(--text-light);">Quantity: ${item.quantity} &times; ${formatPrice(item.price)}</div>
        </div>
        <div style="font-family: 'Outfit'; font-weight: 600; color: var(--text-dark);">${formatPrice(item.price * item.quantity)}</div>
      `;
      container.appendChild(itemEl);
    });

    document.getElementById('detailOrderTotal').textContent = formatPrice(order.totalAmount);
    orderDetailsModal.classList.add('show');
  }

  // ----------------------------------------------------
  // Tab 4: Customers List
  // ----------------------------------------------------
  const customersTableBody = document.getElementById('adminCustomersTableBody');

  async function loadCustomers() {
    try {
      const customers = await API.adminGetUsers();
      customersTableBody.innerHTML = '';

      if (customers.length === 0) {
        customersTableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-light);">No registered customers found.</td></tr>`;
        return;
      }

      customers.forEach(cust => {
        const tr = document.createElement('tr');
        const regDate = new Date(cust.createdAt).toLocaleDateString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric'
        });

        tr.innerHTML = `
          <td style="font-weight: 600; color: var(--text-dark);">${cust.username}</td>
          <td>${cust.email}</td>
          <td>${regDate}</td>
          <td style="text-align: right; font-family: 'Outfit'; font-weight: 500; padding-right: 2.5rem;">${cust.orderCount || 0}</td>
        `;
        customersTableBody.appendChild(tr);
      });
    } catch (err) {
      showToast('Failed to load customers list', 'error');
    }
  }
});
