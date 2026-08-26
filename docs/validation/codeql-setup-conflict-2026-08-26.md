# CodeQL Setup Conflict — Resolution Record | سجل حل تعارض إعداد CodeQL

## English

### Evidence and scope

User-supplied GitHub Actions screenshots dated 2026-08-26 show three failing jobs from **CodeQL Advanced**: `actions`, `javascript-typescript`, and `python`. Each failure occurs when GitHub Code Scanning receives the SARIF upload and reports that analyses from advanced configurations cannot be processed while default setup is enabled.

Read-only repository inspection confirmed both setup modes existed at the same time. The repository had an active `.github/workflows/codeql.yml` workflow named **CodeQL Advanced**, while GitHub's Code Scanning default setup was also configured for `actions`, `javascript`, `javascript-typescript`, `python`, and `typescript`. The default setup is retained as the single scanning mode because it is already configured and covers the languages shown in the failed jobs.

### Bounded remediation

The remediation removes only the repository-managed advanced workflow file. It does not disable Code Scanning default setup, change any alert, dismiss an alert, alter branch protection, or modify application, healthcare, financial, patient, or production-operation code. A post-change check must prove that the advanced workflow file is absent and that GitHub still reports default setup as `configured` before the pull request is considered ready.

### Local validation

The branch passed the static default-setup guard, workflow formatting, TypeScript, production build, production-dependency audit, and post-build smoke check. The project test suite passed **119 files / 386 tests** with the repository's existing environmental skips when the one branding endpoint test was excluded. That one test is intentionally bound to `http://127.0.0.1:3000/`; on this workstation that port is already served by a different managed project, so it cannot validate this checkout outside its isolated CI server. Browser RBAC tests similarly require the isolated authentication/database fixture and failed with the existing unavailable-credentials message. Neither condition is caused by the workflow-only remediation; the pull request CI remains the required full isolated verification.

### Pull-request state before post-merge synchronization

On 2026-08-26, read-only GitHub inspection showed PR #7 as `MERGED` into `main` from `manus/auto-sync-aldora` at head `dc06132f184d3329f6a2e6c88517dabb4d88962c`. The recorded checks succeeded for CodeQL `actions`, `javascript-typescript`, and `python`, the MEDORA CI CodeQL setup guard, TypeScript/tests/build/smoke, and isolated database lifecycle. The dependency-review check was explicitly advisory and skipped. No Code Scanning alert content was requested, read, dismissed, or changed. The remaining verification is limited to synchronizing the local clone, comparing `origin/main`, checking post-merge workflow status, and cleaning the merged branch only if GitHub permits it.

### Post-merge finding: Actions source removed

Post-merge synchronization found a later `main` commit, `e3b8d6ad83ec255d9fb138b1afd25224450c07a0` (**Delete `.github/workflows/ci.yml`**), authored by the repository owner after PR #7. GitHub default setup remains `configured` and still includes `actions`, but the repository now has no `.github/workflows/` source files. The post-merge `Analyze (actions)` run therefore failed at initialization with `Could not process any code for actions`, which is distinct from the resolved advanced/default SARIF conflict. This record does not infer why the CI file was removed and does not treat the failure as an alert or vulnerability result. Any remedy must keep default setup enabled, avoid recreating advanced CodeQL configuration, and be proposed through a new protected-branch review.

### Proposed limited remedy (pending review)

The repair branch adds one permissionless, `workflow_dispatch`-only workflow at `.github/workflows/codeql-actions-source.yml`. It does not restore the deleted CI workflow, run on `push` or `pull_request`, request a token, check out repository content, call an external service, or invoke a CodeQL action. Its sole job validates the manual GitHub Actions context if an authorized maintainer chooses to run it, while its retained workflow syntax gives GitHub default setup a real Actions source to analyze. The accompanying Vitest contract confirms that the source remains manual-only, permissionless, and free of advanced CodeQL configuration. This is proposed for a new protected-branch PR; it is not yet merged.

## العربية

### الدليل والنطاق

تُظهر لقطات GitHub Actions التي أرسلها المستخدم بتاريخ 2026-08-26 فشل ثلاث مهام من **CodeQL Advanced**: وهي `actions` و`javascript-typescript` و`python`. يقع الفشل عند رفع ملف SARIF إلى GitHub Code Scanning، وتفيد الرسالة بأن تحليلات الإعدادات المتقدمة لا يمكن معالجتها بينما الإعداد الافتراضي مفعّل.

أكد الفحص المقروء فقط أن نمطي الإعداد كانا موجودين في الوقت نفسه. احتوى المستودع على سير العمل `.github/workflows/codeql.yml` باسم **CodeQL Advanced**، بينما كان الإعداد الافتراضي لـ Code Scanning مضبوطاً أيضاً للغات `actions` و`javascript` و`javascript-typescript` و`python` و`typescript`. يُحتفَظ بالإعداد الافتراضي كنمط الفحص الوحيد لأنه مضبوط بالفعل ويغطي اللغات التي ظهرت في المهام الفاشلة.

### المعالجة المحدودة

