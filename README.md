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
1. Install Node.js 22+ and pnpm.
2. Create a MySQL or MariaDB database.
3. Copy `.env.example` to `.env` and set values such as `DATABASE_URL`, `JWT_SECRET`, and `OAUTH_SERVER_URL`.
4. Install dependencies:
   ```bash
   pnpm install --frozen-lockfile
   ```
5. Apply schema:
   ```bash
   pnpm db:push
   ```
6. Start development:
   ```bash
   pnpm dev
   ```

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
