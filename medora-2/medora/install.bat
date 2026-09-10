@echo off
REM MEDORA — secure installer (Windows)
echo == MEDORA installer ==
where node >nul 2>nul || (echo Node.js 22+ required & exit /b 1)
where npm >nul 2>nul || (echo npm required & exit /b 1)

if "%DATABASE_URL%"=="" (
  echo DATABASE_URL must be set in the environment before running the installer.
  exit /b 1
)
if "%MEDORA_ADMIN_USERNAME%"=="" (
  echo MEDORA_ADMIN_USERNAME must be set in the environment.
  exit /b 1
)
if "%MEDORA_ADMIN_PASSWORD%"=="" (
  echo MEDORA_ADMIN_PASSWORD must be set in the environment.
  exit /b 1
)

if not exist .env copy .env.example .env >nul
echo == installing dependencies ==
call npm ci --no-audit --no-fund || call npm install --no-audit --no-fund
echo == migrations ==
call npm run db:push
echo == seeds ==
node scripts\seed-delivery-zones.mjs
node scripts\seed-rbac-and-roles.mjs
if exist data\egyptian-drugs.csv (
  node scripts\provision-medora.mjs --drugs data\egyptian-drugs.csv
) else (
  node scripts\provision-medora.mjs
)
echo == build ==
call npm run build
echo == run: npm run dev  (open http://localhost:3000) ==
