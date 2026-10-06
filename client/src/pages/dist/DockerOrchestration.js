"use strict";
exports.__esModule = true;
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var ModuleLayout_1 = require("@/components/ModuleLayout");
function DockerOrchestration() {
    var _a, _b;
    var _c = trpc_1.trpc.cloudInfrastructure.listDeployments.useQuery({ limit: 50 }), data = _c.data, isLoading = _c.isLoading;
    var deployments = JSON.parse(JSON.stringify((_a = data === null || data === void 0 ? void 0 : data.deployments) !== null && _a !== void 0 ? _a : []));
    var total = (_b = data === null || data === void 0 ? void 0 : data.total) !== null && _b !== void 0 ? _b : 0;
    var running = deployments.filter(function (d) { return d.status === 'RUNNING'; }).length;
    var deployed = deployments.filter(function (d) { return d.status === 'DEPLOYED'; }).length;
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Docker Orchestration", icon: React.createElement(lucide_react_1.Server, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/crm-home" }, { label: "System" }, { label: "Docker Orchestration" }] },
        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" }, [
            { label: "Deployments", value: String(total), icon: lucide_react_1.Container },
            { label: "Running", value: String(running), icon: lucide_react_1.Cpu },
            { label: "Deployed", value: String(deployed), icon: lucide_react_1.Zap },
            { label: "Active", value: String(running + deployed), icon: lucide_react_1.Cpu },
        ].map(function (card, idx) { return (React.createElement("div", { key: idx, className: "bg-white p-6 rounded-lg border-2 border-blue-200 shadow-md" },
            React.createElement("div", { className: "flex items-center justify-between" },
                React.createElement("div", null,
                    React.createElement("p", { className: "text-gray-600 text-sm font-semibold" }, card.label),
                    React.createElement("p", { className: "text-3xl font-bold text-gray-900 mt-2" }, card.value)),
                React.createElement(card.icon, { className: "w-10 h-10 text-blue-600 opacity-20" })))); })),
        React.createElement("div", { className: "bg-white p-6 rounded-lg border-2 border-blue-200 shadow-md" },
            React.createElement("h2", { className: "text-xl font-bold text-gray-900 mb-4" }, "Deployments"),
            isLoading ? React.createElement("p", { className: "text-muted-foreground" }, "Loading...") : deployments.length === 0 ? (React.createElement("p", { className: "text-center text-muted-foreground py-8" }, "No deployments yet.")) : (React.createElement("div", { className: "space-y-3" }, deployments.map(function (d) {
                var _a, _b;
                return (React.createElement("div", { key: d.id, className: "p-3 bg-gray-50 rounded" },
                    React.createElement("div", { className: "flex justify-between mb-1" },
                        React.createElement("span", { className: "font-semibold text-gray-900 text-sm" }, d.name || d.serviceName || d.id),
                        React.createElement("span", { className: "text-xs px-2 py-1 rounded " + (d.status === "RUNNING" ? "bg-green-100 text-green-700" : d.status === "DEPLOYED" ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700") }, d.status)),
                    React.createElement("p", { className: "text-xs text-gray-600" },
                        "Replicas: ", (_a = d.replicas) !== null && _a !== void 0 ? _a : '-',
                        " | Orchestrator: ", (_b = d.orchestrator) !== null && _b !== void 0 ? _b : '-'),
                    React.createElement("p", { className: "text-xs text-gray-500" },
                        "Created: ",
                        d.createdAt ? new Date(d.createdAt).toLocaleDateString() : '-')));
            }))))));
}
exports["default"] = DockerOrchestration;
