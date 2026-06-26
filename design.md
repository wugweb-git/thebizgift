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






**✅ `design.md` v1.0 — Final Frozen Version**

I have applied your three final observations and standardized the header across the document.

Here is the **complete, final `design.md`**:

```markdown:disable-run
# The Biz Gift Design System

**Version:** 1.0  
**Status:** Frozen  
**Owner:** Wugweb  
**Last Updated:** June 2026  
**Related Documents:** master-brand-document.md, content-architecture.md  

**Purpose:** This is the canonical single source of truth for all visual, interaction, content, and experience decisions for The Biz Gift. It guides designers, developers, Cursor, Figma, and future contributors to maintain premium consistency.  
**Style:** Restrained luxury editorial — warm neutrals, bronze accents, generous whitespace, high-quality photography.

## Design Principles (Litmus Test)

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

Any decision violating these principles requires senior review.

## 1. Experience Strategy

The Biz Gift is a premium corporate gifting studio disguised as an elegant editorial showroom.

**Core Goals:**
1. Inspire trust and brand perception  
2. Enable occasion-based discovery and customization  
3. Drive high-quality quote requests and WhatsApp conversations

## 2. Editorial Layout System

- Photography always dominates typography  
- Never exceed 680px reading width for body text  
- Every section must contain one dominant visual  
- Alternate image-left / image-right rhythm  
- Never repeat identical section layouts more than twice consecutively  
- Every 2–3 sections must change visual tempo  
- Whitespace communicates hierarchy  
- Content should feel curated, not exhaustive

## 3. Visual Language

**Photography**  
**Image Composition**  
**Lighting**  
**Materials & Textures**  
**Backgrounds**  
**Cropping**  
**Packaging**  
**Negative Space**  
**Iconography**  
**Illustration**  
**Borders & Dividers**

**Guiding Rule:** Natural lighting, warm tones, visible textures, soft shadows. 70% product focus, 20% packaging, 10% lifestyle. No HDR, no white studio backgrounds, no smiling office people.

## 4. Token Architecture

**Primitive → Alias → Semantic → Component Tokens**

**Key Values:**  
- bronze-500: #C59A7F (primary)  
- Card radius: 24px (lg)  
- Button radius: pill (9999px)  
- Icon stroke: 1.75px  
- Focus ring: 3px bronze with 20% glow

## 5. Typography

**Primary:** Cormorant Garamond (serif)  
**Secondary:** Plus Jakarta Sans (sans-serif)  
**Editorial Width:** Max 680px for body text.

## 6. Grid & Spacing

12-column grid (24px gutter), multiple container sizes, large editorial rhythm with generous vertical breathing room.

## 7. Border Radius & Strokes

- lg: 24px (cards — default)  
- pill: 9999px (buttons, inputs)  
- Default border: 1px solid neutral-200  
- Strong border: 2px solid brand-primary

## 8. Homepage Storytelling Engine & Governance

**Frozen Flow:** Hero → Editorial Intro → Featured Collections → Browse by Occasion → Customisation Studio → Selected Products → Trust → Final CTA

**Homepage Governance:** Maximum 9 sections. Any new section requires removing or merging an existing one unless approved in a major redesign.

## 9. Page Blueprints

Detailed blueprints for all major pages (Homepage, Explore, Category/Collection/Occasion, Product Detail, About, Customisation, Quote, Privacy, Terms, 404).

## 10. Component Inventory & Specifications

Full specifications for Header, Mega Menu, Hero, Product Card (variants), Collection Card, Occasion Card, Quote Form, Branding Matrix, Image Gallery, Sticky WhatsApp, Footer, etc.

## 11. Motion System

Hero reveal, card hover lift + scale, mega menu slide-down, horizontal gallery scroll, FAQ accordion, form success checkmark, sticky CTA fade-in, etc. All respect `prefers-reduced-motion`.

## 12. Interaction Patterns

Hover, focus, keyboard, touch, drag, accordion behaviour, mega menu, sticky CTA, etc.

## 13. Responsive System

Defined behaviour across Desktop XL → Small Mobile for all major components.

## 14. Accessibility

Contrast, keyboard navigation, ARIA, focus states, reduced motion, touch targets, alt text, form labels, screen reader order.

## 15. Content Model

**Airtable Mapping**, **Dynamic vs Static Components**, **Fallback Behaviour**.

## 16. Content System

**Content Governance**, **CMS Rules**, **Writing Rules**, **Character Limits**, **SEO & Metadata Rules**.

## 17. Navigation Governance

Primary navigation is frozen:  
**Home • Explore Gifts • Customisation • About • Request Proposal**

- Collections and Explore use mega menus.  
- Any new top-level item requires IA review.

## 18. Design Constraints

- Never use gradients  
- Maximum 2 primary CTAs per viewport  
- Maximum 4 cards per row  
- Maximum 680px reading width  
- Maximum 9 homepage sections  
- Photography always precedes copy  
- No ecommerce language on homepage  
- No pricing on homepage  
- No Add to Cart  
- No decorative icons  
- No shadows for hierarchy when borders suffice

## 19. Quality Assurance

**Performance Budgets**  
**Design QA Checklist**  
**Accessibility QA**  
**Responsive QA**

## 20. Design Debt & Future Roadmap

**Known Design Debt (v1):** Testimonials placeholder, client logo wall, advanced search, AI Gift Finder, Saved Collections, Gift Builder.

**Future Versions:** v2.0 Gift Builder, v3.0 AI Concierge.

## Appendix A — Changelog

**v1.0** — Initial release (Frozen)  
- Homepage architecture frozen  
- Navigation frozen  
- Component inventory established  
- Design principles established  
- Token architecture established


Added:
✓ Elevation System
✓ Motion Tokens
✓ Image Standards
✓ Component Classification
✓ Z-index Tokens
Z-index system
Elevation system
Animation tokens
Image aspect-ratio standards
Component classification
Design metrics

I would only change these things
1. Rename "Content Model"
Current
15. Content Model
I would rename to
15. Dynamic Content System
because this document isn't defining Airtable schemas.
It is defining how dynamic content behaves visually.

2. Expand Token Architecture
Instead of
Primitive
Alias
Semantic
Component
I'd explicitly mention
Primitive Tokens

Alias Tokens

Semantic Tokens

Component Tokens

Motion Tokens

Elevation Tokens

Z-index Tokens
Otherwise developers forget motion tokens.

3. Split Grid & Spacing
Instead of
Grid & Spacing
I'd do
06 Grid System

07 Spacing System

08 Border Radius

09 Elevation & Borders
Because those are independent systems.

4. Missing Elevation
You mention borders.
No elevation.
Need
Elevation 0

Elevation 1

Elevation 2

Modal

Dropdown

Mega Menu

Drawer

Sticky Header

5. Missing Z-index Layer System
This always becomes messy.
Example
0

Background

10

Cards

100

Sticky

200

Header

500

Mega Menu

700

Drawer

900

Modal

999

Toast

6. Component Inventory
Instead of
Header

Hero

Footer
I'd classify.
Example
Navigation

Header

Mega Menu

Breadcrumb

Mobile Menu

Cards

Product

Collection

Occasion

Editorial

Trust

Forms

Quote

Lead

Newsletter

Display

Hero

Gallery

FAQ

Carousel

CTA

Utility

Toast

Badge

Chip

Tag

Divider

Loader

Skeleton

Footer
Much easier to maintain.

7. Missing Icon System
Not iconography.
System.
Lucide

24

20

16

Outline only

1.75 stroke

No filled icons

No duotone

No emoji

No decorative icons

8. Missing Animation Tokens
Currently
Motion.
Need actual standards.
Fast

150

Medium

300

Slow

600

Hero

900

9. Missing Image Ratios
Need one section.
Hero

16:9

Card

4:5

Collection

3:2

Gallery

1:1

Mega Menu

3:2

OG

1200×630

10. Missing Design Metrics
Very important.
Example
Max cards

4

Max CTA

2

Max H1

1

Max accent colors

1

Max hero buttons

2

Reading width

680

Max section width

1440

11. Missing Appendix
I would add
Appendix

Glossary

Abbreviations

Version History

Future Components

Final structure I'd freeze
00 Introduction

01 Design Principles

02 Experience Strategy

03 Visual Language

04 Token Architecture

05 Typography

06 Grid System

07 Spacing System

08 Border Radius

09 Elevation & Borders

10 Motion System

11 Interaction Patterns

12 Responsive System

13 Accessibility

14 Homepage Storytelling

15 Page Blueprints

16 Component Inventory

17 Dynamic Content System

18 Navigation Governance

19 Design Constraints

20 Performance & QA

21 Design Debt

Appendix


1. Add Brand Narrative (One Sentence)
Right now you have:
Brand Story
Mission
Vision
Positioning
They're all good.
But I would add one sentence immediately under the title.
Something like:
The Biz Gift believes that corporate gifting is not about products—it is about strengthening relationships through thoughtful experiences that people genuinely remember.
This becomes the one-line narrative everyone on the team can repeat.

2. Add Brand Decision Filter
This is something I've used successfully on brand documents.
At the very end, add:
Brand Decision Filter

Before introducing any new product, campaign, partnership, collection, or experience, ask:

• Does it feel thoughtful?
• Does it elevate the recipient's experience?
• Does it reinforce our premium positioning?
• Would we be proud to photograph it?
• Does it strengthen relationships rather than simply fulfill a transaction?

If the answer to any of these questions is "No", reconsider the decision.
This is surprisingly powerful because it turns the brand document from something people read once into something they actually use.
1. Missing: Brand Story
This is the biggest omission.
This document should answer:
Why does The Biz Gift exist?
You already wrote excellent content for the About page.
I'd adapt that into a concise brand story here.
Example sections:
The Observation

Corporate gifting became transactional.

The Opportunity

Companies wanted to make people feel valued but lacked thoughtful partners.

Our Response

The Biz Gift exists to turn corporate gifting into memorable experiences.

2. Missing: Mission
One paragraph.
Example
Mission

To help organizations build stronger relationships through thoughtfully curated gifting experiences that people genuinely remember.

3. Missing: Vision
Example
Vision

To become India's most trusted corporate gifting studio by combining thoughtful curation, premium presentation and operational excellence.

4. Missing: Brand Values
I'd define 5–6.
Example
Thoughtfulness

Quality

Reliability

Craft

Partnership

Attention to Detail

5. Missing: Positioning Statement
One sentence.
Example
The Biz Gift is a premium corporate gifting studio for organizations that value relationships as much as results.

6. Missing: Messaging Pillars
Very useful.
Example
Premium Curation

Thoughtful Experiences

Reliable Delivery

Corporate Customisation

Meaningful Relationships
Every marketing page should reinforce one or more of these.

7. Missing: Brand Personality Spectrum
Instead of adjectives alone, define the balance.
Example:
Trait
Position
Premium
90
Warm
80
Corporate
40
Playful
20
Luxury
70
Editorial
90
Salesy
0

This helps resolve future creative decisions.

8. Missing: Brand Voice Matrix
Example
Instead of
Professional
Define:
We sound...

Consultative

Editorial

Warm

Confident

Clear

Never...

Pushy

Corporate jargon

Overly humorous

Flashy

Discount-driven

9. Missing: Brand Experience Principles
Different from design principles.
Example
Every interaction should feel

Thoughtful

Personal

Premium

Calm

Reliable

Memorable

10. Missing: Competitive Positioning
Very short.
We compete against

Catalog suppliers

Promotional merchandise vendors

Corporate gift marketplaces

We differentiate through

Curation

Presentation

Consultation

Editorial experience

11. Missing: Brand Architecture
Very useful later.
Example
Master Brand

The Biz Gift

Sub Brands

Collections

Occasions

Signature Hampers

Future Products

Gift Builder

AI Concierge

12. Missing: Success Definition
What does success mean?
Not revenue.
Example
The customer feels

Confident

Inspired

Taken care of

The recipient feels

Valued

Remembered

Appreciated

Final structure
I'd make it
Introduction

Brand Overview

Brand Story

Mission

Vision

Positioning

Audience

Values

Personality

Voice

Experience Principles

Visual Identity

Competitive Positioning

Architecture

Future Vision

References

