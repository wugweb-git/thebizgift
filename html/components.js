// html/components.js
document.addEventListener('DOMContentLoaded', () => {
  const components = [
    { id: 'header-placeholder', url: 'header.html' },
    { id: 'newsletter-placeholder', url: 'newsletter.html' },
    { id: 'footer-placeholder', url: 'footer.html' }
  ];

  const loadPromises = components.map(comp =>
    new Promise((resolve) => {
      const el = document.getElementById(comp.id);
      if (el) {
        fetch(comp.url)
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
    initScrollReveal();
    initMobileMenu();
    initDropdowns();
  });
});

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
    '.philosophy-card, .occasion-grid > *, ' +
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

  // Close on link click
  overlay.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('active');
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
}

/* --------------------------------------------------------------------------
   DROPDOWN KEYBOARD NAVIGATION
   -------------------------------------------------------------------------- */
function initDropdowns() {
  document.querySelectorAll('.nav-item-dropdown').forEach(dropdown => {
    const toggle = dropdown.querySelector('.dropdown-toggle');
    const panel = dropdown.querySelector('.nav-dropdown');
    
    if (!toggle || !panel) return;

    // Open on click (touch devices)
    toggle.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        panel.classList.toggle('visible');
      }
    });

    // Close on Escape
    dropdown.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        panel.style.opacity = '0';
        panel.style.visibility = 'hidden';
        toggle.focus();
      }
    });

    // Open on Enter/Space
    toggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        panel.style.opacity = '1';
        panel.style.visibility = 'visible';
        panel.querySelector('a')?.focus();
      }
    });
  });
}