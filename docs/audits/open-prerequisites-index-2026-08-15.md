# ميدورا | منظومة الرعاية الصحية المتكاملة — Open Prerequisites Index

**Purpose:** Separate implementable engineering work from dependencies that must remain blocked until authoritative evidence, isolated infrastructure, or explicit credentials are available.

## Current engineering truth

The repository has strict organization, branch, and jurisdiction guards; readiness policies for regulated mutation, privacy, controlled substances, inventory, tax, invoice preparation, localization, audit, notifications, clinical access, patient identity, data export, offline sync, and device trust; country-pack domain coverage enforcement; fail-closed offline replay; a production-safe database test harness; source-level regulated-entrypoint coverage; bilingual workspace controls; platform-admin RBAC invariants; and an executable internal insurance workflow surface.

Insurance is no longer a documentation-only area: payer contracts, member references, coverage rules, eligibility requests, preauthorization, claims, claim-event history, attachment references, remittances, appeals, and payer communication records have persisted internal workflows. External payer transport remains blocked until payer-specific endpoint/channel, authentication, mapping, sandbox, rejection/retry, operational ownership, and acceptance evidence are supplied.

The repository must continue to distinguish **Implemented & tested**, **Implemented foundation / not production integrated**, **Planned**, and **Blocked by external prerequisite**. A screen, permission, seeded record, configuration flag, or documentation page is not proof of a live integration.

## Blocked by isolated infrastructure

| Dependency | Current state | Safe next action |
|---|---|---|
| `TEST_DATABASE_URL` | Not supplied as an isolated test database | Provide a disposable MySQL/MariaDB URL and set `TEST_DATABASE_ISOLATED=true`; run lifecycle tests only after safety validation. |
| Full tRPC/database lifecycle | Contract/schema-boundary tests exist; the current CI workflow provides an isolated MariaDB service, but database-backed coverage still needs to be kept release-blocking | Ensure every sensitive lifecycle suite executes against the isolated CI database and fails the release on unexpected skips. |

## Blocked by authoritative regulatory sources or credentials

| Dependency | Current state | Safe next action |
|---|---|---|
| Egypt medicine catalog | Source-safe methodology exists; a reproducible authorized bulk/API source is still required | Import only an authorized, reproducible EDA source with provenance and review metadata. |
| Jordan country pack | Official data access was previously refused by the hosting layer | Re-check through an authorized accessible source; do not enable the pack from snippets. |
| Qatar country pack | Official source access was previously protected by anti-bot controls | Obtain an authorized source or manually verified regulatory package; do not bypass anti-bot controls. |
| Morocco country pack | Source recorded, but complete legal, privacy, tax, and operational coverage is not verified | Complete the source-linked domain matrix and approval evidence before enabling. |
| ETA, EDA, insurance, government, payroll, and payer transports | Adapters remain readiness-gated without official API specifications, credentials, or sandbox contracts | Add/activate adapters only after endpoint, authentication, schema, submission, acknowledgement, rejection, retry, audit, and acceptance requirements are verified. |

## Blocked by trusted client infrastructure

| Dependency | Current state | Safe next action |
|---|---|---|
| Trusted-device attestation | Server policy, fail-closed replay gate, UI blocked state, and pure nonce/freshness/revocation/scope validation exist; browser capabilities are intentionally not accepted as proof | Select and configure an approved native/device-attestation provider, then bind verified claims and revocation signals to replay acceptance. |

## Remaining engineering gaps

These are genuine implementation gaps rather than reasons to invent integrations:

- database referential integrity and deliberate FK/cascade strategy across the legacy schema;
- full double-entry accounting, AR/AP, bank reconciliation, inventory valuation, period close, and financial statement controls;
- complete offline conflict resolution and durable sync semantics for the explicitly allowed non-regulated payloads;
- broader two-identity adversarial authorization tests across every sensitive object family;
- full clinical order lifecycle and expanded prescription safety evidence where those workflows are enabled;
- production-grade observability, distributed rate limiting, restore drills, RPO/RTO evidence, and incident runbooks;
- bounded-context separation where the ERP router remains a concentration point;
- accessibility coverage across the complete application rather than only audited workspaces;
- complete HR/payroll statutory execution for a specific jurisdiction only after official rules and acceptance evidence exist;
- promotion campaign lifecycle and atomic usage enforcement if campaign management is activated;
- live report delivery only when its delivery infrastructure and audit/retention controls are configured.

## Deliberately blocked workflows

Standalone regulated invoice submission without a verified external adapter, prescription-to-product matching without a governed persistence path, clinical-trials archive generation without an authoritative data source, unverified country activation, arbitrary insurer portal automation, CAPTCHA/MFA/anti-bot bypass, and live payer adjudication without payer-authoritative rules remain blocked.

## Integrity rule

> No production URL, personal data, fabricated medicine records, guessed regulatory rule, bypassed anti-bot challenge, or placeholder credential may be used to close any item in this index.

## Verification rule

The latest CI workflow is authoritative for committed-source verification. Local claims of `pnpm check`, `pnpm test`, `pnpm build`, or migration success must not be recorded as release evidence unless the corresponding workflow result or reproducible execution is available.

## Pharmacopeia reference status

The Egyptian Drug Authority's official Egyptian Pharmacopoeia page is recorded as an authoritative Egyptian source. MEDORA stores provenance-safe source metadata and does not copy protected monograph text or infer commercial-product registration from a monograph. No current, legally usable pan-Arab pharmacopeia reference has been verified; any regional reference remains blocked until issuing authority, edition, effective date, legal scope, and access/licensing status are reviewed.
