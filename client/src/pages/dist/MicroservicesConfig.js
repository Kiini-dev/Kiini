"use strict";
exports.__esModule = true;
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var table_1 = require("@/components/ui/table");
function MicroservicesConfig() {
    var _a;
    var _b = trpc_1.trpc.cloudInfrastructure.listDeployments.useQuery({ limit: 50 }), data = _b.data, isLoading = _b.isLoading;
    var deployments = JSON.parse(JSON.stringify((_a = data === null || data === void 0 ? void 0 : data.deployments) !== null && _a !== void 0 ? _a : []));
    var services = deployments.filter(function (d) { return d.serviceName; });
    var healthy = services.filter(function (d) { return d.status === 'DEPLOYED' || d.status === 'RUNNING'; }).length;
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Microservices Config", icon: React.createElement(lucide_react_1.Settings, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/crm-home" }, { label: "System" }, { label: "Microservices Config" }] },
        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" }, [
            { label: "Services", value: String(services.length), icon: lucide_react_1.Zap },
            { label: "Healthy", value: String(healthy), icon: lucide_react_1.Activity },
            { label: "Total Deployments", value: String(deployments.length), icon: lucide_react_1.TrendingUp },
            { label: "All Active", value: String(deployments.filter(function (d) { return d.status !== 'STOPPED'; }).length), icon: lucide_react_1.Zap },
        ].map(function (card, idx) { return (React.createElement("div", { key: idx, className: "bg-white p-6 rounded-lg border-2 border-purple-200 shadow-md" },
            React.createElement("div", { className: "flex items-center justify-between" },
                React.createElement("div", null,
                    React.createElement("p", { className: "text-gray-600 text-sm font-semibold" }, card.label),
                    React.createElement("p", { className: "text-3xl font-bold text-gray-900 mt-2" }, card.value)),
                React.createElement(card.icon, { className: "w-10 h-10 text-purple-600 opacity-20" })))); })),
        React.createElement("div", { className: "bg-white p-6 rounded-lg border-2 border-purple-200 shadow-md" },
            React.createElement("h2", { className: "text-xl font-bold text-gray-900 mb-4" }, "Service Health Status"),
            isLoading ? React.createElement("p", { className: "text-muted-foreground" }, "Loading...") : services.length === 0 ? (React.createElement("p", { className: "text-center text-muted-foreground py-8" }, "No microservices deployed. Use deployMicroservices to deploy.")) : (React.createElement("div", { className: "overflow-x-auto" },
                React.createElement(table_1.Table, null,
                    React.createElement(table_1.TableHeader, null,
                        React.createElement(table_1.TableRow, null,
                            React.createElement(table_1.TableHead, null, "Service"),
                            React.createElement(table_1.TableHead, null, "Replicas"),
                            React.createElement(table_1.TableHead, null, "Orchestrator"),
                            React.createElement(table_1.TableHead, null, "Status"),
                            React.createElement(table_1.TableHead, null, "Created"))),
                    React.createElement(table_1.TableBody, null, services.map(function (s) {
                        var _a, _b;
                        return (React.createElement(table_1.TableRow, { key: s.id },
                            React.createElement(table_1.TableCell, { className: "font-semibold" }, s.serviceName || s.name),
                            React.createElement(table_1.TableCell, null, (_a = s.replicas) !== null && _a !== void 0 ? _a : '-'),
                            React.createElement(table_1.TableCell, null, (_b = s.orchestrator) !== null && _b !== void 0 ? _b : '-'),
                            React.createElement(table_1.TableCell, null,
                                React.createElement("span", { className: "px-2 py-1 rounded text-xs font-semibold " + (s.status === 'DEPLOYED' || s.status === 'RUNNING' ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700") }, s.status)),
                            React.createElement(table_1.TableCell, null, s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '-')));
                    }))))))));
}
exports["default"] = MicroservicesConfig;
