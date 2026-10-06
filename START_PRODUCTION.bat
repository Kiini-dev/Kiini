@echo off
REM ============================================================================
REM Kiini - Start Production Server
REM ============================================================================

echo.
echo ============================================================================
echo Kiini - Production Server
echo ============================================================================
echo.

REM Check if build exists
if not exist "dist\index.js" (
    echo.
    echo ERROR: Build files not found!
    echo Please run: pnpm build
    echo.
    pause
    exit /b 1
)

echo Starting production server...
echo Server will be available at: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

pnpm start

pause
