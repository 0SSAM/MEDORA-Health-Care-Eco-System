#!/usr/bin/env bash
# MEDORA — secure installer (Linux/macOS)
set -euo pipefail

echo "== MEDORA installer =="
command -v node >/dev/null || { echo "Node.js 22+ required"; exit 1; }
command -v npm >/dev/null || { echo "npm required"; exit 1; }

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL must be set in the environment before running the installer."
  exit 1
fi
if [[ -z "${MEDORA_ADMIN_USERNAME:-}" || -z "${MEDORA_ADMIN_PASSWORD:-}" ]]; then
  echo "MEDORA_ADMIN_USERNAME and MEDORA_ADMIN_PASSWORD must be set in the environment."
  exit 1
fi

[ -f .env ] || cp .env.example .env

echo "== installing dependencies =="
npm ci --no-audit --no-fund || npm install --no-audit --no-fund
echo "== migrations =="
npm run db:push
echo "== seeds (zones + rbac + admin/drugs) =="
node scripts/seed-delivery-zones.mjs
node scripts/seed-rbac-and-roles.mjs
if [[ -f data/egyptian-drugs.csv ]]; then
  node scripts/provision-medora.mjs --drugs data/egyptian-drugs.csv
else
  node scripts/provision-medora.mjs
fi
echo "== build =="
npm run build
echo "== run: npm run dev  (open http://localhost:3000) =="
