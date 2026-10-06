#!/usr/bin/env node

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Parse DATABASE_URL from .env
function parseDatabaseUrl(url) {
    const match = url.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    if (!match) {
        throw new Error('Invalid DATABASE_URL format');
    }
    return {
        user: match[1],
        password: match[2],
        host: match[3],
        port: parseInt(match[4]),
        database: match[5],
    };
}

async function runMigration() {
    try {
        // Load .env
        const envPath = path.join(__dirname, '.env');
        const envContent = fs.readFileSync(envPath, 'utf-8');
        const dbUrlMatch = envContent.match(/DATABASE_URL=(.+)/);
        
        if (!dbUrlMatch) {
            throw new Error('DATABASE_URL not found in .env');
        }
        
        const dbUrl = dbUrlMatch[1].trim();
        const config = parseDatabaseUrl(dbUrl);
        
        console.log(`📊 Connecting to MySQL at ${config.host}:${config.port}/${config.database}...`);
        
        const connection = await mysql.createConnection({
            host: config.host,
            user: config.user,
            password: config.password,
            database: config.database,
            port: config.port,
            multipleStatements: true,
        });
        
        console.log('✓ Connected to database');
        
        // Read migration file
        const sqlFile = path.join(__dirname, 'migrations', 'accounting_automation_complete.sql');
        
        if (!fs.existsSync(sqlFile)) {
            throw new Error(`Migration file not found: ${sqlFile}`);
        }
        
        const sql = fs.readFileSync(sqlFile, 'utf-8');
        
        console.log('🔄 Running migration...');
        console.log(`📄 Migration file: ${sqlFile}`);
        console.log(`📏 SQL size: ${(sql.length / 1024).toFixed(2)} KB`);
        
        await connection.query(sql);
        
        console.log('\n✅ Migration completed successfully!\n');
        console.log('📊 New tables created:');
        console.log('  ✓ organizationAccountingPolicies');
        console.log('  ✓ journalEntries & journalEntryLines');
        console.log('  ✓ debitNotes & creditNotes (extended)');
        console.log('  ✓ imprests & imprestSurrenders');
        console.log('  ✓ purchaseOrders & purchaseOrderItems');
        console.log('  ✓ goodsReceiptNotes');
        console.log('  ✓ leads');
        console.log('  ✓ bankReconciliationStatements');
        console.log('  ✓ automationConfigs & workflowAutomationLogs');
        console.log('\n🎯 Next step: Update server/routers.ts to include all 24 accounting routers\n');
        
        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Migration failed:', error.message);
        process.exit(1);
    }
}

runMigration();
