@echo off
title Yatrify Nepal - Desktop Runner
echo ========================================================
echo   ___ ____ ____ ___ _ _ _ _ _ ___ _ _ 
echo  \  / |--\  |   |  |   | \_/   |   |  
echo   \/  |  \  |   |  |__ |  |    |   |__ 
echo ========================================================
echo.
echo [Yatrify] Checking Node.js and NPM...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/ to run Yatrify.
    pause
    exit /b
)

echo [Yatrify] Node.js found. Installing dependencies...
call npm install --no-audit --no-fund

echo.
echo [Yatrify] Launching Yatrify on your browser...
start http://localhost:3000

echo [Yatrify] Starting the live development server...
call npm run dev
pause
