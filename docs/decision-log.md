# The Biz Gift — Decision Log

**Version:** 1.0  
**Date:** June 2026  
**Status:** Active  
**Owner:** Wugweb  
**Related Documents:** build.md

**Purpose:** This log records intentional architectural and product decisions to prevent revisiting settled debates and to provide context for future maintainers.

---

## How to Use This Log

Whenever the team makes a deliberate choice between two or more valid approaches, record it here with enough context that a new developer can understand the reasoning without replaying the discussion.

---

## Decisions

### D001: Single Quote page instead of cart

**Date:** June 2026  
**Decided By:** Wugweb

**Context:** E-commerce platforms typically use a shopping cart + checkout flow. The team considered this but chose a single-quote model.

**Decision:** Use a quote request form as the sole conversion path. No cart, no checkout, no pricing.

**Rationale:** 
- B2B corporate gifting is a consultative sale, not a transactional one.
- Buyers need to discuss MOQ, branding, delivery timelines before committing.
- A quote flow allows the sales team to qualify leads before sending proposals.
- Hiding price reinforces premium positioning.

**Consequences:**
- No need for pricing fields in Airtable.
- All CTAs funnel to `/quote` or WhatsApp.
- Forms collect requirements rather than payment details.

---

### D002: Three taxonomy templates (category, collection, occasion)

**Date:** June 2026  
**Decided By:** Wugweb

**Context:** The team considered a single generic product listing page vs separate templates.

**Decision:** Build three distinct listing templates at `/category/{slug}`, `/collection/{slug}`, `/occasion/{slug}`.

**Rationale:**
- Matches Airtable's relational model.
- Supports occasion-first discovery (primary user journey).
- Allows different editorial layouts per context.
- Enables tailored SEO per taxonomy type.

**Consequences:**
- Three separate serverless endpoints planned.
- Slightly more code to maintain, but clearer IA.
- Occasion pages will be the primary SEO landing pages.

---

### D003: Mega menus only for Explore & Collections

**Date:** June 2026  
**Decided By:** Wugweb

**Context:** Navigation approach. Options included: full mega menu on all items, sidebar nav, or limited mega menus.

**Decision:** Only "Explore Gifts" and "Collections" get mega menu panels. Other nav items are simple links.

**Rationale:**
- IA clarity: users learn that mega menus = discovery.
- Limits cognitive load on non-discovery pages.
- Reduces DOM size on mobile.
- Keeps header visually clean.

**Consequences:**
- Categories nested inside Explore mega menu, not top-level.
- Occasions nested inside Explore mega menu.
- Customisation and About are direct links.

---

### D004: No pricing on homepage

**Date:** June 2026  
**Decided By:** Wugweb

**Context:** Product cards typically show price in e-commerce.

**Decision:** Never display price on the homepage, product cards, or collection cards.

**Rationale:**
- Premium positioning: price tags signal catalog/retail.
- B2B pricing is often variable (MOQ, branding, delivery).
- Encourages consultation rather than comparison shopping.
- Aligns with editorial-first design principles.

**Consequences:**
- No `Price` field in Airtable Products table in v1.
- All CTAs are "View Details", "Explore", or "Request Proposal".
- MOQ shown instead of price for transparency.

---

### D005: Static About page

**Date:** June 2026  
**Decided By:** Wugweb

**Context:** Whether to manage About page content via Airtable or keep it static.

**Decision:** Keep About page fully static in HTML.

**Rationale:**
- Brand narrative is stable and rarely changes.
- Avoids unnecessary Airtable overhead for one-off content.
- Reduces risk of accidental overwrites by content team.
- Faster to load (no API call).

**Consequences:**
- Updates to About require a code deploy.
- Content team must request changes via GitHub PR or dev ticket.
- Acceptable trade-off given low change frequency.

---

### D006: Airtable as sole CMS

**Date:** June 2026  
**Decided By:** Wugweb

**Context:** Whether to use a dedicated CMS (Contentful, Sanity, Strapi) alongside Airtable.

**Decision:** Use Airtable exclusively for all dynamic content.

