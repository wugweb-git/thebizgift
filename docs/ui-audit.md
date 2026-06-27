# The Biz Gift — UI Audit (Phase 1–5 working report)

**Date:** June 2026 · **Owner:** Wugweb · **Companion to:** ui-systemization-plan.md, styleguide.html

This is the living audit: token-compliance, component-map matrix, duplicate report, missing report. Updated as the systemization progresses.

---

## 1. Token Compliance Report

### Typography ✅ COMPLETE
| File | `var(--font-size-*)` used | Hardcoded literals remaining |
|------|---------------------------|------------------------------|
| style.css | 50 | 5 (intentional: 2 special + 3 responsive) |
| pages.css | 87 | 0 |
| hamper.css | 59 | 0 |
| **Total** | **196** | **5 (intentional)** |

- **Token scale expanded** from 8 to 14 tokens: added `--font-size-card-title` (1.5rem), `--font-size-subtitle` (1.25rem), `--font-size-nav` (0.9rem), `--font-size-label` (0.85rem), `--font-size-small-button` (0.8rem), `--font-size-overline` (0.75rem).
- **Remaining 5 intentional:** `font-size: 0` (icon hiding), `0.7em` (relative dropdown arrow), 3 responsive media query overrides.

### Radius ✅ COMPLETE
| File | `var(--radius-*)` used | Hardcoded literals remaining |
|------|------------------------|------------------------------|
| style.css | 12 | 1 (`1px` hairline — intentional) |
| pages.css | 16 | 0 |
| hamper.css | 15 | 0 |

- All `24px` → `--radius-lg`, `12px` → `--radius-md`, `16px` → `--radius-lg`, `50px` → `--radius-full`, `6px` → `--radius-sm`.
- Added `--radius-2xl: 48px` (from radius.json, was missing in `:root`).

### Color ✅ COMPLETE
| File | Hardcoded hex colors remaining |
|------|-------------------------------|
| style.css | 0 |
| pages.css | 0 |
| hamper.css | 0 |

