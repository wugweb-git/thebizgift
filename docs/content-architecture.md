# The Biz Gift — Content Architecture

**Version:** 1.0  
**Date:** June 2026  
**Status:** Draft — Schema TBD  
**Owner:** Wugweb  
**Related Documents:** master-brand-document.md, design.md, build.md

**Purpose:** This document defines how content is structured, prioritized, authored, and managed. The Airtable schema will be defined separately when write access is available. For now, this captures the content strategy, information architecture, taxonomy rules, and dynamic behaviour needed to build the frontend with mock data.

---

## 1. Content Strategy Overview

**Core Philosophy:** Story before Specification.
We lead with purpose, emotion, and occasion — not product lists.

**Content Goals:**
- Inspire corporate buyers (HR, Procurement, Marketing)
- Drive quote requests and WhatsApp conversations
- Maintain warm, thoughtful, editorial tone

**Content Priority Hierarchy:**
1. Purpose & Occasion
2. Recipient & Emotional Benefit
3. Story & Visuals
4. Customisation Capabilities
5. Practical Details (MOQ, Material, Branding)

---

## 2. Information Architecture & Sitemap

### 2.1 URL Structure

| URL Pattern | Template | Purpose | Primary CTA | Dynamic? |
|-------------|----------|---------|-------------|----------|
| `/` | Homepage | Editorial showroom | Request Proposal | Partial |
| `/about` | About | Brand story | Request Proposal | No |
| `/explore` | Explore Hub | Discovery landing | View Products | Partial |
| `/category/{slug}` | Category | Products by type | Request Proposal | Yes |
| `/collection/{slug}` | Collection | Curated set | Request Proposal | Yes |
| `/occasion/{slug}` | Occasion | Products by use-case | Request Proposal | Yes |
| `/product/{slug}` | Product Detail | Story + customisation | Request Proposal | Yes |
| `/customisation` | Customisation Studio | Capabilities | Request Proposal | No |
| `/quote` | Quote | Lead capture | Submit Enquiry | No |
| `/privacy` | Legal | Privacy policy | — | No |
| `/terms` | Legal | Terms | — | No |
| `/sitemap` | Utility | XML sitemap | — | No |
| `/404` | Error | Editorial 404 | Explore Gifts | No |

### 2.2 Navigation (Frozen)

1. Home — `/`
2. Explore Gifts — `/explore` (mega menu: Categories + Collections + Occasions)
3. Customisation — `/customisation`
4. About — `/about`
5. Request Proposal — `/quote`

---

## 3. Taxonomy Architecture

Taxonomy is how content is organised and discovered.

### 3.1 Definitions

**Category** — Product type (e.g., Diaries, Drinkware, Wellness, Tech Accessories).
- Usage: Secondary discovery. Drives `/category/{slug}`.
- Cardinality: One product → one Category.

**Occasion** — Use-case or emotional trigger (e.g., Employee Onboarding, Client Appreciation, Festive Gifts).
- Usage: Primary discovery above the fold. Drives `/occasion/{slug}`.
- Cardinality: One product → multiple Occasions.

**Collection** — Curated editorial set (e.g., Executive Welcome, Festive Celebration).
- Usage: Editorial highlight. Drives `/collection/{slug}`. Mega menu + featured sections.
- Cardinality: One product → at most one Collection.

**Tag** — Descriptive attribute for search (e.g., leather, gold-stamp, a5).
- Usage: Internal only. Not user-facing navigation.
- Cardinality: One product → multiple Tags.

### 3.2 Taxonomy Rules

1. Every published product MUST have at least one Category, one Occasion, and one Collection.
2. Do not create a new Category unless it will contain at least 6 products.
3. Collections are marketing-curated — requests via Airtable comments.
4. Tags must be lowercase, hyphen-separated, approved vocabulary only.

### 3.3 Approved Vocabulary (Launch)

**Categories:** Diaries, Drinkware, Tech Accessories, Wellness, Lifestyle, Festive, Desk

**Occasions:** Employee Onboarding, Client Appreciation, Festive Gifts, Leadership Gifts, Vendor Gifts, Annual Day, Milestone & Retirement

