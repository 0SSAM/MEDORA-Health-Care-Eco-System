# MEDORA — Capability Truth Map

> Engineering truth, not marketing inventory. A capability is **Implemented** only when the repository contains a persisted data model and executable server-side business logic for the workflow. A screen, route, mock value, or static card alone is **UI-only**.

## Executive classification

| Domain | Current evidence | Status | Main gap to enterprise-complete |
|---|---|---|---|
| Authentication / internal access | Internal credentials, lockout, scoped sessions, audit events | Implemented | MFA/recovery and enterprise IdP remain deferred |
| Multi-tenant / organization / branch scope | Organization memberships, branch users, jurisdiction checks | Implemented | More automated policy tests and administration UX |
| ERP core | `erp` router plus persisted operational entities | Implemented / Partial | Cross-module transaction orchestration must continue to expand |
| Finance / accounting | COA, journal posting, trial balance, cash position, payment posting | Implemented | AP/AR, fixed assets, fiscal controls and financial statements need full workflow coverage |
| Procurement / purchasing | Procurement and purchasing routers, persisted purchase orders | Implemented / Partial | RFQ lifecycle, vendor scoring, 3-way matching and approval chains need end-to-end verification |
| Supply / inventory | Warehouses, catalog, batches, transfers, FEFO, stock operations | Implemented / Partial | Full WMS/bin execution, cycle counts and planning are not proven end-to-end |
| Sales / POS | Sales, sale items, held invoices, cashier shifts, returns, promotions, loyalty | Implemented / Partial | Offline conflict resolution, richer pricing/commission rules and complete sales-to-GL reconciliation |
| Pharmacy / dispensing | Prescription, dispensing, FEFO, pharmacist/clinician policy gates | Implemented / Partial | Full clinical safety workflow and external interoperability remain incomplete |
| CRM / customer care | Contacts, opportunities, activities, cases, tickets, calls | Implemented / Partial | Campaign automation, service SLAs and omnichannel provider integrations |
| HR / attendance | Employee profiles, contracts, shifts, attendance/mobile attendance | Implemented / Partial | Full payroll engine, benefits, recruitment and performance lifecycle |
| Delivery / logistics | Delivery router and operational records | Implemented / Partial | Route optimization, live GPS and complete fleet economics |
| Compliance / governance | Compliance center, readiness registry, audit hashing, AI governance | Implemented / Partial | External regulatory activation is intentionally blocked pending real accreditation |
| Reporting / BI | KPI dashboard, reports, AI insights | Implemented / Partial | Ad-hoc semantic reporting, drill-through lineage and predictive models |
| AI | AI review, governance, insights, assistant | Implemented / Partial | Production model governance, evaluation, cost controls and domain validation |
| Government integrations | Readiness packet and fail-closed connector registry | **Not externally active by design** | Official endpoint contracts, credentials, sandbox and acceptance testing |
| Insurance | Internal insurance workflows exist | Implemented / Partial | Payer-specific eligibility/claims integrations and reconciliation |
| Manufacturing / MRP | No verified production/BOM/routing workflow found in the reviewed server surface | Missing | BOM, MRP, work centers, production orders, costing, shop-floor/QC |
| Projects / PSA | No verified WBS/timesheet/billing workflow found in the reviewed server surface | Missing | WBS, resources, budgets, timesheets, milestones, change orders, billing |
| CMMS / maintenance | No verified end-to-end asset maintenance workflow found in reviewed router surface | Missing | Asset register, preventive/corrective work orders, parts, MTBF/MTTR |
| Fleet management | Delivery exists, but a complete fleet domain was not proven | Missing / Partial | Vehicles, drivers, documents, fuel, trips, GPS, fleet costing |
| Quality management | Compliance/QC hooks exist, but standalone QMS lifecycle is not proven | Partial | Nonconformance, CAPA, inspections, sampling, quality holds and release |
| Advanced WMS | Warehouse/inventory exists, but a full WMS execution layer is not proven | Partial | Bin tasks, wave/pick/pack/put-away, mobile scanning, cycle counts |
| E-commerce | No verified full storefront/order synchronization workflow | Missing | Catalog publication, carts, checkout, order sync, fulfillment |
| Marketing automation | No verified campaign/segmentation/automation engine | Missing | Segments, campaigns, journeys, attribution, consent |
| EPM / budgeting | Finance primitives exist, but full planning/budget-control lifecycle is not proven | Partial | Budgets, forecasts, variance controls and management planning |
| ESG | No verified ESG data model/workflow | Missing | Metrics, evidence, targets, reporting |

## What counts as UI-only

The audit rule is deliberately strict:

1. **Route exists** ≠ capability exists.
2. **React form exists** ≠ transaction exists.
3. **Static dashboard numbers** ≠ analytics pipeline.
4. **A router procedure that only returns constants** ≠ operational integration.
5. **A readiness/blocked state** is valid business logic when it deliberately prevents unsafe external activation; it must not be represented as an active integration.

## High-value missing work

### P0 — ERP transaction integrity

- Complete finance subledgers (AP/AR), fiscal periods, closing controls and financial statements.
- Make every operational document expose an explicit accounting effect or an explicit `no-posting` state.
- Add idempotency keys to high-risk create/post operations.
- Add immutable audit linkage for critical state transitions.

### P0 — Inventory / WMS execution

- Bin-level stock ledger.
- Reservation/allocation lifecycle.
- Pick → pack → ship and put-away tasks.
- Cycle counting and variance approval.
- Lot/serial traceability from receipt through sale/dispense/return.

### P0 — Quality and regulated release

- Inspection plans and inspection results.
- Quarantine/quality-hold state.
- Nonconformance and CAPA.
- Controlled release to available inventory.

### P1 — Manufacturing / MRP

- BOM revisions and effectivity.
- MRP demand/supply netting.
- Work centers and routings.
- Production orders and material consumption.
- Finished-goods receipt and production costing.

### P1 — Projects / PSA

- WBS and milestones.
- Resource allocation and timesheets.
- Budget vs actual.
- Change orders.
- Time/material billing.

### P1 — CMMS / Fleet

- Asset register and maintenance plans.
- Work orders and spare-parts consumption.
- Vehicle/driver/trip lifecycle.
- Fuel and fleet cost ledger.

### P1 — Digital commerce and marketing

- Ecommerce order boundary.
- Promotion/loyalty integration with sales.
- Consent-aware campaigns and attribution.

## Visual truth

The application already has a centralized Tailwind token layer and responsive primitives, but the reviewed stylesheet also contains legacy **ALDO** naming and branding artifacts. Those are visual/maintainability debt because they expose a previous product identity in a MEDORA codebase.

The visual target for the product is now defined as:

- Premium enterprise healthcare.
- Silver/graphite neutrals with restrained cyan/blue accents.
- High information density without visual clutter.
- Consistent card, table, form, status, empty-state and loading language.
- Arabic RTL and English LTR treated as first-class layouts, not mirrored afterthoughts.
- Motion is purposeful and respects `prefers-reduced-motion`.
- No fake metrics, fake integrations or decorative UI that implies unavailable business capability.

## Verification policy

Before calling a module complete, verify all of:

- Persisted schema exists.
- Server mutation/query exists.
- Authorization/scope checks exist.
- Business invariants are enforced server-side.
- Audit event exists for critical mutations.
- UI is connected to the real procedure.
- Error/loading/empty states are intentional.
- Automated tests cover the highest-risk transitions.
- Build/typecheck/test pass.

This document is the baseline for future MEDORA capability claims.