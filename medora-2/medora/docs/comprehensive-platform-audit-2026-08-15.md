# MEDORA | Comprehensive Platform Audit

**Version:** 2026-08-15
**Product identity:** ميدورا | منظومة الرعاية الصحية المتكاملة — **MEDORA | Integrated Health System**
**Audit posture:** Engineering and readiness review; not a legal certification, penetration-test certificate, government approval, or proof of compliance with every country.

## Executive conclusion

MEDORA currently provides a security-focused, multi-organization healthcare and pharmacy ERP foundation. Its strongest verified areas are organization and branch scope, jurisdiction-aware policies, pharmacy POS, catalog provenance and review, electronic prescription workflow, customer care and call-centre foundations, local returns and tax-invoice foundations, notifications, audit evidence, and limited offline drafts. The repository’s own capability report correctly states that MEDORA is **not yet a complete replacement for SAP, Oracle, Dynamics, Odoo, or a full hospital information system**.[^1]

The safest product claim is therefore: **“A modular, security-first healthcare operations platform for pharmacy and branch workflows, designed for expansion through country packs and controlled integrations.”** This wording is strong, accurate, and defensible. It avoids claiming that a policy helper or navigation entry is equivalent to a complete regulated module.

## Security and ownership review

The current design uses server-authoritative authorization, organization/branch/jurisdiction checks, rate limits, security headers, protected secrets, audit records, and fail-closed regulated mutations. Audit hashes provide tamper evidence, but they do not replace access control, encryption, retention, backup, legal registration, or an officially governed ledger.[^2]

The project already includes a discreet ownership/provenance direction: the MEDORA identity, a professional attribution note, a non-secret ownership manifest, and SHA-256 verification guidance. This is appropriate because it preserves authorship without exposing the owner’s phone, email, address, photograph, or personal profiles.[^3]

| Protection | Current position | Safe interpretation | Recommended owner action |
|---|---|---|---|
| Product identity | MEDORA naming and repository records | Good provenance aid | Keep dated source archives, checkpoints, manifests, and release notes together |
| Non-secret fingerprint | Manifest hash and repository history | Evidence of continuity, not title by itself | Preserve hashes with signed release records |
| Audit integrity | Hash-linked audit records | Tamper-evident operational history | Add periodic verification report and alert on broken links |
| Access control | Server-side role and scope checks on audited paths | Strong current boundary | Extend tests whenever a new table or router is added |
| Secrets | Environment-managed, not source-controlled | Correct operational boundary | Rotate keys, document custody, and prohibit secrets in manuals |
| Legal rights | Not established by code | Requires legal instruments | Consider copyright/trademark registration, assignment terms, and reviewed licenses |

> **Important:** No technical mechanism can make authorship “impossible to delete” in every legal or operational scenario. The strongest realistic approach combines access control, tamper evidence, dated immutable releases, source archives, copyright/trademark records, and reviewed ownership agreements.

## Module harmony and integration matrix

| Domain | Evidence in current repository | Status | Integration boundary |
|---|---|---|---|
| ERP/POS | ERP router, products, batches, sales, FEFO, returns, local invoice | Implemented for current scope | Accounting, procurement, manufacturing, and full finance remain separate workstreams |
| CRM/customer care | Customer profiles, interactions, call tickets | Partial but functional foundation | Leads, pipeline, SLA analytics, and campaign automation are not complete |
| E-prescription | Doctor entry, verification, patient-scoped lookup, dispensing gates | Implemented vertical slice | Clinical record, hospital formulary, and external prescription exchange remain gated |
| Catalog | Provenance, review, bulk dry-run, conflict detection | Implemented foundation | Official national data and regulatory validation remain external prerequisites |
| Insurance | Scoped eligibility/preauthorization requests | Persisted policy-first foundation | No live payer transport, claims adjudication, remittance, or approval inference |
| Government connectors | Readiness states and fail-closed boundaries | Blocked by design | Requires official specifications, credentials, certificates, test endpoint, and acceptance evidence |
| HR/payroll | Permission vocabulary and policy references | Missing as a full module | Requires schema, lifecycle, country statutory pack, UI, and tests |
| Reports/notifications | Scoped definitions, run history, alert foundations | Partial | Delivery channels, retries, dead-letter handling, and operational ownership remain gated |
| Offline | App-shell cache and safe non-regulated draft queue | Limited and safe | Regulated transactions cannot be completed or silently replayed offline |

