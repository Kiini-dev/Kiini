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
var lucide_react_1 = require("lucide-react");
function DashboardBuilder() {
    var _a = react_1.useState([
        {
            id: 1,
            name: 'Executive Overview',
            widgets: 8,
            views: 542,
            shared: true,
            lastModified: '2026-03-15'
        },
        {
            id: 2,
            name: 'Sales Performance',
            widgets: 6,
            views: 234,
            shared: true,
            lastModified: '2026-03-14'
        },
        {
            id: 3,
            name: 'Operational Metrics',
            widgets: 5,
            views: 156,
            shared: false,
            lastModified: '2026-03-13'
        },
    ]), dashboards = _a[0], setDashboards = _a[1];
    var _b = react_1.useState(false), showNew = _b[0], setShowNew = _b[1];
    var _c = react_1.useState(''), newDashboard = _c[0], setNewDashboard = _c[1];
    var handleCreateDashboard = function () {
        if (newDashboard.trim()) {
            setDashboards(__spreadArrays(dashboards, [{
                    id: dashboards.length + 1,
                    name: newDashboard,
                    widgets: 0,
                    views: 0,
                    shared: false,
                    lastModified: new Date().toISOString().split('T')[0]
                }]));
            setNewDashboard('');
            setShowNew(false);
        }
    };
    var widgetTypes = [
        { name: 'Metric Card', icon: 'card', color: 'bg-blue-100' },
        { name: 'Line Chart', icon: 'chart', color: 'bg-green-100' },
        { name: 'Gauge', icon: 'gauge', color: 'bg-purple-100' },
        { name: 'Table', icon: 'table', color: 'bg-orange-100' },
        { name: 'Heatmap', icon: 'heatmap', color: 'bg-red-100' },
    ];
    return (react_1["default"].createElement("div", { className: "space-y-6" },
        react_1["default"].createElement("div", { className: "flex justify-between items-center" },
            react_1["default"].createElement("h1", { className: "text-3xl font-bold tracking-tight" }, "Dashboard Builder"),
            react_1["default"].createElement("button", { onClick: function () { return setShowNew(true); }, className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" }, "+ Create Dashboard")),
        showNew && (react_1["default"].createElement("div", { className: "bg-blue-50 p-4 rounded-lg border border-blue-200" },
            react_1["default"].createElement("div", { className: "flex gap-2" },
                react_1["default"].createElement("input", { type: "text", value: newDashboard, onChange: function (e) { return setNewDashboard(e.target.value); }, placeholder: "Dashboard name...", className: "flex-1 px-3 py-2 border rounded-lg", onKeyDown: function (e) { return e.key === 'Enter' && handleCreateDashboard(); } }),
                react_1["default"].createElement("button", { onClick: handleCreateDashboard, className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" }, "Create"),
                react_1["default"].createElement("button", { onClick: function () { return setShowNew(false); }, className: "px-4 py-2 border rounded-lg hover:bg-gray-100" }, "Cancel")))),
        react_1["default"].createElement("div", { className: "grid grid-cols-3 gap-4" }, dashboards.map(function (dashboard) { return (react_1["default"].createElement("div", { key: dashboard.id, className: "bg-white p-4 rounded-lg shadow hover:shadow-lg transition" },
            react_1["default"].createElement("div", { className: "flex justify-between items-start mb-3" },
                react_1["default"].createElement("h3", { className: "font-semibold" }, dashboard.name),
                dashboard.shared && (react_1["default"].createElement("span", { className: "text-xs bg-green-100 text-green-800 px-2 py-1 rounded" }, "Shared"))),
            react_1["default"].createElement("div", { className: "space-y-2 mb-4" },
                react_1["default"].createElement("div", { className: "flex justify-between text-sm" },
                    react_1["default"].createElement("span", { className: "text-gray-600" }, "Widgets:"),
                    react_1["default"].createElement("span", { className: "font-medium" }, dashboard.widgets)),
                react_1["default"].createElement("div", { className: "flex justify-between text-sm" },
                    react_1["default"].createElement("span", { className: "text-gray-600" }, "Views:"),
                    react_1["default"].createElement("span", { className: "font-medium" }, dashboard.views)),
                react_1["default"].createElement("div", { className: "flex justify-between text-sm" },
                    react_1["default"].createElement("span", { className: "text-gray-600" }, "Modified:"),
                    react_1["default"].createElement("span", { className: "font-medium text-xs" }, dashboard.lastModified))),
            react_1["default"].createElement("button", { className: "w-full text-blue-600 hover:text-blue-800 text-sm font-medium py-2 border-t" }, "Edit Dashboard"))); })),
        react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg shadow" },
            react_1["default"].createElement("h2", { className: "text-xl font-semibold mb-4" }, "Available Widgets"),
            react_1["default"].createElement("div", { className: "grid grid-cols-5 gap-3" }, widgetTypes.map(function (widget) { return (react_1["default"].createElement("div", { key: widget.name, className: widget.color + " p-4 rounded-lg text-center cursor-pointer hover:shadow-md transition" },
                react_1["default"].createElement("div", { className: "text-2xl mb-2" }, "\uD83D\uDCE6"),
                react_1["default"].createElement("div", { className: "text-sm font-medium" }, widget.name),
                react_1["default"].createElement("div", { className: "text-xs text-gray-600 mt-1" }, "Click to add"))); }))),
        react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg shadow" },
            react_1["default"].createElement("h2", { className: "text-xl font-semibold mb-4" }, "Dashboard Statistics"),
            react_1["default"].createElement("div", { className: "grid grid-cols-3 gap-4" },
                react_1["default"].createElement("div", { className: "flex items-center space-x-3" },
                    react_1["default"].createElement("div", { className: "bg-blue-100 p-3 rounded-lg" },
                        react_1["default"].createElement(lucide_react_1.TrendingUp, { className: "w-6 h-6 text-blue-600" })),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("div", { className: "text-sm text-gray-600" }, "Total Dashboards"),
                        react_1["default"].createElement("div", { className: "text-2xl font-bold" }, dashboards.length))),
                react_1["default"].createElement("div", { className: "flex items-center space-x-3" },
                    react_1["default"].createElement("div", { className: "bg-green-100 p-3 rounded-lg" },
                        react_1["default"].createElement(lucide_react_1.Users, { className: "w-6 h-6 text-green-600" })),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("div", { className: "text-sm text-gray-600" }, "Total Views"),
                        react_1["default"].createElement("div", { className: "text-2xl font-bold" }, dashboards.reduce(function (sum, d) { return sum + d.views; }, 0)))),
                react_1["default"].createElement("div", { className: "flex items-center space-x-3" },
                    react_1["default"].createElement("div", { className: "bg-purple-100 p-3 rounded-lg" },
                        react_1["default"].createElement(lucide_react_1.Percent, { className: "w-6 h-6 text-purple-600" })),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("div", { className: "text-sm text-gray-600" }, "Avg Load Time"),
                        react_1["default"].createElement("div", { className: "text-2xl font-bold" }, "1.23s")))))));
}
exports["default"] = DashboardBuilder;
