# Managed-Project Visual Validation Sync Assessment — 2026-08-26

> **Scope:** This record documents a compatibility assessment for the managed MEDORA project checkpoint `31d87402`. It does not transplant application code, change a default branch, alter authentication, or claim that a workflow has been executed live.

## Why this pull request is documentation-only

The managed project and this repository are different working trees. The managed checkpoint repaired a reproducible `/login` hero-brand failure, added a visible text fallback, expanded an unauthenticated route sweep, and recorded validation evidence. A file-level comparison found that the managed brand module and its server-side logo contract do not exist in this repository. Although both trees contain `client/src/pages/Login.tsx` and `e2e/medora-localization.spec.ts`, their surrounding architecture is not established as equivalent.

| Managed-project item | Canonical repository state | Safe synchronization decision |
|---|---|---|
| `client/src/lib/brand.ts` | Absent | Do not copy: no matching module contract. |
| `server/medora-logo.contract.test.ts` | Absent | Do not copy: no matching server test surface. |
| `client/src/pages/Login.tsx` | Present | Do not copy mechanically: a similarly named page is not proof of equivalent auth or asset behavior. |
| `e2e/medora-localization.spec.ts` | Present | Do not copy mechanically: test fixtures and assertions require repository-local review. |
| Validation documentation | Compatible as evidence only | Record the assessment; keep runtime code unchanged. |

## Evidence from the managed project

The managed checkpoint passed focused brand contracts, full Vitest (**255 files / 826 tests passed; 3 files / 10 tests intentionally skipped**), TypeScript, and production build. Public route and access-shell screenshots were reviewed at desktop and mobile widths. This evidence applies to the managed project only; it is not evidence that this repository’s different implementation has the same runtime behavior.

## Decision and next safe step

No executable file is introduced by this branch. The branch is intentionally a reviewable record that the managed-project change was assessed but not mechanically ported. If the same defect can be reproduced in this repository, it must be repaired in a separate repository-local branch with a focused test and the repository’s own validation gate.

---

# تقييم مزامنة التحقق المرئي للمشروع المُدار — 2026-08-26

> **النطاق:** يوثق هذا السجل تقييم توافق لنقطة مراجعة مشروع MEDORA المُدار `31d87402`. لا ينقل كود التطبيق، ولا يغير فرعاً افتراضياً، ولا يعدل المصادقة، ولا يدعي تنفيذ أي مسار تشغيلي حياً.

## سبب اقتصار طلب السحب على التوثيق

المشروع المُدار وهذا المستودع شجرتا عمل مختلفتان. أصلحت نقطة المراجعة المُدارة تعذر شعار لوحة `/login` القابل لإعادة الإنتاج، وأضافت بديلاً نصياً ظاهراً، ووسعت مسح المسارات غير الموثقة، وسجلت أدلة التحقق. أظهرت المقارنة على مستوى الملفات أن وحدة الهوية المُدارة وعقد شعار الخادم لا يوجدان في هذا المستودع. ورغم أن الشجرتين تتضمنان `client/src/pages/Login.tsx` و`e2e/medora-localization.spec.ts`، فلم يثبت تكافؤ البنية المحيطة بهما.

| عنصر المشروع المُدار | حالة المستودع المرجعي | قرار المزامنة الآمن |
|---|---|---|
| `client/src/lib/brand.ts` | غير موجود | لا نسخ: لا يوجد عقد وحدة مماثل. |
| `server/medora-logo.contract.test.ts` | غير موجود | لا نسخ: لا يوجد سطح اختبار خادم مماثل. |
| `client/src/pages/Login.tsx` | موجود | لا نسخ آلي: تشابه الاسم لا يثبت تكافؤ المصادقة أو الأصول. |
| `e2e/medora-localization.spec.ts` | موجود | لا نسخ آلي: تتطلب التجهيزات والتوقعات مراجعة محلية. |
| توثيق التحقق | متوافق كدليل فقط | يسجل التقييم وتبقى شيفرة التشغيل دون تغيير. |

## دليل المشروع المُدار

اجتازت نقطة المراجعة المُدارة عقود الهوية المركزة وVitest كاملاً (**255 ملفاً / 826 اختباراً ناجحاً؛ 3 ملفات / 10 اختبارات متجاوزة عمداً**) وTypeScript وبناء الإنتاج. روجعت لقطات للمسارات العامة وأغلفة الوصول على سطح المكتب والهاتف. ينطبق هذا الدليل على المشروع المُدار فقط، ولا يثبت أن التنفيذ المختلف في هذا المستودع يملك السلوك نفسه.

## القرار والخطوة الآمنة التالية

لا يقدم هذا الفرع أي ملف تنفيذي. وهو سجل مراجع عن تقييم التغيير في المشروع المُدار وعدم نقله آلياً. إذا أمكن إعادة إنتاج العيب نفسه هنا، فيجب إصلاحه في فرع محلي منفصل للمستودع مع اختبار مركز وبوابة التحقق الخاصة به.
