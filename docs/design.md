# The Biz Gift — Design System

**Version:** 1.2  
**Date:** June 2026  
**Status:** Frozen  
**Owner:** Wugweb  
**Related Documents:** master-brand-document.md, content-architecture.md, build.md

**Purpose:** This is the canonical single source of truth for all visual, interaction, content, and experience decisions for The Biz Gift. It guides designers, developers, and future contributors to maintain premium consistency.

**Style:** Restrained luxury editorial — warm neutrals, bronze accents, generous whitespace, high-quality photography.

**Token source:** All values below mirror the JSON exports in [`docs/tokens/`](tokens/). The JSON files are the machine-readable source of truth; this document is the human-readable reference. When a value changes, update both.

---

## 00. Introduction

### Document hierarchy

```
master-brand-document.md  → Why (strategy, voice, values)
design.md                 → How it looks and feels (this document)
content-architecture.md   → What content exists and how it's structured
build.md                  → How it's built (code, architecture, deployment)
```

### Foundation

These rules govern every visual decision before any specific token, component, or layout is considered:

- Editorial-first, never ecommerce-first
- Premium B2B experience
- Story before specification
- Consultation before transaction
- Large whitespace
- Warm neutrals
- Bronze accent
- Photography dominates UI

---

## 01. Design Principles (Litmus Test)

Every design decision is measured against these ten principles. Any decision that violates one requires senior review.

1. Photography over interface
2. Story over specification
3. Discovery over browsing
4. Consultation over transaction
5. Editorial over ecommerce
6. Restraint over decoration
7. Rhythm over repetition
8. Confidence over persuasion
9. Quality over quantity
10. Systems over pages

---

## 02. Experience Strategy

The Biz Gift is a premium corporate gifting studio disguised as an elegant editorial showroom.

**Core Goals:**
1. Inspire trust and brand perception
2. Enable occasion-based discovery and customisation
3. Drive high-quality quote requests and WhatsApp conversations

**Experience Flow:**
Occasion → Collection → Product → Consultation (never Category → Product above the fold)

**Conversion Paths:**
- Request Proposal form (`/quote`)
- Product proposal form (hamper detail)
- WhatsApp sticky widget (site-wide)

---

## 03. Editorial Layout System

- Photography always dominates typography
- Never exceed 680px reading width for body text
- Every section must contain one dominant visual
- Alternate image-left / image-right rhythm
- Never repeat identical section layouts more than twice consecutively
- Every 2–3 sections must change visual tempo
- Whitespace communicates hierarchy
- Content should feel curated, not exhaustive

---

## 04. Visual Language

### Photography
- **Composition:** 70% product focus, 20% packaging, 10% lifestyle
- **Lighting:** Natural, warm tones, soft shadows
- **Materials & Textures:** Visible textures, craftsmanship, tactile materials
- **Backgrounds:** Neutral surfaces (kraft, linen, marble, wood), generous negative space
- **Cropping:** Product-centric, never cut across key details
- **Packaging:** Show the unboxing, layering, and presentation

### Rules
- No HDR or over-processed imagery
- No white studio backgrounds
- No smiling stock office people
- No overlaid text on images
- No decorative illustrations — photography only
- Icons: outline-only Lucide, never decorative

---

## 05. Token Architecture

Tokens flow through four tiers. Always reference the highest-level token available — components should consume semantic tokens, never raw primitives.

```
Primitive  →  Alias  →  Semantic  →  Component
(#C59A7F)     (--accent-bronze)   (--accent-primary)   (--btn-border)
```

| Tier | Role | Example |
|------|------|---------|
| **Primitive** | Raw values, no meaning | `bronze-500: #C59A7F` |
| **Alias** | Named bridge | `--accent-bronze` |
| **Semantic** | Intent-based | `--accent-primary`, `--background-secondary` |
| **Component** | Scoped to a component | `--btn-bg`, `--input-border` |

**Token families:** Color · Typography · Spacing · Grid · Radius · Border · Shadow · Elevation · Z-index · Motion · Animation · Icon

---

## 06. Color

### 6.1 Primitives
| Token | Value | Notes |
|-------|-------|-------|
| `neutral-900` | `#1A1A1A` | Charcoal — header, footer, dark sections |
| `neutral-800` | `#2A2A2A` | Charcoal light — dropdown backgrounds |
| `neutral-100` | `#FAFAF7` | Ivory — page + card backgrounds |
| `neutral-50` | `#FFFFFF` | Pure white — inputs, light text |
| `bronze-500` | `#C59A7F` | Primary accent — CTAs, active states |
| `bronze-600` | `#B87333` | Copper — decorative accent |

