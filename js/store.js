/**
 * SHREE MANGLAM — STORE & STATE MANAGEMENT LAYER
 * Firebase Firestore is the PRIMARY storage engine.
 * localStorage acts as an offline fallback cache only.
 */

const STORAGE_KEYS = {
  PRODUCTS: 'shree_manglam_products_v2',
  GALLERY:  'shree_manglam_gallery_v2',
  SETTINGS: 'shree_manglam_settings_v2',
  ADMIN_AUTH: 'shree_manglam_admin_session'
};

// ─── LocalStorage Cache Helpers ───────────────────────────────────────────────
const Cache = {
  get(key) {
    try { const d = localStorage.getItem(key); return d ? JSON.parse(d) : null; }
    catch (e) { return null; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch (e) {}
  },
  del(key) {
    try { localStorage.removeItem(key); } catch (e) {}
  }
};

// ─── Store Object ─────────────────────────────────────────────────────────────
const Store = {

  // ── Formatting Utilities ──────────────────────────────────────────────────
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

  // ── Product Management ────────────────────────────────────────────────────

  /** Load products: try Firebase first, fall back to localStorage cache */
  async loadProducts() {
    if (typeof FirebaseService !== 'undefined' && FirebaseService.isReady) {
      const fbProducts = await FirebaseService.getProducts();
      if (fbProducts && fbProducts.length > 0) {
        Cache.set(STORAGE_KEYS.PRODUCTS, fbProducts);
        return fbProducts;
      }
      // Firebase empty → seed from initial data
      if (fbProducts !== null) {
        await FirebaseService.seedProductsIfEmpty(INITIAL_PRODUCTS);
        Cache.set(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
        return INITIAL_PRODUCTS;
      }
    }
    // Fallback to cache
    const cached = Cache.get(STORAGE_KEYS.PRODUCTS);
    if (cached && cached.length > 0) return cached;
    Cache.set(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    return INITIAL_PRODUCTS;
  },

  /** Synchronous getter — reads from localStorage cache */
  getProducts() {
    const cached = Cache.get(STORAGE_KEYS.PRODUCTS);
    if (cached && cached.length > 0) return cached;
    Cache.set(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    return INITIAL_PRODUCTS;
  },

  saveProducts(products) {
    Cache.set(STORAGE_KEYS.PRODUCTS, products);
  },

  getProductById(id) {
    return this.getProducts().find(p => p.id === id) || null;
  },

  getProductBySlug(slug) {
    return this.getProducts().find(p => p.slug === slug) || null;
  },

  async addProduct(newProduct) {
    const products = this.getProducts();
    const id = 'sm-prod-' + Date.now();
    const slug = newProduct.slug || this.slugify(newProduct.name) + '-' + Math.floor(Math.random() * 1000);

    const product = {
      id,
      slug,
      name:               newProduct.name        || 'Untitled Couture Piece',
      category:           newProduct.category    || 'Sarees',
      pricePaise:         parseInt(newProduct.pricePaise)        || 0,
      compareAtPricePaise: newProduct.compareAtPricePaise ? parseInt(newProduct.compareAtPricePaise) : null,
      availability:       newProduct.availability || 'Available',
      featured:           Boolean(newProduct.featured),
      status:             newProduct.status       || 'published',
      sku:                newProduct.sku          || 'SM-' + Math.floor(1000 + Math.random() * 9000),
      fabric:             newProduct.fabric       || 'Pure Silk',
      colour:             newProduct.colour       || 'Crimson & Gold',
      occasion:           newProduct.occasion     || 'Bridal & Festive',
      description:        newProduct.description  || '',
      images:             Array.isArray(newProduct.images) && newProduct.images.length > 0
                            ? newProduct.images
                            : ['assets/category-sarees.jpg'],
      coverIndex:         parseInt(newProduct.coverIndex) || 0,
      createdAt:          new Date().toISOString(),
      updatedAt:          new Date().toISOString()
    };

    products.unshift(product);
    this.saveProducts(products);

    // Async push to Firebase (non-blocking)
    if (typeof FirebaseService !== 'undefined' && FirebaseService.isReady) {
      FirebaseService.saveProduct(product).catch(() => {});
    }

    return product;
  },

  async updateProduct(id, updates) {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return null;

    products[index] = { ...products[index], ...updates, updatedAt: new Date().toISOString() };
    this.saveProducts(products);

    if (typeof FirebaseService !== 'undefined' && FirebaseService.isReady) {
      FirebaseService.saveProduct(products[index]).catch(() => {});
    }

    return products[index];
  },

  async deleteProduct(id) {
    let products = this.getProducts();
    const filtered = products.filter(p => p.id !== id);
    this.saveProducts(filtered);

    if (typeof FirebaseService !== 'undefined' && FirebaseService.isReady) {
      FirebaseService.deleteProduct(id).catch(() => {});
    }

    return filtered.length !== products.length;
  },

  // ── Gallery Management ────────────────────────────────────────────────────

  async loadGallery() {
    if (typeof FirebaseService !== 'undefined' && FirebaseService.isReady) {
      const fbGallery = await FirebaseService.getGallery();
      if (fbGallery && fbGallery.length > 0) {
        Cache.set(STORAGE_KEYS.GALLERY, fbGallery);
        return fbGallery;
      }
      if (fbGallery !== null) {
        await FirebaseService.seedGalleryIfEmpty(INITIAL_GALLERY);
        Cache.set(STORAGE_KEYS.GALLERY, INITIAL_GALLERY);
        return INITIAL_GALLERY;
      }
    }
    const cached = Cache.get(STORAGE_KEYS.GALLERY);
    if (cached && cached.length > 0) return cached;
    Cache.set(STORAGE_KEYS.GALLERY, INITIAL_GALLERY);
    return INITIAL_GALLERY;
  },

  getGallery() {
    const cached = Cache.get(STORAGE_KEYS.GALLERY);
    if (cached && cached.length > 0) return cached;
    Cache.set(STORAGE_KEYS.GALLERY, INITIAL_GALLERY);
    return INITIAL_GALLERY;
  },

  saveGallery(items) {
    Cache.set(STORAGE_KEYS.GALLERY, items);
  },

  async addGalleryItem(item) {
    const gallery = this.getGallery();
    const newItem = {
      id:       'sm-gal-' + Date.now(),
      title:    item.title    || 'Editorial Lookbook',
      tag:      item.tag      || 'Haute Couture',
      imageUrl: item.imageUrl || 'assets/hero-banner.jpg',
      reelUrl:  item.reelUrl  || '',
      type:     item.type     || 'LOOKBOOK'
    };
    gallery.unshift(newItem);
    this.saveGallery(gallery);

    if (typeof FirebaseService !== 'undefined' && FirebaseService.isReady) {
      FirebaseService.saveGalleryItem(newItem).catch(() => {});
    }
    return newItem;
  },

  async deleteGalleryItem(id) {
    const gallery = this.getGallery();
    const filtered = gallery.filter(g => g.id !== id);
    this.saveGallery(filtered);

    if (typeof FirebaseService !== 'undefined' && FirebaseService.isReady) {
      FirebaseService.deleteGalleryItem(id).catch(() => {});
    }
    return filtered.length !== gallery.length;
  },

  // ── Brand Settings ────────────────────────────────────────────────────────

  async loadSettings() {
    if (typeof FirebaseService !== 'undefined' && FirebaseService.isReady) {
      const fbSettings = await FirebaseService.getSettings();
      if (fbSettings) {
        const merged = { ...BRAND_SETTINGS, ...fbSettings };
        Cache.set(STORAGE_KEYS.SETTINGS, merged);
        return merged;
      }
      // Seed defaults
      FirebaseService.saveSettings(BRAND_SETTINGS).catch(() => {});
    }
    const cached = Cache.get(STORAGE_KEYS.SETTINGS);
    if (cached) {
      // Auto-migrate stale placeholder addresses
      if (cached.address && cached.address.includes('Jaipur')) {
        Cache.set(STORAGE_KEYS.SETTINGS, BRAND_SETTINGS);
        return BRAND_SETTINGS;
      }
      return { ...BRAND_SETTINGS, ...cached };
    }
    return BRAND_SETTINGS;
  },

  getSettings() {
    const cached = Cache.get(STORAGE_KEYS.SETTINGS);
    if (cached) {
      if (cached.address && cached.address.includes('Jaipur')) return BRAND_SETTINGS;
      return { ...BRAND_SETTINGS, ...cached };
    }
    return BRAND_SETTINGS;
  },

  async saveSettings(settings) {
    Cache.set(STORAGE_KEYS.SETTINGS, settings);
    if (typeof FirebaseService !== 'undefined' && FirebaseService.isReady) {
      FirebaseService.saveSettings(settings).catch(() => {});
    }
  },

  // ── Image Processing & Upload (Firebase Storage + Optimized Base64) ──────
  
  /**
   * Compress an image file using an offscreen canvas to optimize size and quality.
   * Returns a lightweight Base64 data URL (typically 40–80KB).
   */
  compressImageFile(file, maxWidth = 1000, quality = 0.80) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.onload = (e) => {
        const img = new Image();
        img.onerror = () => reject(new Error('Failed to parse image'));
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          if (width > maxWidth || height > maxWidth) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxWidth) / height);
              height = maxWidth;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  },

  /** Fallback raw reader */
  readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  /**
   * Upload a product image to Firebase Storage with automatic fallback
   * to a permanent, high-quality compressed Base64 Data URL.
   * NEVER returns a transient blob: URL.
   */
  async uploadProductImage(file, productId, onProgress) {
    // 1. Generate an optimized compressed data URL first
    let dataUrl = null;
    try {
      dataUrl = await this.compressImageFile(file, 1000, 0.80);
    } catch (e) {
      console.warn('[Store] Canvas compression fallback:', e);
      try {
        dataUrl = await this.readFileAsDataUrl(file);
      } catch (e2) {
        console.error('[Store] Could not read file:', e2);
      }
    }

    // 2. Try Firebase Storage upload if available
    if (typeof FirebaseService !== 'undefined' && FirebaseService.isReady) {
      try {
        const safe = (file.name || 'photo').replace(/[^a-zA-Z0-9._-]/g, '_');
        const path = `products/${productId || 'new'}/${Date.now()}_${safe}`;
        const cloudUrl = await FirebaseService.uploadImage(file, path, onProgress);
        if (cloudUrl) return cloudUrl;
      } catch (err) {
        console.warn('[Store] Firebase Storage upload skipped, using optimized image:', err);
      }
    }

    // 3. Return permanent data URL (never a transient blob)
    return dataUrl || 'assets/category-sarees.jpg';
  },

  async uploadGalleryImage(file, onProgress) {
    let dataUrl = null;
    try {
      dataUrl = await this.compressImageFile(file, 1000, 0.80);
    } catch (e) {
      try { dataUrl = await this.readFileAsDataUrl(file); } catch (e2) {}
    }

    if (typeof FirebaseService !== 'undefined' && FirebaseService.isReady) {
      try {
        const safe = (file.name || 'photo').replace(/[^a-zA-Z0-9._-]/g, '_');
        const path = `gallery/${Date.now()}_${safe}`;
        const cloudUrl = await FirebaseService.uploadImage(file, path, onProgress);
        if (cloudUrl) return cloudUrl;
      } catch (err) {
        console.warn('[Store] Gallery upload to storage failed:', err);
      }
    }

    return dataUrl || 'assets/hero-banner.jpg';
  },

  // ── WhatsApp URL Builder ──────────────────────────────────────────────────
  buildWhatsAppUrl(product, customMessage = '') {
    const settings = this.getSettings();
    const phone    = settings.whatsappNumber.replace(/[^0-9]/g, '');
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

  // ── Backup / Restore ──────────────────────────────────────────────────────
  exportBackup() {
    return JSON.stringify({
      version: '2.0',
      exportedAt: new Date().toISOString(),
      products: this.getProducts(),
      gallery:  this.getGallery(),
      settings: this.getSettings()
    }, null, 2);
  },

  importBackup(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed.products)) {
        this.saveProducts(parsed.products);
        if (typeof FirebaseService !== 'undefined' && FirebaseService.isReady) {
          parsed.products.forEach(p => FirebaseService.saveProduct(p).catch(() => {}));
        }
      }
      if (Array.isArray(parsed.gallery)) {
        this.saveGallery(parsed.gallery);
        if (typeof FirebaseService !== 'undefined' && FirebaseService.isReady) {
          parsed.gallery.forEach(g => FirebaseService.saveGalleryItem(g).catch(() => {}));
        }
      }
      if (parsed.settings) {
        this.saveSettings(parsed.settings);
      }
      return true;
    } catch (e) {
      console.error('Failed to import backup', e);
      return false;
    }
  },

  resetDefaults() {
    this.saveProducts(INITIAL_PRODUCTS);
    this.saveGallery(INITIAL_GALLERY);
    Cache.set(STORAGE_KEYS.SETTINGS, BRAND_SETTINGS);
  },

  slugify(text) {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/[\s\W-]+/g, '-');
  }
};
