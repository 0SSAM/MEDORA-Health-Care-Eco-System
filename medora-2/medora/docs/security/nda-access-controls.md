# MEDORA NDA Access and Intellectual-Property Controls

> **Operational draft — legal review required.** This document and the in-product Arabic/English agreement are AI-assisted operational materials, not legal advice or a final contract. A qualified lawyer should review the agreement, employment/contractor terms, privacy notices, evidence retention, and enforcement terms for every relevant jurisdiction before the organization relies on them.

## Purpose and implementation status

MEDORA Health Care Eco System requires a signed-in user to accept the exact current version of the bilingual Non-Disclosure Agreement (NDA) before the application releases protected workspace data or operations. This is an engineering access control and an auditable acknowledgement mechanism. It complements, but cannot replace, a properly executed employment, contractor, customer, or partner agreement.

| Control | Implemented behavior | Evidence and limit |
| --- | --- | --- |
| Versioned document | The server publishes one bilingual document with a deterministic version and SHA-256 hash. | Any approved wording change produces a new hash and requires renewed acceptance. The hash is integrity evidence, not legal registration. |
| Durable acknowledgement | The `nda_acceptances` record stores the user, document version/hash, chosen locale, declared surface, acceptance method, and server timestamp. | The record proves an application event subject to ordinary system, identity, and retention controls; it is not by itself a witnessed signature. |
| Server-side gate | `protectedProcedure`, `adminProcedure`, and isolated demo mutations check the current version **and** hash before their domain handler runs. | A client-side overlay alone is not trusted. Direct protected tRPC calls receive `FORBIDDEN` / `NDA_ACCEPTANCE_REQUIRED`. |
| Minimal pre-acceptance route | Only authenticated NDA status and explicit acceptance remain available prior to acceptance. | The acceptance route rejects stale version/hash inputs and requires an affirmative confirmation. |
| Workspace bootstrap restraint | Branch registry and session-mode queries wait for the server-confirmed current acceptance. | The language selection remains local so the agreement can be presented without releasing scope context. |
| Refusal | The gate offers a visible refusal path that signs the user out. | Refusal does not revoke a previously recorded acknowledgement or erase legally retained audit records. |

The active agreement source is [`server/domain/nda-policy.ts`](../../server/domain/nda-policy.ts). Its server endpoints are in [`server/routers/nda.ts`](../../server/routers/nda.ts), and the central enforcement boundary is [`server/_core/trpc.ts`](../../server/_core/trpc.ts).

## Acceptance lifecycle and re-acceptance

The document version and hash are part of the access decision. A valid authenticated session is therefore insufficient to use a protected MEDORA procedure when the user has not accepted the current document exactly.

| Event | Required system behavior | Release evidence |
| --- | --- | --- |
| First sign-in with no current record | Present the bilingual agreement and keep workspace routes/data unavailable. | NDA status query returns `accepted: false`; protected call is denied before domain work. |
| User accepts current text | Persist a single version/hash acknowledgement using server time and allow protected access. | Acceptance record plus focused server and UI tests. |
| Approved wording/version change | Change the policy text/version, allow the derived hash to change, retain prior acknowledgements for history, and require every user to accept again. | Policy test for stale version/hash, updated document review, release validation. |
| User refuses | Sign out and return to the login entry point; do not load branch or session workspace context. | Gate refusal test and browser journey verification. |
| Account/role change | Continue to enforce both NDA acceptance and the existing role, organization, branch, jurisdiction, demo, and readiness checks. | The NDA does not broaden any authorization. |

## Coverage by access surface

