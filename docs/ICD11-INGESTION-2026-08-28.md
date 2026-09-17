# ICD-11 Ingestion — استيعاب ICD-11 من واجهة منظمة الصحة العالمية

**2026-08-28** — سكربت `scripts/icd11-ingest.mjs` مبني على وثيقتين رسميتين لمنظمة الصحة العالمية:

- [ICD Schema](https://icd.who.int/docs/icd-api/ICD-Schema/) — بنية كيان JSON-LD.
- [ICD API Local Deployment](https://icd.who.int/docs/icd-api/ICDAPI-LocalDeployment/) — النشر المحلي.

## حقائق موثّقة من الوثيقتين (اقتباس)

| الخاصية | المعنى الرسمي |
|---|---|
| **Parent** | قائمة الكيانات الأم (super classes)؛ في خطيات ICD-11 وICD-10 يُسمح بأب واحد فقط لكل كيان، أما في الـFoundation فقد تتعدد. |
| **Child** | خاصية الأطفال عبر SKOS `narrowerTransitive`. |
| **Title** | عنوان الكيان عبر SKOS `prefLabel`. |
| **Description (Definition)** | وصف قصير لما يَصِدُق دائمًا على المرض/الحالة. |
| **Additional Information (Long Definition)** | نص اختياري بمعلومات إضافية. |
| **Fully Specified Name** | عنوان لا لبس فيه لا يفترض سياقًا. |
| **Synonym** | مرادفات عبر SKOS `altLabel`. |
| **Inclusion / Exclusion / Narrower Term** | قوائم تضمين/استبعاد/مصطلحات أضيق. |
| **Browser Url** | رابط مباشر لكيان التصنيف في متصفح WHO على الويب. |
| **Code** | رمز التصنيف؛ يسري في جداول ICD-10 وICD-11 (الخطيات). |

## النشر المحلي (اقتباس من ICDAPI-LocalDeployment)

- نقاط النهاية في السحابة تبدأ بـ `https://id.who.int/icd`؛ نسخة الحاوية المحلية مطابقة مع اختلاف الرأس فقط: `https://id.who.int/icd/entity` → `http://yourserver.com/icd/entity`.
- **النسخ المحلية لا تتطلب مصادقة OAuth-2**.
- خياران/ثلاثة: حاوية Docker، خدمة Windows، خدمة Linux systemd.
- تشمل أداة الترميز Coding Tool والمتصفح Browser مسبقًا: `../ct` و`../browse` (مثال: `http://localhost/ct`).
- ملف واجهة OpenAPI (Swagger): `../swagger/index.html`.
- الخطية `mms` متوفرة؛ و`icf` متاحة بعد إصدار `2024-01`.

## غير موثق في هاتين الصفحتين (معلن بصراحة — لم أختلقه)

- اسم/وسم صورة Docker الدقيق ومتغيرات البيئة للحاوية → صفحة [ICDAPI-DockerContainer](https://icd.who.int/docs/icd-api/ICDAPI-DockerContainer/).
- تفاصيل رأس `API-Version` / `Accept-Language` النهائية → [APIDoc-Version2](https://icd.who.int/docs/icd-api/APIDoc-Version2/).
- عنوان نقطة الرمز: **موثق من وثائق WHO** كـ `https://icdaccessmanagement.who.int/connect/token` (من بحث رسمي سابق؛ الفحص المباشر في هذا الدور أعاد 400 بدون client_id — الشبكة حية والنقطة تعمل).

السكربت يقرأ هذه القيم كمتغيرات/خيارات قابلة للضبط (`ICD11_BASE_URL`, `ICD11_API_VERSION`, `ICD11_TOKEN_URL`).

## تعيين الحقل → العمود

| ICD-API (JSON-LD) | عمود MEDORA | ملاحظة |
|---|---|---|
| `@id` (URI متعارف عليه) | `uri` | يبدأ بـ `http://id.who.int/icd/...` |
| `code` | `code` | رمز الخطية |
| `title.prefLabel` (اللغة) | `title_en` / `title_ar` | عبر `Accept-Language` + البحث عن `ar` |
| `parent` (الأب الأول في الخطية) | `parent_code` | أب واحد لكل كيان في الخطية |
| `child` (narrowerTransitive) | (حافة عبور) | يُستخدم للتنقل العودي |
| `browserUrl`, `definition` | — | تُسجَّل في السجل (قابلة للإضافة لاحقًا) |

## الأوامر

```bash
# سحابة (مفاتيح مجانية من icd.who.int/icdapi):
ICD11_CLIENT_ID="..." ICD11_CLIENT_SECRET="..." \
DATABASE_URL="mysql://<user%40gmail.com>:<p%40ss%20word>@127.0.0.1:3306/medora" \
node scripts/icd11-ingest.mjs --release 2024-01

# حاوية محلية (بدون OAuth):
ICD11_BASE_URL="http://localhost:8080/icd" \
DATABASE_URL="mysql://medora_app:strong-pass@127.0.0.1:3306/medora" \
node scripts/icd11-ingest.mjs --smoke

# تحقق من الإعداد دون شبكة:
DATABASE_URL="..." node scripts/icd11-ingest.mjs --dry-run
```

## متطلبات الجدول

أُضيف عمودان إلى `icd11_codes`: `uri TEXT NULL` و`parent_code VARCHAR(32) NULL` (مطابقان لتحديث `drizzle/icd11-schema.ts`). الرموز الابتدائية الـ31 تبقى بـ `is_starter=1`؛ الكيانات المستورَدة بـ `is_starter=0`.
