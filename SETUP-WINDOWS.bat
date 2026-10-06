@echo off
REM ============================================================================
REM Kiini - Windows Setup Script
REM ============================================================================
REM This script sets up the Kiini application on Windows
REM Requirements: Node.js 22+, npm or pnpm, Git
REM ============================================================================

setlocal enabledelayedexpansion
cd /d "%~dp0"

echo.
echo ============================================================================
echo Kiini - Windows Setup
echo ============================================================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js 22+ from https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js found: 
node --version

REM Check if pnpm is installed, if not use npm
pnpm --version >nul 2>&1
if errorlevel 1 (
    echo [INFO] pnpm not found, will use npm
    set PKG_MANAGER=npm
) else (
    echo [OK] pnpm found:
    pnpm --version
    set PKG_MANAGER=pnpm
)

echo.
echo ============================================================================
echo Step 1: Installing Dependencies
echo ============================================================================
echo.

if "%PKG_MANAGER%"=="pnpm" (
    echo Running: pnpm install
    call pnpm install
) else (
    echo Running: npm install
    call npm install
)

if errorlevel 1 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)

echo [OK] Dependencies installed successfully

echo.
echo ============================================================================
echo Step 2: Setting up Environment Variables
echo ============================================================================
echo.

if not exist ".env" (
    echo Creating .env file from .env.example...
    if exist ".env.example" (
        copy .env.example .env >nul
        echo [OK] .env file created
    ) else (
        echo [WARNING] .env.example not found, creating basic .env
        (
            echo DATABASE_URL=mysql://user:password@localhost:3306/kiini-one-hub-total-control
            echo JWT_SECRET=your-secret-key-change-this-in-production
            echo NODE_ENV=development
            echo FRONTEND_URL=http://localhost:5173
            echo BACKEND_URL=http://localhost:3000
        ) > .env
    )
) else (
    echo [OK] .env file already exists
)

echo.
echo ============================================================================
echo Step 3: Database Setup
echo ============================================================================
echo.

echo [INFO] Please ensure your database is running
echo [INFO] Update .env with your database connection string
echo.

if "%PKG_MANAGER%"=="pnpm" (
    echo Running: pnpm run db:push
    call pnpm run db:push
) else (
    echo Running: npm run db:push
    call npm run db:push
)

if errorlevel 1 (
    echo [WARNING] Database setup may have failed
    echo Please check your database connection in .env
)

echo.
echo ============================================================================
echo Step 4: Building the Application
echo ============================================================================
echo.

if "%PKG_MANAGER%"=="pnpm" (
    echo Running: pnpm run build
    call pnpm run build
) else (
    echo Running: npm run build
    call npm run build
)

if errorlevel 1 (
    echo [ERROR] Build failed
    pause
    exit /b 1
)

echo [OK] Build completed successfully

echo.
echo ============================================================================
echo Setup Complete!
echo ============================================================================
echo.
echo To start the development server, run:
echo   Windows: npm run dev  (or pnpm run dev)
echo.
echo To start the production server, run:
echo   Windows: npm run start  (or pnpm run start)
echo.
echo Default URLs:
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:3000
echo.
echo For Docker setup, see SETUP-DOCKER.md
echo For more information, see README.md
echo.
pause
