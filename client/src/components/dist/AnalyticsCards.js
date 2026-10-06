"use strict";
/**
 * Analytics Cards Component
 *
 * Displays KPI cards with financial metrics and real-time data
 */
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.ClientDistributionCard = exports.ProjectStatusCard = exports.InvoiceMetricsCard = exports.FinancialSummaryCard = exports.KPICards = void 0;
var card_1 = require("@/components/ui/card");
var trpc_1 = require("@/lib/trpc");
function KPICards() {
    var _a = trpc_1.trpc.analytics.kpiSummary.useQuery({}), kpiData = _a.data, isLoading = _a.isLoading;
    if (isLoading) {
        return (React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" }, __spreadArrays(Array(4)).map(function (_, i) { return (React.createElement(card_1.Card, { key: "skeleton-" + i, className: "animate-pulse" },
            React.createElement(card_1.CardHeader, { className: "pb-3" },
                React.createElement("div", { className: "h-4 bg-gray-200 rounded w-3/4" })),
            React.createElement(card_1.CardContent, null,
                React.createElement("div", { className: "h-8 bg-gray-200 rounded w-1/2" })))); })));
    }
    if (!kpiData) {
        return null;
    }
    var kpis = [
        {
            title: "Total Invoiced",
            value: "$" + kpiData.totalInvoiced.toFixed(2),
            description: kpiData.totalInvoiceCount + " invoices",
            icon: "📊",
            color: "bg-blue-50"
        },
        {
            title: "Total Paid",
            value: "$" + kpiData.totalPaid.toFixed(2),
            description: "Received payments",
            icon: "✅",
            color: "bg-green-50"
        },
        {
            title: "Outstanding",
            value: "$" + kpiData.totalOutstanding.toFixed(2),
            description: kpiData.overdueCount + " overdue",
            icon: "⏰",
            color: "bg-orange-50"
        },
        {
            title: "Active Projects",
            value: kpiData.activeProjects.toString(),
            description: kpiData.activeClients + " active clients",
            icon: "🎯",
            color: "bg-purple-50"
        },
    ];
    return (React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" }, kpis.map(function (kpi) { return (React.createElement(card_1.Card, { key: kpi.title, className: kpi.color + " border-0" },
        React.createElement(card_1.CardHeader, { className: "pb-3" },
            React.createElement("div", { className: "flex items-center justify-between" },
                React.createElement(card_1.CardTitle, { className: "text-sm font-medium text-gray-700" }, kpi.title),
                React.createElement("span", { className: "text-2xl" }, kpi.icon))),
        React.createElement(card_1.CardContent, null,
            React.createElement("div", { className: "text-2xl font-bold text-gray-900" }, kpi.value),
            React.createElement("p", { className: "text-xs text-gray-600 mt-1" }, kpi.description)))); })));
}
exports.KPICards = KPICards;
/**
 * Financial Summary Card
 */
function FinancialSummaryCard() {
    var _a = trpc_1.trpc.analytics.financialSummary.useQuery({}), summary = _a.data, isLoading = _a.isLoading;
    if (isLoading) {
        return (React.createElement(card_1.Card, { className: "animate-pulse" },
            React.createElement(card_1.CardHeader, null,
                React.createElement("div", { className: "h-5 bg-gray-200 rounded w-1/3" })),
            React.createElement(card_1.CardContent, null,
                React.createElement("div", { className: "space-y-3" }, __spreadArrays(Array(4)).map(function (_, i) { return (React.createElement("div", { key: "skeleton-item-" + i, className: "h-4 bg-gray-200 rounded w-1/2" })); })))));
    }
    if (!summary) {
        return null;
    }
    return (React.createElement(card_1.Card, null,
        React.createElement(card_1.CardHeader, null,
            React.createElement(card_1.CardTitle, null, "Financial Summary"),
            React.createElement(card_1.CardDescription, null, "Current month overview")),
        React.createElement(card_1.CardContent, { className: "space-y-4" },
            React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
                React.createElement("div", null,
                    React.createElement("p", { className: "text-sm text-gray-600" }, "Total Invoiced"),
                    React.createElement("p", { className: "text-2xl font-bold text-gray-900" },
                        "$",
                        summary.totalInvoiced.toFixed(2))),
                React.createElement("div", null,
                    React.createElement("p", { className: "text-sm text-gray-600" }, "Total Paid"),
                    React.createElement("p", { className: "text-2xl font-bold text-green-600" },
                        "$",
                        summary.totalPaid.toFixed(2))),
                React.createElement("div", null,
                    React.createElement("p", { className: "text-sm text-gray-600" }, "Outstanding"),
                    React.createElement("p", { className: "text-2xl font-bold text-orange-600" },
                        "$",
                        summary.totalOutstanding.toFixed(2))),
                React.createElement("div", null,
                    React.createElement("p", { className: "text-sm text-gray-600" }, "Total Expenses"),
                    React.createElement("p", { className: "text-2xl font-bold text-red-600" },
                        "$",
                        summary.totalExpenses.toFixed(2)))),
            React.createElement("div", { className: "pt-4 border-t" },
                React.createElement("p", { className: "text-sm text-gray-600" }, "Net Profit"),
                React.createElement("p", { className: "text-2xl font-bold " + (summary.netProfit >= 0 ? "text-green-600" : "text-red-600") },
                    "$",
                    summary.netProfit.toFixed(2))))));
}
exports.FinancialSummaryCard = FinancialSummaryCard;
/**
 * Invoice Metrics Card
 */
