# ميدورا | منظومة الرعاية الصحية المتكاملة — Delivery Archive Index

**Release date:** 2026-08-15

This archive contains the complete project source, dependency lockfile, database schema and migrations, server and client code, automated tests, security and regulatory documentation, operational manuals, secure account templates, and the provenance-labelled Egyptian catalog extracts that were already produced from the available source material.

## Included project

The project directory is included without `.git`, `node_modules`, or transient build output. The archive retains source code, `package.json`, `pnpm-lock.yaml`, configuration, `drizzle/` schema and migrations, `client/`, `server/`, `shared/`, `scripts/`, `docs/`, and `todo.md`. Dependencies can be restored with the pinned package manager and lockfile.

## Included security and monitoring material

The archive includes the dated security review and the anti-tampering/workplace-monitoring policy. The server policy classifies authentication, privilege/scope, record mutation, export, storage, audit-chain, clock, and configuration events; detects repeated authentication failures and high-volume access; requires human review for high and critical signals; and preserves the existing tamper-evident audit boundary.

Camera and audio monitoring are **not silently enabled**. The included contract is fail-closed and requires notice, consent or documented legal basis, purpose limitation, retention/deletion, role-scoped access, masking/minimization, incident review, verified adapter specifications, and an explicit prohibition on covert capture. A real device connector, continuous recording, trusted clock, MDM/native attestation, or country-specific workplace monitoring approval is not included and remains a release prerequisite.

## Included operational materials

The archive includes the Arabic and English operating manuals, role-access/login matrix, secure employee/admin/IT account templates, README material, and the available provenance-labelled Egyptian medicine directory extracts and reports. These are not a complete national medicine database and do not represent product registration or legal compliance without current authoritative verification.

## Verification recorded before packaging

The latest full verification passed with 83 test files passing and 1 skipped, 270 tests passing and 5 skipped safely, TypeScript passing, and the production build passing. The focused anti-tampering and monitoring suite passed. Critical-level production dependency auditing was clear after the AWS SDK upgrade; high, moderate, and low dependency advisories remain documented residual work and are not represented as resolved.

## Safe deployment note

Before production use, restore dependencies from `pnpm-lock.yaml`, provide approved secrets through secure project settings, configure TLS and a distributed edge rate limiter/WAF, use isolated non-production database testing, establish backup/retention/incident-response procedures, and obtain country-specific legal, regulatory, privacy, and workplace-monitoring approvals. Do not place real credentials, patient data, audio, or video in this archive.
