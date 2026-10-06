# Authentication Fix Application Script
# This script applies the authentication fix to your Kiini

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Kiini Authentication Fix" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if docker-compose is running
Write-Host "Checking Docker status..." -ForegroundColor Yellow
$dockerRunning = docker-compose ps --quiet app
if ($dockerRunning) {
    Write-Host "Stopping Docker containers..." -ForegroundColor Yellow
    docker-compose down
    Write-Host "Containers stopped." -ForegroundColor Green
}

# Backup the original file
Write-Host ""
Write-Host "Creating backup of original file..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
Copy-Item "server\_core\sdk.ts" "server\_core\sdk.ts.backup_$timestamp"
Write-Host "Backup created: server\_core\sdk.ts.backup_$timestamp" -ForegroundColor Green

# Apply the fix
Write-Host ""
Write-Host "Applying authentication fix..." -ForegroundColor Yellow
Copy-Item "server\_core\sdk.ts.fixed" "server\_core\sdk.ts" -Force
Write-Host "Fix applied successfully!" -ForegroundColor Green

# Rebuild and restart
Write-Host ""
Write-Host "Rebuilding and restarting Docker containers..." -ForegroundColor Yellow
docker-compose up -d --build

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Fix Applied Successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "You can now log in with:" -ForegroundColor White
Write-Host "  Email: admin@kiini.com" -ForegroundColor White
Write-Host "  Password: password123" -ForegroundColor White
Write-Host ""
Write-Host "Navigate to: http://localhost:3000/login" -ForegroundColor Cyan
Write-Host ""
