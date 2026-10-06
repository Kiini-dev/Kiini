"use strict";
exports.__esModule = true;
exports.appRouter = void 0;
var systemRouter_1 = require("./_core/systemRouter");
var trpc_1 = require("./_core/trpc");
var salesReports_1 = require("./routers/salesReports");
var server_1 = require("@trpc/server");
var users_1 = require("./routers/users");
var clients_1 = require("./routers/clients");
var contacts_1 = require("./routers/contacts");
var search_1 = require("./routers/search");
var invoices_1 = require("./routers/invoices");
var projects_1 = require("./routers/projects");
var payments_1 = require("./routers/payments");
var stripe_1 = require("./routers/stripe");
var mpesa_1 = require("./routers/mpesa");
var emailQueue_1 = require("./routers/emailQueue");
var smsRouter_1 = require("./routers/smsRouter");
var schedulerRouter_1 = require("./routers/schedulerRouter");
var estimates_1 = require("./routers/estimates");
var products_1 = require("./routers/products");
var receipts_1 = require("./routers/receipts");
var services_1 = require("./routers/services");
var expenses_1 = require("./routers/expenses");
var opportunities_1 = require("./routers/opportunities");
var employees_1 = require("./routers/employees");
var jobGroups_1 = require("./routers/jobGroups");
var departments_1 = require("./routers/departments");
var attendance_1 = require("./routers/attendance");
var payroll_1 = require("./routers/payroll");
var leave_1 = require("./routers/leave");
var settings_1 = require("./routers/settings");
var roles_1 = require("./routers/roles");
var dashboard_1 = require("./routers/dashboard");
var clientScoring_1 = require("./routers/clientScoring");
var auth_1 = require("./routers/auth");
var chartOfAccounts_1 = require("./routers/chartOfAccounts");
var email_1 = require("./routers/email");
var reports_1 = require("./routers/reports");
var dataExport_1 = require("./routers/dataExport");
var importExport_1 = require("./routers/importExport");
var csvImportExport_1 = require("./routers/csvImportExport");
var backupRestore_1 = require("./routers/backupRestore");
var lineItems_1 = require("./routers/lineItems");
var approvals_1 = require("./routers/approvals");
var savedFilters_1 = require("./routers/savedFilters");
var documentManagement_1 = require("./routers/documentManagement");
var analytics_1 = require("./routers/analytics");
var ai_1 = require("./routers/ai");
var reportExport_1 = require("./routers/reportExport");
var notifications_1 = require("./routers/notifications");
var recurringInvoices_1 = require("./routers/recurringInvoices");
var paymentPlans_1 = require("./routers/paymentPlans");
var projectMilestones_1 = require("./routers/projectMilestones");
var timeEntries_1 = require("./routers/timeEntries");
var reminders_1 = require("./routers/reminders");
var favorites_1 = require("./routers/favorites");
var salesPipeline_1 = require("./routers/salesPipeline");
var workflows_1 = require("./routers/workflows");
var enhancedPermissions_1 = require("./routers/enhancedPermissions");
var permissions_1 = require("./routers/permissions");
var enhancedDashboard_1 = require("./routers/enhancedDashboard");
var serviceTemplates_1 = require("./routers/serviceTemplates");
var budget_1 = require("./routers/budget");
var budgets_1 = require("./routers/budgets");
var hrAnalytics_1 = require("./routers/hrAnalytics");
var payrollExport_1 = require("./routers/payrollExport");
var taxCompliance_1 = require("./routers/taxCompliance");
var procurementLpo_1 = require("./routers/procurementLpo");
var procurement_1 = require("./routers/procurement");
var tickets_1 = require("./routers/tickets");
var imprest_1 = require("./routers/imprest");
var imprestSurrender_1 = require("./routers/imprestSurrender");
var financialReports_1 = require("./routers/financialReports");
var finance_1 = require("./routers/finance");
var performanceReviews_1 = require("./routers/performanceReviews");
var importValidation_1 = require("./routers/importValidation");
var health_1 = require("./routers/health");
var websiteContact_1 = require("./routers/websiteContact");
var communications_1 = require("./routers/communications");
var enhancedPayments_1 = require("./routers/enhancedPayments");
var professionalBudgeting_1 = require("./routers/professionalBudgeting");
var procurementManagement_1 = require("./routers/procurementManagement");
var inventory_1 = require("./routers/inventory");
var staffChat_1 = require("./routers/staffChat");
var cannedResponses_1 = require("./routers/cannedResponses");
var knowledgeBase_1 = require("./routers/knowledgeBase");
var warehouses_1 = require("./routers/warehouses");
var suppliers_1 = require("./routers/suppliers");
var maintenance_1 = require("./routers/maintenance");
var bankReconciliation_1 = require("./routers/bankReconciliation");
var automationJobs_1 = require("./routers/automationJobs");
var brandCustomization_1 = require("./routers/brandCustomization");
var themeCustomization_1 = require("./routers/themeCustomization");
var customHomepage_1 = require("./routers/customHomepage");
var quotations_1 = require("./routers/quotations");
var quotes_1 = require("./routers/quotes");
var procurementGrn_1 = require("./routers/procurementGrn");
var procurementDeliveryNotes_1 = require("./routers/procurementDeliveryNotes");
// ============= PHASE 4: ENTERPRISE EXPANSION =============
var dataMigration_1 = require("./routers/dataMigration");
var monitoring_1 = require("./routers/monitoring");
var smsAutomation_1 = require("./routers/smsAutomation");
var assets_1 = require("./routers/assets");
var warranty_1 = require("./routers/warranty");
var contracts_1 = require("./routers/contracts");
var notes_1 = require("./routers/notes");
var projectManagement_1 = require("./routers/projectManagement");
var advancedReporting_1 = require("./routers/advancedReporting");
var automationRulesEngine_1 = require("./routers/automationRulesEngine");
var multiTenancy_1 = require("./routers/multiTenancy");
var creditNotes_1 = require("./routers/creditNotes");
var debitNotes_1 = require("./routers/debitNotes");
var workOrders_1 = require("./routers/workOrders");
var serviceInvoices_1 = require("./routers/serviceInvoices");
var reportBuilder_1 = require("./routers/reportBuilder");
var kpiTracking_1 = require("./routers/kpiTracking");
var forecasting_1 = require("./routers/forecasting");
var activityTrail_1 = require("./routers/activityTrail");
var systemHealth_1 = require("./routers/systemHealth");
var advancedAutomation_1 = require("./routers/advancedAutomation");
var advancedExport_1 = require("./routers/advancedExport");
var advancedSecurity_1 = require("./routers/advancedSecurity");
var gdpr_1 = require("./routers/gdpr");
var aiAgents_1 = require("./routers/aiAgents");
var aiInsights_1 = require("./routers/aiInsights");
var aiml_1 = require("./routers/aiml");
var analyticsEngine_1 = require("./routers/analyticsEngine");
var apiMonetization_1 = require("./routers/apiMonetization");
var openapi_1 = require("./routers/openapi");
var businessIntelligence_1 = require("./routers/businessIntelligence");
var cloudInfrastructure_1 = require("./routers/cloudInfrastructure");
var cohortAnalytics_1 = require("./routers/cohortAnalytics");
var dashboardBuilder_1 = require("./routers/dashboardBuilder");
var developerTools_1 = require("./routers/developerTools");
var emailCalendar_1 = require("./routers/emailCalendar");
var enterpriseSecurity_1 = require("./routers/enterpriseSecurity");
var executiveDashboard_1 = require("./routers/executiveDashboard");
var executiveSuite_1 = require("./routers/executiveSuite");
var fileStorage_1 = require("./routers/fileStorage");
var globalFeatures_1 = require("./routers/globalFeatures");
var mobileApp_1 = require("./routers/mobileApp");
var mobileApps_1 = require("./routers/mobileApps");
var mobileResponsive_1 = require("./routers/mobileResponsive");
var nativeMobileApps_1 = require("./routers/nativeMobileApps");
var partnerChannel_1 = require("./routers/partnerChannel");
var performanceOptimization_1 = require("./routers/performanceOptimization");
var performanceScaling_1 = require("./routers/performanceScaling");
var realtimeCollaboration_1 = require("./routers/realtimeCollaboration");
var securityCompliance_1 = require("./routers/securityCompliance");
var sysAdmin_1 = require("./routers/sysAdmin");
var thirdPartyIntegration_1 = require("./routers/thirdPartyIntegration");
var uiuxExcellence_1 = require("./routers/uiuxExcellence");
var advancedAnalytics_1 = require("./routers/advancedAnalytics");
var auditTrail_1 = require("./routers/auditTrail");
var businessRules_1 = require("./routers/businessRules");
var tablePreferences_1 = require("./routers/tablePreferences");
var advancedReports_1 = require("./routers/advancedReports");
var paymentReconciliation_1 = require("./routers/paymentReconciliation");
var billing_1 = require("./routers/billing");
var orgBilling_1 = require("./routers/orgBilling");
var dunning_1 = require("./routers/dunning");
var integrationsMarketplace_1 = require("./routers/integrationsMarketplace");
var enterpriseFeatures_1 = require("./routers/enterpriseFeatures");
var subscriptions_1 = require("./routers/subscriptions");
var bulkOperations_1 = require("./routers/bulkOperations");
var organizationUsers_1 = require("./routers/organizationUsers");
var enterpriseTenants_1 = require("./routers/enterpriseTenants");
var emailTemplates_1 = require("./routers/emailTemplates");
var cronJobs_1 = require("./routers/cronJobs");
var orgPermissions_1 = require("./routers/orgPermissions");
var proposalTemplates_1 = require("./routers/proposalTemplates");
var contractTemplates_1 = require("./routers/contractTemplates");
var documentTemplates_1 = require("./routers/documentTemplates");
var tenantCommunications_1 = require("./routers/tenantCommunications");
var websiteAdmin_1 = require("./routers/websiteAdmin");
var onboarding_1 = require("./routers/onboarding");
var holidays_1 = require("./routers/holidays");
var payslips_1 = require("./routers/payslips");
var departmentalHeads_1 = require("./routers/departmentalHeads");
var p9Forms_1 = require("./routers/p9Forms");
var training_1 = require("./routers/training");
var employeeContracts_1 = require("./routers/employeeContracts");
var leaveBalances_1 = require("./routers/leaveBalances");
var disciplinary_1 = require("./routers/disciplinary");
var recruitment_1 = require("./routers/recruitment");
var hrAutomation_1 = require("./routers/hrAutomation");
var hrAttendance_1 = require("./routers/hrAttendance");
var hrEmployees_1 = require("./routers/hrEmployees");
var hrLeave_1 = require("./routers/hrLeave");
var hrUsers_1 = require("./routers/hrUsers");
var ictManagement_1 = require("./routers/ictManagement");
var hrPayroll_1 = require("./routers/hrPayroll");
// ============= NEW ACCOUNTING AUTOMATION ROUTERS =============
// These routers implement comprehensive accounting and sales procedures with Africa-focused compliance
var africaTaxCompliance_1 = require("./routers/africaTaxCompliance");
var imprestManagement_1 = require("./routers/imprestManagement");
var leads_1 = require("./routers/leads");
var accountingPolicies_1 = require("./routers/accountingPolicies");
var purchaseOrders_1 = require("./routers/purchaseOrders");
var workflowAutomation_1 = require("./routers/workflowAutomation");
var financialReporting_1 = require("./routers/financialReporting");
var journalEntries_1 = require("./routers/journalEntries");
// Admin-only procedure
var adminProcedure = trpc_1.protectedProcedure.use(function (_a) {
    var ctx = _a.ctx, next = _a.next;
    if (ctx.user.role !== 'admin' && ctx.user.role !== 'super_admin' && ctx.user.role !== 'staff') {
        throw new server_1.TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
    }
    return next({ ctx: ctx });
});
exports.appRouter = trpc_1.router({
    health: health_1.healthRouter,
    websiteContact: websiteContact_1.websiteContactRouter,
    system: systemRouter_1.systemRouter,
    users: users_1.usersRouter,
    clients: clients_1.clientsRouter,
    contacts: contacts_1.contactsRouter,
    search: search_1.searchRouter,
    invoices: invoices_1.invoicesRouter,
    projects: projects_1.projectsRouter,
    payments: payments_1.paymentsRouter,
    stripe: stripe_1.stripeRouter,
    mpesa: mpesa_1.mpesaRouter,
    emailQueue: emailQueue_1.emailQueueRouter,
    smsQueue: smsRouter_1.smsRouter,
    jobScheduler: schedulerRouter_1.schedulerRouter,
    estimates: estimates_1.estimatesRouter,
    products: products_1.productsRouter,
    receipts: receipts_1.receiptsRouter,
    services: services_1.servicesRouter,
    expenses: expenses_1.expensesRouter,
    opportunities: opportunities_1.opportunitiesRouter,
    employees: employees_1.employeesRouter,
    jobGroups: jobGroups_1.jobGroupsRouter,
    departments: departments_1.departmentsRouter,
    attendance: attendance_1.attendanceRouter,
    payroll: payroll_1.payrollRouter,
    leave: leave_1.leaveRouter,
    settings: settings_1.settingsRouter,
    dashboard: dashboard_1.dashboardRouter,
    gdpr: gdpr_1.gdprRouter,
    openapi: openapi_1.openAPIRouter,
    clientScoring: clientScoring_1.clientScoringRouter,
    analytics: analytics_1.analyticsRouter,
    chartOfAccounts: chartOfAccounts_1.chartOfAccountsRouter,
    email: email_1.emailRouter,
    reports: reports_1.reportsRouter,
    reportExport: reportExport_1.reportExportRouter,
    dataExport: dataExport_1.dataExportRouter,
    documentManagement: documentManagement_1.documentManagementRouter,
    importExport: importExport_1.importExportRouter,
    csvImportExport: csvImportExport_1.csvImportExportRouter,
    backupRestore: backupRestore_1.backupRestoreRouter,
    lineItems: lineItems_1.lineItemsRouter,
    approvals: approvals_1.approvalsRouter,
    savedFilters: savedFilters_1.savedFiltersRouter,
    ai: ai_1.aiRouter,
    // Aliases for legacy client callsites — keep mounted so existing client code works
    documents: documentManagement_1.documentManagementRouter,
    // Expose select settings-related procedures under legacy names used client-side
    roles: roles_1.rolesRouter,
    permissions: permissions_1.permissionsRouter,
    enhancedPermissions: enhancedPermissions_1.enhancedPermissionsRouter,
    enhancedDashboard: enhancedDashboard_1.enhancedDashboardRouter,
    bankReconciliation: bankReconciliation_1.bankReconciliationRouter,
    // Use the complete authRouter with login, register, logout, etc.
    auth: auth_1.authRouter,
    // ============= NOTIFICATIONS =============
    notifications: notifications_1.notificationsRouter,
    // ============= RECURRING INVOICES =============
    recurringInvoices: recurringInvoices_1.recurringInvoicesRouter,
    // ============= PAYMENT PLANS =============
    paymentPlans: paymentPlans_1.paymentPlansRouter,
    // ============= CLIENT TICKETS =============
    tickets: tickets_1.ticketsRouter,
    // ============= PROJECT MILESTONES =============
    projectMilestones: projectMilestones_1.projectMilestonesRouter,
    projectManagement: projectManagement_1.projectManagementRouter,
    // ============= TIME ENTRIES =============
    timeEntries: timeEntries_1.timeEntriesRouter,
    reminders: reminders_1.remindersRouter,
    favorites: favorites_1.favoritesRouter,
    // ============= SALES PIPELINE =============
    salesPipeline: salesPipeline_1.salesPipelineRouter,
    // ============= WORKFLOW AUTOMATION =============
    workflows: workflows_1.workflowsRouter,
    automationRules: automationRulesEngine_1.automationRulesRouter,
    // ============= SERVICE TEMPLATES & USAGE TRACKING =============
    serviceTemplates: serviceTemplates_1.serviceTemplatesRouter,
    // ============= BUDGET MANAGEMENT =============
    budget: budget_1.budgetRouter,
    budgets: budgets_1.budgetsRouter,
    // ============= HR ANALYTICS =============
    hrAnalytics: hrAnalytics_1.hrAnalyticsRouter,
    // ============= PAYROLL EXPORT =============
    payrollExport: payrollExport_1.payrollExportRouter,
    // ============= TAX COMPLIANCE REPORTS =============
    taxCompliance: taxCompliance_1.taxComplianceRouter,
    // ============= LOCAL PURCHASE ORDERS =============
    lpo: procurementLpo_1.lpoRouter,
    // ============= PROCUREMENT MANAGEMENT (Full CRUD) =============
    procurementMgmt: procurementManagement_1.procurementRouter,
    // ============= SUPPLIERS MANAGEMENT =============
    suppliers: suppliers_1.suppliersRouter,
    // ============= PROCUREMENT REQUESTS =============
    procurement: procurement_1.procurementRouter,
    // ============= IMPRESTS =============
    imprest: imprest_1.imprestRouter,
    imprestSurrender: imprestSurrender_1.imprestSurrenderRouter,
    // ============= INVENTORY MANAGEMENT =============
    inventory: inventory_1.inventoryRouter,
    // ============= FINANCE UTILITIES =============
    finance: finance_1.financeRouter,
    // ============= FINANCIAL REPORTS =============
    financialReports: financialReports_1.financialReportsRouter,
    // ============= PERFORMANCE REVIEWS =============
    performanceReviews: performanceReviews_1.performanceReviewsRouter,
    // ============= SALES REPORTS & ANALYTICS =============
    salesReports: salesReports_1.salesReportsRouter,
    advancedReporting: advancedReporting_1.advancedReportingRouter,
    // ============= COMMUNICATIONS =============
    communications: communications_1.communicationsRouter,
    // ============= STAFF CHAT =============
    staffChat: staffChat_1.staffChatRouter,
    // ============= CANNED RESPONSES =============
    cannedResponses: cannedResponses_1.cannedResponsesRouter,
    // ============= KNOWLEDGE BASE =============
    knowledgeBase: knowledgeBase_1.knowledgeBaseRouter,
    // ============= WAREHOUSES & STOCK =============
    warehouses: warehouses_1.warehousesRouter,
    // ============= ENHANCED PAYMENTS WITH COA =============
    enhancedPayments: enhancedPayments_1.enhancedPaymentsRouter,
    // ============= PROFESSIONAL BUDGETING =============
    professionalBudgeting: professionalBudgeting_1.professionalBudgetingRouter,
    // ============= MAINTENANCE & UTILITIES =============
    maintenance: maintenance_1.maintenanceRouter,
    // ============= AUTOMATION JOBS =============
    automationJobs: automationJobs_1.automationJobsRouter,
    // ============= BRAND CUSTOMIZATION =============
    brandCustomization: brandCustomization_1.brandCustomizationRouter,
    // ============= THEME CUSTOMIZATION =============
    themeCustomization: themeCustomization_1.themeCustomizationRouter,
    // ============= CUSTOM HOMEPAGE =============
    customHomepage: customHomepage_1.customHomepageRouter,
    // ============= PROCUREMENT - QUOTATIONS =============
    quotations: quotations_1.quotationsRouter,
    // ============= QUOTES =============
    quotes: quotes_1.quotesRouter,
    // ============= PROCUREMENT - DELIVERY NOTES =============
    deliveryNotes: procurementDeliveryNotes_1.deliveryNotesRouter,
    // ============= PROCUREMENT - GOODS RECEIVED NOTES =============
    grn: procurementGrn_1.grnRouter,
    // ============= ASSET MANAGEMENT =============
    assets: assets_1.assetsRouter,
    // ============= WARRANTY MANAGEMENT =============
    warranty: warranty_1.warrantyRouter,
    // ============= CONTRACT MANAGEMENT =============
    contracts: contracts_1.contractsRouter,
    notes: notes_1.notesRouter,
    // ============= MULTI-TENANCY / ENTERPRISE =============
    multiTenancy: multiTenancy_1.multiTenancyRouter,
    organizationUsers: organizationUsers_1.organizationUsersRouter,
    enterpriseTenants: enterpriseTenants_1.enterpriseTenantsRouter,
    // ============= CREDIT & DEBIT NOTES =============
    creditNotes: creditNotes_1.creditNotesRouter,
    debitNotes: debitNotes_1.debitNotesRouter,
    // ============= WORK ORDERS =============
    workOrders: workOrders_1.workOrdersRouter,
    // ============= SERVICE INVOICES =============
    serviceInvoices: serviceInvoices_1.serviceInvoicesRouter,
    // ============= REPORT BUILDER =============
    reportBuilder: reportBuilder_1.reportBuilderRouter,
    // ============= KPI TRACKING =============
    kpiTracking: kpiTracking_1.kpiTrackingRouter,
    // ============= FORECASTING =============
    forecasting: forecasting_1.forecastingRouter,
    // ============= ACTIVITY TRAIL =============
    activityTrail: activityTrail_1.activityTrailRouter,
    // ============= SYSTEM HEALTH =============
    systemHealth: systemHealth_1.systemHealthRouter,
    // ============= ENTERPRISE / ADVANCED FEATURES =============
    advancedAutomation: advancedAutomation_1.advancedAutomationRouter,
    advancedExport: advancedExport_1.advancedExportRouter,
    advancedSecurity: advancedSecurity_1.advancedSecurityRouter,
    aiAgents: aiAgents_1.aiAgentsRouter,
    aiInsights: aiInsights_1.aiInsightsRouter,
    aiml: aiml_1.aimlRouter,
    analyticsEngine: analyticsEngine_1.analyticsEngineRouter,
    apiMonetization: apiMonetization_1.apiMonetizationRouter,
    businessIntelligence: businessIntelligence_1.businessIntelligenceRouter,
    cloudInfrastructure: cloudInfrastructure_1.cloudInfrastructureRouter,
    cohortAnalytics: cohortAnalytics_1.cohortAnalyticsRouter,
    dashboardBuilder: dashboardBuilder_1.dashboardBuilderRouter,
    developerTools: developerTools_1.developerToolsRouter,
    emailCalendar: emailCalendar_1.emailCalendarRouter,
    enterpriseSecurity: enterpriseSecurity_1.enterpriseSecurityRouter,
    executiveDashboard: executiveDashboard_1.executiveDashboardRouter,
    executiveSuite: executiveSuite_1.executiveSuiteRouter,
    fileStorage: fileStorage_1.fileStorageRouter,
    globalFeatures: globalFeatures_1.globalFeaturesRouter,
    mobileApp: mobileApp_1.mobileAppRouter,
    mobileApps: mobileApps_1.mobileAppsRouter,
    mobileResponsive: mobileResponsive_1.mobileResponsiveRouter,
    nativeMobileApps: nativeMobileApps_1.nativeMobileAppsRouter,
    partnerChannel: partnerChannel_1.partnerChannelRouter,
    performanceOptimization: performanceOptimization_1.performanceOptimizationRouter,
    performanceScaling: performanceScaling_1.performanceScalingRouter,
    realtimeCollaboration: realtimeCollaboration_1.realtimeCollaborationRouter,
    securityCompliance: securityCompliance_1.securityComplianceRouter,
    sysAdmin: sysAdmin_1.sysAdminRouter,
    thirdPartyIntegrations: thirdPartyIntegration_1.integrationRouter,
    uiuxExcellence: uiuxExcellence_1.uiuxExcellenceRouter,
    advancedAnalytics: advancedAnalytics_1.advancedAnalyticsRouter,
    auditTrail: auditTrail_1.auditTrailRouter,
    businessRules: businessRules_1.businessRulesRouter,
    tablePreferences: tablePreferences_1.tablePreferencesRouter,
    importValidation: importValidation_1.importValidationRouter,
    // ============= ADVANCED REPORTS (Quote metrics, conversion, forecasting) =============
    advancedReports: advancedReports_1.advancedReportsRouter,
    // ============= PAYMENT RECONCILIATION =============
    paymentReconciliation: paymentReconciliation_1.paymentReconciliationRouter,
    // ============= BILLING & SUBSCRIPTIONS =============
    billing: billing_1.billingRouter,
    orgBilling: orgBilling_1.orgBillingRouter,
    dunning: dunning_1.dunningRouter,
    subscriptions: subscriptions_1.subscriptionsRouter,
    // ============= INTEGRATIONS MARKETPLACE =============
    integrationsMarketplace: integrationsMarketplace_1.integrationsMarketplaceRouter,
    // ============= SMS AUTOMATION =============
    smsAutomation: smsAutomation_1.smsAutomationRouter,
    // ============= ENTERPRISE FEATURES =============
    enterpriseFeatures: enterpriseFeatures_1.enterpriseFeaturesRouter,
    // ============= BULK OPERATIONS =============
    bulkOperations: bulkOperations_1.bulkOperationsRouter,
    // ============= EMAIL TEMPLATES =============
    emailTemplates: emailTemplates_1.emailTemplatesRouter,
    // ============= CRON JOBS =============
    cronJobs: cronJobs_1.cronJobsRouter,
    // ============= ORGANIZATION PERMISSIONS =============
    orgPermissions: orgPermissions_1.orgPermissionsRouter,
    // ============= PROPOSAL TEMPLATES =============
    proposalTemplates: proposalTemplates_1.proposalTemplatesRouter,
    // ============= CONTRACT TEMPLATES =============
    contractTemplates: contractTemplates_1.contractTemplatesRouter,
    // ============= DOCUMENT TEMPLATES (General) =============
    documentTemplates: documentTemplates_1.documentTemplatesRouter,
    // ============= TENANT COMMUNICATIONS =============
    tenantCommunications: tenantCommunications_1.tenantCommunicationsRouter,
    // ============= WEBSITE ADMIN =============
    websiteAdmin: websiteAdmin_1.websiteAdminRouter,
    // ============= HR AUTOMATION =============
    onboarding: onboarding_1.onboardingRouter,
    holidays: holidays_1.holidaysRouter,
    payslips: payslips_1.payslipRouter,
    training: training_1.trainingRouter,
    employeeContracts: employeeContracts_1.employeeContractsRouter,
    leaveBalances: leaveBalances_1.leaveBalancesRouter,
    disciplinary: disciplinary_1.disciplinaryRouter,
    recruitment: recruitment_1.recruitmentRouter,
    hrAutomation: hrAutomation_1.hrAutomationRouter,
    hrEmployees: hrEmployees_1.hrEmployeesRouter,
    hrAttendance: hrAttendance_1.hrAttendanceRouter,
    hrLeave: hrLeave_1.hrLeaveRouter,
    hrUsers: hrUsers_1.hrUsersRouter,
    hrPayroll: hrPayroll_1.hrPayrollRouter,
    // ============= DEPARTMENTAL HEADS & P9 FORMS =============
    departmentalHeads: departmentalHeads_1.departmentalHeadsRouter,
    p9Forms: p9Forms_1.p9FormRouter,
    // ============= ICT MANAGEMENT =============
    ictManagement: ictManagement_1.ictManagementRouter,
    // ============= ACCOUNTING AUTOMATION (NEW) =============
    // Multi-country tax compliance with Africa focus
    africaTaxCompliance: africaTaxCompliance_1.taxComplianceRouter,
    // Imprest management (petty cash/advances)
    imprestManagement: imprestManagement_1.imprestsRouter,
    // Sales leads management with conversion to opportunities
    leads: leads_1.leadsRouter,
    // Organization accounting policies with country-specific templates
    accountingPolicies: accountingPolicies_1.accountingPoliciesRouter,
    // Purchase order lifecycle with goods receipt tracking
    purchaseOrders: purchaseOrders_1.purchaseOrdersRouter,
    // Workflow automation for complete document chains
    workflowAutomation: workflowAutomation_1.workflowAutomationRouter,
    // Financial reporting (Income Statement, Balance Sheet, Cash Flow, Tax Summary)
    financialReporting: financialReporting_1.financialReportingRouter,
    // Journal entries with double-entry validation
    journalEntries: journalEntries_1.journalEntriesRouter,
    // ============= PHASE 4: ENTERPRISE EXPANSION =============
    // Data import/export with bulk operations
    dataMigration: dataMigration_1.dataMigrationRouter,
    // Monitoring, health checks, and observability
    monitoring: monitoring_1.monitoringRouter
});
