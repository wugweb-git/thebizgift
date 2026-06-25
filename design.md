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

### Hamper Detail
| Order | Block | Purpose |
|-------|-------|---------|
| 1 | Hero | 55/45 split (image / title+details) |
| 2 | Why This Exists | Narrative |
| 3 | What's Inside | 5 items |
| 4 | Perfect For | 4 cards |
| 5 | Customisation | 9 options |
| 6 | Planning | Timelines, MOQ info |
| 7 | Similar | Related items |
| 8 | Proposal | Hidden fields, quote CTA |
| 9 | Statement | Brand line |

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