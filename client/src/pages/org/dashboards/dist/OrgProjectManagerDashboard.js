"use strict";
exports.__esModule = true;
var ModuleLayout_1 = require("@/components/ModuleLayout");
var card_1 = require("@/components/ui/card");
var useAuthWithPersistence_1 = require("@/_core/hooks/useAuthWithPersistence");
var react_1 = require("react");
var trpc_1 = require("@/lib/trpc");
var button_1 = require("@/components/ui/button");
var sonner_1 = require("sonner");
var budget_error_handler_1 = require("@/lib/budget-error-handler");
var wouter_1 = require("wouter");
var lucide_react_1 = require("lucide-react");
var stats_card_1 = require("@/components/ui/stats-card");
function ProjectManagerDashboard() {
    var _a = useAuthWithPersistence_1.useAuthWithPersistence({ redirectOnUnauthenticated: true }), user = _a.user, loading = _a.loading, isAuthenticated = _a.isAuthenticated, logout = _a.logout;
    var _b = wouter_1.useLocation(), setLocation = _b[1];
    var utils = trpc_1.trpc.useUtils();
    react_1.useEffect(function () {
        if (!loading && isAuthenticated && (user === null || user === void 0 ? void 0 : user.role) !== "project_manager" && (user === null || user === void 0 ? void 0 : user.role) !== "super_admin") {
            // Redirect handled elsewhere; silently return
            return;
        }
    }, [loading, isAuthenticated, user]);
    var _c = trpc_1.trpc.projects.list.useQuery(), _d = _c.data, projects = _d === void 0 ? [] : _d, projectsLoading = _c.isLoading;
    var _e = trpc_1.trpc.expenses.list.useQuery({ status: 'pending' }).data, pendingExpenses = _e === void 0 ? [] : _e;
    var _f = trpc_1.trpc.estimates.list.useQuery().data, allEstimates = _f === void 0 ? [] : _f;
    // Convert frozen objects to plain objects
    var projectsPlain = projects ? JSON.parse(JSON.stringify(projects)) : [];
    var pendingExpensesPlain = pendingExpenses ? JSON.parse(JSON.stringify(pendingExpenses)) : [];
    var allEstimatesPlain = allEstimates ? JSON.parse(JSON.stringify(allEstimates)) : [];
    // Filter projects assigned to or managed by current user
    var myProjects = Array.isArray(projectsPlain)
        ? projectsPlain.filter(function (p) { return p.projectManager === (user === null || user === void 0 ? void 0 : user.id) || p.assignedTo === (user === null || user === void 0 ? void 0 : user.id); })
        : [];
    // Derive team member IDs from projects (best-effort)
    var teamMemberIds = new Set();
    myProjects.forEach(function (p) {
        if (p.assignedTo)
            teamMemberIds.add(p.assignedTo);
        if (p.projectManager)
            teamMemberIds.add(p.projectManager);
    });
    // Pending estimates for PM (estimates.status === 'draft')
    var pendingEstimates = Array.isArray(allEstimatesPlain) ? allEstimatesPlain.filter(function (e) { return e.status === 'draft'; }) : [];
    var approveExpense = trpc_1.trpc.expenses.approve.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Expense approved");
            utils.expenses.list.invalidate();
        },
        onError: function (err) { if (budget_error_handler_1.handleBudgetError(err))
            return; sonner_1.toast.error((err === null || err === void 0 ? void 0 : err.message) || "Failed to approve expense"); }
    });
    var approveEstimate = trpc_1.trpc.approvals.approveEstimate.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Estimate approved");
            utils.estimates.list.invalidate();
        },
        onError: function (err) { return sonner_1.toast.error((err === null || err === void 0 ? void 0 : err.message) || "Failed to approve estimate"); }
    });
    if (loading)
        return React.createElement("div", { className: "min-h-screen flex items-center justify-center" }, "Loading...");
    if (!isAuthenticated)
        return null;
    // Feature cards for quick access
    var features = [
        {
            title: "Communications",
            description: "Email, SMS, and messaging",
            icon: lucide_react_1.Mail,
            href: "/communications",
            color: "text-indigo-500",
            bgColor: "bg-indigo-50 dark:bg-indigo-950"
        },
        {
            title: "Projects",
            description: "Manage and track all your projects",
            icon: lucide_react_1.FolderKanban,
            href: "/projects",
            color: "text-blue-500",
            bgColor: "bg-blue-50 dark:bg-blue-950"
        },
        {
            title: "Approvals",
            description: "Approve pending items",
            icon: lucide_react_1.FileText,
            href: "/approvals",
            color: "text-purple-500",
            bgColor: "bg-purple-50 dark:bg-purple-950"
        },
    ];
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Project Manager", description: "Oversee your projects, team assignments, and project approvals", icon: React.createElement(lucide_react_1.FolderKanban, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/dashboard" }, { label: "Project Management" }], actions: React.createElement("div", { className: "flex gap-2" },
            React.createElement(button_1.Button, { onClick: function () { return setLocation("/projects/management"); }, variant: "secondary", size: "sm", className: "gap-2" },
                React.createElement(lucide_react_1.Settings, { className: "w-4 h-4" }),
                "Project Management"),
            React.createElement(button_1.Button, { variant: "secondary", size: "sm", onClick: function () { return setLocation("/crm-home"); } }, "Go to Main Dashboard")) },
        React.createElement("div", { className: "space-y-8" },
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4" },
                React.createElement(stats_card_1.StatsCard, { label: "My Projects", value: myProjects.length, color: "border-l-purple-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Team Members", value: teamMemberIds.size, color: "border-l-green-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Pending Approvals", value: ((pendingExpensesPlain === null || pendingExpensesPlain === void 0 ? void 0 : pendingExpensesPlain.length) || 0) + ((pendingEstimates === null || pendingEstimates === void 0 ? void 0 : pendingEstimates.length) || 0), color: "border-l-blue-500" })),
            React.createElement("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3" }, features.map(function (feature) {
                var Icon = feature.icon;
                return (React.createElement(card_1.Card, { key: feature.href, className: "cursor-pointer hover:shadow-lg hover:shadow-primary/10 transition-all group hover:scale-105 border-2 hover:border-primary/50", onClick: function () { return setLocation(feature.href); } },
                    React.createElement(card_1.CardHeader, null,
                        React.createElement("div", { className: "flex items-center justify-between" },
                            React.createElement("div", { className: "p-3 rounded-lg " + feature.bgColor },
                                React.createElement(Icon, { className: "h-6 w-6 " + feature.color })),
                            React.createElement(lucide_react_1.ArrowRight, { className: "h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" })),
                        React.createElement(card_1.CardTitle, { className: "mt-4" }, feature.title),
                        React.createElement(card_1.CardDescription, null, feature.description)),
                    React.createElement(card_1.CardContent, null,
                        React.createElement(button_1.Button, { variant: "ghost", className: "w-full group-hover:bg-accent" },
                            "View ",
                            feature.title))));
            })),
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "My Projects"),
                        React.createElement(card_1.CardDescription, null, "Recent projects assigned to you")),
                    React.createElement(card_1.CardContent, null, projectsLoading ? (React.createElement("div", null, "Loading projects...")) : myProjects.length === 0 ? (React.createElement("div", { className: "text-sm text-slate-600" }, "No projects assigned to you yet.")) : (React.createElement("ul", { className: "space-y-3" }, myProjects.slice(0, 10).map(function (p) { return (React.createElement("li", { key: p.id, className: "border p-3 rounded" },
                        React.createElement("div", { className: "flex justify-between" },
                            React.createElement("div", null,
                                React.createElement("div", { className: "font-medium" }, p.name),
                                React.createElement("div", { className: "text-sm text-slate-500" },
                                    "Status: ",
                                    p.status,
                                    " \u2022 Progress: ",
                                    p.progress,
                                    "%")),
                            React.createElement("div", { className: "text-sm text-slate-500" }, p.projectNumber || p.id)))); }))))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, null, "Approvals"),
                        React.createElement(card_1.CardDescription, null, "Approve pending items")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "space-y-4" },
                            React.createElement("div", null,
                                React.createElement("div", { className: "text-sm font-medium" }, "Pending Expenses"),
                                pendingExpensesPlain.length === 0 ? (React.createElement("div", { className: "text-sm text-slate-600" }, "No pending expenses")) : (React.createElement("ul", { className: "space-y-2 mt-2" }, pendingExpensesPlain.slice(0, 6).map(function (exp) { return (React.createElement("li", { key: exp.id, className: "flex items-center justify-between border p-2 rounded" },
                                    React.createElement("div", { className: "text-sm" },
                                        React.createElement("div", { className: "font-medium" }, exp.category || exp.description || exp.id),
                                        React.createElement("div", { className: "text-slate-500 text-xs" },
                                            "Amount: KES ",
                                            (exp.amount || 0) / 100)),
                                    React.createElement("div", { className: "flex items-center gap-2" },
                                        React.createElement(button_1.Button, { size: "sm", onClick: function () { return approveExpense.mutate({ id: exp.id }); } }, "Approve")))); })))),
                            React.createElement("div", null,
                                React.createElement("div", { className: "text-sm font-medium" }, "Pending Estimates"),
                                pendingEstimates.length === 0 ? (React.createElement("div", { className: "text-sm text-slate-600" }, "No pending estimates")) : (React.createElement("ul", { className: "space-y-2 mt-2" }, pendingEstimates.slice(0, 6).map(function (est) { return (React.createElement("li", { key: est.id, className: "flex items-center justify-between border p-2 rounded" },
                                    React.createElement("div", { className: "text-sm" },
                                        React.createElement("div", { className: "font-medium" }, est.title || est.estimateNumber || est.id),
                                        React.createElement("div", { className: "text-slate-500 text-xs" },
                                            "Total: KES ",
                                            (est.total || 0) / 100)),
                                    React.createElement("div", { className: "flex items-center gap-2" },
                                        React.createElement(button_1.Button, { size: "sm", onClick: function () { return approveEstimate.mutate({ id: est.id }); } }, "Approve")))); })))))))))));
}
exports["default"] = ProjectManagerDashboard;
