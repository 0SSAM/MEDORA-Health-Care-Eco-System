# Contributing to MEDORA | دليل المساهمة في ميدورا

Thank you for helping build **MEDORA | ميدورا**, a bilingual healthcare operations platform for pharmacy groups, hospitals, and connected healthcare networks. Contributions should improve operational value while protecting privacy, tenant isolation, auditability, reliability, and regulatory readiness.

شكرًا لمساهمتك في بناء **MEDORA | ميدورا**، وهي منصة ثنائية اللغة لتشغيل الصيدليات والمستشفيات وشبكات الرعاية الصحية المتصلة. يجب أن تجمع كل مساهمة بين القيمة التشغيلية وحماية الخصوصية وعزل المستأجرين وقابلية التدقيق والاعتمادية والجاهزية التنظيمية.

## Before You Start | قبل البدء

Read the [README](README.md), the relevant files in `docs/`, and the [SECURITY.md](SECURITY.md) policy before changing code. Never commit real patient or prescription data, production credentials, private keys, access tokens, database exports, sensitive screenshots, dependency caches, build artifacts, coverage output, or local logs.

اقرأ [README](README.md) والملفات ذات الصلة داخل `docs/` وسياسة [SECURITY.md](SECURITY.md) قبل تعديل الكود. يُمنع رفع بيانات المرضى أو الوصفات الحقيقية، أو بيانات اعتماد الإنتاج، أو المفاتيح الخاصة، أو رموز الوصول، أو نسخ قواعد البيانات، أو لقطات الشاشة الحساسة، أو تخزين الاعتماديات المؤقت، أو مخرجات البناء والتغطية، أو السجلات المحلية.

## Contribution Workflow | دورة المساهمة

1. **Clarify the problem.** For substantial work, open an Issue or discussion describing the user problem, affected workflow, assumptions, security impact, and smallest useful scope. A focused documentation or test correction may go directly to a pull request.

   **وضّح المشكلة.** في الأعمال الكبيرة، أنشئ Issue أو نقاشًا يشرح مشكلة المستخدم ومسار العمل المتأثر والافتراضات والأثر الأمني وأصغر نطاق مفيد. ويمكن لإصلاح توثيقي أو اختبار صغير أن ينتقل مباشرة إلى Pull Request.

2. **Create a focused branch from `main`.** Use a descriptive name such as `feature/fefo-alerts`, `fix/eta-validation`, `docs/security-guide`, or `test/pos-contracts`. Never develop directly on `main`.

   **أنشئ فرعًا متخصصًا من `main`.** استخدم اسمًا واضحًا مثل `feature/fefo-alerts` أو `fix/eta-validation` أو `docs/security-guide` أو `test/pos-contracts`. لا تطوّر مباشرة على `main`.

3. **Implement the smallest complete change.** Keep business rules and authorization on the server, preserve tenant isolation, make compliance behavior explicit, and avoid silent fallbacks around regulated workflows. Add regression coverage for every changed rule.

   **نفّذ أصغر تغيير مكتمل.** أبقِ قواعد الأعمال والتفويض على الخادم، وحافظ على عزل المستأجرين، واجعل سلوك الامتثال واضحًا، وتجنب البدائل الصامتة في مسارات العمل المنظمة. أضف اختبارات انحدار لكل قاعدة تم تغييرها.

4. **Preserve the MEDORA experience.** Keep Arabic RTL behavior, English clarity, keyboard accessibility, readable contrast, responsive layouts, and consistent product terminology. Distinguish implemented capabilities from roadmap ideas in documentation and user-facing copy.

   **حافظ على تجربة MEDORA.** حافظ على اتجاه RTL العربي ووضوح الإنجليزية وإمكانية الاستخدام بلوحة المفاتيح والتباين المقروء والتخطيطات المتجاوبة والمصطلحات الموحدة. ميّز في الوثائق والواجهات بين الميزات المنفذة وأفكار خارطة الطريق.

5. **Run local checks.** At minimum, run:

   ```bash
   pnpm check
   pnpm test
   pnpm build
   ```

   For CI or smoke-flow changes, also run `pnpm exec prettier --check .github/workflows`, `bash -n scripts/ci-smoke.sh`, and the applicable smoke test.

   **شغّل الفحوصات المحلية.** شغّل على الأقل الأوامر السابقة. وعند تعديل CI أو مسارات smoke، شغّل أيضًا فحص Prettier وفحص صياغة `scripts/ci-smoke.sh` ومسار الاختبار المناسب.

6. **Review the diff.** Confirm the change contains only intentional files. Run `git status`, `git diff --stat`, `git diff --check`, and review the complete staged file list before opening a pull request.

   **راجع الفرق.** تأكد من أن التغيير يحتوي على الملفات المقصودة فقط. شغّل `git status` و`git diff --stat` و`git diff --check` وراجع قائمة الملفات المضافة كاملة قبل فتح Pull Request.

