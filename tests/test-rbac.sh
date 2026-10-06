#!/bin/bash

# Feature-Based Access Control (RBAC) Testing Script
# Tests API endpoints to verify permission enforcement for different user roles

set -e

# Configuration
API_BASE="${API_URL:-http://localhost:3000}"
VERBOSE="${VERBOSE:-false}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
SKIPPED_TESTS=0

# Function to write colored output
write_result() {
    local message=$1
    local status=$2
    
    case $status in
        success)
            echo -e "${GREEN}✓${NC} ${message}"
            ;;
        failed)
            echo -e "${RED}✗${NC} ${message}"
            ;;
        warning)
            echo -e "${YELLOW}⚠${NC} ${message}"
            ;;
        info)
            echo -e "${BLUE}ℹ${NC} ${message}"
            ;;
        *)
            echo "${message}"
            ;;
    esac
}

# Function to test an endpoint
invoke_rbac_test() {
    local test_name=$1
    local token=$2
    local endpoint=$3
    local method=${4:-GET}
    local body=$5
    local expected_status=${6:-200}
    local user_role=${7:-Unknown}
    
    ((TOTAL_TESTS++))
    
    local headers="Content-Type: application/json"
    
    if [ -n "$token" ]; then
        headers="$headers
Authorization: Bearer $token"
    fi
    
    local uri="$API_BASE$endpoint"
    
    if [ "$VERBOSE" = "true" ]; then
        write_result "Testing: $test_name" "info"
        echo "  User Role: $user_role"
        echo "  Method: $method $uri"
    fi
    
    # Make the request
    local response
    local http_code
    
    if [ -n "$body" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$uri" \
            -H "$headers" \
            -d "$body")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$uri" \
            -H "$headers")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    response_body=$(echo "$response" | head -n-1)
    
    # Check if test passed
    if [ "$http_code" = "$expected_status" ]; then
        ((PASSED_TESTS++))
        write_result "PASS: $test_name (Status: $http_code)" "success"
    else
        ((FAILED_TESTS++))
        write_result "FAIL: $test_name (Status: $http_code, Expected: $expected_status)" "failed"
    fi
    
    if [ "$VERBOSE" = "true" ]; then
        echo "  Response Status: $http_code"
        [ -n "$response_body" ] && echo "  Response: ${response_body:0:200}..."
    fi
}

# ============================================================================
# MAIN TESTING FLOW
# ============================================================================

echo ""
write_result "========================================" "info"
write_result "Feature-Based Access Control (RBAC) Test" "info"
write_result "========================================" "info"
write_result "API Base URL: $API_BASE" "info"
write_result "Testing Time: $(date)" "info"
write_result "========================================" "info"
echo ""

# Step 1: Check if API is running
write_result "[1/4] Checking API connectivity..." "info"

if curl -s "$API_BASE/api/health" > /dev/null 2>&1; then
    write_result "API is running and responding" "success"
else
    write_result "Cannot reach API at $API_BASE" "failed"
    write_result "Make sure the application is running: docker-compose up -d" "warning"
    exit 1
fi

# Step 2: Authentication - Get tokens for test users
write_result "[2/4] Authenticating test users..." "info"

declare -A tokens

# Test user credentials
declare -a users=(
    "test.superadmin@kiini.local:password123:super_admin:Super Admin"
    "test.admin@kiini.local:password123:admin:Admin"
    "test.accountant@kiini.local:password123:accountant:Accountant"
    "test.pm@kiini.local:password123:project_manager:Project Manager"
    "test.hr@kiini.local:password123:hr:HR"
    "test.staff@kiini.local:password123:staff:Staff"
)

for user_info in "${users[@]}"; do
    IFS=':' read -r email password role name <<< "$user_info"
    
    # Try to authenticate
    response=$(curl -s -X POST "$API_BASE/api/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$email\",\"password\":\"$password\"}")
    
    token=$(echo "$response" | grep -o '"token":"[^"]*' | cut -d'"' -f4 || echo "")
    
    if [ -n "$token" ]; then
        tokens[$role]=$token
        write_result "Authenticated: $name ($role)" "success"
    else
        write_result "Could not authenticate $name - User may not exist in database" "warning"
        ((SKIPPED_TESTS++))
    fi
done

