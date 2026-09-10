# MEDORA — Final Release Candidate Package

Date: 2026-08-22

## Purpose

This package is the consolidated engineering release candidate after the deep review. It includes the source tree available for this review, the hardening changes already applied to the working copy, the audit evidence, and the release gates.

## Changes already applied in the working copy

- Removed authentication user-info persistence from browser localStorage.
- Restricted Manus preview/session bearer fallback to development or explicit preview configuration.
- Disabled localStorage as an offline queue fallback in production; production requires IndexedDB.
- Removed repository-stored showcase password from documentation and E2E tests.
- Generate CI/test credentials dynamically instead of committing fixed credentials.
- Added an actual MySQL 8.4 service to the isolated database lifecycle CI job and run migrations before the lifecycle contract.
- Removed temporary credential-inspection/showcase scripts.
- Preserved the existing POS hardening already present in the reviewed working copy: server-authoritative pricing, atomic inventory deduction, and retry/idempotency protections.

## Critical release position

This package must be treated as a **Release Candidate**, not as proof of regulatory certification or an unconditional production-security guarantee.

The following cannot be truthfully completed by source-code changes alone and therefore remain explicit release gates:

1. Independent penetration test and remediation.
2. Production TLS/WAF/distributed rate limiting configuration.
3. Production secret provisioning, rotation, and least-privilege database credentials.
4. Verified encrypted backup and restore drill.
5. Disaster-recovery exercise with measured RPO/RTO.
6. Formal tenant/branch IDOR and authorization attack matrix in a production-like environment.
7. Government/regulatory sandbox credentials, conformance testing, and acceptance where required.
8. Clinical governance approval for prescription/clinical workflows.
9. Accounting-owner sign-off on the double-entry ledger, reconciliation, period closing, and financial reporting model before the product is represented as a full ERP accounting system.
10. Device/printer/barcode/scanner acceptance testing on the target mobile/tablet/desktop fleet.

## Architecture truth

MEDORA has a strong operational platform foundation, but a large feature surface must not be confused with complete enterprise parity. In particular, Finance should not be marketed as a full accounting ERP until the double-entry ledger, chart of accounts, AR/AP, reconciliation, COGS/inventory valuation, accounting periods, reversals, and financial statements are implemented and independently reconciled.

## Database integrity

The current schema has historically relied heavily on application-level relationship enforcement. Before production, perform an orphan-data census, repair/quarantine inconsistent rows, then introduce database-level foreign keys in staged migrations with rollback/restore verification.

## Offline safety

Offline execution is limited to workflows that can safely tolerate delayed synchronization. Regulated clinical, prescription, payment, and other high-risk actions should remain online-only unless their conflict, idempotency, audit, and reconciliation model has been independently validated.

## Verification limitation

A full automated test run could not be completed in this environment because Corepack attempted to download pnpm from the public npm registry and outbound DNS/network access was unavailable. This is an environment limitation, not evidence that the tests pass or fail.

## Release gate

Do not label this artifact “100% complete” merely because all source files are present. The correct release status is:

**Engineering Release Candidate — pending external assurance and environment-dependent gates.**

That distinction is deliberate: it prevents a visually complete product from making unsupported security, regulatory, financial, or clinical claims.