### 6.2 Semantic
| Token | Value | Usage |
|-------|-------|-------|
| `--background-primary` | `#FAFAF7` | Default page background |
| `--background-secondary` | `#1A1A1A` | Dark sections, footer |
| `--background-tertiary` | `#2A2A2A` | Dropdown / mega-menu panels |
| `--text-primary` | `#2C2C2A` | Body text |
| `--text-secondary` | `#706F6C` | Muted / supporting text |
| `--text-inverse` | `#FFFFFF` | Text on dark backgrounds |
| `--accent-primary` | `#C59A7F` | CTAs, active states |
| `--accent-secondary` | `#B87333` | Decorative accents |
| `--accent-hover` | `#B08A6F` | Accent hover state |
| `--border-default` | `rgba(44,44,42,0.1)` | Card / divider borders |
| `--border-strong` | `#C59A7F` | Emphasised borders |
| `--border-subtle` | `rgba(255,255,255,0.1)` | Borders on dark surfaces |

### 6.3 Functional
| Token | Value | Usage |
|-------|-------|-------|
| `--color-whatsapp` | `#25D366` | WhatsApp widget |
| `--color-error` | `#DC2626` | Form errors, invalid fields |
| `--color-success` | `#16A34A` | Success confirmations |

**Rules:** Maximum one accent colour per viewport. Never use gradients. Bronze is the only brand accent — copper is decorative-only.

---

## 07. Typography

**Serif — Cormorant Garamond:** headlines, display text, hero, section headers.  
Stack: `'Cormorant Garamond', Georgia, 'Times New Roman', serif`

**Sans — Plus Jakarta Sans:** body, buttons, UI, navigation, captions.  
Stack: `'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`

### 7.1 Type Scale
| Token | Desktop | Tablet | Mobile | Line height | Tracking |
|-------|---------|--------|--------|-------------|----------|
| `hero` | 4.5rem | 3.2rem | 2.8rem | 1.1 | -0.02em |
| `h2` | 3.5rem | 2.8rem | 2.5rem | 1.15 | -0.01em |
| `h3` | 2.75rem | 2.25rem | 2rem | 1.2 | 0 |
| `h4` | 2rem | 1.75rem | 1.5rem | 1.3 | 0 |
| `body` | 1.0625rem | 1rem | 1rem | 1.7 | 0 |
| `small` | 0.9375rem | 0.875rem | 0.875rem | 1.6 | 0.01em |
| `caption` | 0.8125rem | 0.8125rem | 0.75rem | 1.5 | 0.02em |
| `button` | 0.875rem | 0.875rem | 0.8125rem | 1 | 0.08em |

### 7.2 Weights
`light: 300` · `regular: 400` · `medium: 500` · `semibold: 600` · `bold: 700`

### 7.3 Editorial Constraints
- Max reading width: **680px**
- Hero title: ≤ 55 characters
- Hero subtitle: ≤ 120 characters
- Product description: 150–250 words
- USP: ≤ 80 characters
- FAQ: ≤ 8 items

---

## 08. Grid System

12-column grid, 24px gutter. Whitespace communicates hierarchy — never crowd a dominant visual.

| Token | Value | Usage |
|-------|-------|-------|
| Container (max) | `1400px` | Standard content width |
| Container (narrow) | `680px` | Reading-width content |
| Columns | 12 | Grid system |
| Gutter | 24px | Column spacing |

---

## 09. Spacing System

### 9.1 Spacing Scale (4px base)
`0.25 · 0.5 · 0.75 · 1 · 1.25 · 1.5 · 2 · 2.5 · 3 · 4 · 5 · 6 · 8 · 10 · 12 · 16` (rem)

### 9.2 Layout Spacing
| Token | Value | Usage |
|-------|-------|-------|
| Grid gap | `4rem` → tablet `3rem` → mobile `2rem` | Section grids |
| Section padding (homepage) | `9rem` → mobile `5rem` | Homepage sections |
| Section padding (inner) | `8rem` → mobile `4rem` | Inner pages |

### 9.3 Component Spacing
| Token | Value |
|-------|-------|
| Button padding | `1rem` × `2.5rem` |
| Input padding | `0.875rem` × `1.25rem` |
| Card padding | `2.5rem` |
| Dropdown offset | `10px` |

---

## 10. Border Radius

