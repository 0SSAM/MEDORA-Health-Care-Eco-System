# MEDORA Role-Based Acceptance Review — 2026-08-18

## Purpose and evidence standard

This review treats MEDORA as a multi-tenant healthcare operating system rather than a collection of screens. Each role below is evaluated through its daily outcome, permitted scope, expected evidence, exception path, and a safety boundary. A journey is only marked **verified** when a repeatable automated contract or integration test passes, supported by static route/UX evidence where relevant. A journey requiring a physical device, accredited public endpoint, external provider, or a live tenant with authorized users is marked **external gate**, not passed by assumption.

All regulated and sensitive actions must remain constrained by **organizationId + branchId + jurisdictionId**, protected procedures, signed auditing, least-privilege authorization, and human review for AI recommendations. No acceptance activity may replace these safeguards with a test-only bypass.

## Roles and journeys

| Role | Daily journeys to accept | Core evidence | Exception and safety conditions |
|---|---|---|---|
| Clinician / pharmacist | Find medication, validate prescription, consult reference information, trace a dispensed item | Prescription-consumption, drug-reference, patient-identity, and jurisdiction contracts | Do not infer diagnosis; display advisory/reference content only; reject out-of-scope clinical access |
| Cashier / sales associate | Search catalog, scan code, compose sale, suspend/resume, issue return, close cash cycle | POS stock/order, mobile POS, showcase-sale, cashier-cycle and invoice policies | Prevent negative or unavailable stock, price manipulation, unscoped sale, and invalid return workflow |
| Purchasing officer | Manage supplier, request/approve purchase flow, receive stock, inspect balances/reports | Procurement, supplier-directory, supply-chain, report-export contracts | Payment/credit controls, FEFO/stock constraints, approval lineage, no cross-branch supplier leakage |
| Finance officer | Review chart/balances, cashier close, expenses, loyalty effects, tax invoice preview/export | Accounting/loyalty, tax calculation, VAT invoice, export and audit contracts | Keep double-entry and invoice mathematics intact; government submission remains fail-closed until accredited |
| Sales / CRM officer | Customer record, lead/opportunity progression, customer care task and follow-up | Secondary modules policy/scope and sales-contact contracts | Customer records must be tenant-scoped; closure/escalation respects required state transitions |
| Customer-care / call-centre officer | Queue, SLA, ticket, callback, case resolution and satisfaction record | Secondary-modules operational and scope contracts | Prevent unauthorized ticket visibility and invalid lifecycle transitions; communications-provider integration is an external gate |
| HR / shift supervisor | Employee record, shift, leave/evaluation, account lifecycle and schedule view | Employee-management, payroll policy, employee-account and operations contracts | Payroll/legal integration is external; staff visibility and administrative actions remain scope/role guarded |
| Branch manager | Review branch analytics, inventory alerts, sales and operational exceptions, approve assigned reviews | Branch analytics, operations dashboard, unified-review-inbox contracts | View data only within permitted branch; reviews retain originating workflow and audit history |
| Executive / decision maker | Read minimal KPIs, cross-functional reports, AI insights and governance queue | Operations, AI insights/governance, reports and unified-review contracts | AI is advisory-only and requires human review; no automatic sensitive execution |
| Organization administrator | Manage organization/branch/jurisdiction, roles, configuration, backups, security and connector readiness | Organization, security, backup, connector readiness, authentication, audit contracts | Fail closed on missing accreditation; no secret disclosure; backup restore and external connectors require real environments |

## Acceptance execution batches

