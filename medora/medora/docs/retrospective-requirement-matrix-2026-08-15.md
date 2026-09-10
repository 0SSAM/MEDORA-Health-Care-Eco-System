# MEDORA — Retrospective Requirement Matrix

**Date:** 2026-08-15  
**Purpose:** This document reconciles the comprehensive requirements previously requested for MEDORA with the current implementation evidence. It distinguishes implemented capabilities from partial foundations, intentionally deferred integrations, unverified external prerequisites, and items that require independent legal, regulatory, security, or operational validation.

> **Important scope statement:** A software implementation can provide technical controls, provenance records, audit evidence, and contractual documentation. It cannot by itself create or guarantee copyright, trademark, patent, ownership, regulatory approval, medical safety, tax approval, or legal enforceability. Those rights require appropriate registration, contracts, evidence custody, and professional advice in the relevant jurisdiction.

## Executive status

| Area | Current status | Evidence | Remaining boundary |
|---|---|---|---|
| Multi-tenant healthcare foundation | Implemented foundation | `drizzle/schema.ts`, organization/branch/jurisdiction procedures, access tests | Requires production threat modelling and tenant-isolation penetration testing |
| ERP/POS, tax invoices, returns | Implemented local foundation | `server/routers/erp.ts`, VAT/returns policies, PDF/template UI and tests | Official ETA submission remains intentionally fail-closed |
| CRM and customer care | Partial functional foundation | capability-gap report and customer-care policies | Full pipeline, campaigns, SLA analytics, omnichannel delivery, and call-centre telephony are not complete |
| Clinical/e-prescription | Implemented vertical slice | prescription contracts, pharmacist verification and patient-ID scoping | Clinical governance, formulary approval, national interoperability, and production acceptance remain external |
| Catalogs and bulk import | Implemented guarded foundation | provenance, dry-run, quarantine, idempotent import and review UI | Starter data is not a complete official Egyptian national register |
| Government and insurance connectors | Blocked by design and fail-closed | connector readiness dashboard and regulatory prerequisites | Requires official specifications, certificates, credentials, sandbox, and acceptance evidence |
| Offline and weak connection | Implemented draft-oriented foundation | `offlineQueue.ts`, offline policy, reconnect sync, conflict review | Production offline coverage needs field testing, device matrix, recovery drills, and approved local storage policy |
| Backup and restore | Operational runbook and controlled process | `docs/backup-restore-runbook-ar-en.md`, `docs/operations.md` | Provider backup facilities, key custody, restore drills, retention approvals, and RPO/RTO evidence must be established operationally |
| Legacy migration | Guarded baseline | `migration-baseline.md`, `legacy-migration-template.csv` | Source-specific adapters, data-owner signoff, full reconciliation, and staged production cutover remain required |
| Ownership/provenance | Technical evidence foundation | ownership manifest, hash, audit signing, ownership notes | Legal registration, contracts, notarisation, and independent custody remain outside the application |
| Documentation and proposal | Implemented documentation package | product description, manuals, IT/admin/owner guide, proposal, diagrams, delivery index | Each deployment must be tailored to its country, organization, approved roles, and current release |

## Requirement reconciliation

### 1. Rights, identity, and non-tampering

The project now contains a discreet product identity and provenance boundary: MEDORA naming, ownership notes, a manifest, a hash, signed audit records, release checkpoints, and a delivery index. The identity is not exposed through intrusive personal data. The relevant evidence is in `docs/ownership-notes.md`, `docs/ownership-manifest.json`, `docs/ownership-manifest.sha256`, audit-signing tests, and the release history.

The remaining work is not a claim that code can make ownership “impossible to erase.” The technically feasible controls are tamper-evident release manifests, signed audit chains, protected repository history, access separation, backup custody, watermarking or attribution in official documents, and contractual notices. The legally effective controls are registration, assignment/licence agreements, employment and contractor clauses, contributor records, and evidence preservation under professional advice.

The recommended meaning of **MEDORA** is a brand narrative rather than a false legal acronym: **MEDORA — Adaptive Healthcare, Logistics, Data, and Operations**. In Arabic, it can be presented as **ميدورا: منظومة صحية متكاملة للبيانات والعمليات والرعاية**. The phrase is a positioning explanation and should not be represented as the registered legal expansion of the mark unless the owner formally adopts and registers it.

### 2. Security and governance

Implemented controls include scoped organization access, role-gated administrative actions, internal authentication foundations, 2FA and recovery readiness, audit logging with independent signing material, rate limiting and session hardening, redaction boundaries, fail-closed regulated connectors, offline PHI restrictions, and controlled exports. The system also documents the boundaries of camera/audio monitoring and does not silently activate surveillance.

The remaining risks are real and should not be hidden: an independent penetration test has not been performed in this environment; production WAF, distributed rate limiting, managed device attestation, secure endpoint management, secret rotation operations, dependency advisory remediation, and country-specific privacy/workplace approvals require deployment-owner action. Existing reports explicitly preserve these as residual prerequisites.

### 3. Module harmony and integration