**Rationale:**
- Airtable already handles Products, Collections, Occasions, Leads.
- Non-technical team is already trained on Airtable.
- Avoids integration complexity and cost.
- Sufficient for v1 content volume.

**Consequences:**
- All content authors work in Airtable.
- No content preview staging in Airtable (use Vercel previews instead).
- Field names are locked to Airtable conventions.

---

### D007: Mock data on localhost

**Date:** June 2026  
**Decided By:** Wugweb

**Context:** How developers work without live Airtable access.

**Decision:** Ship embedded mock data in `hamper.js` that activates on localhost.

**Rationale:**
- Designers and devs can work without credentials.
- Faster local iteration (no network latency).
- Mock data is realistic, ensuring UI behaves as expected.
- Easy toggle to live API in production.

**Consequences:**
- Mock data must be kept reasonably in sync with Airtable schema.
- Risk of "works on my machine" if schema diverges.
- Mitigation: schema changes are rare and team is small.

---

### D008: Client-side rendering for Product Detail Pages

**Date:** June 2026  
**Decided By:** Wugweb

**Context:** Whether to render PDP HTML server-side or client-side.

**Decision:** Return JSON from `/api/get-hamper.js` and render entirely client-side.

**Rationale:**
- Simpler architecture: one rendering path in JS.
- Easier to manage complex interactions (gallery, FAQ, sticky CTA).
- Acceptable performance at launch scale (low traffic).
- Reduces server-side templating complexity.

**Consequences:**
- Slightly slower LCP than SSR, but mitigated by skeleton UI.
- SEO relies on meta tags injected before hydration (OK for v1).
- Future migration to SSR / SSG is straightforward if needed.

---

### D009: Site served from the repo root (superseded "html/ as Vercel root directory")

**Date:** June 2026 (revised)  
**Decided By:** Wugweb

**Context:** Documentation and site code share one repo. The original decision put site files in `html/` and required Vercel's **Root Directory** setting to be `html`. That setting is an out-of-repo dashboard config: it was repeatedly lost during deploy iterations (production 404'd while files lived in `html/`), and a future client migration would silently break unless the new account also set it.

**Decision:** Move all site files to the **repo root**. Leave Vercel Root Directory blank.

**Rationale:**
- **Transferable:** any Vercel account deploys it with defaults — import → deploy, no hidden config.
- **Scalable / robust:** removes the single most common deploy-failure cause for this project.
- Serverless functions live at `/api` (auto-detected at root); absolute asset paths (`/style.css`, `/image/...`) resolve unchanged.
- `docs/` is kept out of the deploy bundle via `.vercelignore`.

**Consequences:**
- `vercel.json` and `.vercelignore` live at the repo root.
- Local dev runs from the repo root (`python3 -m http.server 4321` or `npx serve . -l 4321`).
- Documentation that previously said "Root Directory = html" has been updated across CLAUDE.md, build.md, and README.md.

---

### D010: Shared header/footer/newsletter components via fetch()

**Date:** June 2026  
**Decided By:** Wugweb

**Context:** Avoid duplicating header, footer, newsletter HTML across 8+ pages.

**Decision:** Inject shared components client-side using `fetch()` in `components.js`.

**Rationale:**
- Single source of truth for nav, footer links, WhatsApp widget.
- Updates propagate without touching every page.
- Keeps HTML files focused on page-specific content.
- Works with static hosting (no build step required).

**Consequences:**
- Brief flash of empty `<header>`/`<footer>` before fetch completes.
- Components cannot contain inline scripts (must be attached after injection).
- Accessibility: ensure injected markup is semantic and complete.

---

## Proposals (Under Discussion)

### P001: Migrate from vanilla JS to Next.js

**Status:** Postponed indefinitely  
**Proposed:** (not yet proposed formally)  
**Rationale if pursued:** Better routing, SSR, image optimisation, ecosystem.  
**Reason not pursued now:** Current stack works, team knows it, v1 is mid-flight.

---

## Deprecated Decisions

None yet. This log begins with v1.0.

---

**Maintained by:** Wugweb  
**Review cadence:** Quarterly or after major architecture changes.