"use strict";
exports.__esModule = true;
exports.organizationMembers = exports.userTablePreferences = exports.quoteLogs = exports.lineItems = exports.quotes = exports.supplierAudits = exports.supplierRatings = exports.suppliers = exports.ticketTasks = exports.ticketComments = exports.tickets = exports.performanceReviews = exports.workflowAutomationLogs = exports.automationConfigs = exports.leads = exports.goodsReceiptNotes = exports.purchaseOrderItems = exports.purchaseOrders = exports.journalEntryLines = exports.journalEntries = exports.organizationAccountingPolicies = exports.budgetAllocations = exports.ledgerBudgets = exports.departmentBudgets = exports.projectBudgets = exports.serviceUsageTracking = exports.serviceTemplates = exports.invoicePayments = exports.projectTeamMembers = exports.imprestSurrenders = exports.imprests = exports.journalEntryReconciliations = exports.grnLineItems = exports.deliveryNoteLineItems = exports.lpoLineItems = exports.lpos = exports.p9Forms = exports.departmentalHeads = exports.payslips = exports.salaryIncrements = exports.employeeTaxInfo = exports.payrollApprovals = exports.payrollDetails = exports.employeeBenefits = exports.salaryDeductions = exports.salaryAllowances = exports.salaryStructures = exports.userPermissions = exports.auditLogs = exports.systemSettings = exports.stockAlerts = exports.inventoryTransactions = exports.communicationLogs = exports.scheduledReminders = exports.reminders = exports.guestClients = void 0;
var mysql_core_1 = require("drizzle-orm/mysql-core");
/**
 * Guest/Non-system clients for one-time transactions
 */
exports.guestClients = mysql_core_1.mysqlTable("guestClients", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    name: mysql_core_1.varchar("name", { length: 255 }).notNull(),
    email: mysql_core_1.varchar("email", { length: 320 }),
    phone: mysql_core_1.varchar("phone", { length: 50 }),
    address: mysql_core_1.text("address"),
    notes: mysql_core_1.text("notes"),
    createdBy: mysql_core_1.varchar("createdBy", { length: 64 }),
    createdAt: mysql_core_1.timestamp("createdAt").defaultNow()
});
/**
 * Reminder configurations
 */
exports.reminders = mysql_core_1.mysqlTable("reminders", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    name: mysql_core_1.varchar("name", { length: 255 }).notNull(),
    type: mysql_core_1.mysqlEnum("type", ["invoice_due", "estimate_expiry", "project_milestone", "payment_overdue", "custom"]).notNull(),
    frequency: mysql_core_1.mysqlEnum("frequency", ["once", "daily", "weekly", "monthly", "custom"]).notNull(),
    customDays: mysql_core_1.int("customDays"),
    timing: mysql_core_1.mysqlEnum("timing", ["before", "on", "after"]).notNull(),
    isActive: mysql_core_1.boolean("isActive")["default"](true).notNull(),
    emailEnabled: mysql_core_1.boolean("emailEnabled")["default"](true).notNull(),
    smsEnabled: mysql_core_1.boolean("smsEnabled")["default"](false).notNull(),
    emailTemplate: mysql_core_1.text("emailTemplate"),
    smsTemplate: mysql_core_1.text("smsTemplate"),
    createdBy: mysql_core_1.varchar("createdBy", { length: 64 }),
    createdAt: mysql_core_1.timestamp("createdAt").defaultNow(),
    updatedAt: mysql_core_1.timestamp("updatedAt").defaultNow()
});
/**
 * Scheduled reminder instances
 */
exports.scheduledReminders = mysql_core_1.mysqlTable("scheduledReminders", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    reminderId: mysql_core_1.varchar("reminderId", { length: 64 }).notNull(),
    referenceType: mysql_core_1.varchar("referenceType", { length: 50 }).notNull(),
    referenceId: mysql_core_1.varchar("referenceId", { length: 64 }).notNull(),
    recipientId: mysql_core_1.varchar("recipientId", { length: 64 }).notNull(),
    recipientType: mysql_core_1.mysqlEnum("recipientType", ["user", "client"]).notNull(),
    scheduledFor: mysql_core_1.datetime("scheduledFor").notNull(),
    status: mysql_core_1.mysqlEnum("status", ["pending", "sent", "failed", "cancelled"])["default"]("pending").notNull(),
    sentAt: mysql_core_1.datetime("sentAt"),
    error: mysql_core_1.text("error"),
    createdAt: mysql_core_1.timestamp("createdAt").defaultNow()
}, function (table) { return ({
    scheduledForIdx: mysql_core_1.index("scheduled_for_idx").on(table.scheduledFor),
    statusIdx: mysql_core_1.index("status_idx").on(table.status),
    referenceIdx: mysql_core_1.index("reference_idx").on(table.referenceType, table.referenceId)
}); });
/**
 * Email/SMS logs
 */
exports.communicationLogs = mysql_core_1.mysqlTable("communicationLogs", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    type: mysql_core_1.mysqlEnum("type", ["email", "sms"]).notNull(),
    recipient: mysql_core_1.varchar("recipient", { length: 320 }).notNull(),
    subject: mysql_core_1.varchar("subject", { length: 500 }),
    body: mysql_core_1.text("body"),
    status: mysql_core_1.mysqlEnum("status", ["pending", "sent", "failed"])["default"]("pending").notNull(),
    error: mysql_core_1.text("error"),
    referenceType: mysql_core_1.varchar("referenceType", { length: 50 }),
    referenceId: mysql_core_1.varchar("referenceId", { length: 64 }),
    sentAt: mysql_core_1.datetime("sentAt"),
    createdBy: mysql_core_1.varchar("createdBy", { length: 64 }),
    createdAt: mysql_core_1.timestamp("createdAt").defaultNow()
}, function (table) { return ({
    recipientIdx: mysql_core_1.index("recipient_idx").on(table.recipient),
    statusIdx: mysql_core_1.index("status_idx").on(table.status),
    sentAtIdx: mysql_core_1.index("sent_at_idx").on(table.sentAt)
}); });
/**
 * Inventory transactions
 */
exports.inventoryTransactions = mysql_core_1.mysqlTable("inventoryTransactions", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    productId: mysql_core_1.varchar("productId", { length: 64 }).notNull(),
    type: mysql_core_1.mysqlEnum("type", ["purchase", "sale", "adjustment", "return", "transfer"]).notNull(),
    quantity: mysql_core_1.int("quantity").notNull(),
    unitCost: mysql_core_1.int("unitCost"),
    referenceType: mysql_core_1.varchar("referenceType", { length: 50 }),
    referenceId: mysql_core_1.varchar("referenceId", { length: 64 }),
    notes: mysql_core_1.text("notes"),
    transactionDate: mysql_core_1.datetime("transactionDate").notNull(),
    createdBy: mysql_core_1.varchar("createdBy", { length: 64 }),
    createdAt: mysql_core_1.timestamp("createdAt").defaultNow()
}, function (table) { return ({
    productIdx: mysql_core_1.index("product_idx").on(table.productId),
    typeIdx: mysql_core_1.index("type_idx").on(table.type),
    transactionDateIdx: mysql_core_1.index("transaction_date_idx").on(table.transactionDate)
}); });
/**
 * Stock alerts
 */
exports.stockAlerts = mysql_core_1.mysqlTable("stockAlerts", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    productId: mysql_core_1.varchar("productId", { length: 64 }).notNull(),
    alertType: mysql_core_1.mysqlEnum("alertType", ["low_stock", "out_of_stock", "overstock", "reorder"]).notNull(),
    currentQuantity: mysql_core_1.int("currentQuantity").notNull(),
    threshold: mysql_core_1.int("threshold").notNull(),
    status: mysql_core_1.mysqlEnum("status", ["active", "resolved", "ignored"])["default"]("active").notNull(),
    notifiedAt: mysql_core_1.datetime("notifiedAt"),
    resolvedAt: mysql_core_1.datetime("resolvedAt"),
    createdAt: mysql_core_1.timestamp("createdAt").defaultNow()
}, function (table) { return ({
    productIdx: mysql_core_1.index("product_idx").on(table.productId),
    statusIdx: mysql_core_1.index("status_idx").on(table.status)
}); });
/**
 * System settings
 */
exports.systemSettings = mysql_core_1.mysqlTable("systemSettings", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    category: mysql_core_1.varchar("category", { length: 100 }).notNull(),
    key: mysql_core_1.varchar("key", { length: 100 }).notNull(),
    value: mysql_core_1.text("value"),
    dataType: mysql_core_1.mysqlEnum("dataType", ["string", "number", "boolean", "json"]).notNull(),
    description: mysql_core_1.text("description"),
    isPublic: mysql_core_1.boolean("isPublic")["default"](false).notNull(),
    updatedBy: mysql_core_1.varchar("updatedBy", { length: 64 }),
    updatedAt: mysql_core_1.timestamp("updatedAt").defaultNow()
}, function (table) { return ({
    categoryKeyIdx: mysql_core_1.index("category_key_idx").on(table.category, table.key)
}); });
/**
 * Audit logs for super admin
 */
