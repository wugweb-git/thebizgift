# The Biz Gift 🎁

The Biz Gift is a B2B corporate gifting platform designed to help companies in India thank their people and partners with curated, purposeful, and memorable hampers.

## Brand Story

We design hampers with the same care and intentionality that goes into any good business decision. We were founded on the observation that corporate gifting in India had become an afterthought, and we aim to turn routine gifting into something employees and clients actually look forward to.

## Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla).
- **Database/CMS:** Airtable (products, collections, occasions, leads).
- **Hosting:** Vercel.
- **Dynamic Content:** Serverless API routes (`/api/*`) fetch from Airtable in production; mock data on localhost.

## Live Preview

**Production:** https://thebizgift.vercel.app

## Key Features

- **Mobile-First Design:** Built for corporate buyers browsing on mobile (responsive at 768px, 1100px).
- **Airtable Sync:** Dynamic product catalog via `/api/get-featured-hampers.js` and `/api/get-hamper.js`.
- **Lead Generation:** Optimised quote request flow on `/quote.html`.
- **Persistent WhatsApp Integration:** Site-wide sticky widget for instant contact.
- **Scroll Reveal Animations:** Intersection Observer-based fade-in on scroll.
- **Mobile Hamburger Menu:** Full-screen overlay nav for devices under 768px.
- **Micro-Interactions:** Hover fills, underline animations, image zooms, social icon lift.

## Design System

See [design.md](design.md) for full documentation:
- **Primitives:** Color tokens, typography scales, spacing, motion curves
- **Components:** Buttons, nav links, dropdowns, social icons, WhatsApp widget
- **Blocks:** 10 homepage sections, 9 about sections, 7 explore sections

## Content Architecture

See [content-architecture.md](content-architecture.md) for:
- Airtable schema & table definitions
- Content model & taxonomy rules
- Dynamic vs static content inventory
- Page-by-page content blueprints

## Engineering

See [build.md](build.md) for:
- File architecture & naming conventions
- Airtable integration patterns
- Component specifications
- Build order & deployment workflow

## Page Inventory

| Page | File | Sections | Dynamic |
|------|------|----------|---------|
| Home | `html/index.html` | 10 | Partial |
| About | `html/about.html` | 9 | No |
| Explore Hub | `html/explore/index.html` | 7 | Partial |
| Hamper Detail | `html/hamper/template.html` | 9 | Yes |
| Customisation | `html/customisation.html` | 10 | No |
| Quote | `html/quote.html` | 6 | No |
| Legal | `html/privacy.html`, `html/terms.html` | — | No |
| Sitemap | `html/sitemap.html` | — | No |

## Setup & Development

1. Clone the repository.
2. Use a local server rooted at `html/` (e.g. `python3 -m http.server 4321 --directory html`, or VS Code Live Server). Component loading (`fetch()` of header/footer/newsletter) and absolute `/...` asset paths require an HTTP server — opening files via `file://` will not work.
3. **Local behaviour:** on `localhost`/`127.0.0.1`, product pages render from built-in mock data and all forms simulate a successful submit (no Airtable calls). In production the live API is used automatically.
4. **Optional:** To test live Airtable locally, copy `.env.example` to `.env.local` and add real credentials (see Deployment section).

> ⚠️ **Security:** Never commit Airtable tokens, API keys, or base IDs to version control. Store them only as Vercel environment variables or in local `.env.*` files (which must be gitignored).

## Airtable Integration

Airtable is the **CMS and database** for this project — there is no separate CMS.

**Current Phase:** Static content with Airtable-ready API architecture.

**Tables Required:**
- `Products` — hampers with images, descriptions, pricing tiers, MOQ, FAQs
- `Collections` — curated groups (e.g. Executive Welcome, Festive Celebration)
- `Occasions` — use-cases (e.g. Employee Onboarding, Client Appreciation)
- `Categories` — product types (e.g. Diaries, Drinkware, Wellness)
- `Leads` — quote requests & newsletter signups (already wired)

See [content-architecture.md](content-architecture.md) for full field schemas.

**API Endpoints:**
- `GET /api/get-featured-hampers.js` — featured product grid
- `GET /api/get-hamper.js?slug=...` — single product detail + related
- `POST /api/submit-lead` — quote/proposal/newsletter leads

