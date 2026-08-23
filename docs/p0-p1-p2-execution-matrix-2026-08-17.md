# MEDORA P0/P1/P2 Execution Matrix — 2026-08-17

## Release posture

The current baseline is technically healthy: TypeScript passes, the full Vitest suite reports **149 passing files, 482 passing tests, and 8 environment-safe skips**, and the production critical-level dependency audit reports no known vulnerabilities. The production build also completes successfully. These results establish a clean baseline but do not constitute live-tenant, physical-device, disaster-recovery, penetration-test, government-connector, or quota-bound campaign acceptance.

| Priority | Scope | Current evidence | Implementation decision | Acceptance boundary |
|---|---|---|---|---|
| P0 | Authentication, logout, tenant/branch/jurisdiction isolation, role gates | Existing auth, scope, logout, authorization, and domain contract coverage; baseline suite passing | Re-audit contracts and add targeted regression assertions for the current Policy Knowledge and AI paths; signed policy lifecycle audit events now include full scope | Live accounts and staging DB remain required for end-to-end acceptance |
| P0 | POS, inventory, procurement, accounting, backups, AI/help desk fail-closed behavior | Existing module contracts, audit records, backup manifests, AI advisory boundary, and full suite | Preserve fail-closed behavior; fix only reproducible defects found by tests/static review | Hardware, restore destination, and external connectors are not available in this sandbox |
| P1 | Policy Knowledge lifecycle and AI grounding | Implemented: scoped CRUD, draft update, review, approval, archive, approved-only retrieval, RTL workspace, signed lifecycle audit, and effective-window filtering | Strengthen role-aware UI and contract coverage; document effective-version behavior | Live admin/non-admin tenant flow remains Not tested |
| P1 | Procurement, reports, accounting attachments/inter-branch detail, approvals | Existing accounting/procurement/report modules and documented residual boundaries | Inventory current routes and add missing regression contracts where code exposes a gap | Government/tax submissions require official credentials and adapters |
| P1 | Security operations, diagnostics, backup/restore, fraud controls | Existing safe diagnostics, signed manifests, restore isolation contract, and security audit | Keep privacy-safe logging and fail-closed replay/restore; do not claim production drill | Real restore destination, WAF, centralized alerting, and penetration test remain external |
| P2 | UX, mobile, performance, hardware readiness, analytics, documentation | Existing RTL, gestures, lazy workspace loading, mobile POS, hardware readiness, analytics, and reports | Optimize only safe local code paths and improve evidence documentation | Physical Android/iPhone/HarmonyOS, printer, camera, and scanner acceptance remains external |
| P2 | Cinematic campaign | Existing MEDORA identity, Arabic script, shot plan, and previews | Preserve assets and defer full generation until quota permits | Generation quota is external and not asserted as complete |

## Execution record

The initial audit found no reproducible P0 runtime failure in the available environment. The immediate code focus was regression hardening around role-aware Policy Knowledge access and assistant grounding. The current implementation additionally writes signed, chained audit records for policy lifecycle mutations, passes full organization/branch/jurisdiction scope into lifecycle actions, and excludes policies outside their effective window from assistant retrieval. A complete verification run remains the release gate. Any item requiring production credentials, a live tenant, physical hardware, official regulatory endpoints, a WAF, or generation quota remains explicitly **Not tested**, **Blocked**, or **Deferred** rather than being simulated.

## References

1. [MEDORA cross-module integration health](cross-module-integration-health.md)
2. [MEDORA security review](audits/security-review-2026-08-15.md)
3. [Open prerequisites index](audits/open-prerequisites-index-2026-08-15.md)
4. [Backup and restore runbook](backup-restore-runbook-ar-en.md)


## Completion and hardening pass

The government integration readiness packet now includes a safe, client-side copy-summary action. It copies only redacted gate titles, evidence requirements, readiness state, next action, and the explicit no-secrets/no-external-connection limitation. It does not alter connector state, accept credentials, or submit data. TypeScript, focused connector/install tests, and the production build passed after this change. External credentials, official endpoints, live-tenant acceptance, physical hardware, and production recovery evidence remain unchanged as external gates.
