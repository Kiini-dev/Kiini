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
var label_1 = require("@/components/ui/label");
var card_1 = require("@/components/ui/card");
var table_1 = require("@/components/ui/table");
var dialog_1 = require("@/components/ui/dialog");
var select_1 = require("@/components/ui/select");
var RichTextEditor_1 = require("@/components/RichTextEditor");
var badge_1 = require("@/components/ui/badge");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var trpc_1 = require("@/lib/trpc");
var spinner_1 = require("@/components/ui/spinner");
var date_fns_1 = require("date-fns");
var COMM_TYPES = [
    { value: "announcement", label: "Announcement" },
    { value: "alert", label: "Alert" },
    { value: "notice", label: "Notice" },
    { value: "update", label: "Update" },
    { value: "maintenance", label: "Maintenance" },
];
var PRIORITIES = [
    { value: "low", label: "Low" },
    { value: "normal", label: "Normal" },
    { value: "high", label: "High" },
    { value: "urgent", label: "Urgent" },
];
var RECIPIENT_TYPES = [
    { value: "all_tenants", label: "All Tenants" },
    { value: "specific_tenant", label: "Specific Tenant" },
    { value: "tier_based", label: "Tier Based" },
];
var TYPE_COLORS = {
    announcement: "bg-blue-50 text-blue-700",
    alert: "bg-red-50 text-red-700",
    notice: "bg-amber-50 text-amber-700",
    update: "bg-green-50 text-green-700",
    maintenance: "bg-purple-50 text-purple-700"
};
var PRIORITY_COLORS = {
    low: "bg-gray-50 text-gray-600",
    normal: "bg-blue-50 text-blue-600",
    high: "bg-orange-50 text-orange-600",
    urgent: "bg-red-50 text-red-600"
};
var STATUS_COLORS = {
    draft: "secondary",
    sent: "default",
    scheduled: "outline"
};
function TenantCommunications() {
    var utils = trpc_1.trpc.useUtils();
    var _a = trpc_1.trpc.tenantCommunications.list.useQuery({}), _b = _a.data, communications = _b === void 0 ? [] : _b, isLoading = _a.isLoading;
    var createMutation = trpc_1.trpc.tenantCommunications.create.useMutation({
        onSuccess: function () { utils.tenantCommunications.list.invalidate(); sonner_1.toast.success("Communication created"); setIsOpen(false); },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var updateMutation = trpc_1.trpc.tenantCommunications.update.useMutation({
        onSuccess: function () { utils.tenantCommunications.list.invalidate(); sonner_1.toast.success("Communication updated"); setIsOpen(false); },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var deleteMutation = trpc_1.trpc.tenantCommunications["delete"].useMutation({
        onSuccess: function () { utils.tenantCommunications.list.invalidate(); sonner_1.toast.success("Communication deleted"); },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var sendMutation = trpc_1.trpc.tenantCommunications.send.useMutation({
        onSuccess: function () { utils.tenantCommunications.list.invalidate(); sonner_1.toast.success("Communication sent"); },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var _c = react_1.useState(false), isOpen = _c[0], setIsOpen = _c[1];
    var _d = react_1.useState(false), previewOpen = _d[0], setPreviewOpen = _d[1];
    var _e = react_1.useState(null), previewComm = _e[0], setPreviewComm = _e[1];
    var _f = react_1.useState(null), editing = _f[0], setEditing = _f[1];
    var _g = react_1.useState(""), searchTerm = _g[0], setSearchTerm = _g[1];
    var _h = react_1.useState("all"), statusFilter = _h[0], setStatusFilter = _h[1];
    var _j = react_1.useState("all"), typeFilter = _j[0], setTypeFilter = _j[1];
    var _k = react_1.useState({
        subject: "",
        message: "",
        type: "announcement",
        priority: "normal",
        status: "draft",
        recipientType: "all_tenants"
    }), form = _k[0], setForm = _k[1];
    var filtered = communications.filter(function (c) {
        var matchSearch = c.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.message.toLowerCase().includes(searchTerm.toLowerCase());
        var matchStatus = statusFilter === "all" || c.status === statusFilter;
        var matchType = typeFilter === "all" || c.type === typeFilter;
        return matchSearch && matchStatus && matchType;
    });
    var handleOpenCreate = function () {
        setEditing(null);
        setForm({ subject: "", message: "", type: "announcement", priority: "normal", status: "draft", recipientType: "all_tenants" });
        setIsOpen(true);
    };
    var handleOpenEdit = function (comm) {
        setEditing(comm);
        setForm({
            subject: comm.subject,
            message: comm.message,
            type: comm.type,
            priority: comm.priority,
            status: comm.status,
            recipientType: comm.recipientType
        });
        setIsOpen(true);
    };
    var handleSave = function () {
        if (!form.subject.trim() || !form.message.trim()) {
            sonner_1.toast.error("Subject and message are required");
            return;
        }
        if (editing) {
            updateMutation.mutate(__assign({ id: editing.id }, form));
        }
        else {
            createMutation.mutate(form);
        }
    };
    var handleDelete = function (id) {
        if (confirm("Are you sure you want to delete this communication?")) {
            deleteMutation.mutate(id);
        }
    };
    var handleSend = function (id) {
        if (confirm("Send this communication to all recipients?")) {
            sendMutation.mutate(id);
        }
    };
    if (isLoading)
        return react_1["default"].createElement("div", { className: "flex justify-center py-20" },
            react_1["default"].createElement(spinner_1.Spinner, null));
    return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: "Tenant Communications", description: "Send announcements, alerts, and notices to tenants", icon: react_1["default"].createElement(lucide_react_1.Megaphone, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm/super-admin" },
            { label: "Administration", href: "/admin/management" },
            { label: "Tenant Communications" },
        ] },
        react_1["default"].createElement("div", { className: "space-y-6" },
            react_1["default"].createElement("div", { className: "grid gap-4 md:grid-cols-4" },
                react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, { className: "pb-3" },
                        react_1["default"].createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Total")),
                    react_1["default"].createElement(card_1.CardContent, null,
                        react_1["default"].createElement("p", { className: "text-2xl font-bold" }, communications.length))),
                react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, { className: "pb-3" },
                        react_1["default"].createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Sent")),
                    react_1["default"].createElement(card_1.CardContent, null,
                        react_1["default"].createElement("p", { className: "text-2xl font-bold text-green-600" }, communications.filter(function (c) { return c.status === "sent"; }).length))),
                react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, { className: "pb-3" },
                        react_1["default"].createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Drafts")),
                    react_1["default"].createElement(card_1.CardContent, null,
                        react_1["default"].createElement("p", { className: "text-2xl font-bold text-amber-600" }, communications.filter(function (c) { return c.status === "draft"; }).length))),
                react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, { className: "pb-3" },
                        react_1["default"].createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Scheduled")),
                    react_1["default"].createElement(card_1.CardContent, null,
                        react_1["default"].createElement("p", { className: "text-2xl font-bold text-blue-600" }, communications.filter(function (c) { return c.status === "scheduled"; }).length)))),
            react_1["default"].createElement("div", { className: "flex items-center gap-4 flex-wrap" },
                react_1["default"].createElement("div", { className: "relative flex-1 min-w-[200px]" },
                    react_1["default"].createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
                    react_1["default"].createElement(input_1.Input, { placeholder: "Search communications...", value: searchTerm, onChange: function (e) { return setSearchTerm(e.target.value); }, className: "pl-9" })),
                react_1["default"].createElement(select_1.Select, { value: statusFilter, onValueChange: setStatusFilter },
                    react_1["default"].createElement(select_1.SelectTrigger, { className: "w-36" },
                        react_1["default"].createElement(select_1.SelectValue, { placeholder: "Status" })),
                    react_1["default"].createElement(select_1.SelectContent, null,
                        react_1["default"].createElement(select_1.SelectItem, { value: "all" }, "All Status"),
                        react_1["default"].createElement(select_1.SelectItem, { value: "draft" }, "Draft"),
                        react_1["default"].createElement(select_1.SelectItem, { value: "sent" }, "Sent"),
                        react_1["default"].createElement(select_1.SelectItem, { value: "scheduled" }, "Scheduled"))),
                react_1["default"].createElement(select_1.Select, { value: typeFilter, onValueChange: setTypeFilter },
                    react_1["default"].createElement(select_1.SelectTrigger, { className: "w-40" },
                        react_1["default"].createElement(select_1.SelectValue, { placeholder: "Type" })),
                    react_1["default"].createElement(select_1.SelectContent, null,
                        react_1["default"].createElement(select_1.SelectItem, { value: "all" }, "All Types"),
                        COMM_TYPES.map(function (t) { return react_1["default"].createElement(select_1.SelectItem, { key: t.value, value: t.value }, t.label); }))),
                react_1["default"].createElement(button_1.Button, { onClick: handleOpenCreate },
                    react_1["default"].createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-2" }),
                    "New Communication")),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardHeader, null,
                    react_1["default"].createElement(card_1.CardTitle, null, "Communications"),
                    react_1["default"].createElement(card_1.CardDescription, null,
                        filtered.length,
                        " communication",
                        filtered.length !== 1 ? "s" : "")),
                react_1["default"].createElement(card_1.CardContent, null,
                    react_1["default"].createElement("div", { className: "overflow-x-auto" },
                        react_1["default"].createElement(table_1.Table, null,
                            react_1["default"].createElement(table_1.TableHeader, null,
                                react_1["default"].createElement(table_1.TableRow, null,
                                    react_1["default"].createElement(table_1.TableHead, { className: "w-[250px]" }, "Subject"),
                                    react_1["default"].createElement(table_1.TableHead, null, "Type"),
                                    react_1["default"].createElement(table_1.TableHead, null, "Priority"),
                                    react_1["default"].createElement(table_1.TableHead, null, "Recipients"),
                                    react_1["default"].createElement(table_1.TableHead, null, "Status"),
                                    react_1["default"].createElement(table_1.TableHead, null, "Sent"),
                                    react_1["default"].createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                            react_1["default"].createElement(table_1.TableBody, null, filtered.length === 0 ? (react_1["default"].createElement(table_1.TableRow, null,
                                react_1["default"].createElement(table_1.TableCell, { colSpan: 7, className: "text-center py-8 text-muted-foreground" }, "No communications found"))) : (filtered.map(function (comm) { return (react_1["default"].createElement(table_1.TableRow, { key: comm.id },
                                react_1["default"].createElement(table_1.TableCell, null,
                                    react_1["default"].createElement("div", { className: "font-medium" }, comm.subject),
                                    react_1["default"].createElement("div", { className: "text-xs text-muted-foreground mt-0.5 line-clamp-1" }, comm.message.replace(/<[^>]+>/g, "").slice(0, 80))),
                                react_1["default"].createElement(table_1.TableCell, null,
                                    react_1["default"].createElement(badge_1.Badge, { variant: "secondary", className: TYPE_COLORS[comm.type] || "" }, comm.type)),
                                react_1["default"].createElement(table_1.TableCell, null,
                                    react_1["default"].createElement(badge_1.Badge, { variant: "secondary", className: PRIORITY_COLORS[comm.priority] || "" }, comm.priority)),
                                react_1["default"].createElement(table_1.TableCell, { className: "text-sm capitalize" }, comm.recipientType.replace(/_/g, " ")),
                                react_1["default"].createElement(table_1.TableCell, null,
                                    react_1["default"].createElement(badge_1.Badge, { variant: STATUS_COLORS[comm.status] || "secondary" }, comm.status)),
                                react_1["default"].createElement(table_1.TableCell, { className: "text-sm text-muted-foreground" }, comm.sentAt ? date_fns_1.format(new Date(comm.sentAt), "MMM dd, HH:mm") : "-"),
                                react_1["default"].createElement(table_1.TableCell, { className: "text-right" },
                                    react_1["default"].createElement("div", { className: "flex justify-end gap-1" },
                                        react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { setPreviewComm(comm); setPreviewOpen(true); }, title: "Preview" },
                                            react_1["default"].createElement(lucide_react_1.Eye, { className: "h-4 w-4" })),
                                        comm.status === "draft" && (react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleSend(comm.id); }, title: "Send" },
                                            react_1["default"].createElement(lucide_react_1.Send, { className: "h-4 w-4 text-green-600" }))),
                                        react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleOpenEdit(comm); }, title: "Edit" },
                                            react_1["default"].createElement(lucide_react_1.Edit2, { className: "h-4 w-4" })),
                                        react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleDelete(comm.id); }, className: "text-destructive", title: "Delete" },
                                            react_1["default"].createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))))); })))))))),
        react_1["default"].createElement(dialog_1.Dialog, { open: isOpen, onOpenChange: setIsOpen },
            react_1["default"].createElement(dialog_1.DialogContent, { className: "max-w-3xl max-h-[90vh] overflow-y-auto" },
                react_1["default"].createElement(dialog_1.DialogHeader, null,
                    react_1["default"].createElement(dialog_1.DialogTitle, null, editing ? "Edit Communication" : "New Communication"),
                    react_1["default"].createElement(dialog_1.DialogDescription, null, editing ? "Update the communication details" : "Create a new communication to send to tenants")),
                react_1["default"].createElement("div", { className: "space-y-4 py-4" },
                    react_1["default"].createElement("div", { className: "space-y-2" },
                        react_1["default"].createElement(label_1.Label, null, "Subject *"),
                        react_1["default"].createElement(input_1.Input, { value: form.subject, onChange: function (e) { return setForm(function (p) { return (__assign(__assign({}, p), { subject: e.target.value })); }); }, placeholder: "Communication subject" })),
                    react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" },
                        react_1["default"].createElement("div", { className: "space-y-2" },
                            react_1["default"].createElement(label_1.Label, null, "Type"),
                            react_1["default"].createElement(select_1.Select, { value: form.type, onValueChange: function (val) { return setForm(function (p) { return (__assign(__assign({}, p), { type: val })); }); } },
                                react_1["default"].createElement(select_1.SelectTrigger, null,
                                    react_1["default"].createElement(select_1.SelectValue, null)),
                                react_1["default"].createElement(select_1.SelectContent, null, COMM_TYPES.map(function (t) { return react_1["default"].createElement(select_1.SelectItem, { key: t.value, value: t.value }, t.label); })))),
                        react_1["default"].createElement("div", { className: "space-y-2" },
                            react_1["default"].createElement(label_1.Label, null, "Priority"),
                            react_1["default"].createElement(select_1.Select, { value: form.priority, onValueChange: function (val) { return setForm(function (p) { return (__assign(__assign({}, p), { priority: val })); }); } },
                                react_1["default"].createElement(select_1.SelectTrigger, null,
                                    react_1["default"].createElement(select_1.SelectValue, null)),
                                react_1["default"].createElement(select_1.SelectContent, null, PRIORITIES.map(function (p) { return react_1["default"].createElement(select_1.SelectItem, { key: p.value, value: p.value }, p.label); })))),
                        react_1["default"].createElement("div", { className: "space-y-2" },
                            react_1["default"].createElement(label_1.Label, null, "Recipients"),
                            react_1["default"].createElement(select_1.Select, { value: form.recipientType, onValueChange: function (val) { return setForm(function (p) { return (__assign(__assign({}, p), { recipientType: val })); }); } },
                                react_1["default"].createElement(select_1.SelectTrigger, null,
                                    react_1["default"].createElement(select_1.SelectValue, null)),
                                react_1["default"].createElement(select_1.SelectContent, null, RECIPIENT_TYPES.map(function (r) { return react_1["default"].createElement(select_1.SelectItem, { key: r.value, value: r.value }, r.label); }))))),
                    react_1["default"].createElement("div", { className: "space-y-2" },
                        react_1["default"].createElement(label_1.Label, null, "Message *"),
                        react_1["default"].createElement(RichTextEditor_1.RichTextEditor, { value: form.message, onChange: function (val) { return setForm(function (p) { return (__assign(__assign({}, p), { message: val })); }); }, placeholder: "Write your communication message...", minHeight: "250px" }))),
                react_1["default"].createElement(dialog_1.DialogFooter, { className: "gap-2" },
                    react_1["default"].createElement(button_1.Button, { variant: "outline", onClick: function () { return setIsOpen(false); } }, "Cancel"),
                    react_1["default"].createElement(button_1.Button, { variant: "outline", onClick: function () { setForm(function (p) { return (__assign(__assign({}, p), { status: "draft" })); }); handleSave(); } }, "Save as Draft"),
                    react_1["default"].createElement(button_1.Button, { onClick: function () { setForm(function (p) { return (__assign(__assign({}, p), { status: "sent" })); }); handleSave(); } },
                        react_1["default"].createElement(lucide_react_1.Send, { className: "h-4 w-4 mr-2" }),
                        "Send Now")))),
        react_1["default"].createElement(dialog_1.Dialog, { open: previewOpen, onOpenChange: setPreviewOpen },
            react_1["default"].createElement(dialog_1.DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto" },
                react_1["default"].createElement(dialog_1.DialogHeader, null,
                    react_1["default"].createElement(dialog_1.DialogTitle, null, "Communication Preview")),
                previewComm && (react_1["default"].createElement("div", { className: "space-y-4" },
                    react_1["default"].createElement("div", { className: "flex items-center gap-2 flex-wrap" },
                        react_1["default"].createElement(badge_1.Badge, { variant: "secondary", className: TYPE_COLORS[previewComm.type] }, previewComm.type),
                        react_1["default"].createElement(badge_1.Badge, { variant: "secondary", className: PRIORITY_COLORS[previewComm.priority] }, previewComm.priority),
                        react_1["default"].createElement(badge_1.Badge, { variant: STATUS_COLORS[previewComm.status] }, previewComm.status)),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("div", { className: "text-sm text-muted-foreground" }, "Subject"),
                        react_1["default"].createElement("div", { className: "font-medium text-lg" }, previewComm.subject)),
                    react_1["default"].createElement("div", { className: "border rounded-md p-4" },
                        react_1["default"].createElement("div", { className: "prose max-w-none", dangerouslySetInnerHTML: { __html: previewComm.message } })),
                    react_1["default"].createElement("div", { className: "text-xs text-muted-foreground" },
                        "Recipients: ",
                        previewComm.recipientType.replace(/_/g, " "),
                        previewComm.sentAt && " | Sent: " + date_fns_1.format(new Date(previewComm.sentAt), "PPpp"),
                        previewComm.createdAt && " | Created: " + date_fns_1.format(new Date(previewComm.createdAt), "PPpp"))))))));
}
exports["default"] = TenantCommunications;
