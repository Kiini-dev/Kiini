"use strict";
/**
 * Executive Dashboard Page
 *
 * Executive-level dashboard providing:
 * - At-a-glance summary of critical metrics
 * - Real-time alerts and warnings
 * - Customizable widget layout
 * - Executive briefing generation
 * - Strategic insights and recommendations
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var react_1 = require("react");
var sonner_1 = require("sonner");
var trpc_1 = require("@/lib/trpc");
var lucide_react_1 = require("lucide-react");
var ModuleLayout_1 = require("@/components/ModuleLayout");
// Top Metrics Component
var MetricCard = function (_a) {
    var title = _a.title, value = _a.value, currency = _a.currency, _b = _a.unit, unit = _b === void 0 ? '' : _b, change = _a.change, target = _a.target, status = _a.status;
    var isPositive = change >= 0;
    var backgroundColor = status === 'positive' ? 'bg-green-50' : status === 'negative' ? 'bg-red-50' : 'bg-gray-50';
    var borderColor = status === 'positive' ? 'border-green-200' : status === 'negative' ? 'border-red-200' : 'border-gray-200';
    return (react_1["default"].createElement("div", { className: backgroundColor + " border " + borderColor + " p-4 rounded-lg" },
        react_1["default"].createElement("div", { className: "text-sm font-medium text-gray-600 mb-1" }, title),
        react_1["default"].createElement("div", { className: "flex items-baseline gap-2 mb-2" },
            react_1["default"].createElement("div", { className: "text-2xl font-bold text-gray-900" },
                currency ? '$' : '',
                typeof value === 'number' ? value.toLocaleString() : value,
                unit),
            react_1["default"].createElement("div", { className: "flex items-center gap-1 text-sm font-semibold " + (isPositive ? 'text-green-600' : 'text-red-600') },
                isPositive ? react_1["default"].createElement(lucide_react_1.TrendingUp, { className: "w-4 h-4" }) : react_1["default"].createElement(lucide_react_1.TrendingDown, { className: "w-4 h-4" }),
                Math.abs(change),
                "%")),
        react_1["default"].createElement("div", { className: "text-xs text-gray-600" },
            "Target: ",
            currency ? '$' : '',
            target.toLocaleString(),
            unit)));
};
// Alert Component
var AlertItem = function (_a) {
    var alert = _a.alert;
    var bgColor = alert.severity === 'critical' ? 'bg-red-50' : alert.severity === 'warning' ? 'bg-yellow-50' : 'bg-blue-50';
    var borderColor = alert.severity === 'critical' ? 'border-red-200' : alert.severity === 'warning' ? 'border-yellow-200' : 'border-blue-200';
    var titleColor = alert.severity === 'critical' ? 'text-red-900' : alert.severity === 'warning' ? 'text-yellow-900' : 'text-blue-900';
    var icon = alert.severity === 'critical' ? react_1["default"].createElement(lucide_react_1.AlertTriangle, { className: "w-4 h-4" }) : react_1["default"].createElement(lucide_react_1.AlertCircle, { className: "w-4 h-4" });
    return (react_1["default"].createElement("div", { className: bgColor + " border-2 " + borderColor + " p-3 rounded-lg" },
        react_1["default"].createElement("div", { className: "flex items-start gap-2 " + titleColor + " font-semibold mb-1" },
            icon,
            alert.title),
        react_1["default"].createElement("p", { className: "text-sm " + titleColor + " mb-2" }, alert.description),
        alert.suggestedAction && (react_1["default"].createElement("div", { className: "text-xs " + titleColor + " italic" },
            "\uD83D\uDCA1 ",
            alert.suggestedAction))));
};
// Department Performance Component
var DepartmentPerformance = function (_a) {
    var data = _a.data;
    return (react_1["default"].createElement("div", { className: "space-y-2" }, data.map(function (dept) {
        var isOnTrack = dept.status === 'on-track';
        var isExceeding = dept.status === 'exceeding';
        var bgColor = isExceeding ? 'bg-green-50' : isOnTrack ? 'bg-gray-50' : 'bg-orange-50';
        var borderColor = isExceeding ? 'border-green-200' : isOnTrack ? 'border-gray-200' : 'border-orange-200';
        return (react_1["default"].createElement("div", { key: dept.dept, className: bgColor + " p-3 rounded-lg border border-gray-200" },
            react_1["default"].createElement("div", { className: "flex justify-between items-center mb-2" },
                react_1["default"].createElement("h4", { className: "font-medium text-gray-900" }, dept.dept),
                react_1["default"].createElement("span", { className: "text-sm font-semibold " + (isExceeding ? 'text-green-600' : isOnTrack ? 'text-gray-600' : 'text-orange-600') },
                    dept.variance > 0 ? '+' : '',
                    dept.variance,
                    "% vs target")),
            react_1["default"].createElement("div", { className: "w-full bg-gray-200 h-2 rounded-full overflow-hidden" },
                react_1["default"].createElement("div", { className: "h-full " + (isExceeding ? 'bg-green-500' : isOnTrack ? 'bg-gray-500' : 'bg-orange-500'), style: { width: Math.min(100, (dept.revenue / dept.target) * 100) + "%" } })),
            react_1["default"].createElement("div", { className: "text-xs text-gray-600 mt-1" },
                "$",
                dept.revenue.toLocaleString(),
                " / $",
                dept.target.toLocaleString())));
    })));
};
// Main Executive Dashboard
function ExecutiveDashboardPage() {
    var _this = this;
    var _a, _b, _c, _d, _e;
    var _f = react_1.useState('overview'), activeTab = _f[0], setActiveTab = _f[1];
    var _g = react_1.useState(false), refreshing = _g[0], setRefreshing = _g[1];
    var _h = react_1.useState('month'), selectedPeriod = _h[0], setSelectedPeriod = _h[1];
    var _j = react_1.useState('previous'), compareTo = _j[0], setCompareTo = _j[1];
    var _k = react_1.useState('pdf'), exportFormat = _k[0], setExportFormat = _k[1];
    // Queries
    var summaryQuery = trpc_1.trpc.executiveDashboard.getDashboardSummary.useQuery({ period: selectedPeriod, compareTo: compareTo });
    var alertsQuery = trpc_1.trpc.executiveDashboard.getAlerts.useQuery({});
    var briefingQuery = trpc_1.trpc.executiveDashboard.getExecutiveBriefing.useQuery({});
    var insightsQuery = trpc_1.trpc.executiveDashboard.getStrategicInsights.useQuery({});
    var widgetsQuery = trpc_1.trpc.executiveDashboard.getDashboardWidgets.useQuery({});
    var exportQuery = trpc_1.trpc.executiveDashboard.exportDashboard.useMutation();
    var handleRefresh = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setRefreshing(true);
                    return [4 /*yield*/, Promise.all([
                            summaryQuery.refetch(),
                            alertsQuery.refetch(),
                            briefingQuery.refetch(),
                            insightsQuery.refetch(),
                        ])];
                case 1:
                    _a.sent();
                    setRefreshing(false);
                    return [2 /*return*/];
            }
        });
    }); };
    var handleExport = function () { return __awaiter(_this, void 0, void 0, function () {
        var result, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, exportQuery.mutateAsync({
                            format: exportFormat,
                            period: selectedPeriod,
                            includeCharts: true,
                            includeAlerts: true,
                            includeInsights: true
                        })];
                case 1:
                    result = _a.sent();
                    sonner_1.toast.success("Dashboard exported as " + exportFormat.toUpperCase());
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    sonner_1.toast.error('Export failed');
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); };
    if (summaryQuery.isLoading) {
        return (react_1["default"].createElement("div", { className: "flex items-center justify-center h-screen" },
            react_1["default"].createElement("div", { className: "text-gray-600" }, "Loading executive dashboard...")));
    }
    var summary = (_a = summaryQuery.data) === null || _a === void 0 ? void 0 : _a.summary;
    var alerts = ((_b = alertsQuery.data) === null || _b === void 0 ? void 0 : _b.alerts) || [];
    return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: "Executive Dashboard", icon: react_1["default"].createElement(lucide_react_1.BarChart3, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/crm-home" }, { label: "Executive Dashboard" }] },
        react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg border border-gray-200 mb-6" },
            react_1["default"].createElement("div", { className: "flex justify-between items-start mb-4" },
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("p", { className: "text-gray-600 mt-1" }, "Strategic overview and decision support")),
                react_1["default"].createElement("div", { className: "flex gap-2" },
                    react_1["default"].createElement("button", { onClick: handleRefresh, disabled: refreshing, className: "flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50" },
                        react_1["default"].createElement(lucide_react_1.RefreshCw, { className: "w-4 h-4 " + (refreshing ? 'animate-spin' : '') }),
                        "Refresh"),
                    react_1["default"].createElement("button", { onClick: handleExport, className: "flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors" },
                        react_1["default"].createElement(lucide_react_1.Download, { className: "w-4 h-4" }),
                        "Export"))),
            react_1["default"].createElement("div", { className: "flex flex-wrap gap-4 pt-4 border-t border-gray-200" },
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 mb-2" }, "Time Period"),
                    react_1["default"].createElement("select", { value: selectedPeriod, onChange: function (e) { return setSelectedPeriod(e.target.value); }, className: "px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 hover:border-gray-400 focus:outline-none focus:border-blue-500" },
                        react_1["default"].createElement("option", { value: "today" }, "Today"),
                        react_1["default"].createElement("option", { value: "week" }, "This Week"),
                        react_1["default"].createElement("option", { value: "month" }, "This Month"),
                        react_1["default"].createElement("option", { value: "quarter" }, "This Quarter"),
                        react_1["default"].createElement("option", { value: "year" }, "This Year"))),
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 mb-2" }, "Compare To"),
                    react_1["default"].createElement("select", { value: compareTo, onChange: function (e) { return setCompareTo(e.target.value); }, className: "px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 hover:border-gray-400 focus:outline-none focus:border-blue-500" },
                        react_1["default"].createElement("option", { value: "previous" }, "Previous Period"),
                        react_1["default"].createElement("option", { value: "lastYear" }, "Last Year"),
                        react_1["default"].createElement("option", { value: "yearToDate" }, "Year to Date"))),
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("label", { className: "block text-sm font-medium text-gray-700 mb-2" }, "Export Format"),
                    react_1["default"].createElement("select", { value: exportFormat, onChange: function (e) { return setExportFormat(e.target.value); }, className: "px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 hover:border-gray-400 focus:outline-none focus:border-blue-500" },
                        react_1["default"].createElement("option", { value: "pdf" }, "PDF"),
                        react_1["default"].createElement("option", { value: "excel" }, "Excel"),
                        react_1["default"].createElement("option", { value: "csv" }, "CSV"))),
                react_1["default"].createElement("div", { className: "text-sm text-gray-600 pt-8 text-xs" },
                    "Last updated: ",
                    new Date().toLocaleTimeString()))),
        react_1["default"].createElement("div", { className: "flex gap-4 mb-6 border-b border-gray-200" }, ['overview', 'briefing', 'insights', 'customize'].map(function (tab) { return (react_1["default"].createElement("button", { key: tab, onClick: function () { return setActiveTab(tab); }, className: "px-4 py-2 font-medium border-b-2 transition-colors " + (activeTab === tab
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900') },
            tab === 'overview' && 'Overview',
            tab === 'briefing' && 'Executive Briefing',
            tab === 'insights' && 'Strategic Insights',
            tab === 'customize' && 'Customize')); })),
        activeTab === 'overview' && (react_1["default"].createElement("div", { className: "space-y-6" },
            react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4" }, summary === null || summary === void 0 ? void 0 : summary.topMetrics.map(function (metric) { return (react_1["default"].createElement(MetricCard, { key: metric.title, title: metric.title, value: metric.value, currency: metric.currency, unit: metric.unit || '', change: metric.change, target: metric.target, status: metric.status })); })),
            react_1["default"].createElement("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6" },
                react_1["default"].createElement("div", { className: "lg:col-span-2 bg-white p-6 rounded-lg border border-gray-200" },
                    react_1["default"].createElement("h2", { className: "text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2" },
                        react_1["default"].createElement(lucide_react_1.AlertTriangle, { className: "w-5 h-5 text-red-600" }),
                        "Critical Alerts"),
                    react_1["default"].createElement("div", { className: "space-y-3" }, alerts.slice(0, 3).map(function (alert) { return (react_1["default"].createElement(AlertItem, { key: alert.id, alert: alert })); }))),
                react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg border border-gray-200" },
                    react_1["default"].createElement("h3", { className: "text-lg font-semibold text-gray-900 mb-4" }, "Alert Summary"),
                    react_1["default"].createElement("div", { className: "space-y-3" },
                        react_1["default"].createElement("div", { className: "flex justify-between items-center" },
                            react_1["default"].createElement("span", { className: "text-sm text-gray-600" }, "Critical"),
                            react_1["default"].createElement("span", { className: "font-bold text-red-600" }, (_c = alertsQuery.data) === null || _c === void 0 ? void 0 : _c.summary.critical)),
                        react_1["default"].createElement("div", { className: "flex justify-between items-center" },
                            react_1["default"].createElement("span", { className: "text-sm text-gray-600" }, "Warning"),
                            react_1["default"].createElement("span", { className: "font-bold text-yellow-600" }, (_d = alertsQuery.data) === null || _d === void 0 ? void 0 : _d.summary.warning)),
                        react_1["default"].createElement("div", { className: "flex justify-between items-center" },
                            react_1["default"].createElement("span", { className: "text-sm text-gray-600" }, "Info"),
                            react_1["default"].createElement("span", { className: "font-bold text-blue-600" }, (_e = alertsQuery.data) === null || _e === void 0 ? void 0 : _e.summary.info))))),
            react_1["default"].createElement("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6" },
                react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg border border-gray-200" },
                    react_1["default"].createElement("h2", { className: "text-xl font-semibold text-gray-900 mb-4" }, "Department Performance"),
                    react_1["default"].createElement(DepartmentPerformance, { data: summary === null || summary === void 0 ? void 0 : summary.departmentOverview })),
                react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg border border-gray-200" },
                    react_1["default"].createElement("h2", { className: "text-xl font-semibold text-gray-900 mb-4" }, "Organization Health"),
                    react_1["default"].createElement("div", { className: "grid grid-cols-2 gap-4" }, Object.entries((summary === null || summary === void 0 ? void 0 : summary.heatMap) || {}).map(function (_a) {
                        var category = _a[0], health = _a[1];
                        var bgColor = health === 'healthy' ? 'bg-green-100' : health === 'warning' ? 'bg-yellow-100' : 'bg-red-100';
                        var textColor = health === 'healthy' ? 'text-green-900' : health === 'warning' ? 'text-yellow-900' : 'text-red-900';
                        return (react_1["default"].createElement("div", { key: category, className: bgColor + " p-4 rounded-lg text-center" },
                            react_1["default"].createElement("div", { className: "text-sm font-medium text-gray-700 capitalize mb-2" }, category),
                            react_1["default"].createElement("div", { className: "text-lg font-bold " + textColor + " capitalize" }, health === 'healthy' ? '✓ Healthy' : health === 'warning' ? '⚠ Warning' : '✗ Critical')));
                    })))))),
        activeTab === 'briefing' && briefingQuery.data && (react_1["default"].createElement("div", { className: "space-y-6" },
            react_1["default"].createElement("div", { className: "bg-white p-8 rounded-lg border border-gray-200" },
                react_1["default"].createElement("div", { className: "flex justify-between items-start mb-6" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("h2", { className: "text-2xl font-bold text-gray-900" }, briefingQuery.data.title),
                        react_1["default"].createElement("p", { className: "text-gray-600 mt-1" },
                            "Generated ",
                            new Date(briefingQuery.data.generatedAt).toLocaleDateString()))),
                react_1["default"].createElement("div", { className: "space-y-8" }, briefingQuery.data.sections.map(function (section, idx) {
                    var iconColor = section.status === 'positive' ? 'text-green-600' : section.status === 'warning' ? 'text-yellow-600' : section.status === 'action' ? 'text-blue-600' : 'text-gray-600';
                    return (react_1["default"].createElement("div", { key: idx, className: "border-b border-gray-200 pb-6 last:border-b-0" },
                        react_1["default"].createElement("h3", { className: "text-lg font-semibold mb-3 flex items-center gap-2 " + iconColor },
                            section.status === 'positive' && '✓',
                            section.status === 'warning' && '⚠',
                            section.status === 'action' && '→',
                            section.title),
                        react_1["default"].createElement("ul", { className: "space-y-2" }, section.highlights.map(function (highlight, i) { return (react_1["default"].createElement("li", { key: i, className: "text-gray-700 flex items-start gap-2" },
                            react_1["default"].createElement("span", { className: "text-blue-600 mt-1" }, "\u2022"),
                            highlight)); }))));
                }))))),
        activeTab === 'insights' && insightsQuery.data && (react_1["default"].createElement("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6" }, insightsQuery.data.insights.map(function (insight, idx) {
            var bgColor = insight.priority === 'high' ? 'border-red-200 bg-red-50' : 'border-orange-200 bg-orange-50';
            return (react_1["default"].createElement("div", { key: idx, className: "border-l-4 " + bgColor + " p-6 rounded-lg" },
                react_1["default"].createElement("h3", { className: "text-lg font-semibold text-gray-900 mb-3" }, insight.category),
                react_1["default"].createElement("ul", { className: "space-y-2" }, insight.items.map(function (item, i) { return (react_1["default"].createElement("li", { key: i, className: "text-gray-700 text-sm flex items-start gap-2" },
                    react_1["default"].createElement("span", { className: "text-blue-600 mt-1" }, "\u2192"),
                    item)); }))));
        }))),
        activeTab === 'customize' && widgetsQuery.data && (react_1["default"].createElement("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6" },
            react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg border border-gray-200" },
                react_1["default"].createElement("h2", { className: "text-xl font-semibold text-gray-900 mb-4" }, "Active Widgets"),
                react_1["default"].createElement("div", { className: "space-y-2" }, widgetsQuery.data.widgets
                    .filter(function (w) { return w.enabled; })
                    .map(function (widget) { return (react_1["default"].createElement("div", { key: widget.id, className: "flex justify-between items-center p-2 bg-gray-50 rounded" },
                    react_1["default"].createElement("span", { className: "font-medium text-gray-900" }, widget.title),
                    react_1["default"].createElement("span", { className: "text-xs text-gray-600" }, widget.type))); }))),
            react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg border border-gray-200" },
                react_1["default"].createElement("h2", { className: "text-xl font-semibold text-gray-900 mb-4" }, "Available Widgets"),
                react_1["default"].createElement("div", { className: "space-y-2" }, widgetsQuery.data.availableWidgets.map(function (widget) { return (react_1["default"].createElement("button", { key: widget.id, className: "w-full text-left p-2 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors" },
                    react_1["default"].createElement("div", { className: "font-medium text-blue-900" }, widget.title),
                    react_1["default"].createElement("div", { className: "text-xs text-blue-700" }, widget.type))); })))))));
}
exports["default"] = ExecutiveDashboardPage;