| Token | Value | Applied to |
|-------|-------|-----------|
| `none` | 0 | — |
| `sm` | 4px | — |
| `md` | 8px | — |
| `lg` | 24px | Cards, dropdown, image, mega menu (default) |
| `xl` | 32px | Modal |
| `2xl` | 48px | — |
| `full` | 9999px | Buttons, inputs, badges, chips |

**Borders:** default `1px solid rgba(44,44,42,0.1)` · strong `2px solid #C59A7F` · subtle `1px solid rgba(255,255,255,0.1)`.

**Focus ring:** `3px` solid `#C59A7F` with `rgba(197,154,127,0.2)` glow. Never remove focus outlines.

**Icon stroke:** `1.75px`

---

## 11. Elevation & Borders

Elevation communicates surface layering. Prefer borders over shadows for hierarchy; reserve shadows for genuinely floating surfaces.

| Level | Token | Shadow | Used by |
|-------|-------|--------|---------|
| 0 | `--elevation-0` | none | Page surface, flat cards |
| 1 | `--elevation-1` | `0 2px 8px rgba(26,26,26,0.06)` | Card hover lift |
| 2 | `--elevation-2` | `0 8px 24px rgba(26,26,26,0.10)` | Dropdowns, mega menu, sticky CTA |
| 3 | `--elevation-3` | `0 16px 48px rgba(26,26,26,0.16)` | Modals, lightbox |

### Z-index Layers

A fixed scale prevents stacking-context drift. Never invent ad-hoc z-index values — pick the nearest layer.

| Layer | Value | Surface |
|-------|-------|---------|
| Base | 0 | Page content |
| Raised | 10 | Cards, hover states |
| Sticky | 100 | Sticky CTA, scroll indicators |
| Header | 200 | Site header |
| Mega menu | 500 | Header dropdowns / mega menu |
| Drawer | 700 | Mobile nav overlay |
| Modal | 900 | Lightbox, dialogs |
| Toast | 999 | Notifications, form alerts |

**Rule:** A surface uses exactly one elevation level. Don't stack shadows.

---

## 12. Motion System

### 12.1 Easing
| Token | Curve | Usage |
|-------|-------|-------|
| `--ease-premium` | `cubic-bezier(0.16, 1, 0.3, 1)` | Scroll reveals, hero, fades |
| `--ease-standard` | `cubic-bezier(0.25, 1, 0.5, 1)` | Hover states, transitions |
| `--ease-smooth` | `cubic-bezier(0.4, 0, 0.2, 1)` | Accordions, height changes |

### 12.2 Duration
| Token | Value | Usage |
|-------|-------|-------|
| `instant` | 0ms | Keyboard / swipe nav |
| `fast` | 150ms | Micro-interactions |
| `normal` | 300ms | Hover, spec rows |
| `slow` | 600ms | Hero crossfade, scale-up |
| `hero` | 900ms | Hero reveal |

### 12.3 Animation Presets
| Preset | From → To | Duration |
|--------|-----------|----------|
| `fadeUp` | opacity 0, translateY 40px → opacity 1, translateY 0 | 800ms |
| `fadeIn` | opacity 0 → 1 | 400ms |
| `scaleUp` | scale 0.95 → 1 | 600ms |

### 12.4 Stagger & Observer
- Stagger: fast `80ms` · normal `120ms` · slow `200ms`
- IntersectionObserver: threshold `0.15`, rootMargin `0px 0px -50px 0px`

### 12.5 Animation Implementation

| Animation | Trigger | Behavior | Duration | Easing |
|-----------|---------|----------|----------|--------|
| **Hero Reveal** | Page load | Fade-up from 40px | 900ms | Premium |
| **Card Hover** | Mouse enter | translateY -6px to -8px, elevation-1 | 400ms | Standard |
| **Image Zoom** | Mouse enter on gallery | scale 1.02–1.05 | 800ms | Premium |
| **Gallery Crossfade** | Thumbnail click / swipe | Opacity swap | 600ms | Premium |
| **Accordion** | Click toggle | Height expand, chevron rotate 180° | 200ms | Smooth |
| **Mega Menu** | Mouse enter nav item | translateY 10→0, opacity 0→1 | 300ms | Standard |
| **Sticky CTA** | Scroll past hero | Fade-in, fixed bottom | 400ms | Standard |
| **Scroll Reveal** | IntersectionObserver | translateY 40→0, staggered | 800ms | Premium |
| **Page Transition** | Navigation | N/A — instant page load | — | — |
| **Skeleton** | Before data load | Shimmer pulse | Continuous | Linear |
| **Reduced Motion** | `prefers-reduced-motion` | Disable all transforms + transitions | — | — |

