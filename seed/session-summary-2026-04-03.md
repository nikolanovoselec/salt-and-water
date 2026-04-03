# Session Summary — 2026-04-03 (Apartmani Novoselec)

## What Was Done

### Infrastructure
- Custom domain `apartmani.novoselec.ch` configured and working
- Cloudflare Access auth for Emdash admin (replaces broken magic link)
- `import { env } from "cloudflare:workers"` migration (Astro v6 pattern)
- CSP fix: `unsafe-inline` for scripts, `connect-src` for Turnstile
- `workers_dev: true` to keep workers.dev URL alongside custom domain

### Emdash CMS
- D1 database wiped and rebuilt (migration conflicts resolved)
- Emdash initialized: setup complete, admin user created
- 118+ CMS entries seeded across 7 collections:
  - apartments: 8 (4 locales x 2)
  - testimonials: 12 (4 locales x 3)
  - faqs: 40 (4 locales x 10, including 5 new insider FAQs)
  - guide: 16 (4 locales x 4)
  - editorial: 32+ (homepage, about, privacy, impressum, villages, Kornati, Zadar, tips)
- All pages query CMS with hardcoded fallback
- Content helper: locale matching via entry locale + slug suffix

### Pages Created
- Contact form (`/kontakt`) with Turnstile + honeypot + GDPR + date pickers
- Gallery (`/galerija`) with masonry grid
- Village (`/zdrelac`) — encyclopedic: 14 topics from CMS
- Food (`/hrana`) — real restaurant names + ratings (Mureta 4.8, San Marko 4.9, Kiss cash-only)
- Activities (`/aktivnosti`) — hiking, cycling, Kornati, Telašćica, water sports
- Beaches (`/plaze`) — named beaches with surface types and facilities
- Apartment detail (`/apartmani/[slug]`) from CMS

### Design
- Hero carousel: 4 images, crossfade, continuous Ken Burns zoom, auto-advance
- Wave dividers: WaveDivider component with bg/fill props for seamless transitions
- Wave at bottom of every page hero (HeroSimple + page-hero + village-hero)
- Sunset animated gradient on CTA section
- Organic image styling (asymmetric border-radius + shadows)
- Hero images on ALL 12 subpages (no more dark blue gradient)
- Hamburger menu fixed (CSP was blocking inline scripts)
- DM Serif Display font swap
- Premium CSS effects (breathing cards, caustics, shimmer)

### Content
- 513-line encyclopedic research (`seed/content-encyclopedia.md`)
- All villages on both islands with real facts and sources
- Real restaurant ratings from TripAdvisor/Restaurant Guru
- Real beach names with surface types
- Historical facts (monasteries, fortresses, churches) with dates
- Ždrelac: 397 pop, 210m bridge, Church of St. Luke 13th c.
- Ćokovac Monastery: 12th c., only active Benedictine in Croatia
- St. Michael's Fortress: 265m, 200+ island views
- Ferry Zadar-Preko: 20-25 min, €2.52-3.45, up to 29 daily
- Kornati day trips from €31

### Spec & Documentation
- 39 spec revisions
- 84 requirements across 12 domains
- 8 documentation files maintained
- 260-line missed requirements audit (`seed/missed-requirements.md`)

---

## OPEN POINTS (Not Yet Done)

### CRITICAL
1. **All content pages still have hardcoded fallback content** — hrana, aktivnosti, plaze have CMS queries but content is only partially seeded into Emdash for those page_keys
2. **DE and SL locale content** — only HR and EN seeded for most collections. German and Slovenian use fallback to Croatian
3. **Apartment detail pages may still fail** — depends on Emdash entry-level locale matching

### HIGH
4. **Emdash email not working** — Resend plugin can't work with Vite. CF Access handles auth, but inquiry confirmation emails and guest auto-replies need the API to work (env.RESEND_API_KEY). VERIFY the inquiry API actually sends emails
5. **Contact form end-to-end test** — Turnstile renders but never tested with real submission
6. **Section visibility toggles** — user wants mom to enable/disable sections from CMS. Not implemented
7. **Apartment photo carousel** — PhotoGallery component exists but lightbox JS not implemented
8. **Duplicate stock photos** — same Pexels images reused across multiple pages/sections

### MEDIUM
9. **MDI icons** — user requested, @mdi/js installed but never used
10. **Calendar date picker** — using native type=date, user wanted a proper calendar widget
11. **Hero bottom fade** — reduced from 0.8 to 0.5 but user may still want it lighter
12. **Missing documentation files** — cms-guide.md, content-guide.md, troubleshooting.md referenced in README but don't exist
13. **Organic images not applied everywhere** — editorial page images have organic styling but not all pages
14. **Panoramic video from YouTube** — user mentioned, never done
15. **Wave color mismatches** — improved with bg prop but user still reported issues
16. **hreflang tags in HTML** — only in sitemap, not in page heads

### LOW
17. **WhatsApp button never renders** — component exists but whatsappNumber prop never passed
18. **Sticky mobile CTA has no price** — lowestPrice prop never passed
19. **PricingTable component exists but unused** on apartment detail pages
20. **Breadcrumbs component exists but unused**
21. **404 page not localized** — shows English text regardless of URL locale
22. **SchemaOrg VacationRental not applied** to apartment pages

---

## Key Technical Decisions
- `@emdash-cms/cloudflare` declares `env: Record<string, unknown>` — prevents all type augmentation. Solution: explicit cast `env as unknown as Env` in every API route
- Emdash plugins are bundled at build time by Vite — `cloudflare:workers` imports fail. Cannot make a Resend email plugin for Emdash
- CF Access is the auth solution for Emdash admin (team domain: m4f1j0z0.cloudflareaccess.com)
- Content helper (`src/lib/content.ts`) matches locale by: entry-level locale, data.locale field, OR slug suffix convention (-hr, -de, etc.)
- All editorial content goes into the `editorial` collection with `page_key` and `section_key` fields

## SDD Workflow
- Spec-driven development: all changes captured in sdd/ first
- 3-agent review after every push: code-reviewer, doc-updater, spec-reviewer
- Documentation in documentation/ folder
- ADRs in documentation/decisions/
