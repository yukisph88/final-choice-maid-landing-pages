# "15+ Years of Professional Experience" – source review

Reviewed 2026-11-23 (internal document; not customer-facing).

## Status: SUPPORTED BY PUBLISHED COMPANY STATEMENTS – NOT INDEPENDENTLY VERIFIED

The claim rests on published statements only, not on historical company records. The release gate stays **pending** (`experience.confirmed = false` in `content/company.json`, so `node build.mjs --release` is blocked). The gate was designed to require verification against company records, and published statements are not records.

## Sources

| Source | Type | What it says |
|---|---|---|
| https://apfinalchoice.com/about-us/ | Official company website | "more then 15years experience" (sic), described as professional in the supply of domestic helpers (house maids). No founding year stated. |
| https://www.ricebowl.my/company/agensi-pekerjaan-final-choice-sdn-bhd | Third-party job board | "With over 15 years of experience"; the company recruits and places housemaids, foreign workers and local staff. Does not say what the 15 years measures. No incorporation date. |
| https://www.maukerja.my/en/company/agensi-pekerjaan-final-choice-sdn-bhd | Third-party job board | Same wording as Ricebowl. Does not say what the 15 years measures. No incorporation date. |

## Cautions

- The two job-board texts are identical, so they are probably not independent of each other or of the company's own page.
- None of the pages is dated, so it is unknown when "15 years" was written.
- None gives a founding or incorporation year. The company website footer shows "© 2015" (a copyright notice only), and company no. 201201028954 suggests incorporation in 2012. These do not match a simple count of 15+ years since incorporation, which is why the wording must NOT say the company was established more than 15 years ago.

## Approved wording (both landing pages)

- EN: "15+ Years of Professional Experience" and "With over 15 years of professional experience in domestic helper recruitment, …"
- BM: "15+ Tahun Pengalaman Profesional" and "Dengan pengalaman profesional melebihi 15 tahun dalam pengambilan pembantu rumah, …"
- Clarification shown on the page: the experience relates to domestic helper recruitment and placement, not the number of years since incorporation.

## To open the gate

Management confirms the figure against company records (for example early placements, licence history or agreements), then sets `experience.confirmed` to `true` in `content/company.json` and records who confirmed it and when.
