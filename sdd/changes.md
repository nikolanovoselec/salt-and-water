# Changelog

## 2026-04-02 — Revision 3: Spec Quality Validation

Full 14-point spec quality audit.

### Failure modes added to P0 requirements
- REQ-AP-5: Added failure modes for availability data fetch failure and stale data (JS disabled)
- REQ-AP-6: Added failure mode for image load errors in gallery/lightbox
- REQ-SF-1: Added failure modes for hero image load error and no hero photos configured
- REQ-SF-7: Added failure mode for when no pricing is available

### Contradictions fixed
- CON-SEC: Rate limit corrected from "5 per IP per hour" to "5 per IP per 10 minutes via WAF" (aligning with REQ-BK-2)
- CON-SEC + CON-MEDIA: EXIF GPS wording corrected from "stripped from uploads" to "not exposed to visitors" (originals in R2 retain EXIF; Image Resizing strips from served derivatives) — aligning with REQ-CMS-2

### Clarifications
- REQ-AP-1: "capacity (max adults)" clarified to "max occupancy (total adults + children)" to align with REQ-BK-6 capacity rule

### Glossary additions
- Added: Astro, GSAP, WCAG (each used across 4-5 domain files)

## 2026-04-02 — Revision 2: LLM Review Feedback

Applied recommendations from Gemini and GPT review of the full spec:

### Architecture changes
- **AD1:** Image processing moved from Worker-side to Cloudflare Image Resizing (Worker memory/CPU limits)
- **AD2:** Switched from Google OAuth to Magic Link auth via Resend (simpler for single user)
- **AD3:** CSS-first animation system, GSAP optional for max 1 signature moment (was: 3 GSAP ScrollTrigger per page)
- **AD4:** Removed PWA (unnecessary complexity for this scale)
- **AD5:** Structured fields preferred over rich text for most content types
- **AD6:** Inquiry lifecycle via email-first, D1 as backup log (was: full admin inbox UI)

### New requirements added
- REQ-BK-4: Click-to-call
- REQ-BK-6: Booking business rules (timezone, min stay, capacity, cross-season pricing, availability revalidation)
- REQ-BK-7: Inquiry lifecycle (statuses, confirm+block dates, conflict warnings)
- REQ-CMS-7: Content safeguards (field validation, locale completion, duplicate-from-Croatian, slug redirects, autosave, placeholder warnings)
- REQ-CMS-8: Branded error pages (404/500)
- REQ-TC-4: House rules & booking terms
- REQ-TC-5: GDPR consent checkbox on forms
- REQ-TC-7: Accessibility statement
- REQ-SEO-5: Keyword strategy per locale
- REQ-SEO-6: Local SEO (GBP, NAP, geocoordinates)
- REQ-SEO-7: URL policy & indexation controls (no www, no trailing slashes, noindex rules)
- REQ-SEO-8: Content freshness reminders

### Significantly updated requirements
- REQ-BK-1: Added "Quick Question" tab, children/pets fields, min stay enforcement, cross-season pricing breakdown, GDPR checkbox, stale availability handling, non-binding disclaimer
- REQ-BK-2: Added timezone, server-side availability revalidation, honeypot, input sanitization, retry logic, CGNAT-aware rate limiting, inquiry-not-booking disclaimer
- REQ-AP-1: Expanded with German-precision fields (beach type, AC scope, parking type, stairs, kitchen/bathroom equipment, mattress sizes, WiFi, distances, house rules, "Best for" labels, value proposition)
- REQ-AP-3: Restructured with explicit visual hierarchy, trust info near CTA, contextual objection handling
- REQ-AP-4: Added cleaning fee, tourist tax details, PAngV compliance, German total-price display
- REQ-CMS-2: Switched to Cloudflare Image Resizing, added EXIF GPS stripping, crop preview, resolution warnings, aspect ratio warnings
- REQ-CMS-3: Changed from Google OAuth to Magic Link auth (renamed)
- REQ-CMS-4: Reorganized as task-based dashboard, structured editing emphasis, locale completion indicators, destructive action confirmations
- REQ-CMS-5: Split into toggleable (optional) vs always-visible (core) sections, added dependency warnings
- REQ-CMS-6: Added placeholder marking system, content checklist dashboard
- REQ-TC-1: Simplified cookie consent (no optional cookies at launch = no banner needed)
- REQ-TC-2: Expanded privacy policy with legal basis, retention periods, processor list, WhatsApp note
- REQ-TC-3: Impressum always available in German even if DE locale disabled
- REQ-VD-3: CSS-first, no parallax, GSAP optional (<20KB gate), art direction rules
- REQ-VD-6: Restricted masks to editorial photos, standard aspect ratios for apartment galleries
- REQ-SP-1: Added contextual placement near inquiry, manual "most loved for" tags, source attribution, structured fields

### Resolved contradictions
- i18n fallback policy: 404 for disabled locales / unpublished pages, Croatian fallback for partial missing content within published active-locale pages

### Documentation structure defined
- `documentation/` folder with architecture, config, deployment, CMS guide, content guide, security, SEO, troubleshooting, ADRs
- 6 initial Architecture Decision Records

## 2026-04-02 — Initial Specification

- Created full product specification with 12 domains
- Defined 7 design principles
- Established 9 constraints
- Documented 45+ requirements across all domains
- Key decisions: Astro 6 + Emdash CMS on Cloudflare Workers, photo-first design, 4 locales (owner-activated), mobile-first CMS, section toggles, preloaded content, request-to-book, Turnstile + Resend
