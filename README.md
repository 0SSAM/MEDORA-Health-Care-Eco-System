# MEDORA — Integrated Health Care Ecosystem

> **One intelligent ecosystem for connected healthcare.**  
> **منظومة ذكية واحدة لرعاية صحية مترابطة.**

MEDORA is an open-source healthcare platform that brings clinical workflows, enterprise operations, pharmacy, commerce, delivery, workforce, intelligence, governance, and healthcare administration into one scoped system.

**ميدورا** منصة رعاية صحية مفتوحة المصدر تجمع المسارات السريرية، والعمليات المؤسسية، والصيدلة، والتجارة، والتوصيل، والموارد البشرية، والذكاء، والحوكمة، والإدارة الصحية في منظومة واحدة ذات نطاقات صلاحيات واضحة.

> **Truth over hype — الحقيقة قبل التسويق:** MEDORA documents implemented capabilities separately from integration-ready and future capabilities. It does **not** claim live governmental or insurer certification unless the external party has supplied and approved the required production integration contract.

---

## 🌐 MEDORA at a glance — نظرة شاملة

| Domain | English | العربية |
|---|---|---|
| Clinical | Patients, appointments, encounters, referrals, e-prescriptions, ICD-11 | المرضى، المواعيد، الزيارات، الإحالات، الوصفات الإلكترونية، ICD-11 |
| Enterprise | ERP, CRM, HR, POS, inventory, finance, procurement | ERP وCRM والموارد البشرية ونقطة البيع والمخزون والمالية والمشتريات |
| Pharmacy | Egyptian drug catalog, dispensing controls, stock and fulfillment | قاعدة الأدوية المصرية، ضوابط الصرف، المخزون والتنفيذ |
| Insurance | Eligibility, coverage, preauthorization, claims, contracts, remittance, appeals foundations | الأهلية والتغطية، الموافقات المسبقة، المطالبات، العقود، التسويات، والاستئنافات |
| Workforce | Attendance, GPS geofence, biometric/tamper policy, KPI | الحضور، السياج الجغرافي، القياسات الحيوية، مكافحة العبث، مؤشرات الأداء |
| Delivery | Zones, orders, drivers, tracking | المناطق، الطلبات، السائقون، التتبع |
| Intelligence | GP MAX, KPI, AI review and governance boundaries | GP MAX ومؤشرات الأداء والمراجعة الذكية وحدود حوكمة الذكاء الاصطناعي |
| Communications | WhatsApp Cloud API and Twilio voice integration boundaries | تكامل WhatsApp وTwilio وحدود قنوات الاتصال |
| Platform | PWA, offline outbox/LWW synchronization, scoped RBAC | PWA ومزامنة عدم الاتصال وRBAC متعدد النطاقات |

---

## 🛡️ Security & safety — الأمن والسلامة

- Organization, branch, and jurisdiction scoping is enforced on audited current paths.
- **النطاق المؤسسي والفرع والاختصاص القانوني** جزء من حدود الوصول في المسارات المدققة.
- Jurisdiction ID `0` is a valid legal scope and is never treated as “missing”.
- The AI assistant is **advisory-only**; it does not replace clinical, legal, or operational accountability.
- Sensitive workflows use authorization, auditability, idempotency, and explicit external-submission boundaries where applicable.
- Browser-side controls are never represented as absolute protection against OS-level or physical capture.
- MEDORA does not claim FDA/EMA, EDA/UPA, UHIA/EHA, or insurer certification without the corresponding external authorization and evidence.

---

# 🏥 Insurance — التأمين الصحي

Insurance is a **first-class MEDORA domain**, designed around payer/provider interoperability rather than a single insurer's proprietary workflow.

التأمين في MEDORA **وحدة أساسية مستقلة** صُممت للتكامل مع جهات الدفع ومقدمي التأمين، وليس للارتباط بشركة واحدة فقط.

### Current foundation — الأساس الحالي

MEDORA currently contains a policy-first internal foundation for:

