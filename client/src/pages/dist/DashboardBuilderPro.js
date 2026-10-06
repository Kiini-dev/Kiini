"use strict";
exports.__esModule = true;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var badge_1 = require("@/components/ui/badge");
function DashboardBuilderPro() {
    var _a;
    var _b = react_1.useState(false), showNew = _b[0], setShowNew = _b[1];
    var _c = react_1.useState(""), newName = _c[0], setNewName = _c[1];
    var dashboardsQuery = trpc_1.trpc.dashboardBuilder.listDashboards.useQuery();
    var createMutation = trpc_1.trpc.dashboardBuilder.createDashboard.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Dashboard created");
            setNewName("");
            setShowNew(false);
            dashboardsQuery.refetch();
        },
        onError: function (err) { var _a; return sonner_1.toast.error((_a = err.message) !== null && _a !== void 0 ? _a : "Failed to create dashboard"); }
    });
    var handleCreate = function () {
        if (newName.trim()) {
            createMutation.mutate({ name: newName });
        }
    };
    var dashboards = (_a = dashboardsQuery.data) !== null && _a !== void 0 ? _a : [];
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Dashboard Builder", icon: React.createElement(lucide_react_1.LayoutDashboard, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Tools" },
            { label: "Dashboard Builder" },
        ] },
        React.createElement("div", { className: "flex justify-between items-center" },
            React.createElement(button_1.Button, { onClick: function () { return setShowNew(true); } }, "+ Create Dashboard")),
        showNew && (React.createElement(card_1.Card, null,
            React.createElement(card_1.CardContent, { className: "pt-4" },
                React.createElement("div", { className: "flex gap-2" },
                    React.createElement(input_1.Input, { value: newName, onChange: function (e) { return setNewName(e.target.value); }, placeholder: "Dashboard name...", onKeyDown: function (e) { return e.key === "Enter" && handleCreate(); } }),
                    React.createElement(button_1.Button, { onClick: handleCreate, disabled: createMutation.isPending },
                        createMutation.isPending ? React.createElement(lucide_react_1.Loader2, { className: "h-4 w-4 animate-spin mr-2" }) : null,
                        "Create"),
                    React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setShowNew(false); } }, "Cancel"))))),
        dashboardsQuery.isLoading && (React.createElement("div", { className: "flex justify-center py-8" },
            React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin" }))),
        dashboardsQuery.error && (React.createElement("div", { className: "bg-red-50 text-red-700 p-4 rounded-lg" },
            "Error: ",
            dashboardsQuery.error.message)),
        !dashboardsQuery.isLoading && !dashboardsQuery.error && dashboards.length === 0 && (React.createElement("p", { className: "text-center text-gray-500 py-8" }, "No data found.")),
        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4" }, dashboards.map(function (d) {
            var _a, _b, _c, _d, _e, _f, _g;
            return (React.createElement(card_1.Card, { key: (_a = d.id) !== null && _a !== void 0 ? _a : d.name },
                React.createElement(card_1.CardHeader, null,
                    React.createElement("div", { className: "flex justify-between items-start" },
                        React.createElement(card_1.CardTitle, { className: "text-base" }, (_b = d.name) !== null && _b !== void 0 ? _b : "—"),
                        d.shared && React.createElement(badge_1.Badge, { className: "bg-green-100 text-green-800 border-0" }, "Shared"))),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "space-y-2 text-sm" },
                        React.createElement("div", { className: "flex justify-between" },
                            React.createElement("span", { className: "text-gray-600" }, "Widgets:"),
                            React.createElement("span", { className: "font-medium" }, (_d = (_c = d.widgets) !== null && _c !== void 0 ? _c : d.widgetCount) !== null && _d !== void 0 ? _d : 0)),
                        React.createElement("div", { className: "flex justify-between" },
                            React.createElement("span", { className: "text-gray-600" }, "Views:"),
                            React.createElement("span", { className: "font-medium" }, (_e = d.views) !== null && _e !== void 0 ? _e : 0)),
                        React.createElement("div", { className: "flex justify-between" },
                            React.createElement("span", { className: "text-gray-600" }, "Modified:"),
                            React.createElement("span", { className: "font-medium text-xs" }, (_g = (_f = d.lastModified) !== null && _f !== void 0 ? _f : d.updatedAt) !== null && _g !== void 0 ? _g : "—"))))));
        }))));
}
exports["default"] = DashboardBuilderPro;
