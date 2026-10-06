#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Feature-Based Access Control (RBAC) Testing Script
    Tests API endpoints to verify permission enforcement for different user roles

.DESCRIPTION
    This PowerShell script tests the Kiini RBAC system by:
    1. Creating test JWT tokens for different roles
    2. Testing access to protected endpoints
    3. Verifying permission enforcement
    4. Reporting results in a clear format

.PARAMETER ApiUrl
    Base URL of the API (default: http://localhost:3000)

.PARAMETER Verbose
    Show detailed request/response information

.EXAMPLE
    .\test-rbac.ps1 -ApiUrl "http://localhost:3000" -Verbose

.NOTES
    Requires: PowerShell 7+ or PowerShell Core
    Make sure test users exist in the database before running
#>

param(
    [string]$ApiUrl = "http://localhost:3000",
    [switch]$Verbose
)

# Colors for output
$colors = @{
    Success = 'Green'
    Failed = 'Red'
    Warning = 'Yellow'
    Info = 'Cyan'
    Neutral = 'White'
}

# Counter for results
$results = @{
    Total = 0
    Passed = 0
    Failed = 0
    Skipped = 0
}

# Function to write colored output
function Write-Result {
    param(
        [string]$Message,
        [ValidateSet('Success', 'Failed', 'Warning', 'Info', 'Neutral')]
        [string]$Status = 'Neutral'
    )
    Write-Host $Message -ForegroundColor $colors[$Status]
}

# Function to test an endpoint
function Invoke-RBACTest {
    param(
        [string]$TestName,
        [string]$Token,
        [string]$Endpoint,
        [string]$Method = "GET",
        [hashtable]$Body = $null,
        [int]$ExpectedStatus = 200,
        [string]$UserRole = "Unknown"
    )
    
    $results.Total++
    
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    if ($Token) {
        $headers["Authorization"] = "Bearer $token"
    }
    
    $uri = "$ApiUrl$Endpoint"
    
    if ($Verbose) {
        Write-Host "`n  → Testing: $TestName"
        Write-Host "    User Role: $UserRole"
        Write-Host "    Method: $Method $uri"
    }
    
    try {
        $params = @{
            Uri = $uri
            Method = $Method
            Headers = $headers
            ErrorAction = "SilentlyContinue"
            UseBasicParsing = $true
        }
        
        if ($Body) {
            $params['Body'] = ($Body | ConvertTo-Json -Compress)
        }
        
        $response = Invoke-WebRequest @params
        $status = $response.StatusCode
        $responseBody = $response.Content
    }
    catch {
        $status = $_.Exception.Response.StatusCode.Value__
        $responseBody = $_.Exception.Response.Content.ReadAsStringAsync().Result
    }
    
    # Check if test passed
    $testPassed = $status -eq $ExpectedStatus
    
    if ($testPassed) {
        $results.Passed++
        Write-Result "  ✓ PASS: $TestName (Status: $status)" 'Success'
    }
    else {
        $results.Failed++
        Write-Result "  ✗ FAIL: $TestName (Status: $status, Expected: $ExpectedStatus)" 'Failed'
    }
    
    if ($Verbose) {
        Write-Host "    Response Status: $status"
        if ($responseBody) {
            $truncated = if ($responseBody.Length -gt 200) { 
                $responseBody.Substring(0, 200) + "..." 
            } 
            else { 
                $responseBody 
            }
            Write-Host "    Response: $truncated"
        }
    }
    
    return @{
        Status = $status
        Passed = $testPassed
        Body = $responseBody
    }
}

# ============================================================================
# MAIN TESTING FLOW
# ============================================================================

Write-Host ""
Write-Result "========================================" 'Info'
Write-Result "Features-Based Access Control (RBAC) Test" 'Info'
Write-Result "========================================" 'Info'
Write-Result "API Base URL: $ApiUrl" 'Info'
Write-Result "Testing Time: $(Get-Date)" 'Info'
Write-Result "========================================" 'Info'
Write-Host ""

# Step 1: Check if API is running
Write-Result "`n[1/4] Checking API connectivity..." 'Info'
try {
    $response = Invoke-WebRequest -Uri "$ApiUrl/api/health" -ErrorAction SilentlyContinue -UseBasicParsing
    Write-Result "✓ API is running and responding" 'Success'
}
catch {
    Write-Result "✗ Cannot reach API at $ApiUrl" 'Failed'
    Write-Result "  Make sure the application is running: docker-compose up -d" 'Warning'
    exit 1
}

# Step 2: Authentication - Get tokens for test users
Write-Result "`n[2/4] Authenticating test users..." 'Info'

$testUsers = @(
    @{ Email = "test.superadmin@kiini.local"; Password = "password123"; Role = "super_admin"; Name = "Super Admin" }
    @{ Email = "test.admin@kiini.local"; Password = "password123"; Role = "admin"; Name = "Admin" }
    @{ Email = "test.accountant@kiini.local"; Password = "password123"; Role = "accountant"; Name = "Accountant" }
    @{ Email = "test.pm@kiini.local"; Password = "password123"; Role = "project_manager"; Name = "Project Manager" }
    @{ Email = "test.hr@kiini.local"; Password = "password123"; Role = "hr"; Name = "HR" }
    @{ Email = "test.staff@kiini.local"; Password = "password123"; Role = "staff"; Name = "Staff" }
)

$tokens = @{}

foreach ($user in $testUsers) {
    try {
        $loginBody = @{
            email = $user.Email
            password = $user.Password
        } | ConvertTo-Json
        
        $response = Invoke-WebRequest -Uri "$ApiUrl/api/auth/login" `
            -Method POST `
            -Headers @{"Content-Type" = "application/json"} `
            -Body $loginBody `
            -ErrorAction SilentlyContinue `
            -UseBasicParsing
        
        $responseData = $response.Content | ConvertFrom-Json
        $tokens[$user.Role] = $responseData.token
        
        Write-Result "  ✓ Authenticated: $($user.Name) ($($user.Role))" 'Success'
    }
    catch {
        Write-Result "  ⚠ Could not authenticate $($user.Name) - User may not exist in database" 'Warning'
        $results.Skipped++
    }
}

if ($tokens.Count -eq 0) {
    Write-Result "`n✗ No test users authenticated. Please create test users first:" 'Failed'
    Write-Host "  Run the following in your database:"
    Write-Host "  " + (Get-Content "tests/RBAC_TESTING_GUIDE.ts" | Select-String "INSERT INTO users" -Context 0, 5).Line
    exit 1
}

# Step 3: Test Feature-Based Access Control
Write-Result "`n[3/4] Testing feature-based access control..." 'Info'

# Test matrix: Feature -> Allowed Roles
$accessMatrix = @{
    "/api/trpc/roles.read" = @{
        Allowed = @("super_admin", "admin")
        NotAllowed = @("accountant", "project_manager", "hr", "staff")
        Method = "GET"
    }
    "/api/trpc/savedFilters.create" = @{
        Allowed = @("super_admin", "admin", "accountant", "project_manager", "hr", "staff")
        NotAllowed = @()
        Method = "POST"
        Body = @{
            name = "Test Filter"
            description = "Test filter for RBAC testing"
            filterConfig = @{ status = "active" }
        }
    }
    "/api/trpc/reportExport.create" = @{
        Allowed = @("super_admin", "admin")
        NotAllowed = @("accountant", "project_manager", "hr", "staff")
        Method = "POST"
        Body = @{
            name = "Test Report"
            description = "Test report for RBAC testing"
            reportType = "financial"
        }
    }
    "/api/trpc/workflows.create" = @{
        Allowed = @("super_admin", "admin")
        NotAllowed = @("accountant", "project_manager", "hr", "staff")
        Method = "POST"
        Body = @{
            name = "Test Workflow"
            description = "Test workflow"
            triggers = @("manual")
            actions = @("notify")
        }
    }
}

foreach ($endpoint in $accessMatrix.Keys) {
    $config = $accessMatrix[$endpoint]
    Write-Result "`nTesting: $endpoint" 'Neutral'
    Write-Host "  Expected: Can access ($($config.Allowed -join ', '))" -ForegroundColor Gray
    Write-Host "  Expected: Cannot access ($($config.NotAllowed -join ', '))" -ForegroundColor Gray
    
    # Test allowed roles
    foreach ($role in $config.Allowed) {
        if ($tokens.ContainsKey($role)) {
            $testUser = $testUsers | Where-Object { $_.Role -eq $role }
            $testName = "$($testUser.Name) - Should have access"
            
            Invoke-RBACTest -TestName $testName `
                -Token $tokens[$role] `
                -Endpoint $endpoint `
                -Method $config.Method `
                -Body $config.Body `
                -ExpectedStatus 200 `
                -UserRole $role
        }
    }
    
    # Test disallowed roles
    foreach ($role in $config.NotAllowed) {
        if ($tokens.ContainsKey($role)) {
            $testUser = $testUsers | Where-Object { $_.Role -eq $role }
            $testName = "$($testUser.Name) - Should NOT have access"
            
            Invoke-RBACTest -TestName $testName `
                -Token $tokens[$role] `
                -Endpoint $endpoint `
                -Method $config.Method `
                -Body $config.Body `
                -ExpectedStatus 403 `
                -UserRole $role
        }
    }
}

# Step 4: Test Authentication Failures
Write-Result "`n[4/4] Testing authentication enforcement..." 'Info'

Write-Result "`nTesting: No authentication token" 'Neutral'
Invoke-RBACTest -TestName "No Token - Should be rejected" `
    -Token $null `
    -Endpoint "/api/trpc/roles.read" `
    -ExpectedStatus 401

Write-Result "`nTesting: Invalid authentication token" 'Neutral'
Invoke-RBACTest -TestName "Invalid Token - Should be rejected" `
    -Token "invalid_token_xyz_12345" `
    -Endpoint "/api/trpc/roles.read" `
    -ExpectedStatus 401

# ============================================================================
# Summary Report
# ============================================================================

Write-Host "`n"
Write-Result "========================================" 'Info'
Write-Result "Test Summary" 'Info'
Write-Result "========================================" 'Info'

Write-Host "Total Tests:   $($results.Total)" -ForegroundColor White
Write-Result "Passed Tests:  $($results.Passed)" 'Success'
Write-Result "Failed Tests:  $($results.Failed)" 'Failed'
Write-Result "Skipped Tests: $($results.Skipped)" 'Warning'

$passPercentage = if ($results.Total -gt 0) { 
    [math]::Round(($results.Passed / $results.Total) * 100, 2) 
} else { 
    0 
}

Write-Host "Pass Rate:     $passPercentage%" -ForegroundColor $(if ($results.Failed -eq 0) { 'Green' } else { 'Red' })

Write-Result "========================================" 'Info'

if ($results.Failed -eq 0) {
    Write-Result "`n✓ All tests passed! RBAC is working correctly." 'Success'
    exit 0
}
else {
    Write-Result "`n✗ Some tests failed. Review the results above." 'Failed'
    exit 1
}
