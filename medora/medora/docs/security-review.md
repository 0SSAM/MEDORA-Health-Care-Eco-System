# Security Review — Implemented Vertical Slice

## Scope and conclusion

This review covers the implemented MEDORA Integrated Health System vertical slice: managed OAuth session handling, server-side role gates, POS discount and FEFO policy functions, prescription image intake, built-in vision extraction, pharmacist confirmation, scheduled inventory callbacks, branch-manager alert queueing, and audit hash helpers. The slice is suitable for controlled staging review after official integration credentials and branch data are configured. It is not a regulatory certification or a replacement for a production penetration test.

| Control area | Verification | Result | Remaining production action |
|---|---|---|---|
| Authentication | Protected tRPC procedures use the managed session context; logout clears the secure session cookie. | Pass in unit coverage | Confirm OAuth redirect and session policy in production. |
| Authorization | Pharmacist mutations reject cashier access; scheduling is restricted to admin/manager; server checks are authoritative. | Pass in policy coverage | Add role-matrix integration tests for every future module. |
| Upload validation | Prescription upload accepts JPEG/PNG/WEBP data URLs only and rejects files above 8MB before storage. | Pass by input contract and server guard | Add malware scanning and content-signature validation before production. |
| Sensitive data | Prescription results remain pending review; UI does not fabricate operational KPIs; secrets are not committed. | Pass for current responses | Review provider logs and retention settings before production. |
| Error handling | Mutations return typed tRPC errors for missing records, forbidden access, invalid preconditions, unavailable database, and model failures. | Pass in current code paths | Add centralized error telemetry with redaction. |
| Auditability | Audit hash helper provides tamper-evident chaining inputs; critical regulated operations are documented as server-confirmed. | Partial | Persist an audit row for each production mutation and verify hash continuity. |
| Scheduled jobs | Heartbeat callback authenticates platform requests, scopes queued alerts to active branch managers, and deduplicates by unique key. | Pass for handler design | Configure the production schedule only after deployment and test retries. |

## Sensitive-data exposure checklist

The current UI intentionally displays dashes or empty states when database values are unavailable, rather than sample sales, inventory, patient, or insurance numbers. Prescription extraction is presented as an assistant result and is not treated as a confirmed clinical or dispensing decision. No API key, gateway secret, OAuth secret, or taxpayer certificate is embedded in client code. Before production, operators must validate that storage URLs, model prompts, server logs, and analytics do not expose prescription images or identifiable patient information beyond the approved retention policy.

## Release blockers

Production release remains blocked until official EDA/ETA/UHIA/TPA and payment credentials are supplied through the project secret manager, contracts and certificates are verified, branch/user seed data is approved, storage retention is reviewed, and an independent penetration test covers authentication, authorization, uploads, SQL access, and audit trails.
