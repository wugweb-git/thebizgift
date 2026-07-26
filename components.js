// html/components.js
// Runs immediately (not gated on DOMContentLoaded): this script tag sits at
// the end of <body>, so every placeholder div is already in the DOM by the
// time it executes. Waiting on DOMContentLoaded here only delayed the
// header/footer fetch by a full extra tick, causing a visible unstyled flash.

// Shared "are we on localhost / running from disk" flag. components.js loads
// before every other page script (see script tag order in each HTML file), so
// hamper.js and the inline scripts in index.html/explore/index.html/quote.html
// all read this instead of recomputing the same hostname check themselves.
window.TBG_IS_LOCAL = ['localhost', '127.0.0.1', '0.0.0.0', ''].indexOf(location.hostname) !== -1 ||
                       location.protocol === 'file:';

(() => {
  const componentBasePath = (() => {
    const script = document.currentScript || Array.from(document.scripts).find((item) => item.src.includes('components.js'));
    if (!script || !script.src) return '';
    return script.src.slice(0, script.src.lastIndexOf('/') + 1);
  })();

  const components = [
    { id: 'header-placeholder', url: 'header.html' },
    { id: 'footer-placeholder', url: 'footer.html' }
  ];

  const loadPromises = components.map(comp =>
    new Promise((resolve) => {
      const el = document.getElementById(comp.id);
      if (el) {
        fetch(new URL(comp.url, componentBasePath))
          .then(response => {
            if (!response.ok) throw new Error(`Could not load ${comp.url}`);
            return response.text();
          })
          .then(html => {
            el.innerHTML = html;
            resolve();
          })
          .catch(error => {
            console.error('Component Load Error:', error);
            resolve();
          });
      } else {
        resolve();
      }
    })
  );

  Promise.all(loadPromises).then(() => {
    // Initialize interactive features after components load
    initHeaderScroll();
    initScrollReveal();
    initMobileMenu();
    initDropdowns();
    initTaxonomyNav();
  });
})();

/* --------------------------------------------------------------------------
   HEADER SCROLL STATE
   -------------------------------------------------------------------------- */
function initHeaderScroll() {
  const header = document.getElementById('siteHeader');
  if (!header) return;

  const updateHeaderState = () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
  };

  updateHeaderState();
  window.addEventListener('scroll', updateHeaderState, { passive: true });
}

/* --------------------------------------------------------------------------
   SCROLL REVEAL — Intersection Observer
   -------------------------------------------------------------------------- */
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  // Observe all elements with reveal classes
  const elements = document.querySelectorAll(
    '.reveal, .reveal-left, .reveal-right, .reveal-scale, ' +
    '.create-card, .collection-row, .customisation-item, ' +
    '.occasion-card, .collection-editorial-card, ' +
    '.selected-card, .trust-card, .moment-card, ' +
    '.philosophy-card, ' +
    '.category-card, .selected-grid > *'
  );

  elements.forEach(el => {
    if (!el.classList.contains('reveal') &&
        !el.classList.contains('reveal-left') &&
        !el.classList.contains('reveal-right') &&
        !el.classList.contains('reveal-scale')) {
      el.classList.add('reveal');
    }
    observer.observe(el);
  });

  // Hero section initial fade — already has CSS animation
}

/* --------------------------------------------------------------------------
   MOBILE MENU — Hamburger Toggle
   -------------------------------------------------------------------------- */
function initMobileMenu() {
  const toggle = document.getElementById('hamburgerToggle');
  const overlay = document.getElementById('mobileNavOverlay');

  if (!toggle || !overlay) return;

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    overlay.classList.toggle('active');
    document.body.style.overflow = overlay.classList.contains('active') ? 'hidden' : '';
  });

  // Close on link click — delegated so links injected later (live taxonomy
  // fetch replacing the static fallback) close the overlay too.
  overlay.addEventListener('click', (e) => {
    if (!e.target.closest('a')) return;
    toggle.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  });
}

/* --------------------------------------------------------------------------
   DROPDOWN / MEGA MENU KEYBOARD NAVIGATION
   -------------------------------------------------------------------------- */
