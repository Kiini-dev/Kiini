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
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var currency_1 = require("@/lib/currency");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var card_1 = require("@/components/ui/card");
var stats_card_1 = require("@/components/ui/stats-card");
var recharts_1 = require("recharts");
var COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];
function AppAnalytics() {
    var _a = currency_1.useCurrency(), formatMoney = _a.format, currencySymbol = _a.symbol;
    var rawFinancial = trpc_1.trpc.analytics.financialSummary.useQuery().data;
    var _b = trpc_1.trpc.analytics.revenueTrends.useQuery({ months: 6 }).data, rawRevenue = _b === void 0 ? [] : _b;
    var _c = trpc_1.trpc.analytics.projectStatusDistribution.useQuery().data, rawProjects = _c === void 0 ? [] : _c;
    var rawInvoiceMetrics = trpc_1.trpc.analytics.invoiceMetrics.useQuery().data;
    var rawKpi = trpc_1.trpc.analytics.kpiSummary.useQuery().data;
    var _d = trpc_1.trpc.analytics.topClients.useQuery({ limit: 5 }).data, rawTopClients = _d === void 0 ? [] : _d;
    var financial = rawFinancial ? JSON.parse(JSON.stringify(rawFinancial)) : null;
    var revenue = JSON.parse(JSON.stringify(rawRevenue));
    var projects = JSON.parse(JSON.stringify(rawProjects));
    var invoiceMetrics = rawInvoiceMetrics ? JSON.parse(JSON.stringify(rawInvoiceMetrics)) : null;
    var kpi = rawKpi ? JSON.parse(JSON.stringify(rawKpi)) : null;
    var topClients = JSON.parse(JSON.stringify(rawTopClients));
    return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: "App Analytics", description: "Business intelligence and performance metrics", icon: react_1["default"].createElement(lucide_react_1.BarChart3, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Analytics" },
        ] },
        react_1["default"].createElement("div", { className: "space-y-6" },
            react_1["default"].createElement("div", { className: "grid gap-4 md:grid-cols-4" },
                react_1["default"].createElement(stats_card_1.StatsCard, { label: "Total Revenue", value: formatMoney((financial === null || financial === void 0 ? void 0 : financial.totalRevenue) || 0), description: "All time", color: "border-l-blue-500" }),
                react_1["default"].createElement(stats_card_1.StatsCard, { label: "Outstanding", value: formatMoney((financial === null || financial === void 0 ? void 0 : financial.totalOutstanding) || 0), description: "Unpaid invoices", color: "border-l-red-500" }),
                react_1["default"].createElement(stats_card_1.StatsCard, { label: "Total Invoices", value: (invoiceMetrics === null || invoiceMetrics === void 0 ? void 0 : invoiceMetrics.totalInvoices) || 0, description: ((invoiceMetrics === null || invoiceMetrics === void 0 ? void 0 : invoiceMetrics.paidInvoices) || 0) + " paid", color: "border-l-green-500" }),
                react_1["default"].createElement(stats_card_1.StatsCard, { label: "Active Projects", value: (kpi === null || kpi === void 0 ? void 0 : kpi.activeProjects) || 0, description: ((kpi === null || kpi === void 0 ? void 0 : kpi.totalClients) || 0) + " clients", color: "border-l-purple-500" })),
            react_1["default"].createElement("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6" },
                react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, null,
                        react_1["default"].createElement(card_1.CardTitle, null, "Revenue Trends"),
                        react_1["default"].createElement(card_1.CardDescription, null, "Monthly revenue over time")),
                    react_1["default"].createElement(card_1.CardContent, null, revenue.length > 0 ? (react_1["default"].createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                        react_1["default"].createElement(recharts_1.BarChart, { data: revenue.map(function (r) { return (__assign(__assign({}, r), { revenue: (r.revenue || 0) })); }) },
                            react_1["default"].createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }),
                            react_1["default"].createElement(recharts_1.XAxis, { dataKey: "month" }),
                            react_1["default"].createElement(recharts_1.YAxis, null),
                            react_1["default"].createElement(recharts_1.Tooltip, { formatter: function (v) { return formatMoney(v); } }),
                            react_1["default"].createElement(recharts_1.Legend, null),
                            react_1["default"].createElement(recharts_1.Bar, { dataKey: "revenue", fill: "#3b82f6", name: "Revenue (" + currencySymbol + ")" })))) : (react_1["default"].createElement("p", { className: "text-center py-8 text-muted-foreground" }, "No revenue data yet")))),
                react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, null,
                        react_1["default"].createElement(card_1.CardTitle, null, "Project Status"),
                        react_1["default"].createElement(card_1.CardDescription, null, "Distribution by status")),
                    react_1["default"].createElement(card_1.CardContent, null, projects.length > 0 ? (react_1["default"].createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                        react_1["default"].createElement(recharts_1.PieChart, null,
                            react_1["default"].createElement(recharts_1.Pie, { data: projects, dataKey: "count", nameKey: "status", cx: "50%", cy: "50%", outerRadius: 100, label: function (_a) {
                                    var name = _a.name, value = _a.value;
                                    return name + ": " + value;
                                } }, projects.map(function (_, i) { return (react_1["default"].createElement(recharts_1.Cell, { key: i, fill: COLORS[i % COLORS.length] })); })),
                            react_1["default"].createElement(recharts_1.Tooltip, null),
                            react_1["default"].createElement(recharts_1.Legend, null)))) : (react_1["default"].createElement("p", { className: "text-center py-8 text-muted-foreground" }, "No project data yet"))))),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardHeader, null,
                    react_1["default"].createElement(card_1.CardTitle, null, "Top Clients"),
                    react_1["default"].createElement(card_1.CardDescription, null, "By revenue contribution")),
                react_1["default"].createElement(card_1.CardContent, null, topClients.length > 0 ? (react_1["default"].createElement("div", { className: "space-y-3" }, topClients.map(function (client, i) { return (react_1["default"].createElement("div", { key: i, className: "flex items-center justify-between p-3 border rounded-lg" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("p", { className: "font-medium" }, client.name || client.clientName || "Unknown"),
                        react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" },
                            client.invoiceCount || 0,
                            " invoices")),
                    react_1["default"].createElement("p", { className: "font-bold" }, formatMoney((client.totalRevenue || 0))))); }))) : (react_1["default"].createElement("p", { className: "text-center py-8 text-muted-foreground" }, "No client data yet")))))));
}
exports["default"] = AppAnalytics;
