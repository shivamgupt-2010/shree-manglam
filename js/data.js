/**
 * SHREE MANGLAM — INITIAL DATA & ROYAL CATALOGUE
 * Royal Couture Product Catalogue & Data Model (prices stored in paise, categories, multiple images)
 */

const INITIAL_PRODUCTS = [
  {
    id: 'sm-prod-001',
    slug: 'royal-crimson-banarasi-katan-silk-saree',
    name: 'Royal Crimson Banarasi Katan Silk Saree',
    category: 'Sarees',
    pricePaise: 4850000, // ₹48,500
    compareAtPricePaise: 5600000, // ₹56,000
    availability: 'Available',
    featured: true,
    status: 'published',
    sku: 'SM-SR-0101',
    fabric: 'Pure Katan Silk',
    colour: 'Deep Crimson Maroon & Antique Gold',
    occasion: 'Bridal & Grand Reception',
    description: 'An heirloom masterpiece woven in Varanasi with authentic gold zari in intricate floral jaal and meenakari borders. Drapes with regal poise and opulent luster, passed down through generations.',
    images: [
      'assets/products/sm-saree-01.jpg',
      'assets/products/sm-saree-01-b.jpg',
      'assets/category-sarees.jpg'
    ],
    coverIndex: 0,
    createdAt: '2026-10-11T10:00:00Z',
    updatedAt: '2026-10-11T10:00:00Z'
  },
  {
    id: 'sm-prod-002',
    slug: 'champagne-gold-tissue-zardozi-saree',
    name: 'Champagne Gold Tissue Zardozi Saree',
    category: 'Sarees',
    pricePaise: 3950000, // ₹39,500
    compareAtPricePaise: 4500000, // ₹45,000
    availability: 'Made to Order',
    featured: true,
    status: 'published',
    sku: 'SM-SR-0102',
    fabric: 'Metallic Tissue Silk',
    colour: 'Champagne Gold & Warm Ivory',
    occasion: 'Cocktail & Wedding Soirée',
    description: 'Luminous metallic tissue silk adorned with delicate scalloped cutwork and hand-sewn dabka zardozi. Features a fluid, lightweight fall with radiant sheen in evening lighting.',
    images: [
      'assets/products/sm-saree-02.jpg',
      'assets/category-sarees.jpg',
      'assets/hero-banner.jpg'
    ],
    coverIndex: 0,
    createdAt: '2026-10-11T10:30:00Z',
    updatedAt: '2026-10-11T10:30:00Z'
  },
  {
    id: 'sm-prod-003',
    slug: 'maharani-rani-pink-rajputi-poshak',
    name: 'Maharani Rani Pink Rajputi Poshak',
    category: 'Poshak',
    pricePaise: 6800000, // ₹68,000
    compareAtPricePaise: 7900000, // ₹79,000
    availability: 'Available',
    featured: true,
    status: 'published',
    sku: 'SM-PK-0201',
    fabric: 'Pure Georgette & Satin',
    colour: 'Rani Pink & Burnished Gold',
    occasion: 'Rajputi Bridal & Royal Festivals',
    description: 'Authentic royal Rajasthani couture comprising Kurti, Kanchali, Ghagra, and Odhana. Embellished with heavy hand-stitched gota patti, danka, and hand-embroidered kundan borders.',
    images: [
      'assets/products/sm-poshak-01.jpg',
      'assets/products/sm-poshak-01-b.jpg',
      'assets/category-poshak.jpg'
    ],
    coverIndex: 0,
    createdAt: '2026-10-11T11:00:00Z',
    updatedAt: '2026-10-11T11:00:00Z'
  },
  {
    id: 'sm-prod-004',
    slug: 'kesariya-gota-patti-heritage-poshak',
    name: 'Kesariya Gota Patti Heritage Poshak',
    category: 'Poshak',
    pricePaise: 5400000, // ₹54,000
    compareAtPricePaise: 6200000, // ₹62,000
    availability: 'Made to Order',
    featured: false,
    status: 'published',
    sku: 'SM-PK-0202',
    fabric: 'Pure Crepe & Chiffon',
    colour: 'Saffron Kesariya & Royal Gold',
    occasion: 'Teej, Gangaur & Sangeet',
    description: 'Celebrating authentic Rajasthani heritage with fine floral bel gota patti work on vibrant kesariya fabric. Includes customized kalis and hand-dyed odhana with latkan tassels.',
    images: [
      'assets/category-poshak.jpg',
      'assets/products/sm-poshak-01.jpg'
    ],
    coverIndex: 0,
    createdAt: '2026-10-11T11:15:00Z',
    updatedAt: '2026-10-11T11:15:00Z'
  },
  {
    id: 'sm-prod-005',
    slug: 'noor-emerald-silk-anarkali-suit-set',
    name: 'Noor Emerald Silk Anarkali Suit Set',
    category: 'Suits',
    pricePaise: 3250000, // ₹32,500
    compareAtPricePaise: 3800000, // ₹38,000
    availability: 'Available',
    featured: true,
    status: 'published',
    sku: 'SM-ST-0301',
    fabric: 'Pure Chanderi Silk & Organza',
    colour: 'Royal Emerald Green & Gold',
    occasion: 'Mehendi & Festive Evenings',
    description: 'Graceful floor-length flared Anarkali silhouette paired with tailored churidar and a sheer hand-embroidered organza dupatta with scalloped marodi work along the perimeter.',
    images: [
      'assets/category-suits.jpg',
      'assets/products/sm-suit-01-b.jpg'
    ],
    coverIndex: 0,
    createdAt: '2026-10-11T11:30:00Z',
    updatedAt: '2026-10-11T11:30:00Z'
  },
  {
    id: 'sm-prod-006',
    slug: 'zeenat-midnight-velvet-zardozi-suit',
    name: 'Zeenat Midnight Velvet Zardozi Suit',
    category: 'Suits',
    pricePaise: 4200000, // ₹42,000
    compareAtPricePaise: 4900000, // ₹49,000
    availability: 'Available',
    featured: true,
    status: 'published',
    sku: 'SM-ST-0302',
    fabric: 'Micro Velvet & Tissue Organza',
    colour: 'Midnight Navy & Antique Copper',
    occasion: 'Winter Weddings & Receptions',
    description: 'Plush midnight micro-velvet kurta featuring heavy yoke zardozi embroidery with pearls and sequins. Comes with a matching velvet bottom and tissue dupatta.',
    images: [
      'assets/products/sm-suit-01.jpg',
      'assets/category-suits.jpg'
    ],
    coverIndex: 0,
    createdAt: '2026-10-11T11:45:00Z',
    updatedAt: '2026-10-11T11:45:00Z'
  }
];

