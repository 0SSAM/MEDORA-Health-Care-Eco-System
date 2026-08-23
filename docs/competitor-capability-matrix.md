# MEDORA Competitor Capability Matrix

## Purpose and evidence boundary

This matrix translates publicly advertised capabilities into independent MEDORA requirements. It is not a claim of source-code parity, legal equivalence, or verified behavior of the competing products. The requested Arabic name “فارماسيسن” is treated provisionally as **PharmaSyst** because that is the closest publicly identifiable product; the ambiguity remains open until the user supplies an official URL or brochure.

| Capability area | PharmaClick public evidence | PharmaSyst public evidence | MEDORA current state | Gap / safe integration decision |
|---|---|---|---|---|
| Point of sale | Sales invoices, returns, day and shift closing are advertised. [1] | Public LinkedIn description advertises connected POS. [2] | POS workspace, new sale, search/barcode/Data Matrix, held invoices, returns, closing entry points, server-side FEFO and discount policies. | Keep as a vertical first-sale flow; add any missing receipt/shift evidence through MEDORA contracts, not by copying UI. |
| Barcode and labels | Barcode readers, barcode/label printing, barcode printers, QR and international codes are advertised. [1] | POS is advertised but public details are limited. [2] | Camera/USB/manual/simulated scan with full raw payload preservation and Data Matrix parsing boundary. | Label printing and device integration need an explicit tested adapter; keep camera fallback and raw-payload audit. |
| Inventory and expiry | Stock balances, min/max thresholds, expiry alerts, periodic stocktaking are advertised. [1] | Stores/inventory are included in the public integrated-system description. [2] | Batch, expiry, reorder alerts, FEFO, branch analytics, isolated Demo catalog seed. | Add a complete stocktake session workflow and approval/reconciliation audit if not already persisted. |
| Purchases and suppliers | Purchase invoices, supplier/company debts, claims, purchase orders, ideal quantities and supplier profitability are advertised. [1] | Purchasing and stores are publicly included. [2] | Procurement workspace and AI purchasing review with human approval; finance/accounting foundations. | Strengthen purchase-order lifecycle, receiving, supplier balance, and approval evidence; AI must recommend, never commit automatically. |
| Customers and loyalty | Customer data, debts, discounts, transaction history, points and gifts are advertised. [1] | Customer/retail details are not sufficiently documented publicly. | Customer-care boundary plus accounting, loyalty, and memberships workspace with server scope and audit. | Add explicit sale-to-customer linkage and controlled debt/credit settlement where policy permits; never expose clinical data in POS. |
| Employees and cashier activity | Attendance, activity tracking, employee sales reports are advertised. [1] | Employees are included in the public integrated-system description. [2] | Roles, employee-management foundation, operations center, role-aware navigation and audit. | Add a verifiable shift/cashier attribution report and attendance persistence where required. |
| Multiple cashiers/devices | Multiple cashier devices in one pharmacy are advertised. [1] | Connected POS is advertised. [2] | Role/branch foundations and POS access controls exist. | Add device/session registration, cashier assignment, and conflict/idempotency tests; do not treat browser fingerprint as attestation. |
| Branches | Branch linking and branch stock visibility are advertised. [1] | Connected operational system is advertised; branch detail not publicly verified. [2] | Organization, branch, jurisdiction isolation; branch switching; branch analytics. | Maintain strict server enforcement and add transfer/replenishment workflow with approval and audit. |
| Finance and reporting | Interactive charts, P&L, Excel export, detailed reports are advertised. [1] | Accounts are included in the public description. [2] | Accounting workspace, analytics dashboards, AI insights, reporting foundations. | Add export contracts and report provenance only where data and authorization exist; no fabricated KPIs. |
| Offline behavior | PharmaClick public page exposes downloadable and online demos but does not establish regulated offline guarantees. [1] | PharmaSyst public description explicitly says online and offline. [2] | MEDORA allows limited drafts/read-only behavior and blocks regulated offline settlement until server confirmation. | Preserve MEDORA fail-closed policy; do not enable offline sales, prescriptions, invoices, or controlled operations without trusted-device and replay evidence. |
| AI | Public PharmaSyst positioning includes AI for pharmacy management. [2] | PharmaClick page evidence used here does not establish AI behavior. [1] | AI insights and purchasing review require human review; prescription extraction requires pharmacist confirmation. | Expand explainable recommendation surfaces and evidence links, but never auto-purchase, auto-dispense, or auto-modify regulated records. |
| Government and regulatory connections | Public pages do not prove ETA/MOH/EDA submission contracts. [1] [2] | MEDORA has blocked adapter boundaries and readiness checks. | Keep all government adapters blocked until official specification, credentials, endpoint, acknowledgement, retry/idempotency, and acceptance evidence exist. |
| Demo and test isolation | Public competitor pages do not provide evidence of MEDORA-style multi-tenant Demo isolation. | Same limitation. | MEDORA Demo organization, branch, jurisdiction, synthetic catalog, and non-production workflow guards. | Preserve and extend Demo fixtures only with explicit labels; never mix Demo and production records. |

## Priority integration backlog

The highest-value independent additions are a complete **cashier shift lifecycle** with opening float, active shift, cash movements, day close, variance review, and manager approval; a complete **stocktake session** with counted quantities, variance reasons, FEFO-aware reconciliation, and audit evidence; a **purchase lifecycle** from request through order, receipt, supplier balance, and approval; a **customer-linked sale and controlled credit ledger**; and **device/session-aware multi-cashier controls** with idempotency.

The second tier is exportable, provenance-labelled reports; label-printing adapter contracts; replenishment and branch-transfer workflows; and richer employee activity and attendance reports. These should be implemented only with real persisted records and server authorization.

## Blocked or evidence-dependent capabilities

A national or complete medicine database must use an authoritative source, licensing terms, refresh process, provenance, and jurisdiction mapping. ETA, EDA, MOH, insurance, payment, sensor, or other government/regulated adapters require official contracts and credentials. PharmaSyst’s “online and offline” positioning does not override MEDORA’s safer fail-closed policy for regulated mutations.

## References

[1]: https://pharmaclick.click/ "PharmaClick — نظام متكامل لإدارة الصيدليات"
[2]: https://www.linkedin.com/products/digi-360-eg-pharmasyst-pms/ "PharmaSyst PMS — LinkedIn product page"
[3]: https://www.facebook.com/pharmasyst360/ "PharmaSyst public Facebook page"
