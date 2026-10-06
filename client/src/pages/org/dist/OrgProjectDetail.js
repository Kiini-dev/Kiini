"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var OrgLayout_1 = require("@/components/OrgLayout");
var OrgBreadcrumb_1 = require("@/components/OrgBreadcrumb");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var skeleton_1 = require("@/components/ui/skeleton");
var dialog_1 = require("@/components/ui/dialog");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var RichTextEditor_1 = require("@/components/RichTextEditor");
var select_1 = require("@/components/ui/select");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
var TASK_STATUSES = ["todo", "in_progress", "review", "completed", "blocked"];
var STATUS_META = {
    todo: { label: "To Do", color: "text-slate-400", headerBg: "bg-slate-500/10 border-slate-500/20", icon: lucide_react_1.Circle },
    in_progress: { label: "In Progress", color: "text-blue-400", headerBg: "bg-blue-500/10 border-blue-500/20", icon: lucide_react_1.Loader2 },
    review: { label: "Review", color: "text-purple-400", headerBg: "bg-purple-500/10 border-purple-500/20", icon: lucide_react_1.Eye },
    completed: { label: "Completed", color: "text-green-400", headerBg: "bg-green-500/10 border-green-500/20", icon: lucide_react_1.CheckCircle2 },
    blocked: { label: "Blocked", color: "text-red-400", headerBg: "bg-red-500/10 border-red-500/20", icon: lucide_react_1.AlertTriangle }
};
var PRIORITY_STYLES = {
    low: "bg-slate-500/15 text-slate-300 border-slate-500/20",
    medium: "bg-blue-500/15 text-blue-300 border-blue-500/20",
    high: "bg-amber-500/15 text-amber-300 border-amber-500/20",
    urgent: "bg-red-500/15 text-red-300 border-red-500/20"
};
var STATUS_STYLES = {
    active: "bg-green-500/20 text-green-300 border-green-500/30",
    planning: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    "on-hold": "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    completed: "bg-slate-500/20 text-slate-300 border-slate-500/30",
    cancelled: "bg-red-500/20 text-red-300 border-red-500/30"
};
function ProjectStatusBadge(_a) {
    var _b;
    var status = _a.status;
    var s = (status !== null && status !== void 0 ? status : "planning").toLowerCase();
    return (react_1["default"].createElement("span", { className: "inline-flex px-2 py-0.5 rounded text-xs font-medium border capitalize " + ((_b = STATUS_STYLES[s]) !== null && _b !== void 0 ? _b : "bg-white/10 text-white/60 border-white/20") }, s));
}
function PriorityBadge(_a) {
    var _b;
    var priority = _a.priority;
    var p = (priority !== null && priority !== void 0 ? priority : "medium").toLowerCase();
    return (react_1["default"].createElement("span", { className: "inline-flex px-2 py-0.5 rounded text-xs font-medium border capitalize " + ((_b = PRIORITY_STYLES[p]) !== null && _b !== void 0 ? _b : "bg-white/10 text-white/60 border-white/20") }, p));
}
function OrgProjectDetail() {
    var _a;
    var params = wouter_1.useParams();
    var slug = params.slug;
    var projectId = params.id;
    var _b = wouter_1.useLocation(), setLocation = _b[1];
    var _c = react_1.useState(null), draggedId = _c[0], setDraggedId = _c[1];
    var _d = react_1.useState(null), dragSource = _d[0], setDragSource = _d[1];
    var _e = react_1.useState(false), createOpen = _e[0], setCreateOpen = _e[1];
    var _f = react_1.useState("todo"), createStatus = _f[0], setCreateStatus = _f[1];
    var _g = react_1.useState({ title: "", description: "", priority: "medium", dueDate: "" }), form = _g[0], setForm = _g[1];
    var projectQuery = trpc_1.trpc.projects.getById.useQuery(projectId, { staleTime: 60000, enabled: !!projectId });
    var tasksQuery = trpc_1.trpc.projects.tasks.list.useQuery({ projectId: projectId }, { staleTime: 30000, enabled: !!projectId });
    var createTask = trpc_1.trpc.projects.tasks.create.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Task created");
            tasksQuery.refetch();
            setCreateOpen(false);
            setForm({ title: "", description: "", priority: "medium", dueDate: "" });
        },
        onError: function (e) { return sonner_1.toast.error(e.message || "Failed to create task"); }
    });
    var updateTask = trpc_1.trpc.projects.tasks.update.useMutation({
        onSuccess: function () { tasksQuery.refetch(); },
        onError: function (e) { return sonner_1.toast.error(e.message || "Failed to update task"); }
    });
    var project = projectQuery.data;
    var tasks = ((_a = tasksQuery.data) !== null && _a !== void 0 ? _a : []);
    var tasksByStatus = function (status) { return tasks.filter(function (t) { return t.status === status; }); };
    var handleDragStart = function (e, taskId, status) {
        setDraggedId(taskId);
        setDragSource(status);
        e.dataTransfer.effectAllowed = "move";
    };
    var handleDrop = function (e, targetStatus) {
        e.preventDefault();
        if (!draggedId || dragSource === targetStatus) {
            setDraggedId(null);
            return;
        }
        updateTask.mutate({ id: draggedId, status: targetStatus });
        setDraggedId(null);
        setDragSource(null);
    };
    var openCreateFor = function (status) {
        setCreateStatus(status);
        setCreateOpen(true);
    };
    var handleCreate = function () {
        if (!form.title) {
            sonner_1.toast.error("Task title is required");
            return;
        }
        createTask.mutate({
            projectId: projectId,
            title: form.title,
            description: form.description || undefined,
            status: createStatus,
            priority: form.priority,
            dueDate: form.dueDate ? form.dueDate : undefined
        });
    };
    // Stats
    var totalTasks = tasks.length;
    var completedTasks = tasks.filter(function (t) { return t.status === "completed"; }).length;
    var overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    if (projectQuery.isLoading) {
        return (react_1["default"].createElement(OrgLayout_1["default"], { title: "Project" },
            react_1["default"].createElement("div", { className: "space-y-4" },
                react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-8 w-56 bg-white/5" }),
                react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-24 bg-white/5 rounded-xl" }),
                react_1["default"].createElement("div", { className: "flex gap-3 overflow-x-auto" }, Array.from({ length: 5 }).map(function (_, i) { return react_1["default"].createElement(skeleton_1.Skeleton, { key: i, className: "h-64 w-52 shrink-0 bg-white/5 rounded-xl" }); })))));
    }
    if (!project) {
        return (react_1["default"].createElement(OrgLayout_1["default"], { title: "Project Not Found" },
            react_1["default"].createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
                react_1["default"].createElement(card_1.CardContent, { className: "py-16 text-center" },
                    react_1["default"].createElement(lucide_react_1.AlertCircle, { className: "h-10 w-10 text-white/20 mx-auto mb-3" }),
                    react_1["default"].createElement("p", { className: "text-white font-medium" }, "Project not found"),
                    react_1["default"].createElement(button_1.Button, { className: "mt-4", variant: "ghost", onClick: function () { return setLocation("/org/" + slug + "/projects"); } },
                        react_1["default"].createElement(lucide_react_1.ArrowLeft, { className: "h-4 w-4 mr-1" }),
                        " Back to Projects")))));
    }
    var pct = Math.min(100, Math.max(0, Number(project.progress || overallProgress)));
    return (react_1["default"].createElement(OrgLayout_1["default"], { title: project.name || "Project" },
        react_1["default"].createElement("div", { className: "space-y-5" },
            react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                react_1["default"].createElement(OrgBreadcrumb_1["default"], { slug: slug, items: [
                        { label: "Projects", href: "/org/" + slug + "/projects" },
                        { label: project.name },
                    ] }),
                react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", className: "text-white/50 hover:text-white", onClick: function () { return setLocation("/org/" + slug + "/projects"); } },
                    react_1["default"].createElement(lucide_react_1.ArrowLeft, { className: "h-4 w-4 mr-1" }),
                    " Back")),
            react_1["default"].createElement("div", { className: "p-5 rounded-xl bg-gradient-to-r from-blue-600/10 to-teal-600/10 border border-white/10" },
                react_1["default"].createElement("div", { className: "flex flex-col sm:flex-row sm:items-start justify-between gap-4" },
                    react_1["default"].createElement("div", { className: "flex-1" },
                        react_1["default"].createElement("div", { className: "flex items-center gap-3 flex-wrap" },
                            react_1["default"].createElement("h1", { className: "text-lg font-bold text-white" }, project.name),
                            react_1["default"].createElement(ProjectStatusBadge, { status: project.status }),
                            react_1["default"].createElement(PriorityBadge, { priority: project.priority })),
                        project.description && (react_1["default"].createElement("p", { className: "text-sm text-white/50 mt-2 max-w-xl" }, project.description)),
                        react_1["default"].createElement("div", { className: "flex items-center gap-4 mt-3 text-xs text-white/40" },
                            project.startDate && (react_1["default"].createElement("span", null,
                                "Start: ",
                                new Date(project.startDate).toLocaleDateString("en-KE", { month: "short", day: "numeric", year: "numeric" }))),
                            project.endDate && (react_1["default"].createElement("span", null,
                                "Due: ",
                                new Date(project.endDate).toLocaleDateString("en-KE", { month: "short", day: "numeric", year: "numeric" }))),
                            project.budget && (react_1["default"].createElement("span", null,
                                "Budget: KES ",
                                Number(project.budget).toLocaleString())))),
                    react_1["default"].createElement(button_1.Button, { size: "sm", className: "bg-blue-600 hover:bg-blue-700 shrink-0", onClick: function () { return openCreateFor("todo"); } },
                        react_1["default"].createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-1" }),
                        " Add Task")),
                react_1["default"].createElement("div", { className: "mt-4" },
                    react_1["default"].createElement("div", { className: "flex items-center justify-between text-xs text-white/40 mb-1.5" },
                        react_1["default"].createElement("span", null,
                            completedTasks,
                            "/",
                            totalTasks,
                            " tasks completed"),
                        react_1["default"].createElement("span", null,
                            pct,
                            "%")),
                    react_1["default"].createElement("div", { className: "h-2 bg-white/10 rounded-full overflow-hidden" },
                        react_1["default"].createElement("div", { className: "h-full rounded-full transition-all " + (pct === 100 ? "bg-green-500" : pct >= 60 ? "bg-blue-500" : pct >= 30 ? "bg-amber-500" : "bg-white/30"), style: { width: pct + "%" } })))),
            tasksQuery.isLoading ? (react_1["default"].createElement("div", { className: "flex gap-3 overflow-x-auto pb-2" }, Array.from({ length: 5 }).map(function (_, i) { return react_1["default"].createElement(skeleton_1.Skeleton, { key: i, className: "h-56 w-52 shrink-0 bg-white/5 rounded-xl" }); }))) : (react_1["default"].createElement("div", { className: "flex gap-3 overflow-x-auto pb-4", style: { minHeight: 350 } }, TASK_STATUSES.map(function (statusId) {
                var meta = STATUS_META[statusId];
                var StatusIcon = meta.icon;
                var colTasks = tasksByStatus(statusId);
                return (react_1["default"].createElement("div", { key: statusId, className: "shrink-0 w-52 sm:w-60 flex flex-col rounded-xl border bg-white/3 border-white/10", onDragOver: function (e) { return e.preventDefault(); }, onDrop: function (e) { return handleDrop(e, statusId); } },
                    react_1["default"].createElement("div", { className: "flex items-center justify-between px-3 py-2.5 rounded-t-xl border-b " + meta.headerBg },
                        react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                            react_1["default"].createElement(StatusIcon, { className: "h-3.5 w-3.5 " + meta.color }),
                            react_1["default"].createElement("p", { className: "text-xs font-semibold " + meta.color }, meta.label)),
                        react_1["default"].createElement("div", { className: "flex items-center gap-1" },
                            react_1["default"].createElement(badge_1.Badge, { variant: "outline", className: "border-white/10 text-white/40 text-[10px] h-5" }, colTasks.length),
                            react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "icon", className: "h-5 w-5 text-white/30 hover:text-white hover:bg-white/10", onClick: function () { return openCreateFor(statusId); } },
                                react_1["default"].createElement(lucide_react_1.Plus, { className: "h-3 w-3" })))),
                    react_1["default"].createElement("div", { className: "flex flex-col gap-2 p-2 flex-1 overflow-y-auto", style: { maxHeight: 500 } }, colTasks.length === 0 ? (react_1["default"].createElement("div", { className: "flex-1 flex flex-col items-center justify-center py-6 text-white/15 text-xs text-center gap-1" },
                        react_1["default"].createElement(lucide_react_1.Circle, { className: "h-5 w-5 opacity-30" }),
                        react_1["default"].createElement("span", null, "No tasks"))) : (colTasks.map(function (task) { return (react_1["default"].createElement("div", { key: task.id, draggable: true, onDragStart: function (e) { return handleDragStart(e, task.id, task.status); }, className: "group rounded-lg bg-white/5 border border-white/10 p-3 cursor-grab active:cursor-grabbing hover:bg-white/8 hover:border-white/20 transition-all " + (draggedId === task.id ? "opacity-40 scale-95" : "") },
                        react_1["default"].createElement("div", { className: "flex items-start justify-between gap-1.5" },
                            react_1["default"].createElement("p", { className: "text-xs font-medium text-white leading-snug line-clamp-3" }, task.title),
                            react_1["default"].createElement(lucide_react_1.GripVertical, { className: "h-3.5 w-3.5 text-white/20 shrink-0 mt-0.5 group-hover:text-white/40" })),
                        task.description && (react_1["default"].createElement("p", { className: "text-[10px] text-white/40 mt-1.5 line-clamp-2" }, task.description)),
                        react_1["default"].createElement("div", { className: "flex items-center justify-between mt-2" },
                            react_1["default"].createElement(PriorityBadge, { priority: task.priority }),
                            task.dueDate && (react_1["default"].createElement("span", { className: "text-[10px] " + (new Date(task.dueDate) < new Date() && task.status !== "completed" ? "text-red-400" : "text-white/40") }, new Date(task.dueDate).toLocaleDateString("en-KE", { month: "short", day: "numeric" })))),
                        task.estimatedHours && (react_1["default"].createElement("div", { className: "mt-1.5 flex items-center gap-1 text-[10px] text-white/30" },
                            react_1["default"].createElement(lucide_react_1.Clock, { className: "h-3 w-3" }),
                            react_1["default"].createElement("span", null,
                                task.estimatedHours,
                                "h"))))); })))));
            })))),
        react_1["default"].createElement(dialog_1.Dialog, { open: createOpen, onOpenChange: setCreateOpen },
            react_1["default"].createElement(dialog_1.DialogContent, { className: "max-w-md bg-[#1a1f2e] border-white/10" },
                react_1["default"].createElement(dialog_1.DialogHeader, null,
                    react_1["default"].createElement(dialog_1.DialogTitle, { className: "text-white" }, "New Task")),
                react_1["default"].createElement("div", { className: "space-y-3 mt-2" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement(label_1.Label, { className: "text-white/70 text-xs" }, "Status"),
                        react_1["default"].createElement(select_1.Select, { value: createStatus, onValueChange: function (v) { return setCreateStatus(v); } },
                            react_1["default"].createElement(select_1.SelectTrigger, { className: "mt-1 bg-white/5 border-white/10 text-white" },
                                react_1["default"].createElement(select_1.SelectValue, null)),
                            react_1["default"].createElement(select_1.SelectContent, null, TASK_STATUSES.map(function (s) { return (react_1["default"].createElement(select_1.SelectItem, { key: s, value: s }, STATUS_META[s].label)); })))),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement(label_1.Label, { className: "text-white/70 text-xs" }, "Title *"),
                        react_1["default"].createElement(input_1.Input, { className: "mt-1 bg-white/5 border-white/10 text-white placeholder:text-white/30", placeholder: "What needs to be done?", value: form.title, onChange: function (e) { return setForm(__assign(__assign({}, form), { title: e.target.value })); } })),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement(label_1.Label, { className: "text-white/70 text-xs" }, "Description"),
                        react_1["default"].createElement(RichTextEditor_1.RichTextEditor, { value: form.description, onChange: function (html) { return setForm(__assign(__assign({}, form), { description: html })); }, placeholder: "Optional notes...", minHeight: "80px", className: "mt-1" })),
                    react_1["default"].createElement("div", { className: "grid grid-cols-2 gap-3" },
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement(label_1.Label, { className: "text-white/70 text-xs" }, "Priority"),
                            react_1["default"].createElement(select_1.Select, { value: form.priority, onValueChange: function (v) { return setForm(__assign(__assign({}, form), { priority: v })); } },
                                react_1["default"].createElement(select_1.SelectTrigger, { className: "mt-1 bg-white/5 border-white/10 text-white" },
                                    react_1["default"].createElement(select_1.SelectValue, null)),
                                react_1["default"].createElement(select_1.SelectContent, null, ["low", "medium", "high", "urgent"].map(function (p) { return (react_1["default"].createElement(select_1.SelectItem, { key: p, value: p, className: "capitalize" }, p)); })))),
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement(label_1.Label, { className: "text-white/70 text-xs" }, "Due Date"),
                            react_1["default"].createElement(input_1.Input, { type: "date", className: "mt-1 bg-white/5 border-white/10 text-white", value: form.dueDate, onChange: function (e) { return setForm(__assign(__assign({}, form), { dueDate: e.target.value })); } }))),
                    react_1["default"].createElement("div", { className: "flex justify-end gap-2 pt-2" },
                        react_1["default"].createElement(button_1.Button, { variant: "ghost", className: "text-white/50", onClick: function () { return setCreateOpen(false); } }, "Cancel"),
                        react_1["default"].createElement(button_1.Button, { className: "bg-blue-600 hover:bg-blue-700", onClick: handleCreate, disabled: createTask.isPending }, createTask.isPending ? "Creating..." : "Create Task")))))));
}
exports["default"] = OrgProjectDetail;
