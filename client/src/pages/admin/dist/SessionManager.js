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
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var badge_1 = require("@/components/ui/badge");
var stats_card_1 = require("@/components/ui/stats-card");
var use_toast_1 = require("@/components/ui/use-toast");
function SessionManager() {
    var _a;
    var _b = permissions_1.useRequireRole(["ict_manager", "super_admin", "admin"]), allowed = _b.allowed, roleLoading = _b.isLoading;
    var toast = use_toast_1.useToast().toast;
    var _c = react_1.useState(""), searchTerm = _c[0], setSearchTerm = _c[1];
    var _d = react_1.useState("all"), filterStatus = _d[0], setFilterStatus = _d[1];
    var sessionsQ = trpc_1.trpc.ictManagement.getActiveSessions.useQuery({}, {
        refetchInterval: 15000
    });
    var terminateSession = trpc_1.trpc.ictManagement.terminateSession.useMutation({
        onSuccess: function () {
            toast({ title: "Session Terminated" });
            sessionsQ.refetch();
        },
        onError: function (err) {
            toast({ title: "Failed", description: err.message, variant: "destructive" });
        }
    });
    var allSessions = (_a = sessionsQ.data) !== null && _a !== void 0 ? _a : [];
    var filteredSessions = allSessions.filter(function (s) {
        var matchesSearch = !searchTerm ||
            (s.userId || "").toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.userAgent || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.ipAddress || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.organizationName || "").toLowerCase().includes(searchTerm.toLowerCase());
        var matchesStatus = filterStatus === "all" || true; // All returned sessions are active
        return matchesSearch && matchesStatus;
    });
    var formatTimeAgo = function (date) {
        if (!date)
            return "—";
        var seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
        if (seconds < 60)
            return seconds + "s ago";
        if (seconds < 3600)
            return Math.floor(seconds / 60) + "m ago";
        if (seconds < 86400)
            return Math.floor(seconds / 3600) + "h ago";
        return Math.floor(seconds / 86400) + "d ago";
    };
    var getStatusColor = function (s) {
        if (!s.lastActivity)
            return "bg-gray-100 text-gray-800";
        var idleMinutes = (Date.now() - new Date(s.lastActivity).getTime()) / 60000;
        if (idleMinutes < 15)
            return "bg-green-100 text-green-800";
        if (idleMinutes < 60)
            return "bg-yellow-100 text-yellow-800";
        return "bg-gray-100 text-gray-800";
    };
    var getStatusLabel = function (s) {
        if (!s.lastActivity)
            return "Unknown";
        var idleMinutes = (Date.now() - new Date(s.lastActivity).getTime()) / 60000;
        if (idleMinutes < 15)
            return "Active";
        if (idleMinutes < 60)
            return "Idle";
        return "Inactive";
    };
    if (roleLoading) {
        return React.createElement("div", { className: "flex items-center justify-center h-screen" },
            React.createElement(spinner_1.Spinner, { className: "size-8" }));
    }
    if (!allowed)
        return null;
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Active Sessions", description: "Monitor and manage user login sessions", icon: React.createElement(lucide_react_1.Monitor, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/dashboard" },
            { label: "ICT", href: "/dashboards/ict" },
            { label: "Sessions" },
        ] },
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "grid gap-4 md:grid-cols-3" },
                React.createElement(stats_card_1.StatsCard, { label: "Total Sessions", value: allSessions.length, description: "Active sessions", icon: React.createElement(lucide_react_1.Globe, { className: "h-5 w-5 text-green-500" }), color: "border-l-green-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Recent Active", value: allSessions.filter(function (s) { return s.lastActivity && (Date.now() - new Date(s.lastActivity).getTime()) < 900000; }).length, description: "Active in last 15 min", icon: React.createElement(lucide_react_1.Clock, { className: "h-5 w-5 text-yellow-500" }), color: "border-l-yellow-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Filtered", value: filteredSessions.length, description: "Matching your filters", icon: React.createElement(lucide_react_1.Monitor, { className: "h-5 w-5" }), color: "border-l-blue-500" })),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                        React.createElement(lucide_react_1.Filter, { className: "w-5 h-5" }),
                        " Filters & Actions")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "flex flex-col md:flex-row gap-4" },
                        React.createElement("div", { className: "flex-1 relative" },
                            React.createElement(lucide_react_1.Search, { className: "w-4 h-4 text-muted-foreground absolute left-3 top-3" }),
                            React.createElement(input_1.Input, { placeholder: "Search by user, IP, organization...", value: searchTerm, onChange: function (e) { return setSearchTerm(e.target.value); }, className: "pl-9" })),
                        React.createElement(button_1.Button, { variant: "outline", className: "gap-2", onClick: function () { return sessionsQ.refetch(); } },
                            React.createElement(lucide_react_1.RefreshCw, { className: "w-4 h-4" }),
                            " Refresh")))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "User Sessions"),
                    React.createElement(card_1.CardDescription, null,
                        "Showing ",
                        filteredSessions.length,
                        " of ",
                        allSessions.length,
                        " sessions")),
                React.createElement(card_1.CardContent, null, sessionsQ.isLoading ? (React.createElement("div", { className: "flex justify-center py-8" },
                    React.createElement(spinner_1.Spinner, { className: "size-6" }))) : (React.createElement("div", { className: "overflow-x-auto" },
                    React.createElement("table", { className: "w-full text-sm" },
                        React.createElement("thead", null,
                            React.createElement("tr", { className: "border-b" },
                                React.createElement("th", { className: "text-left py-3 px-4" }, "User / Organization"),
                                React.createElement("th", { className: "text-left py-3 px-4" }, "Device"),
                                React.createElement("th", { className: "text-left py-3 px-4" }, "IP Address"),
                                React.createElement("th", { className: "text-left py-3 px-4" }, "Last Active"),
                                React.createElement("th", { className: "text-left py-3 px-4" }, "Status"),
                                React.createElement("th", { className: "text-right py-3 px-4" }, "Actions"))),
                        React.createElement("tbody", null, filteredSessions.length > 0 ? (filteredSessions.map(function (session) { return (React.createElement("tr", { key: session.id, className: "border-b hover:bg-muted/50" },
                            React.createElement("td", { className: "py-3 px-4" },
                                React.createElement("p", { className: "font-medium" },
                                    "User #",
                                    session.userId),
                                session.organizationName && React.createElement("p", { className: "text-xs text-muted-foreground" }, session.organizationName)),
                            React.createElement("td", { className: "py-3 px-4" },
                                React.createElement("p", { className: "text-sm truncate max-w-[200px]", title: session.userAgent }, session.userAgent || "—")),
                            React.createElement("td", { className: "py-3 px-4" },
                                React.createElement("p", { className: "text-sm" }, session.ipAddress || "—")),
                            React.createElement("td", { className: "py-3 px-4" },
                                React.createElement("p", { className: "text-sm" }, formatTimeAgo(session.lastActivity))),
                            React.createElement("td", { className: "py-3 px-4" },
                                React.createElement(badge_1.Badge, { variant: "outline", className: getStatusColor(session) }, getStatusLabel(session))),
                            React.createElement("td", { className: "py-3 px-4 text-right" },
                                React.createElement(dropdown_menu_1.DropdownMenu, null,
                                    React.createElement(dropdown_menu_1.DropdownMenuTrigger, { asChild: true },
                                        React.createElement(button_1.Button, { variant: "ghost", size: "sm" },
                                            React.createElement(lucide_react_1.MoreVertical, { className: "w-4 h-4" }))),
                                    React.createElement(dropdown_menu_1.DropdownMenuContent, { align: "end" },
                                        React.createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return terminateSession.mutate({ sessionId: session.id }); }, className: "flex items-center gap-2 text-red-600" },
                                            React.createElement(lucide_react_1.LogOut, { className: "w-4 h-4" }),
                                            " Terminate Session")))))); })) : (React.createElement("tr", null,
                            React.createElement("td", { colSpan: 6, className: "py-8 px-4 text-center text-muted-foreground" }, "No sessions found"))))))))))));
}
exports["default"] = SessionManager;
