# ميدورا | منظومة الرعاية الصحية المتكاملة — نموذج العمارة والتسليم

## Chosen delivery model

The primary product is a responsive, installable Progressive Web App backed by the managed full-stack project. This gives one audited codebase that runs in modern browsers on Windows and can be installed from Safari/Chrome on iPhone and Android. The UI is mobile-first, supports keyboard and touch input, and uses the server as the source of truth for regulated operations.

| Platform | Primary use | Delivery |
|---|---|---|
| Windows | Branch desktop, POS, management, reports | Browser/PWA installation with keyboard, responsive tables, and printable fiscal documents. |
| Android | Mobile stock, manager alerts, prescription capture | Browser/PWA installation; camera/file upload is validated server-side. |
| iPhone | Manager dashboard, stock checks, prescription capture | Safari PWA installation; upload and notification support depends on device permission and deployment configuration. |

A future native wrapper can package the same web application using Capacitor if device-specific capabilities, store distribution, barcode hardware, or guaranteed native push delivery become mandatory. The wrapper is deliberately deferred until the PWA flows and backend contracts are verified; it must not create a second business-logic implementation.

## Security and data boundaries

Authentication is handled by the managed OAuth/session layer. Business procedures are protected server-side and check the user's role and branch scope. The browser never receives built-in API credentials. Files such as prescription images use the managed storage boundary; database rows store metadata and references rather than raw file bytes. Audit events are append-only from the application perspective and include a tamper-evident hash chain field rather than an unsupported claim of blockchain finality.

## Offline expectations

Read-only dashboards and locally cached drafts may remain usable during temporary network loss. Regulated mutations—sale completion, fiscal submission, inventory deduction, insurance claim submission, and payroll approval—must show an explicit pending/sync state and must not be treated as completed until the server confirms them. FEFO deduction is performed transactionally on the server to prevent double dispensing across branches or devices.

## Scheduled work

Daily inventory and expiry checks use the platform-managed Heartbeat callback under `/api/scheduled/`. The callback authenticates cron identities, locates its job by the persisted task UID, performs an idempotent scan, and targets only active branch managers for notifications. Cron creation is deployment-dependent: the project must be checkpointed and deployed before the owner creates or enables the production schedule.

## Integration readiness

EDA, ETA, MOH, NFSA, UHIA, syndicate, InstaPay, Meeza, and TPA connections are represented as explicit integration boundaries with status, request, response, and audit fields. Production connectivity requires the user's official credentials, certificates, devices, contracts, and provider endpoints. No fabricated regulatory response or payment success is used as a substitute for a live integration.
