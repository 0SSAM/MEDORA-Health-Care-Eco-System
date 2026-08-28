# Canonical Redevelopment Audit — 2026-08-28 | تدقيق إعادة تطوير المصدر المرجعي

## Scope | النطاق

This record defines a controlled reconciliation of the canonical GitHub repository with the verified managed MEDORA source. It is not a history rewrite, a replacement of the managed platform, or authorization to activate regulated integrations. The canonical repository remains `0SSAM/MEDORA-Health-Care-Eco-System`; the organization repository remains outside this change.

يوثق هذا السجل مواءمة محكومة بين مستودع GitHub المرجعي ومصدر MEDORA المُدار الذي اجتاز التحقق. ولا يمثل إعادة كتابة للتاريخ أو استبدالاً للمنصة المدارة أو تفويضاً لتفعيل تكاملات منظمة. يبقى المستودع المرجعي هو `0SSAM/MEDORA-Health-Care-Eco-System`، ويبقى مستودع المنظمة خارج هذا التغيير.

## Evidence baseline | خط أساس الأدلة

| Check | Canonical result | Interpretation |
| --- | --- | --- |
| Git state | `main` at `54ffc7be46ba`; working tree clean; only `main`; no open pull requests. | A clean, reviewable integration branch can be created from the current canonical commit. |
| Remote CI | The latest `MEDORA CI`, `MEDORA Verification`, and `CodeQL Advanced` runs on `main` reported success. | No remote CI failure is being masked by this work. |
| Frozen install and TypeScript | `pnpm install --frozen-lockfile` and `pnpm check` passed. | Manifest and lockfile were locally reproducible at the observed baseline. |
| Production dependency audit | `pnpm audit --prod --audit-level high` returned no known vulnerabilities. | No known high-or-higher production advisory was observed locally. |
| Production build | `pnpm build` passed. | The canonical baseline can produce a bundle. |
| Unit/contracts | 124 files / 392 tests passed; 3 files / 9 tests were skipped; one branding test failed. | The test failure is an isolation defect to correct before relying on the suite as a gate. |

| الفحص | نتيجة المصدر المرجعي | الدلالة |
| --- | --- | --- |
| حالة Git | الفرع `main` عند `54ffc7be46ba`، وشجرة عمل نظيفة، وفرع واحد فقط، ولا توجد طلبات دمج مفتوحة. | يمكن إنشاء فرع تكامل قابل للمراجعة من المرجع الحالي. |
| التكامل عن بُعد | أظهرت أحدث عمليات `MEDORA CI` و`MEDORA Verification` و`CodeQL Advanced` على `main` النجاح. | لا يخفي هذا العمل إخفاقاً قائماً في CI البعيد. |
| التثبيت المقفل وTypeScript | نجح `pnpm install --frozen-lockfile` و`pnpm check`. | أمكن تكرار manifest وlockfile محلياً عند خط الأساس المرصود. |
| تدقيق تبعيات الإنتاج | أعاد `pnpm audit --prod --audit-level high` عدم وجود ثغرات معروفة. | لم تُرصد محلياً نصيحة إنتاجية معروفة عالية الخطورة أو أعلى. |
| بناء الإنتاج | نجح `pnpm build`. | يستطيع المرجع إنتاج حزمة بناء. |
| اختبارات الوحدات والعقود | نجح 124 ملفاً / 392 اختباراً، وتجاوز 3 ملفات / 9 اختبارات، وفشل اختبار علامة واحد. | يلزم إصلاح عزل الاختبار قبل اعتماد الحزمة كبوابة جودة. |

## Confirmed reconciliation findings | نتائج المواءمة المؤكدة

