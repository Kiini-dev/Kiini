#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Complete Deployment Script: Localhost to Kiini Production
    
.DESCRIPTION
    Automates the entire deployment process:
    1. Builds frontend (Vite)
    2. Builds backend (esbuild)
    3. Creates deployment package (zip)
    4. Uploads to production server
    5. Extracts and restarts application
    6. Provides deployment status
    
.PARAMETER SkipBuild
    Skip build phase and use existing dist/
    
.PARAMETER SkipUpload
    Skip upload phase (useful for testing)
    
.EXAMPLE
    .\deploy-to-production.ps1
    
.EXAMPLE
    .\deploy-to-production.ps1 -SkipBuild
    
.NOTES
    Production URL: https://kiini.africa
    Production directory: /home3/kiiniafr/Kiini
    Upload credentials are read from DEPLOY_USER and DEPLOY_PASS environment variables.
#>

param(
    [switch]$SkipBuild = $false,
    [switch]$SkipUpload = $false,
    [switch]$RunMigrations = $false
)

$ErrorActionPreference = "Stop"

# ═══════════════════════════════════════════════════════════════════════════════
# CONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════════

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$deployDomain = "kiini.africa"
$deployPath = "/home3/kiiniafr/Kiini"
$deployUser = $env:DEPLOY_USER
$deployPass = $env:DEPLOY_PASS
$zipFile = Join-Path $projectRoot "kiini-production-deploy.zip"

$colors = @{
    Success = "Green"
    Error   = "Red"
    Warning = "Yellow"
    Info    = "Cyan"
    Section = "Magenta"
}

# ═══════════════════════════════════════════════════════════════════════════════
# FUNCTIONS
# ═══════════════════════════════════════════════════════════════════════════════

function Write-Header {
    param([string]$Title)
    Write-Host ""
    Write-Host "╔" + ("═" * 77) + "╗" -ForegroundColor $colors.Section
    Write-Host "║ $($Title.PadRight(75)) ║" -ForegroundColor $colors.Section
    Write-Host "╚" + ("═" * 77) + "╝" -ForegroundColor $colors.Section
    Write-Host ""
}

function Write-Step {
    param([string]$Step, [string]$Message)
    Write-Host "  [$Step] $Message" -ForegroundColor $colors.Info
}

function Write-Result {
    param([string]$Message, [bool]$Success = $true)
    $icon = if ($Success) { "✅" } else { "❌" }
    $color = if ($Success) { $colors.Success } else { $colors.Error }
    Write-Host "  $icon $Message" -ForegroundColor $color
}

function Confirm-ExitCode {
    param([int]$ExitCode, [string]$Operation)
    if ($ExitCode -ne 0) {
        Write-Result "$Operation FAILED (exit code: $ExitCode)" $false
        exit 1
    }
    Write-Result "$Operation successful" $true
}

# ═══════════════════════════════════════════════════════════════════════════════
# MAIN DEPLOYMENT
# ═══════════════════════════════════════════════════════════════════════════════

Write-Header "🚀 KIINI PRODUCTION DEPLOYMENT"

# ───────────────────────────────────────────────────────────────────────────────
# PHASE 1: BUILD
# ───────────────────────────────────────────────────────────────────────────────

if (-not $SkipBuild) {
    Write-Header "PHASE 1: BUILD"
    
    Write-Step "1.1" "Navigating to project root: $projectRoot"
    Set-Location $projectRoot
    
    Write-Step "1.2" "Building frontend and backend..."
    pnpm build
    Confirm-ExitCode $LASTEXITCODE "Application build"
    
    Write-Step "1.4" "Verifying build outputs..."
    $frontendOk = Test-Path "dist\index.html"
    $backendOk = Test-Path "dist\index.js"
    
    if (-not $frontendOk) {
        Write-Result "Frontend dist/index.html NOT FOUND" $false
        exit 1
    }
    if (-not $backendOk) {
        Write-Result "Backend dist/index.js NOT FOUND" $false
        exit 1
    }
    
    Write-Result "Frontend: dist/index.html exists" $true
    Write-Result "Backend: dist/index.js exists" $true
    
} else {
    Write-Header "PHASE 1: BUILD (SKIPPED)"
    Write-Step "1.1" "Using existing dist/ (--SkipBuild flag set)"
}

# ───────────────────────────────────────────────────────────────────────────────
# PHASE 2: PACKAGE
# ───────────────────────────────────────────────────────────────────────────────

Write-Header "PHASE 2: CREATE DEPLOYMENT PACKAGE"

Write-Step "2.1" "Creating complete production package..."
node create-deploy-zip.mjs
Confirm-ExitCode $LASTEXITCODE "Deployment package creation"
$zipSize = (Get-Item $zipFile).Length
$zipSizeMB = $zipSize / 1MB

if ($zipSize -eq 0) {
    Write-Result "Zip file is empty!" $false
    exit 1
}

Write-Result "Package created: $([Math]::Round($zipSizeMB, 2)) MB" $true

# ───────────────────────────────────────────────────────────────────────────────
# PHASE 3: UPLOAD & DEPLOY
# ───────────────────────────────────────────────────────────────────────────────