exports.auditLogs = mysql_core_1.mysqlTable("auditLogs", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    userId: mysql_core_1.varchar("userId", { length: 64 }).notNull(),
    action: mysql_core_1.varchar("action", { length: 100 }).notNull(),
    resourceType: mysql_core_1.varchar("resourceType", { length: 50 }).notNull(),
    resourceId: mysql_core_1.varchar("resourceId", { length: 64 }),
    changes: mysql_core_1.text("changes"),
    ipAddress: mysql_core_1.varchar("ipAddress", { length: 50 }),
    userAgent: mysql_core_1.text("userAgent"),
    createdAt: mysql_core_1.timestamp("createdAt").defaultNow()
}, function (table) { return ({
    userIdx: mysql_core_1.index("user_idx").on(table.userId),
    actionIdx: mysql_core_1.index("action_idx").on(table.action),
    resourceIdx: mysql_core_1.index("resource_idx").on(table.resourceType, table.resourceId),
    createdAtIdx: mysql_core_1.index("created_at_idx").on(table.createdAt)
}); });
/**
 * User permissions for fine-grained access control
 */
exports.userPermissions = mysql_core_1.mysqlTable("userPermissions", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    userId: mysql_core_1.varchar("userId", { length: 64 }).notNull(),
    resource: mysql_core_1.varchar("resource", { length: 100 }).notNull(),
    action: mysql_core_1.varchar("action", { length: 50 }).notNull(),
    granted: mysql_core_1.boolean("granted")["default"](true).notNull(),
    grantedBy: mysql_core_1.varchar("grantedBy", { length: 64 }),
    createdAt: mysql_core_1.timestamp("createdAt").defaultNow()
}, function (table) { return ({
    userResourceIdx: mysql_core_1.index("user_resource_idx").on(table.userId, table.resource)
}); });
/**
 * Salary structures for employees
 */
exports.salaryStructures = mysql_core_1.mysqlTable("salaryStructures", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    employeeId: mysql_core_1.varchar("employeeId", { length: 64 }).notNull(),
    effectiveDate: mysql_core_1.datetime("effectiveDate").notNull(),
    basicSalary: mysql_core_1.int("basicSalary").notNull(),
    allowances: mysql_core_1.int("allowances")["default"](0),
    deductions: mysql_core_1.int("deductions")["default"](0),
    taxRate: mysql_core_1.int("taxRate")["default"](0),
    notes: mysql_core_1.text("notes"),
    approvedBy: mysql_core_1.varchar("approvedBy", { length: 64 }),
    approvedAt: mysql_core_1.datetime("approvedAt"),
    createdBy: mysql_core_1.varchar("createdBy", { length: 64 }),
    createdAt: mysql_core_1.timestamp("createdAt").defaultNow(),
    updatedAt: mysql_core_1.timestamp("updatedAt").defaultNow()
}, function (table) { return ({
    employeeIdx: mysql_core_1.index("employee_idx").on(table.employeeId),
    effectiveDateIdx: mysql_core_1.index("effective_date_idx").on(table.effectiveDate)
}); });
/**
 * Salary allowances (house, transport, meals, etc.)
 */
exports.salaryAllowances = mysql_core_1.mysqlTable("salaryAllowances", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    employeeId: mysql_core_1.varchar("employeeId", { length: 64 }).notNull(),
    allowanceType: mysql_core_1.varchar("allowanceType", { length: 100 }).notNull(),
    amount: mysql_core_1.int("amount").notNull(),
    frequency: mysql_core_1.mysqlEnum("frequency", ["monthly", "quarterly", "annual", "one_time"]).notNull(),
    effectiveDate: mysql_core_1.datetime("effectiveDate").notNull(),
    endDate: mysql_core_1.datetime("endDate"),
    isActive: mysql_core_1.boolean("isActive")["default"](true).notNull(),
    notes: mysql_core_1.text("notes"),
    createdBy: mysql_core_1.varchar("createdBy", { length: 64 }),
    createdAt: mysql_core_1.timestamp("createdAt").defaultNow(),
    updatedAt: mysql_core_1.timestamp("updatedAt").defaultNow()
}, function (table) { return ({
    employeeIdx: mysql_core_1.index("employee_idx").on(table.employeeId),
    typeIdx: mysql_core_1.index("type_idx").on(table.allowanceType),
    isActiveIdx: mysql_core_1.index("is_active_idx").on(table.isActive)
}); });
/**
 * Salary deductions (loan, pension, insurance, etc.)
 */
exports.salaryDeductions = mysql_core_1.mysqlTable("salaryDeductions", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    employeeId: mysql_core_1.varchar("employeeId", { length: 64 }).notNull(),
    deductionType: mysql_core_1.varchar("deductionType", { length: 100 }).notNull(),
    amount: mysql_core_1.int("amount").notNull(),
    frequency: mysql_core_1.mysqlEnum("frequency", ["monthly", "quarterly", "annual", "one_time"]).notNull(),
    effectiveDate: mysql_core_1.datetime("effectiveDate").notNull(),
    endDate: mysql_core_1.datetime("endDate"),
    isActive: mysql_core_1.boolean("isActive")["default"](true).notNull(),
    reference: mysql_core_1.varchar("reference", { length: 100 }),
    notes: mysql_core_1.text("notes"),
    createdBy: mysql_core_1.varchar("createdBy", { length: 64 }),
    createdAt: mysql_core_1.timestamp("createdAt").defaultNow(),
    updatedAt: mysql_core_1.timestamp("updatedAt").defaultNow()
}, function (table) { return ({
    employeeIdx: mysql_core_1.index("employee_idx").on(table.employeeId),
    typeIdx: mysql_core_1.index("type_idx").on(table.deductionType),
    isActiveIdx: mysql_core_1.index("is_active_idx").on(table.isActive)
}); });
/**
 * Employee benefits (health insurance, life insurance, etc.)
 */
exports.employeeBenefits = mysql_core_1.mysqlTable("employeeBenefits", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    employeeId: mysql_core_1.varchar("employeeId", { length: 64 }).notNull(),
    benefitType: mysql_core_1.varchar("benefitType", { length: 100 }).notNull(),
    provider: mysql_core_1.varchar("provider", { length: 255 }),
    enrollDate: mysql_core_1.datetime("enrollDate").notNull(),
    endDate: mysql_core_1.datetime("endDate"),
    isActive: mysql_core_1.boolean("isActive")["default"](true).notNull(),
    coverage: mysql_core_1.text("coverage"),
    cost: mysql_core_1.int("cost"),
    employerCost: mysql_core_1.int("employerCost"),
    notes: mysql_core_1.text("notes"),
    createdBy: mysql_core_1.varchar("createdBy", { length: 64 }),
    createdAt: mysql_core_1.timestamp("createdAt").defaultNow(),
    updatedAt: mysql_core_1.timestamp("updatedAt").defaultNow()
}, function (table) { return ({
    employeeIdx: mysql_core_1.index("employee_idx").on(table.employeeId),
    typeIdx: mysql_core_1.index("type_idx").on(table.benefitType),
    isActiveIdx: mysql_core_1.index("is_active_idx").on(table.isActive)
}); });
/**
 * Payroll details/components breakdown
 */
exports.payrollDetails = mysql_core_1.mysqlTable("payrollDetails", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    payrollId: mysql_core_1.varchar("payrollId", { length: 64 }).notNull(),
    componentType: mysql_core_1.varchar("componentType", { length: 100 }).notNull(),
    component: mysql_core_1.varchar("component", { length: 255 }).notNull(),
    amount: mysql_core_1.int("amount").notNull(),
    notes: mysql_core_1.text("notes"),
    createdAt: mysql_core_1.timestamp("createdAt").defaultNow()
}, function (table) { return ({
    payrollIdx: mysql_core_1.index("payroll_idx").on(table.payrollId),
    componentIdx: mysql_core_1.index("component_idx").on(table.componentType)
}); });
/**
 * Payroll approvals workflow
 */
exports.payrollApprovals = mysql_core_1.mysqlTable("payrollApprovals", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    payrollId: mysql_core_1.varchar("payrollId", { length: 64 }).notNull(),
    approverRole: mysql_core_1.varchar("approverRole", { length: 50 }).notNull(),
    approverId: mysql_core_1.varchar("approverId", { length: 64 }).notNull(),
    status: mysql_core_1.mysqlEnum("status", ["pending", "approved", "rejected"])["default"]("pending").notNull(),
    rejectionReason: mysql_core_1.text("rejectionReason"),
    approvalDate: mysql_core_1.datetime("approvalDate"),
    createdAt: mysql_core_1.timestamp("createdAt").defaultNow()
}, function (table) { return ({
    payrollIdx: mysql_core_1.index("payroll_idx").on(table.payrollId),
    approverIdx: mysql_core_1.index("approver_idx").on(table.approverId),
    statusIdx: mysql_core_1.index("status_idx").on(table.status)
}); });
/**
 * Employee tax information
 */
