@echo off
REM ============================================================================
REM Kiini - Windows Docker Setup Script
REM ============================================================================
REM This script sets up and runs the Kiini using Docker on Windows
REM Requirements: Docker Desktop for Windows
REM ============================================================================

setlocal enabledelayedexpansion
cd /d "%~dp0"

echo.
echo ============================================================================
echo Kiini - Docker Setup (Windows)
echo ============================================================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not installed or not in PATH
    echo Please install Docker Desktop for Windows from https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo [OK] Docker found:
docker --version

REM Check if Docker daemon is running
docker ps >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker daemon is not running
    echo Please start Docker Desktop
    pause
    exit /b 1
)

echo [OK] Docker daemon is running

echo.
echo ============================================================================
echo Step 1: Building Docker Images
echo ============================================================================
echo.

echo Building Docker images...
docker-compose build

if errorlevel 1 (
    echo [ERROR] Docker build failed
    pause
    exit /b 1
)

echo [OK] Docker images built successfully

echo.
echo ============================================================================
echo Step 2: Starting Docker Containers
echo ============================================================================
echo.

echo Starting containers...
docker-compose up -d

if errorlevel 1 (
    echo [ERROR] Failed to start containers
    pause
    exit /b 1
)

echo [OK] Containers started successfully

echo.
echo ============================================================================
echo Docker Setup Complete!
echo ============================================================================
echo.
echo Services are now running:
echo   Frontend: http://localhost:5173
echo   Backend:  http://localhost:3000
echo   Database: localhost:3306
echo.
echo Useful Docker commands:
echo   View logs:     docker-compose logs -f
echo   Stop services: docker-compose down
echo   Restart:       docker-compose restart
echo.
pause
