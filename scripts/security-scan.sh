#!/bin/bash

# ============================================================================
# Kiini Local Security Scanner
# ============================================================================
# Runs comprehensive security checks on your local environment before commit
# Usage: chmod +x scripts/security-scan.sh && ./scripts/security-scan.sh
# ============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNINGS=0

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

print_header() {
  echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}\n"
}

print_success() {
  echo -e "${GREEN}✓${NC} $1"
  ((PASSED_CHECKS++))
  ((TOTAL_CHECKS++))
}

print_error() {
  echo -e "${RED}✗${NC} $1"
  ((FAILED_CHECKS++))
  ((TOTAL_CHECKS++))
}

print_warning() {
  echo -e "${YELLOW}⚠${NC} $1"
  ((WARNINGS++))
}

print_info() {
  echo -e "${BLUE}ℹ${NC} $1"
}

# ============================================================================
# PRE-FLIGHT CHECKS
# ============================================================================

print_header "Pre-Flight Checks"

# Check if Node.js is installed
if command -v node &> /dev/null; then
  print_success "Node.js installed ($(node --version))"
else
  print_error "Node.js not installed"
  exit 1
fi

# Check if pnpm is installed
if command -v pnpm &> /dev/null; then
  print_success "pnpm installed ($(pnpm --version))"
else
  print_error "pnpm not installed"
  echo "Install pnpm with: npm install -g pnpm"
  exit 1
fi

# Check if git is installed
if command -v git &> /dev/null; then
  print_success "Git installed ($(git --version | cut -d' ' -f3))"
else
  print_error "Git not installed"
  exit 1
fi

# ============================================================================
# DEPENDENCY SECURITY CHECK
# ============================================================================

print_header "Dependency Security Scan"

if [ -f "package.json" ]; then
  print_info "Running npm audit..."
  
  # Run npm audit and capture exit code
  if pnpm audit --audit-level=high 2>&1 | tee npm-audit.log; then
    print_success "No high/critical vulnerabilities found"
  else
    audit_status=$?
    if [ $audit_status -eq 1 ]; then
      print_error "High/critical vulnerabilities detected"
      cat npm-audit.log
    else
      print_warning "npm audit produced warnings"
    fi
  fi
  rm -f npm-audit.log
else
  print_warning "package.json not found"
fi

# ============================================================================
# CODE QUALITY CHECK
# ============================================================================

print_header "Code Quality Check"

# TypeScript type checking
if [ -f "tsconfig.json" ]; then
  print_info "Running TypeScript compiler..."
  if pnpm exec tsc --noEmit > /dev/null 2>&1; then
    print_success "TypeScript type checking passed"
  else
    print_error "TypeScript type checking failed"
    pnpm exec tsc --noEmit
  fi
else
  print_warning "tsconfig.json not found"
fi

# ESLint checking
if [ -f ".eslintrc" ] || [ -f ".eslintrc.json" ] || [ -f ".eslintrc.js" ] || grep -q '"eslint"' package.json; then
  print_info "Running ESLint..."
  if pnpm exec eslint . --ext .ts,.tsx --max-warnings=0 > /dev/null 2>&1; then
    print_success "ESLint check passed"
  else
    print_warning "ESLint found issues (check locally with: pnpm lint)"
  fi
else
  print_info "ESLint not configured"
fi

# ============================================================================
# SECRETS SCANNING
# ============================================================================

print_header "Secrets & Credentials Scanning"

# Check for common secret patterns in code
print_info "Scanning for hardcoded secrets..."

SECRET_PATTERNS=(
  'password.*=.*["\047]'
  'api[_-]?key.*=.*["\047]'
  'token.*=.*["\047]'
  'secret.*=.*["\047]'
  'private[_-]?key'
  '-----BEGIN.*PRIVATE'
)

SECRETS_FOUND=0
for pattern in "${SECRET_PATTERNS[@]}"; do
  if grep -r --include="*.ts" --include="*.tsx" --include="*.js" --include="*.env" "$pattern" . \
    --exclude-dir=node_modules \
    --exclude-dir=.git \
    --exclude-dir=dist \
    --exclude-dir=.next \
    --exclude="*.tfvars" \
    --exclude=".env.example" \
    2>/dev/null | grep -v "node_modules" > /dev/null; then
    print_error "Potential secret detected matching: $pattern"
    SECRETS_FOUND=$((SECRETS_FOUND+1))
  fi
