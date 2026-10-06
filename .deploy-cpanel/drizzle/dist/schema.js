"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
exports.__esModule = true;
exports.approvalWorkflows = exports.hrSettings = exports.employeeSkills = exports.onboardingTasks = exports.onboardingChecklists = exports.trainingEnrollments = exports.trainingCourses = exports.holidays = exports.taxCompliance = exports.leaveApprovals = exports.leaveBalances = exports.payslips = exports.payrollDetails = exports.payrollBatches = exports.timesheets = exports.employeeTransfers = exports.employeePromotions = exports.departmentHierarchies = exports.activeSessions = exports.systemLogs = exports.systemHealth = exports.clientSubscriptions = exports.stockMovements = exports.warehouses = exports.kbArticles = exports.kbCategories = exports.cannedResponses = exports.staffChatMessages = exports.staffChatChannels = exports.complianceRecords = exports.collaborationSessions = exports.executiveReports = exports.cohortAnalyses = exports.analyticsMetrics = exports.aiInsights = exports.designConfigs = exports.integrationConfigs = exports.backupHistory = exports.backupSchedules = exports.perfConfigs = exports.partnerDeals = exports.mobileAppConfigs = exports.registeredDevices = exports.globalConfigs = exports.securityIncidents = exports.emailCalendarSync = exports.webhookConfigs = exports.customDashboards = exports.containerDeployments = exports.etlJobs = exports.apiPricingConfigs = exports.aiConfigurations = exports.securityEvents = exports.exportJobs = exports.smartWorkflows = exports.workflowAutomationLogs = exports.automationConfigs = exports.bankReconciliationDetails = exports.bankReconciliationStatements = exports.leads = exports.goodsReceiptNotes = exports.purchaseOrderItems = exports.purchaseOrders = exports.imprestSurrenders = exports.imprests = exports.organizationAccountingPolicies = exports.customReports = exports.notes = exports.warranties = exports.contracts = exports.assets = exports.deliveryNotes = exports.grnRecords = exports.quotations = exports.contacts = exports.serviceInvoiceItems = exports.serviceInvoices = exports.workOrderMaterials = exports.workOrders = exports.emailLogs = exports.emailCampaigns = exports.automatedReceipts = exports.recurringInvoiceTemplates = exports.ticketResponses = exports.tickets = exports.messageReadReceipts = exports.conversationMembers = exports.pricingTierFeatures = exports.tenantMessages = exports.organizationUsers = exports.organizationFeatures = exports.organizations = exports.conversations = exports.messages = exports.notificationBroadcasts = exports.notificationTemplates = exports.userDeletions = exports.dunningEvents = exports.paymentRetries = exports.dunningPolicies = exports.billingNotifications = exports.billingUsageMetrics = exports.paymentMethods = exports.payments = exports.billingInvoices = exports.subscriptions = exports.pricingPlans = exports.invoiceReminders = exports.emailLog = exports.emailQueue = exports.integrationLogs = exports.webhooks = exports.apiKeys = exports.forecastResults = exports.forecastModels = exports.taxRates = exports.exchangeRates = exports.currencies = exports.reimbursements = exports.expenseReports = exports.expenseCategories = exports.usageMetrics = exports.notificationRules = exports.documentAccess = exports.documentVersions = exports.documents = exports.vacationRequests = exports.schedules = exports.skillsMatrix = exports.performanceReviews = exports.clientHealthScores = exports.projectMetrics = exports.permissionAuditLog = exports.dashboardWidgetData = exports.dashboardWidgets = exports.dashboardLayouts = exports.permissionMetadata = exports.workflowExecutions = exports.workflowActions = exports.workflowTriggers = exports.workflows = exports.lineItems = exports.aiChatMessages = exports.aiChatSessions = exports.financialAnalytics = exports.emailGenerationHistory = exports.aiDocuments = exports.userFavorites = exports.smsDeliveryEvents = exports.smsAutomationRules = exports.smsTemplates = exports.smsCustomerPreferences = exports.smsQueue = exports.notificationPreferences = exports.notificationSettings = exports.notifications = exports.savedFilters = exports.users = exports.userPermissions = exports.staffTasks = exports.projectComments = exports.userProjectAssignments = exports.attendance = exports.budgets = exports.departments = exports.debitNotes = exports.creditNotes = exports.receipts = exports.rolePermissions = exports.userRoles = exports.customRoles = exports.permissions = exports.defaultSettings = exports.documentNumberFormats = exports.templates = exports.systemSettings = exports.stockAlerts = exports.settings = exports.services = exports.scheduledReminders = exports.reminders = exports.timeEntries = exports.projectMilestones = exports.projects = exports.projectTasks = exports.products = exports.payroll = exports.paymentPlanInstallments = exports.paymentPlans = exports.opportunities = exports.leaveRequests = exports.journalEntryLines = exports.journalEntries = exports.recurringInvoices = exports.invoices = exports.invoiceItems = exports.inventoryTransactions = exports.guestClients = exports.recurringExpenses = exports.expenses = exports.proposals = exports.estimates = exports.estimateItems = exports.employees = exports.jobGroups = exports.communicationLogs = exports.clients = exports.bankTransactions = exports.bankAccounts = exports.auditLogs = exports.activityLog = exports.accounts = void 0;
var mysql_core_1 = require("drizzle-orm/mysql-core");
var drizzle_orm_1 = require("drizzle-orm");
exports.accounts = mysql_core_1.mysqlTable("accounts", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar({ length: 64 }),
    accountCode: mysql_core_1.varchar({ length: 50 }).notNull(),
    accountName: mysql_core_1.varchar({ length: 255 }).notNull(),
    accountType: mysql_core_1.mysqlEnum(['asset', 'liability', 'equity', 'revenue', 'expense', 'cost of goods sold', 'operating expense', 'capital expenditure', 'other income', 'other expense']).notNull(),
    parentAccountId: mysql_core_1.varchar({ length: 64 }),
    balance: mysql_core_1.int()["default"](0),
    isActive: mysql_core_1.tinyint()["default"](1).notNull(),
    description: mysql_core_1.text(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' })["default"](drizzle_orm_1.sql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP"])))),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' })["default"](drizzle_orm_1.sql(templateObject_2 || (templateObject_2 = __makeTemplateObject(["CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"], ["CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"]))))
}, function (table) { return [
    mysql_core_1.index("account_code_idx").on(table.accountCode),
    mysql_core_1.index("account_type_idx").on(table.accountType),
]; });
exports.activityLog = mysql_core_1.mysqlTable("activityLog", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    userId: mysql_core_1.varchar({ length: 64 }).notNull(),
    action: mysql_core_1.varchar({ length: 100 }).notNull(),
    entityType: mysql_core_1.varchar({ length: 100 }),
    entityId: mysql_core_1.varchar({ length: 64 }),
    description: mysql_core_1.text(),
    metadata: mysql_core_1.text(),
    ipAddress: mysql_core_1.varchar({ length: 45 }),
    createdAt: mysql_core_1.timestamp({ mode: 'string' })
}, function (table) { return [
    mysql_core_1.index("user_idx").on(table.userId),
    mysql_core_1.index("entity_idx").on(table.entityType, table.entityId),
    mysql_core_1.index("created_at_idx").on(table.createdAt),
]; });
exports.auditLogs = mysql_core_1.mysqlTable("auditLogs", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    userId: mysql_core_1.varchar({ length: 64 }).notNull(),
    action: mysql_core_1.varchar({ length: 100 }).notNull(),
    resourceType: mysql_core_1.varchar({ length: 50 }).notNull(),
    resourceId: mysql_core_1.varchar({ length: 64 }),
    changes: mysql_core_1.text(),
    ipAddress: mysql_core_1.varchar({ length: 50 }),
    userAgent: mysql_core_1.text(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' })
});
exports.bankAccounts = mysql_core_1.mysqlTable("bankAccounts", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    accountName: mysql_core_1.varchar({ length: 255 }).notNull(),
    bankName: mysql_core_1.varchar({ length: 255 }).notNull(),
    accountNumber: mysql_core_1.varchar({ length: 100 }).notNull(),
    currency: mysql_core_1.varchar({ length: 10 })["default"]('KES').notNull(),
    balance: mysql_core_1.int()["default"](0),
    isActive: mysql_core_1.tinyint()["default"](1).notNull(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' })
});
exports.bankTransactions = mysql_core_1.mysqlTable("bankTransactions", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    bankAccountId: mysql_core_1.varchar({ length: 64 }).notNull(),
    transactionDate: mysql_core_1.datetime({ mode: 'string' }).notNull(),
    description: mysql_core_1.text(),
    referenceNumber: mysql_core_1.varchar({ length: 100 }),
    debit: mysql_core_1.int()["default"](0),
    credit: mysql_core_1.int()["default"](0),
    balance: mysql_core_1.int().notNull(),
    isReconciled: mysql_core_1.tinyint()["default"](0).notNull(),
    reconciledDate: mysql_core_1.datetime({ mode: 'string' }),
    reconciledBy: mysql_core_1.varchar({ length: 64 }),
    matchedTransactionId: mysql_core_1.varchar({ length: 64 }),
    createdAt: mysql_core_1.timestamp({ mode: 'string' })
}, function (table) { return [
    mysql_core_1.index("bank_account_idx").on(table.bankAccountId),
    mysql_core_1.index("transaction_date_idx").on(table.transactionDate),
    mysql_core_1.index("reconciled_idx").on(table.isReconciled),
]; });
exports.clients = mysql_core_1.mysqlTable("clients", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar({ length: 64 }),
    companyName: mysql_core_1.varchar({ length: 255 }).notNull(),
    contactPerson: mysql_core_1.varchar({ length: 255 }),
    email: mysql_core_1.varchar({ length: 320 }),
    phone: mysql_core_1.varchar({ length: 50 }),
    secondaryPhone: mysql_core_1.varchar({ length: 50 }),
    address: mysql_core_1.text(),
    city: mysql_core_1.varchar({ length: 100 }),
    country: mysql_core_1.varchar({ length: 100 }),
    postalCode: mysql_core_1.varchar({ length: 20 }),
    taxId: mysql_core_1.varchar({ length: 100 }),
    website: mysql_core_1.varchar({ length: 255 }),
    industry: mysql_core_1.varchar({ length: 100 }),
    status: mysql_core_1.mysqlEnum(['active', 'inactive', 'prospect', 'archived'])["default"]('active').notNull(),
    assignedTo: mysql_core_1.varchar({ length: 64 }),
    notes: mysql_core_1.text(),
    createdBy: mysql_core_1.varchar({ length: 64 }),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' }),
    businessType: mysql_core_1.varchar({ length: 100 }),
    registrationNumber: mysql_core_1.varchar({ length: 100 }),
    bankName: mysql_core_1.varchar({ length: 255 }),
    bankCode: mysql_core_1.varchar({ length: 50 }),
    branch: mysql_core_1.varchar({ length: 100 }),
    bankAccountNumber: mysql_core_1.varchar({ length: 100 }),
    creditLimit: mysql_core_1.int(),
    paymentTerms: mysql_core_1.varchar({ length: 100 }),
    numberOfEmployees: mysql_core_1.int(),
    yearEstablished: mysql_core_1.int(),
    businessLicense: mysql_core_1.varchar({ length: 255 }),
    leadSource: mysql_core_1.varchar({ length: 100 }),
    currency: mysql_core_1.varchar({ length: 10 })
}, function (table) { return [
    mysql_core_1.index("email_idx").on(table.email),
    mysql_core_1.index("status_idx").on(table.status),
]; });
exports.communicationLogs = mysql_core_1.mysqlTable("communicationLogs", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar({ length: 64 }),
    type: mysql_core_1.mysqlEnum(['email', 'sms']).notNull(),
    recipient: mysql_core_1.varchar({ length: 320 }).notNull(),
    subject: mysql_core_1.varchar({ length: 500 }),
    body: mysql_core_1.text(),
    status: mysql_core_1.mysqlEnum(['pending', 'sent', 'failed'])["default"]('pending').notNull(),
    error: mysql_core_1.text(),
    referenceType: mysql_core_1.varchar({ length: 50 }),
    referenceId: mysql_core_1.varchar({ length: 64 }),
    sentAt: mysql_core_1.datetime({ mode: 'string' }),
    createdBy: mysql_core_1.varchar({ length: 64 }),
    createdAt: mysql_core_1.timestamp({ mode: 'string' })
});
exports.jobGroups = mysql_core_1.mysqlTable("jobGroups", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    name: mysql_core_1.varchar({ length: 100 }).notNull(),
    minimumGrossSalary: mysql_core_1.int().notNull(),
    maximumGrossSalary: mysql_core_1.int().notNull(),
    description: mysql_core_1.text(),
    isActive: mysql_core_1.tinyint()["default"](1).notNull(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' })
}, function (table) { return [
    mysql_core_1.index("job_group_name_idx").on(table.name),
    mysql_core_1.index("is_active_idx").on(table.isActive),
]; });
exports.employees = mysql_core_1.mysqlTable("employees", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar({ length: 64 }),
    userId: mysql_core_1.varchar({ length: 64 }),
    employeeNumber: mysql_core_1.varchar({ length: 50 }).notNull(),
    firstName: mysql_core_1.varchar({ length: 100 }).notNull(),
    lastName: mysql_core_1.varchar({ length: 100 }).notNull(),
    email: mysql_core_1.varchar({ length: 320 }),
    phone: mysql_core_1.varchar({ length: 50 }),
    country: mysql_core_1.varchar({ length: 5 })["default"]('KE'),
    gender: mysql_core_1.mysqlEnum(['male', 'female', 'other']),
    maritalStatus: mysql_core_1.mysqlEnum(['single', 'married', 'divorced', 'widowed']),
    dateOfBirth: mysql_core_1.datetime({ mode: 'string' }),
    hireDate: mysql_core_1.datetime({ mode: 'string' }).notNull(),
    probationEndDate: mysql_core_1.datetime({ mode: 'string' }),
    contractEndDate: mysql_core_1.datetime({ mode: 'string' }),
    department: mysql_core_1.varchar({ length: 100 }),
    position: mysql_core_1.varchar({ length: 100 }),
    jobGroupId: mysql_core_1.varchar({ length: 64 }).notNull(),
    salary: mysql_core_1.int(),
    employmentType: mysql_core_1.mysqlEnum(['full_time', 'part_time', 'contract', 'intern', 'contractual', 'hourly', 'wage', 'temporary', 'seasonal'])["default"]('full_time').notNull(),
    status: mysql_core_1.mysqlEnum(['active', 'on_leave', 'terminated', 'suspended'])["default"]('active').notNull(),
    address: mysql_core_1.text(),
    emergencyContactName: mysql_core_1.varchar({ length: 255 }),
    emergencyContactRelationship: mysql_core_1.varchar({ length: 100 }),
    emergencyContactPhone: mysql_core_1.varchar({ length: 50 }),
    emergencyContact: mysql_core_1.text(),
    bankName: mysql_core_1.varchar({ length: 255 }),
    bankBranch: mysql_core_1.varchar({ length: 255 }),
    bankAccountNumber: mysql_core_1.varchar({ length: 100 }),
    nhifNumber: mysql_core_1.varchar({ length: 50 }),
    nssfNumber: mysql_core_1.varchar({ length: 50 }),
    taxId: mysql_core_1.varchar({ length: 100 }),
    nationalId: mysql_core_1.varchar({ length: 100 }),
    photoUrl: mysql_core_1.varchar({ length: 500 }),
    createdBy: mysql_core_1.varchar({ length: 64 }),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' })
}, function (table) { return [
    mysql_core_1.index("employee_number_idx").on(table.employeeNumber),
    mysql_core_1.index("department_idx").on(table.department),
    mysql_core_1.index("job_group_idx").on(table.jobGroupId),
    mysql_core_1.index("status_idx").on(table.status),
]; });
exports.estimateItems = mysql_core_1.mysqlTable("estimateItems", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    estimateId: mysql_core_1.varchar({ length: 64 }).notNull(),
    itemType: mysql_core_1.mysqlEnum(['product', 'service', 'custom']).notNull(),
    itemId: mysql_core_1.varchar({ length: 64 }),
    description: mysql_core_1.text().notNull(),
    quantity: mysql_core_1.int().notNull(),
    unitPrice: mysql_core_1.int().notNull(),
    taxRate: mysql_core_1.int()["default"](0),
    discountPercent: mysql_core_1.int()["default"](0),
    total: mysql_core_1.int().notNull(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' })
}, function (table) { return [
    mysql_core_1.index("estimate_idx").on(table.estimateId),
]; });
exports.estimates = mysql_core_1.mysqlTable("estimates", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar({ length: 64 }),
    estimateNumber: mysql_core_1.varchar({ length: 100 }).notNull(),
    clientId: mysql_core_1.varchar({ length: 64 }).notNull(),
    title: mysql_core_1.varchar({ length: 255 }),
    status: mysql_core_1.mysqlEnum(['draft', 'sent', 'accepted', 'rejected', 'expired'])["default"]('draft').notNull(),
    issueDate: mysql_core_1.datetime({ mode: 'string' }).notNull(),
    expiryDate: mysql_core_1.datetime({ mode: 'string' }),
    subtotal: mysql_core_1.int().notNull(),
    taxAmount: mysql_core_1.int()["default"](0),
    discountAmount: mysql_core_1.int()["default"](0),
    total: mysql_core_1.int().notNull(),
    notes: mysql_core_1.text(),
    terms: mysql_core_1.text(),
    createdBy: mysql_core_1.varchar({ length: 64 }),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' })
}, function (table) { return [
    mysql_core_1.index("estimate_number_idx").on(table.estimateNumber),
    mysql_core_1.index("client_idx").on(table.clientId),
    mysql_core_1.index("status_idx").on(table.status),
]; });
exports.proposals = mysql_core_1.mysqlTable("proposals", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    proposalNumber: mysql_core_1.varchar({ length: 100 }).notNull(),
    clientId: mysql_core_1.varchar({ length: 64 }).notNull(),
    title: mysql_core_1.varchar({ length: 255 }),
    status: mysql_core_1.mysqlEnum(['draft', 'sent', 'accepted', 'rejected'])["default"]('draft').notNull(),
    issueDate: mysql_core_1.datetime({ mode: 'string' }).notNull(),
    expiryDate: mysql_core_1.datetime({ mode: 'string' }),
    subtotal: mysql_core_1.int().notNull(),
    taxAmount: mysql_core_1.int()["default"](0),
    discountAmount: mysql_core_1.int()["default"](0),
    total: mysql_core_1.int().notNull(),
    notes: mysql_core_1.text(),
    createdBy: mysql_core_1.varchar({ length: 64 }),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' })
}, function (table) { return [
    mysql_core_1.index("proposal_number_idx").on(table.proposalNumber),
    mysql_core_1.index("client_idx").on(table.clientId),
    mysql_core_1.index("status_idx").on(table.status),
]; });
exports.expenses = mysql_core_1.mysqlTable("expenses", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar({ length: 64 }),
    expenseNumber: mysql_core_1.varchar({ length: 100 }),
    category: mysql_core_1.varchar({ length: 100 }).notNull(),
    vendor: mysql_core_1.varchar({ length: 255 }),
    amount: mysql_core_1.int().notNull(),
    expenseDate: mysql_core_1.datetime({ mode: 'string' }).notNull(),
    paymentMethod: mysql_core_1.mysqlEnum(['cash', 'bank_transfer', 'cheque', 'card', 'other']),
    receiptUrl: mysql_core_1.longtext(),
    description: mysql_core_1.text(),
    accountId: mysql_core_1.varchar({ length: 64 }),
    budgetAllocationId: mysql_core_1.varchar({ length: 64 }),
    status: mysql_core_1.mysqlEnum(['pending', 'approved', 'rejected', 'paid'])["default"]('pending').notNull(),
    createdBy: mysql_core_1.varchar({ length: 64 }),
    approvedBy: mysql_core_1.varchar({ length: 64 }),
    approvedAt: mysql_core_1.datetime({ mode: 'string' }),
    chartOfAccountId: mysql_core_1.int(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' })
}, function (table) { return [
    mysql_core_1.index("expense_date_idx").on(table.expenseDate),
    mysql_core_1.index("category_idx").on(table.category),
    mysql_core_1.index("status_idx").on(table.status),
    mysql_core_1.index("chart_of_account_idx").on(table.chartOfAccountId),
]; });
exports.recurringExpenses = mysql_core_1.mysqlTable("recurringExpenses", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar({ length: 64 }),
    category: mysql_core_1.varchar({ length: 100 }).notNull(),
    vendor: mysql_core_1.varchar({ length: 255 }),
    amount: mysql_core_1.int().notNull(),
    description: mysql_core_1.text(),
    paymentMethod: mysql_core_1.mysqlEnum(['cash', 'bank_transfer', 'cheque', 'card', 'other']),
    frequency: mysql_core_1.mysqlEnum(['weekly', 'biweekly', 'monthly', 'quarterly', 'annually']).notNull(),
    startDate: mysql_core_1.datetime({ mode: 'string' }).notNull(),
    endDate: mysql_core_1.datetime({ mode: 'string' }),
    nextDueDate: mysql_core_1.datetime({ mode: 'string' }).notNull(),
    dayOfMonth: mysql_core_1.int()["default"](1),
    reminderDaysBefore: mysql_core_1.int()["default"](3),
    lastGeneratedDate: mysql_core_1.datetime({ mode: 'string' }),
    isActive: mysql_core_1.tinyint()["default"](1).notNull(),
    chartOfAccountId: mysql_core_1.int(),
    createdBy: mysql_core_1.varchar({ length: 64 }),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' })
}, function (table) { return [
    mysql_core_1.index("re_org_idx").on(table.organizationId),
    mysql_core_1.index("re_next_due_idx").on(table.nextDueDate),
    mysql_core_1.index("re_active_idx").on(table.isActive),
]; });
exports.guestClients = mysql_core_1.mysqlTable("guestClients", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    name: mysql_core_1.varchar({ length: 255 }).notNull(),
    email: mysql_core_1.varchar({ length: 320 }),
    phone: mysql_core_1.varchar({ length: 50 }),
    address: mysql_core_1.text(),
    notes: mysql_core_1.text(),
    createdBy: mysql_core_1.varchar({ length: 64 }),
    createdAt: mysql_core_1.timestamp({ mode: 'string' })
});
exports.inventoryTransactions = mysql_core_1.mysqlTable("inventoryTransactions", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    productId: mysql_core_1.varchar({ length: 64 }).notNull(),
    type: mysql_core_1.mysqlEnum(['purchase', 'sale', 'adjustment', 'return', 'transfer']).notNull(),
    quantity: mysql_core_1.int().notNull(),
    unitCost: mysql_core_1.int(),
    referenceType: mysql_core_1.varchar({ length: 50 }),
    referenceId: mysql_core_1.varchar({ length: 64 }),
    notes: mysql_core_1.text(),
    transactionDate: mysql_core_1.datetime({ mode: 'string' }).notNull(),
    createdBy: mysql_core_1.varchar({ length: 64 }),
    createdAt: mysql_core_1.timestamp({ mode: 'string' })
});
exports.invoiceItems = mysql_core_1.mysqlTable("invoiceItems", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    invoiceId: mysql_core_1.varchar({ length: 64 }).notNull(),
    itemType: mysql_core_1.mysqlEnum(['product', 'service', 'custom']).notNull(),
    itemId: mysql_core_1.varchar({ length: 64 }),
    description: mysql_core_1.text().notNull(),
    quantity: mysql_core_1.int().notNull(),
    unitPrice: mysql_core_1.int().notNull(),
    taxRate: mysql_core_1.int()["default"](0),
    discountPercent: mysql_core_1.int()["default"](0),
    total: mysql_core_1.int().notNull(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' })
}, function (table) { return [
    mysql_core_1.index("invoice_idx").on(table.invoiceId),
]; });
exports.invoices = mysql_core_1.mysqlTable("invoices", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar({ length: 64 }),
    invoiceNumber: mysql_core_1.varchar({ length: 100 }).notNull(),
    clientId: mysql_core_1.varchar({ length: 64 }).notNull(),
    estimateId: mysql_core_1.varchar({ length: 64 }),
    title: mysql_core_1.varchar({ length: 255 }),
    status: mysql_core_1.mysqlEnum(['draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled'])["default"]('draft').notNull(),
    issueDate: mysql_core_1.datetime({ mode: 'string' }).notNull(),
    dueDate: mysql_core_1.datetime({ mode: 'string' }).notNull(),
    subtotal: mysql_core_1.int().notNull(),
    taxAmount: mysql_core_1.int()["default"](0),
    discountAmount: mysql_core_1.int()["default"](0),
    total: mysql_core_1.int().notNull(),
    paidAmount: mysql_core_1.int()["default"](0),
    notes: mysql_core_1.text(),
    terms: mysql_core_1.text(),
    createdBy: mysql_core_1.varchar({ length: 64 }),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' }),
    paymentPlanId: mysql_core_1.varchar({ length: 64 }),
    isAutoRecurring: mysql_core_1.tinyint()["default"](0),
    recurringInvoiceId: mysql_core_1.varchar({ length: 64 }),
    clientSubscriptionId: mysql_core_1.varchar({ length: 64 })
}, function (table) { return [
    mysql_core_1.index("invoice_number_idx").on(table.invoiceNumber),
    mysql_core_1.index("client_idx").on(table.clientId),
    mysql_core_1.index("status_idx").on(table.status),
    mysql_core_1.index("due_date_idx").on(table.dueDate),
]; });
exports.recurringInvoices = mysql_core_1.mysqlTable("recurringInvoices", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar({ length: 64 }),
    clientId: mysql_core_1.varchar({ length: 64 }).notNull(),
    templateInvoiceId: mysql_core_1.varchar({ length: 64 }).notNull(),
    clientSubscriptionId: mysql_core_1.varchar({ length: 64 }),
    frequency: mysql_core_1.mysqlEnum(['weekly', 'biweekly', 'monthly', 'quarterly', 'annually']).notNull(),
    startDate: mysql_core_1.datetime({ mode: 'string' }).notNull(),
    endDate: mysql_core_1.datetime({ mode: 'string' }),
    nextDueDate: mysql_core_1.datetime({ mode: 'string' }).notNull(),
    lastGeneratedDate: mysql_core_1.datetime({ mode: 'string' }),
    isActive: mysql_core_1.tinyint()["default"](1).notNull(),
    description: mysql_core_1.text(),
    noteToInvoice: mysql_core_1.text(),
    createdBy: mysql_core_1.varchar({ length: 64 }),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' })
}, function (table) { return [
    mysql_core_1.index("client_idx").on(table.clientId),
    mysql_core_1.index("is_active_idx").on(table.isActive),
    mysql_core_1.index("next_due_date_idx").on(table.nextDueDate),
]; });
exports.journalEntries = mysql_core_1.mysqlTable("journalEntries", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    entryNumber: mysql_core_1.varchar({ length: 100 }).notNull(),
    entryDate: mysql_core_1.datetime({ mode: 'string' }).notNull(),
    description: mysql_core_1.text(),
    referenceType: mysql_core_1.varchar({ length: 50 }),
    referenceId: mysql_core_1.varchar({ length: 64 }),
    createdBy: mysql_core_1.varchar({ length: 64 }),
    createdAt: mysql_core_1.timestamp({ mode: 'string' })
}, function (table) { return [
    mysql_core_1.index("entry_date_idx").on(table.entryDate),
    mysql_core_1.index("entry_number_idx").on(table.entryNumber),
]; });
exports.journalEntryLines = mysql_core_1.mysqlTable("journalEntryLines", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    journalEntryId: mysql_core_1.varchar({ length: 64 }).notNull(),
    accountId: mysql_core_1.varchar({ length: 64 }).notNull(),
    debit: mysql_core_1.int()["default"](0),
    credit: mysql_core_1.int()["default"](0),
    description: mysql_core_1.text(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' })
}, function (table) { return [
    mysql_core_1.index("journal_entry_idx").on(table.journalEntryId),
    mysql_core_1.index("account_idx").on(table.accountId),
]; });
exports.leaveRequests = mysql_core_1.mysqlTable("leaveRequests", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar({ length: 64 }),
    employeeId: mysql_core_1.varchar({ length: 64 }).notNull(),
    leaveType: mysql_core_1.mysqlEnum(['annual', 'sick', 'maternity', 'paternity', 'unpaid', 'other']).notNull(),
    startDate: mysql_core_1.datetime({ mode: 'string' }).notNull(),
    endDate: mysql_core_1.datetime({ mode: 'string' }).notNull(),
    days: mysql_core_1.int().notNull(),
    reason: mysql_core_1.text(),
    status: mysql_core_1.mysqlEnum(['pending', 'approved', 'rejected', 'cancelled'])["default"]('pending').notNull(),
    approvedBy: mysql_core_1.varchar({ length: 64 }),
    approvalDate: mysql_core_1.datetime({ mode: 'string' }),
    notes: mysql_core_1.text(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' })
}, function (table) { return [
    mysql_core_1.index("employee_idx").on(table.employeeId),
    mysql_core_1.index("status_idx").on(table.status),
    mysql_core_1.index("start_date_idx").on(table.startDate),
]; });
exports.opportunities = mysql_core_1.mysqlTable("opportunities", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar({ length: 64 }),
    clientId: mysql_core_1.varchar({ length: 64 }).notNull(),
    title: mysql_core_1.varchar({ length: 255 }).notNull(),
    description: mysql_core_1.text(),
    value: mysql_core_1.int().notNull(),
    stage: mysql_core_1.mysqlEnum(['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'])["default"]('lead').notNull(),
    probability: mysql_core_1.int()["default"](0),
    expectedCloseDate: mysql_core_1.datetime({ mode: 'string' }),
    actualCloseDate: mysql_core_1.datetime({ mode: 'string' }),
    assignedTo: mysql_core_1.varchar({ length: 64 }),
    source: mysql_core_1.varchar({ length: 100 }),
    winReason: mysql_core_1.text(),
    lossReason: mysql_core_1.text(),
    notes: mysql_core_1.text(),
    stageMovedAt: mysql_core_1.datetime({ mode: 'string' }),
    createdBy: mysql_core_1.varchar({ length: 64 }),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' })
}, function (table) { return [
    mysql_core_1.index("client_idx").on(table.clientId),
    mysql_core_1.index("stage_idx").on(table.stage),
    mysql_core_1.index("assigned_to_idx").on(table.assignedTo),
]; });
// Payments table moved to billing section below for SaaS model
// Original accounting payments preserved as paymentRecords for internal use
exports.paymentPlans = mysql_core_1.mysqlTable("paymentPlans", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    invoiceId: mysql_core_1.varchar({ length: 64 }).notNull(),
    clientId: mysql_core_1.varchar({ length: 64 }).notNull(),
    numInstallments: mysql_core_1.int().notNull(),
    installmentAmount: mysql_core_1.int().notNull(),
    frequencyDays: mysql_core_1.int().notNull(),
    startDate: mysql_core_1.datetime({ mode: 'string' }).notNull(),
    nextInstallmentDue: mysql_core_1.datetime({ mode: 'string' }).notNull(),
    lastInstallmentDate: mysql_core_1.datetime({ mode: 'string' }),
    completedInstallments: mysql_core_1.int()["default"](0).notNull(),
    totalPaid: mysql_core_1.int()["default"](0).notNull(),
    status: mysql_core_1.mysqlEnum(['active', 'paused', 'completed', 'cancelled'])["default"]('active').notNull(),
    notes: mysql_core_1.text(),
    createdBy: mysql_core_1.varchar({ length: 64 }),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' })
}, function (table) { return [
    mysql_core_1.index("invoice_idx").on(table.invoiceId),
    mysql_core_1.index("client_idx").on(table.clientId),
    mysql_core_1.index("status_idx").on(table.status),
    mysql_core_1.index("next_installment_idx").on(table.nextInstallmentDue),
]; });
exports.paymentPlanInstallments = mysql_core_1.mysqlTable("paymentPlanInstallments", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    paymentPlanId: mysql_core_1.varchar({ length: 64 }).notNull(),
    installmentNumber: mysql_core_1.int().notNull(),
    dueDate: mysql_core_1.datetime({ mode: 'string' }).notNull(),
    amount: mysql_core_1.int().notNull(),
    status: mysql_core_1.mysqlEnum(['pending', 'paid', 'overdue', 'skipped'])["default"]('pending').notNull(),
    paidDate: mysql_core_1.datetime({ mode: 'string' }),
    paidAmount: mysql_core_1.int(),
    paymentId: mysql_core_1.varchar({ length: 64 }),
    notes: mysql_core_1.text(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' })
}, function (table) { return [
    mysql_core_1.index("payment_plan_idx").on(table.paymentPlanId),
    mysql_core_1.index("due_date_idx").on(table.dueDate),
    mysql_core_1.index("status_idx").on(table.status),
]; });
exports.payroll = mysql_core_1.mysqlTable("payroll", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    employeeId: mysql_core_1.varchar({ length: 64 }).notNull(),
    payPeriodStart: mysql_core_1.datetime({ mode: 'string' }).notNull(),
    payPeriodEnd: mysql_core_1.datetime({ mode: 'string' }).notNull(),
    basicSalary: mysql_core_1.int().notNull(),
    allowances: mysql_core_1.int()["default"](0),
    deductions: mysql_core_1.int()["default"](0),
    tax: mysql_core_1.int()["default"](0),
    netSalary: mysql_core_1.int().notNull(),
    status: mysql_core_1.mysqlEnum(['draft', 'processed', 'paid'])["default"]('draft').notNull(),
    paymentDate: mysql_core_1.datetime({ mode: 'string' }),
    paymentMethod: mysql_core_1.varchar({ length: 50 }),
    notes: mysql_core_1.text(),
    createdBy: mysql_core_1.varchar({ length: 64 }),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' })
}, function (table) { return [
    mysql_core_1.index("employee_idx").on(table.employeeId),
    mysql_core_1.index("pay_period_idx").on(table.payPeriodStart, table.payPeriodEnd),
    mysql_core_1.index("status_idx").on(table.status),
]; });
exports.products = mysql_core_1.mysqlTable("products", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar({ length: 64 }),
    name: mysql_core_1.varchar({ length: 255 }).notNull(),
    description: mysql_core_1.text(),
    sku: mysql_core_1.varchar({ length: 100 }),
    category: mysql_core_1.varchar({ length: 100 }),
    unitPrice: mysql_core_1.int().notNull(),
    costPrice: mysql_core_1.int(),
    stockQuantity: mysql_core_1.int()["default"](0),
    minStockLevel: mysql_core_1.int()["default"](0),
    unit: mysql_core_1.varchar({ length: 50 })["default"]('pcs'),
    taxRate: mysql_core_1.int()["default"](0),
    isActive: mysql_core_1.tinyint()["default"](1).notNull(),
    imageUrl: mysql_core_1.varchar({ length: 500 }),
    createdBy: mysql_core_1.varchar({ length: 64 }),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' }),
    supplier: mysql_core_1.varchar({ length: 255 }),
    reorderLevel: mysql_core_1.int(),
    reorderQuantity: mysql_core_1.int(),
    lastRestockDate: mysql_core_1.timestamp({ mode: 'string' }),
    maxStockLevel: mysql_core_1.int(),
    location: mysql_core_1.varchar({ length: 255 })
}, function (table) { return [
    mysql_core_1.index("sku_idx").on(table.sku),
    mysql_core_1.index("category_idx").on(table.category),
]; });
exports.projectTasks = mysql_core_1.mysqlTable("projectTasks", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    projectId: mysql_core_1.varchar({ length: 64 }),
    clientId: mysql_core_1.varchar({ length: 64 }),
    title: mysql_core_1.varchar({ length: 255 }).notNull(),
    description: mysql_core_1.text(),
    status: mysql_core_1.mysqlEnum(['todo', 'in_progress', 'review', 'completed', 'blocked'])["default"]('todo').notNull(),
    priority: mysql_core_1.mysqlEnum(['low', 'medium', 'high', 'urgent'])["default"]('medium').notNull(),
    assignedTo: mysql_core_1.varchar({ length: 64 }),
    dueDate: mysql_core_1.datetime({ mode: 'string' }),
    completedDate: mysql_core_1.datetime({ mode: 'string' }),
    estimatedHours: mysql_core_1.int(),
    actualHours: mysql_core_1.int(),
    approvalStatus: mysql_core_1.mysqlEnum(['pending', 'approved', 'rejected', 'revision_requested'])["default"]('pending').notNull(),
    adminRemarks: mysql_core_1.longtext(),
    approvedBy: mysql_core_1.varchar({ length: 64 }),
    approvedAt: mysql_core_1.timestamp({ mode: 'string' }),
    rejectionReason: mysql_core_1.longtext(),
    parentTaskId: mysql_core_1.varchar({ length: 64 }),
    order: mysql_core_1.int()["default"](0),
    tags: mysql_core_1.text(),
    targetDate: mysql_core_1.datetime({ mode: 'string' }),
    billable: mysql_core_1.tinyint()["default"](1),
    visibleToClient: mysql_core_1.tinyint()["default"](1),
    createdBy: mysql_core_1.varchar({ length: 64 }),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' })
}, function (table) { return [
    mysql_core_1.index("project_idx").on(table.projectId),
    mysql_core_1.index("status_idx").on(table.status),
    mysql_core_1.index("assigned_to_idx").on(table.assignedTo),
    mysql_core_1.index("approval_status_idx").on(table.approvalStatus),
    mysql_core_1.index("approved_by_idx").on(table.approvedBy),
]; });
exports.projects = mysql_core_1.mysqlTable("projects", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar({ length: 64 }),
    projectNumber: mysql_core_1.varchar({ length: 100 }).notNull(),
    name: mysql_core_1.varchar({ length: 255 }).notNull(),
    description: mysql_core_1.text(),
    clientId: mysql_core_1.varchar({ length: 64 }).notNull(),
    status: mysql_core_1.mysqlEnum(['planning', 'active', 'on_hold', 'completed', 'cancelled'])["default"]('planning').notNull(),
    priority: mysql_core_1.mysqlEnum(['low', 'medium', 'high', 'urgent'])["default"]('medium').notNull(),
    startDate: mysql_core_1.datetime({ mode: 'string' }),
    endDate: mysql_core_1.datetime({ mode: 'string' }),
    actualStartDate: mysql_core_1.datetime({ mode: 'string' }),
    actualEndDate: mysql_core_1.datetime({ mode: 'string' }),
    budget: mysql_core_1.int(),
    actualCost: mysql_core_1.int()["default"](0),
    progress: mysql_core_1.int()["default"](0),
    assignedTo: mysql_core_1.varchar({ length: 64 }),
    projectManager: mysql_core_1.varchar({ length: 64 }),
    tags: mysql_core_1.text(),
    notes: mysql_core_1.text(),
    createdBy: mysql_core_1.varchar({ length: 64 }),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' })
}, function (table) { return [
    mysql_core_1.index("project_number_idx").on(table.projectNumber),
    mysql_core_1.index("client_idx").on(table.clientId),
    mysql_core_1.index("status_idx").on(table.status),
    mysql_core_1.index("assigned_to_idx").on(table.assignedTo),
]; });
exports.projectMilestones = mysql_core_1.mysqlTable("projectMilestones", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    projectId: mysql_core_1.varchar({ length: 64 }).notNull(),
    phaseName: mysql_core_1.varchar({ length: 255 }).notNull(),
    description: mysql_core_1.text(),
    deliverables: mysql_core_1.text(),
    status: mysql_core_1.mysqlEnum(['planning', 'in_progress', 'on_hold', 'completed', 'cancelled'])["default"]('planning').notNull(),
    startDate: mysql_core_1.datetime({ mode: 'string' }),
    dueDate: mysql_core_1.datetime({ mode: 'string' }).notNull(),
    completionDate: mysql_core_1.datetime({ mode: 'string' }),
    completionPercentage: mysql_core_1.int()["default"](0).notNull(),
    assignedTo: mysql_core_1.varchar({ length: 64 }),
    budget: mysql_core_1.int(),
    actualCost: mysql_core_1.int()["default"](0),
    notes: mysql_core_1.text(),
    createdBy: mysql_core_1.varchar({ length: 64 }),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' })
}, function (table) { return [
    mysql_core_1.index("project_idx").on(table.projectId),
    mysql_core_1.index("due_date_idx").on(table.dueDate),
    mysql_core_1.index("status_idx").on(table.status),
]; });
exports.timeEntries = mysql_core_1.mysqlTable("timeEntries", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    projectId: mysql_core_1.varchar({ length: 64 }).notNull(),
    projectTaskId: mysql_core_1.varchar({ length: 64 }),
    userId: mysql_core_1.varchar({ length: 64 }).notNull(),
    entryDate: mysql_core_1.datetime({ mode: 'string' }).notNull(),
    durationMinutes: mysql_core_1.int().notNull(),
    description: mysql_core_1.varchar({ length: 500 }).notNull(),
    billable: mysql_core_1.tinyint()["default"](1).notNull(),
    hourlyRate: mysql_core_1.int(),
    amount: mysql_core_1.int()["default"](0),
    status: mysql_core_1.mysqlEnum(['draft', 'submitted', 'approved', 'invoiced', 'rejected'])["default"]('draft').notNull(),
    approvedBy: mysql_core_1.varchar({ length: 64 }),
    approvedAt: mysql_core_1.datetime({ mode: 'string' }),
    invoiceId: mysql_core_1.varchar({ length: 64 }),
    notes: mysql_core_1.text(),
    createdBy: mysql_core_1.varchar({ length: 64 }),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' })
}, function (table) { return [
    mysql_core_1.index("project_idx").on(table.projectId),
    mysql_core_1.index("task_idx").on(table.projectTaskId),
    mysql_core_1.index("user_idx").on(table.userId),
    mysql_core_1.index("entry_date_idx").on(table.entryDate),
    mysql_core_1.index("status_idx").on(table.status),
    mysql_core_1.index("billable_idx").on(table.billable),
]; });
exports.reminders = mysql_core_1.mysqlTable("reminders", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    name: mysql_core_1.varchar({ length: 255 }).notNull(),
    type: mysql_core_1.mysqlEnum(['invoice_due', 'estimate_expiry', 'project_milestone', 'payment_overdue', 'custom']).notNull(),
    frequency: mysql_core_1.mysqlEnum(['once', 'daily', 'weekly', 'monthly', 'custom']).notNull(),
    customDays: mysql_core_1.int(),
    timing: mysql_core_1.mysqlEnum(['before', 'on', 'after']).notNull(),
    isActive: mysql_core_1.tinyint()["default"](1).notNull(),
    emailEnabled: mysql_core_1.tinyint()["default"](1).notNull(),
    smsEnabled: mysql_core_1.tinyint()["default"](0).notNull(),
    emailTemplate: mysql_core_1.text(),
    smsTemplate: mysql_core_1.text(),
    createdBy: mysql_core_1.varchar({ length: 64 }),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' })
});
exports.scheduledReminders = mysql_core_1.mysqlTable("scheduledReminders", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    reminderId: mysql_core_1.varchar({ length: 64 }).notNull(),
    referenceType: mysql_core_1.varchar({ length: 50 }).notNull(),
    referenceId: mysql_core_1.varchar({ length: 64 }).notNull(),
    recipientId: mysql_core_1.varchar({ length: 64 }).notNull(),
    recipientType: mysql_core_1.mysqlEnum(['user', 'client']).notNull(),
    scheduledFor: mysql_core_1.datetime({ mode: 'string' }).notNull(),
    status: mysql_core_1.mysqlEnum(['pending', 'sent', 'failed', 'cancelled'])["default"]('pending').notNull(),
    sentAt: mysql_core_1.datetime({ mode: 'string' }),
    error: mysql_core_1.text(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' })
});
exports.services = mysql_core_1.mysqlTable("services", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar({ length: 64 }),
    name: mysql_core_1.varchar({ length: 255 }).notNull(),
    description: mysql_core_1.text(),
    category: mysql_core_1.varchar({ length: 100 }),
    hourlyRate: mysql_core_1.int(),
    fixedPrice: mysql_core_1.int(),
    unit: mysql_core_1.varchar({ length: 50 })["default"]('hour'),
    taxRate: mysql_core_1.int()["default"](0),
    deliverables: mysql_core_1.text(),
    isActive: mysql_core_1.tinyint()["default"](1).notNull(),
    createdBy: mysql_core_1.varchar({ length: 64 }),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' })
});
exports.settings = mysql_core_1.mysqlTable("settings", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    key: mysql_core_1.varchar({ length: 100 }).notNull(),
    // previously we accidentally named this column "longtext" by passing
    // a string argument to `text()`; the first parameter is treated as the
    // column name.  Use the dedicated `longtext()` helper so the column
    // remains "value" while still having the desired MySQL type.
    value: mysql_core_1.longtext(),
    category: mysql_core_1.varchar({ length: 100 }),
    description: mysql_core_1.text(),
    updatedBy: mysql_core_1.varchar({ length: 64 }),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' })
}, function (table) { return [
    mysql_core_1.index("key_idx").on(table.key),
    mysql_core_1.index("category_idx").on(table.category),
]; });
exports.stockAlerts = mysql_core_1.mysqlTable("stockAlerts", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    productId: mysql_core_1.varchar({ length: 64 }).notNull(),
    alertType: mysql_core_1.mysqlEnum(['low_stock', 'out_of_stock', 'overstock', 'reorder']).notNull(),
    currentQuantity: mysql_core_1.int().notNull(),
    threshold: mysql_core_1.int().notNull(),
    status: mysql_core_1.mysqlEnum(['active', 'resolved', 'ignored'])["default"]('active').notNull(),
    notifiedAt: mysql_core_1.datetime({ mode: 'string' }),
    resolvedAt: mysql_core_1.datetime({ mode: 'string' }),
    createdAt: mysql_core_1.timestamp({ mode: 'string' })
});
exports.systemSettings = mysql_core_1.mysqlTable("systemSettings", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    category: mysql_core_1.varchar({ length: 100 }).notNull(),
    key: mysql_core_1.varchar({ length: 100 }).notNull(),
    value: mysql_core_1.text(),
    dataType: mysql_core_1.mysqlEnum(['string', 'number', 'boolean', 'json']).notNull(),
    description: mysql_core_1.text(),
    isPublic: mysql_core_1.tinyint()["default"](0).notNull(),
    updatedBy: mysql_core_1.varchar({ length: 64 }),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' })
});
exports.templates = mysql_core_1.mysqlTable("templates", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    name: mysql_core_1.varchar({ length: 255 }).notNull(),
    type: mysql_core_1.mysqlEnum(['invoice', 'estimate', 'receipt', 'proposal', 'report']).notNull(),
    content: mysql_core_1.text().notNull(),
    isDefault: mysql_core_1.tinyint()["default"](0).notNull(),
    isActive: mysql_core_1.tinyint()["default"](1).notNull(),
    createdBy: mysql_core_1.varchar({ length: 64 }),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' })
}, function (table) { return [
    mysql_core_1.index("type_idx").on(table.type),
]; });
exports.documentNumberFormats = mysql_core_1.mysqlTable("documentNumberFormats", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    documentType: mysql_core_1.mysqlEnum(['invoice', 'estimate', 'receipt', 'proposal', 'expense', 'payment', 'contract', 'quotation', 'purchase_order', 'project', 'credit_note', 'debit_note']).notNull(),
    prefix: mysql_core_1.varchar({ length: 50 })["default"]('').notNull(),
    padding: mysql_core_1.int()["default"](6).notNull(),
    separator: mysql_core_1.varchar({ length: 5 })["default"]('-').notNull(),
    currentNumber: mysql_core_1.int()["default"](0).notNull(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' })
});
exports.defaultSettings = mysql_core_1.mysqlTable("defaultSettings", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    category: mysql_core_1.varchar({ length: 100 }).notNull(),
    key: mysql_core_1.varchar({ length: 100 }).notNull(),
    value: mysql_core_1.text().notNull(),
    description: mysql_core_1.text(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' })
});
// Permissions table for granular permission management
exports.permissions = mysql_core_1.mysqlTable("permissions", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    name: mysql_core_1.varchar({ length: 100 }),
    permissionName: mysql_core_1.varchar({ length: 100 }),
    description: mysql_core_1.text(),
    category: mysql_core_1.varchar({ length: 100 }),
    resource: mysql_core_1.varchar({ length: 100 }),
    action: mysql_core_1.varchar({ length: 50 }),
    isAdvanced: mysql_core_1.tinyint()["default"](0).notNull(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' })
}, function (table) { return [
    mysql_core_1.index("idx_permissions_category").on(table.category),
    mysql_core_1.index("idx_permissions_resource").on(table.resource),
]; });
// Custom roles for org-specific roles with granular permissions
exports.customRoles = mysql_core_1.mysqlTable("customRoles", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar({ length: 64 }),
    name: mysql_core_1.varchar({ length: 100 }).notNull(),
    displayName: mysql_core_1.varchar({ length: 255 }).notNull(),
    description: mysql_core_1.text(),
    permissions: mysql_core_1.text(),
    baseRole: mysql_core_1.mysqlEnum(['user', 'admin', 'staff', 'accountant', 'client', 'super_admin', 'project_manager', 'hr', 'ict_manager', 'procurement_manager', 'sales_manager'])["default"]('staff'),
    isAdvanced: mysql_core_1.tinyint()["default"](0).notNull(),
    isSystem: mysql_core_1.tinyint()["default"](0).notNull(),
    isActive: mysql_core_1.tinyint()["default"](1).notNull(),
    createdBy: mysql_core_1.varchar({ length: 64 }),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' })
}, function (table) { return [
    mysql_core_1.index("idx_customRoles_orgId").on(table.organizationId),
    mysql_core_1.index("idx_customRoles_name").on(table.name),
    mysql_core_1.index("idx_customRoles_active").on(table.isActive),
]; });
exports.userRoles = mysql_core_1.mysqlTable("userRoles", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    userId: mysql_core_1.varchar({ length: 64 }),
    role: mysql_core_1.varchar({ length: 50 }),
    roleName: mysql_core_1.varchar({ length: 100 }),
    description: mysql_core_1.text(),
    isActive: mysql_core_1.tinyint()["default"](1),
    assignedBy: mysql_core_1.varchar({ length: 64 }),
    createdAt: mysql_core_1.timestamp({ mode: 'string' })
});
exports.rolePermissions = mysql_core_1.mysqlTable("rolePermissions", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    roleId: mysql_core_1.varchar({ length: 64 }).notNull(),
    permissionId: mysql_core_1.varchar({ length: 64 }).notNull(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' })
});
exports.receipts = mysql_core_1.mysqlTable("receipts", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar({ length: 64 }),
    receiptNumber: mysql_core_1.varchar({ length: 100 }).notNull(),
    clientId: mysql_core_1.varchar({ length: 64 }).notNull(),
    paymentId: mysql_core_1.varchar({ length: 64 }),
    amount: mysql_core_1.int().notNull(),
    subtotal: mysql_core_1.int().notNull()["default"](0),
    taxAmount: mysql_core_1.int().notNull()["default"](0),
    discountAmount: mysql_core_1.int().notNull()["default"](0),
    paymentMethod: mysql_core_1.mysqlEnum(['cash', 'bank_transfer', 'cheque', 'mpesa', 'card', 'other']).notNull(),
    receiptDate: mysql_core_1.datetime().notNull(),
    status: mysql_core_1.mysqlEnum(['draft', 'issued', 'void']).notNull()["default"]('issued'),
    notes: mysql_core_1.text(),
    createdBy: mysql_core_1.varchar({ length: 64 }),
    approvedBy: mysql_core_1.varchar({ length: 64 }),
    approvedAt: mysql_core_1.datetime(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' })
});
exports.creditNotes = mysql_core_1.mysqlTable("creditNotes", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar({ length: 64 }),
    creditNoteNumber: mysql_core_1.varchar({ length: 100 }).notNull(),
    clientId: mysql_core_1.varchar({ length: 64 }).notNull(),
    clientName: mysql_core_1.varchar({ length: 255 }),
    invoiceId: mysql_core_1.varchar({ length: 64 }),
    issueDate: mysql_core_1.datetime({ mode: 'string' }).notNull(),
    reason: mysql_core_1.mysqlEnum(['goods-returned', 'service-cancelled', 'discount', 'quality-issue', 'error', 'other']).notNull()["default"]('other'),
    subtotal: mysql_core_1.int().notNull()["default"](0),
    taxAmount: mysql_core_1.int().notNull()["default"](0),
    total: mysql_core_1.int().notNull()["default"](0),
    status: mysql_core_1.mysqlEnum(['draft', 'approved', 'applied', 'void'])["default"]('draft').notNull(),
    notes: mysql_core_1.text(),
    createdBy: mysql_core_1.varchar({ length: 64 }),
    approvedBy: mysql_core_1.varchar({ length: 64 }),
    approvedAt: mysql_core_1.datetime({ mode: 'string' }),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' })
}, function (table) { return [
    mysql_core_1.index("credit_note_number_idx").on(table.creditNoteNumber),
    mysql_core_1.index("client_idx").on(table.clientId),
    mysql_core_1.index("status_idx").on(table.status),
    mysql_core_1.index("invoice_idx").on(table.invoiceId),
]; });
exports.debitNotes = mysql_core_1.mysqlTable("debitNotes", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar({ length: 64 }),
    debitNoteNumber: mysql_core_1.varchar({ length: 100 }).notNull(),
    supplierId: mysql_core_1.varchar({ length: 64 }).notNull(),
    supplierName: mysql_core_1.varchar({ length: 255 }),
    purchaseOrderId: mysql_core_1.varchar({ length: 64 }),
    issueDate: mysql_core_1.datetime({ mode: 'string' }).notNull(),
    reason: mysql_core_1.mysqlEnum(['quality-shortage', 'price-adjustment', 'damaged', 'underdelivery', 'penalty']).notNull()["default"]('quality-shortage'),
    subtotal: mysql_core_1.int().notNull()["default"](0),
    taxAmount: mysql_core_1.int().notNull()["default"](0),
    total: mysql_core_1.int().notNull()["default"](0),
    status: mysql_core_1.mysqlEnum(['draft', 'approved', 'settled', 'void'])["default"]('draft').notNull(),
    notes: mysql_core_1.text(),
    createdBy: mysql_core_1.varchar({ length: 64 }),
    approvedBy: mysql_core_1.varchar({ length: 64 }),
    approvedAt: mysql_core_1.datetime({ mode: 'string' }),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' })
}, function (table) { return [
    mysql_core_1.index("debit_note_number_idx").on(table.debitNoteNumber),
    mysql_core_1.index("supplier_idx").on(table.supplierId),
    mysql_core_1.index("debit_status_idx").on(table.status),
]; });
exports.departments = mysql_core_1.mysqlTable("departments", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar({ length: 64 }),
    name: mysql_core_1.varchar({ length: 255 }).notNull(),
    description: mysql_core_1.text(),
    headId: mysql_core_1.varchar({ length: 64 }),
    budget: mysql_core_1.int(),
    status: mysql_core_1.mysqlEnum(['active', 'inactive'])["default"]('active'),
    defaultRole: mysql_core_1.varchar({ length: 100 }),
    createdBy: mysql_core_1.varchar({ length: 64 }),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' })
});
exports.budgets = mysql_core_1.mysqlTable("budgets", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar({ length: 64 }),
    departmentId: mysql_core_1.varchar({ length: 64 }).notNull(),
    amount: mysql_core_1.int().notNull(),
    remaining: mysql_core_1.int().notNull(),
    fiscalYear: mysql_core_1.int().notNull(),
    budgetName: mysql_core_1.varchar({ length: 255 }),
    budgetDescription: mysql_core_1.text(),
    budgetStatus: mysql_core_1.mysqlEnum(['draft', 'active', 'inactive', 'closed'])["default"]('draft'),
    startDate: mysql_core_1.datetime({ mode: 'string' }),
    endDate: mysql_core_1.datetime({ mode: 'string' }),
    approvedBy: mysql_core_1.varchar({ length: 64 }),
    approvedAt: mysql_core_1.datetime({ mode: 'string' }),
    createdBy: mysql_core_1.varchar({ length: 64 }),
    totalBudgeted: mysql_core_1.int()["default"](0),
    totalActual: mysql_core_1.int()["default"](0),
    variance: mysql_core_1.int()["default"](0),
    variancePercent: mysql_core_1.int()["default"](0),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' })
});
exports.attendance = mysql_core_1.mysqlTable("attendance", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar({ length: 64 }),
    employeeId: mysql_core_1.varchar({ length: 64 }).notNull(),
    date: mysql_core_1.datetime().notNull(),
    status: mysql_core_1.mysqlEnum(['present', 'absent', 'late', 'leave'])["default"]('present'),
    checkInTime: mysql_core_1.datetime(),
    checkOutTime: mysql_core_1.datetime(),
    notes: mysql_core_1.text(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' })
});
exports.userProjectAssignments = mysql_core_1.mysqlTable("userProjectAssignments", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    userId: mysql_core_1.varchar({ length: 64 }).notNull(),
    projectId: mysql_core_1.varchar({ length: 64 }).notNull(),
    role: mysql_core_1.varchar({ length: 50 }),
    assignedDate: mysql_core_1.datetime().notNull(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' })
});
exports.projectComments = mysql_core_1.mysqlTable("projectComments", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    projectId: mysql_core_1.varchar({ length: 64 }).notNull(),
    userId: mysql_core_1.varchar({ length: 64 }).notNull(),
    comment: mysql_core_1.text().notNull(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' })
});
exports.staffTasks = mysql_core_1.mysqlTable("staffTasks", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    departmentId: mysql_core_1.varchar({ length: 64 }).notNull(),
    title: mysql_core_1.varchar({ length: 255 }).notNull(),
    description: mysql_core_1.text(),
    assignedTo: mysql_core_1.varchar({ length: 64 }),
    dueDate: mysql_core_1.datetime(),
    status: mysql_core_1.mysqlEnum(['pending', 'in_progress', 'completed'])["default"]('pending'),
    createdAt: mysql_core_1.timestamp({ mode: 'string' })
});
exports.userPermissions = mysql_core_1.mysqlTable("userPermissions", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    userId: mysql_core_1.varchar({ length: 64 }).notNull(),
    resource: mysql_core_1.varchar({ length: 100 }).notNull(),
    action: mysql_core_1.varchar({ length: 50 }).notNull(),
    granted: mysql_core_1.tinyint()["default"](1).notNull(),
    grantedBy: mysql_core_1.varchar({ length: 64 }),
    createdAt: mysql_core_1.timestamp({ mode: 'string' })
});
exports.users = mysql_core_1.mysqlTable("users", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    name: mysql_core_1.varchar({ length: 255 }).notNull(),
    email: mysql_core_1.varchar({ length: 320 }).notNull(),
    emailVerified: mysql_core_1.timestamp({ mode: 'string' }),
    loginMethod: mysql_core_1.varchar({ length: 50 })["default"]('local').notNull(),
    passwordHash: mysql_core_1.varchar({ length: 255 }),
    role: mysql_core_1.mysqlEnum(['user', 'admin', 'staff', 'accountant', 'client', 'super_admin', 'project_manager', 'hr', 'ict_manager', 'procurement_manager', 'sales_manager'])["default"]('user').notNull(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow(),
    lastSignedIn: mysql_core_1.timestamp({ mode: 'string' }),
    department: mysql_core_1.varchar({ length: 100 }),
    isActive: mysql_core_1.tinyint()["default"](1).notNull(),
    clientId: mysql_core_1.varchar({ length: 64 }),
    permissions: mysql_core_1.text(),
    passwordResetToken: mysql_core_1.varchar({ length: 255 }),
    passwordResetExpiresAt: mysql_core_1.timestamp({ mode: 'string' }),
    phone: mysql_core_1.varchar({ length: 20 }),
    company: mysql_core_1.varchar({ length: 255 }),
    position: mysql_core_1.varchar({ length: 100 }),
    address: mysql_core_1.text(),
    city: mysql_core_1.varchar({ length: 100 }),
    country: mysql_core_1.varchar({ length: 100 }),
    photoUrl: mysql_core_1.longtext(),
    organizationId: mysql_core_1.varchar({ length: 64 }),
    customRoleId: mysql_core_1.varchar({ length: 64 })
});
exports.savedFilters = mysql_core_1.mysqlTable("savedFilters", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    userId: mysql_core_1.varchar({ length: 64 }).notNull(),
    moduleName: mysql_core_1.varchar({ length: 100 }).notNull(),
    filterName: mysql_core_1.varchar({ length: 255 }).notNull(),
    description: mysql_core_1.text(),
    filterConfig: mysql_core_1.text().notNull(),
    isDefault: mysql_core_1.tinyint()["default"](0).notNull(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' })
}, function (table) { return [
    mysql_core_1.index("user_module_idx").on(table.userId, table.moduleName),
    mysql_core_1.index("module_idx").on(table.moduleName),
]; });
// ============================================
// AI & NOTIFICATIONS (Phase 1)
// ============================================
exports.notifications = mysql_core_1.mysqlTable("notifications", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    userId: mysql_core_1.varchar({ length: 64 }).notNull(),
    type: mysql_core_1.mysqlEnum(['info', 'success', 'warning', 'error', 'reminder', 'payment', 'project', 'client', 'financial', 'system']).notNull(),
    title: mysql_core_1.varchar({ length: 255 }).notNull(),
    message: mysql_core_1.text().notNull(),
    category: mysql_core_1.varchar({ length: 50 }),
    entityType: mysql_core_1.varchar({ length: 50 }),
    entityId: mysql_core_1.varchar({ length: 64 }),
    priority: mysql_core_1.mysqlEnum(['low', 'normal', 'medium', 'high', 'critical'])["default"]('normal').notNull(),
    actionUrl: mysql_core_1.varchar({ length: 500 }),
    isRead: mysql_core_1.tinyint()["default"](0).notNull(),
    readAt: mysql_core_1.timestamp({ mode: 'string' }),
    deliveryStatus: mysql_core_1.mysqlEnum(['pending', 'sent', 'failed'])["default"]('pending').notNull(),
    deliveryDate: mysql_core_1.timestamp({ mode: 'string' }),
    status: mysql_core_1.mysqlEnum(['active', 'archived'])["default"]('active').notNull(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow()
}, function (table) { return [
    mysql_core_1.index("user_id_idx").on(table.userId),
    mysql_core_1.index("type_idx").on(table.type),
    mysql_core_1.index("is_read_idx").on(table.isRead),
    mysql_core_1.index("created_at_idx").on(table.createdAt),
]; });
exports.notificationSettings = mysql_core_1.mysqlTable("notificationSettings", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    userId: mysql_core_1.varchar({ length: 64 }).notNull(),
    channelType: mysql_core_1.mysqlEnum(['in_app', 'email', 'sms', 'slack']).notNull(),
    isEnabled: mysql_core_1.tinyint()["default"](1).notNull(),
    notificationType: mysql_core_1.mysqlEnum(['payment', 'project', 'client', 'financial', 'system']).notNull(),
    frequency: mysql_core_1.mysqlEnum(['immediate', 'daily_digest', 'weekly_digest', 'never'])["default"]('immediate').notNull(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow(),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow()
}, function (table) { return [
    mysql_core_1.index("user_channel_idx").on(table.userId, table.channelType),
]; });
exports.notificationPreferences = mysql_core_1.mysqlTable("notificationPreferences", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    userId: mysql_core_1.varchar({ length: 64 }).notNull(),
    slackWebhookUrl: mysql_core_1.varchar({ length: 500 }),
    phoneNumber: mysql_core_1.varchar({ length: 20 }),
    quietHoursStart: mysql_core_1.varchar({ length: 5 }),
    quietHoursEnd: mysql_core_1.varchar({ length: 5 }),
    timeZone: mysql_core_1.varchar({ length: 50 })["default"]('UTC'),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' })
});
exports.smsQueue = mysql_core_1.mysqlTable("smsQueue", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    phoneNumber: mysql_core_1.varchar({ length: 20 }).notNull(),
    message: mysql_core_1.text().notNull(),
    status: mysql_core_1.mysqlEnum(['pending', 'queued', 'sending', 'delivered', 'failed'])["default"]('pending').notNull(),
    retryCount: mysql_core_1.int()["default"](0),
    attemptCount: mysql_core_1.int()["default"](0).notNull(),
    maxAttempts: mysql_core_1.int()["default"](3).notNull(),
    provider: mysql_core_1.varchar({ length: 50 }),
    externalId: mysql_core_1.varchar({ length: 128 }),
    providerReference: mysql_core_1.varchar({ length: 128 }),
    deliveryStatus: mysql_core_1.mysqlEnum(['pending', 'sent', 'failed'])["default"]('pending').notNull(),
    deliveredAt: mysql_core_1.timestamp({ mode: 'string' }),
    error: mysql_core_1.text(),
    failureReason: mysql_core_1.text(),
    relatedEntityType: mysql_core_1.varchar({ length: 50 }),
    relatedEntityId: mysql_core_1.varchar({ length: 64 }),
    batchId: mysql_core_1.varchar({ length: 64 }),
    templateId: mysql_core_1.varchar({ length: 64 }),
    metadata: mysql_core_1.json(),
    sentAt: mysql_core_1.timestamp({ mode: 'string' }),
    nextRetryAt: mysql_core_1.timestamp({ mode: 'string' }),
    organizationId: mysql_core_1.varchar({ length: 64 }),
    createdBy: mysql_core_1.varchar({ length: 64 }),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow(),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow()
}, function (table) { return [
    mysql_core_1.index("sms_status_idx").on(table.status),
    mysql_core_1.index("sms_created_idx").on(table.createdAt),
    mysql_core_1.index("sms_batch_idx").on(table.batchId),
    mysql_core_1.index("sms_template_idx").on(table.templateId),
]; });
exports.smsCustomerPreferences = mysql_core_1.mysqlTable("smsCustomerPreferences", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    clientId: mysql_core_1.varchar({ length: 64 }).notNull(),
    phoneNumber: mysql_core_1.varchar({ length: 20 }).notNull(),
    optedIn: mysql_core_1.boolean()["default"](true).notNull(),
    marketingOptedIn: mysql_core_1.boolean()["default"](false).notNull(),
    transactionalOptedIn: mysql_core_1.boolean()["default"](true).notNull(),
    reminderPreferences: mysql_core_1.json(),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow()
}, function (table) { return [
    mysql_core_1.index("sms_pref_phone_idx").on(table.phoneNumber),
    mysql_core_1.index("sms_pref_client_idx").on(table.clientId),
]; });
exports.smsTemplates = mysql_core_1.mysqlTable("smsTemplates", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar({ length: 64 }).notNull(),
    name: mysql_core_1.varchar({ length: 255 }).notNull(),
    content: mysql_core_1.text().notNull(),
    category: mysql_core_1.mysqlEnum([
        'invoice_notification',
        'payment_reminder',
        'delivery_notification',
        'appointment_reminder',
        'promotional',
        'transactional',
        'custom',
    ]).notNull(),
    variables: mysql_core_1.json(),
    isActive: mysql_core_1.tinyint()["default"](1).notNull(),
    usageCount: mysql_core_1.int()["default"](0).notNull(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow(),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow()
}, function (table) { return [
    mysql_core_1.index("sms_template_org_idx").on(table.organizationId),
    mysql_core_1.index("sms_template_category_idx").on(table.category),
]; });
exports.smsAutomationRules = mysql_core_1.mysqlTable("smsAutomationRules", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar({ length: 64 }).notNull(),
    name: mysql_core_1.varchar({ length: 255 }).notNull(),
    trigger: mysql_core_1.mysqlEnum([
        'invoice_created',
        'payment_failed',
        'payment_received',
        'subscription_expiring',
        'appointment_reminder',
        'custom_event',
    ]).notNull(),
    templateId: mysql_core_1.varchar({ length: 64 }).notNull(),
    conditions: mysql_core_1.json(),
    isActive: mysql_core_1.tinyint()["default"](1).notNull(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow(),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow()
}, function (table) { return [
    mysql_core_1.index("sms_automation_org_idx").on(table.organizationId),
    mysql_core_1.index("sms_automation_trigger_idx").on(table.trigger),
]; });
exports.smsDeliveryEvents = mysql_core_1.mysqlTable("smsDeliveryEvents", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    queueId: mysql_core_1.varchar({ length: 64 }).notNull(),
    eventType: mysql_core_1.mysqlEnum(['sent', 'delivered', 'failed']).notNull(),
    timestamp: mysql_core_1.timestamp({ mode: 'string' }).defaultNow(),
    metadata: mysql_core_1.json()
}, function (table) { return [
    mysql_core_1.index("sms_delivery_queue_idx").on(table.queueId),
    mysql_core_1.index("sms_delivery_event_idx").on(table.eventType),
]; });
exports.userFavorites = mysql_core_1.mysqlTable("userFavorites", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    userId: mysql_core_1.varchar({ length: 64 }).notNull(),
    entityType: mysql_core_1.varchar({ length: 50 }).notNull(),
    entityId: mysql_core_1.varchar({ length: 64 }).notNull(),
    entityName: mysql_core_1.varchar({ length: 255 }),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow()
}, function (table) { return [
    mysql_core_1.index("fav_user_idx").on(table.userId),
    mysql_core_1.index("fav_entity_idx").on(table.entityType, table.entityId),
]; });
exports.aiDocuments = mysql_core_1.mysqlTable("aiDocuments", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    userId: mysql_core_1.varchar({ length: 64 }).notNull(),
    documentType: mysql_core_1.mysqlEnum(['contract', 'invoice', 'proposal', 'brief', 'report', 'email']).notNull(),
    originalContent: mysql_core_1.longtext().notNull(),
    summary: mysql_core_1.text(),
    keyPoints: mysql_core_1.json(),
    actionItems: mysql_core_1.json(),
    financialSummary: mysql_core_1.json(),
    generatedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow(),
    status: mysql_core_1.mysqlEnum(['processed', 'failed', 'pending'])["default"]('pending').notNull(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow()
}, function (table) { return [
    mysql_core_1.index("user_id_idx").on(table.userId),
    mysql_core_1.index("document_type_idx").on(table.documentType),
]; });
exports.emailGenerationHistory = mysql_core_1.mysqlTable("emailGenerationHistory", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    userId: mysql_core_1.varchar({ length: 64 }).notNull(),
    templateType: mysql_core_1.mysqlEnum(['invoice_followup', 'proposal', 'project_update', 'general', 'payment_reminder']).notNull(),
    tone: mysql_core_1.mysqlEnum(['professional', 'friendly', 'formal', 'casual'])["default"]('professional').notNull(),
    generatedContent: mysql_core_1.text().notNull(),
    originalContext: mysql_core_1.text(),
    recipientId: mysql_core_1.varchar({ length: 64 }),
    wasSent: mysql_core_1.tinyint()["default"](0).notNull(),
    sentAt: mysql_core_1.timestamp({ mode: 'string' }),
    feedback: mysql_core_1.varchar({ length: 20 }),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow()
}, function (table) { return [
    mysql_core_1.index("user_id_idx").on(table.userId),
    mysql_core_1.index("template_type_idx").on(table.templateType),
]; });
exports.financialAnalytics = mysql_core_1.mysqlTable("financialAnalytics", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar({ length: 64 }).notNull(),
    month: mysql_core_1.datetime({ mode: 'string' }).notNull(),
    totalRevenue: mysql_core_1.int()["default"](0),
    totalExpenses: mysql_core_1.int()["default"](0),
    netProfit: mysql_core_1.int()["default"](0),
    expenseTrends: mysql_core_1.json(),
    revenueTrends: mysql_core_1.json(),
    costReductionOpportunities: mysql_core_1.json(),
    cashFlowForecast: mysql_core_1.json(),
    analysisNotes: mysql_core_1.text(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow(),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow()
});
exports.aiChatSessions = mysql_core_1.mysqlTable("aiChatSessions", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    userId: mysql_core_1.varchar({ length: 64 }).notNull(),
    title: mysql_core_1.varchar({ length: 255 }),
    messageCount: mysql_core_1.int()["default"](0),
    lastMessageAt: mysql_core_1.timestamp({ mode: 'string' }),
    status: mysql_core_1.mysqlEnum(['active', 'archived'])["default"]('active').notNull(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow(),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow()
}, function (table) { return [
    mysql_core_1.index("user_id_idx").on(table.userId),
    mysql_core_1.index("created_at_idx").on(table.createdAt),
]; });
exports.aiChatMessages = mysql_core_1.mysqlTable("aiChatMessages", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    sessionId: mysql_core_1.varchar({ length: 64 }).notNull(),
    userId: mysql_core_1.varchar({ length: 64 }).notNull(),
    role: mysql_core_1.mysqlEnum(['user', 'assistant']).notNull(),
    content: mysql_core_1.text().notNull(),
    tokens: mysql_core_1.int()["default"](0),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow()
}, function (table) { return [
    mysql_core_1.index("session_id_idx").on(table.sessionId),
    mysql_core_1.index("user_id_idx").on(table.userId),
]; });
// Note: roles table exists in the database but is not actively managed by Drizzle migrations
// It's defined here for reference only - keeping it out of migrations to avoid conflicts
// export const roles = mysqlTable("roles", {
//     id: varchar({ length: 64 }).notNull(),
//     name: varchar({ length: 50 }).notNull(),
//     displayName: varchar({ length: 100 }).notNull(),
//     description: text(),
//     permissions: text().notNull(),
//     isSystem: tinyint().default(0).notNull(),
//     createdAt: timestamp({ mode: 'string' }),
//     updatedAt: timestamp({ mode: 'string' }),
// },
// (table) => [
//     index("role_name_idx").on(table.name),
// ]);
exports.lineItems = mysql_core_1.mysqlTable("lineItems", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    documentId: mysql_core_1.varchar({ length: 64 }).notNull(),
    documentType: mysql_core_1.mysqlEnum(['invoice', 'estimate', 'receipt', 'expense', 'credit_note', 'lpo']).notNull(),
    description: mysql_core_1.text().notNull(),
    quantity: mysql_core_1.int().notNull(),
    rate: mysql_core_1.int().notNull(),
    amount: mysql_core_1.int().notNull(),
    productId: mysql_core_1.varchar({ length: 64 }),
    serviceId: mysql_core_1.varchar({ length: 64 }),
    taxRate: mysql_core_1.int()["default"](0),
    taxAmount: mysql_core_1.int()["default"](0),
    lineNumber: mysql_core_1.int()["default"](1),
    createdBy: mysql_core_1.varchar({ length: 64 }),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' })
}, function (table) { return [
    mysql_core_1.index("document_idx").on(table.documentId, table.documentType),
]; });
// export type Role = typeof roles.$inferSelect;
// export type InsertRole = typeof roles.$inferInsert;
// ============================================
// WORKFLOW AUTOMATION TABLES
// ============================================
exports.workflows = mysql_core_1.mysqlTable("workflows", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    name: mysql_core_1.varchar({ length: 255 }).notNull(),
    description: mysql_core_1.text(),
    status: mysql_core_1.mysqlEnum(['active', 'inactive', 'draft'])["default"]('draft').notNull(),
    triggerType: mysql_core_1.mysqlEnum(['invoice_created', 'invoice_paid', 'invoice_overdue', 'invoice_approved', 'payment_received', 'payment_approved', 'receipt_created', 'expense_approved', 'opportunity_moved', 'task_completed', 'project_milestone_reached', 'reminder_time']).notNull(),
    triggerCondition: mysql_core_1.text(),
    actionTypes: mysql_core_1.text().notNull(),
    isRecurring: mysql_core_1.tinyint()["default"](0),
    createdBy: mysql_core_1.varchar({ length: 64 }).notNull(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' })
}, function (table) { return [
    mysql_core_1.index("status_idx").on(table.status),
    mysql_core_1.index("trigger_type_idx").on(table.triggerType),
    mysql_core_1.index("created_by_idx").on(table.createdBy),
]; });
exports.workflowTriggers = mysql_core_1.mysqlTable("workflowTriggers", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    workflowId: mysql_core_1.varchar({ length: 64 }).notNull(),
    triggerType: mysql_core_1.varchar({ length: 100 }).notNull(),
    triggerField: mysql_core_1.varchar({ length: 100 }),
    operator: mysql_core_1.mysqlEnum(['equals', 'not_equals', 'greater_than', 'less_than', 'contains', 'starts_with', 'ends_with'])["default"]('equals'),
    triggerValue: mysql_core_1.text(),
    isActive: mysql_core_1.tinyint()["default"](1).notNull(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' })
}, function (table) { return [
    mysql_core_1.index("workflow_idx").on(table.workflowId),
    mysql_core_1.index("trigger_type_idx").on(table.triggerType),
]; });
exports.workflowActions = mysql_core_1.mysqlTable("workflowActions", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    workflowId: mysql_core_1.varchar({ length: 64 }).notNull(),
    actionType: mysql_core_1.mysqlEnum(['send_email', 'create_task', 'update_status', 'send_notification', 'create_follow_up', 'add_invoice', 'update_field', 'create_reminder']).notNull(),
    actionName: mysql_core_1.varchar({ length: 255 }).notNull(),
    actionTarget: mysql_core_1.varchar({ length: 100 }),
    actionData: mysql_core_1.text().notNull(),
    delayMinutes: mysql_core_1.int()["default"](0),
    sequence: mysql_core_1.int()["default"](1),
    isActive: mysql_core_1.tinyint()["default"](1).notNull(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' })
}, function (table) { return [
    mysql_core_1.index("workflow_idx").on(table.workflowId),
    mysql_core_1.index("action_type_idx").on(table.actionType),
]; });
exports.workflowExecutions = mysql_core_1.mysqlTable("workflowExecutions", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    workflowId: mysql_core_1.varchar({ length: 64 }).notNull(),
    entityType: mysql_core_1.varchar({ length: 100 }).notNull(),
    entityId: mysql_core_1.varchar({ length: 64 }).notNull(),
    status: mysql_core_1.mysqlEnum(['pending', 'running', 'completed', 'failed', 'skipped'])["default"]('pending').notNull(),
    triggerData: mysql_core_1.text(),
    executionLog: mysql_core_1.text(),
    errorMessage: mysql_core_1.text(),
    executedAt: mysql_core_1.timestamp({ mode: 'string' }),
    completedAt: mysql_core_1.timestamp({ mode: 'string' }),
    createdAt: mysql_core_1.timestamp({ mode: 'string' })
}, function (table) { return [
    mysql_core_1.index("workflow_idx").on(table.workflowId),
    mysql_core_1.index("entity_idx").on(table.entityType, table.entityId),
    mysql_core_1.index("status_idx").on(table.status),
    mysql_core_1.index("executed_at_idx").on(table.executedAt),
]; });
// ============================================================================
// ENHANCED PERMISSIONS SYSTEM
// ============================================================================
exports.permissionMetadata = mysql_core_1.mysqlTable("permission_metadata", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    permissionId: mysql_core_1.varchar({ length: 100 }).notNull().unique(),
    label: mysql_core_1.varchar({ length: 255 }).notNull(),
    description: mysql_core_1.text(),
    category: mysql_core_1.varchar({ length: 100 }).notNull(),
    icon: mysql_core_1.varchar({ length: 100 }),
    isSystem: mysql_core_1.tinyint()["default"](1),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow(),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow().onUpdateNow()
});
// ============================================================================
// DASHBOARD CUSTOMIZATION SYSTEM
// ============================================================================
exports.dashboardLayouts = mysql_core_1.mysqlTable("dashboardLayouts", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    userId: mysql_core_1.varchar({ length: 64 }).notNull(),
    name: mysql_core_1.varchar({ length: 255 }).notNull()["default"]("My Dashboard"),
    description: mysql_core_1.text(),
    gridColumns: mysql_core_1.int()["default"](6),
    isDefault: mysql_core_1.tinyint()["default"](0),
    layoutData: mysql_core_1.json(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow(),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow().onUpdateNow()
}, function (table) { return [
    { uniqueIndex: "idx_user_default", on: [table.userId, table.isDefault] },
    { index: "idx_user_id", on: [table.userId] },
]; });
exports.dashboardWidgets = mysql_core_1.mysqlTable("dashboardWidgets", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    layoutId: mysql_core_1.varchar({ length: 64 }).notNull(),
    widgetType: mysql_core_1.varchar({ length: 100 }).notNull(),
    widgetTitle: mysql_core_1.varchar({ length: 255 }),
    widgetSize: mysql_core_1.varchar({ length: 10 })["default"]("medium"),
    rowIndex: mysql_core_1.int()["default"](0),
    colIndex: mysql_core_1.int()["default"](0),
    refreshInterval: mysql_core_1.int()["default"](300),
    config: mysql_core_1.json(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow(),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow().onUpdateNow()
}, function (table) { return [
    { index: "idx_layout_id", on: [table.layoutId] },
    { index: "idx_widget_type", on: [table.widgetType] },
]; });
exports.dashboardWidgetData = mysql_core_1.mysqlTable("dashboardWidgetData", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    widgetId: mysql_core_1.varchar({ length: 64 }).notNull(),
    dataKey: mysql_core_1.varchar({ length: 255 }),
    dataValue: mysql_core_1.json(),
    cachedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow(),
    expiresAt: mysql_core_1.timestamp({ mode: 'string' })
}, function (table) { return [
    { index: "idx_widget_id", on: [table.widgetId] },
    { index: "idx_expires_at", on: [table.expiresAt] },
]; });
// ============================================================================
// AUDIT LOGGING FOR PERMISSION CHANGES
// ============================================================================
exports.permissionAuditLog = mysql_core_1.mysqlTable("permissionAuditLog", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    roleId: mysql_core_1.varchar({ length: 64 }),
    userId: mysql_core_1.varchar({ length: 64 }),
    permissionId: mysql_core_1.varchar({ length: 100 }),
    permissionLabel: mysql_core_1.varchar({ length: 255 }),
    action: mysql_core_1.varchar({ length: 50 }).notNull(),
    changedBy: mysql_core_1.varchar({ length: 64 }),
    oldValue: mysql_core_1.text(),
    newValue: mysql_core_1.text(),
    reason: mysql_core_1.text(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow()
}, function (table) { return [
    { index: "idx_role_id", on: [table.roleId] },
    { index: "idx_user_id", on: [table.userId] },
    { index: "idx_changed_by", on: [table.changedBy] },
    { index: "idx_action", on: [table.action] },
    { index: "idx_created_at", on: [table.createdAt] },
]; });
// ============================================================================
// PHASE 20: PROJECT ANALYTICS
// ============================================================================
exports.projectMetrics = mysql_core_1.mysqlTable("projectMetrics", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    projectId: mysql_core_1.varchar({ length: 64 }).notNull(),
    revenue: mysql_core_1.int()["default"](0),
    costs: mysql_core_1.int()["default"](0),
    profit: mysql_core_1.int()["default"](0),
    profitMargin: mysql_core_1.int()["default"](0),
    hoursEstimated: mysql_core_1.int()["default"](0),
    hoursActual: mysql_core_1.int()["default"](0),
    teamMembersCount: mysql_core_1.int()["default"](0),
    completionPercentage: mysql_core_1.int()["default"](0),
    statusKey: mysql_core_1.varchar({ length: 50 })["default"]('on-time'),
    riskLevel: mysql_core_1.mysqlEnum(['low', 'medium', 'high'])["default"]('low'),
    calculatedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow()
}, function (table) { return [
    mysql_core_1.index("idx_project_id").on(table.projectId),
    mysql_core_1.index("idx_risk_level").on(table.riskLevel),
]; });
// ============================================================================
// PHASE 20: CLIENT HEALTH SCORING
// ============================================================================
exports.clientHealthScores = mysql_core_1.mysqlTable("clientHealthScores", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    clientId: mysql_core_1.varchar({ length: 64 }).notNull(),
    healthScore: mysql_core_1.int()["default"](50),
    riskLevel: mysql_core_1.mysqlEnum(['green', 'yellow', 'red'])["default"]('yellow'),
    paymentTimeliness: mysql_core_1.int()["default"](50),
    invoiceFrequency: mysql_core_1.int()["default"](50),
    totalRevenue: mysql_core_1.int()["default"](0),
    overdueAmount: mysql_core_1.int()["default"](0),
    projectSuccessRate: mysql_core_1.int()["default"](50),
    churnRisk: mysql_core_1.int()["default"](0),
    lifetimeValue: mysql_core_1.int()["default"](0),
    lastActivityDate: mysql_core_1.timestamp({ mode: 'string' }),
    calculatedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow()
}, function (table) { return [
    mysql_core_1.index("idx_client_id").on(table.clientId),
    mysql_core_1.index("idx_health_score").on(table.healthScore),
    mysql_core_1.index("idx_risk_level").on(table.riskLevel),
]; });
// ============================================================================
// PHASE 20: TEAM PERFORMANCE REVIEWS
// ============================================================================
exports.performanceReviews = mysql_core_1.mysqlTable("performanceReviews", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    employeeId: mysql_core_1.varchar({ length: 64 }).notNull(),
    reviewerId: mysql_core_1.varchar({ length: 64 }).notNull(),
    reviewDate: mysql_core_1.timestamp({ mode: 'string' }).defaultNow(),
    period: mysql_core_1.varchar({ length: 50 }).notNull(),
    overallRating: mysql_core_1.int()["default"](0),
    performanceScore: mysql_core_1.int()["default"](0),
    productivity: mysql_core_1.int()["default"](0),
    collaboration: mysql_core_1.int()["default"](0),
    communication: mysql_core_1.int()["default"](0),
    technicalSkills: mysql_core_1.int()["default"](0),
    leadership: mysql_core_1.int()["default"](0),
    comments: mysql_core_1.text(),
    goals: mysql_core_1.text(),
    developmentPlan: mysql_core_1.text(),
    status: mysql_core_1.mysqlEnum(['draft', 'completed', 'archived'])["default"]('draft'),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow(),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_employee_id").on(table.employeeId),
    mysql_core_1.index("idx_reviewer_id").on(table.reviewerId),
    mysql_core_1.index("idx_period").on(table.period),
    mysql_core_1.index("idx_review_date").on(table.reviewDate),
]; });
exports.skillsMatrix = mysql_core_1.mysqlTable("skillsMatrix", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    employeeId: mysql_core_1.varchar({ length: 64 }).notNull(),
    skillName: mysql_core_1.varchar({ length: 255 }).notNull(),
    proficiencyLevel: mysql_core_1.mysqlEnum(['beginner', 'intermediate', 'advanced', 'expert'])["default"]('beginner'),
    yearsOfExperience: mysql_core_1.int()["default"](0),
    lastAssessmentDate: mysql_core_1.timestamp({ mode: 'string' }),
    certifications: mysql_core_1.text(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow()
}, function (table) { return [
    mysql_core_1.index("idx_employee_id").on(table.employeeId),
    mysql_core_1.index("idx_skill_name").on(table.skillName),
]; });
// ============================================================================
// PHASE 20: ADVANCED SCHEDULING
// ============================================================================
exports.schedules = mysql_core_1.mysqlTable("schedules", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    employeeId: mysql_core_1.varchar({ length: 64 }).notNull(),
    taskTitle: mysql_core_1.varchar({ length: 255 }).notNull(),
    description: mysql_core_1.text(),
    startDate: mysql_core_1.timestamp({ mode: 'string' }).notNull(),
    endDate: mysql_core_1.timestamp({ mode: 'string' }).notNull(),
    duration: mysql_core_1.int()["default"](0),
    priority: mysql_core_1.mysqlEnum(['low', 'medium', 'high', 'urgent'])["default"]('medium'),
    status: mysql_core_1.mysqlEnum(['scheduled', 'in_progress', 'completed', 'cancelled'])["default"]('scheduled'),
    assignedTo: mysql_core_1.varchar({ length: 64 }),
    projectId: mysql_core_1.varchar({ length: 64 }),
    recurrencePattern: mysql_core_1.varchar({ length: 100 }),
    createdBy: mysql_core_1.varchar({ length: 64 }),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow(),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_employee_id").on(table.employeeId),
    mysql_core_1.index("idx_start_date").on(table.startDate),
    mysql_core_1.index("idx_status").on(table.status),
]; });
exports.vacationRequests = mysql_core_1.mysqlTable("vacationRequests", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    employeeId: mysql_core_1.varchar({ length: 64 }).notNull(),
    startDate: mysql_core_1.timestamp({ mode: 'string' }).notNull(),
    endDate: mysql_core_1.timestamp({ mode: 'string' }).notNull(),
    daysRequested: mysql_core_1.int()["default"](0),
    vacationType: mysql_core_1.mysqlEnum(['vacation', 'sick_leave', 'personal', 'sabbatical'])["default"]('vacation'),
    reason: mysql_core_1.text(),
    status: mysql_core_1.mysqlEnum(['pending', 'approved', 'rejected', 'cancelled'])["default"]('pending'),
    approvedBy: mysql_core_1.varchar({ length: 64 }),
    approvalDate: mysql_core_1.timestamp({ mode: 'string' }),
    notes: mysql_core_1.text(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow()
}, function (table) { return [
    mysql_core_1.index("idx_employee_id").on(table.employeeId),
    mysql_core_1.index("idx_start_date").on(table.startDate),
    mysql_core_1.index("idx_status").on(table.status),
]; });
// ============================================================================
// PHASE 20: DOCUMENT MANAGEMENT
// ============================================================================
exports.documents = mysql_core_1.mysqlTable("documents", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar({ length: 64 }),
    documentName: mysql_core_1.varchar({ length: 255 }).notNull(),
    documentType: mysql_core_1.mysqlEnum(['contract', 'agreement', 'proposal', 'template', 'invoice', 'receipt', 'other'])["default"]('other'),
    fileUrl: mysql_core_1.varchar({ length: 500 }).notNull(),
    fileSize: mysql_core_1.int()["default"](0),
    mimeType: mysql_core_1.varchar({ length: 100 }),
    linkedEntityType: mysql_core_1.varchar({ length: 100 }),
    linkedEntityId: mysql_core_1.varchar({ length: 64 }),
    linkedClientId: mysql_core_1.varchar({ length: 64 }),
    linkedProjectId: mysql_core_1.varchar({ length: 64 }),
    linkedInvoiceId: mysql_core_1.varchar({ length: 64 }),
    uploadedBy: mysql_core_1.varchar({ length: 64 }).notNull(),
    currentVersion: mysql_core_1.int()["default"](1),
    status: mysql_core_1.mysqlEnum(['active', 'archived', 'deleted'])["default"]('active'),
    expiryDate: mysql_core_1.timestamp({ mode: 'string' }),
    requiresSignature: mysql_core_1.tinyint()["default"](0),
    isSigned: mysql_core_1.tinyint()["default"](0),
    signedDate: mysql_core_1.timestamp({ mode: 'string' }),
    signedBy: mysql_core_1.varchar({ length: 64 }),
    tags: mysql_core_1.text(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow(),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_document_type").on(table.documentType),
    mysql_core_1.index("idx_entity").on(table.linkedEntityType, table.linkedEntityId),
    mysql_core_1.index("idx_client_id").on(table.linkedClientId),
    mysql_core_1.index("idx_project_id").on(table.linkedProjectId),
    mysql_core_1.index("idx_uploaded_by").on(table.uploadedBy),
]; });
exports.documentVersions = mysql_core_1.mysqlTable("documentVersions", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    documentId: mysql_core_1.varchar({ length: 64 }).notNull(),
    versionNumber: mysql_core_1.int()["default"](1),
    fileUrl: mysql_core_1.varchar({ length: 500 }).notNull(),
    fileSize: mysql_core_1.int()["default"](0),
    uploadedBy: mysql_core_1.varchar({ length: 64 }).notNull(),
    changeNotes: mysql_core_1.text(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow()
}, function (table) { return [
    mysql_core_1.index("idx_document_id").on(table.documentId),
    mysql_core_1.index("idx_version").on(table.versionNumber),
]; });
exports.documentAccess = mysql_core_1.mysqlTable("documentAccess", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    documentId: mysql_core_1.varchar({ length: 64 }).notNull(),
    userId: mysql_core_1.varchar({ length: 64 }),
    roleId: mysql_core_1.varchar({ length: 64 }),
    accessLevel: mysql_core_1.mysqlEnum(['view', 'download', 'edit', 'share'])["default"]('view'),
    grantedBy: mysql_core_1.varchar({ length: 64 }),
    grantedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow(),
    expiresAt: mysql_core_1.timestamp({ mode: 'string' })
}, function (table) { return [
    mysql_core_1.index("idx_document_id").on(table.documentId),
    mysql_core_1.index("idx_user_id").on(table.userId),
]; });
// ============================================================================
// PHASE 20: REAL-TIME NOTIFICATIONS & RULES
// ============================================================================
exports.notificationRules = mysql_core_1.mysqlTable("notificationRules", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    userId: mysql_core_1.varchar({ length: 64 }).notNull(),
    eventType: mysql_core_1.varchar({ length: 100 }).notNull(),
    channelType: mysql_core_1.mysqlEnum(['email', 'in_app', 'push', 'sms'])["default"]('in_app'),
    doNotDisturbStart: mysql_core_1.varchar({ length: 5 }),
    doNotDisturbEnd: mysql_core_1.varchar({ length: 5 }),
    frequency: mysql_core_1.mysqlEnum(['instant', 'daily', 'weekly', 'never'])["default"]('instant'),
    enabled: mysql_core_1.tinyint()["default"](1),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow(),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_user_id").on(table.userId),
    mysql_core_1.index("idx_event_type").on(table.eventType),
]; });
// ============================================================================
// PHASE 20: EXPENSE MANAGEMENT
// ============================================================================
exports.usageMetrics = mysql_core_1.mysqlTable("usageMetrics", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    subscriptionId: mysql_core_1.varchar({ length: 64 }).notNull(),
    metricName: mysql_core_1.varchar({ length: 255 }).notNull(),
    metricValue: mysql_core_1.int()["default"](0),
    billingAmount: mysql_core_1.int()["default"](0),
    usagePeriod: mysql_core_1.varchar({ length: 50 }).notNull(),
    recordedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow()
}, function (table) { return [
    mysql_core_1.index("idx_subscription_id").on(table.subscriptionId),
    mysql_core_1.index("idx_usage_period").on(table.usagePeriod),
]; });
// ============================================================================
// PHASE 20: EXPENSE MANAGEMENT
// ============================================================================
exports.expenseCategories = mysql_core_1.mysqlTable("expenseCategories", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    categoryName: mysql_core_1.varchar({ length: 255 }).notNull(),
    description: mysql_core_1.text(),
    taxDeductible: mysql_core_1.tinyint()["default"](1),
    accountCode: mysql_core_1.varchar({ length: 50 }),
    isActive: mysql_core_1.tinyint()["default"](1),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow()
}, function (table) { return [
    mysql_core_1.index("idx_category_name").on(table.categoryName),
    mysql_core_1.index("idx_tax_deductible").on(table.taxDeductible),
]; });
exports.expenseReports = mysql_core_1.mysqlTable("expenseReports", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    submittedBy: mysql_core_1.varchar({ length: 64 }).notNull(),
    reportDate: mysql_core_1.timestamp({ mode: 'string' }).notNull(),
    totalAmount: mysql_core_1.int()["default"](0),
    currency: mysql_core_1.varchar({ length: 10 })["default"]('KES'),
    status: mysql_core_1.mysqlEnum(['draft', 'submitted', 'approved', 'rejected', 'reimbursed'])["default"]('draft'),
    approvedBy: mysql_core_1.varchar({ length: 64 }),
    approvalDate: mysql_core_1.timestamp({ mode: 'string' }),
    reimbursementDate: mysql_core_1.timestamp({ mode: 'string' }),
    notes: mysql_core_1.text(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow(),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_submitted_by").on(table.submittedBy),
    mysql_core_1.index("idx_status").on(table.status),
    mysql_core_1.index("idx_report_date").on(table.reportDate),
]; });
exports.reimbursements = mysql_core_1.mysqlTable("reimbursements", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    expenseReportId: mysql_core_1.varchar({ length: 64 }).notNull(),
    employeeId: mysql_core_1.varchar({ length: 64 }).notNull(),
    totalAmount: mysql_core_1.int()["default"](0),
    currency: mysql_core_1.varchar({ length: 10 })["default"]('KES'),
    paymentMethod: mysql_core_1.varchar({ length: 50 }).notNull(),
    paymentDate: mysql_core_1.timestamp({ mode: 'string' }),
    referenceNumber: mysql_core_1.varchar({ length: 100 }),
    status: mysql_core_1.mysqlEnum(['pending', 'approved', 'processed', 'failed'])["default"]('pending'),
    notes: mysql_core_1.text(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow()
}, function (table) { return [
    mysql_core_1.index("idx_report_id").on(table.expenseReportId),
    mysql_core_1.index("idx_employee_id").on(table.employeeId),
    mysql_core_1.index("idx_status").on(table.status),
]; });
// ============================================================================
// PHASE 20: MULTI-CURRENCY SUPPORT
// ============================================================================
exports.currencies = mysql_core_1.mysqlTable("currencies", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    code: mysql_core_1.varchar({ length: 3 }).notNull().unique(),
    name: mysql_core_1.varchar({ length: 100 }).notNull(),
    symbol: mysql_core_1.varchar({ length: 10 }),
    decimalPlaces: mysql_core_1.int()["default"](2),
    isActive: mysql_core_1.tinyint()["default"](1),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow()
}, function (table) { return [
    mysql_core_1.index("idx_code").on(table.code),
    mysql_core_1.index("idx_active").on(table.isActive),
]; });
exports.exchangeRates = mysql_core_1.mysqlTable("exchangeRates", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    fromCurrency: mysql_core_1.varchar({ length: 3 }).notNull(),
    toCurrency: mysql_core_1.varchar({ length: 3 }).notNull(),
    rate: mysql_core_1.int()["default"](0),
    rateDate: mysql_core_1.timestamp({ mode: 'string' }).notNull(),
    source: mysql_core_1.varchar({ length: 100 }),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow()
}, function (table) { return [
    mysql_core_1.index("idx_currency_pair").on(table.fromCurrency, table.toCurrency),
    mysql_core_1.index("idx_rate_date").on(table.rateDate),
]; });
exports.taxRates = mysql_core_1.mysqlTable("taxRates", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    country: mysql_core_1.varchar({ length: 100 }).notNull(),
    taxType: mysql_core_1.mysqlEnum(['vat', 'gst', 'sales_tax', 'income_tax'])["default"]('vat'),
    rate: mysql_core_1.int()["default"](0),
    effectiveDate: mysql_core_1.timestamp({ mode: 'string' }).notNull(),
    expiryDate: mysql_core_1.timestamp({ mode: 'string' }),
    description: mysql_core_1.text(),
    isActive: mysql_core_1.tinyint()["default"](1),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow()
}, function (table) { return [
    mysql_core_1.index("idx_country").on(table.country),
    mysql_core_1.index("idx_tax_type").on(table.taxType),
    mysql_core_1.index("idx_effective_date").on(table.effectiveDate),
]; });
// ============================================================================
// PHASE 20: FORECASTING & PREDICTIVE ANALYTICS
// ============================================================================
exports.forecastModels = mysql_core_1.mysqlTable("forecastModels", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    modelName: mysql_core_1.varchar({ length: 255 }).notNull(),
    modelType: mysql_core_1.mysqlEnum(['revenue', 'expense', 'headcount', 'client_churn'])["default"]('revenue'),
    algorithm: mysql_core_1.varchar({ length: 100 }),
    accuracy: mysql_core_1.int()["default"](0),
    trainingDataPoints: mysql_core_1.int()["default"](0),
    lastTrainedAt: mysql_core_1.timestamp({ mode: 'string' }),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow(),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_model_type").on(table.modelType),
    mysql_core_1.index("idx_last_trained").on(table.lastTrainedAt),
]; });
exports.forecastResults = mysql_core_1.mysqlTable("forecastResults", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    modelId: mysql_core_1.varchar({ length: 64 }).notNull(),
    forecastPeriod: mysql_core_1.varchar({ length: 50 }).notNull(),
    forecastDate: mysql_core_1.timestamp({ mode: 'string' }).notNull(),
    predictedValue: mysql_core_1.int()["default"](0),
    confidenceInterval: mysql_core_1.int()["default"](0),
    confidenceLower: mysql_core_1.int()["default"](0),
    confidenceUpper: mysql_core_1.int()["default"](0),
    actualValue: mysql_core_1.int(),
    variance: mysql_core_1.int(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow()
}, function (table) { return [
    mysql_core_1.index("idx_model_id").on(table.modelId),
    mysql_core_1.index("idx_forecast_period").on(table.forecastPeriod),
    mysql_core_1.index("idx_forecast_date").on(table.forecastDate),
]; });
// ============================================================================
// PHASE 20: INTEGRATION PLATFORM & API
// ============================================================================
exports.apiKeys = mysql_core_1.mysqlTable("apiKeys", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    userId: mysql_core_1.varchar({ length: 64 }).notNull(),
    keyName: mysql_core_1.varchar({ length: 255 }).notNull(),
    keyValue: mysql_core_1.varchar({ length: 255 }).notNull(),
    lastUsedAt: mysql_core_1.timestamp({ mode: 'string' }),
    expiresAt: mysql_core_1.timestamp({ mode: 'string' }),
    isActive: mysql_core_1.tinyint()["default"](1),
    rateLimit: mysql_core_1.int()["default"](1000),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow()
}, function (table) { return [
    mysql_core_1.index("idx_user_id").on(table.userId),
    mysql_core_1.index("idx_key_value").on(table.keyValue),
    mysql_core_1.index("idx_active").on(table.isActive),
]; });
exports.webhooks = mysql_core_1.mysqlTable("webhooks", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    userId: mysql_core_1.varchar({ length: 64 }).notNull(),
    webhookUrl: mysql_core_1.varchar({ length: 500 }).notNull(),
    eventType: mysql_core_1.varchar({ length: 100 }).notNull(),
    secret: mysql_core_1.varchar({ length: 255 }),
    isActive: mysql_core_1.tinyint()["default"](1),
    retryCount: mysql_core_1.int()["default"](0),
    lastTriggeredAt: mysql_core_1.timestamp({ mode: 'string' }),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow()
}, function (table) { return [
    mysql_core_1.index("idx_user_id").on(table.userId),
    mysql_core_1.index("idx_event_type").on(table.eventType),
    mysql_core_1.index("idx_active").on(table.isActive),
]; });
exports.integrationLogs = mysql_core_1.mysqlTable("integrationLogs", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    webhookId: mysql_core_1.varchar({ length: 64 }),
    eventType: mysql_core_1.varchar({ length: 100 }).notNull(),
    payload: mysql_core_1.text(),
    responseStatus: mysql_core_1.int(),
    errorMessage: mysql_core_1.text(),
    attemptNumber: mysql_core_1.int()["default"](1),
    success: mysql_core_1.tinyint()["default"](0),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow()
}, function (table) { return [
    mysql_core_1.index("idx_webhook_id").on(table.webhookId),
    mysql_core_1.index("idx_event_type").on(table.eventType),
    mysql_core_1.index("idx_success").on(table.success),
]; });
// ============================================================================
// EMAIL QUEUE & DELIVERY TRACKING
// ============================================================================
exports.emailQueue = mysql_core_1.mysqlTable("emailQueue", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    recipientEmail: mysql_core_1.varchar({ length: 320 }).notNull(),
    recipientName: mysql_core_1.varchar({ length: 255 }),
    subject: mysql_core_1.varchar({ length: 500 }).notNull(),
    htmlContent: mysql_core_1.text().notNull(),
    textContent: mysql_core_1.text(),
    eventType: mysql_core_1.varchar({ length: 100 }).notNull(),
    entityType: mysql_core_1.varchar({ length: 100 }),
    entityId: mysql_core_1.varchar({ length: 64 }),
    userId: mysql_core_1.varchar({ length: 64 }),
    status: mysql_core_1.mysqlEnum(['pending', 'sent', 'failed', 'retrying'])["default"]('pending').notNull(),
    attempts: mysql_core_1.int()["default"](0).notNull(),
    maxAttempts: mysql_core_1.int()["default"](3).notNull(),
    lastAttemptAt: mysql_core_1.timestamp({ mode: 'string' }),
    nextRetryAt: mysql_core_1.timestamp({ mode: 'string' }),
    errorMessage: mysql_core_1.text(),
    metadata: mysql_core_1.text(),
    sentAt: mysql_core_1.timestamp({ mode: 'string' }),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow(),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_status").on(table.status),
    mysql_core_1.index("idx_recipient").on(table.recipientEmail),
    mysql_core_1.index("idx_next_retry").on(table.nextRetryAt),
    mysql_core_1.index("idx_event_type").on(table.eventType),
    mysql_core_1.index("idx_created_at").on(table.createdAt),
]; });
exports.emailLog = mysql_core_1.mysqlTable("emailLog", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    queueId: mysql_core_1.varchar({ length: 64 }),
    recipientEmail: mysql_core_1.varchar({ length: 320 }).notNull(),
    subject: mysql_core_1.varchar({ length: 500 }).notNull(),
    eventType: mysql_core_1.varchar({ length: 100 }).notNull(),
    status: mysql_core_1.mysqlEnum(['sent', 'failed']).notNull(),
    messageId: mysql_core_1.varchar({ length: 255 }),
    errorMessage: mysql_core_1.text(),
    sentAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow()
}, function (table) { return [
    mysql_core_1.index("idx_status").on(table.status),
    mysql_core_1.index("idx_recipient").on(table.recipientEmail),
    mysql_core_1.index("idx_sent_at").on(table.sentAt),
    mysql_core_1.index("idx_event_type").on(table.eventType),
]; });
exports.invoiceReminders = mysql_core_1.mysqlTable("invoiceReminders", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    invoiceId: mysql_core_1.varchar({ length: 64 }).notNull(),
    reminderType: mysql_core_1.mysqlEnum(['overdue_1day', 'overdue_3days', 'overdue_7days', 'overdue_14days', 'overdue_30days']).notNull(),
    clientEmail: mysql_core_1.varchar({ length: 320 }).notNull(),
    sentAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow(),
    sentBy: mysql_core_1.varchar({ length: 64 }),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow()
}, function (table) { return [
    mysql_core_1.index("idx_invoice_id").on(table.invoiceId),
    mysql_core_1.index("idx_reminder_type").on(table.reminderType),
    mysql_core_1.index("idx_sent_at").on(table.sentAt),
]; });
// ============================================================================
// PHASE 20: PRICING & BILLING SYSTEM
// ============================================================================
exports.pricingPlans = mysql_core_1.mysqlTable("pricingPlans", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    planName: mysql_core_1.varchar({ length: 255 }).notNull(),
    planSlug: mysql_core_1.varchar({ length: 100 }).notNull().unique(),
    description: mysql_core_1.longtext(),
    tier: mysql_core_1.mysqlEnum(['free', 'starter', 'professional', 'enterprise', 'custom']).notNull(),
    monthlyPrice: mysql_core_1.decimal({ precision: 10, scale: 2 })["default"]('0'),
    annualPrice: mysql_core_1.decimal({ precision: 10, scale: 2 })["default"]('0'),
    monthlyAnnualDiscount: mysql_core_1.decimal({ precision: 5, scale: 2 })["default"]('0'),
    maxUsers: mysql_core_1.int()["default"](-1),
    maxProjects: mysql_core_1.int()["default"](-1),
    maxStorageGB: mysql_core_1.int()["default"](-1),
    features: mysql_core_1.json(),
    supportLevel: mysql_core_1.mysqlEnum(['email', 'priority', '24/7_phone', 'dedicated_manager'])["default"]('email'),
    isActive: mysql_core_1.tinyint()["default"](1).notNull(),
    displayOrder: mysql_core_1.int()["default"](0),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow(),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_tier").on(table.tier),
    mysql_core_1.index("idx_slug").on(table.planSlug),
    mysql_core_1.index("idx_active").on(table.isActive),
]; });
exports.subscriptions = mysql_core_1.mysqlTable("subscriptions", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    clientId: mysql_core_1.varchar({ length: 64 }),
    organizationId: mysql_core_1.varchar({ length: 64 }),
    planId: mysql_core_1.varchar({ length: 64 }).notNull(),
    status: mysql_core_1.mysqlEnum(['trial', 'active', 'suspended', 'cancelled', 'expired'])["default"]('trial').notNull(),
    billingCycle: mysql_core_1.mysqlEnum(['monthly', 'annual'])["default"]('monthly').notNull(),
    startDate: mysql_core_1.timestamp({ mode: 'string' }).notNull(),
    renewalDate: mysql_core_1.timestamp({ mode: 'string' }).notNull(),
    expiryDate: mysql_core_1.timestamp({ mode: 'string' }),
    gracePeriodEnd: mysql_core_1.timestamp({ mode: 'string' }),
    isLocked: mysql_core_1.tinyint()["default"](0),
    autoRenew: mysql_core_1.tinyint()["default"](1),
    currentPrice: mysql_core_1.decimal({ precision: 10, scale: 2 })["default"]('0'),
    usersCount: mysql_core_1.int()["default"](0),
    projectsCount: mysql_core_1.int()["default"](0),
    storageUsedGB: mysql_core_1.int()["default"](0),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow(),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_client_id").on(table.clientId),
    mysql_core_1.index("idx_org_id").on(table.organizationId),
    mysql_core_1.index("idx_status").on(table.status),
    mysql_core_1.index("idx_renewal_date").on(table.renewalDate),
    mysql_core_1.index("idx_expiry_date").on(table.expiryDate),
]; });
exports.billingInvoices = mysql_core_1.mysqlTable("billingInvoices", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    subscriptionId: mysql_core_1.varchar({ length: 64 }).notNull(),
    invoiceNumber: mysql_core_1.varchar({ length: 50 }).notNull().unique(),
    amount: mysql_core_1.decimal({ precision: 10, scale: 2 }).notNull(),
    tax: mysql_core_1.decimal({ precision: 10, scale: 2 })["default"]('0'),
    totalAmount: mysql_core_1.decimal({ precision: 10, scale: 2 }).notNull(),
    currency: mysql_core_1.varchar({ length: 3 })["default"]('USD'),
    status: mysql_core_1.mysqlEnum(['pending', 'sent', 'viewed', 'paid', 'failed', 'cancelled', 'refunded'])["default"]('pending').notNull(),
    billingPeriodStart: mysql_core_1.timestamp({ mode: 'string' }).notNull(),
    billingPeriodEnd: mysql_core_1.timestamp({ mode: 'string' }).notNull(),
    dueDate: mysql_core_1.timestamp({ mode: 'string' }).notNull(),
    sentAt: mysql_core_1.timestamp({ mode: 'string' }),
    paidAt: mysql_core_1.timestamp({ mode: 'string' }),
    paymentMethod: mysql_core_1.varchar({ length: 50 }),
    paymentReference: mysql_core_1.varchar({ length: 255 }),
    notes: mysql_core_1.text(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow(),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_subscription_id").on(table.subscriptionId),
    mysql_core_1.index("idx_status").on(table.status),
    mysql_core_1.index("idx_due_date").on(table.dueDate),
    mysql_core_1.index("idx_paid_at").on(table.paidAt),
]; });
exports.payments = mysql_core_1.mysqlTable("payments", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar({ length: 64 }),
    invoiceId: mysql_core_1.varchar({ length: 64 }).notNull(),
    clientId: mysql_core_1.varchar({ length: 64 }).notNull(),
    accountId: mysql_core_1.varchar({ length: 64 }),
    amount: mysql_core_1.int().notNull(),
    paymentDate: mysql_core_1.timestamp({ mode: 'string' }).notNull(),
    paymentMethod: mysql_core_1.mysqlEnum(['cash', 'bank_transfer', 'cheque', 'mpesa', 'card', 'other']).notNull(),
    referenceNumber: mysql_core_1.varchar({ length: 100 }),
    chartOfAccountType: mysql_core_1.mysqlEnum(['debit', 'credit'])["default"]('debit'),
    notes: mysql_core_1.text(),
    status: mysql_core_1.mysqlEnum(['pending', 'completed', 'failed', 'cancelled'])["default"]('pending').notNull(),
    approvedBy: mysql_core_1.varchar({ length: 64 }),
    approvedAt: mysql_core_1.timestamp({ mode: 'string' }),
    createdBy: mysql_core_1.varchar({ length: 64 }),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow()
}, function (table) { return [
    mysql_core_1.index("idx_invoice_id").on(table.invoiceId),
    mysql_core_1.index("idx_client_id").on(table.clientId),
    mysql_core_1.index("idx_status").on(table.status),
    mysql_core_1.index("idx_payment_date").on(table.paymentDate),
]; });
exports.paymentMethods = mysql_core_1.mysqlTable("paymentMethods", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    clientId: mysql_core_1.varchar({ length: 64 }).notNull(),
    type: mysql_core_1.mysqlEnum(['credit_card', 'debit_card', 'bank_account', 'paypal', 'mpesa']).notNull(),
    provider: mysql_core_1.varchar({ length: 50 }),
    lastFourDigits: mysql_core_1.varchar({ length: 4 }),
    expiryMonth: mysql_core_1.int(),
    expiryYear: mysql_core_1.int(),
    holderName: mysql_core_1.varchar({ length: 255 }),
    bankName: mysql_core_1.varchar({ length: 255 }),
    accountNumber: mysql_core_1.varchar({ length: 50 }),
    isDefault: mysql_core_1.tinyint()["default"](0),
    isActive: mysql_core_1.tinyint()["default"](1),
    providerMethodId: mysql_core_1.varchar({ length: 255 }),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow(),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_client_id").on(table.clientId),
    mysql_core_1.index("idx_is_default").on(table.isDefault),
    mysql_core_1.index("idx_type").on(table.type),
]; });
exports.billingUsageMetrics = mysql_core_1.mysqlTable("billingUsageMetrics", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    subscriptionId: mysql_core_1.varchar({ length: 64 }).notNull(),
    metricDate: mysql_core_1.datetime({ mode: 'string' }).notNull(),
    usersCount: mysql_core_1.int()["default"](0),
    projectsCount: mysql_core_1.int()["default"](0),
    tasksCount: mysql_core_1.int()["default"](0),
    documentsCount: mysql_core_1.int()["default"](0),
    storageUsedMB: mysql_core_1.int()["default"](0),
    apiCallsCount: mysql_core_1.int()["default"](0),
    emailsSent: mysql_core_1.int()["default"](0),
    recordedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow()
}, function (table) { return [
    mysql_core_1.index("idx_subscription_id").on(table.subscriptionId),
    mysql_core_1.index("idx_metric_date").on(table.metricDate),
]; });
exports.billingNotifications = mysql_core_1.mysqlTable("billingNotifications", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    subscriptionId: mysql_core_1.varchar({ length: 64 }).notNull(),
    notificationType: mysql_core_1.mysqlEnum([
        'payment_due_7days',
        'payment_due_today',
        'payment_overdue_1day',
        'payment_overdue_3days',
        'subscription_expiring_7days',
        'subscription_expiring_today',
        'subscription_expired',
        'system_locked',
        'payment_failed',
        'usage_limit_warning',
        'renewal_successful',
    ]).notNull(),
    message: mysql_core_1.text(),
    sentTo: mysql_core_1.varchar({ length: 320 }),
    channel: mysql_core_1.mysqlEnum(['email', 'in_app', 'sms'])["default"]('email'),
    isSent: mysql_core_1.tinyint()["default"](0),
    sentAt: mysql_core_1.timestamp({ mode: 'string' }),
    isRead: mysql_core_1.tinyint()["default"](0),
    readAt: mysql_core_1.timestamp({ mode: 'string' }),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow()
}, function (table) { return [
    mysql_core_1.index("idx_subscription_id").on(table.subscriptionId),
    mysql_core_1.index("idx_notification_type").on(table.notificationType),
    mysql_core_1.index("idx_is_sent").on(table.isSent),
]; });
// ============================================================================
// DUNNING MANAGEMENT: Payment Retry Logic & Policies
// ============================================================================
exports.dunningPolicies = mysql_core_1.mysqlTable("dunningPolicies", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar({ length: 64 }).notNull(),
    name: mysql_core_1.varchar({ length: 255 }).notNull(),
    description: mysql_core_1.text(),
    maxRetries: mysql_core_1.int()["default"](3).notNull(),
    retryIntervalDays: mysql_core_1.int()["default"](3).notNull(),
    finalRetryDays: mysql_core_1.int()["default"](14).notNull(),
    suspendAfterDays: mysql_core_1.int()["default"](21).notNull(),
    cancelAfterDays: mysql_core_1.int()["default"](30).notNull(),
    notificationTemplate: mysql_core_1.varchar({ length: 64 }),
    isActive: mysql_core_1.tinyint()["default"](1).notNull(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow(),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_organization_id").on(table.organizationId),
    mysql_core_1.index("idx_is_active").on(table.isActive),
]; });
exports.paymentRetries = mysql_core_1.mysqlTable("paymentRetries", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    invoiceId: mysql_core_1.varchar({ length: 64 }).notNull(),
    subscriptionId: mysql_core_1.varchar({ length: 64 }).notNull(),
    attemptNumber: mysql_core_1.int()["default"](1).notNull(),
    status: mysql_core_1.mysqlEnum(['pending', 'processing', 'failed', 'succeeded', 'abandoned'])["default"]('pending').notNull(),
    failureReason: mysql_core_1.varchar({ length: 255 }),
    paymentMethod: mysql_core_1.varchar({ length: 50 }),
    attemptedAt: mysql_core_1.timestamp({ mode: 'string' }),
    nextRetryAt: mysql_core_1.timestamp({ mode: 'string' }),
    metadata: mysql_core_1.json(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow(),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_invoice_id").on(table.invoiceId),
    mysql_core_1.index("idx_subscription_id").on(table.subscriptionId),
    mysql_core_1.index("idx_status").on(table.status),
    mysql_core_1.index("idx_next_retry_at").on(table.nextRetryAt),
]; });
exports.dunningEvents = mysql_core_1.mysqlTable("dunningEvents", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    subscriptionId: mysql_core_1.varchar({ length: 64 }).notNull(),
    invoiceId: mysql_core_1.varchar({ length: 64 }),
    eventType: mysql_core_1.mysqlEnum([
        'retry_scheduled',
        'retry_sent',
        'retry_failed',
        'suspension_notice_sent',
        'subscription_suspended',
        'cancellation_notice_sent',
        'subscription_cancelled',
        'payment_recovered',
    ]).notNull(),
    details: mysql_core_1.json(),
    triggeredBy: mysql_core_1.varchar({ length: 64 }),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow()
}, function (table) { return [
    mysql_core_1.index("idx_subscription_id").on(table.subscriptionId),
    mysql_core_1.index("idx_event_type").on(table.eventType),
    mysql_core_1.index("idx_created_at").on(table.createdAt),
]; });
// ============================================================================
// USER MANAGEMENT: Soft Delete & Audit
// ============================================================================
exports.userDeletions = mysql_core_1.mysqlTable("userDeletions", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    userId: mysql_core_1.varchar({ length: 64 }).notNull(),
    userName: mysql_core_1.varchar({ length: 255 }).notNull(),
    userEmail: mysql_core_1.varchar({ length: 320 }).notNull(),
    deletedReason: mysql_core_1.text(),
    deletedBy: mysql_core_1.varchar({ length: 64 }).notNull(),
    deletedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow(),
    restoredAt: mysql_core_1.timestamp({ mode: 'string' }),
    restoredBy: mysql_core_1.varchar({ length: 64 }),
    archived: mysql_core_1.tinyint()["default"](1).notNull()
}, function (table) { return [
    mysql_core_1.index("idx_user_id").on(table.userId),
    mysql_core_1.index("idx_deleted_by").on(table.deletedBy),
    mysql_core_1.index("idx_deleted_at").on(table.deletedAt),
    mysql_core_1.index("idx_archived").on(table.archived),
]; });
// ============================================================================
// NOTIFICATIONS SYSTEM: Broadcast & In-App
// ============================================================================
exports.notificationTemplates = mysql_core_1.mysqlTable("notificationTemplates", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    templateKey: mysql_core_1.varchar({ length: 100 }).notNull().unique(),
    templateName: mysql_core_1.varchar({ length: 255 }).notNull(),
    category: mysql_core_1.mysqlEnum(['billing', 'system', 'user', 'document', 'communication', 'security']).notNull(),
    subject: mysql_core_1.varchar({ length: 500 }),
    bodyTemplate: mysql_core_1.longtext().notNull(),
    channels: mysql_core_1.json(),
    variables: mysql_core_1.json(),
    isActive: mysql_core_1.tinyint()["default"](1).notNull(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow(),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_template_key").on(table.templateKey),
    mysql_core_1.index("idx_category").on(table.category),
]; });
// ============================================
// NOTIFICATION BROADCASTS (Legacy - kept for migration)
// NOTE: Primary notifications table is now defined in Phase 1 section above
// ============================================
exports.notificationBroadcasts = mysql_core_1.mysqlTable("notificationBroadcasts", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    title: mysql_core_1.varchar({ length: 500 }).notNull(),
    content: mysql_core_1.longtext().notNull(),
    target: mysql_core_1.mysqlEnum(['all_users', 'specific_role', 'specific_department', 'specific_plan', 'custom']).notNull(),
    targetValue: mysql_core_1.varchar({ length: 255 }),
    priority: mysql_core_1.mysqlEnum(['low', 'normal', 'high', 'critical'])["default"]('normal').notNull(),
    channels: mysql_core_1.json(),
    status: mysql_core_1.mysqlEnum(['draft', 'scheduled', 'sending', 'sent', 'cancelled'])["default"]('draft').notNull(),
    scheduledFor: mysql_core_1.timestamp({ mode: 'string' }),
    startedAt: mysql_core_1.timestamp({ mode: 'string' }),
    completedAt: mysql_core_1.timestamp({ mode: 'string' }),
    recipientCount: mysql_core_1.int()["default"](0),
    sentCount: mysql_core_1.int()["default"](0),
    failedCount: mysql_core_1.int()["default"](0),
    createdBy: mysql_core_1.varchar({ length: 64 }).notNull(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow(),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_status").on(table.status),
    mysql_core_1.index("idx_target").on(table.target),
    mysql_core_1.index("idx_scheduled_for").on(table.scheduledFor),
]; });
// ============================================================================
// MESSAGING & INTRACHAT: Internal Communication
// ============================================================================
exports.messages = mysql_core_1.mysqlTable("messages", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    conversationId: mysql_core_1.varchar({ length: 64 }).notNull(),
    senderId: mysql_core_1.varchar({ length: 64 }).notNull(),
    messageType: mysql_core_1.mysqlEnum(['text', 'image', 'file', 'system'])["default"]('text').notNull(),
    content: mysql_core_1.longtext().notNull(),
    fileUrl: mysql_core_1.varchar({ length: 500 }),
    fileName: mysql_core_1.varchar({ length: 255 }),
    fileSize: mysql_core_1.int(),
    mimeType: mysql_core_1.varchar({ length: 100 }),
    isEdited: mysql_core_1.tinyint()["default"](0),
    editedAt: mysql_core_1.timestamp({ mode: 'string' }),
    isDeleted: mysql_core_1.tinyint()["default"](0),
    deletedAt: mysql_core_1.timestamp({ mode: 'string' }),
    reactions: mysql_core_1.json(),
    encryptionIv: mysql_core_1.varchar({ length: 255 }),
    encryptionTag: mysql_core_1.varchar({ length: 255 }),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow()
}, function (table) { return [
    mysql_core_1.index("idx_conversation_id").on(table.conversationId),
    mysql_core_1.index("idx_sender_id").on(table.senderId),
    mysql_core_1.index("idx_created_at").on(table.createdAt),
]; });
exports.conversations = mysql_core_1.mysqlTable("conversations", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    type: mysql_core_1.mysqlEnum(['direct', 'group', 'channel'])["default"]('direct').notNull(),
    name: mysql_core_1.varchar({ length: 255 }),
    description: mysql_core_1.text(),
    conversationIcon: mysql_core_1.varchar({ length: 500 }),
    createdBy: mysql_core_1.varchar({ length: 64 }).notNull(),
    isArchived: mysql_core_1.tinyint()["default"](0),
    archivedAt: mysql_core_1.timestamp({ mode: 'string' }),
    isEncrypted: mysql_core_1.tinyint()["default"](1).notNull(),
    encryptionKey: mysql_core_1.varchar({ length: 255 }),
    lastMessageAt: mysql_core_1.timestamp({ mode: 'string' }),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow(),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_type").on(table.type),
    mysql_core_1.index("idx_created_by").on(table.createdBy),
    mysql_core_1.index("idx_archived").on(table.isArchived),
]; });
// ── Organization / Multi-Tenancy Tables ─────────────────────────────────────
exports.organizations = mysql_core_1.mysqlTable("organizations", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    name: mysql_core_1.varchar({ length: 255 }).notNull(),
    slug: mysql_core_1.varchar({ length: 100 }).notNull(),
    plan: mysql_core_1.varchar({ length: 50 }).notNull()["default"]('trial'),
    isActive: mysql_core_1.tinyint()["default"](1).notNull(),
    isArchived: mysql_core_1.tinyint()["default"](0).notNull(),
    archivedAt: mysql_core_1.timestamp({ mode: 'string' }),
    archivedBy: mysql_core_1.varchar({ length: 64 }),
    maxUsers: mysql_core_1.int()["default"](10),
    settings: mysql_core_1.json(),
    logoUrl: mysql_core_1.longtext(),
    domain: mysql_core_1.varchar({ length: 255 }),
    contactEmail: mysql_core_1.varchar({ length: 320 }),
    contactPhone: mysql_core_1.varchar({ length: 50 }),
    address: mysql_core_1.text(),
    country: mysql_core_1.varchar({ length: 100 }),
    industry: mysql_core_1.varchar({ length: 100 }),
    website: mysql_core_1.varchar({ length: 255 }),
    taxId: mysql_core_1.varchar({ length: 100 }),
    billingEmail: mysql_core_1.varchar({ length: 320 }),
    timezone: mysql_core_1.varchar({ length: 100 })["default"]('Africa/Nairobi'),
    currency: mysql_core_1.varchar({ length: 10 })["default"]('KES'),
    description: mysql_core_1.text(),
    employeeCount: mysql_core_1.int(),
    registrationNumber: mysql_core_1.varchar({ length: 100 }),
    paymentMethod: mysql_core_1.varchar({ length: 50 }),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow(),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_org_slug").on(table.slug),
    mysql_core_1.index("idx_org_active").on(table.isActive),
    mysql_core_1.index("idx_org_archived").on(table.isArchived),
    mysql_core_1.index("idx_org_industry").on(table.industry),
]; });
exports.organizationFeatures = mysql_core_1.mysqlTable("organizationFeatures", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar({ length: 64 }).notNull(),
    featureKey: mysql_core_1.varchar({ length: 100 }).notNull(),
    isEnabled: mysql_core_1.tinyint()["default"](1).notNull(),
    config: mysql_core_1.json(),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_orgfeat_org").on(table.organizationId),
    mysql_core_1.index("idx_orgfeat_key").on(table.featureKey),
]; });
// ============================================================================
// ORGANIZATION USERS: Enterprise/Multitenancy User Management
// ============================================================================
exports.organizationUsers = mysql_core_1.mysqlTable("organizationUsers", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar({ length: 64 }).notNull(),
    name: mysql_core_1.varchar({ length: 255 }).notNull(),
    email: mysql_core_1.varchar({ length: 320 }).notNull(),
    role: mysql_core_1.mysqlEnum(['super_admin', 'admin', 'manager', 'staff', 'viewer', 'ict_manager', 'project_manager', 'hr', 'accountant', 'procurement_manager', 'sales_manager'])["default"]('staff').notNull(),
    position: mysql_core_1.varchar({ length: 100 }),
    department: mysql_core_1.varchar({ length: 100 }),
    phone: mysql_core_1.varchar({ length: 20 }),
    photoUrl: mysql_core_1.longtext(),
    isActive: mysql_core_1.tinyint()["default"](1).notNull(),
    invitationSent: mysql_core_1.tinyint()["default"](0).notNull(),
    invitationSentAt: mysql_core_1.timestamp({ mode: 'string' }),
    invitationAcceptedAt: mysql_core_1.timestamp({ mode: 'string' }),
    lastSignedIn: mysql_core_1.timestamp({ mode: 'string' }),
    loginCount: mysql_core_1.int()["default"](0),
    createdBy: mysql_core_1.varchar({ length: 64 }).notNull(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow(),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_orgusers_org").on(table.organizationId),
    mysql_core_1.index("idx_orgusers_email").on(table.email),
    mysql_core_1.index("idx_orgusers_role").on(table.role),
    mysql_core_1.index("idx_orgusers_active").on(table.isActive),
    mysql_core_1.index("idx_orgusers_created_by").on(table.createdBy),
]; });
exports.tenantMessages = mysql_core_1.mysqlTable("tenantMessages", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    senderId: mysql_core_1.varchar({ length: 64 }).notNull(),
    subject: mysql_core_1.varchar({ length: 500 }).notNull(),
    content: mysql_core_1.longtext().notNull(),
    priority: mysql_core_1.varchar({ length: 20 })["default"]('normal'),
    targetType: mysql_core_1.varchar({ length: 20 })["default"]('all'),
    targetOrgId: mysql_core_1.varchar({ length: 64 }),
    targetUserId: mysql_core_1.varchar({ length: 64 }),
    isRead: mysql_core_1.tinyint()["default"](0),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow()
}, function (table) { return [
    mysql_core_1.index("idx_tmsg_sender").on(table.senderId),
]; });
exports.pricingTierFeatures = mysql_core_1.mysqlTable("pricingTierFeatures", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    tier: mysql_core_1.varchar({ length: 50 }).notNull(),
    featureKey: mysql_core_1.varchar({ length: 100 }).notNull(),
    isEnabled: mysql_core_1.tinyint()["default"](1).notNull(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow()
}, function (table) { return [
    mysql_core_1.index("idx_ptf_tier").on(table.tier),
]; });
exports.conversationMembers = mysql_core_1.mysqlTable("conversationMembers", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    conversationId: mysql_core_1.varchar({ length: 64 }).notNull(),
    userId: mysql_core_1.varchar({ length: 64 }).notNull(),
    role: mysql_core_1.mysqlEnum(['member', 'moderator', 'admin'])["default"]('member').notNull(),
    joinedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow(),
    leftAt: mysql_core_1.timestamp({ mode: 'string' }),
    lastReadAt: mysql_core_1.timestamp({ mode: 'string' }),
    unreadCount: mysql_core_1.int()["default"](0),
    isMuted: mysql_core_1.tinyint()["default"](0),
    isActive: mysql_core_1.tinyint()["default"](1).notNull()
}, function (table) { return [
    mysql_core_1.index("idx_conversation_id").on(table.conversationId),
    mysql_core_1.index("idx_user_id").on(table.userId),
]; });
exports.messageReadReceipts = mysql_core_1.mysqlTable("messageReadReceipts", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    messageId: mysql_core_1.varchar({ length: 64 }).notNull(),
    userId: mysql_core_1.varchar({ length: 64 }).notNull(),
    readAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow()
}, function (table) { return [
    mysql_core_1.index("idx_message_id").on(table.messageId),
    mysql_core_1.index("idx_user_id").on(table.userId),
]; });
// ============================================================================
// TICKETS & SUPPORT: Issue Tracking
// ============================================================================
exports.tickets = mysql_core_1.mysqlTable("tickets", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar({ length: 64 }),
    ticketNumber: mysql_core_1.varchar({ length: 50 }).notNull().unique(),
    title: mysql_core_1.varchar({ length: 500 }).notNull(),
    description: mysql_core_1.longtext().notNull(),
    category: mysql_core_1.mysqlEnum(['support', 'billing', 'feature_request', 'bug', 'security', 'general']).notNull(),
    priority: mysql_core_1.mysqlEnum(['low', 'normal', 'high', 'urgent'])["default"]('normal').notNull(),
    status: mysql_core_1.mysqlEnum(['open', 'in_progress', 'on_hold', 'resolved', 'closed', 'reopened'])["default"]('open').notNull(),
    createdBy: mysql_core_1.varchar({ length: 64 }).notNull(),
    assignedTo: mysql_core_1.varchar({ length: 64 }),
    department: mysql_core_1.varchar({ length: 100 }),
    resolution: mysql_core_1.text(),
    solutionUrl: mysql_core_1.varchar({ length: 500 }),
    attachments: mysql_core_1.json(),
    relatedTickets: mysql_core_1.json(),
    firstResponseAt: mysql_core_1.timestamp({ mode: 'string' }),
    resolvedAt: mysql_core_1.timestamp({ mode: 'string' }),
    closedAt: mysql_core_1.timestamp({ mode: 'string' }),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow(),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_ticket_number").on(table.ticketNumber),
    mysql_core_1.index("idx_status").on(table.status),
    mysql_core_1.index("idx_created_by").on(table.createdBy),
    mysql_core_1.index("idx_assigned_to").on(table.assignedTo),
    mysql_core_1.index("idx_priority").on(table.priority),
]; });
exports.ticketResponses = mysql_core_1.mysqlTable("ticketResponses", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    ticketId: mysql_core_1.varchar({ length: 64 }).notNull(),
    responderId: mysql_core_1.varchar({ length: 64 }).notNull(),
    responseType: mysql_core_1.mysqlEnum(['comment', 'resolution', 'escalation'])["default"]('comment').notNull(),
    content: mysql_core_1.longtext().notNull(),
    attachments: mysql_core_1.json(),
    isInternal: mysql_core_1.tinyint()["default"](0),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow(),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_ticket_id").on(table.ticketId),
    mysql_core_1.index("idx_responder_id").on(table.responderId),
]; });
// ============================================================================
// RECURRING INVOICES: Automation
// ============================================================================
exports.recurringInvoiceTemplates = mysql_core_1.mysqlTable("recurringInvoiceTemplates", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    clientId: mysql_core_1.varchar({ length: 64 }).notNull(),
    invoiceName: mysql_core_1.varchar({ length: 255 }).notNull(),
    description: mysql_core_1.text(),
    frequency: mysql_core_1.mysqlEnum(['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'semi_annual', 'annual']).notNull(),
    startDate: mysql_core_1.datetime({ mode: 'string' }).notNull(),
    endDate: mysql_core_1.datetime({ mode: 'string' }),
    nextInvoiceDate: mysql_core_1.datetime({ mode: 'string' }).notNull(),
    items: mysql_core_1.json(),
    taxRate: mysql_core_1.decimal({ precision: 5, scale: 2 })["default"]('0'),
    discount: mysql_core_1.decimal({ precision: 5, scale: 2 })["default"]('0'),
    discountType: mysql_core_1.mysqlEnum(['percentage', 'fixed'])["default"]('percentage'),
    notes: mysql_core_1.text(),
    paymentTerms: mysql_core_1.int(),
    autoSend: mysql_core_1.tinyint()["default"](1).notNull(),
    autoCreateReceipt: mysql_core_1.tinyint()["default"](1).notNull(),
    isActive: mysql_core_1.tinyint()["default"](1).notNull(),
    createdBy: mysql_core_1.varchar({ length: 64 }).notNull(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow(),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_client_id").on(table.clientId),
    mysql_core_1.index("idx_next_invoice_date").on(table.nextInvoiceDate),
    mysql_core_1.index("idx_is_active").on(table.isActive),
]; });
exports.automatedReceipts = mysql_core_1.mysqlTable("automatedReceipts", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    invoiceId: mysql_core_1.varchar({ length: 64 }).notNull(),
    receiptNumber: mysql_core_1.varchar({ length: 50 }).notNull().unique(),
    amountReceived: mysql_core_1.decimal({ precision: 10, scale: 2 }).notNull(),
    amountOutstanding: mysql_core_1.decimal({ precision: 10, scale: 2 })["default"]('0'),
    paymentStatus: mysql_core_1.mysqlEnum(['partial', 'full']).notNull(),
    paymentMethod: mysql_core_1.varchar({ length: 50 }),
    paymentReference: mysql_core_1.varchar({ length: 255 }),
    autoGenerated: mysql_core_1.tinyint()["default"](1).notNull(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow()
}, function (table) { return [
    mysql_core_1.index("idx_invoice_id").on(table.invoiceId),
    mysql_core_1.index("idx_receipt_number").on(table.receiptNumber),
]; });
// ============================================================================
// EMAIL CAMPAIGN & COMMUNICATION TRACKING
// ============================================================================
exports.emailCampaigns = mysql_core_1.mysqlTable("emailCampaigns", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    campaignName: mysql_core_1.varchar({ length: 255 }).notNull(),
    subject: mysql_core_1.varchar({ length: 500 }).notNull(),
    bodyHtml: mysql_core_1.longtext().notNull(),
    bodyText: mysql_core_1.longtext(),
    fromEmail: mysql_core_1.varchar({ length: 320 }).notNull(),
    fromName: mysql_core_1.varchar({ length: 255 }),
    recipientCount: mysql_core_1.int()["default"](0),
    sentCount: mysql_core_1.int()["default"](0),
    openCount: mysql_core_1.int()["default"](0),
    clickCount: mysql_core_1.int()["default"](0),
    failureCount: mysql_core_1.int()["default"](0),
    status: mysql_core_1.mysqlEnum(['draft', 'scheduled', 'sending', 'sent', 'failed', 'paused'])["default"]('draft').notNull(),
    scheduledFor: mysql_core_1.timestamp({ mode: 'string' }),
    startedAt: mysql_core_1.timestamp({ mode: 'string' }),
    completedAt: mysql_core_1.timestamp({ mode: 'string' }),
    createdBy: mysql_core_1.varchar({ length: 64 }).notNull(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow()
}, function (table) { return [
    mysql_core_1.index("idx_status").on(table.status),
    mysql_core_1.index("idx_created_by").on(table.createdBy),
]; });
exports.emailLogs = mysql_core_1.mysqlTable("emailLogs", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    campaignId: mysql_core_1.varchar({ length: 64 }),
    recipientEmail: mysql_core_1.varchar({ length: 320 }).notNull(),
    userId: mysql_core_1.varchar({ length: 64 }),
    subject: mysql_core_1.varchar({ length: 500 }).notNull(),
    status: mysql_core_1.mysqlEnum(['pending', 'sent', 'bounced', 'failed', 'opened', 'clicked'])["default"]('pending').notNull(),
    provider: mysql_core_1.varchar({ length: 50 }),
    providerMessageId: mysql_core_1.varchar({ length: 255 }),
    sentAt: mysql_core_1.timestamp({ mode: 'string' }),
    failureReason: mysql_core_1.text(),
    openedAt: mysql_core_1.timestamp({ mode: 'string' }),
    clickedAt: mysql_core_1.timestamp({ mode: 'string' }),
    metadata: mysql_core_1.json(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow()
}, function (table) { return [
    mysql_core_1.index("idx_campaign_id").on(table.campaignId),
    mysql_core_1.index("idx_recipient_email").on(table.recipientEmail),
    mysql_core_1.index("idx_status").on(table.status),
]; });
// ─── Work Orders ──────────────────────────────────────────────
exports.workOrders = mysql_core_1.mysqlTable("workOrders", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar({ length: 64 }),
    workOrderNumber: mysql_core_1.varchar({ length: 50 }).notNull(),
    issueDate: mysql_core_1.varchar({ length: 30 }).notNull(),
    description: mysql_core_1.text().notNull(),
    assignedTo: mysql_core_1.varchar({ length: 200 }).notNull(),
    priority: mysql_core_1.mysqlEnum(["low", "medium", "high", "critical"])["default"]("medium").notNull(),
    startDate: mysql_core_1.varchar({ length: 30 }).notNull(),
    targetEndDate: mysql_core_1.varchar({ length: 30 }).notNull(),
    laborCost: mysql_core_1.int()["default"](0).notNull(),
    serviceCost: mysql_core_1.int()["default"](0).notNull(),
    total: mysql_core_1.int()["default"](0).notNull(),
    notes: mysql_core_1.text(),
    status: mysql_core_1.mysqlEnum(["draft", "open", "in-progress", "completed", "cancelled"])["default"]("draft").notNull(),
    createdBy: mysql_core_1.varchar({ length: 64 }).notNull(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow(),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow().onUpdateNow()
});
exports.workOrderMaterials = mysql_core_1.mysqlTable("workOrderMaterials", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    workOrderId: mysql_core_1.varchar({ length: 64 }).notNull(),
    description: mysql_core_1.text().notNull(),
    quantity: mysql_core_1.int()["default"](1).notNull(),
    unitCost: mysql_core_1.int()["default"](0).notNull(),
    total: mysql_core_1.int()["default"](0).notNull(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow()
}, function (table) { return [
    mysql_core_1.index("idx_wom_workorder").on(table.workOrderId),
]; });
// ─── Service Invoices ─────────────────────────────────────────
exports.serviceInvoices = mysql_core_1.mysqlTable("serviceInvoices", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar({ length: 64 }),
    serviceInvoiceNumber: mysql_core_1.varchar({ length: 50 }).notNull(),
    issueDate: mysql_core_1.varchar({ length: 30 }).notNull(),
    dueDate: mysql_core_1.varchar({ length: 30 }).notNull(),
    clientId: mysql_core_1.varchar({ length: 64 }).notNull(),
    clientName: mysql_core_1.varchar({ length: 200 }).notNull(),
    serviceDescription: mysql_core_1.text().notNull(),
    total: mysql_core_1.int()["default"](0).notNull(),
    taxAmount: mysql_core_1.int()["default"](0).notNull(),
    notes: mysql_core_1.text(),
    status: mysql_core_1.mysqlEnum(["draft", "sent", "accepted", "paid", "cancelled"])["default"]("draft").notNull(),
    createdBy: mysql_core_1.varchar({ length: 64 }).notNull(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow(),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_si_client").on(table.clientId),
    mysql_core_1.index("idx_si_status").on(table.status),
]; });
exports.serviceInvoiceItems = mysql_core_1.mysqlTable("serviceInvoiceItems", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    serviceInvoiceId: mysql_core_1.varchar({ length: 64 }).notNull(),
    description: mysql_core_1.text().notNull(),
    quantity: mysql_core_1.int()["default"](1).notNull(),
    unitPrice: mysql_core_1.int()["default"](0).notNull(),
    total: mysql_core_1.int()["default"](0).notNull(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow()
}, function (table) { return [
    mysql_core_1.index("idx_sii_invoice").on(table.serviceInvoiceId),
]; });
// ─── Contacts ─────────────────────────────────────────────────
exports.contacts = mysql_core_1.mysqlTable("contacts", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar({ length: 64 }),
    clientId: mysql_core_1.varchar({ length: 64 }),
    salutation: mysql_core_1.varchar({ length: 20 }),
    firstName: mysql_core_1.varchar({ length: 100 }).notNull(),
    lastName: mysql_core_1.varchar({ length: 100 }).notNull(),
    email: mysql_core_1.varchar({ length: 320 }),
    phone: mysql_core_1.varchar({ length: 50 }),
    mobile: mysql_core_1.varchar({ length: 50 }),
    jobTitle: mysql_core_1.varchar({ length: 200 }),
    department: mysql_core_1.varchar({ length: 200 }),
    isPrimary: mysql_core_1.tinyint()["default"](0),
    notes: mysql_core_1.text(),
    address: mysql_core_1.text(),
    city: mysql_core_1.varchar({ length: 100 }),
    country: mysql_core_1.varchar({ length: 100 }),
    postalCode: mysql_core_1.varchar({ length: 20 }),
    linkedIn: mysql_core_1.varchar({ length: 500 }),
    createdBy: mysql_core_1.varchar({ length: 64 }).notNull(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow(),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_contacts_client").on(table.clientId),
    mysql_core_1.index("idx_contacts_email").on(table.email),
]; });
// ─── Quotations (Procurement) ─────────────────────────────────
exports.quotations = mysql_core_1.mysqlTable("quotations", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar({ length: 64 }),
    rfqNo: mysql_core_1.varchar({ length: 50 }).notNull(),
    supplier: mysql_core_1.varchar({ length: 200 }).notNull(),
    description: mysql_core_1.text(),
    amount: mysql_core_1.int()["default"](0).notNull(),
    dueDate: mysql_core_1.varchar({ length: 30 }),
    status: mysql_core_1.mysqlEnum(["draft", "submitted", "under_review", "approved", "rejected"])["default"]("draft").notNull(),
    createdBy: mysql_core_1.varchar({ length: 64 }).notNull(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow(),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_quot_status").on(table.status),
    mysql_core_1.index("idx_quot_rfq").on(table.rfqNo),
]; });
// ─── Goods Received Notes (GRN) ──────────────────────────────
exports.grnRecords = mysql_core_1.mysqlTable("grnRecords", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar({ length: 64 }),
    grnNo: mysql_core_1.varchar({ length: 50 }).notNull(),
    supplier: mysql_core_1.varchar({ length: 200 }).notNull(),
    invNo: mysql_core_1.varchar({ length: 50 }),
    receivedDate: mysql_core_1.varchar({ length: 30 }).notNull(),
    items: mysql_core_1.int()["default"](0).notNull(),
    value: mysql_core_1.int()["default"](0).notNull(),
    status: mysql_core_1.mysqlEnum(["accepted", "partial", "rejected", "pending"])["default"]("pending").notNull(),
    notes: mysql_core_1.text(),
    createdBy: mysql_core_1.varchar({ length: 64 }).notNull(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow(),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_grn_status").on(table.status),
    mysql_core_1.index("idx_grn_supplier").on(table.supplier),
]; });
// ─── Delivery Notes ───────────────────────────────────────────
exports.deliveryNotes = mysql_core_1.mysqlTable("deliveryNotes", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    dnNo: mysql_core_1.varchar({ length: 50 }).notNull(),
    supplier: mysql_core_1.varchar({ length: 200 }).notNull(),
    orderId: mysql_core_1.varchar({ length: 64 }),
    deliveryDate: mysql_core_1.varchar({ length: 30 }).notNull(),
    items: mysql_core_1.int()["default"](0).notNull(),
    status: mysql_core_1.mysqlEnum(["pending", "partial", "delivered", "cancelled"])["default"]("pending").notNull(),
    notes: mysql_core_1.text(),
    createdBy: mysql_core_1.varchar({ length: 64 }).notNull(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow(),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_dn_status").on(table.status),
    mysql_core_1.index("idx_dn_order").on(table.orderId),
]; });
// ==================== ASSETS ====================
exports.assets = mysql_core_1.mysqlTable("assets", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    name: mysql_core_1.varchar({ length: 200 }).notNull(),
    category: mysql_core_1.varchar({ length: 100 }).notNull(),
    location: mysql_core_1.varchar({ length: 200 }).notNull(),
    value: mysql_core_1.int()["default"](0).notNull(),
    assignedTo: mysql_core_1.varchar({ length: 200 }),
    serialNumber: mysql_core_1.varchar({ length: 100 }),
    purchaseDate: mysql_core_1.varchar({ length: 30 }),
    status: mysql_core_1.mysqlEnum(["active", "inactive", "maintenance", "disposed"])["default"]("active").notNull(),
    notes: mysql_core_1.text(),
    createdBy: mysql_core_1.varchar({ length: 64 }).notNull(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow(),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_assets_status").on(table.status),
    mysql_core_1.index("idx_assets_category").on(table.category),
]; });
// ==================== CONTRACTS ====================
exports.contracts = mysql_core_1.mysqlTable("contracts", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar({ length: 64 }),
    contractNumber: mysql_core_1.varchar({ length: 50 }),
    name: mysql_core_1.varchar({ length: 200 }).notNull(),
    vendor: mysql_core_1.varchar({ length: 200 }).notNull(),
    startDate: mysql_core_1.varchar({ length: 30 }).notNull(),
    endDate: mysql_core_1.varchar({ length: 30 }).notNull(),
    value: mysql_core_1.int()["default"](0).notNull(),
    status: mysql_core_1.mysqlEnum(["draft", "active", "expired", "terminated"])["default"]("draft").notNull(),
    contractType: mysql_core_1.varchar({ length: 100 }),
    description: mysql_core_1.text(),
    notes: mysql_core_1.text(),
    createdBy: mysql_core_1.varchar({ length: 64 }).notNull(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow(),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_contracts_status").on(table.status),
    mysql_core_1.index("idx_contracts_vendor").on(table.vendor),
]; });
// ==================== WARRANTIES ====================
exports.warranties = mysql_core_1.mysqlTable("warranties", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar({ length: 64 }),
    product: mysql_core_1.varchar({ length: 200 }).notNull(),
    vendor: mysql_core_1.varchar({ length: 200 }).notNull(),
    expiryDate: mysql_core_1.varchar({ length: 30 }).notNull(),
    coverage: mysql_core_1.varchar({ length: 500 }).notNull(),
    status: mysql_core_1.mysqlEnum(["active", "expiring_soon", "expired"])["default"]("active").notNull(),
    serialNumber: mysql_core_1.varchar({ length: 100 }),
    claimTerms: mysql_core_1.text(),
    notes: mysql_core_1.text(),
    createdBy: mysql_core_1.varchar({ length: 64 }).notNull(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow(),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_warranties_status").on(table.status),
    mysql_core_1.index("idx_warranties_vendor").on(table.vendor),
]; });
// ============ Notes ============
exports.notes = mysql_core_1.mysqlTable("notes", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    title: mysql_core_1.varchar({ length: 300 }).notNull(),
    content: mysql_core_1.text(),
    category: mysql_core_1.varchar({ length: 100 })["default"]("General").notNull(),
    pinned: mysql_core_1.tinyint()["default"](0).notNull(),
    favorite: mysql_core_1.tinyint()["default"](0).notNull(),
    createdBy: mysql_core_1.varchar({ length: 64 }).notNull(),
    organizationId: mysql_core_1.varchar({ length: 64 }),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow(),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_notes_created_by").on(table.createdBy),
    mysql_core_1.index("idx_notes_category").on(table.category),
]; });
// ============ Custom Reports ============
exports.customReports = mysql_core_1.mysqlTable("custom_reports", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    name: mysql_core_1.varchar("name", { length: 200 }).notNull(),
    description: mysql_core_1.text("description"),
    category: mysql_core_1.varchar("category", { length: 100 }).notNull(),
    dataSources: mysql_core_1.text("dataSources"),
    layout: mysql_core_1.text("layout"),
    format: mysql_core_1.mysqlEnum("format", ["PDF", "Excel", "CSV", "HTML"]).notNull()["default"]("PDF"),
    isTemplate: mysql_core_1.tinyint("isTemplate").notNull()["default"](0),
    status: mysql_core_1.mysqlEnum("status", ["draft", "active", "archived"]).notNull()["default"]("draft"),
    owner: mysql_core_1.varchar("owner", { length: 200 }),
    createdBy: mysql_core_1.varchar("createdBy", { length: 64 }).notNull(),
    createdAt: mysql_core_1.timestamp("createdAt").defaultNow(),
    updatedAt: mysql_core_1.timestamp("updatedAt").defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_custom_reports_category").on(table.category),
    mysql_core_1.index("idx_custom_reports_status").on(table.status),
]; });
// ============================================================================
// ACCOUNTING AUTOMATION TABLES
// ============================================================================
exports.organizationAccountingPolicies = mysql_core_1.mysqlTable("organizationAccountingPolicies", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar({ length: 64 }).notNull(),
    country: mysql_core_1.varchar({ length: 10 })["default"]('KE').notNull(),
    fiscalYearStart: mysql_core_1.varchar({ length: 5 })["default"]('01-01').notNull(),
    fiscalYearEnd: mysql_core_1.varchar({ length: 5 })["default"]('12-31').notNull(),
    accountingMethod: mysql_core_1.mysqlEnum(['accrual', 'cash'])["default"]('accrual').notNull(),
    defaultCurrency: mysql_core_1.varchar({ length: 3 })["default"]('KES').notNull(),
    taxInclusiveInvoicing: mysql_core_1.tinyint()["default"](1).notNull(),
    autoReconciliation: mysql_core_1.tinyint()["default"](0).notNull(),
    requireInvoiceApproval: mysql_core_1.tinyint()["default"](1).notNull(),
    requireExpenseApproval: mysql_core_1.tinyint()["default"](1).notNull(),
    defaultPaymentTerms: mysql_core_1.varchar({ length: 20 })["default"]('net30'),
    depreciationMethod: mysql_core_1.mysqlEnum(['straight_line', 'declining_balance', 'units_of_production'])["default"]('straight_line'),
    capitalizedAssetThreshold: mysql_core_1.int()["default"](50000),
    roundingMethod: mysql_core_1.mysqlEnum(['round', 'truncate'])["default"]('round'),
    retentionPeriod: mysql_core_1.int()["default"](7),
    auditTrailRequired: mysql_core_1.tinyint()["default"](1).notNull(),
    allowManualJournalEntries: mysql_core_1.tinyint()["default"](1).notNull(),
    createdBy: mysql_core_1.varchar({ length: 64 }).notNull(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).notNull(),
    updatedBy: mysql_core_1.varchar({ length: 64 }),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' })
}, function (table) { return [
    mysql_core_1.index("idx_org").on(table.organizationId),
    mysql_core_1.index("idx_country").on(table.country),
]; });
exports.imprests = mysql_core_1.mysqlTable("imprests", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar({ length: 64 }).notNull(),
    imprestNumber: mysql_core_1.varchar({ length: 50 }).notNull(),
    employeeId: mysql_core_1.varchar({ length: 64 }).notNull(),
    employeeName: mysql_core_1.varchar({ length: 255 }).notNull(),
    amount: mysql_core_1.int().notNull(),
    purpose: mysql_core_1.varchar({ length: 255 }).notNull(),
    requestDate: mysql_core_1.datetime({ mode: 'string' }).notNull(),
    status: mysql_core_1.mysqlEnum(['pending', 'approved', 'disbursed', 'settled', 'cancelled'])["default"]('pending').notNull(),
    approvedBy: mysql_core_1.varchar({ length: 64 }),
    approvedAt: mysql_core_1.datetime({ mode: 'string' }),
    disbursedAt: mysql_core_1.datetime({ mode: 'string' }),
    settledAt: mysql_core_1.datetime({ mode: 'string' }),
    notes: mysql_core_1.text(),
    createdBy: mysql_core_1.varchar({ length: 64 }).notNull(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).notNull(),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' })
}, function (table) { return [
    mysql_core_1.index("idx_org").on(table.organizationId),
    mysql_core_1.index("idx_employee").on(table.employeeId),
    mysql_core_1.index("idx_status").on(table.status),
]; });
exports.imprestSurrenders = mysql_core_1.mysqlTable("imprestSurrenders", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    imprestId: mysql_core_1.varchar({ length: 64 }).notNull(),
    totalExpensed: mysql_core_1.int().notNull(),
    variance: mysql_core_1.int(),
    returnedAmount: mysql_core_1.int(),
    status: mysql_core_1.mysqlEnum(['settled', 'variance_pending', 'under_review'])["default"]('settled').notNull(),
    settledBy: mysql_core_1.varchar({ length: 64 }).notNull(),
    settledAt: mysql_core_1.datetime({ mode: 'string' }).notNull(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).notNull()
}, function (table) { return [
    mysql_core_1.index("idx_imprest").on(table.imprestId),
]; });
exports.purchaseOrders = mysql_core_1.mysqlTable("purchaseOrders", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar({ length: 64 }).notNull(),
    poNumber: mysql_core_1.varchar({ length: 50 }).notNull(),
    supplierId: mysql_core_1.varchar({ length: 64 }).notNull(),
    supplierName: mysql_core_1.varchar({ length: 255 }).notNull(),
    poDate: mysql_core_1.datetime({ mode: 'string' }).notNull(),
    deliveryDate: mysql_core_1.datetime({ mode: 'string' }),
    subtotal: mysql_core_1.int().notNull(),
    taxAmount: mysql_core_1.int()["default"](0),
    total: mysql_core_1.int().notNull(),
    status: mysql_core_1.mysqlEnum(['draft', 'approved', 'received', 'partially_received', 'cancelled'])["default"]('draft').notNull(),
    approvedBy: mysql_core_1.varchar({ length: 64 }),
    approvedAt: mysql_core_1.datetime({ mode: 'string' }),
    receivedAt: mysql_core_1.datetime({ mode: 'string' }),
    notes: mysql_core_1.text(),
    createdBy: mysql_core_1.varchar({ length: 64 }).notNull(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).notNull(),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' })
}, function (table) { return [
    mysql_core_1.index("idx_org").on(table.organizationId),
    mysql_core_1.index("idx_supplier").on(table.supplierId),
    mysql_core_1.index("idx_status").on(table.status),
]; });
exports.purchaseOrderItems = mysql_core_1.mysqlTable("purchaseOrderItems", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    purchaseOrderId: mysql_core_1.varchar({ length: 64 }).notNull(),
    description: mysql_core_1.varchar({ length: 255 }).notNull(),
    quantity: mysql_core_1.int().notNull(),
    rate: mysql_core_1.int().notNull(),
    amount: mysql_core_1.int().notNull(),
    lineNumber: mysql_core_1.int(),
    createdBy: mysql_core_1.varchar({ length: 64 }).notNull(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).notNull()
}, function (table) { return [
    mysql_core_1.index("idx_po").on(table.purchaseOrderId),
]; });
exports.goodsReceiptNotes = mysql_core_1.mysqlTable("goodsReceiptNotes", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar({ length: 64 }).notNull(),
    grno: mysql_core_1.varchar({ length: 50 }).notNull(),
    purchaseOrderId: mysql_core_1.varchar({ length: 64 }).notNull(),
    receivedDate: mysql_core_1.datetime({ mode: 'string' }).notNull(),
    totalQuantity: mysql_core_1.int(),
    notes: mysql_core_1.text(),
    createdBy: mysql_core_1.varchar({ length: 64 }).notNull(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).notNull()
}, function (table) { return [
    mysql_core_1.index("idx_org").on(table.organizationId),
    mysql_core_1.index("idx_po").on(table.purchaseOrderId),
]; });
exports.leads = mysql_core_1.mysqlTable("leads", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar({ length: 64 }).notNull(),
    leadNo: mysql_core_1.varchar({ length: 50 }).notNull(),
    companyName: mysql_core_1.varchar({ length: 255 }).notNull(),
    contactName: mysql_core_1.varchar({ length: 255 }).notNull(),
    email: mysql_core_1.varchar({ length: 320 }),
    phone: mysql_core_1.varchar({ length: 20 }),
    source: mysql_core_1.mysqlEnum(['website', 'referral', 'social_media', 'cold_outreach', 'event', 'trade_show', 'other']).notNull(),
    estimatedValue: mysql_core_1.int()["default"](0),
    currency: mysql_core_1.varchar({ length: 3 })["default"]('KES'),
    country: mysql_core_1.varchar({ length: 10 }),
    industry: mysql_core_1.varchar({ length: 100 }),
    status: mysql_core_1.mysqlEnum(['new', 'contacted', 'qualified', 'proposal_sent', 'negotiating', 'closed_won', 'closed_lost'])["default"]('new').notNull(),
    assignedTo: mysql_core_1.varchar({ length: 64 }),
    notes: mysql_core_1.text(),
    createdBy: mysql_core_1.varchar({ length: 64 }).notNull(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).notNull(),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' })
}, function (table) { return [
    mysql_core_1.index("idx_org").on(table.organizationId),
    mysql_core_1.index("idx_status").on(table.status),
    mysql_core_1.index("idx_source").on(table.source),
]; });
exports.bankReconciliationStatements = mysql_core_1.mysqlTable("bankReconciliationStatements", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar({ length: 64 }).notNull(),
    bankAccountId: mysql_core_1.varchar({ length: 64 }).notNull(),
    statementDate: mysql_core_1.datetime({ mode: 'string' }).notNull(),
    openingBalance: mysql_core_1.int(),
    closingBalance: mysql_core_1.int(),
    status: mysql_core_1.mysqlEnum(['pending', 'reconciled', 'variance_identified'])["default"]('pending').notNull(),
    reconciliationNotes: mysql_core_1.text(),
    reconcililedBy: mysql_core_1.varchar({ length: 64 }),
    reconcililedAt: mysql_core_1.datetime({ mode: 'string' }),
    createdBy: mysql_core_1.varchar({ length: 64 }).notNull(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).notNull(),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' })
}, function (table) { return [
    mysql_core_1.index("idx_org").on(table.organizationId),
    mysql_core_1.index("idx_date").on(table.statementDate),
    mysql_core_1.index("idx_status").on(table.status),
]; });
exports.bankReconciliationDetails = mysql_core_1.mysqlTable("bankReconciliationDetails", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    statementId: mysql_core_1.varchar({ length: 64 }).notNull(),
    transactionId: mysql_core_1.varchar({ length: 64 }),
    transactionType: mysql_core_1.varchar({ length: 50 }),
    bankDate: mysql_core_1.datetime({ mode: 'string' }).notNull(),
    description: mysql_core_1.varchar({ length: 255 }),
    amount: mysql_core_1.int(),
    matched: mysql_core_1.tinyint()["default"](0).notNull(),
    matchedTransactionId: mysql_core_1.varchar({ length: 64 }),
    matchedAmount: mysql_core_1.int(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).notNull()
}, function (table) { return [
    mysql_core_1.index("idx_statement").on(table.statementId),
    mysql_core_1.index("idx_transaction").on(table.transactionId),
]; });
exports.automationConfigs = mysql_core_1.mysqlTable("automationConfigs", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar({ length: 64 }).notNull(),
    workflowType: mysql_core_1.varchar({ length: 100 }).notNull(),
    enabled: mysql_core_1.tinyint()["default"](1).notNull(),
    configuration: mysql_core_1.json(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).notNull(),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' })
}, function (table) { return [
    mysql_core_1.index("idx_org").on(table.organizationId),
    mysql_core_1.index("idx_workflow").on(table.workflowType),
]; });
exports.workflowAutomationLogs = mysql_core_1.mysqlTable("workflowAutomationLogs", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar({ length: 64 }).notNull(),
    workflowType: mysql_core_1.varchar({ length: 100 }).notNull(),
    sourceEntityId: mysql_core_1.varchar({ length: 64 }),
    sourceEntityType: mysql_core_1.varchar({ length: 50 }),
    targetEntityId: mysql_core_1.varchar({ length: 64 }),
    status: mysql_core_1.mysqlEnum(['pending', 'completed', 'failed'])["default"]('pending').notNull(),
    errorMessage: mysql_core_1.text(),
    executedBy: mysql_core_1.varchar({ length: 64 }),
    executedAt: mysql_core_1.datetime({ mode: 'string' }).notNull(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).notNull()
}, function (table) { return [
    mysql_core_1.index("idx_org").on(table.organizationId),
    mysql_core_1.index("idx_workflow").on(table.workflowType),
    mysql_core_1.index("idx_source").on(table.sourceEntityId),
    mysql_core_1.index("idx_target").on(table.targetEntityId),
    mysql_core_1.index("idx_date").on(table.executedAt),
]; });
// ============ Smart Workflows (Advanced Automation) ============
exports.smartWorkflows = mysql_core_1.mysqlTable("smart_workflows", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    name: mysql_core_1.varchar("name", { length: 200 }).notNull(),
    triggerType: mysql_core_1.varchar("triggerType", { length: 50 }).notNull()["default"]("event"),
    triggerConfig: mysql_core_1.text("triggerConfig"),
    actions: mysql_core_1.text("actions"),
    conditions: mysql_core_1.text("conditions"),
    status: mysql_core_1.varchar("status", { length: 50 }).notNull()["default"]("active"),
    executionCount: mysql_core_1.int("executionCount").notNull()["default"](0),
    lastExecuted: mysql_core_1.timestamp("lastExecuted", { mode: "string" }),
    createdBy: mysql_core_1.varchar("createdBy", { length: 64 }).notNull(),
    createdAt: mysql_core_1.timestamp("createdAt", { mode: "string" }).defaultNow(),
    updatedAt: mysql_core_1.timestamp("updatedAt", { mode: "string" }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_sw_status").on(table.status),
]; });
// ============ Export Jobs (Advanced Export) ============
exports.exportJobs = mysql_core_1.mysqlTable("export_jobs", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    name: mysql_core_1.varchar("name", { length: 200 }),
    dataType: mysql_core_1.varchar("dataType", { length: 100 }).notNull(),
    format: mysql_core_1.varchar("format", { length: 50 }).notNull()["default"]("csv"),
    filters: mysql_core_1.text("filters"),
    status: mysql_core_1.varchar("status", { length: 50 }).notNull()["default"]("processing"),
    fileUrl: mysql_core_1.varchar("fileUrl", { length: 500 }),
    fileSize: mysql_core_1.bigint("fileSize", { mode: "number" }),
    rowsExported: mysql_core_1.int("rowsExported")["default"](0),
    schedule: mysql_core_1.varchar("schedule", { length: 50 }),
    recipients: mysql_core_1.text("recipients"),
    expiresAt: mysql_core_1.timestamp("expiresAt", { mode: "string" }),
    createdBy: mysql_core_1.varchar("createdBy", { length: 64 }).notNull(),
    createdAt: mysql_core_1.timestamp("createdAt", { mode: "string" }).defaultNow(),
    updatedAt: mysql_core_1.timestamp("updatedAt", { mode: "string" }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_ej_status").on(table.status),
]; });
// ============ Security Events (Advanced Security) ============
exports.securityEvents = mysql_core_1.mysqlTable("security_events", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    eventType: mysql_core_1.varchar("eventType", { length: 100 }).notNull(),
    action: mysql_core_1.varchar("action", { length: 200 }),
    severity: mysql_core_1.varchar("severity", { length: 50 }).notNull()["default"]("MEDIUM"),
    resourceId: mysql_core_1.varchar("resourceId", { length: 200 }),
    userId: mysql_core_1.varchar("userId", { length: 64 }),
    details: mysql_core_1.text("details"),
    status: mysql_core_1.varchar("status", { length: 50 }).notNull()["default"]("LOGGED"),
    ipAddress: mysql_core_1.varchar("ipAddress", { length: 100 }),
    createdBy: mysql_core_1.varchar("createdBy", { length: 64 }).notNull(),
    createdAt: mysql_core_1.timestamp("createdAt", { mode: "string" }).defaultNow()
}, function (table) { return [
    mysql_core_1.index("idx_se_type").on(table.eventType),
    mysql_core_1.index("idx_se_severity").on(table.severity),
]; });
// ============ AI Configurations (AI Agents + AIML) ============
exports.aiConfigurations = mysql_core_1.mysqlTable("ai_configurations", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    configType: mysql_core_1.varchar("configType", { length: 100 }).notNull(),
    name: mysql_core_1.varchar("name", { length: 200 }).notNull(),
    model: mysql_core_1.varchar("model", { length: 100 }),
    capabilities: mysql_core_1.text("capabilities"),
    parameters: mysql_core_1.text("parameters"),
    status: mysql_core_1.varchar("status", { length: 50 }).notNull()["default"]("ACTIVE"),
    metrics: mysql_core_1.text("metrics"),
    createdBy: mysql_core_1.varchar("createdBy", { length: 64 }).notNull(),
    createdAt: mysql_core_1.timestamp("createdAt", { mode: "string" }).defaultNow(),
    updatedAt: mysql_core_1.timestamp("updatedAt", { mode: "string" }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_ac_type").on(table.configType),
    mysql_core_1.index("idx_ac_status").on(table.status),
]; });
// ============ API Pricing Configs (API Monetization) ============
exports.apiPricingConfigs = mysql_core_1.mysqlTable("api_pricing_configs", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    apiId: mysql_core_1.varchar("apiId", { length: 100 }),
    name: mysql_core_1.varchar("name", { length: 200 }).notNull(),
    pricingModel: mysql_core_1.varchar("pricingModel", { length: 50 }).notNull()["default"]("FIXED"),
    basePrice: mysql_core_1.decimal("basePrice", { precision: 12, scale: 2 })["default"]("0"),
    currency: mysql_core_1.varchar("currency", { length: 10 }).notNull()["default"]("USD"),
    rateLimit: mysql_core_1.int("rateLimit")["default"](10000),
    config: mysql_core_1.text("config"),
    status: mysql_core_1.varchar("status", { length: 50 }).notNull()["default"]("ACTIVE"),
    createdBy: mysql_core_1.varchar("createdBy", { length: 64 }).notNull(),
    createdAt: mysql_core_1.timestamp("createdAt", { mode: "string" }).defaultNow(),
    updatedAt: mysql_core_1.timestamp("updatedAt", { mode: "string" }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_apc_status").on(table.status),
]; });
// ============ ETL Jobs (Business Intelligence) ============
exports.etlJobs = mysql_core_1.mysqlTable("etl_jobs", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    jobName: mysql_core_1.varchar("jobName", { length: 200 }).notNull(),
    sourceSystem: mysql_core_1.varchar("sourceSystem", { length: 200 }),
    targetTable: mysql_core_1.varchar("targetTable", { length: 200 }),
    schedule: mysql_core_1.varchar("schedule", { length: 100 }),
    status: mysql_core_1.varchar("status", { length: 50 }).notNull()["default"]("PENDING"),
    progress: mysql_core_1.int("progress")["default"](0),
    recordsProcessed: mysql_core_1.int("recordsProcessed")["default"](0),
    config: mysql_core_1.text("config"),
    lastRun: mysql_core_1.timestamp("lastRun", { mode: "string" }),
    createdBy: mysql_core_1.varchar("createdBy", { length: 64 }).notNull(),
    createdAt: mysql_core_1.timestamp("createdAt", { mode: "string" }).defaultNow(),
    updatedAt: mysql_core_1.timestamp("updatedAt", { mode: "string" }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_etl_status").on(table.status),
]; });
// ============ Container Deployments (Cloud Infrastructure) ============
exports.containerDeployments = mysql_core_1.mysqlTable("container_deployments", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    name: mysql_core_1.varchar("name", { length: 200 }).notNull(),
    orchestrator: mysql_core_1.varchar("orchestrator", { length: 50 }),
    serviceName: mysql_core_1.varchar("serviceName", { length: 200 }),
    image: mysql_core_1.varchar("image", { length: 500 }),
    replicas: mysql_core_1.int("replicas")["default"](1),
    port: mysql_core_1.int("port"),
    status: mysql_core_1.varchar("status", { length: 50 }).notNull()["default"]("PENDING"),
    config: mysql_core_1.text("config"),
    createdBy: mysql_core_1.varchar("createdBy", { length: 64 }).notNull(),
    createdAt: mysql_core_1.timestamp("createdAt", { mode: "string" }).defaultNow(),
    updatedAt: mysql_core_1.timestamp("updatedAt", { mode: "string" }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_cd_status").on(table.status),
]; });
// ============ Custom Dashboards (Dashboard Builder) ============
exports.customDashboards = mysql_core_1.mysqlTable("custom_dashboards", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    name: mysql_core_1.varchar("name", { length: 200 }).notNull(),
    description: mysql_core_1.text("description"),
    layout: mysql_core_1.varchar("layout", { length: 50 }).notNull()["default"]("grid"),
    widgets: mysql_core_1.text("widgets"),
    isPublic: mysql_core_1.tinyint("isPublic").notNull()["default"](0),
    sharedWith: mysql_core_1.text("sharedWith"),
    createdBy: mysql_core_1.varchar("createdBy", { length: 64 }).notNull(),
    createdAt: mysql_core_1.timestamp("createdAt", { mode: "string" }).defaultNow(),
    updatedAt: mysql_core_1.timestamp("updatedAt", { mode: "string" }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_cdash_public").on(table.isPublic),
]; });
// ============ Webhook Configs (Developer Tools) ============
exports.webhookConfigs = mysql_core_1.mysqlTable("webhook_configs", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    name: mysql_core_1.varchar("name", { length: 200 }),
    eventType: mysql_core_1.varchar("eventType", { length: 200 }).notNull(),
    targetUrl: mysql_core_1.varchar("targetUrl", { length: 500 }).notNull(),
    secret: mysql_core_1.varchar("secret", { length: 200 }),
    isActive: mysql_core_1.tinyint("isActive").notNull()["default"](1),
    retryCount: mysql_core_1.int("retryCount")["default"](0),
    lastTriggered: mysql_core_1.timestamp("lastTriggered", { mode: "string" }),
    config: mysql_core_1.text("config"),
    createdBy: mysql_core_1.varchar("createdBy", { length: 64 }).notNull(),
    createdAt: mysql_core_1.timestamp("createdAt", { mode: "string" }).defaultNow(),
    updatedAt: mysql_core_1.timestamp("updatedAt", { mode: "string" }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_wc_active").on(table.isActive),
]; });
// ============ Email Calendar Sync ============
exports.emailCalendarSync = mysql_core_1.mysqlTable("email_calendar_sync", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    provider: mysql_core_1.varchar("provider", { length: 50 }).notNull(),
    email: mysql_core_1.varchar("email", { length: 200 }),
    title: mysql_core_1.varchar("title", { length: 200 }),
    description: mysql_core_1.text("description"),
    startTime: mysql_core_1.varchar("startTime", { length: 100 }),
    endTime: mysql_core_1.varchar("endTime", { length: 100 }),
    attendees: mysql_core_1.text("attendees"),
    location: mysql_core_1.varchar("location", { length: 500 }),
    syncStatus: mysql_core_1.varchar("syncStatus", { length: 50 }).notNull()["default"]("pending"),
    config: mysql_core_1.text("config"),
    createdBy: mysql_core_1.varchar("createdBy", { length: 64 }).notNull(),
    createdAt: mysql_core_1.timestamp("createdAt", { mode: "string" }).defaultNow(),
    updatedAt: mysql_core_1.timestamp("updatedAt", { mode: "string" }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_ecs_provider").on(table.provider),
]; });
// ============ Security Incidents (Enterprise Security) ============
exports.securityIncidents = mysql_core_1.mysqlTable("security_incidents", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    title: mysql_core_1.varchar("title", { length: 200 }).notNull(),
    threatType: mysql_core_1.varchar("threatType", { length: 100 }).notNull(),
    severity: mysql_core_1.varchar("severity", { length: 50 }).notNull()["default"]("MEDIUM"),
    source: mysql_core_1.varchar("source", { length: 200 }),
    targetAsset: mysql_core_1.varchar("targetAsset", { length: 200 }),
    status: mysql_core_1.varchar("status", { length: 50 }).notNull()["default"]("DETECTED"),
    details: mysql_core_1.text("details"),
    scanConfig: mysql_core_1.text("scanConfig"),
    resolvedAt: mysql_core_1.timestamp("resolvedAt", { mode: "string" }),
    createdBy: mysql_core_1.varchar("createdBy", { length: 64 }).notNull(),
    createdAt: mysql_core_1.timestamp("createdAt", { mode: "string" }).defaultNow()
}, function (table) { return [
    mysql_core_1.index("idx_si_severity").on(table.severity),
    mysql_core_1.index("idx_si_status").on(table.status),
]; });
// ============ Global Configs (Global Features) ============
exports.globalConfigs = mysql_core_1.mysqlTable("global_configs", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    configType: mysql_core_1.varchar("configType", { length: 100 }).notNull(),
    name: mysql_core_1.varchar("name", { length: 200 }).notNull(),
    region: mysql_core_1.varchar("region", { length: 100 }),
    config: mysql_core_1.text("config"),
    status: mysql_core_1.varchar("status", { length: 50 }).notNull()["default"]("ACTIVE"),
    createdBy: mysql_core_1.varchar("createdBy", { length: 64 }).notNull(),
    createdAt: mysql_core_1.timestamp("createdAt", { mode: "string" }).defaultNow(),
    updatedAt: mysql_core_1.timestamp("updatedAt", { mode: "string" }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_gc_type").on(table.configType),
]; });
// ============ Registered Devices (Mobile Responsive) ============
exports.registeredDevices = mysql_core_1.mysqlTable("registered_devices", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    deviceId: mysql_core_1.varchar("deviceId", { length: 200 }).notNull(),
    deviceType: mysql_core_1.varchar("deviceType", { length: 50 }).notNull(),
    pushToken: mysql_core_1.varchar("pushToken", { length: 500 }),
    platform: mysql_core_1.varchar("platform", { length: 50 }),
    appVersion: mysql_core_1.varchar("appVersion", { length: 50 }),
    lastSync: mysql_core_1.timestamp("lastSync", { mode: "string" }),
    syncConfig: mysql_core_1.text("syncConfig"),
    userId: mysql_core_1.varchar("userId", { length: 64 }),
    createdBy: mysql_core_1.varchar("createdBy", { length: 64 }).notNull(),
    createdAt: mysql_core_1.timestamp("createdAt", { mode: "string" }).defaultNow(),
    updatedAt: mysql_core_1.timestamp("updatedAt", { mode: "string" }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_rd_device").on(table.deviceId),
    mysql_core_1.index("idx_rd_user").on(table.userId),
]; });
// ============ Mobile App Configs (Native Mobile Apps) ============
exports.mobileAppConfigs = mysql_core_1.mysqlTable("mobile_app_configs", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    platform: mysql_core_1.varchar("platform", { length: 50 }).notNull(),
    appVersion: mysql_core_1.varchar("appVersion", { length: 50 }),
    bundleId: mysql_core_1.varchar("bundleId", { length: 200 }),
    packageName: mysql_core_1.varchar("packageName", { length: 200 }),
    config: mysql_core_1.text("config"),
    status: mysql_core_1.varchar("status", { length: 50 }).notNull()["default"]("ACTIVE"),
    createdBy: mysql_core_1.varchar("createdBy", { length: 64 }).notNull(),
    createdAt: mysql_core_1.timestamp("createdAt", { mode: "string" }).defaultNow(),
    updatedAt: mysql_core_1.timestamp("updatedAt", { mode: "string" }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_mac_platform").on(table.platform),
]; });
// ============ Partner Deals (Partner Channel) ============
exports.partnerDeals = mysql_core_1.mysqlTable("partner_deals", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    partnerId: mysql_core_1.varchar("partnerId", { length: 64 }),
    partnerName: mysql_core_1.varchar("partnerName", { length: 200 }),
    dealName: mysql_core_1.varchar("dealName", { length: 200 }).notNull(),
    customerId: mysql_core_1.varchar("customerId", { length: 64 }),
    dealValue: mysql_core_1.decimal("dealValue", { precision: 15, scale: 2 })["default"]("0"),
    tier: mysql_core_1.varchar("tier", { length: 50 }),
    status: mysql_core_1.varchar("status", { length: 50 }).notNull()["default"]("REGISTERED"),
    commissionRate: mysql_core_1.decimal("commissionRate", { precision: 5, scale: 2 })["default"]("0"),
    closureDate: mysql_core_1.varchar("closureDate", { length: 100 }),
    config: mysql_core_1.text("config"),
    createdBy: mysql_core_1.varchar("createdBy", { length: 64 }).notNull(),
    createdAt: mysql_core_1.timestamp("createdAt", { mode: "string" }).defaultNow(),
    updatedAt: mysql_core_1.timestamp("updatedAt", { mode: "string" }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_pd_status").on(table.status),
    mysql_core_1.index("idx_pd_partner").on(table.partnerId),
]; });
// ============ Performance Configs (Performance Optimization + Scaling) ============
exports.perfConfigs = mysql_core_1.mysqlTable("perf_configs", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    configType: mysql_core_1.varchar("configType", { length: 100 }).notNull(),
    name: mysql_core_1.varchar("name", { length: 200 }),
    strategy: mysql_core_1.varchar("strategy", { length: 100 }),
    config: mysql_core_1.text("config"),
    status: mysql_core_1.varchar("status", { length: 50 }).notNull()["default"]("ACTIVE"),
    createdBy: mysql_core_1.varchar("createdBy", { length: 64 }).notNull(),
    createdAt: mysql_core_1.timestamp("createdAt", { mode: "string" }).defaultNow(),
    updatedAt: mysql_core_1.timestamp("updatedAt", { mode: "string" }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_pc_type").on(table.configType),
]; });
// ============ Backup Schedules (Sys Admin) ============
exports.backupSchedules = mysql_core_1.mysqlTable("backup_schedules", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    name: mysql_core_1.varchar("name", { length: 200 }),
    backupType: mysql_core_1.varchar("backupType", { length: 50 }).notNull()["default"]("FULL"),
    schedule: mysql_core_1.varchar("schedule", { length: 100 }),
    retentionDays: mysql_core_1.int("retentionDays")["default"](30),
    status: mysql_core_1.varchar("status", { length: 50 }).notNull()["default"]("SCHEDULED"),
    lastRun: mysql_core_1.timestamp("lastRun", { mode: "string" }),
    nextRun: mysql_core_1.timestamp("nextRun", { mode: "string" }),
    config: mysql_core_1.text("config"),
    createdBy: mysql_core_1.varchar("createdBy", { length: 64 }).notNull(),
    createdAt: mysql_core_1.timestamp("createdAt", { mode: "string" }).defaultNow(),
    updatedAt: mysql_core_1.timestamp("updatedAt", { mode: "string" }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_bs_status").on(table.status),
]; });
// ============ Backup History (completed backup records) ============
exports.backupHistory = mysql_core_1.mysqlTable("backup_history", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    name: mysql_core_1.varchar("name", { length: 200 }).notNull(),
    backupType: mysql_core_1.varchar("backupType", { length: 50 }).notNull()["default"]("full"),
    scope: mysql_core_1.varchar("scope", { length: 50 }).notNull()["default"]("full"),
    scopeEntityId: mysql_core_1.varchar("scopeEntityId", { length: 64 }),
    status: mysql_core_1.varchar("status", { length: 50 }).notNull()["default"]("pending"),
    tablesList: mysql_core_1.text("tablesList"),
    recordCount: mysql_core_1.int("recordCount")["default"](0),
    sizeBytes: mysql_core_1.int("sizeBytes")["default"](0),
    fileName: mysql_core_1.varchar("fileName", { length: 500 }),
    errorMessage: mysql_core_1.text("errorMessage"),
    completedAt: mysql_core_1.timestamp("completedAt", { mode: "string" }),
    createdBy: mysql_core_1.varchar("createdBy", { length: 64 }).notNull(),
    createdAt: mysql_core_1.timestamp("createdAt", { mode: "string" }).defaultNow()
}, function (table) { return [
    mysql_core_1.index("idx_bh_status").on(table.status),
    mysql_core_1.index("idx_bh_scope").on(table.scope),
    mysql_core_1.index("idx_bh_created").on(table.createdAt),
]; });
// ============ Integration Configs (Third-Party Integration) ============
exports.integrationConfigs = mysql_core_1.mysqlTable("integration_configs", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    provider: mysql_core_1.varchar("provider", { length: 100 }).notNull(),
    name: mysql_core_1.varchar("name", { length: 200 }),
    service: mysql_core_1.varchar("service", { length: 100 }),
    integrationType: mysql_core_1.varchar("integrationType", { length: 50 }),
    config: mysql_core_1.text("config"),
    status: mysql_core_1.varchar("status", { length: 20 })["default"]("inactive"),
    isActive: mysql_core_1.tinyint("isActive").notNull()["default"](1),
    lastSync: mysql_core_1.timestamp("lastSync", { mode: "string" }),
    lastSyncAt: mysql_core_1.timestamp("lastSyncAt", { mode: "string" }),
    createdBy: mysql_core_1.varchar("createdBy", { length: 64 }).notNull(),
    createdAt: mysql_core_1.timestamp("createdAt", { mode: "string" }).defaultNow(),
    updatedAt: mysql_core_1.timestamp("updatedAt", { mode: "string" }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_ic_provider").on(table.provider),
    mysql_core_1.index("idx_ic_active").on(table.isActive),
    mysql_core_1.index("idx_ic_status").on(table.status),
]; });
// ============ Design Configs (UI/UX Excellence) ============
exports.designConfigs = mysql_core_1.mysqlTable("design_configs", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    configType: mysql_core_1.varchar("configType", { length: 100 }).notNull(),
    name: mysql_core_1.varchar("name", { length: 200 }),
    theme: mysql_core_1.varchar("theme", { length: 50 }),
    config: mysql_core_1.text("config"),
    status: mysql_core_1.varchar("status", { length: 50 }).notNull()["default"]("ACTIVE"),
    createdBy: mysql_core_1.varchar("createdBy", { length: 64 }).notNull(),
    createdAt: mysql_core_1.timestamp("createdAt", { mode: "string" }).defaultNow(),
    updatedAt: mysql_core_1.timestamp("updatedAt", { mode: "string" }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_dc_type").on(table.configType),
]; });
// ============ AI Insights ============
exports.aiInsights = mysql_core_1.mysqlTable("ai_insights", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    insightType: mysql_core_1.varchar("insightType", { length: 100 }).notNull(),
    title: mysql_core_1.varchar("title", { length: 300 }),
    description: mysql_core_1.text("description"),
    confidence: mysql_core_1.decimal("confidence", { precision: 5, scale: 4 })["default"]("0"),
    impact: mysql_core_1.varchar("impact", { length: 50 })["default"]("MEDIUM"),
    trend: mysql_core_1.varchar("trend", { length: 50 })["default"]("neutral"),
    recommendation: mysql_core_1.text("recommendation"),
    entityType: mysql_core_1.varchar("entityType", { length: 100 }),
    entityId: mysql_core_1.varchar("entityId", { length: 64 }),
    period: mysql_core_1.varchar("period", { length: 50 }),
    dataPayload: mysql_core_1.text("dataPayload"),
    status: mysql_core_1.varchar("status", { length: 50 }).notNull()["default"]("ACTIVE"),
    createdBy: mysql_core_1.varchar("createdBy", { length: 64 }).notNull(),
    createdAt: mysql_core_1.timestamp("createdAt", { mode: "string" }).defaultNow(),
    updatedAt: mysql_core_1.timestamp("updatedAt", { mode: "string" }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_ai_type").on(table.insightType),
    mysql_core_1.index("idx_ai_period").on(table.period),
]; });
// ============ Analytics Metrics ============
exports.analyticsMetrics = mysql_core_1.mysqlTable("analytics_metrics", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    metricName: mysql_core_1.varchar("metricName", { length: 200 }).notNull(),
    metricType: mysql_core_1.varchar("metricType", { length: 100 }).notNull(),
    value: mysql_core_1.decimal("value", { precision: 15, scale: 4 })["default"]("0"),
    unit: mysql_core_1.varchar("unit", { length: 50 }),
    period: mysql_core_1.varchar("period", { length: 50 }),
    dimensions: mysql_core_1.text("dimensions"),
    changePercent: mysql_core_1.decimal("changePercent", { precision: 10, scale: 2 })["default"]("0"),
    benchmark: mysql_core_1.decimal("benchmark", { precision: 15, scale: 4 }),
    dataPayload: mysql_core_1.text("dataPayload"),
    status: mysql_core_1.varchar("status", { length: 50 }).notNull()["default"]("ACTIVE"),
    createdBy: mysql_core_1.varchar("createdBy", { length: 64 }).notNull(),
    createdAt: mysql_core_1.timestamp("createdAt", { mode: "string" }).defaultNow(),
    updatedAt: mysql_core_1.timestamp("updatedAt", { mode: "string" }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_am_name").on(table.metricName),
    mysql_core_1.index("idx_am_type").on(table.metricType),
]; });
// ============ Cohort Analyses ============
exports.cohortAnalyses = mysql_core_1.mysqlTable("cohort_analyses", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    analysisType: mysql_core_1.varchar("analysisType", { length: 100 }).notNull(),
    cohortType: mysql_core_1.varchar("cohortType", { length: 50 }),
    name: mysql_core_1.varchar("name", { length: 200 }),
    period: mysql_core_1.varchar("period", { length: 50 }),
    dataPayload: mysql_core_1.text("dataPayload"),
    retentionData: mysql_core_1.text("retentionData"),
    funnelData: mysql_core_1.text("funnelData"),
    status: mysql_core_1.varchar("status", { length: 50 }).notNull()["default"]("ACTIVE"),
    createdBy: mysql_core_1.varchar("createdBy", { length: 64 }).notNull(),
    createdAt: mysql_core_1.timestamp("createdAt", { mode: "string" }).defaultNow(),
    updatedAt: mysql_core_1.timestamp("updatedAt", { mode: "string" }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_ca_type").on(table.analysisType),
    mysql_core_1.index("idx_ca_cohort").on(table.cohortType),
]; });
// ============ Executive Reports ============
exports.executiveReports = mysql_core_1.mysqlTable("executive_reports", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    reportType: mysql_core_1.varchar("reportType", { length: 100 }).notNull(),
    title: mysql_core_1.varchar("title", { length: 300 }),
    period: mysql_core_1.varchar("period", { length: 50 }),
    horizon: mysql_core_1.varchar("horizon", { length: 50 }),
    dataPayload: mysql_core_1.text("dataPayload"),
    status: mysql_core_1.varchar("status", { length: 50 }).notNull()["default"]("ACTIVE"),
    recipients: mysql_core_1.int("recipients")["default"](0),
    createdBy: mysql_core_1.varchar("createdBy", { length: 64 }).notNull(),
    createdAt: mysql_core_1.timestamp("createdAt", { mode: "string" }).defaultNow(),
    updatedAt: mysql_core_1.timestamp("updatedAt", { mode: "string" }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_er_type").on(table.reportType),
    mysql_core_1.index("idx_er_period").on(table.period),
]; });
// ============ Collaboration Sessions ============
exports.collaborationSessions = mysql_core_1.mysqlTable("collaboration_sessions", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    sessionType: mysql_core_1.varchar("sessionType", { length: 100 }).notNull(),
    documentId: mysql_core_1.varchar("documentId", { length: 64 }),
    channelId: mysql_core_1.varchar("channelId", { length: 64 }),
    userId: mysql_core_1.varchar("userId", { length: 64 }),
    message: mysql_core_1.text("message"),
    dataPayload: mysql_core_1.text("dataPayload"),
    status: mysql_core_1.varchar("status", { length: 50 }).notNull()["default"]("ACTIVE"),
    createdBy: mysql_core_1.varchar("createdBy", { length: 64 }).notNull(),
    createdAt: mysql_core_1.timestamp("createdAt", { mode: "string" }).defaultNow(),
    updatedAt: mysql_core_1.timestamp("updatedAt", { mode: "string" }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_cs_type").on(table.sessionType),
    mysql_core_1.index("idx_cs_doc").on(table.documentId),
]; });
// ============ Compliance Records ============
exports.complianceRecords = mysql_core_1.mysqlTable("compliance_records", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    recordType: mysql_core_1.varchar("recordType", { length: 100 }).notNull(),
    standard: mysql_core_1.varchar("standard", { length: 100 }),
    score: mysql_core_1.int("score")["default"](0),
    status: mysql_core_1.varchar("status", { length: 50 }).notNull()["default"]("COMPLIANT"),
    findings: mysql_core_1.text("findings"),
    dataPayload: mysql_core_1.text("dataPayload"),
    createdBy: mysql_core_1.varchar("createdBy", { length: 64 }).notNull(),
    createdAt: mysql_core_1.timestamp("createdAt", { mode: "string" }).defaultNow(),
    updatedAt: mysql_core_1.timestamp("updatedAt", { mode: "string" }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_cr_type").on(table.recordType),
    mysql_core_1.index("idx_cr_standard").on(table.standard),
]; });
// ============================================================================
// STAFF CHAT (Persistent Messages)
// ============================================================================
exports.staffChatChannels = mysql_core_1.mysqlTable("staffChatChannels", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    name: mysql_core_1.varchar({ length: 100 }).notNull(),
    type: mysql_core_1.varchar({ length: 20 }).notNull()["default"]("team"),
    description: mysql_core_1.varchar({ length: 255 }),
    members: mysql_core_1.json().$type()["default"]([]),
    createdBy: mysql_core_1.varchar({ length: 64 }).notNull(),
    isActive: mysql_core_1.tinyint()["default"](1).notNull(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow(),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_scc_type").on(table.type),
    mysql_core_1.index("idx_scc_created_by").on(table.createdBy),
]; });
exports.staffChatMessages = mysql_core_1.mysqlTable("staffChatMessages", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    channelId: mysql_core_1.varchar({ length: 64 })["default"]("general"),
    userId: mysql_core_1.varchar({ length: 64 }).notNull(),
    userName: mysql_core_1.varchar({ length: 255 }).notNull(),
    content: mysql_core_1.text().notNull(),
    emoji: mysql_core_1.varchar({ length: 10 }),
    replyToId: mysql_core_1.varchar({ length: 64 }),
    replyToUser: mysql_core_1.varchar({ length: 255 }),
    fileUrl: mysql_core_1.varchar({ length: 500 }),
    fileName: mysql_core_1.varchar({ length: 255 }),
    fileType: mysql_core_1.varchar({ length: 50 }),
    isEdited: mysql_core_1.tinyint()["default"](0).notNull(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow(),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_scm_user_id").on(table.userId),
    mysql_core_1.index("idx_scm_created_at").on(table.createdAt),
    mysql_core_1.index("idx_scm_channel_id").on(table.channelId),
]; });
// ============ Canned Responses (Support) ============
exports.cannedResponses = mysql_core_1.mysqlTable("canned_responses", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar("organizationId", { length: 64 }),
    category: mysql_core_1.varchar("category", { length: 100 }).notNull()["default"]("General"),
    title: mysql_core_1.varchar("title", { length: 255 }).notNull(),
    content: mysql_core_1.text("content").notNull(),
    shortCode: mysql_core_1.varchar("shortCode", { length: 50 }),
    createdBy: mysql_core_1.varchar("createdBy", { length: 64 }),
    createdAt: mysql_core_1.timestamp("createdAt", { mode: "string" }).defaultNow(),
    updatedAt: mysql_core_1.timestamp("updatedAt", { mode: "string" }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_cr_category").on(table.category),
    mysql_core_1.index("idx_cr_org").on(table.organizationId),
]; });
// ============ Knowledge Base ============
exports.kbCategories = mysql_core_1.mysqlTable("kb_categories", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar("organizationId", { length: 64 }),
    name: mysql_core_1.varchar("name", { length: 200 }).notNull(),
    slug: mysql_core_1.varchar("slug", { length: 200 }).notNull(),
    description: mysql_core_1.text("description"),
    icon: mysql_core_1.varchar("icon", { length: 50 })["default"]("BookOpen"),
    color: mysql_core_1.varchar("color", { length: 30 })["default"]("bg-blue-500"),
    sortOrder: mysql_core_1.int("sortOrder")["default"](0),
    createdAt: mysql_core_1.timestamp("createdAt", { mode: "string" }).defaultNow(),
    updatedAt: mysql_core_1.timestamp("updatedAt", { mode: "string" }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_kbc_org").on(table.organizationId),
    mysql_core_1.index("idx_kbc_slug").on(table.slug),
]; });
exports.kbArticles = mysql_core_1.mysqlTable("kb_articles", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar("organizationId", { length: 64 }),
    categoryId: mysql_core_1.varchar("categoryId", { length: 64 }).notNull(),
    title: mysql_core_1.varchar("title", { length: 500 }).notNull(),
    content: mysql_core_1.text("content"),
    excerpt: mysql_core_1.text("excerpt"),
    status: mysql_core_1.varchar("status", { length: 20 })["default"]("published"),
    featured: mysql_core_1.tinyint("featured")["default"](0),
    readTime: mysql_core_1.int("readTime")["default"](3),
    views: mysql_core_1.int("views")["default"](0),
    tags: mysql_core_1.text("tags"),
    createdBy: mysql_core_1.varchar("createdBy", { length: 64 }),
    createdAt: mysql_core_1.timestamp("createdAt", { mode: "string" }).defaultNow(),
    updatedAt: mysql_core_1.timestamp("updatedAt", { mode: "string" }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_kba_org").on(table.organizationId),
    mysql_core_1.index("idx_kba_cat").on(table.categoryId),
    mysql_core_1.index("idx_kba_status").on(table.status),
]; });
// ============ Warehouses & Stock Movements ============
exports.warehouses = mysql_core_1.mysqlTable("warehouses", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar("organizationId", { length: 64 }),
    name: mysql_core_1.varchar("name", { length: 200 }).notNull(),
    code: mysql_core_1.varchar("code", { length: 50 }),
    address: mysql_core_1.text("address"),
    contactPerson: mysql_core_1.varchar("contactPerson", { length: 200 }),
    phone: mysql_core_1.varchar("phone", { length: 50 }),
    status: mysql_core_1.varchar("status", { length: 20 })["default"]("active"),
    createdAt: mysql_core_1.timestamp("createdAt", { mode: "string" }).defaultNow(),
    updatedAt: mysql_core_1.timestamp("updatedAt", { mode: "string" }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_wh_org").on(table.organizationId),
]; });
exports.stockMovements = mysql_core_1.mysqlTable("stock_movements", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar("organizationId", { length: 64 }),
    productId: mysql_core_1.varchar("productId", { length: 64 }).notNull(),
    warehouseId: mysql_core_1.varchar("warehouseId", { length: 64 }),
    type: mysql_core_1.varchar("type", { length: 30 }).notNull(),
    quantity: mysql_core_1.int("quantity").notNull(),
    referenceNo: mysql_core_1.varchar("referenceNo", { length: 100 }),
    reason: mysql_core_1.text("reason"),
    fromWarehouse: mysql_core_1.varchar("fromWarehouse", { length: 64 }),
    toWarehouse: mysql_core_1.varchar("toWarehouse", { length: 64 }),
    createdBy: mysql_core_1.varchar("createdBy", { length: 64 }),
    createdAt: mysql_core_1.timestamp("createdAt", { mode: "string" }).defaultNow()
}, function (table) { return [
    mysql_core_1.index("idx_sm_org").on(table.organizationId),
    mysql_core_1.index("idx_sm_product").on(table.productId),
    mysql_core_1.index("idx_sm_type").on(table.type),
]; });
// ============ Client Subscriptions (Auto-Recurring Invoices) ============
exports.clientSubscriptions = mysql_core_1.mysqlTable("clientSubscriptions", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar({ length: 64 }),
    clientId: mysql_core_1.varchar({ length: 64 }).notNull(),
    name: mysql_core_1.varchar({ length: 255 }).notNull(),
    description: mysql_core_1.text(),
    status: mysql_core_1.mysqlEnum(['active', 'paused', 'cancelled', 'expired'])["default"]('active').notNull(),
    frequency: mysql_core_1.mysqlEnum(['weekly', 'biweekly', 'monthly', 'quarterly', 'annually']).notNull(),
    amount: mysql_core_1.int().notNull(),
    currency: mysql_core_1.varchar({ length: 10 })["default"]('KES'),
    startDate: mysql_core_1.datetime({ mode: 'string' }).notNull(),
    endDate: mysql_core_1.datetime({ mode: 'string' }),
    nextBillingDate: mysql_core_1.datetime({ mode: 'string' }).notNull(),
    lastBilledDate: mysql_core_1.datetime({ mode: 'string' }),
    templateInvoiceId: mysql_core_1.varchar({ length: 64 }),
    recurringInvoiceId: mysql_core_1.varchar({ length: 64 }),
    autoSendInvoice: mysql_core_1.tinyint()["default"](1).notNull(),
    totalBilled: mysql_core_1.int()["default"](0),
    invoiceCount: mysql_core_1.int()["default"](0),
    createdBy: mysql_core_1.varchar({ length: 64 }),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow(),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_cs_org").on(table.organizationId),
    mysql_core_1.index("idx_cs_client").on(table.clientId),
    mysql_core_1.index("idx_cs_status").on(table.status),
    mysql_core_1.index("idx_cs_next_billing").on(table.nextBillingDate),
]; });
// ============================================================================
// PHASE 21: ICT MANAGEMENT SYSTEM - System Health, Logs, Sessions
// ============================================================================
exports.systemHealth = mysql_core_1.mysqlTable("systemHealth", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar({ length: 64 }),
    cpuUsage: mysql_core_1.int()["default"](0),
    cpuModel: mysql_core_1.varchar({ length: 255 }),
    cpuCores: mysql_core_1.int()["default"](1),
    cpuSpeed: mysql_core_1.varchar({ length: 50 }),
    cpuTemperature: mysql_core_1.int()["default"](0),
    memoryUsage: mysql_core_1.int()["default"](0),
    memoryTotal: mysql_core_1.int()["default"](0),
    memoryAvailable: mysql_core_1.int()["default"](0),
    diskUsage: mysql_core_1.int()["default"](0),
    diskTotal: mysql_core_1.int()["default"](0),
    diskUsagePercent: mysql_core_1.int()["default"](0),
    status: mysql_core_1.mysqlEnum(['healthy', 'warning', 'critical'])["default"]('healthy').notNull(),
    systemPlatform: mysql_core_1.varchar({ length: 100 }),
    systemDistro: mysql_core_1.varchar({ length: 100 }),
    systemRelease: mysql_core_1.varchar({ length: 50 }),
    systemArch: mysql_core_1.varchar({ length: 50 }),
    systemManufacturer: mysql_core_1.varchar({ length: 255 }),
    systemUptime: mysql_core_1.int()["default"](0),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow()
}, function (table) { return [
    mysql_core_1.index("idx_sh_org").on(table.organizationId),
    mysql_core_1.index("idx_sh_status").on(table.status),
    mysql_core_1.index("idx_sh_created_at").on(table.createdAt),
]; });
exports.systemLogs = mysql_core_1.mysqlTable("systemLogs", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar({ length: 64 }),
    userId: mysql_core_1.varchar({ length: 64 }),
    severity: mysql_core_1.mysqlEnum(['debug', 'info', 'warning', 'error', 'critical'])["default"]('info').notNull(),
    message: mysql_core_1.text().notNull(),
    context: mysql_core_1.text(),
    service: mysql_core_1.varchar({ length: 100 }),
    action: mysql_core_1.varchar({ length: 100 }),
    stackTrace: mysql_core_1.text(),
    ipAddress: mysql_core_1.varchar({ length: 100 }),
    userAgent: mysql_core_1.varchar({ length: 500 }),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow()
}, function (table) { return [
    mysql_core_1.index("idx_sl_org").on(table.organizationId),
    mysql_core_1.index("idx_sl_user").on(table.userId),
    mysql_core_1.index("idx_sl_severity").on(table.severity),
    mysql_core_1.index("idx_sl_service").on(table.service),
    mysql_core_1.index("idx_sl_created_at").on(table.createdAt),
]; });
exports.activeSessions = mysql_core_1.mysqlTable("activeSessions", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    userId: mysql_core_1.varchar({ length: 64 }).notNull(),
    userEmail: mysql_core_1.varchar({ length: 320 }).notNull(),
    organizationId: mysql_core_1.varchar({ length: 64 }),
    ipAddress: mysql_core_1.varchar({ length: 100 }).notNull(),
    userAgent: mysql_core_1.varchar({ length: 500 }).notNull(),
    deviceType: mysql_core_1.varchar({ length: 50 }),
    browser: mysql_core_1.varchar({ length: 100 }),
    browserVersion: mysql_core_1.varchar({ length: 50 }),
    operatingSystem: mysql_core_1.varchar({ length: 100 }),
    osVersion: mysql_core_1.varchar({ length: 50 }),
    tokenHash: mysql_core_1.varchar({ length: 255 }),
    lastActivity: mysql_core_1.timestamp({ mode: 'string' }),
    expiresAt: mysql_core_1.timestamp({ mode: 'string' }).notNull(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow()
}, function (table) { return [
    mysql_core_1.index("idx_as_user").on(table.userId),
    mysql_core_1.index("idx_as_org").on(table.organizationId),
    mysql_core_1.index("idx_as_expires_at").on(table.expiresAt),
    mysql_core_1.index("idx_as_created_at").on(table.createdAt),
]; });
// ============================================================================
// PHASE 22: COMPREHENSIVE HR SYSTEM
// ============================================================================
// Enhanced Department with hierarchies
exports.departmentHierarchies = mysql_core_1.mysqlTable("departmentHierarchies", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar({ length: 64 }).notNull(),
    parentDepartmentId: mysql_core_1.varchar({ length: 64 }),
    departmentId: mysql_core_1.varchar({ length: 64 }).notNull(),
    level: mysql_core_1.int()["default"](0),
    path: mysql_core_1.varchar({ length: 500 }),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow()
}, function (table) { return [
    mysql_core_1.index("idx_dh_org").on(table.organizationId),
    mysql_core_1.index("idx_dh_parent").on(table.parentDepartmentId),
    mysql_core_1.index("idx_dh_dept").on(table.departmentId),
]; });
// Employee Promotions & Transfers
exports.employeePromotions = mysql_core_1.mysqlTable("employeePromotions", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar({ length: 64 }).notNull(),
    employeeId: mysql_core_1.varchar({ length: 64 }).notNull(),
    promotionDate: mysql_core_1.datetime({ mode: 'string' }).notNull(),
    previousJobGroupId: mysql_core_1.varchar({ length: 64 }).notNull(),
    newJobGroupId: mysql_core_1.varchar({ length: 64 }).notNull(),
    previousSalary: mysql_core_1.int().notNull(),
    newSalary: mysql_core_1.int().notNull(),
    promotionReason: mysql_core_1.text(),
    approvedBy: mysql_core_1.varchar({ length: 64 }),
    approvalDate: mysql_core_1.datetime({ mode: 'string' }),
    notes: mysql_core_1.text(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow()
}, function (table) { return [
    mysql_core_1.index("idx_ep_org").on(table.organizationId),
    mysql_core_1.index("idx_ep_employee").on(table.employeeId),
    mysql_core_1.index("idx_ep_date").on(table.promotionDate),
]; });
// Employee Transfers
exports.employeeTransfers = mysql_core_1.mysqlTable("employeeTransfers", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar({ length: 64 }).notNull(),
    employeeId: mysql_core_1.varchar({ length: 64 }).notNull(),
    transferDate: mysql_core_1.datetime({ mode: 'string' }).notNull(),
    previousDepartmentId: mysql_core_1.varchar({ length: 64 }),
    newDepartmentId: mysql_core_1.varchar({ length: 64 }).notNull(),
    transferReason: mysql_core_1.text(),
    approvedBy: mysql_core_1.varchar({ length: 64 }),
    approvalDate: mysql_core_1.datetime({ mode: 'string' }),
    notes: mysql_core_1.text(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow()
}, function (table) { return [
    mysql_core_1.index("idx_et_org").on(table.organizationId),
    mysql_core_1.index("idx_et_employee").on(table.employeeId),
    mysql_core_1.index("idx_et_date").on(table.transferDate),
]; });
// Timesheets
exports.timesheets = mysql_core_1.mysqlTable("timesheets", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar({ length: 64 }).notNull(),
    employeeId: mysql_core_1.varchar({ length: 64 }).notNull(),
    weekStartDate: mysql_core_1.datetime({ mode: 'string' }).notNull(),
    weekEndDate: mysql_core_1.datetime({ mode: 'string' }).notNull(),
    monday: mysql_core_1.int()["default"](0),
    tuesday: mysql_core_1.int()["default"](0),
    wednesday: mysql_core_1.int()["default"](0),
    thursday: mysql_core_1.int()["default"](0),
    friday: mysql_core_1.int()["default"](0),
    saturday: mysql_core_1.int()["default"](0),
    sunday: mysql_core_1.int()["default"](0),
    totalHours: mysql_core_1.int()["default"](0),
    projectIds: mysql_core_1.text(),
    notes: mysql_core_1.text(),
    status: mysql_core_1.mysqlEnum(['draft', 'submitted', 'approved', 'rejected'])["default"]('draft').notNull(),
    submittedBy: mysql_core_1.varchar({ length: 64 }),
    submittedAt: mysql_core_1.datetime({ mode: 'string' }),
    approvedBy: mysql_core_1.varchar({ length: 64 }),
    approvedAt: mysql_core_1.datetime({ mode: 'string' }),
    rejectionReason: mysql_core_1.text(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow(),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_ts_org").on(table.organizationId),
    mysql_core_1.index("idx_ts_employee").on(table.employeeId),
    mysql_core_1.index("idx_ts_week").on(table.weekStartDate),
    mysql_core_1.index("idx_ts_status").on(table.status),
]; });
// Payroll Batches
exports.payrollBatches = mysql_core_1.mysqlTable("payrollBatches", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar({ length: 64 }).notNull(),
    batchNumber: mysql_core_1.varchar({ length: 50 }).notNull().unique(),
    payMonth: mysql_core_1.datetime({ mode: 'string' }).notNull(),
    payPeriodStart: mysql_core_1.datetime({ mode: 'string' }).notNull(),
    payPeriodEnd: mysql_core_1.datetime({ mode: 'string' }).notNull(),
    employeeCount: mysql_core_1.int()["default"](0),
    totalGross: mysql_core_1.int()["default"](0),
    totalDeductions: mysql_core_1.int()["default"](0),
    totalNet: mysql_core_1.int()["default"](0),
    status: mysql_core_1.mysqlEnum(['draft', 'calculated', 'approved', 'processed', 'paid'])["default"]('draft').notNull(),
    createdBy: mysql_core_1.varchar({ length: 64 }).notNull(),
    approvedBy: mysql_core_1.varchar({ length: 64 }),
    approvalDate: mysql_core_1.datetime({ mode: 'string' }),
    processedBy: mysql_core_1.varchar({ length: 64 }),
    processedDate: mysql_core_1.datetime({ mode: 'string' }),
    notes: mysql_core_1.text(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow(),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_pb_org").on(table.organizationId),
    mysql_core_1.index("idx_pb_month").on(table.payMonth),
    mysql_core_1.index("idx_pb_status").on(table.status),
    mysql_core_1.index("idx_pb_number").on(table.batchNumber),
]; });
// Enhanced Payroll with detailed breakdown
exports.payrollDetails = mysql_core_1.mysqlTable("payrollDetails", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar({ length: 64 }).notNull(),
    batchId: mysql_core_1.varchar({ length: 64 }).notNull(),
    employeeId: mysql_core_1.varchar({ length: 64 }).notNull(),
    payMonth: mysql_core_1.datetime({ mode: 'string' }).notNull(),
    basicSalary: mysql_core_1.int().notNull(),
    allowances: mysql_core_1.int()["default"](0),
    bonuses: mysql_core_1.int()["default"](0),
    grossSalary: mysql_core_1.int().notNull(),
    countryCode: mysql_core_1.varchar({ length: 5 })["default"]('KE'),
    currencyLabel: mysql_core_1.varchar({ length: 10 })["default"]('KES'),
    nssfDeduction: mysql_core_1.int()["default"](0),
    nhifDeduction: mysql_core_1.int()["default"](0),
    payeDeduction: mysql_core_1.int()["default"](0),
    loanDeduction: mysql_core_1.int()["default"](0),
    otherDeductions: mysql_core_1.int()["default"](0),
    totalDeductions: mysql_core_1.int().notNull(),
    netSalary: mysql_core_1.int().notNull(),
    paymentMethod: mysql_core_1.varchar({ length: 50 }),
    paymentReference: mysql_core_1.varchar({ length: 100 }),
    status: mysql_core_1.mysqlEnum(['draft', 'approved', 'paid', 'pending'])["default"]('draft').notNull(),
    paidDate: mysql_core_1.datetime({ mode: 'string' }),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow(),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_pd_org").on(table.organizationId),
    mysql_core_1.index("idx_pd_batch").on(table.batchId),
    mysql_core_1.index("idx_pd_employee").on(table.employeeId),
    mysql_core_1.index("idx_pd_month").on(table.payMonth),
    mysql_core_1.index("idx_pd_status").on(table.status),
]; });
// Payslips
exports.payslips = mysql_core_1.mysqlTable("payslips", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar({ length: 64 }).notNull(),
    payrollDetailId: mysql_core_1.varchar({ length: 64 }).notNull(),
    employeeId: mysql_core_1.varchar({ length: 64 }).notNull(),
    payslipNumber: mysql_core_1.varchar({ length: 50 }).notNull().unique(),
    payMonth: mysql_core_1.datetime({ mode: 'string' }).notNull(),
    basicSalary: mysql_core_1.int().notNull(),
    allowances: mysql_core_1.int()["default"](0),
    bonuses: mysql_core_1.int()["default"](0),
    grossSalary: mysql_core_1.int().notNull(),
    countryCode: mysql_core_1.varchar({ length: 5 })["default"]('KE'),
    currencyLabel: mysql_core_1.varchar({ length: 10 })["default"]('KES'),
    nssfDeduction: mysql_core_1.int()["default"](0),
    nhifDeduction: mysql_core_1.int()["default"](0),
    payeDeduction: mysql_core_1.int()["default"](0),
    loanDeduction: mysql_core_1.int()["default"](0),
    otherDeductions: mysql_core_1.int()["default"](0),
    totalDeductions: mysql_core_1.int().notNull(),
    netSalary: mysql_core_1.int().notNull(),
    bankAccountNumber: mysql_core_1.varchar({ length: 100 }),
    bankName: mysql_core_1.varchar({ length: 255 }),
    status: mysql_core_1.mysqlEnum(['generated', 'sent', 'viewed', 'downloaded'])["default"]('generated').notNull(),
    sentAt: mysql_core_1.datetime({ mode: 'string' }),
    viewedAt: mysql_core_1.datetime({ mode: 'string' }),
    downloadedAt: mysql_core_1.datetime({ mode: 'string' }),
    notes: mysql_core_1.text(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow()
}, function (table) { return [
    mysql_core_1.index("idx_ps_org").on(table.organizationId),
    mysql_core_1.index("idx_ps_employee").on(table.employeeId),
    mysql_core_1.index("idx_ps_number").on(table.payslipNumber),
    mysql_core_1.index("idx_ps_month").on(table.payMonth),
]; });
// Leave Balances
exports.leaveBalances = mysql_core_1.mysqlTable("leaveBalances", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar({ length: 64 }).notNull(),
    employeeId: mysql_core_1.varchar({ length: 64 }).notNull(),
    fiscalYear: mysql_core_1.int().notNull(),
    leaveType: mysql_core_1.mysqlEnum(['annual', 'sick', 'maternity', 'paternity', 'unpaid', 'compassion']).notNull(),
    totalEntitlement: mysql_core_1.int().notNull(),
    accrued: mysql_core_1.int()["default"](0),
    used: mysql_core_1.int()["default"](0),
    pending: mysql_core_1.int()["default"](0),
    carryover: mysql_core_1.int()["default"](0),
    available: mysql_core_1.int()["default"](0),
    lastAccrualDate: mysql_core_1.datetime({ mode: 'string' }),
    notes: mysql_core_1.text(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow(),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_lb_org").on(table.organizationId),
    mysql_core_1.index("idx_lb_employee").on(table.employeeId),
    mysql_core_1.index("idx_lb_year").on(table.fiscalYear),
    mysql_core_1.index("idx_lb_type").on(table.leaveType),
]; });
// Enhanced Leave Requests with approval workflow
exports.leaveApprovals = mysql_core_1.mysqlTable("leaveApprovals", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar({ length: 64 }).notNull(),
    leaveRequestId: mysql_core_1.varchar({ length: 64 }).notNull(),
    approverId: mysql_core_1.varchar({ length: 64 }).notNull(),
    approvalStatus: mysql_core_1.mysqlEnum(['pending', 'approved', 'rejected']).notNull(),
    approvalComments: mysql_core_1.text(),
    approvalDate: mysql_core_1.datetime({ mode: 'string' }),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow()
}, function (table) { return [
    mysql_core_1.index("idx_la_org").on(table.organizationId),
    mysql_core_1.index("idx_la_leave").on(table.leaveRequestId),
    mysql_core_1.index("idx_la_approver").on(table.approverId),
]; });
// Tax Compliance (P9 Forms - Kenya)
exports.taxCompliance = mysql_core_1.mysqlTable("taxCompliance", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar({ length: 64 }).notNull(),
    employeeId: mysql_core_1.varchar({ length: 64 }).notNull(),
    taxYear: mysql_core_1.int().notNull(),
    grossIncome: mysql_core_1.int()["default"](0),
    nssfAmount: mysql_core_1.int()["default"](0),
    taxableIncome: mysql_core_1.int()["default"](0),
    payeDeducted: mysql_core_1.int()["default"](0),
    nhifAmount: mysql_core_1.int()["default"](0),
    reliefs: mysql_core_1.int()["default"](0),
    taxDue: mysql_core_1.int()["default"](0),
    taxPaid: mysql_core_1.int()["default"](0),
    balanceDue: mysql_core_1.int()["default"](0),
    p9aGenerated: mysql_core_1.tinyint()["default"](0),
    p9bGenerated: mysql_core_1.tinyint()["default"](0),
    p9cGenerated: mysql_core_1.tinyint()["default"](0),
    kraSubmitted: mysql_core_1.tinyint()["default"](0),
    submissionDate: mysql_core_1.datetime({ mode: 'string' }),
    status: mysql_core_1.mysqlEnum(['draft', 'generated', 'submitted', 'approved'])["default"]('draft').notNull(),
    notes: mysql_core_1.text(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow(),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_tc_org").on(table.organizationId),
    mysql_core_1.index("idx_tc_employee").on(table.employeeId),
    mysql_core_1.index("idx_tc_year").on(table.taxYear),
    mysql_core_1.index("idx_tc_status").on(table.status),
]; });
// Holidays Calendar
exports.holidays = mysql_core_1.mysqlTable("holidays", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar({ length: 64 }).notNull(),
    name: mysql_core_1.varchar({ length: 255 }).notNull(),
    date: mysql_core_1.datetime({ mode: 'string' }).notNull(),
    type: mysql_core_1.mysqlEnum(['national', 'company', 'regional', 'optional'])["default"]('national').notNull(),
    isPublic: mysql_core_1.tinyint()["default"](1),
    description: mysql_core_1.text(),
    appliesTo: mysql_core_1.varchar({ length: 100 }),
    isApproved: mysql_core_1.tinyint()["default"](1),
    approvedBy: mysql_core_1.varchar({ length: 64 }),
    createdBy: mysql_core_1.varchar({ length: 64 }).notNull(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow(),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_h_org").on(table.organizationId),
    mysql_core_1.index("idx_h_date").on(table.date),
    mysql_core_1.index("idx_h_type").on(table.type),
]; });
// Training Courses
exports.trainingCourses = mysql_core_1.mysqlTable("trainingCourses", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar({ length: 64 }).notNull(),
    courseName: mysql_core_1.varchar({ length: 255 }).notNull(),
    description: mysql_core_1.text(),
    courseType: mysql_core_1.mysqlEnum(['internal', 'external', 'online', 'workshop'])["default"]('internal').notNull(),
    provider: mysql_core_1.varchar({ length: 255 }),
    durationDays: mysql_core_1.int()["default"](1),
    cost: mysql_core_1.int()["default"](0),
    startDate: mysql_core_1.datetime({ mode: 'string' }),
    endDate: mysql_core_1.datetime({ mode: 'string' }),
    location: mysql_core_1.varchar({ length: 255 }),
    maxParticipants: mysql_core_1.int()["default"](0),
    certificateRequired: mysql_core_1.tinyint()["default"](0),
    status: mysql_core_1.mysqlEnum(['draft', 'active', 'completed', 'cancelled'])["default"]('active').notNull(),
    createdBy: mysql_core_1.varchar({ length: 64 }).notNull(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow(),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_tc_org").on(table.organizationId),
    mysql_core_1.index("idx_tc_type").on(table.courseType),
    mysql_core_1.index("idx_tc_status").on(table.status),
]; });
// Training Enrollments
exports.trainingEnrollments = mysql_core_1.mysqlTable("trainingEnrollments", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar({ length: 64 }).notNull(),
    courseId: mysql_core_1.varchar({ length: 64 }).notNull(),
    employeeId: mysql_core_1.varchar({ length: 64 }).notNull(),
    enrollmentDate: mysql_core_1.datetime({ mode: 'string' }).notNull(),
    status: mysql_core_1.mysqlEnum(['enrolled', 'in_progress', 'completed', 'dropped', 'passed', 'failed'])["default"]('enrolled').notNull(),
    attendancePercentage: mysql_core_1.int()["default"](0),
    score: mysql_core_1.int()["default"](0),
    certificateIssued: mysql_core_1.tinyint()["default"](0),
    certificateDate: mysql_core_1.datetime({ mode: 'string' }),
    certificateUrl: mysql_core_1.varchar({ length: 500 }),
    feedback: mysql_core_1.text(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow(),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_te_org").on(table.organizationId),
    mysql_core_1.index("idx_te_course").on(table.courseId),
    mysql_core_1.index("idx_te_employee").on(table.employeeId),
    mysql_core_1.index("idx_te_status").on(table.status),
]; });
// Onboarding Checklists
exports.onboardingChecklists = mysql_core_1.mysqlTable("onboardingChecklists", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar({ length: 64 }).notNull(),
    employeeId: mysql_core_1.varchar({ length: 64 }).notNull(),
    jobGroupId: mysql_core_1.varchar({ length: 64 }).notNull(),
    startDate: mysql_core_1.datetime({ mode: 'string' }).notNull(),
    probationEndDate: mysql_core_1.datetime({ mode: 'string' }),
    overallProgress: mysql_core_1.int()["default"](0),
    status: mysql_core_1.mysqlEnum(['in_progress', 'completed', 'paused'])["default"]('in_progress').notNull(),
    completedDate: mysql_core_1.datetime({ mode: 'string' }),
    notes: mysql_core_1.text(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow(),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_oc_org").on(table.organizationId),
    mysql_core_1.index("idx_oc_employee").on(table.employeeId),
    mysql_core_1.index("idx_oc_status").on(table.status),
]; });
// Onboarding Tasks
exports.onboardingTasks = mysql_core_1.mysqlTable("onboardingTasks", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar({ length: 64 }).notNull(),
    checklistId: mysql_core_1.varchar({ length: 64 }).notNull(),
    taskName: mysql_core_1.varchar({ length: 255 }).notNull(),
    category: mysql_core_1.mysqlEnum(['it_setup', 'paperwork', 'training', 'introduction', 'other'])["default"]('other').notNull(),
    description: mysql_core_1.text(),
    assignedTo: mysql_core_1.varchar({ length: 64 }),
    dueDate: mysql_core_1.datetime({ mode: 'string' }),
    completedDate: mysql_core_1.datetime({ mode: 'string' }),
    completedBy: mysql_core_1.varchar({ length: 64 }),
    status: mysql_core_1.mysqlEnum(['pending', 'in_progress', 'completed', 'skipped'])["default"]('pending').notNull(),
    priority: mysql_core_1.mysqlEnum(['low', 'medium', 'high'])["default"]('medium').notNull(),
    notes: mysql_core_1.text(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow(),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_ot_org").on(table.organizationId),
    mysql_core_1.index("idx_ot_checklist").on(table.checklistId),
    mysql_core_1.index("idx_ot_category").on(table.category),
    mysql_core_1.index("idx_ot_status").on(table.status),
]; });
// Employee Skills & Competencies
exports.employeeSkills = mysql_core_1.mysqlTable("employeeSkills", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar({ length: 64 }).notNull(),
    employeeId: mysql_core_1.varchar({ length: 64 }).notNull(),
    skillName: mysql_core_1.varchar({ length: 255 }).notNull(),
    proficiencyLevel: mysql_core_1.mysqlEnum(['beginner', 'intermediate', 'advanced', 'expert'])["default"]('beginner').notNull(),
    yearsOfExperience: mysql_core_1.int()["default"](0),
    certifications: mysql_core_1.text(),
    lastAssessmentDate: mysql_core_1.datetime({ mode: 'string' }),
    endorsements: mysql_core_1.int()["default"](0),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow(),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_es_org").on(table.organizationId),
    mysql_core_1.index("idx_es_employee").on(table.employeeId),
    mysql_core_1.index("idx_es_skill").on(table.skillName),
]; });
// HR Settings & Configuration
exports.hrSettings = mysql_core_1.mysqlTable("hrSettings", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar({ length: 64 }).notNull(),
    annualLeaveEntitlement: mysql_core_1.int()["default"](21),
    sickLeaveEntitlement: mysql_core_1.int()["default"](10),
    probationMonths: mysql_core_1.int()["default"](3),
    maxLeaveCarryover: mysql_core_1.int()["default"](5),
    nssfContributionRate: mysql_core_1.int()["default"](6),
    nhifTiered: mysql_core_1.tinyint()["default"](1),
    defaultPaymentMethod: mysql_core_1.varchar({ length: 50 })["default"]('bank_transfer'),
    autoGeneratePayslips: mysql_core_1.tinyint()["default"](1),
    autoAccrueLeave: mysql_core_1.tinyint()["default"](1),
    leaveAccrualDay: mysql_core_1.int()["default"](1),
    payrollDay: mysql_core_1.int()["default"](20),
    countryCode: mysql_core_1.varchar({ length: 5 })["default"]('KE'),
    payrollRegion: mysql_core_1.varchar({ length: 50 })["default"]('east_africa'),
    leavePolicy: mysql_core_1.json()["default"]({ annual: 21, sick: 10, maxCarryover: 5, accrualRatePerMonth: 2 }),
    statutoryReportTemplates: mysql_core_1.json()["default"]({ payslip: 'standard', taxForm: 'P9', auditTrail: 'standard' }),
    statutoryAuditingEnabled: mysql_core_1.tinyint()["default"](1),
    autoApprovePayroll: mysql_core_1.tinyint()["default"](0),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow(),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_hs_org").on(table.organizationId),
]; });
// Manager Approvals Workflow
exports.approvalWorkflows = mysql_core_1.mysqlTable("approvalWorkflows", {
    id: mysql_core_1.varchar({ length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar({ length: 64 }).notNull(),
    workflowType: mysql_core_1.mysqlEnum(['leave_request', 'expense_report', 'payroll_batch', 'promotion', 'transfer']).notNull(),
    entityId: mysql_core_1.varchar({ length: 64 }).notNull(),
    requestedBy: mysql_core_1.varchar({ length: 64 }).notNull(),
    requestedAt: mysql_core_1.datetime({ mode: 'string' }).notNull(),
    currentApprover: mysql_core_1.varchar({ length: 64 }),
    approverLevel: mysql_core_1.int()["default"](1),
    approverComments: mysql_core_1.text(),
    status: mysql_core_1.mysqlEnum(['pending', 'approved', 'rejected', 'recalled'])["default"]('pending').notNull(),
    approvedAt: mysql_core_1.datetime({ mode: 'string' }),
    approvedBy: mysql_core_1.varchar({ length: 64 }),
    escalated: mysql_core_1.tinyint()["default"](0),
    escalationReason: mysql_core_1.text(),
    createdAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow(),
    updatedAt: mysql_core_1.timestamp({ mode: 'string' }).defaultNow().onUpdateNow()
}, function (table) { return [
    mysql_core_1.index("idx_aw_org").on(table.organizationId),
    mysql_core_1.index("idx_aw_type").on(table.workflowType),
    mysql_core_1.index("idx_aw_status").on(table.status),
    mysql_core_1.index("idx_aw_entity").on(table.entityId),
]; });
// ===== Phase 4: Approval Workflow Schema (MySQL Compatible) =====
__exportStar(require("./approvalSchema"), exports);
var templateObject_1, templateObject_2;
