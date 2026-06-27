# The Biz Gift — Build Documentation

**Version:** 1.0  
**Date:** June 2026  
**Status:** Frozen  
**Owner:** Wugweb  
**Related Documents:** master-brand-document.md, design.md, content-architecture.md

**Purpose:** This document defines how the site is built, deployed, and maintained. It is the engineering reference for HTML structure, CSS architecture, JavaScript behaviour, Airtable integration, serverless functions, and deployment workflow. All implementation decisions must align with this document, the design tokens in `/docs/tokens/`, and the content rules in `content-architecture.md`.

---

## 00. Introduction

### 00.1 Purpose

This handbook translates brand, design, and content intent into executable code. It is written for developers, QA engineers, and future maintainers.

### 00.2 Audience

- Frontend developers implementing UI
- Engineers maintaining serverless functions
- QA engineers validating pages
- DevOps / deployment engineers

### 00.3 Document Hierarchy

```
master-brand-document.md  → Why (strategy, voice, values)
design.md                 → How it looks and feels (tokens, components, blocks)
content-architecture.md   → What content exists and how it's structured
build.md                 → How it's built (code, architecture, deployment)
```

### 00.4 Related Documents

- `master-brand-document.md` — brand strategy, voice, values
- `design.md` — design system, tokens, components, blocks
- `content-architecture.md` — Airtable schema, taxonomy, content model
- `docs/tokens/*.json` — JSON design token exports

---

## 01. Engineering Principles

These principles govern every technical decision.

1. **Content First** — Content drives layout, not the reverse.
2. **Design Token First** — Every visual value (colour, spacing, type) is a token. No magic numbers.
3. **Component First** — Reuse before building new. DRY is non-negotiable.
4. **Progressive Enhancement** — Core content works without JS. JS adds experience.
5. **Mobile First** — CSS starts at mobile. `min-width` media queries only.
6. **Accessibility First** — WCAG 2.1 AA minimum. Keyboard, screen reader, colour contrast.
7. **Performance Budget** — LCP < 2.5s, CLS < 0.1, INP < 200ms on 4G mid-range phone.
8. **SEO Native** — Semantic HTML, correct heading hierarchy, schema where applicable.
9. **Zero Duplication** — One source of truth per piece of HTML, CSS, or JS.
10. **Single Source of Truth** — Design tokens, Airtable, and shared components are the only data sources. Never hardcode values that live elsewhere.

---

## 02. Technology Stack

| Layer | Technology | Version / Notes |
|-------|------------|-----------------|
| Frontend | HTML5, CSS3, Vanilla JS | ES2020+, modules where possible |
| CMS / Database | Airtable | API + serverless proxy |
| Hosting | Vercel | Static + serverless functions |
| Icons | Inline SVG | Lucide-style, 1.75 stroke |
| Fonts | Google Fonts | Cormorant Garamond, Plus Jakarta Sans |
| Analytics | (planned) Plausible or GA4 | Not in current phase |
| Forms | Custom JS + `/api/submit-lead` | Writes to Airtable Leads table |
| Images | Airtable attachments (CDN) | WebP preferred; JPEG fallback |

---

## 03. Folder Architecture

Current production tree:

```
/
├── .gitignore
├── docs/
│   ├──README.md
│   ├── master-brand-document.md
│   ├── design.md
│   ├── content-architecture.md
│   ├── build.md
│   ├── decision-log.md
│   ├── tokens/
│   │   ├── colors.json
│   │   ├── typography.json
│   │   ├── spacing.json
│   │   ├── radius.json
│   │   ├── motion.json
│   │   ├── elevation.json
│   │   └── zindex.json
│   └── assets/
│       ├── moodboard/
│       ├── references/
│       └── photography/
│
│   # ── Site files at repo root (served directly by Vercel) ──
├── vercel.json                  # Headers + caching (no rootDirectory)
├── .vercelignore                # Excludes docs/ + dev files
├── index.html                   # Homepage (static shell)
├── about.html                   # About (static)
├── customisation.html           # Customisation studio (static)
├── quote.html                   # Quote form (static)
├── privacy.html                 # Legal (static)
├── terms.html                   # Legal (static)
├── sitemap.html                 # Utility (static)
├── style.css                    # Global styles (tokens + resets)
├── pages.css                    # Page-specific overrides
├── components.js                # Shared component loader (fetch header/footer)
├── header.html                  # Shared header (loaded via fetch)
├── footer.html                  # Shared footer (loaded via fetch)
├── newsletter.html              # Shared newsletter block (loaded via fetch)
├── image/                       # Static image assets
│   └── ...
├── api/                         # Vercel serverless functions → /api/*
│   ├── get-featured-hampers.js
│   ├── get-hamper.js
│   └── submit-lead.js
├── explore/
│   ├── index.html               # Explore hub (static shell)
│   └── explore.html             # Alternate explore (TBD: use / remove)
└── hamper/
    ├── template.html            # Product detail shell
    ├── hamper.css               # Product detail styles
    ├── hamper.js                # Product detail logic
    ├── cc-hamper/index.html     # Pre-rendered static fallback
    ├── coffee-calm/index.html
    └── executive-welcome-kit/index.html   # + other pre-rendered fallbacks
```

