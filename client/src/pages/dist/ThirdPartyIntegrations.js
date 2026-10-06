"use strict";
exports.__esModule = true;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
function ThirdPartyIntegrations() {
    var _a, _b;
    var _c = react_1.useState(null), selectedId = _c[0], setSelectedId = _c[1];
    var listQuery = trpc_1.trpc.thirdPartyIntegrations.listIntegrations.useQuery({});
    var configureMutation = trpc_1.trpc.thirdPartyIntegrations.configureIntegration.useMutation({
        onSuccess: function () { sonner_1.toast.success("Integration configured"); listQuery.refetch(); },
        onError: function (err) { var _a; return sonner_1.toast.error((_a = err.message) !== null && _a !== void 0 ? _a : "Configure failed"); }
    });
    var testMutation = trpc_1.trpc.thirdPartyIntegrations.testIntegration.useMutation({
        onSuccess: function () { return sonner_1.toast.success("Test passed"); },
        onError: function (err) { var _a; return sonner_1.toast.error((_a = err.message) !== null && _a !== void 0 ? _a : "Test failed"); }
    });
    var disableMutation = trpc_1.trpc.thirdPartyIntegrations.disableIntegration.useMutation({
        onSuccess: function () { sonner_1.toast.success("Integration disabled"); listQuery.refetch(); },
        onError: function (err) { var _a; return sonner_1.toast.error((_a = err.message) !== null && _a !== void 0 ? _a : "Disable failed"); }
    });
    var deleteMutation = trpc_1.trpc.thirdPartyIntegrations.deleteIntegration.useMutation({
        onSuccess: function () { sonner_1.toast.success("Integration deleted"); listQuery.refetch(); },
        onError: function (err) { var _a; return sonner_1.toast.error((_a = err.message) !== null && _a !== void 0 ? _a : "Delete failed"); }
    });
    var integrations = Array.isArray(listQuery.data)
        ? listQuery.data
        : (_b = (_a = listQuery.data) === null || _a === void 0 ? void 0 : _a.integrations) !== null && _b !== void 0 ? _b : [];
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Third Party Integrations", icon: React.createElement(lucide_react_1.Puzzle, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "System" },
            { label: "Integrations" },
        ] },
        listQuery.isLoading && (React.createElement("div", { className: "flex justify-center py-8" },
            React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin" }))),
        listQuery.error && (React.createElement("div", { className: "bg-red-50 text-red-700 p-4 rounded-lg" },
            "Error: ",
            listQuery.error.message)),
        !listQuery.isLoading && !listQuery.error && integrations.length === 0 && (React.createElement("p", { className: "text-center text-gray-500 py-8" }, "No data found.")),
        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" }, integrations.map(function (intg) {
            var _a, _b, _c, _d, _e, _f;
            return (React.createElement(card_1.Card, { key: (_a = intg.id) !== null && _a !== void 0 ? _a : intg.name, className: "cursor-pointer transition " + (selectedId === ((_b = intg.id) !== null && _b !== void 0 ? _b : intg.name) ? "border-blue-500 bg-blue-50" : ""), onClick: function () { var _a; return setSelectedId((_a = intg.id) !== null && _a !== void 0 ? _a : intg.name); } },
                React.createElement(card_1.CardHeader, null,
                    React.createElement("div", { className: "flex items-start justify-between" },
                        React.createElement("div", null,
                            React.createElement(card_1.CardTitle, { className: "text-base" }, (_c = intg.name) !== null && _c !== void 0 ? _c : "—"),
                            React.createElement("p", { className: "text-xs text-gray-600" }, (_e = (_d = intg.category) !== null && _d !== void 0 ? _d : intg.type) !== null && _e !== void 0 ? _e : "—")),
                        intg.status === "connected" || intg.status === "active" ? (React.createElement(lucide_react_1.CheckCircle, { className: "w-5 h-5 text-green-500" })) : (React.createElement(lucide_react_1.Circle, { className: "w-5 h-5 text-gray-300" })))),
                React.createElement(card_1.CardContent, null,
                    React.createElement("p", { className: "text-sm text-gray-600 mb-3" }, (_f = intg.description) !== null && _f !== void 0 ? _f : "—"),
                    React.createElement("div", { className: "flex gap-2 flex-wrap" },
                        React.createElement(button_1.Button, { size: "sm", variant: "outline", onClick: function (e) { e.stopPropagation(); configureMutation.mutate({ integrationId: intg.id }); }, disabled: configureMutation.isPending }, "Configure"),
                        React.createElement(button_1.Button, { size: "sm", variant: "outline", onClick: function (e) { e.stopPropagation(); testMutation.mutate({ integrationId: intg.id }); }, disabled: testMutation.isPending }, "Test"),
                        React.createElement(button_1.Button, { size: "sm", variant: "outline", onClick: function (e) { e.stopPropagation(); disableMutation.mutate({ integrationId: intg.id }); }, disabled: disableMutation.isPending }, "Disable"),
                        React.createElement(button_1.Button, { size: "sm", variant: "destructive", onClick: function (e) { e.stopPropagation(); deleteMutation.mutate({ integrationId: intg.id }); }, disabled: deleteMutation.isPending }, "Delete")))));
        }))));
}
exports["default"] = ThirdPartyIntegrations;
