# Architecture Decision Records

Decisions made during implementation with rationale.

**Audience:** Developers

---

## Decision Index

| ID | Decision | Category | Date |
|----|----------|----------|------|
| AD1 | Use Cloudflare Image Resizing instead of Worker-side processing | Architecture | 2026-04-02 |
| AD2 | Magic Link auth via Resend instead of Google OAuth | Security | 2026-04-02 |
| AD3 | CSS-first animations, GSAP optional for max 1 signature moment | UI/Frontend | 2026-04-02 |
| AD4 | No PWA — unnecessary complexity for this scale | Architecture | 2026-04-02 |
| AD5 | Structured fields over rich text for most CMS content types | UI/Frontend | 2026-04-02 |
| AD6 | Inquiry lifecycle via email-first, D1 as backup log | Architecture | 2026-04-02 |

---

### AD1: Use Cloudflare Image Resizing instead of Worker-side processing

**Decision:** Serve image variants via Cloudflare Image Resizing (`/cdn-cgi/image/`) instead of processing uploads in the Worker.

Workers have 128MB memory and strict CPU limits. Decoding 15MB HEIC files, generating AVIF/WebP variants, and computing blurhash in-Worker would cause OOM and timeout. Image Resizing runs on Cloudflare's edge infrastructure with no such limits, supports HEIC natively, and caches transformed images at the edge.

### AD2: Magic Link auth via Resend instead of Google OAuth

**Decision:** Use email-based Magic Link authentication (6-digit code via Resend) instead of Google OAuth.

Setting up GCP projects, consent screens, and maintaining OAuth credentials for exactly one user is overkill. Magic Link requires no external account setup, works on any phone, and uses the Resend infrastructure already needed for inquiry emails. Recovery path: developer adds new email via Wrangler CLI.

### AD3: CSS-first animations, GSAP optional

**Decision:** Use CSS transitions + IntersectionObserver for all standard animations. GSAP only if one specific signature moment truly needs it and adds <20KB to bundle.

For a 2-3 apartment site, GSAP's 30KB+ adds disproportionate bundle weight. CSS animations cover 95% of the needed effects (fade-up, clip-path reveal, staggered entry). Art direction and photography quality matter more than animation tech.

### AD4: No PWA

**Decision:** Do not implement PWA / Service Worker.

Visitors don't install PWAs for a vacation rental they visit once. Service worker caching adds complexity and edge-case bugs (stale content, cache invalidation). The site is fast enough via Cloudflare edge caching. Offline forms were explicitly unsupported anyway.

### AD5: Structured fields over rich text for most CMS content types

**Decision:** Use structured input fields (dropdowns, checkboxes, text inputs) for FAQ, testimonials, guide entries, amenities. Reserve rich text (Portable Text) only for apartment descriptions and editorial page bodies.

Mobile rich text editing is frustrating on phones. Structured fields are faster, less error-prone, and produce consistent output. The owner manages content from her phone — structured editing beats WYSIWYG elegance for this user profile.

### AD6: Inquiry lifecycle via email-first, D1 as backup log

**Decision:** Owner manages inquiries primarily via email (rich HTML from Resend with one-tap actions). D1 stores inquiries as backup and status tracker, not as a full inbox UI.

Building a custom inbox in the CMS admin is reinventing email. The owner already checks email and WhatsApp on her phone. D1 ensures no inquiry is lost if email fails, and provides the "Confirm + Block Dates" action that email alone can't do.
