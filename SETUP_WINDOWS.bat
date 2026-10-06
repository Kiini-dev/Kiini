@echo off
REM ============================================================================
REM Kiini - Windows Setup Script
REM ============================================================================
REM This script automates the setup process for Windows users
REM No PowerShell execution policy issues!
REM ============================================================================

setlocal enabledelayedexpansion

echo.
echo ============================================================================
echo Kiini - Windows Setup
echo ============================================================================
echo.

REM Check if pnpm is installed
echo Checking for pnpm installation...
pnpm --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo ERROR: pnpm is not installed or not in PATH
    echo.
    echo Please install pnpm first:
    echo   npm install -g pnpm
    echo.
    pause
    exit /b 1
)

echo pnpm is installed. Proceeding with setup...
echo.

REM Step 1: Install dependencies
echo ============================================================================
echo Step 1: Installing dependencies...
echo ============================================================================
pnpm install
if errorlevel 1 (
    echo.
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Dependencies installed successfully!
echo.

REM Step 2: Build the application
echo ============================================================================
echo Step 2: Building the application...
echo ============================================================================
pnpm build
if errorlevel 1 (
    echo.
    echo ERROR: Build failed
    pause
    exit /b 1
)

echo.
echo Build completed successfully!
echo.

REM Step 3: Summary
echo ============================================================================
echo Setup Complete!
echo ============================================================================
echo.
echo Next steps:
echo   1. Start the server: pnpm start
echo   2. Open your browser: http://localhost:3000
echo   3. Login with your credentials
echo.
echo For development mode, use: pnpm dev
echo.
pause
