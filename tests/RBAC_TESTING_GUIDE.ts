/**
 * Manual Feature-Based Access Control Testing Guide
 * 
 * Steps to manually test the RBAC system with different user roles
 * to verify that permissions are properly enforced.
 */

// ============================================================================
// PART 1: SETUP - Create Test Users with Different Roles
// ============================================================================

/**
 * SQL Script to create test users with different roles
 * Run this in your database to create users for testing
 */

const CREATE_TEST_USERS_SQL = `
-- Create test users with different roles for RBAC testing
INSERT INTO users (id, name, email, password_hash, role, created_at, updated_at) VALUES
  ('test-super-admin-01', 'Test Super Admin', 'test.superadmin@kiini.local', SHA2('password123', 256), 'super_admin', NOW(), NOW()),
  ('test-admin-01', 'Test Admin', 'test.admin@kiini.local', SHA2('password123', 256), 'admin', NOW(), NOW()),
  ('test-accountant-01', 'Test Accountant', 'test.accountant@kiini.local', SHA2('password123', 256), 'accountant', NOW(), NOW()),
  ('test-pm-01', 'Test Project Manager', 'test.pm@kiini.local', SHA2('password123', 256), 'project_manager', NOW(), NOW()),
  ('test-hr-01', 'Test HR', 'test.hr@kiini.local', SHA2('password123', 256), 'hr', NOW(), NOW()),
  ('test-staff-01', 'Test Staff', 'test.staff@kiini.local', SHA2('password123', 256), 'staff', NOW(), NOW());
`;

// ============================================================================
// PART 2: AUTHENTICATION - Get JWT Tokens
// ============================================================================

/**
 * Step 1: Authenticate and get JWT tokens for each test user
 * 
 * Endpoint: POST /api/auth/login
 * 
 * Request:
 * {
 *   "email": "test.superadmin@kiini.local",
 *   "password": "password123"
 * }
 * 
 * Expected Response:
 * {
 *   "success": true,
 *   "user": {
 *     "id": "test-super-admin-01",
 *     "name": "Test Super Admin",
 *     "email": "test.superadmin@kiini.local",
 *     "role": "super_admin"
 *   },
 *   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * }
 */

const CURL_LOGIN = {
  superAdmin: `curl -X POST http://localhost:3000/api/auth/login \\
    -H "Content-Type: application/json" \\
    -d '{"email":"test.superadmin@kiini.local","password":"password123"}'`,
  
  admin: `curl -X POST http://localhost:3000/api/auth/login \\
    -H "Content-Type: application/json" \\
    -d '{"email":"test.admin@kiini.local","password":"password123"}'`,
  
  accountant: `curl -X POST http://localhost:3000/api/auth/login \\
    -H "Content-Type: application/json" \\
    -d '{"email":"test.accountant@kiini.local","password":"password123"}'`,
  
  pm: `curl -X POST http://localhost:3000/api/auth/login \\
    -H "Content-Type: application/json" \\
    -d '{"email":"test.pm@kiini.local","password":"password123"}'`,
  
  hr: `curl -X POST http://localhost:3000/api/auth/login \\
    -H "Content-Type: application/json" \\
    -d '{"email":"test.hr@kiini.local","password":"password123"}'`,
  
  staff: `curl -X POST http://localhost:3000/api/auth/login \\
    -H "Content-Type: application/json" \\
    -d '{"email":"test.staff@kiini.local","password":"password123"}'`,
};

// Store these tokens for use in subsequent requests
const TOKENS = {
  superAdmin: 'YOUR_SUPER_ADMIN_TOKEN',
  admin: 'YOUR_ADMIN_TOKEN',
  accountant: 'YOUR_ACCOUNTANT_TOKEN',
  pm: 'YOUR_PM_TOKEN',
  hr: 'YOUR_HR_TOKEN',
  staff: 'YOUR_STAFF_TOKEN',
};

// ============================================================================
// PART 3: TEST ACCESS CONTROL - Feature-Restricted Endpoints
// ============================================================================

