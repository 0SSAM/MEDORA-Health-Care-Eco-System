# ICD-11 Integration — تكامل التصنيف الدولي للأمراض 11

**2026-08-28 — الوحدة الجديدة ضمن MEDORA (مرجعية).**

## ما أُضيف

| الملف | الدور |
|---|---|
| `drizzle/icd11-schema.ts` | مخطط Drizzle لجدول `icd11_codes` |
| `scripts/seed-icd11.mjs` | زراعة الجدول: خطية كاملة (عبر `--data`) أو مجموعة ابتدائية موثقة |
| `server/routers/icd11.ts` | موجّه tRPC `icd11`: `stats`, `search`, `getByCode`, `listChapters` (دور: admin/manager/pharmacist) |
| `client/src/pages/Icd11.tsx` | صفحة `/icd11` عربية RTL للبحث والتصفح |
| `server/routers.ts` / `client/src/App.tsx` | التسجيل في الموجه العام + المسار |

## الانسجام مع النظام

- **نفس نمط المرجعية السريرية** كوحدة `nlm-icd10` الموجودة سابقًا (US reference): حارس دور `["admin","manager","pharmacist"]`، إخلاء مسؤولية "مرجعية فقط"، نفس نمط tRPC + Zod.
- **نفس نمط الواجهة** كـ `Delivery.tsx` / `GpMax.tsx` (fetch مباشر، RTL، ألوان النظام).
- **نقطة ربط لاحقة**: `e_prescriptions` يمكن أن تستقبل `icd11_code`/`icd11_version` (ALTER جاهز في خطوات التثبيت) لربط الوصفة بالتشخيص.

## بيانات ICD-11 (الصدق الكامل)

- **المصدر الرسمي الكامل** (نحو 55,000 رمز، MMS) يتطلب صلاحيات WHO ICD-API (client_id/secret عبر OAuth) — غير متاحة في بيئة البناء هذه بدون مفاتيح.
- إذا توفّر ملف بيانات (JSON/CSV) به ≥500 رمز → `scripts/seed-icd11.mjs --data <file>` يستورد الخطية كاملة (`is_starter=0`).
- بدون ملف → تُزرع **مجموعة ابتدائية موثقة** من الرموز الشائعة (`is_starter=1`، معلنة في الواجهة) — لا تُقدَّم كخطية كاملة.

## التثبيت

```bash
DATABASE_URL="mysql://user:pass@127.0.0.1:3306/medora" node scripts/seed-icd11.mjs
# مع ملف كامل:
DATABASE_URL="..." node scripts/seed-icd11.mjs --data /path/icd11_full.json
# ربط الوصفة (اختياري للقادم):
mysql ... -e "ALTER TABLE e_prescriptions ADD COLUMN icd11_code VARCHAR(16) NULL, ADD COLUMN icd11_version VARCHAR(128) NULL;"
# الواجهة: http://localhost:3000/icd11
```
