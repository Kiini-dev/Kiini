"use strict";
exports.__esModule = true;
var react_1 = require("react");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var trpc_1 = require("@/lib/trpc");
var date_fns_1 = require("date-fns");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var table_1 = require("@/components/ui/table");
var recharts_1 = require("recharts");
var lucide_react_1 = require("lucide-react");
var stats_card_1 = require("@/components/ui/stats-card");
var SalesReportsPage = function () {
    var _a, _b, _c, _d, _e;
    var _f = react_1.useState(date_fns_1.format(new Date(), "yyyy-MM-01")), from = _f[0], setFrom = _f[1];
    var _g = react_1.useState(date_fns_1.format(new Date(), "yyyy-MM-dd")), to = _g[0], setTo = _g[1];
    var range = react_1.useMemo(function () { return ({ from: new Date(from), to: new Date(to) }); }, [from, to]);
    var revenueByClient = trpc_1.trpc.salesReports.getRevenueByClient.useQuery(range, { enabled: !!from && !!to });
    var revenueByService = trpc_1.trpc.salesReports.getRevenueByService.useQuery(range, { enabled: !!from && !!to });
    var trends = trpc_1.trpc.salesReports.getSalesTrends.useQuery(range, { enabled: !!from && !!to });
    var invoiceAging = trpc_1.trpc.salesReports.getInvoiceAging.useQuery(undefined, { enabled: !!from && !!to });
    var paymentCol = trpc_1.trpc.salesReports.getPaymentCollection.useQuery(range, { enabled: !!from && !!to });
    var isLoading = revenueByClient.isLoading ||
        revenueByService.isLoading ||
        trends.isLoading ||
        invoiceAging.isLoading ||
        paymentCol.isLoading;
    return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: "Sales Reports", breadcrumbs: [{ label: "Reports", href: "/reports" }, { label: "Sales Reports" }] },
        react_1["default"].createElement("div", { className: "space-y-6" },
            react_1["default"].createElement("div", { className: "flex flex-wrap gap-4 items-end" },
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("label", { className: "block text-sm font-medium" }, "From"),
                    react_1["default"].createElement(input_1.Input, { type: "date", value: from, onChange: function (e) { return setFrom(e.target.value); } })),
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("label", { className: "block text-sm font-medium" }, "To"),
                    react_1["default"].createElement(input_1.Input, { type: "date", value: to, onChange: function (e) { return setTo(e.target.value); } })),
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement(button_1.Button, { onClick: function () {
                            revenueByClient.refetch();
                            revenueByService.refetch();
                            trends.refetch();
                            invoiceAging.refetch();
                            paymentCol.refetch();
                        } }, "Refresh"))),
            react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4" },
                react_1["default"].createElement(stats_card_1.StatsCard, { label: "Total Invoiced", value: react_1["default"].createElement(react_1["default"].Fragment, null,
                        "Ksh ",
                        ((((_a = paymentCol.data) === null || _a === void 0 ? void 0 : _a.totalInvoiced) || 0) / 100).toLocaleString("en-KE", { maximumFractionDigits: 2 })), icon: react_1["default"].createElement(lucide_react_1.DollarSign, { className: "h-5 w-5" }), color: "border-l-green-500" }),
                react_1["default"].createElement(stats_card_1.StatsCard, { label: "Total Paid", value: react_1["default"].createElement(react_1["default"].Fragment, null,
                        "Ksh ",
                        ((((_b = paymentCol.data) === null || _b === void 0 ? void 0 : _b.totalPaid) || 0) / 100).toLocaleString("en-KE", { maximumFractionDigits: 2 })), icon: react_1["default"].createElement(lucide_react_1.DollarSign, { className: "h-5 w-5" }), color: "border-l-blue-500" }),
                react_1["default"].createElement(stats_card_1.StatsCard, { label: "Collection Rate", value: react_1["default"].createElement(react_1["default"].Fragment, null,
                        (((_c = paymentCol.data) === null || _c === void 0 ? void 0 : _c.collectionRate) || 0).toFixed(1),
                        "%"), icon: react_1["default"].createElement(lucide_react_1.Users, { className: "h-5 w-5" }), color: "border-l-purple-500" }),
                react_1["default"].createElement(stats_card_1.StatsCard, { label: "Top Client", value: revenueByClient.data && ((_d = revenueByClient.data[0]) === null || _d === void 0 ? void 0 : _d.clientName) ? revenueByClient.data[0].clientName : "-", icon: react_1["default"].createElement(lucide_react_1.Layers, { className: "h-5 w-5" }), color: "border-l-amber-500" })),
            react_1["default"].createElement("div", { className: "bg-white p-6 rounded shadow" },
                react_1["default"].createElement("h2", { className: "text-xl font-semibold mb-4" }, "Monthly Sales Trend"),
                trends.data && trends.data.length > 0 ? (react_1["default"].createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                    react_1["default"].createElement(recharts_1.LineChart, { data: trends.data },
                        react_1["default"].createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }),
                        react_1["default"].createElement(recharts_1.XAxis, { dataKey: "month" }),
                        react_1["default"].createElement(recharts_1.YAxis, null),
                        react_1["default"].createElement(recharts_1.Tooltip, { formatter: function (v) { return "Ksh " + v.toLocaleString(); } }),
                        react_1["default"].createElement(recharts_1.Legend, null),
                        react_1["default"].createElement(recharts_1.Line, { type: "monotone", dataKey: "total", stroke: "#3b82f6", name: "Invoiced" })))) : (react_1["default"].createElement("p", { className: "text-gray-500" }, "No data available"))),
            react_1["default"].createElement("div", { className: "bg-white p-6 rounded shadow" },
                react_1["default"].createElement("h2", { className: "text-xl font-semibold mb-4" }, "Revenue by Client"),
                react_1["default"].createElement("div", { className: "overflow-auto" },
                    react_1["default"].createElement(table_1.Table, null,
                        react_1["default"].createElement(table_1.TableHeader, null,
                            react_1["default"].createElement(table_1.TableRow, null,
                                react_1["default"].createElement(table_1.TableCell, null, "Client"),
                                react_1["default"].createElement(table_1.TableCell, { className: "text-right" }, "Total"))),
                        react_1["default"].createElement(table_1.TableBody, null, Array.isArray(revenueByClient.data) && revenueByClient.data.map(function (row) { return (react_1["default"].createElement(table_1.TableRow, { key: row.clientId },
                            react_1["default"].createElement(table_1.TableCell, null, row.clientName),
                            react_1["default"].createElement(table_1.TableCell, { className: "text-right" },
                                "Ksh ",
                                ((row.total || 0) / 100).toLocaleString("en-KE", { maximumFractionDigits: 2 })))); }))))),
            react_1["default"].createElement("div", { className: "bg-white p-6 rounded shadow" },
                react_1["default"].createElement("h2", { className: "text-xl font-semibold mb-4" }, "Revenue by Service"),
                react_1["default"].createElement("div", { className: "overflow-auto" },
                    react_1["default"].createElement(table_1.Table, null,
                        react_1["default"].createElement(table_1.TableHeader, null,
                            react_1["default"].createElement(table_1.TableRow, null,
                                react_1["default"].createElement(table_1.TableCell, null, "Service"),
                                react_1["default"].createElement(table_1.TableCell, { className: "text-right" }, "Total"))),
                        react_1["default"].createElement(table_1.TableBody, null, (_e = revenueByService.data) === null || _e === void 0 ? void 0 : _e.map(function (row) { return (react_1["default"].createElement(table_1.TableRow, { key: row.serviceId },
                            react_1["default"].createElement(table_1.TableCell, null, row.serviceName),
                            react_1["default"].createElement(table_1.TableCell, { className: "text-right" },
                                "Ksh ",
                                ((row.total || 0) / 100).toLocaleString("en-KE", { maximumFractionDigits: 2 })))); }))))))));
};
exports["default"] = SalesReportsPage;
