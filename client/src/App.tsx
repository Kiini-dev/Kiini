import React, { Suspense, useEffect } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, Router as WouterRouter, useLocation } from "wouter";
import { useBrowserLocation } from "wouter/use-browser-location";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { NotificationsProvider } from "./contexts/NotificationsContext";
import { BrandProvider } from "./contexts/BrandContext";
import { ThemeCustomizationProvider } from "./contexts/ThemeCustomizationContext";
import { CurrencyProvider } from "./pages/website/CurrencyContext";
import { PermissionProvider } from "./_core/context/PermissionContext";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useAuthWithPersistence } from "@/_core/hooks/useAuthWithPersistence";
import { isKnownGlobalAppRoute, PUBLIC_ROUTES } from "@/lib/permissions";
import { canAccessOrgFeatureComplete, getOrgFeatureKeyForRoute } from "@/lib/orgPermissions";
import BusinessDashboardPage from "./pages/Dashboard";
import { initializeAppLanguage } from "@/lib/language";
import { trpc } from "@/lib/trpc";
import {
  getInternalOrgPath,
  getOrgSubdomainSlug,
  getOrgSubdomainUrl,
  navigateToBrowserTarget,
  stripOrgPathPrefixes,
} from "@/lib/organizationUrl";

initializeAppLanguage();

function RouteRedirect({ to }: { to: string }) {
  const [, navigate] = useLocation();
  useEffect(() => {
    navigateToBrowserTarget(to, navigate);
  }, [navigate, to]);
  return null;
}

function TenantSafeSettingsRoute() {
  const { user, loading } = useAuthWithPersistence();
  const slug = user?.organizationSlug || getOrgSubdomainSlug();
  const hash = typeof window === "undefined" ? "" : window.location.hash;
  if (loading) return null;
  if (user?.organizationId && slug) return <RouteRedirect to={`/org/${slug}/settings${hash}`} />;
  return <Settings />;
}

