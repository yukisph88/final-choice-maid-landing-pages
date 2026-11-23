# Service photos (Our Maid Services): status and permissions

Updated 2026-11-23. Photos awaiting approval are NOT in this repository and NOT on the live pages.

## Photos (all three now public)
| Card | Source | State |
|---|---|---|
| Childcare | Real Final Choice photo supplied by APFC management on 2026-11-23 (maids with a young child during a childcare activity); plain 4:3 crop | Public |
| Elderly Care | Real Final Choice photo supplied by APFC management on 2026-11-23 (two maids in blue uniforms assisting two elderly women); plain 4:3 crop of the lower part of the original so both maids and both women stay in frame | Public |
| Household Duties | Real Final Choice photo supplied by APFC management (maid in the blue uniform doing kitchen duties); plain 4:3 crop | Public |

All three: 4:3, WebP, 800x600 and 480x360, no retouching or changes to faces, uniforms or appearance. Untouched originals are kept as internal evidence in `private/evidence/service-photos-2026-11-23/` (gitignored, not in the repository).

## Approval and permissions (recorded accurately)
- **Management approval:** APFC management approved all three photos for the public Maid landing pages (stated in chat by the project owner on 2026-11-23, the day they were supplied). Evidence type: chat confirmation, not a signed document.
- **Not documented (no evidence was supplied, none has been assumed):**
  - the written consent of a parent or guardian for the young child in the childcare photo;
  - the consent of the two elderly women in the elderly-care photo (and of the care centre where it appears to have been taken);
  - the consent of the maids shown to appear in public marketing.
- **Other notes:** the elderly-care photo shows Chinese-language wall text and a "KASIH SAYANG" sign at the location in part of the background; the household photo shows an incidental "Anlene" cup. The repository is public, so published photos remain in Git history even if later removed.
- **Recommended:** obtain and file written consents (child's guardian, the elderly women or their family/the centre, the maids). If anyone objects, remove the photo the same day: delete the matching `assets/img/service-<key>-*.webp` files, run the release build and push (the card falls back to its icon panel).

## Process notes
Photos awaiting approval can be staged in the gitignored `private/assets/img/` (shown only by `node build.mjs --with-pending`); approved ones live in `assets/img/` with the names `service-childcare-800.webp`, `service-childcare-480.webp`, and the same pattern for `elderly` and `household`.
