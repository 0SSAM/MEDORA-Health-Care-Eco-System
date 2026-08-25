# ميدورا | منظومة الرعاية الصحية المتكاملة — Open Prerequisites Index

**Date:** 2026-08-15  
**Purpose:** Separate implementable engineering work from dependencies that must remain blocked until authoritative evidence, isolated infrastructure, or explicit credentials are available.

## Engineering work completed and verified

The current codebase has strict organization, branch, and jurisdiction guards; readiness policies for regulated mutation, privacy, controlled substances, inventory, tax, invoice preparation, localization, audit, notifications, clinical access, patient identity, data export, offline sync, and device trust; country-pack domain coverage enforcement; fail-closed offline replay; a production-safe database test harness; all current connection-opening database tests aligned with that fail-closed guard; and source-level regulated-entrypoint coverage for the implemented POS and prescription procedures. The latest regression passed 80 test files and 262 tests, with 5 optional database tests skipped because an isolated `TEST_DATABASE_URL` is unavailable. TypeScript and the production build passed, and login/workspace routes were visually verified on desktop and mobile. The client also uses conservative React Query caching, a short-lived session-header cache for the existing bearer fallback, lazy loading for non-critical routes, a visible Arabic/English language switcher with persisted direction, and a formal authenticated entry path into organization-scoped workspaces; demo mode and its synthetic workspace have been removed. These changes do not weaken cookie precedence, server authorization, organization isolation, or regulated-operation gates. The server also contains a pure trusted-attestation contract validator for nonce, freshness, revocation, and organization/jurisdiction scope; it is not treated as a real attestation provider and is not enabled for browser-generated evidence.

## Blocked by isolated infrastructure

| Dependency | Current state | Safe next action |
|---|---|---|
| `TEST_DATABASE_URL` | Not supplied as an isolated test database | Provide a disposable MySQL/MariaDB URL and set `TEST_DATABASE_ISOLATED=true`; run lifecycle tests only after safety validation. |
| Full tRPC/database lifecycle | Contract and schema-boundary tests exist; live persistence lifecycle is not executed | Run against isolated infrastructure, verify organization/jurisdiction isolation, then clean up test data. |

## Blocked by authoritative regulatory sources or credentials

| Dependency | Current state | Safe next action |
|---|---|---|
| Egypt medicine catalog | Source-safe workbook and methodology delivered; EDA pages did not expose a reproducible bulk/API source in this environment | Import only an authorized, reproducible EDA source with provenance and review metadata. |
| Jordan country pack | Official data portal access was refused by the hosting layer | Re-check through an authorized accessible source; do not enable the pack from snippets. |
| Qatar country pack | MoPH page is protected by anti-bot controls | Obtain an authorized source or manually verified regulatory package; do not bypass anti-bot controls. |
| Morocco country pack | AMMPS source was recorded, but complete legal, privacy, tax, and operational coverage is not verified | Complete the source-linked domain matrix and approval evidence before enabling. |
| ETA, EDA, insurance, government, payroll, and payer transports | Adapters remain readiness-gated without official API specifications, credentials, or sandbox contracts | Add adapters only after the authority or provider supplies endpoint, authentication, schema, submission, acknowledgement, rejection, retry, audit, and acceptance requirements. The shared readiness policy now blocks unless all eight gates are verified. |

## Blocked by trusted client infrastructure

| Dependency | Current state | Safe next action |
|---|---|---|
| Trusted-device attestation | Server policy, fail-closed replay gate, UI blocked state, contract documentation, and pure nonce/freshness/revocation/scope validation are complete; browser capabilities are intentionally not accepted as proof | Select and configure an approved native/device-attestation provider, then bind its verified claims and revocation signal to replay acceptance. |

## Deliberately absent workflows

Standalone invoice persistence/submission, product matching from prescription extraction, clinical-trials archive generation, and unverified country activation are not represented as completed functionality. The existing invoice boundary now additionally requires the shared eight-gate external-adapter readiness contract before any future submission path can proceed. This is intentional: the platform must not claim a regulated workflow that has no verified persistence contract, source evidence, or user instruction to activate it.

## Integrity rule

> No production URL, personal data, fabricated medicine records, guessed regulatory rule, bypassed anti-bot challenge, or placeholder credential may be used to close any item in this index.

## Exact unchecked items after the database-test skip

The remaining unchecked items are intentionally preserved as prerequisites rather than marked complete. They fall into four groups: country-specific e-invoicing adapters and acceptance credentials; future database-backed invoice, insurance, payroll, and reporting entry points that do not yet exist; live disposable-database isolation and persisted denial coverage; and verified country-pack source/legal evidence for Jordan, Qatar, Morocco, and the full Egypt medicine register. The remaining product-catalog acceptance tests are also dependent on a real prescription-to-product persistence path that has not been implemented. Finally, offline replay still requires a genuine trusted-device attestation provider and revocation signal; browser capabilities are not accepted as evidence. The performance hardening and client test coverage are complete. The latest validation passed 80 test files and 262 tests, with 5 optional database tests skipped safely; TypeScript and the production build also passed. These results do not reduce any of the external prerequisites.

The user explicitly chose to skip supplying `TEST_DATABASE_URL`. Accordingly, all live database lifecycle items remain open, while the local harness, safe-skip behavior, isolation guard, runbook, policy tests, and static/router contracts remain complete and verified. No item in this section may be closed using guessed credentials, fabricated records, bypassed anti-bot controls, or an unverified regulatory source.

## Pharmacopeia reference status

The Egyptian Drug Authority's official Egyptian Pharmacopoeia page is recorded as the authoritative Egyptian source, including its authority and legal-status description. MEDORA stores only provenance-safe source metadata and does not copy protected monograph text or infer commercial-product registration from a monograph. No current, legally usable pan-Arab pharmacopeia reference was verified; therefore any Arab regional reference remains blocked until an issuing authority, edition, effective date, legal scope, and access/licensing status are supplied and reviewed.
