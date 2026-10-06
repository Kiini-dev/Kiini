# Execute Drizzle migrations for approval workflows
# Run with: powershell -ExecutionPolicy Bypass -File .\run-migration.ps1

param(
    [string]$DatabaseUrl = $env:DATABASE_URL,
    [string]$MigrationFile = ".\0018_add_approval_workflows.sql"
)

if (-not $DatabaseUrl) {
    $DatabaseUrl = "mysql://user:password@localhost:3306/kiini-one-hub-total-control"
}

Write-Host "🚀 Starting Approval Workflow Migration..." -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green

# Parse DATABASE_URL
$pattern = "^mysql://([^:]+):([^@]+)@([^:/]+):([0-9]+)/(.+)$"
if ($DatabaseUrl -match $pattern) {
    $dbUser = $matches[1]
    $dbPass = $matches[2]
    $dbHost = $matches[3]
    $dbPort = $matches[4]
    $dbName = $matches[5]
    
    Write-Host "📍 Database: $dbName @ ${dbHost}:${dbPort}" -ForegroundColor Cyan
    Write-Host "👤 User: $dbUser" -ForegroundColor Cyan
    
    # Check if migration file exists
    if (-not (Test-Path $MigrationFile)) {
        Write-Host "❌ Migration file not found: $MigrationFile" -ForegroundColor Red
        exit 1
    }
    
    # Read migration SQL
    $sqlContent = Get-Content $MigrationFile -Raw
    
    # Install/Update MySQL CLI if needed (optional, requires mysql package)
    # Try to use mysql command
    try {
        Write-Host "⏳ Executing migration..." -ForegroundColor Yellow
        
        # Create temporary SQL file with the migration
        $tempFile = New-TemporaryFile -ErrorAction Stop
        Set-Content -Path $tempFile.FullName -Value $sqlContent
        
        # Execute using mysql client
        $mysqlCmd = "mysql -h $dbHost -P $dbPort -u $dbUser -p$dbPass $dbName < $($tempFile.FullName)"
        Invoke-Expression $mysqlCmd -ErrorAction Stop
        
        # Cleanup
        Remove-Item $tempFile.FullName -Force
        
        Write-Host "✅ Migration completed successfully!" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  MySQL CLI not found or error executing migration" -ForegroundColor Yellow
        Write-Host "Alternative: Import the SQL manually:" -ForegroundColor Yellow
        Write-Host "  1. Open MySQL Workbench or CLI" -ForegroundColor Gray
        Write-Host "  2. Connect to: $dbHost`:$dbPort" -ForegroundColor Gray
        Write-Host "  3. Select database: $dbName" -ForegroundColor Gray
        Write-Host "  4. Execute the SQL from: $MigrationFile" -ForegroundColor Gray
    }
} else {
    Write-Host "❌ Invalid DATABASE_URL format" -ForegroundColor Red
    Write-Host "Expected: mysql://user:password@host:port/database" -ForegroundColor Red
    exit 1
}