## Deployment (Vercel)

- **Root Directory must be set to `html`** in the Vercel project settings. This makes the serverless functions in `html/api/*` deploy as `/api/*` and makes every absolute asset path (`/style.css`, `/image/...`) resolve. Config lives in `html/vercel.json`.
- Environment variables (Project → Settings → Environment Variables):
  - `AIRTABLE_API_KEY` — Airtable personal access token (never commit it)
  - `AIRTABLE_BASE_ID` — base id for the Products + Leads tables
  - `AIRTABLE_LEADS_TABLE` — optional, defaults to `Leads`

### Client Migration Checklist

When migrating to the client's own Vercel account:

1. **Project creation**
   - Import repo or push to client's GitHub
   - Set Root Directory = `html`
   - Framework preset = Other (static)

2. **Environment variables**
   - Add `AIRTABLE_API_KEY` (new PAT, rotated from old)
   - Add `AIRTABLE_BASE_ID`
   - Add `AIRTABLE_LEADS_TABLE` if non-default

3. **Domain**
   - Add custom domain in Vercel
   - Update DNS records as instructed by Vercel
   - Enable HTTPS (auto via Vercel)

4. **Airtable access**
   - Ensure client grants read access to Products, Collections, Occasions, Categories tables
   - Confirm Leads table write access
   - Validate field names match code exactly (case-sensitive)

5. **Pre-launch validation**
   - Run through staging URL first
   - Test 3 form submissions (quote, proposal, newsletter)
   - Verify product pages load from live Airtable
   - Check all images resolve

## Forms & Lead Capture

All three forms POST JSON to the single serverless endpoint `/api/submit-lead`, which writes one row to the Airtable **Leads** table:
- Quote form (`/quote.html`) — `type: "quote"`
- Product proposal (hamper detail pages) — `type: "proposal"`
- Newsletter signup (site-wide footer block) — `type: "newsletter"`

**Leads table columns required** (names must match exactly):
`Type` (single select), `Name`, `Company`, `Email`, `Phone`, `Quantity`, `Budget`, `Occasion`, `Required By`, `Branding`, `Message`, `Product`, `Product URL`, `Collection`, `Category`, `Source Page`.

## Mock Data Strategy

During local development and design review, the site runs on embedded mock data rather than hitting Airtable.

- Product detail pages: `html/hamper/hamper.js` contains a `MOCK_DATA` object with realistic sample records.
- Forms: All submissions return a simulated success after a short delay.
- Featured grids: Static HTML in explore hub; `get-featured-hampers.js` exists but is not wired yet.

When Airtable schemas are final, swap mock data for live API calls by toggling `USE_MOCK_DATA` (or similar flag).

## Known Follow-ups (Placeholder Content)

- ~~WhatsApp number `919999999999` and phone `+91 8888 000 216`~~ — set real numbers before launch.
- Social links point to bare domains (`facebook.com`, `x.com`, …) — set real profile URLs.
- ~~SEO/OG/Twitter per-product metadata~~ — ~~implemented~~ (strikethrough = done; see below for out-of-scope items)
- `api/get-featured-hampers.js` exists but is not wired to any page (the explore hub is static). Wire it up or remove it.
- `explore/explore.html` is an unlinked alternate explore layout — decide whether to use or remove it.

## Out of Scope (Current Phase)

These items are documented but not actively being worked on:

- ~~SEO title/description per page~~ — ~~blocked~~ pending content finalisation
- Open Graph image generation
- Twitter meta tags
- Advanced search & filtering
- Sitemap.xml automation
- robots.txt configuration
- Analytics integration (Plausible / GA4)
- Performance budget enforcement tooling

~~SEO-related work will be picked up in a dedicated phase after content and design are approved.~~

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
- Documentation restructured into `/docs/` with tokens and assets folders

## Project Goals

The primary goal is to generate qualified enquiries from HR, Admin, and Marketing buyers. The design direction prioritizes restrained color palettes, strong photography, Editorial-first layouts without SKU grids, and confident white space. The entire site is structured around Occasions → Collections → Products (never Categories → Products above the fold).