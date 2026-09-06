# MEDORA Health Care Eco System

> **One intelligent ecosystem for connected healthcare.**  
> **منظومة ذكية واحدة لرعاية صحية مترابطة.**

MEDORA is an open-source healthcare operations platform spanning pharmacy, POS, supply, finance, people, delivery, insurance foundations, governance, analytics, and AI-assisted decision support.

MEDORA هي منصة مفتوحة المصدر لتشغيل منظومة الرعاية الصحية، تجمع الصيدليات ونقاط البيع والإمداد والمالية والموارد البشرية والتوصيل وأسس التأمين والحوكمة والتحليلات والمساعدة بالذكاء الاصطناعي.

## Start here | ابدأ من هنا

### Public visitor sandbox

**`/demo` — Anonymous Admin Sandbox**

No username. No password. No employee account. No production authentication.

The visitor sandbox is a synthetic, disposable product-discovery surface. It is not a production administrator and must never receive real patient, financial, employee, credential, payment, or operational data.

**جرّب MEDORA بدون حساب:**

**`/demo` — بيئة المسؤول التجريبية المجهولة**

لا اسم مستخدم. لا كلمة مرور. لا حساب موظف. ولا مصادقة على الإنتاج.

## Why MEDORA | لماذا MEDORA؟

Healthcare operations are fragmented across clinics, pharmacies, counters, suppliers, finance teams, delivery fleets, insurers, and spreadsheets. MEDORA is designed around one operating model, many specialized workspaces, and one governed source of truth.

تعمل الرعاية الصحية غالباً عبر أنظمة متفرقة. MEDORA مبنية حول نموذج تشغيل واحد، ومساحات متخصصة متعددة، ومصدر واحد منضبط للحقيقة التشغيلية.

| Domain | English | العربية |
|---|---|---|
| Care | Healthcare workflows and protected clinical boundaries | مسارات الرعاية والحدود السريرية المحمية |
| Pharmacy | Pharmacy-oriented operations and dispensing | تشغيل الصيدليات ومسارات الصرف |
| POS | Sales, receipts and barcode workflows | المبيعات والإيصالات والباركود |
| Supply | Procurement, inventory, suppliers, FEFO and traceability | المشتريات والمخزون والموردون وFEFO والتتبع |
| Delivery | Fulfillment and delivery orchestration | التنفيذ والتوصيل |
| Finance | Financial foundations, invoices and commercial visibility | الأسس المالية والفواتير والرؤية التجارية |
| People | Workforce, attendance, shifts and HR foundations | الموظفون والحضور والورديات وأسس الموارد البشرية |
| Governance | Scope, compliance, audit and controlled workflows | النطاق والامتثال والتدقيق والعمليات المنضبطة |
| Intelligence | KPIs, analytics, anti-fraud and operational intelligence | مؤشرات الأداء والتحليلات ومكافحة الاحتيال |
| AI | Bilingual advisory assistance and governed AI surfaces | مساعدة استشارية ثنائية اللغة ومسارات ذكاء اصطناعي محكومة |
| Insurance | Insurance operations foundation and integration-ready boundaries | أساس تشغيل التأمين وحدود جاهزة للتكامل |
| Connectors | Government, payment, catalog, device and external integration boundaries | حدود التكامل الحكومي والدفع والكتالوج والأجهزة |

## Product principles | مبادئ المنتج

**Human authority stays in control.** AI is advisory-only; sensitive mutations remain subject to explicit server-side authorization and workflow controls.

**الإنسان صاحب القرار.** الذكاء الاصطناعي استشاري فقط، وتظل التغييرات الحساسة خاضعة للتفويض الصريح من الخادم وضوابط سير العمل.

**Scope is enforced at the server boundary.** Organization, branch, and jurisdiction are resolved from authenticated server-side context rather than trusted from arbitrary client input.

**يُفرض النطاق عند حدود الخادم.** تُستمد المؤسسة والفرع والاختصاص من السياق الموثق على الخادم، ولا يُعتمد على قيم يرسلها العميل وحده.

**Integration readiness is not a claim of live connectivity.** External connectors remain gated by contracts, credentials, security review, acceptance evidence, and deployment-specific approvals.

