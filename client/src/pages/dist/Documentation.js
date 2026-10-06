"use strict";
exports.__esModule = true;
var react_1 = require("react");
var WebsiteNav_1 = require("@/pages/website/WebsiteNav");
var WebsiteFooter_1 = require("@/pages/website/WebsiteFooter");
var lucide_react_1 = require("lucide-react");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var documentation = [
    {
        id: "getting-started",
        title: "Getting Started",
        description: "Learn the basics of Kiini",
        icon: react_1["default"].createElement(lucide_react_1.BookOpen, { className: "h-5 w-5" }),
        content: [
            "Dashboard Overview - Your personalized business dashboard with real-time metrics",
            "Navigation Guide - Understanding the main menu and quick access features",
            "Keyboard Shortcuts - Master shortcuts for faster navigation (Ctrl+K to toggle sidebar)",
            "Settings - Configure your account, preferences, and notification settings",
            "Two-Factor Authentication - Secure your account with 2FA setup",
        ]
    },
    {
        id: "sales-management",
        title: "Sales Management",
        description: "Manage clients, projects, and opportunities",
        icon: react_1["default"].createElement(lucide_react_1.BookOpen, { className: "h-5 w-5" }),
        content: [
            "Client Management - Create, edit, and manage client relationships",
            "Project Planning - Set up and track projects with milestones",
            "Opportunities - Track sales opportunities and pipeline",
            "Estimates & Quotes - Generate professional estimates for clients",
            "Receipts & Invoicing - Manage receipts and invoice processing",
        ]
    },
    {
        id: "accounting",
        title: "Accounting & Finance",
        description: "Handle financial operations and reporting",
        icon: react_1["default"].createElement(lucide_react_1.BookOpen, { className: "h-5 w-5" }),
        content: [
            "Invoicing - Create and manage customer invoices with flexible terms",
            "Payments - Record and track payment transactions",
            "Bank Reconciliation - Reconcile bank accounts with transaction records",
            "Chart of Accounts - Manage your accounting structure",
            "Financial Reports - Generate comprehensive financial reports and analytics",
            "Budgeting - Create and monitor departmental budgets",
        ]
    },
    {
        id: "hr-management",
        title: "Human Resources",
        description: "Manage employees and HR operations",
        icon: react_1["default"].createElement(lucide_react_1.BookOpen, { className: "h-5 w-5" }),
        content: [
            "Employee Management - Maintain employee records and profiles",
            "Attendance Tracking - Monitor attendance and time off",
            "Payroll Management - Process salaries and manage payroll",
            "Leave Management - Request and approve leave with workflows",
            "Departments - Organize and manage company departments",
            "Performance Reviews - Conduct employee evaluations",
        ]
    },
    {
        id: "procurement",
        title: "Procurement",
        description: "Manage orders and supplier relationships",
        icon: react_1["default"].createElement(lucide_react_1.BookOpen, { className: "h-5 w-5" }),
        content: [
            "Local Purchase Orders (LPO) - Create and manage local purchase orders",
            "Purchase Orders - Handle national and international orders",
            "Supplier Management - Maintain supplier database and ratings",
            "Inventory Management - Track stock levels and inventory",
            "Imprests - Manage employee advance requests",
        ]
    },
    {
        id: "automation",
        title: "Workflow & Automation",
        description: "Streamline business processes",
        icon: react_1["default"].createElement(lucide_react_1.BookOpen, { className: "h-5 w-5" }),
        content: [
            "Workflow Automation - Set up automated business processes",
            "Approvals & Workflows - Configure multi-level approval workflows",
            "Time Tracking - Track project time and billable hours",
            "Communications - Internal messaging and team communications",
            "Notifications - Manage alerts and notification preferences",
        ]
    },
];
function Documentation() {
    var _a = react_1.useState("getting-started"), selectedSection = _a[0], setSelectedSection = _a[1];
    var current = documentation.find(function (doc) { return doc.id === selectedSection; });
    return (react_1["default"].createElement("div", { className: "min-h-screen bg-white text-gray-900" },
        react_1["default"].createElement(WebsiteNav_1.WebsiteNav, null),
        react_1["default"].createElement("section", { className: "relative pt-32 pb-16 overflow-hidden" },
            react_1["default"].createElement("div", { className: "absolute inset-0 bg-gradient-to-b from-indigo-50/80 via-white to-white" }),
            react_1["default"].createElement("div", { className: "absolute top-20 left-1/4 w-96 h-96 rounded-full bg-indigo-100/60 blur-3xl" }),
            react_1["default"].createElement("div", { className: "relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center" },
                react_1["default"].createElement("div", { className: "inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-200 bg-indigo-50 text-sm font-medium text-indigo-600 mb-6" },
                    react_1["default"].createElement(lucide_react_1.BookOpen, { className: "w-3.5 h-3.5" }),
                    "Knowledge Base"),
                react_1["default"].createElement("h1", { className: "text-4xl sm:text-5xl font-bold tracking-tight mb-6" },
                    react_1["default"].createElement("span", { className: "bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent" }, "Documentation")),
                react_1["default"].createElement("p", { className: "text-lg text-gray-500 max-w-2xl mx-auto" }, "Comprehensive guides for using Kiini to its full potential"))),
        react_1["default"].createElement("section", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24" },
            react_1["default"].createElement("div", { className: "grid grid-cols-1 lg:grid-cols-4 gap-6" },
                react_1["default"].createElement("div", { className: "lg:col-span-1" },
                    react_1["default"].createElement("div", { className: "sticky top-4 space-y-2" }, documentation.map(function (doc) { return (react_1["default"].createElement("button", { key: doc.id, onClick: function () { return setSelectedSection(doc.id); }, className: "w-full text-left px-4 py-3 rounded-lg transition-all " + (selectedSection === doc.id
                            ? "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-medium border-l-4 border-blue-600"
                            : "text-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800") },
                        react_1["default"].createElement("div", { className: "flex items-center gap-3" },
                            react_1["default"].createElement("span", null, doc.title)))); }))),
                react_1["default"].createElement("div", { className: "lg:col-span-3" }, current && (react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, null,
                        react_1["default"].createElement("div", { className: "flex items-center gap-3 mb-2" },
                            react_1["default"].createElement("div", { className: "text-blue-600" }, current.icon),
                            react_1["default"].createElement(card_1.CardTitle, null, current.title)),
                        react_1["default"].createElement(card_1.CardDescription, null, current.description)),
                    react_1["default"].createElement(card_1.CardContent, { className: "space-y-4" },
                        react_1["default"].createElement("div", { className: "grid gap-3" }, current.content.map(function (item, idx) { return (react_1["default"].createElement("div", { key: item || "doc-" + idx, className: "flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer" },
                            react_1["default"].createElement(lucide_react_1.ArrowRight, { className: "h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" }),
                            react_1["default"].createElement("span", { className: "text-sm text-gray-700 dark:text-gray-300" }, item))); })),
                        react_1["default"].createElement("div", { className: "mt-6 pt-6 border-t" },
                            react_1["default"].createElement("p", { className: "text-sm text-gray-600 dark:text-gray-400 mb-4" }, "Need more help? Check our User Guide or contact support."),
                            react_1["default"].createElement("div", { className: "flex gap-3" },
                                react_1["default"].createElement(button_1.Button, { variant: "outline", size: "sm", asChild: true },
                                    react_1["default"].createElement("a", { href: "/user-guide", className: "flex items-center gap-2" },
                                        react_1["default"].createElement(lucide_react_1.BookOpen, { className: "h-4 w-4" }),
                                        "User Guide")),
                                react_1["default"].createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return window.open("https://www.youtube.com/results?search_query=crm+training+tutorials", "_blank"); } },
                                    react_1["default"].createElement(lucide_react_1.ExternalLink, { className: "h-4 w-4 mr-2" }),
                                    "Video Tutorials"))))))))),
        react_1["default"].createElement(WebsiteFooter_1.WebsiteFooter, null)));
}
exports["default"] = Documentation;
