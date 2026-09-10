# ميدورا | منظومة الرعاية الصحية المتكاملة — External Inputs Request

**Date:** 2026-08-15

This document lists the exact external evidence and infrastructure required to move the remaining fail-closed items from blocked to verified. The application must not activate regulated workflows from screenshots, snippets, guessed credentials, browser-only signals, or unverified sample records.

| Area | Required input | Required verification before activation |
|---|---|---|
| Isolated database lifecycle | Disposable MySQL/MariaDB `TEST_DATABASE_URL` and explicit `TEST_DATABASE_ISOLATED=true` | Confirm the host is non-production, run authenticated tRPC lifecycle tests, verify cross-organization/country denial, and clean up all test rows. |
| Trusted offline replay | Approved native or MDM attestation provider, app identity, nonce/signature format, freshness window, revocation endpoint or feed, and organization/jurisdiction claims | Validate the signed attestation against the server contract and prove revocation and scope denial in acceptance tests. Browser capabilities alone are insufficient. |
| Egypt medicine register | Authorized reproducible EDA export/API or licensed data delivery | Preserve source URL/version/timestamp, Arabic and English fields where provided, registration/status evidence, and import review history. No inferred product rows may be added. |
| Jordan pack | Current primary authority documents, effective dates, licensing evidence, privacy/hosting requirements, and test credentials where applicable | Complete the country-domain matrix and obtain human/regulatory approval before enabling any regulated domain. |
| Qatar pack | Authorized MOPH source or manually verified official package, effective dates, licensing evidence, and test credentials where applicable | Do not bypass anti-bot controls; complete source-linked acceptance tests before activation. |
| Morocco pack | Current AMMPS legal, privacy, fiscal, insurance, payroll, and operational evidence plus effective versions and credentials | Complete organization-specific licensing and integration acceptance evidence before activation. |
| Government/e-invoicing adapters | Official endpoint specification, authentication method, schemas, submission acknowledgement, rejection codes, retry rules, audit requirements, sandbox, and acceptance sign-off | Pass the shared eight-gate external-adapter readiness policy for the exact organization and jurisdiction. |
| Insurance payer transports | Provider endpoint, eligibility/claims mappings, authentication, sandbox, rejection/retry contract, and acceptance evidence | Keep transport disabled until the provider contract is verified and scoped to the organization. |
| Prescription product matching | Authorized product-link source and matching policy with verified identifiers, jurisdiction, and evidence | Implement only after the product persistence path and evidence revalidation contract are approved. |

## Safe submission format

Provide each artifact through an authorized secure channel and identify its issuing authority, version or effective date, legal scope, access rights, and intended organization/country scope. Credentials must be supplied through the project secret-management flow rather than placed in source files, documents, chat transcripts, or test fixtures.

## Current safe state

The server and UI remain fail-closed for every item above. Demo mode and synthetic-account paths have been removed; only authenticated operational data paths remain. The Egyptian Pharmacopoeia source is recorded as provenance metadata without copying protected monograph text; no current legally usable pan-Arab reference has been verified, so regional activation remains blocked.
