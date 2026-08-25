# Test Accounts | حسابات الاختبار

This document intentionally contains **no passwords or reusable credentials**. Test credentials must be generated or injected outside the repository and must never be committed.

يوضح هذا المستند سياسة حسابات الاختبار دون تخزين أي كلمات مرور أو بيانات اعتماد قابلة لإعادة الاستخدام داخل المستودع. يجب إنشاء بيانات اعتماد الاختبار أو حقنها خارج المستودع، ولا يجوز Commit لها.

## Default Development Account | حساب التطوير الافتراضي

| Role | Username | Password |
|---|---|---|
| Administrator | `test` | **Managed outside the repository** |

| الدور | اسم المستخدم | كلمة المرور |
|---|---|---|
| مسؤول | `test` | **تُدار خارج المستودع** |

## Usage | الاستخدام

For local or staging environments, inject a unique synthetic password through the environment or your secret manager. For CI, the workflow generates a per-run synthetic password and does not persist it in source control.

لبيئات التطوير أو الاختبار، أدخل كلمة مرور اصطناعية فريدة عبر متغيرات البيئة أو مدير الأسرار. أما CI فينشئ كلمة مرور اصطناعية مختلفة لكل تشغيل ولا يحفظها في المصدر.

Never use real patient, prescription, payment, production credential, or other sensitive data in test fixtures.

لا تستخدم مطلقًا بيانات مرضى أو وصفات أو مدفوعات أو بيانات اعتماد إنتاجية أو أي بيانات حساسة حقيقية داخل بيانات الاختبار.
