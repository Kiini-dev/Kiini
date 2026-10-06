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
exports.CreateProjectForm = void 0;
var react_1 = require("react");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var select_1 = require("@/components/ui/select");
var DatePicker_1 = require("@/components/DatePicker");
var sonner_1 = require("sonner");
var trpc_1 = require("@/lib/trpc");
function CreateProjectForm(_a) {
    var _this = this;
    var onSuccess = _a.onSuccess, onCancel = _a.onCancel;
    var utils = trpc_1.trpc.useUtils();
    var _b = trpc_1.trpc.clients.list.useQuery({}).data, clients = _b === void 0 ? [] : _b;
    var createProjectMutation = trpc_1.trpc.projects.create.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Project created successfully!");
            utils.projects.list.invalidate();
            onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to create project");
        }
    });
    var _c = react_1.useState({
        name: "",
        projectNumber: "PRJ-" + new Date().getFullYear() + "-" + String(Math.floor(Math.random() * 1000)).padStart(3, "0"),
        clientId: "",
        description: "",
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        budget: "",
        status: "planning",
        priority: "medium",
        progressPercentage: "0"
    }), formData = _c[0], setFormData = _c[1];
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            e.preventDefault();
            if (!formData.name || !formData.clientId) {
                sonner_1.toast.error("Please fill in all required fields");
                return [2 /*return*/];
            }
            createProjectMutation.mutate({
                name: formData.name,
                clientId: formData.clientId,
                description: formData.description,
                status: formData.status,
                priority: formData.priority,
                startDate: formData.startDate.toISOString().split('T')[0],
                endDate: formData.endDate.toISOString().split('T')[0],
                budget: formData.budget ? parseFloat(formData.budget) : undefined,
                progressPercentage: formData.progressPercentage ? parseInt(formData.progressPercentage) : 0
            });
            return [2 /*return*/];
        });
    }); };
    return (React.createElement("form", { onSubmit: handleSubmit, className: "space-y-4" },
        React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
            React.createElement("div", { className: "space-y-2" },
                React.createElement(label_1.Label, { htmlFor: "name" }, "Project Name *"),
                React.createElement(input_1.Input, { id: "name", value: formData.name, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { name: e.target.value })); }, placeholder: "Enter project name", required: true })),
            React.createElement("div", { className: "space-y-2" },
                React.createElement(label_1.Label, { htmlFor: "projectNumber" }, "Project Number"),
                React.createElement(input_1.Input, { id: "projectNumber", value: formData.projectNumber, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { projectNumber: e.target.value })); }, placeholder: "Auto-generated", disabled: true }))),
        React.createElement("div", { className: "space-y-2" },
            React.createElement(label_1.Label, { htmlFor: "clientId" }, "Client *"),
            React.createElement(select_1.Select, { value: formData.clientId, onValueChange: function (value) { return setFormData(__assign(__assign({}, formData), { clientId: value })); } },
                React.createElement(select_1.SelectTrigger, null,
                    React.createElement(select_1.SelectValue, { placeholder: "Select client" })),
                React.createElement(select_1.SelectContent, null, Array.isArray(clients) && clients.map(function (client) { return (React.createElement(select_1.SelectItem, { key: client.id, value: client.id }, client.companyName || client.name)); })))),
        React.createElement("div", { className: "space-y-2" },
            React.createElement(label_1.Label, { htmlFor: "description" }, "Description"),
            React.createElement(textarea_1.Textarea, { id: "description", value: formData.description, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { description: e.target.value })); }, placeholder: "Project description and objectives", rows: 3 })),
        React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
            React.createElement("div", { className: "space-y-2" },
                React.createElement(label_1.Label, null, "Start Date *"),
                React.createElement(DatePicker_1.DatePicker, { date: formData.startDate, onDateChange: function (date) { return date && setFormData(__assign(__assign({}, formData), { startDate: date })); } })),
            React.createElement("div", { className: "space-y-2" },
                React.createElement(label_1.Label, null, "End Date *"),
                React.createElement(DatePicker_1.DatePicker, { date: formData.endDate, onDateChange: function (date) { return date && setFormData(__assign(__assign({}, formData), { endDate: date })); } }))),
        React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
            React.createElement("div", { className: "space-y-2" },
                React.createElement(label_1.Label, { htmlFor: "budget" }, "Budget (Ksh)"),
                React.createElement(input_1.Input, { id: "budget", type: "number", value: formData.budget, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { budget: e.target.value })); }, placeholder: "0" })),
            React.createElement("div", { className: "space-y-2" },
                React.createElement(label_1.Label, { htmlFor: "priority" }, "Priority"),
                React.createElement(select_1.Select, { value: formData.priority, onValueChange: function (value) { return setFormData(__assign(__assign({}, formData), { priority: value })); } },
                    React.createElement(select_1.SelectTrigger, null,
                        React.createElement(select_1.SelectValue, null)),
                    React.createElement(select_1.SelectContent, null,
                        React.createElement(select_1.SelectItem, { value: "low" }, "Low"),
                        React.createElement(select_1.SelectItem, { value: "medium" }, "Medium"),
                        React.createElement(select_1.SelectItem, { value: "high" }, "High"),
                        React.createElement(select_1.SelectItem, { value: "urgent" }, "Urgent"))))),
        React.createElement("div", { className: "grid grid-cols-2 gap-4" },
            React.createElement("div", { className: "space-y-2" },
                React.createElement(label_1.Label, { htmlFor: "progressPercentage" }, "Progress (%)"),
                React.createElement(input_1.Input, { id: "progressPercentage", type: "number", min: "0", max: "100", value: formData.progressPercentage, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { progressPercentage: e.target.value })); }, placeholder: "0" }))),
        React.createElement("div", { className: "flex justify-end gap-2 pt-4" },
            React.createElement(button_1.Button, { type: "button", variant: "outline", onClick: onCancel, disabled: createProjectMutation.isPending }, "Cancel"),
            React.createElement(button_1.Button, { type: "submit", disabled: createProjectMutation.isPending }, createProjectMutation.isPending ? "Creating..." : "Create Project"))));
}
exports.CreateProjectForm = CreateProjectForm;
