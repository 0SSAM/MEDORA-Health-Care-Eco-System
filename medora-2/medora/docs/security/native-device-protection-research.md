# Native Device Protection Research and Delivery Plan

## Purpose and boundary

This plan defines the next native-wrapper control layer for authenticated MEDORA workspaces. The deployed web application already provides browser deterrence, immediate redaction, a visible watermark, blocked protected actions, restrictive `Permissions-Policy`, and a minimized server-side audit event. A browser cannot guarantee prevention of operating-system screenshots, external cameras, rooted or jail-broken devices, or a compromised endpoint; native controls therefore complement rather than replace access control, encryption, tenant isolation, and the signed audit record.

This is an engineering plan, **not legal advice** and not proof of statutory intellectual-property registration. It makes no claim of regulatory certification until a signed native build, target-device evidence, and acceptance evidence exist.

## Platform implementation contract

| Platform | Control to implement in the native wrapper | MEDORA runtime behavior | Evidence and constraint |
| --- | --- | --- | --- |
| Android | Apply `WindowManager.LayoutParams.FLAG_SECURE` while an authenticated sensitive workspace is foregrounded; remove it on sign-out and protected-screen exit. Consider `HIDE_OVERLAY_WINDOWS` only after product and compatibility review. | Mark the sensitive native window as secure before rendering the protected web view. If the platform provides a capture callback, emit only the existing minimized risk type and scope to the server; never send pixels, clipboard contents, typed text, or a device fingerprint. | Android documents that `FLAG_SECURE` prevents screenshots and viewing a flagged window on non-secure displays, while noting that it is not a complete defense against overlay attacks or every recording scenario.[1] |
| iOS / iPadOS | Subscribe per scene to the current scene-capture state; use the documented capture-state transition notification and immediately cover or redact the sensitive native view when capture/mirroring is active. Retain a narrowly scoped screenshot-notification response for post-event redaction/audit where supported. | On a captured state, suspend or obscure protected content, retain authenticated session state only as product policy allows, show a concise privacy notice, and emit the minimized existing risk event once. Restore only after the capture state clears and session/scope checks succeed. | Apple documents that capture state covers recording, mirroring, and AirPlay, and that `UIScreen.isCaptured` is deprecated in favor of scene capture state; capture transitions are observable via notification.[2] [3] iOS behavior must not be described as screenshot prevention. |
| HarmonyOS NEXT | Request `ohos.permission.PRIVACY_WINDOW` after platform/version confirmation and call per-window privacy mode only while the protected page is active. Restore normal state when leaving the page. | Apply privacy mode before presenting the authenticated workspace. If an approved platform callback is available, map it to the same minimized risk vocabulary; keep the server procedure and tenant checks unchanged. | A Huawei developer reference demonstrates `setWindowPrivacyMode` with `ohos.permission.PRIVACY_WINDOW` to block screenshots on an active protected page. The exact SDK, device support, distribution policy, and API signature remain release-gated verification items.[4] |

## Privacy-preserving event contract

The native wrapper must call only the existing `operations.logCaptureRisk` procedure. Its allowlisted payload is limited to **organization ID, branch ID, jurisdiction ID (including legal ID `0`), risk type, and event time**. The server independently validates authenticated membership and the full scope, records database receipt time in the signed audit chain, and retains no screenshot, recording, clipboard, page content, free text, IP-derived identifier, hardware identifier, or browser/device fingerprint.

The native wrapper must never weaken the web control if a native API is unavailable. The safe fallback is to keep the browser redaction and visible watermark, record only the already-defined event when a reliable signal exists, and disclose the limitation in the acceptance result. Sensitive clinical and financial workflows remain fail-closed according to their own server-side authorization and jurisdiction requirements.

## Native acceptance protocol

| Test area | Android phone and tablet | iPhone / iPad | HarmonyOS device | Expected evidence |
| --- | --- | --- | --- | --- |
| Protected workspace entry | `FLAG_SECURE` becomes active before authenticated content paints. | Native privacy observer is registered before protected content paints. | Privacy mode is enabled before the protected page paints. | Build/version, device model and OS, screen recording showing the protection state—not patient or clinical data. |
| Screenshot and recorder attempt | Test native screenshot, recorder, task switcher preview, cast/mirroring, and one supported overlay scenario. | Test screenshot, native screen recording, AirPlay/mirroring, and application switcher preview. | Test screenshot, recording if supplied by the device, and task switcher preview. | Pass/fail per scenario, visual redaction result, event timestamp, and a signed audit-chain verification result. |
| Scope and privacy check | Sign in under two distinct authorized scopes and confirm only the selected scope is present in its audit record; repeat with jurisdiction `0`. | Repeat the same two-scope and jurisdiction-`0` sequence. | Repeat the same two-scope and jurisdiction-`0` sequence. | No cross-tenant event visibility; no content, clipboard value, or hardware identifier in the audit payload. |
| Recovery | Stop capture, navigate away, sign out, and re-enter. | Stop capture, clear capture state, sign out, and re-enter. | Leave protected page, return, sign out, and re-enter. | Content becomes available only in an authenticated, complete scope; no stale protection state blocks unrelated public pages. |

## Release gates

Native implementation remains **deferred** until a supported wrapper architecture and target-device lab are available. Before enabling it for production, the release must include a code review of the platform adapter, tested OS/version matrix, evidence for the platform-specific behavior above, regression tests for scope validation and minimized payloads, and a documented rollback mechanism. A failed or unsupported platform capability must preserve the existing web protections and must not cause any regulated action to become less restricted.

## References

[1]: https://developer.android.com/security/fraud-prevention/activities "Android Developers — Secure sensitive activities"
[2]: https://developer.apple.com/documentation/uikit/uiscreen/iscaptured "Apple Developer Documentation — UIScreen.isCaptured"
[3]: https://developer.apple.com/documentation/uikit/uiscreen/captureddidchangenotification "Apple Developer Documentation — capturedDidChangeNotification"
[4]: https://forums.developer.huawei.com/forumPortal/en/topic/0203189954410068038 "Huawei Developer Forum — How to Prevent Screenshots on a Specific Page in HarmonyOS Next"
