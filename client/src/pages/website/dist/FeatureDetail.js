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
var ICON_MAP = {
    Users: lucide_react_1.Users, DollarSign: lucide_react_1.DollarSign, UserCog: lucide_react_1.UserCog, Briefcase: lucide_react_1.Briefcase, ShoppingCart: lucide_react_1.ShoppingCart, BarChart3: lucide_react_1.BarChart3,
    Calendar: lucide_react_1.Calendar, Ticket: lucide_react_1.Ticket, MessageSquare: lucide_react_1.MessageSquare, FileCheck: lucide_react_1.FileCheck, Target: lucide_react_1.Target, Sparkles: lucide_react_1.Sparkles,
    Shield: lucide_react_1.Shield, Globe: lucide_react_1.Globe, Zap: lucide_react_1.Zap, Activity: lucide_react_1.Activity, Layers: lucide_react_1.Layers, Lightbulb: lucide_react_1.Lightbulb, Code: lucide_react_1.Code, Gauge: lucide_react_1.Gauge, Lock: lucide_react_1.Lock, Smartphone: lucide_react_1.Smartphone
};
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
        ],
        benefits: [
            "Increase sales team productivity by 40%",
            "Reduce sales cycle by up to 30%",
            "Improve customer retention with better relationships",
            "Data-driven sales forecasting",
        ],
        useCases: [
            "B2B sales teams managing complex pipelines",
            "Consulting firms tracking client engagements",
            "E-commerce businesses managing customer relationships",
            "Service providers coordinating multiple opportunities",
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
        ],
        benefits: [
            "Automate 90% of invoicing tasks",
            "Reduce accounting errors with integrated bookkeeping",
            "Achieve 100% audit trail compliance",
            "Accelerate cash flow with online payments",
        ],
        useCases: [
            "Accounting firms managing multiple clients",
            "SaaS companies with recurring billing",
            "Manufacturing businesses tracking expenses",
            "Non-profits maintaining financial compliance",
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
        ],
        benefits: [
            "Reduce payroll processing time from days to minutes",
            "Eliminate manual leave tracking errors",
            "Ensure statutory compliance automatically",
            "Improve employee engagement with self-service portal",
        ],
        useCases: [
            "Medium to large enterprises with diverse workforce",
            "Multinational companies requiring multi-currency payroll",
            "Organizations with high employee turnover",
            "Educational institutions managing staff",
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
        ],
        benefits: [
            "Deliver 25% more projects on time",
            "Reduce project costs through better resource allocation",
            "Improve team collaboration with real-time updates",
            "Increase project profitability",
        ],
        useCases: [
            "Construction and engineering firms",
            "IT services and software development teams",
            "Creative agencies managing client projects",
            "Field service companies tracking work orders",
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
        ],
        benefits: [
            "Reduce procurement cycle time by 50%",
            "Save 15-20% on procurement costs",
            "Prevent unauthorized purchases",
            "Optimize supplier relationships",
        ],
        useCases: [
            "Manufacturing companies managing supply chains",
            "Retail businesses purchasing inventory",
            "Corporate offices ordering supplies",
            "Healthcare facilities procuring medical supplies",
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
        ],
        benefits: [
            "Save time on document creation",
            "Ensure brand consistency across communications",
            "Reduce documentation errors",
            "Speed up repetitive workflows",
        ],
        useCases: [
            "Professional services firms",
            "Sales teams managing proposals",
            "Legal firms managing contracts",
            "Finance teams automating invoicing",
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
        ],
        benefits: [
            "Make data-driven decisions faster",
            "Identify trends and opportunities in real-time",
            "Reduce report generation time from hours to minutes",
            "Share insights across the organization automatically",
        ],
        useCases: [
            "Executive management for strategic planning",
            "Department heads monitoring performance",
            "Finance teams tracking KPIs",
            "Sales managers analyzing pipeline health",
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
        ],
        benefits: [
            "Reduce manual work by 60%",
            "Improve decision-making with predictive insights",
            "Detect anomalies before they become problems",
            "Generate professional documents instantly",
        ],
        useCases: [
            "Finance teams optimizing cash flow",
            "HR managers reviewing performance",
            "Sales teams drafting proposals",
            "Finance analyzing expenses",
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
        ],
        benefits: [
            "Improve team communication by 40%",
            "Reduce email clutter with centralized messaging",
            "Ensure no important updates are missed",
            "Automate client notifications",
        ],
        useCases: [
            "Remote teams staying connected",
            "Client-facing teams notifying customers",
            "HR teams sharing announcements",
            "Sales teams coordinating with clients",
        ]
    },
];
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
    return (react_1["default"].createElement("div", { className: "rounded-2xl border border-gray-200 bg-gradient-to-b from-gray-50 to-white p-8 hover:shadow-lg transition-shadow" },
        react_1["default"].createElement("div", { className: "mb-6 flex items-center justify-between rounded-lg bg-white p-4 border " + accentClass },
            react_1["default"].createElement("div", { className: "flex items-center gap-3" },
                react_1["default"].createElement("div", { className: "h-8 w-8 rounded flex items-center justify-center text-2xl" }, icon),
                react_1["default"].createElement("div", { className: "flex flex-col gap-2" },
                    react_1["default"].createElement("div", { className: "h-3 w-28 bg-gray-200 rounded" }),
                    react_1["default"].createElement("div", { className: "h-2 w-20 bg-gray-100 rounded" }))),
            react_1["default"].createElement("div", { className: "flex gap-1.5" },
                react_1["default"].createElement("div", { className: "h-2.5 w-2.5 bg-gray-300 rounded-full" }),
                react_1["default"].createElement("div", { className: "h-2.5 w-2.5 bg-gray-300 rounded-full" }),
                react_1["default"].createElement("div", { className: "h-2.5 w-2.5 bg-gray-300 rounded-full" }))),
        react_1["default"].createElement("div", { className: "space-y-4 mb-6" }, [45, 55, 50, 40].map(function (_, i) { return (react_1["default"].createElement("div", { key: i, className: "space-y-2" },
            react_1["default"].createElement("div", { className: "h-3 w-full bg-gray-200 rounded" }),
            react_1["default"].createElement("div", { className: "flex gap-3" },
                react_1["default"].createElement("div", { className: "h-2 bg-gray-100 rounded flex-1" }),
                react_1["default"].createElement("div", { className: "h-2 bg-gray-100 rounded flex-1" }),
                react_1["default"].createElement("div", { className: "h-2 bg-gray-100 rounded w-16" })))); })),
        react_1["default"].createElement("div", { className: "flex items-center justify-between pt-4 border-t border-gray-100" },
            react_1["default"].createElement("span", { className: "text-xs text-gray-400" }, "Interactive Demo Available"),
            react_1["default"].createElement("div", { className: "flex gap-1.5 items-center" },
                react_1["default"].createElement("div", { className: "h-2 w-2 bg-emerald-400 rounded-full animate-pulse" }),
                react_1["default"].createElement("span", { className: "text-xs text-emerald-600 font-semibold" }, "LIVE")))));
}
function FeatureDetail(_a) {
    var _b, _c;
    var params = _a.params;
    var _d = wouter_1.useLocation(), location = _d[0], navigate = _d[1];
    var dbContent = trpc_1.trpc.websiteAdmin.publicFeaturesContent.useQuery(undefined, {
        retry: false,
        staleTime: 300000
    }).data;
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
    var allFeatureSections = ((_b = dbContent === null || dbContent === void 0 ? void 0 : dbContent.sections) === null || _b === void 0 ? void 0 : _b.length) ? dbContent.sections.map(function (s, i) { return (__assign(__assign(__assign({}, s), { icon: ICON_MAP[s.icon] || lucide_react_1.Users }), (COLORS[i % COLORS.length]))); })
        : DEFAULT_FEATURE_SECTIONS;
    // Get feature ID from URL
    var featureIdFromUrl = ((_c = location.split("/features/")[1]) === null || _c === void 0 ? void 0 : _c.split("/")[0]) || "";
    // Find the matching feature
    var feature = react_1.useMemo(function () {
        return allFeatureSections.find(function (s) {
            var id = s.category.toLowerCase().replace(/\s+/g, "-").replace(/&/g, "and");
            return id === featureIdFromUrl;
        });
    }, [featureIdFromUrl, allFeatureSections]);
    if (!feature) {
        return (react_1["default"].createElement("div", { className: "min-h-screen bg-white text-gray-900 flex items-center justify-center" },
            react_1["default"].createElement(WebsiteNav_1.WebsiteNav, null),
            react_1["default"].createElement("div", { className: "text-center" },
                react_1["default"].createElement("h1", { className: "text-4xl font-bold mb-4" }, "Feature not found"),
                react_1["default"].createElement(button_1.Button, { onClick: function () { return navigate("/features"); }, className: "bg-indigo-600 hover:bg-indigo-700 text-white" }, "Back to Features")),
            react_1["default"].createElement(WebsiteFooter_1.WebsiteFooter, null)));
    }
    var Icon = feature.icon;
    return (react_1["default"].createElement("div", { className: "min-h-screen bg-white text-gray-900 overflow-x-hidden" },
        react_1["default"].createElement(WebsiteNav_1.WebsiteNav, null),
        react_1["default"].createElement("section", { className: "relative pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden" },
            react_1["default"].createElement("div", { className: utils_1.cn("absolute inset-0 -z-10 opacity-5", feature.bg) },
                react_1["default"].createElement("div", { className: "absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-b " + feature.color + " rounded-full blur-3xl" })),
            react_1["default"].createElement("div", { className: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8" },
                react_1["default"].createElement(button_1.Button, { variant: "ghost", className: "mb-6 text-gray-600 hover:text-indigo-600", onClick: function () { return navigate("/features"); } },
                    react_1["default"].createElement(lucide_react_1.ArrowLeft, { className: "mr-2 h-4 w-4" }),
                    " Back to Features"),
                react_1["default"].createElement("div", { className: "flex items-start gap-6 mb-8" },
                    react_1["default"].createElement("div", { className: utils_1.cn("flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg", feature.color) },
                        react_1["default"].createElement(Icon, { className: "h-8 w-8 text-white" })),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement(badge_1.Badge, { className: utils_1.cn("mb-3", feature.bg, feature.accent, "border-transparent") },
                            feature.features.length,
                            " core features"),
                        react_1["default"].createElement("h1", { className: "text-5xl md:text-6xl font-black leading-tight mb-4" }, feature.category),
                        react_1["default"].createElement("p", { className: "text-xl text-gray-600 max-w-2xl" }, feature.desc))))),
        react_1["default"].createElement("section", { className: "py-16 border-t border-gray-100" },
            react_1["default"].createElement("div", { className: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8" },
                react_1["default"].createElement("div", { className: "grid lg:grid-cols-3 gap-12" },
                    react_1["default"].createElement("div", { className: "lg:col-span-2" },
                        react_1["default"].createElement("div", { className: "mb-16" },
                            react_1["default"].createElement("div", { className: "flex items-center gap-3 mb-6" },
                                react_1["default"].createElement(lucide_react_1.CheckCircle, { className: utils_1.cn("h-6 w-6", feature.accent) }),
                                react_1["default"].createElement("h2", { className: "text-2xl font-bold" }, "Core Features")),
                            react_1["default"].createElement("div", { className: "grid sm:grid-cols-2 gap-3" }, feature.features.map(function (f) { return (react_1["default"].createElement("div", { key: f, className: "flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors" },
                                react_1["default"].createElement(lucide_react_1.CheckCircle, { className: utils_1.cn("h-5 w-5 shrink-0 mt-0.5", feature.accent) }),
                                react_1["default"].createElement("span", { className: "text-sm text-gray-700" }, f))); }))),
                        feature.benefits && (react_1["default"].createElement("div", { className: "mb-16" },
                            react_1["default"].createElement("div", { className: "flex items-center gap-3 mb-6" },
                                react_1["default"].createElement(lucide_react_1.Lightbulb, { className: utils_1.cn("h-6 w-6", feature.accent) }),
                                react_1["default"].createElement("h2", { className: "text-2xl font-bold" }, "Key Benefits")),
                            react_1["default"].createElement("div", { className: "grid gap-3" }, feature.benefits.map(function (b) { return (react_1["default"].createElement("div", { key: b, className: "flex items-start gap-3 p-4 rounded-lg bg-gradient-to-r from-gray-50 to-transparent border border-gray-100 hover:border-gray-200 transition-colors" },
                                react_1["default"].createElement(lucide_react_1.Zap, { className: utils_1.cn("h-5 w-5 shrink-0 mt-0.5", feature.accent) }),
                                react_1["default"].createElement("span", { className: "text-sm text-gray-700" }, b))); })))),
                        feature.useCases && (react_1["default"].createElement("div", null,
                            react_1["default"].createElement("div", { className: "flex items-center gap-3 mb-6" },
                                react_1["default"].createElement(lucide_react_1.Target, { className: utils_1.cn("h-6 w-6", feature.accent) }),
                                react_1["default"].createElement("h2", { className: "text-2xl font-bold" }, "Perfect For")),
                            react_1["default"].createElement("div", { className: "grid sm:grid-cols-2 gap-3" }, feature.useCases.map(function (use) { return (react_1["default"].createElement("div", { key: use, className: "p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all" },
                                react_1["default"].createElement("p", { className: "text-sm text-gray-700" }, use))); }))))),
                    react_1["default"].createElement("div", { className: "lg:col-span-1" },
                        react_1["default"].createElement("div", { className: "sticky top-24 space-y-6" },
                            react_1["default"].createElement("div", { className: utils_1.cn("rounded-2xl border p-6", feature.border, feature.bg) },
                                react_1["default"].createElement("h3", { className: "font-bold mb-2" }, "Ready to explore?"),
                                react_1["default"].createElement("p", { className: "text-sm text-gray-600 mb-4" },
                                    "Sign up or login to access ",
                                    feature.category),
                                react_1["default"].createElement(button_1.Button, { size: "sm", className: utils_1.cn("w-full bg-gradient-to-r", feature.color, "text-white hover:shadow-lg"), onClick: function () { return navigate("/login"); } },
                                    "Access Now ",
                                    react_1["default"].createElement(lucide_react_1.ArrowRight, { className: "ml-2 h-4 w-4" }))),
                            react_1["default"].createElement("div", { className: "space-y-3" },
                                react_1["default"].createElement("div", { className: "p-4 rounded-lg border border-gray-200 bg-white" },
                                    react_1["default"].createElement("div", { className: "flex items-center gap-2 mb-2" },
                                        react_1["default"].createElement(lucide_react_1.Code, { className: "h-4 w-4 text-gray-400" }),
                                        react_1["default"].createElement("span", { className: "text-xs font-semibold text-gray-500 uppercase" }, "Integration")),
                                    react_1["default"].createElement("p", { className: "text-sm text-gray-600" }, "Fully integrated with all other modules")),
                                react_1["default"].createElement("div", { className: "p-4 rounded-lg border border-gray-200 bg-white" },
                                    react_1["default"].createElement("div", { className: "flex items-center gap-2 mb-2" },
                                        react_1["default"].createElement(lucide_react_1.Smartphone, { className: "h-4 w-4 text-gray-400" }),
                                        react_1["default"].createElement("span", { className: "text-xs font-semibold text-gray-500 uppercase" }, "Mobile")),
                                    react_1["default"].createElement("p", { className: "text-sm text-gray-600" }, "Full mobile app support included")),
                                react_1["default"].createElement("div", { className: "p-4 rounded-lg border border-gray-200 bg-white" },
                                    react_1["default"].createElement("div", { className: "flex items-center gap-2 mb-2" },
                                        react_1["default"].createElement(lucide_react_1.Lock, { className: "h-4 w-4 text-gray-400" }),
                                        react_1["default"].createElement("span", { className: "text-xs font-semibold text-gray-500 uppercase" }, "Security")),
                                    react_1["default"].createElement("p", { className: "text-sm text-gray-600" }, "Enterprise-grade security & compliance")))))))),
        react_1["default"].createElement("section", { className: "py-16 border-t border-gray-100 bg-gray-50/50" },
            react_1["default"].createElement("div", { className: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8" },
                react_1["default"].createElement("h2", { className: "text-3xl font-bold mb-2 text-center" }, "See it in action"),
                react_1["default"].createElement("p", { className: "text-gray-600 text-center mb-10" },
                    "Interactive demo of the ",
                    feature.category,
                    " module"),
                react_1["default"].createElement(ModuleDemoMockup, { moduleName: feature.category, color: feature.color }))),
        react_1["default"].createElement("section", { className: "py-24 bg-gradient-to-b from-white to-indigo-50/50" },
            react_1["default"].createElement("div", { className: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center" },
                react_1["default"].createElement("h2", { className: "text-3xl font-bold mb-4" }, "Discover all features"),
                react_1["default"].createElement("p", { className: "text-gray-600 mb-8 max-w-xl mx-auto" },
                    feature.category,
                    " is just one part of the complete Kiini platform. Explore all ",
                    allFeatureSections.length,
                    " modules to see how they work together."),
                react_1["default"].createElement("div", { className: "flex flex-col sm:flex-row gap-4 justify-center" },
                    react_1["default"].createElement(button_1.Button, { size: "lg", className: "bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6", onClick: function () { return navigate("/features"); } },
                        "View All Features ",
                        react_1["default"].createElement(lucide_react_1.ArrowRight, { className: "ml-2 h-5 w-5" })),
                    react_1["default"].createElement(button_1.Button, { size: "lg", variant: "outline", className: "border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-6", onClick: function () { return navigate("/pricing"); } }, "View Pricing")))),
        react_1["default"].createElement(WebsiteFooter_1.WebsiteFooter, null)));
}
exports["default"] = FeatureDetail;
