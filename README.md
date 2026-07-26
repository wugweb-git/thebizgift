# The Biz Gift

Premium B2B corporate gifting platform for the Indian market. Curated hampers designed to help companies thank their people and partners with thoughtful, memorable experiences.

**Live:** https://thebizgift.vercel.app

## Tech Stack

- HTML5 / CSS3 / Vanilla JavaScript
- Airtable (CMS — Phase 2)
- Vercel (hosting + serverless)

## Quick Start

```bash
git clone <repo-url>
cd thebizgift
python3 -m http.server 4321
```

Open http://localhost:4321. Product pages use mock data locally; forms simulate success.

## Project Structure

```
/
├── docs/
│   ├── README.md                    ← Project overview & migration checklist
│   ├── master-brand-document.md     ← WHY — strategy, voice, values
│   ├── design.md                    ← HOW IT FEELS — canonical design system
│   ├── content-architecture.md      ← WHAT CONTENT — CMS, IA, Airtable
│   ├── build.md                     ← HOW IT'S BUILT — engineering reference
│   ├── decision-log.md              ← Settled architectural decisions
│   │
│   ├── tokens/
│   │   ├── colors.json
│   │   ├── typography.json
│   │   ├── spacing.json
│   │   ├── radius.json
│   │   ├── motion.json
│   │   ├── elevation.json
│   │   └── zindex.json
│   │
│   └── assets/
│       ├── moodboard/
│       ├── references/
│       └── photography/
│
│   ← Site files live at the repo root (served directly by Vercel) →
├── vercel.json                      ← Headers + caching (no rootDirectory)
├── .vercelignore                    ← Excludes docs/ + dev files from deploy
├── index.html
├── about.html
├── customisation.html
├── quote.html
├── privacy.html
├── terms.html
├── sitemap.html
├── style.css
├── pages.css
├── components.js
├── header.html
├── footer.html
├── image/
├── api/                             ← Serverless functions → /api/*
│   ├── get-featured-hampers.js
│   ├── get-hamper.js
│   └── submit-lead.js
├── explore/
│   ├── index.html
│   └── explore.html
├── hamper/
│   ├── template.html
│   ├── hamper.css
│   └── hamper.js
│
├── CLAUDE.md
├── CLAUDE.local.md
└── README.md                        ← This file
```

## Deployment

Deployed to Vercel from the **repo root** — no Root Directory setting needed, so it imports and deploys on any Vercel account with zero config. See [docs/README.md](docs/README.md) for full deployment and client migration instructions.

## Documentation

| Document | Purpose |
|----------|---------|
| [Brand Strategy](docs/master-brand-document.md) | Mission, values, voice, positioning, messaging pillars |
| [Design System](docs/design.md) | 26-section canonical design reference: tokens, components, blocks, interactions, constraints |
| [Content Architecture](docs/content-architecture.md) | Taxonomy, Airtable content model, IA, governance, copy inventory |
| [Engineering Reference](docs/build.md) | Code standards, architecture, deployment, build order |
| [Decision Log](docs/decision-log.md) | 10 settled architectural decisions |
