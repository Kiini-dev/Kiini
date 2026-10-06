###############################################################################
# Kiini - Windows Pre-Deployment Validation Script (PowerShell)
# 
# This script validates that your Windows system is ready for deployment.
# Run this before deploying to catch any issues early.
#
# Usage: powershell -ExecutionPolicy Bypass -File validate-deployment.ps1
###############################################################################

# Set error action preference
$ErrorActionPreference = "Continue"

# Initialize counters
$script:PASSED = 0
$script:FAILED = 0
$script:WARNINGS = 0

# Helper functions
function Write-Header {
    param([string]$Text)
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host $Text -ForegroundColor Cyan
    Write-Host "========================================`n" -ForegroundColor Cyan
}

function Write-Check {
    param([string]$Text)
    Write-Host "[CHECK] $Text" -ForegroundColor Blue
}

function Write-Pass {
    param([string]$Text)
    Write-Host "[PASS] $Text" -ForegroundColor Green
    $script:PASSED++
}

function Write-Fail {
    param([string]$Text)
    Write-Host "[FAIL] $Text" -ForegroundColor Red
    $script:FAILED++
}

function Write-Warn {
    param([string]$Text)
    Write-Host "[WARN] $Text" -ForegroundColor Yellow
    $script:WARNINGS++
}

function Write-Info {
    param([string]$Text)
    Write-Host "[INFO] $Text" -ForegroundColor Cyan
}

# Main validation
Write-Header "Kiini - Windows Pre-Deployment Validation"

###############################################################################
# 1. Check Windows Version
###############################################################################
Write-Header "1. Windows Version Check"

Write-Check "Checking Windows version..."
$osVersion = [System.Environment]::OSVersion
$winVersion = $osVersion.Version.Major
$winBuild = $osVersion.Version.Build

if ($winVersion -ge 10) {
    if ($winBuild -ge 2004) {
        Write-Pass "Windows 10 Build $winBuild or Windows 11 detected (recommended)"
    } else {
        Write-Warn "Windows 10 Build $winBuild detected (update recommended)"
    }
} else {
    Write-Fail "Windows version is too old (Windows 10 Build 2004+ required)"
}

###############################################################################
# 2. Check Administrator Privileges
###############################################################################
Write-Header "2. Administrator Privileges Check"

Write-Check "Checking if running as administrator..."
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

if ($isAdmin) {
    Write-Pass "Running as administrator"
} else {
    Write-Warn "Not running as administrator (some features may not work)"
}

###############################################################################
# 3. Check Required Software
###############################################################################
Write-Header "3. Required Software Check"

# Docker
Write-Check "Checking Docker installation..."
$dockerPath = Get-Command docker -ErrorAction SilentlyContinue
if ($dockerPath) {
    $dockerVersion = & docker --version
    Write-Pass "Docker installed: $dockerVersion"
} else {
    Write-Fail "Docker not installed. Download from: https://www.docker.com/products/docker-desktop"
}

# Docker Compose
Write-Check "Checking Docker Compose installation..."
$composePath = Get-Command docker-compose -ErrorAction SilentlyContinue
if ($composePath) {
    $composeVersion = & docker-compose --version
    Write-Pass "Docker Compose installed: $composeVersion"
} else {
    Write-Fail "Docker Compose not installed. Usually installed with Docker Desktop"
}

# Git
Write-Check "Checking Git installation..."
$gitPath = Get-Command git -ErrorAction SilentlyContinue
if ($gitPath) {
    $gitVersion = & git --version
    Write-Pass "Git installed: $gitVersion"
} else {
    Write-Fail "Git not installed. Download from: https://git-scm.com/download/win"
}

###############################################################################
# 4. Check System Resources
###############################################################################
Write-Header "4. System Resources Check"

# RAM
Write-Check "Checking available RAM..."
$ramGB = [math]::Round((Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory / 1GB)
if ($ramGB -ge 2) {
    Write-Pass "Sufficient RAM available: ${ramGB}GB (minimum 2GB required)"
} else {
    Write-Fail "Insufficient RAM: ${ramGB}GB (minimum 2GB required)"
}

# Disk Space
Write-Check "Checking available disk space..."
$diskInfo = Get-Volume | Where-Object { $_.DriveLetter -eq 'C' }
$diskFreeGB = [math]::Round($diskInfo.SizeRemaining / 1GB)
if ($diskFreeGB -ge 10) {
    Write-Pass "Sufficient disk space: ${diskFreeGB}GB (minimum 10GB required)"
} else {
    Write-Fail "Insufficient disk space: ${diskFreeGB}GB (minimum 10GB required)"
}

# CPU
Write-Check "Checking CPU cores..."
$cpuCores = (Get-CimInstance Win32_Processor).NumberOfLogicalProcessors
if ($cpuCores -ge 2) {
    Write-Pass "Sufficient CPU cores: $cpuCores (minimum 2 recommended)"
} else {
    Write-Warn "Limited CPU cores: $cpuCores (2+ recommended)"
}

###############################################################################
# 5. Check Docker Configuration
###############################################################################
Write-Header "5. Docker Configuration Check"

# Docker daemon running
Write-Check "Checking if Docker daemon is running..."
try {
    $dockerInfo = & docker ps 2>&1
    Write-Pass "Docker daemon is running"
} catch {
    Write-Fail "Docker daemon is not running. Start Docker Desktop application"
}

# Docker storage
Write-Check "Checking Docker disk usage..."
try {
    $dockerUsage = & docker system df 2>&1
    Write-Pass "Docker disk usage is accessible"
} catch {
    Write-Warn "Could not check Docker disk usage"
}

###############################################################################
# 6. Check Project Files
###############################################################################
Write-Header "6. Project Files Check"

# Check if in project directory
Write-Check "Checking if in Kiini directory..."
if ((Test-Path "docker-compose.yml") -and (Test-Path "Dockerfile")) {
    Write-Pass "Found docker-compose.yml and Dockerfile"
} else {
    Write-Fail "Not in Kiini directory. Run from project root"
}

# Check required files
Write-Check "Checking required project files..."
$requiredFiles = @("Dockerfile", "docker-compose.yml", "package.json", "drizzle/schema.ts", "server/routers.ts", "client/src/App.tsx")
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Pass "Found: $file"
    } else {
        Write-Fail "Missing: $file"
    }
}