// lazily load all page components so the main bundle stays small and the
// dashboard (and other routes) only fetch what they actually need on
// navigation. this dramatically improves initial load time.
const NotFound = React.lazy(() => import("@/pages/NotFound"));
const Home = React.lazy(() => import("./pages/Home"));
const Projects = React.lazy(() => import("./pages/Projects"));
const FileManager = React.lazy(() => import("./pages/FileManager"));
const ProjectDetails = React.lazy(() => import("./pages/ProjectDetails"));
const Profile = React.lazy(() => import("./pages/Profile"));
const Security = React.lazy(() => import("./pages/Security"));
const MFA = React.lazy(() => import("./pages/MFA"));
const Dashboard = React.lazy(() => import("./pages/dashboards/Dashboard"));
const DashboardHome = React.lazy(() => import("./pages/dashboards/DashboardHome"));
const Clients = React.lazy(() => import("./pages/Clients"));
const ClientDetails = React.lazy(() => import("./pages/ClientDetails"));
const EditClient = React.lazy(() => import("./pages/EditClient"));
const Contacts = React.lazy(() => import("./pages/Contacts"));
const ContactDetails = React.lazy(() => import("./pages/ContactDetails"));
const Invoices = React.lazy(() => import("./pages/Invoices"));
const InvoiceDetails = React.lazy(() => import("./pages/InvoiceDetails"));
const CreateInvoice = React.lazy(() => import("./pages/CreateInvoice"));
const EditInvoice = React.lazy(() => import("./pages/EditInvoice"));
const RecurringInvoices = React.lazy(() => import("./pages/RecurringInvoices"));
const RecurringExpenses = React.lazy(() => import("./pages/RecurringExpenses"));
const PaymentPlans = React.lazy(() => import("./pages/PaymentPlans"));
const ProjectMilestones = React.lazy(() => import("./pages/ProjectMilestones"));
const TimeTracking = React.lazy(() => import("./pages/TimeTracking"));
const SalesPipeline = React.lazy(() => import("./pages/SalesPipeline"));
const Estimates = React.lazy(() => import("./pages/Estimates"));
const EstimateDetails = React.lazy(() => import("./pages/EstimateDetails"));
const CreateEstimate = React.lazy(() => import("./pages/CreateEstimate"));
const EditEstimate = React.lazy(() => import("./pages/EditEstimate"));
const Receipts = React.lazy(() => import("./pages/Receipts"));
const ReceiptDetails = React.lazy(() => import("./pages/ReceiptDetails"));
const CreateReceipt = React.lazy(() => import("./pages/CreateReceipt"));
const EditReceipt = React.lazy(() => import("./pages/EditReceipt"));
const TicketsPage = React.lazy(() => import("./pages/Tickets"));
const FinanceSettingsPage = React.lazy(() => import("./pages/FinanceSettings"));
const Opportunities = React.lazy(() => import("./pages/Opportunities"));
const Payments = React.lazy(() => import("./pages/Payments"));
const CreatePayment = React.lazy(() => import("./pages/CreatePayment"));
const PaymentReconciliation = React.lazy(() => import("./pages/PaymentReconciliation"));
const CreateProduct = React.lazy(() => import("./pages/CreateProduct"));
const CreateService = React.lazy(() => import("./pages/CreateService"));
const CreateExpense = React.lazy(() => import("./pages/CreateExpense"));
const CreateOpportunity = React.lazy(() => import("./pages/CreateOpportunity"));
const CreateEmployee = React.lazy(() => import("./pages/CreateEmployee"));
const CreateDepartment = React.lazy(() => import("./pages/CreateDepartment"));
const CreateAttendance = React.lazy(() => import("./pages/CreateAttendance"));
const CreatePayroll = React.lazy(() => import("./pages/CreatePayroll"));
const CreateLeaveRequest = React.lazy(() => import("./pages/CreateLeaveRequest"));
const CreateProject = React.lazy(() => import("./pages/CreateProject"));
const EditProject = React.lazy(() => import("./pages/EditProject"));
const EditProduct = React.lazy(() => import("./pages/EditProduct"));
const EditService = React.lazy(() => import("./pages/EditService"));
const EditExpense = React.lazy(() => import("./pages/EditExpense"));
const EditEmployee = React.lazy(() => import("./pages/EditEmployee"));
const EditOpportunity = React.lazy(() => import("./pages/EditOpportunity"));
const EditPayment = React.lazy(() => import("./pages/EditPayment"));
const Products = React.lazy(() => import("./pages/Products"));
const Services = React.lazy(() => import("./pages/Services"));
const HR = React.lazy(() => import("./pages/HR"));
const Employees = React.lazy(() => import("./pages/Employees"));
const EmployeeDetails = React.lazy(() => import("./pages/EmployeeDetails"));
const Attendance = React.lazy(() => import("./pages/Attendance"));
const Payroll = React.lazy(() => import("./pages/Payroll"));
const PayrollCostAllocations = React.lazy(() => import("./pages/PayrollCostAllocations"));
const LeaveManagement = React.lazy(() => import("./pages/LeaveManagement"));
const JobGroups = React.lazy(() => import("./pages/JobGroups"));
const JobGroupDetails = React.lazy(() => import("./pages/JobGroupDetails"));
const Onboarding = React.lazy(() => import("./pages/Onboarding"));
const Holidays = React.lazy(() => import("./pages/Holidays"));
const Payslips = React.lazy(() => import("./pages/Payslips"));
const MyPayslips = React.lazy(() => import("./pages/MyPayslips"));
const PayslipDetails = React.lazy(() => import("./pages/PayslipDetails"));
const Training = React.lazy(() => import("./pages/Training"));
const Reports = React.lazy(() => import("./pages/Reports"));
const Settings = React.lazy(() => import("@/pages/Settings"));
const TestPDFGeneration = React.lazy(() => import("@/pages/TestPDFGeneration"));
const Expenses = React.lazy(() => import("./pages/Expenses"));
const BankReconciliation = React.lazy(() => import("./pages/BankReconciliation"));
const EditBankReconciliation = React.lazy(() => import("./pages/EditBankReconciliation"));
const ChartOfAccounts = React.lazy(() => import("./pages/ChartOfAccounts"));
const Departments = React.lazy(() => import("./pages/Departments"));
const DepartmentDetails = React.lazy(() => import("./pages/DepartmentDetails"));
const PaymentDetails = React.lazy(() => import("./pages/PaymentDetails"));
const ProductDetails = React.lazy(() => import("./pages/ProductDetails"));
const ServiceDetails = React.lazy(() => import("./pages/ServiceDetails"));
const OpportunityDetails = React.lazy(() => import("./pages/UnifiedOpportunityDetails"));
const Login = React.lazy(() => import("./pages/Login"));
const ChangePassword = React.lazy(() => import("./pages/ChangePassword"));
const EnhancedChangePassword = React.lazy(() => import("./pages/EnhancedChangePassword"));
const BillingDashboard = React.lazy(() => import("./pages/BillingDashboard"));
const EnhancedReceiptManagement = React.lazy(() => import("./pages/EnhancedReceiptManagement"));
const Signup = React.lazy(() => import("./pages/Signup"));
const ForgotPassword = React.lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = React.lazy(() => import("./pages/ResetPassword"));
const ClientPortal = React.lazy(() => import("./pages/ClientPortal"));
const AttendanceDetails = React.lazy(() => import("@/pages/AttendanceDetails"));
const PayrollDetails = React.lazy(() => import("@/pages/PayrollDetails"));
const LeaveManagementDetails = React.lazy(() => import("@/pages/LeaveManagementDetails"));
const ReportsDetails = React.lazy(() => import("@/pages/ReportsDetails"));
const BankReconciliationDetails = React.lazy(() => import("@/pages/BankReconciliationDetails"));
const ChartOfAccountsDetails = React.lazy(() => import("@/pages/ChartOfAccountsDetails"));
const EditChartOfAccounts = React.lazy(() => import("@/pages/EditChartOfAccounts"));
const ExpensesDetails = React.lazy(() => import("@/pages/ExpensesDetails"));
const HRDetails = React.lazy(() => import("@/pages/HRDetails"));
const Account = React.lazy(() => import("./pages/Account"));
const Sales = React.lazy(() => import("./pages/Sales"));
const Accounting = React.lazy(() => import("./pages/Accounting"));
const IncomeLedger = React.lazy(() => import("./pages/IncomeLedger"));
const CreateUser = React.lazy(() => import("./pages/CreateUser"));
const EditUser = React.lazy(() => import("./pages/EditUser"));
const UserDetails = React.lazy(() => import("./pages/UserDetails"));
const AdminManagement = React.lazy(() => import("./pages/AdminManagement"));
const AdminEmailTemplates = React.lazy(() => import("./pages/admin/AdminEmailTemplates"));
const AdminEmailTemplatesRoute = () => <AdminEmailTemplates />;
const AdminCronJobs = React.lazy(() => import("./pages/admin/AdminCronJobs"));
const PartnerManagement = React.lazy(() => import("./pages/admin/PartnerManagement"));
const SystemHealthDashboard = React.lazy(() => import("./pages/admin/SystemHealthDashboard"));
const SystemLogsViewer = React.lazy(() => import("./pages/admin/SystemLogsViewer"));
const SessionManager = React.lazy(() => import("./pages/admin/SessionManager"));
const ProposalTemplates = React.lazy(() => import("./pages/ProposalTemplates"));
const ContractTemplates = React.lazy(() => import("./pages/ContractTemplates"));
const DocumentTemplates = React.lazy(() => import("./pages/DocumentTemplates"));
const TenantCommunications = React.lazy(() => import("./pages/admin/TenantCommunications"));
const TenantAdmins = React.lazy(() => import("./pages/admin/TenantAdmins"));
const TenantUsers = React.lazy(() => import("./pages/admin/TenantUsers"));
const TenantAdminDetails = React.lazy(() => import("./pages/admin/TenantAdminDetails"));
const TenantUserDetails = React.lazy(() => import("./pages/admin/TenantUserDetails"));
const CreateClient = React.lazy(() => import("./pages/CreateClient"));
const EditDepartment = React.lazy(() => import("./pages/EditDepartment"));
const EditAttendance = React.lazy(() => import("./pages/EditAttendance"));
const EditPayroll = React.lazy(() => import("./pages/EditPayroll"));
const EditLeave = React.lazy(() => import("./pages/EditLeave"));
const RoleBasedDashboard = React.lazy(() => import("./components/RoleBasedDashboard"));
const SuperAdminDashboard = React.lazy(() => import("./pages/dashboards/SuperAdminDashboard"));
const MultiTenancy = React.lazy(() => import("./pages/MultiTenancy"));
const AdminDashboard = React.lazy(() => import("./pages/dashboards/AdminDashboard"));
const HRDashboard = React.lazy(() => import("./pages/dashboards/HRDashboard"));
const HRAdminDashboard = React.lazy(() => import("./pages/dashboards/HRAdminDashboard"));
const AccountantDashboard = React.lazy(() => import("./pages/dashboards/AccountantDashboard"));
const StaffDashboard = React.lazy(() => import("./pages/dashboards/StaffDashboard"));
const ProjectManagerDashboard = React.lazy(() => import("./pages/dashboards/ProjectManagerDashboard"));
const ProcurementManagerDashboard = React.lazy(() => import("./pages/dashboards/ProcurementManagerDashboard"));
const SalesManagerDashboard = React.lazy(() => import("./pages/dashboards/SalesManagerDashboard"));
const OrgSalesManagerDashboard = React.lazy(() => import("./pages/org/dashboards/OrgSalesManagerDashboard"));
const OrgAdminDashboard = React.lazy(() => import("./pages/org/dashboards/OrgAdminDashboard"));
const OrgHRDashboard = React.lazy(() => import("./pages/org/dashboards/OrgHRDashboard"));
const OrgAccountantDashboard = React.lazy(() => import("./pages/org/dashboards/OrgAccountantDashboard"));
const OrgStaffDashboard = React.lazy(() => import("./pages/org/dashboards/OrgStaffDashboard"));
const OrgProjectManagerDashboard = React.lazy(() => import("./pages/org/dashboards/OrgProjectManagerDashboard"));
const OrgProcurementManagerDashboard = React.lazy(() => import("./pages/org/dashboards/OrgProcurementManagerDashboard"));
const OrgICTDashboard = React.lazy(() => import("./pages/org/dashboards/OrgICTDashboard"));
const ICTDashboard = React.lazy(() => import("./pages/dashboards/ICTDashboard"));
const GlobalSettings = React.lazy(() => import("./pages/GlobalSettings"));
const UnifiedLanding = React.lazy(() => import("./pages/UnifiedLanding"));
const LandingPage = React.lazy(() => import("./pages/LandingPage"));
const WebsiteFeatures = React.lazy(() => import("./pages/website/Features"));
const WebsiteFeatureDetail = React.lazy(() => import("./pages/website/FeatureDetail"));
const WebsitePricing = React.lazy(() => import("./pages/website/Pricing"));
const WebsiteAbout = React.lazy(() => import("./pages/website/About"));
const CustomWebsitePage = React.lazy(() => import("./pages/website/CustomPage"));
const WebsiteContact = React.lazy(() => import("./pages/website/Contact"));
const CustomerPortal = React.lazy(() => import("./pages/CustomerPortal"));
const Checkout = React.lazy(() => import("./pages/Checkout"));
const VerifyEmail = React.lazy(() => import("./pages/VerifyEmail"));
const Roles = React.lazy(() => import("./pages/Roles.tsx"));
const AIHub = React.lazy(() => import("./pages/AIHub"));
const FinancialDashboard = React.lazy(() => import("./pages/FinancialDashboard"));
const ERPControls = React.lazy(() => import("./pages/ERPControls"));
const ERPOperations = React.lazy(() => import("./pages/ERPOperations"));
const WorkflowAutomation = React.lazy(() => import("./pages/WorkflowAutomation"));
const Demo = React.lazy(() => import("./pages/Demo"));
const Blog = React.lazy(() => import("./pages/Blog"));
const BecomeAPartner = React.lazy(() => import("./pages/BecomeAPartner"));
const PartnerPortal = React.lazy(() => import("./pages/PartnerPortal"));
const BookADemo = React.lazy(() => import("./pages/BookADemo"));
const HRAutomation = React.lazy(() => import("./pages/HRAutomation"));
const HRPayrollManagement = React.lazy(() => import("./pages/HRPayrollManagement"));
const PayrollApprovals = React.lazy(() => import("./pages/PayrollApprovals"));
const CreateSalaryStructure = React.lazy(() => import("./pages/CreateSalaryStructure"));
const CreateAllowance = React.lazy(() => import("./pages/CreateAllowance"));
const CreateDeduction = React.lazy(() => import("./pages/CreateDeduction"));
const CreateBenefit = React.lazy(() => import("./pages/CreateBenefit"));
const EditSalaryStructure = React.lazy(() => import("./pages/EditSalaryStructure"));
const EditAllowance = React.lazy(() => import("./pages/EditAllowance"));
const EditDeduction = React.lazy(() => import("./pages/EditDeduction"));
const EditBenefit = React.lazy(() => import("./pages/EditBenefit"));
const CreateContact = React.lazy(() => import("./pages/CreateContact"));
const EditContact = React.lazy(() => import("./pages/EditContact"));
const CreateTicket = React.lazy(() => import("./pages/CreateTicket"));
const EditTicket = React.lazy(() => import("./pages/EditTicket"));
const EditWarranty = React.lazy(() => import("./pages/EditWarranty"));
const KenyanPayrollCalculator = React.lazy(() => import("./pages/KenyanPayrollCalculator"));
const OverduePayments = React.lazy(() => import("./pages/OverduePayments"));
const PaymentReports = React.lazy(() => import("./pages/PaymentReports"));
const TaxComplianceReportsPage = React.lazy(() => import("./pages/TaxComplianceReports"));
const SalesReportsPage = React.lazy(() => import("./pages/SalesReports"));
const FinancialReportsPage = React.lazy(() => import("./pages/FinancialReports"));
const NonSalesInflowsPage = React.lazy(() => import("./pages/NonSalesInflows"));
const AccountingPoliciesPage = React.lazy(() => import("./pages/AccountingPolicies"));
const CustomerReportsPage = React.lazy(() => import("./pages/CustomerReports"));
const ProjectReportsPage = React.lazy(() => import("./pages/ProjectReports"));
const HRReportsPage = React.lazy(() => import("./pages/HRReports"));
const PayslipManagementPage = React.lazy(() => import("./pages/PayslipManagement"));
const ImprestsPage = React.lazy(() => import("./pages/Imprests"));
const BudgetsPage = React.lazy(() => import("./pages/Budgets"));
const BudgetDetails = React.lazy(() => import("./pages/BudgetDetails"));
const BudgetDetail = React.lazy(() => import("./pages/BudgetDetail"));
const CreateBudget = React.lazy(() => import("./pages/CreateBudget"));
const EditBudget = React.lazy(() => import("./pages/EditBudget"));
const ProfessionalBudgeting = React.lazy(() => import("./components/ProfessionalBudgeting"));
const ProcurementLPOs = React.lazy(() => import("./components/ProcurementLPOs"));
const ProcurementOrders = React.lazy(() => import("./components/ProcurementOrders"));
const ProcurementImprests = React.lazy(() => import("./components/ProcurementImprests"));
const HRAnalyticsPage = React.lazy(() => import("./pages/HRAnalyticsPage"));
const LPOsPage = React.lazy(() => import("./pages/LPOs"));
const CreateLPO = React.lazy(() => import("./pages/CreateLPO"));
const EditLPO = React.lazy(() => import("./pages/EditLPO"));
const LPODetails = React.lazy(() => import("./pages/LPODetails"));
const OrdersPage = React.lazy(() => import("./pages/Orders"));
const CreateOrder = React.lazy(() => import("./pages/CreateOrder"));
const EditOrder = React.lazy(() => import("./pages/EditOrder"));
const ImportExcelPage = React.lazy(() => import("./components/CSVImportExport"));
const BrandCustomization = React.lazy(() => import("./pages/tools/BrandCustomization"));
const CustomHomepageBuilder = React.lazy(() => import("./pages/tools/CustomHomepageBuilder"));
const ThemeCustomization = React.lazy(() => import("./pages/tools/ThemeCustomization"));
const SystemSettings = React.lazy(() => import("./pages/tools/SystemSettings"));
const IntegrationGuides = React.lazy(() => import("./pages/tools/IntegrationGuides"));
const UiElements = React.lazy(() => import("./pages/UiElements"));
const Integrations = React.lazy(() => import("./pages/Integrations"));
const DepartmentPayrollReports = React.lazy(() => import("./pages/DepartmentPayrollReports"));
const SalaryStructures = React.lazy(() => import("./pages/SalaryStructures"));
const SalaryStructureDetails = React.lazy(() => import("./pages/SalaryStructureDetails"));
const AllowancesDeductions = React.lazy(() => import("./pages/AllowancesDeductions"));
const Benefits = React.lazy(() => import("./pages/Benefits"));
const TaxInformation = React.lazy(() => import("./pages/TaxInformation"));
const SubscriptionDetails = React.lazy(() => import("./pages/SubscriptionDetails"));
const CustomReportBuilder = React.lazy(() => import("./pages/CustomReportBuilder"));
const Communications = React.lazy(() => import("./pages/Communications"));
const CreateCommunication = React.lazy(() => import("./pages/CreateCommunication"));
const CommunicationDetails = React.lazy(() => import("./pages/CommunicationDetails"));
const Messages = React.lazy(() => import("./pages/Messages"));
const ActivityPage = React.lazy(() => import("./pages/Activity"));
const ICTSystemSettings = React.lazy(() => import("./pages/ICTSystemSettings"));
const ICTAnalytics = React.lazy(() => import("./pages/ICTAnalytics"));
const DatabaseManagement = React.lazy(() => import("./pages/admin/DatabaseManagement"));
const NetworkConfiguration = React.lazy(() => import("./pages/admin/NetworkConfiguration"));
const PerformanceMetrics = React.lazy(() => import("./pages/admin/PerformanceMetrics"));
const ApiKeysManagement = React.lazy(() => import("./pages/admin/ApiKeysManagement"));
const CalendarPage = React.lazy(() => import("./pages/Calendar"));
const Reminders = React.lazy(() => import("./pages/Reminders"));
const Approvals = React.lazy(() => import("./pages/Approvals"));
const Notifications = React.lazy(() => import("./pages/Notifications"));
const AccountSettings = React.lazy(() => import("./pages/AccountSettings"));
const PrivacyPolicy = React.lazy(() => import("./pages/PrivacyPolicy"));
const TermsAndConditions = React.lazy(() => import("./pages/TermsAndConditions"));
const Documentation = React.lazy(() => import("./pages/Documentation"));
const DocumentManagement = React.lazy(() => import("./pages/DocumentManagement"));
const UserGuide = React.lazy(() => import("./pages/UserGuide"));
const OrganizationUsersManagement = React.lazy(() => import("./pages/OrganizationUsersManagement"));
const EnterpriseTenantsManagement = React.lazy(() => import("./pages/EnterpriseTenantsManagement"));
const TroubleshootingGuide = React.lazy(() => import("./pages/TroubleshootingGuide"));
const CreateImprest = React.lazy(() => import("./pages/CreateImprest"));
const CreatePurchaseOrder = React.lazy(() => import("./pages/CreatePurchaseOrder"));
const Inventory = React.lazy(() => import("./pages/Inventory"));
const Suppliers = React.lazy(() => import("./pages/Suppliers"));
const SupplierDetails = React.lazy(() => import("./pages/SupplierDetails"));
const CreateSupplier = React.lazy(() => import("./pages/CreateSupplier"));
const EditSupplier = React.lazy(() => import("./pages/EditSupplier"));
const ProcurementMaster = React.lazy(() => import("./pages/ProcurementMaster"));
const ExpenseBudgetReport = React.lazy(() => import("./pages/ExpenseBudgetReport"));
const HRAnalyticsDashboard = React.lazy(() => import("./pages/HRAnalyticsDashboard"));
const ProjectsManagement = React.lazy(() => import("./pages/ProjectsManagement"));
const AccountingManagement = React.lazy(() => import("./pages/AccountingManagement"));
const ContractManagement = React.lazy(() => import("./pages/ContractManagement"));
const ESignatures = React.lazy(() => import("./pages/ESignatures"));
const ContractDetails = React.lazy(() => import("./pages/ContractDetails"));
const AssetManagement = React.lazy(() => import("./pages/AssetManagement"));
const AssetDetails = React.lazy(() => import("./pages/AssetDetails"));
const WarrantyManagement = React.lazy(() => import("./pages/WarrantyManagement"));
const Quotations = React.lazy(() => import("./pages/Quotations"));
const QuotationDetails = React.lazy(() => import("./pages/QuotationDetails"));
const DeliveryNotes = React.lazy(() => import("./pages/DeliveryNotes"));
const DeliveryNoteDetails = React.lazy(() => import("./pages/DeliveryNoteDetails"));
const GRN = React.lazy(() => import("./pages/GRN"));
const GRNDetails = React.lazy(() => import("./pages/GRNDetails"));
const OrderDetails = React.lazy(() => import("./pages/OrderDetails"));
const ImprestDetails = React.lazy(() => import("./pages/ImprestDetails"));
const Proposals = React.lazy(() => import("./pages/Proposals"));
const EditProposal = React.lazy(() => import("./pages/EditProposal"));
const ProposalDetails = React.lazy(() => import("./pages/UnifiedOpportunityDetails"));
const ServiceInvoices = React.lazy(() => import("./pages/ServiceInvoices"));
const CreateServiceInvoice = React.lazy(() => import("./pages/CreateServiceInvoice"));
const EditServiceInvoice = React.lazy(() => import("./pages/EditServiceInvoice"));
const CreditNotes = React.lazy(() => import("./pages/CreditNotes"));
const CreateCreditNote = React.lazy(() => import("./pages/CreateCreditNote"));
const DebitNotes = React.lazy(() => import("./pages/DebitNotes"));
const CreateDebitNote = React.lazy(() => import("./pages/CreateDebitNote"));
const DebitNoteDetails = React.lazy(() => import("./pages/DebitNoteDetails"));
const EditDebitNote = React.lazy(() => import("./pages/EditDebitNote"));
const CreditNoteDetails = React.lazy(() => import("./pages/CreditNoteDetails"));
const EditCreditNote = React.lazy(() => import("./pages/EditCreditNote"));
const CreateWarranty = React.lazy(() => import("./pages/CreateWarranty"));
const WarrantyDetails = React.lazy(() => import("./pages/WarrantyDetails"));
const Quotes = React.lazy(() => import("./pages/Quotes").then(m => ({ default: m.Quotes })));
const QuoteDetails = React.lazy(() => import("./pages/QuoteDetails").then(m => ({ default: m.QuoteDetails })));
const CreateQuote = React.lazy(() => import("./pages/CreateQuote"));
const Forecasting = React.lazy(() => import("./pages/Forecasting"));
const PerformanceReviews = React.lazy(() => import("./pages/PerformanceReviews"));
const EmployeeContracts = React.lazy(() => import("./pages/EmployeeContracts"));
const LeaveBalances = React.lazy(() => import("./pages/LeaveBalances"));
const DisciplinaryRecords = React.lazy(() => import("./pages/DisciplinaryRecords"));
const Recruitment = React.lazy(() => import("./pages/Recruitment"));
const ServiceTemplates = React.lazy(() => import("./pages/ServiceTemplates"));
const CreateServiceTemplate = React.lazy(() => import("./pages/CreateServiceTemplate"));
const ServiceTemplateDetails = React.lazy(() => import("./pages/ServiceTemplateDetails"));
const WorkOrders = React.lazy(() => import("./pages/WorkOrders"));
const CreateWorkOrder = React.lazy(() => import("./pages/CreateWorkOrder"));
const EditWorkOrder = React.lazy(() => import("./pages/EditWorkOrder"));
const ReportBuilder = React.lazy(() => import("./pages/ReportBuilder"));
const KPITracking = React.lazy(() => import("./pages/KPITracking"));
const ActivityTrail = React.lazy(() => import("./pages/ActivityTrail"));
const StaffChat = React.lazy(() => import("./pages/StaffChat"));
const CannedResponses = React.lazy(() => import("./pages/CannedResponses"));
const ProjectAnalytics = React.lazy(() => import("./pages/ProjectAnalytics"));
const SystemHealth = React.lazy(() => import("./pages/SystemHealth"));
const HRAnalytics = React.lazy(() => import("./pages/HRAnalytics"));
const AdvancedAnalytics = React.lazy(() => import("./pages/AdvancedAnalytics"));
const RevenueForecasting = React.lazy(() => import("./pages/RevenueForecasting"));
const ConversionAnalytics = React.lazy(() => import("./pages/ConversionAnalytics"));
const CustomFieldsPage = React.lazy(() => import("./pages/tools/CustomFields"));
const EmailQueue = React.lazy(() => import("./pages/EmailQueue"));
const SmsQueue = React.lazy(() => import("./pages/SmsQueue"));
const GlobalSearch = React.lazy(() => import("./pages/Search"));
const BackupManagement = React.lazy(() => import("./pages/BackupManagement"));
const EnterpriseSettings = React.lazy(() => import("./pages/EnterpriseSettings"));
const EnterpriseTenantDetails = React.lazy(() => import("./pages/EnterpriseTenantDetails"));
const EnterpriseReports = React.lazy(() => import("./pages/EnterpriseReports"));
const ExecutiveDashboard = React.lazy(() => import("./pages/ExecutiveDashboard"));
const NotificationCenter = React.lazy(() => import("./pages/NotificationCenter"));
const BiTools = React.lazy(() => import("./pages/BiTools"));
const ChurnPrediction = React.lazy(() => import("./pages/ChurnPrediction"));
const FunnelAnalysis = React.lazy(() => import("./pages/FunnelAnalysis"));
const CohortAnalysis = React.lazy(() => import("./pages/CohortAnalysis"));
const DashboardBuilderPro = React.lazy(() => import("./pages/DashboardBuilderPro"));
const ClientPerformancePage = React.lazy(() => import("./pages/ClientPerformance"));
const OrgDashboardHome = React.lazy(() => import("./pages/org/dashboards/OrgDashboardHome"));
const OrgDashboard = React.lazy(() => import("./pages/org/OrgDashboard"));
const OrgSuperAdminDashboard = React.lazy(() => import("./pages/org/OrgSuperAdminDashboard"));
const OrgSettings = React.lazy(() => import("./pages/org/OrgSettings"));
const OrgStaff = React.lazy(() => import("./pages/org/OrgStaff"));
const OrgBilling = React.lazy(() => import("./pages/org/OrgBilling"));
const OrgPricing = React.lazy(() => import("./pages/org/OrgPricing"));
const OrgCRM = React.lazy(() => import("./pages/org/OrgCRM"));
const OrgContacts = React.lazy(() => import("./pages/org/OrgContacts"));
const OrgLeads = React.lazy(() => import("./pages/org/OrgLeads"));
const OrgEstimates = React.lazy(() => import("./pages/org/OrgEstimates"));
const OrgCreateClient = React.lazy(() => import("./pages/org/OrgCreateClient"));
const OrgClientDetail = React.lazy(() => import("./pages/org/OrgClientDetail"));
const OrgCreateSupplier = React.lazy(() => import("./pages/org/OrgCreateSupplier"));
const OrgSupplierDetail = React.lazy(() => import("./pages/org/OrgSupplierDetail"));
const OrgEditSupplier = React.lazy(() => import("./pages/org/OrgEditSupplier"));
const OrgSalesPipeline = React.lazy(() => import("./pages/org/OrgSalesPipeline"));
const OrgInvoices = React.lazy(() => import("./pages/org/OrgInvoices"));
const OrgCreateInvoice = React.lazy(() => import("./pages/org/OrgCreateInvoice"));
const OrgPayments = React.lazy(() => import("./pages/org/OrgPayments"));
const OrgExpenses = React.lazy(() => import("./pages/org/OrgExpenses"));
const OrgCreateExpense = React.lazy(() => import("./pages/org/OrgCreateExpense"));
const OrgExpenseDetail = React.lazy(() => import("./pages/org/OrgExpenseDetail"));
const OrgEditExpense = React.lazy(() => import("./pages/org/OrgEditExpense"));
const OrgProjects = React.lazy(() => import("./pages/org/OrgProjects"));
const OrgCreateProject = React.lazy(() => import("./pages/org/OrgCreateProject"));
const OrgProjectDetail = React.lazy(() => import("./pages/org/OrgProjectDetail"));
const OrgEditProject = React.lazy(() => import("./pages/org/OrgEditProject"));
const OrgTickets = React.lazy(() => import("./pages/org/OrgTickets"));
const OrgCreateTicket = React.lazy(() => import("./pages/org/OrgCreateTicket"));
const OrgTicketDetail = React.lazy(() => import("./pages/org/OrgTicketDetail"));
const OrgEditTicket = React.lazy(() => import("./pages/org/OrgEditTicket"));
const OrgInvoiceDetail = React.lazy(() => import("./pages/org/OrgInvoiceDetail"));
const OrgEditInvoice = React.lazy(() => import("./pages/org/OrgEditInvoice"));
const OrgHR = React.lazy(() => import("./pages/org/OrgHR"));
const OrgReports = React.lazy(() => import("./pages/org/OrgReports"));
const OrgCalendar = React.lazy(() => import("./pages/org/OrgCalendar"));
const OrgActivity = React.lazy(() => import("./pages/org/OrgActivity"));
const OrgApprovals = React.lazy(() => import("./pages/org/OrgApprovals"));
const OrgAccounting = React.lazy(() => import("./pages/org/OrgAccounting"));
const OrgBudgets = React.lazy(() => import("./pages/org/OrgBudgets"));
const OrgLeave = React.lazy(() => import("./pages/org/OrgLeave"));
const OrgAttendance = React.lazy(() => import("./pages/org/OrgAttendance"));
const OrgProcurement = React.lazy(() => import("./pages/org/OrgProcurement"));
const OrgContracts = React.lazy(() => import("./pages/org/OrgContracts"));
const OrgCreateContract = React.lazy(() => import("./pages/org/OrgCreateContract"));
const OrgContractTemplates = React.lazy(() => import("./pages/org/OrgContractTemplates"));
const OrgWorkOrders = React.lazy(() => import("./pages/org/OrgWorkOrders"));
const OrgWorkOrderDetail = React.lazy(() => import("./pages/org/OrgWorkOrderDetail"));
const OrgEditWorkOrder = React.lazy(() => import("./pages/org/OrgEditWorkOrder"));
const OrgCreateWorkOrder = React.lazy(() => import("./pages/org/OrgCreateWorkOrder"));
const OrgCreateProcurement = React.lazy(() => import("./pages/org/OrgCreateProcurement"));
const OrgCreateLeave = React.lazy(() => import("./pages/org/OrgCreateLeave"));
const OrgContractDetail = React.lazy(() => import("./pages/org/OrgContractDetail"));
const OrgEditContract = React.lazy(() => import("./pages/org/OrgEditContract"));
const OrgLeaveDetail = React.lazy(() => import("./pages/org/OrgLeaveDetail"));
const OrgEditLeave = React.lazy(() => import("./pages/org/OrgEditLeave"));
const OrgCommunications = React.lazy(() => import("./pages/org/OrgCommunications"));
const OrgAI = React.lazy(() => import("./pages/org/OrgAI"));
const OrgModulePage = React.lazy(() => import("./pages/org/OrgModulePage"));
const OrgPaymentDetail = React.lazy(() => import("./pages/org/OrgPaymentDetail"));
const OrgEditPayment = React.lazy(() => import("./pages/org/OrgEditPayment"));
const OrgEstimateDetail = React.lazy(() => import("./pages/org/OrgEstimateDetail"));
const OrgEditEstimate = React.lazy(() => import("./pages/org/OrgEditEstimate"));
const OrgLeadDetail = React.lazy(() => import("./pages/org/OrgLeadDetail"));
const OrgEditLead = React.lazy(() => import("./pages/org/OrgEditLead"));
const OrgContactDetail = React.lazy(() => import("./pages/org/OrgContactDetail"));
const OrgEditContact = React.lazy(() => import("./pages/org/OrgEditContact"));
const OrgBudgetDetail = React.lazy(() => import("./pages/org/OrgBudgetDetail"));
const OrgEditBudget = React.lazy(() => import("./pages/org/OrgEditBudget"));
const OrgProcurementDetail = React.lazy(() => import("./pages/org/OrgProcurementDetail"));
const OrgEditProcurement = React.lazy(() => import("./pages/org/OrgEditProcurement"));
const OrgCreateAttendance = React.lazy(() => import("./pages/org/OrgCreateAttendance"));
const OrgAttendanceDetail = React.lazy(() => import("./pages/org/OrgAttendanceDetail"));
const OrgEditAttendance = React.lazy(() => import("./pages/org/OrgEditAttendance"));
const OrgApprovalDetail = React.lazy(() => import("./pages/org/OrgApprovalDetail"));
const OrgEditApproval = React.lazy(() => import("./pages/org/OrgEditApproval"));
const OrgReceipts = React.lazy(() => import("./pages/org/OrgReceipts"));
const OrgCreateReceipt = React.lazy(() => import("./pages/org/OrgCreateReceipt"));
const OrgEditReceipt = React.lazy(() => import("./pages/org/OrgEditReceipt"));
const OrgReceiptDetail = React.lazy(() => import("./pages/org/OrgReceiptDetail"));
const OrgCreditNotes = React.lazy(() => import("./pages/org/OrgCreditNotes"));
const OrgCreateCreditNote = React.lazy(() => import("./pages/org/OrgCreateCreditNote"));
const OrgEditCreditNote = React.lazy(() => import("./pages/org/OrgEditCreditNote"));
const OrgCreditNoteDetail = React.lazy(() => import("./pages/org/OrgCreditNoteDetail"));
const OrgDebitNotes = React.lazy(() => import("./pages/org/OrgDebitNotes"));
const OrgCreateDebitNote = React.lazy(() => import("./pages/org/OrgCreateDebitNote"));
const OrgEditDebitNote = React.lazy(() => import("./pages/org/OrgEditDebitNote"));
const OrgDebitNoteDetail = React.lazy(() => import("./pages/org/OrgDebitNoteDetail"));
const OrgSubscriptions = React.lazy(() => import("./pages/org/OrgSubscriptions"));
const OrgChartOfAccounts = React.lazy(() => import("./pages/org/OrgChartOfAccounts"));
const OrgBankReconciliation = React.lazy(() => import("./pages/org/OrgBankReconciliation"));
const OrgFinancialDashboard = React.lazy(() => import("./pages/org/OrgFinancialDashboard"));
const OrgFinancialReports = React.lazy(() => import("./pages/org/OrgFinancialReports"));
const OrgForecasting = React.lazy(() => import("./pages/org/OrgForecasting"));
const OrgTaxCompliance = React.lazy(() => import("./pages/org/OrgTaxCompliance"));
const OrgSuppliers = React.lazy(() => import("./pages/org/OrgSuppliers"));
const OrgPurchaseOrders = React.lazy(() => import("./pages/org/OrgPurchaseOrders"));
const OrgCreatePurchaseOrder = React.lazy(() => import("./pages/org/OrgCreatePurchaseOrder"));
const OrgEditPurchaseOrder = React.lazy(() => import("./pages/org/OrgEditPurchaseOrder"));
const OrgPurchaseOrderDetail = React.lazy(() => import("./pages/org/OrgPurchaseOrderDetail"));
const OrgLPOs = React.lazy(() => import("./pages/org/OrgLPOs"));
const OrgCreateLPO = React.lazy(() => import("./pages/org/OrgCreateLPO"));
const OrgEditLPO = React.lazy(() => import("./pages/org/OrgEditLPO"));
const OrgLPODetail = React.lazy(() => import("./pages/org/OrgLPODetail"));
const OrgOrders = React.lazy(() => import("./pages/org/OrgOrders"));
const OrgCreateOrder = React.lazy(() => import("./pages/org/OrgCreateOrder"));
const OrgEditOrder = React.lazy(() => import("./pages/org/OrgEditOrder"));
const OrgOrderDetail = React.lazy(() => import("./pages/org/OrgOrderDetail"));
const OrgImprests = React.lazy(() => import("./pages/org/OrgImprests"));
const OrgProducts = React.lazy(() => import("./pages/org/OrgProducts"));
const OrgCreateProduct = React.lazy(() => import("./pages/org/OrgCreateProduct"));
const OrgEditProduct = React.lazy(() => import("./pages/org/OrgEditProduct"));
const OrgProductDetail = React.lazy(() => import("./pages/org/OrgProductDetail"));
const OrgInventory = React.lazy(() => import("./pages/org/OrgInventory"));
const OrgDeliveryNotes = React.lazy(() => import("./pages/org/OrgDeliveryNotes"));
const OrgGRN = React.lazy(() => import("./pages/org/OrgGRN"));
const OrgServices = React.lazy(() => import("./pages/org/OrgServices"));
const OrgCreateService = React.lazy(() => import("./pages/org/OrgCreateService"));
const OrgEditService = React.lazy(() => import("./pages/org/OrgEditService"));
const OrgServiceDetail = React.lazy(() => import("./pages/org/OrgServiceDetail"));
const OrgServiceTemplates = React.lazy(() => import("./pages/org/OrgServiceTemplates"));
const OrgServiceInvoices = React.lazy(() => import("./pages/org/OrgServiceInvoices"));
const OrgCreateServiceInvoice = React.lazy(() => import("./pages/org/OrgCreateServiceInvoice"));
const OrgEditServiceInvoice = React.lazy(() => import("./pages/org/OrgEditServiceInvoice"));
const OrgServiceInvoiceDetails = React.lazy(() => import("./pages/org/OrgServiceInvoiceDetails"));
const OrgProposals = React.lazy(() => import("./pages/org/OrgProposals"));
const OrgProposalDetail = React.lazy(() => import("./pages/UnifiedOpportunityDetails"));
const OrgCreateProposal = React.lazy(() => import("./pages/org/OrgCreateProposal"));
const OrgEditProposal = React.lazy(() => import("./pages/org/OrgEditProposal"));
const OrgQuotations = React.lazy(() => import("./pages/org/OrgQuotations"));
const OrgQuotationDetail = React.lazy(() => import("./pages/org/OrgQuotationDetail"));
const OrgCreateQuotation = React.lazy(() => import("./pages/org/OrgCreateQuotation"));
const OrgEditQuotation = React.lazy(() => import("./pages/org/OrgEditQuotation"));
const OrgTasks = React.lazy(() => import("./pages/org/OrgTasks"));
const OrgAssets = React.lazy(() => import("./pages/org/OrgAssets"));
const OrgWarranty = React.lazy(() => import("./pages/org/OrgWarranty"));
const OrgEmployees = React.lazy(() => import("./pages/org/OrgEmployees"));
const OrgEmployeeDetails = React.lazy(() => import("./pages/org/OrgEmployeeDetails"));
const OrgDepartments = React.lazy(() => import("./pages/org/OrgDepartments"));
const OrgCreateDepartment = React.lazy(() => import("./pages/org/OrgCreateDepartment"));
const OrgEditDepartment = React.lazy(() => import("./pages/org/OrgEditDepartment"));
const OrgDepartmentDetails = React.lazy(() => import("./pages/org/OrgDepartmentDetails"));
const OrgPayroll = React.lazy(() => import("./pages/org/OrgPayroll"));
const OrgCreatePayroll = React.lazy(() => import("./pages/org/OrgCreatePayroll"));
const OrgEditPayroll = React.lazy(() => import("./pages/org/OrgEditPayroll"));
const OrgPayrollDetails = React.lazy(() => import("./pages/org/OrgPayrollDetails"));
const OrgSalaryStructures = React.lazy(() => import("./pages/org/OrgSalaryStructures"));
const OrgCreateSalaryStructure = React.lazy(() => import("./pages/org/OrgCreateSalaryStructure"));
const OrgEditSalaryStructure = React.lazy(() => import("./pages/org/OrgEditSalaryStructure"));
const OrgSalaryStructureDetails = React.lazy(() => import("./pages/org/OrgSalaryStructureDetails"));
const OrgJobGroups = React.lazy(() => import("./pages/org/OrgJobGroups"));
const OrgPerformanceReviews = React.lazy(() => import("./pages/org/OrgPerformanceReviews"));
const OrgCannedResponses = React.lazy(() => import("./pages/org/OrgCannedResponses"));
const OrgKnowledgebase = React.lazy(() => import("./pages/org/OrgKnowledgeBase"));
const OrgStaffChat = React.lazy(() => import("./pages/org/OrgStaffChat"));
const OrgDocuments = React.lazy(() => import("./pages/org/OrgDocuments"));
const OrgTimesheets = React.lazy(() => import("./pages/org/OrgTimesheets"));
const SuperAdminPricingTiers = React.lazy(() => import("./pages/admin/SuperAdminPricingTiers"));
const MaintenanceAdmin = React.lazy(() => import("./pages/MaintenanceAdmin"));
const WebsiteAdmin = React.lazy(() => import("./pages/admin/WebsiteAdmin"));
const Tasks = React.lazy(() => import("./pages/Tasks"));
const TaskDetails = React.lazy(() => import("./pages/TaskDetails"));
const Leads = React.lazy(() => import("./pages/Leads"));
const LeadDetails = React.lazy(() => import("./pages/LeadDetails"));
const Subscriptions = React.lazy(() => import("./pages/Subscriptions"));
const KnowledgeBase = React.lazy(() => import("./pages/KnowledgeBase"));
const Warehouses = React.lazy(() => import("./pages/Warehouses"));
const Notes = React.lazy(() => import("./pages/Notes"));
const Timesheets = React.lazy(() => import("./pages/Timesheets"));
const TimesheetDetails = React.lazy(() => import("./pages/TimesheetDetails"));
const AuditLogs = React.lazy(() => import("./pages/AuditLogs"));

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
function RouteGuard({ children }: { children: React.ReactNode }) {
  const [location, navigate] = useLocation();
  const { user, loading, isAuthenticated } = useAuthWithPersistence();
  const { data: myOrgData } = trpc.multiTenancy.getMyOrg.useQuery(undefined, {
    enabled: !!user?.organizationId,
    staleTime: 300_000,
  });
  const { data: subscriptionAccess } = trpc.multiTenancy.getSubscriptionAccess.useQuery(undefined, {
    enabled: !!user?.organizationId,
    refetchInterval: 30_000,
  });
  const [showSpinnerTimeout, setShowSpinnerTimeout] = React.useState(false);
  const orgFeatureMap = myOrgData?.featureMap ?? {};
  const effectivePermissions = (user as any)?.effectivePermissions ?? [];
  const isGlobalAppUser = !user?.organizationId || user?.role === "client";

  // Timeout safety: if loading state persists >5s on a public route, render anyway
  React.useEffect(() => {
    if (!loading) {
      setShowSpinnerTimeout(false);
      return;
    }
    const timeout = setTimeout(() => setShowSpinnerTimeout(true), 5000);
    return () => clearTimeout(timeout);
  }, [loading]);

  // Debug: expose auth state to console to trace spinner issues
  try {
    // avoid throwing in SSR; keep minimal
    // eslint-disable-next-line no-console
    console.debug('[RouteGuard] auth', { loading, isAuthenticated, user, location });
  } catch (e) {}
  const isPublic = PUBLIC_ROUTES.some(
    (r) =>
      location === r ||
      (r !== "/" && (location.startsWith(r + "/") || location.startsWith(r + "?")))
  );

  const isGlobalOnlyOrgPath = React.useMemo(() => {
    const globalPrefixes = [
      "/admin/",
      "/enterprise/",
      "/crm/super-admin",
      "/crm/pricing-tiers",
      "/crm/ict",
    ];
    return user?.organizationId && user?.role !== "client" && globalPrefixes.some((prefix) => location === prefix.slice(0, -1) || location.startsWith(prefix));
  }, [location, user?.organizationId, user?.role]);

  useEffect(() => {
    if (loading || isPublic) return;

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    // Org isolation: tenant org users must stay within /org/* or public routes
    const isKnownGlobalRoute = isKnownGlobalAppRoute(location);
    if (user?.organizationId && !isGlobalAppUser && !location.startsWith("/org/") && !isPublic && !isKnownGlobalRoute) {
      const slug = user.organizationSlug
        || (() => { try { return JSON.parse(localStorage.getItem("auth-user") || "{}").organizationSlug; } catch { return null; } })();
      if (slug) {
        const tenantPath = stripOrgPathPrefixes(slug, location);
        navigateToBrowserTarget(getOrgSubdomainUrl(slug, tenantPath, "subdomain"), navigate);
        return;
      }
    }

    if (isGlobalOnlyOrgPath) {
      const slug = user.organizationSlug
        || (() => { try { return JSON.parse(localStorage.getItem("auth-user") || "{}").organizationSlug; } catch { return null; } })();
      if (slug) {
        navigateToBrowserTarget(getOrgSubdomainUrl(slug, "/crm-home", "subdomain"), navigate);
        return;
      }
    }

    if (user?.organizationId && !isGlobalAppUser && location.startsWith("/org/")) {
      const routeFeature = getOrgFeatureKeyForRoute(location);
      if (routeFeature) {
        const normalizedKey = routeFeature.replace(/^org:/, "");
        const featureState = orgFeatureMap[normalizedKey];
        const isAllowedByMatrix = canAccessOrgFeatureComplete(
          user.role ?? "",
          orgFeatureMap,
          `org:${routeFeature}`,
          effectivePermissions
        );

        const isBlocked = featureState === false || (!isAllowedByMatrix && routeFeature !== "settings" && routeFeature !== "billing");
        if (isBlocked) {
          const slug = user.organizationSlug || (() => { try { return JSON.parse(localStorage.getItem("auth-user") || "{}").organizationSlug; } catch { return null; } })();
          if (slug) {
            navigateToBrowserTarget(getOrgSubdomainUrl(slug, "/dashboard"), navigate);
            return;
          }
        }
      }
    }

  }, [location, loading, isAuthenticated, user, myOrgData, orgFeatureMap]);

  // Public routes always render immediately — never block with spinner
  if (isPublic) {
    return <>{children}</>;
  }

  // For protected routes: show spinner while loading, then enforce auth checks
  if (loading && !showSpinnerTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // After timeout or loading done: check auth for protected routes
  if (!isAuthenticated && !loading) return null;
  if (user?.organizationId && !isGlobalAppUser && !location.startsWith("/org/")) return null;

  if (user?.organizationId && subscriptionAccess?.locked) {
    return (
      <SubscriptionLockScreen
        status={subscriptionAccess.status}
        isOrgSuperAdmin={subscriptionAccess.isOrgSuperAdmin}
      />
    );
  }

  return <>{children}</>;
}

function SubscriptionLockScreen({ status, isOrgSuperAdmin }: { status: string; isOrgSuperAdmin: boolean }) {
  const terminated = status === "cancelled" || status === "expired";
  return (
    <div className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-xl rounded-xl border border-white/10 bg-white p-8 text-slate-900 shadow-2xl">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-semibold">
          {terminated ? "Subscription terminated" : "Service suspended"}
        </h1>
        <p className="mt-3 text-slate-600">
          {terminated
            ? "This organization no longer has access to application data because its subscription was terminated after an unpaid invoice."
            : "This organization’s service is paused because an invoice is overdue. Application data is locked until payment is confirmed."}
        </p>
        {isOrgSuperAdmin && (
          <p className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-900">
            You can remain signed in to coordinate payment with the platform administrator. Access will be restored automatically after the invoice is marked Paid.
          </p>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          <a className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white" href="/org">
            View billing options
          </a>
          <a className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium" href="/login">
            Sign out
          </a>
        </div>
      </div>
    </div>
  );
}

function useTenantLocation(): [string, (path: string, ...args: any[]) => any] {
  const [path, browserNavigate] = useBrowserLocation();
  const { user } = useAuthWithPersistence();
  const slug = user?.organizationSlug || getOrgSubdomainSlug();
  const urlMode = "subdomain" as const;
  if (typeof window !== "undefined" && user?.organizationId) {
    window.localStorage.setItem("organization-url-mode", "subdomain");
  }
  const pathPrefix = slug ? `/${slug}` : "";
  const isPathBasedOrgPath = Boolean(urlMode === "path" && slug && (path === pathPrefix || path.startsWith(`${pathPrefix}/`)));
  const internalPath = isPathBasedOrgPath
    ? getInternalOrgPath(slug!, path.slice(pathPrefix.length) || "/crm-home")
    : slug && getOrgSubdomainSlug() && !path.startsWith("/org/")
      ? getInternalOrgPath(slug, path)
      : path;
  const navigate = (to: string, options?: any) => {
    const orgPrefix = slug ? `/org/${slug}` : "";
    const isPublicDestination = PUBLIC_ROUTES.some(
      (route) => to === route || (route !== "/" && (to.startsWith(`${route}/`) || to.startsWith(`${route}?`))),
    );
    const destination = slug && user?.organizationId && !isPublicDestination
      ? getOrgSubdomainUrl(
        slug,
        to.startsWith(`${orgPrefix}/`) ? to.slice(orgPrefix.length) || "/crm-home" : to,
        urlMode,
      )
      : to;
    navigateToBrowserTarget(destination, browserNavigate, window.location.href);
  };

  return [internalPath, navigate] as [string, (to: string, ...args: any[]) => any];
}

function Router() {
  return (
    <RouteGuard>
    <Switch>
      {/* Auth Routes */}
      <Route path={"/login"} component={Login} />
      <Route path={"/signup"} component={Signup} />
      <Route path={"/verify-email"} component={VerifyEmail} />
      <Route path={"/checkout"} component={Checkout} />
      <Route path={"/checkout/:planKey"} component={Checkout} />
      <Route path={"/forgot-password"} component={ForgotPassword} />
      <Route path={"/reset-password"} component={ResetPassword} />
      
      {/* Portal Routes */}
      <Route path={"/crm/client-portal"} component={ClientPortal} />
      <Route path={"/reminders"} component={Reminders} />
      
      {/* Organization (Tenant) Routes - MUST come before general routes */}
      <Route path={"/org/:slug/dashboard"} component={OrgDashboardHome} />
      <Route path={"/org/:slug/crm/super-admin"} component={OrgSuperAdminDashboard} />
      <Route path={"/org/:slug/crm/admin"} component={OrgAdminDashboard} />
      <Route path={"/org/:slug/crm/hr"} component={OrgHRDashboard} />
      <Route path={"/org/:slug/crm/accountant"} component={OrgAccountantDashboard} />
      <Route path={"/org/:slug/crm/staff"} component={OrgStaffDashboard} />
      <Route path={"/org/:slug/crm/project-manager"} component={OrgProjectManagerDashboard} />
      <Route path={"/org/:slug/crm/procurement-manager"} component={OrgProcurementManagerDashboard} />
      <Route path={"/org/:slug/crm/ict"} component={OrgICTDashboard} />
      <Route path={"/org/:slug/crm/sales-manager"} component={OrgSalesManagerDashboard} />
      <Route path={"/org/:slug/super-admin"} component={OrgSuperAdminDashboard} />
      <Route path={"/org/:slug/crm-home"} component={OrgDashboardHome} />
      <Route path={"/org/:slug/dashboard-home"} component={OrgDashboardHome} />
      <Route path={"/org/:slug/home"} component={OrgDashboardHome} />
      <Route path={"/org/:slug/settings"} component={OrgSettings} />
      <Route path={"/org/:slug/staff"} component={OrgStaff} />
      <Route path={"/org/:slug/billing"} component={OrgBilling} />
      <Route path={"/org/:slug/pricing"} component={OrgPricing} />
      <Route path={"/org/:slug/crm"} component={OrgCRM} />
      <Route path={"/org/:slug/contacts"} component={OrgContacts} />
      <Route path={"/org/:slug/leads"} component={OrgLeads} />
      <Route path={"/org/:slug/estimates"} component={OrgEstimates} />
      <Route path={"/org/:slug/crm/create"} component={OrgCreateClient} />
      <Route path={"/org/:slug/clients/:id"} component={OrgClientDetail} />
      <Route path={"/org/:slug/pipeline"} component={OrgSalesPipeline} />
      <Route path={"/org/:slug/invoices"} component={OrgInvoices} />
      <Route path={"/org/:slug/invoices/create"} component={OrgCreateInvoice} />
      <Route path={"/org/:slug/invoices/:id/edit"} component={OrgEditInvoice} />
      <Route path={"/org/:slug/invoices/:id"} component={OrgInvoiceDetail} />
      <Route path={"/org/:slug/payments"} component={OrgPayments} />
      <Route path={"/org/:slug/expenses"} component={OrgExpenses} />
      <Route path={"/org/:slug/expenses/create"} component={OrgCreateExpense} />
      <Route path={"/org/:slug/expenses/:id"} component={OrgExpenseDetail} />
      <Route path={"/org/:slug/expenses/:id/edit"} component={OrgEditExpense} />
      <Route path={"/org/:slug/hr"} component={OrgHR} />
      <Route path={"/org/:slug/reports"} component={OrgReports} />
      <Route path={"/org/:slug/calendar"} component={OrgCalendar} />
      <Route path={"/org/:slug/activity"} component={OrgActivity} />
      <Route path={"/org/:slug/approvals"} component={OrgApprovals} />
      <Route path={"/org/:slug/accounting"} component={OrgAccounting} />
      <Route path={"/org/:slug/income-ledger"} component={IncomeLedger} />
      <Route path={"/org/:slug/budgets"} component={OrgBudgets} />
      <Route path={"/org/:slug/projects"} component={OrgProjects} />
      <Route path={"/org/:slug/projects/create"} component={OrgCreateProject} />
      <Route path={"/org/:slug/projects/:id"} component={OrgProjectDetail} />
      <Route path={"/org/:slug/projects/:id/edit"} component={OrgEditProject} />
      <Route path={"/org/:slug/tickets"} component={OrgTickets} />
      <Route path={"/org/:slug/tickets/create"} component={OrgCreateTicket} />
      <Route path={"/org/:slug/tickets/:id"} component={OrgTicketDetail} />
      <Route path={"/org/:slug/tickets/:id/edit"} component={OrgEditTicket} />
      <Route path={"/org/:slug/leave"} component={OrgLeave} />
      <Route path={"/org/:slug/leave/create"} component={OrgCreateLeave} />
      <Route path={"/org/:slug/leave/:id"} component={OrgLeaveDetail} />
      <Route path={"/org/:slug/leave/:id/edit"} component={OrgEditLeave} />
      <Route path={"/org/:slug/attendance"} component={OrgAttendance} />
      <Route path={"/org/:slug/procurement"} component={OrgProcurement} />
      <Route path={"/org/:slug/procurement/create"} component={OrgCreateProcurement} />
      <Route path={"/org/:slug/contracts"} component={OrgContracts} />
      <Route path={"/org/:slug/contracts/create"} component={OrgCreateContract} />
      <Route path={"/org/:slug/contracts/templates"} component={OrgContractTemplates} />
      <Route path={"/org/:slug/contracts/:id"} component={OrgContractDetail} />
      <Route path={"/org/:slug/contracts/:id/edit"} component={OrgEditContract} />
      <Route path={"/org/:slug/work-orders"} component={OrgWorkOrders} />
      <Route path={"/org/:slug/work-orders/create"} component={OrgCreateWorkOrder} />
      <Route path={"/org/:slug/work-orders/:id/edit"} component={OrgEditWorkOrder} />
      <Route path={"/org/:slug/work-orders/:id"} component={OrgWorkOrderDetail} />
      <Route path={"/org/:slug/payments/:id"} component={OrgPaymentDetail} />
      <Route path={"/org/:slug/payments/:id/edit"} component={OrgEditPayment} />
      <Route path={"/org/:slug/estimates/:id"} component={OrgEstimateDetail} />
      <Route path={"/org/:slug/estimates/:id/edit"} component={OrgEditEstimate} />
      <Route path={"/org/:slug/leads/:id"} component={OrgLeadDetail} />
      <Route path={"/org/:slug/leads/:id/edit"} component={OrgEditLead} />
      <Route path={"/org/:slug/contacts/:id"} component={OrgContactDetail} />
      <Route path={"/org/:slug/contacts/:id/edit"} component={OrgEditContact} />
      <Route path={"/org/:slug/budgets/:id"} component={OrgBudgetDetail} />
      <Route path={"/org/:slug/budgets/:id/edit"} component={OrgEditBudget} />
      <Route path={"/org/:slug/procurement/:id"} component={OrgProcurementDetail} />
      <Route path={"/org/:slug/procurement/:id/edit"} component={OrgEditProcurement} />
      <Route path={"/org/:slug/attendance/create"} component={OrgCreateAttendance} />
      <Route path={"/org/:slug/attendance/:id"} component={OrgAttendanceDetail} />
      <Route path={"/org/:slug/attendance/:id/edit"} component={OrgEditAttendance} />
      <Route path={"/org/:slug/approvals/:id"} component={OrgApprovalDetail} />
      <Route path={"/org/:slug/approvals/:id/edit"} component={OrgEditApproval} />
      <Route path={"/org/:slug/receipts/new"} component={OrgCreateReceipt} />
      <Route path={"/org/:slug/receipts/:id/edit"} component={OrgEditReceipt} />
      <Route path={"/org/:slug/receipts/:id"} component={OrgReceiptDetail} />
      <Route path={"/org/:slug/receipts"} component={OrgReceipts} />
      <Route path={"/org/:slug/credit-notes/create"} component={OrgCreateCreditNote} />
      <Route path={"/org/:slug/credit-notes/:id/edit"} component={OrgEditCreditNote} />
      <Route path={"/org/:slug/credit-notes/:id"} component={OrgCreditNoteDetail} />
      <Route path={"/org/:slug/credit-notes"} component={OrgCreditNotes} />
      <Route path={"/org/:slug/debit-notes/create"} component={OrgCreateDebitNote} />
      <Route path={"/org/:slug/debit-notes/:id/edit"} component={OrgEditDebitNote} />
      <Route path={"/org/:slug/debit-notes/:id"} component={OrgDebitNoteDetail} />
      <Route path={"/org/:slug/debit-notes"} component={OrgDebitNotes} />

      <Route path={"/org/:slug/subscriptions"} component={OrgSubscriptions} />
      <Route path={"/org/:slug/chart-of-accounts/:id/edit"} component={EditChartOfAccounts} />
      <Route path={"/org/:slug/chart-of-accounts/:id"} component={ChartOfAccountsDetails} />
      <Route path={"/org/:slug/chart-of-accounts"} component={OrgChartOfAccounts} />
      <Route path={"/org/:slug/bank-reconciliation"} component={OrgBankReconciliation} />
      <Route path={"/org/:slug/finance/reports"} component={OrgFinancialReports} />
      <Route path={"/org/:slug/finance/non-sales-inflows"} component={NonSalesInflowsPage} />
      <Route path={"/org/:slug/finance/accounting-policies"} component={AccountingPoliciesPage} />
      <Route path={"/org/:slug/financial-dashboard"} component={OrgFinancialDashboard} />
      <Route path={"/org/:slug/forecasting"} component={OrgForecasting} />
      <Route path={"/org/:slug/tax-compliance"} component={OrgTaxCompliance} />
      <Route path={"/org/:slug/suppliers/new"} component={OrgCreateSupplier} />
      <Route path={"/org/:slug/suppliers/:id/edit"} component={OrgEditSupplier} />
      <Route path={"/org/:slug/suppliers/:id"} component={OrgSupplierDetail} />
      <Route path={"/org/:slug/suppliers"} component={OrgSuppliers} />
      <Route path={"/org/:slug/lpos/new"} component={OrgCreateLPO} />
      <Route path={"/org/:slug/lpos/:id/edit"} component={OrgEditLPO} />
      <Route path={"/org/:slug/lpos/:id"} component={OrgLPODetail} />
      <Route path={"/org/:slug/lpos"} component={OrgLPOs} />
      <Route path={"/org/:slug/orders/new"} component={OrgCreateOrder} />
      <Route path={"/org/:slug/orders/:id/edit"} component={OrgEditOrder} />
      <Route path={"/org/:slug/orders/:id"} component={OrgOrderDetail} />
      <Route path={"/org/:slug/orders"} component={OrgOrders} />
      <Route path={"/org/:slug/purchase-orders/create"} component={OrgCreatePurchaseOrder} />
      <Route path={"/org/:slug/purchase-orders/:id/edit"} component={OrgEditPurchaseOrder} />
      <Route path={"/org/:slug/purchase-orders/:id"} component={OrgPurchaseOrderDetail} />
      <Route path={"/org/:slug/purchase-orders"} component={OrgPurchaseOrders} />
      <Route path={"/org/:slug/imprests"} component={OrgImprests} />
      <Route path={"/org/:slug/products/new"} component={OrgCreateProduct} />
      <Route path={"/org/:slug/products/:id/edit"} component={OrgEditProduct} />
      <Route path={"/org/:slug/products/:id"} component={OrgProductDetail} />
      <Route path={"/org/:slug/products"} component={OrgProducts} />
      <Route path={"/org/:slug/inventory"} component={OrgInventory} />
      <Route path={"/org/:slug/delivery-notes"} component={OrgDeliveryNotes} />
      <Route path={"/org/:slug/grn"} component={OrgGRN} />
      <Route path={"/org/:slug/services/new"} component={OrgCreateService} />
      <Route path={"/org/:slug/services/:id/edit"} component={OrgEditService} />
      <Route path={"/org/:slug/services/:id"} component={OrgServiceDetail} />
      <Route path={"/org/:slug/services"} component={OrgServices} />
      <Route path={"/org/:slug/service-templates"} component={OrgServiceTemplates} />
      <Route path={"/org/:slug/service-invoices/new"} component={OrgCreateServiceInvoice} />
      <Route path={"/org/:slug/service-invoices/:id/edit"} component={OrgEditServiceInvoice} />
      <Route path={"/org/:slug/service-invoices/:id"} component={OrgServiceInvoiceDetails} />
      <Route path={"/org/:slug/service-invoices"} component={OrgServiceInvoices} />
      <Route path={"/org/:slug/proposals/new"} component={OrgCreateProposal} />
      <Route path={"/org/:slug/proposals/:id/edit"} component={OrgEditProposal} />
      <Route path={"/org/:slug/proposals/:id"} component={OrgProposalDetail} />
      <Route path={"/org/:slug/proposals"} component={OrgProposals} />
      <Route path={"/org/:slug/quotations/new"} component={OrgCreateQuotation} />
      <Route path={"/org/:slug/quotations/:id/edit"} component={OrgEditQuotation} />
      <Route path={"/org/:slug/quotations/:id"} component={OrgQuotationDetail} />
      <Route path={"/org/:slug/quotations"} component={OrgQuotations} />
      <Route path={"/org/:slug/tasks"} component={OrgTasks} />
      <Route path={"/org/:slug/assets"} component={OrgAssets} />
      <Route path={"/org/:slug/warranty"} component={OrgWarranty} />
      <Route path={"/org/:slug/employees/:id"} component={OrgEmployeeDetails} />
      <Route path={"/org/:slug/employees"} component={OrgEmployees} />
      <Route path={"/org/:slug/departments/new"} component={OrgCreateDepartment} />
      <Route path={"/org/:slug/departments/:id/edit"} component={OrgEditDepartment} />
      <Route path={"/org/:slug/departments/:id"} component={OrgDepartmentDetails} />
      <Route path={"/org/:slug/departments"} component={OrgDepartments} />
      <Route path={"/org/:slug/payroll/new"} component={OrgCreatePayroll} />
      <Route path={"/org/:slug/payroll/:id/edit"} component={OrgEditPayroll} />
      <Route path={"/org/:slug/payroll/:id"} component={OrgPayrollDetails} />
      <Route path={"/org/:slug/payroll"} component={OrgPayroll} />
      <Route path={"/org/:slug/salary-structures/new"} component={OrgCreateSalaryStructure} />
      <Route path={"/org/:slug/salary-structures/:id/edit"} component={OrgEditSalaryStructure} />
      <Route path={"/org/:slug/salary-structures/:id"} component={OrgSalaryStructureDetails} />
      <Route path={"/org/:slug/salary-structures"} component={OrgSalaryStructures} />
      <Route path={"/org/:slug/job-groups"} component={OrgJobGroups} />
      <Route path={"/org/:slug/performance-reviews"} component={OrgPerformanceReviews} />
      <Route path={"/org/:slug/canned-responses"} component={OrgCannedResponses} />
      <Route path={"/org/:slug/knowledge-base"} component={OrgKnowledgebase} />
      <Route path={"/org/:slug/staff-chat"} component={OrgStaffChat} />
      <Route path={"/org/:slug/documents"} component={OrgDocuments} />
      <Route path={"/org/:slug/timesheets"} component={OrgTimesheets} />
      <Route path={"/org/:slug/communications"} component={OrgCommunications} />
      <Route path={"/org/:slug/communications/new"} component={OrgCommunications} />
      <Route path={"/org/:slug/ai"} component={OrgAI} />
      {/* Catch-all org module route — handles every /org/:slug/:module path */}
      <Route path={"/org/:slug/:module"} component={OrgModulePage} />
      
      {/* Home & Main Dashboard - Smart routing based on auth state */}
      <Route path={"/"} component={LandingPage} />
      <Route path={"/features/:featureId"} component={WebsiteFeatureDetail} />
      <Route path={"/features"} component={WebsiteFeatures} />
      <Route path={"/pricing"} component={WebsitePricing} />
      <Route path={"/about"} component={WebsiteAbout} />
      <Route path={"/page/:slug"} component={CustomWebsitePage} />
      <Route path={"/contact"} component={WebsiteContact} />
      <Route path={"/home"} component={Home} />
      <Route path={"/demo"} component={Demo} />
      <Route path={"/book-a-demo"} component={BookADemo} />
      <Route path={"/become-a-partner"} component={BecomeAPartner} />
      <Route path={"/partner-portal"} component={PartnerPortal} />
      <Route path={"/blog"} component={Blog} />
      <Route path={"/landing"} component={LandingPage} />
      <Route path={"/dashboard"} component={UnifiedLanding} />
      
      {/* Main Dashboard - Unified for all users with role-aware content */}
      <Route path={"/crm/super-admin"} component={SuperAdminDashboard} />
      <Route path={"/crm/hr"} component={HRDashboard} />
      <Route path={"/crm/accountant"} component={AccountantDashboard} />
      <Route path={"/crm/staff"} component={StaffDashboard} />
      <Route path={"/crm/project-manager"} component={ProjectManagerDashboard} />
      <Route path={"/crm/procurement-manager"} component={ProcurementManagerDashboard} />
      <Route path={"/crm/sales-manager"} component={SalesManagerDashboard} />
      <Route path={"/crm"} component={BusinessDashboardPage} />
      <Route path={"/crm-home"} component={BusinessDashboardPage} />
      
      <Route path={"/crm/pricing-tiers"} component={SuperAdminPricingTiers} />
      <Route path={"/crm/ict/email-queue"}>{() => <RouteRedirect to="/settings#email-queue" />}</Route>
      <Route path={"/crm/ict/system-health"}>{() => <RouteRedirect to="/admin/system-health" />}</Route>
      <Route path={"/crm/ict/analytics"}>{() => <RouteRedirect to="/admin/performance" />}</Route>
      <Route path={"/crm/ict/database"}>{() => <RouteRedirect to="/admin/database" />}</Route>
      <Route path={"/crm/ict/integrations"}>{() => <RouteRedirect to="/integrations" />}</Route>
      <Route path={"/crm/ict/cron-jobs"}>{() => <RouteRedirect to="/admin/cron-jobs" />}</Route>
      <Route path={"/crm/ict/security"}>{() => <RouteRedirect to="/admin/management" />}</Route>
      <Route path={"/crm/ict/access-permissions"}>{() => <RouteRedirect to="/admin/management#permissions" />}</Route>
      <Route path={"/crm/ict/api-keys"}>{() => <RouteRedirect to="/admin/api-keys" />}</Route>
      <Route path={"/crm/ict/network"}>{() => <RouteRedirect to="/admin/network" />}</Route>
      <Route path={"/crm/ict/system-settings"}>{() => <RouteRedirect to="/admin/ict-settings" />}</Route>
      <Route path={"/crm/ict/activity"}>{() => <RouteRedirect to="/admin/sessions" />}</Route>
      <Route path={"/crm/ict"} component={ICTDashboard} />
      <Route path={"\u002fcrm\u002fict"} component={ICTDashboard} />
      
      {/* Global Settings - Available to all users */}
      <Route path={"/settings/global"} component={GlobalSettings} />
      <Route path={"/user/settings"} component={GlobalSettings} />
      
      {/* Legacy Dashboard Routes (kept for backward compatibility) */}
      <Route path={"/dashboard-home"} component={DashboardHome} />
      <Route path={"/rbd"} component={RoleBasedDashboard} />
      <Route path={"/account"} component={AccountSettings} />
      <Route path={"/sales"} component={Sales} />
      <Route path={"/accounting"} component={Accounting} />
      <Route path={"/income-ledger"} component={IncomeLedger} />
      <Route path={"/accounting/management"} component={AccountingManagement} />
      
      {/* Admin Routes */}
      <Route path={"/admin/management"} component={AdminManagement} />
      <Route path={"/crm/admin"} component={AdminManagement} />
      <Route path={"/crm/admin/tenant-admins"} component={TenantAdmins} />
      <Route path={"/crm/admin/tenant-admins/:id"} component={TenantAdminDetails} />
      <Route path={"/enterprise/tenant-admins/:id"} component={TenantAdminDetails} />
      <Route path={"/enterprise/tenants/:id"} component={EnterpriseTenantDetails} />
      <Route path={"/crm/admin/tenant-users/:orgId/:userId"} component={TenantUserDetails} />
      <Route path={"/crm/admin/tenant-users"} component={TenantUsers} />
      
      {/* CRM Home for regular users */}
      <Route path={"/crm/home"} component={BusinessDashboardPage} />
      
      {/* User Routes - STATIC routes BEFORE dynamic routes */}
      <Route path={"/users/new"} component={CreateUser} />
      <Route path={"/users/:id/edit"} component={EditUser} />
      <Route path={"/users/:id"} component={UserDetails} />
      
      {/* Project Routes - STATIC routes BEFORE dynamic routes */}
      <Route path={"/projects"} component={Projects} />
      <Route path={"/projects/management"} component={ProjectsManagement} />
      <Route path={"/projects/create"} component={CreateProject} />
      <Route path={"/projects/:id/edit"} component={EditProject} />
      <Route path={"/projects/:id"} component={ProjectDetails} />
      
      {/* Client Routes - STATIC routes BEFORE dynamic routes */}
      <Route path={"/clients"} component={Clients} />
      <Route path={"/clients/create"} component={CreateClient} />
      <Route path={"/clients/:id/edit"} component={EditClient} />
      <Route path={"/clients/:id"} component={ClientDetails} />
      
      {/* Contact Routes - STATIC routes BEFORE dynamic routes */}
      <Route path={"/contacts"} component={Contacts} />
      <Route path={"/contacts/create"} component={CreateContact} />
      <Route path={"/contacts/:id/edit"} component={EditContact} />
      <Route path={"/contacts/:id"} component={ContactDetails} />

      {/* Tasks Route */}
      <Route path={"/tasks"} component={Tasks} />
      <Route path={"/tasks/:id"} component={TaskDetails} />

      {/* Leads Route */}
      <Route path={"/leads"} component={Leads} />
      <Route path={"/leads/:id"} component={LeadDetails} />

      {/* Subscriptions Route */}
      <Route path={"/subscriptions"} component={Subscriptions} />      <Route path={"\u002fsubscriptions\u002f:id"} component={SubscriptionDetails} />
      {/* Knowledge Base Route */}
      <Route path={"/knowledge-base"} component={KnowledgeBase} />
      <Route path={"/knowledgebase"} component={KnowledgeBase} />
      
      {/* Warehouses Route */}
      <Route path={"/warehouses"} component={Warehouses} />
      
      {/* Document Template Routes */}
      <Route path={"/invoices/templates"}>{() => <DocumentTemplates type="invoice" />}</Route>
      <Route path={"/estimates/templates"}>{() => <DocumentTemplates type="estimate" />}</Route>
      <Route path={"/quotations/templates"}>{() => <DocumentTemplates type="quotation" />}</Route>
      <Route path={"/receipts/templates"}>{() => <DocumentTemplates type="receipt" />}</Route>
      <Route path={"/lpos/templates"}>{() => <DocumentTemplates type="purchase_order" />}</Route>
      <Route path={"/credit-notes/templates"}>{() => <DocumentTemplates type="credit_note" />}</Route>
      <Route path={"/debit-notes/templates"}>{() => <DocumentTemplates type="debit_note" />}</Route>
      <Route path={"/payslips/templates"}>{() => <DocumentTemplates type="payslip" />}</Route>
      <Route path={"/warranty/templates"}>{() => <DocumentTemplates type="warranty" />}</Route>
      <Route path={"/assets/templates"}>{() => <DocumentTemplates type="asset" />}</Route>
      <Route path={"/delivery-notes/templates"}>{() => <DocumentTemplates type="delivery_note" />}</Route>
      <Route path={"/grn/templates"}>{() => <DocumentTemplates type="grn" />}</Route>
      <Route path={"/imprests/templates"}>{() => <DocumentTemplates type="imprest" />}</Route>
      <Route path={"/orders/templates"}>{() => <DocumentTemplates type="order" />}</Route>
      <Route path={"/expenses/templates"}>{() => <DocumentTemplates type="expense_claim" />}</Route>
      <Route path={"/service-invoices/templates"}>{() => <DocumentTemplates type="service_invoice" />}</Route>
      <Route path={"/work-orders/templates"}>{() => <DocumentTemplates type="work_order" />}</Route>

      {/* Invoice Routes - STATIC routes BEFORE dynamic routes */}
      <Route path={"/invoices"} component={Invoices} />
      <Route path={"/invoices/create"} component={CreateInvoice} />
      <Route path={"/invoices/:id/edit"} component={EditInvoice} />
      <Route path={"/invoices/:id"} component={InvoiceDetails} />
      
      {/* Recurring Expense Routes */}
      <Route path={"/recurring-expenses"} component={RecurringExpenses} />
      
      {/* Recurring Invoice Routes */}
      <Route path={"/recurring-invoices"} component={RecurringInvoices} />
      
      {/* Payment Plans Routes */}
      <Route path={"/payment-plans"} component={PaymentPlans} />
      
      {/* Project Milestones Routes */}
      <Route path={"/project-milestones"} component={ProjectMilestones} />
      
      {/* Time Tracking Routes */}
      <Route path={"/time-tracking"} component={TimeTracking} />
      
      {/* Sales Pipeline Routes */}
      <Route path={"/sales-pipeline"} component={SalesPipeline} />
      {/* Workflow Automation Routes */}
      <Route path={"/workflow-automation"} component={WorkflowAutomation} />
      {/* Estimate Routes - STATIC routes BEFORE dynamic routes */}
      <Route path={"/estimates"} component={Estimates} />
      <Route path={"/estimates/create"} component={CreateEstimate} />
      <Route path={"/estimates/:id/edit"} component={EditEstimate} />
      <Route path={"/estimates/:id"} component={EstimateDetails} />
      
      {/* Receipt Routes - STATIC routes BEFORE dynamic routes */}
      <Route path={"/tickets"} component={TicketsPage} />
      <Route path={"/tickets/create"} component={CreateTicket} />
      <Route path={"/tickets/:id/edit"} component={EditTicket} />
      <Route path={"/finance/settings"} component={FinanceSettingsPage} />
      <Route path={"/receipts"} component={Receipts} />
      <Route path={"/receipts/create"} component={CreateReceipt} />
      <Route path={"/receipts/:id/edit"} component={EditReceipt} />
      <Route path={"/receipts/:id"} component={ReceiptDetails} />
      
      {/* Opportunity Routes - STATIC routes BEFORE dynamic routes */}
      <Route path={"/opportunities"} component={Opportunities} />
      <Route path={"/opportunities/create"} component={CreateOpportunity} />
      <Route path={"/opportunities/:id/edit"} component={EditOpportunity} />
      <Route path={"/opportunities/:id"} component={OpportunityDetails} />
      
      {/* Payment Routes - STATIC routes BEFORE dynamic routes */}
      <Route path={"/payments"} component={Payments} />
      <Route path={"/payments/create"} component={CreatePayment} />
      <Route path={"/payments/reconciliation"} component={PaymentReconciliation} />
      <Route path={"/payments/overdue"} component={OverduePayments} />
      <Route path={"/payments/reports"} component={PaymentReports} />
      <Route path={"/payments/:id/edit"} component={EditPayment} />
      <Route path={"/payments/:id"} component={PaymentDetails} />
      
      {/* Product Routes - STATIC routes BEFORE dynamic routes */}
      <Route path={"/products"} component={Products} />
      <Route path={"/products/create"} component={CreateProduct} />
      <Route path={"/products/:id/edit"} component={EditProduct} />
      <Route path={"/products/:id"} component={ProductDetails} />
      
      {/* Service Routes - STATIC routes BEFORE dynamic routes */}
      <Route path={"/services"} component={Services} />
      <Route path={"/services/create"} component={CreateService} />
      <Route path={"/services/:id/edit"} component={EditService} />
      <Route path={"/services/:id"} component={ServiceDetails} />
      
      {/* Expense Routes - STATIC routes BEFORE dynamic routes */}
      <Route path={"/expenses"} component={Expenses} />
      <Route path={"/expenses/create"} component={CreateExpense} />
      <Route path={"/expenses/:id/edit"} component={EditExpense} />
      <Route path={"/expenses/:id"} component={ExpensesDetails} />
      
      {/* HR Routes - STATIC routes BEFORE dynamic routes */}
      <Route path={"/hr"} component={HR} />
      <Route path={"/hr/:id/edit"} component={EditEmployee} />
      <Route path={"/hr/:id"} component={HRDetails} />
      <Route path={"/job-groups"} component={JobGroups} />
      <Route path={"/job-groups/:id"} component={JobGroupDetails} />
      <Route path={"/onboarding"} component={Onboarding} />
      <Route path={"/holidays"} component={Holidays} />
      <Route path={"/payslips"} component={Payslips} />
      <Route path={"/my-payslips"} component={MyPayslips} />
      <Route path={"/payslips/:id"} component={PayslipDetails} />
      <Route path={"/training"} component={Training} />
      
      {/* Employee Routes - STATIC routes BEFORE dynamic routes */}
      <Route path={"/employees"} component={Employees} />
      <Route path={"/employees/create"} component={CreateEmployee} />
      <Route path={"/employees/:id/edit"} component={EditEmployee} />
      <Route path={"/employees/:id"} component={EmployeeDetails} />
      
      {/* Attendance Routes - STATIC routes BEFORE dynamic routes */}
      <Route path={"/attendance"} component={Attendance} />
      <Route path={"/attendance/new"} component={CreateAttendance} />
      <Route path={"/attendance/create"} component={CreateAttendance} />
      <Route path={"/attendance/:id/edit"} component={EditAttendance} />
      <Route path={"/attendance/:id"} component={AttendanceDetails} />
      
      {/* Payroll Routes - STATIC routes BEFORE dynamic routes */}
      <Route path={"/payroll"} component={HRPayrollManagement} />
      <Route path={"/payroll/approvals"} component={PayrollApprovals} />
      <Route path={"/payroll/cost-allocations"} component={PayrollCostAllocations} />
      <Route path={"/payroll/payslips"} component={PayslipManagementPage} />
      <Route path={"/payroll/kenyan"} component={CreatePayroll} />
      <Route path={"/payroll/tax-compliance"} component={TaxComplianceReportsPage} />
      <Route path={"/payroll/salary-structures"} component={SalaryStructures} />
      <Route path={"/payroll/allowances-deductions"} component={AllowancesDeductions} />
      <Route path={"/payroll/benefits"} component={Benefits} />
      <Route path={"/payroll/tax-information"} component={TaxInformation} />
      <Route path={"/finance/reports"} component={FinancialReportsPage} />
      <Route path={"/finance/non-sales-inflows"} component={NonSalesInflowsPage} />
      <Route path={"/finance/accounting-policies"} component={AccountingPoliciesPage} />
      <Route path={"/imprests"} component={ImprestsPage} />
      <Route path={"/reports/sales"} component={SalesReportsPage} />
      <Route path={"/import-excel"} component={ImportExcelPage} />
      <Route path={"/tools"} component={Settings} />
      <Route path={"/tools/theme-customization"} component={ThemeCustomization} />
      <Route path={"/tools/brand-customization"} component={BrandCustomization} />
      <Route path={"/tools/homepage-builder"} component={CustomHomepageBuilder} />
      <Route path={"/tools/system-settings"} component={SystemSettings} />
      <Route path={"/tools/integration-guides"} component={IntegrationGuides} />
      <Route path={"/tools/ui-elements"} component={UiElements} />
      
      {/* Payroll - Full CRUD Routes */}
      <Route path={"/payroll/department-reports"} component={DepartmentPayrollReports} />
      <Route path={"/department-payroll-reports"} component={DepartmentPayrollReports} />
      <Route path={"/payroll/create"} component={CreatePayroll} />
      <Route path={"/payroll/:id/edit"} component={EditPayroll} />
      <Route path={"/payroll/:id"} component={PayrollDetails} />
      
      {/* Salary Structures - Full CRUD Routes */}
      <Route path={"/salary-structures/create"} component={CreateSalaryStructure} />
      <Route path={"/payroll/salary-structures/create"} component={CreateSalaryStructure} />
      <Route path={"/salary-structures/:id"} component={SalaryStructureDetails} />
      <Route path={"/payroll/salary-structures/:id"} component={SalaryStructureDetails} />
      <Route path={"/salary-structures/:id/edit"} component={EditSalaryStructure} />
      <Route path={"/payroll/salary-structures/:id/edit"} component={EditSalaryStructure} />
      
      {/* Allowances - Full CRUD Routes */}
      <Route path={"/allowances/create"} component={CreateAllowance} />
      <Route path={"/payroll/allowances/create"} component={CreateAllowance} />
      <Route path={"/allowances/:id/edit"} component={EditAllowance} />
      <Route path={"/payroll/allowances/:id/edit"} component={EditAllowance} />
      
      {/* Deductions - Full CRUD Routes */}
      <Route path={"/deductions/create"} component={CreateDeduction} />
      <Route path={"/payroll/deductions/create"} component={CreateDeduction} />
      <Route path={"/deductions/:id/edit"} component={EditDeduction} />
      <Route path={"/payroll/deductions/:id/edit"} component={EditDeduction} />
      
      {/* Benefits - Full CRUD Routes */}
      <Route path={"/benefits/create"} component={CreateBenefit} />
      <Route path={"/payroll/benefits/create"} component={CreateBenefit} />
      <Route path={"/benefits/:id/edit"} component={EditBenefit} />
      <Route path={"/payroll/benefits/:id/edit"} component={EditBenefit} />
      
      {/* Leave Management Routes - STATIC routes BEFORE dynamic routes */}
      <Route path={"/leave-management"} component={LeaveManagement} />
      <Route path={"/leave-management/create"} component={CreateLeaveRequest} />
      <Route path={"/leave-management/:id/edit"} component={EditLeave} />
      <Route path={"/leave-management/:id"} component={LeaveManagementDetails} />
      
      {/* Department Routes - STATIC routes BEFORE dynamic routes */}
      <Route path={"/departments"} component={Departments} />
      <Route path={"/departments/create"} component={CreateDepartment} />
      <Route path={"/departments/:id/edit"} component={EditDepartment} />
      <Route path={"/departments/:id"} component={DepartmentDetails} />
      
      {/* Budget Routes - STATIC routes BEFORE dynamic routes */}
      <Route path={"/budgets"} component={BudgetsPage} />
      <Route path={"/budgets/create"} component={ProfessionalBudgeting} />
      <Route path={"/budgets/professional"} component={ProfessionalBudgeting} />
      <Route path={"/budgets/:id/edit"} component={EditBudget} />
      <Route path={"/budgets/:id"} component={BudgetDetail} />
      
      {/* Procurement Master Route - Main procurement hub */}
      <Route path={"/procurement"} component={ProcurementMaster} />
      
      {/* Supplier Routes - STATIC routes BEFORE dynamic routes */}
      <Route path={"/suppliers"} component={Suppliers} />
      <Route path={"/suppliers/create"} component={CreateSupplier} />
      <Route path={"/suppliers/:id/edit"} component={EditSupplier} />
      <Route path={"/suppliers/:id"} component={SupplierDetails} />
      
      {/* LPO Routes - STATIC routes BEFORE dynamic routes */}
      <Route path={"/lpos"} component={LPOsPage} />
      <Route path={"/lpos/create"} component={CreateLPO} />
      <Route path={"/lpos/professional"} component={ProcurementLPOs} />
      <Route path={"/lpos/:id/edit"} component={EditLPO} />
      <Route path={"/lpos/:id"} component={LPODetails} />
      
      {/* Order Routes - STATIC routes BEFORE dynamic routes */}
      <Route path={"/orders"} component={OrdersPage} />
      <Route path={"/orders/create"} component={CreateOrder} />
      <Route path={"/orders/professional"} component={ProcurementOrders} />
      <Route path={"/orders/:id/edit"} component={EditOrder} />
      <Route path={"/orders/:id"} component={OrderDetails} />
      
      {/* Imprest Routes */}
      <Route path={"/imprests/professional"} component={ProcurementImprests} />
      <Route path={"/imprests/:id"} component={ImprestDetails} />
      
      {/* Quotes Routes - STATIC routes BEFORE dynamic routes */}
      <Route path={"/quotes/new"} component={CreateQuote} />
      <Route path={"/quotes/:id/edit"} component={CreateQuote} />
      <Route path={"/quotes/:id"} component={QuoteDetails} />
      <Route path={"/quotes"} component={Quotes} />

      {/* Phase 20 - Quotations & RFQs */}
      <Route path={"/quotations/:id"} component={QuotationDetails} />
      <Route path={"/quotations"} component={Quotations} />
      
      {/* Phase 20 - Delivery Notes */}
      <Route path={"/delivery-notes/:id"} component={DeliveryNoteDetails} />
      <Route path={"/delivery-notes"} component={DeliveryNotes} />
      
      {/* Phase 20 - Goods Received Notes */}
      <Route path={"/grn/:id"} component={GRNDetails} />
      <Route path={"/grn"} component={GRN} />
      
      {/* Phase 20 - Contracts Management */}
      <Route path={"/contracts/templates"} component={ContractTemplates} />
      <Route path={"/contracts/:id"} component={ContractDetails} />
      <Route path={"/contracts"} component={ContractManagement} />
      <Route path={"/e-signatures"} component={ESignatures} />
      
      {/* Phase 20 - Asset Management */}
      <Route path={"/assets/:id"} component={AssetDetails} />
      <Route path={"/assets"} component={AssetManagement} />
      
      {/* Phase 20 - Warranty Management */}
      <Route path={"/warranty/create"} component={CreateWarranty} />
      <Route path={"/warranty/:id/edit"} component={EditWarranty} />
      <Route path={"/warranty/:id"} component={WarrantyDetails} />
      <Route path={"/warranty"} component={WarrantyManagement} />
      
      {/* HR Analytics Route */}
      <Route path={"/hr/analytics"} component={HRAnalyticsDashboard} />
      <Route path={"/hr/analytics-dashboard"} component={HRAnalyticsDashboard} />
      
      {/* Payroll Reports */}
      <Route path={"/budgets/expense-report"} component={ExpenseBudgetReport} />
      <Route path={"/reports/custom-builder"} component={CustomReportBuilder} />
      
      {/* Approvals Route */}
      <Route path={"/approvals"} component={Approvals} />
      <Route path={"/notifications"} component={Notifications} />
      
      {/* Communications Routes - STATIC routes BEFORE dynamic routes */}
      <Route path={"/communications/new"} component={CreateCommunication} />
      <Route path={"/communications/:id"} component={CommunicationDetails} />
      <Route path={"/communications"} component={Communications} />
      
      {/* Messages Route */}
      <Route path={"/messages"} component={Messages} />
      
      {/* Activity Route */}
      <Route path={"/activity"} component={ActivityPage} />

      {/* Calendar Route */}
      <Route path={"/calendar"} component={CalendarPage} />
      <Route path={"/reminders"} component={Reminders} />
      
      {/* Accounting Routes */}
      <Route path={"/bank-reconciliation"} component={BankReconciliation} />
      <Route path={"/erp-controls"} component={ERPControls} />
      <Route path={"/erp-operations"} component={ERPOperations} />
      <Route path={"/bank-reconciliation/:id/edit"} component={EditBankReconciliation} />
      <Route path={"/bank-reconciliation/:id"} component={BankReconciliationDetails} />
      <Route path={"/chart-of-accounts"} component={ChartOfAccounts} />
      <Route path={"/chart-of-accounts/:id/edit"} component={EditChartOfAccounts} />
      <Route path={"/chart-of-accounts/:id"} component={ChartOfAccountsDetails} />
      
      {/* Report Routes */}
      <Route path={"/reports"} component={Reports} />
      <Route path={"/reports/financial"} component={FinancialReportsPage} />
      <Route path={"/reports/customers"} component={CustomerReportsPage} />
      <Route path={"/reports/projects"} component={ProjectReportsPage} />
      <Route path={"/reports/hr"} component={HRReportsPage} />
      <Route path={"/reports/:id/edit"} component={CustomReportBuilder} />
      <Route path={"/reports/:id"} component={ReportsDetails} />
      
      {/* Account Routes */}
      <Route path={"/privacy-policy"} component={PrivacyPolicy} />
      <Route path={"/terms-and-conditions"} component={TermsAndConditions} />
      <Route path={"/documentation"} component={Documentation} />
      <Route path={"/documents"} component={DocumentManagement} />
      <Route path={"/user-guide"} component={UserGuide} />
      <Route path={"/troubleshooting"} component={TroubleshootingGuide} />
      <Route path={"/create-imprest"} component={CreateImprest} />
      <Route path={"/create-purchase-order"} component={CreatePurchaseOrder} />
      
      {/* Inventory Routes */}
      <Route path={"/inventory"} component={Inventory} />
      
      {/* Financial Dashboard Routes */}
      <Route path={"/financial-dashboard"} component={FinancialDashboard} />
      
      {/* User Profile Routes */}
      <Route path={"/profile"} component={Profile} />
      <Route path={"/security"} component={Security} />
      <Route path={"/mfa"} component={MFA} />
      <Route path={"/settings"} component={TenantSafeSettingsRoute} />
      <Route path={"/roles"} component={Roles} />

      {/* AI Hub Route */}
      <Route path={"/ai-hub"} component={AIHub} />
      
      {/* Test Routes */}
      <Route path={"/test-pdf"} component={TestPDFGeneration} />
      
      {/* Password Management Routes */}
      <Route path={"/change-password"} component={ChangePassword} />
      <Route path={"/change-password-enhanced"} component={EnhancedChangePassword} />
      
      {/* Phase 4 Billing & Finance Routes */}
      <Route path={"/billing"} component={BillingDashboard} />
      <Route path={"/billing/dashboard"} component={BillingDashboard} />
      <Route path={"/receipts-advanced"} component={EnhancedReceiptManagement} />
      
      {/* Enterprise Routes */}
      <Route path={"/enterprise/tenants"} component={MultiTenancy} />
      <Route path={"/enterprise/tenants-management"} component={EnterpriseTenantsManagement} />
      <Route path={"/org/users"} component={OrganizationUsersManagement} />
      <Route path={"/enterprise/pricing"} component={SuperAdminPricingTiers} />
      <Route path={"/audit-logs"} component={AuditLogs} />
      <Route path={"/enterprise/tenant-admins"} component={MultiTenancy} />
      <Route path={"/enterprise/tenant-comms"} component={MultiTenancy} />
      <Route path={"/enterprise/create-super-admin"} component={SuperAdminDashboard} />
      <Route path={"/enterprise/settings"} component={EnterpriseSettings} />
      <Route path={"/enterprise/reports"} component={EnterpriseReports} />
      <Route path={"/enterprise/communications"} component={MultiTenancy} />

      {/* Sales Module Routes */}
      <Route path={"/service-invoices"} component={ServiceInvoices} />
      <Route path={"/service-invoices/create"} component={CreateServiceInvoice} />
      <Route path={"/service-invoices/:id/edit"} component={EditServiceInvoice} />
      <Route path={"/credit-notes/create"} component={CreateCreditNote} />
      <Route path={"/credit-notes/:id/edit"} component={EditCreditNote} />
      <Route path={"/credit-notes/:id"} component={CreditNoteDetails} />
      <Route path={"/credit-notes"} component={CreditNotes} />
      <Route path={"/debit-notes/create"} component={CreateDebitNote} />
      <Route path={"/debit-notes/:id/edit"} component={EditDebitNote} />
      <Route path={"/debit-notes/:id"} component={DebitNoteDetails} />
      <Route path={"/debit-notes"} component={DebitNotes} />
      <Route path={"/proposals/templates"} component={ProposalTemplates} />
      <Route path={"/proposals"} component={Proposals} />
      <Route path={"/proposals/:id/edit"} component={EditProposal} />
      <Route path={"/proposals/:id"} component={ProposalDetails} />
      <Route path={"/sales-pipeline"} component={SalesPipeline} />

      {/* Accounting / Finance Routes */}
      <Route path={"/forecasting"} component={Forecasting} />

      {/* HR Routes */}
      <Route path={"/performance-reviews"} component={PerformanceReviews} />
      <Route path={"/employee-contracts"} component={EmployeeContracts} />
      <Route path={"/leave-balances"} component={LeaveBalances} />
      <Route path={"/disciplinary"} component={DisciplinaryRecords} />
      <Route path={"/recruitment"} component={Recruitment} />
      <Route path={"/hr-automation"} component={HRAutomation} />

      {/* Products / Services Routes */}
      <Route path={"/service-templates"} component={ServiceTemplates} />
      <Route path={"/service-templates/create"} component={CreateServiceTemplate} />
      <Route path={"/service-templates/:id"} component={ServiceTemplateDetails} />
      <Route path={"/service-templates/:id/edit"} component={CreateServiceTemplate} />

      {/* Assets & Contracts Routes */}
      <Route path={"/work-orders"} component={WorkOrders} />
      <Route path={"/work-orders/create"} component={CreateWorkOrder} />
      <Route path={"/work-orders/:id/edit"} component={EditWorkOrder} />

      {/* Reports Routes */}
      <Route path={"/report-builder"} component={ReportBuilder} />
      <Route path={"/kpi-tracking"} component={KPITracking} />
      <Route path={"/activity-trail"} component={ActivityTrail} />
      <Route path={"/hr-analytics"} component={HRAnalytics} />
      <Route path={"/project-analytics"} component={ProjectAnalytics} />
      <Route path={"/advanced-analytics"} component={AdvancedAnalytics} />
      <Route path={"/reports/revenue"} component={RevenueForecasting} />
      <Route path={"/reports/conversion"} component={ConversionAnalytics} />

      {/* Communications Routes */}
      <Route path={"/staff-chat"} component={StaffChat} />
      <Route path={"/files"} component={FileManager} />
      <Route path={"/canned-responses"} component={CannedResponses} />

      {/* Admin Routes */}
      <Route path={"/admin/email-queue"} component={EmailQueue} />
      <Route path={"/admin/sms-queue"} component={SmsQueue} />
      <Route path={"/admin/backups"} component={BackupManagement} />
      <Route path={"/admin/email-templates"} component={AdminEmailTemplatesRoute} />
      <Route path={"/admin/cron-jobs"} component={AdminCronJobs} />
      <Route path={"/admin/partners"} component={PartnerManagement} />
      <Route path={"/admin/tenant-communications"} component={TenantCommunications} />
      <Route path={"/admin/maintenance"} component={MaintenanceAdmin} />
      <Route path={"/admin/website"} component={WebsiteAdmin} />
      <Route path={"/admin/system-health"} component={SystemHealthDashboard} />
      <Route path={"/admin/sessions"} component={SessionManager} />
      <Route path={"/admin/system-logs"} component={SystemLogsViewer} />
      <Route path={"/admin/ict-settings"} component={ICTSystemSettings} />
      <Route path={"/admin/ict-analytics"} component={ICTAnalytics} />
      <Route path={"/admin/database"} component={DatabaseManagement} />
      <Route path={"/admin/network"} component={NetworkConfiguration} />
      <Route path={"/admin/performance"} component={PerformanceMetrics} />
      <Route path={"/admin/api-keys"} component={ApiKeysManagement} />

      {/* Tools Routes */}
      <Route path={"/tools/custom-fields"} component={CustomFieldsPage} />
      <Route path={"/system-health"} component={SystemHealth} />
      <Route path={"/automation"} component={WorkflowAutomation} />
      <Route path={"/workflow-automation"} component={WorkflowAutomation} />
      <Route path={"/integrations"} component={Integrations} />
      <Route path={"/search"} component={GlobalSearch} />

      {/* Notes & Timesheets */}
      <Route path={"/notes"} component={Notes} />
      <Route path={"/timesheets"} component={Timesheets} />

      {/* Analytics & BI Routes */}
      <Route path={"/executive-dashboard"} component={ExecutiveDashboard} />
      <Route path={"/notification-center"} component={NotificationCenter} />
      <Route path={"/bi-tools"} component={BiTools} />
      <Route path={"/analytics/churn-prediction"} component={ChurnPrediction} />
      <Route path={"/analytics/funnel-analysis"} component={FunnelAnalysis} />
      <Route path={"/analytics/cohort-analysis"} component={CohortAnalysis} />
      <Route path={"/analytics/client-performance"} component={ClientPerformancePage} />
      <Route path={"/dashboard-builder-pro"} component={DashboardBuilderPro} />

      {/* Path-based organization aliases must remain after concrete app routes. */}
      <Route path={"/:slug/"} component={OrgDashboardHome} />
      <Route path={"/:slug/dashboard"} component={OrgDashboardHome} />
      <Route path={"/:slug/leads"} component={OrgLeads} />
      <Route path={"/:slug/leads/:id"} component={OrgLeadDetail} />
      <Route path={"/:slug/leads/:id/edit"} component={OrgEditLead} />
      <Route path={"/dashboards/dashboardhome"} component={DashboardHome} />

      {/* 404 Not Found */}
      <Route component={NotFound} />
    </Switch>
    </RouteGuard>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable={true}>
        <ThemeCustomizationProvider>
          <BrandProvider>
            <CurrencyProvider>
              <PermissionProvider>
                <NotificationsProvider>
                  <TooltipProvider>
                    <Suspense fallback={<div className="flex items-center justify-center h-screen"><Loader2 className="size-8 animate-spin text-blue-500" /></div>}>
                      <WouterRouter hook={useTenantLocation}>
                        <Router />
                      </WouterRouter>
                    </Suspense>
                  </TooltipProvider>
                </NotificationsProvider>
              </PermissionProvider>
            </CurrencyProvider>
          </BrandProvider>
        </ThemeCustomizationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}