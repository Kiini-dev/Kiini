"use strict";
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var OrgLayout_1 = require("@/components/OrgLayout");
var OrgDashboardShell_1 = require("@/components/OrgDashboardShell");
var useAuthWithPersistence_1 = require("@/_core/hooks/useAuthWithPersistence");
var trpc_1 = require("@/lib/trpc");
var CurrencyContext_1 = require("@/pages/website/CurrencyContext");
var utils_1 = require("@/lib/utils");
var lucide_react_1 = require("lucide-react");
function OrgManagerDashboard() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    var params = wouter_1.useParams();
    var slug = params.slug;
    var _q = wouter_1.useLocation(), setLocation = _q[1];
    var user = useAuthWithPersistence_1.useAuthWithPersistence().user;
    var currency = CurrencyContext_1.useCurrency().currency;
    var currencyCode = currency.code || "KES";
    var analytics = trpc_1.trpc.multiTenancy.getOrgAnalytics.useQuery(undefined, {
        staleTime: 60000
    }).data;
    var orgData = trpc_1.trpc.multiTenancy.getMyOrg.useQuery(undefined, {
        staleTime: 300000
    }).data;
    var _r = trpc_1.trpc.dashboard.recentActivity.useQuery({ limit: 5 }).data, recentActivities = _r === void 0 ? [] : _r;
    var org = orgData === null || orgData === void 0 ? void 0 : orgData.organization;
    var kpis = analytics === null || analytics === void 0 ? void 0 : analytics.kpis;
    var monthlyChartData = ((_a = analytics === null || analytics === void 0 ? void 0 : analytics.monthlyTrend) !== null && _a !== void 0 ? _a : []).map(function (item) {
        var _a, _b, _c, _d, _e, _f;
        return ({
            name: (_b = (_a = item.name) !== null && _a !== void 0 ? _a : item.month) !== null && _b !== void 0 ? _b : "",
            income: Number((_d = (_c = item.income) !== null && _c !== void 0 ? _c : item.revenue) !== null && _d !== void 0 ? _d : 0),
            expense: Number((_f = (_e = item.expense) !== null && _e !== void 0 ? _e : item.cost) !== null && _f !== void 0 ? _f : 0)
        });
    });
    var financialBreakdown = [
        { name: "Revenue", value: Number((_b = kpis === null || kpis === void 0 ? void 0 : kpis.totalInvoiced) !== null && _b !== void 0 ? _b : 0) },
        { name: "Outstanding", value: Number((_c = kpis === null || kpis === void 0 ? void 0 : kpis.totalOutstanding) !== null && _c !== void 0 ? _c : 0) },
        { name: "Expenses", value: Number((_d = kpis === null || kpis === void 0 ? void 0 : kpis.totalExpenses) !== null && _d !== void 0 ? _d : 0) },
    ].filter(function (entry) { return entry.value > 0; });
    var actionCards = [
        {
            id: "projects",
            title: "Projects",
            description: "Manage and track all your projects",
            icon: react_1["default"].createElement(lucide_react_1.Target, { className: "w-8 h-8" }),
            href: "/org/" + slug + "/projects",
            color: "from-blue-500 to-blue-600",
            stats: { label: "Active Projects", value: (_e = kpis === null || kpis === void 0 ? void 0 : kpis.activeProjects) !== null && _e !== void 0 ? _e : 0 }
        },
        {
            id: "team",
            title: "Team",
            description: "Manage your team and capacity",
            icon: react_1["default"].createElement(lucide_react_1.Users, { className: "w-8 h-8" }),
            href: "/org/" + slug + "/staff",
            color: "from-green-500 to-green-600",
            stats: { label: "Team Members", value: (_f = kpis === null || kpis === void 0 ? void 0 : kpis.totalEmployees) !== null && _f !== void 0 ? _f : 0 }
        },
        {
            id: "tasks",
            title: "Tasks",
            description: "Track pending work across the team",
            icon: react_1["default"].createElement(lucide_react_1.List, { className: "w-8 h-8" }),
            href: "/org/" + slug + "/tasks",
            color: "from-yellow-500 to-yellow-600",
            stats: { label: "Pending Tasks", value: (_g = kpis === null || kpis === void 0 ? void 0 : kpis.pendingTasks) !== null && _g !== void 0 ? _g : 0 }
        },
        {
            id: "reports",
            title: "Reports",
            description: "View performance and delivery metrics",
            icon: react_1["default"].createElement(lucide_react_1.BarChart3, { className: "w-8 h-8" }),
            href: "/org/" + slug + "/reports",
            color: "from-teal-500 to-teal-600",
            stats: { label: "Insights", value: "Live" }
        },
        {
            id: "finance",
            title: "Finance",
            description: "Monitor revenue, costs, and invoices",
            icon: react_1["default"].createElement(lucide_react_1.DollarSign, { className: "w-8 h-8" }),
            href: "/org/" + slug + "/payments",
            color: "from-emerald-500 to-emerald-600",
            stats: { label: "Revenue", value: utils_1.formatCurrency(Number((_h = kpis === null || kpis === void 0 ? void 0 : kpis.totalInvoiced) !== null && _h !== void 0 ? _h : 0)) }
        },
    ];
    var overviewMetrics = [
        {
            title: "Team Members",
            value: String((_j = kpis === null || kpis === void 0 ? void 0 : kpis.totalEmployees) !== null && _j !== void 0 ? _j : 0),
            description: "Active employees in your team",
            icon: react_1["default"].createElement(lucide_react_1.Users, { className: "w-5 h-5" }),
            color: "border-l-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-l-blue-400",
            href: "/org/" + slug + "/staff"
        },
        {
            title: "Active Projects",
            value: String((_k = kpis === null || kpis === void 0 ? void 0 : kpis.activeProjects) !== null && _k !== void 0 ? _k : 0),
            description: "Projects currently in progress",
            icon: react_1["default"].createElement(lucide_react_1.Target, { className: "w-5 h-5" }),
            color: "border-l-purple-500 bg-purple-50 dark:bg-purple-900/20 dark:border-l-purple-400",
            href: "/org/" + slug + "/projects"
        },
        {
            title: "Pending Tasks",
            value: String((_l = kpis === null || kpis === void 0 ? void 0 : kpis.pendingTasks) !== null && _l !== void 0 ? _l : 0),
            description: "Tasks to complete",
            icon: react_1["default"].createElement(lucide_react_1.List, { className: "w-5 h-5" }),
            color: "border-l-yellow-500 bg-amber-50 dark:bg-amber-900/20 dark:border-l-amber-400",
            href: "/org/" + slug + "/tasks"
        },
        {
            title: "Revenue Generated",
            value: utils_1.formatCurrency(Number((_m = kpis === null || kpis === void 0 ? void 0 : kpis.totalInvoiced) !== null && _m !== void 0 ? _m : 0)),
            description: "This period",
            icon: react_1["default"].createElement(lucide_react_1.DollarSign, { className: "w-5 h-5" }),
            color: "border-l-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 dark:border-l-emerald-400",
            href: "/org/" + slug + "/payments"
        },
        {
            title: "Invoices Outstanding",
            value: utils_1.formatCurrency(Number((_o = kpis === null || kpis === void 0 ? void 0 : kpis.totalOutstanding) !== null && _o !== void 0 ? _o : 0)),
            description: "Pending collection",
            icon: react_1["default"].createElement(lucide_react_1.Clock, { className: "w-5 h-5" }),
            color: "border-l-orange-500 bg-orange-50 dark:bg-orange-900/20 dark:border-l-amber-400",
            href: "/org/" + slug + "/invoices"
        },
        {
            title: "Expenses Logged",
            value: utils_1.formatCurrency(Number((_p = kpis === null || kpis === void 0 ? void 0 : kpis.totalExpenses) !== null && _p !== void 0 ? _p : 0)),
            description: "Current reports",
            icon: react_1["default"].createElement(Receipt, { className: "w-5 h-5" }),
            color: "border-l-red-500 bg-red-50 dark:bg-red-900/20 dark:border-l-red-400",
            href: "/org/" + slug + "/expenses"
        },
        {
            title: "Satisfaction",
            value: "4.2/5",
            description: "Team sentiment score",
            icon: react_1["default"].createElement(lucide_react_1.CheckCircle2, { className: "w-5 h-5" }),
            color: "border-l-cyan-500 bg-cyan-50 dark:bg-cyan-900/20 dark:border-l-cyan-400",
            href: "/org/" + slug + "/reports"
        },
        {
            title: "On-Time Delivery",
            value: "92%",
            description: "Project completion rate",
            icon: react_1["default"].createElement(lucide_react_1.BarChart3, { className: "w-5 h-5" }),
            color: "border-l-teal-500 bg-teal-50 dark:bg-teal-900/20 dark:border-l-teal-400",
            href: "/org/" + slug + "/projects"
        },
    ];
    var gettingStarted = [
        {
            title: "Create Your First Project",
            description: "Organize work and assign tasks to your team.",
            href: "/org/" + slug + "/projects/create",
            buttonText: "New Project"
        },
        {
            title: "Add a Team Member",
            description: "Bring your team into the platform for collaboration.",
            href: "/org/" + slug + "/staff",
            buttonText: "Add Member"
        },
        {
            title: "Track Pending Tasks",
            description: "Review and assign outstanding tasks for the team.",
            href: "/org/" + slug + "/tasks",
            buttonText: "View Tasks"
        },
    ];
    return (react_1["default"].createElement(OrgLayout_1["default"], { title: org ? org.name + " \u2014 Manager Dashboard" : "Manager Dashboard", showOrgInfo: true },
        react_1["default"].createElement("div", { className: "space-y-6" },
            react_1["default"].createElement(OrgDashboardShell_1["default"], { title: "Team Overview", subtitle: "Monitor your team's performance and projects", actionCards: actionCards, overviewMetrics: overviewMetrics, monthlyChartData: monthlyChartData, financialBreakdown: financialBreakdown, recentActivities: recentActivities, recentActivityHref: "/org/" + slug + "/activity", gettingStarted: gettingStarted }))));
}
exports["default"] = OrgManagerDashboard;
