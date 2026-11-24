# Religion display – consent checklist (7 featured maids)

**Status (2026-11-24):** design of the religion labels approved by the owner (chat). Publication permissions: NONE recorded yet for any of the 7 maids; Jacquiline's public label not yet confirmed. Nothing is public.

**Purpose:** record each maid's own permission to show her religion publicly on the landing pages (sales-1 and sales-2). Religion is sensitive personal data (PDPA). The 2026-10-19 company authorisation covered name, biodata and photo only and explicitly excluded religion, so every maid needs her own, separate permission.

**Rules for staff**
- Ask each maid directly. Photo or name permission does NOT cover religion. Never assume religion from nationality, name, appearance or clothing.
- Permission must be written (signed form or recorded written confirmation kept in the office file). Do not write a name of the form here, only that it exists.
- The maid may refuse or withdraw at any time. If she refuses, tick "No" and nothing is shown for her. Withdrawal: tell the developer the same day so the label is removed.
- Do NOT write religions in this file if it will be shared outside the office. The pre-filled version with the recorded religions is kept in the private folder (`private/religion-consent-checklist.md`, not in GitHub).
- Labels used on the cards: Islam/Muslim → "Muslim"; Christian/Roman Catholic → "Christian" (BM: "Kristian"); any other religion → as recorded, unless staff confirm different wording below.

## Per maid

For each maid complete every line. "Religion matches biodata" means staff compared what the maid confirms with her biodata.

| # | Maid (as shown on the page) | Religion confirmed with maid and matches biodata (Y/N) | Permission to show religion publicly (Yes / No) | Date | Written proof on file (Y/N) | Staff initials |
|---|---|---|---|---|---|---|
| 1 | Cici Pranita Bako | | | | | |
| 2 | Maria Evi Estera Br Sembiring | | | | | |
| 3 | Lusiana | | | | | |
| 4 | Purti Siregar | | | | | |
| 5 | Editha Molina Orosco | | | | | |
| 6 | Jacquiline Navarro Donato | | | | | |
| 7 | Babylyn Salado Lumayot | | | | | |

## Separate confirmation: public label for Jacquiline Navarro Donato

Her recorded religion (see the private pre-filled checklist) is a church name that is not on the Muslim/Christian mapping list, so the correct public wording must be confirmed (ideally by Jacquiline herself) before anything is shown.

- Public label to display (tick ONE): ☐ As recorded (see private checklist)  ☐ Christian  ☐ Other wording: ______________________
- Confirmed with the maid herself (Y/N): ______
- Confirmed by (name / initials): ______  Date: ______
- Notes: ______________________________________________

## After the checklist is complete (developer steps, only with owner approval)
1. For each maid with permission = Yes and written proof = Y, add `religion` and `religionConsent` (`verified: true`, date, short note) to her entry in `content/maids.json`. Maids with No or blank stay without a label.
2. `node build.mjs --release`, then `PAGES_PATH=1 node scripts/verify.mjs` (0 failures). The release build refuses religion without `religionConsent.verified`.
3. Owner reviews the preview and approves; only then commit, push and deploy. Update `HANDOVER.md`.
