"use strict";
exports.__esModule = true;
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
function QueryOptimization() {
    var _a = trpc_1.trpc.performanceOptimization.getPerformanceMetrics.useQuery({ timeRange: "24h" }), metrics = _a.data, ml = _a.isLoading;
    var _b = trpc_1.trpc.performanceOptimization.listOptimizations.useQuery({ limit: 50 }), optimizations = _b.data, ol = _b.isLoading;
    if (ml || ol)
        return React.createElement("div", { className: "flex items-center justify-center min-h-screen" },
            React.createElement(lucide_react_1.Loader2, { className: "w-8 h-8 animate-spin text-blue-600" }));
    var m = metrics ? JSON.parse(JSON.stringify(metrics)) : {};
    var opts = optimizations ? JSON.parse(JSON.stringify(optimizations)) : { configs: [], total: 0 };
    var queryConfigs = opts.configs.filter(function (c) { return c.type === "query" || c.category === "query"; });
    return (React.createElement("div", { className: "space-y-6 p-6 bg-gradient-to-br from-blue-50 to-cyan-50 min-h-screen" },
        React.createElement("div", { className: "flex items-center justify-between" },
            React.createElement("div", null,
                React.createElement("h1", { className: "text-4xl font-bold text-gray-900" }, "Query Optimization"),
                React.createElement("p", { className: "text-gray-600 mt-2" }, "Monitor and improve database query performance")),
            React.createElement(lucide_react_1.Activity, { className: "w-12 h-12 text-blue-600" })),
        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" }, [
            { label: "Avg Response Time", value: m.avgResponseTime != null ? m.avgResponseTime + "ms" : "—", icon: lucide_react_1.Zap },
            { label: "P95 Latency", value: m.p95 != null ? m.p95 + "ms" : "—", icon: lucide_react_1.Activity },
            { label: "Requests/sec", value: m.rps != null ? "" + m.rps : "—", icon: lucide_react_1.Database },
            { label: "Cache Hit Rate", value: m.cacheHitRate != null ? m.cacheHitRate + "%" : "—", icon: lucide_react_1.Activity },
        ].map(function (card, idx) { return (React.createElement("div", { key: idx, className: "bg-white p-6 rounded-lg border-2 border-blue-200 shadow-md hover:shadow-lg transition" },
            React.createElement("div", { className: "flex items-center justify-between" },
                React.createElement("div", null,
                    React.createElement("p", { className: "text-gray-600 text-sm font-semibold" }, card.label),
                    React.createElement("p", { className: "text-3xl font-bold text-gray-900 mt-2" }, card.value)),
                React.createElement(card.icon, { className: "w-10 h-10 text-blue-600 opacity-20" })))); })),
        React.createElement("div", { className: "bg-white p-6 rounded-lg border-2 border-blue-200 shadow-md" },
            React.createElement("h2", { className: "text-xl font-bold text-gray-900 mb-4" },
                "Query Optimization Configs (",
                queryConfigs.length || opts.total,
                ")"),
            (queryConfigs.length > 0 ? queryConfigs : opts.configs).length === 0 ? (React.createElement("p", { className: "text-gray-500 text-center py-8" }, "No query optimization configurations found.")) : (React.createElement("div", { className: "space-y-3" }, (queryConfigs.length > 0 ? queryConfigs : opts.configs).map(function (cfg, idx) {
                var _a, _b, _c, _d, _e, _f;
                return (React.createElement("div", { key: (_a = cfg.id) !== null && _a !== void 0 ? _a : idx, className: "flex items-center justify-between p-3 bg-gray-50 rounded border-l-4 border-blue-500" },
                    React.createElement("div", null,
                        React.createElement("p", { className: "font-semibold text-gray-900" }, (_c = (_b = cfg.name) !== null && _b !== void 0 ? _b : cfg.type) !== null && _c !== void 0 ? _c : "Optimization"),
                        React.createElement("p", { className: "text-sm text-gray-600" }, (_d = cfg.description) !== null && _d !== void 0 ? _d : "Type: " + ((_e = cfg.type) !== null && _e !== void 0 ? _e : "—"))),
                    React.createElement("span", { className: "px-3 py-1 rounded text-sm font-bold " + (cfg.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700") }, (_f = cfg.status) !== null && _f !== void 0 ? _f : "active")));
            }))))));
}
exports["default"] = QueryOptimization;
