# 🏥 MEDORA — ميدورا

**Integrated Healthcare Ecosystem — نظام رعاية صحية متكامل**

> **100% Free & Open Source (MIT) — مجاني بالكامل ومفتوح المصدر**

| | | | |
|---|---|---|---|
| ![License](https://img.shields.io/badge/license-MIT-green) | ![Free Forever](https://img.shields.io/badge/free-forever-blue) | ![Open Source](https://img.shields.io/badge/open%20source-✓-brightgreen) | ![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen) |
| ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6) | ![React](https://img.shields.io/badge/React-19-61dafb) | ![tRPC](https://img.shields.io/badge/tRPC-11-2596be) | ![Drizzle](https://img.shields.io/badge/Drizzle-ORM-c5f74f) |

MEDORA is a multi-module healthcare operations platform: **CRM, ERP, HR, POS, Pharmacy (Egyptian drug database), Insurance & medical contracts, Delivery, AI-driven review, and full RBAC** — all connected on a single database, single login, single logic.

ميدورا منصة متكاملة لإدارة المنشآت الصحية: **إدارة العملاء، النظام المحاسبي، الموارد البشرية، نقاط البيع، الصيدلية وقاعدة الأدوية المصرية، التعاقدات الطبية والتأمين، خدمة التوصيل، المراجعة الآلية بالذكاء الاصطناعي، والصلاحيات الكاملة** — كلها متصلة على قاعدة بيانات واحدة ومنطق واحد.

---

## 📑 Table of Contents — فهرس المحتويات

- [English](#english)
  - [1. Features & Modules](#features)
  - [2. Prerequisites](#prerequisites)
  - [3. Installation (Manual)](#installation)
  - [4. Installation (Docker)](#docker)
  - [5. Running & First Login](#running)
  - [6. Available Scripts](#scripts)
  - [7. Project Structure](#structure)
  - [8. Usage Guide](#usage)
  - [9. Security & Backup](#security)
  - [10. Contributing](#contributing)
  - [11. License](#license)
- [العربية](#arabic)
  - [١. المميزات والوحدات](#features-ar)
  - [٢. المتطلبات](#prerequisites-ar)
  - [٣. التثبيت اليدوي](#installation-ar)
  - [٤. التثبيت عبر Docker](#docker-ar)
  - [٥. التشغيل وأول تسجيل دخول](#running-ar)
  - [٦. أوامر المشروع](#scripts-ar)
  - [٧. بنية المشروع](#structure-ar)
  - [٨. دليل الاستخدام](#usage-ar)
  - [٩. الأمان والنسخ الاحتياطي](#security-ar)
  - [١٠. المساهمة](#contributing-ar)
  - [١١. الترخيص](#license-ar)

---

<a name="english"></a>
# English

<a name="features"></a>
## 1. Features & Modules

| Module | Description |
|---|---|
| **CRM** | Customer profiles, care cases, satisfaction tracking, promotions |
| **ERP** | Sales, purchases, returns, held invoices, production & reorder |
| **HR** | Employee profiles, attendance, leave requests & approvals |
| **POS** | Catalog, products, inventory with FEFO batches, sale points |
| **Pharmacy** | Egyptian drug database (25,094 drugs), e-prescriptions |
| **Insurance & Medical Contracts** | Payer contracts, eligibility, pre-authorizations, claims, remittances |
| **Delivery** | Zones & pricing, drivers, orders, live tracking state machine |
| **AI Review** | Daily automated review: 0–100 scores per module, Arabic reports, P0–P3 recommendations |
| **RBAC** | 73 permissions × 10 roles, managed by the admin account |

All modules share one MySQL/MariaDB schema (`drizzle/schema.ts`) and one tRPC API (`server/routers.ts`).

<a name="prerequisites"></a>
## 2. Prerequisites

| Tool | Version |
|---|---|
| **Node.js** | 22+ (required by `install.sh`) |
| **npm** | 10+ |
| **MySQL / MariaDB** | 10.6+ (or use Docker — MariaDB 10.11 image) |

No paid services required. Optional integrations: S3/Forge for encrypted backups, external OAuth provider.

<a name="installation"></a>
## 3. Installation (Manual)

```bash
# 1) Clone (single default branch: main)
git clone https://github.com/0SSAM/MEDORA-Health-Care-Eco-System.git
cd MEDORA-Health-Care-Eco-System

# 2) Create environment file
cp .env.example .env
#    Edit .env — REQUIRED: DATABASE_URL
#    DATABASE_URL=mysql://user:password@127.0.0.1:3306/medora

# 3) Install dependencies (reproducible)
npm ci --no-audit --no-fund        # or: npm install

# 4) Create the database
#    mysql -u root -p -e "CREATE DATABASE medora CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 5) Run migrations (drizzle-kit generate + migrate)
npm run db:push

# 6) Seed delivery zones & pricing (8 Egyptian zones)
node scripts/seed-delivery-zones.mjs

# 7) Seed RBAC permissions & roles (73 permissions × 10 roles)
node scripts/seed-rbac-and-roles.mjs

# 8) Create admin account + import the Egyptian drug database (25,094 drugs)
node scripts/provision-medora.mjs --admin admin:admin --drugs data/egyptian-drugs.csv
#    (omit --drugs to skip the import)

# 9) Build & run
npm run build
npm run dev        # or: npm start  (production)
```

### One-command installer

| OS | Command |
|---|---|
| Linux / macOS | `bash install.sh` |
| Windows | `install.bat` |

The installers automate steps 2–8 (env, deps, migrations, seeds, admin + drugs, build).

<a name="docker"></a>
## 4. Installation (Docker)

```bash
docker compose up -d
# Starts: mariadb:10.11 (healthchecked) + app (built from Dockerfile)
# App: http://localhost:3000

# After the containers are up, run the seeds once:
docker compose exec app node scripts/seed-delivery-zones.mjs
docker compose exec app node scripts/seed-rbac-and-roles.mjs
docker compose exec app node scripts/provision-medora.mjs --admin admin:admin --drugs data/egyptian-drugs.csv
```

Single image alternative:

```bash
docker build -t medora .
docker run -p 3000:3000 --env-file .env medora
```

`docker-compose.yml` uses `DATABASE_URL=mysql://medora:medora@db:3306/medora`, exposes port `3000`, and keeps data in the `medora_db` volume.

<a name="running"></a>
## 5. Running & First Login

1. Start the server: `npm run dev` → open **http://localhost:3000**
2. Log in with the seeded admin account: **`admin` / `admin`**
3. **Change the password immediately** — from the admin account only:
   - Username & password can be changed **exclusively by the admin account** (via the admin panel). Sessions are revoked on change.

> ⚠️ Security: use the seeded credentials only on a private/local setup, then rotate.

<a name="scripts"></a>
## 6. Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Development server (`tsx watch server/_core/index.ts`) |
| `npm run build` | Vite (client) + esbuild (server) production build → `dist/` |
| `npm start` | Production server (`node dist/index.js`) |
| `npm run check` | TypeScript type-check (`tsc --noEmit`) |
| `npm run test` | Unit tests (`vitest run`) |
| `npm run e2e` | Playwright end-to-end tests |
| `npm run db:push` | Generate + migrate Drizzle schema |
| `npm run format` | Prettier formatting |

<a name="structure"></a>
## 7. Project Structure

```
MEDORA-Health-Care-Eco-System/
├── server/
│   ├── _core/            # Entry (index.ts), tRPC context, auth
│   ├── domain/           # internal-auth (scrypt, sessions, lockout)
│   └── routers/          # tRPC routers: delivery, rbac, ai-review,
│                         #   adminAccount, erp, insurance, backup, …
├── client/src/
│   ├── pages/            # Login, Welcome, Delivery, AdminConsole, …
│   └── components/       # Workspace UI components
├── drizzle/              # Drizzle schema + extra module schemas
├── scripts/              # Seeds & provisioning (zones, RBAC, admin, drugs)
├── data/                 # egyptian-drugs.csv (25,094 records, CC0-1.0)
├── docs/                 # Audit reports, guides (AR/EN), commitments
├── install.sh / install.bat / Dockerfile / docker-compose.yml
└── package.json          # license: MIT, scripts, dependencies
```

<a name="usage"></a>
## 8. Usage Guide

- **Login** — `admin` / `admin` at `/login` (change password from the admin account only).
- **POS & Sales** — `/pos`, `/sales` with inventory FEFO batches and held invoices.
- **Operations / HR** — employee attendance, leave requests and approvals.
- **Delivery** — `/delivery`: manage zones, drivers, create orders (auto-assigned to the first free driver), track statuses (`created → assigned → picked_up → in_transit → delivered`, plus `cancelled / failed`).
- **Admin console** — `/admin`: manage users, roles, permissions (RBAC), and the admin account credentials.
- **AI Review** — runs automatically on a daily schedule; produces per-module scores (0–100) and P0–P3 recommendations with Arabic-language reports (see `server/routers/ai-review.ts`).
- **Medical contracts & insurance** — payer contracts, eligibility, pre-authorizations, claims, remittances (see `docs/MEDORA-CONTRACT-DISPENSING-AUDIT-2026-08-28.md`).

Full documentation (user manuals, admin/owner guide, product description — Arabic & English) lives in [`docs/`](docs/).

<a name="security"></a>
## 9. Security & Backup

- **Passwords**: scrypt (N=16384, r=8, p=1), 5-attempt lockout, ≥12-char policy (`server/domain/internal-auth.ts`).
- **Admin account**: username/password changeable **only by the admin account**; all existing sessions are revoked on change (`server/routers/adminAccount.ts`).
- **Authorisation**: every tRPC action is guarded by RBAC permission checks + Zod input validation.
- **Backups**: encrypted, policy-based backup with optional S3/Forge presigned URLs (`server/routers/backup.ts`); monthly restore verification documented in `docs/MEDORA-BACKUP-SYNC-AUDIT-2026-08-28.md`.
- **Audit**: contract-dispensing audit report at `docs/MEDORA-CONTRACT-DISPENSING-AUDIT-2026-08-28.md`.

<a name="contributing"></a>
## 10. Contributing

Contributions are always welcome — this is a community open-source project:

1. Read [CONTRIBUTING.md](CONTRIBUTING.md) and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
2. Report bugs / request features via the [issue templates](https://github.com/0SSAM/MEDORA-Health-Care-Eco-System/issues/new/choose).
3. Security vulnerabilities: report privately per [SECURITY.md](SECURITY.md).
4. **Golden rule**: project works directly on a single `main` branch (no side branches) with clean, focused PRs.

Before opening a PR, run `npm run check` and `npm run test`.

<a name="license"></a>
## 11. License

MIT License — free forever, for any use (personal, commercial, governmental, educational). See [LICENSE](LICENSE) and the [Open-Source Commitment](docs/OPEN-SOURCE-COMMITMENT-2026-08-28.md).

---
---

<a name="arabic"></a>
<div dir="rtl">

# 🇪🇬 ميدورا — MEDORA

**نظام رعاية صحية متكامل — مجاني بالكامل ومفتوح المصدر (MIT)**

<a name="features-ar"></a>
## ١. المميزات والوحدات

| الوحدة | الوصف |
|---|---|
| **CRM — إدارة العملاء** | ملفات العملاء، حالات العناية، رضا العملاء، العروض |
| **ERP — النظام المحاسبي** | المبيعات، المشتريات، المرتجعات، الفواتير المعلّقة، الإنتاج وإعادة الطلب |
| **HR — الموارد البشرية** | ملفات الموظفين، الحضور، طلبات الإجازات والموافقات |
| **POS — نقطة البيع** | الكتالوج، المنتجات، المخزون بدُفعات FEFO، نقاط البيع |
| **Pharmacy — الصيدلية** | قاعدة الأدوية المصرية (25,094 دواءً)، الوصفات الإلكترونية |
| **Insurance — التعاقدات والتأمين** | عقود الجهات الممولة، الاستحقاق، التفويض المسبق، المطالبات، التحصيل |
| **Delivery — التوصيل** | المناطق والأسعار، السائقون، الطلبات، التتبع اللحظي بآلة حالات كاملة |
| **AI Review — المراجعة الآلية** | مراجعة يومية: درجات 0–100 لكل وحدة، تقارير عربية، توصيات P0–P3 |
| **RBAC — الصلاحيات** | 73 صلاحية × 10 أدوار، تُدار من حساب الأدمن |

كل الوحدات تشترك في مخطط قاعدة بيانات واحد (`drizzle/schema.ts`) وواجهة tRPC واحدة (`server/routers.ts`).

<a name="prerequisites-ar"></a>
## ٢. المتطلبات

| الأداة | الإصدار |
|---|---|
| **Node.js** | 22 أو أحدث (مطلوب في `install.sh`) |
| **npm** | 10 أو أحدث |
| **MySQL / MariaDB** | 10.6 أو أحدث (أو استخدم Docker — صورة MariaDB 10.11) |

لا توجد أي خدمات مدفوعة. تكاملات اختيارية: S3/Forge للنسخ الاحتياطي المشفّر، ومزوّد OAuth خارجي.

<a name="installation-ar"></a>
## ٣. التثبيت اليدوي

```bash
# ١) الاستنساخ (الفرع الافتراضي الوحيد: main)
git clone https://github.com/0SSAM/MEDORA-Health-Care-Eco-System.git
cd MEDORA-Health-Care-Eco-System

# ٢) إنشاء ملف البيئة
cp .env.example .env
#    عدّل .env — إلزامي: DATABASE_URL
#    DATABASE_URL=mysql://user:password@127.0.0.1:3306/medora

# ٣) تثبيت الاعتماديات (قابل للتكرار)
npm ci --no-audit --no-fund        # أو: npm install

# ٤) إنشاء قاعدة البيانات
#    mysql -u root -p -e "CREATE DATABASE medora CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# ٥) تشغيل الترحيلات (drizzle-kit generate + migrate)
npm run db:push

# ٦) زرع مناطق التوصيل وأسعارها (8 مناطق مصرية)
node scripts/seed-delivery-zones.mjs

# ٧) زرع الصلاحيات والأدوار (73 صلاحية × 10 أدوار)
node scripts/seed-rbac-and-roles.mjs

# ٨) إنشاء حساب الأدمن + استيراد قاعدة الأدوية المصرية (25,094 دواءً)
node scripts/provision-medora.mjs --admin admin:admin --drugs data/egyptian-drugs.csv
#    (احذف --drugs لتخطي الاستيراد)

# ٩) البناء والتشغيل
npm run build
npm run dev        # أو: npm start  (إنتاج)
```

### مثبّت بخطوة واحدة

| نظام التشغيل | الأمر |
|---|---|
| لينكس / ماك | `bash install.sh` |
| ويندوز | `install.bat` |

المثبّتات تنفّذ تلقائيًا الخطوات ٢–٨ (البيئة، الاعتماديات، الترحيلات، الزراعة، الأدمن + الأدوية، البناء).

<a name="docker-ar"></a>
## ٤. التثبيت عبر Docker

```bash
docker compose up -d
# يشغّل: mariadb:10.11 (مع فحص صحة) + التطبيق (من Dockerfile)
# التطبيق: http://localhost:3000

# بعد إقلاع الحاويات، شغّل الزراعة مرة واحدة:
docker compose exec app node scripts/seed-delivery-zones.mjs
docker compose exec app node scripts/seed-rbac-and-roles.mjs
docker compose exec app node scripts/provision-medora.mjs --admin admin:admin --drugs data/egyptian-drugs.csv
```

بديل بصورة واحدة:

```bash
docker build -t medora .
docker run -p 3000:3000 --env-file .env medora
```

`docker-compose.yml` يستخدم `DATABASE_URL=mysql://medora:medora@db:3306/medora`، وينشر المنفذ `3000`، ويحفظ البيانات في وحدة التخزين `medora_db`.

<a name="running-ar"></a>
## ٥. التشغيل وأول تسجيل دخول

1. شغّل الخادم: `npm run dev` ثم افتح **http://localhost:3000**
2. سجّل الدخول بحساب الأدمن المُزروع: **`admin` / `admin`**
3. **غيّر كلمة المرور فورًا** — من حساب الأدمن فقط:
   - تغيير اسم المستخدم وكلمة المرور متاح **حصريًا لحساب الأدمن** (من لوحة الأدمن)، وتُبطَل كل الجلسات القديمة عند التغيير.

> ⚠️ أمان: استخدم بيانات الدخول المُزروعة فقط في بيئة محلية/خاصة، ثم غيّرها.

<a name="scripts-ar"></a>
## ٦. أوامر المشروع

| الأمر | الوصف |
|---|---|
| `npm run dev` | خادم التطوير (`tsx watch server/_core/index.ts`) |
| `npm run build` | بناء الإنتاج: Vite (الواجهة) + esbuild (الخادم) → `dist/` |
| `npm start` | خادم الإنتاج (`node dist/index.js`) |
| `npm run check` | فحص الأنواع (`tsc --noEmit`) |
| `npm run test` | الاختبارات (`vitest run`) |
| `npm run e2e` | اختبارات Playwright الشاملة |
| `npm run db:push` | توليد وترحيل مخطط Drizzle |
| `npm run format` | تنسيق Prettier |

<a name="structure-ar"></a>
## ٧. بنية المشروع

```
MEDORA-Health-Care-Eco-System/
├── server/
│   ├── _core/            # نقطة الدخول (index.ts)، سياق tRPC، المصادقة
│   ├── domain/           # internal-auth (scrypt، الجلسات، القفل)
│   └── routers/          # مسارات tRPC: delivery, rbac, ai-review,
│                         #   adminAccount, erp, insurance, backup …
├── client/src/
│   ├── pages/            # Login, Welcome, Delivery, AdminConsole …
│   └── components/       # مكونات واجهة العمل
├── drizzle/              # مخطط Drizzle + مخططات الوحدات الإضافية
├── scripts/              # الزراعة والتزويد (المناطق، الصلاحيات، الأدمن، الأدوية)
├── data/                 # egyptian-drugs.csv (25,094 سجلًا، CC0-1.0)
├── docs/                 # تقارير التدقيق والأدلة (عربي/إنجليزي) والالتزامات
├── install.sh / install.bat / Dockerfile / docker-compose.yml
└── package.json          # license: MIT، الأوامر، الاعتماديات
```

<a name="usage-ar"></a>
## ٨. دليل الاستخدام

- **تسجيل الدخول** — `admin` / `admin` عبر `/login` (غيّر كلمة المرور من حساب الأدمن فقط).
- **نقطة البيع والمبيعات** — `/pos` و`/sales` مع مخزون دُفعات FEFO وفواتير معلّقة.
- **العمليات / الموارد البشرية** — حضور الموظفين، طلبات الإجازات والموافقات.
- **التوصيل** — `/delivery`: إدارة المناطق والسائقين، إنشاء الطلبات (تُسند تلقائيًا لأول سائق متاح)، وتتبع الحالات (`created ← assigned ← picked_up ← in_transit ← delivered` بالإضافة إلى `cancelled / failed`).
- **لوحة الأدمن** — `/admin`: إدارة المستخدمين والأدوار والصلاحيات (RBAC) وبيانات حساب الأدمن.
- **المراجعة الآلية** — تعمل يوميًا تلقائيًا؛ تنتج درجات لكل وحدة (0–100) وتوصيات P0–P3 بتقارير عربية (انظر `server/routers/ai-review.ts`).
- **التعاقدات الطبية والتأمين** — عقود الجهات، الاستحقاق، التفويض المسبق، المطالبات، التحصيل (انظر `docs/MEDORA-CONTRACT-DISPENSING-AUDIT-2026-08-28.md`).

التوثيق الكامل (أدلة المستخدم، دليل الأدمن/المالك، وصف المنتج — عربي وإنجليزي) في [`docs/`](docs/).

<a name="security-ar"></a>
## ٩. الأمان والنسخ الاحتياطي

- **كلمات المرور**: scrypt (N=16384, r=8, p=1)، قفل بعد 5 محاولات، سياسة ≥12 حرفًا (`server/domain/internal-auth.ts`).
- **حساب الأدمن**: تغيير اسم المستخدم/كلمة المرور **من حساب الأدمن فقط**؛ تُبطَل كل الجلسات عند التغيير (`server/routers/adminAccount.ts`).
- **التفويض**: كل إجراء tRPC محميّ بفحص صلاحيات RBAC + تحقق Zod من المدخلات.
- **النسخ الاحتياطي**: سياسات مشفّرة مع دعم S3/Forge بروابط موقّعة (`server/routers/backup.ts`)؛ وتحقق شهري من الاستعادة موثّق في `docs/MEDORA-BACKUP-SYNC-AUDIT-2026-08-28.md`.
- **التدقيق**: تقرير تدقيق صرف التعاقدات الطبية في `docs/MEDORA-CONTRACT-DISPENSING-AUDIT-2026-08-28.md`.

<a name="contributing-ar"></a>
## ١٠. المساهمة

المساهمات مرحّب بها دائمًا — هذا مشروع مجتمعي مفتوح المصدر:

1. اقرأ [CONTRIBUTING.md](CONTRIBUTING.md) و[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
2. أبلغ عن الأخطاء/اطلب المميزات عبر [قوالب Issues](https://github.com/0SSAM/MEDORA-Health-Care-Eco-System/issues/new/choose).
3. الثغرات الأمنية: أبلغ بشكل خاص وفق [SECURITY.md](SECURITY.md).
4. **القاعدة الذهبية**: المشروع يعمل على فرع `main` واحد مباشرة (لا فروع جانبية) بطلبات PR نظيفة ومركّزة.

قبل فتح PR، شغّل `npm run check` و`npm run test`.

<a name="license-ar"></a>
## ١١. الترخيص

رخصة MIT — مجاني للأبد، لكل أنواع الاستخدام (شخصي، تجاري، حكومي، تعليمي). انظر [LICENSE](LICENSE) و[الالتزام بالمصدر المفتوح](docs/OPEN-SOURCE-COMMITMENT-2026-08-28.md).

</div>

---

© 2026 MEDORA Contributors — Made with ❤️ for Egypt and the world 🌍
