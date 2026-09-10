# data/ — Egyptian Drug Database 🇪🇬💊

## بالعربية

هذا المجلد يحتوي **قاعدة الأدوية المصرية** الجاهزة للاستيراد:

| الملف | الوصف |
|---|---|
| `egyptian-drugs.csv` | **25,094 دواءً** مسجّلًا في السوق المصري (اسم تجاري، اسم عام، شركة، تركيز، شكل صيدلاني، تصنيف…) |

- **المصدر:** مشروع [karem505/egyptian-drug-database](https://github.com/karem505/egyptian-drug-database)
- **الرخصة:** **CC0-1.0** (ملكية عامة — بدون قيود)
- **الاستيراد إلى ميدورا:**
  ```bash
  DATABASE_URL="mysql://user:pass@127.0.0.1:3306/medora" \
    node scripts/provision-medora.mjs --admin admin:admin --drugs data/egyptian-drugs.csv
  ```
- النتيجة: جدول `catalog_items` بـ `sourceAuthority = 'EGYPTIAN_DRUG_DATABASE_CC0'`.

## English

This folder holds the ready-to-import **Egyptian drug database**:

- `egyptian-drugs.csv` — **25,094 records** of medicines registered in the Egyptian market.
- Source: [karem505/egyptian-drug-database](https://github.com/karem505/egyptian-drug-database) — **CC0-1.0** (public domain).
- Import via `scripts/provision-medora.mjs` (see above) → populates `catalog_items` with `sourceAuthority='EGYPTIAN_DRUG_DATABASE_CC0'`.
