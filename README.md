# Shree Manglam — Luxury Fashion Storefront & Admin Portal
> *"Tradition Meets Elegance"* — Royal Indian Haute Couture (Sarees, Poshak & Suits)  
> Architected and engineered by **SHIV**

---

## 🌟 Overview & Highlights

This project implements the complete **Royal Haute Couture Digital Platform** for **Shree Manglam**:
1. **Bespoke Luxury Visual System**: Built using the brand logo emblem, royal crimson (`#5a0e1c`), antique gold (`#c5a059`), and silk parchment (`#faf7f2`), with *Cormorant Garamond* and *Cinzel* typography.
2. **Customer Storefront (`index.html`)**:
   - Editorial Hero Section with royal typography and tagline.
   - Shop-by-category showcase for **Sarees**, **Poshak**, and **Suits**.
   - Dynamic real-time catalogue with search, multi-fabric & occasion filters, and price sorting.
   - Interactive multi-image product detail modal with image carousel, specifications, and instant WhatsApp inquiry.
   - Editorial Lookbook and Instagram Reels showcase with full-screen lightbox.
   - The Shree Manglam Craftsmanship and Heritage section.
   - Flagship boutique location and **Google Maps placement**.
   - Floating luxury WhatsApp concierge widget.
3. **Admin Management Dashboard (`admin.html`)**:
   - Passkey-authenticated administrative session.
   - Live metrics overview (Total Products, Sarees, Poshak, Suits, Gallery Entries).
   - Complete Product CRUD (Create, Edit, Publish/Draft, Delete with confirmation).
   - Multi-photo workflow with cover image selection and reordering.
   - Lookbook and Instagram Reel manager.
   - JSON catalog backup export and import.
4. **Zero-Dependency & Lightning Fast**:
   - Zero compilation or build step required.
   - Pure HTML5, modular Vanilla CSS, and modern ES6 JavaScript.
   - Instant 100ms loading even on slower mobile devices (PRD Success Criterion).

---

## 🔍 Google Search Console Setup Guide

To connect the website to **Google Search Console**:

### Step 1: Add Property
1. Go to [Google Search Console](https://search.google.com/search-console).
2. Click **Add Property** and enter your live domain (e.g. `https://shreemanglam.com` or your Netlify subdomain `https://shree-manglam.netlify.app`).

### Step 2: Verification via HTML Tag
1. Select the **HTML Tag** verification method in Google Console.
2. Copy the `content` verification string (e.g. `google-site-verification=XXXXXXXXXXXXXXXXXXXX`).
3. Open `index.html` line 16:
   ```html
   <meta name="google-site-verification" content="YOUR_GOOGLE_CONSOLE_VERIFICATION_CODE_HERE" />
   ```
4. Replace `YOUR_GOOGLE_CONSOLE_VERIFICATION_CODE_HERE` with your token and save.
5. Click **Verify** in Google Search Console.

### Step 3: Submit Sitemap
1. In Google Search Console, go to **Sitemaps** in the left sidebar.
2. Enter `sitemap.xml` and click **Submit**.
3. Google will now index all collection URLs and pages.

---

## 📍 Google Maps Placement & Customization

The flagship boutique location is displayed in the **Boutique & Location** section of `index.html`:
- **Boutique Location**: HARE MADHAV COLONY, Burhar, Madhya Pradesh 484110
- **Google Maps Link**: [https://share.google/79DGLSpGCiGERUCj9](https://share.google/79DGLSpGCiGERUCj9)
- **WhatsApp Concierge**: +91 92855 14821
- **Opening Hours**: Open Daily · Closes 10 PM
- **To update the Google Maps embed**:
  1. Open the Google Maps link or search for the boutique.
  2. The responsive Google Maps iframe is embedded in `index.html` pointing to Hare Madhav Colony, Burhar MP.
  3. Settings are also managed centrally in `js/data.js` via `BRAND_SETTINGS`.

---

## 🚀 Netlify Deployment Guide

The website includes `netlify.toml` pre-configured for instant zero-config deployment:

### Option A: Drag & Drop (Fastest — 30 Seconds)
1. Go to [app.netlify.com](https://app.netlify.com).
2. Log in or create an account.
3. Drag and drop the `f:\SHIV\Shree Manglam` folder directly into the Netlify Sites dashboard.
4. Your website will be live with a free SSL certificate within seconds!

### Option B: Git Push to Netlify
1. Initialize a git repository:
   ```bash
   git init
   git add .
   git commit -m "Initial release of Shree Manglam Luxury Storefront"
   ```
2. Push to GitHub, GitLab, or Bitbucket.
3. In Netlify, click **Add new site** → **Import an existing project**.
4. Set **Publish directory** to `.` (the root).
5. Deploy!

### Netlify Features Included:
- **Clean routing**: `/admin` automatically serves `/admin.html`.
- **Security headers**: `X-Frame-Options`, `X-Content-Type-Options`, strict referrer policy.
- **Asset caching**: 1-year immutable cache headers for high-resolution images.

---

## 🔐 Administrative Access

- **Admin Portal URL**: `/admin.html` (or `/admin` on Netlify).
- **Security**: Passkey-protected administrative session with real-time CRUD and catalog management.

---

## 👨‍💻 Developer Information

- **Client**: Shree Manglam
- **Project**: Royal Luxury Fashion Digital Storefront & Admin Portal
- **Designed & Engineered by**: **SHIV**
- **Developer Credit Badge**: Present in the royal footer with backlink to SHIV.
- **Tech Stack**:
  - HTML5 Semantic Structure + OpenGraph + JSON-LD Schema
  - Vanilla CSS3 with CSS Custom Properties & responsive grid
  - Vanilla ES6 JavaScript (Zero third-party runtime bloat)
  - LocalStorage Data Layer with JSON backup/restore
  - Netlify hosting configuration (`netlify.toml`)
