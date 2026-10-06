"use strict";
exports.__esModule = true;
var react_1 = require("react");
var tooltip_1 = require("@/components/ui/tooltip");
var wouter_1 = require("wouter");
var ErrorBoundary_1 = require("./components/ErrorBoundary");
var ThemeContext_1 = require("./contexts/ThemeContext");
var NotificationsContext_1 = require("./contexts/NotificationsContext");
var BrandContext_1 = require("./contexts/BrandContext");
var ThemeCustomizationContext_1 = require("./contexts/ThemeCustomizationContext");
var CurrencyContext_1 = require("./pages/website/CurrencyContext");
var lucide_react_1 = require("lucide-react");
var useAuthWithPersistence_1 = require("@/_core/hooks/useAuthWithPersistence");
var permissions_1 = require("@/lib/permissions");
// lazily load all page components so the main bundle stays small and the
// dashboard (and other routes) only fetch what they actually need on
// navigation. this dramatically improves initial load time.
var NotFound = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("@/pages/NotFound"); }); });
var Home = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/Home"); }); });
var BusinessDashboard = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/Dashboard"); }); });
var Projects = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/Projects"); }); });
var ProjectDetails = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/ProjectDetails"); }); });
var Profile = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/Profile"); }); });
var Security = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/Security"); }); });
var MFA = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/MFA"); }); });
var Dashboard = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/dashboards/Dashboard"); }); });
var DashboardHome = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/dashboards/DashboardHome"); }); });
var Clients = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/Clients"); }); });
var ClientDetails = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/ClientDetails"); }); });
var EditClient = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/EditClient"); }); });
var Contacts = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/Contacts"); }); });
var ContactDetails = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/ContactDetails"); }); });
var Invoices = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/Invoices"); }); });
var InvoiceDetails = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/InvoiceDetails"); }); });
var CreateInvoice = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/CreateInvoice"); }); });
var EditInvoice = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/EditInvoice"); }); });
var RecurringInvoices = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/RecurringInvoices"); }); });
var RecurringExpenses = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/RecurringExpenses"); }); });
var PaymentPlans = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/PaymentPlans"); }); });
var ProjectMilestones = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/ProjectMilestones"); }); });
var TimeTracking = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/TimeTracking"); }); });
var SalesPipeline = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/SalesPipeline"); }); });
var Estimates = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/Estimates"); }); });
var EstimateDetails = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/EstimateDetails"); }); });
var CreateEstimate = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/CreateEstimate"); }); });
var EditEstimate = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/EditEstimate"); }); });
var Receipts = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/Receipts"); }); });
var ReceiptDetails = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/ReceiptDetails"); }); });
var CreateReceipt = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/CreateReceipt"); }); });
var EditReceipt = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/EditReceipt"); }); });
var TicketsPage = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/Tickets"); }); });
var FinanceSettingsPage = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/FinanceSettings"); }); });
var Opportunities = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/Opportunities"); }); });
var Payments = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/Payments"); }); });
var CreatePayment = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/CreatePayment"); }); });
var PaymentReconciliation = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/PaymentReconciliation"); }); });
var CreateProduct = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/CreateProduct"); }); });
var CreateService = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/CreateService"); }); });
var CreateExpense = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/CreateExpense"); }); });
var CreateOpportunity = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/CreateOpportunity"); }); });
var CreateEmployee = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/CreateEmployee"); }); });
var CreateDepartment = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/CreateDepartment"); }); });
var CreateAttendance = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/CreateAttendance"); }); });
var CreatePayroll = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/CreatePayroll"); }); });
var CreateLeaveRequest = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/CreateLeaveRequest"); }); });
var CreateProject = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/CreateProject"); }); });
var EditProject = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/EditProject"); }); });
var EditProduct = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/EditProduct"); }); });
var EditService = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/EditService"); }); });
var EditExpense = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/EditExpense"); }); });
var EditEmployee = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/EditEmployee"); }); });
var EditOpportunity = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/EditOpportunity"); }); });
var EditPayment = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/EditPayment"); }); });
var Products = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/Products"); }); });
var Services = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/Services"); }); });
var HR = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/HR"); }); });
var Employees = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/Employees"); }); });
var EmployeeDetails = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/EmployeeDetails"); }); });
var Attendance = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/Attendance"); }); });
var Payroll = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/Payroll"); }); });
var LeaveManagement = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/LeaveManagement"); }); });
var JobGroups = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/JobGroups"); }); });
var JobGroupDetails = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/JobGroupDetails"); }); });
var Onboarding = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/Onboarding"); }); });
var Holidays = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/Holidays"); }); });
var Payslips = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/Payslips"); }); });
var Training = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/Training"); }); });
var Reports = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/Reports"); }); });
var Settings = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("@/pages/Settings"); }); });
var TestPDFGeneration = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("@/pages/TestPDFGeneration"); }); });
var Expenses = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/Expenses"); }); });
var BankReconciliation = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/BankReconciliation"); }); });
var EditBankReconciliation = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/EditBankReconciliation"); }); });
var ChartOfAccounts = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/ChartOfAccounts"); }); });
var Departments = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/Departments"); }); });
var DepartmentDetails = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/DepartmentDetails"); }); });
var PaymentDetails = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/PaymentDetails"); }); });
var ProductDetails = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/ProductDetails"); }); });
var ServiceDetails = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/ServiceDetails"); }); });
var OpportunityDetails = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/OpportunityDetails"); }); });
var Login = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/Login"); }); });
var ChangePassword = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/ChangePassword"); }); });
var EnhancedChangePassword = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/EnhancedChangePassword"); }); });
var BillingDashboard = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/BillingDashboard"); }); });
var EnhancedReceiptManagement = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/EnhancedReceiptManagement"); }); });
var Signup = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/Signup"); }); });
var ForgotPassword = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/ForgotPassword"); }); });
var ResetPassword = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/ResetPassword"); }); });
var ClientPortal = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/ClientPortal"); }); });
var AttendanceDetails = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("@/pages/AttendanceDetails"); }); });
var PayrollDetails = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("@/pages/PayrollDetails"); }); });
var LeaveManagementDetails = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("@/pages/LeaveManagementDetails"); }); });
var ReportsDetails = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("@/pages/ReportsDetails"); }); });
var BankReconciliationDetails = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("@/pages/BankReconciliationDetails"); }); });
var ChartOfAccountsDetails = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("@/pages/ChartOfAccountsDetails"); }); });
var EditChartOfAccounts = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("@/pages/EditChartOfAccounts"); }); });
var ExpensesDetails = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("@/pages/ExpensesDetails"); }); });
var HRDetails = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("@/pages/HRDetails"); }); });
var Account = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/Account"); }); });
var Sales = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/Sales"); }); });
var Accounting = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/Accounting"); }); });
var CreateUser = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/CreateUser"); }); });
var EditUser = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/EditUser"); }); });
var UserDetails = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/UserDetails"); }); });
var AdminManagement = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/AdminManagement"); }); });
var AdminEmailTemplates = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/admin/AdminEmailTemplates"); }); });
var AdminCronJobs = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/admin/AdminCronJobs"); }); });
var SystemHealthDashboard = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/admin/SystemHealthDashboard"); }); });
var SystemLogsViewer = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/admin/SystemLogsViewer"); }); });
var SessionManager = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/admin/SessionManager"); }); });
var ProposalTemplates = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/ProposalTemplates"); }); });
var ContractTemplates = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/ContractTemplates"); }); });
var DocumentTemplates = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/DocumentTemplates"); }); });
var TenantCommunications = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/admin/TenantCommunications"); }); });
var CreateClient = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/CreateClient"); }); });
var EditDepartment = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/EditDepartment"); }); });
var EditAttendance = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/EditAttendance"); }); });
var EditPayroll = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/EditPayroll"); }); });
var EditLeave = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/EditLeave"); }); });
var RoleBasedDashboard = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./components/RoleBasedDashboard"); }); });
var SuperAdminDashboard = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/dashboards/SuperAdminDashboard"); }); });
var MultiTenancy = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/MultiTenancy"); }); });
var AdminDashboard = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/dashboards/AdminDashboard"); }); });
var HRDashboard = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/dashboards/HRDashboard"); }); });
var HRAdminDashboard = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/dashboards/HRAdminDashboard"); }); });
var AccountantDashboard = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/dashboards/AccountantDashboard"); }); });
var StaffDashboard = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/dashboards/StaffDashboard"); }); });
var ProjectManagerDashboard = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/dashboards/ProjectManagerDashboard"); }); });
var ProcurementManagerDashboard = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/dashboards/ProcurementManagerDashboard"); }); });
var SalesManagerDashboard = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/dashboards/SalesManagerDashboard"); }); });
var ICTDashboard = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/dashboards/ICTDashboard"); }); });
var GlobalSettings = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/GlobalSettings"); }); });
var UnifiedLanding = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/UnifiedLanding"); }); });
var LandingPage = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/LandingPage"); }); });
var WebsiteFeatures = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/website/Features"); }); });
var WebsiteFeatureDetail = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/website/FeatureDetail"); }); });
var WebsitePricing = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/website/Pricing"); }); });
var WebsiteAbout = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/website/About"); }); });
var WebsiteContact = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/website/Contact"); }); });
var CustomerPortal = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/CustomerPortal"); }); });
var Checkout = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/Checkout"); }); });
var Roles = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/Roles.tsx"); }); });
var AIHub = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/AIHub"); }); });
var FinancialDashboard = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/FinancialDashboard"); }); });
var WorkflowAutomation = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/WorkflowAutomation"); }); });
var Demo = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/Demo"); }); });
var Blog = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/Blog"); }); });
var BecomeAPartner = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/BecomeAPartner"); }); });
var BookADemo = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/BookADemo"); }); });
var HRAutomation = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/HRAutomation"); }); });
var HRPayrollManagement = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/HRPayrollManagement"); }); });
var PayrollApprovals = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/PayrollApprovals"); }); });
var CreateSalaryStructure = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/CreateSalaryStructure"); }); });
var CreateAllowance = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/CreateAllowance"); }); });
var CreateDeduction = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/CreateDeduction"); }); });
var CreateBenefit = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/CreateBenefit"); }); });
var EditSalaryStructure = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/EditSalaryStructure"); }); });
var EditAllowance = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/EditAllowance"); }); });
var EditDeduction = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/EditDeduction"); }); });
var EditBenefit = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/EditBenefit"); }); });
var CreateContact = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/CreateContact"); }); });
var EditContact = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/EditContact"); }); });
var CreateTicket = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/CreateTicket"); }); });
var EditTicket = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/EditTicket"); }); });
var EditWarranty = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/EditWarranty"); }); });
var KenyanPayrollCalculator = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/KenyanPayrollCalculator"); }); });
var OverduePayments = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/OverduePayments"); }); });
var PaymentReports = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/PaymentReports"); }); });
var TaxComplianceReportsPage = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/TaxComplianceReports"); }); });
var SalesReportsPage = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/SalesReports"); }); });
var FinancialReportsPage = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/FinancialReports"); }); });
var CustomerReportsPage = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/CustomerReports"); }); });
var ProjectReportsPage = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/ProjectReports"); }); });
var HRReportsPage = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/HRReports"); }); });
var PayslipManagementPage = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/PayslipManagement"); }); });
var ImprestsPage = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/Imprests"); }); });
var BudgetsPage = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/Budgets"); }); });
var BudgetDetails = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/BudgetDetails"); }); });
var CreateBudget = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/CreateBudget"); }); });
var EditBudget = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/EditBudget"); }); });
var ProfessionalBudgeting = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./components/ProfessionalBudgeting"); }); });
var ProcurementLPOs = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./components/ProcurementLPOs"); }); });
var ProcurementOrders = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./components/ProcurementOrders"); }); });
var ProcurementImprests = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./components/ProcurementImprests"); }); });
var HRAnalyticsPage = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/HRAnalyticsPage"); }); });
var LPOsPage = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/LPOs"); }); });
var CreateLPO = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/CreateLPO"); }); });
var EditLPO = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/EditLPO"); }); });
var LPODetails = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/LPODetails"); }); });
var OrdersPage = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/Orders"); }); });
var CreateOrder = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/CreateOrder"); }); });
var EditOrder = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/EditOrder"); }); });
var ImportExcelPage = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/ImportExcel"); }); });
var BrandCustomization = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/tools/BrandCustomization"); }); });
var CustomHomepageBuilder = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/tools/CustomHomepageBuilder"); }); });
var ThemeCustomization = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/tools/ThemeCustomization"); }); });
var SystemSettings = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/tools/SystemSettings"); }); });
var IntegrationGuides = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/tools/IntegrationGuides"); }); });
var Integrations = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/Integrations"); }); });
var DepartmentPayrollReports = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/DepartmentPayrollReports"); }); });
var SalaryStructures = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/SalaryStructures"); }); });
var AllowancesDeductions = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/AllowancesDeductions"); }); });
var Benefits = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/Benefits"); }); });
var TaxInformation = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/TaxInformation"); }); });
var SubscriptionDetails = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/SubscriptionDetails"); }); });
var CustomReportBuilder = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/CustomReportBuilder"); }); });
var Communications = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/Communications"); }); });
var CreateCommunication = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/CreateCommunication"); }); });
var Messages = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/Messages"); }); });
var ActivityPage = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/Activity"); }); });
var ICTSystemSettings = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/ICTSystemSettings"); }); });
var ICTAnalytics = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/ICTAnalytics"); }); });
var DatabaseManagement = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/admin/DatabaseManagement"); }); });
var CalendarPage = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/Calendar"); }); });
var Approvals = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/Approvals"); }); });
var Notifications = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/Notifications"); }); });
var AccountSettings = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/AccountSettings"); }); });
var PrivacyPolicy = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/PrivacyPolicy"); }); });
var TermsAndConditions = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/TermsAndConditions"); }); });
var Documentation = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/Documentation"); }); });
var DocumentManagement = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/DocumentManagement"); }); });
var UserGuide = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/UserGuide"); }); });
var OrganizationUsersManagement = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/OrganizationUsersManagement"); }); });
var EnterpriseTenantsManagement = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/EnterpriseTenantsManagement"); }); });
var TroubleshootingGuide = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/TroubleshootingGuide"); }); });
var CreateImprest = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/CreateImprest"); }); });
var CreatePurchaseOrder = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/CreatePurchaseOrder"); }); });
var Inventory = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/Inventory"); }); });
var Suppliers = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/Suppliers"); }); });
var SupplierDetails = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/SupplierDetails"); }); });
var CreateSupplier = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/CreateSupplier"); }); });
var EditSupplier = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/EditSupplier"); }); });
var ProcurementMaster = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/ProcurementMaster"); }); });
var ExpenseBudgetReport = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/ExpenseBudgetReport"); }); });
var HRAnalyticsDashboard = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/HRAnalyticsDashboard"); }); });
var ProjectsManagement = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/ProjectsManagement"); }); });
var AccountingManagement = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/AccountingManagement"); }); });
var ContractManagement = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/ContractManagement"); }); });
var ContractDetails = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/ContractDetails"); }); });
var AssetManagement = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/AssetManagement"); }); });
var AssetDetails = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/AssetDetails"); }); });
var WarrantyManagement = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/WarrantyManagement"); }); });
var Quotations = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/Quotations"); }); });
var QuotationDetails = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/QuotationDetails"); }); });
var DeliveryNotes = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/DeliveryNotes"); }); });
var DeliveryNoteDetails = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/DeliveryNoteDetails"); }); });
var GRN = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/GRN"); }); });
var GRNDetails = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/GRNDetails"); }); });
var OrderDetails = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/OrderDetails"); }); });
var ImprestDetails = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/ImprestDetails"); }); });
var Proposals = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/Proposals"); }); });
var EditProposal = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/EditProposal"); }); });
var ProposalDetails = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/ProposalDetails"); }); });
var ServiceInvoices = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/ServiceInvoices"); }); });
var CreateServiceInvoice = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/CreateServiceInvoice"); }); });
var EditServiceInvoice = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/EditServiceInvoice"); }); });
var CreditNotes = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/CreditNotes"); }); });
var CreateCreditNote = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/CreateCreditNote"); }); });
var DebitNotes = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/DebitNotes"); }); });
var CreateDebitNote = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/CreateDebitNote"); }); });
var DebitNoteDetails = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/DebitNoteDetails"); }); });
var EditDebitNote = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/EditDebitNote"); }); });
var CreditNoteDetails = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/CreditNoteDetails"); }); });
var EditCreditNote = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/EditCreditNote"); }); });
var CreateWarranty = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/CreateWarranty"); }); });
var WarrantyDetails = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/WarrantyDetails"); }); });
var Quotes = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/Quotes"); }).then(function (m) { return ({ "default": m.Quotes }); }); });
var QuoteDetails = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/QuoteDetails"); }).then(function (m) { return ({ "default": m.QuoteDetails }); }); });
var CreateQuote = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/CreateQuote"); }); });
var Forecasting = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/Forecasting"); }); });
var PerformanceReviews = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/PerformanceReviews"); }); });
var EmployeeContracts = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/EmployeeContracts"); }); });
var LeaveBalances = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/LeaveBalances"); }); });
var DisciplinaryRecords = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/DisciplinaryRecords"); }); });
var Recruitment = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/Recruitment"); }); });
var ServiceTemplates = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/ServiceTemplates"); }); });
var CreateServiceTemplate = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/CreateServiceTemplate"); }); });
var ServiceTemplateDetails = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/ServiceTemplateDetails"); }); });
var WorkOrders = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/WorkOrders"); }); });
var CreateWorkOrder = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/CreateWorkOrder"); }); });
var EditWorkOrder = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/EditWorkOrder"); }); });
var ReportBuilder = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/ReportBuilder"); }); });
var KPITracking = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/KPITracking"); }); });
var ActivityTrail = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/ActivityTrail"); }); });
var StaffChat = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/StaffChat"); }); });
var CannedResponses = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/CannedResponses"); }); });
var ProjectAnalytics = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/ProjectAnalytics"); }); });
var SystemHealth = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/SystemHealth"); }); });
var HRAnalytics = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/HRAnalytics"); }); });
var AdvancedAnalytics = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/AdvancedAnalytics"); }); });
var RevenueForecasting = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/RevenueForecasting"); }); });
var ConversionAnalytics = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/ConversionAnalytics"); }); });
var CustomFieldsPage = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/tools/CustomFields"); }); });
var EmailQueue = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/EmailQueue"); }); });
var SmsQueue = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/SmsQueue"); }); });
var GlobalSearch = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/Search"); }); });
var BackupManagement = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/BackupManagement"); }); });
var EnterpriseSettings = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/EnterpriseSettings"); }); });
var ExecutiveDashboard = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/ExecutiveDashboard"); }); });
var NotificationCenter = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/NotificationCenter"); }); });
var BiTools = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/BiTools"); }); });
var ChurnPrediction = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/ChurnPrediction"); }); });
var FunnelAnalysis = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/FunnelAnalysis"); }); });
var CohortAnalysis = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/CohortAnalysis"); }); });
var DashboardBuilderPro = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/DashboardBuilderPro"); }); });
var ClientPerformancePage = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/ClientPerformance"); }); });
var OrgDashboard = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgDashboard"); }); });
var OrgSettings = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgSettings"); }); });
var OrgStaff = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgStaff"); }); });
var OrgBilling = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgBilling"); }); });
var OrgCRM = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgCRM"); }); });
var OrgContacts = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgContacts"); }); });
var OrgLeads = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgLeads"); }); });
var OrgEstimates = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgEstimates"); }); });
var OrgCreateClient = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgCreateClient"); }); });
var OrgClientDetail = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgClientDetail"); }); });
var OrgSalesPipeline = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgSalesPipeline"); }); });
var OrgInvoices = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgInvoices"); }); });
var OrgCreateInvoice = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgCreateInvoice"); }); });
var OrgPayments = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgPayments"); }); });
var OrgExpenses = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgExpenses"); }); });
var OrgCreateExpense = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgCreateExpense"); }); });
var OrgExpenseDetail = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgExpenseDetail"); }); });
var OrgEditExpense = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgEditExpense"); }); });
var OrgProjects = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgProjects"); }); });
var OrgCreateProject = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgCreateProject"); }); });
var OrgProjectDetail = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgProjectDetail"); }); });
var OrgEditProject = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgEditProject"); }); });
var OrgTickets = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgTickets"); }); });
var OrgCreateTicket = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgCreateTicket"); }); });
var OrgTicketDetail = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgTicketDetail"); }); });
var OrgEditTicket = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgEditTicket"); }); });
var OrgInvoiceDetail = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgInvoiceDetail"); }); });
var OrgEditInvoice = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgEditInvoice"); }); });
var OrgHR = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgHR"); }); });
var OrgReports = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgReports"); }); });
var OrgCalendar = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgCalendar"); }); });
var OrgActivity = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgActivity"); }); });
var OrgApprovals = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgApprovals"); }); });
var OrgAccounting = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgAccounting"); }); });
var OrgBudgets = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgBudgets"); }); });
var OrgLeave = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgLeave"); }); });
var OrgAttendance = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgAttendance"); }); });
var OrgProcurement = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgProcurement"); }); });
var OrgContracts = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgContracts"); }); });
var OrgCreateContract = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgCreateContract"); }); });
var OrgWorkOrders = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgWorkOrders"); }); });
var OrgWorkOrderDetail = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgWorkOrderDetail"); }); });
var OrgEditWorkOrder = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgEditWorkOrder"); }); });
var OrgCreateWorkOrder = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgCreateWorkOrder"); }); });
var OrgCreateProcurement = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgCreateProcurement"); }); });
var OrgCreateLeave = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgCreateLeave"); }); });
var OrgContractDetail = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgContractDetail"); }); });
var OrgEditContract = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgEditContract"); }); });
var OrgLeaveDetail = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgLeaveDetail"); }); });
var OrgEditLeave = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgEditLeave"); }); });
var OrgCommunications = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgCommunications"); }); });
var OrgAI = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgAI"); }); });
var OrgModulePage = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgModulePage"); }); });
var OrgPaymentDetail = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgPaymentDetail"); }); });
var OrgEditPayment = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgEditPayment"); }); });
var OrgEstimateDetail = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgEstimateDetail"); }); });
var OrgEditEstimate = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgEditEstimate"); }); });
var OrgLeadDetail = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgLeadDetail"); }); });
var OrgEditLead = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgEditLead"); }); });
var OrgContactDetail = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgContactDetail"); }); });
var OrgEditContact = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgEditContact"); }); });
var OrgBudgetDetail = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgBudgetDetail"); }); });
var OrgEditBudget = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgEditBudget"); }); });
var OrgProcurementDetail = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgProcurementDetail"); }); });
var OrgEditProcurement = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgEditProcurement"); }); });
var OrgCreateAttendance = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgCreateAttendance"); }); });
var OrgAttendanceDetail = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgAttendanceDetail"); }); });
var OrgEditAttendance = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgEditAttendance"); }); });
var OrgApprovalDetail = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgApprovalDetail"); }); });
var OrgEditApproval = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgEditApproval"); }); });
var OrgReceipts = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgReceipts"); }); });
var OrgCreditNotes = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgCreditNotes"); }); });
var OrgDebitNotes = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgDebitNotes"); }); });
var OrgSubscriptions = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgSubscriptions"); }); });
var OrgChartOfAccounts = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgChartOfAccounts"); }); });
var OrgBankReconciliation = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgBankReconciliation"); }); });
var OrgFinancialDashboard = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgFinancialDashboard"); }); });
var OrgForecasting = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgForecasting"); }); });
var OrgTaxCompliance = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgTaxCompliance"); }); });
var OrgSuppliers = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgSuppliers"); }); });
var OrgPurchaseOrders = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgPurchaseOrders"); }); });
var OrgOrders = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgOrders"); }); });
var OrgImprests = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgImprests"); }); });
var OrgProducts = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgProducts"); }); });
var OrgInventory = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgInventory"); }); });
var OrgDeliveryNotes = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgDeliveryNotes"); }); });
var OrgGRN = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgGRN"); }); });
var OrgServices = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgServices"); }); });
var OrgServiceTemplates = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgServiceTemplates"); }); });
var OrgServiceInvoices = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgServiceInvoices"); }); });
var OrgProposals = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgProposals"); }); });
var OrgQuotations = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgQuotations"); }); });
var OrgTasks = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgTasks"); }); });
var OrgAssets = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgAssets"); }); });
var OrgWarranty = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgWarranty"); }); });
var OrgEmployees = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgEmployees"); }); });
var OrgDepartments = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgDepartments"); }); });
var OrgPayroll = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgPayroll"); }); });
var OrgJobGroups = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgJobGroups"); }); });
var OrgPerformanceReviews = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgPerformanceReviews"); }); });
var OrgCannedResponses = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgCannedResponses"); }); });
var OrgKnowledgebase = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgKnowledgebase"); }); });
var OrgStaffChat = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgStaffChat"); }); });
var OrgDocuments = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgDocuments"); }); });
var OrgTimesheets = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/org/OrgTimesheets"); }); });
var SuperAdminPricingTiers = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/admin/SuperAdminPricingTiers"); }); });
var MaintenanceAdmin = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/MaintenanceAdmin"); }); });
var WebsiteAdmin = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/admin/WebsiteAdmin"); }); });
var Tasks = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/Tasks"); }); });
var Leads = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/Leads"); }); });
var LeadsDetails = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/LeadsDetails"); }); });
var Subscriptions = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/Subscriptions"); }); });
var KnowledgeBase = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/KnowledgeBase"); }); });
var Warehouses = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/Warehouses"); }); });
var Notes = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/Notes"); }); });
var Timesheets = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/Timesheets"); }); });
var TimesheetDetails = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/TimesheetDetails"); }); });
var AuditLogs = react_1["default"].lazy(function () { return Promise.resolve().then(function () { return require("./pages/AuditLogs"); }); });
/*
 * Main router with role-based dashboard routing
 *
 * IMPORTANT: Route ordering matters in wouter!
 * - Static routes (like /create) must come BEFORE dynamic routes (like /:id)
 * - Otherwise, "create" will be treated as an :id parameter
 *
 * Authentication flow:
 * 1. User logs in at /login
 * 2. Login component stores token and user data in localStorage
 * 3. User is redirected based on role:
 *    - super_admin -> /crm/super-admin
 *    - admin -> /admin/management
 *    - hr -> /crm/hr
 *    - accountant -> /crm/accountant
 *    - staff -> /crm/staff
 *    - client -> /crm/client-portal
 *    - project_manager -> /crm/project-manager
 *    - procurement_manager -> /crm/procurement
 *    - ict_manager-> /crm/ict
 *    - user -> /crm (default)
 */
