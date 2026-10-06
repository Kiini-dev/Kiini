# ============================================================================
# Kiini Local Security Scanner (PowerShell)
# ============================================================================
# Runs comprehensive security checks on your local environment before commit
# Usage: powershell -ExecutionPolicy Bypass -File .\scripts\security-scan.ps1
# ============================================================================

param(
    [switch]$VerboseOutput = $false
)

# Colors for output
$Colors = @{
    'Success' = 'Green'
    'Error'   = 'Red'
    'Warning' = 'Yellow'
    'Info'    = 'Cyan'
    'Header'  = 'Blue'
}

# Counters
$PassedChecks = 0
$FailedChecks = 0
$Warnings = 0

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

function Print-Header {
    param([string]$Message)
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor $Colors.Header
    Write-Host $Message -ForegroundColor $Colors.Header
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor $Colors.Header
    Write-Host ""
}

function Print-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor $Colors.Success
    $script:PassedChecks++
}

function Print-Error {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor $Colors.Error
    $script:FailedChecks++
}

function Print-Warning {
    param([string]$Message)
    Write-Host "⚠ $Message" -ForegroundColor $Colors.Warning
    $script:Warnings++
}

function Print-Info {
    param([string]$Message)
    Write-Host "ℹ $Message" -ForegroundColor $Colors.Info
}

# ============================================================================
# PRE-FLIGHT CHECKS
# ============================================================================

Print-Header "Pre-Flight Checks"

# Check Node.js
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = & node --version
    Print-Success "Node.js installed ($nodeVersion)"
} else {
    Print-Error "Node.js not installed"
    exit 1
}

# Check pnpm
if (Get-Command pnpm -ErrorAction SilentlyContinue) {
    $pnpmVersion = & pnpm --version
    Print-Success "pnpm installed ($pnpmVersion)"
} else {
    Print-Error "pnpm not installed"
    Write-Host "Install pnpm with: npm install -g pnpm"
    exit 1
}

# Check Git
if (Get-Command git -ErrorAction SilentlyContinue) {
    $gitVersion = & git --version
    Print-Success "Git installed ($gitVersion)"
} else {
    Print-Error "Git not installed"
    exit 1
}

# ============================================================================
# DEPENDENCY SECURITY CHECK
# ============================================================================

Print-Header "Dependency Security Scan"

if (Test-Path "package.json") {
    Print-Info "Running npm audit..."
    
    $auditOutput = & pnpm audit --audit-level=high 2>&1
    $auditExit = $LASTEXITCODE
    
    if ($auditExit -eq 0) {
        Print-Success "No high/critical vulnerabilities found"
    } else {
        Print-Error "High/critical vulnerabilities detected"
        if ($VerboseOutput) { Write-Host $auditOutput }
    }
} else {
    Print-Warning "package.json not found"
}

# ============================================================================
# CODE QUALITY CHECK
# ============================================================================

Print-Header "Code Quality Check"

# TypeScript type checking
if (Test-Path "tsconfig.json") {
    Print-Info "Running TypeScript compiler..."
    $tscOutput = & pnpm exec tsc --noEmit 2>&1
    $tscExit = $LASTEXITCODE
    
    if ($tscExit -eq 0) {
        Print-Success "TypeScript type checking passed"
    } else {
        Print-Error "TypeScript type checking failed"
        if ($VerboseOutput) { Write-Host $tscOutput }
    }
} else {
    Print-Warning "tsconfig.json not found"
}

# ESLint checking
$eslintExists = (Test-Path ".eslintrc") -or (Test-Path ".eslintrc.json") -or (Test-Path ".eslintrc.js")
if ($eslintExists -or (Select-String '"eslint"' package.json -ErrorAction SilentlyContinue)) {
    Print-Info "Running ESLint..."
    $eslintOutput = & pnpm exec eslint . --ext .ts,.tsx --max-warnings=0 2>&1
    $eslintExit = $LASTEXITCODE
    
    if ($eslintExit -eq 0) {
        Print-Success "ESLint check passed"
    } else {
        Print-Warning "ESLint found issues (check locally with: pnpm lint)"
    }
} else {
    Print-Info "ESLint not configured"
}

# ============================================================================
# SECRETS SCANNING
# ============================================================================

Print-Header "Secrets & Credentials Scanning"

Print-Info "Scanning for hardcoded secrets..."

