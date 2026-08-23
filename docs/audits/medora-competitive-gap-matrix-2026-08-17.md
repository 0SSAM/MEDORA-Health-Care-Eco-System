# MEDORA Competitive Capability Gap Matrix — 2026-08-17

> **Purpose.** This is a product and implementation gap analysis, not a claim that MEDORA is certified by, interoperable with, or equivalent to any vendor named below. A capability is marked **implemented** only when there is a scoped MEDORA data model and runtime path. A vendor/API, regulator, device, payroll, payment, or clinical integration remains **externally gated** until credentials, contracts, approved specifications, staging evidence, and acceptance evidence exist.

## Evidence basis

The vendor descriptions were gathered from current vendor-owned public product pages and saved in `docs/research/erp-competitor-official-evidence-2026-08-17.md`. The MEDORA column was checked against `drizzle/schema.ts`, registered tRPC routers, the current audit, and the production codebase—not against roadmap statements.

| Reference product | Official evidence used | Comparison boundary |
|---|---|---|
| Oracle Fusion Cloud | [Oracle ERP](https://www.oracle.com/erp/), [Oracle SCM](https://www.oracle.com/scm/), [Oracle HCM](https://www.oracle.com/human-capital-management/), [Oracle Healthcare](https://www.oracle.com/health/) | Enterprise suites including global finance, supply chain, workforce and partner integrations. |
| Odoo | [Odoo Apps](https://www.odoo.com/page/all-apps), [Inventory](https://www.odoo.com/app/inventory), [Accounting](https://www.odoo.com/app/accounting), [Manufacturing](https://www.odoo.com/app/manufacturing) | Modular business applications and marketplace ecosystem. |
| Daftra / دفترة | [Daftra](https://www.daftra.com/en) | Regional business-management, accounting, sales, inventory, HR and customer-management offering. |
| SAP | [SAP ERP](https://www.sap.com/products/erp/what-is-sap-erp.html), [SAP S/4HANA](https://www.sap.com/products/erp/s4hana.html), [SAP Supply Chain](https://www.sap.com/products/scm.html), [SAP for Healthcare](https://www.sap.com/industries/healthcare.html) | Enterprise ERP, supply chain, workforce, analytics, and sector suite capabilities. |
| ارتقي | The supplied Arabic name does not resolve unambiguously to a verified ERP product with an authoritative capability catalogue. | No feature is attributed to this product until the exact vendor URL or legal product name is confirmed. |

## MEDORA baseline confirmed in code

MEDORA already has a stronger healthcare-specific baseline than a generic small-business ERP in several areas: multi-tenant organization/branch/jurisdiction scoping; role and membership checks; signed audit records; controlled demo separation; FEFO stock handling; POS, returns and shifts; suppliers, purchases and receipt records; general-ledger foundation, cost centers, fiscal periods, other expenses and inter-branch transfers; privacy-scoped patient/facility/encounter/claims data; AI advice with human review; fraud review; policy knowledge; backup manifests; and fail-closed regulatory/insurance stubs. It also has CRM, HR, call-centre and customer-care foundations.

## Capability matrix

| Capability area | Oracle / SAP | Odoo / Daftra | MEDORA today | Gap classification | Delivery decision |
|---|---|---|---|---|---|
| Cross-domain review inbox and operational work queue | Configurable workflow and approval worklists | Approval/activity task flows | Separate review states exist for procurement, expenses, returns, cash closure, leave, AI insight and fraud cases; no single human-review inbox | **P0 product gap** | Implement a scope-safe read-only unified review inbox first; it does not bypass source-module approval logic. |
| Configurable multi-step workflow designer, delegation and SLA escalations | Mature enterprise capability | Workflow/activities vary by module | Source-specific state machines, audit, and human gates; no universal workflow-definition engine | P1 architecture gap | Design after the shared inbox and permission matrix; avoid an unsafe universal “approve” action. |
| Budgeting, commitments, consolidation and planning | Extensive EPM / group close | Basic budgets vary by apps/editions | GL, fiscal period, expenses and cost centers exist; no controlled commitments, budgets or consolidation | P1 finance gap | Add budget and commitment model only after approved fiscal-policy requirements; do not infer accounting treatment. |
| Warehouse operations: locations, put-away, pick/pack, cycle count and replenishment | Advanced WMS/SCM | Inventory/WMS modules | Branch-level batches and FEFO, stock alerts, purchase and receipt basis | P1 operations gap | Extend with location-ledger and controlled stock-movement design; physical scanning/device verification stays gated. |
| Demand forecasting and replenishment optimisation | Advanced planning | Forecasting/reordering apps | Reorder points and advisory AI exist | P1 data gap | Add explainable recommendation layer after historical-data quality and review thresholds are defined. |
| Manufacturing, quality and maintenance | Full suites | MRP, quality, maintenance applications | Not implemented as a production module | P2 / sector-dependent | Defer unless MEDORA is configured for manufacturing providers; not universally appropriate to every healthcare tenant. |
| Payroll, benefits, attendance device and statutory payroll | Full HCM/payroll | Payroll varies by locale | Employee profile, shift/attendance and leave foundations; no payroll calculation or statutory filing | **P0 external/legal gate** | Do not auto-build payroll computation or filing without the target jurisdiction, legal rules, and certified payroll scope. |
| Recruitment, learning, performance and workforce planning | Mature HCM suite | HR app scope | Basic employee records and requests | P2 HR gap | Design a privacy-minimised HR extension after role and retention policies are approved. |
| Customer journey, omnichannel marketing, social, web and e-commerce | CX/commerce | Website, e-commerce, marketing apps | Consent-aware CRM, care and call-centre foundation; no storefront/marketing automation | P1 consent and integration gate | Build only opt-in, consent-controlled outreach; external email/SMS/WhatsApp APIs remain gated. |
| Supplier portal, e-procurement network and strategic sourcing | Procurement networks | Purchase and portal ecosystem | Supplier profiles, requests, purchase orders and receipts | P1 integration gap | Add auditable portal/invitation pattern after supplier identity and authentication design. |
| Document management, e-signature and retention/legal hold | Enterprise content services | Documents/sign apps | Attachment and hash foundations in selected workflows | P1 legal/retention gap | Add a scoped document ledger and human signature workflow; external qualified signature is gated. |
| BI semantic model, self-service reports and scheduled distribution | Enterprise analytics | Spreadsheets/dashboards | Operational dashboards, export and governed AI summaries; limited semantic reporting | P1 analytics gap | Expand governed report catalogue and export templates; scheduled outbound delivery is gated pending verified email policy. |
| Mobile offline work and device management | Native/mobile enterprise capabilities | Mobile/PWA support varies | PWA and operational fallback design; browser camera/scanning paths | P1 platform gap | Verify on actual Android/iOS/Harmony devices before claiming support; browser cannot guarantee screenshot prevention. |
| Healthcare interoperability, e-prescription, claims and regulatory e-invoicing | Partner/market-specific integrations | Vertical add-ons | Privacy-scoped internal records and fail-closed connector stubs | **P0 external/regulatory gate** | Retain fail-closed policy until official specifications, credentials, testing, and acceptance are documented. |
| Security, SoD, audit, risk and compliance controls | Enterprise GRC patterns | Module/edition dependent | Scope guards, signed audit, fraud review, policy controls and human gates | P1 assurance gap | Add evidence review workflows and penetration testing; certification cannot be self-asserted. |

## Prioritized implementation roadmap

| Priority | Work item | Why it is next | Safety boundary |
|---|---|---|---|
| P0 | **Unified Review Inbox** | Reduces fragmentation between existing review-required records; aligns with enterprise worklists without replacing source approvals. | Read-only aggregation; users review and act through the originating controlled workflow. |
| P0 | Permission and separation-of-duties matrix | Needed before any shared action engine. | Fail closed for missing organization, branch, jurisdiction or membership. |
| P1 | Budget/commitment controls and warehouse location ledger | Highest operational benefit for purchasing, inventory and finance. | Requires accounting policy and migration review. |
| P1 | Supplier portal + document evidence ledger | Closes procurement/document workflow gaps. | Supplier authentication and retention policy are prerequisites. |
| P1 | Governed analytics catalogue and export templates | Builds on existing dashboards and operational reporting. | No automated external distribution without a configured and approved channel. |
| P2 | Workforce suite and sector-appropriate MRP/quality/maintenance | Valuable but not universal to every tenant type. | Privacy, labor law, quality validation, and jurisdiction-specific requirements apply. |

## Explicit non-claims

MEDORA must not be represented as SAP-, Oracle-, Odoo-, Daftra-, or ارتقي-certified, as providing their third-party ecosystem, or as externally integrated merely because an internal schema exists. The table does not authorize a payment, prescription, payroll, insurance claim, regulatory submission, clinical decision, or personal-data transfer. Those actions remain subject to applicable approvals, scope enforcement, credentials, contracts, test evidence and human review.

## 2026-08-17 implementation update

The P0 **Unified Review Inbox** is now implemented as `operations.unifiedReviewInbox`. It is a protected, management-gated, scoped read model that aggregates metadata from the existing procurement-request, leave-request, cash-closure, other-expense, and inter-branch-transfer review states. It returns only source, record identifier, status, timestamp, and count; titles, reasons, amounts, patient information, and employee details are intentionally excluded. The Operations Center presents it as a read-only queue and directs every decision back to the original audited workflow; it cannot approve or reject records itself. Regression coverage verifies source classification, deterministic ordering, bounded limits, scope guard presence, and the absence of a bypass approval action.

The remaining P0 items are intentionally not labelled complete: payroll/statutory filing and healthcare/regulatory/claims integrations require a specific jurisdiction, legal authorization, official technical specifications, supplier contracts or credentials, staging evidence, and acceptance testing. They are retained as fail-closed external gates rather than simulated as production capability.