**Rule:** Every animation must respect `@media (prefers-reduced-motion: reduce)`.

---

## 13. Interaction Patterns

Every component must define behaviour for these states. Missing state = incomplete component.

| State | Description |
|-------|-------------|
| **Default** | Resting appearance |
| **Hover** | Mouse over (desktop) |
| **Active** | Being clicked / pressed |
| **Focus** | Keyboard-focused (3px bronze ring) |
| **Disabled** | Non-interactive, reduced opacity |
| **Loading** | Awaiting data (skeleton / spinner) |
| **Success** | Action completed (green / confirmation) |
| **Error** | Action failed (red / error message) |
| **Empty** | No data to display (editorial fallback) |

### Component-specific interactions

| Component | Hover | Focus | Active |
|-----------|-------|-------|--------|
| `btn-action` | Fill bronze, text → charcoal | 3px bronze ring | Scale 0.98 |
| `nav-link` | Bronze text + underline scaleX | Bronze ring | — |
| `card` | translateY -6px, elevation-1, image scale 1.05 | Bronze ring | — |
| Gallery image | Scale 1.02 | Arrow key nav | Lightbox open |
| Accordion item | Subtle bg tint | Bronze ring | Toggle expand |
| Mega menu panel | — (triggered by nav hover) | Arrow key nav | Link follow |
| Spec row | Subtle bg tint, bronze underline on value | — | — |
| Social icon | Bronze border + icon, -2px Y | Bronze ring | Link follow |

---

## 14. Responsive System

| Breakpoint | Layout Changes |
|------------|---------------|
| **Desktop XL** (1400px+) | Max container width |
| **Desktop** (1100–1400px) | Standard layout |
| **Laptop** (768–1100px) | Reduced spacing, 2-col grids, 3-col occasion |
| **Tablet** (768px) | Stack columns, smaller headings |
| **Mobile** (<768px) | Single column, hamburger nav, full-screen drawer |

Component behaviour changes at every breakpoint. Token-level responsive values (type scale, grid gap, section padding) are defined in §07–09 and in the JSON token files.

---

## 15. Accessibility

Target: **WCAG 2.1 AA**.

- Colour contrast ≥ 4.5:1 for body text
- Visible focus ring on every interactive element (3px bronze)
- Full keyboard operability (nav, gallery arrows, accordion, forms)
- ARIA roles on alerts, accordions, and dynamic regions
- Touch targets ≥ 44×44px
- `<label>` for every input; errors linked via `aria-describedby`
- Logical screen-reader order; meaningful alt text
- `prefers-reduced-motion` respected everywhere
- Semantic HTML landmarks (`<nav>`, `<main>`, `<footer>`, `<section>`)

---

## 16. Homepage Storytelling Engine & Governance

### Frozen Flow
Hero → What We Create → Featured Collections → Customisation Studio → Browse by Occasion → Browse by Collection → Selected Gifts → Why Companies Choose → Brand Story → Final CTA

### Governance
- Maximum **9 sections** (current: 10 — Brand Story + Final CTA count as one storytelling unit)
- Any new section requires removing or merging an existing one unless approved in a major redesign
- Static sections ≤ 60% of total homepage content
- Hero, editorial intro, brand story, and final CTA are static
- Collections, occasions, selected gifts are dynamic (Airtable)

---

## 17. Page Blueprints

### Homepage
| Order | Block | Purpose |
|-------|-------|---------|
| 1 | Hero | Full-screen overlay with CTA |
| 2 | What We Create | 4× editorial cards |
| 3 | Featured Collections | 4 alternating image:content rows |
| 4 | Customisation Studio | 5-grid branding options |
| 5 | Browse By Occasion | 5 campaign cards |
| 6 | Browse By Collection | 6 editorial cards |
| 7 | Selected Gifts | 6 product images |
| 8 | Why Companies Choose | 4 trust pillars |
| 9 | Brand Story | Single centered block |
| 10 | Final CTA | Dark background, dual buttons |

### About Page
| Order | Block | Purpose |
|-------|-------|---------|
| 1 | Hero | Eyebrow + serif headline |
| 2 | Origin | 2-column image + text |
| 3 | POV Panel | Centered pull quote, copper accent |
| 4 | Philosophy | 3-card grid |
| 5 | Moments | 2×2 image cards |
| 6 | Craft | 2-column image + text |
| 7 | Today | Centered narrative |
| 8 | Statement | Dark banner, bronze text |
| 9 | CTA | Dark, dual buttons |

