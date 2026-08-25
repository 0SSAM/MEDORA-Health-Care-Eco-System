# MEDORA Security Policy | سياسة أمان ميدورا

## Scope | النطاق

**MEDORA | ميدورا** is a multi-tenant healthcare operations platform for pharmacy, hospital, and connected healthcare-network workflows. This policy covers the source code, deployment configuration, server procedures, authentication and authorization boundaries, tenant isolation, audit trails, AI-assisted prescription workflows, integrations, and documentation maintained in this repository.

**MEDORA | ميدورا** هي منصة متعددة المستأجرين لعمليات الصيدليات والمستشفيات وشبكات الرعاية الصحية المتصلة. تشمل هذه السياسة الكود المصدري وإعدادات النشر وإجراءات الخادم وحدود المصادقة والتفويض وعزل المستأجرين وسجلات التدقيق ومسارات الوصفات المدعومة بالذكاء الاصطناعي والتكاملات والوثائق الموجودة في هذا المستودع.

## Security Principles | مبادئ الأمان

MEDORA follows a **fail-closed, least-privilege, tenant-isolated** approach. A feature must not silently proceed when identity, authorization, validation, regulatory prerequisites, or external integration state is missing. User-interface visibility is never a security boundary; sensitive authorization decisions belong on the server.

تتبع ميدورا نهجًا **مغلقًا عند الفشل، وأقل صلاحية ممكنة، وعزلًا صارمًا للمستأجرين**. لا يجوز للميزة أن تتابع التنفيذ بصمت عند غياب الهوية أو التفويض أو التحقق أو المتطلبات التنظيمية أو حالة التكامل الخارجي. لا يُعد إخفاء عناصر الواجهة حدًا أمنيًا؛ بل يجب أن تتم قرارات التفويض الحساسة على الخادم.

| Control | MEDORA expectation | التوقع في ميدورا |
|---|---|---|
| Tenant isolation | Every tenant- and branch-scoped read/write is authorized and scoped server-side. | كل قراءة وكتابة مرتبطة بالمستأجر والفرع يجب تفويضها وتحديد نطاقها على الخادم. |
| Authentication | Authentication state is validated before protected procedures execute. | التحقق من حالة المصادقة قبل تنفيذ الإجراءات المحمية. |
| Authorization | Server-side roles and permissions govern Admin, Pharmacist, Cashier, and Manager workflows. | تحكم الأدوار والصلاحيات على الخادم في مسارات المدير والصيدلي والكاشير والمشرف. |
| Biometrics | WebAuthn/Passkeys are used for device-based identity confirmation; raw biometric data is never stored or transmitted. | تُستخدم Passkeys/WebAuthn لتأكيد الهوية عبر الجهاز؛ لا يتم تخزين أو نقل البيانات البيومترية الخام أبدًا. |
| Sensitive data | Real patient, prescription, credential, and production financial data never belongs in fixtures, tests, issues, or pull requests. | لا يجوز استخدام بيانات المرضى أو الوصفات أو بيانات الاعتماد أو البيانات المالية الحقيقية في الاختبارات أو Issues أو Pull Requests. |
| Auditability | Important state transitions remain attributable, reviewable, and tamper-evident where implemented. | تبقى انتقالات الحالة المهمة قابلة للنسب والمراجعة ومقاومة للتلاعب حيثما تم تنفيذها. |
| AI safety | Prescription extraction is assistive only, requires pharmacist confirmation, and must not silently create a sale or dispense action. | استخراج الوصفات مساعد فقط، ويتطلب تأكيد الصيدلي، ولا ينشئ بيعًا أو صرفًا بصمت. |
| Integrations | Regulatory, payment, and external-service boundaries fail safely when unavailable or unverified. | تفشل حدود التكاملات التنظيمية والدفع والخدمات الخارجية بأمان عند عدم توفرها أو التحقق منها. |

## Supported Versions | الإصدارات المدعومة

Only the current `main` branch is actively supported with security updates. Long-lived branches receive fixes only when actively developed. Dependency vulnerabilities reported by Dependabot and CodeQL are remediated in prioritized update waves. Private previews and showcase deployments follow the same fix cadence but are scoped to non-production synthetic data only.

يشمل الدعم النشط بالإصلاحات الأمنية فرع `main` الحالي فقط. يُعالَج أي ضعف في الاعتماديات يبلغ عنه Dependabot أو CodeQL ضمن موجات تحديث مرتبة حسب الأولوية، وتُطبَّق نفس آلية الإصلاح على معاينات العرض مع حصرها على بيانات اصطناعية غير إنتاجية.

