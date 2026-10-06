"use strict";
exports.__esModule = true;
var react_1 = require("react");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var card_1 = require("@/components/ui/card");
var lucide_react_1 = require("lucide-react");
var table_1 = require("@/components/ui/table");
var stats_card_1 = require("@/components/ui/stats-card");
var trpc_1 = require("@/lib/trpc");
function getStatusLabel(status) {
    switch (status) {
        case "active": return "On Track";
        case "completed": return "Completed";
        case "on_hold": return "On Hold";
        case "planning": return "Planning";
        case "cancelled": return "Cancelled";
        default: return status;
    }
}
function getStatusColor(status) {
    switch (status) {
        case "active":
        case "completed":
            return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
        case "on_hold":
        case "planning":
            return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
        case "cancelled":
            return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
        default:
            return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
}
function ProjectAnalytics() {
    var _a = trpc_1.trpc.projects.list.useQuery({}), _b = _a.data, projectsList = _b === void 0 ? [] : _b, isLoading = _a.isLoading;
    var stats = react_1.useMemo(function () {
        var total = projectsList.length;
        var active = projectsList.filter(function (p) { return p.status === "active" || p.status === "completed"; }).length;
        var delayed = projectsList.filter(function (p) { return p.status === "on_hold" || p.status === "cancelled"; }).length;
        var avgProgress = total > 0
            ? Math.round(projectsList.reduce(function (sum, p) { return sum + (p.progress || 0); }, 0) / total)
            : 0;
        return [
            { label: "Total Projects", value: total, icon: lucide_react_1.BarChart3, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950" },
            { label: "On Schedule", value: active, icon: lucide_react_1.CheckCircle, color: "text-green-500", bg: "bg-green-50 dark:bg-green-950" },
            { label: "Delayed / On Hold", value: delayed, icon: lucide_react_1.AlertCircle, color: "text-red-500", bg: "bg-red-50 dark:bg-red-950" },
            { label: "Avg Progress (%)", value: avgProgress, icon: lucide_react_1.Clock, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-950" },
        ];
    }, [projectsList]);
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Project Analytics", description: "Track project performance, budgets, and timelines", icon: React.createElement(lucide_react_1.TrendingUp, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Reports" },
            { label: "Project Analytics" },
        ] },
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4" }, stats.map(function (stat) { return (React.createElement(stats_card_1.StatsCard, { key: stat.label, label: stat.label, value: stat.value, icon: React.createElement(stat.icon, { className: "h-5 w-5" }), iconBg: stat.bg })); })),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Project Performance Overview")),
                React.createElement(card_1.CardContent, null, isLoading ? (React.createElement("div", { className: "flex items-center justify-center py-12" },
                    React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin text-muted-foreground" }))) : projectsList.length === 0 ? (React.createElement("div", { className: "flex items-center justify-center py-12 text-muted-foreground" }, "No projects found")) : (React.createElement("div", { className: "overflow-x-auto" },
                    React.createElement(table_1.Table, { className: "w-full text-sm" },
                        React.createElement(table_1.TableHeader, null,
                            React.createElement(table_1.TableRow, { className: "border-b" },
                                React.createElement(table_1.TableHead, { className: "text-left py-3 px-4 font-medium" }, "Project"),
                                React.createElement(table_1.TableHead, { className: "text-left py-3 px-4 font-medium" }, "Budget (KSh)"),
                                React.createElement(table_1.TableHead, { className: "text-left py-3 px-4 font-medium" }, "Progress"),
                                React.createElement(table_1.TableHead, { className: "text-left py-3 px-4 font-medium" }, "Priority"),
                                React.createElement(table_1.TableHead, { className: "text-left py-3 px-4 font-medium" }, "Status"))),
                        React.createElement(table_1.TableBody, null, projectsList.map(function (project) { return (React.createElement(table_1.TableRow, { key: project.id, className: "border-b hover:bg-muted/50" },
                            React.createElement(table_1.TableCell, { className: "py-3 px-4 font-medium" }, project.name),
                            React.createElement(table_1.TableCell, { className: "py-3 px-4" }, (project.budget || 0).toLocaleString()),
                            React.createElement(table_1.TableCell, { className: "py-3 px-4" },
                                React.createElement("div", { className: "flex items-center gap-2" },
                                    React.createElement("div", { className: "flex-1 bg-muted rounded-full h-2 max-w-[100px]" },
                                        React.createElement("div", { className: "h-2 rounded-full bg-primary", style: { width: (project.progress || 0) + "%" } })),
                                    React.createElement("span", null,
                                        project.progress || 0,
                                        "%"))),
                            React.createElement(table_1.TableCell, { className: "py-3 px-4" },
                                React.createElement("span", { className: "capitalize" }, project.priority || "medium")),
                            React.createElement(table_1.TableCell, { className: "py-3 px-4" },
                                React.createElement("span", { className: "px-2 py-1 rounded-full text-xs font-medium " + getStatusColor(project.status) }, getStatusLabel(project.status))))); }))))))))));
}
exports["default"] = ProjectAnalytics;
