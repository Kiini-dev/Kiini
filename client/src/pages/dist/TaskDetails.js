"use strict";
exports.__esModule = true;
var wouter_1 = require("wouter");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var button_1 = require("@/components/ui/button");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var date_fns_1 = require("date-fns");
var statusColors = {
    todo: "bg-gray-100 text-gray-800",
    in_progress: "bg-blue-100 text-blue-800",
    review: "bg-yellow-100 text-yellow-800",
    completed: "bg-green-100 text-green-800",
    blocked: "bg-red-100 text-red-800"
};
var priorityColors = {
    low: "bg-gray-100 text-gray-700",
    medium: "bg-blue-100 text-blue-700",
    high: "bg-orange-100 text-orange-700",
    urgent: "bg-red-100 text-red-700"
};
function TaskDetails() {
    var _a, _b, _c, _d;
    var id = wouter_1.useParams().id;
    var _e = wouter_1.useLocation(), navigate = _e[1];
    var _f = trpc_1.trpc.projects.tasks.listAll.useQuery(), _g = _f.data, tasks = _g === void 0 ? [] : _g, isLoading = _f.isLoading;
    var _h = trpc_1.trpc.projects.list.useQuery().data, projectsList = _h === void 0 ? [] : _h;
    var _j = trpc_1.trpc.employees.list.useQuery().data, employeesList = _j === void 0 ? [] : _j;
    var task = tasks.find(function (t) { return t.id === id; });
    var project = task ? projectsList.find(function (p) { return p.id === task.projectId; }) : null;
    var assignee = task ? employeesList.find(function (e) { return e.id === task.assignedTo || e.userId === task.assignedTo; }) : null;
    if (isLoading) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Task Details" },
            React.createElement("div", { className: "flex justify-center py-20" },
                React.createElement(lucide_react_1.Loader2, { className: "h-6 w-6 animate-spin text-muted-foreground" }))));
    }
    if (!task) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Task Not Found" },
            React.createElement("div", { className: "flex flex-col items-center gap-4 py-20" },
                React.createElement(lucide_react_1.AlertCircle, { className: "h-10 w-10 text-muted-foreground" }),
                React.createElement("p", { className: "text-muted-foreground" }, "Task not found."),
                React.createElement(button_1.Button, { variant: "outline", onClick: function () { return navigate("/tasks"); } },
                    React.createElement(lucide_react_1.ArrowLeft, { className: "mr-2 h-4 w-4" }),
                    " Back to Tasks"))));
    }
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: task.title, description: project ? "Project: " + project.name : "Task Details", actions: React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return navigate("/tasks"); } },
            React.createElement(lucide_react_1.ArrowLeft, { className: "mr-2 h-4 w-4" }),
            " Back") },
        React.createElement("div", { className: "space-y-4" },
            React.createElement("div", { className: "flex flex-wrap gap-2" },
                React.createElement(badge_1.Badge, { className: statusColors[task.status] || "", variant: "outline" }, (_a = task.status) === null || _a === void 0 ? void 0 : _a.replace(/_/g, " ")),
                React.createElement(badge_1.Badge, { className: priorityColors[task.priority] || "", variant: "outline" },
                    task.priority,
                    " priority"),
                task.approvalStatus && (React.createElement(badge_1.Badge, { variant: "outline" }, (_b = task.approvalStatus) === null || _b === void 0 ? void 0 : _b.replace(/_/g, " "))),
                task.billable ? (React.createElement(badge_1.Badge, { className: "bg-green-50 text-green-700", variant: "outline" }, "Billable")) : (React.createElement(badge_1.Badge, { className: "bg-gray-50 text-gray-600", variant: "outline" }, "Non-billable"))),
            React.createElement("div", { className: "grid gap-4 md:grid-cols-2" },
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, { className: "text-base" }, "Task Information")),
                    React.createElement(card_1.CardContent, { className: "space-y-3 text-sm" },
                        task.description && (React.createElement("div", null,
                            React.createElement("p", { className: "text-xs text-muted-foreground mb-1" }, "Description"),
                            React.createElement("p", { className: "text-sm whitespace-pre-wrap" }, task.description))),
                        project && (React.createElement("div", { className: "flex items-center gap-2" },
                            React.createElement(lucide_react_1.Tag, { className: "h-4 w-4 text-muted-foreground shrink-0" }),
                            React.createElement("span", { className: "text-muted-foreground" }, "Project:"),
                            React.createElement("span", { className: "font-medium" }, project.name))),
                        assignee && (React.createElement("div", { className: "flex items-center gap-2" },
                            React.createElement(lucide_react_1.User, { className: "h-4 w-4 text-muted-foreground shrink-0" }),
                            React.createElement("span", { className: "text-muted-foreground" }, "Assignee:"),
                            React.createElement("span", { className: "font-medium" }, assignee.firstName && assignee.lastName
                                ? assignee.firstName + " " + assignee.lastName
                                : assignee.name || assignee.email || "—"))),
                        task.dueDate && (React.createElement("div", { className: "flex items-center gap-2" },
                            React.createElement(lucide_react_1.CalendarDays, { className: "h-4 w-4 text-muted-foreground shrink-0" }),
                            React.createElement("span", { className: "text-muted-foreground" }, "Due Date:"),
                            React.createElement("span", { className: "font-medium" }, date_fns_1.format(new Date(task.dueDate), "dd MMM yyyy")))),
                        task.targetDate && (React.createElement("div", { className: "flex items-center gap-2" },
                            React.createElement(lucide_react_1.CalendarDays, { className: "h-4 w-4 text-muted-foreground shrink-0" }),
                            React.createElement("span", { className: "text-muted-foreground" }, "Target Date:"),
                            React.createElement("span", { className: "font-medium" }, date_fns_1.format(new Date(task.targetDate), "dd MMM yyyy")))),
                        task.completedDate && (React.createElement("div", { className: "flex items-center gap-2" },
                            React.createElement(lucide_react_1.CheckCircle2, { className: "h-4 w-4 text-green-500 shrink-0" }),
                            React.createElement("span", { className: "text-muted-foreground" }, "Completed:"),
                            React.createElement("span", { className: "font-medium" }, date_fns_1.format(new Date(task.completedDate), "dd MMM yyyy")))))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, { className: "text-base" }, "Time & Effort")),
                    React.createElement(card_1.CardContent, { className: "space-y-3 text-sm" },
                        React.createElement("div", { className: "flex items-center gap-2" },
                            React.createElement(lucide_react_1.Clock, { className: "h-4 w-4 text-muted-foreground shrink-0" }),
                            React.createElement("span", { className: "text-muted-foreground" }, "Estimated Hours:"),
                            React.createElement("span", { className: "font-medium" }, (_c = task.estimatedHours) !== null && _c !== void 0 ? _c : "—")),
                        React.createElement("div", { className: "flex items-center gap-2" },
                            React.createElement(lucide_react_1.Clock, { className: "h-4 w-4 text-muted-foreground shrink-0" }),
                            React.createElement("span", { className: "text-muted-foreground" }, "Actual Hours:"),
                            React.createElement("span", { className: "font-medium" }, (_d = task.actualHours) !== null && _d !== void 0 ? _d : "—")),
                        task.tags && (React.createElement("div", null,
                            React.createElement("p", { className: "text-xs text-muted-foreground mb-1" }, "Tags"),
                            React.createElement("div", { className: "flex flex-wrap gap-1" }, task.tags.split(",").filter(Boolean).map(function (tag, i) { return (React.createElement(badge_1.Badge, { key: i, variant: "secondary", className: "text-xs" }, tag.trim())); }))))))),
            task.adminRemarks && (React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: "text-base" }, "Admin Remarks")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("p", { className: "text-sm whitespace-pre-wrap" }, task.adminRemarks)))),
            task.rejectionReason && (React.createElement(card_1.Card, { className: "border-red-200" },
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: "text-base text-red-700" }, "Rejection Reason")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("p", { className: "text-sm whitespace-pre-wrap" }, task.rejectionReason)))))));
}
exports["default"] = TaskDetails;
