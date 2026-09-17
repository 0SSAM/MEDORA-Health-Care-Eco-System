# MEDORA Expansion Review — 2026-08-15

## Scope

This bounded expansion adds an operational entry point rather than creating unverified regulatory or clinical claims. The implementation uses existing organization and jurisdiction context and remains read-only for the new service-bundle view.

## Implemented slices

| Slice | Evidence | Boundary |
|---|---|---|
| Operations Hub | `client/src/pages/Home.tsx` exposes **مركز التشغيل والباقات** and shortcut `F10`; `OperationsHubWorkspace` renders the scope notice and sector cards. | No regulated submission, billing activation, or external connector is implied by visibility. |
| Sector bundles | `shared/operations-hub.ts` defines pharmacy, hospital, distributor, laboratory/radiology, insurer/payer, and rehabilitation bundles with explicit readiness states. | Bundles are capability descriptors, not product promises, certifications, or billing plans. |
| Regression coverage | `server/operations-hub.test.ts` verifies the six sectors and requires at least one `اعتماد مطلوب` state. | Test data is static descriptive metadata only; no patients, prescriptions, medicines, prices, reviews, or approvals are fabricated. |
| Reports surface | Existing `ReportsWorkspace` remains the operational reporting entry point and now shows report definitions, runs, and delivery attempts within organization scope. | Scheduling and delivery remain explicit and connector-gated. |

## Safety and tenancy

The new entry point is restricted through the existing role and organization-module maps. It passes `organizationId` and `jurisdictionId` into the scope notice and does not create a fallback scope. Existing server procedures remain the source of authorization, not client-side visibility. Arabic labels are used for the new surface, and the layout reuses the existing dashboard and card primitives.

## Deliberately not claimed

The expansion does not claim GAHAR, EDA, UPA, ETA, UHIA, insurer, laboratory, diagnostic, or other government certification. Official submissions, clinical decision support, patient-level recommendations, production billing, and external payer communication remain disabled or approval-gated until authoritative evidence, credentials, sandbox acceptance, and independent review exist. Notification preferences, escalation workflows, and deep inventory/expiry analytics remain candidates for a later vertical slice because their persistence and retention policies need an explicit schema and acceptance criteria rather than placeholder controls.

## Verification

The focused regression test passed and TypeScript passed after the implementation. A full test suite, production build, dependency audit, and responsive screenshot review remain required before the expansion checkpoint. The isolated MySQL lifecycle CI verification also remains blocked until repository access is restored; local fail-closed checks must not be presented as proof of hosted CI success.
