#!/bin/bash

###############################################################################
# Kiini - Pre-Deployment Validation Script
# 
# This script validates that your system is ready for deployment.
# Run this before deploying to catch any issues early.
#
# Usage: bash validate-deployment.sh
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNINGS=0

# Helper functions
print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_check() {
    echo -e "${BLUE}[CHECK]${NC} $1"
}

print_pass() {
    echo -e "${GREEN}[PASS]${NC} $1"
    ((PASSED++))
}

print_fail() {
    echo -e "${RED}[FAIL]${NC} $1"
    ((FAILED++))
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
    ((WARNINGS++))
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Main validation
print_header "Kiini - Pre-Deployment Validation"

###############################################################################
# 1. Check Operating System
###############################################################################
print_header "1. Operating System Check"

print_check "Checking OS type..."
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    print_pass "Linux detected"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    print_pass "macOS detected"
else
    print_warn "Unknown OS: $OSTYPE (may not be fully supported)"
fi

print_check "Checking OS version..."
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    if grep -q "Ubuntu 22" /etc/os-release 2>/dev/null; then
        print_pass "Ubuntu 22.04 LTS detected (recommended)"
    elif grep -q "Ubuntu" /etc/os-release 2>/dev/null; then
        print_warn "Ubuntu detected but version may not be optimal"
    else
        print_warn "Not Ubuntu (may work but not tested)"
    fi
fi

###############################################################################
# 2. Check Required Software
###############################################################################
print_header "2. Required Software Check"

# Docker
print_check "Checking Docker installation..."
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    print_pass "Docker installed: $DOCKER_VERSION"
else
    print_fail "Docker not installed. Install with: curl -fsSL https://get.docker.com | sh"
fi

# Docker Compose
print_check "Checking Docker Compose installation..."
if command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose --version)
    print_pass "Docker Compose installed: $COMPOSE_VERSION"
else
    print_fail "Docker Compose not installed. Install with: sudo curl -L https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-\$(uname -s)-\$(uname -m) -o /usr/local/bin/docker-compose && sudo chmod +x /usr/local/bin/docker-compose"
fi

# Git
print_check "Checking Git installation..."
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version)
    print_pass "Git installed: $GIT_VERSION"
else
    print_fail "Git not installed. Install with: sudo apt install git"
fi

# Node.js (optional but recommended)
print_check "Checking Node.js installation..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_pass "Node.js installed: $NODE_VERSION"
else
    print_warn "Node.js not installed (optional for Docker deployment)"
fi

###############################################################################
# 3. Check System Resources
###############################################################################
print_header "3. System Resources Check"

# RAM
print_check "Checking available RAM..."
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    RAM_GB=$(free -g | awk '/^Mem:/{print $2}')
    if [ "$RAM_GB" -ge 2 ]; then
        print_pass "Sufficient RAM available: ${RAM_GB}GB (minimum 2GB required)"
    else
        print_fail "Insufficient RAM: ${RAM_GB}GB (minimum 2GB required)"
    fi
elif [[ "$OSTYPE" == "darwin"* ]]; then
    RAM_GB=$(($(sysctl -n hw.memsize) / 1024 / 1024 / 1024))
    if [ "$RAM_GB" -ge 2 ]; then
        print_pass "Sufficient RAM available: ${RAM_GB}GB (minimum 2GB required)"
    else
        print_fail "Insufficient RAM: ${RAM_GB}GB (minimum 2GB required)"
    fi
fi

# Disk Space
print_check "Checking available disk space..."
DISK_GB=$(df -BG . | awk 'NR==2 {print $4}' | sed 's/G//')
if [ "$DISK_GB" -ge 10 ]; then
    print_pass "Sufficient disk space: ${DISK_GB}GB (minimum 10GB required)"
else
    print_fail "Insufficient disk space: ${DISK_GB}GB (minimum 10GB required)"
fi

# CPU
print_check "Checking CPU cores..."
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    CPU_CORES=$(nproc)
elif [[ "$OSTYPE" == "darwin"* ]]; then
    CPU_CORES=$(sysctl -n hw.ncpu)
else
    CPU_CORES="unknown"
fi
if [ "$CPU_CORES" != "unknown" ]; then
    if [ "$CPU_CORES" -ge 2 ]; then
        print_pass "Sufficient CPU cores: $CPU_CORES (minimum 2 recommended)"
    else
        print_warn "Limited CPU cores: $CPU_CORES (2+ recommended)"
    fi
fi

###############################################################################
# 4. Check Docker Configuration
###############################################################################
print_header "4. Docker Configuration Check"

# Docker daemon running
print_check "Checking if Docker daemon is running..."
if docker ps &> /dev/null; then
    print_pass "Docker daemon is running"
else
    print_fail "Docker daemon is not running. Start with: sudo systemctl start docker"
fi

