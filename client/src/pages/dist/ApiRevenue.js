"use strict";
exports.__esModule = true;
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var currency_1 = require("@/lib/currency");
var ModuleLayout_1 = require("@/components/ModuleLayout");
function ApiRevenue() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    var formatMoney = currency_1.useCurrency().format;
    var dashboard = trpc_1.trpc.apiMonetization.getMonetizationDashboard.useQuery({});
    var apis = trpc_1.trpc.apiMonetization.listApiMarketplace.useQuery({ limit: 20 });
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "API Revenue Dashboard", icon: React.createElement(lucide_react_1.TrendingUp, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/crm-home" }, { label: "API" }, { label: "Revenue" }] }, dashboard.isLoading ? (React.createElement("div", { className: "flex items-center justify-center py-20" },
        React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin text-green-600" }))) : dashboard.error ? (React.createElement("div", { className: "bg-red-50 text-red-700 p-4 rounded-lg" }, "Failed to load revenue data")) : (React.createElement(React.Fragment, null,
        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" }, [
            { title: "Total Revenue", value: formatMoney((_b = (_a = dashboard.data) === null || _a === void 0 ? void 0 : _a.totalRevenue) !== null && _b !== void 0 ? _b : 0) },
            { title: "Active APIs", value: String((_d = (_c = dashboard.data) === null || _c === void 0 ? void 0 : _c.activeApis) !== null && _d !== void 0 ? _d : 0) },
            { title: "Total Subscribers", value: String((_f = (_e = dashboard.data) === null || _e === void 0 ? void 0 : _e.totalSubscribers) !== null && _f !== void 0 ? _f : 0) },
            { title: "Avg Revenue/API", value: formatMoney(((_g = dashboard.data) === null || _g === void 0 ? void 0 : _g.activeApis) ? (dashboard.data.totalRevenue / dashboard.data.activeApis) : 0) },
        ].map(function (stat, idx) { return (React.createElement("div", { key: idx, className: "bg-white p-4 rounded-lg shadow border-l-4 border-green-500" },
            React.createElement("p", { className: "text-sm text-slate-600" }, stat.title),
            React.createElement("p", { className: "text-2xl font-bold text-slate-900" }, stat.value))); })),
        ((_k = (_j = (_h = apis.data) === null || _h === void 0 ? void 0 : _h.apis) === null || _j === void 0 ? void 0 : _j.length) !== null && _k !== void 0 ? _k : 0) > 0 && (React.createElement("div", { className: "bg-white p-6 rounded-lg shadow" },
            React.createElement("h2", { className: "text-lg font-semibold text-slate-900 mb-4" }, "API Marketplace"),
            React.createElement("div", { className: "space-y-2" }, apis.data.apis.map(function (api) { return (React.createElement("div", { key: api.id, className: "flex items-center justify-between p-3 bg-slate-50 rounded-lg" },
                React.createElement("div", null,
                    React.createElement("p", { className: "font-medium text-slate-900" }, api.name),
                    React.createElement("p", { className: "text-sm text-slate-600" }, api.category || "General")),
                React.createElement("span", { className: "px-2 py-1 rounded text-xs font-semibold " + (api.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700") }, api.status))); }))))))));
}
exports["default"] = ApiRevenue;