### 03.1 Folder Rules

- Site files live at the **repo root** and are served directly by Vercel (no Root Directory setting). All absolute URLs (`/style.css`, `/api/...`, `/image/...`) resolve from the root. `docs/` is excluded from deploys via `.vercelignore`.
- `docs/` is documentation only. It never deploys to production.
- `html/api/*.js` are Vercel serverless functions. They deploy to `/api/*`.
- `html/image/` contains static assets used across pages (logos, background textures).
- Airtable attachments are NOT stored here; they're fetched dynamically.

---

## 04. File Naming Conventions

### 4.1 Allowed Patterns

- **Pages:** kebab-case nouns or noun-phrases.
  - `index.html`, `about.html`, `customisation.html`, `quote.html`
- **Templates:** `template.html` for shells that share logic.
  - `html/hamper/template.html`
- **Stylesheets:** `style.css` for global, `pages.css` for page-specific overrides. Component styles may be co-located if they are self-contained.
  - `hamper/hamper.css` belongs only to product detail.
- **Scripts:** `components.js` for shared loaders. Component-specific JS is co-located.
  - `hamper/hamper.js` handles only product detail interactivity.
- **API routes:** kebab-case verbs describing the resource.
  - `get-featured-hampers.js`, `get-hamper.js`, `submit-lead.js`

### 4.2 Forbidden Patterns

- Page titles: `home-new.html`, `homepage-final2.html`
- Generic names: `page1.html`, `main.js`, `style2.css`
- CamelCase filenames: `HamperDetail.js` (use `hamper-detail.js`)
- Spaces or special characters in filenames

---

## 05. HTML Standards

### 5.1 Document Skeleton

Every page must include:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Title</title>
  <!-- Preconnect for fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/style.css">
  <!-- Page-specific stylesheet (if any) -->
  <link rel="stylesheet" href="/pages.css">
</head>
<body>
  <!-- Content injected by components.js -->
  <script src="/components.js"></script>
</body>
</html>
```

### 5.2 Semantic HTML

- Use `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`.
- One `<h1>` per page.
- Heading hierarchy must not skip levels (no `h1` → `h3`).
- Buttons for actions, links for navigation.
- `<form>` for data entry. Use `<label>` for every `<input>`.

### 5.3 Accessibility Attributes

- `aria-label` on icon-only buttons (e.g., mobile menu toggle).
- `aria-expanded` on dropdown toggles.
- `role="navigation"`, `role="main"` when native elements are insufficient.
- `alt` text on every meaningful image. Decorative images use `alt=""`.

### 5.4 Schema

- JSON-LD for Product (`https://schema.org/Product`) and BreadcrumbList (`https://schema.org/BreadcrumbList`).
- Injected server-side or via `<script type="application/ld+json">` in `<head>`.

---

## 06. CSS Architecture

### 6.1 File Structure

```
html/style.css          # Tokens, resets, base, layout, utilities, components
html/pages.css          # Page-specific overrides only
html/hamper/hamper.css  # Self-contained PDP styles
```

**Rule:** If a selector is used in two places, it belongs in `style.css`. If it's used once, `pages.css` or a co-located stylesheet is acceptable.

### 6.2 Design Token Usage

All design values come from:

1. CSS custom properties defined in `:root` in `style.css` (mapped from `docs/tokens/*.json`).
2. Direct references to token JSON files during build (design handoff, Figma sync).
3. No literal values (e.g., `#C59A7F`, `16px`) should appear in CSS outside `:root` declarations unless they are truly one-off.

Example:

```css
:root {
  --bg-ivory: #FAFAF7;
  --accent-bronze: #C59A7F;
  --space-layout: 4rem;
  --font-serif: 'Cormorant Garamond', serif;
}

.hero {
  background: var(--bg-charcoal);
  color: var(--text-light);
  padding: var(--space-layout);
  font-family: var(--font-serif);
}
```

### 6.3 Naming Methodology

Hybrid approach:

- **BEM** for standalone components (`.btn-action`, `.nav-link`, `.product-card`).
- **Utility-like** tokens via CSS variables (no Tailwind; custom properties only).
- **Avoid:** deeply nested selectors, ID selectors, inline styles.

