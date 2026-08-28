# حزمة ترقية MEDORA الشاملة — 2026-08-28

**الإصدار:** v1.0 — **السياسة:** التطوير على `main` مباشرة (لا فروع).

هذه الحزمة تضيف للمستودع: نظام صلاحيات كامل (RBAC) يُدار من حساب الأدمن، مراجعة آلية مستمرة بالذكاء الاصطناعي (تقرير + تقييم + توصيات)، تحصين أمني، وإرشادات تركيب وتحقق لكل جزء.

---

## 1) مكوّنات الحزمة (ملفات مضافة)

| الملف | الوظيفة |
|---|---|
| `drizzle/medora-upgrade-schema.ts` | جداول RBAC + جداول AI Review (snake_case، بلا branches) |
| `server/routers/rbac.ts` | موجه tRPC لإدارة الأدوار والصلاحيات ومنحها للمستخدمين |
| `server/routers/ai-review.ts` | موجه tRPC للمراجعة الآلية (تقرير + درجات + توصيات) |
| `scripts/seed-rbac-and-roles.mjs` | بذرة: 73+ صلاحية، 10 أدوار نظام، وربط مدراء المنشآت |

---

## 2) خريطة الوحدات والترابط (النظام يعمل ككتلة واحدة)

| الوحدة | موجّه tRPC (مؤكد) | جداول رئيسية (مؤكدة من الكود) | كيف ترتبط بالوحدات الأخرى |
|---|---|---|---|
| CRM | `organizations`, `promotions`, `reports` | `customer_profiles`, `customer_care_cases`, `customer_care_tasks`, `customer_care_satisfaction` | عميل ← حالة خدمة ← مهام ← رضا ← حملات `promotions` |
| ERP | `erp`, `procurement`, `anti-fraud` | `procurement`, `invoices/payments` (عبر erp) | مشتريات ← مخزون ← فواتير ← محاسبة ← تقارير |
| HR | `operations`, `reports` | `employee_profiles`, `employee_attendance`, `employee_leave_requests`, `approved_leave` | موظف ← حضور ← إجازات ← رواتب (في ERP) |
| POS | `operations` (Operations Hub) | `catalog_items`, `catalog_sync_queue` | بيع ← خصم مخزون ← فاتورة ← محاسبة |
| Healthcare | `egypt-healthcare`, `insurance`, `nda`, `policyKnowledge` | `healthcare_encounters`, `healthcare_clinical_orders`, `healthcare_admissions`, `e_prescriptions` | وصفة ← صيدلية/مخزون ← مطالبة تأمين |
| AI | `assistant`, `ai-insights`, `ai-governance`, `kpi` + **`ai-review` (جديد)** | `ai_review_runs`, `ai_review_findings`, `ai_review_recommendations` | يقرأ كل الجداول أعلاه وينتج تقارير وتوصيات |
| Gov | `system`, `notifications`, `backup`, `regional`, `secondaryModules` | `users`, `organization_memberships`, `internal_credentials`, `internal_sessions`, `scheduled_jobs` | **الربط الجديد:** مستخدم ← `rbac_user_roles` ← صلاحيات تتحكم بكل إجراء |

**تدفقات الترابط الحرجة:**
1. **بيع POS:** عملية بيع → إنقاص `catalog_items` → إنشاء فاتورة → ERP → تقرير مالي.
2. **وصفة طبية:** `e_prescriptions` → تنفيذ صيدلي (pharmacy) → مخزون → مطالبة `insurance` (eligibility/claims).
3. **عميل:** `customer_profiles` ← `customer_care_cases` ← `customer_care_tasks` ← رضا ← حملة `promotions`.
4. **موظف:** `employee_profiles` ← `employee_attendance` ← `employee_leave_requests` ← اعتماد ← راتب.
5. **مستخدم وصلاحية:** أي إجراء يمر عبر `assertSessionScope` (نطاق المنظمة) + `assertPermission` (الصلاحية) — من المستودع الحالي `kpi.ts` + الجديد `rbac.ts`.

---

## 3) مصفوفة الصلاحيات (RBAC) — الأدوار العشرة

الاختصارات: V=عرض، C=إنشاء، U=تعديل، D=حذف، A=اعتماد، E=تصدير، ●=الكل، –=لا صلاحية

