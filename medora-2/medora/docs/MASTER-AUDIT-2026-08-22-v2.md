# MEDORA — Master Engineering / Security / Product / Finance / Operations Audit
## 22 August 2026 — Deep pass v2

> **Purpose:** This is a source-level audit of the repository snapshot available to the reviewer. It deliberately separates implemented foundations from production-certified capabilities. It is not a regulatory certification, penetration-test attestation, accounting audit, or clinical safety approval.

## 1. Executive decision

**Current verdict: NOT production-complete.**

MEDORA has a strong enterprise foundation: multi-tenant concepts, branch and jurisdiction scoping, server-side authorization, auditability, prescription human-confirmation gates, FEFO inventory planning, offline safety boundaries, CI, contract tests, and fail-closed external connector boundaries.

The hidden risk is not a missing screen. It is **assurance depth**: several capabilities are represented as foundations, readiness packets, or policy layers rather than end-to-end operational systems. The repository's own TODO/history sometimes labels foundations as complete even when the implementation is intentionally deferred.

The correct release strategy is therefore:

1. **Do not add cosmetic features to compensate for assurance gaps.**
2. Close P0/P1 controls first.
3. Treat finance as a controlled accounting subsystem, not a dashboard.
4. Treat offline mode as an explicit bounded capability, not a universal offline ERP.
5. Treat every government/insurer connector as blocked until external evidence exists.
6. Require real integration, migration, restore, concurrency, authorization, and security tests before a production claim.

## 2. Repository facts verified from the snapshot

- ~598 files in the supplied working tree.
- 68 MySQL/Drizzle tables in `drizzle/schema.ts`.
- 41 SQL migration files in the supplied snapshot.
- 12 router modules under `server/routers`.
- ~165 rough tRPC query/mutation declarations across server TypeScript.
- 124 test/spec files across server/client/e2e in this snapshot.
- 132 filesystem entries under `docs`.
- `erp.ts` is ~841 lines and is a concentration point for unrelated domains.
- The migrations contain **zero literal `FOREIGN KEY` / `REFERENCES` clauses**. Application-level scope checks therefore carry a large share of integrity responsibility.
- Three committed `.tmp-*` scripts were found in the snapshot; they are development artifacts and should not remain in source control.

## 3. P0 — must be closed before production

### P0.1 Database referential integrity

**Finding:** core tables are linked by integer IDs but the migration set contains no SQL foreign-key constraints.

**Risk:** orphaned records, cross-entity corruption, broken cascade semantics, and difficult forensic reconstruction after an application bug.

**Required fix:** introduce a staged FK migration strategy, not a blind `ALTER TABLE`:

1. inventory orphan counts for every proposed relationship;
2. fail the migration if orphan counts are non-zero;
3. repair or quarantine orphans explicitly;
4. add FK constraints with deliberate `ON DELETE` behavior;
5. add CI schema-integrity checks;
6. repeat for new tables before production.

Do **not** use `FOREIGN_KEY_CHECKS=0` as a shortcut.

### P0.2 Accounting is not yet a full accounting engine

The repository has tax/invoice/cash-flow foundations, but production-grade accounting still requires:

- chart of accounts;
- journal headers and journal lines;
- balanced double-entry validation;
- posting rules;
- source-document linkage;
- AR/AP;
- cash drawer opening/closing and variance;
- bank reconciliation;
- COGS and inventory valuation method;
- tax-period controls;
- credit/debit note accounting;
- period close/reopen governance;
- immutable posted journals;
- correction-by-reversal rather than mutation;
- financial statement generation;
- multi-currency policy if multi-country scope is retained;
- segregation of duties for posting, approval, and closing.

**Decision:** finance UI must not be marketed as a general ledger until these controls exist.

### P0.3 Offline data boundary

The client correctly attempts to reject regulated/sensitive payloads, but the generic key-based detector is not a complete privacy proof: a sensitive value can be placed under a non-sensitive key such as `notes`.

The safest production rule is:

