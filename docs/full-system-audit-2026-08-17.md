# MEDORA Full-System Audit — 2026-08-17

## Scope

This audit reviewed repository structure, router registration, database migrations, dependency/build health, tenant and branch scope controls, sensitive-data diagnostics, critical cross-sector contracts, frontend reachability, and RTL responsive presentation.

## Verified results

| Area | Result | Evidence |
|---|---|---|
| TypeScript | Pass | `pnpm exec tsc --noEmit` completed successfully. |
| Focused regression tests | Pass | Customer-care scope tests: 2/2; safe diagnostics tests: 5/5. |
| Full Vitest | Pass | Full suite completed successfully in the audit run; no newly reproduced failure remained. |
| Production dependency audit | Pass | `pnpm audit --prod --audit-level=high`: no known vulnerabilities found. |
| Production build | Pass with non-blocking chunk warning | Vite and server bundle completed. Several vendor/application chunks exceed 500 kB and should remain a performance optimization item. |
| Desktop RTL preview | Pass | Landing/auth entry view rendered without visible overlap in the captured viewport. |
| Mobile RTL preview | Pass | 390x844 view rendered with readable hierarchy, usable entry action, and non-overlapping install banner. |

## Defects fixed during this audit

1. Customer-care task creation and satisfaction capture now verify the target case against organization, branch, and jurisdiction before writing. This prevents cross-branch or cross-jurisdiction writes through a valid case identifier.
2. Safe diagnostics now redact Bearer tokens and secret-like access fields before application-level error collection. Regression coverage was added and passes.

## Security and integration review

The reviewed secondary-module procedures use protected tRPC access, scope validation, audit events, and typed input boundaries. Existing project controls cover role gates, Demo boundaries, signed audit helpers, policy grounding, backup controls, and fail-closed external-adapter readiness. Cross-sector read summaries connect secondary modules with sales, procurement, support, customer records, policy knowledge, AI guidance, and reporting within declared scope.

## Important boundary

The preview environment's network request recorder may display request headers for its own diagnostic capture, including a mirrored preview Authorization token used by the existing Safari/iframe/WebView fallback. This is not emitted by the safe application diagnostics collector and is not an application log. Production operators should validate preview tooling access, rotate any exposed preview session, and prefer HttpOnly cookie sessions in production where supported. No application change was made to remove the deliberate preview fallback because doing so could break login in privacy-restricted WebViews.

## Remaining external or non-blocking gates

Official government, payment, telephony, messaging, printer, scanner, payroll, and live backup connectors still require real credentials, contracts, devices, or provider environments. Independent penetration testing, production restore proof, and physical-device acceptance remain external gates. The build's large-chunk warning is non-blocking but should be addressed with further route/vendor splitting before high-traffic rollout.

This report is an engineering audit record, not a regulatory certification or a claim of completed external acceptance.
