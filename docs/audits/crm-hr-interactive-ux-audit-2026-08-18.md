# CRM and HR Interactive UX Audit — 2026-08-18

## Scope and safety boundary

This audit observes the authenticated **manager** experience in the isolated MEDORA showcase organization only. It does not create, alter, export, approve, or delete records. Findings are therefore visual and interaction observations, not a permission certification for production organizations. Any future change must remain frontend-only unless separately scoped, preserve `organizationId`, `branchId`, and `jurisdictionId` enforcement, and retain role routing, consent protections, audit evidence, and human-review gates.

## Environment observed

| Item | Observation |
|---|---|
| Account | `manager` showcase role through the supplied isolated test account |
| Scope indicator | Visible branch, organization/showcase status, and non-production banner are retained above the workflow area |
| Language direction sampled | English/LTR and Arabic/RTL desktop-width interaction samples |
| Data handling | No record was submitted, edited, approved, deleted, or exported |

> **Touch-width evidence boundary:** A 375 px visual capture of `/workspace` showed the shared home shell, primary shortcuts, and cards without visible horizontal overflow. The capture did not carry the authenticated interactive session and therefore does **not** certify CRM or HR tab behavior on a phone. The manual acceptance pack retains authenticated touch-width CRM/HR verification as a release criterion.

## CRM interaction observations

| Journey step | Observed behavior | UX assessment | Safe follow-up candidate |
|---|---|---|---|
| Find CRM from Overview | Searching `CRM` reports two results, but the visible routed entry is the broader **Operations Center** | **Needs clarification.** CRM is discoverable through search but its direct destination is not explicit at the result level | Make the CRM destination label visible in the result row; do not alter the existing route or permissions |
| Reveal sidebar | The logical LTR edge reveals the sidebar; **Operations Center** expands to three nested paths | **Works.** The card and sidebar routes agree after the sidebar is revealed | Keep nested hierarchy; strengthen active-path orientation at compact widths |
| Select customer follow-up | Operations Center presents a numbered, focused **Customer follow-up** card; selecting it reveals the CRM and consent section within the same protected workspace | **Works.** The path tells the manager what it opens and retains the showcase scope context | Add a small contextual heading or anchor for the newly opened CRM section, not a new backend route |
| Review CRM form | CRM exposes only a non-sensitive opportunity label and explicit consent-state selector; empty state is clear | **Strong safety baseline.** The UI avoids raw contact details and presents consent before creation | Group explanatory consent text closer to the selector and make the current work stream visibly selected |
| Consent safeguard | The screen states that consent withdrawal moves directly to final Do Not Contact state | **Clear policy disclosure.** No mutation was attempted | Retain copy and ensure any visual consolidation never hides this disclosure |

## Preliminary CRM conclusion

CRM is reachable through a coherent operational workflow and visibly preserves the isolated scope. The main discoverability friction is that a search for **CRM** initially presents the general Operations Center rather than a plainly labelled customer-follow-up/CRM destination. This can be improved by UI labelling and focus management only; no data model, procedure, role, consent, or tenant-scope change is indicated.

## HR interaction observations

| Journey step | Observed behavior | UX assessment | Safe follow-up candidate |
|---|---|---|---|
| Select staff tasks | The same focused Operations Center exposes **Staff tasks** as the first numbered route and as a compact workspace selector | **Consistent with CRM.** The workflow is reachable from both cards and compact controls | Add a persistent visual state for the selected work stream at dense widths; preserve the existing route |
| Review employee area | HR shows an explicitly scope-constrained employee-record area with employee number, display name, and optional department fields | **Appropriately minimal.** The sequence is understandable and avoids unrelated payroll/external-contracting detail | Group the three identity fields under a short “Employee details” heading before any later visual consolidation |
| Review empty state | The screen confirms that no employee records exist in the isolated scope | **Clear.** It distinguishes an empty protected workspace from a missing screen | Keep the empty-state explanation adjacent to the creation affordance |
| Review-inbox failure | The review inbox reports that it could not load and explicitly states that no substitute or cross-scope data is shown | **Strong fail-closed behavior.** The UI does not mask failure by displaying other-scope data | Add a non-destructive retry affordance and support reference in a future UI-only change; do not weaken the fail-closed message |
| Scope continuity | Branch, showcase, organization, jurisdiction, and non-production context remain visible while HR is selected | **Strong orientation and safety context.** No scope switch occurred during audit | Keep this context outside any collapsible HR content |

## Preliminary HR conclusion

The HR path is discoverable via a focused staff-work card and presents a deliberately narrow employee-record workflow. The observed review-inbox error fails closed, which is the correct protection posture. UX work should improve recovery guidance and the selected-work-stream cue rather than introducing fallback data, bypasses, or broader information density.

## Cross-workstream observation

