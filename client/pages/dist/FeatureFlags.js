"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
function FeatureFlags() {
    var _a = react_1.useState([
        {
            id: 'new_dashboard',
            name: 'New Dashboard UI',
            description: 'Modernized dashboard with improved UX',
            enabled: true,
            abTest: { enabled: true, percentage: 50, group: 'A' },
            users: 1710,
            rolloutDate: '2026-03-01'
        },
        {
            id: 'simplified_ui',
            name: 'Simplified Navigation',
            description: 'Reduced menu complexity for new users',
            enabled: true,
            abTest: { enabled: true, percentage: 25, group: 'B' },
            users: 855,
            rolloutDate: '2026-03-05'
        },
        {
            id: 'offline_sync',
            name: 'Offline Sync Beta',
            description: 'Store data locally and sync when online',
            enabled: false,
            abTest: { enabled: false, percentage: 0, group: null },
            users: 0,
            rolloutDate: null
        },
        {
            id: 'ai_insights',
            name: 'AI-Powered Insights',
            description: 'Intelligent analytics recommendations',
            enabled: true,
            abTest: { enabled: false, percentage: 100, group: null },
            users: 3420,
            rolloutDate: '2026-02-15'
        },
    ]), features = _a[0], setFeatures = _a[1];
    var toggleFeature = function (id) {
        setFeatures(features.map(function (f) { return f.id === id ? __assign(__assign({}, f), { enabled: !f.enabled }) : f; }));
    };
    return (react_1["default"].createElement("div", { className: "space-y-6" },
        react_1["default"].createElement("div", { className: "flex justify-between items-center" },
            react_1["default"].createElement("h1", { className: "text-3xl font-bold tracking-tight" }, "Feature Flags"),
            react_1["default"].createElement("button", { className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" }, "+ New Flag")),
        react_1["default"].createElement("div", { className: "space-y-3" }, features.map(function (feature) { return (react_1["default"].createElement("div", { key: feature.id, className: "bg-white p-4 rounded-lg shadow" },
            react_1["default"].createElement("div", { className: "flex items-start justify-between mb-3" },
                react_1["default"].createElement("div", { className: "flex-1" },
                    react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                        react_1["default"].createElement("h3", { className: "font-semibold text-lg" }, feature.name),
                        feature.abTest.enabled && (react_1["default"].createElement("span", { className: "px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded" },
                            "A/B Test: ",
                            feature.abTest.percentage,
                            "%"))),
                    react_1["default"].createElement("p", { className: "text-sm text-gray-600 mt-1" }, feature.description)),
                react_1["default"].createElement("button", { onClick: function () { return toggleFeature(feature.id); }, className: "flex-shrink-0" }, feature.enabled ? (react_1["default"].createElement(lucide_react_1.ToggleRight, { className: "w-6 h-6 text-green-600" })) : (react_1["default"].createElement(lucide_react_1.ToggleLeft, { className: "w-6 h-6 text-gray-400" })))),
            react_1["default"].createElement("div", { className: "grid grid-cols-4 gap-4 text-sm" },
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("div", { className: "text-gray-600" }, "Status"),
                    react_1["default"].createElement("div", { className: "font-semibold" }, feature.enabled ? (react_1["default"].createElement("span", { className: "text-green-600" }, "\uD83D\uDFE2 Enabled")) : (react_1["default"].createElement("span", { className: "text-gray-400" }, "\u26AA Disabled")))),
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("div", { className: "text-gray-600" }, "Users"),
                    react_1["default"].createElement("div", { className: "font-semibold" }, feature.users.toLocaleString())),
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("div", { className: "text-gray-600" }, "Rollout Date"),
                    react_1["default"].createElement("div", { className: "font-semibold" }, feature.rolloutDate || '—')),
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("div", { className: "text-gray-600" }, "A/B Test"),
                    react_1["default"].createElement("div", { className: "font-semibold" }, feature.abTest.enabled ? "Group " + feature.abTest.group : 'None'))))); })),
        react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg shadow" },
            react_1["default"].createElement("h2", { className: "text-xl font-semibold mb-4" }, "Feature Flag Summary"),
            react_1["default"].createElement("div", { className: "grid grid-cols-4 gap-4" },
                react_1["default"].createElement("div", { className: "text-center" },
                    react_1["default"].createElement("div", { className: "text-3xl font-bold text-blue-600" }, features.length),
                    react_1["default"].createElement("div", { className: "text-sm text-gray-600" }, "Total Flags")),
                react_1["default"].createElement("div", { className: "text-center" },
                    react_1["default"].createElement("div", { className: "text-3xl font-bold text-green-600" }, features.filter(function (f) { return f.enabled; }).length),
                    react_1["default"].createElement("div", { className: "text-sm text-gray-600" }, "Active")),
                react_1["default"].createElement("div", { className: "text-center" },
                    react_1["default"].createElement("div", { className: "text-3xl font-bold text-purple-600" }, features.filter(function (f) { return f.abTest.enabled; }).length),
                    react_1["default"].createElement("div", { className: "text-sm text-gray-600" }, "A/B Testing")),
                react_1["default"].createElement("div", { className: "text-center" },
                    react_1["default"].createElement("div", { className: "text-3xl font-bold text-orange-600" }, features.reduce(function (sum, f) { return sum + f.users; }, 0).toLocaleString()),
                    react_1["default"].createElement("div", { className: "text-sm text-gray-600" }, "Affected Users"))))));
}
exports["default"] = FeatureFlags;
