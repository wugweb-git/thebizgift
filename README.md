# The Biz Gift 🎁
The Biz Gift is a B2B corporate gifting platform designed to help companies in India thank their people and partners with curated, purposeful, and memorable hampers.

## Brand Story
We design hampers with the same care and intentionality that goes into any good business decision. We were founded on the observation that corporate gifting in India had become an afterthought, and we aim to turn routine gifting into something employees and clients actually look forward to.

## Tech Stack
- **Frontend:** HTML5, CSS3, JavaScript (Vanilla).
- **Backend/CMS:** Airtable (used as the primary database for products and catalog).
- **Hosting:** Optimized for Vercel/Netlify.
- **Dynamic Content:** API-driven product fetching from Airtable views.

## Live Preview
**Production:** https://thebizgift.vercel.app  
**Staging:** https://thebizgift-git-{branch}.vercel.app

## Key Features
- **Mobile-First Design:** Built for corporate buyers browsing on mobile (responsive at 768px, 1100px).
- **Airtable Sync:** Dynamic product catalog via `/api/get-featured-hampers.js`.
- **Lead Generation:** Optimized quote request flow on `/quote.html`.
- **Persistent WhatsApp Integration:** Site-wide sticky widget for instant contact.
- **Scroll Reveal Animations:** Intersection Observer-based fade-in on scroll.
- **Mobile Hamburger Menu:** Full-screen overlay nav for devices under 768px.
- **Micro-Interactions:** Hover fills, underline animations, image zooms, social icon lift.

## Design System
See [design.md](design.md) for full documentation of:
- **Primitives:** Color tokens, typography scales, spacing, motion curves
- **Components:** Buttons, nav links, dropdowns, social icons, WhatsApp widget
- **Blocks:** 10 homepage sections, 9 about sections, 7 explore sections

## Page Inventory
| Page | File | Sections |
|------|------|----------|
| Home | `html/index.html` | 10 |
| About | `html/about.html` | 9 |
| Explore Hub | `html/explore/index.html` | 7 |
| Hamper Detail | `html/hamper/template.html` | 9 |
| Customisation | `html/customisation.html` | 10 |
| Quote | `html/quote.html` | 6 |
| Legal | `html/privacy.html`, `html/terms.html` | — |
| Sitemap | `html/sitemap.html` | — |

## Setup & Development
1. Clone the repository.
2. Use a local server rooted at `html/` (e.g. `python3 -m http.server 4321 --directory html`, or VS Code Live Server). Component loading (`fetch()` of header/footer/newsletter) and absolute `/...` asset paths require an HTTP server — opening files via `file://` will not work.
3. **Local behaviour:** on `localhost`/`127.0.0.1`, product pages render from built-in mock data and all forms simulate a successful submit (no Airtable calls). In production the live API is used automatically.

> ⚠️ **Security:** an Airtable token was previously committed in this README. It has been removed — rotate that token in Airtable and store the new one only as a Vercel environment variable, never in the repo.

## Deployment (Vercel)
- **Root Directory must be set to `html`** in the Vercel project settings. This makes the serverless functions in `html/api/*` deploy as `/api/*` and makes every absolute asset path (`/style.css`, `/image/...`) resolve. Config lives in `html/vercel.json`.
- Environment variables (Project → Settings → Environment Variables):
  - `AIRTABLE_API_KEY` — Airtable personal access token (never commit it)
  - `AIRTABLE_BASE_ID` — base id for the Products + Leads tables
  - `AIRTABLE_LEADS_TABLE` — optional, defaults to `Leads`

## Forms & Lead Capture
All three forms POST JSON to the single serverless endpoint `/api/submit-lead`, which writes one row to the Airtable **Leads** table:
- Quote form (`/quote.html`) — `type: "quote"`
- Product proposal (hamper detail pages) — `type: "proposal"`
- Newsletter signup (site-wide footer block) — `type: "newsletter"`

Create a **Leads** table in Airtable with these columns (names must match exactly):
`Type` (single select), `Name`, `Company`, `Email`, `Phone`, `Quantity`, `Budget`, `Occasion`, `Required By`, `Branding`, `Message`, `Product`, `Product URL`, `Collection`, `Category`, `Source Page`.

## Known follow-ups (placeholder content to replace)
- WhatsApp number `919999999999` and phone `+91 8888 000 216` are placeholders (and inconsistent with each other) — set the real numbers.
- Social links point to bare domains (`facebook.com`, `x.com`, …) — set real profile URLs.
- `api/get-featured-hampers.js` exists but is not wired to any page (the explore hub is static). Wire it up or remove it.
- `explore/explore.html` is an unlinked alternate explore layout — decide whether to use or remove it.

## Audit & Hardening Pass (June 2026)
- Unified all asset paths to absolute `/...` and added `html/vercel.json` + documented Root Directory = `html`
- Wired quote, proposal and newsletter forms to Airtable via new `/api/submit-lead` serverless function
- Product pages now use live Airtable in production, mock data only on localhost
- Per-product SEO/OG/Twitter metadata on each hamper page (previously all identical)
- Converted `index.html` to use the shared header/newsletter/footer components (was hardcoded + stale nav)
- WhatsApp sticky widget is now site-wide (via footer component) with proper CSS (previously unstyled, home only)
- Completed the explore hub: added the occasion/category sections all nav anchors point to
- Fixed broken homepage links, removed duplicate `explore/template.html`, fixed stray text in newsletter component
- Removed leaked Airtable token from this README

## Recent Updates (June 2026)
- Homepage redesign: cinematic hero, scatter animation, seasonal spotlight, process section, trust grid, browse sections, planning guide
- Header mega menu: Explore Gifts + Collections with featured cards
- Design system documentation expanded (animation, motion, states, breakpoints, iconography)
- Mobile UX: hamburger nav, responsive grids, touch-friendly targets
- Pages consolidated: `pages.css` deduplicated, removed dead references
- Sitemap cleaned: removed duplicate collection links
- Newsletter component: fixed placeholder form action

## Project Goals
The primary goal is to generate qualified enquiries from HR, Admin, and Marketing buyers. The design direction prioritizes restrained color palettes, strong photography, Editorial-first layouts without SKU grids, and confident white space. The entire site is structured around Occasions → Collections → Products (never Categories → Products above the fold).

