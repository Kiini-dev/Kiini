"use strict";
exports.__esModule = true;
var wouter_1 = require("wouter");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var trpc_1 = require("@/lib/trpc");
var table_1 = require("@/components/ui/table");
var lucide_react_1 = require("lucide-react");
function fmtBudget(value) {
    return new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency: "KES",
        minimumFractionDigits: 2
    }).format(value);
}
function BudgetDetails() {
    var params = wouter_1.useParams();
    var _a = wouter_1.useLocation(), setLocation = _a[1];
    var _b = trpc_1.trpc.budgets.getById.useQuery(params.id, {
        enabled: !!params.id
    }), budget = _b.data, isLoading = _b.isLoading;
    var _c = trpc_1.trpc.budgets.getLineItems.useQuery(params.id, {
        enabled: !!params.id
    }).data, lineItems = _c === void 0 ? [] : _c;
    if (isLoading) {
        return (React.createElement("div", { className: "flex items-center justify-center min-h-[400px]" },
            React.createElement(lucide_react_1.Loader2, { className: "w-8 h-8 animate-spin text-muted-foreground" })));
    }
    if (!budget) {
        return (React.createElement("div", { className: "flex flex-col items-center justify-center min-h-[400px] gap-4" },
            React.createElement("p", { className: "text-muted-foreground" }, "Budget not found"),
            React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setLocation("/budgets"); } },
                React.createElement(lucide_react_1.ArrowLeft, { className: "w-4 h-4 mr-2" }),
                " Back to Budgets")));
    }
    var spent = budget.amount - budget.remaining;
    var percentage = budget.amount > 0 ? Math.min(100, Math.round((spent / budget.amount) * 100)) : 0;
    var progressColor = percentage >= 90 ? "bg-red-500" : percentage >= 70 ? "bg-yellow-500" : "bg-green-500";
    var statusLabel = percentage >= 90 ? "Critical" : percentage >= 70 ? "Warning" : "On Track";
    var statusClass = percentage >= 90
        ? "bg-red-100 text-red-800"
        : percentage >= 70
            ? "bg-yellow-100 text-yellow-800"
            : "bg-green-100 text-green-800";
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: (budget.departmentName || "Department") + " Budget", description: "Budget Details", icon: React.createElement(lucide_react_1.PiggyBank, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Accounting", href: "/accounting" },
            { label: "Budgets", href: "/budgets" },
            { label: budget.departmentName || "Budget" },
        ], actions: React.createElement("div", { className: "flex gap-2" },
            React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setLocation("/budgets/" + budget.id + "/edit"); } }, "Edit Budget"),
            React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setLocation("/budgets"); } },
                React.createElement(lucide_react_1.ArrowLeft, { className: "w-4 h-4 mr-2" }),
                " Back")) },
        React.createElement("div", { className: "max-w-4xl space-y-6" },
            React.createElement("div", { className: "flex items-center justify-between" },
                React.createElement(badge_1.Badge, { className: "text-sm px-3 py-1 " + statusClass }, statusLabel),
                budget.createdAt && (React.createElement("span", { className: "text-sm text-muted-foreground" },
                    "Created ",
                    new Date(budget.createdAt).toLocaleDateString()))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, { className: "pb-4" },
                    React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                        React.createElement(lucide_react_1.Building2, { className: "w-4 h-4 text-blue-600" }),
                        "Budget Information")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Department"),
                            React.createElement("p", { className: "font-medium" }, budget.departmentName || "—")),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-muted-foreground flex items-center gap-1" },
                                React.createElement(lucide_react_1.Calendar, { className: "w-3 h-3" }),
                                " Fiscal Year"),
                            React.createElement("p", { className: "font-medium" }, budget.fiscalYear))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, { className: "pb-4" },
                    React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                        React.createElement(lucide_react_1.Coins, { className: "w-4 h-4 text-green-600" }),
                        "Financial Overview")),
                React.createElement(card_1.CardContent, { className: "space-y-6" },
                    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Total Budget"),
                            React.createElement("p", { className: "font-medium text-lg" }, fmtBudget(budget.amount))),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Spent"),
                            React.createElement("p", { className: "font-medium text-lg text-red-600" }, fmtBudget(spent))),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Remaining"),
                            React.createElement("p", { className: "font-medium text-lg text-green-600" }, fmtBudget(budget.remaining)))),
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement("div", { className: "flex justify-between text-sm" },
                            React.createElement("span", { className: "text-muted-foreground" }, "Budget utilization"),
                            React.createElement("span", { className: "font-medium" },
                                percentage,
                                "%")),
                        React.createElement("div", { className: "w-full bg-gray-200 rounded-full h-3" },
                            React.createElement("div", { className: progressColor + " h-3 rounded-full transition-all", style: { width: percentage + "%" } }))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, { className: "pb-4" },
                    React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                        React.createElement(lucide_react_1.ListChecks, { className: "w-4 h-4 text-purple-600" }),
                        "Budget Line Items")),
                React.createElement(card_1.CardContent, null, lineItems.length === 0 ? (React.createElement("p", { className: "text-sm text-muted-foreground text-center py-6" }, "No budget line items have been added yet.")) : (React.createElement(table_1.Table, null,
                    React.createElement(table_1.TableHeader, null,
                        React.createElement(table_1.TableRow, null,
                            React.createElement(table_1.TableHead, null, "Account Code"),
                            React.createElement(table_1.TableHead, null, "Account Name"),
                            React.createElement(table_1.TableHead, { className: "text-right" }, "Budgeted"),
                            React.createElement(table_1.TableHead, { className: "text-right" }, "Actual"),
                            React.createElement(table_1.TableHead, { className: "text-right" }, "Variance"),
                            React.createElement(table_1.TableHead, { className: "text-right" }, "Utilization"),
                            React.createElement(table_1.TableHead, null, "Notes"))),
                    React.createElement(table_1.TableBody, null, lineItems.map(function (item) {
                        var util = item.budgetAmount > 0
                            ? Math.min(100, Math.round((item.actualAmount / item.budgetAmount) * 100))
                            : 0;
                        var utilColor = util >= 90 ? "bg-red-500" : util >= 70 ? "bg-yellow-500" : "bg-green-500";
                        return (React.createElement(table_1.TableRow, { key: item.id },
                            React.createElement(table_1.TableCell, { className: "font-mono text-sm" }, item.accountCode || "—"),
                            React.createElement(table_1.TableCell, null, item.accountName),
                            React.createElement(table_1.TableCell, { className: "text-right" }, fmtBudget(item.budgetAmount)),
                            React.createElement(table_1.TableCell, { className: "text-right" }, fmtBudget(item.actualAmount)),
                            React.createElement(table_1.TableCell, { className: "text-right font-medium " + (item.variance < 0 ? "text-red-600" : "text-green-600") }, fmtBudget(item.variance)),
                            React.createElement(table_1.TableCell, { className: "text-right" },
                                React.createElement("div", { className: "flex items-center gap-2 justify-end" },
                                    React.createElement("div", { className: "w-20 bg-gray-200 rounded-full h-2" },
                                        React.createElement("div", { className: utilColor + " h-2 rounded-full", style: { width: util + "%" } })),
                                    React.createElement("span", { className: "text-xs w-10 text-right" },
                                        util,
                                        "%"))),
                            React.createElement(table_1.TableCell, { className: "text-sm text-muted-foreground" }, item.notes || "—")));
                    })))))))));
}
exports["default"] = BudgetDetails;
