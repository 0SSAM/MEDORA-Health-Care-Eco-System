# MEDORA Native Wrapper Controls and Acceptance Gate

## Current release status

The deployed MEDORA web application is protected by browser-available deterrence and the authenticated server-side audit trail. The repository now also contains **reference adapters** for Android, iOS, and HarmonyOS wrapper implementations. These files are deliberately outside the web build, because the current deployed project is not a signed native application package.

> A reference adapter is not activation evidence. Native protection may be described as active only after the adapter is integrated into a signed wrapper, the target-device matrix passes, and the resulting evidence is attached to the release record.

| Platform | Reference control | Current status | Release gate |
| --- | --- | --- | --- |
| Android | `native-wrapper-reference/android/MedoraSecureWindowController.kt` applies `FLAG_SECURE` only during the sensitive authenticated workspace and registers Android 14 screenshot detection where available. | Implementation-ready reference; **not active in the web-only release**. | Signed wrapper build, Android device evidence, and review of any overlay policy. |
| iOS / iPadOS | `native-wrapper-reference/ios/MedoraCapturePrivacyController.swift` obscures content while the OS reports capture/mirroring and emits a minimized post-screenshot risk event. | Implementation-ready reference; **not active in the web-only release**. | Signed wrapper build and device evidence for recording, mirroring, screenshots, and app-switcher behavior. |
| HarmonyOS NEXT | `native-wrapper-reference/harmony/MedoraPrivacyWindowController.ets` enables window privacy mode during the protected workspace. | SDK-dependent reference; **not active in the web-only release**. | Confirmed SDK/API signature, permission/distribution review, signed build, and physical-device evidence. |

## Data and authorization boundary

Each adapter may emit only an allowlisted risk type to the existing `operations.logCaptureRisk` procedure. The wrapper must obtain the active organization, branch, and jurisdiction from the authenticated session, preserve jurisdiction ID `0`, and never submit pixels, clipboard values, typed content, user-generated text, hardware identifiers, IP-derived identifiers, or browser/device fingerprints. Server-side membership and full-scope validation remain mandatory.

## Physical-device acceptance record

Use the acceptance matrix in [Native Device Protection Research and Delivery Plan](./native-device-protection-research.md). For every device/OS scenario, preserve a non-clinical recording of the redaction state, wrapper version and signing identifier, the minimized audit event timestamp, and verification of the signed audit chain. Do not record patient, prescription, financial, clipboard, or authentication content as evidence.

| Evidence outcome | Release interpretation |
| --- | --- |
| All target-device scenarios pass and code review approves the wrapper. | Mark the specific signed wrapper version as native-protection enabled. |
| One platform API is unavailable or fails. | Keep the browser controls active, block the native-protection claim for that platform, and record the gap. |
| No physical device or signed wrapper is available. | Treat the native adapter as a release-gated reference only; do not replace it with simulator or browser screenshots. |

## Platform references

Android documents `FLAG_SECURE` as blocking screenshots and use on non-secure displays, while stating that it is not a complete overlay or recording defense.[1] Android 14 separately documents a per-activity, privacy-preserving screenshot callback.[2] Apple documents screenshot notification and a capture-state signal for recording, mirroring, and AirPlay; MEDORA uses those as redaction/audit signals rather than claiming iOS screenshot prevention.[3]

[1]: https://developer.android.com/security/fraud-prevention/activities "Android Developers — Secure sensitive activities"
[2]: https://developer.android.com/about/versions/14/features/screenshot-detection "Android Developers — Detect when users take device screenshots"
[3]: https://developer.apple.com/documentation/uikit/uiscreen/iscaptured "Apple Developer Documentation — UIScreen.isCaptured"
