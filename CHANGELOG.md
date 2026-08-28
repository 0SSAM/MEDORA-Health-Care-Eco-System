# Changelog — سجل التغييرات

All notable changes to MEDORA. Format based on [Keep a Changelog](https://keepachangelog.com/).
This project adheres to single-branch workflow: all work lands on `main` (no side branches).

## [1.0.0] — 2026-08-28

### Added
- **Delivery module** — `delivery_zones`, `delivery_drivers`, `delivery_orders`, `delivery_tracking_events`; tRPC router `delivery` (14 procedures) with auto-assignment and full state machine (`created → assigned → picked_up → in_transit → delivered`, plus `cancelled`/`failed`); Arabic RTL UI at `/delivery`; seed for 8 Egyptian zones.
- **Admin account management** — `adminAccount` router: change username/password **admin-only**, uniqueness check, scrypt hashing, session revocation on change.
- **RBAC** — `rbac` router (9 procedures), 73 permissions × 10 roles, `seed-rbac-and-roles.mjs`; org admins auto-assigned `org_admin`.
- **AI daily review** — `aiReview` router (5 procedures): auto-reviews 11 reference tables, scores 0–100 per module, Arabic markdown report with P0–P3 recommendations, persisted in `ai_review_runs` / `ai_review_recommendations`, daily schedule via `scheduled_jobs`.
- **Egyptian drug database** — `data/egyptian-drugs.csv` (25,094 records, CC0-1.0) + `scripts/provision-medora.mjs` (admin provisioning + import).
- **Open-source release (MIT)** — `LICENSE`, `docs/OPEN-SOURCE-COMMITMENT-2026-08-28.md`, `package.json` license=MIT, `private` removed.
- **Community & docs** — bilingual `README.md`, `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, issue/PR templates, audit reports (contract dispensing, backup/sync), upload bundle docs.
- **Installers** — `install.sh` (Linux/macOS), `install.bat` (Windows), `Dockerfile`, `docker-compose.yml` (MariaDB 10.11 + app), `.env.example`.

### Changed
- `client/src/pages/ComponentShowcase.tsx`: demo menu item `Subscription` renamed to `Settings` (free/open-source alignment).
- Repository metadata: bilingual description, topics, Issues/Wiki/Projects/Discussions enabled.

### Notes
- Base commit: `11255f1` — bundle commits: `7341f6f` (full bundle), `3d468ac` (cleanup), `5ced465` (open-source commitment & redesign), `dd7d361` (bilingual README).
- GP MAX (growth-audit module L0–L7) scaffolded — see `drizzle/gp-max-schema.ts`, `scripts/seed-gp-max.mjs`, `docs/GP-MAX-PLAN-2026-08-28.md`; full 140+ checkpoints import pending (sheets not yet ingested).