function initDropdowns() {
  document.querySelectorAll('.nav-item-dropdown').forEach(dropdown => {
    const toggle = dropdown.querySelector('.dropdown-toggle');
    const panel = dropdown.querySelector('.mega-menu') || dropdown.querySelector('.nav-dropdown');

    if (!toggle || !panel) return;

    const setExpanded = (expanded) => toggle.setAttribute('aria-expanded', String(expanded));

    // Open on click (touch devices)
    toggle.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        const nowVisible = panel.classList.toggle('visible');
        setExpanded(nowVisible);
      }
    });

    // Desktop reveal is pure-CSS (:hover), so mirror it into aria-expanded
    // for assistive tech that isn't tracking the hover state itself.
    dropdown.addEventListener('mouseenter', () => setExpanded(true));
    dropdown.addEventListener('mouseleave', () => setExpanded(false));

    // Close on Escape
    dropdown.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        panel.style.opacity = '0';
        panel.style.visibility = 'hidden';
        setExpanded(false);
        toggle.focus();
      }
    });

    // Open on Enter/Space
    toggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        panel.style.opacity = '1';
        panel.style.visibility = 'visible';
        setExpanded(true);
        panel.querySelector('a')?.focus();
      }
    });
  });
}

/* --------------------------------------------------------------------------
   TAXONOMY NAV — mega menu + mobile nav Category/Occasion/Collections lists,
   fetched live from Airtable in production so unpublishing a record there
   removes it from the nav too. On localhost (or if the API errors), the
   static fallback links already in header.html are left in place.
   -------------------------------------------------------------------------- */
// Category icon paths, reused from explore/index.html's category-scroll-card
// icons so the mega menu / mobile nav match. Keyed by Airtable slug; unknown
// slugs (a category added after this list was written) fall back to a
// generic "more" glyph rather than rendering with no icon at all.
const CATEGORY_ICON_PATHS = {
  'office-accessories': '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>',
  'office-essentials': '<path d="M21 8L12 3 3 8v8l9 5 9-5V8z"/><path d="M3 8l9 5 9-5"/><path d="M12 13v8"/>',
  'drinkware': '<path d="M17 8h1a4 4 0 0 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z"/><path d="M6 2v2M10 2v2M14 2v2"/>',
  'tech': '<rect x="3" y="4" width="18" height="12" rx="1"/><path d="M2 20h20"/>',
  'bags': '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
  'carry-bags': '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
  'transit-luggage': '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  'box-making': '<path d="M21 8L12 3 3 8v8l9 5 9-5V8z"/><path d="M3 8l9 5 9-5"/><path d="M12 13v8"/>',
  'printing': '<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
  'branding': '<path d="M20.59 13.41 11 3.83A2 2 0 0 0 9.59 3.2H4a1 1 0 0 0-1 1v5.59a2 2 0 0 0 .59 1.41l9.58 9.59a2 2 0 0 0 2.83 0l4.59-4.59a2 2 0 0 0 0-2.83z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
  'combo': '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5"/>'
};
const CATEGORY_ICON_FALLBACK = '<circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none"/>';

function initTaxonomyNav() {
  if (window.TBG_IS_LOCAL) return;

  const scratch = document.createElement('div');
  const escapeHtml = (str) => {
    scratch.textContent = str == null ? '' : String(str);
    return scratch.innerHTML;
  };

  const svg = (slug) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">' +
    (CATEGORY_ICON_PATHS[slug] || CATEGORY_ICON_FALLBACK) + '</svg>';

  const renderLinks = (items, linkClass, withIcons) => items.map((item) => {
    const name = escapeHtml(item.name);
    const slug = escapeHtml(item.slug);
    var marker = withIcons ? '<span class="mega-link-icon">' + svg(item.slug) + '</span>' : '<span class="mega-link-dot"></span>';
    var cls = linkClass ? ' class="' + linkClass + (withIcons ? ' mobile-sub-link--icon' : '') + '"' : '';
    var prefix = linkClass ? (withIcons ? svg(item.slug) : '') : marker;
    return '<a href="/explore/#' + slug + '"' + cls + '>' + prefix + name + '</a>';
  }).join('');

  const targets = [
    { endpoint: '/api/get-categories', mega: 'megaCategoryLinks', mobile: 'mobileCategoryLinks', icons: true },
    { endpoint: '/api/get-occasions', mega: 'megaOccasionLinks', mobile: 'mobileOccasionLinks' },
    { endpoint: '/api/get-collections', mega: 'megaCollectionLinks', mobile: 'mobileCollectionLinks', megaSuffix: '<a href="/explore/#collections"><span class="mega-link-dot"></span>View All →</a>' }
  ];

  targets.forEach((t) => {
    const megaEl = document.getElementById(t.mega);
    const mobileEl = document.getElementById(t.mobile);
    if (!megaEl && !mobileEl) return;

    fetch(t.endpoint)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('bad status'))))
      .then((items) => {
        if (!Array.isArray(items) || items.length === 0) return;
        if (megaEl) megaEl.innerHTML = renderLinks(items, null, t.icons) + (t.megaSuffix || '');
        if (mobileEl) mobileEl.innerHTML = renderLinks(items, 'mobile-sub-link', t.icons);
      })
      .catch(() => { /* leave the static fallback links in place */ });
  });
}
