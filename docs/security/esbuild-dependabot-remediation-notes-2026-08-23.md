# MEDORA esbuild Dependabot remediation notes | ملاحظات معالجة تنبيه esbuild

## Evidence | الأدلة

The active dependency path observed locally is `drizzle-kit@0.31.10` → `@esbuild-kit/esm-loader@2.6.5` → `@esbuild-kit/core-utils@3.3.2` → `esbuild@0.18.20`. The full pnpm audit identifies this as **GHSA-67mh-4wv8-2f99** and recommends `esbuild >= 0.25.0`.

مسار الاعتماد النشط محليًا هو `drizzle-kit@0.31.10` ثم `@esbuild-kit/esm-loader@2.6.5` ثم `@esbuild-kit/core-utils@3.3.2` ثم `esbuild@0.18.20`. ويعرّف تدقيق pnpm هذا المسار بالتنبيه **GHSA-67mh-4wv8-2f99** ويوصي بـ`esbuild >= 0.25.0`.

GitHub’s advisory explains that affected esbuild development servers can return overly permissive CORS responses, allowing a malicious website to request and read development-server content. The advisory’s affected range is `<= 0.24.2`; the fixed range begins at `0.25.0`.[1]

يوضح تنبيه GitHub أن خوادم التطوير المتأثرة قد تُرجع إعدادات CORS متساهلة بصورة زائدة، ما يسمح لموقع ضار بطلب محتوى خادم التطوير وقراءته. نطاق الإصدارات المتأثرة هو `<= 0.24.2`، ويبدأ النطاق المعالَج من `0.25.0`.[1]

## Remediation constraint | قيد المعالجة

`pnpm-workspace.yaml` already pinned a broad `esbuild: 0.25.0` override, yet a fresh local dependency tree still resolves `esbuild@0.18.20` through the deprecated `@esbuild-kit/core-utils` package. A newly added nested override did not change that resolution after a forced installation, so the remediation must be proven by the resolved lockfile and audit result—not merely by the presence of an override declaration.

كان `pnpm-workspace.yaml` يثبت مسبقًا تجاوزًا عامًا `esbuild: 0.25.0`، لكن شجرة الاعتمادات المحلية الجديدة ما زالت تحل `esbuild@0.18.20` عبر الحزمة المهجورة `@esbuild-kit/core-utils`. لم يغيّر تجاوز متداخل جديد هذه النتيجة حتى بعد تثبيت قسري؛ لذا يجب إثبات المعالجة عبر القفل المحلول ونتيجة التدقيق، لا بمجرد وجود تعريف تجاوز.

The pnpm documentation permits parent-qualified selectors such as `parent@version>child` in the root workspace overrides. It also confirms that these overrides are intended for backporting fixes or forcing a single dependency version across the graph.[2]

تسمح وثائق pnpm بمحددات تتضمن الحزمة الأم مثل `parent@version>child` في تجاوزات جذر مساحة العمل. وتؤكد أن الغرض من هذه التجاوزات يشمل إرجاع إصلاحات أمنية أو فرض إصدار اعتماد واحد عبر الشجرة.[2]

## Resolved approach and verification | المعالجة النهائية والتحقق

The reproducible remediation updates the project’s declared package manager from pnpm `10.4.1` to `10.34.4`, retains the root `esbuild: 0.25.0` override, and refreshes `pnpm-lock.yaml` with pnpm `10.34.4`. It also makes the legacy parent selectors version-qualified so the current pnpm parser accepts the workspace configuration. The resolved tree contains **one** `esbuild` version: `0.25.0`, including the `drizzle-kit` path; `esbuild@0.18.20` no longer resolves.

تعتمد المعالجة القابلة لإعادة الإنتاج على تحديث مدير الحزم المعلن للمشروع من pnpm `10.4.1` إلى `10.34.4`، مع الإبقاء على تجاوز الجذر `esbuild: 0.25.0` وإعادة إنشاء `pnpm-lock.yaml` باستخدام pnpm `10.34.4`. كما جرى تقييد محددات الحزم الأم القديمة بالإصدار كي يقبل محلل pnpm الحالي إعداد مساحة العمل. تحتوي الشجرة المحلولة على إصدار **واحد** من `esbuild` هو `0.25.0`، بما في ذلك المسار القادم من `drizzle-kit`؛ ولم يعد `esbuild@0.18.20` يُحل.

The security checks now pass: `pnpm audit` reports no advisory, and `pnpm audit --prod --audit-level=high` reports **no known vulnerabilities**. TypeScript, production build, smoke check, and the Playwright suite pass. The full unit suite was also run; its only remaining failures are pre-existing branding-contract assertions coupled to the already-running local preview on port `3000`, whose title/logo environment differs from the test’s Arabic-title/HTTPS-logo expectation. This configuration mismatch is recorded as unrelated to the dependency-only change and must not be silently reclassified as an esbuild regression.

