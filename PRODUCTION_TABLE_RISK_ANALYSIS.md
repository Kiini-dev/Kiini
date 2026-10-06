# Kiini Production Database Risk Analysis
## Table Query Dependencies & Missing Tables Report

**Generated:** 2026-09-07  
**Scope:** Analysis of database queries across server/routers/* files  
**Risk Level:** HIGH - Multiple tables with missing columns and completely missing tables in production

---

## Executive Summary

The Kiini production database has significant schema drift issues:
- **15+ tables have missing columns** (tracked in `legacySchemaCompatibility.ts`)
- **20+ tables may be completely missing** (not yet deployed to production)
- **Critical auth path uses tables with missing columns** (employees, customRoles queried on every auth.me)
- **Dashboard initialization queries many potentially missing tables** (12+ tables queried on page load)

**Production Impact:** Pages that execute dashboard queries, auth checks, and organization-related operations will fail with "table doesn't exist" or "column not found" errors.

---

## CRITICAL TIER: Tables Queried Early in Auth/Page Load

These tables are queried during authentication or on every page load:

### 1. **employees** ⚠️ MISSING COLUMN
- **Status:** Has 1 missing column in production
- **Missing Column:** `country` (defaults to 'KE')
- **Queried In:**
  - `auth.ts` - **auth.me()** (CRITICAL - every authenticated request)
  - `departments.ts` - listEmployees()
  - `employees.ts` - list(), getById()
  - `csvImportExport.ts` - bulkImport()
  - `importExcel.ts` - bulkImport()
  - `hrAnalytics.ts` - analytics()
  - `hrAttendance.ts` - listAttendance()
  - `hrEmployees.ts` - listEmployees()
  - `payroll.ts` - getEmployee()
  - `projects.ts` - getAllEmployees()
  - `users.ts` - linkEmployee()
  - `teamPerformance.ts` - performanceMetrics()

**Error If Missing:** `Column 'country' doesn't have a default value` on UPDATE/INSERT operations

---

### 2. **customRoles** ⚠️ MISSING COLUMN
- **Status:** Likely has missing columns
- **Queried In:**
  - `auth.ts` - **auth.me()** (CRITICAL - every authenticated request checks custom roles)
  - `orgPermissions.ts` - listRoles(), getRoleById(), updateRole()
  - `roles.ts` - listRoles()
  - `permissions.ts` - listRoles()

**Error If Missing:** "table doesn't exist" or permission system fails silently on auth

---

### 3. **invoices** ⚠️ MISSING COLUMN
- **Status:** Has 1 missing column in production
- **Missing Column:** `accountManagerId`
- **Queried In (Multiple Dashboard/List Queries):**
  - `dashboard.ts` - getDashboardMetrics() (queries 10+ times)
  - `advancedReporting.ts` - getFinancialData()
  - `ai.ts` - invoiceAnalysis()
  - `analytics.ts` - getSalesAnalytics()
  - `approvals.ts` - getInvoice()
  - `automationJobs.ts` - processInvoices()
  - `clients.ts` - getClientInvoices()
  - `dataExport.ts` - exportData()
  - `documentManagement.ts` - linkedDocuments()
  - `email.ts` - getInvoiceData()
  - `enhancedPayments.ts` - processPayment()
  - `estimates.ts` - estimateToInvoice()
  - `financialReporting.ts` - getFinancialReport()
  - `invoices.ts` - list(), getById(), getByClientId() (main invoices router)
  - `mpesa.ts` - processPayment()
  - `multiTenancy.ts` - migrateTenant()
  - `paymentPlans.ts` - paymentPlanMetrics()
  - `payments.ts` - processPayment()
  - `quotes.ts` - quoteToInvoice()
  - `recurringInvoices.ts` - processRecurring()
  - `reports.ts` - generateReport()
  - `salesReports.ts` - salesAnalysis()
  - `search.ts` - globalSearch()
  - `stripe.ts` - handlePayment()

**Error If Missing:** Will not fail immediately, but JOIN/UPDATE operations fail if they reference accountManagerId

---

### 4. **payments** ⚠️ MISSING COLUMN (CRITICAL)
- **Status:** Has 1 CRITICAL missing column in production
- **Missing Column:** `organizationId` (org isolation column)
- **Queried In:**
  - `dashboard.ts` - getDashboardMetrics() (calculates all payment totals)
  - `enhancedPayments.ts` - processPayment()
  - `health.ts` - Detailed health check explicitly checks for this table
  - `payments.ts` - list(), processPayment()
  - `paymentReconciliation.ts` - reconcile()
  - `kpiTracking.ts` - calculateKPIs()
  - `taxCompliance.ts` - calculateTaxes()

**Error If Missing:** Dashboard metrics queries FAIL - returns no payment data. Payment processing fails without organization context.

**Note from memory:** This was explicitly flagged as causing 500 errors: "dashboard metrics query can 500 on payments.organizationId missing in some schemas"

---

### 5. **organizations** ⚠️ POTENTIALLY MISSING
- **Status:** Unknown if exists in production (core table but no auto-repair documented)
- **Queried In:**
  - `organizationUsers.ts` - **list()** (CRITICAL - on org page load)
  - `auth.ts` - **auth.me()** (gets org slug)
  - `enterpriseTenants.ts` - list()
  - `multiTenancy.ts` - migrateTenant()
  - `orgBilling.ts` - getBillingInfo()
  - `orgRoles.ts` - list()
  - `orgThemeCustomization.ts` - getTheme()
  - `sysAdmin.ts` - listOrganizations()

**Error If Missing:** App cannot load for any user - organization lookup fails

---

### 6. **organizationUsers** ⚠️ POTENTIALLY MISSING
- **Status:** Unknown if exists in production
- **Queried In:**
  - `organizationUsers.ts` - list(), getById(), add(), remove() (ENTIRE ROUTER depends on this)

**Error If Missing:** Organization members/users management completely broken

---

---

## HIGH TIER: Dashboard Queries (Page Load Performance Risk)

These tables are queried when dashboard loads - if missing, dashboard initialization fails:

### Tables Queried in Dashboard (dashboard.ts - line 30-325):
1. **projects** - COUNT, LIST
2. **invoices** - COUNT, LIST, ANALYTICS
3. **receipts** - LIST (potentially missing organizationId column)
4. **estimates** - LIST (potentially missing organizationId column)
5. **payments** - ANALYTICS, AMOUNTS ⚠️ (organizationId missing)
6. **products** - COUNT (potentially missing organizationId column)
7. **services** - COUNT (potentially missing organizationId column)
8. **employees** - COUNT
9. **users** - COUNT
10. **clients** - COUNT, LIST (15 columns missing)
11. **activityLog** - LIST
12. **projectTasks** - LIST
13. **reminders** - LIST
14. **scheduledReminders** - JOIN with reminders (POTENTIALLY MISSING TABLE)
15. **expenses** - AMOUNT SUM (potentially missing organizationId column)

**Impact:** Dashboard page load will show partial data or fail entirely if any of these tables are missing.

---

## TABLES WITH KNOWN MISSING COLUMNS (from legacySchemaCompatibility.ts)

### Organization Isolation Columns (Multi-tenant Support)
These tables NEED an `organizationId` column added for proper multi-tenancy:

1. **payments** ⚠️ CRITICAL
2. **receipts** ⚠️
3. **estimates** ⚠️
4. **quotations** ⚠️
5. **contacts** ⚠️
6. **products** ⚠️
7. **services** ⚠️
8. **suppliers** ⚠️
9. **opportunities** ⚠️
10. **projectBudgets** ⚠️
11. **departmentBudgets** ⚠️
12. **creditNotes** ⚠️
13. **warranties** ⚠️
14. **lpos** ⚠️
15. **grnRecords** ⚠️
16. **serviceInvoices** ⚠️
17. **serviceTemplates** ⚠️
18. **emailTemplates** (+ plainTextContent, attachments, isDefault, isSystem)
19. **emailQueue** ⚠️
20. **proposalTemplates** ⚠️
21. **contractTemplates** ⚠️
22. **scheduledJobs** ⚠️

### Other Missing Columns

| Table | Missing Column | Column Definition | Impact |
|-------|-----------------|-------------------|--------|
| **invoices** | accountManagerId | varchar(64) NULL | Account manager assignment breaks |
| **recurringInvoices** | accountManagerId | varchar(64) NULL | Recurring invoice manager tracking breaks |
| **employees** | country | varchar(5) DEFAULT 'KE' | Emp country not set |
| **notifications** | deliveryStatus | enum('pending','sent','failed') | Email delivery tracking fails |
| **notifications** | deliveryDate | timestamp NULL | Delivery date not tracked |
| **notifications** | status | enum('active','archived') | Notification archiving fails |
| **staffChatMessages** | (14 columns) | See schema | Entire chat feature missing |
| **documents** | linkedInvoiceId | varchar(64) NULL | Document-invoice linking fails |
| **departments** | defaultRole | varchar(100) NULL | Department role assignment breaks |
| **departments** | organizationId | varchar(64) NULL | Org isolation fails |
| **clients** | (15 columns) | See schema | CLIENT CREATION FAILS - already fixed with legacySchemaCompatibility.ts |
| **notes** | (9 columns) | See schema | Notes feature missing |
| **integration_configs** | (11 columns) | See schema | Integration configs missing |
| **paymentTriggers** | (2 columns) | invoiceId, metadata | Payment automation broken |

---

## COMPLETELY MISSING TABLES (Likely Not Deployed)

These tables are defined in schema but probably don't exist in production:

### Critical Missing Tables:

1. **payroll** ⚠️ CRITICAL
   - Used in: `hrPayroll.ts`, `payroll.ts`, `taxCompliance.ts`
   - Impact: Payroll processing completely broken
   - Columns: 16 (employees, pay periods, salary, deductions, taxes, etc.)

2. **paymentTriggers** ⚠️
   - Used in: Payment automation systems
   - Impact: Automated payment triggers don't work

3. **scheduledJobs** ⚠️
   - Used in: Cron job management
   - Impact: Scheduled tasks don't execute

4. **jobExecutionLogs** ⚠️
   - Used in: Job monitoring
   - Impact: Job execution history unavailable

### Supporting Missing Tables:

5. **jobAlertRules** - Job alert configuration
6. **jobAlertHistory** - Job alert history
7. **jobHeartbeat** - Job health monitoring
8. **integration_configs** - Integration configuration storage
9. **notes** - Note-taking feature
10. **userTablePreferences** - User column preferences
11. **organizationMembers** - Alternative org membership table
12. **staffChatMessages** - Staff chat feature
13. **contractTemplates** - Contract templates
14. **proposalTemplates** - Proposal templates
15. **serviceTemplates** - Service templates
16. **emailQueue** - Email delivery queue
17. **emailTemplates** - Email template storage

---

## ROUTERS MOST LIKELY TO FAIL IN PRODUCTION

### Tier 1: Critical (Will fail on auth or page load)
- `auth.ts` - Missing `customRoles` or `employees.country`
- `dashboard.ts` - Missing payment/invoice/client data
- `organizationUsers.ts` - Missing `organizationUsers` or `organizations` tables
- `health.ts` - Missing `invoices` table check

### Tier 2: High (Will fail on specific operations)
- `invoices.ts` - Missing `accountManagerId` on updates
- `payments.ts` - Missing `organizationId` column
- `employees.ts` - Missing `country` column
- `hrPayroll.ts` - Missing `payroll` table entirely
- `orgPermissions.ts` - Missing `customRoles` table

### Tier 3: Medium (Will fail on feature usage)
- `contacts.ts` - Missing `organizationId` column
- `products.ts` - Missing `organizationId` column
- `services.ts` - Missing `organizationId` column
- `suppliers.ts` - Missing `organizationId` column
- `clientScoring.ts` - Missing multiple columns
- `approvals.ts` - Missing invoice/leave tables
- `payroll.ts` - Missing `payroll` table
- `emailTemplates.ts` - Missing `emailTemplates` table
- `staffChat.ts` - Missing `staffChatMessages` table

---

## RECOMMENDATIONS FOR PRODUCTION DEPLOYMENT

### Immediate Actions (Prevent 500 Errors):
1. **Verify `payments.organizationId` column exists** - This causes dashboard to fail
2. **Verify `invoices` table exists** - Health check and dashboards depend on it
3. **Verify `employees` table has `country` column** - Auth path depends on it
4. **Verify `customRoles` table exists** - Permission system depends on it
5. **Verify `organizationUsers` table exists** - Org management depends on it

### Short-term (Fix Missing Columns):
1. Run migration: `ALTER TABLE payments ADD COLUMN organizationId VARCHAR(64) NULL;`
2. Run migration: `ALTER TABLE invoices ADD COLUMN accountManagerId VARCHAR(64) NULL;` (if missing)
3. Add all missing `organizationId` columns to 20+ tables (see list above)
4. Add missing columns to notifications, staffChatMessages, documents, etc.

### Medium-term (Add Missing Tables):
1. Create `payroll` table - Critical for HR module
2. Create `paymentTriggers` table - Payment automation
3. Create `scheduledJobs` + `jobExecutionLogs` + job alert tables
4. Create `emailTemplates` + `staffChatMessages` tables
5. Create template tables (contracts, proposals, services)

### Long-term (Schema Verification):
1. Add automated schema validation to health check
2. Implement database migration tracking (use `__drizzle_migrations__` table)
3. Add column existence checks before queries
4. Document all table dependencies in runtime code
5. Test deployments in staging with production-like schema

---

## USAGE PATTERN: How legacySchemaCompatibility.ts Works

The application already has a runtime repair layer that:

```typescript
// On application startup (getDb() initialization):
1. Checks if columns exist in legacyColumnCatalog
2. Adds missing columns using ALTER TABLE IF
3. Creates completely missing tables from legacyTableCatalog
4. Ensures schema matches application expectations BEFORE queries execute
```

**Current Coverage:**
- ✅ clients table (15 columns)
- ✅ payments table (organizationId)
- ✅ invoices, recurringInvoices (accountManagerId)
- ✅ employees (country)
- ✅ notifications (deliveryStatus, deliveryDate, status)
- ✅ staffChatMessages (14 columns)
- ✅ documents, departments, notes
- ✅ Several completely missing tables (payroll, paymentTriggers, emailTemplates, etc.)

**Not Covered:**
- ⚠️ All 20 tables needing `organizationId` column (INCOMPLETE - only payments, receipts, estimates, etc. partially covered)
- ⚠️ customRoles table (assumed to exist but no auto-repair defined)
- ⚠️ organizationUsers table (assumed to exist but no auto-repair defined)

---

## QUERY PATTERNS THAT WILL FAIL

### Pattern 1: Missing Column in WHERE Clause
```typescript
// Will fail if organizationId doesn't exist in payments table
database.select({ amount: payments.amount })
  .from(payments)
  .where(eq(payments.organizationId, orgId))  // ERROR: Unknown column
```

### Pattern 2: Missing Column in SELECT
```typescript
// Will fail if accountManagerId doesn't exist
database.select({ managerId: invoices.accountManagerId })
  .from(invoices)  // ERROR: Unknown column
```

### Pattern 3: Missing Table Entirely
```typescript
// Will fail if payroll table doesn't exist
database.select().from(payroll)  // ERROR: Table 'payroll' doesn't exist
```

### Pattern 4: Missing Columns in Default Inserts
```typescript
// Will fail with "Column 'country' doesn't have a default value"
database.insert(employees).values({ userId, name })  // Error if country required
```

---

## Testing Production Tables

Run this query on production to check table status:

```sql
-- Check if critical tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = DATABASE() 
AND table_name IN ('employees', 'customRoles', 'invoices', 'payments', 
                    'organizationUsers', 'organizations', 'payroll',
                    'staffChatMessages', 'emailTemplates');

-- Check for missing organizationId column
SELECT table_name 
FROM information_schema.columns 
WHERE table_schema = DATABASE() 
AND column_name = 'organizationId'
AND table_name IN ('payments', 'receipts', 'invoices', 'products', 'services',
                   'contacts', 'suppliers', 'opportunities', 'lpos', 'grnRecords');

-- Check for missing accountManagerId column
SELECT COLUMN_NAME 
FROM information_schema.COLUMNS 
WHERE TABLE_NAME = 'invoices' 
AND COLUMN_NAME = 'accountManagerId';

-- List all tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = DATABASE()
ORDER BY table_name;
```

---

## Schema Repair Script

To fix production in one go, apply this script via cPanel SQL console:

```sql
-- Add organization isolation columns
ALTER TABLE payments ADD COLUMN IF NOT EXISTS organizationId VARCHAR(64) NULL;
ALTER TABLE receipts ADD COLUMN IF NOT EXISTS organizationId VARCHAR(64) NULL;
ALTER TABLE estimates ADD COLUMN IF NOT EXISTS organizationId VARCHAR(64) NULL;
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS organizationId VARCHAR(64) NULL;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS organizationId VARCHAR(64) NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS organizationId VARCHAR(64) NULL;
ALTER TABLE services ADD COLUMN IF NOT EXISTS organizationId VARCHAR(64) NULL;
ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS organizationId VARCHAR(64) NULL;
ALTER TABLE lpos ADD COLUMN IF NOT EXISTS organizationId VARCHAR(64) NULL;
ALTER TABLE grnRecords ADD COLUMN IF NOT EXISTS organizationId VARCHAR(64) NULL;

-- Add other missing columns
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS accountManagerId VARCHAR(64) NULL;
ALTER TABLE recurringInvoices ADD COLUMN IF NOT EXISTS accountManagerId VARCHAR(64) NULL;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS country VARCHAR(5) DEFAULT 'KE';

-- Verify repairs
SELECT COUNT(*) as table_count FROM information_schema.tables 
WHERE table_schema = DATABASE();
```

---

## Related Documentation
- See: `legacySchemaCompatibility.ts` - Runtime schema repair layer
- See: `server/utils/legacySchemaCompatibility.ts` - Column definition catalog
- Memory: `/memories/repo/kiini-notes.md` - Production deployment history
- Production URLs:
  - Main: https://kiini.kiini.africa
  - Health: https://kiini.kiini.africa/api/trpc/health.detailed

---

**Status:** ✅ Analysis Complete  
**Last Updated:** 2026-09-07  
**Analyst:** Codebase Query Audit
