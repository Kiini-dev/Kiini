var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/const.ts
var ONE_YEAR_MS, UNAUTHED_ERR_MSG, NOT_ADMIN_ERR_MSG;
var init_const = __esm({
  "shared/const.ts"() {
    ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
    UNAUTHED_ERR_MSG = "Please login (10001)";
    NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";
  }
});

// drizzle/approvalSchema.ts
var approvalSchema_exports = {};
__export(approvalSchema_exports, {
  approvalActions: () => approvalActions,
  approvalAuditLog: () => approvalAuditLog,
  approvalLevels: () => approvalLevels,
  approvalMetrics: () => approvalMetrics,
  approvalNotifications: () => approvalNotifications,
  approvalRequests: () => approvalRequests,
  approvalWorkflows: () => approvalWorkflows
});
import {
  mysqlTable,
  text,
  int,
  timestamp,
  varchar,
  json,
  boolean,
  uniqueIndex,
  index
} from "drizzle-orm/mysql-core";
var approvalWorkflows, approvalLevels, approvalRequests, approvalActions, approvalNotifications, approvalAuditLog, approvalMetrics;
var init_approvalSchema = __esm({
  "drizzle/approvalSchema.ts"() {
    approvalWorkflows = mysqlTable(
      "approval_workflows",
      {
        id: varchar("id", { length: 36 }).primaryKey(),
        organizationId: varchar("organization_id", { length: 36 }).notNull(),
        name: varchar("name", { length: 255 }).notNull(),
        description: text("description"),
        // Workflow configuration
        type: varchar("type", { length: 50 }).notNull(),
        // 'sequential', 'parallel', 'mixed'
        applicableEntity: varchar("applicable_entity", { length: 100 }).notNull(),
        // 'purchase_order', 'expense_claim', 'leave_request', etc.
        // Thresholds
        minAmount: int("min_amount").default(0),
        maxAmount: int("max_amount"),
        // State management
        isActive: boolean("is_active").default(true),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull()
      },
      (table) => [
        index("idx_org_id").on(table.organizationId),
        index("idx_applicable_entity").on(table.applicableEntity),
        uniqueIndex("unique_org_entity_workflow").on(table.organizationId, table.applicableEntity)
      ]
    );
    approvalLevels = mysqlTable(
      "approval_levels",
      {
        id: varchar("id", { length: 36 }).primaryKey(),
        workflowId: varchar("workflow_id", { length: 36 }).notNull(),
        organizationId: varchar("organization_id", { length: 36 }).notNull(),
        // Level sequencing
        levelNumber: int("level_number").notNull(),
        levelName: varchar("level_name", { length: 100 }),
        // Approval routing
        approvalType: varchar("approval_type", { length: 50 }).notNull(),
        // 'sequential', 'parallel', 'any'
        approverRoles: json("approver_roles").$type().notNull(),
        // ['department_manager', 'finance_head', etc]
        approverUserIds: json("approver_user_ids").$type(),
        // specific user IDs
        escalationDays: int("escalation_days"),
        // Auto-escalate after N days
        // Conditional routing
        conditions: json("conditions"),
        // { field: 'amount', operator: '>', value: 50000 }
        // Settings
        requiresComment: boolean("requires_comment").default(false),
        allowApprovePartially: boolean("allow_approve_partially").default(false),
        notificationTemplate: varchar("notification_template", { length: 100 }),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull()
      },
      (table) => [
        index("idx_workflow_id").on(table.workflowId),
        index("idx_org_id").on(table.organizationId)
      ]
    );
    approvalRequests = mysqlTable(
      "approval_requests",
      {
        id: varchar("id", { length: 36 }).primaryKey(),
        organizationId: varchar("organization_id", { length: 36 }).notNull(),
        workflowId: varchar("workflow_id", { length: 36 }).notNull(),
        // Reference to the entity being approved
        entityType: varchar("entity_type", { length: 100 }).notNull(),
        // 'purchase_order', 'expense_claim', etc
        entityId: varchar("entity_id", { length: 36 }).notNull(),
        // Workflow state
        status: varchar("status", { length: 50 }).notNull(),
        // 'pending', 'approved', 'rejected', 'partial', 'escalated'
        currentLevel: int("current_level").notNull().default(1),
        totalLevels: int("total_levels").notNull(),
        // Progress tracking
        progressPercentage: int("progress_percentage").default(0),
        completedLevels: int("completed_levels").default(0),
        // Context
        requestedBy: varchar("requested_by", { length: 36 }).notNull(),
        requestedAt: timestamp("requested_at").defaultNow().notNull(),
        reason: text("reason"),
        amount: int("amount"),
        // Timeline
        dueDate: timestamp("due_date"),
        completedAt: timestamp("completed_at"),
        // Audit trail
        metadata: json("metadata"),
        // Additional context
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull()
      },
      (table) => [
        index("idx_org_id").on(table.organizationId),
        index("idx_entity").on(table.entityType, table.entityId),
        index("idx_status").on(table.status),
        index("idx_current_level").on(table.currentLevel)
      ]
    );
    approvalActions = mysqlTable(
      "approval_actions",
      {
        id: varchar("id", { length: 36 }).primaryKey(),
        approvalRequestId: varchar("approval_request_id", { length: 36 }).notNull(),
        organizationId: varchar("organization_id", { length: 36 }).notNull(),
        // Action details
        levelNumber: int("level_number").notNull(),
        approverId: varchar("approver_id", { length: 36 }).notNull(),
        approverRole: varchar("approver_role", { length: 100 }),
        // Action taken
        action: varchar("action", { length: 50 }).notNull(),
        // 'approved', 'rejected', 'commented', 'escalated'
        status: varchar("status", { length: 50 }).notNull(),
        // 'pending', 'completed'
        // Details
        comment: text("comment"),
        decisionAmount: int("decision_amount"),
        // For partial approval
        // Timeline
        dueDate: timestamp("due_date"),
        actionDate: timestamp("action_date"),
        // Escalation
        escalatedTo: varchar("escalated_to", { length: 36 }),
        escalationReason: varchar("escalation_reason", { length: 255 }),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull()
      },
      (table) => [
        index("idx_approval_request_id").on(table.approvalRequestId),
        index("idx_approver_id").on(table.approverId),
        index("idx_status").on(table.status),
        index("idx_level").on(table.levelNumber)
      ]
    );
    approvalNotifications = mysqlTable(
      "approval_notifications",
      {
        id: varchar("id", { length: 36 }).primaryKey(),
        organizationId: varchar("organization_id", { length: 36 }).notNull(),
        approvalRequestId: varchar("approval_request_id", { length: 36 }),
        approvalActionId: varchar("approval_action_id", { length: 36 }),
        // Notification details
        recipientId: varchar("recipient_id", { length: 36 }).notNull(),
        type: varchar("type", { length: 50 }).notNull(),
        // 'pending', 'reminder', 'approved', 'rejected', 'escalation'
        title: varchar("title", { length: 255 }).notNull(),
        message: text("message").notNull(),
        // Status
        isRead: boolean("is_read").default(false),
        readAt: timestamp("read_at"),
        // Configuration
        deliveryChannels: json("delivery_channels").$type(),
        // ['email', 'push', 'in-app']
        deliveryStatus: json("delivery_status"),
        // { email: 'sent', push: 'pending' }
        createdAt: timestamp("created_at").defaultNow().notNull(),
        sentAt: timestamp("sent_at")
      },
      (table) => [
        index("idx_recipient_id").on(table.recipientId),
        index("idx_approval_request_id").on(table.approvalRequestId),
        index("idx_type").on(table.type),
        index("idx_is_read").on(table.isRead)
      ]
    );
    approvalAuditLog = mysqlTable(
      "approval_audit_log",
      {
        id: varchar("id", { length: 36 }).primaryKey(),
        organizationId: varchar("organization_id", { length: 36 }).notNull(),
        approvalRequestId: varchar("approval_request_id", { length: 36 }).notNull(),
        // Action tracked
        action: varchar("action", { length: 100 }).notNull(),
        performedBy: varchar("performed_by", { length: 36 }),
        // Details
        details: json("details"),
        ipAddress: varchar("ip_address", { length: 45 }),
        userAgent: varchar("user_agent", { length: 500 }),
        createdAt: timestamp("created_at").defaultNow().notNull()
      },
      (table) => [
        index("idx_org_id").on(table.organizationId),
        index("idx_approval_request_id").on(table.approvalRequestId),
        index("idx_created_at").on(table.createdAt)
      ]
    );
    approvalMetrics = mysqlTable(
      "approval_metrics",
      {
        id: varchar("id", { length: 36 }).primaryKey(),
        organizationId: varchar("organization_id", { length: 36 }).notNull(),
        workflowId: varchar("workflow_id", { length: 36 }),
        // Time metrics
        avgApprovalTime: int("avg_approval_time"),
        // in minutes
        medianApprovalTime: int("median_approval_time"),
        // Volume metrics
        totalRequests: int("total_requests").default(0),
        approvedRequests: int("approved_requests").default(0),
        rejectedRequests: int("rejected_requests").default(0),
        partiallyApprovedRequests: int("partially_approved_requests").default(0),
        pendingRequests: int("pending_requests").default(0),
        // Performance
        approvalRate: int("approval_rate"),
        // percentage
        rejectionRate: int("rejection_rate"),
        escalationRate: int("escalation_rate"),
        // Period
        period: varchar("period", { length: 20 }),
        // 'daily', 'weekly', 'monthly'
        periodDate: timestamp("period_date").notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull()
      },
      (table) => [
        index("idx_org_id").on(table.organizationId),
        index("idx_workflow_id").on(table.workflowId),
        index("idx_period").on(table.period, table.periodDate)
      ]
    );
  }
});

// drizzle/schema.ts
var schema_exports = {};
__export(schema_exports, {
  accounts: () => accounts,
  activeSessions: () => activeSessions,
  activityLog: () => activityLog,
  aiChatMessages: () => aiChatMessages,
  aiChatSessions: () => aiChatSessions,
  aiConfigurations: () => aiConfigurations,
  aiDocuments: () => aiDocuments,
  aiInsights: () => aiInsights,
  analyticsMetrics: () => analyticsMetrics,
  apiKeys: () => apiKeys,
  apiPricingConfigs: () => apiPricingConfigs,
  approvalActions: () => approvalActions,
  approvalAuditLog: () => approvalAuditLog,
  approvalLevels: () => approvalLevels,
  approvalMetrics: () => approvalMetrics,
  approvalNotifications: () => approvalNotifications,
  approvalRequests: () => approvalRequests,
  approvalWorkflows: () => approvalWorkflows2,
  assets: () => assets,
  attendance: () => attendance,
  auditLogs: () => auditLogs,
  automatedReceipts: () => automatedReceipts,
  automationConfigs: () => automationConfigs,
  backupHistory: () => backupHistory,
  backupSchedules: () => backupSchedules,
  bankAccounts: () => bankAccounts,
  bankReconciliationDetails: () => bankReconciliationDetails,
  bankReconciliationStatements: () => bankReconciliationStatements,
  bankTransactions: () => bankTransactions,
  billingInvoices: () => billingInvoices,
  billingNotifications: () => billingNotifications,
  billingUsageMetrics: () => billingUsageMetrics,
  budgets: () => budgets,
  cannedResponses: () => cannedResponses,
  clientHealthScores: () => clientHealthScores,
  clientSubscriptions: () => clientSubscriptions,
  clients: () => clients,
  cohortAnalyses: () => cohortAnalyses,
  collaborationSessions: () => collaborationSessions,
  communicationLogs: () => communicationLogs,
  complianceRecords: () => complianceRecords,
  contacts: () => contacts,
  containerDeployments: () => containerDeployments,
  contracts: () => contracts,
  conversationMembers: () => conversationMembers,
  conversations: () => conversations,
  creditNotes: () => creditNotes,
  currencies: () => currencies,
  customDashboards: () => customDashboards,
  customFields: () => customFields,
  customReports: () => customReports,
  customRoles: () => customRoles,
  dashboardLayouts: () => dashboardLayouts,
  dashboardWidgetData: () => dashboardWidgetData,
  dashboardWidgets: () => dashboardWidgets,
  debitNotes: () => debitNotes,
  defaultSettings: () => defaultSettings,
  deliveryNotes: () => deliveryNotes,
  departmentHierarchies: () => departmentHierarchies,
  departments: () => departments,
  designConfigs: () => designConfigs,
  documentAccess: () => documentAccess,
  documentNumberFormats: () => documentNumberFormats,
  documentVersions: () => documentVersions,
  documents: () => documents,
  dunningEvents: () => dunningEvents,
  dunningPolicies: () => dunningPolicies,
  eSignatureRequests: () => eSignatureRequests,
  emailCalendarSync: () => emailCalendarSync,
  emailCampaigns: () => emailCampaigns,
  emailGenerationHistory: () => emailGenerationHistory,
  emailLog: () => emailLog,
  emailLogs: () => emailLogs,
  emailQueue: () => emailQueue,
  employeePromotions: () => employeePromotions,
  employeeSkills: () => employeeSkills,
  employeeTransfers: () => employeeTransfers,
  employees: () => employees,
  estimateItems: () => estimateItems,
  estimates: () => estimates,
  etlJobs: () => etlJobs,
  exchangeRates: () => exchangeRates,
  executiveReports: () => executiveReports,
  expenseCategories: () => expenseCategories,
  expenseReports: () => expenseReports,
  expenses: () => expenses,
  exportJobs: () => exportJobs,
  fieldValidations: () => fieldValidations,
  fieldValues: () => fieldValues,
  fileFolders: () => fileFolders,
  financialAnalytics: () => financialAnalytics,
  forecastModels: () => forecastModels,
  forecastResults: () => forecastResults,
  globalConfigs: () => globalConfigs,
  goodsReceiptNotes: () => goodsReceiptNotes,
  grnRecords: () => grnRecords,
  guestClients: () => guestClients,
  holidays: () => holidays,
  hrSettings: () => hrSettings,
  imprestSurrenders: () => imprestSurrenders,
  imprests: () => imprests,
  integrationConfigs: () => integrationConfigs,
  integrationLogs: () => integrationLogs,
  inventoryTransactions: () => inventoryTransactions,
  invoiceItems: () => invoiceItems,
  invoiceReminders: () => invoiceReminders,
  invoices: () => invoices,
  jobAlertHistory: () => jobAlertHistory,
  jobAlertRules: () => jobAlertRules,
  jobExecutionLogs: () => jobExecutionLogs,
  jobGroups: () => jobGroups,
  jobHeartbeat: () => jobHeartbeat,
  journalEntries: () => journalEntries,
  journalEntryLines: () => journalEntryLines,
  kbArticles: () => kbArticles,
  kbCategories: () => kbCategories,
  leads: () => leads,
  leaveApprovals: () => leaveApprovals,
  leaveBalances: () => leaveBalances,
  leaveRequests: () => leaveRequests,
  lineItems: () => lineItems,
  lpos: () => lpos,
  messageReadReceipts: () => messageReadReceipts,
  messages: () => messages,
  mobileAppConfigs: () => mobileAppConfigs,
  mpesaTransactions: () => mpesaTransactions,
  notes: () => notes,
  notificationBroadcasts: () => notificationBroadcasts,
  notificationPreferences: () => notificationPreferences,
  notificationRules: () => notificationRules,
  notificationSettings: () => notificationSettings,
  notificationTemplates: () => notificationTemplates,
  notifications: () => notifications,
  onboardingChecklists: () => onboardingChecklists,
  onboardingTasks: () => onboardingTasks,
  opportunities: () => opportunities,
  orders: () => orders,
  organizationAccountingPolicies: () => organizationAccountingPolicies,
  organizationFeatures: () => organizationFeatures,
  organizationSubscriptions: () => organizationSubscriptions,
  organizationUsers: () => organizationUsers,
  organizations: () => organizations,
  partnerDeals: () => partnerDeals,
  paymentMethods: () => paymentMethods,
  paymentPlanInstallments: () => paymentPlanInstallments,
  paymentPlans: () => paymentPlans,
  paymentRetries: () => paymentRetries,
  paymentTriggers: () => paymentTriggers,
  payments: () => payments,
  payroll: () => payroll,
  payrollBatches: () => payrollBatches,
  payrollDetails: () => payrollDetails,
  payslips: () => payslips,
  perfConfigs: () => perfConfigs,
  performanceContracts: () => performanceContracts,
  performanceReviews: () => performanceReviews,
  permissionAuditLog: () => permissionAuditLog,
  permissionAuditLogs: () => permissionAuditLogs,
  permissionDelegations: () => permissionDelegations,
  permissionMetadata: () => permissionMetadata,
  permissions: () => permissions,
  pricingPlans: () => pricingPlans,
  pricingTierFeatures: () => pricingTierFeatures,
  products: () => products,
  projectComments: () => projectComments,
  projectMetrics: () => projectMetrics,
  projectMilestones: () => projectMilestones,
  projectTasks: () => projectTasks,
  projects: () => projects,
  proposals: () => proposals,
  purchaseOrderItems: () => purchaseOrderItems,
  purchaseOrders: () => purchaseOrders,
  quotations: () => quotations,
  receipts: () => receipts,
  recurringExpenses: () => recurringExpenses,
  recurringInvoiceTemplates: () => recurringInvoiceTemplates,
  recurringInvoices: () => recurringInvoices,
  registeredDevices: () => registeredDevices,
  reimbursements: () => reimbursements,
  reminders: () => reminders,
  rolePermissions: () => rolePermissions,
  savedFilters: () => savedFilters,
  scheduledJobs: () => scheduledJobs,
  scheduledReminders: () => scheduledReminders,
  schedules: () => schedules,
  securityEvents: () => securityEvents,
  securityIncidents: () => securityIncidents,
  serviceInvoiceItems: () => serviceInvoiceItems,
  serviceInvoices: () => serviceInvoices,
  services: () => services,
  settings: () => settings,
  skillsMatrix: () => skillsMatrix,
  smartWorkflows: () => smartWorkflows,
  smsAutomationRules: () => smsAutomationRules,
  smsCustomerPreferences: () => smsCustomerPreferences,
  smsDeliveryEvents: () => smsDeliveryEvents,
  smsQueue: () => smsQueue,
  smsTemplates: () => smsTemplates,
  staffChatChannels: () => staffChatChannels,
  staffChatMessages: () => staffChatMessages,
  staffTasks: () => staffTasks,
  stockAlerts: () => stockAlerts,
  stockMovements: () => stockMovements,
  stripeCustomers: () => stripeCustomers,
  stripePaymentIntents: () => stripePaymentIntents,
  stripeWebhookEvents: () => stripeWebhookEvents,
  subscriptions: () => subscriptions,
  systemHealth: () => systemHealth,
  systemLogs: () => systemLogs,
  systemSettings: () => systemSettings,
  taxCompliance: () => taxCompliance,
  taxRates: () => taxRates,
  templates: () => templates,
  tenantMessages: () => tenantMessages,
  ticketResponses: () => ticketResponses,
  tickets: () => tickets,
  timeEntries: () => timeEntries,
  timesheets: () => timesheets,
  trainingCourses: () => trainingCourses,
  trainingEnrollments: () => trainingEnrollments,
  usageMetrics: () => usageMetrics,
  userDeletions: () => userDeletions,
  userFavorites: () => userFavorites,
  userPermissions: () => userPermissions,
  userProjectAssignments: () => userProjectAssignments,
  userRoles: () => userRoles,
  users: () => users,
  vacationRequests: () => vacationRequests,
  warehouses: () => warehouses,
  warranties: () => warranties,
  webhookConfigs: () => webhookConfigs,
  webhooks: () => webhooks,
  workOrderMaterials: () => workOrderMaterials,
  workOrders: () => workOrders,
  workflowActions: () => workflowActions,
  workflowAutomationLogs: () => workflowAutomationLogs,
  workflowExecutions: () => workflowExecutions,
  workflowTriggers: () => workflowTriggers,
  workflows: () => workflows
});
import { mysqlTable as mysqlTable2, index as index2, uniqueIndex as uniqueIndex2, varchar as varchar2, mysqlEnum, int as int2, text as text2, longtext, timestamp as timestamp2, datetime, tinyint, json as json2, decimal, bigint, boolean as boolean2 } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";
var accounts, activityLog, auditLogs, bankAccounts, bankTransactions, clients, communicationLogs, jobGroups, employees, estimateItems, estimates, proposals, expenses, recurringExpenses, guestClients, inventoryTransactions, invoiceItems, invoices, recurringInvoices, journalEntries, journalEntryLines, leaveRequests, opportunities, paymentPlans, paymentPlanInstallments, payroll, products, projectTasks, projects, projectMilestones, timeEntries, reminders, scheduledReminders, services, settings, stockAlerts, systemSettings, templates, documentNumberFormats, defaultSettings, permissions, customRoles, userRoles, rolePermissions, receipts, creditNotes, debitNotes, departments, budgets, attendance, userProjectAssignments, projectComments, staffTasks, userPermissions, users, savedFilters, notifications, notificationSettings, notificationPreferences, smsQueue, smsCustomerPreferences, smsTemplates, smsAutomationRules, smsDeliveryEvents, userFavorites, aiDocuments, emailGenerationHistory, financialAnalytics, aiChatSessions, aiChatMessages, lineItems, workflows, workflowTriggers, workflowActions, workflowExecutions, permissionMetadata, dashboardLayouts, dashboardWidgets, dashboardWidgetData, permissionAuditLog, projectMetrics, clientHealthScores, performanceReviews, performanceContracts, skillsMatrix, schedules, vacationRequests, documents, fileFolders, documentVersions, documentAccess, notificationRules, usageMetrics, expenseCategories, expenseReports, reimbursements, currencies, exchangeRates, taxRates, forecastModels, forecastResults, apiKeys, webhooks, integrationLogs, emailQueue, emailLog, invoiceReminders, pricingPlans, subscriptions, organizationSubscriptions, billingInvoices, payments, paymentMethods, billingUsageMetrics, billingNotifications, dunningPolicies, paymentRetries, dunningEvents, userDeletions, notificationTemplates, notificationBroadcasts, messages, conversations, organizations, organizationFeatures, organizationUsers, tenantMessages, pricingTierFeatures, conversationMembers, messageReadReceipts, tickets, ticketResponses, recurringInvoiceTemplates, automatedReceipts, emailCampaigns, emailLogs, workOrders, eSignatureRequests, workOrderMaterials, serviceInvoices, serviceInvoiceItems, contacts, quotations, grnRecords, deliveryNotes, assets, contracts, warranties, notes, customReports, organizationAccountingPolicies, imprests, imprestSurrenders, purchaseOrders, purchaseOrderItems, goodsReceiptNotes, leads, bankReconciliationStatements, bankReconciliationDetails, automationConfigs, workflowAutomationLogs, smartWorkflows, exportJobs, securityEvents, aiConfigurations, apiPricingConfigs, etlJobs, containerDeployments, customDashboards, webhookConfigs, emailCalendarSync, securityIncidents, globalConfigs, registeredDevices, mobileAppConfigs, partnerDeals, perfConfigs, backupSchedules, backupHistory, integrationConfigs, designConfigs, aiInsights, analyticsMetrics, cohortAnalyses, executiveReports, collaborationSessions, complianceRecords, staffChatChannels, staffChatMessages, cannedResponses, kbCategories, kbArticles, warehouses, stockMovements, clientSubscriptions, systemHealth, systemLogs, activeSessions, departmentHierarchies, employeePromotions, employeeTransfers, timesheets, payrollBatches, payrollDetails, scheduledJobs, jobExecutionLogs, jobAlertRules, jobAlertHistory, jobHeartbeat, customFields, fieldValidations, fieldValues, stripeCustomers, stripePaymentIntents, mpesaTransactions, stripeWebhookEvents, lpos, orders, payslips, leaveBalances, leaveApprovals, taxCompliance, holidays, trainingCourses, trainingEnrollments, onboardingChecklists, onboardingTasks, employeeSkills, hrSettings, approvalWorkflows2, permissionAuditLogs, permissionDelegations, paymentTriggers;
var init_schema = __esm({
  "drizzle/schema.ts"() {
    init_approvalSchema();
    accounts = mysqlTable2(
      "accounts",
      {
        id: varchar2({ length: 64 }).primaryKey(),
        organizationId: varchar2({ length: 64 }),
        accountCode: varchar2({ length: 50 }).notNull(),
        accountName: varchar2({ length: 255 }).notNull(),
        accountType: mysqlEnum(["asset", "liability", "equity", "revenue", "expense", "cost of goods sold", "operating expense", "capital expenditure", "other income", "other expense"]).notNull(),
        parentAccountId: varchar2({ length: 64 }),
        balance: int2().default(0),
        isActive: tinyint().default(1).notNull(),
        description: text2(),
        createdAt: timestamp2({ mode: "string" }).default(sql`CURRENT_TIMESTAMP`),
        updatedAt: timestamp2({ mode: "string" }).default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`)
      },
      (table) => [
        index2("account_code_idx").on(table.accountCode),
        index2("account_type_idx").on(table.accountType)
      ]
    );
    activityLog = mysqlTable2(
      "activityLog",
      {
        id: varchar2({ length: 64 }).primaryKey(),
        userId: varchar2({ length: 64 }).notNull(),
        action: varchar2({ length: 100 }).notNull(),
        entityType: varchar2({ length: 100 }),
        entityId: varchar2({ length: 64 }),
        description: text2(),
        metadata: text2(),
        ipAddress: varchar2({ length: 45 }),
        createdAt: timestamp2({ mode: "string" })
      },
      (table) => [
        index2("user_idx").on(table.userId),
        index2("entity_idx").on(table.entityType, table.entityId),
        index2("created_at_idx").on(table.createdAt)
      ]
    );
    auditLogs = mysqlTable2("auditLogs", {
      id: varchar2({ length: 64 }).primaryKey(),
      userId: varchar2({ length: 64 }).notNull(),
      action: varchar2({ length: 100 }).notNull(),
      resourceType: varchar2({ length: 50 }).notNull(),
      resourceId: varchar2({ length: 64 }),
      changes: text2(),
      ipAddress: varchar2({ length: 50 }),
      userAgent: text2(),
      createdAt: timestamp2({ mode: "string" })
    });
    bankAccounts = mysqlTable2("bankAccounts", {
      id: varchar2({ length: 64 }).primaryKey(),
      accountName: varchar2({ length: 255 }).notNull(),
      bankName: varchar2({ length: 255 }).notNull(),
      accountNumber: varchar2({ length: 100 }).notNull(),
      currency: varchar2({ length: 10 }).default("KES").notNull(),
      balance: int2().default(0),
      isActive: tinyint().default(1).notNull(),
      createdAt: timestamp2({ mode: "string" }),
      updatedAt: timestamp2({ mode: "string" })
    });
    bankTransactions = mysqlTable2(
      "bankTransactions",
      {
        id: varchar2({ length: 64 }).primaryKey(),
        bankAccountId: varchar2({ length: 64 }).notNull(),
        transactionDate: datetime({ mode: "string" }).notNull(),
        description: text2(),
        referenceNumber: varchar2({ length: 100 }),
        debit: int2().default(0),
        credit: int2().default(0),
        balance: int2().notNull(),
        isReconciled: tinyint().default(0).notNull(),
        reconciledDate: datetime({ mode: "string" }),
        reconciledBy: varchar2({ length: 64 }),
        matchedTransactionId: varchar2({ length: 64 }),
        createdAt: timestamp2({ mode: "string" })
      },
      (table) => [
        index2("bank_account_idx").on(table.bankAccountId),
        index2("transaction_date_idx").on(table.transactionDate),
        index2("reconciled_idx").on(table.isReconciled)
      ]
    );
    clients = mysqlTable2(
      "clients",
      {
        id: varchar2({ length: 64 }).primaryKey(),
        organizationId: varchar2({ length: 64 }),
        companyName: varchar2({ length: 255 }).notNull(),
        contactPerson: varchar2({ length: 255 }),
        email: varchar2({ length: 320 }),
        phone: varchar2({ length: 50 }),
        secondaryPhone: varchar2({ length: 50 }),
        address: text2(),
        city: varchar2({ length: 100 }),
        country: varchar2({ length: 100 }),
        postalCode: varchar2({ length: 20 }),
        taxId: varchar2({ length: 100 }),
        website: varchar2({ length: 255 }),
        industry: varchar2({ length: 100 }),
        status: mysqlEnum(["active", "inactive", "prospect", "archived"]).default("active").notNull(),
        assignedTo: varchar2({ length: 64 }),
        notes: text2(),
        createdBy: varchar2({ length: 64 }),
        createdAt: timestamp2({ mode: "string" }),
        updatedAt: timestamp2({ mode: "string" }),
        businessType: varchar2({ length: 100 }),
        registrationNumber: varchar2({ length: 100 }),
        bankName: varchar2({ length: 255 }),
        bankCode: varchar2({ length: 50 }),
        branch: varchar2({ length: 100 }),
        bankAccountNumber: varchar2({ length: 100 }),
        creditLimit: int2(),
        paymentTerms: varchar2({ length: 100 }),
        numberOfEmployees: int2(),
        yearEstablished: int2(),
        businessLicense: varchar2({ length: 255 }),
        leadSource: varchar2({ length: 100 }),
        currency: varchar2({ length: 10 })
      },
      (table) => [
        index2("email_idx").on(table.email),
        index2("status_idx").on(table.status)
      ]
    );
    communicationLogs = mysqlTable2("communicationLogs", {
      id: varchar2({ length: 64 }).primaryKey(),
      organizationId: varchar2({ length: 64 }),
      type: mysqlEnum(["email", "sms"]).notNull(),
      recipient: varchar2({ length: 320 }).notNull(),
      subject: varchar2({ length: 500 }),
      body: text2(),
      status: mysqlEnum(["pending", "sent", "failed"]).default("pending").notNull(),
      error: text2(),
      referenceType: varchar2({ length: 50 }),
      referenceId: varchar2({ length: 64 }),
      sentAt: datetime({ mode: "string" }),
      createdBy: varchar2({ length: 64 }),
      createdAt: timestamp2({ mode: "string" })
    });
    jobGroups = mysqlTable2(
      "jobGroups",
      {
        id: varchar2({ length: 64 }).primaryKey(),
        organizationId: varchar2({ length: 64 }),
        name: varchar2({ length: 100 }).notNull(),
        managerId: varchar2({ length: 64 }),
        minimumGrossSalary: int2().notNull(),
        maximumGrossSalary: int2().notNull(),
        defaultBasicSalary: int2(),
        defaultAnnualLeaveDays: int2().default(21),
        defaultAllowances: text2(),
        defaultDeductions: text2(),
        defaultBenefits: text2(),
        description: text2(),
        isActive: tinyint().default(1).notNull(),
        createdAt: timestamp2({ mode: "string" }),
        updatedAt: timestamp2({ mode: "string" })
      },
      (table) => [
        index2("job_group_org_idx").on(table.organizationId),
        index2("job_group_manager_idx").on(table.managerId),
        index2("job_group_name_idx").on(table.name),
        index2("is_active_idx").on(table.isActive)
      ]
    );
    employees = mysqlTable2(
      "employees",
      {
        id: varchar2({ length: 64 }).primaryKey(),
        organizationId: varchar2({ length: 64 }),
        userId: varchar2({ length: 64 }),
        employeeNumber: varchar2({ length: 50 }).notNull(),
        firstName: varchar2({ length: 100 }).notNull(),
        lastName: varchar2({ length: 100 }).notNull(),
        email: varchar2({ length: 320 }),
        phone: varchar2({ length: 50 }),
        country: varchar2({ length: 5 }).default("KE"),
        gender: mysqlEnum(["male", "female", "other"]),
        maritalStatus: mysqlEnum(["single", "married", "divorced", "widowed"]),
        dateOfBirth: datetime({ mode: "string" }),
        hireDate: datetime({ mode: "string" }).notNull(),
        probationEndDate: datetime({ mode: "string" }),
        contractEndDate: datetime({ mode: "string" }),
        department: varchar2({ length: 100 }),
        position: varchar2({ length: 100 }),
        jobGroupId: varchar2({ length: 64 }).notNull(),
        salary: int2(),
        employmentType: mysqlEnum(["full_time", "part_time", "contract", "intern", "contractual", "hourly", "wage", "temporary", "seasonal"]).default("full_time").notNull(),
        status: mysqlEnum(["active", "on_leave", "terminated", "suspended"]).default("active").notNull(),
        address: text2(),
        emergencyContactName: varchar2({ length: 255 }),
        emergencyContactRelationship: varchar2({ length: 100 }),
        emergencyContactPhone: varchar2({ length: 50 }),
        emergencyContact: text2(),
        bankName: varchar2({ length: 255 }),
        bankBranch: varchar2({ length: 255 }),
        bankAccountNumber: varchar2({ length: 100 }),
        nhifNumber: varchar2({ length: 50 }),
        nssfNumber: varchar2({ length: 50 }),
        taxId: varchar2({ length: 100 }),
        nationalId: varchar2({ length: 100 }),
        photoUrl: longtext(),
        createdBy: varchar2({ length: 64 }),
        createdAt: timestamp2({ mode: "string" }),
        updatedAt: timestamp2({ mode: "string" })
      },
      (table) => [
        index2("employee_number_idx").on(table.employeeNumber),
        index2("department_idx").on(table.department),
        index2("job_group_idx").on(table.jobGroupId),
        index2("status_idx").on(table.status)
      ]
    );
    estimateItems = mysqlTable2(
      "estimateItems",
      {
        id: varchar2({ length: 64 }).primaryKey(),
        estimateId: varchar2({ length: 64 }).notNull(),
        itemType: mysqlEnum(["product", "service", "custom"]).notNull(),
        itemId: varchar2({ length: 64 }),
        description: text2().notNull(),
        quantity: int2().notNull(),
        unitPrice: int2().notNull(),
        taxRate: int2().default(0),
        discountPercent: int2().default(0),
        total: int2().notNull(),
        createdAt: timestamp2({ mode: "string" })
      },
      (table) => [
        index2("estimate_idx").on(table.estimateId)
      ]
    );
    estimates = mysqlTable2(
      "estimates",
      {
        id: varchar2({ length: 64 }).primaryKey(),
        organizationId: varchar2({ length: 64 }),
        estimateNumber: varchar2({ length: 100 }).notNull(),
        clientId: varchar2({ length: 64 }).notNull(),
        title: varchar2({ length: 255 }),
        status: mysqlEnum(["draft", "sent", "accepted", "rejected", "expired"]).default("draft").notNull(),
        issueDate: datetime({ mode: "string" }).notNull(),
        expiryDate: datetime({ mode: "string" }),
        subtotal: int2().notNull(),
        taxAmount: int2().default(0),
        discountAmount: int2().default(0),
        total: int2().notNull(),
        notes: text2(),
        terms: text2(),
        createdBy: varchar2({ length: 64 }),
        createdAt: timestamp2({ mode: "string" }),
        updatedAt: timestamp2({ mode: "string" })
      },
      (table) => [
        uniqueIndex2("estimate_number_unique_idx").on(table.estimateNumber),
        index2("client_idx").on(table.clientId),
        index2("status_idx").on(table.status)
      ]
    );
    proposals = mysqlTable2(
      "proposals",
      {
        id: varchar2({ length: 64 }).primaryKey(),
        proposalNumber: varchar2({ length: 100 }).notNull(),
        clientId: varchar2({ length: 64 }).notNull(),
        title: varchar2({ length: 255 }),
        status: mysqlEnum(["draft", "sent", "accepted", "rejected"]).default("draft").notNull(),
        issueDate: datetime({ mode: "string" }).notNull(),
        expiryDate: datetime({ mode: "string" }),
        subtotal: int2().notNull(),
        taxAmount: int2().default(0),
        discountAmount: int2().default(0),
        total: int2().notNull(),
        notes: text2(),
        createdBy: varchar2({ length: 64 }),
        createdAt: timestamp2({ mode: "string" }),
        updatedAt: timestamp2({ mode: "string" })
      },
      (table) => [
        uniqueIndex2("proposal_number_unique_idx").on(table.proposalNumber),
        index2("client_idx").on(table.clientId),
        index2("status_idx").on(table.status)
      ]
    );
    expenses = mysqlTable2(
      "expenses",
      {
        id: varchar2({ length: 64 }).primaryKey(),
        organizationId: varchar2({ length: 64 }),
        expenseNumber: varchar2({ length: 100 }),
        category: varchar2({ length: 100 }).notNull(),
        vendor: varchar2({ length: 255 }),
        amount: int2().notNull(),
        expenseDate: datetime({ mode: "string" }).notNull(),
        paymentMethod: mysqlEnum(["cash", "bank_transfer", "cheque", "card", "other"]),
        receiptUrl: longtext(),
        description: text2(),
        accountId: varchar2({ length: 64 }),
        budgetAllocationId: varchar2({ length: 64 }),
        // Link to budget allocation line
        status: mysqlEnum(["pending", "approved", "rejected", "paid"]).default("pending").notNull(),
        createdBy: varchar2({ length: 64 }),
        approvedBy: varchar2({ length: 64 }),
        approvedAt: datetime({ mode: "string" }),
        chartOfAccountId: int2(),
        createdAt: timestamp2({ mode: "string" }),
        updatedAt: timestamp2({ mode: "string" })
      },
      (table) => [
        uniqueIndex2("expense_number_unique_idx").on(table.expenseNumber),
        index2("expense_date_idx").on(table.expenseDate),
        index2("category_idx").on(table.category),
        index2("status_idx").on(table.status),
        index2("chart_of_account_idx").on(table.chartOfAccountId)
      ]
    );
    recurringExpenses = mysqlTable2(
      "recurringExpenses",
      {
        id: varchar2({ length: 64 }).primaryKey(),
        organizationId: varchar2({ length: 64 }),
        category: varchar2({ length: 100 }).notNull(),
        vendor: varchar2({ length: 255 }),
        amount: int2().notNull(),
        description: text2(),
        paymentMethod: mysqlEnum(["cash", "bank_transfer", "cheque", "card", "other"]),
        frequency: mysqlEnum(["weekly", "biweekly", "monthly", "quarterly", "annually"]).notNull(),
        startDate: datetime({ mode: "string" }).notNull(),
        endDate: datetime({ mode: "string" }),
        nextDueDate: datetime({ mode: "string" }).notNull(),
        dayOfMonth: int2().default(1),
        reminderDaysBefore: int2().default(3),
        lastGeneratedDate: datetime({ mode: "string" }),
        isActive: tinyint().default(1).notNull(),
        chartOfAccountId: int2(),
        createdBy: varchar2({ length: 64 }),
        createdAt: timestamp2({ mode: "string" }),
        updatedAt: timestamp2({ mode: "string" })
      },
      (table) => [
        index2("re_org_idx").on(table.organizationId),
        index2("re_next_due_idx").on(table.nextDueDate),
        index2("re_active_idx").on(table.isActive)
      ]
    );
    guestClients = mysqlTable2("guestClients", {
      id: varchar2({ length: 64 }).primaryKey(),
      name: varchar2({ length: 255 }).notNull(),
      email: varchar2({ length: 320 }),
      phone: varchar2({ length: 50 }),
      address: text2(),
      notes: text2(),
      createdBy: varchar2({ length: 64 }),
      createdAt: timestamp2({ mode: "string" })
    });
    inventoryTransactions = mysqlTable2("inventoryTransactions", {
      id: varchar2({ length: 64 }).primaryKey(),
      productId: varchar2({ length: 64 }).notNull(),
      type: mysqlEnum(["purchase", "sale", "adjustment", "return", "transfer"]).notNull(),
      quantity: int2().notNull(),
      unitCost: int2(),
      referenceType: varchar2({ length: 50 }),
      referenceId: varchar2({ length: 64 }),
      notes: text2(),
      transactionDate: datetime({ mode: "string" }).notNull(),
      createdBy: varchar2({ length: 64 }),
      createdAt: timestamp2({ mode: "string" })
    });
    invoiceItems = mysqlTable2(
      "invoiceItems",
      {
        id: varchar2({ length: 64 }).primaryKey(),
        invoiceId: varchar2({ length: 64 }).notNull(),
        itemType: mysqlEnum(["product", "service", "custom"]).notNull(),
        itemId: varchar2({ length: 64 }),
        description: text2().notNull(),
        quantity: int2().notNull(),
        unitPrice: int2().notNull(),
        taxRate: int2().default(0),
        discountPercent: int2().default(0),
        total: int2().notNull(),
        createdAt: timestamp2({ mode: "string" })
      },
      (table) => [
        index2("invoice_idx").on(table.invoiceId)
      ]
    );
    invoices = mysqlTable2(
      "invoices",
      {
        id: varchar2({ length: 64 }).primaryKey(),
        organizationId: varchar2({ length: 64 }),
        invoiceNumber: varchar2({ length: 100 }).notNull(),
        clientId: varchar2({ length: 64 }).notNull(),
        estimateId: varchar2({ length: 64 }),
        title: varchar2({ length: 255 }),
        status: mysqlEnum(["draft", "pending", "sent", "paid", "partial", "overdue", "cancelled"]).default("draft").notNull(),
        issueDate: datetime({ mode: "string" }).notNull(),
        dueDate: datetime({ mode: "string" }).notNull(),
        subtotal: int2().notNull(),
        taxAmount: int2().default(0),
        discountAmount: int2().default(0),
        total: int2().notNull(),
        paidAmount: int2().default(0),
        notes: text2(),
        terms: text2(),
        createdBy: varchar2({ length: 64 }),
        createdAt: timestamp2({ mode: "string" }),
        updatedAt: timestamp2({ mode: "string" }),
        paymentPlanId: varchar2({ length: 64 }),
        isAutoRecurring: tinyint().default(0),
        recurringInvoiceId: varchar2({ length: 64 }),
        clientSubscriptionId: varchar2({ length: 64 }),
        accountManagerId: varchar2({ length: 64 })
      },
      (table) => [
        uniqueIndex2("invoice_number_unique_idx").on(table.invoiceNumber),
        index2("client_idx").on(table.clientId),
        index2("status_idx").on(table.status),
        index2("due_date_idx").on(table.dueDate)
      ]
    );
    recurringInvoices = mysqlTable2(
      "recurringInvoices",
      {
        id: varchar2({ length: 64 }).primaryKey(),
        organizationId: varchar2({ length: 64 }),
        clientId: varchar2({ length: 64 }).notNull(),
        templateInvoiceId: varchar2({ length: 64 }).notNull(),
        clientSubscriptionId: varchar2({ length: 64 }),
        accountManagerId: varchar2({ length: 64 }),
        frequency: mysqlEnum(["weekly", "biweekly", "monthly", "quarterly", "annually"]).notNull(),
        startDate: datetime({ mode: "string" }).notNull(),
        endDate: datetime({ mode: "string" }),
        nextDueDate: datetime({ mode: "string" }).notNull(),
        lastGeneratedDate: datetime({ mode: "string" }),
        isActive: tinyint().default(1).notNull(),
        description: text2(),
        noteToInvoice: text2(),
        createdBy: varchar2({ length: 64 }),
        createdAt: timestamp2({ mode: "string" }),
        updatedAt: timestamp2({ mode: "string" })
      },
      (table) => [
        index2("client_idx").on(table.clientId),
        index2("is_active_idx").on(table.isActive),
        index2("next_due_date_idx").on(table.nextDueDate)
      ]
    );
    journalEntries = mysqlTable2(
      "journalEntries",
      {
        id: varchar2({ length: 64 }).primaryKey(),
        entryNumber: varchar2({ length: 100 }).notNull(),
        entryDate: datetime({ mode: "string" }).notNull(),
        description: text2(),
        referenceType: varchar2({ length: 50 }),
        referenceId: varchar2({ length: 64 }),
        createdBy: varchar2({ length: 64 }),
        createdAt: timestamp2({ mode: "string" })
      },
      (table) => [
        index2("entry_date_idx").on(table.entryDate),
        index2("entry_number_idx").on(table.entryNumber)
      ]
    );
    journalEntryLines = mysqlTable2(
      "journalEntryLines",
      {
        id: varchar2({ length: 64 }).primaryKey(),
        journalEntryId: varchar2({ length: 64 }).notNull(),
        accountId: varchar2({ length: 64 }).notNull(),
        debit: int2().default(0),
        credit: int2().default(0),
        description: text2(),
        createdAt: timestamp2({ mode: "string" })
      },
      (table) => [
        index2("journal_entry_idx").on(table.journalEntryId),
        index2("account_idx").on(table.accountId)
      ]
    );
    leaveRequests = mysqlTable2(
      "leaveRequests",
      {
        id: varchar2({ length: 64 }).primaryKey(),
        organizationId: varchar2({ length: 64 }),
        employeeId: varchar2({ length: 64 }).notNull(),
        leaveType: mysqlEnum(["annual", "sick", "maternity", "paternity", "unpaid", "other"]).notNull(),
        startDate: datetime({ mode: "string" }).notNull(),
        endDate: datetime({ mode: "string" }).notNull(),
        days: int2().notNull(),
        reason: text2(),
        status: mysqlEnum(["pending", "approved", "rejected", "cancelled"]).default("pending").notNull(),
        approvedBy: varchar2({ length: 64 }),
        approvalDate: datetime({ mode: "string" }),
        notes: text2(),
        createdAt: timestamp2({ mode: "string" }),
        updatedAt: timestamp2({ mode: "string" })
      },
      (table) => [
        index2("employee_idx").on(table.employeeId),
        index2("status_idx").on(table.status),
        index2("start_date_idx").on(table.startDate)
      ]
    );
    opportunities = mysqlTable2(
      "opportunities",
      {
        id: varchar2({ length: 64 }).primaryKey(),
        organizationId: varchar2({ length: 64 }),
        clientId: varchar2({ length: 64 }).notNull(),
        title: varchar2({ length: 255 }).notNull(),
        description: text2(),
        value: int2().notNull(),
        stage: mysqlEnum(["lead", "qualified", "proposal", "negotiation", "closed_won", "closed_lost"]).default("lead").notNull(),
        probability: int2().default(0),
        expectedCloseDate: datetime({ mode: "string" }),
        actualCloseDate: datetime({ mode: "string" }),
        assignedTo: varchar2({ length: 64 }),
        source: varchar2({ length: 100 }),
        winReason: text2(),
        lossReason: text2(),
        notes: text2(),
        stageMovedAt: datetime({ mode: "string" }),
        createdBy: varchar2({ length: 64 }),
        createdAt: timestamp2({ mode: "string" }),
        updatedAt: timestamp2({ mode: "string" })
      },
      (table) => [
        index2("client_idx").on(table.clientId),
        index2("stage_idx").on(table.stage),
        index2("assigned_to_idx").on(table.assignedTo)
      ]
    );
    paymentPlans = mysqlTable2(
      "paymentPlans",
      {
        id: varchar2({ length: 64 }).primaryKey(),
        invoiceId: varchar2({ length: 64 }).notNull(),
        clientId: varchar2({ length: 64 }).notNull(),
        numInstallments: int2().notNull(),
        installmentAmount: int2().notNull(),
        frequencyDays: int2().notNull(),
        startDate: datetime({ mode: "string" }).notNull(),
        nextInstallmentDue: datetime({ mode: "string" }).notNull(),
        lastInstallmentDate: datetime({ mode: "string" }),
        completedInstallments: int2().default(0).notNull(),
        totalPaid: int2().default(0).notNull(),
        status: mysqlEnum(["active", "paused", "completed", "cancelled"]).default("active").notNull(),
        notes: text2(),
        createdBy: varchar2({ length: 64 }),
        createdAt: timestamp2({ mode: "string" }),
        updatedAt: timestamp2({ mode: "string" })
      },
      (table) => [
        index2("invoice_idx").on(table.invoiceId),
        index2("client_idx").on(table.clientId),
        index2("status_idx").on(table.status),
        index2("next_installment_idx").on(table.nextInstallmentDue)
      ]
    );
    paymentPlanInstallments = mysqlTable2(
      "paymentPlanInstallments",
      {
        id: varchar2({ length: 64 }).primaryKey(),
        paymentPlanId: varchar2({ length: 64 }).notNull(),
        installmentNumber: int2().notNull(),
        dueDate: datetime({ mode: "string" }).notNull(),
        amount: int2().notNull(),
        status: mysqlEnum(["pending", "paid", "overdue", "skipped"]).default("pending").notNull(),
        paidDate: datetime({ mode: "string" }),
        paidAmount: int2(),
        paymentId: varchar2({ length: 64 }),
        notes: text2(),
        createdAt: timestamp2({ mode: "string" })
      },
      (table) => [
        index2("payment_plan_idx").on(table.paymentPlanId),
        index2("due_date_idx").on(table.dueDate),
        index2("status_idx").on(table.status)
      ]
    );
    payroll = mysqlTable2(
      "payroll",
      {
        id: varchar2({ length: 64 }).primaryKey(),
        employeeId: varchar2({ length: 64 }).notNull(),
        payPeriodStart: datetime({ mode: "string" }).notNull(),
        payPeriodEnd: datetime({ mode: "string" }).notNull(),
        basicSalary: int2().notNull(),
        allowances: int2().default(0),
        deductions: int2().default(0),
        tax: int2().default(0),
        netSalary: int2().notNull(),
        status: mysqlEnum(["draft", "processed", "paid"]).default("draft").notNull(),
        paymentDate: datetime({ mode: "string" }),
        paymentMethod: varchar2({ length: 50 }),
        notes: text2(),
        createdBy: varchar2({ length: 64 }),
        createdAt: timestamp2({ mode: "string" }),
        updatedAt: timestamp2({ mode: "string" })
      },
      (table) => [
        index2("employee_idx").on(table.employeeId),
        index2("pay_period_idx").on(table.payPeriodStart, table.payPeriodEnd),
        index2("status_idx").on(table.status)
      ]
    );
    products = mysqlTable2(
      "products",
      {
        id: varchar2({ length: 64 }).primaryKey(),
        organizationId: varchar2({ length: 64 }),
        name: varchar2({ length: 255 }).notNull(),
        description: text2(),
        sku: varchar2({ length: 100 }),
        category: varchar2({ length: 100 }),
        unitPrice: int2().notNull(),
        costPrice: int2(),
        stockQuantity: int2().default(0),
        minStockLevel: int2().default(0),
        unit: varchar2({ length: 50 }).default("pcs"),
        taxRate: int2().default(0),
        isActive: tinyint().default(1).notNull(),
        imageUrl: varchar2({ length: 500 }),
        createdBy: varchar2({ length: 64 }),
        createdAt: timestamp2({ mode: "string" }),
        updatedAt: timestamp2({ mode: "string" }),
        supplier: varchar2({ length: 255 }),
        reorderLevel: int2(),
        reorderQuantity: int2(),
        lastRestockDate: timestamp2({ mode: "string" }),
        maxStockLevel: int2(),
        location: varchar2({ length: 255 })
      },
      (table) => [
        index2("sku_idx").on(table.sku),
        index2("category_idx").on(table.category)
      ]
    );
    projectTasks = mysqlTable2(
      "projectTasks",
      {
        id: varchar2({ length: 64 }).primaryKey(),
        projectId: varchar2({ length: 64 }),
        clientId: varchar2({ length: 64 }),
        title: varchar2({ length: 255 }).notNull(),
        description: text2(),
        status: mysqlEnum(["todo", "in_progress", "review", "completed", "blocked"]).default("todo").notNull(),
        priority: mysqlEnum(["low", "medium", "high", "urgent"]).default("medium").notNull(),
        assignedTo: varchar2({ length: 64 }),
        dueDate: datetime({ mode: "string" }),
        completedDate: datetime({ mode: "string" }),
        estimatedHours: int2(),
        actualHours: int2(),
        approvalStatus: mysqlEnum(["pending", "approved", "rejected", "revision_requested"]).default("pending").notNull(),
        adminRemarks: longtext(),
        approvedBy: varchar2({ length: 64 }),
        approvedAt: timestamp2({ mode: "string" }),
        rejectionReason: longtext(),
        parentTaskId: varchar2({ length: 64 }),
        order: int2().default(0),
        tags: text2(),
        targetDate: datetime({ mode: "string" }),
        billable: tinyint().default(1),
        visibleToClient: tinyint().default(1),
        createdBy: varchar2({ length: 64 }),
        createdAt: timestamp2({ mode: "string" }),
        updatedAt: timestamp2({ mode: "string" })
      },
      (table) => [
        index2("project_idx").on(table.projectId),
        index2("status_idx").on(table.status),
        index2("assigned_to_idx").on(table.assignedTo),
        index2("approval_status_idx").on(table.approvalStatus),
        index2("approved_by_idx").on(table.approvedBy)
      ]
    );
    projects = mysqlTable2(
      "projects",
      {
        id: varchar2({ length: 64 }).primaryKey(),
        organizationId: varchar2({ length: 64 }),
        projectNumber: varchar2({ length: 100 }).notNull(),
        name: varchar2({ length: 255 }).notNull(),
        description: text2(),
        clientId: varchar2({ length: 64 }).notNull(),
        status: mysqlEnum(["planning", "active", "on_hold", "completed", "cancelled"]).default("planning").notNull(),
        priority: mysqlEnum(["low", "medium", "high", "urgent"]).default("medium").notNull(),
        startDate: datetime({ mode: "string" }),
        endDate: datetime({ mode: "string" }),
        actualStartDate: datetime({ mode: "string" }),
        actualEndDate: datetime({ mode: "string" }),
        budget: int2(),
        actualCost: int2().default(0),
        progress: int2().default(0),
        assignedTo: varchar2({ length: 64 }),
        projectManager: varchar2({ length: 64 }),
        projectColor: varchar2({ length: 50 }).default("primary"),
        teamSize: int2().default(1),
        projectRating: int2().default(0),
        coverImageUrl: text2(),
        tags: text2(),
        notes: text2(),
        createdBy: varchar2({ length: 64 }),
        createdAt: timestamp2({ mode: "string" }),
        updatedAt: timestamp2({ mode: "string" })
      },
      (table) => [
        index2("project_number_idx").on(table.projectNumber),
        index2("client_idx").on(table.clientId),
        index2("status_idx").on(table.status),
        index2("assigned_to_idx").on(table.assignedTo)
      ]
    );
    projectMilestones = mysqlTable2(
      "projectMilestones",
      {
        id: varchar2({ length: 64 }).primaryKey(),
        projectId: varchar2({ length: 64 }).notNull(),
        phaseName: varchar2({ length: 255 }).notNull(),
        description: text2(),
        deliverables: text2(),
        status: mysqlEnum(["planning", "in_progress", "on_hold", "completed", "cancelled"]).default("planning").notNull(),
        startDate: datetime({ mode: "string" }),
        dueDate: datetime({ mode: "string" }).notNull(),
        completionDate: datetime({ mode: "string" }),
        completionPercentage: int2().default(0).notNull(),
        assignedTo: varchar2({ length: 64 }),
        budget: int2(),
        actualCost: int2().default(0),
        notes: text2(),
        createdBy: varchar2({ length: 64 }),
        createdAt: timestamp2({ mode: "string" }),
        updatedAt: timestamp2({ mode: "string" })
      },
      (table) => [
        index2("project_idx").on(table.projectId),
        index2("due_date_idx").on(table.dueDate),
        index2("status_idx").on(table.status)
      ]
    );
    timeEntries = mysqlTable2(
      "timeEntries",
      {
        id: varchar2({ length: 64 }).primaryKey(),
        projectId: varchar2({ length: 64 }).notNull(),
        projectTaskId: varchar2({ length: 64 }),
        userId: varchar2({ length: 64 }).notNull(),
        entryDate: datetime({ mode: "string" }).notNull(),
        durationMinutes: int2().notNull(),
        description: varchar2({ length: 500 }).notNull(),
        billable: tinyint().default(1).notNull(),
        hourlyRate: int2(),
        amount: int2().default(0),
        status: mysqlEnum(["draft", "submitted", "approved", "invoiced", "rejected"]).default("draft").notNull(),
        approvedBy: varchar2({ length: 64 }),
        approvedAt: datetime({ mode: "string" }),
        invoiceId: varchar2({ length: 64 }),
        notes: text2(),
        createdBy: varchar2({ length: 64 }),
        createdAt: timestamp2({ mode: "string" }),
        updatedAt: timestamp2({ mode: "string" })
      },
      (table) => [
        index2("project_idx").on(table.projectId),
        index2("task_idx").on(table.projectTaskId),
        index2("user_idx").on(table.userId),
        index2("entry_date_idx").on(table.entryDate),
        index2("status_idx").on(table.status),
        index2("billable_idx").on(table.billable)
      ]
    );
    reminders = mysqlTable2("reminders", {
      id: varchar2({ length: 64 }).primaryKey(),
      name: varchar2({ length: 255 }).notNull(),
      type: mysqlEnum(["invoice_due", "estimate_expiry", "project_milestone", "payment_overdue", "custom"]).notNull(),
      frequency: mysqlEnum(["once", "daily", "weekly", "monthly", "custom"]).notNull(),
      customDays: int2(),
      timing: mysqlEnum(["before", "on", "after"]).notNull(),
      isActive: tinyint().default(1).notNull(),
      emailEnabled: tinyint().default(1).notNull(),
      smsEnabled: tinyint().default(0).notNull(),
      emailTemplate: text2(),
      smsTemplate: text2(),
      createdBy: varchar2({ length: 64 }),
      createdAt: timestamp2({ mode: "string" }),
      updatedAt: timestamp2({ mode: "string" })
    });
    scheduledReminders = mysqlTable2("scheduledReminders", {
      id: varchar2({ length: 64 }).primaryKey(),
      reminderId: varchar2({ length: 64 }).notNull(),
      referenceType: varchar2({ length: 50 }).notNull(),
      referenceId: varchar2({ length: 64 }).notNull(),
      recipientId: varchar2({ length: 64 }).notNull(),
      recipientType: mysqlEnum(["user", "client"]).notNull(),
      scheduledFor: datetime({ mode: "string" }).notNull(),
      status: mysqlEnum(["pending", "sent", "failed", "cancelled"]).default("pending").notNull(),
      sentAt: datetime({ mode: "string" }),
      error: text2(),
      createdAt: timestamp2({ mode: "string" })
    });
    services = mysqlTable2("services", {
      id: varchar2({ length: 64 }).primaryKey(),
      organizationId: varchar2({ length: 64 }),
      name: varchar2({ length: 255 }).notNull(),
      description: text2(),
      category: varchar2({ length: 100 }),
      hourlyRate: int2(),
      fixedPrice: int2(),
      unit: varchar2({ length: 50 }).default("hour"),
      taxRate: int2().default(0),
      deliverables: text2(),
      isActive: tinyint().default(1).notNull(),
      createdBy: varchar2({ length: 64 }),
      createdAt: timestamp2({ mode: "string" }),
      updatedAt: timestamp2({ mode: "string" })
    });
    settings = mysqlTable2(
      "settings",
      {
        id: varchar2({ length: 64 }).primaryKey(),
        key: varchar2({ length: 100 }).notNull(),
        // previously we accidentally named this column "longtext" by passing
        // a string argument to `text()`; the first parameter is treated as the
        // column name.  Use the dedicated `longtext()` helper so the column
        // remains "value" while still having the desired MySQL type.
        value: longtext(),
        category: varchar2({ length: 100 }),
        description: text2(),
        updatedBy: varchar2({ length: 64 }),
        updatedAt: timestamp2({ mode: "string" })
      },
      (table) => [
        index2("key_idx").on(table.key),
        index2("category_idx").on(table.category)
      ]
    );
    stockAlerts = mysqlTable2("stockAlerts", {
      id: varchar2({ length: 64 }).primaryKey(),
      productId: varchar2({ length: 64 }).notNull(),
      alertType: mysqlEnum(["low_stock", "out_of_stock", "overstock", "reorder"]).notNull(),
      currentQuantity: int2().notNull(),
      threshold: int2().notNull(),
      status: mysqlEnum(["active", "resolved", "ignored"]).default("active").notNull(),
      notifiedAt: datetime({ mode: "string" }),
      resolvedAt: datetime({ mode: "string" }),
      createdAt: timestamp2({ mode: "string" })
    });
    systemSettings = mysqlTable2("systemSettings", {
      id: varchar2({ length: 64 }).primaryKey(),
      category: varchar2({ length: 100 }).notNull(),
      key: varchar2({ length: 100 }).notNull(),
      value: text2(),
      dataType: mysqlEnum(["string", "number", "boolean", "json"]).notNull(),
      description: text2(),
      isPublic: tinyint().default(0).notNull(),
      updatedBy: varchar2({ length: 64 }),
      updatedAt: timestamp2({ mode: "string" })
    });
    templates = mysqlTable2(
      "templates",
      {
        id: varchar2({ length: 64 }).primaryKey(),
        name: varchar2({ length: 255 }).notNull(),
        type: mysqlEnum(["invoice", "estimate", "receipt", "proposal", "report"]).notNull(),
        content: text2().notNull(),
        isDefault: tinyint().default(0).notNull(),
        isActive: tinyint().default(1).notNull(),
        createdBy: varchar2({ length: 64 }),
        createdAt: timestamp2({ mode: "string" }),
        updatedAt: timestamp2({ mode: "string" })
      },
      (table) => [
        index2("type_idx").on(table.type)
      ]
    );
    documentNumberFormats = mysqlTable2(
      "documentNumberFormats",
      {
        id: varchar2({ length: 64 }).primaryKey(),
        documentType: mysqlEnum(["invoice", "estimate", "receipt", "proposal", "expense", "payment", "contract", "quotation", "purchase_order", "project", "credit_note", "debit_note", "delivery_note", "lpo", "grn", "work_order", "service_invoice"]).notNull(),
        prefix: varchar2({ length: 50 }).default("").notNull(),
        padding: int2().default(6).notNull(),
        separator: varchar2({ length: 5 }).default("-").notNull(),
        currentNumber: int2().default(0).notNull(),
        createdAt: timestamp2({ mode: "string" }),
        updatedAt: timestamp2({ mode: "string" })
      },
      (table) => [
        uniqueIndex2("doc_type_unique_idx").on(table.documentType)
      ]
    );
    defaultSettings = mysqlTable2("defaultSettings", {
      id: varchar2({ length: 64 }).primaryKey(),
      category: varchar2({ length: 100 }).notNull(),
      key: varchar2({ length: 100 }).notNull(),
      value: text2().notNull(),
      description: text2(),
      createdAt: timestamp2({ mode: "string" })
    });
    permissions = mysqlTable2(
      "permissions",
      {
        id: varchar2({ length: 64 }).primaryKey(),
        name: varchar2({ length: 100 }),
        permissionName: varchar2({ length: 100 }),
        description: text2(),
        category: varchar2({ length: 100 }),
        resource: varchar2({ length: 100 }),
        action: varchar2({ length: 50 }),
        isAdvanced: tinyint().default(0).notNull(),
        createdAt: timestamp2({ mode: "string" })
      },
      (table) => [
        index2("idx_permissions_category").on(table.category),
        index2("idx_permissions_resource").on(table.resource)
      ]
    );
    customRoles = mysqlTable2(
      "customRoles",
      {
        id: varchar2({ length: 64 }).primaryKey(),
        organizationId: varchar2({ length: 64 }),
        name: varchar2({ length: 100 }).notNull(),
        displayName: varchar2({ length: 255 }).notNull(),
        description: text2(),
        permissions: text2(),
        // JSON array of permission feature strings
        baseRole: mysqlEnum(["user", "admin", "staff", "accountant", "client", "super_admin", "project_manager", "hr", "ict_manager", "procurement_manager", "sales_manager"]).default("staff"),
        isAdvanced: tinyint().default(0).notNull(),
        isSystem: tinyint().default(0).notNull(),
        isActive: tinyint().default(1).notNull(),
        createdBy: varchar2({ length: 64 }),
        createdAt: timestamp2({ mode: "string" }),
        updatedAt: timestamp2({ mode: "string" })
      },
      (table) => [
        index2("idx_customRoles_orgId").on(table.organizationId),
        index2("idx_customRoles_name").on(table.name),
        index2("idx_customRoles_active").on(table.isActive)
      ]
    );
    userRoles = mysqlTable2("userRoles", {
      id: varchar2({ length: 64 }).primaryKey(),
      userId: varchar2({ length: 64 }),
      role: varchar2({ length: 50 }),
      roleName: varchar2({ length: 100 }),
      description: text2(),
      isActive: tinyint().default(1),
      assignedBy: varchar2({ length: 64 }),
      createdAt: timestamp2({ mode: "string" })
    });
    rolePermissions = mysqlTable2("rolePermissions", {
      id: varchar2({ length: 64 }).primaryKey(),
      roleId: varchar2({ length: 64 }).notNull(),
      permissionId: varchar2({ length: 64 }).notNull(),
      createdAt: timestamp2({ mode: "string" })
    });
    receipts = mysqlTable2("receipts", {
      id: varchar2({ length: 64 }).primaryKey(),
      organizationId: varchar2({ length: 64 }),
      receiptNumber: varchar2({ length: 100 }).notNull(),
      clientId: varchar2({ length: 64 }).notNull(),
      paymentId: varchar2({ length: 64 }),
      amount: int2().notNull(),
      subtotal: int2().notNull().default(0),
      taxAmount: int2().notNull().default(0),
      discountAmount: int2().notNull().default(0),
      paymentMethod: mysqlEnum(["cash", "bank_transfer", "cheque", "mpesa", "card", "other"]).notNull(),
      receiptDate: datetime().notNull(),
      status: mysqlEnum(["draft", "issued", "void"]).notNull().default("issued"),
      notes: text2(),
      createdBy: varchar2({ length: 64 }),
      approvedBy: varchar2({ length: 64 }),
      approvedAt: datetime(),
      createdAt: timestamp2({ mode: "string" })
    }, (table) => [
      uniqueIndex2("receipt_number_unique_idx").on(table.receiptNumber)
    ]);
    creditNotes = mysqlTable2(
      "creditNotes",
      {
        id: varchar2({ length: 64 }).primaryKey(),
        organizationId: varchar2({ length: 64 }),
        creditNoteNumber: varchar2({ length: 100 }).notNull(),
        clientId: varchar2({ length: 64 }).notNull(),
        clientName: varchar2({ length: 255 }),
        invoiceId: varchar2({ length: 64 }),
        issueDate: datetime({ mode: "string" }).notNull(),
        reason: mysqlEnum(["goods-returned", "service-cancelled", "discount", "quality-issue", "error", "other"]).notNull().default("other"),
        subtotal: int2().notNull().default(0),
        taxAmount: int2().notNull().default(0),
        total: int2().notNull().default(0),
        status: mysqlEnum(["draft", "approved", "applied", "void"]).default("draft").notNull(),
        notes: text2(),
        createdBy: varchar2({ length: 64 }),
        approvedBy: varchar2({ length: 64 }),
        approvedAt: datetime({ mode: "string" }),
        createdAt: timestamp2({ mode: "string" }),
        updatedAt: timestamp2({ mode: "string" })
      },
      (table) => [
        index2("credit_note_number_idx").on(table.creditNoteNumber),
        index2("client_idx").on(table.clientId),
        index2("status_idx").on(table.status),
        index2("invoice_idx").on(table.invoiceId)
      ]
    );
    debitNotes = mysqlTable2(
      "debitNotes",
      {
        id: varchar2({ length: 64 }).primaryKey(),
        organizationId: varchar2({ length: 64 }),
        debitNoteNumber: varchar2({ length: 100 }).notNull(),
        supplierId: varchar2({ length: 64 }).notNull(),
        supplierName: varchar2({ length: 255 }),
        purchaseOrderId: varchar2({ length: 64 }),
        issueDate: datetime({ mode: "string" }).notNull(),
        reason: mysqlEnum(["quality-shortage", "price-adjustment", "damaged", "underdelivery", "penalty"]).notNull().default("quality-shortage"),
        subtotal: int2().notNull().default(0),
        taxAmount: int2().notNull().default(0),
        total: int2().notNull().default(0),
        status: mysqlEnum(["draft", "approved", "settled", "void"]).default("draft").notNull(),
        notes: text2(),
        createdBy: varchar2({ length: 64 }),
        approvedBy: varchar2({ length: 64 }),
        approvedAt: datetime({ mode: "string" }),
        createdAt: timestamp2({ mode: "string" }),
        updatedAt: timestamp2({ mode: "string" })
      },
      (table) => [
        index2("debit_note_number_idx").on(table.debitNoteNumber),
        index2("supplier_idx").on(table.supplierId),
        index2("debit_status_idx").on(table.status)
      ]
    );
    departments = mysqlTable2("departments", {
      id: varchar2({ length: 64 }).primaryKey(),
      organizationId: varchar2({ length: 64 }),
      name: varchar2({ length: 255 }).notNull(),
      description: text2(),
      headId: varchar2({ length: 64 }),
      budget: int2(),
      salaryRangeMin: int2(),
      salaryRangeMax: int2(),
      status: mysqlEnum(["active", "inactive"]).default("active"),
      defaultRole: varchar2({ length: 100 }),
      createdBy: varchar2({ length: 64 }),
      createdAt: timestamp2({ mode: "string" }),
      updatedAt: timestamp2({ mode: "string" })
    });
    budgets = mysqlTable2("budgets", {
      id: varchar2({ length: 64 }).primaryKey(),
      organizationId: varchar2({ length: 64 }),
      departmentId: varchar2({ length: 64 }).notNull(),
      amount: int2().notNull(),
      remaining: int2().notNull(),
      fiscalYear: int2().notNull(),
      budgetName: varchar2({ length: 255 }),
      budgetDescription: text2(),
      budgetStatus: mysqlEnum(["draft", "active", "inactive", "closed"]).default("draft"),
      startDate: datetime({ mode: "string" }),
      endDate: datetime({ mode: "string" }),
      approvedBy: varchar2({ length: 64 }),
      approvedAt: datetime({ mode: "string" }),
      createdBy: varchar2({ length: 64 }),
      totalBudgeted: int2().default(0),
      totalActual: int2().default(0),
      variance: int2().default(0),
      variancePercent: int2().default(0),
      // Stored as percentage * 100 (e.g., 15.5% = 1550)
      createdAt: timestamp2({ mode: "string" }),
      updatedAt: timestamp2({ mode: "string" })
    });
    attendance = mysqlTable2("attendance", {
      id: varchar2({ length: 64 }).primaryKey(),
      organizationId: varchar2({ length: 64 }),
      employeeId: varchar2({ length: 64 }).notNull(),
      date: datetime().notNull(),
      status: mysqlEnum(["present", "absent", "late", "leave"]).default("present"),
      checkInTime: datetime(),
      checkOutTime: datetime(),
      notes: text2(),
      createdAt: timestamp2({ mode: "string" })
    });
    userProjectAssignments = mysqlTable2("userProjectAssignments", {
      id: varchar2({ length: 64 }).primaryKey(),
      userId: varchar2({ length: 64 }).notNull(),
      projectId: varchar2({ length: 64 }).notNull(),
      role: varchar2({ length: 50 }),
      assignedDate: datetime().notNull(),
      createdAt: timestamp2({ mode: "string" })
    });
    projectComments = mysqlTable2("projectComments", {
      id: varchar2({ length: 64 }).primaryKey(),
      projectId: varchar2({ length: 64 }).notNull(),
      userId: varchar2({ length: 64 }).notNull(),
      comment: text2().notNull(),
      commentType: mysqlEnum(["remark", "update", "issue", "question", "approval"]).default("remark").notNull(),
      attachmentUrl: varchar2({ length: 500 }),
      isPublic: boolean2().default(true).notNull(),
      createdAt: timestamp2({ mode: "string" }),
      updatedAt: timestamp2({ mode: "string" })
    });
    staffTasks = mysqlTable2("staffTasks", {
      id: varchar2({ length: 64 }).primaryKey(),
      departmentId: varchar2({ length: 64 }).notNull(),
      title: varchar2({ length: 255 }).notNull(),
      description: text2(),
      assignedTo: varchar2({ length: 64 }),
      dueDate: datetime(),
      status: mysqlEnum(["pending", "in_progress", "completed"]).default("pending"),
      createdAt: timestamp2({ mode: "string" })
    });
    userPermissions = mysqlTable2("userPermissions", {
      id: varchar2({ length: 64 }).primaryKey(),
      userId: varchar2({ length: 64 }).notNull(),
      resource: varchar2({ length: 100 }).notNull(),
      action: varchar2({ length: 50 }).notNull(),
      granted: tinyint().default(1).notNull(),
      grantedBy: varchar2({ length: 64 }),
      createdAt: timestamp2({ mode: "string" })
    });
    users = mysqlTable2("users", {
      id: varchar2({ length: 64 }).primaryKey(),
      name: varchar2({ length: 255 }).notNull(),
      email: varchar2({ length: 320 }).notNull(),
      emailVerified: timestamp2({ mode: "string" }),
      loginMethod: varchar2({ length: 50 }).default("local").notNull(),
      passwordHash: varchar2({ length: 255 }),
      failedLoginAttempts: int2().default(0),
      lockedUntil: timestamp2({ mode: "string" }),
      lockoutCount: int2().default(0).notNull(),
      role: mysqlEnum(["user", "admin", "staff", "accountant", "client", "super_admin", "project_manager", "hr", "ict_manager", "procurement_manager", "sales_manager"]).default("user").notNull(),
      createdAt: timestamp2({ mode: "string" }).defaultNow(),
      lastSignedIn: timestamp2({ mode: "string" }),
      department: varchar2({ length: 100 }),
      isActive: tinyint().default(1).notNull(),
      clientId: varchar2({ length: 64 }),
      permissions: text2(),
      passwordResetToken: varchar2({ length: 255 }),
      passwordResetExpiresAt: timestamp2({ mode: "string" }),
      requiresPasswordChange: tinyint().default(1).notNull(),
      emailVerificationRequired: tinyint().default(0).notNull(),
      twoFactorEnabled: tinyint().default(0).notNull(),
      twoFactorSecret: varchar2({ length: 255 }),
      phone: varchar2({ length: 20 }),
      company: varchar2({ length: 255 }),
      position: varchar2({ length: 100 }),
      address: text2(),
      city: varchar2({ length: 100 }),
      country: varchar2({ length: 100 }),
      photoUrl: longtext(),
      organizationId: varchar2({ length: 64 }),
      customRoleId: varchar2({ length: 64 })
    });
    savedFilters = mysqlTable2(
      "savedFilters",
      {
        id: varchar2({ length: 64 }).primaryKey(),
        userId: varchar2({ length: 64 }).notNull(),
        moduleName: varchar2({ length: 100 }).notNull(),
        filterName: varchar2({ length: 255 }).notNull(),
        description: text2(),
        filterConfig: text2().notNull(),
        isDefault: tinyint().default(0).notNull(),
        createdAt: timestamp2({ mode: "string" }),
        updatedAt: timestamp2({ mode: "string" })
      },
      (table) => [
        index2("user_module_idx").on(table.userId, table.moduleName),
        index2("module_idx").on(table.moduleName)
      ]
    );
    notifications = mysqlTable2(
      "notifications",
      {
        id: varchar2({ length: 64 }).primaryKey(),
        userId: varchar2({ length: 64 }).notNull(),
        type: mysqlEnum(["info", "success", "warning", "error", "reminder", "payment", "project", "client", "financial", "system"]).notNull(),
        title: varchar2({ length: 255 }).notNull(),
        message: text2().notNull(),
        category: varchar2({ length: 50 }),
        entityType: varchar2({ length: 50 }),
        // e.g., 'invoice', 'project', 'budget'
        entityId: varchar2({ length: 64 }),
        priority: mysqlEnum(["low", "normal", "medium", "high", "critical"]).default("normal").notNull(),
        actionUrl: varchar2({ length: 500 }),
        // Link to view the relevant entity
        isRead: tinyint().default(0).notNull(),
        readAt: timestamp2({ mode: "string" }),
        deliveryStatus: mysqlEnum(["pending", "sent", "failed"]).default("pending").notNull(),
        deliveryDate: timestamp2({ mode: "string" }),
        status: mysqlEnum(["active", "archived"]).default("active").notNull(),
        createdAt: timestamp2({ mode: "string" }).defaultNow()
      },
      (table) => [
        index2("user_id_idx").on(table.userId),
        index2("type_idx").on(table.type),
        index2("is_read_idx").on(table.isRead),
        index2("created_at_idx").on(table.createdAt)
      ]
    );
    notificationSettings = mysqlTable2(
      "notificationSettings",
      {
        id: varchar2({ length: 64 }).primaryKey(),
        userId: varchar2({ length: 64 }).notNull(),
        channelType: mysqlEnum(["in_app", "email", "sms", "slack"]).notNull(),
        isEnabled: tinyint().default(1).notNull(),
        notificationType: mysqlEnum(["payment", "project", "client", "financial", "system"]).notNull(),
        frequency: mysqlEnum(["immediate", "daily_digest", "weekly_digest", "never"]).default("immediate").notNull(),
        createdAt: timestamp2({ mode: "string" }).defaultNow(),
        updatedAt: timestamp2({ mode: "string" }).defaultNow()
      },
      (table) => [
        index2("user_channel_idx").on(table.userId, table.channelType)
      ]
    );
    notificationPreferences = mysqlTable2("notificationPreferences", {
      id: varchar2({ length: 64 }).primaryKey(),
      userId: varchar2({ length: 64 }).notNull(),
      slackWebhookUrl: varchar2({ length: 500 }),
      phoneNumber: varchar2({ length: 20 }),
      quietHoursStart: varchar2({ length: 5 }),
      // HH:MM format
      quietHoursEnd: varchar2({ length: 5 }),
      timeZone: varchar2({ length: 50 }).default("UTC"),
      createdAt: timestamp2({ mode: "string" }),
      updatedAt: timestamp2({ mode: "string" })
    });
    smsQueue = mysqlTable2(
      "smsQueue",
      {
        id: varchar2({ length: 64 }).primaryKey(),
        phoneNumber: varchar2({ length: 20 }).notNull(),
        message: text2().notNull(),
        status: mysqlEnum(["pending", "queued", "sending", "delivered", "failed"]).default("pending").notNull(),
        retryCount: int2().default(0),
        attemptCount: int2().default(0).notNull(),
        maxAttempts: int2().default(3).notNull(),
        provider: varchar2({ length: 50 }),
        externalId: varchar2({ length: 128 }),
        providerReference: varchar2({ length: 128 }),
        deliveryStatus: mysqlEnum(["pending", "sent", "failed"]).default("pending").notNull(),
        deliveredAt: timestamp2({ mode: "string" }),
        error: text2(),
        failureReason: text2(),
        relatedEntityType: varchar2({ length: 50 }),
        relatedEntityId: varchar2({ length: 64 }),
        batchId: varchar2({ length: 64 }),
        templateId: varchar2({ length: 64 }),
        metadata: json2(),
        sentAt: timestamp2({ mode: "string" }),
        nextRetryAt: timestamp2({ mode: "string" }),
        organizationId: varchar2({ length: 64 }),
        createdBy: varchar2({ length: 64 }),
        createdAt: timestamp2({ mode: "string" }).defaultNow(),
        updatedAt: timestamp2({ mode: "string" }).defaultNow()
      },
      (table) => [
        index2("sms_status_idx").on(table.status),
        index2("sms_created_idx").on(table.createdAt),
        index2("sms_batch_idx").on(table.batchId),
        index2("sms_template_idx").on(table.templateId)
      ]
    );
    smsCustomerPreferences = mysqlTable2(
      "smsCustomerPreferences",
      {
        id: varchar2({ length: 64 }).primaryKey(),
        clientId: varchar2({ length: 64 }).notNull(),
        phoneNumber: varchar2({ length: 20 }).notNull(),
        optedIn: boolean2().default(true).notNull(),
        marketingOptedIn: boolean2().default(false).notNull(),
        transactionalOptedIn: boolean2().default(true).notNull(),
        reminderPreferences: json2(),
        updatedAt: timestamp2({ mode: "string" }).defaultNow()
      },
      (table) => [
        index2("sms_pref_phone_idx").on(table.phoneNumber),
        index2("sms_pref_client_idx").on(table.clientId)
      ]
    );
    smsTemplates = mysqlTable2(
      "smsTemplates",
      {
        id: varchar2({ length: 64 }).primaryKey(),
        organizationId: varchar2({ length: 64 }).notNull(),
        name: varchar2({ length: 255 }).notNull(),
        content: text2().notNull(),
        category: mysqlEnum([
          "invoice_notification",
          "payment_reminder",
          "delivery_notification",
          "appointment_reminder",
          "promotional",
          "transactional",
          "custom"
        ]).notNull(),
        variables: json2(),
        isActive: tinyint().default(1).notNull(),
        usageCount: int2().default(0).notNull(),
        createdAt: timestamp2({ mode: "string" }).defaultNow(),
        updatedAt: timestamp2({ mode: "string" }).defaultNow()
      },
      (table) => [
        index2("sms_template_org_idx").on(table.organizationId),
        index2("sms_template_category_idx").on(table.category)
      ]
    );
    smsAutomationRules = mysqlTable2(
      "smsAutomationRules",
      {
        id: varchar2({ length: 64 }).primaryKey(),
        organizationId: varchar2({ length: 64 }).notNull(),
        name: varchar2({ length: 255 }).notNull(),
        trigger: mysqlEnum([
          "invoice_created",
          "payment_failed",
          "payment_received",
          "subscription_expiring",
          "appointment_reminder",
          "custom_event"
        ]).notNull(),
        templateId: varchar2({ length: 64 }).notNull(),
        conditions: json2(),
        isActive: tinyint().default(1).notNull(),
        createdAt: timestamp2({ mode: "string" }).defaultNow(),
        updatedAt: timestamp2({ mode: "string" }).defaultNow()
      },
      (table) => [
        index2("sms_automation_org_idx").on(table.organizationId),
        index2("sms_automation_trigger_idx").on(table.trigger)
      ]
    );
    smsDeliveryEvents = mysqlTable2(
      "smsDeliveryEvents",
      {
        id: varchar2({ length: 64 }).primaryKey(),
        queueId: varchar2({ length: 64 }).notNull(),
        eventType: mysqlEnum(["sent", "delivered", "failed"]).notNull(),
        timestamp: timestamp2({ mode: "string" }).defaultNow(),
        metadata: json2()
      },
      (table) => [
        index2("sms_delivery_queue_idx").on(table.queueId),
        index2("sms_delivery_event_idx").on(table.eventType)
      ]
    );
    userFavorites = mysqlTable2(
      "userFavorites",
      {
        id: varchar2({ length: 64 }).primaryKey(),
        userId: varchar2({ length: 64 }).notNull(),
        entityType: varchar2({ length: 50 }).notNull(),
        entityId: varchar2({ length: 64 }).notNull(),
        entityName: varchar2({ length: 255 }),
        createdAt: timestamp2({ mode: "string" }).defaultNow()
      },
      (table) => [
        index2("fav_user_idx").on(table.userId),
        index2("fav_entity_idx").on(table.entityType, table.entityId)
      ]
    );
    aiDocuments = mysqlTable2(
      "aiDocuments",
      {
        id: varchar2({ length: 64 }).primaryKey(),
        userId: varchar2({ length: 64 }).notNull(),
        documentType: mysqlEnum(["contract", "invoice", "proposal", "brief", "report", "email"]).notNull(),
        originalContent: longtext().notNull(),
        summary: text2(),
        keyPoints: json2(),
        // Array of key points extracted
        actionItems: json2(),
        // Array of action items with owners
        financialSummary: json2(),
        // For financial documents
        generatedAt: timestamp2({ mode: "string" }).defaultNow(),
        status: mysqlEnum(["processed", "failed", "pending"]).default("pending").notNull(),
        createdAt: timestamp2({ mode: "string" }).defaultNow()
      },
      (table) => [
        index2("user_id_idx").on(table.userId),
        index2("document_type_idx").on(table.documentType)
      ]
    );
    emailGenerationHistory = mysqlTable2(
      "emailGenerationHistory",
      {
        id: varchar2({ length: 64 }).primaryKey(),
        userId: varchar2({ length: 64 }).notNull(),
        templateType: mysqlEnum(["invoice_followup", "proposal", "project_update", "general", "payment_reminder"]).notNull(),
        tone: mysqlEnum(["professional", "friendly", "formal", "casual"]).default("professional").notNull(),
        generatedContent: text2().notNull(),
        originalContext: text2(),
        // Context used for generation
        recipientId: varchar2({ length: 64 }),
        // Client/user receiving email
        wasSent: tinyint().default(0).notNull(),
        sentAt: timestamp2({ mode: "string" }),
        feedback: varchar2({ length: 20 }),
        // thumbs up/down
        createdAt: timestamp2({ mode: "string" }).defaultNow()
      },
      (table) => [
        index2("user_id_idx").on(table.userId),
        index2("template_type_idx").on(table.templateType)
      ]
    );
    financialAnalytics = mysqlTable2("financialAnalytics", {
      id: varchar2({ length: 64 }).primaryKey(),
      organizationId: varchar2({ length: 64 }).notNull(),
      month: datetime({ mode: "string" }).notNull(),
      totalRevenue: int2().default(0),
      totalExpenses: int2().default(0),
      netProfit: int2().default(0),
      expenseTrends: json2(),
      // Category-wise expense breakdown
      revenueTrends: json2(),
      // Revenue by client/project
      costReductionOpportunities: json2(),
      // AI-identified savings
      cashFlowForecast: json2(),
      // Next 3/6/12 month forecast
      analysisNotes: text2(),
      createdAt: timestamp2({ mode: "string" }).defaultNow(),
      updatedAt: timestamp2({ mode: "string" }).defaultNow()
    });
    aiChatSessions = mysqlTable2(
      "aiChatSessions",
      {
        id: varchar2({ length: 64 }).primaryKey(),
        userId: varchar2({ length: 64 }).notNull(),
        title: varchar2({ length: 255 }),
        messageCount: int2().default(0),
        lastMessageAt: timestamp2({ mode: "string" }),
        status: mysqlEnum(["active", "archived"]).default("active").notNull(),
        createdAt: timestamp2({ mode: "string" }).defaultNow(),
        updatedAt: timestamp2({ mode: "string" }).defaultNow()
      },
      (table) => [
        index2("user_id_idx").on(table.userId),
        index2("created_at_idx").on(table.createdAt)
      ]
    );
    aiChatMessages = mysqlTable2(
      "aiChatMessages",
      {
        id: varchar2({ length: 64 }).primaryKey(),
        sessionId: varchar2({ length: 64 }).notNull(),
        userId: varchar2({ length: 64 }).notNull(),
        role: mysqlEnum(["user", "assistant"]).notNull(),
        content: text2().notNull(),
        tokens: int2().default(0),
        // Token count for billing/tracking
        createdAt: timestamp2({ mode: "string" }).defaultNow()
      },
      (table) => [
        index2("session_id_idx").on(table.sessionId),
        index2("user_id_idx").on(table.userId)
      ]
    );
    lineItems = mysqlTable2(
      "lineItems",
      {
        id: varchar2({ length: 64 }).primaryKey(),
        documentId: varchar2({ length: 64 }).notNull(),
        documentType: mysqlEnum(["invoice", "estimate", "receipt", "expense", "credit_note", "debit_note", "lpo"]).notNull(),
        description: text2().notNull(),
        quantity: int2().notNull(),
        rate: int2().notNull(),
        amount: int2().notNull(),
        productId: varchar2({ length: 64 }),
        serviceId: varchar2({ length: 64 }),
        taxRate: int2().default(0),
        taxAmount: int2().default(0),
        lineNumber: int2().default(1),
        createdBy: varchar2({ length: 64 }),
        createdAt: timestamp2({ mode: "string" }),
        updatedAt: timestamp2({ mode: "string" })
      },
      (table) => [
        index2("document_idx").on(table.documentId, table.documentType)
      ]
    );
    workflows = mysqlTable2("workflows", {
      id: varchar2({ length: 64 }).primaryKey(),
      name: varchar2({ length: 255 }).notNull(),
      description: text2(),
      status: mysqlEnum(["active", "inactive", "draft"]).default("draft").notNull(),
      triggerType: mysqlEnum(["invoice_created", "invoice_paid", "invoice_overdue", "invoice_approved", "payment_received", "payment_approved", "receipt_created", "expense_approved", "opportunity_moved", "task_completed", "project_milestone_reached", "reminder_time"]).notNull(),
      triggerCondition: text2(),
      // JSON stringified condition
      actionTypes: text2().notNull(),
      // JSON array of action types
      isRecurring: tinyint().default(0),
      createdBy: varchar2({ length: 64 }).notNull(),
      createdAt: timestamp2({ mode: "string" }),
      updatedAt: timestamp2({ mode: "string" })
    }, (table) => [
      index2("status_idx").on(table.status),
      index2("trigger_type_idx").on(table.triggerType),
      index2("created_by_idx").on(table.createdBy)
    ]);
    workflowTriggers = mysqlTable2("workflowTriggers", {
      id: varchar2({ length: 64 }).primaryKey(),
      workflowId: varchar2({ length: 64 }).notNull(),
      triggerType: varchar2({ length: 100 }).notNull(),
      triggerField: varchar2({ length: 100 }),
      operator: mysqlEnum(["equals", "not_equals", "greater_than", "less_than", "contains", "starts_with", "ends_with"]).default("equals"),
      triggerValue: text2(),
      isActive: tinyint().default(1).notNull(),
      createdAt: timestamp2({ mode: "string" })
    }, (table) => [
      index2("workflow_idx").on(table.workflowId),
      index2("trigger_type_idx").on(table.triggerType)
    ]);
    workflowActions = mysqlTable2("workflowActions", {
      id: varchar2({ length: 64 }).primaryKey(),
      workflowId: varchar2({ length: 64 }).notNull(),
      actionType: mysqlEnum(["send_email", "create_task", "update_status", "send_notification", "create_follow_up", "add_invoice", "update_field", "create_reminder"]).notNull(),
      actionName: varchar2({ length: 255 }).notNull(),
      actionTarget: varchar2({ length: 100 }),
      actionData: text2().notNull(),
      // JSON stringified action parameters
      delayMinutes: int2().default(0),
      // Delay before executing action
      sequence: int2().default(1),
      // Order of execution
      isActive: tinyint().default(1).notNull(),
      createdAt: timestamp2({ mode: "string" }),
      updatedAt: timestamp2({ mode: "string" })
    }, (table) => [
      index2("workflow_idx").on(table.workflowId),
      index2("action_type_idx").on(table.actionType)
    ]);
    workflowExecutions = mysqlTable2("workflowExecutions", {
      id: varchar2({ length: 64 }).primaryKey(),
      workflowId: varchar2({ length: 64 }).notNull(),
      entityType: varchar2({ length: 100 }).notNull(),
      entityId: varchar2({ length: 64 }).notNull(),
      status: mysqlEnum(["pending", "running", "completed", "failed", "skipped"]).default("pending").notNull(),
      triggerData: text2(),
      // JSON stringified trigger event data
      executionLog: text2(),
      // JSON array of execution steps
      errorMessage: text2(),
      executedAt: timestamp2({ mode: "string" }),
      completedAt: timestamp2({ mode: "string" }),
      createdAt: timestamp2({ mode: "string" })
    }, (table) => [
      index2("workflow_idx").on(table.workflowId),
      index2("entity_idx").on(table.entityType, table.entityId),
      index2("status_idx").on(table.status),
      index2("executed_at_idx").on(table.executedAt)
    ]);
    permissionMetadata = mysqlTable2("permission_metadata", {
      id: varchar2({ length: 64 }).primaryKey(),
      permissionId: varchar2({ length: 100 }).notNull().unique(),
      label: varchar2({ length: 255 }).notNull(),
      description: text2(),
      category: varchar2({ length: 100 }).notNull(),
      icon: varchar2({ length: 100 }),
      isSystem: tinyint().default(1),
      createdAt: timestamp2({ mode: "string" }).defaultNow(),
      updatedAt: timestamp2({ mode: "string" }).defaultNow().onUpdateNow()
    });
    dashboardLayouts = mysqlTable2("dashboardLayouts", {
      id: varchar2({ length: 64 }).primaryKey(),
      userId: varchar2({ length: 64 }).notNull(),
      name: varchar2({ length: 255 }).notNull().default("My Dashboard"),
      description: text2(),
      gridColumns: int2().default(6),
      isDefault: tinyint().default(0),
      layoutData: json2(),
      createdAt: timestamp2({ mode: "string" }).defaultNow(),
      updatedAt: timestamp2({ mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      { uniqueIndex: "idx_user_default", on: [table.userId, table.isDefault] },
      { index: "idx_user_id", on: [table.userId] }
    ]);
    dashboardWidgets = mysqlTable2("dashboardWidgets", {
      id: varchar2({ length: 64 }).primaryKey(),
      layoutId: varchar2({ length: 64 }).notNull(),
      widgetType: varchar2({ length: 100 }).notNull(),
      widgetTitle: varchar2({ length: 255 }),
      widgetSize: varchar2({ length: 10 }).default("medium"),
      rowIndex: int2().default(0),
      colIndex: int2().default(0),
      refreshInterval: int2().default(300),
      config: json2(),
      createdAt: timestamp2({ mode: "string" }).defaultNow(),
      updatedAt: timestamp2({ mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      { index: "idx_layout_id", on: [table.layoutId] },
      { index: "idx_widget_type", on: [table.widgetType] }
    ]);
    dashboardWidgetData = mysqlTable2("dashboardWidgetData", {
      id: varchar2({ length: 64 }).primaryKey(),
      widgetId: varchar2({ length: 64 }).notNull(),
      dataKey: varchar2({ length: 255 }),
      dataValue: json2(),
      cachedAt: timestamp2({ mode: "string" }).defaultNow(),
      expiresAt: timestamp2({ mode: "string" })
    }, (table) => [
      { index: "idx_widget_id", on: [table.widgetId] },
      { index: "idx_expires_at", on: [table.expiresAt] }
    ]);
    permissionAuditLog = mysqlTable2("permissionAuditLog", {
      id: varchar2({ length: 64 }).primaryKey(),
      roleId: varchar2({ length: 64 }),
      userId: varchar2({ length: 64 }),
      permissionId: varchar2({ length: 100 }),
      permissionLabel: varchar2({ length: 255 }),
      action: varchar2({ length: 50 }).notNull(),
      changedBy: varchar2({ length: 64 }),
      oldValue: text2(),
      newValue: text2(),
      reason: text2(),
      createdAt: timestamp2({ mode: "string" }).defaultNow()
    }, (table) => [
      { index: "idx_role_id", on: [table.roleId] },
      { index: "idx_user_id", on: [table.userId] },
      { index: "idx_changed_by", on: [table.changedBy] },
      { index: "idx_action", on: [table.action] },
      { index: "idx_created_at", on: [table.createdAt] }
    ]);
    projectMetrics = mysqlTable2("projectMetrics", {
      id: varchar2({ length: 64 }).primaryKey(),
      projectId: varchar2({ length: 64 }).notNull(),
      revenue: int2().default(0),
      costs: int2().default(0),
      profit: int2().default(0),
      profitMargin: int2().default(0),
      hoursEstimated: int2().default(0),
      hoursActual: int2().default(0),
      teamMembersCount: int2().default(0),
      completionPercentage: int2().default(0),
      statusKey: varchar2({ length: 50 }).default("on-time"),
      riskLevel: mysqlEnum(["low", "medium", "high"]).default("low"),
      calculatedAt: timestamp2({ mode: "string" }).defaultNow()
    }, (table) => [
      index2("idx_project_id").on(table.projectId),
      index2("idx_risk_level").on(table.riskLevel)
    ]);
    clientHealthScores = mysqlTable2("clientHealthScores", {
      id: varchar2({ length: 64 }).primaryKey(),
      clientId: varchar2({ length: 64 }).notNull(),
      healthScore: int2().default(50),
      riskLevel: mysqlEnum(["green", "yellow", "red"]).default("yellow"),
      paymentTimeliness: int2().default(50),
      invoiceFrequency: int2().default(50),
      totalRevenue: int2().default(0),
      overdueAmount: int2().default(0),
      projectSuccessRate: int2().default(50),
      churnRisk: int2().default(0),
      lifetimeValue: int2().default(0),
      lastActivityDate: timestamp2({ mode: "string" }),
      calculatedAt: timestamp2({ mode: "string" }).defaultNow()
    }, (table) => [
      index2("idx_client_id").on(table.clientId),
      index2("idx_health_score").on(table.healthScore),
      index2("idx_risk_level").on(table.riskLevel)
    ]);
    performanceReviews = mysqlTable2("performanceReviews", {
      id: varchar2({ length: 64 }).primaryKey(),
      employeeId: varchar2({ length: 64 }).notNull(),
      reviewerId: varchar2({ length: 64 }).notNull(),
      reviewDate: timestamp2({ mode: "string" }).defaultNow(),
      period: varchar2({ length: 50 }).notNull(),
      overallRating: int2().default(0),
      performanceScore: int2().default(0),
      productivity: int2().default(0),
      collaboration: int2().default(0),
      communication: int2().default(0),
      technicalSkills: int2().default(0),
      leadership: int2().default(0),
      comments: text2(),
      goals: text2(),
      developmentPlan: text2(),
      status: mysqlEnum(["draft", "completed", "archived"]).default("draft"),
      createdAt: timestamp2({ mode: "string" }).defaultNow(),
      updatedAt: timestamp2({ mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_employee_id").on(table.employeeId),
      index2("idx_reviewer_id").on(table.reviewerId),
      index2("idx_period").on(table.period),
      index2("idx_review_date").on(table.reviewDate)
    ]);
    performanceContracts = mysqlTable2("performanceContracts", {
      id: varchar2({ length: 64 }).primaryKey(),
      employeeId: varchar2({ length: 64 }).notNull(),
      departmentId: varchar2({ length: 64 }),
      jobGroupId: varchar2({ length: 64 }),
      contractNumber: varchar2({ length: 100 }).notNull(),
      title: varchar2({ length: 255 }).notNull(),
      startDate: datetime({ mode: "string" }).notNull(),
      endDate: datetime({ mode: "string" }),
      status: mysqlEnum(["draft", "active", "expired", "terminated"]).default("draft").notNull(),
      salary: int2(),
      terms: text2(),
      objectives: text2(),
      signedAt: datetime({ mode: "string" }),
      createdBy: varchar2({ length: 64 }),
      createdAt: timestamp2({ mode: "string" }).defaultNow(),
      updatedAt: timestamp2({ mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("performance_contract_employee_idx").on(table.employeeId),
      index2("performance_contract_department_idx").on(table.departmentId),
      index2("performance_contract_job_group_idx").on(table.jobGroupId),
      index2("performance_contract_status_idx").on(table.status)
    ]);
    skillsMatrix = mysqlTable2("skillsMatrix", {
      id: varchar2({ length: 64 }).primaryKey(),
      employeeId: varchar2({ length: 64 }).notNull(),
      skillName: varchar2({ length: 255 }).notNull(),
      proficiencyLevel: mysqlEnum(["beginner", "intermediate", "advanced", "expert"]).default("beginner"),
      yearsOfExperience: int2().default(0),
      lastAssessmentDate: timestamp2({ mode: "string" }),
      certifications: text2(),
      createdAt: timestamp2({ mode: "string" }).defaultNow()
    }, (table) => [
      index2("idx_employee_id").on(table.employeeId),
      index2("idx_skill_name").on(table.skillName)
    ]);
    schedules = mysqlTable2("schedules", {
      id: varchar2({ length: 64 }).primaryKey(),
      employeeId: varchar2({ length: 64 }).notNull(),
      taskTitle: varchar2({ length: 255 }).notNull(),
      description: text2(),
      startDate: timestamp2({ mode: "string" }).notNull(),
      endDate: timestamp2({ mode: "string" }).notNull(),
      duration: int2().default(0),
      priority: mysqlEnum(["low", "medium", "high", "urgent"]).default("medium"),
      status: mysqlEnum(["scheduled", "in_progress", "completed", "cancelled"]).default("scheduled"),
      assignedTo: varchar2({ length: 64 }),
      projectId: varchar2({ length: 64 }),
      recurrencePattern: varchar2({ length: 100 }),
      createdBy: varchar2({ length: 64 }),
      createdAt: timestamp2({ mode: "string" }).defaultNow(),
      updatedAt: timestamp2({ mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_employee_id").on(table.employeeId),
      index2("idx_start_date").on(table.startDate),
      index2("idx_status").on(table.status)
    ]);
    vacationRequests = mysqlTable2("vacationRequests", {
      id: varchar2({ length: 64 }).primaryKey(),
      employeeId: varchar2({ length: 64 }).notNull(),
      startDate: timestamp2({ mode: "string" }).notNull(),
      endDate: timestamp2({ mode: "string" }).notNull(),
      daysRequested: int2().default(0),
      vacationType: mysqlEnum(["vacation", "sick_leave", "personal", "sabbatical"]).default("vacation"),
      reason: text2(),
      status: mysqlEnum(["pending", "approved", "rejected", "cancelled"]).default("pending"),
      approvedBy: varchar2({ length: 64 }),
      approvalDate: timestamp2({ mode: "string" }),
      notes: text2(),
      createdAt: timestamp2({ mode: "string" }).defaultNow()
    }, (table) => [
      index2("idx_employee_id").on(table.employeeId),
      index2("idx_start_date").on(table.startDate),
      index2("idx_status").on(table.status)
    ]);
    documents = mysqlTable2("documents", {
      id: varchar2({ length: 64 }).primaryKey(),
      organizationId: varchar2({ length: 64 }),
      folderId: varchar2({ length: 64 }),
      documentName: varchar2({ length: 255 }).notNull(),
      documentType: mysqlEnum(["contract", "agreement", "proposal", "template", "invoice", "receipt", "other"]).default("other"),
      fileUrl: varchar2({ length: 500 }).notNull(),
      fileSize: int2().default(0),
      mimeType: varchar2({ length: 100 }),
      linkedEntityType: varchar2({ length: 100 }),
      linkedEntityId: varchar2({ length: 64 }),
      linkedClientId: varchar2({ length: 64 }),
      linkedProjectId: varchar2({ length: 64 }),
      linkedInvoiceId: varchar2({ length: 64 }),
      uploadedBy: varchar2({ length: 64 }).notNull(),
      currentVersion: int2().default(1),
      status: mysqlEnum(["active", "archived", "deleted"]).default("active"),
      expiryDate: timestamp2({ mode: "string" }),
      requiresSignature: tinyint().default(0),
      isSigned: tinyint().default(0),
      signedDate: timestamp2({ mode: "string" }),
      signedBy: varchar2({ length: 64 }),
      tags: text2(),
      createdAt: timestamp2({ mode: "string" }).defaultNow(),
      updatedAt: timestamp2({ mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_document_type").on(table.documentType),
      index2("idx_entity").on(table.linkedEntityType, table.linkedEntityId),
      index2("idx_client_id").on(table.linkedClientId),
      index2("idx_project_id").on(table.linkedProjectId),
      index2("idx_uploaded_by").on(table.uploadedBy)
    ]);
    fileFolders = mysqlTable2("fileFolders", {
      id: varchar2({ length: 64 }).primaryKey(),
      organizationId: varchar2({ length: 64 }),
      parentId: varchar2({ length: 64 }),
      name: varchar2({ length: 255 }).notNull(),
      createdBy: varchar2({ length: 64 }).notNull(),
      createdAt: timestamp2({ mode: "string" }).defaultNow(),
      updatedAt: timestamp2({ mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_file_folder_org").on(table.organizationId),
      index2("idx_file_folder_parent").on(table.parentId)
    ]);
    documentVersions = mysqlTable2("documentVersions", {
      id: varchar2({ length: 64 }).primaryKey(),
      documentId: varchar2({ length: 64 }).notNull(),
      versionNumber: int2().default(1),
      fileUrl: varchar2({ length: 500 }).notNull(),
      fileSize: int2().default(0),
      uploadedBy: varchar2({ length: 64 }).notNull(),
      changeNotes: text2(),
      createdAt: timestamp2({ mode: "string" }).defaultNow()
    }, (table) => [
      index2("idx_document_id").on(table.documentId),
      index2("idx_version").on(table.versionNumber)
    ]);
    documentAccess = mysqlTable2("documentAccess", {
      id: varchar2({ length: 64 }).primaryKey(),
      documentId: varchar2({ length: 64 }).notNull(),
      userId: varchar2({ length: 64 }),
      roleId: varchar2({ length: 64 }),
      accessLevel: mysqlEnum(["view", "download", "edit", "share"]).default("view"),
      grantedBy: varchar2({ length: 64 }),
      grantedAt: timestamp2({ mode: "string" }).defaultNow(),
      expiresAt: timestamp2({ mode: "string" })
    }, (table) => [
      index2("idx_document_id").on(table.documentId),
      index2("idx_user_id").on(table.userId)
    ]);
    notificationRules = mysqlTable2("notificationRules", {
      id: varchar2({ length: 64 }).primaryKey(),
      userId: varchar2({ length: 64 }).notNull(),
      eventType: varchar2({ length: 100 }).notNull(),
      channelType: mysqlEnum(["email", "in_app", "push", "sms"]).default("in_app"),
      doNotDisturbStart: varchar2({ length: 5 }),
      doNotDisturbEnd: varchar2({ length: 5 }),
      frequency: mysqlEnum(["instant", "daily", "weekly", "never"]).default("instant"),
      enabled: tinyint().default(1),
      createdAt: timestamp2({ mode: "string" }).defaultNow(),
      updatedAt: timestamp2({ mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_user_id").on(table.userId),
      index2("idx_event_type").on(table.eventType)
    ]);
    usageMetrics = mysqlTable2("usageMetrics", {
      id: varchar2({ length: 64 }).primaryKey(),
      subscriptionId: varchar2({ length: 64 }).notNull(),
      metricName: varchar2({ length: 255 }).notNull(),
      metricValue: int2().default(0),
      billingAmount: int2().default(0),
      usagePeriod: varchar2({ length: 50 }).notNull(),
      recordedAt: timestamp2({ mode: "string" }).defaultNow()
    }, (table) => [
      index2("idx_subscription_id").on(table.subscriptionId),
      index2("idx_usage_period").on(table.usagePeriod)
    ]);
    expenseCategories = mysqlTable2("expenseCategories", {
      id: varchar2({ length: 64 }).primaryKey(),
      categoryName: varchar2({ length: 255 }).notNull(),
      description: text2(),
      taxDeductible: tinyint().default(1),
      accountCode: varchar2({ length: 50 }),
      isActive: tinyint().default(1),
      createdAt: timestamp2({ mode: "string" }).defaultNow()
    }, (table) => [
      index2("idx_category_name").on(table.categoryName),
      index2("idx_tax_deductible").on(table.taxDeductible)
    ]);
    expenseReports = mysqlTable2("expenseReports", {
      id: varchar2({ length: 64 }).primaryKey(),
      submittedBy: varchar2({ length: 64 }).notNull(),
      reportDate: timestamp2({ mode: "string" }).notNull(),
      totalAmount: int2().default(0),
      currency: varchar2({ length: 10 }).default("KES"),
      status: mysqlEnum(["draft", "submitted", "approved", "rejected", "reimbursed"]).default("draft"),
      approvedBy: varchar2({ length: 64 }),
      approvalDate: timestamp2({ mode: "string" }),
      reimbursementDate: timestamp2({ mode: "string" }),
      notes: text2(),
      createdAt: timestamp2({ mode: "string" }).defaultNow(),
      updatedAt: timestamp2({ mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_submitted_by").on(table.submittedBy),
      index2("idx_status").on(table.status),
      index2("idx_report_date").on(table.reportDate)
    ]);
    reimbursements = mysqlTable2("reimbursements", {
      id: varchar2({ length: 64 }).primaryKey(),
      expenseReportId: varchar2({ length: 64 }).notNull(),
      employeeId: varchar2({ length: 64 }).notNull(),
      totalAmount: int2().default(0),
      currency: varchar2({ length: 10 }).default("KES"),
      paymentMethod: varchar2({ length: 50 }).notNull(),
      paymentDate: timestamp2({ mode: "string" }),
      referenceNumber: varchar2({ length: 100 }),
      status: mysqlEnum(["pending", "approved", "processed", "failed"]).default("pending"),
      notes: text2(),
      createdAt: timestamp2({ mode: "string" }).defaultNow()
    }, (table) => [
      index2("idx_report_id").on(table.expenseReportId),
      index2("idx_employee_id").on(table.employeeId),
      index2("idx_status").on(table.status)
    ]);
    currencies = mysqlTable2("currencies", {
      id: varchar2({ length: 64 }).primaryKey(),
      code: varchar2({ length: 3 }).notNull().unique(),
      name: varchar2({ length: 100 }).notNull(),
      symbol: varchar2({ length: 10 }),
      decimalPlaces: int2().default(2),
      isActive: tinyint().default(1),
      createdAt: timestamp2({ mode: "string" }).defaultNow()
    }, (table) => [
      index2("idx_code").on(table.code),
      index2("idx_active").on(table.isActive)
    ]);
    exchangeRates = mysqlTable2("exchangeRates", {
      id: varchar2({ length: 64 }).primaryKey(),
      fromCurrency: varchar2({ length: 3 }).notNull(),
      toCurrency: varchar2({ length: 3 }).notNull(),
      rate: int2().default(0),
      rateDate: timestamp2({ mode: "string" }).notNull(),
      source: varchar2({ length: 100 }),
      createdAt: timestamp2({ mode: "string" }).defaultNow()
    }, (table) => [
      index2("idx_currency_pair").on(table.fromCurrency, table.toCurrency),
      index2("idx_rate_date").on(table.rateDate)
    ]);
    taxRates = mysqlTable2("taxRates", {
      id: varchar2({ length: 64 }).primaryKey(),
      country: varchar2({ length: 100 }).notNull(),
      taxType: mysqlEnum(["vat", "gst", "sales_tax", "income_tax"]).default("vat"),
      rate: int2().default(0),
      effectiveDate: timestamp2({ mode: "string" }).notNull(),
      expiryDate: timestamp2({ mode: "string" }),
      description: text2(),
      isActive: tinyint().default(1),
      createdAt: timestamp2({ mode: "string" }).defaultNow()
    }, (table) => [
      index2("idx_country").on(table.country),
      index2("idx_tax_type").on(table.taxType),
      index2("idx_effective_date").on(table.effectiveDate)
    ]);
    forecastModels = mysqlTable2("forecastModels", {
      id: varchar2({ length: 64 }).primaryKey(),
      modelName: varchar2({ length: 255 }).notNull(),
      modelType: mysqlEnum(["revenue", "expense", "headcount", "client_churn"]).default("revenue"),
      algorithm: varchar2({ length: 100 }),
      accuracy: int2().default(0),
      trainingDataPoints: int2().default(0),
      lastTrainedAt: timestamp2({ mode: "string" }),
      createdAt: timestamp2({ mode: "string" }).defaultNow(),
      updatedAt: timestamp2({ mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_model_type").on(table.modelType),
      index2("idx_last_trained").on(table.lastTrainedAt)
    ]);
    forecastResults = mysqlTable2("forecastResults", {
      id: varchar2({ length: 64 }).primaryKey(),
      modelId: varchar2({ length: 64 }).notNull(),
      forecastPeriod: varchar2({ length: 50 }).notNull(),
      forecastDate: timestamp2({ mode: "string" }).notNull(),
      predictedValue: int2().default(0),
      confidenceInterval: int2().default(0),
      confidenceLower: int2().default(0),
      confidenceUpper: int2().default(0),
      actualValue: int2(),
      variance: int2(),
      createdAt: timestamp2({ mode: "string" }).defaultNow()
    }, (table) => [
      index2("idx_model_id").on(table.modelId),
      index2("idx_forecast_period").on(table.forecastPeriod),
      index2("idx_forecast_date").on(table.forecastDate)
    ]);
    apiKeys = mysqlTable2("apiKeys", {
      id: varchar2({ length: 64 }).primaryKey(),
      userId: varchar2({ length: 64 }).notNull(),
      keyName: varchar2({ length: 255 }).notNull(),
      keyValue: varchar2({ length: 255 }).notNull(),
      lastUsedAt: timestamp2({ mode: "string" }),
      expiresAt: timestamp2({ mode: "string" }),
      isActive: tinyint().default(1),
      rateLimit: int2().default(1e3),
      createdAt: timestamp2({ mode: "string" }).defaultNow()
    }, (table) => [
      index2("idx_user_id").on(table.userId),
      index2("idx_key_value").on(table.keyValue),
      index2("idx_active").on(table.isActive)
    ]);
    webhooks = mysqlTable2("webhooks", {
      id: varchar2({ length: 64 }).primaryKey(),
      userId: varchar2({ length: 64 }).notNull(),
      webhookUrl: varchar2({ length: 500 }).notNull(),
      eventType: varchar2({ length: 100 }).notNull(),
      secret: varchar2({ length: 255 }),
      isActive: tinyint().default(1),
      retryCount: int2().default(0),
      lastTriggeredAt: timestamp2({ mode: "string" }),
      createdAt: timestamp2({ mode: "string" }).defaultNow()
    }, (table) => [
      index2("idx_user_id").on(table.userId),
      index2("idx_event_type").on(table.eventType),
      index2("idx_active").on(table.isActive)
    ]);
    integrationLogs = mysqlTable2("integrationLogs", {
      id: varchar2({ length: 64 }).primaryKey(),
      webhookId: varchar2({ length: 64 }),
      eventType: varchar2({ length: 100 }).notNull(),
      payload: text2(),
      responseStatus: int2(),
      errorMessage: text2(),
      attemptNumber: int2().default(1),
      success: tinyint().default(0),
      createdAt: timestamp2({ mode: "string" }).defaultNow()
    }, (table) => [
      index2("idx_webhook_id").on(table.webhookId),
      index2("idx_event_type").on(table.eventType),
      index2("idx_success").on(table.success)
    ]);
    emailQueue = mysqlTable2("emailQueue", {
      id: varchar2({ length: 64 }).primaryKey(),
      organizationId: varchar2({ length: 64 }),
      recipientEmail: varchar2({ length: 320 }).notNull(),
      recipientName: varchar2({ length: 255 }),
      subject: varchar2({ length: 500 }).notNull(),
      htmlContent: text2().notNull(),
      textContent: text2(),
      eventType: varchar2({ length: 100 }).notNull(),
      entityType: varchar2({ length: 100 }),
      entityId: varchar2({ length: 64 }),
      userId: varchar2({ length: 64 }),
      status: mysqlEnum(["pending", "sent", "failed", "retrying"]).default("pending").notNull(),
      attempts: int2().default(0).notNull(),
      maxAttempts: int2().default(3).notNull(),
      lastAttemptAt: timestamp2({ mode: "string" }),
      nextRetryAt: timestamp2({ mode: "string" }),
      errorMessage: text2(),
      metadata: text2(),
      sentAt: timestamp2({ mode: "string" }),
      createdAt: timestamp2({ mode: "string" }).defaultNow(),
      updatedAt: timestamp2({ mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_status").on(table.status),
      index2("idx_recipient").on(table.recipientEmail),
      index2("idx_next_retry").on(table.nextRetryAt),
      index2("idx_event_type").on(table.eventType),
      index2("idx_created_at").on(table.createdAt)
    ]);
    emailLog = mysqlTable2("emailLog", {
      id: varchar2({ length: 64 }).primaryKey(),
      queueId: varchar2({ length: 64 }),
      recipientEmail: varchar2({ length: 320 }).notNull(),
      subject: varchar2({ length: 500 }).notNull(),
      eventType: varchar2({ length: 100 }).notNull(),
      status: mysqlEnum(["sent", "failed"]).notNull(),
      messageId: varchar2({ length: 255 }),
      errorMessage: text2(),
      sentAt: timestamp2({ mode: "string" }).defaultNow()
    }, (table) => [
      index2("idx_status").on(table.status),
      index2("idx_recipient").on(table.recipientEmail),
      index2("idx_sent_at").on(table.sentAt),
      index2("idx_event_type").on(table.eventType)
    ]);
    invoiceReminders = mysqlTable2("invoiceReminders", {
      id: varchar2({ length: 64 }).primaryKey(),
      invoiceId: varchar2({ length: 64 }).notNull(),
      reminderType: mysqlEnum(["overdue_1day", "overdue_3days", "overdue_7days", "overdue_14days", "overdue_30days"]).notNull(),
      clientEmail: varchar2({ length: 320 }).notNull(),
      sentAt: timestamp2({ mode: "string" }).defaultNow(),
      sentBy: varchar2({ length: 64 }),
      createdAt: timestamp2({ mode: "string" }).defaultNow()
    }, (table) => [
      index2("idx_invoice_id").on(table.invoiceId),
      index2("idx_reminder_type").on(table.reminderType),
      index2("idx_sent_at").on(table.sentAt)
    ]);
    pricingPlans = mysqlTable2("pricingPlans", {
      id: varchar2({ length: 64 }).primaryKey(),
      planName: varchar2({ length: 255 }).notNull(),
      planSlug: varchar2({ length: 100 }).notNull().unique(),
      description: longtext(),
      tier: mysqlEnum(["free", "starter", "professional", "enterprise", "custom"]).notNull(),
      monthlyPrice: decimal({ precision: 10, scale: 2 }).default("0"),
      annualPrice: decimal({ precision: 10, scale: 2 }).default("0"),
      monthlyAnnualDiscount: decimal({ precision: 5, scale: 2 }).default("0"),
      maxUsers: int2().default(-1),
      maxProjects: int2().default(-1),
      maxStorageGB: int2().default(-1),
      features: json2(),
      supportLevel: mysqlEnum(["email", "priority", "24/7_phone", "dedicated_manager"]).default("email"),
      isActive: tinyint().default(1).notNull(),
      displayOrder: int2().default(0),
      createdAt: timestamp2({ mode: "string" }).defaultNow(),
      updatedAt: timestamp2({ mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_tier").on(table.tier),
      index2("idx_slug").on(table.planSlug),
      index2("idx_active").on(table.isActive)
    ]);
    subscriptions = mysqlTable2("subscriptions", {
      id: varchar2({ length: 64 }).primaryKey(),
      clientId: varchar2({ length: 64 }),
      organizationId: varchar2({ length: 64 }),
      planId: varchar2({ length: 64 }).notNull(),
      status: mysqlEnum(["trial", "active", "suspended", "cancelled", "expired"]).default("trial").notNull(),
      billingCycle: mysqlEnum(["monthly", "annual"]).default("monthly").notNull(),
      startDate: timestamp2({ mode: "string" }).notNull(),
      renewalDate: timestamp2({ mode: "string" }).notNull(),
      expiryDate: timestamp2({ mode: "string" }),
      gracePeriodEnd: timestamp2({ mode: "string" }),
      isLocked: tinyint().default(0),
      autoRenew: tinyint().default(1),
      currentPrice: decimal({ precision: 10, scale: 2 }).default("0"),
      usersCount: int2().default(0),
      projectsCount: int2().default(0),
      storageUsedGB: int2().default(0),
      createdAt: timestamp2({ mode: "string" }).defaultNow(),
      updatedAt: timestamp2({ mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_client_id").on(table.clientId),
      index2("idx_org_id").on(table.organizationId),
      index2("idx_status").on(table.status),
      index2("idx_renewal_date").on(table.renewalDate),
      index2("idx_expiry_date").on(table.expiryDate)
    ]);
    organizationSubscriptions = subscriptions;
    billingInvoices = mysqlTable2("billingInvoices", {
      id: varchar2({ length: 64 }).primaryKey(),
      subscriptionId: varchar2({ length: 64 }).notNull(),
      invoiceNumber: varchar2({ length: 50 }).notNull().unique(),
      amount: decimal({ precision: 10, scale: 2 }).notNull(),
      tax: decimal({ precision: 10, scale: 2 }).default("0"),
      totalAmount: decimal({ precision: 10, scale: 2 }).notNull(),
      currency: varchar2({ length: 3 }).default("USD"),
      status: mysqlEnum(["pending", "sent", "viewed", "paid", "failed", "cancelled", "refunded"]).default("pending").notNull(),
      billingPeriodStart: timestamp2({ mode: "string" }).notNull(),
      billingPeriodEnd: timestamp2({ mode: "string" }).notNull(),
      dueDate: timestamp2({ mode: "string" }).notNull(),
      sentAt: timestamp2({ mode: "string" }),
      paidAt: timestamp2({ mode: "string" }),
      paymentMethod: varchar2({ length: 50 }),
      paymentReference: varchar2({ length: 255 }),
      notes: text2(),
      createdAt: timestamp2({ mode: "string" }).defaultNow(),
      updatedAt: timestamp2({ mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_subscription_id").on(table.subscriptionId),
      index2("idx_status").on(table.status),
      index2("idx_due_date").on(table.dueDate),
      index2("idx_paid_at").on(table.paidAt)
    ]);
    payments = mysqlTable2("payments", {
      id: varchar2({ length: 64 }).primaryKey(),
      organizationId: varchar2({ length: 64 }),
      invoiceId: varchar2({ length: 64 }).notNull(),
      clientId: varchar2({ length: 64 }).notNull(),
      accountId: varchar2({ length: 64 }),
      amount: int2().notNull(),
      paymentDate: timestamp2({ mode: "string" }).notNull(),
      paymentMethod: mysqlEnum(["cash", "bank_transfer", "cheque", "mpesa", "card", "other"]).notNull(),
      referenceNumber: varchar2({ length: 100 }),
      chartOfAccountType: mysqlEnum(["debit", "credit"]).default("debit"),
      chartOfAccountId: int2(),
      // Link to Chart of Accounts
      notes: text2(),
      status: mysqlEnum(["pending", "completed", "failed", "cancelled"]).default("pending").notNull(),
      approvedBy: varchar2({ length: 64 }),
      approvedAt: timestamp2({ mode: "string" }),
      createdBy: varchar2({ length: 64 }),
      createdAt: timestamp2({ mode: "string" }).defaultNow()
    }, (table) => [
      index2("idx_invoice_id").on(table.invoiceId),
      index2("idx_client_id").on(table.clientId),
      index2("idx_status").on(table.status),
      index2("idx_payment_date").on(table.paymentDate),
      index2("idx_payment_chart_of_account").on(table.chartOfAccountId)
    ]);
    paymentMethods = mysqlTable2("paymentMethods", {
      id: varchar2({ length: 64 }).primaryKey(),
      clientId: varchar2({ length: 64 }).notNull(),
      type: mysqlEnum(["credit_card", "debit_card", "bank_account", "paypal", "mpesa"]).notNull(),
      provider: varchar2({ length: 50 }),
      lastFourDigits: varchar2({ length: 4 }),
      expiryMonth: int2(),
      expiryYear: int2(),
      holderName: varchar2({ length: 255 }),
      bankName: varchar2({ length: 255 }),
      accountNumber: varchar2({ length: 50 }),
      isDefault: tinyint().default(0),
      isActive: tinyint().default(1),
      providerMethodId: varchar2({ length: 255 }),
      createdAt: timestamp2({ mode: "string" }).defaultNow(),
      updatedAt: timestamp2({ mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_client_id").on(table.clientId),
      index2("idx_is_default").on(table.isDefault),
      index2("idx_type").on(table.type)
    ]);
    billingUsageMetrics = mysqlTable2("billingUsageMetrics", {
      id: varchar2({ length: 64 }).primaryKey(),
      subscriptionId: varchar2({ length: 64 }).notNull(),
      metricDate: datetime({ mode: "string" }).notNull(),
      usersCount: int2().default(0),
      projectsCount: int2().default(0),
      tasksCount: int2().default(0),
      documentsCount: int2().default(0),
      storageUsedMB: int2().default(0),
      apiCallsCount: int2().default(0),
      emailsSent: int2().default(0),
      recordedAt: timestamp2({ mode: "string" }).defaultNow()
    }, (table) => [
      index2("idx_subscription_id").on(table.subscriptionId),
      index2("idx_metric_date").on(table.metricDate)
    ]);
    billingNotifications = mysqlTable2("billingNotifications", {
      id: varchar2({ length: 64 }).primaryKey(),
      subscriptionId: varchar2({ length: 64 }).notNull(),
      notificationType: mysqlEnum([
        "payment_due_7days",
        "payment_due_today",
        "payment_overdue_1day",
        "payment_overdue_3days",
        "subscription_expiring_7days",
        "subscription_expiring_today",
        "subscription_expired",
        "system_locked",
        "payment_failed",
        "usage_limit_warning",
        "renewal_successful"
      ]).notNull(),
      message: text2(),
      sentTo: varchar2({ length: 320 }),
      channel: mysqlEnum(["email", "in_app", "sms"]).default("email"),
      isSent: tinyint().default(0),
      sentAt: timestamp2({ mode: "string" }),
      isRead: tinyint().default(0),
      readAt: timestamp2({ mode: "string" }),
      createdAt: timestamp2({ mode: "string" }).defaultNow()
    }, (table) => [
      index2("idx_subscription_id").on(table.subscriptionId),
      index2("idx_notification_type").on(table.notificationType),
      index2("idx_is_sent").on(table.isSent)
    ]);
    dunningPolicies = mysqlTable2("dunningPolicies", {
      id: varchar2({ length: 64 }).primaryKey(),
      organizationId: varchar2({ length: 64 }).notNull(),
      name: varchar2({ length: 255 }).notNull(),
      description: text2(),
      maxRetries: int2().default(3).notNull(),
      retryIntervalDays: int2().default(3).notNull(),
      finalRetryDays: int2().default(14).notNull(),
      suspendAfterDays: int2().default(21).notNull(),
      cancelAfterDays: int2().default(30).notNull(),
      notificationTemplate: varchar2({ length: 64 }),
      isActive: tinyint().default(1).notNull(),
      createdAt: timestamp2({ mode: "string" }).defaultNow(),
      updatedAt: timestamp2({ mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_organization_id").on(table.organizationId),
      index2("idx_is_active").on(table.isActive)
    ]);
    paymentRetries = mysqlTable2("paymentRetries", {
      id: varchar2({ length: 64 }).primaryKey(),
      invoiceId: varchar2({ length: 64 }).notNull(),
      subscriptionId: varchar2({ length: 64 }).notNull(),
      attemptNumber: int2().default(1).notNull(),
      status: mysqlEnum(["pending", "processing", "failed", "succeeded", "abandoned"]).default("pending").notNull(),
      failureReason: varchar2({ length: 255 }),
      paymentMethod: varchar2({ length: 50 }),
      attemptedAt: timestamp2({ mode: "string" }),
      nextRetryAt: timestamp2({ mode: "string" }),
      metadata: json2(),
      createdAt: timestamp2({ mode: "string" }).defaultNow(),
      updatedAt: timestamp2({ mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_invoice_id").on(table.invoiceId),
      index2("idx_subscription_id").on(table.subscriptionId),
      index2("idx_status").on(table.status),
      index2("idx_next_retry_at").on(table.nextRetryAt)
    ]);
    dunningEvents = mysqlTable2("dunningEvents", {
      id: varchar2({ length: 64 }).primaryKey(),
      subscriptionId: varchar2({ length: 64 }).notNull(),
      invoiceId: varchar2({ length: 64 }),
      eventType: mysqlEnum([
        "retry_scheduled",
        "retry_sent",
        "retry_failed",
        "suspension_notice_sent",
        "subscription_suspended",
        "cancellation_notice_sent",
        "subscription_cancelled",
        "payment_recovered"
      ]).notNull(),
      details: json2(),
      triggeredBy: varchar2({ length: 64 }),
      createdAt: timestamp2({ mode: "string" }).defaultNow()
    }, (table) => [
      index2("idx_subscription_id").on(table.subscriptionId),
      index2("idx_event_type").on(table.eventType),
      index2("idx_created_at").on(table.createdAt)
    ]);
    userDeletions = mysqlTable2("userDeletions", {
      id: varchar2({ length: 64 }).primaryKey(),
      userId: varchar2({ length: 64 }).notNull(),
      userName: varchar2({ length: 255 }).notNull(),
      userEmail: varchar2({ length: 320 }).notNull(),
      deletedReason: text2(),
      deletedBy: varchar2({ length: 64 }).notNull(),
      deletedAt: timestamp2({ mode: "string" }).defaultNow(),
      restoredAt: timestamp2({ mode: "string" }),
      restoredBy: varchar2({ length: 64 }),
      archived: tinyint().default(1).notNull()
      // 1 = soft deleted, 0 = active
    }, (table) => [
      index2("idx_user_id").on(table.userId),
      index2("idx_deleted_by").on(table.deletedBy),
      index2("idx_deleted_at").on(table.deletedAt),
      index2("idx_archived").on(table.archived)
    ]);
    notificationTemplates = mysqlTable2("notificationTemplates", {
      id: varchar2({ length: 64 }).primaryKey(),
      templateKey: varchar2({ length: 100 }).notNull().unique(),
      templateName: varchar2({ length: 255 }).notNull(),
      category: mysqlEnum(["billing", "system", "user", "document", "communication", "security"]).notNull(),
      subject: varchar2({ length: 500 }),
      bodyTemplate: longtext().notNull(),
      channels: json2(),
      // ['email', 'in_app', 'sms']
      variables: json2(),
      // List of template variables
      isActive: tinyint().default(1).notNull(),
      createdAt: timestamp2({ mode: "string" }).defaultNow(),
      updatedAt: timestamp2({ mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_template_key").on(table.templateKey),
      index2("idx_category").on(table.category)
    ]);
    notificationBroadcasts = mysqlTable2("notificationBroadcasts", {
      id: varchar2({ length: 64 }).primaryKey(),
      title: varchar2({ length: 500 }).notNull(),
      content: longtext().notNull(),
      target: mysqlEnum(["all_users", "specific_role", "specific_department", "specific_plan", "custom"]).notNull(),
      targetValue: varchar2({ length: 255 }),
      // role name, department id, plan id, or custom filter
      priority: mysqlEnum(["low", "normal", "high", "critical"]).default("normal").notNull(),
      channels: json2(),
      // ['email', 'in_app', 'sms']
      status: mysqlEnum(["draft", "scheduled", "sending", "sent", "cancelled"]).default("draft").notNull(),
      scheduledFor: timestamp2({ mode: "string" }),
      startedAt: timestamp2({ mode: "string" }),
      completedAt: timestamp2({ mode: "string" }),
      recipientCount: int2().default(0),
      sentCount: int2().default(0),
      failedCount: int2().default(0),
      createdBy: varchar2({ length: 64 }).notNull(),
      createdAt: timestamp2({ mode: "string" }).defaultNow(),
      updatedAt: timestamp2({ mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_status").on(table.status),
      index2("idx_target").on(table.target),
      index2("idx_scheduled_for").on(table.scheduledFor)
    ]);
    messages = mysqlTable2("messages", {
      id: varchar2({ length: 64 }).primaryKey(),
      conversationId: varchar2({ length: 64 }).notNull(),
      senderId: varchar2({ length: 64 }).notNull(),
      messageType: mysqlEnum(["text", "image", "file", "system"]).default("text").notNull(),
      content: longtext().notNull(),
      fileUrl: varchar2({ length: 500 }),
      fileName: varchar2({ length: 255 }),
      fileSize: int2(),
      mimeType: varchar2({ length: 100 }),
      isEdited: tinyint().default(0),
      editedAt: timestamp2({ mode: "string" }),
      isDeleted: tinyint().default(0),
      deletedAt: timestamp2({ mode: "string" }),
      reactions: json2(),
      // { emoji: count }
      encryptionIv: varchar2({ length: 255 }),
      // For message encryption
      encryptionTag: varchar2({ length: 255 }),
      createdAt: timestamp2({ mode: "string" }).defaultNow()
    }, (table) => [
      index2("idx_conversation_id").on(table.conversationId),
      index2("idx_sender_id").on(table.senderId),
      index2("idx_created_at").on(table.createdAt)
    ]);
    conversations = mysqlTable2("conversations", {
      id: varchar2({ length: 64 }).primaryKey(),
      type: mysqlEnum(["direct", "group", "channel"]).default("direct").notNull(),
      name: varchar2({ length: 255 }),
      description: text2(),
      conversationIcon: varchar2({ length: 500 }),
      createdBy: varchar2({ length: 64 }).notNull(),
      isArchived: tinyint().default(0),
      archivedAt: timestamp2({ mode: "string" }),
      isEncrypted: tinyint().default(1).notNull(),
      // 1 = encrypted, 0 = plain
      encryptionKey: varchar2({ length: 255 }),
      // Stored encrypted
      lastMessageAt: timestamp2({ mode: "string" }),
      createdAt: timestamp2({ mode: "string" }).defaultNow(),
      updatedAt: timestamp2({ mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_type").on(table.type),
      index2("idx_created_by").on(table.createdBy),
      index2("idx_archived").on(table.isArchived)
    ]);
    organizations = mysqlTable2("organizations", {
      id: varchar2({ length: 64 }).primaryKey(),
      name: varchar2({ length: 255 }).notNull(),
      slug: varchar2({ length: 100 }).notNull(),
      urlMode: mysqlEnum(["path", "subdomain"]).default("path").notNull(),
      plan: varchar2({ length: 50 }).notNull().default("trial"),
      isActive: tinyint().default(1).notNull(),
      isArchived: tinyint().default(0).notNull(),
      archivedAt: timestamp2({ mode: "string" }),
      archivedBy: varchar2({ length: 64 }),
      maxUsers: int2().default(10),
      settings: json2(),
      logoUrl: longtext(),
      domain: varchar2({ length: 255 }),
      contactEmail: varchar2({ length: 320 }),
      contactPhone: varchar2({ length: 50 }),
      address: text2(),
      country: varchar2({ length: 100 }),
      industry: varchar2({ length: 100 }),
      website: varchar2({ length: 255 }),
      taxId: varchar2({ length: 100 }),
      billingEmail: varchar2({ length: 320 }),
      timezone: varchar2({ length: 100 }).default("Africa/Nairobi"),
      currency: varchar2({ length: 10 }).default("KES"),
      description: text2(),
      employeeCount: int2(),
      registrationNumber: varchar2({ length: 100 }),
      paymentMethod: varchar2({ length: 50 }),
      createdAt: timestamp2({ mode: "string" }).defaultNow(),
      updatedAt: timestamp2({ mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_org_slug").on(table.slug),
      index2("idx_org_active").on(table.isActive),
      index2("idx_org_archived").on(table.isArchived),
      index2("idx_org_industry").on(table.industry)
    ]);
    organizationFeatures = mysqlTable2("organizationFeatures", {
      id: varchar2({ length: 64 }).primaryKey(),
      organizationId: varchar2({ length: 64 }).notNull(),
      featureKey: varchar2({ length: 100 }).notNull(),
      isEnabled: tinyint().default(1).notNull(),
      config: json2(),
      updatedAt: timestamp2({ mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_orgfeat_org").on(table.organizationId),
      index2("idx_orgfeat_key").on(table.featureKey)
    ]);
    organizationUsers = mysqlTable2("organizationUsers", {
      id: varchar2({ length: 64 }).primaryKey(),
      organizationId: varchar2({ length: 64 }).notNull(),
      name: varchar2({ length: 255 }).notNull(),
      email: varchar2({ length: 320 }).notNull(),
      role: mysqlEnum(["super_admin", "admin", "manager", "staff", "viewer", "ict_manager", "project_manager", "hr", "accountant", "procurement_manager", "sales_manager"]).default("staff").notNull(),
      position: varchar2({ length: 100 }),
      department: varchar2({ length: 100 }),
      phone: varchar2({ length: 20 }),
      photoUrl: longtext(),
      isActive: tinyint().default(1).notNull(),
      invitationSent: tinyint().default(0).notNull(),
      invitationSentAt: timestamp2({ mode: "string" }),
      invitationAcceptedAt: timestamp2({ mode: "string" }),
      lastSignedIn: timestamp2({ mode: "string" }),
      loginCount: int2().default(0),
      createdBy: varchar2({ length: 64 }).notNull(),
      createdAt: timestamp2({ mode: "string" }).defaultNow(),
      updatedAt: timestamp2({ mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_orgusers_org").on(table.organizationId),
      index2("idx_orgusers_email").on(table.email),
      index2("idx_orgusers_role").on(table.role),
      index2("idx_orgusers_active").on(table.isActive),
      index2("idx_orgusers_created_by").on(table.createdBy)
    ]);
    tenantMessages = mysqlTable2("tenantMessages", {
      id: varchar2({ length: 64 }).primaryKey(),
      senderId: varchar2({ length: 64 }).notNull(),
      subject: varchar2({ length: 500 }).notNull(),
      content: longtext().notNull(),
      priority: varchar2({ length: 20 }).default("normal"),
      targetType: varchar2({ length: 20 }).default("all"),
      targetOrgId: varchar2({ length: 64 }),
      targetUserId: varchar2({ length: 64 }),
      isRead: tinyint().default(0),
      createdAt: timestamp2({ mode: "string" }).defaultNow()
    }, (table) => [
      index2("idx_tmsg_sender").on(table.senderId)
    ]);
    pricingTierFeatures = mysqlTable2("pricingTierFeatures", {
      id: varchar2({ length: 64 }).primaryKey(),
      tier: varchar2({ length: 50 }).notNull(),
      featureKey: varchar2({ length: 100 }).notNull(),
      isEnabled: tinyint().default(1).notNull(),
      createdAt: timestamp2({ mode: "string" }).defaultNow()
    }, (table) => [
      index2("idx_ptf_tier").on(table.tier)
    ]);
    conversationMembers = mysqlTable2("conversationMembers", {
      id: varchar2({ length: 64 }).primaryKey(),
      conversationId: varchar2({ length: 64 }).notNull(),
      userId: varchar2({ length: 64 }).notNull(),
      role: mysqlEnum(["member", "moderator", "admin"]).default("member").notNull(),
      joinedAt: timestamp2({ mode: "string" }).defaultNow(),
      leftAt: timestamp2({ mode: "string" }),
      lastReadAt: timestamp2({ mode: "string" }),
      unreadCount: int2().default(0),
      isMuted: tinyint().default(0),
      isActive: tinyint().default(1).notNull()
    }, (table) => [
      index2("idx_conversation_id").on(table.conversationId),
      index2("idx_user_id").on(table.userId)
    ]);
    messageReadReceipts = mysqlTable2("messageReadReceipts", {
      id: varchar2({ length: 64 }).primaryKey(),
      messageId: varchar2({ length: 64 }).notNull(),
      userId: varchar2({ length: 64 }).notNull(),
      readAt: timestamp2({ mode: "string" }).defaultNow()
    }, (table) => [
      index2("idx_message_id").on(table.messageId),
      index2("idx_user_id").on(table.userId)
    ]);
    tickets = mysqlTable2("tickets", {
      id: varchar2({ length: 64 }).primaryKey(),
      organizationId: varchar2({ length: 64 }),
      ticketNumber: varchar2({ length: 50 }).notNull().unique(),
      title: varchar2({ length: 500 }).notNull(),
      description: longtext().notNull(),
      category: mysqlEnum(["support", "billing", "feature_request", "bug", "security", "general"]).notNull(),
      priority: mysqlEnum(["low", "normal", "high", "urgent"]).default("normal").notNull(),
      status: mysqlEnum(["open", "in_progress", "on_hold", "resolved", "closed", "reopened"]).default("open").notNull(),
      createdBy: varchar2({ length: 64 }).notNull(),
      assignedTo: varchar2({ length: 64 }),
      department: varchar2({ length: 100 }),
      resolution: text2(),
      solutionUrl: varchar2({ length: 500 }),
      attachments: json2(),
      // Array of file URLs
      relatedTickets: json2(),
      // Array of ticket IDs
      firstResponseAt: timestamp2({ mode: "string" }),
      resolvedAt: timestamp2({ mode: "string" }),
      closedAt: timestamp2({ mode: "string" }),
      createdAt: timestamp2({ mode: "string" }).defaultNow(),
      updatedAt: timestamp2({ mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_ticket_number").on(table.ticketNumber),
      index2("idx_status").on(table.status),
      index2("idx_created_by").on(table.createdBy),
      index2("idx_assigned_to").on(table.assignedTo),
      index2("idx_priority").on(table.priority)
    ]);
    ticketResponses = mysqlTable2("ticketResponses", {
      id: varchar2({ length: 64 }).primaryKey(),
      ticketId: varchar2({ length: 64 }).notNull(),
      responderId: varchar2({ length: 64 }).notNull(),
      responseType: mysqlEnum(["comment", "resolution", "escalation"]).default("comment").notNull(),
      content: longtext().notNull(),
      attachments: json2(),
      // Array of file URLs
      isInternal: tinyint().default(0),
      // 1 = only visible to staff
      createdAt: timestamp2({ mode: "string" }).defaultNow(),
      updatedAt: timestamp2({ mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_ticket_id").on(table.ticketId),
      index2("idx_responder_id").on(table.responderId)
    ]);
    recurringInvoiceTemplates = mysqlTable2("recurringInvoiceTemplates", {
      id: varchar2({ length: 64 }).primaryKey(),
      clientId: varchar2({ length: 64 }).notNull(),
      invoiceName: varchar2({ length: 255 }).notNull(),
      description: text2(),
      frequency: mysqlEnum(["daily", "weekly", "biweekly", "monthly", "quarterly", "semi_annual", "annual"]).notNull(),
      startDate: datetime({ mode: "string" }).notNull(),
      endDate: datetime({ mode: "string" }),
      nextInvoiceDate: datetime({ mode: "string" }).notNull(),
      items: json2(),
      // Array of line items with description, quantity, rate
      taxRate: decimal({ precision: 5, scale: 2 }).default("0"),
      discount: decimal({ precision: 5, scale: 2 }).default("0"),
      discountType: mysqlEnum(["percentage", "fixed"]).default("percentage"),
      notes: text2(),
      paymentTerms: int2(),
      // days to payment due
      autoSend: tinyint().default(1).notNull(),
      autoCreateReceipt: tinyint().default(1).notNull(),
      isActive: tinyint().default(1).notNull(),
      createdBy: varchar2({ length: 64 }).notNull(),
      createdAt: timestamp2({ mode: "string" }).defaultNow(),
      updatedAt: timestamp2({ mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_client_id").on(table.clientId),
      index2("idx_next_invoice_date").on(table.nextInvoiceDate),
      index2("idx_is_active").on(table.isActive)
    ]);
    automatedReceipts = mysqlTable2("automatedReceipts", {
      id: varchar2({ length: 64 }).primaryKey(),
      invoiceId: varchar2({ length: 64 }).notNull(),
      receiptNumber: varchar2({ length: 50 }).notNull().unique(),
      amountReceived: decimal({ precision: 10, scale: 2 }).notNull(),
      amountOutstanding: decimal({ precision: 10, scale: 2 }).default("0"),
      paymentStatus: mysqlEnum(["partial", "full"]).notNull(),
      paymentMethod: varchar2({ length: 50 }),
      paymentReference: varchar2({ length: 255 }),
      autoGenerated: tinyint().default(1).notNull(),
      createdAt: timestamp2({ mode: "string" }).defaultNow()
    }, (table) => [
      index2("idx_invoice_id").on(table.invoiceId),
      index2("idx_receipt_number").on(table.receiptNumber)
    ]);
    emailCampaigns = mysqlTable2("emailCampaigns", {
      id: varchar2({ length: 64 }).primaryKey(),
      campaignName: varchar2({ length: 255 }).notNull(),
      subject: varchar2({ length: 500 }).notNull(),
      bodyHtml: longtext().notNull(),
      bodyText: longtext(),
      fromEmail: varchar2({ length: 320 }).notNull(),
      fromName: varchar2({ length: 255 }),
      recipientCount: int2().default(0),
      sentCount: int2().default(0),
      openCount: int2().default(0),
      clickCount: int2().default(0),
      failureCount: int2().default(0),
      status: mysqlEnum(["draft", "scheduled", "sending", "sent", "failed", "paused"]).default("draft").notNull(),
      scheduledFor: timestamp2({ mode: "string" }),
      startedAt: timestamp2({ mode: "string" }),
      completedAt: timestamp2({ mode: "string" }),
      createdBy: varchar2({ length: 64 }).notNull(),
      createdAt: timestamp2({ mode: "string" }).defaultNow()
    }, (table) => [
      index2("idx_status").on(table.status),
      index2("idx_created_by").on(table.createdBy)
    ]);
    emailLogs = mysqlTable2("emailLogs", {
      id: varchar2({ length: 64 }).primaryKey(),
      campaignId: varchar2({ length: 64 }),
      recipientEmail: varchar2({ length: 320 }).notNull(),
      userId: varchar2({ length: 64 }),
      subject: varchar2({ length: 500 }).notNull(),
      status: mysqlEnum(["pending", "sent", "bounced", "failed", "opened", "clicked"]).default("pending").notNull(),
      provider: varchar2({ length: 50 }),
      // smtp, sendgrid, mailgun, ses, etc.
      providerMessageId: varchar2({ length: 255 }),
      sentAt: timestamp2({ mode: "string" }),
      failureReason: text2(),
      openedAt: timestamp2({ mode: "string" }),
      clickedAt: timestamp2({ mode: "string" }),
      metadata: json2(),
      createdAt: timestamp2({ mode: "string" }).defaultNow()
    }, (table) => [
      index2("idx_campaign_id").on(table.campaignId),
      index2("idx_recipient_email").on(table.recipientEmail),
      index2("idx_status").on(table.status)
    ]);
    workOrders = mysqlTable2("workOrders", {
      id: varchar2({ length: 64 }).primaryKey(),
      organizationId: varchar2({ length: 64 }),
      workOrderNumber: varchar2({ length: 50 }).notNull(),
      issueDate: varchar2({ length: 30 }).notNull(),
      description: text2().notNull(),
      assignedTo: varchar2({ length: 200 }).notNull(),
      priority: mysqlEnum(["low", "medium", "high", "critical"]).default("medium").notNull(),
      startDate: varchar2({ length: 30 }).notNull(),
      targetEndDate: varchar2({ length: 30 }).notNull(),
      laborCost: int2().default(0).notNull(),
      serviceCost: int2().default(0).notNull(),
      total: int2().default(0).notNull(),
      notes: text2(),
      status: mysqlEnum(["draft", "open", "in-progress", "completed", "cancelled"]).default("draft").notNull(),
      createdBy: varchar2({ length: 64 }).notNull(),
      createdAt: timestamp2({ mode: "string" }).defaultNow(),
      updatedAt: timestamp2({ mode: "string" }).defaultNow().onUpdateNow()
    });
    eSignatureRequests = mysqlTable2("eSignatureRequests", {
      id: varchar2({ length: 64 }).primaryKey(),
      organizationId: varchar2({ length: 64 }),
      title: varchar2({ length: 255 }).notNull(),
      documentContent: longtext().notNull(),
      signerName: varchar2({ length: 255 }).notNull(),
      signerEmail: varchar2({ length: 320 }).notNull(),
      signingToken: varchar2({ length: 128 }).notNull().unique(),
      status: mysqlEnum(["pending", "signed", "declined", "expired"]).default("pending").notNull(),
      signatureData: longtext(),
      signedAt: timestamp2({ mode: "string" }),
      expiresAt: timestamp2({ mode: "string" }),
      createdBy: varchar2({ length: 64 }).notNull(),
      createdAt: timestamp2({ mode: "string" }).defaultNow(),
      updatedAt: timestamp2({ mode: "string" }).defaultNow().onUpdateNow()
    });
    workOrderMaterials = mysqlTable2("workOrderMaterials", {
      id: varchar2({ length: 64 }).primaryKey(),
      workOrderId: varchar2({ length: 64 }).notNull(),
      description: text2().notNull(),
      quantity: int2().default(1).notNull(),
      unitCost: int2().default(0).notNull(),
      total: int2().default(0).notNull(),
      createdAt: timestamp2({ mode: "string" }).defaultNow()
    }, (table) => [
      index2("idx_wom_workorder").on(table.workOrderId)
    ]);
    serviceInvoices = mysqlTable2("serviceInvoices", {
      id: varchar2({ length: 64 }).primaryKey(),
      organizationId: varchar2({ length: 64 }),
      serviceInvoiceNumber: varchar2({ length: 50 }).notNull(),
      issueDate: varchar2({ length: 30 }).notNull(),
      dueDate: varchar2({ length: 30 }).notNull(),
      clientId: varchar2({ length: 64 }).notNull(),
      clientName: varchar2({ length: 200 }).notNull(),
      serviceDescription: text2().notNull(),
      total: int2().default(0).notNull(),
      taxAmount: int2().default(0).notNull(),
      notes: text2(),
      status: mysqlEnum(["draft", "sent", "accepted", "paid", "cancelled"]).default("draft").notNull(),
      createdBy: varchar2({ length: 64 }).notNull(),
      createdAt: timestamp2({ mode: "string" }).defaultNow(),
      updatedAt: timestamp2({ mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_si_client").on(table.clientId),
      index2("idx_si_status").on(table.status)
    ]);
    serviceInvoiceItems = mysqlTable2("serviceInvoiceItems", {
      id: varchar2({ length: 64 }).primaryKey(),
      serviceInvoiceId: varchar2({ length: 64 }).notNull(),
      description: text2().notNull(),
      quantity: int2().default(1).notNull(),
      unitPrice: int2().default(0).notNull(),
      total: int2().default(0).notNull(),
      createdAt: timestamp2({ mode: "string" }).defaultNow()
    }, (table) => [
      index2("idx_sii_invoice").on(table.serviceInvoiceId)
    ]);
    contacts = mysqlTable2("contacts", {
      id: varchar2({ length: 64 }).primaryKey(),
      organizationId: varchar2({ length: 64 }),
      clientId: varchar2({ length: 64 }),
      salutation: varchar2({ length: 20 }),
      firstName: varchar2({ length: 100 }).notNull(),
      lastName: varchar2({ length: 100 }).notNull(),
      email: varchar2({ length: 320 }),
      phone: varchar2({ length: 50 }),
      mobile: varchar2({ length: 50 }),
      jobTitle: varchar2({ length: 200 }),
      department: varchar2({ length: 200 }),
      isPrimary: tinyint().default(0),
      notes: text2(),
      address: text2(),
      city: varchar2({ length: 100 }),
      country: varchar2({ length: 100 }),
      postalCode: varchar2({ length: 20 }),
      linkedIn: varchar2({ length: 500 }),
      createdBy: varchar2({ length: 64 }).notNull(),
      createdAt: timestamp2({ mode: "string" }).defaultNow(),
      updatedAt: timestamp2({ mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_contacts_client").on(table.clientId),
      index2("idx_contacts_email").on(table.email)
    ]);
    quotations = mysqlTable2("quotations", {
      id: varchar2({ length: 64 }).primaryKey(),
      organizationId: varchar2({ length: 64 }),
      rfqNo: varchar2({ length: 50 }).notNull(),
      supplier: varchar2({ length: 200 }).notNull(),
      description: text2(),
      amount: int2().default(0).notNull(),
      dueDate: varchar2({ length: 30 }),
      status: mysqlEnum(["draft", "submitted", "under_review", "approved", "rejected"]).default("draft").notNull(),
      createdBy: varchar2({ length: 64 }).notNull(),
      createdAt: timestamp2({ mode: "string" }).defaultNow(),
      updatedAt: timestamp2({ mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_quot_status").on(table.status),
      index2("idx_quot_rfq").on(table.rfqNo)
    ]);
    grnRecords = mysqlTable2("grnRecords", {
      id: varchar2({ length: 64 }).primaryKey(),
      organizationId: varchar2({ length: 64 }),
      grnNo: varchar2({ length: 50 }).notNull(),
      supplier: varchar2({ length: 200 }).notNull(),
      invNo: varchar2({ length: 50 }),
      receivedDate: varchar2({ length: 30 }).notNull(),
      items: int2().default(0).notNull(),
      value: int2().default(0).notNull(),
      status: mysqlEnum(["accepted", "partial", "rejected", "pending"]).default("pending").notNull(),
      notes: text2(),
      createdBy: varchar2({ length: 64 }).notNull(),
      createdAt: timestamp2({ mode: "string" }).defaultNow(),
      updatedAt: timestamp2({ mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_grn_status").on(table.status),
      index2("idx_grn_supplier").on(table.supplier)
    ]);
    deliveryNotes = mysqlTable2("deliveryNotes", {
      id: varchar2({ length: 64 }).primaryKey(),
      dnNo: varchar2({ length: 50 }).notNull(),
      supplier: varchar2({ length: 200 }).notNull(),
      orderId: varchar2({ length: 64 }),
      deliveryDate: varchar2({ length: 30 }).notNull(),
      items: int2().default(0).notNull(),
      status: mysqlEnum(["pending", "partial", "delivered", "cancelled"]).default("pending").notNull(),
      notes: text2(),
      createdBy: varchar2({ length: 64 }).notNull(),
      createdAt: timestamp2({ mode: "string" }).defaultNow(),
      updatedAt: timestamp2({ mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_dn_status").on(table.status),
      index2("idx_dn_order").on(table.orderId)
    ]);
    assets = mysqlTable2("assets", {
      id: varchar2({ length: 64 }).primaryKey(),
      name: varchar2({ length: 200 }).notNull(),
      category: varchar2({ length: 100 }).notNull(),
      location: varchar2({ length: 200 }).notNull(),
      value: int2().default(0).notNull(),
      assignedTo: varchar2({ length: 200 }),
      serialNumber: varchar2({ length: 100 }),
      purchaseDate: varchar2({ length: 30 }),
      status: mysqlEnum(["active", "inactive", "maintenance", "disposed"]).default("active").notNull(),
      notes: text2(),
      createdBy: varchar2({ length: 64 }).notNull(),
      createdAt: timestamp2({ mode: "string" }).defaultNow(),
      updatedAt: timestamp2({ mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_assets_status").on(table.status),
      index2("idx_assets_category").on(table.category)
    ]);
    contracts = mysqlTable2("contracts", {
      id: varchar2({ length: 64 }).primaryKey(),
      organizationId: varchar2({ length: 64 }),
      contractNumber: varchar2({ length: 50 }),
      name: varchar2({ length: 200 }).notNull(),
      vendor: varchar2({ length: 200 }).notNull(),
      startDate: varchar2({ length: 30 }).notNull(),
      endDate: varchar2({ length: 30 }).notNull(),
      value: int2().default(0).notNull(),
      status: mysqlEnum(["draft", "active", "expired", "terminated"]).default("draft").notNull(),
      contractType: varchar2({ length: 100 }),
      description: text2(),
      notes: text2(),
      createdBy: varchar2({ length: 64 }).notNull(),
      createdAt: timestamp2({ mode: "string" }).defaultNow(),
      updatedAt: timestamp2({ mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_contracts_status").on(table.status),
      index2("idx_contracts_vendor").on(table.vendor)
    ]);
    warranties = mysqlTable2("warranties", {
      id: varchar2({ length: 64 }).primaryKey(),
      organizationId: varchar2({ length: 64 }),
      product: varchar2({ length: 200 }).notNull(),
      vendor: varchar2({ length: 200 }).notNull(),
      expiryDate: varchar2({ length: 30 }).notNull(),
      coverage: varchar2({ length: 500 }).notNull(),
      status: mysqlEnum(["active", "expiring_soon", "expired"]).default("active").notNull(),
      serialNumber: varchar2({ length: 100 }),
      claimTerms: text2(),
      notes: text2(),
      createdBy: varchar2({ length: 64 }).notNull(),
      createdAt: timestamp2({ mode: "string" }).defaultNow(),
      updatedAt: timestamp2({ mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_warranties_status").on(table.status),
      index2("idx_warranties_vendor").on(table.vendor)
    ]);
    notes = mysqlTable2("notes", {
      id: varchar2({ length: 64 }).primaryKey(),
      title: varchar2({ length: 300 }).notNull(),
      content: text2(),
      category: varchar2({ length: 100 }).default("General").notNull(),
      pinned: tinyint().default(0).notNull(),
      favorite: tinyint().default(0).notNull(),
      createdBy: varchar2({ length: 64 }).notNull(),
      organizationId: varchar2({ length: 64 }),
      createdAt: timestamp2({ mode: "string" }).defaultNow(),
      updatedAt: timestamp2({ mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_notes_created_by").on(table.createdBy),
      index2("idx_notes_category").on(table.category)
    ]);
    customReports = mysqlTable2("custom_reports", {
      id: varchar2("id", { length: 64 }).primaryKey(),
      name: varchar2("name", { length: 200 }).notNull(),
      description: text2("description"),
      category: varchar2("category", { length: 100 }).notNull(),
      dataSources: text2("dataSources"),
      layout: text2("layout"),
      format: mysqlEnum("format", ["PDF", "Excel", "CSV", "HTML"]).notNull().default("PDF"),
      isTemplate: tinyint("isTemplate").notNull().default(0),
      status: mysqlEnum("status", ["draft", "active", "archived"]).notNull().default("draft"),
      owner: varchar2("owner", { length: 200 }),
      createdBy: varchar2("createdBy", { length: 64 }).notNull(),
      createdAt: timestamp2("createdAt").defaultNow(),
      updatedAt: timestamp2("updatedAt").defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_custom_reports_category").on(table.category),
      index2("idx_custom_reports_status").on(table.status)
    ]);
    organizationAccountingPolicies = mysqlTable2("organizationAccountingPolicies", {
      id: varchar2({ length: 64 }).primaryKey(),
      organizationId: varchar2({ length: 64 }).notNull(),
      country: varchar2({ length: 10 }).default("KE").notNull(),
      fiscalYearStart: varchar2({ length: 5 }).default("01-01").notNull(),
      fiscalYearEnd: varchar2({ length: 5 }).default("12-31").notNull(),
      accountingMethod: mysqlEnum(["accrual", "cash"]).default("accrual").notNull(),
      defaultCurrency: varchar2({ length: 3 }).default("KES").notNull(),
      taxInclusiveInvoicing: tinyint().default(1).notNull(),
      autoReconciliation: tinyint().default(0).notNull(),
      requireInvoiceApproval: tinyint().default(1).notNull(),
      requireExpenseApproval: tinyint().default(1).notNull(),
      defaultPaymentTerms: varchar2({ length: 20 }).default("net30"),
      depreciationMethod: mysqlEnum(["straight_line", "declining_balance", "units_of_production"]).default("straight_line"),
      capitalizedAssetThreshold: int2().default(5e4),
      roundingMethod: mysqlEnum(["round", "truncate"]).default("round"),
      retentionPeriod: int2().default(7),
      auditTrailRequired: tinyint().default(1).notNull(),
      allowManualJournalEntries: tinyint().default(1).notNull(),
      createdBy: varchar2({ length: 64 }).notNull(),
      createdAt: timestamp2({ mode: "string" }).notNull(),
      updatedBy: varchar2({ length: 64 }),
      updatedAt: timestamp2({ mode: "string" })
    }, (table) => [
      index2("idx_org").on(table.organizationId),
      index2("idx_country").on(table.country)
    ]);
    imprests = mysqlTable2("imprests", {
      id: varchar2({ length: 64 }).primaryKey(),
      organizationId: varchar2({ length: 64 }).notNull(),
      imprestNumber: varchar2({ length: 50 }).notNull(),
      employeeId: varchar2({ length: 64 }).notNull(),
      employeeName: varchar2({ length: 255 }).notNull(),
      amount: int2().notNull(),
      purpose: varchar2({ length: 255 }).notNull(),
      requestDate: datetime({ mode: "string" }).notNull(),
      status: mysqlEnum(["pending", "approved", "disbursed", "settled", "cancelled"]).default("pending").notNull(),
      approvedBy: varchar2({ length: 64 }),
      approvedAt: datetime({ mode: "string" }),
      disbursedAt: datetime({ mode: "string" }),
      settledAt: datetime({ mode: "string" }),
      notes: text2(),
      createdBy: varchar2({ length: 64 }).notNull(),
      createdAt: timestamp2({ mode: "string" }).notNull(),
      updatedAt: timestamp2({ mode: "string" })
    }, (table) => [
      index2("idx_org").on(table.organizationId),
      index2("idx_employee").on(table.employeeId),
      index2("idx_status").on(table.status)
    ]);
    imprestSurrenders = mysqlTable2("imprestSurrenders", {
      id: varchar2({ length: 64 }).primaryKey(),
      imprestId: varchar2({ length: 64 }).notNull(),
      totalExpensed: int2().notNull(),
      variance: int2(),
      returnedAmount: int2(),
      status: mysqlEnum(["settled", "variance_pending", "under_review"]).default("settled").notNull(),
      settledBy: varchar2({ length: 64 }).notNull(),
      settledAt: datetime({ mode: "string" }).notNull(),
      createdAt: timestamp2({ mode: "string" }).notNull()
    }, (table) => [
      index2("idx_imprest").on(table.imprestId)
    ]);
    purchaseOrders = mysqlTable2("purchaseOrders", {
      id: varchar2({ length: 64 }).primaryKey(),
      organizationId: varchar2({ length: 64 }).notNull(),
      poNumber: varchar2({ length: 50 }).notNull(),
      supplierId: varchar2({ length: 64 }).notNull(),
      supplierName: varchar2({ length: 255 }).notNull(),
      poDate: datetime({ mode: "string" }).notNull(),
      deliveryDate: datetime({ mode: "string" }),
      subtotal: int2().notNull(),
      taxAmount: int2().default(0),
      total: int2().notNull(),
      status: mysqlEnum(["draft", "approved", "received", "partially_received", "cancelled"]).default("draft").notNull(),
      approvedBy: varchar2({ length: 64 }),
      approvedAt: datetime({ mode: "string" }),
      receivedAt: datetime({ mode: "string" }),
      notes: text2(),
      createdBy: varchar2({ length: 64 }).notNull(),
      createdAt: timestamp2({ mode: "string" }).notNull(),
      updatedAt: timestamp2({ mode: "string" })
    }, (table) => [
      index2("idx_org").on(table.organizationId),
      index2("idx_supplier").on(table.supplierId),
      index2("idx_status").on(table.status)
    ]);
    purchaseOrderItems = mysqlTable2("purchaseOrderItems", {
      id: varchar2({ length: 64 }).primaryKey(),
      purchaseOrderId: varchar2({ length: 64 }).notNull(),
      description: varchar2({ length: 255 }).notNull(),
      quantity: int2().notNull(),
      rate: int2().notNull(),
      amount: int2().notNull(),
      lineNumber: int2(),
      createdBy: varchar2({ length: 64 }).notNull(),
      createdAt: timestamp2({ mode: "string" }).notNull()
    }, (table) => [
      index2("idx_po").on(table.purchaseOrderId)
    ]);
    goodsReceiptNotes = mysqlTable2("goodsReceiptNotes", {
      id: varchar2({ length: 64 }).primaryKey(),
      organizationId: varchar2({ length: 64 }).notNull(),
      grno: varchar2({ length: 50 }).notNull(),
      purchaseOrderId: varchar2({ length: 64 }).notNull(),
      receivedDate: datetime({ mode: "string" }).notNull(),
      totalQuantity: int2(),
      notes: text2(),
      createdBy: varchar2({ length: 64 }).notNull(),
      createdAt: timestamp2({ mode: "string" }).notNull()
    }, (table) => [
      index2("idx_org").on(table.organizationId),
      index2("idx_po").on(table.purchaseOrderId)
    ]);
    leads = mysqlTable2("leads", {
      id: varchar2({ length: 64 }).primaryKey(),
      organizationId: varchar2({ length: 64 }).notNull(),
      leadNo: varchar2({ length: 50 }).notNull(),
      companyName: varchar2({ length: 255 }).notNull(),
      contactName: varchar2({ length: 255 }).notNull(),
      email: varchar2({ length: 320 }),
      phone: varchar2({ length: 20 }),
      source: mysqlEnum(["website", "referral", "social_media", "cold_outreach", "event", "trade_show", "other"]).notNull(),
      estimatedValue: int2().default(0),
      currency: varchar2({ length: 3 }).default("KES"),
      country: varchar2({ length: 10 }),
      industry: varchar2({ length: 100 }),
      status: mysqlEnum(["new", "contacted", "qualified", "proposal_sent", "negotiating", "closed_won", "closed_lost"]).default("new").notNull(),
      assignedTo: varchar2({ length: 64 }),
      notes: text2(),
      createdBy: varchar2({ length: 64 }).notNull(),
      createdAt: timestamp2({ mode: "string" }).notNull(),
      updatedAt: timestamp2({ mode: "string" })
    }, (table) => [
      index2("idx_org").on(table.organizationId),
      index2("idx_status").on(table.status),
      index2("idx_source").on(table.source)
    ]);
    bankReconciliationStatements = mysqlTable2("bankReconciliationStatements", {
      id: varchar2({ length: 64 }).primaryKey(),
      organizationId: varchar2({ length: 64 }).notNull(),
      bankAccountId: varchar2({ length: 64 }).notNull(),
      statementDate: datetime({ mode: "string" }).notNull(),
      openingBalance: int2(),
      closingBalance: int2(),
      status: mysqlEnum(["pending", "reconciled", "variance_identified"]).default("pending").notNull(),
      reconciliationNotes: text2(),
      reconcililedBy: varchar2({ length: 64 }),
      reconcililedAt: datetime({ mode: "string" }),
      createdBy: varchar2({ length: 64 }).notNull(),
      createdAt: timestamp2({ mode: "string" }).notNull(),
      updatedAt: timestamp2({ mode: "string" })
    }, (table) => [
      index2("idx_org").on(table.organizationId),
      index2("idx_date").on(table.statementDate),
      index2("idx_status").on(table.status)
    ]);
    bankReconciliationDetails = mysqlTable2("bankReconciliationDetails", {
      id: varchar2({ length: 64 }).primaryKey(),
      statementId: varchar2({ length: 64 }).notNull(),
      transactionId: varchar2({ length: 64 }),
      transactionType: varchar2({ length: 50 }),
      bankDate: datetime({ mode: "string" }).notNull(),
      description: varchar2({ length: 255 }),
      amount: int2(),
      matched: tinyint().default(0).notNull(),
      matchedTransactionId: varchar2({ length: 64 }),
      matchedAmount: int2(),
      createdAt: timestamp2({ mode: "string" }).notNull()
    }, (table) => [
      index2("idx_statement").on(table.statementId),
      index2("idx_transaction").on(table.transactionId)
    ]);
    automationConfigs = mysqlTable2("automationConfigs", {
      id: varchar2({ length: 64 }).primaryKey(),
      organizationId: varchar2({ length: 64 }).notNull(),
      workflowType: varchar2({ length: 100 }).notNull(),
      enabled: tinyint().default(1).notNull(),
      configuration: json2(),
      createdAt: timestamp2({ mode: "string" }).notNull(),
      updatedAt: timestamp2({ mode: "string" })
    }, (table) => [
      index2("idx_org").on(table.organizationId),
      index2("idx_workflow").on(table.workflowType)
    ]);
    workflowAutomationLogs = mysqlTable2("workflowAutomationLogs", {
      id: varchar2({ length: 64 }).primaryKey(),
      organizationId: varchar2({ length: 64 }).notNull(),
      workflowType: varchar2({ length: 100 }).notNull(),
      sourceEntityId: varchar2({ length: 64 }),
      sourceEntityType: varchar2({ length: 50 }),
      targetEntityId: varchar2({ length: 64 }),
      status: mysqlEnum(["pending", "completed", "failed"]).default("pending").notNull(),
      errorMessage: text2(),
      executedBy: varchar2({ length: 64 }),
      executedAt: datetime({ mode: "string" }).notNull(),
      createdAt: timestamp2({ mode: "string" }).notNull()
    }, (table) => [
      index2("idx_org").on(table.organizationId),
      index2("idx_workflow").on(table.workflowType),
      index2("idx_source").on(table.sourceEntityId),
      index2("idx_target").on(table.targetEntityId),
      index2("idx_date").on(table.executedAt)
    ]);
    smartWorkflows = mysqlTable2("smart_workflows", {
      id: varchar2("id", { length: 64 }).primaryKey(),
      name: varchar2("name", { length: 200 }).notNull(),
      triggerType: varchar2("triggerType", { length: 50 }).notNull().default("event"),
      triggerConfig: text2("triggerConfig"),
      actions: text2("actions"),
      conditions: text2("conditions"),
      status: varchar2("status", { length: 50 }).notNull().default("active"),
      executionCount: int2("executionCount").notNull().default(0),
      lastExecuted: timestamp2("lastExecuted", { mode: "string" }),
      createdBy: varchar2("createdBy", { length: 64 }).notNull(),
      createdAt: timestamp2("createdAt", { mode: "string" }).defaultNow(),
      updatedAt: timestamp2("updatedAt", { mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_sw_status").on(table.status)
    ]);
    exportJobs = mysqlTable2("export_jobs", {
      id: varchar2("id", { length: 64 }).primaryKey(),
      name: varchar2("name", { length: 200 }),
      dataType: varchar2("dataType", { length: 100 }).notNull(),
      format: varchar2("format", { length: 50 }).notNull().default("csv"),
      filters: text2("filters"),
      status: varchar2("status", { length: 50 }).notNull().default("processing"),
      fileUrl: varchar2("fileUrl", { length: 500 }),
      fileSize: bigint("fileSize", { mode: "number" }),
      rowsExported: int2("rowsExported").default(0),
      schedule: varchar2("schedule", { length: 50 }),
      recipients: text2("recipients"),
      expiresAt: timestamp2("expiresAt", { mode: "string" }),
      createdBy: varchar2("createdBy", { length: 64 }).notNull(),
      createdAt: timestamp2("createdAt", { mode: "string" }).defaultNow(),
      updatedAt: timestamp2("updatedAt", { mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_ej_status").on(table.status)
    ]);
    securityEvents = mysqlTable2("security_events", {
      id: varchar2("id", { length: 64 }).primaryKey(),
      eventType: varchar2("eventType", { length: 100 }).notNull(),
      action: varchar2("action", { length: 200 }),
      severity: varchar2("severity", { length: 50 }).notNull().default("MEDIUM"),
      resourceId: varchar2("resourceId", { length: 200 }),
      userId: varchar2("userId", { length: 64 }),
      details: text2("details"),
      status: varchar2("status", { length: 50 }).notNull().default("LOGGED"),
      ipAddress: varchar2("ipAddress", { length: 100 }),
      createdBy: varchar2("createdBy", { length: 64 }).notNull(),
      createdAt: timestamp2("createdAt", { mode: "string" }).defaultNow()
    }, (table) => [
      index2("idx_se_type").on(table.eventType),
      index2("idx_se_severity").on(table.severity)
    ]);
    aiConfigurations = mysqlTable2("ai_configurations", {
      id: varchar2("id", { length: 64 }).primaryKey(),
      configType: varchar2("configType", { length: 100 }).notNull(),
      name: varchar2("name", { length: 200 }).notNull(),
      model: varchar2("model", { length: 100 }),
      capabilities: text2("capabilities"),
      parameters: text2("parameters"),
      status: varchar2("status", { length: 50 }).notNull().default("ACTIVE"),
      metrics: text2("metrics"),
      createdBy: varchar2("createdBy", { length: 64 }).notNull(),
      createdAt: timestamp2("createdAt", { mode: "string" }).defaultNow(),
      updatedAt: timestamp2("updatedAt", { mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_ac_type").on(table.configType),
      index2("idx_ac_status").on(table.status)
    ]);
    apiPricingConfigs = mysqlTable2("api_pricing_configs", {
      id: varchar2("id", { length: 64 }).primaryKey(),
      apiId: varchar2("apiId", { length: 100 }),
      name: varchar2("name", { length: 200 }).notNull(),
      pricingModel: varchar2("pricingModel", { length: 50 }).notNull().default("FIXED"),
      basePrice: decimal("basePrice", { precision: 12, scale: 2 }).default("0"),
      currency: varchar2("currency", { length: 10 }).notNull().default("USD"),
      rateLimit: int2("rateLimit").default(1e4),
      config: text2("config"),
      status: varchar2("status", { length: 50 }).notNull().default("ACTIVE"),
      createdBy: varchar2("createdBy", { length: 64 }).notNull(),
      createdAt: timestamp2("createdAt", { mode: "string" }).defaultNow(),
      updatedAt: timestamp2("updatedAt", { mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_apc_status").on(table.status)
    ]);
    etlJobs = mysqlTable2("etl_jobs", {
      id: varchar2("id", { length: 64 }).primaryKey(),
      jobName: varchar2("jobName", { length: 200 }).notNull(),
      sourceSystem: varchar2("sourceSystem", { length: 200 }),
      targetTable: varchar2("targetTable", { length: 200 }),
      schedule: varchar2("schedule", { length: 100 }),
      status: varchar2("status", { length: 50 }).notNull().default("PENDING"),
      progress: int2("progress").default(0),
      recordsProcessed: int2("recordsProcessed").default(0),
      config: text2("config"),
      lastRun: timestamp2("lastRun", { mode: "string" }),
      createdBy: varchar2("createdBy", { length: 64 }).notNull(),
      createdAt: timestamp2("createdAt", { mode: "string" }).defaultNow(),
      updatedAt: timestamp2("updatedAt", { mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_etl_status").on(table.status)
    ]);
    containerDeployments = mysqlTable2("container_deployments", {
      id: varchar2("id", { length: 64 }).primaryKey(),
      name: varchar2("name", { length: 200 }).notNull(),
      orchestrator: varchar2("orchestrator", { length: 50 }),
      serviceName: varchar2("serviceName", { length: 200 }),
      image: varchar2("image", { length: 500 }),
      replicas: int2("replicas").default(1),
      port: int2("port"),
      status: varchar2("status", { length: 50 }).notNull().default("PENDING"),
      config: text2("config"),
      createdBy: varchar2("createdBy", { length: 64 }).notNull(),
      createdAt: timestamp2("createdAt", { mode: "string" }).defaultNow(),
      updatedAt: timestamp2("updatedAt", { mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_cd_status").on(table.status)
    ]);
    customDashboards = mysqlTable2("custom_dashboards", {
      id: varchar2("id", { length: 64 }).primaryKey(),
      name: varchar2("name", { length: 200 }).notNull(),
      description: text2("description"),
      layout: varchar2("layout", { length: 50 }).notNull().default("grid"),
      widgets: text2("widgets"),
      isPublic: tinyint("isPublic").notNull().default(0),
      sharedWith: text2("sharedWith"),
      createdBy: varchar2("createdBy", { length: 64 }).notNull(),
      createdAt: timestamp2("createdAt", { mode: "string" }).defaultNow(),
      updatedAt: timestamp2("updatedAt", { mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_cdash_public").on(table.isPublic)
    ]);
    webhookConfigs = mysqlTable2("webhook_configs", {
      id: varchar2("id", { length: 64 }).primaryKey(),
      name: varchar2("name", { length: 200 }),
      eventType: varchar2("eventType", { length: 200 }).notNull(),
      targetUrl: varchar2("targetUrl", { length: 500 }).notNull(),
      secret: varchar2("secret", { length: 200 }),
      isActive: tinyint("isActive").notNull().default(1),
      retryCount: int2("retryCount").default(0),
      lastTriggered: timestamp2("lastTriggered", { mode: "string" }),
      config: text2("config"),
      createdBy: varchar2("createdBy", { length: 64 }).notNull(),
      createdAt: timestamp2("createdAt", { mode: "string" }).defaultNow(),
      updatedAt: timestamp2("updatedAt", { mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_wc_active").on(table.isActive)
    ]);
    emailCalendarSync = mysqlTable2("email_calendar_sync", {
      id: varchar2("id", { length: 64 }).primaryKey(),
      provider: varchar2("provider", { length: 50 }).notNull(),
      email: varchar2("email", { length: 200 }),
      title: varchar2("title", { length: 200 }),
      description: text2("description"),
      startTime: varchar2("startTime", { length: 100 }),
      endTime: varchar2("endTime", { length: 100 }),
      attendees: text2("attendees"),
      location: varchar2("location", { length: 500 }),
      syncStatus: varchar2("syncStatus", { length: 50 }).notNull().default("pending"),
      config: text2("config"),
      createdBy: varchar2("createdBy", { length: 64 }).notNull(),
      createdAt: timestamp2("createdAt", { mode: "string" }).defaultNow(),
      updatedAt: timestamp2("updatedAt", { mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_ecs_provider").on(table.provider)
    ]);
    securityIncidents = mysqlTable2("security_incidents", {
      id: varchar2("id", { length: 64 }).primaryKey(),
      title: varchar2("title", { length: 200 }).notNull(),
      threatType: varchar2("threatType", { length: 100 }).notNull(),
      severity: varchar2("severity", { length: 50 }).notNull().default("MEDIUM"),
      source: varchar2("source", { length: 200 }),
      targetAsset: varchar2("targetAsset", { length: 200 }),
      status: varchar2("status", { length: 50 }).notNull().default("DETECTED"),
      details: text2("details"),
      scanConfig: text2("scanConfig"),
      resolvedAt: timestamp2("resolvedAt", { mode: "string" }),
      createdBy: varchar2("createdBy", { length: 64 }).notNull(),
      createdAt: timestamp2("createdAt", { mode: "string" }).defaultNow()
    }, (table) => [
      index2("idx_si_severity").on(table.severity),
      index2("idx_si_status").on(table.status)
    ]);
    globalConfigs = mysqlTable2("global_configs", {
      id: varchar2("id", { length: 64 }).primaryKey(),
      configType: varchar2("configType", { length: 100 }).notNull(),
      name: varchar2("name", { length: 200 }).notNull(),
      region: varchar2("region", { length: 100 }),
      config: text2("config"),
      status: varchar2("status", { length: 50 }).notNull().default("ACTIVE"),
      createdBy: varchar2("createdBy", { length: 64 }).notNull(),
      createdAt: timestamp2("createdAt", { mode: "string" }).defaultNow(),
      updatedAt: timestamp2("updatedAt", { mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_gc_type").on(table.configType)
    ]);
    registeredDevices = mysqlTable2("registered_devices", {
      id: varchar2("id", { length: 64 }).primaryKey(),
      deviceId: varchar2("deviceId", { length: 200 }).notNull(),
      deviceType: varchar2("deviceType", { length: 50 }).notNull(),
      pushToken: varchar2("pushToken", { length: 500 }),
      platform: varchar2("platform", { length: 50 }),
      appVersion: varchar2("appVersion", { length: 50 }),
      lastSync: timestamp2("lastSync", { mode: "string" }),
      syncConfig: text2("syncConfig"),
      userId: varchar2("userId", { length: 64 }),
      createdBy: varchar2("createdBy", { length: 64 }).notNull(),
      createdAt: timestamp2("createdAt", { mode: "string" }).defaultNow(),
      updatedAt: timestamp2("updatedAt", { mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_rd_device").on(table.deviceId),
      index2("idx_rd_user").on(table.userId)
    ]);
    mobileAppConfigs = mysqlTable2("mobile_app_configs", {
      id: varchar2("id", { length: 64 }).primaryKey(),
      platform: varchar2("platform", { length: 50 }).notNull(),
      appVersion: varchar2("appVersion", { length: 50 }),
      bundleId: varchar2("bundleId", { length: 200 }),
      packageName: varchar2("packageName", { length: 200 }),
      config: text2("config"),
      status: varchar2("status", { length: 50 }).notNull().default("ACTIVE"),
      createdBy: varchar2("createdBy", { length: 64 }).notNull(),
      createdAt: timestamp2("createdAt", { mode: "string" }).defaultNow(),
      updatedAt: timestamp2("updatedAt", { mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_mac_platform").on(table.platform)
    ]);
    partnerDeals = mysqlTable2("partner_deals", {
      id: varchar2("id", { length: 64 }).primaryKey(),
      partnerId: varchar2("partnerId", { length: 64 }),
      partnerName: varchar2("partnerName", { length: 200 }),
      dealName: varchar2("dealName", { length: 200 }).notNull(),
      customerId: varchar2("customerId", { length: 64 }),
      dealValue: decimal("dealValue", { precision: 15, scale: 2 }).default("0"),
      tier: varchar2("tier", { length: 50 }),
      status: varchar2("status", { length: 50 }).notNull().default("REGISTERED"),
      commissionRate: decimal("commissionRate", { precision: 5, scale: 2 }).default("0"),
      closureDate: varchar2("closureDate", { length: 100 }),
      config: text2("config"),
      createdBy: varchar2("createdBy", { length: 64 }).notNull(),
      createdAt: timestamp2("createdAt", { mode: "string" }).defaultNow(),
      updatedAt: timestamp2("updatedAt", { mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_pd_status").on(table.status),
      index2("idx_pd_partner").on(table.partnerId)
    ]);
    perfConfigs = mysqlTable2("perf_configs", {
      id: varchar2("id", { length: 64 }).primaryKey(),
      configType: varchar2("configType", { length: 100 }).notNull(),
      name: varchar2("name", { length: 200 }),
      strategy: varchar2("strategy", { length: 100 }),
      config: text2("config"),
      status: varchar2("status", { length: 50 }).notNull().default("ACTIVE"),
      createdBy: varchar2("createdBy", { length: 64 }).notNull(),
      createdAt: timestamp2("createdAt", { mode: "string" }).defaultNow(),
      updatedAt: timestamp2("updatedAt", { mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_pc_type").on(table.configType)
    ]);
    backupSchedules = mysqlTable2("backup_schedules", {
      id: varchar2("id", { length: 64 }).primaryKey(),
      name: varchar2("name", { length: 200 }),
      backupType: varchar2("backupType", { length: 50 }).notNull().default("FULL"),
      schedule: varchar2("schedule", { length: 100 }),
      retentionDays: int2("retentionDays").default(30),
      status: varchar2("status", { length: 50 }).notNull().default("SCHEDULED"),
      lastRun: timestamp2("lastRun", { mode: "string" }),
      nextRun: timestamp2("nextRun", { mode: "string" }),
      config: text2("config"),
      createdBy: varchar2("createdBy", { length: 64 }).notNull(),
      createdAt: timestamp2("createdAt", { mode: "string" }).defaultNow(),
      updatedAt: timestamp2("updatedAt", { mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_bs_status").on(table.status)
    ]);
    backupHistory = mysqlTable2("backup_history", {
      id: varchar2("id", { length: 64 }).primaryKey(),
      name: varchar2("name", { length: 200 }).notNull(),
      backupType: varchar2("backupType", { length: 50 }).notNull().default("full"),
      scope: varchar2("scope", { length: 50 }).notNull().default("full"),
      scopeEntityId: varchar2("scopeEntityId", { length: 64 }),
      status: varchar2("status", { length: 50 }).notNull().default("pending"),
      tablesList: text2("tablesList"),
      recordCount: int2("recordCount").default(0),
      sizeBytes: int2("sizeBytes").default(0),
      fileName: varchar2("fileName", { length: 500 }),
      errorMessage: text2("errorMessage"),
      completedAt: timestamp2("completedAt", { mode: "string" }),
      createdBy: varchar2("createdBy", { length: 64 }).notNull(),
      createdAt: timestamp2("createdAt", { mode: "string" }).defaultNow()
    }, (table) => [
      index2("idx_bh_status").on(table.status),
      index2("idx_bh_scope").on(table.scope),
      index2("idx_bh_created").on(table.createdAt)
    ]);
    integrationConfigs = mysqlTable2("integration_configs", {
      id: varchar2("id", { length: 64 }).primaryKey(),
      provider: varchar2("provider", { length: 100 }).notNull(),
      name: varchar2("name", { length: 200 }),
      service: varchar2("service", { length: 100 }),
      integrationType: varchar2("integrationType", { length: 50 }),
      config: text2("config"),
      status: varchar2("status", { length: 20 }).default("inactive"),
      isActive: tinyint("isActive").notNull().default(1),
      lastSync: timestamp2("lastSync", { mode: "string" }),
      lastSyncAt: timestamp2("lastSyncAt", { mode: "string" }),
      createdBy: varchar2("createdBy", { length: 64 }).notNull(),
      createdAt: timestamp2("createdAt", { mode: "string" }).defaultNow(),
      updatedAt: timestamp2("updatedAt", { mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_ic_provider").on(table.provider),
      index2("idx_ic_active").on(table.isActive),
      index2("idx_ic_status").on(table.status)
    ]);
    designConfigs = mysqlTable2("design_configs", {
      id: varchar2("id", { length: 64 }).primaryKey(),
      configType: varchar2("configType", { length: 100 }).notNull(),
      name: varchar2("name", { length: 200 }),
      theme: varchar2("theme", { length: 50 }),
      config: text2("config"),
      status: varchar2("status", { length: 50 }).notNull().default("ACTIVE"),
      createdBy: varchar2("createdBy", { length: 64 }).notNull(),
      createdAt: timestamp2("createdAt", { mode: "string" }).defaultNow(),
      updatedAt: timestamp2("updatedAt", { mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_dc_type").on(table.configType)
    ]);
    aiInsights = mysqlTable2("ai_insights", {
      id: varchar2("id", { length: 64 }).primaryKey(),
      insightType: varchar2("insightType", { length: 100 }).notNull(),
      title: varchar2("title", { length: 300 }),
      description: text2("description"),
      confidence: decimal("confidence", { precision: 5, scale: 4 }).default("0"),
      impact: varchar2("impact", { length: 50 }).default("MEDIUM"),
      trend: varchar2("trend", { length: 50 }).default("neutral"),
      recommendation: text2("recommendation"),
      entityType: varchar2("entityType", { length: 100 }),
      entityId: varchar2("entityId", { length: 64 }),
      period: varchar2("period", { length: 50 }),
      dataPayload: text2("dataPayload"),
      status: varchar2("status", { length: 50 }).notNull().default("ACTIVE"),
      createdBy: varchar2("createdBy", { length: 64 }).notNull(),
      createdAt: timestamp2("createdAt", { mode: "string" }).defaultNow(),
      updatedAt: timestamp2("updatedAt", { mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_ai_type").on(table.insightType),
      index2("idx_ai_period").on(table.period)
    ]);
    analyticsMetrics = mysqlTable2("analytics_metrics", {
      id: varchar2("id", { length: 64 }).primaryKey(),
      metricName: varchar2("metricName", { length: 200 }).notNull(),
      metricType: varchar2("metricType", { length: 100 }).notNull(),
      value: decimal("value", { precision: 15, scale: 4 }).default("0"),
      unit: varchar2("unit", { length: 50 }),
      period: varchar2("period", { length: 50 }),
      dimensions: text2("dimensions"),
      changePercent: decimal("changePercent", { precision: 10, scale: 2 }).default("0"),
      benchmark: decimal("benchmark", { precision: 15, scale: 4 }),
      dataPayload: text2("dataPayload"),
      status: varchar2("status", { length: 50 }).notNull().default("ACTIVE"),
      createdBy: varchar2("createdBy", { length: 64 }).notNull(),
      createdAt: timestamp2("createdAt", { mode: "string" }).defaultNow(),
      updatedAt: timestamp2("updatedAt", { mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_am_name").on(table.metricName),
      index2("idx_am_type").on(table.metricType)
    ]);
    cohortAnalyses = mysqlTable2("cohort_analyses", {
      id: varchar2("id", { length: 64 }).primaryKey(),
      analysisType: varchar2("analysisType", { length: 100 }).notNull(),
      cohortType: varchar2("cohortType", { length: 50 }),
      name: varchar2("name", { length: 200 }),
      period: varchar2("period", { length: 50 }),
      dataPayload: text2("dataPayload"),
      retentionData: text2("retentionData"),
      funnelData: text2("funnelData"),
      status: varchar2("status", { length: 50 }).notNull().default("ACTIVE"),
      createdBy: varchar2("createdBy", { length: 64 }).notNull(),
      createdAt: timestamp2("createdAt", { mode: "string" }).defaultNow(),
      updatedAt: timestamp2("updatedAt", { mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_ca_type").on(table.analysisType),
      index2("idx_ca_cohort").on(table.cohortType)
    ]);
    executiveReports = mysqlTable2("executive_reports", {
      id: varchar2("id", { length: 64 }).primaryKey(),
      reportType: varchar2("reportType", { length: 100 }).notNull(),
      title: varchar2("title", { length: 300 }),
      period: varchar2("period", { length: 50 }),
      horizon: varchar2("horizon", { length: 50 }),
      dataPayload: text2("dataPayload"),
      status: varchar2("status", { length: 50 }).notNull().default("ACTIVE"),
      recipients: int2("recipients").default(0),
      createdBy: varchar2("createdBy", { length: 64 }).notNull(),
      createdAt: timestamp2("createdAt", { mode: "string" }).defaultNow(),
      updatedAt: timestamp2("updatedAt", { mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_er_type").on(table.reportType),
      index2("idx_er_period").on(table.period)
    ]);
    collaborationSessions = mysqlTable2("collaboration_sessions", {
      id: varchar2("id", { length: 64 }).primaryKey(),
      sessionType: varchar2("sessionType", { length: 100 }).notNull(),
      documentId: varchar2("documentId", { length: 64 }),
      channelId: varchar2("channelId", { length: 64 }),
      userId: varchar2("userId", { length: 64 }),
      message: text2("message"),
      dataPayload: text2("dataPayload"),
      status: varchar2("status", { length: 50 }).notNull().default("ACTIVE"),
      createdBy: varchar2("createdBy", { length: 64 }).notNull(),
      createdAt: timestamp2("createdAt", { mode: "string" }).defaultNow(),
      updatedAt: timestamp2("updatedAt", { mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_cs_type").on(table.sessionType),
      index2("idx_cs_doc").on(table.documentId)
    ]);
    complianceRecords = mysqlTable2("compliance_records", {
      id: varchar2("id", { length: 64 }).primaryKey(),
      recordType: varchar2("recordType", { length: 100 }).notNull(),
      standard: varchar2("standard", { length: 100 }),
      score: int2("score").default(0),
      status: varchar2("status", { length: 50 }).notNull().default("COMPLIANT"),
      findings: text2("findings"),
      dataPayload: text2("dataPayload"),
      createdBy: varchar2("createdBy", { length: 64 }).notNull(),
      createdAt: timestamp2("createdAt", { mode: "string" }).defaultNow(),
      updatedAt: timestamp2("updatedAt", { mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_cr_type").on(table.recordType),
      index2("idx_cr_standard").on(table.standard)
    ]);
    staffChatChannels = mysqlTable2("staffChatChannels", {
      id: varchar2({ length: 64 }).primaryKey(),
      name: varchar2({ length: 100 }).notNull(),
      type: varchar2({ length: 20 }).notNull().default("team"),
      // general, team, private
      description: varchar2({ length: 255 }),
      members: json2().$type().default([]),
      createdBy: varchar2({ length: 64 }).notNull(),
      isActive: tinyint().default(1).notNull(),
      createdAt: timestamp2({ mode: "string" }).defaultNow(),
      updatedAt: timestamp2({ mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_scc_type").on(table.type),
      index2("idx_scc_created_by").on(table.createdBy)
    ]);
    staffChatMessages = mysqlTable2("staffChatMessages", {
      id: varchar2({ length: 64 }).primaryKey(),
      channelId: varchar2({ length: 64 }).default("general"),
      userId: varchar2({ length: 64 }).notNull(),
      userName: varchar2({ length: 255 }).notNull(),
      content: text2().notNull(),
      encryptedKeys: text2(),
      encryptionNonce: varchar2({ length: 64 }),
      encryptionVersion: varchar2({ length: 10 }),
      senderPublicKey: text2(),
      emoji: varchar2({ length: 10 }),
      replyToId: varchar2({ length: 64 }),
      replyToUser: varchar2({ length: 255 }),
      fileUrl: varchar2({ length: 500 }),
      fileName: varchar2({ length: 255 }),
      fileType: varchar2({ length: 50 }),
      isEdited: tinyint().default(0).notNull(),
      createdAt: timestamp2({ mode: "string" }).defaultNow(),
      updatedAt: timestamp2({ mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_scm_user_id").on(table.userId),
      index2("idx_scm_created_at").on(table.createdAt),
      index2("idx_scm_channel_id").on(table.channelId)
    ]);
    cannedResponses = mysqlTable2("canned_responses", {
      id: varchar2("id", { length: 64 }).primaryKey(),
      organizationId: varchar2("organizationId", { length: 64 }),
      category: varchar2("category", { length: 100 }).notNull().default("General"),
      title: varchar2("title", { length: 255 }).notNull(),
      content: text2("content").notNull(),
      shortCode: varchar2("shortCode", { length: 50 }),
      createdBy: varchar2("createdBy", { length: 64 }),
      createdAt: timestamp2("createdAt", { mode: "string" }).defaultNow(),
      updatedAt: timestamp2("updatedAt", { mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_cr_category").on(table.category),
      index2("idx_cr_org").on(table.organizationId)
    ]);
    kbCategories = mysqlTable2("kb_categories", {
      id: varchar2("id", { length: 64 }).primaryKey(),
      organizationId: varchar2("organizationId", { length: 64 }),
      name: varchar2("name", { length: 200 }).notNull(),
      slug: varchar2("slug", { length: 200 }).notNull(),
      description: text2("description"),
      icon: varchar2("icon", { length: 50 }).default("BookOpen"),
      color: varchar2("color", { length: 30 }).default("bg-blue-500"),
      sortOrder: int2("sortOrder").default(0),
      createdAt: timestamp2("createdAt", { mode: "string" }).defaultNow(),
      updatedAt: timestamp2("updatedAt", { mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_kbc_org").on(table.organizationId),
      index2("idx_kbc_slug").on(table.slug)
    ]);
    kbArticles = mysqlTable2("kb_articles", {
      id: varchar2("id", { length: 64 }).primaryKey(),
      organizationId: varchar2("organizationId", { length: 64 }),
      categoryId: varchar2("categoryId", { length: 64 }).notNull(),
      title: varchar2("title", { length: 500 }).notNull(),
      content: text2("content"),
      excerpt: text2("excerpt"),
      status: varchar2("status", { length: 20 }).default("published"),
      featured: tinyint("featured").default(0),
      readTime: int2("readTime").default(3),
      views: int2("views").default(0),
      tags: text2("tags"),
      createdBy: varchar2("createdBy", { length: 64 }),
      createdAt: timestamp2("createdAt", { mode: "string" }).defaultNow(),
      updatedAt: timestamp2("updatedAt", { mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_kba_org").on(table.organizationId),
      index2("idx_kba_cat").on(table.categoryId),
      index2("idx_kba_status").on(table.status)
    ]);
    warehouses = mysqlTable2("warehouses", {
      id: varchar2("id", { length: 64 }).primaryKey(),
      organizationId: varchar2("organizationId", { length: 64 }),
      name: varchar2("name", { length: 200 }).notNull(),
      code: varchar2("code", { length: 50 }),
      address: text2("address"),
      contactPerson: varchar2("contactPerson", { length: 200 }),
      phone: varchar2("phone", { length: 50 }),
      status: varchar2("status", { length: 20 }).default("active"),
      createdAt: timestamp2("createdAt", { mode: "string" }).defaultNow(),
      updatedAt: timestamp2("updatedAt", { mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_wh_org").on(table.organizationId)
    ]);
    stockMovements = mysqlTable2("stock_movements", {
      id: varchar2("id", { length: 64 }).primaryKey(),
      organizationId: varchar2("organizationId", { length: 64 }),
      productId: varchar2("productId", { length: 64 }).notNull(),
      warehouseId: varchar2("warehouseId", { length: 64 }),
      type: varchar2("type", { length: 30 }).notNull(),
      quantity: int2("quantity").notNull(),
      referenceNo: varchar2("referenceNo", { length: 100 }),
      reason: text2("reason"),
      fromWarehouse: varchar2("fromWarehouse", { length: 64 }),
      toWarehouse: varchar2("toWarehouse", { length: 64 }),
      createdBy: varchar2("createdBy", { length: 64 }),
      createdAt: timestamp2("createdAt", { mode: "string" }).defaultNow()
    }, (table) => [
      index2("idx_sm_org").on(table.organizationId),
      index2("idx_sm_product").on(table.productId),
      index2("idx_sm_type").on(table.type)
    ]);
    clientSubscriptions = mysqlTable2("clientSubscriptions", {
      id: varchar2({ length: 64 }).primaryKey(),
      organizationId: varchar2({ length: 64 }),
      clientId: varchar2({ length: 64 }).notNull(),
      name: varchar2({ length: 255 }).notNull(),
      description: text2(),
      status: mysqlEnum(["active", "paused", "cancelled", "expired"]).default("active").notNull(),
      frequency: mysqlEnum(["weekly", "biweekly", "monthly", "quarterly", "annually"]).notNull(),
      amount: int2().notNull(),
      currency: varchar2({ length: 10 }).default("KES"),
      startDate: datetime({ mode: "string" }).notNull(),
      endDate: datetime({ mode: "string" }),
      nextBillingDate: datetime({ mode: "string" }).notNull(),
      lastBilledDate: datetime({ mode: "string" }),
      templateInvoiceId: varchar2({ length: 64 }),
      recurringInvoiceId: varchar2({ length: 64 }),
      autoSendInvoice: tinyint().default(1).notNull(),
      totalBilled: int2().default(0),
      invoiceCount: int2().default(0),
      createdBy: varchar2({ length: 64 }),
      createdAt: timestamp2({ mode: "string" }).defaultNow(),
      updatedAt: timestamp2({ mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_cs_org").on(table.organizationId),
      index2("idx_cs_client").on(table.clientId),
      index2("idx_cs_status").on(table.status),
      index2("idx_cs_next_billing").on(table.nextBillingDate)
    ]);
    systemHealth = mysqlTable2("systemHealth", {
      id: varchar2({ length: 64 }).primaryKey(),
      organizationId: varchar2({ length: 64 }),
      cpuUsage: int2().default(0),
      cpuModel: varchar2({ length: 255 }),
      cpuCores: int2().default(1),
      cpuSpeed: varchar2({ length: 50 }),
      cpuTemperature: int2().default(0),
      memoryUsage: int2().default(0),
      memoryTotal: int2().default(0),
      memoryAvailable: int2().default(0),
      diskUsage: int2().default(0),
      diskTotal: int2().default(0),
      diskUsagePercent: int2().default(0),
      status: mysqlEnum(["healthy", "warning", "critical"]).default("healthy").notNull(),
      systemPlatform: varchar2({ length: 100 }),
      systemDistro: varchar2({ length: 100 }),
      systemRelease: varchar2({ length: 50 }),
      systemArch: varchar2({ length: 50 }),
      systemManufacturer: varchar2({ length: 255 }),
      systemUptime: int2().default(0),
      // hours
      createdAt: timestamp2({ mode: "string" }).defaultNow()
    }, (table) => [
      index2("idx_sh_org").on(table.organizationId),
      index2("idx_sh_status").on(table.status),
      index2("idx_sh_created_at").on(table.createdAt)
    ]);
    systemLogs = mysqlTable2("systemLogs", {
      id: varchar2({ length: 64 }).primaryKey(),
      organizationId: varchar2({ length: 64 }),
      userId: varchar2({ length: 64 }),
      severity: mysqlEnum(["debug", "info", "warning", "error", "critical"]).default("info").notNull(),
      message: text2().notNull(),
      context: text2(),
      // JSON object for additional context
      service: varchar2({ length: 100 }),
      // service name: api, worker, auth, db, etc
      action: varchar2({ length: 100 }),
      // what action was performed
      stackTrace: text2(),
      // for errors
      ipAddress: varchar2({ length: 100 }),
      userAgent: varchar2({ length: 500 }),
      createdAt: timestamp2({ mode: "string" }).defaultNow()
    }, (table) => [
      index2("idx_sl_org").on(table.organizationId),
      index2("idx_sl_user").on(table.userId),
      index2("idx_sl_severity").on(table.severity),
      index2("idx_sl_service").on(table.service),
      index2("idx_sl_created_at").on(table.createdAt)
    ]);
    activeSessions = mysqlTable2("activeSessions", {
      id: varchar2({ length: 64 }).primaryKey(),
      userId: varchar2({ length: 64 }).notNull(),
      userEmail: varchar2({ length: 320 }).notNull(),
      organizationId: varchar2({ length: 64 }),
      ipAddress: varchar2({ length: 100 }).notNull(),
      userAgent: varchar2({ length: 500 }).notNull(),
      deviceType: varchar2({ length: 50 }),
      // desktop, mobile, tablet
      browser: varchar2({ length: 100 }),
      browserVersion: varchar2({ length: 50 }),
      operatingSystem: varchar2({ length: 100 }),
      osVersion: varchar2({ length: 50 }),
      tokenHash: varchar2({ length: 255 }),
      // hash of session token
      lastActivity: timestamp2({ mode: "string" }),
      expiresAt: timestamp2({ mode: "string" }).notNull(),
      createdAt: timestamp2({ mode: "string" }).defaultNow()
    }, (table) => [
      index2("idx_as_user").on(table.userId),
      index2("idx_as_org").on(table.organizationId),
      index2("idx_as_expires_at").on(table.expiresAt),
      index2("idx_as_created_at").on(table.createdAt)
    ]);
    departmentHierarchies = mysqlTable2("departmentHierarchies", {
      id: varchar2({ length: 64 }).primaryKey(),
      organizationId: varchar2({ length: 64 }).notNull(),
      parentDepartmentId: varchar2({ length: 64 }),
      departmentId: varchar2({ length: 64 }).notNull(),
      level: int2().default(0),
      path: varchar2({ length: 500 }),
      // materialized path for hierarchy queries
      createdAt: timestamp2({ mode: "string" }).defaultNow()
    }, (table) => [
      index2("idx_dh_org").on(table.organizationId),
      index2("idx_dh_parent").on(table.parentDepartmentId),
      index2("idx_dh_dept").on(table.departmentId)
    ]);
    employeePromotions = mysqlTable2("employeePromotions", {
      id: varchar2({ length: 64 }).primaryKey(),
      organizationId: varchar2({ length: 64 }).notNull(),
      employeeId: varchar2({ length: 64 }).notNull(),
      promotionDate: datetime({ mode: "string" }).notNull(),
      previousJobGroupId: varchar2({ length: 64 }).notNull(),
      newJobGroupId: varchar2({ length: 64 }).notNull(),
      previousSalary: int2().notNull(),
      newSalary: int2().notNull(),
      promotionReason: text2(),
      approvedBy: varchar2({ length: 64 }),
      approvalDate: datetime({ mode: "string" }),
      notes: text2(),
      createdAt: timestamp2({ mode: "string" }).defaultNow()
    }, (table) => [
      index2("idx_ep_org").on(table.organizationId),
      index2("idx_ep_employee").on(table.employeeId),
      index2("idx_ep_date").on(table.promotionDate)
    ]);
    employeeTransfers = mysqlTable2("employeeTransfers", {
      id: varchar2({ length: 64 }).primaryKey(),
      organizationId: varchar2({ length: 64 }).notNull(),
      employeeId: varchar2({ length: 64 }).notNull(),
      transferDate: datetime({ mode: "string" }).notNull(),
      previousDepartmentId: varchar2({ length: 64 }),
      newDepartmentId: varchar2({ length: 64 }).notNull(),
      transferReason: text2(),
      approvedBy: varchar2({ length: 64 }),
      approvalDate: datetime({ mode: "string" }),
      notes: text2(),
      createdAt: timestamp2({ mode: "string" }).defaultNow()
    }, (table) => [
      index2("idx_et_org").on(table.organizationId),
      index2("idx_et_employee").on(table.employeeId),
      index2("idx_et_date").on(table.transferDate)
    ]);
    timesheets = mysqlTable2("timesheets", {
      id: varchar2({ length: 64 }).primaryKey(),
      organizationId: varchar2({ length: 64 }).notNull(),
      employeeId: varchar2({ length: 64 }).notNull(),
      weekStartDate: datetime({ mode: "string" }).notNull(),
      weekEndDate: datetime({ mode: "string" }).notNull(),
      monday: int2().default(0),
      // hours
      tuesday: int2().default(0),
      wednesday: int2().default(0),
      thursday: int2().default(0),
      friday: int2().default(0),
      saturday: int2().default(0),
      sunday: int2().default(0),
      totalHours: int2().default(0),
      projectIds: text2(),
      // JSON array
      notes: text2(),
      status: mysqlEnum(["draft", "submitted", "approved", "rejected"]).default("draft").notNull(),
      submittedBy: varchar2({ length: 64 }),
      submittedAt: datetime({ mode: "string" }),
      approvedBy: varchar2({ length: 64 }),
      approvedAt: datetime({ mode: "string" }),
      rejectionReason: text2(),
      createdAt: timestamp2({ mode: "string" }).defaultNow(),
      updatedAt: timestamp2({ mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_ts_org").on(table.organizationId),
      index2("idx_ts_employee").on(table.employeeId),
      index2("idx_ts_week").on(table.weekStartDate),
      index2("idx_ts_status").on(table.status)
    ]);
    payrollBatches = mysqlTable2("payrollBatches", {
      id: varchar2({ length: 64 }).primaryKey(),
      organizationId: varchar2({ length: 64 }).notNull(),
      batchNumber: varchar2({ length: 50 }).notNull().unique(),
      payMonth: datetime({ mode: "string" }).notNull(),
      payPeriodStart: datetime({ mode: "string" }).notNull(),
      payPeriodEnd: datetime({ mode: "string" }).notNull(),
      employeeCount: int2().default(0),
      totalGross: int2().default(0),
      totalDeductions: int2().default(0),
      totalNet: int2().default(0),
      status: mysqlEnum(["draft", "calculated", "approved", "processed", "paid"]).default("draft").notNull(),
      createdBy: varchar2({ length: 64 }).notNull(),
      approvedBy: varchar2({ length: 64 }),
      approvalDate: datetime({ mode: "string" }),
      processedBy: varchar2({ length: 64 }),
      processedDate: datetime({ mode: "string" }),
      notes: text2(),
      createdAt: timestamp2({ mode: "string" }).defaultNow(),
      updatedAt: timestamp2({ mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_pb_org").on(table.organizationId),
      index2("idx_pb_month").on(table.payMonth),
      index2("idx_pb_status").on(table.status),
      index2("idx_pb_number").on(table.batchNumber)
    ]);
    payrollDetails = mysqlTable2("payrollDetails", {
      id: varchar2({ length: 64 }).primaryKey(),
      organizationId: varchar2({ length: 64 }).notNull(),
      batchId: varchar2({ length: 64 }).notNull(),
      employeeId: varchar2({ length: 64 }).notNull(),
      payMonth: datetime({ mode: "string" }).notNull(),
      basicSalary: int2().notNull(),
      allowances: int2().default(0),
      // housing, travel, etc
      bonuses: int2().default(0),
      grossSalary: int2().notNull(),
      countryCode: varchar2({ length: 5 }).default("KE"),
      currencyLabel: varchar2({ length: 10 }).default("KES"),
      nssfDeduction: int2().default(0),
      // 6% of basic
      nhifDeduction: int2().default(0),
      // tiered
      payeDeduction: int2().default(0),
      // progressive tax
      loanDeduction: int2().default(0),
      otherDeductions: int2().default(0),
      totalDeductions: int2().notNull(),
      netSalary: int2().notNull(),
      paymentMethod: varchar2({ length: 50 }),
      // bank, cash, cheque
      paymentReference: varchar2({ length: 100 }),
      status: mysqlEnum(["draft", "approved", "paid", "pending"]).default("draft").notNull(),
      paidDate: datetime({ mode: "string" }),
      createdAt: timestamp2({ mode: "string" }).defaultNow(),
      updatedAt: timestamp2({ mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_pd_org").on(table.organizationId),
      index2("idx_pd_batch").on(table.batchId),
      index2("idx_pd_employee").on(table.employeeId),
      index2("idx_pd_month").on(table.payMonth),
      index2("idx_pd_status").on(table.status)
    ]);
    scheduledJobs = mysqlTable2("scheduledJobs", {
      id: varchar2({ length: 64 }).primaryKey(),
      organizationId: varchar2({ length: 64 }).notNull(),
      jobName: varchar2({ length: 255 }).notNull(),
      jobType: varchar2({ length: 100 }).notNull(),
      schedule: varchar2({ length: 255 }).notNull(),
      // cron expression
      description: text2(),
      cronExpression: varchar2({ length: 255 }),
      handler: varchar2({ length: 255 }),
      status: mysqlEnum(["active", "inactive", "paused"]).default("active").notNull(),
      isActive: tinyint().default(1).notNull(),
      isManualOnly: tinyint().default(0).notNull(),
      lastRun: timestamp2({ mode: "string" }),
      nextRun: timestamp2({ mode: "string" }),
      lastExecutedAt: timestamp2({ mode: "string" }),
      nextExecutionAt: timestamp2({ mode: "string" }),
      lastRunAt: timestamp2({ mode: "string" }),
      lastRunStatus: mysqlEnum(["success", "failed", "partial", "timeout"]),
      lastRunDuration: int2(),
      nextScheduledRun: timestamp2({ mode: "string" }),
      lastFailureReason: text2(),
      failureCount: int2().default(0),
      timezone: varchar2({ length: 100 }).default("UTC"),
      createdBy: varchar2({ length: 64 }),
      createdAt: timestamp2({ mode: "string" }).defaultNow(),
      updatedAt: timestamp2({ mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_org_id").on(table.organizationId),
      index2("idx_status").on(table.status)
    ]);
    jobExecutionLogs = mysqlTable2("jobExecutionLogs", {
      id: varchar2({ length: 64 }).primaryKey(),
      jobId: varchar2({ length: 64 }).notNull(),
      status: mysqlEnum(["pending", "running", "completed", "failed", "success", "partial", "timeout"]).default("pending").notNull(),
      startTime: timestamp2({ mode: "string" }),
      startedAt: timestamp2({ mode: "string" }),
      completedAt: timestamp2({ mode: "string" }),
      executedAt: timestamp2({ mode: "string" }),
      endTime: timestamp2({ mode: "string" }),
      duration: int2(),
      durationMs: int2(),
      itemsProcessed: int2().default(0),
      itemsFailed: int2().default(0),
      itemsSkipped: int2().default(0),
      errorMessage: text2(),
      stdout: longtext(),
      stderr: longtext(),
      metadata: json2(),
      createdAt: timestamp2({ mode: "string" }).defaultNow()
    }, (table) => [
      index2("idx_job_id").on(table.jobId),
      index2("idx_status").on(table.status)
    ]);
    jobAlertRules = mysqlTable2("jobAlertRules", {
      id: varchar2({ length: 64 }).primaryKey(),
      jobId: varchar2({ length: 64 }).notNull(),
      alertType: mysqlEnum(["failure", "timeout", "performance"]).notNull(),
      threshold: int2(),
      triggerCondition: varchar2({ length: 100 }),
      failureThreshold: int2(),
      durationThresholdMs: int2(),
      notificationChannels: json2(),
      recipients: json2(),
      action: varchar2({ length: 100 }),
      isActive: tinyint().default(1).notNull(),
      createdAt: timestamp2({ mode: "string" }).defaultNow()
    }, (table) => [
      index2("idx_job_id").on(table.jobId)
    ]);
    jobAlertHistory = mysqlTable2("jobAlertHistory", {
      id: varchar2({ length: 64 }).primaryKey(),
      ruleId: varchar2({ length: 64 }).notNull(),
      alertRuleId: varchar2({ length: 64 }),
      alertMessage: text2(),
      message: text2(),
      sentAt: timestamp2({ mode: "string" }).defaultNow(),
      alert_sent_at: timestamp2({ mode: "string" }),
      recipients: json2()
    }, (table) => [
      index2("idx_rule_id").on(table.ruleId)
    ]);
    jobHeartbeat = mysqlTable2("jobHeartbeat", {
      id: varchar2({ length: 64 }).primaryKey(),
      jobId: varchar2({ length: 64 }).notNull().unique(),
      lastHeartbeatAt: timestamp2({ mode: "string" }).defaultNow(),
      checkedAt: timestamp2({ mode: "string" }),
      expectedHeartbeatInterval: int2(),
      isHealthy: tinyint().default(1),
      consecutiveFailures: int2().default(0),
      updatedAt: timestamp2({ mode: "string" }).defaultNow().onUpdateNow(),
      createdAt: timestamp2({ mode: "string" }).defaultNow()
    }, (table) => [
      index2("idx_heartbeat_job_id").on(table.jobId),
      index2("idx_heartbeat_healthy").on(table.isHealthy)
    ]);
    customFields = mysqlTable2("customFields", {
      id: varchar2({ length: 64 }).primaryKey(),
      organizationId: varchar2({ length: 64 }).notNull(),
      entityType: varchar2({ length: 100 }).notNull(),
      // 'invoice', 'client', 'project', etc
      fieldName: varchar2({ length: 255 }).notNull(),
      fieldType: mysqlEnum(["text", "number", "date", "select", "checkbox"]).notNull(),
      isRequired: tinyint().default(0),
      displayOrder: int2().default(0),
      isActive: tinyint().default(1).notNull(),
      createdAt: timestamp2({ mode: "string" }).defaultNow(),
      updatedAt: timestamp2({ mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_org_id").on(table.organizationId),
      index2("idx_entity_type").on(table.entityType)
    ]);
    fieldValidations = mysqlTable2("fieldValidations", {
      id: varchar2({ length: 64 }).primaryKey(),
      fieldId: varchar2({ length: 64 }).notNull(),
      validationType: varchar2({ length: 100 }).notNull(),
      // 'regex', 'minLength', 'maxLength', etc
      validationValue: text2(),
      createdAt: timestamp2({ mode: "string" }).defaultNow()
    }, (table) => [
      index2("idx_field_id").on(table.fieldId)
    ]);
    fieldValues = mysqlTable2("fieldValues", {
      id: varchar2({ length: 64 }).primaryKey(),
      fieldId: varchar2({ length: 64 }).notNull(),
      entityId: varchar2({ length: 64 }).notNull(),
      value: longtext(),
      createdAt: timestamp2({ mode: "string" }).defaultNow(),
      updatedAt: timestamp2({ mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_field_id").on(table.fieldId),
      index2("idx_entity_id").on(table.entityId)
    ]);
    stripeCustomers = mysqlTable2("stripeCustomers", {
      id: varchar2({ length: 64 }).primaryKey(),
      organizationId: varchar2({ length: 64 }).notNull(),
      clientId: varchar2({ length: 64 }),
      stripeCustomerId: varchar2({ length: 255 }).notNull().unique(),
      email: varchar2({ length: 320 }).notNull(),
      status: mysqlEnum(["active", "inactive"]).default("active").notNull(),
      metadata: json2(),
      createdAt: timestamp2({ mode: "string" }).defaultNow(),
      updatedAt: timestamp2({ mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_org_id").on(table.organizationId),
      index2("idx_stripe_id").on(table.stripeCustomerId)
    ]);
    stripePaymentIntents = mysqlTable2("stripePaymentIntents", {
      id: varchar2({ length: 64 }).primaryKey(),
      invoiceId: varchar2({ length: 64 }).notNull(),
      stripePaymentIntentId: varchar2({ length: 255 }).notNull().unique(),
      clientId: varchar2({ length: 64 }),
      amount: int2().notNull(),
      currency: varchar2({ length: 10 }).default("usd").notNull(),
      status: mysqlEnum(["requires_payment_method", "requires_confirmation", "requires_action", "processing", "requires_capture", "canceled", "succeeded"]).default("requires_payment_method").notNull(),
      clientSecret: varchar2({ length: 255 }),
      receiptEmail: varchar2({ length: 320 }),
      metadata: json2(),
      createdAt: timestamp2({ mode: "string" }).defaultNow(),
      updatedAt: timestamp2({ mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_invoice_id").on(table.invoiceId),
      index2("idx_stripe_intent_id").on(table.stripePaymentIntentId),
      index2("idx_status").on(table.status)
    ]);
    mpesaTransactions = mysqlTable2("mpesaTransactions", {
      id: varchar2({ length: 64 }).primaryKey(),
      invoiceId: varchar2({ length: 64 }),
      transactionId: varchar2({ length: 100 }).notNull().unique(),
      checkoutRequestId: varchar2({ length: 100 }),
      amount: int2().notNull(),
      phoneNumber: varchar2({ length: 20 }).notNull(),
      status: mysqlEnum(["pending", "completed", "failed"]).default("pending").notNull(),
      mpesaReceiptNumber: varchar2({ length: 100 }),
      resultCode: int2(),
      transactionTime: timestamp2({ mode: "string" }),
      createdAt: timestamp2({ mode: "string" }).defaultNow()
    }, (table) => [
      index2("idx_invoice_id").on(table.invoiceId),
      index2("idx_transaction_id").on(table.transactionId),
      index2("idx_status").on(table.status)
    ]);
    stripeWebhookEvents = mysqlTable2("stripeWebhookEvents", {
      id: varchar2({ length: 64 }).primaryKey(),
      stripeEventId: varchar2({ length: 255 }).notNull().unique(),
      type: varchar2({ length: 100 }).notNull(),
      data: json2(),
      processed: tinyint().default(0).notNull(),
      processedAt: timestamp2({ mode: "string" }),
      createdAt: timestamp2({ mode: "string" }).defaultNow()
    });
    lpos = mysqlTable2("lpos", {
      id: varchar2({ length: 64 }).primaryKey(),
      organizationId: varchar2({ length: 64 }).notNull(),
      lpoNumber: varchar2({ length: 100 }).notNull().unique(),
      supplierId: varchar2({ length: 64 }).notNull(),
      issueDate: datetime({ mode: "string" }).notNull(),
      deliveryDate: datetime({ mode: "string" }),
      totalAmount: int2().notNull(),
      status: mysqlEnum(["draft", "issued", "acknowledged", "partially_received", "received", "cancelled"]).default("draft").notNull(),
      createdBy: varchar2({ length: 64 }).notNull(),
      createdAt: timestamp2({ mode: "string" }).defaultNow(),
      updatedAt: timestamp2({ mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_lpo_number").on(table.lpoNumber),
      index2("idx_supplier_id").on(table.supplierId),
      index2("idx_status").on(table.status)
    ]);
    orders = mysqlTable2("orders", {
      id: varchar2({ length: 64 }).primaryKey(),
      organizationId: varchar2({ length: 64 }).notNull(),
      orderNumber: varchar2({ length: 100 }).notNull().unique(),
      clientId: varchar2({ length: 64 }).notNull(),
      orderDate: datetime({ mode: "string" }).notNull(),
      deliveryDate: datetime({ mode: "string" }),
      totalAmount: int2().notNull(),
      status: mysqlEnum(["draft", "pending", "confirmed", "shipped", "delivered", "cancelled"]).default("draft").notNull(),
      createdBy: varchar2({ length: 64 }).notNull(),
      createdAt: timestamp2({ mode: "string" }).defaultNow(),
      updatedAt: timestamp2({ mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_order_number").on(table.orderNumber),
      index2("idx_client_id").on(table.clientId),
      index2("idx_status").on(table.status)
    ]);
    payslips = mysqlTable2("payslips", {
      id: varchar2({ length: 64 }).primaryKey(),
      organizationId: varchar2({ length: 64 }).notNull(),
      payrollDetailId: varchar2({ length: 64 }).notNull(),
      employeeId: varchar2({ length: 64 }).notNull(),
      payslipNumber: varchar2({ length: 50 }).notNull().unique(),
      payMonth: datetime({ mode: "string" }).notNull(),
      basicSalary: int2().notNull(),
      allowances: int2().default(0),
      bonuses: int2().default(0),
      grossSalary: int2().notNull(),
      countryCode: varchar2({ length: 5 }).default("KE"),
      currencyLabel: varchar2({ length: 10 }).default("KES"),
      nssfDeduction: int2().default(0),
      nhifDeduction: int2().default(0),
      payeDeduction: int2().default(0),
      loanDeduction: int2().default(0),
      otherDeductions: int2().default(0),
      totalDeductions: int2().notNull(),
      netSalary: int2().notNull(),
      bankAccountNumber: varchar2({ length: 100 }),
      bankName: varchar2({ length: 255 }),
      status: mysqlEnum(["generated", "sent", "viewed", "downloaded"]).default("generated").notNull(),
      sentAt: datetime({ mode: "string" }),
      viewedAt: datetime({ mode: "string" }),
      downloadedAt: datetime({ mode: "string" }),
      notes: text2(),
      createdAt: timestamp2({ mode: "string" }).defaultNow()
    }, (table) => [
      index2("idx_ps_org").on(table.organizationId),
      index2("idx_ps_employee").on(table.employeeId),
      index2("idx_ps_number").on(table.payslipNumber),
      index2("idx_ps_month").on(table.payMonth)
    ]);
    leaveBalances = mysqlTable2("leaveBalances", {
      id: varchar2({ length: 64 }).primaryKey(),
      organizationId: varchar2({ length: 64 }).notNull(),
      employeeId: varchar2({ length: 64 }).notNull(),
      fiscalYear: int2().notNull(),
      leaveType: mysqlEnum(["annual", "sick", "maternity", "paternity", "unpaid", "compassion"]).notNull(),
      totalEntitlement: int2().notNull(),
      // days per year
      accrued: int2().default(0),
      // days accrued so far
      used: int2().default(0),
      // days used
      pending: int2().default(0),
      // pending approval
      carryover: int2().default(0),
      // carried over from previous year
      available: int2().default(0),
      // available to take
      lastAccrualDate: datetime({ mode: "string" }),
      notes: text2(),
      createdAt: timestamp2({ mode: "string" }).defaultNow(),
      updatedAt: timestamp2({ mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_lb_org").on(table.organizationId),
      index2("idx_lb_employee").on(table.employeeId),
      index2("idx_lb_year").on(table.fiscalYear),
      index2("idx_lb_type").on(table.leaveType)
    ]);
    leaveApprovals = mysqlTable2("leaveApprovals", {
      id: varchar2({ length: 64 }).primaryKey(),
      organizationId: varchar2({ length: 64 }).notNull(),
      leaveRequestId: varchar2({ length: 64 }).notNull(),
      approverId: varchar2({ length: 64 }).notNull(),
      approvalStatus: mysqlEnum(["pending", "approved", "rejected"]).notNull(),
      approvalComments: text2(),
      approvalDate: datetime({ mode: "string" }),
      createdAt: timestamp2({ mode: "string" }).defaultNow()
    }, (table) => [
      index2("idx_la_org").on(table.organizationId),
      index2("idx_la_leave").on(table.leaveRequestId),
      index2("idx_la_approver").on(table.approverId)
    ]);
    taxCompliance = mysqlTable2("taxCompliance", {
      id: varchar2({ length: 64 }).primaryKey(),
      organizationId: varchar2({ length: 64 }).notNull(),
      employeeId: varchar2({ length: 64 }).notNull(),
      taxYear: int2().notNull(),
      grossIncome: int2().default(0),
      nssfAmount: int2().default(0),
      taxableIncome: int2().default(0),
      payeDeducted: int2().default(0),
      nhifAmount: int2().default(0),
      reliefs: int2().default(0),
      taxDue: int2().default(0),
      taxPaid: int2().default(0),
      balanceDue: int2().default(0),
      p9aGenerated: tinyint().default(0),
      p9bGenerated: tinyint().default(0),
      p9cGenerated: tinyint().default(0),
      kraSubmitted: tinyint().default(0),
      submissionDate: datetime({ mode: "string" }),
      status: mysqlEnum(["draft", "generated", "submitted", "approved"]).default("draft").notNull(),
      notes: text2(),
      createdAt: timestamp2({ mode: "string" }).defaultNow(),
      updatedAt: timestamp2({ mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_tc_org").on(table.organizationId),
      index2("idx_tc_employee").on(table.employeeId),
      index2("idx_tc_year").on(table.taxYear),
      index2("idx_tc_status").on(table.status)
    ]);
    holidays = mysqlTable2("holidays", {
      id: varchar2({ length: 64 }).primaryKey(),
      organizationId: varchar2({ length: 64 }).notNull(),
      name: varchar2({ length: 255 }).notNull(),
      date: datetime({ mode: "string" }).notNull(),
      type: mysqlEnum(["national", "company", "regional", "optional"]).default("national").notNull(),
      isPublic: tinyint().default(1),
      description: text2(),
      appliesTo: varchar2({ length: 100 }),
      // all, specific department, etc
      isApproved: tinyint().default(1),
      approvedBy: varchar2({ length: 64 }),
      createdBy: varchar2({ length: 64 }).notNull(),
      createdAt: timestamp2({ mode: "string" }).defaultNow(),
      updatedAt: timestamp2({ mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_h_org").on(table.organizationId),
      index2("idx_h_date").on(table.date),
      index2("idx_h_type").on(table.type)
    ]);
    trainingCourses = mysqlTable2("trainingCourses", {
      id: varchar2({ length: 64 }).primaryKey(),
      organizationId: varchar2({ length: 64 }).notNull(),
      courseName: varchar2({ length: 255 }).notNull(),
      description: text2(),
      courseType: mysqlEnum(["internal", "external", "online", "workshop"]).default("internal").notNull(),
      provider: varchar2({ length: 255 }),
      durationDays: int2().default(1),
      cost: int2().default(0),
      startDate: datetime({ mode: "string" }),
      endDate: datetime({ mode: "string" }),
      location: varchar2({ length: 255 }),
      maxParticipants: int2().default(0),
      certificateRequired: tinyint().default(0),
      status: mysqlEnum(["draft", "active", "completed", "cancelled"]).default("active").notNull(),
      createdBy: varchar2({ length: 64 }).notNull(),
      createdAt: timestamp2({ mode: "string" }).defaultNow(),
      updatedAt: timestamp2({ mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_tc_org").on(table.organizationId),
      index2("idx_tc_type").on(table.courseType),
      index2("idx_tc_status").on(table.status)
    ]);
    trainingEnrollments = mysqlTable2("trainingEnrollments", {
      id: varchar2({ length: 64 }).primaryKey(),
      organizationId: varchar2({ length: 64 }).notNull(),
      courseId: varchar2({ length: 64 }).notNull(),
      employeeId: varchar2({ length: 64 }).notNull(),
      enrollmentDate: datetime({ mode: "string" }).notNull(),
      status: mysqlEnum(["enrolled", "in_progress", "completed", "dropped", "passed", "failed"]).default("enrolled").notNull(),
      attendancePercentage: int2().default(0),
      score: int2().default(0),
      certificateIssued: tinyint().default(0),
      certificateDate: datetime({ mode: "string" }),
      certificateUrl: varchar2({ length: 500 }),
      feedback: text2(),
      createdAt: timestamp2({ mode: "string" }).defaultNow(),
      updatedAt: timestamp2({ mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_te_org").on(table.organizationId),
      index2("idx_te_course").on(table.courseId),
      index2("idx_te_employee").on(table.employeeId),
      index2("idx_te_status").on(table.status)
    ]);
    onboardingChecklists = mysqlTable2("onboardingChecklists", {
      id: varchar2({ length: 64 }).primaryKey(),
      organizationId: varchar2({ length: 64 }).notNull(),
      employeeId: varchar2({ length: 64 }).notNull(),
      jobGroupId: varchar2({ length: 64 }).notNull(),
      startDate: datetime({ mode: "string" }).notNull(),
      probationEndDate: datetime({ mode: "string" }),
      overallProgress: int2().default(0),
      // percentage
      status: mysqlEnum(["in_progress", "completed", "paused"]).default("in_progress").notNull(),
      completedDate: datetime({ mode: "string" }),
      notes: text2(),
      createdAt: timestamp2({ mode: "string" }).defaultNow(),
      updatedAt: timestamp2({ mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_oc_org").on(table.organizationId),
      index2("idx_oc_employee").on(table.employeeId),
      index2("idx_oc_status").on(table.status)
    ]);
    onboardingTasks = mysqlTable2("onboardingTasks", {
      id: varchar2({ length: 64 }).primaryKey(),
      organizationId: varchar2({ length: 64 }).notNull(),
      checklistId: varchar2({ length: 64 }).notNull(),
      taskName: varchar2({ length: 255 }).notNull(),
      category: mysqlEnum(["it_setup", "paperwork", "training", "introduction", "other"]).default("other").notNull(),
      description: text2(),
      assignedTo: varchar2({ length: 64 }),
      // HR, Manager, IT, etc.
      dueDate: datetime({ mode: "string" }),
      completedDate: datetime({ mode: "string" }),
      completedBy: varchar2({ length: 64 }),
      status: mysqlEnum(["pending", "in_progress", "completed", "skipped"]).default("pending").notNull(),
      priority: mysqlEnum(["low", "medium", "high"]).default("medium").notNull(),
      notes: text2(),
      createdAt: timestamp2({ mode: "string" }).defaultNow(),
      updatedAt: timestamp2({ mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_ot_org").on(table.organizationId),
      index2("idx_ot_checklist").on(table.checklistId),
      index2("idx_ot_category").on(table.category),
      index2("idx_ot_status").on(table.status)
    ]);
    employeeSkills = mysqlTable2("employeeSkills", {
      id: varchar2({ length: 64 }).primaryKey(),
      organizationId: varchar2({ length: 64 }).notNull(),
      employeeId: varchar2({ length: 64 }).notNull(),
      skillName: varchar2({ length: 255 }).notNull(),
      proficiencyLevel: mysqlEnum(["beginner", "intermediate", "advanced", "expert"]).default("beginner").notNull(),
      yearsOfExperience: int2().default(0),
      certifications: text2(),
      // JSON array
      lastAssessmentDate: datetime({ mode: "string" }),
      endorsements: int2().default(0),
      createdAt: timestamp2({ mode: "string" }).defaultNow(),
      updatedAt: timestamp2({ mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_es_org").on(table.organizationId),
      index2("idx_es_employee").on(table.employeeId),
      index2("idx_es_skill").on(table.skillName)
    ]);
    hrSettings = mysqlTable2("hrSettings", {
      id: varchar2({ length: 64 }).primaryKey(),
      organizationId: varchar2({ length: 64 }).notNull(),
      annualLeaveEntitlement: int2().default(21),
      sickLeaveEntitlement: int2().default(10),
      probationMonths: int2().default(3),
      maxLeaveCarryover: int2().default(5),
      nssfContributionRate: int2().default(6),
      // percentage of basic
      nhifTiered: tinyint().default(1),
      // use tiered NHIF
      defaultPaymentMethod: varchar2({ length: 50 }).default("bank_transfer"),
      autoGeneratePayslips: tinyint().default(1),
      autoAccrueLeave: tinyint().default(1),
      leaveAccrualDay: int2().default(1),
      // day of month
      payrollDay: int2().default(20),
      // day of month for payroll processing
      countryCode: varchar2({ length: 5 }).default("KE"),
      payrollRegion: varchar2({ length: 50 }).default("east_africa"),
      leavePolicy: json2().default({ annual: 21, sick: 10, maxCarryover: 5, accrualRatePerMonth: 2 }),
      statutoryReportTemplates: json2().default({ payslip: "standard", taxForm: "P9", auditTrail: "standard" }),
      statutoryAuditingEnabled: tinyint().default(1),
      autoApprovePayroll: tinyint().default(0),
      createdAt: timestamp2({ mode: "string" }).defaultNow(),
      updatedAt: timestamp2({ mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_hs_org").on(table.organizationId)
    ]);
    approvalWorkflows2 = mysqlTable2("approvalWorkflows", {
      id: varchar2({ length: 64 }).primaryKey(),
      organizationId: varchar2({ length: 64 }).notNull(),
      workflowType: mysqlEnum(["leave_request", "expense_report", "payroll_batch", "promotion", "transfer"]).notNull(),
      entityId: varchar2({ length: 64 }).notNull(),
      requestedBy: varchar2({ length: 64 }).notNull(),
      requestedAt: datetime({ mode: "string" }).notNull(),
      currentApprover: varchar2({ length: 64 }),
      approverLevel: int2().default(1),
      approverComments: text2(),
      status: mysqlEnum(["pending", "approved", "rejected", "recalled"]).default("pending").notNull(),
      approvedAt: datetime({ mode: "string" }),
      approvedBy: varchar2({ length: 64 }),
      escalated: tinyint().default(0),
      escalationReason: text2(),
      createdAt: timestamp2({ mode: "string" }).defaultNow(),
      updatedAt: timestamp2({ mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_aw_org").on(table.organizationId),
      index2("idx_aw_type").on(table.workflowType),
      index2("idx_aw_status").on(table.status),
      index2("idx_aw_entity").on(table.entityId)
    ]);
    permissionAuditLogs = mysqlTable2("permissionAuditLogs", {
      id: varchar2({ length: 64 }).primaryKey(),
      userId: varchar2({ length: 64 }).notNull(),
      orgId: varchar2({ length: 64 }).notNull(),
      feature: varchar2({ length: 100 }).notNull(),
      action: mysqlEnum(["CHECK", "GRANT", "DENY", "CREATE", "UPDATE", "DELETE", "DELEGATE"]).notNull(),
      allowed: tinyint().notNull(),
      reason: text2(),
      metadata: json2(),
      ipAddress: varchar2({ length: 45 }),
      userAgent: text2(),
      timestamp: timestamp2({ mode: "string" }).defaultNow()
    }, (table) => [
      index2("idx_pal_user").on(table.userId),
      index2("idx_pal_org").on(table.orgId),
      index2("idx_pal_feature").on(table.feature),
      index2("idx_pal_timestamp").on(table.timestamp)
    ]);
    permissionDelegations = mysqlTable2("permissionDelegations", {
      id: varchar2({ length: 64 }).primaryKey(),
      fromUserId: varchar2({ length: 64 }).notNull(),
      toUserId: varchar2({ length: 64 }).notNull(),
      orgId: varchar2({ length: 64 }).notNull(),
      features: json2().notNull(),
      // Array of feature keys
      startDate: datetime({ mode: "string" }).notNull(),
      endDate: datetime({ mode: "string" }).notNull(),
      reason: text2(),
      status: mysqlEnum(["active", "expired", "revoked"]).default("active").notNull(),
      createdAt: timestamp2({ mode: "string" }).defaultNow(),
      updatedAt: timestamp2({ mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_pd_from_user").on(table.fromUserId),
      index2("idx_pd_to_user").on(table.toUserId),
      index2("idx_pd_org").on(table.orgId),
      index2("idx_pd_status").on(table.status),
      index2("idx_pd_end_date").on(table.endDate)
    ]);
    paymentTriggers = mysqlTable2("paymentTriggers", {
      id: varchar2({ length: 64 }).primaryKey(),
      organizationId: varchar2({ length: 64 }).notNull(),
      invoiceId: varchar2({ length: 64 }),
      triggerType: varchar2({ length: 100 }).notNull(),
      triggerDate: timestamp2({ mode: "string" }),
      isActive: tinyint().default(1),
      status: varchar2({ length: 50 }).default("pending"),
      actionType: varchar2({ length: 100 }).default("invoice_generate"),
      amount: decimal({ precision: 10, scale: 2 }),
      description: text2(),
      metadata: json2(),
      retryCount: int2().default(0),
      lastRetryAt: timestamp2({ mode: "string" }),
      nextRetryAt: timestamp2({ mode: "string" }),
      completedAt: timestamp2({ mode: "string" }),
      errorMessage: text2(),
      createdAt: timestamp2({ mode: "string" }).defaultNow(),
      updatedAt: timestamp2({ mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_payment_triggers_org").on(table.organizationId),
      index2("idx_payment_triggers_date").on(table.triggerDate),
      index2("idx_payment_triggers_status").on(table.status)
    ]);
  }
});

// drizzle/schema-extended.ts
var schema_extended_exports = {};
__export(schema_extended_exports, {
  auditLogs: () => auditLogs2,
  automationConfigs: () => automationConfigs2,
  budgetAllocations: () => budgetAllocations,
  communicationLogs: () => communicationLogs2,
  deliveryNoteLineItems: () => deliveryNoteLineItems,
  departmentBudgets: () => departmentBudgets,
  departmentalHeads: () => departmentalHeads,
  employeeBenefits: () => employeeBenefits,
  employeeDepartmentMovements: () => employeeDepartmentMovements,
  employeeDisciplinaryActions: () => employeeDisciplinaryActions,
  employeeTaxInfo: () => employeeTaxInfo,
  goodsReceiptNotes: () => goodsReceiptNotes2,
  grnLineItems: () => grnLineItems,
  guestClients: () => guestClients2,
  imprestSurrenders: () => imprestSurrenders2,
  imprests: () => imprests2,
  inventoryTransactions: () => inventoryTransactions2,
  invoicePayments: () => invoicePayments,
  journalEntries: () => journalEntries2,
  journalEntryLines: () => journalEntryLines2,
  journalEntryReconciliations: () => journalEntryReconciliations,
  leads: () => leads2,
  ledgerBudgets: () => ledgerBudgets,
  lineItems: () => lineItems2,
  lpoLineItems: () => lpoLineItems,
  lpos: () => lpos2,
  organizationAccountingPolicies: () => organizationAccountingPolicies2,
  organizationMembers: () => organizationMembers,
  p9Forms: () => p9Forms,
  payrollApprovals: () => payrollApprovals,
  payrollDetails: () => payrollDetails2,
  payslips: () => payslips2,
  performanceReviews: () => performanceReviews2,
  projectBudgets: () => projectBudgets,
  projectTeamMembers: () => projectTeamMembers,
  purchaseOrderItems: () => purchaseOrderItems2,
  purchaseOrders: () => purchaseOrders2,
  quoteLogs: () => quoteLogs,
  quotes: () => quotes,
  reminders: () => reminders2,
  salaryAllowances: () => salaryAllowances,
  salaryDeductions: () => salaryDeductions,
  salaryIncrements: () => salaryIncrements,
  salaryStructures: () => salaryStructures,
  scheduledReminders: () => scheduledReminders2,
  serviceTemplates: () => serviceTemplates,
  serviceUsageTracking: () => serviceUsageTracking,
  stockAlerts: () => stockAlerts2,
  supplierAudits: () => supplierAudits,
  supplierRatings: () => supplierRatings,
  suppliers: () => suppliers,
  systemSettings: () => systemSettings2,
  ticketComments: () => ticketComments,
  ticketTasks: () => ticketTasks,
  tickets: () => tickets2,
  userPermissions: () => userPermissions2,
  userTablePreferences: () => userTablePreferences,
  workflowAutomationLogs: () => workflowAutomationLogs2
});
import {
  mysqlEnum as mysqlEnum2,
  mysqlTable as mysqlTable3,
  text as text3,
  timestamp as timestamp3,
  varchar as varchar3,
  int as int3,
  boolean as boolean3,
  datetime as datetime2,
  index as index3,
  uniqueIndex as uniqueIndex3,
  decimal as decimal2,
  json as json3
} from "drizzle-orm/mysql-core";
var guestClients2, reminders2, scheduledReminders2, communicationLogs2, inventoryTransactions2, stockAlerts2, systemSettings2, auditLogs2, userPermissions2, salaryStructures, salaryAllowances, salaryDeductions, employeeBenefits, payrollDetails2, payrollApprovals, employeeTaxInfo, salaryIncrements, employeeDisciplinaryActions, employeeDepartmentMovements, payslips2, departmentalHeads, p9Forms, lpos2, lpoLineItems, deliveryNoteLineItems, grnLineItems, journalEntryReconciliations, imprests2, imprestSurrenders2, projectTeamMembers, invoicePayments, serviceTemplates, serviceUsageTracking, projectBudgets, departmentBudgets, ledgerBudgets, budgetAllocations, organizationAccountingPolicies2, journalEntries2, journalEntryLines2, purchaseOrders2, purchaseOrderItems2, goodsReceiptNotes2, leads2, automationConfigs2, workflowAutomationLogs2, performanceReviews2, tickets2, ticketComments, ticketTasks, suppliers, supplierRatings, supplierAudits, quotes, lineItems2, quoteLogs, userTablePreferences, organizationMembers;
var init_schema_extended = __esm({
  "drizzle/schema-extended.ts"() {
    guestClients2 = mysqlTable3("guestClients", {
      id: varchar3("id", { length: 64 }).primaryKey(),
      name: varchar3("name", { length: 255 }).notNull(),
      email: varchar3("email", { length: 320 }),
      phone: varchar3("phone", { length: 50 }),
      address: text3("address"),
      notes: text3("notes"),
      createdBy: varchar3("createdBy", { length: 64 }),
      createdAt: timestamp3("createdAt").defaultNow()
    });
    reminders2 = mysqlTable3("reminders", {
      id: varchar3("id", { length: 64 }).primaryKey(),
      name: varchar3("name", { length: 255 }).notNull(),
      type: mysqlEnum2("type", ["invoice_due", "estimate_expiry", "project_milestone", "payment_overdue", "custom"]).notNull(),
      frequency: mysqlEnum2("frequency", ["once", "daily", "weekly", "monthly", "custom"]).notNull(),
      customDays: int3("customDays"),
      // Days before/after event
      timing: mysqlEnum2("timing", ["before", "on", "after"]).notNull(),
      isActive: boolean3("isActive").default(true).notNull(),
      emailEnabled: boolean3("emailEnabled").default(true).notNull(),
      smsEnabled: boolean3("smsEnabled").default(false).notNull(),
      emailTemplate: text3("emailTemplate"),
      smsTemplate: text3("smsTemplate"),
      createdBy: varchar3("createdBy", { length: 64 }),
      createdAt: timestamp3("createdAt").defaultNow(),
      updatedAt: timestamp3("updatedAt").defaultNow()
    });
    scheduledReminders2 = mysqlTable3("scheduledReminders", {
      id: varchar3("id", { length: 64 }).primaryKey(),
      reminderId: varchar3("reminderId", { length: 64 }).notNull(),
      referenceType: varchar3("referenceType", { length: 50 }).notNull(),
      // invoice, estimate, project, etc.
      referenceId: varchar3("referenceId", { length: 64 }).notNull(),
      recipientId: varchar3("recipientId", { length: 64 }).notNull(),
      // user or client ID
      recipientType: mysqlEnum2("recipientType", ["user", "client"]).notNull(),
      scheduledFor: datetime2("scheduledFor").notNull(),
      status: mysqlEnum2("status", ["pending", "sent", "failed", "cancelled"]).default("pending").notNull(),
      sentAt: datetime2("sentAt"),
      error: text3("error"),
      createdAt: timestamp3("createdAt").defaultNow()
    }, (table) => ({
      scheduledForIdx: index3("scheduled_for_idx").on(table.scheduledFor),
      statusIdx: index3("status_idx").on(table.status),
      referenceIdx: index3("reference_idx").on(table.referenceType, table.referenceId)
    }));
    communicationLogs2 = mysqlTable3("communicationLogs", {
      id: varchar3("id", { length: 64 }).primaryKey(),
      type: mysqlEnum2("type", ["email", "sms"]).notNull(),
      recipient: varchar3("recipient", { length: 320 }).notNull(),
      subject: varchar3("subject", { length: 500 }),
      body: text3("body"),
      status: mysqlEnum2("status", ["pending", "sent", "failed"]).default("pending").notNull(),
      error: text3("error"),
      referenceType: varchar3("referenceType", { length: 50 }),
      referenceId: varchar3("referenceId", { length: 64 }),
      sentAt: datetime2("sentAt"),
      createdBy: varchar3("createdBy", { length: 64 }),
      createdAt: timestamp3("createdAt").defaultNow()
    }, (table) => ({
      recipientIdx: index3("recipient_idx").on(table.recipient),
      statusIdx: index3("status_idx").on(table.status),
      sentAtIdx: index3("sent_at_idx").on(table.sentAt)
    }));
    inventoryTransactions2 = mysqlTable3("inventoryTransactions", {
      id: varchar3("id", { length: 64 }).primaryKey(),
      productId: varchar3("productId", { length: 64 }).notNull(),
      type: mysqlEnum2("type", ["purchase", "sale", "adjustment", "return", "transfer"]).notNull(),
      quantity: int3("quantity").notNull(),
      // positive for in, negative for out
      unitCost: int3("unitCost"),
      // in cents
      referenceType: varchar3("referenceType", { length: 50 }),
      // invoice, purchase_order, etc.
      referenceId: varchar3("referenceId", { length: 64 }),
      notes: text3("notes"),
      transactionDate: datetime2("transactionDate").notNull(),
      createdBy: varchar3("createdBy", { length: 64 }),
      createdAt: timestamp3("createdAt").defaultNow()
    }, (table) => ({
      productIdx: index3("product_idx").on(table.productId),
      typeIdx: index3("type_idx").on(table.type),
      transactionDateIdx: index3("transaction_date_idx").on(table.transactionDate)
    }));
    stockAlerts2 = mysqlTable3("stockAlerts", {
      id: varchar3("id", { length: 64 }).primaryKey(),
      productId: varchar3("productId", { length: 64 }).notNull(),
      alertType: mysqlEnum2("alertType", ["low_stock", "out_of_stock", "overstock", "reorder"]).notNull(),
      currentQuantity: int3("currentQuantity").notNull(),
      threshold: int3("threshold").notNull(),
      status: mysqlEnum2("status", ["active", "resolved", "ignored"]).default("active").notNull(),
      notifiedAt: datetime2("notifiedAt"),
      resolvedAt: datetime2("resolvedAt"),
      createdAt: timestamp3("createdAt").defaultNow()
    }, (table) => ({
      productIdx: index3("product_idx").on(table.productId),
      statusIdx: index3("status_idx").on(table.status)
    }));
    systemSettings2 = mysqlTable3("systemSettings", {
      id: varchar3("id", { length: 64 }).primaryKey(),
      category: varchar3("category", { length: 100 }).notNull(),
      key: varchar3("key", { length: 100 }).notNull(),
      value: text3("value"),
      dataType: mysqlEnum2("dataType", ["string", "number", "boolean", "json"]).notNull(),
      description: text3("description"),
      isPublic: boolean3("isPublic").default(false).notNull(),
      updatedBy: varchar3("updatedBy", { length: 64 }),
      updatedAt: timestamp3("updatedAt").defaultNow()
    }, (table) => ({
      categoryKeyIdx: index3("category_key_idx").on(table.category, table.key)
    }));
    auditLogs2 = mysqlTable3("auditLogs", {
      id: varchar3("id", { length: 64 }).primaryKey(),
      userId: varchar3("userId", { length: 64 }).notNull(),
      action: varchar3("action", { length: 100 }).notNull(),
      resourceType: varchar3("resourceType", { length: 50 }).notNull(),
      resourceId: varchar3("resourceId", { length: 64 }),
      changes: text3("changes"),
      // JSON of before/after
      ipAddress: varchar3("ipAddress", { length: 50 }),
      userAgent: text3("userAgent"),
      createdAt: timestamp3("createdAt").defaultNow()
    }, (table) => ({
      userIdx: index3("user_idx").on(table.userId),
      actionIdx: index3("action_idx").on(table.action),
      resourceIdx: index3("resource_idx").on(table.resourceType, table.resourceId),
      createdAtIdx: index3("created_at_idx").on(table.createdAt)
    }));
    userPermissions2 = mysqlTable3("userPermissions", {
      id: varchar3("id", { length: 64 }).primaryKey(),
      userId: varchar3("userId", { length: 64 }).notNull(),
      resource: varchar3("resource", { length: 100 }).notNull(),
      // clients, invoices, projects, etc.
      action: varchar3("action", { length: 50 }).notNull(),
      // create, read, update, delete, approve, etc.
      granted: boolean3("granted").default(true).notNull(),
      grantedBy: varchar3("grantedBy", { length: 64 }),
      createdAt: timestamp3("createdAt").defaultNow()
    }, (table) => ({
      userResourceIdx: index3("user_resource_idx").on(table.userId, table.resource)
    }));
    salaryStructures = mysqlTable3("salaryStructures", {
      id: varchar3("id", { length: 64 }).primaryKey(),
      employeeId: varchar3("employeeId", { length: 64 }).notNull(),
      effectiveDate: datetime2("effectiveDate").notNull(),
      basicSalary: int3("basicSalary").notNull(),
      // in cents
      allowances: int3("allowances").default(0),
      // total allowances in cents
      deductions: int3("deductions").default(0),
      // total deductions in cents
      taxRate: int3("taxRate").default(0),
      // percentage * 100
      notes: text3("notes"),
      approvedBy: varchar3("approvedBy", { length: 64 }),
      approvedAt: datetime2("approvedAt"),
      createdBy: varchar3("createdBy", { length: 64 }),
      createdAt: timestamp3("createdAt").defaultNow(),
      updatedAt: timestamp3("updatedAt").defaultNow()
    }, (table) => ({
      employeeIdx: index3("employee_idx").on(table.employeeId),
      effectiveDateIdx: index3("effective_date_idx").on(table.effectiveDate)
    }));
    salaryAllowances = mysqlTable3("salaryAllowances", {
      id: varchar3("id", { length: 64 }).primaryKey(),
      employeeId: varchar3("employeeId", { length: 64 }).notNull(),
      allowanceType: varchar3("allowanceType", { length: 100 }).notNull(),
      // house, transport, meals, phone, etc.
      amount: int3("amount").notNull(),
      // in cents
      frequency: mysqlEnum2("frequency", ["monthly", "quarterly", "annual", "one_time"]).notNull(),
      effectiveDate: datetime2("effectiveDate").notNull(),
      endDate: datetime2("endDate"),
      // null if ongoing
      isActive: boolean3("isActive").default(true).notNull(),
      notes: text3("notes"),
      createdBy: varchar3("createdBy", { length: 64 }),
      createdAt: timestamp3("createdAt").defaultNow(),
      updatedAt: timestamp3("updatedAt").defaultNow()
    }, (table) => ({
      employeeIdx: index3("employee_idx").on(table.employeeId),
      typeIdx: index3("type_idx").on(table.allowanceType),
      isActiveIdx: index3("is_active_idx").on(table.isActive)
    }));
    salaryDeductions = mysqlTable3("salaryDeductions", {
      id: varchar3("id", { length: 64 }).primaryKey(),
      employeeId: varchar3("employeeId", { length: 64 }).notNull(),
      deductionType: varchar3("deductionType", { length: 100 }).notNull(),
      // loan, pension, insurance, tax, etc.
      amount: int3("amount").notNull(),
      // in cents
      frequency: mysqlEnum2("frequency", ["monthly", "quarterly", "annual", "one_time"]).notNull(),
      effectiveDate: datetime2("effectiveDate").notNull(),
      endDate: datetime2("endDate"),
      // null if ongoing
      isActive: boolean3("isActive").default(true).notNull(),
      reference: varchar3("reference", { length: 100 }),
      // loan reference number, etc.
      notes: text3("notes"),
      createdBy: varchar3("createdBy", { length: 64 }),
      createdAt: timestamp3("createdAt").defaultNow(),
      updatedAt: timestamp3("updatedAt").defaultNow()
    }, (table) => ({
      employeeIdx: index3("employee_idx").on(table.employeeId),
      typeIdx: index3("type_idx").on(table.deductionType),
      isActiveIdx: index3("is_active_idx").on(table.isActive)
    }));
    employeeBenefits = mysqlTable3("employeeBenefits", {
      id: varchar3("id", { length: 64 }).primaryKey(),
      employeeId: varchar3("employeeId", { length: 64 }).notNull(),
      benefitType: varchar3("benefitType", { length: 100 }).notNull(),
      // health_insurance, life_insurance, pension, etc.
      provider: varchar3("provider", { length: 255 }),
      // insurance company, pension fund, etc.
      enrollDate: datetime2("enrollDate").notNull(),
      endDate: datetime2("endDate"),
      // null if ongoing
      isActive: boolean3("isActive").default(true).notNull(),
      coverage: text3("coverage"),
      // coverage details
      cost: int3("cost"),
      // employee cost in cents
      employerCost: int3("employerCost"),
      // employer cost in cents
      notes: text3("notes"),
      createdBy: varchar3("createdBy", { length: 64 }),
      createdAt: timestamp3("createdAt").defaultNow(),
      updatedAt: timestamp3("updatedAt").defaultNow()
    }, (table) => ({
      employeeIdx: index3("employee_idx").on(table.employeeId),
      typeIdx: index3("type_idx").on(table.benefitType),
      isActiveIdx: index3("is_active_idx").on(table.isActive)
    }));
    payrollDetails2 = mysqlTable3("payrollDetails", {
      id: varchar3("id", { length: 64 }).primaryKey(),
      payrollId: varchar3("payrollId", { length: 64 }).notNull(),
      componentType: varchar3("componentType", { length: 100 }).notNull(),
      // allowance, deduction, benefit, etc.
      component: varchar3("component", { length: 255 }).notNull(),
      // house, transport, pension, etc.
      amount: int3("amount").notNull(),
      // in cents
      notes: text3("notes"),
      createdAt: timestamp3("createdAt").defaultNow()
    }, (table) => ({
      payrollIdx: index3("payroll_idx").on(table.payrollId),
      componentIdx: index3("component_idx").on(table.componentType)
    }));
    payrollApprovals = mysqlTable3("payrollApprovals", {
      id: varchar3("id", { length: 64 }).primaryKey(),
      payrollId: varchar3("payrollId", { length: 64 }).notNull(),
      approverRole: varchar3("approverRole", { length: 50 }).notNull(),
      // hr, manager, finance, admin
      approverId: varchar3("approverId", { length: 64 }).notNull(),
      status: mysqlEnum2("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
      rejectionReason: text3("rejectionReason"),
      approvalDate: datetime2("approvalDate"),
      createdAt: timestamp3("createdAt").defaultNow()
    }, (table) => ({
      payrollIdx: index3("payroll_idx").on(table.payrollId),
      approverIdx: index3("approver_idx").on(table.approverId),
      statusIdx: index3("status_idx").on(table.status)
    }));
    employeeTaxInfo = mysqlTable3("employeeTaxInfo", {
      id: varchar3("id", { length: 64 }).primaryKey(),
      employeeId: varchar3("employeeId", { length: 64 }).notNull(),
      taxNumber: varchar3("taxNumber", { length: 50 }).notNull(),
      taxBracket: varchar3("taxBracket", { length: 50 }),
      // e.g., "30%", "35%"
      exemptions: int3("exemptions").default(0),
      // number of exemptions
      effectiveDate: datetime2("effectiveDate").notNull(),
      endDate: datetime2("endDate"),
      notes: text3("notes"),
      createdBy: varchar3("createdBy", { length: 64 }),
      createdAt: timestamp3("createdAt").defaultNow(),
      updatedAt: timestamp3("updatedAt").defaultNow()
    }, (table) => ({
      employeeIdx: index3("employee_idx").on(table.employeeId),
      taxNumberIdx: index3("tax_number_idx").on(table.taxNumber)
    }));
    salaryIncrements = mysqlTable3("salaryIncrements", {
      id: varchar3("id", { length: 64 }).primaryKey(),
      employeeId: varchar3("employeeId", { length: 64 }).notNull(),
      previousSalary: int3("previousSalary").notNull(),
      // in cents
      newSalary: int3("newSalary").notNull(),
      // in cents
      incrementPercent: int3("incrementPercent").default(0),
      // percentage * 100
      reason: varchar3("reason", { length: 255 }),
      // promotion, merit, cost_of_living, etc.
      effectiveDate: datetime2("effectiveDate").notNull(),
      approvedBy: varchar3("approvedBy", { length: 64 }),
      approvalDate: datetime2("approvalDate"),
      notes: text3("notes"),
      createdBy: varchar3("createdBy", { length: 64 }),
      createdAt: timestamp3("createdAt").defaultNow()
    }, (table) => ({
      employeeIdx: index3("employee_idx").on(table.employeeId),
      effectiveDateIdx: index3("effective_date_idx").on(table.effectiveDate)
    }));
    employeeDisciplinaryActions = mysqlTable3("employeeDisciplinaryActions", {
      id: varchar3("id", { length: 64 }).primaryKey(),
      organizationId: varchar3("organizationId", { length: 64 }),
      employeeId: varchar3("employeeId", { length: 64 }).notNull(),
      actionType: varchar3("actionType", { length: 50 }).notNull(),
      severity: varchar3("severity", { length: 30 }).notNull(),
      incidentDate: datetime2("incidentDate").notNull(),
      description: text3("description").notNull(),
      actionTaken: text3("actionTaken"),
      status: mysqlEnum2("status", ["open", "under_review", "resolved", "appealed"]).default("open").notNull(),
      resolution: text3("resolution"),
      resolvedBy: varchar3("resolvedBy", { length: 64 }),
      resolvedAt: datetime2("resolvedAt"),
      createdBy: varchar3("createdBy", { length: 64 }).notNull(),
      createdAt: timestamp3("createdAt").defaultNow(),
      updatedAt: timestamp3("updatedAt").defaultNow()
    }, (table) => ({
      employeeIdx: index3("discipline_employee_idx").on(table.employeeId),
      organizationIdx: index3("discipline_org_idx").on(table.organizationId),
      statusIdx: index3("discipline_status_idx").on(table.status)
    }));
    employeeDepartmentMovements = mysqlTable3("employeeDepartmentMovements", {
      id: varchar3("id", { length: 64 }).primaryKey(),
      organizationId: varchar3("organizationId", { length: 64 }),
      employeeId: varchar3("employeeId", { length: 64 }).notNull(),
      fromDepartment: varchar3("fromDepartment", { length: 100 }),
      toDepartment: varchar3("toDepartment", { length: 100 }).notNull(),
      effectiveDate: datetime2("effectiveDate").notNull(),
      reason: text3("reason"),
      status: mysqlEnum2("status", ["scheduled", "completed", "cancelled"]).default("scheduled").notNull(),
      createdBy: varchar3("createdBy", { length: 64 }).notNull(),
      createdAt: timestamp3("createdAt").defaultNow(),
      updatedAt: timestamp3("updatedAt").defaultNow()
    }, (table) => ({
      employeeIdx: index3("movement_employee_idx").on(table.employeeId),
      organizationIdx: index3("movement_org_idx").on(table.organizationId),
      effectiveDateIdx: index3("movement_effective_date_idx").on(table.effectiveDate)
    }));
    payslips2 = mysqlTable3("payslips", {
      id: varchar3("id", { length: 64 }).primaryKey(),
      payrollId: varchar3("payrollId", { length: 64 }).notNull(),
      employeeId: varchar3("employeeId", { length: 64 }).notNull(),
      organizationId: varchar3("organizationId", { length: 64 }),
      payPeriod: varchar3("payPeriod", { length: 20 }).notNull(),
      // YYYY-MM format
      payPeriodStart: datetime2("payPeriodStart").notNull(),
      payPeriodEnd: datetime2("payPeriodEnd").notNull(),
      basicSalary: int3("basicSalary").notNull(),
      // in cents
      allowances: int3("allowances").default(0),
      // in cents
      grossSalary: int3("grossSalary").notNull(),
      // basic + allowances
      paye: int3("paye").default(0),
      // in cents
      nssf: int3("nssf").default(0),
      // in cents
      shif: int3("shif").default(0),
      // in cents
      housingLevy: int3("housingLevy").default(0),
      // in cents
      totalDeductions: int3("totalDeductions").default(0),
      // in cents
      netSalary: int3("netSalary").notNull(),
      // in cents
      htmlContent: text3("htmlContent"),
      // Rendered payslip HTML
      pdfUrl: varchar3("pdfUrl", { length: 500 }),
      // URL to stored PDF
      sentTo: varchar3("sentTo", { length: 320 }),
      // Employee email
      sentAt: datetime2("sentAt"),
      status: mysqlEnum2("status", ["draft", "generated", "sent", "viewed"]).default("draft").notNull(),
      employeeNotes: text3("employeeNotes"),
      // Employee can add notes
      createdAt: timestamp3("createdAt").defaultNow(),
      updatedAt: timestamp3("updatedAt").defaultNow()
    }, (table) => ({
      payrollIdx: index3("payroll_idx").on(table.payrollId),
      employeeIdx: index3("employee_idx").on(table.employeeId),
      payPeriodIdx: index3("pay_period_idx").on(table.payPeriod),
      statusIdx: index3("status_idx").on(table.status),
      sentAtIdx: index3("sent_at_idx").on(table.sentAt),
      organizationIdx: index3("org_idx").on(table.organizationId)
    }));
    departmentalHeads = mysqlTable3("departmental_heads", {
      id: varchar3("id", { length: 64 }).primaryKey(),
      organizationId: varchar3("organizationId", { length: 64 }).notNull(),
      departmentId: varchar3("departmentId", { length: 64 }).notNull(),
      employeeId: varchar3("employeeId", { length: 64 }).notNull(),
      // Manager employee record
      userId: varchar3("userId", { length: 64 }).notNull(),
      // User ID
      assignedAt: timestamp3("assignedAt").defaultNow().notNull(),
      assignedBy: varchar3("assignedBy", { length: 64 }),
      // Admin who assigned
      removalReason: text3("removalReason"),
      // If removed
      removedAt: timestamp3("removedAt"),
      removedBy: varchar3("removedBy", { length: 64 }),
      createdAt: timestamp3("createdAt").defaultNow(),
      updatedAt: timestamp3("updatedAt").defaultNow()
    }, (table) => ({
      deptIdx: index3("dept_idx").on(table.departmentId),
      empIdx: index3("emp_idx").on(table.employeeId),
      userIdx: index3("user_idx").on(table.userId),
      orgIdx: index3("org_head_idx").on(table.organizationId)
    }));
    p9Forms = mysqlTable3("p9_forms", {
      id: varchar3("id", { length: 64 }).primaryKey(),
      organizationId: varchar3("organizationId", { length: 64 }).notNull(),
      employeeId: varchar3("employeeId", { length: 64 }).notNull(),
      taxYear: int3("taxYear").notNull(),
      // e.g., 2024 (Jan-Dec)
      taxNumber: varchar3("taxNumber", { length: 30 }),
      grossIncome: int3("grossIncome").notNull(),
      // in cents
      totalDeductions: int3("totalDeductions").notNull(),
      // NSSF + SHIF + Housing Levy + PAYE, in cents
      paye: int3("paye").default(0),
      // in cents
      nssf: int3("nssf").default(0),
      // in cents
      shif: int3("shif").default(0),
      // in cents
      housingLevy: int3("housingLevy").default(0),
      // in cents
      reliefs: int3("reliefs").default(0),
      // Tax reliefs, in cents
      netTaxPayable: int3("netTaxPayable").notNull(),
      // in cents
      numberOfPayslips: int3("numberOfPayslips").default(12),
      htmlContent: text3("htmlContent"),
      // Rendered P9 form
      pdfUrl: varchar3("pdfUrl", { length: 500 }),
      // Stored PDF location
      sentTo: varchar3("sentTo", { length: 320 }),
      // Employee email
      sentAt: timestamp3("sentAt"),
      status: mysqlEnum2("status", ["draft", "generated", "sent", "received"]).default("draft").notNull(),
      generatedBy: varchar3("generatedBy", { length: 64 }),
      // Admin who generated
      generatedAt: timestamp3("generatedAt"),
      notes: text3("notes"),
      // Internal notes
      createdAt: timestamp3("createdAt").defaultNow(),
      updatedAt: timestamp3("updatedAt").defaultNow()
    }, (table) => ({
      empIdx: index3("p9_emp_idx").on(table.employeeId),
      yearIdx: index3("tax_year_idx").on(table.taxYear),
      statusIdx: index3("p9_status_idx").on(table.status),
      orgIdx: index3("p9_org_idx").on(table.organizationId)
    }));
    lpos2 = mysqlTable3("lpos", {
      id: varchar3("id", { length: 64 }).primaryKey(),
      organizationId: varchar3("organizationId", { length: 64 }),
      lpoNumber: varchar3("lpoNumber", { length: 50 }).notNull(),
      vendorId: varchar3("vendorId", { length: 64 }).notNull(),
      description: text3("description"),
      amount: int3("amount").notNull(),
      // in cents
      status: mysqlEnum2("status", ["draft", "submitted", "approved", "rejected", "received"]).default("draft").notNull(),
      createdBy: varchar3("createdBy", { length: 64 }),
      createdAt: timestamp3("createdAt").defaultNow(),
      updatedAt: timestamp3("updatedAt").defaultNow()
    }, (table) => ({
      vendorIdx: index3("vendor_idx").on(table.vendorId),
      statusIdx: index3("status_idx").on(table.status),
      numberUniqueIdx: uniqueIndex3("lpo_number_unique_idx").on(table.lpoNumber)
    }));
    lpoLineItems = mysqlTable3(
      "lpoLineItems",
      {
        id: varchar3("id", { length: 64 }).primaryKey(),
        lpoId: varchar3("lpoId", { length: 64 }).notNull(),
        productId: varchar3("productId", { length: 64 }),
        description: text3("description").notNull(),
        quantity: int3("quantity").notNull(),
        unit: varchar3("unit", { length: 50 }).default("pcs").notNull(),
        unitPrice: int3("unitPrice").notNull(),
        // in cents
        taxRate: int3("taxRate").default(0).notNull(),
        // percentage (0-100)
        lineTotal: int3("lineTotal").notNull(),
        // quantity * unitPrice * (1 + taxRate/100)
        createdAt: timestamp3("createdAt").defaultNow(),
        updatedAt: timestamp3("updatedAt").defaultNow()
      },
      (table) => ({
        lpoIdx: index3("lpo_idx").on(table.lpoId),
        productIdx: index3("product_idx").on(table.productId)
      })
    );
    deliveryNoteLineItems = mysqlTable3(
      "deliveryNoteLineItems",
      {
        id: varchar3("id", { length: 64 }).primaryKey(),
        deliveryNoteId: varchar3("deliveryNoteId", { length: 64 }).notNull(),
        lpoLineItemId: varchar3("lpoLineItemId", { length: 64 }),
        productId: varchar3("productId", { length: 64 }),
        description: text3("description").notNull(),
        quantityOrdered: int3("quantityOrdered").notNull(),
        quantityReceived: int3("quantityReceived").notNull(),
        unit: varchar3("unit", { length: 50 }).default("pcs").notNull(),
        unitPrice: int3("unitPrice").notNull(),
        // in cents
        notes: text3("notes"),
        createdAt: timestamp3("createdAt").defaultNow(),
        updatedAt: timestamp3("updatedAt").defaultNow()
      },
      (table) => ({
        deliveryNoteIdx: index3("delivery_note_idx").on(table.deliveryNoteId),
        lpoLineItemIdx: index3("lpo_line_item_idx").on(table.lpoLineItemId),
        productIdx: index3("product_idx").on(table.productId)
      })
    );
    grnLineItems = mysqlTable3(
      "grnLineItems",
      {
        id: varchar3("id", { length: 64 }).primaryKey(),
        grnId: varchar3("grnId", { length: 64 }).notNull(),
        lpoLineItemId: varchar3("lpoLineItemId", { length: 64 }),
        productId: varchar3("productId", { length: 64 }),
        description: text3("description").notNull(),
        quantityOrdered: int3("quantityOrdered").notNull(),
        quantityReceived: int3("quantityReceived").notNull(),
        unit: varchar3("unit", { length: 50 }).default("pcs").notNull(),
        unitPrice: int3("unitPrice").notNull(),
        // in cents
        condition: mysqlEnum2("condition", ["good", "damaged", "partial", "defective"]).default("good").notNull(),
        notes: text3("notes"),
        createdAt: timestamp3("createdAt").defaultNow(),
        updatedAt: timestamp3("updatedAt").defaultNow()
      },
      (table) => ({
        grnIdx: index3("grn_idx").on(table.grnId),
        lpoLineItemIdx: index3("lpo_line_item_idx").on(table.lpoLineItemId),
        productIdx: index3("product_idx").on(table.productId)
      })
    );
    journalEntryReconciliations = mysqlTable3(
      "journalEntryReconciliations",
      {
        id: varchar3("id", { length: 64 }).primaryKey(),
        journalEntryId: varchar3("journalEntryId", { length: 64 }).notNull(),
        reconciledBy: varchar3("reconciledBy", { length: 64 }),
        reconciledAt: timestamp3("reconciledAt").defaultNow(),
        notes: text3("notes")
      },
      (table) => ({
        entryIdx: index3("recon_entry_idx").on(table.journalEntryId)
      })
    );
    imprests2 = mysqlTable3("imprests", {
      id: varchar3("id", { length: 64 }).primaryKey(),
      imprestNumber: varchar3("imprestNumber", { length: 50 }).notNull(),
      userId: varchar3("userId", { length: 64 }).notNull(),
      purpose: text3("purpose"),
      amount: int3("amount").notNull(),
      status: mysqlEnum2("status", ["requested", "approved", "rejected", "settled"]).default("requested").notNull(),
      createdBy: varchar3("createdBy", { length: 64 }),
      createdAt: timestamp3("createdAt").defaultNow(),
      updatedAt: timestamp3("updatedAt").defaultNow()
    }, (table) => ({
      userIdx: index3("user_idx").on(table.userId),
      statusIdx: index3("status_idx").on(table.status)
    }));
    imprestSurrenders2 = mysqlTable3("imprestSurrenders", {
      id: varchar3("id", { length: 64 }).primaryKey(),
      imprestId: varchar3("imprestId", { length: 64 }).notNull(),
      amount: int3("amount").notNull(),
      notes: text3("notes"),
      surrenderedBy: varchar3("surrenderedBy", { length: 64 }),
      surrenderedAt: timestamp3("surrenderedAt").defaultNow(),
      createdAt: timestamp3("createdAt").defaultNow()
    }, (table) => ({
      imprestIdx: index3("imprest_idx").on(table.imprestId)
    }));
    projectTeamMembers = mysqlTable3(
      "projectTeamMembers",
      {
        id: varchar3("id", { length: 64 }).primaryKey(),
        projectId: varchar3("projectId", { length: 64 }).notNull(),
        employeeId: varchar3("employeeId", { length: 64 }).notNull(),
        role: varchar3("role", { length: 100 }),
        // e.g., "Lead Developer", "Designer", "Project Coordinator"
        hoursAllocated: int3("hoursAllocated"),
        // Total hours allocated for the project
        startDate: datetime2("startDate"),
        endDate: datetime2("endDate"),
        isActive: boolean3("isActive").default(true).notNull(),
        createdBy: varchar3("createdBy", { length: 64 }),
        createdAt: timestamp3("createdAt").defaultNow(),
        updatedAt: timestamp3("updatedAt").defaultNow()
      },
      (table) => ({
        projectIdx: index3("project_idx").on(table.projectId),
        employeeIdx: index3("employee_idx").on(table.employeeId)
      })
    );
    invoicePayments = mysqlTable3(
      "invoicePayments",
      {
        id: varchar3("id", { length: 64 }).primaryKey(),
        invoiceId: varchar3("invoiceId", { length: 64 }).notNull(),
        paymentAmount: int3("paymentAmount").notNull(),
        // in cents
        paymentDate: datetime2("paymentDate").notNull(),
        paymentMethod: mysqlEnum2("paymentMethod", [
          "cash",
          "bank_transfer",
          "check",
          "mobile_money",
          "credit_card",
          "other"
        ]).notNull(),
        reference: varchar3("reference", { length: 255 }),
        // Check number, transfer reference, etc.
        notes: text3("notes"),
        receiptId: varchar3("receiptId", { length: 64 }),
        // Link to receipt record if created
        recordedBy: varchar3("recordedBy", { length: 64 }),
        createdAt: timestamp3("createdAt").defaultNow(),
        updatedAt: timestamp3("updatedAt").defaultNow()
      },
      (table) => ({
        invoiceIdx: index3("invoice_idx").on(table.invoiceId),
        paymentDateIdx: index3("payment_date_idx").on(table.paymentDate)
      })
    );
    serviceTemplates = mysqlTable3(
      "serviceTemplates",
      {
        id: varchar3("id", { length: 64 }).primaryKey(),
        organizationId: varchar3("organizationId", { length: 64 }),
        name: varchar3("name", { length: 255 }).notNull(),
        description: text3("description"),
        category: varchar3("category", { length: 100 }),
        hourlyRate: int3("hourlyRate"),
        // in cents
        fixedPrice: int3("fixedPrice"),
        // in cents
        unit: varchar3("unit", { length: 50 }).default("hour"),
        taxRate: int3("taxRate").default(0),
        estimatedDuration: int3("estimatedDuration"),
        // in hours
        deliverables: text3("deliverables"),
        // JSON array of deliverables
        terms: text3("terms"),
        // Service terms and conditions
        isActive: boolean3("isActive").default(true).notNull(),
        createdBy: varchar3("createdBy", { length: 64 }),
        createdAt: timestamp3("createdAt").defaultNow(),
        updatedAt: timestamp3("updatedAt").defaultNow()
      },
      (table) => ({
        categoryIdx: index3("template_category_idx").on(table.category),
        createdIdx: index3("template_created_idx").on(table.createdAt)
      })
    );
    serviceUsageTracking = mysqlTable3(
      "serviceUsageTracking",
      {
        id: varchar3("id", { length: 64 }).primaryKey(),
        serviceTemplateId: varchar3("serviceTemplateId", { length: 64 }).notNull(),
        invoiceId: varchar3("invoiceId", { length: 64 }),
        estimateId: varchar3("estimateId", { length: 64 }),
        projectId: varchar3("projectId", { length: 64 }),
        clientId: varchar3("clientId", { length: 64 }),
        quantity: int3("quantity").default(1).notNull(),
        duration: int3("duration"),
        // in hours
        usageDate: datetime2("usageDate").notNull(),
        status: mysqlEnum2("status", ["pending", "delivered", "invoiced", "paid", "cancelled"]).notNull(),
        notes: text3("notes"),
        createdBy: varchar3("createdBy", { length: 64 }),
        createdAt: timestamp3("createdAt").defaultNow(),
        updatedAt: timestamp3("updatedAt").defaultNow()
      },
      (table) => ({
        templateIdx: index3("usage_template_idx").on(table.serviceTemplateId),
        invoiceIdx: index3("usage_invoice_idx").on(table.invoiceId),
        projectIdx: index3("usage_project_idx").on(table.projectId),
        clientIdx: index3("usage_client_idx").on(table.clientId),
        dateIdx: index3("usage_date_idx").on(table.usageDate),
        statusIdx: index3("usage_status_idx").on(table.status)
      })
    );
    projectBudgets = mysqlTable3(
      "projectBudgets",
      {
        id: varchar3("id", { length: 64 }).primaryKey(),
        organizationId: varchar3("organizationId", { length: 64 }),
        projectId: varchar3("projectId", { length: 64 }).notNull(),
        budgetedAmount: int3("budgetedAmount").notNull(),
        // in cents
        spent: int3("spent").default(0).notNull(),
        // in cents
        remaining: int3("remaining").notNull(),
        // in cents (budgetedAmount - spent)
        budgetStatus: mysqlEnum2("budgetStatus", ["under", "at", "over"]).notNull(),
        startDate: datetime2("startDate").notNull(),
        endDate: datetime2("endDate"),
        notes: text3("notes"),
        createdBy: varchar3("createdBy", { length: 64 }),
        createdAt: timestamp3("createdAt").defaultNow(),
        updatedAt: timestamp3("updatedAt").defaultNow()
      },
      (table) => ({
        projectIdx: index3("budget_project_idx").on(table.projectId),
        statusIdx: index3("budget_status_idx").on(table.budgetStatus),
        dateIdx: index3("budget_date_idx").on(table.startDate)
      })
    );
    departmentBudgets = mysqlTable3(
      "departmentBudgets",
      {
        id: varchar3("id", { length: 64 }).primaryKey(),
        organizationId: varchar3("organizationId", { length: 64 }),
        departmentId: varchar3("departmentId", { length: 64 }).notNull(),
        year: int3("year").notNull(),
        // e.g. 2024, 2025
        budgetedAmount: int3("budgetedAmount").notNull(),
        // in cents
        spent: int3("spent").default(0).notNull(),
        // in cents
        remaining: int3("remaining").notNull(),
        // in cents
        budgetStatus: mysqlEnum2("budgetStatus", ["under", "at", "over"]).notNull(),
        category: varchar3("category", { length: 100 }),
        // e.g. payroll, operations, marketing
        notes: text3("notes"),
        createdBy: varchar3("createdBy", { length: 64 }),
        createdAt: timestamp3("createdAt").defaultNow(),
        updatedAt: timestamp3("updatedAt").defaultNow()
      },
      (table) => ({
        departmentIdx: index3("dept_budget_department_idx").on(table.departmentId),
        yearIdx: index3("dept_budget_year_idx").on(table.year),
        statusIdx: index3("dept_budget_status_idx").on(table.budgetStatus),
        categoryIdx: index3("dept_budget_category_idx").on(table.category)
      })
    );
    ledgerBudgets = mysqlTable3(
      "ledgerBudgets",
      {
        id: varchar3("id", { length: 64 }).primaryKey(),
        accountId: varchar3("accountId", { length: 64 }).notNull(),
        // Reference to chart of accounts
        year: int3("year").notNull(),
        month: int3("month"),
        // 1-12; null for annual budgets
        budgetedAmount: int3("budgetedAmount").notNull(),
        // in cents
        actual: int3("actual").default(0).notNull(),
        // in cents
        variance: int3("variance").notNull(),
        // budgetedAmount - actual
        variancePercentage: int3("variancePercentage"),
        // Percentage variance
        notes: text3("notes"),
        createdBy: varchar3("createdBy", { length: 64 }),
        createdAt: timestamp3("createdAt").defaultNow(),
        updatedAt: timestamp3("updatedAt").defaultNow()
      },
      (table) => ({
        accountIdx: index3("ledger_budget_account_idx").on(table.accountId),
        yearIdx: index3("ledger_budget_year_idx").on(table.year),
        monthIdx: index3("ledger_budget_month_idx").on(table.month)
      })
    );
    budgetAllocations = mysqlTable3(
      "budgetAllocations",
      {
        id: varchar3("id", { length: 64 }).primaryKey(),
        budgetId: varchar3("budgetId", { length: 64 }).notNull(),
        // Can reference project, department, or ledger budgets
        accountId: varchar3("accountId", { length: 64 }).notNull(),
        // Chart of accounts tag
        categoryName: varchar3("categoryName", { length: 255 }).notNull(),
        allocatedAmount: int3("allocatedAmount").notNull(),
        // in cents
        spentAmount: int3("spentAmount").default(0).notNull(),
        // in cents
        notes: text3("notes"),
        createdAt: timestamp3("createdAt").defaultNow(),
        updatedAt: timestamp3("updatedAt").defaultNow()
      },
      (table) => ({
        budgetIdx: index3("allocation_budget_idx").on(table.budgetId)
      })
    );
    organizationAccountingPolicies2 = mysqlTable3("organizationAccountingPolicies", {
      id: varchar3("id", { length: 36 }).primaryKey(),
      organizationId: varchar3("organizationId", { length: 36 }).notNull(),
      country: varchar3("country", { length: 10 }).notNull().default("KE"),
      // Fiscal Year Configuration
      fiscalYearStart: varchar3("fiscalYearStart", { length: 5 }).notNull().default("01-01"),
      fiscalYearEnd: varchar3("fiscalYearEnd", { length: 5 }).notNull().default("12-31"),
      // Accounting Method
      accountingMethod: mysqlEnum2("accountingMethod", ["accrual", "cash"]).notNull().default("accrual"),
      defaultCurrency: varchar3("defaultCurrency", { length: 3 }).notNull().default("KES"),
      // Tax Configuration
      taxInclusiveInvoicing: boolean3("taxInclusiveInvoicing").notNull().default(true),
      autoReconciliation: boolean3("autoReconciliation").notNull().default(false),
      // Approval Requirements
      requireInvoiceApproval: boolean3("requireInvoiceApproval").notNull().default(true),
      requireExpenseApproval: boolean3("requireExpenseApproval").notNull().default(true),
      // Payment Terms
      defaultPaymentTerms: varchar3("defaultPaymentTerms", { length: 20 }).default("net30"),
      // Asset Management
      depreciationMethod: mysqlEnum2("depreciationMethod", ["straight_line", "declining_balance", "units_of_production"]).default("straight_line"),
      capitalizedAssetThreshold: decimal2("capitalizedAssetThreshold", { precision: 12, scale: 2 }).default("50000"),
      // Compliance & Control
      roundingMethod: mysqlEnum2("roundingMethod", ["round", "truncate"]).default("round"),
      retentionPeriod: int3("retentionPeriod").default(7),
      auditTrailRequired: boolean3("auditTrailRequired").notNull().default(true),
      allowManualJournalEntries: boolean3("allowManualJournalEntries").notNull().default(true),
      createdBy: varchar3("createdBy", { length: 36 }).notNull(),
      createdAt: datetime2("createdAt").notNull(),
      updatedBy: varchar3("updatedBy", { length: 36 }),
      updatedAt: datetime2("updatedAt")
    }, (table) => ({
      orgIdx: index3("org_policy_idx").on(table.organizationId),
      countryIdx: index3("country_policy_idx").on(table.country)
    }));
    journalEntries2 = mysqlTable3("journalEntries", {
      id: varchar3("id", { length: 36 }).primaryKey(),
      organizationId: varchar3("organizationId", { length: 36 }).notNull(),
      entryDate: datetime2("entryDate").notNull(),
      entryMonth: varchar3("entryMonth", { length: 7 }).notNull(),
      // YYYY-MM
      reference: varchar3("reference", { length: 50 }).notNull(),
      description: text3("description").notNull(),
      totalAmount: decimal2("totalAmount", { precision: 12, scale: 2 }).notNull(),
      // Approval Workflow
      status: mysqlEnum2("status", ["pending_approval", "approved", "posted", "reversed"]).default("pending_approval"),
      approvedBy: varchar3("approvedBy", { length: 36 }),
      approvedAt: datetime2("approvedAt"),
      postedAt: datetime2("postedAt"),
      reversedAt: datetime2("reversedAt"),
      notes: text3("notes"),
      createdBy: varchar3("createdBy", { length: 36 }).notNull(),
      createdAt: datetime2("createdAt").notNull(),
      updatedAt: datetime2("updatedAt")
    }, (table) => ({
      orgIdx: index3("journal_org_idx").on(table.organizationId),
      dateIdx: index3("journal_date_idx").on(table.entryDate),
      monthIdx: index3("journal_month_idx").on(table.entryMonth),
      statusIdx: index3("journal_status_idx").on(table.status)
    }));
    journalEntryLines2 = mysqlTable3("journalEntryLines", {
      id: varchar3("id", { length: 36 }).primaryKey(),
      journalEntryId: varchar3("journalEntryId", { length: 36 }).notNull(),
      accountId: varchar3("accountId", { length: 36 }).notNull(),
      description: varchar3("description", { length: 255 }),
      debit: decimal2("debit", { precision: 12, scale: 2 }).notNull().default("0"),
      credit: decimal2("credit", { precision: 12, scale: 2 }).notNull().default("0"),
      lineNumber: int3("lineNumber"),
      createdBy: varchar3("createdBy", { length: 36 }).notNull(),
      createdAt: datetime2("createdAt").notNull()
    }, (table) => ({
      entryIdx: index3("journal_line_entry_idx").on(table.journalEntryId),
      accountIdx: index3("journal_line_account_idx").on(table.accountId)
    }));
    purchaseOrders2 = mysqlTable3("purchaseOrders", {
      id: varchar3("id", { length: 36 }).primaryKey(),
      organizationId: varchar3("organizationId", { length: 36 }).notNull(),
      poNumber: varchar3("poNumber", { length: 50 }).notNull(),
      supplierId: varchar3("supplierId", { length: 36 }).notNull(),
      supplierName: varchar3("supplierName", { length: 255 }).notNull(),
      poDate: datetime2("poDate").notNull(),
      deliveryDate: datetime2("deliveryDate"),
      subtotal: decimal2("subtotal", { precision: 12, scale: 2 }).notNull(),
      taxAmount: decimal2("taxAmount", { precision: 12, scale: 2 }).default("0"),
      total: decimal2("total", { precision: 12, scale: 2 }).notNull(),
      status: mysqlEnum2("status", ["draft", "approved", "received", "partially_received", "cancelled"]).default("draft"),
      approvedBy: varchar3("approvedBy", { length: 36 }),
      approvedAt: datetime2("approvedAt"),
      receivedAt: datetime2("receivedAt"),
      notes: text3("notes"),
      createdBy: varchar3("createdBy", { length: 36 }).notNull(),
      createdAt: datetime2("createdAt").notNull(),
      updatedAt: datetime2("updatedAt")
    }, (table) => ({
      orgIdx: index3("po_org_idx").on(table.organizationId),
      supplierIdx: index3("po_supplier_idx").on(table.supplierId),
      statusIdx: index3("po_status_idx").on(table.status),
      numberUniqueIdx: uniqueIndex3("purchase_order_number_unique_idx").on(table.poNumber)
    }));
    purchaseOrderItems2 = mysqlTable3("purchaseOrderItems", {
      id: varchar3("id", { length: 36 }).primaryKey(),
      purchaseOrderId: varchar3("purchaseOrderId", { length: 36 }).notNull(),
      description: varchar3("description", { length: 255 }).notNull(),
      quantity: int3("quantity").notNull(),
      rate: decimal2("rate", { precision: 12, scale: 2 }).notNull(),
      amount: decimal2("amount", { precision: 12, scale: 2 }).notNull(),
      lineNumber: int3("lineNumber"),
      createdBy: varchar3("createdBy", { length: 36 }).notNull(),
      createdAt: datetime2("createdAt").notNull()
    }, (table) => ({
      poIdx: index3("poi_po_idx").on(table.purchaseOrderId)
    }));
    goodsReceiptNotes2 = mysqlTable3("goodsReceiptNotes", {
      id: varchar3("id", { length: 36 }).primaryKey(),
      organizationId: varchar3("organizationId", { length: 36 }).notNull(),
      grno: varchar3("grno", { length: 50 }).notNull(),
      purchaseOrderId: varchar3("purchaseOrderId", { length: 36 }).notNull(),
      receivedDate: datetime2("receivedDate").notNull(),
      totalQuantity: int3("totalQuantity"),
      notes: text3("notes"),
      createdBy: varchar3("createdBy", { length: 36 }).notNull(),
      createdAt: datetime2("createdAt").notNull()
    }, (table) => ({
      orgIdx: index3("grn_org_idx").on(table.organizationId),
      poIdx: index3("grn_po_idx").on(table.purchaseOrderId)
    }));
    leads2 = mysqlTable3("leads", {
      id: varchar3("id", { length: 36 }).primaryKey(),
      organizationId: varchar3("organizationId", { length: 36 }).notNull(),
      leadNo: varchar3("leadNo", { length: 50 }).notNull(),
      companyName: varchar3("companyName", { length: 255 }).notNull(),
      contactName: varchar3("contactName", { length: 255 }).notNull(),
      email: varchar3("email", { length: 255 }),
      phone: varchar3("phone", { length: 20 }),
      source: mysqlEnum2("source", ["website", "referral", "social_media", "cold_outreach", "event", "trade_show", "other"]).notNull(),
      estimatedValue: decimal2("estimatedValue", { precision: 12, scale: 2 }).default("0"),
      currency: varchar3("currency", { length: 3 }).default("KES"),
      country: varchar3("country", { length: 10 }),
      industry: varchar3("industry", { length: 100 }),
      status: mysqlEnum2("status", ["new", "contacted", "qualified", "proposal_sent", "negotiating", "closed_won", "closed_lost"]).default("new"),
      assignedTo: varchar3("assignedTo", { length: 36 }),
      notes: text3("notes"),
      createdBy: varchar3("createdBy", { length: 36 }).notNull(),
      createdAt: datetime2("createdAt").notNull(),
      updatedAt: datetime2("updatedAt")
    }, (table) => ({
      orgIdx: index3("lead_org_idx").on(table.organizationId),
      statusIdx: index3("lead_status_idx").on(table.status),
      sourceIdx: index3("lead_source_idx").on(table.source)
    }));
    automationConfigs2 = mysqlTable3("automationConfigs", {
      id: varchar3("id", { length: 36 }).primaryKey(),
      organizationId: varchar3("organizationId", { length: 36 }).notNull(),
      workflowType: varchar3("workflowType", { length: 100 }).notNull(),
      enabled: boolean3("enabled").default(true),
      configuration: json3("configuration"),
      createdAt: datetime2("createdAt").notNull(),
      updatedAt: datetime2("updatedAt")
    }, (table) => ({
      orgIdx: index3("auto_org_idx").on(table.organizationId),
      workflowIdx: index3("auto_workflow_idx").on(table.workflowType)
    }));
    workflowAutomationLogs2 = mysqlTable3("workflowAutomationLogs", {
      id: varchar3("id", { length: 36 }).primaryKey(),
      organizationId: varchar3("organizationId", { length: 36 }).notNull(),
      workflowType: varchar3("workflowType", { length: 100 }).notNull(),
      sourceEntityId: varchar3("sourceEntityId", { length: 36 }),
      sourceEntityType: varchar3("sourceEntityType", { length: 50 }),
      targetEntityId: varchar3("targetEntityId", { length: 36 }),
      status: mysqlEnum2("status", ["pending", "completed", "failed"]).default("pending"),
      errorMessage: text3("errorMessage"),
      executedBy: varchar3("executedBy", { length: 36 }),
      executedAt: datetime2("executedAt").notNull(),
      createdAt: datetime2("createdAt").notNull()
    }, (table) => ({
      orgIdx: index3("wf_org_idx").on(table.organizationId),
      workflowIdx: index3("wf_workflow_idx").on(table.workflowType),
      sourceIdx: index3("wf_source_idx").on(table.sourceEntityId),
      targetIdx: index3("wf_target_idx").on(table.targetEntityId),
      dateIdx: index3("wf_date_idx").on(table.executedAt)
    }));
    performanceReviews2 = mysqlTable3(
      "performanceReviews",
      {
        id: varchar3("id", { length: 64 }).primaryKey(),
        employeeId: varchar3("employeeId", { length: 64 }).notNull(),
        reviewerId: varchar3("reviewerId", { length: 64 }).notNull(),
        rating: int3("rating").notNull(),
        // 1-5
        comments: text3("comments"),
        goals: text3("goals"),
        status: mysqlEnum2(["pending", "in_progress", "completed"]).default("pending").notNull(),
        reviewDate: timestamp3("reviewDate").defaultNow(),
        createdAt: timestamp3("createdAt").defaultNow(),
        updatedAt: timestamp3("updatedAt").defaultNow()
      },
      (table) => ({
        empIdx: index3("pr_employee_idx").on(table.employeeId),
        reviewerIdx: index3("pr_reviewer_idx").on(table.reviewerId)
      })
    );
    tickets2 = mysqlTable3(
      "tickets",
      {
        id: varchar3("id", { length: 64 }).primaryKey(),
        organizationId: varchar3("organizationId", { length: 64 }),
        clientId: varchar3("clientId", { length: 64 }).notNull(),
        title: varchar3("title", { length: 255 }).notNull(),
        description: text3("description"),
        category: varchar3("category", { length: 100 }),
        priority: mysqlEnum2(["low", "medium", "high"]).default("medium").notNull(),
        status: mysqlEnum2(["new", "open", "in_progress", "awaiting_client", "completed", "closed"]).default("new").notNull(),
        requestedDueDate: datetime2("requestedDueDate", { mode: "string" }),
        assignedTo: varchar3("assignedTo", { length: 64 }),
        createdBy: varchar3("createdBy", { length: 64 }).notNull(),
        createdAt: timestamp3("createdAt").defaultNow(),
        updatedAt: timestamp3("updatedAt").defaultNow()
      },
      (table) => ({
        clientIdx: index3("ticket_client_idx").on(table.clientId),
        statusIdx: index3("ticket_status_idx").on(table.status)
      })
    );
    ticketComments = mysqlTable3(
      "ticket_comments",
      {
        id: varchar3("id", { length: 64 }).primaryKey(),
        ticketId: varchar3("ticketId", { length: 64 }).notNull(),
        authorId: varchar3("authorId", { length: 64 }).notNull(),
        body: text3("body").notNull(),
        createdAt: timestamp3("createdAt").defaultNow()
      },
      (table) => ({
        ticketIdx: index3("comment_ticket_idx").on(table.ticketId),
        authorIdx: index3("comment_author_idx").on(table.authorId)
      })
    );
    ticketTasks = mysqlTable3(
      "ticket_tasks",
      {
        id: varchar3("id", { length: 64 }).primaryKey(),
        ticketId: varchar3("ticketId", { length: 64 }).notNull(),
        serviceType: varchar3("serviceType", { length: 100 }).notNull(),
        details: text3("details"),
        budget: int3("budget"),
        dueDate: datetime2("dueDate", { mode: "string" }),
        createdAt: timestamp3("createdAt").defaultNow()
      },
      (table) => ({
        ticketIdx: index3("task_ticket_idx").on(table.ticketId)
      })
    );
    suppliers = mysqlTable3(
      "suppliers",
      {
        id: varchar3("id", { length: 64 }).primaryKey(),
        organizationId: varchar3("organizationId", { length: 64 }),
        supplierNumber: varchar3("supplierNumber", { length: 50 }).notNull().unique(),
        companyName: varchar3("companyName", { length: 255 }).notNull(),
        registrationNumber: varchar3("registrationNumber", { length: 100 }).unique(),
        taxId: varchar3("taxId", { length: 100 }).unique(),
        contactPerson: varchar3("contactPerson", { length: 255 }),
        contactTitle: varchar3("contactTitle", { length: 100 }),
        email: varchar3("email", { length: 320 }),
        phone: varchar3("phone", { length: 50 }),
        alternatePhone: varchar3("alternatePhone", { length: 50 }),
        website: varchar3("website", { length: 255 }),
        address: text3("address"),
        city: varchar3("city", { length: 100 }),
        country: varchar3("country", { length: 100 }),
        industry: varchar3("industry", { length: 100 }),
        postalCode: varchar3("postalCode", { length: 20 }),
        bankName: varchar3("bankName", { length: 255 }),
        bankBranch: varchar3("bankBranch", { length: 255 }),
        accountNumber: varchar3("accountNumber", { length: 100 }),
        accountName: varchar3("accountName", { length: 255 }),
        paymentTerms: varchar3("paymentTerms", { length: 100 }),
        // e.g., "Net 30", "COD"
        paymentMethods: varchar3("paymentMethods", { length: 255 }),
        // JSON: ["bank_transfer", "check", "credit"]
        categories: varchar3("categories", { length: 500 }),
        // JSON: categories supplier provides
        qualificationStatus: mysqlEnum2("qualificationStatus", ["pending", "pre_qualified", "qualified", "rejected", "inactive"]).default("pending").notNull(),
        qualificationDate: datetime2("qualificationDate", { mode: "string" }),
        certifications: varchar3("certifications", { length: 500 }),
        // JSON: ["ISO9001", "ISO14001"]
        qualityRating: int3("qualityRating").default(0),
        // 0-100 rating
        deliveryRating: int3("deliveryRating").default(0),
        // 0-100 rating
        priceCompetitiveness: int3("priceCompetitiveness").default(0),
        // 0-100 rating
        averageRating: int3("averageRating").default(0),
        // Calculated average of above
        totalOrders: int3("totalOrders").default(0),
        totalSpent: int3("totalSpent").default(0),
        // In cents
        lastOrderDate: datetime2("lastOrderDate", { mode: "string" }),
        isActive: boolean3("isActive").default(true).notNull(),
        accountManagerId: varchar3("accountManagerId", { length: 64 }),
        notes: text3("notes"),
        createdBy: varchar3("createdBy", { length: 64 }),
        createdAt: timestamp3("createdAt").defaultNow(),
        updatedAt: timestamp3("updatedAt").defaultNow()
      },
      (table) => ({
        companyNameIdx: index3("supplier_company_idx").on(table.companyName),
        statusIdx: index3("supplier_status_idx").on(table.qualificationStatus),
        ratingIdx: index3("supplier_rating_idx").on(table.averageRating),
        activeIdx: index3("supplier_active_idx").on(table.isActive)
      })
    );
    supplierRatings = mysqlTable3(
      "supplierRatings",
      {
        id: varchar3("id", { length: 64 }).primaryKey(),
        supplierId: varchar3("supplierId", { length: 64 }).notNull(),
        orderId: varchar3("orderId", { length: 64 }),
        // Reference to procurement order
        qualityScore: int3("qualityScore").notNull(),
        // 1-5 stars
        deliveryScore: int3("deliveryScore").notNull(),
        // 1-5 stars
        priceScore: int3("priceScore").notNull(),
        // 1-5 stars
        serviceScore: int3("serviceScore").notNull(),
        // 1-5 stars
        comments: text3("comments"),
        ratedBy: varchar3("ratedBy", { length: 64 }).notNull(),
        createdAt: timestamp3("createdAt").defaultNow()
      },
      (table) => ({
        supplierIdx: index3("rating_supplier_idx").on(table.supplierId),
        orderIdx: index3("rating_order_idx").on(table.orderId)
      })
    );
    supplierAudits = mysqlTable3(
      "supplierAudits",
      {
        id: varchar3("id", { length: 64 }).primaryKey(),
        supplierId: varchar3("supplierId", { length: 64 }).notNull(),
        auditType: mysqlEnum2("auditType", ["qualification", "compliance", "performance", "certification", "manual"]).notNull(),
        auditDate: datetime2("auditDate", { mode: "string" }).notNull(),
        findings: text3("findings"),
        status: mysqlEnum2("status", ["passed", "failed", "conditional"]).notNull(),
        actionItems: text3("actionItems"),
        // JSON array of required actions
        auditedBy: varchar3("auditedBy", { length: 64 }),
        nextAuditDate: datetime2("nextAuditDate", { mode: "string" }),
        notes: text3("notes"),
        createdAt: timestamp3("createdAt").defaultNow()
      },
      (table) => ({
        supplierIdx: index3("audit_supplier_idx").on(table.supplierId),
        dateIdx: index3("audit_date_idx").on(table.auditDate)
      })
    );
    quotes = mysqlTable3(
      "quotes",
      {
        id: varchar3("id", { length: 64 }).primaryKey(),
        quoteNumber: varchar3("quoteNumber", { length: 50 }).notNull(),
        clientId: varchar3("clientId", { length: 64 }).notNull(),
        subject: varchar3("subject", { length: 255 }),
        description: text3("description"),
        status: mysqlEnum2("status", [
          "draft",
          "sent",
          "accepted",
          "expired",
          "declined",
          "converted"
        ]).default("draft").notNull(),
        subtotal: decimal2("subtotal", { precision: 12, scale: 2 }).default("0"),
        taxAmount: decimal2("taxAmount", { precision: 12, scale: 2 }).default("0"),
        total: decimal2("total", { precision: 12, scale: 2 }).default("0"),
        notes: text3("notes"),
        expirationDate: datetime2("expirationDate"),
        sentDate: timestamp3("sentDate"),
        acceptedDate: timestamp3("acceptedDate"),
        declinedDate: timestamp3("declinedDate"),
        convertedInvoiceId: varchar3("convertedInvoiceId", { length: 64 }),
        template: int3("template").default(0),
        createdBy: varchar3("createdBy", { length: 64 }),
        organizationId: varchar3("organizationId", { length: 64 }),
        createdAt: timestamp3("createdAt").defaultNow(),
        updatedAt: timestamp3("updatedAt").defaultNow()
      },
      (table) => ({
        clientIdx: index3("quote_client_idx").on(table.clientId),
        statusIdx: index3("quote_status_idx").on(table.status),
        orgIdx: index3("quote_org_idx").on(table.organizationId)
      })
    );
    lineItems2 = mysqlTable3(
      "lineItems",
      {
        id: varchar3("id", { length: 64 }).primaryKey(),
        quoteId: varchar3("quoteId", { length: 64 }).notNull(),
        description: text3("description"),
        quantity: int3("quantity").default(1),
        unitPrice: decimal2("unitPrice", { precision: 12, scale: 2 }).default("0"),
        taxRate: decimal2("taxRate", { precision: 5, scale: 2 }).default("0"),
        total: decimal2("total", { precision: 12, scale: 2 }).default("0"),
        createdAt: timestamp3("createdAt").defaultNow()
      },
      (table) => ({
        quoteIdx: index3("li_quote_idx").on(table.quoteId)
      })
    );
    quoteLogs = mysqlTable3(
      "quoteLogs",
      {
        id: varchar3("id", { length: 64 }).primaryKey(),
        quoteId: varchar3("quoteId", { length: 64 }).notNull(),
        action: varchar3("action", { length: 100 }).notNull(),
        description: text3("description"),
        userId: varchar3("userId", { length: 64 }),
        createdAt: timestamp3("createdAt").defaultNow()
      },
      (table) => ({
        quoteIdx: index3("ql_quote_idx").on(table.quoteId)
      })
    );
    userTablePreferences = mysqlTable3(
      "userTablePreferences",
      {
        id: varchar3("id", { length: 64 }).primaryKey(),
        userId: varchar3("userId", { length: 64 }).notNull(),
        organizationId: varchar3("organizationId", { length: 64 }),
        tableName: varchar3("tableName", { length: 100 }).notNull(),
        visibleColumns: text3("visibleColumns"),
        // JSON array of visible column keys
        columnOrder: text3("columnOrder"),
        // JSON array of column keys in order
        pageSize: int3("pageSize").default(25),
        createdAt: timestamp3("createdAt").defaultNow(),
        updatedAt: timestamp3("updatedAt").defaultNow()
      },
      (table) => ({
        userTableIdx: index3("utp_user_table_idx").on(table.userId, table.tableName),
        orgIdx: index3("utp_org_idx").on(table.organizationId)
      })
    );
    organizationMembers = mysqlTable3(
      "organizationMembers",
      {
        id: varchar3("id", { length: 64 }).primaryKey(),
        organizationId: varchar3("organizationId", { length: 64 }).notNull(),
        userId: varchar3("userId", { length: 64 }).notNull(),
        role: varchar3("role", { length: 50 }),
        status: mysqlEnum2("status", ["active", "inactive", "invited", "removed"]).default("active").notNull(),
        isActive: boolean3("isActive").default(true).notNull(),
        invitedBy: varchar3("invitedBy", { length: 64 }),
        joinedAt: datetime2("joinedAt"),
        leftAt: datetime2("leftAt"),
        createdAt: timestamp3("createdAt").defaultNow(),
        updatedAt: timestamp3("updatedAt").defaultNow()
      },
      (table) => ({
        orgIdx: index3("org_members_org_idx").on(table.organizationId),
        userIdx: index3("org_members_user_idx").on(table.userId),
        orgUserIdx: index3("org_members_org_user_idx").on(table.organizationId, table.userId),
        statusIdx: index3("org_members_status_idx").on(table.status)
      })
    );
  }
});

// server/_core/env.ts
var ENV;
var init_env = __esm({
  "server/_core/env.ts"() {
    ENV = {
      appId: process.env.VITE_APP_ID ?? "",
      cookieSecret: process.env.JWT_SECRET ?? "",
      databaseUrl: process.env.DATABASE_URL ?? "",
      oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
      ownerId: process.env.OWNER_OPEN_ID ?? "",
      isProduction: process.env.NODE_ENV === "production",
      forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
      forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
      anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? "",
      anthropicApiUrl: process.env.ANTHROPIC_API_URL ?? "",
      anthropicModel: process.env.ANTHROPIC_MODEL ?? "",
      smtpHost: process.env.SMTP_HOST ?? "",
      smtpPort: process.env.SMTP_PORT ?? "",
      smtpUser: process.env.SMTP_USER ?? "",
      smtpPass: process.env.SMTP_PASS ?? "",
      smtpFrom: process.env.SMTP_FROM ?? ""
    };
  }
});

// server/utils/legacySchemaCompatibility.ts
function getMissingColumnsForTable(tableName, existingColumns) {
  const existing = new Set(Array.from(existingColumns, (column) => column.toLowerCase()));
  const requiredColumns = legacyColumnCatalog[tableName.toLowerCase()] ?? [];
  return requiredColumns.filter((column) => !existing.has(column.name.toLowerCase()));
}
function getRuntimeSchemaCheckTargets() {
  return [
    "integration_configs",
    "notes",
    "userTablePreferences",
    "organizationMembers",
    "staffChatMessages",
    "documents",
    "invoices",
    "users",
    "customRoles",
    "organizations",
    "payslips",
    "notifications",
    "departments",
    "jobGroups",
    "eSignatureRequests",
    "backup_history",
    "clients",
    "payments",
    "receipts",
    "estimates",
    "quotations",
    "contacts",
    "products",
    "services",
    "suppliers",
    "opportunities",
    "employees",
    "leaveRequests",
    "attendance",
    "employeeBenefits",
    "payrollDetails",
    "projectBudgets",
    "departmentBudgets",
    "creditNotes",
    "warranties",
    "lpos",
    "grnRecords",
    "serviceInvoices",
    "serviceTemplates",
    "emailQueue",
    "emailTemplates",
    "proposalTemplates",
    "contractTemplates",
    "scheduledJobs",
    "jobExecutionLogs",
    "jobAlertRules",
    "jobAlertHistory",
    "jobHeartbeat",
    "projects"
  ];
}
function getMissingTableDefinitions(existingTables) {
  const existing = new Set(Array.from(existingTables, (table) => table.toLowerCase()));
  return Object.values(legacyTableCatalog).filter((table) => !existing.has(table.name.toLowerCase()));
}
var legacyColumnCatalog, legacyTableCatalog;
var init_legacySchemaCompatibility = __esm({
  "server/utils/legacySchemaCompatibility.ts"() {
    legacyColumnCatalog = {
      integration_configs: [
        { name: "name", definition: "varchar(200) NULL" },
        { name: "service", definition: "varchar(100) NULL" },
        { name: "integrationType", definition: "varchar(50) NULL" },
        { name: "config", definition: "text NULL" },
        { name: "status", definition: "varchar(20) NULL DEFAULT 'inactive'" },
        { name: "isActive", definition: "tinyint NOT NULL DEFAULT 1" },
        { name: "lastSync", definition: "timestamp NULL" },
        { name: "lastSyncAt", definition: "timestamp NULL" },
        { name: "createdBy", definition: "varchar(64) NULL" },
        { name: "createdAt", definition: "timestamp NULL DEFAULT CURRENT_TIMESTAMP" },
        { name: "updatedAt", definition: "timestamp NULL DEFAULT CURRENT_TIMESTAMP" }
      ],
      notes: [
        { name: "title", definition: "varchar(300) NULL" },
        { name: "content", definition: "text NULL" },
        { name: "category", definition: "varchar(100) NULL DEFAULT 'General'" },
        { name: "pinned", definition: "tinyint NOT NULL DEFAULT 0" },
        { name: "favorite", definition: "tinyint NOT NULL DEFAULT 0" },
        { name: "createdBy", definition: "varchar(64) NULL" },
        { name: "organizationId", definition: "varchar(64) NULL" },
        { name: "createdAt", definition: "timestamp NULL DEFAULT CURRENT_TIMESTAMP" },
        { name: "updatedAt", definition: "timestamp NULL DEFAULT CURRENT_TIMESTAMP" }
      ],
      recurringInvoices: [
        { name: "accountManagerId", definition: "varchar(64) NULL" }
      ],
      invoices: [
        { name: "organizationId", definition: "varchar(64) NULL" },
        { name: "accountManagerId", definition: "varchar(64) NULL" }
      ],
      users: [
        { name: "emailVerified", definition: "timestamp NULL" },
        { name: "failedLoginAttempts", definition: "int NOT NULL DEFAULT 0" },
        { name: "lockedUntil", definition: "timestamp NULL" },
        { name: "lockoutCount", definition: "int NOT NULL DEFAULT 0" },
        { name: "emailVerificationRequired", definition: "tinyint NOT NULL DEFAULT 0" },
        { name: "twoFactorEnabled", definition: "tinyint NOT NULL DEFAULT 0" },
        { name: "twoFactorSecret", definition: "varchar(255) NULL" },
        { name: "customRoleId", definition: "varchar(64) NULL" }
      ],
      customRoles: [
        { name: "organizationId", definition: "varchar(64) NULL" },
        { name: "name", definition: "varchar(100) NULL" },
        { name: "displayName", definition: "varchar(255) NULL" },
        { name: "description", definition: "text NULL" },
        { name: "permissions", definition: "text NULL" },
        { name: "baseRole", definition: "varchar(50) NULL DEFAULT 'staff'" },
        { name: "isAdvanced", definition: "tinyint NOT NULL DEFAULT 0" },
        { name: "isSystem", definition: "tinyint NOT NULL DEFAULT 0" },
        { name: "isActive", definition: "tinyint NOT NULL DEFAULT 1" },
        { name: "createdBy", definition: "varchar(64) NULL" },
        { name: "createdAt", definition: "timestamp NULL DEFAULT CURRENT_TIMESTAMP" },
        { name: "updatedAt", definition: "timestamp NULL DEFAULT CURRENT_TIMESTAMP" }
      ],
      organizations: [
        { name: "isArchived", definition: "tinyint NOT NULL DEFAULT 0" },
        { name: "archivedAt", definition: "timestamp NULL" },
        { name: "archivedBy", definition: "varchar(64) NULL" },
        { name: "logoUrl", definition: "longtext NULL" },
        { name: "domain", definition: "varchar(255) NULL" },
        { name: "contactEmail", definition: "varchar(320) NULL" },
        { name: "contactPhone", definition: "varchar(50) NULL" },
        { name: "address", definition: "text NULL" },
        { name: "country", definition: "varchar(100) NULL" },
        { name: "industry", definition: "varchar(100) NULL" },
        { name: "website", definition: "varchar(255) NULL" },
        { name: "taxId", definition: "varchar(100) NULL" },
        { name: "billingEmail", definition: "varchar(320) NULL" },
        { name: "timezone", definition: "varchar(100) NULL DEFAULT 'Africa/Nairobi'" },
        { name: "currency", definition: "varchar(10) NULL DEFAULT 'KES'" },
        { name: "description", definition: "text NULL" },
        { name: "employeeCount", definition: "int NULL" },
        { name: "registrationNumber", definition: "varchar(100) NULL" },
        { name: "paymentMethod", definition: "varchar(50) NULL" },
        { name: "updatedAt", definition: "timestamp NULL DEFAULT CURRENT_TIMESTAMP" }
      ],
      payslips: [
        { name: "payMonth", definition: "datetime NULL" }
      ],
      employees: [
        { name: "country", definition: "varchar(5) DEFAULT 'KE'" },
        { name: "gender", definition: "enum('male','female','other') NULL" },
        { name: "maritalStatus", definition: "enum('single','married','divorced','widowed') NULL" },
        { name: "jobGroupId", definition: "varchar(64) NULL" },
        { name: "probationEndDate", definition: "datetime NULL" },
        { name: "contractEndDate", definition: "datetime NULL" },
        { name: "emergencyContactName", definition: "varchar(255) NULL" },
        { name: "emergencyContactRelationship", definition: "varchar(100) NULL" },
        { name: "emergencyContactPhone", definition: "varchar(50) NULL" },
        { name: "bankName", definition: "varchar(255) NULL" },
        { name: "bankBranch", definition: "varchar(255) NULL" },
        { name: "nhifNumber", definition: "varchar(50) NULL" },
        { name: "nssfNumber", definition: "varchar(50) NULL" },
        { name: "organizationId", definition: "varchar(64) NULL" }
      ],
      leaverequests: [
        { name: "organizationId", definition: "varchar(64) NULL" }
      ],
      attendance: [
        { name: "organizationId", definition: "varchar(64) NULL" }
      ],
      employeebenefits: [
        { name: "employerCost", definition: "int NULL" },
        { name: "notes", definition: "text NULL" }
      ],
      payrolldetails: [
        { name: "componentType", definition: "varchar(100) NULL" },
        { name: "component", definition: "varchar(255) NULL" },
        { name: "notes", definition: "text NULL" }
      ],
      notifications: [
        {
          name: "deliveryStatus",
          definition: "enum('pending','sent','failed') NOT NULL DEFAULT 'pending'"
        },
        {
          name: "deliveryDate",
          definition: "timestamp NULL"
        },
        {
          name: "status",
          definition: "enum('active','archived') NOT NULL DEFAULT 'active'"
        }
      ],
      staffChatMessages: [
        { name: "userId", definition: "varchar(64) NULL" },
        { name: "userName", definition: "varchar(255) NULL" },
        { name: "content", definition: "text NULL" },
        { name: "emoji", definition: "varchar(10) NULL" },
        { name: "replyToId", definition: "varchar(64) NULL" },
        { name: "replyToUser", definition: "varchar(255) NULL" },
        { name: "fileUrl", definition: "varchar(500) NULL" },
        { name: "fileName", definition: "varchar(255) NULL" },
        { name: "fileType", definition: "varchar(50) NULL" },
        { name: "isEdited", definition: "tinyint NOT NULL DEFAULT 0" },
        { name: "createdAt", definition: "timestamp NULL DEFAULT CURRENT_TIMESTAMP" },
        { name: "updatedAt", definition: "timestamp NULL DEFAULT CURRENT_TIMESTAMP" },
        { name: "encryptedKeys", definition: "text NULL" },
        { name: "encryptionNonce", definition: "varchar(64) NULL" },
        { name: "encryptionVersion", definition: "varchar(10) NULL" }
      ],
      documents: [
        { name: "linkedInvoiceId", definition: "varchar(64) NULL" }
      ],
      departments: [
        {
          name: "defaultRole",
          definition: "varchar(100) NULL"
        },
        {
          name: "organizationId",
          definition: "varchar(64) NULL"
        },
        { name: "description", definition: "text NULL" },
        { name: "headId", definition: "varchar(64) NULL" },
        { name: "budget", definition: "int NULL" },
        { name: "salaryRangeMin", definition: "int NULL" },
        { name: "salaryRangeMax", definition: "int NULL" },
        { name: "status", definition: "varchar(20) NULL DEFAULT 'active'" },
        { name: "createdBy", definition: "varchar(64) NULL" },
        { name: "createdAt", definition: "timestamp NULL DEFAULT CURRENT_TIMESTAMP" },
        { name: "updatedAt", definition: "timestamp NULL DEFAULT CURRENT_TIMESTAMP" }
      ],
      jobGroups: [
        { name: "organizationId", definition: "varchar(64) NULL" },
        { name: "managerId", definition: "varchar(64) NULL" },
        { name: "minimumGrossSalary", definition: "int NULL" },
        { name: "maximumGrossSalary", definition: "int NULL" },
        { name: "defaultBasicSalary", definition: "int NULL" },
        { name: "defaultAnnualLeaveDays", definition: "int NOT NULL DEFAULT 21" },
        { name: "defaultAllowances", definition: "text NULL" },
        { name: "defaultDeductions", definition: "text NULL" },
        { name: "defaultBenefits", definition: "text NULL" },
        { name: "description", definition: "text NULL" },
        { name: "isActive", definition: "tinyint NOT NULL DEFAULT 1" },
        { name: "createdAt", definition: "timestamp NULL DEFAULT CURRENT_TIMESTAMP" },
        { name: "updatedAt", definition: "timestamp NULL DEFAULT CURRENT_TIMESTAMP" }
      ],
      clients: [
        { name: "organizationId", definition: "varchar(64) NULL" },
        { name: "secondaryPhone", definition: "varchar(50) NULL" },
        { name: "businessType", definition: "varchar(100) NULL" },
        { name: "registrationNumber", definition: "varchar(100) NULL" },
        { name: "bankName", definition: "varchar(255) NULL" },
        { name: "bankCode", definition: "varchar(50) NULL" },
        { name: "branch", definition: "varchar(100) NULL" },
        { name: "bankAccountNumber", definition: "varchar(100) NULL" },
        { name: "creditLimit", definition: "int NULL" },
        { name: "paymentTerms", definition: "varchar(100) NULL" },
        { name: "numberOfEmployees", definition: "int NULL" },
        { name: "yearEstablished", definition: "int NULL" },
        { name: "businessLicense", definition: "varchar(255) NULL" },
        { name: "leadSource", definition: "varchar(100) NULL" },
        { name: "currency", definition: "varchar(10) NULL" }
      ],
      projects: [
        { name: "projectNumber", definition: "varchar(100) NULL" },
        { name: "actualStartDate", definition: "datetime NULL" },
        { name: "actualEndDate", definition: "datetime NULL" },
        { name: "actualCost", definition: "int NULL DEFAULT 0" },
        { name: "progress", definition: "int NULL DEFAULT 0" },
        { name: "projectColor", definition: "varchar(50) NULL DEFAULT 'primary'" },
        { name: "teamSize", definition: "int NULL DEFAULT 1" },
        { name: "projectRating", definition: "int NULL DEFAULT 0" },
        { name: "coverImageUrl", definition: "text NULL" },
        { name: "projectManager", definition: "varchar(64) NULL" },
        { name: "assignedTo", definition: "varchar(64) NULL" },
        { name: "organizationId", definition: "varchar(64) NULL" },
        { name: "tags", definition: "text NULL" },
        { name: "notes", definition: "text NULL" }
      ],
      // Organization isolation columns (multi-tenant support)
      payments: [
        {
          name: "organizationId",
          definition: "varchar(64) NULL"
        }
      ],
      receipts: [
        {
          name: "organizationId",
          definition: "varchar(64) NULL"
        }
      ],
      estimates: [
        {
          name: "organizationId",
          definition: "varchar(64) NULL"
        }
      ],
      quotations: [
        {
          name: "organizationId",
          definition: "varchar(64) NULL"
        }
      ],
      contacts: [
        {
          name: "organizationId",
          definition: "varchar(64) NULL"
        }
      ],
      products: [
        {
          name: "organizationId",
          definition: "varchar(64) NULL"
        }
      ],
      services: [
        {
          name: "organizationId",
          definition: "varchar(64) NULL"
        }
      ],
      suppliers: [
        { name: "organizationId", definition: "varchar(64) NULL" },
        { name: "supplierNumber", definition: "varchar(50) NULL UNIQUE" },
        { name: "registrationNumber", definition: "varchar(100) NULL" },
        { name: "taxId", definition: "varchar(100) NULL" },
        { name: "contactPerson", definition: "varchar(255) NULL" },
        { name: "contactTitle", definition: "varchar(100) NULL" },
        { name: "alternatePhone", definition: "varchar(50) NULL" },
        { name: "website", definition: "varchar(255) NULL" },
        { name: "address", definition: "text NULL" },
        { name: "city", definition: "varchar(100) NULL" },
        { name: "country", definition: "varchar(100) NULL" },
        { name: "postalCode", definition: "varchar(20) NULL" },
        { name: "bankName", definition: "varchar(255) NULL" },
        { name: "bankBranch", definition: "varchar(255) NULL" },
        { name: "accountNumber", definition: "varchar(100) NULL" },
        { name: "accountName", definition: "varchar(255) NULL" },
        { name: "paymentTerms", definition: "varchar(100) NULL" },
        { name: "paymentMethods", definition: "varchar(255) NULL" },
        { name: "categories", definition: "varchar(500) NULL" },
        { name: "qualificationStatus", definition: "enum('pending','pre_qualified','qualified','rejected','inactive') NOT NULL DEFAULT 'pending'" },
        { name: "qualificationDate", definition: "datetime NULL" },
        { name: "certifications", definition: "varchar(500) NULL" },
        { name: "qualityRating", definition: "int NULL DEFAULT 0" },
        { name: "deliveryRating", definition: "int NULL DEFAULT 0" },
        { name: "priceCompetitiveness", definition: "int NULL DEFAULT 0" },
        { name: "averageRating", definition: "int NULL DEFAULT 0" },
        { name: "totalOrders", definition: "int NULL DEFAULT 0" },
        { name: "totalSpent", definition: "int NULL DEFAULT 0" },
        { name: "lastOrderDate", definition: "datetime NULL" },
        { name: "isActive", definition: "tinyint NOT NULL DEFAULT 1" },
        { name: "accountManagerId", definition: "varchar(64) NULL" },
        { name: "notes", definition: "text NULL" },
        { name: "createdBy", definition: "varchar(64) NULL" },
        { name: "createdAt", definition: "timestamp NULL DEFAULT CURRENT_TIMESTAMP" },
        { name: "updatedAt", definition: "timestamp NULL DEFAULT CURRENT_TIMESTAMP" }
      ],
      opportunities: [
        {
          name: "organizationId",
          definition: "varchar(64) NULL"
        }
      ],
      projectBudgets: [
        {
          name: "organizationId",
          definition: "varchar(64) NULL"
        }
      ],
      departmentBudgets: [
        {
          name: "organizationId",
          definition: "varchar(64) NULL"
        }
      ],
      creditNotes: [
        {
          name: "organizationId",
          definition: "varchar(64) NULL"
        }
      ],
      warranties: [
        {
          name: "organizationId",
          definition: "varchar(64) NULL"
        }
      ],
      lpos: [
        {
          name: "organizationId",
          definition: "varchar(64) NULL"
        }
      ],
      grnRecords: [
        {
          name: "organizationId",
          definition: "varchar(64) NULL"
        }
      ],
      serviceInvoices: [
        {
          name: "organizationId",
          definition: "varchar(64) NULL"
        }
      ],
      serviceTemplates: [
        {
          name: "organizationId",
          definition: "varchar(64) NULL"
        }
      ],
      emailTemplates: [
        {
          name: "organizationId",
          definition: "varchar(64) NULL"
        },
        {
          name: "plainTextContent",
          definition: "text NULL"
        },
        {
          name: "attachments",
          definition: "json NULL"
        },
        {
          name: "isDefault",
          definition: "tinyint NOT NULL DEFAULT 0"
        },
        {
          name: "isSystem",
          definition: "tinyint NOT NULL DEFAULT 0"
        }
      ],
      emailQueue: [
        {
          name: "organizationId",
          definition: "varchar(64) NULL"
        }
      ],
      paymentTriggers: [
        { name: "invoiceId", definition: "varchar(64) NULL" },
        { name: "metadata", definition: "json NULL" }
      ],
      proposalTemplates: [
        {
          name: "organizationId",
          definition: "varchar(64) NULL"
        }
      ],
      contractTemplates: [
        {
          name: "organizationId",
          definition: "varchar(64) NULL"
        }
      ],
      payroll: [
        { name: "employeeId", definition: "varchar(64) NOT NULL" },
        { name: "payPeriodStart", definition: "datetime NOT NULL" },
        { name: "payPeriodEnd", definition: "datetime NOT NULL" },
        { name: "basicSalary", definition: "int NOT NULL" },
        { name: "allowances", definition: "int NULL DEFAULT 0" },
        { name: "deductions", definition: "int NULL DEFAULT 0" },
        { name: "tax", definition: "int NULL DEFAULT 0" },
        { name: "netSalary", definition: "int NOT NULL" },
        { name: "status", definition: "enum('draft','processed','paid') NOT NULL DEFAULT 'draft'" },
        { name: "paymentDate", definition: "datetime NULL" },
        { name: "paymentMethod", definition: "varchar(50) NULL" },
        { name: "notes", definition: "text NULL" },
        { name: "createdBy", definition: "varchar(64) NULL" },
        { name: "createdAt", definition: "timestamp NULL DEFAULT CURRENT_TIMESTAMP" },
        { name: "updatedAt", definition: "timestamp NULL DEFAULT CURRENT_TIMESTAMP" }
      ],
      scheduledJobs: [
        {
          name: "organizationId",
          definition: "varchar(64) NULL"
        }
      ]
    };
    legacyTableCatalog = {
      eSignatureRequests: {
        name: "eSignatureRequests",
        createSql: `CREATE TABLE IF NOT EXISTS eSignatureRequests (
      id VARCHAR(64) NOT NULL PRIMARY KEY,
      organizationId VARCHAR(64) NULL,
      title VARCHAR(255) NOT NULL,
      documentContent LONGTEXT NOT NULL,
      signerName VARCHAR(255) NOT NULL,
      signerEmail VARCHAR(320) NOT NULL,
      signingToken VARCHAR(128) NOT NULL UNIQUE,
      status ENUM('pending','signed','declined','expired') NOT NULL DEFAULT 'pending',
      signatureData LONGTEXT NULL,
      signedAt TIMESTAMP NULL,
      expiresAt TIMESTAMP NULL,
      createdBy VARCHAR(64) NOT NULL,
      createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
      },
      jobGroups: {
        name: "jobGroups",
        createSql: `CREATE TABLE IF NOT EXISTS jobGroups (
      id VARCHAR(64) NOT NULL PRIMARY KEY,
      organizationId VARCHAR(64) NULL,
      name VARCHAR(100) NOT NULL,
      managerId VARCHAR(64) NULL,
      minimumGrossSalary INT NULL,
      maximumGrossSalary INT NULL,
      description TEXT NULL,
      isActive TINYINT NOT NULL DEFAULT 1,
      createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX job_group_org_idx (organizationId),
      INDEX job_group_manager_idx (managerId),
      INDEX job_group_name_idx (name),
      INDEX is_active_idx (isActive)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
      },
      customRoles: {
        name: "customRoles",
        createSql: `CREATE TABLE IF NOT EXISTS customRoles (
      id VARCHAR(64) NOT NULL PRIMARY KEY,
      organizationId VARCHAR(64) NULL,
      name VARCHAR(100) NOT NULL,
      displayName VARCHAR(255) NOT NULL,
      description TEXT NULL,
      permissions TEXT NULL,
      baseRole VARCHAR(50) DEFAULT 'staff',
      isAdvanced TINYINT NOT NULL DEFAULT 0,
      isSystem TINYINT NOT NULL DEFAULT 0,
      isActive TINYINT NOT NULL DEFAULT 1,
      createdBy VARCHAR(64) NULL,
      createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_customRoles_orgId (organizationId),
      INDEX idx_customRoles_name (name),
      INDEX idx_customRoles_active (isActive)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
      },
      payroll: {
        name: "payroll",
        createSql: `CREATE TABLE IF NOT EXISTS payroll (
      id VARCHAR(64) NOT NULL PRIMARY KEY,
      employeeId VARCHAR(64) NOT NULL,
      payPeriodStart DATETIME NOT NULL,
      payPeriodEnd DATETIME NOT NULL,
      basicSalary INT NOT NULL,
      allowances INT NULL DEFAULT 0,
      deductions INT NULL DEFAULT 0,
      tax INT NULL DEFAULT 0,
      netSalary INT NOT NULL,
      status ENUM('draft','processed','paid') NOT NULL DEFAULT 'draft',
      paymentDate DATETIME NULL,
      paymentMethod VARCHAR(50) NULL,
      notes TEXT NULL,
      createdBy VARCHAR(64) NULL,
      createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_payroll_employee (employeeId),
      INDEX idx_payroll_period (payPeriodStart, payPeriodEnd),
      INDEX idx_payroll_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
      },
      paymentTriggers: {
        name: "paymentTriggers",
        createSql: `CREATE TABLE IF NOT EXISTS paymentTriggers (
      id VARCHAR(64) NOT NULL PRIMARY KEY,
      organizationId VARCHAR(64) NOT NULL,
      invoiceId VARCHAR(64) NULL,
      triggerType VARCHAR(100) NOT NULL,
      triggerDate TIMESTAMP NULL,
      isActive TINYINT NOT NULL DEFAULT 1,
      status VARCHAR(50) NOT NULL DEFAULT 'pending',
      actionType VARCHAR(100) NOT NULL DEFAULT 'invoice_generate',
      amount DECIMAL(10, 2) NULL,
      description TEXT NULL,
      metadata JSON NULL,
      retryCount INT NOT NULL DEFAULT 0,
      lastRetryAt TIMESTAMP NULL,
      nextRetryAt TIMESTAMP NULL,
      completedAt TIMESTAMP NULL,
      errorMessage TEXT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_payment_triggers_org (organizationId),
      INDEX idx_payment_triggers_date (triggerDate),
      INDEX idx_payment_triggers_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
      },
      emailTemplates: {
        name: "emailTemplates",
        createSql: `CREATE TABLE IF NOT EXISTS emailTemplates (
      id VARCHAR(64) NOT NULL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      subject VARCHAR(500) NOT NULL,
      htmlContent LONGTEXT NOT NULL,
      plainTextContent TEXT NULL,
      variables JSON NULL,
      category VARCHAR(100) NOT NULL DEFAULT 'general',
      attachments JSON NULL,
      isDefault TINYINT NOT NULL DEFAULT 0,
      isSystem TINYINT NOT NULL DEFAULT 0,
      createdBy VARCHAR(64) NULL,
      organizationId VARCHAR(64) NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_email_templates_org (organizationId),
      INDEX idx_email_templates_category (category)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
      },
      contractTemplates: {
        name: "contractTemplates",
        createSql: `CREATE TABLE IF NOT EXISTS contractTemplates (
      id VARCHAR(64) NOT NULL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      content LONGTEXT NOT NULL,
      createdBy VARCHAR(64) NULL,
      organizationId VARCHAR(64) NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_contract_templates_org (organizationId),
      INDEX idx_contract_templates_created (createdAt)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
      },
      proposalTemplates: {
        name: "proposalTemplates",
        createSql: `CREATE TABLE IF NOT EXISTS proposalTemplates (
      id VARCHAR(64) NOT NULL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      content LONGTEXT NOT NULL,
      createdBy VARCHAR(64) NULL,
      organizationId VARCHAR(64) NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_proposal_templates_org (organizationId),
      INDEX idx_proposal_templates_created (createdAt)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
      },
      scheduledJobs: {
        name: "scheduledJobs",
        createSql: `CREATE TABLE IF NOT EXISTS scheduledJobs (
      id VARCHAR(64) NOT NULL PRIMARY KEY,
      organizationId VARCHAR(64) NOT NULL,
      jobName VARCHAR(255) NOT NULL,
      jobType VARCHAR(100) NOT NULL,
      schedule VARCHAR(255) NOT NULL,
      description TEXT NULL,
      cronExpression VARCHAR(255) NULL,
      handler TEXT NULL,
      status ENUM('active','inactive','paused') NOT NULL DEFAULT 'active',
      isActive TINYINT NOT NULL DEFAULT 1,
      isManualOnly TINYINT NOT NULL DEFAULT 0,
      lastRun TIMESTAMP NULL,
      nextRun TIMESTAMP NULL,
      lastExecutedAt TIMESTAMP NULL,
      nextExecutionAt TIMESTAMP NULL,
      lastRunAt TIMESTAMP NULL,
      lastRunStatus ENUM('success','failed','partial','timeout') NULL,
      lastRunDuration INT NULL,
      nextScheduledRun TIMESTAMP NULL,
      lastFailureReason TEXT NULL,
      failureCount INT NOT NULL DEFAULT 0,
      timezone VARCHAR(100) NULL DEFAULT 'UTC',
      createdBy VARCHAR(64) NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_scheduled_jobs_org (organizationId),
      INDEX idx_scheduled_jobs_status (status),
      INDEX idx_scheduled_jobs_active (isActive)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
      },
      jobExecutionLogs: {
        name: "jobExecutionLogs",
        createSql: `CREATE TABLE IF NOT EXISTS jobExecutionLogs (
      id VARCHAR(64) NOT NULL PRIMARY KEY,
      jobId VARCHAR(64) NOT NULL,
      status ENUM('pending','running','completed','failed','success','partial','timeout') NOT NULL DEFAULT 'pending',
      startTime TIMESTAMP NULL,
      startedAt TIMESTAMP NULL,
      completedAt TIMESTAMP NULL,
      executedAt TIMESTAMP NULL,
      endTime TIMESTAMP NULL,
      duration INT NULL,
      durationMs INT NULL,
      itemsProcessed INT NOT NULL DEFAULT 0,
      itemsFailed INT NOT NULL DEFAULT 0,
      itemsSkipped INT NOT NULL DEFAULT 0,
      errorMessage TEXT NULL,
      stdout LONGTEXT NULL,
      stderr LONGTEXT NULL,
      metadata JSON NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_job_execution_logs_job_id (jobId),
      INDEX idx_job_execution_logs_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
      },
      jobAlertRules: {
        name: "jobAlertRules",
        createSql: `CREATE TABLE IF NOT EXISTS jobAlertRules (
      id VARCHAR(64) NOT NULL PRIMARY KEY,
      jobId VARCHAR(64) NOT NULL,
      alertType ENUM('failure','timeout','performance') NOT NULL,
      threshold INT NULL,
      triggerCondition VARCHAR(100) NULL,
      failureThreshold INT NULL,
      durationThresholdMs INT NULL,
      notificationChannels JSON NULL,
      recipients JSON NULL,
      action VARCHAR(100) NULL,
      isActive TINYINT NOT NULL DEFAULT 1,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_job_alert_rules_job_id (jobId),
      INDEX idx_job_alert_rules_active (isActive)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
      },
      jobAlertHistory: {
        name: "jobAlertHistory",
        createSql: `CREATE TABLE IF NOT EXISTS jobAlertHistory (
      id VARCHAR(64) NOT NULL PRIMARY KEY,
      ruleId VARCHAR(64) NOT NULL,
      alertRuleId VARCHAR(64) NULL,
      alertMessage TEXT NULL,
      message TEXT NULL,
      sentAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      alert_sent_at TIMESTAMP NULL,
      recipients JSON NULL,
      INDEX idx_job_alert_history_rule_id (ruleId)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
      },
      jobHeartbeat: {
        name: "jobHeartbeat",
        createSql: `CREATE TABLE IF NOT EXISTS jobHeartbeat (
      id VARCHAR(64) NOT NULL PRIMARY KEY,
      jobId VARCHAR(64) NOT NULL UNIQUE,
      lastHeartbeatAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      checkedAt TIMESTAMP NULL,
      expectedHeartbeatInterval INT NULL,
      isHealthy TINYINT NOT NULL DEFAULT 1,
      consecutiveFailures INT NOT NULL DEFAULT 0,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_job_heartbeat_job_id (jobId),
      INDEX idx_job_heartbeat_healthy (isHealthy)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
      },
      integration_configs: {
        name: "integration_configs",
        createSql: `CREATE TABLE IF NOT EXISTS integration_configs (
      id VARCHAR(64) NOT NULL PRIMARY KEY,
      provider VARCHAR(100) NOT NULL,
      name VARCHAR(200) NULL,
      service VARCHAR(100) NULL,
      integrationType VARCHAR(50) NULL,
      config TEXT NULL,
      status VARCHAR(20) DEFAULT 'inactive',
      isActive TINYINT NOT NULL DEFAULT 1,
      lastSync TIMESTAMP NULL,
      lastSyncAt TIMESTAMP NULL,
      createdBy VARCHAR(64) NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_ic_provider (provider),
      INDEX idx_ic_active (isActive),
      INDEX idx_ic_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
      },
      contacts: {
        name: "contacts",
        createSql: `CREATE TABLE IF NOT EXISTS contacts (
      id VARCHAR(64) NOT NULL PRIMARY KEY,
      organizationId VARCHAR(64) NULL,
      clientId VARCHAR(64) NULL,
      salutation VARCHAR(20) NULL,
      firstName VARCHAR(100) NOT NULL,
      lastName VARCHAR(100) NOT NULL,
      email VARCHAR(320) NULL,
      phone VARCHAR(50) NULL,
      mobile VARCHAR(50) NULL,
      jobTitle VARCHAR(200) NULL,
      department VARCHAR(200) NULL,
      isPrimary TINYINT DEFAULT 0,
      notes TEXT NULL,
      address TEXT NULL,
      city VARCHAR(100) NULL,
      country VARCHAR(100) NULL,
      postalCode VARCHAR(20) NULL,
      linkedIn VARCHAR(500) NULL,
      createdBy VARCHAR(64) NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_contacts_client (clientId),
      INDEX idx_contacts_email (email)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
      },
      notes: {
        name: "notes",
        createSql: `CREATE TABLE IF NOT EXISTS notes (
      id VARCHAR(64) NOT NULL PRIMARY KEY,
      title VARCHAR(300) NOT NULL,
      content TEXT NULL,
      category VARCHAR(100) NOT NULL DEFAULT 'General',
      pinned TINYINT NOT NULL DEFAULT 0,
      favorite TINYINT NOT NULL DEFAULT 0,
      createdBy VARCHAR(64) NOT NULL,
      organizationId VARCHAR(64) NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_notes_created_by (createdBy),
      INDEX idx_notes_category (category)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
      },
      userTablePreferences: {
        name: "userTablePreferences",
        createSql: `CREATE TABLE IF NOT EXISTS userTablePreferences (
      id VARCHAR(64) NOT NULL PRIMARY KEY,
      userId VARCHAR(64) NOT NULL,
      organizationId VARCHAR(64) NULL,
      tableName VARCHAR(100) NOT NULL,
      visibleColumns TEXT NULL,
      columnOrder TEXT NULL,
      pageSize INT DEFAULT 25,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX utp_user_table_idx (userId, tableName),
      INDEX utp_org_idx (organizationId)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
      },
      organizationMembers: {
        name: "organizationMembers",
        createSql: `CREATE TABLE IF NOT EXISTS organizationMembers (
      id VARCHAR(64) NOT NULL PRIMARY KEY,
      organizationId VARCHAR(64) NOT NULL,
      userId VARCHAR(64) NOT NULL,
      role VARCHAR(50) NULL,
      status ENUM('active', 'inactive', 'invited', 'removed') NOT NULL DEFAULT 'active',
      isActive TINYINT NOT NULL DEFAULT 1,
      invitedBy VARCHAR(64) NULL,
      joinedAt DATETIME NULL,
      leftAt DATETIME NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX org_members_org_idx (organizationId),
      INDEX org_members_user_idx (userId),
      INDEX org_members_org_user_idx (organizationId, userId),
      INDEX org_members_status_idx (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
      },
      staffChatMessages: {
        name: "staffChatMessages",
        createSql: `CREATE TABLE IF NOT EXISTS staffChatMessages (
      id VARCHAR(64) NOT NULL PRIMARY KEY,
      channelId VARCHAR(100) NOT NULL,
      userId VARCHAR(64) NOT NULL,
      userName VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      emoji VARCHAR(10) NULL,
      replyToId VARCHAR(64) NULL,
      replyToUser VARCHAR(255) NULL,
      fileUrl VARCHAR(500) NULL,
      fileName VARCHAR(255) NULL,
      fileType VARCHAR(50) NULL,
      isEdited TINYINT NOT NULL DEFAULT 0,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_channel_id (channelId),
      INDEX idx_user_id (userId),
      INDEX idx_created_at (createdAt)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
      },
      documents: {
        name: "documents",
        createSql: `CREATE TABLE IF NOT EXISTS documents (
      id VARCHAR(64) NOT NULL PRIMARY KEY,
      organizationId VARCHAR(64) NULL,
      documentName VARCHAR(255) NOT NULL,
      documentType VARCHAR(50) NULL,
      fileUrl VARCHAR(500) NOT NULL,
      fileSize INT DEFAULT 0,
      mimeType VARCHAR(100) NULL,
      linkedEntityType VARCHAR(100) NULL,
      linkedEntityId VARCHAR(64) NULL,
      linkedClientId VARCHAR(64) NULL,
      linkedProjectId VARCHAR(64) NULL,
      linkedInvoiceId VARCHAR(64) NULL,
      uploadedBy VARCHAR(64) NOT NULL,
      currentVersion INT DEFAULT 1,
      status VARCHAR(20) DEFAULT 'active',
      expiryDate TIMESTAMP NULL,
      requiresSignature TINYINT DEFAULT 0,
      isSigned TINYINT DEFAULT 0,
      signedDate TIMESTAMP NULL,
      signedBy VARCHAR(64) NULL,
      tags TEXT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
      },
      backup_history: {
        name: "backup_history",
        createSql: `CREATE TABLE IF NOT EXISTS backup_history (
      id VARCHAR(64) NOT NULL PRIMARY KEY,
      name VARCHAR(200) NOT NULL,
      backupType VARCHAR(50) NOT NULL DEFAULT 'full',
      scope VARCHAR(50) NOT NULL DEFAULT 'full',
      scopeEntityId VARCHAR(64) NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'pending',
      tablesList TEXT NULL,
      recordCount INT DEFAULT 0,
      sizeBytes INT DEFAULT 0,
      fileName VARCHAR(500) NULL,
      errorMessage TEXT NULL,
      completedAt TIMESTAMP NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      createdBy VARCHAR(64) NOT NULL,
      INDEX idx_bh_status (status),
      INDEX idx_bh_scope (scope),
      INDEX idx_bh_created (createdAt)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
      },
      systemHealth: {
        name: "systemHealth",
        createSql: `CREATE TABLE IF NOT EXISTS systemHealth (
      id VARCHAR(64) NOT NULL PRIMARY KEY,
      organizationId VARCHAR(64) NULL,
      cpuUsage FLOAT NULL,
      cpuModel VARCHAR(255) NULL,
      cpuCores INT NULL,
      cpuSpeed VARCHAR(50) NULL,
      cpuTemperature FLOAT NULL,
      memoryUsage FLOAT NULL,
      memoryTotal FLOAT NULL,
      memoryAvailable FLOAT NULL,
      diskUsage FLOAT NULL,
      diskTotal FLOAT NULL,
      diskUsagePercent FLOAT NULL,
      status VARCHAR(50) DEFAULT 'healthy',
      systemPlatform VARCHAR(50) NULL,
      systemDistro VARCHAR(255) NULL,
      systemRelease VARCHAR(100) NULL,
      systemArch VARCHAR(50) NULL,
      systemManufacturer VARCHAR(255) NULL,
      systemUptime BIGINT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_created_at (createdAt)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
      },
      compliance_records: {
        name: "compliance_records",
        createSql: `CREATE TABLE IF NOT EXISTS compliance_records (
      id VARCHAR(64) NOT NULL PRIMARY KEY,
      recordType VARCHAR(100) NOT NULL,
      standard VARCHAR(100) NULL,
      score INT DEFAULT 0,
      status VARCHAR(50) NOT NULL DEFAULT 'COMPLIANT',
      findings TEXT NULL,
      dataPayload TEXT NULL,
      createdBy VARCHAR(64) NOT NULL,
      createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_cr_type (recordType),
      INDEX idx_cr_standard (standard)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
      }
    };
  }
});

// server/db.ts
import { eq, desc, and, gte, lte, isNotNull, isNull, count, sum } from "drizzle-orm";
import { drizzle as drizzleMySql } from "drizzle-orm/mysql2";
import { migrate as drizzleMigrate } from "drizzle-orm/mysql2/migrator";
import * as mysql from "mysql2/promise";
import { v4 } from "uuid";
function createLegacyDbCompat(instance = {}) {
  return new Proxy(instance, {
    get(target, prop, receiver) {
      if (typeof prop === "symbol") {
        return Reflect.get(target, prop, receiver);
      }
      if (prop in target) {
        return Reflect.get(target, prop, receiver);
      }
      const propName = String(prop);
      if (propName === "raw") {
        return async (query, params = []) => {
          if (!_pool) {
            return [];
          }
          try {
            const [rows] = await _pool.execute(query, params);
            return rows;
          } catch (error) {
            console.warn("[Database compat] raw query failed:", error);
            return [];
          }
        };
      }
      if (propName === "then") {
        return void 0;
      }
      if (propName === "collection") {
        return (tableName) => {
          const builder = {
            tableName,
            where: (..._args) => builder,
            orderBy: (..._args) => builder,
            limit: (..._args) => builder,
            offset: (..._args) => builder,
            then: (resolve, reject) => Promise.resolve([]).then(resolve, reject),
            catch: (reject) => Promise.resolve([]).catch(reject)
          };
          return builder;
        };
      }
      if (propName === "logActivity") {
        return logActivity;
      }
      return (..._args) => {
        console.warn(`[Database compat] Unsupported legacy DB method "${propName}" called. Returning empty result.`);
        return Promise.resolve([]);
      };
    }
  });
}
async function initializeDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      console.log("[Database] Attempting to create drizzle connection...");
      if (!_pool) {
        _pool = await mysql.createPool({
          uri: process.env.DATABASE_URL,
          waitForConnections: true,
          connectionLimit: 20,
          queueLimit: 100,
          connectTimeout: 5e3,
          multipleStatements: true
        });
        const connection = await Promise.race([
          _pool.getConnection(),
          new Promise(
            (_, reject) => setTimeout(() => reject(new Error("Database connection validation timed out")), 5e3)
          )
        ]);
        try {
          await connection.ping();
        } finally {
          connection.release();
        }
      }
      _db = createLegacyDbCompat(drizzleMySql(_pool));
      console.log("[Database] \u2705 Drizzle connection created successfully");
      const shouldRunRuntimeMigrations = process.env.RUN_DRIZZLE_MIGRATIONS === "true";
      console.log("[Database] Runtime migrations enabled:", shouldRunRuntimeMigrations);
      if (!shouldRunRuntimeMigrations && process.env.RUN_RUNTIME_SCHEMA_CHECKS !== "true") {
        _migrationsRun = true;
        console.log("[Database] Fast production initialization: migrations and schema checks disabled");
        return _db;
      }
      if (!_migrationsRun && _db && process.env.NODE_ENV !== "test") {
        if (shouldRunRuntimeMigrations) {
          try {
            console.log("[Database] Running migrations...");
            await drizzleMigrate(_db, { migrationsFolder: "./drizzle/migrations" });
            _migrationsRun = true;
            console.log("[Database] \u2705 Migrations completed successfully");
          } catch (migrationError) {
            console.error(
              "[Database] \u274C Migration failed:",
              migrationError instanceof Error ? migrationError.message : migrationError
            );
            throw migrationError;
          }
        } else {
          _migrationsRun = true;
          console.log("[Database] Skipping runtime drizzle migrations in production");
        }
        const shouldRunRuntimeSchemaChecks = process.env.RUN_RUNTIME_SCHEMA_CHECKS === "true";
        if (!shouldRunRuntimeSchemaChecks) {
          console.log("[Database] Skipping runtime schema compatibility checks in production");
        }
        if (shouldRunRuntimeSchemaChecks) {
          const legacyTablesToCheck = getRuntimeSchemaCheckTargets();
          try {
            const [tableList] = await _pool.query("SHOW TABLES");
            const tableNames = Array.isArray(tableList) ? tableList.map((row) => {
              const value = Object.values(row)[0];
              return String(value ?? "").toLowerCase();
            }) : [];
            const missingTables = getMissingTableDefinitions(tableNames);
            if (missingTables.length > 0) {
              console.warn("[Database] Missing legacy tables detected, creating compatibility tables:", missingTables.map((table) => table.name));
              for (const table of missingTables) {
                await _pool.query(table.createSql);
                console.log(`[Database] \u2705 ${table.name} table compatibility table created`);
              }
            }
          } catch (schemaError) {
            console.warn("[Database] Could not verify/create missing legacy tables:", schemaError instanceof Error ? schemaError.message : schemaError);
          }
          for (const tableName of legacyTablesToCheck) {
            try {
              const [tableResults] = await _pool.query(`SHOW COLUMNS FROM ${tableName}`);
              const tableColumns = Array.isArray(tableResults) ? tableResults.map((row) => String(row.Field || row.field || "").toLowerCase()) : [];
              const missingColumns = getMissingColumnsForTable(tableName, tableColumns);
              if (missingColumns.length > 0) {
                console.warn(`[Database] ${tableName} table missing columns, applying compatibility patch:`, missingColumns.map((column) => column.name));
                for (const column of missingColumns) {
                  await _pool.query(`ALTER TABLE ${tableName} ADD COLUMN ${column.name} ${column.definition}`);
                }
                console.log(`[Database] \u2705 ${tableName} table compatibility patch completed`);
              }
            } catch (schemaError) {
              console.warn(`[Database] Could not verify/patch ${tableName} schema:`, schemaError instanceof Error ? schemaError.message : schemaError);
            }
          }
          try {
            await _pool.query("ALTER TABLE employees MODIFY COLUMN photoUrl LONGTEXT NULL");
            console.log("[Database] \u2705 employees.photoUrl is compatible with inline employee photos");
          } catch (schemaError) {
            console.warn("[Database] Could not expand employees.photoUrl:", schemaError instanceof Error ? schemaError.message : schemaError);
          }
        }
      }
    } catch (error) {
      console.error("[Database] \u274C Failed to connect:", error instanceof Error ? error.message : error);
      _db = null;
      _pool = null;
    }
  }
  if (!_db && process.env.NODE_ENV === "test") {
    try {
      console.log("[Database] Creating sqlite in-memory DB for tests...");
      const sqlitePkg = "drizzle-orm/better-sqlite3";
      const betterSqlitePkg = "better-sqlite3";
      const [{ drizzle: drizzleSqlite }, BetterSqlite3] = await Promise.all([
        import(sqlitePkg),
        import(betterSqlitePkg)
      ]);
      const conn = new BetterSqlite3.default(":memory:");
      _db = createLegacyDbCompat(drizzleSqlite(conn));
    } catch (err) {
      console.warn("[Database] sqlite memory init failed", err);
      _db = null;
    }
  }
  if (!_db && !process.env.DATABASE_URL) {
    console.warn("[Database] DATABASE_URL not set");
  }
  return _db;
}
async function getDb() {
  if (_db) return _db;
  if (!_dbInitialization) {
    _dbInitialization = initializeDb().finally(() => {
      if (!_db) _dbInitialization = null;
    });
  }
  return _dbInitialization;
}
async function logActivity(activity) {
  const db2 = await getDb();
  if (!db2) return;
  const id = `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const mysqlDateTime = (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").substring(0, 19);
  const logEntry = {
    id,
    userId: activity.userId,
    action: activity.action,
    entityType: activity.entityType || null,
    entityId: activity.entityId || null,
    description: activity.description || null,
    metadata: activity.metadata || null,
    ipAddress: activity.ipAddress || null,
    createdAt: mysqlDateTime
  };
  try {
    await db2.insert(activityLog).values(logEntry);
  } catch (error) {
    console.error("Failed to insert activityLog entry:", {
      error: error?.message || error,
      code: error?.code,
      entry: logEntry
    });
    return;
  }
}
var _db, _pool, _migrationsRun, _dbInitialization, db;
var init_db = __esm({
  "server/db.ts"() {
    init_schema();
    init_schema_extended();
    init_env();
    init_legacySchemaCompatibility();
    _db = null;
    _pool = null;
    _migrationsRun = false;
    _dbInitialization = null;
    db = createLegacyDbCompat();
  }
});

// server/middleware/enhancedRbac.ts
import { TRPCError } from "@trpc/server";
import { eq as eq2, and as and2 } from "drizzle-orm";
function getAllowedTierFeatures(plan) {
  const normalizedPlan = String(plan || "trial").toLowerCase();
  const defaults = TIER_DEFAULT_MODULES[normalizedPlan] ?? TIER_DEFAULT_MODULES.trial;
  return new Set(
    Object.entries(defaults).filter(([, enabled]) => Boolean(enabled)).map(([featureKey]) => featureKey)
  );
}
function getOrganizationModule(feature) {
  const normalized = feature.replace(/^org:/, "");
  const match = ORGANIZATION_FEATURE_MODULES.find(([prefix]) => normalized === prefix || normalized.startsWith(`${prefix}:`));
  return match?.[1] ?? null;
}
async function requireOrganizationFeatureAccess(organizationId, features) {
  const modules = Array.from(new Set(features.map(getOrganizationModule).filter((module) => Boolean(module))));
  if (modules.length === 0) return;
  const db2 = await getDb();
  if (!db2) {
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Unable to verify organization feature access" });
  }
  const [organization] = await db2.select({ plan: organizations.plan, isActive: organizations.isActive }).from(organizations).where(eq2(organizations.id, organizationId)).limit(1);
  if (!organization || !organization.isActive) {
    throw new TRPCError({ code: "FORBIDDEN", message: "This organization is inactive or unavailable" });
  }
  const enabledRows = await db2.select({ featureKey: organizationFeatures.featureKey, isEnabled: organizationFeatures.isEnabled }).from(organizationFeatures).where(eq2(organizationFeatures.organizationId, organizationId));
  const explicit = new Map(enabledRows.map((row) => [row.featureKey, Boolean(row.isEnabled)]));
  const defaults = TIER_DEFAULT_MODULES[String(organization.plan || "trial")] ?? TIER_DEFAULT_MODULES.trial;
  const planAllowed = getAllowedTierFeatures(String(organization.plan || "trial"));
  const hasAccess = modules.some((module) => {
    if (String(organization.plan || "trial").toLowerCase() !== "custom" && !planAllowed.has(module)) {
      return false;
    }
    return explicit.has(module) ? explicit.get(module) : defaults[module] === true;
  });
  if (!hasAccess) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Your organization subscription does not include this feature" });
  }
}
function canAccessFeature(userRole, feature) {
  if (userRole === ROLES.SUPER_ADMIN) return true;
  const allowedRoles = FEATURE_ACCESS[feature];
  if (allowedRoles && allowedRoles.includes(userRole)) {
    return true;
  }
  const userPermissions4 = ROLE_PERMISSIONS[userRole];
  if (!userPermissions4) return false;
  if (userPermissions4.includes(feature)) return true;
  const modulePrefix = feature.split(":")[0];
  return userPermissions4.includes(`${modulePrefix}:*`);
}
function customRoleCanAccessFeature(customPermissions, feature) {
  if (!customPermissions || customPermissions.length === 0) return false;
  if (customPermissions.includes(feature)) return true;
  const modulePrefix = feature.split(":")[0];
  if (customPermissions.includes(`${modulePrefix}:*`)) return true;
  return false;
}
async function resolveUserPermission(userId, userRole, customRoleId, feature) {
  if (userRole === ROLES.SUPER_ADMIN) return true;
  const featureAliases = {
    "chat:read": ["communications:read", "communications:chat", "communications:intrachat"],
    "chat:send": ["communications:send", "communications:messaging", "communications:chat"],
    "chat:delete": ["communications:manage", "communications:messaging"],
    "admin:settings": ["settings_view", "settings_edit", "settings_manage_roles"],
    "permissions:read": ["users_manage_permissions", "settings_manage_roles", "settings_view"],
    "permissions:manage": ["users_manage_permissions", "settings_manage_roles"]
  };
  const candidateFeatures = [feature, ...featureAliases[feature] || []];
  try {
    const db2 = await getDb();
    if (db2) {
      const explicitPermissions = await db2.select({
        resource: userPermissions.resource,
        action: userPermissions.action,
        granted: userPermissions.granted
      }).from(userPermissions).where(eq2(userPermissions.userId, userId));
      const userRows = await db2.select({ permissions: users.permissions }).from(users).where(eq2(users.id, userId)).limit(1);
      const storedPermissions = userRows[0]?.permissions ? JSON.parse(String(userRows[0].permissions)) : [];
      const matches = candidateFeatures.some((candidate) => {
        const [resource, action] = candidate.split(":", 2);
        return explicitPermissions.some((permission) => {
          if (!permission.granted) return false;
          const storedResource = String(permission.resource || "");
          const storedAction = String(permission.action || "");
          return storedResource === candidate || storedResource === candidate.replace(/:/g, "_") || storedResource === resource && storedAction === action || storedResource === resource && storedAction === "*" || storedResource === "*" && storedAction === "*";
        });
      });
      if (matches || candidateFeatures.some((candidate) => storedPermissions.includes(candidate))) return true;
    }
  } catch {
  }
  if (customRoleId) {
    try {
      const db2 = await getDb();
      if (db2) {
        const normalizedCustomRoleId = String(customRoleId).replace(/^custom_/, "");
        const roles = await db2.select().from(customRoles).where(and2(eq2(customRoles.id, normalizedCustomRoleId), eq2(customRoles.isActive, 1))).limit(1);
        if (roles.length > 0 && roles[0].permissions) {
          const perms = JSON.parse(roles[0].permissions);
          if (candidateFeatures.some((candidate) => customRoleCanAccessFeature(perms, candidate))) return true;
          if (roles[0].baseRole) {
            return candidateFeatures.some((candidate) => canAccessFeature(roles[0].baseRole, candidate));
          }
          return false;
        }
      }
    } catch (e) {
    }
  }
  return candidateFeatures.some((candidate) => canAccessFeature(userRole, candidate));
}
function createFeatureRestrictedProcedure(feature, ...additionalFeatures) {
  return protectedProcedure.use(async ({ ctx, next }) => {
    const userRole = ctx.user.role;
    const customRoleId = ctx.user.customRoleId;
    const features = [...Array.isArray(feature) ? feature : [feature], ...additionalFeatures];
    let hasAccess = false;
    for (const f of features) {
      const access = await resolveUserPermission(ctx.user.id, userRole, customRoleId, f);
      if (access) {
        hasAccess = true;
        break;
      }
    }
    if (!hasAccess) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `Access denied. You don't have permission to access: ${Array.isArray(feature) ? feature.join(", ") : feature}`
      });
    }
    if (ctx.user.organizationId) {
      await requireOrganizationFeatureAccess(ctx.user.organizationId, features);
    }
    const GLOBAL_ONLY_PREFIXES = ["enterprise:", "admin:manage_"];
    const hasGlobalOnly = features.some((f) => GLOBAL_ONLY_PREFIXES.some((p) => f.startsWith(p)));
    if (ctx.user.organizationId && hasGlobalOnly) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "This resource is only accessible to platform administrators"
      });
    }
    return next({ ctx });
  });
}
var ROLES, ORGANIZATION_FEATURE_MODULES, TIER_DEFAULT_MODULES, ROLE_PERMISSIONS, FEATURE_ACCESS;
var init_enhancedRbac = __esm({
  "server/middleware/enhancedRbac.ts"() {
    init_trpc();
    init_db();
    init_schema();
    ROLES = {
      SUPER_ADMIN: "super_admin",
      ADMIN: "admin",
      ACCOUNTANT: "accountant",
      HR: "hr",
      STAFF: "staff",
      CLIENT: "client",
      PROJECT_MANAGER: "project_manager",
      PROCUREMENT_MANAGER: "procurement_manager",
      ICT_MANAGER: "ict_manager",
      SALES_MANAGER: "sales_manager",
      USER: "user"
    };
    ORGANIZATION_FEATURE_MODULES = [
      ["invoicing", "invoicing"],
      ["payments", "payments"],
      ["expenses", "expenses"],
      ["procurement", "procurement"],
      ["projects", "projects"],
      ["hr", "hr"],
      ["payroll", "payroll"],
      ["leave", "leave"],
      ["attendance", "attendance"],
      ["crm:clients", "crm"],
      ["crm:contacts", "crm"],
      ["crm:leads", "crm"],
      ["sales:leads:view", "crm"],
      ["sales:leads:create", "crm"],
      ["sales:leads:update", "crm"],
      ["crm:opportunities", "crm"],
      ["crm", "crm"],
      ["accounting:invoices", "invoicing"],
      ["accounting:estimates", "invoicing"],
      ["accounting:credit_notes", "invoicing"],
      ["accounting:debit_notes", "invoicing"],
      ["accounting:payments", "payments"],
      ["accounting:expenses", "expenses"],
      ["accounting:reports", "reports"],
      ["accounting:chart_of_accounts", "accounting"],
      ["accounting:reconciliation", "accounting"],
      ["accounting", "accounting"],
      ["clients", "crm"],
      ["contacts", "crm"],
      ["leads", "crm"],
      ["opportunities", "crm"],
      ["sales", "crm"],
      ["projects", "projects"],
      ["tasks", "projects"],
      ["hr:employees", "hr"],
      ["hr:departments", "hr"],
      ["employees", "hr"],
      ["departments", "hr"],
      ["jobGroups", "hr"],
      ["payroll", "payroll"],
      ["leave", "leave"],
      ["attendance", "attendance"],
      ["procurement", "procurement"],
      ["suppliers", "procurement"],
      ["purchase_orders", "procurement"],
      ["orders", "procurement"],
      ["lpos", "procurement"],
      ["inventory", "procurement"],
      ["products", "procurement"],
      ["services", "work_orders"],
      ["warehouses", "procurement"],
      ["delivery_notes", "procurement"],
      ["grn", "procurement"],
      ["tickets", "tickets"],
      ["communications", "communications"],
      ["documents", "communications"],
      ["contracts", "contracts"],
      ["assets", "contracts"],
      ["warranty", "contracts"],
      ["work_orders", "work_orders"],
      ["budgets", "budgets"],
      ["analytics", "reports"],
      ["reports", "reports"],
      ["ai", "ai_hub"]
    ];
    TIER_DEFAULT_MODULES = {
      trial: { crm: true, invoicing: true, reports: true },
      starter: { crm: true, invoicing: true, payments: true, expenses: true, tickets: true, reports: true },
      professional: { crm: true, invoicing: true, payments: true, expenses: true, tickets: true, reports: true, projects: true, hr: true, leave: true, attendance: true, accounting: true, budgets: true, communications: true },
      enterprise: { crm: true, projects: true, hr: true, payroll: true, leave: true, attendance: true, invoicing: true, payments: true, expenses: true, procurement: true, accounting: true, budgets: true, reports: true, ai_hub: true, communications: true, tickets: true, contracts: true, work_orders: true },
      custom: { crm: true, projects: true, hr: true, payroll: true, leave: true, attendance: true, invoicing: true, payments: true, expenses: true, procurement: true, accounting: true, budgets: true, reports: true, ai_hub: true, communications: true, tickets: true, contracts: true, work_orders: true }
    };
    ROLE_PERMISSIONS = {
      super_admin: [
        "admin:manage_users",
        "admin:manage_roles",
        "admin:settings",
        "admin:system",
        "accounting:*",
        "hr:*",
        "sales:*",
        "projects:*",
        "clients:*",
        "procurement:*",
        "billing:*",
        "subscriptions:*",
        "org:billing:*"
      ],
      admin: [
        "accounting:*",
        "hr:manage_staff",
        "sales:*",
        "projects:*",
        "clients:*",
        "procurement:*",
        "billing:*",
        "subscriptions:*",
        "org:billing:read",
        "org:billing:edit",
        "org:billing:create"
      ],
      accountant: [
        "accounting:invoices",
        "accounting:payments",
        "accounting:expenses",
        "accounting:reports",
        "accounting:chart_of_accounts",
        "accounting:reconciliation",
        "billing:read",
        "billing:edit",
        "subscriptions:read"
      ],
      hr: [
        "hr:employees",
        "hr:payroll",
        "hr:leave",
        "hr:attendance",
        "hr:departments"
      ],
      project_manager: [
        "projects:*",
        "clients:view",
        "sales:view",
        "accounting:view_invoices"
      ],
      staff: [
        "projects:view_own",
        "clients:view",
        "hr:view_own_records"
      ],
      client: [
        "client_portal:dashboard",
        "client_portal:invoices",
        "client_portal:projects",
        "client_portal:payments"
      ],
      procurement_manager: [
        "procurement:*",
        "accounting:view",
        "accounting:expenses:view",
        "accounting:payments:view",
        "clients:view",
        "products:view",
        "suppliers:*"
      ],
      ict_manager: [
        // Views for core data - read-only access to overview data
        "accounting:invoices:view",
        "accounting:payments:view",
        "accounting:expenses:view",
        "accounting:reports:view",
        "hr:employees:view",
        "hr:departments:view",
        "projects:view",
        "clients:view",
        "procurement:lpo:view",
        "procurement:imprest:view",
        "analytics:view",
        // System & Technical Management - full control
        "admin:system",
        "admin:settings",
        "admin:maintenance",
        "communications:email_queue",
        "auth:sessions",
        "auth:manage_sessions",
        "auth:export_user_data",
        "system:health",
        "system:monitoring",
        "system:logs",
        "system:backups",
        "users:view",
        "users:deactivate",
        "audit:view",
        "audit:export",
        "settings:integrations",
        "settings:security",
        "settings:notifications"
      ],
      sales_manager: [
        "sales:*",
        "clients:*",
        "projects:view",
        "accounting:invoices:view",
        "accounting:invoices:create",
        "accounting:payments:view",
        "accounting:expenses:view",
        "accounting:reports:view",
        "estimates:*",
        "opportunities:*",
        "receipts:view",
        "analytics:view"
      ],
      user: [
        "tickets:read",
        "tickets:create"
      ]
    };
    FEATURE_ACCESS = {
      // Client-owned support workflow
      "tickets:read": ["super_admin", "admin", "staff", "accountant", "user", "project_manager", "hr", "client"],
      "tickets:create": ["super_admin", "admin", "staff", "accountant", "user", "project_manager", "hr", "client"],
      "tickets:edit": ["super_admin", "admin", "staff", "accountant", "user", "project_manager", "hr", "client"],
      "tickets:delete": ["super_admin", "admin"],
      // Admin Features
      "admin:manage_users": ["super_admin", "admin", "ict_manager"],
      "admin:manage_roles": ["super_admin"],
      "admin:settings": ["super_admin", "admin"],
      "admin:maintenance": ["super_admin", "ict_manager"],
      "admin:system": ["super_admin", "admin", "ict_manager"],
      // ICT portal capabilities shared by the super-admin and ICT manager portals
      "ict:system_health": ["super_admin", "ict_manager"],
      "ict:system_health:view": ["super_admin", "ict_manager"],
      "ict:system_health:edit": ["super_admin", "ict_manager"],
      "ict:users": ["super_admin", "admin", "ict_manager"],
      "ict:users:view": ["super_admin", "admin", "ict_manager"],
      "ict:users:manage": ["super_admin", "admin", "ict_manager"],
      "ict:users:disable": ["super_admin", "admin", "ict_manager"],
      "ict:users:sessions": ["super_admin", "ict_manager"],
      "ict:security": ["super_admin", "ict_manager"],
      "ict:security:view": ["super_admin", "ict_manager"],
      "ict:security:policies": ["super_admin", "ict_manager"],
      "ict:security:access_control": ["super_admin", "ict_manager"],
      "ict:security:audit": ["super_admin", "ict_manager"],
      "ict:backups": ["super_admin", "admin", "ict_manager"],
      "ict:backups:view": ["super_admin", "admin", "ict_manager"],
      "ict:backups:create": ["super_admin", "admin", "ict_manager"],
      "ict:backups:restore": ["super_admin", "admin", "ict_manager"],
      "ict:logs": ["super_admin", "ict_manager"],
      "ict:logs:view": ["super_admin", "ict_manager"],
      "ict:logs:download": ["super_admin", "ict_manager"],
      "ict:logs:archive": ["super_admin", "ict_manager"],
      "ict:database": ["super_admin", "admin", "ict_manager"],
      "ict:database:view": ["super_admin", "admin", "ict_manager"],
      "ict:database:query": ["super_admin", "admin", "ict_manager"],
      "ict:database:maintenance": ["super_admin", "admin", "ict_manager"],
      "ict:network": ["super_admin", "admin", "ict_manager"],
      "ict:network:view": ["super_admin", "admin", "ict_manager"],
      "ict:notifications": ["super_admin", "admin", "ict_manager"],
      "ict:notifications:view": ["super_admin", "admin", "ict_manager"],
      "ict:notifications:config": ["super_admin", "admin", "ict_manager"],
      "ict:dashboard": ["super_admin", "admin", "ict_manager"],
      // Enterprise / Multi-Tenancy (global platform only)
      "enterprise:view": ["super_admin", "admin", "ict_manager"],
      "enterprise:create": ["super_admin", "admin", "ict_manager"],
      "enterprise:edit": ["super_admin", "admin", "ict_manager"],
      "enterprise:delete": ["super_admin"],
      "admin:view": ["super_admin", "admin", "ict_manager"],
      "admin:edit": ["super_admin", "admin"],
      // User Management & Permissions
      "users:edit": ["super_admin", "admin", "ict_manager"],
      "users:view": ["super_admin", "admin", "ict_manager"],
      "users:create": ["super_admin", "admin", "ict_manager"],
      "users:delete": ["super_admin", "admin"],
      "users:update": ["super_admin", "admin", "ict_manager"],
      "users:permissions": ["super_admin"],
      "users:permissions:edit": ["super_admin", "ict_manager"],
      "users:permissions:view": ["super_admin", "admin", "ict_manager"],
      "users:roles": ["super_admin"],
      "users:roles:edit": ["super_admin"],
      "users:read": ["super_admin", "admin", "ict_manager"],
      // Accounting Features
      "accounting:invoices": ["super_admin", "admin", "accountant", "project_manager", "sales_manager", "ict_manager"],
      "accounting:invoices:view": ["super_admin", "admin", "accountant", "project_manager", "sales_manager", "ict_manager"],
      "accounting:invoices:create": ["super_admin", "admin", "accountant", "sales_manager", "ict_manager"],
      "accounting:invoices:edit": ["super_admin", "admin", "accountant", "ict_manager"],
      "accounting:invoices:delete": ["super_admin", "admin"],
      "accounting:invoices:approve": ["super_admin", "admin", "accountant"],
      // Generic accounting permissions (used by bankReconciliation)
      "accounting:read": ["super_admin", "admin", "accountant", "project_manager", "ict_manager"],
      "accounting:create": ["super_admin", "admin", "accountant"],
      "accounting:edit": ["super_admin", "admin", "accountant"],
      "accounting:delete": ["super_admin", "admin"],
      "accounting:receipts": ["super_admin", "admin", "accountant", "project_manager", "ict_manager"],
      "accounting:receipts:view": ["super_admin", "admin", "accountant", "project_manager", "ict_manager"],
      "accounting:receipts:create": ["super_admin", "admin", "accountant"],
      "accounting:receipts:edit": ["super_admin", "admin", "accountant"],
      "accounting:receipts:delete": ["super_admin", "admin"],
      "accounting:payments": ["super_admin", "admin", "accountant"],
      "accounting:payments:view": ["super_admin", "admin", "accountant", "project_manager", "sales_manager"],
      "accounting:payments:record": ["super_admin", "admin", "accountant"],
      "accounting:payments:create": ["super_admin", "admin", "accountant"],
      "accounting:payments:edit": ["super_admin", "admin", "accountant"],
      "accounting:payments:delete": ["super_admin", "admin"],
      "accounting:payments:approve": ["super_admin", "admin", "accountant"],
      "accounting:payments:reconcile": ["super_admin", "admin", "accountant"],
      "accounting:payments:refund": ["super_admin", "admin"],
      "accounting:expenses": ["super_admin", "admin", "accountant", "project_manager"],
      "accounting:expenses:view": ["super_admin", "admin", "accountant", "project_manager"],
      "accounting:expenses:create": ["super_admin", "admin", "accountant", "staff"],
      "accounting:expenses:edit": ["super_admin", "admin", "accountant"],
      "accounting:expenses:approve": ["super_admin", "admin", "accountant"],
      "accounting:expenses:reject": ["super_admin", "admin", "accountant"],
      "accounting:expenses:delete": ["super_admin", "admin"],
      "accounting:expenses:budget": ["super_admin", "admin", "accountant"],
      "accounting:reports": ["super_admin", "admin", "accountant"],
      "accounting:reports:view": ["super_admin", "admin", "accountant"],
      "accounting:chart_of_accounts": ["super_admin", "admin", "accountant"],
      "accounting:chart_of_accounts:view": ["super_admin", "admin", "accountant"],
      "accounting:reconciliation": ["super_admin", "admin", "accountant"],
      "accounting:reconciliation:view": ["super_admin", "admin", "accountant"],
      // HR Features
      "hr:view": ["super_admin", "admin", "hr"],
      "hr:edit": ["super_admin", "admin", "hr"],
      "hr:employees": ["super_admin", "admin", "hr"],
      "hr:employees:view": ["super_admin", "admin", "hr", "project_manager"],
      "hr:employees:create": ["super_admin", "admin", "hr"],
      "hr:employees:edit": ["super_admin", "admin", "hr"],
      "hr:employees:delete": ["super_admin", "admin"],
      // Standalone employee read/write features (used by employees router directly)
      "employees:read": ["super_admin", "admin", "hr", "project_manager", "ict_manager"],
      "employees:view": ["super_admin", "admin", "hr", "project_manager"],
      "employees:edit": ["super_admin", "admin", "hr"],
      "employees:create": ["super_admin", "admin", "hr"],
      "employees:update": ["super_admin", "admin", "hr"],
      "employees:delete": ["super_admin", "admin"],
      "hr:departments": ["super_admin", "admin", "hr"],
      "hr:departments:view": ["super_admin", "admin", "hr"],
      "hr:departments:create": ["super_admin", "admin", "hr"],
      "hr:departments:edit": ["super_admin", "admin", "hr"],
      "hr:departments:delete": ["super_admin", "admin"],
      "hr:jobGroups": ["super_admin", "admin", "hr"],
      "hr:jobGroups:view": ["super_admin", "admin", "hr"],
      "hr:jobGroups:create": ["super_admin", "hr"],
      "hr:jobGroups:edit": ["super_admin", "hr"],
      "hr:jobGroups:delete": ["super_admin", "hr"],
      // Standalone job groups (used by jobGroups router)
      "jobGroups:read": ["super_admin", "admin", "hr"],
      "jobGroups:create": ["super_admin", "admin", "hr"],
      "jobGroups:edit": ["super_admin", "admin", "hr"],
      "jobGroups:delete": ["super_admin", "admin"],
      "hr:payroll": ["super_admin", "hr"],
      "hr:payroll:view": ["super_admin", "hr"],
      "hr:payroll:create": ["super_admin", "hr"],
      "hr:payroll:approve": ["super_admin", "hr"],
      // Standalone payroll features (used by payslips router)
      "payroll:view": ["super_admin", "admin", "hr", "accountant"],
      "payroll:read": ["super_admin", "admin", "hr", "accountant"],
      "payroll:create": ["super_admin", "admin", "hr"],
      "payroll:edit": ["super_admin", "admin", "hr"],
      "payroll:delete": ["super_admin", "admin"],
      "hr:leave": ["super_admin", "admin", "hr"],
      "hr:leave:approve": ["super_admin", "admin", "hr"],
      "hr:attendance": ["super_admin", "admin", "hr"],
      // Generic HR attendance permissions
      "attendance:read": ["super_admin", "admin", "hr"],
      "attendance:create": ["super_admin", "admin", "hr"],
      "attendance:edit": ["super_admin", "admin", "hr"],
      "attendance:delete": ["super_admin", "admin"],
      // Standalone estimate features (used by estimates router)
      "estimates:read": ["super_admin", "admin", "project_manager", "accountant", "sales_manager"],
      "estimates:create": ["super_admin", "admin", "project_manager", "sales_manager"],
      "estimates:edit": ["super_admin", "admin", "project_manager", "sales_manager"],
      "estimates:delete": ["super_admin", "admin"],
      "estimates:approve": ["super_admin", "admin", "project_manager", "sales_manager"],
      "estimates:send": ["super_admin", "admin", "project_manager", "sales_manager"],
      "estimates:view": ["super_admin", "admin", "project_manager", "accountant", "sales_manager"],
      // Estimates to Approvals (route estimates through approval system)
      "estimates:submit_for_approval": ["super_admin", "admin", "project_manager", "sales_manager"],
      "estimates:approvals": ["super_admin", "admin", "accountant"],
      "sales:receipts": ["super_admin", "admin", "accountant", "project_manager", "sales_manager"],
      // Procurement
      "procurement:view": ["super_admin", "admin", "procurement_manager"],
      "procurement:suppliers": ["super_admin", "admin"],
      "procurement:suppliers:view": ["super_admin", "admin"],
      "procurement:suppliers:create": ["super_admin", "admin"],
      "procurement:suppliers:edit": ["super_admin", "admin"],
      "procurement:suppliers:delete": ["super_admin", "admin"],
      "procurement:lpo": ["super_admin", "admin"],
      "procurement:lpo:view": ["super_admin", "admin", "accountant", "project_manager"],
      "procurement:lpo:create": ["super_admin", "admin", "project_manager"],
      "procurement:lpo:edit": ["super_admin", "admin", "project_manager"],
      "procurement:lpo:delete": ["super_admin", "admin"],
      "procurement:lpo:approve": ["super_admin", "admin"],
      "procurement:imprest": ["super_admin", "admin"],
      "procurement:imprest:view": ["super_admin", "admin", "accountant"],
      "procurement:imprest:create": ["super_admin", "admin", "staff"],
      "procurement:imprest:edit": ["super_admin", "admin"],
      "procurement:imprest:delete": ["super_admin", "admin"],
      "procurement:imprest:approve": ["super_admin", "admin"],
      "procurement:orders": ["super_admin", "admin"],
      "procurement:orders:view": ["super_admin", "admin", "procurement_manager"],
      "procurement:orders:create": ["super_admin", "admin", "procurement_manager"],
      "procurement:orders:edit": ["super_admin", "admin", "procurement_manager"],
      "procurement:orders:delete": ["super_admin", "admin"],
      // Analytics view permission used by dashboard and reports
      "analytics:view": ["super_admin", "admin", "accountant", "project_manager", "ict_manager", "sales_manager"],
      // Communications / email queue management
      "communications:email_queue": ["super_admin", "admin", "ict_manager"],
      // Authentication utilities
      "auth:sessions": ["super_admin", "admin", "ict_manager"],
      "auth:export_user_data": ["super_admin", "admin", "ict_manager"],
      // Clients Features
      "clients:view": ["super_admin", "admin", "accountant", "project_manager", "procurement_manager", "sales_manager"],
      "clients:create": ["super_admin", "admin", "project_manager", "sales_manager"],
      "clients:edit": ["super_admin", "admin", "project_manager", "sales_manager"],
      "clients:delete": ["super_admin", "admin"],
      "clients:manage_relationships": ["super_admin", "admin", "project_manager", "sales_manager"],
      // Products & Services
      "products:view": ["super_admin", "admin", "accountant", "project_manager", "staff", "procurement_manager"],
      "products:create": ["super_admin", "admin"],
      "products:edit": ["super_admin", "admin"],
      "products:delete": ["super_admin", "admin"],
      "products:manage_inventory": ["super_admin", "admin", "procurement_manager"],
      "services:view": ["super_admin", "admin", "project_manager", "staff"],
      "services:create": ["super_admin", "admin"],
      "services:edit": ["super_admin", "admin"],
      "services:delete": ["super_admin", "admin"],
      // Projects Features
      "projects:view": ["super_admin", "admin", "project_manager", "staff"],
      "projects:create": ["super_admin", "admin", "project_manager"],
      "projects:edit": ["super_admin", "admin", "project_manager"],
      "projects:delete": ["super_admin", "admin"],
      "projects:manage_team": ["super_admin", "admin", "project_manager"],
      "projects:manage_milestones": ["super_admin", "admin", "project_manager"],
      "projects:manage_budget": ["super_admin", "admin", "accountant", "project_manager"],
      // Sales Features
      "sales:view": ["super_admin", "admin", "project_manager", "accountant", "sales_manager"],
      "sales:create": ["super_admin", "admin", "project_manager", "sales_manager"],
      "sales:edit": ["super_admin", "admin", "project_manager", "sales_manager"],
      "sales:delete": ["super_admin", "admin"],
      "sales:pipeline": ["super_admin", "admin", "project_manager", "sales_manager"],
      "sales:opportunities": ["super_admin", "admin", "project_manager", "sales_manager"],
      "sales:opportunities:create": ["super_admin", "admin", "project_manager", "sales_manager"],
      "sales:opportunities:edit": ["super_admin", "admin", "project_manager", "sales_manager"],
      "sales:opportunities:delete": ["super_admin", "admin"],
      // Dashboard Features
      "dashboard:view": ["super_admin", "admin", "accountant", "project_manager", "hr", "staff", "ict_manager", "sales_manager"],
      "dashboard:customize": ["super_admin", "admin", "project_manager", "sales_manager"],
      "dashboard:edit": ["super_admin", "admin"],
      // Departments Features
      "departments:view": ["super_admin", "admin", "hr", "project_manager"],
      "departments:create": ["super_admin", "admin", "hr"],
      "departments:edit": ["super_admin", "admin", "hr"],
      "departments:delete": ["super_admin", "admin"],
      "departments:read": ["super_admin", "admin", "hr", "project_manager"],
      // Reports Features (with department access)
      "reports:view": ["super_admin", "admin", "accountant", "project_manager", "hr", "sales_manager", "ict_manager"],
      "reports:create": ["super_admin", "admin"],
      "reports:financial": ["super_admin", "admin", "accountant"],
      "reports:sales": ["super_admin", "admin", "project_manager", "accountant", "sales_manager"],
      "reports:projects": ["super_admin", "admin", "project_manager"],
      "reports:hr": ["super_admin", "admin", "hr"],
      "reports:procurement": ["super_admin", "admin", "procurement_manager"],
      "reports:export": ["super_admin", "admin", "accountant", "project_manager", "hr"],
      "reports:departments": ["super_admin", "admin", "hr"],
      // AI Features - Chat & Assistance
      "ai:access": ["super_admin", "admin", "project_manager", "sales_manager", "accountant", "hr", "staff", "ict_manager"],
      "ai:summarize": ["super_admin", "admin", "project_manager", "sales_manager", "accountant", "hr", "staff", "ict_manager"],
      "ai:generateEmail": ["super_admin", "admin", "project_manager", "sales_manager", "accountant", "hr", "staff", "ict_manager"],
      "ai:chat": ["super_admin", "admin", "project_manager", "sales_manager", "accountant", "hr", "staff", "ict_manager"],
      "ai:financial": ["super_admin", "admin", "project_manager", "sales_manager", "accountant", "hr", "ict_manager"],
      "ai:modal": ["super_admin", "admin", "project_manager", "sales_manager", "accountant", "hr", "staff", "ict_manager"],
      // Chat/IntraChat Features
      "communications:chat": ["super_admin", "admin", "staff", "project_manager", "hr", "accountant", "sales_manager", "ict_manager"],
      "communications:intrachat": ["super_admin", "admin", "staff", "project_manager", "hr", "accountant", "sales_manager", "ict_manager"],
      "communications:ai_assistant": ["super_admin", "admin", "staff", "project_manager", "hr", "accountant", "sales_manager", "ict_manager"],
      // Support & Communications
      "communications:view": ["super_admin", "admin", "staff", "project_manager", "hr", "accountant", "sales_manager", "ict_manager"],
      "communications:manage": ["super_admin", "admin", "ict_manager", "hr", "accountant", "sales_manager", "project_manager"],
      // Notifications
      "notifications:read": ["super_admin", "admin", "staff", "project_manager", "hr", "accountant", "sales_manager", "ict_manager"],
      "notifications:create": ["super_admin", "admin", "staff", "project_manager", "hr", "accountant", "sales_manager", "ict_manager"],
      "communications:email": ["super_admin", "admin", "ict_manager", "hr", "accountant", "sales_manager", "project_manager"],
      "communications:notifications": ["super_admin", "admin", "ict_manager", "hr", "accountant", "sales_manager", "project_manager", "staff"],
      "communications:tickets": ["super_admin", "admin", "staff"],
      "communications:tickets:create": ["super_admin", "admin", "staff", "project_manager", "hr", "accountant", "sales_manager", "ict_manager", "procurement_manager", "client"],
      "communications:tickets:resolve": ["super_admin", "admin", "ict_manager", "project_manager", "hr", "accountant", "sales_manager", "procurement_manager"],
      // System Settings
      "settings:view": ["super_admin", "admin", "ict_manager"],
      "settings:edit": ["super_admin", "admin", "ict_manager"],
      "settings:company": ["super_admin", "admin"],
      "settings:billing": ["super_admin", "admin"],
      "settings:integrations": ["super_admin", "ict_manager"],
      "settings:security": ["super_admin", "ict_manager"],
      "settings:roles": ["super_admin"],
      "settings:audit": ["super_admin", "ict_manager"],
      // Tools & Utilities
      "tools:import_export": ["super_admin", "admin", "accountant", "project_manager", "sales_manager", "procurement_manager", "ict_manager", "hr", "staff", "client"],
      "import:create": ["super_admin", "admin", "accountant", "project_manager", "sales_manager", "procurement_manager", "ict_manager", "hr", "staff", "client"],
      "import:read": ["super_admin", "admin", "accountant", "project_manager", "sales_manager", "procurement_manager", "ict_manager", "hr", "staff", "client"],
      "import:restore": ["super_admin", "admin"],
      "export:create": ["super_admin", "admin", "accountant", "project_manager", "sales_manager", "procurement_manager", "ict_manager", "hr", "staff", "client"],
      "data:import": ["super_admin", "admin", "accountant", "project_manager", "sales_manager", "procurement_manager", "ict_manager", "hr", "staff", "client"],
      "data:export": ["super_admin", "admin", "accountant", "project_manager", "sales_manager", "procurement_manager", "ict_manager", "hr", "staff", "client"],
      "tools:data_backup": ["super_admin", "admin", "ict_manager"],
      "tools:system_health": ["super_admin", "admin", "ict_manager"],
      "tools:api_management": ["super_admin", "admin", "ict_manager"],
      "tools:automation": ["super_admin", "admin", "ict_manager", "accountant", "staff", "project_manager", "hr", "procurement_manager", "sales_manager"],
      "tools:workflows": ["super_admin", "admin", "ict_manager"],
      // Client Portal
      "client_portal:dashboard": ["client"],
      "client_portal:invoices": ["client"],
      "client_portal:projects": ["client"],
      "client_portal:payments": ["client"],
      // Approvals Features
      "approvals:view": ["super_admin", "admin", "accountant", "hr"],
      "approvals:read": ["super_admin", "admin", "accountant", "hr"],
      "approvals:approve": ["super_admin", "admin", "accountant", "hr"],
      "approvals:reject": ["super_admin", "admin", "accountant", "hr"],
      "approvals:delete": ["super_admin"],
      // Chart of Accounts Features
      "chartOfAccounts:read": ["super_admin", "admin", "accountant"],
      "chartOfAccounts:create": ["super_admin", "admin", "accountant"],
      "chartOfAccounts:edit": ["super_admin", "admin", "accountant"],
      "chartOfAccounts:delete": ["super_admin", "admin"],
      // Budgets Features (prefix: budgets)
      "budgets:view": ["super_admin", "admin", "accountant", "project_manager"],
      "budgets:create": ["super_admin", "admin", "accountant", "sales_manager", "procurement_manager", "ict_manager"],
      "budgets:edit": ["super_admin", "admin", "accountant", "sales_manager", "procurement_manager", "ict_manager"],
      "budgets:delete": ["super_admin", "accountant"],
      // Budget Features (prefix: budget - used by budget router)
      "budget:read": ["super_admin", "admin", "accountant", "project_manager"],
      "budget:edit": ["super_admin", "admin", "accountant"],
      // Invoice Features
      "invoices:view": ["super_admin", "admin", "accountant", "project_manager"],
      "invoices:create": ["super_admin", "admin", "accountant"],
      "invoices:edit": ["super_admin", "admin", "accountant"],
      "invoices:delete": ["super_admin", "admin"],
      "invoices:read": ["super_admin", "admin", "accountant", "project_manager"],
      // Expense Features
      "expenses:view": ["super_admin", "admin", "accountant"],
      "expenses:create": ["super_admin", "admin", "accountant", "staff", "procurement_manager", "ict_manager", "sales_manager", "hr", "project_manager"],
      "expenses:edit": ["super_admin", "admin", "accountant"],
      "expenses:delete": ["super_admin", "admin"],
      "expenses:read": ["super_admin", "admin", "accountant", "project_manager"],
      // Payment Features
      "payments:view": ["super_admin", "admin", "accountant", "sales_manager"],
      "payments:create": ["super_admin", "admin", "accountant"],
      "payments:edit": ["super_admin", "accountant"],
      "payments:delete": ["super_admin"],
      "payments:read": ["super_admin", "admin", "accountant"],
      "payments:reconcile": ["super_admin", "admin", "accountant"],
      // Client Features (ensure all CRUD operations exist)
      "clients:read": ["super_admin", "admin", "project_manager", "accountant", "procurement_manager", "ict_manager", "sales_manager"],
      // Communications Features
      "communications:read": ["super_admin", "admin", "staff", "project_manager", "hr", "accountant", "sales_manager", "ict_manager", "procurement_manager"],
      "communications:messaging": ["super_admin", "admin", "staff", "project_manager", "hr", "accountant", "sales_manager", "ict_manager", "procurement_manager"],
      "communications:send": ["super_admin", "admin", "staff", "project_manager", "hr", "accountant", "sales_manager", "ict_manager", "procurement_manager"],
      // Filters & Saved Views
      "filters:create": ["super_admin", "admin", "accountant", "project_manager", "hr", "staff", "ict_manager", "procurement_manager", "sales_manager", "client"],
      "filters:read": ["super_admin", "admin", "accountant", "project_manager", "hr", "staff", "ict_manager", "procurement_manager", "sales_manager", "client"],
      "filters:update": ["super_admin", "admin", "accountant", "project_manager", "hr", "staff", "ict_manager", "procurement_manager", "sales_manager", "client"],
      "filters:delete": ["super_admin", "admin", "accountant", "project_manager", "hr", "staff", "ict_manager", "procurement_manager", "sales_manager", "client"],
      // Phase 20 - Business Intelligence & Analytics
      "analytics:reports": ["super_admin", "admin", "accountant", "project_manager", "hr", "sales_manager"],
      "analytics:dashboards": ["super_admin", "admin", "project_manager", "accountant"],
      "analytics:export": ["super_admin", "admin", "accountant"],
      // Phase 20 - Supplier Management
      "suppliers:view": ["super_admin", "admin", "procurement_manager"],
      "suppliers:create": ["super_admin", "admin", "procurement_manager"],
      "suppliers:edit": ["super_admin", "admin", "procurement_manager"],
      "suppliers:delete": ["super_admin", "admin", "procurement_manager"],
      "suppliers:read": ["super_admin", "admin", "procurement_manager"],
      // Phase 20 - Quotations/RFQs
      "quotations:view": ["super_admin", "admin", "procurement_manager", "accountant"],
      "quotations:create": ["super_admin", "admin", "procurement_manager"],
      "quotations:edit": ["super_admin", "admin", "procurement_manager"],
      "quotations:delete": ["super_admin", "admin"],
      "quotations:approve": ["super_admin", "admin"],
      // Phase 20 - Delivery Notes  
      "delivery_notes:view": ["super_admin", "admin", "procurement_manager", "accountant", "staff"],
      "delivery_notes:create": ["super_admin", "admin", "procurement_manager", "staff"],
      "delivery_notes:edit": ["super_admin", "admin", "procurement_manager"],
      "delivery_notes:delete": ["super_admin", "admin"],
      // Phase 20 - Goods Received Notes
      "grn:view": ["super_admin", "admin", "procurement_manager", "accountant", "staff"],
      "grn:create": ["super_admin", "admin", "procurement_manager", "staff"],
      "grn:edit": ["super_admin", "admin", "procurement_manager"],
      "grn:delete": ["super_admin", "admin"],
      // Phase 20 - Warranty Management
      "warranty:view": ["super_admin", "admin", "ict_manager", "procurement_manager"],
      "warranty:create": ["super_admin", "admin", "ict_manager", "procurement_manager"],
      "warranty:edit": ["super_admin", "admin", "ict_manager", "procurement_manager"],
      "warranty:delete": ["super_admin", "admin"],
      // Phase 20 - Asset Management
      "assets:view": ["super_admin", "admin", "ict_manager", "procurement_manager"],
      "assets:create": ["super_admin", "admin", "ict_manager", "procurement_manager"],
      "assets:edit": ["super_admin", "admin", "ict_manager", "procurement_manager"],
      "assets:delete": ["super_admin", "admin"],
      // Phase 20 - Document Management
      "documents:view": ["super_admin", "admin", "staff", "project_manager"],
      "documents:create": ["super_admin", "admin", "staff", "project_manager"],
      "documents:edit": ["super_admin", "admin", "project_manager"],
      "documents:delete": ["super_admin", "admin"],
      "documents:upload": ["super_admin", "admin", "staff", "project_manager", "hr", "accountant"],
      // Phase 20 - Contract Management
      "contracts:view": ["super_admin", "admin", "procurement_manager", "accountant"],
      "contracts:create": ["super_admin", "admin", "procurement_manager"],
      "contracts:edit": ["super_admin", "admin", "procurement_manager"],
      "contracts:delete": ["super_admin", "admin"],
      "contracts:approve": ["super_admin", "admin"],
      // Remaining missing features
      "leave:read": ["super_admin", "admin", "hr"],
      "leave:approve": ["super_admin", "admin", "hr"],
      "leave:create": ["super_admin", "admin", "hr", "staff", "project_manager", "ict_manager", "accountant", "sales_manager", "procurement_manager"],
      "leave:delete": ["super_admin", "admin", "hr"],
      // Organization Permissions
      // Organization Admin Features
      "org:admin:manage_users": ["super_admin"],
      "org:admin:manage_roles": ["super_admin"],
      "org:admin:settings": ["super_admin", "admin", "ict_manager"],
      // Organization User Management & Permissions
      "org:users:edit": ["super_admin", "admin", "ict_manager"],
      "org:users:view": ["super_admin", "admin", "ict_manager"],
      "org:users:create": ["super_admin", "admin", "ict_manager"],
      "org:users:delete": ["super_admin", "admin"],
      "org:users:update": ["super_admin", "admin", "ict_manager"],
      "org:users:permissions": ["super_admin"],
      "org:users:permissions:edit": ["super_admin", "ict_manager"],
      "org:users:permissions:view": ["super_admin", "admin", "ict_manager"],
      "org:users:roles": ["super_admin"],
      "org:users:roles:edit": ["super_admin"],
      "org:users:read": ["super_admin", "admin", "ict_manager"],
      // Organization Accounting Features
      "org:accounting:invoices": ["super_admin", "admin", "accountant", "project_manager", "sales_manager", "ict_manager"],
      "org:accounting:invoices:view": ["super_admin", "admin", "accountant", "project_manager", "sales_manager", "ict_manager"],
      "org:accounting:invoices:create": ["super_admin", "admin", "accountant", "sales_manager", "ict_manager"],
      "org:accounting:invoices:edit": ["super_admin", "admin", "accountant", "ict_manager"],
      "org:accounting:invoices:delete": ["super_admin", "admin"],
      "org:accounting:invoices:approve": ["super_admin", "admin", "accountant"],
      // Generic Organization accounting permissions (used by bankReconciliation)
      "org:accounting:read": ["super_admin", "admin", "accountant", "project_manager", "ict_manager"],
      "org:accounting:create": ["super_admin", "admin", "accountant"],
      "org:accounting:edit": ["super_admin", "admin", "accountant"],
      "org:accounting:delete": ["super_admin", "admin"],
      "org:accounting:receipts": ["super_admin", "admin", "accountant", "project_manager", "ict_manager"],
      "org:accounting:receipts:view": ["super_admin", "admin", "accountant", "project_manager", "ict_manager"],
      "org:accounting:receipts:create": ["super_admin", "admin", "accountant"],
      "org:accounting:receipts:edit": ["super_admin", "admin", "accountant"],
      "org:accounting:receipts:delete": ["super_admin", "admin"],
      "org:accounting:payments": ["super_admin", "admin", "accountant"],
      "org:accounting:payments:view": ["super_admin", "admin", "accountant", "project_manager", "sales_manager"],
      "org:accounting:payments:record": ["super_admin", "admin", "accountant"],
      "org:accounting:payments:create": ["super_admin", "admin", "accountant"],
      "org:accounting:payments:edit": ["super_admin", "admin", "accountant"],
      "org:accounting:payments:delete": ["super_admin", "admin"],
      "org:accounting:payments:approve": ["super_admin", "admin", "accountant"],
      "org:accounting:payments:reconcile": ["super_admin", "admin", "accountant"],
      "org:accounting:payments:refund": ["super_admin", "admin"],
      "org:accounting:expenses": ["super_admin", "admin", "accountant", "project_manager"],
      "org:accounting:expenses:view": ["super_admin", "admin", "accountant", "project_manager"],
      "org:accounting:expenses:create": ["super_admin", "admin", "accountant", "staff"],
      "org:accounting:expenses:edit": ["super_admin", "admin", "accountant"],
      "org:accounting:expenses:approve": ["super_admin", "admin", "accountant"],
      "org:accounting:expenses:reject": ["super_admin", "admin", "accountant"],
      "org:accounting:expenses:delete": ["super_admin", "admin"],
      "org:accounting:expenses:budget": ["super_admin", "admin", "accountant"],
      "org:accounting:reports": ["super_admin", "admin", "accountant"],
      "org:accounting:reports:view": ["super_admin", "admin", "accountant"],
      "org:accounting:chart_of_accounts": ["super_admin", "admin", "accountant"],
      "org:accounting:chart_of_accounts:view": ["super_admin", "admin", "accountant"],
      "org:accounting:reconciliation": ["super_admin", "admin", "accountant"],
      "org:accounting:reconciliation:view": ["super_admin", "admin", "accountant"],
      // Organization HR Features
      "org:hr:view": ["super_admin", "admin", "hr"],
      "org:hr:edit": ["super_admin", "admin", "hr"],
      "org:hr:employees": ["super_admin", "admin", "hr"],
      "org:hr:employees:view": ["super_admin", "admin", "hr", "project_manager"],
      "org:hr:employees:create": ["super_admin", "admin", "hr"],
      "org:hr:employees:edit": ["super_admin", "admin", "hr"],
      "org:hr:employees:delete": ["super_admin", "admin"],
      // Standalone Organization employee read/write features (used by employees router directly)
      "org:employees:read": ["super_admin", "admin", "hr", "project_manager", "ict_manager"],
      "org:employees:view": ["super_admin", "admin", "hr", "project_manager"],
      "org:employees:edit": ["super_admin", "admin", "hr"],
      "org:employees:create": ["super_admin", "admin", "hr"],
      "org:employees:update": ["super_admin", "admin", "hr"],
      "org:employees:delete": ["super_admin", "admin"],
      "org:hr:departments": ["super_admin", "admin", "hr"],
      "org:hr:departments:view": ["super_admin", "admin", "hr"],
      "org:hr:departments:create": ["super_admin", "admin", "hr"],
      "org:hr:departments:edit": ["super_admin", "admin", "hr"],
      "org:hr:departments:delete": ["super_admin", "admin"],
      "org:hr:jobGroups": ["super_admin", "admin", "hr"],
      "org:hr:jobGroups:view": ["super_admin", "admin", "hr"],
      "org:hr:jobGroups:create": ["super_admin", "admin", "hr"],
      "org:hr:jobGroups:edit": ["super_admin", "admin", "hr"],
      "org:hr:jobGroups:delete": ["super_admin", "admin"],
      // Standalone Organization job groups (used by jobGroups router)
      "org:jobGroups:read": ["super_admin", "admin", "hr"],
      "org:jobGroups:create": ["super_admin", "admin", "hr"],
      "org:jobGroups:edit": ["super_admin", "admin", "hr"],
      "org:jobGroups:delete": ["super_admin", "admin"],
      "org:hr:payroll": ["super_admin", "admin", "hr"],
      "org:hr:payroll:view": ["super_admin", "admin", "hr"],
      "org:hr:payroll:create": ["super_admin", "admin", "hr"],
      "org:hr:payroll:approve": ["super_admin", "admin", "hr"],
      // Standalone Organization payroll features (used by payslips router)
      "org:payroll:view": ["super_admin", "admin", "hr", "accountant"],
      "org:payroll:edit": ["super_admin", "admin", "hr"],
      "org:hr:leave": ["super_admin", "admin", "hr"],
      "org:hr:leave:approve": ["super_admin", "admin", "hr"],
      "org:hr:attendance": ["super_admin", "admin", "hr"],
      // Generic Organization HR attendance permissions
      "org:attendance:read": ["super_admin", "admin", "hr"],
      "org:attendance:create": ["super_admin", "admin", "hr"],
      "org:attendance:edit": ["super_admin", "admin", "hr"],
      "org:attendance:delete": ["super_admin", "admin"],
      // Standalone Organization estimate features (used by estimates router)
      "org:estimates:read": ["super_admin", "admin", "project_manager", "accountant", "sales_manager"],
      "org:estimates:create": ["super_admin", "admin", "project_manager", "sales_manager"],
      "org:estimates:edit": ["super_admin", "admin", "project_manager", "sales_manager"],
      "org:estimates:delete": ["super_admin", "admin"],
      "org:estimates:approve": ["super_admin", "admin", "project_manager", "sales_manager"],
      "org:estimates:send": ["super_admin", "admin", "project_manager", "sales_manager"],
      "org:estimates:view": ["super_admin", "admin", "project_manager", "accountant", "sales_manager"],
      // Organization Estimates to Approvals (route estimates through approval system)
      "org:estimates:submit_for_approval": ["super_admin", "admin", "project_manager", "sales_manager"],
      "org:estimates:approvals": ["super_admin", "admin", "accountant"],
      "org:sales:receipts": ["super_admin", "admin", "accountant", "project_manager", "sales_manager"],
      // Organization Procurement
      "org:procurement:view": ["super_admin", "admin", "procurement_manager"],
      "org:procurement:suppliers": ["super_admin", "admin"],
      "org:procurement:suppliers:view": ["super_admin", "admin"],
      "org:procurement:suppliers:create": ["super_admin", "admin"],
      "org:procurement:suppliers:edit": ["super_admin", "admin"],
      "org:procurement:suppliers:delete": ["super_admin", "admin"],
      "org:procurement:lpo": ["super_admin", "admin"],
      "org:procurement:lpo:view": ["super_admin", "admin", "accountant", "project_manager"],
      "org:procurement:lpo:create": ["super_admin", "admin", "project_manager"],
      "org:procurement:lpo:edit": ["super_admin", "admin", "project_manager"],
      "org:procurement:lpo:delete": ["super_admin", "admin"],
      "org:procurement:lpo:approve": ["super_admin", "admin"],
      "org:procurement:imprest": ["super_admin", "admin"],
      "org:procurement:imprest:view": ["super_admin", "admin", "accountant"],
      "org:procurement:imprest:create": ["super_admin", "admin", "staff"],
      "org:procurement:imprest:edit": ["super_admin", "admin"],
      "org:procurement:imprest:delete": ["super_admin", "admin"],
      "org:procurement:imprest:approve": ["super_admin", "admin"],
      "org:procurement:orders": ["super_admin", "admin"],
      "org:procurement:orders:view": ["super_admin", "admin", "procurement_manager"],
      "org:procurement:orders:create": ["super_admin", "admin", "procurement_manager"],
      "org:procurement:orders:edit": ["super_admin", "admin", "procurement_manager"],
      "org:procurement:orders:delete": ["super_admin", "admin"],
      // Analytics view permission used by dashboard and reports
      "org:analytics:view": ["super_admin", "admin", "accountant", "project_manager", "ict_manager", "sales_manager"],
      // Organization Communications / email queue management
      "org:communications:email_queue": ["super_admin", "admin", "ict_manager"],
      // Organization Authentication utilities
      "org:auth:sessions": ["super_admin", "admin", "ict_manager"],
      "org:auth:export_user_data": ["super_admin", "admin", "ict_manager"],
      // Clients Features
      "org:clients:view": ["super_admin", "admin", "accountant", "project_manager", "procurement_manager", "sales_manager"],
      "org:clients:create": ["super_admin", "admin", "project_manager", "sales_manager"],
      "org:clients:edit": ["super_admin", "admin", "project_manager", "sales_manager"],
      "org:clients:delete": ["super_admin", "admin"],
      "org:clients:manage_relationships": ["super_admin", "admin", "project_manager", "sales_manager"],
      // Products & Services
      "org:products:view": ["super_admin", "admin", "accountant", "project_manager", "staff", "procurement_manager"],
      "org:products:create": ["super_admin", "admin"],
      "org:products:edit": ["super_admin", "admin"],
      "org:products:delete": ["super_admin", "admin"],
      "org:products:manage_inventory": ["super_admin", "admin", "procurement_manager"],
      "org:services:view": ["super_admin", "admin", "project_manager", "staff"],
      "org:services:create": ["super_admin", "admin"],
      "org:services:edit": ["super_admin", "admin"],
      "org:services:delete": ["super_admin", "admin"],
      // Organization Projects Features
      "org:projects:view": ["super_admin", "admin", "project_manager", "staff"],
      "org:projects:create": ["super_admin", "admin", "project_manager"],
      "org:projects:edit": ["super_admin", "admin", "project_manager"],
      "org:projects:delete": ["super_admin", "admin"],
      "org:projects:manage_team": ["super_admin", "admin", "project_manager"],
      "org:projects:manage_milestones": ["super_admin", "admin", "project_manager"],
      "org:projects:manage_budget": ["super_admin", "admin", "accountant", "project_manager"],
      // Organization Sales Features
      "org:sales:view": ["super_admin", "admin", "project_manager", "accountant", "sales_manager"],
      "org:sales:create": ["super_admin", "admin", "project_manager", "sales_manager"],
      "org:sales:edit": ["super_admin", "admin", "project_manager", "sales_manager"],
      "org:sales:delete": ["super_admin", "admin"],
      "org:sales:pipeline": ["super_admin", "admin", "project_manager", "sales_manager"],
      "org:sales:opportunities": ["super_admin", "admin", "project_manager", "sales_manager"],
      "org:sales:opportunities:create": ["super_admin", "admin", "project_manager", "sales_manager"],
      "org:sales:opportunities:edit": ["super_admin", "admin", "project_manager", "sales_manager"],
      "org:sales:opportunities:delete": ["super_admin", "admin"],
      // Organization Dashboard Features
      "org:dashboard:view": ["super_admin", "admin", "accountant", "project_manager", "hr", "staff", "ict_manager", "sales_manager"],
      "org:dashboard:customize": ["super_admin", "admin", "project_manager", "sales_manager"],
      "org:dashboard:edit": ["super_admin", "admin"],
      // Organization Departments Features
      "org:departments:view": ["super_admin", "admin", "hr", "project_manager"],
      "org:departments:create": ["super_admin", "admin", "hr"],
      "org:departments:edit": ["super_admin", "admin", "hr"],
      "org:departments:delete": ["super_admin", "admin"],
      "org:departments:read": ["super_admin", "admin", "hr", "project_manager"],
      // Organization Reports Features (with department access)
      "org:reports:view": ["super_admin", "admin", "accountant", "project_manager", "hr", "sales_manager", "ict_manager"],
      "org:reports:create": ["super_admin", "admin"],
      "org:reports:financial": ["super_admin", "admin", "accountant"],
      "org:reports:sales": ["super_admin", "admin", "project_manager", "accountant", "sales_manager"],
      "org:reports:projects": ["super_admin", "admin", "project_manager"],
      "org:reports:hr": ["super_admin", "admin", "hr"],
      "org:reports:procurement": ["super_admin", "admin", "procurement_manager"],
      "org:reports:export": ["super_admin", "admin", "accountant", "project_manager", "hr"],
      "org:reports:departments": ["super_admin", "admin", "hr"],
      // Organization AI Features - Chat & Assistance
      "org:ai:access": ["super_admin", "admin", "project_manager", "sales_manager", "accountant", "hr", "staff", "ict_manager"],
      "org:ai:summarize": ["super_admin", "admin", "project_manager", "sales_manager", "accountant", "hr", "staff", "ict_manager"],
      "org:ai:generateEmail": ["super_admin", "admin", "project_manager", "sales_manager", "accountant", "hr", "staff", "ict_manager"],
      "org:ai:chat": ["super_admin", "admin", "project_manager", "sales_manager", "accountant", "hr", "staff", "ict_manager"],
      "org:ai:financial": ["super_admin", "admin", "project_manager", "sales_manager", "accountant", "hr", "ict_manager"],
      "org:ai:modal": ["super_admin", "admin", "project_manager", "sales_manager", "accountant", "hr", "staff", "ict_manager"],
      // Organization Chat/IntraChat Features
      "org:communications:chat": ["super_admin", "admin", "staff", "project_manager", "hr", "accountant", "sales_manager", "ict_manager"],
      "org:communications:intrachat": ["super_admin", "admin", "staff", "project_manager", "sales_manager", "accountant", "hr", "staff", "ict_manager"],
      "org:communications:ai_assistant": ["super_admin", "admin", "staff", "project_manager", "hr", "accountant", "sales_manager", "ict_manager"],
      // Organization Support & Communications
      "org:communications:view": ["super_admin", "admin", "staff", "project_manager", "hr", "accountant", "sales_manager", "ict_manager"],
      "org:communications:manage": ["super_admin", "admin", "ict_manager", "hr", "accountant", "sales_manager", "project_manager"],
      // Organization Notifications
      "org:notifications:read": ["super_admin", "admin", "staff", "project_manager", "hr", "accountant", "sales_manager", "ict_manager"],
      "org:notifications:create": ["super_admin", "admin", "staff", "project_manager", "hr", "accountant", "sales_manager", "ict_manager"],
      "org:communications:email": ["super_admin", "admin", "ict_manager", "hr", "accountant", "sales_manager", "project_manager"],
      "org:communications:notifications": ["super_admin", "admin", "project_manager", "sales_manager", "accountant", "hr", "staff", "ict_manager"],
      "org:communications:tickets": ["super_admin", "project_manager", "sales_manager", "accountant", "hr", "staff", "ict_manager"],
      "org:communications:tickets:create": ["super_admin", "admin", "project_manager", "sales_manager", "accountant", "hr", "staff", "ict_manager"],
      "org:communications:tickets:resolve": ["super_admin", "admin", "project_manager", "sales_manager", "accountant", "hr", "staff", "ict_manager"],
      // Organization Tools & Utilities
      "org:tools:import_export": ["super_admin", "admin", "accountant", "project_manager", "sales_manager", "procurement_manager", "ict_manager", "hr", "staff", "client"],
      "org:tools:import:create": ["super_admin", "admin", "accountant", "project_manager", "sales_manager", "procurement_manager", "ict_manager", "hr", "staff", "client"],
      "org:tools:import:read": ["super_admin", "admin", "accountant", "project_manager", "sales_manager", "procurement_manager", "ict_manager", "hr", "staff", "client"],
      "org:tools:import:restore": ["super_admin", "admin"],
      "org:tools:export:create": ["super_admin", "admin", "accountant", "project_manager", "sales_manager", "procurement_manager", "ict_manager", "hr", "staff", "client"],
      "org:tools:data_export": ["super_admin", "admin", "accountant", "project_manager", "sales_manager", "procurement_manager", "ict_manager", "hr", "staff", "client"],
      "org:tools:data_backup": ["super_admin", "admin", "ict_manager"],
      "org:tools:system_health": ["super_admin", "admin", "ict_manager"],
      "org:tools:api_management": ["super_admin", "admin", "ict_manager"],
      "org:tools:automation": ["super_admin", "admin", "ict_manager"],
      "org:tools:workflows": ["super_admin", "admin", "ict_manager"],
      // Organization Client Portal
      "org:client_portal:dashboard": ["client"],
      "org:client_portal:invoices": ["client"],
      "org:client_portal:projects": ["client"],
      "org:client_portal:payments": ["client"],
      // Organization Approvals Features
      "org:approvals:view": ["super_admin", "admin", "accountant", "hr"],
      "org:approvals:read": ["super_admin", "admin", "accountant", "hr"],
      "org:approvals:approve": ["super_admin", "admin", "accountant", "hr"],
      "org:approvals:reject": ["super_admin", "admin", "accountant", "hr"],
      "org:approvals:delete": ["super_admin", "admin"],
      // Organization Chart of Accounts Features
      "org:chartOfAccounts:read": ["super_admin", "admin", "accountant"],
      "org:chartOfAccounts:create": ["super_admin", "admin", "accountant"],
      "org:chartOfAccounts:edit": ["super_admin", "admin", "accountant"],
      "org:chartOfAccounts:delete": ["super_admin", "admin"],
      // Organization Budgets Features (prefix: budgets)
      "org:budgets:view": ["super_admin", "admin", "accountant", "project_manager"],
      "org:budgets:create": ["super_admin", "admin", "accountant"],
      "org:budgets:edit": ["super_admin", "admin", "accountant"],
      "org:budgets:delete": ["super_admin", "admin"],
      // Organization Budget Features (prefix: budget - used by budget router)
      "org:budget:read": ["super_admin", "admin", "accountant", "project_manager"],
      "org:budget:edit": ["super_admin", "admin", "accountant"],
      // Organization Invoice Features
      "org:invoices:view": ["super_admin", "admin", "accountant", "project_manager"],
      "org:invoices:create": ["super_admin", "admin", "accountant"],
      "org:invoices:edit": ["super_admin", "admin", "accountant"],
      "org:invoices:delete": ["super_admin", "admin"],
      "org:invoices:read": ["super_admin", "admin", "accountant", "project_manager"],
      // Organization Expense Features
      "org:expenses:view": ["super_admin", "admin", "accountant", "project_manager"],
      "org:expenses:create": ["super_admin", "admin", "accountant", "staff"],
      "org:expenses:edit": ["super_admin", "admin", "accountant"],
      "org:expenses:delete": ["super_admin", "admin"],
      "org:expenses:read": ["super_admin", "admin", "accountant", "project_manager"],
      // Organization Payment Features
      "org:payments:view": ["super_admin", "admin", "accountant", "project_manager"],
      "org:payments:create": ["super_admin", "admin", "accountant"],
      "org:payments:edit": ["super_admin", "admin", "accountant"],
      "org:payments:delete": ["super_admin", "admin"],
      "org:payments:read": ["super_admin", "admin", "accountant", "project_manager"],
      "org:payments:reconcile": ["super_admin", "admin", "accountant"],
      // Organization Client Features (ensure all CRUD operations exist)
      "org:clients:read": ["super_admin", "admin", "project_manager", "accountant", "procurement_manager", "ict_manager", "sales_manager"],
      // Organization Communications Features
      "org:communications:read": ["super_admin", "admin", "staff", "project_manager", "hr", "accountant", "sales_manager", "ict_manager", "procurement_manager"],
      "org:communications:messaging": ["super_admin", "admin", "staff", "project_manager", "hr", "accountant", "sales_manager", "ict_manager", "procurement_manager"],
      "org:communications:send": ["super_admin", "admin", "staff", "project_manager", "hr", "accountant", "sales_manager", "ict_manager", "procurement_manager"],
      // Organization Filters & Saved Views
      "org:filters:create": ["super_admin", "admin", "accountant", "project_manager", "hr", "staff", "ict_manager", "procurement_manager", "sales_manager", "client"],
      "org:filters:read": ["super_admin", "admin", "accountant", "project_manager", "hr", "staff", "ict_manager", "procurement_manager", "sales_manager", "client"],
      "org:filters:update": ["super_admin", "admin", "accountant", "project_manager", "hr", "staff", "ict_manager", "procurement_manager", "sales_manager", "client"],
      "org:filters:delete": ["super_admin", "admin", "accountant", "project_manager", "hr", "staff", "ict_manager", "procurement_manager", "sales_manager", "client"],
      // Phase 20 - Organization Business Intelligence & Analytics
      "org:analytics:reports": ["super_admin", "admin", "accountant", "project_manager", "hr", "sales_manager"],
      "org:analytics:dashboards": ["super_admin", "admin", "project_manager", "accountant"],
      "org:analytics:export": ["super_admin", "admin", "accountant"],
      // Phase 20 - Organization Supplier Management
      "org:suppliers:view": ["super_admin", "admin", "procurement_manager"],
      "org:suppliers:create": ["super_admin", "admin", "procurement_manager"],
      "org:suppliers:edit": ["super_admin", "admin", "procurement_manager"],
      "org:suppliers:delete": ["super_admin", "admin"],
      "org:suppliers:read": ["super_admin", "admin", "procurement_manager"],
      //  Phase 20 - Organization Quotations/RFQs
      "org:quotations:view": ["super_admin", "admin", "procurement_manager", "accountant"],
      "org:quotations:create": ["super_admin", "admin", "procurement_manager"],
      "org:quotations:edit": ["super_admin", "admin", "procurement_manager"],
      "org:quotations:delete": ["super_admin", "admin"],
      "org:quotations:approve": ["super_admin", "admin"],
      // Phase 20 - Organization Delivery Notes  
      "org:delivery_notes:view": ["super_admin", "admin", "procurement_manager", "accountant", "staff"],
      "org:delivery_notes:create": ["super_admin", "admin", "procurement_manager", "staff"],
      "org:delivery_notes:edit": ["super_admin", "admin", "procurement_manager"],
      "org:delivery_notes:delete": ["super_admin", "admin"],
      // Phase 20 - Organization Goods Received Notes
      "org:grn:view": ["super_admin", "admin", "procurement_manager", "accountant", "staff"],
      "org:grn:create": ["super_admin", "admin", "procurement_manager", "staff"],
      "org:grn:edit": ["super_admin", "admin", "procurement_manager"],
      "org:grn:delete": ["super_admin", "admin"],
      // Phase 20 - Organization Warranty Management
      "org:warranty:view": ["super_admin", "admin", "ict_manager", "procurement_manager"],
      "org:warranty:create": ["super_admin", "admin", "ict_manager", "procurement_manager"],
      "org:warranty:edit": ["super_admin", "admin", "ict_manager", "procurement_manager"],
      "org:warranty:delete": ["super_admin", "admin"],
      // Phase 20 - Organization Asset Management
      "org:assets:view": ["super_admin", "admin", "ict_manager", "procurement_manager"],
      "org:assets:create": ["super_admin", "admin", "ict_manager", "procurement_manager"],
      "org:assets:edit": ["super_admin", "admin", "ict_manager", "procurement_manager"],
      "org:assets:delete": ["super_admin", "admin"],
      // Phase 20 - Organization Document Management
      "org:documents:view": ["super_admin", "admin", "staff", "project_manager"],
      "org:documents:create": ["super_admin", "admin", "staff", "project_manager"],
      "org:documents:edit": ["super_admin", "admin", "project_manager"],
      "org:documents:delete": ["super_admin", "admin"],
      "org:documents:upload": ["super_admin", "admin", "staff", "project_manager", "hr", "accountant"],
      // Phase 20 - Organization Contract Management
      "org:contracts:view": ["super_admin", "admin", "procurement_manager", "accountant"],
      "org:contracts:create": ["super_admin", "admin", "procurement_manager"],
      "org:contracts:edit": ["super_admin", "admin", "procurement_manager"],
      "org:contracts:delete": ["super_admin", "admin"],
      "org:contracts:approve": ["super_admin", "admin"],
      // Organization Remaining missing features
      "org:leave:read": ["super_admin", "admin", "hr"],
      "org:leave:approve": ["super_admin", "admin", "hr"],
      "org:leave:create": ["super_admin", "admin", "hr", "staff"],
      "org:leave:delete": ["super_admin", "admin", "hr"],
      // Organization Settings Features
      "org:settings:view": ["super_admin", "admin", "ict_manager"],
      "org:settings:edit": ["super_admin", "admin"],
      "org:settings:general": ["super_admin", "admin"],
      "org:settings:company": ["super_admin", "admin"],
      "org:settings:currency": ["super_admin", "admin"],
      "org:settings:theme": ["super_admin", "admin"],
      "org:settings:branding": ["super_admin", "admin"],
      "org:settings:email": ["super_admin", "admin", "ict_manager"],
      "org:settings:email_templates": ["super_admin", "admin", "ict_manager"],
      "org:settings:security": ["super_admin", "admin", "ict_manager"],
      "org:settings:security_password": ["super_admin", "admin", "ict_manager"],
      "org:settings:security_2fa": ["super_admin", "admin", "ict_manager"],
      "org:settings:security_sessions": ["super_admin", "admin", "ict_manager"],
      "org:settings:security_log": ["super_admin", "admin", "ict_manager"],
      "org:settings:roles": ["super_admin", "admin"],
      "org:settings:permissions": ["super_admin"],
      "org:settings:notifications": ["super_admin", "admin"],
      "org:settings:sms": ["super_admin", "admin", "ict_manager"],
      "org:settings:sms_templates": ["super_admin", "admin", "ict_manager"],
      "org:settings:backup": ["super_admin", "admin", "ict_manager"]
    };
  }
});

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
import { eq as eq3, and as and3, desc as desc2, sql as sql3 } from "drizzle-orm";
async function isMaintenanceModeEnabled() {
  const now = Date.now();
  if (now - _maintenanceCache.checkedAt < MAINTENANCE_CACHE_TTL) {
    return _maintenanceCache.enabled;
  }
  try {
    const database = await getDb();
    if (!database) return false;
    const rows = await database.select().from(settings).where(and3(eq3(settings.category, "maintenance"), eq3(settings.key, "maintenance_mode"))).limit(1);
    let enabled = rows.length > 0 && (rows[0].value === "true" || rows[0].value === "1");
    if (!enabled) {
      const schedRows = await database.select().from(settings).where(and3(eq3(settings.category, "maintenance"), eq3(settings.key, "maintenance_scheduled_at"))).limit(1);
      if (schedRows.length > 0 && schedRows[0].value) {
        const scheduledTime = new Date(schedRows[0].value).getTime();
        if (!isNaN(scheduledTime) && now >= scheduledTime) {
          await database.insert(settings).values({ id: `maint_mode_${now}`, key: "maintenance_mode", value: "true", category: "maintenance", updatedAt: (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").slice(0, 19) }).onDuplicateKeyUpdate({ set: { value: "true", updatedAt: (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").slice(0, 19) } }).catch(() => {
          });
          await database.update(settings).set({ value: "true" }).where(and3(eq3(settings.category, "maintenance"), eq3(settings.key, "maintenance_mode"))).catch(() => {
          });
          await database.update(settings).set({ value: "" }).where(and3(eq3(settings.category, "maintenance"), eq3(settings.key, "maintenance_scheduled_at"))).catch(() => {
          });
          enabled = true;
          console.log("[Maintenance] Auto-enabled from schedule at", (/* @__PURE__ */ new Date()).toISOString());
          try {
            const { v4: uuidv42 } = await import("uuid");
            const backupId = uuidv42();
            const ts = (/* @__PURE__ */ new Date()).toISOString();
            await database.execute(
              sql3`INSERT INTO backup_history (id, name, backupType, scope, status, createdBy)
                  VALUES (${backupId}, ${"Pre-Maintenance Auto Backup " + ts.slice(0, 10)}, 'scheduled', 'full', 'completed', 'system')`
            );
            console.log("[Maintenance] Auto-backup created:", backupId);
          } catch (backupErr) {
            console.warn("[Maintenance] Auto-backup failed:", backupErr);
          }
        }
      }
    }
    _maintenanceCache = { enabled, checkedAt: now };
    return enabled;
  } catch {
    return _maintenanceCache.enabled;
  }
}
var t, _maintenanceCache, MAINTENANCE_CACHE_TTL, router, publicProcedure, requireUser, MAINTENANCE_BYPASS_ROLES, maintenanceGuard, subscriptionAccessGuard, protectedProcedure, subscriptionStatusProcedure, adminProcedure, orgScopedProcedure, createFeatureRestrictedProcedure2;
var init_trpc = __esm({
  "server/_core/trpc.ts"() {
    init_const();
    init_enhancedRbac();
    init_db();
    init_schema();
    t = initTRPC.context().create({
      transformer: superjson
    });
    _maintenanceCache = { enabled: false, checkedAt: 0 };
    MAINTENANCE_CACHE_TTL = 1e4;
    router = t.router;
    publicProcedure = t.procedure;
    requireUser = t.middleware(async (opts) => {
      const { ctx, next } = opts;
      if (!ctx.user) {
        throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
      }
      return next({
        ctx: {
          ...ctx,
          user: ctx.user
        }
      });
    });
    MAINTENANCE_BYPASS_ROLES = ["super_admin", "ict_manager"];
    maintenanceGuard = t.middleware(async (opts) => {
      const { ctx, next } = opts;
      if (ctx.user && !ctx.user.organizationId && MAINTENANCE_BYPASS_ROLES.includes(ctx.user.role)) {
        return next({ ctx });
      }
      const inMaintenance = await isMaintenanceModeEnabled();
      if (inMaintenance) {
        throw new TRPCError2({
          code: "PRECONDITION_FAILED",
          message: "The system is currently under maintenance. Please try again later."
        });
      }
      return next({ ctx });
    });
    subscriptionAccessGuard = t.middleware(async (opts) => {
      const { ctx, next, path } = opts;
      const user = ctx.user;
      if (!user?.organizationId) {
        return next({ ctx });
      }
      if (path === "multiTenancy.getSubscriptionAccess" || path.startsWith("orgBilling.")) {
        return next({ ctx });
      }
      try {
        const database = await getDb();
        if (!database) return next({ ctx });
        const rows = await database.select().from(subscriptions).where(eq3(subscriptions.organizationId, user.organizationId)).orderBy(desc2(subscriptions.createdAt)).limit(1);
        const subscription = rows[0];
        if (subscription && (subscription.isLocked === 1 || ["suspended", "cancelled", "expired"].includes(subscription.status))) {
          throw new TRPCError2({
            code: "FORBIDDEN",
            message: subscription.status === "cancelled" || subscription.status === "expired" ? "This organization subscription has been terminated. Contact the platform administrator to restore access." : "This organization subscription is suspended because an invoice is overdue. Please contact your organization super admin.",
            cause: "subscription_locked"
          });
        }
      } catch (error) {
        if (error instanceof TRPCError2) throw error;
        console.warn("[SubscriptionGuard] Could not verify subscription:", error);
      }
      return next({ ctx });
    });
    protectedProcedure = t.procedure.use(requireUser).use(maintenanceGuard).use(subscriptionAccessGuard);
    subscriptionStatusProcedure = t.procedure.use(requireUser).use(maintenanceGuard);
    adminProcedure = t.procedure.use(
      t.middleware(async (opts) => {
        const { ctx, next } = opts;
        if (!ctx.user || ctx.user.role !== "admin" && ctx.user.role !== "super_admin") {
          throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
        }
        if (ctx.user.organizationId) {
          throw new TRPCError2({
            code: "FORBIDDEN",
            message: "This resource is only accessible to platform administrators"
          });
        }
        return next({
          ctx: {
            ...ctx,
            user: ctx.user
          }
        });
      })
    );
    orgScopedProcedure = t.procedure.use(
      t.middleware(async (opts) => {
        const { ctx, next } = opts;
        if (!ctx.user) {
          throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
        }
        if (!ctx.user.organizationId) {
          throw new TRPCError2({
            code: "FORBIDDEN",
            message: "This resource requires organization context. Global platform users cannot access this endpoint."
          });
        }
        return next({
          ctx: {
            ...ctx,
            user: ctx.user
          }
        });
      })
    ).use(maintenanceGuard);
    createFeatureRestrictedProcedure2 = createFeatureRestrictedProcedure;
  }
});

// server/routers/csvImportExport.ts
init_trpc();
import { z as z2 } from "zod";

// server/utils/validation.ts
import { z } from "zod";
var optionalEmail = () => z.preprocess(
  (value) => {
    if (typeof value !== "string") return value;
    const trimmed = value.trim();
    return trimmed === "" ? void 0 : trimmed;
  },
  z.string().email().optional()
);

// server/routers/csvImportExport.ts
init_db();
init_schema();
import { TRPCError as TRPCError3 } from "@trpc/server";
import { eq as eq4 } from "drizzle-orm";
import { getTableColumns as getTableColumns2 } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

// server/utils/csvGenerator.ts
var moduleTemplates = {
  clients: [
    { name: "organizationId", type: "string", required: false, example: "org_123", description: "Organization ID for multi-tenant isolation" },
    { name: "companyName", type: "string", required: true, example: "ABC Corporation", description: "Company legal name" },
    { name: "contactPerson", type: "string", required: false, example: "John Doe", description: "Primary contact name" },
    { name: "email", type: "email", required: false, example: "john@example.com", description: "Contact email address" },
    { name: "phone", type: "string", required: false, example: "+254712345678", description: "Primary phone number" },
    { name: "secondaryPhone", type: "string", required: false, example: "+254700000001", description: "Secondary phone number" },
    { name: "address", type: "string", required: false, example: "123 Main Street", description: "Business address" },
    { name: "city", type: "string", required: false, example: "Nairobi", description: "City name" },
    { name: "country", type: "string", required: false, example: "Kenya", description: "Country name" },
    { name: "postalCode", type: "string", required: false, example: "00100", description: "Postal code" },
    { name: "taxId", type: "string", required: false, example: "PIN123456", description: "Tax identification number" },
    { name: "website", type: "string", required: false, example: "https://www.example.com", description: "Company website" },
    { name: "industry", type: "string", required: false, example: "Technology", description: "Business industry" },
    { name: "status", type: "enum", required: false, example: "active", enum: ["active", "inactive", "prospect", "archived"], description: "Client status" },
    { name: "assignedTo", type: "string", required: false, example: "user_123", description: "User assigned to client" },
    { name: "notes", type: "string", required: false, example: "Priority customer", description: "Client notes" },
    { name: "createdBy", type: "string", required: false, example: "user_123", description: "Creator user ID" },
    { name: "businessType", type: "string", required: false, example: "Limited Company", description: "Business registration type" },
    { name: "registrationNumber", type: "string", required: false, example: "COMP123456", description: "Business registration number" },
    { name: "bankName", type: "string", required: false, example: "KCB", description: "Bank name" },
    { name: "bankCode", type: "string", required: false, example: "01", description: "Bank code" },
    { name: "branch", type: "string", required: false, example: "Nairobi Central", description: "Bank branch" },
    { name: "bankAccountNumber", type: "string", required: false, example: "1234567890", description: "Bank account number" },
    { name: "creditLimit", type: "number", required: false, example: "100000", description: "Credit limit in base currency" },
    { name: "paymentTerms", type: "string", required: false, example: "Net 30", description: "Payment terms" },
    { name: "numberOfEmployees", type: "number", required: false, example: "25", description: "Employee count" },
    { name: "yearEstablished", type: "number", required: false, example: "2018", description: "Year company was established" },
    { name: "businessLicense", type: "string", required: false, example: "BL-123456", description: "Business license number" },
    { name: "leadSource", type: "string", required: false, example: "Referral", description: "Lead source" },
    { name: "currency", type: "string", required: false, example: "KES", description: "Preferred currency code" }
  ],
  employees: [
    { name: "organizationId", type: "string", required: false, example: "org_123", description: "Organization ID for multi-tenant isolation" },
    { name: "userId", type: "string", required: false, example: "user_123", description: "Linked user ID" },
    { name: "employeeNumber", type: "string", required: true, example: "EMP001", description: "Unique employee ID" },
    { name: "firstName", type: "string", required: true, example: "Jane", description: "First name" },
    { name: "lastName", type: "string", required: true, example: "Smith", description: "Last name" },
    { name: "email", type: "email", required: false, example: "jane.smith@example.com", description: "Work email" },
    { name: "phone", type: "string", required: false, example: "+254712345678", description: "Contact phone" },
    { name: "country", type: "string", required: false, example: "KE", description: "Country code" },
    { name: "gender", type: "enum", required: false, example: "female", enum: ["male", "female", "other"], description: "Employee gender" },
    { name: "maritalStatus", type: "enum", required: false, example: "single", enum: ["single", "married", "divorced", "widowed"], description: "Marital status" },
    { name: "dateOfBirth", type: "date", required: false, example: "1990-01-15", description: "Date of birth (YYYY-MM-DD)" },
    { name: "hireDate", type: "date", required: true, example: "2023-01-01", description: "Employment start date" },
    { name: "probationEndDate", type: "date", required: false, example: "2023-03-31", description: "Probation end date" },
    { name: "contractEndDate", type: "date", required: false, example: "2025-12-31", description: "Contract end date" },
    { name: "department", type: "string", required: false, example: "Sales", description: "Department name" },
    { name: "position", type: "string", required: false, example: "Sales Manager", description: "Job position" },
    { name: "jobGroupId", type: "string", required: true, example: "job_group_123", description: "Job group identifier" },
    { name: "salary", type: "number", required: false, example: "50000", description: "Monthly salary" },
    { name: "employmentType", type: "enum", required: false, example: "full_time", enum: ["full_time", "part_time", "contract", "intern", "contractual", "hourly", "wage", "temporary", "seasonal"], description: "Employment type" },
    { name: "status", type: "enum", required: false, example: "active", enum: ["active", "on_leave", "terminated", "suspended"], description: "Employment status" },
    { name: "address", type: "string", required: false, example: "456 Oak Avenue", description: "Residential address" },
    { name: "emergencyContactName", type: "string", required: false, example: "Mary Smith", description: "Emergency contact name" },
    { name: "emergencyContactRelationship", type: "string", required: false, example: "Spouse", description: "Emergency contact relationship" },
    { name: "emergencyContactPhone", type: "string", required: false, example: "+254712345678", description: "Emergency contact phone" },
    { name: "emergencyContact", type: "string", required: false, example: "Spouse; Mary Smith", description: "Emergency contact note" },
    { name: "bankName", type: "string", required: false, example: "KCB", description: "Bank name" },
    { name: "bankBranch", type: "string", required: false, example: "Westlands", description: "Bank branch" },
    { name: "bankAccountNumber", type: "string", required: false, example: "1234567890", description: "Bank account number" },
    { name: "nhifNumber", type: "string", required: false, example: "NHIF12345", description: "NHIF number" },
    { name: "nssfNumber", type: "string", required: false, example: "NSSF12345", description: "NSSF number" },
    { name: "taxId", type: "string", required: false, example: "PIN123456", description: "Tax identification number" },
    { name: "nationalId", type: "string", required: false, example: "12345678", description: "National ID number" },
    { name: "photoUrl", type: "string", required: false, example: "https://...", description: "Employee photo URL" },
    { name: "createdBy", type: "string", required: false, example: "user_123", description: "Creator user ID" }
  ],
  departments: [
    { name: "organizationId", type: "string", required: false, example: "org_123", description: "Organization ID for multi-tenant isolation" },
    { name: "name", type: "string", required: true, example: "Sales Department", description: "Department name" },
    { name: "description", type: "string", required: false, example: "Handles all client-facing sales", description: "Department description" },
    { name: "headId", type: "string", required: false, example: "employee_123", description: "Department head employee ID" },
    { name: "budget", type: "number", required: false, example: "500000", description: "Department budget" },
    { name: "salaryRangeMin", type: "number", required: false, example: "40000", description: "Minimum salary range" },
    { name: "salaryRangeMax", type: "number", required: false, example: "100000", description: "Maximum salary range" },
    { name: "status", type: "enum", required: false, example: "active", enum: ["active", "inactive"], description: "Department status" },
    { name: "defaultRole", type: "string", required: false, example: "sales_manager", description: "Default role for department" },
    { name: "createdBy", type: "string", required: false, example: "user_123", description: "Creator user ID" }
  ],
  jobGroups: [
    { name: "organizationId", type: "string", required: false, example: "org_123", description: "Organization ID for multi-tenant isolation" },
    { name: "name", type: "string", required: true, example: "Senior Manager", description: "Job group name" },
    { name: "managerId", type: "string", required: false, example: "manager_123", description: "Job group manager ID" },
    { name: "minimumGrossSalary", type: "number", required: true, example: "80000", description: "Minimum gross salary" },
    { name: "maximumGrossSalary", type: "number", required: true, example: "150000", description: "Maximum gross salary" },
    { name: "defaultBasicSalary", type: "number", required: false, example: "100000", description: "Default basic salary in cents" },
    { name: "defaultAnnualLeaveDays", type: "number", required: false, example: "21", description: "Default annual leave entitlement in days" },
    { name: "defaultAllowances", type: "string", required: false, example: '[{"type":"house","amount":500000,"frequency":"monthly"}]', description: "JSON line items, amounts in cents" },
    { name: "defaultDeductions", type: "string", required: false, example: '[{"type":"pension","amount":100000,"frequency":"monthly"}]', description: "JSON line items, amounts in cents" },
    { name: "defaultBenefits", type: "string", required: false, example: '[{"type":"medical","amount":0,"frequency":"monthly"}]', description: "JSON line items, amounts in cents" },
    { name: "description", type: "string", required: false, example: "Senior management position", description: "Job group description" },
    { name: "isActive", type: "boolean", required: false, example: "true", description: "Active status (true/false)" }
  ],
  products: [
    { name: "organizationId", type: "string", required: false, example: "org_123", description: "Organization ID for multi-tenant isolation" },
    { name: "name", type: "string", required: true, example: "Laptop Pro", description: "Product name" },
    { name: "description", type: "string", required: false, example: "High-performance laptop", description: "Product description" },
    { name: "sku", type: "string", required: false, example: "PROD001", description: "Product SKU" },
    { name: "category", type: "string", required: false, example: "Electronics", description: "Product category" },
    { name: "unitPrice", type: "number", required: true, example: "150000", description: "Unit price" },
    { name: "costPrice", type: "number", required: false, example: "120000", description: "Cost price" },
    { name: "stockQuantity", type: "number", required: false, example: "50", description: "Current stock quantity" },
    { name: "minStockLevel", type: "number", required: false, example: "10", description: "Minimum stock threshold" },
    { name: "unit", type: "string", required: false, example: "pcs", description: "Unit of measurement" },
    { name: "taxRate", type: "number", required: false, example: "16", description: "Tax rate percentage" },
    { name: "isActive", type: "boolean", required: false, example: "true", description: "Active product status" },
    { name: "imageUrl", type: "string", required: false, example: "https://...", description: "Product image URL" },
    { name: "createdBy", type: "string", required: false, example: "user_123", description: "Creator user ID" },
    { name: "supplier", type: "string", required: false, example: "Tech Supplies Inc", description: "Supplier name" },
    { name: "reorderLevel", type: "number", required: false, example: "10", description: "Reorder threshold" },
    { name: "reorderQuantity", type: "number", required: false, example: "25", description: "Reorder quantity" },
    { name: "lastRestockDate", type: "date", required: false, example: "2024-03-01", description: "Last restock date" },
    { name: "maxStockLevel", type: "number", required: false, example: "200", description: "Maximum stock level" },
    { name: "location", type: "string", required: false, example: "Warehouse A", description: "Storage location" }
  ],
  services: [
    { name: "organizationId", type: "string", required: false, example: "org_123", description: "Organization ID for multi-tenant isolation" },
    { name: "name", type: "string", required: true, example: "Web Development", description: "Service name" },
    { name: "description", type: "string", required: false, example: "Custom web application development", description: "Service description" },
    { name: "category", type: "string", required: false, example: "IT Services", description: "Service category" },
    { name: "hourlyRate", type: "number", required: false, example: "5000", description: "Hourly rate" },
    { name: "fixedPrice", type: "number", required: false, example: "25000", description: "Fixed price" },
    { name: "unit", type: "string", required: false, example: "hour", description: "Unit of measurement" },
    { name: "taxRate", type: "number", required: false, example: "16", description: "Tax rate percentage" },
    { name: "deliverables", type: "string", required: false, example: "Landing page design", description: "Service deliverables" },
    { name: "isActive", type: "boolean", required: false, example: "true", description: "Service active status" },
    { name: "createdBy", type: "string", required: false, example: "user_123", description: "Creator user ID" }
  ],
  payments: [
    { name: "organizationId", type: "string", required: false, example: "org_123", description: "Organization ID for multi-tenant isolation" },
    { name: "invoiceId", type: "string", required: true, example: "inv_123", description: "Invoice ID associated with payment" },
    { name: "clientId", type: "string", required: true, example: "client_123", description: "Client ID associated with payment" },
    { name: "accountId", type: "string", required: false, example: "acct_123", description: "Bank account or chart account ID" },
    { name: "amount", type: "number", required: true, example: "50000", description: "Payment amount in minor units" },
    { name: "paymentDate", type: "date", required: true, example: "2024-03-01", description: "Payment date (YYYY-MM-DD)" },
    { name: "paymentMethod", type: "enum", required: true, example: "bank_transfer", enum: ["cash", "bank_transfer", "cheque", "mpesa", "card", "other"], description: "Payment method" },
    { name: "referenceNumber", type: "string", required: false, example: "REF123456", description: "Reference or receipt number" },
    { name: "chartOfAccountType", type: "enum", required: false, example: "debit", enum: ["debit", "credit"], description: "Account type for accounting entry" },
    { name: "chartOfAccountId", type: "number", required: false, example: "101", description: "Chart of account numeric ID" },
    { name: "notes", type: "string", required: false, example: "Invoice payment received", description: "Payment notes" },
    { name: "status", type: "enum", required: false, example: "completed", enum: ["pending", "completed", "failed", "cancelled"], description: "Payment status" },
    { name: "approvedBy", type: "string", required: false, example: "user_123", description: "Approver user ID" },
    { name: "approvedAt", type: "date", required: false, example: "2024-03-02", description: "Approval timestamp" },
    { name: "createdBy", type: "string", required: false, example: "user_123", description: "Creator user ID" }
  ],
  accounts: [
    { name: "organizationId", type: "string", required: false, example: "org_123", description: "Organization ID for multi-tenant isolation" },
    { name: "accountCode", type: "string", required: true, example: "1000", description: "Unique account code/number" },
    { name: "accountName", type: "string", required: true, example: "Cash in Hand", description: "Account name" },
    { name: "accountType", type: "enum", required: true, example: "asset", enum: ["asset", "liability", "equity", "revenue", "expense", "cost of goods sold", "operating expense", "capital expenditure", "other income", "other expense"], description: "Account classification type" },
    { name: "parentAccountId", type: "string", required: false, example: "100", description: "Parent account ID for hierarchical structure" },
    { name: "balance", type: "number", required: false, example: "0", description: "Current account balance in minor units" },
    { name: "isActive", type: "boolean", required: false, example: "true", description: "Whether the account is active" },
    { name: "description", type: "string", required: false, example: "Cash held in office", description: "Account description and notes" },
    { name: "createdAt", type: "date", required: false, example: "2024-03-01", description: "Creation timestamp" },
    { name: "updatedAt", type: "date", required: false, example: "2024-03-02", description: "Last update timestamp" }
  ],
  bankAccounts: [
    { name: "accountName", type: "string", required: true, example: "Main Operating Account", description: "Bank account name" },
    { name: "bankName", type: "string", required: true, example: "Kenya Commercial Bank", description: "Bank name" },
    { name: "accountNumber", type: "string", required: true, example: "1234567890", description: "Bank account number" },
    { name: "currency", type: "string", required: false, example: "KES", description: "Currency code (e.g., KES, USD)" },
    { name: "balance", type: "number", required: false, example: "500000", description: "Current account balance" },
    { name: "isActive", type: "boolean", required: false, example: "true", description: "Account active status" }
  ],
  expenses: [
    { name: "organizationId", type: "string", required: false, example: "org_123", description: "Organization ID for multi-tenant isolation" },
    { name: "expenseNumber", type: "string", required: false, example: "EXP-2024-001", description: "Expense reference number" },
    { name: "category", type: "string", required: true, example: "Office Supplies", description: "Expense category" },
    { name: "vendor", type: "string", required: false, example: "Office Depot", description: "Vendor or supplier name" },
    { name: "amount", type: "number", required: true, example: "15000", description: "Expense amount in minor units" },
    { name: "expenseDate", type: "date", required: true, example: "2024-03-01", description: "Expense date (YYYY-MM-DD)" },
    { name: "paymentMethod", type: "enum", required: false, example: "cash", enum: ["cash", "bank_transfer", "cheque", "card", "other"], description: "Payment method used" },
    { name: "receiptUrl", type: "string", required: false, example: "https://...", description: "Receipt or document URL" },
    { name: "description", type: "string", required: false, example: "Office supplies purchase", description: "Expense description" },
    { name: "accountId", type: "string", required: false, example: "acct_123", description: "Related chart of accounts ID" },
    { name: "budgetAllocationId", type: "string", required: false, example: "budget_123", description: "Related budget allocation ID" },
    { name: "status", type: "enum", required: false, example: "pending", enum: ["pending", "approved", "rejected", "paid"], description: "Expense approval status" },
    { name: "createdBy", type: "string", required: false, example: "user_123", description: "Creator user ID" },
    { name: "approvedBy", type: "string", required: false, example: "user_123", description: "Approver user ID" },
    { name: "approvedAt", type: "date", required: false, example: "2024-03-02", description: "Approval date" },
    { name: "chartOfAccountId", type: "number", required: false, example: "101", description: "Chart of account numeric ID" }
  ],
  invoices: [
    { name: "organizationId", type: "string", required: false, example: "org_123", description: "Organization ID for multi-tenant isolation" },
    { name: "invoiceNumber", type: "string", required: true, example: "INV-2024-001", description: "Invoice number" },
    { name: "clientId", type: "string", required: true, example: "client_123", description: "Client ID" },
    { name: "estimateId", type: "string", required: false, example: "estimate_123", description: "Related estimate ID" },
    { name: "title", type: "string", required: false, example: "Website redesign", description: "Invoice title" },
    { name: "status", type: "enum", required: false, example: "draft", enum: ["draft", "sent", "paid", "partial", "overdue", "cancelled"], description: "Invoice status" },
    { name: "issueDate", type: "date", required: true, example: "2024-03-01", description: "Invoice issue date" },
    { name: "dueDate", type: "date", required: true, example: "2024-04-01", description: "Invoice due date" },
    { name: "subtotal", type: "number", required: true, example: "50000", description: "Subtotal before tax" },
    { name: "taxAmount", type: "number", required: false, example: "8000", description: "Tax amount" },
    { name: "discountAmount", type: "number", required: false, example: "5000", description: "Discount amount" },
    { name: "total", type: "number", required: true, example: "53000", description: "Invoice total" },
    { name: "paidAmount", type: "number", required: false, example: "30000", description: "Amount already paid" },
    { name: "notes", type: "string", required: false, example: "Payment terms: Net 30", description: "Invoice notes" },
    { name: "terms", type: "string", required: false, example: "Payment due within 30 days", description: "Invoice terms" },
    { name: "createdBy", type: "string", required: false, example: "user_123", description: "Creator user ID" },
    { name: "paymentPlanId", type: "string", required: false, example: "plan_123", description: "Payment plan ID" },
    { name: "isAutoRecurring", type: "boolean", required: false, example: "false", description: "Auto-recurring invoice flag" },
    { name: "recurringInvoiceId", type: "string", required: false, example: "recurring_123", description: "Recurring invoice ID" },
    { name: "clientSubscriptionId", type: "string", required: false, example: "subscription_123", description: "Client subscription ID" },
    { name: "accountManagerId", type: "string", required: false, example: "manager_123", description: "Account manager ID" }
  ],
  users: [
    { name: "name", type: "string", required: true, example: "John Doe", description: "User full name" },
    { name: "email", type: "email", required: true, example: "user@example.com", description: "User email address" },
    { name: "emailVerified", type: "date", required: false, example: "2024-03-01", description: "Email verification timestamp" },
    { name: "loginMethod", type: "string", required: false, example: "local", description: "Login method" },
    { name: "passwordHash", type: "string", required: false, example: "$2b$10$...", description: "Password hash" },
    { name: "role", type: "enum", required: false, example: "user", enum: ["user", "admin", "staff", "accountant", "client", "super_admin", "project_manager", "hr", "ict_manager", "procurement_manager", "sales_manager"], description: "User role" },
    { name: "department", type: "string", required: false, example: "Sales", description: "Department name" },
    { name: "isActive", type: "boolean", required: false, example: "true", description: "User active status" },
    { name: "clientId", type: "string", required: false, example: "client_123", description: "Associated client ID" },
    { name: "permissions", type: "string", required: false, example: '["finance:read"]', description: "JSON permission list" },
    { name: "phone", type: "string", required: false, example: "+254712345678", description: "Phone number" },
    { name: "company", type: "string", required: false, example: "ABC Corporation", description: "Company name" },
    { name: "position", type: "string", required: false, example: "Manager", description: "Job title" },
    { name: "address", type: "string", required: false, example: "123 Main Street", description: "Address" },
    { name: "city", type: "string", required: false, example: "Nairobi", description: "City" },
    { name: "country", type: "string", required: false, example: "Kenya", description: "Country" },
    { name: "photoUrl", type: "string", required: false, example: "https://...", description: "Photo URL" },
    { name: "organizationId", type: "string", required: false, example: "org_123", description: "Organization ID" }
  ]
};
function generateCSVTemplate(module) {
  const columns = moduleTemplates[module];
  if (!columns) {
    throw new Error(`Unknown module: ${module}`);
  }
  const headers = columns.map((col) => {
    const required = col.required ? "*" : "";
    const type = ` [${col.type}]`;
    return `${col.name}${required}${type}`;
  });
  const descriptions = columns.map((col) => col.description || "");
  const lines = [
    "# Import Template for " + module,
    "# Fields marked with * are required",
    "# Column descriptions: " + descriptions.map(
      (description, index6) => `${columns[index6].name}=${description || columns[index6].type}`
    ).join(" | "),
    headers.join(",")
  ];
  return lines.join("\n");
}
function parseCSV(csvContent) {
  const lines = csvContent.split(/\r?\n/).filter((line) => !line.trimStart().startsWith("#") && line.trim());
  if (lines.length < 2) {
    throw new Error("CSV file must have headers and at least one data row");
  }
  const headers = parseCSVLine(lines[0]).map((h) => {
    const normalized = h.replace(/\[.*?\]/g, "").replace(/\*/g, "").trim();
    return legacyColumnAliases[normalized] ?? normalized;
  });
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row = {};
    headers.forEach((header, idx) => {
      let value = values[idx] || "";
      if (value === "" || value === "null" || value === "undefined") {
        row[header] = null;
      } else if (value === "true") {
        row[header] = true;
      } else if (value === "false") {
        row[header] = false;
      } else if (!isNaN(Number(value)) && value !== "") {
        row[header] = Number(value);
      } else {
        row[header] = value;
      }
    });
    rows.push(row);
  }
  return rows;
}
function parseCSVLine(line) {
  const values = [];
  let value = "";
  let quoted = false;
  for (let index6 = 0; index6 < line.length; index6++) {
    const char = line[index6];
    const next = line[index6 + 1];
    if (char === '"' && quoted && next === '"') {
      value += '"';
      index6++;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      values.push(value.trim());
      value = "";
    } else {
      value += char;
    }
  }
  values.push(value.trim());
  return values;
}
var legacyColumnAliases = {
  company_name: "companyName",
  company: "companyName",
  client_name: "companyName",
  client_status: "status",
  organization_id: "organizationId",
  secondary_phone: "secondaryPhone",
  assigned_to: "assignedTo",
  created_by: "createdBy",
  payment_terms: "paymentTerms",
  number_of_employees: "numberOfEmployees",
  year_established: "yearEstablished",
  business_license: "businessLicense",
  lead_source: "leadSource",
  marital_status: "maritalStatus",
  probation_end_date: "probationEndDate",
  contract_end_date: "contractEndDate",
  emergency_contact_name: "emergencyContactName",
  emergency_contact_relationship: "emergencyContactRelationship",
  emergency_contact_phone: "emergencyContactPhone",
  bank_name: "bankName",
  bank_branch: "bankBranch",
  bank_account_number: "bankAccountNumber",
  nhif_number: "nhifNumber",
  nssf_number: "nssfNumber",
  national_id: "nationalId",
  photo_url: "photoUrl",
  head_id: "headId",
  salary_range_min: "salaryRangeMin",
  salary_range_max: "salaryRangeMax",
  default_role: "defaultRole",
  minimum_gross_salary: "minimumGrossSalary",
  maximum_gross_salary: "maximumGrossSalary",
  is_active: "isActive",
  cost_price: "costPrice",
  stock_quantity: "stockQuantity",
  min_stock_level: "minStockLevel",
  tax_rate: "taxRate",
  image_url: "imageUrl",
  reorder_level: "reorderLevel",
  reorder_quantity: "reorderQuantity",
  last_restock_date: "lastRestockDate",
  max_stock_level: "maxStockLevel",
  payment_date: "paymentDate",
  payment_method: "paymentMethod",
  reference_number: "referenceNumber",
  chart_of_account_type: "chartOfAccountType",
  chart_of_account_id: "chartOfAccountId",
  account_id: "accountId",
  budget_allocation_id: "budgetAllocationId",
  expense_number: "expenseNumber",
  expense_date: "expenseDate",
  receipt_url: "receiptUrl",
  approved_by: "approvedBy",
  approved_at: "approvedAt",
  invoice_number: "invoiceNumber",
  issue_date: "issueDate",
  due_date: "dueDate",
  tax_amount: "taxAmount",
  discount_amount: "discountAmount",
  paid_amount: "paidAmount",
  payment_plan_id: "paymentPlanId",
  is_auto_recurring: "isAutoRecurring",
  recurring_invoice_id: "recurringInvoiceId",
  client_subscription_id: "clientSubscriptionId",
  email_verified: "emailVerified",
  login_method: "loginMethod",
  password_hash: "passwordHash",
  custom_role_id: "customRoleId",
  parent_account_code: "parentAccountCode",
  parent_account_id: "parentAccountId",
  account_code: "accountCode",
  account_name: "accountName",
  account_type: "accountType",
  is_header_account: "isHeaderAccount",
  productName: "name"
};
function getAvailableModules() {
  return [
    { id: "clients", name: "Clients", description: "Import client information" },
    { id: "employees", name: "Employees", description: "Import employee records" },
    { id: "departments", name: "Departments", description: "Import department data" },
    { id: "jobGroups", name: "Job Groups", description: "Import job classifications" },
    { id: "products", name: "Products", description: "Import product inventory" },
    { id: "services", name: "Services", description: "Import service offerings" },
    { id: "payments", name: "Payments", description: "Import payment records" },
    { id: "accounts", name: "Chart of Accounts", description: "Import account structure" },
    { id: "bankAccounts", name: "Bank Accounts", description: "Import bank account information" },
    { id: "expenses", name: "Expenses", description: "Import expense records" },
    { id: "invoices", name: "Invoices", description: "Import invoice records" },
    { id: "users", name: "Users", description: "Import user accounts" }
  ];
}

// server/routers/csvImportExport.ts
init_db();

// server/data/tableRegistry.ts
init_schema();
init_schema_extended();
import { getTableColumns, getTableName } from "drizzle-orm";

// drizzle/schema_extended_phase20.ts
var schema_extended_phase20_exports = {};
__export(schema_extended_phase20_exports, {
  automatedReceipts: () => automatedReceipts2,
  conversationMembers: () => conversationMembers2,
  conversations: () => conversations2,
  emailCampaigns: () => emailCampaigns2,
  emailLogs: () => emailLogs2,
  messageReadReceipts: () => messageReadReceipts2,
  messages: () => messages2,
  notificationBroadcasts: () => notificationBroadcasts2,
  notificationTemplates: () => notificationTemplates2,
  notifications: () => notifications2,
  recurringInvoiceTemplates: () => recurringInvoiceTemplates2,
  ticketResponses: () => ticketResponses2,
  tickets: () => tickets3,
  userDeletions: () => userDeletions2
});
import { mysqlTable as mysqlTable4, index as index4, varchar as varchar4, mysqlEnum as mysqlEnum3, int as int4, text as text4, longtext as longtext2, timestamp as timestamp4, tinyint as tinyint2, json as json4, datetime as datetime3, decimal as decimal3 } from "drizzle-orm/mysql-core";
var userDeletions2 = mysqlTable4("userDeletions", {
  id: varchar4({ length: 64 }).primaryKey(),
  userId: varchar4({ length: 64 }).notNull(),
  userName: varchar4({ length: 255 }).notNull(),
  userEmail: varchar4({ length: 320 }).notNull(),
  deletedReason: text4(),
  deletedBy: varchar4({ length: 64 }).notNull(),
  deletedAt: timestamp4({ mode: "string" }).defaultNow(),
  restoredAt: timestamp4({ mode: "string" }),
  restoredBy: varchar4({ length: 64 }),
  archived: tinyint2().default(1).notNull()
  // 1 = soft deleted, 0 = active
}, (table) => [
  index4("idx_user_id").on(table.userId),
  index4("idx_deleted_by").on(table.deletedBy),
  index4("idx_deleted_at").on(table.deletedAt),
  index4("idx_archived").on(table.archived)
]);
var notificationTemplates2 = mysqlTable4("notificationTemplates", {
  id: varchar4({ length: 64 }).primaryKey(),
  templateKey: varchar4({ length: 100 }).notNull().unique(),
  templateName: varchar4({ length: 255 }).notNull(),
  category: mysqlEnum3(["billing", "system", "user", "document", "communication", "security"]).notNull(),
  subject: varchar4({ length: 500 }),
  bodyTemplate: longtext2().notNull(),
  channels: json4(),
  // ['email', 'in_app', 'sms']
  variables: json4(),
  // List of template variables
  isActive: tinyint2().default(1).notNull(),
  createdAt: timestamp4({ mode: "string" }).defaultNow(),
  updatedAt: timestamp4({ mode: "string" }).defaultNow().onUpdateNow()
}, (table) => [
  index4("idx_template_key").on(table.templateKey),
  index4("idx_category").on(table.category)
]);
var notifications2 = mysqlTable4("notifications", {
  id: varchar4({ length: 64 }).primaryKey(),
  recipientId: varchar4({ length: 64 }).notNull(),
  templateId: varchar4({ length: 64 }).notNull(),
  category: mysqlEnum3(["billing", "system", "user", "document", "communication", "security"]).notNull(),
  subject: varchar4({ length: 500 }).notNull(),
  body: longtext2().notNull(),
  actionUrl: varchar4({ length: 500 }),
  priority: mysqlEnum3(["low", "normal", "high", "critical"]).default("normal").notNull(),
  channels: json4(),
  // ['email', 'in_app', 'sms']
  status: mysqlEnum3(["draft", "queued", "sent", "failed", "archived"]).default("draft").notNull(),
  sentAt: timestamp4({ mode: "string" }),
  readAt: timestamp4({ mode: "string" }),
  failureReason: text4(),
  metadata: json4(),
  createdBy: varchar4({ length: 64 }),
  createdAt: timestamp4({ mode: "string" }).defaultNow()
}, (table) => [
  index4("idx_recipient_id").on(table.recipientId),
  index4("idx_category").on(table.category),
  index4("idx_status").on(table.status),
  index4("idx_created_at").on(table.createdAt)
]);
var notificationBroadcasts2 = mysqlTable4("notificationBroadcasts", {
  id: varchar4({ length: 64 }).primaryKey(),
  title: varchar4({ length: 500 }).notNull(),
  content: longtext2().notNull(),
  target: mysqlEnum3(["all_users", "specific_role", "specific_department", "specific_plan", "custom"]).notNull(),
  targetValue: varchar4({ length: 255 }),
  // role name, department id, plan id, or custom filter
  priority: mysqlEnum3(["low", "normal", "high", "critical"]).default("normal").notNull(),
  channels: json4(),
  // ['email', 'in_app', 'sms']
  status: mysqlEnum3(["draft", "scheduled", "sending", "sent", "cancelled"]).default("draft").notNull(),
  scheduledFor: timestamp4({ mode: "string" }),
  startedAt: timestamp4({ mode: "string" }),
  completedAt: timestamp4({ mode: "string" }),
  recipientCount: int4().default(0),
  sentCount: int4().default(0),
  failedCount: int4().default(0),
  createdBy: varchar4({ length: 64 }).notNull(),
  createdAt: timestamp4({ mode: "string" }).defaultNow(),
  updatedAt: timestamp4({ mode: "string" }).defaultNow().onUpdateNow()
}, (table) => [
  index4("idx_status").on(table.status),
  index4("idx_target").on(table.target),
  index4("idx_scheduled_for").on(table.scheduledFor)
]);
var messages2 = mysqlTable4("messages", {
  id: varchar4({ length: 64 }).primaryKey(),
  conversationId: varchar4({ length: 64 }).notNull(),
  senderId: varchar4({ length: 64 }).notNull(),
  messageType: mysqlEnum3(["text", "image", "file", "system"]).default("text").notNull(),
  content: longtext2().notNull(),
  fileUrl: varchar4({ length: 500 }),
  fileName: varchar4({ length: 255 }),
  fileSize: int4(),
  mimeType: varchar4({ length: 100 }),
  isEdited: tinyint2().default(0),
  editedAt: timestamp4({ mode: "string" }),
  isDeleted: tinyint2().default(0),
  deletedAt: timestamp4({ mode: "string" }),
  reactions: json4(),
  // { emoji: count }
  encryptionIv: varchar4({ length: 255 }),
  // For message encryption
  encryptionTag: varchar4({ length: 255 }),
  createdAt: timestamp4({ mode: "string" }).defaultNow()
}, (table) => [
  index4("idx_conversation_id").on(table.conversationId),
  index4("idx_sender_id").on(table.senderId),
  index4("idx_created_at").on(table.createdAt)
]);
var conversations2 = mysqlTable4("conversations", {
  id: varchar4({ length: 64 }).primaryKey(),
  type: mysqlEnum3(["direct", "group", "channel"]).default("direct").notNull(),
  name: varchar4({ length: 255 }),
  description: text4(),
  conversationIcon: varchar4({ length: 500 }),
  createdBy: varchar4({ length: 64 }).notNull(),
  isArchived: tinyint2().default(0),
  archivedAt: timestamp4({ mode: "string" }),
  isEncrypted: tinyint2().default(1).notNull(),
  // 1 = encrypted, 0 = plain
  encryptionKey: varchar4({ length: 255 }),
  // Stored encrypted
  lastMessageAt: timestamp4({ mode: "string" }),
  createdAt: timestamp4({ mode: "string" }).defaultNow(),
  updatedAt: timestamp4({ mode: "string" }).defaultNow().onUpdateNow()
}, (table) => [
  index4("idx_type").on(table.type),
  index4("idx_created_by").on(table.createdBy),
  index4("idx_archived").on(table.isArchived)
]);
var conversationMembers2 = mysqlTable4("conversationMembers", {
  id: varchar4({ length: 64 }).primaryKey(),
  conversationId: varchar4({ length: 64 }).notNull(),
  userId: varchar4({ length: 64 }).notNull(),
  role: mysqlEnum3(["member", "moderator", "admin"]).default("member").notNull(),
  joinedAt: timestamp4({ mode: "string" }).defaultNow(),
  leftAt: timestamp4({ mode: "string" }),
  lastReadAt: timestamp4({ mode: "string" }),
  unreadCount: int4().default(0),
  isMuted: tinyint2().default(0),
  isActive: tinyint2().default(1).notNull()
}, (table) => [
  index4("idx_conversation_id").on(table.conversationId),
  index4("idx_user_id").on(table.userId)
]);
var messageReadReceipts2 = mysqlTable4("messageReadReceipts", {
  id: varchar4({ length: 64 }).primaryKey(),
  messageId: varchar4({ length: 64 }).notNull(),
  userId: varchar4({ length: 64 }).notNull(),
  readAt: timestamp4({ mode: "string" }).defaultNow()
}, (table) => [
  index4("idx_message_id").on(table.messageId),
  index4("idx_user_id").on(table.userId)
]);
var tickets3 = mysqlTable4("tickets", {
  id: varchar4({ length: 64 }).primaryKey(),
  ticketNumber: varchar4({ length: 50 }).notNull().unique(),
  title: varchar4({ length: 500 }).notNull(),
  description: longtext2().notNull(),
  category: mysqlEnum3(["support", "billing", "feature_request", "bug", "security", "general"]).notNull(),
  priority: mysqlEnum3(["low", "normal", "high", "urgent"]).default("normal").notNull(),
  status: mysqlEnum3(["open", "in_progress", "on_hold", "resolved", "closed", "reopened"]).default("open").notNull(),
  createdBy: varchar4({ length: 64 }).notNull(),
  assignedTo: varchar4({ length: 64 }),
  department: varchar4({ length: 100 }),
  resolution: text4(),
  solutionUrl: varchar4({ length: 500 }),
  attachments: json4(),
  // Array of file URLs
  relatedTickets: json4(),
  // Array of ticket IDs
  firstResponseAt: timestamp4({ mode: "string" }),
  resolvedAt: timestamp4({ mode: "string" }),
  closedAt: timestamp4({ mode: "string" }),
  createdAt: timestamp4({ mode: "string" }).defaultNow(),
  updatedAt: timestamp4({ mode: "string" }).defaultNow().onUpdateNow()
}, (table) => [
  index4("idx_ticket_number").on(table.ticketNumber),
  index4("idx_status").on(table.status),
  index4("idx_created_by").on(table.createdBy),
  index4("idx_assigned_to").on(table.assignedTo),
  index4("idx_priority").on(table.priority)
]);
var ticketResponses2 = mysqlTable4("ticketResponses", {
  id: varchar4({ length: 64 }).primaryKey(),
  ticketId: varchar4({ length: 64 }).notNull(),
  responderId: varchar4({ length: 64 }).notNull(),
  responseType: mysqlEnum3(["comment", "resolution", "escalation"]).default("comment").notNull(),
  content: longtext2().notNull(),
  attachments: json4(),
  // Array of file URLs
  isInternal: tinyint2().default(0),
  // 1 = only visible to staff
  createdAt: timestamp4({ mode: "string" }).defaultNow(),
  updatedAt: timestamp4({ mode: "string" }).defaultNow().onUpdateNow()
}, (table) => [
  index4("idx_ticket_id").on(table.ticketId),
  index4("idx_responder_id").on(table.responderId)
]);
var recurringInvoiceTemplates2 = mysqlTable4("recurringInvoiceTemplates", {
  id: varchar4({ length: 64 }).primaryKey(),
  clientId: varchar4({ length: 64 }).notNull(),
  invoiceName: varchar4({ length: 255 }).notNull(),
  description: text4(),
  frequency: mysqlEnum3(["daily", "weekly", "biweekly", "monthly", "quarterly", "semi_annual", "annual"]).notNull(),
  startDate: datetime3({ mode: "string" }).notNull(),
  endDate: datetime3({ mode: "string" }),
  nextInvoiceDate: datetime3({ mode: "string" }).notNull(),
  items: json4(),
  // Array of line items with description, quantity, rate
  taxRate: decimal3({ precision: 5, scale: 2 }).default("0"),
  discount: decimal3({ precision: 5, scale: 2 }).default("0"),
  discountType: mysqlEnum3(["percentage", "fixed"]).default("percentage"),
  notes: text4(),
  paymentTerms: int4(),
  // days to payment due
  autoSend: tinyint2().default(1).notNull(),
  autoCreateReceipt: tinyint2().default(1).notNull(),
  isActive: tinyint2().default(1).notNull(),
  createdBy: varchar4({ length: 64 }).notNull(),
  createdAt: timestamp4({ mode: "string" }).defaultNow(),
  updatedAt: timestamp4({ mode: "string" }).defaultNow().onUpdateNow()
}, (table) => [
  index4("idx_client_id").on(table.clientId),
  index4("idx_next_invoice_date").on(table.nextInvoiceDate),
  index4("idx_is_active").on(table.isActive)
]);
var automatedReceipts2 = mysqlTable4("automatedReceipts", {
  id: varchar4({ length: 64 }).primaryKey(),
  invoiceId: varchar4({ length: 64 }).notNull(),
  receiptNumber: varchar4({ length: 50 }).notNull().unique(),
  amountReceived: decimal3({ precision: 10, scale: 2 }).notNull(),
  amountOutstanding: decimal3({ precision: 10, scale: 2 }).default("0"),
  paymentStatus: mysqlEnum3(["partial", "full"]).notNull(),
  paymentMethod: varchar4({ length: 50 }),
  paymentReference: varchar4({ length: 255 }),
  autoGenerated: tinyint2().default(1).notNull(),
  createdAt: timestamp4({ mode: "string" }).defaultNow()
}, (table) => [
  index4("idx_invoice_id").on(table.invoiceId),
  index4("idx_receipt_number").on(table.receiptNumber)
]);
var emailCampaigns2 = mysqlTable4("emailCampaigns", {
  id: varchar4({ length: 64 }).primaryKey(),
  campaignName: varchar4({ length: 255 }).notNull(),
  subject: varchar4({ length: 500 }).notNull(),
  bodyHtml: longtext2().notNull(),
  bodyText: longtext2(),
  fromEmail: varchar4({ length: 320 }).notNull(),
  fromName: varchar4({ length: 255 }),
  recipientCount: int4().default(0),
  sentCount: int4().default(0),
  openCount: int4().default(0),
  clickCount: int4().default(0),
  failureCount: int4().default(0),
  status: mysqlEnum3(["draft", "scheduled", "sending", "sent", "failed", "paused"]).default("draft").notNull(),
  scheduledFor: timestamp4({ mode: "string" }),
  startedAt: timestamp4({ mode: "string" }),
  completedAt: timestamp4({ mode: "string" }),
  createdBy: varchar4({ length: 64 }).notNull(),
  createdAt: timestamp4({ mode: "string" }).defaultNow()
}, (table) => [
  index4("idx_status").on(table.status),
  index4("idx_created_by").on(table.createdBy)
]);
var emailLogs2 = mysqlTable4("emailLogs", {
  id: varchar4({ length: 64 }).primaryKey(),
  campaignId: varchar4({ length: 64 }),
  recipientEmail: varchar4({ length: 320 }).notNull(),
  userId: varchar4({ length: 64 }),
  subject: varchar4({ length: 500 }).notNull(),
  status: mysqlEnum3(["pending", "sent", "bounced", "failed", "opened", "clicked"]).default("pending").notNull(),
  provider: varchar4({ length: 50 }),
  // smtp, sendgrid, mailgun, ses, etc.
  providerMessageId: varchar4({ length: 255 }),
  sentAt: timestamp4({ mode: "string" }),
  failureReason: text4(),
  openedAt: timestamp4({ mode: "string" }),
  clickedAt: timestamp4({ mode: "string" }),
  metadata: json4(),
  createdAt: timestamp4({ mode: "string" }).defaultNow()
}, (table) => [
  index4("idx_campaign_id").on(table.campaignId),
  index4("idx_recipient_email").on(table.recipientEmail),
  index4("idx_status").on(table.status)
]);

// drizzle/schema_pricing.ts
var schema_pricing_exports = {};
__export(schema_pricing_exports, {
  billingInvoices: () => billingInvoices2,
  billingNotifications: () => billingNotifications2,
  billingUsageMetrics: () => billingUsageMetrics2,
  paymentMethods: () => paymentMethods2,
  payments: () => payments2,
  pricingPlans: () => pricingPlans2,
  subscriptions: () => subscriptions2
});
import { mysqlTable as mysqlTable5, varchar as varchar5, longtext as longtext3, mysqlEnum as mysqlEnum4, decimal as decimal4, int as int5, timestamp as timestamp5, json as json5, index as index5, text as text5, datetime as datetime4, tinyint as tinyint3 } from "drizzle-orm/mysql-core";
var pricingPlans2 = mysqlTable5("pricingPlans", {
  id: varchar5({ length: 64 }).primaryKey(),
  planName: varchar5({ length: 255 }).notNull(),
  planSlug: varchar5({ length: 100 }).notNull().unique(),
  description: longtext3(),
  tier: mysqlEnum4(["free", "starter", "gold", "professional", "enterprise", "custom"]).notNull(),
  monthlyPrice: decimal4({ precision: 10, scale: 2 }).default("0"),
  annualPrice: decimal4({ precision: 10, scale: 2 }).default("0"),
  monthlyAnnualDiscount: decimal4({ precision: 5, scale: 2 }).default("0"),
  maxUsers: int5().default(-1),
  maxProjects: int5().default(-1),
  maxStorageGB: int5().default(-1),
  features: json5(),
  supportLevel: mysqlEnum4(["email", "priority", "24/7_phone", "dedicated_manager"]).default("email"),
  isActive: tinyint3().default(1).notNull(),
  displayOrder: int5().default(0),
  createdAt: timestamp5({ mode: "string" }).defaultNow(),
  updatedAt: timestamp5({ mode: "string" }).defaultNow().onUpdateNow()
}, (table) => [
  index5("idx_tier").on(table.tier),
  index5("idx_slug").on(table.planSlug),
  index5("idx_active").on(table.isActive)
]);
var subscriptions2 = mysqlTable5("subscriptions", {
  id: varchar5({ length: 64 }).primaryKey(),
  clientId: varchar5({ length: 64 }).notNull(),
  planId: varchar5({ length: 64 }).notNull(),
  status: mysqlEnum4(["trial", "active", "suspended", "cancelled", "expired"]).default("trial").notNull(),
  billingCycle: mysqlEnum4(["monthly", "annual"]).default("monthly").notNull(),
  startDate: timestamp5({ mode: "string" }).notNull(),
  renewalDate: timestamp5({ mode: "string" }).notNull(),
  expiryDate: timestamp5({ mode: "string" }),
  gracePeriodEnd: timestamp5({ mode: "string" }),
  isLocked: tinyint3().default(0),
  autoRenew: tinyint3().default(1),
  currentPrice: decimal4({ precision: 10, scale: 2 }).default("0"),
  usersCount: int5().default(0),
  projectsCount: int5().default(0),
  storageUsedGB: int5().default(0),
  createdAt: timestamp5({ mode: "string" }).defaultNow(),
  updatedAt: timestamp5({ mode: "string" }).defaultNow().onUpdateNow()
}, (table) => [
  index5("idx_client_id").on(table.clientId),
  index5("idx_status").on(table.status),
  index5("idx_renewal_date").on(table.renewalDate),
  index5("idx_expiry_date").on(table.expiryDate)
]);
var billingInvoices2 = mysqlTable5("billingInvoices", {
  id: varchar5({ length: 64 }).primaryKey(),
  subscriptionId: varchar5({ length: 64 }).notNull(),
  invoiceNumber: varchar5({ length: 50 }).notNull().unique(),
  amount: decimal4({ precision: 10, scale: 2 }).notNull(),
  tax: decimal4({ precision: 10, scale: 2 }).default("0"),
  totalAmount: decimal4({ precision: 10, scale: 2 }).notNull(),
  currency: varchar5({ length: 3 }).default("USD"),
  status: mysqlEnum4(["pending", "sent", "viewed", "paid", "failed", "cancelled", "refunded"]).default("pending").notNull(),
  billingPeriodStart: timestamp5({ mode: "string" }).notNull(),
  billingPeriodEnd: timestamp5({ mode: "string" }).notNull(),
  dueDate: timestamp5({ mode: "string" }).notNull(),
  sentAt: timestamp5({ mode: "string" }),
  paidAt: timestamp5({ mode: "string" }),
  paymentMethod: varchar5({ length: 50 }),
  paymentReference: varchar5({ length: 255 }),
  notes: text5(),
  createdAt: timestamp5({ mode: "string" }).defaultNow(),
  updatedAt: timestamp5({ mode: "string" }).defaultNow().onUpdateNow()
}, (table) => [
  index5("idx_subscription_id").on(table.subscriptionId),
  index5("idx_status").on(table.status),
  index5("idx_due_date").on(table.dueDate),
  index5("idx_paid_at").on(table.paidAt)
]);
var payments2 = mysqlTable5("payments", {
  id: varchar5({ length: 64 }).primaryKey(),
  invoiceId: varchar5({ length: 64 }),
  amount: decimal4({ precision: 10, scale: 2 }).notNull(),
  currency: varchar5({ length: 3 }).default("USD"),
  paymentMethod: mysqlEnum4(["credit_card", "debit_card", "bank_transfer", "paypal", "stripe", "mpesa", "other"]).notNull(),
  provider: varchar5({ length: 50 }),
  transactionId: varchar5({ length: 255 }).unique(),
  status: mysqlEnum4(["pending", "processing", "completed", "failed", "refunded"]).default("pending").notNull(),
  paymentDate: timestamp5({ mode: "string" }),
  refundedAmount: decimal4({ precision: 10, scale: 2 }).default("0"),
  refundDate: timestamp5({ mode: "string" }),
  refundReason: text5(),
  metadata: json5(),
  createdAt: timestamp5({ mode: "string" }).defaultNow(),
  updatedAt: timestamp5({ mode: "string" }).defaultNow().onUpdateNow()
}, (table) => [
  index5("idx_invoice_id").on(table.invoiceId),
  index5("idx_status").on(table.status),
  index5("idx_transaction_id").on(table.transactionId),
  index5("idx_payment_date").on(table.paymentDate)
]);
var paymentMethods2 = mysqlTable5("paymentMethods", {
  id: varchar5({ length: 64 }).primaryKey(),
  clientId: varchar5({ length: 64 }).notNull(),
  type: mysqlEnum4(["credit_card", "debit_card", "bank_account", "paypal", "mpesa"]).notNull(),
  provider: varchar5({ length: 50 }),
  lastFourDigits: varchar5({ length: 4 }),
  expiryMonth: int5(),
  expiryYear: int5(),
  holderName: varchar5({ length: 255 }),
  bankName: varchar5({ length: 255 }),
  accountNumber: varchar5({ length: 50 }),
  isDefault: tinyint3().default(0),
  isActive: tinyint3().default(1),
  providerMethodId: varchar5({ length: 255 }),
  createdAt: timestamp5({ mode: "string" }).defaultNow(),
  updatedAt: timestamp5({ mode: "string" }).defaultNow().onUpdateNow()
}, (table) => [
  index5("idx_client_id").on(table.clientId),
  index5("idx_is_default").on(table.isDefault),
  index5("idx_type").on(table.type)
]);
var billingUsageMetrics2 = mysqlTable5("billingUsageMetrics", {
  id: varchar5({ length: 64 }).primaryKey(),
  subscriptionId: varchar5({ length: 64 }).notNull(),
  metricDate: datetime4({ mode: "string" }).notNull(),
  usersCount: int5().default(0),
  projectsCount: int5().default(0),
  tasksCount: int5().default(0),
  documentsCount: int5().default(0),
  storageUsedMB: int5().default(0),
  apiCallsCount: int5().default(0),
  emailsSent: int5().default(0),
  recordedAt: timestamp5({ mode: "string" }).defaultNow()
}, (table) => [
  index5("idx_subscription_id").on(table.subscriptionId),
  index5("idx_metric_date").on(table.metricDate)
]);
var billingNotifications2 = mysqlTable5("billingNotifications", {
  id: varchar5({ length: 64 }).primaryKey(),
  subscriptionId: varchar5({ length: 64 }).notNull(),
  notificationType: mysqlEnum4([
    "payment_due_7days",
    "payment_due_today",
    "payment_overdue_1day",
    "payment_overdue_3days",
    "subscription_expiring_7days",
    "subscription_expiring_today",
    "subscription_expired",
    "system_locked",
    "payment_failed",
    "usage_limit_warning",
    "renewal_successful"
  ]).notNull(),
  message: text5(),
  sentTo: varchar5({ length: 320 }),
  channel: mysqlEnum4(["email", "in_app", "sms"]).default("email"),
  isSent: tinyint3().default(0),
  sentAt: timestamp5({ mode: "string" }),
  isRead: tinyint3().default(0),
  readAt: timestamp5({ mode: "string" }),
  createdAt: timestamp5({ mode: "string" }).defaultNow()
}, (table) => [
  index5("idx_subscription_id").on(table.subscriptionId),
  index5("idx_notification_type").on(table.notificationType),
  index5("idx_is_sent").on(table.isSent)
]);

// server/data/tableRegistry.ts
init_approvalSchema();
var schemaModules = [schema_exports, schema_extended_exports, schema_extended_phase20_exports, schema_pricing_exports, approvalSchema_exports];
var sensitiveColumnPattern = /(password|secret|token|apiKey|privateKey|accessKey)/i;
function humanizeTableName(name) {
  return name.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
function inspectTable(key, value) {
  try {
    const tableName = getTableName(value);
    const columns = getTableColumns(value);
    const registeredColumns = Object.entries(columns).map(([name, column]) => ({
      name,
      required: Boolean(column?.notNull && !column?.hasDefault && !column?.primary),
      hasDefault: Boolean(column?.hasDefault),
      dataType: String(column?.dataType || "unknown")
    }));
    const organizationColumn = registeredColumns.some((column) => column.name === "organizationId") ? "organizationId" : void 0;
    return {
      key: tableName,
      name: tableName,
      label: humanizeTableName(tableName),
      schema: value,
      columns: registeredColumns,
      organizationColumn,
      sensitiveColumns: registeredColumns.map((column) => column.name).filter((column) => sensitiveColumnPattern.test(column))
    };
  } catch {
    return null;
  }
}
var cachedRegistry;
function getTableRegistry() {
  if (cachedRegistry) return cachedRegistry;
  const byTableName = /* @__PURE__ */ new Map();
  for (const module of schemaModules) {
    for (const [key, value] of Object.entries(module)) {
      const table = inspectTable(key, value);
      if (!table || byTableName.has(table.name)) continue;
      byTableName.set(table.name, table);
    }
  }
  cachedRegistry = [...byTableName.values()].sort((left, right) => left.name.localeCompare(right.name));
  return cachedRegistry;
}
function getRegisteredTable(tableName) {
  const normalized = tableName.toLowerCase();
  return getTableRegistry().find((table) => table.name.toLowerCase() === normalized);
}
function getImportableColumns(table) {
  return table.columns.filter((column) => !table.sensitiveColumns.includes(column.name));
}

// server/routers/csvImportExport.ts
function csvEscape(value) {
  const text6 = value === null || value === void 0 ? "" : String(value);
  return /[",\n\r]/.test(text6) ? `"${text6.replace(/"/g, '""')}"` : text6;
}
function normalizeSchemaKey(value) {
  return value.trim().toLowerCase().replace(/[\s-]+/g, "_");
}
function normalizeGenericRow(value, columns) {
  const byNormalizedName = new Map(columns.map((column) => [normalizeSchemaKey(column), column]));
  const aliases = {
    "project_#": "projectNumber",
    project_no: "projectNumber",
    project_number: "projectNumber",
    client: "clientId",
    client_code: "clientId",
    client_id: "clientId"
  };
  const row = {};
  for (const [key, rawValue] of Object.entries(value)) {
    const normalizedKey = normalizeSchemaKey(key);
    const canonical = aliases[normalizedKey] || byNormalizedName.get(normalizedKey);
    if (canonical && !byNormalizedName.has(normalizeSchemaKey(canonical))) continue;
    if (!canonical || rawValue === "" || rawValue === null) continue;
    row[canonical] = rawValue;
  }
  return row;
}
var parseOptionalIntString = (value) => {
  const trimmed = value.trim();
  if (trimmed === "") return void 0;
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isNaN(parsed) ? void 0 : parsed;
};
var parseRequiredIntString = (value) => {
  const trimmed = value.trim();
  if (trimmed === "") return 0;
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
};
var accountTypeValues = ["asset", "liability", "equity", "revenue", "expense", "cost of goods sold", "operating expense", "capital expenditure", "other income", "other expense"];
var normalizeAccountType = (value) => {
  if (typeof value !== "string") return "asset";
  const normalized = value.trim().toLowerCase().replace(/\s+/g, " ");
  const aliasMap = {
    "cogs": "cost of goods sold",
    "cost of goods sold": "cost of goods sold",
    "opex": "operating expense",
    "operating expense": "operating expense",
    "capex": "capital expenditure",
    "capital expenditure": "capital expenditure",
    "other income": "other income",
    "other expense": "other expense"
  };
  return aliasMap[normalized] ?? normalized;
};
var csvAccountTypeSchema = z2.preprocess((value) => normalizeAccountType(value), z2.enum(accountTypeValues));
var normalizeClientImportRow = (value) => {
  if (!value || typeof value !== "object") return value;
  const row = value;
  const normalized = { ...row };
  const aliases = {
    company_name: "companyName",
    company: "companyName",
    client_name: "companyName",
    client_status: "status",
    status: "status"
  };
  for (const [key, rawValue] of Object.entries(row)) {
    const normalizedKey = key.trim().toLowerCase().replace(/[\s-]+/g, "_");
    const canonical = aliases[normalizedKey];
    if (canonical && normalized[canonical] === void 0) {
      normalized[canonical] = rawValue;
    }
  }
  for (const key of Object.keys(normalized)) {
    if (normalized[key] === null || normalized[key] === "") normalized[key] = void 0;
  }
  return normalized;
};
var normalizeEmployeeImportRow = (value) => {
  if (!value || typeof value !== "object") return value;
  const row = value;
  const normalized = { ...row };
  const aliases = {
    employee_number: "employeeNumber",
    employee_id: "employeeNumber",
    employee_no: "employeeNumber",
    first_name: "firstName",
    last_name: "lastName",
    date_of_birth: "dateOfBirth",
    hire_date: "hireDate",
    date_of_hire: "hireDate",
    job_group_id: "jobGroupId",
    employment_type: "employmentType",
    bank_account_number: "bankAccountNumber",
    national_id: "nationalId"
  };
  for (const [key, rawValue] of Object.entries(row)) {
    const normalizedKey = key.trim().toLowerCase().replace(/[\s-]+/g, "_");
    const canonical = aliases[normalizedKey];
    if (canonical && normalized[canonical] === void 0) normalized[canonical] = rawValue;
  }
  for (const key of Object.keys(normalized)) {
    if (normalized[key] === null || normalized[key] === "") normalized[key] = void 0;
  }
  return normalized;
};
var clientImportRowSchema = z2.preprocess(
  normalizeClientImportRow,
  z2.object({
    companyName: z2.string(),
    contactPerson: z2.string().optional(),
    email: optionalEmail(),
    phone: z2.string().optional(),
    address: z2.string().optional(),
    city: z2.string().optional(),
    country: z2.string().optional(),
    postalCode: z2.string().optional(),
    taxId: z2.string().optional(),
    website: z2.string().optional(),
    industry: z2.string().optional(),
    status: z2.enum(["active", "inactive", "prospect", "archived"]).optional(),
    businessType: z2.string().optional(),
    registrationNumber: z2.string().optional(),
    creditLimit: z2.number().optional().or(z2.string().transform(parseOptionalIntString))
  })
);
var csvImportExportRouter = router({
  listSchemaTables: createFeatureRestrictedProcedure2("data:export").query(async () => getTableRegistry().map((table) => ({
    key: table.key,
    label: table.label,
    columns: table.columns,
    requiredColumns: table.columns.filter((column) => column.required).map((column) => column.name),
    organizationColumn: table.organizationColumn
  }))),
  generateTableTemplate: createFeatureRestrictedProcedure2("data:export").input(z2.object({ table: z2.string() })).query(async ({ input }) => {
    const table = getRegisteredTable(input.table);
    if (!table) throw new TRPCError3({ code: "NOT_FOUND", message: `Unknown schema table: ${input.table}` });
    const columns = getImportableColumns(table);
    return {
      table: table.key,
      label: table.label,
      columns,
      requiredColumns: columns.filter((column) => column.required).map((column) => column.name),
      content: `${columns.map((column) => csvEscape(column.name)).join(",")}
`
    };
  }),
  exportTable: createFeatureRestrictedProcedure2("data:export").input(z2.object({ table: z2.string(), limit: z2.number().int().positive().max(1e5).default(1e5) })).query(async ({ input, ctx }) => {
    const table = getRegisteredTable(input.table);
    if (!table) throw new TRPCError3({ code: "NOT_FOUND", message: `Unknown schema table: ${input.table}` });
    const database = await getDb();
    if (!database) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    let rows;
    try {
      rows = table.organizationColumn && ctx.user.organizationId ? await database.select().from(table.schema).where(eq4(table.schema[table.organizationColumn], ctx.user.organizationId)).limit(input.limit) : await database.select().from(table.schema).limit(input.limit);
    } catch (error) {
      throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: `Failed to export ${table.key}: ${error}` });
    }
    const columns = getImportableColumns(table).map((column) => column.name);
    return {
      table: table.key,
      label: table.label,
      content: [columns.join(","), ...rows.map((row) => columns.map((column) => csvEscape(row[column])).join(","))].join("\n"),
      rowCount: rows.length
    };
  }),
  importTable: createFeatureRestrictedProcedure2("data:import").input(z2.object({
    table: z2.string(),
    content: z2.string().max(25e6),
    skipDuplicates: z2.boolean().default(true),
    validateOnly: z2.boolean().default(false)
  })).mutation(async ({ input, ctx }) => {
    const table = getRegisteredTable(input.table);
    if (!table) throw new TRPCError3({ code: "NOT_FOUND", message: `Unknown schema table: ${input.table}` });
    const database = await getDb();
    if (!database) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    const rows = parseCSV(input.content);
    if (rows.length === 0) return { imported: 0, skipped: 0, errors: [] };
    const importableColumns = getImportableColumns(table);
    const columnNames = importableColumns.map((column) => column.name);
    const requiredColumns = importableColumns.filter((column) => column.required).map((column) => column.name);
    const headers = Object.keys(rows[0]);
    const missingHeaders = requiredColumns.filter((column) => !headers.some((header) => normalizeSchemaKey(header) === normalizeSchemaKey(column)));
    if (missingHeaders.length > 0) {
      throw new TRPCError3({ code: "BAD_REQUEST", message: `Missing required columns for ${table.key}: ${missingHeaders.join(", ")}` });
    }
    const importRows = async (targetDatabase) => {
      const results = { imported: 0, skipped: 0, errors: [] };
      const schemaColumns = getTableColumns2(table.schema);
      const [liveColumnRows] = await targetDatabase.execute(`SHOW COLUMNS FROM \`${table.name.replace(/`/g, "")}\``);
      const liveColumns = new Set(
        (Array.isArray(liveColumnRows) ? liveColumnRows : []).map((column) => String(column.Field || column.field || ""))
      );
      for (let index6 = 0; index6 < rows.length; index6++) {
        try {
          const normalized = normalizeGenericRow(rows[index6], columnNames);
          if (!normalized.id) normalized.id = uuidv4();
          if (table.organizationColumn && ctx.user.organizationId && !normalized[table.organizationColumn]) {
            normalized[table.organizationColumn] = ctx.user.organizationId;
          }
          delete normalized.createdAt;
          delete normalized.updatedAt;
          for (const key of Object.keys(normalized)) {
            if (!(key in schemaColumns) || !liveColumns.has(key) || table.sensitiveColumns.includes(key)) delete normalized[key];
          }
          const missing = requiredColumns.filter((column) => normalized[column] === void 0);
          if (missing.length > 0) throw new Error(`Missing required values: ${missing.join(", ")}`);
          await targetDatabase.insert(table.schema).values(normalized);
          results.imported++;
        } catch (error) {
          if (input.skipDuplicates && /duplicate|unique/i.test(error?.message || "")) results.skipped++;
          else results.errors.push({ row: index6 + 2, message: error?.message || String(error) });
        }
      }
      return results;
    };
    if (!input.validateOnly) return importRows(database);
    const rollbackValidation = "CSV_IMPORT_VALIDATION_ROLLBACK";
    let validationResults = { imported: 0, skipped: 0, errors: [] };
    try {
      await database.transaction(async (transaction) => {
        validationResults = await importRows(transaction);
        throw new Error(rollbackValidation);
      });
    } catch (error) {
      if (error?.message !== rollbackValidation) throw error;
    }
    return { ...validationResults, imported: 0, validated: validationResults.imported };
  }),
  // Get list of available modules for import
  getAvailableModules: createFeatureRestrictedProcedure2("data:export").query(async () => {
    return getAvailableModules();
  }),
  // Generate CSV template for a specific module
  generateTemplate: createFeatureRestrictedProcedure2("data:export").input(z2.enum([
    "clients",
    "employees",
    "departments",
    "jobGroups",
    "products",
    "services",
    "payments",
    "accounts",
    "bankAccounts",
    "expenses",
    "invoices",
    "users"
  ])).query(async ({ input }) => {
    try {
      const template = generateCSVTemplate(input);
      return {
        success: true,
        content: template,
        module: input,
        timestamp: /* @__PURE__ */ new Date()
      };
    } catch (error) {
      throw new TRPCError3({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to generate template: ${error}`
      });
    }
  }),
  // Import clients from CSV data
  importClients: createFeatureRestrictedProcedure2("data:import").input(z2.object({
    data: z2.array(clientImportRowSchema),
    skipDuplicates: z2.boolean().default(true)
  })).mutation(async ({ input, ctx }) => {
    const database = await getDb();
    if (!database) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    const results = {
      imported: 0,
      skipped: 0,
      errors: [],
      batchId: uuidv4()
    };
    for (let idx = 0; idx < input.data.length; idx++) {
      const row = idx + 1;
      const clientData = input.data[idx];
      try {
        if (!clientData.companyName || clientData.companyName.trim() === "") {
          results.errors.push({ row, field: "companyName", message: "Company name is required" });
          results.skipped++;
          continue;
        }
        if (input.skipDuplicates && clientData.email) {
          const existing = await database.select().from(clients).where(eq4(clients.email, clientData.email));
          if (existing.length > 0) {
            results.skipped++;
            continue;
          }
        }
        const id = uuidv4();
        await database.insert(clients).values({
          id,
          companyName: clientData.companyName,
          contactPerson: clientData.contactPerson || null,
          email: clientData.email || null,
          phone: clientData.phone || null,
          address: clientData.address || null,
          city: clientData.city || null,
          country: clientData.country || null,
          postalCode: clientData.postalCode || null,
          taxId: clientData.taxId || null,
          website: clientData.website || null,
          industry: clientData.industry || null,
          status: clientData.status || "active",
          businessType: clientData.businessType || null,
          registrationNumber: clientData.registrationNumber || null,
          creditLimit: clientData.creditLimit ? parseInt(clientData.creditLimit.toString()) : null,
          createdBy: ctx.user.id,
          createdAt: (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").substring(0, 19)
        });
        results.imported++;
      } catch (error) {
        results.errors.push({
          row,
          message: `Failed to import client: ${error}`
        });
      }
    }
    await logActivity({
      userId: ctx.user.id,
      action: "csv_import_clients",
      entityType: "client",
      entityId: "bulk",
      description: `Imported ${results.imported} clients via CSV (skipped: ${results.skipped})`
    });
    return results;
  }),
  // Import employees from CSV data
  importEmployees: createFeatureRestrictedProcedure2("data:import").input(z2.object({
    data: z2.array(z2.preprocess(normalizeEmployeeImportRow, z2.object({
      employeeNumber: z2.string(),
      firstName: z2.string(),
      lastName: z2.string(),
      email: optionalEmail(),
      phone: z2.string().optional(),
      dateOfBirth: z2.string().optional(),
      hireDate: z2.string(),
      department: z2.string().optional(),
      position: z2.string().optional(),
      jobGroupId: z2.string().optional(),
      salary: z2.number().optional().or(z2.string().transform(parseOptionalIntString)),
      employmentType: z2.enum(["full_time", "part_time", "contract", "intern"]).optional(),
      status: z2.enum(["active", "on_leave", "terminated", "suspended"]).optional(),
      address: z2.string().optional(),
      nationalId: z2.string().optional(),
      bankAccountNumber: z2.string().optional(),
      taxId: z2.string().optional()
    }))),
    skipDuplicates: z2.boolean().default(true)
  })).mutation(async ({ input, ctx }) => {
    const database = await getDb();
    if (!database) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    const results = {
      imported: 0,
      skipped: 0,
      errors: [],
      batchId: uuidv4()
    };
    for (let idx = 0; idx < input.data.length; idx++) {
      const row = idx + 1;
      const empData = input.data[idx];
      try {
        if (!empData.employeeNumber || empData.employeeNumber.trim() === "") {
          results.errors.push({ row, field: "employeeNumber", message: "Employee number is required" });
          results.skipped++;
          continue;
        }
        if (!empData.firstName || empData.firstName.trim() === "") {
          results.errors.push({ row, field: "firstName", message: "First name is required" });
          results.skipped++;
          continue;
        }
        if (!empData.lastName || empData.lastName.trim() === "") {
          results.errors.push({ row, field: "lastName", message: "Last name is required" });
          results.skipped++;
          continue;
        }
        if (!empData.hireDate || empData.hireDate.trim() === "") {
          results.errors.push({ row, field: "hireDate", message: "Hire date is required" });
          results.skipped++;
          continue;
        }
        if (input.skipDuplicates) {
          const existing = await database.select().from(employees).where(eq4(employees.employeeNumber, empData.employeeNumber));
          if (existing.length > 0) {
            results.skipped++;
            continue;
          }
        }
        const id = uuidv4();
        await database.insert(employees).values({
          id,
          organizationId: ctx.user.organizationId ?? null,
          employeeNumber: empData.employeeNumber,
          firstName: empData.firstName,
          lastName: empData.lastName,
          email: empData.email || null,
          phone: empData.phone || null,
          dateOfBirth: empData.dateOfBirth ? new Date(empData.dateOfBirth).toISOString() : null,
          hireDate: new Date(empData.hireDate).toISOString(),
          department: empData.department || null,
          position: empData.position || null,
          jobGroupId: empData.jobGroupId || uuidv4(),
          // Default job group
          salary: empData.salary ? parseInt(empData.salary.toString()) : 0,
          employmentType: empData.employmentType || "full_time",
          status: empData.status || "active",
          address: empData.address || null,
          nationalId: empData.nationalId || null,
          bankAccountNumber: empData.bankAccountNumber || null,
          taxId: empData.taxId || null,
          createdBy: ctx.user.id,
          createdAt: (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").substring(0, 19)
        });
        results.imported++;
      } catch (error) {
        results.errors.push({
          row,
          message: `Failed to import employee: ${error}`
        });
      }
    }
    await logActivity({
      userId: ctx.user.id,
      action: "csv_import_employees",
      entityType: "employee",
      entityId: "bulk",
      description: `Imported ${results.imported} employees via CSV`
    });
    return results;
  }),
  // Import products from CSV data
  importProducts: createFeatureRestrictedProcedure2("data:import").input(z2.object({
    data: z2.array(z2.object({
      name: z2.string().optional(),
      productName: z2.string().optional(),
      sku: z2.string().optional(),
      productCode: z2.string().optional(),
      description: z2.string().optional(),
      category: z2.string().optional(),
      unitPrice: z2.number().optional().or(z2.string().transform(parseRequiredIntString)),
      unit_price: z2.number().optional().or(z2.string().transform(parseRequiredIntString)),
      taxRate: z2.number().optional().or(z2.string().transform(parseOptionalIntString)),
      tax_rate: z2.number().optional().or(z2.string().transform(parseOptionalIntString)),
      stockQuantity: z2.number().optional().or(z2.string().transform(parseOptionalIntString)),
      stock_quantity: z2.number().optional().or(z2.string().transform(parseOptionalIntString)),
      reorderLevel: z2.number().optional().or(z2.string().transform(parseOptionalIntString)),
      reorder_level: z2.number().optional().or(z2.string().transform(parseOptionalIntString)),
      supplier: z2.string().optional(),
      status: z2.enum(["active", "inactive", "discontinued"]).optional(),
      isActive: z2.boolean().optional().or(z2.string().transform((v) => v === "true")),
      is_active: z2.boolean().optional().or(z2.string().transform((v) => v === "true"))
    })),
    skipDuplicates: z2.boolean().default(true)
  })).mutation(async ({ input, ctx }) => {
    const database = await getDb();
    if (!database) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    const results = {
      imported: 0,
      skipped: 0,
      errors: [],
      batchId: uuidv4()
    };
    for (let idx = 0; idx < input.data.length; idx++) {
      const row = idx + 1;
      const prodData = input.data[idx];
      const normalizedName = prodData.name || prodData.productName || "";
      const normalizedSku = prodData.sku || prodData.productCode || "";
      const normalizedUnitPrice = prodData.unitPrice ?? prodData.unit_price ?? 0;
      const normalizedTaxRate = prodData.taxRate ?? prodData.tax_rate ?? 0;
      const normalizedStockQuantity = prodData.stockQuantity ?? prodData.stock_quantity ?? 0;
      const normalizedReorderLevel = prodData.reorderLevel ?? prodData.reorder_level ?? 0;
      try {
        if (!normalizedName || normalizedName.trim() === "") {
          results.errors.push({ row, field: "name", message: "Product name is required" });
          results.skipped++;
          continue;
        }
        if (input.skipDuplicates && normalizedSku) {
          const existing = await database.select().from(products).where(eq4(products.sku, normalizedSku));
          if (existing.length > 0) {
            results.skipped++;
            continue;
          }
        }
        const id = uuidv4();
        await database.insert(products).values({
          id,
          organizationId: ctx.user.organizationId ?? null,
          name: normalizedName,
          sku: normalizedSku || null,
          description: prodData.description || null,
          category: prodData.category || null,
          unitPrice: Number(normalizedUnitPrice),
          taxRate: Number(normalizedTaxRate || 0),
          stockQuantity: Number(normalizedStockQuantity || 0),
          minStockLevel: 0,
          unit: "pcs",
          isActive: prodData.isActive ?? prodData.is_active ?? true ? 1 : 0,
          supplier: prodData.supplier || null,
          reorderLevel: Number(normalizedReorderLevel || 0),
          createdBy: ctx.user.id,
          createdAt: (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").substring(0, 19)
        });
        results.imported++;
      } catch (error) {
        results.errors.push({
          row,
          message: `Failed to import product: ${error}`
        });
      }
    }
    await logActivity({
      userId: ctx.user.id,
      action: "csv_import_products",
      entityType: "product",
      entityId: "bulk",
      description: `Imported ${results.imported} products via CSV`
    });
    return results;
  }),
  // Import accounts (Chart of Accounts) from CSV data
  importAccounts: createFeatureRestrictedProcedure2("data:import").input(z2.object({
    data: z2.array(z2.object({
      // Support both camelCase and snake_case field names for flexibility
      accountCode: z2.string().optional(),
      account_code: z2.string().optional(),
      accountName: z2.string().optional(),
      account_name: z2.string().optional(),
      accountType: csvAccountTypeSchema.optional(),
      account_type: csvAccountTypeSchema.optional(),
      parentAccountCode: z2.string().optional(),
      parent_account_code: z2.string().optional(),
      description: z2.string().optional(),
      category: z2.string().optional(),
      isActive: z2.boolean().optional().or(z2.string().transform((v) => v === "true")),
      is_header_account: z2.boolean().optional().or(z2.string().transform((v) => v === "true"))
    })),
    skipDuplicates: z2.boolean().default(true)
  })).mutation(async ({ input, ctx }) => {
    const database = await getDb();
    if (!database) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    const results = {
      imported: 0,
      skipped: 0,
      errors: [],
      batchId: uuidv4()
    };
    for (let idx = 0; idx < input.data.length; idx++) {
      const row = idx + 1;
      const rawData = input.data[idx];
      try {
        const accountTypeValue = rawData.accountType ?? rawData.account_type ?? "asset";
        const normalizedAccountType = normalizeAccountType(rawData.accountType ?? rawData.account_type ?? "asset");
        const accData = {
          accountCode: rawData.accountCode || rawData.account_code || "",
          accountName: rawData.accountName || rawData.account_name || "",
          accountType: normalizedAccountType,
          parentAccountCode: rawData.parentAccountCode || rawData.parent_account_code,
          description: rawData.description || null,
          category: rawData.category || null,
          isHeaderAccount: rawData.is_header_account || false
        };
        if (!accData.accountCode || accData.accountCode.trim() === "") {
          results.errors.push({ row, field: "account_code", message: "Account code is required" });
          results.skipped++;
          continue;
        }
        if (!accData.accountName || accData.accountName.trim() === "") {
          results.errors.push({ row, field: "account_name", message: "Account name is required" });
          results.skipped++;
          continue;
        }
        if (input.skipDuplicates) {
          const existing = await database.select().from(accounts).where(eq4(accounts.accountCode, accData.accountCode));
          if (existing.length > 0) {
            results.skipped++;
            continue;
          }
        }
        let parentAccountId = null;
        if (accData.parentAccountCode) {
          const parentFromDb = await database.select().from(accounts).where(eq4(accounts.accountCode, accData.parentAccountCode));
          if (parentFromDb.length === 0) {
            results.errors.push({
              row,
              field: "parent_account_code",
              message: `Parent account with code ${accData.parentAccountCode} not found`
            });
            results.skipped++;
            continue;
          }
          parentAccountId = parentFromDb[0].id;
        }
        const id = uuidv4();
        await database.insert(accounts).values({
          id,
          organizationId: ctx.user.organizationId ?? null,
          accountCode: accData.accountCode,
          accountName: accData.accountName,
          accountType: accData.accountType,
          parentAccountId,
          description: accData.description,
          isActive: 1,
          balance: 0,
          createdAt: (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").substring(0, 19)
        });
        results.imported++;
      } catch (error) {
        results.errors.push({
          row,
          message: `Failed to import account: ${error}`
        });
      }
    }
    await logActivity({
      userId: ctx.user.id,
      action: "csv_import_accounts",
      entityType: "account",
      entityId: "bulk",
      description: `Imported ${results.imported} accounts via CSV (skipped: ${results.skipped})`
    });
    return results;
  }),
  // Import payments from CSV data
  importPayments: createFeatureRestrictedProcedure2("data:import").input(z2.object({
    data: z2.array(z2.object({
      invoiceNumber: z2.string(),
      clientName: z2.string().optional(),
      amount: z2.number().or(z2.string().transform(parseRequiredIntString)),
      paymentDate: z2.string(),
      paymentMethod: z2.enum(["cash", "bank_transfer", "cheque", "card", "other"]).optional(),
      reference: z2.string().optional(),
      description: z2.string().optional(),
      status: z2.enum(["pending", "completed", "cancelled"]).optional()
    })),
    skipDuplicates: z2.boolean().default(true)
  })).mutation(async ({ input, ctx }) => {
    const database = await getDb();
    if (!database) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
    const results = {
      imported: 0,
      skipped: 0,
      errors: [],
      batchId: uuidv4()
    };
    for (let idx = 0; idx < input.data.length; idx++) {
      const row = idx + 1;
      const payData = input.data[idx];
      try {
        if (!payData.invoiceNumber || payData.invoiceNumber.trim() === "") {
          results.errors.push({ row, field: "invoiceNumber", message: "Invoice number is required" });
          results.skipped++;
          continue;
        }
        if (!payData.amount || payData.amount <= 0) {
          results.errors.push({ row, field: "amount", message: "Amount must be greater than 0" });
          results.skipped++;
          continue;
        }
        const id = uuidv4();
        await database.insert(payments).values({
          id,
          invoiceNumber: payData.invoiceNumber,
          amount: parseInt(payData.amount.toString()),
          paymentDate: new Date(payData.paymentDate).toISOString().replace("T", " ").substring(0, 19),
          paymentMethod: payData.paymentMethod || "bank_transfer",
          reference: payData.reference || null,
          description: payData.description || null,
          status: payData.status || "completed",
          createdBy: ctx.user.id,
          createdAt: (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").substring(0, 19)
        });
        results.imported++;
      } catch (error) {
        results.errors.push({
          row,
          message: `Failed to import payment: ${error}`
        });
      }
    }
    await logActivity({
      userId: ctx.user.id,
      action: "csv_import_payments",
      entityType: "payment",
      entityId: "bulk",
      description: `Imported ${results.imported} payments via CSV`
    });
    return results;
  })
});
export {
  csvImportExportRouter,
  normalizeClientImportRow,
  normalizeEmployeeImportRow
};
