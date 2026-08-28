# Styleguide Rollout & Airtable Go-Live — Session Status

**Note on scope:** this doc originally tracked a single "styleguide rollout" session. It's since been extended across several follow-on sessions covering Airtable taxonomy restructuring, hamper-detail-page field mapping, going live with real Airtable data, and a full UI/hygiene pass across every page. Kept as one running log rather than splitting it, since each phase built directly on the last.

**Commits, newest first:**
```
93aed1a Site hygiene pass #2: fix unstyled components, remove dead CSS
2ccb020 Fix hero alignment (for real this time), rebuild quote.html, homepage fixes
677711b Redesign hamper detail page: fix invisible related cards, restyle sections
f76b9b9 Rebuild customisation hero and about CTA from styleguide reference
806e02b Fix duplicate content on about.html: two "Details Matter." sections
c1bd30c Site hygiene pass: add 404 page, fix dead image fallback, prune dead CSS
512aa58 Add "Details Matter" 2-col section to about.html; split-style explore CTA
baee810 Rebuild customisation hero and about CTA from styleguide reference
e3c5dcf Fix hamper 404s on real Airtable slugs; restyle process/branding/product-card UI
9c4c3ae Update status doc: field-name-mismatch fix and explore-page wiring fix
4598ea7 Wire explore page's Featured Experiences grid to live Airtable data
b5f03c0 Fix field-name mismatch: Website Product Name/Description/URL Slug/SEO Title/Image Alt Text
99345e4 Trigger redeploy to pick up updated Airtable env vars
fdb0655 Update session status doc: Airtable taxonomy, hamper page mapping, go-live progress
f1259be Trigger redeploy to pick up regenerated AIRTABLE_API_KEY
4db8b0c Go live: hamper pages and homepage now fetch real Airtable data
7369783 Use dedicated local images for occasion cards instead of generic photos
85365fc Wire hamper page and taxonomy to real Airtable schema
90e4313 Add session status doc: styleguide rollout done vs pending
14b0c07 Fix hamper detail page: broken links, wrong phone number, duplicate code
bc4641b Fix broken filtering on explore page, consolidate redundant sections
d479c60 Fix header/footer load delay and left-align all hero banners
b6fbeb5 Remove duplicate newsletter section on explore page
372b9b7 Fix .btn-secondary contrast bug: white-on-white text invisible on light sections
e2d9b3f Fix hero contrast: strengthen gradient overlay + add text-shadow safety
0302445 Roll out styleguide.html design system sitewide
663db0f Polish styleguide: resize logo monogram, refresh button/hero showcase examples
3522b43 Trim homepage/about/customisation sections, restyle testimonials, add category browse
2832007 Replace FAQ content site-wide, remove redundant quote-page gallery
```
All pushed to `main`, live on Vercel at https://thebizgift.com.

---

## What's done

### Styleguide rollout & Airtable go-live (earlier phases, condensed)
- Migrated `style.css` tokens to the styleguide's bronze/charcoal/ivory palette and radius/type scale; rolled the design system out across every page.
- Restructured Airtable taxonomy (`appG2IVjN168FLoqT`) into real linked tables — Occasions (6), Collections (10), Category (12) — with a proper Sub Category → Category hierarchy; fixed a data bug where Products.Category pointed at proxy rows instead of true categories.
- Mapped every hamper detail page field to the live Products schema, fixed several field-name mismatches (Airtable fields were renamed more than once — `Website Product Name` → `Product Website Name`, `URL Slug` → `website URL Slug`, `SEO Title / Slug` → `SEO Title`, `Image Alt Text` → `Website Image Alt Text`), removed the FAQ section (no backing field), simplified the breadcrumb to a single non-indexable taxonomy crumb.
- Diagnosed and fixed the full Airtable production connection chain: env vars scoped to Preview-only → wrong/incomplete PAT → wrong base ID → field-name mismatch. All four resolved; homepage and explore page both confirmed fetching real Airtable data live.
- **Security note:** the Airtable PAT was pasted in chat during debugging and has since been regenerated. If it's regenerated again, no doc update needed here — just confirm Vercel env vars are updated and redeploy.

### Critical bug: hamper page 404s on real products
The site started linking to 26 live Airtable product slugs (via Featured Hampers / explore), but only 6 static `/hamper/<slug>/` folders existed on disk — every other slug hit Vercel's filesystem 404. Fixed with a `vercel.json` rewrite so any unmatched `/hamper/:slug` falls through to the shared `template.html` shell, which already reads the slug from the URL and fetches by slug client-side. Verified live against a real (non-static-folder) product slug.

