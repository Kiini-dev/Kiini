"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.ProjectTasksList = void 0;
var react_1 = require("react");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var button_1 = require("../ui/button");
var badge_1 = require("../ui/badge");
var table_1 = require("../ui/table");
var select_1 = require("../ui/select");
var lucide_react_1 = require("lucide-react");
function ProjectTasksList(_a) {
    var _this = this;
    var projectId = _a.projectId, tasks = _a.tasks, teamMembers = _a.teamMembers, _b = _a.isAdmin, isAdmin = _b === void 0 ? false : _b, onEdit = _a.onEdit, onDelete = _a.onDelete, onRefresh = _a.onRefresh;
    var _c = react_1.useState("all"), filterStatus = _c[0], setFilterStatus = _c[1];
    var _d = react_1.useState("all"), filterPriority = _d[0], setFilterPriority = _d[1];
    var _e = react_1.useState("all"), filterAssignee = _e[0], setFilterAssignee = _e[1];
    var _f = react_1.useState("all"), filterApproval = _f[0], setFilterApproval = _f[1];
    var deleteTaskMutation = trpc_1.trpc.projects.tasks["delete"].useMutation();
    // Filter tasks based on active filters
    var filteredTasks = tasks.filter(function (task) {
        if (filterStatus !== "all" && task.status !== filterStatus)
            return false;
        if (filterPriority !== "all" && task.priority !== filterPriority)
            return false;
        if (filterAssignee === "__unassigned__" && task.assignedTo)
            return false;
        if (filterAssignee !== "all" && filterAssignee !== "__unassigned__" && task.assignedTo !== filterAssignee)
            return false;
        if (filterApproval !== "all" && task.approvalStatus !== filterApproval)
            return false;
        return true;
    });
    var handleDelete = function (taskId) { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!confirm("Are you sure you want to delete this task?")) return [3 /*break*/, 4];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, deleteTaskMutation.mutateAsync(taskId)];
                case 2:
                    _a.sent();
                    onDelete === null || onDelete === void 0 ? void 0 : onDelete(taskId);
                    onRefresh === null || onRefresh === void 0 ? void 0 : onRefresh();
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error("Failed to delete task:", error_1);
                    sonner_1.toast.error("Failed to delete task");
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var getTeamMemberName = function (memberId) {
        if (!memberId)
            return "Unassigned";
        var member = teamMembers.find(function (m) { return m.id === memberId; });
        return (member === null || member === void 0 ? void 0 : member.name) || "Unknown";
    };
    var getPriorityColor = function (priority) {
        switch (priority) {
            case "urgent":
                return "bg-red-100 text-red-800";
            case "high":
                return "bg-orange-100 text-orange-800";
            case "medium":
                return "bg-yellow-100 text-yellow-800";
            case "low":
                return "bg-green-100 text-green-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };
    var getStatusIcon = function (status) {
        switch (status) {
            case "completed":
                return React.createElement(lucide_react_1.CheckCircle, { className: "h-4 w-4 text-green-600" });
            case "blocked":
                return React.createElement(lucide_react_1.AlertCircle, { className: "h-4 w-4 text-red-600" });
            case "in_progress":
                return React.createElement(lucide_react_1.Clock, { className: "h-4 w-4 text-blue-600" });
            default:
                return React.createElement(lucide_react_1.Clock, { className: "h-4 w-4 text-gray-400" });
        }
    };
    var getStatusColor = function (status) {
        switch (status) {
            case "todo":
                return "bg-gray-100 text-gray-800";
            case "in_progress":
                return "bg-blue-100 text-blue-800";
            case "review":
                return "bg-purple-100 text-purple-800";
            case "completed":
                return "bg-green-100 text-green-800";
            case "blocked":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };
    var getApprovalStatusColor = function (status) {
        switch (status) {
            case "approved":
                return "bg-green-50 text-green-700";
            case "rejected":
                return "bg-red-50 text-red-700";
            case "revision_requested":
                return "bg-yellow-50 text-yellow-700";
            default:
                return "bg-gray-50 text-gray-700";
        }
    };
    return (React.createElement("div", { className: "w-full space-y-4" },
        React.createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3" },
            React.createElement(select_1.Select, { value: filterStatus, onValueChange: setFilterStatus },
                React.createElement(select_1.SelectTrigger, { className: "h-8 text-xs" },
                    React.createElement(select_1.SelectValue, { placeholder: "Filter by status" })),
                React.createElement(select_1.SelectContent, null,
                    React.createElement(select_1.SelectItem, { value: "all" }, "All Statuses"),
                    React.createElement(select_1.SelectItem, { value: "todo" }, "To Do"),
                    React.createElement(select_1.SelectItem, { value: "in_progress" }, "In Progress"),
                    React.createElement(select_1.SelectItem, { value: "review" }, "In Review"),
                    React.createElement(select_1.SelectItem, { value: "completed" }, "Completed"),
                    React.createElement(select_1.SelectItem, { value: "blocked" }, "Blocked"))),
            React.createElement(select_1.Select, { value: filterPriority, onValueChange: setFilterPriority },
                React.createElement(select_1.SelectTrigger, { className: "h-8 text-xs" },
                    React.createElement(select_1.SelectValue, { placeholder: "Filter by priority" })),
                React.createElement(select_1.SelectContent, null,
                    React.createElement(select_1.SelectItem, { value: "all" }, "All Priorities"),
                    React.createElement(select_1.SelectItem, { value: "low" }, "Low"),
                    React.createElement(select_1.SelectItem, { value: "medium" }, "Medium"),
                    React.createElement(select_1.SelectItem, { value: "high" }, "High"),
                    React.createElement(select_1.SelectItem, { value: "urgent" }, "Urgent"))),
            React.createElement(select_1.Select, { value: filterAssignee, onValueChange: setFilterAssignee },
                React.createElement(select_1.SelectTrigger, { className: "h-8 text-xs" },
                    React.createElement(select_1.SelectValue, { placeholder: "Filter by assignee" })),
                React.createElement(select_1.SelectContent, null,
                    React.createElement(select_1.SelectItem, { value: "all" }, "All Assignees"),
                    React.createElement(select_1.SelectItem, { value: "__unassigned__" }, "Unassigned"),
                    teamMembers.map(function (member) { return (React.createElement(select_1.SelectItem, { key: member.id, value: member.id }, member.name)); }))),
            isAdmin && (React.createElement(select_1.Select, { value: filterApproval, onValueChange: setFilterApproval },
                React.createElement(select_1.SelectTrigger, { className: "h-8 text-xs" },
                    React.createElement(select_1.SelectValue, { placeholder: "Filter by approval" })),
                React.createElement(select_1.SelectContent, null,
                    React.createElement(select_1.SelectItem, { value: "all" }, "All Approvals"),
                    React.createElement(select_1.SelectItem, { value: "pending" }, "Pending"),
                    React.createElement(select_1.SelectItem, { value: "approved" }, "Approved"),
                    React.createElement(select_1.SelectItem, { value: "revision_requested" }, "Revision Requested"),
                    React.createElement(select_1.SelectItem, { value: "rejected" }, "Rejected"))))),
        React.createElement("div", { className: "flex justify-between items-center text-sm text-gray-600" },
            React.createElement("span", null,
                "Showing ",
                filteredTasks.length,
                " of ",
                tasks.length,
                " tasks"),
            React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: onRefresh, className: "h-8" }, "Refresh")),
        React.createElement("div", { className: "border rounded-lg overflow-hidden" },
            React.createElement(table_1.Table, null,
                React.createElement(table_1.TableHeader, { className: "bg-gray-50" },
                    React.createElement(table_1.TableRow, null,
                        React.createElement(table_1.TableHead, { className: "w-1/4" }, "Task"),
                        React.createElement(table_1.TableHead, { className: "w-16" }, "Status"),
                        React.createElement(table_1.TableHead, { className: "w-16" }, "Priority"),
                        React.createElement(table_1.TableHead, { className: "w-32" }, "Assigned To"),
                        React.createElement(table_1.TableHead, { className: "w-24" }, "Due Date"),
                        isAdmin && React.createElement(table_1.TableHead, { className: "w-20" }, "Approval"),
                        React.createElement(table_1.TableHead, { className: "w-20" }, "Actions"))),
                React.createElement(table_1.TableBody, null, filteredTasks.length === 0 ? (React.createElement(table_1.TableRow, null,
                    React.createElement(table_1.TableCell, { colSpan: isAdmin ? 7 : 6, className: "text-center py-8 text-gray-500" }, "No tasks found matching your filters"))) : (filteredTasks.map(function (task) { return (React.createElement(table_1.TableRow, { key: task.id, className: "hover:bg-gray-50 " + (task.approvalStatus && getApprovalStatusColor(task.approvalStatus)) },
                    React.createElement(table_1.TableCell, null,
                        React.createElement("div", { className: "flex flex-col" },
                            React.createElement("span", { className: "font-medium text-sm" }, task.title),
                            task.description && (React.createElement("span", { className: "text-xs text-gray-500 truncate" }, task.description)))),
                    React.createElement(table_1.TableCell, null,
                        React.createElement("div", { className: "flex items-center gap-2" },
                            getStatusIcon(task.status),
                            React.createElement(badge_1.Badge, { variant: "outline", className: getStatusColor(task.status) }, task.status === "in_progress"
                                ? "In Progress"
                                : task.status === "review"
                                    ? "Review"
                                    : task.status.charAt(0).toUpperCase() + task.status.slice(1)))),
                    React.createElement(table_1.TableCell, null,
                        React.createElement(badge_1.Badge, { className: getPriorityColor(task.priority) }, task.priority.charAt(0).toUpperCase() + task.priority.slice(1))),
                    React.createElement(table_1.TableCell, null,
                        React.createElement("span", { className: "text-sm text-gray-700" }, getTeamMemberName(task.assignedTo))),
                    React.createElement(table_1.TableCell, null,
                        React.createElement("span", { className: "text-sm text-gray-600" }, task.dueDate
                            ? new Date(task.dueDate).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric"
                            })
                            : "-")),
                    isAdmin && (React.createElement(table_1.TableCell, null,
                        task.approvalStatus && task.approvalStatus !== "pending" && (React.createElement(badge_1.Badge, { variant: "outline", className: "text-xs " + (task.approvalStatus === "approved"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : task.approvalStatus === "rejected"
                                    ? "bg-red-50 text-red-700 border-red-200"
                                    : "bg-yellow-50 text-yellow-700 border-yellow-200") }, task.approvalStatus === "revision_requested"
                            ? "Revision"
                            : task.approvalStatus)),
                        (!task.approvalStatus || task.approvalStatus === "pending") && (React.createElement("span", { className: "text-xs text-orange-600 font-medium" }, "Pending")))),
                    React.createElement(table_1.TableCell, null,
                        React.createElement("div", { className: "flex gap-2" },
                            React.createElement(button_1.Button, { variant: "ghost", size: "sm", className: "h-8 w-8 p-0", onClick: function () { return onEdit === null || onEdit === void 0 ? void 0 : onEdit(task); }, title: "Edit task" },
                                React.createElement(lucide_react_1.Edit2, { className: "h-4 w-4" })),
                            React.createElement(button_1.Button, { variant: "ghost", size: "sm", className: "h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50", onClick: function () { return handleDelete(task.id); }, title: "Delete task", disabled: deleteTaskMutation.isPending },
                                React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))))); }))))),
        React.createElement("div", { className: "text-xs text-gray-500" },
            "Tip: Click on a task row or use the Edit button to modify task details,",
            isAdmin && " approve/reject tasks, or add remarks.")));
}
exports.ProjectTasksList = ProjectTasksList;