### 6.4 Rules

- Never duplicate a selector in two files.
- Never add a new magic number without creating a token first.
- Never use `!important`.
- Always check mobile first — base styles = mobile.
- Always check `prefers-reduced-motion` for animations.

---

## 07. JavaScript Architecture

### 7.1 Module Pattern

Use ES Modules for new code. Existing code may use IIFE until refactored.

```javascript
// components.js
export async function loadHeader() { ... }
export async function loadFooter() { ... }
```

### 7.2 Shared Modules

| File | Purpose |
|------|---------|
| `components.js` | Fetch + inject header, footer, newsletter components |
| `hamper/hamper.js` | Product detail: gallery, FAQ, sticky CTA, form |
| `html/api/get-hamper.js` | Server-side: fetch product + related algorithm |

### 7.3 Rules

- No jQuery. Vanilla JS only.
- No giant files — split by feature.
- Use `addEventListener`, not inline `onclick`.
- Debounce scroll and resize handlers.
- Cache DOM queries when used repeatedly.
- All network requests go through `/api/*` routes, never directly to Airtable from the browser.

### 7.4 Error Handling

```javascript
async function fetchJSON(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('[fetchJSON]', url, err);
    throw err;
  }
}
```

---

## 08. Component Architecture

### 8.1 Shared Components

These are injected via `fetch()` to avoid duplicating header, footer, and newsletter markup across pages.

| Component | File | Load Trigger | Scope |
|-----------|------|--------------|-------|
| Header | `header.html` | `DOMContentLoaded` | All pages |
| Footer | `footer.html` | `DOMContentLoaded` | All pages |
| Newsletter | Inside `footer.html` | Same as footer | All pages |
| WhatsApp widget | Inside `footer.html` | Same as footer | All pages |

**Implementation:**

`components.js` fetches HTML fragments and injects them into `<header>`, `<footer>`, or designated slots.

```javascript
await fetch('/header.html')
  .then(res => res.text())
  .then(html => document.querySelector('header').innerHTML = html);
```

**Rule:** Components must not rely on inline scripts. All behaviour is attached after injection by `components.js` or a module loaded from the parent page.

### 8.2 Page Components

| Component | File | Responsibility |
|-----------|------|----------------|
| Homepage hero | `index.html` | Static + animation triggers |
| Explore hub | `explore/index.html` | Static layout; dynamic card population via JS when wired |
| Product detail | `hamper/template.html` + `hamper.js` | Dynamic rendering from `/api/get-hamper.js` |
| Quote form | `quote.html` | Form validation + submit to `/api/submit-lead` |
| Customisation | `customisation.html` | Static capabilities showcase |

---

## 09. Design Token Implementation

### 9.1 Token Flow

1. Source of truth: `docs/tokens/*.json`
2. CSS custom properties: defined in `html/style.css` `:root` block.
3. Build-time check (manual / future): verify CSS vars match JSON.

### 9.2 Example: Colors

From `docs/tokens/colors.json` → `style.css`:

```css
:root {
  --bg-charcoal: #1A1A1A;
  --bg-charcoal-light: #2A2A2A;
  --bg-ivory: #FAFAF7;
  --accent-bronze: #C59A7F;
  --accent-copper: #B87333;
  --text-dark: #2C2C2A;
  --text-muted: #706F6C;
  --text-light: #FFFFFF;
}
```

### 9.3 Example: Spacing

```css
:root {
  --space-layout: 4rem;
  --grid-gap: 4rem;
  --container-max: 1400px;
}
```

### 9.4 Example: Motion

```css
:root {
  --ease-premium: cubic-bezier(0.16, 1, 0.3, 1);
  --transition-fast: 0.3s cubic-bezier(0.25, 1, 0.5, 1);
  --transition-slow: 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}
```

### 9.5 Token Audit

Before any release, verify:
- All JSON tokens have a CSS counterpart.
- No CSS property uses a literal hex/spacing value outside `:root`.

---

## 10. Dynamic Rendering Architecture

### 10.1 Rendering Modes

| Mode | Definition | Usage |
|------|------------|-------|
| Static | Content is hardcoded in HTML | About, Quote, Customisation, Legal |
| Server-side | Serverless function fetches Airtable and returns HTML or JSON | Product detail (`get-hamper.js` returns JSON, client renders) |
| Client-side | JS fetches JSON and updates DOM | Explore hub when wired |
| Hybrid | Static shell + dynamic blocks | Homepage (static hero + dynamic cards) |

### 10.2 Server-side Rendering (SSR-ish)

Vercel serverless functions can return HTML, but currently this project returns JSON from `/api/*` and lets the client render. This keeps logic in one place (JS) and simplifies caching.