done

if [ $SECRETS_FOUND -eq 0 ]; then
  print_success "No hardcoded secrets detected"
else
  print_error "Found $SECRETS_FOUND potential security issues"
fi

# Check for API keys in environment
if [ -f ".env.local" ]; then
  print_warning ".env.local file found - ensure it's in .gitignore"
fi

# ============================================================================
# DEPENDENCY LICENSE CHECK
# ============================================================================

print_header "License Compliance Check"

print_info "Checking for risky licenses..."

# Check for common problematic licenses
RISKY_LICENSES=("GPL" "AGPL")
for license in "${RISKY_LICENSES[@]}"; do
  if pnpm list 2>/dev/null | grep -i "$license" > /dev/null; then
    print_warning "Found package with $license license (may require source disclosure)"
  fi
done

# ============================================================================
# GIT CHECKS
# ============================================================================

print_header "Git Security Checks"

# Check for uncommitted changes
if ! git diff --quiet 2>/dev/null; then
  print_warning "Uncommitted changes detected (stage them before commit)"
fi

# Check git hooks
if [ -d ".git/hooks" ]; then
  if [ -f ".git/hooks/pre-commit" ]; then
    print_success "Pre-commit hooks configured"
  else
    print_info "Consider setting up pre-commit hooks"
  fi
fi

# ============================================================================
# ENVIRONMENT SECURITY
# ============================================================================

print_header "Environment Security Check"

# Check for unsafe Docker configuration
if [ -f "Dockerfile" ]; then
  print_info "Checking Docker security..."
  
  if grep -q "FROM.*:latest" Dockerfile; then
    print_warning "Dockerfile uses :latest tag (pin specific versions in production)"
  else
    print_success "Dockerfile uses pinned image versions"
  fi
  
  if grep -q "RUN.*as root" Dockerfile || ! grep -q "USER" Dockerfile; then
    print_warning "Consider running container as non-root user"
  fi
fi

# Check for sensitive ports
if grep -r "3306\|5432\|6379" . --include="*.ts" --include="*.tsx" --include="docker-compose.yml" 2>/dev/null | grep -v node_modules | grep -v ".git" > /dev/null; then
  print_info "Database/service ports found in config"
fi

# ============================================================================
# TERRAFORM SECURITY
# ============================================================================

print_header "Infrastructure Security (Terraform)"

if [ -d "terraform" ]; then
  print_info "Checking Terraform configuration..."
  
  # Check for hardcoded credentials
  if grep -r "password\|secret\|key" terraform/*.tfvars 2>/dev/null | grep -v "CHANGE_ME" | grep -v "your-" > /dev/null; then
    print_warning "Sensitive values detected in tfvars (use env vars for production)"
  fi
  
  # Check for terraform.tfstate
  if [ -f "terraform/terraform.tfstate" ]; then
    print_error "terraform.tfstate file found (should not be in version control)"
  fi
  
  print_success "Terraform files checked"
fi

# ============================================================================
# BUILD VERIFICATION
# ============================================================================

print_header "Build Verification"

print_info "Attempting build..."
if pnpm run build > /dev/null 2>&1; then
  print_success "Build successful"
else
  print_error "Build failed"
  echo "Run 'pnpm build' for detailed error messages"
fi

# ============================================================================
# SUMMARY
# ============================================================================

print_header "Security Scan Summary"

TOTAL_PASSED=$((PASSED_CHECKS))
TOTAL_FAILED=$((FAILED_CHECKS))

echo -e "${GREEN}Passed:${NC}  $TOTAL_PASSED checks"
echo -e "${RED}Failed:${NC}  $TOTAL_FAILED checks"
echo -e "${YELLOW}Warnings:${NC} $WARNINGS items"

echo ""

if [ $TOTAL_FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ All security checks passed!${NC}"
  echo ""
  echo "You're ready to commit. Happy coding! 🚀"
  exit 0
else
  echo -e "${RED}✗ Security check failed!${NC}"
  echo ""
  echo "Please fix the issues above before committing."
  exit 1
fi
