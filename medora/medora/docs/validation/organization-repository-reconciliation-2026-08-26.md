# MEDORA repository reconciliation record — 2026-08-26
# سجل تسوية مستودعات MEDORA — 2026-08-26

> **Decision | القرار:** `0SSAM/MEDORA-Health-Care-Eco-System` is the owner-selected canonical repository. `MEDORA-Health-Care-Eco-System/MEDORA-Health-Care-Eco-System` is retained as a separately governed historical source. This record preserves the comparison evidence and does not claim that either repository is an approved clinical, financial, regulatory, security, or production authority.
>
> **القرار:** المستودع `0SSAM/MEDORA-Health-Care-Eco-System` هو المستودع المرجعي الذي اختاره المالك. ويُحتفظ بـ `MEDORA-Health-Care-Eco-System/MEDORA-Health-Care-Eco-System` كمصدر تاريخي مستقل الحوكمة. يحفظ هذا السجل أدلة المقارنة ولا يدعي أن أياً من المستودعين مرجع معتمد سريرياً أو مالياً أو تنظيمياً أو أمنياً أو إنتاجياً.

## Compared immutable references | المراجع الثابتة المقارنة

| Role | Repository | Branch | Commit |
|---|---|---|---|
| Canonical base | [`0SSAM/MEDORA-Health-Care-Eco-System`](https://github.com/0SSAM/MEDORA-Health-Care-Eco-System) | `main` | `667ac8b097cb8fb33597c07a09bc9a165393e79b` |
| Historical source | [`MEDORA-Health-Care-Eco-System/MEDORA-Health-Care-Eco-System`](https://github.com/MEDORA-Health-Care-Eco-System/MEDORA-Health-Care-Eco-System) | `main` | `cf70e90fc9830ebea6e933735ca5a9c39fb64afa` |

The two `main` branches have no merge-base. At the captured comparison point, the canonical repository had 377 unique commits and the historical-source repository had 25 unique commits. This is a disconnected-history situation, not a normal ahead/behind relationship.

لا توجد نقطة أساس مشتركة بين فرعي `main`. وعند نقطة المقارنة المسجلة، يملك المستودع المرجعي 377 التزاماً فريداً ويملك مستودع المصدر التاريخي 25 التزاماً فريداً. هذه حالة تاريخين منفصلين وليست علاقة تقدّم/تأخر عادية.

## Controlled reconciliation method | طريقة التسوية المضبوطة

The integration branch records the historical-source `main` as a parent while retaining the canonical working tree. It deliberately does **not** import implementation files from the historical source in this change. This gives later, reviewed work a common Git ancestry without bulk replacement of executable code, tests, dependencies, configuration, documentation, or security controls.

يسجل فرع التكامل `main` الخاص بالمصدر التاريخي كأحد الأبوين مع الإبقاء على شجرة العمل المرجعية. وهو لا يستورد عمداً ملفات تنفيذية من المصدر التاريخي في هذا التغيير. وبذلك تتوفر نقطة نسب مشتركة لأعمال لاحقة مراجعَة دون استبدال جماعي للكود التنفيذي أو الاختبارات أو الاعتمادات أو الإعدادات أو الوثائق أو ضوابط الأمان.

## Why a content merge was rejected | سبب رفض دمج المحتوى

A local, non-committed merge simulation produced **93 add/add conflicts** across the following areas. Resolving them automatically would risk silently replacing behavior or lowering security and quality gates.

أنتجت محاكاة دمج محلية غير ملتزمة **93 تعارض إضافة/إضافة** ضمن المجالات التالية. وقد يؤدي حلها تلقائياً إلى استبدال سلوك بصمت أو خفض بوابات الأمان والجودة.

| Area | Conflicts | Reconciliation treatment |
|---|---:|---|
| `server/` | 44 | Retained canonical implementation; any future adoption must be a separately tested, scoped change. |
| `client/` | 17 | Retained canonical user interface and localization behavior; any change needs visual and accessibility checks. |
| `docs/` | 14 | Retained canonical documentation except this reconciliation record; imported documents are not presumed accurate. |
| `scripts/` | 3 | Not adopted; scripts must be independently reviewed for safety and environment assumptions. |
| `skills/` | 2 | Not adopted automatically; source guidance may differ from current operational controls. |
| Root, CI, lockfile, schema, shared, E2E | 13 | Retained canonical files; no dependency, schema, CI, CodeQL, or deployment configuration is transferred. |

## Security and regulated-operation boundary | حد الأمان والعمليات المنظمة

No source code, credentials, dependency lockfiles, database schema, migrations, test accounts, patient information, coverage, pricing, claims, payments, tax submissions, government/insurer connections, or device integrations are copied by this reconciliation record. The existing canonical CodeQL operating model remains unchanged. No security alert content was read, modified, dismissed, or inferred.

لا ينسخ سجل التسوية هذا أي كود مصدر أو اعتماد أو ملف قفل اعتمادات أو مخطط قاعدة بيانات أو ترحيلات أو حسابات اختبار أو معلومات مرضى أو تغطية أو أسعار أو مطالبات أو مدفوعات أو إقرارات ضريبية أو اتصالات حكومية/تأمينية أو تكاملات أجهزة. يظل نموذج تشغيل CodeQL القائم في المستودع المرجعي دون تغيير. ولم يُقرأ أو يُعدَّل أو يُتجاهل أو يُستنتج أي محتوى لتنبيه أمني.

## Follow-up rule | قاعدة المتابعة

Any future adoption from the historical source must use a dedicated pull request with a file-level rationale, relevant tests, dependency and security review, and the canonical repository’s full validation gate. It must not rely on the fact that the historical-source commit is now reachable in Git history as evidence of correctness, compliance, operational readiness, or authorization.

أي تبنٍّ لاحق من المصدر التاريخي يجب أن يتم عبر طلب سحب مستقل يحتوي على مبرر على مستوى الملفات، واختبارات ذات صلة، ومراجعة للاعتمادات والأمان، واجتياز بوابة التحقق الكاملة للمستودع المرجعي. ولا يجوز أن يعتمد على مجرد إمكانية الوصول إلى التزام المصدر التاريخي في سجل Git كدليل على الصحة أو الامتثال أو الجاهزية التشغيلية أو التفويض.
