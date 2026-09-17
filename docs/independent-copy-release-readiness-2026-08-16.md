# MEDORA — Independent Copy Release Readiness

**Date:** 16 August 2026  
**Scope:** Internal operational expansion, regulatory-connection readiness, technical hardening, governed AI, and workplace-monitoring readiness.

## Arabic Summary

هذه النسخة المستقلة من MEDORA جاهزة للاستخدام الداخلي المنضبط وللتهيئة التدريجية قبل الإنتاج. تم توسيع عمليات الموارد البشرية والمشتريات وإدارة علاقات العملاء، وتثبيت حدود التقارير والعمل دون اتصال، وتحسين حماية HTTP والجلسات والحدود الموثوقة للوكيل، ومراجعة حدود الصلاحيات والتكاملات. كما أضيفت حزمة جاهزية ثنائية اللغة للربط التنظيمي، تظل جميع موصلات الجهات الحكومية والتأمين فيها **معطلة افتراضيًا ومقفلة عند الفشل**.

تضم المنظومة أيضًا طبقة حوكمة للذكاء الاصطناعي مخصصة للاستخدامات التشغيلية غير الحساسة، مع مراجعة بشرية وتدقيق ومنع صريح للقرارات السريرية أو الوظيفية أو التنظيمية التلقائية. وتبقى مراقبة مواقع العمل غير مفعلة: لا يوجد اتصال بكاميرات أو ميكروفونات، وتمنع السياسات التعرف على الوجوه والهوية البيومترية واستنتاج المشاعر والتسجيل الخفي وتقييم العاملين تلقائيًا.

> اجتازت النسخة عند إقفال العمل **104 ملفات اختبار** و**341 اختبارًا**، مع تخطي اختبارات تكامل مقصودة، بالإضافة إلى فحص TypeScript وبناء الإنتاج. تحذير حجم الحزم الأمامية ليس فشلًا في البناء، لكنه فرصة مستقبلية لتقسيم الشيفرة ديناميكيًا.

## What Is Ready Internally

| Area | Ready internal capability | Safety boundary |
|---|---|---|
| Operations | Employee, leave, attendance, purchasing-request, and CRM foundations are scoped by organization, branch, jurisdiction, role, and audit trail. | No unscoped organization or branch operation is permitted. |
| Regulatory readiness | Versioned acceptance packet, evidence gates, redacted administrative status, and tamper-evident audit events. | No government request can be activated without verified approvals and artifacts. |
| Reporting and offline | Scheduled-report release gate, deterministic server boundary, safe local-draft policy, and conflict-aware controls. | No unapproved scheduled delivery, PHI local persistence, or regulated offline replay. |
| Security | Hardened HTTP headers, request and upload limits, trusted-proxy controls, authentication/authorization review, and protected routes. | Sensitive routes and actions remain server-authorized and fail closed. |
| AI assistance | Organization-scoped operational use-case registry, human review, auditability, protected-data restrictions, and readiness UI. | No automatic clinical, employment, or regulated external decision. |
| Workplace monitoring | Purpose, notice/consent, retention, access, incident-review, and vendor-readiness controls. | Ingestion is disabled; biometric and covert-monitoring patterns are prohibited. |

## External Prerequisites That Remain Intentionally Blocked

| Integration or action | Required before activation |
|---|---|
| Government authorities and e-invoicing | Official specifications, legal approval, organization and facility registration, certificates, credentials, sandbox endpoint, acceptance evidence, accountable owner, and production cutover approval. |
| Payers and insurers | Executed payer agreement, approved technical interface, sandbox validation, credential issuance, claims/remittance acceptance tests, and documented operating owner. |
| Camera or microphone systems | Documented lawful purpose, visible notice, valid consent or other lawful basis, retention schedule, security assessment, vendor agreement, isolated sandbox, named accountable owner, and human-reviewed acceptance. |
| Push, email, SMS, or external notifications | Approved provider, controlled credentials, sender identity, message templates, recipient consent, retention configuration, failure handling, and production release approval. |
| Recurring production automation | Explicit production release gate, tested schedule definition, accountable owner, idempotency proof, alerting, and rollback plan. |
| Country compliance activation | Approved non-stale country pack, official evidence linked to active rule keys, country-specific accountable reviewer, and effective/review dates. |

## English Summary

This independent MEDORA copy is ready for controlled internal use and staged pre-production preparation. Internal operations, regulatory-connection readiness, reporting and offline safety boundaries, HTTP and proxy hardening, AI governance, and privacy-first workplace-monitoring readiness have been implemented and reviewed. All government, insurer, camera, microphone, notification, and recurring-production connections remain disabled until the documented external approvals, credentials, sandbox validation, and accountable ownership requirements are satisfied.

## Release Notes

The database schema was extended through a non-destructive migration for internal operations. No production data was seeded. No government, insurer, camera, microphone, notification-provider, or other external regulated service was called, simulated as accepted, or enabled. Secrets remain managed outside source control.
