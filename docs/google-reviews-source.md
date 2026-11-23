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

## Update 2026-11-23: rating-only panel removed; cards-only design
Management rejected the rating-only panel and asked for real review cards under a compact header (Google, 4.8, 109 Google reviews, snapshot 23 November 2026), a "See More Reviews on Google" button ("Lihat Lagi Ulasan di Google") and no rating-only substitute. The code now has only two states: review cards (when approved reviews exist) or hidden. Desktop shows 3 cards per row (grid), mobile a swipeable single card. The sample cards (`--reviews-fixture`) are preview-only.

**Current live state: section hidden**, because no review text has been supplied with authorised access.

### Exactly what is needed to show real reviews
Any ONE of these (all keep us within Google's terms):
1. **Owner-supplied text (fastest):** an APFC Business Profile manager signs in at business.google.com, opens Reviews, chooses 4-6 positive reviews and sends their exact text with reviewer name, star rating and date (copy-paste or screenshot). Optionally the per-review "Share review" link for `sourceUrl`. Management confirms they approve showing them (`approved: true`) and someone compares them to the live Google reviews (`verifiedAgainstSource: true`).
2. **Official API access:** apply for Google Business Profile API access (free, needs Google approval) or use the Places API (billing account required, so needs your approval); then reviews can be loaded through an authorised, supported channel.
3. **Paid review widget:** a Google-reviews widget service (subscription); needs your approval.
Whichever route is used, reviewer names and review wording stay exactly as published by Google and are never edited or translated.