### Hero alignment — sitewide, fixed twice
Every page's hero text was inset further right than the `.container`-based sections below it, because several hero sections had picked up a redundant extra horizontal padding layer on top of the section's own centered max-width. **First attempt at fixing this partially failed** — several edits were reported as done but never actually landed in the files (caught by re-reading the actual file content against the claim, not by re-testing the live site). Re-verified and re-applied for real: `about-hero-section`, `explore-hero`, `quote-hero-section`, `hamper-hero` all confirmed fixed in the deployed CSS. Homepage's hero needed a different fix (its full-bleed background layer can't tolerate the section itself carrying padding) — solved with a widen-center-repad `calc()` on the container instead.

### Full hamper detail page redesign
- Fixed a real bug: "You May Also Like" related products were permanently invisible on desktop (CSS gated them behind a `.visible` class that nothing in the JS ever added).
- Fixed uneven horizontal scroll-snap on the branding gallery and mobile related-scroll (missing `scroll-padding-left`).
- "Perfect For" grid was hardcoded to exactly 2 columns regardless of occasion count — now a flexible `auto-fit` grid.
- "Ready To Order?" rebuilt from a vertical spec list into a horizontal icon-card row with a dashed connector (same pattern used elsewhere on the site).
- "About This Hamper" flipped from image-left/text-right to text-left/image-right; "Make It Yours" got a text-left intro beside its scroll gallery; "Interested in this hamper?" highlights now use icon circles instead of plain checkmarks.
- Hero tag pills lightened (were solid charcoal, now ivory with a keyword-matched icon); hero quick-info row (MOQ/Branding/Delivery/etc.) got icons; primary CTAs switched to the darker copper accent for contrast; gallery image made taller.

### Quote page rebuild
- Hero: was ivory/washed-out with 3 identical CTA pills — now dark charcoal (matching the rest of the site) with a primary + WhatsApp secondary pair.
- "What Happens Next" converted from a vertical 4-item list to the horizontal process-block pattern (icon row + dashed connector) used on the homepage and customisation page.
- Added an Editorial Quote block (dark card, quote + image) between the process and form sections.
- Form section rebuilt as the warm-beige split card with a photo on the right, matching the styleguide reference — real form fields/validation/submit logic untouched.
- Final section converted from a plain centered heading to the dark/photo split CTA pattern used on about.html and customisation.html.

