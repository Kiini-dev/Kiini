"use strict";
exports.__esModule = true;
exports.BudgetDashboard = void 0;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var Toast_1 = require("./Toast");
var currency_1 = require("@/lib/currency");
function BudgetDashboard() {
    var currencyCode = currency_1.useCurrencySettings().code;
    var _a = react_1.useState(new Date().getFullYear()), selectedYear = _a[0], setSelectedYear = _a[1];
    var _b = react_1.useState(null), toast = _b[0], setToast = _b[1];
    var summaryQuery = trpc_1.trpc.budget.dashboard.summary.useQuery({ year: selectedYear });
    var byDepartmentQuery = trpc_1.trpc.budget.dashboard.byDepartment.useQuery({ year: selectedYear });
    var byProjectQuery = trpc_1.trpc.budget.dashboard.byProject.useQuery({});
    var alertsQuery = trpc_1.trpc.budget.dashboard.alerts.useQuery({});
    var summary = summaryQuery.data;
    var years = react_1.useMemo(function () {
        var years = [];
        for (var i = new Date().getFullYear(); i >= 2020; i--) {
            years.push(i);
        }
        return years;
    }, []);
    var getStatusColor = function (percentage) {
        if (percentage >= 100)
            return "text-red-600 bg-red-50";
        if (percentage >= 80)
            return "text-orange-600 bg-orange-50";
        if (percentage >= 50)
            return "text-blue-600 bg-blue-50";
        return "text-green-600 bg-green-50";
    };
    var getProgressColor = function (percentage) {
        if (percentage >= 100)
            return "bg-red-500";
        if (percentage >= 80)
            return "bg-orange-500";
        if (percentage >= 50)
            return "bg-blue-500";
        return "bg-green-500";
    };
    return (react_1["default"].createElement("div", { className: "space-y-6" },
        react_1["default"].createElement("div", { className: "flex items-center justify-between" },
            react_1["default"].createElement("div", null,
                react_1["default"].createElement("h1", { className: "text-3xl font-bold text-gray-900" }, "Budget Dashboard"),
                react_1["default"].createElement("p", { className: "text-gray-600 mt-1" }, "Monitor and manage budget allocations across projects and departments")),
            react_1["default"].createElement("div", null,
                react_1["default"].createElement("select", { value: selectedYear, onChange: function (e) { return setSelectedYear(parseInt(e.target.value)); }, className: "px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" }, years.map(function (year) { return (react_1["default"].createElement("option", { key: year, value: year }, year)); })))),
        alertsQuery.data && alertsQuery.data.length > 0 && (react_1["default"].createElement("div", { className: "bg-red-50 border border-red-200 rounded-lg p-4" },
            react_1["default"].createElement("div", { className: "flex gap-3" },
                react_1["default"].createElement(lucide_react_1.AlertTriangle, { className: "w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" }),
                react_1["default"].createElement("div", { className: "flex-1" },
                    react_1["default"].createElement("h3", { className: "font-semibold text-red-900" }, "Budget Alerts"),
                    react_1["default"].createElement("p", { className: "text-sm text-red-800 mt-1" },
                        alertsQuery.data.length,
                        " item(s) over budget"),
                    react_1["default"].createElement("ul", { className: "mt-2 space-y-1" }, alertsQuery.data.slice(0, 3).map(function (alert) { return (react_1["default"].createElement("li", { key: alert.id, className: "text-sm text-red-800 flex items-center justify-between" },
                        react_1["default"].createElement("span", null, alert.name),
                        react_1["default"].createElement("span", { className: "font-semibold" },
                            (alert.overage / 100).toLocaleString("en-US", {
                                style: "currency",
                                currency: currencyCode
                            }),
                            "over"))); })))))),
        summary && (react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4" },
            react_1["default"].createElement("div", { className: "bg-white rounded-lg border border-gray-200 p-6" },
                react_1["default"].createElement("div", { className: "flex items-center justify-between mb-4" },
                    react_1["default"].createElement("h3", { className: "text-lg font-semibold text-gray-900" }, "Overall Budget"),
                    react_1["default"].createElement(lucide_react_1.DollarSign, { className: "w-5 h-5 text-blue-600" })),
                react_1["default"].createElement("div", { className: "space-y-3" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("p", { className: "text-sm text-gray-600" }, "Total Budget"),
                        react_1["default"].createElement("p", { className: "text-2xl font-bold text-gray-900" }, (summary.combined.total / 100).toLocaleString("en-US", {
                            style: "currency",
                            currency: currencyCode
                        }))),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("p", { className: "text-sm text-gray-600" }, "Spent"),
                        react_1["default"].createElement("p", { className: "text-xl font-semibold text-gray-900" }, (summary.combined.spent / 100).toLocaleString("en-US", {
                            style: "currency",
                            currency: currencyCode
                        }))),
                    react_1["default"].createElement("div", { className: "pt-2 border-t border-gray-200" },
                        react_1["default"].createElement("p", { className: "text-sm text-gray-600" }, "Remaining"),
                        react_1["default"].createElement("p", { className: "text-xl font-semibold text-green-600" }, (summary.combined.remaining / 100).toLocaleString("en-US", {
                            style: "currency",
                            currency: currencyCode
                        }))))),
            react_1["default"].createElement("div", { className: "bg-white rounded-lg border border-gray-200 p-6" },
                react_1["default"].createElement("div", { className: "flex items-center justify-between mb-4" },
                    react_1["default"].createElement("h3", { className: "text-lg font-semibold text-gray-900" }, "Projects"),
                    react_1["default"].createElement(lucide_react_1.TrendingUp, { className: "w-5 h-5 text-purple-600" })),
                react_1["default"].createElement("div", { className: "space-y-3" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("div", { className: "flex justify-between items-center mb-1" },
                            react_1["default"].createElement("p", { className: "text-sm text-gray-600" }, "Budget Used"),
                            react_1["default"].createElement("span", { className: "text-sm font-semibold text-gray-900" },
                                summary.projects.percentage,
                                "%")),
                        react_1["default"].createElement("div", { className: "w-full bg-gray-200 rounded-full h-2" },
                            react_1["default"].createElement("div", { className: "h-2 rounded-full " + getProgressColor(summary.projects.percentage), style: { width: Math.min(summary.projects.percentage, 100) + "%" } }))),
                    react_1["default"].createElement("div", { className: "grid grid-cols-2 gap-2 text-sm" },
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("p", { className: "text-gray-600" }, "Budgeted"),
                            react_1["default"].createElement("p", { className: "font-semibold text-gray-900" },
                                (summary.projects.total / 100 / 1000).toFixed(1),
                                "k")),
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("p", { className: "text-gray-600" }, "Spent"),
                            react_1["default"].createElement("p", { className: "font-semibold text-gray-900" },
                                (summary.projects.spent / 100 / 1000).toFixed(1),
                                "k"))))),
            react_1["default"].createElement("div", { className: "bg-white rounded-lg border border-gray-200 p-6" },
                react_1["default"].createElement("div", { className: "flex items-center justify-between mb-4" },
                    react_1["default"].createElement("h3", { className: "text-lg font-semibold text-gray-900" }, "Departments"),
                    react_1["default"].createElement(lucide_react_1.BarChart3, { className: "w-5 h-5 text-green-600" })),
                react_1["default"].createElement("div", { className: "space-y-3" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("div", { className: "flex justify-between items-center mb-1" },
                            react_1["default"].createElement("p", { className: "text-sm text-gray-600" }, "Budget Used"),
                            react_1["default"].createElement("span", { className: "text-sm font-semibold text-gray-900" },
                                summary.departments.percentage,
                                "%")),
                        react_1["default"].createElement("div", { className: "w-full bg-gray-200 rounded-full h-2" },
                            react_1["default"].createElement("div", { className: "h-2 rounded-full " + getProgressColor(summary.departments.percentage), style: { width: Math.min(summary.departments.percentage, 100) + "%" } }))),
                    react_1["default"].createElement("div", { className: "text-sm" },
                        react_1["default"].createElement("p", { className: "text-red-600 font-semibold" },
                            summary.departments.overBudgetCount,
                            " over budget")))))),
        byDepartmentQuery.data && byDepartmentQuery.data.length > 0 && (react_1["default"].createElement("div", { className: "bg-white rounded-lg border border-gray-200 p-6" },
            react_1["default"].createElement("h2", { className: "text-xl font-semibold text-gray-900 mb-4" }, "Department Budgets"),
            react_1["default"].createElement("div", { className: "overflow-x-auto" },
                react_1["default"].createElement("table", { className: "w-full" },
                    react_1["default"].createElement("thead", null,
                        react_1["default"].createElement("tr", { className: "border-b border-gray-200" },
                            react_1["default"].createElement("th", { className: "text-left py-3 px-4 text-sm font-semibold text-gray-700" }, "Department"),
                            react_1["default"].createElement("th", { className: "text-left py-3 px-4 text-sm font-semibold text-gray-700" }, "Category"),
                            react_1["default"].createElement("th", { className: "text-right py-3 px-4 text-sm font-semibold text-gray-700" }, "Budgeted"),
                            react_1["default"].createElement("th", { className: "text-right py-3 px-4 text-sm font-semibold text-gray-700" }, "Spent"),
                            react_1["default"].createElement("th", { className: "text-right py-3 px-4 text-sm font-semibold text-gray-700" }, "Remaining"),
                            react_1["default"].createElement("th", { className: "text-center py-3 px-4 text-sm font-semibold text-gray-700" }, "Progress"),
                            react_1["default"].createElement("th", { className: "text-center py-3 px-4 text-sm font-semibold text-gray-700" }, "Status"))),
                    react_1["default"].createElement("tbody", null, byDepartmentQuery.data.map(function (dept) { return (react_1["default"].createElement("tr", { key: dept.id, className: "border-b border-gray-100 hover:bg-gray-50" },
                        react_1["default"].createElement("td", { className: "py-3 px-4 text-sm font-medium text-gray-900" }, dept.departmentId),
                        react_1["default"].createElement("td", { className: "py-3 px-4 text-sm text-gray-600" }, dept.category || "-"),
                        react_1["default"].createElement("td", { className: "py-3 px-4 text-sm text-right text-gray-900 font-medium" }, (dept.budgeted / 100).toLocaleString("en-US", {
                            style: "currency",
                            currency: currencyCode
                        })),
                        react_1["default"].createElement("td", { className: "py-3 px-4 text-sm text-right text-gray-900 font-medium" }, (dept.spent / 100).toLocaleString("en-US", {
                            style: "currency",
                            currency: currencyCode
                        })),
                        react_1["default"].createElement("td", { className: "py-3 px-4 text-sm text-right font-medium" },
                            react_1["default"].createElement("span", { className: dept.remaining < 0 ? "text-red-600" : "text-green-600" }, (dept.remaining / 100).toLocaleString("en-US", {
                                style: "currency",
                                currency: currencyCode
                            }))),
                        react_1["default"].createElement("td", { className: "py-3 px-4" },
                            react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                                react_1["default"].createElement("div", { className: "w-24 bg-gray-200 rounded-full h-2" },
                                    react_1["default"].createElement("div", { className: "h-2 rounded-full " + getProgressColor(dept.percentage), style: { width: Math.min(dept.percentage, 100) + "%" } })),
                                react_1["default"].createElement("span", { className: "text-xs font-semibold text-gray-700 w-8" },
                                    dept.percentage,
                                    "%"))),
                        react_1["default"].createElement("td", { className: "py-3 px-4 text-center" },
                            react_1["default"].createElement("span", { className: "text-xs font-semibold px-2 py-1 rounded " + (dept.status === "over"
                                    ? "bg-red-100 text-red-800"
                                    : dept.status === "at"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-green-100 text-green-800") }, dept.status === "over" ? "Over" : dept.status === "at" ? "At" : "Under")))); })))))),
        byProjectQuery.data && byProjectQuery.data.length > 0 && (react_1["default"].createElement("div", { className: "bg-white rounded-lg border border-gray-200 p-6" },
            react_1["default"].createElement("h2", { className: "text-xl font-semibold text-gray-900 mb-4" }, "Project Budgets"),
            react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" }, byProjectQuery.data.map(function (project) { return (react_1["default"].createElement("div", { key: project.id, className: "border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition" },
                react_1["default"].createElement("div", { className: "flex items-start justify-between mb-3" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("p", { className: "text-sm text-gray-600" }, "Project ID"),
                        react_1["default"].createElement("p", { className: "font-semibold text-gray-900" }, project.projectId)),
                    react_1["default"].createElement("span", { className: "text-xs font-semibold px-2 py-1 rounded " + (project.status === "over"
                            ? "bg-red-100 text-red-800"
                            : project.status === "at"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800") }, project.status === "over" ? "Over" : project.status === "at" ? "At" : "Under")),
                react_1["default"].createElement("div", { className: "space-y-3" },
                    react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm" },
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("p", { className: "text-gray-600" }, "Budgeted"),
                            react_1["default"].createElement("p", { className: "font-semibold text-gray-900" }, (project.budgeted / 100).toLocaleString("en-US", {
                                style: "currency",
                                currency: currencyCode
                            }))),
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("p", { className: "text-gray-600" }, "Spent"),
                            react_1["default"].createElement("p", { className: "font-semibold text-gray-900" }, (project.spent / 100).toLocaleString("en-US", {
                                style: "currency",
                                currency: currencyCode
                            })))),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("div", { className: "flex justify-between items-center mb-1" },
                            react_1["default"].createElement("p", { className: "text-sm text-gray-600" }, "Progress"),
                            react_1["default"].createElement("span", { className: "text-sm font-semibold text-gray-900" },
                                project.percentage,
                                "%")),
                        react_1["default"].createElement("div", { className: "w-full bg-gray-200 rounded-full h-2" },
                            react_1["default"].createElement("div", { className: "h-2 rounded-full " + getProgressColor(project.percentage), style: { width: Math.min(project.percentage, 100) + "%" } }))),
                    project.remaining < 0 && (react_1["default"].createElement("div", { className: "bg-red-50 border border-red-200 rounded p-2" },
                        react_1["default"].createElement("p", { className: "text-xs text-red-800 font-semibold" },
                            "Over by",
                            " ",
                            ((Math.abs(project.remaining) / 100).toLocaleString("en-US", {
                                style: "currency",
                                currency: currencyCode
                            })))))))); })))),
        toast && (react_1["default"].createElement(Toast_1["default"], { message: toast.message, type: toast.type, onClose: function () { return setToast(null); } }))));
}
exports.BudgetDashboard = BudgetDashboard;
exports["default"] = BudgetDashboard;
