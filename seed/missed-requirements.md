# Missed & Incomplete Requirements -- Apartmani Project

Extracted from full conversation transcript (sessions b8312e55, 53c1abd7, fe003cbe).

---

## 1. MDI Icons

- **User quote:** Not found in any apartmani session transcript. The MDI icon reference appears only in the Codeflare project (fe003cbe) context, not apartmani. The user may be confusing projects, or this was communicated outside the transcript.
- **What was requested:** Use MDI icons across the site wherever icons appear.
- **Current status:** NOT DONE. The project has no `@mdi/js` dependency. Icons are either inline SVGs or absent. The `package.json` only has `@mdi/js` reference nowhere.
- **What needs to happen:** If MDI icons are wanted for apartmani, install `@mdi/js`, create an Icon component, and replace all inline SVGs (navigation chevrons, scroll indicator, language switcher arrow, WhatsApp button icon, amenity icons) with MDI equivalents.

---

## 2. Calendar Dropdown for Contact Form Date Selection

- **User quote:** (Mentioned in memory compaction: "Remaining work items (email auth, hero images, calendar dropdown, content seeding)")
- **What was requested:** A calendar-style date picker widget for the contact/booking form instead of plain HTML date inputs.
- **Current status:** NOT DONE. The contact form at `src/pages/[locale]/kontakt.astro` uses plain `<input type="date">` for check-in and check-out fields (lines 63-68). No calendar library or custom calendar component exists.
- **What needs to happen:** Add a visual calendar dropdown component (e.g., flatpickr, a custom date picker, or a CSS-only calendar widget) to the check-in/check-out date inputs. The spec (REQ-BK-1) also lists the booking widget as "Planned" with no client-side form widget built.

---

## 3. Emdash Magic Link Auth via Resend (noreply@graymatter.ch)

- **User quote:** "I cannot log into emdash, i get error 'Email is not configured. Magic link authentication requires an email provider.' when I enter my email."
- **What was requested:** Working Emdash admin login using magic link authentication with Resend sending from noreply@graymatter.ch.
- **Current status:** PARTIAL. The code exists:
  - `src/lib/resend.ts` -- email sending utility (working)
  - `src/pages/admin/api/login.ts` -- magic link login endpoint exists, sends from "Apartmani Novoselec <noreply@graymatter.ch>"
  - `src/pages/admin/api/verify.ts` -- verify endpoint exists
  - BUT: Emdash's own built-in auth panel shows "Email is not configured" because the Emdash CMS integration itself is not wired to use the custom Resend email sender. The custom `/admin/api/login` endpoint is separate from Emdash's `/_emdash/admin/` panel. Emdash needs its auth configured through its own integration options, not just a separate API endpoint.
  - The `RESEND_API_KEY` is set as a Wrangler secret (not hardcoded -- the earlier leaked key issue was flagged and should have been rotated).
- **What needs to happen:** Wire Resend as Emdash's email provider in the emdash integration config (`astro.config.mjs`), or configure Emdash to use the custom auth endpoints. Verify the admin panel actually accepts login. Rotate the previously leaked API key if not already done.

---

## 4. Apartment Photo Carousel on Detail Pages

- **User quote:** "each apartment needs a detailed page with additional pictures rooms kitchens parts of a Terraces whatever the visitors want to see"
- **What was requested:** Apartment detail pages should have a photo gallery/carousel showing multiple images of rooms, kitchens, terraces, etc.
- **Current status:** PARTIAL. The `PhotoGallery.astro` component exists and renders a grid of photos with lightbox data injection. The `[slug].astro` detail page exists and pulls from Emdash CMS. BUT:
  - The lightbox client-side JS is NOT implemented (only the data injection script tag exists, no actual lightbox rendering code)
  - Photos come from CMS `photos_json` field -- if CMS has no content, no photos show
  - No actual apartment photos are seeded in Emdash (stock photos only in seed files)
  - The spec (REQ-AP-6) lists gallery as "Planned" with missing: blurhash rendering, srcset, clip-path animation, lightbox keyboard nav, focus trapping, error handling
- **What needs to happen:** Implement the client-side lightbox/carousel JS, seed actual apartment photos into Emdash, ensure the photo gallery renders on detail pages.

---

## 5. Animations, Transitions, Parallax Effects

