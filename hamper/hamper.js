/* ==========================================================================
   hamper.js v2 — TheBizGift Hamper Detail Page
   Premium editorial B2B product page
   ========================================================================== */

(function () {
  'use strict';

  /* -----------------------------------------------------------------------
     CONFIG
     ----------------------------------------------------------------------- */
  // Use mock data only during local development; production hits the live API.
  const IS_LOCAL = ['localhost', '127.0.0.1', '0.0.0.0', ''].indexOf(window.location.hostname) !== -1 ||
                   window.location.protocol === 'file:';

  const CONFIG = {
    USE_MOCK: IS_LOCAL, // Airtable is live in production; localhost still uses mock data
    API_ENDPOINT: '/api/get-hamper',
    WHATSAPP_NUMBER: '917303700929',
    SKELETON_DELAY: 400,
    STAGGER_DELAY: 100,
    GALLERY_INTERVAL: 5000,
    FALLBACK_IMAGE: '/image/placeholder.svg'
  };

  /* -----------------------------------------------------------------------
     MOCK DATA — Full design preview without Airtable
     ----------------------------------------------------------------------- */
  const MOCK_PRODUCT = {
    slug: 'cc-hamper',
    name: 'The CC Hamper',
    description: 'A thoughtfully curated coffee experience designed for employee appreciation, client gifting and meaningful moments of connection.',
    seoTitle: 'The CC Hamper | The Biz Gift',
    seoDescription: 'A thoughtfully curated coffee experience designed for employee appreciation, client gifting and meaningful moments of connection.',
    productCode: 'TBG-COMBO-61',
    productType: 'Premium',
    // A product can belong to multiple Categories/Collections/Occasions at
    // once — matches the real API shape (arrays of {name, slug, image}).
    categories: [
      { name: 'Combo', slug: 'combo', image: null }
    ],
    subCategory: 'Coffee & Calm',
    collections: [
      { name: 'Premium Picks', slug: 'premium-picks', image: null }
    ],
    usp: 'Hand-curated with artisanal coffee blends. Every hamper is custom-branded and delivered in premium rigid-box packaging across India.',
    occasions: [
      { name: 'Employee Joining Kits', slug: 'employee-joining-kits', image: null },
      { name: 'Client Appreciation Gifts', slug: 'client-appreciation-gifts', image: null },
      { name: 'Festive Gifting', slug: 'festive-gifting', image: null }
    ],
    productTags: ['Employee Gifting', 'Client Appreciation', 'Premium Picks', 'Eco Friendly'],
    images: [
      { url: '/image/BCC Hamper 2.png', alt: 'The CC Hamper — Hero view' },
      { url: '/image/BCC Hamper.png', alt: 'The CC Hamper — Detail view' },
      { url: '/image/Hamper 3.png', alt: 'The CC Hamper — Packaging view' },
      { url: '/image/Gemini_Generated_Image_dd7nyydd7nyydd7n.png', alt: 'The CC Hamper — Lifestyle view' }
    ],
    moq: '50 Units',
    material: 'Premium Kraft, Velvet Lining',
    leadTime: '7–14 Business Days',
    delivery: 'Pan India',
    packaging: 'Rigid Gift Box',
    branding: [
      { name: 'Logo Branding', description: 'Precision logo placement on packaging and products.', image: '/image/Gemini_Generated_Image_6tj4v76tj4v76tj4.png' },
      { name: 'Laser Engraving', description: 'Permanent premium finish on wooden and metal surfaces.', image: '/image/Gemini_Generated_Image_70tv9o70tv9o70tv.png' },
      { name: 'Screen Printing', description: 'Ideal for high-volume gifting with consistent results.', image: '/image/Gemini_Generated_Image_ate3jcate3jcate3.png' },
      { name: 'Custom Inserts', description: 'Welcome letters, guides and campaign collateral.', image: '/image/Gemini_Generated_Image_bemqj4bemqj4bemq.png' },
      { name: 'Corporate Colour Matching', description: 'Packaging aligned to your brand identity.', image: '/image/Gemini_Generated_Image_dpv57edpv57edpv5.png' },
      { name: 'Gift Notes', description: 'Personalised messages that add a human touch.', image: '/image/BCC Hamper 2.png' },
      { name: 'Ribbon Colours', description: 'Custom ribbon colours to match your brand palette.', image: '/image/Gemini_Generated_Image_dd7nyydd7nyydd7n.png' }
    ],
    related: [
      {
        name: 'Executive Welcome Kit',
        slug: 'executive-welcome-kit',
        image: '/image/BCC Hamper.png',
        description: 'A premium onboarding experience for new leadership hires.',
        collections: [{ name: 'Premium Picks', slug: 'premium-picks', image: null }],
        moq: '50 Boxes'
      },
      {
        name: 'Coffee & Calm',
        slug: 'coffee-calm',
        image: '/image/Gemini_Generated_Image_70tv9o70tv9o70tv.png',
        description: 'Mindful gifting for wellness-focused corporate programs.',
        collections: [{ name: 'Sustainable Choices', slug: 'sustainable-choices', image: null }],
        moq: '25 Boxes'
      },
      {
        name: 'Heritage Box',
        slug: 'heritage-box',
        image: '/image/Hamper 3.png',
        description: 'Artisanal selection celebrating craft and tradition.',
        collections: [{ name: 'Staff Favorites', slug: 'staff-favorites', image: null }],
        moq: '25 Boxes'
      },
      {
        name: 'Festive Celebration Box',
        slug: 'festive-celebration-box',
        image: '/image/Gemini_Generated_Image_dd7nyydd7nyydd7n.png',
        description: 'Diwali and festive season gifting at scale.',
        collections: [{ name: 'Trending Products', slug: 'trending-products', image: null }],
        moq: '50 Boxes'
      }
    ],
    responseTime: 'Within 4 hours during business hours.',
    productionWorkflow: 'Artwork approval → Production → Quality check → Dispatch → Tracking shared'
  };

  const MOCK_PRODUCTS = {
    'cc-hamper': MOCK_PRODUCT,
    'executive-welcome-kit': Object.assign({}, MOCK_PRODUCT, {
      slug: 'executive-welcome-kit',
      name: 'Executive Welcome Kit',
      description: 'A polished onboarding kit for leadership hires and senior teams, built around premium workspace essentials and refined branded presentation.',
      seoTitle: 'Executive Welcome Kit | The Biz Gift',
      seoDescription: 'Premium executive onboarding kits with branding, packaging and pan India delivery.',
      subCategory: 'Executive Onboarding',
      collections: [{ name: 'Premium Picks', slug: 'premium-picks', image: null }],
      usp: 'Designed for high-touch onboarding moments with executive stationery, drinkware and premium packaging tailored to your brand.',
      images: [
        { url: '/image/BCC Hamper.png', alt: 'Executive Welcome Kit — Hero view' },
        { url: '/image/BCC Hamper 2.png', alt: 'Executive Welcome Kit — Packaging view' },
        { url: '/image/Gemini_Generated_Image_6tj4v76tj4v76tj4.png', alt: 'Executive Welcome Kit — Branding detail' }
      ]
    }),
    'premium-desk-set': Object.assign({}, MOCK_PRODUCT, {
      slug: 'premium-desk-set',
      name: 'Premium Desk Set',
      description: 'A practical workspace gifting set for employees, clients and event attendees who value everyday utility.',
      seoTitle: 'Premium Desk Set | The Biz Gift',
      seoDescription: 'Corporate desk sets with branded workplace essentials and custom packaging.',
      subCategory: 'Office Essentials',
      collections: [{ name: 'Best Sellers', slug: 'best-sellers', image: null }],
      usp: 'A useful desk-first gift experience with easy logo branding and flexible item combinations for bulk programs.',
      images: [
        { url: '/image/Bottle Hamper.png', alt: 'Premium Desk Set — Hero view' },
        { url: '/image/Hamper 3.png', alt: 'Premium Desk Set — Detail view' },
        { url: '/image/Gemini_Generated_Image_6tj4v76tj4v76tj4.png', alt: 'Premium Desk Set — Branding detail' }
      ]
    }),
    'coffee-calm': Object.assign({}, MOCK_PRODUCT, {
      slug: 'coffee-calm',
      name: 'Coffee & Calm',
      description: 'A warm, thoughtful hamper built around coffee, comfort and a slower moment in the middle of a busy workday.',
      seoTitle: 'Coffee & Calm | The Biz Gift',
      seoDescription: 'Coffee and wellness corporate hampers for employee appreciation and client gifting.',
      subCategory: 'Wellness & Coffee',
      collections: [{ name: 'Sustainable Choices', slug: 'sustainable-choices', image: null }],
      usp: 'Pairs premium coffee cues with relaxing add-ons and brandable packaging for calm, memorable gifting.',
      images: [
        { url: '/image/BCC Hamper 2.png', alt: 'Coffee & Calm — Hero view' },
        { url: '/image/Gemini_Generated_Image_70tv9o70tv9o70tv.png', alt: 'Coffee & Calm — Packaging view' },
        { url: '/image/Self Care Hamper V2.png', alt: 'Coffee & Calm — Wellness detail' }
      ]
    }),
    'heritage-box': Object.assign({}, MOCK_PRODUCT, {
      slug: 'heritage-box',
      name: 'Heritage Box',
      description: 'An artisanal corporate gift box with a crafted, festive feel for clients, partners and seasonal campaigns.',
      seoTitle: 'Heritage Box | The Biz Gift',
      seoDescription: 'Artisanal heritage gift boxes for festive corporate gifting and client appreciation.',
      subCategory: 'Artisan Gifting',
      collections: [{ name: 'Staff Favorites', slug: 'staff-favorites', image: null }],
      usp: 'A tactile festive presentation with craft-led packaging, inserts and flexible product curation.',
      images: [
        { url: '/image/Hamper 3.png', alt: 'Heritage Box — Hero view' },
        { url: '/image/Gemini_Generated_Image_dd7nyydd7nyydd7n.png', alt: 'Heritage Box — Festive detail' },
        { url: '/image/BCC Hamper.png', alt: 'Heritage Box — Packaging view' }
      ]
    }),
    'festive-celebration-box': Object.assign({}, MOCK_PRODUCT, {
      slug: 'festive-celebration-box',
      name: 'Festive Celebration Box',
      description: 'A festive gifting experience for Diwali, Christmas and seasonal campaigns, designed for branded bulk delivery.',
      seoTitle: 'Festive Celebration Box | The Biz Gift',
      seoDescription: 'Festive corporate hampers for Diwali, Christmas and seasonal employee or client gifting.',
      subCategory: 'Festive Gifting',
      collections: [{ name: 'Trending Products', slug: 'trending-products', image: null }],
      usp: 'Built for seasonal scale with custom sleeves, cards, inserts and pan India logistics support.',
      images: [
        { url: '/image/Gemini_Generated_Image_dd7nyydd7nyydd7n.png', alt: 'Festive Celebration Box — Hero view' },
        { url: '/image/BCC Hamper 2.png', alt: 'Festive Celebration Box — Packaging view' },
        { url: '/image/Gemini_Generated_Image_sx0cy0sx0cy0sx0c.png', alt: 'Festive Celebration Box — Detail view' }
      ]
    })
  };

  /* -----------------------------------------------------------------------
     STATE
     ----------------------------------------------------------------------- */
  let product = null;
  let currentGalleryIndex = 0;
  let galleryTimer = null;

  /* -----------------------------------------------------------------------
     DOM HELPERS
     ----------------------------------------------------------------------- */
  let $ = (sel, ctx) => (ctx || document).querySelector(sel);
  let $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  function escapeHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function getSlug() {
    var path = window.location.pathname;
    var parts = path.split('/').filter(Boolean);
    return parts[parts.length - 1] || '';
  }

  // A product can carry multiple Categories/Collections/Occasions (Airtable's
  // linked-record fields are many-to-many); this returns the primary (first)
  // entry for spots that show one, e.g. the breadcrumb trail.
  function firstOf(arr) {
    return (arr && arr.length > 0) ? arr[0] : null;
  }

  // Shared icon set for the hero's quick-info row (MOQ/Branding/Delivery/etc.)
  var QUICK_INFO_ICONS = {
    'MOQ': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>',
    'Branding': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    'Delivery': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>',
    'Lead Time': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    'Product Code': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>'
  };

  // Icon set for hero product-tag chips (Sustainable / Eco Friendly / Branding
  // Possible etc.) — matched by keyword, falling back to a generic tag icon.
  var TAG_ICONS = {
    'sustainable': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    'eco': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M11 20A7 7 0 019.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 11 13 11 11"/></svg>',
    'branding': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.59 13.41 11 3.83A2 2 0 0 0 9.59 3.2H4a1 1 0 0 0-1 1v5.59a2 2 0 0 0 .59 1.41l9.58 9.59a2 2 0 0 0 2.83 0l4.59-4.59a2 2 0 0 0 0-2.83z"/><circle cx="7.5" cy="7.5" r="1.5"/></svg>',
    'premium': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2l8 4v6c0 5-4 9-8 10-4-1-8-5-8-10V6l8-4z"/></svg>',
    'client': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    'employee': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>',
    'default': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.59 13.41 11 3.83A2 2 0 0 0 9.59 3.2H4a1 1 0 0 0-1 1v5.59a2 2 0 0 0 .59 1.41l9.58 9.59a2 2 0 0 0 2.83 0l4.59-4.59a2 2 0 0 0 0-2.83z"/><circle cx="7.5" cy="7.5" r="1.5"/></svg>'
  };

  function getTagIcon(tag) {
    if (!tag) return TAG_ICONS.default;
    var lower = tag.toLowerCase();
    for (var key in TAG_ICONS) {
      if (key !== 'default' && lower.indexOf(key) !== -1) return TAG_ICONS[key];
    }
    return TAG_ICONS.default;
  }

  /* -----------------------------------------------------------------------
     FETCH PRODUCT
     ----------------------------------------------------------------------- */
  function getMockProduct() {
    return MOCK_PRODUCTS[getSlug()] || MOCK_PRODUCT;
  }

  function fetchProduct() {
    return new Promise(function (resolve, reject) {
      if (CONFIG.USE_MOCK) {
        setTimeout(function () { resolve(getMockProduct()); }, CONFIG.SKELETON_DELAY);
        return;
      }

      var slug = getSlug();
      if (!slug) { reject(new Error('No product slug found in URL')); return; }

      var xhr = new XMLHttpRequest();
      xhr.open('GET', CONFIG.API_ENDPOINT + '?slug=' + encodeURIComponent(slug), true);
      xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
          try { resolve(JSON.parse(xhr.responseText)); }
          catch (e) { resolve(getMockProduct()); }
        } else {
          resolve(getMockProduct());
        }
      };
      xhr.onerror = function () { resolve(getMockProduct()); };
      xhr.send();
    });
  }

  /* -----------------------------------------------------------------------
     RENDER
     ----------------------------------------------------------------------- */
  function render(productData) {
    product = productData;

    // SEO
    if (product.seoTitle) document.title = product.seoTitle;
    var seoMeta = document.querySelector('meta[name="description"]');
    if (seoMeta && product.seoDescription) seoMeta.setAttribute('content', product.seoDescription);

    var container = document.getElementById('hamper-content');
    if (!container) return;

    // Remove skeleton
    var skeleton = document.getElementById('hamper-skeleton');
    if (skeleton) skeleton.remove();

    var html = '';

    // 02 Hero
    html += buildHero(product);

    // 03 Product Introduction (pure typography)
    html += buildIntroduction(product);

    // 04 Planning Information (Apple-style spec panel)
    html += buildPlanning(product);

    // 05 Perfect For (occasion cards + collection cards)
    if ((product.occasions && product.occasions.length > 0) || (product.collections && product.collections.length > 0)) {
      html += buildPerfectFor(product);
    }

    // 06 Make It Yours (horizontal scroll gallery)
    if (product.branding && product.branding.length > 0) {
      html += buildMakeYours(product);
    }

    // 08 Related Hampers
    if (product.related && product.related.length > 0) {
      html += buildRelated(product);
    }

    // 09 Proposal / Customisation (merged split layout)
    html += buildProposalSection(product);

    container.innerHTML = html;

    // Init interactions
    initGallery();
    initLightbox();
    initScrollReveal();
    initStickyCTA();
    initForm();
    initImageFade();
    initMakeYoursScroll();
    initConnectPopup();
  }

  /* -----------------------------------------------------------------------
     SECTION BUILDERS
     ----------------------------------------------------------------------- */

  // --- 02 Hero ---
  function buildHero(p) {
    var chips = (p.productTags || []).map(function (t) {
      return '<a href="/explore/" class="hamper-hero-chip"><span class="chip-icon">' + getTagIcon(t) + '</span>' + escapeHtml(t) + '</a>';
    }).join('');

    var images = p.images || [];
    var galleryHtml = '';
    var navDots = '';
    var counter = '';

    if (images.length > 0) {
      images.forEach(function (img, i) {
        galleryHtml += '<img class="hamper-gallery-image' + (i === 0 ? ' active' : '') + '" ' +
          'src="' + img.url + '" alt="' + escapeHtml(img.alt || p.name) + '" ' +
          'data-index="' + i + '" loading="' + (i === 0 ? 'eager' : 'lazy') + '">';
      });

      navDots = '<div class="hamper-gallery-nav">' +
        images.map(function (_, i) {
          return '<button class="hamper-gallery-dot' + (i === 0 ? ' active' : '') + '" data-index="' + i + '" aria-label="View image ' + (i + 1) + '"></button>';
        }).join('') +
        '</div>';

      if (images.length > 1) {
        counter = '<div class="hamper-gallery-counter">1 / ' + images.length + '</div>';
      }
    } else {
      galleryHtml = '<img class="hamper-gallery-image active" src="' + CONFIG.FALLBACK_IMAGE + '" alt="' + escapeHtml(p.name) + '">';
    }

    var arrows = images.length > 1
      ? '<div class="hamper-gallery-arrows">' +
          '<button class="hamper-gallery-arrow gallery-prev" aria-label="Previous image">‹</button>' +
          '<button class="hamper-gallery-arrow gallery-next" aria-label="Next image">›</button>' +
        '</div>'
      : '';

    // A product can belong to multiple Collections at once — show all of them
    // as badges, not just one.
    var collectionBadges = (p.collections || []).map(function (c) {
      return '<a href="/explore/#' + escapeHtml(c.slug || '') + '" class="hamper-collection-badge">' + escapeHtml(c.name) + '</a>';
    }).join('');

    return (
      '<section class="hamper-hero" aria-label="Product Overview">' +
        '<div class="hamper-hero-container">' +
          '<div class="hamper-gallery" tabindex="0" role="img" aria-label="Product image gallery">' +
            '<div class="hamper-gallery-main">' + galleryHtml + '</div>' +
            counter +
            arrows +
            navDots +
          '</div>' +
          '<div class="hamper-hero-content">' +
            (collectionBadges ? '<div class="hamper-collection-badges">' + collectionBadges + '</div>' : '') +
            '<h1>' + escapeHtml(p.name) + '</h1>' +
            '<p class="hamper-hero-description">' + escapeHtml(p.description) + '</p>' +
            (chips ? '<div class="hamper-hero-chips">' + chips + '</div>' : '') +
            '<div class="hamper-hero-actions">' +
              '<a href="#hamper-proposal" class="btn-action btn-primary">Request Proposal <span class="btn-arrow">→</span></a>' +
              '<a href="https://wa.me/' + CONFIG.WHATSAPP_NUMBER + '?text=Hi%20The%20Biz%20Gift%20team%2C%20I%20am%20interested%20in%20' + encodeURIComponent(p.name) + '" class="btn-action btn-secondary" target="_blank" rel="noopener">WhatsApp Us <span class="btn-arrow">→</span></a>' +
            '</div>' +
            '<div class="hamper-quick-info">' +
              '<div class="hamper-info-item">' +
                '<span class="hamper-info-icon">' + QUICK_INFO_ICONS['MOQ'] + '</span>' +
                '<span class="hamper-info-text"><span class="hamper-info-label">MOQ</span>' +
                '<span class="hamper-info-value">' + escapeHtml(p.moq || 'Contact Us') + '</span></span>' +
              '</div>' +
              '<div class="hamper-info-item">' +
                '<span class="hamper-info-icon">' + QUICK_INFO_ICONS['Branding'] + '</span>' +
                '<span class="hamper-info-text"><span class="hamper-info-label">Branding</span>' +
                '<span class="hamper-info-value">' + ((p.branding && p.branding.length > 0) ? 'Available' : 'Not Available') + '</span></span>' +
              '</div>' +
              '<div class="hamper-info-item">' +
                '<span class="hamper-info-icon">' + QUICK_INFO_ICONS['Delivery'] + '</span>' +
                '<span class="hamper-info-text"><span class="hamper-info-label">Delivery</span>' +
                '<span class="hamper-info-value">' + escapeHtml(p.delivery || 'Pan India') + '</span></span>' +
              '</div>' +
              '<div class="hamper-info-item">' +
                '<span class="hamper-info-icon">' + QUICK_INFO_ICONS['Lead Time'] + '</span>' +
                '<span class="hamper-info-text"><span class="hamper-info-label">Lead Time</span>' +
                '<span class="hamper-info-value">' + escapeHtml(p.leadTime || '7–14 Days') + '</span></span>' +
              '</div>' +
              (p.productCode ? (
              '<div class="hamper-info-item">' +
                '<span class="hamper-info-icon">' + QUICK_INFO_ICONS['Product Code'] + '</span>' +
                '<span class="hamper-info-text"><span class="hamper-info-label">Product Code</span>' +
                '<span class="hamper-info-value">' + escapeHtml(p.productCode) + '</span></span>' +
              '</div>') : '') +
            '</div>' +
          '</div>' +
        '</div>' +
      '</section>'
    );
  }

  // --- 03 Product Introduction (Split layout with image) ---
  function buildIntroduction(p) {
    var heroImg = (p.images && p.images.length > 1) ? p.images[1].url : CONFIG.FALLBACK_IMAGE;
    var heroAlt = (p.images && p.images.length > 1) ? p.images[1].alt : p.name;
    return (
      '<section class="hamper-introduction hamper-reveal" aria-label="About this hamper">' +
        '<div class="hamper-introduction-layout">' +
          '<div class="hamper-introduction-content">' +
            '<span class="hamper-intro-eyebrow">About This Hamper</span>' +
            '<h2>' + escapeHtml(p.name) + '</h2>' +
            '<p class="intro-description">' + escapeHtml(p.description) + '</p>' +
            (p.usp ? '<p class="intro-usp">' + escapeHtml(p.usp) + '</p>' : '') +
            '<a href="#hamper-proposal" class="btn-action btn-primary">Request Proposal →</a>' +
          '</div>' +
          '<div class="hamper-introduction-image">' +
            '<img src="' + heroImg + '" alt="' + escapeHtml(heroAlt) + '" loading="lazy">' +
          '</div>' +
        '</div>' +
      '</section>'
    );
  }

  // --- 04 Planning Information (Icon-row spec panel) ---
  function buildPlanning(p) {
    var iconSvgs = {
      'MOQ': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>',
      'Lead Time': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
      'Branding': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
      'Packaging': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/></svg>',
      'Delivery': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>',
      'Material': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 22l10-10M16 8l-4 4M22 2l-6 6"/><path d="M15 2H22V9"/></svg>',
      'Response Time': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
    };
    var defaultIcon = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';

    var specs = [
      { label: 'MOQ', value: p.moq || 'Contact Us' },
      { label: 'Branding', value: (p.branding && p.branding.length > 0) ? p.branding.map(function (b) { return b.name; }).join(', ') : 'Not Available' },
      { label: 'Packaging', value: p.packaging || 'Premium Rigid Gift Box' },
      { label: 'Delivery', value: p.delivery || 'Pan India' }
    ];
    if (p.material) specs.push({ label: 'Material', value: p.material });
    if (p.productType) specs.push({ label: 'Product Type', value: p.productType });
    if (p.responseTime) specs.push({ label: 'Response Time', value: p.responseTime });

    var rows = specs.map(function (spec) {
      return (
        '<div class="hamper-planning-row">' +
          '<div class="hamper-planning-row-icon">' + (iconSvgs[spec.label] || defaultIcon) + '</div>' +
          '<span class="hamper-planning-row-label">' + escapeHtml(spec.label) + '</span>' +
          '<span class="hamper-planning-row-value">' + escapeHtml(spec.value) + '</span>' +
        '</div>'
      );
    }).join('');

    return (
      '<section class="hamper-planning hamper-reveal" aria-label="Planning Information">' +
        '<div class="hamper-planning-container">' +
          '<div class="hamper-planning-layout">' +
            '<div class="hamper-planning-editorial">' +
              '<span class="hamper-planning-eyebrow">Planning Information</span>' +
              '<h2>Ready To Order?</h2>' +
              '<p>Everything your procurement and marketing teams need before requesting a proposal.</p>' +
              (p.productionWorkflow ? '<p class="hamper-planning-workflow">' + escapeHtml(p.productionWorkflow) + '</p>' : '') +
            '</div>' +
            '<div class="hamper-planning-specs">' + rows + '</div>' +
          '</div>' +
        '</div>' +
      '</section>'
    );
  }

  // --- 05 Perfect For (occasion cards + collection cards, left-aligned) ---
  var PERFECT_ARROW = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  function buildPerfectFor(p) {
    // Occasion/collection images are expected at /image/occasion/<slug>.png
    // and /image/collection/<slug>.png respectively (falls back to the
    // shared placeholder if a given slug's image hasn't been supplied yet).
    function cardsFor(items, imageBase, linkBuilder) {
      return (items || []).map(function (item) {
        var img = item.image || (imageBase + encodeURIComponent(item.slug || '') + '.png');
        return (
          '<a href="' + linkBuilder(item) + '" class="hamper-perfect-card-overlay">' +
            '<img class="hamper-perfect-card-overlay-img" src="' + img + '" alt="' + escapeHtml(item.name) + '" loading="lazy" onerror="this.onerror=null;this.src=\'' + CONFIG.FALLBACK_IMAGE + '\'">' +
            '<span class="hamper-perfect-card-overlay-title">' + escapeHtml(item.name) + '</span>' +
            '<span class="hamper-perfect-card-overlay-arrow">' + PERFECT_ARROW + '</span>' +
          '</a>'
        );
      }).join('');
    }

    // Occasion names in Airtable's Occasions table match quote.html's
    // #occasion dropdown values exactly, so no translation map is needed.
    var occasionCards = cardsFor(p.occasions, '/image/occasion/', function (occ) {
      return '/quote.html?occasion=' + encodeURIComponent(occ.name);
    });
    var collectionCards = cardsFor(p.collections, '/image/collection/', function (col) {
      return '/explore/#' + encodeURIComponent(col.slug || '');
    });

    var groups = '';
    if (occasionCards) {
      groups += (
        '<div class="hamper-perfect-group">' +
          '<h3 class="hamper-perfect-group-title">Occasions</h3>' +
          '<div class="hamper-perfect-cards">' + occasionCards + '</div>' +
        '</div>'
      );
    }
    if (collectionCards) {
      groups += (
        '<div class="hamper-perfect-group">' +
          '<h3 class="hamper-perfect-group-title">Collections</h3>' +
          '<div class="hamper-perfect-cards">' + collectionCards + '</div>' +
        '</div>'
      );
    }

    return (
      '<section class="hamper-perfect hamper-reveal" aria-label="Perfect For">' +
        '<div class="container">' +
          '<div class="section-header">' +
            '<h2>Perfect For</h2>' +
            '<p class="section-intro">This hamper is designed for the following gifting scenarios and collections.</p>' +
          '</div>' +
          groups +
        '</div>' +
      '</section>'
    );
  }

  // --- 06 Make It Yours (Horizontal scroll gallery) ---
  function buildMakeYours(p) {
    var items = (p.branding || []).map(function (b) {
      return (
        '<div class="hamper-make-yours-item">' +
          '<div class="hamper-make-yours-image">' +
            '<img src="' + (b.image || CONFIG.FALLBACK_IMAGE) + '" alt="' + escapeHtml(b.name) + '" loading="lazy">' +
          '</div>' +
          '<div class="hamper-make-yours-body">' +
            '<h4>' + escapeHtml(b.name) + '</h4>' +
            (b.description ? '<p>' + escapeHtml(b.description) + '</p>' : '') +
          '</div>' +
        '</div>'
      );
    }).join('');

    return (
      '<section class="hamper-make-yours hamper-reveal" aria-label="Make It Yours">' +
        '<div class="hamper-make-yours-layout">' +
          '<div class="hamper-make-yours-intro">' +
            '<span class="hamper-intro-eyebrow">Branding &amp; Personalisation</span>' +
            '<h2>Make It Yours</h2>' +
            '<p>Every gifting experience can be tailored to reflect your organisation, campaign and brand identity.</p>' +
            '<a href="#hamper-proposal" class="btn-action btn-primary">Discuss Branding →</a>' +
          '</div>' +
          '<div class="hamper-make-yours-scroll">' + items + '</div>' +
        '</div>' +
      '</section>'
    );
  }

  // --- 08 Related Hampers (styleguide.html #cards .product, exact structure) ---
  function buildRelated(p) {
    var cards = (p.related || []).map(function (r, i) {
      var relatedCollection = firstOf(r.collections);
      var sub = relatedCollection ? relatedCollection.name : (r.description || '');
      return (
        '<a href="/hamper/' + escapeHtml(r.slug) + '/" class="hamper-related-card" data-index="' + i + '">' +
          '<div class="img" style="background-image:url(\'' + (r.image || CONFIG.FALLBACK_IMAGE) + '\')">' +
            '<div class="fav" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg></div>' +
          '</div>' +
          '<div class="body">' +
            '<div class="name">' + escapeHtml(r.name) + '</div>' +
            (sub ? '<div class="sub">' + escapeHtml(sub) + '</div>' : '') +
            '<div class="row">' +
              '<span class="moq">MOQ ' + escapeHtml(r.moq || 'Contact Us') + '</span>' +
              '<div class="go"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg></div>' +
            '</div>' +
          '</div>' +
        '</a>'
      );
    }).join('');

    // .hamper-related-grid (desktop) and .hamper-related-scroll (mobile) render the
    // same cards -- CSS toggles which is visible per breakpoint, so reuse one string.
    return (
      '<section class="hamper-related hamper-reveal" aria-label="Related Hampers">' +
        '<div class="container">' +
          '<div class="hamper-related-header">' +
            '<h2>You May Also Like</h2>' +
          '</div>' +
          '<div class="hamper-related-grid">' + cards + '</div>' +
          '<div class="hamper-related-scroll">' + cards + '</div>' +
        '</div>' +
      '</section>'
    );
  }

  // --- 09 Proposal / Customisation (merged split) ---
  function buildProposalSection(p) {
    return (
      '<section class="hamper-proposal" id="hamper-proposal" aria-label="Request a Proposal">' +
        '<div class="hamper-proposal-grid">' +
          // Left: Editorial
          '<div class="hamper-proposal-editorial">' +
            '<h2>Interested in this hamper?</h2>' +
            '<p>Let\'s create a version tailored to your organisation. Our team can customise branding, packaging, inserts and quantities for your requirements.</p>' +
            '<div class="hamper-proposal-highlights">' +
              '<div class="hamper-proposal-highlight"><span class="check-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41 11 3.83A2 2 0 0 0 9.59 3.2H4a1 1 0 0 0-1 1v5.59a2 2 0 0 0 .59 1.41l9.58 9.59a2 2 0 0 0 2.83 0l4.59-4.59a2 2 0 0 0 0-2.83z"/><circle cx="7.5" cy="7.5" r="1.5"/></svg></span> Branding</div>' +
              '<div class="hamper-proposal-highlight"><span class="check-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12v9H4v-9"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/></svg></span> Packaging</div>' +
              '<div class="hamper-proposal-highlight"><span class="check-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg></span> Bulk Orders</div>' +
              '<div class="hamper-proposal-highlight"><span class="check-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/></svg></span> Dedicated Account Support</div>' +
            '</div>' +
          '</div>' +

          // Right: Form
          '<div class="hamper-proposal-form-wrapper">' +
            '<form class="hamper-proposal-form" id="proposal-form" novalidate>' +
              '<input type="hidden" name="productName" value="' + escapeHtml(p.name) + '">' +
              '<input type="hidden" name="productUrl" value="' + escapeHtml(window.location.href) + '">' +
              '<input type="hidden" name="collectionName" value="' + escapeHtml((p.collections || []).map(function (c) { return c.name; }).join(', ')) + '">' +
              '<input type="hidden" name="category" value="' + escapeHtml((p.categories || []).map(function (c) { return c.name; }).join(', ')) + '">' +
              '<input type="hidden" name="occasion" value="' + escapeHtml((p.occasions || []).map(function (o) { return o.name; }).join(', ')) + '">' +
              '<input type="hidden" name="productCode" value="' + escapeHtml(p.productCode || '') + '">' +
              '<input type="hidden" name="productId" value="' + escapeHtml(p.slug) + '">' +

              '<div class="hamper-proposal-error" id="form-error"></div>' +

              '<div class="form-row">' +
                '<div class="form-group">' +
                  '<label for="field-name">Name *</label>' +
                  '<input type="text" id="field-name" name="name" required placeholder="Your full name">' +
                  '<span class="field-error" id="error-name">Please enter your name</span>' +
                '</div>' +
                '<div class="form-group">' +
                  '<label for="field-company">Company *</label>' +
                  '<input type="text" id="field-company" name="company" required placeholder="Company name">' +
                  '<span class="field-error" id="error-company">Please enter your company name</span>' +
                '</div>' +
              '</div>' +

              '<div class="form-row">' +
                '<div class="form-group">' +
                  '<label for="field-email">Email *</label>' +
                  '<input type="email" id="field-email" name="email" required placeholder="your@email.com">' +
                  '<span class="field-error" id="error-email">Please enter a valid email</span>' +
                '</div>' +
                '<div class="form-group">' +
                  '<label for="field-phone">Phone</label>' +
                  '<input type="tel" id="field-phone" name="phone" placeholder="+91 99999 99999">' +
                  '<span class="field-error" id="error-phone">Please enter a valid phone number</span>' +
                '</div>' +
              '</div>' +

              '<div class="form-row">' +
                '<div class="form-group">' +
                  '<label for="field-quantity">Approximate Quantity</label>' +
                  '<input type="number" id="field-quantity" name="quantity" placeholder="e.g. 100" min="1">' +
                  '<span class="field-error" id="error-quantity">Please enter a quantity of 1 or more</span>' +
                '</div>' +
                '<div class="form-group">' +
                  '<label for="field-required-date">Required Date</label>' +
                  '<input type="text" id="field-required-date" name="requiredDate" placeholder="e.g. Dec 2024">' +
                '</div>' +
              '</div>' +

              '<div class="form-group full-width">' +
                '<label for="field-message">Message</label>' +
                '<textarea id="field-message" name="message" placeholder="Tell us about your gifting requirements, audience and any specific preferences..."></textarea>' +
              '</div>' +

              '<div class="form-submit">' +
                '<button type="submit" class="btn-submit" id="proposal-submit">' +
                  '<span class="spinner"></span>' +
                  '<span class="btn-text">Request Proposal</span>' +
                '</button>' +
              '</div>' +
            '</form>' +

            '<div class="hamper-proposal-success" id="proposal-success">' +
              '<div class="success-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>' +
              '<h3>Thank You</h3>' +
              '<p>Your proposal request has been received. Our team will review your requirements and get back to you within 4 hours during business hours. If your requirement is urgent, please reach out to us on WhatsApp.</p>' +
              '<a href="/explore/" class="btn-action btn-secondary btn-small">Explore More Hampers</a>' +
            '</div>' +

            '<div class="hamper-proposal-whatsapp">' +
              '<a href="https://wa.me/' + CONFIG.WHATSAPP_NUMBER + '?text=Hi%20The%20Biz%20Gift%20team%2C%20I%20am%20interested%20in%20' + encodeURIComponent(p.name) + '" class="btn-whatsapp-large" target="_blank" rel="noopener">' +
                '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.739-1.456L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.623-1.01-5.091-2.854-6.941C16.636 2.016 14.17 1.01 11.552 1.01 6.115 1.01 1.692 5.379 1.688 10.81c-.001 1.73.468 3.424 1.36 4.947L2.009 21.08l5.638-1.478z"/></svg>' +
                'Chat on WhatsApp' +
              '</a>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</section>'
    );
  }

  /* -----------------------------------------------------------------------
     INTERACTIONS
     ----------------------------------------------------------------------- */

  // --- Gallery Crossfade + Keyboard Nav ---
  function initGallery() {
    var images = $$('.hamper-gallery-image');
    var dots = $$('.hamper-gallery-dot');
    var counter = $('.hamper-gallery-counter');
    var prevBtn = $('.gallery-prev');
    var nextBtn = $('.gallery-next');
    var gallery = $('.hamper-gallery');
    if (images.length <= 1) return;

    function showImage(index) {
      images.forEach(function (img, i) {
        img.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
      if (counter) {
        counter.textContent = (index + 1) + ' / ' + images.length;
      }
      currentGalleryIndex = index;
    }

    function nextImage() {
      showImage((currentGalleryIndex + 1) % images.length);
    }

    function prevImage() {
      showImage((currentGalleryIndex - 1 + images.length) % images.length);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showImage(parseInt(this.getAttribute('data-index')));
        resetGalleryTimer();
      });
    });

    if (nextBtn) nextBtn.addEventListener('click', function () { nextImage(); resetGalleryTimer(); });
    if (prevBtn) prevBtn.addEventListener('click', function () { prevImage(); resetGalleryTimer(); });

    // Keyboard navigation
    gallery.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { nextImage(); resetGalleryTimer(); }
      if (e.key === 'ArrowLeft') { prevImage(); resetGalleryTimer(); }
    });

    // Auto-advance
    if (CONFIG.GALLERY_INTERVAL > 0) {
      galleryTimer = setInterval(nextImage, CONFIG.GALLERY_INTERVAL);
    }

    function resetGalleryTimer() {
      if (galleryTimer) { clearInterval(galleryTimer); galleryTimer = null; }
      if (CONFIG.GALLERY_INTERVAL > 0) {
        galleryTimer = setInterval(nextImage, CONFIG.GALLERY_INTERVAL);
      }
    }

    // Touch swipe
    var touchStart = 0;
    gallery.addEventListener('touchstart', function (e) {
      touchStart = e.touches[0].clientX;
    }, { passive: true });
    gallery.addEventListener('touchend', function (e) {
      var diff = touchStart - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) nextImage();
        else prevImage();
        resetGalleryTimer();
      }
    }, { passive: true });
  }

  // --- Lightbox ---
  function initLightbox() {
    var images = $$('.hamper-gallery-image');
    if (images.length === 0) return;

    var lightbox = document.createElement('div');
    lightbox.className = 'hamper-lightbox';
    lightbox.setAttribute('role', 'dialog');
    lightbox.setAttribute('aria-modal', 'true');
    lightbox.setAttribute('aria-label', 'Image lightbox');
    lightbox.innerHTML = '<button class="hamper-lightbox-close" aria-label="Close lightbox">✕</button><img src="" alt="">';
    document.body.appendChild(lightbox);

    var lbImg = lightbox.querySelector('img');
    var lbClose = lightbox.querySelector('.hamper-lightbox-close');

    images.forEach(function (img) {
      img.addEventListener('click', function () {
        lbImg.src = this.src;
        lbImg.alt = this.alt;
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    });

    function closeLightbox() {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    }

    lbClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeLightbox();
    });
  }

  // --- Scroll Reveal ---
  function initScrollReveal() {
    var elements = $$('.hamper-reveal');
    if (elements.length === 0) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    elements.forEach(function (el) { observer.observe(el); });
  }

  // --- Sticky CTA ---
  function initStickyCTA() {
    var sticky = document.getElementById('hamper-sticky-cta');
    if (!sticky) return;

    var hero = $('.hamper-hero');
    var proposal = document.getElementById('hamper-proposal');
    if (!hero || !proposal) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.target === hero) {
          if (!entry.isIntersecting) {
            sticky.classList.add('visible');
            sticky.classList.remove('hidden');
          } else {
            sticky.classList.remove('visible');
            sticky.classList.add('hidden');
          }
        }
        if (entry.target === proposal) {
          if (entry.isIntersecting) {
            sticky.classList.remove('visible');
            sticky.classList.add('hidden');
          } else {
            var heroRect = hero.getBoundingClientRect();
            if (heroRect.bottom < 0) {
              sticky.classList.add('visible');
              sticky.classList.remove('hidden');
            }
          }
        }
      });
    }, { threshold: 0, rootMargin: '0px' });

    observer.observe(hero);
    observer.observe(proposal);
  }

  // --- Proposal Form ---
  function initForm() {
    var form = document.getElementById('proposal-form');
    if (!form) return;

    var submitBtn = document.getElementById('proposal-submit');
    var errorBanner = document.getElementById('form-error');
    var successPanel = document.getElementById('proposal-success');

    function getField(id) { return document.getElementById(id); }

    function validateField(id, errorId, validator) {
      var field = getField(id);
      var error = getField(errorId);
      if (!field || !error) return true;

      var valid = validator ? validator(field.value) : field.value.trim().length > 0;
      field.classList.toggle('error', !valid);
      error.classList.toggle('visible', !valid);
      return valid;
    }

    // Shared per-field validators — same rules used on blur/input and on submit.
    var VALIDATORS = {
      'field-name': { errorId: 'error-name', validator: function (v) { return v.trim().length > 0; } },
      'field-company': { errorId: 'error-company', validator: function (v) { return v.trim().length > 0; } },
      'field-email': { errorId: 'error-email', validator: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); } },
      'field-phone': { errorId: 'error-phone', validator: function (v) { return v.trim().length === 0 || /^[+]?[\d\s()-]{7,}$/.test(v); } },
      'field-quantity': { errorId: 'error-quantity', validator: function (v) { return v.trim().length === 0 || Number(v) >= 1; } }
    };

    function validateAll() {
      var valid = true;
      Object.keys(VALIDATORS).forEach(function (id) {
        var rule = VALIDATORS[id];
        valid = validateField(id, rule.errorId, rule.validator) && valid;
      });
      return valid;
    }

    Object.keys(VALIDATORS).forEach(function (id) {
      var field = getField(id);
      if (!field) return;
      var rule = VALIDATORS[id];
      field.addEventListener('blur', function () {
        validateField(id, rule.errorId, rule.validator);
      });
      field.addEventListener('input', function () {
        if (field.classList.contains('error')) validateField(id, rule.errorId, rule.validator);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      errorBanner.classList.remove('visible');
      errorBanner.textContent = '';

      if (!validateAll()) {
        var firstError = form.querySelector('.error');
        if (firstError) firstError.focus();
        return;
      }

      submitBtn.disabled = true;
      submitBtn.classList.add('loading');
      submitBtn.querySelector('.btn-text').textContent = 'Submitting...';

      if (window.dataLayer) {
        window.dataLayer.push({
          event: 'proposal_submit',
          product: product ? product.name : 'Unknown'
        });
      }

      var formData = new FormData(form);
      var payload = { type: 'proposal' };
      formData.forEach(function (value, key) { payload[key] = value; });

      if (CONFIG.USE_MOCK) {
        setTimeout(function () {
          submitBtn.disabled = false;
          submitBtn.classList.remove('loading');
          submitBtn.querySelector('.btn-text').textContent = 'Request Proposal';
          form.style.display = 'none';
          successPanel.classList.add('visible');
        }, 1500);
      } else {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/submit-lead', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onload = function () {
          submitBtn.disabled = false;
          submitBtn.classList.remove('loading');
          submitBtn.querySelector('.btn-text').textContent = 'Request Proposal';
          if (xhr.status >= 200 && xhr.status < 300) {
            form.style.display = 'none';
            successPanel.classList.add('visible');
          } else {
            errorBanner.textContent = 'Something went wrong. Please try again or reach out on WhatsApp.';
            errorBanner.classList.add('visible');
          }
        };
        xhr.onerror = function () {
          submitBtn.disabled = false;
          submitBtn.classList.remove('loading');
          submitBtn.querySelector('.btn-text').textContent = 'Request Proposal';
          errorBanner.textContent = 'Network error. Please check your connection or reach out on WhatsApp.';
          errorBanner.classList.add('visible');
        };
        xhr.send(JSON.stringify(payload));
      }
    });
  }

  // --- Image Progressive Fade ---
  function initImageFade() {
    var imgs = $$('.hamper-make-yours-image img');
    imgs.forEach(function (img) {
      if (img.complete) {
        img.style.opacity = '1';
      } else {
        img.style.opacity = '0';
        img.addEventListener('load', function () {
          this.style.transition = 'opacity 0.4s ease';
          this.style.opacity = '1';
        });
        img.addEventListener('error', function () {
          this.src = CONFIG.FALLBACK_IMAGE;
          this.style.opacity = '1';
        });
      }
    });
  }

  // --- Make Yours horizontal scroll (keyboard + drag enhancement) ---
  function initMakeYoursScroll() {
    var scrollContainer = $('.hamper-make-yours-scroll');
    if (!scrollContainer) return;

    // Keyboard arrow navigation within the scroll area
    scrollContainer.setAttribute('tabindex', '0');
    scrollContainer.setAttribute('role', 'region');
    scrollContainer.setAttribute('aria-label', 'Branding options gallery');

    scrollContainer.addEventListener('keydown', function (e) {
      var scrollAmount = 340;
      if (e.key === 'ArrowRight') {
        this.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
      if (e.key === 'ArrowLeft') {
        this.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      }
    });

    // Related scroll on mobile
    var relatedScroll = $('.hamper-related-scroll');
    if (relatedScroll) {
      relatedScroll.setAttribute('tabindex', '0');
      relatedScroll.setAttribute('role', 'region');
      relatedScroll.setAttribute('aria-label', 'Related hampers');
    }
  }

  // --- Connect popup: shows after a 5s dwell, capped at 3 shows per session ---
  function initConnectPopup() {
    var MAX_SHOWS = 3;
    var DWELL_MS = 5000;
    var STORAGE_KEY = 'bizgift_connect_popup_shown';

    var modal = $('#connectPopup');
    if (!modal) return;

    var shownCount = parseInt(sessionStorage.getItem(STORAGE_KEY) || '0', 10);
    if (shownCount >= MAX_SHOWS) return;

    var timer = setTimeout(function () {
      modal.hidden = false;
      document.body.classList.add('modal-open');
      sessionStorage.setItem(STORAGE_KEY, String(shownCount + 1));
    }, DWELL_MS);

    function dismiss() {
      modal.hidden = true;
      document.body.classList.remove('modal-open');
    }

    $$('[data-connect-popup-dismiss]', modal).forEach(function (el) {
      el.addEventListener('click', dismiss);
    });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) clearTimeout(timer);
    });
  }

  /* -----------------------------------------------------------------------
     BOOT
     ----------------------------------------------------------------------- */
  function boot() {
    fetchProduct().then(function (data) {
      render(data);
    }).catch(function (err) {
      console.error('Failed to load product:', err);
      var skeleton = document.getElementById('hamper-skeleton');
      if (skeleton) skeleton.remove();
      var container = document.getElementById('hamper-content');
      if (container) {
        container.innerHTML =
          '<div style="padding: 6rem 2rem; text-align: center; max-width: 600px; margin: 0 auto;">' +
            '<h2 style="font-family: var(--font-serif); font-size: 2.5rem; margin-bottom: 1rem;">Experience Unavailable</h2>' +
            '<p style="color: var(--text-muted); font-weight: 300; margin-bottom: 2rem;">This gifting experience could not be loaded. It may have been removed or is temporarily unavailable.</p>' +
            '<a href="/explore/" class="btn-action btn-primary">Explore Other Experiences</a>' +
          '</div>';
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
