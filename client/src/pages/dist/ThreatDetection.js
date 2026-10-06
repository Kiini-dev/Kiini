"use strict";
exports.__esModule = true;
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var ModuleLayout_1 = require("@/components/ModuleLayout");
function ThreatDetection() {
    var _a;
    var _b = trpc_1.trpc.enterpriseSecurity.listSecurityIncidents.useQuery({ limit: 50, severity: undefined }), data = _b.data, isLoading = _b.isLoading;
    var incidents = JSON.parse(JSON.stringify((_a = data === null || data === void 0 ? void 0 : data.incidents) !== null && _a !== void 0 ? _a : []));
    var threats = incidents.filter(function (i) { return i.type === 'threat_detection'; });
    var critical = threats.filter(function (i) { return i.severity === 'critical'; }).length;
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Threat Detection", icon: React.createElement(lucide_react_1.ShieldAlert, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/crm-home" }, { label: "Security" }, { label: "Threat Detection" }] },
        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" }, [
            { label: "Threats Detected", value: String(threats.length), icon: lucide_react_1.AlertTriangle },
            { label: "Critical", value: String(critical), icon: lucide_react_1.Shield },
            { label: "Total Incidents", value: String(incidents.length), icon: lucide_react_1.Zap },
            { label: "Investigating", value: String(threats.filter(function (t) { return t.status === 'investigating'; }).length), icon: lucide_react_1.AlertTriangle },
        ].map(function (card, idx) { return (React.createElement("div", { key: idx, className: "bg-white p-6 rounded-lg border-2 border-red-200 shadow-md" },
            React.createElement("div", { className: "flex items-center justify-between" },
                React.createElement("div", null,
                    React.createElement("p", { className: "text-gray-600 text-sm font-semibold" }, card.label),
                    React.createElement("p", { className: "text-3xl font-bold text-gray-900 mt-2" }, card.value)),
                React.createElement(card.icon, { className: "w-10 h-10 text-red-600 opacity-20" })))); })),
        React.createElement("div", { className: "bg-white p-6 rounded-lg border-2 border-red-200 shadow-md" },
            React.createElement("h2", { className: "text-xl font-bold text-gray-900 mb-4" }, "Recent Threats"),
            isLoading ? React.createElement("p", { className: "text-muted-foreground" }, "Loading...") : threats.length === 0 ? (React.createElement("p", { className: "text-center text-muted-foreground py-8" }, "No threats detected.")) : (React.createElement("div", { className: "space-y-2" }, threats.map(function (item) { return (React.createElement("div", { key: item.id, className: "p-3 bg-gray-50 rounded border-l-4 border-red-500" },
                React.createElement("div", { className: "flex justify-between" },
                    React.createElement("p", { className: "font-semibold text-gray-900 text-sm" }, item.title),
                    React.createElement("span", { className: "text-xs px-2 py-1 rounded " + (item.severity === "critical" ? "bg-red-100 text-red-700" :
                            item.severity === "high" ? "bg-orange-100 text-orange-700" :
                                "bg-yellow-100 text-yellow-700") }, item.severity)),
                React.createElement("p", { className: "text-xs text-gray-500 mt-1" }, item.description),
                React.createElement("p", { className: "text-xs text-gray-400 mt-1" },
                    "Status: ",
                    item.status,
                    " | ",
                    item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''))); }))))));
}
exports["default"] = ThreatDetection;
