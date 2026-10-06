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
var trpc_1 = require("@/lib/trpc");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var input_1 = require("@/components/ui/input");
var select_1 = require("@/components/ui/select");
var dialog_1 = require("@/components/ui/dialog");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var switch_1 = require("@/components/ui/switch");
var checkbox_1 = require("@/components/ui/checkbox");
var lucide_react_1 = require("lucide-react");
var export_utils_1 = require("@/lib/export-utils");
var sonner_1 = require("sonner");
var utils_1 = require("@/lib/utils");
var tooltip_1 = require("@/components/ui/tooltip");
var COLUMNS = [
    { id: "todo", label: "New", icon: React.createElement(lucide_react_1.Circle, { className: "h-4 w-4" }), color: "text-slate-600", bg: "bg-slate-100 dark:bg-slate-800/60" },
    { id: "in_progress", label: "In Progress", icon: React.createElement(lucide_react_1.Clock, { className: "h-4 w-4 text-blue-500" }), color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/40" },
    { id: "review", label: "Awaiting Feedback", icon: React.createElement(lucide_react_1.AlertCircle, { className: "h-4 w-4 text-amber-500" }), color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/40" },
    { id: "completed", label: "Completed", icon: React.createElement(lucide_react_1.CheckCircle2, { className: "h-4 w-4 text-emerald-500" }), color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
];
var PRIORITY_COLORS = {
    low: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    medium: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
    high: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400",
    urgent: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
};
function TaskCard(_a) {
    var _b;
    var task = _a.task, onMove = _a.onMove, onUpdate = _a.onUpdate, onView = _a.onView;
    var nextStatuses = {
        todo: "in_progress",
        in_progress: "review",
        review: "completed"
    };
    var next = nextStatuses[task.status];
    return (React.createElement("div", { className: "bg-card border border-border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow space-y-2 cursor-default" },
        React.createElement("div", { className: "flex items-start justify-between gap-2" },
            React.createElement("p", { className: "text-sm font-medium leading-snug flex-1" }, task.title),
            React.createElement("div", { className: "flex items-center gap-1" },
                React.createElement("button", { onClick: function () { return onView(task.id); }, className: "text-muted-foreground hover:text-primary transition-colors", title: "View details" },
                    React.createElement(lucide_react_1.Eye, { className: "h-3.5 w-3.5" })),
                React.createElement(badge_1.Badge, { variant: "outline", className: utils_1.cn("text-[10px] px-1.5 py-0.5 whitespace-nowrap font-medium border-0", PRIORITY_COLORS[task.priority]) },
                    React.createElement(lucide_react_1.Flag, { className: "h-2.5 w-2.5 mr-0.5" }),
                    task.priority))),
        task.description && (React.createElement("p", { className: "text-xs text-muted-foreground line-clamp-2" }, task.description)),
        React.createElement("div", { className: "flex items-center gap-2 flex-wrap" },
            task.projectName && (React.createElement("span", { className: "text-[10px] bg-primary/10 text-primary rounded px-1.5 py-0.5" }, task.projectName)),
            task.dueDate && (React.createElement("span", { className: "flex items-center gap-1 text-[10px] text-muted-foreground" },
                React.createElement(lucide_react_1.Calendar, { className: "h-3 w-3" }),
                new Date(task.dueDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }))),
            task.assignedTo && (React.createElement("span", { className: "flex items-center gap-1 text-[10px] text-muted-foreground" },
                React.createElement(lucide_react_1.User, { className: "h-3 w-3" })))),
        next && (React.createElement("button", { onClick: function () { return onMove(task.id, next); }, className: "w-full flex items-center justify-center gap-1 text-[11px] text-muted-foreground hover:text-primary hover:bg-primary/5 rounded py-1 transition-colors border border-dashed border-transparent hover:border-primary/30" },
            "Move to ", (_b = COLUMNS.find(function (c) { return c.id === next; })) === null || _b === void 0 ? void 0 :
            _b.label,
            " ",
            React.createElement(lucide_react_1.ArrowRight, { className: "h-3 w-3" })))));
}
function Tasks() {
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var _b = react_1.useState(""), search = _b[0], setSearch = _b[1];
    var _c = react_1.useState("all"), priorityFilter = _c[0], setPriorityFilter = _c[1];
    var _d = react_1.useState(false), createOpen = _d[0], setCreateOpen = _d[1];
    var _search = wouter_1.useSearch();
    react_1.useEffect(function () { if (new URLSearchParams(_search).get("action") === "create")
        setCreateOpen(true); }, []);
    var _e = react_1.useState({
        projectId: "",
        clientId: "",
        title: "",
        description: "",
        priority: "medium",
        dueDate: "",
        assignedTo: "",
        tags: "",
        targetDate: "",
        billable: true,
        visibleToClient: true
    }), newTask = _e[0], setNewTask = _e[1];
    var _f = react_1.useState("todo"), defaultStatus = _f[0], setDefaultStatus = _f[1];
    var _g = react_1.useState(false), showDescription = _g[0], setShowDescription = _g[1];
    var _h = react_1.useState(false), showMoreInfo = _h[0], setShowMoreInfo = _h[1];
    var _j = react_1.useState(false), showOptions = _j[0], setShowOptions = _j[1];
    // Fetch all tasks
    var _k = trpc_1.trpc.projects.tasks.listAll.useQuery(), _l = _k.data, rawTasks = _l === void 0 ? [] : _l, isLoading = _k.isLoading, refetch = _k.refetch;
    var _m = trpc_1.trpc.projects.list.useQuery().data, projectsList = _m === void 0 ? [] : _m;
    var _o = trpc_1.trpc.employees.list.useQuery().data, employeesList = _o === void 0 ? [] : _o;
    var _p = trpc_1.trpc.clients.list.useQuery().data, clientsList = _p === void 0 ? [] : _p;
    var updateTask = trpc_1.trpc.projects.tasks.update.useMutation({
        onSuccess: function () { sonner_1.toast.success("Task updated"); refetch(); },
        onError: function (e) { return sonner_1.toast.error(e.message || "Failed to update task"); }
    });
    var createTask = trpc_1.trpc.projects.tasks.create.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Task created");
            refetch();
            setCreateOpen(false);
            setNewTask({ projectId: "", clientId: "", title: "", description: "", priority: "medium", dueDate: "", assignedTo: "", tags: "", targetDate: "", billable: true, visibleToClient: true });
            setShowDescription(false);
            setShowMoreInfo(false);
            setShowOptions(false);
        },
        onError: function (e) { return sonner_1.toast.error(e.message || "Failed to create task"); }
    });
    var tasks = rawTasks;
    var filteredTasks = react_1.useMemo(function () {
        return tasks.filter(function (t) {
            if (search && !t.title.toLowerCase().includes(search.toLowerCase()))
                return false;
            if (priorityFilter !== "all" && t.priority !== priorityFilter)
                return false;
            return true;
        });
    }, [tasks, search, priorityFilter]);
    var columns = react_1.useMemo(function () {
        return COLUMNS.map(function (col) { return (__assign(__assign({}, col), { tasks: filteredTasks.filter(function (t) { return t.status === col.id; }) })); });
    }, [filteredTasks]);
    var handleMove = function (id, status) {
        updateTask.mutate({ id: id, status: status });
    };
    var handleCreate = function () {
        if (!newTask.title.trim())
            return sonner_1.toast.error("Task title is required");
        createTask.mutate({
            projectId: newTask.projectId || undefined,
            clientId: newTask.clientId || undefined,
            title: newTask.title,
            description: newTask.description || undefined,
            priority: newTask.priority,
            status: defaultStatus,
            dueDate: newTask.dueDate || undefined,
            assignedTo: newTask.assignedTo && newTask.assignedTo !== "__none__" ? newTask.assignedTo : undefined,
            tags: newTask.tags || undefined,
            targetDate: newTask.targetDate || undefined,
            billable: newTask.billable ? 1 : 0,
            visibleToClient: newTask.visibleToClient ? 1 : 0
        });
    };
    var totalByStatus = react_1.useMemo(function () {
        var counts = {};
        COLUMNS.forEach(function (c) { counts[c.id] = tasks.filter(function (t) { return t.status === c.id; }).length; });
        return counts;
    }, [tasks]);
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Tasks", description: "Manage and track all tasks across your projects", icon: React.createElement(lucide_react_1.CheckSquare, { className: "h-5 w-5" }) },
        React.createElement("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5" }, COLUMNS.map(function (col) { return (React.createElement("div", { key: col.id, className: utils_1.cn("rounded-xl p-3 border", col.bg) },
            React.createElement("div", { className: utils_1.cn("flex items-center gap-2 mb-1 text-sm font-medium", col.color) },
                col.icon,
                " ",
                col.label),
            React.createElement("p", { className: "text-2xl font-bold" }, totalByStatus[col.id] || 0))); })),
        React.createElement("div", { className: "flex flex-wrap items-center gap-3 mb-4" },
            React.createElement("div", { className: "relative flex-1 min-w-[200px]" },
                React.createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
                React.createElement(input_1.Input, { placeholder: "Search tasks...", value: search, onChange: function (e) { return setSearch(e.target.value); }, className: "pl-9" })),
            React.createElement(select_1.Select, { value: priorityFilter, onValueChange: setPriorityFilter },
                React.createElement(select_1.SelectTrigger, { className: "w-36" },
                    React.createElement(lucide_react_1.Filter, { className: "h-4 w-4 mr-2" }),
                    React.createElement(select_1.SelectValue, { placeholder: "Priority" })),
                React.createElement(select_1.SelectContent, null,
                    React.createElement(select_1.SelectItem, { value: "all" }, "All Priorities"),
                    React.createElement(select_1.SelectItem, { value: "low" }, "Low"),
                    React.createElement(select_1.SelectItem, { value: "medium" }, "Medium"),
                    React.createElement(select_1.SelectItem, { value: "high" }, "High"),
                    React.createElement(select_1.SelectItem, { value: "urgent" }, "Urgent"))),
            React.createElement(button_1.Button, { variant: "outline", onClick: function () { return export_utils_1.downloadCSV(filteredTasks, "tasks"); }, className: "gap-2" },
                React.createElement(lucide_react_1.Download, { className: "h-4 w-4" }),
                " Export CSV"),
            React.createElement(button_1.Button, { onClick: function () { setDefaultStatus("todo"); setCreateOpen(true); }, className: "gap-2" },
                React.createElement(lucide_react_1.Plus, { className: "h-4 w-4" }),
                " New Task")),
        isLoading ? (React.createElement("div", { className: "flex items-center justify-center py-20" },
            React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin text-muted-foreground" }))) : (React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 overflow-x-auto" }, columns.map(function (col) { return (React.createElement("div", { key: col.id, className: "flex flex-col gap-2 min-w-[220px]" },
            React.createElement("div", { className: utils_1.cn("flex items-center justify-between px-3 py-2 rounded-lg", col.bg) },
                React.createElement("div", { className: utils_1.cn("flex items-center gap-2 font-medium text-sm", col.color) },
                    col.icon,
                    React.createElement("span", null, col.label),
                    React.createElement("span", { className: "ml-1 rounded-full bg-background/70 text-foreground px-2 text-xs font-semibold" }, col.tasks.length)),
                React.createElement("button", { onClick: function () { setDefaultStatus(col.id); setCreateOpen(true); }, className: "rounded p-0.5 hover:bg-background/50 transition-colors", title: "Add task to " + col.label },
                    React.createElement(lucide_react_1.Plus, { className: "h-4 w-4" }))),
            React.createElement("div", { className: "flex flex-col gap-2 min-h-[100px]" },
                col.tasks.length === 0 && (React.createElement("div", { className: "flex flex-col items-center justify-center py-8 text-muted-foreground/50 border-2 border-dashed rounded-lg" },
                    React.createElement(lucide_react_1.LayoutGrid, { className: "h-6 w-6 mb-2" }),
                    React.createElement("span", { className: "text-xs" }, "No tasks"))),
                col.tasks.map(function (task) { return (React.createElement(TaskCard, { key: task.id, task: task, onMove: handleMove, onUpdate: refetch, onView: function (id) { return navigate("/tasks/" + id); } })); })))); }))),
        React.createElement(dialog_1.Dialog, { open: createOpen, onOpenChange: setCreateOpen },
            React.createElement(dialog_1.DialogContent, { className: "sm:max-w-xl max-h-[90vh] overflow-y-auto" },
                React.createElement(dialog_1.DialogHeader, null,
                    React.createElement(dialog_1.DialogTitle, null, "Add A New Task")),
                React.createElement("div", { className: "space-y-5 py-2" },
                    React.createElement("div", { className: "grid grid-cols-[140px_1fr] items-center gap-3" },
                        React.createElement(label_1.Label, { className: "text-sm text-muted-foreground" }, "Project"),
                        React.createElement(select_1.Select, { value: newTask.projectId, onValueChange: function (v) { return setNewTask(function (p) { return (__assign(__assign({}, p), { projectId: v === '__none__' ? '' : v })); }); } },
                            React.createElement(select_1.SelectTrigger, null,
                                React.createElement(select_1.SelectValue, { placeholder: "No project (standalone)" })),
                            React.createElement(select_1.SelectContent, null,
                                React.createElement(select_1.SelectItem, { value: "__none__" }, "No Project (Standalone)"),
                                projectsList.map(function (proj) { return (React.createElement(select_1.SelectItem, { key: proj.id, value: proj.id }, proj.name)); })))),
                    React.createElement("div", { className: "grid grid-cols-[140px_1fr] items-center gap-3" },
                        React.createElement(label_1.Label, { className: "text-sm text-muted-foreground" }, "Title*"),
                        React.createElement(input_1.Input, { placeholder: "", value: newTask.title, onChange: function (e) { return setNewTask(function (p) { return (__assign(__assign({}, p), { title: e.target.value })); }); } })),
                    React.createElement("div", { className: "grid grid-cols-[140px_1fr] items-center gap-3" },
                        React.createElement(label_1.Label, { className: "text-sm text-muted-foreground" }, "Status*"),
                        React.createElement(select_1.Select, { value: defaultStatus, onValueChange: function (v) { return setDefaultStatus(v); } },
                            React.createElement(select_1.SelectTrigger, null,
                                React.createElement(select_1.SelectValue, null)),
                            React.createElement(select_1.SelectContent, null, COLUMNS.map(function (c) { return (React.createElement(select_1.SelectItem, { key: c.id, value: c.id }, c.label)); })))),
                    React.createElement("div", { className: "grid grid-cols-[140px_1fr] items-center gap-3" },
                        React.createElement(label_1.Label, { className: "text-sm text-muted-foreground" }, "Priority*"),
                        React.createElement(select_1.Select, { value: newTask.priority, onValueChange: function (v) { return setNewTask(function (p) { return (__assign(__assign({}, p), { priority: v })); }); } },
                            React.createElement(select_1.SelectTrigger, null,
                                React.createElement(select_1.SelectValue, null)),
                            React.createElement(select_1.SelectContent, null,
                                React.createElement(select_1.SelectItem, { value: "low" }, "Low"),
                                React.createElement(select_1.SelectItem, { value: "medium" }, "Normal"),
                                React.createElement(select_1.SelectItem, { value: "high" }, "High"),
                                React.createElement(select_1.SelectItem, { value: "urgent" }, "Urgent")))),
                    React.createElement("div", { className: "grid grid-cols-[140px_1fr] items-center gap-3" },
                        React.createElement("div", { className: "flex items-center gap-1.5" },
                            React.createElement(label_1.Label, { className: "text-sm text-muted-foreground" }, "Assign Users"),
                            React.createElement(tooltip_1.TooltipProvider, null,
                                React.createElement(tooltip_1.Tooltip, null,
                                    React.createElement(tooltip_1.TooltipTrigger, { asChild: true },
                                        React.createElement(lucide_react_1.Info, { className: "h-3.5 w-3.5 text-rose-400 cursor-pointer" })),
                                    React.createElement(tooltip_1.TooltipContent, null,
                                        React.createElement("p", null, "Select a team member to assign this task to"))))),
                        React.createElement(select_1.Select, { value: newTask.assignedTo, onValueChange: function (v) { return setNewTask(function (p) { return (__assign(__assign({}, p), { assignedTo: v })); }); } },
                            React.createElement(select_1.SelectTrigger, { className: "bg-muted/30" },
                                React.createElement(select_1.SelectValue, { placeholder: "Select user..." })),
                            React.createElement(select_1.SelectContent, null,
                                React.createElement(select_1.SelectItem, { value: "__none__" }, "None"),
                                employeesList.map(function (emp) { return (React.createElement(select_1.SelectItem, { key: emp.id, value: emp.id },
                                    emp.firstName,
                                    " ",
                                    emp.lastName)); })))),
                    React.createElement("div", { className: "grid grid-cols-[140px_1fr] items-center gap-3" },
                        React.createElement("div", { className: "flex items-center gap-1.5" },
                            React.createElement(label_1.Label, { className: "text-sm text-muted-foreground" }, "Assign Client"),
                            React.createElement(tooltip_1.TooltipProvider, null,
                                React.createElement(tooltip_1.Tooltip, null,
                                    React.createElement(tooltip_1.TooltipTrigger, { asChild: true },
                                        React.createElement(lucide_react_1.Info, { className: "h-3.5 w-3.5 text-rose-400 cursor-pointer" })),
                                    React.createElement(tooltip_1.TooltipContent, null,
                                        React.createElement("p", null, "Select a client associated with this task"))))),
                        React.createElement(select_1.Select, { value: newTask.clientId || '', onValueChange: function (v) { return setNewTask(function (p) { return (__assign(__assign({}, p), { clientId: v === '__none__' ? '' : v })); }); } },
                            React.createElement(select_1.SelectTrigger, null,
                                React.createElement(select_1.SelectValue, { placeholder: "Select client..." })),
                            React.createElement(select_1.SelectContent, null, clientsList.map(function (client) { return (React.createElement(select_1.SelectItem, { key: client.id, value: client.id }, client.companyName || client.name || client.id)); })))),
                    React.createElement("hr", { className: "border-border" }),
                    React.createElement("div", { className: "flex items-center justify-between" },
                        React.createElement(label_1.Label, { className: "text-sm font-medium" }, "Description"),
                        React.createElement(switch_1.Switch, { checked: showDescription, onCheckedChange: setShowDescription })),
                    showDescription && (React.createElement(textarea_1.Textarea, { placeholder: "Enter task description...", value: newTask.description, onChange: function (e) { return setNewTask(function (p) { return (__assign(__assign({}, p), { description: e.target.value })); }); }, rows: 5, className: "min-h-[120px]" })),
                    React.createElement("div", { className: "flex items-center justify-between" },
                        React.createElement(label_1.Label, { className: "text-sm font-medium" }, "More Information"),
                        React.createElement(switch_1.Switch, { checked: showMoreInfo, onCheckedChange: setShowMoreInfo })),
                    showMoreInfo && (React.createElement("div", { className: "space-y-3 pl-2" },
                        React.createElement("div", { className: "grid grid-cols-[140px_1fr] items-center gap-3" },
                            React.createElement(label_1.Label, { className: "text-sm text-muted-foreground" }, "Due Date"),
                            React.createElement(input_1.Input, { type: "date", value: newTask.dueDate, onChange: function (e) { return setNewTask(function (p) { return (__assign(__assign({}, p), { dueDate: e.target.value })); }); } })))),
                    React.createElement("div", { className: "flex items-center justify-between" },
                        React.createElement(label_1.Label, { className: "text-sm font-medium" }, "Options"),
                        React.createElement(switch_1.Switch, { checked: showOptions, onCheckedChange: setShowOptions })),
                    showOptions && (React.createElement("div", { className: "space-y-3 pl-2" },
                        React.createElement("div", { className: "grid grid-cols-[140px_1fr] items-center gap-3" },
                            React.createElement(label_1.Label, { className: "text-sm text-muted-foreground" }, "Target Date"),
                            React.createElement(input_1.Input, { type: "date", value: newTask.targetDate, onChange: function (e) { return setNewTask(function (p) { return (__assign(__assign({}, p), { targetDate: e.target.value })); }); } })),
                        React.createElement("div", { className: "grid grid-cols-[140px_1fr] items-center gap-3" },
                            React.createElement(label_1.Label, { className: "text-sm text-muted-foreground" }, "Tags"),
                            React.createElement(input_1.Input, { placeholder: "Enter tags separated by commas...", value: newTask.tags, onChange: function (e) { return setNewTask(function (p) { return (__assign(__assign({}, p), { tags: e.target.value })); }); } })),
                        React.createElement("div", { className: "flex items-center gap-6" },
                            React.createElement("div", { className: "flex items-center gap-2" },
                                React.createElement(checkbox_1.Checkbox, { checked: newTask.visibleToClient, onCheckedChange: function (v) { return setNewTask(function (p) { return (__assign(__assign({}, p), { visibleToClient: !!v })); }); } }),
                                React.createElement(label_1.Label, { className: "text-sm text-muted-foreground" }, "Visible To Client")),
                            React.createElement("div", { className: "flex items-center gap-2" },
                                React.createElement(checkbox_1.Checkbox, { checked: newTask.billable, onCheckedChange: function (v) { return setNewTask(function (p) { return (__assign(__assign({}, p), { billable: !!v })); }); } }),
                                React.createElement(label_1.Label, { className: "text-sm text-muted-foreground" }, "Billable"))))),
                    React.createElement("p", { className: "text-xs text-muted-foreground font-semibold" }, "* Required")),
                React.createElement(dialog_1.DialogFooter, null,
                    React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setCreateOpen(false); } }, "Close"),
                    React.createElement(button_1.Button, { onClick: handleCreate, disabled: createTask.isPending, className: "bg-red-500 hover:bg-red-600 text-white" },
                        createTask.isPending && React.createElement(lucide_react_1.Loader2, { className: "h-4 w-4 mr-2 animate-spin" }),
                        "Submit"))))));
}
exports["default"] = Tasks;