| الدور | CRM | ERP | HR | POS | المخزون | الصيدلية | التأمين | التقارير | AI | الإدارة |
|---|---|---|---|---|---|---|---|---|---|---|
| super_admin | ● | ● | ● | ● | ● | ● | ● | ● | ● | ● |
| org_admin | VCUA E | VCUA E | VCUA E | VCUA E | VCUA E | VCUA E | VCU E | VCUAE | VCU | VCU |
| manager | VCU | V A | V | VCU | V | V | V | V E | V | – |
| accountant | V | VCU E | – | V | V | – | V | V E | – | – |
| pharmacist | – | – | – | VC | VU | VCU | – | – | – | – |
| cashier | V | – | – | VCU | V | – | – | – | – | – |
| hr_officer | – | – | VCUA | – | – | – | – | V | – | – |
| doctor | – | – | – | V | – | V | V | – | – | – |
| nurse | – | – | – | – | – | – | – | – | – | – |
| auditor | V | V | V | V | V | V | V | V E | V | – |

الأدوار قابلة للتعديل بالكامل من لوحة الأدمن (`rbac.createRole/updateRole`)، وأدوار النظام محمية من الحذف.

---

## 4) دليل الأدمن: إنشاء المستخدمين وتحديد الصلاحيات

1. سجّل الدخول بحساب الأدمن (`admin`) من `/login` — مسار `auth.internalLogin`.
2. تأكد من تثبيت الحزمة ثم شغّل البذرة: `node scripts/seed-rbac-and-roles.mjs` (تنشئ الصلاحيات + الأدوار + تربط مديري المنشأة بدور org_admin).
3. أنشئ المستخدمين من واجهة إدارة المنظمة أو عبر `organizations` router (نمط `internal_credentials` + `users` الموجود).
4. اربط المستخدم بدور: `rbac.assignUserRole {organizationId, userId, roleId}`.
5. اسحب الدور وقت الحاجة: `rbac.revokeUserRole {userId, roleId}`.
6. افحص صلاحيات أي مستخدم: `rbac.listUserRoles {organizationId, userId}`.
7. أنشئ دورًا مخصصًا: `rbac.createRole {role:{code,nameAr,nameEn,permissionCodes:[...]}}` — رموز الصلاحيات من `rbac.listPermissions`.
8. تحقق من منظور المستخدم: `rbac.myPermissions` (يستعملها الواجهة لتمكين/تعطيل الأزرار تلقائيًا).

**نموذج CURL سريع (بعد تسجيل الدخول):**
```bash
curl -X POST "http://localhost:3000/api/trpc/rbac.myPermissions?batch=1" \
  -H 'Content-Type: application/json' -b cookies.txt -c cookies.txt \
  --data '{"0":{"json":null}}'
```

---

## 5) المراجعة الآلية بالذكاء الاصطناعي (AI Auto Review)

**الزناد:** يدوي من لوحة الأدمن، أو يومي 00:05 عبر `scheduled_jobs` (المجدول الموجود في القاعدة).

**ماذا تفعل كل جولة (`ai-review.runAutoReview`):**
1. تفحص جدولًا من كل وحدة حقيقية (`catalog_items`, `customer_profiles`, `employee_profiles`, `employee_attendance`, `employee_leave_requests`, `organization_memberships`, `users`).
2. تحسب درجة 0–100 لكل مؤشر (خط الأساس 10 سجلات = 100%) ودرجة كلية.
3. تكتب تقرير Markdown بالعربية: `# تقرير المراجعة الآلية — MEDORA (التاريخ)` مع جدول الوحدات.
4. تحفظ النتائج في `ai_review_findings` بخطورة low/medium/high + دليل (`evidence`).
5. تولّد توصيات تلقائيًا في `ai_review_recommendations` (p0..p3) تُغلق من الأدمن:
   - `ai-review.latestReview` آخر جولة، `ai-review.listReviews` السجل،
   - `ai-review.resolveRecommendation {id, status:"done"|"dismissed"}`.

**التوسعة:** أضف أسطرًا إلى `MODULE_CHECKS` في `ai-review.ts` لأي جدول جديد (فحص COUNT آمن بلا مدخلات مستخدم).

---

## 6) تحصين الأمان — قائمة تحقق مطبقة/مطلوبة

**مؤكد من الكود الحالي:**
- تجزئة `scrypt` بمعاملات قوية متكاملة في `server/domain/internal-auth.ts` (N=16384, r=8, p=1) مع salt عشوائي.
- قفل الحساب بعد محاولات فاشلة (`failedAttempts`, `lockedUntil`) وجلسات مجزأة (`internal_sessions` مع sessionHash).
- تحقق `assertSessionScope` على كل إجراء (نطاق المنظمة).
- تحقق صارم بالمدخلات عبر zod على كل إجراء tRPC.
- سجل تدقيق موقّع لأنظمة المصادقة والنطاقات (eventType للاعتماديات).

**يضاف مع الحزمة:**
- `assertPermission` (rbac) على كل إجراء حساس — FORBIDDEN فوري.
- أدوار نظام غير قابلة للحذف/التعديل (`isSystem`).
- سحب صلاحية = أثر فوري (لا جلسات قديمة تحملها — تُقرأ من القاعدة كل طلب).

