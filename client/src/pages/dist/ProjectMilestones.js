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
var react_1 = require("react");
var trpc_1 = require("@/lib/trpc");
var button_1 = require("@/components/ui/button");
var dialog_1 = require("@/components/ui/dialog");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var select_1 = require("@/components/ui/select");
var badge_1 = require("@/components/ui/badge");
var textarea_1 = require("@/components/ui/textarea");
var alert_dialog_1 = require("@/components/ui/alert-dialog");
var utils_1 = require("@/lib/utils");
var lucide_react_1 = require("lucide-react");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var sonner_1 = require("sonner");
var stats_card_1 = require("@/components/ui/stats-card");
var currency_1 = require("@/lib/currency");
function ProjectMilestones() {
    var _this = this;
    var formatMoney = currency_1.useCurrency().format;
    var _a = react_1.useState(false), isOpen = _a[0], setIsOpen = _a[1];
    var _b = react_1.useState(null), editingId = _b[0], setEditingId = _b[1];
    var _c = react_1.useState(null), deleteId = _c[0], setDeleteId = _c[1];
    var _d = react_1.useState({
        projectId: "",
        phaseName: "",
        description: "",
        deliverables: "",
        dueDate: new Date().toISOString().split("T")[0],
        startDate: new Date().toISOString().split("T")[0],
        budget: "",
        notes: ""
    }), formData = _d[0], setFormData = _d[1];
    // Fetch data
    var _e = trpc_1.trpc.projectMilestones.list.useQuery({}), milestones = _e.data, refetchMilestones = _e.refetch;
    var projects = trpc_1.trpc.projects.list.useQuery(undefined).data;
    // Mutations
    var createMutation = trpc_1.trpc.projectMilestones.create.useMutation({
        onSuccess: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sonner_1.toast.success("Milestone created successfully");
                        setIsOpen(false);
                        resetForm();
                        return [4 /*yield*/, refetchMilestones()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to create milestone");
        }
    });
    var updateMutation = trpc_1.trpc.projectMilestones.update.useMutation({
        onSuccess: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sonner_1.toast.success("Milestone updated");
                        setIsOpen(false);
                        setEditingId(null);
                        resetForm();
                        return [4 /*yield*/, refetchMilestones()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to update milestone");
        }
    });
    var updateProgressMutation = trpc_1.trpc.projectMilestones.updateProgress.useMutation({
        onSuccess: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sonner_1.toast.success("Progress updated");
                        return [4 /*yield*/, refetchMilestones()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to update progress");
        }
    });
    var deleteMutation = trpc_1.trpc.projectMilestones["delete"].useMutation({
        onSuccess: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sonner_1.toast.success("Milestone deleted");
                        setDeleteId(null);
                        return [4 /*yield*/, refetchMilestones()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to delete milestone");
        }
    });
    // Handlers
    var resetForm = function () {
        setFormData({
            projectId: "",
            phaseName: "",
            description: "",
            deliverables: "",
            dueDate: new Date().toISOString().split("T")[0],
            startDate: new Date().toISOString().split("T")[0],
            budget: "",
            notes: ""
        });
    };
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            e.preventDefault();
            if (!formData.phaseName || !formData.dueDate || !formData.projectId) {
                sonner_1.toast.error("Please fill in all required fields");
                return [2 /*return*/];
            }
            if (editingId) {
                updateMutation.mutate({
                    id: editingId,
                    phaseName: formData.phaseName,
                    description: formData.description || undefined,
                    deliverables: formData.deliverables || undefined,
                    dueDate: formData.dueDate + "T00:00:00Z",
                    startDate: formData.startDate ? formData.startDate + "T00:00:00Z" : undefined,
                    budget: formData.budget ? parseInt(formData.budget) * 100 : undefined,
                    notes: formData.notes || undefined
                });
            }
            else {
                createMutation.mutate({
                    projectId: formData.projectId,
                    phaseName: formData.phaseName,
                    description: formData.description || undefined,
                    deliverables: formData.deliverables || undefined,
                    dueDate: formData.dueDate + "T00:00:00Z",
                    startDate: formData.startDate ? formData.startDate + "T00:00:00Z" : undefined,
                    budget: formData.budget ? parseInt(formData.budget) * 100 : undefined,
                    notes: formData.notes || undefined
                });
            }
            return [2 /*return*/];
        });
    }); };
    var handleEdit = function (milestone) {
        setFormData({
            projectId: milestone.projectId,
            phaseName: milestone.phaseName,
            description: milestone.description || "",
            deliverables: milestone.deliverables || "",
            dueDate: milestone.dueDate.split("T")[0],
            startDate: milestone.startDate ? milestone.startDate.split("T")[0] : "",
            budget: milestone.budget ? milestone.budget.toString() : "",
            notes: milestone.notes || ""
        });
        setEditingId(milestone.id);
        setIsOpen(true);
    };
    var handleDelete = function (id) {
        deleteMutation.mutate(id);
    };
    var getProjectName = function (projectId) {
        var _a;
        return ((_a = projects === null || projects === void 0 ? void 0 : projects.find(function (p) { return p.id === projectId; })) === null || _a === void 0 ? void 0 : _a.projectNumber) || projectId;
    };
    var stats = react_1.useMemo(function () {
        if (!milestones)
            return { total: 0, completed: 0, inProgress: 0, avgCompletion: 0 };
        var completed = milestones.filter(function (m) { return m.status === "completed"; }).length;
        var inProgress = milestones.filter(function (m) { return m.status === "in_progress"; }).length;
        var avgCompletion = Math.round(milestones.reduce(function (sum, m) { return sum + m.completionPercentage; }, 0) /
            (milestones.length || 1));
        return { total: milestones.length, completed: completed, inProgress: inProgress, avgCompletion: avgCompletion };
    }, [milestones]);
    var statusColor = function (status) {
        switch (status) {
            case "completed":
                return "bg-green-100 text-green-800";
            case "in_progress":
                return "bg-blue-100 text-blue-800";
            case "planning":
                return "bg-gray-100 text-gray-800";
            case "on_hold":
                return "bg-yellow-100 text-yellow-800";
            case "cancelled":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Project Milestones", icon: React.createElement(lucide_react_1.Flag, { className: "h-5 w-5" }), description: "Manage project phases and deliverables", breadcrumbs: [
            { label: "Dashboard", href: "/" },
            { label: "Projects", href: "/projects" },
            { label: "Milestones" },
        ] },
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4" },
                React.createElement(stats_card_1.StatsCard, { label: "Total Milestones", value: stats.total, color: "border-l-orange-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Completed", value: stats.completed, color: "border-l-purple-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "In Progress", value: stats.inProgress, color: "border-l-green-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Avg Completion", value: React.createElement(React.Fragment, null,
                        stats.avgCompletion,
                        "%"), color: "border-l-blue-500" })),
            React.createElement(dialog_1.Dialog, { open: isOpen, onOpenChange: function (open) {
                    setIsOpen(open);
                    if (!open) {
                        setEditingId(null);
                        resetForm();
                    }
                } },
                React.createElement(dialog_1.DialogTrigger, { asChild: true },
                    React.createElement(button_1.Button, null,
                        React.createElement(lucide_react_1.Plus, { className: "w-4 h-4 mr-2" }),
                        "New Milestone")),
                React.createElement(dialog_1.DialogContent, { className: "w-full max-w-md" },
                    React.createElement(dialog_1.DialogHeader, null,
                        React.createElement(dialog_1.DialogTitle, null,
                            editingId ? "Edit" : "Create",
                            " Milestone"),
                        React.createElement(dialog_1.DialogDescription, null, editingId ? "Update milestone details" : "Add a new project milestone")),
                    React.createElement("form", { onSubmit: handleSubmit, className: "space-y-4" },
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "project" }, "Project *"),
                            React.createElement(select_1.Select, { value: formData.projectId, onValueChange: function (value) { return setFormData(__assign(__assign({}, formData), { projectId: value })); } },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, { placeholder: "Select project" })),
                                React.createElement(select_1.SelectContent, null, Array.isArray(projects) && projects.map(function (project) { return (React.createElement(select_1.SelectItem, { key: project.id, value: project.id },
                                    project.projectNumber,
                                    " - ",
                                    project.name)); })))),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "phaseName" }, "Phase Name *"),
                            React.createElement(input_1.Input, { value: formData.phaseName, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { phaseName: e.target.value })); }, placeholder: "e.g., Requirements Gathering" })),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "description" }, "Description"),
                            React.createElement(textarea_1.Textarea, { value: formData.description, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { description: e.target.value })); }, placeholder: "Phase description", rows: 2 })),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "deliverables" }, "Deliverables"),
                            React.createElement(textarea_1.Textarea, { value: formData.deliverables, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { deliverables: e.target.value })); }, placeholder: "List of deliverables", rows: 2 })),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "startDate" }, "Start Date"),
                            React.createElement(input_1.Input, { type: "date", value: formData.startDate, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { startDate: e.target.value })); } })),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "dueDate" }, "Due Date *"),
                            React.createElement(input_1.Input, { type: "date", value: formData.dueDate, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { dueDate: e.target.value })); } })),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "budget" }, "Budget (Ksh)"),
                            React.createElement(input_1.Input, { type: "number", value: formData.budget, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { budget: e.target.value })); }, placeholder: "0" })),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "notes" }, "Notes"),
                            React.createElement(textarea_1.Textarea, { value: formData.notes, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { notes: e.target.value })); }, placeholder: "Additional notes", rows: 2 })),
                        React.createElement(button_1.Button, { type: "submit", className: "w-full", disabled: createMutation.isPending || updateMutation.isPending },
                            editingId ? "Update" : "Create",
                            " Milestone")))),
            React.createElement("div", { className: "space-y-4" }, !milestones || milestones.length === 0 ? (React.createElement("div", { className: "text-center py-8 text-gray-500 bg-white rounded-lg border" }, "No milestones yet. Create one to get started.")) : (milestones.map(function (milestone) { return (React.createElement("div", { key: milestone.id, className: "border rounded-lg p-4 " + statusColor(milestone.status) + " bg-opacity-20" },
                React.createElement("div", { className: "flex justify-between items-start mb-3" },
                    React.createElement("div", { className: "flex-1" },
                        React.createElement("div", { className: "flex items-center gap-2 mb-1" },
                            milestone.status === "completed" && React.createElement(lucide_react_1.CheckCircle2, { className: "w-5 h-5 text-green-600" }),
                            React.createElement("h3", { className: "text-lg font-semibold" }, milestone.phaseName),
                            React.createElement(badge_1.Badge, { className: statusColor(milestone.status) }, milestone.status.replace("_", " "))),
                        React.createElement("p", { className: "text-sm text-gray-600 mb-2" },
                            "Project: ",
                            getProjectName(milestone.projectId)),
                        milestone.description && (React.createElement("p", { className: "text-sm text-gray-700 mb-2" }, milestone.description))),
                    React.createElement("div", { className: "flex gap-2 ml-4" },
                        React.createElement(button_1.Button, { size: "sm", variant: "ghost", onClick: function () { return handleEdit(milestone); } },
                            React.createElement(lucide_react_1.Edit2, { className: "w-4 h-4" })),
                        React.createElement(button_1.Button, { size: "sm", variant: "ghost", onClick: function () { return setDeleteId(milestone.id); } },
                            React.createElement(lucide_react_1.Trash2, { className: "w-4 h-4 text-red-600" })))),
                React.createElement("div", { className: "mb-3" },
                    React.createElement("div", { className: "flex justify-between items-center mb-1" },
                        React.createElement("span", { className: "text-sm font-medium" }, "Progress"),
                        React.createElement("span", { className: "text-sm font-semibold" },
                            milestone.completionPercentage,
                            "%")),
                    React.createElement("div", { className: "w-full bg-gray-300 rounded-full h-2" },
                        React.createElement("div", { className: "bg-green-600 h-2 rounded-full transition-all", style: { width: milestone.completionPercentage + "%" } }))),
                milestone.status !== "completed" && (React.createElement("div", { className: "mb-3" },
                    React.createElement("input", { type: "range", min: "0", max: "100", value: milestone.completionPercentage, onChange: function (e) {
                            return updateProgressMutation.mutate({
                                id: milestone.id,
                                completionPercentage: parseInt(e.target.value)
                            });
                        }, className: "w-full cursor-pointer" }))),
                React.createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3 text-sm" },
                    React.createElement("div", null,
                        React.createElement("span", { className: "text-gray-600" }, "Due Date"),
                        React.createElement("p", { className: "font-medium" }, utils_1.formatDate(milestone.dueDate))),
                    milestone.budget && (React.createElement("div", null,
                        React.createElement("span", { className: "text-gray-600" }, "Budget"),
                        React.createElement("p", { className: "font-medium" }, formatMoney(milestone.budget)))),
                    milestone.actualCost > 0 && (React.createElement("div", null,
                        React.createElement("span", { className: "text-gray-600" }, "Actual Cost"),
                        React.createElement("p", { className: "font-medium" }, formatMoney(milestone.actualCost)))),
                    milestone.completionDate && (React.createElement("div", null,
                        React.createElement("span", { className: "text-gray-600" }, "Completed"),
                        React.createElement("p", { className: "font-medium" }, utils_1.formatDate(milestone.completionDate))))),
                milestone.deliverables && (React.createElement("div", { className: "mt-3 p-2 bg-white bg-opacity-50 rounded text-sm" },
                    React.createElement("strong", null, "Deliverables:"),
                    React.createElement("p", { className: "whitespace-pre-wrap" }, milestone.deliverables))))); }))),
            React.createElement(alert_dialog_1.AlertDialog, { open: !!deleteId, onOpenChange: function (open) { return !open && setDeleteId(null); } },
                React.createElement(alert_dialog_1.AlertDialogContent, null,
                    React.createElement(alert_dialog_1.AlertDialogHeader, null,
                        React.createElement(alert_dialog_1.AlertDialogTitle, null, "Delete Milestone"),
                        React.createElement(alert_dialog_1.AlertDialogDescription, null, "This action cannot be undone. Are you sure?")),
                    React.createElement("div", { className: "flex justify-end gap-2" },
                        React.createElement(alert_dialog_1.AlertDialogCancel, null, "Cancel"),
                        React.createElement(alert_dialog_1.AlertDialogAction, { onClick: function () { return deleteId && handleDelete(deleteId); }, className: "bg-red-600" }, "Delete")))))));
}
exports["default"] = ProjectMilestones;
