"use strict";
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var OrgLayout_1 = require("@/components/OrgLayout");
var OrgDashboardShell_1 = require("@/components/OrgDashboardShell");
var trpc_1 = require("@/lib/trpc");
var lucide_react_1 = require("lucide-react");
function OrgFinancialDashboard() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    var params = wouter_1.useParams();
    var slug = params.slug;
    var analytics = trpc_1.trpc.multiTenancy.getOrgAnalytics.useQuery(undefined, {
        staleTime: 60000
    }).data;
    var orgData = trpc_1.trpc.multiTenancy.getMyOrg.useQuery(undefined, {
        staleTime: 300000
    }).data;
    var _k = trpc_1.trpc.dashboard.recentActivity.useQuery({ limit: 5 }).data, recentActivities = _k === void 0 ? [] : _k;
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
    var actionCards = [
        {
            id: "invoices",
            title: "Invoices",
            description: "Review and manage invoices",
            icon: react_1["default"].createElement(lucide_react_1.Receipt, { className: "w-8 h-8" }),
            href: "/org/" + slug + "/invoices",
            color: "from-blue-500 to-blue-600",
            stats: { label: "Outstanding", value: (_b = kpis === null || kpis === void 0 ? void 0 : kpis.totalOutstanding) !== null && _b !== void 0 ? _b : 0 }
        },
        {
            id: "payments",
            title: "Payments",
            description: "Track payments and receipts",
            icon: react_1["default"].createElement(lucide_react_1.DollarSign, { className: "w-8 h-8" }),
            href: "/org/" + slug + "/payments",
            color: "from-emerald-500 to-emerald-600",
            stats: { label: "Revenue", value: (_c = kpis === null || kpis === void 0 ? void 0 : kpis.totalInvoiced) !== null && _c !== void 0 ? _c : 0 }
        },
        {
            id: "expenses",
            title: "Expenses",
            description: "Monitor expenses and approvals",
            icon: react_1["default"].createElement(lucide_react_1.Clock, { className: "w-8 h-8" }),
            href: "/org/" + slug + "/expenses",
            color: "from-orange-500 to-orange-600",
            stats: { label: "Pending", value: (_d = kpis === null || kpis === void 0 ? void 0 : kpis.pendingExpenses) !== null && _d !== void 0 ? _d : 0 }
        },
        {
            id: "reports",
            title: "Financial Reports",
            description: "View financial statements and trends",
            icon: react_1["default"].createElement(lucide_react_1.BarChart3, { className: "w-8 h-8" }),
            href: "/org/" + slug + "/reports",
            color: "from-violet-500 to-violet-600",
            stats: { label: "Trend", value: "Live" }
        },
        {
            id: "team",
            title: "Finance Team",
            description: "Review team responsibilities and approvals",
            icon: react_1["default"].createElement(lucide_react_1.Users, { className: "w-8 h-8" }),
            href: "/org/" + slug + "/staff",
            color: "from-cyan-500 to-cyan-600",
            stats: { label: "Members", value: (_e = kpis === null || kpis === void 0 ? void 0 : kpis.financeTeamMembers) !== null && _e !== void 0 ? _e : 0 }
        },
    ];
    var overviewMetrics = [
        {
            title: "Revenue Generated",
            value: String((_f = kpis === null || kpis === void 0 ? void 0 : kpis.totalInvoiced) !== null && _f !== void 0 ? _f : 0),
            description: "Total invoiced this period",
            icon: react_1["default"].createElement(lucide_react_1.DollarSign, { className: "w-5 h-5" }),
            color: "border-l-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 dark:border-l-emerald-400",
            href: "/org/" + slug + "/payments"
        },
        {
            title: "Outstanding Invoices",
            value: String((_g = kpis === null || kpis === void 0 ? void 0 : kpis.totalOutstanding) !== null && _g !== void 0 ? _g : 0),
            description: "Pending collections",
            icon: react_1["default"].createElement(lucide_react_1.Receipt, { className: "w-5 h-5" }),
            color: "border-l-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-l-blue-400",
            href: "/org/" + slug + "/invoices"
        },
        {
            title: "Pending Expenses",
            value: String((_h = kpis === null || kpis === void 0 ? void 0 : kpis.pendingExpenses) !== null && _h !== void 0 ? _h : 0),
            description: "Expenses awaiting approval",
            icon: react_1["default"].createElement(lucide_react_1.Clock, { className: "w-5 h-5" }),
            color: "border-l-orange-500 bg-amber-50 dark:bg-amber-900/20 dark:border-l-amber-400",
            href: "/org/" + slug + "/expenses"
        },
        {
            title: "Cash Flow",
            value: String((_j = kpis === null || kpis === void 0 ? void 0 : kpis.cashFlow) !== null && _j !== void 0 ? _j : 0),
            description: "Current cash trend",
            icon: react_1["default"].createElement(lucide_react_1.BarChart3, { className: "w-5 h-5" }),
            color: "border-l-violet-500 bg-violet-50 dark:bg-violet-900/20 dark:border-l-violet-400",
            href: "/org/" + slug + "/reports"
        },
    ];
    var gettingStarted = [
        {
            title: "Review Outstanding Invoices",
            description: "Make sure receivables are up to date.",
            href: "/org/" + slug + "/invoices",
            buttonText: "View Invoices"
        },
        {
            title: "Submit Expense Reports",
            description: "Ensure expenses are approved promptly.",
            href: "/org/" + slug + "/expenses",
            buttonText: "Submit Expense"
        },
        {
            title: "Check Cash Flow",
            description: "Monitor financial performance trends.",
            href: "/org/" + slug + "/reports",
            buttonText: "View Reports"
        },
    ];
    return (react_1["default"].createElement(OrgLayout_1["default"], { title: org ? org.name + " \u2014 Financial Dashboard" : "Financial Dashboard", showOrgInfo: true },
        react_1["default"].createElement("div", { className: "space-y-6" },
            react_1["default"].createElement(OrgDashboardShell_1["default"], { title: "Financial Dashboard", subtitle: "Track income, expenses, and financial performance", actionCards: actionCards, overviewMetrics: overviewMetrics, monthlyChartData: monthlyChartData, financialBreakdown: [], recentActivities: recentActivities, recentActivityHref: "/org/" + slug + "/activity", gettingStarted: gettingStarted }))));
}
exports["default"] = OrgFinancialDashboard;
