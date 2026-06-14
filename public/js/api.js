const API = {
  // Auth API Calls
  async signup(username, email, password) {
    return this.post('/api/auth/signup', { username, email, password });
  },

  async login(email, password) {
    return this.post('/api/auth/login', { email, password });
  },

  async logout() {
    return this.post('/api/auth/logout');
  },

  async getMe() {
    return this.get('/api/auth/me');
  },

  // Products API Calls
  async getProducts(search = '', category = '') {
    let url = '/api/products';
    const params = [];
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    if (category) params.push(`category=${encodeURIComponent(category)}`);
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    return this.get(url);
  },

  async getProduct(id) {
    return this.get(`/api/products/${id}`);
  },

  // Orders API Calls
  async createOrder(items, shippingAddress, paymentMethod) {
    return this.post('/api/orders', { items, shippingAddress, paymentMethod });
  },

  async getMyOrders() {
    return this.get('/api/orders/my-orders');
  },

  // Users API Calls
  async updateProfile(fullName, email, phone, profilePicture) {
    return this.put('/api/users/profile', { fullName, email, phone, profilePicture });
  },

  async getAddresses() {
    return this.get('/api/users/addresses');
  },

  async addAddress(address) {
    return this.post('/api/users/addresses', address);
  },

  async updateAddress(addressId, address) {
    return this.put(`/api/users/addresses/${addressId}`, address);
  },

  async deleteAddress(addressId) {
    return this.delete(`/api/users/addresses/${addressId}`);
  },

  async setDefaultAddress(addressId) {
    return this.post(`/api/users/addresses/${addressId}/default`);
  },

  async changePassword(currentPassword, newPassword) {
    return this.post('/api/users/security/change-password', { currentPassword, newPassword });
  },

  async updatePreferences(orderUpdates, promotions) {
    return this.put('/api/users/preferences', { orderUpdates, promotions });
  },

  // Admin API Calls
  async adminGetAnalytics() {
    return this.get('/api/admin/analytics');
  },

  async adminCreateProduct(productData) {
    return this.post('/api/products', productData);
  },

  async adminUpdateProduct(id, productData) {
    return this.put(`/api/products/${id}`, productData);
  },

  async adminDeleteProduct(id) {
    return this.delete(`/api/products/${id}`);
  },

  async adminGetOrders() {
    return this.get('/api/orders');
  },

  async adminUpdateOrderStatus(id, status) {
    return this.put(`/api/orders/${id}/status`, { status });
  },

  async adminGetUsers() {
    return this.get('/api/users');
  },

  // Base fetch wrappers
  async get(url) {
    try {
      const response = await fetch(url);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }
      return data;
    } catch (error) {
      console.error(`GET request failed for: ${url}`, error);
      throw error;
    }
  },

  async post(url, body = {}) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }
      return data;
    } catch (error) {
      console.error(`POST request failed for: ${url}`, error);
      throw error;
    }
  },

  async put(url, body = {}) {
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }
      return data;
    } catch (error) {
      console.error(`PUT request failed for: ${url}`, error);
      throw error;
    }
  },

  async delete(url) {
    try {
      const response = await fetch(url, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }
      return data;
    } catch (error) {
      console.error(`DELETE request failed for: ${url}`, error);
      throw error;
    }
  }
};
