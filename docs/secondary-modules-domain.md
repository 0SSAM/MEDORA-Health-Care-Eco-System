# MEDORA Secondary Modules Domain Model

## Scope and non-negotiable boundaries

CRM, HR, Call Center, and Customer Care share the MEDORA scope tuple: organization, branch, jurisdiction, user role, and environment mode. Every query, mutation, export, dashboard aggregate, AI prompt, and offline replay must derive scope on the server and fail closed when required scope is absent or inconsistent. Showcase data remains synthetic and isolated from operational records.

## Shared lifecycle and governance

All sensitive records use explicit lifecycle states and server-side transition policies. Actions that change ownership, approval, conversion, closure, payroll-impacting status, or regulated customer care status require an authorized role and a signed audit event. Duplicate submissions use an idempotency key or a unique business key. AI may suggest classifications, priorities, routing, summaries, or next actions, but it may not autonomously approve, settle, diagnose, alter payroll, or change a regulated record.

## CRM vocabulary

A lead is consent-aware and may progress from new to contacted, qualified, converted, lost, or do_not_contact. A contact/account stores only the minimum permitted customer relationship data. An opportunity records value, probability, expected close date, owner, and stage. Activities and follow-ups form the customer timeline. Conversion must preserve provenance and cannot bypass consent or organization scope.

## HR vocabulary

An employee profile is separate from login credentials. The HR lifecycle covers onboarding, active, on_leave, suspended, and inactive. Attendance is a daily, unique, auditable record with source and correction review. Leave requests use draft, submitted, approved, rejected, and cancelled states. Contracts, documents, shifts, performance, training, and offboarding are metadata and workflow records; file bytes belong in storage, not the database.

## Call Center vocabulary

A ticket has a channel, direction, priority, status, queue, assignee, SLA target, disposition, callback task, escalation state, and immutable interaction history. Routing must verify agent organization and branch scope. Closure requires a disposition and a traceable final action. Recording references are metadata only and must not expose content without authorization and retention policy.

## Customer Care vocabulary

A care case links a consent-aware customer profile to a request, complaint, follow-up, care plan, task, and timeline. Customer-facing status changes remain auditable. Satisfaction capture is optional and must represent actual user input only; the system must never seed or fabricate ratings or testimonials. Chronic-care fields require explicit consent and minimum-necessary access.

## Acceptance criteria

A module is called complete only when its primary workflows are available in the RTL task-oriented UI, backed by typed server procedures, covered by authorization and isolation tests, supported by loading/empty/error states, auditable, idempotent where applicable, integrated with relevant existing modules, and verified by TypeScript, focused tests, full tests, production build, and responsive desktop/mobile checks. External telephony, payroll providers, mail gateways, government systems, and physical devices remain explicitly integration-gated until real credentials or hardware are available.
