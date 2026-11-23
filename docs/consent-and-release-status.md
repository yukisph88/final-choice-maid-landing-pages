# Consent and release status (public-safe summary)

Updated 2026-11-23.

## Featured maids in the public build
Seven maids are featured (`content/maids.json`). For each, publication consent and photo consent are recorded in the Maid website records, the name is the approved public display name, and the same name and photo are already shown on the public Maid website (https://yukisph88.github.io/final-choice-maid-agency/). Names were cross-checked against the biodata file names in the marketing folder. Maid codes are kept in `content/maids.json` for tracking and are never shown on cards.

| Displayed name |
|---|
| Cici Pranita Bako |
| Editha Molina Orosco |
| Maria Evi Estera Br Sembiring |
| Jacquiline Navarro Donato |
| Lusiana |
| Purti Siregar |
| Babylyn Salado Lumayot |

Limit of the evidence: the records do not contain a separate "full name" consent field. Management should confirm that these maids agreed to full-name publication. If someone agreed to a first name only, change her `name` in `content/maids.json`.

## Candidates without confirmed consent
One additional candidate was requested for the page. APFC management has approved featuring her (recorded 2026-11-23, chat confirmation from the project owner; this is a company decision, not the candidate's own consent). Her own written publication consent and photo consent are **not** on file, so her name, photo and code are **not in this repository or in the public build**; they are held in the local, gitignored `private/` folder and shown only in the local preview.

Missing evidence before she can be published (APFC rule "No consent, no file"):
1. Her signed publication consent (online publication of name and profile).
2. Her photo consent for the photo to be shown publicly, with the consent date.
3. The name level she agreed to (full name, first name only, or code only).
4. Approver initials and date in the office consent checklist.

Release rule: a candidate moves into `content/maids.json` only after this evidence exists and `consent.verified` is set to `true`. Management approval alone does not satisfy it. This repository is public, so anything committed stays in Git history.

## Experience claim
"15+ years" is supported only by published statements (see `experience-claim-sources.md`) and is **not confirmed**, so the public pages use a non-numeric statement ("Professional Experience in Domestic Helper Recruitment"). `experience.confirmed` stays `false` until management verifies the figure against company records.

## Other flags
- The official logo's mascot apron shows the phone number 011-1852 3311. It is not the consultants' number. An approved number-free logo is needed (not yet supplied).
- Package prices and maid ages are intentionally not shown.
- Pages carry `noindex` and robots.txt disallows crawling until management approves search indexing.
