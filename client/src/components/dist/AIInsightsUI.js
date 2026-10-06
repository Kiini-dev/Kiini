"use strict";
exports.__esModule = true;
exports.AIInsightsUI = void 0;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var recharts_1 = require("recharts");
/**
 * AI Insights & Analytics Dashboard
 * Machine learning predictions, anomaly detection, business intelligence
 */
function AIInsightsUI() {
    var _a = react_1.useState('30d'), timeRange = _a[0], setTimeRange = _a[1];
    // Revenue trend data
    var revenueData = [
        { date: 'Mar 1', revenue: 45000, target: 50000 },
        { date: 'Mar 8', revenue: 52000, target: 50000 },
        { date: 'Mar 15', revenue: 48000, target: 50000 },
        { date: 'Mar 22', revenue: 61000, target: 50000 },
        { date: 'Mar 24', revenue: 58000, target: 50000 },
    ];
    // Subscription distribution
    var subscriptionData = [
        { name: 'Professional', value: 35, fill: '#3b82f6' },
        { name: 'Growth', value: 28, fill: '#8b5cf6' },
        { name: 'Starter', value: 22, fill: '#ec4899' },
        { name: 'Enterprise', value: 15, fill: '#f59e0b' },
    ];
    // Top insights
    var insights = [
        {
            title: 'Projected Monthly Revenue',
            value: '$285,000',
            change: 12.5,
            status: 'positive',
            icon: react_1["default"].createElement(lucide_react_1.TrendingUp, { className: "text-green-500", size: 24 })
        },
        {
            title: 'Churn Risk (30 days)',
            value: '2.3%',
            change: -0.8,
            status: 'positive',
            icon: react_1["default"].createElement(lucide_react_1.AlertTriangle, { className: "text-yellow-500", size: 24 })
        },
        {
            title: 'Subscription Expansion',
            value: '+18 upgrades',
            change: 8.2,
            status: 'positive',
            icon: react_1["default"].createElement(lucide_react_1.Zap, { className: "text-blue-500", size: 24 })
        },
        {
            title: 'Payment Failures',
            value: '1.2%',
            change: 0.3,
            status: 'negative',
            icon: react_1["default"].createElement(lucide_react_1.AlertTriangle, { className: "text-red-500", size: 24 })
        },
    ];
    // Anomalies detected
    var anomalies = [
        {
            id: '1',
            title: 'Unusual Payment Pattern',
            description: '5 failed payment attempts from same organization in 2 hours',
            severity: 'high',
            timestamp: new Date('2026-03-24T14:30:00'),
            action: 'Investigate'
        },
        {
            id: '2',
            title: 'Storage Usage Spike',
            description: 'Organization "Acme Corp" used 250GB storage (15x normal)',
            severity: 'medium',
            timestamp: new Date('2026-03-24T12:15:00'),
            action: 'Review'
        },
        {
            id: '3',
            title: 'Trial-to-Paid Conversion Rate Drop',
            description: 'Conversion rate down 8% vs 30-day average',
            severity: 'medium',
            timestamp: new Date('2026-03-24T10:45:00'),
            action: 'Analyze'
        },
    ];
    // Predictions
    var predictions = [
        {
            metric: 'Monthly Recurring Revenue (MRR)',
            current: 245000,
            predicted: 268000,
            confidence: 92,
            trend: 'up'
        },
        {
            metric: 'Customer Acquisition Cost (CAC)',
            current: 450,
            predicted: 435,
            confidence: 87,
            trend: 'down'
        },
        {
            metric: 'Churn Rate',
            current: 2.8,
            predicted: 2.5,
            confidence: 78,
            trend: 'down'
        },
    ];
    // Customer health scores
    var customerHealth = [
        { name: 'Healthy (30+ days left)', value: 68, color: '#10b981' },
        { name: 'At Risk (10-30 days)', value: 18, color: '#f59e0b' },
        { name: 'Critical (<10 days)', value: 8, color: '#ef4444' },
        { name: 'Churned', value: 6, color: '#6b7280' },
    ];
    var getSeverityColor = function (severity) {
        switch (severity) {
            case 'high':
                return 'bg-red-100 text-red-800 border-red-300';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'low':
                return 'bg-blue-100 text-blue-800 border-blue-300';
            default:
                return '';
        }
    };
    return (react_1["default"].createElement("div", { className: "h-full flex flex-col bg-gradient-to-br from-gray-50 to-gray-100" },
        react_1["default"].createElement("div", { className: "bg-white border-b p-6" },
            react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                react_1["default"].createElement("div", { className: "flex items-center gap-3" },
                    react_1["default"].createElement(lucide_react_1.Zap, { className: "text-blue-500", size: 32 }),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("h1", { className: "text-3xl font-bold text-gray-900" }, "AI Insights & Analytics"),
                        react_1["default"].createElement("p", { className: "text-gray-600" }, "ML-powered predictions, anomaly detection, and business intelligence"))),
                react_1["default"].createElement("div", { className: "flex gap-2" }, ['7d', '30d', '90d', '1y'].map(function (range) { return (react_1["default"].createElement("button", { key: range, onClick: function () { return setTimeRange(range); }, className: "px-3 py-1 rounded-lg text-sm font-semibold transition " + (timeRange === range ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300') }, range)); })))),
        react_1["default"].createElement("div", { className: "flex-1 overflow-y-auto p-6 space-y-6" },
            react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" }, insights.map(function (insight, idx) { return (react_1["default"].createElement("div", { key: idx, className: "bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition" },
                react_1["default"].createElement("div", { className: "flex items-center justify-between mb-4" },
                    insight.icon,
                    react_1["default"].createElement("span", { className: "text-sm font-semibold " + (insight.change > 0
                            ? 'text-green-600 bg-green-50'
                            : insight.change < 0
                                ? 'text-red-600 bg-red-50'
                                : 'text-gray-600 bg-gray-50') + " px-2 py-1 rounded" },
                        insight.change > 0 ? '+' : '',
                        insight.change,
                        "%")),
                react_1["default"].createElement("p", { className: "text-gray-600 text-sm mb-2" }, insight.title),
                react_1["default"].createElement("p", { className: "text-2xl font-bold text-gray-900" }, insight.value))); })),
            react_1["default"].createElement("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6" },
                react_1["default"].createElement("div", { className: "bg-white rounded-lg p-6 shadow-sm" },
                    react_1["default"].createElement("h2", { className: "text-lg font-bold text-gray-900 mb-4 flex items-center gap-2" },
                        react_1["default"].createElement(lucide_react_1.LineChart, { size: 20 }),
                        "Revenue Trend vs Target"),
                    react_1["default"].createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 250 },
                        react_1["default"].createElement(recharts_1.LineChart, { data: revenueData },
                            react_1["default"].createElement(recharts_1.CartesianGrid, { strokeDasharray: "3 3" }),
                            react_1["default"].createElement(recharts_1.XAxis, { dataKey: "date" }),
                            react_1["default"].createElement(recharts_1.YAxis, null),
                            react_1["default"].createElement(recharts_1.Tooltip, { formatter: function (value) { return "$" + value.toLocaleString(); } }),
                            react_1["default"].createElement(recharts_1.Legend, null),
                            react_1["default"].createElement(recharts_1.Line, { type: "monotone", dataKey: "revenue", stroke: "#3b82f6", name: "Actual Revenue", strokeWidth: 2 }),
                            react_1["default"].createElement(recharts_1.Line, { type: "monotone", dataKey: "target", stroke: "#10b981", name: "Target", strokeWidth: 2, strokeDasharray: "5 5" })))),
                react_1["default"].createElement("div", { className: "bg-white rounded-lg p-6 shadow-sm" },
                    react_1["default"].createElement("h2", { className: "text-lg font-bold text-gray-900 mb-4 flex items-center gap-2" },
                        react_1["default"].createElement(lucide_react_1.PieChart, { size: 20 }),
                        "Subscription Distribution"),
                    react_1["default"].createElement(recharts_1.ResponsiveContainer, { width: "100%", height: 250 },
                        react_1["default"].createElement(recharts_1.PieChart, null,
                            react_1["default"].createElement(recharts_1.Pie, { data: subscriptionData, cx: "50%", cy: "50%", labelLine: false, label: function (_a) {
                                    var name = _a.name, value = _a.value;
                                    return name + " " + value + "%";
                                }, outerRadius: 80, fill: "#8884d8", dataKey: "value" }, subscriptionData.map(function (entry, index) { return (react_1["default"].createElement(recharts_1.Cell, { key: "cell-" + index, fill: entry.fill })); })))))),
            react_1["default"].createElement("div", { className: "bg-white rounded-lg p-6 shadow-sm" },
                react_1["default"].createElement("h2", { className: "text-lg font-bold text-gray-900 mb-4 flex items-center gap-2" },
                    react_1["default"].createElement(lucide_react_1.Target, { size: 20 }),
                    "AI Predictions (Next 30 Days)"),
                react_1["default"].createElement("div", { className: "space-y-4" }, predictions.map(function (pred, idx) { return (react_1["default"].createElement("div", { key: idx, className: "border rounded-lg p-4" },
                    react_1["default"].createElement("div", { className: "flex items-center justify-between mb-2" },
                        react_1["default"].createElement("h3", { className: "font-semibold text-gray-900" }, pred.metric),
                        react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                            pred.trend === 'up' ? (react_1["default"].createElement(lucide_react_1.TrendingUp, { className: "text-green-500", size: 20 })) : (react_1["default"].createElement(lucide_react_1.TrendingUp, { className: "text-red-500 transform rotate-180", size: 20 })),
                            react_1["default"].createElement("span", { className: "text-sm font-bold text-gray-700" },
                                pred.confidence,
                                "% confidence"))),
                    react_1["default"].createElement("div", { className: "flex items-center justify-between text-sm" },
                        react_1["default"].createElement("span", null,
                            "Current: ",
                            react_1["default"].createElement("strong", null, pred.current.toLocaleString())),
                        react_1["default"].createElement("span", null, "\u2192"),
                        react_1["default"].createElement("span", null,
                            "Predicted: ",
                            react_1["default"].createElement("strong", { className: pred.trend === 'up' ? 'text-green-600' : 'text-red-600' }, pred.predicted.toLocaleString()))),
                    react_1["default"].createElement("div", { className: "mt-2 bg-gray-200 rounded-full h-2" },
                        react_1["default"].createElement("div", { className: "bg-blue-500 h-2 rounded-full", style: { width: pred.confidence + "%" } })))); }))),
            react_1["default"].createElement("div", { className: "bg-white rounded-lg p-6 shadow-sm" },
                react_1["default"].createElement("h2", { className: "text-lg font-bold text-gray-900 mb-4 flex items-center gap-2" },
                    react_1["default"].createElement(lucide_react_1.AlertTriangle, { size: 20, className: "text-yellow-500" }),
                    "Anomaly Alerts (",
                    anomalies.length,
                    ")"),
                react_1["default"].createElement("div", { className: "space-y-3" }, anomalies.map(function (alert) { return (react_1["default"].createElement("div", { key: alert.id, className: "border rounded-lg p-4 " + getSeverityColor(alert.severity) },
                    react_1["default"].createElement("div", { className: "flex items-start justify-between" },
                        react_1["default"].createElement("div", { className: "flex-1" },
                            react_1["default"].createElement("h3", { className: "font-semibold" }, alert.title),
                            react_1["default"].createElement("p", { className: "text-sm mt-1" }, alert.description),
                            react_1["default"].createElement("p", { className: "text-xs mt-2 opacity-75" }, alert.timestamp.toLocaleString())),
                        alert.action && (react_1["default"].createElement("button", { className: "px-3 py-1 bg-white/50 hover:bg-white/75 rounded font-semibold text-sm ml-4" }, alert.action))))); }))),
            react_1["default"].createElement("div", { className: "bg-white rounded-lg p-6 shadow-sm" },
                react_1["default"].createElement("h2", { className: "text-lg font-bold text-gray-900 mb-4" }, "Customer Health Distribution"),
                react_1["default"].createElement("div", { className: "grid grid-cols-4 gap-4" }, customerHealth.map(function (health, idx) { return (react_1["default"].createElement("div", { key: idx, className: "text-center" },
                    react_1["default"].createElement("div", { className: "h-24 rounded-lg flex items-center justify-center text-white font-bold mb-2", style: { backgroundColor: health.color } },
                        health.value,
                        "%"),
                    react_1["default"].createElement("p", { className: "text-sm text-gray-600" }, health.name))); }))))));
}
exports.AIInsightsUI = AIInsightsUI;
