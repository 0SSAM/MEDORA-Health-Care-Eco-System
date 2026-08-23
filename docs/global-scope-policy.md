# MEDORA Global Capability Scope Policy

## Purpose

MEDORA treats **business capabilities** and **data environments** as separate concerns. POS search, barcode and Data Matrix capture, camera fallback, held invoices, sales execution, reporting, analytics, and task-oriented navigation are system capabilities. They must be available to every authorized user whose organization, branch, jurisdiction, role, and compliance context permit the operation.

The Test account is not a feature flag. A username, password, or account label must never be used to decide whether a general capability exists.

## Showcase isolation

The `showcase` session mode and showcase organization environment are reserved for synthetic investor and tester data. They may enable self-healing synthetic fixtures, Demo catalog edits, and trial-invoice review, but they do not reduce the availability of the general POS or scanner workflows. Showcase mutations are explicitly audited and fail closed outside the showcase scope.

| Capability or data | Production authorized users | Showcase users | Required boundary |
|---|---:|---:|---|
| POS product search and stock lookup | Available when scoped and compliant | Available with synthetic fixture fallback | Organization, branch, jurisdiction, role, compliance |
| Camera, USB, Bluetooth keyboard-wedge, and manual scanning | Available in the POS workspace | Available in the POS workspace | Browser/device capability and user permission |
| Sale, hold, restore, receipt, and reporting workflows | Available when authorized | Available as isolated trial activity | Server-side scope and policy validation |
| Demo catalog editing | Not available | Available to manager/admin roles | Showcase organization and scope only |
| Trial-invoice ledger | Not available | Available within showcase scope | Showcase organization, branch, jurisdiction |
| Synthetic fixture seeding | Never | Available and idempotent | Showcase environment only |

## Engineering rule

New features must use normal protected procedures and ordinary scope checks unless they operate on synthetic Demo records. Any showcase-specific behavior must be guarded by `sessionMode` or the organization environment, not by the Test username. Regression tests in `server/global-scope.contract.test.ts` protect this distinction.