- regulated/clinical/insurance/payment/identity data: **never offline**;
- offline queue: explicit allowlisted schemas only;
- no generic `unknown` payload accepted for production offline persistence;
- IndexedDB only in production; localStorage fallback only for development/test;
- replay must remain online, authenticated, scoped, idempotent, and auditable.

A local patch in this working copy disables the localStorage fallback in production and keeps the preview bearer-token path development/preview-gated.

### P0.4 Production authorization verification

The API is heavily scope-aware, which is good, but the release gate still needs automated **two-identity adversarial tests** for every sensitive object family:

- user A → organization B;
- branch A → branch B;
- jurisdiction A → jurisdiction B;
- role downgrade/upgrade;
- deleted/deactivated membership;
- stale session;
- replayed mutation;
- object ID substitution;
- mass-assignment attempts.

This directly targets OWASP API risks such as BOLA, broken function-level authorization, and property-level authorization. citeturn0search0turn0search1

### P0.5 External integrations must remain fail-closed

ETA, EDA, UHIA, insurers/TPAs, government services, payment rails, and other external connectors must not be represented as live merely because a model, readiness packet, or UI exists.

For Egypt's e-invoicing, the Egyptian Tax Authority explicitly distinguishes portal issuance, registration, integration, coding, electronic signature, and mandatory rollout information. MEDORA therefore needs environment-specific integration evidence rather than a boolean `enabled` flag. citeturn0search11turn0search15

## 4. P1 — high-priority engineering corrections

### P1.1 Session storage hardening

The repository has a preview/WebView fallback that can forward a bearer token from `sessionStorage`. That is an unavoidable risk tradeoff for certain embedded-preview environments because XSS can read Web Storage.

The local hardening patch gates this fallback behind development/explicit preview configuration. Production should use the secure cookie session path only.

### P1.2 Distributed rate limiting

Current application rate limiting is process-local. It is useful defense-in-depth but is not a distributed control for multiple application instances.

Production deployment should put rate limiting at an edge/WAF or shared store, with application-level limits retained as a second layer.

Required dimensions:

- IP/network;
- authenticated subject;
- organization;
- endpoint sensitivity;
- failed authentication identity;
- upload/extraction workload;
- payment and other high-value business flows.

### P1.3 CI database lifecycle

The existing lifecycle contract can be skipped when an isolated MySQL target is absent. This creates a false sense of database coverage.

The local patch adds a real MySQL service to the isolated lifecycle job, applies repository migrations, then runs the lifecycle contract against the isolated database.

The remaining step is to execute that workflow in GitHub and treat failure as release-blocking.

### P1.4 Secret/test credential hygiene

The snapshot contained a public test-password document and committed temporary credential-generation scripts. Even if intended only for showcase use, this is poor secret hygiene.

The local patch:

- removes the three `.tmp-*` scripts;
- removes the literal showcase password from the test-account documentation;
- makes E2E use `SHOWCASE_TEST_PASSWORD` from the environment;
- makes local test defaults random per process;
- makes CI showcase credentials unique per run.

### P1.5 ERP bounded contexts

`server/routers/erp.ts` has become a concentration point for customer care, call centre, catalog, prescriptions, offline drafts, procurement-related logic, inventory-adjacent operations, and other domains.

Split into bounded contexts with shared policy primitives:

- Sales/POS
- Inventory
- Procurement
- Customer Care
- Call Centre
- Clinical/Prescription
- Catalog
- Finance
- People/Payroll

The goal is not fewer files; it is fewer implicit cross-domain invariants.

## 5. P1 — data integrity and concurrency

### Sales

Require a database transaction for the complete sale unit:

1. validate session/scope;
2. resolve authoritative product/batch prices;
3. allocate FEFO;
4. atomically decrement inventory;
5. create sale;
6. create sale items;
7. create fiscal/audit linkage;
8. commit once.

Every retry must use an idempotency key scoped to the actor/organization/business operation.

### Returns

A return must be linked to the original sale and original item. Quantity returned must be bounded by net quantity previously sold minus completed returns. Refund/credit-note accounting must be linked to the financial journal, not merely the UI status.

### Promotions

