"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var permissions_1 = require("@/lib/permissions");
var spinner_1 = require("@/components/ui/spinner");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var card_1 = require("@/components/ui/card");
var table_1 = require("@/components/ui/table");
var badge_1 = require("@/components/ui/badge");
var dropdown_menu_1 = require("@/components/ui/dropdown-menu");
var sonner_1 = require("sonner");
var trpc_1 = require("@/lib/trpc");
var lucide_react_1 = require("lucide-react");
function Communications() {
    var _a, _b, _c;
    var _d = wouter_1.useLocation(), navigate = _d[1];
    var _e = permissions_1.useRequireFeature("communications:view"), allowed = _e.allowed, permissionLoading = _e.isLoading;
    var _f = react_1.useState("all"), selectedType = _f[0], setSelectedType = _f[1];
    var _g = react_1.useState("all"), selectedStatus = _g[0], setSelectedStatus = _g[1];
    var _h = react_1.useState(""), searchQuery = _h[0], setSearchQuery = _h[1];
    var _j = react_1.useState(new Set(["types", "status"])), expandedNodes = _j[0], setExpandedNodes = _j[1];
    var _k = react_1.useState("all"), dateFilter = _k[0], setDateFilter = _k[1];
    // Fetch communications - CALLED BEFORE CONDITIONAL RETURNS
    var communicationData = (((_c = (_b = (_a = trpc_1.trpc.communications) === null || _a === void 0 ? void 0 : _a.list) === null || _b === void 0 ? void 0 : _b.useQuery) === null || _c === void 0 ? void 0 : _c.call(_b, { limit: 1000, offset: 0 }, { enabled: true })) || { data: { communications: [] } }).data;
    if (permissionLoading) {
        return (React.createElement("div", { className: "min-h-screen flex items-center justify-center" },
            React.createElement(spinner_1.Spinner, null)));
    }
    if (!allowed) {
        return null;
    }
    var communicationsArray = (communicationData === null || communicationData === void 0 ? void 0 : communicationData.communications) || [];
    // Use plainCommunications directly without memoization to avoid hooks issues
    var plainCommunications = Array.isArray(communicationsArray)
        ? communicationsArray.map(function (comm) { return JSON.parse(JSON.stringify(comm)); })
        : [];
    // Calculate statistics directly
    var total = plainCommunications.length;
    var sent = plainCommunications.filter(function (c) { return c.status === "sent"; }).length;
    var pending = plainCommunications.filter(function (c) { return c.status === "pending"; }).length;
    var failed = plainCommunications.filter(function (c) { return c.status === "failed"; }).length;
    var emails = plainCommunications.filter(function (c) { return c.type === "email"; }).length;
    var sms = plainCommunications.filter(function (c) { return c.type === "sms"; }).length;
    var stats = { total: total, sent: sent, pending: pending, failed: failed, emails: emails, sms: sms };
    // Filter communications based on selected filters
    var filtered = __spreadArrays(plainCommunications);
    // Filter by type
    if (selectedType !== "all") {
        filtered = filtered.filter(function (c) { return c.type === selectedType; });
    }
    // Filter by status
    if (selectedStatus !== "all") {
        filtered = filtered.filter(function (c) { return c.status === selectedStatus; });
    }
    // Filter by search query
    if (searchQuery) {
        var query_1 = searchQuery.toLowerCase();
        filtered = filtered.filter(function (c) {
            var _a, _b, _c;
            return ((_a = c.recipient) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(query_1)) || ((_b = c.subject) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(query_1)) || ((_c = c.body) === null || _c === void 0 ? void 0 : _c.toLowerCase().includes(query_1));
        });
    }
    // Filter by date
    var now = new Date();
    if (dateFilter !== "all") {
        var startDate_1 = new Date();
        if (dateFilter === "today") {
            startDate_1.setHours(0, 0, 0, 0);
        }
        else if (dateFilter === "week") {
            startDate_1.setDate(startDate_1.getDate() - 7);
        }
        else if (dateFilter === "month") {
            startDate_1.setMonth(startDate_1.getMonth() - 1);
        }
        filtered = filtered.filter(function (c) {
            if (c.createdAt) {
                var date = new Date(c.createdAt);
                return date >= startDate_1 && date <= now;
            }
            return false;
        });
    }
    var filteredCommunications = filtered.sort(function (a, b) {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
    // Toggle node expansion
    var toggleNode = function (nodeId) {
        setExpandedNodes(function (prev) {
            var newSet = new Set(prev);
            if (newSet.has(nodeId)) {
                newSet["delete"](nodeId);
            }
            else {
                newSet.add(nodeId);
            }
            return newSet;
        });
    };
    // Navigation tree structure
    var navigationTree = [
        {
            id: "types",
            label: "Communication Types",
            icon: React.createElement(lucide_react_1.MessageSquare, { size: 16 }),
            type: "category",
            onClick: function () { },
            children: [
                {
                    id: "email",
                    label: "Emails",
                    icon: React.createElement(lucide_react_1.Mail, { size: 14 }),
                    count: stats.emails,
                    type: "subcategory",
                    onClick: function () { return setSelectedType("email"); }
                },
                {
                    id: "sms",
                    label: "SMS",
                    icon: React.createElement(lucide_react_1.Phone, { size: 14 }),
                    count: stats.sms,
                    type: "subcategory",
                    onClick: function () { return setSelectedType("sms"); }
                },
                {
                    id: "all-types",
                    label: "All Communications",
                    icon: React.createElement(lucide_react_1.MessageSquare, { size: 14 }),
                    count: stats.total,
                    type: "subcategory",
                    onClick: function () { return setSelectedType("all"); }
                },
            ]
        },
        {
            id: "status",
            label: "Communication Status",
            icon: React.createElement(lucide_react_1.Filter, { size: 16 }),
            type: "category",
            onClick: function () { },
            children: [
                {
                    id: "sent",
                    label: "Sent",
                    icon: React.createElement(lucide_react_1.CheckCircle, { size: 14 }),
                    count: stats.sent,
                    type: "subcategory",
                    onClick: function () { return setSelectedStatus("sent"); }
                },
                {
                    id: "pending",
                    label: "Pending",
                    icon: React.createElement(lucide_react_1.Clock, { size: 14 }),
                    count: stats.pending,
                    type: "subcategory",
                    onClick: function () { return setSelectedStatus("pending"); }
                },
                {
                    id: "failed",
                    label: "Failed",
                    icon: React.createElement(lucide_react_1.AlertCircle, { size: 14 }),
                    count: stats.failed,
                    type: "subcategory",
                    onClick: function () { return setSelectedStatus("failed"); }
                },
                {
                    id: "all-status",
                    label: "All Statuses",
                    icon: React.createElement(lucide_react_1.Filter, { size: 14 }),
                    count: stats.total,
                    type: "subcategory",
                    onClick: function () { return setSelectedStatus("all"); }
                },
            ]
        },
        {
            id: "date",
            label: "Time Period",
            icon: React.createElement(lucide_react_1.Calendar, { size: 16 }),
            type: "category",
            onClick: function () { },
            children: [
                {
                    id: "today",
                    label: "Today",
                    icon: React.createElement(lucide_react_1.Calendar, { size: 14 }),
                    type: "subcategory",
                    onClick: function () { return setDateFilter("today"); }
                },
                {
                    id: "week",
                    label: "Last 7 Days",
                    icon: React.createElement(lucide_react_1.Calendar, { size: 14 }),
                    type: "subcategory",
                    onClick: function () { return setDateFilter("week"); }
                },
                {
                    id: "month",
                    label: "Last 30 Days",
                    icon: React.createElement(lucide_react_1.Calendar, { size: 14 }),
                    type: "subcategory",
                    onClick: function () { return setDateFilter("month"); }
                },
                {
                    id: "all-dates",
                    label: "All Time",
                    icon: React.createElement(lucide_react_1.Calendar, { size: 14 }),
                    type: "subcategory",
                    onClick: function () { return setDateFilter("all"); }
                },
            ]
        },
    ];
    // Render tree node
    var renderTreeNode = function (node, depth) {
        var _a;
        if (depth === void 0) { depth = 0; }
        var isExpanded = expandedNodes.has(node.id);
        var hasChildren = node.children && node.children.length > 0;
        return (React.createElement("div", { key: node.id },
            React.createElement("div", { className: "flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-colors " + (depth === 0
                    ? "hover:bg-accent font-medium text-sm"
                    : selectedType === node.id ||
                        selectedStatus === node.id ||
                        dateFilter === node.id
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-muted text-sm"), onClick: function () {
                    if (hasChildren) {
                        toggleNode(node.id);
                    }
                    node.onClick();
                } },
                hasChildren && (React.createElement("span", { className: "flex items-center justify-center w-4" }, isExpanded ? React.createElement(lucide_react_1.ChevronDown, { size: 14 }) : React.createElement(lucide_react_1.ChevronRight, { size: 14 }))),
                !hasChildren && React.createElement("span", { className: "w-4" }),
                React.createElement("span", { className: "flex-shrink-0" }, node.icon),
                React.createElement("span", { className: "flex-1" }, node.label),
                node.count !== undefined && (React.createElement(badge_1.Badge, { variant: "outline", className: "ml-auto" }, node.count))),
            hasChildren && isExpanded && (React.createElement("div", { className: "ml-2 border-l border-border pl-2" }, (_a = node.children) === null || _a === void 0 ? void 0 : _a.map(function (child) { return renderTreeNode(child, depth + 1); })))));
    };
    // Status color and icon
    var getStatusBadge = function (status) {
        switch (status) {
            case "sent":
                return (React.createElement(badge_1.Badge, { className: "bg-green-100 text-green-800", variant: "outline" },
                    React.createElement(lucide_react_1.CheckCircle, { size: 12, className: "mr-1" }),
                    " Sent"));
            case "pending":
                return (React.createElement(badge_1.Badge, { className: "bg-yellow-100 text-yellow-800", variant: "outline" },
                    React.createElement(lucide_react_1.Clock, { size: 12, className: "mr-1" }),
                    " Pending"));
            case "failed":
                return (React.createElement(badge_1.Badge, { className: "bg-red-100 text-red-800", variant: "outline" },
                    React.createElement(lucide_react_1.AlertCircle, { size: 12, className: "mr-1" }),
                    " Failed"));
            default:
                return React.createElement(badge_1.Badge, { variant: "outline" }, status);
        }
    };
    // Type icon
    var getTypeIcon = function (type) {
        switch (type) {
            case "email":
                return React.createElement(lucide_react_1.Mail, { size: 14 });
            case "sms":
                return React.createElement(lucide_react_1.Phone, { size: 14 });
            default:
                return React.createElement(lucide_react_1.MessageSquare, { size: 14 });
        }
    };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Communications", description: "Track and manage all communications with clients and team", icon: React.createElement(lucide_react_1.MessageSquare, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/" },
            { label: "Communications" },
        ] },
        React.createElement("div", { className: "space-y-6" },
            React.createElement(dropdown_menu_1.DropdownMenu, null,
                React.createElement(dropdown_menu_1.DropdownMenuTrigger, { asChild: true },
                    React.createElement(button_1.Button, { variant: "outline", className: "gap-2" },
                        selectedType === "all" ? (React.createElement(lucide_react_1.MessageSquare, { size: 16 })) : selectedType === "email" ? (React.createElement(lucide_react_1.Mail, { size: 16 })) : (React.createElement(lucide_react_1.Phone, { size: 16 })),
                        selectedType === "all"
                            ? "All Communications"
                            : selectedType === "email"
                                ? "Emails"
                                : "SMS",
                        React.createElement(lucide_react_1.ChevronDown, { size: 14 }))),
                React.createElement(dropdown_menu_1.DropdownMenuContent, { align: "end", className: "w-48" },
                    React.createElement(dropdown_menu_1.DropdownMenuLabel, { className: "flex items-center gap-2" },
                        React.createElement(lucide_react_1.Filter, { size: 14 }),
                        "Communication Types"),
                    React.createElement(dropdown_menu_1.DropdownMenuSeparator, null),
                    React.createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return setSelectedType("email"); }, className: "cursor-pointer gap-2" },
                        React.createElement(lucide_react_1.Mail, { size: 14 }),
                        React.createElement("div", { className: "flex-1" },
                            React.createElement("div", null, "Emails"),
                            React.createElement("div", { className: "text-xs text-muted-foreground" },
                                stats.emails,
                                " total"))),
                    React.createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return setSelectedType("sms"); }, className: "cursor-pointer gap-2" },
                        React.createElement(lucide_react_1.Phone, { size: 14 }),
                        React.createElement("div", { className: "flex-1" },
                            React.createElement("div", null, "SMS"),
                            React.createElement("div", { className: "text-xs text-muted-foreground" },
                                stats.sms,
                                " total"))),
                    React.createElement(dropdown_menu_1.DropdownMenuSeparator, null),
                    React.createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return setSelectedType("all"); }, className: "cursor-pointer gap-2" },
                        React.createElement(lucide_react_1.MessageSquare, { size: 14 }),
                        React.createElement("div", { className: "flex-1" },
                            React.createElement("div", null, "All Communications"),
                            React.createElement("div", { className: "text-xs text-muted-foreground" },
                                stats.total,
                                " total"))))),
            React.createElement(dropdown_menu_1.DropdownMenu, null,
                React.createElement(dropdown_menu_1.DropdownMenuTrigger, { asChild: true },
                    React.createElement(button_1.Button, { variant: "outline", className: "gap-2" },
                        selectedStatus === "all" ? (React.createElement(lucide_react_1.Filter, { size: 16 })) : selectedStatus === "sent" ? (React.createElement(lucide_react_1.CheckCircle, { size: 16, className: "text-green-600" })) : selectedStatus === "pending" ? (React.createElement(lucide_react_1.Clock, { size: 16, className: "text-yellow-600" })) : (React.createElement(lucide_react_1.AlertCircle, { size: 16, className: "text-red-600" })),
                        selectedStatus === "all"
                            ? "All Statuses"
                            : selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1),
                        React.createElement(lucide_react_1.ChevronDown, { size: 14 }))),
                React.createElement(dropdown_menu_1.DropdownMenuContent, { align: "end", className: "w-48" },
                    React.createElement(dropdown_menu_1.DropdownMenuLabel, { className: "flex items-center gap-2" },
                        React.createElement(lucide_react_1.Filter, { size: 14 }),
                        "Status"),
                    React.createElement(dropdown_menu_1.DropdownMenuSeparator, null),
                    React.createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return setSelectedStatus("sent"); }, className: "cursor-pointer gap-2" },
                        React.createElement(lucide_react_1.CheckCircle, { size: 14, className: "text-green-600" }),
                        React.createElement("div", { className: "flex-1" },
                            React.createElement("div", null, "Sent"),
                            React.createElement("div", { className: "text-xs text-muted-foreground" },
                                stats.sent,
                                " total"))),
                    React.createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return setSelectedStatus("pending"); }, className: "cursor-pointer gap-2" },
                        React.createElement(lucide_react_1.Clock, { size: 14, className: "text-yellow-600" }),
                        React.createElement("div", { className: "flex-1" },
                            React.createElement("div", null, "Pending"),
                            React.createElement("div", { className: "text-xs text-muted-foreground" },
                                stats.pending,
                                " total"))),
                    React.createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return setSelectedStatus("failed"); }, className: "cursor-pointer gap-2" },
                        React.createElement(lucide_react_1.AlertCircle, { size: 14, className: "text-red-600" }),
                        React.createElement("div", { className: "flex-1" },
                            React.createElement("div", null, "Failed"),
                            React.createElement("div", { className: "text-xs text-muted-foreground" },
                                stats.failed,
                                " total"))),
                    React.createElement(dropdown_menu_1.DropdownMenuSeparator, null),
                    React.createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return setSelectedStatus("all"); }, className: "cursor-pointer gap-2" },
                        React.createElement(lucide_react_1.Filter, { size: 14 }),
                        React.createElement("div", null, "All Statuses")))),
            React.createElement(dropdown_menu_1.DropdownMenu, null,
                React.createElement(dropdown_menu_1.DropdownMenuTrigger, { asChild: true },
                    React.createElement(button_1.Button, { variant: "outline", className: "gap-2" },
                        React.createElement(lucide_react_1.Calendar, { size: 16 }),
                        dateFilter === "all"
                            ? "All Time"
                            : dateFilter === "today"
                                ? "Today"
                                : dateFilter === "week"
                                    ? "Last 7 Days"
                                    : "Last 30 Days",
                        React.createElement(lucide_react_1.ChevronDown, { size: 14 }))),
                React.createElement(dropdown_menu_1.DropdownMenuContent, { align: "end", className: "w-48" },
                    React.createElement(dropdown_menu_1.DropdownMenuLabel, { className: "flex items-center gap-2" },
                        React.createElement(lucide_react_1.Calendar, { size: 14 }),
                        "Time Period"),
                    React.createElement(dropdown_menu_1.DropdownMenuSeparator, null),
                    React.createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return setDateFilter("today"); }, className: "cursor-pointer" }, "Today"),
                    React.createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return setDateFilter("week"); }, className: "cursor-pointer" }, "Last 7 Days"),
                    React.createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return setDateFilter("month"); }, className: "cursor-pointer" }, "Last 30 Days"),
                    React.createElement(dropdown_menu_1.DropdownMenuSeparator, null),
                    React.createElement(dropdown_menu_1.DropdownMenuItem, { onClick: function () { return setDateFilter("all"); }, className: "cursor-pointer" }, "All Time"))),
            React.createElement(button_1.Button, { onClick: function () { return navigate("/communications/new"); } },
                React.createElement(lucide_react_1.Plus, { size: 16, className: "mr-2" }),
                " New Communication"),
            React.createElement("div", { className: "grid grid-cols-1 py-4 md:grid-cols-3 lg:grid-cols-5 gap-4" },
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, { className: "pb-3" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Total Communications")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "text-2xl font-bold" }, stats.total),
                        React.createElement("p", { className: "text-xs text-muted-foreground mt-1" }, "All communications"))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, { className: "pb-3" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium flex items-center gap-2" },
                            React.createElement(lucide_react_1.CheckCircle, { size: 16, className: "text-green-600" }),
                            " Sent")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "text-2xl font-bold text-green-600" }, stats.sent),
                        React.createElement("p", { className: "text-xs text-muted-foreground mt-1" },
                            ((stats.sent / stats.total) * 100).toFixed(0),
                            "% success rate"))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, { className: "pb-3" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium flex items-center gap-2" },
                            React.createElement(lucide_react_1.Clock, { size: 16, className: "text-yellow-600" }),
                            " Pending")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "text-2xl font-bold text-yellow-600" }, stats.pending),
                        React.createElement("p", { className: "text-xs text-muted-foreground mt-1" }, "Waiting to be sent"))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, { className: "pb-3" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium flex items-center gap-2" },
                            React.createElement(lucide_react_1.AlertCircle, { size: 16, className: "text-red-600" }),
                            " Failed")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "text-2xl font-bold text-red-600" }, stats.failed),
                        React.createElement("p", { className: "text-xs text-muted-foreground mt-1" }, "Requires attention"))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, { className: "pb-3" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium flex items-center gap-2" },
                            React.createElement(lucide_react_1.Mail, { size: 16, className: "text-blue-600" }),
                            " Messages")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "text-2xl font-bold" }, stats.emails + stats.sms),
                        React.createElement("p", { className: "text-xs text-muted-foreground mt-1" },
                            stats.emails,
                            " emails, ",
                            stats.sms,
                            " SMS")))),
            React.createElement("div", { className: "grid grid-cols-1 lg:grid-cols-4 gap-6" },
                React.createElement(card_1.Card, { className: "lg:col-span-1 h-fit" },
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                            React.createElement(lucide_react_1.Filter, { size: 18 }),
                            " Filters"),
                        React.createElement(card_1.CardDescription, null, "Navigate and filter communications")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "space-y-2" }, navigationTree.map(function (node) { return renderTreeNode(node); })),
                        React.createElement(button_1.Button, { variant: "outline", size: "sm", className: "w-full mt-4", onClick: function () {
                                setSelectedType("all");
                                setSelectedStatus("all");
                                setDateFilter("all");
                                setSearchQuery("");
                            } }, "Clear All Filters"))),
                React.createElement(card_1.Card, { className: "lg:col-span-3" },
                    React.createElement(card_1.CardHeader, null,
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", null,
                                React.createElement(card_1.CardTitle, null,
                                    "Communications List",
                                    filteredCommunications.length < communicationsArray.length && (React.createElement("span", { className: "text-sm text-muted-foreground ml-2" },
                                        "(",
                                        filteredCommunications.length,
                                        " of ",
                                        communicationsArray.length,
                                        ")"))),
                                React.createElement(card_1.CardDescription, null,
                                    filteredCommunications.length,
                                    " communication",
                                    filteredCommunications.length !== 1 ? "s" : ""))),
                        React.createElement("div", { className: "flex items-center gap-2 mt-4" },
                            React.createElement(lucide_react_1.Search, { size: 16, className: "text-muted-foreground" }),
                            React.createElement(input_1.Input, { placeholder: "Search by recipient, subject, or content...", value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); }, className: "flex-1" }))),
                    React.createElement(card_1.CardContent, null, filteredCommunications.length === 0 ? (React.createElement("div", { className: "text-center py-8" },
                        React.createElement(lucide_react_1.MessageSquare, { size: 32, className: "mx-auto text-muted-foreground mb-2" }),
                        React.createElement("p", { className: "text-muted-foreground" }, "No communications found"),
                        React.createElement("p", { className: "text-sm text-muted-foreground" }, "Try adjusting your filters or search criteria"))) : (React.createElement(table_1.Table, null,
                        React.createElement(table_1.TableHeader, null,
                            React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableHead, { className: "w-24" }, "Type"),
                                React.createElement(table_1.TableHead, null, "Recipient"),
                                React.createElement(table_1.TableHead, null, "Subject"),
                                React.createElement(table_1.TableHead, { className: "w-24" }, "Status"),
                                React.createElement(table_1.TableHead, { className: "w-32" }, "Date"),
                                React.createElement(table_1.TableHead, { className: "w-20 text-right" }, "Actions"))),
                        React.createElement(table_1.TableBody, null, filteredCommunications.map(function (comm) { return (React.createElement(table_1.TableRow, { key: comm.id, className: "hover:bg-muted/50" },
                            React.createElement(table_1.TableCell, { className: "font-medium" },
                                React.createElement("div", { className: "flex items-center gap-2" },
                                    getTypeIcon(comm.type),
                                    comm.type.toUpperCase())),
                            React.createElement(table_1.TableCell, { className: "font-mono text-sm" }, comm.recipient),
                            React.createElement(table_1.TableCell, { className: "max-w-xs truncate" }, comm.subject || "-"),
                            React.createElement(table_1.TableCell, null, getStatusBadge(comm.status)),
                            React.createElement(table_1.TableCell, { className: "text-sm text-muted-foreground" }, comm.createdAt
                                ? new Date(comm.createdAt).toLocaleDateString()
                                : "-"),
                            React.createElement(table_1.TableCell, { className: "text-right" },
                                React.createElement("div", { className: "flex items-center justify-end gap-1" },
                                    React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () {
                                            return navigate("/communications/" + comm.id);
                                        }, title: "View details" },
                                        React.createElement(lucide_react_1.Eye, { size: 14 })),
                                    comm.status === "failed" && (React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () {
                                            sonner_1.toast.promise(Promise.resolve(), {
                                                loading: "Retrying...",
                                                success: "Communication queued for resend",
                                                error: "Failed to retry"
                                            });
                                        }, title: "Retry sending" },
                                        React.createElement(lucide_react_1.RefreshCw, { size: 14 }))))))); }))))))))));
}
exports["default"] = Communications;
