# MEDORA Role-Based Operational Audit Inventory

## Scope

This audit treats the application as if operated by each relevant user role and records verified workflows, defects, and external prerequisites. Testing must remain within organization, branch, jurisdiction, and Demo boundaries.

## Initial role matrix

| Role or persona | Primary workflows to verify | Evidence sources |
|---|---|---|
| Pharmacist / clinician | prescriptions, pharmacist confirmation, dispensing guard, catalog lookup, patient boundary | prescription workspaces, prescription and patient policies |
| Cashier / sales operator | POS, barcode/Data Matrix, sale preparation, FEFO, discounts, shifts, receipts, returns | PointOfSaleWorkspace, CashierCycleWorkspace, POS contracts |
| Procurement officer | purchase orders, receiving, inventory posting, supplier balances, report filters/exports | SupplyChainWorkspace, procurement router, procurement policies |
| Inventory officer | stock, batches, expiry, FEFO, stocktake/reconciliation, alerts, branch analytics | inventory workspaces, stocktake and operations policies |
| Finance officer | customer/supplier balances, credit approvals, tax/e-invoice boundaries, reports, Excel/PDF exports | finance path, procurement reports, tax invoice workspace |
| Manager / decision maker | branch dashboard, KPIs, approvals, alerts, audit, comparative reports | BranchAnalyticsDashboard, operations dashboard, approval policies |
| HR / CRM / customer-care operator | employee management, customer/patient care, call centre, consent and interactions | employee, customer-care, call-centre workspaces and policies |
| Administrator / security owner | users/roles, branch and jurisdiction scope, connectors, audit, anti-fraud, screen protection | organization router, security middleware, AntiFraudWorkspace |
| Investor / tester | Demo login, scoped synthetic data, POS, procurement, reports, exports, safe disabled integrations | showcase tests, Demo bootstrap, investor flow documentation |

## Initial cross-cutting checks

Authentication, server-side role authorization, organization/branch/jurisdiction isolation, Demo isolation, approval separation, idempotency, auditability, sensitive-data handling, mobile RTL behavior, loading/empty/error states, screen-capture protection, report filtering/sorting, chart accuracy, Excel/PDF consistency, and external integration prerequisites.

## Known external gates

Government integrations, live regulatory credentials, sensor connectors, push providers, and Resend email credentials must not be fabricated or treated as active. Scheduled email remains guarded and intentionally disabled until valid credentials and explicit enablement are supplied.

## Execution status

This file is the starting inventory. Each workflow must be marked only after direct automated or browser evidence, with defects and limitations recorded separately.

## Initial runtime evidence — 2026-08-17

The full Vitest baseline passed with 138 test files, 442 passed tests, and 8 skipped tests. Mobile screenshots for `/`, `/pos`, `/operations`, and `/finance` rendered without a 404 and showed the Arabic RTL task-oriented workspace. The server log also recorded missing-session-cookie events for unauthenticated screenshot requests; authenticated role-specific workflow validation therefore requires the Demo/session test path rather than treating public screenshots as proof of privileged access.

## Cross-device evidence — 2026-08-17

At 390x844, the public landing page and direct `/pos`, `/operations`, and `/finance` paths rendered without a 404. The authenticated workspace shell preserved Arabic RTL layout, branch-scope banner, task-oriented actions, mobile menu, search affordance, and bottom watermark. The capture session had no authenticated cookie, so this evidence verifies routing and responsive shell behavior only; it does not prove privileged data access or completion of a sale.

The same viewport is a useful proxy for Android mobile and iPhone browser layout. Native camera permission behavior, OS screenshot blocking, PWA installation, and HarmonyOS-specific rendering still require real-device validation.

## Device simulation evidence — 2026-08-17

At 768x1024, the public entry page remained readable and the authenticated-style workspace shell rendered without visible overlap in RTL. The direct workflow captures showed the same workspace fallback because the browser session lacked a valid authenticated cookie; server logs reported missing session cookies. This confirms responsive shell/routing behavior, not privileged workflow execution.

At 1440x900, the desktop shell displayed the RTL sidebar, user area, branch scope banner, quick actions, system warnings, and bottom watermark without clipping in the captured viewport. The same screenshot set confirms `/pos`, `/operations`, and `/finance` resolve to the application shell rather than 404. PC and Mac are represented by the Chromium desktop viewport; browser-engine and native OS differences remain unverified.