```javascript
// html/api/get-hamper.js
export default async function handler(req, res) {
  const { slug } = req.query;
  const product = await fetchProduct(slug);
  const related = await fetchRelated(product);
  res.status(200).json({ product, related });
}
```

### 10.3 Client-side Hydration

Product pages load template HTML, then JS fetches data and populates sections:

```javascript
// hamper/hamper.js
const { product, related } = await fetchJSON(`/api/get-hamper.js?slug=${slug}`);
renderProduct(product);
renderRelated(related);
```

### 10.4 Caching

- **Static assets:** Browser cache via Vercel CDN (immutable when hashed).
- **API routes:** No manual caching in v1. Future: `s-maxage=60, stale-while-revalidate`.
- **Airtable:** Server-side fetch on each request. Low traffic at launch; acceptable.
- **Images:** Airtable CDN; browser + CDN cache.

---

## 11. Airtable Integration Architecture

### 11.1 Authentication

All Airtable calls happen server-side in `/api/*` using environment variables set in Vercel:

- `AIRTABLE_API_KEY` — Personal Access Token (read/write for Leads, read for others).
- `AIRTABLE_BASE_ID` — `appG2IVjN168FLoqT`.

**Never expose the PAT to the browser.** All requests must go through `/api/*`.

### 11.2 Table Access

| Table | Access | Endpoint |
|-------|--------|----------|
| Products | Read | `/api/get-hamper.js`, `/api/get-featured-hampers.js` |
| Collections | Read | Planned `/api/collections` |
| Occasions | Read | Planned `/api/occasions` |
| Categories | Read | Planned `/api/categories` |
| FAQs | Read | Planned `/api/faq` |
| Leads | Write | `/api/submit-lead` |

### 11.3 Error Handling

```javascript
try {
  const records = await base('Products').select({ ... }).firstPage();
} catch (err) {
  if (err.statusCode === 401) {
    // Log + alert devops; do not expose internals to user
  }
  // Fallback: mock data or empty state
}
```

---

## 12. Fetch Strategy

### 12.1 Global Fetch Helper

```javascript
async function fetchJSON(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Accept': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
```

### 12.2 Loading States

- Skeleton shimmer for product hero, text lines, chips bar.
- Inline spinner for form submission.
- Fade-in on data arrival.

### 12.3 Retry Policy

- One automatic retry on network error (no retry on 4xx/5xx).
- After retry: show error panel with WhatsApp CTA.

### 12.4 Offline

- No PWA offline mode in v1.
- Forms require network; show friendly network error if offline.

---

## 13. Dynamic Blocks

Each dynamic section on the homepage must have:

1. A static fallback in HTML.
2. A hook (CSS class or comment) that JS can target.
3. A data contract (fields required, types).

Example:

```html
<section id="featured-collections" class="block-collections">
  <!-- Static fallback: 2 hardcoded collection cards -->
  <div class="grid" id="collections-grid">
    <article class="card">…</article>
  </div>
</section>
```

```javascript
// fetch collections, replace innerHTML of #collections-grid
// if empty, keep static fallback or show "Coming soon"
```

### 13.1 Homepage Blocks

| Block | Dynamic? | Data | Fallback |
|-------|----------|------|----------|
| Hero | No | — | Static HTML |
| What We Create | No | — | Static HTML |
| Featured Collections | Yes | Collections table | Static cards in HTML |
| Browse by Occasion | Yes | Occasions table | Static cards in HTML |
| Customisation Studio | No | — | Static HTML |
| Selected Gifts | Yes | Products (featured) | Static product grid |
| Why Companies Choose | No | — | Static HTML |
| Brand Story | No | — | Static HTML |
| Final CTA | No | — | Static HTML |
| Newsletter | Hybrid | Hidden input collects Source Page | — |

---

## 14. Image Pipeline

### 14.1 Sources

- **Airtable attachments:** Primary source for product and taxonomy imagery.
- **Static `/html/image/`:** Logos, default textures, editorially chosen hero backgrounds.

### 14.2 Formats

- Upload WebP to Airtable where supported.
- JPEG acceptable for complex photography.
- PNG for transparent assets only.

### 14.3 Sizes

- Gallery images ≤ 200KB before upload.
- Aim for 1600px on long edge.
- Use Airtable's built-in resizing via URL parameters if available.

### 14.4 Loading

- First gallery image: `fetchpriority="high"`.
- Additional images: `loading="lazy"`.
- Progressive fade-in via CSS class toggled on `load` event.

```css
img {
  opacity: 0;
  transition: opacity 0.4s ease;
}
img.loaded {
  opacity: 1;
}
```

---

## 15. Routing & URL Strategy

### 15.1 Flat File Routing

