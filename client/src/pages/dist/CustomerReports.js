"use strict";
exports.__esModule = true;
var react_1 = require("react");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var card_1 = require("@/components/ui/card");
var stats_card_1 = require("@/components/ui/stats-card");
var recharts_1 = require("recharts");
var table_1 = require("@/components/ui/table");
var select_1 = require("@/components/ui/select");
var trpc_1 = require("@/lib/trpc");
var currency_1 = require("@/lib/currency");
var lucide_react_1 = require("lucide-react");
function CustomerReports() {
    var _a = react_1.useState(String(new Date().getFullYear())), yearFilter = _a[0], setYearFilter = _a[1];
    var _b = currency_1.useCurrencySettings(), symbol = _b.symbol, position = _b.position;
    // Fetch customer data
    var _c = trpc_1.trpc.clients.list.useQuery({}).data, clients = _c === void 0 ? [] : _c;
    var _d = trpc_1.trpc.invoices.list.useQuery({}).data, invoices = _d === void 0 ? [] : _d;
    var _e = trpc_1.trpc.contacts.list.useQuery({}).data, contacts = _e === void 0 ? [] : _e;
    var currentYear = new Date().getFullYear();
    var yearOptions = [currentYear, currentYear - 1, currentYear - 2].map(String);
    var fmt = react_1.useCallback(function (amount) {
        var value = amount / 100;
        if (position === "prefix")
            return "" + symbol + value.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + "K";
        return value.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + "K" + symbol;
    }, [symbol, position]);
    // Filter invoices by year
    var filteredInvoices = react_1.useMemo(function () {
        return invoices.filter(function (inv) {
            var date = new Date(inv.invoiceDate || inv.issueDate);
            return date.getFullYear() === Number(yearFilter);
        });
    }, [invoices, yearFilter]);
    var totalClients = clients.length;
    var activeClients = clients.filter(function (c) { return c.status === "active"; }).length;
    var totalRevenue = react_1.useMemo(function () { return filteredInvoices.reduce(function (sum, inv) { return sum + (inv.total || 0); }, 0); }, [filteredInvoices]);
    var avgClientValue = totalClients > 0 ? totalRevenue / totalClients : 0;
    // Top clients by revenue
    var topClients = react_1.useMemo(function () {
        var clientMap = {};
        filteredInvoices.forEach(function (inv) {
            var clientId = inv.clientId || "unknown";
            clientMap[clientId] = (clientMap[clientId] || 0) + (inv.total || 0);
        });
        return Object.entries(clientMap)
            .map(function (_a) {
            var clientId = _a[0], total = _a[1];
            var client = clients.find(function (c) { return c.id === clientId; });
            return {
                name: (client === null || client === void 0 ? void 0 : client.companyName) || "Unknown",
                value: total,
                id: clientId
            };
        })
            .sort(function (a, b) { return b.value - a.value; })
            .slice(0, 10)
            .map(function (item) { return ({
            name: item.name.length > 20 ? item.name.substring(0, 17) + "..." : item.name,
            value: Math.round(item.value / 100)
        }); });
    }, [clients, filteredInvoices]);
    // Clients by status
    var clientsByStatus = react_1.useMemo(function () {
        var statusMap = {};
        clients.forEach(function (c) {
            var status = c.status || "unknown";
            statusMap[status] = (statusMap[status] || 0) + 1;
        });
        return Object.entries(statusMap).map(function (_a) {
            var status = _a[0], count = _a[1];
            return ({
                name: status.charAt(0).toUpperCase() + status.slice(1),
                value: count
            });
        });
    }, [clients]);
    var COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Customer Reports" },
        React.createElement("div", { className: "max-w-7xl mx-auto" },
            React.createElement("div", { className: "flex gap-4 mb-6" },
                React.createElement(select_1.Select, { value: yearFilter, onValueChange: setYearFilter },
                    React.createElement(select_1.SelectTrigger, { className: "w-40" },
                        React.createElement(select_1.SelectValue, null)),
                    React.createElement(select_1.SelectContent, null, yearOptions.map(function (year) { return (React.createElement(select_1.SelectItem, { key: year, value: year }, year)); })))),
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 mb-6" },
                React.createElement(stats_card_1.StatsCard, { title: "Total Clients", value: totalClients.toString(), icon: React.createElement(lucide_react_1.Users, { className: "h-4 w-4" }), trend: 5, trendLabel: "vs last year" }),
                React.createElement(stats_card_1.StatsCard, { title: "Active Clients", value: activeClients.toString(), icon: React.createElement(lucide_react_1.TrendingUp, { className: "h-4 w-4" }), trend: 8, trendLabel: "client retention" }),
                React.createElement(stats_card_1.StatsCard, { title: "Total Revenue", value: fmt(totalRevenue), icon: React.createElement(lucide_react_1.DollarSign, { className: "h-4 w-4" }), trend: 12, trendLabel: "vs last year" }),
                React.createElement(stats_card_1.StatsCard, { title: "Avg Client Value", value: fmt(avgClientValue), icon: React.createElement(lucide_react_1.Award, { className: "h-4 w-4" }), trend: 3, trendLabel: "growth rate" })),
            React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6" },
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "Top Clients by Revenue"),
                        React.createElement(card_1.CardDescription, null,
                            "Top 10 clients in ",
                            yearFilter)),
                    React.createElement(card_1.CardContent, null,
                        React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                            React.createElement(recharts_1.BarChart, { data: topClients },
                                React.createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }),
                                React.createElement(recharts_1.XAxis, { dataKey: "name", angle: -45, textAnchor: "end", height: 100 }),
                                React.createElement(recharts_1.YAxis, null),
                                React.createElement(recharts_1.Tooltip, { formatter: function (value) { return "$" + value + "K"; }, contentStyle: { backgroundColor: "rgba(0, 0, 0, 0.8)", border: "none", borderRadius: "8px" } }),
                                React.createElement(recharts_1.Bar, { dataKey: "value", fill: "#3b82f6", name: "Revenue" }))))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "Clients by Status"),
                        React.createElement(card_1.CardDescription, null, "Client distribution")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                            React.createElement(recharts_1.PieChart, null,
                                React.createElement(recharts_1.Pie, { data: clientsByStatus, cx: "50%", cy: "50%", labelLine: false, label: function (_a) {
                                        var name = _a.name, value = _a.value;
                                        return name + ": " + value;
                                    }, outerRadius: 80, fill: "#8884d8", dataKey: "value" }, clientsByStatus.map(function (entry, index) { return (React.createElement(recharts_1.Cell, { key: "cell-" + index, fill: COLORS[index % COLORS.length] })); })),
                                React.createElement(recharts_1.Tooltip, null)))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Client Summary"),
                    React.createElement(card_1.CardDescription, null, "All clients in the system")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "overflow-x-auto" },
                        React.createElement(table_1.Table, null,
                            React.createElement(table_1.TableHeader, null,
                                React.createElement(table_1.TableRow, null,
                                    React.createElement(table_1.TableHead, null, "Company"),
                                    React.createElement(table_1.TableHead, null, "Contact"),
                                    React.createElement(table_1.TableHead, null, "Email"),
                                    React.createElement(table_1.TableHead, null, "Status"),
                                    React.createElement(table_1.TableHead, { className: "text-right" }, "Total Invoiced"))),
                            React.createElement(table_1.TableBody, null, clients.slice(0, 20).map(function (client) {
                                var clientRevenue = filteredInvoices
                                    .filter(function (inv) { return inv.clientId === client.id; })
                                    .reduce(function (sum, inv) { return sum + (inv.total || 0); }, 0);
                                return (React.createElement(table_1.TableRow, { key: client.id },
                                    React.createElement(table_1.TableCell, { className: "font-medium" }, client.companyName),
                                    React.createElement(table_1.TableCell, null, client.contactName),
                                    React.createElement(table_1.TableCell, null, client.email),
                                    React.createElement(table_1.TableCell, null,
                                        React.createElement("span", { className: "px-2 py-1 rounded-full text-xs font-medium " + (client.status === "active"
                                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                                                : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300") }, client.status || "unknown")),
                                    React.createElement(table_1.TableCell, { className: "text-right font-medium" },
                                        "$",
                                        (clientRevenue / 100).toLocaleString())));
                            })))))))));
}
exports["default"] = CustomerReports;
