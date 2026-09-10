# ميدورا | منظومة الرعاية الصحية المتكاملة — Quality and Security Audit

**Audit date:** 14 August 2026  
**Scope:** Current managed project state after the `commitSale` catalog-evidence hardening milestone.  
**Method:** Static boundary audit, protected router-contract tests, unit tests, TypeScript validation, production build, and inspection of development runtime logs. This document records verified implementation state only; it is not a legal, regulatory, clinical, or security certification.

## Executive assessment

The current implementation has a strong policy boundary around the regulated vertical slices that are actually wired: authenticated role checks, branch membership, organization and jurisdiction predicates, approved compliance-pack gates, verified catalog evidence, demo-mode mutation blocking, and transaction-level inventory safeguards. The newly repaired positive `commitSale` contract test now demonstrates the complete approved path rather than only rejection paths.

The audit also confirms that the project does **not** yet provide evidence for full enterprise-suite parity, country-wide legal compliance, live government or payer connectivity, or persisted cross-tenant lifecycle testing. Those claims remain activation-gated and are deliberately not marked as complete.

| Control area | Verified result | Status | Evidence |
|---|---|---:|---|
| Static boundary heuristics | No findings were emitted by `server/audit/static-boundary-audit.mjs` | Pass | `docs/audits/static-boundary-audit.json` |
| POS catalog evidence | Unverified, cross-jurisdiction, missing-evidence, and valid approved-sale cases are covered | Pass | `server/integration/commit-sale-catalog-contract.test.ts` |
| Automated regression suite | 41 test files passed; 144 tests passed; 4 optional database tests skipped | Pass with environment limitation | Vitest output from 14 August 2026 |
| Type safety | TypeScript completed without errors | Pass | `pnpm exec tsc --noEmit` |
| Production build | Vite and server bundle completed; existing client chunk-size warning remains | Pass with optimization note | `pnpm run build` |
| Runtime log privacy | Network collector records metadata and omits response bodies under the privacy marker; no actionable error pattern was found in the inspected tail | Pass for inspected slice | `.manus-logs/*` |
| Persisted tenant isolation | Mocked contracts and scoped query code exist, but a valid disposable MySQL lifecycle is unavailable | Blocked | `TEST_DATABASE_URL` prerequisite |
| Official country packs and external adapters | Frameworks and credential gates exist; authoritative activation evidence and credentials remain absent | Blocked by prerequisites | Capability and regulatory registers |

## Findings and decisions

The positive `commitSale` fixture required separate mocked results for nested membership, branch-jurisdiction assignment, branch organization lookup, profile, compliance pack, evidence, product, inventory batch, catalog item, and catalog evidence. The correction was limited to the test fixture. No production authorization guard was weakened, and the test still proves that invalid catalog state fails before the sale transaction begins.

The static audit produced an empty findings collection for its configured heuristics. This is evidence that the checked patterns were not detected; it is not proof that arbitrary or semantic authorization defects cannot exist. Manual review and persisted-database testing therefore remain necessary.

The runtime logs inspected for this milestone showed successful `auth.me` requests and successful analytics calls. Network response bodies were represented by the configured privacy marker rather than retained payloads. The remaining logs and any future browser flow should continue to be reviewed without exposing sensitive bodies.

## Open release gates

| Gate | Why it remains open | Required evidence before completion |
|---|---|---|
| Database-backed isolation | No valid `TEST_DATABASE_URL` is available for protected-router lifecycle tests | Disposable MySQL/TiDB database, seeded memberships, cross-tenant denial, rollback, and cleanup assertions |
| Country activation | Legal and technical requirements vary by jurisdiction and have not been verified for every enabled country | Current primary sources, effective dates, approved pack, accountable reviewer, and local acceptance tests |
| Government and payer transport | No official credentials, certificates, endpoint contracts, or acceptance responses are available | Credentialed sandbox tests, adapter contract, reconciliation, audit trail, and human approval |
| Complete Egyptian medicine workbook | Official bulk export/API access is not established | Authorized source with permitted export, provenance fields, refresh date, and coverage statement |
| Invoice persistence | A standalone invoice persistence/submission workflow is not yet implemented | Invoice schema, scoped creation procedure, catalog revalidation, country adapter, and tests |