- **Error colors standardized:** 3 inconsistent reds (#DC2626, #9B2C2C, #D32F2F) → unified to `var(--color-error)`.
- **Success green fixed:** #4CAF50 → `var(--color-success)` (#16A34A — matches token).
- **New semantic tokens added:** `--color-error-bg`, `--color-error-border`, `--color-success-bg`, `--color-whatsapp-hover`, `--border-form`, `--skeleton-base`, `--skeleton-shine`.

### Spacing (strategic tokenization)
| Token | Count | Status |
|-------|-------|--------|
| `--space-layout` | ~30 uses | ✅ Already in use |
| `--space-section-y` / `--space-section-inner-y` | defined | Available for Phase 6 block replacement |
| `--space-card-padding` | defined | Available for Phase 5 card consolidation |
| Scale `--space-1` through `--space-40` | defined | Available for component-level adoption |

- **Strategy:** Section-level and grid spacing tokens are defined and available. Component-internal spacing kept as literals (intentional — optical adjustments that vary by component).

### Other token families
- **Elevation:** `--elevation-0…3` consumed across all files. ✅
- **Z-index:** `--z-header/mega-menu/drawer/modal` consumed. ✅
- **Motion:** `--ease-*`, `--transition-fast/slow` consumed. ✅

---

## 2. Component Map Matrix

| Component | HTML source | CSS | design.md § | Tokens | Status |
|-----------|-------------|-----|-------------|--------|--------|
| Button | shared | style.css `.btn-action` (+variants) | §18 Buttons | radius-full, font-size-button, font-size-nav, font-size-small-button | ♻ canonical |
| Nav link / dropdown | header.html | style.css `.nav-link` `.dropdown-toggle` | §18 Nav | font-size-nav | ♻ |
| Mega menu | header.html | style.css `.mega-menu` | §15/§18 | z-mega-menu, elevation-3, font-size-overline, font-size-label | ♻ |
| Section header | all pages | pages.css `.section-header` | §18 Content | font-size-h2, font-size-body | ♻ |
| Chip / tag | hamper, styleguide | hamper.css `.hamper-hero-chip`, pages `.collection-tag` | §18 Utility | radius-full, font-size-small-button | ♻ |
| Newsletter form | newsletter.html | style.css `.newsletter-form` | §18 Footer | radius-full, font-size-small, font-size-button | ♻ |
| Quote form | quote.html | pages.css `.quote-form` `.form-row` `.form-group` | §17 Quote | radius-full, border-form, color-error-* | ♻ |
| Hamper proposal form | hamper/template.html | hamper.css `.hamper-proposal-*` | §14-09 | radius-full, border-form, color-error-* | ♻ |
| FAQ accordion (home) | index.html | style.css `.home-faq-item` | §14-07 | font-size-subtitle, font-size-small | ⚠ consolidate |
| FAQ accordion (hamper) | hamper/template.html | hamper.css `.hamper-faq-*` | §14-07 | — | ⚠ consolidate |
| Breadcrumb | hamper | hamper.css `.hamper-breadcrumb` | §18 Nav | font-size-label | ⚠ PDP-only |
| WhatsApp widget | footer.html | style.css `.whatsapp-sticky-widget` | §18 Footer | color-whatsapp, radius-full, font-size-nav | ♻ |
| Social icons | footer.html | style.css `.footer-socials-compact` | §18 Footer | — | ♻ |
| Footer system | footer.html | style.css `.site-footer` `.footer-compact` | §18 Footer | bg-charcoal, border-subtle, font-size-label, font-size-overline | ♻ |
| Hero (homepage) | index.html | style.css `.hero-section` | §17 Home | font-size-hero, font-size-subtitle | ♻ |
| Hero (about) | about.html | pages.css `.about-hero-section` | §17 About | font-size-hero, font-size-small-button | ♻ |
| Hero (explore) | explore/index.html | pages.css `.explore-hero` | §17 Explore | font-size-h3, font-size-body | ♻ |
| Hero (quote) | quote.html | pages.css `.quote-hero-section` | §17 Quote | font-size-hero, font-size-body | ♻ |
| Hero (hamper) | hamper/template.html | hamper.css `.hamper-hero` | §14/§24 | font-size-h3, font-size-label | ♻ |
| Gallery | hamper/template.html | hamper.css `.hamper-gallery` | §24 | — | ♻ PDP-only |
| Lightbox | hamper/template.html | hamper.css `.hamper-lightbox` | §24 | z-modal, elevation-3 | ♻ PDP-only |
| Sticky CTA | hamper/template.html | hamper.css `.hamper-sticky-cta` | §24 | — | ♻ PDP-only |
| Skeleton loader | hamper/template.html | hamper.css `.hamper-skeleton` | §24 | skeleton-base, skeleton-shine | ♻ PDP-only |
| Reveal animations | all pages | style.css `.reveal` `.reveal-*` | §12 Motion | ease-premium | ♻ |
| Cards (occasion) | explore, home, custom | `.media-card.occasion-card` | §18 Cards | radius-lg, elevation-2, font-size-h4 | ✅ extends media-card |
| Cards (category) | explore | `.media-card.category-card` | §18 Cards | radius-lg, elevation-2, font-size-card-title | ✅ extends media-card |
| Cards (selected) | explore, home | `.media-card.selected-card` | §18 Cards | radius-lg, elevation-2, font-size-subtitle | ✅ extends media-card |
| Cards (experience) | customisation | `.media-card.experience-card` | §18 Cards | radius-lg, elevation-1, font-size-subtitle | ✅ extends media-card |
| Cards (editorial) | home, explore | `.editorial-card.collection-editorial-card` | §18 Cards | radius-lg, font-size-card-title | ✅ extends editorial-card |
| Cards (create) | home | style.css `.create-card` | §17 Home | font-size-card-title, font-size-small | ♻ standalone (unique animation) |
| Cards (moment) | about | pages.css `.moment-card` | §17 About | elevation-2, font-size-h4 | ♻ standalone (no border/radius) |
| Cards (philosophy) | about | pages.css `.philosophy-card` | §17 About | font-size-h4 | ♻ standalone (no hover/border) |

---

## 3. Duplicate Component Report

**Cards — consolidated into canonical base classes (Phase 5 ✅):**

| Class | Status | Base | Overrides |
|-------|--------|------|-----------|
| `.occasion-card` | ✅ extends `.media-card` | style.css §2b | aspect 3:2 |
| `.category-card` | ✅ extends `.media-card` | style.css §2b | aspect 4:3, card-title font, tighter padding |
| `.selected-card` | ✅ extends `.media-card` | style.css §2b | aspect 4:5, -8px hover, subtitle font, CTA button |
| `.experience-card` | ✅ extends `.media-card` | style.css §2b | aspect 1:1, -4px hover, elevation-1, margin-based padding |
| `.collection-editorial-card` | ✅ extends `.editorial-card` | style.css §2b | (no overrides needed) |
| `.create-card` | ♻ standalone | style.css §6 | unique scatter animation, no radius |
| `.moment-card` | ♻ standalone | pages.css | no border/radius/bg — structurally different |
| `.philosophy-card` | ♻ standalone | pages.css | text-center, no hover — structurally different |

**Accordion — merged into canonical `.faq-*` classes (Phase 5 ✅):**
- Canonical `.faq-item`, `.faq-question`, `.faq-answer` defined in style.css §2c.
- Home FAQ (index.html) uses `faq-item home-faq-item` dual-class; section wrapper overrides max-width only.
- Hamper FAQ (hamper.js) uses `faq-item hamper-faq-item` dual-class; overrides max-width + answer `p` max-width.
- ~55 lines of duplicate CSS eliminated.

**Buttons:** all context variants now consume tokens. ✅

---

## 4. Missing Component Report

Documented in design.md §18 but not implemented (do NOT build until needed by an approved block):
- Breadcrumb on non-PDP pages (taxonomy/explore)
- Testimonials, Statistics, Client logo wall
- Announcement bar
- Pagination, Search, Filters, Sort (Phase 2 features — deferred)
- Timeline

---

## 5. Session History

### Session 1 (prior)
- Buttons + inputs → pill (`--radius-full`) globally. ✅
- Base `h1–h4` typography baseline mapped to tokens. ✅
- styleguide.html created with 17 component groups. ✅

### Session 2 (current)
- **Token foundation expanded:** `:root` grew from ~40 to 106 custom properties. Added spacing scale (16 values), 6 new typography tokens, 7 semantic color tokens, `--radius-2xl`.
- **Styleguide completed:** 27 component groups (was 17). Added navigation, footer, forms, hero variants, hamper/PDP, explore, about, customisation, reveal utilities, utility pages.
- **Phase 4 typography sweep:** 190 hardcoded font-size literals → 196 token references. Zero hardcoded remaining (5 intentional).
- **Phase 4 radius sweep:** 20 hardcoded border-radius → tokenized. Zero remaining.
- **Phase 4 color sweep:** 21 hardcoded hex colors → tokenized. Error colors standardized (3 variants → 1). Success green fixed.

### Session 3 (current)
- **Phase 5 card consolidation:** Canonical `.media-card` base (style.css §2b) — shared by 4 card types (occasion, category, selected, experience). Canonical `.editorial-card` base — shared by collection-editorial. 3 standalone cards kept as-is (create, moment, philosophy — structurally different).
- **Phase 5 FAQ merge:** Canonical `.faq-item`, `.faq-question`, `.faq-answer` (style.css §2c). Both home and hamper accordions now extend the canonical base via dual-class. ~55 lines of duplicate CSS removed.
- **HTML updated:** All consolidated cards and FAQ items now carry canonical + specific classes (additive, non-breaking).

## 6. Next (Phase 6)
- Phase 6 (page-by-page block replacement) pending user approval.
- Styleguide update to reflect canonical card/accordion classes.
- Optional: shared form base styles (quote form + hamper proposal form share ~80% of properties).
