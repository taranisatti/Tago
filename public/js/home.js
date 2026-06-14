document.addEventListener('DOMContentLoaded', () => {
  const productsGrid = document.getElementById('productsGrid');
  const categoryFilters = document.getElementById('categoryFilters');
  const categoryButtons = categoryFilters.querySelectorAll('.category-btn');

  // Load URL query states on startup
  const urlParams = new URLSearchParams(window.location.search);
  let currentSearch = urlParams.get('search') || '';
  let currentCategory = urlParams.get('category') || 'All';

  // Highlight active category based on URL
  setActiveCategoryButton(currentCategory);

  // Fetch and display
  fetchAndRenderProducts(currentSearch, currentCategory);

  // Set up click handlers on category buttons
  categoryButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const selectedCategory = btn.getAttribute('data-category');
      
      // Update active states
      categoryButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      currentCategory = selectedCategory;
      
      // Clear search query on category switch for cleaner UX
      currentSearch = '';
      const searchInput = document.getElementById('searchInput');
      if (searchInput) searchInput.value = '';

      // Update URL parameters without reloading page
      updateURL(currentSearch, currentCategory);
      
      // Fetch and draw
      fetchAndRenderProducts(currentSearch, currentCategory);
    });
  });

  function renderStars(rating, numReviews, productId) {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);
    
    let starsHtml = `<div class="rating-stars" title="${rating} out of 5">`;
    
    // Draw full stars
    for (let i = 0; i < fullStars; i++) {
      starsHtml += `<svg class="star-icon full" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
    }
    
    // Draw half star
    if (hasHalf) {
      starsHtml += `<svg class="star-icon half" width="14" height="14" viewBox="0 0 24 24" fill="url(#halfGrad-${productId})" stroke="currentColor" stroke-width="2">
        <defs>
          <linearGradient id="halfGrad-${productId}">
            <stop offset="50%" stop-color="currentColor"/>
            <stop offset="50%" stop-color="transparent" stop-opacity="1"/>
          </linearGradient>
        </defs>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
      </svg>`;
    }
    
    // Draw empty stars
    for (let i = 0; i < emptyStars; i++) {
      starsHtml += `<svg class="star-icon empty" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;
    }
    
    starsHtml += ` <span class="review-count">(${numReviews || 0})</span></div>`;
    return starsHtml;
  }

  async function fetchAndRenderProducts(search, category) {
    productsGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
        <p style="color: var(--text-light);">Loading catalog items...</p>
      </div>
    `;

    try {
      const products = await API.getProducts(search, category);
      
      if (!products || products.length === 0) {
        productsGrid.innerHTML = `
          <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--primary-color)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 1rem;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
            <h3 style="margin-bottom: 0.5rem;">No Products Found</h3>
            <p style="color: var(--text-light);">Try adjusting your filters or search terms.</p>
          </div>
        `;
        return;
      }

      productsGrid.innerHTML = '';
      
      products.forEach(product => {
        const ratingVal = product.rating || 4.5;
        const reviewsCount = product.numReviews || 12;
        const starsHtml = renderStars(ratingVal, reviewsCount, product._id);

        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
          <div class="product-image-wrapper">
            <a href="/product.html?id=${product._id}">
              <img src="${product.imageUrl || 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600'}" alt="${product.name}" loading="lazy" class="product-img" onerror="handleImageError(this)">
            </a>
            <button class="add-to-cart-overlay-btn" data-id="${product._id}">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
              Quick Add
            </button>
          </div>
          <div class="product-info">
            <span class="product-category">${product.category}</span>
            <a href="/product.html?id=${product._id}">
              <h3 class="product-title">${product.name}</h3>
            </a>
            ${starsHtml}
            <div class="product-price-row">
              <span class="product-price">${formatPrice(product.price)}</span>
              <a href="/product.html?id=${product._id}" class="btn-view-details-sm" title="View Product Details">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
              </a>
            </div>
          </div>
        `;

        // Hook up Quick Add handler
        const addBtn = card.querySelector('.add-to-cart-overlay-btn');
        addBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          cartUtils.addToCart(product, 1);
        });

        productsGrid.appendChild(card);
      });
    } catch (err) {
      productsGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #ff4d4d;">
          <p>Failed to load products. Ensure MongoDB is running and you have run the seeding script.</p>
        </div>
      `;
    }
  }

  function setActiveCategoryButton(category) {
    categoryButtons.forEach(btn => {
      if (btn.getAttribute('data-category') === category) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  function updateURL(search, category) {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (category && category !== 'All') params.set('category', category);
    
    let newRelativePathQuery = window.location.pathname;
    if (params.toString()) {
      newRelativePathQuery += '?' + params.toString();
    }
    history.pushState(null, '', newRelativePathQuery);
  }
});
