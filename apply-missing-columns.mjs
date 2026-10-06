#!/usr/bin/env node

/**
 * Database Migration Script
 * Adds missing columns to the clients table
 * Run with: node apply-missing-columns.mjs
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

async function runMigration() {
  let connection;

  try {
    console.log('🔄 Connecting to database...');
    connection = await mysql.createConnection(DATABASE_URL);

    console.log('✅ Connected to database');

    // === CLIENTS TABLE ===
    console.log('📝 Checking clients table columns...');

    // Check if secondaryPhone column exists
    const [secondaryPhoneColumns] = await connection.execute(
      "SHOW COLUMNS FROM clients LIKE 'secondaryPhone'"
    );
    if (secondaryPhoneColumns.length === 0) {
      console.log('📝 Adding secondaryPhone column to clients table...');
      await connection.execute(
        'ALTER TABLE clients ADD COLUMN secondaryPhone VARCHAR(50) DEFAULT NULL'
      );
      console.log('✅ Added secondaryPhone column');
    }

    // Check if bankAccountNumber column exists
    const [bankColumns] = await connection.execute(
      "SHOW COLUMNS FROM clients LIKE 'bankAccountNumber'"
    );
    if (bankColumns.length === 0) {
      console.log('📝 Adding bankAccountNumber column to clients table...');
      await connection.execute(
        'ALTER TABLE clients ADD COLUMN bankAccountNumber VARCHAR(100) DEFAULT NULL'
      );
      console.log('✅ Added bankAccountNumber column');
    }

    // Check if leadSource column exists
    const [leadColumns] = await connection.execute(
      "SHOW COLUMNS FROM clients LIKE 'leadSource'"
    );
    if (leadColumns.length === 0) {
      console.log('📝 Adding leadSource column to clients table...');
      await connection.execute(
        'ALTER TABLE clients ADD COLUMN leadSource VARCHAR(100) DEFAULT NULL'
      );
      console.log('✅ Added leadSource column');
    }

    // Check if currency column exists
    const [currencyColumns] = await connection.execute(
      "SHOW COLUMNS FROM clients LIKE 'currency'"
    );
    if (currencyColumns.length === 0) {
      console.log('📝 Adding currency column to clients table...');
      await connection.execute(
        'ALTER TABLE clients ADD COLUMN currency VARCHAR(10) DEFAULT NULL'
      );
      console.log('✅ Added currency column');
    }

    // === INVOICES TABLE ===
    console.log('📝 Checking invoices table columns...');

    const invoiceColumns = [
      { name: 'estimateId', type: 'VARCHAR(64)', default: 'NULL' },
      { name: 'paymentPlanId', type: 'VARCHAR(64)', default: 'NULL' },
      { name: 'isAutoRecurring', type: 'TINYINT', default: '0' },
      { name: 'recurringInvoiceId', type: 'VARCHAR(64)', default: 'NULL' },
      { name: 'clientSubscriptionId', type: 'VARCHAR(64)', default: 'NULL' },
      { name: 'discountAmount', type: 'INT', default: '0' },
    ];

    for (const col of invoiceColumns) {
      const [columns] = await connection.execute(
        `SHOW COLUMNS FROM invoices LIKE '${col.name}'`
      );
      if (columns.length === 0) {
        console.log(`📝 Adding ${col.name} column to invoices table...`);
        await connection.execute(
          `ALTER TABLE invoices ADD COLUMN ${col.name} ${col.type} DEFAULT ${col.default}`
        );
        console.log(`✅ Added ${col.name} column`);
      }
    }

    // === EXPENSES TABLE ===
    console.log('📝 Checking expenses table columns...');

    const expenseColumns = [
      { name: 'expenseNumber', type: 'VARCHAR(50)', default: 'NULL' },
      { name: 'receiptUrl', type: 'VARCHAR(500)', default: 'NULL' },
      { name: 'accountId', type: 'VARCHAR(64)', default: 'NULL' },
      { name: 'budgetAllocationId', type: 'VARCHAR(64)', default: 'NULL' },
      { name: 'approvedBy', type: 'VARCHAR(64)', default: 'NULL' },
      { name: 'approvedAt', type: 'TIMESTAMP', default: 'NULL' },
      { name: 'chartOfAccountId', type: 'VARCHAR(64)', default: 'NULL' },
    ];

    for (const col of expenseColumns) {
      const [columns] = await connection.execute(
        `SHOW COLUMNS FROM expenses LIKE '${col.name}'`
      );
      if (columns.length === 0) {
        console.log(`📝 Adding ${col.name} column to expenses table...`);
        await connection.execute(
          `ALTER TABLE expenses ADD COLUMN ${col.name} ${col.type} DEFAULT ${col.default}`
        );
        console.log(`✅ Added ${col.name} column`);
      }
    }

    // === PROJECTS TABLE ===
    console.log('📝 Checking projects table columns...');

    const projectColumns = [
      { name: 'projectNumber', type: 'VARCHAR(50)', default: 'NULL' },
      { name: 'actualStartDate', type: 'DATETIME', default: 'NULL' },
      { name: 'actualEndDate', type: 'DATETIME', default: 'NULL' },
      { name: 'actualCost', type: 'INT', default: 'NULL' },
      { name: 'progress', type: 'INT', default: '0' },
      { name: 'projectManager', type: 'VARCHAR(64)', default: 'NULL' },
      { name: 'tags', type: 'TEXT', default: 'NULL' },
    ];

    for (const col of projectColumns) {
      const [columns] = await connection.execute(
        `SHOW COLUMNS FROM projects LIKE '${col.name}'`
      );
      if (columns.length === 0) {
        console.log(`📝 Adding ${col.name} column to projects table...`);
        await connection.execute(
          `ALTER TABLE projects ADD COLUMN ${col.name} ${col.type} DEFAULT ${col.default}`
        );
        console.log(`✅ Added ${col.name} column`);
      }
    }

    // === PAYMENTS TABLE ===
    console.log('📝 Checking payments table columns...');

    const paymentColumns = [
      { name: 'accountId', type: 'VARCHAR(64)', default: 'NULL' },
      { name: 'chartOfAccountType', type: 'ENUM(\'debit\',\'credit\')', default: '\'debit\'' },
      { name: 'approvedBy', type: 'VARCHAR(64)', default: 'NULL' },
      { name: 'approvedAt', type: 'TIMESTAMP', default: 'NULL' },
    ];

    for (const col of paymentColumns) {
      const [columns] = await connection.execute(
        `SHOW COLUMNS FROM payments LIKE '${col.name}'`
      );
      if (columns.length === 0) {
        console.log(`📝 Adding ${col.name} column to payments table...`);
        await connection.execute(
          `ALTER TABLE payments ADD COLUMN ${col.name} ${col.type} DEFAULT ${col.default}`
        );
        console.log(`✅ Added ${col.name} column`);
      }
    }

    // === EMPLOYEES TABLE ===
    console.log('📝 Checking employees table columns...');

    const employeeColumns = [
      { name: 'userId', type: 'VARCHAR(64)', default: 'NULL' },
      { name: 'gender', type: 'ENUM(\'male\',\'female\',\'other\')', default: 'NULL' },
      { name: 'maritalStatus', type: 'ENUM(\'single\',\'married\',\'divorced\',\'widowed\')', default: 'NULL' },
      { name: 'dateOfBirth', type: 'DATETIME', default: 'NULL' },
      { name: 'probationEndDate', type: 'DATETIME', default: 'NULL' },
      { name: 'contractEndDate', type: 'DATETIME', default: 'NULL' },
    ];

    for (const col of employeeColumns) {
      const [columns] = await connection.execute(
        `SHOW COLUMNS FROM employees LIKE '${col.name}'`
      );
      if (columns.length === 0) {
        console.log(`📝 Adding ${col.name} column to employees table...`);
        await connection.execute(
          `ALTER TABLE employees ADD COLUMN ${col.name} ${col.type} DEFAULT ${col.default}`
        );
        console.log(`✅ Added ${col.name} column`);
      }
    }

    console.log('🎉 Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

runMigration();