**Collections:** Executive Welcome, Premium Desk Set, Coffee Calm, Heritage Box, Festive Celebration, BCC Hamper

---

## 4. Dynamic vs Static Content Inventory

### 4.1 Dynamic Components (Airtable-driven)

| Component / Section | Source | Fallback |
|---------------------|--------|----------|
| Homepage featured collections | Collections table | Static cards |
| Homepage featured occasions | Occasions table | Static cards |
| Homepage featured products | Products (featured=true) | Static grid |
| Mega menu collections | Collections | Hardcoded nav |
| Mega menu occasions | Occasions | Hardcoded nav |
| Category pages | Categories + Products | No products message |
| Collection pages | Collections + Products | No products message |
| Occasion pages | Occasions + Products | No products message |
| Product detail (all fields) | Products | Mock data (localhost) |
| Product related | Products | Latest products |
| Product FAQ | FAQs table | Hide section |
| Collection/Occasion FAQ | FAQs table | Hide section |

### 4.2 Static Components

| Component / Section | Location |
|---------------------|----------|
| Header & mega menu trigger | `html/header.html` |
| Footer | `html/footer.html` |
| Newsletter form | Inside footer |
| WhatsApp widget | Inside footer |
| About page | `html/about.html` |
| Customisation page | `html/customisation.html` |
| Quote page | `html/quote.html` |
| Legal pages | `html/privacy.html`, `html/terms.html` |
| Sitemap | `html/sitemap.html` |
| Editorial sections | Homepage |

**Rule:** Static homepage sections should not exceed 60% of total homepage content.

---

## 5. URL & Slug Rules

- Lowercase only, hyphen-separated words (a–z, 0–9, hyphens only)
- Max 60 characters
- Immutable once published (publishing duplicate slug → redirect to existing)
- Human-friendly preferred over SEO-stuffed

**Patterns:**
- Product: `/product/{slug}` → `/product/executive-welcome-kit`
- Collection: `/collection/{slug}` → `/collection/executive-welcome`
- Occasion: `/occasion/{slug}` → `/occasion/employee-onboarding`
- Category: `/category/{slug}` → `/category/diaries`

---

## 6. SEO & Metadata Architecture (Deferred — Phase 2)

### 6.1 Page Hierarchy

| Page Type | H1 | H2 |
|-----------|----|-----|
| Homepage | 1 | Up to 6 |
| Category | 1 (name) | Intro, benefits |
| Collection | 1 (name) | What's inside, process |
| Occasion | 1 (name) | Why it matters |
| Product | 1 (name) | Story, Specs, FAQ, Related |

### 6.2 Metadata Requirements

- `<title>` and `<meta name="description">` unique per page
- Product pages: from Airtable `SEO Title` / `SEO Description`
- Canonical self-referencing
- Open Graph + Twitter cards (phase 2)
- JSON-LD BreadcrumbList on product/taxonomy pages

**Note:** Full SEO implementation is out of scope for current phase. Metadata hooks are in place; content will be populated when SEO phase opens.

---

## 7. Content Relationships

```
Category ──< contains >──┐
                          ├──< belongs to >── Product
Collection ──< contains >─┘
                          ├──< belongs to >── Product
Occasion ──< contains >───┘
```

- One product → one Category
- One product → multiple Occasions (1–4 typical)
- One product → at most one Collection
- Related products: calculated server-side by tag overlap (Collection > Occasion > Category > Tags), max 4

---

## 8. Image & Media Architecture

### 8.1 Image Contexts

| Context | Aspect Ratio | Min Size | Format | Lazy Load | Fallback |
|---------|-------------|----------|--------|-----------|----------|
| Product hero gallery | 16:10 | 1600×1000 | WebP/JPEG | First image eager | Placeholder SVG |
| Product gallery (additional) | 16:10 | 1600×1000 | WebP/JPEG | Yes | Placeholder |
| Make It Yours branding | 1:1 | 800×800 | WebP | Yes | Gray tile |
| Related product card | 4:5 | 800×1000 | WebP | Yes | Placeholder |
| Collection/occasion banner | 3:2 | 1600×1000 | WebP | No (above fold) | Solid brand colour |
| OG / Twitter | 1200×630 | 1200×630 | JPEG/PNG | N/A | Logo on bronze |
| Category card | 4:3 | 800×600 | WebP | Yes | Placeholder |

