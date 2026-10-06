"use strict";
/**
 * Workflow Builder Page
 * Visual workflow automation and process design interface
 */
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
var trpc_1 = require("@/lib/trpc");
var lucide_react_1 = require("lucide-react");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var RichTextEditor_1 = require("@/components/RichTextEditor");
var badge_1 = require("@/components/ui/badge");
var dialog_1 = require("@/components/ui/dialog");
var tabs_1 = require("@/components/ui/tabs");
var sonner_1 = require("sonner");
var WorkflowBuilder = function () {
    var _a, _b, _c, _d;
    var _e = react_1.useState('workflows'), activeTab = _e[0], setActiveTab = _e[1];
    var _f = react_1.useState(false), showModal = _f[0], setShowModal = _f[1];
    var _g = react_1.useState(null), selectedWorkflow = _g[0], setSelectedWorkflow = _g[1];
    var _h = react_1.useState({ name: '', description: '' }), newWorkflow = _h[0], setNewWorkflow = _h[1];
    var utils = trpc_1.trpc.useUtils();
    var workflowsQuery = trpc_1.trpc.workflows.list.useQuery({ limit: 50, offset: 0 });
    var templatesQuery = trpc_1.trpc.workflows.getTemplates.useQuery();
    var createMutation = trpc_1.trpc.workflows.create.useMutation({
        onSuccess: function () {
            utils.workflows.list.invalidate();
            setShowModal(false);
            setNewWorkflow({ name: '', description: '' });
            sonner_1.toast.success('Workflow created');
        },
        onError: function () { return sonner_1.toast.error('Failed to create workflow'); }
    });
    var deleteMutation = trpc_1.trpc.workflows["delete"].useMutation({
        onSuccess: function () {
            utils.workflows.list.invalidate();
            setSelectedWorkflow(null);
            sonner_1.toast.success('Workflow deleted');
        },
        onError: function () { return sonner_1.toast.error('Failed to delete workflow'); }
    });
    var toggleMutation = trpc_1.trpc.workflows.toggleStatus.useMutation({
        onSuccess: function () {
            utils.workflows.list.invalidate();
            sonner_1.toast.success('Status updated');
        },
        onError: function () { return sonner_1.toast.error('Failed to update status'); }
    });
    var workflows = JSON.parse(JSON.stringify((_b = (_a = workflowsQuery.data) === null || _a === void 0 ? void 0 : _a.workflows) !== null && _b !== void 0 ? _b : []));
    var templates = JSON.parse(JSON.stringify((_d = (_c = templatesQuery.data) === null || _c === void 0 ? void 0 : _c.templates) !== null && _d !== void 0 ? _d : []));
    var getStatusVariant = function (status) {
        var map = {
            draft: 'secondary', active: 'default', inactive: 'outline', paused: 'destructive'
        };
        return map[status] || 'secondary';
    };
    var handleCreate = function () {
        if (!newWorkflow.name.trim()) {
            sonner_1.toast.error('Name is required');
            return;
        }
        createMutation.mutate({
            name: newWorkflow.name,
            description: newWorkflow.description,
            triggerType: 'manual',
            triggerCondition: {},
            actions: [{ actionType: 'send_notification', actionName: 'Default Action', actionTarget: 'user', actionData: {}, sequence: 1 }],
            isRecurring: false
        });
    };
    return (react_1["default"].createElement("div", { className: "p-6 bg-gray-50 min-h-screen" },
        react_1["default"].createElement("div", { className: "max-w-7xl mx-auto" },
            react_1["default"].createElement("h1", { className: "text-4xl font-bold mb-8 text-gray-900" }, "Workflow Automation"),
            react_1["default"].createElement(tabs_1.Tabs, { value: activeTab, onValueChange: setActiveTab },
                react_1["default"].createElement(tabs_1.TabsList, { className: "mb-6" },
                    react_1["default"].createElement(tabs_1.TabsTrigger, { value: "workflows" },
                        react_1["default"].createElement(lucide_react_1.Play, { className: "w-4 h-4 mr-2" }),
                        "My Workflows"),
                    react_1["default"].createElement(tabs_1.TabsTrigger, { value: "templates" },
                        react_1["default"].createElement(lucide_react_1.History, { className: "w-4 h-4 mr-2" }),
                        "Templates")),
                react_1["default"].createElement(tabs_1.TabsContent, { value: "workflows" },
                    react_1["default"].createElement("div", { className: "flex justify-between items-center mb-6" },
                        react_1["default"].createElement("h2", { className: "text-2xl font-bold" }, "Workflows"),
                        react_1["default"].createElement(button_1.Button, { onClick: function () { return setShowModal(true); } },
                            react_1["default"].createElement(lucide_react_1.Plus, { className: "w-4 h-4 mr-2" }),
                            "New Workflow")),
                    workflowsQuery.isLoading ? (react_1["default"].createElement("p", { className: "text-muted-foreground" }, "Loading...")) : workflows.length === 0 ? (react_1["default"].createElement("p", { className: "text-center py-12 text-muted-foreground" }, "No workflows yet. Create one to get started.")) : (react_1["default"].createElement("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4" }, workflows.map(function (wf) { return (react_1["default"].createElement(card_1.Card, { key: wf.id, className: "cursor-pointer hover:shadow-lg transition-shadow", onClick: function () { return setSelectedWorkflow(wf); } },
                        react_1["default"].createElement(card_1.CardHeader, { className: "pb-2" },
                            react_1["default"].createElement("div", { className: "flex justify-between items-start" },
                                react_1["default"].createElement("div", null,
                                    react_1["default"].createElement(card_1.CardTitle, { className: "text-lg" }, wf.name),
                                    react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" }, wf.description)),
                                react_1["default"].createElement(badge_1.Badge, { variant: getStatusVariant(wf.status) }, wf.status))),
                        react_1["default"].createElement(card_1.CardContent, null,
                            react_1["default"].createElement("div", { className: "grid grid-cols-2 gap-4 mb-4 text-center text-sm border-t border-b py-3" },
                                react_1["default"].createElement("div", null,
                                    react_1["default"].createElement("div", { className: "font-bold text-lg" }, wf.triggerType || '-'),
                                    react_1["default"].createElement("div", { className: "text-muted-foreground" }, "Trigger")),
                                react_1["default"].createElement("div", null,
                                    react_1["default"].createElement("div", { className: "font-bold text-lg" }, wf.isRecurring ? 'Yes' : 'No'),
                                    react_1["default"].createElement("div", { className: "text-muted-foreground" }, "Recurring"))),
                            react_1["default"].createElement("div", { className: "flex justify-between items-center text-sm text-muted-foreground mb-4" },
                                react_1["default"].createElement("span", null,
                                    "Created ",
                                    wf.createdAt ? new Date(wf.createdAt).toLocaleDateString() : '-')),
                            react_1["default"].createElement("div", { className: "flex justify-end space-x-2" },
                                wf.status === 'active' ? (react_1["default"].createElement(button_1.Button, { size: "sm", variant: "destructive", onClick: function (e) { e.stopPropagation(); toggleMutation.mutate({ id: wf.id, status: 'inactive' }); } },
                                    react_1["default"].createElement(lucide_react_1.StopCircle, { className: "w-4 h-4 mr-1" }),
                                    "Pause")) : (react_1["default"].createElement(button_1.Button, { size: "sm", onClick: function (e) { e.stopPropagation(); toggleMutation.mutate({ id: wf.id, status: 'active' }); } },
                                    react_1["default"].createElement(lucide_react_1.Play, { className: "w-4 h-4 mr-1" }),
                                    "Activate")),
                                react_1["default"].createElement(button_1.Button, { size: "sm", variant: "destructive", onClick: function (e) { e.stopPropagation(); deleteMutation.mutate(wf.id); } },
                                    react_1["default"].createElement(lucide_react_1.Trash2, { className: "w-4 h-4" })))))); })))),
                react_1["default"].createElement(tabs_1.TabsContent, { value: "templates" },
                    react_1["default"].createElement("h2", { className: "text-2xl font-bold mb-6" }, "Workflow Templates"),
                    templatesQuery.isLoading ? (react_1["default"].createElement("p", { className: "text-muted-foreground" }, "Loading templates...")) : (react_1["default"].createElement("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4" }, templates.map(function (t) {
                        var _a;
                        return (react_1["default"].createElement(card_1.Card, { key: t.id },
                            react_1["default"].createElement(card_1.CardHeader, null,
                                react_1["default"].createElement(card_1.CardTitle, { className: "text-lg" }, t.name),
                                react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" }, t.description)),
                            react_1["default"].createElement(card_1.CardContent, null,
                                react_1["default"].createElement("div", { className: "flex items-center gap-2 mb-4" },
                                    react_1["default"].createElement(badge_1.Badge, { variant: "secondary" }, t.triggerType),
                                    react_1["default"].createElement("span", { className: "text-sm text-muted-foreground" },
                                        ((_a = t.actions) === null || _a === void 0 ? void 0 : _a.length) || 0,
                                        " actions")),
                                react_1["default"].createElement(button_1.Button, { variant: "outline", onClick: function () {
                                        setNewWorkflow({ name: "Copy of " + t.name, description: t.description });
                                        setShowModal(true);
                                    } }, "Use Template"))));
                    }))))),
            react_1["default"].createElement(dialog_1.Dialog, { open: showModal, onOpenChange: setShowModal },
                react_1["default"].createElement(dialog_1.DialogContent, null,
                    react_1["default"].createElement(dialog_1.DialogHeader, null,
                        react_1["default"].createElement(dialog_1.DialogTitle, null, "Create New Workflow")),
                    react_1["default"].createElement("div", { className: "space-y-4" },
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("label", { className: "block text-sm font-medium mb-1" }, "Workflow Name *"),
                            react_1["default"].createElement(input_1.Input, { placeholder: "e.g., Invoice Approval", value: newWorkflow.name, onChange: function (e) { return setNewWorkflow(__assign(__assign({}, newWorkflow), { name: e.target.value })); } })),
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("label", { className: "block text-sm font-medium mb-1" }, "Description"),
                            react_1["default"].createElement(RichTextEditor_1.RichTextEditor, { value: newWorkflow.description, onChange: function (html) { return setNewWorkflow(__assign(__assign({}, newWorkflow), { description: html })); }, minHeight: "100px", placeholder: "What does this workflow do?" }))),
                    react_1["default"].createElement(dialog_1.DialogFooter, null,
                        react_1["default"].createElement(button_1.Button, { variant: "outline", onClick: function () { return setShowModal(false); } }, "Cancel"),
                        react_1["default"].createElement(button_1.Button, { onClick: handleCreate, disabled: createMutation.isPending }, createMutation.isPending ? 'Creating...' : 'Create')))),
            react_1["default"].createElement(dialog_1.Dialog, { open: !!selectedWorkflow, onOpenChange: function (open) { return !open && setSelectedWorkflow(null); } },
                react_1["default"].createElement(dialog_1.DialogContent, { className: "max-w-2xl" },
                    react_1["default"].createElement(dialog_1.DialogHeader, null,
                        react_1["default"].createElement(dialog_1.DialogTitle, null, selectedWorkflow === null || selectedWorkflow === void 0 ? void 0 : selectedWorkflow.name)),
                    selectedWorkflow && (react_1["default"].createElement("div", { className: "space-y-4" },
                        react_1["default"].createElement("p", { className: "text-muted-foreground" }, selectedWorkflow.description),
                        react_1["default"].createElement("div", { className: "grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded" },
                            react_1["default"].createElement("div", null,
                                react_1["default"].createElement("div", { className: "text-sm text-muted-foreground" }, "Status"),
                                react_1["default"].createElement(badge_1.Badge, { variant: getStatusVariant(selectedWorkflow.status) }, selectedWorkflow.status)),
                            react_1["default"].createElement("div", null,
                                react_1["default"].createElement("div", { className: "text-sm text-muted-foreground" }, "Trigger"),
                                react_1["default"].createElement("div", { className: "font-bold" }, selectedWorkflow.triggerType)),
                            react_1["default"].createElement("div", null,
                                react_1["default"].createElement("div", { className: "text-sm text-muted-foreground" }, "Recurring"),
                                react_1["default"].createElement("div", { className: "font-bold" }, selectedWorkflow.isRecurring ? 'Yes' : 'No')),
                            react_1["default"].createElement("div", null,
                                react_1["default"].createElement("div", { className: "text-sm text-muted-foreground" }, "Created"),
                                react_1["default"].createElement("div", { className: "font-bold" }, selectedWorkflow.createdAt ? new Date(selectedWorkflow.createdAt).toLocaleDateString() : '-'))))))))));
};
exports["default"] = WorkflowBuilder;
