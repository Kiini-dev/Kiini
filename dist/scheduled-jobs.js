var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// drizzle/approvalSchema.ts
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
  assetMovements: () => assetMovements,
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
  eSignatureAuditEvents: () => eSignatureAuditEvents,
  eSignatureRequests: () => eSignatureRequests,
  emailCalendarSync: () => emailCalendarSync,
  emailCampaigns: () => emailCampaigns,
  emailGenerationHistory: () => emailGenerationHistory,
  emailLog: () => emailLog,
  emailLogs: () => emailLogs,
  emailMarketingSubscribers: () => emailMarketingSubscribers,
  emailQueue: () => emailQueue,
  employeeCostAllocations: () => employeeCostAllocations,
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
  globalAccountingPolicies: () => globalAccountingPolicies,
  globalConfigs: () => globalConfigs,
  goodsReceiptNotes: () => goodsReceiptNotes,
  grnRecords: () => grnRecords,
  guestClients: () => guestClients,
  holidays: () => holidays,
  hrSettings: () => hrSettings,
  imprestSurrenders: () => imprestSurrenders,
  imprests: () => imprests,
  incomeLedgerEntries: () => incomeLedgerEntries,
  incomeLedgerLines: () => incomeLedgerLines,
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
  nonSalesInflows: () => nonSalesInflows,
  notes: () => notes,
  notificationBroadcasts: () => notificationBroadcasts,
  notificationPreferences: () => notificationPreferences,
  notificationRules: () => notificationRules,
  notificationSettings: () => notificationSettings,
  notificationTemplates: () => notificationTemplates,
  notifications: () => notifications,
  onboardingChecklists: () => onboardingChecklists,
  onboardingTasks: () => onboardingTasks,
  onboardingTemplates: () => onboardingTemplates,
  opportunities: () => opportunities,
  orders: () => orders,
  organizationAccountingPolicies: () => organizationAccountingPolicies,
  organizationFeatures: () => organizationFeatures,
  organizationSettings: () => organizationSettings,
  organizationSubscriptions: () => organizationSubscriptions,
  organizationUsers: () => organizationUsers,
  organizations: () => organizations,
  partnerCommissions: () => partnerCommissions,
  partnerDeals: () => partnerDeals,
  partnerPayouts: () => partnerPayouts,
  partnerProfiles: () => partnerProfiles,
  partnerReferrals: () => partnerReferrals,
  paymentMethods: () => paymentMethods,
  paymentPlanInstallments: () => paymentPlanInstallments,
  paymentPlans: () => paymentPlans,
  paymentRetries: () => paymentRetries,
  paymentTriggers: () => paymentTriggers,
  payments: () => payments,
  payroll: () => payroll,
  payrollBatches: () => payrollBatches,
  payrollCostCenters: () => payrollCostCenters,
  payrollDetails: () => payrollDetails,
  payrollLedgerEntries: () => payrollLedgerEntries,
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
  reconciliationAuditEvents: () => reconciliationAuditEvents,
  reconciliationMatchAllocations: () => reconciliationMatchAllocations,
  reconciliationRules: () => reconciliationRules,
  recurringExpenses: () => recurringExpenses,
  recurringInvoiceTemplates: () => recurringInvoiceTemplates,
  recurringInvoices: () => recurringInvoices,
  registeredDevices: () => registeredDevices,
  reimbursements: () => reimbursements,
  reminders: () => reminders,
  reportExportAuditLogs: () => reportExportAuditLogs,
  rolePermissions: () => rolePermissions,
  saasBillingRateCards: () => saasBillingRateCards,
  saasBillingRateTiers: () => saasBillingRateTiers,
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
  trainingPrograms: () => trainingPrograms,
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
import { mysqlTable as mysqlTable2, index as index2, uniqueIndex as uniqueIndex2, varchar as varchar2, mysqlEnum, int as int2, text as text2, longtext, timestamp as timestamp2, datetime, date, tinyint, json as json2, decimal, bigint, boolean as boolean2 } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";
var accounts, activityLog, auditLogs, bankAccounts, bankTransactions, clients, communicationLogs, jobGroups, employees, estimateItems, estimates, proposals, expenses, recurringExpenses, guestClients, inventoryTransactions, invoiceItems, invoices, recurringInvoices, journalEntries, journalEntryLines, leaveRequests, opportunities, paymentPlans, paymentPlanInstallments, payroll, products, projectTasks, projects, projectMilestones, timeEntries, reminders, scheduledReminders, services, settings, organizationSettings, stockAlerts, systemSettings, templates, documentNumberFormats, defaultSettings, permissions, customRoles, userRoles, rolePermissions, receipts, creditNotes, debitNotes, departments, payrollCostCenters, employeeCostAllocations, payrollLedgerEntries, reportExportAuditLogs, nonSalesInflows, budgets, attendance, userProjectAssignments, projectComments, staffTasks, userPermissions, users, savedFilters, notifications, notificationSettings, notificationPreferences, smsQueue, smsCustomerPreferences, smsTemplates, smsAutomationRules, smsDeliveryEvents, userFavorites, aiDocuments, emailGenerationHistory, financialAnalytics, aiChatSessions, aiChatMessages, lineItems, workflows, workflowTriggers, workflowActions, workflowExecutions, permissionMetadata, dashboardLayouts, dashboardWidgets, dashboardWidgetData, permissionAuditLog, projectMetrics, clientHealthScores, performanceReviews, performanceContracts, skillsMatrix, schedules, vacationRequests, documents, fileFolders, documentVersions, documentAccess, notificationRules, usageMetrics, expenseCategories, expenseReports, reimbursements, currencies, exchangeRates, taxRates, forecastModels, forecastResults, apiKeys, webhooks, integrationLogs, emailQueue, emailLog, invoiceReminders, pricingPlans, subscriptions, organizationSubscriptions, billingInvoices, payments, paymentMethods, billingUsageMetrics, saasBillingRateCards, saasBillingRateTiers, incomeLedgerEntries, incomeLedgerLines, billingNotifications, dunningPolicies, paymentRetries, dunningEvents, userDeletions, notificationTemplates, notificationBroadcasts, messages, conversations, organizations, organizationFeatures, organizationUsers, tenantMessages, pricingTierFeatures, conversationMembers, messageReadReceipts, tickets, ticketResponses, recurringInvoiceTemplates, automatedReceipts, emailCampaigns, emailMarketingSubscribers, emailLogs, workOrders, eSignatureRequests, eSignatureAuditEvents, workOrderMaterials, serviceInvoices, serviceInvoiceItems, contacts, quotations, grnRecords, deliveryNotes, assets, assetMovements, contracts, warranties, notes, customReports, organizationAccountingPolicies, globalAccountingPolicies, imprests, imprestSurrenders, purchaseOrders, purchaseOrderItems, goodsReceiptNotes, leads, bankReconciliationStatements, bankReconciliationDetails, reconciliationRules, reconciliationMatchAllocations, reconciliationAuditEvents, automationConfigs, workflowAutomationLogs, smartWorkflows, exportJobs, securityEvents, aiConfigurations, apiPricingConfigs, etlJobs, containerDeployments, customDashboards, webhookConfigs, emailCalendarSync, securityIncidents, globalConfigs, registeredDevices, mobileAppConfigs, partnerDeals, partnerProfiles, partnerReferrals, partnerCommissions, partnerPayouts, perfConfigs, backupSchedules, backupHistory, integrationConfigs, designConfigs, aiInsights, analyticsMetrics, cohortAnalyses, executiveReports, collaborationSessions, complianceRecords, staffChatChannels, staffChatMessages, cannedResponses, kbCategories, kbArticles, warehouses, stockMovements, clientSubscriptions, systemHealth, systemLogs, activeSessions, departmentHierarchies, employeePromotions, employeeTransfers, timesheets, payrollBatches, payrollDetails, scheduledJobs, jobExecutionLogs, jobAlertRules, jobAlertHistory, jobHeartbeat, customFields, fieldValidations, fieldValues, stripeCustomers, stripePaymentIntents, mpesaTransactions, stripeWebhookEvents, lpos, orders, payslips, leaveBalances, leaveApprovals, taxCompliance, holidays, trainingCourses, trainingPrograms, trainingEnrollments, onboardingChecklists, onboardingTasks, onboardingTemplates, employeeSkills, hrSettings, approvalWorkflows2, permissionAuditLogs, permissionDelegations, paymentTriggers;
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
      organizationId: varchar2({ length: 64 }),
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
        importFingerprint: varchar2({ length: 64 }),
        createdAt: timestamp2({ mode: "string" })
      },
      (table) => [
        index2("bank_account_idx").on(table.bankAccountId),
        index2("transaction_date_idx").on(table.transactionDate),
        index2("reconciled_idx").on(table.isReconciled),
        uniqueIndex2("bank_transaction_import_fingerprint_uq").on(table.bankAccountId, table.importFingerprint)
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
        category: varchar2({ length: 100 }),
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
        salary: decimal({ precision: 12, scale: 2, mode: "number" }),
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
        index2("employees_user_id_idx").on(table.userId),
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
        projectId: varchar2({ length: 64 }),
        estimateNumber: varchar2({ length: 100 }).notNull(),
        clientId: varchar2({ length: 64 }).notNull(),
        title: varchar2({ length: 255 }),
        category: varchar2({ length: 100 }),
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
        organizationId: varchar2({ length: 64 }),
        proposalNumber: varchar2({ length: 100 }).notNull(),
        clientId: varchar2({ length: 64 }).notNull(),
        title: varchar2({ length: 255 }),
        status: mysqlEnum(["draft", "sent", "accepted", "rejected"]).default("draft").notNull(),
        issueDate: datetime({ mode: "string" }).notNull(),
        expiryDate: datetime({ mode: "string" }),
        description: longtext(),
        deliverables: longtext(),
        timeline: text2(),
        assumptions: text2(),
        exclusions: text2(),
        terms: longtext(),
        currency: varchar2({ length: 3 }).default("KES"),
        lineItems: json2(),
        subtotal: int2().notNull(),
        taxAmount: int2().default(0),
        discountAmount: int2().default(0),
        total: int2().notNull(),
        notes: text2(),
        signingStatus: varchar2({ length: 32 }).default("not_sent").notNull(),
        signingWorkflowId: varchar2({ length: 64 }),
        signedDocumentHtml: longtext(),
        signedDocumentHash: varchar2({ length: 64 }),
        signedAt: timestamp2({ mode: "string" }),
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
        paymentMethod: mysqlEnum(["cash", "bank_transfer", "cheque", "card", "mpesa", "other"]),
        receiptUrl: longtext(),
        description: text2(),
        accountId: varchar2({ length: 64 }),
        budgetAllocationId: varchar2({ length: 64 }),
        // Link to budget allocation line
        status: mysqlEnum(["pending", "approved", "rejected", "paid"]).default("pending").notNull(),
        createdBy: varchar2({ length: 64 }),
        approvedBy: varchar2({ length: 64 }),
        approvedAt: datetime({ mode: "string" }),
        chartOfAccountId: varchar2({ length: 64 }),
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
        paymentMethod: mysqlEnum(["cash", "bank_transfer", "cheque", "card", "mpesa", "other"]),
        frequency: mysqlEnum(["weekly", "biweekly", "monthly", "quarterly", "annually"]).notNull(),
        startDate: datetime({ mode: "string" }).notNull(),
        endDate: datetime({ mode: "string" }),
        nextDueDate: datetime({ mode: "string" }).notNull(),
        dayOfMonth: int2().default(1),
        reminderDaysBefore: int2().default(3),
        lastGeneratedDate: datetime({ mode: "string" }),
        isActive: tinyint().default(1).notNull(),
        chartOfAccountId: varchar2({ length: 64 }),
        budgetAllocationId: varchar2({ length: 64 }),
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
        projectId: varchar2({ length: 64 }),
        invoiceNumber: varchar2({ length: 100 }).notNull(),
        clientId: varchar2({ length: 64 }).notNull(),
        estimateId: varchar2({ length: 64 }),
        title: varchar2({ length: 255 }),
        category: varchar2({ length: 100 }),
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
        approvedBy: varchar2({ length: 64 }),
        approvedAt: datetime({ mode: "string" }),
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
        organizationId: varchar2({ length: 64 }),
        costCenterId: varchar2({ length: 64 }),
        entryNumber: varchar2({ length: 100 }).notNull(),
        entryDate: datetime({ mode: "string" }).notNull(),
        entryMonth: varchar2({ length: 7 }),
        reference: varchar2({ length: 50 }),
        description: text2(),
        totalAmount: decimal({ precision: 15, scale: 2, mode: "number" }),
        referenceType: varchar2({ length: 50 }),
        referenceId: varchar2({ length: 64 }),
        status: mysqlEnum(["pending_approval", "approved", "posted", "reversed"]).default("posted"),
        approvedBy: varchar2({ length: 64 }),
        approvedAt: datetime({ mode: "string" }),
        postedAt: datetime({ mode: "string" }),
        reversedAt: datetime({ mode: "string" }),
        notes: text2(),
        createdBy: varchar2({ length: 64 }),
        createdAt: timestamp2({ mode: "string" }),
        updatedAt: datetime({ mode: "string" })
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
        lineNumber: int2(),
        createdBy: varchar2({ length: 64 }),
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
        status: mysqlEnum(["pending", "approved", "rejected", "returned", "cancelled"]).default("pending").notNull(),
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
        category: varchar2({ length: 100 }),
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
        location: varchar2({ length: 255 }),
        barcode: varchar2({ length: 100 }),
        batchNumber: varchar2({ length: 100 }),
        manufacturingDate: varchar2({ length: 50 }),
        expiryDate: varchar2({ length: 50 }),
        warrantyMonths: int2().default(0),
        hsCode: varchar2({ length: 50 }),
        weight: varchar2({ length: 20 }),
        weightUnit: varchar2({ length: 20 }).default("kg"),
        warehouseLocation: varchar2({ length: 255 })
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
        category: varchar2({ length: 100 }),
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
    organizationSettings = mysqlTable2("organizationSettings", {
      id: varchar2({ length: 64 }).primaryKey(),
      organizationId: varchar2({ length: 64 }).notNull(),
      key: varchar2({ length: 100 }).notNull(),
      value: longtext(),
      category: varchar2({ length: 100 }).notNull(),
      description: text2(),
      updatedBy: varchar2({ length: 64 }),
      updatedAt: timestamp2({ mode: "string" })
    }, (table) => [
      uniqueIndex2("org_settings_scope_key_idx").on(table.organizationId, table.category, table.key)
    ]);
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
        documentType: varchar2({ length: 50 }).notNull(),
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
    payrollCostCenters = mysqlTable2("payrollCostCenters", {
      id: varchar2({ length: 64 }).primaryKey(),
      organizationId: varchar2({ length: 64 }),
      departmentId: varchar2({ length: 64 }),
      expenseAccountId: varchar2({ length: 64 }),
      payrollLiabilityAccountId: varchar2({ length: 64 }),
      code: varchar2({ length: 50 }).notNull(),
      name: varchar2({ length: 100 }).notNull(),
      type: mysqlEnum(["COGS", "R&D", "S&M", "G&A", "PROGRAMMATIC"]).notNull(),
      isActive: tinyint().default(1).notNull(),
      createdBy: varchar2({ length: 64 }).notNull(),
      createdAt: timestamp2({ mode: "string" }).defaultNow(),
      updatedAt: timestamp2({ mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      uniqueIndex2("payroll_cost_center_org_code_uq").on(table.organizationId, table.code),
      index2("payroll_cost_center_org_idx").on(table.organizationId),
      index2("payroll_cost_center_department_idx").on(table.departmentId)
    ]);
    employeeCostAllocations = mysqlTable2("employeeCostAllocations", {
      id: varchar2({ length: 64 }).primaryKey(),
      organizationId: varchar2({ length: 64 }),
      employeeId: varchar2({ length: 64 }).notNull(),
      costCenterId: varchar2({ length: 64 }).notNull(),
      budgetCode: varchar2({ length: 100 }),
      allocationBasisPoints: int2().notNull(),
      effectiveDate: date({ mode: "string" }).notNull(),
      createdBy: varchar2({ length: 64 }).notNull(),
      createdAt: timestamp2({ mode: "string" }).defaultNow()
    }, (table) => [
      index2("employee_cost_allocations_employee_date_idx").on(table.employeeId, table.effectiveDate),
      index2("employee_cost_allocations_org_idx").on(table.organizationId),
      index2("employee_cost_allocations_center_idx").on(table.costCenterId)
    ]);
    payrollLedgerEntries = mysqlTable2("payrollLedgerEntries", {
      id: varchar2({ length: 64 }).primaryKey(),
      organizationId: varchar2({ length: 64 }),
      payrollId: varchar2({ length: 64 }).notNull(),
      employeeId: varchar2({ length: 64 }).notNull(),
      costCenterId: varchar2({ length: 64 }).notNull(),
      payrollPeriodStart: date({ mode: "string" }).notNull(),
      payrollPeriodEnd: date({ mode: "string" }).notNull(),
      allocationBasisPoints: int2().notNull(),
      grossPayCents: int2().notNull(),
      employerStatutoryCents: int2().notNull(),
      employerBenefitsCents: int2().notNull(),
      fullyBurdenedCostCents: int2().notNull(),
      employeeTaxCents: int2().notNull(),
      netPayoutCents: int2().notNull(),
      processedAt: timestamp2({ mode: "string" }).defaultNow()
    }, (table) => [
      uniqueIndex2("payroll_ledger_payroll_center_uq").on(table.payrollId, table.costCenterId),
      index2("payroll_ledger_org_period_idx").on(table.organizationId, table.payrollPeriodEnd),
      index2("payroll_ledger_center_period_idx").on(table.costCenterId, table.payrollPeriodEnd),
      index2("payroll_ledger_employee_idx").on(table.employeeId)
    ]);
    reportExportAuditLogs = mysqlTable2("reportExportAuditLogs", {
      id: varchar2({ length: 64 }).primaryKey(),
      organizationId: varchar2({ length: 64 }),
      managerUserId: varchar2({ length: 64 }).notNull(),
      managerEmail: varchar2({ length: 255 }).notNull(),
      reportType: varchar2({ length: 100 }).notNull(),
      exportFormat: mysqlEnum(["CSV", "XLSX", "PDF"]).notNull(),
      dateRangeStart: date({ mode: "string" }).notNull(),
      dateRangeEnd: date({ mode: "string" }).notNull(),
      ipAddress: varchar2({ length: 45 }).notNull(),
      userAgent: text2().notNull(),
      generatedFileSha256: varchar2({ length: 64 }).notNull(),
      createdAt: timestamp2({ mode: "string" }).defaultNow()
    }, (table) => [
      index2("report_export_audit_org_date_idx").on(table.organizationId, table.createdAt),
      index2("report_export_audit_manager_idx").on(table.managerUserId)
    ]);
    nonSalesInflows = mysqlTable2("nonSalesInflows", {
      id: varchar2({ length: 64 }).primaryKey(),
      organizationId: varchar2({ length: 64 }),
      referenceNumber: varchar2({ length: 100 }).notNull(),
      inflowType: mysqlEnum(["donation", "other_income", "equity_injection", "deferred_loan"]).notNull(),
      status: mysqlEnum(["posted", "reversed"]).default("posted").notNull(),
      description: varchar2({ length: 500 }).notNull(),
      amountCents: bigint({ mode: "number" }).notNull(),
      currency: varchar2({ length: 10 }).notNull(),
      usdToOrganizationFxRate: decimal({ precision: 18, scale: 8, mode: "number" }),
      taxStatus: mysqlEnum(["taxable", "tax_exempt", "equity_injection", "deferred_loan"]).notNull(),
      cashAccountId: varchar2({ length: 64 }).notNull(),
      categoryAccountId: varchar2({ length: 64 }).notNull(),
      bankAccountId: varchar2({ length: 64 }),
      sourceBankTransactionId: varchar2({ length: 64 }),
      complianceMetadata: json2(),
      receivedAt: datetime({ mode: "string" }).notNull(),
      journalEntryId: varchar2({ length: 64 }).notNull(),
      reversalJournalEntryId: varchar2({ length: 64 }),
      reversedAt: datetime({ mode: "string" }),
      reversedBy: varchar2({ length: 64 }),
      reversalReason: varchar2({ length: 500 }),
      createdBy: varchar2({ length: 64 }).notNull(),
      createdAt: timestamp2({ mode: "string" }).defaultNow()
    }, (table) => [
      uniqueIndex2("non_sales_inflow_org_ref_uq").on(table.organizationId, table.referenceNumber),
      uniqueIndex2("non_sales_inflow_bank_tx_uq").on(table.sourceBankTransactionId),
      index2("non_sales_inflow_org_date_idx").on(table.organizationId, table.receivedAt),
      index2("non_sales_inflow_org_status_idx").on(table.organizationId, table.status)
    ]);
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
      salary: decimal({ precision: 12, scale: 2, mode: "number" }),
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
      linkedClientId: varchar2({ length: 64 }),
      name: varchar2({ length: 255 }).notNull(),
      createdBy: varchar2({ length: 64 }).notNull(),
      createdAt: timestamp2({ mode: "string" }).defaultNow(),
      updatedAt: timestamp2({ mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_file_folder_org").on(table.organizationId),
      index2("idx_file_folder_parent").on(table.parentId),
      index2("idx_file_folder_client").on(table.linkedClientId)
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
      chartOfAccountId: varchar2({ length: 64 }),
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
    saasBillingRateCards = mysqlTable2("saasBillingRateCards", {
      id: varchar2({ length: 64 }).primaryKey(),
      planId: varchar2({ length: 64 }).notNull(),
      currency: varchar2({ length: 3 }).notNull().default("KES"),
      monthlyBaseCents: bigint({ mode: "number" }).notNull().default(0),
      annualBaseCents: bigint({ mode: "number" }).notNull().default(0),
      includedSeats: int2().notNull().default(0),
      monthlySeatCents: bigint({ mode: "number" }).notNull().default(0),
      annualSeatCents: bigint({ mode: "number" }).notNull().default(0),
      isActive: tinyint().notNull().default(1),
      createdBy: varchar2({ length: 64 }).notNull(),
      createdAt: timestamp2({ mode: "string" }).defaultNow(),
      updatedBy: varchar2({ length: 64 }),
      updatedAt: timestamp2({ mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      uniqueIndex2("saas_rate_card_plan_uq").on(table.planId, table.currency),
      index2("saas_rate_card_active_idx").on(table.isActive)
    ]);
    saasBillingRateTiers = mysqlTable2("saasBillingRateTiers", {
      id: varchar2({ length: 64 }).primaryKey(),
      rateCardId: varchar2({ length: 64 }).notNull(),
      metricKey: mysqlEnum([
        "projectsCount",
        "tasksCount",
        "documentsCount",
        "storageUsedMB",
        "apiCallsCount",
        "emailsSent"
      ]).notNull(),
      tierOrder: int2().notNull(),
      unitFrom: bigint({ mode: "number" }).notNull().default(0),
      unitTo: bigint({ mode: "number" }),
      unitPriceCents: bigint({ mode: "number" }).notNull().default(0)
    }, (table) => [
      uniqueIndex2("saas_rate_tier_order_uq").on(table.rateCardId, table.metricKey, table.tierOrder),
      index2("saas_rate_tier_card_metric_idx").on(table.rateCardId, table.metricKey)
    ]);
    incomeLedgerEntries = mysqlTable2("incomeLedgerEntries", {
      id: varchar2({ length: 64 }).primaryKey(),
      ledgerScope: mysqlEnum(["tenant_income", "company_income", "saas_revenue"]).notNull(),
      organizationId: varchar2({ length: 64 }),
      entryNumber: varchar2({ length: 100 }).notNull(),
      entryDate: datetime({ mode: "string" }).notNull(),
      periodStart: date({ mode: "string" }),
      periodEnd: date({ mode: "string" }),
      sourceType: varchar2({ length: 50 }).notNull(),
      sourceId: varchar2({ length: 64 }).notNull(),
      entryType: varchar2({ length: 50 }).notNull(),
      description: varchar2({ length: 500 }).notNull(),
      currency: varchar2({ length: 3 }).notNull(),
      amountCents: bigint({ mode: "number" }).notNull(),
      usageSnapshot: json2(),
      pricingSnapshot: json2(),
      reversalOfId: varchar2({ length: 64 }),
      idempotencyKey: varchar2({ length: 255 }).notNull(),
      createdBy: varchar2({ length: 64 }),
      createdAt: timestamp2({ mode: "string" }).defaultNow()
    }, (table) => [
      uniqueIndex2("income_ledger_idempotency_uq").on(table.idempotencyKey),
      index2("income_ledger_scope_date_idx").on(table.ledgerScope, table.organizationId, table.entryDate),
      index2("income_ledger_source_idx").on(table.sourceType, table.sourceId)
    ]);
    incomeLedgerLines = mysqlTable2("incomeLedgerLines", {
      id: varchar2({ length: 64 }).primaryKey(),
      entryId: varchar2({ length: 64 }).notNull(),
      lineNumber: int2().notNull(),
      accountCode: varchar2({ length: 50 }).notNull(),
      accountName: varchar2({ length: 255 }).notNull(),
      debitCents: bigint({ mode: "number" }).notNull().default(0),
      creditCents: bigint({ mode: "number" }).notNull().default(0),
      description: varchar2({ length: 500 })
    }, (table) => [
      uniqueIndex2("income_ledger_line_number_uq").on(table.entryId, table.lineNumber),
      index2("income_ledger_line_entry_idx").on(table.entryId)
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
      urlMode: mysqlEnum(["path", "subdomain"]).default("subdomain").notNull(),
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
      organizationId: varchar2({ length: 64 }),
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
    emailMarketingSubscribers = mysqlTable2("emailMarketingSubscribers", {
      id: varchar2({ length: 64 }).primaryKey(),
      organizationId: varchar2({ length: 64 }).notNull(),
      email: varchar2({ length: 320 }).notNull(),
      name: varchar2({ length: 255 }),
      optedIn: boolean2().default(true).notNull(),
      consentAt: timestamp2({ mode: "string" }).notNull(),
      consentSource: varchar2({ length: 255 }).notNull(),
      unsubscribeToken: varchar2({ length: 64 }).notNull(),
      unsubscribedAt: timestamp2({ mode: "string" }),
      createdAt: timestamp2({ mode: "string" }).defaultNow(),
      updatedAt: timestamp2({ mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      uniqueIndex2("uq_email_marketing_subscriber_org_email").on(table.organizationId, table.email),
      uniqueIndex2("uq_email_marketing_subscriber_token").on(table.unsubscribeToken),
      index2("idx_email_marketing_subscriber_optin").on(table.organizationId, table.optedIn)
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
      templateData: json2(),
      status: mysqlEnum(["draft", "open", "in-progress", "completed", "cancelled"]).default("draft").notNull(),
      createdBy: varchar2({ length: 64 }).notNull(),
      createdAt: timestamp2({ mode: "string" }).defaultNow(),
      updatedAt: timestamp2({ mode: "string" }).defaultNow().onUpdateNow()
    });
    eSignatureRequests = mysqlTable2("eSignatureRequests", {
      id: varchar2({ length: 64 }).primaryKey(),
      organizationId: varchar2({ length: 64 }),
      workflowId: varchar2({ length: 64 }),
      documentType: varchar2({ length: 32 }),
      documentId: varchar2({ length: 64 }),
      documentHash: varchar2({ length: 64 }),
      sequence: int2().default(1).notNull(),
      title: varchar2({ length: 255 }).notNull(),
      documentContent: longtext().notNull(),
      signerName: varchar2({ length: 255 }).notNull(),
      signerEmail: varchar2({ length: 320 }).notNull(),
      signerUserId: varchar2({ length: 64 }),
      typedSignature: varchar2({ length: 255 }),
      signingToken: varchar2({ length: 128 }).notNull().unique(),
      status: mysqlEnum(["pending", "signed", "declined", "expired"]).default("pending").notNull(),
      signatureData: longtext(),
      signedAt: timestamp2({ mode: "string" }),
      verificationCodeHash: varchar2({ length: 64 }),
      verificationCodeExpiresAt: timestamp2({ mode: "string" }),
      verificationCodeSentAt: timestamp2({ mode: "string" }),
      verificationCodeAttempts: int2().default(0).notNull(),
      emailVerifiedAt: timestamp2({ mode: "string" }),
      consentAcceptedAt: timestamp2({ mode: "string" }),
      signerIp: varchar2({ length: 45 }),
      signerUserAgent: varchar2({ length: 512 }),
      expiresAt: timestamp2({ mode: "string" }),
      createdBy: varchar2({ length: 64 }).notNull(),
      createdAt: timestamp2({ mode: "string" }).defaultNow(),
      updatedAt: timestamp2({ mode: "string" }).defaultNow().onUpdateNow()
    });
    eSignatureAuditEvents = mysqlTable2("eSignatureAuditEvents", {
      id: varchar2({ length: 64 }).primaryKey(),
      requestId: varchar2({ length: 64 }).notNull(),
      workflowId: varchar2({ length: 64 }),
      eventType: varchar2({ length: 40 }).notNull(),
      actorName: varchar2({ length: 255 }),
      actorEmail: varchar2({ length: 320 }),
      ipAddress: varchar2({ length: 45 }),
      userAgent: varchar2({ length: 512 }),
      metadata: json2(),
      createdAt: timestamp2({ mode: "string" }).defaultNow()
    }, (table) => [
      index2("esign_audit_request_idx").on(table.requestId, table.createdAt),
      index2("esign_audit_workflow_idx").on(table.workflowId, table.createdAt)
    ]);
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
      serviceId: varchar2({ length: 64 }),
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
      buyerCompanyName: varchar2({ length: 200 }),
      buyerDepartment: varchar2({ length: 200 }),
      buyerContactName: varchar2({ length: 255 }),
      buyerContactTitle: varchar2({ length: 150 }),
      buyerEmail: varchar2({ length: 320 }),
      buyerPhone: varchar2({ length: 50 }),
      deliveryAddress: text2(),
      issueDate: varchar2({ length: 30 }),
      submissionDeadline: varchar2({ length: 30 }),
      targetDeliveryDate: varchar2({ length: 30 }),
      bidderLegalName: varchar2({ length: 200 }),
      bidderRegistrationNumber: varchar2({ length: 100 }),
      bidderContactName: varchar2({ length: 255 }),
      bidderEmail: varchar2({ length: 320 }),
      bidderPhone: varchar2({ length: 50 }),
      quoteValidityDays: int2().default(60),
      quoteValidUntil: varchar2({ length: 30 }),
      leadTime: varchar2({ length: 200 }),
      lineItems: json2(),
      currency: varchar2({ length: 3 }).default("KES"),
      taxRate: decimal({ precision: 5, scale: 2 }).default("0"),
      shippingAmount: int2().default(0),
      subtotal: int2().default(0),
      taxAmount: int2().default(0),
      submissionFormat: varchar2({ length: 200 }),
      submissionMethod: varchar2({ length: 100 }),
      submissionEmail: varchar2({ length: 320 }),
      emailSubjectProtocol: text2(),
      mandatoryAttachments: text2(),
      costWeight: int2().default(50),
      complianceWeight: int2().default(30),
      deliveryWeight: int2().default(20),
      nonBindingTerms: text2(),
      incoterms: varchar2({ length: 100 }),
      paymentTerms: text2(),
      settlementDays: int2(),
      buyerSignatoryName: varchar2({ length: 255 }),
      buyerSignatoryTitle: varchar2({ length: 150 }),
      bidderSignatoryName: varchar2({ length: 255 }),
      bidderSignatoryTitle: varchar2({ length: 150 }),
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
      templateData: json2(),
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
      templateData: json2(),
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
      supplier: varchar2({ length: 200 }),
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
    assetMovements = mysqlTable2("assetMovements", {
      id: varchar2({ length: 64 }).primaryKey(),
      assetId: varchar2({ length: 64 }).notNull(),
      fromLocation: varchar2({ length: 200 }).notNull(),
      toLocation: varchar2({ length: 200 }).notNull(),
      fromAssignedTo: varchar2({ length: 200 }),
      toAssignedTo: varchar2({ length: 200 }),
      movedAt: varchar2({ length: 30 }).notNull(),
      reason: varchar2({ length: 500 }).notNull(),
      notes: text2(),
      movedBy: varchar2({ length: 64 }).notNull(),
      createdAt: timestamp2({ mode: "string" }).defaultNow()
    }, (table) => [
      index2("idx_asset_movements_asset_date").on(table.assetId, table.movedAt)
    ]);
    contracts = mysqlTable2("contracts", {
      id: varchar2({ length: 64 }).primaryKey(),
      organizationId: varchar2({ length: 64 }),
      contractNumber: varchar2({ length: 50 }),
      name: varchar2({ length: 200 }).notNull(),
      vendor: varchar2({ length: 200 }).notNull(),
      startDate: varchar2({ length: 30 }).notNull(),
      endDate: varchar2({ length: 30 }).notNull(),
      value: bigint({ mode: "number" }).default(0).notNull(),
      status: mysqlEnum(["draft", "active", "expired", "terminated"]).default("draft").notNull(),
      contractType: varchar2({ length: 100 }),
      description: text2(),
      notes: text2(),
      counterpartyContactName: varchar2({ length: 255 }),
      counterpartyEmail: varchar2({ length: 320 }),
      counterpartyAddress: text2(),
      counterpartyRegistrationNumber: varchar2({ length: 100 }),
      governingLaw: varchar2({ length: 100 }).default("Kenya"),
      currency: varchar2({ length: 3 }).default("KES"),
      paymentTerms: text2(),
      terminationTerms: text2(),
      terminatedAt: varchar2({ length: 30 }),
      terminationReason: text2(),
      terminatedBy: varchar2({ length: 36 }),
      confidentialityTerms: text2(),
      disputeResolution: text2(),
      signingStatus: varchar2({ length: 32 }).default("not_sent").notNull(),
      signingWorkflowId: varchar2({ length: 64 }),
      signedDocumentHtml: longtext(),
      signedDocumentHash: varchar2({ length: 64 }),
      signedAt: timestamp2({ mode: "string" }),
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
    globalAccountingPolicies = mysqlTable2("globalAccountingPolicies", {
      id: varchar2({ length: 32 }).primaryKey(),
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
    });
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
      templateData: json2(),
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
    reconciliationRules = mysqlTable2("reconciliation_rules", {
      id: varchar2({ length: 64 }).primaryKey(),
      organizationId: varchar2({ length: 64 }),
      name: varchar2({ length: 100 }).notNull(),
      targetField: mysqlEnum(["description", "amount"]).default("description").notNull(),
      operator: mysqlEnum(["contains", "starts_with", "equals"]).default("contains").notNull(),
      valueToMatch: varchar2({ length: 255 }).notNull(),
      action: mysqlEnum(["auto_match_category", "flag_for_review"]).default("flag_for_review").notNull(),
      targetEntityId: varchar2({ length: 64 }),
      priority: int2().default(100).notNull(),
      isActive: tinyint().default(1).notNull(),
      createdBy: varchar2({ length: 64 }).notNull(),
      createdAt: timestamp2({ mode: "string" }).defaultNow(),
      updatedAt: timestamp2({ mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("recon_rule_org_priority_idx").on(table.organizationId, table.isActive, table.priority)
    ]);
    reconciliationMatchAllocations = mysqlTable2("reconciliation_match_allocations", {
      id: varchar2({ length: 64 }).primaryKey(),
      itemId: varchar2({ length: 64 }).notNull(),
      sourceType: mysqlEnum(["payment", "expense", "non_sales_inflow"]).notNull(),
      sourceId: varchar2({ length: 64 }).notNull(),
      allocatedAmount: bigint({ mode: "number" }).notNull(),
      createdBy: varchar2({ length: 64 }).notNull(),
      createdAt: timestamp2({ mode: "string" }).defaultNow()
    }, (table) => [
      uniqueIndex2("recon_match_allocation_source_uq").on(table.itemId, table.sourceType, table.sourceId),
      index2("recon_match_allocation_source_idx").on(table.sourceType, table.sourceId)
    ]);
    reconciliationAuditEvents = mysqlTable2("reconciliation_audit_events", {
      id: varchar2({ length: 64 }).primaryKey(),
      organizationId: varchar2({ length: 64 }),
      sessionId: varchar2({ length: 64 }),
      itemId: varchar2({ length: 64 }),
      actorUserId: varchar2({ length: 64 }).notNull(),
      eventType: varchar2({ length: 50 }).notNull(),
      details: json2(),
      createdAt: timestamp2({ mode: "string" }).defaultNow().notNull()
    }, (table) => [
      index2("recon_audit_org_time_idx").on(table.organizationId, table.createdAt),
      index2("recon_audit_session_idx").on(table.sessionId, table.createdAt)
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
    partnerProfiles = mysqlTable2("partner_profiles", {
      id: varchar2("id", { length: 64 }).primaryKey(),
      userId: varchar2("userId", { length: 64 }),
      name: varchar2("name", { length: 255 }).notNull(),
      email: varchar2("email", { length: 320 }).notNull(),
      company: varchar2("company", { length: 255 }),
      phone: varchar2("phone", { length: 50 }),
      website: varchar2("website", { length: 500 }),
      partnerType: varchar2("partnerType", { length: 30 }).notNull(),
      status: varchar2("status", { length: 30 }).notNull().default("pending"),
      referralCode: varchar2("referralCode", { length: 80 }).notNull(),
      commissionRate: decimal("commissionRate", { precision: 5, scale: 2 }).default("15"),
      notes: text2("notes"),
      createdAt: timestamp2("createdAt", { mode: "string" }).defaultNow(),
      updatedAt: timestamp2("updatedAt", { mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_partner_profiles_email").on(table.email),
      index2("idx_partner_profiles_status").on(table.status),
      index2("idx_partner_profiles_code").on(table.referralCode)
    ]);
    partnerReferrals = mysqlTable2("partner_referrals", {
      id: varchar2("id", { length: 64 }).primaryKey(),
      partnerId: varchar2("partnerId", { length: 64 }).notNull(),
      referredName: varchar2("referredName", { length: 255 }),
      referredEmail: varchar2("referredEmail", { length: 320 }).notNull(),
      organizationId: varchar2("organizationId", { length: 64 }),
      source: varchar2("source", { length: 100 }).default("partner"),
      status: varchar2("status", { length: 30 }).notNull().default("submitted"),
      convertedAt: timestamp2("convertedAt", { mode: "string" }),
      notes: text2("notes"),
      createdAt: timestamp2("createdAt", { mode: "string" }).defaultNow(),
      updatedAt: timestamp2("updatedAt", { mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_partner_referrals_partner").on(table.partnerId),
      index2("idx_partner_referrals_email").on(table.referredEmail),
      index2("idx_partner_referrals_status").on(table.status)
    ]);
    partnerCommissions = mysqlTable2("partner_commissions", {
      id: varchar2("id", { length: 64 }).primaryKey(),
      partnerId: varchar2("partnerId", { length: 64 }).notNull(),
      referralId: varchar2("referralId", { length: 64 }),
      dealId: varchar2("dealId", { length: 64 }),
      amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
      currency: varchar2("currency", { length: 10 }).notNull().default("KES"),
      status: varchar2("status", { length: 30 }).notNull().default("pending"),
      earnedAt: timestamp2("earnedAt", { mode: "string" }).defaultNow(),
      payableAt: timestamp2("payableAt", { mode: "string" }),
      paidAt: timestamp2("paidAt", { mode: "string" }),
      notes: text2("notes"),
      createdAt: timestamp2("createdAt", { mode: "string" }).defaultNow()
    }, (table) => [
      index2("idx_partner_commissions_partner").on(table.partnerId),
      index2("idx_partner_commissions_status").on(table.status)
    ]);
    partnerPayouts = mysqlTable2("partner_payouts", {
      id: varchar2("id", { length: 64 }).primaryKey(),
      partnerId: varchar2("partnerId", { length: 64 }).notNull(),
      amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
      currency: varchar2("currency", { length: 10 }).notNull().default("KES"),
      method: varchar2("method", { length: 50 }).notNull(),
      reference: varchar2("reference", { length: 255 }),
      status: varchar2("status", { length: 30 }).notNull().default("requested"),
      requestedAt: timestamp2("requestedAt", { mode: "string" }).defaultNow(),
      processedAt: timestamp2("processedAt", { mode: "string" }),
      notes: text2("notes")
    }, (table) => [
      index2("idx_partner_payouts_partner").on(table.partnerId),
      index2("idx_partner_payouts_status").on(table.status)
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
      payrollId: varchar2({ length: 64 }).notNull(),
      itemType: varchar2({ length: 50 }).notNull(),
      itemId: varchar2({ length: 64 }),
      description: varchar2({ length: 255 }),
      amount: int2().notNull().default(0),
      isDeduction: tinyint().default(0).notNull(),
      lineNumber: int2(),
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
      organizationId: varchar2({ length: 64 }),
      payrollId: varchar2({ length: 64 }),
      payrollDetailId: varchar2({ length: 64 }),
      employeeId: varchar2({ length: 64 }).notNull(),
      payslipNumber: varchar2({ length: 50 }).notNull().unique(),
      payPeriod: varchar2({ length: 20 }).notNull(),
      payDate: datetime({ mode: "string" }),
      payPeriodStart: datetime({ mode: "string" }),
      payPeriodEnd: datetime({ mode: "string" }),
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
      allowancesBreakdown: text2(),
      deductionsBreakdown: text2(),
      htmlContent: longtext(),
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
      approvalStatus: mysqlEnum(["pending", "approved", "rejected", "returned"]).notNull(),
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
    trainingPrograms = mysqlTable2("trainingPrograms", {
      id: varchar2({ length: 64 }).primaryKey(),
      organizationId: varchar2({ length: 64 }),
      name: varchar2({ length: 200 }).notNull(),
      description: text2(),
      category: varchar2({ length: 100 }),
      trainer: varchar2({ length: 200 }),
      startDate: date({ mode: "string" }),
      endDate: date({ mode: "string" }),
      maxParticipants: int2(),
      cost: int2().default(0),
      location: varchar2({ length: 200 }),
      isOnline: tinyint().default(0).notNull(),
      isMandatory: tinyint().default(0).notNull(),
      status: mysqlEnum(["active", "completed", "cancelled", "draft"]).default("active").notNull(),
      createdBy: varchar2({ length: 64 }),
      createdAt: timestamp2({ mode: "string" }).defaultNow(),
      updatedAt: timestamp2({ mode: "string" }).defaultNow().onUpdateNow()
    });
    trainingEnrollments = mysqlTable2("trainingEnrollments", {
      id: varchar2({ length: 64 }).primaryKey(),
      organizationId: varchar2({ length: 64 }).notNull(),
      courseId: varchar2({ length: 64 }),
      programId: varchar2({ length: 64 }),
      employeeId: varchar2({ length: 64 }).notNull(),
      enrollmentDate: datetime({ mode: "string" }),
      enrolledAt: datetime({ mode: "string" }),
      enrolledBy: varchar2({ length: 64 }),
      status: mysqlEnum(["enrolled", "in_progress", "completed", "dropped", "passed", "failed"]).default("enrolled").notNull(),
      attendancePercentage: int2().default(0),
      score: int2().default(0),
      certificateIssued: tinyint().default(0),
      certificate: varchar2({ length: 500 }),
      certificateDate: datetime({ mode: "string" }),
      certificateUrl: varchar2({ length: 500 }),
      completedAt: datetime({ mode: "string" }),
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
      jobGroupId: varchar2({ length: 64 }),
      templateId: varchar2({ length: 64 }),
      type: mysqlEnum(["onboarding", "offboarding"]),
      assignedTo: varchar2({ length: 64 }),
      createdBy: varchar2({ length: 64 }),
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
      templateId: varchar2({ length: 64 }),
      title: varchar2({ length: 255 }),
      taskName: varchar2({ length: 255 }).notNull(),
      category: mysqlEnum(["it_setup", "paperwork", "training", "introduction", "other"]).default("other").notNull(),
      description: text2(),
      assignedTo: varchar2({ length: 64 }),
      // HR, Manager, IT, etc.
      dueDate: datetime({ mode: "string" }),
      completedDate: datetime({ mode: "string" }),
      completedAt: datetime({ mode: "string" }),
      completedBy: varchar2({ length: 64 }),
      status: mysqlEnum(["pending", "in_progress", "completed", "skipped"]).default("pending").notNull(),
      priority: mysqlEnum(["low", "medium", "high"]).default("medium").notNull(),
      isRequired: tinyint().default(1).notNull(),
      sortOrder: int2().default(0).notNull(),
      notes: text2(),
      createdAt: timestamp2({ mode: "string" }).defaultNow(),
      updatedAt: timestamp2({ mode: "string" }).defaultNow().onUpdateNow()
    }, (table) => [
      index2("idx_ot_org").on(table.organizationId),
      index2("idx_ot_checklist").on(table.checklistId),
      index2("idx_ot_category").on(table.category),
      index2("idx_ot_status").on(table.status)
    ]);
    onboardingTemplates = mysqlTable2("onboardingTemplates", {
      id: varchar2({ length: 64 }).primaryKey(),
      organizationId: varchar2({ length: 64 }),
      name: varchar2({ length: 255 }).notNull(),
      description: text2(),
      type: mysqlEnum(["onboarding", "offboarding"]).notNull(),
      createdBy: varchar2({ length: 64 }),
      createdAt: timestamp2({ mode: "string" }),
      updatedAt: timestamp2({ mode: "string" })
    });
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
var guestClients2, reminders2, scheduledReminders2, communicationLogs2, inventoryTransactions2, stockAlerts2, systemSettings2, auditLogs2, userPermissions2, salaryStructures, salaryAllowances, salaryDeductions, employeeBenefits, payrollComponentMappings, payrollDetails2, payrollApprovals, employeeTaxInfo, salaryIncrements, employeeDisciplinaryActions, employeeDepartmentMovements, payslips2, departmentalHeads, p9Forms, lpos2, lpoLineItems, deliveryNoteLineItems, grnLineItems, journalEntryReconciliations, imprests2, imprestSurrenders2, projectTeamMembers, invoicePayments, serviceTemplates, serviceUsageTracking, projectBudgets, departmentBudgets, ledgerBudgets, budgetAllocations, organizationAccountingPolicies2, journalEntries2, journalEntryLines2, purchaseOrders2, purchaseOrderItems2, goodsReceiptNotes2, leads2, automationConfigs2, workflowAutomationLogs2, performanceReviews2, tickets2, ticketComments, ticketTasks, suppliers, supplierRatings, supplierAudits, quotes, lineItems2, quoteLogs, userTablePreferences, organizationMembers;
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
      departmentIdOverride: varchar3("departmentIdOverride", { length: 64 }),
      glAccountId: varchar3("glAccountId", { length: 64 }),
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
      departmentIdOverride: varchar3("departmentIdOverride", { length: 64 }),
      glAccountId: varchar3("glAccountId", { length: 64 }),
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
      departmentIdOverride: varchar3("departmentIdOverride", { length: 64 }),
      glAccountId: varchar3("glAccountId", { length: 64 }),
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
    payrollComponentMappings = mysqlTable3("payrollComponentMappings", {
      id: varchar3("id", { length: 64 }).primaryKey(),
      organizationId: varchar3("organizationId", { length: 64 }),
      componentType: varchar3("componentType", { length: 50 }).notNull(),
      componentName: varchar3("componentName", { length: 100 }).notNull(),
      accountId: varchar3("accountId", { length: 64 }).notNull(),
      createdBy: varchar3("createdBy", { length: 64 }),
      createdAt: timestamp3("createdAt").defaultNow(),
      updatedAt: timestamp3("updatedAt").defaultNow()
    }, (table) => ({
      organizationIdx: index3("payroll_component_mapping_org_idx").on(table.organizationId),
      componentIdx: index3("payroll_component_mapping_component_idx").on(table.componentType, table.componentName)
    }));
    payrollDetails2 = mysqlTable3("payrollDetails", {
      id: varchar3("id", { length: 64 }).primaryKey(),
      payrollId: varchar3("payrollId", { length: 64 }).notNull(),
      itemType: varchar3("itemType", { length: 50 }).notNull(),
      itemId: varchar3("itemId", { length: 64 }),
      description: varchar3("description", { length: 255 }),
      isDeduction: boolean3("isDeduction").default(false).notNull(),
      lineNumber: int3("lineNumber"),
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
      organizationId: varchar3("organizationId", { length: 64 }),
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
      templateData: json3("templateData"),
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
          "cheque",
          "mpesa",
          "card",
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
        budgetCode: varchar3("budgetCode", { length: 100 }),
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
        accountId: varchar3("accountId", { length: 64 }),
        // Chart of accounts tag; legacy allocations may not have one
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
      costCenterId: varchar3("costCenterId", { length: 36 }),
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

// server/utils/databasePoolConfig.ts
function resolveDbConnectionLimit(value) {
  if (value === void 0 || value.trim() === "") return DEFAULT_DB_CONNECTION_LIMIT;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return DEFAULT_DB_CONNECTION_LIMIT;
  return Math.min(Math.max(parsed, 1), MAX_DB_CONNECTION_LIMIT);
}
var DEFAULT_DB_CONNECTION_LIMIT, MAX_DB_CONNECTION_LIMIT;
var init_databasePoolConfig = __esm({
  "server/utils/databasePoolConfig.ts"() {
    DEFAULT_DB_CONNECTION_LIMIT = 6;
    MAX_DB_CONNECTION_LIMIT = 10;
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
      platformOwnerId: process.env.KIINI_OWNER_ID ?? "",
      isProduction: process.env.NODE_ENV === "production",
      groqApiKey: process.env.GROQ_API_KEY ?? "",
      groqModel: process.env.GROQ_MODEL ?? "",
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

// server/services/tierPricing.ts
var init_tierPricing = __esm({
  "server/services/tierPricing.ts"() {
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
    "eSignatureAuditEvents",
    "backup_history",
    "clients",
    "expenses",
    "recurringExpenses",
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
    "onboardingChecklists",
    "onboardingTasks",
    "onboardingTemplates",
    "trainingEnrollments",
    "trainingPrograms",
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
    "serviceInvoiceItems",
    "serviceTemplates",
    "emailQueue",
    "emailTemplates",
    "proposalTemplates",
    "contractTemplates",
    "proposals",
    "contracts",
    "scheduledJobs",
    "jobExecutionLogs",
    "jobAlertRules",
    "jobAlertHistory",
    "jobHeartbeat",
    "projects",
    "projectTasks",
    "budgetAllocations",
    "partner_profiles",
    "partner_referrals",
    "partner_commissions",
    "partner_payouts"
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
      settings: [
        { name: "value", definition: "longtext NULL" },
        { name: "category", definition: "varchar(100) NULL" },
        { name: "description", definition: "text NULL" },
        { name: "updatedBy", definition: "varchar(64) NULL" },
        { name: "updatedAt", definition: "timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP" }
      ],
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
        { name: "projectId", definition: "varchar(64) NULL" },
        { name: "category", definition: "varchar(100) NULL" },
        { name: "approvedBy", definition: "varchar(64) NULL" },
        { name: "approvedAt", definition: "datetime NULL" },
        { name: "accountManagerId", definition: "varchar(64) NULL" },
        { name: "paymentPlanId", definition: "varchar(64) NULL" },
        { name: "isAutoRecurring", definition: "tinyint NULL DEFAULT 0" },
        { name: "recurringInvoiceId", definition: "varchar(64) NULL" },
        { name: "clientSubscriptionId", definition: "varchar(64) NULL" }
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
      proposals: [
        { name: "organizationId", definition: "varchar(64) NULL" },
        { name: "description", definition: "longtext NULL" },
        { name: "deliverables", definition: "longtext NULL" },
        { name: "timeline", definition: "text NULL" },
        { name: "assumptions", definition: "text NULL" },
        { name: "exclusions", definition: "text NULL" },
        { name: "terms", definition: "longtext NULL" },
        { name: "currency", definition: "varchar(3) NULL DEFAULT 'KES'" },
        { name: "lineItems", definition: "json NULL" },
        { name: "signingStatus", definition: "varchar(32) NOT NULL DEFAULT 'not_sent'" },
        { name: "signingWorkflowId", definition: "varchar(64) NULL" },
        { name: "signedDocumentHtml", definition: "longtext NULL" },
        { name: "signedDocumentHash", definition: "varchar(64) NULL" },
        { name: "signedAt", definition: "timestamp NULL" }
      ],
      contracts: [
        { name: "counterpartyContactName", definition: "varchar(255) NULL" },
        { name: "counterpartyEmail", definition: "varchar(320) NULL" },
        { name: "counterpartyAddress", definition: "text NULL" },
        { name: "counterpartyRegistrationNumber", definition: "varchar(100) NULL" },
        { name: "governingLaw", definition: "varchar(100) NULL DEFAULT 'Kenya'" },
        { name: "currency", definition: "varchar(3) NULL DEFAULT 'KES'" },
        { name: "paymentTerms", definition: "text NULL" },
        { name: "terminationTerms", definition: "text NULL" },
        { name: "confidentialityTerms", definition: "text NULL" },
        { name: "disputeResolution", definition: "text NULL" },
        { name: "signingStatus", definition: "varchar(32) NOT NULL DEFAULT 'not_sent'" },
        { name: "signingWorkflowId", definition: "varchar(64) NULL" },
        { name: "signedDocumentHtml", definition: "longtext NULL" },
        { name: "signedDocumentHash", definition: "varchar(64) NULL" },
        { name: "signedAt", definition: "timestamp NULL" }
      ],
      esignaturerequests: [
        { name: "organizationId", definition: "varchar(64) NULL" },
        { name: "workflowId", definition: "varchar(64) NULL" },
        { name: "documentType", definition: "varchar(32) NULL" },
        { name: "documentId", definition: "varchar(64) NULL" },
        { name: "documentHash", definition: "varchar(64) NULL" },
        { name: "sequence", definition: "int NOT NULL DEFAULT 1" },
        { name: "signerUserId", definition: "varchar(64) NULL" },
        { name: "typedSignature", definition: "varchar(255) NULL" },
        { name: "verificationCodeHash", definition: "varchar(64) NULL" },
        { name: "verificationCodeExpiresAt", definition: "timestamp NULL" },
        { name: "verificationCodeSentAt", definition: "timestamp NULL" },
        { name: "verificationCodeAttempts", definition: "int NOT NULL DEFAULT 0" },
        { name: "emailVerifiedAt", definition: "timestamp NULL" },
        { name: "consentAcceptedAt", definition: "timestamp NULL" },
        { name: "signerIp", definition: "varchar(45) NULL" },
        { name: "signerUserAgent", definition: "varchar(512) NULL" }
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
        { name: "urlMode", definition: "enum('path','subdomain') NOT NULL DEFAULT 'subdomain'" },
        { name: "updatedAt", definition: "timestamp NULL DEFAULT CURRENT_TIMESTAMP" }
      ],
      payslips: [
        { name: "payrollId", definition: "varchar(64) NULL" },
        { name: "payPeriod", definition: "varchar(20) NULL" },
        { name: "payDate", definition: "datetime NULL" },
        { name: "payPeriodStart", definition: "datetime NULL" },
        { name: "payPeriodEnd", definition: "datetime NULL" },
        { name: "payMonth", definition: "datetime NULL" },
        { name: "payslipNumber", definition: "varchar(50) NULL" },
        { name: "payrollDetailId", definition: "varchar(64) NULL" },
        { name: "allowancesBreakdown", definition: "text NULL" },
        { name: "deductionsBreakdown", definition: "text NULL" },
        { name: "htmlContent", definition: "longtext NULL" }
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
        { name: "payrollId", definition: "varchar(64) NULL" },
        { name: "itemType", definition: "varchar(50) NULL" },
        { name: "itemId", definition: "varchar(64) NULL" },
        { name: "description", definition: "varchar(255) NULL" },
        { name: "amount", definition: "int NOT NULL DEFAULT 0" },
        { name: "isDeduction", definition: "tinyint NOT NULL DEFAULT 0" },
        { name: "lineNumber", definition: "int NULL" },
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
        { name: "postalCode", definition: "varchar(20) NULL" },
        { name: "taxId", definition: "varchar(100) NULL" },
        { name: "website", definition: "varchar(255) NULL" },
        { name: "industry", definition: "varchar(100) NULL" },
        { name: "category", definition: "varchar(100) NULL" },
        { name: "status", definition: "enum('active','inactive','prospect','archived') NOT NULL DEFAULT 'active'" },
        { name: "assignedTo", definition: "varchar(64) NULL" },
        { name: "notes", definition: "text NULL" },
        { name: "createdBy", definition: "varchar(64) NULL" },
        { name: "createdAt", definition: "timestamp NULL" },
        { name: "updatedAt", definition: "timestamp NULL" },
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
      expenses: [
        { name: "organizationId", definition: "varchar(64) NULL" },
        { name: "expenseNumber", definition: "varchar(100) NULL" },
        { name: "budgetAllocationId", definition: "varchar(64) NULL" },
        { name: "approvedBy", definition: "varchar(64) NULL" },
        { name: "approvedAt", definition: "datetime NULL" },
        { name: "chartOfAccountId", definition: "varchar(64) NULL" }
      ],
      budgetallocations: [
        { name: "accountId", definition: "varchar(64) NULL" }
      ],
      recurringexpenses: [
        { name: "organizationId", definition: "varchar(64) NULL" },
        { name: "chartOfAccountId", definition: "varchar(64) NULL" }
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
        { name: "category", definition: "varchar(100) NULL" },
        { name: "tags", definition: "text NULL" },
        { name: "notes", definition: "text NULL" }
      ],
      projecttasks: [
        { name: "clientId", definition: "varchar(64) NULL" },
        { name: "tags", definition: "text NULL" },
        { name: "targetDate", definition: "datetime NULL" },
        { name: "billable", definition: "tinyint NOT NULL DEFAULT 1" },
        { name: "visibleToClient", definition: "tinyint NOT NULL DEFAULT 1" }
      ],
      onboardingchecklists: [
        { name: "templateId", definition: "varchar(64) NULL" },
        { name: "type", definition: "enum('onboarding','offboarding') NULL" },
        { name: "assignedTo", definition: "varchar(64) NULL" },
        { name: "createdBy", definition: "varchar(64) NULL" }
      ],
      onboardingtasks: [
        { name: "templateId", definition: "varchar(64) NULL" },
        { name: "title", definition: "varchar(255) NULL" },
        { name: "completedAt", definition: "datetime NULL" },
        { name: "isRequired", definition: "tinyint NOT NULL DEFAULT 1" },
        { name: "sortOrder", definition: "int NOT NULL DEFAULT 0" }
      ],
      trainingenrollments: [
        { name: "programId", definition: "varchar(64) NULL" },
        { name: "enrolledAt", definition: "datetime NULL" },
        { name: "enrolledBy", definition: "varchar(64) NULL" },
        { name: "certificate", definition: "varchar(500) NULL" },
        { name: "completedAt", definition: "datetime NULL" }
      ],
      trainingprograms: [
        { name: "organizationId", definition: "varchar(64) NULL" },
        { name: "name", definition: "varchar(200) NULL" },
        { name: "description", definition: "text NULL" },
        { name: "category", definition: "varchar(100) NULL" },
        { name: "trainer", definition: "varchar(200) NULL" },
        { name: "startDate", definition: "date NULL" },
        { name: "endDate", definition: "date NULL" },
        { name: "maxParticipants", definition: "int NULL" },
        { name: "cost", definition: "int NULL DEFAULT 0" },
        { name: "location", definition: "varchar(200) NULL" },
        { name: "isOnline", definition: "tinyint NOT NULL DEFAULT 0" },
        { name: "isMandatory", definition: "tinyint NOT NULL DEFAULT 0" },
        { name: "status", definition: "enum('active','completed','cancelled','draft') NOT NULL DEFAULT 'active'" },
        { name: "createdBy", definition: "varchar(64) NULL" },
        { name: "createdAt", definition: "timestamp NULL DEFAULT CURRENT_TIMESTAMP" },
        { name: "updatedAt", definition: "timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP" }
      ],
      onboardingtemplates: [
        { name: "organizationId", definition: "varchar(64) NULL" },
        { name: "name", definition: "varchar(255) NULL" },
        { name: "description", definition: "text NULL" },
        { name: "type", definition: "enum('onboarding','offboarding') NULL" },
        { name: "createdBy", definition: "varchar(64) NULL" },
        { name: "createdAt", definition: "timestamp NULL DEFAULT CURRENT_TIMESTAMP" },
        { name: "updatedAt", definition: "timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP" }
      ],
      // Organization isolation columns (multi-tenant support)
      payments: [
        {
          name: "organizationId",
          definition: "varchar(64) NULL"
        },
        { name: "accountId", definition: "varchar(64) NULL" },
        { name: "chartOfAccountType", definition: "enum('debit','credit') NULL DEFAULT 'debit'" },
        { name: "chartOfAccountId", definition: "varchar(64) NULL" }
      ],
      receipts: [
        {
          name: "organizationId",
          definition: "varchar(64) NULL"
        },
        { name: "subtotal", definition: "int NOT NULL DEFAULT 0" },
        { name: "taxAmount", definition: "int NOT NULL DEFAULT 0" },
        { name: "discountAmount", definition: "int NOT NULL DEFAULT 0" },
        { name: "status", definition: "enum('draft','issued','void') NOT NULL DEFAULT 'issued'" },
        { name: "approvedBy", definition: "varchar(64) NULL" },
        { name: "approvedAt", definition: "datetime NULL" }
      ],
      estimates: [
        {
          name: "organizationId",
          definition: "varchar(64) NULL"
        },
        {
          name: "projectId",
          definition: "varchar(64) NULL"
        },
        {
          name: "category",
          definition: "varchar(100) NULL"
        }
      ],
      serviceinvoiceitems: [
        {
          name: "serviceId",
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
        },
        { name: "supplier", definition: "varchar(255) NULL" },
        { name: "reorderLevel", definition: "int NULL" },
        { name: "reorderQuantity", definition: "int NULL" },
        { name: "lastRestockDate", definition: "timestamp NULL" },
        { name: "maxStockLevel", definition: "int NULL" },
        { name: "location", definition: "varchar(255) NULL" },
        { name: "barcode", definition: "varchar(100) NULL" },
        { name: "batchNumber", definition: "varchar(100) NULL" },
        { name: "manufacturingDate", definition: "varchar(50) NULL" },
        { name: "expiryDate", definition: "varchar(50) NULL" },
        { name: "warrantyMonths", definition: "int NULL DEFAULT 0" },
        { name: "hsCode", definition: "varchar(50) NULL" },
        { name: "weight", definition: "varchar(20) NULL" },
        { name: "weightUnit", definition: "varchar(20) NULL DEFAULT 'kg'" },
        { name: "warehouseLocation", definition: "varchar(255) NULL" }
      ],
      services: [
        {
          name: "organizationId",
          definition: "varchar(64) NULL"
        },
        { name: "name", definition: "varchar(255) NULL" },
        { name: "description", definition: "text NULL" },
        { name: "category", definition: "varchar(100) NULL" },
        { name: "hourlyRate", definition: "int NULL" },
        { name: "fixedPrice", definition: "int NULL" },
        { name: "unit", definition: "varchar(50) NULL DEFAULT 'hour'" },
        { name: "taxRate", definition: "int NULL DEFAULT 0" },
        { name: "deliverables", definition: "text NULL" },
        { name: "isActive", definition: "tinyint NOT NULL DEFAULT 1" },
        { name: "createdBy", definition: "varchar(64) NULL" },
        { name: "createdAt", definition: "timestamp NULL" },
        { name: "updatedAt", definition: "timestamp NULL" }
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
        },
        { name: "category", definition: "varchar(100) NULL" }
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
      ],
      partner_profiles: [
        { name: "id", definition: "varchar(64) NULL" },
        { name: "userId", definition: "varchar(64) NULL" },
        { name: "name", definition: "varchar(255) NOT NULL DEFAULT ''" },
        { name: "email", definition: "varchar(320) NOT NULL DEFAULT ''" },
        { name: "company", definition: "varchar(255) NULL" },
        { name: "phone", definition: "varchar(50) NULL" },
        { name: "website", definition: "varchar(500) NULL" },
        { name: "partnerType", definition: "varchar(30) NOT NULL DEFAULT 'affiliate'" },
        { name: "status", definition: "varchar(30) NOT NULL DEFAULT 'pending'" },
        { name: "referralCode", definition: "varchar(80) NOT NULL DEFAULT ''" },
        { name: "commissionRate", definition: "decimal(5,2) NULL DEFAULT 15" },
        { name: "notes", definition: "text NULL" },
        { name: "createdAt", definition: "timestamp NULL DEFAULT CURRENT_TIMESTAMP" },
        { name: "updatedAt", definition: "timestamp NULL DEFAULT CURRENT_TIMESTAMP" }
      ],
      partner_referrals: [
        { name: "id", definition: "varchar(64) NULL" },
        { name: "partnerId", definition: "varchar(64) NOT NULL DEFAULT ''" },
        { name: "referredName", definition: "varchar(255) NULL" },
        { name: "referredEmail", definition: "varchar(320) NOT NULL DEFAULT ''" },
        { name: "organizationId", definition: "varchar(64) NULL" },
        { name: "source", definition: "varchar(100) NULL DEFAULT 'partner'" },
        { name: "status", definition: "varchar(30) NOT NULL DEFAULT 'submitted'" },
        { name: "convertedAt", definition: "timestamp NULL" },
        { name: "notes", definition: "text NULL" },
        { name: "createdAt", definition: "timestamp NULL DEFAULT CURRENT_TIMESTAMP" },
        { name: "updatedAt", definition: "timestamp NULL DEFAULT CURRENT_TIMESTAMP" }
      ],
      partner_commissions: [
        { name: "id", definition: "varchar(64) NULL" },
        { name: "partnerId", definition: "varchar(64) NOT NULL DEFAULT ''" },
        { name: "referralId", definition: "varchar(64) NULL" },
        { name: "dealId", definition: "varchar(64) NULL" },
        { name: "amount", definition: "decimal(15,2) NOT NULL DEFAULT 0" },
        { name: "currency", definition: "varchar(10) NOT NULL DEFAULT 'KES'" },
        { name: "status", definition: "varchar(30) NOT NULL DEFAULT 'pending'" },
        { name: "earnedAt", definition: "timestamp NULL DEFAULT CURRENT_TIMESTAMP" },
        { name: "payableAt", definition: "timestamp NULL" },
        { name: "paidAt", definition: "timestamp NULL" },
        { name: "notes", definition: "text NULL" },
        { name: "createdAt", definition: "timestamp NULL DEFAULT CURRENT_TIMESTAMP" }
      ],
      partner_payouts: [
        { name: "id", definition: "varchar(64) NULL" },
        { name: "partnerId", definition: "varchar(64) NOT NULL DEFAULT ''" },
        { name: "amount", definition: "decimal(15,2) NOT NULL DEFAULT 0" },
        { name: "currency", definition: "varchar(10) NOT NULL DEFAULT 'KES'" },
        { name: "method", definition: "varchar(50) NOT NULL DEFAULT 'bank'" },
        { name: "reference", definition: "varchar(255) NULL" },
        { name: "status", definition: "varchar(30) NOT NULL DEFAULT 'requested'" },
        { name: "requestedAt", definition: "timestamp NULL DEFAULT CURRENT_TIMESTAMP" },
        { name: "processedAt", definition: "timestamp NULL" },
        { name: "notes", definition: "text NULL" }
      ]
    };
    legacyTableCatalog = {
      settings: {
        name: "settings",
        createSql: `CREATE TABLE IF NOT EXISTS settings (
      id VARCHAR(64) NOT NULL PRIMARY KEY,
      \`key\` VARCHAR(100) NOT NULL,
      value LONGTEXT NULL,
      category VARCHAR(100) NULL,
      description TEXT NULL,
      updatedBy VARCHAR(64) NULL,
      updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX key_idx (\`key\`),
      INDEX category_idx (category)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
      },
      organizationSettings: {
        name: "organizationSettings",
        createSql: `CREATE TABLE IF NOT EXISTS organizationSettings (
      id VARCHAR(64) NOT NULL PRIMARY KEY,
      organizationId VARCHAR(64) NOT NULL,
      \`key\` VARCHAR(100) NOT NULL,
      value LONGTEXT NULL,
      category VARCHAR(100) NOT NULL,
      description TEXT NULL,
      updatedBy VARCHAR(64) NULL,
      updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY org_settings_scope_key_idx (organizationId, category, \`key\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
      },
      budgetAllocations: {
        name: "budgetAllocations",
        createSql: `CREATE TABLE IF NOT EXISTS budgetAllocations (
      id VARCHAR(64) NOT NULL PRIMARY KEY,
      budgetId VARCHAR(64) NOT NULL,
      accountId VARCHAR(64) NULL,
      categoryName VARCHAR(255) NOT NULL,
      allocatedAmount INT NOT NULL,
      spentAmount INT NOT NULL DEFAULT 0,
      notes TEXT NULL,
      createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX allocation_budget_idx (budgetId)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
      },
      onboardingChecklists: {
        name: "onboardingChecklists",
        createSql: `CREATE TABLE IF NOT EXISTS onboardingChecklists (
      id VARCHAR(64) NOT NULL PRIMARY KEY,
      organizationId VARCHAR(64) NOT NULL,
      employeeId VARCHAR(64) NOT NULL,
      jobGroupId VARCHAR(64) NULL,
      templateId VARCHAR(64) NULL,
      type ENUM('onboarding','offboarding') NULL,
      assignedTo VARCHAR(64) NULL,
      startDate DATETIME NOT NULL,
      probationEndDate DATETIME NULL,
      overallProgress INT NULL DEFAULT 0,
      status ENUM('in_progress','completed','paused') NOT NULL DEFAULT 'in_progress',
      completedDate DATETIME NULL,
      notes TEXT NULL,
      createdBy VARCHAR(64) NULL,
      createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
      },
      onboardingTasks: {
        name: "onboardingTasks",
        createSql: `CREATE TABLE IF NOT EXISTS onboardingTasks (
      id VARCHAR(64) NOT NULL PRIMARY KEY,
      organizationId VARCHAR(64) NOT NULL,
      checklistId VARCHAR(64) NOT NULL,
      templateId VARCHAR(64) NULL,
      title VARCHAR(255) NULL,
      taskName VARCHAR(255) NOT NULL,
      category ENUM('it_setup','paperwork','training','introduction','other') NOT NULL DEFAULT 'other',
      description TEXT NULL,
      assignedTo VARCHAR(64) NULL,
      dueDate DATETIME NULL,
      completedDate DATETIME NULL,
      completedAt DATETIME NULL,
      completedBy VARCHAR(64) NULL,
      status ENUM('pending','in_progress','completed','skipped') NOT NULL DEFAULT 'pending',
      priority ENUM('low','medium','high') NOT NULL DEFAULT 'medium',
      isRequired TINYINT NOT NULL DEFAULT 1,
      sortOrder INT NOT NULL DEFAULT 0,
      notes TEXT NULL,
      createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
      },
      onboardingTemplates: {
        name: "onboardingTemplates",
        createSql: `CREATE TABLE IF NOT EXISTS onboardingTemplates (
      id VARCHAR(64) NOT NULL PRIMARY KEY,
      organizationId VARCHAR(64) NULL,
      name VARCHAR(255) NOT NULL,
      description TEXT NULL,
      type ENUM('onboarding','offboarding') NOT NULL,
      createdBy VARCHAR(64) NULL,
      createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_onboarding_templates_org (organizationId),
      INDEX idx_onboarding_templates_type (type)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
      },
      trainingEnrollments: {
        name: "trainingEnrollments",
        createSql: `CREATE TABLE IF NOT EXISTS trainingEnrollments (
      id VARCHAR(64) NOT NULL PRIMARY KEY,
      organizationId VARCHAR(64) NOT NULL,
      courseId VARCHAR(64) NULL,
      programId VARCHAR(64) NULL,
      employeeId VARCHAR(64) NOT NULL,
      enrollmentDate DATETIME NULL,
      enrolledAt DATETIME NULL,
      enrolledBy VARCHAR(64) NULL,
      status ENUM('enrolled','in_progress','completed','dropped','passed','failed') NOT NULL DEFAULT 'enrolled',
      attendancePercentage INT NULL DEFAULT 0,
      score INT NULL DEFAULT 0,
      certificateIssued TINYINT NULL DEFAULT 0,
      certificate VARCHAR(500) NULL,
      certificateDate DATETIME NULL,
      certificateUrl VARCHAR(500) NULL,
      completedAt DATETIME NULL,
      feedback TEXT NULL,
      createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
      },
      trainingPrograms: {
        name: "trainingPrograms",
        createSql: `CREATE TABLE IF NOT EXISTS trainingPrograms (
      id VARCHAR(64) NOT NULL PRIMARY KEY,
      organizationId VARCHAR(64) NULL,
      name VARCHAR(200) NOT NULL,
      description TEXT NULL,
      category VARCHAR(100) NULL,
      trainer VARCHAR(200) NULL,
      startDate DATE NULL,
      endDate DATE NULL,
      maxParticipants INT NULL,
      cost INT NULL DEFAULT 0,
      location VARCHAR(200) NULL,
      isOnline TINYINT NOT NULL DEFAULT 0,
      isMandatory TINYINT NOT NULL DEFAULT 0,
      status ENUM('active','completed','cancelled','draft') NOT NULL DEFAULT 'active',
      createdBy VARCHAR(64) NULL,
      createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_training_programs_org (organizationId),
      INDEX idx_training_programs_status (status),
      INDEX idx_training_programs_start (startDate)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
      },
      eSignatureRequests: {
        name: "eSignatureRequests",
        createSql: `CREATE TABLE IF NOT EXISTS eSignatureRequests (
      id VARCHAR(64) NOT NULL PRIMARY KEY,
      organizationId VARCHAR(64) NULL,
      workflowId VARCHAR(64) NULL,
      documentType VARCHAR(32) NULL,
      documentId VARCHAR(64) NULL,
      documentHash VARCHAR(64) NULL,
      sequence INT NOT NULL DEFAULT 1,
      title VARCHAR(255) NOT NULL,
      documentContent LONGTEXT NOT NULL,
      signerName VARCHAR(255) NOT NULL,
      signerEmail VARCHAR(320) NOT NULL,
      signerUserId VARCHAR(64) NULL,
      typedSignature VARCHAR(255) NULL,
      signingToken VARCHAR(128) NOT NULL UNIQUE,
      status ENUM('pending','signed','declined','expired') NOT NULL DEFAULT 'pending',
      signatureData LONGTEXT NULL,
      signedAt TIMESTAMP NULL,
      verificationCodeHash VARCHAR(64) NULL,
      verificationCodeExpiresAt TIMESTAMP NULL,
      verificationCodeSentAt TIMESTAMP NULL,
      verificationCodeAttempts INT NOT NULL DEFAULT 0,
      emailVerifiedAt TIMESTAMP NULL,
      consentAcceptedAt TIMESTAMP NULL,
      signerIp VARCHAR(45) NULL,
      signerUserAgent VARCHAR(512) NULL,
      expiresAt TIMESTAMP NULL,
      createdBy VARCHAR(64) NOT NULL,
      createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
      },
      eSignatureAuditEvents: {
        name: "eSignatureAuditEvents",
        createSql: `CREATE TABLE IF NOT EXISTS eSignatureAuditEvents (
      id VARCHAR(64) NOT NULL PRIMARY KEY,
      requestId VARCHAR(64) NOT NULL,
      workflowId VARCHAR(64) NULL,
      eventType VARCHAR(40) NOT NULL,
      actorName VARCHAR(255) NULL,
      actorEmail VARCHAR(320) NULL,
      ipAddress VARCHAR(45) NULL,
      userAgent VARCHAR(512) NULL,
      metadata JSON NULL,
      createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX esign_audit_request_idx (requestId, createdAt),
      INDEX esign_audit_workflow_idx (workflowId, createdAt)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
      },
      eSignatureSignedDocuments: {
        name: "eSignatureSignedDocuments",
        createSql: `CREATE TABLE IF NOT EXISTS eSignatureSignedDocuments (
      id VARCHAR(64) NOT NULL PRIMARY KEY,
      organizationId VARCHAR(64) NULL,
      workflowId VARCHAR(64) NOT NULL,
      documentType VARCHAR(32) NOT NULL,
      documentId VARCHAR(64) NOT NULL,
      documentHash VARCHAR(64) NOT NULL,
      pdf LONGBLOB NOT NULL,
      createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY esign_signed_document_unique_idx (documentType, documentId, workflowId),
      INDEX esign_signed_document_org_idx (organizationId)
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
      },
      partner_profiles: {
        name: "partner_profiles",
        createSql: `CREATE TABLE IF NOT EXISTS partner_profiles (
      id VARCHAR(64) NOT NULL PRIMARY KEY,
      userId VARCHAR(64) NULL,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(320) NOT NULL,
      company VARCHAR(255) NULL,
      phone VARCHAR(50) NULL,
      website VARCHAR(500) NULL,
      partnerType VARCHAR(30) NOT NULL,
      status VARCHAR(30) NOT NULL DEFAULT 'pending',
      referralCode VARCHAR(80) NOT NULL,
      commissionRate DECIMAL(5,2) NULL DEFAULT 15,
      notes TEXT NULL,
      createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_partner_profiles_email (email),
      INDEX idx_partner_profiles_status (status),
      INDEX idx_partner_profiles_code (referralCode)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
      },
      partner_referrals: {
        name: "partner_referrals",
        createSql: `CREATE TABLE IF NOT EXISTS partner_referrals (
      id VARCHAR(64) NOT NULL PRIMARY KEY,
      partnerId VARCHAR(64) NOT NULL,
      referredName VARCHAR(255) NULL,
      referredEmail VARCHAR(320) NOT NULL,
      organizationId VARCHAR(64) NULL,
      source VARCHAR(100) NULL DEFAULT 'partner',
      status VARCHAR(30) NOT NULL DEFAULT 'submitted',
      convertedAt TIMESTAMP NULL,
      notes TEXT NULL,
      createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_partner_referrals_partner (partnerId),
      INDEX idx_partner_referrals_email (referredEmail),
      INDEX idx_partner_referrals_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
      },
      partner_commissions: {
        name: "partner_commissions",
        createSql: `CREATE TABLE IF NOT EXISTS partner_commissions (
      id VARCHAR(64) NOT NULL PRIMARY KEY,
      partnerId VARCHAR(64) NOT NULL,
      referralId VARCHAR(64) NULL,
      dealId VARCHAR(64) NULL,
      amount DECIMAL(15,2) NOT NULL,
      currency VARCHAR(10) NOT NULL DEFAULT 'KES',
      status VARCHAR(30) NOT NULL DEFAULT 'pending',
      earnedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      payableAt TIMESTAMP NULL,
      paidAt TIMESTAMP NULL,
      notes TEXT NULL,
      createdAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_partner_commissions_partner (partnerId),
      INDEX idx_partner_commissions_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
      },
      partner_payouts: {
        name: "partner_payouts",
        createSql: `CREATE TABLE IF NOT EXISTS partner_payouts (
      id VARCHAR(64) NOT NULL PRIMARY KEY,
      partnerId VARCHAR(64) NOT NULL,
      amount DECIMAL(15,2) NOT NULL,
      currency VARCHAR(10) NOT NULL DEFAULT 'KES',
      method VARCHAR(50) NOT NULL,
      reference VARCHAR(255) NULL,
      status VARCHAR(30) NOT NULL DEFAULT 'requested',
      requestedAt TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
      processedAt TIMESTAMP NULL,
      notes TEXT NULL,
      INDEX idx_partner_payouts_partner (partnerId),
      INDEX idx_partner_payouts_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
      }
    };
  }
});

// shared/const.ts
var COOKIE_NAME, ONE_YEAR_MS, UNAUTHED_ERR_MSG, NOT_ADMIN_ERR_MSG;
var init_const = __esm({
  "shared/const.ts"() {
    COOKIE_NAME = "app_session_id";
    ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
    UNAUTHED_ERR_MSG = "Please login (10001)";
    NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";
  }
});

// server/middleware/enhancedRbac.ts
import { TRPCError } from "@trpc/server";
import { eq, and } from "drizzle-orm";
var init_enhancedRbac = __esm({
  "server/middleware/enhancedRbac.ts"() {
    init_trpc();
    init_db();
    init_schema();
  }
});

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
import { eq as eq2, and as and2, desc, sql as sql2 } from "drizzle-orm";
async function isMaintenanceModeEnabled() {
  const now2 = Date.now();
  if (now2 - _maintenanceCache.checkedAt < MAINTENANCE_CACHE_TTL) {
    return _maintenanceCache.enabled;
  }
  try {
    const database = await getDb();
    if (!database) return false;
    const rows = await database.select().from(settings).where(and2(eq2(settings.category, "maintenance"), eq2(settings.key, "maintenance_mode"))).limit(1);
    let enabled = rows.length > 0 && (rows[0].value === "true" || rows[0].value === "1");
    if (!enabled) {
      const schedRows = await database.select().from(settings).where(and2(eq2(settings.category, "maintenance"), eq2(settings.key, "maintenance_scheduled_at"))).limit(1);
      if (schedRows.length > 0 && schedRows[0].value) {
        const scheduledTime = new Date(schedRows[0].value).getTime();
        if (!isNaN(scheduledTime) && now2 >= scheduledTime) {
          await database.insert(settings).values({ id: `maint_mode_${now2}`, key: "maintenance_mode", value: "true", category: "maintenance", updatedAt: (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").slice(0, 19) }).onDuplicateKeyUpdate({ set: { value: "true", updatedAt: (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").slice(0, 19) } }).catch(() => {
          });
          await database.update(settings).set({ value: "true" }).where(and2(eq2(settings.category, "maintenance"), eq2(settings.key, "maintenance_mode"))).catch(() => {
          });
          await database.update(settings).set({ value: "" }).where(and2(eq2(settings.category, "maintenance"), eq2(settings.key, "maintenance_scheduled_at"))).catch(() => {
          });
          enabled = true;
          console.log("[Maintenance] Auto-enabled from schedule at", (/* @__PURE__ */ new Date()).toISOString());
          try {
            const { v4: uuidv46 } = await import("uuid");
            const backupId = uuidv46();
            const ts = (/* @__PURE__ */ new Date()).toISOString();
            await database.execute(
              sql2`INSERT INTO backup_history (id, name, backupType, scope, status, createdBy)
                  VALUES (${backupId}, ${"Pre-Maintenance Auto Backup " + ts.slice(0, 10)}, 'scheduled', 'full', 'completed', 'system')`
            );
            console.log("[Maintenance] Auto-backup created:", backupId);
          } catch (backupErr) {
            console.warn("[Maintenance] Auto-backup failed:", backupErr);
          }
        }
      }
    }
    _maintenanceCache = { enabled, checkedAt: now2 };
    return enabled;
  } catch {
    return _maintenanceCache.enabled;
  }
}
var t, _maintenanceCache, MAINTENANCE_CACHE_TTL, router, publicProcedure, requireUser, MAINTENANCE_BYPASS_ROLES, maintenanceGuard, subscriptionAccessGuard, protectedProcedure, subscriptionStatusProcedure, adminProcedure, orgScopedProcedure;
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
      const { ctx, next, path: path2 } = opts;
      const user = ctx.user;
      if (!user?.organizationId) {
        return next({ ctx });
      }
      if (path2 === "multiTenancy.getSubscriptionAccess" || path2.startsWith("orgBilling.")) {
        return next({ ctx });
      }
      try {
        const database = await getDb();
        if (!database) return next({ ctx });
        const rows = await database.select().from(subscriptions).where(eq2(subscriptions.organizationId, user.organizationId)).orderBy(desc(subscriptions.createdAt)).limit(1);
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
  }
});

// server/websocket/notificationBroadcaster.ts
var notificationBroadcaster_exports = {};
__export(notificationBroadcaster_exports, {
  broadcastNotification: () => broadcastNotification,
  broadcastNotificationDeleted: () => broadcastNotificationDeleted,
  broadcastNotificationRead: () => broadcastNotificationRead,
  broadcastUnreadCountChanged: () => broadcastUnreadCountChanged,
  cleanupNotificationListener: () => cleanupNotificationListener,
  notificationsSubscription: () => notificationsSubscription
});
import { observable } from "@trpc/server/observable";
import { EventEmitter } from "events";
async function broadcastNotification(userId, notification) {
  const event = {
    type: "notification_received",
    data: notification,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
  console.log(`[BROADCAST] Notification to user ${userId}:`, notification.title);
  notificationEmitter.emit(`user:${userId}:notifications`, event);
}
function broadcastNotificationRead(userId, notificationId) {
  const event = {
    type: "notification_read",
    data: { notificationId },
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
  notificationEmitter.emit(`user:${userId}:notifications`, event);
}
function broadcastNotificationDeleted(userId, notificationId) {
  const event = {
    type: "notification_deleted",
    data: { notificationId },
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
  notificationEmitter.emit(`user:${userId}:notifications`, event);
}
function broadcastUnreadCountChanged(userId, count2) {
  const event = {
    type: "notification_count_changed",
    data: { unreadCount: count2 },
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
  notificationEmitter.emit(`user:${userId}:notifications`, event);
}
function cleanupNotificationListener(userId, callback) {
  const channelName = `user:${userId}:notifications`;
  notificationEmitter.removeListener(channelName, callback);
}
var notificationEmitter, notificationsSubscription;
var init_notificationBroadcaster = __esm({
  "server/websocket/notificationBroadcaster.ts"() {
    init_trpc();
    notificationEmitter = new EventEmitter();
    notificationEmitter.setMaxListeners(1e3);
    notificationsSubscription = protectedProcedure.subscription(({ ctx }) => {
      return observable((emit) => {
        const onNotification = (event) => {
          emit.next(event);
        };
        const channelName = `user:${ctx.user.id}:notifications`;
        notificationEmitter.on(channelName, onNotification);
        console.log(`[WS] User ${ctx.user.id} subscribed to notifications`);
        return () => {
          notificationEmitter.off(channelName, onNotification);
          console.log(`[WS] User ${ctx.user.id} unsubscribed from notifications`);
        };
      });
    });
  }
});

// server/db-users.ts
import { eq as eq3, and as and3, like, desc as desc2, inArray } from "drizzle-orm";
async function getUserOrganizationId(userId, email) {
  const db2 = await getDb();
  if (!db2) return null;
  try {
    const [organizationUser] = await db2.select({ organizationId: organizationUsers.organizationId }).from(organizationUsers).where(and3(eq3(organizationUsers.id, userId), eq3(organizationUsers.isActive, 1))).limit(1);
    if (organizationUser?.organizationId) return organizationUser.organizationId;
  } catch (error) {
    console.warn("[Database] Failed to resolve organization user:", error);
  }
  try {
    const [membership] = await db2.select({ organizationId: organizationMembers.organizationId }).from(organizationMembers).where(and3(eq3(organizationMembers.userId, userId), eq3(organizationMembers.status, "active"))).limit(1);
    if (membership?.organizationId) return membership.organizationId;
  } catch (error) {
    console.warn("[Database] Failed to resolve user organization membership:", error);
  }
  if (email) {
    try {
      const matchingOrganizationUsers = await db2.select({ organizationId: organizationUsers.organizationId }).from(organizationUsers).where(and3(eq3(organizationUsers.email, email), eq3(organizationUsers.isActive, 1))).limit(2);
      if (matchingOrganizationUsers.length === 1) return matchingOrganizationUsers[0].organizationId;
      if (matchingOrganizationUsers.length > 1) {
        console.warn("[Database] Multiple organization users match this email; tenant cannot be resolved without a user ID link");
      }
    } catch (error) {
      console.warn("[Database] Failed to resolve organization by email:", error);
    }
  }
  return null;
}
var init_db_users = __esm({
  "server/db-users.ts"() {
    init_schema();
    init_schema_extended();
    init_db();
  }
});

// server/_core/sdk.ts
import { parse as parseCookieHeader } from "cookie";
import { jwtVerify } from "jose";
async function resolveUserOrganizationContext(user, resolveMembership = getUserOrganizationId) {
  if (user.organizationId) return user;
  const organizationId = await resolveMembership(user.id, user.email ?? null);
  return organizationId ? { ...user, organizationId } : user;
}
function getOrganizationSlugFromRequest(req) {
  const hostname = String(req.hostname || "").toLowerCase();
  const baseDomain = String(process.env.ORG_BASE_DOMAIN || "kiini.africa").toLowerCase();
  const subdomainSuffix = `.${baseDomain}`;
  if (hostname.endsWith(subdomainSuffix)) {
    const slug = hostname.slice(0, -subdomainSuffix.length);
    if (slug && !slug.includes(".") && !RESERVED_ORG_SUBDOMAINS.has(slug)) return slug;
  }
  const referer = req.get("referer");
  const requestHost = req.get("host")?.toLowerCase();
  if (!referer || !requestHost) return null;
  try {
    const refererUrl = new URL(referer);
    if (refererUrl.host.toLowerCase() !== requestHost) return null;
    return refererUrl.pathname.match(/^\/org\/([a-z0-9-]+)(?:\/|$)/i)?.[1] ?? null;
  } catch {
    return null;
  }
}
async function resolveRequestOrganizationContext(user, req, findOrganization = getOrganizationBySlug) {
  if (user.organizationId || user.role !== "super_admin") return user;
  const slug = getOrganizationSlugFromRequest(req);
  if (!slug) return user;
  try {
    const organization = await findOrganization(slug);
    if (!organization || !organization.id || Number(organization.isActive) === 0 || Number(organization.isArchived) === 1) {
      return user;
    }
    return { ...user, organizationId: organization.id, organizationSlug: organization.slug };
  } catch (error) {
    console.warn("[Auth] Failed to resolve platform admin tenant context:", error);
    return user;
  }
}
var RESERVED_ORG_SUBDOMAINS, SDKServer, sdk;
var init_sdk = __esm({
  "server/_core/sdk.ts"() {
    init_const();
    init_db();
    init_db_users();
    RESERVED_ORG_SUBDOMAINS = /* @__PURE__ */ new Set(["www", "app", "admin"]);
    SDKServer = class {
      localUserCache = /* @__PURE__ */ new Map();
      constructor() {
      }
      invalidateLocalUserCache(userId) {
        this.localUserCache.delete(userId);
      }
      parseCookies(cookieHeader) {
        if (!cookieHeader) {
          return /* @__PURE__ */ new Map();
        }
        const parsed = parseCookieHeader(cookieHeader);
        return new Map(Object.entries(parsed));
      }
      /**
       * Authenticate request by checking session cookie
       * Returns the user if authenticated, null if not
       * Does not throw errors - authentication is optional for public procedures
       */
      async authenticateRequest(req) {
        const authHeader = req.headers["authorization"] || req.headers["Authorization"];
        let procedure = req.path || req.url?.split("?")[0] || "unknown";
        const queryString = req.url?.split("?")[1] || "";
        const params = new URLSearchParams(queryString);
        const batch = params.get("batch");
        if (batch) {
          try {
            const procedureNames = JSON.parse(batch).map((b) => b[0]).join(", ");
            procedure = `BATCH[${procedureNames}]`;
          } catch {
            procedure = "BATCH_CALL";
          }
        }
        console.log(`[authenticateRequest] Procedure: ${procedure}, Authorization:`, authHeader ? "YES" : "NO");
        if (authHeader && typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
          const headerToken = authHeader.slice(7);
          try {
            const localUser = await this.verifyLocalJWT(headerToken);
            if (localUser) {
              console.log("[authenticateRequest] JWT verified from Authorization header, user:", localUser.email);
              return await resolveRequestOrganizationContext(localUser, req);
            }
          } catch (err) {
            console.log("[authenticateRequest] JWT verification failed from header:", err);
          }
        }
        const cookies = this.parseCookies(req.headers.cookie);
        const sessionCookie = cookies.get(COOKIE_NAME);
        if (!sessionCookie) {
          return null;
        }
        try {
          const localUser = await this.verifyLocalJWT(sessionCookie);
          return localUser ? await resolveRequestOrganizationContext(localUser, req) : null;
        } catch (error) {
          console.error("[Auth] Error authenticating request:", error);
          return null;
        }
      }
      /**
       * Verify local JWT token (for email/password authentication)
       */
      async verifyLocalJWT(token) {
        try {
          const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "default-secret-key");
          const { payload } = await jwtVerify(token, JWT_SECRET, {
            algorithms: ["HS256"]
          });
          const userId = payload.userId;
          if (!userId) {
            return null;
          }
          const cached = this.localUserCache.get(userId);
          if (cached && cached.expiresAt > Date.now()) {
            return cached.user;
          }
          const user = await getUser(userId);
          if (!user) {
            return null;
          }
          const resolvedUser = await resolveUserOrganizationContext(user);
          this.localUserCache.set(userId, { user: resolvedUser, expiresAt: Date.now() + 6e4 });
          return resolvedUser;
        } catch (error) {
          return null;
        }
      }
    };
    sdk = new SDKServer();
  }
});

// server/sse.ts
var sse_exports = {};
__export(sse_exports, {
  notifyOrg: () => notifyOrg,
  notifyUser: () => notifyUser,
  sseHandler: () => sseHandler
});
function addClient(orgId, res) {
  if (!sseClients.has(orgId)) sseClients.set(orgId, /* @__PURE__ */ new Set());
  sseClients.get(orgId).add(res);
}
function removeClient(orgId, res) {
  sseClients.get(orgId)?.delete(res);
  if (sseClients.get(orgId)?.size === 0) sseClients.delete(orgId);
}
function notifyOrg(orgId, event) {
  const key = String(orgId);
  const clients2 = sseClients.get(key);
  if (!clients2 || clients2.size === 0) return;
  const payload = `data: ${JSON.stringify(event)}

`;
  for (const res of clients2) {
    try {
      res.write(payload);
    } catch {
    }
  }
}
function notifyUser(userId, event) {
  notifyOrg(`user_${userId}`, event);
}
async function sseHandler(req, res) {
  const queryToken = typeof req.query.token === "string" ? req.query.token : null;
  let user = null;
  try {
    if (queryToken) {
      const syntheticReq = Object.create(req);
      syntheticReq.headers = {
        ...req.headers,
        authorization: `Bearer ${queryToken}`
      };
      user = await sdk.authenticateRequest(syntheticReq);
    } else {
      user = await sdk.authenticateRequest(req);
    }
  } catch {
  }
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const channelKeys = user.organizationId ? [String(user.organizationId), `user_${user.id}`] : [`user_${user.id}`];
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  const sock = req.socket;
  if (sock) {
    sock.setTimeout(0);
    sock.setNoDelay(true);
    sock.setKeepAlive(true, 0);
  }
  res.flushHeaders();
  res.write(
    `retry: 5000
data: ${JSON.stringify({
      id: `init-${Date.now()}`,
      type: "info",
      title: "Connected",
      body: "Real-time notifications active",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    })}

`
  );
  channelKeys.forEach((channelKey) => addClient(channelKey, res));
  const heartbeat = setInterval(() => {
    try {
      res.write(": heartbeat\n\n");
    } catch {
      clearInterval(heartbeat);
    }
  }, 15e3);
  req.on("close", () => {
    clearInterval(heartbeat);
    channelKeys.forEach((channelKey) => removeClient(channelKey, res));
  });
}
var sseClients;
var init_sse = __esm({
  "server/sse.ts"() {
    init_sdk();
    sseClients = /* @__PURE__ */ new Map();
  }
});

// server/db.ts
import { eq as eq4, desc as desc3, and as and4, gte, lte, isNotNull, isNull, count, sum } from "drizzle-orm";
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
            then: (resolve2, reject) => Promise.resolve([]).then(resolve2, reject),
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
function getPool() {
  return _pool;
}
async function getRawPool() {
  if (_pool) return _pool;
  if (!process.env.DATABASE_URL) return null;
  await getDb();
  return _pool;
}
async function initializeDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      console.log("[Database] Attempting to create drizzle connection...");
      if (!_pool) {
        _pool = await mysql.createPool({
          uri: process.env.DATABASE_URL,
          waitForConnections: true,
          connectionLimit: DB_CONNECTION_LIMIT,
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
      const shouldRunRuntimeMigrations = process.env.NODE_ENV !== "production" || process.env.RUN_DRIZZLE_MIGRATIONS !== "false";
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
            _migrationsRun = true;
            console.warn("[Database] Keeping the validated database connection and continuing with runtime schema compatibility checks");
          }
        } else {
          _migrationsRun = true;
          console.log("[Database] Skipping runtime drizzle migrations in production");
        }
        const shouldRunRuntimeSchemaChecks = process.env.NODE_ENV !== "production" || process.env.RUN_RUNTIME_SCHEMA_CHECKS !== "false";
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
            await _pool.query("ALTER TABLE onboardingChecklists MODIFY COLUMN jobGroupId varchar(64) NULL");
            await _pool.query("ALTER TABLE trainingEnrollments MODIFY COLUMN courseId varchar(64) NULL, MODIFY COLUMN enrollmentDate datetime NULL");
            await _pool.query("ALTER TABLE organizations MODIFY COLUMN urlMode enum('path','subdomain') NOT NULL DEFAULT 'subdomain'");
            await _pool.query("ALTER TABLE expenses MODIFY COLUMN chartOfAccountId varchar(64) NULL");
            await _pool.query("ALTER TABLE payments MODIFY COLUMN chartOfAccountId varchar(64) NULL");
            await _pool.query("ALTER TABLE recurringExpenses MODIFY COLUMN chartOfAccountId varchar(64) NULL");
          } catch (schemaError) {
            console.warn("[Database] Could not align onboarding/training compatibility columns:", schemaError instanceof Error ? schemaError.message : schemaError);
          }
          for (const tableName of ["expenses", "recurringExpenses"]) {
            try {
              await _pool.query(`ALTER TABLE ${tableName} MODIFY COLUMN paymentMethod ENUM('cash','bank_transfer','cheque','card','mpesa','other') NULL DEFAULT NULL`);
            } catch (schemaError) {
              console.warn(`[Database] Could not standardize ${tableName}.paymentMethod:`, schemaError instanceof Error ? schemaError.message : schemaError);
            }
          }
          try {
            await _pool.query("ALTER TABLE invoicePayments MODIFY COLUMN paymentMethod ENUM('cash','bank_transfer','check','mobile_money','credit_card','cheque','mpesa','card','other') NOT NULL");
            await _pool.query("UPDATE invoicePayments SET paymentMethod = 'cheque' WHERE paymentMethod = 'check'");
            await _pool.query("UPDATE invoicePayments SET paymentMethod = 'mpesa' WHERE paymentMethod = 'mobile_money'");
            await _pool.query("UPDATE invoicePayments SET paymentMethod = 'card' WHERE paymentMethod = 'credit_card'");
            await _pool.query("ALTER TABLE invoicePayments MODIFY COLUMN paymentMethod ENUM('cash','bank_transfer','cheque','mpesa','card','other') NOT NULL");
          } catch (schemaError) {
            console.warn("[Database] Could not standardize invoicePayments.paymentMethod:", schemaError instanceof Error ? schemaError.message : schemaError);
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
async function getUser(id) {
  const pool = getPool() || await getRawPool();
  if (pool) {
    try {
      const [rows] = await pool.execute("SELECT * FROM users WHERE id = ? LIMIT 1", [id]);
      const user = rows[0];
      if (user) return user;
    } catch (error) {
      console.warn("[Database] Raw user-id lookup failed; using Drizzle:", error);
    }
  }
  const db2 = await getDb();
  if (!db2) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db2.select().from(users).where(eq4(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function createNotification(notification) {
  const db2 = await getDb();
  if (!db2) throw new Error("Database not available");
  const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const notificationData = { ...notification, id };
  await db2.insert(notifications).values(notificationData);
  try {
    const { broadcastNotification: broadcastNotification2 } = await Promise.resolve().then(() => (init_notificationBroadcaster(), notificationBroadcaster_exports));
    await broadcastNotification2(notification.userId, notificationData);
  } catch (error) {
    console.warn("Could not broadcast notification, websocket may not be available:", error);
  }
  try {
    const { notifyOrg: notifyOrg2, notifyUser: notifyUser2 } = await Promise.resolve().then(() => (init_sse(), sse_exports));
    const [targetUser] = await db2.select({ id: users.id, organizationId: users.organizationId }).from(users).where(eq4(users.id, notification.userId)).limit(1);
    const event = {
      id,
      type: "info",
      title: notification.title || "Notification",
      body: notification.message || "You have a new update",
      href: notification.actionUrl || void 0,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    if (targetUser?.organizationId) {
      notifyOrg2(targetUser.organizationId, event);
    } else {
      notifyUser2(notification.userId, event);
    }
  } catch (error) {
    console.warn("Could not broadcast notification over SSE:", error);
  }
  return id;
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
async function getOrganizationBySlug(slug) {
  const db2 = await getDb();
  if (!db2) return null;
  const fallbackSelect = {
    id: organizations.id,
    name: organizations.name,
    slug: organizations.slug,
    plan: organizations.plan,
    isActive: organizations.isActive,
    isArchived: organizations.isArchived,
    archivedAt: organizations.archivedAt,
    archivedBy: organizations.archivedBy,
    maxUsers: organizations.maxUsers,
    settings: organizations.settings,
    logoUrl: organizations.logoUrl,
    domain: organizations.domain,
    contactEmail: organizations.contactEmail,
    contactPhone: organizations.contactPhone,
    address: organizations.address,
    country: organizations.country,
    industry: organizations.industry,
    website: organizations.website,
    taxId: organizations.taxId,
    billingEmail: organizations.billingEmail,
    timezone: organizations.timezone,
    currency: organizations.currency,
    description: organizations.description,
    employeeCount: organizations.employeeCount,
    registrationNumber: organizations.registrationNumber,
    paymentMethod: organizations.paymentMethod,
    createdAt: organizations.createdAt,
    updatedAt: organizations.updatedAt
  };
  try {
    const [org] = await db2.select().from(organizations).where(eq4(organizations.slug, slug)).limit(1);
    return org ?? null;
  } catch (error) {
    try {
      const pool = getPool() || await getRawPool();
      if (!pool) return null;
      const [rows] = await pool.query("SELECT * FROM `organizations` WHERE `slug` = ? LIMIT 1", [slug]);
      const legacyOrg = rows[0];
      return legacyOrg ? { ...legacyOrg, urlMode: legacyOrg.urlMode === "subdomain" ? "subdomain" : "path", isArchived: legacyOrg.isArchived ?? 0 } : null;
    } catch (fallbackError) {
      console.warn("[db.getOrganizationBySlug] Legacy schema fallback failed for slug:", slug, fallbackError);
      return null;
    }
  }
}
var _db, _pool, _migrationsRun, _dbInitialization, DB_CONNECTION_LIMIT, db;
var init_db = __esm({
  "server/db.ts"() {
    init_schema();
    init_schema_extended();
    init_databasePoolConfig();
    init_env();
    init_tierPricing();
    init_legacySchemaCompatibility();
    _db = null;
    _pool = null;
    _migrationsRun = false;
    _dbInitialization = null;
    DB_CONNECTION_LIMIT = resolveDbConnectionLimit(process.env.DB_CONNECTION_LIMIT);
    db = createLegacyDbCompat();
  }
});

// server/jobs/scheduledJobRunner.ts
init_db();

// server/jobs/p9Jobs.ts
init_db();
import { CronJob as CronJob2 } from "cron";

// server/utils/p9-forms.ts
init_db();
import { v4 as uuidv4 } from "uuid";
function parseDeductionsBreakdown(value) {
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(String(value || "[]"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
function parsePayrollNotes(value) {
  if (value && typeof value === "object" && !Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(String(value || "{}"));
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}
function aggregateP9PayslipRows(rows) {
  return rows.reduce((totals, row) => {
    const deductions = parseDeductionsBreakdown(row.deductionsBreakdown);
    const amountFor = (pattern) => deductions.reduce((sum2, item) => {
      const label = String(item.name || item.description || item.component || item.type || "");
      return pattern.test(label) ? sum2 + Number(item.amount || 0) : sum2;
    }, 0);
    totals.grossIncome += Number(row.grossSalary || Number(row.basicSalary || 0) + Number(row.allowances || 0) + Number(row.bonuses || 0));
    totals.paye += Number(row.payeDeduction || row.paye || amountFor(/paye|payee|income tax/i));
    totals.nssf += Number(row.nssfDeduction || row.nssf || amountFor(/nssf/i));
    totals.shif += Number(row.nhifDeduction || row.shif || row.nhif || amountFor(/shif|nhif/i));
    totals.housingLevy += Number(row.housingLevy || amountFor(/housing levy/i));
    totals.numberOfPayslips += 1;
    return totals;
  }, { grossIncome: 0, paye: 0, nssf: 0, shif: 0, housingLevy: 0, numberOfPayslips: 0 });
}
function aggregateP9PayrollRows(rows) {
  return rows.reduce((totals, row) => {
    const notes2 = parsePayrollNotes(row.notes);
    totals.grossIncome += Number(notes2.grossSalary ?? Number(row.basicSalary || 0) + Number(row.allowances || 0));
    totals.paye += Number(notes2.paye ?? row.tax ?? 0);
    totals.nssf += Number(notes2.nssf ?? notes2.nssfContribution ?? 0);
    totals.shif += Number(notes2.shif ?? notes2.shifContribution ?? notes2.nhif ?? 0);
    totals.housingLevy += Number(notes2.housingLevy ?? notes2.housingLevyDeduction ?? 0);
    totals.numberOfPayslips += 1;
    return totals;
  }, { grossIncome: 0, paye: 0, nssf: 0, shif: 0, housingLevy: 0, numberOfPayslips: 0 });
}
function aggregateP9PayrollAndPayslipRows(payrollRows, payslipRows) {
  const payslipPayrollIds = new Set(payslipRows.map((row) => row.payrollId || row.payrollDetailId).filter(Boolean).map(String));
  const payrollWithoutPayslip = payrollRows.filter((row) => !payslipPayrollIds.has(String(row.id)));
  const payrollTotals = aggregateP9PayrollRows(payrollWithoutPayslip);
  const payslipTotals = aggregateP9PayslipRows(payslipRows);
  return {
    grossIncome: payrollTotals.grossIncome + payslipTotals.grossIncome,
    paye: payrollTotals.paye + payslipTotals.paye,
    nssf: payrollTotals.nssf + payslipTotals.nssf,
    shif: payrollTotals.shif + payslipTotals.shif,
    housingLevy: payrollTotals.housingLevy + payslipTotals.housingLevy,
    numberOfPayslips: payrollTotals.numberOfPayslips + payslipTotals.numberOfPayslips
  };
}
function resolveP9TaxNumber(taxInfo, employeeTaxId) {
  const value = taxInfo?.taxNumber || taxInfo?.taxId || employeeTaxId;
  return typeof value === "string" && value.trim() ? value.trim() : "N/A";
}
async function calculateP9Data(input) {
  const pool = getPool();
  if (!pool) throw new Error("Database not available");
  const employeeScope = input.organizationId ? "organizationId = ?" : "organizationId IS NULL";
  const employeeParams = input.organizationId ? [input.employeeId, input.organizationId] : [input.employeeId];
  const [empRows] = await pool.query(
    `SELECT id, firstName, lastName, email, taxId FROM employees WHERE id = ? AND ${employeeScope} LIMIT 1`,
    employeeParams
  );
  const emp = empRows?.[0];
  if (!emp) throw new Error(`Employee ${input.employeeId} was not found in this organization`);
  const [taxRows] = await pool.query(
    `SELECT * FROM employeeTaxInfo WHERE employeeId = ? ORDER BY effectiveDate DESC LIMIT 1`,
    [input.employeeId]
  );
  const taxInfo = taxRows?.[0];
  const taxNumber = resolveP9TaxNumber(taxInfo, emp.taxId);
  const yearStart = `${input.taxYear}-01-01`;
  const nextYearStart = `${input.taxYear + 1}-01-01`;
  const [payrollRows] = await pool.query(
    `SELECT p.id, p.basicSalary, p.allowances, p.tax, p.notes
     FROM payroll p
     INNER JOIN employees e ON e.id = p.employeeId
     WHERE p.employeeId = ? AND e.${input.organizationId ? "organizationId = ?" : "organizationId IS NULL"}
       AND p.payPeriodStart >= ? AND p.payPeriodStart < ?
       AND p.status IN ('processed', 'paid')`,
    input.organizationId ? [input.employeeId, input.organizationId, yearStart, nextYearStart] : [input.employeeId, yearStart, nextYearStart]
  );
  const [payslipRows] = await pool.query(
    `SELECT * FROM payslips
     WHERE employeeId = ? AND ${input.organizationId ? "organizationId = ?" : "organizationId IS NULL"}
       AND status IN ('generated', 'sent', 'viewed', 'downloaded')`,
    input.organizationId ? [input.employeeId, input.organizationId] : [input.employeeId]
  );
  const yearPayslips = (payslipRows || []).filter((row) => {
    const period = String(row.payPeriod || row.payMonth || row.payPeriodStart || "");
    return period >= yearStart && period < nextYearStart;
  });
  const totals = aggregateP9PayrollAndPayslipRows(payrollRows || [], yearPayslips);
  if (totals.numberOfPayslips === 0) {
    console.warn(`[P9-GEN] No processed payroll or payslips found for employee ${emp.email} in ${input.taxYear}`);
    return null;
  }
  const { grossIncome, paye, nssf, shif, housingLevy, numberOfPayslips } = totals;
  const reliefs = 0;
  const netTaxPayable = paye - reliefs;
  return {
    employeeId: input.employeeId,
    organizationId: input.organizationId,
    taxYear: input.taxYear,
    taxNumber,
    grossIncome,
    paye,
    nssf,
    shif,
    housingLevy,
    reliefs,
    netTaxPayable,
    numberOfPayslips
  };
}
function generateP9HTML(employeeName, email, p9Data) {
  const formatAmount = (cents) => {
    return (cents / 100).toLocaleString("en-KE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };
  const formatDate = (date2) => {
    return date2.toLocaleDateString("en-KE", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>P9 Tax Form - ${p9Data.taxYear}</title>
      <style>
        body {
          font-family: "Courier New", monospace;
          line-height: 1.6;
          margin: 20px;
          color: #333;
        }
        .container {
          max-width: 900px;
          margin: 0 auto;
          border: 2px solid #000;
          padding: 30px;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #000;
          padding-bottom: 15px;
        }
        .header h1 {
          margin: 0;
          font-size: 18px;
          font-weight: bold;
        }
        .header p {
          margin: 5px 0;
          font-size: 14px;
        }
        .section {
          margin-bottom: 20px;
        }
        .section-title {
          background-color: #f5f5f5;
          padding: 8px;
          font-weight: bold;
          border-bottom: 1px solid #ccc;
          margin-bottom: 10px;
        }
        .form-row {
          display: flex;
          margin-bottom: 8px;
          border-bottom: 1px solid #ddd;
          padding: 5px 0;
        }
        .form-label {
          flex: 0 0 60%;
          font-weight: 500;
        }
        .form-value {
          flex: 1;
          text-align: right;
          padding-right: 20px;
          border-left: 1px solid #ddd;
          padding-left: 10px;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          font-size: 12px;
          color: #666;
        }
        .total-row {
          background-color: #f9f9f9;
          font-weight: bold;
        }
        .highlight {
          background-color: #fff9e6;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>ANNUAL TAX DECLARATION (P9)</h1>
          <p>TAX YEAR: ${p9Data.taxYear}</p>
          <p>Kenya Revenue Authority</p>
        </div>

        <div class="section">
          <div class="section-title">EMPLOYEE INFORMATION</div>
          <div class="form-row">
            <div class="form-label">Employee Name:</div>
            <div class="form-value">${employeeName}</div>
          </div>
          <div class="form-row">
            <div class="form-label">Email:</div>
            <div class="form-value">${email}</div>
          </div>
          <div class="form-row">
            <div class="form-label">PIN/Tax Number:</div>
            <div class="form-value">${p9Data.taxNumber}</div>
          </div>
          <div class="form-row">
            <div class="form-label">Tax Year:</div>
            <div class="form-value">${p9Data.taxYear}</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">INCOME SUMMARY</div>
          <div class="form-row">
            <div class="form-label">Total Gross Income:</div>
            <div class="form-value">KES ${formatAmount(p9Data.grossIncome)}</div>
          </div>
          <div class="form-row">
            <div class="form-label">Number of Pay Periods:</div>
            <div class="form-value">${p9Data.numberOfPayslips}</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">DEDUCTIONS & CONTRIBUTIONS</div>
          <div class="form-row">
            <div class="form-label">NSSF Contributions:</div>
            <div class="form-value">KES ${formatAmount(p9Data.nssf)}</div>
          </div>
          <div class="form-row">
            <div class="form-label">SHIF (Health Insurance):</div>
            <div class="form-value">KES ${formatAmount(p9Data.shif)}</div>
          </div>
          <div class="form-row">
            <div class="form-label">Housing Levy:</div>
            <div class="form-value">KES ${formatAmount(p9Data.housingLevy)}</div>
          </div>
          <div class="form-row total-row">
            <div class="form-label">Total Non-Tax Deductions:</div>
            <div class="form-value">KES ${formatAmount(
    p9Data.nssf + p9Data.shif + p9Data.housingLevy
  )}</div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">TAX PAYABLE</div>
          <div class="form-row">
            <div class="form-label">PAYE Tax Deducted:</div>
            <div class="form-value">KES ${formatAmount(p9Data.paye)}</div>
          </div>
          <div class="form-row">
            <div class="form-label">Tax Reliefs:</div>
            <div class="form-value">KES ${formatAmount(p9Data.reliefs)}</div>
          </div>
          <div class="form-row total-row highlight">
            <div class="form-label">NET TAX PAYABLE:</div>
            <div class="form-value">KES ${formatAmount(p9Data.netTaxPayable)}</div>
          </div>
        </div>

        <div class="footer">
          <p>Generated on ${formatDate(/* @__PURE__ */ new Date())}</p>
          <p>This P9 form is generated electronically and serves as an official tax declaration.</p>
          <p>For inquiries, contact your HR department.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
async function generateP9Form(input, generatedBy) {
  const pool = getPool();
  if (!pool) throw new Error("Database not available");
  const p9Data = await calculateP9Data(input);
  if (!p9Data) return null;
  const [empRows] = await pool.query(
    `SELECT firstName, lastName, email FROM employees
     WHERE id = ? AND ${input.organizationId ? "organizationId = ?" : "organizationId IS NULL"} LIMIT 1`,
    input.organizationId ? [input.employeeId, input.organizationId] : [input.employeeId]
  );
  const emp = empRows?.[0];
  if (!emp) throw new Error(`Employee ${input.employeeId} was not found in this organization`);
  const employeeName = `${emp.firstName} ${emp.lastName}`;
  const htmlContent = generateP9HTML(employeeName, emp.email, p9Data);
  const [existingRows] = await pool.query(
    `SELECT id FROM p9_forms
     WHERE ${input.organizationId ? "organizationId = ?" : "organizationId IS NULL"}
       AND employeeId = ? AND taxYear = ? LIMIT 1`,
    input.organizationId ? [input.organizationId, input.employeeId, input.taxYear] : [input.employeeId, input.taxYear]
  );
  const existingId = existingRows?.[0]?.id;
  const p9Id = existingId || uuidv4();
  const values = [
    p9Data.taxNumber,
    p9Data.grossIncome,
    p9Data.paye + p9Data.nssf + p9Data.shif + p9Data.housingLevy,
    p9Data.paye,
    p9Data.nssf,
    p9Data.shif,
    p9Data.housingLevy,
    p9Data.reliefs,
    p9Data.netTaxPayable,
    p9Data.numberOfPayslips,
    htmlContent,
    generatedBy
  ];
  if (existingId) {
    await pool.query(
      `UPDATE p9_forms SET taxNumber = ?, grossIncome = ?, totalDeductions = ?, paye = ?,
       nssf = ?, shif = ?, housingLevy = ?, reliefs = ?, netTaxPayable = ?,
       numberOfPayslips = ?, htmlContent = ?, generatedBy = ?, generatedAt = NOW(),
       status = IF(status IN ('sent', 'received'), status, 'generated'), updatedAt = NOW()
       WHERE id = ? AND ${input.organizationId ? "organizationId = ?" : "organizationId IS NULL"}`,
      input.organizationId ? [...values, p9Id, input.organizationId] : [...values, p9Id]
    );
  } else {
    await pool.query(
      `INSERT INTO p9_forms (
        id, organizationId, employeeId, taxYear, taxNumber, grossIncome,
        totalDeductions, paye, nssf, shif, housingLevy, reliefs, netTaxPayable,
        numberOfPayslips, htmlContent, generatedBy, generatedAt, status, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, NOW(), NOW())`,
      [
        p9Id,
        input.organizationId,
        input.employeeId,
        input.taxYear,
        ...values.slice(0, 11),
        generatedBy,
        "generated"
      ]
    );
  }
  console.log(`[P9-GEN] Generated P9 form ${p9Id} for ${emp.email} (${input.taxYear})`);
  return { id: p9Id, status: "generated" };
}

// server/jobs/payrollJobs.ts
init_db();
init_schema();
import { CronJob } from "cron";
import { eq as eq12, and as and10, inArray as inArray4, desc as desc5, lte as lte3, isNull as isNull4 } from "drizzle-orm";
import { v4 as uuidv45 } from "uuid";

// server/utils/kenyan-payroll-calculator.ts
var PAYE_TAX_BRACKETS = [
  { min: 0, max: 288e3, rate: 0.1 },
  // 10%
  { min: 288001, max: 388e3, rate: 0.15 },
  // 15%
  { min: 388001, max: 6e6, rate: 0.2 },
  // 20%
  { min: 6000001, max: 96e5, rate: 0.25 },
  // 25%
  { min: 9600001, max: Infinity, rate: 0.3 }
  // 30%
];
var NSSF_RATES = {
  TIER_1_RATE: 0.06,
  // 6% - Tier 1
  TIER_1_MAX: 18e3,
  // Max contribution from 300,000 salary
  TIER_2_RATE: 0.06,
  // 6% - Tier 2
  TIER_2_MIN_SALARY: 300001
  // Tier 2 applies above this
};
var SHIF_RATES = {
  RATE: 0.025,
  // 2.5%
  MAX_MONTHLY: 15e3
  // Maximum monthly contribution
};
var HOUSING_LEVY = {
  RATE: 0.015,
  // 1.5%
  MAX_MONTHLY: 15e3
};
var PERSONAL_RELIEF_MONTHLY = 2400;
var roundCurrency = (amount) => Math.round(amount * 100) / 100;
function calculateNSSF(grossMonthlySalary) {
  const tier1Contribution = Math.min(grossMonthlySalary * NSSF_RATES.TIER_1_RATE, NSSF_RATES.TIER_1_MAX);
  let tier2Contribution = 0;
  if (grossMonthlySalary > NSSF_RATES.TIER_2_MIN_SALARY) {
    const tier2Salary = grossMonthlySalary - NSSF_RATES.TIER_2_MIN_SALARY;
    tier2Contribution = tier2Salary * NSSF_RATES.TIER_2_RATE;
  }
  return {
    tier1: roundCurrency(tier1Contribution),
    tier2: roundCurrency(tier2Contribution),
    total: roundCurrency(tier1Contribution + tier2Contribution)
  };
}
function calculateSHIF(grossMonthlySalary) {
  const shifContribution = grossMonthlySalary * SHIF_RATES.RATE;
  return roundCurrency(Math.min(shifContribution, SHIF_RATES.MAX_MONTHLY));
}
function calculateHousingLevy(grossMonthlySalary) {
  const levy = grossMonthlySalary * HOUSING_LEVY.RATE;
  return roundCurrency(Math.min(levy, HOUSING_LEVY.MAX_MONTHLY));
}
function calculatePAYE(taxableIncome) {
  const annualTaxableIncome = taxableIncome * 12;
  let tax = 0;
  let bracketApplied = "";
  for (const bracket of PAYE_TAX_BRACKETS) {
    if (annualTaxableIncome > bracket.min) {
      const taxableInThisBracket = Math.min(annualTaxableIncome, bracket.max) - bracket.min;
      tax += taxableInThisBracket * bracket.rate;
      if (annualTaxableIncome <= bracket.max) {
        bracketApplied = `${(bracket.rate * 100).toFixed(0)}%`;
        break;
      }
    }
  }
  const monthlyTax = roundCurrency(tax / 12);
  const personalRelief = Math.round(PERSONAL_RELIEF_MONTHLY);
  const taxAfterRelief = Math.max(0, monthlyTax - personalRelief);
  return {
    tax: monthlyTax,
    bracketApplied,
    beforeRelief: monthlyTax,
    afterRelief: taxAfterRelief
  };
}
function calculateKenyanPayroll(payrollInfo) {
  const basicSalary = payrollInfo.basicSalary / 100;
  const allowances = (payrollInfo.allowances || 0) / 100;
  const housingAllowance = (payrollInfo.housingAllowance || 0) / 100;
  const grossSalary = basicSalary + allowances;
  const nssf = calculateNSSF(grossSalary);
  const shif = calculateSHIF(grossSalary);
  const housingLevy = calculateHousingLevy(grossSalary);
  const taxableIncome = grossSalary - nssf.total - housingLevy;
  const payeCalculation = calculatePAYE(taxableIncome);
  const totalDeductions = nssf.total + payeCalculation.afterRelief + shif + housingLevy;
  const netSalary = grossSalary - totalDeductions;
  return {
    basicSalary: Math.round(basicSalary * 100),
    grossSalary: Math.round(grossSalary * 100),
    // Deductions (in cents)
    nssfContribution: Math.round(nssf.total * 100),
    payeeTax: Math.round(payeCalculation.afterRelief * 100),
    shifContribution: Math.round(shif * 100),
    housingLevyDeduction: Math.round(housingLevy * 100),
    personalRelief: Math.round(PERSONAL_RELIEF_MONTHLY * 100),
    // Net (in cents)
    netSalary: Math.round(netSalary * 100),
    // Detailed breakdown
    details: {
      nssfTier1: Math.round(nssf.tier1 * 100),
      nssfTier2: Math.round(nssf.tier2 * 100),
      shifBasic: Math.round(grossSalary * SHIF_RATES.RATE * 100),
      shifCapped: Math.round(shif * 100),
      payeBeforeRelief: Math.round(payeCalculation.beforeRelief * 100),
      payeAfterRelief: Math.round(payeCalculation.afterRelief * 100),
      taxableIncome: Math.round(taxableIncome * 100),
      taxBracketApplied: payeCalculation.bracketApplied
    }
  };
}

// shared/currency.ts
var LEGACY_MINOR_UNITS_PER_MAJOR = 100;
function normalizeCurrencyAmount(value) {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? amount : 0;
}
function toMajorCurrencyAmount(value, unit = "major") {
  const amount = normalizeCurrencyAmount(value);
  return unit === "minor" ? amount / LEGACY_MINOR_UNITS_PER_MAJOR : amount;
}
function formatCurrencyAmount(value, currencyCode = "KES", options = {}) {
  const {
    unit = "major",
    locale = "en-KE",
    symbol = currencyCode,
    position = "before"
  } = options;
  const amount = toMajorCurrencyAmount(value, unit);
  const defaults = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode
  }).resolvedOptions();
  if (options.symbol === void 0 && options.position === void 0) {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: options.minimumFractionDigits ?? defaults.minimumFractionDigits,
      maximumFractionDigits: options.maximumFractionDigits ?? defaults.maximumFractionDigits
    }).format(amount);
  }
  const maximumFractionDigits = options.maximumFractionDigits ?? Math.max(2, defaults.maximumFractionDigits);
  const minimumFractionDigits = options.minimumFractionDigits ?? 0;
  const numeric = new Intl.NumberFormat(locale, {
    minimumFractionDigits,
    maximumFractionDigits
  }).format(amount);
  return position === "before" ? `${symbol} ${numeric}` : `${numeric} ${symbol}`;
}
function formatMinorCurrencyAmount(value, currencyCode = "KES", options = {}) {
  return formatCurrencyAmount(value, currencyCode, { ...options, unit: "minor" });
}

// server/utils/payslip-template.ts
function ksh(cents) {
  return formatMinorCurrencyAmount(cents, "KES", {
    symbol: "KES",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}
function monthLabel(period) {
  try {
    const [y, m] = period.split("-");
    return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString("en-KE", { month: "long", year: "numeric" });
  } catch {
    return period;
  }
}
function generatePayslipHTML(data) {
  const { employee: emp, company, earnings, deductions } = data;
  const month = monthLabel(data.payPeriod);
  const allowanceRows = earnings.allowances.map(
    (a) => `<tr><td class="lbl">${a.name}</td><td class="amt">${ksh(a.amount)}</td></tr>`
  ).join("");
  const nssfDetail = deductions.nssfTier1 > 0 ? `<tr><td class="lbl sub">NSSF Tier I</td><td class="amt">${ksh(deductions.nssfTier1)}</td></tr>
         <tr><td class="lbl sub">NSSF Tier II</td><td class="amt">${ksh(deductions.nssfTier2)}</td></tr>` : `<tr><td class="lbl sub">NSSF Contribution</td><td class="amt">${ksh(deductions.nssf)}</td></tr>`;
  const netPAYE = Math.max(0, deductions.paye - deductions.personalRelief);
  const reliefRow = deductions.personalRelief > 0 ? `<tr class="relief"><td class="lbl">Personal Relief</td><td class="amt credit">(${ksh(deductions.personalRelief)})</td></tr>` : "";
  const employerRows = (company.employerContributions || []).map(
    (item) => `<tr><td class="lbl">${item.name}</td><td class="amt">${ksh(item.amount)}</td><td class="amt">${item.balance === void 0 ? "0.00" : ksh(item.balance)}</td></tr>`
  ).join("");
  const additionalDeductionRows = (deductions.additional || []).map(
    (item) => `<tr><td class="lbl">${item.name}</td><td class="amt">${ksh(item.amount)}</td></tr>`
  ).join("");
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Payslip \u2014 ${month}</title>
<style>
  /* \u2500\u2500 Reset & Base \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:Arial,sans-serif;font-size:12px;color:#111;background:#fff;}
  .wrapper{max-width:900px;margin:0 auto;background:#fff;overflow:hidden;}
  /* \u2500\u2500 Header \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
    .header{color:#111;padding:8px 28px 2px;display:flex;
      justify-content:flex-end;align-items:flex-start;min-height:88px;}
    .header > div:first-child{display:none;}
    .header .co-name{font-size:20px;font-weight:700;letter-spacing:.5px;}
    .header .co-meta{font-size:10.5px;color:#555;margin-top:4px;}
    .header > div:last-child{display:block;}
  .header .slip-label{text-align:center;position:absolute;left:0;right:0;top:116px;}
  .header .slip-label h2{font-size:16px;font-weight:700;text-transform:none;
                          letter-spacing:0;color:#111;}
  .header .slip-label span{font-size:11px;opacity:.8;}
  /* \u2500\u2500 Divider banner \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  .band{background:#f0a800;height:4px;margin:52px 28px 0;}
  /* \u2500\u2500 Employee details \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  .section{padding:10px 28px;}
  .grid-2{display:grid;grid-template-columns:1fr 1fr;gap:8px 20px;}
  .grid-3{display:grid;grid-template-columns:1fr 1fr;gap:4px 32px;border-bottom:5px solid #c8c8c8;padding-bottom:12px;}
  .field{margin-bottom:2px;}
  .field .k{font-size:10px;color:#888;text-transform:uppercase;letter-spacing:.4px;}
  .field .v{font-size:12.5px;font-weight:600;color:#1a1a1a;}
  .section-title{font-size:13px;text-transform:none;letter-spacing:0;
                  color:#111;font-weight:700;border-bottom:2px solid #111;
                  padding-bottom:4px;margin-bottom:12px;}
  /* \u2500\u2500 Tables \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  .pay-tables{display:grid;grid-template-columns:1fr 1fr 1fr;gap:18px;padding:48px 28px 16px;border-top:1px solid #111;}
  table{width:100%;border-collapse:collapse;}
  table thead tr{background:#d9d9d9;}
  table thead th{font-size:10.5px;text-transform:uppercase;letter-spacing:.4px;
                  color:#111;padding:5px 8px;text-align:left;border-bottom:1px solid #aaa;}
  table thead th.amt{text-align:right;}
  table td{padding:5px 8px;border-bottom:1px solid #eef0f4;vertical-align:middle;}
  td.lbl{color:#3a3a3a;}
  td.lbl.sub{padding-left:18px;color:#666;font-style:italic;}
  td.amt{text-align:right;font-variant-numeric:tabular-nums;font-weight:500;}
  td.credit{color:#1a7c4e;font-weight:600;}
  tr.relief td{background:#f5fbf8;}
  tr.subtotal td{background:#f9fafc;font-weight:600;border-top:1px solid #c8d0e0;}
  tr.grandtotal td{background:#1a3c6e;color:#fff;font-weight:700;font-size:13px;}
  tr.grandtotal td.amt{color:#f0c040;font-size:14px;}
  /* \u2500\u2500 Net Pay box \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  .netpay-box{margin:0 28px 20px;background:#e8edf2;border-top:2px solid #1a3c6e;
              padding:8px 28px;display:flex;justify-content:space-between;align-items:center;color:#111;}
  .netpay-box .label{font-size:11px;text-transform:uppercase;letter-spacing:.8px;opacity:.8;}
  .netpay-box .amount{font-size:18px;font-weight:800;color:#111;letter-spacing:0;}
  .netpay-box .period{font-size:11px;opacity:.7;}
  /* \u2500\u2500 Banking / statutory \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  .info-row{display:none;}
  /* \u2500\u2500 Footer \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
  .footer{background:#f8f9fb;border-top:1px solid #e8ecf2;padding:12px 28px;
          display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;}
  .footer p{font-size:10px;color:#888;}
  .footer .conf{color:#c0392b;font-weight:600;font-size:10px;}
  @media print{
    body{background:#fff;}
    .wrapper{box-shadow:none;margin:0;border-radius:0;}
  }
  @media(max-width:600px){
    .pay-tables,.info-row,.grid-3{grid-template-columns:1fr;}
    .header{flex-direction:column;}
    .header .slip-label{text-align:center;}
  }
</style>
</head>
<body>
<div class="wrapper">

  <!-- \u2500\u2500 Header \u2500\u2500 -->
  <div class="header">
    <div>
      ${company.logo ? `<img src="${company.logo}" alt="Logo" style="height:40px;margin-bottom:6px;display:block;"/>` : ""}
      <div class="co-name">${company.name}</div>
      <div class="co-meta">${company.address}</div>
    </div>
    <div class="slip-label">
      <h2>Pay Slip</h2>
      <span>${month}</span>
    </div>
  </div>
  <div class="band"></div>

  <!-- \u2500\u2500 Employee Details \u2500\u2500 -->
  <div class="section">
    <div class="section-title">Employee Information</div>
    <div class="grid-3">
      <div class="field"><div class="k">Full Name</div><div class="v">${emp.name}</div></div>
      <div class="field"><div class="k">Employee No.</div><div class="v">${emp.id || "\u2014"}</div></div>
      <div class="field"><div class="k">National ID</div><div class="v">${emp.nationalId || "\u2014"}</div></div>
      <div class="field"><div class="k">Department</div><div class="v">${emp.department || "\u2014"}</div></div>
      <div class="field"><div class="k">Position / Grade</div><div class="v">${emp.position || "\u2014"}</div></div>
      <div class="field"><div class="k">KRA PIN</div><div class="v">${emp.taxPin || "\u2014"}</div></div>
      <div class="field"><div class="k">NSSF No.</div><div class="v">${emp.nssfNumber || "\u2014"}</div></div>
      <div class="field"><div class="k">NHIF / SHIF No.</div><div class="v">${emp.nhifNumber || "\u2014"}</div></div>
      <div class="field"><div class="k">Pay Date</div><div class="v">${data.payDate.substring(0, 10)}</div></div>
    </div>
  </div>

  <!-- \u2500\u2500 Earnings + Deductions \u2500\u2500 -->
  <div class="pay-tables">
    <!-- Earnings -->
    <div>
      <div class="section-title">Earnings</div>
      <table>
        <thead>
          <tr><th>Description</th><th class="amt">Amount (KES)</th></tr>
        </thead>
        <tbody>
          <tr><td class="lbl">Basic Salary</td><td class="amt">${ksh(earnings.basicSalary)}</td></tr>
          ${allowanceRows}
          <tr class="subtotal"><td class="lbl">Gross Salary</td><td class="amt">${ksh(earnings.grossSalary)}</td></tr>
        </tbody>
      </table>
    </div>

    <!-- Deductions -->
    <div>
      <div class="section-title">Deductions</div>
      <table>
        <thead>
          <tr><th>Description</th><th class="amt">Amount (KES)</th></tr>
        </thead>
        <tbody>
          <!-- PAYE -->
          <tr><td class="lbl">PAYE (Gross Tax)</td><td class="amt">${ksh(deductions.paye)}</td></tr>
          ${reliefRow}
          <tr class="subtotal"><td class="lbl">Net PAYE</td><td class="amt">${ksh(netPAYE)}</td></tr>
          <!-- NSSF -->
          ${nssfDetail}
          <!-- SHIF -->
          <tr><td class="lbl">SHIF (Social Health)</td><td class="amt">${ksh(deductions.shif)}</td></tr>
          <!-- Housing Levy -->
          <tr><td class="lbl">Housing Levy (AHL)</td><td class="amt">${ksh(deductions.housingLevy)}</td></tr>
          ${additionalDeductionRows}
          <!-- Total -->
          <tr class="subtotal"><td class="lbl">Total Deductions</td><td class="amt">${ksh(deductions.total)}</td></tr>
        </tbody>
      </table>
    </div>

    <div>
      <div class="section-title">Company Contributions</div>
      <table>
        <thead><tr><th>Description</th><th class="amt">Amount</th><th class="amt">Balance</th></tr></thead>
        <tbody>
          ${employerRows || `<tr><td class="lbl">Employer contributions</td><td class="amt">KES 0.00</td><td class="amt">KES 0.00</td></tr>`}
          <tr class="subtotal"><td class="lbl">Total Company Contribution</td><td class="amt">${ksh((company.employerContributions || []).reduce((sum2, item) => sum2 + item.amount, 0))}</td><td class="amt">KES 0.00</td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- \u2500\u2500 Net Pay \u2500\u2500 -->
  <div class="netpay-box">
    <div>
      <div class="label">Net Pay</div>
      <div class="period">${month} \xB7 Pay Date: ${data.payDate.substring(0, 10)}</div>
    </div>
    <div class="amount">${ksh(data.netSalary)}</div>
  </div>

  <!-- \u2500\u2500 Banking / Statutory Summary \u2500\u2500 -->
  <div class="info-row">
    <div>
      <div class="section-title">Banking Details</div>
      <div class="field"><div class="k">Bank</div><div class="v">${emp.bankName || "\u2014"}</div></div>
      <div class="field"><div class="k">Account Number</div><div class="v">${emp.bankAccount ? `\u2022\u2022\u2022\u2022${emp.bankAccount.slice(-4)}` : "\u2014"}</div></div>
    </div>
    <div>
      <div class="section-title">Statutory Summary</div>
      <div class="field"><div class="k">Gross Salary</div><div class="v">${ksh(earnings.grossSalary)}</div></div>
      <div class="field"><div class="k">Total Deductions</div><div class="v">${ksh(deductions.total)}</div></div>
      <div class="field"><div class="k">Net Pay</div><div class="v" style="color:#1a3c6e;font-size:14px;">${ksh(data.netSalary)}</div></div>
    </div>
  </div>

  <!-- \u2500\u2500 Footer \u2500\u2500 -->
  <div class="footer">
    <p>This is a computer-generated payslip and does not require a signature. 
       Generated on ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-KE", { dateStyle: "long" })}.</p>
    <p class="conf">CONFIDENTIAL \u2014 For addressee only</p>
  </div>

</div>
</body>
</html>`;
}

// server/utils/company-info.ts
init_db();
init_schema();
import { eq as eq5 } from "drizzle-orm";
async function getCompanyInfo() {
  const defaults = {
    name: process.env.COMPANY_NAME || "Your Company",
    email: process.env.COMPANY_EMAIL || "",
    phone: "",
    address: "",
    website: "",
    tagline: "",
    kraPin: "",
    logo: "",
    currency: "KES"
  };
  try {
    const db2 = await getDb();
    if (!db2) return defaults;
    const rows = await db2.select().from(settings).where(eq5(settings.category, "company"));
    let logoRows = await db2.select().from(settings).where(eq5(settings.category, "app_logo"));
    if (logoRows.length === 0) {
      logoRows = await db2.select().from(settings).where(eq5(settings.category, "company_logos"));
    }
    const map = {};
    rows.forEach((r) => {
      if (r.key) map[r.key] = r.value ?? "";
    });
    logoRows.forEach((r) => {
      if (r.key) map[r.key] = r.value ?? "";
    });
    const logo = map.largeLogo || map.smallLogo || map.logoUrl || map.logo || map.imageUrl || map.companyLogo || map.company_logo || map.logo_url || "";
    return {
      name: map.companyName || map.name || defaults.name,
      email: map.email || map.companyEmail || defaults.email,
      phone: map.phone || defaults.phone,
      address: map.address || defaults.address,
      website: map.website || defaults.website,
      tagline: map.tagline || defaults.tagline,
      kraPin: map.kraPin || map.taxId || defaults.kraPin,
      logo,
      currency: map.currency || map.defaultCurrency || defaults.currency
    };
  } catch {
    return defaults;
  }
}

// server/utils/budgetEnforcer.ts
import { TRPCError as TRPCError3 } from "@trpc/server";
init_schema();
import { eq as eq6, and as and5 } from "drizzle-orm";
async function findActiveBudget(database, orgId, departmentId, fiscalYear) {
  try {
    const year = fiscalYear ?? (/* @__PURE__ */ new Date()).getFullYear();
    const conditions = [eq6(budgets.fiscalYear, year)];
    if (orgId) conditions.push(eq6(budgets.organizationId, orgId));
    if (departmentId) conditions.push(eq6(budgets.departmentId, departmentId));
    const rows = await database.select().from(budgets).where(and5(...conditions)).limit(10);
    if (!rows.length) return null;
    const active = rows.find((b) => b.budgetStatus === "active");
    const best = active ?? rows[0];
    return {
      budgetId: best.id,
      budgetName: best.budgetName || `Budget FY${year}`,
      remaining: best.remaining ?? best.amount - (best.totalActual ?? 0),
      allocated: best.amount,
      totalActual: best.totalActual ?? 0
    };
  } catch (err) {
    console.error("[budgetEnforcer] findActiveBudget error:", err);
    return null;
  }
}
async function checkBudget(database, amountCents, orgId, options) {
  let budget = null;
  if (options?.budgetId) {
    try {
      const rows = await database.select().from(budgets).where(eq6(budgets.id, options.budgetId)).limit(1);
      if (rows.length) {
        const b = rows[0];
        budget = {
          budgetId: b.id,
          budgetName: b.budgetName || `Budget ${b.id}`,
          remaining: b.remaining ?? b.amount - (b.totalActual ?? 0),
          allocated: b.amount,
          totalActual: b.totalActual ?? 0
        };
      }
    } catch (err) {
      console.error("[budgetEnforcer] explicit budget lookup error:", err);
    }
  } else {
    budget = await findActiveBudget(database, orgId, options?.departmentId, options?.fiscalYear);
  }
  if (!budget) return null;
  if (budget.remaining < amountCents) {
    const label = options?.label ? ` for ${options.label}` : "";
    throw new TRPCError3({
      code: "BAD_REQUEST",
      message: JSON.stringify({
        code: "BUDGET_DEPLETED",
        budgetName: budget.budgetName,
        requested: amountCents,
        remaining: budget.remaining,
        message: `Budget "${budget.budgetName}" is insufficient${label}. Requested: ${formatMinorCurrencyAmount(amountCents, "KES", { symbol: "Ksh" })}, Available: ${formatMinorCurrencyAmount(budget.remaining, "KES", { symbol: "Ksh" })}.`
      })
    });
  }
  return budget;
}
async function deductFromBudget(database, budgetId2, amountCents) {
  try {
    const rows = await database.select({ remaining: budgets.remaining, totalActual: budgets.totalActual, amount: budgets.amount }).from(budgets).where(eq6(budgets.id, budgetId2)).limit(1);
    if (!rows.length) return;
    const b = rows[0];
    const newTotalActual = (b.totalActual ?? 0) + amountCents;
    const newRemaining = b.amount - newTotalActual;
    await database.update(budgets).set({
      totalActual: newTotalActual,
      remaining: Math.max(0, newRemaining),
      budgetStatus: newRemaining <= 0 ? "closed" : b.budgetStatus ?? "active",
      updatedAt: now()
    }).where(eq6(budgets.id, budgetId2));
  } catch (err) {
    console.error("[budgetEnforcer] deductFromBudget error:", err);
    throw err;
  }
}
function now() {
  return (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").substring(0, 19);
}

// server/services/emailService.ts
import { TRPCError as TRPCError4 } from "@trpc/server";

// server/_core/mail.ts
init_db();
init_schema();
import nodemailer from "nodemailer";
import { eq as eq7, and as and6 } from "drizzle-orm";

// server/_core/emailTemplates.ts
function htmlToPlainText(html) {
  return html.replace(/<br\s*\/?>/gi, "\n").replace(/<\/p>/gi, "\n\n").replace(/<\/div>/gi, "\n").replace(/<\/h[1-6]>/gi, "\n\n").replace(/<\/li>/gi, "\n").replace(/<li[^>]*>/gi, "  \u2022 ").replace(/<a[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi, "$2 ($1)").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\n{3,}/g, "\n\n").trim();
}
function resolveEmailLinks(html, baseUrl = process.env.APP_URL || process.env.PUBLIC_APP_URL || "https://kiini.africa") {
  const normalizedBase = baseUrl.replace(/\/$/, "");
  const resolved = html.replace(/\b(href|src)=(['"])(.*?)\2/gi, (_match, attribute, quote, rawValue) => {
    const value = rawValue.replace(/&amp;/gi, "&").trim();
    if (!value || value.startsWith("{{") || value.startsWith("${")) return `${attribute}=${quote}${quote}`;
    if (attribute.toLowerCase() === "src" && /^data:image\/[^;]+;base64,/i.test(value)) {
      return `${attribute}=${quote}${normalizedBase}/logo.png${quote}`;
    }
    if (value.startsWith("#")) return `${attribute}=${quote}${value}${quote}`;
    try {
      const parsed = new URL(value, `${normalizedBase}/`);
      const allowed = attribute.toLowerCase() === "src" ? ["http:", "https:", "data:", "cid:"] : ["http:", "https:", "mailto:", "tel:"];
      if (!allowed.includes(parsed.protocol)) return `${attribute}=${quote}${quote}`;
      return `${attribute}=${quote}${parsed.href.replace(/&/g, "&amp;")}${quote}`;
    } catch {
      return `${attribute}=${quote}${quote}`;
    }
  });
  return resolved.replace(/<a\b([^>]*?)\bhref=(['"])\s*\2([^>]*)>([\s\S]*?)<\/a>/gi, "$4$5");
}
function buildEmailHtmlFromContent(content, subject, companyName = "Kiini: One Hub. Total Control", companyEmail = "", logoUrl = "") {
  const normalized = resolveEmailLinks(content);
  if (/<!doctype\s+html|<html[\s>]/i.test(normalized)) return normalized;
  return buildEmailHtml({
    title: subject,
    bodyContent: normalized,
    companyName,
    companyEmail,
    logoUrl: resolveEmailLinks(`<img src="${logoUrl}">`).match(/\bsrc="([^"]+)"/i)?.[1] || logoUrl
  });
}
function escapeEmailText(text4) {
  return text4.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]).replace(/\r\n?|\n/g, "<br>");
}
function buildEmailHtml(opts) {
  const {
    title,
    preheader = "",
    bodyContent,
    ctaText,
    ctaUrl,
    ctaSecondaryText,
    ctaSecondaryUrl,
    companyName = "Kiini: One Hub. Total Control",
    companyEmail = "",
    logoUrl = "",
    brandColor = "#E78200",
    footerNote = ""
  } = opts;
  const year = (/* @__PURE__ */ new Date()).getFullYear();
  const logoHtml = logoUrl ? `<img src="${logoUrl}" alt="${companyName}" style="max-height: 40px; max-width: 160px; display: inline-block; vertical-align: middle;" />` : `<span style="font-size: 22px; font-weight: 700; color: #ffffff; font-family: Arial, sans-serif; letter-spacing: -0.5px;">${companyName}</span>`;
  const ctaButtonHtml = ctaText && ctaUrl ? `
    <div style="text-align: center; margin: 32px 0 24px;">
      <a href="${ctaUrl}" target="_blank"
         style="display: inline-block; padding: 14px 36px; background-color: ${brandColor}; color: #ffffff;
                text-decoration: none; border-radius: 8px; font-size: 15px; font-weight: 600;
                font-family: Arial, sans-serif; letter-spacing: 0.3px; mso-padding-alt: 14px 36px;">
        <!--[if mso]><i style="letter-spacing: 36px; mso-font-width: -100%; mso-text-raise: 30pt;">&nbsp;</i><![endif]-->
        ${ctaText}
        <!--[if mso]><i style="letter-spacing: 36px; mso-font-width: -100%;">&nbsp;</i><![endif]-->
      </a>
    </div>
  ` : "";
  const ctaSecondaryHtml = ctaSecondaryText && ctaSecondaryUrl ? `
    <div style="text-align: center; margin: 0 0 24px;">
      <a href="${ctaSecondaryUrl}" target="_blank"
         style="display: inline-block; padding: 12px 28px; background-color: transparent; color: ${brandColor};
                text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600;
                font-family: Arial, sans-serif; border: 2px solid ${brandColor};">
        ${ctaSecondaryText}
      </a>
    </div>
  ` : "";
  const footerNoteHtml = footerNote ? `
    <p style="margin: 16px 0 0; color: #9ca3af; font-size: 12px; font-family: Arial, sans-serif; text-align: center; line-height: 1.6;">
      ${footerNote}
    </p>
  ` : "";
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no" />
  <title>${title}</title>
  <!--[if mso]>
  <noscript>
    <xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml>
  </noscript>
  <![endif]-->
  <style>
    @media only screen and (max-width: 600px) {
      .email-body-content { padding: 24px 16px !important; }
      .email-wrapper { padding: 16px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #F2F3F7; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; -webkit-font-smoothing: antialiased; mso-line-height-rule: exactly;">
  <!-- Preheader text (hidden) -->
  ${preheader ? `<div style="display: none; max-height: 0; overflow: hidden; mso-hide: all; font-size: 1px; line-height: 1px; color: #F2F3F7;">${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>` : ""}

  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #F2F3F7;">
    <tr>
      <td style="padding: 32px 16px;" class="email-wrapper">
        <!-- Outer centered container -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 8px; overflow: hidden;">

          <!-- Header / Brand bar -->
          <tr>
            <td style="background-color: #001D3D; border-bottom: 3px solid ${brandColor};
                        padding: 24px 32px; text-align: left;">
              ${logoHtml}
            </td>
          </tr>

          <!-- Main content card -->
          <tr>
            <td style="background-color: #ffffff; padding: 32px; color: #33344F;" class="email-body-content">
              ${bodyContent}
              ${ctaButtonHtml}
              ${ctaSecondaryHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #ffffff; padding: 24px 32px; border-top: 1px solid #E3E4EC; text-align: left;">
              <p style="margin: 0 0 8px; color: #62647A; font-size: 12px; font-family: Arial, sans-serif; line-height: 1.6;">
                \xA9 ${year} ${companyName}${companyEmail ? ` \xB7 <a href="mailto:${companyEmail}" style="color: ${brandColor}; text-decoration: none;">${companyEmail}</a>` : ""}
              </p>
              <p style="margin: 0; color: #9A9CB0; font-size: 11px; font-family: Arial, sans-serif;">
                This email was sent by ${companyName}. If you believe this was sent in error, please disregard it.
              </p>
              ${footerNoteHtml}
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// server/_core/mail.ts
async function getEmailSetting(key) {
  try {
    const db2 = await getDb();
    if (!db2) return void 0;
    const rows = await db2.select().from(settings).where(and6(eq7(settings.category, "email"), eq7(settings.key, key))).limit(1);
    return rows[0]?.value ?? void 0;
  } catch {
    return void 0;
  }
}
var getSmtpConfig = async () => {
  const host = await getEmailSetting("smtpHost") || process.env.SMTP_HOST;
  const portStr = await getEmailSetting("smtpPort") || process.env.SMTP_PORT;
  const port = portStr ? parseInt(portStr, 10) : void 0;
  const user = await getEmailSetting("smtpUser") || process.env.SMTP_USER;
  const pass = await getEmailSetting("smtpPass") || await getEmailSetting("smtpPassword") || process.env.SMTP_PASSWORD || process.env.SMTP_PASS;
  const secureSetting = await getEmailSetting("smtpSecure");
  const secure = secureSetting ? secureSetting === "true" : process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465;
  if (!host || !port) {
    throw new Error("SMTP_HOST and SMTP_PORT must be configured to send email (set via env vars or Settings \u2192 Email)");
  }
  return { host: host.trim(), port, secure, user: user?.trim(), pass };
};
async function sendEmail(opts) {
  try {
    const smtpConfig = await getSmtpConfig();
    const { host, port, secure, user, pass } = smtpConfig;
    const createTransporter = (targetPort, targetSecure) => {
      return nodemailer.createTransport({
        host,
        port: targetPort,
        secure: targetSecure,
        connectionTimeout: 1e4,
        greetingTimeout: 1e4,
        auth: user && pass ? { user, pass } : void 0
      });
    };
    const fromEmail = await getEmailSetting("fromEmail") || await getEmailSetting("smtpFromEmail") || process.env.SMTP_FROM_EMAIL || user || "info@kiini.africa";
    const companyInfo = await getCompanyInfo();
    const fromName = await getEmailSetting("fromName") || process.env.SMTP_FROM_NAME || companyInfo.name;
    const from = opts.from || `"${fromName}" <${fromEmail}>`;
    const html = opts.html ? buildEmailHtmlFromContent(opts.html, opts.subject, companyInfo.name, companyInfo.email, companyInfo.logo) : opts.text ? buildEmailHtmlFromContent(`<p>${escapeEmailText(opts.text)}</p>`, opts.subject, companyInfo.name, companyInfo.email, companyInfo.logo) : void 0;
    const sendWith = async (targetPort, targetSecure) => {
      const transporter = createTransporter(targetPort, targetSecure);
      const textFallback = opts.text || (html ? htmlToPlainText(html) : void 0);
      return transporter.sendMail({
        from,
        to: opts.to,
        cc: opts.cc || void 0,
        bcc: opts.bcc || void 0,
        subject: opts.subject,
        html,
        text: textFallback,
        attachments: opts.attachments
      });
    };
    let info;
    try {
      info = await sendWith(port, secure);
    } catch (error) {
      const shouldRetryOn587 = port === 465 && (error?.code === "ECONNREFUSED" || error?.code === "ETIMEDOUT" || error?.code === "ESOCKET" || /greeting|handshake|timeout/i.test(error?.message || ""));
      if (shouldRetryOn587) {
        console.warn("[MAIL] SMTP 465 connection failed, retrying with STARTTLS on 587");
        info = await sendWith(587, false);
      } else {
        throw error;
      }
    }
    console.log("[MAIL] Sent", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("[MAIL] Send failed:", error);
    return { success: false, error: error.message };
  }
}

// server/services/emailService.ts
init_db();
import { v4 as uuidv42 } from "uuid";

// server/services/notificationRenderer.ts
init_db();
init_schema();
import { and as and7, eq as eq8 } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";
var publicAppUrl = () => (process.env.APP_URL || process.env.PUBLIC_APP_URL || "https://kiini.africa").replace(/\/$/, "");
function absolutePublicUrl(value, baseUrl) {
  const url = String(value ?? "").trim();
  if (!url) return "";
  if (/^(?:https?:|data:)/i.test(url)) return url;
  if (url.startsWith("//")) return `https:${url}`;
  return `${baseUrl}/${url.replace(/^\/+/, "")}`;
}
var actionLinkTokens = /* @__PURE__ */ new Set([
  "action_url",
  "alert_url",
  "approve_url",
  "appointment_url",
  "backup_url",
  "cta_url",
  "dashboard_url",
  "document_url",
  "download_url",
  "estimate_url",
  "feedback_url",
  "hr_portal_url",
  "integration_url",
  "invitation_url",
  "invoice_url",
  "new_estimate_url",
  "new_proposal_url",
  "notification_url",
  "payslip_url",
  "project_url",
  "proposal_url",
  "receipt_pdf_url",
  "receipt_url",
  "refund_url",
  "reminder_action_url",
  "retry_payment_url",
  "sign_url",
  "task_url",
  "ticket_url",
  "verification_url"
]);
var routeTokens = {
  action_url: (context) => stringContextValue(context, "actionUrl", "action_url"),
  alert_url: (context) => stringContextValue(context, "actionUrl", "action_url") || "/admin/system-health",
  appointment_url: (_context, basePath) => `${basePath}/calendar`,
  approve_url: (context, basePath) => resourcePath(context, "approval", "approvalId", basePath) || `${basePath}/approvals`,
  audit_log_url: () => "/audit-logs",
  backup_url: () => "/admin/backups",
  app_url: () => publicAppUrl(),
  cta_url: (context, basePath) => stringContextValue(context, "actionUrl", "action_url", "ctaUrl", "cta_url") || `${basePath}/dashboard`,
  dashboard_url: (_context, basePath) => `${basePath}/dashboard`,
  estimate_url: (context, basePath) => resourcePath(context, "estimate", "estimateId", basePath) || `${basePath}/estimates`,
  feedback_url: (context, basePath) => stringContextValue(context, "feedbackUrl", "feedback_url", "actionUrl", "action_url") || `${basePath}/notifications`,
  hr_portal_url: (_context, basePath) => `${basePath}/hr`,
  integration_url: () => "/integrations",
  invitation_url: (context) => {
    const explicit = stringContextValue(context, "invitationUrl", "invitation_url");
    if (explicit) return explicit;
    const token = stringContextValue(context, "invitationToken", "invitation_token", "token");
    return token ? `/signup?invitation=${encodeURIComponent(token)}` : "/signup";
  },
  project_url: (context, basePath) => resourcePath(context, "project", "projectId", basePath),
  invoice_url: (context, basePath) => resourcePath(context, "invoice", "invoiceId", basePath),
  client_url: (context, basePath) => resourcePath(context, "client", "clientId", basePath),
  task_url: (context, basePath) => resourcePath(context, "task", "taskId", basePath),
  leave_url: (context, basePath) => resourcePath(context, "leave", "leaveRequestId", basePath),
  document_url: (context, basePath) => resourcePath(context, "document", "documentId", basePath),
  expense_url: (context, basePath) => resourcePath(context, "expense", "expenseId", basePath),
  lock_account_url: () => "/admin/system-health",
  download_url: (context, basePath) => {
    const explicit = stringContextValue(context, "downloadUrl", "download_url");
    if (explicit) return explicit;
    const exportId = stringContextValue(context, "exportId", "export_id", "entityId", "entity_id");
    return exportId ? `${basePath}/exports/${encodeURIComponent(exportId)}` : void 0;
  },
  new_estimate_url: (_context, basePath) => `${basePath}/estimates/create`,
  new_proposal_url: (_context, basePath) => `${basePath}/proposals?action=create`,
  notification_url: (_context, basePath) => `${basePath}/notifications`,
  payslip_url: (context, basePath) => {
    const explicit = stringContextValue(context, "payslipUrl", "payslip_url");
    if (explicit) return explicit;
    const payslipId = stringContextValue(context, "payslipId", "payslip_id");
    const payrollId = stringContextValue(context, "payrollId", "payroll_id");
    return payslipId ? `${basePath}/payslips/${encodeURIComponent(payslipId)}` : payrollId ? `${basePath}/payroll/${encodeURIComponent(payrollId)}` : `${basePath}/my-payslips`;
  },
  proposal_url: (context, basePath) => resourcePath(context, "proposal", "proposalId", basePath) || `${basePath}/proposals`,
  receipt_pdf_url: (context, basePath) => stringContextValue(context, "receiptPdfUrl", "receipt_pdf_url", "receiptUrl", "receipt_url") || resourcePath(context, "receipt", "receiptId", basePath) || `${basePath}/receipts`,
  receipt_url: (context, basePath) => stringContextValue(context, "receiptUrl", "receipt_url") || resourcePath(context, "receipt", "receiptId", basePath) || `${basePath}/receipts`,
  refund_url: (context, basePath) => stringContextValue(context, "refundUrl", "refund_url") || resourcePath(context, "payment", "paymentId", basePath) || `${basePath}/payments`,
  reminder_action_url: (context, basePath) => stringContextValue(context, "reminderActionUrl", "reminder_action_url", "actionUrl", "action_url") || `${basePath}/notifications`,
  reschedule_url: (_context, basePath) => `${basePath}/calendar`,
  reset_link: (context) => {
    const explicit = stringContextValue(context, "resetLink", "reset_link", "resetUrl", "reset_url");
    if (explicit) return explicit;
    const token = stringContextValue(context, "resetToken", "reset_token", "token");
    return token ? `/reset-password?token=${encodeURIComponent(token)}` : "/reset-password";
  },
  review_url: (context, basePath) => {
    const explicit = stringContextValue(context, "reviewUrl", "review_url");
    if (explicit) return explicit;
    const id = stringContextValue(context, "reviewId", "review_id", "entityId", "entity_id");
    return id ? `${basePath}/performance-reviews/${encodeURIComponent(id)}` : `${basePath}/performance-reviews`;
  },
  sign_url: (context, basePath) => stringContextValue(context, "signUrl", "sign_url") || resourcePath(context, "document", "documentId", basePath) || `${basePath}/e-signatures`,
  status_page_url: () => "/admin/system-health",
  subscription_url: (_context, basePath) => `${basePath}/billing`,
  ticket_url: (context, basePath) => resourcePath(context, "ticket", "ticketId", basePath) || `${basePath}/tickets`,
  unlock_url: (context) => stringContextValue(context, "unlockUrl", "unlock_url") || "/login",
  verification_url: (context) => {
    const explicit = stringContextValue(context, "verificationUrl", "verification_url");
    if (explicit) return explicit;
    const token = stringContextValue(context, "verificationToken", "verification_token", "token");
    return token ? `/verify-email?token=${encodeURIComponent(token)}` : "/verify-email";
  },
  login_url: (context) => stringContextValue(context, "loginUrl", "login_url") || "/login",
  unsubscribe_url: (context, basePath) => stringContextValue(context, "unsubscribeUrl", "unsubscribe_url") || `${basePath}/settings`
};
function stringContextValue(context, ...keys) {
  for (const key of keys) {
    const value = context[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return void 0;
}
function resourcePath(context, resource, idKey, basePath) {
  const explicit = stringContextValue(context, `${resource}Url`, `${resource}_url`);
  if (explicit) return explicit;
  const entityType = (stringContextValue(context, "entityType", "entity_type", "templateId", "template_id") || "").toLowerCase();
  const id = stringContextValue(context, idKey, idKey.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`), "entityId", "entity_id");
  if (!id || entityType && !entityType.includes(resource)) return void 0;
  const route = resource === "leave" ? "leave-management" : resource === "document" ? "documents" : `${resource}s`;
  return `${basePath}/${route}/${encodeURIComponent(id)}`;
}
function enrichContextWithRoutes(context) {
  const slug = stringContextValue(context, "organizationSlug", "organization_slug", "orgSlug", "org_slug");
  const basePath = slug ? `/org/${encodeURIComponent(slug)}` : "";
  const enriched = { ...context };
  for (const [token, resolver] of Object.entries(routeTokens)) {
    if (!stringContextValue(enriched, token, token.replace(/_([a-z])/g, (_match, letter) => letter.toUpperCase()))) {
      const resolved = resolver(context, basePath);
      if (resolved) enriched[token] = resolved;
    }
  }
  const actionUrl = stringContextValue(enriched, "actionUrl", "action_url") || stringContextValue(enriched, "projectUrl", "project_url", "invoiceUrl", "invoice_url", "taskUrl", "task_url", "clientUrl", "client_url", "leaveUrl", "leave_url", "expenseUrl", "expense_url", "documentUrl", "document_url");
  if (actionUrl && !stringContextValue(enriched, "actionUrl", "action_url")) enriched.actionUrl = actionUrl;
  return enriched;
}
function normalizeTokenName(name) {
  return name.replace(/([a-z0-9])([A-Z])/g, "$1_$2").replace(/[.-]+/g, "_").toLowerCase();
}
function tokenNameVariants(name) {
  const snakeCase = normalizeTokenName(name);
  const camelCase = snakeCase.replace(/_([a-z0-9])/g, (_match, character) => character.toUpperCase());
  return [.../* @__PURE__ */ new Set([name, name.toLowerCase(), snakeCase, camelCase])];
}
function addToken(values, name, value) {
  const text4 = String(value ?? "");
  for (const variant of tokenNameVariants(name)) values[variant] = text4;
}
function flattenContext(context) {
  const baseUrl = publicAppUrl();
  const company = context.company || {};
  const user = context.user || {};
  const email = context.recipientEmail || context.recipient_email || user.email || context.userEmail || "";
  const recipient = context.recipientName || context.recipient_name || user.name || context.clientName || email;
  const firstName = String(context.recipient_first_name || recipient || "").trim().split(/\s+/)[0] || "there";
  const website = absolutePublicUrl(context.company_website || company.website || baseUrl, baseUrl);
  const logo = absolutePublicUrl(context.company_logo_url || company.logo || company.logoUrl || company.logo_url, baseUrl) || `${baseUrl}/logo.png`;
  const defaults = {
    todays_date: (/* @__PURE__ */ new Date()).toLocaleDateString(),
    app_url: baseUrl,
    app_name: String(context.app_name || company.name || "Kiini"),
    company_name: String(context.company_name || company.name || "Kiini"),
    company_email: String(context.company_email || company.email || "info@kiini.africa"),
    company_phone: String(context.company_phone || company.phone || ""),
    company_address: String(context.company_address || company.address || ""),
    company_website: website,
    company_logo_url: logo,
    company_facebook_url: absolutePublicUrl(context.company_facebook_url || company.facebook || website, baseUrl),
    company_instagram_url: absolutePublicUrl(context.company_instagram_url || company.instagram || website, baseUrl),
    company_linkedin_url: absolutePublicUrl(context.company_linkedin_url || company.linkedin || website, baseUrl),
    company_twitter_url: absolutePublicUrl(context.company_twitter_url || company.twitter || website, baseUrl),
    recipient_email: String(email),
    recipient_first_name: firstName,
    login_url: absolutePublicUrl(context.login_url || context.loginUrl || `${baseUrl}/login`, baseUrl),
    app_logo: logo
  };
  const values = {};
  for (const [name, value] of Object.entries(defaults)) addToken(values, name, value);
  for (const [group, value] of Object.entries(context)) {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      for (const [key, nestedValue] of Object.entries(value)) {
        addToken(values, `${group}.${key}`, nestedValue);
        addToken(values, `${group}_${key}`, nestedValue);
      }
    } else if (value != null) {
      addToken(values, group, value);
    }
  }
  return values;
}
function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}
function replaceTokens(value, tokens, escapeValues = false) {
  return value.replace(/\{\{?([\w.-]+)\}?\}|\$\{([\w.-]+)\}/g, (_match, braceKey, dollarKey) => {
    const key = braceKey || dollarKey;
    const normalizedKey = normalizeTokenName(key);
    const replacement = tokens[key] ?? tokens[normalizedKey] ?? (actionLinkTokens.has(normalizedKey) ? tokens.action_url : void 0) ?? "";
    return escapeValues ? escapeHtml(replacement) : replacement;
  });
}
function resolveContextValue(context, path2) {
  return path2.split(".").reduce((current, key) => current && typeof current === "object" ? current[key] : void 0, context);
}
function renderEachBlocks(value, context, tokens) {
  return value.replace(/<!--\s*\{\{#each\s+([\w.]+)\s*\}\}\s*-->([\s\S]*?)<!--\s*\{\{\/each\s*\}\}\s*-->/gi, (_match, path2, block) => {
    const collection = resolveContextValue(context, path2);
    if (!Array.isArray(collection)) return "";
    return collection.map((item) => {
      const itemTokens = flattenContext({ ...context, this: item });
      return replaceTokens(block, { ...tokens, ...itemTokens }, true);
    }).join("");
  });
}
function renderConditionalBlocks(value, context) {
  return value.replace(/<!--\s*\{\{#if\s+([\w.]+)\s*\}\}\s*-->([\s\S]*?)(?:<!--\s*\{\{else\}\}\s*-->([\s\S]*?))?<!--\s*\{\{\/if\s*\}\}\s*-->/gi, (_match, path2, whenTrue, whenFalse = "") => {
    const condition = resolveContextValue(context, path2);
    const enabled = Array.isArray(condition) ? condition.length > 0 : typeof condition === "string" ? Boolean(condition.trim()) && !/^(?:false|0|no)$/i.test(condition.trim()) : Boolean(condition);
    return enabled ? whenTrue : whenFalse;
  });
}
function resolveLinks(value) {
  const baseUrl = publicAppUrl();
  const resolved = value.replace(/\b(href|src)=(['"])(.*?)\2/gi, (_match, attribute, quote, rawUrl) => {
    const url = rawUrl.replace(/&amp;/gi, "&").trim();
    if (!url) return attribute.toLowerCase() === "src" ? `src="${baseUrl}/logo.png"` : `${attribute}=${quote}${quote}`;
    if (url.startsWith("#")) return `${attribute}=${quote}${escapeHtml(url)}${quote}`;
    try {
      const parsed = new URL(url, baseUrl);
      const allowedProtocols = attribute.toLowerCase() === "src" ? ["http:", "https:", "data:", "cid:"] : ["http:", "https:", "mailto:", "tel:"];
      if (!allowedProtocols.includes(parsed.protocol)) {
        return attribute.toLowerCase() === "src" ? `src="${baseUrl}/logo.png"` : `${attribute}=${quote}${quote}`;
      }
      return `${attribute}=${quote}${escapeHtml(parsed.href)}${quote}`;
    } catch {
      return attribute.toLowerCase() === "src" ? `src="${baseUrl}/logo.png"` : `${attribute}=${quote}${quote}`;
    }
  });
  return resolved.replace(/<a\b([^>]*?)\bhref=(['"])\s*\2([^>]*)>([\s\S]*?)<\/a>/gi, "$4");
}
function addActionButton(html, context) {
  const actionUrl = stringContextValue(context, "actionUrl", "action_url");
  if (!actionUrl) return html;
  let absoluteUrl;
  try {
    absoluteUrl = new URL(actionUrl, publicAppUrl()).href;
  } catch {
    return html;
  }
  const escapedUrl = escapeHtml(absoluteUrl);
  const alreadyLinked = [...html.matchAll(/<a\b[^>]*\bhref=(['"])(.*?)\1/gi)].some((match) => {
    try {
      return new URL(match[2].replace(/&amp;/gi, "&"), publicAppUrl()).href === absoluteUrl;
    } catch {
      return false;
    }
  });
  if (alreadyLinked) return html;
  const entityType = stringContextValue(context, "entityType", "entity_type") || "item";
  const buttonText = stringContextValue(context, "ctaText", "cta_text", "actionLabel", "action_label") || `View ${entityType.replace(/[_-]+/g, " ")}`;
  const button = `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0"><tr><td align="center" bgcolor="#001D3D" style="border-radius:6px"><a href="${escapedUrl}" target="_blank" style="display:inline-block;padding:12px 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:bold;color:#fff;text-decoration:none;border-radius:6px">${escapeHtml(buttonText)}</a></td></tr></table>`;
  return /<\/body\s*>/i.test(html) ? html.replace(/<\/body\s*>/i, `${button}</body>`) : `${html}${button}`;
}
function isCompleteHtmlDocument(value) {
  return /<!doctype\s+html|<html[\s>]/i.test(value);
}
function loadFileTemplate(templateId) {
  const templateRoot = path.resolve(process.cwd(), "email-templates");
  const safeId = templateId.replace(/\\/g, "/");
  const candidates = [
    path.resolve(templateRoot, "System Templates", `${safeId}.html`),
    path.resolve(templateRoot, `${safeId}.html`)
  ];
  for (const filePath of candidates) {
    if (!filePath.startsWith(`${templateRoot}${path.sep}`)) continue;
    try {
      if (fs.existsSync(filePath)) return fs.readFileSync(filePath, "utf8");
    } catch {
    }
  }
  return null;
}
function loadRegistrySubject(templateId) {
  try {
    const registryPath = path.resolve(process.cwd(), "email-templates", "System Templates", "subjects.json");
    const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
    return registry[templateId.replace(/\\/g, "/")];
  } catch {
    return void 0;
  }
}
function renderEmailBody(value, subject, company) {
  if (isCompleteHtmlDocument(value)) return value;
  return resolveLinks(buildEmailHtml({
    title: subject || "Notification",
    bodyContent: value,
    companyName: String(company.name || company.company_name || "Kiini"),
    companyEmail: String(company.email || company.company_email || ""),
    logoUrl: String(company.logo || company.logo_url || "")
  }));
}
async function loadScopedEmailSettings(database, category, organizationId) {
  const globalRows = await database.select().from(settings).where(eq8(settings.category, category));
  const values = {};
  globalRows.forEach((row) => {
    values[row.key] = row.value || "";
  });
  if (organizationId) {
    const organizationRows = await database.select().from(organizationSettings).where(and7(
      eq8(organizationSettings.organizationId, organizationId),
      eq8(organizationSettings.category, category)
    ));
    organizationRows.forEach((row) => {
      values[row.key] = row.value || "";
    });
  }
  return values;
}
async function renderNotificationTemplate(templateId, context, fallback) {
  const database = await getDb();
  let company = context.company || {};
  try {
    company = { ...await getCompanyInfo(), ...company };
  } catch {
  }
  const routedContext = enrichContextWithRoutes({ ...context, company, templateId });
  const tokens = flattenContext(routedContext);
  let subject = fallback.subject;
  let hasConfiguredSubject = false;
  let html = fallback.html;
  let customBody = false;
  if (database) {
    const organization = context.organization;
    const companyContext = context.company;
    const organizationIdValue = context.organizationId || organization?.id || companyContext?.organizationId;
    const organizationId = typeof organizationIdValue === "string" ? organizationIdValue : void 0;
    const pool = getPool();
    if (pool) {
      const [templateRows] = organizationId ? await pool.query(
        "SELECT subject, htmlContent, plainTextContent FROM emailTemplates WHERE (id = ? OR name = ?) AND (organizationId = ? OR organizationId IS NULL) ORDER BY organizationId IS NULL, createdAt DESC LIMIT 1",
        [templateId, templateId, organizationId]
      ) : await pool.query(
        "SELECT subject, htmlContent, plainTextContent FROM emailTemplates WHERE id = ? OR name = ? ORDER BY createdAt DESC LIMIT 1",
        [templateId, templateId]
      );
      const template = templateRows[0];
      if (template) {
        if (template.subject) {
          subject = template.subject;
          hasConfiguredSubject = true;
        }
        if (template.htmlContent) {
          html = template.htmlContent;
          customBody = true;
        }
      }
    }
    const saved = await loadScopedEmailSettings(database, `email_template:${templateId}`, organizationId);
    if (saved.subject) {
      subject = saved.subject;
      hasConfiguredSubject = true;
    }
    if (saved.body) {
      html = saved.body;
      customBody = true;
    }
    const [signatureSettings, footerSettings] = await Promise.all([
      loadScopedEmailSettings(database, "email_template:email-signature-all", organizationId),
      loadScopedEmailSettings(database, "email_template:email-footer-all", organizationId)
    ]);
    const signature = signatureSettings.body || "";
    const footer = footerSettings.body || "";
    if (customBody && !isCompleteHtmlDocument(html) && signature) html += `<div>${signature}</div>`;
    if (customBody && !isCompleteHtmlDocument(html) && footer) html += `<hr><div>${footer}</div>`;
  }
  if (!customBody) {
    const fileTemplate = loadFileTemplate(templateId);
    if (fileTemplate) {
      html = fileTemplate;
      customBody = true;
      if (!hasConfiguredSubject) subject = loadRegistrySubject(templateId) || subject;
    }
  }
  subject = replaceTokens(subject, tokens).replace(/[\r\n]+/g, " ").trim();
  tokens.email_subject = subject;
  const templateContext = routedContext;
  html = renderEmailBody(resolveLinks(replaceTokens(renderConditionalBlocks(renderEachBlocks(html, templateContext, tokens), templateContext), tokens, true)), subject, company);
  html = addActionButton(html, routedContext);
  const text4 = replaceTokens(fallback.text || htmlToPlainText(html), tokens).replace(/\s+/g, " ").trim();
  return { subject, html, text: text4 };
}

// server/services/emailService.ts
function restoreQueuedAttachments(value) {
  if (!Array.isArray(value)) return void 0;
  return value.map((attachment) => ({
    ...attachment,
    content: attachment?.content?.type === "Buffer" && Array.isArray(attachment.content.data) ? Buffer.from(attachment.content.data) : typeof attachment?.contentBase64 === "string" ? Buffer.from(attachment.contentBase64, "base64") : attachment?.content
  })).filter((attachment) => typeof attachment.filename === "string" && attachment.content !== void 0);
}
var EmailService = class {
  emailFrom;
  constructor() {
    this.emailFrom = process.env.EMAIL_FROM || "noreply@crm.local";
  }
  /**
   * Queue an email for sending
   */
  async queueEmail(input) {
    try {
      const database = await getDb();
      if (!database) {
        throw new TRPCError4({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed"
        });
      }
      const emailQueue2 = (await Promise.resolve().then(() => (init_schema(), schema_exports))).emailQueue;
      const queueId = uuidv42();
      await database.insert(emailQueue2).values({
        id: queueId,
        recipientEmail: input.toEmail,
        subject: input.subject,
        htmlContent: input.htmlContent ?? "",
        textContent: input.plainTextContent,
        eventType: input.templateId || "manual",
        status: "pending",
        entityType: input.relatedEntityType,
        entityId: input.relatedEntityId,
        metadata: JSON.stringify({ templateId: input.templateId, templateVariables: input.templateVariables, attachments: input.attachments })
      });
      return { queueId };
    } catch (error) {
      console.error("[Email] Queue error:", error);
      throw new TRPCError4({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to queue email"
      });
    }
  }
  /**
   * Send email immediately (bypasses queue)
   */
  async sendEmailImmediately(input) {
    try {
      let subject = input.subject;
      let html = input.htmlContent;
      let text4 = input.plainTextContent;
      if (input.templateId) {
        const rendered = await renderNotificationTemplate(
          input.templateId,
          { ...input.templateVariables || {}, recipientEmail: input.toEmail },
          { subject, html: html || "", text: text4 }
        );
        subject = rendered.subject;
        html = rendered.html;
        text4 = rendered.text;
      }
      const result = await sendEmail({
        to: input.toEmail,
        subject,
        html,
        text: text4,
        attachments: input.attachments
      });
      if (!result.success) {
        throw new Error(result.error || "Failed to send email");
      }
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error("[Email] Send error:", error);
      throw new TRPCError4({
        code: "INTERNAL_SERVER_ERROR",
        message: error instanceof Error ? error.message : "Failed to send email"
      });
    }
  }
  /**
   * Process email queue (background job)
   */
  async processEmailQueue(batchSize = 10) {
    try {
      const database = await getDb();
      if (!database) {
        throw new Error("Database connection lost");
      }
      const emailQueue2 = (await Promise.resolve().then(() => (init_schema(), schema_exports))).emailQueue;
      const { eq: eq13, and: and11, lt, isNull: isNull5, or: or2 } = await import("drizzle-orm");
      const nowDate = /* @__PURE__ */ new Date();
      const now2 = nowDate.toISOString().replace("T", " ").substring(0, 19);
      const pendingEmails = await database.select().from(emailQueue2).where(
        and11(
          eq13(emailQueue2.status, "pending"),
          or2(
            isNull5(emailQueue2.nextRetryAt),
            lt(emailQueue2.nextRetryAt, now2)
          )
        )
      ).limit(batchSize);
      let sent = 0;
      let failed = 0;
      for (const email of pendingEmails) {
        try {
          await database.update(emailQueue2).set({ status: "retrying" }).where(eq13(emailQueue2.id, email.id));
          let subject = email.subject;
          let html = email.htmlContent;
          let text4 = email.textContent;
          let attachments;
          if (email.metadata) {
            const metadata = JSON.parse(email.metadata);
            attachments = restoreQueuedAttachments(metadata.attachments);
            if (metadata.templateId) {
              const rendered = await renderNotificationTemplate(
                metadata.templateId,
                { ...metadata.templateVariables || {}, recipientEmail: email.recipientEmail },
                { subject, html, text: text4 || void 0 }
              );
              subject = rendered.subject;
              html = rendered.html;
              text4 = rendered.text;
            }
          }
          const result = await sendEmail({
            to: email.recipientEmail,
            subject,
            html,
            text: text4 || void 0,
            attachments
          });
          if (!result.success) {
            throw new Error(result.error || "Send failed");
          }
          await database.update(emailQueue2).set({
            status: "sent",
            sentAt: (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").substring(0, 19)
          }).where(eq13(emailQueue2.id, email.id));
          sent++;
        } catch (error) {
          failed++;
          const attemptCount = (email.attempts || 0) + 1;
          const maxAttempts = email.maxAttempts || 3;
          if (attemptCount < maxAttempts) {
            const delayMinutes = [5, 15, 60][attemptCount - 1] || 60;
            const nextRetry = new Date(nowDate.getTime() + delayMinutes * 60 * 1e3);
            const nextRetryStr = nextRetry.toISOString().replace("T", " ").substring(0, 19);
            await database.update(emailQueue2).set({
              status: "pending",
              attempts: attemptCount,
              nextRetryAt: nextRetryStr,
              errorMessage: error instanceof Error ? error.message : String(error)
            }).where(eq13(emailQueue2.id, email.id));
          } else {
            await database.update(emailQueue2).set({
              status: "failed",
              attempts: attemptCount,
              errorMessage: `Failed after ${maxAttempts} attempts: ${error instanceof Error ? error.message : String(error)}`
            }).where(eq13(emailQueue2.id, email.id));
          }
        }
      }
      return { sent, failed };
    } catch (error) {
      console.error("[Email] Queue processing error:", error);
      return { sent: 0, failed: 0 };
    }
  }
  /**
   * Get email queue status
   */
  async getQueueStatus() {
    try {
      const database = await getDb();
      if (!database) throw new Error("Database connection lost");
      const emailQueue2 = (await Promise.resolve().then(() => (init_schema(), schema_exports))).emailQueue;
      const counts = await database.select().from(emailQueue2);
      const statuses = {
        pending: counts.filter((e) => e.status === "pending").length,
        sending: counts.filter((e) => e.status === "retrying").length,
        sent: counts.filter((e) => e.status === "sent").length,
        failed: counts.filter((e) => e.status === "failed").length,
        bounced: counts.filter((e) => e.status === "failed").length
      };
      return statuses;
    } catch (error) {
      console.error("[Email] Queue status error:", error);
      return { pending: 0, sending: 0, sent: 0, failed: 0, bounced: 0 };
    }
  }
  /**
   * Get configured status
   */
  getStatus() {
    return {
      isConfigured: true,
      // Config is resolved lazily from env + DB settings
      emailFrom: this.emailFrom
    };
  }
};
var emailService = new EmailService();
var sendEmailImmediately = (input) => emailService.sendEmailImmediately(input);

// server/services/payrollCostAllocationService.ts
init_schema();
init_schema_extended();
import { and as and9, desc as desc4, eq as eq10, inArray as inArray3, isNull as isNull3, lte as lte2 } from "drizzle-orm";
import { v4 as uuidv43 } from "uuid";

// server/utils/chartOfAccountBalance.ts
init_schema();
import { and as and8, eq as eq9, isNull as isNull2, sql as sql5 } from "drizzle-orm";
async function adjustChartOfAccountBalance(database, accountId, delta, organizationId, options = {}) {
  if (!accountId || delta === 0) return false;
  const accountWhere = organizationId ? and8(eq9(accounts.id, accountId), eq9(accounts.organizationId, organizationId)) : eq9(accounts.id, accountId);
  const existing = await database.select({ id: accounts.id }).from(accounts).where(accountWhere).limit(1);
  if (!existing.length) {
    if (options.allowMissingAccount) return false;
    throw new Error("Chart of Accounts entry not found");
  }
  await database.update(accounts).set({
    balance: sql5`COALESCE(${accounts.balance}, 0) + ${delta}`,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").substring(0, 19)
  }).where(eq9(accounts.id, accountId));
  return true;
}

// server/services/payrollCostAllocationService.ts
var organizationScopeCondition = (column, organizationId) => organizationId === null ? isNull3(column) : eq10(column, organizationId);
function splitCents(totalCents, allocations) {
  if (!Number.isSafeInteger(totalCents) || totalCents < 0) throw new Error("Payroll amounts must be non-negative integer cents");
  const splits = allocations.map((allocation) => {
    const exact = totalCents * allocation.allocationBasisPoints / 1e4;
    return { costCenterId: allocation.costCenterId, cents: Math.floor(exact), remainder: exact % 1 };
  });
  let remainder = totalCents - splits.reduce((sum2, split) => sum2 + split.cents, 0);
  const ordered = [...splits].sort((left, right) => right.remainder - left.remainder || left.costCenterId.localeCompare(right.costCenterId));
  for (let index4 = 0; index4 < remainder; index4++) ordered[index4 % ordered.length].cents++;
  return new Map(splits.map((split) => [split.costCenterId, split.cents]));
}
async function recordPayrollCostAllocation(database, input) {
  const prior = await database.select({
    costCenterId: payrollLedgerEntries.costCenterId,
    fullyBurdenedCostCents: payrollLedgerEntries.fullyBurdenedCostCents,
    departmentId: payrollCostCenters.departmentId
  }).from(payrollLedgerEntries).innerJoin(payrollCostCenters, eq10(payrollLedgerEntries.costCenterId, payrollCostCenters.id)).where(eq10(payrollLedgerEntries.payrollId, input.payrollId)).limit(100);
  if (prior.length) {
    return {
      inserted: false,
      entries: prior.length,
      budgetSplits: prior.map((row) => ({
        costCenterId: row.costCenterId,
        departmentId: row.departmentId || input.employeeDepartmentId || null,
        fullyBurdenedCostCents: row.fullyBurdenedCostCents
      }))
    };
  }
  const history = await database.select().from(employeeCostAllocations).where(and9(
    organizationScopeCondition(employeeCostAllocations.organizationId, input.organizationId),
    eq10(employeeCostAllocations.employeeId, input.employeeId),
    lte2(employeeCostAllocations.effectiveDate, input.payrollPeriodStart.slice(0, 10))
  )).orderBy(desc4(employeeCostAllocations.effectiveDate));
  let allocations;
  let allocationEffectiveDate;
  if (history.length > 0) {
    allocationEffectiveDate = history[0].effectiveDate;
    allocations = history.filter((row) => row.effectiveDate === allocationEffectiveDate).map((row) => ({ costCenterId: row.costCenterId, allocationBasisPoints: row.allocationBasisPoints }));
  } else if (input.employeeDepartmentId) {
    const departmentCenters = await database.select({
      id: payrollCostCenters.id
    }).from(payrollCostCenters).where(and9(
      organizationScopeCondition(payrollCostCenters.organizationId, input.organizationId),
      eq10(payrollCostCenters.departmentId, input.employeeDepartmentId),
      eq10(payrollCostCenters.isActive, 1)
    )).limit(2);
    if (departmentCenters.length !== 1) {
      throw new Error(
        departmentCenters.length > 1 ? `Multiple active payroll cost centers are linked to the employee's department; configure an explicit allocation for employee ${input.employeeId}` : `No employee allocation or active payroll cost center is linked to the employee's department; configure department payroll mapping for employee ${input.employeeId}`
      );
    }
    allocations = [{ costCenterId: departmentCenters[0].id, allocationBasisPoints: 1e4 }];
  } else {
    throw new Error(`No effective cost allocation or department is configured for employee ${input.employeeId}`);
  }
  if (allocations.reduce((sum2, item) => sum2 + item.allocationBasisPoints, 0) !== 1e4) {
    const allocationDate = allocationEffectiveDate ? ` effective ${allocationEffectiveDate}` : "";
    throw new Error(`Cost allocations${allocationDate} for employee ${input.employeeId} must total 100%`);
  }
  const costCenters = await database.select({
    id: payrollCostCenters.id,
    departmentId: payrollCostCenters.departmentId,
    code: payrollCostCenters.code,
    name: payrollCostCenters.name,
    expenseAccountId: payrollCostCenters.expenseAccountId,
    payrollLiabilityAccountId: payrollCostCenters.payrollLiabilityAccountId
  }).from(payrollCostCenters).where(and9(
    organizationScopeCondition(payrollCostCenters.organizationId, input.organizationId),
    eq10(payrollCostCenters.isActive, 1)
  ));
  const centerById = new Map(costCenters.map((center) => [center.id, center]));
  if (allocations.some((allocation) => !centerById.has(allocation.costCenterId))) {
    throw new Error("The effective cost allocation references an inactive or unavailable cost center");
  }
  const allocatedCenters = allocations.map((allocation) => centerById.get(allocation.costCenterId));
  const expenseComponents = input.expenseComponents ?? [];
  const liabilityComponents = input.liabilityComponents ?? [];
  const componentMappings = expenseComponents.length || liabilityComponents.length ? await database.select().from(payrollComponentMappings).where(organizationScopeCondition(payrollComponentMappings.organizationId, input.organizationId)) : [];
  const mappingByKey = new Map(componentMappings.map((mapping) => [
    `${mapping.componentType}:${String(mapping.componentName).trim().toLowerCase()}`,
    mapping.accountId
  ]));
  const mappedLiabilityComponents = liabilityComponents.map((component) => ({
    component,
    accountId: component.glAccountId || (component.componentType ? mappingByKey.get(`${component.componentType}:${component.componentName.trim().toLowerCase()}`) || mappingByKey.get(`${component.componentType}:*`) : void 0)
  }));
  const componentsByCenter = /* @__PURE__ */ new Map();
  const totalsByCenter = /* @__PURE__ */ new Map();
  for (const component of expenseComponents) {
    if (!Number.isSafeInteger(component.amountCents) || component.amountCents < 0) {
      throw new Error(`Payroll component ${component.componentName} must be a non-negative integer number of cents`);
    }
    let componentAllocations = allocations;
    if (component.departmentIdOverride) {
      const overrideCenters = costCenters.filter((center) => center.departmentId === component.departmentIdOverride);
      if (overrideCenters.length !== 1) {
        throw new Error(overrideCenters.length > 1 ? `Department override for ${component.componentName} must have exactly one active payroll cost center` : `Department override for ${component.componentName} has no active payroll cost center`);
      }
      componentAllocations = [{ costCenterId: overrideCenters[0].id, allocationBasisPoints: 1e4 }];
    }
    const split = splitCents(component.amountCents, componentAllocations);
    const mappingKey = `${component.componentType}:${component.componentName.trim().toLowerCase()}`;
    const accountId = component.glAccountId || mappingByKey.get(mappingKey) || mappingByKey.get(`${component.componentType}:*`);
    for (const [costCenterId, amountCents] of split) {
      const entries = componentsByCenter.get(costCenterId) ?? [];
      entries.push({ component, amountCents, accountId: accountId || centerById.get(costCenterId)?.expenseAccountId });
      componentsByCenter.set(costCenterId, entries);
      const totals = totalsByCenter.get(costCenterId) ?? { grossPayCents: 0, employerStatutoryCents: 0, employerBenefitsCents: 0 };
      if (component.componentType === "basic_salary" || component.componentType === "allowance") totals.grossPayCents += amountCents;
      if (component.componentType === "employer_statutory") totals.employerStatutoryCents += amountCents;
      if (component.componentType === "employer_benefit") totals.employerBenefitsCents += amountCents;
      totalsByCenter.set(costCenterId, totals);
    }
  }
  if (expenseComponents.length) {
    const totals = expenseComponents.reduce((sum2, component) => {
      if (component.componentType === "basic_salary" || component.componentType === "allowance") sum2.grossPayCents += component.amountCents;
      if (component.componentType === "employer_statutory") sum2.employerStatutoryCents += component.amountCents;
      if (component.componentType === "employer_benefit") sum2.employerBenefitsCents += component.amountCents;
      return sum2;
    }, { grossPayCents: 0, employerStatutoryCents: 0, employerBenefitsCents: 0 });
    if (totals.grossPayCents !== input.grossPayCents || totals.employerStatutoryCents !== input.employerStatutoryCents || totals.employerBenefitsCents !== input.employerBenefitsCents) {
      throw new Error("Payroll expense components do not reconcile with the payroll totals");
    }
  }
  const centersForAllocation = expenseComponents.length ? [.../* @__PURE__ */ new Set([...allocations.map((allocation) => allocation.costCenterId), ...componentsByCenter.keys()])].map((id) => centerById.get(id)) : allocatedCenters;
  const accountIdList = centersForAllocation.flatMap((center) => [
    center.expenseAccountId,
    center.payrollLiabilityAccountId,
    ...(componentsByCenter.get(center.id) ?? []).map((entry) => entry.accountId)
  ].filter(Boolean)).concat(mappedLiabilityComponents.map((entry) => entry.accountId).filter(Boolean));
  const accountIds = [...new Set(accountIdList)];
  if (centersForAllocation.some((center) => !center.expenseAccountId || !center.payrollLiabilityAccountId)) {
    throw new Error("Every payroll cost center used by the allocation must be mapped to an expense account and payroll liability account in the Chart of Accounts");
  }
  const mappedAccounts = await database.select({
    id: accounts.id,
    organizationId: accounts.organizationId,
    accountCode: accounts.accountCode,
    accountName: accounts.accountName,
    accountType: accounts.accountType,
    isActive: accounts.isActive
  }).from(accounts).where(and9(
    inArray3(accounts.id, accountIds),
    organizationScopeCondition(accounts.organizationId, input.organizationId)
  ));
  const accountById = new Map(mappedAccounts.map((account) => [account.id, account]));
  for (const center of centersForAllocation) {
    const expenseAccount = accountById.get(center.expenseAccountId);
    const liabilityAccount = accountById.get(center.payrollLiabilityAccountId);
    if (!expenseAccount || expenseAccount.isActive !== 1 || !["expense", "operating expense", "cost of goods sold", "other expense"].includes(expenseAccount.accountType)) {
      throw new Error(`Cost center ${center.code} must map to an active expense account in this organization`);
    }
    if (!liabilityAccount || liabilityAccount.isActive !== 1 || liabilityAccount.accountType !== "liability") {
      throw new Error(`Cost center ${center.code} must map to an active liability account in this organization`);
    }
    for (const entry of componentsByCenter.get(center.id) ?? []) {
      const componentAccount = entry.accountId ? accountById.get(entry.accountId) : void 0;
      if (!componentAccount || componentAccount.isActive !== 1 || !["expense", "operating expense", "cost of goods sold", "other expense"].includes(componentAccount.accountType)) {
        throw new Error(`Payroll component ${entry.component.componentName} must map to an active expense account in this organization`);
      }
    }
    for (const { component, accountId } of mappedLiabilityComponents) {
      if (!Number.isSafeInteger(component.amountCents) || component.amountCents < 0) {
        throw new Error(`Payroll liability ${component.componentName} must be a non-negative integer number of cents`);
      }
      if (!accountId) continue;
      const liabilityAccount2 = accountById.get(accountId);
      if (!liabilityAccount2 || liabilityAccount2.isActive !== 1 || liabilityAccount2.accountType !== "liability") {
        throw new Error(`Payroll liability ${component.componentName} must map to an active liability account in this organization`);
      }
    }
  }
  const amountFields = {
    grossPayCents: input.grossPayCents,
    employerStatutoryCents: input.employerStatutoryCents,
    employerBenefitsCents: input.employerBenefitsCents,
    fullyBurdenedCostCents: input.grossPayCents + input.employerStatutoryCents + input.employerBenefitsCents,
    employeeTaxCents: input.employeeTaxCents,
    netPayoutCents: input.netPayoutCents
  };
  if (Object.values(amountFields).some((amount) => !Number.isSafeInteger(amount) || amount < 0)) {
    throw new Error("Payroll amounts must be non-negative safe integer cents");
  }
  const splitFields = Object.fromEntries(
    Object.entries(amountFields).map(([field, amount]) => [field, splitCents(amount, allocations)])
  );
  if (expenseComponents.length) {
    for (const field of ["grossPayCents", "employerStatutoryCents", "employerBenefitsCents"]) {
      splitFields[field] = new Map(centersForAllocation.map((center) => [
        center.id,
        totalsByCenter.get(center.id)?.[field] ?? 0
      ]));
    }
    splitFields.fullyBurdenedCostCents = new Map(centersForAllocation.map((center) => {
      const totals = totalsByCenter.get(center.id);
      return [center.id, totals ? totals.grossPayCents + totals.employerStatutoryCents + totals.employerBenefitsCents : 0];
    }));
  }
  const totalBurdened = [...splitFields.fullyBurdenedCostCents.values()].reduce((sum2, value) => sum2 + value, 0);
  const ledgerCenters = totalBurdened > 0 ? centersForAllocation.filter((center) => (splitFields.fullyBurdenedCostCents.get(center.id) ?? 0) > 0) : centersForAllocation;
  const ledgerAllocations = ledgerCenters.map((center) => ({
    costCenterId: center.id,
    allocationBasisPoints: totalBurdened > 0 ? Math.floor((splitFields.fullyBurdenedCostCents.get(center.id) ?? 0) * 1e4 / totalBurdened) : allocations.find((allocation) => allocation.costCenterId === center.id)?.allocationBasisPoints ?? 0
  }));
  let basisPointRemainder = 1e4 - ledgerAllocations.reduce((sum2, allocation) => sum2 + allocation.allocationBasisPoints, 0);
  for (let index4 = 0; basisPointRemainder > 0 && ledgerAllocations.length > 0; index4++, basisPointRemainder--) {
    ledgerAllocations[index4 % ledgerAllocations.length].allocationBasisPoints++;
  }
  const liabilityCreditsByCenter = /* @__PURE__ */ new Map();
  const customLiabilityTotalsByCenter = /* @__PURE__ */ new Map();
  for (const { component, accountId } of mappedLiabilityComponents.filter((entry) => entry.accountId && entry.component.amountCents > 0)) {
    const split = splitCents(component.amountCents, ledgerAllocations);
    for (const [costCenterId, amountCents] of split) {
      const credits = liabilityCreditsByCenter.get(costCenterId) ?? /* @__PURE__ */ new Map();
      credits.set(accountId, (credits.get(accountId) ?? 0) + amountCents);
      liabilityCreditsByCenter.set(costCenterId, credits);
      customLiabilityTotalsByCenter.set(costCenterId, (customLiabilityTotalsByCenter.get(costCenterId) ?? 0) + amountCents);
    }
  }
  const ledgerEntries = ledgerAllocations.map((allocation) => ({
    id: uuidv43(),
    organizationId: input.organizationId,
    payrollId: input.payrollId,
    employeeId: input.employeeId,
    costCenterId: allocation.costCenterId,
    payrollPeriodStart: input.payrollPeriodStart.slice(0, 10),
    payrollPeriodEnd: input.payrollPeriodEnd.slice(0, 10),
    allocationBasisPoints: allocation.allocationBasisPoints,
    ...Object.fromEntries(Object.keys(amountFields).map((field) => [
      field,
      splitFields[field].get(allocation.costCenterId) ?? 0
    ]))
  }));
  await database.insert(payrollLedgerEntries).values(ledgerEntries);
  const processedAt = (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").substring(0, 19);
  for (const allocation of ledgerAllocations) {
    const center = centerById.get(allocation.costCenterId);
    const liabilityAccount = accountById.get(center.payrollLiabilityAccountId);
    const amount = splitFields.fullyBurdenedCostCents.get(allocation.costCenterId) ?? 0;
    if (amount === 0) continue;
    const journalEntryId = uuidv43();
    const payPeriod = input.payrollPeriodStart.slice(0, 7);
    await database.insert(journalEntries).values({
      id: journalEntryId,
      organizationId: input.organizationId,
      costCenterId: center.id,
      entryNumber: `JE-PAYROLL-${payPeriod}-${journalEntryId}`,
      entryDate: input.payrollPeriodEnd,
      entryMonth: payPeriod,
      reference: input.payrollId,
      description: `Payroll accrual: ${center.code} ${center.name}`,
      totalAmount: amount,
      referenceType: "payroll",
      referenceId: input.payrollId,
      status: "posted",
      createdBy: input.createdBy ?? null,
      postedAt: processedAt,
      createdAt: processedAt,
      updatedAt: processedAt
    });
    const componentDebits = /* @__PURE__ */ new Map();
    const componentEntries = componentsByCenter.get(allocation.costCenterId) ?? [];
    if (expenseComponents.length) {
      for (const entry of componentEntries) {
        if (entry.amountCents > 0 && entry.accountId) {
          componentDebits.set(entry.accountId, (componentDebits.get(entry.accountId) ?? 0) + entry.amountCents);
        }
      }
    } else {
      componentDebits.set(center.expenseAccountId, amount);
    }
    const mappedLiabilityCredits = liabilityCreditsByCenter.get(allocation.costCenterId) ?? /* @__PURE__ */ new Map();
    const defaultLiabilityCredit = amount - (customLiabilityTotalsByCenter.get(allocation.costCenterId) ?? 0);
    if (defaultLiabilityCredit < 0) {
      throw new Error(`Payroll liability mappings exceed the payroll cost allocated to cost center ${center.code}`);
    }
    const debitLines = [...componentDebits.entries()].map(([accountId, debit], index4) => ({
      id: uuidv43(),
      journalEntryId,
      accountId,
      debit,
      credit: 0,
      description: `Payroll component expense \u2014 ${center.code}`,
      lineNumber: index4 + 1,
      createdBy: input.createdBy ?? null,
      createdAt: processedAt
    }));
    await database.insert(journalEntryLines).values([
      ...debitLines,
      ...[...mappedLiabilityCredits.entries()].map(([accountId, credit], index4) => ({
        id: uuidv43(),
        journalEntryId,
        accountId,
        debit: 0,
        credit,
        description: `Payroll component liability \u2014 ${center.code}`,
        lineNumber: debitLines.length + index4 + 1,
        createdBy: input.createdBy ?? null,
        createdAt: processedAt
      })),
      {
        id: uuidv43(),
        journalEntryId,
        accountId: center.payrollLiabilityAccountId,
        debit: 0,
        credit: defaultLiabilityCredit,
        description: `Payroll payable \u2014 ${center.code}`,
        lineNumber: debitLines.length + mappedLiabilityCredits.size + 1,
        createdBy: input.createdBy ?? null,
        createdAt: processedAt
      }
    ]);
    for (const [accountId, debit] of componentDebits) {
      await adjustChartOfAccountBalance(database, accountId, debit, input.organizationId);
    }
    for (const [accountId, credit] of mappedLiabilityCredits) {
      await adjustChartOfAccountBalance(database, accountId, -credit, input.organizationId);
    }
    if (defaultLiabilityCredit > 0) {
      await adjustChartOfAccountBalance(database, liabilityAccount.id, -defaultLiabilityCredit, input.organizationId);
    }
  }
  return {
    inserted: true,
    entries: ledgerAllocations.length,
    budgetSplits: ledgerAllocations.map((allocation) => ({
      costCenterId: allocation.costCenterId,
      departmentId: centerById.get(allocation.costCenterId)?.departmentId || input.employeeDepartmentId || null,
      fullyBurdenedCostCents: splitFields.fullyBurdenedCostCents.get(allocation.costCenterId) ?? 0
    }))
  };
}

// server/services/jobGroupPayrollDefaults.ts
init_schema_extended();
import { eq as eq11 } from "drizzle-orm";
import { v4 as uuidv44 } from "uuid";
function parseJobGroupPayrollDefaults(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((item) => {
      if (!item || typeof item.type !== "string") return [];
      const parseNumber = (raw) => typeof raw === "number" || typeof raw === "string" && raw.trim() !== "" ? Number(raw) : void 0;
      const amount = parseNumber(item.amount);
      const percentage = parseNumber(item.percentage);
      const hasAmount = amount !== void 0 && Number.isFinite(amount);
      const hasPercentage = percentage !== void 0 && Number.isFinite(percentage);
      if (!hasAmount && !hasPercentage) return [];
      const frequency = ["monthly", "quarterly", "annual", "one_time"].includes(item.frequency) ? item.frequency : void 0;
      return [{
        type: item.type,
        ...hasAmount ? { amount } : {},
        ...hasPercentage ? { percentage } : {},
        ...frequency ? { frequency } : {}
      }];
    });
  } catch {
    return [];
  }
}
function resolveJobGroupPayrollAmount(item, basicSalary) {
  if (Number.isFinite(item.percentage)) {
    return Math.round(Number(basicSalary || 0) * Number(item.percentage) / 100 * 100);
  }
  return Math.round(Number(item.amount || 0));
}
function resolveJobGroupPayrollBasisSalary(employeeSalary, jobGroup) {
  if (Number(employeeSalary) > 0) return Number(employeeSalary);
  if (Number(jobGroup?.defaultBasicSalary) > 0) return Number(jobGroup?.defaultBasicSalary);
  const minimum = Number(jobGroup?.minimumGrossSalary || 0);
  const maximum = Number(jobGroup?.maximumGrossSalary || 0);
  return minimum > 0 && maximum >= minimum ? (minimum + maximum) / 2 : 0;
}

// server/jobs/payrollJobs.ts
init_schema_extended();
function fmt(d) {
  return d.toISOString().replace("T", " ").substring(0, 19);
}
function monthlyAmount(amount, frequency) {
  const value = Number(amount || 0);
  if (frequency === "quarterly") return Math.round(value / 3);
  if (frequency === "annual") return Math.round(value / 12);
  return value;
}
async function applySavedPayslipTemplate(pool, html, values, organizationId) {
  let rows;
  if (organizationId) {
    [rows] = await pool.query(
      "SELECT content FROM documentTemplates WHERE type = 'payslip' AND isDefault = 1 AND organizationId = ? LIMIT 1",
      [organizationId]
    );
    if (rows?.[0]?.content) return renderPayslipTemplateContent(rows[0].content, values);
  }
  [rows] = await pool.query(
    "SELECT content FROM documentTemplates WHERE type = 'payslip' AND isDefault = 1 AND organizationId IS NULL LIMIT 1"
  );
  const template = rows?.[0]?.content;
  return template ? renderPayslipTemplateContent(template, values) : html;
}
function normalizePayslipToken(token) {
  return token.trim().replace(/^[{\[$\s]+|[}\]$\s]+$/g, "").replace(/([a-z\d])([A-Z])/g, "$1_$2").replace(/[\s\-.]+/g, "_").replace(/_+/g, "_").toLowerCase();
}
function renderPayslipTemplateContent(template, values) {
  return template.replace(
    /\{\{\s*([^{}]+?)\s*\}\}|\$\{\s*([^{}]+?)\s*\}|\[\s*([^\]]+?)\s*\]/g,
    (_match, moustache, dollar, bracket) => values[normalizePayslipToken(moustache || dollar || bracket)] ?? ""
  );
}
function lastDay(year, month) {
  return new Date(Date.UTC(year, month, 0));
}
function periodStart(year, month) {
  return `${year}-${String(month).padStart(2, "0")}-01 00:00:00`;
}
function periodEnd(year, month) {
  const day = lastDay(year, month).getUTCDate();
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")} 23:59:59`;
}
function periodEndDate(year, month) {
  return new Date(Date.UTC(year, month, 0, 23, 59, 59));
}
async function notifyByRole(db2, orgId, roles, notification) {
  try {
    const cond = orgId ? and10(eq12(users.organizationId, orgId), inArray4(users.role, roles)) : inArray4(users.role, roles);
    const targets = await db2.select({ id: users.id, email: users.email, name: users.name }).from(users).where(cond);
    for (const u of targets) {
      await createNotification({
        userId: u.id,
        title: notification.title,
        message: notification.message,
        type: notification.type || "info",
        category: "payroll",
        entityType: "payroll_run",
        entityId: "",
        actionUrl: notification.actionUrl,
        priority: "high"
      }).catch(console.warn);
    }
    return targets;
  } catch (e) {
    console.warn("[PAYROLL] notifyByRole error:", e);
    return [];
  }
}
async function processMonthlyPayroll(targetYear, targetMonth, triggeredBy, organizationId) {
  const db2 = await getDb();
  const pool = getPool();
  if (!db2) {
    console.error("[PAYROLL-CRON] Database not available");
    return { processed: 0, skipped: 0, errors: ["Database not available"] };
  }
  const now2 = /* @__PURE__ */ new Date();
  const year = targetYear ?? now2.getFullYear();
  const month = targetMonth ?? now2.getMonth() + 1;
  const payPeriodLabel = `${year}-${String(month).padStart(2, "0")}`;
  const payPeriodStart = periodStart(year, month);
  const payPeriodEnd = periodEnd(year, month);
  const processedAt = fmt(now2);
  console.log(`[PAYROLL-CRON] Processing payroll for ${payPeriodLabel}...`);
  const employeeConditions = [eq12(employees.status, "active")];
  if (organizationId !== void 0) {
    employeeConditions.push(organizationId === null ? isNull4(employees.organizationId) : eq12(employees.organizationId, organizationId));
  }
  const activeEmployees = await db2.select().from(employees).where(and10(...employeeConditions));
  let processed = 0;
  let skipped = 0;
  const errors = [];
  const organizationIds = [...new Set(activeEmployees.map((employee) => employee.organizationId).filter(Boolean))];
  const organizationDepartments = /* @__PURE__ */ new Map();
  const globalDepartments = /* @__PURE__ */ new Map();
  if (organizationIds.length > 0) {
    try {
      const departmentRows = await db2.select({ id: departments.id, name: departments.name, organizationId: departments.organizationId }).from(departments).where(inArray4(departments.organizationId, organizationIds));
      for (const department of departmentRows) {
        if (!department.organizationId) continue;
        let byName = organizationDepartments.get(department.organizationId);
        if (!byName) {
          byName = /* @__PURE__ */ new Map();
          organizationDepartments.set(department.organizationId, byName);
        }
        byName.set(department.id.toLowerCase(), department.id);
        byName.set(department.name.trim().toLowerCase(), department.id);
      }
    } catch (error) {
      console.error("[PAYROLL-CRON] Department lookup failed; using cost-center departments for budget allocation:", error);
    }
  }
  if (activeEmployees.some((employee) => !employee.organizationId)) {
    try {
      const departmentRows = await db2.select({
        id: departments.id,
        name: departments.name
      }).from(departments).where(isNull4(departments.organizationId));
      for (const department of departmentRows) {
        globalDepartments.set(department.id.toLowerCase(), department.id);
        globalDepartments.set(department.name.trim().toLowerCase(), department.id);
      }
    } catch (error) {
      console.error("[PAYROLL-CRON] Global department lookup failed; using cost-center departments for budget allocation:", error);
    }
  }
  const jobGroupRows = await db2.select().from(jobGroups);
  const jobGroupById = new Map(jobGroupRows.map((group) => [String(group.id), group]));
  const payrollOrganizationIds = /* @__PURE__ */ new Set();
  for (const emp of activeEmployees) {
    try {
      const existing = await db2.select({ id: payroll.id }).from(payroll).where(
        and10(
          eq12(payroll.employeeId, emp.id),
          eq12(payroll.payPeriodStart, payPeriodStart)
        )
      ).limit(1);
      if (existing.length > 0) {
        skipped++;
        continue;
      }
      const jobGroup = jobGroupById.get(String(emp.jobGroupId));
      const [salaryStructure] = await db2.select().from(salaryStructures).where(and10(
        eq12(salaryStructures.employeeId, emp.id),
        lte3(salaryStructures.effectiveDate, periodEndDate(year, month))
      )).orderBy(desc5(salaryStructures.effectiveDate)).limit(1);
      const employeeSalary = Number(emp.salary);
      const basicSalaryUnits = Number.isFinite(employeeSalary) && employeeSalary > 0 ? employeeSalary : salaryStructure?.basicSalary != null ? Number(salaryStructure.basicSalary) / 100 : resolveJobGroupPayrollBasisSalary(void 0, jobGroup);
      const basicSalaryCents = Math.round(Number(basicSalaryUnits) * 100);
      if (basicSalaryCents === 0) {
        errors.push(`${emp.firstName} ${emp.lastName}: no salary configured`);
        skipped++;
        continue;
      }
      let allowancesCents = 0;
      let employeeDeductionsCents = 0;
      let employeeBenefitsCents = 0;
      let employerBenefitsCents = 0;
      let allowanceComponents = [];
      let deductionComponents = [];
      let benefitComponents = [];
      if (pool) {
        try {
          const activeWindow = `effectiveDate <= ? AND (endDate IS NULL OR endDate >= ?)`;
          const [allowanceRows] = await pool.query(
            `SELECT id, allowanceType, amount, frequency, departmentIdOverride, glAccountId FROM salaryAllowances WHERE employeeId = ? AND isActive = 1 AND ${activeWindow}`,
            [emp.id, payPeriodEnd, payPeriodStart]
          );
          allowanceComponents = allowanceRows;
          allowancesCents = allowanceComponents.reduce((sum2, row) => sum2 + monthlyAmount(row.amount, row.frequency), 0);
          const [deductionRows] = await pool.query(
            `SELECT id, deductionType, amount, frequency, departmentIdOverride, glAccountId FROM salaryDeductions WHERE employeeId = ? AND isActive = 1 AND ${activeWindow}`,
            [emp.id, payPeriodEnd, payPeriodStart]
          );
          deductionComponents = deductionRows;
          const [benefitRows] = await pool.query(
            `SELECT id, benefitType, cost, employerCost, departmentIdOverride, glAccountId FROM employeeBenefits WHERE employeeId = ? AND isActive = 1 AND enrollDate <= ? AND (endDate IS NULL OR endDate >= ?)`,
            [emp.id, payPeriodEnd, payPeriodStart]
          );
          benefitComponents = benefitRows.filter((row) => Number(row.cost || 0) > 0 || Number(row.employerCost || 0) > 0);
          employeeBenefitsCents = benefitComponents.reduce((sum2, row) => sum2 + Number(row.cost || 0), 0);
          employerBenefitsCents = benefitComponents.reduce((sum2, row) => sum2 + Number(row.employerCost || 0), 0);
        } catch (error) {
          console.error(`[PAYROLL-CRON] Failed to load compensation components for ${emp.id}:`, error);
          errors.push(`${emp.firstName} ${emp.lastName}: compensation components could not be loaded`);
          skipped++;
          continue;
        }
      }
      const applyMissingDefaults = (rows, typeField, defaults) => {
        const configuredTypes = new Set(rows.map((row) => String(row[typeField]).trim().toLowerCase()));
        for (const item of defaults) {
          const key = item.type.trim().toLowerCase();
          if (configuredTypes.has(key)) continue;
          rows.push({
            [typeField]: item.type,
            amount: resolveJobGroupPayrollAmount(item, basicSalaryUnits),
            frequency: item.frequency || "monthly",
            ...typeField === "benefitType" && {
              cost: resolveJobGroupPayrollAmount(item, basicSalaryUnits),
              employerCost: resolveJobGroupPayrollAmount(item, basicSalaryUnits)
            }
          });
          configuredTypes.add(key);
        }
      };
      if (jobGroup) {
        applyMissingDefaults(allowanceComponents, "allowanceType", parseJobGroupPayrollDefaults(jobGroup.defaultAllowances));
        applyMissingDefaults(deductionComponents, "deductionType", parseJobGroupPayrollDefaults(jobGroup.defaultDeductions));
        applyMissingDefaults(benefitComponents, "benefitType", parseJobGroupPayrollDefaults(jobGroup.defaultBenefits));
        allowancesCents = allowanceComponents.reduce((sum2, row) => sum2 + monthlyAmount(row.amount, row.frequency), 0);
        employeeDeductionsCents = deductionComponents.reduce((sum2, row) => sum2 + monthlyAmount(row.amount, row.frequency), 0);
        employeeBenefitsCents = benefitComponents.reduce((sum2, row) => sum2 + Number(row.cost || 0), 0);
        employerBenefitsCents = benefitComponents.reduce((sum2, row) => sum2 + Number(row.employerCost || 0), 0);
      } else {
        employeeDeductionsCents = deductionComponents.reduce((sum2, row) => sum2 + monthlyAmount(row.amount, row.frequency), 0);
      }
      if (allowanceComponents.length === 0) {
        allowancesCents = Number(salaryStructure?.allowances || 0);
      }
      if (deductionComponents.length === 0) {
        employeeDeductionsCents = Number(salaryStructure?.deductions || 0);
      }
      const calc = calculateKenyanPayroll({
        basicSalary: basicSalaryCents,
        allowances: allowancesCents
      });
      const id = uuidv45();
      const statutoryDeductions = calc.nssfContribution + calc.payeeTax + calc.shifContribution + calc.housingLevyDeduction;
      const totalDeductions = statutoryDeductions + employeeDeductionsCents + employeeBenefitsCents;
      const netSalary = calc.grossSalary - totalDeductions;
      const orgId = emp.organizationId;
      const departmentKey = String(emp.department ?? "").trim().toLowerCase();
      const departmentId = orgId ? organizationDepartments.get(orgId)?.get(departmentKey) : globalDepartments.get(departmentKey);
      const employerStatutoryCents = calc.nssfContribution + calc.housingLevyDeduction;
      const explicitAllowanceCents = allowanceComponents.reduce((sum2, row) => sum2 + monthlyAmount(row.amount, row.frequency), 0);
      const expenseComponents = [
        { componentType: "basic_salary", componentName: "Basic Salary", amountCents: calc.basicSalary },
        ...allowanceComponents.map((row) => ({
          componentType: "allowance",
          componentName: String(row.allowanceType || "Allowance"),
          amountCents: monthlyAmount(row.amount, row.frequency),
          departmentIdOverride: row.departmentIdOverride || null,
          glAccountId: row.glAccountId || null
        })),
        ...allowancesCents > explicitAllowanceCents ? [{
          componentType: "allowance",
          componentName: "Other Allowances",
          amountCents: allowancesCents - explicitAllowanceCents
        }] : [],
        { componentType: "employer_statutory", componentName: "Employer NSSF", amountCents: calc.nssfContribution },
        { componentType: "employer_statutory", componentName: "Employer Housing Levy", amountCents: calc.housingLevyDeduction },
        ...benefitComponents.filter((row) => Number(row.employerCost || 0) > 0).map((row) => ({
          componentType: "employer_benefit",
          componentName: String(row.benefitType || "Employer Benefit"),
          amountCents: Number(row.employerCost || 0),
          departmentIdOverride: row.departmentIdOverride || null,
          glAccountId: row.glAccountId || null
        }))
      ];
      await db2.transaction(async (transaction) => {
        await transaction.insert(payroll).values({
          id,
          employeeId: emp.id,
          payPeriodStart,
          payPeriodEnd,
          basicSalary: calc.basicSalary,
          allowances: allowancesCents,
          deductions: totalDeductions,
          tax: calc.payeeTax,
          netSalary,
          status: "processed",
          notes: JSON.stringify({
            grossSalary: calc.grossSalary,
            nssfTier1: calc.details.nssfTier1,
            nssfTier2: calc.details.nssfTier2,
            nssf: calc.nssfContribution,
            shif: calc.shifContribution,
            housingLevy: calc.housingLevyDeduction,
            personalRelief: calc.personalRelief,
            paye: calc.payeeTax,
            statutoryDeductions,
            employerStatutoryCents,
            employeeDeductions: employeeDeductionsCents,
            employeeBenefits: employeeBenefitsCents,
            employerBenefitsCents,
            allowanceComponents,
            deductionComponents,
            benefitComponents,
            payPeriod: payPeriodLabel,
            processedBy: triggeredBy ?? "auto-cron",
            processedAt
          }),
          createdBy: triggeredBy ?? "system",
          createdAt: processedAt,
          updatedAt: processedAt
        });
      });
      if (orgId) payrollOrganizationIds.add(orgId);
      processed++;
      if (orgId) {
        try {
          await db2.transaction(async (transaction) => {
            const allocationResult = await recordPayrollCostAllocation(transaction, {
              organizationId: orgId,
              payrollId: id,
              employeeId: emp.id,
              createdBy: triggeredBy ?? null,
              payrollPeriodStart: payPeriodStart,
              payrollPeriodEnd: payPeriodEnd,
              // Cost-center allocations are the authoritative accounting split. The
              // employee's legacy free-text department is only a fallback for budgets.
              employeeDepartmentId: departmentId ?? null,
              grossPayCents: calc.grossSalary,
              employerStatutoryCents,
              employerBenefitsCents,
              employeeTaxCents: calc.payeeTax,
              netPayoutCents: netSalary,
              expenseComponents,
              liabilityComponents: [
                ...deductionComponents.map((row) => ({
                  componentName: String(row.deductionType || "Salary Deduction"),
                  amountCents: monthlyAmount(row.amount, row.frequency),
                  glAccountId: row.glAccountId || null
                })),
                ...benefitComponents.filter((row) => Number(row.cost || 0) > 0).map((row) => ({
                  componentName: String(row.benefitType || "Employee Benefit"),
                  amountCents: Number(row.cost || 0),
                  glAccountId: row.glAccountId || null
                })),
                ...[
                  { componentName: "NSSF", amountCents: calc.nssfContribution },
                  { componentName: "PAYE", amountCents: calc.payeeTax },
                  { componentName: "SHIF", amountCents: calc.shifContribution },
                  { componentName: "Housing Levy", amountCents: calc.housingLevyDeduction }
                ].map((component) => ({ ...component, componentType: "statutory_liability" }))
              ]
            });
            if (allocationResult.inserted) {
              const budgetTotals = /* @__PURE__ */ new Map();
              for (const split of allocationResult.budgetSplits ?? []) {
                if (!split.departmentId) {
                  throw new Error(`Cost center ${split.costCenterId} has no department for budget charging`);
                }
                budgetTotals.set(split.departmentId, (budgetTotals.get(split.departmentId) ?? 0) + split.fullyBurdenedCostCents);
              }
              for (const [budgetDepartmentId, amountCents] of budgetTotals) {
                const budget = await findActiveBudget(transaction, orgId, budgetDepartmentId, year);
                if (!budget) throw new Error(`No budget found for department ${budgetDepartmentId} in FY${year}`);
                await checkBudget(transaction, amountCents, orgId, {
                  budgetId: budget.budgetId,
                  departmentId: budgetDepartmentId,
                  fiscalYear: year,
                  label: `payroll ${payPeriodLabel}`
                });
                await deductFromBudget(transaction, budget.budgetId, amountCents);
              }
            }
          });
        } catch (allocationError) {
          const message = allocationError?.message ?? String(allocationError);
          let budgetMessage = "";
          if (departmentId) {
            try {
              await db2.transaction(async (transaction) => {
                const budget = await findActiveBudget(transaction, orgId, departmentId, year);
                if (!budget) throw new Error(`No budget found for department ${departmentId} in FY${year}`);
                const fullyBurdenedCostCents = calc.grossSalary + employerStatutoryCents + employerBenefitsCents;
                await checkBudget(transaction, fullyBurdenedCostCents, orgId, {
                  budgetId: budget.budgetId,
                  departmentId,
                  fiscalYear: year,
                  label: `payroll ${payPeriodLabel}`
                });
                await deductFromBudget(transaction, budget.budgetId, fullyBurdenedCostCents);
              });
              budgetMessage = "; department budget was charged using the employee's department";
            } catch (budgetError) {
              const budgetErrorMessage = budgetError?.message ?? String(budgetError);
              budgetMessage = `; budget deduction also failed: ${budgetErrorMessage}`;
              console.error("[PAYROLL-CRON] Department budget fallback failed:", budgetError);
            }
          } else {
            budgetMessage = "; budget could not be charged because the employee has no matching department";
          }
          errors.push(`${emp.firstName} ${emp.lastName}: payroll was created${budgetMessage}, but accounting allocation failed: ${message}`);
          console.error("[PAYROLL-CRON] Payroll created but accounting allocation failed:", allocationError);
        }
      }
      if (pool) {
        const components = [
          ...allowanceComponents.map((item) => ["allowance", item.allowanceType, Number(item.amount || 0)]),
          ...deductionComponents.map((item) => ["deduction", item.deductionType, Number(item.amount || 0)]),
          ...benefitComponents.map((item) => ["benefit", item.benefitType, Number(item.cost || 0)]),
          ...benefitComponents.filter((item) => Number(item.employerCost || 0) > 0).map((item) => ["employer_contribution", `${item.benefitType} (Employer)`, Number(item.employerCost || 0)]),
          ["statutory", "NSSF", calc.nssfContribution],
          ["statutory", "PAYE", calc.payeeTax],
          ["statutory", "SHIF", calc.shifContribution],
          ["statutory", "Housing Levy", calc.housingLevyDeduction]
        ];
        for (const [index4, [componentType, component, amount]] of components.entries()) {
          const isDeduction = componentType === "deduction" || componentType === "statutory" || componentType === "benefit";
          await pool.query(
            `INSERT INTO payrollDetails (id, payrollId, itemType, itemId, description, amount, isDeduction, lineNumber, componentType, component, notes, createdAt) VALUES (?, ?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [uuidv45(), id, componentType, component, amount, isDeduction ? 1 : 0, index4 + 1, componentType, component, "Automated monthly payroll component", processedAt]
          ).catch((detailErr) => console.warn("[PAYROLL-CRON] Payroll detail insert failed:", detailErr?.message));
        }
      }
    } catch (err) {
      errors.push(`${emp.firstName} ${emp.lastName}: ${err?.message ?? err}`);
      console.error("[PAYROLL-CRON] Error processing employee payroll:", err);
    }
  }
  try {
    for (const orgId of payrollOrganizationIds) {
      await notifyByRole(db2, orgId, ["admin", "hr_manager", "hr", "superadmin", "super_admin"], {
        title: "\u2705 Monthly Payroll Processed",
        message: `Payroll for ${payPeriodLabel} has been automatically processed. ${processed} employees processed, ${skipped} skipped.`,
        actionUrl: "/payroll",
        type: "success"
      });
    }
    if (payrollOrganizationIds.size === 0 && activeEmployees.length > 0) {
      await notifyByRole(db2, void 0, ["admin", "hr_manager", "hr", "superadmin"], {
        title: "\u2705 Monthly Payroll Processed",
        message: `Payroll for ${payPeriodLabel} has been automatically processed. ${processed} employees processed.`,
        actionUrl: "/payroll",
        type: "success"
      });
    }
  } catch (notifyErr) {
    console.warn("[PAYROLL-CRON] Failed to send admin notifications:", notifyErr);
  }
  console.log(
    `[PAYROLL-CRON] ${payPeriodLabel} \u2014 processed: ${processed}, skipped: ${skipped}, errors: ${errors.length}`
  );
  return { processed, skipped, errors };
}
async function dispatchPayslips(targetYear, targetMonth, organizationId) {
  const db2 = await getDb();
  const pool = getPool();
  if (!db2) {
    console.error("[PAYROLL-CRON] Database not available for payslip dispatch");
    return { dispatched: 0, errors: ["Database not available"] };
  }
  if (!pool) {
    console.error("[PAYROLL-CRON] Database connection pool not available for payslip dispatch");
    return { dispatched: 0, errors: ["Database connection pool not available"] };
  }
  const now2 = /* @__PURE__ */ new Date();
  const year = targetYear ?? now2.getFullYear();
  const month = targetMonth ?? now2.getMonth() + 1;
  const payPeriodLabel = `${year}-${String(month).padStart(2, "0")}`;
  const payPeriodStart = periodStart(year, month);
  const payPeriodEnd = periodEnd(year, month);
  console.log(`[PAYROLL-CRON] Dispatching payslips for ${payPeriodLabel}...`);
  const payrollConditions = [
    eq12(payroll.payPeriodStart, payPeriodStart),
    inArray4(payroll.status, ["processed", "paid"])
  ];
  if (organizationId !== void 0) {
    const orgEmployees = await db2.select({ id: employees.id }).from(employees).where(organizationId === null ? isNull4(employees.organizationId) : eq12(employees.organizationId, organizationId));
    if (orgEmployees.length === 0) {
      return { dispatched: 0, errors: ["No employees found in this organization"] };
    }
    payrollConditions.push(inArray4(payroll.employeeId, orgEmployees.map((employee) => employee.id)));
  }
  const payrollRecords = await db2.select().from(payroll).where(and10(...payrollConditions));
  if (payrollRecords.length === 0) {
    console.log("[PAYROLL-CRON] No payroll records found for dispatch");
    return { dispatched: 0, errors: ["No payroll records found for this period"] };
  }
  const empIds = payrollRecords.map((r) => r.employeeId);
  const empData = await db2.select().from(employees).where(inArray4(employees.id, empIds));
  const empMap = new Map(empData.map((e) => [e.id, e]));
  const companyInfo = await getCompanyInfo();
  const companyName = companyInfo.name;
  const companyAddress = companyInfo.address;
  const companyLogo = companyInfo.logo;
  let dispatched = 0;
  const errors = [];
  for (const record of payrollRecords) {
    try {
      const emp = empMap.get(record.employeeId);
      if (!emp) {
        errors.push(`Employee not found: ${record.employeeId}`);
        continue;
      }
      let details = {};
      try {
        details = JSON.parse(record.notes || "{}");
      } catch {
      }
      let allowancesBreakdown = [];
      if (pool) {
        try {
          const [allRows] = await pool.query(
            `SELECT allowanceType AS allowanceName, amount FROM salaryAllowances WHERE employeeId = ? AND isActive = 1 AND effectiveDate <= ? AND (endDate IS NULL OR endDate >= ?)`,
            [emp.id, payPeriodEnd, payPeriodStart]
          );
          allowancesBreakdown = allRows.map((a) => ({
            name: a.allowanceName,
            // Salary allowance amounts are stored in whole KES; payslips use cents.
            amount: Math.round(Number(a.amount || 0) * 100)
          }));
        } catch {
        }
      }
      const deductionsBreakdown = [
        ...(details.deductionComponents || []).map((item) => ({ type: "deduction", name: item.deductionType || item.name || "Deduction", amount: Number(item.amount || 0) })),
        ...(details.benefitComponents || []).map((item) => ({ type: "benefit", name: item.benefitType || item.name || "Benefit", amount: Number(item.cost || item.amount || 0) })),
        { type: "statutory", name: "PAYE", amount: Number(details.paye ?? record.tax ?? 0) },
        { type: "statutory", name: "NSSF", amount: Number(details.nssf ?? 0) },
        { type: "statutory", name: "SHIF", amount: Number(details.shif ?? 0) },
        { type: "statutory", name: "Housing Levy", amount: Number(details.housingLevy ?? 0) }
      ];
      const employerContributions = [
        ...(details.benefitComponents || []).filter((item) => Number(item.employerCost || 0) > 0).map((item) => ({
          name: item.benefitType || item.name || "Employer Benefit",
          amount: Number(item.employerCost || 0)
        })),
        { name: "NSSF Employer", amount: Number(details.nssf ?? 0) },
        { name: "Housing Levy Employer", amount: Number(details.housingLevy ?? 0) }
      ];
      const payslipData = {
        payPeriod: payPeriodLabel,
        payDate: fmt(lastDay(year, month)),
        employee: {
          name: `${emp.firstName} ${emp.lastName}`,
          id: emp.employeeNumber,
          department: emp.department ?? "",
          position: emp.position ?? "",
          bankName: emp.bankName ?? "",
          bankAccount: emp.bankAccountNumber ?? "",
          nssfNumber: emp.nssfNumber ?? "",
          nhifNumber: emp.nhifNumber ?? "",
          taxPin: emp.taxId ?? "",
          nationalId: emp.nationalId ?? ""
        },
        company: { name: companyName, address: companyAddress, logo: companyLogo, employerContributions },
        earnings: {
          basicSalary: record.basicSalary,
          allowances: allowancesBreakdown,
          grossSalary: details.grossSalary ?? record.basicSalary + record.allowances
        },
        deductions: {
          paye: details.paye ?? record.tax ?? 0,
          nssf: details.nssf ?? 0,
          nssfTier1: details.nssfTier1 ?? 0,
          nssfTier2: details.nssfTier2 ?? 0,
          shif: details.shif ?? 0,
          housingLevy: details.housingLevy ?? 0,
          personalRelief: details.personalRelief ?? 0,
          total: record.deductions ?? 0
        },
        netSalary: record.netSalary
      };
      const htmlContent = await applySavedPayslipTemplate(pool, generatePayslipHTML(payslipData), {
        company_name: companyName,
        company_address: companyAddress,
        company_logo: companyLogo,
        employee_name: payslipData.employee.name,
        employee_number: payslipData.employee.id,
        department: payslipData.employee.department,
        position: payslipData.employee.position,
        pay_period: payPeriodLabel,
        pay_date: payslipData.payDate,
        payslip_number: `${payslipData.employee.id}-${payPeriodLabel}`,
        basic_salary: formatMinorCurrencyAmount(payslipData.earnings.basicSalary, "KES", { symbol: "KES", minimumFractionDigits: 2 }),
        allowances: formatMinorCurrencyAmount(payslipData.earnings.allowances.reduce((sum2, item) => sum2 + item.amount, 0), "KES", { symbol: "KES", minimumFractionDigits: 2 }),
        gross_salary: formatMinorCurrencyAmount(payslipData.earnings.grossSalary, "KES", { symbol: "KES", minimumFractionDigits: 2 }),
        total_deductions: formatMinorCurrencyAmount(payslipData.deductions.total, "KES", { symbol: "KES", minimumFractionDigits: 2 }),
        net_salary: formatMinorCurrencyAmount(payslipData.netSalary, "KES", { symbol: "KES", minimumFractionDigits: 2 }),
        paye: formatMinorCurrencyAmount(payslipData.deductions.paye, "KES", { symbol: "KES", minimumFractionDigits: 2 }),
        nssf: formatMinorCurrencyAmount(payslipData.deductions.nssf, "KES", { symbol: "KES", minimumFractionDigits: 2 }),
        nhif: formatMinorCurrencyAmount(payslipData.deductions.shif, "KES", { symbol: "KES", minimumFractionDigits: 2 }),
        loan_deduction: formatMinorCurrencyAmount(
          deductionsBreakdown.filter((item) => /loan/i.test(item.name)).reduce((sum2, item) => sum2 + item.amount, 0),
          "KES",
          { symbol: "KES", minimumFractionDigits: 2 }
        ),
        other_deductions: formatMinorCurrencyAmount(
          deductionsBreakdown.filter((item) => item.type === "deduction" && !/loan/i.test(item.name)).reduce((sum2, item) => sum2 + item.amount, 0),
          "KES",
          { symbol: "KES", minimumFractionDigits: 2 }
        ),
        employer_nssf: formatMinorCurrencyAmount(details.nssf ?? 0, "KES", { symbol: "KES", minimumFractionDigits: 2 }),
        employer_benefits: formatMinorCurrencyAmount(
          employerContributions.reduce((sum2, item) => sum2 + item.amount, 0),
          "KES",
          { symbol: "KES", minimumFractionDigits: 2 }
        ),
        total_company_contribution: formatMinorCurrencyAmount(
          employerContributions.reduce((sum2, item) => sum2 + item.amount, 0),
          "KES",
          { symbol: "KES", minimumFractionDigits: 2 }
        ),
        ...Object.fromEntries(allowancesBreakdown.slice(0, 4).flatMap((item, index4) => [
          [`allowance_${index4 + 1}_name`, item.name],
          [`allowance_${index4 + 1}_amount`, formatMinorCurrencyAmount(item.amount, "KES", { symbol: "KES", minimumFractionDigits: 2 })]
        ]))
      }, emp.organizationId);
      if (pool) {
        const [existing] = await pool.query(
          `SELECT id, status FROM payslips WHERE employeeId = ? AND payPeriod = ?`,
          [emp.id, payPeriodLabel]
        );
        const existingSlip = existing[0];
        if (["sent", "viewed", "downloaded"].includes(existingSlip?.status)) {
          continue;
        }
        if (!existingSlip) {
          await pool.query(
            `INSERT INTO payslips (
              id, payrollId, organizationId, payrollDetailId, employeeId, payslipNumber,
              payPeriod, payDate, payPeriodStart, payPeriodEnd, payMonth, basicSalary,
              allowances, bonuses, grossSalary, nssfDeduction, nhifDeduction,
              payeDeduction, totalDeductions, netSalary, bankName, bankAccountNumber,
              allowancesBreakdown, deductionsBreakdown, htmlContent, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'generated')`,
            [
              uuidv45(),
              record.id,
              emp.organizationId,
              record.id,
              emp.id,
              `${payslipData.employee.id || emp.id}-${payPeriodLabel}`,
              payPeriodLabel,
              fmt(lastDay(year, month)),
              payPeriodStart,
              payPeriodEnd,
              payPeriodStart,
              record.basicSalary,
              record.allowances,
              payslipData.earnings.grossSalary,
              details.nssf ?? 0,
              details.shif ?? 0,
              details.paye ?? record.tax ?? 0,
              record.deductions,
              record.netSalary,
              emp.bankName ?? null,
              emp.bankAccountNumber ?? null,
              JSON.stringify(allowancesBreakdown),
              JSON.stringify(deductionsBreakdown),
              htmlContent
            ]
          );
        } else {
          await pool.query(
            `UPDATE payslips SET htmlContent = ?, updatedAt = NOW() WHERE employeeId = ? AND payPeriod = ?`,
            [htmlContent, emp.id, payPeriodLabel]
          );
        }
      }
      if (emp.email) {
        let emailSent = false;
        try {
          await sendEmailImmediately({
            toEmail: emp.email,
            subject: `Your Payslip for ${payPeriodLabel} \u2014 ${companyName}`,
            htmlContent
          });
          emailSent = true;
          dispatched++;
        } catch (emailErr) {
          const message = `Failed to deliver payslip to ${emp.email}: ${emailErr?.message || "Unknown email error"}`;
          errors.push(message);
          console.error("[PAYROLL-CRON]", message);
        }
        if (emailSent && pool) {
          try {
            await pool.query(
              `UPDATE payslips SET status = 'sent', sentAt = NOW(), updatedAt = NOW() WHERE employeeId = ? AND payPeriod = ?`,
              [emp.id, payPeriodLabel]
            );
          } catch (statusErr) {
            const message = `Payslip was emailed to ${emp.email}, but its sent status could not be saved: ${statusErr?.message || "Unknown database error"}`;
            errors.push(message);
            console.error("[PAYROLL-CRON]", message);
          }
        }
      } else {
        errors.push(`Payslip generated for ${emp.firstName} ${emp.lastName}, but no email address is configured`);
      }
      try {
        let empUserId = emp.userId ?? null;
        if (!empUserId && emp.email && pool) {
          const [uRows] = await pool.query(
            `SELECT id FROM users WHERE email = ? LIMIT 1`,
            [emp.email]
          );
          empUserId = uRows[0]?.id ?? null;
        }
        if (empUserId) {
          await createNotification({
            userId: empUserId,
            title: `\u{1F4C4} Your Payslip for ${payPeriodLabel} is Ready`,
            message: `Your payslip for ${payPeriodLabel} has been issued. Net Pay: ${formatMinorCurrencyAmount(record.netSalary, "KES", { symbol: "KES" })}. Click to view.`,
            type: "info",
            category: "payslip",
            entityType: "payslip",
            entityId: payPeriodLabel,
            actionUrl: "/payslips",
            priority: "high"
          }).catch(console.warn);
        }
      } catch (notifErr) {
        console.warn("[PAYROLL-CRON] Failed to notify employee:", notifErr);
      }
    } catch (err) {
      errors.push(`Payslip error for employee ${record.employeeId}: ${err?.message}`);
      console.error("[PAYROLL-CRON] Payslip dispatch error:", err);
    }
  }
  try {
    const organizationIds = [
      ...new Set(
        empData.map((employee) => employee.organizationId).filter((organizationId2) => typeof organizationId2 === "string" && organizationId2.length > 0)
      )
    ];
    for (const organizationId2 of organizationIds) {
      await notifyByRole(db2, organizationId2, ["admin", "hr_manager", "hr", "superadmin", "super_admin"], {
        title: "\u{1F4E4} Payslips Dispatched",
        message: `${dispatched} payslips for ${payPeriodLabel} have been dispatched to staff.`,
        actionUrl: "/payslips",
        type: "success"
      });
    }
  } catch (error) {
    console.error("[PAYROLL-CRON] Failed to notify organizations about payslip dispatch:", error);
  }
  console.log(`[PAYROLL-CRON] Dispatched ${dispatched} payslips for ${payPeriodLabel}`);
  return { dispatched, errors };
}
async function processAndDispatchPayslips(targetYear, targetMonth, triggeredBy = "system-cron", organizationId) {
  const payrollResult = await processMonthlyPayroll(targetYear, targetMonth, triggeredBy, organizationId);
  const payslipResult = await dispatchPayslips(targetYear, targetMonth, organizationId);
  return {
    processed: payrollResult.processed,
    skipped: payrollResult.skipped,
    dispatched: payslipResult.dispatched,
    errors: [
      ...payrollResult.errors.map((error) => `Payroll: ${error}`),
      ...payslipResult.errors
    ]
  };
}

// server/jobs/p9Jobs.ts
async function generateAnnualP9Forms(taxYear, triggeredBy) {
  const pool = getPool();
  if (!pool) {
    console.error("[P9-JOB] Database pool not available");
    return { generated: 0, errors: ["Database not available"] };
  }
  const year = taxYear || (/* @__PURE__ */ new Date()).getFullYear() - 1;
  const errors = [];
  let generated = 0;
  try {
    console.log(`[P9-JOB] Starting P9 generation for tax year ${year}`);
    const [orgsRows] = await pool.query(
      `SELECT DISTINCT organizationId FROM employees WHERE status = 'active' AND organizationId IS NOT NULL`
    );
    if (!orgsRows || orgsRows.length === 0) {
      console.warn("[P9-JOB] No active organizations found");
      return { generated: 0, errors: ["No active organizations"] };
    }
    for (const org of orgsRows) {
      try {
        const [empRows] = await pool.query(
          `SELECT id FROM employees WHERE organizationId = ? AND status = 'active'`,
          [org.organizationId]
        );
        if (!empRows || empRows.length === 0) {
          console.log(`[P9-JOB] No active employees in org ${org.organizationId}`);
          continue;
        }
        for (const emp of empRows) {
          try {
            const [existingRows] = await pool.query(
              `SELECT id FROM p9_forms WHERE organizationId = ? AND employeeId = ? AND taxYear = ? LIMIT 1`,
              [org.organizationId, emp.id, year]
            );
            if (existingRows.length > 0) continue;
            const result = await generateP9Form(
              {
                employeeId: emp.id,
                organizationId: org.organizationId,
                taxYear: year
              },
              triggeredBy || "system"
            );
            if (result) {
              generated++;
            } else {
              errors.push(`Failed to generate P9 for employee ${emp.id} in org ${org.organizationId}`);
            }
          } catch (empError) {
            errors.push(
              `Error generating P9 for employee ${emp.id}: ${empError?.message}`
            );
          }
        }
        try {
          await notifyByRole(await getDb(), org.organizationId, ["hr", "admin"], {
            title: "Annual P9 Forms Generated",
            message: `P9 tax forms for year ${year} have been generated and are ready for distribution to employees.`,
            type: "info"
          });
        } catch (notifyError) {
          console.error("[P9-JOB] Failed to send notification:", notifyError);
        }
      } catch (orgError) {
        errors.push(`Error processing org ${org.organizationId}: ${orgError?.message}`);
      }
    }
    console.log(
      `[P9-JOB] P9 generation completed. Generated: ${generated}, Errors: ${errors.length}`
    );
  } catch (error) {
    console.error("[P9-JOB] Fatal error during P9 generation:", error);
    errors.push(`Fatal error: ${error?.message}`);
  }
  return { generated, errors };
}

// server/jobs/scheduledJobRunner.ts
function nairobiDate(date2) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Nairobi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date2);
  const part = (type) => Number(parts.find((entry) => entry.type === type)?.value);
  return { year: part("year"), month: part("month"), day: part("day") };
}
function parsePayPeriod(value) {
  const match = value?.match(/^(\d{4})-(0[1-9]|1[0-2])$/);
  if (!match) return null;
  return { year: Number(match[1]), month: Number(match[2]) };
}
function lastDayOfMonth(year, month) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}
async function runScheduledJob(name, period, now2 = /* @__PURE__ */ new Date()) {
  const current = nairobiDate(now2);
  switch (name) {
    case "payroll-process": {
      const target = parsePayPeriod(period) || current;
      return processMonthlyPayroll(target.year, target.month, "system-cron");
    }
    case "payslip-dispatch": {
      const target = parsePayPeriod(period) || current;
      if (!period && target.day !== lastDayOfMonth(target.year, target.month)) {
        return { dispatched: 0, errors: [], skipped: true };
      }
      return processAndDispatchPayslips(target.year, target.month);
    }
    case "p9-generate": {
      const taxYear = period ? Number(period) : current.year - 1;
      if (!Number.isInteger(taxYear) || taxYear < 2e3 || taxYear > 2100) {
        throw new Error("P9 tax year must be between 2000 and 2100");
      }
      return generateAnnualP9Forms(taxYear, "system-cron");
    }
    default:
      throw new Error(`Unsupported scheduled job: ${name}`);
  }
}
async function closeScheduledJobConnections() {
  const pool = getPool();
  if (pool) await pool.end();
}
export {
  closeScheduledJobConnections,
  runScheduledJob
};