### Homepage fixes
- Removed the "Now Curating: Diwali Corporate Gifts" seasonal banner (and its now-dead CSS).
- "Planning Guide" converted from a vertical spec list to the same horizontal icon-row pattern as the hamper page's "Ready To Order?".
- **Featured Hampers grid was showing all 26 Website-Ready products instead of the 6 the client actually flagged.** Confirmed via Airtable that 6 products already have `Featured on Homepage` checked; the API just never returned or filtered on that field. Fixed — API now exposes `featured`, homepage filters client-side to just those 6 (explore's use of the same endpoint is unaffected, so it still shows the full pool).
- "Browse By Category" was a completely different icon-only card component (no images) than explore.html's image-based category cards — replaced with the same `.media-card.category-card` markup explore uses, and both pages now use the real dedicated category photos in `image/category/` instead of reused generic hamper shots (only 4 real photos exist so far — cycled across the 11 categories until the rest are supplied).
- Occasion cards were already consistent between homepage and explore (both use the same `.media-card.occasion-card` component) — no change needed there.

### Two-pass hygiene audit (post-redesign)
Ran two independent audit agents, cross-verified against each other, after the large batch of redesign edits — reading current file content directly rather than trusting prior "done" claims.

Real bugs found and fixed:
- `customisation.html`'s "From Brief to Box" lightbox modal had **zero CSS** (functional via JS, but would render completely unstyled/unpositioned). Fully styled now, plus a `body.modal-open` scroll lock.
- Every hamper detail page's loading skeleton used `.hamper-skeleton-grid/-card/-tags/-tag`, none of which existed in `hamper.css` (only a differently-named variant did) — affected the loading state on every product page. Fixed.
- `customisation.html`'s FAQ section wrapper and `quote.html`'s MOQ field-note had no container styling. Fixed.
- Added a proper `404.html` (previously falling back to Vercel's generic default).
- Fixed a dead image fallback path in `api/get-featured-hampers.js` (`image/placeholder-blank.jpg`, a file that never existed) → now `/image/placeholder.svg`.

Dead CSS removed (confirmed zero HTML usage repo-wide by grep, not by assumption): `.editorial-card`, `.collection-editorial-*`, `.process-card`/`.process-grid`/`.process-number` (all superseded by `.media-card`/`.process-block` respectively), `.process-steps`, `.seasonal-*`, and 12 earlier-orphaned selectors (`about-statement`, `contents-grid`, `hamper-statement`, `methods-grid`, `planning-grid`, `quote-visuals`, `quote-whatsapp`, `related-grid`, `visual-grid`, `visual-image`, `visual-item`, `whatsapp-card`).

Also fixed along the way: a real content-duplication bug on about.html (a new "Details Matter." section unknowingly duplicated an existing "Curated/Purposeful/Memorable" philosophy section elsewhere on the same page — caught during live verification, not before).

### Styleguide.html additions
- Added an FAQ sidebar image + Editorial Quote block, matching supplied UI references.
- Added a "Category Cards · Layout Reference" section (`#category-cards`, entry 40 in the nav) embedding `docs/reference/category-cards-preview.html` via the same iframe pattern already used for the production UI inventory — 7 layout variants (minimal icon, image-reveal-on-hover, split card, large-feature, cascade, hover-zoom, horizontal scroller) for the client to pick from. **Not yet wired into any live page** — this is a design review artifact, not a shipped component.

---

## What's pending / not done

### Decision needed from the client
- **Pick a category card layout.** 7 variants are live for review at `styleguide.html#category-cards` (or directly at `/docs/reference/category-cards-preview.html`). Once a variant is chosen, it needs to be built into the real "Browse By Category" sections on homepage and explore (currently using a plain `.media-card` layout, not any of the 7 preview variants).
- Only 4 real category photos exist (`image/category/office accessory.png`, `office essentials.png`, `drinkware.png`, `Carry Bags.png`) — cycled to fill all 11 categories on both homepage and explore in the meantime. Real photos for the remaining 7 categories (Tech, Bags, Transit Luggage, Box Making, Printing, Branding, Combo) are still needed.

### Explicitly deferred (not a bug, a scope decision)
- Hamper page sections with no backing Airtable field yet: Product Contents ("What's Inside"), CTA banner fields, Lead Time/Delivery/Response Time/Production Workflow/Packaging beyond what's already mapped. Decision on whether to add the Airtable fields or hide the sections is still open.
- `submit-lead.js` (quote-form → Airtable lead writes) uses the same read-only Airtable PAT used for reads — lead submission will likely fail once tested unless a separate write-capable token is configured. Not yet verified either way.
- Manual step still needed in Airtable: toggle the linked-record columns and `Featured on Homepage` visible in the "Website Sync" view — this connector has no tool to edit view field visibility.

### Carried over, still not done
- **Mobile/tablet responsive testing, keyboard navigation/focus rings, `prefers-reduced-motion`, form validation UX, a systematic console-clean sweep, and empty/loading-state review under throttled network** — every check across this entire multi-session effort has been via direct API/HTML fetches against the deployed URL or by reading source, since this sandbox has no browser. None of the above have been visually verified in an actual browser.
- `docs/design.md` and `docs/content-architecture.md` — not updated to reflect the new component patterns or the taxonomy restructure; likely stale if they're meant to track the live system.
- Untracked/loose files predating this work, left alone: `"The Biz Gift — Merged UI Kit & Production Inventory.html"`, `old_styleguide.css`, `styleguide.html.bak`, various loose images at `image/` root, and `docs/backups/` (Airtable pre-migration snapshots — useful to keep, currently untracked).

## Suggested next steps
1. **Client to review the 7 category card variants** and pick one; then it gets built into the real homepage/explore "Browse By Category" sections.
2. Upload real photos for the 7 categories still using cycled placeholder images.
3. Decide on the deferred hamper-page sections and `submit-lead.js`'s write-access token.
4. A real browser pass: mobile/tablet, keyboard nav, reduced-motion, form validation, console-clean, loading states — none of this has been visually verified yet, only verified by source/API inspection.
5. Sync `docs/design.md` / `docs/content-architecture.md` to the current live system if they're meant to stay authoritative.