# Check .env file
Write-Check "Checking .env configuration file..."
if (Test-Path ".env") {
    Write-Pass "Found .env file"
    
    # Check for required variables
    Write-Check "Checking required environment variables..."
    $envContent = Get-Content ".env"
    $requiredVars = @("DATABASE_URL", "JWT_SECRET", "NODE_ENV")
    
    foreach ($var in $requiredVars) {
        $varLine = $envContent | Select-String "^$var="
        if ($varLine) {
            $value = $varLine.ToString().Split('=')[1]
            if ($value) {
                Write-Pass "Found $var (value set)"
            } else {
                Write-Fail "Environment variable $var is empty"
            }
        } else {
            Write-Fail "Missing environment variable: $var"
        }
    }
} else {
    Write-Fail ".env file not found. Create with: Copy-Item .env.example .env"
}

###############################################################################
# 7. Check Network
###############################################################################
Write-Header "7. Network Check"

# Internet connectivity
Write-Check "Checking internet connectivity..."
try {
    $ping = Test-Connection 8.8.8.8 -Count 1 -ErrorAction SilentlyContinue
    if ($ping) {
        Write-Pass "Internet connection available"
    } else {
        Write-Warn "Cannot reach 8.8.8.8 (may not have internet)"
    }
} catch {
    Write-Warn "Could not verify internet connection"
}

# DNS resolution
Write-Check "Checking DNS resolution..."
try {
    $dns = Resolve-DnsName google.com -ErrorAction SilentlyContinue
    if ($dns) {
        Write-Pass "DNS resolution working"
    } else {
        Write-Warn "DNS resolution may not be working"
    }
} catch {
    Write-Warn "Could not verify DNS resolution"
}

# Port availability
Write-Check "Checking if port 3000 is available..."
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if (-not $port3000) {
    Write-Pass "Port 3000 is available"
} else {
    Write-Fail "Port 3000 is already in use. Change in docker-compose.yml or stop conflicting service"
}

Write-Check "Checking if port 3306 is available..."
$port3306 = Get-NetTCPConnection -LocalPort 3306 -ErrorAction SilentlyContinue
if (-not $port3306) {
    Write-Pass "Port 3306 is available"
} else {
    Write-Fail "Port 3306 is already in use. Change in docker-compose.yml or stop conflicting service"
}

###############################################################################
# 8. Check File Permissions
###############################################################################
Write-Header "8. File Permissions Check"

Write-Check "Checking project directory permissions..."
$currentDir = Get-Item "."
if ($currentDir.PSIsContainer) {
    Write-Pass "Project directory is accessible"
} else {
    Write-Fail "Project directory is not accessible"
}

###############################################################################
# 9. Check Backup
###############################################################################
Write-Header "9. Backup Check"

Write-Check "Checking if backup directory exists..."
if ((Test-Path "backups") -or (Test-Path "..\backups")) {
    Write-Pass "Backup directory found"
} else {
    Write-Warn "No backup directory found. Create with: New-Item -Path backups -ItemType Directory"
}

###############################################################################
# 10. Summary
###############################################################################
Write-Header "Validation Summary"

$total = $script:PASSED + $script:FAILED + $script:WARNINGS
Write-Info "Total checks: $total"
Write-Info "Passed: $($script:PASSED)"
Write-Info "Failed: $($script:FAILED)"
Write-Info "Warnings: $($script:WARNINGS)"

Write-Host ""

if ($script:FAILED -eq 0) {
    Write-Host "All critical checks passed!" -ForegroundColor Green
    Write-Host "Your system is ready for deployment." -ForegroundColor Green
    exit 0
} else {
    Write-Host "Some critical checks failed." -ForegroundColor Red
    Write-Host "Please fix the issues above before deploying." -ForegroundColor Red
    exit 1
}
