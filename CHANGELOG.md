## 2026-08-28 — ICD-11 integrated reference data (NLM clinicaltables v3)
- استيعاب فعلي لرموز ICD-11 من واجهة NLM العامة في icd11_codes (is_starter=0)، سكربت scripts/icd11-import-nlm.mjs، تصدير CSV.
- ربط: .env.example (ICD11_SOURCE/ICD11_BASE_URL/ICD_API_*), README, docs/ICD11-DATA-INTEGRATION-2026-08-28.md.

## 2026-08-28 — PWA installable + ICD-11 dataset import path
- PWA: manifest.webmanifest + sw.js + أيقونات 192/512 + ربط index.html/main.tsx (تثبيت كتطبيق + عمل دون اتصال).
- توثيق التركيب: docs/PWA-INSTALL-2026-08-28.md.
- استيراد موسّع لبيانات ICD-11 عند توفر مصدر كامل (HL7 terminology) مع إبقاء المجموعة الابتدائية.

## 2026-08-28 — ICD-11 module + sync execution + full live verification
- إضافة وحدة ICD-11: مخطط drizzle، زراعة (started + full ingest عبر --data)، موجه tRPC (stats/search/getByCode/listChapters)، صفحة /icd11 عربية RTL، ربط e_prescriptions (icd11_code/icd11_version).
- تنفيذ المزامنة: shared/sync-engine.ts (Outbox + LWW)، drizzle/sync-schema.ts، server/routers/sync.ts (pull/push/stats)، scripts/seed-sync.mjs.
- اختبار تحقق بصري حي كامل للمسارات (تسجيل دخول + كل القطاعات + ICD-11 + GP MAX) ولقطات شاشة موثقة.

# Changelog — سجل التغييرات

All notable changes to MEDORA. Format based on [Keep a Changelog](https://keepachangelog.com/).
Single-branch workflow: all work lands on `main` (no side branches).

## [1.1.0] — 2026-08-28

### Added
- **GP MAX growth-audit module (proposals 1–4)**
  - Expanded checkpoint library: 96 checkpoints across layers L0–L7 (`scripts/seed-gp-max.mjs`).
  - KPI calculator: per-layer + overall weighted 0–100 scores (`shared/gp-max-kpi.ts`).
  - tRPC router `gpMax`: `listLayers`, `listCheckpoints`, `runAssessment`, `listAssessments`, `latestAssessment`, `generate30DayPlan`, `resolveRecommendation` (`server/routers/gp-max.ts`).
  - Arabic RTL page `/gp-max` with interactive audit, results, recommendations, and 30-day plan generator (`client/src/pages/GpMax.tsx`).
  - Schema tables `gp_max_*` (DDL in `scripts/seed-gp-max.mjs`).
- **Prescription dispense workflow (closes audit P0 gap, contract-dispensing stage 6)**
  - `dispensing` tRPC router: `recordDispense`, `listDispenses`, `recordReturn`.
  - `prescription_dispenses` table via `scripts/seed-dispensing.mjs`.
- **Docs** — `docs/GP-MAX-EXECUTION-2026-08-28.md`, `docs/DISPENSING-IMPLEMENTATION-2026-08-28.md`, `docs/SYNC-DESIGN-2026-08-28.md` (design only).

### Fixed
- `server/routers/ai-review.ts`: `getDbOrThrow` called itself recursively (infinite recursion at runtime) — now calls `getDb()` from `../db` and checks null.

### Notes
- The original GP MAX sheet (140+ checkpoints) was never provided in this session; the 96-point library is a standard framework replacement and will be superseded when the sheet is ingested.
- Offline-first sync is design-only at this stage.
- Desktop/mobile installers (exe/apk/ipa) still blocked by environment (no Electron / Android SDK / Xcode).

## [1.0.0] — 2026-08-28

### Added
- **Delivery module** — `delivery_zones`, `delivery_drivers`, `delivery_orders`, `delivery_tracking_events`; tRPC router `delivery` (14 procedures) with auto-assignment and full state machine; Arabic RTL UI at `/delivery`; seed for 8 Egyptian zones.
- **Admin account management** — `adminAccount` router: change username/password **admin-only**, uniqueness check, scrypt hashing, session revocation on change.
- **RBAC** — `rbac` router (9 procedures), 73 permissions × 10 roles, `seed-rbac-and-roles.mjs`.
- **AI daily review** — `aiReview` router (5 procedures), 11 reference tables, scores 0–100, Arabic reports, P0–P3 recommendations, daily schedule.
- **Egyptian drug database** — `data/egyptian-drugs.csv` (25,094 records, CC0-1.0) + `scripts/provision-medora.mjs`.
- **Open-source release (MIT)** — `LICENSE`, `docs/OPEN-SOURCE-COMMITMENT-2026-08-28.md`, `package.json` license=MIT, `private` removed.
- **Community & docs** — bilingual `README.md`, `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, issue/PR templates, audit reports, architecture doc, changelog.
- **CI/CD & installers** — `ci.yml`, `release.yml`, `install.sh` (Linux/macOS), `install.bat` (Windows), `Dockerfile`, `docker-compose.yml`, complete `.env.example`, `engines.node >=22`.

### Changed
- `client/src/pages/ComponentShowcase.tsx`: demo menu item `Subscription` → `Settings`.
- Repository metadata: bilingual description, topics, Issues/Wiki/Projects/Discussions enabled.