Usage-limit updates need atomic compare-and-increment semantics. Otherwise concurrent redemptions can exceed a promotion's configured limit.

### Inventory

All inventory-affecting events should use an append-only movement ledger, with current quantity treated as a derived/cacheable state. Manual quantity edits require reason, actor, approval policy, and audit event.

## 6. P1 — clinical and healthcare safety

### Prescription AI

The human confirmation gate is correct and should remain mandatory. Expand the safety model to include:

- model/version identifier;
- input hash;
- extraction confidence per field;
- pharmacist identity;
- correction history;
- final verified prescription;
- dispense event linkage;
- duplicate-prescription detection;
- expiry/cancellation;
- partial-dispense semantics;
- emergency/break-glass audit policy where applicable.

AI output must never be treated as evidence of medical truth merely because confidence is high.

### Patient identity

Never use a single identifier as the sole identity proof. Use purpose-limited retrieval, minimum necessary fields, explicit consent where applicable, and break-glass auditing.

### Clinical orders

Orders need lifecycle states, author, verifier, cancellation reason, timestamps, and explicit execution/fulfillment linkage. A stored order without lifecycle semantics is not a clinical workflow.

### GAHAR

The current GAHAR hospital standards are explicitly patient-safety and quality oriented. MEDORA should map operational controls to the applicable edition rather than claiming accreditation from software readiness alone. citeturn0search35turn0search36

## 7. P1 — finance and commercial controls

### Minimum accounting architecture

Create these bounded entities before claiming ERP accounting:

- `chart_of_accounts`
- `accounting_periods`
- `journal_entries`
- `journal_lines`
- `posting_rules`
- `payment_transactions`
- `cash_drawers`
- `cash_sessions`
- `bank_accounts`
- `bank_transactions`
- `bank_reconciliations`
- `accounts_receivable`
- `accounts_payable`
- `inventory_valuations`
- `tax_periods`
- `financial_adjustments`

All monetary values should use decimal/fixed-point arithmetic and explicit currency/scale policies. Do not use binary floating point for ledger calculations.

### Management reporting

Separate:

- operational KPI;
- management accounting;
- statutory accounting;
- tax reporting;
- investor reporting.

They may share source events, but their definitions and controls must not be conflated.

### Segregation of duties

At minimum, prevent a single user from silently performing the entire chain:

`create → approve → pay → reconcile → close`.

## 8. P1 — inventory and supply chain

Required production controls:

- batch/lot genealogy;
- expiry and quarantine states;
- recalls;
- damaged/expired disposition;
- transfer in-transit state;
- receiving discrepancy workflow;
- supplier lot traceability;
- purchase order → receipt → invoice matching;
- cold-chain sensor identity and signed readings;
- alert escalation and acknowledgement;
- inventory valuation;
- cycle counts;
- stock adjustment approvals.

FEFO allocation alone is not a complete pharmaceutical inventory-control system.

## 9. P1 — procurement

The procurement lifecycle should be:

`requisition → approval → RFQ/quote → supplier selection → PO → receipt → quality check → invoice → three-way match → payment → reconciliation`.

Every transition needs actor, timestamp, reason, and authorization.

## 10. P1 — people/payroll

Payroll foundations exist, but production payroll needs:

- employee master data;
- contracts;
- attendance source;
- leave balances;
- overtime approval;
- payroll periods;
- deductions;
- advances/loans;
- payslip generation;
- payroll journal posting;
- statutory/localization rules;
- separation/final settlement;
- access segregation.

## 11. P1 — UX / mobile / tablet / desktop

### Mobile

Optimize for:

- quick search;
- barcode scanning;
- stock lookup;
- prescription intake status;
- alerts;
- task approval;
- offline-safe drafts.

Avoid dense multi-column ERP screens.

### Tablet/POS

Optimize for:

- large touch targets;
- scanner-first input;
- keyboard/scanner compatibility;
- cart visibility;
- fast payment confirmation;
- receipt retry;
- offline/online state clarity;
- cashier session opening/closing.

### Desktop

Optimize for:

