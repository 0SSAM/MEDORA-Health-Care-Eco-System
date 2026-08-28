#!/usr/bin/env bash
# MEDORA — updated installer (Linux/macOS)
set -euo pipefail
echo "== MEDORA installer =="
command -v node >/dev/null || { echo "Node.js 22+ required"; exit 1; }
command -v npm >/dev/null || { echo "npm required"; exit 1; }
[ -n "${DATABASE_URL:-}" ] || export DATABASE_URL="mysql://medora:medora@127.0.0.1:3306/medora"
[ -f .env ] || cp .env.example .env
echo "DATABASE_URL=$DATABASE_URL" >> .env 2>/dev/null || true
echo "== installing dependencies =="
npm ci --no-audit --no-fund || npm install --no-audit --no-fund
echo "== migrations =="
npm run db:push
echo "== seeds (zones + rbac + admin/drugs) =="
node scripts/seed-delivery-zones.mjs
node scripts/seed-rbac-and-roles.mjs
[ -f data/egyptian-drugs.csv ] && node scripts/provision-medora.mjs --admin admin:admin --drugs data/egyptian-drugs.csv || node scripts/provision-medora.mjs --admin admin:admin
echo "== build =="
npm run build
echo "== run: npm run dev  (open http://localhost:3000) =="
