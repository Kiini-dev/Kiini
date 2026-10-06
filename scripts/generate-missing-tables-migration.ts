import {
  assets, contracts, creditNotes, customFields, dashboardLayouts, dashboardWidgetData,
  dashboardWidgets, debitNotes, deliveryNotes, dunningEvents, dunningPolicies,
  employeePromotions, employeeSkills, employeeTransfers, fieldValidations, fieldValues,
  goodsReceiptNotes, grnRecords, holidays, hrSettings, leads, leaveApprovals, leaveBalances,
  mpesaTransactions, onboardingChecklists, onboardingTasks, orders, organizationAccountingPolicies,
  paymentRetries, payrollBatches, purchaseOrderItems, purchaseOrders, quotations, recurringExpenses,
  smsAutomationRules, smsDeliveryEvents, smsTemplates, stripeCustomers, stripePaymentIntents,
  stripeWebhookEvents, systemLogs, taxCompliance, timesheets, trainingEnrollments, warehouses,
  warranties, workflowAutomationLogs, activeSessions, approvalWorkflows, automationConfigs
} from '../drizzle/schema';
import { getTableConfig } from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

const tables = [
  { name: 'assets', table: assets },
  { name: 'contracts', table: contracts },
  { name: 'creditNotes', table: creditNotes },
  { name: 'customFields', table: customFields },
  { name: 'dashboardLayouts', table: dashboardLayouts },
  { name: 'dashboardWidgetData', table: dashboardWidgetData },
  { name: 'dashboardWidgets', table: dashboardWidgets },
  { name: 'debitNotes', table: debitNotes },
  { name: 'deliveryNotes', table: deliveryNotes },
  { name: 'dunningEvents', table: dunningEvents },
  { name: 'dunningPolicies', table: dunningPolicies },
  { name: 'employeePromotions', table: employeePromotions },
  { name: 'employeeSkills', table: employeeSkills },
  { name: 'employeeTransfers', table: employeeTransfers },
  { name: 'fieldValidations', table: fieldValidations },
  { name: 'fieldValues', table: fieldValues },
  { name: 'goodsReceiptNotes', table: goodsReceiptNotes },
  { name: 'grnRecords', table: grnRecords },
  { name: 'holidays', table: holidays },
  { name: 'hrSettings', table: hrSettings },
  { name: 'leads', table: leads },
  { name: 'leaveApprovals', table: leaveApprovals },
  { name: 'leaveBalances', table: leaveBalances },
  { name: 'mpesaTransactions', table: mpesaTransactions },
  { name: 'onboardingChecklists', table: onboardingChecklists },
  { name: 'onboardingTasks', table: onboardingTasks },
  { name: 'orders', table: orders },
  { name: 'organizationAccountingPolicies', table: organizationAccountingPolicies },
  { name: 'paymentRetries', table: paymentRetries },
  { name: 'payrollBatches', table: payrollBatches },
  { name: 'purchaseOrderItems', table: purchaseOrderItems },
  { name: 'purchaseOrders', table: purchaseOrders },
  { name: 'quotations', table: quotations },
  { name: 'recurringExpenses', table: recurringExpenses },
  { name: 'smsAutomationRules', table: smsAutomationRules },
  { name: 'smsDeliveryEvents', table: smsDeliveryEvents },
  { name: 'smsTemplates', table: smsTemplates },
  { name: 'stripeCustomers', table: stripeCustomers },
  { name: 'stripePaymentIntents', table: stripePaymentIntents },
  { name: 'stripeWebhookEvents', table: stripeWebhookEvents },
  { name: 'systemLogs', table: systemLogs },
  { name: 'taxCompliance', table: taxCompliance },
  { name: 'timesheets', table: timesheets },
  { name: 'trainingEnrollments', table: trainingEnrollments },
  { name: 'warehouses', table: warehouses },
  { name: 'warranties', table: warranties },
  { name: 'workflowAutomationLogs', table: workflowAutomationLogs },
  { name: 'activeSessions', table: activeSessions },
  { name: 'approvalWorkflows', table: approvalWorkflows },
  { name: 'automationConfigs', table: automationConfigs },
];

function generateColumnDef(col: any): string {
  let def = `\`${col.name}\` ${col.getSQLType()}`;
  if (col.notNull) def += ' NOT NULL';
  if (col.hasDefault && col.default !== undefined) {
    if (typeof col.default === 'string') {
      def += ` DEFAULT '${col.default.replace(/'/g, "''")}'`;
    } else if (typeof col.default === 'number') {
      def += ` DEFAULT ${col.default}`;
    } else if (typeof col.default === 'boolean') {
      def += ` DEFAULT ${col.default ? 1 : 0}`;
    } else if (col.default && typeof col.default === 'object' && col.default.sql) {
      // Handle SQL defaults like CURRENT_TIMESTAMP
      const sqlStr = col.default.sql.toString();
      if (sqlStr.includes('CURRENT_TIMESTAMP')) {
        def += ' DEFAULT CURRENT_TIMESTAMP';
      }
    }
  }
  return def;
}

console.log('-- Create missing tables from authoritative Drizzle schema\n');

for (const { name, table } of tables) {
  const config = getTableConfig(table);
  const columns = config.columns.map(generateColumnDef);
  const primaryKey = config.columns.find((c: any) => c.primary)?.name;
  
  if (primaryKey) {
    columns.push(`PRIMARY KEY (\`${primaryKey}\`)`);
  }
  
  console.log(`CREATE TABLE IF NOT EXISTS \`${config.name}\` (`);
  console.log(columns.map(c => '  ' + c).join(',\n'));
  console.log(`) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`);
  console.log();
}
