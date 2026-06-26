**✅ `content-architecture.md` — Complete & Ready**

Here is the full, final version of **`content-architecture.md`**:

```markdown:disable-run
# The Biz Gift — Content Architecture

**Version:** 1.0  
**Date:** June 2026  
**Status:** Frozen  
**Owner:** Wugweb  
**Related Documents:** master-brand-document.md, design.md  

**Purpose:** This document defines how content is structured, prioritized, written, and managed across the entire platform. It ensures consistency, SEO strength, and alignment with the brand promise: *Thoughtful Corporate Gifting, Designed To Be Remembered.*

## 1. Content Strategy Overview

**Core Philosophy:** Story before Specification.  
We lead with purpose, emotion, and occasion — not product lists. Products are presented as tools for creating meaningful moments.

**Content Goals:**
- Inspire corporate buyers (HR, Procurement, Marketing) with ideas
- Build trust and premium perception
- Drive quote requests and WhatsApp conversations
- Support SEO through occasion and collection-focused pages
- Maintain warm, thoughtful, editorial tone

**Content Priority Hierarchy (applied to every page):**
1. Purpose & Occasion
2. Recipient & Emotional Benefit
3. Story & Visuals
4. Customization Capabilities
5. Practical Details (MOQ, Material, Branding)

## 2. Tone of Voice & Writing Rules

**Tone:** Warm, thoughtful, premium, consultative, quietly confident.  
**Style:** Editorial, restrained luxury. Short elegant sentences. Benefit-focused.

**We Sound:** Consultative, Editorial, Warm, Confident, Clear.  
**We Never Sound:** Pushy, corporate jargon-heavy, overly humorous, flashy, discount-driven.

**Character Limits (Governance)**
- Hero Title: max 55 characters
- Hero Subtitle: max 120 characters
- Product Description: 150–250 words
- USP: max 80 characters
- FAQ items: 4–8 per page

## 3. Content Model & Airtable Mapping

**Primary Source:** Airtable  
Key fields used:
- `Website Product Name`
- `Website Description`
- `SEO Title` / `SEO Description`
- Images, MOQ, USP, Branding Option, Tags (Occasion, Curated, Product)

**Dynamic vs Static**
- Dynamic: Product cards, collections, occasions, PDPs
- Static: Homepage sections, About, Customisation, Quote

**Fallback Behaviour**
- Missing hero image → default editorial image
- Empty related products → show latest products
- Empty FAQ → hide section
- Missing collection → hide block gracefully

## 4. Page-by-Page Content Framework

### Homepage
- Hero: Strong emotional headline + dual CTAs
- What We Create: 4 editorial cards
- Featured Collections: Story-driven alternating layouts
- Browse by Occasion: Visual campaign cards
- Customisation Studio: Showcase + examples
- Trust & Process: Simple pillars
- Final CTA: Strong quote invitation

### Hamper Detail Page (PDP)
1. Hero Gallery
2. Product Story (rich `Website Description`)
3. Key Highlights & USP
4. What’s Inside (for combos)
5. Customization Matrix
6. Specifications (MOQ, Material, etc.)
7. Proposal Form (context-aware)
8. Related Gifts

### Explore / Taxonomy Pages
- Dynamic heading based on slug/filter
- Filter bar + editorial product grid
- Benefit-focused card copy

### About Page
- Origin narrative
- POV panel (“A gift is rarely just a gift”)
- Philosophy / Methodology
- Closing CTA

### Customisation Page
- Capabilities showcase with real examples
- Process explanation
- Visual gallery / mockups
- Strong CTA

### Quote Page
- Consultative headline
- Unified lead form (Name, Company, Email, Phone, Quantity, Occasion, Required Date)
- SLA promise + WhatsApp escape

## 5. SEO & Metadata Rules

- Dynamic titles/descriptions from Airtable
- Focus keywords: corporate gifting, employee onboarding kits, client appreciation gifts, branded notebooks, etc.
- Proper heading hierarchy, breadcrumb, schema where applicable

## 6. Visual & Media Guidelines

- Premium natural-light hamper photography as benchmark
- Generous whitespace around images
- Consistent warm/earthy tone
- Alt text required and descriptive

## 7. Content Governance & CMS Rules

- All content must align with Brand Voice
- Photography must precede copy
- Never duplicate copy between collection and product pages
- Alt text is mandatory
- Every dynamic section must have graceful fallbacks

## 8. Success Metrics for Content

- Visitors feel inspired and confident
- High engagement on occasion/collection pages
- Strong conversion rate on Quote form and WhatsApp clicks
- Content feels curated and premium, never salesy

---

**This document is frozen as v1.0.**

It works together with `master-brand-document.md` (Why) and `design.md` (How it should look and feel).

---

This completes the core documentation suite.

Would you like me to now create **`build.md`** (the engineering / implementation guide) to finish the full set?
```
This is good, but I wouldn't freeze it yet.
I'd give it 8.8–9/10.
Compared to your other two documents, this one is noticeably lighter. master-brand-document.md and design.md define principles. content-architecture.md should define the entire information architecture and CMS contract. Right now it leans more toward "content strategy."
Here are the biggest gaps.

