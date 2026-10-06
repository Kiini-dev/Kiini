"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var WebsiteNav_1 = require("./WebsiteNav");
var WebsiteFooter_1 = require("./WebsiteFooter");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
var trpc_1 = require("@/lib/trpc");
// Module demo mockup component
function ModuleDemoMockup(_a) {
    var moduleName = _a.moduleName, color = _a.color;
    var colorMap = {
        "CRM": { icon: "📊", accentClass: "bg-blue-50 border-blue-200" },
        "Finance": { icon: "💰", accentClass: "bg-emerald-50 border-emerald-200" },
        "HR": { icon: "👥", accentClass: "bg-violet-50 border-violet-200" },
        "Projects": { icon: "📋", accentClass: "bg-amber-50 border-amber-200" },
        "Procurement": { icon: "📦", accentClass: "bg-rose-50 border-rose-200" },
        "Templates": { icon: "📄", accentClass: "bg-slate-50 border-slate-200" },
        "Analytics": { icon: "📈", accentClass: "bg-cyan-50 border-cyan-200" },
        "Communications": { icon: "💬", accentClass: "bg-sky-50 border-sky-200" }
    };
    var moduleKey = moduleName.split("&")[0].trim();
    var _b = colorMap[moduleKey] || { icon: "📱", accentClass: "bg-gray-50 border-gray-200" }, icon = _b.icon, accentClass = _b.accentClass;
    return (react_1["default"].createElement("div", { className: "rounded-xl border border-gray-200 bg-gradient-to-b from-gray-50 to-white p-6 hover:shadow-lg transition-shadow" },
        react_1["default"].createElement("div", { className: "mb-4 flex items-center justify-between rounded-lg bg-white p-3 border " + accentClass },
            react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                react_1["default"].createElement("div", { className: "h-6 w-6 rounded flex items-center justify-center text-lg" }, icon),
                react_1["default"].createElement("div", { className: "flex flex-col gap-1" },
                    react_1["default"].createElement("div", { className: "h-2 w-24 bg-gray-200 rounded" }),
                    react_1["default"].createElement("div", { className: "h-1.5 w-16 bg-gray-100 rounded" }))),
            react_1["default"].createElement("div", { className: "flex gap-1" },
                react_1["default"].createElement("div", { className: "h-2 w-2 bg-gray-300 rounded-full" }),
                react_1["default"].createElement("div", { className: "h-2 w-2 bg-gray-300 rounded-full" }),
                react_1["default"].createElement("div", { className: "h-2 w-2 bg-gray-300 rounded-full" }))),
        react_1["default"].createElement("div", { className: "space-y-3 mb-4" }, [40, 50, 45].map(function (_, i) { return (react_1["default"].createElement("div", { key: i, className: "space-y-1.5" },
            react_1["default"].createElement("div", { className: "h-2 w-full bg-gray-200 rounded" }),
            react_1["default"].createElement("div", { className: "flex gap-2" },
                react_1["default"].createElement("div", { className: "h-1.5 bg-gray-100 rounded flex-1" }),
                react_1["default"].createElement("div", { className: "h-1.5 bg-gray-100 rounded flex-1" })))); })),
        react_1["default"].createElement("div", { className: "flex items-center justify-between pt-3 border-t border-gray-100" },
            react_1["default"].createElement("span", { className: "text-xs text-gray-400" }, "Interactive Demo Available"),
            react_1["default"].createElement("div", { className: "flex gap-1" },
                react_1["default"].createElement("div", { className: "h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse" }),
                react_1["default"].createElement("span", { className: "text-[10px] text-emerald-600 font-semibold" }, "LIVE")))));
}
var ICON_MAP = { Users: lucide_react_1.Users, DollarSign: lucide_react_1.DollarSign, UserCog: lucide_react_1.UserCog, Briefcase: lucide_react_1.Briefcase, ShoppingCart: lucide_react_1.ShoppingCart, BarChart3: lucide_react_1.BarChart3, Calendar: lucide_react_1.Calendar, Ticket: lucide_react_1.Ticket, MessageSquare: lucide_react_1.MessageSquare, FileCheck: lucide_react_1.FileCheck, Target: lucide_react_1.Target, Sparkles: lucide_react_1.Sparkles, Shield: lucide_react_1.Shield, Globe: lucide_react_1.Globe, Zap: lucide_react_1.Zap, Activity: lucide_react_1.Activity, Layers: lucide_react_1.Layers };
var DEFAULT_FEATURE_SECTIONS = [
    {
        category: "CRM & Sales",
        icon: lucide_react_1.Users,
        color: "from-blue-500 to-blue-600",
        accent: "text-blue-600",
        border: "border-blue-200",
        bg: "bg-blue-50/50",
        desc: "A complete client relationship and sales pipeline — from first contact to closed deal.",
        features: [
            "Client & contact management with full interaction history",
            "Visual pipeline with custom stages",
            "Opportunity tracking and forecasting",
            "Product catalog with pricing and discounts",
            "Quotations and proposals",
            "Activity logging (calls, emails, meetings)",
            "Lead source attribution and conversion tracking",
        ]
    },
    {
        category: "Finance & Billing",
        icon: lucide_react_1.DollarSign,
        color: "from-emerald-500 to-teal-600",
        accent: "text-emerald-600",
        border: "border-emerald-200",
        bg: "bg-emerald-50/50",
        desc: "End-to-end financial operations — from invoicing to chart of accounts.",
        features: [
            "Invoice creation with itemized line items",
            "Recurring invoice schedules",
            "M-Pesa, Stripe, and bank payment integration",
            "Payment tracking and receipt management",
            "Expense management and approvals",
            "Journal entries and chart of accounts",
            "Profit & Loss, Balance Sheet, Trial Balance",
            "Tax management and VAT reporting",
        ]
    },
    {
        category: "HR & Payroll",
        icon: lucide_react_1.UserCog,
        color: "from-violet-500 to-purple-600",
        accent: "text-violet-600",
        border: "border-violet-200",
        bg: "bg-violet-50/50",
        desc: "Complete workforce management from hiring to payroll disbursement.",
        features: [
            "Employee records with document management",
            "Department and job group hierarchy",
            "Leave application, approvals, and balances",
            "Attendance tracking with clock in/out",
            "Payroll calculation (basic, allowances, deductions)",
            "PAYE, NHIF, NSSF, HELB statutory deductions",
            "Payslip generation and bulk email delivery",
            "Performance reviews and appraisals",
        ]
    },
    {
        category: "Projects & Work Orders",
        icon: lucide_react_1.Briefcase,
        color: "from-amber-500 to-orange-600",
        accent: "text-amber-600",
        border: "border-amber-200",
        bg: "bg-amber-50/50",
        desc: "Deliver projects on time and on budget with complete visibility.",
        features: [
            "Project creation with milestones and phases",
            "Task assignment with priorities and deadlines",
            "Time tracking per task and team member",
            "Budget vs actual cost tracking",
            "Work order management with field assignments",
            "Kanban and list views",
            "Team collaboration and file attachments",
        ]
    },
    {
        category: "Procurement",
        icon: lucide_react_1.ShoppingCart,
        color: "from-rose-500 to-red-600",
        accent: "text-rose-600",
        border: "border-rose-200",
        bg: "bg-rose-50/50",
        desc: "Streamline purchasing from requisition to goods delivery.",
        features: [
            "Purchase requisitions with approval workflows",
            "Local Purchase Orders (LPO) generation",
            "Supplier management and vendor ratings",
            "Goods Received Notes (GRN)",
            "Invoice matching and reconciliation",
            "Procurement budget tracking",
            "Inventory and stock management",
        ]
    },
    {
        category: "Templates & Documents",
        icon: lucide_react_1.FileCheck,
        color: "from-slate-500 to-gray-700",
        accent: "text-slate-700",
        border: "border-slate-200",
        bg: "bg-slate-50/50",
        desc: "Create, reuse and automate document templates across the platform.",
        features: [
            "Unified template system across modules (invoices, proposals, contracts)",
            "Default templates per organization and document type",
            "Email & SMS templates with variable placeholders",
            "Recurring invoice templates and template-based billing",
            "Generate PDFs from saved templates and export/print",
        ]
    },
    {
        category: "Analytics & Reports",
        icon: lucide_react_1.BarChart3,
        color: "from-cyan-500 to-blue-600",
        accent: "text-cyan-600",
        border: "border-cyan-200",
        bg: "bg-cyan-50/50",
        desc: "Real-time dashboards and reports across every business function.",
        features: [
            "Executive dashboard with KPI widgets",
            "Revenue, expense, and profit trend charts",
            "Sales pipeline and conversion reports",
            "HR headcount and payroll reports",
            "Project completion and time reports",
            "Custom report builder",
            "Scheduled automated report delivery",
        ]
    },
    {
        category: "AI Hub",
        icon: lucide_react_1.Sparkles,
        color: "from-violet-600 to-indigo-700",
        accent: "text-violet-600",
        border: "border-violet-200",
        bg: "bg-violet-50/50",
        desc: "AI-powered assistance across all modules to speed up your workflows.",
        features: [
            "AI document drafting (proposals, contracts, emails)",
            "Data analysis and anomaly detection",
            "Smart invoice categorization",
            "Predictive cash flow insights",
            "Natural language data queries",
            "AI-assisted performance reviews",
        ]
    },
    {
        category: "Communications",
        icon: lucide_react_1.MessageSquare,
        color: "from-sky-500 to-cyan-600",
        accent: "text-sky-600",
        border: "border-sky-200",
        bg: "bg-sky-50/50",
        desc: "Keep your team and clients in sync with built-in messaging.",
        features: [
            "Internal team announcements",
            "Automated client notifications",
            "SMS and email dispatch",
            "Document sharing and attachments",
            "Activity feed per record",
        ]
    },
];
function Features() {
    var _a, _b;
    var _c = wouter_1.useLocation(), navigate = _c[1];
    var dbContent = trpc_1.trpc.websiteAdmin.publicFeaturesContent.useQuery(undefined, { retry: false, staleTime: 300000 }).data;
    var heroTitle = (dbContent === null || dbContent === void 0 ? void 0 : dbContent.heroTitle) || "Every feature your business demands";
    var heroBadge = (dbContent === null || dbContent === void 0 ? void 0 : dbContent.heroBadge) || "18 Modules. One Platform.";
    var heroSubtitle = (dbContent === null || dbContent === void 0 ? void 0 : dbContent.heroSubtitle) || "Kiini is not a collection of separate tools stitched together — it is one deeply integrated platform where every module shares data, permissions, and workflows.";
    var COLORS = [
        { color: "from-blue-500 to-blue-600", accent: "text-blue-600", border: "border-blue-200", bg: "bg-blue-50/50" },
        { color: "from-emerald-500 to-teal-600", accent: "text-emerald-600", border: "border-emerald-200", bg: "bg-emerald-50/50" },
        { color: "from-violet-500 to-purple-600", accent: "text-violet-600", border: "border-violet-200", bg: "bg-violet-50/50" },
        { color: "from-amber-500 to-orange-600", accent: "text-amber-600", border: "border-amber-200", bg: "bg-amber-50/50" },
        { color: "from-rose-500 to-red-600", accent: "text-rose-600", border: "border-rose-200", bg: "bg-rose-50/50" },
        { color: "from-cyan-500 to-blue-600", accent: "text-cyan-600", border: "border-cyan-200", bg: "bg-cyan-50/50" },
        { color: "from-violet-600 to-indigo-700", accent: "text-violet-600", border: "border-violet-200", bg: "bg-violet-50/50" },
        { color: "from-sky-500 to-cyan-600", accent: "text-sky-600", border: "border-sky-200", bg: "bg-sky-50/50" },
    ];
    var featureSections = ((_a = dbContent === null || dbContent === void 0 ? void 0 : dbContent.sections) === null || _a === void 0 ? void 0 : _a.length) ? dbContent.sections.map(function (s, i) { return (__assign(__assign(__assign({}, s), { icon: ICON_MAP[s.icon] || lucide_react_1.Users }), (COLORS[i % COLORS.length]))); })
        : DEFAULT_FEATURE_SECTIONS;
    var defaultPillars = [
        { icon: lucide_react_1.Shield, title: "Security First", desc: "RBAC, MFA, audit logs, encryption at rest and in transit." },
        { icon: lucide_react_1.Zap, title: "Performance", desc: "Fast, responsive UI optimised for real workloads at scale." },
        { icon: lucide_react_1.Globe, title: "Multi-tenant", desc: "Full data isolation between organisations on one deployment." },
        { icon: lucide_react_1.Activity, title: "Reliability", desc: "99.9% uptime SLA with automated failover and backups." },
    ];
    var pillars = ((_b = dbContent === null || dbContent === void 0 ? void 0 : dbContent.pillars) === null || _b === void 0 ? void 0 : _b.length) ? dbContent.pillars.map(function (p) { return (__assign(__assign({}, p), { icon: ICON_MAP[p.icon] || lucide_react_1.Shield })); })
        : defaultPillars;
    return (react_1["default"].createElement("div", { className: "min-h-screen bg-white text-gray-900 overflow-x-hidden" },
        react_1["default"].createElement(WebsiteNav_1.WebsiteNav, null),
        react_1["default"].createElement("section", { className: "relative pt-32 pb-20 lg:pt-44 lg:pb-28 overflow-hidden bg-gradient-to-b from-indigo-50/80 via-white to-white" },
            react_1["default"].createElement("div", { className: "absolute inset-0 -z-10" },
                react_1["default"].createElement("div", { className: "absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-indigo-100/60 rounded-full blur-3xl" })),
            react_1["default"].createElement("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center" },
                react_1["default"].createElement(badge_1.Badge, { className: "mb-6 bg-indigo-50 text-indigo-600 border border-indigo-200" },
                    react_1["default"].createElement(lucide_react_1.Layers, { className: "mr-1.5 h-3 w-3" }),
                    " ",
                    heroBadge),
                react_1["default"].createElement("h1", { className: "text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-none" }, heroTitle),
                react_1["default"].createElement("p", { className: "text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed" }, heroSubtitle),
                react_1["default"].createElement(button_1.Button, { size: "lg", className: "bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-6 text-lg shadow-lg shadow-indigo-200", onClick: function () { return navigate("/login"); } },
                    "Access the Platform ",
                    react_1["default"].createElement(lucide_react_1.ArrowRight, { className: "ml-2 h-5 w-5" })))),
        react_1["default"].createElement("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32" },
            react_1["default"].createElement("div", { className: "grid md:grid-cols-2 lg:grid-cols-3 gap-6" }, featureSections.map(function (section, idx) {
                var Icon = section.icon;
                var featureId = section.category.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and');
                return (react_1["default"].createElement("button", { key: section.category, onClick: function () { return navigate("/features/" + featureId); }, className: utils_1.cn("group text-left rounded-2xl border p-6 transition-all duration-300 transform hover:scale-105 hover:shadow-xl cursor-pointer", "hover:border-transparent hover:-translate-y-1", section.border, section.bg) },
                    react_1["default"].createElement("div", { className: "flex items-start gap-3 mb-4" },
                        react_1["default"].createElement("div", { className: utils_1.cn("flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shrink-0 shadow-lg", section.color) },
                            react_1["default"].createElement(Icon, { className: "h-5 w-5 text-white" })),
                        react_1["default"].createElement("h3", { className: "text-lg font-bold leading-tight group-hover:text-indigo-600 transition-colors" }, section.category)),
                    react_1["default"].createElement("p", { className: "text-sm text-gray-600 mb-4 line-clamp-2 group-hover:text-gray-700" }, section.desc),
                    react_1["default"].createElement("div", { className: "mb-4" },
                        react_1["default"].createElement("span", { className: utils_1.cn("inline-block text-xs font-semibold px-3 py-1 rounded-full", section.bg, section.accent) },
                            section.features.length,
                            " features")),
                    react_1["default"].createElement("div", { className: "space-y-2 mb-4" },
                        section.features.slice(0, 3).map(function (f) { return (react_1["default"].createElement("div", { key: f, className: "flex items-start gap-2" },
                            react_1["default"].createElement(lucide_react_1.CheckCircle, { className: utils_1.cn("h-3 w-3 shrink-0 mt-0.5", section.accent) }),
                            react_1["default"].createElement("span", { className: "text-xs text-gray-600 line-clamp-1" }, f))); }),
                        section.features.length > 3 && (react_1["default"].createElement("div", { className: "text-xs text-indigo-600 font-semibold pt-2" },
                            "+",
                            section.features.length - 3,
                            " more features \u2192"))),
                    react_1["default"].createElement("div", { className: "flex items-center justify-between pt-4 border-t border-gray-200/50 group-hover:border-indigo-200" },
                        react_1["default"].createElement("span", { className: "text-xs font-semibold text-gray-400 group-hover:text-indigo-600" }, "Learn more"),
                        react_1["default"].createElement(lucide_react_1.ArrowRight, { className: "h-4 w-4 text-gray-300 group-hover:text-indigo-600 transition-all transform group-hover:translate-x-1" }))));
            }))),
        react_1["default"].createElement("section", { className: "py-24 border-t border-gray-100 bg-gray-50/50" },
            react_1["default"].createElement("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center" },
                react_1["default"].createElement("p", { className: "text-xs uppercase tracking-widest text-indigo-600 font-semibold mb-3" }, "Platform fundamentals"),
                react_1["default"].createElement("h2", { className: "text-4xl md:text-5xl font-black mb-14" }, "Solid foundations, every layer"),
                react_1["default"].createElement("div", { className: "grid sm:grid-cols-2 lg:grid-cols-4 gap-6" }, pillars.map(function (p) {
                    var Icon = typeof p.icon === 'string' ? (ICON_MAP[p.icon] || lucide_react_1.Shield) : p.icon;
                    return (react_1["default"].createElement("div", { key: p.title, className: "rounded-2xl border border-gray-200 bg-white p-7 text-center hover:shadow-lg hover:border-indigo-300 transition-all" },
                        react_1["default"].createElement("div", { className: "inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 mb-5" },
                            react_1["default"].createElement(Icon, { className: "h-6 w-6 text-indigo-600" })),
                        react_1["default"].createElement("h3", { className: "text-lg font-bold mb-2" }, p.title),
                        react_1["default"].createElement("p", { className: "text-sm text-gray-500 leading-relaxed" }, p.desc)));
                })))),
        react_1["default"].createElement("section", { className: "py-24 bg-gradient-to-b from-white to-indigo-50/50" },
            react_1["default"].createElement("div", { className: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8" },
                react_1["default"].createElement("div", { className: "text-center mb-12" },
                    react_1["default"].createElement("h2", { className: "text-4xl font-black mb-5" }, "See it in action"),
                    react_1["default"].createElement("p", { className: "text-gray-500 text-lg" }, "Request a demo and we will walk you through every module, or explore our pricing.")),
                react_1["default"].createElement("div", { className: "grid sm:grid-cols-3 gap-4" },
                    react_1["default"].createElement(button_1.Button, { size: "lg", className: "bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 shadow-lg shadow-indigo-200 h-auto flex-col", onClick: function () { return navigate("/book-a-demo"); } },
                        react_1["default"].createElement("span", { className: "text-base" }, "Book a Demo"),
                        react_1["default"].createElement("span", { className: "text-xs opacity-90 mt-1" }, "Schedule your walkthrough")),
                    react_1["default"].createElement(button_1.Button, { size: "lg", className: "bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 shadow-lg shadow-indigo-200 h-auto flex-col", onClick: function () { return navigate("/pricing"); } },
                        react_1["default"].createElement("span", { className: "text-base" }, "View Pricing"),
                        react_1["default"].createElement("span", { className: "text-xs opacity-90 mt-1" }, "Explore our plans")),
                    react_1["default"].createElement(button_1.Button, { size: "lg", variant: "outline", className: "border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-indigo-300 px-8 py-6 h-auto flex-col", onClick: function () { return navigate("/contact"); } },
                        react_1["default"].createElement("span", { className: "text-base" }, "Get Support"),
                        react_1["default"].createElement("span", { className: "text-xs text-gray-500 mt-1" }, "Have questions?"))))),
        react_1["default"].createElement(WebsiteFooter_1.WebsiteFooter, null)));
}
exports["default"] = Features;
