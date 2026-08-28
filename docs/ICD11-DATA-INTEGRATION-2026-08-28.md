# ICD-11 Data Integration — دمج بيانات ICD-11 (2026-08-28)

## المصدر (مُتحقَّق هذا الدور)
- الواجهة: `https://clinicaltables.nlm.nih.gov/api/icd11_codes/v3/search` (مضيف NLM الرسمي، مجاني، "provided as is").
- التوثيق: [clinicaltables icd11_codes v3](https://clinicaltables.nlm.nih.gov/apidoc/icd11_codes/v3/doc.html)
- الحقول المستقاة: `code`, `title` (بالإنجليزية), `chapter`, `entityId` (URI سياق الخطية), `source` (URI الأساس Foundation).
- ملاحظة: المضيفون `deepscribe.ai` و `nih.gov` متطابقان (الوثيقة تذكر أن NIH هو المضيف الأساسي).

## التنفيذ
- `scripts/icd11-import-nlm.mjs` — عميل مجدول (صفحات بصفحة، سقف آمن `--max`)، إدراج إضافي `ON DUPLICATE KEY UPDATE`.
- الجدول: `icd11_codes` (columns: code, title_en, title_ar, chapter, parent_code, version, release_date, source, uri, is_starter, created_at).
- الصفوف المستوردة: `is_starter=0`؛ الـ31 الابتدائية تبقى `is_starter=1` (بدون مساس).
- العربية: واجهة NLM إنجليزية فقط → `title_ar` يبقى فارغًا للصفوف المستوردة (صدق، لا توليد).

## الأوامر
```bash
DATABASE_URL="mysql://user:pass@127.0.0.1:3306/medora" node scripts/icd11-import-nlm.mjs
# أو بسقف محدد:
DATABASE_URL="..." node scripts/icd11-import-nlm.mjs --max 5000
```

## الربط الكامل
- `drizzle/icd11-schema.ts` ↔ `icd11_codes` ↔ `server/routers/icd11.ts` (stats/search/getByCode/listChapters) ↔ `client/src/pages/Icd11.tsx` (`/icd11`).
- `e_prescriptions.icd11_code`, `icd11_version` — ربط الوصفات برموز الخطية.
- `.env.example`: `ICD11_SOURCE`, `ICD11_BASE_URL`, `ICD_API_CLIENT_ID/SECRET`.

## ترخيص (بصدق)
- محتوى ICD-11 © منظمة الصحة العالمية؛ الاستخدام عبر WHO/NLM "as is" وليس ترخيصًا مفتوحًا OSI.
- **لا توجد مرآة مفتوحة كاملة قانونية** للخطية؛ المصادر الثالثة (Kaggle/HuggingFace) غير موثوقة/غير مرخّصة — لا نعتمدها.


## نتائج التحقق الفعلية (2026-08-28)
- نهاية الواجهة حية: `search?terms=heart` أعاد `[142, [...]]`، و`total=35664` رمزًا.
- الاستيعاب الفعلي: **7481 صفًا** مستوردًا في `icd11_codes` (is_starter=0) من مصدر NLM؛ الـ31 الابتدائية بقيت (is_starter=1).
- أمثلة متحققة: `BA00 Essential hypertension`، `5A11 Type 2 diabetes mellitus`، `CA23 Asthma`.
- ملاحظة: FHIR $expand أعاد 404 على المضيفين → المسار المعتمد هو `/search` المُرحَّل.
