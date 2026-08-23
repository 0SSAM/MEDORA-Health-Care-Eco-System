# MEDORA UX Script — Implementation Map

**Source:** user-supplied attachment `/home/ubuntu/upload/سكربتux.pdf` (13 pages), reviewed on 2026-08-18.

## Non-negotiable constraints from the script

The requested work is **UI/UX refactoring only**. It must not delete, disable, replace, or change the behavior of any existing option, control, feature, workflow, business rule, data model, API, backend service, authorization rule, authentication mechanism, or user-result. A control may be moved, grouped, or progressively disclosed only if it remains reachable, usable, state-safe, and linked to the same action.

For MEDORA, this also means that organization, branch, jurisdiction, role, demo/showcase, signed-audit, tax/ETA, AI human-review, and external-connector fail-closed rules are immutable during this UX pass.

## Required UX outcomes

| Script requirement | MEDORA interpretation | Safe implementation rule | Verification evidence |
|---|---|---|---|
| Audit the complete interface before refactoring | Inventory routes, home-shell actions, side navigation, menus, dialogs, tabs, settings, and feature entry points | Do not remove an entry point until its replacement is present and tested | Route/action registry, existing acceptance contracts, source-level accessibility checks |
| Primary actions stay visible | Keep the daily, role-authorized actions on the authenticated home shell and in the contextual workspace header | Preserve current handlers and routes; only alter visual grouping/placement | Home action contracts and visual checks |
| Secondary actions move to a clear settings/access point | Keep configuration, administration, device, policy, and lower-frequency actions visible through existing navigation/settings entry points | No role expansion; maintain labels and accessibility names | Navigation contract/source scans, responsive screenshots |
| Advanced/multiple actions use progressive disclosure | Use existing menus, accordions, overflow patterns, or contextual controls for dense option groups | No hidden action may become unreachable by pointer, keyboard, touch, or RTL/LTR layout | Component tests, keyboard/touch checks, desktop/mobile screenshots |
| Do not create new functions | Do not add backend, APIs, storage, workflows, or data schema | UI-only changes; reuse routed actions and component state | Diff review, TypeScript, full test and build checks |
| Preserve state | Moving controls must not reset search, filters, forms, selected values, toggles, or tabs | Keep local state ownership and mutation/query inputs unchanged | Focused regression tests for affected components |
| Responsive, localized hierarchy | Ensure desktop, tablet, and mobile remain clear in Arabic RTL and English LTR | Use logical CSS direction and existing localization APIs; no hard-coded physical direction | Bilingual regression tests and responsive visual verification |

## Initial implementation boundary

The supplied script strongly aligns with the current MEDORA direction: a simplified role-aware home screen, clear daily workflows, a visible digital assistant, logical side navigation, and secondary workspaces preserved behind accessible navigation. The next audit will identify only **remaining density or hierarchy issues** that can be addressed using those existing patterns.

The following are explicitly excluded from this UI pass:

1. Any change to tax, invoice, prescription, dispensing, accounting, procurement, or cash-cycle logic.
2. Any change to tenant scope, role permissions, session/authentication, audit signing, or AI advisory/human-review gates.
3. Any government, insurance, telephony, device-driver, printer, scanner, or video-generation integration work.
4. Any destructive data or schema change.

## Pre-change audit checklist

- [ ] Map authenticated home actions and the navigation paths that expose every existing workspace.
- [ ] Identify dense surfaces where an existing menu, accordion, or settings access point can improve hierarchy without changing behavior.
- [ ] Confirm that any candidate action remains discoverable with mouse, keyboard, touch, screen reader label, Arabic RTL, and English LTR.
- [ ] Define a focused regression test for each changed visual grouping before implementation.
- [ ] Run type, complete test, production build, desktop, and mobile checks after implementation.

## Source note

The source document’s governing rule is: **reorganize, group, hide secondary options, use settings/dropdowns, and improve visual hierarchy; never delete, disable, break, remove, or alter existing functionality or business logic.**

## Implemented UX evidence — 2026-08-18

The initial refactoring pass was intentionally constrained to the highest-density, lowest-risk UI entry points identified in the audit. It made no server, schema, procedure, authorization, tenant-scope, audit, billing, tax/ETA, or AI-review change.

| Surface | Primary layer retained | Secondary / advanced layer | Functional preservation evidence |
|---|---|---|---|
| Authenticated overview quick start | The first three role-authorized shortcuts remain immediately visible. The digital-assistant call-to-action remains separate and prominent. | Any further role-authorized shortcut is exposed in a native keyboard- and touch-operable disclosure panel with localized Arabic/English copy. | Each disclosed shortcut invokes the existing `activateShortcut(shortcut.module)` handler. |
| Contextual workspace guidance | The first three next-step actions remain visible for the active workspace. | Any remaining workflow action appears in a localized disclosure panel with its original index preserved. | Disclosed actions invoke `activateWorkflow(activeModule.id, index + 3)` so the original target action is retained. |
| POS entry header | The sale title, protected branch scope, product search, basket, and settlement controls remain unchanged. | Camera scan, simulated scan, and held invoices are grouped under one localized native sale-tools disclosure control. | The existing camera, simulation, and held-invoice state setters are unchanged; no scanner, invoice, receipt, or scope behavior was altered. |

### Regression and visual verification record

The refactoring adds `client/src/pages/Home.progressive-actions.test.ts` and `client/src/components/PointOfSaleWorkspace.progressive-tools.test.ts`. Together they assert that the primary cap never deletes access to later actions, that disclosed workflow actions preserve their original action indices, and that each POS utility remains reachable.

The focused suite passed **5/5 tests**. TypeScript passed with `pnpm tsc --noEmit`; the final full Vitest suite passed **577 tests in 188 files**, with **8 expected environment-gated skips**; and the production build completed successfully. Desktop and 375 px mobile screenshots were captured for the authenticated sales view and public entry view. The production build retains its pre-existing non-blocking chunk-size warning.

### Remaining safe follow-up scope

The audit confirmed that `DashboardLayout` already groups navigation by role and preserves the user’s existing touch/edge and desktop-hover behaviors. The follow-up manual acceptance pack is documented in [Manual UX Acceptance Scenarios](../acceptance/manual-ux-acceptance-scenarios-2026-08-18.md), while the non-mutating interactive CRM/HR findings and UI-only backlog are documented in [CRM and HR Interactive UX Audit](./crm-hr-interactive-ux-audit-2026-08-18.md). The focused Arabic search P0 is now resolved: `متابعة العملاء` is an approved alias of the existing protected Operations Center index, verified by regression tests and an authenticated Arabic manager session. The newer [Multilingual Tolerant Smart Search record](./multilingual-tolerant-search-2026-08-18.md) defines bounded Arabic/English keyboard-layout recovery plus exact, prefix, contains, and minor-typo matching without extending the authorised action catalogue.

The actual-session record is documented in [Manual UX Acceptance Execution](../acceptance/manual-ux-acceptance-execution-2026-08-18.md). It records partial non-destructive execution with the available manager showcase account and explicitly keeps pharmacist and cashier acceptance pending until independently scoped, authorized display identities are provisioned; no account, role, or operational data was created or altered to simulate that evidence.

The component-specific audit established that `SecondaryModulesWorkspace` is a dense candidate surface with state-sensitive CRM and HR forms, but static project search does not currently find it imported into an application route. It was therefore **not refactored**. Any later adjustment must first confirm intended product routing, then add a focused regression test before modifying a tab, form, filter, or role-bound action. No accessibility or functional regression was introduced by leaving the candidate component unchanged.
