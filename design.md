# The Biz Gift — Design System

## 1. Design Tokens (Primitives)

### Colors
| Token | Value | Usage |
|-------|-------|-------|
| `--bg-charcoal` | `#1A1A1A` | Header, footer, dark sections |
| `--bg-charcoal-light` | `#2A2A2A` | Dropdown backgrounds |
| `--bg-ivory` | `#FAFAF7` | Page backgrounds, card backgrounds |
| `--accent-bronze` | `#C59A7F` | CTAs, active states, accents |
| `--accent-copper` | `#B87333` | Decorative accents |
| `--text-dark` | `#2C2C2A` | Body text |
| `--text-muted` | `#706F6C` | Secondary/tertiary text |
| `--text-light` | `#FFFFFF` | Light text on dark backgrounds |

### Typography
| Token | Value | Usage |
|-------|-------|-------|
| `--font-serif` | `'Cormorant Garamond', serif` | Headlines, display text |
| `--font-sans` | `'Plus Jakarta Sans', sans-serif` | Body text, buttons, UI |
| `--font-size-hero` | `4.5rem` (mobile: 2.8rem) | Hero headlines |
| `--font-size-h2` | `3.5rem` (mobile: 2.5rem) | Section headers |
| `--font-size-h3` | `2.5-3rem` | Card headings |
| `--font-size-body` | `1rem` | Body paragraphs |
| `--font-size-small` | `0.85-0.95rem` | Captions, footer |

### Spacing
| Token | Value | Usage |
|-------|-------|-------|
| `--space-layout` | `4rem` (mobile: 2.5rem) | Layout padding |
| `--grid-gap` | `4rem` | Grid spacing |
| `--container-max` | `1400px` | Max content width |
| Section padding | `9rem` vertical | Homepage sections |
| Section padding | `8rem` vertical | Inner pages |

### Motion
| Token | Value | Usage |
|-------|-------|-------|
| `--ease-premium` | `cubic-bezier(0.16, 1, 0.3, 1)` | Scroll reveals, fades |
| `--transition-fast` | `0.3s cubic-bezier(0.25, 1, 0.5, 1)` | Hover states, transitions |
| `--transition-slow` | `0.8s cubic-bezier(0.16, 1, 0.3, 1)` | Hero animations |

---

## 2. Components

### Buttons (`btn-action`)
- **Base:** Transparent bg, bronze border, uppercase, letter-spacing 0.12em
- **Hover:** Fills bg with bronze, text turns charcoal
- **Variants:** `btn-primary` (filled bronze), `btn-secondary` (white border), `btn-large`, `btn-small`

### Navigation Links (`nav-link`)
- **Base:** White text at 75% opacity, 0.05em letter-spacing
- **Hover:** Bronze text + underline scaleX animation
- **States:** Default, hover, active

### Dropdown (`nav-item-dropdown`)
- **Trigger:** `dropdown-toggle` with ▾ arrow
- **Panel:** Absolute, centered, light charcoal bg, 10px Y offset hidden
- **Hover:** 0 Y offset, visible, full opacity
- **Nested:** Section labels in bronze uppercase

### Section Headers (`section-header`)
- **Default:** Left-aligned serif h2 + muted sans intro
- **Center variant:** `section-header--center` for centered layouts
- **Max-width:** 600px for intro text

### Social Icons (`footer-socials`)
- **Base:** 36px circle with white border at 20% opacity
- **Hover:** Bronze border, bronze icon, 2px translateY lift

