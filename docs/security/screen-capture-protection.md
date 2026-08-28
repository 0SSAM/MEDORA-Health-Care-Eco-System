# MEDORA Sensitive Screen-Capture Protection

## Enforced browser and PWA controls

The authenticated MEDORA workspace is wrapped by a dedicated protection boundary. It immediately obscures protected content after loss of visibility or focus, page lifecycle suspension, an attempted print flow, a protected keyboard shortcut, or a non-editable copy/context-menu action. Protected views carry a repeated on-screen watermark containing the authenticated display label and the current branch/data-mode label. This is a deterrence and accountability control; it deliberately uses no patient, prescription, credential, or financial amount in the watermark.

The server additionally sends `Permissions-Policy: display-capture=()` to disable the browser's programmatic display-capture capability. Existing anti-framing, no-store API responses, HTTPS enforcement, same-origin policies, and role/scope authorization continue to apply independently. The protection wrapper is enabled only after an authenticated user exists; public welcome and login pages remain usable without an unnecessary privacy overlay.

## Platform limits and regulated deployment requirement

> A browser or PWA cannot reliably prevent operating-system screenshots, external cameras, remote-desktop capture, accessibility overlays, or all device-level screen recording. JavaScript detection of such events is intentionally treated as a risk signal rather than proof of capture.

For clinical or financial deployments that require enforceable screenshot/recording controls, MEDORA must run in an approved managed native wrapper or managed-device profile. The deployment gate requires Android `FLAG_SECURE` on sensitive activities and verified task-switcher redaction; iOS/iPadOS screen-capture state monitoring plus protected app-switcher snapshots; and the equivalent signed enterprise device-policy and screen-protection control for HarmonyOS. Device-management policies must disable unmanaged screen sharing, remote support, developer options, and unapproved accessibility/overlay services where the operating environment permits it.

These platform controls complement rather than replace MEDORA authorization. The system remains fail-closed for clinical data, maintains organization/branch/jurisdiction isolation, and records no claim that the web client alone prevents a physical or operating-system capture.

## Verification record — 2026-08-20

| Check | Result |
|---|---|
| Focused capture-protection contracts | Passed: 2 files, 6 tests. |
| TypeScript | Passed with no errors. |
| Full Vitest suite | Passed: 218 files, 674 tests; 9 environment-gated skips. |
| Production build | Passed; the existing vendor-core chunk-size warning remains non-blocking. |
| Public entry at 375 × 812 | Verified readable and free of the authenticated watermark/overlay. |
| Public entry at 1280 × 720 | Verified readable and free of the authenticated watermark/overlay. |

The authenticated overlay is verified by contract to mount only with an authenticated user and to bind lifecycle, copy, print, context-menu, drag, and protected-keyboard events. A physical-device acceptance test remains necessary before a regulated native release, because browser screenshots and operating-system recording cannot be proved blocked through browser rendering alone.