### 8.2 Image Rules

- Natural light, warm tone, soft shadow
- No white studio backgrounds
- No overlaid text
- Alt text mandatory
- Compress to ≤200KB before Airtable upload
- `onerror` → placeholder SVG with product initial

---

## 9. Homepage Content Ownership

| Section | Ownership | Managed Via | Frequency |
|---------|-----------|-------------|-----------|
| Hero text | Static | `html/index.html` | Per campaign |
| Featured Collections | Dynamic | Airtable Collections | Weekly |
| Browse by Occasion | Dynamic | Airtable Occasions | Monthly |
| Selected Gifts | Dynamic | Airtable Products | Weekly |
| Other sections | Static | `html/index.html` | Rarely |

---

## 10. Content Governance

### 10.1 Authoring Rules

1. Product `Website Description`: 150–250 words, lead with purpose.
2. No egotistical language ("best", "premium" — let visuals communicate premium).
3. No pricing on any public-facing card.
4. Product cards show MOQ only.
5. All images must have descriptive alt text before `Published`.

### 10.2 Content Lifecycle

| State | Meaning | Criteria |
|-------|---------|----------|
| Draft | Work in progress | Content incomplete |
| Review | Awaiting approval | First pass done |
| Approved | Cleared | Matches voice + visual |
| Published | Live | `Published` checked in Airtable |
| Archived | Retired | Out of season / discontinued |

### 10.3 Pre-Publish Checklist

- [ ] Name, description, USP non-empty
- [ ] At least one hero image loads
- [ ] Category, Occasion, Collection linked
- [ ] MOQ, Lead Time, Delivery filled
- [ ] Branding options listed
- [ ] Renders on mobile + desktop
- [ ] Related products sensible

---

## 11. Reusable Content Blocks

| Block ID | Copy | Location |
|----------|------|----------|
| `footer_intro` | "Thoughtful corporate gifting, designed to be remembered." | Footer |
| `newsletter_label` | "Occasional inspiration, not noise." | Newsletter |
| `quote_eyebrow` | "Start the conversation" | Quote page |
| `quote_headline` | "Let's create something memorable." | Quote page |
| `whatsapp_cta` | "Chat with us on WhatsApp" | Sticky widget |
| `empty_state_products` | "No products found. <a href='/explore'>Explore all gifts</a>." | Listing pages |
| `error_404_headline` | "This page has been wrapped." | 404 |
| `error_404_cta` | "Back to gifts" | 404 |

---

## 12. Fallback Behaviour Matrix

| Scenario | Behaviour |
|----------|-----------|
| Product has 0 images | Show placeholder tile |
| Product has 1 image in gallery | Disable prev/next arrows |
| Product has no FAQ | Hide FAQ section |
| Product has no related | Hide "You May Also Like" |
| Product has no branding | Hide "Make It Yours" |
| Product has no occasion tags | Hide "Perfect For" |
| Collection/Occasion has 0 products | Show empty state with explore link |
| Airtable API timeout | Error panel with retry + WhatsApp CTA |
| Image fails to load | Replace with placeholder SVG |

---

## 13. Mock Data Strategy

Until Airtable schemas are finalised:

- Product detail pages: `html/hamper/hamper.js` contains `MOCK_DATA` with realistic sample records.
- Forms: Return simulated success after delay.
- Featured grids: Static HTML in explore hub.

When schemas are ready, swap mock data for live API calls via `USE_MOCK_DATA` flag.

---

## 14. Success Metrics

- High engagement on occasion/collection pages (scroll depth > 60%)
- Strong conversion on Quote form and WhatsApp clicks (> 3%)
- Low bounce rate on product pages (< 40%)
- Content feels curated and premium, never salesy

---

---

## 15. Airtable Content Model

Field definitions for each table. Field names are case-sensitive and must match the code exactly.

