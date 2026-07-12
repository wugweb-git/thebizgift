# Styleguide Rollout & Airtable Go-Live — Session Status

**Note on scope:** this doc originally tracked a single "styleguide rollout" session. It's since been extended across several follow-on sessions covering Airtable taxonomy restructuring, hamper-detail-page field mapping, and going live with real Airtable data. Kept as one running log rather than splitting it, since each phase built directly on the last.

**Commits, newest first:**
```
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
All pushed to `main`, live on Vercel at https://thebizgift.vercel.app/.

---

## What's done

### Styleguide rollout (earlier phase)

**Foundation**
- **Tokens** (`style.css`): migrated `:root` color/radius/type-scale variables to match `styleguide.html` (bronze/charcoal/ivory palette, r-1…r-5/pill radius scale, fluid clamp() type scale). Added styleguide-native aliases (`--bronze`, `--line`, `--muted`, `--warm-beige`, etc.) and loaded `Dancing Script` sitewide.
- **Buttons**: removed `text-transform: uppercase` sitewide in favor of letter-spacing on naturally-cased text, matching the styleguide's convention.
- **Header/Footer**: mega menu rebuilt (featured-collection panel leads, trust strip added); footer got an inline pill newsletter signup, consolidating older standalone banners.

**Per-page restyle:** homepage hero, about, customisation, explore, quote, hamper template, and legal/utility pages all brought onto the shared token system.

**11 bugs found and fixed** via live re-audit (hero contrast, `.btn-secondary` invisible text, duplicate newsletter section, header/footer load delay, off-brand centered hero banners, a CSS specificity bug, dead explore-page filter links, a mislabeled category, 404s in the hamper page's "Perfect For" links, a wrong WhatsApp number, and duplicated related-products logic). Full detail preserved in git history (commits `2832007`–`14b0c07`).

### Airtable taxonomy restructure (`appG2IVjN168FLoqT`)
- Split flat multi-select tag fields into real linked-record tables: **Occasions** (6), **Collections** (10), **Category** (12, including a "More" catch-all for unassigned sub-categories) — each with Name/Slug/Description/Hero Image/Published, and a proper **Sub Category → Category** hierarchy (previously Category's "parent" was just a text label, not a real link).
- Fixed the pre-existing `Category` field mismatch — it had been pointing at proxy rows in the Sub Category table, not real top-level Category records. Traced and corrected via the Sub Category → Parent Category chain for all 124 products.
- All 6 Occasions, 10 Collections, and 12 Categories marked `Published = true`.
- 26 products (`Product Status = "Website Ready"`) now have `Website Ready` and `Published` checked; 6 of those also flagged `Featured on Homepage`.
- Original multi-select fields were **kept, not deleted** (this connector has no `delete_field` tool anyway) — new linked fields sit alongside them.
- Backups of the pre-migration Products/Category data saved to `docs/backups/` before any changes, per explicit request.

### Hamper detail page ↔ Airtable field mapping
- Audited every field the page renders against the live Products schema; fixed a real bug (`api/get-hamper.js` was reading a field named `SEO Title` that doesn't exist — real field is `SEO Title / Slug`, so SEO titles were silently always falling back to a default).
- Added `Product Code` (from `TBG Product Code`) and per-primary-image `Image Alt Text` mapping — neither was exposed by the API before.
- Rewired `hamper/hamper.js` to consume the corrected **array-based** taxonomy shape (`categories[]`, `collections[]`, `occasions[]`, each `{name, slug, image}`) instead of the old singular `category`/`collectionTag`/`occasionTags` fields, so a product's full set of linked Categories/Collections/Occasions actually renders (breadcrumb, hero collection badges, "Perfect For" cards, related-products, hidden proposal-form fields).
- Removed the FAQ section from the hamper page entirely (no backing Airtable field exists yet) — mock data, `buildFAQ()`, and the now-orphaned accordion JS all removed.
- Breadcrumb simplified to a single non-indexable crumb: Category → falls back to Collection → falls back to Occasion (Sub Category deliberately excluded, per explicit instruction not to make it an indexable path).
- Confirmed via full-repo audit: **no duplicate hamper-page template exists** — all 6 `/hamper/<slug>/` folders are thin wrappers around the one `hamper/hamper.js` engine. `styleguide.html`'s PDP section is a design-reference mockup only, never a live page.
- Homepage/explore/header/sitemap/quote/styleguide taxonomy labels brought to full parity with the live Occasions/Collections/Category tables (was previously a curated marketing subset with several stale names like "Leadership Gifts," "Tech Accessories," "Bags & Accessories" that no longer match anything in Airtable).
- Homepage "Featured Collections" section renamed to "Featured Hampers"; its `#featuredHampersGrid` category-tile section also given real per-occasion images (`image/occasion/`, renamed to slug-based filenames) instead of reused generic hamper photos.

