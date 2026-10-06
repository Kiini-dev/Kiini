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
exports.CreateProjectTask = void 0;
var react_1 = require("react");
var trpc_1 = require("@/lib/trpc");
var button_1 = require("../ui/button");
var input_1 = require("../ui/input");
var textarea_1 = require("../ui/textarea");
var select_1 = require("../ui/select");
var lucide_react_1 = require("lucide-react");
function CreateProjectTask(_a) {
    var _this = this;
    var projectId = _a.projectId, teamMembers = _a.teamMembers, onSuccess = _a.onSuccess, onCancel = _a.onCancel;
    var _b = react_1.useState(false), isSubmitting = _b[0], setIsSubmitting = _b[1];
    var _c = react_1.useState("idle"), submitStatus = _c[0], setSubmitStatus = _c[1];
    var _d = react_1.useState(""), errorMessage = _d[0], setErrorMessage = _d[1];
    var _e = react_1.useState({
        title: "",
        description: "",
        priority: "medium",
        status: "todo",
        assignedTo: "",
        dueDate: "",
        estimatedHours: ""
    }), formData = _e[0], setFormData = _e[1];
    var createTaskMutation = trpc_1.trpc.projects.tasks.create.useMutation();
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
                        projectId: projectId,
                        title: formData.title,
                        description: formData.description || undefined,
                        priority: formData.priority,
                        status: formData.status,
                        assignedTo: formData.assignedTo && formData.assignedTo !== "__unassigned__" ? formData.assignedTo : undefined,
                        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
                        estimatedHours: formData.estimatedHours ? Number(formData.estimatedHours) : undefined
                    };
                    return [4 /*yield*/, createTaskMutation.mutateAsync(submitData)];
                case 2:
                    _a.sent();
                    setSubmitStatus("success");
                    setFormData({
                        title: "",
                        description: "",
                        priority: "medium",
                        status: "todo",
                        assignedTo: "",
                        dueDate: "",
                        estimatedHours: ""
                    });
                    if (onSuccess) {
                        setTimeout(onSuccess, 1000);
                    }
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _a.sent();
                    setSubmitStatus("error");
                    setErrorMessage((error_1 === null || error_1 === void 0 ? void 0 : error_1.message) || "Failed to create task");
                    console.error("Create task error:", error_1);
                    return [3 /*break*/, 5];
                case 4:
                    setIsSubmitting(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    return (React.createElement("div", { className: "w-full max-w-2xl mx-auto p-6 bg-white rounded-lg border border-gray-200" },
        React.createElement("h2", { className: "text-2xl font-bold mb-6" }, "Create New Task"),
        submitStatus === "success" && (React.createElement("div", { className: "mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3" },
            React.createElement(lucide_react_1.CheckCircle, { className: "h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" }),
            React.createElement("div", null,
                React.createElement("p", { className: "text-sm font-medium text-green-800" }, "Task created successfully!"),
                React.createElement("p", { className: "text-sm text-green-700 mt-1" }, "The task has been added to your project.")))),
        submitStatus === "error" && (React.createElement("div", { className: "mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3" },
            React.createElement(lucide_react_1.AlertCircle, { className: "h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" }),
            React.createElement("div", null,
                React.createElement("p", { className: "text-sm font-medium text-red-800" }, "Failed to create task"),
                React.createElement("p", { className: "text-sm text-red-700 mt-1" }, errorMessage)))),
        React.createElement("form", { onSubmit: onSubmit, className: "space-y-6" },
            React.createElement("div", null,
                React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Task Title *"),
                React.createElement(input_1.Input, { name: "title", placeholder: "Enter task title", value: formData.title, onChange: handleChange, disabled: isSubmitting, required: true })),
            React.createElement("div", null,
                React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Description"),
                React.createElement(textarea_1.Textarea, { name: "description", placeholder: "Add task description...", value: formData.description, onChange: handleChange, disabled: isSubmitting, rows: 4 })),
            React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
                React.createElement("div", null,
                    React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Priority"),
                    React.createElement(select_1.Select, { value: formData.priority, onValueChange: function (v) { return handleSelectChange("priority", v); }, disabled: isSubmitting },
                        React.createElement(select_1.SelectTrigger, null,
                            React.createElement(select_1.SelectValue, null)),
                        React.createElement(select_1.SelectContent, null,
                            React.createElement(select_1.SelectItem, { value: "low" }, "Low"),
                            React.createElement(select_1.SelectItem, { value: "medium" }, "Medium"),
                            React.createElement(select_1.SelectItem, { value: "high" }, "High"),
                            React.createElement(select_1.SelectItem, { value: "urgent" }, "Urgent")))),
                React.createElement("div", null,
                    React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Status"),
                    React.createElement(select_1.Select, { value: formData.status, onValueChange: function (v) { return handleSelectChange("status", v); }, disabled: isSubmitting },
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
                    React.createElement(select_1.Select, { value: formData.assignedTo, onValueChange: function (v) { return handleSelectChange("assignedTo", v); }, disabled: isSubmitting },
                        React.createElement(select_1.SelectTrigger, null,
                            React.createElement(select_1.SelectValue, { placeholder: "Select team member" })),
                        React.createElement(select_1.SelectContent, null,
                            React.createElement(select_1.SelectItem, { value: "__unassigned__" }, "Unassigned"),
                            teamMembers.map(function (member) { return (React.createElement(select_1.SelectItem, { key: member.id, value: member.id }, member.name)); })))),
                React.createElement("div", null,
                    React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Due Date"),
                    React.createElement(input_1.Input, { type: "date", name: "dueDate", value: formData.dueDate, onChange: handleChange, disabled: isSubmitting }))),
            React.createElement("div", null,
                React.createElement("label", { className: "block text-sm font-medium text-gray-700 mb-1" }, "Estimated Hours"),
                React.createElement(input_1.Input, { type: "number", name: "estimatedHours", placeholder: "0", value: formData.estimatedHours, onChange: handleChange, disabled: isSubmitting })),
            React.createElement("div", { className: "flex gap-3 pt-4" },
                React.createElement(button_1.Button, { type: "submit", disabled: isSubmitting || submitStatus === "success", className: "flex-1" }, isSubmitting ? "Creating..." : "Create Task"),
                React.createElement(button_1.Button, { type: "button", variant: "outline", onClick: onCancel, disabled: isSubmitting }, "Cancel")))));
}
exports.CreateProjectTask = CreateProjectTask;
