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
| Explore Template | `html/explore/template.html` | 7 (dynamic) |
| Hamper Detail | `html/hamper/template.html` | 9 |
| Customisation | `html/customisation.html` | 10 |
| Quote | `html/quote.html` | 6 |
| Legal | `html/privacy.html`, `html/terms.html` | — |
| Sitemap | `html/sitemap.html` | — |

## Setup & Development
1. Clone the repository.
2. Use a local server (e.g., Live Server in VS Code) for `fetch()` API calls and component loading.
3. Configure Airtable: Set `AIRTABLE_API_KEY` and `AIRTABLE_BASE_ID` in Vercel/Netlify environment variables.
4. Airtable base token: `patwzZQKctQSlpRKB` (use in dashboard, never in code).

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