/**
 * Test 1: roles:read - SuperAdmin and Admin only
 * https://github.com/routers/roles.ts - readProcedure
 * 
 * Expected Results:
 * - SuperAdmin: 200 OK ✓
 * - Admin: 200 OK ✓
 * - Accountant: 403 Forbidden ✗
 * - PM: 403 Forbidden ✗
 * - HR: 403 Forbidden ✗
 * - Staff: 403 Forbidden ✗
 */

const TEST_ROLES_READ = `
# Test Super Admin (should succeed)
curl -X GET http://localhost:3000/api/trpc/roles.read \\
  -H "Authorization: Bearer ${TOKENS.superAdmin}"
# Expected: 200 OK with roles array

# Test Admin (should succeed)
curl -X GET http://localhost:3000/api/trpc/roles.read \\
  -H "Authorization: Bearer ${TOKENS.admin}"
# Expected: 200 OK with roles array

# Test Accountant (should be denied)
curl -X GET http://localhost:3000/api/trpc/roles.read \\
  -H "Authorization: Bearer ${TOKENS.accountant}"
# Expected: 403 Forbidden - insufficient permissions

# Test Staff (should be denied)
curl -X GET http://localhost:3000/api/trpc/roles.read \\
  -H "Authorization: Bearer ${TOKENS.staff}"
# Expected: 403 Forbidden - insufficient permissions
`;

/**
 * Test 2: filters:create - Multiple roles (accountant, pm, hr, staff, etc.)
 * https://github.com/routers/savedFilters.ts - createProcedure
 * 
 * Expected Results:
 * - SuperAdmin: 200 OK ✓
 * - Admin: 200 OK ✓
 * - Accountant: 200 OK ✓
 * - PM: 200 OK ✓
 * - HR: 200 OK ✓
 * - Staff: 200 OK ✓
 */

const TEST_FILTERS_CREATE = `
# Test Staff (should succeed - filters:create is accessible)
curl -X POST http://localhost:3000/api/trpc/savedFilters.create \\
  -H "Authorization: Bearer ${TOKENS.staff}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "My Test Filter",
    "description": "Test filter for staff",
    "filterConfig": {"status": "active"}
  }'
# Expected: 200 OK with created filter

# Test Accountant (should succeed)
curl -X POST http://localhost:3000/api/trpc/savedFilters.create \\
  -H "Authorization: Bearer ${TOKENS.accountant}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Accounting Filter",
    "description": "Filter for accounting data",
    "filterConfig": {"type": "invoice"}
  }'
# Expected: 200 OK with created filter
`;

/**
 * Test 3: reports:create - SuperAdmin and Admin only
 * 
 * Expected Results:
 * - SuperAdmin: 200 OK ✓
 * - Admin: 200 OK ✓
 * - Accountant: 403 Forbidden ✗ (can view but not create)
 * - PM: 403 Forbidden ✗ (can view but not create)
 */

const TEST_REPORTS_CREATE = `
# Test Admin (should succeed)
curl -X POST http://localhost:3000/api/trpc/reportExport.create \\
  -H "Authorization: Bearer ${TOKENS.admin}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Monthly Revenue Report",
    "description": "Revenue for January",
    "reportType": "financial"
  }'
# Expected: 200 OK with created report

# Test Accountant (should be denied)
curl -X POST http://localhost:3000/api/trpc/reportExport.create \\
  -H "Authorization: Bearer ${TOKENS.accountant}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Monthly Revenue Report",
    "description": "Revenue for January",
    "reportType": "financial"
  }'
# Expected: 403 Forbidden - insufficient permissions

# Test ProjectManager (should be denied)
curl -X POST http://localhost:3000/api/trpc/reportExport.create \\
  -H "Authorization: Bearer ${TOKENS.pm}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Sales Report",
    "description": "Sales for January",
    "reportType": "sales"
  }'
# Expected: 403 Forbidden - insufficient permissions
`;

