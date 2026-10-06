"use strict";
exports.__esModule = true;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var statusStyles = {
    operational: "bg-green-100 text-green-700",
    degraded: "bg-yellow-100 text-yellow-700",
    down: "bg-red-100 text-red-700"
};
var statusIcon = function (status) {
    switch (status) {
        case "operational": return react_1["default"].createElement(lucide_react_1.CheckCircle, { size: 20, className: "text-green-600" });
        case "degraded": return react_1["default"].createElement(lucide_react_1.AlertCircle, { size: 20, className: "text-yellow-600" });
        case "down": return react_1["default"].createElement(lucide_react_1.XCircle, { size: 20, className: "text-red-600" });
        default: return react_1["default"].createElement(lucide_react_1.CheckCircle, { size: 20, className: "text-gray-400" });
    }
};
function SystemHealth() {
    var _a, _b, _c, _d, _e, _f, _g;
    var statusQuery = trpc_1.trpc.systemHealth.getStatus.useQuery(undefined, { refetchInterval: 30000 });
    var componentsQuery = trpc_1.trpc.systemHealth.getComponents.useQuery(undefined, { refetchInterval: 30000 });
    var metricsQuery = trpc_1.trpc.systemHealth.getMetrics.useQuery({}, { refetchInterval: 15000 });
    var status = statusQuery.data;
    var components = componentsQuery.data || [];
    var metrics = metricsQuery.data;
    return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: "System Health", description: "Real-time system monitoring and component status", icon: react_1["default"].createElement(lucide_react_1.Activity, { className: "h-6 w-6" }), breadcrumbs: [{ label: "Dashboard", href: "/crm-home" }, { label: "Admin" }, { label: "System Health" }] },
        react_1["default"].createElement("div", { className: "space-y-6" },
            react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 mb-6" },
                react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg shadow border-l-4 border-green-500" },
                    react_1["default"].createElement("p", { className: "text-sm text-slate-600" }, "Overall Status"),
                    react_1["default"].createElement("p", { className: "text-2xl font-bold text-slate-900" }, ((_a = status === null || status === void 0 ? void 0 : status.status) === null || _a === void 0 ? void 0 : _a.toUpperCase()) || "LOADING...")),
                react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg shadow border-l-4 border-blue-500" },
                    react_1["default"].createElement("div", { className: "flex items-center gap-2 text-sm text-slate-600" },
                        react_1["default"].createElement(lucide_react_1.Clock, { size: 14 }),
                        " Uptime"),
                    react_1["default"].createElement("p", { className: "text-2xl font-bold text-slate-900" }, (status === null || status === void 0 ? void 0 : status.uptimeFormatted) || "--")),
                react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg shadow border-l-4 border-purple-500" },
                    react_1["default"].createElement("div", { className: "flex items-center gap-2 text-sm text-slate-600" },
                        react_1["default"].createElement(lucide_react_1.HardDrive, { size: 14 }),
                        " Memory Usage"),
                    react_1["default"].createElement("p", { className: "text-2xl font-bold text-slate-900" }, (_c = (_b = status === null || status === void 0 ? void 0 : status.memory) === null || _b === void 0 ? void 0 : _b.usagePercent) !== null && _c !== void 0 ? _c : "--",
                        "%"),
                    react_1["default"].createElement("p", { className: "text-xs text-slate-500" }, (status === null || status === void 0 ? void 0 : status.memory) ? status.memory.systemFree + "MB free / " + status.memory.systemTotal + "MB total" : "")),
                react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg shadow border-l-4 border-orange-500" },
                    react_1["default"].createElement("div", { className: "flex items-center gap-2 text-sm text-slate-600" },
                        react_1["default"].createElement(lucide_react_1.Cpu, { size: 14 }),
                        " CPU Cores"),
                    react_1["default"].createElement("p", { className: "text-2xl font-bold text-slate-900" }, (_e = (_d = status === null || status === void 0 ? void 0 : status.cpu) === null || _d === void 0 ? void 0 : _d.cores) !== null && _e !== void 0 ? _e : "--"),
                    react_1["default"].createElement("p", { className: "text-xs text-slate-500" }, ((_f = status === null || status === void 0 ? void 0 : status.cpu) === null || _f === void 0 ? void 0 : _f.loadAvg) ? "Load: " + status.cpu.loadAvg.join(", ") : ""))),
            (status === null || status === void 0 ? void 0 : status.memory) && (react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg shadow mb-6" },
                react_1["default"].createElement("h2", { className: "text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2" },
                    react_1["default"].createElement(lucide_react_1.Server, { size: 20 }),
                    " Process Memory"),
                react_1["default"].createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4" },
                    react_1["default"].createElement("div", { className: "p-3 bg-slate-50 rounded-lg" },
                        react_1["default"].createElement("p", { className: "text-sm text-slate-600" }, "Heap Used"),
                        react_1["default"].createElement("p", { className: "text-xl font-bold text-slate-900" },
                            status.memory.heapUsed,
                            " MB")),
                    react_1["default"].createElement("div", { className: "p-3 bg-slate-50 rounded-lg" },
                        react_1["default"].createElement("p", { className: "text-sm text-slate-600" }, "Heap Total"),
                        react_1["default"].createElement("p", { className: "text-xl font-bold text-slate-900" },
                            status.memory.heapTotal,
                            " MB")),
                    react_1["default"].createElement("div", { className: "p-3 bg-slate-50 rounded-lg" },
                        react_1["default"].createElement("p", { className: "text-sm text-slate-600" }, "RSS"),
                        react_1["default"].createElement("p", { className: "text-xl font-bold text-slate-900" },
                            status.memory.rss,
                            " MB")),
                    react_1["default"].createElement("div", { className: "p-3 bg-slate-50 rounded-lg" },
                        react_1["default"].createElement("p", { className: "text-sm text-slate-600" }, "External"),
                        react_1["default"].createElement("p", { className: "text-xl font-bold text-slate-900" },
                            status.memory.external,
                            " MB"))))),
            react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg shadow mb-6" },
                react_1["default"].createElement("h2", { className: "text-lg font-semibold text-slate-900 mb-4" }, "Component Status"),
                react_1["default"].createElement("div", { className: "space-y-3" }, components.map(function (component, idx) {
                    var _a;
                    return (react_1["default"].createElement("div", { key: idx, className: "flex items-center justify-between p-3 bg-slate-50 rounded-lg" },
                        react_1["default"].createElement("div", { className: "flex items-center gap-3" },
                            statusIcon(component.status),
                            react_1["default"].createElement("div", null,
                                react_1["default"].createElement("p", { className: "font-medium text-slate-900" }, component.name),
                                react_1["default"].createElement("p", { className: "text-sm text-slate-600" },
                                    "Uptime: ",
                                    component.uptime,
                                    "% | Response: ",
                                    component.responseTime,
                                    "ms"))),
                        react_1["default"].createElement("span", { className: "px-3 py-1 text-sm font-medium rounded " + (statusStyles[component.status] || "bg-gray-100 text-gray-700") }, (_a = component.status) === null || _a === void 0 ? void 0 : _a.toUpperCase())));
                }))),
            metrics && (react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg shadow mb-6" },
                react_1["default"].createElement("h2", { className: "text-lg font-semibold text-slate-900 mb-4" }, "Live Metrics"),
                react_1["default"].createElement("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-4" },
                    react_1["default"].createElement("div", { className: "p-4 bg-blue-50 rounded-lg border border-blue-200" },
                        react_1["default"].createElement("p", { className: "text-sm text-blue-600" }, "Requests/min"),
                        react_1["default"].createElement("p", { className: "text-2xl font-bold text-blue-800" }, metrics.requestsPerMinute)),
                    react_1["default"].createElement("div", { className: "p-4 bg-green-50 rounded-lg border border-green-200" },
                        react_1["default"].createElement("p", { className: "text-sm text-green-600" }, "Avg Response Time"),
                        react_1["default"].createElement("p", { className: "text-2xl font-bold text-green-800" },
                            metrics.averageResponseTime,
                            "ms")),
                    react_1["default"].createElement("div", { className: "p-4 bg-red-50 rounded-lg border border-red-200" },
                        react_1["default"].createElement("p", { className: "text-sm text-red-600" }, "Error Rate"),
                        react_1["default"].createElement("p", { className: "text-2xl font-bold text-red-800" },
                            metrics.errorRate,
                            "%")),
                    react_1["default"].createElement("div", { className: "p-4 bg-purple-50 rounded-lg border border-purple-200" },
                        react_1["default"].createElement("p", { className: "text-sm text-purple-600" }, "Active Connections"),
                        react_1["default"].createElement("p", { className: "text-2xl font-bold text-purple-800" }, metrics.activeConnections)),
                    react_1["default"].createElement("div", { className: "p-4 bg-orange-50 rounded-lg border border-orange-200" },
                        react_1["default"].createElement("p", { className: "text-sm text-orange-600" }, "DB Queries"),
                        react_1["default"].createElement("p", { className: "text-2xl font-bold text-orange-800" }, metrics.databaseQueries)),
                    react_1["default"].createElement("div", { className: "p-4 bg-cyan-50 rounded-lg border border-cyan-200" },
                        react_1["default"].createElement("p", { className: "text-sm text-cyan-600" }, "Cache Hit Rate"),
                        react_1["default"].createElement("p", { className: "text-2xl font-bold text-cyan-800" },
                            metrics.cacheHitRate,
                            "%"))))),
            status && (react_1["default"].createElement("div", { className: "bg-white p-6 rounded-lg shadow" },
                react_1["default"].createElement("h2", { className: "text-lg font-semibold text-slate-900 mb-4" }, "System Information"),
                react_1["default"].createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 text-sm" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("p", { className: "text-slate-600" }, "Platform"),
                        react_1["default"].createElement("p", { className: "font-medium text-slate-900" }, status.platform)),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("p", { className: "text-slate-600" }, "Node Version"),
                        react_1["default"].createElement("p", { className: "font-medium text-slate-900" }, status.nodeVersion)),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("p", { className: "text-slate-600" }, "CPU Model"),
                        react_1["default"].createElement("p", { className: "font-medium text-slate-900" }, (_g = status.cpu) === null || _g === void 0 ? void 0 : _g.model)),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("p", { className: "text-slate-600" }, "Last Updated"),
                        react_1["default"].createElement("p", { className: "font-medium text-slate-900" }, status.timestamp ? new Date(status.timestamp).toLocaleTimeString() : "--"))))))));
}
exports["default"] = SystemHealth;
