"use strict";
exports.__esModule = true;
exports.PerformanceChart = void 0;
var card_1 = require("@/components/ui/card");
var progress_1 = require("@/components/ui/progress");
var lucide_react_1 = require("lucide-react");
function PerformanceChart(_a) {
    var _b = _a.title, title = _b === void 0 ? "Performance Metrics" : _b, _c = _a.onTimeDeliveryRate, onTimeDeliveryRate = _c === void 0 ? 0 : _c, _d = _a.qualityScore, qualityScore = _d === void 0 ? 0 : _d, _e = _a.responsiveness, responsiveness = _e === void 0 ? 0 : _e, _f = _a.totalOrders, totalOrders = _f === void 0 ? 0 : _f, _g = _a.totalSpend, totalSpend = _g === void 0 ? 0 : _g;
    var metrics = [
        {
            label: "On-Time Delivery Rate",
            value: onTimeDeliveryRate,
            max: 100,
            format: function (v) { return v.toFixed(1) + "%"; },
            color: "bg-green-500"
        },
        {
            label: "Quality Score",
            value: qualityScore,
            max: 5,
            format: function (v) { return v.toFixed(1) + " / 5"; },
            color: "bg-blue-500"
        },
        {
            label: "Responsiveness",
            value: responsiveness,
            max: 5,
            format: function (v) { return v.toFixed(1) + " / 5"; },
            color: "bg-purple-500"
        },
    ];
    var summary = [
        {
            label: "Total Orders",
            value: totalOrders,
            icon: "📦"
        },
        {
            label: "Total Spend",
            value: totalSpend,
            format: function (v) { return "$" + (v / 100).toFixed(2); },
            icon: "💰"
        },
    ];
    return (React.createElement(card_1.Card, null,
        React.createElement(card_1.CardHeader, null,
            React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                React.createElement(lucide_react_1.TrendingUp, { className: "w-5 h-5" }),
                title)),
        React.createElement(card_1.CardContent, { className: "space-y-8" },
            React.createElement("div", { className: "space-y-6" }, metrics.map(function (metric) { return (React.createElement("div", { key: metric.label, className: "space-y-2" },
                React.createElement("div", { className: "flex justify-between items-center" },
                    React.createElement("label", { className: "text-sm font-medium text-gray-600" }, metric.label),
                    React.createElement("span", { className: "text-sm font-semibold text-gray-900" }, metric.format ? metric.format(metric.value) : metric.value)),
                React.createElement(progress_1.Progress, { value: metric.max ? (metric.value / metric.max) * 100 : 0, className: "h-2" }))); })),
            React.createElement("div", { className: "border-t pt-6" },
                React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" }, summary.map(function (stat) { return (React.createElement("div", { key: stat.label, className: "bg-gray-50 p-4 rounded-lg" },
                    React.createElement("p", { className: "text-2xl mb-2" }, stat.icon),
                    React.createElement("p", { className: "text-xs text-gray-600 mb-1" }, stat.label),
                    React.createElement("p", { className: "text-lg font-semibold text-gray-900" }, stat.format ? stat.format(stat.value) : stat.value))); }))))));
}
exports.PerformanceChart = PerformanceChart;