/**
 * Test 4: workflows:create - Automation management
 * 
 * Expected Results:
 * - SuperAdmin: 200 OK ✓
 * - Admin: 200 OK ✓
 * - All others: 403 Forbidden ✗
 */

const TEST_WORKFLOWS_CREATE = `
# Test Super Admin (should succeed)
curl -X POST http://localhost:3000/api/trpc/workflows.create \\
  -H "Authorization: Bearer ${TOKENS.superAdmin}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Auto Approval Workflow",
    "description": "Automatically approve small invoices",
    "triggers": ["invoice_created"],
    "actions": ["auto_approve"]
  }'
# Expected: 200 OK with created workflow

# Test Admin (should succeed)
curl -X POST http://localhost:3000/api/trpc/workflows.create \\
  -H "Authorization: Bearer ${TOKENS.admin}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Auto Approval Workflow",
    "description": "Automatically approve small invoices",
    "triggers": ["invoice_created"],
    "actions": ["auto_approve"]
  }'
# Expected: 200 OK with created workflow

# Test HR (should be denied)
curl -X POST http://localhost:3000/api/trpc/workflows.create \\
  -H "Authorization: Bearer ${TOKENS.hr}" \\
  -H "Content-Type: application/json" \\
  -d '{...}'
# Expected: 403 Forbidden - insufficient permissions
`;

// ============================================================================
// PART 4: TEST AUTHENTICATION FAILURES
// ============================================================================

/**
 * Test 5: No Token - Should be Rejected
 * 
 * Expected: 401 Unauthorized or 403 Forbidden
 */

const TEST_NO_TOKEN = `
# Test without token (should fail)
curl -X GET http://localhost:3000/api/trpc/roles.read
# Expected: 401 Unauthorized or 403 Forbidden

# Test with malformed token (should fail)
curl -X GET http://localhost:3000/api/trpc/roles.read \\
  -H "Authorization: Bearer invalid_token_xyz"
# Expected: 401 Unauthorized or 403 Forbidden
`;

// ============================================================================
// PART 5: TEST MATRIX - ALL ROLE/FEATURE COMBINATIONS
// ============================================================================

const COMPREHENSIVE_TEST_MATRIX = `
FEATURE                  | SUPER_ADMIN | ADMIN | ACCOUNTANT | PM | HR | STAFF
========================|=============|=======|============|====|====|=======
roles:read              | 200 OK      | 200   | 403 DENIED | 403| 403| 403
permissions:read        | 200 OK      | 200   | 403 DENIED | 403| 403| 403
settings:edit           | 200 OK      | 200   | 403 DENIED | 403| 403| 403
reports:create          | 200 OK      | 200   | 403 DENIED | 403| 403| 403
reports:view            | 200 OK      | 200   | 200 OK     | 200| 200| N/A
filters:create          | 200 OK      | 200   | 200 OK     | 200| 200| 200 OK
workflows:create        | 200 OK      | 200   | 403 DENIED | 403| 403| 403
timeEntries:create      | 200 OK      | 200   | 403 DENIED | 403| 200| 200 OK
hr:employees:edit       | 200 OK      | 200   | 403 DENIED | 403| 200| 403
hr:payroll:view         | 200 OK      | 200   | 403 DENIED | 403| 200| 403
payments:create         | 200 OK      | 200   | 200 OK     | 403| 403| 403
communications:send     | 200 OK      | 200   | 403 DENIED | 200| 200| 200 OK
automationJobs:create   | 200 OK      | 200   | 403 DENIED | 403| 403| 403
paymentReminders:create | 200 OK      | 200   | 403 DENIED | 403| 403| 403
jobGroups:edit          | 200 OK      | 200   | 403 DENIED | 403| 403| 403
performanceReviews:edit | 200 OK      | 200   | 403 DENIED | 403| 200| 403

KEY:
200 OK = Request succeeded - feature accessible
403 DENIED = Request denied - insufficient permissions
N/A = Role not expected to test this feature
`;

// ============================================================================
// PART 6: EXPECTED ERROR MESSAGES
// ============================================================================

