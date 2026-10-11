/**
 * SHREE MANGLAM — FESTIVAL & SEASONAL THEME ENGINE
 * Automatically detects current and upcoming Indian festivals (2026 - 2027),
 * dynamically adapts storefront greetings, color moods, and curates festive product suggestions.
 */

const FESTIVAL_CALENDAR = [
  {
    id: 'navratri-dussehra',
    name: 'Navratri & Dussehra Festive Edit',
    shortName: 'Navratri & Dussehra',
    icon: '🪔',
    startDate: '2026-10-08',
    endDate: '2026-10-23',
    peakDate: '2026-10-20',
    greeting: '🪔 Shubh Navratri & Dussehra Edit • Royal Festive Curation Live',
    tagline: 'Auspicious crimson silks, marodi embroidery, and vibrant royal silhouettes for nine nights of devotion.',
    stylingNote: 'Recommended: Deep Crimson Katan Silk Sarees, Pure Silk Anarkalis & Hand-Embroidered Borders',
    accentColor: '#8a1329',
    badgeText: 'Navratri Festive Pick',
    suggestedCategories: ['Sarees', 'Suits', 'Poshak'],
    recommendedFabrics: ['Pure Silk', 'Chanderi', 'Georgette'],
    recommendedOccasions: ['Festive', 'Bridal & Grand Reception'],
    keywords: ['crimson', 'silk', 'anarkali', 'katan', 'gold']
  },
  {
    id: 'karwa-chauth',
    name: 'Karwa Chauth Suhag Collection',
    shortName: 'Karwa Chauth',
    icon: '🌙',
    startDate: '2026-10-24',
    endDate: '2026-11-01',
    peakDate: '2026-10-29',
    greeting: '🌙 Karwa Chauth Suhag Edit • Handcrafted Bridal Sarees & Royal Poshak',
    tagline: 'Heirloom bridal reds, authentic Banarasi katan silk, and royal Rajasthani poshak for the sacred moon evening.',
    stylingNote: 'Recommended: Deep Maroon Banarasi Sarees, Rani Pink Rajputi Poshak & Gota Patti Dupattas',
    accentColor: '#7a0e20',
    badgeText: 'Karwa Chauth Special',
    suggestedCategories: ['Sarees', 'Poshak'],
    recommendedFabrics: ['Pure Katan Silk', 'Pure Georgette & Satin'],
    recommendedOccasions: ['Bridal', 'Rajputi Bridal & Royal Festivals'],
    keywords: ['crimson', 'rani pink', 'poshak', 'katan', 'zardozi']
  },
  {
    id: 'diwali-dhanteras',
    name: 'Deepavali & Dhanteras Royal Edit',
    shortName: 'Diwali & Dhanteras',
    icon: '✨',
    startDate: '2026-11-02',
    endDate: '2026-11-15',
    peakDate: '2026-11-08',
    greeting: '✨ Shubh Deepavali & Dhanteras • Royal Gold & Silk Heirlooms',
    tagline: 'Illuminate your celebrations in champagne gold tissue, antique zari drapes, and royal velvet suites.',
    stylingNote: 'Recommended: Metallic Tissue Silk, Pure Varanasi Gold Weaves & Regal Velvet Kurtas',
    accentColor: '#c5a059',
    badgeText: 'Diwali Festive Spotlight',
    suggestedCategories: ['Sarees', 'Suits', 'Poshak'],
    recommendedFabrics: ['Metallic Tissue Silk', 'Micro Velvet', 'Pure Katan Silk'],
    recommendedOccasions: ['Festive', 'Cocktail & Wedding Soirée'],
    keywords: ['tissue', 'gold', 'velvet', 'zari', 'champagne']
  },
  {
    id: 'winter-weddings',
    name: 'Imperial Winter Wedding Season',
    shortName: 'Winter Weddings',
    icon: '👑',
    startDate: '2026-11-16',
    endDate: '2027-01-10',
    peakDate: '2026-12-15',
    greeting: '👑 Royal Winter Wedding Season • Bespoke Bridal Couture & Zardozi Poshak',
    tagline: 'Heavy handcrafted zardozi, plush micro-velvet shararas, and authentic 4-piece Rajputana poshak.',
    stylingNote: 'Recommended: Heavy Velvet Kurtas, Dabka Zardozi Sarees & Hand-Stitched Gota Patti Poshak',
    accentColor: '#5a0e1c',
    badgeText: 'Imperial Wedding Pick',
    suggestedCategories: ['Poshak', 'Sarees', 'Suits'],
    recommendedFabrics: ['Micro Velvet', 'Pure Georgette & Satin', 'Pure Katan Silk'],
    recommendedOccasions: ['Winter Weddings & Receptions', 'Rajputi Bridal & Royal Festivals', 'Bridal & Grand Reception'],
    keywords: ['velvet', 'bridal', 'poshak', 'zardozi', 'reception']
  },
  {
    id: 'sankranti-lohri',
    name: 'Makar Sankranti & Lohri Festive Edit',
    shortName: 'Sankranti & Lohri',
    icon: '🪁',
    startDate: '2027-01-11',
    endDate: '2027-01-22',
    peakDate: '2027-01-14',
    greeting: '🪁 Makar Sankranti & Lohri Edit • Vibrant Saffron & Heritage Weaves',
    tagline: 'Celebrating the winter harvest in vibrant kesariya kalis, lightweight silk suits, and festive drapes.',
    stylingNote: 'Recommended: Saffron Kesariya Poshak, Pure Chanderi Silk & Gold Bel Handloom',
    accentColor: '#d48817',
    badgeText: 'Sankranti Special',
    suggestedCategories: ['Poshak', 'Suits', 'Sarees'],
    recommendedFabrics: ['Pure Crepe & Chiffon', 'Pure Chanderi Silk'],
    recommendedOccasions: ['Teej, Gangaur & Sangeet', 'Festive'],
    keywords: ['kesariya', 'saffron', 'crepe', 'chanderi']
  },
  {
    id: 'vasant-panchami',
    name: 'Vasant Panchami Spring Awakening',
    shortName: 'Vasant Panchami',
    icon: '🌼',
    startDate: '2027-01-23',
    endDate: '2027-02-18',
    peakDate: '2027-02-11',
    greeting: '🌼 Vasant Panchami Spring Edit • Basanti Gold & Chanderi Silks',
    tagline: 'Greeting the arrival of spring in luminous mustard yellows, floral marodi work, and breezy organza dupattas.',
    stylingNote: 'Recommended: Pure Chanderi Silk Anarkalis, Organza Dupattas & Warm Gold Sarees',
    accentColor: '#e0a020',
    badgeText: 'Spring Festive Pick',
    suggestedCategories: ['Suits', 'Sarees'],
    recommendedFabrics: ['Pure Chanderi Silk & Organza', 'Metallic Tissue Silk'],
    recommendedOccasions: ['Mehendi & Festive Evenings', 'Cocktail & Wedding Soirée'],
    keywords: ['chanderi', 'emerald', 'tissue', 'organza']
  },
  {
    id: 'shivratri',
    name: 'Maha Shivratri Sacred Weaves',
    shortName: 'Maha Shivratri',
    icon: '🔱',
    startDate: '2027-02-19',
    endDate: '2027-03-10',
    peakDate: '2027-03-06',
    greeting: '🔱 Maha Shivratri Sacred Collection • Pure Raw Silks & Subtle Gold',
    tagline: 'Understated imperial reverence woven with pure mulberry silks, authentic zari selvages, and serene drapes.',
    stylingNote: 'Recommended: Ivory & Champagne Tissue Sarees, Raw Silk Anarkalis & Handloom Weaves',
    accentColor: '#967845',
    badgeText: 'Sacred Weave Pick',
    suggestedCategories: ['Sarees', 'Suits'],
    recommendedFabrics: ['Metallic Tissue Silk', 'Pure Katan Silk'],
    recommendedOccasions: ['Festive', 'Bridal & Grand Reception'],
    keywords: ['champagne', 'ivory', 'silk', 'tissue']
  },
  {
    id: 'gangaur-holi',
    name: 'Royal Gangaur & Holi Festival Edit',
    shortName: 'Gangaur & Holi',
    icon: '🌸',
    startDate: '2027-03-11',
    endDate: '2027-04-18',
    peakDate: '2027-04-10',
    greeting: '🌸 Royal Gangaur & Holi Edit • Iconic Rajputana Poshak Spotlight',
    tagline: 'Honoring Rajasthan’s most sacred bridal celebration with heavy gota patti kurti-kanchalis, danka, and flowing odhanas.',
    stylingNote: 'Recommended: Pure Georgette Rajputi Poshak, Kesariya Gota Patti & Rani Pink Silk Ensembles',
    accentColor: '#9a1032',
    badgeText: 'Gangaur Royal Pick',
    suggestedCategories: ['Poshak', 'Sarees'],
    recommendedFabrics: ['Pure Georgette & Satin', 'Pure Crepe & Chiffon'],
    recommendedOccasions: ['Rajputi Bridal & Royal Festivals', 'Teej, Gangaur & Sangeet'],
    keywords: ['poshak', 'gota patti', 'rani pink', 'kesariya']
  },
  {
    id: 'akshaya-tritiya',
    name: 'Akshaya Tritiya & Summer Weddings',
    shortName: 'Akshaya Tritiya',
    icon: '⚜️',
    startDate: '2027-04-19',
    endDate: '2027-06-30',
    peakDate: '2027-05-09',
    greeting: '⚜️ Akshaya Tritiya Edit • Eternal Gold Tissue & Auspicious Silks',
    tagline: 'Invest in timeless heirloom weaves and breathable silk Anarkalis crafted for eternal auspiciousness.',
    stylingNote: 'Recommended: Champagne Gold Tissue Zardozi, Pure Chanderi Flared Sets & Fine Katan Silks',
    accentColor: '#b89047',
    badgeText: 'Eternal Gold Pick',
    suggestedCategories: ['Sarees', 'Suits'],
    recommendedFabrics: ['Metallic Tissue Silk', 'Pure Chanderi Silk & Organza'],
    recommendedOccasions: ['Cocktail & Wedding Soirée', 'Bridal & Grand Reception'],
    keywords: ['gold', 'tissue', 'chanderi', 'katan']
  },
  {
    id: 'teej-rakhi',
    name: 'Haryali Teej & Raksha Bandhan Edit',
    shortName: 'Teej & Rakhi',
    icon: '🌿',
    startDate: '2027-07-01',
    endDate: '2027-08-25',
    peakDate: '2027-08-05',
    greeting: '🌿 Haryali Teej & Raksha Bandhan • Monsoon Royalty & Heritage Poshak',
    tagline: 'Embrace the monsoon celebration with traditional gota patti kalis, bright kesariya tones, and handcrafted festive suits.',
    stylingNote: 'Recommended: Kesariya Heritage Poshak, Emerald Chanderi Sets & Rani Pink Silks',
    accentColor: '#1d633b',
    badgeText: 'Teej Festive Pick',
    suggestedCategories: ['Poshak', 'Suits', 'Sarees'],
    recommendedFabrics: ['Pure Crepe & Chiffon', 'Pure Chanderi Silk & Organza'],
    recommendedOccasions: ['Teej, Gangaur & Sangeet', 'Mehendi & Festive Evenings'],
    keywords: ['teej', 'kesariya', 'poshak', 'emerald', 'crepe']
  },
  {
    id: 'ganesh-sharad',
    name: 'Ganesh Utsav & Sharad Navratri 2027',
    shortName: 'Ganesh Utsav',
    icon: '🪷',
    startDate: '2027-08-26',
    endDate: '2027-10-20',
    peakDate: '2027-09-14',
    greeting: '🪷 Ganesh Utsav & Sharad Festive Edit • Auspicious Silk Couture',
    tagline: 'Welcome divine joy and prosperity draped in pure Banarasi zari weaves and authentic royal couture.',
    stylingNote: 'Recommended: Banarasi Katan Silk Sarees, Flared Anarkalis & Festive Poshak',
    accentColor: '#6e1124',
    badgeText: 'Festive Special',
    suggestedCategories: ['Sarees', 'Suits', 'Poshak'],
    recommendedFabrics: ['Pure Katan Silk', 'Pure Chanderi Silk & Organza'],
    recommendedOccasions: ['Festive', 'Bridal & Grand Reception'],
    keywords: ['silk', 'katan', 'anarkali', 'gold', 'crimson']
  }
];

