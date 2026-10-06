@echo off
REM Database Diagnostics on Windows
REM Run with: run-diagnostics.bat

echo.
echo ==================================================
echo Database Diagnostics for Kiini
echo ==================================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not installed or not in PATH
    echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo [1/5] Checking Docker containers...
docker ps --filter "name=kiini" --format "table {{.Names}}\t{{.Status}}"
echo.

REM Check if database container is running
docker ps --filter "name=kiini-one-hub-total-control_db" --quiet >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Database container is running
    echo.
    
    echo [2/5] Database logs (last 20 lines):
    docker logs --tail 20 kiini-one-hub-total-control_db
    echo.
) else (
    echo [WARNING] Database container is not running
    echo. 
)

REM Check if app container is running
docker ps --filter "name=kiini-one-hub-total-control_app" --quiet >nul 2>&1
if %errorlevel% equ 0 (
    echo [3/5] Application logs (last 20 lines):
    docker logs --tail 20 kiini-one-hub-total-control_app
    echo.
) else (
    echo [WARNING] Application container is not running
    echo.
)

REM Try to run health check via Node
echo [4/5] Running database health check...
if exist package.json (
    node database-health-check.js
) else (
    echo [ERROR] package.json not found. Run from project root directory.
)

echo.
echo [5/5] Attempting to connect to database...
REM Try basic connection test
docker exec -it kiini-one-hub-total-control_db mysql -u root -pR:vVl:m7J9x3Hr^|yWEUp -e "SELECT VERSION();" 2>nul
if %errorlevel% equ 0 (
    echo [OK] Database connection successful
) else (
    echo [ERROR] Unable to connect to database
)

echo.
echo ==================================================
echo Diagnostics complete. Check output above for errors.
echo ==================================================
echo.
pause
