# The Biz Gift — Project Instructions

## Overview

Premium B2B corporate gifting website for the Indian market. Static HTML/CSS/JS site deployed on Vercel with Airtable as the planned CMS (currently using mock data).

**Live URL:** https://thebizgift.vercel.app

## Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES2020+) — no framework, no build step
- **CMS:** Airtable (Phase 2 — currently static with mock data)
- **Hosting:** Vercel (static + serverless functions)
- **Fonts:** Google Fonts (Cormorant Garamond, Plus Jakarta Sans)
- **Design Tokens:** 7 JSON files in `docs/tokens/` (colors, typography, spacing, radius, motion, elevation, zindex), implemented as CSS custom properties

## Project Structure

```
/
├── docs/                              # Documentation (not deployed)
│   ├── README.md                      # Project overview & migration checklist
│   ├── master-brand-document.md       # WHY — strategy, voice, values, messaging pillars
│   ├── design.md                      # HOW IT FEELS — 26-section canonical design system
│   ├── content-architecture.md        # WHAT CONTENT — CMS, IA, Airtable schema, taxonomy
│   ├── build.md                       # HOW IT'S BUILT — engineering reference
│   ├── decision-log.md                # 10 settled architectural decisions
│   ├── tokens/                        # Design token JSON files (7 files)
│   └── assets/                        # Moodboards, references
│
│   # ── Site files live at the repo root (served directly by Vercel) ──
├── vercel.json                        # Vercel config (headers, caching)
├── .vercelignore                      # Excludes docs/ + dev files from deploy
├── index.html                         # Homepage (15 sections)
├── about.html                         # About (9 sections)
├── customisation.html                 # Customisation studio (10 sections)
├── quote.html                         # Quote/lead form (6 sections)
├── privacy.html, terms.html           # Legal pages
├── sitemap.html                       # Sitemap
├── style.css                          # Global styles + design tokens
├── pages.css                          # Page-specific overrides
├── components.js                      # Shared component loader (fetch header/footer/newsletter)
├── header.html                        # Shared header + mega menu
├── footer.html                        # Shared footer + WhatsApp widget
├── newsletter.html                    # Newsletter signup component
├── image/                             # Static image assets
├── api/                               # Vercel serverless functions (deploy as /api/*)
│   ├── get-featured-hampers.js        # Featured product grid
│   ├── get-hamper.js                  # Single product + related algorithm
│   ├── get-occasions.js               # Published occasion tags (explore page)
│   ├── get-collections.js             # Published collections (explore page)
│   ├── get-categories.js              # Published categories (explore page)
│   ├── submit-lead.js                 # Quote/proposal/newsletter leads
│   └── _lib/cors.js                   # Shared origin allowlist for all api/*.js
├── explore/                           # Explore hub pages
│   ├── index.html                     # Main explore hub (7 sections)
│   └── explore.html                   # Alternate taxonomy template
├── hamper/                            # Product detail pages
│   ├── template.html                  # PDP shell + skeleton
│   ├── hamper.css                     # PDP v2 styles (~1,050 lines)
│   ├── hamper.js                      # PDP v2 IIFE + mock data (~950 lines)
│   └── [product-slug]/index.html      # Product URL routing
├── CLAUDE.md                          # This file
├── CLAUDE.local.md                    # Local dev config (not committed)
└── README.md                          # GitHub-facing project overview
```

## Key Rules