| Finding | Evidence | Safe treatment |
| --- | --- | --- |
| The managed project remote is an authenticated managed-project artifact remote, not the canonical GitHub remote. | A direct `git fetch origin` from the managed project cannot authenticate as GitHub. | Compare and reconcile only through a dedicated canonical clone and a pull request; do not assume automatic GitHub synchronization. |
| The sources have materially diverged. | Canonical: 348 TypeScript/TSX source files, 130 test files, and no SQL migrations. Managed MEDORA: 522 TypeScript/TSX source files, 248 test files, and 62 SQL migrations. | Use the verified managed source as the candidate application baseline; preserve canonical governance and documentation files unless a review proves replacement is required. |
| A canonical branding test is environment-coupled. | `server/branding-secrets.test.ts` fetches `http://127.0.0.1:3000` by default without starting its own server. Under the suite, it read an ambient server response and failed despite a passing production build. | Replace the ambient HTTP dependency with a deterministic source-level contract for the canonical HTML title and approved branding configuration. |
| Canonical source retains historic showcase artifacts. | Source, tests, scheduled logic, CI variables, and three tracked `.tmp-*showcase*` helper files reference a showcase account. | Reconcile the already-verified removal from the managed source, remove temporary tracked helpers, and do not create accounts, secrets, or synthetic data. |
| Canonical package tooling is internally inconsistent. | `packageManager` declares pnpm 10.12.4; the lockfile resolves pnpm 11.23.0 as a development dependency; Docker activates pnpm 10.4.1. | Align only to a single, verified package-manager declaration and deployment-compatible Docker setup selected by the reconciled source; re-run frozen installation and the full gate. |

| النتيجة | الدليل | المعالجة الآمنة |
| --- | --- | --- |
| remote المشروع المدار هو remote لأثر مشروع مُدار موثق، وليس remote GitHub المرجعي. | لا يمكن لـ `git fetch origin` من المشروع المدار المصادقة كمستودع GitHub. | تتم المقارنة والمواءمة عبر نسخة مرجعية مستقلة وطلب دمج فقط، ولا يُفترض وجود تزامن تلقائي مع GitHub. |
| يوجد تباعد جوهري بين المصدرين. | المرجعي: 348 ملف TypeScript/TSX و130 ملف اختبار ولا يوجد SQL migrations. MEDORA المُدار: 522 ملف TypeScript/TSX و248 ملف اختبار و62 SQL migrations. | يستخدم المصدر المُدار المتحقق منه كأساس مرشح للتطبيق، مع حفظ حوكمة ووثائق المرجع ما لم تثبت المراجعة ضرورة استبدالها. |
| اختبار العلامة المرجعي مرتبط بالبيئة. | يجلب `server/branding-secrets.test.ts` العنوان `http://127.0.0.1:3000` افتراضياً دون بدء خادمه. قرأ استجابة خادم محيط وفشل رغم نجاح بناء الإنتاج. | يستبدل اعتماد HTTP المحيط بعقد حتمي على مستوى المصدر لعنوان HTML وإعداد العلامة المعتمد. |
| يحتفظ المصدر المرجعي ببقايا حساب عرض تاريخي. | تشير ملفات المصدر والاختبارات والمنطق المجدول ومتغيرات CI وثلاثة ملفات `.tmp-*showcase*` المتعقبة إلى حساب عرض. | توائم الإزالة المتحقق منها من المصدر المدار وتحذف المساعدات المؤقتة المتعقبة، ولا تنشئ حسابات أو أسراراً أو بيانات اصطناعية. |
| تتعارض أدوات الحزم في المصدر المرجعي داخلياً. | يعلن `packageManager` عن pnpm 10.12.4، بينما يحل lockfile pnpm 11.23.0 كتبعية تطوير، ويُفعّل Docker pnpm 10.4.1. | تُوحّد فقط على تعريف مدير حزم واحد تم التحقق منه وإعداد Docker متوافق مع النشر من المصدر الموحّد، ثم تعاد بوابة التثبيت المقفل والجودة كاملة. |

## Guardrails for implementation | ضوابط التنفيذ

