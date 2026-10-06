"use strict";
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var recharts_1 = require("recharts");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
function OrgDashboardShell(_a) {
    var title = _a.title, subtitle = _a.subtitle, actionCards = _a.actionCards, overviewMetrics = _a.overviewMetrics, monthlyChartData = _a.monthlyChartData, financialBreakdown = _a.financialBreakdown, _b = _a.recentActivities, recentActivities = _b === void 0 ? [] : _b, _c = _a.recentActivityHref, recentActivityHref = _c === void 0 ? "/audit-logs" : _c, _d = _a.gettingStarted, gettingStarted = _d === void 0 ? [] : _d;
    var _e = wouter_1.useLocation(), navigate = _e[1];
    var handleCardClick = function (href) {
        if (!href || href === "#")
            return;
        navigate(href);
    };
    return (react_1["default"].createElement("div", { className: "space-y-8" },
        react_1["default"].createElement("div", { className: "space-y-2" },
            react_1["default"].createElement("h1", { className: "text-4xl font-bold tracking-tight" }, title),
            react_1["default"].createElement("p", { className: "text-lg text-slate-600 dark:text-slate-400" }, subtitle)),
        react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4" }, actionCards.map(function (action) { return (react_1["default"].createElement("button", { key: action.id, type: "button", onClick: function () { return handleCardClick(action.href); }, className: "group relative overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 text-left transition-all hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600" },
            react_1["default"].createElement("div", { className: utils_1.cn("absolute inset-0 opacity-0 transition-opacity group-hover:opacity-5", "bg-gradient-to-br " + action.color) }),
            react_1["default"].createElement("div", { className: "relative space-y-4" },
                react_1["default"].createElement("div", { className: utils_1.cn("inline-flex p-3 rounded-lg text-white", "bg-gradient-to-br " + action.color) }, action.icon),
                react_1["default"].createElement("div", { className: "space-y-1" },
                    react_1["default"].createElement("h3", { className: "font-semibold text-slate-900 dark:text-slate-100" }, action.title),
                    react_1["default"].createElement("p", { className: "text-sm text-slate-600 dark:text-slate-400" }, action.description)),
                action.stats && (react_1["default"].createElement("div", { className: "pt-2 border-t border-slate-100 dark:border-slate-700" },
                    react_1["default"].createElement("p", { className: "text-xs text-slate-500 dark:text-slate-400" }, action.stats.label),
                    react_1["default"].createElement("p", { className: "text-lg font-bold text-slate-900 dark:text-slate-100" }, action.stats.value))),
                react_1["default"].createElement("div", { className: "absolute top-6 right-6 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" },
                    react_1["default"].createElement(lucide_react_1.ArrowRight, { className: "w-5 h-5" }))))); })),
        react_1["default"].createElement("div", { className: "space-y-4" },
            react_1["default"].createElement("h2", { className: "text-2xl font-bold tracking-tight" }, "Quick Overview"),
            react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4" }, overviewMetrics.map(function (metric) { return (react_1["default"].createElement("button", { key: metric.title, type: "button", onClick: function () { return handleCardClick(metric.href); }, className: utils_1.cn("group relative overflow-hidden rounded-lg border-l-4 p-6 text-left transition-all hover:shadow-lg cursor-pointer", metric.color) },
                react_1["default"].createElement("div", { className: "flex items-start justify-between" },
                    react_1["default"].createElement("div", { className: "space-y-1" },
                        react_1["default"].createElement("p", { className: "text-sm font-medium text-slate-600 dark:text-slate-400" }, metric.title),
                        react_1["default"].createElement("p", { className: "text-3xl font-bold text-slate-900 dark:text-slate-100" }, metric.value),
                        react_1["default"].createElement("p", { className: "text-xs text-slate-500 dark:text-slate-400" }, metric.description)),
                    react_1["default"].createElement("div", { className: "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" }, metric.icon)))); }))),
        ((monthlyChartData === null || monthlyChartData === void 0 ? void 0 : monthlyChartData.length) || (financialBreakdown === null || financialBreakdown === void 0 ? void 0 : financialBreakdown.length)) ? (react_1["default"].createElement("div", { className: "space-y-4" },
            react_1["default"].createElement("h2", { className: "text-2xl font-bold tracking-tight" }, "Financial Overview"),
            react_1["default"].createElement("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6" },
                react_1["default"].createElement(card_1.Card, { className: "lg:col-span-2" },
                    react_1["default"].createElement(card_1.CardHeader, null,
                        react_1["default"].createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                            react_1["default"].createElement(lucide_react_1.BarChart3, { className: "w-5 h-5 text-blue-600" }),
                            "Monthly Income vs Expenses"),
                        react_1["default"].createElement(card_1.CardDescription, null, "Review your organization\u2019s cash flow over time")),
                    react_1["default"].createElement(card_1.CardContent, null, monthlyChartData && monthlyChartData.length > 0 ? (react_1["default"].createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                        react_1["default"].createElement(recharts_1.BarChart, { data: monthlyChartData },
                            react_1["default"].createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3", className: "opacity-30" }),
                            react_1["default"].createElement(recharts_1.XAxis, { dataKey: "name", tick: { fontSize: 12 } }),
                            react_1["default"].createElement(recharts_1.YAxis, { tick: { fontSize: 12 }, tickFormatter: function (value) { return value.toLocaleString(); } }),
                            react_1["default"].createElement(recharts_1.Tooltip, { formatter: function (value) { return [value.toLocaleString(), undefined]; } }),
                            react_1["default"].createElement(recharts_1.Legend, null),
                            react_1["default"].createElement(recharts_1.Bar, { dataKey: "income", name: "Income", fill: "#22c55e", radius: [4, 4, 0, 0] }),
                            react_1["default"].createElement(recharts_1.Bar, { dataKey: "expense", name: "Expenses", fill: "#ef4444", radius: [4, 4, 0, 0] })))) : (react_1["default"].createElement("div", { className: "flex items-center justify-center h-[300px] text-muted-foreground" }, "No data available yet")))),
                react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, null,
                        react_1["default"].createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                            react_1["default"].createElement(lucide_react_1.TrendingUp, { className: "w-5 h-5 text-green-600" }),
                            "Financial Breakdown"),
                        react_1["default"].createElement(card_1.CardDescription, null, "Revenue, payments, and expenses")),
                    react_1["default"].createElement(card_1.CardContent, null, financialBreakdown && financialBreakdown.length > 0 ? (react_1["default"].createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                        react_1["default"].createElement(recharts_1.PieChart, null,
                            react_1["default"].createElement(recharts_1.Pie, { data: financialBreakdown, cx: "50%", cy: "50%", innerRadius: 60, outerRadius: 100, paddingAngle: 4, dataKey: "value", label: function (_a) {
                                    var name = _a.name, percent = _a.percent;
                                    return name + " " + (percent * 100).toFixed(0) + "%";
                                } }, financialBreakdown.map(function (entry, index) { return (react_1["default"].createElement(recharts_1.Cell, { key: "cell-" + index, fill: ["#22c55e", "#3b82f6", "#ef4444", "#f59e0b"][index % 4] })); })),
                            react_1["default"].createElement(recharts_1.Tooltip, { formatter: function (value) { return [value.toLocaleString(), undefined]; } })))) : (react_1["default"].createElement("div", { className: "flex items-center justify-center h-[300px] text-muted-foreground" }, "No data available yet"))))))) : null,
        react_1["default"].createElement("div", { className: "space-y-4" },
            react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                react_1["default"].createElement("h2", { className: "text-2xl font-bold tracking-tight" }, "Recent Activity"),
                react_1["default"].createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return handleCardClick(recentActivityHref); } }, "View All")),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardHeader, null,
                    react_1["default"].createElement(card_1.CardTitle, null, "Latest Updates"),
                    react_1["default"].createElement(card_1.CardDescription, null, "Recent changes and activities in your CRM")),
                react_1["default"].createElement(card_1.CardContent, null,
                    react_1["default"].createElement("div", { className: "space-y-1" }, recentActivities.length === 0 ? (react_1["default"].createElement("div", { className: "flex items-center justify-between py-3" },
                        react_1["default"].createElement("div", { className: "space-y-1" },
                            react_1["default"].createElement("p", { className: "text-sm font-medium text-slate-900 dark:text-slate-100" }, "No recent activity"),
                            react_1["default"].createElement("p", { className: "text-xs text-slate-500 dark:text-slate-400" }, "Start by creating your first project or client")))) : (recentActivities.map(function (activity) {
                        var _a, _b, _c;
                        return (react_1["default"].createElement("div", { key: activity.id, className: "flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700 last:border-0" },
                            react_1["default"].createElement("div", { className: "flex items-center gap-3" },
                                react_1["default"].createElement("div", { className: "w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-semibold text-slate-700 dark:text-slate-200" }, (_b = (_a = activity.action) === null || _a === void 0 ? void 0 : _a.charAt(0).toUpperCase()) !== null && _b !== void 0 ? _b : "A"),
                                react_1["default"].createElement("div", { className: "space-y-0.5" },
                                    react_1["default"].createElement("p", { className: "text-sm font-medium text-slate-900 dark:text-slate-100" }, activity.description || activity.action + " " + activity.entityType),
                                    react_1["default"].createElement("p", { className: "text-xs text-slate-500 dark:text-slate-400 capitalize" }, (_c = activity.entityType) === null || _c === void 0 ? void 0 : _c.replace(/_/g, " ")))),
                            react_1["default"].createElement("p", { className: "text-xs text-slate-400 whitespace-nowrap" }, activity.createdAt ? new Date(activity.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                            }) : "")));
                    })))))),
        gettingStarted.length > 0 && (react_1["default"].createElement("div", { className: "space-y-4" },
            react_1["default"].createElement("h2", { className: "text-2xl font-bold tracking-tight" }, "Getting Started"),
            react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4" }, gettingStarted.map(function (tip) { return (react_1["default"].createElement(card_1.Card, { key: tip.title },
                react_1["default"].createElement(card_1.CardHeader, null,
                    react_1["default"].createElement(card_1.CardTitle, { className: "text-lg" }, tip.title)),
                react_1["default"].createElement(card_1.CardContent, { className: "space-y-4" },
                    react_1["default"].createElement("p", { className: "text-sm text-slate-600 dark:text-slate-400" }, tip.description),
                    react_1["default"].createElement(button_1.Button, { onClick: function () { return handleCardClick(tip.href); }, className: "w-full", size: "sm" },
                        react_1["default"].createElement(lucide_react_1.ArrowRight, { className: "w-4 h-4 mr-2" }),
                        tip.buttonText)))); }))))));
}
exports["default"] = OrgDashboardShell;
