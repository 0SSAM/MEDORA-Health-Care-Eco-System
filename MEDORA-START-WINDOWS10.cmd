@echo off
setlocal EnableExtensions
cd /d "%~dp0"

title MEDORA Healthcare Platform
set "MEDORA_ROOT=%~dp0"
set "RUNTIME=%MEDORA_ROOT%runtime"
set "NODE_EXE=%MEDORA_ROOT%runtime\node\node.exe"
set "SERVER=%MEDORA_ROOT%dist\index.js"
set "PORT=3000"

if not exist "%NODE_EXE%" (
  echo.
  echo MEDORA runtime is missing.
  echo This launcher expects the packaged Windows runtime beside this file.
  echo.
  pause
  exit /b 1
)

if not exist "%SERVER%" (
  echo.
  echo MEDORA application files are missing.
  echo Please use the complete MEDORA Windows package.
  echo.
  pause
  exit /b 1
)

set "NODE_ENV=production"
set "MEDORA_DESKTOP_MODE=1"
set "PORT=%PORT%"

start "MEDORA Server" /min "%NODE_EXE%" "%SERVER%"

set /a WAIT=0
:WAIT_FOR_MEDORA
powershell -NoProfile -ExecutionPolicy Bypass -Command "$c=New-Object Net.Sockets.TcpClient; try {$c.Connect('127.0.0.1',%PORT%); exit 0} catch {exit 1} finally {$c.Dispose()}" >nul 2>&1
if %errorlevel%==0 goto OPEN_MEDORA
set /a WAIT+=1
if %WAIT% GEQ 60 goto START_FAILED
timeout /t 1 /nobreak >nul
goto WAIT_FOR_MEDORA

:OPEN_MEDORA
start "" "http://127.0.0.1:%PORT%/"
exit /b 0

:START_FAILED
echo.
echo MEDORA did not start within 60 seconds.
echo Check the MEDORA Server window/logs for details.
echo.
pause
exit /b 1
