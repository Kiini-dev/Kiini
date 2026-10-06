"use strict";
/**
 * Forecasting Page
 *
 * Comprehensive forecasting and what-if analysis tool with:
 * - Revenue, expense, and cash flow forecasting
 * - Scenario analysis (base/conservative/optimistic)
 * - What-if analysis with sensitivity testing
 * - Forecast accuracy tracking and model diagnostics
 */
exports.__esModule = true;
var react_1 = require("react");
var trpc_1 = require("@/lib/trpc");
var permissions_1 = require("@/lib/permissions");
var spinner_1 = require("@/components/ui/spinner");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var sonner_1 = require("sonner");
var recharts_1 = require("recharts");
var lucide_react_1 = require("lucide-react");
// Confidence interval visualization component
var ConfidenceInterval = function (_a) {
    var data = _a.data, title = _a.title;
    return (react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg border border-gray-200" },
        react_1["default"].createElement("h3", { className: "font-semibold text-gray-900 mb-4" }, title),
        react_1["default"].createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
            react_1["default"].createElement(recharts_1.AreaChart, { data: data },
                react_1["default"].createElement("defs", null,
                    react_1["default"].createElement("linearGradient", { id: "colorConf", x1: "0", y1: "0", x2: "0", y2: "1" },
                        react_1["default"].createElement("stop", { offset: "5%", stopColor: "#3b82f6", stopOpacity: 0.3 }),
                        react_1["default"].createElement("stop", { offset: "95%", stopColor: "#3b82f6", stopOpacity: 0 }))),
                react_1["default"].createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }),
                react_1["default"].createElement(recharts_1.XAxis, { dataKey: "month" }),
                react_1["default"].createElement(recharts_1.YAxis, null),
                react_1["default"].createElement(recharts_1.Tooltip, { contentStyle: { backgroundColor: '#f3f4f6', border: '1px solid #d1d5db' }, formatter: function (value) { return "$" + value.toLocaleString(); } }),
                react_1["default"].createElement(recharts_1.Area, { type: "monotone", dataKey: "upper", stroke: "#3b82f6", fill: "none", strokeDasharray: "5 5", name: "Upper bound" }),
                react_1["default"].createElement(recharts_1.Area, { type: "monotone", dataKey: "forecast", stroke: "#2563eb", fill: "url(#colorConf)", strokeWidth: 2, name: "Forecast" }),
                react_1["default"].createElement(recharts_1.Area, { type: "monotone", dataKey: "lower", stroke: "#3b82f6", fill: "none", strokeDasharray: "5 5", name: "Lower bound" })))));
};
// Scenario comparison component
var ScenarioComparison = function (_a) {
    var scenarios = _a.scenarios;
    return (react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg border border-gray-200" },
        react_1["default"].createElement("h3", { className: "font-semibold text-gray-900 mb-4" }, "Scenario Analysis"),
        react_1["default"].createElement("div", { className: "space-y-3" }, scenarios.map(function (scenario) { return (react_1["default"].createElement("div", { key: scenario.scenario, className: "flex items-start gap-4 p-3 bg-gray-50 rounded border border-gray-200" },
            react_1["default"].createElement("div", { className: "flex-1" },
                react_1["default"].createElement("h4", { className: "font-medium text-gray-900" }, scenario.scenario),
                react_1["default"].createElement("div", { className: "text-sm text-gray-600 mt-1" },
                    "Probability: ",
                    scenario.probability,
                    "%")),
            react_1["default"].createElement("div", { className: "text-right" },
                react_1["default"].createElement("div", { className: "text-lg font-bold text-gray-900" },
                    "$",
                    scenario.expectedValue.toLocaleString()),
                react_1["default"].createElement("div", { className: "text-xs text-gray-600" }, "Expected Value")))); }))));
};
// What-If Scenario Builder
var WhatIfBuilder = function (_a) {
    var onAnalyze = _a.onAnalyze;
    var _b = react_1.useState(10), revenueGrowth = _b[0], setRevenueGrowth = _b[1];
    var _c = react_1.useState(5), costIncrease = _c[0], setCostIncrease = _c[1];
    var _d = react_1.useState(0), marginImprovement = _d[0], setMarginImprovement = _d[1];
    var handleAnalyze = function () {
        onAnalyze({
            revenue_growth_percent: revenueGrowth,
            cost_increase_percent: costIncrease,
            margin_improvement_percent: marginImprovement
        });
    };
    return (react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg border border-gray-200" },
        react_1["default"].createElement("h3", { className: "font-semibold text-gray-900 mb-4" }, "What-If Analysis"),
        react_1["default"].createElement("div", { className: "space-y-4" },
            react_1["default"].createElement("div", null,
                react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 mb-2" },
                    "Revenue Growth: ",
                    revenueGrowth,
                    "%"),
                react_1["default"].createElement("input", { type: "range", min: "-30", max: "30", value: revenueGrowth, onChange: function (e) { return setRevenueGrowth(Number(e.target.value)); }, className: "w-full" })),
            react_1["default"].createElement("div", null,
                react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 mb-2" },
                    "Cost Increase: ",
                    costIncrease,
                    "%"),
                react_1["default"].createElement("input", { type: "range", min: "-20", max: "20", value: costIncrease, onChange: function (e) { return setCostIncrease(Number(e.target.value)); }, className: "w-full" })),
            react_1["default"].createElement("div", null,
                react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 mb-2" },
                    "Margin Improvement: ",
                    marginImprovement,
                    "%"),
                react_1["default"].createElement("input", { type: "range", min: "-10", max: "20", value: marginImprovement, onChange: function (e) { return setMarginImprovement(Number(e.target.value)); }, className: "w-full" })),
            react_1["default"].createElement("button", { onClick: handleAnalyze, className: "w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium" }, "Run Analysis"))));
};
// Main Forecasting Page
function ForecastingPage() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    var _m = permissions_1.useRequireFeature("accounting:forecasting:view"), allowed = _m.allowed, permissionLoading = _m.isLoading;
    var _o = react_1.useState('revenue'), activeTab = _o[0], setActiveTab = _o[1];
    var _p = react_1.useState('base'), selectedScenario = _p[0], setSelectedScenario = _p[1];
    var _q = react_1.useState(null), whatIfResult = _q[0], setWhatIfResult = _q[1];
    // Queries — always fetch revenue & accuracy for Quick Stats cards
    var revenueQuery = trpc_1.trpc.forecasting.getRevenueForecast.useQuery({ scenario: selectedScenario }, { enabled: allowed });
    var expenseQuery = trpc_1.trpc.forecasting.getExpenseForecast.useQuery({}, { enabled: allowed });
    var cashFlowQuery = trpc_1.trpc.forecasting.getCashFlowForecast.useQuery({}, { enabled: allowed && activeTab === 'cashflow' });
    var scenarioQuery = trpc_1.trpc.forecasting.getScenarioAnalysis.useQuery({ metric: 'revenue' }, { enabled: allowed && activeTab === 'scenario' });
    var accuracyQuery = trpc_1.trpc.forecasting.getForecastAccuracy.useQuery({}, { enabled: allowed });
    var whatIfMutation = trpc_1.trpc.forecasting.getWhatIfAnalysis.useMutation({
        onSuccess: function (data) { return setWhatIfResult(data); },
        onError: function (err) { var _a; return (_a = sonner_1.toast === null || sonner_1.toast === void 0 ? void 0 : sonner_1.toast.error) === null || _a === void 0 ? void 0 : _a.call(sonner_1.toast, err.message || "What-If analysis failed"); }
    });
    var handleWhatIf = function (params) {
        whatIfMutation.mutate({
            scenario: 'Custom What-If',
            parameters: params
        });
    };
    if (permissionLoading) {
        return (react_1["default"].createElement("div", { className: "flex items-center justify-center h-screen" },
            react_1["default"].createElement(spinner_1.Spinner, null)));
    }
    if (!allowed)
        return null;
    if (revenueQuery.isLoading && activeTab === 'revenue') {
        return (react_1["default"].createElement("div", { className: "flex items-center justify-center h-screen" },
            react_1["default"].createElement("div", { className: "text-gray-600" }, "Loading forecast data...")));
    }
    return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: "Predictive Forecasting", description: "Advanced forecasting, scenario analysis, and what-if planning", icon: react_1["default"].createElement(lucide_react_1.LineChart, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Accounting", href: "/accounting" },
            { label: "Forecasting" },
        ] },
        react_1["default"].createElement("div", { className: "p-6" },
            react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 mb-6" },
                react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg border border-gray-200" },
                    react_1["default"].createElement("div", { className: "text-sm text-gray-600 mb-1" }, "Revenue (Next Month)"),
                    react_1["default"].createElement("div", { className: "text-2xl font-bold text-gray-900" }, ((_b = (_a = revenueQuery.data) === null || _a === void 0 ? void 0 : _a.forecasts) === null || _b === void 0 ? void 0 : _b[0]) ? "$" + (revenueQuery.data.forecasts[0].forecast / 1000).toFixed(0) + "K"
                        : '—'),
                    react_1["default"].createElement("div", { className: "text-xs text-green-600 mt-1" },
                        ((_d = (_c = revenueQuery.data) === null || _c === void 0 ? void 0 : _c.summary) === null || _d === void 0 ? void 0 : _d.trend) === 'up' ? '↑' : '↓',
                        " ",
                        ((_e = revenueQuery.data) === null || _e === void 0 ? void 0 : _e.scenario) || 'base',
                        " scenario")),
                react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg border border-gray-200" },
                    react_1["default"].createElement("div", { className: "text-sm text-gray-600 mb-1" }, "Expense Forecast"),
                    react_1["default"].createElement("div", { className: "text-2xl font-bold text-gray-900" }, ((_g = (_f = expenseQuery.data) === null || _f === void 0 ? void 0 : _f.forecasts) === null || _g === void 0 ? void 0 : _g[0]) ? "$" + (expenseQuery.data.forecasts[0].forecast / 1000).toFixed(0) + "K"
                        : '—'),
                    react_1["default"].createElement("div", { className: "text-xs text-orange-600 mt-1" }, ((_h = expenseQuery.data) === null || _h === void 0 ? void 0 : _h.category) || 'All categories')),
                react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg border border-gray-200" },
                    react_1["default"].createElement("div", { className: "text-sm text-gray-600 mb-1" }, "Forecast Accuracy"),
                    react_1["default"].createElement("div", { className: "text-2xl font-bold text-green-600" }, accuracyQuery.data ? accuracyQuery.data.overallAccuracy + "%" : '—'),
                    react_1["default"].createElement("div", { className: "text-xs text-gray-600 mt-1" }, "6-month average")),
                react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg border border-gray-200" },
                    react_1["default"].createElement("div", { className: "text-sm text-gray-600 mb-1" }, "Model Quality"),
                    react_1["default"].createElement("div", { className: "text-2xl font-bold text-gray-900" }, ((_j = accuracyQuery.data) === null || _j === void 0 ? void 0 : _j.modelQuality) || '—'),
                    react_1["default"].createElement("div", { className: "text-xs text-gray-600 mt-1" }, ((_l = (_k = revenueQuery.data) === null || _k === void 0 ? void 0 : _k.summary) === null || _l === void 0 ? void 0 : _l.rSquared) != null
                        ? "R\u00B2 = " + revenueQuery.data.summary.rSquared.toFixed(2)
                        : ''))),
            react_1["default"].createElement("div", { className: "flex gap-2 mb-6 border-b border-gray-200 flex-wrap" }, ['revenue', 'expense', 'cashflow', 'scenario', 'whatif', 'accuracy'].map(function (tab) { return (react_1["default"].createElement("button", { key: tab, onClick: function () { return setActiveTab(tab); }, className: "px-4 py-2 font-medium border-b-2 transition-colors " + (activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900') },
                tab === 'revenue' && 'Revenue Forecast',
                tab === 'expense' && 'Expense Forecast',
                tab === 'cashflow' && 'Cash Flow',
                tab === 'scenario' && 'Scenarios',
                tab === 'whatif' && 'What-If',
                tab === 'accuracy' && 'Accuracy')); })),
            react_1["default"].createElement("div", { className: "space-y-6" },
                activeTab === 'revenue' && revenueQuery.data && (react_1["default"].createElement("div", { className: "space-y-6" },
                    react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg border border-gray-200" },
                        react_1["default"].createElement("h3", { className: "font-semibold text-gray-900 mb-3" }, "Select Scenario"),
                        react_1["default"].createElement("div", { className: "grid grid-cols-3 gap-3" }, ['conservative', 'base', 'optimistic'].map(function (scenario) { return (react_1["default"].createElement("button", { key: scenario, onClick: function () { return setSelectedScenario(scenario); }, className: "p-3 rounded-lg border-2 transition-all " + (selectedScenario === scenario
                                ? 'border-blue-600 bg-blue-50'
                                : 'border-gray-200 bg-gray-50 hover:border-gray-300') },
                            react_1["default"].createElement("div", { className: "font-medium text-gray-900" }, scenario.charAt(0).toUpperCase() + scenario.slice(1)),
                            react_1["default"].createElement("div", { className: "text-xs text-gray-600 mt-1" },
                                scenario === 'conservative' && 'Cautious estimate',
                                scenario === 'base' && 'Expected trend',
                                scenario === 'optimistic' && 'Growth scenario'))); }))),
                    react_1["default"].createElement(ConfidenceInterval, { data: revenueQuery.data.forecasts, title: "12-Month Revenue Forecast with Confidence Intervals" }),
                    react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4" },
                        react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg border border-gray-200" },
                            react_1["default"].createElement("div", { className: "text-sm text-gray-600 mb-1" }, "Average Monthly Forecast"),
                            react_1["default"].createElement("div", { className: "text-2xl font-bold text-gray-900" },
                                "$",
                                revenueQuery.data.summary.avgForecast.toLocaleString())),
                        react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg border border-gray-200" },
                            react_1["default"].createElement("div", { className: "text-sm text-gray-600 mb-1" }, "Range"),
                            react_1["default"].createElement("div", { className: "text-lg font-bold text-gray-900" },
                                "$",
                                revenueQuery.data.summary.rangeLow.toLocaleString(),
                                " - $",
                                revenueQuery.data.summary.rangeHigh.toLocaleString())),
                        react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg border border-gray-200" },
                            react_1["default"].createElement("div", { className: "text-sm text-gray-600 mb-1" }, "Model Fitness (R\u00B2)"),
                            react_1["default"].createElement("div", { className: "text-2xl font-bold text-green-600" },
                                (revenueQuery.data.summary.rSquared * 100).toFixed(0),
                                "%"))))),
                activeTab === 'expense' && expenseQuery.data && (react_1["default"].createElement("div", { className: "space-y-6" },
                    react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg border border-gray-200" },
                        react_1["default"].createElement("h3", { className: "font-semibold text-gray-900 mb-4" }, "12-Month Expense Forecast"),
                        react_1["default"].createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                            react_1["default"].createElement(recharts_1.BarChart, { data: expenseQuery.data.forecasts },
                                react_1["default"].createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }),
                                react_1["default"].createElement(recharts_1.XAxis, { dataKey: "month" }),
                                react_1["default"].createElement(recharts_1.YAxis, null),
                                react_1["default"].createElement(recharts_1.Tooltip, { formatter: function (value) { return "$" + value.toLocaleString(); } }),
                                react_1["default"].createElement(recharts_1.Legend, null),
                                react_1["default"].createElement(recharts_1.Bar, { dataKey: "forecast", fill: "#f59e0b", name: "Forecast" }),
                                react_1["default"].createElement(recharts_1.Bar, { dataKey: "variance", fill: "#ef4444", name: "Variance" })))),
                    react_1["default"].createElement("div", { className: "bg-blue-50 p-4 rounded-lg border border-blue-200" },
                        react_1["default"].createElement("h3", { className: "font-semibold text-blue-900 mb-2 flex items-center gap-2" },
                            react_1["default"].createElement(lucide_react_1.Info, { className: "w-4 h-4" }),
                            "Insights"),
                        react_1["default"].createElement("ul", { className: "space-y-1 text-sm text-blue-800" }, expenseQuery.data.insights.map(function (insight, i) { return (react_1["default"].createElement("li", { key: i },
                            "\u2022 ",
                            insight)); }))))),
                activeTab === 'cashflow' && cashFlowQuery.data && (react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg border border-gray-200" },
                    react_1["default"].createElement("h3", { className: "font-semibold text-gray-900 mb-4" }, "12-Month Cash Flow Forecast"),
                    react_1["default"].createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 350 },
                        react_1["default"].createElement(recharts_1.ComposedChart, { data: cashFlowQuery.data.forecasts },
                            react_1["default"].createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }),
                            react_1["default"].createElement(recharts_1.XAxis, { dataKey: "month" }),
                            react_1["default"].createElement(recharts_1.YAxis, { yAxisId: "left" }),
                            react_1["default"].createElement(recharts_1.YAxis, { yAxisId: "right", orientation: "right" }),
                            react_1["default"].createElement(recharts_1.Tooltip, { formatter: function (value) { return "$" + value.toLocaleString(); } }),
                            react_1["default"].createElement(recharts_1.Legend, null),
                            react_1["default"].createElement(recharts_1.Bar, { yAxisId: "left", dataKey: "inflow", fill: "#10b981", name: "Cash Inflow" }),
                            react_1["default"].createElement(recharts_1.Bar, { yAxisId: "left", dataKey: "outflow", fill: "#ef4444", name: "Cash Outflow" }),
                            react_1["default"].createElement(recharts_1.Line, { yAxisId: "right", type: "monotone", dataKey: "cumulativeBalance", stroke: "#3b82f6", name: "Cumulative Balance", strokeWidth: 2 }))))),
                activeTab === 'scenario' && scenarioQuery.data && (react_1["default"].createElement(ScenarioComparison, { scenarios: scenarioQuery.data.scenarios })),
                activeTab === 'whatif' && (react_1["default"].createElement("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6" },
                    react_1["default"].createElement(WhatIfBuilder, { onAnalyze: handleWhatIf }),
                    whatIfResult && (react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg border border-gray-200" },
                        react_1["default"].createElement("h3", { className: "font-semibold text-gray-900 mb-4" }, "Analysis Results"),
                        react_1["default"].createElement("div", { className: "space-y-4" },
                            react_1["default"].createElement("div", { className: "grid grid-cols-2 gap-4" },
                                react_1["default"].createElement("div", { className: "bg-gray-50 p-3 rounded border border-gray-200" },
                                    react_1["default"].createElement("div", { className: "text-xs text-gray-600" }, "Base Revenue"),
                                    react_1["default"].createElement("div", { className: "text-lg font-bold text-gray-900" },
                                        "$",
                                        whatIfResult.baseCase.revenue.toLocaleString())),
                                react_1["default"].createElement("div", { className: "bg-gray-50 p-3 rounded border border-gray-200" },
                                    react_1["default"].createElement("div", { className: "text-xs text-gray-600" }, "Adjusted Revenue"),
                                    react_1["default"].createElement("div", { className: "text-lg font-bold text-gray-900" },
                                        "$",
                                        whatIfResult.adjusted.revenue.toLocaleString())),
                                react_1["default"].createElement("div", { className: "bg-gray-50 p-3 rounded border border-gray-200" },
                                    react_1["default"].createElement("div", { className: "text-xs text-gray-600" }, "Base Profit"),
                                    react_1["default"].createElement("div", { className: "text-lg font-bold text-gray-900" },
                                        "$",
                                        whatIfResult.baseCase.profit.toLocaleString())),
                                react_1["default"].createElement("div", { className: "bg-gray-50 p-3 rounded border border-gray-200" },
                                    react_1["default"].createElement("div", { className: "text-xs text-gray-600" }, "Adjusted Profit"),
                                    react_1["default"].createElement("div", { className: "text-lg font-bold " + (whatIfResult.adjusted.profit > whatIfResult.baseCase.profit ? 'text-green-600' : 'text-red-600') },
                                        "$",
                                        whatIfResult.adjusted.profit.toLocaleString()))),
                            react_1["default"].createElement("div", { className: "bg-blue-50 border border-blue-200 p-3 rounded" },
                                react_1["default"].createElement("div", { className: "font-medium text-blue-900 mb-2" }, "Impact Summary"),
                                react_1["default"].createElement("div", { className: "text-2xl font-bold " + (whatIfResult.summary.profitChange > 0 ? 'text-green-600' : 'text-red-600') },
                                    whatIfResult.summary.profitChange > 0 ? '+' : '',
                                    whatIfResult.summary.profitChange.toLocaleString(),
                                    react_1["default"].createElement("span", { className: "text-lg ml-2" },
                                        "(",
                                        whatIfResult.summary.profitChangePercent,
                                        "%)"))),
                            whatIfResult.impacts.length > 0 && (react_1["default"].createElement("div", null,
                                react_1["default"].createElement("h4", { className: "font-medium text-gray-900 mb-2" }, "Impact Breakdown"),
                                react_1["default"].createElement("div", { className: "space-y-2" }, whatIfResult.impacts.map(function (impact, i) { return (react_1["default"].createElement("div", { key: i, className: "text-sm text-gray-700" },
                                    "\u2022 ",
                                    impact.description)); }))))))))),
                activeTab === 'accuracy' && accuracyQuery.data && (react_1["default"].createElement("div", { className: "space-y-6" },
                    react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                        react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg border border-gray-200" },
                            react_1["default"].createElement("div", { className: "text-sm text-gray-600 mb-1" }, "Overall Accuracy"),
                            react_1["default"].createElement("div", { className: "text-3xl font-bold text-green-600" },
                                accuracyQuery.data.overallAccuracy,
                                "%"),
                            react_1["default"].createElement("div", { className: "text-xs text-gray-600 mt-2" }, "6-month average")),
                        react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg border border-gray-200" },
                            react_1["default"].createElement("div", { className: "text-sm text-gray-600 mb-1" }, "Model Quality"),
                            react_1["default"].createElement("div", { className: "text-xl font-bold text-gray-900" }, accuracyQuery.data.modelQuality),
                            react_1["default"].createElement("div", { className: "text-xs text-gray-600 mt-2" }, "Based on bias and variance"))),
                    react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg border border-gray-200" },
                        react_1["default"].createElement("h3", { className: "font-semibold text-gray-900 mb-4" }, "Metric Accuracy"),
                        react_1["default"].createElement("div", { className: "space-y-3" }, accuracyQuery.data.metrics.map(function (metric) { return (react_1["default"].createElement("div", { key: metric.metric, className: "flex items-center justify-between" },
                            react_1["default"].createElement("div", null,
                                react_1["default"].createElement("div", { className: "font-medium text-gray-900" }, metric.metric),
                                react_1["default"].createElement("div", { className: "text-xs text-gray-600" },
                                    "MAPE: ",
                                    metric.mape,
                                    "%")),
                            react_1["default"].createElement("div", { className: "text-right" },
                                react_1["default"].createElement("div", { className: "text-lg font-bold text-gray-900" },
                                    metric.accuracy,
                                    "%"),
                                react_1["default"].createElement("div", { className: "w-24 h-2 bg-gray-200 rounded-full mt-1 overflow-hidden" },
                                    react_1["default"].createElement("div", { className: "h-full bg-blue-600 rounded-full", style: { width: metric.accuracy + "%" } }))))); }))),
                    react_1["default"].createElement("div", { className: "bg-green-50 p-4 rounded-lg border border-green-200" },
                        react_1["default"].createElement("h3", { className: "font-semibold text-green-900 mb-2 flex items-center gap-2" },
                            react_1["default"].createElement(lucide_react_1.TrendingUp, { className: "w-4 h-4" }),
                            "Recommendations"),
                        react_1["default"].createElement("ul", { className: "space-y-1 text-sm text-green-800" }, accuracyQuery.data.recommendations.map(function (rec, i) { return (react_1["default"].createElement("li", { key: i },
                            "\u2022 ",
                            rec)); })))))))));
}
exports["default"] = ForecastingPage;
