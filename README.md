# MEDORA | ميدورا — Health Care Ecosystem

> **مجاني بالكامل ومفتوح المصدر** — Free forever, open source (MIT).
> A governed, bilingual (AR/EN) healthcare operations platform: **CRM · ERP · HR · POS · Pharmacy · Insurance · Delivery · AI Review** — built with React 19, TypeScript, tRPC, Drizzle ORM & MySQL/MariaDB.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![tRPC](https://img.shields.io/badge/tRPC-11-2596be.svg)](https://trpc.io/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

---

## الوحدات — Modules

| Module | tRPC Router (verified) | Core tables (verified in `drizzle/schema.ts`) |
|---|---|---|
| **CRM** | `organizations`, `promotions` | `customer_profiles`, `customer_care_cases`, `customer_care_tasks`, `customer_care_satisfaction` |
| **ERP** | `erp`, `procurement`, `anti-fraud` | `sales`, `sale_items`, `sales_returns`, `held_invoices`, `purchase_orders`, `purchase_order_lines`, `reorder` |
| **HR** | `operations`, `reports` | `employee_profiles`, `employee_attendance`, `employee_leave_requests`, `approved_leave`, `hr_contracts` |
| **POS & Inventory** | `operations` | `catalog_items`, `catalog_sync_queue`, `products` (SKU/barcode), `inventory`, `inventory_batches` (FEFO) |
| **Pharmacy / Healthcare** | `egypt-healthcare`, `insurance`, `nda`, `policyKnowledge` | `healthcare_encounters`, `healthcare_clinical_orders`, `healthcare_admissions`, `e_prescriptions` |
| **Insurance & Contracts** | `insurance`, `anti-fraud` | `insurance_payer_contracts`, `insurance_requests`, `insurance_preauthorizations`, `insurance_claims`, `insurance_claim_lines`, `insurance_appeals` |
| **Delivery** | `delivery` | `delivery_zones`, `delivery_drivers`, `delivery_orders`, `delivery_tracking_events` |
| **RBAC / Admin** | `rbac`, `adminAccount` | `rbac_permissions`, `rbac_roles`, `rbac_role_permissions`, `rbac_user_roles`, `internal_credentials`, `internal_sessions` |
| **AI Auto Review** | `aiReview`, `assistant`, `ai-insights`, `ai-governance`, `kpi` | `ai_review_runs`, `ai_review_findings`, `ai_review_recommendations` |
| **Backup / Govern** | `backup`, `system`, `notifications`, `regional`, `secondaryModules` | `backup_policies`, `backup_runs`, `audit_logs`, `scheduled_jobs` |

## Installation — التركيب

**Option A — Docker (recommended):**
```bash
docker compose up -d --build
# open http://localhost:3000
```

**Option B — Manual:**
```bash
npm ci
cp .env.example .env          # ← اضبط DATABASE_URL
npm run db:push               # drizzle-kit generate && migrate
DATABASE_URL="mysql://medora:medora@127.0.0.1:3306/medora" \
  node scripts/seed-delivery-zones.mjs
DATABASE_URL="mysql://medora:medora@127.0.0.1:3306/medora" \
  node scripts/seed-rbac-and-roles.mjs
DATABASE_URL="mysql://medora:medora@127.0.0.1:3306/medora" \
  node scripts/provision-medora.mjs --admin admin:admin --drugs data/egyptian-drugs.csv
npm run dev
```

- **Admin account (created by provision):** `admin` / `admin` — تغيير الاسم وكلمة المرور من حساب الأدمن فقط (`adminAccount.changeUsername/changePassword`).
- **Egyptian drug database:** 25,094 records (CC0) — imported by `provision-medora.mjs`.
- **Delivery zones:** 8 Egyptian governorates seeded.

## Environment — متغيرات البيئة

See [`.env.example`](.env.example): `DATABASE_URL`, `PORT`, `VITE_APP_TITLE`, `VITE_ANALYTICS_ENDPOINT`, `VITE_ANALYTICS_WEBSITE_ID`, Forge/S3 keys (optional, for backups & file storage).

## Architecture — البنية

```
client/  React 19 SPA (wouter, tailwind) + pages: Home, Delivery, AdminConsole, Login…
server/  Express + tRPC;  _core/ (context, trpc, heartbeat, llm), routers/, domain/, scheduled/
drizzle/ MySQL schema (121+ tables) — migrations in migrations/
shared/  types, operations-hub, gp-max/
scripts/ seeds & installers (idempotent)
docs/    audits, upgrade bundles, build targets
```

Every sensitive procedure runs through `assertSessionScope` (organization membership), optional `assertPermission` (RBAC `module.action`), zod input validation, scrypt password hashing, and append-only audit logs.

## Backups & Sync — النسخ الاحتياطي والمزامنة

- **Backup:** `backup` router + `server/scheduled/backups.ts` heartbeat handler + `backup_policies` (cron, ≥15 min gap validation) + `backup_runs` ledger + policy/restore/audit procedures (see [audit](docs/MEDORA-BACKUP-SYNC-AUDIT-2026-08-28.md)).
- **Sync:** `catalog_items` ↔ `catalog_sync_queue` (pending/acknowledged item sync). Full offline/P2P sync is **not yet implemented** — see audit.

## Roadmap / Contributing / Security

[CONTRIBUTING.md](CONTRIBUTING.md) · [SECURITY.md](SECURITY.md) · [Contract Dispensing Audit](docs/MEDORA-CONTRACT-DISPENSING-AUDIT-2026-08-28.md)

## License — الترخيص

**[MIT](LICENSE)** — completely free and open source. Use, modify, distribute, sell, self-host — no strings attached. Built with ❤️ for the Egyptian & regional healthcare market.
