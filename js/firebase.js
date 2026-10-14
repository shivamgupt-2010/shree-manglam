/**
 * SHREE MANGLAM — FIREBASE SERVICE LAYER
 * Firebase Firestore + Storage integration for all persistent data.
 * Project: jeeprep-a5262 (Shree Manglam BaaS)
 *
 * Collections:
 *   - products      → Catalogue items
 *   - gallery       → Lookbook / editorial gallery
 *   - settings      → Brand configuration
 *   - uploads       → Firebase Storage image metadata
 */

// ─── Firebase Config (provided by user) ───────────────────────────────────────
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBFjjxE5fhAgX-bK_-BeFliUO2V0v_5SRQ",
  authDomain: "jeeprep-a5262.firebaseapp.com",
  projectId: "jeeprep-a5262",
  storageBucket: "jeeprep-a5262.firebasestorage.app",
  messagingSenderId: "561222521164",
  appId: "1:561222521164:web:9027539f986036e4e5bfe9",
  measurementId: "G-7TGQC91RHY"
};

// ─── Firebase Namespace (loaded via CDN compat scripts) ───────────────────────
const FirebaseService = {
  _app: null,
  _db: null,
  _storage: null,
  _analytics: null,
  _initialized: false,
  _initPromise: null,

  // ── Initialize Firebase ──────────────────────────────────────────────────────
  async init() {
    if (this._initialized) return true;
    if (this._initPromise) return this._initPromise;

    this._initPromise = new Promise((resolve) => {
      try {
        // Use firebase compat SDK (loaded from CDN in HTML)
        if (typeof firebase === 'undefined') {
          console.warn('[Firebase] SDK not loaded — falling back to localStorage');
          resolve(false);
          return;
        }

        // Initialize app (avoid duplicate init)
        if (!firebase.apps.length) {
          this._app = firebase.initializeApp(FIREBASE_CONFIG);
        } else {
          this._app = firebase.app();
        }

        this._db = firebase.firestore();
        this._storage = firebase.storage();

        // Enable offline persistence (works even on mobile with weak signal)
        this._db.enablePersistence({ synchronizeTabs: true })
          .catch((err) => {
            if (err.code === 'failed-precondition') {
              console.warn('[Firebase] Persistence: multiple tabs open, disabled.');
            } else if (err.code === 'unimplemented') {
              console.warn('[Firebase] Persistence: browser not supported.');
            }
          });

        // Analytics (optional — non-blocking)
        try {
          if (firebase.analytics && typeof firebase.analytics === 'function') {
            this._analytics = firebase.analytics();
          }
        } catch (e) {}

        // Attempt anonymous sign-in if Auth SDK is loaded
        try {
          if (firebase.auth && typeof firebase.auth === 'function') {
            firebase.auth().signInAnonymously().catch((authErr) => {
              console.log('[Firebase Auth] Anonymous sign-in info:', authErr.message);
            });
          }
        } catch (e) {}

        this._initialized = true;
        console.log('[Firebase] ✅ Connected to jeeprep-a5262 (Shree Manglam)');
        resolve(true);
      } catch (err) {
        console.error('[Firebase] Initialization error:', err);
        resolve(false);
      }
    });

    return this._initPromise;
  },

  get db() { return this._db; },
  get storage() { return this._storage; },
  get isReady() { return this._initialized && !!this._db; },

  // ─── PRODUCTS ──────────────────────────────────────────────────────────────

  /** Fetch all products from Firestore, ordered by createdAt desc */
  async getProducts() {
    if (!this.isReady) return null;
    try {
      const snap = await this._db
        .collection('products')
        .orderBy('createdAt', 'desc')
        .get();
      if (snap.empty) return [];
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.warn('[Firebase] getProducts error:', e);
      return null;
    }
  },

  /** Real-time products listener (calls callback on every update) */
  listenProducts(callback) {
    if (!this.isReady) return () => {};
    return this._db
      .collection('products')
      .orderBy('createdAt', 'desc')
      .onSnapshot(snap => {
        const products = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        callback(products);
      }, err => {
        console.warn('[Firebase] listenProducts error:', err);
      });
  },

  /** Add or update a product in Firestore */
  async saveProduct(product) {
    if (!this.isReady) return false;
    try {
      const { id, ...data } = product;
      await this._db.collection('products').doc(id).set({
        ...data,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      return true;
    } catch (e) {
      console.warn('[Firebase] saveProduct error:', e);
      return false;
    }
  },

  /** Delete a product document from Firestore */
  async deleteProduct(productId) {
    if (!this.isReady) return false;
    try {
      await this._db.collection('products').doc(productId).delete();
      return true;
    } catch (e) {
      console.warn('[Firebase] deleteProduct error:', e);
      return false;
    }
  },

  /** Bulk seed products (only if collection is empty) */
  async seedProductsIfEmpty(products) {
    if (!this.isReady) return false;
    try {
      const snap = await this._db.collection('products').limit(1).get();
      if (!snap.empty) return false; // Already has data

      const batch = this._db.batch();
      products.forEach(p => {
        const ref = this._db.collection('products').doc(p.id);
        batch.set(ref, {
          ...p,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      });
      await batch.commit();
      console.log(`[Firebase] Seeded ${products.length} products.`);
      return true;
    } catch (e) {
      console.warn('[Firebase] seedProducts error:', e);
      return false;
    }
  },

  // ─── GALLERY ───────────────────────────────────────────────────────────────

  async getGallery() {
    if (!this.isReady) return null;
    try {
      const snap = await this._db.collection('gallery').orderBy('createdAt', 'desc').get();
      if (snap.empty) return [];
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.warn('[Firebase] getGallery error:', e);
      return null;
    }
  },

  async saveGalleryItem(item) {
    if (!this.isReady) return false;
    try {
      const { id, ...data } = item;
      await this._db.collection('gallery').doc(id).set({
        ...data,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      return true;
    } catch (e) {
      console.warn('[Firebase] saveGalleryItem error:', e);
      return false;
    }
  },

  async deleteGalleryItem(itemId) {
    if (!this.isReady) return false;
    try {
      await this._db.collection('gallery').doc(itemId).delete();
      return true;
    } catch (e) {
      console.warn('[Firebase] deleteGalleryItem error:', e);
      return false;
    }
  },

  async seedGalleryIfEmpty(items) {
    if (!this.isReady) return false;
    try {
      const snap = await this._db.collection('gallery').limit(1).get();
      if (!snap.empty) return false;
      const batch = this._db.batch();
      items.forEach(item => {
        const ref = this._db.collection('gallery').doc(item.id);
        batch.set(ref, { ...item, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
      });
      await batch.commit();
      return true;
    } catch (e) {
      console.warn('[Firebase] seedGallery error:', e);
      return false;
    }
  },

  // ─── SETTINGS ──────────────────────────────────────────────────────────────

  async getSettings() {
    if (!this.isReady) return null;
    try {
      const doc = await this._db.collection('settings').doc('brand').get();
      if (!doc.exists) return null;
      return doc.data();
    } catch (e) {
      console.warn('[Firebase] getSettings error:', e);
      return null;
    }
  },

  async saveSettings(settings) {
    if (!this.isReady) return false;
    try {
      await this._db.collection('settings').doc('brand').set({
        ...settings,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      return true;
    } catch (e) {
      console.warn('[Firebase] saveSettings error:', e);
      return false;
    }
  },

  // ─── IMAGE UPLOAD (Cloud Firestore Native Storage Engine) ─────────────────

  /**
   * Upload an image file.
   * Note: The Firebase Storage bucket (jeeprep-a5262.firebasestorage.app) is not provisioned (HTTP 404).
   * All product & gallery media is automatically optimized to high-definition lightweight Base64 JPEGs
   * via canvas compression (<45KB) and saved directly into Cloud Firestore and local persistence.
   * This bypasses any external storage bucket dependency and prevents 0% upload stalls.
   */
  async uploadImage(file, path, onProgress) {
    return null;
  },

  /** Delete a storage file by its full GS path or download URL */
  async deleteStorageFile(filePathOrUrl) {
    return;
  },

  // ─── STATUS / HEALTH ──────────────────────────────────────────────────────

  async checkHealth() {
    if (!this._initialized) return { online: false, reason: 'Not initialized' };
    try {
      // Lightweight ping — read a settings sentinel doc
      await this._db.collection('_health').doc('ping').set({
        checkedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      return { online: true, projectId: FIREBASE_CONFIG.projectId };
    } catch (e) {
      return { online: false, reason: e.message };
    }
  }
};

// ─── Auto-initialize when script loads ─────────────────────────────────────
window.FirebaseService = FirebaseService;