The reconciliation must not copy managed-project metadata, `.manus/`, `.project-config.json`, build artifacts, test reports, local logs, caches, secrets, or environment files. It must not modify production data, database contents, access roles, NDA acceptance, tenant/branch/jurisdiction guards, external adapter activation, or the archived organization repository. GitHub changes must use a temporary integration branch and a pull request; neither `main` nor history will be force-pushed.

لا تنسخ المواءمة بيانات وصفية للمشروع المدار أو `.manus/` أو `.project-config.json` أو مخرجات البناء أو تقارير الاختبار أو السجلات أو الذاكرات المؤقتة أو الأسرار أو ملفات البيئة. ولا تغير بيانات الإنتاج أو محتوى قاعدة البيانات أو أدوار الوصول أو قبول NDA أو حراس المؤسسة/الفرع/الولاية القضائية أو تفعيل الموصلات الخارجية أو مستودع المنظمة المؤرشف. تستخدم تغييرات GitHub فرع تكامل مؤقتاً وطلب دمج، ولن يتم الدفع القسري إلى `main` أو إعادة كتابة التاريخ.

## Reconciliation and verification outcome | نتيجة المواءمة والتحقق

The verified managed application source was reconciled only into the temporary branch `chore/reconcile-managed-source-20260828`, whose merge base remained the current `origin/main` commit `54ffc7be46ba` immediately before commitment. Canonical GitHub governance files were preserved; obsolete tracked showcase helpers and the tracked local Playwright report were removed, and `.gitignore` now excludes generated Playwright outputs. The reconciliation retained the MEDORA-native OAuth, NDA, scoped-access, audit, idempotency, Heartbeat, Drizzle/MySQL, and managed single-process deployment patterns. It did not copy managed metadata, files of environmental configuration, secrets, generated output, local logs, or production data.

تمت مواءمة مصدر التطبيق المُدار المتحقق منه داخل الفرع المؤقت `chore/reconcile-managed-source-20260828` فقط، وظلت قاعدة دمجه هي الالتزام الحالي في `origin/main` برقم `54ffc7be46ba` مباشرة قبل الالتزام. حُفظت ملفات حوكمة GitHub المرجعية؛ وحُذفت مساعدات العرض المتعقبة المتقادمة وتقرير Playwright المحلي المتعقب، وأصبح `.gitignore` يستثني مخرجات Playwright المتولدة. حافظت المواءمة على OAuth وNDA والوصول محدد النطاق والتدقيق وidempotency وHeartbeat وDrizzle/MySQL ونمط النشر المُدار أحادي العملية في MEDORA. ولم تنسخ بيانات وصفية مدارة أو ملفات بيئة أو أسراراً أو مخرجات متولدة أو سجلات محلية أو بيانات إنتاجية.

| Final verification gate | Result observed on the integration branch |
| --- | --- |
| Frozen dependency install and TypeScript | Passed: `pnpm install --frozen-lockfile` and `pnpm check`. |
| Full Vitest | Passed: **246 files** and **797 tests**; **1 file / 7 tests** skipped only where the existing environment guard requires it. |
| Production build | Passed: `pnpm build`; the pre-existing advisory vendor-chunk-size warning remained non-blocking. |
| Production dependency audit | Passed: `pnpm audit --prod --audit-level high` found no known vulnerability at the configured threshold. |
| Public browser verification | Passed: `pnpm e2e` completed **10/10** anonymous desktop and mobile checks; expected unauthenticated session messages did not alter safe public access states. |
| Diff and source hygiene | Passed: `git diff --cached --check`; no new build, browser-test, environment, or private-key artifact is staged. |

