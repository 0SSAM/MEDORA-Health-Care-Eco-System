@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title MEDORA Healthcare Platform
set "ROOT=%~dp0"
set "RUNTIME=%ROOT%runtime"
set "NODE_EXE=%RUNTIME%\node\node.exe"
set "DBROOT=%RUNTIME%\mariadb"
set "DBDATA=%DBROOT%\data"
set "DBD=%DBROOT%\bin\mariadbd.exe"
set "DBINIT=%DBROOT%\bin\mariadb-install-db.exe"
set "DBCLI=%DBROOT%\bin\mariadb.exe"
set "DBPORT=33306"
set "APPPORT=3000"
set "DBNAME=medora_local"
set "DBUSER=medora_local"
set "DBPASSFILE=%RUNTIME%\database-password.txt"
set "SERVER=%ROOT%dist\index.js"
if not exist "%NODE_EXE%" goto MISSING
if not exist "%SERVER%" goto MISSING
if not exist "%DBD%" goto MISSING
if not exist "%DBINIT%" goto MISSING
if not exist "%DBCLI%" goto MISSING
if not exist "%RUNTIME%" mkdir "%RUNTIME%"
if not exist "%DBDATA%\mysql" (
  powershell -NoProfile -ExecutionPolicy Bypass -Command "[guid]::NewGuid().ToString('N') | Set-Content -NoNewline -Encoding ascii '%DBPASSFILE%'"
  set /p DBPASS=<"%DBPASSFILE%"
  "%DBINIT%" --datadir="%DBDATA%" --password="%DBPASS%" --silent
  if errorlevel 1 goto DB_FAILED
) else (
  if not exist "%DBPASSFILE%" goto DB_FAILED
  set /p DBPASS=<"%DBPASSFILE%"
)
start "MEDORA Database" /min "%DBD%" --datadir="%DBDATA%" --port=%DBPORT% --bind-address=127.0.0.1 --skip-name-resolve --max_connections=80 --console
set /a WAIT=0
:WAIT_DB
powershell -NoProfile -ExecutionPolicy Bypass -Command "$c=New-Object Net.Sockets.TcpClient; try {$c.Connect('127.0.0.1',%DBPORT%); exit 0} catch {exit 1} finally {$c.Dispose()}" >nul 2>&1
if %errorlevel%==0 goto CONFIG_DB
set /a WAIT+=1
if %WAIT% GEQ 60 goto DB_FAILED
timeout /t 1 /nobreak >nul
goto WAIT_DB
:CONFIG_DB
set "MYSQL_PWD=%DBPASS%"
"%DBCLI%" --protocol=tcp -h127.0.0.1 -P%DBPORT% -uroot -e "CREATE DATABASE IF NOT EXISTS `%DBNAME%` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; CREATE USER IF NOT EXISTS '%DBUSER%'@'127.0.0.1' IDENTIFIED BY '%DBPASS%'; ALTER USER '%DBUSER%'@'127.0.0.1' IDENTIFIED BY '%DBPASS%'; GRANT ALL PRIVILEGES ON `%DBNAME%`.* TO '%DBUSER%'@'127.0.0.1'; FLUSH PRIVILEGES;"
if errorlevel 1 goto DB_FAILED
set "DATABASE_URL=mysql://%DBUSER%:%DBPASS%@127.0.0.1:%DBPORT%/%DBNAME%"
set "NODE_ENV=production"
set "MEDORA_DESKTOP_MODE=1"
set "PORT=%APPPORT%"
set "JWT_SECRET=%DBPASS%%DBPASS%"
start "MEDORA Server" /min "%NODE_EXE%" "%SERVER%"
set /a WAIT=0
:WAIT_APP
powershell -NoProfile -ExecutionPolicy Bypass -Command "$c=New-Object Net.Sockets.TcpClient; try {$c.Connect('127.0.0.1',%APPPORT%); exit 0} catch {exit 1} finally {$c.Dispose()}" >nul 2>&1
if %errorlevel%==0 goto OPEN
set /a WAIT+=1
if %WAIT% GEQ 90 goto APP_FAILED
timeout /t 1 /nobreak >nul
goto WAIT_APP
:OPEN
start "" "http://127.0.0.1:%APPPORT%/"
exit /b 0
:MISSING
echo MEDORA Windows package is incomplete. Required runtime/application files are missing.
pause
exit /b 1
:DB_FAILED
echo MEDORA local database could not be initialized or started.
pause
exit /b 1
:APP_FAILED
echo MEDORA did not start within 90 seconds. Check the MEDORA Server window.
pause
exit /b 1
