"use strict";
exports.__esModule = true;
exports.createModulePage = void 0;
var wouter_1 = require("wouter");
var OrgLayout_1 = require("@/components/OrgLayout");
var OrgBreadcrumb_1 = require("@/components/OrgBreadcrumb");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var lucide_react_1 = require("lucide-react");
var modulePages = [
    { name: 'OrgSubscriptions', title: 'Subscriptions', href: 'subscriptions', permission: 'subscriptions' },
    { name: 'OrgChartOfAccounts', title: 'Chart of Accounts', href: 'chart-of-accounts', permission: 'accounting' },
    { name: 'OrgBankReconciliation', title: 'Bank Reconciliation', href: 'bank-reconciliation', permission: 'accounting' },
    { name: 'OrgFinancialDashboard', title: 'Financial Dashboard', href: 'financial-dashboard', permission: 'accounting' },
    { name: 'OrgForecasting', title: 'Forecasting', href: 'forecasting', permission: 'accounting' },
    { name: 'OrgTaxCompliance', title: 'Tax Compliance', href: 'tax-compliance', permission: 'accounting' },
    { name: 'OrgSuppliers', title: 'Suppliers', href: 'suppliers', permission: 'procurement' },
    { name: 'OrgPurchaseOrders', title: 'Purchase Orders', href: 'lpos', permission: 'procurement' },
    { name: 'OrgOrders', title: 'Orders', href: 'orders', permission: 'procurement' },
    { name: 'OrgImprests', title: 'Imprests', href: 'imprests', permission: 'procurement' },
    { name: 'OrgProducts', title: 'Products', href: 'products', permission: 'procurement' },
    { name: 'OrgInventory', title: 'Stock', href: 'inventory', permission: 'procurement' },
    { name: 'OrgDeliveryNotes', title: 'Delivery Notes', href: 'delivery-notes', permission: 'procurement' },
    { name: 'OrgGRN', title: 'GRNs', href: 'grn', permission: 'procurement' },
    { name: 'OrgServices', title: 'Services', href: 'services', permission: 'invoicing' },
    { name: 'OrgServiceTemplates', title: 'Service Templates', href: 'service-templates', permission: 'invoicing' },
    { name: 'OrgServiceInvoices', title: 'Service Invoices', href: 'service-invoices', permission: 'invoicing' },
    { name: 'OrgProposals', title: 'Proposals', href: 'proposals', permission: 'invoicing' },
    { name: 'OrgQuotations', title: 'Quotations', href: 'quotations', permission: 'invoicing' },
    { name: 'OrgTasks', title: 'Tasks', href: 'tasks', permission: 'projects' },
    { name: 'OrgContractTemplates', title: 'Contract Templates', href: 'contracts/templates', permission: 'contracts' },
    { name: 'OrgAssets', title: 'Assets', href: 'assets', permission: 'contracts' },
    { name: 'OrgWarranty', title: 'Warranty', href: 'warranty', permission: 'contracts' },
    { name: 'OrgEmployees', title: 'Employees', href: 'employees', permission: 'hr' },
    { name: 'OrgDepartments', title: 'Departments', href: 'departments', permission: 'hr' },
    { name: 'OrgPayroll', title: 'Payroll', href: 'payroll', permission: 'hr' },
    { name: 'OrgJobGroups', title: 'Job Groups', href: 'job-groups', permission: 'hr' },
    { name: 'OrgPerformanceReviews', title: 'Performance Reviews', href: 'performance-reviews', permission: 'hr' },
    { name: 'OrgCannedResponses', title: 'Canned Responses', href: 'canned-responses', permission: 'tickets' },
    { name: 'OrgKnowledgebase', title: 'Knowledgebase', href: 'knowledge-base', permission: 'tickets' },
    { name: 'OrgStaffChat', title: 'Staff Chat', href: 'staff-chat', permission: 'communications' },
    { name: 'OrgDocuments', title: 'Documents', href: 'documents', permission: 'documents' },
    { name: 'OrgTimesheets', title: 'Time Sheets', href: 'timesheets', permission: 'timesheets' },
];
// This is a template - replace with actual implementations
function createModulePage(title, href) {
    return function ModulePage() {
        var params = wouter_1.useParams();
        var slug = params.slug;
        return (React.createElement(OrgLayout_1["default"], null,
            React.createElement(OrgBreadcrumb_1["default"], { items: [
                    { label: "Dashboard", href: "/org/" + slug + "/dashboard" },
                    { label: title, href: "/org/" + slug + "/" + href },
                ] }),
            React.createElement("div", { className: "p-6 space-y-6" },
                React.createElement("div", { className: "flex items-center justify-between" },
                    React.createElement("div", null,
                        React.createElement("h1", { className: "text-3xl font-bold" }, title),
                        React.createElement("p", { className: "text-muted-foreground mt-2" },
                            "Manage your ",
                            title.toLowerCase())),
                    React.createElement(button_1.Button, null,
                        React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-2" }),
                        "New ",
                        title.slice(0, -1))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null,
                            "All ",
                            title)),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "text-center py-8 text-muted-foreground" },
                            React.createElement(lucide_react_1.AlertCircle, { className: "h-8 w-8 mx-auto mb-2 opacity-50" }),
                            React.createElement("p", null,
                                "No ",
                                title.toLowerCase(),
                                " found")))))));
    };
}
exports.createModulePage = createModulePage;
