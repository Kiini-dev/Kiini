"use strict";
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var OrgLayout_1 = require("@/components/OrgLayout");
var OrgBreadcrumb_1 = require("@/components/OrgBreadcrumb");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var trpc_1 = require("@/lib/trpc");
var lucide_react_1 = require("lucide-react");
var skeleton_1 = require("@/components/ui/skeleton");
var recharts_1 = require("recharts");
var STATUS_COLORS = {
    paid: "#22c55e",
    draft: "#94a3b8",
    sent: "#3b82f6",
    overdue: "#ef4444",
    partial: "#f59e0b",
    cancelled: "#6b7280"
};
var DEPT_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#14b8a6"];
function KpiCard(_a) {
    var label = _a.label, value = _a.value, sub = _a.sub, change = _a.change, Icon = _a.icon, color = _a.color;
    return (react_1["default"].createElement(card_1.Card, { className: "bg-gradient-to-br " + color + " border-white/10" },
        react_1["default"].createElement(card_1.CardHeader, { className: "pb-2 flex flex-row items-center justify-between space-y-0" },
            react_1["default"].createElement(card_1.CardTitle, { className: "text-sm font-medium text-white/70" }, label),
            react_1["default"].createElement(Icon, { className: "h-4 w-4 text-white/40" })),
        react_1["default"].createElement(card_1.CardContent, null,
            react_1["default"].createElement("p", { className: "text-2xl font-bold text-white" }, value),
            sub && react_1["default"].createElement("p", { className: "text-xs text-white/50 mt-1" }, sub))));
}
function formatCurrency(n) {
    if (n >= 1000000)
        return "KES " + (n / 1000000).toFixed(2) + "M";
    if (n >= 1000)
        return "KES " + (n / 1000).toFixed(1) + "K";
    return "KES " + n.toFixed(0);
}
function OrgReports() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w;
    var params = wouter_1.useParams();
    var slug = params.slug;
    var _x = wouter_1.useLocation(), setLocation = _x[1];
    var orgData = trpc_1.trpc.multiTenancy.getMyOrg.useQuery(undefined, {
        staleTime: 300000
    }).data;
    var featureMap = (_a = orgData === null || orgData === void 0 ? void 0 : orgData.featureMap) !== null && _a !== void 0 ? _a : {};
    var hasAccess = !orgData || featureMap.reports;
    var _y = trpc_1.trpc.multiTenancy.getOrgAnalytics.useQuery(undefined, {
        staleTime: 60000,
        enabled: !!hasAccess
    }), analytics = _y.data, isLoading = _y.isLoading;
    var kpis = analytics === null || analytics === void 0 ? void 0 : analytics.kpis;
    var monthlyTrend = (_b = analytics === null || analytics === void 0 ? void 0 : analytics.monthlyTrend) !== null && _b !== void 0 ? _b : [];
    var invoiceStatusChart = (_c = analytics === null || analytics === void 0 ? void 0 : analytics.invoiceStatusChart) !== null && _c !== void 0 ? _c : [];
    var expenseCategoryChart = (_d = analytics === null || analytics === void 0 ? void 0 : analytics.expenseCategoryChart) !== null && _d !== void 0 ? _d : [];
    var employeeDeptChart = (_e = analytics === null || analytics === void 0 ? void 0 : analytics.employeeDeptChart) !== null && _e !== void 0 ? _e : [];
    // Net income per month
    var netIncomeChart = monthlyTrend.map(function (m) { return ({
        month: m.month,
        net: m.revenue - m.expenses,
        revenue: m.revenue,
        expenses: m.expenses
    }); });
    return (react_1["default"].createElement(OrgLayout_1["default"], { title: "Reports & Analytics", showOrgInfo: false },
        react_1["default"].createElement("div", { className: "space-y-6" },
            react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                react_1["default"].createElement(OrgBreadcrumb_1["default"], { slug: slug, items: [{ label: "Reports & Analytics" }] }),
                react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", className: "text-white/50 hover:text-white", onClick: function () { return setLocation("/org/" + slug + "/dashboard"); } },
                    react_1["default"].createElement(lucide_react_1.ArrowLeft, { className: "h-4 w-4 mr-1" }),
                    " Back")),
            !hasAccess && (react_1["default"].createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
                react_1["default"].createElement(card_1.CardContent, { className: "py-20 text-center" },
                    react_1["default"].createElement(lucide_react_1.Lock, { className: "h-12 w-12 text-white/20 mx-auto mb-4" }),
                    react_1["default"].createElement("p", { className: "text-white font-semibold text-lg mb-2" }, "Access Restricted"),
                    react_1["default"].createElement("p", { className: "text-white/50 text-sm mb-6" }, "Reports are not enabled for your organization plan."),
                    react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", className: "border-white/20 text-white/70 hover:text-white hover:bg-white/10", onClick: function () { return setLocation("/org/" + slug + "/dashboard"); } }, "Back to Dashboard")))),
            hasAccess && (react_1["default"].createElement(react_1["default"].Fragment, null,
                isLoading ? (react_1["default"].createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4" }, Array.from({ length: 8 }).map(function (_, i) { return react_1["default"].createElement(skeleton_1.Skeleton, { key: i, className: "h-24 bg-white/5 rounded-lg" }); }))) : (react_1["default"].createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4" },
                    react_1["default"].createElement(KpiCard, { label: "Total Revenue", value: formatCurrency((_f = kpis === null || kpis === void 0 ? void 0 : kpis.totalPaid) !== null && _f !== void 0 ? _f : 0), sub: "collected payments", icon: lucide_react_1.DollarSign, color: "from-green-600/20 to-green-600/5" }),
                    react_1["default"].createElement(KpiCard, { label: "Total Invoiced", value: formatCurrency((_g = kpis === null || kpis === void 0 ? void 0 : kpis.totalInvoiced) !== null && _g !== void 0 ? _g : 0), sub: ((_h = kpis === null || kpis === void 0 ? void 0 : kpis.totalInvoices) !== null && _h !== void 0 ? _h : 0) + " invoices", icon: lucide_react_1.FileText, color: "from-blue-600/20 to-blue-600/5" }),
                    react_1["default"].createElement(KpiCard, { label: "Total Expenses", value: formatCurrency((_j = kpis === null || kpis === void 0 ? void 0 : kpis.totalExpenses) !== null && _j !== void 0 ? _j : 0), sub: "all categories", icon: lucide_react_1.Receipt, color: "from-red-600/20 to-red-600/5" }),
                    react_1["default"].createElement(KpiCard, { label: "Net Position", value: formatCurrency(((_k = kpis === null || kpis === void 0 ? void 0 : kpis.totalPaid) !== null && _k !== void 0 ? _k : 0) - ((_l = kpis === null || kpis === void 0 ? void 0 : kpis.totalExpenses) !== null && _l !== void 0 ? _l : 0)), sub: "revenue minus expenses", icon: ((_m = kpis === null || kpis === void 0 ? void 0 : kpis.totalPaid) !== null && _m !== void 0 ? _m : 0) > ((_o = kpis === null || kpis === void 0 ? void 0 : kpis.totalExpenses) !== null && _o !== void 0 ? _o : 0) ? lucide_react_1.TrendingUp : lucide_react_1.TrendingDown, color: ((_p = kpis === null || kpis === void 0 ? void 0 : kpis.totalPaid) !== null && _p !== void 0 ? _p : 0) > ((_q = kpis === null || kpis === void 0 ? void 0 : kpis.totalExpenses) !== null && _q !== void 0 ? _q : 0) ? "from-teal-600/20 to-teal-600/5" : "from-orange-600/20 to-orange-600/5" }),
                    react_1["default"].createElement(KpiCard, { label: "Outstanding", value: formatCurrency((_r = kpis === null || kpis === void 0 ? void 0 : kpis.totalOutstanding) !== null && _r !== void 0 ? _r : 0), sub: "uncollected receivables", icon: lucide_react_1.DollarSign, color: "from-yellow-600/20 to-yellow-600/5" }),
                    react_1["default"].createElement(KpiCard, { label: "Active Clients", value: String((_s = kpis === null || kpis === void 0 ? void 0 : kpis.activeClients) !== null && _s !== void 0 ? _s : 0), sub: "of " + ((_t = kpis === null || kpis === void 0 ? void 0 : kpis.totalClients) !== null && _t !== void 0 ? _t : 0) + " total", icon: lucide_react_1.Users, color: "from-purple-600/20 to-purple-600/5" }),
                    react_1["default"].createElement(KpiCard, { label: "Active Employees", value: String((_u = kpis === null || kpis === void 0 ? void 0 : kpis.activeEmployees) !== null && _u !== void 0 ? _u : 0), sub: "of " + ((_v = kpis === null || kpis === void 0 ? void 0 : kpis.totalEmployees) !== null && _v !== void 0 ? _v : 0) + " total", icon: lucide_react_1.Users, color: "from-indigo-600/20 to-indigo-600/5" }),
                    react_1["default"].createElement(KpiCard, { label: "Pending Expenses", value: String((_w = kpis === null || kpis === void 0 ? void 0 : kpis.pendingExpenses) !== null && _w !== void 0 ? _w : 0), sub: "awaiting approval", icon: lucide_react_1.Receipt, color: "from-orange-600/20 to-orange-600/5" }))),
                react_1["default"].createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
                    react_1["default"].createElement(card_1.CardHeader, { className: "pb-2" },
                        react_1["default"].createElement(card_1.CardTitle, { className: "text-base text-white" }, "6-Month Financial Trend"),
                        react_1["default"].createElement(card_1.CardDescription, { className: "text-white/50" }, "Revenue vs Expenses \u2014 monthly comparison")),
                    react_1["default"].createElement(card_1.CardContent, null, isLoading ? (react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-56 bg-white/5" })) : monthlyTrend.length === 0 ? (react_1["default"].createElement("div", { className: "h-56 flex items-center justify-center text-white/30 text-sm" }, "No trend data available")) : (react_1["default"].createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 240 },
                        react_1["default"].createElement(recharts_1.AreaChart, { data: monthlyTrend, margin: { top: 4, right: 8, left: 0, bottom: 0 } },
                            react_1["default"].createElement("defs", null,
                                react_1["default"].createElement("linearGradient", { id: "revGrad2", x1: "0", y1: "0", x2: "0", y2: "1" },
                                    react_1["default"].createElement("stop", { offset: "5%", stopColor: "#3b82f6", stopOpacity: 0.4 }),
                                    react_1["default"].createElement("stop", { offset: "95%", stopColor: "#3b82f6", stopOpacity: 0 })),
                                react_1["default"].createElement("linearGradient", { id: "expGrad2", x1: "0", y1: "0", x2: "0", y2: "1" },
                                    react_1["default"].createElement("stop", { offset: "5%", stopColor: "#ef4444", stopOpacity: 0.3 }),
                                    react_1["default"].createElement("stop", { offset: "95%", stopColor: "#ef4444", stopOpacity: 0 }))),
                            react_1["default"].createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3", stroke: "rgba(255,255,255,0.05)" }),
                            react_1["default"].createElement(recharts_1.XAxis, { dataKey: "month", tick: { fill: "rgba(255,255,255,0.4)", fontSize: 11 }, axisLine: false, tickLine: false }),
                            react_1["default"].createElement(recharts_1.YAxis, { tick: { fill: "rgba(255,255,255,0.4)", fontSize: 11 }, axisLine: false, tickLine: false, tickFormatter: function (v) { return (v / 1000).toFixed(0) + "K"; } }),
                            react_1["default"].createElement(recharts_1.Tooltip, { contentStyle: { backgroundColor: "#1e293b", border: "none", borderRadius: 8, fontSize: 12 }, formatter: function (value) { return ["KES " + value.toLocaleString(), ""]; } }),
                            react_1["default"].createElement(recharts_1.Area, { type: "monotone", dataKey: "revenue", name: "Revenue", stroke: "#3b82f6", fill: "url(#revGrad2)", strokeWidth: 2 }),
                            react_1["default"].createElement(recharts_1.Area, { type: "monotone", dataKey: "expenses", name: "Expenses", stroke: "#ef4444", fill: "url(#expGrad2)", strokeWidth: 2 }),
                            react_1["default"].createElement(recharts_1.Legend, { wrapperStyle: { color: "rgba(255,255,255,0.5)", fontSize: 12 } })))))),
                netIncomeChart.length > 0 && (react_1["default"].createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
                    react_1["default"].createElement(card_1.CardHeader, { className: "pb-2" },
                        react_1["default"].createElement(card_1.CardTitle, { className: "text-base text-white" }, "Monthly Net Income"),
                        react_1["default"].createElement(card_1.CardDescription, { className: "text-white/50" }, "Revenue minus Expenses per month")),
                    react_1["default"].createElement(card_1.CardContent, null,
                        react_1["default"].createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 180 },
                            react_1["default"].createElement(recharts_1.BarChart, { data: netIncomeChart, margin: { top: 4, right: 8, left: 0, bottom: 0 } },
                                react_1["default"].createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3", stroke: "rgba(255,255,255,0.05)" }),
                                react_1["default"].createElement(recharts_1.XAxis, { dataKey: "month", tick: { fill: "rgba(255,255,255,0.4)", fontSize: 11 }, axisLine: false, tickLine: false }),
                                react_1["default"].createElement(recharts_1.YAxis, { tick: { fill: "rgba(255,255,255,0.4)", fontSize: 11 }, axisLine: false, tickLine: false, tickFormatter: function (v) { return (v / 1000).toFixed(0) + "K"; } }),
                                react_1["default"].createElement(recharts_1.Tooltip, { contentStyle: { backgroundColor: "#1e293b", border: "none", borderRadius: 8, fontSize: 12 }, formatter: function (value) { return ["KES " + value.toLocaleString(), "Net Income"]; } }),
                                react_1["default"].createElement(recharts_1.Bar, { dataKey: "net", fill: "#22c55e", radius: [4, 4, 0, 0] }, netIncomeChart.map(function (entry, index) { return (react_1["default"].createElement(recharts_1.Cell, { key: index, fill: entry.net >= 0 ? "#22c55e" : "#ef4444" })); }))))))),
                react_1["default"].createElement("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-4" },
                    react_1["default"].createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
                        react_1["default"].createElement(card_1.CardHeader, { className: "pb-2" },
                            react_1["default"].createElement(card_1.CardTitle, { className: "text-base text-white" }, "Invoice Status")),
                        react_1["default"].createElement(card_1.CardContent, null, invoiceStatusChart.length === 0 ? (react_1["default"].createElement("div", { className: "h-44 flex items-center justify-center text-white/30 text-sm" }, "No invoices")) : (react_1["default"].createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 180 },
                            react_1["default"].createElement(recharts_1.PieChart, null,
                                react_1["default"].createElement(recharts_1.Pie, { data: invoiceStatusChart, cx: "50%", cy: "50%", innerRadius: 45, outerRadius: 70, paddingAngle: 3, dataKey: "value" }, invoiceStatusChart.map(function (entry, index) {
                                    var _a;
                                    return (react_1["default"].createElement(recharts_1.Cell, { key: index, fill: (_a = STATUS_COLORS[entry.name]) !== null && _a !== void 0 ? _a : "#6b7280" }));
                                })),
                                react_1["default"].createElement(recharts_1.Tooltip, { contentStyle: { backgroundColor: "#1e293b", border: "none", borderRadius: 8, fontSize: 12 } }),
                                react_1["default"].createElement(recharts_1.Legend, { wrapperStyle: { color: "rgba(255,255,255,0.5)", fontSize: 11 } })))))),
                    react_1["default"].createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
                        react_1["default"].createElement(card_1.CardHeader, { className: "pb-2" },
                            react_1["default"].createElement(card_1.CardTitle, { className: "text-base text-white" }, "Expense Breakdown")),
                        react_1["default"].createElement(card_1.CardContent, null, expenseCategoryChart.length === 0 ? (react_1["default"].createElement("div", { className: "h-44 flex items-center justify-center text-white/30 text-sm" }, "No expenses")) : (react_1["default"].createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 180 },
                            react_1["default"].createElement(recharts_1.BarChart, { data: expenseCategoryChart.slice(0, 6), layout: "vertical", margin: { left: 8, right: 8 } },
                                react_1["default"].createElement(recharts_1.XAxis, { type: "number", tick: { fill: "rgba(255,255,255,0.4)", fontSize: 10 }, axisLine: false, tickLine: false, tickFormatter: function (v) { return (v / 1000).toFixed(0) + "K"; } }),
                                react_1["default"].createElement(recharts_1.YAxis, { dataKey: "name", type: "category", tick: { fill: "rgba(255,255,255,0.5)", fontSize: 10 }, axisLine: false, tickLine: false, width: 75 }),
                                react_1["default"].createElement(recharts_1.Tooltip, { contentStyle: { backgroundColor: "#1e293b", border: "none", borderRadius: 8, fontSize: 12 }, formatter: function (v) { return ["KES " + v.toLocaleString(), "Amount"]; } }),
                                react_1["default"].createElement(recharts_1.Bar, { dataKey: "value", fill: "#8b5cf6", radius: [0, 4, 4, 0] })))))),
                    react_1["default"].createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
                        react_1["default"].createElement(card_1.CardHeader, { className: "pb-2" },
                            react_1["default"].createElement(card_1.CardTitle, { className: "text-base text-white" }, "Employees by Dept")),
                        react_1["default"].createElement(card_1.CardContent, null, employeeDeptChart.length === 0 ? (react_1["default"].createElement("div", { className: "h-44 flex items-center justify-center text-white/30 text-sm" }, "No department data")) : (react_1["default"].createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 180 },
                            react_1["default"].createElement(recharts_1.PieChart, null,
                                react_1["default"].createElement(recharts_1.Pie, { data: employeeDeptChart, cx: "50%", cy: "50%", outerRadius: 70, paddingAngle: 3, dataKey: "value" }, employeeDeptChart.map(function (_, index) { return (react_1["default"].createElement(recharts_1.Cell, { key: index, fill: DEPT_COLORS[index % DEPT_COLORS.length] })); })),
                                react_1["default"].createElement(recharts_1.Tooltip, { contentStyle: { backgroundColor: "#1e293b", border: "none", borderRadius: 8, fontSize: 12 } }),
                                react_1["default"].createElement(recharts_1.Legend, { wrapperStyle: { color: "rgba(255,255,255,0.5)", fontSize: 11 } }))))))))))));
}
exports["default"] = OrgReports;
