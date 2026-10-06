@echo off
REM ============================================================================
REM Kiini - Windows Development Server Startup
REM ============================================================================

setlocal enabledelayedexpansion
cd /d "%~dp0"

echo.
echo ============================================================================
echo Kiini - Development Server
echo ============================================================================
echo.

REM Check if pnpm is installed, if not use npm
pnpm --version >nul 2>&1
if errorlevel 1 (
    set PKG_MANAGER=npm
) else (
    set PKG_MANAGER=pnpm
)

echo [INFO] Using package manager: %PKG_MANAGER%
echo.
echo Starting development server...
echo Frontend will be available at: http://localhost:5173
echo Backend will be available at: http://localhost:3000
echo.

if "%PKG_MANAGER%"=="pnpm" (
    call pnpm run dev
) else (
    call npm run dev
)

pause
