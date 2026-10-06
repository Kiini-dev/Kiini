"use strict";
exports.__esModule = true;
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var ModuleLayout_1 = require("@/components/ModuleLayout");
function UsageMetering() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    var apis = trpc_1.trpc.apiMonetization.listApiMarketplace.useQuery({ limit: 50 });
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Usage Metering", icon: React.createElement(lucide_react_1.Gauge, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/crm-home" }, { label: "System" }, { label: "Usage Metering" }] }, apis.isLoading ? (React.createElement("div", { className: "flex items-center justify-center py-20" },
        React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin text-blue-600" }))) : apis.error ? (React.createElement("div", { className: "bg-red-50 text-red-700 p-4 rounded-lg" }, "Failed to load usage data")) : (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" }, [
            { title: "Total APIs", value: String((_b = (_a = apis.data) === null || _a === void 0 ? void 0 : _a.total) !== null && _b !== void 0 ? _b : 0) },
            { title: "Active", value: String(((_d = (_c = apis.data) === null || _c === void 0 ? void 0 : _c.apis) !== null && _d !== void 0 ? _d : []).filter(function (a) { return a.status === "active"; }).length) },
            { title: "Categories", value: String(new Set(((_f = (_e = apis.data) === null || _e === void 0 ? void 0 : _e.apis) !== null && _f !== void 0 ? _f : []).map(function (a) { return a.category; }).filter(Boolean)).size || 0) },
            { title: "Total Listed", value: String((_j = (_h = (_g = apis.data) === null || _g === void 0 ? void 0 : _g.apis) === null || _h === void 0 ? void 0 : _h.length) !== null && _j !== void 0 ? _j : 0) },
        ].map(function (stat, idx) { return (React.createElement("div", { key: idx, className: "bg-white p-4 rounded-lg shadow border-l-4 border-blue-500" },
            React.createElement("p", { className: "text-sm text-slate-600" }, stat.title),
            React.createElement("p", { className: "text-2xl font-bold text-slate-900" }, stat.value))); })),
        React.createElement("div", { className: "bg-white p-6 rounded-lg shadow" },
            React.createElement("h2", { className: "text-lg font-semibold text-slate-900 mb-4" }, "API Usage"),
            React.createElement("div", { className: "space-y-2" },
                ((_l = (_k = apis.data) === null || _k === void 0 ? void 0 : _k.apis) !== null && _l !== void 0 ? _l : []).map(function (api) { return (React.createElement("div", { key: api.id, className: "flex items-center justify-between p-3 bg-slate-50 rounded-lg" },
                    React.createElement("div", null,
                        React.createElement("p", { className: "font-medium text-slate-900" }, api.name),
                        React.createElement("p", { className: "text-sm text-slate-600" },
                            "Category: ",
                            api.category || "General")),
                    React.createElement("span", { className: "px-2 py-1 rounded text-xs font-semibold " + (api.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700") }, api.status))); }),
                ((_p = (_o = (_m = apis.data) === null || _m === void 0 ? void 0 : _m.apis) === null || _o === void 0 ? void 0 : _o.length) !== null && _p !== void 0 ? _p : 0) === 0 && (React.createElement("p", { className: "text-center text-slate-500 py-8" }, "No API usage data available"))))))));
}
exports["default"] = UsageMetering;
