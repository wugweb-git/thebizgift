# Production Launch Checklist

Last updated: 2026-06-28

---

## 1. Content Replacements (Client-Supplied)

### 1a. WhatsApp Number
Replace placeholder `919999999999` with the real business WhatsApp number.

**8 instances across 6 files:**
| File | Line context |
|------|-------------|
| `footer.html:33` | Footer contact link |
| `footer.html:72` | Sticky WhatsApp widget |
| `index.html:583` | Homepage CTA button |
| `about.html:164` | About CTA button |
| `explore/index.html:327` | Explore CTA button |
| `customisation.html:347` | Customisation CTA button |
| `quote.html:25` | Quote hero button |
| `quote.html:187` | Quote conversation button |

**Quick replace:**
```bash
grep -rl "919999999999" --include="*.html" . | xargs sed -i '' 's/919999999999/91XXXXXXXXXX/g'
```

### 1b. Social Media Links
Replace generic URLs with actual brand profiles.

**File:** `footer.html` (lines 42–56) — all 5 in one place.

| Platform | Current | Replace with |
|----------|---------|-------------|
| Facebook | `https://facebook.com` | Actual page URL |
| X | `https://x.com` | Actual profile URL |
| LinkedIn | `https://linkedin.com` | Actual company URL |
| Instagram | `https://instagram.com` | Actual profile URL |
| Pinterest | `https://pinterest.com` | Actual profile URL |

Remove any platform the brand won't use — don't leave dead links.

### 1c. Contact Details
Verify these are correct:
- **Email:** `hello@thebizgift.com` (footer.html:25)
- **Phone:** `+91 8888 000 216` (footer.html:30)

### 1d. Copyright Year
- **File:** `footer.html:62` — currently says `© 2026`
- Update if launching in a different year

---

## 2. Images

### 2a. AI-Generated Placeholder Images
44 references to `Gemini_Generated_Image_*` files across the site. These need to be replaced with real product photography.

**Files with AI images:**
| File | Count | Sections using them |
|------|-------|-------------------|
| `customisation.html` | 13 | Branding options, occasions, gallery |
| `about.html` | 2 | Moments grid (joining kits, festive) |
| `quote.html` | 2 | Inspiration cards |
| `explore/index.html` | ~12 | Category cards, collection rows |
| `index.html` | ~15 | Hero, collections, create cards |

**Action:** Replace each `Gemini_Generated_Image_*.png` in `/image/` with real photography. Keep the same filenames to avoid updating HTML, or do a find-and-replace if renaming.

### 2b. Product Hamper Images
Verify all hamper product images in `/image/` are final photography, not mockups:
- `BCC Hamper.png`, `BCC Hamper 2.png`
- `Bottle Hamper.png`
- `Hamper 3.png`
- Any images referenced in `hamper/hamper.js` mock data

### 2c. Logo Files
Verify these are the final approved versions:
- `/image/TBG Logo New.png` — used in header, styleguide
- `/image/The Biz Gift (Logo).png` — used in footer

---

## 3. Airtable Integration (Phase 2)

Currently the site runs entirely on static content and mock data. To go live with dynamic products:

### 3a. Airtable Setup
- [ ] Confirm Airtable base `appG2IVjN168FLoqT` has all tables populated (Products, Collections, Occasions, Categories, FAQs, Leads)
- [ ] Schema matches `docs/content-architecture.md` §15
- [ ] Generate a read-only Personal Access Token (PAT)

### 3b. Vercel Environment Variables
- [ ] `AIRTABLE_API_KEY` — PAT (never commit to repo)
- [ ] `AIRTABLE_BASE_ID` — `appG2IVjN168FLoqT`
- [ ] `AIRTABLE_LEADS_TABLE` — defaults to `Leads`

### 3c. Code Switch
- [ ] Set `USE_MOCK_DATA = false` in `hamper/hamper.js`
- [ ] Verify API endpoints return live data: `/api/get-featured-hampers`, `/api/get-hamper`, `/api/submit-lead`
- [ ] Test form submissions land in the Leads table

---

## 4. SEO (Currently Out of Scope)

When ready to enable:
- [ ] Add unique `<meta name="description">` to every page (only about.html has one)
- [ ] Add `<meta property="og:*">` Open Graph tags for social sharing
- [ ] Add `<link rel="canonical">` to every page
- [ ] Create `/sitemap.xml` (machine-readable, not the HTML sitemap)
- [ ] Create `/robots.txt`
- [ ] Add structured data (JSON-LD) for Organization, Product
- [ ] Set up Google Search Console and submit sitemap
- [ ] Add favicon in multiple sizes (currently only PNG)

---

## 5. Analytics & Tracking

- [ ] Google Analytics 4 (or preferred analytics) — add snippet to all pages or to `header.html`
- [ ] Meta Pixel / LinkedIn Insight Tag (if running ads)
- [ ] WhatsApp click tracking (UTM parameters or event listeners)
- [ ] Form submission tracking (conversion events)
- [ ] Cookie consent banner (if required by policy)

---

## 6. Domain & DNS

- [ ] Custom domain configured in Vercel (not just `thebizgift.vercel.app`)
- [ ] SSL certificate active (Vercel handles this automatically)
- [ ] `www` → root redirect (or vice versa) configured
- [ ] Email DNS records (MX, SPF, DKIM) for `hello@thebizgift.com`

---

## 7. Performance & Security

Already in place:
- [x] Security headers in `vercel.json`
- [x] Image caching headers
- [x] CSS/JS caching headers
- [x] `onerror` fallbacks on all images
- [x] `rel="noopener"` on all external links
- [x] No API keys in client code

Still needed:
- [ ] Compress all product images (WebP preferred, with PNG fallback)
- [ ] Add `loading="lazy"` to below-fold images (most already have this)
- [ ] Test Lighthouse score (target: 90+ on Performance, Accessibility, Best Practices)

---

## 8. Legal

- [ ] Privacy Policy (`privacy.html`) — reviewed by legal, reflects actual data practices
- [ ] Terms & Conditions (`terms.html`) — reviewed by legal
- [ ] Cookie policy aligned with analytics setup
- [ ] GDPR/data handling compliance if serving outside India

---

## 9. Pre-Launch Testing

- [ ] All pages load at 1400px, 1100px, 768px, 480px, 375px
- [ ] Keyboard navigation works (tab through all interactive elements)
- [ ] Form validation works (inline errors, required fields)
- [ ] Form submission works end-to-end (with Airtable connected)
- [ ] WhatsApp links open correct chat with pre-filled message
- [ ] All internal links resolve (no 404s)
- [ ] All external links open in new tab
- [ ] Images load (no broken images)
- [ ] Console clean (no errors or warnings)
- [ ] Test in Safari, Chrome, Firefox, Edge
- [ ] Test on actual iPhone and Android device

---

## 10. Launch Day

- [ ] Point custom domain DNS to Vercel
- [ ] Verify HTTPS works on custom domain
- [ ] Submit sitemap.xml to Google Search Console
- [ ] Test all forms one more time on production URL
- [ ] Monitor Vercel deployment logs for errors
- [ ] Share production URL with stakeholders

---

## Quick Reference: File Locations

| What to change | Where |
|----------------|-------|
| WhatsApp number | 6 HTML files (see §1a) |
| Social links | `footer.html:42–56` |
| Contact email/phone | `footer.html:25,30` |
| Analytics snippet | `header.html` (add before `</head>`) |
| Airtable credentials | Vercel dashboard → Environment Variables |
| Mock data toggle | `hamper/hamper.js` → `USE_MOCK_DATA` |
| Images | `/image/` directory |
