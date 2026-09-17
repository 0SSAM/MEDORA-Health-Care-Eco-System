# Operations Runbook

## Initial setup

Create the first owner/admin through the managed authentication flow, then create branches and assign users through the database-backed administration workflow. Do not place credentials, taxpayer certificates, gateway keys, or provider secrets in source control. Each branch manager must be mapped to the branch whose alerts they are allowed to read.

## Daily inventory alerts

The callback is `POST /api/scheduled/inventory-alerts`. It accepts only a platform-authenticated cron session, resolves the durable `taskUid` from `scheduled_jobs`, scans batch quantities and expiry windows, and inserts deduplicated rows into `branch_alerts` for active users whose role is `manager`. It is designed to return a 2xx response for orphaned tasks so platform retries do not create noise.

The production schedule must be created only after the project is deployed and the callback is reachable from the production URL. Use a six-field UTC cron expression such as `0 0 6 * * *` for a daily 06:00 UTC run. The current implementation queues branch-scoped alerts; a push provider or approved notification channel must be connected before `queued` records can be marked `sent`.

## Regulated operations

Sales, inventory deduction, insurance submission, fiscal submission, payroll approval, and prescription dispensing must be treated as server-confirmed operations. A browser draft or PWA cache must never be interpreted as a completed regulated transaction. Prescription extraction is an assistant: a pharmacist must review and confirm each item before the dispensing workflow can proceed.

## Release gate

Before production use, configure official integrations, verify certificates and provider contracts, test with each branch, run `pnpm check`, `pnpm test`, and `pnpm build`, verify browser flows on Windows and mobile Safari/Chrome, and review audit records for every critical mutation. Regulatory approval and payment success must be verified from the relevant external system, not inferred from a local status.

## Backup and restore

قاعدة البيانات هي مصدر السجل التشغيلي، بينما تخزن الصور والملفات في التخزين الكائني المدمج. قبل أي ترقية يجب أخذ نسخة قاعدة بيانات مشفرة عبر أدوات مزود المنصة، وتسجيل رقم النسخة ووقت UTC ومالك العملية في سجل التغيير. لا ينفذ النظام استعادة مدمرة تلقائياً؛ تتم الاستعادة في بيئة منفصلة أولاً، ثم تُراجع الجداول الحساسة مثل المبيعات والمخزون والتدقيق، وبعد موافقة مسؤول النظام تُعاد الخدمة إلى النسخة المستعادة. يجب اختبار الاستعادة دورياً على نسخة غير إنتاجية، والتحقق من صلاحيات الوصول، وسلامة ملفات الوصفات، وتسلسل hashes في audit_logs.

لا تحفظ أسرار التكامل أو مفاتيح الدفع داخل المستودع. تُدار القيم عبر Secrets في بيئة المشروع، وتظل تكاملات EDA وETA وUHIA وTPA وInstaPay وMeeza في وضع غير متصل حتى يزوّد مالك النظام ببيانات اعتماد الإنتاج وموافقات الجهات المعنية.

## Cold-chain monitoring

Cold-chain batches must be evaluated against a configured minimum and maximum temperature range. The current release exposes a deterministic `evaluateColdChain` rule and a readiness boundary; it does not fabricate sensor readings. A production connector must provide signed readings, device identity, timestamp, branch, batch, and escalation status before the dashboard can show live compliance.

## Regulatory artifact boundaries

EDA, ETA, MOH, NFSA, UHIA, and syndicate workflows accept only reference identifiers and verification state in the current release. Legal labels carry product code, batch number, expiry date, barcode value, and QR payload, and remain marked unverified until the corresponding authority connector confirms them. No approval, invoice submission, license verification, or payment response is claimed without external credentials and a successful response.

## Intelligent reporting boundary

The current release has persisted report definitions and run history, scoped creation, a Heartbeat callback at `POST /api/scheduled/report-execution`, compliance-pack gates, deterministic idempotency, and an allowlisted server-side executor for inventory alerts, daily sales, expiry review, and operations summaries. A report must use a server-owned query key rather than user-supplied SQL, carry both organization and jurisdiction scope, name authorized recipient roles, and use a six-field UTC schedule. The Heartbeat callback skips inactive, legacy-unscoped, and unsupported definitions before querying. Runs store compact output references and are marked `succeeded` only after the scoped query completes; external email, push, and webhook delivery remains disabled until a reviewed delivery audit and channel are configured.

## Insurance eligibility and preauthorization boundary

The current release provides persisted, non-networked eligibility/preauthorization requests. Requests require payer code, a hashed member reference, service code, organization scope, jurisdiction scope, approved compliance-pack evidence, explicit lifecycle transitions, and a credential readiness gate. A preauthorization cannot be submitted when credentials are not configured, and a submitted request must carry an external reference. Lifecycle transitions require elevated organization roles, and external references are rejected for draft or preparation states. The policy does not call UHIA, a TPA, or any insurer API and must not infer coverage or approval from local state. Production activation requires verified payer documentation, facility registration, credentials or certificates, test and production endpoints, data-processing approval, and a responsible human owner.

## Validation note

With the current injected environment, `pnpm test` reports 126 passing tests and 4 optional database tests skipped because no valid MySQL `TEST_DATABASE_URL` is configured. TypeScript and the production build pass. A real database lifecycle remains a release prerequisite and must be run only against a disposable isolated test database.

## Diagnostic logging boundary

Integration failures are logged with bounded status and stable error metadata only. Storage and notification response bodies, raw exception messages, tokens, and patient or customer payloads must not be written to server logs. Development browser/network diagnostics may contain request metadata or response bodies depending on the local debug collector; they are not an audit trail and must be disabled or access-restricted in any production-like environment. Operational investigations should use scoped audit records and redacted deployment logs instead.