if [ ${#tokens[@]} -eq 0 ]; then
    write_result "No test users authenticated. Please create test users first." "failed"
    exit 1
fi

# Step 3: Test Feature-Based Access Control
write_result "[3/4] Testing feature-based access control..." "info"

# Test roles.read - Allowed: super_admin, admin
write_result "" "info"; write_result "Testing: /api/trpc/roles.read" "info"
[ -n "${tokens[super_admin]}" ] && invoke_rbac_test "SuperAdmin - roles.read" "${tokens[super_admin]}" "/api/trpc/roles.read" "GET" "" 200 "super_admin"
[ -n "${tokens[admin]}" ] && invoke_rbac_test "Admin - roles.read" "${tokens[admin]}" "/api/trpc/roles.read" "GET" "" 200 "admin"
[ -n "${tokens[accountant]}" ] && invoke_rbac_test "Accountant - roles.read (should fail)" "${tokens[accountant]}" "/api/trpc/roles.read" "GET" "" 403 "accountant"
[ -n "${tokens[staff]}" ] && invoke_rbac_test "Staff - roles.read (should fail)" "${tokens[staff]}" "/api/trpc/roles.read" "GET" "" 403 "staff"

# Test filters:create - Allowed: All roles
write_result "" "info"; write_result "Testing: /api/trpc/savedFilters.create" "info"
filter_body='{"name":"Test Filter","description":"Test","filterConfig":{"status":"active"}}'
[ -n "${tokens[super_admin]}" ] && invoke_rbac_test "SuperAdmin - filters.create" "${tokens[super_admin]}" "/api/trpc/savedFilters.create" "POST" "$filter_body" 200 "super_admin"
[ -n "${tokens[staff]}" ] && invoke_rbac_test "Staff - filters.create" "${tokens[staff]}" "/api/trpc/savedFilters.create" "POST" "$filter_body" 200 "staff"

# Test reports:create - Allowed: super_admin, admin
write_result "" "info"; write_result "Testing: /api/trpc/reportExport.create" "info"
report_body='{"name":"Test Report","description":"Test","reportType":"financial"}'
[ -n "${tokens[admin]}" ] && invoke_rbac_test "Admin - reports.create" "${tokens[admin]}" "/api/trpc/reportExport.create" "POST" "$report_body" 200 "admin"
[ -n "${tokens[accountant]}" ] && invoke_rbac_test "Accountant - reports.create (should fail)" "${tokens[accountant]}" "/api/trpc/reportExport.create" "POST" "$report_body" 403 "accountant"

# Test workflows:create - Allowed: super_admin, admin
write_result "" "info"; write_result "Testing: /api/trpc/workflows.create" "info"
workflow_body='{"name":"Test Workflow","triggers":["manual"],"actions":["notify"]}'
[ -n "${tokens[super_admin]}" ] && invoke_rbac_test "SuperAdmin - workflows.create" "${tokens[super_admin]}" "/api/trpc/workflows.create" "POST" "$workflow_body" 200 "super_admin"
[ -n "${tokens[hr]}" ] && invoke_rbac_test "HR - workflows.create (should fail)" "${tokens[hr]}" "/api/trpc/workflows.create" "POST" "$workflow_body" 403 "hr"

# Step 4: Test Authentication Failures
write_result "[4/4] Testing authentication enforcement..." "info"

write_result "" "info"; write_result "Testing: No authentication token" "info"
invoke_rbac_test "No Token - roles.read (should fail)" "" "/api/trpc/roles.read" "GET" "" 401 "none"

write_result "" "info"; write_result "Testing: Invalid authentication token" "info"
invoke_rbac_test "Invalid Token - roles.read (should fail)" "invalid_token_xyz" "/api/trpc/roles.read" "GET" "" 401 "invalid"

# ============================================================================
# Summary Report
# ============================================================================

echo ""
write_result "========================================" "info"
write_result "Test Summary" "info"
write_result "========================================" "info"

echo "Total Tests:   $TOTAL_TESTS"
write_result "Passed Tests:  $PASSED_TESTS" "success"
write_result "Failed Tests:  $FAILED_TESTS" "failed"
write_result "Skipped Tests: $SKIPPED_TESTS" "warning"

PASS_RATE=0
if [ $TOTAL_TESTS -gt 0 ]; then
    PASS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS))
fi
echo "Pass Rate:     $PASS_RATE%"

write_result "========================================" "info"

if [ $FAILED_TESTS -eq 0 ]; then
    write_result "" "success"
    write_result "✓ All tests passed! RBAC is working correctly." "success"
    exit 0
else
    write_result "" "failed"
    write_result "✗ Some tests failed. Review the results above." "failed"
    exit 1
fi
