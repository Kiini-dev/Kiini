"use strict";
exports.__esModule = true;
exports.ExpenseBudgetReport = void 0;
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var select_1 = require("@/components/ui/select");
var trpc_1 = require("@/lib/trpc");
var lucide_react_1 = require("lucide-react");
function ExpenseBudgetReport() {
    var _a = react_1.useState(""), selectedBudget = _a[0], setSelectedBudget = _a[1];
    var _b = react_1.useState(""), searchTerm = _b[0], setSearchTerm = _b[1];
    // Fetch budget allocation report
    var _c = trpc_1.trpc.expenses.getBudgetAllocationReport.useQuery({
        // we use a sentinel value for "all" because Radix Select items cannot
        // have an empty-string value.  Convert it back to undefined for the
        // query so the backend treats it as no filter.
        budgetAllocationId: selectedBudget === "all" ? undefined : selectedBudget || undefined
    }), report = _c.data, isLoadingReport = _c.isLoading, refetch = _c.refetch;
    // Fetch available budget allocations for filter dropdown
    var budgetAllocations = trpc_1.trpc.expenses.getAvailableBudgetAllocations.useQuery({}).data;
    var filteredReport = (report === null || report === void 0 ? void 0 : report.filter(function (item) { var _a; return (_a = item.categoryName) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(searchTerm.toLowerCase()); })) || [];
    var getStatusBadge = function (utilizationPercentage) {
        if (utilizationPercentage >= 100) {
            return React.createElement(badge_1.Badge, { className: "bg-red-500" }, "Over Budget");
        }
        else if (utilizationPercentage >= 80) {
            return React.createElement(badge_1.Badge, { className: "bg-amber-500" }, "Warning");
        }
        else if (utilizationPercentage >= 50) {
            return React.createElement(badge_1.Badge, { className: "bg-blue-500" }, "On Track");
        }
        else {
            return React.createElement(badge_1.Badge, { className: "bg-green-500" }, "Under Budget");
        }
    };
    var getStatusColor = function (utilizationPercentage) {
        if (utilizationPercentage >= 100)
            return "text-red-600";
        if (utilizationPercentage >= 80)
            return "text-amber-600";
        if (utilizationPercentage >= 50)
            return "text-blue-600";
        return "text-green-600";
    };
    var getTotalStats = function () {
        if (!report || report.length === 0)
            return { total: 0, spent: 0, remaining: 0 };
        return {
            total: report.reduce(function (sum, item) { return sum + item.allocatedAmount; }, 0),
            spent: report.reduce(function (sum, item) { return sum + item.spentAmount; }, 0),
            remaining: report.reduce(function (sum, item) { return sum + item.remaining; }, 0)
        };
    };
    var stats = getTotalStats();
    return (React.createElement("div", { className: "space-y-6" },
        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4" },
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardContent, { className: "pt-6" },
                    React.createElement("div", { className: "text-center" },
                        React.createElement("p", { className: "text-sm text-gray-600 mb-1" }, "Total Allocated"),
                        React.createElement("p", { className: "text-2xl font-bold" },
                            "Ksh ",
                            (stats.total / 100).toLocaleString('en-KE'))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardContent, { className: "pt-6" },
                    React.createElement("div", { className: "text-center" },
                        React.createElement("p", { className: "text-sm text-gray-600 mb-1" }, "Spent on Expenses"),
                        React.createElement("p", { className: "text-2xl font-bold text-amber-600" },
                            "Ksh ",
                            (stats.spent / 100).toLocaleString('en-KE'))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardContent, { className: "pt-6" },
                    React.createElement("div", { className: "text-center" },
                        React.createElement("p", { className: "text-sm text-gray-600 mb-1" }, "Remaining"),
                        React.createElement("p", { className: "text-2xl font-bold " + (stats.remaining < 0 ? 'text-red-600' : 'text-green-600') },
                            "Ksh ",
                            (stats.remaining / 100).toLocaleString('en-KE'))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardContent, { className: "pt-6" },
                    React.createElement("div", { className: "text-center" },
                        React.createElement("p", { className: "text-sm text-gray-600 mb-1" }, "Utilization"),
                        React.createElement("p", { className: "text-2xl font-bold " + getStatusColor(Math.round((stats.spent / stats.total) * 100)) },
                            Math.round((stats.spent / stats.total) * 100),
                            "%"))))),
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                    React.createElement(lucide_react_1.PieChart, { className: "h-5 w-5" }),
                    "Budget Allocations"),
                React.createElement(card_1.CardDescription, null, "View expenses linked to budget allocations")),
            React.createElement(card_1.CardContent, { className: "space-y-4" },
                React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4" },
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement("label", { className: "text-sm font-medium" }, "Search by Category"),
                        React.createElement(input_1.Input, { placeholder: "Search budget categories...", value: searchTerm, onChange: function (e) { return setSearchTerm(e.target.value); } })),
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement("label", { className: "text-sm font-medium" }, "Filter by Allocation"),
                        React.createElement(select_1.Select, { value: selectedBudget, onValueChange: setSelectedBudget },
                            React.createElement(select_1.SelectTrigger, null,
                                React.createElement(select_1.SelectValue, { placeholder: "All allocations" })),
                            React.createElement(select_1.SelectContent, null,
                                React.createElement(select_1.SelectItem, { value: "all" }, "All Allocations"),
                                Array.isArray(budgetAllocations) && budgetAllocations.map(function (budget) { return (React.createElement(select_1.SelectItem, { key: budget.id, value: budget.id }, budget.categoryName)); })))),
                    React.createElement("div", { className: "flex items-end" },
                        React.createElement(button_1.Button, { variant: "outline", onClick: function () { return refetch(); }, className: "w-full" }, "Refresh Report"))))),
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, null, "Allocation Details"),
                React.createElement(card_1.CardDescription, null,
                    filteredReport.length,
                    " allocation(s)")),
            React.createElement(card_1.CardContent, null, isLoadingReport ? (React.createElement("div", { className: "text-center py-8 text-gray-600" }, "Loading report...")) : filteredReport.length === 0 ? (React.createElement("div", { className: "text-center py-8 text-gray-600" }, "No budget allocations found. Create allocations in the Budget Dashboard to track expenses.")) : (React.createElement("div", { className: "overflow-x-auto" },
                React.createElement("table", { className: "w-full text-sm" },
                    React.createElement("thead", null,
                        React.createElement("tr", { className: "border-b" },
                            React.createElement("th", { className: "text-left py-3 px-4 font-semibold" }, "Category"),
                            React.createElement("th", { className: "text-right py-3 px-4 font-semibold" }, "Allocated"),
                            React.createElement("th", { className: "text-right py-3 px-4 font-semibold" }, "Spent"),
                            React.createElement("th", { className: "text-right py-3 px-4 font-semibold" }, "Remaining"),
                            React.createElement("th", { className: "text-center py-3 px-4 font-semibold" }, "Utilization"),
                            React.createElement("th", { className: "text-center py-3 px-4 font-semibold" }, "Expenses"),
                            React.createElement("th", { className: "text-center py-3 px-4 font-semibold" }, "Status"))),
                    React.createElement("tbody", null, filteredReport.map(function (item) { return (React.createElement("tr", { key: item.id, className: "border-b hover:bg-gray-50" },
                        React.createElement("td", { className: "py-3 px-4 font-medium" }, item.categoryName),
                        React.createElement("td", { className: "text-right py-3 px-4" },
                            "Ksh ",
                            (item.allocatedAmount / 100).toLocaleString('en-KE')),
                        React.createElement("td", { className: "text-right py-3 px-4" },
                            React.createElement("span", { className: item.spentAmount > item.allocatedAmount ? "text-red-600 font-semibold" : "" },
                                "Ksh ",
                                (item.spentAmount / 100).toLocaleString('en-KE'))),
                        React.createElement("td", { className: "text-right py-3 px-4 " + (item.remaining < 0 ? "text-red-600 font-semibold" : "") },
                            "Ksh ",
                            (item.remaining / 100).toLocaleString('en-KE')),
                        React.createElement("td", { className: "text-center py-3 px-4" },
                            React.createElement("div", { className: "flex items-center justify-center gap-2" },
                                React.createElement("div", { className: "w-32 bg-gray-200 h-2 rounded-full overflow-hidden" },
                                    React.createElement("div", { className: "h-full " + (item.utilizationPercentage >= 100 ? "bg-red-500" :
                                            item.utilizationPercentage >= 80 ? "bg-amber-500" :
                                                item.utilizationPercentage >= 50 ? "bg-blue-500" :
                                                    "bg-green-500"), style: { width: Math.min(item.utilizationPercentage, 100) + "%" } })),
                                React.createElement("span", { className: "font-semibold text-sm min-w-12 " + getStatusColor(item.utilizationPercentage) },
                                    item.utilizationPercentage,
                                    "%"))),
                        React.createElement("td", { className: "text-center py-3 px-4" },
                            React.createElement(badge_1.Badge, { variant: "outline", className: "bg-blue-50" }, item.linkedExpenses)),
                        React.createElement("td", { className: "text-center py-3 px-4" }, getStatusBadge(item.utilizationPercentage)))); }))))))),
        filteredReport.some(function (item) { return item.utilizationPercentage > 100; }) && (React.createElement(card_1.Card, { className: "border-red-500 bg-red-50" },
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, { className: "flex items-center gap-2 text-red-600" },
                    React.createElement(lucide_react_1.AlertTriangle, { className: "h-5 w-5" }),
                    "Budget Overages Detected")),
            React.createElement(card_1.CardContent, null,
                React.createElement("ul", { className: "space-y-2" }, filteredReport
                    .filter(function (item) { return item.utilizationPercentage > 100; })
                    .map(function (item) { return (React.createElement("li", { key: item.id, className: "flex justify-between items-center p-3 bg-white rounded border border-red-200" },
                    React.createElement("span", { className: "font-medium" }, item.categoryName),
                    React.createElement("span", { className: "text-red-600 font-bold" },
                        "Overspent by Ksh ",
                        ((item.spentAmount - item.allocatedAmount) / 100).toLocaleString('en-KE')))); })))))));
}
exports.ExpenseBudgetReport = ExpenseBudgetReport;
