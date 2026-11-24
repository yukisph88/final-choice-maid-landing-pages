# HANDOVER – Final Choice maid landing pages

Status (updated 2026-11-24): **LIVE on GitHub Pages (noindex).** Both pages return HTTP 200; the latest deploy ("Deploy landing pages" workflow) succeeded for commit `431f85b` on 2026-11-23 and `main` has nothing unpushed. The development folder is now `C:\Users\user\Desktop\APFC Maid Landing Pages` (normal laptop, not inside OneDrive). Local build and full QA (`PAGES_PATH=1 node scripts/verify.mjs`) re-verified on 2026-11-24: 0 failures.

## What exists
- Izzaty: `/sales-1/` – WhatsApp +60 14-331 3112 (`60143313112`), campaign `maid-lp-sales1`
- Bella: `/sales-2/` – WhatsApp +60 11-1856 8998 (`601118568998`), campaign `maid-lp-sales2`
- Target URLs: https://yukisph88.github.io/final-choice-maid-landing-pages/sales-1/ and `/sales-2/`
- Both pages come from one template (`build.mjs`); only name, number and campaign ID differ. Bahasa Melayu default, English switch. No prices, no ages, real maid names, codes hidden.

## Local setup (this laptop)
- Project folder: `C:\Users\user\Desktop\APFC Maid Landing Pages` (a clone of `https://github.com/yukisph88/final-choice-maid-landing-pages`, branch `main`).
- The clone does NOT contain the gitignored `private/` folder (pending candidate data, review screenshots in `private/evidence/`). Copy it from the office PC/OneDrive only if needed. Without it, `--with-pending` previews have no pending candidate.
- Installed and verified: Node v24, `cd tools && npm install` done (118 packages, 0 vulnerabilities), Google Chrome at `C:\Program Files (x86)\Google\Chrome\Application\chrome.exe` (path used by `scripts/verify.mjs`; override with `CHROME_PATH`).
- Re-verified 2026-11-24: `node build.mjs` and `node build.mjs --release` succeed (7 maids, 5 review cards, 3 service photos); `PAGES_PATH=1 node scripts/verify.mjs` = 0 failures. `verify.mjs` writes an untracked `docs/qa-report.txt`; delete it or leave it untracked.

## Publishing status (live)
- Repository: `yukisph88/final-choice-maid-landing-pages` (public). Pages source: GitHub Actions.
- Live URLs (HTTP 200 on 2026-11-24): https://yukisph88.github.io/final-choice-maid-landing-pages/sales-1/ and `/sales-2/`. Both are `noindex`.
- Deployment: workflow "Deploy landing pages" runs `node build.mjs --release` on every push to `main` (and manually). Last 5 runs, all successful, latest `431f85b` (2026-11-23 09:35 UTC). **Pushing to `main` therefore deploys to the public site: get the owner's approval first.**
- After any change that goes live: open both URLs, click through the WhatsApp buttons, switch language, check mobile.

## Release blockers and what each needs
| Item | State | To resolve |
|---|---|---|
| Candidate with unconfirmed consent | Management approval recorded (2026-11-23, chat confirmation), but the candidate's own consent is not on file. Kept OUT of the repo and public build (details in `private/maids.pending.json`; local preview only) | Obtain her signed publication consent + photo consent + agreed name level (see `docs/consent-and-release-status.md`), then move her entry to `content/maids.json` with `consent.verified: true` and her photo to `assets/maids/`; rebuild, test, push |
| Full-name permission of the 7 featured maids | Consent and approved display names are recorded; same names are already public on the Maid website; no separate full-name field | Management confirms; if first-name-only, edit `name` in `content/maids.json` |
| "15+ years" claim | Not confirmed (published statements only). Public pages use a non-numeric statement | Management verifies against company records, then set `experience.confirmed: true` in `content/company.json` (shows "15+") |
| Logo phone number | The official logo mascot shows 011-1852 3311 (not the consultants' numbers). No approved number-free logo was identified | Provide an approved number-free logo; replace files in `assets/img/` (`logo-160.webp`, `logo-320.webp`, keep sizes) |
| Google reviews section | LIVE with 5 owner-supplied reviews (4.8 / 5.0, 109 reviews, snapshot 2026-11-23) and a See More Reviews button. Reviewers' individual written permission was NOT obtained (APFC testimonial rule); Ahmad Asnawie's card is an excerpt | Ask the five reviewers for permission and record it (see `docs/google-reviews-evidence.md`); remove a card the same day on objection; refresh the snapshot before each release (`rating` in `content/reviews.json`) |
| Service photos (all three cards) | LIVE with real company photos approved by management (chat confirmation, 2026-11-23). Individual consents NOT documented: the child (guardian) in the childcare photo, the two elderly women (and the care centre) in the elderly-care photo, and the maids shown | File written consents; remove a photo the same day on objection (delete `assets/img/service-<key>-*.webp`, release build, push). See `docs/service-photos-status.md` |
| Religion label on maid cards (staff feedback, 2026-11-24) | Design approved by the owner (chat, 2026-11-24). **LIVE for all 7 featured maids** (6 on 2026-11-24, the last one later the same day by owner instruction, shown exactly as recorded in her biodata) after the owner confirmed in chat that APFC obtained permission from all 7 maids. Individual signed forms, dates and initials were not provided to the developer; the consent record is private (`private/religion-consent-checklist.md`, `private/maids.religion.json`, gitignored). Public staff template: `docs/religion-consent-checklist.md` (no religion values). Labels: Muslim / Christian (BM Kristian) or the recorded religion; data and `religionConsent` in `content/maids.json` | (1) Staff file the individual written consents (including agreement to the exact wording shown) and fill the private checklist. (2) On any withdrawal remove that maid's `religion` field, release build, push the same day |
| Search indexing | Pages are `noindex`; robots.txt disallows all | Management approval, then remove the noindex meta and robots Disallow in `build.mjs` |

Release checks are real gates: never edit the build to skip them, and never set `confirmed`/`verified` to true without written evidence.

## Everyday maintenance
- Change a number: edit `configs/sales-1.json` / `sales-2.json` (digits `60…`, `phoneDisplay`), rebuild, run `node scripts/verify.mjs`, push.
- Change shared content: `content/*.json`, `src/messages.mjs`, text in `build.mjs`, styles `src/styles.css`. Both pages regenerate together.
- Replace a maid: add the approved photo (480×600 webp, named after her name slug) to `assets/maids/` and her entry to `content/maids.json` (only with consent + approved data; no passport/IC data ever).
- Service photos (4:3, WebP, two sizes per card): `assets/img/service-<childcare|elderly|household>-800.webp` (800×600) and `-480.webp` (480×360). A card without photos shows the icon panel. See `docs/service-photos-status.md`.
- Analytics/ad pixels: disabled; only add with management approval.

## Tests and documents
`docs/test-results.md` (results), `docs/qa-report-release-*.txt` (full logs), `docs/consent-and-release-status.md`, `docs/experience-claim-sources.md`.

## Do not touch
The Maid website repo (`yukisph88/final-choice-maid-agency`), the Foreign Worker site, the combined APFC site and the APFC dashboard. This project only reads photos/data copied from them.
