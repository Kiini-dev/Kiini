"use strict";
exports.__esModule = true;
var react_1 = require("react");
var WebsiteNav_1 = require("@/pages/website/WebsiteNav");
var WebsiteFooter_1 = require("@/pages/website/WebsiteFooter");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var tabs_1 = require("@/components/ui/tabs");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var stats_card_1 = require("@/components/ui/stats-card");
/**
 * Demo Dashboard
 * Showcases all features and modules available in the Kiini CRM
 * Designed for marketing, testing, and onboarding new users
 */
function DemoPage() {
    var _a = react_1.useState("overview"), activeTab = _a[0], setActiveTab = _a[1];
    var _b = react_1.useState(null), selectedFeature = _b[0], setSelectedFeature = _b[1];
    // Demo data
    var demoStats = {
        activeUsers: 1254,
        activeProjects: 28,
        totalRevenue: 2540000,
        pendingInvoices: 12
    };
    var demoInvoices = [
        {
            id: "1",
            number: "INV-000001",
            client: "Tech Solutions Ltd",
            amount: 125000,
            status: "sent",
            date: "2026-03-01"
        },
        {
            id: "2",
            number: "INV-000002",
            client: "Digital Agency Inc",
            amount: 89500,
            status: "pending",
            date: "2026-03-02"
        },
        {
            id: "3",
            number: "INV-000003",
            client: "Enterprise Corp",
            amount: 250000,
            status: "draft",
            date: "2026-03-03"
        },
    ];
    var demoProjects = [
        { id: "1", name: "Website Redesign", client: "Tech Solutions", status: "active", progress: 75 },
        { id: "2", name: "Mobile App Dev", client: "Digital Agency", status: "active", progress: 45 },
        { id: "3", name: "Cloud Migration", client: "Enterprise Corp", status: "on-hold", progress: 30 },
    ];
    var features = [
        {
            id: "invoices",
            title: "Invoicing",
            icon: react_1["default"].createElement(lucide_react_1.FileText, { className: "w-6 h-6" }),
            description: "Create, track, and manage invoices",
            capabilities: ["Auto-numbering", "Payment tracking", "Bulk operations", "PDF export"]
        },
        {
            id: "accounting",
            title: "Accounting",
            icon: react_1["default"].createElement(lucide_react_1.DollarSign, { className: "w-6 h-6" }),
            description: "Financial management and reporting",
            capabilities: ["Chart of Accounts", "Bank reconciliation", "Expense tracking", "Financial reports"]
        },
        {
            id: "projects",
            title: "Projects",
            icon: react_1["default"].createElement(lucide_react_1.BarChart3, { className: "w-6 h-6" }),
            description: "Project and team management",
            capabilities: ["Project tracking", "Team assignments", "Milestone management", "Budget control"]
        },
        {
            id: "hr",
            title: "Human Resources",
            icon: react_1["default"].createElement(lucide_react_1.Users, { className: "w-6 h-6" }),
            description: "Employee and payroll management",
            capabilities: ["Employee records", "Payroll processing", "Leave management", "Attendance tracking"]
        },
        {
            id: "procurement",
            title: "Procurement",
            icon: react_1["default"].createElement(lucide_react_1.TrendingUp, { className: "w-6 h-6" }),
            description: "Supply chain management",
            capabilities: ["LPO management", "Supplier tracking", "Purchase orders", "Inventory"]
        },
        {
            id: "reports",
            title: "Reports & Analytics",
            icon: react_1["default"].createElement(lucide_react_1.BarChart3, { className: "w-6 h-6" }),
            description: "Business insights and analytics",
            capabilities: ["Financial reports", "Project analytics", "Performance metrics", "Data export"]
        },
    ];
    var demoUsers = [
        { role: "Admin", email: "admin@demo.kiini", permissions: "Full system access" },
        { role: "Accountant", email: "accountant@demo.kiini", permissions: "Accounting & reports" },
        { role: "HR Manager", email: "hr@demo.kiini", permissions: "HR & payroll" },
        { role: "Project Manager", email: "pm@demo.kiini", permissions: "Projects & teams" },
        { role: "Staff", email: "staff@demo.kiini", permissions: "Limited access" },
        { role: "Client", email: "client@demo.kiini", permissions: "Client portal" },
    ];
    var handleDemoAction = function (action) {
        sonner_1.toast.success("Demo: " + action + " executed");
    };
    return (react_1["default"].createElement("div", { className: "min-h-screen bg-white text-gray-900" },
        react_1["default"].createElement(WebsiteNav_1.WebsiteNav, null),
        react_1["default"].createElement("section", { className: "relative pt-32 pb-16 overflow-hidden" },
            react_1["default"].createElement("div", { className: "absolute inset-0 bg-gradient-to-b from-indigo-50/80 via-white to-white" }),
            react_1["default"].createElement("div", { className: "absolute top-20 left-1/4 w-96 h-96 rounded-full bg-indigo-100/60 blur-3xl" }),
            react_1["default"].createElement("div", { className: "absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-violet-100/40 blur-3xl" }),
            react_1["default"].createElement("div", { className: "relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center" },
                react_1["default"].createElement("div", { className: "inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-200 bg-indigo-50 text-sm font-medium text-indigo-600 mb-6" },
                    react_1["default"].createElement(lucide_react_1.Play, { className: "w-3.5 h-3.5" }),
                    "Interactive Demo"),
                react_1["default"].createElement("h1", { className: "text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6" },
                    react_1["default"].createElement("span", { className: "bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent" }, "Experience Kiini")),
                react_1["default"].createElement("p", { className: "text-lg sm:text-xl text-gray-500 max-w-3xl mx-auto" }, "Explore every module and feature in our interactive demo. See how Kiini transforms your business operations."))),
        react_1["default"].createElement("section", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24" },
            react_1["default"].createElement(tabs_1.Tabs, { value: activeTab, onValueChange: setActiveTab, className: "space-y-6" },
                react_1["default"].createElement(tabs_1.TabsList, { className: "grid w-full grid-cols-4" },
                    react_1["default"].createElement(tabs_1.TabsTrigger, { value: "overview" }, "Overview"),
                    react_1["default"].createElement(tabs_1.TabsTrigger, { value: "features" }, "Features"),
                    react_1["default"].createElement(tabs_1.TabsTrigger, { value: "interactive" }, "Interactive Demo"),
                    react_1["default"].createElement(tabs_1.TabsTrigger, { value: "accounts" }, "Demo Accounts")),
                react_1["default"].createElement(tabs_1.TabsContent, { value: "overview", className: "space-y-6" },
                    react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4" },
                        react_1["default"].createElement(stats_card_1.StatsCard, { label: "Active Users", value: demoStats.activeUsers, description: "Across all roles", icon: react_1["default"].createElement(lucide_react_1.Users, { className: "h-5 w-5" }), color: "border-l-blue-500" }),
                        react_1["default"].createElement(stats_card_1.StatsCard, { label: "Active Projects", value: demoStats.activeProjects, description: "In progress", icon: react_1["default"].createElement(lucide_react_1.BarChart3, { className: "h-5 w-5" }), color: "border-l-green-500" }),
                        react_1["default"].createElement(stats_card_1.StatsCard, { label: "Total Revenue", value: react_1["default"].createElement(react_1["default"].Fragment, null,
                                "Ksh ",
                                (demoStats.totalRevenue / 1000).toFixed(0),
                                "K"), description: "This period", icon: react_1["default"].createElement(lucide_react_1.DollarSign, { className: "h-5 w-5" }), color: "border-l-green-500" }),
                        react_1["default"].createElement(stats_card_1.StatsCard, { label: "Pending Invoices", value: demoStats.pendingInvoices, description: "Awaiting action", icon: react_1["default"].createElement(lucide_react_1.AlertCircle, { className: "h-5 w-5" }), color: "border-l-orange-500" })),
                    react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6" },
                        react_1["default"].createElement(card_1.Card, null,
                            react_1["default"].createElement(card_1.CardHeader, null,
                                react_1["default"].createElement(card_1.CardTitle, null, "Recent Invoices"),
                                react_1["default"].createElement(card_1.CardDescription, null, "Latest invoice activity")),
                            react_1["default"].createElement(card_1.CardContent, null,
                                react_1["default"].createElement("div", { className: "space-y-4" }, demoInvoices.map(function (invoice) { return (react_1["default"].createElement("div", { key: invoice.id, className: "flex items-center justify-between p-3 border rounded" },
                                    react_1["default"].createElement("div", { className: "flex-1" },
                                        react_1["default"].createElement("p", { className: "font-medium" }, invoice.number),
                                        react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" }, invoice.client)),
                                    react_1["default"].createElement("div", { className: "text-right" },
                                        react_1["default"].createElement("p", { className: "font-semibold" },
                                            "Ksh ",
                                            invoice.amount.toLocaleString()),
                                        react_1["default"].createElement(badge_1.Badge, { variant: "outline", className: "text-xs" }, invoice.status.toUpperCase())))); })),
                                react_1["default"].createElement(button_1.Button, { className: "w-full mt-4", onClick: function () { return sonner_1.toast.info("Navigate to Invoices from the sidebar"); } }, "View All Invoices"))),
                        react_1["default"].createElement(card_1.Card, null,
                            react_1["default"].createElement(card_1.CardHeader, null,
                                react_1["default"].createElement(card_1.CardTitle, null, "Active Projects"),
                                react_1["default"].createElement(card_1.CardDescription, null, "Current project status")),
                            react_1["default"].createElement(card_1.CardContent, null,
                                react_1["default"].createElement("div", { className: "space-y-4" }, demoProjects.map(function (project) { return (react_1["default"].createElement("div", { key: project.id, className: "p-3 border rounded" },
                                    react_1["default"].createElement("div", { className: "flex items-center justify-between mb-2" },
                                        react_1["default"].createElement("p", { className: "font-medium" }, project.name),
                                        react_1["default"].createElement(badge_1.Badge, { variant: project.status === "active" ? "default" : "secondary" }, project.status)),
                                    react_1["default"].createElement("p", { className: "text-sm text-muted-foreground mb-2" }, project.client),
                                    react_1["default"].createElement("div", { className: "w-full bg-gray-200 rounded-full h-2" },
                                        react_1["default"].createElement("div", { className: "bg-blue-600 h-2 rounded-full", style: { width: project.progress + "%" } })),
                                    react_1["default"].createElement("p", { className: "text-xs text-right mt-1" },
                                        project.progress,
                                        "%"))); })),
                                react_1["default"].createElement(button_1.Button, { className: "w-full mt-4", onClick: function () { return sonner_1.toast.info("Navigate to Projects from the sidebar"); } }, "View All Projects"))))),
                react_1["default"].createElement(tabs_1.TabsContent, { value: "features", className: "space-y-6" },
                    react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" }, features.map(function (feature) { return (react_1["default"].createElement(card_1.Card, { key: feature.id, className: "cursor-pointer hover:shadow-lg transition-shadow", onClick: function () { return setSelectedFeature(feature.id); } },
                        react_1["default"].createElement(card_1.CardHeader, null,
                            react_1["default"].createElement("div", { className: "flex items-center gap-2 mb-2" }, feature.icon),
                            react_1["default"].createElement(card_1.CardTitle, null, feature.title),
                            react_1["default"].createElement(card_1.CardDescription, null, feature.description)),
                        react_1["default"].createElement(card_1.CardContent, null,
                            react_1["default"].createElement("ul", { className: "space-y-2" }, feature.capabilities.map(function (cap, idx) { return (react_1["default"].createElement("li", { key: feature || "demo-" + idx, className: "text-sm flex items-center gap-2" },
                                react_1["default"].createElement(lucide_react_1.CheckCircle2, { className: "w-4 h-4 text-green-600" }),
                                cap)); }))))); }))),
                react_1["default"].createElement(tabs_1.TabsContent, { value: "interactive", className: "space-y-6" },
                    react_1["default"].createElement(card_1.Card, null,
                        react_1["default"].createElement(card_1.CardHeader, null,
                            react_1["default"].createElement(card_1.CardTitle, null, "Create Invoice Demo"),
                            react_1["default"].createElement(card_1.CardDescription, null, "Try creating an invoice with auto-generated numbering")),
                        react_1["default"].createElement(card_1.CardContent, { className: "space-y-4" },
                            react_1["default"].createElement("div", { className: "grid grid-cols-2 gap-4" },
                                react_1["default"].createElement("div", null,
                                    react_1["default"].createElement(label_1.Label, null, "Invoice Number"),
                                    react_1["default"].createElement(input_1.Input, { value: "INV-000004", disabled: true })),
                                react_1["default"].createElement("div", null,
                                    react_1["default"].createElement(label_1.Label, null, "Client"),
                                    react_1["default"].createElement(input_1.Input, { placeholder: "Select client..." })),
                                react_1["default"].createElement("div", null,
                                    react_1["default"].createElement(label_1.Label, null, "Amount (KES)"),
                                    react_1["default"].createElement(input_1.Input, { type: "number", placeholder: "0.00" })),
                                react_1["default"].createElement("div", null,
                                    react_1["default"].createElement(label_1.Label, null, "Due Date"),
                                    react_1["default"].createElement(input_1.Input, { type: "date" }))),
                            react_1["default"].createElement(button_1.Button, { onClick: function () { return handleDemoAction("Invoice created"); }, className: "w-full" },
                                react_1["default"].createElement(lucide_react_1.Plus, { className: "w-4 h-4 mr-2" }),
                                "Create Invoice"))),
                    react_1["default"].createElement(card_1.Card, null,
                        react_1["default"].createElement(card_1.CardHeader, null,
                            react_1["default"].createElement(card_1.CardTitle, null, "CRUD Operations Demo"),
                            react_1["default"].createElement(card_1.CardDescription, null, "Interactive example of Create, Read, Update, Delete operations")),
                        react_1["default"].createElement(card_1.CardContent, null,
                            react_1["default"].createElement("div", { className: "space-y-4" }, [
                                { icon: react_1["default"].createElement(lucide_react_1.Plus, { className: "w-4 h-4" }), label: "Create new record", action: "Create" },
                                { icon: react_1["default"].createElement(lucide_react_1.Eye, { className: "w-4 h-4" }), label: "View records", action: "View" },
                                { icon: react_1["default"].createElement(lucide_react_1.Edit2, { className: "w-4 h-4" }), label: "Edit record", action: "Edit" },
                                { icon: react_1["default"].createElement(lucide_react_1.Trash2, { className: "w-4 h-4" }), label: "Delete record", action: "Delete" },
                            ].map(function (item) { return (react_1["default"].createElement(button_1.Button, { key: item.action, variant: "outline", className: "w-full justify-start", onClick: function () { return handleDemoAction(item.action + " action executed"); } },
                                item.icon,
                                react_1["default"].createElement("span", { className: "ml-2" }, item.label))); }))))),
                react_1["default"].createElement(tabs_1.TabsContent, { value: "accounts", className: "space-y-6" },
                    react_1["default"].createElement(card_1.Card, null,
                        react_1["default"].createElement(card_1.CardHeader, null,
                            react_1["default"].createElement(card_1.CardTitle, null, "Demo User Accounts"),
                            react_1["default"].createElement(card_1.CardDescription, null, "Use these accounts to test different features and permissions")),
                        react_1["default"].createElement(card_1.CardContent, null,
                            react_1["default"].createElement("div", { className: "space-y-4" }, demoUsers.map(function (user, idx) { return (react_1["default"].createElement(card_1.Card, { key: user.email || "user-" + idx, className: "p-4" },
                                react_1["default"].createElement("div", { className: "space-y-2" },
                                    react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                                        react_1["default"].createElement("h4", { className: "font-semibold" }, user.role),
                                        react_1["default"].createElement(badge_1.Badge, null, user.permissions)),
                                    react_1["default"].createElement("div", { className: "text-sm" },
                                        react_1["default"].createElement("p", { className: "text-muted-foreground" },
                                            "Email: ",
                                            user.email),
                                        react_1["default"].createElement("p", { className: "text-muted-foreground" },
                                            "Password: ",
                                            react_1["default"].createElement("code", null, "Demo@123"))),
                                    react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", onClick: function () {
                                            navigator.clipboard.writeText(user.email);
                                            sonner_1.toast.success("Email copied to clipboard");
                                        } }, "Copy Email")))); })))),
                    react_1["default"].createElement(card_1.Card, null,
                        react_1["default"].createElement(card_1.CardHeader, null,
                            react_1["default"].createElement(card_1.CardTitle, null, "Feature Access by Role"),
                            react_1["default"].createElement(card_1.CardDescription, null, "Which features each role can access")),
                        react_1["default"].createElement(card_1.CardContent, null,
                            react_1["default"].createElement("div", { className: "space-y-3 text-sm" },
                                react_1["default"].createElement("p", null,
                                    react_1["default"].createElement("strong", null, "Admin:"),
                                    " Full access to all modules and features"),
                                react_1["default"].createElement("p", null,
                                    react_1["default"].createElement("strong", null, "Accountant:"),
                                    " Accounting, invoices, payments, reports, and bank reconciliation"),
                                react_1["default"].createElement("p", null,
                                    react_1["default"].createElement("strong", null, "HR Manager:"),
                                    " Employee records, payroll, leave, attendance"),
                                react_1["default"].createElement("p", null,
                                    react_1["default"].createElement("strong", null, "Project Manager:"),
                                    " Projects, teams, clients, budgets, and reports"),
                                react_1["default"].createElement("p", null,
                                    react_1["default"].createElement("strong", null, "Staff:"),
                                    " Projects, attendance, leave requests, limited reports"),
                                react_1["default"].createElement("p", null,
                                    react_1["default"].createElement("strong", null, "Client:"),
                                    " Client portal - view projects, invoices, and documents"))))))),
        react_1["default"].createElement("section", { className: "border-t border-gray-100 bg-gradient-to-b from-gray-50/50 to-white" },
            react_1["default"].createElement("div", { className: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center" },
                react_1["default"].createElement(lucide_react_1.Sparkles, { className: "w-8 h-8 text-indigo-600 mx-auto mb-4" }),
                react_1["default"].createElement("h2", { className: "text-3xl font-bold mb-4" }, "Ready to get started?"),
                react_1["default"].createElement("p", { className: "text-gray-500 mb-8 max-w-xl mx-auto" }, "Sign up for a free trial and experience the full power of Kiini with your own data."),
                react_1["default"].createElement("div", { className: "flex items-center justify-center gap-4" },
                    react_1["default"].createElement("a", { href: "/signup" },
                        react_1["default"].createElement(button_1.Button, { size: "lg", className: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200" }, "Start Free Trial")),
                    react_1["default"].createElement("a", { href: "/contact" },
                        react_1["default"].createElement(button_1.Button, { size: "lg", variant: "outline", className: "border-gray-300 text-gray-700 hover:bg-gray-50" }, "Contact Sales"))))),
        react_1["default"].createElement(WebsiteFooter_1.WebsiteFooter, null)));
}
exports["default"] = DemoPage;