const FestivalEngine = {
  activeFestivalId: null,

  /**
   * Automatically determines the active or upcoming festival based on current date.
   */
  getActiveFestival(customDate = null) {
    const today = customDate ? new Date(customDate) : new Date();
    const todayStr = today.toISOString().slice(0, 10);

    // 1. Check if today falls directly inside a festival window [startDate, endDate]
    for (const fest of FESTIVAL_CALENDAR) {
      if (todayStr >= fest.startDate && todayStr <= fest.endDate) {
        return fest;
      }
    }

    // 2. Otherwise find the closest upcoming festival in the future
    let closest = null;
    let minDiff = Infinity;

    for (const fest of FESTIVAL_CALENDAR) {
      const diff = new Date(fest.startDate) - today;
      if (diff > 0 && diff < minDiff) {
        minDiff = diff;
        closest = fest;
      }
    }

    // 3. Fallback to default festival if past calendar or future
    return closest || FESTIVAL_CALENDAR[0];
  },

  getAllFestivals() {
    return FESTIVAL_CALENDAR;
  },

  getFestivalById(id) {
    return FESTIVAL_CALENDAR.find(f => f.id === id) || this.getActiveFestival();
  },

  /**
   * Scores and returns products that match the festival requirements.
   */
  getSuggestedProducts(festival, allProducts) {
    if (!festival || !Array.isArray(allProducts)) return allProducts;

    const scored = allProducts.map(p => {
      let score = 0;
      // Category match
      if (festival.suggestedCategories.includes(p.category)) score += 3;

      // Occasion match
      if (p.occasion && festival.recommendedOccasions.some(occ => p.occasion.toLowerCase().includes(occ.toLowerCase()))) {
        score += 4;
      }

      // Fabric match
      if (p.fabric && festival.recommendedFabrics.some(fab => p.fabric.toLowerCase().includes(fab.toLowerCase()))) {
        score += 3;
      }

      // Keyword match
      if (festival.keywords) {
        const textBlob = `${p.name} ${p.colour} ${p.description}`.toLowerCase();
        for (const kw of festival.keywords) {
          if (textBlob.includes(kw)) score += 2;
        }
      }

      // Featured bonus
      if (p.featured) score += 1;

      return { product: p, score };
    });

    // Sort descending by score
    scored.sort((a, b) => b.score - a.score);
    return scored.map(item => item.product);
  },

  /**
   * Formats a countdown or active status relative to today.
   */
  getStatusLabel(festival, customDate = null) {
    const today = customDate ? new Date(customDate) : new Date();
    const todayStr = today.toISOString().slice(0, 10);

    if (todayStr >= festival.startDate && todayStr <= festival.endDate) {
      return { status: 'LIVE NOW', class: 'status-live', text: `${festival.icon} Active Festive Celebration` };
    }

    const start = new Date(festival.startDate);
    const diffTime = start - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      return { status: 'UPCOMING', class: 'status-upcoming', text: `Begins in ${diffDays} Days` };
    }

    return { status: 'CELEBRATING', class: 'status-live', text: `Special Festive Curation` };
  }
};
