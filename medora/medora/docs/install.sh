#!/usr/bin/env bash
set -e
echo "MEDORA install - MariaDB + migrations + seeds"
npm ci --prefix . || npm install --prefix .
echo "شغّل: npm run db:push ثم node scripts/seed-delivery-zones.mjs و node scripts/seed-rbac-and-roles.mjs"
