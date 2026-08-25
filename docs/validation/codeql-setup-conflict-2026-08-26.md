# CodeQL Setup Conflict — Resolution Record | سجل حل تعارض إعداد CodeQL

## English

### Evidence and scope

User-supplied GitHub Actions screenshots dated 2026-08-26 show three failing jobs from **CodeQL Advanced**: `actions`, `javascript-typescript`, and `python`. Each failure occurs when GitHub Code Scanning receives the SARIF upload and reports that analyses from advanced configurations cannot be processed while default setup is enabled.

Read-only repository inspection confirmed both setup modes existed at the same time. The repository had an active `.github/workflows/codeql.yml` workflow named **CodeQL Advanced**, while GitHub's Code Scanning default setup was also configured for `actions`, `javascript`, `javascript-typescript`, `python`, and `typescript`. The default setup is retained as the single scanning mode because it is already configured and covers the languages shown in the failed jobs.

### Bounded remediation

The remediation removes only the repository-managed advanced workflow file. It does not disable Code Scanning default setup, change any alert, dismiss an alert, alter branch protection, or modify application, healthcare, financial, patient, or production-operation code. A post-change check must prove that the advanced workflow file is absent and that GitHub still reports default setup as `configured` before the pull request is considered ready.

### Local validation

The branch passed the static default-setup guard, workflow formatting, TypeScript, production build, production-dependency audit, and post-build smoke check. The project test suite passed **119 files / 386 tests** with the repository's existing environmental skips when the one branding endpoint test was excluded. That one test is intentionally bound to `http://127.0.0.1:3000/`; on this workstation that port is already served by a different managed project, so it cannot validate this checkout outside its isolated CI server. Browser RBAC tests similarly require the isolated authentication/database fixture and failed with the existing unavailable-credentials message. Neither condition is caused by the workflow-only remediation; the pull request CI remains the required full isolated verification.

## العربية

### الدليل والنطاق

تُظهر لقطات GitHub Actions التي أرسلها المستخدم بتاريخ 2026-08-26 فشل ثلاث مهام من **CodeQL Advanced**: وهي `actions` و`javascript-typescript` و`python`. يقع الفشل عند رفع ملف SARIF إلى GitHub Code Scanning، وتفيد الرسالة بأن تحليلات الإعدادات المتقدمة لا يمكن معالجتها بينما الإعداد الافتراضي مفعّل.

أكد الفحص المقروء فقط أن نمطي الإعداد كانا موجودين في الوقت نفسه. احتوى المستودع على سير العمل `.github/workflows/codeql.yml` باسم **CodeQL Advanced**، بينما كان الإعداد الافتراضي لـ Code Scanning مضبوطاً أيضاً للغات `actions` و`javascript` و`javascript-typescript` و`python` و`typescript`. يُحتفَظ بالإعداد الافتراضي كنمط الفحص الوحيد لأنه مضبوط بالفعل ويغطي اللغات التي ظهرت في المهام الفاشلة.

### المعالجة المحدودة

تزيل المعالجة ملف سير العمل المتقدم المُدار داخل المستودع فقط. وهي لا تعطل الإعداد الافتراضي لـ Code Scanning، ولا تغيّر أو تغلق أو تتجاهل أي تنبيه، ولا تعدل حماية الفرع أو كود التطبيق أو الرعاية الصحية أو الأمور المالية أو بيانات المرضى أو تشغيل الإنتاج. ويجب أن يثبت فحص ما بعد التغيير غياب ملف سير العمل المتقدم وأن GitHub ما زال يعرض حالة الإعداد الافتراضي `configured` قبل اعتبار طلب السحب جاهزاً.

### التحقق المحلي

اجتاز الفرع حارس الإعداد الافتراضي الثابت وتنسيق سير العمل وTypeScript وبناء الإنتاج وتدقيق تبعيات الإنتاج وفحص smoke بعد البناء. واجتازت مجموعة اختبارات المشروع **119 ملفاً / 386 اختباراً** مع تجاوزات البيئة الموجودة في المستودع عند استبعاد اختبار نقطة نهاية العلامة التجارية الواحد. يرتبط هذا الاختبار عمداً بـ `http://127.0.0.1:3000/`؛ وعلى محطة العمل هذه يخدم المنفذ 3000 مشروع مُدار مختلف، ولذلك لا يمكنه التحقق من هذه النسخة خارج خادم CI المعزول. وبالمثل تتطلب اختبارات RBAC في المتصفح تجهيز المصادقة/قاعدة البيانات المعزول، وفشلت برسالة عدم توافر بيانات اعتماد الاختبار القائمة. لا ينشأ أي من الشرطين عن معالجة سير العمل فقط؛ وتبقى CI الخاصة بطلب السحب هي التحقق المعزول الكامل المطلوب.
