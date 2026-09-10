# Development-Tool Dependency Remediation | معالجة تبعيات أدوات التطوير

## Scope and safety boundary | النطاق والحد الآمن

This record covers a **local development-tool dependency audit** performed on 2026-08-26. It addresses reproducible dependency paths in package-management and build tooling only. No application runtime source, database schema, clinical workflow, financial workflow, patient data, external adapter, credential, GitHub security alert, or GitHub repository setting was changed.

يوثق هذا السجل **تدقيقاً محلياً لتبعيات أدوات التطوير** أُجري في 2026-08-26. ويعالج مسارات قابلة لإعادة الإنتاج في إدارة الحزم وأدوات البناء فقط. لم يتغير مصدر تشغيل التطبيق أو مخطط قاعدة البيانات أو مسار سريري أو مالي أو بيانات مرضى أو موصل خارجي أو اعتماد أو تنبيه أمني في GitHub أو إعداد مستودع GitHub.

## Remediation | المعالجة

| Local path | Constrained change | Purpose |
|---|---|---|
| `pnpm` development tool | Raised to `^10.34.4`; `packageManager` is declared as semver-only `pnpm@10.34.4`.[1] | Align the declared and executed package manager so clean installs parse the workspace configuration consistently and remain compatible with the managed Corepack parser. |
| Rollup build path | Workspace override pins `rollup` to `4.59.0`. | Remove the locally reported high-severity build-tool path without altering production application dependencies. |
| Picomatch build path | Workspace override pins `picomatch` to `4.0.4`. | Remove the locally reported high-severity build-tool path without altering production application dependencies. |
| Drizzle Kit transitive Esbuild path | Scoped workspace override pins `@esbuild-kit/core-utils@3.3.2>esbuild` to `0.28.2`. | Remove the locally reported moderate transitive development-tool path while retaining the existing Drizzle Kit version. |
| Legacy override syntax | Converted the Tailwind Nanoid selector to pnpm 10-compatible syntax and removed redundant nested Express selectors already covered by global constrained overrides. | Allow deterministic lockfile resolution under the declared pnpm version. |
| Managed Docker/Corepack compatibility | Added a minimal Dockerfile that installs `corepack@0.31.0` before the frozen pnpm install and production build. | Avoid the bundled Corepack keyset that rejected pnpm 10.34.4 in the failed managed build. |

| المسار المحلي | التغيير المقيد | الغرض |
|---|---|---|
| أداة تطوير `pnpm` | رُفعت إلى `^10.34.4` وأُعلن `packageManager` بصيغة semver فقط `pnpm@10.34.4`.[1] | مواءمة مدير الحزم المعلن والمنفذ كي يقرأ تثبيت نظيف إعداد مساحة العمل بصورة متسقة ويبقى متوافقاً مع محلل Corepack المدار. |
| مسار بناء Rollup | يثبت تجاوز مساحة العمل `rollup` على `4.59.0`. | إزالة المسار عالي الخطورة المبلغ عنه محلياً دون تغيير تبعيات التطبيق الإنتاجية. |
| مسار بناء Picomatch | يثبت تجاوز مساحة العمل `picomatch` على `4.0.4`. | إزالة المسار عالي الخطورة المبلغ عنه محلياً دون تغيير تبعيات التطبيق الإنتاجية. |
| مسار Esbuild المتعدي في Drizzle Kit | يثبت تجاوز مساحة عمل محدود `@esbuild-kit/core-utils@3.3.2>esbuild` على `0.28.2`. | إزالة المسار المتوسط المبلغ عنه محلياً مع الإبقاء على إصدار Drizzle Kit القائم. |
| صياغة التجاوزات القديمة | حُول محدد Nanoid الخاص بـ Tailwind إلى صيغة pnpm 10 وأزيلت محددات Express المتداخلة الزائدة التي تغطيها تجاوزات عامة مقيدة. | تمكين حل قفل حتمي تحت إصدار pnpm المعلن. |
| توافق Docker/Corepack المدار | أضيف Dockerfile صغير يثبت `corepack@0.31.0` قبل تثبيت pnpm المقفل وبناء الإنتاج. | تجنب مجموعة مفاتيح Corepack المضمنة التي رفضت pnpm 10.34.4 في البناء المدار الفاشل. |

## Verification evidence | أدلة التحقق

The project resolved and installed cleanly with `pnpm 10.34.4` using `pnpm install --frozen-lockfile`. The final local audit at moderate severity returned **0 information, 0 low, 0 moderate, 0 high, and 0 critical** findings. TypeScript passed; Vitest passed **256 files / 830 tests**, with **3 environment-gated files / 10 tests skipped**; and the production build passed. A Corepack 0.31.0 local simulation successfully ran the frozen pnpm install and production build for the same declared pnpm version. The sandbox has no Docker daemon, so an in-sandbox image build was not available. The managed deployment of checkpoint `d7991e9c` subsequently succeeded on 2026-08-26: production runtime logs recorded the server listening on its platform-supplied port, and the public root at `aldorapharm-fwilugbd.manus.space` rendered normally after load. The known non-blocking bundle-size warnings remain for `vendor-documents` (about 540 kB) and `vendor-core` (about 860 kB).

حُلّت تبعيات المشروع وثُبّتت بنجاح باستخدام `pnpm 10.34.4` عبر `pnpm install --frozen-lockfile`. أعاد التدقيق المحلي النهائي عند مستوى الشدة المتوسط **0 معلومات و0 منخفض و0 متوسط و0 عالٍ و0 حرج**. نجح TypeScript؛ ونجح Vitest في **256 ملفاً / 830 اختباراً** مع **3 ملفات مقيدة بالبيئة / 10 اختبارات متجاوزة**؛ ونجح بناء الإنتاج. نجحت محاكاة محلية باستخدام Corepack 0.31.0 في تنفيذ تثبيت pnpm المقفل وبناء الإنتاج لإصدار pnpm المعلن نفسه. لا يوجد Docker daemon في الصندوق، ولذلك لم يتوفر بناء صورة داخل الصندوق. نجح النشر المدار لنقطة التحقق `d7991e9c` لاحقاً في 2026-08-26: سجلت سجلات تشغيل الإنتاج استماع الخادم على منفذ المنصة، وظهر الجذر العام في `aldorapharm-fwilugbd.manus.space` بصورة طبيعية بعد اكتمال التحميل. بقيت تحذيرات حجم الحزم غير الحاجبة والمعروفة لـ `vendor-documents` (نحو 540 كيلوبايت) و`vendor-core` (نحو 860 كيلوبايت).

> This evidence is local and package-tree specific. It does not inspect, dismiss, alter, or prove the closure of any GitHub Dependabot alert.

> هذا الدليل محلي ومحدد بشجرة الحزم. ولا يفحص أو يرفض أو يعدل أو يثبت إغلاق أي تنبيه Dependabot في GitHub.

## References | المراجع

[1]: https://www.npmjs.com/package/pnpm/v/10.34.4 "pnpm 10.34.4 package metadata"
