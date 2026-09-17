
# MEDORA Integration Review — 2026-08-15

## Connected workflows

The authenticated workspace now exposes organization-scoped workspaces for insurance requests, report definitions and runs, promotion management, and organization membership management. Each workspace calls the existing server procedure contracts rather than maintaining a parallel client-only data path.

## Scope and authorization

The selected organization comes from the authenticated membership response. Branch and jurisdiction values are passed from the localization scope only when confirmed by the existing scope provider. The UI does not invent organization, branch, or jurisdiction identifiers. Server procedures remain authoritative for membership, manager permissions, promotion statutory caps, insurance readiness, and report scheduling.

## Fail-closed boundaries

Insurance requests remain drafts unless an officially configured connector is available. Reports are not sent automatically before explicit scheduling. Promotions are created as drafts and require authorized approval. Missing scope, unavailable database responses, or failed authorization leave the relevant workspace blocked and display a safe error state. No regulatory, government, insurer, hardware, camera, or surveillance connector was activated by this review.

## Verification

TypeScript passed with no errors. Vitest passed with 86 files and 285 tests; 5 optional database tests remained safely skipped. Production build passed. Desktop and mobile workspace screenshots were reviewed. The new contract test verifies server procedure usage, absence of invented scope values, and fail-closed integration messaging.

## Remaining limitation

The application still requires official credentials, jurisdiction packs, approved connector contracts, and isolated integration test environments before any external regulatory or insurer submission can be enabled.
