"use strict";
exports.__esModule = true;
var permissions_1 = require("@/lib/permissions");
var spinner_1 = require("@/components/ui/spinner");
var trpc_1 = require("@/lib/trpc");
var lucide_react_1 = require("lucide-react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var badge_1 = require("@/components/ui/badge");
var stats_card_1 = require("@/components/ui/stats-card");
function NetworkConfiguration() {
    var _a = permissions_1.useRequireRole(["super_admin"]), allowed = _a.allowed, roleLoading = _a.isLoading;
    var netQ = trpc_1.trpc.ictManagement.getNetworkConfig.useQuery({}, { refetchInterval: 60000 });
    var data = netQ.data;
    if (roleLoading)
        return React.createElement("div", { className: "flex items-center justify-center h-screen" },
            React.createElement(spinner_1.Spinner, { className: "size-8" }));
    if (!allowed)
        return null;
    var externalInterfaces = ((data === null || data === void 0 ? void 0 : data.interfaces) || []).filter(function (i) { return !i.internal; });
    var internalInterfaces = ((data === null || data === void 0 ? void 0 : data.interfaces) || []).filter(function (i) { return i.internal; });
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Network Configuration", description: "View network interfaces, DNS, SSL and connection settings", icon: React.createElement(lucide_react_1.Network, { className: "h-5 w-5" }), breadcrumbs: [{ label: "ICT", href: "/crm/ict" }, { label: "Network" }] },
        React.createElement("div", { className: "space-y-6" }, netQ.isLoading ? (React.createElement("div", { className: "flex justify-center p-12" },
            React.createElement(spinner_1.Spinner, { className: "size-8" }))) : !data ? (React.createElement(card_1.Card, null,
            React.createElement(card_1.CardContent, { className: "py-8 text-center text-muted-foreground" }, "Failed to load network info"))) : (React.createElement(React.Fragment, null,
            React.createElement("div", { className: "grid gap-4 md:grid-cols-4" },
                React.createElement(stats_card_1.StatsCard, { label: "Hostname", value: data.hostname, icon: React.createElement(lucide_react_1.Server, { className: "h-5 w-5" }), color: "border-l-blue-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Interfaces", value: data.interfaces.length, icon: React.createElement(lucide_react_1.Wifi, { className: "h-5 w-5" }), color: "border-l-green-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "SSL", value: data.ssl.enabled ? "Enabled" : "Disabled", icon: React.createElement(lucide_react_1.Lock, { className: "h-5 w-5" }), color: "border-l-purple-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "CORS", value: data.cors.enabled ? "Enabled" : "Disabled", icon: React.createElement(lucide_react_1.Shield, { className: "h-5 w-5" }), color: "border-l-orange-500" })),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                        React.createElement(lucide_react_1.Globe, { className: "h-5 w-5" }),
                        "External Network Interfaces"),
                    React.createElement(card_1.CardDescription, null, "Public-facing network addresses")),
                React.createElement(card_1.CardContent, null, externalInterfaces.length === 0 ? (React.createElement("p", { className: "text-muted-foreground text-sm" }, "No external interfaces found")) : (React.createElement("div", { className: "overflow-x-auto" },
                    React.createElement("table", { className: "w-full text-sm" },
                        React.createElement("thead", null,
                            React.createElement("tr", { className: "border-b text-left" },
                                React.createElement("th", { className: "py-2 pr-4 font-medium" }, "Interface"),
                                React.createElement("th", { className: "py-2 pr-4 font-medium" }, "Address"),
                                React.createElement("th", { className: "py-2 pr-4 font-medium" }, "Family"),
                                React.createElement("th", { className: "py-2 pr-4 font-medium" }, "Netmask"),
                                React.createElement("th", { className: "py-2 font-medium" }, "MAC"))),
                        React.createElement("tbody", null, externalInterfaces.map(function (iface, idx) { return (React.createElement("tr", { key: idx, className: "border-b hover:bg-muted/50" },
                            React.createElement("td", { className: "py-2 pr-4 font-mono text-xs" }, iface.interface),
                            React.createElement("td", { className: "py-2 pr-4 font-mono text-xs" }, iface.address),
                            React.createElement("td", { className: "py-2 pr-4" },
                                React.createElement(badge_1.Badge, { variant: "outline" }, iface.family)),
                            React.createElement("td", { className: "py-2 pr-4 font-mono text-xs" }, iface.netmask),
                            React.createElement("td", { className: "py-2 font-mono text-xs" }, iface.mac))); }))))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                        React.createElement(lucide_react_1.Network, { className: "h-5 w-5" }),
                        "Internal Interfaces (Loopback)")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "overflow-x-auto" },
                        React.createElement("table", { className: "w-full text-sm" },
                            React.createElement("thead", null,
                                React.createElement("tr", { className: "border-b text-left" },
                                    React.createElement("th", { className: "py-2 pr-4 font-medium" }, "Interface"),
                                    React.createElement("th", { className: "py-2 pr-4 font-medium" }, "Address"),
                                    React.createElement("th", { className: "py-2 pr-4 font-medium" }, "Family"),
                                    React.createElement("th", { className: "py-2 font-medium" }, "Netmask"))),
                            React.createElement("tbody", null, internalInterfaces.map(function (iface, idx) { return (React.createElement("tr", { key: idx, className: "border-b hover:bg-muted/50" },
                                React.createElement("td", { className: "py-2 pr-4 font-mono text-xs" }, iface.interface),
                                React.createElement("td", { className: "py-2 pr-4 font-mono text-xs" }, iface.address),
                                React.createElement("td", { className: "py-2 pr-4" },
                                    React.createElement(badge_1.Badge, { variant: "outline" }, iface.family)),
                                React.createElement("td", { className: "py-2 font-mono text-xs" }, iface.netmask))); })))))),
            React.createElement("div", { className: "grid gap-6 md:grid-cols-2" },
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                            React.createElement(lucide_react_1.Lock, { className: "h-5 w-5" }),
                            "SSL Configuration")),
                    React.createElement(card_1.CardContent, { className: "space-y-3" },
                        React.createElement("div", { className: "flex justify-between text-sm" },
                            React.createElement("span", null, "Status"),
                            React.createElement(badge_1.Badge, { variant: data.ssl.enabled ? "default" : "destructive" }, data.ssl.enabled ? "Active" : "Inactive")),
                        React.createElement("div", { className: "flex justify-between text-sm" },
                            React.createElement("span", null, "Provider"),
                            React.createElement("span", { className: "text-muted-foreground" }, data.ssl.provider)))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                            React.createElement(lucide_react_1.Shield, { className: "h-5 w-5" }),
                            "CORS Configuration")),
                    React.createElement(card_1.CardContent, { className: "space-y-3" },
                        React.createElement("div", { className: "flex justify-between text-sm" },
                            React.createElement("span", null, "Status"),
                            React.createElement(badge_1.Badge, { variant: data.cors.enabled ? "default" : "secondary" }, data.cors.enabled ? "Enabled" : "Disabled")),
                        React.createElement("div", { className: "flex justify-between text-sm" },
                            React.createElement("span", null, "Allowed Origins"),
                            React.createElement("span", { className: "text-muted-foreground font-mono text-xs" }, data.cors.origins.join(", ")))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                        React.createElement(lucide_react_1.Globe, { className: "h-5 w-5" }),
                        "DNS Configuration")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "flex flex-wrap gap-2" }, data.dns.servers.map(function (s, i) { return (React.createElement(badge_1.Badge, { key: i, variant: "outline", className: "font-mono" }, s)); })))),
            React.createElement("div", { className: "flex items-center justify-between text-xs text-muted-foreground" },
                React.createElement("span", null,
                    "Last updated: ",
                    new Date(data.timestamp).toLocaleTimeString()),
                React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return netQ.refetch(); } },
                    React.createElement(lucide_react_1.RefreshCw, { className: "h-4 w-4 mr-2" }),
                    "Refresh")))))));
}
exports["default"] = NetworkConfiguration;