- administration;
- purchasing;
- finance;
- analytics;
- configuration;
- audit;
- bulk operations.

### Accessibility

Add automated coverage for:

- keyboard traversal;
- visible focus;
- dialog focus trapping;
- labels/descriptions;
- error association;
- RTL ordering;
- contrast;
- reduced motion;
- screen-reader names;
- touch target size.

## 12. P1 — observability / operations

Required production stack:

- structured JSON logs;
- request/correlation ID;
- actor/organization/branch context;
- error classification;
- metrics;
- traces for critical workflows;
- database health;
- queue health;
- scheduled-job health;
- integration latency/error rates;
- security-event monitoring;
- alert routing;
- retention policy;
- log redaction.

Never use raw request/response logging as a substitute for structured observability.

## 13. P1 — disaster recovery

Define and test:

- RPO;
- RTO;
- backup frequency;
- encryption;
- off-site copy;
- immutable backup policy;
- restore procedure;
- point-in-time recovery where supported;
- key/secret recovery;
- regional failure procedure;
- database migration rollback strategy;
- incident commander and escalation ownership.

A backup that has never been restored is an assumption, not a recovery capability.

## 14. P1 — security verification matrix

Use OWASP ASVS 5.0 as the application verification baseline; the current OWASP project lists ASVS 5.0.0 as stable. citeturn0search5

At minimum test:

- authentication/session;
- authorization/BOLA;
- mass assignment/property authorization;
- injection;
- file upload;
- SSRF;
- business-flow abuse;
- resource exhaustion;
- security headers;
- dependency risk;
- secrets;
- logging/redaction;
- cryptography;
- OAuth/OIDC;
- session fixation/revocation;
- CSRF/origin policy;
- Web Worker/service-worker boundaries;
- PWA cache leakage.

OWASP's API Top 10 specifically calls out authorization, unrestricted resource consumption, sensitive business flows, SSRF, security misconfiguration, inventory management, and unsafe API consumption; these map directly onto MEDORA's architecture. citeturn0search0turn0search1

For dynamic testing, an API-security testing framework can be added to CI after the application has a stable isolated environment; this should supplement, not replace, human review. citeturn0search4

## 15. P2 — architecture improvements

- Replace `erp.ts` concentration with domain modules.
- Introduce explicit application services for transactions.
- Keep policy functions pure where possible.
- Separate command and query paths for high-risk workflows.
- Add repository interfaces only where they buy testability; do not create abstraction for its own sake.
- Standardize error taxonomy.
- Standardize idempotency handling.
- Standardize audit event schema.
- Standardize correlation IDs.
- Standardize authorization context.
- Add versioned API contracts for external integrations.

## 16. P2 — product management

Create a capability ledger with exactly four states:

1. **Implemented & tested**
2. **Implemented foundation / not production integrated**
3. **Planned**
4. **Blocked by external prerequisite**

Do not use “complete” for states 2–4.

Each capability should have:

- owner;
- business outcome;
- acceptance criteria;
- operational KPI;
- security classification;
- data classification;
- regulatory dependency;
- test evidence;
- deployment dependency;
- rollback plan.

## 17. P2 — administrative governance

Establish:

- RACI for security, clinical, finance, product, operations, integrations;
- change-control board for regulated workflows;
- release approval checklist;
- incident severity matrix;
- vendor risk register;
- data-processing inventory;
- retention/deletion schedule;
- access review cadence;
- privileged-access review;
- backup restore drill cadence;
- penetration-test cadence;
- security advisory process;
- business continuity plan.

## 18. P2 — regulatory architecture

Every jurisdiction should be modeled as data, not hard-coded assumptions:

- authority;
- legal requirement;
- effective date;
- expiry/review date;
- evidence source;
- interpretation;
- implementation status;
- test case;
- accountable owner.

External regulatory claims must always link to official evidence. For Egypt, official ETA material distinguishes integration, coding, electronic signature, registration, and rollout requirements; these must be represented as separate readiness gates. citeturn0search11

## 19. P3 — quality improvements

