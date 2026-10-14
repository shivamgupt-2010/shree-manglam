/**
 * SHREE MANGLAM — ADMIN DASHBOARD CONTROLLER
 * Full Product Management, Multi-image workflow, Gallery/Reels management,
 * and Persistent Store administration.
 */

document.addEventListener('DOMContentLoaded', () => {
  AdminApp.init();
});

const AdminApp = {
  currentEditId: null,
  activeImagesList: [],
  selectedCoverIndex: 0,
  deletePendingId: null,

  init() {
    this.checkAuth();
    this.bindAuthEvents();
    this.renderMetrics();
    this.renderProductsTable();
    this.renderGalleryTable();
    this.renderFestivalEngineInfo();
    this.bindFormEvents();
    this.bindGalleryEvents();
    this.bindBackupEvents();
    this.bindFirebaseEvents();

    // Initialize Firebase and reload data from Firestore
    if (typeof FirebaseService !== 'undefined') {
      FirebaseService.init().then(async (ok) => {
        if (ok) {
          const products = await Store.loadProducts();
          if (products) {
            this.renderMetrics();
            this.renderProductsTable();
          }
          const gallery = await Store.loadGallery();
          if (gallery) this.renderGalleryTable();
        }
        this.updateFirebaseStatusBadge();
      });
    }
  },

  // 1. Authentication Gate
  checkAuth() {
    const isAuth = sessionStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'authenticated';
    const authGate = document.getElementById('adminAuthGate');
    if (!isAuth) {
      authGate?.classList.remove('sr-only');
      authGate?.style.setProperty('display', 'flex');
    } else {
      authGate?.style.setProperty('display', 'none');
    }
  },

  bindAuthEvents() {
    const loginForm = document.getElementById('adminLoginForm');
    const logoutBtn = document.getElementById('adminLogoutBtn');

    loginForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const pass = document.getElementById('adminPassInput')?.value;
      // Authenticate with admin passcode
      if (pass === 'shreem') {
        sessionStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'authenticated');
        document.getElementById('adminAuthGate').style.display = 'none';
        this.renderMetrics();
        this.renderProductsTable();
        this.renderGalleryTable();
      } else {
        alert('Invalid administrative passcode. Access denied.');
      }
    });

    logoutBtn?.addEventListener('click', () => {
      sessionStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
      window.location.reload();
    });
  },

  // 2. Metrics Overview
  renderMetrics() {
    const products = Store.getProducts();
    const gallery = Store.getGallery();

    const totalElem = document.getElementById('metricTotalProducts');
    const sareesElem = document.getElementById('metricSarees');
    const poshakElem = document.getElementById('metricPoshak');
    const suitsElem = document.getElementById('metricSuits');
    const galleryElem = document.getElementById('metricGallery');

    if (totalElem) totalElem.textContent = products.length;
    if (sareesElem) sareesElem.textContent = products.filter(p => p.category === 'Sarees').length;
    if (poshakElem) poshakElem.textContent = products.filter(p => p.category === 'Poshak').length;
    if (suitsElem) suitsElem.textContent = products.filter(p => p.category === 'Suits').length;
    if (galleryElem) galleryElem.textContent = gallery.length;
  },

  // 3. Products Table
  renderProductsTable(filterQuery = '') {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;

    let products = Store.getProducts();
    if (filterQuery.trim()) {
      const q = filterQuery.toLowerCase().trim();
      products = products.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
      );
    }

    if (products.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 36px; color: var(--color-text-muted);">
            No products in directory. Click "Add New Couture Piece" to create one.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = products.map(p => {
      const cover = (p.images && p.images[p.coverIndex || 0]) || 'assets/category-sarees.jpg';
      const formattedPrice = Store.formatRupees(p.pricePaise);
      const isPublished = p.status === 'published';

      return `
        <tr>
          <td>
            <img src="${cover}" alt="${p.name}" class="table-product-thumb" />
          </td>
          <td>
            <div style="font-weight: 600; color: var(--color-text-primary);">${p.name}</div>
            <div style="font-size: 0.75rem; color: var(--color-text-muted); font-family: monospace;">SKU: ${p.sku}</div>
          </td>
          <td><span style="font-size: 0.8rem; font-weight: 500;">${p.category}</span></td>
          <td>
            <div style="font-weight: 600; color: var(--color-crimson);">${formattedPrice}</div>
            <div style="font-size: 0.75rem; color: var(--color-text-muted);">${p.pricePaise} paise</div>
          </td>
          <td>
            <span class="status-pill ${isPublished ? 'published' : 'draft'}">
              ${isPublished ? 'Published' : 'Draft'}
            </span>
            ${p.featured ? `<div style="font-size: 0.68rem; color: var(--color-gold-dark); font-weight: 600; margin-top: 2px;">★ FEATURED</div>` : ''}
          </td>
          <td>
            <span style="font-size: 0.8rem; color: ${p.availability === 'Available' ? 'var(--color-available)' : 'var(--color-made-to-order)'}; font-weight: 500;">
              ${p.availability}
            </span>
          </td>
          <td>
            <div class="table-action-btns">
              <button class="btn-icon-action edit" data-id="${p.id}" title="Edit Product">Edit</button>
              <button class="btn-icon-action delete" data-id="${p.id}" title="Delete Product">Delete</button>
              <a href="/#product-${p.slug}" target="_blank" class="btn-icon-action" title="View on storefront">View ↗</a>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Bind Edit and Delete
    tbody.querySelectorAll('.btn-icon-action.edit').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        this.openEditModal(id);
      });
    });

    tbody.querySelectorAll('.btn-icon-action.delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        this.promptDeleteProduct(id);
      });
    });
  },

  // 4. Product Modal & Multi-Image Workflow
  bindFormEvents() {
    const addBtn = document.getElementById('addNewProductBtn');
    const modal = document.getElementById('productFormModal');
    const closeBtn = document.getElementById('productFormCloseBtn');
    const cancelBtn = document.getElementById('productFormCancelBtn');
    const form = document.getElementById('productForm');

    addBtn?.addEventListener('click', () => {
      this.openAddModal();
    });

    closeBtn?.addEventListener('click', () => this.closeFormModal());
    cancelBtn?.addEventListener('click', () => this.closeFormModal());

    // Search input
    const searchInput = document.getElementById('adminSearchInput');
    searchInput?.addEventListener('input', (e) => {
      this.renderProductsTable(e.target.value);
    });

    // Direct Image File Upload & Dropzone Handling
    const fileInput = document.getElementById('productFileInput');
    const dropzone = document.getElementById('imageDropzone');
    const statusText = document.getElementById('uploadStatusText');

    const handleFiles = async (files) => {
      if (!files || files.length === 0) return;
      const fileArr = Array.from(files).filter(f => f.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|avif|heic|gif)$/i.test(f.name));
      if (fileArr.length === 0) {
        alert('Please select valid image files (JPG, PNG, WEBP).');
        return;
      }

      // If current product only has the default placeholder, replace it!
      if (this.activeImagesList.length === 1 && this.activeImagesList[0] === 'assets/category-sarees.jpg') {
        this.activeImagesList = [];
      }

      if (statusText) {
        statusText.style.display = 'block';
        statusText.style.color = 'var(--color-gold-dark)';
        statusText.textContent = `Optimizing ${fileArr.length} photo(s)...`;
      }

      for (let i = 0; i < fileArr.length; i++) {
        const file = fileArr[i];
        if (statusText) statusText.textContent = `Adding photo ${i + 1} of ${fileArr.length} (${file.name})...`;
        try {
          // Step 1: Immediate local compressed data URL (< 50ms)
          const localDataUrl = await Store.compressImageFile(file, 1000, 0.82);
          const indexInList = this.activeImagesList.length;
          this.activeImagesList.push(localDataUrl);
          this.renderImagePreviews();

          // Step 2: Background upload to Firebase Storage (non-blocking)
          if (typeof FirebaseService !== 'undefined' && FirebaseService.isReady) {
            const productId = this.currentEditId || 'new-' + Date.now();
            Store.uploadProductImage(file, productId).then((cloudUrl) => {
              if (cloudUrl && cloudUrl.startsWith('http')) {
                this.activeImagesList[indexInList] = cloudUrl;
              }
            }).catch(() => {});
          }
        } catch (err) {
          console.warn('[Admin] Canvas compression fallback, using raw reader:', err);
          try {
            const raw = await Store.readFileAsDataUrl(file);
            this.activeImagesList.push(raw);
            this.renderImagePreviews();
          } catch (e2) {
            console.error('[Admin] Could not read photo:', e2);
          }
        }
      }

      if (statusText) {
        statusText.textContent = `✓ ${fileArr.length} photo(s) added!`;
        statusText.style.color = '#25a244';
        setTimeout(() => {
          statusText.style.display = 'none';
          statusText.style.color = '';
        }, 3000);
      }
      this.renderImagePreviews();
      if (fileInput) fileInput.value = '';
    };

    dropzone?.addEventListener('click', (e) => {
      if (e.target !== fileInput) {
        fileInput?.click();
      }
    });

    fileInput?.addEventListener('change', (e) => {
      handleFiles(e.target.files);
    });

    dropzone?.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });

    dropzone?.addEventListener('dragleave', () => {
      dropzone.classList.remove('dragover');
    });

    dropzone?.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer && e.dataTransfer.files) {
        handleFiles(e.dataTransfer.files);
      }
    });

    // Add Image URL Button
    const addImgUrlBtn = document.getElementById('addImageUrlBtn');
    const imgUrlInput = document.getElementById('imageUrlInput');
    addImgUrlBtn?.addEventListener('click', () => {
      const url = imgUrlInput?.value.trim();
      if (url) {
        this.activeImagesList.push(url);
        imgUrlInput.value = '';
        this.renderImagePreviews();
      }
    });

    // Form Submit
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveProductForm();
    });

    // Delete Confirmation Modal
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    confirmDeleteBtn?.addEventListener('click', () => {
      if (this.deletePendingId) {
        Store.deleteProduct(this.deletePendingId);
        this.deletePendingId = null;
        document.getElementById('deleteConfirmModal').classList.remove('open');
        this.renderMetrics();
        this.renderProductsTable();
      }
    });
    cancelDeleteBtn?.addEventListener('click', () => {
      this.deletePendingId = null;
      document.getElementById('deleteConfirmModal').classList.remove('open');
    });
  },

  openAddModal() {
    this.currentEditId = null;
    this.activeImagesList = ['assets/category-sarees.jpg'];
    this.selectedCoverIndex = 0;

    document.getElementById('formModalTitle').textContent = 'Add New Couture Piece';
    document.getElementById('productForm').reset();
    document.getElementById('formAvailability').value = 'Available';
    document.getElementById('formStatus').value = 'published';

    this.renderImagePreviews();
    document.getElementById('productFormModal').classList.add('open');
  },

  openEditModal(id) {
    const product = Store.getProductById(id);
    if (!product) return;

    this.currentEditId = id;
    this.activeImagesList = Array.isArray(product.images) && product.images.length > 0 ? [...product.images] : ['assets/category-sarees.jpg'];
    this.selectedCoverIndex = product.coverIndex || 0;

    document.getElementById('formModalTitle').textContent = `Edit Couture Piece — ${product.sku}`;
    document.getElementById('formName').value = product.name;
    document.getElementById('formCategory').value = product.category;
    document.getElementById('formPrice').value = Store.paiseToRupees(product.pricePaise);
    document.getElementById('formComparePrice').value = product.compareAtPricePaise ? Store.paiseToRupees(product.compareAtPricePaise) : '';
    document.getElementById('formSku').value = product.sku;
    document.getElementById('formFabric').value = product.fabric || '';
    document.getElementById('formColour').value = product.colour || '';
    document.getElementById('formOccasion').value = product.occasion || '';
    document.getElementById('formAvailability').value = product.availability || 'Available';
    document.getElementById('formFeatured').checked = Boolean(product.featured);
    document.getElementById('formStatus').value = product.status || 'published';
    document.getElementById('formDescription').value = product.description || '';

    this.renderImagePreviews();
    document.getElementById('productFormModal').classList.add('open');
  },

  closeFormModal() {
    document.getElementById('productFormModal').classList.remove('open');
    this.currentEditId = null;
  },

  renderImagePreviews() {
    const container = document.getElementById('imagePreviewsContainer');
    if (!container) return;

    if (this.activeImagesList.length === 0) {
      container.innerHTML = `<span style="font-size: 0.8rem; color: var(--color-text-muted);">No images added yet. Add an image URL or choose default asset.</span>`;
      return;
    }

    container.innerHTML = this.activeImagesList.map((img, idx) => `
      <div class="preview-thumb-card" data-index="${idx}">
        <img src="${img}" alt="Preview ${idx + 1}" class="preview-thumb-img" />
        <button type="button" class="preview-thumb-remove" data-index="${idx}" title="Remove image">×</button>
        ${idx === this.selectedCoverIndex ? `<div class="preview-cover-badge">COVER IMAGE</div>` : `<div style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.6); color: #fff; font-size: 0.6rem; text-align: center; cursor: pointer; padding: 2px;" class="set-cover-btn" data-index="${idx}">SET COVER</div>`}
      </div>
    `).join('');

    // Bind remove
    container.querySelectorAll('.preview-thumb-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.index);
        this.activeImagesList.splice(idx, 1);
        if (this.selectedCoverIndex >= this.activeImagesList.length) {
          this.selectedCoverIndex = Math.max(0, this.activeImagesList.length - 1);
        }
        this.renderImagePreviews();
      });
    });

    // Bind set cover
    container.querySelectorAll('.set-cover-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectedCoverIndex = parseInt(btn.dataset.index);
        this.renderImagePreviews();
      });
    });
  },

  saveProductForm() {
    const name = document.getElementById('formName').value.trim();
    const category = document.getElementById('formCategory').value;
    const priceRupees = parseFloat(document.getElementById('formPrice').value);
    const compareRupees = parseFloat(document.getElementById('formComparePrice').value);
    const sku = document.getElementById('formSku').value.trim();
    const fabric = document.getElementById('formFabric').value.trim();
    const colour = document.getElementById('formColour').value.trim();
    const occasion = document.getElementById('formOccasion').value.trim();
    const availability = document.getElementById('formAvailability').value;
    const featured = document.getElementById('formFeatured').checked;
    const status = document.getElementById('formStatus').value;
    const description = document.getElementById('formDescription').value.trim();

    if (!name || isNaN(priceRupees)) {
      alert('Product name and a valid price in Rupees are required.');
      return;
    }

    const pricePaise = Store.rupeesToPaise(priceRupees);
    const compareAtPricePaise = isNaN(compareRupees) ? null : Store.rupeesToPaise(compareRupees);

    const productPayload = {
      name,
      category,
      pricePaise,
      compareAtPricePaise,
      sku: sku || 'SM-' + Math.floor(1000 + Math.random() * 9000),
      fabric,
      colour,
      occasion,
      availability,
      featured,
      status,
      description,
      images: this.activeImagesList.length > 0 ? this.activeImagesList : ['assets/category-sarees.jpg'],
      coverIndex: this.selectedCoverIndex
    };

    if (this.currentEditId) {
      Store.updateProduct(this.currentEditId, productPayload);
    } else {
      Store.addProduct(productPayload);
    }

    this.closeFormModal();
    this.renderMetrics();
    this.renderProductsTable();
  },

  promptDeleteProduct(id) {
    this.deletePendingId = id;
    const product = Store.getProductById(id);
    document.getElementById('deleteProductNameDisplay').textContent = product ? `"${product.name}"` : 'this product';
    document.getElementById('deleteConfirmModal').classList.add('open');
  },

  // 5. Lookbook & Reels Management
  renderGalleryTable() {
    const tbody = document.getElementById('galleryTableBody');
    if (!tbody) return;

    const gallery = Store.getGallery();
    tbody.innerHTML = gallery.map(item => `
      <tr>
        <td>
          <img src="${item.imageUrl}" alt="${item.title}" style="width: 44px; height: 58px; border-radius: 2px; object-fit: cover;" />
        </td>
        <td>
          <div style="font-weight: 600;">${item.title}</div>
          <span style="font-size: 0.72rem; color: var(--color-gold-dark);">${item.tag}</span>
        </td>
        <td><span class="status-pill published">${item.type}</span></td>
        <td>
          ${item.reelUrl ? `<a href="${item.reelUrl}" target="_blank" style="font-size: 0.78rem; color: var(--color-crimson); text-decoration: underline;">Link ↗</a>` : `<span style="color: var(--color-text-muted); font-size: 0.75rem;">None</span>`}
        </td>
        <td>
          <button class="btn-icon-action delete" data-gallery-id="${item.id}">Remove</button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.btn-icon-action.delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.galleryId;
        if (confirm('Are you sure you want to remove this lookbook entry?')) {
          Store.deleteGalleryItem(id);
          this.renderMetrics();
          this.renderGalleryTable();
        }
      });
    });
  },

  // 6. Lookbook Modal & File Upload Manager
  openGalleryModal() {
    const modal = document.getElementById('galleryModal');
    const form = document.getElementById('galleryForm');
    const previewContainer = document.getElementById('galleryPreviewContainer');
    const status = document.getElementById('galleryUploadStatus');
    const urlInput = document.getElementById('galleryImageUrlInput');
    const fileInput = document.getElementById('galleryFileInput');

    form?.reset();
    this.activeGalleryImage = null;
    if (previewContainer) previewContainer.style.display = 'none';
    if (status) status.style.display = 'none';
    if (urlInput) urlInput.value = '';
    if (fileInput) fileInput.value = '';
    modal?.classList.add('open');
  },

  closeGalleryModal() {
    const modal = document.getElementById('galleryModal');
    modal?.classList.remove('open');
    this.activeGalleryImage = null;
  },

  bindGalleryEvents() {
    this.activeGalleryImage = null;
    const galleryModal = document.getElementById('galleryModal');
    const openGalleryModalBtn = document.getElementById('openGalleryModalBtn');
    const closeGalleryModalBtn = document.getElementById('galleryModalCloseBtn');
    const cancelGalleryModalBtn = document.getElementById('galleryModalCancelBtn');
    const galleryForm = document.getElementById('galleryForm');
    const galleryFileInput = document.getElementById('galleryFileInput');
    const galleryDropzone = document.getElementById('galleryDropzone');
    const galleryStatus = document.getElementById('galleryUploadStatus');
    const galleryPreviewContainer = document.getElementById('galleryPreviewContainer');
    const galleryPreviewImg = document.getElementById('galleryPreviewImg');
    const galleryRemoveImgBtn = document.getElementById('galleryRemoveImgBtn');
    const galleryImageUrlInput = document.getElementById('galleryImageUrlInput');
    const galleryUseUrlBtn = document.getElementById('galleryUseUrlBtn');

    openGalleryModalBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      this.openGalleryModal();
    });

    closeGalleryModalBtn?.addEventListener('click', () => this.closeGalleryModal());
    cancelGalleryModalBtn?.addEventListener('click', () => this.closeGalleryModal());

    // Close on clicking backdrop
    galleryModal?.addEventListener('click', (e) => {
      if (e.target === galleryModal) this.closeGalleryModal();
    });

    // Lookbook File Selection & Instant Display
    const handleGalleryFile = async (file) => {
      if (!file) return;
      if (galleryStatus) {
        galleryStatus.style.display = 'block';
        galleryStatus.style.color = 'var(--color-gold-dark)';
        galleryStatus.textContent = `Optimizing photo (${file.name})...`;
      }
      try {
        // Step 1: Immediate local preview (< 50ms)
        const localDataUrl = await Store.compressImageFile(file, 1000, 0.82);
        this.activeGalleryImage = localDataUrl;
        if (galleryPreviewImg) galleryPreviewImg.src = localDataUrl;
        if (galleryPreviewContainer) galleryPreviewContainer.style.display = 'block';
        if (galleryStatus) {
          galleryStatus.textContent = '✓ Photo ready for Lookbook!';
          galleryStatus.style.color = '#25a244';
        }

        // Step 2: Background cloud upload (non-blocking)
        if (typeof FirebaseService !== 'undefined' && FirebaseService.isReady) {
          Store.uploadGalleryImage(file).then((cloudUrl) => {
            if (cloudUrl && cloudUrl.startsWith('http')) {
              this.activeGalleryImage = cloudUrl;
              if (galleryPreviewImg) galleryPreviewImg.src = cloudUrl;
            }
          }).catch(() => {});
        }
      } catch (err) {
        console.warn('Gallery canvas compression fallback, using raw reader:', err);
        try {
          const raw = await Store.readFileAsDataUrl(file);
          this.activeGalleryImage = raw;
          if (galleryPreviewImg) galleryPreviewImg.src = raw;
          if (galleryPreviewContainer) galleryPreviewContainer.style.display = 'block';
          if (galleryStatus) {
            galleryStatus.textContent = '✓ Photo ready for Lookbook!';
            galleryStatus.style.color = '#25a244';
          }
        } catch (e2) {
          console.error('Gallery file upload error:', e2);
          if (galleryStatus) {
            galleryStatus.textContent = 'Upload failed. Please try another image.';
            galleryStatus.style.color = 'var(--color-crimson)';
          }
        }
      }
    };

    galleryFileInput?.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) handleGalleryFile(file);
    });

    galleryDropzone?.addEventListener('click', (e) => {
      if (e.target !== galleryFileInput) galleryFileInput?.click();
    });

    galleryDropzone?.addEventListener('dragover', (e) => {
      e.preventDefault();
      galleryDropzone.classList.add('dragover');
    });

    galleryDropzone?.addEventListener('dragleave', () => {
      galleryDropzone.classList.remove('dragover');
    });

    galleryDropzone?.addEventListener('drop', (e) => {
      e.preventDefault();
      galleryDropzone.classList.remove('dragover');
      const file = e.dataTransfer?.files?.[0];
      if (file) handleGalleryFile(file);
    });

    // Set Image URL manually
    galleryUseUrlBtn?.addEventListener('click', () => {
      const url = galleryImageUrlInput?.value.trim();
      if (!url) {
        alert('Please enter a valid image URL or relative path.');
        return;
      }
      this.activeGalleryImage = url;
      if (galleryPreviewImg) galleryPreviewImg.src = url;
      if (galleryPreviewContainer) galleryPreviewContainer.style.display = 'block';
      if (galleryStatus) {
        galleryStatus.style.display = 'block';
        galleryStatus.textContent = '✓ Image URL linked!';
        galleryStatus.style.color = '#25a244';
      }
    });

    // Remove Preview
    galleryRemoveImgBtn?.addEventListener('click', () => {
      this.activeGalleryImage = null;
      if (galleryPreviewContainer) galleryPreviewContainer.style.display = 'none';
      if (galleryStatus) galleryStatus.style.display = 'none';
      if (galleryFileInput) galleryFileInput.value = '';
      if (galleryImageUrlInput) galleryImageUrlInput.value = '';
    });

    // Save Gallery Form
    galleryForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('galleryTitleInput')?.value.trim();
      const selectTag = document.getElementById('galleryTagSelect')?.value;
      const customTag = document.getElementById('galleryCustomTag')?.value.trim();
      const reelUrl = document.getElementById('galleryReelUrlInput')?.value.trim() || '';
      const tag = customTag || selectTag || 'Couture';
      const imageUrl = this.activeGalleryImage || galleryImageUrlInput?.value.trim() || 'assets/hero-banner.jpg';

      if (!title) {
        alert('Please enter a Lookbook title.');
        return;
      }

      Store.addGalleryItem({
        title,
        tag,
        imageUrl,
        reelUrl,
        type: reelUrl ? 'REEL' : 'LOOKBOOK'
      });

      closeGalleryModal();
      this.renderMetrics();
      this.renderGalleryTable();
    });
  },

  // 6. Backup & Restore Events
  bindBackupEvents() {
    const exportBtn = document.getElementById('exportBackupBtn');
    const importInput = document.getElementById('importBackupInput');
    const resetBtn = document.getElementById('resetDefaultsBtn');

    exportBtn?.addEventListener('click', () => {
      const backupJson = Store.exportBackup();
      const blob = new Blob([backupJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `shree_manglam_backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });

    importInput?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const success = Store.importBackup(event.target.result);
        if (success) {
          alert('Directory backup successfully restored!');
          window.location.reload();
        } else {
          alert('Failed to parse backup JSON file.');
        }
      };
      reader.readAsText(file);
    });

    resetBtn?.addEventListener('click', () => {
      if (confirm('Warning: This will restore the factory default royal catalogue. Any newly added items will be overwritten. Proceed?')) {
        Store.resetDefaults();
        window.location.reload();
      }
    });
  },

  // 7. Firebase Status & Sync Panel
  bindFirebaseEvents() {
    const pingBtn = document.getElementById('firebasePingBtn');
    const syncBtn = document.getElementById('firebaseSyncBtn');
    pingBtn?.addEventListener('click', () => this.updateFirebaseStatusBadge());
    syncBtn?.addEventListener('click', async () => {
      const logMsg = document.getElementById('firebaseLogMsg');
      if (logMsg) logMsg.textContent = 'Syncing all products to Firebase...';
      const products = Store.getProducts();
      const gallery  = Store.getGallery();
      let count = 0;
      for (const p of products) {
        const ok = await FirebaseService.saveProduct(p);
        if (ok) count++;
      }
      for (const g of gallery) {
        await FirebaseService.saveGalleryItem(g);
      }
      if (logMsg) logMsg.textContent = `✅ Synced ${count}/${products.length} products and ${gallery.length} gallery items to Firebase Firestore!`;
    });
  },

  updateFirebaseStatusBadge() {
    const badge = document.getElementById('firebaseStatusBadge');
    const logMsg = document.getElementById('firebaseLogMsg');
    if (!badge) return;
    if (typeof FirebaseService === 'undefined' || !FirebaseService.isReady) {
      badge.textContent = '⚪ Firebase Initializing...';
      badge.className = 'status-pill draft';
      return;
    }
    FirebaseService.checkHealth().then(h => {
      if (h.online) {
        badge.textContent = '🟢 Firebase Connected';
        badge.className = 'status-pill published';
        if (logMsg) logMsg.textContent = `Connected to Firebase project: ${h.projectId || 'jeeprep-a5262'}. All data syncing in real-time.`;
      } else {
        badge.textContent = '🟡 Firebase Offline (Local Cache Active)';
        badge.className = 'status-pill draft';
        if (logMsg) logMsg.textContent = `Firebase: ${h.reason}. Data is cached locally and will sync when connection resumes.`;
      }
    });
  },

  // 8. Client-side Image Compression & Optimization
  compressAndLoadImage(file, maxWidth = 1200, quality = 0.82) {
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

  // 9. Festival Engine Overview & Live Theme Status
  renderFestivalEngineInfo() {
    if (typeof FestivalEngine === 'undefined') return;

    const activeFest = FestivalEngine.getActiveFestival();
    const festivals = FestivalEngine.getAllFestivals();

    const iconEl = document.getElementById('adminFestIcon');
    const nameEl = document.getElementById('adminFestName');
    const datesEl = document.getElementById('adminFestDates');
    const taglineEl = document.getElementById('adminFestTagline');
    const stylingEl = document.getElementById('adminFestStyling');
    const listEl = document.getElementById('adminFestivalList');

    if (iconEl) iconEl.textContent = activeFest.icon;
    if (nameEl) nameEl.textContent = activeFest.name;
    if (datesEl) {
      const startFmt = new Date(activeFest.startDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
      const endFmt = new Date(activeFest.endDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
      datesEl.textContent = `Active Window: ${startFmt} – ${endFmt}`;
    }
    if (taglineEl) taglineEl.textContent = activeFest.tagline;
    if (stylingEl) stylingEl.textContent = activeFest.stylingNote;

    if (listEl) {
      listEl.innerHTML = festivals.map(f => {
        const isCurrent = f.id === activeFest.id;
        const startYear = f.startDate.slice(0, 4);
        return `
          <div style="background: ${isCurrent ? '#fff3dc' : '#ffffff'}; border: 1px solid ${isCurrent ? 'var(--color-gold)' : 'rgba(197,160,89,0.3)'}; border-radius: var(--radius-xs); padding: 8px 12px; font-size: 0.74rem; display: flex; align-items: center; gap: 6px;">
            <span>${f.icon}</span>
            <strong>${f.shortName}</strong>
            <span style="color: var(--color-text-muted);">(${startYear})</span>
            ${isCurrent ? '<span style="color: var(--color-crimson); font-weight: 700;">• Live</span>' : ''}
          </div>
        `;
      }).join('');
    }
  }
};

window.AdminApp = AdminApp;