1. **Site is served from the repo root** — all site files (pages, `style.css`, `api/`, `image/`, components) live at the repo root. Absolute paths (`/style.css`, `/image/...`, `/api/...`) resolve from there. No Vercel "Root Directory" setting is required — this keeps deploys zero-config and transferable to any Vercel account. `docs/` is excluded from deploys via `.vercelignore`.
2. **No framework** — vanilla HTML/CSS/JS only, no build step
3. **Airtable integration is Phase 2** — site currently runs on static content and mock data in `hamper.js`
4. **SEO is out of scope** for the current phase
5. **Never commit API keys** — Airtable credentials go in Vercel environment variables only
6. **Design tokens are the source of truth** — no hardcoded colors, spacing, or typography values; source lives in `docs/tokens/*.json`
7. **Reuse before creating** — check existing components (`header.html`, `footer.html`, `components.js`) and CSS patterns first
8. **Shared components load via fetch()** — `components.js` injects header, footer, and newsletter into placeholder `<div>` elements
9. **Mock data on localhost** — `hamper.js` detects localhost/127.0.0.1 and renders built-in `MOCK_DATA` instead of calling the API
10. **Design system is frozen** — design.md v1.2 is the canonical reference; do not invent new components, tokens, or patterns without consulting it

## Local Development

```bash
# Run from the repo root (site files now live at root)
# Option 1: Python
python3 -m http.server 4321

# Option 2: npx serve
npx serve . -l 4321

# Then open http://localhost:4321
```

On localhost, product pages render from built-in mock data and forms simulate success (no Airtable calls needed). The API serverless functions (`api/*`) only execute on Vercel — they won't run on a static server.

## Airtable Integration

- **Status:** Products, Occasions, Collections, and Categories are live-synced (read-only, gated on each table's `Published`/`Website Ready` flag). FAQs are not yet wired up — see content-architecture.md §15.
- **Base ID:** Set as `AIRTABLE_BASE_ID` env var in Vercel (`appG2IVjN168FLoqT`)
- **API Key:** Set as `AIRTABLE_API_KEY` env var in Vercel (PAT) — must have read access to Products, Occasions, Collections, Category, and Leads
- **Tables:** Products, Collections, Occasions, Category, Sub Category, FAQs, Leads
- **API endpoints:** `/api/get-featured-hampers.js`, `/api/get-hamper.js`, `/api/get-occasions.js`, `/api/get-collections.js`, `/api/get-categories.js`, `/api/submit-lead.js`
- **Mock data swap:** `hamper.js` and `explore/index.html` both key off `window.TBG_IS_LOCAL` (set once by `components.js`) — localhost renders static/mock fallback content, production fetches live from Airtable

## Vercel Deployment

- **Root Directory = repo root (leave blank)** — site files are at the root, so no Root Directory setting is needed. This is intentional: it makes the project transferable to any Vercel account with zero config (import → deploy).
- Framework Preset = Other (static)
- Config: `vercel.json` at repo root (security headers, image + CSS/JS caching); `.vercelignore` keeps `docs/` out of the bundle
- Environment variables: `AIRTABLE_API_KEY`, `AIRTABLE_BASE_ID`, `AIRTABLE_LEADS_TABLE`
- **Live:** https://thebizgift.vercel.app

## Client Migration Checklist

See `docs/README.md` → "Client Migration Checklist" for the full 5-step process.

## Documentation

Each document has a distinct responsibility with minimal overlap:

| Document | Responsibility |
|----------|---------------|
| [Brand Strategy](docs/master-brand-document.md) | WHY — mission, values, voice, positioning, messaging pillars |
| [Design System](docs/design.md) | HOW IT FEELS — 26-section canonical design reference |
| [Content Architecture](docs/content-architecture.md) | WHAT CONTENT — taxonomy, Airtable schema, IA, governance |
| [Engineering Reference](docs/build.md) | HOW IT'S BUILT — code standards, architecture, deployment |
| [Decision Log](docs/decision-log.md) | 10 settled architectural decisions |

## Page Status

| Page | Status | Notes |
|------|--------|-------|
| Homepage | Working | 15 sections, scroll-reveal animations |
| About | Working | 9 sections, static content |
| Explore Hub | Working | 7 sections; Occasions/Collections/Categories + Featured grid live from Airtable in production |
| Hamper Detail | Working (mock) | 8 sections, renders from mock data on localhost |
| Customisation | Working | 10 sections |
| Quote | Working | Form with 14 fields, simulates success on localhost |
| Legal (Privacy/Terms) | Working | Static content |
| Sitemap | Working | Static links |