### 15.1 Products

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `Website Product Name` | Single line text | Yes | Display name (H1, breadcrumb) |
| `Internal Name` | Single line text | No | Team-facing reference name |
| `URL Slug` | Single line text | Yes | Immutable, lowercase, hyphenated |
| `Category` | Link to Categories | Yes | One per product |
| `Occasion Tags` | Link to Occasions | Yes | 1–4 per product |
| `Curated Gift Tags` | Link to Collections | No | 0–1 per product |
| `Product Tags` | Multiple select | No | Internal search/filter labels |
| `Product Images` | Attachment | Yes | Min 1 hero image, up to 6 |
| `Website Description` | Long text | Yes | 150–250 words, lead with purpose |
| `USP` | Single line text | No | ≤ 80 characters |
| `MOQ` | Number | Yes | Minimum order quantity |
| `Material` | Single line text | No | Primary materials |
| `Branding Option` | Multiple select | No | Available customisation methods |
| `Lead Time` | Single line text | Yes | e.g. "7–10 business days" |
| `Delivery` | Single line text | Yes | Delivery terms |
| `Response Time` | Single line text | No | e.g. "Within 4 hours" |
| `FAQ` | Long text (JSON) | No | Array of {question, answer} |
| `SEO Title` | Single line text | No | Phase 2 — `<title>` override |
| `SEO Description` | Long text | No | Phase 2 — meta description |
| `Published` | Checkbox | Yes | Controls visibility on site |
| `Featured` | Checkbox | No | Appears in homepage Selected Gifts |
| `Homepage` | Checkbox | No | Eligible for homepage featured |
| `Created` | Created time | Auto | — |
| `Updated` | Last modified time | Auto | — |

### 15.2 Collections

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `Name` | Single line text | Yes | Collection display name |
| `Slug` | Single line text | Yes | URL slug |
| `Description` | Long text | Yes | Collection narrative |
| `Hero Image` | Attachment | Yes | 3:2 ratio, 1600×1000 min |
| `Products` | Link to Products | Yes | Linked products |
| `Featured` | Checkbox | No | Homepage featured collections |
| `Published` | Checkbox | Yes | Controls visibility |
| `Order` | Number | No | Sort order in navigation |

### 15.3 Occasions

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `Name` | Single line text | Yes | Occasion display name |
| `Slug` | Single line text | Yes | URL slug |
| `Description` | Long text | Yes | Occasion narrative |
| `Hero Image` | Attachment | No | 3:2 ratio (fallback: brand colour) |
| `Products` | Link to Products | Yes | Linked products |
| `Featured` | Checkbox | No | Homepage featured occasions |
| `Published` | Checkbox | Yes | Controls visibility |
| `Order` | Number | No | Sort order in navigation |

### 15.4 Categories

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `Name` | Single line text | Yes | Category display name |
| `Slug` | Single line text | Yes | URL slug |
| `Description` | Long text | No | Category description |
| `Products` | Link to Products | Yes | Linked products |
| `Published` | Checkbox | Yes | Controls visibility |
| `Order` | Number | No | Sort order in navigation |

### 15.5 FAQs

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `Question` | Single line text | Yes | FAQ question |
| `Answer` | Long text | Yes | FAQ answer (plain text) |
| `Product` | Link to Products | No | Product-specific FAQ |
| `Collection` | Link to Collections | No | Collection-specific FAQ |
| `Occasion` | Link to Occasions | No | Occasion-specific FAQ |
| `Order` | Number | No | Display order in accordion |

### 15.6 Leads

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `Type` | Single select | Yes | `quote` / `proposal` / `newsletter` |
| `Name` | Single line text | Yes | Full name |
| `Company` | Single line text | Yes | Company name |
| `Email` | Email | Yes | Contact email |
| `Phone` | Phone | No | Contact phone |
| `Quantity` | Number | No | Estimated order size |
| `Budget` | Single line text | No | Budget range |
| `Occasion` | Single line text | No | Selected occasion |
| `Required By` | Date | No | Delivery deadline |
| `Branding` | Single line text | No | Branding requirements |
| `Message` | Long text | No | Additional notes |
| `Product` | Single line text | No | Product name (proposals) |
| `Product URL` | URL | No | Source product page |
| `Collection` | Single line text | No | Collection name |
| `Category` | Single line text | No | Category name |
| `Source Page` | URL | No | Page URL where form submitted |
| `Created` | Created time | Auto | — |