exports.employeeTaxInfo = mysql_core_1.mysqlTable("employeeTaxInfo", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    employeeId: mysql_core_1.varchar("employeeId", { length: 64 }).notNull(),
    taxNumber: mysql_core_1.varchar("taxNumber", { length: 50 }).notNull(),
    taxBracket: mysql_core_1.varchar("taxBracket", { length: 50 }),
    exemptions: mysql_core_1.int("exemptions")["default"](0),
    effectiveDate: mysql_core_1.datetime("effectiveDate").notNull(),
    endDate: mysql_core_1.datetime("endDate"),
    notes: mysql_core_1.text("notes"),
    createdBy: mysql_core_1.varchar("createdBy", { length: 64 }),
    createdAt: mysql_core_1.timestamp("createdAt").defaultNow(),
    updatedAt: mysql_core_1.timestamp("updatedAt").defaultNow()
}, function (table) { return ({
    employeeIdx: mysql_core_1.index("employee_idx").on(table.employeeId),
    taxNumberIdx: mysql_core_1.index("tax_number_idx").on(table.taxNumber)
}); });
/**
 * Salary increment history
 */
exports.salaryIncrements = mysql_core_1.mysqlTable("salaryIncrements", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    employeeId: mysql_core_1.varchar("employeeId", { length: 64 }).notNull(),
    previousSalary: mysql_core_1.int("previousSalary").notNull(),
    newSalary: mysql_core_1.int("newSalary").notNull(),
    incrementPercent: mysql_core_1.int("incrementPercent")["default"](0),
    reason: mysql_core_1.varchar("reason", { length: 255 }),
    effectiveDate: mysql_core_1.datetime("effectiveDate").notNull(),
    approvedBy: mysql_core_1.varchar("approvedBy", { length: 64 }),
    approvalDate: mysql_core_1.datetime("approvalDate"),
    notes: mysql_core_1.text("notes"),
    createdBy: mysql_core_1.varchar("createdBy", { length: 64 }),
    createdAt: mysql_core_1.timestamp("createdAt").defaultNow()
}, function (table) { return ({
    employeeIdx: mysql_core_1.index("employee_idx").on(table.employeeId),
    effectiveDateIdx: mysql_core_1.index("effective_date_idx").on(table.effectiveDate)
}); });
/**
 * Payslips - Generated and dispatched to employees
 */
exports.payslips = mysql_core_1.mysqlTable("payslips", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    payrollId: mysql_core_1.varchar("payrollId", { length: 64 }).notNull(),
    employeeId: mysql_core_1.varchar("employeeId", { length: 64 }).notNull(),
    organizationId: mysql_core_1.varchar("organizationId", { length: 64 }),
    payPeriod: mysql_core_1.varchar("payPeriod", { length: 20 }).notNull(),
    payPeriodStart: mysql_core_1.datetime("payPeriodStart").notNull(),
    payPeriodEnd: mysql_core_1.datetime("payPeriodEnd").notNull(),
    basicSalary: mysql_core_1.int("basicSalary").notNull(),
    allowances: mysql_core_1.int("allowances")["default"](0),
    grossSalary: mysql_core_1.int("grossSalary").notNull(),
    paye: mysql_core_1.int("paye")["default"](0),
    nssf: mysql_core_1.int("nssf")["default"](0),
    shif: mysql_core_1.int("shif")["default"](0),
    housingLevy: mysql_core_1.int("housingLevy")["default"](0),
    totalDeductions: mysql_core_1.int("totalDeductions")["default"](0),
    netSalary: mysql_core_1.int("netSalary").notNull(),
    htmlContent: mysql_core_1.text("htmlContent"),
    pdfUrl: mysql_core_1.varchar("pdfUrl", { length: 500 }),
    sentTo: mysql_core_1.varchar("sentTo", { length: 320 }),
    sentAt: mysql_core_1.datetime("sentAt"),
    status: mysql_core_1.mysqlEnum("status", ["draft", "generated", "sent", "viewed"])["default"]("draft").notNull(),
    employeeNotes: mysql_core_1.text("employeeNotes"),
    createdAt: mysql_core_1.timestamp("createdAt").defaultNow(),
    updatedAt: mysql_core_1.timestamp("updatedAt").defaultNow()
}, function (table) { return ({
    payrollIdx: mysql_core_1.index("payroll_idx").on(table.payrollId),
    employeeIdx: mysql_core_1.index("employee_idx").on(table.employeeId),
    payPeriodIdx: mysql_core_1.index("pay_period_idx").on(table.payPeriod),
    statusIdx: mysql_core_1.index("status_idx").on(table.status),
    sentAtIdx: mysql_core_1.index("sent_at_idx").on(table.sentAt),
    organizationIdx: mysql_core_1.index("org_idx").on(table.organizationId)
}); });
/**
 * Departmental Heads - Tracks manager assignments to departments
 */
exports.departmentalHeads = mysql_core_1.mysqlTable("departmental_heads", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar("organizationId", { length: 64 }).notNull(),
    departmentId: mysql_core_1.varchar("departmentId", { length: 64 }).notNull(),
    employeeId: mysql_core_1.varchar("employeeId", { length: 64 }).notNull(),
    userId: mysql_core_1.varchar("userId", { length: 64 }).notNull(),
    assignedAt: mysql_core_1.timestamp("assignedAt").defaultNow().notNull(),
    assignedBy: mysql_core_1.varchar("assignedBy", { length: 64 }),
    removalReason: mysql_core_1.text("removalReason"),
    removedAt: mysql_core_1.timestamp("removedAt"),
    removedBy: mysql_core_1.varchar("removedBy", { length: 64 }),
    createdAt: mysql_core_1.timestamp("createdAt").defaultNow(),
    updatedAt: mysql_core_1.timestamp("updatedAt").defaultNow()
}, function (table) { return ({
    deptIdx: mysql_core_1.index("dept_idx").on(table.departmentId),
    empIdx: mysql_core_1.index("emp_idx").on(table.employeeId),
    userIdx: mysql_core_1.index("user_idx").on(table.userId),
    orgIdx: mysql_core_1.index("org_head_idx").on(table.organizationId)
}); });
/**
 * P9 Tax Forms - Annual tax declarations for employees
 */
exports.p9Forms = mysql_core_1.mysqlTable("p9_forms", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar("organizationId", { length: 64 }).notNull(),
    employeeId: mysql_core_1.varchar("employeeId", { length: 64 }).notNull(),
    taxYear: mysql_core_1.int("taxYear").notNull(),
    taxNumber: mysql_core_1.varchar("taxNumber", { length: 30 }),
    grossIncome: mysql_core_1.int("grossIncome").notNull(),
    totalDeductions: mysql_core_1.int("totalDeductions").notNull(),
    paye: mysql_core_1.int("paye")["default"](0),
    nssf: mysql_core_1.int("nssf")["default"](0),
    shif: mysql_core_1.int("shif")["default"](0),
    housingLevy: mysql_core_1.int("housingLevy")["default"](0),
    reliefs: mysql_core_1.int("reliefs")["default"](0),
    netTaxPayable: mysql_core_1.int("netTaxPayable").notNull(),
    numberOfPayslips: mysql_core_1.int("numberOfPayslips")["default"](12),
    htmlContent: mysql_core_1.text("htmlContent"),
    pdfUrl: mysql_core_1.varchar("pdfUrl", { length: 500 }),
    sentTo: mysql_core_1.varchar("sentTo", { length: 320 }),
    sentAt: mysql_core_1.timestamp("sentAt"),
    status: mysql_core_1.mysqlEnum("status", ["draft", "generated", "sent", "received"])["default"]("draft").notNull(),
    generatedBy: mysql_core_1.varchar("generatedBy", { length: 64 }),
    generatedAt: mysql_core_1.timestamp("generatedAt"),
    notes: mysql_core_1.text("notes"),
    createdAt: mysql_core_1.timestamp("createdAt").defaultNow(),
    updatedAt: mysql_core_1.timestamp("updatedAt").defaultNow()
}, function (table) { return ({
    empIdx: mysql_core_1.index("p9_emp_idx").on(table.employeeId),
    yearIdx: mysql_core_1.index("tax_year_idx").on(table.taxYear),
    statusIdx: mysql_core_1.index("p9_status_idx").on(table.status),
    orgIdx: mysql_core_1.index("p9_org_idx").on(table.organizationId)
}); });
/**
 * Local Purchase Orders (LPO) for large purchases
 */
exports.lpos = mysql_core_1.mysqlTable("lpos", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar("organizationId", { length: 64 }),
    lpoNumber: mysql_core_1.varchar("lpoNumber", { length: 50 }).notNull(),
    vendorId: mysql_core_1.varchar("vendorId", { length: 64 }).notNull(),
    description: mysql_core_1.text("description"),
    amount: mysql_core_1.int("amount").notNull(),
    status: mysql_core_1.mysqlEnum("status", ["draft", "submitted", "approved", "rejected", "received"])["default"]("draft").notNull(),
    createdBy: mysql_core_1.varchar("createdBy", { length: 64 }),
    createdAt: mysql_core_1.timestamp("createdAt").defaultNow(),
    updatedAt: mysql_core_1.timestamp("updatedAt").defaultNow()
}, function (table) { return ({
    vendorIdx: mysql_core_1.index("vendor_idx").on(table.vendorId),
    statusIdx: mysql_core_1.index("status_idx").on(table.status)
}); });
/**
 * Line items for Local Purchase Orders
 */