The system has shared organization, branch, jurisdiction, user, audit, catalog, prescription, sales, tax, connector, and offline-policy vocabulary. The main cross-module links are sales-to-inventory, sales-to-tax, returns-to-original-invoice, catalog-to-prescription, connector-status-to-admin-dashboard, and offline-draft-to-reconnect-sync. These links are protected by server procedures rather than UI visibility alone.

The integration review must still be read as a readiness assessment, not proof that all requested enterprise modules are complete. CRM, customer care, call-centre telephony, HR, promotion/campaign automation, advanced reports, notification delivery channels, and some supply-chain capabilities remain partial or require additional operational connectors. The capability reports are the source of truth for those boundaries.

### 4. Online, offline, and weak connectivity

The implemented model supports local drafts, queue states, reconnect-triggered upload for eligible drafts, idempotency, failure states, conflict states, manual review, and a bilingual connection/sync indicator. Regulated mutations such as official tax submission, clinical issuance, final dispensing, and sensitive financial commitments are not silently committed offline. This is intentional fail-closed behavior.

The next validation step is a field test matrix covering Android, iOS, Windows, macOS, browser storage limits, clock drift, tab suspension, abrupt power loss, duplicate reconnect events, expired sessions, tenant switching, and conflict recovery. “Works on every device regardless of capability” is not a verifiable promise; the defensible promise is a defined support matrix and graceful degradation for supported browsers and hardware.

### 5. Backup, restore, encryption, and migration

The operational runbook defines encrypted backup artifacts, key custody outside the backup file, expiry and custody logs, isolated restore first, tenant-boundary checks, audit-chain verification, business-total reconciliation, and named approval. It does not invent a backup service inside a static web client, and it does not place keys in the repository.

The migration baseline defines source mapping, normalization, validation, dry-run, quarantine, provenance, idempotency, conflict review, reconciliation, and staged cutover. A universal adapter for every legacy system cannot be safely created without source exports, schemas, field semantics, encodings, attachments, retention rules, and a data-owner decision. Those inputs remain necessary for each migration project.

### 6. Platform and performance support

The application is a responsive web project and can be accessed by modern browsers on desktop and mobile platforms. Existing work includes code splitting, lightweight UI patterns, offline drafts, responsive verification, and documented hardware boundaries. Native printer/scanner integrations, Windows 7-specific support, device management, and offline-first guarantees across arbitrary low-end hardware are not established by a browser build alone.

The practical support statement should therefore be: modern supported browsers on Windows 10/11, current macOS, and current iOS/Android versions are the target; Windows 7 is legacy and requires a separately verified browser/security posture. Field acceptance must measure page load, interaction latency, memory use, storage quota, reconnect recovery, and printing on representative devices.

### 7. Documentation and delivery

The bilingual product description, role-based manuals, IT/admin/owner guide, proposal, architecture diagrams, resilience diagram, migration template, backup/restore runbook, and delivery index have been created. The reusable skills `medora-healthcare-delivery` and `reconnect-sync-conflict-resolution` capture repeatable implementation patterns.

The documentation package must be versioned together with the release and tailored before external presentation. It must not include real credentials, patient data, private keys, or unsupported claims of government approval. The proposal should describe the system as implementation-ready for formal onboarding and integration, not already approved by EDA, ETA, UHIA, insurers, or any other authority.

## Items that can be implemented next inside the project

| Priority | Item | Safe in-project action |
|---|---|---|
| High | Ownership continuity | Add release provenance page, signed manifest verification instructions, and role-gated export of an ownership evidence bundle without personal secrets |
| High | Offline resilience | Add conflict detail view with before/after metadata, reason, retry history, and explicit user decision audit |
| High | Backup readiness | Add an administrator checklist and restore-drill record model without storing backup keys in the application |
| Medium | Migration | Add source-profile configuration and field-mapping validation around the existing dry-run importer |
| Medium | Platform support | Add a support matrix page and diagnostic export for browser, storage, network, and device capability |
| Medium | Integration harmony | Add a cross-module health page showing contract/version status, not only connector readiness |
| Medium | Documentation | Generate a release-specific manifest and archive index automatically during packaging |

## External prerequisites that cannot be completed honestly from code alone

Official government and insurer integration requires the owning authority’s contract, certificates, credentials, sandbox, security requirements, and acceptance tests. Legal ownership protection requires registration and contracts. Penetration testing requires an independent authorized assessor. Backup availability requires an approved provider, key custody, retention policy, and restore drills. Migration requires actual source exports and data-owner signoff. Device and Windows 7 support requires a defined acceptance matrix and maintained security posture. Clinical and tax operation requires the relevant professional and regulatory approvals.

## Decision

MEDORA has a substantial secure, multi-tenant, fail-closed foundation and a documented delivery package. It is appropriate to present the product as an implementation-ready platform and technical demonstration. It is not accurate to present it as universally complete, officially integrated, legally protected by software alone, clinically approved, or proven on every device and network condition. The remaining work is now clearly separated into feasible product enhancements, deployment operations, external evidence, and formal approvals.
