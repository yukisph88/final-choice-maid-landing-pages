# Final Choice – Maid Landing Pages (sales-1 / sales-2)

Two identical single-page landing pages for Agensi Pekerjaan Final Choice Sdn. Bhd. Built from ONE template; only the contact config differs. Static HTML/CSS/JS, no backend, GitHub Pages compatible. Currently **noindex** and **not published**.

## Preview locally
```powershell
node build.mjs
node scripts/serve.mjs
```
Open http://localhost:4173/sales-1/ and http://localhost:4173/sales-2/ (add `?lang=en` for English, `?utm_source=facebook` to test campaigns).

## Change a contact number (per sales rep)
Edit `configs/sales-1.json` or `configs/sales-2.json`:
- `whatsapp`: digits only, international format, e.g. `60123456789`
- `phoneDisplay`: how it shows in the footer, e.g. `012-345 6789`
- `placeholderNumber`: keep `false` (true shows a red preview banner and blocks the release build)
- `consultant`: first name shown on buttons, messages and footer
- `campaign`: campaign identifier added to every WhatsApp message as `(Ref: …)`, plus `/utm_source` when present

Then run `node build.mjs`. Every WhatsApp button, floating button, click-to-call and footer number updates automatically.

## Update shared content (applies to both pages)
| What | File |
|---|---|
| Company details, address, hours, 15-year claim (`experience.confirmed` must be `true` for a release build) | `content/company.json` |
| Packages and terms (no prices are stored or shown, by management decision) | `content/packages.json` |
| Maid preview cards (approved data only) | `content/maids.json` + photos in `assets/maids/` (`<photo>-480.webp`, 480×600) |
| WhatsApp message wording (BM/EN) | `src/messages.mjs` |
| Section text, FAQ, headings (BM/EN) | `build.mjs` (each `tx('Malay','English')`) |
| Look and layout | `src/styles.css` |
| Service photos | drop `assets/img/service-childcare.webp`, `service-elderly.webp`, `service-household.webp` (640×360); used automatically instead of the icon panels |

Always run `node build.mjs`; both pages are regenerated together, so they cannot drift apart. `node scripts/verify.mjs` re-runs all checks and screenshots (needs `cd tools && npm i` and Chrome).

## Analytics / ads
Nothing is active. `analytics.enabled` is `false` in each config; the hook in `src/app.js` only pushes click events to `dataLayer` when enabled. Add a pixel/GA only with management approval.

## Deploy to GitHub Pages
See `HANDOVER.md` (steps, release blockers) and `CLAUDE.md` (commands and rules). The public build is `node build.mjs --release`; it is what the GitHub Actions workflow deploys.
