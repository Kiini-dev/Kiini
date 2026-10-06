"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var useAuthWithPersistence_1 = require("@/_core/hooks/useAuthWithPersistence");
var ThemeContext_1 = require("@/contexts/ThemeContext");
var SystemSettingsContext_1 = require("@/contexts/SystemSettingsContext");
var BrandContext_1 = require("@/contexts/BrandContext");
var useMaintenanceModeEnforcement_1 = require("@/hooks/useMaintenanceModeEnforcement");
var usePermissionBasedNavigation_1 = require("@/hooks/usePermissionBasedNavigation");
var useSettingsSync_1 = require("@/hooks/useSettingsSync");
var MaintenancePage_1 = require("@/pages/MaintenancePage");
var trpc_1 = require("@/lib/trpc");
var button_1 = require("@/components/ui/button");
var avatar_1 = require("@/components/ui/avatar");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var scroll_area_1 = require("@/components/ui/scroll-area");
var sheet_1 = require("@/components/ui/sheet");
var NotificationBell_1 = require("./NotificationBell");
var FloatingAIChat_1 = require("./FloatingAIChat");
var FloatingChatNotifications_1 = require("./FloatingChatNotifications");
var AccessibilityWidget_1 = require("./AccessibilityWidget");
var const_1 = require("@/const");
var lucide_react_1 = require("lucide-react");
var tooltip_1 = require("@/components/ui/tooltip");
var utils_1 = require("@/lib/utils");
// ── Role-specific navigation definitions ──────────────────────────────────
var NAV_SUPER_ADMIN = [
    { title: "Dashboard", href: "/crm/super-admin", icon: lucide_react_1.Home },
    { title: "Administration", icon: lucide_react_1.Shield, children: [
            { title: "User Management", href: "/admin/management", icon: lucide_react_1.UserCog },
            { title: "Backups", href: "/admin/backups", icon: lucide_react_1.Settings },
            { title: "Cron Jobs", href: "/admin/cron-jobs", icon: lucide_react_1.Timer },
            { title: "Approvals", href: "/approvals", icon: lucide_react_1.CheckSquare },
            { title: "Audit Logs", href: "/audit-logs", icon: lucide_react_1.BookOpen },
            { title: "System Health", href: "/system-health", icon: lucide_react_1.Activity },
            { title: "Maintenance Mode", href: "/admin/maintenance", icon: lucide_react_1.ToggleRight },
            { title: "ICT Dashboard", href: "/crm/ict", icon: lucide_react_1.Monitor },
            { title: "Website Admin", href: "/admin/website", icon: lucide_react_1.Globe },
        ] },
    { title: "Enterprise", icon: lucide_react_1.Building2, children: [
            { title: "Organizations", href: "/enterprise/tenants", icon: lucide_react_1.Building2 },
            { title: "Tenant Management", href: "/enterprise/tenants-management", icon: lucide_react_1.Users },
            { title: "Tenant Communications", href: "/admin/tenant-communications", icon: lucide_react_1.Megaphone },
            { title: "Pricing Tiers", href: "/crm/pricing-tiers", icon: lucide_react_1.CreditCard },
        ] },
    { title: "Customers", icon: lucide_react_1.Users, children: [
            { title: "Clients", href: "/clients", icon: lucide_react_1.Users },
            { title: "Contacts", href: "/contacts", icon: lucide_react_1.BookOpen },
        ] },
    { title: "Projects", icon: lucide_react_1.FolderKanban, children: [
            { title: "Projects", href: "/projects", icon: lucide_react_1.FolderKanban },
            { title: "Milestones", href: "/project-milestones", icon: lucide_react_1.CheckSquare },
        ] },
    { title: "Tasks", href: "/tasks", icon: lucide_react_1.CheckSquare },
    { title: "Sales", icon: lucide_react_1.TrendingUp, children: [
            { title: "Invoices", href: "/invoices", icon: lucide_react_1.FileText },
            { title: "Recurring Invoices", href: "/recurring-invoices", icon: lucide_react_1.FileText },
            { title: "Estimates", href: "/estimates", icon: lucide_react_1.FileText },
            { title: "Receipts", href: "/receipts", icon: lucide_react_1.Receipt },
            { title: "Credit Notes", href: "/credit-notes", icon: lucide_react_1.FileText },
            { title: "Debit Notes", href: "/debit-notes", icon: lucide_react_1.FileText },
            { title: "Leads", href: "/leads", icon: lucide_react_1.Phone },
            { title: "Subscriptions", href: "/subscriptions", icon: lucide_react_1.Layers },
            { title: "Proposals", href: "/proposals", icon: lucide_react_1.Pencil },
            { title: "Contracts", href: "/contracts", icon: lucide_react_1.FileText },
            { title: "Quotations", href: "/quotations", icon: lucide_react_1.FileText },
        ] },
    { title: "Accounting", icon: lucide_react_1.CreditCard, children: [
            { title: "Payments", href: "/payments", icon: lucide_react_1.DollarSign },
            { title: "Expenses", href: "/expenses", icon: lucide_react_1.Receipt },
            { title: "Recurring Expenses", href: "/recurring-expenses", icon: lucide_react_1.Receipt },
            { title: "Chart of Accounts", href: "/chart-of-accounts", icon: lucide_react_1.BarChart3 },
            { title: "Bank Reconciliation", href: "/bank-reconciliation", icon: lucide_react_1.Wallet },
            { title: "Budgets", href: "/budgets", icon: lucide_react_1.PiggyBank },
            { title: "Financial Dashboard", href: "/financial-dashboard", icon: lucide_react_1.CreditCard },
            { title: "Forecasting", href: "/forecasting", icon: lucide_react_1.TrendingUp },
        ] },
    { title: "Purchasing", icon: lucide_react_1.ShoppingCart, children: [
            { title: "Suppliers", href: "/suppliers", icon: lucide_react_1.ShoppingCart },
            { title: "Purchase Orders", href: "/lpos", icon: lucide_react_1.ShoppingCart },
            { title: "Orders", href: "/orders", icon: lucide_react_1.Inbox },
            { title: "Imprests", href: "/imprests", icon: lucide_react_1.Wallet },
        ] },
    { title: "Inventory & Assets", icon: lucide_react_1.Package, children: [
            { title: "Services", href: "/services", icon: lucide_react_1.Briefcase },
            { title: "Service Invoices", href: "/service-invoices", icon: lucide_react_1.FileText },
            { title: "Products", href: "/products", icon: lucide_react_1.Package },
            { title: "Stock", href: "/inventory", icon: lucide_react_1.Package },
            { title: "Delivery Notes", href: "/delivery-notes", icon: lucide_react_1.FileText },
            { title: "GRNs", href: "/grn", icon: lucide_react_1.Package },
            { title: "Assets", href: "/assets", icon: lucide_react_1.Package },
            { title: "Warranty", href: "/warranty", icon: lucide_react_1.Briefcase },
            { title: "Work Orders", href: "/work-orders", icon: lucide_react_1.Clock },
        ] },
    { title: "HR", icon: lucide_react_1.UserCog, children: [
            { title: "Employees", href: "/employees", icon: lucide_react_1.Users },
            { title: "Departments", href: "/departments", icon: lucide_react_1.Building2 },
            { title: "Attendance", href: "/attendance", icon: lucide_react_1.Clock },
            { title: "Time Sheets", href: "/timesheets", icon: lucide_react_1.Clock },
            { title: "Payroll", href: "/payroll", icon: lucide_react_1.DollarSign },
            { title: "Payslips", href: "/payslips", icon: lucide_react_1.DollarSign },
            { title: "Tax Compliance", href: "/payroll/tax-compliance", icon: lucide_react_1.Shield },
            { title: "Leave Management", href: "/leave-management", icon: lucide_react_1.Users },
            { title: "Job Groups", href: "/job-groups", icon: lucide_react_1.Briefcase },
            { title: "Performance Reviews", href: "/performance-reviews", icon: lucide_react_1.BarChart3 },
            { title: "Onboarding", href: "/onboarding", icon: lucide_react_1.UserPlus },
            { title: "Holidays", href: "/holidays", icon: lucide_react_1.CalendarDays },
            { title: "Training", href: "/training", icon: lucide_react_1.GraduationCap },
        ] },
    { title: "Communications & Mailing", icon: lucide_react_1.Mail, children: [
            { title: "Staff Chat", href: "/staff-chat", icon: lucide_react_1.MessageSquare },
            { title: "Communications", href: "/communications", icon: lucide_react_1.Pencil },
            { title: "Email Queue", href: "/admin/email-queue", icon: lucide_react_1.MailOpen },
            { title: "SMS Queue", href: "/admin/sms-queue", icon: lucide_react_1.Phone },
        ] },
    { title: "AI Hub", href: "/ai-hub", icon: lucide_react_1.KeyRound },
    { title: "Support", icon: lucide_react_1.Ticket, children: [
            { title: "Tickets", href: "/tickets", icon: lucide_react_1.Ticket },
            { title: "Canned Responses", href: "/canned-responses", icon: lucide_react_1.MailOpen },
            { title: "Knowledgebase", href: "/knowledge-base", icon: lucide_react_1.BookOpen },
        ] },
    { title: "Documents & Email Templates", icon: lucide_react_1.FileText, children: [
            { title: "Document Management", href: "/documents", icon: lucide_react_1.FileText },
            { title: "Invoice Templates", href: "/invoices/templates", icon: lucide_react_1.StickyNote },
            { title: "Estimate Templates", href: "/estimates/templates", icon: lucide_react_1.StickyNote },
            { title: "Receipt Templates", href: "/receipts/templates", icon: lucide_react_1.StickyNote },
            { title: "Proposal Templates", href: "/proposals/templates", icon: lucide_react_1.FileText },
            { title: "Service Templates", href: "/service-templates", icon: lucide_react_1.Briefcase },
            { title: "LPO Templates", href: "/lpos/templates", icon: lucide_react_1.StickyNote },
            { title: "Contract Templates", href: "/contracts/templates", icon: lucide_react_1.FileText },
            { title: "Email Templates", href: "/admin/email-templates", icon: lucide_react_1.Mail },
        ] },
    { title: "Reports", icon: lucide_react_1.BarChart3, children: [
            { title: "Sales Reports", href: "/reports/sales", icon: lucide_react_1.TrendingUp },
            { title: "Project Reports", href: "/reports/projects", icon: lucide_react_1.BarChart3 },
            { title: "Financial Reports", href: "/reports/financial", icon: lucide_react_1.CreditCard },
            { title: "Customer Reports", href: "/reports/customers", icon: lucide_react_1.Users },
            { title: "Tax Compliance Reports", href: "/reports/tax-compliance", icon: lucide_react_1.Shield },
        ] },
    { title: "Settings", href: "/settings", icon: lucide_react_1.Settings },
];
var NAV_ADMIN = [
    { title: "Home", href: "/crm-home", icon: lucide_react_1.Home },
    { title: "Administration", icon: lucide_react_1.Shield, children: [
            { title: "User Management", href: "/admin/management", icon: lucide_react_1.UserCog },
            { title: "Backups", href: "/admin/backups", icon: lucide_react_1.Settings },
            { title: "Cron Jobs", href: "/admin/cron-jobs", icon: lucide_react_1.Timer },
            { title: "Email Templates", href: "/admin/email-templates", icon: lucide_react_1.Mail },
            { title: "Email Queue", href: "/admin/email-queue", icon: lucide_react_1.Mail },
            { title: "SMS Queue", href: "/admin/sms-queue", icon: lucide_react_1.MessageSquare },
            { title: "Audit Logs", href: "/audit-logs", icon: lucide_react_1.BookOpen },
            { title: "System Health", href: "/system-health", icon: lucide_react_1.Activity },
            { title: "Maintenance Mode", href: "/admin/maintenance", icon: lucide_react_1.ToggleRight },
            { title: "Website Admin", href: "/admin/website", icon: lucide_react_1.Globe },
        ] },
    { title: "Customers", icon: lucide_react_1.Users, children: [
            { title: "Clients", href: "/clients", icon: lucide_react_1.Users },
            { title: "Contacts", href: "/contacts", icon: lucide_react_1.BookOpen },
        ] },
    { title: "Projects", icon: lucide_react_1.FolderKanban, children: [
            { title: "Projects", href: "/projects", icon: lucide_react_1.FolderKanban },
            { title: "Milestones", href: "/project-milestones", icon: lucide_react_1.CheckSquare },
        ] },
    { title: "Tasks", href: "/tasks", icon: lucide_react_1.CheckSquare },
    { title: "Leads", href: "/leads", icon: lucide_react_1.Phone },
    { title: "Sales", icon: lucide_react_1.TrendingUp, children: [
            { title: "Invoices", href: "/invoices", icon: lucide_react_1.FileText },
            { title: "Payments", href: "/payments", icon: lucide_react_1.DollarSign },
            { title: "Estimates", href: "/estimates", icon: lucide_react_1.FileText },
            { title: "Receipts", href: "/receipts", icon: lucide_react_1.Receipt },
            { title: "Subscriptions", href: "/subscriptions", icon: lucide_react_1.Layers },
            { title: "Credit Notes", href: "/credit-notes", icon: lucide_react_1.FileText },
            { title: "Debit Notes", href: "/debit-notes", icon: lucide_react_1.FileText },
        ] },
    { title: "Purchasing", icon: lucide_react_1.ShoppingCart, children: [
            { title: "Suppliers", href: "/suppliers", icon: lucide_react_1.ShoppingCart },
            { title: "Purchase Orders", href: "/lpos", icon: lucide_react_1.ShoppingCart },
            { title: "Orders", href: "/orders", icon: lucide_react_1.Inbox },
            { title: "Imprests", href: "/imprests", icon: lucide_react_1.Wallet },
        ] },
    { title: "Inventory", icon: lucide_react_1.Package, children: [
            { title: "Products", href: "/products", icon: lucide_react_1.Package },
            { title: "Stock", href: "/inventory", icon: lucide_react_1.Package },
            { title: "Delivery Notes", href: "/delivery-notes", icon: lucide_react_1.FileText },
            { title: "GRNs", href: "/grn", icon: lucide_react_1.Package },
        ] },
    { title: "Services", icon: lucide_react_1.Briefcase, children: [
            { title: "Services", href: "/services", icon: lucide_react_1.Briefcase },
            { title: "Service Templates", href: "/service-templates", icon: lucide_react_1.Briefcase },
            { title: "Service Invoices", href: "/service-invoices", icon: lucide_react_1.FileText },
        ] },
    { title: "Proposals", icon: lucide_react_1.Pencil, children: [
            { title: "Proposals", href: "/proposals", icon: lucide_react_1.Pencil },
            { title: "Templates", href: "/proposals/templates", icon: lucide_react_1.FileText },
            { title: "Quotations", href: "/quotations", icon: lucide_react_1.FileText },
        ] },
    { title: "Contracts", icon: lucide_react_1.FileText, children: [
            { title: "Contracts", href: "/contracts", icon: lucide_react_1.FileText },
            { title: "Templates", href: "/contracts/templates", icon: lucide_react_1.FileText },
            { title: "Assets", href: "/assets", icon: lucide_react_1.Package },
            { title: "Warranty", href: "/warranty", icon: lucide_react_1.Briefcase },
            { title: "Work Orders", href: "/work-orders", icon: lucide_react_1.Clock },
        ] },
    { title: "Accounting", icon: lucide_react_1.CreditCard, children: [
            { title: "Chart of Accounts", href: "/chart-of-accounts", icon: lucide_react_1.BarChart3 },
            { title: "Bank Reconciliation", href: "/bank-reconciliation", icon: lucide_react_1.Wallet },
            { title: "Budgets", href: "/budgets", icon: lucide_react_1.PiggyBank },
            { title: "Expenses", href: "/expenses", icon: lucide_react_1.Receipt },
            { title: "Financial Dashboard", href: "/financial-dashboard", icon: lucide_react_1.CreditCard },
        ] },
    { title: "HR", icon: lucide_react_1.UserCog, children: [
            { title: "Employees", href: "/employees", icon: lucide_react_1.Users },
            { title: "Departments", href: "/departments", icon: lucide_react_1.Building2 },
            { title: "Attendance", href: "/attendance", icon: lucide_react_1.Clock },
            { title: "Payroll", href: "/payroll", icon: lucide_react_1.DollarSign },
            { title: "Payslips", href: "/payslips", icon: lucide_react_1.FileText },
            { title: "Leave Management", href: "/leave-management", icon: lucide_react_1.Users },
            { title: "Job Groups", href: "/job-groups", icon: lucide_react_1.Briefcase },
            { title: "Time sheets", href: "/timesheets", icon: lucide_react_1.Clock },
            { title: "Onboarding", href: "/onboarding", icon: lucide_react_1.UserPlus },
            { title: "Holidays", href: "/holidays", icon: lucide_react_1.CalendarDays },
            { title: "Training", href: "/training", icon: lucide_react_1.GraduationCap },
            { title: "Performance Reviews", href: "/performance-reviews", icon: lucide_react_1.BarChart3 },
        ] },
    { title: "Support", icon: lucide_react_1.Ticket, children: [
            { title: "Tickets", href: "/tickets", icon: lucide_react_1.Ticket },
            { title: "Canned Responses", href: "/canned-responses", icon: lucide_react_1.MailOpen },
            { title: "Knowledgebase", href: "/knowledge-base", icon: lucide_react_1.BookOpen },
        ] },
    { title: "Communications & Mailing", icon: lucide_react_1.Mail, children: [
            { title: "Staff Chat", href: "/staff-chat", icon: lucide_react_1.MessageSquare },
            { title: "Communications", href: "/communications", icon: lucide_react_1.Pencil },
        ] },
    { title: "AI Hub", href: "/ai-hub", icon: lucide_react_1.KeyRound },
    { title: "Reports", href: "/reports", icon: lucide_react_1.BarChart3 },
    { title: "Settings", href: "/settings", icon: lucide_react_1.Settings },
];
var NAV_ACCOUNTANT = [
    { title: "Home", href: "/crm-home", icon: lucide_react_1.Home },
    { title: "Customers", icon: lucide_react_1.Users, children: [
            { title: "Clients", href: "/clients", icon: lucide_react_1.Users },
            { title: "Contacts", href: "/contacts", icon: lucide_react_1.BookOpen },
        ] },
    { title: "Sales", icon: lucide_react_1.TrendingUp, children: [
            { title: "Invoices", href: "/invoices", icon: lucide_react_1.FileText },
            { title: "Payments", href: "/payments", icon: lucide_react_1.DollarSign },
            { title: "Estimates", href: "/estimates", icon: lucide_react_1.FileText },
            { title: "Receipts", href: "/receipts", icon: lucide_react_1.Receipt },
            { title: "Subscriptions", href: "/subscriptions", icon: lucide_react_1.Layers },
            { title: "Credit Notes", href: "/credit-notes", icon: lucide_react_1.FileText },
            { title: "Debit Notes", href: "/debit-notes", icon: lucide_react_1.FileText },
        ] },
    { title: "Purchasing", icon: lucide_react_1.ShoppingCart, children: [
            { title: "LPOs", href: "/lpos", icon: lucide_react_1.ShoppingCart },
            { title: "Imprests", href: "/imprests", icon: lucide_react_1.Wallet },
            { title: "GRNs", href: "/grn", icon: lucide_react_1.Package },
        ] },
    { title: "Accounting", icon: lucide_react_1.CreditCard, children: [
            { title: "Chart of Accounts", href: "/chart-of-accounts", icon: lucide_react_1.BarChart3 },
            { title: "Bank Reconciliation", href: "/bank-reconciliation", icon: lucide_react_1.Wallet },
            { title: "Budgets", href: "/budgets", icon: lucide_react_1.PiggyBank },
            { title: "Expenses", href: "/expenses", icon: lucide_react_1.Receipt },
            { title: "Financial Dashboard", href: "/financial-dashboard", icon: lucide_react_1.CreditCard },
            { title: "Tax Compliance", href: "/payroll/tax-compliance", icon: lucide_react_1.Shield },
            { title: "Forecasting", href: "/forecasting", icon: lucide_react_1.TrendingUp },
        ] },
    { title: "Communications & Mailing", icon: lucide_react_1.Mail, children: [
            { title: "Staff Chat", href: "/staff-chat", icon: lucide_react_1.MessageSquare },
            { title: "Communications", href: "/communications", icon: lucide_react_1.Pencil },
        ] },
    { title: "Reports", href: "/reports", icon: lucide_react_1.BarChart3 },
    { title: "Support", icon: lucide_react_1.Ticket, children: [
            { title: "Tickets", href: "/tickets", icon: lucide_react_1.Ticket },
        ] },
    { title: "Settings", href: "/settings", icon: lucide_react_1.Settings },
];
var NAV_HR = [
    { title: "Home", href: "/crm-home", icon: lucide_react_1.Home },
    { title: "HR", icon: lucide_react_1.UserCog, children: [
            { title: "Employees", href: "/employees", icon: lucide_react_1.Users },
            { title: "Departments", href: "/departments", icon: lucide_react_1.Building2 },
            { title: "Attendance", href: "/attendance", icon: lucide_react_1.Clock },
            { title: "Payroll", href: "/payroll", icon: lucide_react_1.DollarSign },
            { title: "Payslips", href: "/payslips", icon: lucide_react_1.FileText },
            { title: "Leave Management", href: "/leave-management", icon: lucide_react_1.Users },
            { title: "Job Groups", href: "/job-groups", icon: lucide_react_1.Briefcase },
            { title: "Onboarding", href: "/onboarding", icon: lucide_react_1.UserPlus },
            { title: "Holidays", href: "/holidays", icon: lucide_react_1.CalendarDays },
            { title: "Training", href: "/training", icon: lucide_react_1.GraduationCap },
            { title: "Performance Reviews", href: "/performance-reviews", icon: lucide_react_1.BarChart3 },
        ] },
    { title: "Projects", href: "/projects", icon: lucide_react_1.FolderKanban },
    { title: "Tasks", href: "/tasks", icon: lucide_react_1.CheckSquare },
    { title: "Reports", href: "/reports", icon: lucide_react_1.BarChart3 },
    { title: "Support", icon: lucide_react_1.Ticket, children: [
            { title: "Tickets", href: "/tickets", icon: lucide_react_1.Ticket },
        ] },
    { title: "Communications & Mailing", icon: lucide_react_1.Mail, children: [
            { title: "Staff Chat", href: "/staff-chat", icon: lucide_react_1.MessageSquare },
            { title: "Communications", href: "/communications", icon: lucide_react_1.Pencil },
        ] },
    { title: "Team", icon: lucide_react_1.Users, children: [
            { title: "Team Members", href: "/employees", icon: lucide_react_1.Users },
            { title: "Time Sheets", href: "/timesheets", icon: lucide_react_1.Clock },
        ] },
    { title: "Settings", href: "/settings", icon: lucide_react_1.Settings },
];
var NAV_PROJECT_MANAGER = [
    { title: "Home", href: "/crm-home", icon: lucide_react_1.Home },
    { title: "Projects", icon: lucide_react_1.FolderKanban, children: [
            { title: "All Projects", href: "/projects", icon: lucide_react_1.FolderKanban },
            { title: "Milestones", href: "/project-milestones", icon: lucide_react_1.CheckSquare },
        ] },
    { title: "Customers", icon: lucide_react_1.Users, children: [
            { title: "Clients", href: "/clients", icon: lucide_react_1.Users },
            { title: "Contacts", href: "/contacts", icon: lucide_react_1.BookOpen },
        ] },
    { title: "Tasks", href: "/tasks", icon: lucide_react_1.CheckSquare },
    { title: "Leads", href: "/leads", icon: lucide_react_1.Phone },
    { title: "Sales", icon: lucide_react_1.TrendingUp, children: [
            { title: "Invoices", href: "/invoices", icon: lucide_react_1.FileText },
            { title: "Estimates", href: "/estimates", icon: lucide_react_1.FileText },
        ] },
    { title: "Communications & Mailing", icon: lucide_react_1.Mail, children: [
            { title: "Staff Chat", href: "/staff-chat", icon: lucide_react_1.MessageSquare },
            { title: "Communications", href: "/communications", icon: lucide_react_1.Pencil },
        ] },
    { title: "Time Sheets", href: "/timesheets", icon: lucide_react_1.Clock },
    { title: "Reports", href: "/reports", icon: lucide_react_1.BarChart3 },
    { title: "Support", icon: lucide_react_1.Ticket, children: [
            { title: "Tickets", href: "/tickets", icon: lucide_react_1.Ticket },
        ] },
    { title: "Settings", href: "/settings", icon: lucide_react_1.Settings },
];
var NAV_SALES_MANAGER = [
    { title: "Home", href: "/crm-home", icon: lucide_react_1.Home },
    { title: "Customers", icon: lucide_react_1.Users, children: [
            { title: "Clients", href: "/clients", icon: lucide_react_1.Users },
            { title: "Contacts", href: "/contacts", icon: lucide_react_1.BookOpen },
        ] },
    { title: "Leads", href: "/leads", icon: lucide_react_1.Phone },
    { title: "Sales", icon: lucide_react_1.TrendingUp, children: [
            { title: "Invoices", href: "/invoices", icon: lucide_react_1.FileText },
            { title: "Payments", href: "/payments", icon: lucide_react_1.DollarSign },
            { title: "Estimates", href: "/estimates", icon: lucide_react_1.FileText },
            { title: "Receipts", href: "/receipts", icon: lucide_react_1.Receipt },
            { title: "Subscriptions", href: "/subscriptions", icon: lucide_react_1.Layers },
            { title: "Opportunities", href: "/opportunities", icon: lucide_react_1.Briefcase },
            { title: "Sales Pipeline", href: "/sales-pipeline", icon: lucide_react_1.TrendingUp },
        ] },
    { title: "Proposals", icon: lucide_react_1.Pencil, children: [
            { title: "Proposals", href: "/proposals", icon: lucide_react_1.Pencil },
            { title: "Templates", href: "/proposals/templates", icon: lucide_react_1.FileText },
            { title: "Quotations", href: "/quotations", icon: lucide_react_1.FileText },
        ] },
    { title: "Inventory", icon: lucide_react_1.Package, children: [
            { title: "Products", href: "/products", icon: lucide_react_1.Package },
            { title: "Services", href: "/services", icon: lucide_react_1.Briefcase },
        ] },
    { title: "Communications & Mailing", icon: lucide_react_1.Mail, children: [
            { title: "Staff Chat", href: "/staff-chat", icon: lucide_react_1.MessageSquare },
            { title: "Communications", href: "/communications", icon: lucide_react_1.Pencil },
        ] },
    { title: "Reports", href: "/reports", icon: lucide_react_1.BarChart3 },
    { title: "Support", icon: lucide_react_1.Ticket, children: [
            { title: "Tickets", href: "/tickets", icon: lucide_react_1.Ticket },
        ] },
    { title: "Settings", href: "/settings", icon: lucide_react_1.Settings },
];
var NAV_PROCUREMENT_MANAGER = [
    { title: "Home", href: "/crm-home", icon: lucide_react_1.Home },
    { title: "Purchasing", icon: lucide_react_1.ShoppingCart, children: [
            { title: "Suppliers", href: "/suppliers", icon: lucide_react_1.ShoppingCart },
            { title: "Purchase Orders", href: "/lpos", icon: lucide_react_1.ShoppingCart },
            { title: "Orders", href: "/orders", icon: lucide_react_1.Inbox },
            { title: "Imprests", href: "/imprests", icon: lucide_react_1.Wallet },
            { title: "Delivery Notes", href: "/delivery-notes", icon: lucide_react_1.FileText },
            { title: "GRNs", href: "/grn", icon: lucide_react_1.Package },
        ] },
    { title: "Inventory", icon: lucide_react_1.Package, children: [
            { title: "Products", href: "/products", icon: lucide_react_1.Package },
            { title: "Stock", href: "/inventory", icon: lucide_react_1.Package },
        ] },
    { title: "Contracts", icon: lucide_react_1.FileText, children: [
            { title: "Contracts", href: "/contracts", icon: lucide_react_1.FileText },
            { title: "Templates", href: "/contracts/templates", icon: lucide_react_1.FileText },
            { title: "Assets", href: "/assets", icon: lucide_react_1.Package },
            { title: "Warranty", href: "/warranty", icon: lucide_react_1.Briefcase },
        ] },
    { title: "Accounting", icon: lucide_react_1.CreditCard, children: [
            { title: "Expenses", href: "/expenses", icon: lucide_react_1.Receipt },
            { title: "Budgets", href: "/budgets", icon: lucide_react_1.PiggyBank },
        ] },
    { title: "Communications & Mailing", icon: lucide_react_1.Mail, children: [
            { title: "Staff Chat", href: "/staff-chat", icon: lucide_react_1.MessageSquare },
            { title: "Communications", href: "/communications", icon: lucide_react_1.Pencil },
        ] },
    { title: "Reports", href: "/reports", icon: lucide_react_1.BarChart3 },
    { title: "Settings", href: "/settings", icon: lucide_react_1.Settings },
];
var NAV_ICT_MANAGER = [
    { title: "Home", href: "/crm-home", icon: lucide_react_1.Home },
    { title: "Administration", icon: lucide_react_1.Shield, children: [
            { title: "Cron Jobs", href: "/admin/cron-jobs", icon: lucide_react_1.Timer },
            { title: "Email Templates", href: "/admin/email-templates", icon: lucide_react_1.Mail },
            { title: "System Health", href: "/system-health", icon: lucide_react_1.Activity },
            { title: "Backups", href: "/admin/backups", icon: lucide_react_1.Settings },
            { title: "Maintenance Mode", href: "/admin/maintenance", icon: lucide_react_1.ToggleRight },
        ] },
    { title: "ICT Dashboard", href: "/crm/ict", icon: lucide_react_1.Monitor },
    { title: "Customers", icon: lucide_react_1.Users, children: [
            { title: "Clients", href: "/clients", icon: lucide_react_1.Users },
            { title: "Contacts", href: "/contacts", icon: lucide_react_1.BookOpen },
        ] },
    { title: "Support", icon: lucide_react_1.Ticket, children: [
            { title: "Tickets", href: "/tickets", icon: lucide_react_1.Ticket },
            { title: "Canned Responses", href: "/canned-responses", icon: lucide_react_1.MailOpen },
            { title: "Knowledgebase", href: "/knowledge-base", icon: lucide_react_1.BookOpen },
        ] },
    { title: "Communications & Mailing", icon: lucide_react_1.Mail, children: [
            { title: "Staff Chat", href: "/staff-chat", icon: lucide_react_1.MessageSquare },
            { title: "Communications", href: "/communications", icon: lucide_react_1.Pencil },
            { title: "Email Queue", href: "/admin/email-queue", icon: lucide_react_1.MailOpen },
            { title: "SMS Queue", href: "/admin/sms-queue", icon: lucide_react_1.Phone },
        ] },
    { title: "Contracts", icon: lucide_react_1.FileText, children: [
            { title: "Assets", href: "/assets", icon: lucide_react_1.Package },
            { title: "Warranty", href: "/warranty", icon: lucide_react_1.Briefcase },
        ] },
    { title: "Reports", href: "/reports", icon: lucide_react_1.BarChart3 },
    { title: "Settings", href: "/settings", icon: lucide_react_1.Settings },
];
var NAV_STAFF = [
    { title: "Home", href: "/crm-home", icon: lucide_react_1.Home },
    { title: "Projects", href: "/projects", icon: lucide_react_1.FolderKanban },
    { title: "Tasks", href: "/tasks", icon: lucide_react_1.CheckSquare },
    { title: "Sales", icon: lucide_react_1.TrendingUp, children: [
            { title: "Invoices", href: "/invoices", icon: lucide_react_1.FileText },
            { title: "Estimates", href: "/estimates", icon: lucide_react_1.FileText },
        ] },
    { title: "HR", icon: lucide_react_1.UserCog, children: [
            { title: "Attendance", href: "/attendance", icon: lucide_react_1.Clock },
            { title: "Leave", href: "/leave-management", icon: lucide_react_1.Users },
            { title: "Payslips", href: "/payroll", icon: lucide_react_1.DollarSign },
        ] },
    { title: "Team", icon: lucide_react_1.Users, children: [
            { title: "Team Members", href: "/employees", icon: lucide_react_1.Users },
            { title: "Time Sheets", href: "/timesheets", icon: lucide_react_1.Clock },
        ] },
    { title: "Staff Chat", href: "/staff-chat", icon: lucide_react_1.MessageSquare },
    { title: "Support", icon: lucide_react_1.Ticket, children: [
            { title: "Tickets", href: "/tickets", icon: lucide_react_1.Ticket },
        ] },
    { title: "Reports", href: "/reports", icon: lucide_react_1.BarChart3 },
    { title: "Settings", href: "/settings", icon: lucide_react_1.Settings },
];
var NAV_CLIENT = [
    { title: "Home", href: "/crm-home", icon: lucide_react_1.Home },
    { title: "Invoices", href: "/invoices", icon: lucide_react_1.FileText },
    { title: "Payments", href: "/payments", icon: lucide_react_1.DollarSign },
    { title: "Projects", href: "/projects", icon: lucide_react_1.FolderKanban },
    { title: "Support", icon: lucide_react_1.Ticket, children: [
            { title: "Tickets", href: "/tickets", icon: lucide_react_1.Ticket },
        ] },
    { title: "Settings", href: "/settings", icon: lucide_react_1.Settings },
];
var ROLE_NAV_MAP = {
    super_admin: NAV_SUPER_ADMIN,
    admin: NAV_ADMIN,
    accountant: NAV_ACCOUNTANT,
    hr: NAV_HR,
    project_manager: NAV_PROJECT_MANAGER,
    sales_manager: NAV_SALES_MANAGER,
    procurement_manager: NAV_PROCUREMENT_MANAGER,
    ict_manager: NAV_ICT_MANAGER,
    staff: NAV_STAFF,
    client: NAV_CLIENT
};
var getNavigation = function (userRole) {
    return ROLE_NAV_MAP[userRole || ""] || NAV_STAFF;
};
function DashboardLayout(_a) {
    var _b, _c, _d, _e, _f;
    var children = _a.children;
    var _g = wouter_1.useLocation(), location = _g[0], navigate = _g[1];
    var _h = useAuthWithPersistence_1.useAuthWithPersistence(), user = _h.user, logout = _h.logout, loading = _h.loading, isAuthenticated = _h.isAuthenticated;
    var _j = ThemeContext_1.useTheme(), theme = _j.theme, toggleTheme = _j.toggleTheme;
    // ── Maintenance Mode Gate (wired to backend) ──────────────────────────
    // Enforces maintenance mode: only super_admin & ict_manager can bypass
    var _k = useMaintenanceModeEnforcement_1.useMaintenanceModeEnforcement(), maintenanceMode = _k.maintenanceMode, canBypass = _k.canBypass, isRestrictedByMaintenance = _k.isRestrictedByMaintenance;
    // ── Permission-Based Navigation ──────────────────────────────────────
    // Filters naav items based on user's custom permissions
    var _l = usePermissionBasedNavigation_1.usePermissionBasedNavigation(), getFilteredNav = _l.getFilteredNav, hasPermission = _l.hasPermission;
    // ── Settings Sync (DB → frontend contexts) ──────────────────────────
    useSettingsSync_1.useSettingsSync();
    // ── Brand & Settings from contexts (populated by useSettingsSync) ────
    var brandConfig = BrandContext_1.useBrand().brandConfig;
    var ctxSettings = SystemSettingsContext_1.useSystemSettings().settings;
    // Dynamic logo and title from brand context, falling back to build-time constants
    var appLogo = brandConfig.brandLogoUrl || const_1.APP_LOGO;
    var appTitle = brandConfig.companyName || brandConfig.brandName || const_1.APP_TITLE;
    var _m = react_1.useState([]), expandedItems = _m[0], setExpandedItems = _m[1];
    var _o = react_1.useState(""), headerSearchQuery = _o[0], setHeaderSearchQuery = _o[1];
    var _p = react_1.useState(false), headerSearchOpen = _p[0], setHeaderSearchOpen = _p[1];
    // Mini-sidebar states
    var _q = react_1.useState(false), mobileSidebarOpen = _q[0], setMobileSidebarOpen = _q[1];
    var _r = react_1.useState(function () {
        var saved = localStorage.getItem('sidebarPinned');
        if (saved !== null)
            return JSON.parse(saved);
        // Fall back to DB setting if no local preference
        return ctxSettings.leftMenuPosition === 'Expanded';
    }), sidebarPinned = _r[0], setSidebarPinned = _r[1];
    var _s = react_1.useState(false), sidebarHovered = _s[0], setSidebarHovered = _s[1];
    var _t = react_1.useState(false), ictMenuOpen = _t[0], setIctMenuOpen = _t[1];
    // Apply leftMenuPosition from DB settings once they load (only if no local override)
    react_1.useEffect(function () {
        if (ctxSettings.leftMenuPosition && localStorage.getItem('sidebarPinned') === null) {
            setSidebarPinned(ctxSettings.leftMenuPosition === 'Expanded');
        }
    }, [ctxSettings.leftMenuPosition]);
    var sidebarRef = react_1.useRef(null);
    var popoutTimeout = react_1.useRef(null);
    var _u = react_1.useState(null), popoutItem = _u[0], setPopoutItem = _u[1];
    var _v = react_1.useState(0), popoutY = _v[0], setPopoutY = _v[1];
    var openPopout = react_1.useCallback(function (title, y) {
        if (popoutTimeout.current) {
            clearTimeout(popoutTimeout.current);
            popoutTimeout.current = null;
        }
        setPopoutY(y);
        setPopoutItem(title);
    }, []);
    var scheduleClosePopout = react_1.useCallback(function () {
        if (popoutTimeout.current)
            clearTimeout(popoutTimeout.current);
        popoutTimeout.current = setTimeout(function () { return setPopoutItem(null); }, 200);
    }, []);
    var cancelClosePopout = react_1.useCallback(function () {
        if (popoutTimeout.current) {
            clearTimeout(popoutTimeout.current);
            popoutTimeout.current = null;
        }
    }, []);
    // Derived: sidebar is expanded when pinned OR hovered (desktop only)
    var sidebarExpanded = sidebarPinned || sidebarHovered;
    // ── Timer / Stopwatch State ──────────────────────────────────────────
    var TIMER_STORAGE_KEY = "crm_timer_state";
    var _w = react_1.useState(false), timerRunning = _w[0], setTimerRunning = _w[1];
    var _x = react_1.useState(0), timerSeconds = _x[0], setTimerSeconds = _x[1];
    var _y = react_1.useState(""), timerProject = _y[0], setTimerProject = _y[1];
    var _z = react_1.useState(null), timerStartedAt = _z[0], setTimerStartedAt = _z[1];
    // ── Backend Queries for Header Icons ────────────────────────────────
    var _0 = trpc_1.trpc.favorites.list.useQuery(undefined, { staleTime: 30000 }).data, favoritesData = _0 === void 0 ? [] : _0;
    var toggleFavMutation = trpc_1.trpc.favorites.toggle.useMutation({
        onSuccess: function () { return favUtils.invalidate(); }
    });
    var removeFavMutation = trpc_1.trpc.favorites.remove.useMutation({
        onSuccess: function () { return favUtils.invalidate(); }
    });
    var favUtils = trpc_1.trpc.useUtils().favorites;
    var _1 = react_1.useState(null), favFilter = _1[0], setFavFilter = _1[1];
    var filteredFavorites = favFilter
        ? favoritesData.filter(function (f) { return f.entityType === favFilter; })
        : favoritesData;
    // ── Reminders ────────────────────────────────────────────────────────
    var _2 = react_1.useState("due"), reminderTab = _2[0], setReminderTab = _2[1];
    var _3 = trpc_1.trpc.reminders.list.useQuery({ includeDueOnly: true, limit: 20 }, { staleTime: 60000 }).data, dueReminders = _3 === void 0 ? [] : _3;
    var _4 = trpc_1.trpc.reminders.list.useQuery({ status: "pending", limit: 20 }, { staleTime: 60000 }).data, pendingReminders = _4 === void 0 ? [] : _4;
    var activeReminders = reminderTab === "due" ? dueReminders : pendingReminders;
    // ── Language Preference ──────────────────────────────────────────────
    var _5 = react_1.useState(function () {
        return localStorage.getItem("crm_language") || "English";
    }), selectedLanguage = _5[0], setSelectedLanguage = _5[1];
    var handleLanguageChange = function (lang) {
        setSelectedLanguage(lang);
        localStorage.setItem("crm_language", lang);
    };
    // Timer localStorage persistence: load on mount
    react_1.useEffect(function () {
        try {
            var saved = localStorage.getItem(TIMER_STORAGE_KEY);
            if (saved) {
                var state = JSON.parse(saved);
                if (state.running && state.startedAt) {
                    var elapsed = Math.floor((Date.now() - state.startedAt) / 1000);
                    setTimerSeconds(elapsed);
                    setTimerStartedAt(state.startedAt);
                    setTimerRunning(true);
                    if (state.project)
                        setTimerProject(state.project);
                }
                else if (state.seconds) {
                    setTimerSeconds(state.seconds);
                    if (state.project)
                        setTimerProject(state.project);
                }
            }
        }
        catch (_a) { }
    }, []);
    // Timer localStorage persistence: save on state change
    react_1.useEffect(function () {
        var state = {
            running: timerRunning,
            startedAt: timerStartedAt,
            seconds: timerSeconds,
            project: timerProject
        };
        localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(state));
    }, [timerRunning, timerStartedAt, timerSeconds, timerProject]);
    // Timer tick (derives from startedAt for accuracy across reloads)
    react_1.useEffect(function () {
        if (!timerRunning || !timerStartedAt)
            return;
        var interval = setInterval(function () {
            setTimerSeconds(Math.floor((Date.now() - timerStartedAt) / 1000));
        }, 1000);
        return function () { return clearInterval(interval); };
    }, [timerRunning, timerStartedAt]);
    var formatTimer = function (secs) {
        var h = Math.floor(secs / 3600);
        var m = Math.floor((secs % 3600) / 60);
        var s = secs % 60;
        return h.toString().padStart(2, "0") + ":" + m.toString().padStart(2, "0") + ":" + s.toString().padStart(2, "0");
    };
    var toggleExpanded = function (title) {
        setExpandedItems(function (prev) {
            return prev.includes(title) ? prev.filter(function (item) { return item !== title; }) : __spreadArrays(prev, [title]);
        });
    };
    var isActive = function (href) {
        if (!href)
            return false;
        return location === href || location.startsWith(href + "/");
    };
    var hasActiveChild = function (item) {
        var _a;
        return (_a = item.children) === null || _a === void 0 ? void 0 : _a.some(function (child) { return isActive(child.href); });
    };
    var getInitials = function (name) {
        if (!name)
            return "U";
        return name
            .split(" ")
            .map(function (n) { return n[0]; })
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };
    // Keyboard shortcut for sidebar toggle (Cmd+K or Ctrl+K)
    react_1.useEffect(function () {
        var handleKeyDown = function (e) {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setSidebarPinned(function (prev) { return !prev; });
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return function () { return window.removeEventListener("keydown", handleKeyDown); };
    }, []);
    // Persist sidebar pinned state to localStorage
    react_1.useEffect(function () {
        localStorage.setItem('sidebarPinned', JSON.stringify(sidebarPinned));
    }, [sidebarPinned]);
    // Close popout when clicking outside sidebar
    react_1.useEffect(function () {
        if (!popoutItem)
            return;
        var handler = function (e) {
            var target = e.target;
            var popoutEl = document.getElementById('sidebar-popout');
            if (sidebarRef.current && !sidebarRef.current.contains(target) && (!popoutEl || !popoutEl.contains(target))) {
                setPopoutItem(null);
            }
        };
        document.addEventListener('mousedown', handler);
        return function () { return document.removeEventListener('mousedown', handler); };
    }, [popoutItem]);
    // Close popout when sidebar expands
    react_1.useEffect(function () {
        if (sidebarExpanded)
            setPopoutItem(null);
    }, [sidebarExpanded]);
    // TEMPORARY: Disabled loading gate for debugging
    // if (loading) {
    // ── Auth Loading Gate: wait for auth to complete before showing sign-in screen ──
    if (loading) {
        return (React.createElement("div", { className: "flex items-center justify-center min-h-screen" },
            React.createElement("div", { className: "flex flex-col items-center gap-4" },
                React.createElement(lucide_react_1.Loader2, { className: "w-8 h-8 animate-spin text-blue-500" }),
                React.createElement("p", { className: "text-muted-foreground" }, "Authenticating..."))));
    }
    if (!user) {
        return (React.createElement("div", { className: "flex items-center justify-center min-h-screen" },
            React.createElement("div", { className: "flex flex-col items-center gap-8 p-8 max-w-md w-full" },
                React.createElement("div", { className: "flex flex-col items-center gap-6" },
                    React.createElement("div", { className: "relative group" },
                        React.createElement("div", { className: "relative" },
                            React.createElement("img", { src: appLogo, alt: appTitle, className: "h-20 w-20 rounded-xl object-cover shadow-lg" }))),
                    React.createElement("div", { className: "text-center space-y-2" },
                        React.createElement("h1", { className: "text-3xl font-bold tracking-tight" }, appTitle),
                        React.createElement("p", { className: "text-sm text-muted-foreground" }, "Please sign in to continue"))),
                React.createElement(button_1.Button, { onClick: function () {
                        window.location.href = const_1.getLoginUrl();
                    }, size: "lg", className: "w-full shadow-lg hover:shadow-xl transition-all" }, "Sign in to Continue"))));
    }
    // ── Maintenance Mode: block non-super_admin/ict_manager users ────────
    if (maintenanceMode && (user === null || user === void 0 ? void 0 : user.role) !== "super_admin" && (user === null || user === void 0 ? void 0 : user.role) !== "ict_manager" && user) {
        return React.createElement(MaintenancePage_1["default"], null);
    }
    var renderNavItem = function (item, level) {
        if (level === void 0) { level = 0; }
        var Icon = item.icon;
        var isExpanded = expandedItems.includes(item.title);
        var visibleChildren = item.children || [];
        var hasChildren = visibleChildren.length > 0;
        var isItemActive = isActive(item.href) || visibleChildren.some(function (child) { return isActive(child.href); });
        var isCollapsed = !sidebarExpanded && !mobileSidebarOpen;
        // Collapsed mode: show only icon with tooltip (popout for parents)
        if (isCollapsed && level === 0) {
            var isPopoutOpen = popoutItem === item.title;
            var iconButton = (React.createElement("button", { onMouseEnter: function (e) {
                    if (hasChildren) {
                        var rect = e.currentTarget.getBoundingClientRect();
                        openPopout(item.title, rect.top);
                    }
                    else {
                        // Close any open popout when hovering a leaf item
                        setPopoutItem(null);
                        cancelClosePopout();
                    }
                }, onMouseLeave: function () {
                    if (hasChildren)
                        scheduleClosePopout();
                }, onClick: function () {
                    if (!hasChildren && item.href) {
                        navigate(item.href);
                        setPopoutItem(null);
                    }
                }, className: utils_1.cn("w-full flex items-center justify-center p-2.5 rounded-lg transition-colors", "hover:bg-accent hover:text-accent-foreground", (isItemActive || isPopoutOpen) && "bg-primary text-primary-foreground", "text-slate-600 dark:text-slate-300") }, Icon && React.createElement(Icon, { className: "h-5 w-5" })));
            // Skip tooltips entirely when any popout is open (avoids controlled/uncontrolled warnings)
            if (popoutItem) {
                return React.createElement("div", { key: item.title }, iconButton);
            }
            return (React.createElement(tooltip_1.TooltipProvider, { key: item.title, delayDuration: 0 },
                React.createElement(tooltip_1.Tooltip, null,
                    React.createElement(tooltip_1.TooltipTrigger, { asChild: true }, iconButton),
                    React.createElement(tooltip_1.TooltipContent, { side: "right", sideOffset: 10 },
                        React.createElement("p", null, item.title)))));
        }
        // Expanded mode with children
        if (hasChildren) {
            return (React.createElement("div", { key: item.title },
                React.createElement("button", { onClick: function () { return toggleExpanded(item.title); }, className: utils_1.cn("w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors", "hover:bg-accent hover:text-accent-foreground", isItemActive && "bg-accent text-accent-foreground font-medium", level > 0 && "pl-8", "text-slate-900 dark:text-slate-100") },
                    React.createElement("div", { className: "flex items-center gap-3" },
                        Icon && React.createElement(Icon, { className: "h-4 w-4" }),
                        React.createElement("span", { className: "whitespace-nowrap" }, item.title)),
                    isExpanded ? (React.createElement(lucide_react_1.ChevronDown, { className: "h-4 w-4 flex-shrink-0" })) : (React.createElement(lucide_react_1.ChevronRight, { className: "h-4 w-4 flex-shrink-0" }))),
                isExpanded && visibleChildren.length > 0 && (React.createElement("div", { className: "mt-1 space-y-1" }, visibleChildren.map(function (child) { return (React.createElement("div", { key: child.title }, renderNavItem(child, level + 1))); })))));
        }
        // Leaf item (expanded mode)
        return (React.createElement("button", { key: item.title, onClick: function () { return item.href && navigate(item.href); }, className: utils_1.cn("w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors", "hover:bg-accent hover:text-accent-foreground", isItemActive && "bg-primary text-primary-foreground font-medium", level > 0 && "pl-8", "text-slate-900 dark:text-slate-100") },
            Icon && React.createElement(Icon, { className: "h-4 w-4" }),
            React.createElement("span", { className: "whitespace-nowrap" }, item.title),
            item.badge && (React.createElement("span", { className: "ml-auto bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full" }, item.badge))));
    };
    return (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "min-h-screen bg-background" },
            React.createElement(button_1.Button, { variant: "outline", size: "icon", onClick: function () { return setMobileSidebarOpen(!mobileSidebarOpen); }, className: utils_1.cn("fixed top-3 z-[60] transition-all duration-300 shadow-lg h-9 w-9 sm:h-10 sm:w-10 p-1.5 sm:p-2 lg:hidden", "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700", "hover:bg-slate-100 dark:hover:bg-slate-700", mobileSidebarOpen ? "left-[calc(16rem+0.75rem)]" : "left-3 sm:left-4"), "aria-label": mobileSidebarOpen ? "Close sidebar" : "Open sidebar" }, mobileSidebarOpen ? React.createElement(lucide_react_1.X, { className: "h-4 w-4 sm:h-5 sm:w-5" }) : React.createElement(lucide_react_1.Menu, { className: "h-4 w-4 sm:h-5 sm:w-5" })),
            mobileSidebarOpen && (React.createElement("div", { className: "fixed inset-0 z-40 bg-black/50 lg:hidden", onClick: function () { return setMobileSidebarOpen(false); } })),
            React.createElement("aside", { className: utils_1.cn("fixed left-0 top-0 z-50 h-screen transition-all duration-300 border-r overflow-hidden lg:hidden", "w-64", mobileSidebarOpen ? "translate-x-0 shadow-lg" : "-translate-x-full", "bg-white dark:bg-gradient-to-b dark:from-blue-900 dark:to-blue-950", "dark:border-blue-800") },
                React.createElement("div", { className: "flex h-full flex-col" },
                    React.createElement("div", { className: "flex h-14 items-center gap-2 border-b px-3 flex-shrink-0" },
                        React.createElement("button", { onClick: function () { return navigate("/crm-home"); }, className: "flex items-center gap-2 hover:opacity-80 transition-opacity w-full min-w-0", title: "Back to Home" },
                            React.createElement("img", { src: appLogo, alt: appTitle, className: "h-8 rounded flex-shrink-0" }),
                            React.createElement("span", { className: "font-semibold text-sm truncate" }, appTitle))),
                    React.createElement(scroll_area_1.ScrollArea, { className: "flex-1 px-2 py-3" },
                        React.createElement("nav", { className: "space-y-0.5" }, getFilteredNav(getNavigation(user === null || user === void 0 ? void 0 : user.role)).map(function (item) { return React.createElement("div", { key: item.title }, renderNavItem(item)); }))),
                    React.createElement("div", { className: "border-t p-3 flex-shrink-0" },
                        React.createElement("button", { onClick: function () { return navigate("/profile"); }, className: "w-full flex items-center gap-2 p-2 rounded-lg hover:bg-accent transition-colors min-w-0" },
                            React.createElement(avatar_1.Avatar, { className: "h-7 w-7 flex-shrink-0" },
                                React.createElement(avatar_1.AvatarImage, { src: ((_b = user) === null || _b === void 0 ? void 0 : _b.photoUrl) || undefined }),
                                React.createElement(avatar_1.AvatarFallback, { className: "text-xs" }, getInitials((user === null || user === void 0 ? void 0 : user.name) || undefined))),
                            React.createElement("div", { className: "flex-1 text-left min-w-0" },
                                React.createElement("p", { className: "text-xs font-medium truncate" }, (user === null || user === void 0 ? void 0 : user.name) || "User"),
                                React.createElement("p", { className: "text-xs text-muted-foreground truncate" }, (user === null || user === void 0 ? void 0 : user.email) || "No email")))))),
            React.createElement("aside", { ref: sidebarRef, className: utils_1.cn("fixed left-0 top-0 z-50 h-screen transition-all duration-300 border-r overflow-hidden hidden lg:block", sidebarExpanded ? "w-[250px] shadow-lg" : "w-[70px]", "bg-white dark:bg-gradient-to-b dark:from-blue-900 dark:to-blue-950", "dark:border-blue-800") },
                React.createElement("div", { className: "flex h-full flex-col" },
                    React.createElement("div", { className: "flex h-14 items-center border-b px-3 flex-shrink-0" },
                        React.createElement("button", { onClick: function () { return navigate("/crm-home"); }, className: utils_1.cn("flex items-center gap-2 hover:opacity-80 transition-opacity min-w-0", !sidebarExpanded && "justify-center w-full"), title: "Back to Home" },
                            React.createElement("img", { src: appLogo, alt: appTitle, className: "h-8 rounded flex-shrink-0" }),
                            sidebarExpanded && React.createElement("span", { className: "font-semibold text-sm truncate whitespace-nowrap" }, appTitle)),
                        sidebarExpanded && (React.createElement("button", { onClick: function () { return setSidebarPinned(!sidebarPinned); }, className: "ml-auto p-1 rounded hover:bg-accent transition-colors flex-shrink-0", title: sidebarPinned ? "Unpin sidebar" : "Pin sidebar" }, sidebarPinned ? React.createElement(lucide_react_1.X, { className: "h-4 w-4 text-muted-foreground" }) : React.createElement(lucide_react_1.Menu, { className: "h-4 w-4 text-muted-foreground" })))),
                    React.createElement(scroll_area_1.ScrollArea, { className: utils_1.cn("flex-1 py-3", sidebarExpanded ? "px-2" : "px-1.5") },
                        React.createElement("nav", { className: utils_1.cn("space-y-0.5", !sidebarExpanded && "flex flex-col items-center") }, getFilteredNav(getNavigation(user === null || user === void 0 ? void 0 : user.role)).map(function (item) { return React.createElement("div", { key: item.title, className: "w-full" }, renderNavItem(item)); }))),
                    React.createElement("div", { className: "border-t p-2 flex-shrink-0" }, sidebarExpanded ? (React.createElement(dropdown_menu_1.DropdownMenu, null,
                        React.createElement(dropdown_menu_1.DropdownMenuTrigger, { asChild: true },
                            React.createElement("button", { className: "w-full flex items-center gap-2 p-2 rounded-lg hover:bg-accent transition-colors min-w-0" },
                                React.createElement(avatar_1.Avatar, { className: "h-7 w-7 flex-shrink-0" },
                                    React.createElement(avatar_1.AvatarImage, { src: ((_c = user) === null || _c === void 0 ? void 0 : _c.photoUrl) || undefined }),
                                    React.createElement(avatar_1.AvatarFallback, { className: "text-xs" }, getInitials((user === null || user === void 0 ? void 0 : user.name) || undefined))),
                                React.createElement("div", { className: "flex-1 text-left min-w-0" },
                                    React.createElement("p", { className: "text-xs font-medium truncate" }, (user === null || user === void 0 ? void 0 : user.name) || "User"),
                                    React.createElement("p", { className: "text-xs text-muted-foreground truncate" }, (user === null || user === void 0 ? void 0 : user.email) || "No email")),
                                React.createElement(lucide_react_1.ChevronDown, { className: "h-3 w-3 text-muted-foreground flex-shrink-0" }))),
                        React.createElement(dropdown_menu_1.DropdownMenuContent, { align: "end", className: "w-52" },
                            React.createElement(dropdown_menu_1.DropdownMenuLabel, { className: "text-sm" }, "My Account"),
                            React.createElement(dropdown_menu_1.DropdownMenuSeparator, null),
                            React.createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return navigate("/profile"); }, className: "text-sm" },
                                React.createElement(lucide_react_1.User, { className: "mr-2 h-4 w-4" }),
                                React.createElement("span", null, "Profile Settings")),
                            React.createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return navigate("/account"); }, className: "text-sm" },
                                React.createElement(lucide_react_1.Settings, { className: "mr-2 h-4 w-4" }),
                                React.createElement("span", null, "Account Settings")),
                            React.createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return navigate("/security"); }, className: "text-sm" },
                                React.createElement(lucide_react_1.Lock, { className: "mr-2 h-4 w-4" }),
                                React.createElement("span", null, "Password & Security")),
                            React.createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return navigate("/mfa"); }, className: "text-sm" },
                                React.createElement(lucide_react_1.Shield, { className: "mr-2 h-4 w-4" }),
                                React.createElement("span", null, "Two-Factor Auth")),
                            React.createElement(dropdown_menu_1.DropdownMenuSeparator, null),
                            React.createElement(dropdown_menu_1.DropdownMenuItem, { onClick: toggleTheme, className: "text-sm" }, theme === "dark" ? React.createElement(React.Fragment, null,
                                React.createElement(lucide_react_1.Sun, { className: "mr-2 h-4 w-4" }),
                                React.createElement("span", null, "Light Mode")) : React.createElement(React.Fragment, null,
                                React.createElement(lucide_react_1.Moon, { className: "mr-2 h-4 w-4" }),
                                React.createElement("span", null, "Dark Mode"))),
                            React.createElement(dropdown_menu_1.DropdownMenuSeparator, null),
                            React.createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return logout(); }, className: "text-red-600 text-sm" },
                                React.createElement(lucide_react_1.LogOut, { className: "mr-2 h-4 w-4" }),
                                React.createElement("span", null, "Sign Out"))))) : (React.createElement(tooltip_1.TooltipProvider, { delayDuration: 0 },
                        React.createElement(tooltip_1.Tooltip, null,
                            React.createElement(tooltip_1.TooltipTrigger, { asChild: true },
                                React.createElement("button", { onClick: function () { return navigate("/profile"); }, className: "w-full flex items-center justify-center p-2 rounded-lg hover:bg-accent transition-colors" },
                                    React.createElement(avatar_1.Avatar, { className: "h-7 w-7" },
                                        React.createElement(avatar_1.AvatarImage, { src: ((_d = user) === null || _d === void 0 ? void 0 : _d.photoUrl) || undefined }),
                                        React.createElement(avatar_1.AvatarFallback, { className: "text-xs" }, getInitials((user === null || user === void 0 ? void 0 : user.name) || undefined))))),
                            React.createElement(tooltip_1.TooltipContent, { side: "right", sideOffset: 10 },
                                React.createElement("p", null, (user === null || user === void 0 ? void 0 : user.name) || "User")))))))),
            !sidebarExpanded && popoutItem && (function () {
                var navItems = getFilteredNav(getNavigation(user === null || user === void 0 ? void 0 : user.role));
                var activeItem = navItems.find(function (i) { return i.title === popoutItem; });
                if (!(activeItem === null || activeItem === void 0 ? void 0 : activeItem.children))
                    return null;
                var children = activeItem.children;
                var maxTop = typeof window !== 'undefined' ? window.innerHeight - (children.length * 40 + 60) : 400;
                return (React.createElement("div", { id: "sidebar-popout", className: "fixed left-[70px] z-[200] bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-r-lg shadow-xl py-1 min-w-[200px] hidden lg:block", style: { top: Math.max(56, Math.min(popoutY, maxTop)) }, onMouseEnter: cancelClosePopout, onMouseLeave: scheduleClosePopout },
                    React.createElement("div", { className: "flex items-center gap-2 px-4 py-2.5 border-b dark:border-slate-700" },
                        activeItem.icon && React.createElement(activeItem.icon, { className: "h-4 w-4 text-teal-600 dark:text-teal-400" }),
                        React.createElement("span", { className: "text-sm font-semibold text-teal-600 dark:text-teal-400" }, popoutItem)),
                    React.createElement("div", { className: "py-1" }, children.map(function (child) {
                        var ChildIcon = child.icon;
                        var isChildActive = isActive(child.href);
                        return (React.createElement("button", { key: child.title, onClick: function () { child.href && navigate(child.href); setPopoutItem(null); }, className: utils_1.cn("w-full text-left px-4 py-2 text-sm flex items-center gap-2.5 hover:bg-accent transition-colors", isChildActive && "bg-primary/10 text-primary font-medium") },
                            ChildIcon && React.createElement(ChildIcon, { className: "h-3.5 w-3.5 text-muted-foreground" }),
                            child.title));
                    }))));
            })(),
            React.createElement("div", { className: utils_1.cn("transition-all duration-300 flex flex-col min-h-screen", 
                // Mobile: no margin (sidebar overlays). Desktop: margin based on sidebar state
                "ml-0 lg:ml-[70px]", sidebarExpanded && "lg:ml-[250px]") },
                React.createElement("header", { className: "sticky top-0 z-30 flex h-12 sm:h-14 items-center gap-0.5 sm:gap-1 md:gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-2 sm:px-3 md:px-4 lg:px-6 flex-shrink-0 flex-wrap sm:flex-nowrap" },
                    React.createElement("div", { className: "w-9 sm:w-10 lg:hidden" }),
                    React.createElement(tooltip_1.TooltipProvider, { delayDuration: 300 },
                        React.createElement(tooltip_1.Tooltip, null,
                            React.createElement(tooltip_1.TooltipTrigger, { asChild: true },
                                React.createElement(button_1.Button, { variant: "ghost", size: "icon", className: "h-8 w-8 sm:h-9 sm:w-9 text-slate-700 hover:text-slate-900 hover:bg-slate-200 dark:text-slate-300 dark:hover:text-slate-50 dark:hover:bg-slate-600 hidden lg:inline-flex", onClick: function () { return setSidebarPinned(function (prev) { return !prev; }); } },
                                    React.createElement(lucide_react_1.Menu, { className: "h-4 w-4 sm:h-5 sm:w-5" }))),
                            React.createElement(tooltip_1.TooltipContent, null,
                                React.createElement("p", null, sidebarPinned ? 'Collapse sidebar' : 'Expand sidebar')))),
                    React.createElement(tooltip_1.TooltipProvider, { delayDuration: 300 },
                        React.createElement(tooltip_1.Tooltip, null,
                            React.createElement(tooltip_1.TooltipTrigger, { asChild: true },
                                React.createElement(button_1.Button, { variant: "ghost", size: "icon", className: "h-8 w-8 sm:h-9 sm:w-9 text-slate-700 hover:text-slate-900 hover:bg-slate-200 dark:text-slate-300 dark:hover:text-slate-50 dark:hover:bg-slate-600", onClick: function () { return navigate("/crm-home"); } },
                                    React.createElement(lucide_react_1.Home, { className: "h-4 w-4 sm:h-5 sm:w-5" }))),
                            React.createElement(tooltip_1.TooltipContent, null,
                                React.createElement("p", null, "Home")))),
                    React.createElement("form", { className: "relative hidden sm:flex items-center ml-1", onSubmit: function (e) {
                            e.preventDefault();
                            if (headerSearchQuery.trim()) {
                                navigate("/search?q=" + encodeURIComponent(headerSearchQuery.trim()));
                                setHeaderSearchQuery("");
                            }
                        } },
                        React.createElement(lucide_react_1.Search, { className: "absolute left-2.5 h-4 w-4 text-muted-foreground pointer-events-none" }),
                        React.createElement("input", { type: "text", placeholder: "Search", value: headerSearchQuery, onChange: function (e) { return setHeaderSearchQuery(e.target.value); }, className: "h-8 w-40 md:w-52 rounded-md border border-input bg-background pl-8 pr-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring" })),
                    React.createElement("div", { className: "flex-1" }),
                    React.createElement(tooltip_1.TooltipProvider, { delayDuration: 300 },
                        React.createElement("div", { className: "flex items-center gap-0.5 sm:gap-1" },
                            React.createElement(sheet_1.Sheet, null,
                                React.createElement(tooltip_1.Tooltip, null,
                                    React.createElement(tooltip_1.TooltipTrigger, { asChild: true },
                                        React.createElement(sheet_1.SheetTrigger, { asChild: true },
                                            React.createElement(button_1.Button, { variant: "ghost", size: "icon", className: "h-8 w-8 sm:h-9 sm:w-9 text-slate-600 hover:text-amber-600 hover:bg-amber-50 dark:text-slate-400 dark:hover:text-amber-400 dark:hover:bg-amber-950/30" },
                                                React.createElement(lucide_react_1.Star, { className: utils_1.cn("h-4 w-4 sm:h-5 sm:w-5", favoritesData.length > 0 && "fill-amber-400 text-amber-400") })))),
                                    React.createElement(tooltip_1.TooltipContent, null,
                                        React.createElement("p", null,
                                            "Starred Items (",
                                            favoritesData.length,
                                            ")"))),
                                React.createElement(sheet_1.SheetContent, { side: "right", className: "w-[420px] sm:w-[520px] p-0" },
                                    React.createElement("div", { className: "bg-cyan-500 text-white px-6 py-4 flex items-center gap-3" },
                                        React.createElement(lucide_react_1.Star, { className: "h-5 w-5" }),
                                        React.createElement(sheet_1.SheetTitle, { className: "text-white m-0" },
                                            "Starred (",
                                            favoritesData.length,
                                            ")")),
                                    React.createElement("div", { className: "px-4 py-2 border-b flex flex-wrap gap-1 text-sm" },
                                        React.createElement("button", { onClick: function () { return setFavFilter(null); }, className: utils_1.cn("font-medium", !favFilter ? "text-cyan-600 dark:text-cyan-400 underline" : "text-muted-foreground hover:text-foreground") }, "All"),
                                        [
                                            { label: "Clients", type: "client" },
                                            { label: "Projects", type: "project" },
                                            { label: "Invoices", type: "invoice" },
                                            { label: "Estimates", type: "estimate" },
                                            { label: "Employees", type: "employee" },
                                            { label: "Suppliers", type: "supplier" },
                                        ].map(function (tab) { return (React.createElement("span", { key: tab.type },
                                            React.createElement("span", { className: "text-muted-foreground mx-1" }, "|"),
                                            React.createElement("button", { onClick: function () { return setFavFilter(tab.type); }, className: utils_1.cn("font-medium", favFilter === tab.type ? "text-cyan-600 dark:text-cyan-400 underline" : "text-muted-foreground hover:text-foreground") }, tab.label))); })),
                                    filteredFavorites.length === 0 ? (React.createElement("div", { className: "flex flex-col items-center justify-center py-16 px-6 text-center" },
                                        React.createElement(lucide_react_1.Star, { className: "h-16 w-16 text-muted-foreground/20 mb-4" }),
                                        React.createElement("h4", { className: "text-lg font-medium text-muted-foreground" }, "No starred items"),
                                        React.createElement("p", { className: "text-sm text-muted-foreground/70 mt-1" }, "Star clients, projects, invoices, or estimates to quickly access them here"))) : (React.createElement(scroll_area_1.ScrollArea, { className: "h-[calc(100vh-160px)]" },
                                        React.createElement("div", { className: "divide-y" }, filteredFavorites.map(function (fav) { return (React.createElement("div", { key: fav.id, className: "flex items-center justify-between px-4 py-3 hover:bg-muted/50" },
                                            React.createElement("button", { className: "flex items-center gap-3 flex-1 text-left", onClick: function () {
                                                    var routes = { client: "/clients/", project: "/projects/", invoice: "/invoices/", estimate: "/estimates/", employee: "/employees/", supplier: "/suppliers/" };
                                                    var base = routes[fav.entityType] || "/";
                                                    navigate(base + fav.entityId);
                                                } },
                                                React.createElement(lucide_react_1.Star, { className: "h-4 w-4 fill-amber-400 text-amber-400 shrink-0" }),
                                                React.createElement("div", null,
                                                    React.createElement("p", { className: "text-sm font-medium" }, fav.entityName || fav.entityId),
                                                    React.createElement("p", { className: "text-xs text-muted-foreground capitalize" }, fav.entityType))),
                                            React.createElement(button_1.Button, { variant: "ghost", size: "icon", className: "h-7 w-7 text-muted-foreground hover:text-destructive", onClick: function () { return removeFavMutation.mutate({ id: fav.id }); } },
                                                React.createElement(lucide_react_1.X, { className: "h-3.5 w-3.5" })))); })))))),
                            React.createElement(dropdown_menu_1.DropdownMenu, null,
                                React.createElement(tooltip_1.Tooltip, null,
                                    React.createElement(tooltip_1.TooltipTrigger, { asChild: true },
                                        React.createElement(dropdown_menu_1.DropdownMenuTrigger, { asChild: true },
                                            React.createElement(button_1.Button, { variant: "ghost", size: "sm", className: utils_1.cn("h-8 sm:h-9 px-2 text-slate-700 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-600 gap-1 font-mono text-xs", timerRunning && "text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-950/40") },
                                                React.createElement(lucide_react_1.Timer, { className: "h-4 w-4 sm:h-5 sm:w-5" }),
                                                React.createElement("span", { className: "hidden sm:inline" }, formatTimer(timerSeconds))))),
                                    React.createElement(tooltip_1.TooltipContent, null,
                                        React.createElement("p", null, "Timer"))),
                                React.createElement(dropdown_menu_1.DropdownMenuContent, { align: "end", className: "w-72 p-3" },
                                    React.createElement("div", { className: "space-y-3" },
                                        React.createElement("p", { className: "text-2xl font-mono font-bold text-center" }, formatTimer(timerSeconds)),
                                        React.createElement("div", { className: "space-y-2" },
                                            React.createElement("input", { type: "text", placeholder: "What are you working on?", value: timerProject, onChange: function (e) { return setTimerProject(e.target.value); }, className: "w-full px-2 py-1.5 text-sm border rounded-md bg-background" })),
                                        React.createElement("div", { className: "flex gap-2 justify-center" },
                                            React.createElement(button_1.Button, { size: "sm", variant: timerRunning ? "destructive" : "default", onClick: function () {
                                                    if (timerRunning) {
                                                        setTimerRunning(false);
                                                    }
                                                    else {
                                                        var now = Date.now() - timerSeconds * 1000;
                                                        setTimerStartedAt(now);
                                                        setTimerRunning(true);
                                                    }
                                                } }, timerRunning ? "Stop" : "Start"),
                                            React.createElement(button_1.Button, { size: "sm", variant: "outline", onClick: function () { setTimerRunning(false); setTimerSeconds(0); setTimerStartedAt(null); } }, "Reset")),
                                        React.createElement(dropdown_menu_1.DropdownMenuSeparator, null),
                                        React.createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return navigate("/timesheets"); }, className: "text-sm justify-center" },
                                            React.createElement(lucide_react_1.Clock, { className: "mr-2 h-4 w-4" }),
                                            "Open Time Sheets")))),
                            React.createElement(sheet_1.Sheet, null,
                                React.createElement(tooltip_1.Tooltip, null,
                                    React.createElement(tooltip_1.TooltipTrigger, { asChild: true },
                                        React.createElement(sheet_1.SheetTrigger, { asChild: true },
                                            React.createElement(button_1.Button, { variant: "ghost", size: "icon", className: "h-8 w-8 sm:h-9 sm:w-9 text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-700" },
                                                React.createElement(lucide_react_1.AlarmClock, { className: "h-4 w-4 sm:h-5 sm:w-5" })))),
                                    React.createElement(tooltip_1.TooltipContent, null,
                                        React.createElement("p", null, "Reminders"))),
                                React.createElement(sheet_1.SheetContent, { side: "right", className: "w-80 sm:w-[420px] p-0" },
                                    React.createElement("div", { className: "bg-primary text-primary-foreground px-6 py-4 flex items-center gap-3" },
                                        React.createElement(lucide_react_1.AlarmClock, { className: "h-5 w-5" }),
                                        React.createElement(sheet_1.SheetTitle, { className: "text-primary-foreground m-0" },
                                            "Reminders (",
                                            activeReminders.length,
                                            ")")),
                                    React.createElement("div", { className: "px-6 py-3 border-b flex gap-2 text-sm" },
                                        React.createElement("button", { onClick: function () { return setReminderTab("due"); }, className: reminderTab === "due" ? "text-primary font-medium hover:underline" : "text-muted-foreground hover:text-foreground hover:underline" },
                                            "Due Reminders (",
                                            dueReminders.length,
                                            ")"),
                                        React.createElement("span", { className: "text-muted-foreground" }, "|"),
                                        React.createElement("button", { onClick: function () { return setReminderTab("pending"); }, className: reminderTab === "pending" ? "text-primary font-medium hover:underline" : "text-muted-foreground hover:text-foreground hover:underline" },
                                            "Pending Reminders (",
                                            pendingReminders.length,
                                            ")")),
                                    activeReminders.length === 0 ? (React.createElement("div", { className: "flex flex-col items-center justify-center py-16 px-6 text-center" },
                                        React.createElement(lucide_react_1.AlarmClock, { className: "h-16 w-16 text-muted-foreground/30 mb-4" }),
                                        React.createElement("h4", { className: "text-lg font-medium text-muted-foreground" }, "No reminders found"),
                                        React.createElement("p", { className: "text-sm text-muted-foreground/70 mt-1" }, "Create reminders from invoices, tasks, or projects"))) : (React.createElement("div", { className: "divide-y overflow-y-auto max-h-[calc(100vh-140px)]" }, activeReminders.map(function (r) { return (React.createElement("div", { key: r.id, className: "px-6 py-3 hover:bg-accent/50 cursor-pointer", onClick: function () {
                                            if (r.referenceType && r.referenceId)
                                                navigate("/" + r.referenceType + "s/" + r.referenceId);
                                        } },
                                        React.createElement("div", { className: "flex items-center justify-between" },
                                            React.createElement("p", { className: "text-sm font-medium truncate" }, r.title || r.type || "Reminder"),
                                            React.createElement("span", { className: "text-xs px-1.5 py-0.5 rounded " + (r.status === "sent" ? "bg-green-100 text-green-700" : r.status === "failed" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700") }, r.status)),
                                        React.createElement("p", { className: "text-xs text-muted-foreground mt-0.5" },
                                            r.scheduledFor ? new Date(r.scheduledFor).toLocaleString() : "No date",
                                            " ",
                                            r.referenceType ? "\u2022 " + r.referenceType : ""))); }))))),
                            React.createElement(NotificationBell_1.NotificationBell, null),
                            React.createElement(tooltip_1.Tooltip, null,
                                React.createElement(tooltip_1.TooltipTrigger, { asChild: true },
                                    React.createElement(button_1.Button, { variant: "ghost", size: "icon", className: "h-8 w-8 sm:h-9 sm:w-9 text-slate-700 hover:text-slate-900 hover:bg-slate-200 dark:text-slate-300 dark:hover:text-slate-50 dark:hover:bg-slate-600", onClick: function () { return navigate("/calendar"); } },
                                        React.createElement(lucide_react_1.Calendar, { className: "h-4 w-4 sm:h-5 sm:w-5" }))),
                                React.createElement(tooltip_1.TooltipContent, null,
                                    React.createElement("p", null, "Calendar"))),
                            React.createElement(tooltip_1.Tooltip, null,
                                React.createElement(tooltip_1.TooltipTrigger, { asChild: true },
                                    React.createElement(button_1.Button, { variant: "ghost", size: "icon", className: "h-8 w-8 sm:h-9 sm:w-9 text-slate-700 hover:text-slate-900 hover:bg-slate-200 dark:text-slate-300 dark:hover:text-slate-50 dark:hover:bg-slate-600", onClick: function () { return navigate("/staff-chat"); } },
                                        React.createElement(lucide_react_1.MessageSquare, { className: "h-4 w-4 sm:h-5 sm:w-5" }))),
                                React.createElement(tooltip_1.TooltipContent, null,
                                    React.createElement("p", null, "Messages"))),
                            React.createElement(tooltip_1.Tooltip, null,
                                React.createElement(tooltip_1.TooltipTrigger, { asChild: true },
                                    React.createElement(button_1.Button, { variant: "ghost", size: "icon", className: "h-8 w-8 sm:h-9 sm:w-9 text-slate-700 hover:text-slate-900 hover:bg-slate-200 dark:text-slate-300 dark:hover:text-slate-50 dark:hover:bg-slate-600", onClick: function () { return navigate("/settings"); } },
                                        React.createElement(lucide_react_1.Settings, { className: "h-4 w-4 sm:h-5 sm:w-5" }))),
                                React.createElement(tooltip_1.TooltipContent, null,
                                    React.createElement("p", null, "Settings"))),
                            (user === null || user === void 0 ? void 0 : user.role) === "ict_manager" && (React.createElement(sheet_1.Sheet, { open: ictMenuOpen, onOpenChange: setIctMenuOpen },
                                React.createElement(tooltip_1.Tooltip, null,
                                    React.createElement(tooltip_1.TooltipTrigger, { asChild: true },
                                        React.createElement(sheet_1.SheetTrigger, { asChild: true },
                                            React.createElement(button_1.Button, { variant: "ghost", size: "icon", className: "h-8 w-8 sm:h-9 sm:w-9 text-slate-700 hover:text-slate-900 hover:bg-slate-200 dark:text-slate-300 dark:hover:text-slate-50 dark:hover:bg-slate-600" },
                                                React.createElement(lucide_react_1.Menu, { className: "h-4 w-4 sm:h-5 sm:w-5" })))),
                                    React.createElement(tooltip_1.TooltipContent, null,
                                        React.createElement("p", null, "ICT Menu"))),
                                React.createElement(sheet_1.SheetContent, { side: "right", className: "w-[300px] p-0" },
                                    React.createElement("div", { className: "bg-teal-600 text-white px-4 py-4 flex items-center gap-3" },
                                        React.createElement(lucide_react_1.Wrench, { className: "h-5 w-5" }),
                                        React.createElement(sheet_1.SheetTitle, { className: "text-white m-0" }, "ICT Manager")),
                                    React.createElement(scroll_area_1.ScrollArea, { className: "h-[calc(100vh-70px)]" },
                                        React.createElement("nav", { className: "space-y-1 py-3" }, NAV_ICT_MANAGER.map(function (item) {
                                            var _a;
                                            var Icon = item.icon;
                                            var isExpanded = expandedItems.includes(item.title);
                                            var hasChildren = (item.children || []).length > 0;
                                            var isItemActive = isActive(item.href) || (item.children || []).some(function (child) { return isActive(child.href); });
                                            if (hasChildren) {
                                                return (React.createElement("div", { key: item.title },
                                                    React.createElement("button", { onClick: function () { return toggleExpanded(item.title); }, className: utils_1.cn("w-full flex items-center justify-between px-4 py-2 text-sm rounded-none transition-colors", "hover:bg-teal-50 dark:hover:bg-teal-950/30", isItemActive && "bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300 font-medium", "text-slate-900 dark:text-slate-100") },
                                                        React.createElement("div", { className: "flex items-center gap-3" },
                                                            Icon && React.createElement(Icon, { className: "h-4 w-4" }),
                                                            React.createElement("span", null, item.title)),
                                                        isExpanded ? (React.createElement(lucide_react_1.ChevronDown, { className: "h-4 w-4 flex-shrink-0" })) : (React.createElement(lucide_react_1.ChevronRight, { className: "h-4 w-4 flex-shrink-0" }))),
                                                    isExpanded && (React.createElement("div", { className: "mt-1 space-y-1" }, (_a = item.children) === null || _a === void 0 ? void 0 : _a.map(function (child) {
                                                        var ChildIcon = child.icon;
                                                        var isChildActive = isActive(child.href);
                                                        return (React.createElement("button", { key: child.title, onClick: function () {
                                                                if (child.href)
                                                                    navigate(child.href);
                                                                setIctMenuOpen(false);
                                                            }, className: utils_1.cn("w-full text-left px-4 py-2 text-sm flex items-center gap-3 rounded-none transition-colors", "hover:bg-teal-50 dark:hover:bg-teal-950/30", isChildActive && "bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-medium", "text-slate-900 dark:text-slate-100", "pl-12") },
                                                            ChildIcon && React.createElement(ChildIcon, { className: "h-3.5 w-3.5" }),
                                                            child.title));
                                                    })))));
                                            }
                                            return (React.createElement("button", { key: item.title, onClick: function () {
                                                    if (item.href)
                                                        navigate(item.href);
                                                    setIctMenuOpen(false);
                                                }, className: utils_1.cn("w-full text-left px-4 py-2 text-sm flex items-center gap-3 rounded-none transition-colors", "hover:bg-teal-50 dark:hover:bg-teal-950/30", isItemActive && "bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300 font-medium", "text-slate-900 dark:text-slate-100") },
                                                Icon && React.createElement(Icon, { className: "h-4 w-4" }),
                                                React.createElement("span", null, item.title)));
                                        })))))),
                            React.createElement(dropdown_menu_1.DropdownMenu, null,
                                React.createElement(tooltip_1.Tooltip, null,
                                    React.createElement(tooltip_1.TooltipTrigger, { asChild: true },
                                        React.createElement(dropdown_menu_1.DropdownMenuTrigger, { asChild: true },
                                            React.createElement(button_1.Button, { variant: "ghost", size: "icon", className: "h-8 w-8 sm:h-9 sm:w-9 text-red-500 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/30" },
                                                React.createElement(lucide_react_1.Plus, { className: "h-5 w-5 sm:h-6 sm:w-6" })))),
                                    React.createElement(tooltip_1.TooltipContent, null,
                                        React.createElement("p", null, "Quick Create"))),
                                React.createElement(dropdown_menu_1.DropdownMenuContent, { align: "end", className: "w-52" },
                                    React.createElement(dropdown_menu_1.DropdownMenuLabel, { className: "text-xs font-semibold text-muted-foreground uppercase" }, "Create New"),
                                    React.createElement(dropdown_menu_1.DropdownMenuSeparator, null),
                                    React.createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return navigate("/clients/create"); }, className: "text-sm" },
                                        React.createElement(lucide_react_1.Users, { className: "mr-2 h-4 w-4" }),
                                        React.createElement("span", null, "Client")),
                                    React.createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return navigate("/projects/create"); }, className: "text-sm" },
                                        React.createElement(lucide_react_1.FolderKanban, { className: "mr-2 h-4 w-4" }),
                                        React.createElement("span", null, "Project")),
                                    React.createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return navigate("/tasks?action=create"); }, className: "text-sm" },
                                        React.createElement(lucide_react_1.CheckSquare, { className: "mr-2 h-4 w-4" }),
                                        React.createElement("span", null, "Task")),
                                    React.createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return navigate("/leads?action=create"); }, className: "text-sm" },
                                        React.createElement(lucide_react_1.Phone, { className: "mr-2 h-4 w-4" }),
                                        React.createElement("span", null, "Lead")),
                                    React.createElement(dropdown_menu_1.DropdownMenuSeparator, null),
                                    React.createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return navigate("/invoices/create"); }, className: "text-sm" },
                                        React.createElement(lucide_react_1.FileText, { className: "mr-2 h-4 w-4" }),
                                        React.createElement("span", null, "Invoice")),
                                    React.createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return navigate("/estimates/create"); }, className: "text-sm" },
                                        React.createElement(lucide_react_1.Receipt, { className: "mr-2 h-4 w-4" }),
                                        React.createElement("span", null, "Estimate")),
                                    React.createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return navigate("/proposals?action=create"); }, className: "text-sm" },
                                        React.createElement(lucide_react_1.Pencil, { className: "mr-2 h-4 w-4" }),
                                        React.createElement("span", null, "Proposal")),
                                    React.createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return navigate("/contracts?action=create"); }, className: "text-sm" },
                                        React.createElement(lucide_react_1.FileText, { className: "mr-2 h-4 w-4" }),
                                        React.createElement("span", null, "Contract")),
                                    React.createElement(dropdown_menu_1.DropdownMenuSeparator, null),
                                    React.createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return navigate("/payments/create"); }, className: "text-sm" },
                                        React.createElement(lucide_react_1.CreditCard, { className: "mr-2 h-4 w-4" }),
                                        React.createElement("span", null, "Payment")),
                                    React.createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return navigate("/subscriptions?action=create"); }, className: "text-sm" },
                                        React.createElement(lucide_react_1.Layers, { className: "mr-2 h-4 w-4" }),
                                        React.createElement("span", null, "Subscription")),
                                    React.createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return navigate("/expenses/create"); }, className: "text-sm" },
                                        React.createElement(lucide_react_1.Receipt, { className: "mr-2 h-4 w-4" }),
                                        React.createElement("span", null, "Expense")),
                                    React.createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return navigate("/knowledge-base?action=create"); }, className: "text-sm" },
                                        React.createElement(lucide_react_1.BookOpen, { className: "mr-2 h-4 w-4" }),
                                        React.createElement("span", null, "Article")),
                                    React.createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return navigate("/tickets/create"); }, className: "text-sm" },
                                        React.createElement(lucide_react_1.Ticket, { className: "mr-2 h-4 w-4" }),
                                        React.createElement("span", null, "Ticket")))),
                            React.createElement(dropdown_menu_1.DropdownMenu, null,
                                React.createElement(tooltip_1.Tooltip, null,
                                    React.createElement(tooltip_1.TooltipTrigger, { asChild: true },
                                        React.createElement(dropdown_menu_1.DropdownMenuTrigger, { asChild: true },
                                            React.createElement(button_1.Button, { variant: "ghost", size: "icon", className: "h-8 w-8 sm:h-9 sm:w-9 text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-700" },
                                                React.createElement(lucide_react_1.Globe, { className: "h-4 w-4 sm:h-5 sm:w-5" })))),
                                    React.createElement(tooltip_1.TooltipContent, null,
                                        React.createElement("p", null, "Language"))),
                                React.createElement(dropdown_menu_1.DropdownMenuContent, { align: "end", className: "w-44 max-h-64 overflow-y-auto" },
                                    React.createElement(dropdown_menu_1.DropdownMenuLabel, { className: "text-xs font-semibold text-muted-foreground uppercase" }, "Language"),
                                    React.createElement(dropdown_menu_1.DropdownMenuSeparator, null),
                                    ["English", "French", "German", "Spanish", "Portuguese", "Italian", "Dutch", "Chinese", "Japanese", "Korean", "Arabic", "Swahili", "Hindi"].map(function (lang) { return (React.createElement(dropdown_menu_1.DropdownMenuItem, { key: lang, className: "text-sm flex justify-between", onClick: function () { return handleLanguageChange(lang); } },
                                        lang,
                                        selectedLanguage === lang && React.createElement(lucide_react_1.Check, { className: "h-4 w-4 text-primary" }))); }))))),
                    React.createElement(dropdown_menu_1.DropdownMenu, null,
                        React.createElement(dropdown_menu_1.DropdownMenuTrigger, { asChild: true },
                            React.createElement(button_1.Button, { variant: "ghost", className: "relative h-8 sm:h-9 rounded-full p-0 pl-1 pr-2 gap-2 hover:bg-accent" },
                                React.createElement(avatar_1.Avatar, { className: "h-7 w-7 sm:h-8 sm:w-8" },
                                    React.createElement(avatar_1.AvatarImage, { src: ((_e = user) === null || _e === void 0 ? void 0 : _e.photoUrl) || undefined }),
                                    React.createElement(avatar_1.AvatarFallback, { className: "text-xs" }, getInitials((user === null || user === void 0 ? void 0 : user.name) || undefined))),
                                React.createElement("span", { className: "hidden sm:inline text-sm font-medium text-slate-700 dark:text-slate-200" }, ((_f = user === null || user === void 0 ? void 0 : user.name) === null || _f === void 0 ? void 0 : _f.split(" ")[0]) || "User"))),
                        React.createElement(dropdown_menu_1.DropdownMenuContent, { align: "end", className: "w-52" },
                            React.createElement(dropdown_menu_1.DropdownMenuLabel, null,
                                React.createElement("div", { className: "flex flex-col space-y-0.5" },
                                    React.createElement("p", { className: "text-sm font-medium truncate" }, (user === null || user === void 0 ? void 0 : user.name) || "User"),
                                    React.createElement("p", { className: "text-xs text-muted-foreground truncate" }, (user === null || user === void 0 ? void 0 : user.email) || "No email"))),
                            React.createElement(dropdown_menu_1.DropdownMenuSeparator, null),
                            React.createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return navigate("/profile"); }, className: "text-sm" },
                                React.createElement(lucide_react_1.ImageIcon, { className: "mr-2 h-4 w-4" }),
                                React.createElement("span", null, "Update Avatar")),
                            React.createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return navigate("/profile"); }, className: "text-sm" },
                                React.createElement(lucide_react_1.User, { className: "mr-2 h-4 w-4" }),
                                React.createElement("span", null, "Update My Profile")),
                            React.createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return navigate("/timesheets"); }, className: "text-sm" },
                                React.createElement(lucide_react_1.Timer, { className: "mr-2 h-4 w-4" }),
                                React.createElement("span", null, "My Time Sheets")),
                            React.createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return navigate("/notes"); }, className: "text-sm" },
                                React.createElement(lucide_react_1.StickyNote, { className: "mr-2 h-4 w-4" }),
                                React.createElement("span", null, "My Notes")),
                            React.createElement(dropdown_menu_1.DropdownMenuSeparator, null),
                            React.createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return navigate("/settings"); }, className: "text-sm" },
                                React.createElement(lucide_react_1.Bell, { className: "mr-2 h-4 w-4" }),
                                React.createElement("span", null, "Notification Settings")),
                            React.createElement(dropdown_menu_1.DropdownMenuItem, { onClick: toggleTheme, className: "text-sm" }, theme === "dark" ? React.createElement(React.Fragment, null,
                                React.createElement(lucide_react_1.Sun, { className: "mr-2 h-4 w-4" }),
                                React.createElement("span", null, "Light Mode")) : React.createElement(React.Fragment, null,
                                React.createElement(lucide_react_1.Moon, { className: "mr-2 h-4 w-4" }),
                                React.createElement("span", null, "Dark Mode"))),
                            React.createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return navigate("/security"); }, className: "text-sm" },
                                React.createElement(lucide_react_1.KeyRound, { className: "mr-2 h-4 w-4" }),
                                React.createElement("span", null, "Update Password")),
                            React.createElement(dropdown_menu_1.DropdownMenuSeparator, null),
                            React.createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return logout(); }, className: "text-red-600 dark:text-red-400 text-sm" },
                                React.createElement(lucide_react_1.LogOut, { className: "mr-2 h-4 w-4" }),
                                React.createElement("span", null, "Logout"))))),
                React.createElement("main", { className: "flex-1 p-3 sm:p-4 md:p-6 overflow-y-auto" }, children))),
        React.createElement(FloatingAIChat_1.FloatingAIChat, null),
        React.createElement(FloatingChatNotifications_1["default"], null),
        React.createElement(AccessibilityWidget_1["default"], null)));
}
exports["default"] = DashboardLayout;
