# Google reviews: internal evidence record

Recorded 2026-11-23. The screenshots supplied by APFC are stored only in the private, gitignored `private/evidence/google-reviews-2026-11-23/` folder (original files also remain in `OneDrive\Pictures\Screenshots`). They are NOT in the public repository.

| Reviewer (as shown on Google) | Stars | Date shown | Screenshot file | SHA-256 |
|---|---|---|---|---|
| Ahmad Asnawie | 5 | 5 months ago | Screenshot 2026-11-23 164221.png | `6e16ff1146cd62117aca4051aaef314eaf861551a37777a331debd8f27319527` |
| Fitryy Fitryy | 5 | 6 months ago | Screenshot 2026-11-23 164243.png | `6439083d65e33388a8d3ccf699e6512f5b2fa2bdd2978d74bc3d65b870bc7a3f` |
| Leong Jia Jun | 5 | 6 months ago | Screenshot 2026-11-23 164259.png | `724f1158296cf7aebc607df05c7e0d9d2ee58e18032a94d4f57c6c1aa904b79a` |
| Gevenia Bae | 5 | a year ago | Screenshot 2026-11-23 164416.png | `befd22a348a768d9251926d1b66db0fba358e20308e91fdd4edeedec8e13e27b` |
| Chua Soo Jun | 5 | a year ago | Screenshot 2026-11-23 164445.png | `9c80a0516d2db46e053c8d3073ea326ad7263092a8be4f756becfba2990798c3` |

## How each card was checked
- Names, star counts and wording were read from the screenshots and compared with `content/reviews.json` and, independently, with `tests/fixtures/reviews.expected.json` (automated test, exact text match).
- Ahmad Asnawie: the screenshot shows only the first part of his review (it stops after "...until everything"). His full text was not available in the supplied material, so the card shows one exact contiguous excerpt marked with an ellipsis at both ends. The remainder is unpublished; the "View on Google" link opens the Google reviews page where the full review is visible.
- The other four reviews are shown in full, exactly as in their screenshots (line breaks kept).
- Dates are the relative dates Google displayed on 2026-11-23; exact posting dates were not visible.
- Links: the screenshots contain no direct review URLs, so each card links to the Google listing's reviews page (not to an individual review).

## Permission status (do not overstate)
- Source: selected and supplied by APFC management from the company's own Google Business Profile (owner-supplied; not copied by this project from Google pages).
- Attribution: reviewer name as displayed on Google, star rating, Google mark and a link back to Google are shown on every card; text is unedited.
- **Reviewers' individual consent: NOT obtained.** APFC's own testimonial rule in the Maid website repo (`testimonials.yaml`) asks for the customer's written permission before publishing feedback. The reviews are public on Google and published here as owner-supplied material at management's direction, but that written permission is the missing requirement. Recommended: ask the five reviewers (for example by replying on Google or WhatsApp) and record a yes; remove a card the same day if anyone objects.
- Mentions of APFC staff by first name (Fyera, Yuki, Ms. Ng, Eunice) appear inside the reviews exactly as written; management should be comfortable with staff names being public.