const EXPECTED_ERROR_RESPONSES = {
  missingPermission: {
    status: 403,
    message: "Missing required feature: [feature_name]",
    orMessage: "Insufficient permissions for this operation",
  },
  
  noToken: {
    status: 401,
    message: "Unauthorized - No authentication token provided",
  },
  
  invalidToken: {
    status: 401,
    message: "Unauthorized - Invalid or expired token",
  },
  
  tokenExpired: {
    status: 401,
    message: "Unauthorized - Token has expired",
  },
};

// ============================================================================
// PART 7: VERIFICATION CHECKLIST
// ============================================================================

const VERIFICATION_CHECKLIST = `
[ ] Test 1: roles:read - Verify Super Admin and Admin have access
    - Super Admin can read roles: ✓/✗
    - Admin can read roles: ✓/✗
    - Staff denied access to read roles: ✓/✗

[ ] Test 2: filters:create - Verify multiple roles can create filters
    - Staff can create filters: ✓/✗
    - Accountant can create filters: ✓/✗
    - Admin can create filters: ✓/✗

[ ] Test 3: reports:create - Verify only admin roles can create
    - Admin can create reports: ✓/✗
    - Accountant denied creating reports: ✓/✗
    - PM denied creating reports: ✓/✗
    - HR denied creating reports: ✓/✗

[ ] Test 4: workflows:create - Verify only super admin and admin
    - Super Admin can create workflows: ✓/✗
    - Admin can create workflows: ✓/✗
    - All other roles denied: ✓/✗

[ ] Test 5: Authentication validation
    - No token returns 401: ✓/✗
    - Invalid token returns 401: ✓/✗
    - Valid token returns appropriate status: ✓/✗

[ ] Test 6: Feature mapping verification
    - All required features in FEATURE_ACCESS: ✓/✗
    - All routers using correct feature names: ✓/✗
    - Role permissions match database user roles: ✓/✗

[ ] Test 7: Error messages
    - Missing permission shows 403 status: ✓/✗
    - Error message indicates permission issue: ✓/✗
    - Not confused with authentication error: ✓/✗

SUCCESS CRITERIA:
✓ All tests pass with expected status codes
✓ All error messages are clear and consistent
✓ No privilege escalation possible
✓ Role-based access is properly enforced across all endpoints
✓ Feature-based access control working as designed
`;

// ============================================================================
// PART 8: SCRIPTS FOR BATCH TESTING
// ============================================================================

const BASH_BATCH_TEST = `#!/bin/bash

# RBAC Batch Testing Script

# Configuration
API_BASE="http://localhost:3000"
SUPER_ADMIN_TOKEN="${TOKENS.superAdmin}"
ADMIN_TOKEN="${TOKENS.admin}"
ACCOUNTANT_TOKEN="${TOKENS.accountant}"
PM_TOKEN="${TOKENS.pm}"
HR_TOKEN="${TOKENS.hr}"
STAFF_TOKEN="${TOKENS.staff}"

# Colors for output
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
NC='\\033[0m' # No Color

# Test function
test_endpoint() {
  local name=$1
  local token=$2
  local endpoint=$3
  local method=$4
  local data=$5
  local expected_status=$6
  
  local response=$(curl -s -w "\\n%{http_code}" -X "$method" "$API_BASE$endpoint" \\
    -H "Authorization: Bearer $token" \\
    -H "Content-Type: application/json" \\
    -d "$data" 2>/dev/null)
  
  local status=$(echo "$response" | tail -n1)
  local body=$(echo "$response" | head -n-1)
  
  if [ "$status" == "$expected_status" ]; then
    echo -e "${GREEN}✓${NC} $name - Status: $status (OK)"
  else
    echo -e "${RED}✗${NC} $name - Status: $status (Expected: $expected_status)"
  fi
}

# Run tests
echo "Testing RBAC with different roles..."
echo

# Test roles:read (Admin only)
test_endpoint "SuperAdmin - roles:read" "$SUPER_ADMIN_TOKEN" "/api/trpc/roles.read" "GET" "" "200"
test_endpoint "Admin - roles:read" "$ADMIN_TOKEN" "/api/trpc/roles.read" "GET" "" "200"
test_endpoint "Accountant - roles:read" "$ACCOUNTANT_TOKEN" "/api/trpc/roles.read" "GET" "" "403"
test_endpoint "Staff - roles:read" "$STAFF_TOKEN" "/api/trpc/roles.read" "GET" "" "403"

echo

# Test filters:create (Multiple roles)
test_endpoint "Staff - filters:create" "$STAFF_TOKEN" "/api/trpc/savedFilters.create" "POST" '{"name":"Test","filterConfig":{}}' "200"
test_endpoint "Accountant - filters:create" "$ACCOUNTANT_TOKEN" "/api/trpc/savedFilters.create" "POST" '{"name":"Test","filterConfig":{}}' "200"

echo

# Test reports:create (Admin only)
test_endpoint "Admin - reports:create" "$ADMIN_TOKEN" "/api/trpc/reportExport.create" "POST" '{"name":"Test Report"}' "200"
test_endpoint "Accountant - reports:create" "$ACCOUNTANT_TOKEN" "/api/trpc/reportExport.create" "POST" '{"name":"Test Report"}' "403"

echo

# Test without token
test_endpoint "No Token - roles:read" "" "/api/trpc/roles.read" "GET" "" "401"
`;

