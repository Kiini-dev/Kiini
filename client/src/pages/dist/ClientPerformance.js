"use strict";
exports.__esModule = true;
var card_1 = require("@/components/ui/card");
var table_1 = require("@/components/ui/table");
var recharts_1 = require("recharts");
var lucide_react_1 = require("lucide-react");
var button_1 = require("@/components/ui/button");
var sonner_1 = require("sonner");
var trpc_1 = require("@/lib/trpc");
var format_1 = require("@/utils/format");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var stats_card_1 = require("@/components/ui/stats-card");
var exportCsv_1 = require("@/utils/exportCsv");
function ClientPerformance() {
    var _a, _b, _c, _d, _e, _f;
    var performance = trpc_1.trpc.advancedReports.getClientPerformance.useQuery({
        limit: 15
    }).data;
    if (!performance)
        return React.createElement("div", null, "Loading...");
    // Prepare chart data
    var chartData = ((_a = performance.clients) === null || _a === void 0 ? void 0 : _a.map(function (client) { return ({
        name: client.clientName.slice(0, 15),
        totalQuotes: client.totalQuotes,
        converted: client.convertedQuotes,
        value: client.totalValue,
        conversionRate: client.conversionRate
    }); })) || [];
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Client Performance", icon: React.createElement(lucide_react_1.TrendingUp, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/crm-home" }, { label: "Clients" }, { label: "Client Performance" }] },
        React.createElement("div", null,
            React.createElement("p", { className: "text-muted-foreground mt-2" }, "Top performing clients by value and conversion metrics")),
        React.createElement("div", { className: "grid grid-cols-4 gap-4" },
            React.createElement(stats_card_1.StatsCard, { label: "Top Client Value", value: format_1.formatCurrency(performance.topClientValue), color: "border-l-pink-500" }),
            React.createElement(stats_card_1.StatsCard, { label: "Avg Client Value", value: format_1.formatCurrency(performance.averageClientValue), color: "border-l-emerald-500" }),
            React.createElement(stats_card_1.StatsCard, { label: "Total Client Revenue", value: format_1.formatCurrency(performance.totalClientRevenue), color: "border-l-orange-500" }),
            React.createElement(stats_card_1.StatsCard, { label: "Active Clients", value: ((_b = performance.clients) === null || _b === void 0 ? void 0 : _b.length) || 0, color: "border-l-purple-500" })),
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, null, "Client Value Distribution"),
                React.createElement(card_1.CardDescription, null, "Top 15 clients by total quote value")),
            React.createElement(card_1.CardContent, null,
                React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 400 },
                    React.createElement(recharts_1.BarChart, { data: chartData },
                        React.createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }),
                        React.createElement(recharts_1.XAxis, { dataKey: "name", angle: -45, textAnchor: "end", height: 80 }),
                        React.createElement(recharts_1.YAxis, null),
                        React.createElement(recharts_1.Tooltip, { formatter: function (value) { return format_1.formatCurrency(value); } }),
                        React.createElement(recharts_1.Legend, null),
                        React.createElement(recharts_1.Bar, { dataKey: "value", fill: "#10b981", name: "Total Value", radius: [8, 8, 0, 0] }))))),
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, null, "Quotes vs Conversion Rate"),
                React.createElement(card_1.CardDescription, null, "Client position: Total quotes vs conversion rate")),
            React.createElement(card_1.CardContent, null,
                React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                    React.createElement(recharts_1.ScatterChart, { margin: { top: 20, right: 20, bottom: 20, left: 20 } },
                        React.createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }),
                        React.createElement(recharts_1.XAxis, { dataKey: "totalQuotes", type: "number", name: "Total Quotes" }),
                        React.createElement(recharts_1.YAxis, { dataKey: "conversionRate", type: "number", name: "Conversion %" }),
                        React.createElement(recharts_1.Tooltip, { formatter: function (value) { return (typeof value === 'number' ? value.toFixed(1) : value); } }),
                        React.createElement(recharts_1.Scatter, { name: "Clients", data: chartData, fill: "#6366f1" }))))),
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, null, "Client Details"),
                React.createElement(card_1.CardDescription, null, "Complete metrics for each top client")),
            React.createElement(card_1.CardContent, null,
                React.createElement("div", { className: "overflow-x-auto" },
                    React.createElement(table_1.Table, null,
                        React.createElement(table_1.TableHeader, null,
                            React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableHead, { className: "w-12" }, "Rank"),
                                React.createElement(table_1.TableHead, null, "Client Name"),
                                React.createElement(table_1.TableHead, { className: "text-right" }, "Total Quotes"),
                                React.createElement(table_1.TableHead, { className: "text-right" }, "Converted"),
                                React.createElement(table_1.TableHead, { className: "text-right" }, "Conversion %"),
                                React.createElement(table_1.TableHead, { className: "text-right" }, "Total Value"),
                                React.createElement(table_1.TableHead, { className: "text-right" }, "Avg Value"))),
                        React.createElement(table_1.TableBody, null, (_c = performance.clients) === null || _c === void 0 ? void 0 : _c.map(function (client, idx) { return (React.createElement(table_1.TableRow, { key: client.clientId, className: "hover:bg-gray-50" },
                            React.createElement(table_1.TableCell, null,
                                React.createElement("div", { className: "flex items-center gap-1" },
                                    idx < 3 && React.createElement(lucide_react_1.Medal, { className: "w-4 h-4 text-yellow-500" }),
                                    idx + 1)),
                            React.createElement(table_1.TableCell, { className: "font-medium" }, client.clientName),
                            React.createElement(table_1.TableCell, { className: "text-right" }, client.totalQuotes),
                            React.createElement(table_1.TableCell, { className: "text-right text-green-600 font-semibold" }, client.convertedQuotes),
                            React.createElement(table_1.TableCell, { className: "text-right" },
                                React.createElement("span", { className: "inline-block px-2 py-1 rounded bg-blue-100 text-blue-800 font-semibold text-sm" }, format_1.formatPercentage(client.conversionRate))),
                            React.createElement(table_1.TableCell, { className: "text-right font-bold" }, format_1.formatCurrency(client.totalValue)),
                            React.createElement(table_1.TableCell, { className: "text-right text-muted-foreground" }, format_1.formatCurrency(client.averageValue)))); })))))),
        React.createElement("div", { className: "grid grid-cols-3 gap-4" },
            React.createElement(card_1.Card, { className: "border-yellow-200 bg-yellow-50" },
                React.createElement(card_1.CardHeader, { className: "pb-3" },
                    React.createElement(card_1.CardTitle, { className: "text-sm flex items-center gap-2" },
                        React.createElement(lucide_react_1.Medal, { className: "w-4 h-4 text-yellow-600" }),
                        "Premium Clients")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("p", { className: "text-2xl font-bold" }, ((_d = performance.clients) === null || _d === void 0 ? void 0 : _d.filter(function (c) { return c.totalValue > 50000; }).length) || 0),
                    React.createElement("p", { className: "text-xs text-muted-foreground mt-1" }, "Value > $50,000"))),
            React.createElement(stats_card_1.StatsCard, { label: "High Conversion", value: ((_e = performance.clients) === null || _e === void 0 ? void 0 : _e.filter(function (c) { return c.conversionRate >= 50; }).length) || 0, description: "Rate \u2265 50%", color: "border-l-green-500" }),
            React.createElement(stats_card_1.StatsCard, { label: "Active Accounts", value: ((_f = performance.clients) === null || _f === void 0 ? void 0 : _f.filter(function (c) { return c.totalQuotes >= 5; }).length) || 0, description: "5+ quotes", color: "border-l-blue-500" })),
        React.createElement(button_1.Button, { className: "gap-2", size: "lg", onClick: function () {
                var rows = (performance.clients || []).map(function (client) { return ({
                    clientName: client.clientName,
                    totalQuotes: client.totalQuotes,
                    convertedQuotes: client.convertedQuotes,
                    conversionRate: client.conversionRate,
                    totalValue: client.totalValue,
                    averageValue: client.averageValue
                }); });
                if (!rows.length) {
                    sonner_1.toast.info("No client data available to export");
                    return;
                }
                exportCsv_1.exportToCsv("client-performance-report", rows);
                sonner_1.toast.success("Client report exported");
            } },
            React.createElement(lucide_react_1.TrendingUp, { className: "w-4 h-4" }),
            "Export Client Report")));
}
exports["default"] = ClientPerformance;
