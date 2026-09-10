# MEDORA — Comprehensive Capability Delivery Plan

> **Delivery principle / مبدأ التسليم:** MEDORA expands only through server-enforced organization, branch, jurisdiction, role, audit, and privacy boundaries. A feature is not considered complete merely because it has a screen. Every completed increment requires a data model where needed, protected procedure, user experience, auditability, and regression coverage.

## Delivery map / خريطة التنفيذ

| Capability / القدرة | Current foundation / الأساس الحالي | Delivery increment / الزيادة المطلوبة | Boundary / الحد الإلزامي |
| --- | --- | --- | --- |
| Government and regulator connectivity / الارتباط الحكومي | Fail-closed connector registry and jurisdiction compliance lifecycle | Acceptance packet, evidence mapping, secret-reference and production-acceptance workflow | No network path, authority simulation, credential value, or activation before official authorization |
| Insurance / التأمين | Scoped requests, readiness gates, policy-first internal lifecycle | Internal case intake, evidence, approval and reconciliation workbench | No payer transport, adjudication claim, remittance, or approval inference without a payer contract and sandbox acceptance |
| HR and attendance / الموارد البشرية والحضور | Scoped user, branch, and role vocabulary | Employee directory, attendance, leave, approval and audit workflows | Payroll/tax calculations remain jurisdiction-gated and require statutory rules and owner sign-off |
| CRM and customer care / إدارة العملاء | Customer profiles, care interactions, call tickets | Leads, controlled pipelines, internal campaigns and owner-approved service follow-up | No marketing delivery or profiling without documented consent, purpose and channel configuration |
| Promotions / العروض | Scoped draft/approval promotions | Campaign, coupon, audience, approval and usage controls | No unreviewed price manipulation, medical claim, or unsanctioned outbound delivery |
| Finance and procurement / المالية والمشتريات | POS, tax invoices, returns, stock batches | Internal requisition, approval, receiving, expense and reconciliation controls | No official tax transfer or external payment settlement without approved contracts and regulated acceptance |
| Reporting and notifications / التقارير والإشعارات | Scoped definitions, run history, in-app notifications | Approved deterministic delivery, retry/dead-letter evidence and operator audit | No PHI export or external channel until deployed, configured, and separately authorized |
| Offline resilience / العمل دون اتصال | Scoped drafts, safe replay and protected final actions | Conflict evidence, operator decision trail, support matrix and recovery drill | Regulated financial, clinical, tax, and external submissions remain online-confirmed only |
| Clinical reference and AI / المراجع السريرية والذكاء الاصطناعي | Pharmacist verification and reference boundaries | Governed reference lookup, human-review and model-use audit | No autonomous diagnosis, clinical decision, coding, or authority submission |
| Security operations / عمليات الأمن | Role checks, session hardening, rate limits, redaction, signed audit | Security headers, trusted-proxy limits, CSRF/XSS review, dependency audit, access review and incident evidence | Deployment WAF, managed identity, device attestation and independent penetration testing need deployment-owner action |

## Release gates / بوابات الإصدار

| Gate | Completion evidence |
| --- | --- |
| Scope safety | Every record and procedure states organization, branch, jurisdiction and role boundaries; missing scope blocks execution. |
| Data protection | Secret values, health narratives and government identifiers are not returned in list views, logs, or client storage. |
| Operational integrity | Important mutations have explicit lifecycle transitions, idempotency where retries exist, and audit records. |
| User experience | Bilingual empty/loading/error states make blocked and pending conditions visible without suggesting false approval. |
| Verification | Domain tests, router contract tests, TypeScript, production build and responsive checks pass. |
| External activation | Official contract, scope registration, credentials, sandbox evidence, security review and written acceptance exist; a separate audited change authorizes activation. |

## Sequencing / التسلسل

The immediate delivery sequence prioritizes high-leverage internal controls: operational health visibility, backup/restore evidence, conflict resolution, support diagnostics, and the first protected HR/CRM/procurement workflows. It then strengthens reports, notifications, and security boundaries. This sequence deliberately does not convert blocked government, insurance, payment, or clinical connectors into pretend integrations.

يتقدم التسليم الفوري من خلال ضوابط داخلية ذات أثر مرتفع: إظهار صحة المنظومة، وأدلة النسخ والاستعادة، وحل التعارضات، وتشخيص الدعم، وأولى تدفقات HR وCRM والمشتريات المحمية. ثم تُعزز حدود التقارير والإشعارات والأمن. ولا يحوّل هذا التسلسل الموصلات الحكومية أو التأمينية أو الدفع أو السريرية المغلقة إلى تكاملات شكلية.