تزيل المعالجة ملف سير العمل المتقدم المُدار داخل المستودع فقط. وهي لا تعطل الإعداد الافتراضي لـ Code Scanning، ولا تغيّر أو تغلق أو تتجاهل أي تنبيه، ولا تعدل حماية الفرع أو كود التطبيق أو الرعاية الصحية أو الأمور المالية أو بيانات المرضى أو تشغيل الإنتاج. ويجب أن يثبت فحص ما بعد التغيير غياب ملف سير العمل المتقدم وأن GitHub ما زال يعرض حالة الإعداد الافتراضي `configured` قبل اعتبار طلب السحب جاهزاً.

### التحقق المحلي

اجتاز الفرع حارس الإعداد الافتراضي الثابت وتنسيق سير العمل وTypeScript وبناء الإنتاج وتدقيق تبعيات الإنتاج وفحص smoke بعد البناء. واجتازت مجموعة اختبارات المشروع **119 ملفاً / 386 اختباراً** مع تجاوزات البيئة الموجودة في المستودع عند استبعاد اختبار نقطة نهاية العلامة التجارية الواحد. يرتبط هذا الاختبار عمداً بـ `http://127.0.0.1:3000/`؛ وعلى محطة العمل هذه يخدم المنفذ 3000 مشروع مُدار مختلف، ولذلك لا يمكنه التحقق من هذه النسخة خارج خادم CI المعزول. وبالمثل تتطلب اختبارات RBAC في المتصفح تجهيز المصادقة/قاعدة البيانات المعزول، وفشلت برسالة عدم توافر بيانات اعتماد الاختبار القائمة. لا ينشأ أي من الشرطين عن معالجة سير العمل فقط؛ وتبقى CI الخاصة بطلب السحب هي التحقق المعزول الكامل المطلوب.

### حالة طلب السحب قبل مزامنة ما بعد الدمج

في 2026-08-26 أظهر فحص GitHub للقراءة فقط أن PR #7 في حالة `MERGED` إلى `main` من `manus/auto-sync-aldora` عند الرأس `dc06132f184d3329f6a2e6c88517dabb4d88962c`. نجحت الفحوص المسجلة لتحليلات CodeQL الخاصة بـ`actions` و`javascript-typescript` و`python`، وحارس إعداد CodeQL في MEDORA CI، وفحص TypeScript/الاختبارات/البناء/Smoke، ودورة حياة قاعدة البيانات المعزولة. أما فحص مراجعة التبعيات فكان استشارياً ومُتجاوزاً صراحةً. لم يُطلب أو يُقرأ أو يُغلق أو يُغيّر محتوى أي تنبيه من Code Scanning. ينحصر التحقق المتبقي في مزامنة النسخة المحلية ومقارنة `origin/main` وفحص حالة سير العمل بعد الدمج وتنظيف الفرع المدموج فقط إن سمح GitHub بذلك.

### نتيجة ما بعد الدمج: حذف مصدر Actions

أظهرت مزامنة ما بعد الدمج التزاماً لاحقاً على `main` هو `e3b8d6ad83ec255d9fb138b1afd25224450c07a0` (**حذف `.github/workflows/ci.yml`**) نفذه مالك المستودع بعد PR #7. يبقى الإعداد الافتراضي لـGitHub في حالة `configured` ويتضمن `actions`، لكن المستودع لا يحتوي الآن على أي ملفات مصدر ضمن `.github/workflows/`. لذلك فشلت مهمة `Analyze (actions)` بعد الدمج أثناء التهيئة برسالة `Could not process any code for actions`؛ وهذه نتيجة منفصلة عن تعارض SARIF بين الإعداد المتقدم والافتراضي الذي حُلّ. لا يستنتج السجل سبب حذف ملف CI، ولا يعامل الفشل كتنبيه أو كنتيجة ثغرة. يجب أن يبقي أي علاج الإعداد الافتراضي مفعلاً، وألا يعيد تهيئة CodeQL المتقدمة، وأن يُقترح عبر مراجعة جديدة على فرع محمي.

### علاج محدود مقترح (بانتظار المراجعة)

يضيف فرع الإصلاح سير عمل واحداً يدوياً فقط عبر `workflow_dispatch` ومن دون أي صلاحيات في `.github/workflows/codeql-actions-source.yml`. لا يعيد هذا الملف سير عمل CI المحذوف، ولا يعمل عند `push` أو `pull_request`، ولا يطلب رمزاً، ولا يفحص محتوى المستودع، ولا يستدعي خدمة خارجية، ولا يشغّل إجراء CodeQL. مهمته الوحيدة التحقق من سياق GitHub Actions اليدوي إذا اختار مسؤول مخول تشغيله، بينما يمنح تركيب سير العمل المحفوظ إعداد GitHub الافتراضي مصدراً فعلياً لتحليل لغة Actions. ويؤكد عقد Vitest المصاحب بقاء المصدر يدوياً فقط وخالياً من الصلاحيات ومن إعداد CodeQL المتقدم. هذا العلاج مقترح لطلب مراجعة جديد على فرع محمي ولم يُدمج بعد.
