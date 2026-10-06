"use strict";
exports.__esModule = true;
var react_1 = require("react");
var permissions_1 = require("@/lib/permissions");
var spinner_1 = require("@/components/ui/spinner");
var trpc_1 = require("@/lib/trpc");
var lucide_react_1 = require("lucide-react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var select_1 = require("@/components/ui/select");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var badge_1 = require("@/components/ui/badge");
var stats_card_1 = require("@/components/ui/stats-card");
var exportCsv_1 = require("@/utils/exportCsv");
function SystemLogsViewer() {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    var _j = permissions_1.useRequireRole(["ict_manager", "super_admin", "admin"]), allowed = _j.allowed, roleLoading = _j.isLoading;
    var _k = react_1.useState(""), searchTerm = _k[0], setSearchTerm = _k[1];
    var _l = react_1.useState("all"), filterAction = _l[0], setFilterAction = _l[1];
    var _m = react_1.useState("all"), filterEntityType = _m[0], setFilterEntityType = _m[1];
    var _o = react_1.useState(null), expandedLogId = _o[0], setExpandedLogId = _o[1];
    var _p = react_1.useState(1), page = _p[0], setPage = _p[1];
    var limit = 30;
    var logsQ = trpc_1.trpc.activityTrail.list.useQuery({
        page: page,
        limit: limit,
        search: searchTerm || undefined,
        action: filterAction !== "all" ? filterAction : undefined,
        entityType: filterEntityType !== "all" ? filterEntityType : undefined
    });
    var statsQ = trpc_1.trpc.activityTrail.getStats.useQuery({});
    var entityTypesQ = trpc_1.trpc.activityTrail.getEntityTypes.useQuery({});
    var actionsQ = trpc_1.trpc.activityTrail.getActions.useQuery({});
    var logs = (_b = (_a = logsQ.data) === null || _a === void 0 ? void 0 : _a.activities) !== null && _b !== void 0 ? _b : [];
    var total = (_d = (_c = logsQ.data) === null || _c === void 0 ? void 0 : _c.total) !== null && _d !== void 0 ? _d : 0;
    var totalPages = Math.max(1, Math.ceil(total / limit));
    var entityTypes = (_e = entityTypesQ.data) !== null && _e !== void 0 ? _e : [];
    var actions = (_f = actionsQ.data) !== null && _f !== void 0 ? _f : [];
    var stats = statsQ.data;
    var getLevelColor = function (action) {
        var a = (action === null || action === void 0 ? void 0 : action.toLowerCase()) || "";
        if (a.includes("delete") || a.includes("fail") || a.includes("error"))
            return "bg-red-100 text-red-800";
        if (a.includes("warn") || a.includes("reject"))
            return "bg-yellow-100 text-yellow-800";
        if (a.includes("creat") || a.includes("approv") || a.includes("login"))
            return "bg-green-100 text-green-800";
        return "bg-blue-100 text-blue-800";
    };
    var handleExport = function () {
        if (!logs.length)
            return;
        exportCsv_1.exportToCsv(logs.map(function (l) { return ({
            Date: l.createdAt ? new Date(l.createdAt).toLocaleString() : "",
            Action: l.action,
            Entity: l.entityType,
            Description: l.description,
            User: l.userId
        }); }), "system-logs");
    };
    if (roleLoading) {
        return React.createElement("div", { className: "flex items-center justify-center h-screen" },
            React.createElement(spinner_1.Spinner, { className: "size-8" }));
    }
    if (!allowed)
        return null;
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "System Logs", description: "View and audit system activity and events", icon: React.createElement(lucide_react_1.Monitor, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/dashboard" },
            { label: "ICT", href: "/dashboards/ict" },
            { label: "System Logs" },
        ] },
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "grid gap-4 md:grid-cols-4" },
                React.createElement(stats_card_1.StatsCard, { label: "Total Activities", value: (_g = stats === null || stats === void 0 ? void 0 : stats.totalActivities) !== null && _g !== void 0 ? _g : 0, description: "All logged events", icon: React.createElement(lucide_react_1.Clock, { className: "h-5 w-5" }), color: "border-l-blue-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Unique Users", value: (_h = stats === null || stats === void 0 ? void 0 : stats.uniqueUsers) !== null && _h !== void 0 ? _h : 0, description: "Active users", icon: React.createElement(lucide_react_1.Monitor, { className: "h-5 w-5" }), color: "border-l-green-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Entity Types", value: entityTypes.length, description: "Categories tracked", icon: React.createElement(lucide_react_1.Filter, { className: "h-5 w-5" }), color: "border-l-purple-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Action Types", value: actions.length, description: "Distinct actions", icon: React.createElement(lucide_react_1.AlertCircle, { className: "h-5 w-5" }), color: "border-l-cyan-500" })),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                        React.createElement(lucide_react_1.Filter, { className: "w-5 h-5" }),
                        " Filters & Search")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "grid gap-4 md:grid-cols-4" },
                        React.createElement("div", { className: "relative" },
                            React.createElement(lucide_react_1.Search, { className: "w-4 h-4 text-muted-foreground absolute left-3 top-3" }),
                            React.createElement(input_1.Input, { placeholder: "Search logs...", value: searchTerm, onChange: function (e) { setSearchTerm(e.target.value); setPage(1); }, className: "pl-9" })),
                        React.createElement(select_1.Select, { value: filterAction, onValueChange: function (v) { setFilterAction(v); setPage(1); } },
                            React.createElement(select_1.SelectTrigger, null,
                                React.createElement(select_1.SelectValue, { placeholder: "All actions" })),
                            React.createElement(select_1.SelectContent, null,
                                React.createElement(select_1.SelectItem, { value: "all" }, "All Actions"),
                                actions.map(function (a) { return React.createElement(select_1.SelectItem, { key: a, value: a }, a); }))),
                        React.createElement(select_1.Select, { value: filterEntityType, onValueChange: function (v) { setFilterEntityType(v); setPage(1); } },
                            React.createElement(select_1.SelectTrigger, null,
                                React.createElement(select_1.SelectValue, { placeholder: "All entities" })),
                            React.createElement(select_1.SelectContent, null,
                                React.createElement(select_1.SelectItem, { value: "all" }, "All Entity Types"),
                                entityTypes.map(function (t) { return React.createElement(select_1.SelectItem, { key: t, value: t }, t); }))),
                        React.createElement(button_1.Button, { variant: "outline", className: "gap-2", onClick: handleExport },
                            React.createElement(lucide_react_1.Download, { className: "w-4 h-4" }),
                            " Export")))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Activity Logs"),
                    React.createElement(card_1.CardDescription, null,
                        "Showing ",
                        logs.length,
                        " of ",
                        total,
                        " logs (page ",
                        page,
                        "/",
                        totalPages,
                        ")")),
                React.createElement(card_1.CardContent, null,
                    logsQ.isLoading ? (React.createElement("div", { className: "flex justify-center py-8" },
                        React.createElement(spinner_1.Spinner, { className: "size-6" }))) : logs.length === 0 ? (React.createElement("p", { className: "text-center text-muted-foreground py-8" }, "No logs matching your criteria")) : (React.createElement("div", { className: "space-y-3" }, logs.map(function (log) { return (React.createElement("div", { key: log.id, className: "border rounded-lg p-4 hover:bg-muted/50 transition-colors" },
                        React.createElement("div", { className: "flex items-start justify-between cursor-pointer", onClick: function () { return setExpandedLogId(expandedLogId === String(log.id) ? null : String(log.id)); } },
                            React.createElement("div", { className: "flex-1" },
                                React.createElement("div", { className: "flex items-center gap-3 mb-2" },
                                    React.createElement(badge_1.Badge, { variant: "outline", className: getLevelColor(log.action) }, log.action),
                                    React.createElement("span", { className: "text-sm text-muted-foreground" }, log.entityType),
                                    React.createElement("span", { className: "text-xs text-muted-foreground" }, log.createdAt ? new Date(log.createdAt).toLocaleString() : "")),
                                React.createElement("p", { className: "text-sm" }, log.description),
                                React.createElement("div", { className: "flex gap-4 mt-2 text-xs text-muted-foreground" },
                                    React.createElement("span", null,
                                        "User ID: ",
                                        log.userId),
                                    log.entityId && React.createElement("span", null,
                                        "Entity: ",
                                        log.entityId))),
                            React.createElement(button_1.Button, { variant: "ghost", size: "sm" },
                                React.createElement(lucide_react_1.ChevronDown, { className: "w-4 h-4 transition-transform " + (expandedLogId === String(log.id) ? "rotate-180" : "") }))),
                        expandedLogId === String(log.id) && (React.createElement("div", { className: "mt-4 pt-4 border-t" },
                            React.createElement("div", { className: "bg-muted rounded p-3 text-sm font-mono break-words" },
                                React.createElement("p", null,
                                    React.createElement("strong", null, "ID:"),
                                    " ",
                                    log.id),
                                React.createElement("p", null,
                                    React.createElement("strong", null, "Action:"),
                                    " ",
                                    log.action),
                                React.createElement("p", null,
                                    React.createElement("strong", null, "Entity Type:"),
                                    " ",
                                    log.entityType),
                                React.createElement("p", null,
                                    React.createElement("strong", null, "Entity ID:"),
                                    " ",
                                    log.entityId),
                                React.createElement("p", null,
                                    React.createElement("strong", null, "Description:"),
                                    " ",
                                    log.description),
                                React.createElement("p", null,
                                    React.createElement("strong", null, "Created:"),
                                    " ",
                                    log.createdAt ? new Date(log.createdAt).toISOString() : ""),
                                log.metadata && React.createElement("p", null,
                                    React.createElement("strong", null, "Metadata:"),
                                    " ",
                                    typeof log.metadata === "string" ? log.metadata : JSON.stringify(log.metadata))))))); }))),
                    totalPages > 1 && (React.createElement("div", { className: "flex items-center justify-between mt-4 pt-4 border-t" },
                        React.createElement(button_1.Button, { variant: "outline", size: "sm", disabled: page <= 1, onClick: function () { return setPage(page - 1); } },
                            React.createElement(lucide_react_1.ChevronLeft, { className: "w-4 h-4 mr-1" }),
                            " Previous"),
                        React.createElement("span", { className: "text-sm text-muted-foreground" },
                            "Page ",
                            page,
                            " of ",
                            totalPages),
                        React.createElement(button_1.Button, { variant: "outline", size: "sm", disabled: page >= totalPages, onClick: function () { return setPage(page + 1); } },
                            "Next ",
                            React.createElement(lucide_react_1.ChevronRight, { className: "w-4 h-4 ml-1" })))))))));
}
exports["default"] = SystemLogsViewer;