This project is static HTML hosted on Vercel. Routing is file-based:

```
html/
  index.html          → /
  about.html          → /about
  quote.html          → /quote
  customisation.html  → /customisation
  explore/
    index.html        → /explore
  hamper/
    template.html     → /hamper/template.html  (NOT dynamic — see 15.2)
```

### 15.2 Dynamic Routes

`/product/{slug}`, `/category/{slug}`, `/collection/{slug}`, `/occasion/{slug}` are served by:

1. **Static fallback files** pre-rendered for each product (in `hamper/*/index.html`).
2. **Client-side routing** via `hamper/template.html` + `hamper.js` which reads `window.location.pathname`, extracts the slug, fetches data, and renders.

In production, `get-hamper.js` is the source of truth. The static fallbacks exist for SEO crawlers and as a loading skeleton.

### 15.3 URL Rules

- Always lowercase.
- Hyphens for word separators.
- No trailing slashes.
- Canonical self-referencing.

---

## 16. Forms & Lead Pipeline

### 16.1 Endpoint

All forms POST to `/api/submit-lead` with JSON body:

```json
{
  "type": "quote",
  "name": "Priya Sharma",
  "company": "Acme Corp",
  "email": "priya@acme.com",
  "phone": "+91 98765 43210",
  "quantity": "50",
  "budget": "₹50,000 – ₹1,00,000",
  "occasion": "Employee Onboarding",
  "requiredBy": "2026-08-15",
  "branding": "Logo deboss + custom tag",
  "message": "Need by end of month.",
  "product": "Executive Welcome Kit",
  "productUrl": "/product/executive-welcome-kit",
  "collection": "Executive Welcome",
  "category": "Diaries",
  "sourcePage": "/product/executive-welcome-kit"
}
```

### 16.2 Validation

**Client-side:**
- Required fields: Name, Company, Email, Phone.
- Email format validation.
- Phone: allow digits, spaces, +, -, parentheses.
- Future: inline error on blur.

**Server-side:**
- Re-validate all fields.
- Drop rows with empty required fields (do not store in Airtable).
- Rate limit: 5 submissions per IP per hour.

### 16.3 Success / Failure UI

- **Loading:** Spinner + "Submitting…" (inputs disabled, double-submit prevented).
- **Success:** Replace form with confirmation panel (checkmark + "Thank You" + message).
- **Failure:** Red banner with error. WhatsApp CTA remains accessible.

---

## 17. Search & Filtering

**Current phase:** No site-wide search UI. Navigation via mega menu and taxonomy pages only.

**Planned (for handoff):**
- Search endpoint: `/api/search?q=...`
- Filterable fields: Category, Occasion, Collection, Product Tags.
- Ranking: exact name > tag exact > tag partial > category/occasion boost.
- Pagination: 12 per page.
- URL state: query params preserved on back/forward via History API.

---

## 18. Mega Menu Implementation

### 18.1 DOM Structure

`header.html` contains:

```html
<nav aria-label="Main navigation">
  <ul class="nav-primary">
    <li><a href="/">Home</a></li>
    <li class="nav-item-dropdown">
      <button class="dropdown-toggle" aria-expanded="false">Explore Gifts ▾</button>
      <div class="dropdown-panel">…linked taxonomy cards…</div>
    </li>
    ...
  </ul>
</nav>
```

### 18.2 Interaction

- Desktop: hover opens panel (0 Y offset, visible).
- Mobile: hamburger opens full-screen drawer.
- Keyboard: `Enter` / `Space` on toggle; `Escape` closes; arrow keys navigate within.

### 18.3 Data Source (future)

Replace static HTML inside dropdown with JS-fetched collections and occasions from `/api/collections` and `/api/occasions`.

---

## 19. Animation Implementation

### 19.1 Scroll Reveal

```javascript
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
```

CSS trigger:

```css
.revealed {
  animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
```

### 19.2 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 19.3 Gallery

- Crossfade between images on arrow/click: opacity transition 600ms.
- Hover zoom: `transform: scale(1.02)` with 800ms ease.
- Touch swipe: `touchstart` / `touchend` distance threshold = 50px.

---

## 20. Accessibility Implementation

### 20.1 Standards

- WCAG 2.1 AA.
- Minimum colour contrast 4.5:1 for text, 3:1 for large text.

### 20.2 Keyboard

- All interactive elements reachable via `Tab`.
- Focus indicators visible (3px bronze ring with `outline-offset: 2px`).
- Dropdown toggles accessible via `Enter`/`Space`.
- Gallery keyboard navigation (`ArrowLeft`, `ArrowRight`).
- `Escape` closes modals/drawers.

### 20.3 Screen Reader