### Explore Hub
| Order | Block | Purpose |
|-------|-------|---------|
| 1 | Hero | Full-width editorial |
| 2 | Occasion | 2 featured cards |
| 3 | Collections | 7 editorial cards |
| 4 | Categories | 5 visual cards |
| 5 | Featured | 6 product cards |
| 6 | Customisation | 4 branding grid |
| 7 | CTA | Dark, split buttons |

### Hamper Detail v2 (B2B Editorial Product Page)

| # | Block | Purpose | Dynamic? | Hide if empty? |
|---|-------|---------|----------|----------------|
| 01 | Breadcrumb | Hierarchy w/ collection/category fallback | Yes | No |
| 02 | Hero | 55/45 split gallery + premium chips + quick facts | Yes | No |
| 03 | Product Introduction | Pure typography (H2 + description + USP) | Yes | No |
| 04 | Planning Information | 2-column spec panel, thin dividers | Mixed | No — show with fallbacks |
| 05 | Perfect For | Icon cards + CTA link | Yes | Yes — if no occasion tags |
| 06 | Make It Yours | Horizontal scroll branding gallery | Yes | Yes — if no branding |
| 07 | FAQ | Single-open accordion, 200ms | Yes | Yes — if no FAQ |
| 08 | Related Hampers | Algorithmic, 4 max, 100ms stagger | Yes | Yes — if none found |
| 09 | Proposal / Customisation | Editorial left + validated form right | Yes | No |

### Page Library

| Page | File | Sections | Status |
|------|------|----------|--------|
| Homepage | `html/index.html` | 10 | Built |
| About | `html/about.html` | 9 | Built |
| Explore Hub | `html/explore/index.html` | 7 | Built |
| Hamper Detail | `html/hamper/template.html` | 9 | Built |
| Customisation | `html/customisation.html` | 10 | Built |
| Quote | `html/quote.html` | 6 | Built |
| Collection Page | `html/explore/explore.html` | — | Template |
| Occasion Page | — | — | Future |
| Category Page | — | — | Future |
| Privacy | `html/privacy.html` | — | Built |
| Terms | `html/terms.html` | — | Built |
| 404 | — | — | Future |
| Sitemap | `html/sitemap.html` | — | Built |
| Search | — | — | Future |
| Gift Builder | — | — | Future (v2.0) |

---

## 18. Component Inventory

Components are classified by role. Every component must define the states from §13.

### Navigation
- **Header** (`site-header`) — fixed, charcoal, scroll-aware
- **Sticky Header** — appears on scroll-up, hides on scroll-down
- **Mega Menu** (`nav-item-dropdown`) — Explore + Collections only; charcoal-light bg, 10px hidden offset → 0 on hover, bronze section labels
- **Nav Link** (`nav-link`) — white at 75% opacity, bronze + underline scaleX on hover
- **Breadcrumb** — product / taxonomy hierarchy with fallbacks
- **Mobile Navigation** — full-screen drawer (z-index: 700)
- **Announcement Bar** — future: promotional messaging

### Hero Components
- **Editorial Hero** — homepage: full-screen overlay + dual CTA
- **Product Hero** — 55/45 split gallery + chips + quick facts
- **Collection Hero** — 3:2 banner + name + description
- **About Hero** — eyebrow + serif headline, centered
- **Quote Hero** — centered headline + subtitle + WhatsApp CTA

### Cards
- **Product Card** — 4:5 image, name, no price; hover lift + image scale
- **Collection Card** — editorial, 3:2 image
- **Occasion Card** — icon + text, no image
- **Related Product Card** — 4:5 image, staggered entrance
- **Editorial Card** — headline + description + CTA
- **Trust Card** — icon + title + description
- **Story Card** — centered text, no image
- **Feature Card** — branding/customisation options
- **Branding Card** — 1:1 image, customisation showcase
- **Process Card** — numbered step + description