## Security Model | نموذج الأمان

MEDORA enforces a **defense-in-depth** posture across four layers: the transport layer (TLS-terminated, HSTS-ready), the application layer (server-side authentication and role authorization on every protected procedure, never trust-the-client), the data layer (tenant-scoped queries with authorization predicates applied before data access, parameterized statements through Drizzle ORM, and tamper-evident audit hash chains for consequential state transitions), and the operational layer (non-root container runtime, fail-closed integration boundaries, and secrets never present in source or build artifacts). Prescription AI outputs are assistive only: no AI-derived action can create a sale, dispense, invoice, or inventory movement without explicit pharmacist confirmation, and every AI-assisted event is recorded in the audit trail with its confidence state.

تفرض ميدورا وضعية **الدفاع المتعمق** عبر أربع طبقات: طبقة النقل (TLS محمية وجاهزة لـ HSTS)، وطبقة التطبيق (مصادقة وتفويض أدوار على الخادم لكل إجراء محمي — لا يُوثق بأي شيء على العميل)، وطبقة البيانات (استعلامات محدودة النطاق بالمستأجر مع فرض التفويض قبل الوصول للبيانات، وعبارات معلمة عبر Drizzle ORM، وسلاسل تجزئة تدقيق مقاومة للتلاعب لانتقالات الحالة المؤثرة)، وطبقة التشغيل (حاوية غير جذر، وحدود تكامل مغلقة عند الفشل، وأسرار لا تظهر أبدًا في الكود أو مخرجات البناء). مخرجات ذكاء الوصفات مساعدة فقط: لا يمكن لأي إجراء مشتق من الذكاء الاصطناعي إنشاء بيع أو صرف أو فاتورة أو حركة مخزون دون تأكيد صيدلي صريح، ويُسجَّل كل حدث مدعوم بالذكاء الاصطناعي في سجل التدقيق مع حالة الثقة.

## Supported Security Practices | الممارسات الأمنية المدعومة

The repository uses automated TypeScript checks, tests, production builds, isolated database lifecycle checks, CodeQL analysis, dependency review configuration, protected branches, and maintainer review for security-sensitive surfaces. These controls support engineering assurance; they do not replace a production penetration test, infrastructure review, formal regulatory approval, or an operational incident-response plan.

يستخدم المستودع فحوصات TypeScript واختبارات وبناء الإنتاج وفحوصات دورة حياة قاعدة بيانات معزولة وتحليل CodeQL وإعدادات مراجعة الاعتماديات وفروعًا محمية ومراجعة المشرف للأسطح الحساسة. تدعم هذه الضوابط ضمان الجودة الهندسي، لكنها لا تحل محل اختبار اختراق للإنتاج أو مراجعة للبنية التحتية أو موافقة تنظيمية رسمية أو خطة تشغيلية للاستجابة للحوادث.

## Reporting a Vulnerability | الإبلاغ عن ثغرة

Please **do not disclose suspected vulnerabilities in a public GitHub issue, pull request, discussion, screenshot, or commit**. Use GitHub's private vulnerability-reporting channel for this repository when available. If private reporting is not enabled, contact the repository owner privately through an existing trusted channel before sharing technical details. Do not send secrets or real healthcare data in any report.

يرجى **عدم نشر الثغرات المحتملة في Issue أو Pull Request أو نقاش أو لقطة شاشة أو Commit عام على GitHub**. استخدم قناة الإبلاغ الخاصة عن الثغرات في GitHub لهذا المستودع عند توفرها. وإذا لم تكن خاصية الإبلاغ الخاص مفعلة، فتواصل مع مالك المستودع عبر قناة موثوقة وخاصة قبل مشاركة التفاصيل التقنية. لا ترسل أسرارًا أو بيانات صحية حقيقية في أي بلاغ.

A useful report includes the affected component, route, procedure, or workflow; reproducibility steps; expected versus actual behavior; impact and likely abuse path; affected version or commit; and a safe proof of concept using synthetic data only.

يتضمن البلاغ المفيد المكوّن أو المسار أو الإجراء أو سير العمل المتأثر، وخطوات إعادة الإنتاج، والسلوك المتوقع مقارنة بالسلوك الفعلي، والأثر ومسار إساءة الاستخدام المحتمل، والإصدار أو Commit المتأثر، وإثبات مفهوم آمنًا يستخدم بيانات اصطناعية فقط.

