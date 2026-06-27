# The Biz Gift — UI Audit (Phase 1–4 working report)

**Date:** June 2026 · **Owner:** Wugweb · **Companion to:** ui-systemization-plan.md, styleguide.html

This is the living audit: token-compliance, component-map matrix, duplicate report, missing report. Updated as the systemization progresses.

---

## 1. Token Compliance Report

Tokens are defined in `:root` (style.css) and `docs/tokens/*.json`, but components historically used literals instead of consuming them.

### Typography
| File | `var(--font-size-*)` used | Hardcoded `font-size` literals remaining |
|------|---------------------------|------------------------------------------|
| style.css | 8 | 47 |
| pages.css | 2 | 85 |
| hamper.css | 1 | 58 |
| **Total** | **11** | **~190** |

- **Before this session:** `var(--font-size-*)` used **0×**; 197 literals.
- **This session (system-level fix):** added base `h1–h4` rules mapped to tokens + wired hero title, `.section-header h2`, button + newsletter + submit fonts. The remaining ~190 literals are **component-local sizes** (card h3/h4, captions, chips, spec rows) → **Phase 4 sweep** in the next chat.

### Radius
| File | `var(--radius-*)` used | Status |
|------|------------------------|--------|
| style.css | 4 | buttons + inputs now pill (`--radius-full`) ✅ |
| pages.css | 1 | explore cards tokenized; ~19 literals remain (cards 24px, panels 12px) |
| hamper.css | 14 | mostly tokenized |

- **This session:** `.btn-action`, `.newsletter-form` input/button, `.btn-submit`, hamper proposal submit → `--radius-full` (fixes "square buttons" everywhere).

### Other token families (already aligned in prior session)
- **Color:** ~50 hardcoded `#FFFFFF` / `#EAEAE6` replaced with `--surface-white` / `--border-light`. ✅
- **Elevation:** 16 custom shadows → `--elevation-0…3`. ✅
- **Z-index:** 1000/999/9999 → `--z-header/mega-menu/modal` (200/500/900). ✅
- **Motion:** `--ease-*`, `--duration-*` defined; transitions consume `--transition-fast/slow`. Scroll reveals via IntersectionObserver in components.js. ⚠ uneven across pages — Phase 4/6.

---

## 2. Component Map Matrix

| Component | HTML source | CSS | design.md § | Tokens | Status |
|-----------|-------------|-----|-------------|--------|--------|
| Button | shared | style.css `.btn-action`(+primary/secondary/large/small) | §18 Buttons | radius-full, font-size-button | ♻ canonical (pill ✅) |
| Nav link / dropdown | header.html | style.css `.nav-link` `.dropdown-toggle` | §18 Nav | — | ♻ |
| Mega menu | header.html | style.css `.mega-menu` | §15/§18 | z-mega-menu, elevation-3 | ♻ |
| Section header | all pages | pages.css `.section-header` | §18 Content | font-size-h2 ✅ | ♻ |
| Chip / tag | hamper, styleguide | hamper.css `.hamper-hero-chip`, pages `.collection-tag` | §18 Utility | radius-full | ♻ |
| Newsletter form | newsletter.html | style.css `.newsletter-form` | §18 Footer | radius-full ✅ | ♻ |
| Quote / proposal form | quote.html, hamper | pages `.btn-submit`, hamper proposal | §14-09 | radius-full ✅ | ♻ |
| FAQ accordion | index, hamper | style.css `.home-faq-item`, hamper FAQ | §14-07 | — | ⚠ 2 implementations → consolidate |
| Breadcrumb | hamper | hamper.css `.hamper-breadcrumb` | §18 Nav | — | ⚠ PDP-only; missing elsewhere |
| WhatsApp widget | footer.html | style.css `.whatsapp-sticky-widget` | §18 Footer | color-whatsapp, radius-full | ♻ |
| Social icons | footer.html | style.css `.footer-socials-compact` | §18 Footer | — | ♻ |

---

## 3. Duplicate Component Report

**Cards — 7+ overlapping implementations doing similar jobs:**

| Class | Used on | Pattern | Recommended action |
|-------|---------|---------|--------------------|
| `.occasion-card` | explore, styleguide | image + content | **Canonical "media card"** |
| `.category-card` | explore | image + content | fold → media card (4:3) |
| `.selected-card` | explore | image + CTA | fold → product card |
| `.create-card` | home (What We Create) | image + text | fold → media card |
| `.moment-card` | about | image + text | fold → media card |
| `.collection-editorial-card` | home, explore | **text-only** | **Canonical "editorial card"** |
| `.philosophy-card` | about | text-only | fold → editorial card |
| `.experience-card` | (legacy) | — | verify usage / deprecate |

**Buttons:** `.btn-action` (+ variants) is canonical. `.btn-quote-header`, `.btn-arrow`, `.btn-whatsapp-hero`, `.btn-whatsapp-large`, `.btn-submit` are context buttons — keep but ensure all consume `--radius-full` + `--font-size-button` (done for submit/newsletter; verify the rest in Phase 5).

**Accordion:** home `.home-faq-item` vs hamper FAQ — two implementations → one canonical accordion.

---

## 4. Missing Component Report

Documented in design.md §18 but not implemented (do NOT build until needed by an approved block):
- Breadcrumb on non-PDP pages (taxonomy/explore)
- Testimonials, Statistics, Client logo wall
- Announcement bar
- Pagination, Search, Filters, Sort (Phase 2 features — deferred)
- Timeline

---

## 5. This-session changes (system-level, not redesign)
- Buttons + inputs → pill (`--radius-full`) globally. ✅
- Base `h1–h4` typography baseline mapped to `--font-size-*`; canonical hero + section-header + form fonts wired. ✅
- No per-page block replacement (deferred to Phase 6 per ground rules).

## 6. Next (Phase 4 → 5, next chat)
- Sweep remaining ~190 type literals + ~19 radius literals → tokens.
- Consolidate the 7 card classes into media-card + editorial-card + product-card.
- Merge the two FAQ accordions.
- Keep `styleguide.html` in sync after each batch.
