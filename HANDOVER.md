# HANDOVER – Final Choice maid landing pages

Status at handover (2026-11-23): **built and fully tested locally; NOT yet published.** Everything below tells you how to continue from your normal laptop.

## What exists
- Izzaty: `/sales-1/` – WhatsApp +60 14-331 3112 (`60143313112`), campaign `maid-lp-sales1`
- Bella: `/sales-2/` – WhatsApp +60 11-1856 8998 (`601118568998`), campaign `maid-lp-sales2`
- Target URLs: https://yukisph88.github.io/final-choice-maid-landing-pages/sales-1/ and `/sales-2/`
- Both pages come from one template (`build.mjs`); only name, number and campaign ID differ. Bahasa Melayu default, English switch. No prices, no ages, real maid names, codes hidden.

## Get the project on your laptop
Option A (this folder is in OneDrive: `Desktop\APFC Sales System\final-choice-maid-landing-pages`): it should sync automatically, including the gitignored `private/` folder.
Option B (after it is on GitHub): `git clone https://github.com/yukisph88/final-choice-maid-landing-pages.git`. The clone does NOT contain `private/` (by design); copy it from the office PC/OneDrive if you need the pending candidate.
Requirements: Node.js 22+. For tests also `cd tools && npm install` and Google Chrome. See `CLAUDE.md` for all commands.

## Publishing to GitHub Pages (steps still to do)
GitHub access was not available on the PC where this was built (no GitHub login, no `gh`), so the repository has **not** been created or pushed yet.
1. On github.com (account yukisph88) create a **new, empty, public** repository named `final-choice-maid-landing-pages` (no README/licence/gitignore). Public is required for Pages on a free account.
2. In this folder run:
   ```
   git remote add origin https://github.com/yukisph88/final-choice-maid-landing-pages.git
   git push -u origin main
   ```
   (Git Credential Manager will open a browser to sign in.)
3. Repository Settings → Pages → Build and deployment → Source: **GitHub Actions**.
4. Actions tab → "Deploy landing pages" → Run workflow (it also runs on every push to `main`). It runs `node build.mjs --release`.
5. Open both URLs, click through the WhatsApp buttons, switch language, check mobile. Run `node scripts/verify.mjs` against the live site by adapting `base` if needed.

## Release blockers and what each needs
| Item | State | To resolve |
|---|---|---|
| Candidate with unconfirmed consent | Kept OUT of the repo and public build (details in `private/maids.pending.json`) | Record written consent for name + photo, then move her entry to `content/maids.json` with `consent.verified: true` and her photo to `assets/maids/`; rebuild, test, push |
| Full-name permission of the 7 featured maids | Consent and approved display names are recorded; same names are already public on the Maid website; no separate full-name field | Management confirms; if first-name-only, edit `name` in `content/maids.json` |
| "15+ years" claim | Not confirmed (published statements only). Public pages use a non-numeric statement | Management verifies against company records, then set `experience.confirmed: true` in `content/company.json` (shows "15+") |
| Logo phone number | The official logo mascot shows 011-1852 3311 (not the consultants' numbers). No approved number-free logo was identified | Provide an approved number-free logo; replace files in `assets/img/` (`logo-160.webp`, `logo-320.webp`, keep sizes) |
| Search indexing | Pages are `noindex`; robots.txt disallows all | Management approval, then remove the noindex meta and robots Disallow in `build.mjs` |

Release checks are real gates: never edit the build to skip them, and never set `confirmed`/`verified` to true without written evidence.

## Everyday maintenance
- Change a number: edit `configs/sales-1.json` / `sales-2.json` (digits `60…`, `phoneDisplay`), rebuild, run `node scripts/verify.mjs`, push.
- Change shared content: `content/*.json`, `src/messages.mjs`, text in `build.mjs`, styles `src/styles.css`. Both pages regenerate together.
- Replace a maid: add the approved photo (480×600 webp, named after her name slug) to `assets/maids/` and her entry to `content/maids.json` (only with consent + approved data; no passport/IC data ever).
- Service photos (childcare / elderly care / household): drop `assets/img/service-childcare.webp`, `service-elderly.webp`, `service-household.webp` (640×360) to replace the icon panels.
- Analytics/ad pixels: disabled; only add with management approval.

## Tests and documents
`docs/test-results.md` (results), `docs/qa-report-release-*.txt` (full logs), `docs/consent-and-release-status.md`, `docs/experience-claim-sources.md`.

## Do not touch
The Maid website repo (`yukisph88/final-choice-maid-agency`), the Foreign Worker site, the combined APFC site and the APFC dashboard. This project only reads photos/data copied from them.
