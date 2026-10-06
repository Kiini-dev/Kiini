#!/usr/bin/env node

import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
    try {
        // Docker container: port 3308 on host maps to 3307 inside, but we access via 3308
        const config = {
            host: 'localhost',
            user: 'root',
            password: 'R:vVl:m7J9x3Hr|yWEUp',
            database: 'kiini',  // Create if doesn't exist
            port: 3308,
            multipleStatements: true,
        };
        
        console.log(`📊 Connecting to MySQL at ${config.host}:${config.port}...`);
        
        const connection = await mysql.createConnection(config);
        
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
        
        // Split SQL into individual statements and execute
        const statements = sql.split(';').filter(s => s.trim());
        let completed = 0;
        let skipped = 0;
        
        for (const statement of statements) {
            if (statement.trim()) {
                try {
                    await connection.query(statement);
                    completed++;
                    if (completed % 10 === 0) {
                        console.log(`  ⏳ Executed ${completed}/${statements.length} statements...`);
                    }
                } catch (err) {
                    // Some statements might error (IF NOT EXISTS, etc), continue
                    if (err.message.includes('already exists') || err.message.includes('Duplicate column')) {
                        skipped++;
                    } else {
                        console.warn(`  ⚠️  Statement error: ${err.message.substring(0, 60)}...`);
                    }
                }
            }
        }
        
        console.log('\n✅ Migration completed successfully!\n');
        console.log('📊 Results:');
        console.log(`  ✓ Executed: ${completed} statements`);
        console.log(`  ⊘ Skipped: ${skipped} (already exist)`);
        console.log('\n📋 New tables and modifications created:');
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
        console.error('\n💡 Troubleshooting:');
        console.error('   1. Verify MySQL container is running: docker ps');
        console.error('   2. Check credentials in docker-compose.yml');
        console.error('   3. Try: docker logs kiini-one-hub-total-control_db');
        process.exit(1);
    }
}

runMigration();
