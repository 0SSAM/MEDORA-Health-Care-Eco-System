# MEDORA AI Fabric

> A governed AI operating layer for MEDORA. This document defines the architecture to implement and verify AI capabilities across CRM, HR, Customer Care, Insurance, Pharmacy, Clinical, ERP, Finance, and Reporting.

## Design principle

MEDORA should learn from the architectural patterns in OB1 without copying its implementation or license. OB1 demonstrates the value of a portable AI layer, explicit tool contracts, retrieval, metadata, provenance, and MCP-based access. MEDORA must add healthcare-grade tenant isolation, RBAC, consent, purpose limitation, auditability, and approval gates.

## Capability pipeline

```text
Domain data
   -> authorized context retrieval
   -> normalization / metadata / provenance
   -> AI reasoning
   -> evidence + confidence + citations
   -> recommendation
   -> policy evaluation
   -> optional human approval
   -> authorized execution
   -> immutable audit event
```

AI output is advisory by default. A model response must never become a clinical, financial, insurance, HR, pharmacy, or security mutation merely because a model generated it.

## Tool contract

Every AI tool belongs to one of four classes:

| Class | Meaning | Default permission |
|---|---|---|
| `read` | Retrieve authorized records or aggregates | User's read permissions |
| `analyze` | Produce derived analysis without mutation | User's read permissions |
| `recommend` | Produce a proposed action | User's relevant read permissions; no mutation |
| `execute` | Perform a mutation | Explicit underlying mutation permission + policy gate |

An AI principal can never gain permissions that the invoking user does not have.

## Security boundary

The effective authorization context is:

`identity -> organization -> branch/jurisdiction -> role -> permission -> resource -> purpose -> consent/policy -> audit`

The AI layer must preserve the same boundary as direct application access. Cross-tenant retrieval, unrestricted service-role access, hidden privilege escalation, and model-only authorization are prohibited.

## Sensitive-domain rules

### Clinical

AI may summarize, search, compare, flag, or recommend. Clinical decisions remain attributable to an authorized clinician/workflow.

### Pharmacy

AI may assist with medication information, inventory analysis, FEFO alerts, dispensing review, and operational recommendations. Dispensing, controlled-product handling, and clinical safety gates remain server-side workflows.

### Insurance

AI may classify documents, summarize payer rules, identify missing claim evidence, suggest coding/claim corrections, and prioritize follow-up. Submission, resubmission, approval, and financial reconciliation remain explicit authorized transactions.

### HR

AI may assist with workforce analytics, policy lookup, summaries, and recommendations. Employment-impacting actions require the normal HR authorization and audit trail.

### CRM / Customer Care

AI may summarize customers, classify cases, suggest responses, detect SLA risk, and recommend next actions. Outbound or state-changing actions require the corresponding channel and workflow permissions.

### Finance / ERP

AI can explain variances and recommend actions, but cannot silently post journals, alter balances, or close periods.

## Memory and retrieval

MEDORA should use an evidence-first context model rather than a generic global memory store.

Each retrievable AI context item should carry:

- organization and branch scope
- source domain and record identifier
- event timestamp
- author/actor where applicable
- provenance/source reference
- sensitivity classification
- retention class
- content fingerprint for deduplication
- embedding metadata where vector retrieval is enabled

Search results must be filtered by authorization before they enter model context.

## Provenance

Every material AI recommendation should be traceable to the records or aggregates that informed it. The audit trail should distinguish:

1. source facts
2. derived calculations
3. model output
4. human review
5. executed transaction

Generated text is never treated as a source fact.

## Reporting and AI

AI reporting should sit on top of the same reporting semantics as normal BI:

`metric definition -> authorized dataset -> calculation -> evidence -> narrative`

This prevents plausible-looking AI narratives from becoming an alternative source of truth. Reports should expose drill-through lineage whenever the underlying data supports it.

## MCP boundary

If MEDORA exposes an MCP server in the future, it should expose narrowly scoped tools rather than a universal database tool. Recommended initial tools:

- `search_records`
- `fetch_record`
- `get_kpi`
- `get_report`
- `get_ai_insight`
- `create_recommendation`
- `approve_recommendation`
- `execute_authorized_action`

Read-only tools should be explicitly marked read-only by their tool metadata. Mutation tools should require the same server-side authorization used by the corresponding tRPC procedure.

## Observability and governance

Every AI invocation should be attributable to:

- actor/principal
- organization
- tool or workflow
- model/provider
- model version where available
- policy version
- input/output token or cost metadata where available
- latency
- result classification
- review/approval status
- final outcome

Secrets, access tokens, credentials, and raw sensitive payloads must not be written to ordinary application logs.

## Evaluation

Production AI is not complete when the prompt works. MEDORA should maintain evaluation sets for:

- correctness
- groundedness
- authorization leakage
- tenant isolation
- prompt injection resistance
- sensitive-data handling
- Arabic/English quality
- deterministic business-rule adherence
- cost and latency

High-risk workflows require regression tests before release.

## Implementation rule

The repository's capability truth map remains authoritative. AI features must be classified as implemented only when the corresponding schema, server logic, authorization, UI integration, and tests exist. Architecture documents must not be used as evidence that a capability is already operational.

## Adoption roadmap

### P0

- Consolidate existing `assistant`, `aiInsights`, `aiReview`, and `aiGovernance` around a shared authorization/context contract.
- Add provenance to AI recommendations.
- Add tenant-scope regression tests for every AI retrieval path.
- Ensure AI mutations call existing domain procedures rather than direct database writes.

### P1

- Add provider/model registry and cost telemetry.
- Add evaluation datasets and regression harness.
- Add evidence-linked reporting narratives.
- Add an MCP adapter exposing only explicitly approved tool contracts.

### P2

- Add domain-specific agent workflows with approval policies.
- Add durable AI memory with retention and consent controls.
- Add model routing/fallback policies and quality/cost optimization.
