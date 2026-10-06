# Database Schema Migration Fix

## Problem
The application is failing with database errors like:
```
Unknown column 'secondaryPhone' in 'field list'
```

This occurs because the Drizzle ORM schema includes columns that haven't been added to the production database.

## Solution
Run the migration script to add all missing columns to the database tables.

## How to Run the Migration

### Option 1: Using the npm script (Recommended)
```bash
# In your production environment
pnpm db:migrate:manual
# or
npm run db:migrate:manual
```

### Option 2: Direct execution
```bash
# Make sure DATABASE_URL is set in your environment
node apply-missing-columns.mjs
```

### Option 3: Manual SQL execution
If you can't run Node.js scripts, execute the SQL from `migrate_org_isolation.sql` directly in your MySQL/MariaDB console:

```sql
-- Connect to your database
mysql -h your-host -u your-user -p your-database < migrate_org_isolation.sql
```

## What the Migration Does

The migration adds the following missing columns to ensure schema compatibility:

### Clients Table
- `secondaryPhone` VARCHAR(50)
- `bankAccountNumber` VARCHAR(100)
- `leadSource` VARCHAR(100)
- `currency` VARCHAR(10)

### Invoices Table
- `estimateId` VARCHAR(64)
- `paymentPlanId` VARCHAR(64)
- `isAutoRecurring` TINYINT
- `recurringInvoiceId` VARCHAR(64)
- `clientSubscriptionId` VARCHAR(64)
- `discountAmount` INT

### Expenses Table
- `expenseNumber` VARCHAR(50)
- `receiptUrl` VARCHAR(500)
- `accountId` VARCHAR(64)
- `budgetAllocationId` VARCHAR(64)
- `approvedBy` VARCHAR(64)
- `approvedAt` TIMESTAMP
- `chartOfAccountId` VARCHAR(64)

### Projects Table
- `projectNumber` VARCHAR(50)
- `actualStartDate` DATETIME
- `actualEndDate` DATETIME
- `actualCost` INT
- `progress` INT
- `projectManager` VARCHAR(64)
- `tags` TEXT

### Payments Table
- `accountId` VARCHAR(64)
- `chartOfAccountType` ENUM('debit','credit')
- `approvedBy` VARCHAR(64)
- `approvedAt` TIMESTAMP

### Employees Table
- `userId` VARCHAR(64)
- `gender` ENUM('male','female','other')
- `maritalStatus` ENUM('single','married','divorced','widowed')
- `dateOfBirth` DATETIME
- `probationEndDate` DATETIME
- `contractEndDate` DATETIME

## Safety Features

- All ALTER TABLE statements use `IF NOT EXISTS` to prevent errors if columns already exist
- The migration script checks for column existence before attempting to add them
- No data loss occurs as all new columns have DEFAULT NULL values

## After Migration

Once the migration is complete, restart your application. The dashboard metrics and client queries should work without the "Unknown column" errors.