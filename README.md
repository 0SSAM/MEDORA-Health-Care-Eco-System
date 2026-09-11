# MEDORA — Healthcare Operating Platform

<p align="center">
  <strong>MEDORA</strong><br/>
  <em>Healthcare operations, intelligence, insurance, pharmacy, CRM, HR, ERP and AI — in one governed platform.</em>
</p>

<p align="center">
  <a href="https://github.com/0SSAM/MEDORA-Health-Care-Eco-System/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/0SSAM/MEDORA-Health-Care-Eco-System/actions/workflows/ci.yml/badge.svg"></a>
  <a href="https://github.com/0SSAM/MEDORA-Health-Care-Eco-System/actions/workflows/codeql.yml"><img alt="CodeQL" src="https://github.com/0SSAM/MEDORA-Health-Care-Eco-System/actions/workflows/codeql.yml/badge.svg"></a>
  <a href="LICENSE"><img alt="License" src="https://img.shields.io/badge/license-MIT-0b1220.svg"></a>
</p>

> **العربية:** MEDORA منصة تشغيل صحية متكاملة تربط المرضى، مقدمي الخدمة، الصيدليات، التأمين، الموارد البشرية، الـERP، خدمة العملاء، البيانات والذكاء الاصطناعي في طبقة تشغيل واحدة محكومة بالصلاحيات والتدقيق.

---

## ✦ What MEDORA is

MEDORA is designed as a **healthcare operating layer**, not as a generic dashboard or an AI wrapper.

It is built around a simple operational question:

> **What happened, what is happening, what must happen next, who owns it, why is it allowed, and can we prove it happened?**

### Core domains

| Domain | Scope |
|---|---|
| 🏥 Clinical & Care | patient journeys, orders, results, clinical workflows |
| 💊 Pharmacy & POS | dispensing, inventory, pricing, sales and operational controls |
| 🛡 Insurance | eligibility, benefits, authorization, claims, rejection and reconciliation workflows |
| 👥 CRM & Customer Care | relationships, cases, communications and service workflows |
| 🧑‍💼 HR | people, attendance, administration and workforce operations |
| 🧾 ERP & Finance | procurement, accounting-oriented workflows, inventory and operational finance |
| 🚚 Delivery | delivery operations and status workflows |
| 🤖 AI Fabric | governed analysis, recommendations, provenance and controlled execution |
| 🔐 Governance | RBAC, consent, audit, tenant boundaries and administrative invariants |
| 📊 Intelligence | operational analytics, exception visibility and decision support |

---

## 🧭 Repository architecture

The active application lives in:

```text
medora-2/medora/
├── client/                 # React + Vite application
├── server/                 # Node/Express/tRPC backend
├── shared/                 # shared contracts and types
├── drizzle/                # schema + migrations
├── scripts/                # provisioning and operational scripts
├── electron/               # Windows desktop runtime and admin bootstrap
├── packaging/              # bundled Windows runtime resources
├── e2e/                    # browser journeys
├── docs/                   # architecture, audits and operating truth
├── electron-builder.yml   # installer + portable configuration
└── MEDORA-START-WINDOWS10.cmd
```

The repository also contains historical/duplicated project material from earlier repository layouts. The active build path is intentionally explicit in CI and Windows packaging so obsolete material is not silently treated as the production application.

---

## 🪟 Windows distribution

MEDORA is being packaged for Windows 10/11 x64 in three forms:

### 1. Full installer

**NSIS installer** with desktop/start-menu integration.

### 2. Standalone portable EXE

A no-install portable executable intended to run directly from a folder or removable location.

### 3. Self-contained CMD package

A double-click Windows package containing its runtime dependencies, including Node.js and MariaDB, so the machine does not need a separate Node/MariaDB installation.

The authoritative build workflow is:

`.github/workflows/windows-medora-packages.yml`

The distribution contract is documented in `WINDOWS10-PACKAGES.md`.

**No demo user is provisioned.** Desktop provisioning creates the requested **System Manager** account only.

