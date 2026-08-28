# ميدورا — MEDORA 🏥

**نظام رعاية صحية متكامل — مجاني بالكامل ومفتوح المصدر**

| | |
|---|---|
| ![License](https://img.shields.io/badge/license-MIT-green.svg) | ![Open Source](https://img.shields.io/badge/open%20source-100%25-brightgreen.svg) |
| ![Free Forever](https://img.shields.io/badge/free-forever-blue.svg) | ![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg) |
| ![Made in Egypt](https://img.shields.io/badge/made%20in-Egypt-red.svg) | ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6.svg) |

**Integrated Healthcare Ecosystem — CRM · ERP · HR · POS · Pharmacy · Insurance · Delivery · AI**

> ميدورا منصة متكاملة لإدارة المنشآت الصحية: إدارة العملاء، النظام المحاسبي، الموارد البشرية، نقاط البيع، الصيدلية وقاعدة الأدوية المصرية، التعاقدات الطبية والتأمين، خدمة التوصيل، والمراجعة الآلية بالذكاء الاصطناعي — كل ذلك **مجاني بالكامل ومفتوح المصدر (MIT)** بلا أي اشتراكات أو رسوم.

---

## 📑 فهرس المحتويات — Contents

1. [الرؤية — Vision](#vision)
2. [الوحدات — Modules](#modules)
3. [المميزات الذكية — AI & Automation](#ai)
4. [الصلاحيات — RBAC](#rbac)
5. [البدء السريع — Quick Start](#quick-start)
6. [التثبيت عبر Docker — Docker](#docker)
7. [قاعدة الأدوية المصرية — Egyptian Drug DB](#drugs)
8. [الأمان والنسخ الاحتياطي — Security & Backup](#security)
9. [خارطة الطريق — Roadmap](#roadmap)
10. [المساهمة — Contributing](#contributing)
11. [الترخيص — License](#license)

---

## <a name="vision"></a> 1️⃣ الرؤية — Vision

ميدورا وُلدت لتكون **البديل الحر** لأنظمة إدارة المنشآت الصحية التجارية:

- 🆓 **مجانية 100% للأبد** — لا خطط مدفوعة، لا حدود، لا ميزات محجوبة.
- 🌍 **مفتوحة المصدر بالكامل** — MIT License: استخدم، عدّل، وزّع، حتى تجاريًا.
- 🇪🇬 **مبنية لسوق مصر أولًا** — قاعدة الأدوية المصرية، التعاقدات الطبية، التأمين، والتوصيل محليًا.
- 🔗 **وحدة واحدة متصلة** — CRM وERP وHR وPOS تعمل على قاعدة بيانات واحدة ومنطق واحد.

---

## <a name="modules"></a> 2️⃣ الوحدات — Modules

| الوحدة | الوصف | أبرز الجداول |
|---|---|---|
| **CRM** — إدارة العملاء | ملفات العملاء، حالات العناية، رضا العملاء، العروض | `customer_profiles`, `customer_care_cases` |
| **ERP** — النظام المحاسبي | المبيعات، المشتريات، المرتجعات، الفواتير المعلّقة، التحصيل | `sales`, `purchase_orders`, `held_invoices` |
| **HR** — الموارد البشرية | الموظفون، الحضور، الإجازات، الموافقات | `employee_profiles`, `employee_attendance`, `employee_leave_requests` |
| **POS** — نقطة البيع | كتالوج المنتجات، المخزون، الدُفعات (FEFO)، نقاط البيع | `catalog_items`, `products`, `inventory`, `inventory_batches` |
| **Pharmacy** — الصيدلية | قاعدة الأدوية المصرية (25,094 دواء)، الوصفات الإلكترونية، صرف الأدوية | `e_prescriptions`, `catalog_items` |
| **Insurance** — التعاقدات والتأمين | عقود الجهات الممولة، الاستحقاق، التفويض المسبق، المطالبات، التحصيل | `insurance_payer_contracts`, `insurance_claims`, `insurance_preauthorizations` |
| **Delivery** — التوصيل 🆕 | المناطق والأسعار، السائقون، الطلبات، التتبع اللحظي، الحالات الكاملة | `delivery_zones`, `delivery_drivers`, `delivery_orders`, `delivery_tracking_events` |
| **AI** — الذكاء الاصطناعي 🆕 | مراجعة آلية يومية، تقييم 0–100 لكل وحدة، توصيات P0–P3، تقارير عربية | `ai_review_runs`, `ai_review_recommendations` |
| **RBAC** — الصلاحيات 🆕 | أدوار وصلاحيات لكل مستخدم، إدارة كاملة من الأدمن | `rbac_roles`, `rbac_permissions`, `rbac_user_roles` |

---

## <a name="ai"></a> 3️⃣ المميزات الذكية — AI & Automation

- 🤖 **مراجعة آلية شاملة**: تدقيق يومي لكل الوحدات (11 جدولًا مرجعيًا) وإنتاج تقرير عربي بتقييم 0–100.
- 📊 **تقييم تلقائي**: درجات لكل وحدة (CRM، ERP، HR، POS، الصيدلية، التأمين…) مع مقارنة عبر الزمن.
- 🎯 **توصيات ذات أولوية**: توصيات P0 (حرجة) حتى P3 (تحسينية) تُحفظ في قاعدة البيانات وتُحل بالكيان المسؤول.
- 📅 **جدولة تلقائية**: مهمة يومية مجدولة (cron) عبر `scheduled_jobs`.

---

## <a name="rbac"></a> 4️⃣ الصلاحيات — RBAC

مصفوفة صلاحيات كاملة: **73 صلاحية × 10 أدوار**، يديرها الأدمن من لوحة التحكم:

| الدور | CRM | ERP | HR | POS | المخزون | الصيدلية | التأمين | التقارير | AI |
|---|---|---|---|---|---|---|---|---|---|
| `super_admin` | ● | ● | ● | ● | ● | ● | ● | ● | ● |
| `org_admin` | V C U A E | V C U A E | V C U A E | V C U A E | V C U A E | V C U A E | V C U E | V C U A E | V C U |
| `manager` | V C U | V A | V | V C U | V | V | V | V E | – |
| `auditor` | V | V | V | V | V | V | V | V E | V |

> V=عرض · C=إنشاء · U=تحديث · A=موافقة · E=تصدير. إدارة المستخدمين والأدوار: من حساب الأدمن فقط عبر مسار `/admin`.

---

## <a name="quick-start"></a> 5️⃣ البدء السريع — Quick Start

```bash
# 1) المتطلبات: Node.js 20+، MySQL/MariaDB 10.6+
git clone https://github.com/0SSAM/MEDORA-Health-Care-Eco-System.git
cd MEDORA-Health-Care-Eco-System
cp .env.example .env        # عدّل DATABASE_URL وكلمات السر

# 2) التثبيت
npm install

# 3) إنشاء الجداول وزرع البيانات
npm run db:push
DATABASE_URL="mysql://user:pass@127.0.0.1:3306/medora" node scripts/seed-delivery-zones.mjs
DATABASE_URL="mysql://user:pass@127.0.0.1:3306/medora" node scripts/seed-rbac-and-roles.mjs

# 4) إنشاء حساب الأدمن + استيراد قاعدة الأدوية المصرية
DATABASE_URL="mysql://user:pass@127.0.0.1:3306/medora" \
  node scripts/provision-medora.mjs --admin admin:admin --drugs data/egyptian-drugs.csv

# 5) التشغيل
npm run dev
# افتح: http://localhost:3000  — تسجيل الدخول: admin / admin (غيّرها فورًا)
```

---

## <a name="docker"></a> 6️⃣ التثبيت عبر Docker

```bash
docker compose up -d        # يبني الصورة ويشغّل قاعدة البيانات + النظام
# أو صورة واحدة:
docker build -t medora .
docker run -p 3000:3000 --env-file .env medora
```

المثبّتات الجاهزة: [`install.sh`](install.sh) (Linux/macOS) و [`install.bat`](install.bat) (Windows) — تنزّل المتطلبات وتشغّل النظام تلقائيًا.

---

## <a name="drugs"></a> 7️⃣ قاعدة الأدوية المصرية — Egyptian Drug DB

- 💊 **25,094 دواءً** مسجّلًا في السوق المصري بصيغة CSV داخل المستودع: [`data/egyptian-drugs.csv`](data/egyptian-drugs.csv)
- المصدر: مشروع [egyptian-drug-database](https://github.com/karem505/egyptian-drug-database) — رخصة **CC0-1.0** (ملكية عامة).
- الاستيراد: عبر `scripts/provision-medora.mjs` (انظر Quick Start) أو أي أداة CSV.
- التفاصيل الكاملة: [data/README.md](data/README.md)

---

## <a name="security"></a> 8️⃣ الأمان والنسخ الاحتياطي — Security & Backup

- 🔐 **كلمات المرور**: scrypt (N=16384, r=8, p=1) + قفل بعد 5 محاولات فاشلة + سياسة قوة (≥12 حرفًا).
- 👤 **إدارة الحساب**: تغيير اسم المستخدم وكلمة المرور **من حساب الأدمن فقط** مع إبطال كل الجلسات القديمة.
- 🛡️ **RBAC**: كل إجراء محميّ بفحص صلاحية؛ كل طلب عبر tRPC موثّق بـ Zod.
- 💾 **النسخ الاحتياطي**: سياسات وجداول زمنية، تصدير مشفّر، استعادة شهرية موثّقة (انظر تقرير التدقيق).
- 📋 تقارير التدقيق: [التعاقدات الطبية](docs/MEDORA-CONTRACT-DISPENSING-AUDIT-2026-08-28.md) · [النسخ الاحتياطي والمزامنة](docs/MEDORA-BACKUP-SYNC-AUDIT-2026-08-28.md) · [حزمة الترقية](docs/MEDORA-UPGRADE-BUNDLE-2026-08-28.md)

---

## <a name="roadmap"></a> 9️⃣ خارطة الطريق — Roadmap

- [x] CRM / ERP / HR / POS / Pharmacy / Insurance
- [x] خدمة التوصيل الكاملة (مناطق، سائقون، طلبات، تتبع)
- [x] الصلاحيات والأدوار (RBAC) + إدارة حساب الأدمن
- [x] المراجعة الآلية بالذكاء الاصطناعي
- [x] قاعدة الأدوية المصرية + الترخيص المفتوح MIT + المثبّتات
- [ ] **GP MAX** — وحدة تدقيق النمو التسويقي (مستويات L0–L7، 140+ نقطة فحص، حاسبة KPI، خطة 30 يومًا)
- [ ] مزامنة دون اتصال (offline-first) مع حل تعارضات
- [ ] تطبيقات جوال (Android/iOS) وتثبيت سطح مكتب

---

## <a name="contributing"></a> 🔟 المساهمة — Contributing

المساهمات موضع ترحيب دائمًا — هذا مشروع مجتمعي مفتوح:

- راجع [CONTRIBUTING.md](CONTRIBUTING.md) و [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- أبلغ عن الأخطاء عبر [Issue](https://github.com/0SSAM/MEDORA-Health-Care-Eco-System/issues/new/choose)
- الأمان: [SECURITY.md](SECURITY.md) — أبلغ عن الثغرات بشكل خاص
- **القاعدة الذهبية**: العمل دائمًا على فرع `main` مباشرة (لا فروع جانبية) بطلبات PR نظيفة.

---

## <a name="license"></a> 1️⃣1️⃣ الترخيص — License

مشروع **مفتوح المصدر بالكامل** بموجب **رخصة MIT** — انظر [LICENSE](LICENSE).

> ✅ **مجاني للأبد — لكل أنواع الاستخدام:** شخصي، تجاري، حكومي، تعليمي.
> الالتزام الكامل مكتوب في [docs/OPEN-SOURCE-COMMITMENT-2026-08-28.md](docs/OPEN-SOURCE-COMMITMENT-2026-08-28.md)

---

© 2026 MEDORA Contributors — Made with ❤️ for Egypt and the world 🌍