CRM and HR currently use a shared Operations Center entry pattern that is coherent once the sidebar or cards are visible. At compact widths, the selected stream is less prominent than the three available routes. A future frontend-only refinement should use the existing work-stream controls as a single, visibly selected compact group; it must not remove any route or replace the contextual scope indicators.

The Arabic/RTL sample preserved the directionally correct shell, scope ribbon, branch selector, and role-authorized shortcut disclosure. The original semantic-search gap for `متابعة العملاء` was a discoverability issue, not an access-control defect: no fallback route, record, or scope boundary was bypassed.

### P0 status — resolved and verified in the isolated showcase

The existing protected Operations Center route now carries approved Arabic CRM aliases, including `متابعة العملاء`, alongside its existing English indexing. Focused unit and source-level regression tests passed, and an authenticated Arabic/RTL manager session returned a single `متابعة العملاء` result that navigated to the same Operations Center rather than a direct data surface. The route, role filter, and scope gates were unchanged.

## Source-backed tab audit

The repository also contains `client/src/components/SecondaryModulesWorkspace.tsx`, a four-tab operational workspace for CRM, HR, Call Centre, and Customer Care. Static-project search currently finds its definition but no application import. It must therefore be treated as a **candidate/latent UI surface**, not as the observed Operations Center screen, until product routing confirms it is intentionally surfaced. No regrouping should be implemented against that component alone.

| Surface | Source observation | UX implication | Non-negotiable preservation rule |
|---|---|---|---|
| Tab switcher | Four role-relevant modules are presented as equal cards, with an icon, label, and count; `active` selects the visible section | The icon/count pattern provides a viable compact navigation basis, but four equal primary actions compete with the focused Operations Center model | Preserve all four modules and the `initialTab` behaviour |
| CRM actions | Four separate forms appear concurrently: contact, opportunity, activity, and lead conversion | This is the highest density point. A staged “create / follow up / convert” grouping could reduce scanning burden | Keep every form, field, submit handler, mutation, empty state, and next-stage control reachable without a route change |
| HR actions | Three separate forms appear concurrently: contract, shift, and review; one employee ID state supports all three | The work is logically sequential but visually flat; an employee-first context then grouped records would improve orientation | Preserve field values across disclosure and tab changes; branch-required rules and all transition buttons must remain unchanged |
| State retention | Input values live in parent `useState`; changing `active` conditionally hides a section but retains the values in the mounted workspace instance | A disclosure/accordion can be added without discarding data if it does not remount the parent or reset these states | Do not move state into uncontrolled inputs or reset it when a panel closes |
| Scope and requests | `organizationId`, `branchId`, and `jurisdictionId` are built into query/mutation input, while all four list queries currently remain scope-enabled | Any UI reorganization must stay presentation-only and must not alter request inputs, mutation enablement, or branch gates | Do not relax query/mutation scope, `protectedProcedure` controls, or no-cross-scope failure behaviour |
| Failures and review | Action errors use an accessible alert; the AI recommendation badge explicitly states mandatory human review | Consolidation must not hide errors or imply autonomous execution | Preserve alert semantics and the advisory-only AI wording/gate |

## Prioritised UI-only backlog (not implemented)

| Priority | Recommendation | Rationale | Guardrail |
|---|---|---|---|
| P0 | Give the active CRM/HR work stream a persistent, textual selected state in compact Operations Center controls | Reduces uncertainty about whether the user is editing people work or customer work | No navigation, permission, or route change |
| P0 | Keep the scope ribbon visible above all CRM/HR disclosures | The observed screen makes the non-production, branch, and jurisdiction context clear | Never place it inside a collapsed panel |
| **Resolved P0** | Add approved Arabic aliases for CRM customer follow-up and HR staff tasks to the existing smart-search index | `متابعة العملاء` now returns the same protected Operations Center route in the authenticated Arabic showcase session | The implemented alias reuses the existing route, role filter, and scope gates; it adds no direct data access |
| P1 | In latent `SecondaryModulesWorkspace`, group CRM under **Create**, **Follow up**, and **Convert**, with one group open by default | Reduces four simultaneous forms while retaining each workflow | Preserve all existing inputs, mutation calls, and state values |
| P1 | In latent `SecondaryModulesWorkspace`, group HR under **Employment**, **Scheduling**, and **Performance**, after an employee context cue | Mirrors the three existing forms and shared employee ID | Keep branch-required message and action state rules visible |
| P1 | Add a retry/support recovery affordance near the review-inbox failure without fallback records | Improves recovery while preserving observed fail-closed behavior | Must never fetch or display substitute/cross-scope data |
| P2 | Validate Arabic/RTL on touch-width layouts after any presentation change | Desktop interaction now covers English/LTR and Arabic/RTL; touch-width interaction remains a release criterion | Preserve direction, focus order, touch targets, and reduced-motion behaviour |