> Security note: the requested bootstrap credential is intentionally a one-time local desktop bootstrap exception. Change it immediately after first login; normal password changes use the stronger password policy.

---

## 👑 System Manager

The desktop bootstrap provisions a dedicated MEDORA system-manager identity:

- Username: `admin`
- Role: `admin`
- Organization role: owner where supported by the schema
- Main branch association
- Internal authentication
- No demo account

The bootstrap is idempotent: it does not create a second admin account when the manager already exists.

The platform's administrative invariant remains intact: the protected platform administrator cannot be disabled, deleted or stripped of its core administrative authority through the normal administration UI.

---

## 🤖 Governed AI

MEDORA's AI layer follows a permission-preserving architecture:

```text
identity
  ↓
organization / tenant
  ↓
role
  ↓
permission
  ↓
resource
  ↓
purpose / policy
  ↓
audit + provenance
  ↓
AI capability
```

AI is not the source of truth for clinical, insurance, financial, identity, regulatory or compliance facts. AI capabilities are evaluated for authorization leakage, tenant isolation, groundedness, provenance, prompt-injection resistance, Arabic/English quality, cost and latency.

See:

- `medora-2/medora/docs/MEDORA-AI-FABRIC.md`
- `medora-2/medora/docs/AI-CAPABILITY-REGISTRY.md`
- `medora-2/medora/docs/MASTER-AUDIT-2026-08-22-v2.md`

---

## 🛡 Safety and production truth

MEDORA does **not** claim regulatory certification, live government connectivity, or live insurer connectivity merely because an internal workflow or adapter exists.

Capability status is separated into:

- **Implemented / tested**
- **Foundation / integration-ready**
- **Planned**
- **Blocked by external prerequisite**

External payer, government and connector capabilities require real external evidence before being represented as live production integrations.

---

## 🧪 Verification

The repository uses automated verification for:

- dependency installation and lockfile integrity
- TypeScript checks
- production builds
- database migrations
- application tests
- security audit
- CodeQL
- workflow-specific Windows packaging checks

Windows packaging does not get marked successful merely because source files exist: the workflow must produce and size-check the requested artifacts before upload.

---

## 🚀 Local development

```bash
cd medora-2/medora
corepack enable
pnpm install --frozen-lockfile
pnpm check
pnpm build
pnpm test
```

See `medora-2/medora/LOCAL_SETUP.md` for the current development contract.

---

## 📚 Architecture and operating documents

| Document | Purpose |
|---|---|
| `docs/MEDORA-AI-FABRIC.md` | governed AI architecture |
| `docs/AI-CAPABILITY-REGISTRY.md` | AI capability states and promotion rules |
| `docs/MASTER-AUDIT-2026-08-22-v2.md` | deep production-readiness audit |
| `docs/audits/open-prerequisites-index-2026-08-15.md` | remaining prerequisites |
| `docs/MEDORA-user-manuals-ar-en.md` | bilingual role-based usage |
| `WINDOWS10-PACKAGES.md` | Windows distribution contract |

---

## ✨ Product direction

MEDORA is being evolved toward a **Healthcare Operating System** centered on five strategic layers:

1. **Journey & Workflow Engine** — orchestrate what must happen next.
2. **Longitudinal Health Record + Event Model** — preserve the authorized clinical and operational story.
3. **Insurance + Revenue Cycle Intelligence** — connect eligibility, authorization, claims and financial outcomes.
4. **Universal Work Queue + Exception Center** — turn exceptions into owned, auditable work.
5. **Integration + Rules Platform** — make external connectivity configurable, evidenced and safe.

The long-term goal is a governed intelligence graph connecting the entities and events that healthcare organizations actually operate on — while preserving tenant boundaries, purpose limitation, authorization and provenance.

---

## 📄 License

MIT. See `LICENSE`.

MEDORA is open source software; production deployment remains the responsibility of the deploying organization, including its legal, security, privacy, clinical and regulatory obligations.
