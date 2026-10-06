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
exports.EditProjectTask = void 0;
var react_1 = require("react");
var trpc_1 = require("@/lib/trpc");
var useUserLookup_1 = require("@/hooks/useUserLookup");
var button_1 = require("../ui/button");
var input_1 = require("../ui/input");
var textarea_1 = require("../ui/textarea");
var select_1 = require("../ui/select");
var badge_1 = require("../ui/badge");
var lucide_react_1 = require("lucide-react");
function EditProjectTask(_a) {
    var _this = this;
    var task = _a.task, teamMembers = _a.teamMembers, _b = _a.isAdmin, isAdmin = _b === void 0 ? false : _b, onSuccess = _a.onSuccess, onCancel = _a.onCancel;
    var getUserName = useUserLookup_1.useUserLookup().getUserName;
    var _c = react_1.useState(false), isSubmitting = _c[0], setIsSubmitting = _c[1];
    var _d = react_1.useState("idle"), submitStatus = _d[0], setSubmitStatus = _d[1];
    var _e = react_1.useState(""), errorMessage = _e[0], setErrorMessage = _e[1];
    var _f = react_1.useState(false), showApprovalActions = _f[0], setShowApprovalActions = _f[1];
    var _g = react_1.useState(""), approvalReason = _g[0], setApprovalReason = _g[1];
    var _h = react_1.useState({
        id: task.id,
        title: task.title,
        description: task.description || "",
        priority: task.priority,
        status: task.status,
        assignedTo: task.assignedTo || "",
        dueDate: task.dueDate ? task.dueDate.split(" ")[0] : "",
        estimatedHours: task.estimatedHours ? String(task.estimatedHours) : "",
        actualHours: task.actualHours ? String(task.actualHours) : ""
    }), formData = _h[0], setFormData = _h[1];
    var updateTaskMutation = trpc_1.trpc.projects.tasks.update.useMutation();
    var approveMutation = trpc_1.trpc.projects.tasks.approve.useMutation();
    var rejectMutation = trpc_1.trpc.projects.tasks.reject.useMutation();
    var requestRevisionMutation = trpc_1.trpc.projects.tasks.requestRevision.useMutation();
    var handleChange = function (e) {
        var _a = e.target, name = _a.name, value = _a.value;
        setFormData(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[name] = value, _a)));
        });
    };
    var handleSelectChange = function (name, value) {
        setFormData(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[name] = value, _a)));
        });
    };
    var onSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var submitData, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    setIsSubmitting(true);
                    setSubmitStatus("idle");
                    setErrorMessage("");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    submitData = {
                        id: formData.id
                    };
                    if (formData.title !== task.title)
                        submitData.title = formData.title;
                    if (formData.description !== (task.description || ""))
                        submitData.description = formData.description;
                    if (formData.priority !== task.priority)
                        submitData.priority = formData.priority;
                    if (formData.status !== task.status)
                        submitData.status = formData.status;
                    if (formData.assignedTo !== (task.assignedTo || ""))
                        submitData.assignedTo = (formData.assignedTo && formData.assignedTo !== "__unassigned__") ? formData.assignedTo : undefined;
                    if (formData.dueDate !== (task.dueDate ? task.dueDate.split(" ")[0] : "")) {
                        submitData.dueDate = formData.dueDate ? new Date(formData.dueDate) : undefined;
                    }
                    if (formData.estimatedHours !== (task.estimatedHours ? String(task.estimatedHours) : "")) {
                        submitData.estimatedHours = formData.estimatedHours ? Number(formData.estimatedHours) : undefined;
                    }
                    if (formData.actualHours !== (task.actualHours ? String(task.actualHours) : "")) {
                        submitData.actualHours = formData.actualHours ? Number(formData.actualHours) : undefined;
                    }
                    return [4 /*yield*/, updateTaskMutation.mutateAsync(submitData)];
                case 2:
                    _a.sent();
                    setSubmitStatus("success");
                    if (onSuccess) {
                        setTimeout(onSuccess, 1000);
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    setSubmitStatus("error");
                    setErrorMessage((error_1 === null || error_1 === void 0 ? void 0 : error_1.message) || "Failed to update task");
                    console.error("Update task error:", error_1);
                    return [3 /*break*/, 5];
                case 4:
                    setIsSubmitting(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleApprove = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setIsSubmitting(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, approveMutation.mutateAsync({
                            id: task.id,
                            adminRemarks: approvalReason || undefined
                        })];
                case 2:
                    _a.sent();
                    setSubmitStatus("success");
                    setApprovalReason("");
                    if (onSuccess)
                        setTimeout(onSuccess, 1000);
                    return [3 /*break*/, 5];
                case 3:
                    error_2 = _a.sent();
                    setSubmitStatus("error");
                    setErrorMessage((error_2 === null || error_2 === void 0 ? void 0 : error_2.message) || "Failed to approve task");
                    return [3 /*break*/, 5];
                case 4:
                    setIsSubmitting(false);
                    setShowApprovalActions(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleReject = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!approvalReason.trim()) {
                        setErrorMessage("Please provide a rejection reason");
                        return [2 /*return*/];
                    }
                    setIsSubmitting(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, rejectMutation.mutateAsync({
                            id: task.id,
                            rejectionReason: approvalReason,
                            adminRemarks: approvalReason
                        })];
                case 2:
                    _a.sent();
                    setSubmitStatus("success");
                    setApprovalReason("");
                    if (onSuccess)
                        setTimeout(onSuccess, 1000);
                    return [3 /*break*/, 5];
                case 3:
                    error_3 = _a.sent();
                    setSubmitStatus("error");
                    setErrorMessage((error_3 === null || error_3 === void 0 ? void 0 : error_3.message) || "Failed to reject task");
                    return [3 /*break*/, 5];
                case 4:
                    setIsSubmitting(false);
                    setShowApprovalActions(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var handleRequestRevision = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!approvalReason.trim()) {
                        setErrorMessage("Please provide revision remarks");
                        return [2 /*return*/];
                    }
                    setIsSubmitting(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, requestRevisionMutation.mutateAsync({
                            id: task.id,
                            revisionRemarks: approvalReason
                        })];
                case 2:
                    _a.sent();
                    setSubmitStatus("success");
                    setApprovalReason("");
                    if (onSuccess)
                        setTimeout(onSuccess, 1000);
                    return [3 /*break*/, 5];
                case 3:
                    error_4 = _a.sent();
                    setSubmitStatus("error");
                    setErrorMessage((error_4 === null || error_4 === void 0 ? void 0 : error_4.message) || "Failed to request revision");
                    return [3 /*break*/, 5];
                case 4:
                    setIsSubmitting(false);
                    setShowApprovalActions(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    var getApprovalStatusColor = function (status) {
        switch (status) {
            case "approved":
                return "bg-green-100 text-green-800";
            case "rejected":
                return "bg-red-100 text-red-800";
            case "revision_requested":
                return "bg-yellow-100 text-yellow-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };
    return (React.createElement("div", { className: "w-full max-w-3xl mx-auto p-6 bg-white rounded-lg border border-gray-200" },
        React.createElement("div", { className: "flex justify-between items-start mb-6" },
            React.createElement("h2", { className: "text-2xl font-bold" }, "Edit Task"),
            task.approvalStatus && (React.createElement(badge_1.Badge, { className: getApprovalStatusColor(task.approvalStatus) }, task.approvalStatus === "revision_requested" ? "Revision Requested" : task.approvalStatus))),
        submitStatus === "success" && (React.createElement("div", { className: "mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3" },
            React.createElement(lucide_react_1.CheckCircle, { className: "h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" }),
            React.createElement("div", null,
                React.createElement("p", { className: "text-sm font-medium text-green-800" }, "Task updated successfully!")))),
        submitStatus === "error" && (React.createElement("div", { className: "mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3" },
            React.createElement(lucide_react_1.AlertCircle, { className: "h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" }),
            React.createElement("div", null,
                React.createElement("p", { className: "text-sm font-medium text-red-800" }, "Update failed"),
                React.createElement("p", { className: "text-sm text-red-700 mt-1" }, errorMessage)))),
        isAdmin && task.approvalStatus && (React.createElement("div", { className: "mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg" },
            React.createElement("h3", { className: "font-semibold text-blue-900 mb-2" }, "Approval Information"),
            React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-blue-800" },
                React.createElement("div", null,
                    React.createElement("p", { className: "font-medium" }, "Status:"),
                    React.createElement("p", null, task.approvalStatus)),
                task.approvedBy && (React.createElement("div", null,
                    React.createElement("p", { className: "font-medium" }, "Approved By:"),
                    React.createElement("p", null, getUserName(task.approvedBy) || task.approvedBy))),
                task.adminRemarks && (React.createElement("div", { className: "col-span-2" },
                    React.createElement("p", { className: "font-medium" }, "Remarks:"),
                    React.createElement("p", { className: "mt-1 p-2 bg-white rounded border border-blue-200" }, task.adminRemarks))),
                task.rejectionReason && (React.createElement("div", { className: "col-span-2" },
                    React.createElement("p", { className: "font-medium" }, "Rejection Reason:"),
                    React.createElement("p", { className: "mt-1 p-2 bg-white rounded border border-red-200" }, task.rejectionReason)))))),
        React.createElement("form", { onSubmit: onSubmit, className: "space-y-6" },
            React.createElement("div", null,
                React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Task Title *"),
                React.createElement(input_1.Input, { name: "title", placeholder: "Enter task title", value: formData.title, onChange: handleChange, disabled: isSubmitting })),
            React.createElement("div", null,
                React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Description"),
                React.createElement(textarea_1.Textarea, { name: "description", placeholder: "Add task description...", value: formData.description, onChange: handleChange, disabled: isSubmitting, rows: 4 })),
            React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
                React.createElement("div", null,
                    React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Priority"),
                    React.createElement(select_1.Select, { value: formData.priority || task.priority, onValueChange: function (v) { return handleSelectChange("priority", v); }, disabled: isSubmitting },
                        React.createElement(select_1.SelectTrigger, null,
                            React.createElement(select_1.SelectValue, null)),
                        React.createElement(select_1.SelectContent, null,
                            React.createElement(select_1.SelectItem, { value: "low" }, "Low"),
                            React.createElement(select_1.SelectItem, { value: "medium" }, "Medium"),
                            React.createElement(select_1.SelectItem, { value: "high" }, "High"),
                            React.createElement(select_1.SelectItem, { value: "urgent" }, "Urgent")))),
                React.createElement("div", null,
                    React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Status"),
                    React.createElement(select_1.Select, { value: formData.status || task.status, onValueChange: function (v) { return handleSelectChange("status", v); }, disabled: isSubmitting },
                        React.createElement(select_1.SelectTrigger, null,
                            React.createElement(select_1.SelectValue, null)),
                        React.createElement(select_1.SelectContent, null,
                            React.createElement(select_1.SelectItem, { value: "todo" }, "To Do"),
                            React.createElement(select_1.SelectItem, { value: "in_progress" }, "In Progress"),
                            React.createElement(select_1.SelectItem, { value: "review" }, "Review"),
                            React.createElement(select_1.SelectItem, { value: "completed" }, "Completed"),
                            React.createElement(select_1.SelectItem, { value: "blocked" }, "Blocked"))))),
            React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
                React.createElement("div", null,
                    React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Assign To"),
                    React.createElement(select_1.Select, { value: formData.assignedTo || task.assignedTo || "", onValueChange: function (v) { return handleSelectChange("assignedTo", v); }, disabled: isSubmitting },
                        React.createElement(select_1.SelectTrigger, null,
                            React.createElement(select_1.SelectValue, null)),
                        React.createElement(select_1.SelectContent, null,
                            React.createElement(select_1.SelectItem, { value: "__unassigned__" }, "Unassigned"),
                            teamMembers.map(function (member) { return (React.createElement(select_1.SelectItem, { key: member.id, value: member.id }, member.name)); })))),
                React.createElement("div", null,
                    React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Due Date"),
                    React.createElement(input_1.Input, { type: "date", name: "dueDate", value: formData.dueDate, onChange: handleChange, disabled: isSubmitting }))),
            React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
                React.createElement("div", null,
                    React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Estimated Hours"),
                    React.createElement(input_1.Input, { type: "number", name: "estimatedHours", placeholder: "0", value: formData.estimatedHours, onChange: handleChange, disabled: isSubmitting })),
                React.createElement("div", null,
                    React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Actual Hours"),
                    React.createElement(input_1.Input, { type: "number", name: "actualHours", placeholder: "0", value: formData.actualHours, onChange: handleChange, disabled: isSubmitting }))),
            React.createElement("div", { className: "flex gap-3 pt-4" },
                React.createElement(button_1.Button, { type: "submit", disabled: isSubmitting, className: "flex-1" }, isSubmitting ? "Saving..." : "Save Changes"),
                React.createElement(button_1.Button, { type: "button", variant: "outline", onClick: onCancel, disabled: isSubmitting }, "Cancel"))),
        isAdmin && task.approvalStatus === "pending" && (React.createElement("div", { className: "mt-6 pt-6 border-t" },
            React.createElement("h3", { className: "font-semibold mb-4" }, "Admin Approval Actions"),
            !showApprovalActions ? (React.createElement("div", { className: "flex gap-3" },
                React.createElement(button_1.Button, { onClick: function () { return setShowApprovalActions(true); }, variant: "outline" }, "Review & Approve/Reject"))) : (React.createElement("div", { className: "space-y-4" },
                React.createElement(textarea_1.Textarea, { placeholder: "Add approval remarks or rejection reason...", value: approvalReason, onChange: function (e) { return setApprovalReason(e.target.value); }, disabled: isSubmitting, rows: 3 }),
                React.createElement("div", { className: "flex gap-3" },
                    React.createElement(button_1.Button, { onClick: handleApprove, disabled: isSubmitting, className: "bg-green-600 hover:bg-green-700" }, isSubmitting ? "Processing..." : "Approve"),
                    React.createElement(button_1.Button, { onClick: handleRequestRevision, disabled: isSubmitting || !approvalReason.trim(), variant: "outline" }, isSubmitting ? "Processing..." : "Request Revision"),
                    React.createElement(button_1.Button, { onClick: handleReject, disabled: isSubmitting || !approvalReason.trim(), className: "bg-red-600 hover:bg-red-700" }, isSubmitting ? "Processing..." : "Reject"),
                    React.createElement(button_1.Button, { onClick: function () {
                            setShowApprovalActions(false);
                            setApprovalReason("");
                        }, variant: "ghost", disabled: isSubmitting }, "Cancel"))))))));
}
exports.EditProjectTask = EditProjectTask;