- Add mutation contract tests for every write procedure.
- Add response-shape tests for sensitive objects.
- Add negative tests for every role.
- Add cross-tenant tests for every scoped table.
- Add property-based tests for money and quantities.
- Add concurrency tests for stock, promotions, returns, invoices, and idempotency.
- Add migration forward/backward compatibility tests where rollback is supported.
- Add snapshot-free deterministic UI tests.
- Add browser tests for offline/online transitions.
- Add performance budgets for JS bundle and critical routes.

## 20. Things deliberately NOT to “fix” without external evidence

These are not engineering failures and should stay blocked:

- government API activation without official endpoint/specification/credentials;
- insurer submission without payer contract/API and sandbox;
- real payment settlement without provider certification;
- medical claims of diagnostic accuracy for AI;
- regulatory approval claims;
- GAHAR accreditation claims;
- national medicine catalog claims when authoritative data licensing is absent;
- clinical decision automation without clinical governance;
- production PHI processing without deployment/privacy controls.

## 21. Local hardening changes made in this working copy

The following changes were made locally and are ready to be reviewed/applied:

1. Remove committed temporary credential-generation artifacts.
2. Remove the literal showcase password from documentation.
3. Make showcase E2E credentials environment-managed.
4. Make local test showcase credentials random per process.
5. Gate the Manus preview bearer-token fallback behind development/explicit preview configuration.
6. Remove persistence of the authenticated user object into `localStorage`.
7. Disable the production localStorage fallback for offline drafts; production requires IndexedDB.
8. Add an isolated MySQL service to the database lifecycle CI job.
9. Apply repository migrations in that CI job before running the lifecycle contract.
10. Pass an explicit isolated test database URL/marker to the lifecycle test.

**Important:** the GitHub connector returned HTTP 403 for repository write operations in this session. Therefore these local changes have **not** been pushed to `main`, and no claim is made that GitHub was modified.

## 22. Remaining work that cannot be truthfully marked “complete” from source review alone

- Successful CI run on the updated workflow.
- Real MySQL migration execution against a clean database.
- FK migration after orphan-data assessment.
- Full two-user adversarial authorization test matrix.
- Production-like load/concurrency test.
- External penetration test.
- DAST/API security scan against an isolated deployment.
- Backup restore drill.
- Production infrastructure/WAF review.
- Clinical safety review.
- Financial/accounting audit.
- Regulatory/legal review.
- Real ETA/EDA/UHIA/payer certification and acceptance evidence.

These are evidence gaps, not excuses. They are the boundary between “source looks strong” and “system is demonstrably production-ready.”

## 23. Release gate

Do not release as production healthcare ERP until all P0 items are green and every P1 item has either:

- objective test evidence,
- documented external dependency and blocked state,
- or a signed risk acceptance by the accountable owner.

### Recommended release sequence

**Gate A:** database integrity + migrations + authorization matrix.

**Gate B:** transactional POS/inventory/returns + accounting posting.

**Gate C:** clinical/prescription safety + PHI controls.

**Gate D:** CI/CD + observability + backup/restore + incident response.

**Gate E:** external regulatory/payment/insurance acceptance.

**Gate F:** independent penetration test and final production readiness review.

## 24. Reference standards

- OWASP ASVS 5.0.0 — application security verification baseline. citeturn0search5
- OWASP API Security Top 10 2023 — API authorization/business-flow/security baseline. citeturn0search0turn0search1
- OWASP API Security Testing Framework — candidate dynamic verification tooling. citeturn0search4
- Egyptian Tax Authority — official e-invoicing service/integration guidance. citeturn0search11turn0search15
- GAHAR — 2025 hospital accreditation standards and patient-safety framework. citeturn0search35turn0search36

---

### Bottom line

MEDORA is **far beyond a UI prototype**, but it is not honest to call it “100% complete” yet. The biggest work is now assurance engineering: database integrity, transactional correctness, accounting, adversarial authorization, production operations, and external acceptance evidence.

The local hardening work has moved several avoidable risks in the right direction. The next major engineering milestone is a **production-grade transaction + accounting + authorization test spine**, not another feature list.
