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
var wouter_1 = require("wouter");
var OrgLayout_1 = require("@/components/OrgLayout");
var OrgBreadcrumb_1 = require("@/components/OrgBreadcrumb");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var skeleton_1 = require("@/components/ui/skeleton");
var trpc_1 = require("@/lib/trpc");
var useOrgPermission_1 = require("@/hooks/useOrgPermission");
var lucide_react_1 = require("lucide-react");
function OrgBudgetDetail() {
    var params = wouter_1.useParams();
    var slug = params.slug;
    var budgetId = params.id;
    var _a = wouter_1.useLocation(), setLocation = _a[1];
    var checkPermission = useOrgPermission_1.useOrgPermission().checkPermission;
    var _b = trpc_1.trpc.budgets.getById.useQuery(budgetId, {
        enabled: !!budgetId && checkPermission("accounting:budgets:view")
    }), budget = _b.data, isLoading = _b.isLoading;
    var handleEdit = function () {
        setLocation("/org/" + slug + "/budgets/" + budgetId + "/edit");
    };
    var handleBack = function () {
        setLocation("/org/" + slug + "/budgets");
    };
    if (isLoading) {
        return (react_1["default"].createElement(OrgLayout_1["default"], { slug: slug },
            react_1["default"].createElement("div", { className: "space-y-4 p-6" },
                react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-10 w-1/4" }),
                react_1["default"].createElement("div", { className: "space-y-2" }, __spreadArrays(Array(5)).map(function (_, i) { return (react_1["default"].createElement(skeleton_1.Skeleton, { key: i, className: "h-12 w-full" })); })))));
    }
    if (!budget) {
        return (react_1["default"].createElement(OrgLayout_1["default"], { slug: slug },
            react_1["default"].createElement("div", { className: "p-6" },
                react_1["default"].createElement("div", { className: "text-center text-red-400" }, "Budget not found"))));
    }
    var spent = budget.spent || 0;
    var total = budget.amount || 0;
    var remaining = total - spent;
    var percentage = total > 0 ? (spent / total) * 100 : 0;
    return (react_1["default"].createElement(OrgLayout_1["default"], { slug: slug },
        react_1["default"].createElement("div", { className: "p-6 space-y-6" },
            react_1["default"].createElement(OrgBreadcrumb_1["default"], { slug: slug, items: [
                    { label: "Budgets", href: "/org/" + slug + "/budgets" },
                    { label: budget.name || "Budget #" + budgetId },
                ] }),
            react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                react_1["default"].createElement("div", { className: "flex items-center gap-3" },
                    react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "icon", onClick: handleBack },
                        react_1["default"].createElement(lucide_react_1.ArrowLeft, { className: "h-4 w-4" })),
                    react_1["default"].createElement("h1", { className: "text-3xl font-bold" }, budget.name || "Budget Details")),
                checkPermission("accounting:budgets:edit") && (react_1["default"].createElement(button_1.Button, { onClick: handleEdit, className: "gap-2" },
                    react_1["default"].createElement(lucide_react_1.Edit2, { className: "h-4 w-4" }),
                    "Edit Budget"))),
            react_1["default"].createElement("div", { className: "grid gap-6 md:grid-cols-4" },
                react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, { className: "pb-2" },
                        react_1["default"].createElement(card_1.CardTitle, { className: "text-sm font-medium text-gray-400" }, "Total Budget")),
                    react_1["default"].createElement(card_1.CardContent, null,
                        react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                            react_1["default"].createElement(lucide_react_1.DollarSign, { className: "h-4 w-4 text-green-500" }),
                            react_1["default"].createElement("span", { className: "text-2xl font-bold" }, total ? (total / 100).toFixed(2) : "0.00")))),
                react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, { className: "pb-2" },
                        react_1["default"].createElement(card_1.CardTitle, { className: "text-sm font-medium text-gray-400" }, "Spent")),
                    react_1["default"].createElement(card_1.CardContent, null,
                        react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                            react_1["default"].createElement(lucide_react_1.TrendingUp, { className: "h-4 w-4 text-orange-500" }),
                            react_1["default"].createElement("span", { className: "text-2xl font-bold" }, spent ? (spent / 100).toFixed(2) : "0.00")))),
                react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, { className: "pb-2" },
                        react_1["default"].createElement(card_1.CardTitle, { className: "text-sm font-medium text-gray-400" }, "Remaining")),
                    react_1["default"].createElement(card_1.CardContent, null,
                        react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                            react_1["default"].createElement(lucide_react_1.DollarSign, { className: "h-4 w-4 text-blue-500" }),
                            react_1["default"].createElement("span", { className: "text-2xl font-bold " + (remaining < 0 ? "text-red-500" : "") }, remaining ? (remaining / 100).toFixed(2) : "0.00")))),
                react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, { className: "pb-2" },
                        react_1["default"].createElement(card_1.CardTitle, { className: "text-sm font-medium text-gray-400" }, "Usage")),
                    react_1["default"].createElement(card_1.CardContent, null,
                        react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                            react_1["default"].createElement(lucide_react_1.Percent, { className: "h-4 w-4 text-purple-500" }),
                            react_1["default"].createElement("span", { className: "text-2xl font-bold" },
                                percentage.toFixed(1),
                                "%"))))),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardHeader, null,
                    react_1["default"].createElement(card_1.CardTitle, null, "Budget Information")),
                react_1["default"].createElement(card_1.CardContent, { className: "space-y-4" },
                    react_1["default"].createElement("div", { className: "grid gap-4" },
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("label", { className: "text-xs font-medium text-gray-400" }, "Department"),
                            react_1["default"].createElement("p", { className: "text-sm" }, budget.department || "N/A")),
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("label", { className: "text-xs font-medium text-gray-400" }, "Period"),
                            react_1["default"].createElement("p", { className: "text-sm" },
                                budget.startDate ? new Date(budget.startDate).toLocaleDateString() : "N/A",
                                " - ",
                                budget.endDate ? new Date(budget.endDate).toLocaleDateString() : "N/A")),
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("label", { className: "text-xs font-medium text-gray-400" }, "Notes"),
                            react_1["default"].createElement("p", { className: "text-sm" }, budget.notes || "No notes"))))))));
}
exports["default"] = OrgBudgetDetail;
