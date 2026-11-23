# Test results (2026-11-23)

Automated by `scripts/verify.mjs` (headless Chrome via puppeteer-core), `tools/lh.mjs` (Lighthouse 13) and the build guards in `build.mjs`.

| Run | What was tested | Result |
|---|---|---|
| Release build, served at `/` | `docs/qa-report-release-root.txt` | 90 pass, 0 fail |
| Release build, served at `/final-choice-maid-landing-pages/` (GitHub Pages subdirectory simulation) | `docs/qa-report-release-github-pages-path.txt` | 90 pass, 0 fail |

Covered in every run, for sales-1 (Izzaty) and sales-2 (Bella), in Bahasa Melayu and English:
- All 28 WhatsApp links per page point only to that consultant's own number (`https://wa.me/60143313112` / `https://wa.me/601118568998`); no link points to the other number or to the previous incorrect number `601433131112`.
- Click-to-call links, footer contact line, "WhatsApp <name>" buttons, "Hi <name>," pre-filled messages, UTM source in the message reference.
- Language switch (headline, no untranslated Malay in English mode), same-page anchors, package tabs, FAQ expansion.
- Displayed maid names match the biodata file names; no maid reference codes visible on any card (text, alt text, image file names); every package card shows "Contact Us for Package Details" and no RM amounts exist anywhere in the page source.
- The experience statement is non-numeric (public build); the featured candidate without consent is absent (name, photo, code).
- All images load, no failed requests, no console errors, no horizontal overflow at 390 px, `noindex` present.
- `dist/` contains no PDFs, office files, videos or `.env`, and no passport/ID-number or API-key patterns.
- The two pages are identical after masking the number, display phone, campaign ID, consultant name and page ID.

Lighthouse (release build, warm run): accessibility 100, best practices 100 on both pages; performance 100 desktop and 94 mobile; SEO 66 only because the page is intentionally `noindex`. The first Lighthouse run after a cold start can score lower on mobile (about 72) because of CPU warm-up; the same page scores 94 when warm.

Not tested: the live GitHub Pages URLs (not yet deployed), real-phone devices, actual WhatsApp delivery (links verified by URL only).
