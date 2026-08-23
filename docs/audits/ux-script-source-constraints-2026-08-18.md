# Source Constraints — Supplied UX Refactoring Script

**Source:** `/home/ubuntu/upload/سكربتux.pdf` (13 pages), received 2026-08-18.

## Non-negotiable constraints stated by the source

The requested work is a **frontend UI/UX reorganization only**. It must not delete, disable, replace, or alter any existing option, button, control, feature, workflow, business rule, operation result, user permission, API, backend endpoint, database structure, data model, authentication flow, authorization rule, or saved setting. Existing functions must remain reachable, usable, connected to the same original behavior, and produce the same result.

The source explicitly requires an interface audit before changes, including pages, screens, components, buttons, menus, modals, dropdowns, settings, tabs, user actions, element relationships, and UI states. The audit output should map each element to its current function and location, importance, proposed category, and new presentation location.

## Requested visual organization principles

1. **Primary actions:** retain the frequently needed, page-critical actions visibly on the main screen.
2. **Secondary actions:** expose less-frequent options through a clear settings or secondary-access surface; keep them easy to find.
3. **Advanced or multiple options:** group related, dense alternatives in a dropdown, accordion, More menu, advanced-options section, or context menu instead of showing all controls by default.
4. **Progressive disclosure:** show what the user needs now and reveal less common controls on demand.
5. **Clear hierarchy:** use intentional spacing, grouping, typography, icons, sections, alignment, labels, and responsive layout while preserving the existing visual identity where possible.
6. **Responsive continuity:** the reorganized interface must work on desktop, laptop, tablet, and mobile without overflow, overlap, hidden critical controls, broken navigation, popup failures, or menu failures.
7. **State preservation:** moving presentation must not reset or lose input, form values, selected values, toggles, tabs, filters, searches, or saved settings.

## Verification requirement

Before implementation, audit the existing UI. After implementation, execute regression checks covering prior buttons, menus, settings, modals, operations, forms, UI states, and navigation. If a design decision conflicts with access to an existing function, preserve the function and move or disclose it rather than removing or disabling it.

## Applicability boundary for MEDORA

The requested organization applies only where it can preserve MEDORA’s existing tenant scope, role permissions, jurisdiction safeguards, clinical and financial integrity, signed audit flows, human-review gates, logical RTL/LTR direction, and established navigation. It does not authorize changes to protected workflows or controls.