### Product Components
- **Gallery** — hover zoom (1.02), keyboard arrows, touch swipe (50px threshold)
- **Gallery Thumbnails** — clickable strip, active indicator
- **Image Lightbox** — full overlay, Esc to close, 400ms
- **Premium Chips** — pill with bronze dot, linked to taxonomy
- **Quick Facts** — MOQ, lead time, delivery at-a-glance
- **Planning Information** — Apple-style 2-col: editorial left, spec rows right, thin dividers
- **Specifications** — label + value rows with hover tint
- **Customisation Matrix** — branding options grid
- **Branding Gallery** — horizontal scroll, pinned section
- **Perfect For Cards** — emoji icon + text + CTA link
- **Related Products** — algorithmic, 4 max, staggered entrance
- **Proposal Form** — editorial left + validated form right
- **Sticky CTA** — reveals after hero, hides at proposal
- **FAQ Accordion** — single-open, chevron rotate, 200ms, keyboard accessible

### Content Components
- **Section Header** (`section-header`) — left serif h2 + muted sans intro; `--center` variant, 600px intro max
- **Eyebrow** — uppercase sans, bronze or muted, letter-spacing 0.12em
- **Editorial Quote** — centered pull quote with copper accent border
- **Rich Text Block** — 680px max-width, serif headings, sans body
- **Split Content Block** — image + text, alternating sides
- **Timeline** — future: process/journey visualisation
- **Trust Pillars** — 4-column icon + title + text grid
- **Brand Story** — centered narrative block, dark background option
- **Statistics** — future: number + label grid
- **Callout Panel** — dark background with bronze text highlight

### Form Components
- **Quote Form** — full-page multi-field lead capture
- **Proposal Form** — embedded in product page, pre-filled product context
- **Input** — pill border, bronze focus ring, inline error
- **Textarea** — pill border, auto-resize
- **Select** — custom dropdown, pill border
- **Checkbox / Radio** — custom bronze-styled indicators
- **Date Picker** — native with custom styling
- **Validation Messages** — inline, red border + `aria-describedby`
- **Success State** — form replaced with confirmation panel (checkmark + "Thank You")
- **Failure State** — red banner, WhatsApp CTA remains
- **Loading State** — spinner + "Submitting…", inputs disabled, double-submit blocked

### Utility Components
- **Toast** — notification bar, z-index 999
- **Badge** — pill, small, status indicators
- **Chip** — pill with bronze dot, clickable when linked
- **Tag** — internal taxonomy label
- **Divider** — thin border-default line
- **Skeleton Loader** — shimmer pulse animation
- **Pagination** — future: numbered page navigation
- **Search** — future: search input + results
- **Filters** — future: faceted filtering
- **Sort** — future: sort controls
- **Empty State** — editorial message + explore CTA
- **404 Page** — "This page has been wrapped" + explore CTA

### Footer
- **Newsletter** — email input + submit, site-wide
- **Contact** — phone, email, WhatsApp
- **Social Icons** (`footer-socials`) — 36px circle, white border 20%, bronze + 2px lift on hover
- **Legal** — privacy + terms links
- **CTA** — "Request Proposal" persistent link
- **WhatsApp Widget** (`whatsapp-sticky-widget`) — fixed bottom-right, `#25D366`, 2px lift on hover

---

## 19. Dynamic Content System

How dynamic content behaves visually — not the Airtable schema (see content-architecture.md).

### Airtable-Backed Components
| Component | Source | Visual Behavior |
|-----------|--------|-----------------|
| Featured Collections (homepage) | Collections table | 4 alternating image:content rows |
| Browse by Occasion (homepage) | Occasions table | 5 campaign cards |
| Selected Gifts (homepage) | Products (featured=true) | 6 product images |
| Mega menu collections | Collections | Dropdown section |
| Mega menu occasions | Occasions | Dropdown section |
| Product detail (all fields) | Products | Full page build |
| Related products | Products (scored) | 4-card grid, staggered |
| FAQ | FAQs table | Accordion |
| Branding options | Products (branding[]) | Horizontal scroll gallery |

### Static Components
Header, footer, newsletter, WhatsApp widget, About page, Customisation page, Quote page, legal pages, editorial homepage sections.

### Fallback Behaviour
```
0 images            → show fallback placeholder
1 image             → disable gallery controls
no FAQ              → hide FAQ section
no related          → hide Related section
no branding         → hide Make It Yours
no occasion tags    → hide Perfect For
no collection tag   → hide hero badge
no material         → omit Material spec row
no response time    → omit Response Time row
no usp              → omit USP paragraph
0 products in list  → empty state with explore link
API timeout         → error panel with retry + WhatsApp CTA
image load failure  → onerror → placeholder SVG
```

### Loading States
All dynamic components show skeleton shimmer during data fetch: gallery placeholder, text line placeholders, chips bar placeholder.

---

## 20. Design Constraints

