// html/components.js
document.addEventListener('DOMContentLoaded', () => {
  const componentBasePath = (() => {
    const script = document.currentScript || Array.from(document.scripts).find((item) => item.src.includes('components.js'));
    if (!script || !script.src) return '';
    return script.src.slice(0, script.src.lastIndexOf('/') + 1);
  })();

  const components = [
    { id: 'header-placeholder', url: 'header.html' },
    { id: 'newsletter-placeholder', url: 'newsletter.html' },
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
    initNewsletter();
  });
});

/* --------------------------------------------------------------------------
   NEWSLETTER SIGNUP — posts to /api/submit-lead (Airtable)
   -------------------------------------------------------------------------- */
function initNewsletter() {
  const form = document.querySelector('.newsletter-form');
  if (!form) return;

  const IS_LOCAL = ['localhost', '127.0.0.1', '0.0.0.0', ''].indexOf(location.hostname) !== -1 ||
                   location.protocol === 'file:';
  const input = form.querySelector('input[type="email"]');
  const button = form.querySelector('button');

  const setStatus = (msg) => {
    let status = form.parentElement.querySelector('.newsletter-status');
    if (!status) {
      status = document.createElement('p');
      status.className = 'newsletter-status';
      form.parentElement.appendChild(status);
    }
    status.textContent = msg;
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }

    button.disabled = true;
    const original = button.textContent;
    button.textContent = 'Subscribing...';

    const done = (msg) => {
      form.reset();
      button.disabled = false;
      button.textContent = original;
      setStatus(msg);
    };

    if (IS_LOCAL) {
      setTimeout(() => done('Thank you — you are subscribed.'), 600);
      return;
    }

    fetch('/api/submit-lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'newsletter', email: input.value })
    }).then((res) => {
      done(res.ok ? 'Thank you — you are subscribed.' : 'Something went wrong. Please try again.');
    }).catch(() => {
      button.disabled = false;
      button.textContent = original;
      setStatus('Network error. Please try again.');
    });
  });
}

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
   DROPDOWN / MEGA MENU KEYBOARD NAVIGATION
   -------------------------------------------------------------------------- */
function initDropdowns() {
  document.querySelectorAll('.nav-item-dropdown').forEach(dropdown => {
    const toggle = dropdown.querySelector('.dropdown-toggle');
    const panel = dropdown.querySelector('.mega-menu') || dropdown.querySelector('.nav-dropdown');
    
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
