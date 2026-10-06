"use strict";
/**
 * Business Rules Engine Page
 * Visual rule builder and business logic automation — wired to automationRules backend
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
var ModuleLayout_1 = require("@/components/ModuleLayout");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var RichTextEditor_1 = require("@/components/RichTextEditor");
var badge_1 = require("@/components/ui/badge");
var switch_1 = require("@/components/ui/switch");
var tabs_1 = require("@/components/ui/tabs");
var dialog_1 = require("@/components/ui/dialog");
var select_1 = require("@/components/ui/select");
var table_1 = require("@/components/ui/table");
var lucide_react_1 = require("lucide-react");
var export_utils_1 = require("@/lib/export-utils");
var TRIGGER_TYPES = [
    { value: "invoice_created", label: "Invoice Created" },
    { value: "payment_received", label: "Payment Received" },
    { value: "invoice_overdue", label: "Invoice Overdue" },
    { value: "project_milestone", label: "Project Milestone" },
    { value: "time_entry_submitted", label: "Time Entry Submitted" },
    { value: "expense_submitted", label: "Expense Submitted" },
    { value: "client_created", label: "Client Created" },
    { value: "lead_qualified", label: "Lead Qualified" },
];
var ENTITY_TYPES = [
    { value: "invoice", label: "Invoice" },
    { value: "payment", label: "Payment" },
    { value: "project", label: "Project" },
    { value: "time_entry", label: "Time Entry" },
    { value: "expense", label: "Expense" },
    { value: "client", label: "Client" },
    { value: "lead", label: "Lead" },
];
var ACTION_TYPES = [
    { value: "send_notification", label: "Send Notification" },
    { value: "send_email", label: "Send Email" },
    { value: "create_task", label: "Create Task" },
    { value: "update_field", label: "Update Field" },
    { value: "send_sms", label: "Send SMS" },
    { value: "webhook", label: "Webhook" },
];
var TEMPLATES = [
    {
        name: "Auto-approve Small Invoices",
        description: "Automatically approve invoices under a threshold",
        trigger: "invoice_created",
        entity: "invoice",
        priority: "normal"
    },
    {
        name: "Payment Reminder",
        description: "Send reminder emails before payment due date",
        trigger: "invoice_overdue",
        entity: "invoice",
        priority: "high"
    },
    {
        name: "New Lead Welcome",
        description: "Send welcome email when a lead qualifies",
        trigger: "lead_qualified",
        entity: "lead",
        priority: "normal"
    },
    {
        name: "Expense Auto-routing",
        description: "Route expenses to the right approver based on amount",
        trigger: "expense_submitted",
        entity: "expense",
        priority: "normal"
    },
];
function BusinessRulesEngine() {
    var _a, _b, _c;
    var _d = react_1.useState(false), createOpen = _d[0], setCreateOpen = _d[1];
    var _e = react_1.useState(false), editOpen = _e[0], setEditOpen = _e[1];
    var _f = react_1.useState(false), detailOpen = _f[0], setDetailOpen = _f[1];
    var _g = react_1.useState(null), selectedRule = _g[0], setSelectedRule = _g[1];
    var _h = react_1.useState({
        name: "",
        description: "",
        triggerType: "",
        entity: "",
        priority: "normal",
        actionType: "send_notification",
        actionConfig: "",
        conditionField: "",
        conditionOperator: "equals",
        conditionValue: ""
    }), form = _h[0], setForm = _h[1];
    var resetForm = function () {
        setForm({
            name: "",
            description: "",
            triggerType: "",
            entity: "",
            priority: "normal",
            actionType: "send_notification",
            actionConfig: "",
            conditionField: "",
            conditionOperator: "equals",
            conditionValue: ""
        });
    };
    var utils = trpc_1.trpc.useUtils();
    var _j = trpc_1.trpc.automationRules.listRules.useQuery({}), rulesRaw = _j.data, isLoading = _j.isLoading;
    var rules = rulesRaw || [];
    var createMutation = trpc_1.trpc.automationRules.createRule.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Rule created successfully");
            utils.automationRules.listRules.invalidate();
            setCreateOpen(false);
            resetForm();
        },
        onError: function (err) { return sonner_1.toast.error(err.message); }
    });
    var updateMutation = trpc_1.trpc.automationRules.updateRule.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Rule updated successfully");
            utils.automationRules.listRules.invalidate();
            setEditOpen(false);
        },
        onError: function (err) { return sonner_1.toast.error(err.message); }
    });
    var deleteMutation = trpc_1.trpc.automationRules.deleteRule.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Rule deleted");
            utils.automationRules.listRules.invalidate();
        },
        onError: function (err) { return sonner_1.toast.error(err.message); }
    });
    var toggleMutation = trpc_1.trpc.automationRules.toggleRuleStatus.useMutation({
        onSuccess: function () {
            utils.automationRules.listRules.invalidate();
        },
        onError: function (err) { return sonner_1.toast.error(err.message); }
    });
    var handleCreate = function () {
        if (!form.name || !form.triggerType || !form.entity) {
            sonner_1.toast.error("Name, trigger, and entity type are required");
            return;
        }
        createMutation.mutate({
            name: form.name,
            description: form.description || undefined,
            trigger: {
                type: form.triggerType,
                entity: form.entity
            },
            conditions: form.conditionField
                ? [{ field: form.conditionField, operator: form.conditionOperator, value: form.conditionValue }]
                : [],
            actions: [
                {
                    type: form.actionType,
                    config: { message: form.actionConfig || form.name }
                },
            ],
            isActive: true,
            priority: form.priority
        });
    };
    var handleUpdate = function () {
        if (!selectedRule)
            return;
        updateMutation.mutate({
            id: selectedRule.id,
            name: form.name || undefined,
            description: form.description || undefined,
            isActive: selectedRule.isActive,
            priority: form.priority
        });
    };
    var handleExport = function () {
        if (!rules.length) {
            sonner_1.toast.warning("No rules to export");
            return;
        }
        var data = rules.map(function (r) { return ({
            Name: r.name,
            Description: r.description || "",
            Status: r.isActive ? "Active" : "Inactive",
            Priority: r.priority || "normal",
            CreatedAt: r.createdAt
        }); });
        export_utils_1.downloadCSV(data, "business_rules_export.csv");
        sonner_1.toast.success("Rules exported");
    };
    var activeRules = rules.filter(function (r) { return r.isActive; });
    var totalRules = rules.length;
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Business Rules Engine", description: "Create and manage automated business rules", icon: React.createElement(lucide_react_1.Zap, { className: "h-6 w-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/" },
            { label: "Admin", href: "/admin" },
            { label: "Business Rules" },
        ], actions: React.createElement("div", { className: "flex gap-2" },
            React.createElement(button_1.Button, { variant: "outline", onClick: handleExport },
                React.createElement(lucide_react_1.Download, { className: "h-4 w-4 mr-2" }),
                " Export"),
            React.createElement(button_1.Button, { onClick: function () { resetForm(); setCreateOpen(true); } },
                React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-2" }),
                " New Rule")) },
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4" },
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardContent, { className: "pt-4 text-center" },
                        React.createElement("p", { className: "text-3xl font-bold text-blue-600" }, totalRules),
                        React.createElement("p", { className: "text-sm text-muted-foreground" }, "Total Rules"))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardContent, { className: "pt-4 text-center" },
                        React.createElement("p", { className: "text-3xl font-bold text-green-600" }, activeRules.length),
                        React.createElement("p", { className: "text-sm text-muted-foreground" }, "Active"))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardContent, { className: "pt-4 text-center" },
                        React.createElement("p", { className: "text-3xl font-bold text-gray-400" }, totalRules - activeRules.length),
                        React.createElement("p", { className: "text-sm text-muted-foreground" }, "Inactive"))),
                React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardContent, { className: "pt-4 text-center" },
                        React.createElement("p", { className: "text-3xl font-bold text-purple-600" }, rules.reduce(function (s, r) {
                            var t = r.trigger;
                            return s + ((t === null || t === void 0 ? void 0 : t.type) ? 1 : 0);
                        }, 0)),
                        React.createElement("p", { className: "text-sm text-muted-foreground" }, "Triggers Configured")))),
            React.createElement(tabs_1.Tabs, { defaultValue: "rules" },
                React.createElement(tabs_1.TabsList, null,
                    React.createElement(tabs_1.TabsTrigger, { value: "rules" },
                        "My Rules (",
                        totalRules,
                        ")"),
                    React.createElement(tabs_1.TabsTrigger, { value: "templates" }, "Templates")),
                React.createElement(tabs_1.TabsContent, { value: "rules", className: "mt-4" }, isLoading ? (React.createElement(card_1.Card, null,
                    React.createElement(card_1.CardContent, { className: "pt-6 text-center text-muted-foreground" }, "Loading rules..."))) : rules.length === 0 ? (React.createElement(card_1.Card, { className: "border-dashed" },
                    React.createElement(card_1.CardContent, { className: "pt-6 text-center text-muted-foreground" },
                        React.createElement(lucide_react_1.Zap, { className: "h-8 w-8 mx-auto mb-2 opacity-50" }),
                        React.createElement("p", { className: "font-medium" }, "No rules yet"),
                        React.createElement("p", { className: "text-sm" }, "Create your first automation rule to get started."),
                        React.createElement(button_1.Button, { className: "mt-4", onClick: function () { resetForm(); setCreateOpen(true); } },
                            React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-2" }),
                            " Create Rule")))) : (React.createElement("div", { className: "rounded-md border" },
                    React.createElement(table_1.Table, null,
                        React.createElement(table_1.TableHeader, null,
                            React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableHead, null, "Name"),
                                React.createElement(table_1.TableHead, null, "Entity"),
                                React.createElement(table_1.TableHead, null, "Trigger"),
                                React.createElement(table_1.TableHead, null, "Priority"),
                                React.createElement(table_1.TableHead, null, "Status"),
                                React.createElement(table_1.TableHead, null, "Active"),
                                React.createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                        React.createElement(table_1.TableBody, null, rules.map(function (rule) {
                            var _a;
                            var trigger = typeof rule.trigger === "object" ? rule.trigger : {};
                            return (React.createElement(table_1.TableRow, { key: rule.id },
                                React.createElement(table_1.TableCell, null,
                                    React.createElement("div", null,
                                        React.createElement("p", { className: "font-medium" }, rule.name),
                                        rule.description && (React.createElement("p", { className: "text-xs text-muted-foreground truncate max-w-[250px]" }, rule.description)))),
                                React.createElement(table_1.TableCell, null,
                                    React.createElement(badge_1.Badge, { variant: "outline" }, trigger.entity || "—")),
                                React.createElement(table_1.TableCell, { className: "text-sm" }, ((_a = trigger.type) === null || _a === void 0 ? void 0 : _a.replace(/_/g, " ")) || "—"),
                                React.createElement(table_1.TableCell, null,
                                    React.createElement(badge_1.Badge, { className: rule.priority === "high"
                                            ? "bg-red-100 text-red-700"
                                            : rule.priority === "low"
                                                ? "bg-gray-100 text-gray-700"
                                                : "bg-yellow-100 text-yellow-700" }, rule.priority || "normal")),
                                React.createElement(table_1.TableCell, null,
                                    React.createElement(badge_1.Badge, { className: rule.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600" }, rule.isActive ? "Active" : "Inactive")),
                                React.createElement(table_1.TableCell, null,
                                    React.createElement(switch_1.Switch, { checked: !!rule.isActive, onCheckedChange: function (v) {
                                            return toggleMutation.mutate({ id: rule.id, isActive: v });
                                        } })),
                                React.createElement(table_1.TableCell, { className: "text-right" },
                                    React.createElement("div", { className: "flex gap-1 justify-end" },
                                        React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () {
                                                setSelectedRule(rule);
                                                setDetailOpen(true);
                                            } },
                                            React.createElement(lucide_react_1.Settings, { className: "h-4 w-4" })),
                                        React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () {
                                                setSelectedRule(rule);
                                                setForm({
                                                    name: rule.name,
                                                    description: rule.description || "",
                                                    triggerType: trigger.type || "",
                                                    entity: trigger.entity || "",
                                                    priority: rule.priority || "normal",
                                                    actionType: "send_notification",
                                                    actionConfig: "",
                                                    conditionField: "",
                                                    conditionOperator: "equals",
                                                    conditionValue: ""
                                                });
                                                setEditOpen(true);
                                            } },
                                            React.createElement(lucide_react_1.Edit, { className: "h-4 w-4" })),
                                        React.createElement(button_1.Button, { variant: "ghost", size: "sm", className: "text-destructive", onClick: function () {
                                                if (confirm("Delete this rule?")) {
                                                    deleteMutation.mutate(rule.id);
                                                }
                                            } },
                                            React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" }))))));
                        })))))),
                React.createElement(tabs_1.TabsContent, { value: "templates", className: "mt-4" },
                    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" }, TEMPLATES.map(function (tpl) { return (React.createElement(card_1.Card, { key: tpl.name, className: "hover:shadow-md transition-shadow" },
                        React.createElement(card_1.CardHeader, { className: "pb-2" },
                            React.createElement(card_1.CardTitle, { className: "text-base" }, tpl.name),
                            React.createElement(card_1.CardDescription, null, tpl.description)),
                        React.createElement(card_1.CardContent, null,
                            React.createElement("div", { className: "flex items-center gap-2 mb-3" },
                                React.createElement(badge_1.Badge, { variant: "outline" }, tpl.entity),
                                React.createElement(badge_1.Badge, { variant: "secondary" }, tpl.trigger.replace(/_/g, " "))),
                            React.createElement(button_1.Button, { size: "sm", onClick: function () {
                                    setForm(__assign(__assign({}, form), { name: tpl.name, description: tpl.description, triggerType: tpl.trigger, entity: tpl.entity, priority: tpl.priority }));
                                    setCreateOpen(true);
                                    sonner_1.toast.info("Template loaded — customize and create");
                                } }, "Use Template")))); })))),
            React.createElement(dialog_1.Dialog, { open: createOpen, onOpenChange: setCreateOpen },
                React.createElement(dialog_1.DialogContent, { className: "max-w-lg" },
                    React.createElement(dialog_1.DialogHeader, null,
                        React.createElement(dialog_1.DialogTitle, null, "Create New Rule"),
                        React.createElement(dialog_1.DialogDescription, null, "Define automation trigger, conditions and actions")),
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement("div", null,
                            React.createElement(label_1.Label, null, "Rule Name *"),
                            React.createElement(input_1.Input, { placeholder: "e.g., Auto-approve invoices under $5,000", value: form.name, onChange: function (e) { return setForm(__assign(__assign({}, form), { name: e.target.value })); } })),
                        React.createElement("div", null,
                            React.createElement(label_1.Label, null, "Description"),
                            React.createElement(RichTextEditor_1.RichTextEditor, { value: form.description, onChange: function (html) { return setForm(__assign(__assign({}, form), { description: html })); }, placeholder: "What does this rule do?", minHeight: "80px" })),
                        React.createElement("div", { className: "grid grid-cols-2 gap-3" },
                            React.createElement("div", null,
                                React.createElement(label_1.Label, null, "Entity Type *"),
                                React.createElement(select_1.Select, { value: form.entity, onValueChange: function (v) { return setForm(__assign(__assign({}, form), { entity: v })); } },
                                    React.createElement(select_1.SelectTrigger, null,
                                        React.createElement(select_1.SelectValue, { placeholder: "Select entity" })),
                                    React.createElement(select_1.SelectContent, null, ENTITY_TYPES.map(function (e) { return (React.createElement(select_1.SelectItem, { key: e.value, value: e.value }, e.label)); })))),
                            React.createElement("div", null,
                                React.createElement(label_1.Label, null, "Trigger *"),
                                React.createElement(select_1.Select, { value: form.triggerType, onValueChange: function (v) { return setForm(__assign(__assign({}, form), { triggerType: v })); } },
                                    React.createElement(select_1.SelectTrigger, null,
                                        React.createElement(select_1.SelectValue, { placeholder: "Select trigger" })),
                                    React.createElement(select_1.SelectContent, null, TRIGGER_TYPES.map(function (t) { return (React.createElement(select_1.SelectItem, { key: t.value, value: t.value }, t.label)); }))))),
                        React.createElement("div", { className: "grid grid-cols-2 gap-3" },
                            React.createElement("div", null,
                                React.createElement(label_1.Label, null, "Priority"),
                                React.createElement(select_1.Select, { value: form.priority, onValueChange: function (v) { return setForm(__assign(__assign({}, form), { priority: v })); } },
                                    React.createElement(select_1.SelectTrigger, null,
                                        React.createElement(select_1.SelectValue, null)),
                                    React.createElement(select_1.SelectContent, null,
                                        React.createElement(select_1.SelectItem, { value: "low" }, "Low"),
                                        React.createElement(select_1.SelectItem, { value: "normal" }, "Normal"),
                                        React.createElement(select_1.SelectItem, { value: "high" }, "High")))),
                            React.createElement("div", null,
                                React.createElement(label_1.Label, null, "Action Type"),
                                React.createElement(select_1.Select, { value: form.actionType, onValueChange: function (v) { return setForm(__assign(__assign({}, form), { actionType: v })); } },
                                    React.createElement(select_1.SelectTrigger, null,
                                        React.createElement(select_1.SelectValue, null)),
                                    React.createElement(select_1.SelectContent, null, ACTION_TYPES.map(function (a) { return (React.createElement(select_1.SelectItem, { key: a.value, value: a.value }, a.label)); }))))),
                        React.createElement("div", null,
                            React.createElement(label_1.Label, null, "Condition (optional)"),
                            React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2" },
                                React.createElement(input_1.Input, { placeholder: "Field", value: form.conditionField, onChange: function (e) { return setForm(__assign(__assign({}, form), { conditionField: e.target.value })); } }),
                                React.createElement(select_1.Select, { value: form.conditionOperator, onValueChange: function (v) { return setForm(__assign(__assign({}, form), { conditionOperator: v })); } },
                                    React.createElement(select_1.SelectTrigger, null,
                                        React.createElement(select_1.SelectValue, null)),
                                    React.createElement(select_1.SelectContent, null,
                                        React.createElement(select_1.SelectItem, { value: "equals" }, "Equals"),
                                        React.createElement(select_1.SelectItem, { value: "not_equals" }, "Not Equals"),
                                        React.createElement(select_1.SelectItem, { value: "greater_than" }, "Greater Than"),
                                        React.createElement(select_1.SelectItem, { value: "less_than" }, "Less Than"),
                                        React.createElement(select_1.SelectItem, { value: "contains" }, "Contains"))),
                                React.createElement(input_1.Input, { placeholder: "Value", value: form.conditionValue, onChange: function (e) { return setForm(__assign(__assign({}, form), { conditionValue: e.target.value })); } })))),
                    React.createElement(dialog_1.DialogFooter, null,
                        React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setCreateOpen(false); } }, "Cancel"),
                        React.createElement(button_1.Button, { onClick: handleCreate, disabled: createMutation.isPending }, createMutation.isPending ? "Creating..." : "Create Rule")))),
            React.createElement(dialog_1.Dialog, { open: editOpen, onOpenChange: setEditOpen },
                React.createElement(dialog_1.DialogContent, { className: "max-w-lg" },
                    React.createElement(dialog_1.DialogHeader, null,
                        React.createElement(dialog_1.DialogTitle, null, "Edit Rule"),
                        React.createElement(dialog_1.DialogDescription, null, "Update rule details")),
                    React.createElement("div", { className: "space-y-4" },
                        React.createElement("div", null,
                            React.createElement(label_1.Label, null, "Rule Name"),
                            React.createElement(input_1.Input, { value: form.name, onChange: function (e) { return setForm(__assign(__assign({}, form), { name: e.target.value })); } })),
                        React.createElement("div", null,
                            React.createElement(label_1.Label, null, "Description"),
                            React.createElement(RichTextEditor_1.RichTextEditor, { value: form.description, onChange: function (html) { return setForm(__assign(__assign({}, form), { description: html })); }, minHeight: "80px" })),
                        React.createElement("div", null,
                            React.createElement(label_1.Label, null, "Priority"),
                            React.createElement(select_1.Select, { value: form.priority, onValueChange: function (v) { return setForm(__assign(__assign({}, form), { priority: v })); } },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, null)),
                                React.createElement(select_1.SelectContent, null,
                                    React.createElement(select_1.SelectItem, { value: "low" }, "Low"),
                                    React.createElement(select_1.SelectItem, { value: "normal" }, "Normal"),
                                    React.createElement(select_1.SelectItem, { value: "high" }, "High"))))),
                    React.createElement(dialog_1.DialogFooter, null,
                        React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setEditOpen(false); } }, "Cancel"),
                        React.createElement(button_1.Button, { onClick: handleUpdate, disabled: updateMutation.isPending }, updateMutation.isPending ? "Saving..." : "Save Changes")))),
            React.createElement(dialog_1.Dialog, { open: detailOpen, onOpenChange: setDetailOpen },
                React.createElement(dialog_1.DialogContent, { className: "max-w-2xl" },
                    React.createElement(dialog_1.DialogHeader, null,
                        React.createElement(dialog_1.DialogTitle, null,
                            "Rule: ", selectedRule === null || selectedRule === void 0 ? void 0 :
                            selectedRule.name)),
                    selectedRule && (React.createElement("div", { className: "space-y-4" },
                        selectedRule.description && (React.createElement("p", { className: "text-muted-foreground" }, selectedRule.description)),
                        React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" },
                            React.createElement("div", { className: "p-3 bg-blue-50 rounded" },
                                React.createElement("div", { className: "text-xs text-muted-foreground" }, "Priority"),
                                React.createElement("div", { className: "text-lg font-bold text-blue-600 capitalize" }, selectedRule.priority || "normal")),
                            React.createElement("div", { className: "p-3 bg-green-50 rounded" },
                                React.createElement("div", { className: "text-xs text-muted-foreground" }, "Status"),
                                React.createElement("div", { className: "text-lg font-bold text-green-600" }, selectedRule.isActive ? "Active" : "Inactive")),
                            React.createElement("div", { className: "p-3 bg-purple-50 rounded" },
                                React.createElement("div", { className: "text-xs text-muted-foreground" }, "Entity"),
                                React.createElement("div", { className: "text-lg font-bold text-purple-600 capitalize" }, ((_a = selectedRule.trigger) === null || _a === void 0 ? void 0 : _a.entity) || "—"))),
                        React.createElement("div", { className: "border-t pt-4" },
                            React.createElement("h4", { className: "font-semibold mb-2" }, "Configuration"),
                            React.createElement("div", { className: "space-y-2 text-sm" },
                                React.createElement("div", null,
                                    React.createElement("span", { className: "text-muted-foreground" }, "Trigger:"),
                                    " ",
                                    ((_c = (_b = selectedRule.trigger) === null || _b === void 0 ? void 0 : _b.type) === null || _c === void 0 ? void 0 : _c.replace(/_/g, " ")) || "—"),
                                React.createElement("div", null,
                                    React.createElement("span", { className: "text-muted-foreground" }, "Conditions:"),
                                    " ",
                                    Array.isArray(selectedRule.conditions) ? selectedRule.conditions.length : 0,
                                    " configured"),
                                React.createElement("div", null,
                                    React.createElement("span", { className: "text-muted-foreground" }, "Actions:"),
                                    " ",
                                    Array.isArray(selectedRule.actions) ? selectedRule.actions.length : 0,
                                    " configured"),
                                React.createElement("div", null,
                                    React.createElement("span", { className: "text-muted-foreground" }, "Created:"),
                                    " ",
                                    selectedRule.createdAt ? new Date(selectedRule.createdAt).toLocaleString() : "—"))))),
                    React.createElement(dialog_1.DialogFooter, null,
                        React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setDetailOpen(false); } }, "Close")))))));
}
exports["default"] = BusinessRulesEngine;
