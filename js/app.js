/**
 * SHREE MANGLAM — CUSTOMER STOREFRONT APPLICATION CONTROLLER
 * Handles catalogue rendering, interactive filtering, multi-image product modal,
 * lookbook lightboxes, and WhatsApp enquiry automation.
 */

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

const App = {
  activeCategory: 'All',
  activeFabric: 'All',
  activeOccasion: 'All',
  activeSort: 'featured',
  searchQuery: '',
  selectedFestivalId: null,
  currentModalProduct: null,
  activeModalImageIndex: 0,

  init() {
    this.bindHeader();
    this.renderCategoryCounts();
    this.initFestivalPortal();
    this.renderCatalogue();
    this.renderLookbook();
    this.bindFilters();
    this.bindModals();
    this.bindFloatingConcierge();
    this.handleInitialHash();
    this.initScrollReveal();

    // Initialize Firebase and refresh data from Firestore
    if (typeof FirebaseService !== 'undefined') {
      FirebaseService.init().then(async (ok) => {
        if (ok) {
          const products = await Store.loadProducts();
          if (products && products.length > 0) {
            this.renderCategoryCounts();
            this.renderCatalogue();
          }
          const gallery = await Store.loadGallery();
          if (gallery && gallery.length > 0) {
            this.renderLookbook();
          }
        }
      });
    }
  },

  // 1. Header & Mobile Menu
  bindHeader() {
    const header = document.querySelector('.site-header');
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        header?.classList.add('scrolled');
      } else {
        header?.classList.remove('scrolled');
      }
    });

    const mobileToggle = document.getElementById('mobileMenuToggle');
    const mobileDrawer = document.getElementById('mobileDrawer');
    const mobileDrawerClose = document.getElementById('mobileDrawerClose');

    const openDrawer = () => {
      mobileDrawer?.classList.add('open');
      mobileDrawer?.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    };

    const closeDrawer = () => {
      mobileDrawer?.classList.remove('open');
      mobileDrawer?.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    };

    mobileToggle?.addEventListener('click', openDrawer);
    mobileDrawerClose?.addEventListener('click', closeDrawer);

    // Close when tapping outside panel on backdrop
    mobileDrawer?.addEventListener('click', (e) => {
      if (e.target === mobileDrawer) {
        closeDrawer();
      }
    });

    // Close mobile drawer on link click
    document.querySelectorAll('.mobile-nav-link').forEach(link => {
      link.addEventListener('click', closeDrawer);
    });
  },

  // 2. Category Counts
  renderCategoryCounts() {
    const products = Store.getProducts().filter(p => p.status === 'published');
    const sareesCount = products.filter(p => p.category === 'Sarees').length;
    const poshakCount = products.filter(p => p.category === 'Poshak').length;
    const suitsCount = products.filter(p => p.category === 'Suits').length;

    const sareeBadge = document.getElementById('sareesCountBadge');
    const poshakBadge = document.getElementById('poshakCountBadge');
    const suitsBadge = document.getElementById('suitsCountBadge');

    if (sareeBadge) sareeBadge.textContent = `${sareesCount} Masterpieces`;
    if (poshakBadge) poshakBadge.textContent = `${poshakCount} Royal Designs`;
    if (suitsBadge) suitsBadge.textContent = `${suitsCount} Handcrafted Sets`;
  },

  // 2b. Festive Portal & Seasonal Calendar Engine
  initFestivalPortal() {
    if (typeof FestivalEngine === 'undefined') return;

    const activeFest = FestivalEngine.getActiveFestival();
    this.selectedFestivalId = activeFest.id;

    // Update announcement bar with active festival greeting
    const announcement = document.querySelector('.announcement-bar');
    if (announcement) {
      announcement.innerHTML = `<span>${activeFest.greeting} • <a href="#festivePortal" class="gold-accent" style="text-decoration: underline; font-weight: 600;">Explore Festive Curation</a> • Direct WhatsApp Concierge</span>`;
    }

    this.renderFestivalBanner(activeFest);
    this.renderFestivalPills(activeFest.id);

    // Bind Explore Festive Curation CTA button
    const exploreBtn = document.getElementById('festiveExploreBtn');
    if (exploreBtn) {
      exploreBtn.addEventListener('click', () => {
        this.setCategory('Festive');
        const catSection = document.getElementById('catalogue');
        catSection?.scrollIntoView({ behavior: 'smooth' });
      });
    }
  },

  renderFestivalBanner(fest) {
    if (!fest) return;
    const titleEl = document.getElementById('festiveTitle');
    const taglineEl = document.getElementById('festiveTagline');
    const iconEl = document.getElementById('festiveIconBadge');
    const datesEl = document.getElementById('festiveDatesRange');
    const stylingTextEl = document.getElementById('festiveStylingText');
    const statusTextEl = document.getElementById('festiveStatusText');
    const festPill = document.getElementById('festiveCataloguePill');

    const statusObj = FestivalEngine.getStatusLabel(fest);

    if (titleEl) titleEl.textContent = fest.name;
    if (taglineEl) taglineEl.textContent = fest.tagline;
    if (iconEl) iconEl.textContent = fest.icon;
    if (datesEl) {
      const startFmt = new Date(fest.startDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
      const endFmt = new Date(fest.endDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
      datesEl.textContent = `${startFmt} – ${endFmt}`;
    }
    if (stylingTextEl) stylingTextEl.textContent = fest.stylingNote;
    if (statusTextEl) statusTextEl.textContent = statusObj.text;
    if (festPill) festPill.textContent = `${fest.icon} ${fest.shortName} Spotlight`;
  },

  renderFestivalPills(activeId) {
    const scrollContainer = document.getElementById('festivePillsScroll');
    if (!scrollContainer) return;

    const festivals = FestivalEngine.getAllFestivals();
    const realActive = FestivalEngine.getActiveFestival();

    scrollContainer.innerHTML = festivals.map(f => {
      const isSelected = f.id === activeId;
      const isLiveNow = f.id === realActive.id;
      const liveClass = isLiveNow ? 'current-indicator' : '';
      const activeClass = isSelected ? 'active' : '';

      return `
        <button class="festive-pill-btn ${activeClass} ${liveClass}" data-fest-id="${f.id}" title="${f.name}">
          <span>${f.icon}</span>
          <span>${f.shortName}</span>
        </button>
      `;
    }).join('');

    // Bind clicks on festival timeline pills
    scrollContainer.querySelectorAll('.festive-pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.festId;
        const fest = FestivalEngine.getFestivalById(id);
        this.selectedFestivalId = id;
        this.renderFestivalBanner(fest);

        scrollContainer.querySelectorAll('.festive-pill-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Automatically switch catalogue to this festival's curated collection
        this.setCategory('Festive');
        const catSection = document.getElementById('catalogue');
        catSection?.scrollIntoView({ behavior: 'smooth' });
      });
    });
  },

  // 3. Catalogue Rendering & Filtering
  renderCatalogue() {
    const container = document.getElementById('productGridContainer');
    const countDisplay = document.getElementById('productCountDisplay');
    if (!container) return;

    let products = Store.getProducts().filter(p => p.status === 'published');
    const currentFest = (typeof FestivalEngine !== 'undefined') ? FestivalEngine.getFestivalById(this.selectedFestivalId) : null;

    // Filter by Category or Festive Curation
    if (this.activeCategory === 'Festive') {
      if (currentFest) {
        products = FestivalEngine.getSuggestedProducts(currentFest, products);
        // Retain matching festival items
        products = products.filter(p =>
          currentFest.suggestedCategories.includes(p.category) ||
          (p.occasion && currentFest.recommendedOccasions.some(occ => p.occasion.toLowerCase().includes(occ.toLowerCase()))) ||
          (p.fabric && currentFest.recommendedFabrics.some(fab => p.fabric.toLowerCase().includes(fab.toLowerCase()))) ||
          (currentFest.keywords && currentFest.keywords.some(kw => (p.name + ' ' + p.description).toLowerCase().includes(kw)))
        );
      }
    } else if (this.activeCategory !== 'All') {
      products = products.filter(p => p.category === this.activeCategory);
    }

    // Filter by Fabric
    if (this.activeFabric !== 'All') {
      products = products.filter(p => p.fabric && p.fabric.toLowerCase().includes(this.activeFabric.toLowerCase()));
    }

    // Filter by Occasion
    if (this.activeOccasion !== 'All') {
      products = products.filter(p => p.occasion && p.occasion.toLowerCase().includes(this.activeOccasion.toLowerCase()));
    }

    // Filter by Search
    if (this.searchQuery.trim() !== '') {
      const q = this.searchQuery.toLowerCase().trim();
      products = products.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.fabric && p.fabric.toLowerCase().includes(q)) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // Sort Products (only if not already sorted by festive relevance, or respect explicit sort)
    if (this.activeSort === 'price-low') {
      products.sort((a, b) => a.pricePaise - b.pricePaise);
    } else if (this.activeSort === 'price-high') {
      products.sort((a, b) => b.pricePaise - a.pricePaise);
    } else if (this.activeSort === 'newest') {
      products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (this.activeCategory !== 'Festive') {
      // Featured first
      products.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    // Update count display
    if (countDisplay) {
      if (this.activeCategory === 'Festive') {
        countDisplay.textContent = `Showing ${products.length} festive ${products.length === 1 ? 'curation' : 'curations'} for ${currentFest ? currentFest.shortName : 'Celebrations'}`;
      } else {
        countDisplay.textContent = `Showing ${products.length} exclusive ${products.length === 1 ? 'creation' : 'creations'}`;
      }
    }

    if (products.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: #fff; border: 1px dashed var(--color-gold); border-radius: var(--radius-sm);">
          <div style="font-size: 2.2rem; margin-bottom: 12px; color: var(--color-gold);">⚜️</div>
          <h3 style="font-family: var(--font-serif-royal); font-size: 1.4rem; color: var(--color-crimson); margin-bottom: 8px;">No Pieces Found</h3>
          <p style="color: var(--color-text-muted); font-size: 0.95rem; max-width: 420px; margin: 0 auto 20px;">
            We could not find any creations matching your selected filters. Try choosing a different category or clearing the search query.
          </p>
          <button id="resetFiltersBtn" class="btn-luxury-primary" style="padding: 10px 24px; font-size: 0.78rem;">Reset All Filters</button>
        </div>
      `;
      document.getElementById('resetFiltersBtn')?.addEventListener('click', () => {
        this.resetFilters();
      });
      return;
    }

    container.innerHTML = products.map((product, idx) => this.createProductCardHtml(product, idx)).join('');

    // Bind card action buttons
    container.querySelectorAll('.product-card').forEach(card => {
      const id = card.dataset.id;
      const product = products.find(p => p.id === id);

      card.querySelector('.product-media-click')?.addEventListener('click', () => {
        this.openProductModal(product);
      });
      card.querySelector('.product-title-click')?.addEventListener('click', () => {
        this.openProductModal(product);
      });
      card.querySelector('.quick-view-trigger')?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openProductModal(product);
      });
      card.querySelector('.btn-wa-card')?.addEventListener('click', (e) => {
        e.stopPropagation();
        const waUrl = Store.buildWhatsAppUrl(product);
        window.open(waUrl, '_blank', 'noopener,noreferrer');
      });
    });
  },

  createProductCardHtml(p, idx = 0) {
    const formattedPrice = Store.formatRupees(p.pricePaise);
    const comparePrice = p.compareAtPricePaise ? Store.formatRupees(p.compareAtPricePaise) : null;
    const coverImage = (p.images && p.images[p.coverIndex || 0]) || 'assets/category-sarees.jpg';
    
    // Status Badge
    let badgeHtml = '';
    if (p.featured) {
      badgeHtml = `<span class="product-card-badge badge-featured">Featured Piece</span>`;
    } else if (p.availability === 'Made to Order') {
      badgeHtml = `<span class="product-card-badge badge-made-to-order">Made to Order</span>`;
    } else {
      badgeHtml = `<span class="product-card-badge badge-available">In Boutique</span>`;
    }

    // Dynamic Festive Badge according to active/selected festival
    let festiveBadgeHtml = '';
    const currentFest = (typeof FestivalEngine !== 'undefined') ? FestivalEngine.getFestivalById(this.selectedFestivalId) : null;
    if (currentFest) {
      const matchesCategory = currentFest.suggestedCategories.includes(p.category);
      const matchesOccasion = p.occasion && currentFest.recommendedOccasions.some(occ => p.occasion.toLowerCase().includes(occ.toLowerCase()));
      const matchesFabric = p.fabric && currentFest.recommendedFabrics.some(fab => p.fabric.toLowerCase().includes(fab.toLowerCase()));
      const matchesKeyword = currentFest.keywords && currentFest.keywords.some(kw => (p.name + ' ' + p.description).toLowerCase().includes(kw));

      if (matchesCategory && (matchesOccasion || matchesFabric || matchesKeyword || this.activeCategory === 'Festive')) {
        festiveBadgeHtml = `<span class="festive-product-badge">${currentFest.icon} ${currentFest.badgeText}</span>`;
      }
    }

    return `
      <article class="product-card" data-id="${p.id}" id="card-${p.slug}" style="--card-idx: ${idx};">
        <div class="product-card-media product-media-click">
          ${badgeHtml}
          ${festiveBadgeHtml}
          <img src="${coverImage}" alt="${p.name}" class="product-card-img" loading="lazy" />
          <button class="product-quick-view-btn quick-view-trigger" aria-label="Quick inspect ${p.name}">
            <span>Inspect Details</span>
          </button>
        </div>
        <div class="product-card-body">
          <span class="product-category-tag">${p.category}</span>
          <h3 class="product-title product-title-click">${p.name}</h3>
          <div class="product-attributes-row">
            <span>${p.fabric || 'Pure Silk'}</span>
            <span>•</span>
            <span>${p.sku}</span>
          </div>
          <div class="product-pricing-row">
            <span class="product-price">${formattedPrice}</span>
            ${comparePrice ? `<span class="product-compare-price">${comparePrice}</span>` : ''}
          </div>
          <div class="product-card-actions">
            <button class="btn-enquire-card btn-wa-card" aria-label="Enquire on WhatsApp for ${p.name}">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
              <span>Enquire on WhatsApp</span>
            </button>
          </div>
        </div>
      </article>
    `;
  },

  // 4. Filters & Search Handlers
  bindFilters() {
    // Category pills
    document.querySelectorAll('.cat-filter-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.cat-filter-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.activeCategory = pill.dataset.category;
        this.renderCatalogue();
      });
    });

    // Fabric Filter
    const fabricSelect = document.getElementById('fabricFilterSelect');
    if (fabricSelect) {
      fabricSelect.addEventListener('change', (e) => {
        this.activeFabric = e.target.value;
        this.renderCatalogue();
      });
    }

    // Occasion Filter
    const occasionSelect = document.getElementById('occasionFilterSelect');
    if (occasionSelect) {
      occasionSelect.addEventListener('change', (e) => {
        this.activeOccasion = e.target.value;
        this.renderCatalogue();
      });
    }

    // Sort Select
    const sortSelect = document.getElementById('catalogueSortSelect');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.activeSort = e.target.value;
        this.renderCatalogue();
      });
    }

    // Live Search
    const searchInput = document.getElementById('catalogueSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.renderCatalogue();
      });
    }

    // Category Card Direct Click
    document.querySelectorAll('.category-card').forEach(card => {
      card.addEventListener('click', () => {
        const cat = card.dataset.category;
        if (cat) {
          this.setCategory(cat);
          const catSection = document.getElementById('catalogue');
          catSection?.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  },

  setCategory(cat) {
    this.activeCategory = cat;
    document.querySelectorAll('.cat-filter-pill').forEach(pill => {
      if (pill.dataset.category === cat) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });

    const container = document.getElementById('productGridContainer');
    if (container) {
      container.classList.add('grid-transitioning');
      setTimeout(() => {
        this.renderCatalogue();
        container.classList.remove('grid-transitioning');
      }, 120);
    } else {
      this.renderCatalogue();
    }
  },

  resetFilters() {
    this.activeCategory = 'All';
    this.activeFabric = 'All';
    this.activeOccasion = 'All';
    this.activeSort = 'featured';
    this.searchQuery = '';

    const searchInput = document.getElementById('catalogueSearchInput');
    if (searchInput) searchInput.value = '';

    const fabricSelect = document.getElementById('fabricFilterSelect');
    if (fabricSelect) fabricSelect.value = 'All';

    const occasionSelect = document.getElementById('occasionFilterSelect');
    if (occasionSelect) occasionSelect.value = 'All';

    const sortSelect = document.getElementById('catalogueSortSelect');
    if (sortSelect) sortSelect.value = 'featured';

    document.querySelectorAll('.cat-filter-pill').forEach(p => {
      if (p.dataset.category === 'All') p.classList.add('active');
      else p.classList.remove('active');
    });

    this.renderCatalogue();
  },

  // 5. Product Detail Lightbox Modal
  bindModals() {
    const modal = document.getElementById('productDetailModal');
    const closeBtn = document.getElementById('productModalCloseBtn');

    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => {
        this.closeProductModal();
      });
    }

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.closeProductModal();
        }
      });
    }

    // Keyboard events
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeProductModal();
        this.closeLookbookModal();
      }
    });
  },

  openProductModal(product) {
    if (!product) return;
    this.currentModalProduct = product;
    this.activeModalImageIndex = product.coverIndex || 0;

    const modal = document.getElementById('productDetailModal');
    if (!modal) return;

    // Fill Title & Category
    document.getElementById('modalProductCategory').textContent = product.category;
    document.getElementById('modalProductTitle').textContent = product.name;
    document.getElementById('modalProductSku').textContent = product.sku;

    // Fill Prices
    document.getElementById('modalProductPrice').textContent = Store.formatRupees(product.pricePaise);
    const compareElem = document.getElementById('modalProductComparePrice');
    if (product.compareAtPricePaise) {
      compareElem.textContent = Store.formatRupees(product.compareAtPricePaise);
      compareElem.style.display = 'inline';
    } else {
      compareElem.style.display = 'none';
    }

    // Fill Specs
    document.getElementById('modalProductFabric').textContent = product.fabric || 'Pure Silk';
    document.getElementById('modalProductColour').textContent = product.colour || 'Crimson & Gold';
    document.getElementById('modalProductOccasion').textContent = product.occasion || 'Bridal & Festive';
    document.getElementById('modalProductAvailability').textContent = product.availability || 'Available';
    document.getElementById('modalProductDescription').textContent = product.description || 'Heirloom couture creation hand-embroidered by Shree Manglam master artisans.';

    // Setup Gallery & Thumbnails
    const images = Array.isArray(product.images) && product.images.length > 0 ? product.images : ['assets/category-sarees.jpg'];
    this.updateModalMainImage(images[this.activeModalImageIndex] || images[0]);

    const thumbContainer = document.getElementById('modalThumbnailsStrip');
    if (thumbContainer) {
      thumbContainer.innerHTML = images.map((img, idx) => `
        <div class="gallery-thumb-item ${idx === this.activeModalImageIndex ? 'active' : ''}" data-index="${idx}">
          <img src="${img}" alt="Angle ${idx + 1}" class="gallery-thumb-img" />
        </div>
      `).join('');

      thumbContainer.querySelectorAll('.gallery-thumb-item').forEach(item => {
        item.addEventListener('click', () => {
          const idx = parseInt(item.dataset.index);
          this.activeModalImageIndex = idx;
          this.updateModalMainImage(images[idx]);
          thumbContainer.querySelectorAll('.gallery-thumb-item').forEach(t => t.classList.remove('active'));
          item.classList.add('active');
        });
      });
    }

    // Bind WhatsApp CTA
    const waBtn = document.getElementById('modalWhatsAppBtn');
    if (waBtn) {
      waBtn.onclick = () => {
        const url = Store.buildWhatsAppUrl(product);
        window.open(url, '_blank', 'noopener,noreferrer');
      };
    }

    // Update Browser URL Hash
    history.replaceState(null, '', '#product-' + product.slug);

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  },

  updateModalMainImage(url) {
    const mainImg = document.getElementById('modalMainGalleryImg');
    if (!mainImg) return;
    if (mainImg.src === url) return;

    mainImg.classList.add('crossfade-out');
    setTimeout(() => {
      mainImg.src = url;
      mainImg.classList.remove('crossfade-out');
    }, 140);
  },

  closeProductModal() {
    const modal = document.getElementById('productDetailModal');
    if (modal) {
      modal.classList.remove('open');
      document.body.style.overflow = '';
      if (window.location.hash.startsWith('#product-')) {
        history.replaceState(null, '', window.location.pathname);
      }
    }
    this.currentModalProduct = null;
  },

  // 6. Lookbook & Editorial Gallery
  renderLookbook() {
    const container = document.getElementById('lookbookGridContainer');
    if (!container) return;

    const gallery = Store.getGallery();
    container.innerHTML = gallery.map((item, idx) => `
      <div class="gallery-grid-item" data-id="${item.id}" style="animation: smCardEntrance 0.55s var(--ease-luxury) backwards; animation-delay: ${idx * 0.05}s;">
        <img src="${item.imageUrl}" alt="${item.title}" class="gallery-grid-img" loading="lazy" />
        <div class="gallery-grid-overlay">
          <span class="gallery-item-tag">${item.tag}</span>
          <h4 class="gallery-item-title">${item.title}</h4>
          ${item.reelUrl ? `
            <a href="${item.reelUrl}" target="_blank" rel="noopener noreferrer" style="color: var(--color-gold-light); font-size: 0.75rem; margin-top: 6px; display: inline-flex; align-items: center; gap: 6px;">
              <span>Watch Reel on Instagram</span> →
            </a>
          ` : ''}
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.gallery-grid-item').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.id;
        const item = gallery.find(g => g.id === id);
        if (item) this.openLookbookLightbox(item);
      });
    });
  },

  openLookbookLightbox(item) {
    const modal = document.getElementById('lookbookLightboxModal');
    if (!modal) return;

    const img = document.getElementById('lookbookLightboxImg');
    const title = document.getElementById('lookbookLightboxTitle');
    const tag = document.getElementById('lookbookLightboxTag');
    const instaLink = document.getElementById('lookbookLightboxInstaLink');

    if (img) img.src = item.imageUrl;
    if (title) title.textContent = item.title;
    if (tag) tag.textContent = item.tag;

    if (instaLink) {
      if (item.reelUrl) {
        instaLink.href = item.reelUrl;
        instaLink.style.display = 'inline-flex';
      } else {
        instaLink.style.display = 'none';
      }
    }

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  },

  closeLookbookModal() {
    const modal = document.getElementById('lookbookLightboxModal');
    if (modal) {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }
  },

  // 7. Floating Concierge Button
  bindFloatingConcierge() {
    const waBtn = document.getElementById('floatingWhatsAppBtn');
    if (waBtn) {
      waBtn.addEventListener('click', () => {
        const url = Store.buildWhatsAppUrl(null);
        window.open(url, '_blank', 'noopener,noreferrer');
      });
    }

    // Lookbook lightbox close
    const lbClose = document.getElementById('lookbookCloseBtn');
    if (lbClose) {
      lbClose.addEventListener('click', () => this.closeLookbookModal());
    }
  },

  // 8. Hash routing (e.g. direct product links: #product-slug)
  handleInitialHash() {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#product-')) {
      const slug = hash.replace('#product-', '');
      const product = Store.getProductBySlug(slug);
      if (product) {
        setTimeout(() => this.openProductModal(product), 300);
      }
    }
  },

  // 9. High-performance Scroll Reveal Observer
  initScrollReveal() {
    const targets = document.querySelectorAll('.reveal-on-scroll, .royal-divider');
    if (!targets || targets.length === 0) return;

    if (!('IntersectionObserver' in window)) {
      targets.forEach(el => el.classList.add('is-revealed'));
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          obs.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.08
    });

    targets.forEach(el => observer.observe(el));
  }
};
