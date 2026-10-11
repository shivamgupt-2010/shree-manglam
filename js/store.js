/**
 * SHREE MANGLAM — STORE & STATE MANAGEMENT LAYER
 * Handles LocalStorage persistence, CRUD operations, price formatting,
 * and SHIV Database (BaaS) integration.
 */

const STORAGE_KEYS = {
  PRODUCTS: 'shree_manglam_products_v1',
  GALLERY: 'shree_manglam_gallery_v1',
  SETTINGS: 'shree_manglam_settings_v1',
  ADMIN_AUTH: 'shree_manglam_admin_session',
  SHIV_DB_CONFIG: 'shree_manglam_shiv_db_config'
};

const Store = {
  // --- Price Formatting Utilities ---
  formatRupees(paise) {
    if (typeof paise !== 'number' || isNaN(paise)) return '₹0';
    const rupees = Math.round(paise / 100);
    return '₹' + rupees.toLocaleString('en-IN');
  },

  paiseToRupees(paise) {
    if (typeof paise !== 'number') return 0;
    return Math.round(paise / 100);
  },

  rupeesToPaise(rupees) {
    const val = parseFloat(rupees);
    return isNaN(val) ? 0 : Math.round(val * 100);
  },

  // --- Product Management (CRUD) ---
  getProducts() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Error reading from localStorage, using fallback', e);
    }
    // Seed initial products
    this.saveProducts(INITIAL_PRODUCTS);
    return INITIAL_PRODUCTS;
  },

  saveProducts(products) {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.error('Error saving products to localStorage', e);
    }
  },

  getProductById(id) {
    const products = this.getProducts();
    return products.find(p => p.id === id) || null;
  },

  getProductBySlug(slug) {
    const products = this.getProducts();
    return products.find(p => p.slug === slug) || null;
  },

  addProduct(newProduct) {
    const products = this.getProducts();
    const id = 'sm-prod-' + Date.now();
    const slug = newProduct.slug || this.slugify(newProduct.name) + '-' + Math.floor(Math.random() * 1000);
    
    const product = {
      id,
      slug,
      name: newProduct.name || 'Untitled Couture Piece',
      category: newProduct.category || 'Sarees',
      pricePaise: parseInt(newProduct.pricePaise) || 0,
      compareAtPricePaise: newProduct.compareAtPricePaise ? parseInt(newProduct.compareAtPricePaise) : null,
      availability: newProduct.availability || 'Available',
      featured: Boolean(newProduct.featured),
      status: newProduct.status || 'published',
      sku: newProduct.sku || 'SM-' + Math.floor(1000 + Math.random() * 9000),
      fabric: newProduct.fabric || 'Pure Silk',
      colour: newProduct.colour || 'Crimson & Gold',
      occasion: newProduct.occasion || 'Bridal & Festive',
      description: newProduct.description || '',
      images: Array.isArray(newProduct.images) && newProduct.images.length > 0 ? newProduct.images : ['assets/category-sarees.jpg'],
      coverIndex: parseInt(newProduct.coverIndex) || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    products.unshift(product);
    this.saveProducts(products);

    // Asynchronously sync to SHIV Database if connected
    this.shivDb.syncRecord(product).catch(() => {});

    return product;
  },

  updateProduct(id, updates) {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return null;

    products[index] = {
      ...products[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.saveProducts(products);

    // Asynchronously sync update to SHIV Database
    this.shivDb.syncRecord(products[index]).catch(() => {});

    return products[index];
  },

  deleteProduct(id) {
    let products = this.getProducts();
    const filtered = products.filter(p => p.id !== id);
    this.saveProducts(filtered);

    // Asynchronously delete from SHIV Database
    this.shivDb.deleteRecord(id).catch(() => {});

    return filtered.length !== products.length;
  },

  // --- Gallery Management ---
  getGallery() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GALLERY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Error reading gallery', e);
    }
    this.saveGallery(INITIAL_GALLERY);
    return INITIAL_GALLERY;
  },

  saveGallery(items) {
    try {
      localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(items));
    } catch (e) {
      console.error('Error saving gallery', e);
    }
  },

  addGalleryItem(item) {
    const gallery = this.getGallery();
    const newItem = {
      id: 'sm-gal-' + Date.now(),
      title: item.title || 'Editorial Lookbook',
      tag: item.tag || 'Haute Couture',
      imageUrl: item.imageUrl || 'assets/hero-banner.jpg',
      reelUrl: item.reelUrl || '',
      type: item.type || 'LOOKBOOK'
    };
    gallery.unshift(newItem);
    this.saveGallery(gallery);
    return newItem;
  },

  deleteGalleryItem(id) {
    const gallery = this.getGallery();
    const filtered = gallery.filter(g => g.id !== id);
    this.saveGallery(filtered);
    return filtered.length !== gallery.length;
  },

  // --- Brand Settings ---
  getSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Error reading settings', e);
    }
    return BRAND_SETTINGS;
  },

  saveSettings(settings) {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Error saving settings', e);
    }
  },

  // --- WhatsApp URL Builder ---
  buildWhatsAppUrl(product, customMessage = '') {
    const settings = this.getSettings();
    const phone = settings.whatsappNumber.replace(/[^0-9]/g, '');
    
    let text = '';
    if (product) {
      const formattedPrice = this.formatRupees(product.pricePaise);
      const url = window.location.origin + window.location.pathname + '#product-' + product.slug;
      text = `Namaste Shree Manglam,\n\nI would like to enquire about:\n*${product.name}*\nCategory: ${product.category}\nSKU: ${product.sku}\nPrice: ${formattedPrice}\nAvailability: ${product.availability}\n\nLink: ${url}\n\nPlease share further details regarding customisation, fabric & delivery timelines.`;
    } else {
      text = customMessage || `Namaste Shree Manglam, I would like to schedule a bespoke bridal couture consultation.`;
    }

    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  },

  // =========================================================================
  // SHIV DATABASE (BaaS) CONNECTOR
  // Connects directly to SHIV Platform Backend (FastAPI / Render / Local)
  // =========================================================================
  shivDb: {
    getConfig() {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.SHIV_DB_CONFIG);
        if (saved) return JSON.parse(saved);
      } catch (e) {}
      return {
        enabled: true,
        endpoint: 'https://shiv-database.onrender.com',
        localFallback: 'http://localhost:8000',
        projectId: 'shree-manglam',
        apiKey: ''
      };
    },

    saveConfig(cfg) {
      localStorage.setItem(STORAGE_KEYS.SHIV_DB_CONFIG, JSON.stringify(cfg));
    },

    async checkHealth() {
      const cfg = this.getConfig();
      if (!cfg.enabled) return { online: false, reason: 'Disabled' };

      // 1. Try Primary Endpoint
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);
        const res = await fetch(`${cfg.endpoint}/health`, { method: 'GET', signal: controller.signal });
        clearTimeout(timeout);
        if (res.ok) {
          const data = await res.json();
          return { online: true, url: cfg.endpoint, service: data.service || 'SHIV Database' };
        }
      } catch (e) {}

      // 2. Try Localhost fallback
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2000);
        const res = await fetch(`${cfg.localFallback}/health`, { method: 'GET', signal: controller.signal });
        clearTimeout(timeout);
        if (res.ok) {
          const data = await res.json();
          return { online: true, url: cfg.localFallback, service: data.service || 'SHIV Database (Local)' };
        }
      } catch (e) {}

      return { online: false, reason: 'Endpoint unreachable' };
    },

    async syncAllProducts() {
      const health = await this.checkHealth();
      if (!health.online) {
        return { success: false, message: 'SHIV Database is offline or unreachable' };
      }

      const products = Store.getProducts();
      let successCount = 0;
      const cfg = this.getConfig();

      for (const p of products) {
        try {
          const res = await fetch(`${health.url}/data/products`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(cfg.apiKey ? { 'X-API-Key': cfg.apiKey } : {})
            },
            body: JSON.stringify(p)
          });
          if (res.ok) successCount++;
        } catch (e) {}
      }

      return { success: true, count: successCount, total: products.length, endpoint: health.url };
    },

    async syncRecord(product) {
      const cfg = this.getConfig();
      if (!cfg.enabled) return;
      const health = await this.checkHealth();
      if (!health.online) return;

      try {
        await fetch(`${health.url}/data/products`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(cfg.apiKey ? { 'X-API-Key': cfg.apiKey } : {})
          },
          body: JSON.stringify(product)
        });
      } catch (e) {
        console.warn('Background SHIV DB sync failed (handled gracefully)', e);
      }
    },

    async deleteRecord(productId) {
      const cfg = this.getConfig();
      if (!cfg.enabled) return;
      const health = await this.checkHealth();
      if (!health.online) return;

      try {
        await fetch(`${health.url}/data/products/${productId}`, {
          method: 'DELETE',
          headers: {
            ...(cfg.apiKey ? { 'X-API-Key': cfg.apiKey } : {})
          }
        });
      } catch (e) {}
    }
  },

  // --- Backup & Restore ---
  exportBackup() {
    return JSON.stringify({
      version: '1.0',
      exportedAt: new Date().toISOString(),
      products: this.getProducts(),
      gallery: this.getGallery(),
      settings: this.getSettings(),
      shivDbConfig: this.shivDb.getConfig()
    }, null, 2);
  },

  importBackup(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed.products)) this.saveProducts(parsed.products);
      if (Array.isArray(parsed.gallery)) this.saveGallery(parsed.gallery);
      if (parsed.settings) this.saveSettings(parsed.settings);
      if (parsed.shivDbConfig) this.shivDb.saveConfig(parsed.shivDbConfig);
      return true;
    } catch (e) {
      console.error('Failed to import backup', e);
      return false;
    }
  },

  resetDefaults() {
    this.saveProducts(INITIAL_PRODUCTS);
    this.saveGallery(INITIAL_GALLERY);
    this.saveSettings(BRAND_SETTINGS);
  },

  slugify(text) {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[\s\W-]+/g, '-');
  }
};
