"use strict";
exports.__esModule = true;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var sonner_1 = require("sonner");
function OfflineSync() {
    var _a;
    var _b = react_1.useState(""), deviceId = _b[0], setDeviceId = _b[1];
    var syncMutation = trpc_1.trpc.mobileApp.initializeOfflineSync.useMutation({
        onSuccess: function (data) { return sonner_1.toast.success("Sync initialized for device " + data.deviceId); },
        onError: function (err) { return sonner_1.toast.error(err.message); }
    });
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Offline Sync", icon: React.createElement(lucide_react_1.RefreshCw, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/crm-home" }, { label: "System" }, { label: "Offline Sync" }] },
        React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6" },
            React.createElement("div", { className: "bg-white p-6 rounded-lg border-2 border-blue-200 shadow-md" },
                React.createElement("h2", { className: "text-xl font-bold text-gray-900 mb-4" }, "Initialize Sync"),
                React.createElement("div", { className: "space-y-3" },
                    React.createElement("div", null,
                        React.createElement("label", { className: "block text-sm font-semibold text-gray-700 mb-2" }, "Device ID"),
                        React.createElement("input", { type: "text", value: deviceId, onChange: function (e) { return setDeviceId(e.target.value); }, placeholder: "Enter device identifier", className: "w-full p-2 border-2 border-gray-300 rounded" })),
                    React.createElement("button", { onClick: function () { if (deviceId)
                            syncMutation.mutate({ deviceId: deviceId, entities: ["contacts", "leads", "deals"] }); }, disabled: !deviceId || syncMutation.isPending, className: "w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 rounded font-semibold transition flex items-center justify-center gap-2" },
                        syncMutation.isPending ? React.createElement(lucide_react_1.Loader2, { className: "h-4 w-4 animate-spin" }) : React.createElement(lucide_react_1.RefreshCw, { className: "h-4 w-4" }),
                        "Sync Now"))),
            syncMutation.data && (React.createElement("div", { className: "bg-white p-6 rounded-lg border-2 border-green-200 shadow-md" },
                React.createElement("h2", { className: "text-xl font-bold text-gray-900 mb-4" }, "Sync Result"),
                React.createElement("div", { className: "space-y-3" },
                    React.createElement("div", { className: "flex justify-between" },
                        React.createElement("span", { className: "text-gray-700" }, "Device"),
                        React.createElement("span", { className: "font-semibold" }, syncMutation.data.deviceId)),
                    React.createElement("div", { className: "flex justify-between" },
                        React.createElement("span", { className: "text-gray-700" }, "Sync Token"),
                        React.createElement("span", { className: "font-semibold text-xs truncate max-w-[200px]" }, syncMutation.data.syncToken)),
                    React.createElement("div", { className: "flex justify-between" },
                        React.createElement("span", { className: "text-gray-700" }, "Entities"),
                        React.createElement("span", { className: "font-semibold" }, (_a = syncMutation.data.entities) === null || _a === void 0 ? void 0 : _a.join(", "))),
                    React.createElement("div", { className: "flex justify-between" },
                        React.createElement("span", { className: "text-gray-700" }, "Queued Changes"),
                        React.createElement("span", { className: "font-semibold" }, syncMutation.data.queuedChanges)),
                    React.createElement("div", { className: "flex justify-between" },
                        React.createElement("span", { className: "text-gray-700" }, "Last Sync"),
                        React.createElement("span", { className: "font-semibold" }, new Date(syncMutation.data.lastSync).toLocaleString())))))),
        React.createElement("div", { className: "bg-white p-6 rounded-lg border-2 border-blue-200 shadow-md" },
            React.createElement("h2", { className: "text-xl font-bold text-gray-900 mb-4" }, "Sync Entities"),
            React.createElement("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-3" }, ["contacts", "leads", "deals", "tasks", "notes", "documents"].map(function (entity) { return (React.createElement("div", { key: entity, className: "p-3 bg-blue-50 rounded text-center" },
                React.createElement(lucide_react_1.Database, { className: "h-5 w-5 mx-auto text-blue-600 mb-1" }),
                React.createElement("p", { className: "text-sm font-semibold text-gray-900 capitalize" }, entity))); })))));
}
exports["default"] = OfflineSync;
