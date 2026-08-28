# تنفيذ صرف الوصفات الطبية — Prescription Dispensing Implementation

**2026-08-28** — يسدّ الفجوة P0 (المرحلة 6: Dispense) من «تدقيق كمال صرف التعاقدات الطبية».

## ما أُضيف

| الملف | الدور |
|---|---|
| `server/routers/dispensing.ts` | موجّه tRPC `dispensing`: `recordDispense`, `listDispenses`, `recordReturn` |
| `scripts/seed-dispensing.mjs` | إنشاء جدول `prescription_dispenses` (idempotent) |
| `drizzle/medora-dispensing-schema.ts` | مخطط Drizzle للتوثيق |
| `docs/GP-MAX-EXECUTION-2026-08-28.md` | سجل التنفيذ العام |

## الجدول

`prescription_dispenses`: `organization_id`, `prescription_id` (اختياري), `patient_name`, `patient_phone`,
`drug_code`, `drug_name`, `quantity`, `unit_price_egp`, `total_egp`, `status` (`dispensed`/`returned`),
`notes`, `dispensed_by_id`, `created_at`, `dispensed_at` + فهارس منظمة/حالة.

## التشغيل

```bash
DATABASE_URL="mysql://user:pass@127.0.0.1:3306/medora" node scripts/seed-dispensing.mjs
```

## مكانة التدقيق (المراحل العشر)

| المرحلة | قبل | بعد |
|---|---|---|
| 1..5 (عقد/استحقاق/تفويض/كشف/وصفة) | ✅ | ✅ |
| **6 الصرف (Dispense)** | ⚠️ مفقودة مستقل | ✅ **منفَّذة** |
| 7..10 (مطالبة/تحصيل/مكافحة احتيال/تدقيق) | ✅ | ✅ |