- **User quote:** "can we add some animations, transitions, parallax effects, some very smooth animations of zooming in and out just so it looks like the site breeds"
- **User quote:** "too many straight lines, can we use some wavy lines with CSS?"
- **User quote:** "hero carousel pictures should scroll automatically, with a special transition effect"
- **What was requested:** Breathing/organic animations throughout, wavy SVG dividers, parallax effects, smooth zoom in/out, living feel.
- **Current status:** MOSTLY DONE.
  - Hero carousel: crossfade + Ken Burns zoom animation implemented (12s alternating)
  - Wavy SVG dividers: `WaveDivider.astro` component exists, used on some pages
  - Breathing/floating animations: `.animate-breathe`, `.animate-float` CSS classes exist
  - `data-reveal` scroll animations via IntersectionObserver: implemented
  - Ken Burns on subpage heroes via `HeroSimple.astro`: implemented
  - REMAINING ISSUE: User reported "blue waves have a different shade of blue from the component under it" and "component above the wave has a slight gray background which cuts to white without a subtle transition" -- color mismatch between wave dividers and adjacent sections NOT fixed.
- **What needs to happen:** Fix the color transitions between wave dividers and adjacent sections. Ensure consistent background colors where waves meet section backgrounds. The user specifically called out mismatched blues and gray-to-white hard cuts.

---

## 6. All Content Wired to Emdash CMS (NOT Hardcoded)

- **User quote:** "there is no point adding content manually, it will just harder to integrate emdash the more content is hardcoded, are you using your brain?!?!?! integrate emdash, all the content you add needs to be editable there!!!"
- **User quote:** "migrate everything, i dont want anything hardcoded!"
- **User quote:** "wire all content to emdash and populate it in all languages"
- **User quote:** "implement the fucking content, fill it into emdash"
- **What was requested:** ALL site content must come from Emdash CMS, be editable there, and pre-populated in all 4 languages.
- **Current status:** NOT DONE. This is the single biggest gap.
  - Pages with hardcoded content (NOT reading from CMS):
    - `plaze.astro` -- fully hardcoded `Record<Locale>` object, no CMS fetch
    - `aktivnosti.astro` -- fully hardcoded, no CMS fetch
    - `hrana.astro` -- imports `getLocalizedCollection` but all content is hardcoded inline
    - `zdrelac.astro` -- has CMS fetch with hardcoded fallback, CMS content likely empty
    - `vodic.astro` -- likely hardcoded
    - `dolazak.astro` -- likely hardcoded
    - `o-nama.astro` -- likely hardcoded
    - `faq.astro` -- likely hardcoded
    - `kontakt.astro` -- form labels hardcoded
    - Homepage sections -- mostly hardcoded
  - The seed file (`seed/seed.json`) has content entries but:
    - No editorial entries for zdrelac, hrana, plaze, aktivnosti
    - The seed import mechanism is not verified working
    - CMS collections are defined but content is not actually in D1
  - Emdash admin panel itself is not accessible (auth broken, see item 3)
- **What needs to happen:**
  1. Fix Emdash auth so the admin panel works
  2. Migrate ALL hardcoded content from every page into Emdash collections
  3. Seed all content into D1 via the Emdash seed API
  4. Make every page read from CMS with graceful fallbacks
  5. Verify content appears on the live site when edited in Emdash

---

## 7. Apartment Detail Pages Not Opening

- **User quote:** "apartment detail pages do not open, the page just reloads" (repeated 3 times)
- **What was requested:** Clicking an apartment card should open its detail page.
- **Current status:** UNCLEAR/LIKELY BROKEN. The `[slug].astro` dynamic route exists but:
  - It calls `getEmDashEntry("apartments", slug)` which requires CMS data
  - If CMS is empty, `entry` is null and it redirects back to `/apartmani` (line: `if (!entry) return Astro.redirect(...)`)
  - The apartment listing page uses `fallbackApartments` with slugs like `"apartment-iris"` but those don't exist in Emdash
  - So clicking a card links to e.g. `/hr/apartmani/apartment-iris` which finds no CMS entry and redirects back -- the "page just reloads" behavior
