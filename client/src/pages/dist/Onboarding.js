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
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var card_1 = require("@/components/ui/card");
var table_1 = require("@/components/ui/table");
var dialog_1 = require("@/components/ui/dialog");
var alert_dialog_1 = require("@/components/ui/alert-dialog");
var badge_1 = require("@/components/ui/badge");
var select_1 = require("@/components/ui/select");
var textarea_1 = require("@/components/ui/textarea");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var permissions_1 = require("@/lib/permissions");
var spinner_1 = require("@/components/ui/spinner");
var sonner_1 = require("sonner");
var date_fns_1 = require("date-fns");
var stats_card_1 = require("@/components/ui/stats-card");
function Onboarding() {
    var _a;
    permissions_1.useRequireFeature("hr:view");
    var _b = react_1.useState("checklists"), activeTab = _b[0], setActiveTab = _b[1];
    var _c = react_1.useState(""), search = _c[0], setSearch = _c[1];
    var _d = react_1.useState(false), showCreateTemplate = _d[0], setShowCreateTemplate = _d[1];
    var _e = react_1.useState(false), showCreateChecklist = _e[0], setShowCreateChecklist = _e[1];
    var _f = react_1.useState({ name: "", description: "", type: "onboarding" }), templateForm = _f[0], setTemplateForm = _f[1];
    var _g = react_1.useState({ employeeId: "", templateId: "", type: "onboarding" }), checklistForm = _g[0], setChecklistForm = _g[1];
    var _h = react_1.useState(null), selectedChecklist = _h[0], setSelectedChecklist = _h[1];
    var _j = react_1.useState(null), deleteId = _j[0], setDeleteId = _j[1];
    var _k = react_1.useState("template"), deleteType = _k[0], setDeleteType = _k[1];
    var templates = trpc_1.trpc.onboarding.listTemplates.useQuery();
    var checklists = trpc_1.trpc.onboarding.listChecklists.useQuery();
    var employees = trpc_1.trpc.employees.list.useQuery();
    var checklistDetail = trpc_1.trpc.onboarding.getChecklist.useQuery({ id: selectedChecklist }, { enabled: !!selectedChecklist });
    var utils = trpc_1.trpc.useUtils();
    var createTemplate = trpc_1.trpc.onboarding.createTemplate.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Template created");
            setShowCreateTemplate(false);
            setTemplateForm({ name: "", description: "", type: "onboarding" });
            utils.onboarding.listTemplates.invalidate();
        },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var createChecklist = trpc_1.trpc.onboarding.createChecklist.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Checklist created from template");
            setShowCreateChecklist(false);
            setChecklistForm({ employeeId: "", templateId: "", type: "onboarding" });
            utils.onboarding.listChecklists.invalidate();
        },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var updateTask = trpc_1.trpc.onboarding.updateTask.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Task updated");
            utils.onboarding.getChecklist.invalidate();
            utils.onboarding.listChecklists.invalidate();
        },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var deleteTemplate = trpc_1.trpc.onboarding.deleteTemplate.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Deleted");
            setDeleteId(null);
            utils.onboarding.listTemplates.invalidate();
        },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var filteredChecklists = (checklists.data || []).filter(function (c) {
        return !search || (c.firstName + " " + c.lastName).toLowerCase().includes(search.toLowerCase());
    });
    var filteredTemplates = (templates.data || []).filter(function (t) {
        return !search || t.name.toLowerCase().includes(search.toLowerCase());
    });
    var stats = {
        total: (checklists.data || []).length,
        pending: (checklists.data || []).filter(function (c) { return c.status === "pending" || c.status === "in_progress"; }).length,
        completed: (checklists.data || []).filter(function (c) { return c.status === "completed"; }).length,
        templates: (templates.data || []).length
    };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Onboarding & Offboarding", description: "Manage employee onboarding and offboarding checklists", icon: lucide_react_1.UserPlus, breadcrumbs: [{ label: "HR", href: "/employees" }, { label: "Onboarding" }] },
        React.createElement("div", { className: "grid gap-4 md:grid-cols-4 mb-6" },
            React.createElement(stats_card_1.StatsCard, { label: "Total Checklists", value: stats.total, icon: React.createElement(lucide_react_1.ClipboardList, { className: "h-5 w-5" }), color: "border-l-blue-500" }),
            React.createElement(stats_card_1.StatsCard, { label: "In Progress", value: stats.pending, icon: React.createElement(lucide_react_1.Clock, { className: "h-5 w-5" }), color: "border-l-orange-500" }),
            React.createElement(stats_card_1.StatsCard, { label: "Completed", value: stats.completed, icon: React.createElement(lucide_react_1.CheckCircle, { className: "h-5 w-5" }), color: "border-l-green-500" }),
            React.createElement(stats_card_1.StatsCard, { label: "Templates", value: stats.templates, icon: React.createElement(lucide_react_1.Users, { className: "h-5 w-5" }), color: "border-l-purple-500" })),
        React.createElement("div", { className: "flex gap-2 mb-4" },
            React.createElement(button_1.Button, { variant: activeTab === "checklists" ? "default" : "outline", onClick: function () { return setActiveTab("checklists"); } },
                React.createElement(lucide_react_1.ClipboardList, { className: "h-4 w-4 mr-2" }),
                " Checklists"),
            React.createElement(button_1.Button, { variant: activeTab === "templates" ? "default" : "outline", onClick: function () { return setActiveTab("templates"); } },
                React.createElement(lucide_react_1.Users, { className: "h-4 w-4 mr-2" }),
                " Templates")),
        React.createElement("div", { className: "flex items-center gap-3 mb-4" },
            React.createElement("div", { className: "relative flex-1 max-w-sm" },
                React.createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
                React.createElement(input_1.Input, { placeholder: "Search...", value: search, onChange: function (e) { return setSearch(e.target.value); }, className: "pl-9" })),
            activeTab === "templates" && (React.createElement(button_1.Button, { onClick: function () { return setShowCreateTemplate(true); } },
                React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-2" }),
                " New Template")),
            activeTab === "checklists" && (React.createElement(button_1.Button, { onClick: function () { return setShowCreateChecklist(true); } },
                React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-2" }),
                " New Checklist"))),
        activeTab === "checklists" && (React.createElement(card_1.Card, null,
            React.createElement(card_1.CardContent, { className: "p-0" }, checklists.isLoading ? (React.createElement("div", { className: "flex justify-center p-8" },
                React.createElement(spinner_1.Spinner, null))) : (React.createElement(table_1.Table, null,
                React.createElement(table_1.TableHeader, null,
                    React.createElement(table_1.TableRow, null,
                        React.createElement(table_1.TableHead, null, "Employee"),
                        React.createElement(table_1.TableHead, null, "Type"),
                        React.createElement(table_1.TableHead, null, "Template"),
                        React.createElement(table_1.TableHead, null, "Progress"),
                        React.createElement(table_1.TableHead, null, "Status"),
                        React.createElement(table_1.TableHead, null, "Created"),
                        React.createElement(table_1.TableHead, null, "Actions"))),
                React.createElement(table_1.TableBody, null, filteredChecklists.length === 0 ? (React.createElement(table_1.TableRow, null,
                    React.createElement(table_1.TableCell, { colSpan: 7, className: "text-center py-8 text-muted-foreground" }, "No checklists found"))) : filteredChecklists.map(function (c) { return (React.createElement(table_1.TableRow, { key: c.id, className: "cursor-pointer", onClick: function () { return setSelectedChecklist(c.id); } },
                    React.createElement(table_1.TableCell, { className: "font-medium" },
                        c.firstName,
                        " ",
                        c.lastName),
                    React.createElement(table_1.TableCell, null,
                        React.createElement(badge_1.Badge, { variant: c.type === "onboarding" ? "default" : "secondary" }, c.type)),
                    React.createElement(table_1.TableCell, null, c.templateName || "-"),
                    React.createElement(table_1.TableCell, null,
                        c.completedTasks || 0,
                        "/",
                        c.totalTasks || 0),
                    React.createElement(table_1.TableCell, null,
                        React.createElement(badge_1.Badge, { variant: c.status === "completed" ? "default" : c.status === "in_progress" ? "secondary" : "outline" }, c.status)),
                    React.createElement(table_1.TableCell, null, c.createdAt ? date_fns_1.format(new Date(c.createdAt), "MMM d, yyyy") : "-"),
                    React.createElement(table_1.TableCell, null,
                        React.createElement(button_1.Button, { size: "sm", variant: "ghost", onClick: function (e) { e.stopPropagation(); setSelectedChecklist(c.id); } }, "View Tasks")))); }))))))),
        activeTab === "templates" && (React.createElement(card_1.Card, null,
            React.createElement(card_1.CardContent, { className: "p-0" }, templates.isLoading ? (React.createElement("div", { className: "flex justify-center p-8" },
                React.createElement(spinner_1.Spinner, null))) : (React.createElement(table_1.Table, null,
                React.createElement(table_1.TableHeader, null,
                    React.createElement(table_1.TableRow, null,
                        React.createElement(table_1.TableHead, null, "Name"),
                        React.createElement(table_1.TableHead, null, "Type"),
                        React.createElement(table_1.TableHead, null, "Description"),
                        React.createElement(table_1.TableHead, null, "Created"),
                        React.createElement(table_1.TableHead, null, "Actions"))),
                React.createElement(table_1.TableBody, null, filteredTemplates.length === 0 ? (React.createElement(table_1.TableRow, null,
                    React.createElement(table_1.TableCell, { colSpan: 5, className: "text-center py-8 text-muted-foreground" }, "No templates"))) : filteredTemplates.map(function (t) { return (React.createElement(table_1.TableRow, { key: t.id },
                    React.createElement(table_1.TableCell, { className: "font-medium" }, t.name),
                    React.createElement(table_1.TableCell, null,
                        React.createElement(badge_1.Badge, { variant: t.type === "onboarding" ? "default" : "secondary" }, t.type)),
                    React.createElement(table_1.TableCell, { className: "max-w-[300px] truncate" }, t.description || "-"),
                    React.createElement(table_1.TableCell, null, t.createdAt ? date_fns_1.format(new Date(t.createdAt), "MMM d, yyyy") : "-"),
                    React.createElement(table_1.TableCell, null,
                        React.createElement(button_1.Button, { size: "icon", variant: "ghost", className: "text-destructive", onClick: function () { setDeleteId(t.id); setDeleteType("template"); } },
                            React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" }))))); }))))))),
        React.createElement(dialog_1.Dialog, { open: !!selectedChecklist, onOpenChange: function () { return setSelectedChecklist(null); } },
            React.createElement(dialog_1.DialogContent, { className: "max-w-2xl max-h-[80vh] overflow-y-auto" },
                React.createElement(dialog_1.DialogHeader, null,
                    React.createElement(dialog_1.DialogTitle, null, "Checklist Tasks"),
                    React.createElement(dialog_1.DialogDescription, null, "Toggle tasks as they are completed")),
                checklistDetail.isLoading ? React.createElement(spinner_1.Spinner, null) : (React.createElement("div", { className: "space-y-2" }, (((_a = checklistDetail.data) === null || _a === void 0 ? void 0 : _a.tasks) || []).map(function (task) { return (React.createElement("div", { key: task.id, className: "flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50" },
                    React.createElement("input", { type: "checkbox", checked: task.isCompleted, onChange: function () { return updateTask.mutate({ id: task.id, isCompleted: !task.isCompleted }); }, className: "h-5 w-5 rounded" }),
                    React.createElement("div", { className: "flex-1" },
                        React.createElement("p", { className: "font-medium " + (task.isCompleted ? "line-through text-muted-foreground" : "") }, task.title),
                        task.description && React.createElement("p", { className: "text-sm text-muted-foreground" }, task.description)),
                    task.isRequired && React.createElement(badge_1.Badge, { variant: "outline", className: "text-xs" }, "Required"),
                    task.assignedTo && React.createElement(badge_1.Badge, { variant: "secondary", className: "text-xs" }, task.assignedTo))); }))))),
        React.createElement(dialog_1.Dialog, { open: showCreateTemplate, onOpenChange: setShowCreateTemplate },
            React.createElement(dialog_1.DialogContent, null,
                React.createElement(dialog_1.DialogHeader, null,
                    React.createElement(dialog_1.DialogTitle, null, "Create Template"),
                    React.createElement(dialog_1.DialogDescription, null, "Create a reusable onboarding/offboarding template")),
                React.createElement("div", { className: "space-y-4" },
                    React.createElement(input_1.Input, { placeholder: "Template name", value: templateForm.name, onChange: function (e) { return setTemplateForm(function (p) { return (__assign(__assign({}, p), { name: e.target.value })); }); } }),
                    React.createElement(textarea_1.Textarea, { placeholder: "Description", value: templateForm.description, onChange: function (e) { return setTemplateForm(function (p) { return (__assign(__assign({}, p), { description: e.target.value })); }); } }),
                    React.createElement(select_1.Select, { value: templateForm.type, onValueChange: function (v) { return setTemplateForm(function (p) { return (__assign(__assign({}, p), { type: v })); }); } },
                        React.createElement(select_1.SelectTrigger, null,
                            React.createElement(select_1.SelectValue, null)),
                        React.createElement(select_1.SelectContent, null,
                            React.createElement(select_1.SelectItem, { value: "onboarding" }, "Onboarding"),
                            React.createElement(select_1.SelectItem, { value: "offboarding" }, "Offboarding"))),
                    React.createElement(button_1.Button, { className: "w-full", disabled: !templateForm.name || createTemplate.isPending, onClick: function () { return createTemplate.mutate(templateForm); } },
                        createTemplate.isPending ? React.createElement(spinner_1.Spinner, { className: "mr-2" }) : null,
                        " Create Template")))),
        React.createElement(dialog_1.Dialog, { open: showCreateChecklist, onOpenChange: setShowCreateChecklist },
            React.createElement(dialog_1.DialogContent, null,
                React.createElement(dialog_1.DialogHeader, null,
                    React.createElement(dialog_1.DialogTitle, null, "Create Checklist"),
                    React.createElement(dialog_1.DialogDescription, null, "Assign a checklist to an employee from a template")),
                React.createElement("div", { className: "space-y-4" },
                    React.createElement(select_1.Select, { value: checklistForm.employeeId, onValueChange: function (v) { return setChecklistForm(function (p) { return (__assign(__assign({}, p), { employeeId: v })); }); } },
                        React.createElement(select_1.SelectTrigger, null,
                            React.createElement(select_1.SelectValue, { placeholder: "Select Employee" })),
                        React.createElement(select_1.SelectContent, null, (employees.data || []).map(function (e) { return (React.createElement(select_1.SelectItem, { key: e.id, value: e.id },
                            e.firstName,
                            " ",
                            e.lastName)); }))),
                    React.createElement(select_1.Select, { value: checklistForm.templateId, onValueChange: function (v) { return setChecklistForm(function (p) { return (__assign(__assign({}, p), { templateId: v })); }); } },
                        React.createElement(select_1.SelectTrigger, null,
                            React.createElement(select_1.SelectValue, { placeholder: "Select Template" })),
                        React.createElement(select_1.SelectContent, null, (templates.data || []).map(function (t) { return (React.createElement(select_1.SelectItem, { key: t.id, value: t.id },
                            t.name,
                            " (",
                            t.type,
                            ")")); }))),
                    React.createElement(select_1.Select, { value: checklistForm.type, onValueChange: function (v) { return setChecklistForm(function (p) { return (__assign(__assign({}, p), { type: v })); }); } },
                        React.createElement(select_1.SelectTrigger, null,
                            React.createElement(select_1.SelectValue, null)),
                        React.createElement(select_1.SelectContent, null,
                            React.createElement(select_1.SelectItem, { value: "onboarding" }, "Onboarding"),
                            React.createElement(select_1.SelectItem, { value: "offboarding" }, "Offboarding"))),
                    React.createElement(button_1.Button, { className: "w-full", disabled: !checklistForm.employeeId || !checklistForm.templateId || createChecklist.isPending, onClick: function () { return createChecklist.mutate(checklistForm); } },
                        createChecklist.isPending ? React.createElement(spinner_1.Spinner, { className: "mr-2" }) : null,
                        " Create Checklist")))),
        React.createElement(alert_dialog_1.AlertDialog, { open: !!deleteId, onOpenChange: function () { return setDeleteId(null); } },
            React.createElement(alert_dialog_1.AlertDialogContent, null,
                React.createElement(alert_dialog_1.AlertDialogTitle, null,
                    "Delete ",
                    deleteType,
                    "?"),
                React.createElement(alert_dialog_1.AlertDialogDescription, null, "This action cannot be undone."),
                React.createElement("div", { className: "flex justify-end gap-2" },
                    React.createElement(alert_dialog_1.AlertDialogCancel, null, "Cancel"),
                    React.createElement(alert_dialog_1.AlertDialogAction, { onClick: function () { return deleteId && deleteTemplate.mutate({ id: deleteId }); } }, "Delete"))))));
}
exports["default"] = Onboarding;
