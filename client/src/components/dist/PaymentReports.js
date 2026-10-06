"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var react_1 = require("react");
var sonner_1 = require("sonner");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var badge_1 = require("@/components/ui/badge");
var select_1 = require("@/components/ui/select");
var recharts_1 = require("recharts");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var paymentMethods_1 = require("@/const/paymentMethods");
/**
 * PaymentReports component
 *
 * Displays payment reports with filters and export options
 * Features:
 * - Date range filtering
 * - Payment method filtering
 * - Client filtering
 * - Summary statistics
 * - Visual charts by method
 * - CSV export functionality
 */
function PaymentReports() {
    var _a = react_1.useState(function () {
        var date = new Date();
        date.setDate(date.getDate() - 30);
        return date.toISOString().split('T')[0];
    }), startDate = _a[0], setStartDate = _a[1];
    var _b = react_1.useState(function () { return new Date().toISOString().split('T')[0]; }), endDate = _b[0], setEndDate = _b[1];
    var _c = react_1.useState(""), paymentMethod = _c[0], setPaymentMethod = _c[1];
    var _d = react_1.useState(""), clientId = _d[0], setClientId = _d[1];
    var _e = trpc_1.trpc.invoices.payments.report.useQuery({
        startDate: startDate,
        endDate: endDate,
        paymentMethod: paymentMethod || undefined,
        clientId: clientId || undefined
    }), reportData = _e.data, isLoading = _e.isLoading, refetch = _e.refetch;
    var clientsData = trpc_1.trpc.clients.list.useQuery({}).data;
    var handleResetFilters = function () {
        var date = new Date();
        date.setDate(date.getDate() - 30);
        setStartDate(date.toISOString().split('T')[0]);
        setEndDate(new Date().toISOString().split('T')[0]);
        setPaymentMethod("");
        setClientId("");
    };
    var handleExportCSV = function () {
        if (!reportData || !reportData.payments || reportData.payments.length === 0) {
            sonner_1.toast.warning("No payments to export");
            return;
        }
        var headers = [
            "Payment Date",
            "Invoice Number",
            "Amount (KES)",
            "Payment Method",
            "Reference",
            "Receipt ID",
        ];
        var rows = reportData.payments.map(function (p) { return [
            new Date(p.paymentDate).toLocaleDateString(),
            p.invoiceNumber || "N/A",
            (p.paymentAmount / 100).toFixed(2),
            p.paymentMethod,
            p.reference || "",
            p.receiptId || "",
        ]; });
        // Add summary section
        var summary = reportData.summary;
        rows.push([]);
        rows.push(["SUMMARY"]);
        rows.push(["Total Payments", summary.totalPayments]);
        rows.push(["Total Amount (KES)", (summary.totalAmount / 100).toFixed(2)]);
        if (summary.byMethod && Array.isArray(summary.byMethod)) {
            rows.push([]);
            rows.push(["By Payment Method"]);
            summary.byMethod.forEach(function (item) {
                rows.push([item.method, item.count, (item.amount / 100).toFixed(2)]);
            });
        }
        // Create CSV string
        var csv = __spreadArrays([
            headers.join(",")
        ], rows.map(function (row) { return row.map(function (cell) { return "\"" + cell + "\""; }).join(","); })).join("\n");
        // Download CSV
        var blob = new Blob([csv], { type: "text/csv" });
        var url = window.URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = "payment-report-" + new Date().toISOString().split('T')[0] + ".csv";
        a.click();
        window.URL.revokeObjectURL(url);
    };
    var summary = (reportData === null || reportData === void 0 ? void 0 : reportData.summary) || {};
    var payments = (reportData === null || reportData === void 0 ? void 0 : reportData.payments) || [];
    // Prepare chart data for payment methods
    var chartData = summary.byMethod
        ? summary.byMethod.map(function (item) { return ({
            name: item.method,
            amount: item.amount / 100,
            count: item.count,
            label: item.method + ": " + item.count + " payment(s)"
        }); })
        : [];
    var COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];
    return (React.createElement("div", { className: "space-y-6" },
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                    React.createElement(lucide_react_1.Filter, { className: "w-4 h-4" }),
                    "Report Filters")),
            React.createElement(card_1.CardContent, null,
                React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-5 gap-4" },
                    React.createElement("div", { className: "flex flex-col gap-2" },
                        React.createElement("label", { className: "text-sm font-medium text-slate-700 dark:text-slate-200" }, "From Date"),
                        React.createElement("div", { className: "flex gap-2" },
                            React.createElement(lucide_react_1.Calendar, { className: "w-4 h-4 text-slate-400 mt-3" }),
                            React.createElement(input_1.Input, { type: "date", value: startDate, onChange: function (e) { return setStartDate(e.target.value); }, className: "flex-1" }))),
                    React.createElement("div", { className: "flex flex-col gap-2" },
                        React.createElement("label", { className: "text-sm font-medium text-slate-700 dark:text-slate-200" }, "To Date"),
                        React.createElement("div", { className: "flex gap-2" },
                            React.createElement(lucide_react_1.Calendar, { className: "w-4 h-4 text-slate-400 mt-3" }),
                            React.createElement(input_1.Input, { type: "date", value: endDate, onChange: function (e) { return setEndDate(e.target.value); }, className: "flex-1" }))),
                    React.createElement("div", { className: "flex flex-col gap-2" },
                        React.createElement("label", { className: "text-sm font-medium text-slate-700 dark:text-slate-200" }, "Payment Method"),
                        React.createElement(select_1.Select, { value: paymentMethod, onValueChange: setPaymentMethod },
                            React.createElement(select_1.SelectTrigger, null,
                                React.createElement(select_1.SelectValue, { placeholder: "All Methods" })),
                            React.createElement(select_1.SelectContent, null,
                                React.createElement(select_1.SelectItem, { value: "all" }, "All Methods"),
                                paymentMethods_1.getPaymentMethodOptions().map(function (method) { return (React.createElement(select_1.SelectItem, { key: method.value, value: method.value }, method.label)); })))),
                    React.createElement("div", { className: "flex flex-col gap-2" },
                        React.createElement("label", { className: "text-sm font-medium text-slate-700 dark:text-slate-200" }, "Client"),
                        React.createElement(select_1.Select, { value: clientId || "all", onValueChange: function (v) { return setClientId(v === "all" ? "" : v); } },
                            React.createElement(select_1.SelectTrigger, null,
                                React.createElement(select_1.SelectValue, { placeholder: "All Clients" })),
                            React.createElement(select_1.SelectContent, null,
                                React.createElement(select_1.SelectItem, { value: "all" }, "All Clients"),
                                clientsData &&
                                    clientsData.map(function (client) { return (React.createElement(select_1.SelectItem, { key: client.id, value: client.id }, client.name || "N/A")); })))),
                    React.createElement("div", { className: "flex flex-col gap-2 justify-end" },
                        React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: handleResetFilters, className: "flex items-center gap-2" },
                            React.createElement(lucide_react_1.RotateCcw, { className: "w-4 h-4" }),
                            "Reset"),
                        React.createElement(button_1.Button, { size: "sm", onClick: function () { return handleExportCSV(); }, className: "flex items-center gap-2 bg-blue-600 hover:bg-blue-700" },
                            React.createElement(lucide_react_1.Download, { className: "w-4 h-4" }),
                            "Export CSV"))))),
        !isLoading && (React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4" },
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, { className: "pb-2" },
                    React.createElement(card_1.CardTitle, { className: "text-sm font-medium text-slate-600 dark:text-slate-300" }, "Total Payments")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "text-2xl font-bold text-slate-900 dark:text-slate-50" }, summary.totalPayments || 0),
                    React.createElement("p", { className: "text-xs text-slate-500 dark:text-slate-400 mt-1" }, "transactions"))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, { className: "pb-2" },
                    React.createElement(card_1.CardTitle, { className: "text-sm font-medium text-slate-600 dark:text-slate-300" }, "Total Amount")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "text-2xl font-bold text-green-600 dark:text-green-400" }, summary.totalAmount
                        ? "KES " + (summary.totalAmount / 100).toLocaleString('en-KE', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        })
                        : "KES 0.00"),
                    React.createElement("p", { className: "text-xs text-slate-500 dark:text-slate-400 mt-1" }, "total received"))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, { className: "pb-2" },
                    React.createElement(card_1.CardTitle, { className: "text-sm font-medium text-slate-600 dark:text-slate-300" }, "Average Payment")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "text-2xl font-bold text-blue-600 dark:text-blue-400" }, summary.averagePayment
                        ? "KES " + (summary.averagePayment / 100).toLocaleString('en-KE', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        })
                        : "KES 0.00"),
                    React.createElement("p", { className: "text-xs text-slate-500 dark:text-slate-400 mt-1" }, "per transaction"))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, { className: "pb-2" },
                    React.createElement(card_1.CardTitle, { className: "text-sm font-medium text-slate-600 dark:text-slate-300" }, "Date Range")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "text-sm font-medium text-slate-900 dark:text-slate-50" }, new Date(startDate).toLocaleDateString()),
                    React.createElement("p", { className: "text-xs text-slate-500 dark:text-slate-400 mt-1" },
                        "to ",
                        new Date(endDate).toLocaleDateString()))))),
        !isLoading && chartData.length > 0 && (React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4" },
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Payments by Method (Count)")),
                React.createElement(card_1.CardContent, null,
                    React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                        React.createElement(recharts_1.BarChart, { data: chartData },
                            React.createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }),
                            React.createElement(recharts_1.XAxis, { dataKey: "name" }),
                            React.createElement(recharts_1.YAxis, null),
                            React.createElement(recharts_1.Tooltip, null),
                            React.createElement(recharts_1.Bar, { dataKey: "count", fill: "#3b82f6", name: "Number of Payments" }))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Payments by Method (Amount)")),
                React.createElement(card_1.CardContent, null,
                    React.createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                        React.createElement(recharts_1.PieChart, null,
                            React.createElement(recharts_1.Pie, { data: chartData, dataKey: "amount", nameKey: "name", cx: "50%", cy: "50%", outerRadius: 100, label: function (_a) {
                                    var name = _a.name, percent = _a.percent;
                                    return name + " " + (percent * 100).toFixed(0) + "%";
                                } }, chartData.map(function (entry) { return (React.createElement(recharts_1.Cell, { key: entry.name, fill: COLORS[chartData.indexOf(entry) % COLORS.length] })); })),
                            React.createElement(recharts_1.Tooltip, { formatter: function (value) { return "KES " + (value / 100).toFixed(2); } }))))))),
        !isLoading && summary.byMethod && Array.isArray(summary.byMethod) && (React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, null, "Payment Methods Detail")),
            React.createElement(card_1.CardContent, null,
                React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" }, summary.byMethod.map(function (method) { return (React.createElement("div", { key: method.method, className: "p-4 border rounded-lg dark:border-slate-700" },
                    React.createElement("div", { className: "flex items-center justify-between mb-2" },
                        React.createElement(badge_1.Badge, { variant: "outline" }, method.method),
                        React.createElement("span", { className: "text-sm font-medium" },
                            method.count,
                            " transaction(s)")),
                    React.createElement("div", { className: "text-2xl font-bold text-slate-900 dark:text-slate-50" },
                        "KES ",
                        (method.amount / 100).toLocaleString('en-KE', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        })),
                    React.createElement("div", { className: "text-xs text-slate-500 dark:text-slate-400 mt-2" },
                        "Avg: KES ",
                        ((method.amount / method.count) / 100).toLocaleString('en-KE', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        })))); }))))),
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, null, "Payment Details"),
                React.createElement(card_1.CardDescription, null, isLoading ? "Loading..." : payments.length + " payment(s) found")),
            React.createElement(card_1.CardContent, null, isLoading ? (React.createElement("div", { className: "flex items-center justify-center py-12" },
                React.createElement(lucide_react_1.Loader2, { className: "h-6 w-6 animate-spin text-blue-600" }))) : payments.length > 0 ? (React.createElement("div", { className: "border rounded-lg overflow-x-auto" },
                React.createElement("table", { className: "w-full" },
                    React.createElement("thead", { className: "bg-slate-50 dark:bg-slate-900/40 border-b" },
                        React.createElement("tr", null,
                            React.createElement("th", { className: "px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-200" }, "Date"),
                            React.createElement("th", { className: "px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-200" }, "Invoice"),
                            React.createElement("th", { className: "px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-200" }, "Amount"),
                            React.createElement("th", { className: "px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-200" }, "Method"),
                            React.createElement("th", { className: "px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-200" }, "Reference"),
                            React.createElement("th", { className: "px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-200" }, "Receipt"))),
                    React.createElement("tbody", null, payments.map(function (payment) { return (React.createElement("tr", { key: payment.id || payment.paymentDate, className: "border-b hover:bg-slate-50 dark:hover:bg-slate-900/30" },
                        React.createElement("td", { className: "px-4 py-3 text-sm text-slate-900 dark:text-slate-100" }, new Date(payment.paymentDate).toLocaleDateString()),
                        React.createElement("td", { className: "px-4 py-3 text-sm text-slate-900 dark:text-slate-100" }, payment.invoiceNumber || "N/A"),
                        React.createElement("td", { className: "px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100" },
                            "KES ",
                            (payment.paymentAmount / 100).toLocaleString('en-KE', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })),
                        React.createElement("td", { className: "px-4 py-3 text-sm" },
                            React.createElement(badge_1.Badge, { variant: "secondary" }, payment.paymentMethod)),
                        React.createElement("td", { className: "px-4 py-3 text-sm text-slate-600 dark:text-slate-400" }, payment.reference || "-"),
                        React.createElement("td", { className: "px-4 py-3 text-sm text-slate-600 dark:text-slate-400" }, payment.receiptId ? (React.createElement(badge_1.Badge, { variant: "outline" },
                            payment.receiptId.substring(0, 8),
                            "...")) : ("-")))); }))))) : (React.createElement("div", { className: "text-center py-8 text-slate-500 dark:text-slate-400" },
                React.createElement("p", null, "No payments found for the selected date range and filters")))))));
}
exports["default"] = PaymentReports;
