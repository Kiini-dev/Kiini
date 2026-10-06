"use strict";
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var permissions_1 = require("@/lib/permissions");
var spinner_1 = require("@/components/ui/spinner");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var card_1 = require("@/components/ui/card");
var table_1 = require("@/components/ui/table");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var stats_card_1 = require("@/components/ui/stats-card");
function BudgetsPage() {
    var _a = wouter_1.useLocation(), navigate = _a[1];
    // Call All hooks unconditionally at top level
    var _b = permissions_1.useRequireFeature("accounting:budgets:view"), allowed = _b.allowed, permissionLoading = _b.isLoading;
    var _c = react_1.useState(""), searchTerm = _c[0], setSearchTerm = _c[1];
    var _d = react_1.useState(false), showYTDOnly = _d[0], setShowYTDOnly = _d[1];
    var _e = react_1.useState(new Date().getFullYear()), selectedYear = _e[0], setSelectedYear = _e[1];
    var _f = trpc_1.trpc.budgets.list.useQuery({}), budgets = _f.data, isLoading = _f.isLoading, refetch = _f.refetch;
    var deleteBudgetMutation = trpc_1.trpc.budgets["delete"].useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Budget deleted successfully");
            refetch();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to delete budget");
        }
    });
    // Ensure budgets is always an array
    var budgetsArray = Array.isArray(budgets) ? budgets : [];
    // Calculate YTD metrics
    var ytdMetrics = react_1.useMemo(function () {
        var totalBudget = budgetsArray.reduce(function (sum, b) { return sum + (b.amount || 0); }, 0);
        var totalRemaining = budgetsArray.reduce(function (sum, b) { return sum + (b.remaining || 0); }, 0);
        var totalSpent = totalBudget - totalRemaining;
        var ytdPercentage = totalBudget === 0 ? 0 : Math.round((totalSpent / totalBudget) * 100);
        return {
            totalBudget: totalBudget,
            totalRemaining: totalRemaining,
            totalSpent: totalSpent,
            ytdPercentage: ytdPercentage,
            count: budgetsArray.length
        };
    }, [budgetsArray]);
    var filteredBudgets = react_1.useMemo(function () {
        if (!Array.isArray(budgetsArray) || budgetsArray.length === 0) {
            return [];
        }
        var filtered = budgetsArray.filter(function (budget) {
            var _a, _b;
            return (((_a = budget === null || budget === void 0 ? void 0 : budget.departmentName) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(searchTerm.toLowerCase())) || ((_b = budget === null || budget === void 0 ? void 0 : budget.fiscalYear) === null || _b === void 0 ? void 0 : _b.toString().includes(searchTerm))) &&
                (!showYTDOnly || (budget === null || budget === void 0 ? void 0 : budget.fiscalYear) === selectedYear);
        });
        return filtered;
    }, [budgetsArray, searchTerm, showYTDOnly, selectedYear]);
    var getPercentageUsed = function (amount, remaining) {
        if (amount === 0)
            return 0;
        return Math.round(((amount - remaining) / amount) * 100);
    };
    var getProgressColor = function (percentage) {
        if (percentage < 50)
            return "bg-green-500";
        if (percentage < 75)
            return "bg-yellow-500";
        if (percentage < 90)
            return "bg-orange-500";
        return "bg-red-500";
    };
    // Permission checks - safe to do after all hooks are called
    if (permissionLoading) {
        return (react_1["default"].createElement("div", { className: "flex items-center justify-center h-screen" },
            react_1["default"].createElement(spinner_1.Spinner, { className: "size-8" })));
    }
    if (!allowed) {
        return null;
    }
    return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: "Budget Management", description: "Track and manage department budgets, monitor spending, and analyze budget utilization", icon: react_1["default"].createElement(lucide_react_1.PiggyBank, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Accounting", href: "/accounting" },
            { label: "Budgets" },
        ], actions: react_1["default"].createElement("div", { className: "flex gap-2" },
            react_1["default"].createElement(button_1.Button, { onClick: function () { return navigate("/budgets/professional"); }, variant: "outline", className: "gap-2" },
                react_1["default"].createElement(lucide_react_1.TrendingUp, { className: "w-4 h-4" }),
                "Professional Budgeting"),
            react_1["default"].createElement(button_1.Button, { onClick: function () { return navigate("/budgets/create"); }, className: "gap-2" },
                react_1["default"].createElement(lucide_react_1.Plus, { className: "w-4 h-4" }),
                "New Budget")) },
        react_1["default"].createElement("div", { className: "space-y-6" },
            react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4" },
                react_1["default"].createElement(stats_card_1.StatsCard, { label: "Total Budget", value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(ytdMetrics.totalBudget), description: react_1["default"].createElement(react_1["default"].Fragment, null,
                        ytdMetrics.count,
                        " budgets"), color: "border-l-purple-500" }),
                react_1["default"].createElement(stats_card_1.StatsCard, { label: "YTD Spent", value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(ytdMetrics.totalSpent), description: react_1["default"].createElement(react_1["default"].Fragment, null,
                        ytdMetrics.ytdPercentage,
                        "% of budget"), color: "border-l-green-500" }),
                react_1["default"].createElement(stats_card_1.StatsCard, { label: "Remaining", value: new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(ytdMetrics.totalRemaining), description: react_1["default"].createElement(react_1["default"].Fragment, null,
                        100 - ytdMetrics.ytdPercentage,
                        "% available"), color: "border-l-blue-500" }),
                react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, { className: "pb-3" },
                        react_1["default"].createElement(card_1.CardTitle, { className: "text-sm font-medium text-gray-600" }, "YTD Progress")),
                    react_1["default"].createElement(card_1.CardContent, null,
                        react_1["default"].createElement("div", { className: "flex items-center gap-3" },
                            react_1["default"].createElement("div", { className: "flex-1" },
                                react_1["default"].createElement("div", { className: "w-full bg-gray-200 rounded-full h-2" },
                                    react_1["default"].createElement("div", { className: "h-2 rounded-full transition-all " + (ytdMetrics.ytdPercentage < 50
                                            ? "bg-green-500"
                                            : ytdMetrics.ytdPercentage < 75
                                                ? "bg-yellow-500"
                                                : ytdMetrics.ytdPercentage < 90
                                                    ? "bg-orange-500"
                                                    : "bg-red-500"), style: { width: Math.min(ytdMetrics.ytdPercentage, 100) + "%" } }))),
                            react_1["default"].createElement("span", { className: "text-sm font-semibold" },
                                ytdMetrics.ytdPercentage,
                                "%"))))),
            react_1["default"].createElement("div", { className: "flex gap-2 items-end" },
                react_1["default"].createElement("div", { className: "flex-1" },
                    react_1["default"].createElement(card_1.Card, null,
                        react_1["default"].createElement(card_1.CardHeader, null,
                            react_1["default"].createElement(card_1.CardTitle, null, "Search Budgets")),
                        react_1["default"].createElement(card_1.CardContent, null,
                            react_1["default"].createElement(input_1.Input, { placeholder: "Search by department or fiscal year...", value: searchTerm, onChange: function (e) { return setSearchTerm(e.target.value); }, className: "w-full" })))),
                react_1["default"].createElement("div", { className: "flex gap-2" },
                    react_1["default"].createElement(button_1.Button, { variant: showYTDOnly ? "default" : "outline", onClick: function () { return setShowYTDOnly(!showYTDOnly); }, className: "gap-2" },
                        react_1["default"].createElement(lucide_react_1.Calendar, { className: "w-4 h-4" }),
                        "YTD ",
                        selectedYear),
                    showYTDOnly && (react_1["default"].createElement("select", { value: selectedYear, onChange: function (e) { return setSelectedYear(parseInt(e.target.value)); }, className: "px-3 py-2 border rounded-md text-sm" }, Array.from({ length: 5 }, function (_, i) { return new Date().getFullYear() - 4 + i; }).map(function (year) { return (react_1["default"].createElement("option", { key: year, value: year }, year)); }))))),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardHeader, null,
                    react_1["default"].createElement(card_1.CardTitle, null,
                        "All Budgets (",
                        filteredBudgets.length,
                        ")")),
                react_1["default"].createElement(card_1.CardContent, null, isLoading ? (react_1["default"].createElement("div", { className: "text-center py-8 text-gray-500" }, "Loading budgets...")) : filteredBudgets.length === 0 ? (react_1["default"].createElement("div", { className: "text-center py-8 text-gray-500" }, "No budgets found. Create one to get started.")) : (react_1["default"].createElement("div", { className: "overflow-x-auto" },
                    react_1["default"].createElement(table_1.Table, null,
                        react_1["default"].createElement(table_1.TableHeader, null,
                            react_1["default"].createElement(table_1.TableRow, null,
                                react_1["default"].createElement(table_1.TableHead, null, "Department"),
                                react_1["default"].createElement(table_1.TableHead, { className: "hidden md:table-cell" }, "Fiscal Year"),
                                react_1["default"].createElement(table_1.TableHead, { className: "text-right" }, "Total Budget"),
                                react_1["default"].createElement(table_1.TableHead, { className: "hidden lg:table-cell text-right" }, "Remaining"),
                                react_1["default"].createElement(table_1.TableHead, null, "Usage"),
                                react_1["default"].createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                        react_1["default"].createElement(table_1.TableBody, null, filteredBudgets.map(function (budget) {
                            var percentage = getPercentageUsed(budget.amount || 0, budget.remaining || 0);
                            var progressColor = getProgressColor(percentage);
                            return (react_1["default"].createElement(table_1.TableRow, { key: budget.id },
                                react_1["default"].createElement(table_1.TableCell, { className: "font-medium" }, budget.departmentName || "N/A"),
                                react_1["default"].createElement(table_1.TableCell, { className: "hidden md:table-cell" }, budget.fiscalYear || "N/A"),
                                react_1["default"].createElement(table_1.TableCell, { className: "text-right" }, new Intl.NumberFormat("en-US", {
                                    style: "currency",
                                    currency: "USD"
                                }).format(budget.amount || 0)),
                                react_1["default"].createElement(table_1.TableCell, { className: "hidden lg:table-cell text-right" },
                                    react_1["default"].createElement("span", { className: percentage > 75 ? "text-red-600 font-semibold" : "" }, new Intl.NumberFormat("en-US", {
                                        style: "currency",
                                        currency: "USD"
                                    }).format(budget.remaining || 0))),
                                react_1["default"].createElement(table_1.TableCell, null,
                                    react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                                        react_1["default"].createElement("div", { className: "w-24 bg-gray-200 rounded-full h-2" },
                                            react_1["default"].createElement("div", { className: progressColor + " h-2 rounded-full transition-all", style: { width: percentage + "%" } })),
                                        react_1["default"].createElement("span", { className: "text-sm font-medium" },
                                            percentage,
                                            "%"))),
                                react_1["default"].createElement(table_1.TableCell, { className: "text-right" },
                                    react_1["default"].createElement("div", { className: "flex justify-end gap-2" },
                                        react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return navigate("/budgets/" + budget.id); } },
                                            react_1["default"].createElement(lucide_react_1.Eye, { className: "w-4 h-4" })),
                                        react_1["default"].createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return navigate("/budgets/" + budget.id + "/edit"); } },
                                            react_1["default"].createElement(lucide_react_1.Edit2, { className: "w-4 h-4" })),
                                        react_1["default"].createElement(button_1.Button, { variant: "destructive", size: "sm", onClick: function () {
                                                if (window.confirm("Are you sure you want to delete this budget? This action cannot be undone.")) {
                                                    deleteBudgetMutation.mutate(budget.id);
                                                }
                                            }, disabled: deleteBudgetMutation.isPending },
                                            react_1["default"].createElement(lucide_react_1.Trash2, { className: "w-4 h-4" }))))));
                        }))))))))));
}
exports["default"] = BudgetsPage;
