# ميدورا | منظومة الرعاية الصحية المتكاملة — Capability and Gap Report

**Audit basis.** This report reflects the executable repository surface on `main`, including the insurance schema/migrations, domain policies, tRPC routers, integration contract tests, and the newly added insurance execution surface. It distinguishes persisted internal capability from externally activated payer connectivity.

## Executive assessment

MEDORA remains a healthcare/pharmacy ERP foundation rather than a complete all-industry ERP suite. Within insurance, however, the gap between documentation and executable capability has been materially reduced: the repository now has persisted payer connector profiles, structured benefit/coverage rules, claim lifecycle event history, claim attachment references, and provider/payer message records, while external network submission remains fail-closed.

| Insurance capability | Executable evidence | Status | Remaining boundary |
|---|---|---|---|
| Insurance member / policy reference | `insurance_members`, hashed member references | **Implemented foundation** | Full payer-specific policy-card fields remain configurable rather than universal. |
| Payer contracts | `insurance_payer_contracts`, `egyptHealthcare.createPayerContract` | **Implemented foundation** | Contract execution depends on real payer terms and credentials. |
| Eligibility / coverage requests | `insurance_requests`, `insurance.list/create/transition` | **Implemented internal workflow** | Live eligibility transport is blocked until payer contract/mapping/sandbox/credentials exist. |
| Benefits / limits / co-pay / deductible / exclusions | `insurance_coverage_rules`, `insuranceExecution.coverageRules/upsertCoverageRule` | **Implemented internal rules surface** | Adjudication against a live payer is not performed automatically. |
| Referral requirements | `insurance_coverage_rules.requiresReferral` | **Persisted rule** | Payer-specific referral validation must be supplied by the payer contract/rules. |
| Preauthorization | `insurance_preauthorizations`, `egyptHealthcare.createPreauthorization` | **Implemented internal workflow** | Live submission remains gated. |
| Claims lifecycle | `insurance_claims`, `claims/createClaim/transitionClaim` | **Implemented internal workflow** | Live submission/adjudication remains gated. |
| Immutable claim event history | `insurance_claim_events` + DB triggers | **Implemented** | External payer event signatures remain payer-contract dependent. |
| Supporting clinical documents | `insurance_claim_attachments` + `attachClaimDocument` | **Implemented as secure references** | Binary storage/scanning/virus controls remain infrastructure-dependent. |
| Rejection / resubmission | Claim status model includes `rejected` and `appealed`; payer connector stores rejection mapping readiness | **Implemented foundation** | A payer-specific resubmission transport still requires its contract. |
| Remittance / reconciliation | `insurance_remittances`, `createRemittance` | **Implemented internal foundation** | Automated inbound remittance transport/adjudication is not activated. |
| Appeals | `insurance_appeals`, `createAppeal` | **Implemented internal foundation** | External appeal submission remains gated. |
| Provider ↔ payer communication | `insurance_payer_messages`, `queuePayerMessage/payerMessages` | **Implemented queue/audit surface** | Outbound network delivery is deliberately blocked. |
| API payer connector boundary | `insurance_payer_connectors.connectorType=api` | **Implemented configuration boundary** | No payer endpoint is claimed active without evidence. |
| Portal / website connector boundary | `insurance_payer_connectors.connectorType=portal` | **Implemented configuration boundary** | MEDORA does not bypass CAPTCHA, MFA, anti-bot or access controls; portal automation requires authorization and technical acceptance. |
| Arabic / English | Existing bilingual product surface and insurance domain vocabulary | **Partially implemented** | Full bilingual insurance UI coverage must be verified page-by-page. |
| Egypt readiness | Egypt-scoped authorization and compliance gates | **Implemented gating** | UHIA/EHA or insurer production certification is not claimed. |

## What was actually missing

The audit found that the previous documentation was too conservative in one direction and too broad in another. The repository already contained executable claims, preauthorization, remittance, appeal, and payer-contract procedures in `egypt-healthcare.ts`, so describing the insurance area as if claims/remittance were entirely absent understated the implementation. Conversely, the earlier documentation described a payer interoperability surface that did not yet have persisted connector profiles, structured coverage rules, attachment references, message records, or an immutable claim-event table. Those are now present.

The new execution surface closes these concrete gaps:

1. **Payer adapter registry** — stores API vs portal connector type, endpoint reference, authentication reference, mapping verification, sandbox verification, and human acceptance state.
2. **Coverage/benefit rules** — persists coverage percentage, co-pay, deductible, annual/visit limits, exclusions, preauthorization and referral requirements, with effective dates.
3. **Claim event history** — records claim creation and subsequent database-level claim updates/status changes in an append-oriented event table with payload and record hashes.
4. **Claim attachments** — stores only controlled document references and SHA-256 fingerprints; it does not expose arbitrary file bytes through the insurance router.
5. **Payer communication queue** — records outbound/inbound message metadata and payload hashes while keeping network submission blocked.
6. **Production-readiness enforcement** — payer connectors cannot be marked production-ready unless mappings, sandbox validation, rejection handling, and acceptance criteria are all verified.

## What is still deliberately not implemented

These are not defects to hide; they are external dependencies or infrastructure boundaries:

- Live insurer API calls for eligibility, preauthorization, claims, status, remittance, or appeals.
- Automated login to arbitrary insurer websites.
- CAPTCHA/MFA/anti-bot bypass.
- Payer adjudication logic that invents benefits or coverage when the payer has not supplied authoritative rules.
- Production credentials, certificates, facility registrations, payer contracts, or regulatory approvals.
- Universal Egyptian insurer mappings without insurer-specific technical contracts.
- Automatic binary document ingestion/scanning unless a governed document-storage service is configured.

## Truth boundary

The system may now persist and operate the **internal insurance workflow** end-to-end across eligibility, coverage rules, preauthorization, claims, attachments, remittance, appeals, communication records, and audit events. It must still report external connectivity as **blocked** until the payer supplies an approved endpoint/channel, authentication and certificate requirements, message schemas, mapping/validation evidence, sandbox acceptance, operational ownership, and production authorization.

No UI label, seeded payer name, or configuration record is itself proof of live insurer connectivity or governmental certification.

## Verification requirement

After applying migration `0059_insurance_execution_surface.sql`, the repository's normal verification commands remain authoritative: `pnpm check`, `pnpm test`, and `pnpm build`. The GitHub connector used for this change can verify committed source state but cannot execute the project's local Node/PNPM test suite in this session; therefore no test pass is claimed here without a workflow result.
