"use strict";
exports.__esModule = true;
var permissions_1 = require("@/lib/permissions");
var spinner_1 = require("@/components/ui/spinner");
var trpc_1 = require("@/lib/trpc");
var card_1 = require("@/components/ui/card");
var lucide_react_1 = require("lucide-react");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var stats_card_1 = require("@/components/ui/stats-card");
var progress_1 = require("@/components/ui/progress");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
function SystemHealthDashboard() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6;
    var _7 = permissions_1.useRequireRole(["ict_manager", "super_admin", "admin"]), allowed = _7.allowed, isLoading = _7.isLoading;
    var _8 = trpc_1.trpc.systemHealth.getStatus.useQuery(undefined, { enabled: allowed, refetchInterval: 30000 }), healthStatus = _8.data, statusLoading = _8.isLoading, refetchStatus = _8.refetch;
    var _9 = trpc_1.trpc.systemHealth.getComponents.useQuery(undefined, { enabled: allowed, refetchInterval: 60000 }), components = _9.data, componentsLoading = _9.isLoading, refetchComponents = _9.refetch;
    if (isLoading || statusLoading) {
        return (React.createElement("div", { className: "flex items-center justify-center h-screen" },
            React.createElement(spinner_1.Spinner, { className: "size-8" })));
    }
    if (!allowed) {
        return null;
    }
    var memoryPercent = (_b = (_a = healthStatus === null || healthStatus === void 0 ? void 0 : healthStatus.memory) === null || _a === void 0 ? void 0 : _a.usagePercent) !== null && _b !== void 0 ? _b : 0;
    var cpuLoad = (_e = (_d = (_c = healthStatus === null || healthStatus === void 0 ? void 0 : healthStatus.cpu) === null || _c === void 0 ? void 0 : _c.loadAvg) === null || _d === void 0 ? void 0 : _d[0]) !== null && _e !== void 0 ? _e : 0;
    var cpuPercent = Math.min(100, Math.round((cpuLoad / (((_f = healthStatus === null || healthStatus === void 0 ? void 0 : healthStatus.cpu) === null || _f === void 0 ? void 0 : _f.cores) || 1)) * 100));
    var getStatusColor = function (status) {
        if (status === "operational" || status === "healthy")
            return "text-green-500";
        if (status === "warning" || status === "not_configured")
            return "text-yellow-500";
        return "text-red-500";
    };
    var getStatusBadge = function (status) {
        if (status === "operational" || status === "healthy")
            return React.createElement(badge_1.Badge, { className: "bg-green-500/15 text-green-600 border-green-500/30", variant: "outline" }, "Operational");
        if (status === "not_configured")
            return React.createElement(badge_1.Badge, { className: "bg-yellow-500/15 text-yellow-600 border-yellow-500/30", variant: "outline" }, "Not Configured");
        if (status === "warning")
            return React.createElement(badge_1.Badge, { className: "bg-yellow-500/15 text-yellow-600 border-yellow-500/30", variant: "outline" }, "Warning");
        return React.createElement(badge_1.Badge, { className: "bg-red-500/15 text-red-600 border-red-500/30", variant: "outline" }, "Down");
    };
    var healthScore = components
        ? Math.round((components.filter(function (c) { return c.status === "operational"; }).length / components.length) * 100)
        : 0;
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "System Health", description: "Real-time system performance and health metrics", icon: React.createElement(lucide_react_1.Monitor, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "ICT", href: "/dashboards/ict" },
            { label: "System Health" },
        ] },
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "flex justify-end" },
                React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { refetchStatus(); refetchComponents(); } },
                    React.createElement(lucide_react_1.RefreshCw, { className: "h-4 w-4 mr-2" }),
                    " Refresh")),
            React.createElement("div", { className: "grid gap-4 md:grid-cols-4" },
                React.createElement(stats_card_1.StatsCard, { label: "Overall Health", value: React.createElement(React.Fragment, null,
                        healthScore,
                        "%"), description: ((_g = components === null || components === void 0 ? void 0 : components.filter(function (c) { return c.status === 'operational'; }).length) !== null && _g !== void 0 ? _g : 0) + "/" + ((_h = components === null || components === void 0 ? void 0 : components.length) !== null && _h !== void 0 ? _h : 0) + " services healthy", icon: healthScore >= 80 ? React.createElement(lucide_react_1.CheckCircle2, { className: "h-5 w-5 text-green-500" }) : React.createElement(lucide_react_1.AlertCircle, { className: "h-5 w-5 text-yellow-500" }), color: healthScore >= 80 ? "border-l-green-500" : "border-l-yellow-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Uptime", value: (_j = healthStatus === null || healthStatus === void 0 ? void 0 : healthStatus.uptimeFormatted) !== null && _j !== void 0 ? _j : "—", description: "Process uptime", icon: React.createElement(lucide_react_1.Clock, { className: "h-5 w-5" }), color: "border-l-blue-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "CPU Load", value: React.createElement(React.Fragment, null,
                        cpuPercent,
                        "%"), description: ((_l = (_k = healthStatus === null || healthStatus === void 0 ? void 0 : healthStatus.cpu) === null || _k === void 0 ? void 0 : _k.cores) !== null && _l !== void 0 ? _l : 0) + " cores \u00B7 Load " + cpuLoad, icon: React.createElement(lucide_react_1.Cpu, { className: "h-5 w-5" }), color: cpuPercent > 80 ? "border-l-red-500" : "border-l-purple-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Memory", value: React.createElement(React.Fragment, null,
                        memoryPercent,
                        "%"), description: ((_o = (_m = healthStatus === null || healthStatus === void 0 ? void 0 : healthStatus.memory) === null || _m === void 0 ? void 0 : _m.systemFree) !== null && _o !== void 0 ? _o : 0) + " MB free of " + ((_q = (_p = healthStatus === null || healthStatus === void 0 ? void 0 : healthStatus.memory) === null || _p === void 0 ? void 0 : _p.systemTotal) !== null && _q !== void 0 ? _q : 0) + " MB", icon: React.createElement(lucide_react_1.Database, { className: "h-5 w-5" }), color: memoryPercent > 85 ? "border-l-red-500" : "border-l-cyan-500" })),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Resource Utilization"),
                    React.createElement(card_1.CardDescription, null, "Real-time system resource usage")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "space-y-6" },
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", { className: "flex items-center gap-3 flex-1" },
                                React.createElement(lucide_react_1.Cpu, { className: "h-5 w-5 text-purple-500 flex-shrink-0" }),
                                React.createElement("div", { className: "flex-1" },
                                    React.createElement("div", { className: "flex items-center gap-2" },
                                        React.createElement("p", { className: "font-medium text-sm" }, "CPU Usage"),
                                        cpuPercent <= 70 ? React.createElement(lucide_react_1.CheckCircle2, { className: "h-4 w-4 text-green-500" }) : React.createElement(lucide_react_1.AlertCircle, { className: "h-4 w-4 text-yellow-500" })),
                                    React.createElement("p", { className: "text-sm text-muted-foreground" }, (_s = (_r = healthStatus === null || healthStatus === void 0 ? void 0 : healthStatus.cpu) === null || _r === void 0 ? void 0 : _r.model) !== null && _s !== void 0 ? _s : "Unknown"))),
                            React.createElement("div", { className: "flex items-center gap-3" },
                                React.createElement("div", { className: "w-32" },
                                    React.createElement(progress_1.Progress, { value: cpuPercent })),
                                React.createElement("span", { className: "text-sm font-medium w-12 text-right" },
                                    cpuPercent,
                                    "%"))),
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", { className: "flex items-center gap-3 flex-1" },
                                React.createElement(lucide_react_1.Database, { className: "h-5 w-5 text-blue-500 flex-shrink-0" }),
                                React.createElement("div", { className: "flex-1" },
                                    React.createElement("div", { className: "flex items-center gap-2" },
                                        React.createElement("p", { className: "font-medium text-sm" }, "Memory Usage"),
                                        memoryPercent <= 85 ? React.createElement(lucide_react_1.CheckCircle2, { className: "h-4 w-4 text-green-500" }) : React.createElement(lucide_react_1.AlertCircle, { className: "h-4 w-4 text-yellow-500" })),
                                    React.createElement("p", { className: "text-sm text-muted-foreground" },
                                        "Heap: ", (_u = (_t = healthStatus === null || healthStatus === void 0 ? void 0 : healthStatus.memory) === null || _t === void 0 ? void 0 : _t.heapUsed) !== null && _u !== void 0 ? _u : 0,
                                        " MB / ", (_w = (_v = healthStatus === null || healthStatus === void 0 ? void 0 : healthStatus.memory) === null || _v === void 0 ? void 0 : _v.heapTotal) !== null && _w !== void 0 ? _w : 0,
                                        " MB"))),
                            React.createElement("div", { className: "flex items-center gap-3" },
                                React.createElement("div", { className: "w-32" },
                                    React.createElement(progress_1.Progress, { value: memoryPercent })),
                                React.createElement("span", { className: "text-sm font-medium w-12 text-right" },
                                    memoryPercent,
                                    "%"))),
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", { className: "flex items-center gap-3 flex-1" },
                                React.createElement(lucide_react_1.HardDrive, { className: "h-5 w-5 text-orange-500 flex-shrink-0" }),
                                React.createElement("div", { className: "flex-1" },
                                    React.createElement("div", { className: "flex items-center gap-2" },
                                        React.createElement("p", { className: "font-medium text-sm" }, "RSS Memory")),
                                    React.createElement("p", { className: "text-sm text-muted-foreground" }, "Resident Set Size"))),
                            React.createElement("div", { className: "flex items-center gap-3" },
                                React.createElement("span", { className: "text-sm font-medium" }, (_y = (_x = healthStatus === null || healthStatus === void 0 ? void 0 : healthStatus.memory) === null || _x === void 0 ? void 0 : _x.rss) !== null && _y !== void 0 ? _y : 0,
                                    " MB")))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Service Status"),
                    React.createElement(card_1.CardDescription, null, "Status of critical system components")),
                React.createElement(card_1.CardContent, null, componentsLoading ? (React.createElement("div", { className: "space-y-4" }, Array.from({ length: 4 }).map(function (_, i) { return (React.createElement("div", { key: i, className: "h-14 bg-muted rounded animate-pulse" })); }))) : (React.createElement("div", { className: "space-y-3" }, (components !== null && components !== void 0 ? components : []).map(function (service, index) { return (React.createElement("div", { key: index, className: "flex items-center justify-between p-3 border rounded-lg" },
                    React.createElement("div", { className: "flex items-center gap-3" },
                        React.createElement("div", { className: "w-3 h-3 rounded-full " + (service.status === 'operational' ? 'bg-green-500' : service.status === 'not_configured' ? 'bg-yellow-500' : 'bg-red-500') }),
                        React.createElement("div", null,
                            React.createElement("p", { className: "font-medium text-sm" }, service.name),
                            React.createElement("p", { className: "text-xs text-muted-foreground" },
                                service.responseTime > 0 ? "Response: " + service.responseTime + "ms" : '',
                                service.uptime > 0 ? " \u00B7 Uptime: " + service.uptime + "%" : ''))),
                    getStatusBadge(service.status))); }))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "System Information"),
                    React.createElement(card_1.CardDescription, null, "Runtime environment details")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "grid gap-4 md:grid-cols-2" }, [
                        { label: "Platform", value: (_z = healthStatus === null || healthStatus === void 0 ? void 0 : healthStatus.platform) !== null && _z !== void 0 ? _z : "Unknown" },
                        { label: "Node.js Version", value: (_0 = healthStatus === null || healthStatus === void 0 ? void 0 : healthStatus.nodeVersion) !== null && _0 !== void 0 ? _0 : "Unknown" },
                        { label: "CPU Cores", value: String((_2 = (_1 = healthStatus === null || healthStatus === void 0 ? void 0 : healthStatus.cpu) === null || _1 === void 0 ? void 0 : _1.cores) !== null && _2 !== void 0 ? _2 : "Unknown") },
                        { label: "CPU Model", value: (_4 = (_3 = healthStatus === null || healthStatus === void 0 ? void 0 : healthStatus.cpu) === null || _3 === void 0 ? void 0 : _3.model) !== null && _4 !== void 0 ? _4 : "Unknown" },
                        { label: "Total Memory", value: ((_6 = (_5 = healthStatus === null || healthStatus === void 0 ? void 0 : healthStatus.memory) === null || _5 === void 0 ? void 0 : _5.systemTotal) !== null && _6 !== void 0 ? _6 : 0) + " MB" },
                        { label: "Last Updated", value: (healthStatus === null || healthStatus === void 0 ? void 0 : healthStatus.timestamp) ? new Date(healthStatus.timestamp).toLocaleString() : "—" },
                    ].map(function (item, index) { return (React.createElement("div", { key: index, className: "border-b pb-3" },
                        React.createElement("p", { className: "text-sm text-muted-foreground mb-1" }, item.label),
                        React.createElement("p", { className: "text-sm font-medium" }, item.value))); })))))));
}
exports["default"] = SystemHealthDashboard;
