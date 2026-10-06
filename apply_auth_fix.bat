@echo off
echo ========================================
echo Kiini Authentication Fix
echo ========================================
echo.

echo Stopping Docker containers...
docker-compose down
echo.

echo Creating backup...
copy server\_core\sdk.ts server\_core\sdk.ts.backup
echo.

echo Applying fix...
copy server\_core\sdk.ts.fixed server\_core\sdk.ts
echo.

echo Rebuilding and restarting containers...
docker-compose up -d --build
echo.

echo ========================================
echo Fix Applied Successfully!
echo ========================================
echo.
echo You can now log in with:
echo   Email: admin@kiini.com
echo   Password: password123
echo.
echo Navigate to: http://localhost:3000/login
echo.
pause
