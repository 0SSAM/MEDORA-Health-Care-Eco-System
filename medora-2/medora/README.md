# MEDORA Health Care Eco System

> **One intelligent ecosystem for connected healthcare.**  
> **منظومة ذكية واحدة لرعاية صحية مترابطة.**

MEDORA is an open-source healthcare operations platform spanning pharmacy, POS, supply, finance foundations, people, delivery, insurance operations foundations, governance, analytics, and AI-assisted decision support.

MEDORA هي منصة مفتوحة المصدر لتشغيل منظومة الرعاية الصحية، تجمع الصيدليات ونقاط البيع والإمداد وأسس المالية والموارد البشرية والتوصيل وأسس تشغيل التأمين والحوكمة والتحليلات والمساعدة بالذكاء الاصطناعي.

## Current truth | الحقيقة الحالية

MEDORA is **not production-complete** and does not claim regulatory certification, live insurer/government connectivity, or parity with a general-purpose enterprise suite. The repository distinguishes executable internal workflows from integration-gated capabilities.

ميدورا **ليست مكتملة للإنتاج** ولا تدّعي اعتمادًا تنظيميًا أو اتصالًا حيًا بشركات التأمين أو الجهات الحكومية أو تكافؤًا وظيفيًا مع حزم ERP العامة. ويفصل المستودع بين مسارات التشغيل الداخلية القابلة للتنفيذ والقدرات التي ما زالت محكومة بمتطلبات التكامل الخارجي.

## Product surface | نطاق المنتج

| Domain | English | العربية |
|---|---|---|
| Care | Healthcare workflows and protected clinical boundaries | مسارات الرعاية والحدود السريرية المحمية |
| Pharmacy | Pharmacy operations, dispensing and FEFO-aware workflows | تشغيل الصيدليات ومسارات الصرف وFEFO |
| POS | Sales, receipts and barcode workflows | المبيعات والإيصالات والباركود |
| Supply | Procurement, inventory, suppliers and traceability foundations | المشتريات والمخزون والموردون وأسس التتبع |
| Delivery | Fulfillment and delivery orchestration | التنفيذ والتوصيل |
| Finance | Financial foundations, invoices and commercial visibility | الأسس المالية والفواتير والرؤية التجارية |
| People | Workforce and HR foundations | الموظفون وأسس الموارد البشرية |
| Customer Care / CRM | Customer profiles, care interactions and service workflows | ملفات العملاء وتفاعلات الرعاية وخدمة العملاء |
| Governance | Scope, compliance, audit and controlled workflows | النطاق والامتثال والتدقيق والعمليات المنضبطة |
| Intelligence | KPIs, analytics, anti-fraud and operational intelligence | مؤشرات الأداء والتحليلات ومكافحة الاحتيال |
| AI | Bilingual advisory assistance and governed AI surfaces | مساعدة استشارية ثنائية اللغة ومسارات ذكاء اصطناعي محكومة |
| Insurance | Internal eligibility, coverage, preauthorization, claims, remittance, appeals and communication foundations | أسس الأهلية والتغطية والموافقات المسبقة والمطالبات والتسويات والاستئنافات والاتصالات التأمينية |
| Connectors | Government, payer, payment, catalog, device and external integration boundaries | حدود التكامل الحكومي والتأميني والدفع والكتالوج والأجهزة |

## Capability states | حالات القدرات

MEDORA uses four truth states:

1. **Implemented & tested** — implemented software with executable evidence and regression coverage.
2. **Implemented foundation / not production integrated** — internal persistence/workflow exists, but an external or infrastructure dependency remains.
3. **Planned** — intentionally not represented as implemented.
4. **Blocked by external prerequisite** — requires authoritative source, credentials, certification, infrastructure, or acceptance evidence.

Do not treat a screen, permission, seeded record, configuration flag, or documentation page as proof of a live integration.

## Security principles | مبادئ الأمان

