document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('productDetailContainer');
  
  // Parse ID from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  if (!productId) {
    showToast('Invalid Product ID', 'error');
    setTimeout(() => {
      window.location.href = '/index.html';
    }, 1500);
    return;
  }

  function renderStars(rating, numReviews, id) {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);
    
    let starsHtml = `<div class="rating-stars" title="${rating} out of 5">`;
    for (let i = 0; i < fullStars; i++) {
      starsHtml += `<svg class="star-icon full" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
    }
    if (hasHalf) {
      starsHtml += `<svg class="star-icon half" width="16" height="16" viewBox="0 0 24 24" fill="url(#halfGrad-${id})" stroke="currentColor" stroke-width="2">
        <defs>
          <linearGradient id="halfGrad-${id}">
            <stop offset="50%" stop-color="currentColor"/>
            <stop offset="50%" stop-color="transparent" stop-opacity="1"/>
          </linearGradient>
        </defs>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
      </svg>`;
    }
    for (let i = 0; i < emptyStars; i++) {
      starsHtml += `<svg class="star-icon empty" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
    }
    starsHtml += ` <span class="review-count">(${numReviews || 0} customer reviews)</span></div>`;
    return starsHtml;
  }

  async function loadRelatedProducts(category, currentId) {
    const relatedGrid = document.getElementById('relatedProductsGrid');
    const relatedSection = document.getElementById('relatedProductsSection');
    
    try {
      const allProducts = await API.getProducts('', category);
      const filtered = allProducts.filter(p => p._id !== currentId).slice(0, 4);
      
      if (filtered.length === 0) {
        relatedSection.style.display = 'none';
        return;
      }
      
      relatedSection.style.display = 'block';
      relatedGrid.innerHTML = '';
      
      filtered.forEach(p => {
        const ratingVal = p.rating || 4.5;
        const reviewsCount = p.numReviews || 12;
        const starsHtml = renderStars(ratingVal, reviewsCount, p._id);
        
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
          <div class="product-image-wrapper">
            <a href="/product.html?id=${p._id}">
              <img src="${p.imageUrl || 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600'}" alt="${p.name}" loading="lazy" class="product-img" onerror="handleImageError(this)">
            </a>
            <button class="add-to-cart-overlay-btn" data-id="${p._id}">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
              Quick Add
            </button>
          </div>
          <div class="product-info">
            <span class="product-category">${p.category}</span>
            <a href="/product.html?id=${p._id}">
              <h3 class="product-title">${p.name}</h3>
            </a>
            ${starsHtml}
            <div class="product-price-row">
              <span class="product-price">${formatPrice(p.price)}</span>
              <a href="/product.html?id=${p._id}" class="btn-view-details-sm" title="View Product Details">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </a>
            </div>
          </div>
        `;
        
        card.querySelector('.add-to-cart-overlay-btn').addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          cartUtils.addToCart(p, 1);
        });
        
        relatedGrid.appendChild(card);
      });
    } catch (err) {
      console.error('Error loading related products', err);
      relatedSection.style.display = 'none';
    }
  }

  try {
    const product = await API.getProduct(productId);
    
    // Set Page Title dynamically
    document.title = `TAGO | ${product.name}`;

    const ratingVal = product.rating || 4.5;
    const reviewsCount = product.numReviews || 12;
    const starsHtml = renderStars(ratingVal, reviewsCount, product._id);

    // Render Product Details
    container.innerHTML = `
      <div class="product-detail-gallery">
        <img src="${product.imageUrl || 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600'}" alt="${product.name}" class="product-zoom-img" onerror="handleImageError(this)">
      </div>
      <div class="product-detail-info">
        <span class="product-detail-category">${product.category}</span>
        <h1 class="product-detail-title">${product.name}</h1>
        
        <div class="product-detail-rating-row">
          ${starsHtml}
        </div>

        <div class="product-detail-price">${formatPrice(product.price)}</div>
        <p class="product-detail-desc">${product.description}</p>
        
        <div class="product-detail-meta">
          <div class="meta-item">
            Availability: <span class="stock-badge ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}">${product.stock > 0 ? 'In Stock (' + product.stock + ')' : 'Out of Stock'}</span>
          </div>
          <div class="meta-item">
            Category: <span class="meta-category-val">${product.category}</span>
          </div>
        </div>

        ${product.stock > 0 ? `
          <div class="product-action-row">
            <div class="quantity-selector">
              <button class="quantity-btn" id="decQtyBtn" type="button">&minus;</button>
              <div class="quantity-val" id="qtyValue">1</div>
              <button class="quantity-btn" id="incQtyBtn" type="button">&plus;</button>
            </div>
            
            <button class="btn btn-primary" id="addToCartBtn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
              Add to Cart
            </button>
          </div>
        ` : `
          <button class="btn btn-secondary btn-out-of-stock" disabled style="cursor: not-allowed; opacity: 0.6; width: fit-content;">
            Out of Stock
          </button>
        `}
      </div>
    `;

    // Quantity selector logic if in stock
    if (product.stock > 0) {
      const decBtn = document.getElementById('decQtyBtn');
      const incBtn = document.getElementById('incQtyBtn');
      const qtyVal = document.getElementById('qtyValue');
      const addBtn = document.getElementById('addToCartBtn');
      
      let currentQty = 1;

      decBtn.addEventListener('click', () => {
        if (currentQty > 1) {
          currentQty--;
          qtyVal.textContent = currentQty;
        }
      });

      incBtn.addEventListener('click', () => {
        if (currentQty < product.stock) {
          currentQty++;
          qtyVal.textContent = currentQty;
        } else {
          showToast(`Only ${product.stock} items left in stock`, 'error');
        }
      });

      addBtn.addEventListener('click', () => {
        cartUtils.addToCart(product, currentQty);
      });
    }

    // Load related products
    await loadRelatedProducts(product.category, product._id);

  } catch (error) {
    console.error('Error fetching product details:', error);
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem; color: #ff4d4d;">
        <h3>Product Load Failed</h3>
        <p>Could not retrieve this product's details. It may not exist.</p>
        <a href="/index.html" class="btn btn-secondary" style="margin-top: 1.5rem;">Back to Shop</a>
      </div>
    `;
  }
});
