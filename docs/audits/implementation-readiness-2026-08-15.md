# ميدورا | منظومة الرعاية الصحية المتكاملة — Implementation Readiness

## Purpose

This note prevents incomplete prerequisites from being presented as completed capabilities. It is an internal delivery map for the remaining work after the current security, tenancy, policy, and branding milestones.

| Remaining area | Current state | Exact prerequisite before activation |
|---|---|---|
| Persisted cross-tenant lifecycle tests | Policy and mocked-router coverage exist | A disposable MySQL/TiDB `TEST_DATABASE_URL`, authenticated test memberships, migrations, cleanup assertions, and a controlled test run |
| Invoice persistence and numbered submission | `invoice.generatePreview` and pure catalog-scope guards exist | An approved invoice schema, migration, persistence procedure, jurisdiction-specific technical specification, credentials, and human acceptance |
| Prescription/dispensing product matching | Reusable catalog evidence and scope guards exist | A real product-consumption persistence entry point and its transaction contract |
| Government and e-invoicing adapters | Readiness gates exist; no external submission is enabled | Current official specification, organization registration, credentials, test endpoint, acknowledgement contract, and acceptance evidence per country |
| Insurance payer transport | Policy boundaries exist | Official payer API specification, credentials, sandbox, claim/eligibility mapping, and acceptance testing |
| HR and payroll statutory activation | Architecture remains extensible but country-specific rules are not activated | Current payroll law, tax/social-insurance rules, effective dates, employer registration, and payroll acceptance tests per country |
| Egyptian medicine/cosmetics/supplies records | Source-safe workbook template and limitations note delivered | A reproducible official register or row-level official source evidence with verification timestamps |
| Jordan, Qatar, and Morocco detailed packs | Official source leads recorded; no legal completeness claimed | Current primary sources, effective dates, local licences, privacy/hosting requirements, credentials, and acceptance criteria |

## Safety posture

No production database was used to fabricate lifecycle evidence. No government, insurance, or e-invoicing submission adapter is enabled. No unverified medicine, cosmetic, or medical-supply rows were inserted. The clinical-trials archive remains intentionally skipped according to the user’s instruction.

## Current verification

The latest regression run passed 172 tests, skipped 4 optional database tests because `TEST_DATABASE_URL` is unavailable, passed TypeScript, and passed the production build. The existing bundle-size warning is non-blocking and should be addressed separately through code splitting when the product surface expands.