| Surface | Current control | What remains necessary | Explicit limitation |
| --- | --- | --- | --- |
| Browser/PWA | Authenticated NDA gate, server-side enforcement, and no branch/session bootstrap before current acceptance. | HTTPS, managed identity, least-privilege roles, organization/branch/jurisdiction checks, session expiry, and ordinary endpoint monitoring. | A browser cannot reliably prevent screenshots, screen recording, copy/paste, developer tools, printing, or an external camera. |
| Mobile webview/native wrapper | The acknowledgement records a declared `mobile_webview` surface and receives the same server enforcement. | A signed Android/iOS/HarmonyOS wrapper must implement and test platform-native capture restrictions, secure storage, root/jailbreak posture, device management, and logout behavior. | Declaring a user agent is not device attestation; no browser implementation can claim native capture prevention. |
| Desktop wrapper | The acknowledgement can record `desktop_wrapper` and remains subject to server enforcement. | A signed desktop client must enforce its own OS-level policies, encrypted local storage, update channel, managed-device posture, and physical-device acceptance tests. | An in-app NDA cannot prevent a privileged local user, malware, screen recorder, or external camera from copying material. |
| Local development | Running MEDORA through its authenticated application path reaches the same server gate. | Developers must be individually authorized, use separate least-privilege credentials, sign a written NDA/assignment, and follow repository/secret-handling rules. | A person who already has a source checkout can inspect files outside the running application; an application gate cannot protect code that has already been cloned. |
| Source repositories and archives | `LICENSE`, `NOTICE`, source-integrity evidence, checkpoints, and owner-held archives document intended reservation and change history. | Repository visibility, collaborator controls, branch protection, release/package review, secret rotation, and contractual controls must be administered by the owner. | A manifest detects byte divergence only for listed files; it does not create copyright, trademark, ownership, or secrecy by itself. |

## Current repository boundary and owner action

On **2026-08-22**, a read-only repository check found `https://github.com/0SSAM/MEDORA-Health-Care-Eco-System` to be **PUBLIC** on branch `main`. Application acceptance does **not** make that repository private, retract existing copies, or bind a visitor who never accepted a separate agreement.

The repository owner should complete the following actions through the organization’s approved GitHub administration process before treating source access as restricted:

1. Change the repository visibility to **private** after assessing collaborator, fork, release, package, deployment, and archival consequences; preserve the current public history as evidence before changing it.
2. Review and remove unneeded collaborators, teams, deploy keys, fine-grained tokens, GitHub Apps, OAuth grants, Actions secrets, workflow artifacts, packages, releases, and public forks or mirrors under the owner’s control. Rotate any secret that could have been exposed.
3. Require multi-factor authentication and, where applicable, organization SSO; grant only named, role-appropriate access with periodic access reviews.
4. Protect `main` with required reviews, status checks, restricted pushes, signed commits if adopted by policy, and `CODEOWNERS` for security-sensitive paths such as server controls, schemas, deployment, and legal notices.
5. Require separately executed NDA, confidentiality, invention-assignment, and acceptable-use terms for employees, contractors, suppliers, evaluators, and partners before source access. Obtain jurisdiction-specific legal review rather than relying on click-through wording alone.
6. Use managed devices and endpoint/data-loss controls for high-risk source access where operationally appropriate. Keep the limitations of these controls documented and tested.

No visibility or collaborator change is performed automatically by MEDORA or by this documentation.

## Privacy, audit, and evidence boundaries

The acknowledgement is designed to retain the minimum operational fields needed to identify the document accepted, the account that accepted it, the declared surface, and the server acceptance time. It must not store secrets, full clipboard content, screenshots, device fingerprints, clinical records, or arbitrary browser data merely to strengthen the NDA flow.

The proprietary [`NOTICE`](../../NOTICE), [`LICENSE`](../../LICENSE), Git history, owner-held archives, deployment checkpoints, and [`source-integrity-release-evidence.md`](source-integrity-release-evidence.md) provide complementary engineering and provenance evidence. They must not be described as legal registration, a complete forensic system, or a substitute for legal counsel and evidence-preservation procedures.

## Release verification requirements

Before changing this control, verify the following: the document version/hash transition; a denied direct protected call for an unaccepted account; authenticated NDA status visibility before acceptance; stale-document rejection without an acceptance record; branch/session bootstrap suppression; role and tenant boundaries after acceptance; Arabic and English gate rendering at desktop and mobile widths; and the full test, type, build, and source-integrity suite. Native capture controls require signed wrapper builds and physical-device evidence and cannot be inferred from browser checks.

## Verification evidence — 2026-08-22

An authorized non-production employee account was signed in to the running workspace without submitting an NDA acknowledgement. The desktop browser displayed only the Arabic agreement gate at `/workspace`, including the affirmative acknowledgement control, refusal/sign-out action, and continue action; branch, session, and workspace content were absent. No acceptance was submitted during that visual check. A 390 × 844 mobile-viewport capture was subsequently reviewed after the gate was strengthened with width containment, safe word wrapping, and full-width mobile decision controls. The agreement, checkbox, and both actions remained visible without horizontal overflow. Automated responsive contract coverage remains part of the release suite. Native capture controls still require signed wrapper builds and physical-device evidence and must not be inferred from browser checks.
