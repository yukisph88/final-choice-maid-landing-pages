# Google Customer Reviews: source record

Retrieved 2026-11-23. Internal document.

## Listing verification
- Opened in Google Maps: **Agensi Pekerjaan Final Choice Sdn. Bhd.** (category "Corporate office").
- Address on the listing: 58, Jalan Mutiara Barat 6, Taman Mutiara Barat, 56000 Kuala Lumpur, Wilayah Persekutuan Kuala Lumpur. This matches the official address on https://apfinalchoice.com and the Maid website. The listing photo shows the Final Choice signboard.
- Listing URL (opens the Reviews tab): see `source.reviewsUrl` in `content/reviews.json`.
- Not verifiable from outside: ownership of the Google Business Profile. The company website itself does not link to the listing, and the Maid website's `googleBusinessProfile` setting is empty. Management should confirm this is the company's own profile.
- Searches on the web (job boards, maid directories) did not surface the listing; the Maps listing was found directly.

## Rating and count (verified on the listing, 2026-11-23)
- 4.8 stars, 109 reviews, as shown publicly. These numbers change; refresh `rating` in `content/reviews.json` before each release.

## Review text
- **No review text is published.** Google Maps terms restrict copying or exporting review content, and copying text by hand risks transcription errors, so the section is built but stays **hidden until APFC staff supply approved reviews** in `content/reviews.json`.
- Each review needs: `name`, `stars`, `text` (exact, original language, unedited), `lang`, `sourceUrl`, `when`, `retrievedOn`, `approved: true`, `verifiedAgainstSource: true`. Anything missing is not shown.
- Suggested way to get exact text: the business owner copies reviews from the Google Business Profile dashboard (business.google.com, Reviews), or uses Google's "Share review" link for each review as `sourceUrl`.
- APFC's own testimonial rule (Maid repo `testimonials.yaml`) asks for the customer's written permission to publish feedback. Google reviews are public, but management should decide whether quoting them without separate permission is acceptable; reviewer names appear as shown publicly on Google.
- Paid APIs (Google Places API) are not used and need approval first.

## How the page behaves
- Section "What Our Customers Say" / "Apa Kata Pelanggan Kami" sits after "Why Choose Final Choice?" and before the process and final-enquiry sections. Desktop shows 3 cards with arrows; mobile shows one swipeable card. Review text is shown in its original language and never translated or edited.
- Layout tests use clearly marked SAMPLE data (`tests/fixtures/reviews.sample.json`) through `node build.mjs --reviews-fixture`. The release build refuses that flag.

## Update 2026-11-23: five owner-supplied reviews published
APFC management supplied five reviews from the company's Google Business Profile (screenshots; evidence record in `google-reviews-evidence.md`, files kept privately, not in this repository):
Ahmad Asnawie, Fitryy Fitryy, Leong Jia Jun, Gevenia Bae, Chua Soo Jun, all 5 stars. Wording is verbatim (four in full, Ahmad Asnawie as one marked excerpt because his screenshot is cut off). Compact header: Google, 4.8 / 5.0, 109 Google Reviews, Snapshot: 23 November 2026 (not live-updating). Button "Lihat Lagi Ulasan di Google" / "See More Reviews on Google" opens the Google listing's reviews. There is no rating-only fallback.

### Remaining requirement (not invented as confirmed)
- **Reviewers' individual written permission: not obtained.** APFC's own testimonial rule (Maid repo `testimonials.yaml`) asks for it. The reviews are public on Google and are published as owner-supplied material at management's direction, with name, stars, Google attribution and a link back, unedited. Recommended: ask the five reviewers and record a yes; remove any card the same day if someone objects.
- Ahmad Asnawie's full review text was not supplied (the card shows an exact excerpt); supply it if a longer quote is wanted.
- Review dates are relative ("5 months ago") as displayed on 23 November 2026. Refresh or replace them when the snapshot is refreshed.

### To add or change reviews later
Edit `content/reviews.json` (exact text, name as shown on Google, stars, date, `approved` and `verifiedAgainstSource` true) and keep `tests/fixtures/reviews.expected.json` in step; rebuild and run `node scripts/verify.mjs`.
