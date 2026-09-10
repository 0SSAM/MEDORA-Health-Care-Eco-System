# Egypt GAHAR Readiness Evidence — 2026-08-15

## Official source reviewed

- **GAHAR accreditation standards portal:** https://gahar.gov.eg/ar/content-layout/%D9%85%D8%AA%D8%B7%D9%84%D8%A8%D8%A7%D8%AA-%D8%A7%D9%84%D8%A7%D8%B9%D8%AA%D9%85%D8%A7%D8%AF
- The page states that GAHAR develops healthcare accreditation standards under Egypt Law No. 2 of 2018 relating to Universal Health Insurance, and that the authority is responsible for setting quality standards, accrediting healthcare facilities, and monitoring application for sustainability.
- The page describes two principal orientations in the standards: **patient-centered** and **organization-centered** care. The patient-centered orientation addresses responsiveness to patients and families; the organization-centered orientation addresses a safe and effective work environment for staff, patients, and families.
- The official portal lists separate standard families for hospitals, primary healthcare, physiotherapy centers, medical laboratories, specialized medical centers and ambulatory surgery, diagnostic/therapeutic radiology centers, mental-health hospitals, and convalescent/extended-care/medical-wellness facilities. It also references public pharmacies and private clinics as annexes in the specialized/ambulatory-surgery material.
- The portal says standards are reviewed by internal and external experts and subjected to field testing and prospective study before approval by the authority’s board. Therefore MEDORA may provide readiness evidence management and self-assessment, but must not claim official accreditation.
- Official contact details shown on the page are Marketing@gahar.gov.eg and (+20) 220547614; these are recorded only as public reference contacts, not as an integration credential or endpoint.

## Implementation boundary

MEDORA should model facility type, standard family, standard version/effective date, domain, criterion, evidence, owner, review cycle, corrective action, incident linkage, and approval state. External submission, inspection scheduling, accreditation decision, and any official data exchange remain fail-closed until GAHAR provides authoritative specifications, credentials, a test environment, acceptance criteria, and written authorization.

## تنفيذ حزمة الجاهزية الداخلية

أضيفت نماذج داخلية لملفات الجاهزية، المعايير، الأدلة، الإجراءات التصحيحية ومؤشرات الجودة ضمن نطاق المؤسسة والفرع والاختصاص. أضيفت إجراءات tRPC للقراءة والإنشاء، مع تشفير حقول الحلول الحساسة، والتحقق من النطاق قبل الوصول إلى أي سجل تابع. تعرض لوحة مصر عدد الملفات والمعايير والأدلة والمؤشرات وحالة بوابة التقديم.

هذه الحزمة **أداة جاهزية وتقييم ذاتي داخلية وليست اعتماداً رسمياً**. لا يتم إرسال أي ملف أو دليل إلى GAHAR، وتظل إجراءات التقديم الرسمي مغلقة حتى تتوفر موافقة مكتوبة، مواصفات نقطة النهاية الرسمية، بيئة اختبار، بيانات اعتماد، واختبار قبول موثق من الجهة المختصة.

نتيجة التحقق الحالي: TypeScript ناجح، 87 ملف اختبار ناجحاً، 287 اختباراً ناجحاً، 5 اختبارات اختيارية متخطاة بأمان، والبناء الإنتاجي ناجح. تحذير حجم الحزمة الأمامية موثق كتحسين أداء لاحق وليس فشلاً وظيفياً.
