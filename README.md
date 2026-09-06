# MEDORA — Integrated Health Care Ecosystem

> **One intelligent ecosystem for connected healthcare.**  
> **منظومة ذكية واحدة لرعاية صحية مترابطة.**

[![License: MIT](https://img.shields.io/badge/License-MIT-0f766e?style=for-the-badge)](LICENSE)
[![Node](https://img.shields.io/badge/Node.js-22%2B-111827?style=for-the-badge)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-10.34.5-f59e0b?style=for-the-badge)](https://pnpm.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?style=for-the-badge)](https://www.typescriptlang.org/)

**MEDORA is an open-source healthcare operations platform that brings clinical-adjacent workflows, pharmacy, POS, supply, finance, people, delivery, insurance foundations, governance, analytics, and AI-assisted decision support into one role-aware operating surface.**

**MEDORA هي منصة مفتوحة المصدر لتشغيل منظومة الرعاية الصحية، تجمع مسارات الصيدليات ونقاط البيع والإمداد والمالية والموارد البشرية والتوصيل وأسس التأمين والحوكمة والتحليلات والمساعدة بالذكاء الاصطناعي في مساحة تشغيل واحدة واعية بالدور.**

---

## ✦ Start here | ابدأ من هنا

### Try MEDORA — no account required

**Explore the public visitor sandbox:**

**`/demo` — Anonymous Admin Sandbox**

No username. No password. No employee account. No production authentication.

The visitor sandbox is designed for product discovery: visitors can explore MEDORA's capability map and manipulate **synthetic, session-only data**. The browser session is disposable and is cleared when the session ends; the demo must never be treated as a production workspace or as a place for real patient, financial, or operational data.

**جرّب MEDORA بدون حساب:**

**`/demo` — بيئة المسؤول التجريبية المجهولة**

لا اسم مستخدم. لا كلمة مرور. لا حساب موظف. ولا مصادقة على الإنتاج.

صُممت البيئة التجريبية لاكتشاف المنتج: يمكن للزائر استعراض خريطة إمكانات MEDORA والتعامل مع **بيانات اصطناعية مؤقتة مرتبطة بالجلسة**. البيئة قابلة للإتلاف ولا ينبغي استخدامها مطلقاً لبيانات مرضى حقيقية أو بيانات مالية أو تشغيلية حقيقية.

> **Important:** “Admin-like” in the visitor experience means an unrestricted *simulation of product capabilities*, not an elevation of privileges inside the production authorization system.
>
> **مهم:** المقصود بـ«صلاحيات شبيهة بالـAdmin» في تجربة الزائر هو *محاكاة غير مقيدة لإمكانات المنتج*، وليس رفع صلاحيات داخل نظام الصلاحيات الإنتاجي.

---

## ✦ Why MEDORA | لماذا MEDORA؟

Healthcare operations are fragmented across counters, clinics, pharmacies, suppliers, finance teams, delivery fleets, insurers, and spreadsheets. MEDORA is designed around the opposite idea:

**one operating model, many specialized workspaces, one governed source of truth.**

تعمل الرعاية الصحية غالباً عبر أنظمة متفرقة بين نقاط البيع والعيادات والصيدليات والموردين والمالية والتوصيل وشركات التأمين والجداول اليدوية. MEDORA مبنية على الفكرة المعاكسة:

**نموذج تشغيل واحد، ومساحات متخصصة متعددة، ومصدر واحد منضبط للحقيقة التشغيلية.**

### The capability constellation | خريطة الإمكانات

| Domain | English | العربية |
|---|---|---|
| 🏥 Care | Healthcare workflows and protected clinical boundaries | مسارات الرعاية والحدود السريرية المحمية |
| 💊 Pharmacy | Pharmacy-oriented operations and dispensing pathways | تشغيل الصيدليات ومسارات الصرف |
| 🧾 POS | Sales, receipts, barcode-oriented workflows | المبيعات والإيصالات ومسارات الباركود |
| 📦 Supply | Inventory, procurement, suppliers, FEFO and traceability | المخزون والمشتريات والموردون وFEFO والتتبع |
| 🚚 Delivery | Fulfillment and delivery orchestration | إدارة التنفيذ والتوصيل |
| 💳 Finance | Financial foundations, invoices, expenses and commercial visibility | الأسس المالية والفواتير والمصروفات والرؤية التجارية |
| 👥 People | Workforce, attendance, shifts and HR foundations | الموظفون والحضور والورديات وأسس الموارد البشرية |
| 🛡 Governance | Scope, compliance, audit and controlled workflows | النطاق والامتثال والتدقيق والعمليات المنضبطة |
| 📊 Intelligence | KPIs, analytics, anti-fraud and operational intelligence | مؤشرات الأداء والتحليلات ومكافحة الاحتيال والذكاء التشغيلي |
| 🧠 AI | Bilingual advisory assistance and governed AI surfaces | مساعدة استشارية ثنائية اللغة ومسارات ذكاء اصطناعي محكومة |
| 🧬 Insurance | Insurance operations foundation and integration-ready boundaries | أساس تشغيل التأمين وحدود جاهزة للتكامل |
| 🔗 Connectors | Government, payment, catalog, device and external integration boundaries | حدود التكامل الحكومي والدفع والكتالوج والأجهزة والأنظمة الخارجية |

---

## ✦ Product principles | مبادئ المنتج

**Human authority stays in control.** AI is advisory-only; sensitive mutations remain subject to explicit server-side authorization and workflow controls.

**الإنسان صاحب القرار.** الذكاء الاصطناعي استشاري فقط، وتظل التغييرات الحساسة خاضعة للتفويض الصريح من الخادم وضوابط سير العمل.

**Scope is enforced at the server boundary.** Organization, branch, jurisdiction, and role are resolved from authenticated server-side context rather than trusted from arbitrary client input.

**يُفرض النطاق عند حدود الخادم.** تُستمد المؤسسة والفرع والاختصاص والدور من السياق الموثق على الخادم، ولا يُعتمد على قيم يرسلها العميل وحده.

**Integration readiness is not a claim of live connectivity.** External connectors remain gated by contracts, credentials, security review, acceptance evidence, and deployment-specific approvals.

**الاستعداد للتكامل لا يعني وجود اتصال حي.** تظل الموصلات الخارجية مرتبطة بالعقود والاعتمادات ومراجعة الأمان وأدلة القبول والموافقات الخاصة بالنشر.

**The demo is not production.** The visitor sandbox is synthetic, disposable, and intentionally separated from production authentication.

**التجربة ليست إنتاجاً.** بيئة الزائر اصطناعية وقابلة للإتلاف ومنفصلة عمداً عن مصادقة الإنتاج.

---

# Installation | التثبيت

The following is the repository's canonical local-development path.

المسار التالي هو مسار التشغيل المحلي المعتمد للمستودع.

## 1. Requirements | المتطلبات

- **Node.js 22 or newer** — `package.json` declares `>=22`.
- **pnpm 10.34.5** — the repository pins `pnpm@10.34.5`.
- **MySQL 8, MariaDB, or TiDB** for database-backed local development.
- Git.

- **Node.js 22 أو أحدث** — المستودع يحدد `>=22`.
- **pnpm 10.34.5** — الإصدار مثبت في المستودع.
- **MySQL 8 أو MariaDB أو TiDB** للتشغيل المحلي المتصل بقاعدة البيانات.
- Git.

Verify:

```bash
node --version
pnpm --version
git --version
```

## 2. Clone | استنساخ المستودع

```bash
git clone https://github.com/0SSAM/MEDORA-Health-Care-Eco-System.git
cd MEDORA-Health-Care-Eco-System
```

**Development rule:** work directly on `main` for this repository. Do not create feature branches for MEDORA maintenance unless the repository owner explicitly changes this policy.

**قاعدة التطوير:** يتم العمل مباشرة على `main` في هذا المستودع. لا تنشئ فروعاً للتطوير أو الإصلاحات إلا إذا غيّر مالك المستودع هذه السياسة صراحةً.

## 3. Install dependencies | تثبيت الاعتماديات

```bash
pnpm install --frozen-lockfile
```

This uses the committed lockfile and prevents an accidental dependency graph rewrite.

هذا الأمر يستخدم ملف القفل الملتزم به ويمنع تغيير شجرة الاعتماديات بالخطأ.

## 4. Create a development database | إنشاء قاعدة تطوير

Never point local development at a production database.

لا توجّه التشغيل المحلي إلى قاعدة بيانات الإنتاج.

Example for MySQL:

```sql
CREATE DATABASE medora_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'medora_app'@'localhost' IDENTIFIED BY 'REPLACE_WITH_A_STRONG_LOCAL_PASSWORD';
GRANT ALL PRIVILEGES ON medora_dev.* TO 'medora_app'@'localhost';
FLUSH PRIVILEGES;
```

Use a strong local password and do not commit it.

استخدم كلمة مرور محلية قوية ولا ترفعها إلى Git.

## 5. Configure `.env` | إعداد متغيرات البيئة

Create `.env` in the repository root. Keep it local and never commit it.

أنشئ `.env` في جذر المستودع، واحتفظ به محلياً ولا ترفعه إلى Git.

Start from `.env.example`, then provide the values from your local infrastructure/OAuth provider:

```dotenv
NODE_ENV=development
DATABASE_URL=mysql://medora_app:LOCAL_PASSWORD@127.0.0.1:3306/medora_dev
JWT_SECRET=GENERATE_A_LONG_RANDOM_VALUE
VITE_APP_ID=YOUR_OAUTH_APP_ID
OAUTH_SERVER_URL=YOUR_OAUTH_SERVER_URL
VITE_OAUTH_PORTAL_URL=YOUR_VITE_OAUTH_PORTAL_URL
OWNER_OPEN_ID=YOUR_OWNER_OPEN_ID
OWNER_NAME=MEDORA Owner
```

Depending on enabled integrations, you may also need:

```dotenv
BUILT_IN_FORGE_API_URL=...
BUILT_IN_FORGE_API_KEY=...
VITE_FRONTEND_FORGE_API_URL=...
VITE_FRONTEND_FORGE_API_KEY=...
```

Do not paste real secrets into documentation, source code, issues, screenshots, or commits.

لا تضع الأسرار الحقيقية في التوثيق أو الكود أو Issues أو لقطات الشاشة أو الـcommits.

## 6. Apply the database schema | تطبيق مخطط قاعدة البيانات

```bash
pnpm db:push
```

The repository script runs Drizzle generation and migration.

سكريبت المستودع ينفذ توليد وترحيل مخطط Drizzle.

## 7. Verify the installation | التحقق من التثبيت

Run the checks in this order:

```bash
pnpm check
pnpm test
pnpm build
```

Security check:

```bash
pnpm audit --prod --audit-level=high
```

CI smoke check:

```bash
bash scripts/ci-smoke.sh
```

## 8. Start MEDORA | تشغيل MEDORA

```bash
pnpm dev
```

Open:

```text
http://localhost:3000
```

For authenticated local development, the OAuth provider must be configured to allow the local callback:

```text
/api/oauth/callback
```

للتشغيل المحلي المصادق عليه، يجب إعداد مزود OAuth للسماح بالـcallback المحلي:

```text
/api/oauth/callback
```

---

# Visitor Sandbox | بيئة الزائر التجريبية

The public entry point is:

```text
/demo
```

### What visitors get | ماذا يحصل عليه الزائر؟

- Anonymous entry — **no username or password**.
- A clearly labeled **DEMO / SANDBOX** state.
- Synthetic records and interactive capability exploration.
- Create/update/delete interactions inside the disposable sandbox.
- Bilingual UI with Arabic/English direction support.
- A reset control for immediate cleanup.

- دخول مجهول — **بدون اسم مستخدم أو كلمة مرور**.
- حالة واضحة **DEMO / SANDBOX**.
- بيانات اصطناعية واستعراض تفاعلي للإمكانات.
- إنشاء/تعديل/حذف داخل البيئة التجريبية القابلة للإتلاف.
- واجهة ثنائية اللغة تدعم العربية والإنجليزية واتجاه النص.
- زر إعادة ضبط للتنظيف الفوري.

### Non-negotiable safety boundary | حد الأمان غير القابل للتفاوض

The visitor experience must never become an anonymous production administrator. It is a product simulation surface. Production authentication, regulated authorization, production databases, real patient data, real credentials, and real external connector side effects stay outside the sandbox.

يجب ألا تتحول تجربة الزائر إلى مسؤول إنتاج مجهول. إنها مساحة لمحاكاة المنتج. تبقى مصادقة الإنتاج والصلاحيات المنظمة وقواعد بيانات الإنتاج وبيانات المرضى الحقيقية والاعتمادات الحقيقية والآثار الخارجية الحقيقية خارج الـSandbox.

---

# Architecture at a glance | نظرة معمارية

| Layer | Stack |
|---|---|
| UI | React 19 + Vite + Tailwind CSS |
| Routing | Wouter |
| API | tRPC 11 |
| Validation | Zod 4 |
| Data | Drizzle ORM + MySQL-compatible database |
| Server | Node.js + Express |
| Tests | Vitest + Playwright |
| Deployment surface | Cloudflare Worker build + Wrangler gate |
| Language | Arabic + English |

The source tree separates browser UI, server routers, database schema, shared contracts, operational documentation, and automated verification.

يفصل هيكل المصدر بين واجهة المتصفح وRouters الخادم ومخطط قاعدة البيانات والعقود المشتركة والتوثيق التشغيلي والتحقق الآلي.

---

# Security & governance | الأمن والحوكمة

- Organization/branch/jurisdiction scope is resolved server-side.
- Sensitive workflows fail closed when required scope or authorization is unavailable.
- AI is advisory-only.
- Client-side capture protection is defense-in-depth; **browser code is never claimed to prevent OS-level or physical capture absolutely.**
- No legal or regulatory certification is claimed by this repository.
- External integrations are not represented as live merely because an integration boundary exists.

- يتم تحديد نطاق المؤسسة/الفرع/الاختصاص على الخادم.
- تفشل العمليات الحساسة بأمان عند غياب النطاق أو التفويض المطلوب.
- الذكاء الاصطناعي استشاري فقط.
- حماية الالتقاط على العميل هي طبقة دفاع إضافية؛ **browser code is never claimed to prevent OS-level or physical capture absolutely.**
- لا يدعي المستودع الحصول على شهادة قانونية أو تنظيمية.
- وجود حد تكامل لا يعني أن التكامل الخارجي حي أو معتمد للإنتاج.

---

# Repository map | خريطة المستودع

| Path | Purpose |
|---|---|
| `client/src/` | React application and user-facing workspaces |
| `server/` | API, authorization, workflows and server logic |
| `drizzle/schema.ts` | Database schema |
| `docs/` | Architecture, audits, contracts and operational documentation |
| `.github/workflows/` | CI, verification, security and deployment gates |
| `LOCAL_SETUP.md` | Local setup reference |
| `.env.example` | Environment variable template |
| `scripts/` | Verification and operational scripts |
| `LICENSE` | MIT license |

---

# Useful commands | أوامر مهمة

```bash
pnpm install --frozen-lockfile
pnpm db:push
pnpm check
pnpm test
pnpm build
pnpm dev
pnpm audit --prod --audit-level=high
bash scripts/ci-smoke.sh
```

Cloudflare build verification:

```bash
pnpm run build:cloudflare
pnpm dlx wrangler@4.129.0 deploy --dry-run
```

---

# Contribution | المساهمة

MEDORA is MIT-licensed and welcomes careful engineering contributions. Preserve the repository's fail-closed security model, bilingual product surface, test contracts, and distinction between implemented capabilities and integration-gated readiness.

MEDORA مرخصة بموجب MIT وترحب بالمساهمات الهندسية المنضبطة. حافظ على نموذج الأمان fail-closed، والواجهة ثنائية اللغة، وعقود الاختبارات، والفصل بين الإمكانات المنفذة والجاهزية المرتبطة بالتكامل.

Before proposing changes, read `CONTRIBUTING.md` and the relevant material under `docs/`.

---

# License | الترخيص

MEDORA is released under the **MIT License**. See [`LICENSE`](LICENSE).

MEDORA منشورة بموجب **رخصة MIT**. راجع [`LICENSE`](LICENSE).

---

## MEDORA in one sentence | MEDORA في جملة واحدة

> **A bilingual, open-source operating ecosystem for healthcare — designed to make complex work feel clear, connected, and governed.**
>
> **منظومة تشغيل صحية ثنائية اللغة ومفتوحة المصدر — صُممت لتجعل العمل المعقد واضحاً ومترابطاً ومنضبطاً.**
