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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var react_1 = require("react");
var sonner_1 = require("sonner");
var trpc_1 = require("../lib/trpc");
var lucide_react_1 = require("lucide-react");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var dialog_1 = require("../components/ui/dialog");
var alert_dialog_1 = require("../components/ui/alert-dialog");
var button_1 = require("../components/ui/button");
var input_1 = require("../components/ui/input");
var select_1 = require("../components/ui/select");
var textarea_1 = require("../components/ui/textarea");
var badge_1 = require("../components/ui/badge");
var card_1 = require("../components/ui/card");
// ============================================
// WORKFLOW BUILDER COMPONENT
// ============================================
function WorkflowAutomation() {
    var _a = react_1.useState(false), showCreateDialog = _a[0], setShowCreateDialog = _a[1];
    var _b = react_1.useState(false), showEditDialog = _b[0], setShowEditDialog = _b[1];
    var _c = react_1.useState(false), showDeleteDialog = _c[0], setShowDeleteDialog = _c[1];
    var _d = react_1.useState(false), showExecuteDialog = _d[0], setShowExecuteDialog = _d[1];
    var _e = react_1.useState(null), selectedWorkflow = _e[0], setSelectedWorkflow = _e[1];
    var _f = react_1.useState(false), showExecutionHistory = _f[0], setShowExecutionHistory = _f[1];
    var _g = react_1.useState(""), useTemplate = _g[0], setUseTemplate = _g[1];
    var _h = trpc_1.trpc.workflows.list.useQuery({
        search: "",
        status: "active"
    }), workflows = _h.data, refetchWorkflows = _h.refetch;
    var templates = trpc_1.trpc.workflows.getTemplates.useQuery().data;
    var _j = trpc_1.trpc.workflows.create.useMutation({
        onSuccess: function () {
            setShowCreateDialog(false);
            refetchWorkflows();
        }
    }), createWorkflow = _j.mutate, isCreating = _j.isPending;
    var _k = trpc_1.trpc.workflows.update.useMutation({
        onSuccess: function () {
            setShowEditDialog(false);
            refetchWorkflows();
        }
    }), updateWorkflow = _k.mutate, isUpdating = _k.isPending;
    var _l = trpc_1.trpc.workflows["delete"].useMutation({
        onSuccess: function () {
            setShowDeleteDialog(false);
            refetchWorkflows();
        }
    }), deleteWorkflow = _l.mutate, isDeleting = _l.isPending;
    var _m = trpc_1.trpc.workflows.executeManually.useMutation({
        onSuccess: function () {
            setShowExecuteDialog(false);
        }
    }), executeWorkflow = _m.mutate, isExecuting = _m.isPending;
    var executionHistory = trpc_1.trpc.workflows.getExecutionHistory.useQuery({ workflowId: (selectedWorkflow === null || selectedWorkflow === void 0 ? void 0 : selectedWorkflow.id) || "" }, { enabled: showExecutionHistory && !!selectedWorkflow }).data;
    var _o = react_1.useState({
        name: "",
        description: "",
        triggerType: "",
        actions: [],
        isRecurring: false
    }), formData = _o[0], setFormData = _o[1];
    var triggerTypes = [
        { value: "invoice_created", label: "Invoice Created" },
        { value: "invoice_paid", label: "Invoice Paid" },
        { value: "invoice_overdue", label: "Invoice Overdue" },
        { value: "payment_received", label: "Payment Received" },
        { value: "opportunity_moved", label: "Opportunity Moved" },
        { value: "task_completed", label: "Task Completed" },
        { value: "project_milestone_reached", label: "Project Milestone Reached" },
        { value: "reminder_time", label: "Reminder Time" },
    ];
    var actionTypes = [
        { value: "send_email", label: "Send Email" },
        { value: "create_task", label: "Create Task" },
        { value: "update_status", label: "Update Status" },
        { value: "send_notification", label: "Send Notification" },
        { value: "create_follow_up", label: "Create Follow-up" },
        { value: "add_invoice", label: "Add Invoice" },
        { value: "update_field", label: "Update Field" },
        { value: "create_reminder", label: "Create Reminder" },
    ];
    var handleAddAction = function () {
        setFormData(function (prev) { return (__assign(__assign({}, prev), { actions: __spreadArrays(prev.actions, [
                {
                    actionType: "send_email",
                    actionName: "",
                    actionData: {},
                    sequence: prev.actions.length + 1
                },
            ]) })); });
    };
    var handleRemoveAction = function (index) {
        setFormData(function (prev) { return (__assign(__assign({}, prev), { actions: prev.actions.filter(function (_, i) { return i !== index; }) })); });
    };
    var handleUpdateAction = function (index, updates) {
        setFormData(function (prev) { return (__assign(__assign({}, prev), { actions: prev.actions.map(function (action, i) {
                return i === index ? __assign(__assign({}, action), updates) : action;
            }) })); });
    };
    var handleCreateWorkflow = function () {
        if (!formData.name.trim() || !formData.triggerType) {
            sonner_1.toast.error("Workflow name and trigger type are required");
            return;
        }
        createWorkflow({
            name: formData.name,
            description: formData.description,
            triggerType: formData.triggerType,
            actions: formData.actions,
            isRecurring: formData.isRecurring
        });
        // Reset form
        setFormData({
            name: "",
            description: "",
            triggerType: "",
            actions: [],
            isRecurring: false
        });
    };
    var handleLoadTemplate = function (template) {
        setFormData({
            name: template.name,
            description: template.description,
            triggerType: template.triggerType,
            actions: template.actions,
            isRecurring: false
        });
        setUseTemplate(template.id);
    };
    return (react_1["default"].createElement(ModuleLayout_1["default"], { title: "Workflow Automation", description: "Create and manage automated business processes", icon: react_1["default"].createElement(lucide_react_1.Zap, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Automation" },
        ] },
        react_1["default"].createElement("div", { className: "space-y-6 p-8" },
            react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("h1", { className: "text-3xl font-bold text-gray-900" }, "Workflow Automation"),
                    react_1["default"].createElement("p", { className: "text-gray-600 mt-2" }, "Create automated workflows to streamline business processes")),
                react_1["default"].createElement(button_1.Button, { onClick: function () { return setShowCreateDialog(true); }, className: "flex items-center gap-2" },
                    react_1["default"].createElement(lucide_react_1.Plus, { size: 20 }),
                    "New Workflow")),
            react_1["default"].createElement("div", { className: "grid grid-cols-3 gap-4 mb-6" },
                react_1["default"].createElement(card_1.Card, { className: "p-4" },
                    react_1["default"].createElement("div", { className: "text-2xl font-bold" }, (workflows === null || workflows === void 0 ? void 0 : workflows.workflows.length) || 0),
                    react_1["default"].createElement("div", { className: "text-sm text-gray-600" }, "Active Workflows")),
                react_1["default"].createElement(card_1.Card, { className: "p-4" },
                    react_1["default"].createElement("div", { className: "text-2xl font-bold" }, (templates === null || templates === void 0 ? void 0 : templates.templates.length) || 0),
                    react_1["default"].createElement("div", { className: "text-sm text-gray-600" }, "Available Templates")),
                react_1["default"].createElement(card_1.Card, { className: "p-4" },
                    react_1["default"].createElement("div", { className: "text-2xl font-bold text-green-600" }, "Ready"),
                    react_1["default"].createElement("div", { className: "text-sm text-gray-600" }, "System Status"))),
            templates && templates.templates.length > 0 && (react_1["default"].createElement("div", { className: "mb-8" },
                react_1["default"].createElement("h2", { className: "text-xl font-bold mb-4" }, "Quick Start Templates"),
                react_1["default"].createElement("div", { className: "grid grid-cols-3 gap-4" }, templates.templates.map(function (template) { return (react_1["default"].createElement(card_1.Card, { key: template.id, className: "p-4 hover:shadow-lg transition-shadow" },
                    react_1["default"].createElement("h3", { className: "font-semibold mb-2" }, template.name),
                    react_1["default"].createElement("p", { className: "text-sm text-gray-600 mb-4" }, template.description),
                    react_1["default"].createElement(badge_1.Badge, { className: "mb-4" }, template.triggerType),
                    react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", onClick: function () { return handleLoadTemplate(template); }, className: "w-full" }, "Use Template"))); })))),
            react_1["default"].createElement("div", { className: "mb-8" },
                react_1["default"].createElement("h2", { className: "text-xl font-bold mb-4" }, "Your Workflows"),
                (workflows === null || workflows === void 0 ? void 0 : workflows.workflows) && workflows.workflows.length > 0 ? (react_1["default"].createElement("div", { className: "space-y-4" }, workflows.workflows.map(function (workflow) {
                    var _a;
                    return (react_1["default"].createElement(card_1.Card, { key: workflow.id, className: "p-6 hover:shadow-lg transition-shadow" },
                        react_1["default"].createElement("div", { className: "flex items-start justify-between" },
                            react_1["default"].createElement("div", { className: "flex-1" },
                                react_1["default"].createElement("div", { className: "flex items-center gap-3 mb-2" },
                                    react_1["default"].createElement("h3", { className: "text-lg font-semibold" }, workflow.name),
                                    react_1["default"].createElement(badge_1.Badge, { variant: workflow.status === "active" ? "default" : "secondary" }, workflow.status)),
                                react_1["default"].createElement("p", { className: "text-sm text-gray-600 mb-3" }, workflow.description),
                                react_1["default"].createElement("div", { className: "flex items-center gap-4 text-sm" },
                                    react_1["default"].createElement("div", { className: "flex items-center gap-1" },
                                        react_1["default"].createElement(lucide_react_1.Clock, { size: 16, className: "text-gray-400" }),
                                        react_1["default"].createElement("span", null, workflow.triggerType)),
                                    react_1["default"].createElement("div", { className: "flex items-center gap-1" },
                                        react_1["default"].createElement(lucide_react_1.CheckCircle, { size: 16, className: "text-gray-400" }),
                                        react_1["default"].createElement("span", null,
                                            ((_a = workflow.actionTypes) === null || _a === void 0 ? void 0 : _a.length) || 0,
                                            " actions")))),
                            react_1["default"].createElement("div", { className: "flex gap-2" },
                                react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", onClick: function () {
                                        setSelectedWorkflow(workflow);
                                        setShowExecuteDialog(true);
                                    } },
                                    react_1["default"].createElement(lucide_react_1.Play, { size: 16, className: "mr-1" }),
                                    "Test"),
                                react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", onClick: function () {
                                        setSelectedWorkflow(workflow);
                                        setShowEditDialog(true);
                                    } },
                                    react_1["default"].createElement(lucide_react_1.Edit2, { size: 16 })),
                                react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", className: "text-red-600 hover:text-red-700", onClick: function () {
                                        setSelectedWorkflow(workflow);
                                        setShowDeleteDialog(true);
                                    } },
                                    react_1["default"].createElement(lucide_react_1.Trash2, { size: 16 }))))));
                }))) : (react_1["default"].createElement(card_1.Card, { className: "p-12 text-center" },
                    react_1["default"].createElement("p", { className: "text-gray-600" }, "No workflows created yet. Start by creating a new workflow or using a template.")))),
            react_1["default"].createElement(dialog_1.Dialog, { open: showCreateDialog || showEditDialog, onOpenChange: function (open) {
                    setShowCreateDialog(open && !showEditDialog);
                    setShowEditDialog(open && showEditDialog);
                } },
                react_1["default"].createElement(dialog_1.DialogContent, { className: "max-w-4xl max-h-[90vh] overflow-y-auto" },
                    react_1["default"].createElement(dialog_1.DialogHeader, null,
                        react_1["default"].createElement(dialog_1.DialogTitle, null, showEditDialog ? "Edit Workflow" : "Create New Workflow")),
                    react_1["default"].createElement("div", { className: "space-y-6" },
                        react_1["default"].createElement("div", { className: "space-y-4" },
                            react_1["default"].createElement("div", null,
                                react_1["default"].createElement("label", { className: "block text-sm font-medium mb-2" }, "Workflow Name"),
                                react_1["default"].createElement(input_1.Input, { placeholder: "e.g., Auto Follow-up on Overdue Invoices", value: formData.name, onChange: function (e) {
                                        return setFormData(function (prev) { return (__assign(__assign({}, prev), { name: e.target.value })); });
                                    } })),
                            react_1["default"].createElement("div", null,
                                react_1["default"].createElement("label", { className: "block text-sm font-medium mb-2" }, "Description"),
                                react_1["default"].createElement(textarea_1.Textarea, { placeholder: "Describe what this workflow does...", value: formData.description || "", onChange: function (e) {
                                        return setFormData(function (prev) { return (__assign(__assign({}, prev), { description: e.target.value })); });
                                    }, rows: 3 })),
                            react_1["default"].createElement("div", null,
                                react_1["default"].createElement("label", { className: "block text-sm font-medium mb-2" }, "Trigger Event"),
                                react_1["default"].createElement(select_1.Select, { value: formData.triggerType, onValueChange: function (value) {
                                        return setFormData(function (prev) { return (__assign(__assign({}, prev), { triggerType: value })); });
                                    } },
                                    react_1["default"].createElement(select_1.SelectTrigger, null,
                                        react_1["default"].createElement(select_1.SelectValue, { placeholder: "Select trigger event..." })),
                                    react_1["default"].createElement(select_1.SelectContent, null, triggerTypes.map(function (type) { return (react_1["default"].createElement(select_1.SelectItem, { key: type.value, value: type.value }, type.label)); })))),
                            react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                                react_1["default"].createElement("input", { type: "checkbox", id: "recurring", checked: formData.isRecurring, onChange: function (e) {
                                        return setFormData(function (prev) { return (__assign(__assign({}, prev), { isRecurring: e.target.checked })); });
                                    }, className: "w-4 h-4" }),
                                react_1["default"].createElement("label", { htmlFor: "recurring", className: "text-sm" }, "This is a recurring workflow"))),
                        react_1["default"].createElement("div", { className: "border-t pt-6" },
                            react_1["default"].createElement("div", { className: "flex items-center justify-between mb-4" },
                                react_1["default"].createElement("h3", { className: "font-semibold" }, "Workflow Actions"),
                                react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", onClick: handleAddAction },
                                    react_1["default"].createElement(lucide_react_1.Plus, { size: 16, className: "mr-1" }),
                                    "Add Action")),
                            react_1["default"].createElement("div", { className: "space-y-4" }, formData.actions.map(function (action, index) { return (react_1["default"].createElement(card_1.Card, { key: action.id || "action-" + index, className: "p-4 bg-gray-50" },
                                react_1["default"].createElement("div", { className: "flex items-start justify-between mb-4" },
                                    react_1["default"].createElement("div", { className: "text-sm font-medium" },
                                        "Action ",
                                        index + 1),
                                    react_1["default"].createElement(button_1.Button, { size: "sm", variant: "ghost", onClick: function () { return handleRemoveAction(index); }, className: "text-red-600 hover:text-red-700" },
                                        react_1["default"].createElement(lucide_react_1.Trash2, { size: 16 }))),
                                react_1["default"].createElement("div", { className: "space-y-4" },
                                    react_1["default"].createElement("div", null,
                                        react_1["default"].createElement("label", { className: "block text-sm font-medium mb-2" }, "Action Type"),
                                        react_1["default"].createElement(select_1.Select, { value: action.actionType, onValueChange: function (value) {
                                                return handleUpdateAction(index, { actionType: value });
                                            } },
                                            react_1["default"].createElement(select_1.SelectTrigger, null,
                                                react_1["default"].createElement(select_1.SelectValue, null)),
                                            react_1["default"].createElement(select_1.SelectContent, null, actionTypes.map(function (type) { return (react_1["default"].createElement(select_1.SelectItem, { key: type.value, value: type.value }, type.label)); })))),
                                    react_1["default"].createElement("div", null,
                                        react_1["default"].createElement("label", { className: "block text-sm font-medium mb-2" }, "Action Name"),
                                        react_1["default"].createElement(input_1.Input, { placeholder: "e.g., Send Overdue Reminder", value: action.actionName, onChange: function (e) {
                                                return handleUpdateAction(index, { actionName: e.target.value });
                                            } })),
                                    react_1["default"].createElement("div", { className: "grid grid-cols-2 gap-4" },
                                        react_1["default"].createElement("div", null,
                                            react_1["default"].createElement("label", { className: "block text-sm font-medium mb-2" }, "Target (Optional)"),
                                            react_1["default"].createElement(input_1.Input, { placeholder: "e.g., client, finance, operations", value: action.actionTarget || "", onChange: function (e) {
                                                    return handleUpdateAction(index, {
                                                        actionTarget: e.target.value
                                                    });
                                                } })),
                                        react_1["default"].createElement("div", null,
                                            react_1["default"].createElement("label", { className: "block text-sm font-medium mb-2" }, "Delay (minutes)"),
                                            react_1["default"].createElement(input_1.Input, { type: "number", min: "0", value: action.delayMinutes || 0, onChange: function (e) {
                                                    return handleUpdateAction(index, {
                                                        delayMinutes: parseInt(e.target.value) || 0
                                                    });
                                                } })))))); })),
                            formData.actions.length === 0 && (react_1["default"].createElement(card_1.Card, { className: "p-8 text-center bg-gray-50" },
                                react_1["default"].createElement("p", { className: "text-gray-600 mb-4" }, "No actions added yet"),
                                react_1["default"].createElement(button_1.Button, { variant: "outline", onClick: handleAddAction }, "Add First Action"))))),
                    react_1["default"].createElement(dialog_1.DialogFooter, null,
                        react_1["default"].createElement(button_1.Button, { variant: "outline", onClick: function () {
                                setShowCreateDialog(false);
                                setShowEditDialog(false);
                            } }, "Cancel"),
                        react_1["default"].createElement(button_1.Button, { onClick: handleCreateWorkflow, disabled: isCreating || isUpdating }, isCreating || isUpdating ? "Saving..." : "Save Workflow")))),
            react_1["default"].createElement(alert_dialog_1.AlertDialog, { open: showDeleteDialog, onOpenChange: setShowDeleteDialog },
                react_1["default"].createElement(alert_dialog_1.AlertDialogContent, null,
                    react_1["default"].createElement(alert_dialog_1.AlertDialogTitle, null, "Delete Workflow?"),
                    react_1["default"].createElement(alert_dialog_1.AlertDialogDescription, null,
                        "Are you sure you want to delete \"",
                        (selectedWorkflow === null || selectedWorkflow === void 0 ? void 0 : selectedWorkflow.name) || "workflow",
                        "\"? This action cannot be undone."),
                    react_1["default"].createElement("div", { className: "flex gap-4 justify-end" },
                        react_1["default"].createElement(alert_dialog_1.AlertDialogCancel, null, "Cancel"),
                        react_1["default"].createElement(alert_dialog_1.AlertDialogAction, { onClick: function () {
                                if (selectedWorkflow) {
                                    deleteWorkflow(selectedWorkflow.id);
                                }
                            }, disabled: isDeleting, className: "bg-red-600 hover:bg-red-700" }, isDeleting ? "Deleting..." : "Delete")))),
            react_1["default"].createElement(dialog_1.Dialog, { open: showExecuteDialog, onOpenChange: setShowExecuteDialog },
                react_1["default"].createElement(dialog_1.DialogContent, null,
                    react_1["default"].createElement(dialog_1.DialogHeader, null,
                        react_1["default"].createElement(dialog_1.DialogTitle, null,
                            "Test Workflow: ",
                            (selectedWorkflow === null || selectedWorkflow === void 0 ? void 0 : selectedWorkflow.name) || "Workflow")),
                    react_1["default"].createElement("div", { className: "space-y-4" },
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("label", { className: "block text-sm font-medium mb-2" }, "Entity Type"),
                            react_1["default"].createElement(select_1.Select, { defaultValue: "invoice" },
                                react_1["default"].createElement(select_1.SelectTrigger, null,
                                    react_1["default"].createElement(select_1.SelectValue, null)),
                                react_1["default"].createElement(select_1.SelectContent, null,
                                    react_1["default"].createElement(select_1.SelectItem, { value: "invoice" }, "Invoice"),
                                    react_1["default"].createElement(select_1.SelectItem, { value: "opportunity" }, "Opportunity"),
                                    react_1["default"].createElement(select_1.SelectItem, { value: "payment" }, "Payment"),
                                    react_1["default"].createElement(select_1.SelectItem, { value: "task" }, "Task")))),
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("label", { className: "block text-sm font-medium mb-2" }, "Entity ID"),
                            react_1["default"].createElement(input_1.Input, { placeholder: "Enter entity ID to test with..." })),
                        react_1["default"].createElement("div", { className: "p-4 bg-blue-50 rounded-lg border border-blue-200" },
                            react_1["default"].createElement("div", { className: "flex gap-2" },
                                react_1["default"].createElement(lucide_react_1.AlertCircle, { size: 20, className: "text-blue-600 flex-shrink-0 mt-0.5" }),
                                react_1["default"].createElement("p", { className: "text-sm text-blue-800" }, "Testing will execute the workflow with the specified entity. All actions will run as configured.")))),
                    react_1["default"].createElement(dialog_1.DialogFooter, null,
                        react_1["default"].createElement(button_1.Button, { variant: "outline", onClick: function () { return setShowExecuteDialog(false); } }, "Cancel"),
                        react_1["default"].createElement(button_1.Button, { onClick: function () {
                                if (selectedWorkflow === null || selectedWorkflow === void 0 ? void 0 : selectedWorkflow.id) {
                                    executeWorkflow({ workflowId: selectedWorkflow.id });
                                }
                            }, disabled: isExecuting }, isExecuting ? "Testing..." : "Run Test")))))));
}
exports["default"] = WorkflowAutomation;
