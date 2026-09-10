# MEDORA — Enterprise ERP Completion Layer — 2026-09-05

This document records the enterprise ERP expansion committed to the canonical repository.

## Implemented data domains in this layer

- Financial controls: fiscal period control, AP, AR, budgeting, fixed assets and depreciation runs.
- Advanced WMS: bins, reservations, warehouse execution tasks and cycle counts.
- Quality: inspection plans/results, quality holds, nonconformance and CAPA.
- Manufacturing/MRP foundation: BOM revisions, BOM lines, work centers, routings, production orders, material moves and finished-goods receipts.
- Projects/PSA: project header, WBS-style task hierarchy, timesheets and change orders.
- CMMS: maintenance assets, preventive plans, work orders and spare-part consumption.
- Fleet: vehicles, drivers, trips and fuel logs.
- Digital commerce: storefronts, idempotent orders and order lines.
- Marketing automation foundation: campaigns, consent-aware segments and attribution.
- ESG: measurable metrics, evidence references and targets.
- Cross-module integrity: idempotency ledger and immutable workflow transition ledger.

## Safety boundary

This layer is deliberately data-first and fail-closed. It does **not** invent government, insurer, payment-provider, GPS, tax-authority, or other external connectivity. External activation still requires official contracts, credentials, sandbox/acceptance testing and human accreditation.

## Verification

Run:

```bash
DATABASE_URL="..." node scripts/verify-enterprise-erp-completion.mjs
```

The verifier checks all 43 enterprise ERP tables in `drizzle/0047_enterprise_erp_completion.sql` using `INFORMATION_SCHEMA` and exits non-zero when any table is missing.

## Completion standard

A domain should not be advertised as fully operational merely because its tables exist. The remaining engineering gate is server-side workflow wiring, authorization/scope enforcement, accounting effects, audit events, UI integration and automated tests for every high-risk transition. Existing MEDORA capability truth rules remain authoritative for that distinction.
