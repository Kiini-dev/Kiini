import { describe, expect, it } from 'vitest';
import { getTableConfig } from 'drizzle-orm/mysql-core';
import * as schema from '../../drizzle/schema';
import * as extendedSchema from '../../drizzle/schema-extended';
import { getMissingColumnsForTable, getMissingTableDefinitions, getRuntimeSchemaCheckTargets } from './legacySchemaCompatibility';

describe('legacy schema compatibility', () => {
  it('detects missing notification columns for legacy tables', () => {
    expect(getMissingColumnsForTable('notifications', ['id', 'userId', 'title'])).toEqual([
      { name: 'deliveryStatus', definition: "enum('pending','sent','failed') NOT NULL DEFAULT 'pending'" },
      { name: 'deliveryDate', definition: 'timestamp NULL' },
      { name: 'status', definition: "enum('active','archived') NOT NULL DEFAULT 'active'" },
    ]);
  });

  it('repairs the global settings table used by company settings queries', () => {
    expect(getMissingColumnsForTable('settings', ['id', 'key'])).toEqual([
      { name: 'value', definition: 'longtext NULL' },
      { name: 'category', definition: 'varchar(100) NULL' },
      { name: 'description', definition: 'text NULL' },
      { name: 'updatedBy', definition: 'varchar(64) NULL' },
      { name: 'updatedAt', definition: 'timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' },
    ]);
    expect(getMissingTableDefinitions([]).map((table) => table.name)).toContain('settings');
  });

  it('detects missing department columns for legacy tables', () => {
    expect(getMissingColumnsForTable('departments', ['id', 'name', 'status'])).toEqual([
      { name: 'defaultRole', definition: 'varchar(100) NULL' },
      { name: 'organizationId', definition: 'varchar(64) NULL' },
      { name: 'description', definition: 'text NULL' },
      { name: 'headId', definition: 'varchar(64) NULL' },
      { name: 'budget', definition: 'int NULL' },
      { name: 'salaryRangeMin', definition: 'int NULL' },
      { name: 'salaryRangeMax', definition: 'int NULL' },
      { name: 'createdBy', definition: 'varchar(64) NULL' },
      { name: 'createdAt', definition: 'timestamp NULL DEFAULT CURRENT_TIMESTAMP' },
      { name: 'updatedAt', definition: 'timestamp NULL DEFAULT CURRENT_TIMESTAMP' },
    ]);
  });

  it('detects missing organizationId for multi-tenant tables', () => {
    const multiTenantTables = ['payments', 'receipts', 'estimates', 'contacts', 'products', 'services', 'leaveRequests', 'attendance'];
    for (const table of multiTenantTables) {
      const result = getMissingColumnsForTable(table, ['id', 'name', 'description']);
      expect(result.map((column) => column.name)).toContain('organizationId');
    }
  });

  it('detects missing employee benefit columns', () => {
    expect(getMissingColumnsForTable('employeeBenefits', ['id', 'employeeId', 'benefitType'])).toEqual([
      { name: 'employerCost', definition: 'int NULL' },
      { name: 'notes', definition: 'text NULL' },
    ]);
  });

  it('detects missing payroll detail columns', () => {
    expect(getMissingColumnsForTable('payrollDetails', ['id', 'payrollId', 'amount'])).toEqual([
      { name: 'itemType', definition: 'varchar(50) NULL' },
      { name: 'itemId', definition: 'varchar(64) NULL' },
      { name: 'description', definition: 'varchar(255) NULL' },
      { name: 'isDeduction', definition: 'tinyint NOT NULL DEFAULT 0' },
      { name: 'lineNumber', definition: 'int NULL' },
      { name: 'componentType', definition: 'varchar(100) NULL' },
      { name: 'component', definition: 'varchar(255) NULL' },
      { name: 'notes', definition: 'text NULL' },
    ]);
  });

  it('keeps payroll line-item and payslip generation columns in the schemas', () => {
    const lineColumns = ['payrollId', 'itemType', 'itemId', 'description', 'amount', 'isDeduction', 'lineNumber'];
    for (const table of [schema.payrollDetails, extendedSchema.payrollDetails]) {
      const columns = new Set(getTableConfig(table).columns.map((column) => column.name));
      for (const column of lineColumns) expect(columns.has(column), `${column} must be defined`).toBe(true);
    }

    const payslipColumns = new Set(getTableConfig(schema.payslips).columns.map((column) => column.name));
    for (const column of ['payrollId', 'payPeriod', 'payDate', 'payPeriodStart', 'payPeriodEnd', 'allowancesBreakdown', 'deductionsBreakdown', 'htmlContent']) {
      expect(payslipColumns.has(column), `${column} must be defined`).toBe(true);
    }
  });

  it('detects a missing legacy table that should be recreated automatically', () => {
    const missingTables = getMissingTableDefinitions(['employees', 'users']);
    expect(missingTables.map((table) => table.name)).toContain('userTablePreferences');
    expect(missingTables.map((table) => table.name)).toContain('staffChatMessages');
    expect(missingTables.map((table) => table.name)).toContain('jobGroups');
    expect(missingTables.map((table) => table.name)).toContain('backup_history');
    expect(missingTables.map((table) => table.name)).toContain('onboardingTemplates');
    expect(missingTables.map((table) => table.name)).toContain('trainingPrograms');
    expect(missingTables.map((table) => table.name)).toContain('budgetAllocations');
    expect(missingTables.map((table) => table.name)).toContain('organizationSettings');
    expect(missingTables.map((table) => table.name)).toContain('partner_profiles');
    expect(missingTables.map((table) => table.name)).toContain('partner_referrals');
    expect(missingTables.map((table) => table.name)).toContain('partner_commissions');
    expect(missingTables.map((table) => table.name)).toContain('partner_payouts');
  });

  it('includes projects in the runtime compatibility patch targets', () => {
    expect(getRuntimeSchemaCheckTargets()).toContain('projects');
  });

  it('keeps business module repairs aligned with Drizzle schema and runtime checks', () => {
    const tables = {
      clients: schema.clients,
      estimates: schema.estimates,
      invoices: schema.invoices,
      projects: schema.projects,
      projecttasks: schema.projectTasks,
      expenses: schema.expenses,
      recurringexpenses: schema.recurringExpenses,
      payments: schema.payments,
      receipts: schema.receipts,
      products: schema.products,
      services: schema.services,
      opportunities: schema.opportunities,
      organizations: schema.organizations,
      serviceinvoiceitems: schema.serviceInvoiceItems,
      budgetallocations: extendedSchema.budgetAllocations,
      onboardingchecklists: schema.onboardingChecklists,
      onboardingtasks: schema.onboardingTasks,
      onboardingtemplates: schema.onboardingTemplates,
      trainingenrollments: schema.trainingEnrollments,
      trainingprograms: schema.trainingPrograms,
      partner_profiles: schema.partnerProfiles,
      partner_referrals: schema.partnerReferrals,
      partner_commissions: schema.partnerCommissions,
      partner_payouts: schema.partnerPayouts,
    };
    const runtimeTargets = new Set(getRuntimeSchemaCheckTargets().map((table) => table.toLowerCase()));

    for (const [tableName, table] of Object.entries(tables)) {
      const schemaColumns = new Set(getTableConfig(table).columns.map((column) => column.name.toLowerCase()));
      const repairColumns = getMissingColumnsForTable(tableName, []).map((column) => column.name.toLowerCase());

      expect(runtimeTargets.has(tableName), `${tableName} must be checked at startup`).toBe(true);
      for (const columnName of repairColumns) {
        expect(schemaColumns.has(columnName), `${tableName}.${columnName} must exist in Drizzle schema`).toBe(true);
      }
    }
  });

  it('detects no missing columns when organizationId is present', () => {
    const result = getMissingColumnsForTable('payments', [
      'id', 'amount', 'organizationId', 'status', 'accountId', 'chartOfAccountType', 'chartOfAccountId',
    ]);
    expect(result).toEqual([]);
  });

  it('ignores case sensitivity when checking existing columns', () => {
    const result = getMissingColumnsForTable('payments', [
      'ID', 'AMOUNT', 'OrganizationId', 'STATUS', 'AccountId', 'ChartOfAccountType', 'ChartOfAccountId',
    ]);
    expect(result).toEqual([]);
  });

  it('keeps a table without known drift unchanged', () => {
    expect(getMissingColumnsForTable('users', [
      'id',
      'name',
      'email',
      'organizationId',
      'customRoleId',
      'emailVerified',
      'failedLoginAttempts',
      'lockedUntil',
      'lockoutCount',
      'emailVerificationRequired',
      'twoFactorEnabled',
      'twoFactorSecret',
    ])).toEqual([]);
  });
});