exports.lpoLineItems = mysql_core_1.mysqlTable("lpoLineItems", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    lpoId: mysql_core_1.varchar("lpoId", { length: 64 }).notNull(),
    productId: mysql_core_1.varchar("productId", { length: 64 }),
    description: mysql_core_1.text("description").notNull(),
    quantity: mysql_core_1.int("quantity").notNull(),
    unit: mysql_core_1.varchar("unit", { length: 50 })["default"]("pcs").notNull(),
    unitPrice: mysql_core_1.int("unitPrice").notNull(),
    taxRate: mysql_core_1.int("taxRate")["default"](0).notNull(),
    lineTotal: mysql_core_1.int("lineTotal").notNull(),
    createdAt: mysql_core_1.timestamp("createdAt").defaultNow(),
    updatedAt: mysql_core_1.timestamp("updatedAt").defaultNow()
}, function (table) { return ({
    lpoIdx: mysql_core_1.index("lpo_idx").on(table.lpoId),
    productIdx: mysql_core_1.index("product_idx").on(table.productId)
}); });
/**
 * Line items for delivery notes
 */
exports.deliveryNoteLineItems = mysql_core_1.mysqlTable("deliveryNoteLineItems", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    deliveryNoteId: mysql_core_1.varchar("deliveryNoteId", { length: 64 }).notNull(),
    lpoLineItemId: mysql_core_1.varchar("lpoLineItemId", { length: 64 }),
    productId: mysql_core_1.varchar("productId", { length: 64 }),
    description: mysql_core_1.text("description").notNull(),
    quantityOrdered: mysql_core_1.int("quantityOrdered").notNull(),
    quantityReceived: mysql_core_1.int("quantityReceived").notNull(),
    unit: mysql_core_1.varchar("unit", { length: 50 })["default"]("pcs").notNull(),
    unitPrice: mysql_core_1.int("unitPrice").notNull(),
    notes: mysql_core_1.text("notes"),
    createdAt: mysql_core_1.timestamp("createdAt").defaultNow(),
    updatedAt: mysql_core_1.timestamp("updatedAt").defaultNow()
}, function (table) { return ({
    deliveryNoteIdx: mysql_core_1.index("delivery_note_idx").on(table.deliveryNoteId),
    lpoLineItemIdx: mysql_core_1.index("lpo_line_item_idx").on(table.lpoLineItemId),
    productIdx: mysql_core_1.index("product_idx").on(table.productId)
}); });
/**
 * Line items for Goods Received Notes (GRN)
 */
exports.grnLineItems = mysql_core_1.mysqlTable("grnLineItems", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    grnId: mysql_core_1.varchar("grnId", { length: 64 }).notNull(),
    lpoLineItemId: mysql_core_1.varchar("lpoLineItemId", { length: 64 }),
    productId: mysql_core_1.varchar("productId", { length: 64 }),
    description: mysql_core_1.text("description").notNull(),
    quantityOrdered: mysql_core_1.int("quantityOrdered").notNull(),
    quantityReceived: mysql_core_1.int("quantityReceived").notNull(),
    unit: mysql_core_1.varchar("unit", { length: 50 })["default"]("pcs").notNull(),
    unitPrice: mysql_core_1.int("unitPrice").notNull(),
    condition: mysql_core_1.mysqlEnum("condition", ["good", "damaged", "partial", "defective"])["default"]("good").notNull(),
    notes: mysql_core_1.text("notes"),
    createdAt: mysql_core_1.timestamp("createdAt").defaultNow(),
    updatedAt: mysql_core_1.timestamp("updatedAt").defaultNow()
}, function (table) { return ({
    grnIdx: mysql_core_1.index("grn_idx").on(table.grnId),
    lpoLineItemIdx: mysql_core_1.index("lpo_line_item_idx").on(table.lpoLineItemId),
    productIdx: mysql_core_1.index("product_idx").on(table.productId)
}); });
exports.journalEntryReconciliations = mysql_core_1.mysqlTable("journalEntryReconciliations", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    journalEntryId: mysql_core_1.varchar("journalEntryId", { length: 64 }).notNull(),
    reconciledBy: mysql_core_1.varchar("reconciledBy", { length: 64 }),
    reconciledAt: mysql_core_1.timestamp("reconciledAt").defaultNow(),
    notes: mysql_core_1.text("notes")
}, function (table) { return ({
    entryIdx: mysql_core_1.index("recon_entry_idx").on(table.journalEntryId)
}); });
/**
 * Short-term imprest requests for petty cash
 */
exports.imprests = mysql_core_1.mysqlTable("imprests", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    imprestNumber: mysql_core_1.varchar("imprestNumber", { length: 50 }).notNull(),
    userId: mysql_core_1.varchar("userId", { length: 64 }).notNull(),
    purpose: mysql_core_1.text("purpose"),
    amount: mysql_core_1.int("amount").notNull(),
    status: mysql_core_1.mysqlEnum("status", ["requested", "approved", "rejected", "settled"])["default"]("requested").notNull(),
    createdBy: mysql_core_1.varchar("createdBy", { length: 64 }),
    createdAt: mysql_core_1.timestamp("createdAt").defaultNow(),
    updatedAt: mysql_core_1.timestamp("updatedAt").defaultNow()
}, function (table) { return ({
    userIdx: mysql_core_1.index("user_idx").on(table.userId),
    statusIdx: mysql_core_1.index("status_idx").on(table.status)
}); });
/**
 * Records for surrendering imprest funds back to cashier
 */
exports.imprestSurrenders = mysql_core_1.mysqlTable("imprestSurrenders", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    imprestId: mysql_core_1.varchar("imprestId", { length: 64 }).notNull(),
    amount: mysql_core_1.int("amount").notNull(),
    notes: mysql_core_1.text("notes"),
    surrenderedBy: mysql_core_1.varchar("surrenderedBy", { length: 64 }),
    surrenderedAt: mysql_core_1.timestamp("surrenderedAt").defaultNow(),
    createdAt: mysql_core_1.timestamp("createdAt").defaultNow()
}, function (table) { return ({
    imprestIdx: mysql_core_1.index("imprest_idx").on(table.imprestId)
}); });
/**
 * Project Team Members - Track employees assigned to projects
 */
exports.projectTeamMembers = mysql_core_1.mysqlTable("projectTeamMembers", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    projectId: mysql_core_1.varchar("projectId", { length: 64 }).notNull(),
    employeeId: mysql_core_1.varchar("employeeId", { length: 64 }).notNull(),
    role: mysql_core_1.varchar("role", { length: 100 }),
    hoursAllocated: mysql_core_1.int("hoursAllocated"),
    startDate: mysql_core_1.datetime("startDate"),
    endDate: mysql_core_1.datetime("endDate"),
    isActive: mysql_core_1.boolean("isActive")["default"](true).notNull(),
    createdBy: mysql_core_1.varchar("createdBy", { length: 64 }),
    createdAt: mysql_core_1.timestamp("createdAt").defaultNow(),
    updatedAt: mysql_core_1.timestamp("updatedAt").defaultNow()
}, function (table) { return ({
    projectIdx: mysql_core_1.index("project_idx").on(table.projectId),
    employeeIdx: mysql_core_1.index("employee_idx").on(table.employeeId)
}); });
/**
 * Invoice Payments Tracking - Track payments received for invoices
 */
exports.invoicePayments = mysql_core_1.mysqlTable("invoicePayments", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    invoiceId: mysql_core_1.varchar("invoiceId", { length: 64 }).notNull(),
    paymentAmount: mysql_core_1.int("paymentAmount").notNull(),
    paymentDate: mysql_core_1.datetime("paymentDate").notNull(),
    paymentMethod: mysql_core_1.mysqlEnum("paymentMethod", [
        "cash",
        "bank_transfer",
        "check",
        "mobile_money",
        "credit_card",
        "other",
    ]).notNull(),
    reference: mysql_core_1.varchar("reference", { length: 255 }),
    notes: mysql_core_1.text("notes"),
    receiptId: mysql_core_1.varchar("receiptId", { length: 64 }),
    recordedBy: mysql_core_1.varchar("recordedBy", { length: 64 }),
    createdAt: mysql_core_1.timestamp("createdAt").defaultNow(),
    updatedAt: mysql_core_1.timestamp("updatedAt").defaultNow()
}, function (table) { return ({
    invoiceIdx: mysql_core_1.index("invoice_idx").on(table.invoiceId),
    paymentDateIdx: mysql_core_1.index("payment_date_idx").on(table.paymentDate)
}); });
/**
 * Service Templates - Predefined service configurations for quick reuse
 */
exports.serviceTemplates = mysql_core_1.mysqlTable("serviceTemplates", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar("organizationId", { length: 64 }),
    name: mysql_core_1.varchar("name", { length: 255 }).notNull(),
    description: mysql_core_1.text("description"),
    category: mysql_core_1.varchar("category", { length: 100 }),
    hourlyRate: mysql_core_1.int("hourlyRate"),
    fixedPrice: mysql_core_1.int("fixedPrice"),
    unit: mysql_core_1.varchar("unit", { length: 50 })["default"]("hour"),
    taxRate: mysql_core_1.int("taxRate")["default"](0),
    estimatedDuration: mysql_core_1.int("estimatedDuration"),
    deliverables: mysql_core_1.text("deliverables"),
    terms: mysql_core_1.text("terms"),
    isActive: mysql_core_1.boolean("isActive")["default"](true).notNull(),
    createdBy: mysql_core_1.varchar("createdBy", { length: 64 }),
    createdAt: mysql_core_1.timestamp("createdAt").defaultNow(),
    updatedAt: mysql_core_1.timestamp("updatedAt").defaultNow()
}, function (table) { return ({
    categoryIdx: mysql_core_1.index("template_category_idx").on(table.category),
    createdIdx: mysql_core_1.index("template_created_idx").on(table.createdAt)
}); });
/**
 * Service Usage Tracking - Track when and where services are used
 */
