# Internal Employee Authentication and Healthcare Traceability

## Purpose

ميدورا | منظومة الرعاية الصحية المتكاملة now distinguishes three identity paths: OAuth for the owner or platform administration, internal username/password authentication for organization employees, and a controlled demo mode without reusable credentials. These paths are intentionally not interchangeable.

## Internal employee login

An employee signs in with an organization-issued username and password. Passwords are never stored in plaintext and are never written to audit events. The server creates an opaque, revocable internal session token and stores only its hash. The session is bound server-side to the employee, organization, branch, jurisdiction, role, and permission scope.

Authentication failures use a generic response so the system does not disclose whether a username exists. Failed-attempt and lockout boundaries are recorded without recording passwords or tokens. Logout revokes the internal session and clears the dedicated internal-session cookie. A production deployment must additionally configure an isolated database lifecycle test before claiming live database coverage.

## Permission binding

Every regulated procedure must derive organization, branch, jurisdiction, and role from the verified server session or an explicitly authorized server-side context. Client-provided scope is treated as a request, never as proof. A role snapshot may be used for an individual session, but revocation and membership changes must be able to invalidate the session before any regulated mutation is accepted.

## Medicine traceability linkage

Authentication events, authorization decisions, and medicine-traceability actions share a tamper-evident audit chain. A traceability event may include the internal employee identity, organization, branch, jurisdiction, action, product or transaction reference, Data Matrix/GS1 reference when available, timestamp, and outcome. It must not include passwords, raw session tokens, patient secrets, or unnecessary clinical payloads.

The Data Matrix contract remains provenance-safe: it validates the supported GS1-style identifiers and excludes patient data from the payload. Submission to a government or supply-chain tracking service remains blocked until the official endpoint, schema, credentials, acceptance response, retry contract, and audit requirements are configured and verified.

## User experience

If an OAuth session is already active, `/login` explains that the user is in an administration session and provides a clear action to sign out and reveal the internal employee login form. This prevents accidental identity mixing while keeping the two login models discoverable.

## Explicit non-claims

This implementation does not create shared demo passwords, does not claim government tracking integration, does not treat browser storage as device attestation, and does not claim live database lifecycle execution when an isolated test database is unavailable.