| Batch | Scope | Repeatable evidence to execute | Planned outcome |
|---|---|---|---|
| A — Identity and scope | authentication, role/scope propagation, showcase separation, protected entrypoints | Internal session, organization-scope, global-scope, regulated-entrypoint, security middleware suites | Confirm data separation and deny-by-default behavior |
| B — Clinical and pharmacy | reference, prescription, traceability, dispensing safety | patient identity, prescription consumption, pharmacopeia/NLM, jurisdiction, traceability and stock suites | Confirm advisory boundaries and medication safeguards |
| C — POS, sales and cashier | catalog, barcode path, demo/production sale boundaries, returns and cash close | POS workspace, mobile POS, stock-order, commit-sale, showcase sale, cashier cycle suites | Confirm sale integrity and safe test-mode separation |
| D — Procurement and finance | supplier, purchasing/receiving, loyalty, accounting, tax invoice and exports | procurement, supplier, accounting/loyalty, VAT invoice, report export/scheduling suites | Confirm financial math, workflows and approval evidence |
| E — Service workforce | CRM, customer care, call-centre, HR, employee account management | secondary-modules, employee-management, operations/workforce suites | Confirm lifecycle and branch isolation |
| F — Management and AI | dashboards, reports, review inbox, AI governance/insights and policy knowledge | operations dashboard, unified review, AI governance, policy knowledge and smart typing suites | Confirm minimal decision support and mandatory human review |
| G — Resilience and delivery | backups, PWA/offline, install, safe errors, localization, mobile/desktop UI | backup, offline, install, localization, safe error, UI regression and build checks | Confirm degraded paths and accessible RTL/LTR presentation |

## Phase two coverage findings — 2026-08-18

The initial focused acceptance batch executed **19 existing suites and 63 assertions successfully**. It covered POS sale commits and catalog evidence, mobile cashier behavior, clinical identity and prescription-consumption gates, procurement receiving rules, supplier-directory scope, VAT invoice preview/reconciliation, CRM/customer-care/call-centre policy and scope, employee access, operations dashboards, management review, policy knowledge, and showcase-scope/mobile protections. This establishes a passing code-level baseline; it does not represent device, provider, or regulatory accreditation.

To close the highest-value coverage gap, a new dynamic router-level contract, `server/integration/secondary-modules-role-acceptance.test.ts`, executed **4 assertions successfully**. It proves that an authorized CRM user can create a contact only in their active organization, branch, and jurisdiction, and that the creation produces a signed audit record. It also proves that CRM writes stop before persistence if organization membership is absent, that HR shift data is read only after organization and branch validation, and that customer-care feedback for an out-of-scope case stops before persistence.

| Role family | Automated evidence now verified | Remaining acceptance limitation | Disposition |
|---|---|---|---|
| Clinical / pharmacy | identity ambiguity, approved catalog linkage, prescription-consumption readiness, jurisdiction controls | camera/scanner permissions and actual dispensing hardware | External-device gate retained |
| Cashier / sales | valid catalog-linked commit sale, invalid catalog/jurisdiction/evidence rejection, FEFO ordering, mobile/POS route contract, cashier cycle | real printer, cash drawer, and messaging transport | External-device/provider gate retained |
| Procurement / finance | maker–approver separation, bounded receiving, over-receipt/cross-scope rejection, supplier scope, tax math, unreconciled invoice rejection | live provider, bank, and tax-authority submit/acknowledge cycle | External accreditation/provider gate retained |
| CRM / care / call centre | lifecycle policies, scope contracts, dynamic contact success/audit, denied CRM write, denied out-of-scope care feedback | live telephony/messaging and authorized operator UAT | External-provider/UAT gate retained |
| HR | account-management scope contract and dynamic branch-scoped shift read | statutory payroll execution and real HR operator UAT | External legal/UAT gate retained |
| Management / executive | branch operations aggregation, review inbox, approved policy knowledge, and human-review controls | authorized stakeholder KPI and report usability review | Controlled UAT gate retained |
| Administrator | global/showcase separation, scope switching, protected entrypoint, and security contracts | real recovery drill and connector credentials | Controlled operational gate retained |

No reproducible product defect was observed in the Phase Two batches. The only failure encountered was a test-harness import omission in the newly added test; it was corrected immediately and the focused contract then passed. The next priority is broader role-batch evidence with the new contract included, followed by full system verification. No compliance rule, tax calculation, invoice math, AI advisory boundary, or government connector state was changed.

