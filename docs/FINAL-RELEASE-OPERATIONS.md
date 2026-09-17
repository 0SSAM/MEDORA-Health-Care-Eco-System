# MEDORA Final Release Operations

## Release posture

MEDORA is treated as a release candidate, not as a claim of regulatory certification. Production activation requires passing the release gates in `docs/FINAL-RELEASE-READINESS-2026-08-22.md`.

## GitHub

- Protect `main`.
- Require pull-request review for security-sensitive changes.
- Require CI before merge.
- Keep CodeQL and Dependabot enabled.
- Never commit credentials, tokens, production URLs containing sensitive parameters, patient data, or reusable test passwords.
- Use short-lived synthetic CI credentials generated per run.

## Edge / DNS

Recommended independent edge architecture:

`Internet -> Itnetic Edge -> WAF/DDoS/rate limiting/TLS -> MEDORA origin`

Do not cache PHI, prescriptions, authentication responses, POS transactions, payment responses, or other user-specific sensitive API responses at the edge. API routes must fail closed and must not depend on browser challenges.

## Origin protection

The production origin must not remain directly reachable by the public Internet after edge cutover. Restrict origin ingress to the edge's published egress ranges or an equivalent authenticated private path, and verify the origin cannot be bypassed by its direct hostname/IP.

## DNS cutover

1. Create the domain/zone at the chosen edge provider.
2. Add the edge-provided DNS records.
3. Configure TLS in strict end-to-end mode.
4. Validate the public site and `/api/` separately.
5. Verify security headers and no-store rules on sensitive routes.
6. Verify direct-origin access is blocked.
7. Only then switch production traffic.
8. Preserve a documented rollback path.

## Data safety

Offline browser storage must not become a shadow database for PHI, prescriptions, payment credentials, or regulated records. Regulated workflows remain online-only unless an explicit encrypted, conflict-aware offline design has been independently reviewed.