---

## 16. Component Copy Inventory

What copy each component requires. Helps content authors know exactly what to write.

| Component | Copy Fields | Character Guide |
|-----------|------------|-----------------|
| **Hero (Homepage)** | Title, Subtitle, CTA Primary, CTA Secondary | Title ≤55, Subtitle ≤120 |
| **Hero (Inner Page)** | Eyebrow, Title, Subtitle | Eyebrow ≤20, Title ≤55 |
| **Product Card** | Product Name, Image Alt | Name ≤40 |
| **Collection Card** | Name, Description, Image Alt, CTA | Description ≤80 |
| **Occasion Card** | Name, Description, CTA | Description ≤60 |
| **Product Detail** | Name, Description, USP, MOQ, Lead Time, Delivery | Description 150–250 words, USP ≤80 |
| **FAQ Item** | Question, Answer | Question ≤80, Answer ≤200 words |
| **Quote Form** | Title, Subtitle, Field Labels, Privacy Note, Submit Button | Title ≤40 |
| **Proposal Form** | Title, Highlights (3), Field Labels, Submit Button, Success Message | Highlights ≤20 words each |
| **Newsletter** | Label, Placeholder, Button | Label ≤30 |
| **Section Header** | Heading, Intro | Heading ≤60, Intro ≤120 |
| **Trust Pillar** | Title, Description | Title ≤20, Description ≤60 |
| **CTA Block** | Headline, CTA Primary, CTA Secondary | Headline ≤50 |
| **404 Page** | Headline, Body, CTA | Headline ≤40 |
| **Empty State** | Message, CTA | Message ≤60 |

---

## 17. Search Index (Phase 2)

When search is implemented, these fields should be indexed for full-text search:

| Searchable Field | Source Table | Weight |
|-----------------|-------------|--------|
| Product Name | Products | High |
| Description | Products | Medium |
| USP | Products | Medium |
| Category Name | Categories | High |
| Occasion Name | Occasions | High |
| Collection Name | Collections | High |
| Product Tags | Products | Low |

**Search rules:** Case-insensitive, partial match, ranked by weight. No pricing fields exposed. Results show product cards with name + image + CTA.

---

## 18. Metadata Requirements (Phase 2)

When SEO phase opens, every page must define:

| Page Type | Title | Description | Canonical | OG Image | Breadcrumb |
|-----------|-------|-------------|-----------|----------|------------|
| Homepage | Brand + tagline | Company description | Self | Hero image | — |
| About | "About — [Brand]" | Mission summary | Self | About hero | Home > About |
| Explore | "Explore Gifts — [Brand]" | Discovery description | Self | Collection image | Home > Explore |
| Collection | "[Name] — [Brand]" | Collection description | Self | Collection hero | Home > Explore > [Name] |
| Occasion | "[Name] — [Brand]" | Occasion description | Self | Occasion hero | Home > Explore > [Name] |
| Category | "[Name] — [Brand]" | Category description | Self | Category image | Home > Explore > [Name] |
| Product | Airtable `SEO Title` | Airtable `SEO Description` | Self | First product image | Home > [Collection/Category] > [Name] |
| Customisation | "Customisation — [Brand]" | Capabilities summary | Self | Customisation image | Home > Customisation |
| Quote | "Request Proposal — [Brand]" | Quote form description | Self | Logo on bronze | Home > Request Proposal |
| Legal | "[Page] — [Brand]" | Legal summary | Self | Logo on bronze | Home > [Page] |

**Schema markup:** JSON-LD BreadcrumbList on product and taxonomy pages. Organization schema on homepage.

---

**Schema note:** These table definitions represent the planned Airtable structure. Field names, types, and relationships will be validated when write access is granted. The current site operates on mock data that follows this model.