**الاستعداد للتكامل لا يعني وجود اتصال حي.** تظل الموصلات الخارجية مرتبطة بالعقود والاعتمادات ومراجعة الأمان وأدلة القبول والموافقات الخاصة بالنشر.

**The demo is not production.** The visitor sandbox is synthetic, disposable, and intentionally separated from production authentication.

## Installation | التثبيت

### Requirements

- Node.js 22+
- pnpm 10.34.5
- MySQL 8, MariaDB, or TiDB
- Git

### Clone

```bash
git clone https://github.com/0SSAM/MEDORA-Health-Care-Eco-System.git
cd MEDORA-Health-Care-Eco-System
```

**Development rule:** work directly on `main` for this repository. Do not create feature branches for MEDORA maintenance unless the repository owner explicitly changes this policy.

### Install

```bash
pnpm install --frozen-lockfile
```

### Database

Never point local development at a production database.

```sql
CREATE DATABASE medora_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'medora_app'@'localhost' IDENTIFIED BY 'REPLACE_WITH_A_STRONG_LOCAL_PASSWORD';
GRANT ALL PRIVILEGES ON medora_dev.* TO 'medora_app'@'localhost';
FLUSH PRIVILEGES;
```

### Environment

Create `.env` from `.env.example` and keep it local. Never commit real secrets.

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

### Schema and verification

```bash
pnpm db:push
pnpm check
pnpm test
pnpm build
pnpm audit --prod --audit-level=high
bash scripts/ci-smoke.sh
```

### Start

```bash
pnpm dev
```

Local application: `http://localhost:3000`

Authenticated local development requires the OAuth provider to allow `/api/oauth/callback`.

## Visitor Sandbox | بيئة الزائر

The visitor surface provides anonymous product exploration with synthetic session-only state. It must remain independent of production authentication, production databases, real credentials, payments, and regulated external side effects.

Browser shutdown cleanup is best-effort; `sessionStorage` is the primary session-expiry boundary. Browser code is never claimed to prevent OS-level or physical capture absolutely.

## Architecture at a glance | نظرة معمارية

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

## Security & governance | الأمن والحوكمة

- Organization, branch, and jurisdiction scope is resolved server-side.
- Sensitive workflows fail closed when required authorization or scope is unavailable.
- AI is advisory-only.
- Client-side capture protection is defense-in-depth; **browser code is never claimed to prevent OS-level or physical capture absolutely.**
- No legal or regulatory certification is claimed by this repository.
- Integration boundaries do not imply live external connectivity.

## Repository map | خريطة المستودع

- `client/src/` — React application and user-facing workspaces
- `server/` — API, authorization, workflows and server logic
- `drizzle/schema.ts` — database schema
- `docs/` — architecture, audits, contracts and operational documentation
- `.github/workflows/` — CI, verification, security and deployment gates
- `LOCAL_SETUP.md` — local setup reference
- `.env.example` — environment template
- `scripts/` — verification and operational scripts
- `LICENSE` — MIT license

## Useful commands | أوامر مهمة

```bash
pnpm install --frozen-lockfile
pnpm db:push
pnpm check
pnpm test
pnpm build
pnpm dev
pnpm audit --prod --audit-level=high
bash scripts/ci-smoke.sh
pnpm run build:cloudflare
pnpm dlx wrangler@4.129.0 deploy --dry-run
```

## Contribution | المساهمة

MEDORA is MIT-licensed and welcomes careful engineering contributions. Preserve the fail-closed security model, bilingual product surface, test contracts, and distinction between implemented capabilities and integration-gated readiness.

Before proposing changes, read `CONTRIBUTING.md` and the relevant material under `docs/`.

## License | الترخيص

MEDORA is released under the **MIT License**. See [`LICENSE`](LICENSE).

## MEDORA in one sentence | MEDORA في جملة واحدة

> **A bilingual, open-source operating ecosystem for healthcare — designed to make complex work feel clear, connected, and governed.**
>
> **منظومة تشغيل صحية ثنائية اللغة ومفتوحة المصدر — صُممت لتجعل العمل المعقد واضحاً ومترابطاً ومنضبطاً.**