نجحت الفحوصات الأمنية الآن: لا يُظهر `pnpm audit` أي تنبيه، ويعرض `pnpm audit --prod --audit-level=high` نتيجة **No known vulnerabilities**. كما نجح فحص TypeScript وبناء الإنتاج وفحص التشغيل وحزمة Playwright. وشُغلت اختبارات الوحدات الكاملة أيضًا؛ وتقتصر حالات الفشل المتبقية على تأكيدات عقد علامة موروثة مرتبطة بخادم المعاينة المحلي العامل أصلًا على المنفذ `3000`، إذ تختلف قيم عنوانه/شعاره عن توقع الاختبار للعنوان العربي وشعار HTTPS. سُجل هذا الاختلاف باعتباره غير مرتبط بتغيير الاعتمادات، ولا يجوز اعتباره تراجعًا ناتجًا عن esbuild.

## Merge and alert follow-up | الدمج ومتابعة التنبيه

Pull request [#20](https://github.com/0SSAM/MEDORA-Health-Care-Eco-System/pull/20) was merged into `main` as `9ae4286fa9012dbd81418e08f0aaf76d56e299ae` (`chore(deps): remediate esbuild dependabot alert`). A post-merge tree comparison confirms that the merge changes only `package.json`, `pnpm-workspace.yaml`, and `pnpm-lock.yaml`. On current `main`, pnpm `10.34.4` resolves exactly one `esbuild` version—`0.25.0`—and `pnpm audit --prod --audit-level=high` reports no known vulnerabilities.

دُمج طلب الدمج [#20](https://github.com/0SSAM/MEDORA-Health-Care-Eco-System/pull/20) في `main` بالالتزام `9ae4286fa9012dbd81418e08f0aaf76d56e299ae` تحت الرسالة `chore(deps): remediate esbuild dependabot alert`. تؤكد مقارنة شجرة ما بعد الدمج أن التغيير يقتصر على `package.json` و`pnpm-workspace.yaml` و`pnpm-lock.yaml`. وفي `main` الحالي، يحل pnpm `10.34.4` إصدارًا واحدًا فقط من `esbuild` هو `0.25.0`، ويعرض `pnpm audit --prod --audit-level=high` نتيجة عدم وجود ثغرات معروفة.

GitHub’s Dependabot-alert REST endpoint returns HTTP 403 for the available integration token, and the browser session is not authenticated to the repository security UI; therefore the alert’s **displayed GitHub state** cannot be independently read from this environment. The merged dependency resolution and successful security checks are verified. GitHub may close the alert after its scheduled re-analysis; that dashboard state should be treated as a platform confirmation, not as proof that the lockfile still resolves the safe version.

The read-only endpoint was retried during the 2026-08-23 operational audit and again returned `403 Resource not accessible by integration`. No repository, dependency, alert, or permission mutation was attempted. The dashboard-confirmation item therefore remains open and requires an authorized GitHub security session or alert-read permission.

The available GitHub CLI session is authenticated for ordinary repository access, but that authentication status does not grant or demonstrate Dependabot-alert read permission. The alert endpoint remains the authoritative access test and is still unavailable; no token value, account secret, or permission-changing action has been recorded or attempted.

تعيد واجهة REST لتنبيهات Dependabot في GitHub حالة HTTP 403 لرمز الموصل المتاح، كما أن جلسة المتصفح غير مسجلة الدخول إلى واجهة أمان المستودع؛ لذا لا يمكن قراءة **الحالة المعروضة في GitHub** للتنبيه باستقلالية من هذه البيئة. تم التحقق من حل الاعتماد المدمج ومن نجاح الفحوصات الأمنية. قد يغلق GitHub التنبيه بعد إعادة تحليله المجدولة؛ وتُعامل حالة لوحة التحكم كتأكيد من المنصة، لا كبديل عن إثبات أن ملف القفل ما زال يحل الإصدار الآمن.

أُعيدت محاولة القراءة فقط أثناء التدقيق التشغيلي بتاريخ 2026-08-23 وأعادت النتيجة نفسها: `403 Resource not accessible by integration`. لم تُنفذ أي عملية تغيير للمستودع أو الاعتماد أو التنبيه أو الصلاحية. لذلك يبقى بند تأكيد لوحة التحكم مفتوحًا، ويتطلب جلسة GitHub Security مصرحًا بها أو صلاحية قراءة التنبيهات.

## References | المراجع

[1] [GitHub Advisory GHSA-67mh-4wv8-2f99 — esbuild](https://github.com/advisories/GHSA-67mh-4wv8-2f99)

[2] [pnpm Settings — dependency overrides](https://pnpm.io/10.x/settings#overrides)
