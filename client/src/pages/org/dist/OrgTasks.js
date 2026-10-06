"use strict";
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var trpc_1 = require("@/lib/trpc");
var OrgLayout_1 = require("@/components/OrgLayout");
var OrgBreadcrumb_1 = require("@/components/OrgBreadcrumb");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var input_1 = require("@/components/ui/input");
var stats_card_1 = require("@/components/ui/stats-card");
var table_1 = require("@/components/ui/table");
var select_1 = require("@/components/ui/select");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var useOrgPermission_1 = require("@/hooks/useOrgPermission");
var date_fns_1 = require("date-fns");
function OrgTasks() {
    var params = wouter_1.useParams();
    var slug = params.slug;
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var hasPermission = useOrgPermission_1.useOrgPermission().hasPermission;
    var canCreate = hasPermission("tasks");
    var canEdit = hasPermission("tasks");
    var canDelete = hasPermission("tasks");
    var _b = react_1.useState(""), searchQuery = _b[0], setSearchQuery = _b[1];
    var _c = react_1.useState("all"), statusFilter = _c[0], setStatusFilter = _c[1];
    // Fetch tasks data
    var _d = trpc_1.trpc.tasks.list.useQuery(undefined), _e = _d.data, tasksData = _e === void 0 ? [] : _e, isLoadingTasks = _d.isLoading;
    var _f = trpc_1.trpc.employees.list.useQuery(undefined).data, employeesData = _f === void 0 ? [] : _f;
    var utils = trpc_1.trpc.useUtils();
    var deleteTaskMutation = trpc_1.trpc.tasks["delete"].useMutation({
        onSuccess: function () {
            var _a, _b;
            (_b = (_a = utils.tasks.list).invalidate) === null || _b === void 0 ? void 0 : _b.call(_a);
            sonner_1.toast.success("Task deleted successfully");
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to delete task");
        }
    });
    // Transform data
    var plainTasksData = Array.isArray(tasksData)
        ? tasksData.map(function (t) { return JSON.parse(JSON.stringify(t)); })
        : [];
    var plainEmployeesData = Array.isArray(employeesData)
        ? employeesData.map(function (e) { return JSON.parse(JSON.stringify(e)); })
        : [];
    var employeeMap = react_1.useMemo(function () {
        var map = {};
        plainEmployeesData.forEach(function (e) {
            map[e.id] = e.firstName + " " + e.lastName;
        });
        return map;
    }, [plainEmployeesData]);
    var tasks = react_1.useMemo(function () {
        return plainTasksData.map(function (t) { return ({
            id: t.id,
            title: t.title || t.name || "Untitled",
            assignee: employeeMap[t.assignedTo] || "Unassigned",
            dueDate: t.dueDate ? date_fns_1.format(new Date(t.dueDate), "yyyy-MM-dd") : "",
            priority: t.priority || "normal",
            status: t.status || "todo"
        }); });
    }, [plainTasksData, employeeMap]);
    var filtered = react_1.useMemo(function () {
        return tasks.filter(function (t) {
            var matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
            var matchesStatus = statusFilter === "all" || t.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [tasks, searchQuery, statusFilter]);
    var stats = react_1.useMemo(function () {
        var pending = tasks.filter(function (t) { return t.status === "todo" || t.status === "in-progress"; }).length;
        var completed = tasks.filter(function (t) { return t.status === "completed" || t.status === "done"; }).length;
        return { pending: pending, completed: completed, count: tasks.length };
    }, [tasks]);
    var handleView = function (id) {
        navigate("/org/" + slug + "/tasks/" + id);
    };
    var handleEdit = function (id) {
        navigate("/org/" + slug + "/tasks/" + id + "/edit");
    };
    var handleDelete = function (id) {
        if (confirm("Are you sure you want to delete this task?")) {
            deleteTaskMutation.mutate(id);
        }
    };
    var handleNewTask = function () {
        navigate("/org/" + slug + "/tasks/new");
    };
    return (React.createElement(OrgLayout_1["default"], null,
        React.createElement(OrgBreadcrumb_1["default"], { items: [
                { label: "Dashboard", href: "/org/" + slug + "/dashboard" },
                { label: "Tasks", href: "/org/" + slug + "/tasks" },
            ] }),
        React.createElement("div", { className: "p-6 space-y-6" },
            React.createElement("div", { className: "flex items-center justify-between" },
                React.createElement("div", null,
                    React.createElement("h1", { className: "text-3xl font-bold" }, "Tasks"),
                    React.createElement("p", { className: "text-muted-foreground mt-2" }, "Manage and track team tasks and assignments")),
                canCreate && (React.createElement(button_1.Button, { onClick: handleNewTask },
                    React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-2" }),
                    "New Task"))),
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4" },
                React.createElement(stats_card_1.StatsCard, { label: "Total Tasks", value: stats.count, icon: React.createElement(lucide_react_1.CheckSquare, { className: "h-4 w-4 text-blue-500" }), color: "border-l-blue-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Pending", value: stats.pending, icon: React.createElement(lucide_react_1.Clock, { className: "h-4 w-4 text-amber-500" }), color: "border-l-amber-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Completed", value: stats.completed, icon: React.createElement(lucide_react_1.CheckCircle2, { className: "h-4 w-4 text-emerald-500" }), color: "border-l-emerald-500" })),
            React.createElement("div", { className: "flex flex-wrap gap-3 items-center" },
                React.createElement("div", { className: "relative flex-1 min-w-[200px]" },
                    React.createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
                    React.createElement(input_1.Input, { placeholder: "Search by task title...", value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); }, className: "pl-9" })),
                React.createElement(select_1.Select, { value: statusFilter, onValueChange: setStatusFilter },
                    React.createElement(select_1.SelectTrigger, { className: "w-[140px]" },
                        React.createElement(select_1.SelectValue, { placeholder: "Status" })),
                    React.createElement(select_1.SelectContent, null,
                        React.createElement(select_1.SelectItem, { value: "all" }, "All Statuses"),
                        React.createElement(select_1.SelectItem, { value: "todo" }, "To Do"),
                        React.createElement(select_1.SelectItem, { value: "in-progress" }, "In Progress"),
                        React.createElement(select_1.SelectItem, { value: "completed" }, "Completed")))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Tasks List"),
                    React.createElement(card_1.CardDescription, null,
                        filtered.length,
                        " tasks")),
                React.createElement(card_1.CardContent, null, isLoadingTasks ? (React.createElement("div", { className: "flex justify-center py-8" },
                    React.createElement(lucide_react_1.Loader2, { className: "h-6 w-6 animate-spin text-muted-foreground" }))) : filtered.length === 0 ? (React.createElement("div", { className: "flex flex-col items-center justify-center py-8 text-muted-foreground" },
                    React.createElement(lucide_react_1.AlertCircle, { className: "h-8 w-8 mb-2 opacity-50" }),
                    React.createElement("p", null, "No tasks found"))) : (React.createElement("div", { className: "overflow-x-auto" },
                    React.createElement(table_1.Table, null,
                        React.createElement(table_1.TableHeader, null,
                            React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableHead, null, "Title"),
                                React.createElement(table_1.TableHead, null, "Assigned To"),
                                React.createElement(table_1.TableHead, null, "Due Date"),
                                React.createElement(table_1.TableHead, null, "Priority"),
                                React.createElement(table_1.TableHead, null, "Status"),
                                React.createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                        React.createElement(table_1.TableBody, null, filtered.map(function (task) { return (React.createElement(table_1.TableRow, { key: task.id },
                            React.createElement(table_1.TableCell, { className: "font-semibold" }, task.title),
                            React.createElement(table_1.TableCell, null, task.assignee),
                            React.createElement(table_1.TableCell, null, task.dueDate || "No date"),
                            React.createElement(table_1.TableCell, null,
                                React.createElement(badge_1.Badge, { variant: task.priority === "high"
                                        ? "destructive"
                                        : task.priority === "low"
                                            ? "secondary"
                                            : "outline" }, task.priority)),
                            React.createElement(table_1.TableCell, null,
                                React.createElement(badge_1.Badge, { variant: task.status === "completed" || task.status === "done"
                                        ? "default"
                                        : task.status === "in-progress"
                                            ? "secondary"
                                            : "outline" }, task.status)),
                            React.createElement(table_1.TableCell, { className: "text-right space-x-2" },
                                React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleView(task.id); }, title: "View" },
                                    React.createElement(lucide_react_1.Eye, { className: "h-4 w-4" })),
                                canEdit && (React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleEdit(task.id); }, title: "Edit" },
                                    React.createElement(lucide_react_1.Edit, { className: "h-4 w-4" }))),
                                canDelete && (React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleDelete(task.id); }, title: "Delete" },
                                    React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))))); }))))))))));
}
exports["default"] = OrgTasks;