| بوابة التحقق النهائية | النتيجة المرصودة في فرع التكامل |
| --- | --- |
| تثبيت التبعيات المقفل وTypeScript | نجح `pnpm install --frozen-lockfile` و`pnpm check`. |
| Vitest الكامل | نجح **246 ملفاً** و**797 اختباراً**؛ وتُرك **ملف واحد / 7 اختبارات** متجاوزة فقط بسبب حارس البيئة الموجود سابقاً. |
| بناء الإنتاج | نجح `pnpm build`؛ وبقي تحذير حجم حزم الموردين الاستشاري السابق غير حاجب. |
| تدقيق تبعيات الإنتاج | نجح `pnpm audit --prod --audit-level high` ولم يجد ثغرة معروفة عند الحد المحدد. |
| تحقق المتصفح العام | نجح `pnpm e2e` في **10/10** فحوص مجهولة على سطح المكتب والهاتف؛ ولم تغيّر رسائل غياب الجلسة المتوقعة حالات الوصول العام الآمنة. |
| سلامة الفرق والمصدر | نجح `git diff --cached --check`؛ ولا توجد إضافة جديدة لمخرجات بناء أو اختبار متصفح أو بيئة أو مفتاح خاص. |

This record remains a local evidence document until the reviewed pull request is created and merged. It does not claim remote CI completion, production deployment, security-alert access, or external system activation.

يبقى هذا السجل وثيقة أدلة محلية إلى أن يُنشأ طلب المراجعة ويُدمج. ولا يدعي نجاح CI البعيد أو نشر الإنتاج أو الوصول إلى تنبيهات الأمان أو تفعيل أي نظام خارجي.

### Remote CI correction pending review | تصحيح CI البعيد قيد المراجعة

The initial pull-request run exposed an inherited `MEDORA Verification` workflow mismatch: `pnpm/action-setup` pinned pnpm `10.12.4`, while the reconciled `package.json` declares `pnpm@10.34.4`. The action correctly stopped before installation rather than selecting an implicit version. The branch now aligns both verification jobs with pnpm `10.34.4` and removes the unused `SHOWCASE_TEST_PASSWORD` runtime variable. Remote checks must rerun and succeed before any merge claim is made.

كشف التشغيل الأول لطلب المراجعة تعارضاً موروثاً في workflow `MEDORA Verification`: إذ ثبّت `pnpm/action-setup` pnpm عند `10.12.4`، بينما يعلن `package.json` الموحّد `pnpm@10.34.4`. أوقف الإجراء التنفيذ قبل التثبيت كما ينبغي بدلاً من اختيار إصدار ضمني. أصبح الفرع الآن يوائم وظيفتي التحقق مع pnpm `10.34.4` ويحذف متغير وقت التشغيل غير المستخدم `SHOWCASE_TEST_PASSWORD`. يجب إعادة تشغيل الفحوص البعيدة ونجاحها قبل الادعاء بأي دمج.

The rerun then exposed a distinct brittle test: `server/audit-secret-api-health.test.ts` hard-coded port `3000`, although the verification workflow deliberately starts its isolated server at `4173` and injects `MEDORA_TEST_BASE_URL`. The corrected contract validates the audit signing behavior independently and runs its HTTP assertion only through that injected isolated base URL. Its focused local run passed the signing assertion and correctly skipped the HTTP assertion when no isolated base URL was provided. This is a test-harness correction only; it does not alter the authentication endpoint, access rules, audit records, or runtime configuration.

كشف التشغيل المعاد عيب اختبار هشاً مستقلاً: إذ ثبّت `server/audit-secret-api-health.test.ts` المنفذ `3000` رغم أن workflow التحقق يشغّل خادمه المعزول عمداً على `4173` ويحقن `MEDORA_TEST_BASE_URL`. أصبح العقد المصحح يتحقق من سلوك توقيع التدقيق بصورة مستقلة ولا ينفذ تأكيد HTTP إلا عبر عنوان الأساس المعزول المحقون. نجح تشغيله المحلي المركز في تأكيد التوقيع وتجاوز تأكيد HTTP بصورة صحيحة عندما لا يُقدَّم عنوان أساس معزول. هذا تصحيح لحاضنة الاختبار فقط؛ لا يغير endpoint المصادقة أو قواعد الوصول أو سجلات التدقيق أو تهيئة التشغيل.

