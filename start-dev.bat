@echo off
setlocal

set ROOT=%~dp0
set LOGDIR=%ROOT%logs

echo ========================================
echo Starting Speech Therapy full stack app...
echo ========================================
echo.

if not exist "%LOGDIR%" mkdir "%LOGDIR%"
del /q "%LOGDIR%\frontend.log" 2>nul
del /q "%LOGDIR%\backend.log" 2>nul

where node >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Node.js is not installed or not in PATH.
  echo Install Node.js LTS from https://nodejs.org and try again.
  pause
  exit /b 1
)

echo [1/3] Checking frontend dependencies...
if not exist "%ROOT%node_modules" (
  echo Installing frontend dependencies...
  call npm install
  if errorlevel 1 (
    echo [ERROR] Frontend dependency install failed.
    pause
    exit /b 1
  )
)

echo [2/3] Checking backend dependencies...
if not exist "%ROOT%backend\node_modules" (
  echo Installing backend dependencies...
  pushd "%ROOT%backend"
  call npm install
  if errorlevel 1 (
    echo [ERROR] Backend dependency install failed.
    popd
    pause
    exit /b 1
  )
  popd
)

echo [3/3] Launching backend and frontend in separate windows...
start "Speech Backend" cmd /k "cd /d ""%ROOT%backend"" && npm run dev 1>>""%LOGDIR%\backend.log"" 2>&1"
start "Speech Frontend" cmd /k "cd /d ""%ROOT%"" && npm run dev -- --host localhost --port 5173 --strictPort 1>>""%LOGDIR%\frontend.log"" 2>&1"

echo.
echo App launch initiated.
echo Frontend URL: http://localhost:5173
echo Backend URL:  http://localhost:3001
echo Frontend log: %LOGDIR%\frontend.log
echo Backend log:  %LOGDIR%\backend.log
echo.
echo Keep both opened terminal windows running.
pause
