@echo off
REM MEDORA — updated installer (Windows)
echo == MEDORA installer ==
where node >nul 2>nul || (echo Node.js 22+ required & exit /b 1)
where npm >nul 2>nul || (echo npm required & exit /b 1)
if not exist .env copy .env.example .env >nul
if "%DATABASE_URL%"=="" set DATABASE_URL=mysql://medora:medora@127.0.0.1:3306/medora
echo == installing dependencies ==
call npm ci --no-audit --no-fund || call npm install --no-audit --no-fund
echo == migrations ==
call npm run db:push
echo == seeds ==
node scripts\seed-delivery-zones.mjs
node scripts\seed-rbac-and-roles.mjs
node scripts\provision-medora.mjs --admin admin:admin
echo == build ==
call npm run build
echo == run: npm run dev  (open http://localhost:3000) ==