exports.serviceUsageTracking = mysql_core_1.mysqlTable("serviceUsageTracking", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    serviceTemplateId: mysql_core_1.varchar("serviceTemplateId", { length: 64 }).notNull(),
    invoiceId: mysql_core_1.varchar("invoiceId", { length: 64 }),
    estimateId: mysql_core_1.varchar("estimateId", { length: 64 }),
    projectId: mysql_core_1.varchar("projectId", { length: 64 }),
    clientId: mysql_core_1.varchar("clientId", { length: 64 }),
    quantity: mysql_core_1.int("quantity")["default"](1).notNull(),
    duration: mysql_core_1.int("duration"),
    usageDate: mysql_core_1.datetime("usageDate").notNull(),
    status: mysql_core_1.mysqlEnum("status", ["pending", "delivered", "invoiced", "paid", "cancelled"]).notNull(),
    notes: mysql_core_1.text("notes"),
    createdBy: mysql_core_1.varchar("createdBy", { length: 64 }),
    createdAt: mysql_core_1.timestamp("createdAt").defaultNow(),
    updatedAt: mysql_core_1.timestamp("updatedAt").defaultNow()
}, function (table) { return ({
    templateIdx: mysql_core_1.index("usage_template_idx").on(table.serviceTemplateId),
    invoiceIdx: mysql_core_1.index("usage_invoice_idx").on(table.invoiceId),
    projectIdx: mysql_core_1.index("usage_project_idx").on(table.projectId),
    clientIdx: mysql_core_1.index("usage_client_idx").on(table.clientId),
    dateIdx: mysql_core_1.index("usage_date_idx").on(table.usageDate),
    statusIdx: mysql_core_1.index("usage_status_idx").on(table.status)
}); });
/**
 * Project Budgets - Budget allocations and tracking for projects
 */
exports.projectBudgets = mysql_core_1.mysqlTable("projectBudgets", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar("organizationId", { length: 64 }),
    projectId: mysql_core_1.varchar("projectId", { length: 64 }).notNull(),
    budgetedAmount: mysql_core_1.int("budgetedAmount").notNull(),
    spent: mysql_core_1.int("spent")["default"](0).notNull(),
    remaining: mysql_core_1.int("remaining").notNull(),
    budgetStatus: mysql_core_1.mysqlEnum("budgetStatus", ["under", "at", "over"]).notNull(),
    startDate: mysql_core_1.datetime("startDate").notNull(),
    endDate: mysql_core_1.datetime("endDate"),
    notes: mysql_core_1.text("notes"),
    createdBy: mysql_core_1.varchar("createdBy", { length: 64 }),
    createdAt: mysql_core_1.timestamp("createdAt").defaultNow(),
    updatedAt: mysql_core_1.timestamp("updatedAt").defaultNow()
}, function (table) { return ({
    projectIdx: mysql_core_1.index("budget_project_idx").on(table.projectId),
    statusIdx: mysql_core_1.index("budget_status_idx").on(table.budgetStatus),
    dateIdx: mysql_core_1.index("budget_date_idx").on(table.startDate)
}); });
/**
 * Department Budgets - Budget allocations for departments
 */
exports.departmentBudgets = mysql_core_1.mysqlTable("departmentBudgets", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar("organizationId", { length: 64 }),
    departmentId: mysql_core_1.varchar("departmentId", { length: 64 }).notNull(),
    year: mysql_core_1.int("year").notNull(),
    budgetedAmount: mysql_core_1.int("budgetedAmount").notNull(),
    spent: mysql_core_1.int("spent")["default"](0).notNull(),
    remaining: mysql_core_1.int("remaining").notNull(),
    budgetStatus: mysql_core_1.mysqlEnum("budgetStatus", ["under", "at", "over"]).notNull(),
    category: mysql_core_1.varchar("category", { length: 100 }),
    notes: mysql_core_1.text("notes"),
    createdBy: mysql_core_1.varchar("createdBy", { length: 64 }),
    createdAt: mysql_core_1.timestamp("createdAt").defaultNow(),
    updatedAt: mysql_core_1.timestamp("updatedAt").defaultNow()
}, function (table) { return ({
    departmentIdx: mysql_core_1.index("dept_budget_department_idx").on(table.departmentId),
    yearIdx: mysql_core_1.index("dept_budget_year_idx").on(table.year),
    statusIdx: mysql_core_1.index("dept_budget_status_idx").on(table.budgetStatus),
    categoryIdx: mysql_core_1.index("dept_budget_category_idx").on(table.category)
}); });
/**
 * General Ledger Budget - Budget allocations for accounting ledger
 */
exports.ledgerBudgets = mysql_core_1.mysqlTable("ledgerBudgets", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    accountId: mysql_core_1.varchar("accountId", { length: 64 }).notNull(),
    year: mysql_core_1.int("year").notNull(),
    month: mysql_core_1.int("month"),
    budgetedAmount: mysql_core_1.int("budgetedAmount").notNull(),
    actual: mysql_core_1.int("actual")["default"](0).notNull(),
    variance: mysql_core_1.int("variance").notNull(),
    variancePercentage: mysql_core_1.int("variancePercentage"),
    notes: mysql_core_1.text("notes"),
    createdBy: mysql_core_1.varchar("createdBy", { length: 64 }),
    createdAt: mysql_core_1.timestamp("createdAt").defaultNow(),
    updatedAt: mysql_core_1.timestamp("updatedAt").defaultNow()
}, function (table) { return ({
    accountIdx: mysql_core_1.index("ledger_budget_account_idx").on(table.accountId),
    yearIdx: mysql_core_1.index("ledger_budget_year_idx").on(table.year),
    monthIdx: mysql_core_1.index("ledger_budget_month_idx").on(table.month)
}); });
/**
 * Budget Allocations - Detailed allocations of amounts to categories
 */
exports.budgetAllocations = mysql_core_1.mysqlTable("budgetAllocations", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    budgetId: mysql_core_1.varchar("budgetId", { length: 64 }).notNull(),
    categoryName: mysql_core_1.varchar("categoryName", { length: 255 }).notNull(),
    allocatedAmount: mysql_core_1.int("allocatedAmount").notNull(),
    spentAmount: mysql_core_1.int("spentAmount")["default"](0).notNull(),
    notes: mysql_core_1.text("notes"),
    createdAt: mysql_core_1.timestamp("createdAt").defaultNow(),
    updatedAt: mysql_core_1.timestamp("updatedAt").defaultNow()
}, function (table) { return ({
    budgetIdx: mysql_core_1.index("allocation_budget_idx").on(table.budgetId)
}); });
/**
 * Organization Accounting Policies - Country-specific accounting settings
 */
exports.organizationAccountingPolicies = mysql_core_1.mysqlTable("organizationAccountingPolicies", {
    id: mysql_core_1.varchar("id", { length: 36 }).primaryKey(),
    organizationId: mysql_core_1.varchar("organizationId", { length: 36 }).notNull(),
    country: mysql_core_1.varchar("country", { length: 10 }).notNull()["default"]("KE"),
    // Fiscal Year Configuration
    fiscalYearStart: mysql_core_1.varchar("fiscalYearStart", { length: 5 }).notNull()["default"]("01-01"),
    fiscalYearEnd: mysql_core_1.varchar("fiscalYearEnd", { length: 5 }).notNull()["default"]("12-31"),
    // Accounting Method
    accountingMethod: mysql_core_1.mysqlEnum("accountingMethod", ["accrual", "cash"]).notNull()["default"]("accrual"),
    defaultCurrency: mysql_core_1.varchar("defaultCurrency", { length: 3 }).notNull()["default"]("KES"),
    // Tax Configuration
    taxInclusiveInvoicing: mysql_core_1.boolean("taxInclusiveInvoicing").notNull()["default"](true),
    autoReconciliation: mysql_core_1.boolean("autoReconciliation").notNull()["default"](false),
    // Approval Requirements
    requireInvoiceApproval: mysql_core_1.boolean("requireInvoiceApproval").notNull()["default"](true),
    requireExpenseApproval: mysql_core_1.boolean("requireExpenseApproval").notNull()["default"](true),
    // Payment Terms
    defaultPaymentTerms: mysql_core_1.varchar("defaultPaymentTerms", { length: 20 })["default"]("net30"),
    // Asset Management
    depreciationMethod: mysql_core_1.mysqlEnum("depreciationMethod", ["straight_line", "declining_balance", "units_of_production"])["default"]("straight_line"),
    capitalizedAssetThreshold: mysql_core_1.decimal("capitalizedAssetThreshold", { precision: 12, scale: 2 })["default"]("50000"),
    // Compliance & Control
    roundingMethod: mysql_core_1.mysqlEnum("roundingMethod", ["round", "truncate"])["default"]("round"),
    retentionPeriod: mysql_core_1.int("retentionPeriod")["default"](7),
    auditTrailRequired: mysql_core_1.boolean("auditTrailRequired").notNull()["default"](true),
    allowManualJournalEntries: mysql_core_1.boolean("allowManualJournalEntries").notNull()["default"](true),
    createdBy: mysql_core_1.varchar("createdBy", { length: 36 }).notNull(),
    createdAt: mysql_core_1.datetime("createdAt").notNull(),
    updatedBy: mysql_core_1.varchar("updatedBy", { length: 36 }),
    updatedAt: mysql_core_1.datetime("updatedAt")
}, function (table) { return ({
    orgIdx: mysql_core_1.index("org_policy_idx").on(table.organizationId),
    countryIdx: mysql_core_1.index("country_policy_idx").on(table.country)
}); });
/**
 * Journal Entries - Double-entry bookkeeping
 */
