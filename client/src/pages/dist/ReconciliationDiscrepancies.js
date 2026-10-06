"use strict";
exports.__esModule = true;
var card_1 = require("@/components/ui/card");
var sonner_1 = require("sonner");
var table_1 = require("@/components/ui/table");
var lucide_react_1 = require("lucide-react");
var button_1 = require("@/components/ui/button");
var trpc_1 = require("@/lib/trpc");
var format_1 = require("@/utils/format");
var react_1 = require("react");
var BatchPaymentMatching_1 = require("@/components/BatchPaymentMatching");
var stats_card_1 = require("@/components/ui/stats-card");
var exportCsv_1 = require("@/utils/exportCsv");
function ReconciliationDiscrepancies() {
    var _a = react_1.useState(0.01), threshold = _a[0], setThreshold = _a[1];
    var discrepancies = trpc_1.trpc.paymentReconciliation.getDiscrepancies.useQuery({
        limit: 100,
        threshold: threshold
    }).data;
    if (!discrepancies)
        return React.createElement("div", null, "Loading...");
    // Categorize discrepancies by severity
    var critical = discrepancies.discrepancies.filter(function (d) { return Math.abs(parseFloat(d.variancePercent)) > 10; });
    var major = discrepancies.discrepancies.filter(function (d) {
        var pct = Math.abs(parseFloat(d.variancePercent));
        return pct > 5 && pct <= 10;
    });
    var minor = discrepancies.discrepancies.filter(function (d) {
        var pct = Math.abs(parseFloat(d.variancePercent));
        return pct > 0 && pct <= 5;
    });
    return (React.createElement("div", { className: "space-y-6" },
        React.createElement("div", null,
            React.createElement("h1", { className: "text-3xl font-bold" }, "Reconciliation Discrepancies"),
            React.createElement("p", { className: "text-muted-foreground mt-2" }, "Payment and invoice amount mismatches")),
        React.createElement(BatchPaymentMatching_1.BatchPaymentMatching, null),
        React.createElement("div", { className: "grid grid-cols-4 gap-4" },
            React.createElement(stats_card_1.StatsCard, { label: "Total Discrepancies", value: discrepancies.total, description: React.createElement(React.Fragment, null,
                    discrepancies.discrepancies.length,
                    " shown on this page"), color: "border-l-orange-500" }),
            React.createElement(stats_card_1.StatsCard, { label: "Critical", value: critical.length, description: React.createElement(React.Fragment, null,
                    ">",
                    " 10% difference"), color: "border-l-purple-500" }),
            React.createElement(stats_card_1.StatsCard, { label: "Major", value: major.length, description: "5-10% difference", color: "border-l-green-500" }),
            React.createElement(stats_card_1.StatsCard, { label: "Total Discrepancy Amount", value: format_1.formatCurrency(discrepancies.totalDiscrepancyAmount), description: React.createElement(React.Fragment, null,
                    "Avg: ",
                    format_1.formatCurrency(discrepancies.averageDiscrepancy)), color: "border-l-blue-500" })),
        critical.length > 0 && (React.createElement(card_1.Card, { className: "border-red-300 bg-red-50" },
            React.createElement(card_1.CardHeader, { className: "pb-3" },
                React.createElement(card_1.CardTitle, { className: "flex items-center gap-2 text-red-900" },
                    React.createElement(lucide_react_1.AlertCircle, { className: "w-5 h-5" }),
                    "Critical Discrepancies Require Investigation")),
            React.createElement(card_1.CardContent, { className: "text-red-800" },
                React.createElement("p", null,
                    critical.length,
                    " discrepancies have variance over 10% and need immediate review. Total amount: ",
                    React.createElement("strong", null, format_1.formatCurrency(critical.reduce(function (sum, d) { return sum + Math.abs(d.difference); }, 0))))))),
        critical.length > 0 && (React.createElement(card_1.Card, { className: "border-red-200" },
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                    React.createElement(lucide_react_1.AlertCircle, { className: "w-5 h-5 text-red-600" }),
                    "Critical Discrepancies (",
                    critical.length,
                    ")")),
            React.createElement(card_1.CardContent, null,
                React.createElement("div", { className: "overflow-x-auto" },
                    React.createElement(table_1.Table, null,
                        React.createElement(table_1.TableHeader, null,
                            React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableHead, null, "Invoice"),
                                React.createElement(table_1.TableHead, null, "Client"),
                                React.createElement(table_1.TableHead, { className: "text-right" }, "Invoice Amt"),
                                React.createElement(table_1.TableHead, { className: "text-right" }, "Payment Amt"),
                                React.createElement(table_1.TableHead, { className: "text-right" }, "Difference"),
                                React.createElement(table_1.TableHead, { className: "text-right" }, "Variance %"),
                                React.createElement(table_1.TableHead, { className: "text-center" }, "Resolution"))),
                        React.createElement(table_1.TableBody, null, critical.map(function (d) { return (React.createElement(table_1.TableRow, { key: d.paymentId, className: "hover:bg-red-50" },
                            React.createElement(table_1.TableCell, { className: "font-medium" }, d.invoiceNumber),
                            React.createElement(table_1.TableCell, null, d.clientName),
                            React.createElement(table_1.TableCell, { className: "text-right" }, format_1.formatCurrency(d.invoiceAmount)),
                            React.createElement(table_1.TableCell, { className: "text-right" }, format_1.formatCurrency(d.paymentAmount)),
                            React.createElement(table_1.TableCell, { className: "text-right" },
                                React.createElement("span", { className: d.difference > 0 ? "text-green-600 font-semibold" : "text-red-600 font-semibold" }, format_1.formatCurrency(d.difference))),
                            React.createElement(table_1.TableCell, { className: "text-right" },
                                React.createElement("span", { className: "inline-block px-2 py-1 rounded bg-red-100 text-red-800 font-semibold" },
                                    d.variancePercent,
                                    "%")),
                            React.createElement(table_1.TableCell, { className: "text-center" },
                                React.createElement(button_1.Button, { size: "sm", variant: "outline", onClick: function () { return sonner_1.toast.info("Reviewing discrepancy for " + d.invoiceNumber); } }, "Review")))); }))))))),
        major.length > 0 && (React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, null,
                    "Major Discrepancies (",
                    major.length,
                    ")"),
                React.createElement(card_1.CardDescription, null, "5-10% variance - review for accuracy")),
            React.createElement(card_1.CardContent, null,
                React.createElement("div", { className: "overflow-x-auto" },
                    React.createElement(table_1.Table, null,
                        React.createElement(table_1.TableHeader, null,
                            React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableHead, null, "Invoice"),
                                React.createElement(table_1.TableHead, null, "Client"),
                                React.createElement(table_1.TableHead, { className: "text-right" }, "Invoice Amt"),
                                React.createElement(table_1.TableHead, { className: "text-right" }, "Payment Amt"),
                                React.createElement(table_1.TableHead, { className: "text-right" }, "Difference"),
                                React.createElement(table_1.TableHead, { className: "text-right" }, "Variance %"),
                                React.createElement(table_1.TableHead, { className: "text-center" }, "Action"))),
                        React.createElement(table_1.TableBody, null, major.slice(0, 10).map(function (d) { return (React.createElement(table_1.TableRow, { key: d.paymentId, className: "hover:bg-orange-50" },
                            React.createElement(table_1.TableCell, { className: "font-medium" }, d.invoiceNumber),
                            React.createElement(table_1.TableCell, null, d.clientName),
                            React.createElement(table_1.TableCell, { className: "text-right" }, format_1.formatCurrency(d.invoiceAmount)),
                            React.createElement(table_1.TableCell, { className: "text-right" }, format_1.formatCurrency(d.paymentAmount)),
                            React.createElement(table_1.TableCell, { className: "text-right" },
                                React.createElement("span", { className: d.difference > 0 ? "text-green-600 font-semibold" : "text-red-600 font-semibold" }, format_1.formatCurrency(d.difference))),
                            React.createElement(table_1.TableCell, { className: "text-right" },
                                React.createElement("span", { className: "inline-block px-2 py-1 rounded bg-orange-100 text-orange-800 font-semibold text-sm" },
                                    d.variancePercent,
                                    "%")),
                            React.createElement(table_1.TableCell, { className: "text-center" },
                                React.createElement(button_1.Button, { size: "sm", variant: "ghost", onClick: function () { return sonner_1.toast.success("Marked " + d.invoiceNumber + " as reviewed"); } },
                                    React.createElement(lucide_react_1.CheckCircle2, { className: "w-4 h-4" }))))); })))),
                major.length > 10 && (React.createElement("p", { className: "text-xs text-muted-foreground mt-4" },
                    "Showing 10 of ",
                    major.length,
                    " major discrepancies"))))),
        minor.length > 0 && (React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, null,
                    "Minor Discrepancies (",
                    minor.length,
                    ")"),
                React.createElement(card_1.CardDescription, null, "Less than 5% variance - review if needed")),
            React.createElement(card_1.CardContent, null,
                React.createElement("div", { className: "overflow-x-auto" },
                    React.createElement(table_1.Table, null,
                        React.createElement(table_1.TableHeader, null,
                            React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableHead, null, "Invoice"),
                                React.createElement(table_1.TableHead, null, "Client"),
                                React.createElement(table_1.TableHead, { className: "text-right" }, "Invoice Amt"),
                                React.createElement(table_1.TableHead, { className: "text-right" }, "Payment Amt"),
                                React.createElement(table_1.TableHead, { className: "text-right" }, "Difference"),
                                React.createElement(table_1.TableHead, { className: "text-right" }, "Variance %"))),
                        React.createElement(table_1.TableBody, null, minor.slice(0, 10).map(function (d) { return (React.createElement(table_1.TableRow, { key: d.paymentId, className: "hover:bg-gray-50" },
                            React.createElement(table_1.TableCell, { className: "font-medium text-sm" }, d.invoiceNumber),
                            React.createElement(table_1.TableCell, { className: "text-sm" }, d.clientName),
                            React.createElement(table_1.TableCell, { className: "text-right text-sm" }, format_1.formatCurrency(d.invoiceAmount)),
                            React.createElement(table_1.TableCell, { className: "text-right text-sm" }, format_1.formatCurrency(d.paymentAmount)),
                            React.createElement(table_1.TableCell, { className: "text-right text-sm" },
                                React.createElement("span", { className: d.difference > 0 ? "text-green-600" : "text-gray-600" }, format_1.formatCurrency(d.difference))),
                            React.createElement(table_1.TableCell, { className: "text-right" },
                                React.createElement("span", { className: "inline-block px-2 py-1 rounded bg-gray-100 text-gray-800 text-xs font-medium" },
                                    d.variancePercent,
                                    "%")))); })))),
                minor.length > 10 && (React.createElement("p", { className: "text-xs text-muted-foreground mt-4" },
                    "Showing 10 of ",
                    minor.length,
                    " minor discrepancies"))))),
        discrepancies.total === 0 && (React.createElement(card_1.Card, { className: "border-green-200 bg-green-50" },
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, { className: "flex items-center gap-2 text-green-900" },
                    React.createElement(lucide_react_1.CheckCircle2, { className: "w-5 h-5" }),
                    "All Payments Matched Successfully")),
            React.createElement(card_1.CardContent, { className: "text-green-800" },
                React.createElement("p", null, "No discrepancies detected. All payments match their invoices perfectly.")))),
        React.createElement(button_1.Button, { className: "gap-2", size: "lg", onClick: function () {
                var rows = (discrepancies.discrepancies || []).map(function (d) { return ({
                    invoiceNumber: d.invoiceNumber,
                    clientName: d.clientName,
                    invoiceAmount: d.invoiceAmount,
                    paymentAmount: d.paymentAmount,
                    difference: d.difference,
                    variancePercent: d.variancePercent
                }); });
                if (!rows.length) {
                    sonner_1.toast.info("No discrepancy data available to export");
                    return;
                }
                exportCsv_1.exportToCsv("reconciliation-discrepancies", rows);
                sonner_1.toast.success("Discrepancy report exported");
            } },
            React.createElement(lucide_react_1.Download, { className: "w-4 h-4" }),
            "Export Discrepancy Report")));
}
exports["default"] = ReconciliationDiscrepancies;
