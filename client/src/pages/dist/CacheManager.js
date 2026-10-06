"use strict";
exports.__esModule = true;
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var card_1 = require("@/components/ui/card");
function CacheManager() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    var statusQuery = trpc_1.trpc.systemHealth.getStatus.useQuery();
    var metricsQuery = trpc_1.trpc.systemHealth.getMetrics.useQuery({});
    var componentsQuery = trpc_1.trpc.systemHealth.getComponents.useQuery();
    var status = statusQuery.data ? JSON.parse(JSON.stringify(statusQuery.data)) : null;
    var metrics = metricsQuery.data ? JSON.parse(JSON.stringify(metricsQuery.data)) : null;
    var components = componentsQuery.data ? JSON.parse(JSON.stringify(componentsQuery.data)) : [];
    var cacheComponent = components.find(function (c) { return c.name === "Cache Layer"; });
    var memory = (status === null || status === void 0 ? void 0 : status.memory) || {};
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Cache Manager", icon: React.createElement(lucide_react_1.Database, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/crm-home" }, { label: "System" }, { label: "Cache Manager" }] },
        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" },
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardContent, { className: "pt-4" },
                    React.createElement("div", { className: "flex items-center justify-between" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Cache Hit Rate"),
                            React.createElement("p", { className: "text-2xl font-bold" }, (_a = metrics === null || metrics === void 0 ? void 0 : metrics.cacheHitRate) !== null && _a !== void 0 ? _a : 0,
                                "%")),
                        React.createElement(lucide_react_1.Zap, { className: "w-8 h-8 text-purple-600 opacity-20" })))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardContent, { className: "pt-4" },
                    React.createElement("div", { className: "flex items-center justify-between" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Memory Used"),
                            React.createElement("p", { className: "text-2xl font-bold" }, (_b = memory.heapUsed) !== null && _b !== void 0 ? _b : 0,
                                " MB"),
                            React.createElement("p", { className: "text-xs text-muted-foreground" },
                                "of ", (_c = memory.heapTotal) !== null && _c !== void 0 ? _c : 0,
                                " MB heap")),
                        React.createElement(lucide_react_1.Gauge, { className: "w-8 h-8 text-purple-600 opacity-20" })))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardContent, { className: "pt-4" },
                    React.createElement("div", { className: "flex items-center justify-between" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "System Memory"),
                            React.createElement("p", { className: "text-2xl font-bold" }, (_d = memory.usagePercent) !== null && _d !== void 0 ? _d : 0,
                                "%"),
                            React.createElement("p", { className: "text-xs text-muted-foreground" }, (_e = memory.systemFree) !== null && _e !== void 0 ? _e : 0,
                                " MB free")),
                        React.createElement(lucide_react_1.Database, { className: "w-8 h-8 text-purple-600 opacity-20" })))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardContent, { className: "pt-4" },
                    React.createElement("div", { className: "flex items-center justify-between" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Cache Response"),
                            React.createElement("p", { className: "text-2xl font-bold" }, (_f = cacheComponent === null || cacheComponent === void 0 ? void 0 : cacheComponent.responseTime) !== null && _f !== void 0 ? _f : 0,
                                "ms"),
                            React.createElement("p", { className: "text-xs text-muted-foreground" }, (_g = cacheComponent === null || cacheComponent === void 0 ? void 0 : cacheComponent.status) !== null && _g !== void 0 ? _g : "unknown")),
                        React.createElement(lucide_react_1.RotateCw, { className: "w-8 h-8 text-purple-600 opacity-20" }))))),
        React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6" },
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "System Components")),
                React.createElement(card_1.CardContent, null, components.length > 0 ? (React.createElement("div", { className: "space-y-3" }, components.map(function (comp, idx) { return (React.createElement("div", { key: idx, className: "p-4 bg-muted/50 rounded border-l-4 border-purple-500" },
                    React.createElement("div", { className: "flex items-center justify-between" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "font-semibold" }, comp.name),
                            React.createElement("p", { className: "text-sm text-muted-foreground" },
                                "Uptime: ",
                                comp.uptime,
                                "% | ",
                                comp.responseTime,
                                "ms")),
                        React.createElement("span", { className: "px-2 py-1 text-xs font-bold rounded " + (comp.status === "operational" ? "bg-green-100 text-green-700" :
                                comp.status === "degraded" ? "bg-yellow-100 text-yellow-700" :
                                    "bg-red-100 text-red-700") }, comp.status)))); }))) : (React.createElement("p", { className: "text-muted-foreground text-center py-8" }, "Loading components...")))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Server Performance")),
                React.createElement(card_1.CardContent, { className: "space-y-4" },
                    React.createElement("div", { className: "flex justify-between" },
                        React.createElement("span", { className: "text-muted-foreground" }, "Requests/min"),
                        React.createElement("span", { className: "font-semibold" }, (_h = metrics === null || metrics === void 0 ? void 0 : metrics.requestsPerMinute) !== null && _h !== void 0 ? _h : 0)),
                    React.createElement("div", { className: "flex justify-between" },
                        React.createElement("span", { className: "text-muted-foreground" }, "Avg Response Time"),
                        React.createElement("span", { className: "font-semibold" }, (_j = metrics === null || metrics === void 0 ? void 0 : metrics.averageResponseTime) !== null && _j !== void 0 ? _j : 0,
                            "ms")),
                    React.createElement("div", { className: "flex justify-between" },
                        React.createElement("span", { className: "text-muted-foreground" }, "Error Rate"),
                        React.createElement("span", { className: "font-semibold" }, (_k = metrics === null || metrics === void 0 ? void 0 : metrics.errorRate) !== null && _k !== void 0 ? _k : 0,
                            "%")),
                    React.createElement("div", { className: "flex justify-between" },
                        React.createElement("span", { className: "text-muted-foreground" }, "Active Connections"),
                        React.createElement("span", { className: "font-semibold" }, (_l = metrics === null || metrics === void 0 ? void 0 : metrics.activeConnections) !== null && _l !== void 0 ? _l : 0)),
                    React.createElement("div", { className: "flex justify-between" },
                        React.createElement("span", { className: "text-muted-foreground" }, "DB Queries"),
                        React.createElement("span", { className: "font-semibold" }, (_m = metrics === null || metrics === void 0 ? void 0 : metrics.databaseQueries) !== null && _m !== void 0 ? _m : 0)),
                    React.createElement("div", { className: "flex justify-between" },
                        React.createElement("span", { className: "text-muted-foreground" }, "Node Version"),
                        React.createElement("span", { className: "font-semibold" }, (_o = status === null || status === void 0 ? void 0 : status.nodeVersion) !== null && _o !== void 0 ? _o : "—")),
                    React.createElement("div", { className: "flex justify-between" },
                        React.createElement("span", { className: "text-muted-foreground" }, "Uptime"),
                        React.createElement("span", { className: "font-semibold" }, (_p = status === null || status === void 0 ? void 0 : status.uptimeFormatted) !== null && _p !== void 0 ? _p : "—")))))));
}
exports["default"] = CacheManager;