- Insurance members and scoped coverage data
- Payer contracts
- Eligibility / coverage requests
- Preauthorization requests
- Claims and claim lifecycle foundations
- Remittance records
- Appeals foundations
- Organization / jurisdiction / branch authorization
- Hashed or protected member references where required
- Idempotent operations for applicable workflows
- Explicit blocked/external-submission states
- Audit-oriented lifecycle data

توجد بالفعل بنية داخلية للمؤمَّن عليهم، وعقود جهات الدفع، وطلبات الأهلية والتغطية، والموافقات المسبقة، والمطالبات، والتسويات، والاستئنافات، مع عزل الصلاحيات والنطاقات والتدقيق ومنع الإرسال الخارجي غير المصرح به.

### Payer interoperability — التوافق مع مواقع وأنظمة شركات التأمين

MEDORA is designed around a **Payer Adapter / Connector boundary** so that each insurer can be integrated without contaminating the core clinical or ERP domain.

The adapter contract should accommodate, when the payer officially supports it:

1. **Eligibility verification** — التحقق من الأهلية والتغطية
2. **Benefits / limits / co-pay** — المنافع والحدود ونسبة التحمل
3. **Preauthorization** — طلب ومتابعة الموافقة المسبقة
4. **Claim submission** — تجهيز وإرسال المطالبة
5. **Claim acknowledgement / status** — الاستلام والحالة
6. **Attachments / supporting documents** — المرفقات والمستندات الداعمة
7. **Rejection / resubmission** — الرفض وإعادة الإرسال
8. **Remittance / reconciliation** — التسوية والمطابقة المالية
9. **Appeals** — الاستئناف
10. **Audit trail** — سجل تدقيق كامل لكل عملية

Where an insurer exposes a secure API, MEDORA can use an API connector. Where an insurer exposes only an approved web portal, the integration boundary can support a controlled portal connector/automation layer subject to the insurer's terms, authentication, anti-bot requirements, and authorization. MEDORA must never bypass security controls, CAPTCHA, MFA, or access restrictions.

**Important:** website compatibility is an **architecture and connector capability**, not a claim that MEDORA is already authenticated to every Egyptian insurer. Live connectivity requires the payer's endpoint contract, credentials/certificates, message schema, test environment, acknowledgement/error semantics, and production approval.

### Egypt readiness — الجاهزية للسوق المصري

The insurance domain is intentionally compatible with Egyptian healthcare operating realities while keeping external regulatory claims conservative. The repository includes Egypt-specific healthcare, payer-contract, claim, preauthorization, remittance, and regulatory-boundary work.

This allows MEDORA to become compatible with Egyptian payer/provider ecosystems without hard-coding one organization's private protocol.

---

# ✨ Core capabilities — القدرات الأساسية

### Clinical & care — الرعاية السريرية

- Patient-centered records and scoped healthcare workflows
- Facilities, appointments, encounters and referrals
- Electronic prescriptions with ICD-11 linkage
- Pharmacy/dispensing gates and medication data
- Clinical orders and healthcare administration foundations

### Enterprise ERP — تخطيط موارد المؤسسة

- CRM / customer operations
- Finance and billing foundations
- HR and attendance
- POS and sales
- Inventory and procurement foundations
- Delivery and fulfillment
- KPI/reporting workflows
- Organization/branch/jurisdiction isolation

### AI & governance — الذكاء الاصطناعي والحوكمة

- GP MAX growth/operational review
- KPI calculation and dashboards
- AI-assisted review with explicit advisory boundaries
- Human accountability and auditable workflow gates

### Communications — الاتصالات

- WhatsApp Cloud API webhook/outbound boundaries
- Twilio Programmable Voice integration boundaries
- Arabic/English communication support

### Offline & mobile — العمل دون اتصال والمحمول

- PWA installation
- Offline outbox synchronization
- Last-write-wins synchronization model
- GPS geofencing and biometric attendance controls
- Server-side anti-tamper policy

---

