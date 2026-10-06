"use strict";
/**
 * KPI Tracking Page
 *
 * Comprehensive KPI management and tracking dashboard with:
 * - Visual scorecard with traffic light status indicators
 * - KPI trend charts with target lines
 * - Threshold definition and management
 * - Alert system for off-track KPIs
 */
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var react_1 = require("react");
var trpc_1 = require("@/lib/trpc");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var recharts_1 = require("recharts");
var lucide_react_1 = require("lucide-react");
// Status color mapping
var statusColors = {
    success: 'text-green-600 bg-green-50 border-green-200',
    warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    danger: 'text-red-600 bg-red-50 border-red-200'
};
var statusBgColors = {
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500'
};
// KPI Card Component
var KPICard = function (_a) {
    var kpi = _a.kpi, onSelect = _a.onSelect;
    var variance = ((kpi.currentValue - kpi.targetValue) / kpi.targetValue * 100).toFixed(1);
    var isPositive = parseFloat(variance) >= 0;
    return (react_1["default"].createElement("div", { onClick: function () { return onSelect(kpi.id); }, className: "p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg " + statusColors[kpi.status] },
        react_1["default"].createElement("div", { className: "flex justify-between items-start mb-2" },
            react_1["default"].createElement("h3", { className: "font-semibold" }, kpi.name),
            react_1["default"].createElement("div", { className: "w-4 h-4 rounded-full " + statusBgColors[kpi.status] })),
        react_1["default"].createElement("div", { className: "mb-3" },
            react_1["default"].createElement("div", { className: "text-2xl font-bold" }, kpi.currentValue.toFixed(1)),
            react_1["default"].createElement("div", { className: "text-xs text-gray-600" },
                "Target: ",
                kpi.targetValue,
                " ",
                kpi.unit)),
        react_1["default"].createElement("div", { className: "flex justify-between items-center text-xs" },
            react_1["default"].createElement("span", { className: "text-gray-600" }, kpi.frequency),
            react_1["default"].createElement("span", { className: "font-semibold " + (isPositive ? 'text-green-600' : 'text-red-600') },
                isPositive ? '+' : '',
                variance,
                "% vs target")),
        react_1["default"].createElement("div", { className: "mt-2 pt-2 border-t border-current opacity-30 text-xs" }, kpi.owner)));
};
// Scorecard Component - traffic light view by category
var ScorecardView = function (_a) {
    var categories = _a.categories;
    return (react_1["default"].createElement("div", { className: "space-y-4" }, categories.map(function (cat) { return (react_1["default"].createElement("div", { key: cat.category, className: "bg-white p-4 rounded-lg border border-gray-200" },
        react_1["default"].createElement("h3", { className: "font-semibold mb-3 text-gray-900" }, cat.category),
        react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3" }, cat.kpis.map(function (kpi) {
            var statusColor = kpi.status === 'success' ? 'green' : kpi.status === 'warning' ? 'yellow' : 'red';
            return (react_1["default"].createElement("div", { key: kpi.id, className: "flex items-center justify-between p-2 rounded bg-gray-50 border border-gray-100" },
                react_1["default"].createElement("div", { className: "flex-1" },
                    react_1["default"].createElement("div", { className: "text-sm font-medium text-gray-900" }, kpi.name),
                    react_1["default"].createElement("div", { className: "text-xs text-gray-600" },
                        kpi.value,
                        " / ",
                        kpi.target)),
                react_1["default"].createElement("div", { className: "w-6 h-6 rounded-full flex-shrink-0 " + (statusColor === 'green'
                        ? 'bg-green-500'
                        : statusColor === 'yellow'
                            ? 'bg-yellow-500'
                            : 'bg-red-500') })));
        })))); })));
};
// KPI Threshold Visualization
var ThresholdVisualization = function (_a) {
    var currentValue = _a.currentValue, thresholds = _a.thresholds, unit = _a.unit;
    var allValues = [
        thresholds.danger.min,
        thresholds.warning.min,
        thresholds.success.min,
        thresholds.success.max,
    ];
    var min = Math.min.apply(Math, __spreadArrays(allValues, [currentValue]));
    var max = Math.max.apply(Math, __spreadArrays(allValues, [currentValue]));
    return (react_1["default"].createElement("div", { className: "space-y-3" },
        react_1["default"].createElement("div", { className: "relative h-8 bg-gray-200 rounded-lg overflow-hidden border border-gray-300" },
            react_1["default"].createElement("div", { className: "absolute h-full bg-red-500 opacity-40", style: {
                    left: '0%',
                    right: ((thresholds.danger.max - min) / (max - min)) * 100 + "%"
                } }),
            react_1["default"].createElement("div", { className: "absolute h-full bg-yellow-500 opacity-40", style: {
                    left: ((thresholds.warning.min - min) / (max - min)) * 100 + "%",
                    right: ((thresholds.warning.max - min) / (max - min)) * 100 + "%"
                } }),
            react_1["default"].createElement("div", { className: "absolute h-full bg-green-500 opacity-40", style: {
                    left: ((thresholds.success.min - min) / (max - min)) * 100 + "%",
                    right: ((thresholds.success.max - min) / (max - min)) * 100 + "%"
                } }),
            react_1["default"].createElement("div", { className: "absolute top-0 h-full w-1 bg-black", style: {
                    left: ((currentValue - min) / (max - min)) * 100 + "%"
                } },
                react_1["default"].createElement("div", { className: "absolute top-full mt-1 text-xs font-semibold whitespace-nowrap transform -translate-x-1/2" }, currentValue))),
        react_1["default"].createElement("div", { className: "grid grid-cols-4 gap-2 text-xs text-gray-600" },
            react_1["default"].createElement("div", null,
                "\uD83D\uDD34 Danger: <",
                thresholds.danger.max),
            react_1["default"].createElement("div", null,
                "\uD83D\uDFE1 Warning: ",
                thresholds.warning.min,
                "-",
                thresholds.warning.max),
            react_1["default"].createElement("div", null,
                "\uD83D\uDFE2 Success: ",
                thresholds.success.min,
                "-",
                thresholds.success.max),
            react_1["default"].createElement("div", null,
                "Current: ",
                currentValue,
                unit))));
};
// Main KPI Tracking Page
function KPITrackingPage() {
    var _a, _b, _c;
    var _d = react_1.useState('overview'), activeTab = _d[0], setActiveTab = _d[1];
    var _e = react_1.useState(1), selectedKPIId = _e[0], setSelectedKPIId = _e[1];
    var _f = react_1.useState(false), newKPIMode = _f[0], setNewKPIMode = _f[1];
    // Fetch data
    var kpisQuery = trpc_1.trpc.kpiTracking.getKPIs.useQuery({});
    var scorecardQuery = trpc_1.trpc.kpiTracking.getScorecard.useQuery({});
    var detailQuery = trpc_1.trpc.kpiTracking.getKPIDetail.useQuery({ kpiId: selectedKPIId, period: 'month' }, { enabled: activeTab === 'detail' });
    var libraryQuery = trpc_1.trpc.kpiTracking.getKPILibrary.useQuery({}, { enabled: activeTab === 'library' });
    if (kpisQuery.isLoading) {
        return (react_1["default"].createElement("div", { className: "flex items-center justify-center h-screen" },
            react_1["default"].createElement("div", { className: "text-gray-600" }, "Loading KPI data...")));
    }
    var kpis = ((_a = kpisQuery.data) === null || _a === void 0 ? void 0 : _a.kpis) || [];
    var summary = ((_b = kpisQuery.data) === null || _b === void 0 ? void 0 : _b.summary) || { totalKPIs: 0, onTarget: 0, warning: 0, danger: 0 };
    var scorecard = ((_c = scorecardQuery.data) === null || _c === void 0 ? void 0 : _c.scorecard) || [];
    return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: "KPI Tracking System", description: "Monitor and manage key performance indicators", icon: react_1["default"].createElement(lucide_react_1.Target, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/" },
            { label: "Accounting", href: "/accounting" },
            { label: "KPI Tracking" },
        ] },
        react_1["default"].createElement("div", { className: "p-6" },
            react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 mb-6" },
                react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg border border-gray-200" },
                    react_1["default"].createElement("div", { className: "text-3xl font-bold text-gray-900" }, summary.totalKPIs),
                    react_1["default"].createElement("div", { className: "text-sm text-gray-600" }, "Total KPIs")),
                react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg border border-gray-200 border-green-200 bg-green-50" },
                    react_1["default"].createElement("div", { className: "text-3xl font-bold text-green-600" }, summary.onTarget),
                    react_1["default"].createElement("div", { className: "text-sm text-green-600" }, "On Target")),
                react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg border border-gray-200 border-yellow-200 bg-yellow-50" },
                    react_1["default"].createElement("div", { className: "text-3xl font-bold text-yellow-600" }, summary.warning),
                    react_1["default"].createElement("div", { className: "text-sm text-yellow-600" }, "Warning")),
                react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg border border-gray-200 border-red-200 bg-red-50" },
                    react_1["default"].createElement("div", { className: "text-3xl font-bold text-red-600" }, summary.danger),
                    react_1["default"].createElement("div", { className: "text-sm text-red-600" }, "Critical"))),
            react_1["default"].createElement("div", { className: "flex gap-4 mb-6 border-b border-gray-200" }, ['overview', 'scorecard', 'detail', 'library'].map(function (tab) { return (react_1["default"].createElement("button", { key: tab, onClick: function () { return setActiveTab(tab); }, className: "px-4 py-2 font-medium border-b-2 transition-colors " + (activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900') },
                tab === 'overview' && 'Overview',
                tab === 'scorecard' && 'Scorecard',
                tab === 'detail' && 'Detail',
                tab === 'library' && 'Library')); })),
            react_1["default"].createElement("div", { className: "bg-white rounded-lg border border-gray-200 p-6" },
                activeTab === 'overview' && (react_1["default"].createElement("div", { className: "space-y-6" },
                    react_1["default"].createElement("div", { className: "flex justify-between items-center" },
                        react_1["default"].createElement("h2", { className: "text-xl font-semibold text-gray-900" }, "All KPIs"),
                        react_1["default"].createElement("button", { onClick: function () { return setNewKPIMode(!newKPIMode); }, className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors" }, "+ New KPI")),
                    react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" }, kpis.map(function (kpi) { return (react_1["default"].createElement(KPICard, { key: kpi.id, kpi: kpi, onSelect: function (id) {
                            setSelectedKPIId(id);
                            setActiveTab('detail');
                        } })); })))),
                activeTab === 'scorecard' && (react_1["default"].createElement("div", { className: "space-y-4" },
                    react_1["default"].createElement("h2", { className: "text-xl font-semibold text-gray-900 mb-4" }, "Executive Scorecard"),
                    react_1["default"].createElement(ScorecardView, { categories: scorecard }))),
                activeTab === 'detail' && detailQuery.data && (react_1["default"].createElement("div", { className: "space-y-6" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("h2", { className: "text-xl font-semibold text-gray-900 mb-2" }, detailQuery.data.name),
                        react_1["default"].createElement("p", { className: "text-gray-600" }, detailQuery.data.description)),
                    react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4" },
                        react_1["default"].createElement("div", { className: "bg-gray-50 p-4 rounded-lg border border-gray-200" },
                            react_1["default"].createElement("div", { className: "text-sm text-gray-600 mb-1" }, "Current Value"),
                            react_1["default"].createElement("div", { className: "text-3xl font-bold text-gray-900" },
                                detailQuery.data.currentValue,
                                react_1["default"].createElement("span", { className: "text-lg text-gray-500 ml-1" }, detailQuery.data.unit)),
                            react_1["default"].createElement("div", { className: "text-xs text-gray-600 mt-2" },
                                detailQuery.data.trendPercent > 0 ? '↑' : '↓',
                                " ",
                                Math.abs(detailQuery.data.trendPercent),
                                "% vs prior period")),
                        react_1["default"].createElement("div", { className: "bg-gray-50 p-4 rounded-lg border border-gray-200" },
                            react_1["default"].createElement("div", { className: "text-sm text-gray-600 mb-1" }, "Target Value"),
                            react_1["default"].createElement("div", { className: "text-3xl font-bold text-gray-900" },
                                detailQuery.data.targetValue,
                                react_1["default"].createElement("span", { className: "text-lg text-gray-500 ml-1" }, detailQuery.data.unit)),
                            react_1["default"].createElement("div", { className: "text-xs text-gray-600 mt-2" },
                                ((detailQuery.data.currentValue - detailQuery.data.targetValue) / detailQuery.data.targetValue * 100).toFixed(1),
                                "% variance")),
                        react_1["default"].createElement("div", { className: "bg-gray-50 p-4 rounded-lg border border-gray-200" },
                            react_1["default"].createElement("div", { className: "text-sm text-gray-600 mb-1" }, "Status"),
                            react_1["default"].createElement("div", { className: "text-3xl font-bold " + statusBgColors[detailQuery.data.status] + " w-fit text-white px-3 py-1 rounded mt-2" }, detailQuery.data.status.charAt(0).toUpperCase() + detailQuery.data.status.slice(1)),
                            react_1["default"].createElement("div", { className: "text-xs text-gray-600 mt-2" },
                                detailQuery.data.severity,
                                " severity"))),
                    react_1["default"].createElement("div", { className: "bg-gray-50 p-4 rounded-lg border border-gray-200" },
                        react_1["default"].createElement("h3", { className: "font-semibold text-gray-900 mb-3" }, "Alert Thresholds"),
                        react_1["default"].createElement(ThresholdVisualization, { currentValue: detailQuery.data.currentValue, thresholds: detailQuery.data.alertThresholds, unit: detailQuery.data.unit })),
                    react_1["default"].createElement("div", { className: "bg-gray-50 p-4 rounded-lg border border-gray-200" },
                        react_1["default"].createElement("h3", { className: "font-semibold text-gray-900 mb-4" }, "Historical Trend"),
                        react_1["default"].createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 300 },
                            react_1["default"].createElement(recharts_1.ComposedChart, { data: detailQuery.data.historicalData },
                                react_1["default"].createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }),
                                react_1["default"].createElement(recharts_1.XAxis, { dataKey: "date" }),
                                react_1["default"].createElement(recharts_1.YAxis, null),
                                react_1["default"].createElement(recharts_1.Tooltip, null),
                                react_1["default"].createElement(recharts_1.Legend, null),
                                react_1["default"].createElement(recharts_1.Line, { type: "monotone", dataKey: "value", stroke: "#2563eb", name: "Actual", strokeWidth: 2 }),
                                react_1["default"].createElement(recharts_1.Line, { type: "monotone", dataKey: "target", stroke: "#16a34a", name: "Target", strokeWidth: 2, strokeDasharray: "5 5" })))),
                    react_1["default"].createElement("div", { className: "bg-blue-50 p-4 rounded-lg border border-blue-200" },
                        react_1["default"].createElement("h3", { className: "font-semibold text-blue-900 mb-3" }, "\uD83D\uDCCA Key Insights"),
                        react_1["default"].createElement("ul", { className: "space-y-2" }, detailQuery.data.insights.map(function (insight, i) { return (react_1["default"].createElement("li", { key: i, className: "text-sm text-blue-800 flex items-start" },
                            react_1["default"].createElement("span", { className: "mr-2" }, "\u2022"),
                            insight)); }))),
                    react_1["default"].createElement("div", { className: "bg-orange-50 p-4 rounded-lg border border-orange-200" },
                        react_1["default"].createElement("h3", { className: "font-semibold text-orange-900 mb-3" }, "\u2713 Recommended Actions"),
                        react_1["default"].createElement("ul", { className: "space-y-2" }, detailQuery.data.actionItems.map(function (item, i) { return (react_1["default"].createElement("li", { key: i, className: "text-sm text-orange-800 flex items-start" },
                            react_1["default"].createElement("input", { type: "checkbox", className: "mr-2 mt-1 h-4 w-4 rounded border-orange-300" }),
                            item)); }))))),
                activeTab === 'library' && libraryQuery.data && (react_1["default"].createElement("div", { className: "space-y-4" },
                    react_1["default"].createElement("h2", { className: "text-xl font-semibold text-gray-900 mb-4" }, "KPI Library"),
                    react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" }, libraryQuery.data.library.map(function (template) { return (react_1["default"].createElement("div", { key: template.id, className: "p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow" },
                        react_1["default"].createElement("div", { className: "flex justify-between items-start mb-2" },
                            react_1["default"].createElement("h3", { className: "font-semibold text-gray-900" }, template.name),
                            react_1["default"].createElement("span", { className: "text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded" }, template.category)),
                        react_1["default"].createElement("p", { className: "text-sm text-gray-600 mb-3" }, template.description),
                        react_1["default"].createElement("div", { className: "bg-gray-50 p-2 rounded mb-3 text-xs text-gray-700 font-mono" }, template.formula),
                        react_1["default"].createElement("div", { className: "text-sm text-gray-600 mb-3" },
                            "\uD83D\uDCCA Benchmark: ",
                            react_1["default"].createElement("span", { className: "font-semibold" }, template.benchmark)),
                        react_1["default"].createElement("button", { className: "w-full px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors" }, "Use Template"))); }))))))));
}
exports["default"] = KPITrackingPage;
