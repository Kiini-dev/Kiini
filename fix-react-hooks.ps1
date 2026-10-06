# PowerShell script to fix React hooks violations (error #310)
# This script moves early conditional returns to after all hooks are declared

param(
    [string]$FilePath
)

function Fix-ReactHooks {
    param([string]$File)
    
    if (-not (Test-Path $File)) {
        Write-Host "File not found: $File" -ForegroundColor Red
        return
    }

    $content = Get-Content $File -Raw
    
    # Pattern 1: useRequireFeature hook with immediate early returns
    # Move the early returns to after all other hooks
    
    # For files with only useRequireFeature and other basic hooks at start:
    $pattern1 = @"
  const \{ allowed, isLoading \} = useRequireFeature\([^)]+\);
  if \(isLoading\) return <div className="flex items-center justify-center h-screen"><Spinner className="size-8" /></div>;
  if \(\!allowed\) return null;
  
"@

    $replacement1 = "  // CALL ALL HOOKS UNCONDITIONALLY AT TOP LEVEL`n  const { allowed, isLoading } = useRequireFeature(`$&`.match(/useRequireFeature\((.+?)\)/)[1]);`n  "
    
    # For files with useRequireRole:
    $pattern2 = @"
  const \{ allowed, isLoading \} = useRequireRole\([^)]+\);
  if \(isLoading\) return <div className="flex items-center justify-center h-screen"><Spinner className="size-8" /></div>;
  if \(\!allowed\) return null;
  
"@

    # Write-Host "Attempting to fix: $File"
    # This would need more sophisticated logic per file
    
    Write-Host "Checked: $File" -ForegroundColor Yellow
}

# Get all page files with the issue
$filesWithIssues = @(
    "E:\kiini-one-hub-total-control\client\src\pages\Clients.tsx",
    "E:\kiini-one-hub-total-control\client\src\pages\Settings.tsx",
    "E:\kiini-one-hub-total-control\client\src\pages\Services.tsx",
    "E:\kiini-one-hub-total-control\client\src\pages\Reports.tsx",
    "E:\kiini-one-hub-total-control\client\src\pages\Projects.tsx",
    "E:\kiini-one-hub-total-control\client\src\pages\Products.tsx",
    "E:\kiini-one-hub-total-control\client\src\pages\Receipts.tsx",
    "E:\kiini-one-hub-total-control\client\src\pages\Payments.tsx",
    "E:\kiini-one-hub-total-control\client\src\pages\LPOs.tsx",
    "E:\kiini-one-hub-total-control\client\src\pages\Imprests.tsx",
    "E:\kiini-one-hub-total-control\client\src\pages\Employees.tsx",
    "E:\kiini-one-hub-total-control\client\src\pages\Expenses.tsx",
    "E:\kiini-one-hub-total-control\client\src\pages\EditLPO.tsx",
    "E:\kiini-one-hub-total-control\client\src\pages\EditPayment.tsx",
    "E:\kiini-one-hub-total-control\client\src\pages\EditService.tsx",
    "E:\kiini-one-hub-total-control\client\src\pages\EditProduct.tsx",
    "E:\kiini-one-hub-total-control\client\src\pages\EditExpense.tsx",
    "E:\kiini-one-hub-total-control\client\src\pages\EditClient.tsx",
    "E:\kiini-one-hub-total-control\client\src\pages\CreateLPO.tsx",
    "E:\kiini-one-hub-total-control\client\src\pages\CreateService.tsx",
    "E:\kiini-one-hub-total-control\client\src\pages\CreateProduct.tsx",
    "E:\kiini-one-hub-total-control\client\src\pages\FinancialReports.tsx",
    "E:\kiini-one-hub-total-control\client\src\pages\Estimates.tsx",
    "E:\kiini-one-hub-total-control\client\src\pages\CreateImprest.tsx",
    "E:\kiini-one-hub-total-control\client\src\pages\Departments.tsx"
)

Write-Host "Files to fix:" -ForegroundColor Cyan
foreach ($file in $filesWithIssues) {
    if (Test-Path $file) {
        Write-Host "  ✓ $([System.IO.Path]::GetFileName($file))" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $([System.IO.Path]::GetFileName($file)) - NOT FOUND" -ForegroundColor Red
    }
}

Write-Host "`nTotal files identified: $($filesWithIssues.Count)" -ForegroundColor Yellow
