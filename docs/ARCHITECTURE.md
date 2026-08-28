# MEDORA — Architecture

**واجهة معمارية للنظام — factual overview of how MEDORA is built.**

## 1. Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 22+ (ESM, `"type": "module"`) |
| Server entry | `server/_core/index.ts` — `tsx watch` in dev; bundled by esbuild to `dist/` for production |
| Frontend | React 19 + Vite + Tailwind CSS 4 + Radix UI |
| API | tRPC (`server/routers.ts` → `appRouter`), HTTP endpoint `/api/trpc/*` |
| ORM / DB | Drizzle ORM + MySQL/MariaDB (10.6+; Docker: mariadb:10.11) |
| Validation | Zod (tRPC input schemas) |
| Tests | Vitest (unit) + Playwright (e2e) |

## 2. Process model

- `dotenv/config` loads `.env` at server start (`server/_core/index.ts:1`).
- Dev: `npm run dev` (tsx watch). Prod: `npm run build` → `npm start` (`node dist/index.js`).
- Port from `process.env.PORT` (default 3000).

## 3. Frontend routes (`client/src/App.tsx`)

`/login`, `/workspace`, `/pos`, `/sales`, `/operations`, `/finance`, `/admin`, `/delivery`, `/` (Welcome), 404.
Key pages: `Welcome.tsx`, `Login.tsx`, `Delivery.tsx`, `AdminConsole.tsx`, `ComponentShowcase.tsx`.

## 4. Server modules (tRPC routers)

`system`, `nda`, `erp`, `regional`, `organizations`, `notifications`, `reports`, `insurance`, `promotions`,
`egyptHealthcare`, `operations`, `aiGovernance`, `aiInsights`, `antiFraud`, `assistant`, `backup`,
`policyKnowledge`, `procurement`, `secondaryModules`, `kpi`, `rbac`, `aiReview`, `delivery`, `adminAccount`.

## 5. Data layer

- Core schema: `drizzle/schema.ts` (+ extension schemas: `medora-delivery-schema.ts`, `medora-upgrade-schema.ts`, `gp-max-schema.ts`).
- 122 tables covering: customers/CRM, sales/POS (`sales`, `sale_items`, `held_invoices`, `products`, `inventory`, `inventory_batches` with FEFO), procurement (`purchase_orders`, `purchase_order_lines`, `reorder`), HR (`employee_profiles`, `employee_attendance`, `employee_leave_requests`, `approved_leave`, `on_leave`), healthcare (`healthcare_encounters`, `healthcare_clinical_orders`, `healthcare_admissions`, `e_prescriptions`), insurance (`insurance_payer_contracts`, `insurance_claims`, `insurance_preauthorizations`), delivery (`delivery_zones`, `delivery_drivers`, `delivery_orders`, `delivery_tracking_events`), RBAC (`rbac_roles`, `rbac_permissions`, `rbac_user_roles`), AI review (`ai_review_runs`, `ai_review_recommendations`), GP MAX (`gp_max_layers`, `gp_max_checkpoints`, `gp_max_assessments`, `gp_max_recommendations`).
- Migrations: `npm run db:push` (drizzle-kit generate + migrate).

## 6. Auth & security

- Passwords: scrypt (N=16384, r=8, p=1), 64-byte key, `scrypt$16384$8$1$salt$hash` format (`server/domain/internal-auth.ts`).
- Session cookie `aldo_internal_session`, 8h TTL; session token hashed via HMAC; 5 failed attempts → 15-min lockout.
- RBAC: every guarded action calls `assertPermission` (org-scoped); protected tRPC procedures chain `authenticatedProcedure.use(requireCurrentNda)` (`server/_core/trpc.ts`).
- Admin account changes (username/password) revoke all existing sessions (`adminAccount` router).
- Audit records signed with `AUDIT_SIGNING_KEY`.

## 7. AI & automation

- `aiReview` router: daily job (cron `5 0 * * *` in `scheduled_jobs`) evaluates 11 reference tables; produces 0–100 scores per module and Arabic markdown reports with P0–P3 recommendations; `resolveRecommendation` workflow.
- `assistant` and `aiInsights` routers provide conversational assistance and insights.

## 8. Backup & sync

- `backup` router: policy-based encrypted backups, optional S3/Forge presigned URLs, scheduled cron validation.
- Offline-first conflict resolution: not yet implemented (documented gap — `docs/MEDORA-BACKUP-SYNC-AUDIT-2026-08-28.md`).

## 9. Delivery state machine

`created → assigned → picked_up → in_transit → delivered` (terminal: `cancelled`, `failed`); order auto-assignment to first free driver; tracking events appended per state change.

## 10. GP MAX (growth audit, scaffold)

Layer framework L0–L7 with checkpoints — tables in `drizzle/gp-max-schema.ts`, seed in `scripts/seed-gp-max.mjs`, plan in `docs/GP-MAX-PLAN-2026-08-28.md`. Router/UI wiring and full 140+ checkpoint import are the next step.
