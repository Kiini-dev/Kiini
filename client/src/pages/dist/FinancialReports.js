"use strict";
exports.__esModule = true;
var react_1 = require("react");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var permissions_1 = require("@/lib/permissions");
var spinner_1 = require("@/components/ui/spinner");
var trpc_1 = require("@/lib/trpc");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
var table_1 = require("@/components/ui/table");
var currency_1 = require("@/lib/currency");
function FinancialReportsPage() {
    var _a = permissions_1.useRequireFeature("reports:financial"), allowed = _a.allowed, isLoading = _a.isLoading;
    var formatMoney = currency_1.useCurrency().format;
    var _b = react_1.useState(new Date().toISOString().slice(0, 10)), from = _b[0], setFrom = _b[1];
    var _c = react_1.useState(new Date().toISOString().slice(0, 10)), to = _c[0], setTo = _c[1];
    var plQuery = trpc_1.trpc.financialReports.profitLoss.useQuery({ startDate: from, endDate: to }, { enabled: !!from && !!to });
    var bsQuery = trpc_1.trpc.financialReports.balanceSheet.useQuery();
    if (isLoading)
        return React.createElement("div", { className: "flex items-center justify-center h-screen" },
            React.createElement(spinner_1.Spinner, { className: "size-8" }));
    if (!allowed)
        return null;
    var handleRun = function () {
        if (!from || !to) {
            sonner_1.toast.error("Please select both dates");
            return;
        }
        plQuery.refetch();
        bsQuery.refetch();
    };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Financial Reports", icon: React.createElement(lucide_react_1.BarChart3, { className: "h-5 w-5" }), description: "Profit & Loss and balance sheet summaries", breadcrumbs: [
            { label: "Dashboard", href: "/" },
            { label: "Finance", href: "/accounting" },
            { label: "Reports" },
        ], actions: React.createElement(button_1.Button, { onClick: handleRun }, "Run") },
        React.createElement("div", { className: "space-y-6" },
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Filters")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "flex gap-4 items-end" },
                        React.createElement("div", null,
                            React.createElement("label", { className: "text-sm text-muted-foreground" }, "From"),
                            React.createElement(input_1.Input, { type: "date", value: from, onChange: function (e) { return setFrom(e.target.value); } })),
                        React.createElement("div", null,
                            React.createElement("label", { className: "text-sm text-muted-foreground" }, "To"),
                            React.createElement(input_1.Input, { type: "date", value: to, onChange: function (e) { return setTo(e.target.value); } }))))),
            plQuery.data && (React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null,
                        "Profit & Loss (",
                        from,
                        " - ",
                        to,
                        ")")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement("div", null,
                                "Total Revenue: ",
                                formatMoney(plQuery.data.revenue)),
                            React.createElement("div", null,
                                "Total Expenses: ",
                                formatMoney(plQuery.data.expenses)),
                            React.createElement("div", { className: "font-semibold " + (plQuery.data.netProfit >= 0 ? 'text-green-600' : 'text-red-600') },
                                "Net Profit: ",
                                formatMoney(plQuery.data.netProfit)),
                            React.createElement("div", null,
                                "Net Margin: ",
                                (plQuery.data.netMarginPercentage || 0).toFixed(1),
                                "%")))))),
            bsQuery.data && (React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Balance Sheet Summary")),
                React.createElement(card_1.CardContent, null,
                    React.createElement(table_1.Table, null,
                        React.createElement(table_1.TableHeader, null,
                            React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableHead, null, "Account Type"),
                                React.createElement(table_1.TableHead, { className: "text-right" }, "Balance"))),
                        React.createElement(table_1.TableBody, null, Object.entries(bsQuery.data).map(function (_a) {
                            var type = _a[0], amt = _a[1];
                            return (React.createElement(table_1.TableRow, { key: type },
                                React.createElement(table_1.TableCell, null, type),
                                React.createElement(table_1.TableCell, { className: "text-right" }, formatMoney(amt))));
                        })))))))));
}
exports["default"] = FinancialReportsPage;
