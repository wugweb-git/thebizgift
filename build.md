
For this project, build.md should cover:
Project philosophy & engineering principles
Folder architecture
File naming conventions
HTML/CSS/JS architecture
Design token implementation
Dynamic vs. static rendering strategy
Airtable integration architecture
API & fetch patterns
Component architecture
Shared template system
Routing & URL strategy
Image optimization pipeline
SEO implementation
Performance budgets
Accessibility implementation
Motion implementation
Forms & lead pipeline
Dynamic block rendering
Error & fallback handling
State management
Search & filtering
Mega menu implementation
Build order
Cursor rules & prompts
Coding standards
QA checklist
Deployment workflow
Future extensibility

The Biz Gift Build Documentation v1.0
00 Introduction
Purpose
Audience
Document hierarchy
Relationship with
master-brand-document.md
design.md
content-architecture.md

01 Engineering Principles
The engineering philosophy.
Examples
Content First
Design Token First
Component First
Progressive Enhancement
Mobile First
Accessibility First
Performance Budget
SEO Native
Zero Duplication
Single Source of Truth

02 Technology Stack
Complete stack.
Example
Frontend
HTML5
CSS
Vanilla JS
CMS
Airtable
Hosting
Cloudflare Pages / Netlify
Storage
Cloudinary
Forms
Formspree / Airtable
Icons
Lucide
Typography
Google Fonts
Analytics
Plausible / GA4

03 Folder Architecture
Complete folder tree.
assets/

components/

css/

js/

data/

pages/

category/

collection/

occasion/

product/

privacy/

terms/

404/

robots.txt

llms.txt

security.txt

ai-context.txt

Every folder explained.

04 File Naming Convention
Rules
Never
page1.html

home-new.html

homepage-final2.html

Always
product-detail.html

category-template.html

quote.html


05 HTML Standards
doctype
semantic html
heading hierarchy
landmarks
aria
section ids
anchor ids
schema
etc

06 CSS Architecture
Structure
tokens.css

base.css

layout.css

utilities.css

components.css

pages.css

animations.css

Naming
BEM?
Utility?
Hybrid?
Rules
Never inline css
Never duplicate
Never magic numbers

07 Javascript Architecture
Modules
navigation.js

mega-menu.js

airtable.js

filters.js

gallery.js

form.js

search.js

faq.js

Rules
No giant js files
No jquery
ES Modules

08 Component Architecture
Every reusable component.
Header
Mega Menu
Footer
Newsletter
Hero
Card
Gallery
Quote Form
FAQ
Breadcrumb
Carousel
etc
Each
Purpose
Inputs
Outputs
Dependencies
Dynamic?

09 Design Token Implementation
How design.md becomes css.
Example
:root{

--space-1

--space-2

--radius-lg

--brand-primary

}


10 Dynamic Rendering Architecture
Huge section.
Static
Dynamic
Hybrid
Homepage
Product
Collections
Occasions
Category
Related
FAQ
Newsletter

11 Airtable Architecture
Tables
Products
Collections
Occasion
Homepage
FAQs
Leads
Featured
Relationships
Sync

12 Fetch Strategy
How fetch happens.
Caching
Retries
Loading
Error
Offline
Fallback

13 Dynamic Blocks
Every dynamic section.
Hero
Collections
Occasions
Related
FAQ
Planning
Mega Menu
Newsletter
etc

14 Image Pipeline
Cloudinary
Formats
WebP
AVIF
Widths
Lazy loading
Aspect ratios

15 Routing
URLs
/

product/

collection/

category/

occasion/

Slug rules
Canonical
404
Redirects

16 Forms
Quote
Lead
Customization
Newsletter
Validation
Success
Failure

17 Search
Search architecture
Fields
Ranking
Filtering
Sorting
Pagination

18 Mega Menu
Desktop
Tablet
Mobile
Interaction
Hover
Keyboard
Touch

19 Animation Implementation
Intersection Observer
Scroll
Parallax
Gallery
Transform
Duration
Reduced motion

20 Accessibility
WCAG
Keyboard
Focus
ARIA
Contrast
Alt

21 SEO
Titles
Descriptions
Schema
Open Graph
Twitter
Canonical
Sitemap
Robots
JSON-LD

22 Performance
Budgets
Compression
Fonts
Caching
Images
JS
CSS
Core Web Vitals

23 Error Handling
404
500
No Product
No Collection
No FAQ
Broken Images
API Failure

24 Build Order
Exactly what Cursor should build.
Foundation

↓

Tokens

↓

Header

↓

Footer

↓

Homepage

↓

Cards

↓

Templates

↓

PDP

↓

Forms

↓

Search

↓

SEO

↓

QA


25 Coding Standards
Naming
Spacing
Imports
Comments
Functions
Events
Classes

26 Cursor Rules
Extremely important.
Never
Invent components
Duplicate html
Hardcode colors
Hardcode spacing
Ignore tokens
Always
Read design.md
Read content architecture
Read build
Use tokens
Reuse components
Respect templates

27 QA Checklist
Every page.
Visual
Responsive
Performance
Accessibility
SEO
Dynamic
Forms
Analytics

28 Deployment
Checklist
Cloudflare
Netlify
DNS
Headers
Cache
Sitemap
Robots
Security
Analytics
Search Console

29 Future Expansion
Wishlist
Gift Builder
Accounts
Saved Gifts
AI Concierge
Ordering
Payments
CRM

30 Appendix
Folder Tree
Naming Rules
CSS Rules
JS Rules
Airtable Rules
Deployment Checklist
Performance Checklist
SEO Checklist
Accessibility Checklist

I would add one document that almost nobody creates but becomes invaluable:
31 Decision Log
Whenever you intentionally choose one approach over another, record it.
Example:
Decision
Reason
Date
Single Quote page instead of cart
B2B consultative sales model
Jun 2026
Three taxonomy templates
Matches Airtable model
Jun 2026
Mega menus only for Explore & Collections
IA clarity and scalability
Jun 2026
No pricing on homepage
Premium positioning
Jun 2026
Static About page
Stable brand narrative
Jun 2026

Six months later, this prevents revisiting already-settled architectural decisions.
I think this structure would produce a 15k–20k word engineering handbook that complements your other three documents and serves as the definitive implementation reference for Cursor and future developers.

