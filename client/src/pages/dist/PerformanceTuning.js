"use strict";
exports.__esModule = true;
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
function PerformanceTuning() {
    var _a = trpc_1.trpc.performanceOptimization.getPerformanceMetrics.useQuery({ timeRange: "24h" }), metrics = _a.data, ml = _a.isLoading;
    var _b = trpc_1.trpc.performanceOptimization.listOptimizations.useQuery({ limit: 20 }), optimizations = _b.data, ol = _b.isLoading;
    if (ml || ol)
        return React.createElement("div", { className: "flex items-center justify-center min-h-screen" },
            React.createElement(lucide_react_1.Loader2, { className: "w-8 h-8 animate-spin text-orange-600" }));
    var m = metrics ? JSON.parse(JSON.stringify(metrics)) : {};
    var opts = optimizations ? JSON.parse(JSON.stringify(optimizations)) : { configs: [], total: 0 };
    return (React.createElement("div", { className: "space-y-6 p-6 bg-gradient-to-br from-slate-50 to-orange-50 min-h-screen" },
        React.createElement("h1", { className: "text-3xl font-bold text-slate-900 flex items-center gap-2" },
            React.createElement(lucide_react_1.Zap, { size: 32 }),
            " Performance Tuning"),
        React.createElement("div", { className: "grid grid-cols-4 gap-4" }, [
            { title: "Avg Response Time", value: m.avgResponseTime != null ? m.avgResponseTime + "ms" : "—" },
            { title: "Error Rate", value: m.errorRate != null ? m.errorRate + "%" : "—" },
            { title: "CPU Usage", value: m.cpu != null ? m.cpu + "%" : "—" },
            { title: "Cache Hit Rate", value: m.cacheHitRate != null ? m.cacheHitRate + "%" : "—" },
        ].map(function (stat, idx) { return (React.createElement("div", { key: idx, className: "bg-white p-4 rounded-lg shadow border-l-4 border-orange-500" },
            React.createElement("p", { className: "text-sm text-slate-600" }, stat.title),
            React.createElement("p", { className: "text-2xl font-bold text-slate-900" }, stat.value))); })),
        React.createElement("div", { className: "bg-white p-6 rounded-lg shadow" },
            React.createElement("h2", { className: "text-lg font-semibold text-slate-900 mb-4" },
                "Optimization Configurations (",
                opts.total,
                ")"),
            opts.configs.length === 0 ? (React.createElement("p", { className: "text-slate-500 text-center py-8" }, "No optimization configurations found.")) : (React.createElement("div", { className: "space-y-3" }, opts.configs.map(function (cfg, idx) {
                var _a, _b, _c, _d, _e;
                return (React.createElement("div", { key: (_a = cfg.id) !== null && _a !== void 0 ? _a : idx, className: "p-4 bg-slate-50 rounded-lg border border-slate-200" },
                    React.createElement("p", { className: "font-medium text-slate-900" }, (_c = (_b = cfg.name) !== null && _b !== void 0 ? _b : cfg.type) !== null && _c !== void 0 ? _c : "Configuration"),
                    React.createElement("div", { className: "flex justify-between mt-2 text-sm text-slate-600" },
                        React.createElement("span", null,
                            "Type: ", (_d = cfg.type) !== null && _d !== void 0 ? _d : "—"),
                        React.createElement("span", { className: "text-green-600" },
                            "Status: ", (_e = cfg.status) !== null && _e !== void 0 ? _e : "active"))));
            }))))));
}
exports["default"] = PerformanceTuning;