function InvoiceMetricsCard() {
    var _a = trpc_1.trpc.analytics.invoiceMetrics.useQuery({}), metrics = _a.data, isLoading = _a.isLoading;
    if (isLoading) {
        return (React.createElement(card_1.Card, { className: "animate-pulse" },
            React.createElement(card_1.CardHeader, null,
                React.createElement("div", { className: "h-5 bg-gray-200 rounded w-1/3" })),
            React.createElement(card_1.CardContent, null,
                React.createElement("div", { className: "space-y-2" }, __spreadArrays(Array(3)).map(function (_, i) { return (React.createElement("div", { key: i, className: "h-4 bg-gray-200 rounded w-1/2" })); })))));
    }
    if (!metrics || metrics.length === 0) {
        return null;
    }
    return (React.createElement(card_1.Card, null,
        React.createElement(card_1.CardHeader, null,
            React.createElement(card_1.CardTitle, null, "Invoice Status Breakdown"),
            React.createElement(card_1.CardDescription, null, "By status and amount")),
        React.createElement(card_1.CardContent, null,
            React.createElement("div", { className: "space-y-3" }, metrics.map(function (metric) { return (React.createElement("div", { key: metric.status + "-" + metric.count, className: "flex items-center justify-between" },
                React.createElement("div", { className: "flex items-center gap-2" },
                    React.createElement("div", { className: "w-3 h-3 rounded-full bg-blue-500" }),
                    React.createElement("span", { className: "text-sm font-medium capitalize" }, metric.status)),
                React.createElement("div", { className: "text-right" },
                    React.createElement("p", { className: "text-sm font-bold" },
                        "$",
                        parseFloat(metric.total || 0).toFixed(2)),
                    React.createElement("p", { className: "text-xs text-gray-500" },
                        metric.count,
                        " invoices")))); })))));
}
exports.InvoiceMetricsCard = InvoiceMetricsCard;
/**
 * Project Status Distribution
 */
function ProjectStatusCard() {
    var _a = trpc_1.trpc.analytics.projectStatusDistribution.useQuery({}), distribution = _a.data, isLoading = _a.isLoading;
    if (isLoading) {
        return (React.createElement(card_1.Card, { className: "animate-pulse" },
            React.createElement(card_1.CardHeader, null,
                React.createElement("div", { className: "h-5 bg-gray-200 rounded w-1/3" })),
            React.createElement(card_1.CardContent, null,
                React.createElement("div", { className: "space-y-2" }, __spreadArrays(Array(3)).map(function (_, i) { return (React.createElement("div", { key: i, className: "h-4 bg-gray-200 rounded w-1/2" })); })))));
    }
    if (!distribution || distribution.length === 0) {
        return null;
    }
    var statusColors = {
        planning: "bg-gray-200",
        active: "bg-green-200",
        on_hold: "bg-yellow-200",
        completed: "bg-blue-200",
        cancelled: "bg-red-200"
    };
    return (React.createElement(card_1.Card, null,
        React.createElement(card_1.CardHeader, null,
            React.createElement(card_1.CardTitle, null, "Project Status Distribution"),
            React.createElement(card_1.CardDescription, null, "Active projects by status")),
        React.createElement(card_1.CardContent, null,
            React.createElement("div", { className: "space-y-3" }, distribution.map(function (item) { return (React.createElement("div", { key: item.status },
                React.createElement("div", { className: "flex items-center justify-between mb-1" },
                    React.createElement("span", { className: "text-sm font-medium capitalize" }, item.status),
                    React.createElement("span", { className: "text-sm font-bold" }, item.count)),
                React.createElement("div", { className: "w-full bg-gray-200 rounded-full h-2" },
                    React.createElement("div", { className: "h-2 rounded-full " + (statusColors[item.status] || "bg-blue-500"), style: {
                            width: (item.count / Math.max.apply(Math, distribution.map(function (d) { return d.count; }))) * 100 + "%"
                        } })))); })))));
}
exports.ProjectStatusCard = ProjectStatusCard;
/**
 * Client Distribution Card
 */
function ClientDistributionCard() {
    var _a = trpc_1.trpc.analytics.clientDistribution.useQuery({}), distribution = _a.data, isLoading = _a.isLoading;
    if (isLoading) {
        return (React.createElement(card_1.Card, { className: "animate-pulse" },
            React.createElement(card_1.CardHeader, null,
                React.createElement("div", { className: "h-5 bg-gray-200 rounded w-1/3" })),
            React.createElement(card_1.CardContent, null,
                React.createElement("div", { className: "space-y-2" }, __spreadArrays(Array(3)).map(function (_, i) { return (React.createElement("div", { key: i, className: "h-4 bg-gray-200 rounded w-1/2" })); })))));
    }
    if (!distribution || distribution.length === 0) {
        return null;
    }
    return (React.createElement(card_1.Card, null,
        React.createElement(card_1.CardHeader, null,
            React.createElement(card_1.CardTitle, null, "Client Distribution"),
            React.createElement(card_1.CardDescription, null, "By status")),
        React.createElement(card_1.CardContent, null,
            React.createElement("div", { className: "space-y-3" }, distribution.map(function (item) { return (React.createElement("div", { key: item.status, className: "flex items-center justify-between" },
                React.createElement("span", { className: "text-sm font-medium capitalize" }, item.status),
                React.createElement("span", { className: "text-sm font-bold text-blue-600" }, item.count))); })))));
}
exports.ClientDistributionCard = ClientDistributionCard;
