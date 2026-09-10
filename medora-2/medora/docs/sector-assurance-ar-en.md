# MEDORA Sector Assurance Matrix | مصفوفة ضمان القطاعات

## Purpose | الغرض

This document is the current engineering assurance boundary for the CRM, HR, customer-care, AI/reporting, and platform-administration surfaces. It distinguishes implemented software capabilities from jurisdictional or external prerequisites; it does not convert a foundation into a claim of regulatory certification.

هذه المصفوفة توثق حدود الضمان الهندسي الحالية لقطاعات CRM والموارد البشرية وخدمة العملاء والذكاء الاصطناعي والتقارير وإدارة المنصة. وهي تميز بين القدرات البرمجية الموجودة وبين المتطلبات التنظيمية أو الخارجية، ولا تعتبر شهادة امتثال أو اعتمادًا قانونيًا.

## CRM | إدارة علاقات العملاء

**Implemented foundation:** scoped contacts, consent status, leads, opportunities, activities, assignment validation, branch/jurisdiction scope checks, audit evidence, and customer-linked workflows are present in `server/routers/secondaryModules.ts` and the corresponding workspace.

**Assurance rule:** customer/contact/opportunity/activity references must remain organization-scoped; a UI control never grants authorization by itself.

**Production boundary:** CRM communications still depend on configured and verified external provider contracts where applicable.

## HR / People | الموارد البشرية

**Implemented foundation:** employee profiles, organization/branch vocabulary, contracts, shifts/attendance and performance-review workflows are represented in the schema and secondary-module services, with shared organization/branch/jurisdiction validation.

**Assurance rule:** employee and assignment operations remain scoped to the organization and active branch membership.

**Production boundary:** statutory payroll, tax, social-insurance and country-specific employment calculations require jurisdiction-approved rules and owner acceptance before they can be represented as authoritative payroll execution.

## Customer Care / Call Centre | خدمة العملاء ومركز الاتصال

**Implemented foundation:** customer profiles, care cases, care interactions, satisfaction records, tasks, call queues, queue membership, call tickets, call interactions, assignment/update workflows and SLA-oriented monitoring are present.

**Assurance rule:** tickets, cases, customers, assigned users and linked communications must remain organization/branch scoped; provider callbacks must be signature-verified before mutation.

**Production boundary:** telephony, WhatsApp, SMS and other provider transports remain fail-closed until credentials, endpoint contracts, signature validation and acceptance evidence are configured.

## AI + Reporting | الذكاء الاصطناعي والتقارير

**Implemented foundation:** AI governance, AI insights, AI review, assistant capabilities, KPI/reporting routers and secondary-module AI recommendations are registered server capabilities. AI review/reporting is designed around evidence, scores, recommendations and auditability rather than treating generated text as an authoritative transaction.

**Assurance rule:** AI output is advisory unless a separately authorized workflow explicitly commits a regulated mutation. Sensitive operational data must stay inside the same organization/jurisdiction authorization boundary as the underlying source data.

**Production boundary:** model/provider availability, data-processing terms, retention policy, human review and jurisdiction-specific clinical/privacy approval remain deployment prerequisites. No AI response is itself proof of clinical, legal, financial or regulatory correctness.

## Platform Admin / Users Control | إدارة المنصة والمستخدمين

The `/admin` console is explicitly restricted in the UI to the platform `admin` role. It provides the existing employee-directory administration surface, organization selection, role/branch management where allowed, privilege visibility and CSV export.

The platform `admin` role remains a super-permission identity in RBAC. The admin-account credential workflow is separately protected by an explicit admin-only guard and re-verification of the current password for username/password changes.

**Non-negotiable invariant:** the platform admin must not be removable, self-disabled, or stripped of the foundational platform-admin privilege set by ordinary organization-user controls. Organization-level roles must never be able to elevate themselves to `org_admin` through the employee console.

## Verification status

- CRM / HR / Customer Care: implemented scoped foundation with regression contracts.
- AI / reporting: implemented advisory/governed foundation; external model and regulatory prerequisites remain deployment gates.
- User administration: platform-admin-only console is enforced at the UI boundary; server authorization remains authoritative.
- Tenant isolation: organization/branch/jurisdiction checks are required at server boundaries and are independently regression-tested in the relevant modules.
- Production readiness: do not mark a sector `fully production certified` solely from source presence; require successful CI, database migration validation, end-to-end acceptance and applicable external/regulatory evidence.