At 375x812, `/` displayed the public MEDORA Arabic RTL entry page with a visible login CTA and no horizontal overflow in the captured viewport. `/pos`, `/operations`, and `/finance` resolved to the workspace shell rather than 404; the shell showed the branch-scope banner, menu button, search field, quick-action cards, and bottom scope watermark. Because the capture session had no authenticated cookie, these direct routes cannot be treated as proof that privileged POS, operations, or finance actions execute. The same visual shell appeared for the three authenticated routes, indicating a route-level fallback rather than separate public rendering.

Automated compatibility checkpoint: TypeScript completed successfully; Vitest reported 138 passed test files, 2 skipped files, 442 passed tests, and 8 skipped tests. Production build completed successfully. The build emitted a non-blocking chunk-size warning for large vendor/application chunks; no compilation or runtime build failure occurred. Database-dependent and live-login checks remain explicitly skipped where their prerequisites are unavailable.

Desktop viewport evidence at 1280x720: `/` showed the public MEDORA landing page without horizontal overflow. `/pos`, `/operations`, and `/finance` resolved to the authenticated workspace shell in the persistent preview session, with RTL sidebar navigation, branch-scope banner, search, quick actions, logout, and the current-user indicator visible. The three direct routes rendered the same workspace shell in this capture, so route resolution is verified but feature-level authorization and data mutations require an authenticated role-specific session. No visual overlap or 404 was observed at this viewport.

## Compatibility matrix and evidence boundaries — 2026-08-17

| Target persona/device | Browser-level simulation completed | Verified scope | Native validation still required |
|---|---|---|---|
| Android mobile | 375x812 and 390x844 Chromium mobile viewports | RTL shell, routing, no horizontal overflow, mobile menu/action density, branch banner, watermark | Android camera permission lifecycle, barcode engine behavior on device, `FLAG_SECURE`, PWA install/resume |
| iPhone | 375x812 and 390x844 Chromium mobile viewports | Same responsive shell and direct route behavior; no 404 in the capture | Safari/WebKit camera and download behavior, iOS capture notification/native screen protection, PWA standalone mode |
| Android tablet | 768x1024 viewport | Tablet layout, RTL shell, route resolution, no visible overlap | Real tablet camera/keyboard/scanner and Android OS capture policy |
| iPad/tablet proxy | 768x1024 viewport | Responsive workspace shell and direct routes | iPadOS Safari/WebKit rendering and native capture behavior |
| PC | 1280x720 and 1440x900 desktop viewports | Sidebar, task actions, reports shell, route resolution, no clipping in captures | Browser-specific testing across Chromium, Firefox, and Edge; actual printer/scanner drivers |
| Mac | 1280x720 and 1440x900 desktop viewports | Same Chromium desktop shell behavior and RTL layout | Safari/WebKit, macOS camera/download permissions, native peripherals |
| HarmonyOS | No native device available; web behavior covered by mobile viewport proxy | Responsive web fallback and camera/error-state design are documented | HarmonyOS Browser/WebView, camera permissions, PWA behavior, native anti-capture integration |

The verified browser evidence establishes responsive routing and shell behavior, not privileged business mutations. The current screenshot session had no authenticated cookie; role-specific data changes must therefore be validated through the existing Demo/session test path or an explicitly authenticated browser session. No native OS guarantee is claimed for camera permissions, screenshot prevention, PWA lifecycle, or hardware scanners without physical-device evidence.

## Role and cross-cutting contract evidence — 2026-08-17

The focused domain/integration audit completed with 87 test files passed and 1 skipped; 304 tests passed and 7 skipped. The executed set covered authentication/session contracts, organization/branch/jurisdiction boundaries, Demo bootstrap and scope reconciliation, POS/mobile POS, cashier and inventory policies, procurement, report export/scheduling policies, audit signing, anti-fraud, security middleware, prescriptions/patients, employee management, customer care, analytics, and scheduled inventory/report policies. The skipped cases remain environment-gated and are not reported as production behavior. No failure was reproduced in this focused set.

## Physical-device acceptance status — 2026-08-17

The physical-device acceptance package is complete and documented in `docs/physical-device-acceptance-test.md`. The scenarios cover Android, iPhone, and HarmonyOS camera permissions, barcode/Data Matrix scanning, manual fallback, receipt/report printing, and WhatsApp/system sharing. No physical Android, iPhone, or HarmonyOS device was connected to the current session, so those device rows remain explicitly **Not tested**, not passed by assumption. The automated baseline recorded that the current sandbox browser could not establish camera acceptance, while 3 focused regression files with 9 tests passed for payload integrity, capability detection, and safe fallback states. Direct USB/Bluetooth/network printer integration remains intentionally closed pending an approved connector and device policy.