### Going live (in progress — see Pending below)
- `hamper/hamper.js`'s `CONFIG.USE_MOCK` flipped from a hardcoded `true` to `IS_LOCAL` — production now actually calls `/api/get-hamper` instead of always rendering the 6 hardcoded mock products, per the file's own long-standing TODO comment.
- Homepage's `#featuredHampersGrid` wired to fetch `/api/get-featured-hampers` in production (was 100% static HTML with no fetch call at all before); falls back to the static cards on localhost or if the API errors, so nothing regresses.
- Diagnosed and worked through the Airtable connection chain live against production:
  1. `AIRTABLE_API_KEY`/`AIRTABLE_BASE_ID` were initially scoped to **Preview only** in Vercel, not Production → fixed by re-scoping.
  2. The API key value itself was then rejected by Airtable with `401 Unauthorized` (token was incomplete/invalid) → fixed by regenerating the Airtable personal access token and updating Vercel with the full secret.
  3. Current state: Airtable now returns **`404`** (auth succeeds, but the base/table isn't found) — points at `AIRTABLE_BASE_ID` needing a re-check in Vercel (expected value: `appG2IVjN168FLoqT`).

---

## What's pending / not done

### Blocking — live Airtable connection
- **`AIRTABLE_BASE_ID` in Vercel needs verification.** Last live test of `/api/get-hamper` returned `Airtable connection failed: 404` — the token authenticates fine now, but the base isn't being found. Confirm the value is exactly `appG2IVjN168FLoqT` with no typos/whitespace/stale leftover value, then redeploy and re-test.
- Once the API is confirmed working end-to-end: verify the homepage Featured Hampers grid renders real products, and spot-check at least one real `/hamper/<slug>/` product page in a browser with live data (this sandbox cannot run a local dev server or otherwise visually verify — every check so far has been via direct API calls to the deployed URL, not a browser).
- **Security note:** the Airtable PAT secret was pasted directly into this chat during debugging. Recommend regenerating it once more after everything is confirmed working, since anything typed in chat should be treated as exposed.

### Explicitly deferred (not a bug, a scope decision)
- Hamper page sections with no backing Airtable field yet: Editorial ("Why This Gift") title/paragraphs/image, Product Contents ("What's Inside"), CTA banner fields, Lead Time, Delivery, Response Time, Production Workflow, Packaging. These still render hardcoded fallback copy. Decision on whether to add the Airtable fields or hide the sections is still open.
- `submit-lead.js` (quote-form → Airtable lead writes) uses the same Airtable PAT — that PAT is **read-only**, so lead submission will fail once tested unless a separate write-capable token is configured. Not yet verified either way.
- Manual step still needed in Airtable: toggle the new linked-record columns (`Occasion Tags (Linked)`, `Collections (Linked)`, `Category (True Link)`, etc.) visible in the "Website Sync" view, and toggle `Featured on Homepage` visible there too — this connector has no tool to edit view field visibility.

### Carried over from the styleguide-rollout phase, still not done
- **Mobile/tablet responsive testing** — every check across all sessions has been desktop-viewport (or API-only) verification. `CLAUDE.local.md`'s checklist calls for 1400/1100/768/375px testing; not done.
- **Keyboard navigation / focus rings** — not tested.
- **`prefers-reduced-motion` behavior** — not tested.
- **Form validation UX** (inline error states for empty/invalid fields) — not exercised.
- **Console-clean sweep** — no systematic check across all pages for JS warnings/errors.
- **Empty/loading state review** — hamper page skeleton loading state exists in code but not deliberately tested under throttled network.
- **`docs/design.md`, `docs/content-architecture.md`** — not updated to reflect new component patterns or the taxonomy restructure; likely stale in places if they're meant to track the live system.
- Untracked/loose files in the repo that predate and are unrelated to this work were left alone: `"The Biz Gift — Merged UI Kit & Production Inventory.html"`, `old_styleguide.css`, `styleguide.html.bak`, various loose images at `image/` root, and a large `docs/backups/` directory (Airtable pre-migration snapshots — useful to keep, but currently untracked/uncommitted).

## Suggested next steps
1. Confirm `AIRTABLE_BASE_ID` in Vercel, redeploy, re-test — this is the one thing standing between "code is correct" and "live data actually shows."
2. Verify in an actual browser (not just API calls) once #1 is resolved.
3. Decide on the deferred hamper-page sections (Editorial/CTA/logistics fields) and `submit-lead.js`'s write-access token.
4. Run the mobile/keyboard/reduced-motion/console checklist that's been pending since the styleguide-rollout phase.
