"use strict";
exports.__esModule = true;
exports.Breadcrumbs = void 0;
var react_1 = require("react");
var wouter_1 = require("wouter");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
var breadcrumbMap = {
    "/": [{ label: "Dashboard", href: "/" }],
    "/dashboard": [{ label: "Dashboard", href: "/" }],
    "/clients": [
        { label: "Dashboard", href: "/" },
        { label: "Clients", href: "/clients" },
    ],
    "/projects": [
        { label: "Dashboard", href: "/" },
        { label: "Projects", href: "/projects" },
    ],
    "/invoices": [
        { label: "Dashboard", href: "/" },
        { label: "Accounting", href: "/accounting" },
        { label: "Invoices", href: "/invoices" },
    ],
    "/estimates": [
        { label: "Dashboard", href: "/" },
        { label: "Sales", href: "/sales" },
        { label: "Estimates", href: "/estimates" },
    ],
    "/receipts": [
        { label: "Dashboard", href: "/" },
        { label: "Sales", href: "/sales" },
        { label: "Receipts", href: "/receipts" },
    ],
    "/payments": [
        { label: "Dashboard", href: "/" },
        { label: "Accounting", href: "/accounting" },
        { label: "Payments", href: "/payments" },
    ],
    "/expenses": [
        { label: "Dashboard", href: "/" },
        { label: "Accounting", href: "/accounting" },
        { label: "Expenses", href: "/expenses" },
    ],
    "/products": [
        { label: "Dashboard", href: "/" },
        { label: "Products & Services", href: "/products" },
        { label: "Products", href: "/products" },
    ],
    "/services": [
        { label: "Dashboard", href: "/" },
        { label: "Products & Services", href: "/services" },
        { label: "Services", href: "/services" },
    ],
    "/employees": [
        { label: "Dashboard", href: "/" },
        { label: "HR", href: "/hr" },
        { label: "Employees", href: "/employees" },
    ],
    "/departments": [
        { label: "Dashboard", href: "/" },
        { label: "HR", href: "/hr" },
        { label: "Departments", href: "/departments" },
    ],
    "/attendance": [
        { label: "Dashboard", href: "/" },
        { label: "HR", href: "/hr" },
        { label: "Attendance", href: "/attendance" },
    ],
    "/payroll": [
        { label: "Dashboard", href: "/" },
        { label: "HR", href: "/hr" },
        { label: "Payroll", href: "/payroll" },
    ],
    "/leave-management": [
        { label: "Dashboard", href: "/" },
        { label: "HR", href: "/hr" },
        { label: "Leave Management", href: "/leave-management" },
    ],
    "/reports": [
        { label: "Dashboard", href: "/" },
        { label: "Reports", href: "/reports" },
    ],
    "/accounting": [
        { label: "Dashboard", href: "/" },
        { label: "Accounting", href: "/accounting" },
    ],
    "/opportunities": [
        { label: "Dashboard", href: "/" },
        { label: "Sales", href: "/sales" },
        { label: "Opportunities", href: "/opportunities" },
    ],
    "/bank-reconciliation": [
        { label: "Dashboard", href: "/" },
        { label: "Accounting", href: "/accounting" },
        { label: "Bank Reconciliation", href: "/bank-reconciliation" },
    ],
    "/chart-of-accounts": [
        { label: "Dashboard", href: "/" },
        { label: "Accounting", href: "/accounting" },
        { label: "Chart of Accounts", href: "/chart-of-accounts" },
    ]
};
function Breadcrumbs(_a) {
    var items = _a.items, className = _a.className;
    var location = wouter_1.useLocation()[0];
    var _b = wouter_1.useLocation(), navigate = _b[1];
    // Get breadcrumb items from map or use provided items
    var breadcrumbItems = items || breadcrumbMap[location] || [{ label: "Dashboard", href: "/" }];
    return (react_1["default"].createElement("nav", { className: utils_1.cn("flex items-center gap-1 text-sm", className) }, breadcrumbItems.map(function (item) { return (react_1["default"].createElement(react_1["default"].Fragment, { key: item.href || item.label },
        breadcrumbItems.indexOf(item) > 0 && (react_1["default"].createElement(lucide_react_1.ChevronRight, { className: "w-4 h-4 text-slate-400 mx-1" })),
        item.href ? (react_1["default"].createElement("button", { onClick: function () { return navigate(item.href); }, className: "text-slate-600 hover:text-slate-900 transition-colors font-medium" }, item.label)) : (react_1["default"].createElement("span", { className: "text-slate-900 font-semibold" }, item.label)))); })));
}
exports.Breadcrumbs = Breadcrumbs;