# Docker permissions
print_check "Checking Docker permissions..."
if docker ps &> /dev/null; then
    print_pass "Docker accessible without sudo (good for usability)"
else
    print_warn "Docker requires sudo (consider adding user to docker group)"
fi

# Docker storage
print_check "Checking Docker disk usage..."
DOCKER_USAGE=$(docker system df 2>/dev/null | awk 'NR==2 {print $4}' | sed 's/GB//' || echo "0")
if [ -z "$DOCKER_USAGE" ] || [ "$DOCKER_USAGE" -lt 5 ]; then
    print_pass "Docker disk usage is reasonable"
else
    print_warn "Docker using significant disk space: ${DOCKER_USAGE}GB"
fi

###############################################################################
# 5. Check Project Files
###############################################################################
print_header "5. Project Files Check"

# Check if in project directory
print_check "Checking if in Kiini directory..."
if [ -f "docker-compose.yml" ] && [ -f "Dockerfile" ]; then
    print_pass "Found docker-compose.yml and Dockerfile"
else
    print_fail "Not in Kiini directory. Run from project root."
fi

# Check required files
print_check "Checking required project files..."
REQUIRED_FILES=("Dockerfile" "docker-compose.yml" "package.json" "drizzle/schema.ts" "server/routers.ts" "client/src/App.tsx")
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_pass "Found: $file"
    else
        print_fail "Missing: $file"
    fi
done

# Check .env file
print_check "Checking .env configuration file..."
if [ -f ".env" ]; then
    print_pass "Found .env file"
    
    # Check for required variables
    print_check "Checking required environment variables..."
    REQUIRED_VARS=("DATABASE_URL" "JWT_SECRET" "NODE_ENV")
    for var in "${REQUIRED_VARS[@]}"; do
        if grep -q "^$var=" .env 2>/dev/null; then
            VALUE=$(grep "^$var=" .env | cut -d'=' -f2)
            if [ -z "$VALUE" ]; then
                print_fail "Environment variable $var is empty"
            else
                print_pass "Found $var (value set)"
            fi
        else
            print_fail "Missing environment variable: $var"
        fi
    done
else
    print_fail ".env file not found. Create with: cp .env.example .env"
fi

###############################################################################
# 6. Check Network
###############################################################################
print_header "6. Network Check"

# Internet connectivity
print_check "Checking internet connectivity..."
if ping -c 1 8.8.8.8 &> /dev/null; then
    print_pass "Internet connection available"
else
    print_warn "Cannot reach 8.8.8.8 (may not have internet)"
fi

# DNS resolution
print_check "Checking DNS resolution..."
if nslookup google.com &> /dev/null; then
    print_pass "DNS resolution working"
else
    print_warn "DNS resolution may not be working"
fi

# Port availability
print_check "Checking if port 3000 is available..."
if ! netstat -tuln 2>/dev/null | grep -q ":3000 "; then
    print_pass "Port 3000 is available"
else
    print_fail "Port 3000 is already in use. Change in docker-compose.yml or stop conflicting service."
fi

print_check "Checking if port 3306 is available..."
if ! netstat -tuln 2>/dev/null | grep -q ":3306 "; then
    print_pass "Port 3306 is available"
else
    print_fail "Port 3306 is already in use. Change in docker-compose.yml or stop conflicting service."
fi

###############################################################################
# 7. Check Permissions
###############################################################################
print_header "7. File Permissions Check"

print_check "Checking project directory permissions..."
if [ -w "." ]; then
    print_pass "Project directory is writable"
else
    print_fail "Project directory is not writable. Run: sudo chown -R \$USER:\$USER ."
fi

print_check "Checking if scripts are executable..."
if [ -x "validate-deployment.sh" ] 2>/dev/null; then
    print_pass "Scripts are executable"
else
    print_warn "Scripts may not be executable. Run: chmod +x *.sh"
fi

###############################################################################
# 8. Check Backup
###############################################################################
print_header "8. Backup Check"

print_check "Checking if backup directory exists..."
if [ -d "backups" ] || [ -d "../backups" ]; then
    print_pass "Backup directory found"
else
    print_warn "No backup directory found. Create with: mkdir -p ~/backups"
fi

###############################################################################
# 9. Summary
###############################################################################
print_header "Validation Summary"

TOTAL=$((PASSED + FAILED + WARNINGS))
print_info "Total checks: $TOTAL"
print_info "Passed: ${GREEN}$PASSED${NC}"
print_info "Failed: ${RED}$FAILED${NC}"
print_info "Warnings: ${YELLOW}$WARNINGS${NC}"

echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All critical checks passed!${NC}"
    echo -e "${GREEN}Your system is ready for deployment.${NC}"
    exit 0
else
    echo -e "${RED}✗ Some critical checks failed.${NC}"
    echo -e "${RED}Please fix the issues above before deploying.${NC}"
    exit 1
fi
