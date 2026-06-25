// html/components.js.js
document.addEventListener('DOMContentLoaded', () => {
  const components = [
    { id: 'header-placeholder', url: '/header.html' },
    { id: 'newsletter-placeholder', url: '/newsletter.html' },
    { id: 'footer-placeholder', url: '/footer.html' }
  ];

  components.forEach(async (comp) => {
    const el = document.getElementById(comp.id);
    if (el) {
      try {
        const response = await fetch(comp.url);
        if (!response.ok) throw new Error(`Could not load ${comp.url}`);
        el.innerHTML = await response.text();
      } catch (error) {
        console.error('Component Load Error:', error);
      }
    }
  });
});