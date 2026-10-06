"use strict";
exports.__esModule = true;
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var ModuleLayout_1 = require("@/components/ModuleLayout");
function FeatureFlags() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
    var flags = trpc_1.trpc.mobileApp.getMobileFeatureFlags.useQuery({});
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Feature Flags", icon: React.createElement(lucide_react_1.Flag, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/crm-home" }, { label: "System" }, { label: "Feature Flags" }] }, flags.isLoading ? (React.createElement("div", { className: "flex items-center justify-center py-20" },
        React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin text-blue-600" }))) : flags.error ? (React.createElement("div", { className: "bg-red-50 text-red-700 p-4 rounded-lg" }, "Failed to load feature flags")) : (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" },
            React.createElement("div", { className: "text-center bg-white p-4 rounded-lg shadow" },
                React.createElement("div", { className: "text-3xl font-bold text-blue-600" }, Object.keys((_b = (_a = flags.data) === null || _a === void 0 ? void 0 : _a.flags) !== null && _b !== void 0 ? _b : {}).length),
                React.createElement("div", { className: "text-sm text-gray-600" }, "Total Flags")),
            React.createElement("div", { className: "text-center bg-white p-4 rounded-lg shadow" },
                React.createElement("div", { className: "text-3xl font-bold text-green-600" }, Object.values((_d = (_c = flags.data) === null || _c === void 0 ? void 0 : _c.flags) !== null && _d !== void 0 ? _d : {}).filter(Boolean).length),
                React.createElement("div", { className: "text-sm text-gray-600" }, "Enabled")),
            React.createElement("div", { className: "text-center bg-white p-4 rounded-lg shadow" },
                React.createElement("div", { className: "text-3xl font-bold text-gray-600" }, Object.values((_f = (_e = flags.data) === null || _e === void 0 ? void 0 : _e.flags) !== null && _f !== void 0 ? _f : {}).filter(function (v) { return !v; }).length),
                React.createElement("div", { className: "text-sm text-gray-600" }, "Disabled")),
            React.createElement("div", { className: "text-center bg-white p-4 rounded-lg shadow" },
                React.createElement("div", { className: "text-3xl font-bold text-purple-600" }, (_j = (_h = (_g = flags.data) === null || _g === void 0 ? void 0 : _g.abTests) === null || _h === void 0 ? void 0 : _h.length) !== null && _j !== void 0 ? _j : 0),
                React.createElement("div", { className: "text-sm text-gray-600" }, "A/B Tests"))),
        React.createElement("div", { className: "space-y-3" },
            Object.entries((_l = (_k = flags.data) === null || _k === void 0 ? void 0 : _k.flags) !== null && _l !== void 0 ? _l : {}).map(function (_a) {
                var name = _a[0], enabled = _a[1];
                return (React.createElement("div", { key: name, className: "bg-white p-4 rounded-lg shadow" },
                    React.createElement("div", { className: "flex items-center justify-between" },
                        React.createElement("div", null,
                            React.createElement("h3", { className: "font-semibold text-lg" }, name.replace(/_/g, " ").replace(/\b\w/g, function (c) { return c.toUpperCase(); })),
                            React.createElement("p", { className: "text-sm text-gray-600" },
                                "Flag: ",
                                name)),
                        enabled ? (React.createElement(lucide_react_1.ToggleRight, { className: "w-6 h-6 text-green-600" })) : (React.createElement(lucide_react_1.ToggleLeft, { className: "w-6 h-6 text-gray-400" })))));
            }),
            Object.keys((_o = (_m = flags.data) === null || _m === void 0 ? void 0 : _m.flags) !== null && _o !== void 0 ? _o : {}).length === 0 && (React.createElement("p", { className: "text-center text-gray-500 py-8" }, "No feature flags configured"))),
        ((_r = (_q = (_p = flags.data) === null || _p === void 0 ? void 0 : _p.abTests) === null || _q === void 0 ? void 0 : _q.length) !== null && _r !== void 0 ? _r : 0) > 0 && (React.createElement("div", { className: "bg-white p-6 rounded-lg shadow" },
            React.createElement("h2", { className: "text-xl font-semibold mb-4" }, "A/B Tests"),
            React.createElement("div", { className: "space-y-2" }, flags.data.abTests.map(function (test, idx) { return (React.createElement("div", { key: idx, className: "flex items-center justify-between p-3 bg-slate-50 rounded-lg" },
                React.createElement("div", null,
                    React.createElement("p", { className: "font-medium text-slate-900" }, test.name),
                    React.createElement("p", { className: "text-sm text-slate-600" },
                        "Cohort: ",
                        test.cohort)),
                React.createElement("span", { className: "px-2 py-1 rounded text-xs font-semibold " + (test.enabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700") }, test.enabled ? "Active" : "Inactive"))); }))))))));
}
exports["default"] = FeatureFlags;