## Phase three execution and Phase four remediation — 2026-08-18

The complete acceptance suite was executed after adding the dynamic role contract: **185 test files passed, 2 files were intentionally skipped, 571 assertions passed, and 8 assertions were intentionally skipped**. The skipped checks are explicitly environment-gated integration and managed-session probes; they retain fail-closed configuration checks and are not counted as acceptance passes. No production defect was reproduced by the full suite.

The only issue reproduced during this review was the missing explicit Vitest import in the newly added acceptance test. Because this project does not enable test globals, the suite initially failed before any assertion executed. The test now imports `beforeEach`, `describe`, `expect`, `it`, and `vi` directly from Vitest; the focused 4-assertion contract and full suite then passed. This correction is deliberately confined to test infrastructure and does not alter tenant isolation, business workflows, tax or invoice calculations, AI advice policy, or government-connector activation.

## Phase five verification and visual audit — 2026-08-18

Static verification completed successfully: `pnpm tsc --noEmit` completed without TypeScript errors, and `pnpm build` completed successfully. The production build reports a non-blocking bundle-size warning for existing large vendor chunks; this is a performance follow-up, not a failed build or a role-workflow failure.

Visual checks were captured after restarting the development service. The public entry screen correctly presents the MEDORA identity, Arabic RTL structure, secure-login entry point, and PWA install prompt. Authenticated desktop captures of `/pos`, `/operations`, and `/finance` render the minimal role-oriented overview shell with current-scope display, an explicit digital-assistant entry point, and a controlled PWA prompt. Mobile captures at 390 × 844 render the compact navigation trigger, logical RTL layout, scope indicator, readable assistant card, and dismissible install prompt without viewport overflow. These captures verify the common shell and its role entry routes; they do not substitute for real-device scanner, printer, provider, or government-endpoint acceptance.

| Verification item | Result | Evidence / limitation |
|---|---|---|
| Type safety | Passed | `pnpm tsc --noEmit` completed without errors |
| Role contracts | Passed | 185 test files / 571 assertions passed; 2 files / 8 assertions intentionally skipped by environment gates |
| Production build | Passed with advisory | Build completed; existing large-chunk warning retained for future performance work |
| Desktop role shell | Passed | `/pos`, `/operations`, and `/finance` capture the authenticated minimal overview and assistant access |
| Mobile role shell | Passed | `/pos` and `/finance` at 390 × 844 retain readable RTL layout and mobile navigation |
| Physical and external integrations | Not internally verifiable | Remain in the explicit external validation gate register below |

## External validation gates

| Gate | Reason it cannot be represented as an internal pass | Required external evidence |
|---|---|---|
| Barcode/Data Matrix camera and Bluetooth scanner | browser/device permissions and hardware transport | Android, iOS, HarmonyOS and supported scanner acceptance on representative hardware |
| Receipt printer, WhatsApp share and cash drawer | device, OS, printer driver and messaging-provider behavior | approved hardware / provider configuration and on-device test records |
| GAHAR, ETA and other government services | official credentials, accreditation and regulatory endpoint contracts | sanctioned test tenant, credentials, certificates and agency acceptance |
| payment, insurance, payroll, telephony and messaging | provider-specific credentials and legal/commercial configuration | staging provider account and provider acceptance tests |
| offline restore and disaster recovery | requires authorized storage target and full operational runbook | controlled restore drill with real, non-production encrypted backup |
| usability on actual staff workflows | requires authorized representative users and production-like records | moderated UAT with signed findings and remediation decision |

## Completion rules

1. A failing repeatable check is converted into a discrete defect with a regression test before it is fixed.
2. A feature gap is documented with a concrete role impact and implementation proposal; it is not silently represented as implemented.
3. No test fixture, showcase data, or UI change may bypass scope guards or seed real clinical/financial data.
4. Final evidence consists of TypeScript, full Vitest, production build, focused role-batch output, visual checks, and this review's explicit external-gate register.
