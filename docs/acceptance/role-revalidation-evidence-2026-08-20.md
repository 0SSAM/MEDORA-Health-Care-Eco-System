# MEDORA Role Revalidation Evidence — 2026-08-20

## Financial Authorization Finding and Remediation

| Field | Recorded evidence |
|---|---|
| Finding | `erp.accounting.periods` previously accepted organization membership alone, allowing pharmacist and cashier showcase sessions to read accounting-period data. |
| Risk | Accounting information could be disclosed to organization members without an authorized financial responsibility. |
| Remediation | A reusable organization-membership financial-read capability now permits only `owner`, `org_admin`, and `operations_manager` membership roles; accounting procedures invoke the guard before performing accounting reads or writes. Platform administration remains a separate privileged path. |
| Scope safety | The guard continues to resolve authorization from authoritative organization membership, preserves organization/branch/jurisdiction validation, and treats jurisdiction ID `0` as valid rather than falsy. |
| Regression coverage | `server/integration/financial-role-guard.contract.test.ts` verifies denial before data reads for pharmacist/cashier and verifies authorized access, including a scoped other-expense mutation with jurisdiction ID `0`. |

## Verification Record

| Verification | Result |
|---|---|
| Focused financial authorization contracts | Passed. |
| TypeScript | Passed with no emitted errors. |
| Full Vitest suite | Passed: 215 files, 662 tests; 9 environment-gated skips. |
| Production build | Passed; existing vendor chunk-size warning remains non-blocking. |
| Live showcase manager (`test`) | `erp.accounting.periods` returned HTTP `200` as authorized. |
| Live showcase pharmacist (`pharmacist.demo`) | `erp.accounting.periods` returned HTTP `403` with `FORBIDDEN`. |
| Live showcase cashier (`cashier.demo`) | `erp.accounting.periods` returned HTTP `403` with `FORBIDDEN`. |

## Remaining Role-Acceptance Work

The completed live revalidation covers the manager, pharmacist, and cashier sessions for POS-stock, supervisory inventory, and accounting boundaries. The role-scoped summary and task-table review continues for sales, procurement, HR, CRM, customer-care, executive, and owner workflows. No clinical data fixtures, automatic AI execution, external automation delivery, or tenant-isolation exceptions were introduced.
