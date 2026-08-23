# MEDORA | دليل IT / Admin / Owner

## دليل الإدارة والتشغيل الآمن — Arabic / English

**الإصدار:** 2026-08-15
**قاعدة عامة:** لا تُخزّن الأسرار أو كلمات المرور أو مفاتيح التشفير في هذا الدليل.

## المالك | Owner

**العربية.** يحتفظ المالك بسجل الإصدارات، أرشيف المصدر، manifest البصمة، السجلات القانونية، واتفاقيات الملكية والتراخيص خارج النظام أيضاً. يراجع تقارير التدقيق والتكاملات، ولا يمنح صلاحيات دائمة إلا عند الحاجة. تغيير الهوية أو الشعار أو قالب الفاتورة يجب أن يكون موثقاً ومراجَعاً.

**English.** The owner retains release records, source archives, ownership manifests, legal records, and licensing agreements outside the application as well. The owner reviews audit and connector reports and avoids permanent privilege grants. Product identity, logo, and invoice-template changes must be documented and reviewed.

## المسؤول الإداري | Administrator

يتحقق المسؤول من نطاق المؤسسة والفرع قبل إنشاء المستخدمين أو تغيير الصلاحيات. يستخدم لوحة الموصلات لمراجعة الدولة والجهة والنوع ومرحلة الجاهزية، ولا يفعّل موصلاً رسمياً من الواجهة ما لم تتوافر المواصفات والاعتماد وبيئة الاختبار ودليل القبول.

The administrator verifies organization and branch scope before managing users or permissions. The connector dashboard is used to review country, provider, type, and readiness. Official connectors remain disabled until specifications, credentials, test environment, and acceptance evidence exist.

| إجراء إداري | ضابط إلزامي |
|---|---|
| إنشاء مستخدم | أقل صلاحية، فرع محدد، سجل تدقيق |
| تغيير دور | موافقة موثقة ومراجعة أثر الصلاحية |
| تعديل قالب فاتورة | نطاق المؤسسة/الفرع، تدقيق، وعدم تخزين bytes في قاعدة البيانات |
| اعتماد كتالوج | مصدر وترخيص ومراجعة بشرية |
| تغيير موصل | سبب، حالة سابقة/جديدة، وعدم كشف الأسرار |

## مسؤول تقنية المعلومات | IT operator

### Secrets and key custody

تُحقن الأسرار عبر بيئة التشغيل أو مدير أسرار معتمد. لا تُرسل عبر البريد أو التذاكر ولا تُضاف إلى المستودع أو ملفات PDF. يجب تسجيل رقم إصدار المفتاح وتاريخ التدوير دون تسجيل قيمة المفتاح.

Secrets are injected through the runtime environment or an approved secrets manager. Never place them in source control, tickets, email, or manuals. Record key version and rotation date, never the key value.

### Backup and restore runbook

1. تحقق من نطاق النسخة ووقت UTC وحالة المهمة.
2. تأكد من تشفير النسخة ومكان حفظ المفتاح خارج البيانات.
3. اختبر الاستعادة أولاً في بيئة معزولة لا تصل إلى الإنتاج.
4. تحقق من عدد المؤسسات والفروع والفواتير وسجلات التدقيق والملفات المرجعية.
5. راجع فشل الهاش أو فقدان الروابط أو اختلاف الأرقام قبل أي قرار استعادة.
6. نفذ الاستعادة بموافقة المالك وسجل المشغل والسبب والنسخة.
7. أجرِ اختبار دخول وصلاحيات وقراءة فاتورة ومراجعة audit بعد الاستعادة.

### Weak-connection and offline support

The system supports safe non-regulated drafts only when offline. IT must not convert the draft queue into an automatic financial replay mechanism. A network retry must use a stable idempotency key and must move to manual review when server confirmation is uncertain.

### Migration

يجب أخذ نسخة المصدر وhash لها، ثم إجراء profiling وmapping وdry-run وتقرير تعارضات. لا تُدمج بيانات مجهولة أو مكررة في الإنتاج. كل دفعة تحتاج source fingerprint وoperator وscope وidempotency key وتقرير reconciliation.

## مراقبة الحوادث | Incident response

عند الاشتباه بتسريب أو تجاوز نطاق: أوقف الحساب أو الموصل، احفظ السجلات، لا تحذف الأدلة، دوّن UTC timeline، افحص المفاتيح والتغييرات، وابدأ استعادة معزولة فقط بعد قرار موثق. لا تستخدم السجل لتخزين أسرار أو بيانات صحية غير ضرورية.

## Supported deployment posture

MEDORA is tested as a responsive web application on current Chromium/Edge, Safari iOS, and Chrome Android. Windows 7 requires a managed supported browser or wrapper and is not a blanket compatibility promise. Low-end devices should use reduced motion, paginated views, and limited simultaneous modules.

## Acceptance checklist

| Check | Pass evidence |
|---|---|
| Tenant isolation | Cross-organization query tests and denied-access audit |
| Permission boundary | Role matrix tests and UI visibility review |
| Backup | Encrypted artifact, isolated restore log, reconciliation report |
| Migration | Dry-run report, conflict queue, idempotency evidence |
| Offline | Draft-only evidence and blocked regulated mutation test |
| Recovery | Incident timeline, key rotation record, post-restore smoke test |
| Release | Vitest, TypeScript, production build, responsive smoke tests |

## References

1. [MEDORA comprehensive platform audit](comprehensive-platform-audit-2026-08-15.md)
2. [MEDORA ownership notes](ownership-notes.md)
3. [MEDORA operations guide](operations.md)
4. [MEDORA capability gap report](capability-gap-report.md)
