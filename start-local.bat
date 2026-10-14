@echo off
setlocal EnableExtensions
title E-INVORA - Local Server
rem Always work from the folder this file lives in
cd /d "%~dp0"

echo ==============================================
echo   E-INVORA - starting your website locally
echo ==============================================
echo.

rem ---- 1. Check Node.js and npm ----
where node >nul 2>nul
if errorlevel 1 (
  echo [PROBLEM] Node.js is not installed or not on your PATH.
  echo   1. Download the LTS version from https://nodejs.org
  echo   2. Install it, then CLOSE this window and double-click start-local.bat again.
  echo.
  pause
  exit /b 1
)
where npm >nul 2>nul
if errorlevel 1 (
  echo [PROBLEM] npm was not found. Re-install Node.js from https://nodejs.org and try again.
  echo.
  pause
  exit /b 1
)
for /f "delims=" %%v in ('node -v') do set NODE_VER=%%v
echo Node.js found: %NODE_VER%
echo (Node 20.19 or newer, or 22.12 or newer, is required.)
echo.

rem ---- 2. Already running? Then just open it ----
curl -s http://localhost:3000/api/health 2>nul | findstr /C:"E-INVORA" >nul 2>nul
if not errorlevel 1 (
  echo E-INVORA is already running at http://localhost:3000
  start "" http://localhost:3000
  echo Opened it in your browser. You can close this window.
  timeout /t 5 >nul
  exit /b 0
)

rem ---- 3. Install packages the first time (or if they are missing) ----
if not exist "node_modules\" (
  echo Installing required packages. This can take a few minutes the first time...
  call npm install --no-audit --no-fund
  if errorlevel 1 (
    echo.
    echo [PROBLEM] npm install failed. Check your internet connection and read the messages above.
    echo   Tip: delete the node_modules folder and run this file again.
    echo.
    pause
    exit /b 1
  )
  echo.
)

rem ---- 4. Create .env from the example on first run ----
if not exist ".env" (
  if exist ".env.example" (
    copy /y ".env.example" ".env" >nul
    echo Created .env from .env.example. Edit .env later to change settings.
    echo.
  )
)

rem ---- 5. Start the server (it opens the browser by itself on the correct port) ----
set OPEN_BROWSER=1
echo Starting the server. Keep this window open while you use the website.
echo To stop the server press Ctrl+C in this window, or just close it.
echo.
echo If this is your first time, the owner setup key is printed below.
echo Look for the line starting with [AUTH].
echo.
call npm run dev

echo.
echo ----------------------------------------------
echo The server has stopped. Scroll up to read any error message.
echo ----------------------------------------------
pause
endlocal
