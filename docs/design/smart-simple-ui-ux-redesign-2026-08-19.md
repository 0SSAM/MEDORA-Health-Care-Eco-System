# MEDORA Smart, Simple UI/UX Redesign

**Date:** 2026-08-19
**Scope:** Authenticated MEDORA home workspace, navigation, and workspace launch hierarchy.
**Status:** Approved for incremental implementation.

## Objective

Make the first screen explain **what the user should do next** within seconds, without removing access to authorized modules, obscuring the active operating scope, or weakening MEDORA's clinical, financial, or tenant-isolation controls.

> MEDORA is a healthcare operations command center, not a catalog of equally important cards. The interface must prioritize the current user, active scope, immediate work, and safe next action.

## Evidence from the current audit

| Area | What already works | Friction to remove |
|---|---|---|
| Arabic RTL | Direction, touch drawer, scope indicator, and mobile stacking work consistently. | Header utilities and status details consume too much of the first mobile viewport. |
| Navigation | Modules are grouped and filtered before rendering, with scoped role-aware workflow actions. | The full module inventory is visually present too early; users must process many equivalent choices. |
| Home content | Assistant, quick actions, connection state, work centre, governance, alerts, and rules are available. | Multiple large cards use similar visual weight, so urgent work does not dominate secondary system information. |
| Trust and safety | Scope, production/showcase mode, status, human review, and operational rules are visible. | Repeated operational copy is cognitively heavy; safety should remain visible but be progressively disclosed. |

## Experience model

The redesigned home screen uses three ordered layers:

1. **Now — one clear action:** greet the authenticated user, state the active branch/data mode, and surface the primary role-permitted action.
2. **Next — no more than three task cards:** present only the highest-frequency safe actions for that role. Extra actions remain reachable through a compact disclosure control.
3. **Monitor — quiet operational health:** show connection/synchronization and audit-sensitive readiness as compact summaries; expand detailed rails only when the user requests them.

All remaining approved workspaces continue to be accessible through search and the existing grouped drawer. Nothing is hidden from an authorized user; the visual hierarchy, not authorization, changes.

## Design rules

| Rule | Implementation constraint |
|---|---|
| Role before module | Choose primary actions from the existing role-filtered `workflowActions` and `filteredModules`; never infer permission in the client. |
| Scope is always explicit | Keep organization/branch, jurisdiction, and production/showcase state at the top, but compact it into one clear status row. |
| Progressive disclosure | Show three quick actions by default; place lower-priority actions, governance detail, and shortcut education behind deliberate expanders. |
| Safe intelligence | The assistant may guide, explain, and open support; it must retain the existing human-review statement and cannot execute controlled work. |
| Arabic-first, bilingual | Preserve `direction`, translated labels, keyboard support, logical focus order, and equivalent LTR behavior. |
| Touch-first, desktop-efficient | Keep the swipe/edge-hover drawer; primary actions must have a 44px minimum touch target and desktop hover must not be required. |
| Calm clinical command center | Use deep navy for operational assurance, teal for trusted/ready state, blue for active progress, amber/rose only for attention and risk. Avoid decorative saturation. |

## Planned interface changes

| Component | Change | Protection preserved |
|---|---|---|
| Header | Condense desktop utilities and mobile status into a scannable scope bar; keep search, language, branch switching, notifications, and shortcuts reachable. | Scope switching and session mode logic remain unchanged. |
| Home hero | Replace the large generic assistant panel with a role-aware “command” surface: greeting, current scope, one stated next step, assistant entry, and a safe-review note. | Assistant remains advisory-only; actions still route through existing protected workspaces. |
| Quick actions | Display the first three permitted contextual actions, with a compact “show all” action list for the remainder. | Action source stays `workflowActions`; no action is invented or granted client-side. |
| Operations health | Collapse network/sync detail into a dense health strip and preserve a detail expander. | Offline-draft sync, conflicts, and state indicators stay available. |
| Work centre | Render a smaller set of task-first workspace cards with explicit next steps instead of giving every module equal visual priority. | Existing module routes, lazy boundaries, filtered role access, and tenant scope remain intact. |
| Safety and governance | Move non-actionable rules and technical rails into an expandable “Safety and readiness” section. | All information remains visible on demand and is not removed from the product. |

## Acceptance criteria

- The desktop and mobile home screen make the active scope, first permitted action, and assistant entry visible without scrolling where the screen height allows.
- A role only sees modules and quick actions already permitted by the existing filtering and server authorization model.
- Arabic RTL and English LTR preserve coherent order, drawer behavior, focus, and readable typography.
- The drawer remains accessible through touch, keyboard, and existing desktop edge-hover behavior.
- The assistant wording explicitly retains its advisory and human-review boundary.
- Existing search, notifications, offline synchronization, session switching, workspace routing, and scope validation remain functional.
