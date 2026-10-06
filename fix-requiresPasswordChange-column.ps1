# Script to add the missing requiresPasswordChange column to users table
# This fixes the "Unknown column 'requiresPasswordChange'" errors

Write-Host "🔧 Adding requiresPasswordChange column to users table..." -ForegroundColor Cyan

# Add the column to the database
docker-compose exec -T db mysql -ukiini_user -p'tjwzT9pW;NGYq1QxSq0B' kiini-one-hub-total-control -e "ALTER TABLE users ADD COLUMN requiresPasswordChange TINYINT(1) NOT NULL DEFAULT 1 AFTER passwordResetExpiresAt;" 2>&1

if ($LASTEXITCODE -eq 0 -or $LASTEXITCODE -eq $null) {
    Write-Host "✅ Column added successfully!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Column may already exist (this is OK)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔄 Restarting the app container..." -ForegroundColor Cyan
docker-compose restart app

Write-Host ""
Write-Host "📋 Checking logs..." -ForegroundColor Cyan
Start-Sleep -Seconds 3
docker-compose logs -f --tail=50 app
