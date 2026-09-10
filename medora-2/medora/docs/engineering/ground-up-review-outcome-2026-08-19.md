# MEDORA Ground-Up Review Outcome — 2026-08-19

## Decision

**MEDORA does not require a wholesale rebuild.** The repository has a working React/tRPC/Drizzle architecture, explicit tenant-scoping concepts, independently testable domain rules, and a route structure that can be improved surgically. Replacing those layers would create disproportionate regression risk for healthcare workflows without evidence of an architectural failure.

The review adopted only compatible practices from the user-provided [Andrej Karpathy Skills repository](https://github.com/multica-ai/andrej-karpathy-skills): inspect the actual system first, prefer small reversible changes, keep control flow explicit, and prove behavior with focused tests plus full regression. The external repository was not imported, executed, or made a runtime dependency. MEDORA's healthcare controls take precedence where there is any conflict.

## Evidence Baseline

| Area | Evidence | Review result |
|---|---|---|
| Architecture | Client routes, shared UI, tRPC procedures, Drizzle schema, domain rules, and operational documentation were inventoried | Retain current architecture; no parallel stack or whole-app rewrite |
| Scope model | Organization, branch, jurisdiction, role, Demo/production, clinical, and advisory-AI paths were inspected | Legal jurisdiction ID `0` required explicit treatment in several paths |
| UX | Desktop and narrow-phone captures of the Home experience plus source review | Navigation, search, progressive disclosure, and RTL layout remain usable; scope labels required a safe resolved-name reuse |
| Security | Selected CRM, HR, operations, assistant, and AI-insight procedures were traced | Preserve fail-closed access and close zero-value scope gaps rather than relaxing authorization |
| Validation | Full current regression suite and production build | **206 test files: 618 passed, 8 environment-skipped; production build passed** |

## Completed Surgical Changes

1. **Secondary CRM/HR/customer-care procedures:** Scope contracts now treat jurisdiction `0` as a legal value, validate branch-to-jurisdiction assignment, and prevent the former truthiness pattern from widening data reads. HR contract and shift creation use the shared scope validator.
2. **Operations and review procedures:** Purchase, CRM, HR, and review filters now preserve an explicit jurisdiction `0` filter and reject a jurisdiction presented without a branch that can be checked.
3. **Governed AI insights:** Input contracts and facts/list filters accept a legal `0` without dropping the filter. Advisory-only output and human-review boundaries remain in force.
4. **Client scope readiness:** A small tested scope helper now distinguishes a present `0` from an absent scope. The affected workspace query gates remain unavailable when organization or branch scope is actually absent.
5. **Branch analytics and Home:** The client preserves jurisdiction `0` for analytics requests. The Home screen-capture indicator reuses its resolved, loading-safe branch label instead of recomputing a label that could become undefined.
6. **Regression fixtures:** The secondary-module role-acceptance fixture now models the mandatory branch-jurisdiction membership query rather than bypassing the new guard.

## Safety Boundaries Kept Intact

> No synthetic patient, prescription, or clinical fixture was created. The showcase remains limited to approved catalog and non-clinical sale flows. No encryption key, policy authorization, tenant boundary, clinical authorization, or AI human-review gate was bypassed.

The client helpers only decide whether a scoped query may be requested. Server authorization, organization/branch/jurisdiction membership checks, and role gates remain the source of truth. The AI assistant remains advisory-only and does not execute operational or clinical actions.

## Deferred or External Prerequisites

| Item | Status | Reason |
|---|---|---|
| MEDORA campaign video | Deferred | The user requested deferral until the video-generation quota renews; no completed film is claimed |
| Clinical UAT that needs a prescription/patient fixture | Fail-closed | Requires authorized clinical-data policy and encryption-key workflow |
| Showcase credential rotation | Controlled prerequisite | Requires an authorized replacement secret; no blind invalidation was performed |
| Build chunk optimization | Follow-up opportunity | Production build succeeds; Vite retains a non-blocking large-chunk warning for existing vendor code |

## Conclusion

The evidence supports **continued incremental improvement, not a ground-up replacement**. The review corrected concrete P0 scope defects, preserved the existing usable workflow structure, and left the project in a tested, reversible state. Future changes should follow the same order: verify the current path, make the smallest security-preserving change, add a regression contract, run the full suite, verify the relevant viewport, and checkpoint the result.
