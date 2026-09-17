# Egyptian Medicine Workbook Audit — 2026-08-15

## Existing artifacts

The project contains two relevant workbooks. `docs/data/egypt-medicine-register-source-safe-template.xlsx` contains three sheets: `Medicine Register`, `Methodology`, and `Source Register`. Its medicine sheet has headers only and zero medicine rows. The methodology explicitly says it is a template only, and the source register cites the Egyptian Drug Authority regulatory-guidelines page:

https://edaegypt.gov.eg/en/the-regulatory-reference-of-the-egyptian-drug-authority-eda/regulatory-guidelines/ca-of-pharmaceutical-products/

The second artifact, `/home/ubuntu/egypt-research/egypt-medicine-register-coverage-limited.xlsx`, contains a `Medicine records` sheet with one non-record status row: `NO_PUBLIC_BULK_RECORDS_EXTRACTED`. It has no medicine product rows. Its source register cites the EDA databases page:

https://edaegypt.gov.eg/en/services/databases/

The workbook records that an interactive database/search service was observed, but no verified public bulk export was identified. It does not assume a redistribution licence.

## Safe conclusion

No complete, source-verified Egyptian medicine database is present in the workspace. Neither existing workbook may be represented as a full register. The correct deliverable is a provenance-safe workbook that preserves the required fields and source limitations, unless an authorized reproducible EDA export or API becomes available. Missing names, ingredients, strengths, manufacturers, registration identifiers, and status values must remain blank rather than being inferred or copied from unverified commercial sources.

## Direct official-page verification

On 2026-08-15, the official EDA Databases page was opened and exposed an `EDDB` link to `http://eservices.edaegypt.gov.eg/EDASearch/SearchRegDrugs.aspx`, plus separate links for released batches, licences, similar products, and an API Searching Tool. The EDDB page itself rendered an interactive search form with categories for Human Pharmaceutical, Biological, Herbal Medicine, Veterinary, Biocides, Cosmetics, and Complementary products. Its visible fields were trade name, registration number, applicant, generic name, and a CAPTCHA field, with a Search submit control. No public bulk-download control, machine-readable export, or unauthenticated API contract was visible on the reviewed pages. The CAPTCHA and interactive search do not establish that a complete export is legally or technically available.

This confirms that the official source is a searchable service, not a verified downloadable full database for this workbook. A complete Excel register must therefore remain blocked until an authorized export/API or a documented, permitted extraction method is provided.

## EDA EDDB mechanism reference

The EDA regulatory-reference page lists **Mechanism of Egyptian Drug Database (EDDB) Searching Tool**, dated 06/2024, as a Notice to Applicant. The page identifies the mechanism document, but the rendered content does not expose a complete product table, bulk file, or public API contract. This supports treating EDDB as an official interactive/search mechanism while keeping full Excel population blocked until the underlying records can be obtained through an authorized reproducible method.

Source: https://edaegypt.gov.eg/en/the-regulatory-reference-of-the-egyptian-drug-authority-eda/notice-to-applicant/central-administration-of-pharmaceutical-policies-and-market-access/
