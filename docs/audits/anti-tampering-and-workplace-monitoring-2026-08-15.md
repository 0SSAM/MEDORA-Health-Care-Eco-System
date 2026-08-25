# ميدورا | منظومة الرعاية الصحية المتكاملة — Anti-Tampering and Workplace Monitoring Policy

**Date:** 2026-08-15

> This document is an engineering control and deployment contract, not legal advice. A qualified privacy and employment-law professional must review the final workplace policy for each country and organization before any camera or audio adapter is enabled.

## Human tampering and misuse controls

Every security-sensitive event must be attributable to a verified actor or explicitly recorded as an anonymous/system event, and must carry organization, branch, jurisdiction, UTC occurrence time, recording time, outcome, and tamper-evident audit linkage. The policy covers authentication failures and successes, privilege or scope changes, create/update/delete actions, exports, storage access, configuration changes, audit-chain failures, and clock anomalies.

The policy classifies audit-chain breaks as critical, privilege/scope changes, deletion, bulk export, and clock anomalies as high severity, and requires human review for high and critical events. It detects five or more denied authentication attempts within ten minutes and high-volume export/storage access of at least 100 events within ten minutes. These are security signals requiring review; the system does not claim that a person committed wrongdoing, and it does not fabricate incidents or conclusions.

Evidence preservation must be performed through the existing append-only/tamper-evident audit path. Reviewers must preserve the event identifiers, predecessor/hash metadata, actor and scope, UTC timestamps, access reason, and relevant system state. Investigators should use a two-person review for privilege changes, destructive regulated actions, audit-chain failures, and suspected insider misuse. Account suspension, legal reporting, or disciplinary action must remain a human decision outside the automated classifier.

## Camera and audio boundary

Camera and audio monitoring is not enabled by this change. The implementation adds a fail-closed readiness contract only. An adapter remains blocked unless the organization has displayed a clear notice, verified consent or another documented legal basis, limited the purpose, configured retention and deletion, scoped access by role and location, configured masking/minimization, defined incident review, verified the device/protocol contract, and explicitly disabled covert capture.

The production adapter contract must additionally define the camera/microphone models, local processing versus upload, encryption, timestamps, clock synchronization, event export format, access logging, retention/deletion execution, legal hold, incident escalation, availability failure behavior, and acceptance tests. Audio is especially sensitive and must not be recorded in private areas or used for generalized employee profiling. Video/audio evidence must never be repurposed for clinical decision-making or automated disciplinary conclusions without documented human review.

## Operational response and retention

Security signals should create a review queue with severity, scope, evidence references, and status rather than an automatic accusation. Access to evidence must itself be audited. Retention should be the minimum period required by the approved policy, with documented deletion and legal-hold exceptions. Backups, exports, and incident copies must inherit the same access controls and retention classification.

The current browser application cannot attest a trusted physical camera, microphone, MDM state, clock, or local storage boundary. Therefore all real device monitoring, continuous capture, and offline evidence replay remain blocked until an authorized native/local adapter and country-appropriate approvals are supplied.

## Verification

The policy tests cover required scope and timestamp checks, severity classification, repeated authentication failure detection, bulk-access detection, audit-chain break escalation, and the blocked-to-ready camera/audio readiness transition. Full project verification remains required before release: Vitest, TypeScript, production build, and archive integrity checks.