const POWERSHELL_BATCH_TEST = `# RBAC Batch Testing Script (PowerShell)

# Configuration
$apiBase = "http://localhost:3000"
$superAdminToken = "${TOKENS.superAdmin}"
$adminToken = "${TOKENS.admin}"
$accountantToken = "${TOKENS.accountant}"
$pmToken = "${TOKENS.pm}"
$hrToken = "${TOKENS.hr}"
$staffToken = "${TOKENS.staff}"

function Test-Endpoint {
    param(
        [string]$name,
        [string]$token,
        [string]$endpoint,
        [string]$method = "GET",
        [object]$data = $null,
        [int]$expectedStatus = 200
    )
    
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    if ($token) {
        $headers["Authorization"] = "Bearer $token"
    }
    
    try {
        $body = $data | ConvertTo-Json -Compress
        $response = Invoke-WebRequest -Uri "$apiBase$endpoint" -Method $method -Headers $headers -Body $body -ErrorAction SilentlyContinue
        $status = $response.StatusCode
    }
    catch {
        $status = $_.Exception.Response.StatusCode.value__
    }
    
    if ($status -eq $expectedStatus) {
        Write-Host "✓ $name - Status: $status (OK)" -ForegroundColor Green
    }
    else {
        Write-Host "✗ $name - Status: $status (Expected: $expectedStatus)" -ForegroundColor Red
    }
}

Write-Host "Testing RBAC with different roles..." -ForegroundColor Cyan
Write-Host

# Test roles:read (Admin only)
Test-Endpoint "SuperAdmin - roles:read" $superAdminToken "/api/trpc/roles.read" "GET" $null 200
Test-Endpoint "Admin - roles:read" $adminToken "/api/trpc/roles.read" "GET" $null 200
Test-Endpoint "Accountant - roles:read" $accountantToken "/api/trpc/roles.read" "GET" $null 403
Test-Endpoint "Staff - roles:read" $staffToken "/api/trpc/roles.read" "GET" $null 403

Write-Host
Write-Host "Tests completed!" -ForegroundColor Cyan
`;

export {
  CREATE_TEST_USERS_SQL,
  CURL_LOGIN,
  TEST_ROLES_READ,
  TEST_FILTERS_CREATE,
  TEST_REPORTS_CREATE,
  TEST_WORKFLOWS_CREATE,
  TEST_NO_TOKEN,
  COMPREHENSIVE_TEST_MATRIX,
  EXPECTED_ERROR_RESPONSES,
  VERIFICATION_CHECKLIST,
  BASH_BATCH_TEST,
  POWERSHELL_BATCH_TEST,
};
