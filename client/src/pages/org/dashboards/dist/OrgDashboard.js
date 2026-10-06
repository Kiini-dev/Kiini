"use strict";
exports.__esModule = true;
var ModuleLayout_1 = require("@/components/ModuleLayout");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var wouter_1 = require("wouter");
var trpc_1 = require("@/lib/trpc");
var lucide_react_1 = require("lucide-react");
function Dashboard() {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    var _k = wouter_1.useLocation(), navigate = _k[1];
    var statsQuery = trpc_1.trpc.dashboard.stats.useQuery();
    var activityQuery = trpc_1.trpc.dashboard.recentActivity.useQuery({ limit: 10 });
    if (statsQuery.isLoading) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Dashboard", icon: React.createElement(lucide_react_1.LayoutDashboard, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard" }] },
            React.createElement("div", { className: "flex justify-center py-12" },
                React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin" }))));
    }
    if (statsQuery.error) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Dashboard", icon: React.createElement(lucide_react_1.LayoutDashboard, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard" }] },
            React.createElement("div", { className: "bg-red-50 text-red-700 p-4 rounded-lg" },
                "Error: ",
                statsQuery.error.message)));
    }
    var s = statsQuery.data;
    var activities = ((_a = activityQuery.data) !== null && _a !== void 0 ? _a : []);
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Dashboard", description: "Welcome back! Here's what's happening with your business.", icon: React.createElement(lucide_react_1.LayoutDashboard, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard" }], actions: React.createElement(button_1.Button, { onClick: function () { return navigate("/projects"); } },
            React.createElement(lucide_react_1.FolderKanban, { className: "mr-2 h-4 w-4" }),
            "New Project") },
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-4" },
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Total Revenue"),
                        React.createElement(lucide_react_1.DollarSign, { className: "h-4 w-4 text-muted-foreground" })),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "text-2xl font-bold" },
                            "Ksh ",
                            ((_b = s === null || s === void 0 ? void 0 : s.totalRevenue) !== null && _b !== void 0 ? _b : 0).toLocaleString()),
                        React.createElement("div", { className: "flex items-center gap-2 text-xs text-muted-foreground" },
                            React.createElement("span", { className: "flex items-center " + (((_c = s === null || s === void 0 ? void 0 : s.revenueGrowth) !== null && _c !== void 0 ? _c : 0) >= 0 ? "text-green-500" : "text-red-500") },
                                React.createElement(lucide_react_1.TrendingUp, { className: "mr-1 h-3 w-3" }), (_d = s === null || s === void 0 ? void 0 : s.revenueGrowth) !== null && _d !== void 0 ? _d : 0,
                                "%"),
                            React.createElement("span", null, "vs last month")))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Active Projects"),
                        React.createElement(lucide_react_1.FolderKanban, { className: "h-4 w-4 text-muted-foreground" })),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "text-2xl font-bold" }, (_e = s === null || s === void 0 ? void 0 : s.activeProjects) !== null && _e !== void 0 ? _e : 0),
                        React.createElement("div", { className: "text-xs text-muted-foreground" },
                            "+", (_f = s === null || s === void 0 ? void 0 : s.newProjects) !== null && _f !== void 0 ? _f : 0,
                            " new this month"))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Total Clients"),
                        React.createElement(lucide_react_1.Users, { className: "h-4 w-4 text-muted-foreground" })),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "text-2xl font-bold" }, (_g = s === null || s === void 0 ? void 0 : s.totalClients) !== null && _g !== void 0 ? _g : 0),
                        React.createElement("div", { className: "text-xs text-muted-foreground" },
                            "+", (_h = s === null || s === void 0 ? void 0 : s.newClients) !== null && _h !== void 0 ? _h : 0,
                            " new this month"))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Pending Invoices"),
                        React.createElement(lucide_react_1.FileText, { className: "h-4 w-4 text-muted-foreground" })),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "text-2xl font-bold" }, (_j = s === null || s === void 0 ? void 0 : s.pendingInvoices) !== null && _j !== void 0 ? _j : 0),
                        React.createElement("div", { className: "text-xs text-muted-foreground" }, "Awaiting payment")))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement("div", { className: "flex items-center justify-between" },
                        React.createElement("div", null,
                            React.createElement(card_1.CardTitle, null, "Recent Activity"),
                            React.createElement(card_1.CardDescription, null, "Latest updates and changes")))),
                React.createElement(card_1.CardContent, null, activities.length === 0 ? (React.createElement("p", { className: "text-center text-gray-500 py-8" }, "No data found.")) : (React.createElement("div", { className: "space-y-4" }, activities.map(function (activity, index) {
                    var _a, _b, _c, _d;
                    return (React.createElement("div", { key: (_a = activity.id) !== null && _a !== void 0 ? _a : index, className: "flex gap-3" },
                        React.createElement("div", { className: "flex h-9 w-9 items-center justify-center rounded-full bg-muted" },
                            React.createElement(lucide_react_1.FileText, { className: "h-4 w-4" })),
                        React.createElement("div", { className: "flex-1 space-y-1" },
                            React.createElement("p", { className: "text-sm font-medium" }, (_b = activity.action) !== null && _b !== void 0 ? _b : "—"),
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, (_c = activity.description) !== null && _c !== void 0 ? _c : "—"),
                            React.createElement("div", { className: "flex items-center gap-1 text-xs text-muted-foreground" },
                                React.createElement(lucide_react_1.Clock, { className: "h-3 w-3" }), (_d = activity.createdAt) !== null && _d !== void 0 ? _d : "—"))));
                }))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Quick Actions"),
                    React.createElement(card_1.CardDescription, null, "Common tasks and shortcuts")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "grid gap-4 md:grid-cols-4" },
                        React.createElement(button_1.Button, { variant: "outline", className: "h-auto flex-col gap-2 py-4", onClick: function () { return navigate("/clients"); } },
                            React.createElement(lucide_react_1.Users, { className: "h-6 w-6" }),
                            React.createElement("span", null, "Add Client")),
                        React.createElement(button_1.Button, { variant: "outline", className: "h-auto flex-col gap-2 py-4", onClick: function () { return navigate("/projects"); } },
                            React.createElement(lucide_react_1.FolderKanban, { className: "h-6 w-6" }),
                            React.createElement("span", null, "New Project")),
                        React.createElement(button_1.Button, { variant: "outline", className: "h-auto flex-col gap-2 py-4", onClick: function () { return navigate("/invoices"); } },
                            React.createElement(lucide_react_1.FileText, { className: "h-6 w-6" }),
                            React.createElement("span", null, "Create Invoice")),
                        React.createElement(button_1.Button, { variant: "outline", className: "h-auto flex-col gap-2 py-4", onClick: function () { return navigate("/estimates"); } },
                            React.createElement(lucide_react_1.FileSpreadsheet, { className: "h-6 w-6" }),
                            React.createElement("span", null, "New Estimate")),
                        React.createElement(button_1.Button, { variant: "outline", className: "h-auto flex-col gap-2 py-4", onClick: function () { return navigate("/receipts"); } },
                            React.createElement(lucide_react_1.Receipt, { className: "h-6 w-6" }),
                            React.createElement("span", null, "New Receipt"))))))));
}
exports["default"] = Dashboard;