- `aria-label` on icon buttons.
- `aria-live` regions for form errors and dynamic content.
- `alt` text required on images.

---

## 21. SEO Implementation (Deferred — Phase 2)

**Note:** SEO work is documented but explicitly blocked in the current phase per user instructions ("SEO-related should be struck down or grayed (not in scope)"). The following defines what must exist when the phase opens.

### 21.1 Per-Page Metadata

- `<title>` and `<meta name="description">` unique per page.
- Product pages: derived from Airtable `SEO Title` / `SEO Description`.
- Static pages: hardcoded in HTML `<head>`.
- Canonical URL set for all pages.

### 21.2 Open Graph / Twitter

- `og:title`, `og:description`, `og:image`, `og:url`.
- `twitter:card = summary_large_image`.
- OG image: 1200×630, < 200KB.

### 21.3 Schema

- `Product` schema on product pages.
- `BreadcrumbList` on product and taxonomy pages.

### 21.4 Technical SEO

- `sitemap.xml` generated or static.
- `robots.txt` allowing all.
- No broken links (validated in QA).
- No duplicate content (unique `<title>` + meta description).
- Images wrapped in `<a>` when they are links (for SEO equity).

---

## 22. Performance Budgets

| Metric | Budget | Measurement |
|---------|--------|-------------|
| LCP (Largest Contentful Paint) | < 2.5s | Web Vitals / PageSpeed Insights |
| CLS (Cumulative Layout Shift) | < 0.1 | Web Vitals |
| INP (Interaction to Next Paint) | < 200ms | Web Vitals |
| Total JS | < 200KB (gzipped) | Build output |
| Total CSS | < 50KB (gzipped) | Build output |
| Images per page | ≤ 8 above fold | Manual audit |
| Time to First Byte (TTFB) | < 600ms | Vercel analytics |

### 22.1 Enforcement

- Manual checks during QA.
- Future: Lighthouse CI in GitHub Actions.

---

## 23. Error & Fallback Handling

### 23.1 Product Not Found

```json
// /api/get-hamper.js when slug not found
{ "error": "not_found" }
```

Client renders editorial 404 with:
- Headline: "This page has been wrapped."
- CTA: link to `/explore`
- WhatsApp sticky widget remains visible.

### 23.2 Airtable Failure

- Show error panel with message: "Something went wrong while loading this gift."
- Provide WhatsApp CTA and `/explore` link.
- Log error server-side for debugging.

### 23.3 Image Missing

- `onerror` replace with placeholder SVG (product initial on bronze).
- For gallery: disable slideshow controls if placeholder used.

### 23.4 Form Failure

- Red banner at top of form: "We couldn't save your enquiry. Please try again or WhatsApp us."
- Do not clear form fields so user can retry.

---

## 24. Build Order

For a new developer joining the project, this is the recommended build sequence:

1. **Foundation**
   - Set up Vercel project (Root Directory = repo root / leave blank; site files are at root).
   - Add environment variables `AIRTABLE_API_KEY`, `AIRTABLE_BASE_ID`.
   - Confirm `html/api/submit-lead.js` works (write test row to Airtable).

2. **Tokens**
   - Verify `docs/tokens/*.json` match `design.md`.
   - Implement `:root` in `html/style.css` from tokens.

3. **Header / Footer / Components**
   - Implement `components.js` fetch + inject logic.
   - Build `header.html` with mega menu skeleton.
   - Build `footer.html` with newsletter + WhatsApp.
   - Wire mobile hamburger menu.

4. **Homepage**
   - Build hero, static sections, button styles.
   - Add scroll reveal animations.

5. **Cards & Templates**
   - Build product card, collection card, occasion card in `style.css`.
   - Create `hamper/template.html` shell.

6. **Product Detail (PDP)**
   - Implement `hamper.js` data fetching + rendering.
   - Build gallery + FAQ + sticky CTA + proposal form.
   - Wire related products algorithm.

7. **Explore Hub**
   - Static layout with card placeholders.
   - Wire dynamic population (future).

8. **Forms**
   - Validate quote + proposal forms.
   - Submit to `/api/submit-lead`.
   - Handle success / error UI.

9. **SEO**
   - Add per-product `<title>`, meta, JSON-LD breadcrumbs.
   - Validate headings and alt text.

10. **QA**
    - Run full checklist (see Section 27).
    - Test on real devices (iOS Safari, Android Chrome).

---

## 25. Coding Standards

### 25.1 Naming

- **Files:** kebab-case (`get-hamper.js`).
- **CSS classes:** BEM-like, hyphen-separated (`product-card`, `product-card__title`).
- **JS variables/functions:** camelCase (`fetchProduct`, `renderGallery`).
- **Constants:** UPPER_SNAKE_CASE (`API_BASE`, `USE_MOCK_DATA`).

