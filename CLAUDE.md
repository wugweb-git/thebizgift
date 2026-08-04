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
├── components.js                      # Shared component loader (fetch header/footer)
├── header.html                        # Shared header + mega menu
├── footer.html                        # Shared footer + WhatsApp widget
├── image/                             # Static image assets
├── api/                               # Vercel serverless functions (deploy as /api/*)
│   ├── get-featured-hampers.js        # Featured product grid
│   ├── get-hamper.js                  # Single product + related algorithm
│   ├── get-occasions.js               # Published occasion tags (explore page)
│   ├── get-collections.js             # Published collections (explore page)
│   ├── get-categories.js              # Published categories (explore page)
│   ├── submit-lead.js                 # Quote/proposal leads
│   ├── cron/refresh-cache.js          # Airtable→cache/KV/Blob push-sync (webhook + cron trigger)
│   └── _lib/
│       ├── cors.js                    # Shared origin allowlist for all api/*.js
│       └── airtableCache.js           # Shared read cache (in-memory + optional KV buffer)
├── package.json                       # Minimal -- only @vercel/blob, used solely by refresh-cache.js
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
2. **No framework** — vanilla HTML/CSS/JS only, no build step. One narrow, deliberate exception: `package.json` exists solely so `api/cron/refresh-cache.js` can use `@vercel/blob` (Layer 5 image mirroring, see "Airtable Integration" below). Vercel runs `npm install` for that one dependency; nothing else in the repo depends on it, there is no build/start script, and the site's HTML/CSS/JS is still served exactly as-is, no bundler.
3. **Airtable integration is Phase 2** — site currently runs on static content and mock data in `hamper.js`
4. **SEO is out of scope** for the current phase
5. **Never commit API keys** — Airtable credentials go in Vercel environment variables only
6. **Design tokens are the source of truth** — no hardcoded colors, spacing, or typography values; source lives in `docs/tokens/*.json`
7. **Reuse before creating** — check existing components (`header.html`, `footer.html`, `components.js`) and CSS patterns first
8. **Shared components load via fetch()** — `components.js` injects header and footer into placeholder `<div>` elements
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