7. **Open a pull request.** Use the repository template and summarize the change in English and Arabic. Include test evidence, migrations, operational prerequisites, rollback considerations, and whether the change affects patient safety, billing, audit trails, permissions, or regulatory integrations.

   **افتح Pull Request.** استخدم قالب المستودع ولخّص التغيير بالعربية والإنجليزية. أدرج أدلة الاختبار والترحيلات والمتطلبات التشغيلية واعتبارات التراجع، واذكر ما إذا كان التغيير يؤثر في سلامة المرضى أو الفوترة أو سجلات التدقيق أو الصلاحيات أو التكاملات التنظيمية.

## Technical Expectations | التوقعات التقنية

| Area | MEDORA expectation | التوقع في ميدورا |
|---|---|---|
| Architecture | Preserve the separation between `client/`, `server/`, `shared/`, and database migrations. | الحفاظ على الفصل بين `client/` و`server/` و`shared/` وترحيلات قاعدة البيانات. |
| Authorization | Enforce permissions on the server; client-side visibility is not a security boundary. | فرض الصلاحيات على الخادم؛ إخفاء عناصر الواجهة ليس حدًا أمنيًا. |
| Tenant isolation | Scope every tenant and branch read/write explicitly and test cross-tenant denial. | تحديد نطاق كل قراءة وكتابة حسب المستأجر والفرع واختبار منع الوصول المتبادل. |
| Healthcare data | Use synthetic fixtures and redact sensitive values in tests and logs. | استخدام بيانات اصطناعية وإخفاء القيم الحساسة في الاختبارات والسجلات. |
| Auditability | Keep important state transitions attributable, explainable, and reviewable. | إبقاء انتقالات الحالة المهمة قابلة للنسب والتفسير والمراجعة. |
| Compliance | Treat MOH, EDA, ETA, NFSA, UHIA, payment, and similar integrations as explicit boundaries. | التعامل مع تكاملات الجهات التنظيمية والدفع كحدود واضحة وموثقة. |
| Accessibility | Preserve keyboard access, readable contrast, responsive layouts, and Arabic RTL behavior. | الحفاظ على الوصول بلوحة المفاتيح والتباين والتجاوب واتجاه RTL العربي. |
| Tests | Add regression coverage for business rules, authorization, validation, and integrations. | إضافة اختبارات انحدار لقواعد الأعمال والتفويض والتحقق والتكاملات. |

## Pull Request Review | مراجعة Pull Request

Every pull request should be reviewed for correctness, security, tenant isolation, operational impact, documentation quality, and test evidence. Changes affecting `/server/`, `/drizzle/`, `/.github/`, authentication, authorization, regulated workflows, or security documentation require explicit maintainer review. Protected `main` changes must not be merged automatically.

يجب مراجعة كل Pull Request من حيث الصحة والأمان وعزل المستأجرين والأثر التشغيلي وجودة التوثيق وأدلة الاختبار. وتتطلب التغييرات التي تمس `/server/` أو `/drizzle/` أو `/.github/` أو المصادقة أو التفويض أو المسارات المنظمة أو وثائق الأمان مراجعة صريحة من المشرف. ولا يجوز دمج تغييرات `main` تلقائيًا.

## Commit Messages | رسائل الالتزام

Use concise, imperative messages with a conventional prefix when practical: `feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `security:`, or `ci:`. For user-facing changes, mention the affected capability; add Arabic context when it improves clarity.

استخدم رسائل موجزة بصيغة الأمر مع بادئة واضحة عند الإمكان مثل `feat:` أو `fix:` أو `docs:` أو `test:` أو `refactor:` أو `security:` أو `ci:`. وفي التغييرات الظاهرة للمستخدم، اذكر القدرة المتأثرة وأضف السياق العربي عند الحاجة.

## Questions and Support | الأسئلة والدعم

For feature questions or reproducible defects, open a GitHub Issue without sensitive data. For suspected vulnerabilities, do **not** open a public issue; follow the private reporting process in [SECURITY.md](SECURITY.md).

للاستفسارات المتعلقة بالميزات أو العيوب القابلة لإعادة الإنتاج، أنشئ GitHub Issue خاليًا من البيانات الحساسة. أما الثغرات المحتملة فلا تُنشر في Issue عام، بل اتبع آلية الإبلاغ الخاص في [SECURITY.md](SECURITY.md).

Thank you for improving **MEDORA** responsibly.

شكرًا لتحسين **ميدورا** بمسؤولية.

## References | المراجع

- [MEDORA README](README.md)
- [MEDORA Security Policy](SECURITY.md)
- [GitHub Documentation: About pull requests](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests)
- [GitHub Documentation: About protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches)

---

© 2026 MEDORA Health Care Eco System. Private project.
