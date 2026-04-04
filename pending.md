# Pending Items — Apartmani Novoselec

Last updated: 2026-04-04 (session 3)

## Spec: Partial Requirements (4)

- **REQ-AP-3** (Apartment Detail): ScrollCollage replaces gallery. Missing: breadcrumb polish on all pages
- **REQ-PERF-1** (Image Pipeline): R2 serving works via /api/img/uuid. Missing: Cloudflare Image Resizing not enabled, no responsive srcset, no blurhash placeholders
- **REQ-SEO-1** (Schema.org): LodgingBusiness on homepage, VacationRental on apartments, FAQPage on FAQ. Missing: BreadcrumbList on all subpages, Article schema on editorial pages
- **REQ-SEO-2** (Open Graph): og:image on 10 pages. Missing: per-apartment OG image via Image Resizing at 1200x630

## Spec: Planned Requirements (18) — P3 polish, not launch-blocking

- REQ-A11Y-2: Keyboard Navigation
- REQ-A11Y-3: Screen Reader Support
- REQ-A11Y-4: Color & Contrast
- REQ-ED-3: "A Day on Pašman" Section
- REQ-I18N-2: Language Activation Settings
- REQ-I18N-4: CMS Content Localization (DE/SL content thin in some pages)
- REQ-I18N-6: Cultural Content Adaptation
- REQ-PERF-2: Edge Caching
- REQ-PERF-3: Bundle Budget
- REQ-SEO-5: Keyword Strategy
- REQ-SEO-6: Local SEO (Google Business Profile)
- REQ-SEO-7: URL Policy & Indexation Controls
- REQ-SEO-8: Content Freshness
- REQ-SF-2: Optional Ambient Video Hero
- REQ-SP-2: Trust Strip (badges/icons)
- REQ-TC-4: House Rules & Booking Terms
- REQ-VD-13: Icon System
- REQ-VD-5: Section Color Progression

## User Requests (not yet executed)

### Content
- [ ] Food page DE/SL translations may still have old content with ratings
- [ ] DE/SL/EN translations on editorial pages are LLM-generated, may need native review

### Visual / CSS
- [ ] User mentioned "many small visual feedback" — awaiting specific items
- [ ] Footer: user may have feedback
- [ ] Video hero: user will upload 6-8s clips for homepage hero carousel

### Technical
- [ ] CF Web Analytics: enable in Cloudflare dashboard (no code change, just toggle)
- [ ] Verify Turnstile works on contact form
- [ ] Verify Resend email delivery
- [ ] Verify Emdash admin media upload widget works with hybrid storage adapter

## Architecture Debt

- [ ] Gallery page has hardcoded photo list (not from CMS)
- [ ] Some homepage sections (why-pasman title, apartments title) have hardcoded locale fallbacks
- [ ] Homepage CMS sections only seeded for HR + EN (DE/SL missing, uses HR fallback)

## Completed This Session

- 98 real photos uploaded to R2 (all from Uploads, all HEIC converted, all optimized)
- All Pexels stock URLs eliminated from CMS (zero remain)
- Apartment galleries updated (Nikola 11 photos, Marko 7 photos)
- Gallery page expanded to 18 photos (old + new combined)
- Hero carousel updated with 4 new scenic photos
- Food page updated with real food photos
- Zadar guide section created in 4 locales
- All image keys standardized to UUID format
- R2 S3 API token created, secrets set
- Hybrid R2 storage adapter (downloads via binding, uploads via S3 API)
- All hardcoded values moved to wrangler.jsonc vars
- seed.json and seed endpoint deleted (live D1 is source of truth)
- content.ts uses Emdash native locale filter (not manual pagination)
- Local Guide: title on image, description below card
- Ždrelac hero equalized to match other pages (360px)
- Homepage collage entries created for all 4 locales
- Homepage alt text in Croatian
- SDD spec revision 68, all docs updated
