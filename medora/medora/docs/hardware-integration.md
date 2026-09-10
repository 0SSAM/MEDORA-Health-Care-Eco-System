# Hardware Integration Boundary

## Current status

ميدورا | منظومة الرعاية الصحية المتكاملة currently provides **browser-safe interaction contracts**, not universal direct control of every physical device. This distinction is intentional: a browser/PWA can reliably render and download documents, accept keyboard-wedge scanner input, and use a camera/file input when the device and browser grant permission. Direct USB, Bluetooth, ESC/POS, label-printer, network-printer, CCTV, access-control, and sensor operation requires a verified local bridge or an official external adapter.

| Hardware area | Safe capability in the current web app | Direct operation status | Required production gate |
|---|---|---|---|
| Receipt/A4 output | Browser-rendered/downloadable output contract | Not universally claimed | Verified print layout, operator scope, and local/network printer path |
| Barcode/Data Matrix labels | Payload and legal-label fields remain provenance-controlled | No direct printer command is claimed | Verified label format, printer protocol, bridge/adapter, and acceptance test |
| Barcode scanners | Keyboard-wedge and camera input paths are compatible with a browser | Device identity and regulated submission are separate | Device configuration, branch scope, and workflow acceptance |
| USB/Bluetooth scanners | Adapter boundary exists, but browser access is not assumed | Requires local bridge or supported native wrapper | Secure channel, device allowlist, and operator authorization |
| Cold-chain sensors | Deterministic evaluation rule and readiness boundary exist | No fabricated live readings | Signed sensor readings, device identity, timestamp, batch, branch, credentials, and escalation path |
| CCTV/access control | Security and monitoring boundary only | No live camera/control feed is claimed | Vendor API, facility authorization, retention policy, secure channel, and acceptance test |
| Device health/alerts | Scoped readiness and notification policies exist | No universal hardware telemetry is claimed | Heartbeat/agent contract, alert routing, audit metadata, and support ownership |

## Fail-closed adapter contract

The server-side hardware policy requires a non-empty device identity, organization/branch/jurisdiction scope, verified protocol, verified scope, successful health check, and authorized operator. Monitoring adapters additionally require a secure channel and verified external credentials. Direct printer, local-bridge scanner, and external monitor paths cannot become ready merely because a browser reports a capability.

The policy is implemented in `server/domain/hardware-adapter-policy.ts` and covered by `server/domain/hardware-adapter-policy.test.ts`. It does not open arbitrary USB, Bluetooth, network, camera, or surveillance access. Any future bridge must expose a narrow, authenticated, auditable API and must never bypass the server's organization and jurisdiction checks.

## Recommended deployment paths

For ordinary receipt and A4 printing, use browser output with a tested print stylesheet or a managed local print bridge. For thermal receipt and label printing, select a printer protocol and model family first, then implement and acceptance-test a bridge for that protocol. For scanners, keyboard-wedge mode is the lowest-friction path because the scanner behaves like keyboard input; camera scanning is suitable for controlled workflows with explicit permission and validation. For cold-chain, CCTV, access-control, and device-health monitoring, deploy a separately managed connector or agent that signs readings and reports only scoped metadata.

No hardware integration should be marked production-ready until the physical model, operating system, connection method, vendor protocol, security ownership, test device, and failure/recovery behavior are supplied and tested. The demo mode may simulate these workflows locally, but it must not imply that a physical device is connected or that a regulatory, surveillance, or sensor event was accepted.