$secretPatterns = @(
    'password.*=.*["\x27]',
    'api[_-]?key.*=.*["\x27]',
    'token.*=.*["\x27]',
    'secret.*=.*["\x27]',
    'private[_-]?key',
    '-----BEGIN.*PRIVATE'
)

$secretsFound = 0
foreach ($pattern in $secretPatterns) {
    $results = Get-ChildItem -Recurse -Include "*.ts", "*.tsx", "*.js", "*.env" `
        -Exclude "*.node_modules" -ErrorAction SilentlyContinue |
        Where-Object { $_.FullName -notmatch "node_modules|\.git|dist|\.next" } |
        Select-String -Pattern $pattern -ErrorAction SilentlyContinue
    
    if ($results) {
        Print-Error "Potential secret detected matching: $pattern"
        $secretsFound++
    }
}

if ($secretsFound -eq 0) {
    Print-Success "No hardcoded secrets detected"
} else {
    Print-Error "Found $secretsFound potential security issues"
}

# Check for .env.local
if (Test-Path ".env.local") {
    Print-Warning ".env.local file found - ensure it's in .gitignore"
}

# ============================================================================
# GIT CHECKS
# ============================================================================

Print-Header "Git Security Checks"

# Check for uncommitted changes
$gitStatus = & git status --porcelain 2>$null
if ($gitStatus) {
    Print-Warning "Uncommitted changes detected"
}

# Check for hooks
$hookPath = ".git/hooks/pre-commit"
if (Test-Path $hookPath) {
    Print-Success "Pre-commit hooks configured"
} else {
    Print-Info "Consider setting up pre-commit hooks"
}

# ============================================================================
# ENVIRONMENT SECURITY
# ============================================================================

Print-Header "Environment Security Check"

# Check Docker configuration
if (Test-Path "Dockerfile") {
    Print-Info "Checking Docker security..."
    
    $dockerfile = Get-Content "Dockerfile"
    
    if ($dockerfile -match "FROM.*:latest") {
        Print-Warning "Dockerfile uses :latest tag (pin specific versions in production)"
    } else {
        Print-Success "Dockerfile uses pinned image versions"
    }
    
    if ($dockerfile -notmatch "USER" -or $dockerfile -match "RUN.*as root") {
        Print-Warning "Consider running container as non-root user"
    }
}

# ============================================================================
# TERRAFORM SECURITY
# ============================================================================

Print-Header "Infrastructure Security (Terraform)"

if (Test-Path "terraform") {
    Print-Info "Checking Terraform configuration..."
    
    # Check for hardcoded credentials
    $tfvarsFiles = Get-ChildItem terraform/*.tfvars -ErrorAction SilentlyContinue
    foreach ($file in $tfvarsFiles) {
        $content = Get-Content $file
        if ($content -match "password|secret|key" -and $content -notmatch "CHANGE_ME|your-") {
            Print-Warning "Sensitive values detected in tfvars (use env vars for production)"
            break
        }
    }
    
    # Check for state file
    if (Test-Path "terraform/terraform.tfstate") {
        Print-Error "terraform.tfstate file found (should not be in version control)"
    }
    
    Print-Success "Terraform files checked"
}

# ============================================================================
# BUILD VERIFICATION
# ============================================================================

Print-Header "Build Verification"

Print-Info "Attempting build..."
$buildOutput = & pnpm run build 2>&1
$buildExit = $LASTEXITCODE

if ($buildExit -eq 0) {
    Print-Success "Build successful"
} else {
    Print-Error "Build failed"
    Write-Host "Run 'pnpm build' for detailed error messages"
}

# ============================================================================
# SUMMARY
# ============================================================================

Print-Header "Security Scan Summary"

Write-Host "Passed:   $PassedChecks checks" -ForegroundColor $Colors.Success
Write-Host "Failed:   $FailedChecks checks" -ForegroundColor $Colors.Error
Write-Host "Warnings: $Warnings items" -ForegroundColor $Colors.Warning

Write-Host ""

if ($FailedChecks -eq 0) {
    Write-Host "✓ All security checks passed!" -ForegroundColor $Colors.Success
    Write-Host ""
    Write-Host "You're ready to commit. Happy coding! 🚀"
    exit 0
} else {
    Write-Host "✗ Security check failed!" -ForegroundColor $Colors.Error
    Write-Host ""
    Write-Host "Please fix the issues above before committing."
    exit 1
}