## Online, offline, and weak-connection behavior

MEDORA can preserve the application shell and support clearly labelled non-regulated drafts when connectivity is absent. Regulated operations such as sales, inventory deduction, prescriptions, invoices, insurance submission, payroll approval, and government submission require server confirmation.[^4] This is a deliberate safety feature, not a deficiency to hide.

For unstable or slow networks, the safe target is **resilient online operation**, not silent offline completion. The client should show connection state, keep request identifiers stable for safe retries, use bounded retry with backoff only for idempotent reads or explicitly retry-safe operations, avoid duplicate financial mutations, and preserve an auditable manual-review state after interruption. Browser storage must never be treated as device attestation.

## Backup and restore posture

The operational guide defines the database as the source of operational truth and object storage as the file boundary. Backups must be encrypted through approved provider tooling, recorded with UTC time and operator identity, restored first into an isolated environment, and reviewed before production recovery.[^5]

| Layer | Required control | Current safe position |
|---|---|---|
| Database | Encrypted provider backup, version, UTC timestamp, operator record | Procedure documented; schedule and retention require deployment configuration |
| Files | Object-storage metadata separate from file bytes | Correct boundary; restore testing must include prescriptions and logos |
| Keys | Secrets manager, key version, rotation, no source-control copy | Required and documented; custody must be assigned operationally |
| Restore | Isolated rehearsal, audit-chain verification, sensitive-table review | Required procedure; no destructive auto-restore |
| Offline copy | Encrypted export controlled by authorized operator | Should be introduced only with a documented key-custody and expiry policy |

## Legacy migration contract

Migration from any old system must be treated as a controlled import, not a direct database copy. The source must first be profiled and mapped into a canonical MEDORA import format. Sensitive and regulated records must remain quarantined until validation and human approval.

| Stage | Control |
|---|---|
| Discovery | Source system, version, schema, encoding, timezone, ownership, export rights, and data categories |
| Mapping | Canonical organization, branch, jurisdiction, catalog, customer, sale, invoice, batch, and audit fields |
| Dry-run | Row counts, missing required fields, duplicates, conflicts, unsupported values, and sample transformations |
| Quarantine | Unverified medicines, missing provenance, ambiguous customers, invalid tax records, and sensitive rows needing review |
| Commit | Signed confirmation, idempotency key, source fingerprint, operator, scope, and batch identifier |
| Reconciliation | Totals, balances, sale counts, inventory quantities, invoice numbering, and exception report |
| Rollback | Import batch isolation and compensating reversal; never destructive overwrite of production history |

## Device and performance readiness

The platform is a responsive web/PWA surface and can be tested on modern desktop Chromium/Edge, Safari on iOS, and Chrome on Android. Windows 7 is not a safe universal browser target because supported browser engines and TLS capabilities may be outdated; a managed current browser or a supported wrapper is required. Mac support is feasible through a supported browser, subject to the same release checks.

Low-end-device readiness should focus on lazy-loading non-critical modules, compact tables, bounded cache sizes, reduced animation, no large client-side datasets, responsive empty/loading/error states, and server pagination. It is not responsible to guarantee identical performance on every device without a device matrix and measured acceptance thresholds.

## Failure and release gates

“No failures or drops” cannot be honestly guaranteed. The correct engineering goal is controlled failure: no silent financial mutation, no cross-tenant response, no secret leakage, deterministic retry behavior, clear recovery state, and audit evidence. Each release must run focused tests, the full Vitest suite, TypeScript, the production build, desktop/mobile smoke checks, and a disposable isolated database lifecycle where available.[^1]

## Priority actions

The next safest engineering priorities are to add an explicit connection-state and retry contract for non-regulated drafts, create a migration intake screen based on the existing bulk-import dry-run pattern, add backup-restore rehearsal evidence, run a cross-router scope test matrix, and establish legal/provenance records outside the source code. Government, insurer, ETA, EDA, and payment connectors must remain fail-closed until official evidence exists.

## References

[^1]: [MEDORA capability gap report](capability-gap-report.md)
[^2]: [MEDORA secure healthcare delivery principles](../skills/secure-healthcare-platform-delivery/SKILL.md)
[^3]: [MEDORA ownership notes](ownership-notes.md)
[^4]: [MEDORA operations guide](operations.md)
[^5]: [MEDORA operations guide — backup and restore](operations.md#backup-and-restore)