### 25.2 Spacing

- Use tokens (`var(--space-layout)`). Never hardcode `padding: 4rem` without a token.

### 25.3 Imports

- Group by: third-party, shared modules, page-specific.
- No unused imports.

### 25.4 Comments

- Explain why, not what. (`// Use IntersectionObserver for performance` not `// Set up observer`).

### 25.5 Functions

- Single responsibility. Extract when > 30 lines.
- Return early for guard clauses.

### 25.6 Events

- Prefer `addEventListener`.
- `passive: true` for scroll / touch where applicable.

---

## 26. Cursor / AI Coding Rules

If using Cursor, Claude Code, or similar AI-assisted dev tools, enforce:

**Never:**
- Invent components not in `design.md`.
- Duplicate HTML across pages — extract component.
- Hardcode colours or spacing — use tokens.
- Modify `master-brand-document.md` content without explicit request.
- Add pricing or Add-to-Cart UI.

**Always:**
- Read `master-brand-document.md`, `design.md`, `content-architecture.md` before writing component code.
- Use `/docs/tokens/*.json` as the style reference.
- Reuse existing components in `html/components.js`, `header.html`, `footer.html`.
- Follow `build.md` folder structure.
- Validate HTML semantics and ARIA.
- Add `prefers-reduced-motion` handling for any animation.

---

## 27. QA Checklist

Before any deploy, verify:

- [ ] **Visual:** Every page matches Figma / design reference on desktop (1400px), tablet (768px), mobile (375px).
- [ ] **Tokens:** No hardcoded colours or spacing in CSS.
- [ ] **Typography:** Correct font families, sizes, and line heights from token spec.
- [ ] **Responsive:** No horizontal scroll at any breakpoint. Images are fluid.
- [ ] **Touch targets:** Buttons ≥ 44×44px.
- [ ] **Keyboard:** All interactive elements reachable; dropdowns, gallery, accordion keyboard-accessible.
- [ ] **Focus:** Visible focus ring on all focusable elements.
- [ ] **Contrast:** Text/background pairs meet WCAG AA.
- [ ] **Alt text:** Every image has descriptive alt text or empty alt.
- [ ] **SEO:** Unique `<title>`, meta description, canonical on every page.
- [ ] **Dynamic:** Product pages load from `/api/get-hamper.js` in production, mock data locally.
- [ ] **Forms:** Quote, proposal, and newsletter forms all submit successfully to `/api/submit-lead`.
- [ ] **WhatsApp:** Sticky widget visible, correct number, works on mobile.
- [ ] **Animations:** Smooth on desktop; disabled under `prefers-reduced-motion`.
- [ ] **Performance:** LCP < 2.5s, CLS < 0.1 on simulated 4G.
- [ ] **Error handling:** Break a product slug → see friendly 404. Break an image → see placeholder.
- [ ] **Analytics:** (when added) events fire without console errors.
- [ ] **Security:** No Airtable tokens, API keys, or secrets in client-side code or repo.
- [ ] **Links:** No broken internal links (run link checker).
- [ ] **Console:** Zero `console.error` in production build.

---

## 28. Deployment Workflow

### 28.1 Vercel Setup

1. Connect GitHub repo in Vercel dashboard.
2. Leave **Root Directory** blank (repo root) — site files are at the root, so no setting is needed. This keeps the project transferable to any account.
3. Add environment variables:
   - `AIRTABLE_API_KEY` (new PAT)
   - `AIRTABLE_BASE_ID`
   - `AIRTABLE_LEADS_TABLE` (defaults to `Leads`)
4. Deploy preview branch for review.
5. Merge to `main` triggers production deploy.

### 28.2 Client Migration Checklist

When moving to the client's own Vercel:

1. Client creates Vercel account and invites developer as collaborator.
2. Import repo (GitHub) or push new remote.
3. Leave Root Directory blank (repo root) — no setting needed.
4. Add environment variables (fresh PAT rotated from old).
5. Add custom domain + DNS.
6. Validate with staging URL before DNS cutover.
7. Keep old Vercel project live for 48 hours as rollback.

---

## 29. Future Extensibility

Documented but not implemented:

- **Advanced search & filtering** — full-text, facets.
- **Saved collections / wishlist** — requires user accounts or local storage.
- **Gift Builder v2.0** — drag-and-drop product assembly.
- **AI Concierge v3.0** — recommendation engine.
- **Ordering & Payments** — payment gateway integration, cart, checkout.
- **CRM sync** — auto-create contacts in client CRM.
- **Multi-language** — i18n framework + translated Airtable locales.
- **PWA offline** — service worker for cached reads.