exports.journalEntries = mysql_core_1.mysqlTable("journalEntries", {
    id: mysql_core_1.varchar("id", { length: 36 }).primaryKey(),
    organizationId: mysql_core_1.varchar("organizationId", { length: 36 }).notNull(),
    entryDate: mysql_core_1.datetime("entryDate").notNull(),
    entryMonth: mysql_core_1.varchar("entryMonth", { length: 7 }).notNull(),
    reference: mysql_core_1.varchar("reference", { length: 50 }).notNull(),
    description: mysql_core_1.text("description").notNull(),
    totalAmount: mysql_core_1.decimal("totalAmount", { precision: 12, scale: 2 }).notNull(),
    // Approval Workflow
    status: mysql_core_1.mysqlEnum("status", ["pending_approval", "approved", "posted", "reversed"])["default"]("pending_approval"),
    approvedBy: mysql_core_1.varchar("approvedBy", { length: 36 }),
    approvedAt: mysql_core_1.datetime("approvedAt"),
    postedAt: mysql_core_1.datetime("postedAt"),
    reversedAt: mysql_core_1.datetime("reversedAt"),
    notes: mysql_core_1.text("notes"),
    createdBy: mysql_core_1.varchar("createdBy", { length: 36 }).notNull(),
    createdAt: mysql_core_1.datetime("createdAt").notNull(),
    updatedAt: mysql_core_1.datetime("updatedAt")
}, function (table) { return ({
    orgIdx: mysql_core_1.index("journal_org_idx").on(table.organizationId),
    dateIdx: mysql_core_1.index("journal_date_idx").on(table.entryDate),
    monthIdx: mysql_core_1.index("journal_month_idx").on(table.entryMonth),
    statusIdx: mysql_core_1.index("journal_status_idx").on(table.status)
}); });
/**
 * Journal Entry Lines - Debit/Credit entries
 */
exports.journalEntryLines = mysql_core_1.mysqlTable("journalEntryLines", {
    id: mysql_core_1.varchar("id", { length: 36 }).primaryKey(),
    journalEntryId: mysql_core_1.varchar("journalEntryId", { length: 36 }).notNull(),
    accountId: mysql_core_1.varchar("accountId", { length: 36 }).notNull(),
    description: mysql_core_1.varchar("description", { length: 255 }),
    debit: mysql_core_1.decimal("debit", { precision: 12, scale: 2 }).notNull()["default"]("0"),
    credit: mysql_core_1.decimal("credit", { precision: 12, scale: 2 }).notNull()["default"]("0"),
    lineNumber: mysql_core_1.int("lineNumber"),
    createdBy: mysql_core_1.varchar("createdBy", { length: 36 }).notNull(),
    createdAt: mysql_core_1.datetime("createdAt").notNull()
}, function (table) { return ({
    entryIdx: mysql_core_1.index("journal_line_entry_idx").on(table.journalEntryId),
    accountIdx: mysql_core_1.index("journal_line_account_idx").on(table.accountId)
}); });
/**
 * Purchase Orders - Procurement lifecycle
 */
exports.purchaseOrders = mysql_core_1.mysqlTable("purchaseOrders", {
    id: mysql_core_1.varchar("id", { length: 36 }).primaryKey(),
    organizationId: mysql_core_1.varchar("organizationId", { length: 36 }).notNull(),
    poNumber: mysql_core_1.varchar("poNumber", { length: 50 }).notNull(),
    supplierId: mysql_core_1.varchar("supplierId", { length: 36 }).notNull(),
    supplierName: mysql_core_1.varchar("supplierName", { length: 255 }).notNull(),
    poDate: mysql_core_1.datetime("poDate").notNull(),
    deliveryDate: mysql_core_1.datetime("deliveryDate"),
    subtotal: mysql_core_1.decimal("subtotal", { precision: 12, scale: 2 }).notNull(),
    taxAmount: mysql_core_1.decimal("taxAmount", { precision: 12, scale: 2 })["default"]("0"),
    total: mysql_core_1.decimal("total", { precision: 12, scale: 2 }).notNull(),
    status: mysql_core_1.mysqlEnum("status", ["draft", "approved", "received", "partially_received", "cancelled"])["default"]("draft"),
    approvedBy: mysql_core_1.varchar("approvedBy", { length: 36 }),
    approvedAt: mysql_core_1.datetime("approvedAt"),
    receivedAt: mysql_core_1.datetime("receivedAt"),
    notes: mysql_core_1.text("notes"),
    createdBy: mysql_core_1.varchar("createdBy", { length: 36 }).notNull(),
    createdAt: mysql_core_1.datetime("createdAt").notNull(),
    updatedAt: mysql_core_1.datetime("updatedAt")
}, function (table) { return ({
    orgIdx: mysql_core_1.index("po_org_idx").on(table.organizationId),
    supplierIdx: mysql_core_1.index("po_supplier_idx").on(table.supplierId),
    statusIdx: mysql_core_1.index("po_status_idx").on(table.status)
}); });
/**
 * Purchase Order Items - Line items for POs
 */
exports.purchaseOrderItems = mysql_core_1.mysqlTable("purchaseOrderItems", {
    id: mysql_core_1.varchar("id", { length: 36 }).primaryKey(),
    purchaseOrderId: mysql_core_1.varchar("purchaseOrderId", { length: 36 }).notNull(),
    description: mysql_core_1.varchar("description", { length: 255 }).notNull(),
    quantity: mysql_core_1.int("quantity").notNull(),
    rate: mysql_core_1.decimal("rate", { precision: 12, scale: 2 }).notNull(),
    amount: mysql_core_1.decimal("amount", { precision: 12, scale: 2 }).notNull(),
    lineNumber: mysql_core_1.int("lineNumber"),
    createdBy: mysql_core_1.varchar("createdBy", { length: 36 }).notNull(),
    createdAt: mysql_core_1.datetime("createdAt").notNull()
}, function (table) { return ({
    poIdx: mysql_core_1.index("poi_po_idx").on(table.purchaseOrderId)
}); });
/**
 * Goods Receipt Notes - GRN for received goods
 */
exports.goodsReceiptNotes = mysql_core_1.mysqlTable("goodsReceiptNotes", {
    id: mysql_core_1.varchar("id", { length: 36 }).primaryKey(),
    organizationId: mysql_core_1.varchar("organizationId", { length: 36 }).notNull(),
    grno: mysql_core_1.varchar("grno", { length: 50 }).notNull(),
    purchaseOrderId: mysql_core_1.varchar("purchaseOrderId", { length: 36 }).notNull(),
    receivedDate: mysql_core_1.datetime("receivedDate").notNull(),
    totalQuantity: mysql_core_1.int("totalQuantity"),
    notes: mysql_core_1.text("notes"),
    createdBy: mysql_core_1.varchar("createdBy", { length: 36 }).notNull(),
    createdAt: mysql_core_1.datetime("createdAt").notNull()
}, function (table) { return ({
    orgIdx: mysql_core_1.index("grn_org_idx").on(table.organizationId),
    poIdx: mysql_core_1.index("grn_po_idx").on(table.purchaseOrderId)
}); });
/**
 * Sales Leads - Lead management and conversion
 */
exports.leads = mysql_core_1.mysqlTable("leads", {
    id: mysql_core_1.varchar("id", { length: 36 }).primaryKey(),
    organizationId: mysql_core_1.varchar("organizationId", { length: 36 }).notNull(),
    leadNo: mysql_core_1.varchar("leadNo", { length: 50 }).notNull(),
    companyName: mysql_core_1.varchar("companyName", { length: 255 }).notNull(),
    contactName: mysql_core_1.varchar("contactName", { length: 255 }).notNull(),
    email: mysql_core_1.varchar("email", { length: 255 }),
    phone: mysql_core_1.varchar("phone", { length: 20 }),
    source: mysql_core_1.mysqlEnum("source", ["website", "referral", "social_media", "cold_outreach", "event", "trade_show", "other"]).notNull(),
    estimatedValue: mysql_core_1.decimal("estimatedValue", { precision: 12, scale: 2 })["default"]("0"),
    currency: mysql_core_1.varchar("currency", { length: 3 })["default"]("KES"),
    country: mysql_core_1.varchar("country", { length: 10 }),
    industry: mysql_core_1.varchar("industry", { length: 100 }),
    status: mysql_core_1.mysqlEnum("status", ["new", "contacted", "qualified", "proposal_sent", "negotiating", "closed_won", "closed_lost"])["default"]("new"),
    assignedTo: mysql_core_1.varchar("assignedTo", { length: 36 }),
    notes: mysql_core_1.text("notes"),
    createdBy: mysql_core_1.varchar("createdBy", { length: 36 }).notNull(),
    createdAt: mysql_core_1.datetime("createdAt").notNull(),
    updatedAt: mysql_core_1.datetime("updatedAt")
}, function (table) { return ({
    orgIdx: mysql_core_1.index("lead_org_idx").on(table.organizationId),
    statusIdx: mysql_core_1.index("lead_status_idx").on(table.status),
    sourceIdx: mysql_core_1.index("lead_source_idx").on(table.source)
}); });
/**
 * Automation Configurations - Workflow automation settings
 */
