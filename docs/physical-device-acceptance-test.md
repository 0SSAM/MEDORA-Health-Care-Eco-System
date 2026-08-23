# MEDORA Physical Device Acceptance Test

**System:** MEDORA Health Care Eco System
**Target deployment:** `https://aldorapharm-fwilugbd.manus.space`
**Test date:** 2026-08-17
**Test owner:** Manus AI
**Scope:** Android, iPhone, and HarmonyOS physical-device acceptance for camera permissions, barcode/Data Matrix scanning, receipt/report printing, and system sharing.

## Acceptance method

This document is an execution sheet, not a claim that physical devices were accessed remotely. Each device owner should open the deployed URL, execute the scenarios below, and record the result with the device model, operating-system version, browser, and evidence reference. A result is **Pass** only when the expected behavior is observed on the physical device. A result is **Blocked** when the device, account, camera, printer, or share target is unavailable. A result is **Fail** when the behavior differs from the expected behavior.

## Device matrix

| Device family | Required record | Primary browser | Secondary browser | Status |
|---|---|---|---|---|
| Android phone | Model, Android version, Chrome version, camera permission state | Chrome | Samsung Internet or Firefox | Not tested on physical device |
| Android tablet | Model, Android version, Chrome version, camera permission state | Chrome | Edge or Samsung Internet | Not tested on physical device |
| iPhone | Model, iOS version, Safari version, camera permission state | Safari | Chrome for iOS | Not tested on physical device |
| HarmonyOS phone/tablet | Model, HarmonyOS version, browser version, camera permission state | Huawei Browser | Chrome-based alternative where available | Not tested on physical device |

## Scenario A — Authentication and test workspace

Open the production URL, authenticate with an approved test or Demo account, and confirm that the user lands in the MEDORA workspace rather than an external or legacy domain. Confirm that the visible organization, branch, jurisdiction, and Demo/production indicator are correct. Record whether the page remains usable after a refresh and whether logout returns to the start page without silently restoring a test session.

**Expected result:** The user remains inside the MEDORA domain, sees the correct scoped workspace, and can explicitly log out. No production data may appear in Demo mode.

## Scenario B — Camera permission request

Open POS or the barcode search action. Start the camera scanner for the first time. Accept the browser camera permission and confirm that the camera preview opens. Repeat the test after denying permission. Then open the browser site-permission settings, revoke camera access, reload the page, and start the scanner again.

**Expected result:** The permission request is explicit and understandable. When access is granted, the scanner opens. When access is denied, the application remains usable and presents a clear manual-entry or simulated-scan fallback instead of hanging or showing a generic error. Revoking permission and retrying must not leave an unrecoverable loading state.

## Scenario C — Barcode and Data Matrix reading

Use one known retail barcode and one known Data Matrix printed at high contrast and normal size. Test each code under bright light, moderate distance, and a slight angle. Confirm that the decoded value is shown before submitting the search. Confirm that an unknown code produces a controlled “not found” state and does not create or sell an item automatically.

**Expected result:** Valid barcode and Data Matrix values are decoded correctly, the product lookup is scoped to the current organization/branch/jurisdiction, and unknown or invalid values use a safe empty/error state. No scan may bypass pricing, stock, approval, or regulatory controls.

## Scenario D — Manual fallback and repeated scanning

When the camera is unavailable, use the manual barcode field. Enter a valid code, submit, clear it, and enter a second code. Repeat scanning without leaving POS. Verify that the current invoice/cart is preserved and that duplicate scans follow the product-quantity rule rather than creating duplicate line records.

**Expected result:** Manual entry is available, fast, keyboard-friendly, and equivalent to a successful camera decode. Repeated scans do not lose the cart or create inconsistent quantities.

## Scenario E — Receipt printing

Complete an approved Demo sale or use an available test receipt/report action. Select print from the completed-sale view. Test the system print dialog where available and cancel once before retrying. If a Bluetooth or network receipt printer is available, verify the paper width and legibility.

**Expected result:** Print opens through the device/browser print mechanism or shows a clear unavailable-printer state. Canceling print returns to the application without losing the sale result. Printed output must not expose data outside the current scope.

## Scenario F — Receipt and report sharing

From the completed-sale or report view, select the share action. Test the operating-system share sheet, then select an available target such as WhatsApp or Files. If no native share target exists, verify that download or copy-link fallback is offered. Confirm that the shared file/text is the intended receipt or filtered report and contains no unrelated tenant data.

**Expected result:** Native sharing works where supported; otherwise a controlled fallback is provided. The application must not claim that WhatsApp delivery succeeded unless the operating system confirms the handoff.

## Scenario G — Mobile layout and recovery

Rotate the device if supported, open and close the side menu, switch branches only where the account is authorized, and navigate between POS, operations, finance, and reports. Repeat one scan after a temporary network interruption or browser reload.

**Expected result:** RTL content remains readable, primary actions remain reachable, touch targets do not overlap, branch switching shows a loading state, and a temporary interruption does not silently duplicate or finalize a regulated operation.

## Evidence record

| Device | Browser | Scenario | Result | Evidence | Notes |
|---|---|---|---|---|---|
| Android phone |  | A–G | Not tested |  |  |
| Android tablet |  | A–G | Not tested |  |  |
| iPhone |  | A–G | Not tested |  |  |
| HarmonyOS |  | A–G | Not tested |  |  |

## Release decision

A device family may be marked **Accepted** only after Scenarios A–G pass, or after every blocked scenario has a documented reason and an approved workaround. Camera permission and Data Matrix reading require physical-device evidence; browser viewport screenshots alone cannot establish those results. Printing and native sharing likewise require a physical printer or operating-system share sheet to be considered accepted.

## Known boundaries

The system currently provides browser/PWA behavior and safe fallbacks. A web application cannot guarantee absolute screenshot or screen-recording prevention across every operating system; those controls require a native wrapper and operating-system management policies. Likewise, camera decoding quality depends on device hardware, browser permissions, lighting, code quality, and available scanning implementation. These factors must be recorded rather than inferred from a desktop simulation.

## Automated browser baseline — not physical acceptance

The current sandbox browser baseline reported `secureContext=false`, `getUserMedia=false`, and `BarcodeDetector=false`. This confirms only that the current automated browser session cannot establish camera acceptance; it is not evidence about Android, iPhone, or HarmonyOS. The deployed site is intended to be opened directly on the physical device over its HTTPS domain. The Hardware workspace also intentionally keeps USB/Bluetooth/network printer connectors closed until an approved connector and device policy exist. Therefore, physical camera, Data Matrix, printer, and native share results remain **Not tested** until device evidence is supplied.

## Current verification result

The focused automated regression set now passes: 3 test files and 9 tests covering the hardware integration boundary, lossless barcode/Data Matrix payload handling, scanner-prefix lookup candidates, HTTPS/media-device capability checks, and camera unsupported/insecure fallback states. This result validates application contracts only; it does not convert the physical-device rows above from **Not tested** to **Pass**.
