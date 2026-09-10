# MEDORA Platform and Resilience Support Matrix

## Purpose

This matrix defines a truthful support baseline for MEDORA. A responsive web application can target many devices, but every operating-system version, browser, printer, scanner, storage quota, and network condition must be accepted through representative testing before being called supported.

| Environment | Target posture | Current evidence | Acceptance still required |
|---|---|---|---|
| Windows 10/11 with a current supported browser | Primary desktop target | Responsive web build, production build, desktop verification | Site-specific endpoint, printer, scanner, policy, and endpoint-security acceptance |
| Current macOS with a current supported browser | Supported web target | Responsive web build and browser-compatible architecture | macOS printing, local-device bridge, and organization policy acceptance |
| Current iOS and Android browsers | Mobile access target | Responsive verification and offline draft indicator | Device matrix, storage quota, background suspension, camera/scanner, and field acceptance |
| Windows 7 | Legacy / not default-supported | No safe claim can be made from a modern web build alone | Maintained browser/security posture and dedicated acceptance; do not weaken TLS or security controls to support it |
| Low-memory or low-CPU hardware | Graceful-degradation target | Code splitting, lightweight UI patterns, server-side procedures | Representative performance tests for load time, memory, interaction latency, and storage |
| Stable broadband | Normal operating mode | Production web deployment | Organization-specific monitoring and RPO/RTO evidence |
| Weak or intermittent connection | Draft-oriented resilience mode | Local queue, reconnect sync, conflict review, status indicator | Power-loss, duplicate reconnect, expired session, clock drift, and field recovery tests |
| Fully offline | Limited local drafting only | Offline policy and local queue | Explicit organization approval for each draftable workflow; regulated final actions remain online/server-confirmed |
| Thermal/USB/network printers and scanners | Browser print or integration target | PDF/print workflow and configurable invoice paper sizes | Per-model connection, driver, permissions, and print-quality acceptance |

## Required diagnostic evidence

A support ticket or acceptance run should record the browser engine and version, operating system, viewport, available memory where observable, network state, storage availability, organization and branch scope, queue count, last successful sync, time to first usable screen, time to complete a representative task, and any failed or conflicting draft.

## Offline safety boundary

The offline queue is for explicitly eligible drafts. Automatic reconnect synchronization is idempotent and does not silently choose a side when a conflict exists. Tax submission, final financial posting, prescription verification, dispensing, regulated connector calls, and other sensitive mutations require server authorization and must remain fail-closed when that authorization is unavailable.

## Performance acceptance bands

The organization should define measurable bands before claiming production support. A practical baseline is a usable shell on a normal connection, visible progress during slow requests, no unbounded retries, bounded local queue growth, a clear failure state, and recoverable conflict records. The exact numerical targets must be agreed with the deployment owner because they depend on catalog size, branch volume, hardware, and network topology.

## Result labels

Use **verified** only when the complete environment and representative workflows passed. Use **supported with limitations** when the main workflow passes but a documented restriction exists. Use **target** when the architecture is intended to support the environment but acceptance evidence is not complete. Use **not supported** when supporting it would require weakening a security or regulatory control.