/**
 * RouteGuard enforces client-side RBAC.
 * Wraps the entire router — checks auth + role access on every navigation.
 */
function RouteGuard(_a) {
    var children = _a.children;
    var _b = wouter_1.useLocation(), location = _b[0], navigate = _b[1];
    var _c = useAuthWithPersistence_1.useAuthWithPersistence(), user = _c.user, loading = _c.loading, isAuthenticated = _c.isAuthenticated;
    var _d = react_1["default"].useState(false), showSpinnerTimeout = _d[0], setShowSpinnerTimeout = _d[1];
    // Timeout safety: if loading state persists >5s on a public route, render anyway
    react_1["default"].useEffect(function () {
        if (!loading) {
            setShowSpinnerTimeout(false);
            return;
        }
        var timeout = setTimeout(function () { return setShowSpinnerTimeout(true); }, 5000);
        return function () { return clearTimeout(timeout); };
    }, [loading]);
    // Debug: expose auth state to console to trace spinner issues
    try {
        // avoid throwing in SSR; keep minimal
        // eslint-disable-next-line no-console
        console.debug('[RouteGuard] auth', { loading: loading, isAuthenticated: isAuthenticated, user: user, location: location });
    }
    catch (e) { }
    var isPublic = permissions_1.PUBLIC_ROUTES.some(function (r) {
        return location === r ||
            (r !== "/" && (location.startsWith(r + "/") || location.startsWith(r + "?")));
    });
    react_1.useEffect(function () {
        if (loading || isPublic)
            return;
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }
        // Org isolation: tenant org users must stay within /org/* or public routes
        if ((user === null || user === void 0 ? void 0 : user.organizationId) && !location.startsWith("/org/") && !isPublic) {
            var slug = user.organizationSlug
                || (function () { try {
                    return JSON.parse(localStorage.getItem("auth-user") || "{}").organizationSlug;
                }
                catch (_a) {
                    return null;
                } })();
            if (slug) {
                navigate("/org/" + slug + "/dashboard");
                return;
            }
        }
        if (user && !user.organizationId && !permissions_1.canAccessRoute(user.role, location)) {
            navigate(permissions_1.getDashboardUrl(user.role));
        }
    }, [location, loading, isAuthenticated, user]);
    // Public routes always render immediately — never block with spinner
    if (isPublic) {
        return react_1["default"].createElement(react_1["default"].Fragment, null, children);
    }
    // For protected routes: show spinner while loading, then enforce auth checks
    if (loading && !showSpinnerTimeout) {
        return (react_1["default"].createElement("div", { className: "min-h-screen flex items-center justify-center" },
            react_1["default"].createElement(lucide_react_1.Loader2, { className: "size-8 animate-spin text-blue-500" })));
    }
    // After timeout or loading done: check auth for protected routes
    if (!isAuthenticated && !loading)
        return null;
    if ((user === null || user === void 0 ? void 0 : user.organizationId) && !location.startsWith("/org/"))
        return null;
    if (user && !user.organizationId && !permissions_1.canAccessRoute(user.role, location))
        return null;
    return react_1["default"].createElement(react_1["default"].Fragment, null, children);
}
function Router() {
    return (react_1["default"].createElement(RouteGuard, null,
        react_1["default"].createElement(wouter_1.Switch, null,
            react_1["default"].createElement(wouter_1.Route, { path: "/login", component: Login }),
            react_1["default"].createElement(wouter_1.Route, { path: "/signup", component: Signup }),
            react_1["default"].createElement(wouter_1.Route, { path: "/checkout", component: Checkout }),
            react_1["default"].createElement(wouter_1.Route, { path: "/checkout/:planKey", component: Checkout }),
            react_1["default"].createElement(wouter_1.Route, { path: "/forgot-password", component: ForgotPassword }),
            react_1["default"].createElement(wouter_1.Route, { path: "/reset-password", component: ResetPassword }),
            react_1["default"].createElement(wouter_1.Route, { path: "/crm/client-portal", component: ClientPortal }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/dashboard", component: OrgDashboard }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/settings", component: OrgSettings }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/staff", component: OrgStaff }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/billing", component: OrgBilling }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/crm", component: OrgCRM }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/contacts", component: OrgContacts }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/leads", component: OrgLeads }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/estimates", component: OrgEstimates }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/crm/create", component: OrgCreateClient }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/clients/:id", component: OrgClientDetail }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/pipeline", component: OrgSalesPipeline }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/invoices", component: OrgInvoices }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/invoices/create", component: OrgCreateInvoice }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/invoices/:id/edit", component: OrgEditInvoice }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/invoices/:id", component: OrgInvoiceDetail }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/payments", component: OrgPayments }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/expenses", component: OrgExpenses }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/expenses/create", component: OrgCreateExpense }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/expenses/:id", component: OrgExpenseDetail }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/expenses/:id/edit", component: OrgEditExpense }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/hr", component: OrgHR }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/reports", component: OrgReports }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/calendar", component: OrgCalendar }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/activity", component: OrgActivity }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/approvals", component: OrgApprovals }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/accounting", component: OrgAccounting }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/budgets", component: OrgBudgets }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/projects", component: OrgProjects }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/projects/create", component: OrgCreateProject }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/projects/:id", component: OrgProjectDetail }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/projects/:id/edit", component: OrgEditProject }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/tickets", component: OrgTickets }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/tickets/create", component: OrgCreateTicket }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/tickets/:id", component: OrgTicketDetail }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/tickets/:id/edit", component: OrgEditTicket }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/leave", component: OrgLeave }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/leave/create", component: OrgCreateLeave }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/leave/:id", component: OrgLeaveDetail }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/leave/:id/edit", component: OrgEditLeave }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/attendance", component: OrgAttendance }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/procurement", component: OrgProcurement }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/procurement/create", component: OrgCreateProcurement }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/contracts", component: OrgContracts }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/contracts/create", component: OrgCreateContract }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/contracts/:id", component: OrgContractDetail }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/contracts/:id/edit", component: OrgEditContract }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/work-orders", component: OrgWorkOrders }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/work-orders/create", component: OrgCreateWorkOrder }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/work-orders/:id/edit", component: OrgEditWorkOrder }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/work-orders/:id", component: OrgWorkOrderDetail }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/payments/:id", component: OrgPaymentDetail }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/payments/:id/edit", component: OrgEditPayment }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/estimates/:id", component: OrgEstimateDetail }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/estimates/:id/edit", component: OrgEditEstimate }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/leads/:id", component: OrgLeadDetail }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/leads/:id/edit", component: OrgEditLead }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/contacts/:id", component: OrgContactDetail }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/contacts/:id/edit", component: OrgEditContact }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/budgets/:id", component: OrgBudgetDetail }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/budgets/:id/edit", component: OrgEditBudget }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/procurement/:id", component: OrgProcurementDetail }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/procurement/:id/edit", component: OrgEditProcurement }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/attendance/create", component: OrgCreateAttendance }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/attendance/:id", component: OrgAttendanceDetail }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/attendance/:id/edit", component: OrgEditAttendance }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/approvals/:id", component: OrgApprovalDetail }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/approvals/:id/edit", component: OrgEditApproval }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/receipts", component: OrgReceipts }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/credit-notes", component: OrgCreditNotes }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/debit-notes", component: OrgDebitNotes }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/subscriptions", component: OrgSubscriptions }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/chart-of-accounts", component: OrgChartOfAccounts }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/bank-reconciliation", component: OrgBankReconciliation }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/financial-dashboard", component: OrgFinancialDashboard }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/forecasting", component: OrgForecasting }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/tax-compliance", component: OrgTaxCompliance }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/suppliers", component: OrgSuppliers }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/lpos", component: OrgPurchaseOrders }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/orders", component: OrgOrders }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/imprests", component: OrgImprests }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/products", component: OrgProducts }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/inventory", component: OrgInventory }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/delivery-notes", component: OrgDeliveryNotes }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/grn", component: OrgGRN }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/services", component: OrgServices }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/service-templates", component: OrgServiceTemplates }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/service-invoices", component: OrgServiceInvoices }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/proposals", component: OrgProposals }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/quotations", component: OrgQuotations }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/tasks", component: OrgTasks }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/assets", component: OrgAssets }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/warranty", component: OrgWarranty }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/employees", component: OrgEmployees }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/departments", component: OrgDepartments }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/payroll", component: OrgPayroll }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/job-groups", component: OrgJobGroups }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/performance-reviews", component: OrgPerformanceReviews }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/canned-responses", component: OrgCannedResponses }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/knowledge-base", component: OrgKnowledgebase }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/staff-chat", component: OrgStaffChat }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/documents", component: OrgDocuments }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/timesheets", component: OrgTimesheets }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/communications", component: OrgCommunications }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/communications/new", component: OrgCommunications }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/ai", component: OrgAI }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/:slug/:module", component: OrgModulePage }),
            react_1["default"].createElement(wouter_1.Route, { path: "/", component: LandingPage }),
            react_1["default"].createElement(wouter_1.Route, { path: "/features/:featureId", component: WebsiteFeatureDetail }),
            react_1["default"].createElement(wouter_1.Route, { path: "/features", component: WebsiteFeatures }),
            react_1["default"].createElement(wouter_1.Route, { path: "/pricing", component: WebsitePricing }),
            react_1["default"].createElement(wouter_1.Route, { path: "/about", component: WebsiteAbout }),
            react_1["default"].createElement(wouter_1.Route, { path: "/contact", component: WebsiteContact }),
            react_1["default"].createElement(wouter_1.Route, { path: "/home", component: Home }),
            react_1["default"].createElement(wouter_1.Route, { path: "/demo", component: Demo }),
            react_1["default"].createElement(wouter_1.Route, { path: "/book-a-demo", component: BookADemo }),
            react_1["default"].createElement(wouter_1.Route, { path: "/become-a-partner", component: BecomeAPartner }),
            react_1["default"].createElement(wouter_1.Route, { path: "/blog", component: Blog }),
            react_1["default"].createElement(wouter_1.Route, { path: "/landing", component: LandingPage }),
            react_1["default"].createElement(wouter_1.Route, { path: "/dashboard", component: UnifiedLanding }),
            react_1["default"].createElement(wouter_1.Route, { path: "/crm", component: DashboardHome }),
            react_1["default"].createElement(wouter_1.Route, { path: "/crm-home", component: BusinessDashboard }),
            react_1["default"].createElement(wouter_1.Route, { path: "/dashboards/dashboardhome", component: DashboardHome }),
            react_1["default"].createElement(wouter_1.Route, { path: "\u002fcrm\u002fsuper-admin", component: SuperAdminDashboard }),
            react_1["default"].createElement(wouter_1.Route, { path: "/crm/pricing-tiers", component: SuperAdminPricingTiers }),
            react_1["default"].createElement(wouter_1.Route, { path: "\u002fcrm\u002fadmin", component: AdminDashboard }),
            react_1["default"].createElement(wouter_1.Route, { path: "\u002fcrm\u002fhr", component: HRDashboard }),
            react_1["default"].createElement(wouter_1.Route, { path: "\u002fcrm\u002fhr-admin", component: HRAdminDashboard }),
            react_1["default"].createElement(wouter_1.Route, { path: "\u002fcrm\u002faccountant", component: AccountantDashboard }),
            react_1["default"].createElement(wouter_1.Route, { path: "\u002fcrm\u002fproject-manager", component: ProjectManagerDashboard }),
            react_1["default"].createElement(wouter_1.Route, { path: "\u002fcrm\u002fprocurement", component: ProcurementManagerDashboard }),
            react_1["default"].createElement(wouter_1.Route, { path: "\u002fcrm\u002fsales", component: SalesManagerDashboard }),
            react_1["default"].createElement(wouter_1.Route, { path: "\u002fcrm\u002fstaff", component: StaffDashboard }),
            react_1["default"].createElement(wouter_1.Route, { path: "\u002fcrm\u002fict\u002fsystem-settings", component: ICTSystemSettings }),
            react_1["default"].createElement(wouter_1.Route, { path: "\u002fcrm\u002fict\u002femail-queue", component: EmailQueue }),
            react_1["default"].createElement(wouter_1.Route, { path: "\u002fcrm\u002fict\u002fanalytics", component: ICTAnalytics }),
            react_1["default"].createElement(wouter_1.Route, { path: "\u002fcrm\u002fict\u002fdatabase", component: DatabaseManagement }),
            react_1["default"].createElement(wouter_1.Route, { path: "\u002fcrm\u002fict\u002fsecurity", component: Security }),
            react_1["default"].createElement(wouter_1.Route, { path: "\u002fcrm\u002fict\u002factivity", component: ActivityPage }),
            react_1["default"].createElement(wouter_1.Route, { path: "\u002fcrm\u002fict", component: ICTDashboard }),
            react_1["default"].createElement(wouter_1.Route, { path: "/settings/global", component: GlobalSettings }),
            react_1["default"].createElement(wouter_1.Route, { path: "/user/settings", component: GlobalSettings }),
            react_1["default"].createElement(wouter_1.Route, { path: "/dashboard-home", component: DashboardHome }),
            react_1["default"].createElement(wouter_1.Route, { path: "/rbd", component: RoleBasedDashboard }),
            react_1["default"].createElement(wouter_1.Route, { path: "/account", component: AccountSettings }),
            react_1["default"].createElement(wouter_1.Route, { path: "/sales", component: Sales }),
            react_1["default"].createElement(wouter_1.Route, { path: "/accounting", component: Accounting }),
            react_1["default"].createElement(wouter_1.Route, { path: "/accounting/management", component: AccountingManagement }),
            react_1["default"].createElement(wouter_1.Route, { path: "/admin/management", component: AdminManagement }),
            react_1["default"].createElement(wouter_1.Route, { path: "/crm/admin", component: AdminManagement }),
            react_1["default"].createElement(wouter_1.Route, { path: "/crm/home", component: DashboardHome }),
            react_1["default"].createElement(wouter_1.Route, { path: "/users/new", component: CreateUser }),
            react_1["default"].createElement(wouter_1.Route, { path: "/users/:id/edit", component: EditUser }),
            react_1["default"].createElement(wouter_1.Route, { path: "/users/:id", component: UserDetails }),
            react_1["default"].createElement(wouter_1.Route, { path: "/projects", component: Projects }),
            react_1["default"].createElement(wouter_1.Route, { path: "/projects/management", component: ProjectsManagement }),
            react_1["default"].createElement(wouter_1.Route, { path: "/projects/create", component: CreateProject }),
            react_1["default"].createElement(wouter_1.Route, { path: "/projects/:id/edit", component: EditProject }),
            react_1["default"].createElement(wouter_1.Route, { path: "/projects/:id", component: ProjectDetails }),
            react_1["default"].createElement(wouter_1.Route, { path: "/clients", component: Clients }),
            react_1["default"].createElement(wouter_1.Route, { path: "/clients/create", component: CreateClient }),
            react_1["default"].createElement(wouter_1.Route, { path: "/clients/:id/edit", component: EditClient }),
            react_1["default"].createElement(wouter_1.Route, { path: "/clients/:id", component: ClientDetails }),
            react_1["default"].createElement(wouter_1.Route, { path: "/contacts", component: Contacts }),
            react_1["default"].createElement(wouter_1.Route, { path: "/contacts/create", component: CreateContact }),
            react_1["default"].createElement(wouter_1.Route, { path: "/contacts/:id/edit", component: EditContact }),
            react_1["default"].createElement(wouter_1.Route, { path: "/contacts/:id", component: ContactDetails }),
            react_1["default"].createElement(wouter_1.Route, { path: "/tasks", component: Tasks }),
            react_1["default"].createElement(wouter_1.Route, { path: "/leads", component: Leads }),
            react_1["default"].createElement(wouter_1.Route, { path: "/leads/:id", component: LeadsDetails }),
            react_1["default"].createElement(wouter_1.Route, { path: "/subscriptions", component: Subscriptions }),
            "      ",
            react_1["default"].createElement(wouter_1.Route, { path: "\u002fsubscriptions\u002f:id", component: SubscriptionDetails }),
            react_1["default"].createElement(wouter_1.Route, { path: "/knowledge-base", component: KnowledgeBase }),
            react_1["default"].createElement(wouter_1.Route, { path: "/knowledgebase", component: KnowledgeBase }),
            react_1["default"].createElement(wouter_1.Route, { path: "/warehouses", component: Warehouses }),
            react_1["default"].createElement(wouter_1.Route, { path: "/invoices/templates" }, function () { return react_1["default"].createElement(DocumentTemplates, { type: "invoice" }); }),
            react_1["default"].createElement(wouter_1.Route, { path: "/estimates/templates" }, function () { return react_1["default"].createElement(DocumentTemplates, { type: "estimate" }); }),
            react_1["default"].createElement(wouter_1.Route, { path: "/quotations/templates" }, function () { return react_1["default"].createElement(DocumentTemplates, { type: "quotation" }); }),
            react_1["default"].createElement(wouter_1.Route, { path: "/receipts/templates" }, function () { return react_1["default"].createElement(DocumentTemplates, { type: "receipt" }); }),
            react_1["default"].createElement(wouter_1.Route, { path: "/lpos/templates" }, function () { return react_1["default"].createElement(DocumentTemplates, { type: "purchase_order" }); }),
            react_1["default"].createElement(wouter_1.Route, { path: "/credit-notes/templates" }, function () { return react_1["default"].createElement(DocumentTemplates, { type: "credit_note" }); }),
            react_1["default"].createElement(wouter_1.Route, { path: "/debit-notes/templates" }, function () { return react_1["default"].createElement(DocumentTemplates, { type: "debit_note" }); }),
            react_1["default"].createElement(wouter_1.Route, { path: "/invoices", component: Invoices }),
            react_1["default"].createElement(wouter_1.Route, { path: "/invoices/create", component: CreateInvoice }),
            react_1["default"].createElement(wouter_1.Route, { path: "/invoices/:id/edit", component: EditInvoice }),
            react_1["default"].createElement(wouter_1.Route, { path: "/invoices/:id", component: InvoiceDetails }),
            react_1["default"].createElement(wouter_1.Route, { path: "/recurring-expenses", component: RecurringExpenses }),
            react_1["default"].createElement(wouter_1.Route, { path: "/recurring-invoices", component: RecurringInvoices }),
            react_1["default"].createElement(wouter_1.Route, { path: "/payment-plans", component: PaymentPlans }),
            react_1["default"].createElement(wouter_1.Route, { path: "/project-milestones", component: ProjectMilestones }),
            react_1["default"].createElement(wouter_1.Route, { path: "/time-tracking", component: TimeTracking }),
            react_1["default"].createElement(wouter_1.Route, { path: "/sales-pipeline", component: SalesPipeline }),
            react_1["default"].createElement(wouter_1.Route, { path: "/workflow-automation", component: WorkflowAutomation }),
            react_1["default"].createElement(wouter_1.Route, { path: "/estimates", component: Estimates }),
            react_1["default"].createElement(wouter_1.Route, { path: "/estimates/create", component: CreateEstimate }),
            react_1["default"].createElement(wouter_1.Route, { path: "/estimates/:id/edit", component: EditEstimate }),
            react_1["default"].createElement(wouter_1.Route, { path: "/estimates/:id", component: EstimateDetails }),
            react_1["default"].createElement(wouter_1.Route, { path: "/tickets", component: TicketsPage }),
            react_1["default"].createElement(wouter_1.Route, { path: "/tickets/create", component: CreateTicket }),
            react_1["default"].createElement(wouter_1.Route, { path: "/tickets/:id/edit", component: EditTicket }),
            react_1["default"].createElement(wouter_1.Route, { path: "/finance/settings", component: FinanceSettingsPage }),
            react_1["default"].createElement(wouter_1.Route, { path: "/receipts", component: Receipts }),
            react_1["default"].createElement(wouter_1.Route, { path: "/receipts/create", component: CreateReceipt }),
            react_1["default"].createElement(wouter_1.Route, { path: "/receipts/:id/edit", component: EditReceipt }),
            react_1["default"].createElement(wouter_1.Route, { path: "/receipts/:id", component: ReceiptDetails }),
            react_1["default"].createElement(wouter_1.Route, { path: "/opportunities", component: Opportunities }),
            react_1["default"].createElement(wouter_1.Route, { path: "/opportunities/create", component: CreateOpportunity }),
            react_1["default"].createElement(wouter_1.Route, { path: "/opportunities/:id/edit", component: EditOpportunity }),
            react_1["default"].createElement(wouter_1.Route, { path: "/opportunities/:id", component: OpportunityDetails }),
            react_1["default"].createElement(wouter_1.Route, { path: "/payments", component: Payments }),
            react_1["default"].createElement(wouter_1.Route, { path: "/payments/create", component: CreatePayment }),
            react_1["default"].createElement(wouter_1.Route, { path: "/payments/reconciliation", component: PaymentReconciliation }),
            react_1["default"].createElement(wouter_1.Route, { path: "/payments/overdue", component: OverduePayments }),
            react_1["default"].createElement(wouter_1.Route, { path: "/payments/reports", component: PaymentReports }),
            react_1["default"].createElement(wouter_1.Route, { path: "/payments/:id/edit", component: EditPayment }),
            react_1["default"].createElement(wouter_1.Route, { path: "/payments/:id", component: PaymentDetails }),
            react_1["default"].createElement(wouter_1.Route, { path: "/products", component: Products }),
            react_1["default"].createElement(wouter_1.Route, { path: "/products/create", component: CreateProduct }),
            react_1["default"].createElement(wouter_1.Route, { path: "/products/:id/edit", component: EditProduct }),
            react_1["default"].createElement(wouter_1.Route, { path: "/products/:id", component: ProductDetails }),
            react_1["default"].createElement(wouter_1.Route, { path: "/services", component: Services }),
            react_1["default"].createElement(wouter_1.Route, { path: "/services/create", component: CreateService }),
            react_1["default"].createElement(wouter_1.Route, { path: "/services/:id/edit", component: EditService }),
            react_1["default"].createElement(wouter_1.Route, { path: "/services/:id", component: ServiceDetails }),
            react_1["default"].createElement(wouter_1.Route, { path: "/expenses", component: Expenses }),
            react_1["default"].createElement(wouter_1.Route, { path: "/expenses/create", component: CreateExpense }),
            react_1["default"].createElement(wouter_1.Route, { path: "/expenses/:id/edit", component: EditExpense }),
            react_1["default"].createElement(wouter_1.Route, { path: "/expenses/:id", component: ExpensesDetails }),
            react_1["default"].createElement(wouter_1.Route, { path: "/hr", component: HR }),
            react_1["default"].createElement(wouter_1.Route, { path: "/hr/:id/edit", component: EditEmployee }),
            react_1["default"].createElement(wouter_1.Route, { path: "/hr/:id", component: HRDetails }),
            react_1["default"].createElement(wouter_1.Route, { path: "/job-groups", component: JobGroups }),
            react_1["default"].createElement(wouter_1.Route, { path: "/job-groups/:id", component: JobGroupDetails }),
            react_1["default"].createElement(wouter_1.Route, { path: "/onboarding", component: Onboarding }),
            react_1["default"].createElement(wouter_1.Route, { path: "/holidays", component: Holidays }),
            react_1["default"].createElement(wouter_1.Route, { path: "/payslips", component: Payslips }),
            react_1["default"].createElement(wouter_1.Route, { path: "/training", component: Training }),
            react_1["default"].createElement(wouter_1.Route, { path: "/employees", component: Employees }),
            react_1["default"].createElement(wouter_1.Route, { path: "/employees/create", component: CreateEmployee }),
            react_1["default"].createElement(wouter_1.Route, { path: "/employees/:id/edit", component: EditEmployee }),
            react_1["default"].createElement(wouter_1.Route, { path: "/employees/:id", component: EmployeeDetails }),
            react_1["default"].createElement(wouter_1.Route, { path: "/attendance", component: Attendance }),
            react_1["default"].createElement(wouter_1.Route, { path: "/attendance/new", component: CreateAttendance }),
            react_1["default"].createElement(wouter_1.Route, { path: "/attendance/create", component: CreateAttendance }),
            react_1["default"].createElement(wouter_1.Route, { path: "/attendance/:id/edit", component: EditAttendance }),
            react_1["default"].createElement(wouter_1.Route, { path: "/attendance/:id", component: AttendanceDetails }),
            react_1["default"].createElement(wouter_1.Route, { path: "/payroll", component: HRPayrollManagement }),
            react_1["default"].createElement(wouter_1.Route, { path: "/payroll/approvals", component: PayrollApprovals }),
            react_1["default"].createElement(wouter_1.Route, { path: "/payroll/payslips", component: PayslipManagementPage }),
            react_1["default"].createElement(wouter_1.Route, { path: "/payroll/kenyan", component: KenyanPayrollCalculator }),
            react_1["default"].createElement(wouter_1.Route, { path: "/payroll/tax-compliance", component: TaxComplianceReportsPage }),
            react_1["default"].createElement(wouter_1.Route, { path: "/payroll/salary-structures", component: SalaryStructures }),
            react_1["default"].createElement(wouter_1.Route, { path: "/payroll/allowances-deductions", component: AllowancesDeductions }),
            react_1["default"].createElement(wouter_1.Route, { path: "/payroll/benefits", component: Benefits }),
            react_1["default"].createElement(wouter_1.Route, { path: "/payroll/tax-information", component: TaxInformation }),
            react_1["default"].createElement(wouter_1.Route, { path: "/finance/reports", component: FinancialReportsPage }),
            react_1["default"].createElement(wouter_1.Route, { path: "/imprests", component: ImprestsPage }),
            react_1["default"].createElement(wouter_1.Route, { path: "/reports/sales", component: SalesReportsPage }),
            react_1["default"].createElement(wouter_1.Route, { path: "/import-excel", component: ImportExcelPage }),
            react_1["default"].createElement(wouter_1.Route, { path: "/tools", component: Settings }),
            react_1["default"].createElement(wouter_1.Route, { path: "/tools/theme-customization", component: ThemeCustomization }),
            react_1["default"].createElement(wouter_1.Route, { path: "/tools/brand-customization", component: BrandCustomization }),
            react_1["default"].createElement(wouter_1.Route, { path: "/tools/homepage-builder", component: CustomHomepageBuilder }),
            react_1["default"].createElement(wouter_1.Route, { path: "/tools/system-settings", component: SystemSettings }),
            react_1["default"].createElement(wouter_1.Route, { path: "/tools/integration-guides", component: IntegrationGuides }),
            react_1["default"].createElement(wouter_1.Route, { path: "/payroll/create", component: CreatePayroll }),
            react_1["default"].createElement(wouter_1.Route, { path: "/payroll/:id/edit", component: EditPayroll }),
            react_1["default"].createElement(wouter_1.Route, { path: "/payroll/:id", component: PayrollDetails }),
            react_1["default"].createElement(wouter_1.Route, { path: "/salary-structures/create", component: CreateSalaryStructure }),
            react_1["default"].createElement(wouter_1.Route, { path: "/payroll/salary-structures/create", component: CreateSalaryStructure }),
            react_1["default"].createElement(wouter_1.Route, { path: "/salary-structures/:id/edit", component: EditSalaryStructure }),
            react_1["default"].createElement(wouter_1.Route, { path: "/payroll/salary-structures/:id/edit", component: EditSalaryStructure }),
            react_1["default"].createElement(wouter_1.Route, { path: "/allowances/create", component: CreateAllowance }),
            react_1["default"].createElement(wouter_1.Route, { path: "/payroll/allowances/create", component: CreateAllowance }),
            react_1["default"].createElement(wouter_1.Route, { path: "/allowances/:id/edit", component: EditAllowance }),
            react_1["default"].createElement(wouter_1.Route, { path: "/payroll/allowances/:id/edit", component: EditAllowance }),
            react_1["default"].createElement(wouter_1.Route, { path: "/deductions/create", component: CreateDeduction }),
            react_1["default"].createElement(wouter_1.Route, { path: "/payroll/deductions/create", component: CreateDeduction }),
            react_1["default"].createElement(wouter_1.Route, { path: "/deductions/:id/edit", component: EditDeduction }),
            react_1["default"].createElement(wouter_1.Route, { path: "/payroll/deductions/:id/edit", component: EditDeduction }),
            react_1["default"].createElement(wouter_1.Route, { path: "/benefits/create", component: CreateBenefit }),
            react_1["default"].createElement(wouter_1.Route, { path: "/payroll/benefits/create", component: CreateBenefit }),
            react_1["default"].createElement(wouter_1.Route, { path: "/benefits/:id/edit", component: EditBenefit }),
            react_1["default"].createElement(wouter_1.Route, { path: "/payroll/benefits/:id/edit", component: EditBenefit }),
            react_1["default"].createElement(wouter_1.Route, { path: "/leave-management", component: LeaveManagement }),
            react_1["default"].createElement(wouter_1.Route, { path: "/leave-management/create", component: CreateLeaveRequest }),
            react_1["default"].createElement(wouter_1.Route, { path: "/leave-management/:id/edit", component: EditLeave }),
            react_1["default"].createElement(wouter_1.Route, { path: "/leave-management/:id", component: LeaveManagementDetails }),
            react_1["default"].createElement(wouter_1.Route, { path: "/departments", component: Departments }),
            react_1["default"].createElement(wouter_1.Route, { path: "/departments/create", component: CreateDepartment }),
            react_1["default"].createElement(wouter_1.Route, { path: "/departments/:id/edit", component: EditDepartment }),
            react_1["default"].createElement(wouter_1.Route, { path: "/departments/:id", component: DepartmentDetails }),
            react_1["default"].createElement(wouter_1.Route, { path: "/budgets", component: BudgetsPage }),
            react_1["default"].createElement(wouter_1.Route, { path: "/budgets/create", component: CreateBudget }),
            react_1["default"].createElement(wouter_1.Route, { path: "/budgets/professional", component: ProfessionalBudgeting }),
            react_1["default"].createElement(wouter_1.Route, { path: "/budgets/:id/edit", component: EditBudget }),
            react_1["default"].createElement(wouter_1.Route, { path: "/budgets/:id", component: BudgetDetails }),
            react_1["default"].createElement(wouter_1.Route, { path: "/procurement", component: ProcurementMaster }),
            react_1["default"].createElement(wouter_1.Route, { path: "/suppliers", component: Suppliers }),
            react_1["default"].createElement(wouter_1.Route, { path: "/suppliers/create", component: CreateSupplier }),
            react_1["default"].createElement(wouter_1.Route, { path: "/suppliers/:id/edit", component: EditSupplier }),
            react_1["default"].createElement(wouter_1.Route, { path: "/suppliers/:id", component: SupplierDetails }),
            react_1["default"].createElement(wouter_1.Route, { path: "/lpos", component: LPOsPage }),
            react_1["default"].createElement(wouter_1.Route, { path: "/lpos/create", component: CreateLPO }),
            react_1["default"].createElement(wouter_1.Route, { path: "/lpos/professional", component: ProcurementLPOs }),
            react_1["default"].createElement(wouter_1.Route, { path: "/lpos/:id/edit", component: EditLPO }),
            react_1["default"].createElement(wouter_1.Route, { path: "/lpos/:id", component: LPODetails }),
            react_1["default"].createElement(wouter_1.Route, { path: "/orders", component: OrdersPage }),
            react_1["default"].createElement(wouter_1.Route, { path: "/orders/create", component: CreateOrder }),
            react_1["default"].createElement(wouter_1.Route, { path: "/orders/professional", component: ProcurementOrders }),
            react_1["default"].createElement(wouter_1.Route, { path: "/orders/:id/edit", component: EditOrder }),
            react_1["default"].createElement(wouter_1.Route, { path: "/orders/:id", component: OrderDetails }),
            react_1["default"].createElement(wouter_1.Route, { path: "/imprests/professional", component: ProcurementImprests }),
            react_1["default"].createElement(wouter_1.Route, { path: "/imprests/:id", component: ImprestDetails }),
            react_1["default"].createElement(wouter_1.Route, { path: "/quotes/new", component: CreateQuote }),
            react_1["default"].createElement(wouter_1.Route, { path: "/quotes/:id/edit", component: CreateQuote }),
            react_1["default"].createElement(wouter_1.Route, { path: "/quotes/:id", component: QuoteDetails }),
            react_1["default"].createElement(wouter_1.Route, { path: "/quotes", component: Quotes }),
            react_1["default"].createElement(wouter_1.Route, { path: "/quotations/:id", component: QuotationDetails }),
            react_1["default"].createElement(wouter_1.Route, { path: "/quotations", component: Quotations }),
            react_1["default"].createElement(wouter_1.Route, { path: "/delivery-notes/:id", component: DeliveryNoteDetails }),
            react_1["default"].createElement(wouter_1.Route, { path: "/delivery-notes", component: DeliveryNotes }),
            react_1["default"].createElement(wouter_1.Route, { path: "/grn/:id", component: GRNDetails }),
            react_1["default"].createElement(wouter_1.Route, { path: "/grn", component: GRN }),
            react_1["default"].createElement(wouter_1.Route, { path: "/contracts/templates", component: ContractTemplates }),
            react_1["default"].createElement(wouter_1.Route, { path: "/contracts/:id", component: ContractDetails }),
            react_1["default"].createElement(wouter_1.Route, { path: "/contracts", component: ContractManagement }),
            react_1["default"].createElement(wouter_1.Route, { path: "/assets/:id", component: AssetDetails }),
            react_1["default"].createElement(wouter_1.Route, { path: "/assets", component: AssetManagement }),
            react_1["default"].createElement(wouter_1.Route, { path: "/warranty/create", component: CreateWarranty }),
            react_1["default"].createElement(wouter_1.Route, { path: "/warranty/:id/edit", component: EditWarranty }),
            react_1["default"].createElement(wouter_1.Route, { path: "/warranty/:id", component: WarrantyDetails }),
            react_1["default"].createElement(wouter_1.Route, { path: "/warranty", component: WarrantyManagement }),
            react_1["default"].createElement(wouter_1.Route, { path: "/hr/analytics", component: HRAnalyticsDashboard }),
            react_1["default"].createElement(wouter_1.Route, { path: "/hr/analytics-dashboard", component: HRAnalyticsDashboard }),
            react_1["default"].createElement(wouter_1.Route, { path: "/payroll/department-reports", component: DepartmentPayrollReports }),
            react_1["default"].createElement(wouter_1.Route, { path: "/budgets/expense-report", component: ExpenseBudgetReport }),
            react_1["default"].createElement(wouter_1.Route, { path: "/reports/custom-builder", component: CustomReportBuilder }),
            react_1["default"].createElement(wouter_1.Route, { path: "/approvals", component: Approvals }),
            react_1["default"].createElement(wouter_1.Route, { path: "/notifications", component: Notifications }),
            react_1["default"].createElement(wouter_1.Route, { path: "/communications/new", component: CreateCommunication }),
            react_1["default"].createElement(wouter_1.Route, { path: "/communications", component: Communications }),
            react_1["default"].createElement(wouter_1.Route, { path: "/communications/:id", component: Communications }),
            react_1["default"].createElement(wouter_1.Route, { path: "/messages", component: Messages }),
            react_1["default"].createElement(wouter_1.Route, { path: "/activity", component: ActivityPage }),
            react_1["default"].createElement(wouter_1.Route, { path: "/calendar", component: CalendarPage }),
            react_1["default"].createElement(wouter_1.Route, { path: "/bank-reconciliation", component: BankReconciliation }),
            react_1["default"].createElement(wouter_1.Route, { path: "/bank-reconciliation/:id/edit", component: EditBankReconciliation }),
            react_1["default"].createElement(wouter_1.Route, { path: "/bank-reconciliation/:id", component: BankReconciliationDetails }),
            react_1["default"].createElement(wouter_1.Route, { path: "/chart-of-accounts", component: ChartOfAccounts }),
            react_1["default"].createElement(wouter_1.Route, { path: "/chart-of-accounts/:id/edit", component: EditChartOfAccounts }),
            react_1["default"].createElement(wouter_1.Route, { path: "/chart-of-accounts/:id", component: ChartOfAccountsDetails }),
            react_1["default"].createElement(wouter_1.Route, { path: "/reports", component: Reports }),
            react_1["default"].createElement(wouter_1.Route, { path: "/reports/financial", component: FinancialReportsPage }),
            react_1["default"].createElement(wouter_1.Route, { path: "/reports/customers", component: CustomerReportsPage }),
            react_1["default"].createElement(wouter_1.Route, { path: "/reports/projects", component: ProjectReportsPage }),
            react_1["default"].createElement(wouter_1.Route, { path: "/reports/hr", component: HRReportsPage }),
            react_1["default"].createElement(wouter_1.Route, { path: "/reports/:id/edit", component: CustomReportBuilder }),
            react_1["default"].createElement(wouter_1.Route, { path: "/reports/:id", component: ReportsDetails }),
            react_1["default"].createElement(wouter_1.Route, { path: "/privacy-policy", component: PrivacyPolicy }),
            react_1["default"].createElement(wouter_1.Route, { path: "/terms-and-conditions", component: TermsAndConditions }),
            react_1["default"].createElement(wouter_1.Route, { path: "/documentation", component: Documentation }),
            react_1["default"].createElement(wouter_1.Route, { path: "/documents", component: DocumentManagement }),
            react_1["default"].createElement(wouter_1.Route, { path: "/user-guide", component: UserGuide }),
            react_1["default"].createElement(wouter_1.Route, { path: "/troubleshooting", component: TroubleshootingGuide }),
            react_1["default"].createElement(wouter_1.Route, { path: "/create-imprest", component: CreateImprest }),
            react_1["default"].createElement(wouter_1.Route, { path: "/create-purchase-order", component: CreatePurchaseOrder }),
            react_1["default"].createElement(wouter_1.Route, { path: "/inventory", component: Inventory }),
            react_1["default"].createElement(wouter_1.Route, { path: "/financial-dashboard", component: FinancialDashboard }),
            react_1["default"].createElement(wouter_1.Route, { path: "/profile", component: Profile }),
            react_1["default"].createElement(wouter_1.Route, { path: "/security", component: Security }),
            react_1["default"].createElement(wouter_1.Route, { path: "/mfa", component: MFA }),
            react_1["default"].createElement(wouter_1.Route, { path: "/settings", component: Settings }),
            react_1["default"].createElement(wouter_1.Route, { path: "/roles", component: Roles }),
            react_1["default"].createElement(wouter_1.Route, { path: "/ai-hub", component: AIHub }),
            react_1["default"].createElement(wouter_1.Route, { path: "/test-pdf", component: TestPDFGeneration }),
            react_1["default"].createElement(wouter_1.Route, { path: "/change-password", component: ChangePassword }),
            react_1["default"].createElement(wouter_1.Route, { path: "/change-password-enhanced", component: EnhancedChangePassword }),
            react_1["default"].createElement(wouter_1.Route, { path: "/billing", component: BillingDashboard }),
            react_1["default"].createElement(wouter_1.Route, { path: "/billing/dashboard", component: BillingDashboard }),
            react_1["default"].createElement(wouter_1.Route, { path: "/receipts-advanced", component: EnhancedReceiptManagement }),
            react_1["default"].createElement(wouter_1.Route, { path: "/enterprise/tenants", component: MultiTenancy }),
            react_1["default"].createElement(wouter_1.Route, { path: "/enterprise/tenants-management", component: EnterpriseTenantsManagement }),
            react_1["default"].createElement(wouter_1.Route, { path: "/org/users", component: OrganizationUsersManagement }),
            react_1["default"].createElement(wouter_1.Route, { path: "/enterprise/pricing", component: SuperAdminPricingTiers }),
            react_1["default"].createElement(wouter_1.Route, { path: "/audit-logs", component: AuditLogs }),
            react_1["default"].createElement(wouter_1.Route, { path: "/enterprise/tenant-admins", component: MultiTenancy }),
            react_1["default"].createElement(wouter_1.Route, { path: "/enterprise/tenant-comms", component: MultiTenancy }),
            react_1["default"].createElement(wouter_1.Route, { path: "/enterprise/create-super-admin", component: SuperAdminDashboard }),
            react_1["default"].createElement(wouter_1.Route, { path: "/enterprise/settings", component: EnterpriseSettings }),
            react_1["default"].createElement(wouter_1.Route, { path: "/enterprise/communications", component: MultiTenancy }),
            react_1["default"].createElement(wouter_1.Route, { path: "/service-invoices", component: ServiceInvoices }),
            react_1["default"].createElement(wouter_1.Route, { path: "/service-invoices/create", component: CreateServiceInvoice }),
            react_1["default"].createElement(wouter_1.Route, { path: "/service-invoices/:id/edit", component: EditServiceInvoice }),
            react_1["default"].createElement(wouter_1.Route, { path: "/credit-notes/create", component: CreateCreditNote }),
            react_1["default"].createElement(wouter_1.Route, { path: "/credit-notes/:id/edit", component: EditCreditNote }),
            react_1["default"].createElement(wouter_1.Route, { path: "/credit-notes/:id", component: CreditNoteDetails }),
            react_1["default"].createElement(wouter_1.Route, { path: "/credit-notes", component: CreditNotes }),
            react_1["default"].createElement(wouter_1.Route, { path: "/debit-notes/create", component: CreateDebitNote }),
            react_1["default"].createElement(wouter_1.Route, { path: "/debit-notes/:id/edit", component: EditDebitNote }),
            react_1["default"].createElement(wouter_1.Route, { path: "/debit-notes/:id", component: DebitNoteDetails }),
            react_1["default"].createElement(wouter_1.Route, { path: "/debit-notes", component: DebitNotes }),
            react_1["default"].createElement(wouter_1.Route, { path: "/proposals/templates", component: ProposalTemplates }),
            react_1["default"].createElement(wouter_1.Route, { path: "/proposals", component: Proposals }),
            react_1["default"].createElement(wouter_1.Route, { path: "/proposals/:id/edit", component: EditProposal }),
            react_1["default"].createElement(wouter_1.Route, { path: "/proposals/:id", component: ProposalDetails }),
            react_1["default"].createElement(wouter_1.Route, { path: "/sales-pipeline", component: SalesPipeline }),
            react_1["default"].createElement(wouter_1.Route, { path: "/forecasting", component: Forecasting }),
            react_1["default"].createElement(wouter_1.Route, { path: "/performance-reviews", component: PerformanceReviews }),
            react_1["default"].createElement(wouter_1.Route, { path: "/employee-contracts", component: EmployeeContracts }),
            react_1["default"].createElement(wouter_1.Route, { path: "/leave-balances", component: LeaveBalances }),
            react_1["default"].createElement(wouter_1.Route, { path: "/disciplinary", component: DisciplinaryRecords }),
            react_1["default"].createElement(wouter_1.Route, { path: "/recruitment", component: Recruitment }),
            react_1["default"].createElement(wouter_1.Route, { path: "/hr-automation", component: HRAutomation }),
            react_1["default"].createElement(wouter_1.Route, { path: "/service-templates", component: ServiceTemplates }),
            react_1["default"].createElement(wouter_1.Route, { path: "/service-templates/create", component: CreateServiceTemplate }),
            react_1["default"].createElement(wouter_1.Route, { path: "/service-templates/:id", component: ServiceTemplateDetails }),
            react_1["default"].createElement(wouter_1.Route, { path: "/service-templates/:id/edit", component: CreateServiceTemplate }),
            react_1["default"].createElement(wouter_1.Route, { path: "/work-orders", component: WorkOrders }),
            react_1["default"].createElement(wouter_1.Route, { path: "/work-orders/create", component: CreateWorkOrder }),
            react_1["default"].createElement(wouter_1.Route, { path: "/work-orders/:id/edit", component: EditWorkOrder }),
            react_1["default"].createElement(wouter_1.Route, { path: "/report-builder", component: ReportBuilder }),
            react_1["default"].createElement(wouter_1.Route, { path: "/kpi-tracking", component: KPITracking }),
            react_1["default"].createElement(wouter_1.Route, { path: "/activity-trail", component: ActivityTrail }),
            react_1["default"].createElement(wouter_1.Route, { path: "/hr-analytics", component: HRAnalytics }),
            react_1["default"].createElement(wouter_1.Route, { path: "/project-analytics", component: ProjectAnalytics }),
            react_1["default"].createElement(wouter_1.Route, { path: "/advanced-analytics", component: AdvancedAnalytics }),
            react_1["default"].createElement(wouter_1.Route, { path: "/reports/revenue", component: RevenueForecasting }),
            react_1["default"].createElement(wouter_1.Route, { path: "/reports/conversion", component: ConversionAnalytics }),
            react_1["default"].createElement(wouter_1.Route, { path: "/staff-chat", component: StaffChat }),
            react_1["default"].createElement(wouter_1.Route, { path: "/canned-responses", component: CannedResponses }),
            react_1["default"].createElement(wouter_1.Route, { path: "/admin/email-queue", component: EmailQueue }),
            react_1["default"].createElement(wouter_1.Route, { path: "/admin/sms-queue", component: SmsQueue }),
            react_1["default"].createElement(wouter_1.Route, { path: "/admin/backups", component: BackupManagement }),
            react_1["default"].createElement(wouter_1.Route, { path: "/admin/email-templates", component: AdminEmailTemplates }),
            react_1["default"].createElement(wouter_1.Route, { path: "/admin/cron-jobs", component: AdminCronJobs }),
            react_1["default"].createElement(wouter_1.Route, { path: "/admin/tenant-communications", component: TenantCommunications }),
            react_1["default"].createElement(wouter_1.Route, { path: "/admin/maintenance", component: MaintenanceAdmin }),
            react_1["default"].createElement(wouter_1.Route, { path: "/admin/website", component: WebsiteAdmin }),
            react_1["default"].createElement(wouter_1.Route, { path: "/admin/system-health", component: SystemHealthDashboard }),
            react_1["default"].createElement(wouter_1.Route, { path: "/admin/sessions", component: SessionManager }),
            react_1["default"].createElement(wouter_1.Route, { path: "/admin/system-logs", component: SystemLogsViewer }),
            react_1["default"].createElement(wouter_1.Route, { path: "/tools/custom-fields", component: CustomFieldsPage }),
            react_1["default"].createElement(wouter_1.Route, { path: "/system-health", component: SystemHealth }),
            react_1["default"].createElement(wouter_1.Route, { path: "/automation", component: WorkflowAutomation }),
            react_1["default"].createElement(wouter_1.Route, { path: "/workflow-automation", component: WorkflowAutomation }),
            react_1["default"].createElement(wouter_1.Route, { path: "/integrations", component: Integrations }),
            react_1["default"].createElement(wouter_1.Route, { path: "/search", component: GlobalSearch }),
            react_1["default"].createElement(wouter_1.Route, { path: "/notes", component: Notes }),
            react_1["default"].createElement(wouter_1.Route, { path: "/timesheets", component: Timesheets }),
            react_1["default"].createElement(wouter_1.Route, { path: "/executive-dashboard", component: ExecutiveDashboard }),
            react_1["default"].createElement(wouter_1.Route, { path: "/notification-center", component: NotificationCenter }),
            react_1["default"].createElement(wouter_1.Route, { path: "/bi-tools", component: BiTools }),
            react_1["default"].createElement(wouter_1.Route, { path: "/analytics/churn-prediction", component: ChurnPrediction }),
            react_1["default"].createElement(wouter_1.Route, { path: "/analytics/funnel-analysis", component: FunnelAnalysis }),
            react_1["default"].createElement(wouter_1.Route, { path: "/analytics/cohort-analysis", component: CohortAnalysis }),
            react_1["default"].createElement(wouter_1.Route, { path: "/analytics/client-performance", component: ClientPerformancePage }),
            react_1["default"].createElement(wouter_1.Route, { path: "/dashboard-builder-pro", component: DashboardBuilderPro }),
            react_1["default"].createElement(wouter_1.Route, { component: NotFound }))));
}
function App() {
    return (react_1["default"].createElement(ErrorBoundary_1["default"], null,
        react_1["default"].createElement(ThemeContext_1.ThemeProvider, null,
            react_1["default"].createElement(ThemeCustomizationContext_1.ThemeCustomizationProvider, null,
                react_1["default"].createElement(BrandContext_1.BrandProvider, null,
                    react_1["default"].createElement(CurrencyContext_1.CurrencyProvider, null,
                        react_1["default"].createElement(NotificationsContext_1.NotificationsProvider, null,
                            react_1["default"].createElement(tooltip_1.TooltipProvider, null,
                                react_1["default"].createElement(react_1.Suspense, { fallback: react_1["default"].createElement("div", { className: "flex items-center justify-center h-screen" },
                                        react_1["default"].createElement(lucide_react_1.Loader2, { className: "size-8 animate-spin text-blue-500" })) },
                                    react_1["default"].createElement(Router, null))))))))));
}
exports["default"] = App;
