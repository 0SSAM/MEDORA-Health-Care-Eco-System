# Egypt Healthcare Official Findings — 2026-08-15

## Sources reviewed

1. Universal Health Insurance Authority (UHIA): https://uhia.gov.eg/
   - The official site links Law No. 2 of 2018 and its executive regulations.
   - Official pages identify provider registration, beneficiary registration, covered services, and medical service network information.

2. Egypt Healthcare Authority (EHA): https://eha.gov.eg/about-eha/
   - EHA describes itself as an independent public healthcare service provider established under Law No. 2 of 2018.
   - Its published operating model emphasizes family medicine as the first point of contact and referrals to higher levels of care.
   - The page describes primary care, hospitals, emergency, diagnostic and therapeutic services, rehabilitation, and geographic coverage.
   - EHA states that its facilities are prepared for registration/accreditation under Healthcare Accreditation and Regulatory Authority standards.

## Implementation implications

MEDORA can implement internal hospital, referral, provider, eligibility, preauthorization, claims, audit, and accreditation-readiness workflows. It must not claim live UHIA/EHA submission or eligibility verification until the responsible authority supplies an endpoint contract, authentication and certificate requirements, message schemas, acknowledgement/error semantics, test environment, acceptance evidence, and production authorization.

The published EHA operating model requires the Egypt pack to represent primary-care entry, referral, facility levels, emergency, diagnostic, therapeutic, and rehabilitation pathways rather than only generic hospital inventory and prescription screens.

## Additional official sources reviewed

3. Healthcare Accreditation and Regulatory Authority (GAHAR): https://gahar.gov.eg/ar/content-layout/accreditation-standards
   - GAHAR states that it develops and applies healthcare accreditation standards under Egypt's Universal Health Insurance Law No. 2 of 2018.
   - The official standards portal lists separate standards for hospitals, primary healthcare, physiotherapy centers, medical laboratories, diagnostic/therapeutic radiology centers, mental-health hospitals, and extended-care/convalescent facilities.
   - The standards are organized around patient-centered and organization-centered dimensions. MEDORA should therefore provide evidence/readiness tracking rather than claim accreditation.

4. Egyptian Tax Authority e-Invoicing and e-Receipt SDK: https://sdk.invoicing.eta.gov.eg/
   - The official SDK publishes APIs for ERP/POS systems, authentication, document submission, search, and receipt operations.
   - MEDORA can prepare a versioned tax adapter contract and test payload boundary, but production activation requires taxpayer registration, signing/certificate configuration, official environment access, and acceptance testing.

5. Egyptian Drug Authority: http://edaegypt.gov.eg/
   - The official site exposes drug traceability and regulatory databases and publishes information about implementation of drug-tracking and GTIN/package data initiatives.
   - MEDORA should keep product provenance, GTIN/Data Matrix syntax, batch/expiry/serial fields, and traceability readiness internal until EDA supplies the exact active API/portal contract and credentials.

## Source boundary

These sources establish the official actors and published scope. They do not, by themselves, provide an authorized production API contract, credentials, or acceptance evidence for MEDORA. External adapters remain fail-closed pending those items.


## Implementation status after internal Egypt package expansion

The application now contains an internal Egypt-scoped healthcare router and workspace covering facility records for government and private hospitals and related provider types, a scoped patient registry with encrypted sensitive fields, clinical encounters, appointments, referrals, insurance members, claims, idempotency, claim state transitions, and explicit external-submission blocking. These are internal operational foundations and do not constitute official registration, accreditation, payer connectivity, or production governmental interoperability.

The remaining external gate is deliberately explicit: official authority identification, signed endpoint/interface specification, credentials and certificates, approved test environment, conformance/acceptance evidence, data-sharing and privacy basis, and production activation authorization. No external claim submission or governmental exchange is enabled before those prerequisites exist.

Validation after this expansion: TypeScript passed; the focused Egypt contract test passed; full Vitest passed with 87 files passed and 1 skipped, 287 tests passed and 5 skipped; production build passed. A non-blocking frontend chunk-size warning remains documented as performance follow-up rather than a functional failure.

## Internal completion milestone

The Egypt package now includes non-destructive internal tables and scoped procedures for facilities, patients, appointments, encounters, referrals, insurance members and claims, plus beds, admissions, clinical orders, payer contracts, preauthorizations, remittances, and appeals. Create operations use organization/jurisdiction/branch authorization, idempotency where applicable, encrypted sensitive narrative fields, and explicit `blocked` external-submission states.

This milestone does not claim that a government or private hospital HIS is fully complete, nor that Universal Health Insurance Authority connectivity is live. External submission remains blocked until the responsible authority, endpoint specification, credential package, test environment, acceptance evidence, and production authorization are verified.
