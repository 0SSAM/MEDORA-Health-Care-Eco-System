# MEDORA Cross-Module Integration Health

## Shared contract chain

| From | To | Shared contract | Safe failure condition |
|---|---|---|---|
| Organization / branch / jurisdiction | Every business module | Tenant and jurisdiction scope | Reject missing or mismatched scope; never fall back to a global tenant |
| Catalog | Sales / inventory / prescriptions | Item identity, provenance, unit, barcode, review state | Do not promote quarantined or unreviewed records into regulated workflows |
| Sales | Tax invoice / returns | Original invoice, line identity, quantities, VAT result, correction reference | Reject duplicate returns, invalid quantities, and unissued invoice export |
| Prescription | Pharmacy dispensing | Patient scope, verification state, remaining quantity, pharmacist action | Keep pending verification unavailable for dispensing |
| Connector readiness | Government / insurer workflows | Provider, jurisdiction, readiness, expiry, credential prerequisites | Show closed/fail-closed; do not make live calls without formal prerequisites |
| Offline queue | Server replay | Idempotency key, draft type, tenant scope, device/session trust | Keep failed/conflicting drafts visible; do not auto-resolve conflicts |
| Audit service | Sensitive mutations | Actor, scope, action, reason, previous/new state, signed record | Reject or flag mutation if audit recording cannot be completed |
| Backup / restore | Operations | Manifest, encryption, key reference, restore drill, reconciliation | Restore into isolation first; do not overwrite production blindly |

## Release review questions

Before a release, the reviewer should verify that every new mutation has an explicit tenant and branch scope, a role gate, an audit event, an idempotency or duplicate strategy where retries are possible, a failure state that does not silently commit, and a test covering its primary boundary. Any external connector should expose readiness and prerequisites without exposing credentials.

## Integration statuses

Use **implemented** when the server contract, UI path, tests, and failure behavior exist. Use **partial** when a vertical slice exists but important workflows, connectors, or operational evidence are missing. Use **deferred** when the feature is intentionally postponed. Use **blocked** when credentials, official specifications, sandbox access, or acceptance evidence are required. Use **unverified** when implementation exists but independent testing has not yet been completed.

## Known non-equivalences

A UI navigation item is not proof that a module is complete. A PDF export is not proof of tax-authority submission. A local catalog is not proof of an official national database. A responsive screenshot is not proof of device support. A successful unit test is not proof of a penetration test or production disaster-recovery drill. These distinctions must remain visible in release notes and proposals.
