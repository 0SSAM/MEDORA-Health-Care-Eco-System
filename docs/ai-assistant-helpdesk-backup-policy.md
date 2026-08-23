# MEDORA AI Assistant, Help Desk, and Backup Policy

## Delivered scope

MEDORA now exposes an **AI Assistant and Help Desk** workspace to authorized users. The assistant is scoped by organization and branch, supports Arabic and English prompts, receives the current screen context, and returns advisory guidance only. It must not claim to have contacted a government system, device, printer, or external service. Sensitive execution remains behind existing workflows and human confirmation.

The Help Desk creates and lists tenant-scoped tickets with subject, description, priority, channel, status, and creator identity. Safe diagnostics remain privacy-aware and do not expose request bodies or raw stack traces to the assistant.

MEDORA now exposes a **Backup Management** workspace for administrators and managers. Policies support Online storage and controlled Offline export references, retention days, platform-managed encryption mode, cron frequency, manual execution, idempotency keys, run status, record count, manifest key, and SHA-256 integrity metadata. Manifest metadata is stored through the approved storage helper; database rows do not contain file bytes.

## Recommended production frequencies

| Data class | Recommended cadence | Retention | Rationale |
|---|---:|---:|---|
| Financial, POS, procurement, inventory, audit metadata | Daily at 02:00 plus a manual pre-close run | 30–90 days | Balances recovery cost and operational load |
| High-volume transactional changes | Hourly incremental strategy when the approved provider supports it | 7–30 days | Reduces maximum tolerable data loss |
| Full organization/branch snapshot | Weekly | 12–52 weeks | Supports longer-term recovery and audit needs |
| Offline export | Weekly or after a major close, with an offline operator-controlled handoff | Per policy | Protects against online account or storage compromise |
| Restore drill | Monthly in a non-production environment | Evidence retained | A backup is not considered reliable until restoration is demonstrated |

The exact cadence should be approved by the organization’s recovery point objective (RPO) and recovery time objective (RTO). Creating a policy does not itself prove that a provider has completed a physical offline export; the run history and external custody evidence must be retained.

## Security and recovery controls

Backups are tenant- and branch-scoped. Scheduled callbacks are cron-only, authenticated, repeat-safe, and linked to a policy task identifier. Each run writes a signed/integrity-verifiable manifest, records a SHA-256 digest, and records a failure status instead of silently reporting success. Restore operations must be performed into an isolated target first, with scope checks, operator approval, integrity verification, and a documented rollback plan.

Offline means a controlled export or external custody workflow, not browser access to USB or Bluetooth. The browser must not be treated as a trusted backup appliance. Production deployment should pair the application policy with the approved storage provider’s versioning, access logging, encryption-at-rest, retention lock, and disaster-recovery controls.

## Current validation

TypeScript passed. Production build passed. Full test suite passed with **147 test files and 476 tests**, with 8 environment-scoped skips. The focused assistant/backup contract passed 4/4 tests. The remaining acceptance boundary is operational: an administrator must create a policy in the UI, observe a verified run, and perform a restore drill in an isolated environment before treating the organization’s RPO/RTO as proven.
