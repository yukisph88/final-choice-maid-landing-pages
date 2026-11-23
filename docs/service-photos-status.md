# Service photos (Our Maid Services): status and permissions

Updated 2026-11-23. Photos awaiting approval are NOT in this repository and NOT on the live pages.

## Photos
| Card | Source | State |
|---|---|---|
| Childcare | Real Final Choice photo supplied by APFC management on 2026-11-23 (maids with a young child during a childcare activity). Cropped to 4:3 (plain crop, resized to 800x600 and 480x360 WebP, no retouching) | **Pending approval**: stored only in the gitignored `private/assets/img/`; shown only in local preview (`node build.mjs --with-pending`) |
| Household Duties | Real Final Choice photo supplied by APFC management (maid in the blue uniform doing kitchen duties). Plain 4:3 crop, same sizes | **Pending approval**: same as above |
| Elderly Care | **No suitable photo found.** Checked: the Maid website training photos (cooking sessions), and the company folders (orientation handbook pages and a care infographic are illustrations, not photos; others are application forms and checklists) | Keeps the existing blue icon panel (now 4:3 like the others). Needs a photo, see below |

Untouched originals are kept as internal evidence in `private/evidence/service-photos-2026-11-23/` (gitignored).

## Publication permission: NOT confirmed (cannot be confirmed from the files)
- **Childcare photo: shows a young child.** A parent or guardian's written consent to publish the child's image is not documented. This is the key missing requirement. The page is public and the repository is public, so a published photo stays in Git history. Without that consent, consider a photo without a child, or one where the child is not identifiable.
- **Childcare and household photos: the staff/maids shown** (faces partly masked in the childcare photo) need to have agreed to appear in public marketing; no consent record was supplied.
- **Household photo:** a third-party product cup brand ("Anlene") is visible in the kitchen; this is incidental but management may prefer a crop or a different photo.
- Approval of the selection by management is requested before any deployment.

## Elderly care: options (need management approval before use)
1. **Best: a real Final Choice photo.** Take a short staff photo at the training centre showing caregiver assistance (for example a maid helping an adult volunteer walk or sit), with written consent from everyone shown. Supply it as a photo and it will be used the same way.
2. **Licensed stock photo (not used automatically).** If management approves, choose a clearly licensed image from a service whose licence allows commercial web use without attribution (for example paid stock such as Adobe Stock or Shutterstock; free libraries such as Unsplash or Pexels also allow commercial use but check each image's licence and any model/property release). It must not be presented as Final Choice training and should show a caregiver with an elderly person in a respectful way. Send the licence/receipt for the record.
3. Keep the icon panel.

## To publish after approval
Move the approved files from `private/assets/img/` to `assets/img/` (same names: `service-childcare-800.webp`, `service-childcare-480.webp`, `service-household-800.webp`, `service-household-480.webp`, and `service-elderly-*` when approved), run `node build.mjs --release`, `node scripts/verify.mjs` (also with `PAGES_PATH=1`), commit, push, then `node scripts/live-check.mjs`.