- **What needs to happen:** Seed apartment data into Emdash CMS so detail pages have data to render. Or add hardcoded fallback data to the detail page (contradicts user's CMS requirement). The root cause is empty CMS.

---

## 8. Hamburger Menu

- **User quote:** "hamburger menu still doesnt fucking work, after 10 rounds of fixing it!!"
- **What was requested:** Working mobile hamburger menu.
- **Current status:** LIKELY FIXED (finally). The Navigation component now has `is:inline` script with proper click handler, class toggling, escape key support, and body overflow lock. The implementation looks correct in the current codebase. Needs live verification.
- **What needs to happen:** Verify on the deployed site that the hamburger menu opens and closes correctly on mobile.

---

## 9. Language Picker

- **User quote:** "there is no language picker"
- **What was requested:** A visible language/locale switcher in the navigation.
- **Current status:** DONE (component exists). `LanguageSwitcher.astro` component exists with dropdown behavior, JS toggle, and keyboard support. It's slotted into Navigation via `<slot name="language-switcher" />`. The mobile menu also has language links.
- **What needs to happen:** Verify it's actually rendered on pages (check if the slot is populated in the layout). If the Navigation component isn't receiving the LanguageSwitcher as a child, it won't render.

---

## 10. Admin Link in Navigation Menu

- **User quote:** "add 'Admin' to menu of website leading to emdash"
- **What was requested:** An "Admin" link in the website's navigation that leads to the Emdash admin panel.
- **Current status:** NOT DONE. The Navigation component (`Navigation.astro`) has no "Admin" link. No reference to `/_emdash/admin/` exists in the navigation menu items. The spec (REQ-SF-3) documents this as an AC item.
- **What needs to happen:** Add an "Admin" link to the navigation (probably only in desktop nav, or footer) pointing to `/_emdash/admin/`.

---

## 11. Section Toggle in Emdash

- **User quote:** "she should be able to disable sections in emdash that she doesnt want visible on the website"
- **What was requested:** The mother/owner should be able to toggle sections on/off from the Emdash CMS.
- **Current status:** NOT DONE. No section toggle mechanism exists. Pages render hardcoded content regardless of CMS settings. The `site-settings.json` seed has basic site metadata but no section visibility toggles.
- **What needs to happen:** Add a CMS collection or settings field for section visibility. Each page section should check a CMS flag before rendering.

---

## 12. Content Preloaded in All 4 Languages

- **User quote:** "you should fully preload the website with content in all languages and media (pictures / videos). she should have everything completely done and polished, then she can replace picture, edit content etc."
- **What was requested:** Complete, polished content in Croatian, German, Slovenian, and English -- ready for the owner to customize.
- **Current status:** PARTIAL.
  - Seed JSON has content entries in all 4 languages for pages, apartments, FAQs, guide, testimonials
  - BUT the seed has never been successfully imported into Emdash/D1
  - Most pages still use hardcoded content rather than CMS content
  - Editorial pages (hrana, plaze, aktivnosti) have extensive hardcoded 4-language content but it's NOT in the CMS
- **What needs to happen:** Run the seed import to populate D1 with all content, verify all 4 locales render correctly from CMS data.

---

## 13. Documentation Structure Gaps

- **User quote:** "create documentation as defined"
- **What was requested:** Complete documentation per the doc-updater agent structure.
- **Current status:** PARTIAL. Documentation README lists 11 files but 3 are missing from disk:
  - `documentation/cms-guide.md` -- MISSING (referenced in README)
  - `documentation/content-guide.md` -- MISSING (referenced in README)
  - `documentation/troubleshooting.md` -- MISSING (referenced in README)
  - All other docs exist: README.md, architecture.md, api-reference.md, authentication.md, configuration.md, security.md, deployment.md, seo.md, decisions/
- **What needs to happen:** Create the 3 missing documentation files or remove them from README if not needed yet.

---

## 14. Fade-Out on Hero Image Bottom

- **User quote:** "i really dislike the fade-out on the bottom of the hero image"
- **What was requested:** Remove the gradient fade at the bottom of the hero image.
- **Current status:** PARTIAL. The hero overlay uses a radial + linear gradient that darkens toward the bottom: `linear-gradient(180deg, rgba(10,31,51,0.4) 0%, rgba(10,31,51,0.2) 40%, rgba(10,31,51,0.8) 100%)`. The bottom is 80% opacity dark -- this IS a fade-out. The user explicitly said they dislike it.
- **What needs to happen:** Reduce or remove the bottom gradient darkening on the hero overlay. Keep the overlay for text readability but make the bottom transition more subtle.

---

## 15. Panoramic Video from YouTube

- **User quote:** "maybe find a cool panoramic video on youtube we can use?"
- **What was requested:** Incorporate a panoramic video of Pasman/Adriatic, potentially from YouTube.
- **Current status:** NOT DONE. No video element exists anywhere on the site.
- **What needs to happen:** Find an appropriate CC-licensed or embeddable panoramic video of the Adriatic/Pasman area and embed it on an appropriate page (hero, about, or zdrelac).

---

## 16. Real Stock Photography (Not Repeated)

- **User quote:** "professional high end agency look and feel"
- **Review finding:** "pexels-photo-1285625 is used 8 times in aktivnosti and 13 times in plaze"
- **What was requested:** Diverse, high-quality stock photos throughout the site.
- **Current status:** PARTIAL. Photos exist but are heavily reused. The same Pexels images appear across multiple sections and pages. Some sections on the same page show identical photos.
- **What needs to happen:** Replace duplicate stock photos with unique images for each section. Use distinct photos for food sections, beach sections, activity sections, etc.

---

## 17. Sitemap Missing New Pages

- **Review finding:** `/galerija`, `/zdrelac`, `/hrana`, `/aktivnosti`, `/plaze` not in sitemap.xml.ts
- **Current status:** NOT DONE. The sitemap `pages` array does not include these editorial/guide pages.
- **What needs to happen:** Add all public pages to the sitemap generator at `src/pages/sitemap.xml.ts`.

---

## 18. Emdash Not Initialized / Security Settings Error

- **User quote:** "emdash not completely configured --> 'Security Settings EmDash is not initialized'"
- **Current status:** NOT DONE. The Emdash CMS panel at `/_emdash/admin/` shows an initialization error. The integration is configured in `astro.config.mjs` with D1 and R2 bindings, but the initial setup/migration has not been completed.
- **What needs to happen:** Run Emdash initialization (D1 schema migration for Emdash tables), configure auth provider, verify the admin panel loads and functions.

---

## 19. Images Should Not Be Edge-to-Edge (Organic Styling)

- **User quote:** "for other images can we not have them edge to edge, with some mask giving them a nice effect maybe a little bit curved with a little bit of a padding"
- **Current status:** PARTIAL. CSS classes `.img-organic`, `.img-blob`, `.img-padded` exist for organic image treatments. But not all images across the site use these classes. Many editorial page images are still edge-to-edge with no mask/curve treatment.
- **What needs to happen:** Apply organic image styling (curves, padding, masks) consistently across all non-hero images, especially on editorial pages (hrana, plaze, aktivnosti, zdrelac).

---

## 20. Color Transition Issues Between Sections

- **User quote:** "blue waves have a different shade of blue from the component under it, with lighter blue background. component above the wave has a slight gray background which cuts to white without a subtle transition when transitioning into the waves."
- **Current status:** NOT DONE. User reported this as the last message -- it was never addressed.
- **What needs to happen:** Audit all wave dividers and ensure the SVG fill color exactly matches the adjacent section's background color. Add smooth gradient transitions where sections change background color.

---

## Summary Priority Matrix

| # | Requirement | Impact | Status |
|---|-------------|--------|--------|
| 6 | All content via Emdash CMS | CRITICAL | Not done |
| 3 | Emdash auth working | CRITICAL | Broken |
| 18 | Emdash initialization | CRITICAL | Not done |
| 7 | Apartment detail pages | HIGH | Broken (empty CMS) |
| 12 | Content preloaded in 4 languages | HIGH | Partial |
| 11 | Section toggle in CMS | HIGH | Not done |
| 10 | Admin link in navigation | MEDIUM | Not done |
| 2 | Calendar date picker | MEDIUM | Not done |
| 4 | Photo gallery/lightbox on detail pages | MEDIUM | Partial |
| 14 | Hero fade-out removal | MEDIUM | Not done |
| 20 | Section color transitions | MEDIUM | Not done |
| 5 | Animations/transitions polish | MEDIUM | Mostly done |
| 16 | Unique stock photos | MEDIUM | Partial |
| 19 | Organic image styling | MEDIUM | Partial |
| 13 | Missing documentation files | LOW | Partial |
| 17 | Sitemap missing pages | LOW | Not done |
| 15 | Panoramic video | LOW | Not done |
| 9 | Language picker | LOW | Done (needs verification) |
| 8 | Hamburger menu | LOW | Likely fixed (needs verification) |
| 1 | MDI icons | LOW | Not found in apartmani transcript |