**مطلوب عند النشر (تحقق خارجي):**
- TLS 1.2+ في كل الاتصالات؛ رؤوس أمان (CSP, X-Frame-Options, HSTS) عبر الطبقة السحابية أو reverse proxy.
- ملفات تعريف الارتباط: HttpOnly + Secure + SameSite=Lax (أو Strict).
- لا مفاتيح/أسرار في الكود — فقط env (النمط الحالي `getForgeConfig` يشترط env).
- **لا PHI في Google Sheets:** شيتات القراءة المرجعية فقط، والتصدير مجهول الهوية (HIPAA Safe Harbor) — لا BAA لحساب مجاني.
- السعودية: PDPL تصنف البيانات الصحية حساسة، NPHIES إلزامي للربط التأميني (مراجعة قانونية).
- نسخ احتياطي مشفّر عبر `backup` router الموجود + اختبار استرجاع شهري.

---

## 7) خطوات الدمج والتحقق (دقيقة)

```bash
# 1) السكيمات الجديدة
cp drizzle/medora-upgrade-schema.ts drizzle/
# أضف: import "./medora-upgrade-schema";  في أعلى drizzle/schema.ts (أو تصدير الجداول منه)
npm run db:push        # أو drizzle-kit generate && drizzle-kit migrate

# 2) الموجّهات الجديدة
cp server/routers/rbac.ts server/routers/ai-review.ts server/routers/
# سجّلهما في server/routers.ts: رbac: rbacRouter, aiReview: aiReviewRouter

# 3) البذرة
DATABASE_URL="mysql://medora:medora@127.0.0.1:3306/medora" node scripts/seed-rbac-and-roles.mjs
# متوقع: permissions=73 roles=10×عدد المنشآت user_roles=عدد المدراء

# 4) اختبار RBAC
#     - rbac.myPermissions يعيد رموز صلاحيات الأدمن (يجب أن تتضمن "admin.roles.create")
#     - أنشئ مستخدمًا جديدًا بدور cashier وتحقق أن myPermissions لديه pos فقط

# 5) اختبار AI Review
curl -X POST "http://localhost:3000/api/trpc/aiReview.runAutoReview?batch=1" \
  -H 'Content-Type: application/json' --data '{"0":{"json":{"organizationId":1,"trigger":"manual"}}}'
# متوقع: درجة كلية + تقرير + توصيات؛ ثم aiReview.latestReview لإعادة قراءته

# 6) الجدولة اليومية
# أضف مهمة في scheduled_jobs: cron "5 0 * * *" → aiReview.runAutoReview trigger=scheduled

# 7) التحقق النهائي من القاعدة
SELECT COUNT(*) FROM rbac_permissions;               -- ≥ 73
SELECT COUNT(*) FROM rbac_roles;                     -- 10 × عدد المنشآت
SELECT code, name_ar FROM rbac_roles WHERE is_system=1 LIMIT 10;
SELECT status, score_overall FROM ai_review_runs ORDER BY id DESC LIMIT 3;
```

---

## 8) حالة التحقق — بصراحة

| المكوّن | الحالة عند كتابة هذه الوثيقة |
|---|---|
| جداول RBAC/AI (سكيمات) | ✅ مكتوبة بنمط drizzle mysqlTable المتوافق مع v0.45 — **غير مُرحّل بعد** (يتطلب تنفيذ الخطوة 1) |
| موجّه rbac / ai-review | ✅ كود كامل المنطق — **غير مُركّب بعد** (يتطلب مطابقة 3 أسطر استيراد مع نمط kpi.ts ثم الخطوة 2) |
| البذرة | ✅ كود idempotent — **غير منفذة بعد** |
| الاختبار الحي (تسجيل دخول، لقطات شاشة) | ⏳ يُنفذ بعد الدمج (الخطوات 4–6) — بيئة التشغيل في هذه الجلسة لم تسمح بتشغيل المتصفح |

**الوعد الصريح:** لا يُدّعى هنا أن أي مكوّن "يعمل" قبل أن يجتاز الخطوات 4–6 أعلاه وينتج الأدلة (استجابة tRPC + صفوف في القاعدة + لقطة شاشة).

---

## 9) مراجع الجلسة

- مستودع MEDORA: https://github.com/0SSAM/MEDORA-Health-Care-Eco-System
- قاعدة الأدوية المصرية (CC0-1.0): https://github.com/karem505/egyptian-drug-database
- Issues تطوير GP MAX (من الجلسات السابقة): #39، #40، #41، #42، #43، #44، #45، #46
- حدود Google Sheets API: https://developers.google.com/workspace/sheets/api/limits
- HIPAA/GCP: https://cloud.google.com/security/compliance/hipaa-compliance