### WhatsApp Widget (`whatsapp-sticky-widget`)
- **Fixed:** bottom-right, green (#25D366)
- **Hover:** 2px translateY lift

---

## 3. Blocks (Section Compositions)

### Homepage
| Order | Block | Purpose |
|-------|-------|---------|
| 1 | Hero | Full-screen overlay with CTA |
| 2 | What We Create | 4x editorial cards |
| 3 | Featured Collections | 4 alternating image:content rows |
| 4 | Customisation Studio | 5 grid branding options |
| 5 | Browse By Occasion | 5 campaign cards with gradient |
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
| 3 | POV Panel | Centered pull quote with copper accent |
| 4 | Philosophy | 3-card grid |
| 5 | Moments | 2x2 image cards |
| 6 | Craft | 2-column image + text |
| 7 | Today | Centered narrative |
| 8 | Statement | Dark banner with bronze text |
| 9 | CTA | Dark with dual buttons |

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

### Hamper Detail v2 (Redesigned B2B Editorial Product Page)
| Order | Block | Purpose | Dynamic? | Hide if Empty? |
|-------|-------|---------|----------|----------------|
| 01 | Breadcrumb | Navigation hierarchy with collection/category fallback | Yes | No |
| 02 | Hero | 55/45 split gallery (hover zoom, keyboard nav, mobile swipe) + premium chips + quick facts | Yes | No |
| 03 | Product Introduction | Pure typography section (H2 + description + USP) — no cards, no borders | Yes | No |
| 04 | Planning Information | Apple-style 2-column spec panel (editorial left, spec rows right with thin dividers) | Mixed | No — always show with fallbacks |
| 05 | Perfect For | Icon-based responsive cards — elegant emoji icons + text + CTA link | Yes | Yes — if no occasion tags |
| 06 | Make It Yours | Horizontal scroll gallery (pinned section, scroll-driven movement) | Yes | Yes — if no branding options |
| 07 | FAQ | Accordion with single-open, 200ms smooth animation | Yes | Yes — if no FAQ data |
| 08 | Related Hampers | "You May Also Like" — algorithmic, 4 cards max, sequential 100ms stagger | Yes | Yes — if no related found |
| 09 | Proposal / Customisation | Merged split layout (editorial left with highlights + form right with validation) | Yes | No |

#### Airtable Field Mapping
| Airtable Field | API Key | UI Mapping |
|---------------|---------|------------|
| `URL Slug` | `slug` | URL routing |
| `Website Product Name` | `name` | H1, breadcrumb |
| `Website Description` | `description` | Hero intro + Product Introduction |
| `Product Images` | `images[]` | Gallery (hero) |
| `SEO Title` | `seoTitle` | `<title>` |
| `SEO Description` | `seoDescription` | `<meta name="description">` |
| `Parent Category` | `parentCategory` | Breadcrumb (fallback) |
| `Category` | `category` | Breadcrumb (fallback) + Planning row |
| `Occasion Tags` | `occasionTags[]` | Perfect For section |
| `Curated Gift Tags` | `collectionTag` | Collection badge + breadcrumb + Planning |
| `Product Tags` | `productTags[]` | Hero premium chips |
| `MOQ` | `moq` | Quick facts + Planning row |
| `USP` | `usp` | Introduction USP paragraph |
| `Material` | `material` | Planning row |
| `Branding Option` | `branding[]` | Make It Yours section |
| `FAQ` | `faq[]` | FAQ accordion |
| `Lead Time` | `leadTime` | Quick facts + Planning row |
| `Delivery` | `delivery` | Quick facts + Planning row |
| `Response Time` | `responseTime` | Planning row |

#### Image Aspect Ratios
| Context | Ratio | Notes |
|---------|-------|-------|
| Hero gallery | 16:10 | Preloaded, first image eager, hover zoom 1.02 |
| Make It Yours | 1:1 | Lazy loaded, object-fit cover |
| Related | 4:5 | Lazy loaded |

#### Interaction Rules
| Element | Behavior | Duration |
|---------|----------|----------|
| **Hero** | Fade-up on page load | 600ms |
| **Gallery crossfade** | Opacity crossfade between images | 600ms |
| **Gallery hover zoom** | Active image scales 1.02 on gallery hover | 800ms |
| **Gallery keyboard** | ArrowLeft / ArrowRight navigation | Instant |
| **Gallery swipe** | Touch horizontal swipe (50px threshold) | Instant |
| **Lightbox** | Click image → full overlay, Escape to close | 400ms |
| **Premium chips** | Hover: bronze bg, translateY -1px | 200ms |
| **Buttons** | Background fill on hover, arrow slides 4px right | 200ms |
| **Spec rows** | Hover: subtle bg tint, bronze underline on value | 300ms |
| **Perfect For cards** | Hover: translateY -6px, border bronze, icon bg bronze, link gap expands | 400ms |
| **Make It Yours items** | Hover: translateY -6px, shadow, image scale 1.05 | 400ms |
| **Accordion** | Smooth height expand, chevron rotate 180°, single open | 200ms |
| **Related cards** | Hover: translateY -8px, shadow, image scale 1.05, CTA underline expands | 500ms |
| **Related cards (enter)** | Sequential fade-in, 100ms delay each | 800ms total |
| **Scroll reveal** | IntersectionObserver, translateY 40→0, 80-120ms stagger | 800ms |
| **Images** | Progressive fade-in on load (0→1 opacity) | 400ms |
| **Sticky CTA** | Reveals after hero exits viewport, hides when proposal enters | 400ms |

#### Empty State Rules
```
IF no FAQ              → Hide FAQ section
IF no related          → Hide Related section
IF no branding         → Hide Make It Yours section
IF no occasion tags    → Hide Perfect For section
IF no collection tag   → Hide badge in hero
IF only 1 image        → Disable gallery controls
IF 0 images            → Show fallback image
IF no material         → Omit Material spec row
IF no response time    → Omit Response Time spec row
IF no usp              → Omit USP paragraph in Introduction
```

#### Sticky CTA Behaviour
| Viewport | Behavior |
|----------|----------|
| Desktop | Hidden. Appears after hero scrolls past. Hides when Proposal enters viewport. |
| Mobile | Always visible. Hides when Proposal enters viewport. |

#### Proposal Form Behaviour
| State | UI |
|-------|-----|
| Default | Fields: Name*, Company*, Email*, Phone, Quantity, Required Date, Message |
| Hidden | productName, productUrl, collectionName, category, occasion, productId |
| Validation | Inline errors on blur + submit. Red border on invalid fields. |
| Loading | Spinner + "Submitting...". All inputs disabled. Double-submit prevented. |
| Success | Form replaced with confirmation panel (checkmark + "Thank You" + message) |
| Failure | Red banner with error. WhatsApp CTA remains accessible. |
| Auto-focus | Name field focused after 1s |
| Analytics | `dataLayer.push({ event: 'proposal_submit', product })` |

#### Related Product Algorithm
1. Priority 1 (+4): Same Curated Gift Tags (Collection)
2. Priority 2 (+3): Same Occasion Tags
3. Priority 3 (+2): Same Category
4. Priority 4 (+1): Same Product Tags
- Max 4. Never current product. Ties randomised.
- Implemented server-side in `get-hamper.js`

#### Loading & Error States
| State | UI |
|-------|-----|
| Loading | Skeleton shimmer: gallery, text lines, chips bar |
| 404 / missing slug | Editorial error page with CTA to explore |
| Airtable timeout | Error message with WhatsApp + explore link |
| Image load failure | `onerror` → fallback placeholder image |

#### Files
| File | Role |
|------|------|
| `html/hamper/template.html` | Minimal shell with skeleton + header/footer |
| `html/hamper/hamper.css` | Complete v2 styles — 9 sections + skeleton + reduced motion (~1,050 lines) |
| `html/hamper/hamper.js` | v2 IIFE — 9 builders + 9 interaction systems (~950 lines) |
| `html/api/get-hamper.js` | Vercel serverless: single product + 4-priority related algorithm |

#### Design Principles
- No tables — use CSS Grid spec rows with thin dividers
- No card-based planning — Apple-style label + value rows
- No image-based occasion cards — icon + text cards
- No separate consultation image block — editorial highlights + form merged
- FAQ animation: 200ms (faster), chevron rotates, keyboard accessible
- Gallery: hover zoom, keyboard nav (Arrow keys), touch swipe, lightbox
- Chips: pill-style with bronze dots, clickable, linked to taxonomy pages
- Reduced motion: `@media (prefers-reduced-motion: reduce)` disables all animations

---

## 4. Page Inventory
| Page | File | Sections |
|------|------|----------|
| Home | `html/index.html` | 10 |
| About | `html/about.html` | 9 |
| Explore Hub | `html/explore/index.html` | 7 |
| Explore Template | `html/explore/template.html` | 7 |
| Hamper Detail | `html/hamper/template.html` | 9 |
| Customisation | `html/customisation.html` | 10 |
| Quote | `html/quote.html` | 6 |
| Explore Taxonomy | `html/explore/explore.html` | — |
| Legal | `html/privacy.html`, `html/terms.html` | — |
| Sitemap | `html/sitemap.html` | — |

## 5. Responsive Breakpoints
| Breakpoint | Layout Changes |
|------------|---------------|
| 1400px+ | Max container width |
| 1100px | Reduce spacing, 2-col grids, 3-col occasion |
| 768px | Stack columns, smaller headings, hamburger nav |