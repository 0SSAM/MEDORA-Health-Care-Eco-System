# MEDORA Health Care Eco System

MEDORA is a bilingual healthcare operations platform for pharmacy, clinic, finance, delivery, quality, compliance, identity, and AI-assisted workflows. The repository has been reorganized into a cleaner single-application layout, the public experience has been redesigned, `/demo` has been removed from the shipped surface, and `/api/health` returns real JSON for runtime monitoring.

## What is new in this refresh
- Redesigned public landing experience with a stronger visual narrative and reusable schema-driven content model.
- Cleaned repository structure centered on one primary application layout.
- Local single-branch handover flow documented for a `main`-only future state.
- Static website package for deployment on Vercel, Netlify, or GitHub Pages.
- Windows 10 x64 self-contained package retained for installable delivery.

## Product truth and safety boundaries
- Organization, branch, and jurisdiction are explicit parts of the access boundary.
- Jurisdiction ID `0` is a valid legal scope and must not be treated as missing data.
- The AI assistant is advisory-only and does not replace operator judgment, financial review, or clinical authority.
- browser code is never claimed to prevent OS-level or physical capture absolutely.
- No legal or regulatory certification is claimed unless independently verified outside this repository.

MEDORA does **not** claim that every healthcare connector or regulatory path is production-complete. The platform distinguishes clearly between:
- implemented and tested capabilities,
- implemented foundations that still require external integration or certification,
- planned surfaces.

Sensitive flows remain governed by fail-closed authorization, organization and branch boundaries, and human review for regulated actions.

## Core architecture
- React 19 + Vite + Tailwind CSS
- Wouter routing
- Node.js + Express
- tRPC + Zod
- Drizzle ORM on MySQL/MariaDB-compatible databases
- Vitest + Playwright
- Bilingual Arabic / English UI

## Local setup

MEDORA runs with **zero external configuration** — no MySQL server, no
`.env` file, and no manual seeding. The first `pnpm dev` boots an embedded
MySQL server inside the workspace (one-time binary download, cached in
`.medora-runtime/`), applies all migrations, and provisions the admin
account, RBAC, delivery zones, and the CC0 Egyptian drug catalog (25k+ items).

1. Install Node.js 22+ and pnpm.
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Provision (optional — `pnpm dev` does this automatically):
   ```bash
   pnpm setup
   ```
4. Start development:
   ```bash
   pnpm dev
   ```
5. Open the app and sign in with the seeded administrator:
   `admin` / `admin` (override via `MEDORA_ADMIN_USERNAME` /
   `MEDORA_ADMIN_PASSWORD` before first boot).

All state lives in `.medora-data/` (delete it for a factory reset). Set
`DATABASE_URL` to a MySQL/MariaDB server at any time to bypass the embedded
runtime and use a managed database instead; set `JWT_SECRET` in production.

Legacy manual setup (still supported): copy `.env.example` to `.env`, set
`DATABASE_URL` / `OAUTH_SERVER_URL`, apply the schema with `pnpm db:push`.

## Runtime checks
- Health endpoint: `/api/health`
- Production build:
  ```bash
  pnpm build
  ```
- Type checks:
  ```bash
  pnpm check
  ```
- Tests:
  ```bash
  pnpm test
  pnpm e2e
  ```

## Default desktop bootstrap account
For local packaged desktop bootstraps, the seeded administrative account is:
- username: `admin`
- password: `admin`

Rotate credentials before using the system beyond controlled evaluation.

## Key directories
- `client/src/` – application UI
- `server/` – backend, policies, routers, integrations
- `drizzle/` – schema and migrations
- `deploy/website-static/` – static deployable marketing site
- `docs/` – architecture, deployment, validation, and governance notes
- `HANDOVER.md` – main-only branch unification and push instructions

## Repository
GitHub: https://github.com/0SSAM/MEDORA-Health-Care-Eco-System