# 🧩 Architecture — المعمارية

```text
Patients / Providers / Organizations / Payers
                    │
                    ▼
          MEDORA Experience Layer
       Web • PWA • Arabic • English
                    │
                    ▼
          Scoped Application Layer
   Clinical • ERP • Insurance • Pharmacy
   CRM • HR • POS • Delivery • Intelligence
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
      tRPC        Domain       Policy
      API         Services     / RBAC
        │           │           │
        └───────────┼───────────┘
                    ▼
              Data / Audit Layer
                    │
        ┌───────────┴────────────┐
        ▼                        ▼
   MySQL / Drizzle       External Connectors
                              │
                    ┌─────────┼─────────┐
                    ▼         ▼         ▼
                  Payers   Messaging   Future APIs
```

External integrations are isolated behind connector boundaries so a payer, government service, messaging provider, or future interoperability partner can evolve without rewriting MEDORA's core domains.

---

# 🇪🇬 Egypt-specific foundation — الأساس المصري

- Egyptian drug catalog (`data/egyptian-drugs.csv`)
- ICD-11 integration boundaries
- Egypt healthcare domain package
- Payer/insurance data model and workflow foundation
- Regulatory-boundary documentation
- ETA-related invoice workflow boundaries
- Arabic-first UI/content capability

External regulatory or governmental production access is activated only after the responsible authority provides the required official integration contract and authorization.

---

# 🧪 Quality & verification — الجودة والتحقق

MEDORA is intended to be verified at multiple layers:

- TypeScript/typecheck
- Unit and integration tests
- Browser/UI verification
- Production build
- Security/dependency verification
- CodeQL/SonarCloud analysis
- ERP/RBAC gates
- Cloudflare Worker build/deployment validation
- Synthetic/operational checks where configured

A green build is **not** treated as proof that every clinical or insurance workflow is production-certified; external integrations require their own acceptance evidence.

---

# 🚀 Quick start — التشغيل السريع

## Docker

```bash
cp .env.example .env
docker compose up --build -d
# http://localhost:3000
```

## Manual

```bash
corepack enable
pnpm install --frozen-lockfile
cp .env.example .env
pnpm run db:push
pnpm run dev
```

Additional seed scripts are documented in `scripts/` and the operational documentation.

> For production, replace development credentials immediately and provide all required secrets through the deployment secret manager. Never commit credentials to Git.

---

# 📁 Project structure — بنية المشروع

```text
server/routers/      → tRPC/application endpoints
server/domain/       → security and domain policies
drizzle/             → database schema and migrations
shared/               → shared domain/synchronization code
client/src/pages/    → application workspaces
client/src/components/ → reusable UI/workspaces
scripts/              → provisioning, seed and verification tools
docs/                 → architecture, audits, security and operations
.github/workflows/    → CI/CD and security verification
```

---

# 🔌 Integration philosophy — فلسفة التكامل

MEDORA follows three rules:

**1. Core first — النواة أولاً**  
External systems must not compromise core authorization, auditability, or data isolation.

**2. Adapter isolation — عزل الموصلات**  
Payer/provider-specific protocols belong in connectors, not scattered across clinical and ERP code.

**3. Evidence before claims — الدليل قبل الادعاء**  
A connector is called live only after real authentication, successful test transactions, error handling, reconciliation, and production authorization have been demonstrated.

---

# 🤝 Contributing — المساهمة

See `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, and `SECURITY.md`. Use the repository issue/PR templates for engineering work.

# 📜 License — الترخيص

MIT — see `LICENSE` and `NOTICE`.

---

## MEDORA in one sentence — ميدورا في جملة واحدة

> **MEDORA connects healthcare operations, clinical workflows, enterprise management, insurance, and governed intelligence into one secure, extensible ecosystem.**
>
> **ميدورا تربط العمليات الصحية والمسارات السريرية والإدارة المؤسسية والتأمين والذكاء المنضبط داخل منظومة واحدة آمنة وقابلة للتوسع.**