## Recommended next implementation order

First, provision a disposable database test connection and run the protected router lifecycle with real organizations, memberships, jurisdiction assignments, rollback, and cleanup. Second, extend the same persisted assertions to regulated categories that are already represented in schema and routers. Third, complete country-specific activation registers only from current primary sources and supplied credentials. Fourth, implement standalone invoice persistence only when its schema and jurisdiction adapter requirements are defined.

> **Safety boundary:** No customer reviews, ratings, testimonials, medicine records, government approvals, payer responses, clinical results, or regulatory certifications were fabricated for this audit.

## Static-audit tooling improvement

The static boundary inventory now emits a bounded summary in addition to per-file counts: files scanned, files containing protected procedures, organization/jurisdiction scope markers, raw-error-string markers, and body/payload tokens. A regression test verifies the summary, scope signals, and non-certification disclaimer. This is a reporting improvement only; it does not replace semantic review or disposable-database lifecycle testing.

## Frontend audit slice

The reviewed workspace routes use the shared dashboard shell and expose loading, error, or empty states for the inspected data panels. The current Arabic-first UI maintains RTL layout, labeled inputs, visible status text, responsive grid behavior, and an escape path through the persistent navigation. The desktop preview was checked after the MEDORA branding update. This is a focused implementation audit, not a substitute for a full assistive-technology test matrix.

## Server-router audit slice

The implemented server slice was reviewed through the static inventory and protected router-contract suite. The current inventory scans 67 server files, including 41 protected-procedure markers, 345 organization-scope markers, and 303 jurisdiction-scope markers; the configured raw-error-string heuristic reports zero matches. Focused router contracts cover organization and jurisdiction denial before sensitive reads/inserts in the implemented catalog, POS, prescription, insurance, reporting, and compliance paths. These results document the inspected slice only; persisted lifecycle isolation and semantic review of every future procedure remain open until a disposable database and additional entry points are available.

## Schema and migration audit slice

The schema review found 22 SQL migration files and 22 journal entries, so the migration baseline is internally aligned. The current schema contains 30 declared index or unique-index definitions and 19 explicit non-null organization/jurisdiction scope declarations in the inspected source. Scope-sensitive tables use organization, branch, and/or jurisdiction predicates in the reviewed router paths. A live database constraint and query-plan review is still required before claiming complete persisted tenant isolation, because the currently supplied test connection is not a valid disposable database.

## Scheduled, offline, notification, and sensitive-data audit slice

The offline policy rejects regulated inventory, sale, prescription, and invoice operations when jurisdiction confirmation, a current compliance pack, or online validation is missing; non-regulated offline work remains draft-only and conflict resolution requires manual review. Scheduled reports use cron authentication, allowlisted query keys, scoped organization/jurisdiction predicates, idempotency keys, in-app delivery, and bounded query errors. During review, the outer report handler was found to expose raw error text, request URL, and task UID; this was corrected to a fixed transport error and covered by regression tests. External report channels remain disabled by default.

## Production-audit cycle conclusion

This audit cycle covered the implemented server authorization and scope paths, the migration/schema source baseline, scheduled and offline lifecycle policies, sensitive-data handling, and the inspected RTL workspace UI. A reproducible scheduled-report error disclosure was fixed and regression-tested. Remaining gaps are not silently classified as defects: they require a valid disposable database, current primary regulatory sources, official integration credentials/certificates, or broader assistive-technology and persistence coverage.

## Egyptian medicine-register source check

A current source check was attempted against the EDA public portal and its official medicine-search path. The portal returned a request-rejected response in the current environment, and no downloadable public register was available in the project workspace. Therefore no new medicine rows or completeness claims were created. The Egyptian medicine workbook remains source-gated until an accessible official export or an authorized, reproducible extraction path is supplied.
