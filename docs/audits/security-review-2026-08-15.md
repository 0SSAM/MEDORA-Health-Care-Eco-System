# ميدورا | منظومة الرعاية الصحية المتكاملة — Security Review

**Date:** 2026-08-15

## Scope

The review covered Express request handling, browser security headers, cookie-backed mutation boundaries, authentication throttling, session cookie security, prescription upload validation, storage proxy exposure, and production dependency risk.

## Controls implemented

The server now disables the Express `X-Powered-By` fingerprint, applies defensive response headers (`nosniff`, clickjacking denial, strict referrer policy, restrictive permissions policy, cross-origin isolation boundaries, and HSTS when HTTPS is detected), prevents cross-site state-changing browser requests, and applies a bounded in-memory rate limiter to authentication and mutation paths. The limiter is a local defense-in-depth measure and does not replace an edge WAF or distributed rate limiter in multi-instance production.

Internal employee session cookies now use the shared HTTPS detection helper, remain `HttpOnly`, use `SameSite=Lax`, and are cleared with matching attributes. The storage proxy rejects traversal, control characters, malformed keys, and anonymous access to clinical prescription objects. Only the known public ALDO icon naming contract is anonymously proxied; prescription access remains through scoped server-side authorization and short-lived signed storage URLs.

Prescription intake now verifies non-empty content, the 8 MB size limit, allowed image MIME, and the file signature for JPEG, PNG, and WebP. Authorization and jurisdiction/compliance gates execute before the file policy response and before storage persistence.

The AWS S3 SDK packages were upgraded to `3.1111.0`. The previous critical `fast-xml-parser` advisory no longer appears in the production audit; the critical-level audit now exits successfully.

## Verification

The focused security and ERP tests passed, including same-origin and cross-site mutation tests, authentication throttling, defensive headers, storage-key boundaries, prescription file signatures, and the existing ERP policy suite. Final verification passed with **82 test files and 266 tests passing**, **5 optional tests skipped safely**, TypeScript passing, production build passing, and the critical-level production dependency audit exiting successfully. The high-level production audit still reports 18 high, 47 moderate, and 8 low advisories; these remain documented residual dependency work rather than silently suppressed findings.

## Residual risks and required operations

No application can be declared immune to hacking. Production still requires TLS termination with secure proxy configuration, a distributed rate limiter/WAF, centralized alerting and log retention, routine dependency scanning in CI, secret rotation, database least-privilege accounts, encrypted backups, malware scanning for uploaded clinical files, and an approved penetration test. The current `pnpm audit --prod --audit-level=high` result still reports high/moderate/low advisories that require dependency-owner review; the critical-level audit is clear after the AWS SDK upgrade. These advisories are not silently ignored or represented as resolved.

Trusted-device attestation, official regulatory connectors, and other externally blocked controls remain fail-closed until their official specifications, credentials, and isolated test environments are supplied.