The next remote run passed the verification job but exposed another inherited workflow-to-package mismatch in the browser job: it invoked undefined `pnpm test:e2e`, while the reconciled package intentionally exposes Playwright through `pnpm e2e`. The workflow now calls the declared `e2e` script and retains the same anonymous Chromium coverage and evidence upload. The browser workflow has not yet been revalidated remotely at the time of this entry.

نجحت وظيفة التحقق في التشغيل البعيد التالي، لكنها كشفت تعارضاً موروثاً آخر بين workflow والحزمة في وظيفة المتصفح: إذ استدعت `pnpm test:e2e` غير المعرفة، بينما تعرّض الحزمة الموحّدة Playwright عمداً عبر `pnpm e2e`. يستدعي workflow الآن سكربت `e2e` المعلن ويحافظ على تغطية Chromium المجهولة ورفع الأدلة نفسيهما. لم يُعد التحقق من وظيفة المتصفح عن بُعد بعد وقت هذا التسجيل.

### CodeQL callback-rate-limit correction pending remote evidence | تصحيح حد معدل callbacks في CodeQL بانتظار الدليل البعيد

After `MEDORA Verification` passed, the pull request reported two high-severity CodeQL findings on the authorization-bearing Heartbeat callback registrations in `server/_core/index.ts`. The existing general MEDORA middleware was retained, but the three callback routes now also use the standard `express-rate-limit` middleware directly before their existing authenticated handlers. The new shared limiter is intentionally narrow: thirty requests per resolved client key per minute, standards-based rate-limit headers, no legacy headers, and a bounded generic `429` response. It neither authorizes requests nor schedules jobs, and each handler retains its task-UID authentication, scope, idempotency, and bounded-error controls.

بعد نجاح `MEDORA Verification`، أظهر طلب المراجعة تنبيهين عاليي الخطورة من CodeQL حول تسجيل مسارات Heartbeat التي تحمل تفويضاً في `server/_core/index.ts`. حُفظ middleware MEDORA العام القائم، وأصبحت مسارات callbacks الثلاثة تستخدم كذلك middleware القياسي `express-rate-limit` مباشرة قبل handlers الموثقة الحالية. المحدد المشترك الجديد ضيق عمداً: ثلاثون طلباً لكل مفتاح عميل محلول في الدقيقة، مع ترويسات حد معدل معيارية، ومن دون ترويسات قديمة، واستجابة `429` عامة ومحدودة. ولا يمنح هذا المحدد أي تفويض أو يشغّل جدولة؛ إذ يحتفظ كل handler بمصادقة task UID والنطاق وidempotency وضوابط الخطأ المحدود.

The focused limiter contract passed (2/2). The subsequent full local gate passed TypeScript; **247 test files / 799 tests** with **1 file / 8 tests** skipped only by existing environment guards; production build; production dependency audit at the high threshold; diff hygiene; and **10/10** anonymous desktop/mobile Playwright checks. These are local evidence only. The updated branch must be pushed and the pull-request `MEDORA Verification`, CodeQL, and browser checks must succeed remotely before merge or production claims.

نجح عقد المحدد المركز (2/2). كما نجحت البوابة المحلية الكاملة التالية: TypeScript؛ **247 ملف اختبار / 799 اختباراً**، مع **ملف واحد / 8 اختبارات** متجاوزة فقط بسبب حراس البيئة القائمة؛ وبناء الإنتاج؛ وتدقيق تبعيات الإنتاج عند الحد العالي؛ وسلامة الفرق؛ و**10/10** فحوص Playwright مجهولة على سطح المكتب والهاتف. تمثل هذه النتائج أدلة محلية فقط. يلزم دفع الفرع المحدث ونجاح فحوص طلب المراجعة `MEDORA Verification` وCodeQL والمتصفح عن بُعد قبل الدمج أو أي ادعاء إنتاجي.