| Include | Do not include |
|---|---|
| Affected file, route, procedure, or workflow. | Real patient or prescription records. |
| Reproduction steps and expected versus actual behavior. | Passwords, API keys, tokens, private keys, or database dumps. |
| Security impact and likely abuse path. | Unredacted screenshots or production URLs with sensitive parameters. |
| Suggested mitigation, if known. | Automated destructive testing against live systems. |

If the issue involves an active production system, stop testing, preserve only minimal non-sensitive evidence, and notify the owner immediately. Do not attempt to access data belonging to another tenant, patient, organization, or user.

إذا كانت المشكلة تتعلق بنظام إنتاج نشط، فأوقف الاختبار واحتفظ بأدلة غير حساسة وبالحد الأدنى فقط، وأبلغ المالك فورًا. لا تحاول الوصول إلى بيانات مستأجر أو مريض أو مؤسسة أو مستخدم آخر.

## Incident Response | الاستجابة للحوادث

Suspected breaches of a deployed MEDORA environment should trigger an immediate escalation sequence: isolate the affected environment from external access, preserve immutable evidence (audit hash chains, access logs, and server journals) without modifying it, rotate every credential that may have been exposed (JWT signing keys, session tokens, database credentials, storage keys, and integration secrets), and notify the repository owner through the private channel described above. Do not delete logs or attempt ad-hoc remediation before evidence is preserved; MEDORA's tamper-evident audit trails make forensic reconstruction possible precisely because they were never altered.

يجب أن يُفعّل أي اشتباه باختراق بيئة ميدورا منشورة تسلسل تصعيد فوري: عزل البيئة المتأثرة عن الوصول الخارجي، والحفاظ على أدلة غير قابلة للتعديل (سلاسل تجزئة التدقيق وسجلات الوصول وسجلات الخادم)، وتدوير كل بيانات اعتماد قد تكون مكشوفة (مفاتيح توقيع JWT والرموز وبطاقات قاعدة البيانات ومفاتيح التخزين وأسرار التكاملات)، وإبلاغ مالك المستودع عبر القناة الخاصة. لا تحذف السجلات ولا تحاول إصلاحًا ارتجاليًا قبل حفظ الأدلة؛ فمسارات التدقيق المقاومة للتلاعب تجعل إعادة بناء التحقيقات الجنائية الرقمية ممكنة لأنّها لم تُعَدَّل أبدًا.

## Coordinated Disclosure | الإفصاح المنسق

The maintainer will triage the report, determine severity and affected versions, coordinate a fix, and decide whether a security advisory or release note is appropriate. Reporters are asked to allow reasonable time for validation and remediation before public disclosure. Do not publish exploit details while a fix is being coordinated.

سيقوم المشرف بتقييم البلاغ وتحديد درجة الخطورة والإصدارات المتأثرة وتنسيق الإصلاح وتحديد ملاءمة إصدار تنبيه أمني أو ملاحظة إصدار. يُرجى منح وقت معقول للتحقق والمعالجة قبل الإفصاح العام، وعدم نشر تفاصيل الاستغلال أثناء تنسيق الإصلاح.

## Dependency and Secret Hygiene | نظافة الاعتماديات والأسرار

Never commit `.env` files, credentials, production configuration, private certificates, cloud access keys, dependency caches, build outputs, coverage reports, local logs, or temporary exports. Use synthetic CI-only values and keep production secrets in an approved secret-management system. Before every push, review `git status`, `git diff --check`, and the complete staged file list.

يُمنع رفع ملفات `.env` أو بيانات الاعتماد أو إعدادات الإنتاج أو الشهادات الخاصة أو مفاتيح السحابة أو تخزين الاعتماديات المؤقت أو مخرجات البناء أو تقارير التغطية أو السجلات المحلية أو الملفات المصدّرة المؤقتة. استخدم قيمًا اصطناعية مخصصة لـ CI، واحتفظ بأسرار الإنتاج في نظام إدارة الأسرار المعتمد. راجع `git status` و`git diff --check` وقائمة الملفات المضافة كاملة قبل كل Push.

## References | المراجع

- [MEDORA README](README.md)
- [MEDORA Contribution Guide](CONTRIBUTING.md)
- [GitHub Security Advisories](https://docs.github.com/en/code-security/security-advisories)
- [GitHub Code Security](https://docs.github.com/en/code-security)
- [OWASP Application Security Verification Standard](https://owasp.org/www-project-application-security-verification-standard/)

---

© 2026 MEDORA Health Care Eco System. Private project.