const INITIAL_GALLERY = [
  {
    id: 'sm-gal-01',
    title: 'Royal Bridal Splendor — The Crimson Edit',
    tag: 'Bridal Heritage',
    imageUrl: 'assets/gallery/gallery-01.jpg',
    reelUrl: 'https://www.instagram.com/reel/C8_example1',
    type: 'LOOKBOOK'
  },
  {
    id: 'sm-gal-02',
    title: 'Rajputana Grace — Pure Georgette Poshak',
    tag: 'Rajputi Couture',
    imageUrl: 'assets/gallery/gallery-02.jpg',
    reelUrl: 'https://www.instagram.com/reel/C8_example2',
    type: 'REEL'
  },
  {
    id: 'sm-gal-03',
    title: 'Velvet Nocturne — Hand-embroidered Details',
    tag: 'Festive Velvet',
    imageUrl: 'assets/gallery/gallery-03.jpg',
    reelUrl: 'https://www.instagram.com/reel/C8_example3',
    type: 'LOOKBOOK'
  },
  {
    id: 'sm-gal-04',
    title: 'Luminous Gold Tissue Weaves & Kundan Jewels',
    tag: 'Tissue Saree',
    imageUrl: 'assets/gallery/gallery-04.jpg',
    reelUrl: 'https://www.instagram.com/reel/C8_example4',
    type: 'LOOKBOOK'
  },
  {
    id: 'sm-gal-05',
    title: 'Behind the Loom — Master Weavers of Varanasi',
    tag: 'Craftsmanship',
    imageUrl: 'assets/gallery/gallery-05.jpg',
    reelUrl: 'https://www.instagram.com/reel/C8_example5',
    type: 'REEL'
  }
];

const BRAND_SETTINGS = {
  brandName: 'Shree Manglam',
  tagline: 'Tradition Meets Elegance',
  whatsappNumber: '919285514821', // Shree Manglam WhatsApp Concierge
  contactEmail: 'contact@shreemanglam.com',
  phoneDisplay: '+91 92855 14821',
  instagramHandle: '@shreemanglam_couture',
  instagramUrl: 'https://instagram.com/',
  address: 'HARE MADHAV COLONY, Burhar, Madhya Pradesh 484110',
  googleMapsEmbedUrl: 'https://maps.google.com/maps?q=Shree+Manglam,+Hare+Madhav+Colony,+Burhar,+Madhya+Pradesh+484110&t=&z=16&ie=UTF8&iwloc=&output=embed',
  googleMapsDirectionsUrl: 'https://share.google/79DGLSpGCiGERUCj9',
  boutiqueHours: 'Open Daily: 10:00 AM – 10:00 PM (Closes 10 PM)',
  developerCredit: {
    name: 'SHIV',
    text: 'Crafted with elegance by SHIV',
    url: 'https://shiv.dev'
  }
};
