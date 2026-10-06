"use strict";
exports.__esModule = true;
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var ModuleLayout_1 = require("@/components/ModuleLayout");
function RegionalCompliance() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    var configs = trpc_1.trpc.globalFeatures.listConfigs.useQuery({ configType: "regional_compliance", limit: 50 });
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Regional Compliance", icon: React.createElement(lucide_react_1.Globe, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/crm-home" }, { label: "Settings" }, { label: "Regional Compliance" }] }, configs.isLoading ? (React.createElement("div", { className: "flex items-center justify-center py-20" },
        React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin text-red-600" }))) : configs.error ? (React.createElement("div", { className: "bg-red-50 text-red-700 p-4 rounded-lg" }, "Failed to load regional compliance data")) : (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" },
            React.createElement("div", { className: "bg-white p-6 rounded-lg border-2 border-red-200 shadow-md" },
                React.createElement("p", { className: "text-gray-600 text-sm font-semibold" }, "Configurations"),
                React.createElement("p", { className: "text-3xl font-bold text-gray-900 mt-2" }, (_b = (_a = configs.data) === null || _a === void 0 ? void 0 : _a.total) !== null && _b !== void 0 ? _b : 0)),
            React.createElement("div", { className: "bg-white p-6 rounded-lg border-2 border-red-200 shadow-md" },
                React.createElement("p", { className: "text-gray-600 text-sm font-semibold" }, "Listed"),
                React.createElement("p", { className: "text-3xl font-bold text-gray-900 mt-2" }, (_e = (_d = (_c = configs.data) === null || _c === void 0 ? void 0 : _c.configs) === null || _d === void 0 ? void 0 : _d.length) !== null && _e !== void 0 ? _e : 0))),
        React.createElement("div", { className: "bg-white p-6 rounded-lg border-2 border-red-200 shadow-md" },
            React.createElement("h2", { className: "text-xl font-bold text-gray-900 mb-4" }, "Regional Configurations"),
            React.createElement("div", { className: "space-y-2" },
                ((_g = (_f = configs.data) === null || _f === void 0 ? void 0 : _f.configs) !== null && _g !== void 0 ? _g : []).map(function (cfg) {
                    var _a, _b, _c;
                    return (React.createElement("div", { key: cfg.id, className: "flex items-center justify-between p-3 bg-gray-50 rounded" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "font-semibold text-gray-900" }, (_a = cfg.configType) !== null && _a !== void 0 ? _a : "Regional"),
                            React.createElement("p", { className: "text-sm text-gray-600" }, (_c = (_b = cfg.config) === null || _b === void 0 ? void 0 : _b.region) !== null && _c !== void 0 ? _c : "—")),
                        React.createElement("span", { className: "px-3 py-1 rounded text-sm font-semibold bg-green-100 text-green-700" }, "Active")));
                }),
                ((_k = (_j = (_h = configs.data) === null || _h === void 0 ? void 0 : _h.configs) === null || _j === void 0 ? void 0 : _j.length) !== null && _k !== void 0 ? _k : 0) === 0 && (React.createElement("p", { className: "text-center text-gray-500 py-8" }, "No regional compliance configurations yet"))))))));
}
exports["default"] = RegionalCompliance;
