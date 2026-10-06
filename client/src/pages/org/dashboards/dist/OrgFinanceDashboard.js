"use strict";
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var OrgLayout_1 = require("@/components/OrgLayout");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var alert_1 = require("@/components/ui/alert");
var skeleton_1 = require("@/components/ui/skeleton");
var useAuthWithPersistence_1 = require("@/_core/hooks/useAuthWithPersistence");
var trpc_1 = require("@/lib/trpc");
var CurrencyContext_1 = require("@/pages/website/CurrencyContext");
var lucide_react_1 = require("lucide-react");
var recharts_1 = require("recharts");
function KpiCard(_a) {
    var label = _a.label, value = _a.value, sub = _a.sub, Icon = _a.icon, colorClass = _a.colorClass, trend = _a.trend;
    return (react_1["default"].createElement(card_1.Card, { className: "bg-card border-border hover:shadow-md transition-shadow" },
        react_1["default"].createElement(card_1.CardHeader, { className: "pb-2 flex flex-row items-center justify-between space-y-0" },
            react_1["default"].createElement(card_1.CardTitle, { className: "text-xs font-medium text-muted-foreground uppercase tracking-wide" }, label),
            react_1["default"].createElement("div", { className: "h-8 w-8 rounded-lg flex items-center justify-center " + colorClass },
                react_1["default"].createElement(Icon, { className: "h-4 w-4" }))),
        react_1["default"].createElement(card_1.CardContent, null,
            react_1["default"].createElement("p", { className: "text-2xl font-bold text-foreground" }, value),
            sub && react_1["default"].createElement("p", { className: "text-xs text-muted-foreground mt-1" }, sub),
            trend && (react_1["default"].createElement("div", { className: "flex items-center gap-1 mt-2" },
                trend.isPositive ? (react_1["default"].createElement(lucide_react_1.ArrowUp, { className: "h-3 w-3 text-green-500" })) : (react_1["default"].createElement(lucide_react_1.ArrowDown, { className: "h-3 w-3 text-red-500" })),
                react_1["default"].createElement("span", { className: "text-xs font-medium " + (trend.isPositive ? "text-green-500" : "text-red-500") },
                    Math.abs(trend.value),
                    "% ",
                    trend.isPositive ? "increase" : "decrease"))))));
}
function formatCurrencyWithCode(n, code) {
    if (n >= 1000000)
        return code + " " + (n / 1000000).toFixed(1) + "M";
    if (n >= 1000)
        return code + " " + (n / 1000).toFixed(1) + "K";
    return code + " " + n.toFixed(0);
}
function OrgFinanceDashboard() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
    var params = wouter_1.useParams();
    var slug = params.slug;
    var _t = wouter_1.useLocation(), setLocation = _t[1];
    var user = useAuthWithPersistence_1.useAuthWithPersistence().user;
    var currency = CurrencyContext_1.useCurrency().currency;
    var currencyCode = currency.code;
    var formatCurrency = function (n) { return formatCurrencyWithCode(n, currencyCode); };
    var _u = trpc_1.trpc.multiTenancy.getOrgAnalytics.useQuery(undefined, {
        staleTime: 60000
    }), analytics = _u.data, analyticsLoading = _u.isLoading;
    var orgData = trpc_1.trpc.multiTenancy.getMyOrg.useQuery(undefined, {
        staleTime: 300000
    }).data;
    var org = orgData === null || orgData === void 0 ? void 0 : orgData.organization;
    var featureMap = (_a = orgData === null || orgData === void 0 ? void 0 : orgData.featureMap) !== null && _a !== void 0 ? _a : {};
    var kpis = analytics === null || analytics === void 0 ? void 0 : analytics.kpis;
    var monthlyTrend = (_b = analytics === null || analytics === void 0 ? void 0 : analytics.monthlyTrend) !== null && _b !== void 0 ? _b : [];
    var invoiceStatusChart = (_c = analytics === null || analytics === void 0 ? void 0 : analytics.invoiceStatusChart) !== null && _c !== void 0 ? _c : [];
    return (react_1["default"].createElement(OrgLayout_1["default"], { title: org ? org.name + " \u2014 Finance Dashboard" : "Finance Dashboard", showOrgInfo: true },
        react_1["default"].createElement("div", { className: "space-y-6" },
            react_1["default"].createElement(alert_1.Alert, { className: "border-emerald-500/30 bg-emerald-500/5" },
                react_1["default"].createElement(lucide_react_1.DollarSign, { className: "h-4 w-4 text-emerald-600 dark:text-emerald-400" }),
                react_1["default"].createElement(alert_1.AlertDescription, { className: "text-emerald-700 dark:text-emerald-200" }, "You are viewing the finance dashboard with detailed financial metrics and reporting.")),
            react_1["default"].createElement("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" },
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("h2", { className: "text-xl font-bold text-foreground" }, "Financial Overview"),
                    react_1["default"].createElement("p", { className: "text-sm text-muted-foreground mt-0.5" }, "Complete financial health and performance analysis")),
                react_1["default"].createElement(button_1.Button, { className: "bg-primary hover:bg-primary/90 text-primary-foreground", onClick: function () { return setLocation("/org/" + slug + "/invoices"); } },
                    react_1["default"].createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-2" }),
                    "New Invoice")),
            analyticsLoading ? (react_1["default"].createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4" }, Array.from({ length: 8 }).map(function (_, i) { return (react_1["default"].createElement(skeleton_1.Skeleton, { key: i, className: "h-28 rounded-lg" })); }))) : (react_1["default"].createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4" },
                react_1["default"].createElement(KpiCard, { label: "Total Revenue", value: formatCurrency((_d = kpis === null || kpis === void 0 ? void 0 : kpis.totalInvoiced) !== null && _d !== void 0 ? _d : 0), sub: ((_e = kpis === null || kpis === void 0 ? void 0 : kpis.totalInvoices) !== null && _e !== void 0 ? _e : 0) + " invoices", icon: lucide_react_1.DollarSign, colorClass: "bg-green-500/15 text-green-500", trend: { value: 12.5, isPositive: true } }),
                react_1["default"].createElement(KpiCard, { label: "Payments Received", value: formatCurrency((_f = kpis === null || kpis === void 0 ? void 0 : kpis.totalPaid) !== null && _f !== void 0 ? _f : 0), sub: "collected", icon: lucide_react_1.CreditCard, colorClass: "bg-blue-500/15 text-blue-500", trend: { value: 8.2, isPositive: true } }),
                react_1["default"].createElement(KpiCard, { label: "Outstanding", value: formatCurrency((_g = kpis === null || kpis === void 0 ? void 0 : kpis.totalOutstanding) !== null && _g !== void 0 ? _g : 0), sub: "pending collection", icon: lucide_react_1.Clock, colorClass: "bg-yellow-500/15 text-yellow-500", trend: { value: 3.1, isPositive: false } }),
                react_1["default"].createElement(KpiCard, { label: "Collection Rate", value: (kpis === null || kpis === void 0 ? void 0 : kpis.totalInvoiced) ? Math.round((((_h = kpis === null || kpis === void 0 ? void 0 : kpis.totalPaid) !== null && _h !== void 0 ? _h : 0) / kpis.totalInvoiced) * 100) + "%" : "—", sub: "paid / invoiced", icon: lucide_react_1.TrendingUp, colorClass: "bg-purple-500/15 text-purple-500" }),
                react_1["default"].createElement(KpiCard, { label: "Total Expenses", value: formatCurrency((_j = kpis === null || kpis === void 0 ? void 0 : kpis.totalExpenses) !== null && _j !== void 0 ? _j : 0), sub: ((_k = kpis === null || kpis === void 0 ? void 0 : kpis.pendingExpenses) !== null && _k !== void 0 ? _k : 0) + " pending", icon: lucide_react_1.Receipt, colorClass: "bg-orange-500/15 text-orange-500", trend: { value: 5.3, isPositive: false } }),
                react_1["default"].createElement(KpiCard, { label: "Net Profit", value: formatCurrency(((_l = kpis === null || kpis === void 0 ? void 0 : kpis.totalPaid) !== null && _l !== void 0 ? _l : 0) - ((_m = kpis === null || kpis === void 0 ? void 0 : kpis.totalExpenses) !== null && _m !== void 0 ? _m : 0)), sub: "revenue minus expenses", icon: lucide_react_1.TrendingUp, colorClass: "bg-cyan-500/15 text-cyan-500" }),
                react_1["default"].createElement(KpiCard, { label: "Average Invoice", value: (kpis === null || kpis === void 0 ? void 0 : kpis.totalInvoices) ? formatCurrency(((_o = kpis === null || kpis === void 0 ? void 0 : kpis.totalInvoiced) !== null && _o !== void 0 ? _o : 0) / kpis.totalInvoices) : "—", sub: "per invoice", icon: lucide_react_1.Banknote, colorClass: "bg-teal-500/15 text-teal-500" }),
                react_1["default"].createElement(KpiCard, { label: "Accounts Receivable", value: formatCurrency((_p = kpis === null || kpis === void 0 ? void 0 : kpis.totalOutstanding) !== null && _p !== void 0 ? _p : 0), sub: "overdue included", icon: lucide_react_1.Landmark, colorClass: "bg-indigo-500/15 text-indigo-500" }))),
            react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, null,
                        react_1["default"].createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Monthly Revenue Trend")),
                    react_1["default"].createElement(card_1.CardContent, null,
                        react_1["default"].createElement("div", { className: "h-64" }, analyticsLoading ? (react_1["default"].createElement(skeleton_1.Skeleton, { className: "w-full h-full rounded-lg" })) : monthlyTrend && monthlyTrend.length > 0 ? (react_1["default"].createElement(recharts_1.ResponsiveContainer, { width: "100%", height: "100%" },
                            react_1["default"].createElement(recharts_1.AreaChart, { data: monthlyTrend },
                                react_1["default"].createElement("defs", null,
                                    react_1["default"].createElement("linearGradient", { id: "colorRevenue", x1: "0", y1: "0", x2: "0", y2: "1" },
                                        react_1["default"].createElement("stop", { offset: "5%", stopColor: "#3b82f6", stopOpacity: 0.3 }),
                                        react_1["default"].createElement("stop", { offset: "95%", stopColor: "#3b82f6", stopOpacity: 0 }))),
                                react_1["default"].createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3", stroke: "var(--border)" }),
                                react_1["default"].createElement(recharts_1.XAxis, { dataKey: "month", stroke: "var(--muted-foreground)" }),
                                react_1["default"].createElement(recharts_1.YAxis, { stroke: "var(--muted-foreground)" }),
                                react_1["default"].createElement(recharts_1.Tooltip, { contentStyle: { background: "var(--card)", border: "1px solid var(--border)" } }),
                                react_1["default"].createElement(recharts_1.Area, { type: "monotone", dataKey: "revenue", stroke: "#3b82f6", fillOpacity: 1, fill: "url(#colorRevenue)" })))) : (react_1["default"].createElement("p", { className: "text-muted-foreground text-center pt-20" }, "No data available"))))),
                react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, null,
                        react_1["default"].createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Invoice Status Distribution")),
                    react_1["default"].createElement(card_1.CardContent, null,
                        react_1["default"].createElement("div", { className: "h-64" }, analyticsLoading ? (react_1["default"].createElement(skeleton_1.Skeleton, { className: "w-full h-full rounded-lg" })) : invoiceStatusChart && invoiceStatusChart.length > 0 ? (react_1["default"].createElement(recharts_1.ResponsiveContainer, { width: "100%", height: "100%" },
                            react_1["default"].createElement(recharts_1.PieChart, null,
                                react_1["default"].createElement(recharts_1.Pie, { data: invoiceStatusChart, cx: "50%", cy: "50%", labelLine: false, label: function (_a) {
                                        var name = _a.name, value = _a.value;
                                        return name + ": " + value;
                                    }, outerRadius: 80, fill: "#8884d8", dataKey: "value" },
                                    react_1["default"].createElement(recharts_1.Cell, { fill: "#3b82f6" }),
                                    react_1["default"].createElement(recharts_1.Cell, { fill: "#22c55e" }),
                                    react_1["default"].createElement(recharts_1.Cell, { fill: "#f59e0b" }),
                                    react_1["default"].createElement(recharts_1.Cell, { fill: "#ef4444" })),
                                react_1["default"].createElement(recharts_1.Tooltip, null)))) : (react_1["default"].createElement("p", { className: "text-muted-foreground text-center pt-20" }, "No data available")))))),
            react_1["default"].createElement("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-4" },
                react_1["default"].createElement(card_1.Card, { className: "bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/30 hover:shadow-lg transition-shadow cursor-pointer", onClick: function () { return setLocation("/org/" + slug + "/invoices"); } },
                    react_1["default"].createElement(card_1.CardHeader, { className: "pb-3" },
                        react_1["default"].createElement(card_1.CardTitle, { className: "text-sm font-medium text-blue-600 dark:text-blue-400 flex items-center gap-2" },
                            react_1["default"].createElement(lucide_react_1.FileText, { className: "h-4 w-4" }),
                            " Invoicing")),
                    react_1["default"].createElement(card_1.CardContent, null,
                        react_1["default"].createElement("p", { className: "text-2xl font-bold text-foreground" }, (_q = kpis === null || kpis === void 0 ? void 0 : kpis.totalInvoices) !== null && _q !== void 0 ? _q : 0),
                        react_1["default"].createElement("p", { className: "text-xs text-muted-foreground mt-1" }, "Create & manage invoices"))),
                react_1["default"].createElement(card_1.Card, { className: "bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/30 hover:shadow-lg transition-shadow cursor-pointer", onClick: function () { return setLocation("/org/" + slug + "/payments"); } },
                    react_1["default"].createElement(card_1.CardHeader, { className: "pb-3" },
                        react_1["default"].createElement(card_1.CardTitle, { className: "text-sm font-medium text-green-600 dark:text-green-400 flex items-center gap-2" },
                            react_1["default"].createElement(lucide_react_1.CreditCard, { className: "h-4 w-4" }),
                            " Payments")),
                    react_1["default"].createElement(card_1.CardContent, null,
                        react_1["default"].createElement("p", { className: "text-2xl font-bold text-foreground" }, formatCurrency((_r = kpis === null || kpis === void 0 ? void 0 : kpis.totalPaid) !== null && _r !== void 0 ? _r : 0)),
                        react_1["default"].createElement("p", { className: "text-xs text-muted-foreground mt-1" }, "Track payments received"))),
                react_1["default"].createElement(card_1.Card, { className: "bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/30 hover:shadow-lg transition-shadow cursor-pointer", onClick: function () { return setLocation("/org/" + slug + "/expenses"); } },
                    react_1["default"].createElement(card_1.CardHeader, { className: "pb-3" },
                        react_1["default"].createElement(card_1.CardTitle, { className: "text-sm font-medium text-orange-600 dark:text-orange-400 flex items-center gap-2" },
                            react_1["default"].createElement(lucide_react_1.Receipt, { className: "h-4 w-4" }),
                            " Expenses")),
                    react_1["default"].createElement(card_1.CardContent, null,
                        react_1["default"].createElement("p", { className: "text-2xl font-bold text-foreground" }, formatCurrency((_s = kpis === null || kpis === void 0 ? void 0 : kpis.totalExpenses) !== null && _s !== void 0 ? _s : 0)),
                        react_1["default"].createElement("p", { className: "text-xs text-muted-foreground mt-1" }, "Monitor all expenses")))),
            react_1["default"].createElement("div", { className: "flex flex-wrap gap-2 pt-4" },
                react_1["default"].createElement(button_1.Button, { size: "sm", className: "bg-primary hover:bg-primary/90 text-primary-foreground", onClick: function () { return setLocation("/org/" + slug + "/invoices"); } },
                    react_1["default"].createElement(lucide_react_1.Plus, { className: "h-3.5 w-3.5 mr-1.5" }),
                    " New Invoice"),
                react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", className: "border-border", onClick: function () { return setLocation("/org/" + slug + "/payments"); } },
                    react_1["default"].createElement(lucide_react_1.DollarSign, { className: "h-3.5 w-3.5 mr-1.5" }),
                    " Record Payment"),
                react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", className: "border-border", onClick: function () { return setLocation("/org/" + slug + "/expenses"); } },
                    react_1["default"].createElement(lucide_react_1.Receipt, { className: "h-3.5 w-3.5 mr-1.5" }),
                    " Add Expense"),
                react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", className: "border-border", onClick: function () { return setLocation("/org/" + slug + "/reports"); } },
                    react_1["default"].createElement(lucide_react_1.BarChart3, { className: "h-3.5 w-3.5 mr-1.5" }),
                    " Financial Reports")))));
}
exports["default"] = OrgFinanceDashboard;
