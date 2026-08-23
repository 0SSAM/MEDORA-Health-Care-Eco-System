# MEDORA Investor Demo Test Guide

## Purpose

This guide defines the safe investor walkthrough for **MEDORA Health Care Eco System**. The walkthrough uses the authenticated showcase/test account and must remain inside the clearly labelled **Demo / بيانات العرض** scope. Demo transactions are synthetic and non-fiscal; they must never be presented as ETA submissions, real customer invoices, production sales, or government-approved records.

## Entry and scope verification

Open the MEDORA site and choose **تسجيل الدخول بأمان**. After authentication, verify the persistent scope indicator at the top of the application. It must identify the Demo/showcase branch and indicate that the current data mode is **بيانات العرض**. If the indicator shows production data, stop and do not create a transaction.

On a narrow mobile screen, open the navigation drawer and choose **نقطة البيع**. The POS module expands into direct actions. Choose **بيع جديد** rather than opening a broad data workspace. The same entry point is available from the task launcher on the home screen.

## First synthetic sale

In POS, use the search field to search by medicine name, SKU, barcode, or full raw Data Matrix payload. The camera scanner requests permission only when explicitly opened. If the camera is unavailable, use manual input, a USB/keyboard scanner, or the clearly labelled **ماسح باركود تجريبي**. The simulated scanner never accesses the camera and does not leave the Demo scope.

Select one synthetic item, confirm the quantity, and add it to the basket. Enter an invoice number of at least three characters, select a payment method, and choose **إتمام البيع**. The system validates the sale on the server within the current organization, branch, jurisdiction, and Demo scope. After success, use **طباعة الإيصال** or **مشاركة واتساب** only as a local presentation test; the result is not a fiscal document and does not contact ETA.

## Held invoice, return, and cashier cycle

Before completing a second sale, add an item and choose **تعليق الفاتورة**. Open the held-invoice action, restore the transaction, and verify that the basket returns without changing production data. Use the cashier-cycle workspace to inspect the Demo period, review synthetic invoices, create a return request for review, and close the Demo cashier period. These actions are isolated and auditable within the showcase scope.

## Operations Center mobile test

Open **مركز العمليات** from the home task launcher. Choose **مسار الموظفين**, **التوريد**, or **CRM**. Each action must focus the corresponding section instead of merely refreshing the same Operations Center card. If the action is not available to the current role, the interface must show a clear permission or unavailable-state message rather than silently doing nothing.

## Safety checks

At every step, confirm the Demo badge, branch, and jurisdiction indicator. Do not enter real patient data, real prescriptions, real card details, government credentials, or real customer identifiers. Do not treat synthetic catalog records, balances, invoices, stock movements, or analytics as production evidence. The Demo database is intended for investor testing and feature discovery; production regulatory integrations remain separately gated.

## Acceptance checklist

| Check | Expected result |
|---|---|
| Scope banner | Demo/showcase branch and non-production data mode are visible |
| POS entry | Direct **بيع جديد** action opens the functional sales workspace |
| Product search | Synthetic products are returned within the current Demo scope |
| Barcode/Data Matrix | Raw scanned payload is preserved; fallback input remains available |
| First sale | Synthetic sale persists only in Demo scope and shows a non-fiscal receipt |
| Held invoice | Invoice can be held and restored without production impact |
| Operations Center | Employee, supply, and CRM actions focus their intended workspace |
| Mobile layout | Buttons remain visible, reachable, and provide feedback on tap |
| Isolation | Production scope cannot be selected through Demo transaction paths |

## Current validation status

The codebase has passed the full Vitest suite with 130 test files and 420 passing tests, with 8 explicitly skipped integration tests, plus TypeScript and production build checks. A real browser walkthrough requires an authenticated showcase session; it must be performed with the test account rather than by silently using a pre-authenticated production account.