if (-not $SkipUpload) {
    Write-Header "PHASE 3: UPLOAD & DEPLOY TO PRODUCTION"
    
    Write-Step "3.1" "Setting deployment credentials..."
    if (-not $deployUser -or -not $deployPass) {
        throw "Set DEPLOY_USER and DEPLOY_PASS in the environment before uploading."
    }
    $env:DEPLOY_DOMAIN = $deployDomain
    Write-Result "Credentials configured for $deployDomain" $true
    
    Write-Step "3.2" "Uploading deployment package..."
    Write-Host "         Size: $([Math]::Round($zipSizeMB, 2)) MB"
    Write-Host "         Target: $deployDomain$deployPath"
    Write-Host ""
    
    $curlOutput = & curl.exe -sS --fail-with-body --max-time 600 -u "${env:DEPLOY_USER}:${env:DEPLOY_PASS}" `
        -F "file=@$zipFile" `
        "https://$env:DEPLOY_DOMAIN/do_deploy.php" 2>&1
    
    $curlExit = $LASTEXITCODE
    
    Write-Host ""
    Write-Step "3.3" "Deployment Response:"
    Write-Host ""
    
    $curlOutput | ForEach-Object {
        if ($_ -match "exit") {
            Write-Host "         $_" -ForegroundColor $colors.Warning
        } else {
            Write-Host "         $_" -ForegroundColor $colors.Info
        }
    }
    
    Write-Host ""
    
    if ($curlExit -eq 0) {
        Write-Result "Upload and deployment successful" $true
    } else {
        Write-Result "Upload FAILED (curl exit code: $curlExit)" $false
        exit 1
    }
    
} else {
    Write-Header "PHASE 3: UPLOAD & DEPLOY (SKIPPED)"
    Write-Step "3.1" "Skipping upload (--SkipUpload flag set)"
}

# ───────────────────────────────────────────────────────────────────────────────
# PHASE 4: VERIFY LIVE SITE
# ───────────────────────────────────────────────────────────────────────────────

Write-Header "PHASE 4: VERIFICATION"

Write-Step "4.1" "Checking the live application and health endpoint..."
$rootStatus = & curl.exe -sS -o NUL -w "%{http_code}" --max-time 30 "https://$deployDomain/"
$rootExit = $LASTEXITCODE
$healthStatus = & curl.exe -sS -o NUL -w "%{http_code}" --max-time 30 "https://$deployDomain/api/health"
$healthExit = $LASTEXITCODE

if ($rootExit -ne 0 -or $rootStatus -ne "200" -or $healthExit -ne 0 -or $healthStatus -ne "200") {
    Write-Result "Live verification failed (root: $rootStatus, health: $healthStatus)" $false
    exit 1
}
Write-Result "Live root and health endpoint both returned HTTP 200" $true

Write-Step "4.2" "Deployment Summary:"
Write-Host "         Production URL: https://$deployDomain" -ForegroundColor $colors.Info
Write-Host "         Package Size: $([Math]::Round($zipSizeMB, 2)) MB" -ForegroundColor $colors.Info
Write-Host "         Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor $colors.Info

# ───────────────────────────────────────────────────────────────────────────────
# PHASE 5: MIGRATIONS (Optional)
# ───────────────────────────────────────────────────────────────────────────────

if ($RunMigrations) {
    Write-Header "PHASE 5: DATABASE MIGRATIONS"
    
    Write-Step "5.1" "Connecting to production database..."
    Write-Host "         Host: kiini.africa" -ForegroundColor $colors.Info
    Write-Host "         Database: kiiniafr_kiinidev" -ForegroundColor $colors.Info
    
    Write-Step "5.2" "MANUAL ACTION REQUIRED:"
    Write-Host "         1. Open cPanel Terminal: https://kiini.africa:2083" -ForegroundColor $colors.Warning
    Write-Host "         2. Run: cd $deployPath" -ForegroundColor $colors.Warning
    Write-Host "         3. Configure DATABASE_URL for kiiniafr_kiinidev in the server environment." -ForegroundColor $colors.Warning
    Write-Host "         4. Run: pnpm db:push" -ForegroundColor $colors.Warning
    Write-Host "         5. Restart the Node.js application from cPanel." -ForegroundColor $colors.Warning
    Write-Host ""
} else {
    Write-Header "PHASE 5: DATABASE MIGRATIONS"
    Write-Step "5.1" "Migrations not run (use -RunMigrations flag to include them)"
}

# ═══════════════════════════════════════════════════════════════════════════════
# FINAL STATUS
# ═══════════════════════════════════════════════════════════════════════════════

Write-Header "✅ DEPLOYMENT COMPLETE"

Write-Host ""
Write-Host "  Next Steps:" -ForegroundColor $colors.Section
Write-Host "    1. Open: https://$deployDomain" -ForegroundColor $colors.Info
Write-Host "    2. Test notification behavior (should show once per notification)" -ForegroundColor $colors.Info
Write-Host "    3. Press F12 to check browser console for errors" -ForegroundColor $colors.Info
Write-Host "    4. Verify localStorage has: notification_popup_shown_ids" -ForegroundColor $colors.Info
Write-Host "    5. Test core features: Invoices, Estimates, Templates, etc." -ForegroundColor $colors.Info
Write-Host ""

Write-Host "  Emergency Rollback:" -ForegroundColor $colors.Section
Write-Host "    If issues occur, redeploy previous version or restore from backup" -ForegroundColor $colors.Warning
Write-Host ""

Write-Host "  Time to Deploy: ~5-10 minutes" -ForegroundColor $colors.Success
Write-Host "  Status: 🟢 READY FOR PRODUCTION" -ForegroundColor $colors.Success
Write-Host ""

exit 0