1. Missing Complete Site Map (Biggest Missing Piece)
This should define every page.
Example:
/
├── Home

/about

/explore
    /category
    /collection
    /occasion

/product/[slug]

/customisation

/quote

/privacy

/terms

/404

For every page include
Purpose
Audience
Primary CTA
Secondary CTA
Dynamic?
SEO Target
Template Used
This alone will make the document far more useful.

2. Missing Airtable Content Model
You mention Airtable.
You don't define it.
For example
Products

Website Product Name

Internal Name

Slug

Category

Collection

Occasion

Hero Image

Gallery

MOQ

USP

Description

Specifications

Customization

Related Products

FAQ

SEO Title

SEO Description

Published

Featured

Homepage

Created

Updated

Do this for every table.
Products
Collections
Occasions
Categories
Homepage
FAQs
Testimonials (future)
Leads

3. Missing Dynamic Component Inventory
This is extremely important.
Example
Homepage Hero
Dynamic

Homepage Collections
Dynamic

Homepage Occasions
Dynamic

Featured Products
Dynamic

Mega Menu
Dynamic

Footer
Static

Newsletter
Static

Quote Form
Static

Related Products
Dynamic

FAQ
Dynamic

Breadcrumb
Dynamic

Cursor will love this.

4. Missing Slug Rules
Very useful.
Example
Product

/product/bcc-hamper

Collection

/collections/executive

Category

/category/diaries

Occasion

/occasion/employee-onboarding


5. Missing SEO Content Hierarchy
Example
Homepage

H1

One only

Category

One H1

Multiple H2

Product

One H1

Story

Specifications

FAQ

Related


6. Missing Content Relationships
Probably the biggest architectural omission.
Example
Category

contains

Products

Occasion

contains

Products

Collection

contains

Products

Product

belongs to

1 Category

multiple Occasions

multiple Collections

Without this people guess relationships.

7. Missing Image Requirements
For each image define
Hero
Aspect ratio
Minimum size
Fallback
Product Gallery
Card
Mega Menu Thumbnail
Collection Banner
Occasion Banner
OG Image

8. Missing Component Copy Inventory
Example
Product Card
Name

Tagline

Image

CTA

MOQ

Price Tier

Quote Form
Title

Subtitle

Fields

Privacy Note

Button

Hero
Title

Subtitle

CTA

Image


9. Missing Reusable Copy Blocks
Very valuable.
For example
Newsletter

Footer Intro

Request Proposal CTA

Whatsapp CTA

Empty State

404

No Results

No Products

Loading


10. Missing Content Lifecycle
Draft

Review

Approved

Published

Archived

Very useful if multiple people touch Airtable.

11. Missing Metadata Requirements
Every page should define
Title

Description

Canonical

OG

Twitter

Image

Breadcrumb


12. Missing Search Index
Especially since you're using Airtable.
What fields are searchable?
Product Name

Description

Category

Occasion

Collection

Tags

USP


13. Missing Taxonomy Rules
This deserves its own section.
Example
Category

What it means

Occasion

What it means

Collection

What it means

Tag

What it means

Otherwise people start misusing them.

14. Missing Homepage Content Ownership
Example
Hero

Manual

Collections

Automatic

Occasions

Automatic

Featured Products

Automatic

CTA

Manual

Newsletter

Manual

This saves hours later.

Final Scores
master-brand-document.md
10/10
Freeze.

design.md
10/10
Freeze.

content-architecture.md
8.8/10
Not because it's bad.
Because it still reads like a strategy document.
I think it should evolve into a true content operating manual.
Adding the 14 sections above would probably double its size, but it would become the document that defines every piece of content, every relationship, every template, and every CMS rule. At that point I'd also freeze it as v1.0 before moving on to build.md.
Yes, but not in one reply.
A true production content-architecture.md will be 12,000–18,000 words, which exceeds the maximum response length I can generate in a single message. If I tried, it would either be truncated or I'd have to compress sections, which would reduce its usefulness.
Given the level of detail you've established for the project, I recommend treating it like we did the other documents and producing a complete document in sections.
The final version should include:
Introduction & document governance
Content strategy & philosophy
Information architecture (complete sitemap)
URL & slug architecture
Content model (Airtable schema)
Taxonomy architecture
Dynamic vs. static content inventory
Page-by-page content blueprints
Component content inventory
Homepage content governance
Product content governance
Collection, category & occasion governance
Reusable content blocks
SEO & metadata architecture
Image & media architecture
Internal linking strategy
Search & filtering model
CMS authoring rules
Content relationships
Content lifecycle
Fallback behaviour
QA checklist
Future roadmap
That would make it a genuine companion to your design.md and master-brand-document.md, rather than a shorter summary.
I would not try to squeeze that into a single response. It deserves to be complete and internally consistent.