- **Status:** Products, Occasions, Collections, and Categories are live-synced (read-only, gated on each table's `Published` flag). FAQs are not yet wired up — see content-architecture.md §15.
- **Base ID:** Set as `AIRTABLE_BASE_ID` env var in Vercel (`appG2IVjN168FLoqT`)
- **API Key:** Set as `AIRTABLE_API_KEY` env var in Vercel (PAT) — must have read access to Products, Occasions, Collections, Category, and Leads
- **Tables:** Products, Collections, Occasions, Category, Sub Category, FAQs, Leads
- **API endpoints:** `/api/get-featured-hampers.js`, `/api/get-hamper.js`, `/api/get-occasions.js`, `/api/get-collections.js`, `/api/get-categories.js`, `/api/submit-lead.js`
- **Mock data swap:** `hamper.js` and `explore/index.html` both key off `window.TBG_IS_LOCAL` (set once by `components.js`) — localhost renders static/mock fallback content, production fetches live from Airtable

### Caching / rate-limit architecture

Airtable enforces a **5 requests/second cap per base** (not per caller). The architecture's answer is blunt: **visitor-facing reads never touch Airtable at all.**

The durable KV buffer (Upstash Redis) is the website's authoritative content store. The 5 read endpoints above go through `api/_lib/airtableCache.js`, which reads *only* from KV. Airtable is contacted exclusively by the protected sync endpoint (`api/cron/refresh-cache.js`) after Airtable itself signals a change.

**KV is required, not optional.** Set `UPSTASH_REDIS_REST_URL`+`UPSTASH_REDIS_REST_TOKEN`, or Vercel's native Storage-integration naming `KV_REST_API_URL`+`KV_REST_API_TOKEN`. Without them the site has no content source and read endpoints return a 500 — `hasContentSource()` gates every one of them.

Three deliberate design choices worth knowing before editing this module:

1. **No process-local TTL cache.** `getCachedTable()` hits KV on every request rather than memoising in module scope. This is intentional (see the comment above `getCachedTable`): a sync can update KV on a *different* serverless instance, and a local cache would let stale content survive on warm instances that never saw the write. Concurrent requests for the same key are still coalesced via an in-flight promise map, so a burst produces one KV round-trip, not N.
2. **A cache miss fails loudly.** `resolveRecords()` throws `Content buffer has no snapshot for <key>` rather than falling back to a live Airtable fetch. A missing snapshot is an operational problem that should be visible and fixed, not silently papered over with unbounded Airtable traffic — which is exactly what the 5 req/s cap punishes.
3. **Pagination is followed properly.** `fetchAllRecords()` (sync path only) follows Airtable's `offset` token across pages, up to `MAX_PAGES` (1000 records). Airtable caps each *page* at 100 records regardless of `maxRecords`, so without this the catalog would silently truncate past 100 published rows.

**Write path (lead submissions)** mirrors this shape in reverse — see `api/_lib/leadsQueue.js`. A lead is pushed onto a durable Redis list *before* Airtable is contacted; if the Airtable write then fails, the visitor still sees success because the lead is safely captured, and `refresh-cache.js` retries it on the next webhook ping or cron heartbeat.

**Push-based sync** (`api/cron/refresh-cache.js`) proactively keeps the buffer warm so reads almost never fall through to a live Airtable call at all. Two real triggers, both genuinely event-driven or persistent (no session-dependent polling, no third-party service):

- **Airtable's native Webhooks API** (primary, real-time) — a REST API feature available on *every* Airtable plan, distinct from the Automations UI's "Send webhook" action (which is gated to Team plan and above and was unavailable on this project's plan). Registered once via `api/register-airtable-webhook.js` (run `curl -X POST https://<domain>/api/register-airtable-webhook -H "X-Webhook-Secret: <WEBHOOK_SECRET>"` — uses the server's own `AIRTABLE_API_KEY`, no credential handling needed by whoever runs it). Airtable then POSTs a lightweight ping (no record diff, just "something changed") to `refresh-cache.js` on any base edit; the ping is authorized by checking its `webhook.id` against the one registered (not full HMAC verification of Airtable's `X-Airtable-Content-MAC` header — the worst case of accepting a forged ping is one harmless extra refresh cycle, so that complexity isn't worth it here). The registered webhook would otherwise expire after 7 days; `refresh-cache.js` calls Airtable's refresh-webhook endpoint on every successful trigger, and since the daily Cron always fires at least once a day, the webhook never actually expires. Requires the `AIRTABLE_API_KEY` PAT to have the `webhook:manage` scope — if registration fails with a permissions error, add that scope to the token in Airtable's settings.
- **Vercel Cron** (safety net only) — `vercel.json`'s `crons` entry hits the same endpoint daily, authenticated via Vercel's own auto-injected `Authorization: Bearer <CRON_SECRET>` header (set a `CRON_SECRET` env var to enable — **must have no leading/trailing whitespace**, Vercel's build fails outright otherwise since it's sent as a raw HTTP header value). Vercel Cron frequency is plan-tier-gated (Hobby has historically capped it at once/day) — treat this as a coarse reconciliation pass and the webhook's expiry keep-alive, not the freshness mechanism.
- `refresh-cache.js` also still accepts a manual trigger via `X-Webhook-Secret` header or `?secret=` query param (the latter for Airtable UIs whose Automation action doesn't expose custom headers) — useful for testing, not required for normal operation now that the native webhook is live.
- Without `WEBHOOK_SECRET` or `CRON_SECRET` set, this endpoint rejects every request (fails closed).

**Image mirroring** (also `refresh-cache.js`, opt-in via `BLOB_READ_WRITE_TOKEN`): every synced Product/Category/Occasion image attachment gets downloaded once and re-uploaded to Vercel Blob storage, with the cached record's `url` rewritten to the permanent Blob URL instead of Airtable's own attachment URL (which isn't meant for long-term hotlinking). Idempotent — an attachment already mirrored (tracked by its stable Airtable attachment id in the KV buffer) is never re-downloaded/re-uploaded. Without `BLOB_READ_WRITE_TOKEN`, this step is skipped and images keep pointing at Airtable directly, same as today.

**Manual one-time bridge** (`scripts/seed-*-from-csv.js`, one per table): for bootstrapping the buffer from a CSV export when Airtable's REST API itself is rate-limited — parses a Grid View CSV export and writes straight into the same cache/KV buffer and Blob-mirror pipeline above, without ever calling `api.airtable.com` (image downloads go through Airtable's separate, non-rate-limited attachment CDN). Not part of normal operation; see the header comment in `scripts/seed-products-from-csv.js` for usage and caveats (CSV attachment URLs are signed/time-limited).

**Env vars** — the KV pair is **required**; the rest are opt-in:

| Env var | Enables | Where it comes from |
|---|---|---|
| `UPSTASH_REDIS_REST_URL`+`UPSTASH_REDIS_REST_TOKEN`, or `KV_REST_API_URL`+`KV_REST_API_TOKEN` | **Required** — the content buffer every read endpoint serves from. Without it, all 5 read endpoints 500 | Attach an Upstash Redis integration to the Vercel project (the latter naming is what Vercel auto-generates via its native Storage integration) |
| `WEBHOOK_SECRET` | Airtable webhook registration + manual sync trigger | Pick any random string; used both to authorize `register-airtable-webhook.js` and as the manual-trigger secret |
| `CRON_SECRET` | Vercel Cron → sync trigger | Pick any random string with **no leading/trailing whitespace**; Vercel auto-sends it as `Authorization: Bearer <value>` to cron-triggered requests once set |
| `BLOB_READ_WRITE_TOKEN` | Image mirroring to Vercel Blob | Attach a Vercel Blob store to the project (auto-injected) |

## Vercel Deployment

- **Root Directory = repo root (leave blank)** — site files are at the root, so no Root Directory setting is needed. This is intentional: it makes the project transferable to any Vercel account with zero config (import → deploy).
- Framework Preset = Other (static)
- Config: `vercel.json` at repo root (security headers, image + CSS/JS caching); `.vercelignore` keeps `docs/` out of the bundle
- Environment variables: `AIRTABLE_API_KEY`, `AIRTABLE_BASE_ID`, and the KV pair (`UPSTASH_REDIS_REST_URL`+`UPSTASH_REDIS_REST_TOKEN`, or `KV_REST_API_URL`+`KV_REST_API_TOKEN`) are **required** — without KV every read endpoint returns a 500. `AIRTABLE_LEADS_TABLE`, `WEBHOOK_SECRET`, `CRON_SECRET`, `BLOB_READ_WRITE_TOKEN` are optional (see "Caching / rate-limit architecture" above)
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
| Explore Hub | Working | Ecommerce-style catalog: hero + sidebar filters (Occasion/Category/Collection) + sort + removable filter chips + product grid, live from Airtable in production |
| Hamper Detail | Working (mock) | Hero, Planning, Related, Proposal blocks (see docs/design.md for removed-block history), renders from mock data on localhost |
| Customisation | Working | 10 sections |
| Quote | Working | Form with 14 fields, simulates success on localhost |
| Legal (Privacy/Terms) | Working | Static content |
| Sitemap | Working | Static links |
