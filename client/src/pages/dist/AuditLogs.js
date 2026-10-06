"use strict";
exports.__esModule = true;
var react_1 = require("react");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var useUserLookup_1 = require("@/hooks/useUserLookup");
var card_1 = require("@/components/ui/card");
var input_1 = require("@/components/ui/input");
var badge_1 = require("@/components/ui/badge");
var select_1 = require("@/components/ui/select");
var table_1 = require("@/components/ui/table");
var stats_card_1 = require("@/components/ui/stats-card");
function AuditLogs() {
    var _a, _b, _c, _d;
    var getUserName = useUserLookup_1.useUserLookup().getUserName;
    var _e = react_1.useState(""), search = _e[0], setSearch = _e[1];
    var _f = react_1.useState("all"), actionFilter = _f[0], setActionFilter = _f[1];
    var _g = trpc_1.trpc.activityTrail.list.useQuery({
        limit: 100,
        search: search || undefined,
        action: actionFilter !== "all" ? actionFilter : undefined
    }), rawData = _g.data, isLoading = _g.isLoading;
    var rawStats = trpc_1.trpc.activityTrail.getStats.useQuery({}).data;
    var _h = trpc_1.trpc.activityTrail.getActions.useQuery({}).data, actions = _h === void 0 ? [] : _h;
    var rawLogs = Array.isArray(rawData) ? rawData : ((_a = rawData) === null || _a === void 0 ? void 0 : _a.activities) || [];
    var logs = JSON.parse(JSON.stringify(rawLogs));
    var statsObj = rawStats;
    var stats = (statsObj === null || statsObj === void 0 ? void 0 : statsObj.actions) || (Array.isArray(rawStats) ? rawStats : []);
    var totalEvents = (_b = statsObj === null || statsObj === void 0 ? void 0 : statsObj.totalActivities) !== null && _b !== void 0 ? _b : logs.length;
    var topAction = stats.length > 0 ? ((_c = stats[0]) === null || _c === void 0 ? void 0 : _c.action) + ": " + ((_d = stats[0]) === null || _d === void 0 ? void 0 : _d.count) : "N/A";
    return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: "Audit Logs", description: "Track all system activity and user actions", icon: react_1["default"].createElement(lucide_react_1.FileText, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Administration", href: "/admin" },
            { label: "Audit Logs" },
        ] },
        react_1["default"].createElement("div", { className: "space-y-6" },
            react_1["default"].createElement("div", { className: "grid gap-4 md:grid-cols-3" },
                react_1["default"].createElement(stats_card_1.StatsCard, { label: "Total Events", value: totalEvents, description: "Loaded", color: "border-l-blue-500" }),
                react_1["default"].createElement(stats_card_1.StatsCard, { label: "Top Action", value: topAction, description: "Most frequent", color: "border-l-purple-500" }),
                react_1["default"].createElement(stats_card_1.StatsCard, { label: "Tracked Actions", value: actions.length, description: "Event types", color: "border-l-green-500" })),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardHeader, null,
                    react_1["default"].createElement(card_1.CardTitle, null, "Filters")),
                react_1["default"].createElement(card_1.CardContent, null,
                    react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                        react_1["default"].createElement("div", { className: "relative" },
                            react_1["default"].createElement(lucide_react_1.Search, { className: "absolute left-2 top-2.5 h-4 w-4 text-gray-400" }),
                            react_1["default"].createElement(input_1.Input, { placeholder: "Search logs...", value: search, onChange: function (e) { return setSearch(e.target.value); }, className: "pl-8" })),
                        react_1["default"].createElement(select_1.Select, { value: actionFilter, onValueChange: setActionFilter },
                            react_1["default"].createElement(select_1.SelectTrigger, null,
                                react_1["default"].createElement(select_1.SelectValue, { placeholder: "Filter by action" })),
                            react_1["default"].createElement(select_1.SelectContent, null,
                                react_1["default"].createElement(select_1.SelectItem, { value: "all" }, "All Actions"),
                                actions.map(function (a) { return (react_1["default"].createElement(select_1.SelectItem, { key: a, value: a }, a)); })))))),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardHeader, null,
                    react_1["default"].createElement(card_1.CardTitle, null, "Recent Audit Events")),
                react_1["default"].createElement(card_1.CardContent, null, isLoading ? (react_1["default"].createElement("p", { className: "text-center py-8 text-muted-foreground" }, "Loading...")) : (react_1["default"].createElement("div", { className: "overflow-x-auto" },
                    react_1["default"].createElement(table_1.Table, null,
                        react_1["default"].createElement(table_1.TableHeader, null,
                            react_1["default"].createElement(table_1.TableRow, null,
                                react_1["default"].createElement(table_1.TableHead, null, "Timestamp"),
                                react_1["default"].createElement(table_1.TableHead, null, "Action"),
                                react_1["default"].createElement(table_1.TableHead, null, "Entity Type"),
                                react_1["default"].createElement(table_1.TableHead, null, "Description"),
                                react_1["default"].createElement(table_1.TableHead, null, "User ID"))),
                        react_1["default"].createElement(table_1.TableBody, null, logs.length === 0 ? (react_1["default"].createElement(table_1.TableRow, null,
                            react_1["default"].createElement(table_1.TableCell, { colSpan: 5, className: "text-center py-8 text-muted-foreground" }, "No audit logs found"))) : (logs.map(function (log, i) { return (react_1["default"].createElement(table_1.TableRow, { key: log.id || i },
                            react_1["default"].createElement(table_1.TableCell, { className: "text-sm" }, log.timestamp ? new Date(log.timestamp).toLocaleString() : "—"),
                            react_1["default"].createElement(table_1.TableCell, null,
                                react_1["default"].createElement(badge_1.Badge, { variant: "outline" }, log.action || "—")),
                            react_1["default"].createElement(table_1.TableCell, { className: "text-sm" }, log.entityType || "—"),
                            react_1["default"].createElement(table_1.TableCell, { className: "text-sm max-w-xs truncate" }, log.description || "—"),
                            react_1["default"].createElement(table_1.TableCell, { className: "text-sm" }, getUserName(log.userId) || "—"))); })))))))))));
}
exports["default"] = AuditLogs;
