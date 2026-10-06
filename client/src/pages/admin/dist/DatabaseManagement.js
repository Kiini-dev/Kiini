"use strict";
exports.__esModule = true;
var permissions_1 = require("@/lib/permissions");
var spinner_1 = require("@/components/ui/spinner");
var trpc_1 = require("@/lib/trpc");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var stats_card_1 = require("@/components/ui/stats-card");
var badge_1 = require("@/components/ui/badge");
function formatBytes(bytes) {
    if (bytes === 0)
        return "0 B";
    var k = 1024;
    var sizes = ["B", "KB", "MB", "GB"];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(1) + " " + sizes[i];
}
function DatabaseManagement() {
    var _a = permissions_1.useRequireRole(["ict_manager", "super_admin"]), allowed = _a.allowed, roleLoading = _a.isLoading;
    var _b = react_1.useState(""), search = _b[0], setSearch = _b[1];
    var dbQ = trpc_1.trpc.ictManagement.getDatabaseInfo.useQuery({}, { refetchInterval: 30000 });
    var data = dbQ.data;
    if (roleLoading)
        return React.createElement("div", { className: "flex items-center justify-center h-screen" },
            React.createElement(spinner_1.Spinner, { className: "size-8" }));
    if (!allowed)
        return null;
    var filteredTables = ((data === null || data === void 0 ? void 0 : data.tables) || []).filter(function (t) {
        return !search || t.name.toLowerCase().includes(search.toLowerCase());
    });
    var totalDataSize = ((data === null || data === void 0 ? void 0 : data.tables) || []).reduce(function (s, t) { return s + (t.dataLength || 0); }, 0);
    var totalIndexSize = ((data === null || data === void 0 ? void 0 : data.tables) || []).reduce(function (s, t) { return s + (t.indexLength || 0); }, 0);
    var totalRows = ((data === null || data === void 0 ? void 0 : data.tables) || []).reduce(function (s, t) { return s + (t.rows || 0); }, 0);
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Database Management", description: "Monitor database health, tables, and statistics", icon: React.createElement(lucide_react_1.Database, { className: "h-5 w-5" }), breadcrumbs: [{ label: "ICT", href: "/crm/ict" }, { label: "Database" }] },
        React.createElement("div", { className: "space-y-6" }, dbQ.isLoading ? (React.createElement("div", { className: "flex justify-center p-12" },
            React.createElement(spinner_1.Spinner, { className: "size-8" }))) : !data ? (React.createElement(card_1.Card, null,
            React.createElement(card_1.CardContent, { className: "py-8 text-center text-muted-foreground" }, "Failed to load database info"))) : (React.createElement(React.Fragment, null,
            React.createElement("div", { className: "grid gap-4 md:grid-cols-4" },
                React.createElement(stats_card_1.StatsCard, { label: "Status", value: React.createElement(badge_1.Badge, { variant: data.status === "healthy" ? "default" : "destructive" }, data.status), icon: React.createElement(lucide_react_1.Activity, { className: "h-5 w-5" }), color: "border-l-green-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Tables", value: data.tables.length, icon: React.createElement(lucide_react_1.Table2, { className: "h-5 w-5" }), color: "border-l-blue-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Total Rows", value: totalRows.toLocaleString(), icon: React.createElement(lucide_react_1.Database, { className: "h-5 w-5" }), color: "border-l-purple-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Data Size", value: formatBytes(totalDataSize), icon: React.createElement(lucide_react_1.HardDrive, { className: "h-5 w-5" }), color: "border-l-orange-500" })),
            React.createElement("div", { className: "grid gap-6 md:grid-cols-2" },
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                            React.createElement(lucide_react_1.Server, { className: "h-5 w-5" }),
                            "Server Statistics")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "space-y-3" },
                            React.createElement("div", { className: "flex justify-between text-sm" },
                                React.createElement("span", null, "Active Connections"),
                                React.createElement(badge_1.Badge, { variant: "outline" }, data.activeConnections)),
                            React.createElement("div", { className: "flex justify-between text-sm" },
                                React.createElement("span", null, "Uptime"),
                                React.createElement(badge_1.Badge, { variant: "outline" },
                                    data.uptime,
                                    " hours")),
                            React.createElement("div", { className: "flex justify-between text-sm" },
                                React.createElement("span", null, "Total Queries"),
                                React.createElement(badge_1.Badge, { variant: "outline" }, data.totalQueries.toLocaleString())),
                            React.createElement("div", { className: "flex justify-between text-sm" },
                                React.createElement("span", null, "Slow Queries"),
                                React.createElement(badge_1.Badge, { variant: data.slowQueries > 100 ? "destructive" : "outline" }, data.slowQueries)),
                            React.createElement("div", { className: "flex justify-between text-sm" },
                                React.createElement("span", null, "Data Received"),
                                React.createElement(badge_1.Badge, { variant: "outline" }, formatBytes(data.bytesReceived))),
                            React.createElement("div", { className: "flex justify-between text-sm" },
                                React.createElement("span", null, "Data Sent"),
                                React.createElement(badge_1.Badge, { variant: "outline" }, formatBytes(data.bytesSent)))))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                            React.createElement(lucide_react_1.HardDrive, { className: "h-5 w-5" }),
                            "Storage Summary")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "space-y-3" },
                            React.createElement("div", { className: "flex justify-between text-sm" },
                                React.createElement("span", null, "Total Data Size"),
                                React.createElement(badge_1.Badge, { variant: "outline" }, formatBytes(totalDataSize))),
                            React.createElement("div", { className: "flex justify-between text-sm" },
                                React.createElement("span", null, "Total Index Size"),
                                React.createElement(badge_1.Badge, { variant: "outline" }, formatBytes(totalIndexSize))),
                            React.createElement("div", { className: "flex justify-between text-sm" },
                                React.createElement("span", null, "Combined Size"),
                                React.createElement(badge_1.Badge, { variant: "outline" }, formatBytes(totalDataSize + totalIndexSize))))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement("div", { className: "flex items-center justify-between" },
                        React.createElement("div", null,
                            React.createElement(card_1.CardTitle, null, "Database Tables"),
                            React.createElement(card_1.CardDescription, null,
                                data.tables.length,
                                " tables")),
                        React.createElement("div", { className: "flex gap-2" },
                            React.createElement("div", { className: "relative" },
                                React.createElement(lucide_react_1.Search, { className: "absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" }),
                                React.createElement(input_1.Input, { className: "pl-8 w-60", placeholder: "Search tables...", value: search, onChange: function (e) { return setSearch(e.target.value); } })),
                            React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return dbQ.refetch(); } },
                                React.createElement(lucide_react_1.RefreshCw, { className: "h-4 w-4" }))))),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "overflow-x-auto" },
                        React.createElement("table", { className: "w-full text-sm" },
                            React.createElement("thead", null,
                                React.createElement("tr", { className: "border-b text-left" },
                                    React.createElement("th", { className: "py-2 pr-4 font-medium" }, "Table"),
                                    React.createElement("th", { className: "py-2 pr-4 font-medium text-right" }, "Rows"),
                                    React.createElement("th", { className: "py-2 pr-4 font-medium text-right" }, "Data Size"),
                                    React.createElement("th", { className: "py-2 pr-4 font-medium text-right" }, "Index Size"),
                                    React.createElement("th", { className: "py-2 pr-4 font-medium" }, "Engine"),
                                    React.createElement("th", { className: "py-2 font-medium" }, "Collation"))),
                            React.createElement("tbody", null, filteredTables.map(function (t) { return (React.createElement("tr", { key: t.name, className: "border-b hover:bg-muted/50" },
                                React.createElement("td", { className: "py-2 pr-4 font-mono text-xs" }, t.name),
                                React.createElement("td", { className: "py-2 pr-4 text-right" }, t.rows.toLocaleString()),
                                React.createElement("td", { className: "py-2 pr-4 text-right" }, formatBytes(t.dataLength)),
                                React.createElement("td", { className: "py-2 pr-4 text-right" }, formatBytes(t.indexLength)),
                                React.createElement("td", { className: "py-2 pr-4" },
                                    React.createElement(badge_1.Badge, { variant: "outline", className: "text-xs" }, t.engine)),
                                React.createElement("td", { className: "py-2 text-xs text-muted-foreground" }, t.collation))); })))))))))));
}
exports["default"] = DatabaseManagement;