- **Organization, branch, and jurisdiction** scope is enforced server-side.
- **Organization, branch, and jurisdiction** are part of the security boundary.
- **Jurisdiction ID `0` is a valid legal scope** when explicitly selected by the applicable policy.
- Fail-closed authorization for sensitive workflows.
- **The AI assistant is advisory-only** by default; sensitive mutations require explicit server-side authorization and workflow controls.
- Platform-admin identity and foundational privileges are protected from ordinary tenant RBAC mutation.
- Regulated, clinical, insurance, identity and payment data are not accepted by generic production offline persistence.
- Browser capture protection is defense-in-depth, not an absolute guarantee against OS-level or physical capture.
- **browser code is never claimed to prevent OS-level or physical capture absolutely**; browser controls are defense-in-depth only.
- **No legal or regulatory certification is claimed** by repository code alone; clinical, accounting, security, and regulatory acceptance require appropriate external evidence.
- External connectors remain disabled until endpoint, authentication, mapping, sandbox, acceptance and operational evidence are present.

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
DATABASE_URL=mysql://medora_app:REPLACE_WITH_A_STRONG_LOCAL_PASSWORD@127.0.0.1:3306/medora_dev
JWT_SECRET=GENERATE_A_LONG_RANDOM_VALUE
VITE_APP_ID=YOUR_OAUTH_APP_ID
OAUTH_SERVER_URL=YOUR_OAUTH_SERVER_URL
VITE_OAUTH_PORTAL_URL=YOUR_VITE_OAUTH_PORTAL_URL
OWNER_OPEN_ID=YOUR_OWNER_OPEN_ID
OWNER_NAME=MEDORA Owner
```

### Verification

```bash
pnpm db:push
pnpm check
pnpm test
pnpm build
pnpm audit --prod --audit-level=high
bash scripts/ci-smoke.sh
pnpm run build:cloudflare
pnpm dlx wrangler@4.129.0 deploy --dry-run
```

### Start

```bash
pnpm dev
```

Local application: `http://localhost:3000`

Authenticated local development requires the OAuth provider to allow `/api/oauth/callback`.

## Architecture | المعمارية

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

## Insurance truth | حقيقة التأمين

The insurance domain now has an executable **internal** workflow surface for payer contracts, member references, coverage/benefit rules, eligibility requests, preauthorization, claims, claim events, secure attachment references, remittances, appeals, and payer communications. External payer transport remains deliberately fail-closed until the payer-specific contract and acceptance evidence exist.

هذا يعني أن MEDORA يمكنها تشغيل دورة التأمين الداخلية وحفظها وتدقيقها، لكنه **لا يعني اتصالًا حيًا** بشركة تأمين أو TPA أو جهة حكومية. لا يتم اختراع التغطية أو الموافقة أو نتيجة المطالبة من جانب MEDORA عند غياب المصدر التأميني الموثوق.

## Administration | الإدارة

The user-control console is platform-admin-only. Ordinary organization roles cannot create or mutate the platform administrator through tenant RBAC. The admin account is protected by server-side invariants and regression contracts.

لوحة التحكم بالمستخدمين مخصصة لأدمن المنصة فقط. ولا يمكن للأدوار المؤسسية العادية إنشاء أو تعديل مسؤول المنصة من خلال RBAC الخاص بالمؤسسة، مع وجود ضوابط خادمية واختبارات انحدار لحماية حساب الأدمن.

## External integrations | التكاملات الخارجية

Government, payer, payment, device and regulatory connectors are integration boundaries, not proof of connectivity. Production activation requires the relevant endpoint/channel, credentials or certificates, message mappings, sandbox validation, rejection/retry behavior, audit requirements, accountable ownership and acceptance evidence.

## Operational limitations | الحدود التشغيلية

Known production-readiness work remains in areas such as database referential-integrity hardening, full double-entry accounting, complete offline conflict resolution and trusted-device attestation, broad cross-tenant adversarial lifecycle testing, country-specific regulatory evidence, and live external integration acceptance. These are tracked explicitly rather than hidden behind UI claims.

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

## Contribution | المساهمة

MEDORA is MIT-licensed and welcomes careful engineering contributions. Preserve the fail-closed security model, bilingual product surface, test contracts, and distinction between implemented capabilities and integration-gated readiness.

Before proposing changes, read `CONTRIBUTING.md` and the relevant material under `docs/`.

## License | الترخيص

MEDORA is released under the **MIT License**. See [`LICENSE`](LICENSE).

## MEDORA in one sentence | MEDORA في جملة واحدة

> **A bilingual, open-source operating ecosystem for healthcare — designed to make complex work feel clear, connected, and governed.**
>
> **منظومة تشغيل صحية ثنائية اللغة ومفتوحة المصدر — صُممت لتجعل العمل المعقد واضحاً ومترابطاً ومنضبطاً.**
