# Run accounting automation database migration

# Check if mysql is available
$mysqlPath = "mysql"
$hasMySQL = $false

try {
    $result = & mysql --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        $hasMySQL = $true
        Write-Host "✓ MySQL found: $result" -ForegroundColor Green
    }
}
catch {
    Write-Host "MySQL not found in PATH" -ForegroundColor Yellow
}

if (-not $hasMySQL) {
    Write-Host "`n⚠ MySQL CLI not found. Trying to connect using node script instead..." -ForegroundColor Yellow
    Write-Host "Creating Node.js migration script..." -ForegroundColor Cyan
    
    $nodeScript = @"
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'db',
        user: process.env.DB_USER || 'kiini_user',
        password: process.env.DB_PASSWORD || 'tjwzT9pW;NGYq1QxSq0B',
        database: process.env.DB_NAME || 'kiini',
        port: process.env.DB_PORT || 3306,
        multipleStatements: true,
    });

    const sqlFile = path.join(__dirname, 'migrations', 'accounting_automation_complete.sql');
    const sql = fs.readFileSync(sqlFile, 'utf-8');

    try {
        console.log('📊 Running accounting automation migration...');
        await connection.query(sql);
        console.log('✓ Migration completed successfully!');
    } catch (error) {
        console.error('✗ Migration failed:', error.message);
        process.exit(1);
    } finally {
        await connection.end();
    }
}

runMigration().catch(console.error);
"@
    
    $nodeScript | Out-File -FilePath "e:\Kiini\run_migration.js" -Encoding UTF8
    Write-Host "Running migration using Node.js..." -ForegroundColor Cyan
    node "e:\Kiini\run_migration.js"
    exit $LASTEXITCODE
}

# Parse DATABASE_URL from .env
$envFile = "e:\Kiini\.env"
if (Test-Path $envFile) {
    $content = Get-Content $envFile
    $dbUrl = $content | Select-String 'DATABASE_URL=' | ForEach-Object { $_ -replace '.*DATABASE_URL=', '' }
    
    if ($dbUrl) {
        Write-Host "Found DATABASE_URL: $($dbUrl -replace ':.*@', ':****@')" -ForegroundColor Green
        
        # Parse URL: mysql://user:password@host:port/database
        if ($dbUrl -match 'mysql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)') {
            $user = $matches[1]
            $password = $matches[2]
            $host = $matches[3]
            $port = $matches[4]
            $database = $matches[5]
            
            Write-Host "Connecting to MySQL at $host`:$port/$database..." -ForegroundColor Cyan
            
            # Run migration
            $sqlFile = "e:\Kiini\migrations\accounting_automation_complete.sql"
            Write-Host "Running migration file: $sqlFile" -ForegroundColor Cyan
            
            $securePassword = $password | ConvertTo-SecureString -AsPlainText -Force
            
            # Use mysql CLI to run the migration
            & mysql -h $host -P $port -u $user -p$password -D $database < $sqlFile
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "`n✓ Database migration completed successfully!" -ForegroundColor Green
                Write-Host "📊 New tables created:" -ForegroundColor Green
                Write-Host "  • organizationAccountingPolicies"
                Write-Host "  • journalEntries & journalEntryLines"
                Write-Host "  • debitNotes & creditNotes (extended)"
                Write-Host "  • imprests & imprestSurrenders"
                Write-Host "  • purchaseOrders & purchaseOrderItems & goodsReceiptNotes"
                Write-Host "  • leads"
                Write-Host "  • bankReconciliationStatements & bankReconciliationDetails"
                Write-Host "  • automationConfigs & workflowAutomationLogs"
            } else {
                Write-Host "`n✗ Migration failed!" -ForegroundColor Red
                exit 1
            }
        }
    }
}
