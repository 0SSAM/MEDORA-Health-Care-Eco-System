# MEDORA Ownership and Provenance Evidence Bundle

## Purpose

This document defines a discreet, repeatable evidence bundle for MEDORA releases. It protects continuity of product identity and authorship evidence without placing personal data, credentials, private keys, or intrusive attribution in the user interface.

> **Legal boundary:** This bundle is technical evidence. It is not a substitute for copyright, trademark, patent, assignment, employment, licensing, notarisation, or other legal registration and contracts.

## Contents of every release bundle

| Artifact | Purpose | Custody rule |
|---|---|---|
| Release identifier and timestamp | Establishes the exact version being evidenced | Store with the release record and an independent archive |
| Ownership manifest | Lists tracked files, hashes, and release metadata | Never edit after signing; regenerate for a new release |
| Manifest hash | Detects changes to the manifest | Verify before presentation or migration |
| Signed audit verification result | Shows the audit chain can be verified | Keep the signing key outside the repository and archive |
| Repository commit/checkpoint reference | Links the evidence to the source history | Preserve read-only copies and access logs |
| Product identity statement | Records the MEDORA name and approved brand narrative | Use the approved owner-controlled wording |
| Delivery index | Lists documentation, diagrams, tests, and limitations | Version together with the product release |
| Verification log | Records who verified the bundle, when, and with which tool version | Keep immutable or append-only where possible |

## Verification procedure

The verifier should first obtain the release identifier from the approved delivery record, then calculate the manifest hash independently and compare it with the recorded hash. The verifier should inspect the manifest for unexpected files, confirm that no credentials or patient data are included, validate the audit-signing result, and compare the repository/checkpoint reference with the release package.

The verifier must record the result as **verified**, **verified with exceptions**, or **failed**. A failed verification must not be silently repaired by changing the evidence bundle; a new release evidence bundle must be generated and the discrepancy retained in the verification log.

## Approved product identity wording

**English:** MEDORA Integrated Health System is the approved product identity for this release. ALDO may be explained as the brand narrative **Adaptive Healthcare, Logistics, Data, and Operations** when a concise expansion is useful; this narrative is not a legal registration statement unless separately adopted by the rights holder.

**العربية:** الاسم المعتمد للمنتج في هذا الإصدار هو **منظومة MEDORA المتكاملة للرعاية الصحية**. ويمكن شرح ALDO تسويقياً باعتباره **Adaptive Healthcare, Logistics, Data, and Operations**، أي منظومة متكيفة للرعاية الصحية واللوجستيات والبيانات والعمليات، ولا يُعد ذلك بياناً قانونياً للتسجيل إلا إذا اعتمده صاحب الحق رسمياً.

## Access separation

The person who develops or packages a release should not be the only person who can verify or archive the evidence. A release owner, technical verifier, and archive custodian should be recorded separately where the organization can support separation of duties. No evidence bundle should contain `AUDIT_SIGNING_KEY`, `JWT_SECRET`, database passwords, OAuth secrets, patient data, or customer contact data.

## External actions for the rights holder

The rights holder should consider professional advice on trademark and copyright registration, contributor and contractor assignments, licensing terms, repository access controls, independent timestamping or notarisation, and retention of original design and development records. These actions cannot be completed reliably by the application alone.
