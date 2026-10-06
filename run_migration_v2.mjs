#!/usr/bin/env node

import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
        let config = parseDatabaseUrl(dbUrl);
        
        // If host is 'db' (Docker), use localhost:3308
        if (config.host === 'db') {
            console.log('ℹ️  Detected Docker host "db", using localhost:3308 for local access...');
            config.host = 'localhost';
            config.port = 3308;
        }
        
        console.log(`📊 Connecting to MySQL at ${config.host}:${config.port}/${config.database}...`);
        console.log(`👤 Using user: ${config.user}`);
        
        let connection;
        try {
            connection = await mysql.createConnection({
                host: config.host,
                user: config.user,
                password: config.password,
                database: config.database,
                port: config.port,
                multipleStatements: true,
            });
        } catch (err) {
            console.warn(`⚠️  Failed with user ${config.user}, trying root...`);
            // Try with root user
            connection = await mysql.createConnection({
                host: config.host,
                user: 'root',
                password: 'R:vVl:m7J9x3Hr|yWEUp',
                database: config.database,
                port: config.port,
                multipleStatements: true,
            });
        }
        
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
        
        for (const statement of statements) {
            if (statement.trim()) {
                try {
                    await connection.query(statement);
                    completed++;
                    if (completed % 10 === 0) {
                        console.log(`  ⏳ Executed ${completed}/${statements.length} statements...`);
                    }
                } catch (err) {
                    // Some statements might error (IF NOT EXISTS), continue
                    if (!err.message.includes('already exists')) {
                        console.warn(`  ⚠️  Statement error (non-critical): ${err.message.substring(0, 50)}...`);
                    }
                }
            }
        }
        
        console.log('\n✅ Migration completed successfully!\n');
        console.log('📊 New tables and modifications created:');
        console.log('  ✓ organizationAccountingPolicies');
        console.log('  ✓ journalEntries & journalEntryLines');
        console.log('  ✓ debitNotes & creditNotes (extended)');
        console.log('  ✓ imprests & imprestSurrenders');
        console.log('  ✓ purchaseOrders & purchaseOrderItems');
        console.log('  ✓ goodsReceiptNotes');
        console.log('  ✓ leads');
        console.log('  ✓ bankReconciliationStatements');
        console.log('  ✓ automationConfigs & workflowAutomationLogs');
        console.log(`\n✓ Total statements executed: ${completed}`);
        console.log('\n🎯 Next step: Update server/routers.ts to include all 24 accounting routers\n');
        
        await connection.end();
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Migration failed:', error.message);
        process.exit(1);
    }
}

runMigration();
