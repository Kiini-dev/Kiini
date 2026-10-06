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
function ReportBuilder() {
    var _a = react_1.useState(['revenue', 'expenses']), selectedMetrics = _a[0], setSelectedMetrics = _a[1];
    var _b = react_1.useState('summary'), reportType = _b[0], setReportType = _b[1];
    var metrics = [
        { id: 'revenue', label: 'Revenue', value: '$142.5K' },
        { id: 'expenses', label: 'Expenses', value: '$45.3K' },
        { id: 'margin', label: 'Margin', value: '68.2%' },
        { id: 'growth', label: 'Growth Rate', value: '6.7%' },
        { id: 'roi', label: 'ROI', value: '312%' },
        { id: 'users', label: 'Active Users', value: '3,420' },
    ];
    var toggleMetric = function (metricId) {
        setSelectedMetrics(function (prev) {
            return prev.includes(metricId) ? prev.filter(function (m) { return m !== metricId; }) : __spreadArrays(prev, [metricId]);
        });
    };
    return (react_1["default"].createElement("div", { className: "space-y-6" },
        react_1["default"].createElement("div", { className: "flex justify-between items-center" },
            react_1["default"].createElement("h1", { className: "text-3xl font-bold tracking-tight" }, "Report Builder"),
            react_1["default"].createElement("button", { className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" }, "Generate Report")),
        react_1["default"].createElement("div", { className: "grid grid-cols-2 gap-6" },
            react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg shadow" },
                react_1["default"].createElement("h2", { className: "text-xl font-semibold mb-4" }, "Report Configuration"),
                react_1["default"].createElement("div", { className: "space-y-4" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("label", { className: "block text-sm font-medium mb-2" }, "Report Type"),
                        react_1["default"].createElement("select", { value: reportType, onChange: function (e) { return setReportType(e.target.value); }, className: "w-full px-3 py-2 border rounded-lg" },
                            react_1["default"].createElement("option", { value: "summary" }, "Summary"),
                            react_1["default"].createElement("option", { value: "detailed" }, "Detailed"),
                            react_1["default"].createElement("option", { value: "comparative" }, "Comparative"),
                            react_1["default"].createElement("option", { value: "forecasting" }, "Forecasting"))),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("label", { className: "block text-sm font-medium mb-2" }, "Export Format"),
                        react_1["default"].createElement("select", { className: "w-full px-3 py-2 border rounded-lg" },
                            react_1["default"].createElement("option", { value: "pdf" }, "PDF"),
                            react_1["default"].createElement("option", { value: "excel" }, "Excel"),
                            react_1["default"].createElement("option", { value: "csv" }, "CSV"),
                            react_1["default"].createElement("option", { value: "json" }, "JSON"))),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("label", { className: "block text-sm font-medium mb-2" }, "Schedule"),
                        react_1["default"].createElement("select", { className: "w-full px-3 py-2 border rounded-lg" },
                            react_1["default"].createElement("option", { value: "none" }, "Once"),
                            react_1["default"].createElement("option", { value: "daily" }, "Daily"),
                            react_1["default"].createElement("option", { value: "weekly" }, "Weekly"),
                            react_1["default"].createElement("option", { value: "monthly" }, "Monthly"))))),
            react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg shadow" },
                react_1["default"].createElement("h2", { className: "text-xl font-semibold mb-4" }, "Select Metrics"),
                react_1["default"].createElement("div", { className: "grid grid-cols-2 gap-3" }, metrics.map(function (metric) { return (react_1["default"].createElement("label", { key: metric.id, className: "flex items-center space-x-2 p-2 border rounded" },
                    react_1["default"].createElement("input", { type: "checkbox", checked: selectedMetrics.includes(metric.id), onChange: function () { return toggleMetric(metric.id); }, className: "rounded" }),
                    react_1["default"].createElement("span", { className: "text-sm" }, metric.label))); })))),
        react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg shadow" },
            react_1["default"].createElement("h2", { className: "text-xl font-semibold mb-4" }, "Recent Reports"),
            react_1["default"].createElement("div", { className: "space-y-3" }, [
                { name: 'Q1 Performance Review', date: '2026-03-15', format: 'PDF', pages: 24 },
                { name: 'Monthly Revenue Report', date: '2026-03-14', format: 'Excel', pages: 12 },
                { name: 'Anomaly Analysis', date: '2026-03-13', format: 'PDF', pages: 8 },
            ].map(function (report, i) { return (react_1["default"].createElement("div", { key: i, className: "flex justify-between items-center p-3 border rounded" },
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("div", { className: "font-medium" }, report.name),
                    react_1["default"].createElement("div", { className: "text-xs text-gray-500" },
                        report.date,
                        " \u2022 ",
                        report.format,
                        " \u2022 ",
                        report.pages,
                        " pages")),
                react_1["default"].createElement("button", { className: "text-blue-600 hover:text-blue-800" }, "Download"))); })))));
}
exports["default"] = ReportBuilder;