These are intentionally deferred to keep v1 focused on editorial experience and lead generation.

---

## 30. Appendix

### 30.1 Airtable Rules

- Always access via `/api/*`, never from browser.
- Validate field names match exactly (Airtable is case-sensitive for API field selectors).
- Keep `Published` unchecked until content, images, and taxonomy are complete.
- Do not delete records; use `Published` / `Archived` lifecycle.

### 30.2 Deployment Checklist

- [ ] Environment variables set in Vercel.
- [ ] Root Directory = repo root (blank) — site files are at root.
- [ ] All forms submit to `/api/submit-lead` successfully.
- [ ] At least one product loads from Airtable in production preview.
- [ ] No `console.error` or unhandled promise rejections in production build.
- [ ] Images load (no broken links).
- [ ] WhatsApp number is live.
- [ ] Social links are real URLs.

### 30.3 Performance Checklist

- [ ] Images compressed (≤ 200KB each).
- [ ] WebP used where browser supports.
- [ ] Fonts preconnected.
- [ ] CSS and JS minified (Vercel handles this automatically).
- [ ] No render-blocking resources above the fold.

### 30.4 SEO Checklist

- [ ] Unique `<title>` per page.
- [ ] Unique meta description per page.
- [ ] Canonical URL set.
- [ ] JSON-LD schema on product pages.
- [ ] No duplicate content.
- [ ] Proper heading hierarchy (single H1, logical H2/H3).
- [ ] All images have alt text.
- [ ] Internal links use descriptive anchor text.

### 30.5 Accessibility Checklist

- [ ] Keyboard navigable.
- [ ] Focus indicators visible.
- [ ] Colour contrast ≥ 4.5:1.
- [ ] `prefers-reduced-motion` respected.
- [ ] Forms have `<label>` for each input.
- [ ] Error messages associated with inputs via `aria-describedby`.
- [ ] No `alert()` — use inline messaging.

### 30.6 Folder Tree Reference

```
/
├── docs/
│   ├──README.md
│   ├── master-brand-document.md
│   ├── design.md
│   ├── content-architecture.md
│   ├── build.md
│   ├── decision-log.md
│   ├── tokens/
│   │   ├── colors.json
│   │   ├── typography.json
│   │   ├── spacing.json
│   │   ├── radius.json
│   │   ├── motion.json
│   │   ├── elevation.json
│   │   └── zindex.json
│   └── assets/
│       ├── moodboard/
│       ├── references/
│       └── photography/
│
│   # ── Site files at repo root (served by Vercel) ──
├── vercel.json
├── .vercelignore
├── index.html
├── about.html
├── customisation.html
├── quote.html
├── privacy.html
├── terms.html
├── sitemap.html
├── style.css
├── pages.css
├── components.js
├── header.html
├── footer.html
├── newsletter.html
├── image/
├── api/
│   ├── get-featured-hampers.js
│   ├── get-hamper.js
│   └── submit-lead.js
├── explore/
│   ├── index.html
│   └── explore.html
└── hamper/
    ├── template.html
    ├── hamper.css
    ├── hamper.js
    └── [product-slug]/index.html
```

---

## 31. Decision Log

| Decision | Rationale | Date | Decided By |
|----------|-----------|------|------------|
| Single Quote page instead of cart | B2B consultative sales model; quote request is the conversion goal | Jun 2026 | Wugweb |
| Three taxonomy templates (category, collection, occasion) | Matches Airtable model and supports occasion-first discovery | Jun 2026 | Wugweb |
| Mega menus only for Explore & Collections | IA clarity and scalability; limit cognitive load on homepage | Jun 2026 | Wugweb |
| No pricing on homepage | Premium positioning; avoid transactional tone above the fold | Jun 2026 | Wugweb |
| Static About page | Stable brand narrative; minimal change expected | Jun 2026 | Wugweb |
| Airtable as sole CMS | No separate CMS needed; Airtable provides both CMS and DB | Jun 2026 | Wugweb |
| Mock data on localhost | Rapid design iteration without live API dependencies | Jun 2026 | Wugweb |
| Client-side rendering for PDP | Simpler architecture; acceptable performance at launch scale | Jun 2026 | Wugweb |
| ~~`html/` as Vercel root~~ → **site served from repo root** | Root Directory is an out-of-repo dashboard setting that broke deploys and is not transferable; serving from the repo root makes deploys zero-config and portable to any Vercel account (import → deploy) | Jun 2026 | Wugweb |

---

**`build.md` v1.0 — Frozen**

This document is the definitive engineering reference for The Biz Gift. All code must conform to these standards. Future changes to architecture, tooling, or patterns require an update to this document and a corresponding entry in the Decision Log.