Quantified limits that keep layouts restrained. Exceeding any requires design review.

| Constraint | Limit |
|------------|-------|
| Cards per row | 4 |
| Primary CTAs per viewport | 2 |
| Hero buttons | 2 |
| `<h1>` per page | 1 |
| Accent colours per viewport | 1 |
| Reading width | 680px |
| Max section width | 1400px |
| Homepage sections | 9 (governance-enforced) |

### Absolute Rules
- Never use gradients
- No ecommerce language on homepage
- No pricing on homepage
- No "Add to Cart" anywhere
- No decorative icons in chrome
- No shadows for hierarchy when borders suffice
- Photography always precedes copy
- No overlaid text on images

---

## 21. Navigation Governance

Primary navigation is frozen:

**Home • Explore Gifts • Customisation • About • Request Proposal**

- Mega menus on **Explore Gifts** and **Collections** only.
- Categories and Occasions nest inside the Explore mega menu — never top-level.
- Any new top-level item requires IA review.

---

## 22. Quality Assurance

### Performance Budgets
LCP < 2.5s · CLS < 0.1 · INP < 200ms (see build.md §22)

### Design QA Checklist
- [ ] All values use tokens (no hardcoded colors, spacing, type sizes)
- [ ] Correct type scale per breakpoint
- [ ] Restrained layout (within design metrics)
- [ ] Photography dominant, copy secondary

### Responsive QA
- [ ] Verified at 1400 / 1100 / 768 / 375
- [ ] Hamburger nav on mobile
- [ ] Touch targets ≥ 44×44

### Accessibility QA
- [ ] Keyboard navigation complete
- [ ] Contrast ≥ 4.5:1
- [ ] Focus rings visible
- [ ] Reduced motion respected
- [ ] Alt text present on all images

---

## 23. Design Debt & Roadmap

**Known debt (v1):** testimonials placeholder, client logo wall, advanced search, AI Gift Finder, saved collections, Gift Builder.

**Future Components:** Search · Filters · Sort · Pagination · Statistics · Timeline · Announcement Bar · Gift Builder · AI Concierge

**Versioned Roadmap:**
- **v1.0** — Editorial showroom with mock data
- **v1.x** — Airtable live integration, remaining pages
- **v2.0** — Gift Builder & advanced customisation
- **v3.0** — AI recommendation & concierge

---

## 24. Hamper Detail — Deep Dive

### 24.1 Airtable Field Mapping
| Airtable Field | API Key | UI Mapping |
|---------------|---------|------------|
| `URL Slug` | `slug` | URL routing |
| `Website Product Name` | `name` | H1, breadcrumb |
| `Website Description` | `description` | Hero intro + Introduction |
| `Product Images` | `images[]` | Gallery |
| `SEO Title` | `seoTitle` | `<title>` *(Phase 2)* |
| `SEO Description` | `seoDescription` | meta description *(Phase 2)* |
| `Parent Category` | `parentCategory` | Breadcrumb fallback |
| `Category` | `category` | Breadcrumb fallback + Planning row |
| `Occasion Tags` | `occasionTags[]` | Perfect For |
| `Curated Gift Tags` | `collectionTag` | Collection badge + breadcrumb + Planning |
| `Product Tags` | `productTags[]` | Hero premium chips |
| `MOQ` | `moq` | Quick facts + Planning row |
| `USP` | `usp` | Introduction USP paragraph |
| `Material` | `material` | Planning row |
| `Branding Option` | `branding[]` | Make It Yours |
| `FAQ` | `faq[]` | FAQ accordion |
| `Lead Time` | `leadTime` | Quick facts + Planning row |
| `Delivery` | `delivery` | Quick facts + Planning row |
| `Response Time` | `responseTime` | Planning row |

### 24.2 Sticky CTA Behaviour
| Viewport | Behavior |
|----------|----------|
| Desktop | Hidden; appears after hero scrolls past; hides when Proposal enters |
| Mobile | Always visible; hides when Proposal enters |

### 24.3 Related Product Algorithm
Scored server-side in `get-hamper.js`:
1. `+4` — same Collection (Curated Gift Tags)
2. `+3` — same Occasion Tags
3. `+2` — same Category
4. `+1` — same Product Tags

Max 4 results · never the current product · ties randomised.

### 24.4 Block Design Principles
- No data tables — CSS Grid spec rows with thin dividers
- No card-based planning — Apple-style label + value rows
- No image-based occasion cards — icon + text
- Consultation merges editorial highlights + form (no separate image block)
- Gallery: hover zoom, keyboard nav, swipe, lightbox
- Chips: pill with bronze dot, linked to taxonomy
- Reduced motion disables all animation

