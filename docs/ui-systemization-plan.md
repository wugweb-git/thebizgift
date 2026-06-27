# The Biz Gift — UI Systemization Plan

**Version:** 1.0  
**Date:** June 2026  
**Owner:** Wugweb  
**Status:** Active — Phase 1  
**Related:** design.md, master-brand-document.md, content-architecture.md, build.md, tokens/*.json, ui-audit.md

---

## Objective

The website is visually inconsistent. Extensive `.md` documentation already exists, but **only a fraction of it is implemented**. Pages behave differently, components vary between pages, and many design tokens defined in the docs never reach production.

**This is a systemization project, not a redesign.** Before improving anything, the existing documented system must first become real in code.

> Finish the homework before attempting improvements.

---

## Ground Rules

1. **`design.md` is the source of truth** (with master-brand-document.md, content-architecture.md, build.md, and `tokens/*.json`). Everything starts from the documentation — not screenshots, not reference sites, not assumptions.
2. **If documentation and references conflict, `design.md` wins.** Example: a reference showing pricing / cart / "Add to Quote" / quantity steppers does **not** override design.md's consultation-first, editorial-first, no-ecommerce, quote-only model. Follow design.md.
3. **If a reference introduces a new pattern**, either map it to an existing design.md component, or **ask before implementing**. Never silently override the system.
4. **Reference images are not the source of truth.** They are used only *after* the existing system is implemented, and only for layout/hierarchy/interaction inspiration — never for content, pricing, ecommerce behaviour, CTAs, or business logic.
5. **Replace, don't duplicate.** Never create a second button/card/accordion/input if one already exists.
6. **Every value originates from a token.** No arbitrary literals.
7. **The UI Inventory is the approval gate.** Nothing gets redesigned until every existing component is visible, labeled, mapped to design.md, linked to its HTML/CSS, and marked reusable or deprecated.

---

## Why this is needed (hard audit — June 2026)

See `ui-audit.md` for the full report. Headline findings:

| Problem | Evidence |
|---------|----------|
| Type tokens never reach production | `var(--font-size-*)` used **0×** across all CSS; **197 hardcoded `font-size` literals** |
| Square buttons | `.btn-action` had **no `border-radius`** (design.md §10 says pill) — **fixed this session** |
| Radius not tokenized in pages | pages.css used `var(--radius-*)` **0×** (19 literal px) |
| Duplicate card patterns | 7 distinct card classes doing similar jobs (see audit) |

---

## Phases (do in order — do not jump ahead)

### Phase 0 — Production stable ✅ DONE
Vercel build succeeds, all pages render, navigation works, no broken assets/CSS/JS, no console errors. Site serves from the repo root (zero-config, transferable). **Live:** https://thebizgift.vercel.app

### Phase 1 — Materialise existing documentation (current)
Read design.md (+ related .md), tokens/*.json, CLAUDE.md, HTML, CSS, JS. Do **not** redesign while reading — extract the system. Build a UI inventory: for every item answer *Does it exist? Where? What CSS controls it? Reusable? Duplicated? Missing?*

**Deliverable: a single scrolling inventory page** — `styleguide.html` (live at `/styleguide.html`). Every existing UI element appears, labeled with: Component Name · Source file · CSS file · Mapped design.md § · Tokens used · Reusable (♻) / Deprecated. This is the living documentation and the **approval gate**.

### Phase 2 — Component mapping
Identify every reusable component (buttons, cards, inputs, accordions, FAQs, CTAs, tags, pills, nav, breadcrumbs, section headers, image overlays, quote forms, success/error states, badges, collection/occasion/product cards, footer blocks, editorial blocks, hero, gallery, media grids, specifications, trust cards, planning info, …). **Map only — do not improve.** Matrix lives in `ui-audit.md`.

### Phase 3 — Component health check
For every mapped component: Does it follow design.md? Use tokens? Use primitives? Reuse an existing component? Is another version already implemented? Can it replace duplicates? Only after this audit can components be upgraded.

### Phase 4 — Token compliance
Verify implementation against the token system: typography, spacing, radius, elevation, motion, shadow, colour, icons, grid, containers, animation, z-index. Every primitive originates from tokens; nothing uses arbitrary values. (Finish the 197-literal type sweep started this session.)

### Phase 5 — Standardise components
Replace duplicate implementations with canonical ones. Fold the 7 card classes into the documented set; one button system; one accordion; one input. Replace, don't duplicate.

### Phase 6 — Block replacement (page-by-page)
Upgrade pages by **replacing larger sections with already-approved reusable blocks** (old FAQ → approved FAQ block; old Hero → approved Hero; old CTA → approved CTA). Keeps pages consistent. **Only then** begin visual refinement.

---

## Deliverables (in order)
1. Production builds and deploys ✅
2. Complete documentation audit → `ui-audit.md`
3. UI inventory / one-page component browser → `styleguide.html` ✅ (expanding)
4. Component mapping matrix → `ui-audit.md`
5. Token compliance report → `ui-audit.md`
6. Duplicate component report → `ui-audit.md`
7. Missing component report → `ui-audit.md`
8. Component consolidation (Phase 5)
9. Page-by-page replacement using approved blocks (Phase 6)
10. Only then, visual refinement

---

## Kickoff prompt for the next working chat

> Continue The Biz Gift **UI Systemization** (see `docs/ui-systemization-plan.md` + `docs/ui-audit.md`). `design.md` and the other `.md` + `tokens/*.json` are the source of truth — do **not** use reference images. We are on **Phase 4 → 5**: finish wiring the remaining ~190 hardcoded `font-size` / radius / spacing literals to tokens across `style.css`, `pages.css`, `hamper/hamper.css`, then consolidate the 7 duplicate card classes into the canonical set from `styleguide.html`. Replace, don't duplicate. Keep the styleguide inventory in sync and labeled. After each batch, verify (preview, zero console errors, tokens resolve) and **deploy live**. Do not start Phase 6 page-block replacement or any visual refinement until I approve the inventory.
