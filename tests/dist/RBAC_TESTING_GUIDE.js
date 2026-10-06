"use strict";
/**
 * Manual Feature-Based Access Control Testing Guide
 *
 * Steps to manually test the RBAC system with different user roles
 * to verify that permissions are properly enforced.
 */
exports.__esModule = true;
exports.POWERSHELL_BATCH_TEST = exports.BASH_BATCH_TEST = exports.VERIFICATION_CHECKLIST = exports.EXPECTED_ERROR_RESPONSES = exports.COMPREHENSIVE_TEST_MATRIX = exports.TEST_NO_TOKEN = exports.TEST_WORKFLOWS_CREATE = exports.TEST_REPORTS_CREATE = exports.TEST_FILTERS_CREATE = exports.TEST_ROLES_READ = exports.CURL_LOGIN = exports.CREATE_TEST_USERS_SQL = void 0;
// ============================================================================
// PART 1: SETUP - Create Test Users with Different Roles
// ============================================================================
/**
 * SQL Script to create test users with different roles
 * Run this in your database to create users for testing
 */
var CREATE_TEST_USERS_SQL = "\n-- Create test users with different roles for RBAC testing\nINSERT INTO users (id, name, email, password_hash, role, created_at, updated_at) VALUES\n  ('test-super-admin-01', 'Test Super Admin', 'test.superadmin@kiini.local', SHA2('password123', 256), 'super_admin', NOW(), NOW()),\n  ('test-admin-01', 'Test Admin', 'test.admin@kiini.local', SHA2('password123', 256), 'admin', NOW(), NOW()),\n  ('test-accountant-01', 'Test Accountant', 'test.accountant@kiini.local', SHA2('password123', 256), 'accountant', NOW(), NOW()),\n  ('test-pm-01', 'Test Project Manager', 'test.pm@kiini.local', SHA2('password123', 256), 'project_manager', NOW(), NOW()),\n  ('test-hr-01', 'Test HR', 'test.hr@kiini.local', SHA2('password123', 256), 'hr', NOW(), NOW()),\n  ('test-staff-01', 'Test Staff', 'test.staff@kiini.local', SHA2('password123', 256), 'staff', NOW(), NOW());\n";
exports.CREATE_TEST_USERS_SQL = CREATE_TEST_USERS_SQL;
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
var CURL_LOGIN = {
    superAdmin: "curl -X POST http://localhost:3000/api/auth/login \\\n    -H \"Content-Type: application/json\" \\\n    -d '{\"email\":\"test.superadmin@kiini.local\",\"password\":\"password123\"}'",
    admin: "curl -X POST http://localhost:3000/api/auth/login \\\n    -H \"Content-Type: application/json\" \\\n    -d '{\"email\":\"test.admin@kiini.local\",\"password\":\"password123\"}'",
    accountant: "curl -X POST http://localhost:3000/api/auth/login \\\n    -H \"Content-Type: application/json\" \\\n    -d '{\"email\":\"test.accountant@kiini.local\",\"password\":\"password123\"}'",
    pm: "curl -X POST http://localhost:3000/api/auth/login \\\n    -H \"Content-Type: application/json\" \\\n    -d '{\"email\":\"test.pm@kiini.local\",\"password\":\"password123\"}'",
    hr: "curl -X POST http://localhost:3000/api/auth/login \\\n    -H \"Content-Type: application/json\" \\\n    -d '{\"email\":\"test.hr@kiini.local\",\"password\":\"password123\"}'",
    staff: "curl -X POST http://localhost:3000/api/auth/login \\\n    -H \"Content-Type: application/json\" \\\n    -d '{\"email\":\"test.staff@kiini.local\",\"password\":\"password123\"}'"
};
exports.CURL_LOGIN = CURL_LOGIN;
// Store these tokens for use in subsequent requests
var TOKENS = {
    superAdmin: 'YOUR_SUPER_ADMIN_TOKEN',
    admin: 'YOUR_ADMIN_TOKEN',
    accountant: 'YOUR_ACCOUNTANT_TOKEN',
    pm: 'YOUR_PM_TOKEN',
    hr: 'YOUR_HR_TOKEN',
    staff: 'YOUR_STAFF_TOKEN'
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
var TEST_ROLES_READ = "\n# Test Super Admin (should succeed)\ncurl -X GET http://localhost:3000/api/trpc/roles.read \\\n  -H \"Authorization: Bearer " + TOKENS.superAdmin + "\"\n# Expected: 200 OK with roles array\n\n# Test Admin (should succeed)\ncurl -X GET http://localhost:3000/api/trpc/roles.read \\\n  -H \"Authorization: Bearer " + TOKENS.admin + "\"\n# Expected: 200 OK with roles array\n\n# Test Accountant (should be denied)\ncurl -X GET http://localhost:3000/api/trpc/roles.read \\\n  -H \"Authorization: Bearer " + TOKENS.accountant + "\"\n# Expected: 403 Forbidden - insufficient permissions\n\n# Test Staff (should be denied)\ncurl -X GET http://localhost:3000/api/trpc/roles.read \\\n  -H \"Authorization: Bearer " + TOKENS.staff + "\"\n# Expected: 403 Forbidden - insufficient permissions\n";
exports.TEST_ROLES_READ = TEST_ROLES_READ;
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
var TEST_FILTERS_CREATE = "\n# Test Staff (should succeed - filters:create is accessible)\ncurl -X POST http://localhost:3000/api/trpc/savedFilters.create \\\n  -H \"Authorization: Bearer " + TOKENS.staff + "\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\n    \"name\": \"My Test Filter\",\n    \"description\": \"Test filter for staff\",\n    \"filterConfig\": {\"status\": \"active\"}\n  }'\n# Expected: 200 OK with created filter\n\n# Test Accountant (should succeed)\ncurl -X POST http://localhost:3000/api/trpc/savedFilters.create \\\n  -H \"Authorization: Bearer " + TOKENS.accountant + "\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\n    \"name\": \"Accounting Filter\",\n    \"description\": \"Filter for accounting data\",\n    \"filterConfig\": {\"type\": \"invoice\"}\n  }'\n# Expected: 200 OK with created filter\n";
exports.TEST_FILTERS_CREATE = TEST_FILTERS_CREATE;
/**
 * Test 3: reports:create - SuperAdmin and Admin only
 *
 * Expected Results:
 * - SuperAdmin: 200 OK ✓
 * - Admin: 200 OK ✓
 * - Accountant: 403 Forbidden ✗ (can view but not create)
 * - PM: 403 Forbidden ✗ (can view but not create)
 */
var TEST_REPORTS_CREATE = "\n# Test Admin (should succeed)\ncurl -X POST http://localhost:3000/api/trpc/reportExport.create \\\n  -H \"Authorization: Bearer " + TOKENS.admin + "\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\n    \"name\": \"Monthly Revenue Report\",\n    \"description\": \"Revenue for January\",\n    \"reportType\": \"financial\"\n  }'\n# Expected: 200 OK with created report\n\n# Test Accountant (should be denied)\ncurl -X POST http://localhost:3000/api/trpc/reportExport.create \\\n  -H \"Authorization: Bearer " + TOKENS.accountant + "\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\n    \"name\": \"Monthly Revenue Report\",\n    \"description\": \"Revenue for January\",\n    \"reportType\": \"financial\"\n  }'\n# Expected: 403 Forbidden - insufficient permissions\n\n# Test ProjectManager (should be denied)\ncurl -X POST http://localhost:3000/api/trpc/reportExport.create \\\n  -H \"Authorization: Bearer " + TOKENS.pm + "\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\n    \"name\": \"Sales Report\",\n    \"description\": \"Sales for January\",\n    \"reportType\": \"sales\"\n  }'\n# Expected: 403 Forbidden - insufficient permissions\n";
exports.TEST_REPORTS_CREATE = TEST_REPORTS_CREATE;
/**
 * Test 4: workflows:create - Automation management
 *
 * Expected Results:
 * - SuperAdmin: 200 OK ✓
 * - Admin: 200 OK ✓
 * - All others: 403 Forbidden ✗
 */
var TEST_WORKFLOWS_CREATE = "\n# Test Super Admin (should succeed)\ncurl -X POST http://localhost:3000/api/trpc/workflows.create \\\n  -H \"Authorization: Bearer " + TOKENS.superAdmin + "\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\n    \"name\": \"Auto Approval Workflow\",\n    \"description\": \"Automatically approve small invoices\",\n    \"triggers\": [\"invoice_created\"],\n    \"actions\": [\"auto_approve\"]\n  }'\n# Expected: 200 OK with created workflow\n\n# Test Admin (should succeed)\ncurl -X POST http://localhost:3000/api/trpc/workflows.create \\\n  -H \"Authorization: Bearer " + TOKENS.admin + "\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\n    \"name\": \"Auto Approval Workflow\",\n    \"description\": \"Automatically approve small invoices\",\n    \"triggers\": [\"invoice_created\"],\n    \"actions\": [\"auto_approve\"]\n  }'\n# Expected: 200 OK with created workflow\n\n# Test HR (should be denied)\ncurl -X POST http://localhost:3000/api/trpc/workflows.create \\\n  -H \"Authorization: Bearer " + TOKENS.hr + "\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '{...}'\n# Expected: 403 Forbidden - insufficient permissions\n";
exports.TEST_WORKFLOWS_CREATE = TEST_WORKFLOWS_CREATE;
// ============================================================================
// PART 4: TEST AUTHENTICATION FAILURES
// ============================================================================
/**
 * Test 5: No Token - Should be Rejected
 *
 * Expected: 401 Unauthorized or 403 Forbidden
 */
var TEST_NO_TOKEN = "\n# Test without token (should fail)\ncurl -X GET http://localhost:3000/api/trpc/roles.read\n# Expected: 401 Unauthorized or 403 Forbidden\n\n# Test with malformed token (should fail)\ncurl -X GET http://localhost:3000/api/trpc/roles.read \\\n  -H \"Authorization: Bearer invalid_token_xyz\"\n# Expected: 401 Unauthorized or 403 Forbidden\n";
exports.TEST_NO_TOKEN = TEST_NO_TOKEN;
// ============================================================================
// PART 5: TEST MATRIX - ALL ROLE/FEATURE COMBINATIONS
// ============================================================================
var COMPREHENSIVE_TEST_MATRIX = "\nFEATURE                  | SUPER_ADMIN | ADMIN | ACCOUNTANT | PM | HR | STAFF\n========================|=============|=======|============|====|====|=======\nroles:read              | 200 OK      | 200   | 403 DENIED | 403| 403| 403\npermissions:read        | 200 OK      | 200   | 403 DENIED | 403| 403| 403\nsettings:edit           | 200 OK      | 200   | 403 DENIED | 403| 403| 403\nreports:create          | 200 OK      | 200   | 403 DENIED | 403| 403| 403\nreports:view            | 200 OK      | 200   | 200 OK     | 200| 200| N/A\nfilters:create          | 200 OK      | 200   | 200 OK     | 200| 200| 200 OK\nworkflows:create        | 200 OK      | 200   | 403 DENIED | 403| 403| 403\ntimeEntries:create      | 200 OK      | 200   | 403 DENIED | 403| 200| 200 OK\nhr:employees:edit       | 200 OK      | 200   | 403 DENIED | 403| 200| 403\nhr:payroll:view         | 200 OK      | 200   | 403 DENIED | 403| 200| 403\npayments:create         | 200 OK      | 200   | 200 OK     | 403| 403| 403\ncommunications:send     | 200 OK      | 200   | 403 DENIED | 200| 200| 200 OK\nautomationJobs:create   | 200 OK      | 200   | 403 DENIED | 403| 403| 403\npaymentReminders:create | 200 OK      | 200   | 403 DENIED | 403| 403| 403\njobGroups:edit          | 200 OK      | 200   | 403 DENIED | 403| 403| 403\nperformanceReviews:edit | 200 OK      | 200   | 403 DENIED | 403| 200| 403\n\nKEY:\n200 OK = Request succeeded - feature accessible\n403 DENIED = Request denied - insufficient permissions\nN/A = Role not expected to test this feature\n";
exports.COMPREHENSIVE_TEST_MATRIX = COMPREHENSIVE_TEST_MATRIX;
// ============================================================================
// PART 6: EXPECTED ERROR MESSAGES
// ============================================================================
var EXPECTED_ERROR_RESPONSES = {
    missingPermission: {
        status: 403,
        message: "Missing required feature: [feature_name]",
        orMessage: "Insufficient permissions for this operation"
    },
    noToken: {
        status: 401,
        message: "Unauthorized - No authentication token provided"
    },
    invalidToken: {
        status: 401,
        message: "Unauthorized - Invalid or expired token"
    },
    tokenExpired: {
        status: 401,
        message: "Unauthorized - Token has expired"
    }
};
exports.EXPECTED_ERROR_RESPONSES = EXPECTED_ERROR_RESPONSES;
// ============================================================================
// PART 7: VERIFICATION CHECKLIST
// ============================================================================
var VERIFICATION_CHECKLIST = "\n[ ] Test 1: roles:read - Verify Super Admin and Admin have access\n    - Super Admin can read roles: \u2713/\u2717\n    - Admin can read roles: \u2713/\u2717\n    - Staff denied access to read roles: \u2713/\u2717\n\n[ ] Test 2: filters:create - Verify multiple roles can create filters\n    - Staff can create filters: \u2713/\u2717\n    - Accountant can create filters: \u2713/\u2717\n    - Admin can create filters: \u2713/\u2717\n\n[ ] Test 3: reports:create - Verify only admin roles can create\n    - Admin can create reports: \u2713/\u2717\n    - Accountant denied creating reports: \u2713/\u2717\n    - PM denied creating reports: \u2713/\u2717\n    - HR denied creating reports: \u2713/\u2717\n\n[ ] Test 4: workflows:create - Verify only super admin and admin\n    - Super Admin can create workflows: \u2713/\u2717\n    - Admin can create workflows: \u2713/\u2717\n    - All other roles denied: \u2713/\u2717\n\n[ ] Test 5: Authentication validation\n    - No token returns 401: \u2713/\u2717\n    - Invalid token returns 401: \u2713/\u2717\n    - Valid token returns appropriate status: \u2713/\u2717\n\n[ ] Test 6: Feature mapping verification\n    - All required features in FEATURE_ACCESS: \u2713/\u2717\n    - All routers using correct feature names: \u2713/\u2717\n    - Role permissions match database user roles: \u2713/\u2717\n\n[ ] Test 7: Error messages\n    - Missing permission shows 403 status: \u2713/\u2717\n    - Error message indicates permission issue: \u2713/\u2717\n    - Not confused with authentication error: \u2713/\u2717\n\nSUCCESS CRITERIA:\n\u2713 All tests pass with expected status codes\n\u2713 All error messages are clear and consistent\n\u2713 No privilege escalation possible\n\u2713 Role-based access is properly enforced across all endpoints\n\u2713 Feature-based access control working as designed\n";
exports.VERIFICATION_CHECKLIST = VERIFICATION_CHECKLIST;
// ============================================================================
// PART 8: SCRIPTS FOR BATCH TESTING
// ============================================================================
var BASH_BATCH_TEST = "#!/bin/bash\n\n# RBAC Batch Testing Script\n\n# Configuration\nAPI_BASE=\"http://localhost:3000\"\nSUPER_ADMIN_TOKEN=\"" + TOKENS.superAdmin + "\"\nADMIN_TOKEN=\"" + TOKENS.admin + "\"\nACCOUNTANT_TOKEN=\"" + TOKENS.accountant + "\"\nPM_TOKEN=\"" + TOKENS.pm + "\"\nHR_TOKEN=\"" + TOKENS.hr + "\"\nSTAFF_TOKEN=\"" + TOKENS.staff + "\"\n\n# Colors for output\nRED='\\033[0;31m'\nGREEN='\\033[0;32m'\nYELLOW='\\033[1;33m'\nNC='\\033[0m' # No Color\n\n# Test function\ntest_endpoint() {\n  local name=$1\n  local token=$2\n  local endpoint=$3\n  local method=$4\n  local data=$5\n  local expected_status=$6\n  \n  local response=$(curl -s -w \"\\n%{http_code}\" -X \"$method\" \"$API_BASE$endpoint\" \\\n    -H \"Authorization: Bearer $token\" \\\n    -H \"Content-Type: application/json\" \\\n    -d \"$data\" 2>/dev/null)\n  \n  local status=$(echo \"$response\" | tail -n1)\n  local body=$(echo \"$response\" | head -n-1)\n  \n  if [ \"$status\" == \"$expected_status\" ]; then\n    echo -e \"" + GREEN + "\u2713" + NC + " $name - Status: $status (OK)\"\n  else\n    echo -e \"" + RED + "\u2717" + NC + " $name - Status: $status (Expected: $expected_status)\"\n  fi\n}\n\n# Run tests\necho \"Testing RBAC with different roles...\"\necho\n\n# Test roles:read (Admin only)\ntest_endpoint \"SuperAdmin - roles:read\" \"$SUPER_ADMIN_TOKEN\" \"/api/trpc/roles.read\" \"GET\" \"\" \"200\"\ntest_endpoint \"Admin - roles:read\" \"$ADMIN_TOKEN\" \"/api/trpc/roles.read\" \"GET\" \"\" \"200\"\ntest_endpoint \"Accountant - roles:read\" \"$ACCOUNTANT_TOKEN\" \"/api/trpc/roles.read\" \"GET\" \"\" \"403\"\ntest_endpoint \"Staff - roles:read\" \"$STAFF_TOKEN\" \"/api/trpc/roles.read\" \"GET\" \"\" \"403\"\n\necho\n\n# Test filters:create (Multiple roles)\ntest_endpoint \"Staff - filters:create\" \"$STAFF_TOKEN\" \"/api/trpc/savedFilters.create\" \"POST\" '{\"name\":\"Test\",\"filterConfig\":{}}' \"200\"\ntest_endpoint \"Accountant - filters:create\" \"$ACCOUNTANT_TOKEN\" \"/api/trpc/savedFilters.create\" \"POST\" '{\"name\":\"Test\",\"filterConfig\":{}}' \"200\"\n\necho\n\n# Test reports:create (Admin only)\ntest_endpoint \"Admin - reports:create\" \"$ADMIN_TOKEN\" \"/api/trpc/reportExport.create\" \"POST\" '{\"name\":\"Test Report\"}' \"200\"\ntest_endpoint \"Accountant - reports:create\" \"$ACCOUNTANT_TOKEN\" \"/api/trpc/reportExport.create\" \"POST\" '{\"name\":\"Test Report\"}' \"403\"\n\necho\n\n# Test without token\ntest_endpoint \"No Token - roles:read\" \"\" \"/api/trpc/roles.read\" \"GET\" \"\" \"401\"\n";
exports.BASH_BATCH_TEST = BASH_BATCH_TEST;
var POWERSHELL_BATCH_TEST = "# RBAC Batch Testing Script (PowerShell)\n\n# Configuration\n$apiBase = \"http://localhost:3000\"\n$superAdminToken = \"" + TOKENS.superAdmin + "\"\n$adminToken = \"" + TOKENS.admin + "\"\n$accountantToken = \"" + TOKENS.accountant + "\"\n$pmToken = \"" + TOKENS.pm + "\"\n$hrToken = \"" + TOKENS.hr + "\"\n$staffToken = \"" + TOKENS.staff + "\"\n\nfunction Test-Endpoint {\n    param(\n        [string]$name,\n        [string]$token,\n        [string]$endpoint,\n        [string]$method = \"GET\",\n        [object]$data = $null,\n        [int]$expectedStatus = 200\n    )\n    \n    $headers = @{\n        \"Content-Type\" = \"application/json\"\n    }\n    \n    if ($token) {\n        $headers[\"Authorization\"] = \"Bearer $token\"\n    }\n    \n    try {\n        $body = $data | ConvertTo-Json -Compress\n        $response = Invoke-WebRequest -Uri \"$apiBase$endpoint\" -Method $method -Headers $headers -Body $body -ErrorAction SilentlyContinue\n        $status = $response.StatusCode\n    }\n    catch {\n        $status = $_.Exception.Response.StatusCode.value__\n    }\n    \n    if ($status -eq $expectedStatus) {\n        Write-Host \"\u2713 $name - Status: $status (OK)\" -ForegroundColor Green\n    }\n    else {\n        Write-Host \"\u2717 $name - Status: $status (Expected: $expectedStatus)\" -ForegroundColor Red\n    }\n}\n\nWrite-Host \"Testing RBAC with different roles...\" -ForegroundColor Cyan\nWrite-Host\n\n# Test roles:read (Admin only)\nTest-Endpoint \"SuperAdmin - roles:read\" $superAdminToken \"/api/trpc/roles.read\" \"GET\" $null 200\nTest-Endpoint \"Admin - roles:read\" $adminToken \"/api/trpc/roles.read\" \"GET\" $null 200\nTest-Endpoint \"Accountant - roles:read\" $accountantToken \"/api/trpc/roles.read\" \"GET\" $null 403\nTest-Endpoint \"Staff - roles:read\" $staffToken \"/api/trpc/roles.read\" \"GET\" $null 403\n\nWrite-Host\nWrite-Host \"Tests completed!\" -ForegroundColor Cyan\n";
exports.POWERSHELL_BATCH_TEST = POWERSHELL_BATCH_TEST;