### 24.5 Files
| File | Role |
|------|------|
| `html/hamper/template.html` | Shell: skeleton + header/footer |
| `html/hamper/hamper.css` | v2 styles — 9 sections + skeleton + reduced motion |
| `html/hamper/hamper.js` | v2 IIFE — 9 builders + 9 interaction systems |
| `html/api/get-hamper.js` | Serverless: single product + related algorithm |

---

## 25. Image Standards

| Context | Ratio | Min size | Format | Loading |
|---------|-------|----------|--------|---------|
| Product hero gallery | 16:10 | 1600×1000 | WebP/JPEG | First eager, rest lazy |
| Product gallery (extra) | 16:10 | 1600×1000 | WebP/JPEG | Lazy |
| Make It Yours (branding) | 1:1 | 800×800 | WebP | Lazy |
| Related product card | 4:5 | 800×1000 | WebP | Lazy |
| Collection / occasion banner | 3:2 | 1600×1000 | WebP | Eager (above fold) |
| Category card | 4:3 | 800×600 | WebP | Lazy |
| Mega menu thumbnail | 3:2 | 600×400 | WebP | Lazy |
| OG / Twitter (Phase 2) | 1.91:1 | 1200×630 | JPEG/PNG | N/A |

**Rules:** Natural light, warm tone, soft shadow. No white studio backgrounds, no overlaid text, no smiling stock office people. Compress ≤200KB before upload. `onerror` → placeholder SVG. Alt text mandatory.

---

## 26. Iconography

A constrained icon system — not decorative illustration.

- **Library:** Lucide (outline)
- **Sizes:** 24px (default), 20px (compact), 16px (inline)
- **Stroke:** 1.75px
- **Style:** Outline only — no filled, no duotone, no emoji in chrome, no decorative icons

**Exception:** "Perfect For" cards use elegant emoji glyphs as editorial accents.

---

## Appendix A — Changelog

**v1.2** — June 2026
- Restructured to full 26-section architecture
- Added Experience Strategy (§02), Editorial Layout System (§03), Visual Language (§04)
- Split Grid System (§08) and Spacing System (§09) into independent sections
- Split Elevation & Borders (§11) from Border Radius (§10)
- Added Interaction Patterns with component state matrix (§13)
- Expanded Responsive System with breakpoint naming (§14)
- Added Homepage Storytelling Engine & Governance (§16)
- Expanded Page Blueprints with full Page Library (§17)
- Massively expanded Component Inventory with full classification (§18)
- Added Dynamic Content System (§19)
- Added Design Constraints as standalone section (§20)
- Moved Hamper Detail deep-dive to §24
- Added Mega menu thumbnail to Image Standards (§25)

**v1.1** — June 2026
- Promoted Motion, Elevation, and Z-index to first-class token families
- Added Elevation system, Z-index layers, Iconography, Image Standards, Design Metrics
- Added Component Inventory classification
- Aligned all token tables with `docs/tokens/*.json` exact values

**v1.0** — Initial release (Frozen)
- Homepage architecture frozen
- Navigation frozen
- Component inventory established
- Design principles established
- Token architecture established

---

## Appendix B — Glossary

- **Block** — a composed section (e.g. Hero, Featured Collections), not a single component.
- **Token** — a named design value; the source of truth lives in `docs/tokens/`.
- **MOQ** — Minimum Order Quantity (shown instead of price).
- **PDP** — Product Detail Page (the Hamper Detail template).
- **Litmus test** — the ten design principles every decision is measured against (§01).
- **Governance** — rules that constrain what can be added/changed without senior review.
- **Editorial** — layout style that prioritises photography, whitespace, and story over UI density.

---

## Appendix C — Implementation Approach

The recommended build order for implementing this design system:

**Phase 1 — Foundation:** Tokens, Typography, Grid, Containers, Utilities  
**Phase 2 — Base Components:** Buttons, Inputs, Cards, Navigation, Modals, Forms  
**Phase 3 — Composite Components:** Hero, Gallery, Collection Cards, Product Cards, FAQ, Proposal Form, Mega Menu  
**Phase 4 — Page Templates:** Homepage, Explore, Product Detail, About, Quote, Customisation  
**Phase 5 — Dynamic Integration:** Airtable, Loading States, Empty States, Error States, SEO (Phase 2), Analytics, Performance
