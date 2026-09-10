# MEDORA Automation & Orchestration Reorganization

**Status:** Approved for a scoped, security-preserving implementation.
**Decision date:** 2026-08-19.
**Applies to:** deterministic operational workflows only; clinical, financial, and regulated actions remain human-authorized and fail closed.

## Evidence and constraints

MEDORA already has managed, authenticated recurring callbacks for inventory alerts, scheduled reports, and backups. Reports and backups retain scope and run history, whereas the legacy `scheduled_jobs` record used by inventory alerts has no tenant scope and currently has no persisted records. The implementation must correct this inconsistency rather than introduce a second execution plane.

The installed integration configuration contains no active n8n connection. Official n8n documentation confirms that its Community edition can be self-hosted free of license charge, but production self-hosting requires durable infrastructure (recommended Docker Compose for production) and security controls such as TLS, SSO, credential-key rotation, execution-data redaction, public API restrictions, node blocking, and SSRF protection.[^n8n-hosting][^n8n-security]

[^n8n-hosting]: [n8n, *Host n8n*](https://docs.n8n.io/deploy/host-n8n/), accessed 2026-08-19.
[^n8n-security]: [n8n, *Security*](https://docs.n8n.io/deploy/host-n8n/configure-n8n/security), accessed 2026-08-19.

## Options

| Approach | Trade-offs | Cost | Setup complexity |
|---|---|---:|---|
| **MEDORA managed automation centre** | Uses the existing authenticated scheduler and keeps scope, data, audit, and UI in one protected application. It is the right default for inventory signals, reports, backups, and SLA observations. It intentionally provides no visual third-party workflow builder. | No additional per-run licensing cost | Low; no external credentials or service boundary |
| **Self-hosted n8n Community adapter** | Adds a visual integration layer for approved external systems, but requires a long-running hardened deployment, ownership of patches/backups, a secret store, and a separately audited data boundary. | Community edition license is free; durable hosting and operations still have cost | High; requires explicit infrastructure and security configuration |
| **No-code external automation provider** | Fastest to connect but creates a third-party data-processing boundary and vendor dependency; not appropriate for protected healthcare records without a formal assessment. | Usually free-tier limited or paid | Medium |

## Chosen implementation boundary

The current release will consolidate the **MEDORA managed automation centre**. It is deterministic, free to operate within the existing deployment, and keeps tenant isolation enforceable. It will add a future-facing external-adapter boundary only as documentation; no n8n endpoint, credential, connector, webhook, patient data feed, or outbound protected-data transmission is enabled.

An external orchestrator may later receive a narrow, signed, allow-listed operational event only after a separate security review. It must never be the authority for access decisions, business-state transitions, dispensing, prescriptions, money movement, clinical advice, or a human decision record. No inbound external workflow may write MEDORA records without a protected, scope-checked MEDORA procedure.

## Target operating model

| Layer | Responsibility | Explicitly excluded |
|---|---|---|
| **Configuration** | A manager enables a branch/jurisdiction-specific inventory signal scan and sees only that configuration and its safe run summary. | Cross-tenant schedules; unscoped global jobs |
| **Execution** | An authenticated recurring callback resolves its persisted scope first, evaluates only that tenant's inventory, queues only the branch's authorised managers, and records safe count-only run status. | PII-rich execution logs; autonomous orders, transfers, or notifications beyond the existing queue |
| **Observation** | The manager command centre shows schedule readiness beside inventory signals, SLA, and the human-review ledger. | Hidden control-plane pages or information for non-managers |
| **Decision** | Managers may record a reasoned, immutable review decision through the existing ledger. | Any implicit source-record mutation or automation-triggered approval |
| **External adapter (deferred)** | Optional, outbound, minimised operational events after explicit security configuration. | Clinical data, financial actions, protected data exports, unverified inbound webhooks |

## Schema and safety contract

`scheduled_jobs` becomes a scoped automation record with `organizationId`, `branchId`, `jurisdictionId`, `workflowKey`, `createdByUserId`, status/summary fields, and a unique `(organization, branch, jurisdiction, workflowKey)` constraint. The inventory workflow key is fixed to `inventory_alert_scan`. Jurisdiction `0` remains valid and is always compared explicitly.

The enable/update operation requires active organization management membership and active branch-jurisdiction membership. It creates or updates the authenticated recurring callback only after scope verification and writes a tamper-evident audit entry. The callback rejects any orphaned, inactive, unscoped, or unsupported workflow before accessing inventory. Its summary contains counts only, never product names, quantities, patient data, or decision reasons.

## Delivery gates

The release requires a non-destructive migration, source and behavior contracts for scope/authorization/idempotency/fail-closed execution, TypeScript, full Vitest, production build, desktop/mobile review, and a checkpoint. Any later n8n implementation requires a new design review, durable secure hosting, secrets configuration, outbound allow-listing, request authentication, replay protection, logging minimisation, and a human-approved rollout.
