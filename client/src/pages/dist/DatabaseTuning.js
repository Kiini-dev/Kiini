"use strict";
exports.__esModule = true;
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var ModuleLayout_1 = require("@/components/ModuleLayout");
function DatabaseTuning() {
    var _a = trpc_1.trpc.performanceOptimization.getPerformanceMetrics.useQuery({ timeRange: "24h" }), metrics = _a.data, ml = _a.isLoading;
    var _b = trpc_1.trpc.performanceOptimization.listOptimizations.useQuery({ limit: 50 }), optimizations = _b.data, ol = _b.isLoading;
    if (ml || ol)
        return React.createElement("div", { className: "flex items-center justify-center min-h-screen" },
            React.createElement(lucide_react_1.Loader2, { className: "w-8 h-8 animate-spin text-amber-600" }));
    var m = metrics ? JSON.parse(JSON.stringify(metrics)) : {};
    var opts = optimizations ? JSON.parse(JSON.stringify(optimizations)) : { configs: [], total: 0 };
    var dbConfigs = opts.configs.filter(function (c) { return c.type === "database" || c.category === "database"; });
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Database Tuning", icon: React.createElement(lucide_react_1.Zap, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/crm-home" }, { label: "System" }, { label: "Database Tuning" }] },
        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" }, [
            { label: "Memory Usage", value: m.memory != null ? m.memory + "%" : "—", icon: lucide_react_1.TrendingDown },
            { label: "P95 Latency", value: m.p95 != null ? m.p95 + "ms" : "—", icon: lucide_react_1.CheckCircle },
            { label: "Error Rate", value: m.errorRate != null ? m.errorRate + "%" : "—", icon: lucide_react_1.AlertCircle },
            { label: "Avg Response", value: m.avgResponseTime != null ? m.avgResponseTime + "ms" : "—", icon: lucide_react_1.Zap },
        ].map(function (card, idx) { return (React.createElement("div", { key: idx, className: "bg-white p-6 rounded-lg border-2 border-amber-200 shadow-md" },
            React.createElement("div", { className: "flex items-center justify-between" },
                React.createElement("div", null,
                    React.createElement("p", { className: "text-gray-600 text-sm font-semibold" }, card.label),
                    React.createElement("p", { className: "text-3xl font-bold text-gray-900 mt-2" }, card.value)),
                React.createElement(card.icon, { className: "w-10 h-10 text-amber-600 opacity-20" })))); })),
        React.createElement("div", { className: "bg-white p-6 rounded-lg border-2 border-amber-200 shadow-md" },
            React.createElement("h2", { className: "text-xl font-bold text-gray-900 mb-4" },
                "Database Optimization Configs (",
                dbConfigs.length || opts.total,
                ")"),
            (dbConfigs.length > 0 ? dbConfigs : opts.configs).length === 0 ? (React.createElement("p", { className: "text-gray-500 text-center py-8" }, "No database tuning configurations found.")) : (React.createElement("div", { className: "space-y-3" }, (dbConfigs.length > 0 ? dbConfigs : opts.configs).map(function (cfg, idx) {
                var _a, _b, _c, _d;
                return (React.createElement("div", { key: (_a = cfg.id) !== null && _a !== void 0 ? _a : idx, className: "p-3 bg-gray-50 rounded" },
                    React.createElement("div", { className: "flex items-center justify-between mb-2" },
                        React.createElement("p", { className: "font-semibold text-gray-900" }, (_c = (_b = cfg.name) !== null && _b !== void 0 ? _b : cfg.type) !== null && _c !== void 0 ? _c : "Config"),
                        React.createElement("span", { className: "text-xs bg-green-100 text-green-700 px-2 py-1 rounded" }, (_d = cfg.status) !== null && _d !== void 0 ? _d : "active")),
                    cfg.description && React.createElement("p", { className: "text-sm text-gray-600" }, cfg.description)));
            }))))));
}
exports["default"] = DatabaseTuning;
