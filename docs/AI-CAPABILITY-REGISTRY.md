# MEDORA AI Capability Registry

## Purpose

This registry turns the architectural lessons from the referenced AI ecosystems into an enforceable MEDORA inventory. It is deliberately a **capability registry**, not a promise that every external provider is connected.

The design draws on two public repositories the MEDORA workstream reviewed:

- `cporter202/ai-agent-tools`: useful as a discovery catalogue for agents, models, multimodal tools, AI phone agents, marketing, and content capabilities. MEDORA should copy the **catalogue concept and metadata discipline**, not vendor code or commercial assumptions.
- `cporter202/agentic-ai-apis`: useful as a discovery catalogue across Agents, AI Models, and MCP Servers. MEDORA should treat entries as candidates for evaluation, never as trusted integrations merely because an API is listed.

OB1/Open Brain remains a separate architectural reference for governed memory, provenance, vector retrieval, and narrow MCP tools; it is not a code dependency.

## Capability states

Every AI capability must have exactly one state:

1. `implemented_tested`
2. `foundation_not_production_integrated`
3. `planned`
4. `blocked_external_prerequisite`

## Required registry fields

| Field | Requirement |
|---|---|
| capability | Stable MEDORA capability identifier |
| domain | CRM, HR, Customer Care, Insurance, Pharmacy, Clinical, ERP, Finance, Reporting, Platform |
| mode | read, analyze, recommend, execute |
| data_classification | public, internal, confidential, regulated |
| provider | Internal or verified external provider name |
| model | Exact model/version when applicable |
| tool | Narrow tool/function identifier when applicable |
| auth_method | Session, service identity, OAuth, API key, etc. |
| languages | Supported locales, including `ar` / `en` where applicable |
| tenant_scope | Organization/branch/jurisdiction enforcement |
| human_gate | Required for high-impact actions |
| provenance | Source/evidence references |
| cost_policy | Budget/usage control |
| latency_target | Operational target |
| production_status | One of the four states above |
| evaluation_suite | Correctness, groundedness, leakage, injection, authorization, Arabic/English quality, cost, latency |

## Non-negotiable execution policy

AI receives no authority that the invoking identity does not already possess. The effective policy is:

`identity → organization → role → permission → resource → purpose/policy → audit`

An AI response is never itself the source of truth for clinical, insurance, financial, regulatory, identity, or compliance facts.

### Read

AI may retrieve only data already authorized for the caller and only for an explicit purpose.

### Analyze

AI may transform authorized data, but outputs must preserve provenance and identify uncertainty where material.

### Recommend

Recommendations are advisory unless a separate human/system policy permits execution.

### Execute

Execution requires the same server-side authorization as a direct user action, plus domain-specific gates. Clinical prescribing/dispensing, insurance submission, payments, destructive administration, and statutory/regulatory submission must retain explicit controls and auditability.

## MCP boundary

MCP tools should be narrow, typed, scope-aware, and auditable. Prefer tools such as:

- `search_authorized_records`
- `fetch_authorized_record`
- `create_ai_review`
- `list_ai_reviews`
- `capture_ai_observation`
- `get_capability_status`

Avoid a generic `execute_anything` tool. Write tools must declare their side effects and authorization requirements.

## Discovery-to-production workflow

1. Discover a candidate from a catalogue.
2. Record provider, model/tool, license, auth, cost, data classification, languages, and operational dependency.
3. Evaluate security, tenant isolation, prompt-injection resistance, data retention, and vendor terms.
4. Implement behind a narrow MEDORA adapter.
5. Run offline/unit/authorization/evaluation tests.
6. Promote only after sandbox/acceptance evidence exists.
7. Record production status and rollback plan.

## Domain guardrails

- **Clinical / Pharmacy:** no autonomous diagnosis, prescribing, dispensing, or clinical truth assertion.
- **Insurance:** no invented eligibility, benefits, payer rules, adjudication, or submission success.
- **Finance:** no autonomous posting, payment, period close, or reconciliation without the existing accounting authorization and control chain.
- **HR:** no automated high-impact employment decision without approved policy and human oversight.
- **Customer Care:** AI phone/voice agents may draft, triage, summarize, and assist; recordings, consent, retention, and tenant boundaries are mandatory.
- **CRM / Marketing:** generated content remains reviewable and must respect consent and brand policy.
- **Admin:** AI cannot disable, delete, downgrade, or remove the platform administrator or its invariant permissions.

## Initial MEDORA capability map

| Capability | Domain | Mode | State |
|---|---|---|---|
| Governed assistant | Platform | analyze/recommend | foundation_not_production_integrated |
| AI insights | Reporting | analyze | implemented_tested |
| AI review and recommendations | Platform | analyze/recommend | implemented_tested |
| Prescription extraction | Pharmacy | analyze | foundation_not_production_integrated |
| Customer-care summarization | Customer Care | analyze | foundation_not_production_integrated |
| Customer-care call assistant | Customer Care | recommend | planned |
| CRM content assistance | CRM | recommend | planned |
| HR analytics assistance | HR | analyze | planned |
| Insurance workflow assistant | Insurance | analyze/recommend | foundation_not_production_integrated |
| Financial analysis assistant | Finance | analyze | planned |
| Governed MCP memory/retrieval | Platform | read/analyze | planned |

## Acceptance gate

No catalogue entry, model listing, MCP server listing, or vendor marketing page changes a capability's production state. Promotion requires executable MEDORA evidence: tests, authorization coverage, provenance, tenant isolation, operational ownership, and—where an external integration is involved—verified endpoint/authentication/sandbox/acceptance evidence.