exports.automationConfigs = mysql_core_1.mysqlTable("automationConfigs", {
    id: mysql_core_1.varchar("id", { length: 36 }).primaryKey(),
    organizationId: mysql_core_1.varchar("organizationId", { length: 36 }).notNull(),
    workflowType: mysql_core_1.varchar("workflowType", { length: 100 }).notNull(),
    enabled: mysql_core_1.boolean("enabled")["default"](true),
    configuration: mysql_core_1.json("configuration"),
    createdAt: mysql_core_1.datetime("createdAt").notNull(),
    updatedAt: mysql_core_1.datetime("updatedAt")
}, function (table) { return ({
    orgIdx: mysql_core_1.index("auto_org_idx").on(table.organizationId),
    workflowIdx: mysql_core_1.index("auto_workflow_idx").on(table.workflowType)
}); });
/**
 * Workflow Automation Logs - Track automation executions
 */
exports.workflowAutomationLogs = mysql_core_1.mysqlTable("workflowAutomationLogs", {
    id: mysql_core_1.varchar("id", { length: 36 }).primaryKey(),
    organizationId: mysql_core_1.varchar("organizationId", { length: 36 }).notNull(),
    workflowType: mysql_core_1.varchar("workflowType", { length: 100 }).notNull(),
    sourceEntityId: mysql_core_1.varchar("sourceEntityId", { length: 36 }),
    sourceEntityType: mysql_core_1.varchar("sourceEntityType", { length: 50 }),
    targetEntityId: mysql_core_1.varchar("targetEntityId", { length: 36 }),
    status: mysql_core_1.mysqlEnum("status", ["pending", "completed", "failed"])["default"]("pending"),
    errorMessage: mysql_core_1.text("errorMessage"),
    executedBy: mysql_core_1.varchar("executedBy", { length: 36 }),
    executedAt: mysql_core_1.datetime("executedAt").notNull(),
    createdAt: mysql_core_1.datetime("createdAt").notNull()
}, function (table) { return ({
    orgIdx: mysql_core_1.index("wf_org_idx").on(table.organizationId),
    workflowIdx: mysql_core_1.index("wf_workflow_idx").on(table.workflowType),
    sourceIdx: mysql_core_1.index("wf_source_idx").on(table.sourceEntityId),
    targetIdx: mysql_core_1.index("wf_target_idx").on(table.targetEntityId),
    dateIdx: mysql_core_1.index("wf_date_idx").on(table.executedAt)
}); });
// Performance reviews table
exports.performanceReviews = mysql_core_1.mysqlTable("performanceReviews", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    employeeId: mysql_core_1.varchar("employeeId", { length: 64 }).notNull(),
    reviewerId: mysql_core_1.varchar("reviewerId", { length: 64 }).notNull(),
    rating: mysql_core_1.int("rating").notNull(),
    comments: mysql_core_1.text("comments"),
    goals: mysql_core_1.text("goals"),
    status: mysql_core_1.mysqlEnum(["pending", "in_progress", "completed"])["default"]("pending").notNull(),
    reviewDate: mysql_core_1.timestamp("reviewDate").defaultNow(),
    createdAt: mysql_core_1.timestamp("createdAt").defaultNow(),
    updatedAt: mysql_core_1.timestamp("updatedAt").defaultNow()
}, function (table) { return ({
    empIdx: mysql_core_1.index("pr_employee_idx").on(table.employeeId),
    reviewerIdx: mysql_core_1.index("pr_reviewer_idx").on(table.reviewerId)
}); });
// ----------------- Client ticketing -----------------
exports.tickets = mysql_core_1.mysqlTable("tickets", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar("organizationId", { length: 64 }),
    clientId: mysql_core_1.varchar("clientId", { length: 64 }).notNull(),
    title: mysql_core_1.varchar("title", { length: 255 }).notNull(),
    description: mysql_core_1.text("description"),
    category: mysql_core_1.varchar("category", { length: 100 }),
    priority: mysql_core_1.mysqlEnum(["low", "medium", "high"])["default"]("medium").notNull(),
    status: mysql_core_1.mysqlEnum(["new", "open", "in_progress", "awaiting_client", "completed", "closed"])["default"]("new").notNull(),
    requestedDueDate: mysql_core_1.datetime("requestedDueDate", { mode: "string" }),
    assignedTo: mysql_core_1.varchar("assignedTo", { length: 64 }),
    createdBy: mysql_core_1.varchar("createdBy", { length: 64 }).notNull(),
    createdAt: mysql_core_1.timestamp("createdAt").defaultNow(),
    updatedAt: mysql_core_1.timestamp("updatedAt").defaultNow()
}, function (table) { return ({
    clientIdx: mysql_core_1.index("ticket_client_idx").on(table.clientId),
    statusIdx: mysql_core_1.index("ticket_status_idx").on(table.status)
}); });
exports.ticketComments = mysql_core_1.mysqlTable("ticket_comments", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    ticketId: mysql_core_1.varchar("ticketId", { length: 64 }).notNull(),
    authorId: mysql_core_1.varchar("authorId", { length: 64 }).notNull(),
    body: mysql_core_1.text("body").notNull(),
    createdAt: mysql_core_1.timestamp("createdAt").defaultNow()
}, function (table) { return ({
    ticketIdx: mysql_core_1.index("comment_ticket_idx").on(table.ticketId),
    authorIdx: mysql_core_1.index("comment_author_idx").on(table.authorId)
}); });
exports.ticketTasks = mysql_core_1.mysqlTable("ticket_tasks", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    ticketId: mysql_core_1.varchar("ticketId", { length: 64 }).notNull(),
    serviceType: mysql_core_1.varchar("serviceType", { length: 100 }).notNull(),
    details: mysql_core_1.text("details"),
    budget: mysql_core_1.int("budget"),
    dueDate: mysql_core_1.datetime("dueDate", { mode: "string" }),
    createdAt: mysql_core_1.timestamp("createdAt").defaultNow()
}, function (table) { return ({
    ticketIdx: mysql_core_1.index("task_ticket_idx").on(table.ticketId)
}); });
// --------- Procurement: Suppliers Module ---------
/**
 * Pre-qualified suppliers for procurement
 */
exports.suppliers = mysql_core_1.mysqlTable("suppliers", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar("organizationId", { length: 64 }),
    supplierNumber: mysql_core_1.varchar("supplierNumber", { length: 50 }).notNull().unique(),
    companyName: mysql_core_1.varchar("companyName", { length: 255 }).notNull(),
    registrationNumber: mysql_core_1.varchar("registrationNumber", { length: 100 }).unique(),
    taxId: mysql_core_1.varchar("taxId", { length: 100 }).unique(),
    contactPerson: mysql_core_1.varchar("contactPerson", { length: 255 }),
    contactTitle: mysql_core_1.varchar("contactTitle", { length: 100 }),
    email: mysql_core_1.varchar("email", { length: 320 }),
    phone: mysql_core_1.varchar("phone", { length: 50 }),
    alternatePhone: mysql_core_1.varchar("alternatePhone", { length: 50 }),
    website: mysql_core_1.varchar("website", { length: 255 }),
    address: mysql_core_1.text("address"),
    city: mysql_core_1.varchar("city", { length: 100 }),
    country: mysql_core_1.varchar("country", { length: 100 }),
    industry: mysql_core_1.varchar("industry", { length: 100 }),
    postalCode: mysql_core_1.varchar("postalCode", { length: 20 }),
    bankName: mysql_core_1.varchar("bankName", { length: 255 }),
    bankBranch: mysql_core_1.varchar("bankBranch", { length: 255 }),
    accountNumber: mysql_core_1.varchar("accountNumber", { length: 100 }),
    accountName: mysql_core_1.varchar("accountName", { length: 255 }),
    paymentTerms: mysql_core_1.varchar("paymentTerms", { length: 100 }),
    paymentMethods: mysql_core_1.varchar("paymentMethods", { length: 255 }),
    categories: mysql_core_1.varchar("categories", { length: 500 }),
    qualificationStatus: mysql_core_1.mysqlEnum("qualificationStatus", ["pending", "pre_qualified", "qualified", "rejected", "inactive"])["default"]("pending").notNull(),
    qualificationDate: mysql_core_1.datetime("qualificationDate", { mode: "string" }),
    certifications: mysql_core_1.varchar("certifications", { length: 500 }),
    qualityRating: mysql_core_1.int("qualityRating")["default"](0),
    deliveryRating: mysql_core_1.int("deliveryRating")["default"](0),
    priceCompetitiveness: mysql_core_1.int("priceCompetitiveness")["default"](0),
    averageRating: mysql_core_1.int("averageRating")["default"](0),
    totalOrders: mysql_core_1.int("totalOrders")["default"](0),
    totalSpent: mysql_core_1.int("totalSpent")["default"](0),
    lastOrderDate: mysql_core_1.datetime("lastOrderDate", { mode: "string" }),
    isActive: mysql_core_1.boolean("isActive")["default"](true).notNull(),
    accountManagerId: mysql_core_1.varchar("accountManagerId", { length: 64 }),
    notes: mysql_core_1.text("notes"),
    createdBy: mysql_core_1.varchar("createdBy", { length: 64 }),
    createdAt: mysql_core_1.timestamp("createdAt").defaultNow(),
    updatedAt: mysql_core_1.timestamp("updatedAt").defaultNow()
}, function (table) { return ({
    companyNameIdx: mysql_core_1.index("supplier_company_idx").on(table.companyName),
    statusIdx: mysql_core_1.index("supplier_status_idx").on(table.qualificationStatus),
    ratingIdx: mysql_core_1.index("supplier_rating_idx").on(table.averageRating),
    activeIdx: mysql_core_1.index("supplier_active_idx").on(table.isActive)
}); });
/**
 * Supplier performance ratings and reviews
 */
exports.supplierRatings = mysql_core_1.mysqlTable("supplierRatings", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    supplierId: mysql_core_1.varchar("supplierId", { length: 64 }).notNull(),
    orderId: mysql_core_1.varchar("orderId", { length: 64 }),
    qualityScore: mysql_core_1.int("qualityScore").notNull(),
    deliveryScore: mysql_core_1.int("deliveryScore").notNull(),
    priceScore: mysql_core_1.int("priceScore").notNull(),
    serviceScore: mysql_core_1.int("serviceScore").notNull(),
    comments: mysql_core_1.text("comments"),
    ratedBy: mysql_core_1.varchar("ratedBy", { length: 64 }).notNull(),
    createdAt: mysql_core_1.timestamp("createdAt").defaultNow()
}, function (table) { return ({
    supplierIdx: mysql_core_1.index("rating_supplier_idx").on(table.supplierId),
    orderIdx: mysql_core_1.index("rating_order_idx").on(table.orderId)
}); });
/**
 * Supplier audit logs for compliance tracking
 */
exports.supplierAudits = mysql_core_1.mysqlTable("supplierAudits", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    supplierId: mysql_core_1.varchar("supplierId", { length: 64 }).notNull(),
    auditType: mysql_core_1.mysqlEnum("auditType", ["qualification", "compliance", "performance", "certification", "manual"]).notNull(),
    auditDate: mysql_core_1.datetime("auditDate", { mode: "string" }).notNull(),
    findings: mysql_core_1.text("findings"),
    status: mysql_core_1.mysqlEnum("status", ["passed", "failed", "conditional"]).notNull(),
    actionItems: mysql_core_1.text("actionItems"),
    auditedBy: mysql_core_1.varchar("auditedBy", { length: 64 }),
    nextAuditDate: mysql_core_1.datetime("nextAuditDate", { mode: "string" }),
    notes: mysql_core_1.text("notes"),
    createdAt: mysql_core_1.timestamp("createdAt").defaultNow()
}, function (table) { return ({
    supplierIdx: mysql_core_1.index("audit_supplier_idx").on(table.supplierId),
    dateIdx: mysql_core_1.index("audit_date_idx").on(table.auditDate)
}); });
/**
 * Quotes / Quotations
 */
exports.quotes = mysql_core_1.mysqlTable("quotes", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    quoteNumber: mysql_core_1.varchar("quoteNumber", { length: 50 }).notNull(),
    clientId: mysql_core_1.varchar("clientId", { length: 64 }).notNull(),
    subject: mysql_core_1.varchar("subject", { length: 255 }),
    description: mysql_core_1.text("description"),
    status: mysql_core_1.mysqlEnum("status", [
        "draft",
        "sent",
        "accepted",
        "expired",
        "declined",
        "converted",
    ])["default"]("draft")
        .notNull(),
    subtotal: mysql_core_1.decimal("subtotal", { precision: 12, scale: 2 })["default"]("0"),
    taxAmount: mysql_core_1.decimal("taxAmount", { precision: 12, scale: 2 })["default"]("0"),
    total: mysql_core_1.decimal("total", { precision: 12, scale: 2 })["default"]("0"),
    notes: mysql_core_1.text("notes"),
    expirationDate: mysql_core_1.datetime("expirationDate"),
    sentDate: mysql_core_1.timestamp("sentDate"),
    acceptedDate: mysql_core_1.timestamp("acceptedDate"),
    declinedDate: mysql_core_1.timestamp("declinedDate"),
    convertedInvoiceId: mysql_core_1.varchar("convertedInvoiceId", { length: 64 }),
    template: mysql_core_1.int("template")["default"](0),
    createdBy: mysql_core_1.varchar("createdBy", { length: 64 }),
    organizationId: mysql_core_1.varchar("organizationId", { length: 64 }),
    createdAt: mysql_core_1.timestamp("createdAt").defaultNow(),
    updatedAt: mysql_core_1.timestamp("updatedAt").defaultNow()
}, function (table) { return ({
    clientIdx: mysql_core_1.index("quote_client_idx").on(table.clientId),
    statusIdx: mysql_core_1.index("quote_status_idx").on(table.status),
    orgIdx: mysql_core_1.index("quote_org_idx").on(table.organizationId)
}); });
/**
 * Quote line items
 */
exports.lineItems = mysql_core_1.mysqlTable("lineItems", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    quoteId: mysql_core_1.varchar("quoteId", { length: 64 }).notNull(),
    description: mysql_core_1.text("description"),
    quantity: mysql_core_1.int("quantity")["default"](1),
    unitPrice: mysql_core_1.decimal("unitPrice", { precision: 12, scale: 2 })["default"]("0"),
    taxRate: mysql_core_1.decimal("taxRate", { precision: 5, scale: 2 })["default"]("0"),
    total: mysql_core_1.decimal("total", { precision: 12, scale: 2 })["default"]("0"),
    createdAt: mysql_core_1.timestamp("createdAt").defaultNow()
}, function (table) { return ({
    quoteIdx: mysql_core_1.index("li_quote_idx").on(table.quoteId)
}); });
/**
 * Quote activity / audit logs
 */
exports.quoteLogs = mysql_core_1.mysqlTable("quoteLogs", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    quoteId: mysql_core_1.varchar("quoteId", { length: 64 }).notNull(),
    action: mysql_core_1.varchar("action", { length: 100 }).notNull(),
    description: mysql_core_1.text("description"),
    userId: mysql_core_1.varchar("userId", { length: 64 }),
    createdAt: mysql_core_1.timestamp("createdAt").defaultNow()
}, function (table) { return ({
    quoteIdx: mysql_core_1.index("ql_quote_idx").on(table.quoteId)
}); });
/**
 * User table preferences — persists column visibility, column order, and page size per user per table
 */
exports.userTablePreferences = mysql_core_1.mysqlTable("userTablePreferences", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    userId: mysql_core_1.varchar("userId", { length: 64 }).notNull(),
    organizationId: mysql_core_1.varchar("organizationId", { length: 64 }),
    tableName: mysql_core_1.varchar("tableName", { length: 100 }).notNull(),
    visibleColumns: mysql_core_1.text("visibleColumns"),
    columnOrder: mysql_core_1.text("columnOrder"),
    pageSize: mysql_core_1.int("pageSize")["default"](25),
    createdAt: mysql_core_1.timestamp("createdAt").defaultNow(),
    updatedAt: mysql_core_1.timestamp("updatedAt").defaultNow()
}, function (table) { return ({
    userTableIdx: mysql_core_1.index("utp_user_table_idx").on(table.userId, table.tableName),
    orgIdx: mysql_core_1.index("utp_org_idx").on(table.organizationId)
}); });
/**
 * Dedicated organization membership table.
 * Tracks user-to-organization membership lifecycle separately from users.organizationId.
 */
exports.organizationMembers = mysql_core_1.mysqlTable("organizationMembers", {
    id: mysql_core_1.varchar("id", { length: 64 }).primaryKey(),
    organizationId: mysql_core_1.varchar("organizationId", { length: 64 }).notNull(),
    userId: mysql_core_1.varchar("userId", { length: 64 }).notNull(),
    role: mysql_core_1.varchar("role", { length: 50 }),
    status: mysql_core_1.mysqlEnum("status", ["active", "inactive", "invited", "removed"])["default"]("active").notNull(),
    isActive: mysql_core_1.boolean("isActive")["default"](true).notNull(),
    invitedBy: mysql_core_1.varchar("invitedBy", { length: 64 }),
    joinedAt: mysql_core_1.datetime("joinedAt"),
    leftAt: mysql_core_1.datetime("leftAt"),
    createdAt: mysql_core_1.timestamp("createdAt").defaultNow(),
    updatedAt: mysql_core_1.timestamp("updatedAt").defaultNow()
}, function (table) { return ({
    orgIdx: mysql_core_1.index("org_members_org_idx").on(table.organizationId),
    userIdx: mysql_core_1.index("org_members_user_idx").on(table.userId),
    orgUserIdx: mysql_core_1.index("org_members_org_user_idx").on(table.organizationId, table.userId),
    statusIdx: mysql_core_1.index("org_members_status_idx").on(table.status)
}); });
