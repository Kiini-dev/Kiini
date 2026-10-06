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
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var tabs_1 = require("@/components/ui/tabs");
var table_1 = require("@/components/ui/table");
var dialog_1 = require("@/components/ui/dialog");
var checkbox_1 = require("@/components/ui/checkbox");
var RichTextEditor_1 = require("@/components/RichTextEditor");
var DocumentBlockEditor_1 = require("@/components/DocumentBlockEditor");
var HTMLEditor_1 = require("@/components/HTMLEditor");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var avatar_1 = require("@/components/ui/avatar");
var trpc_1 = require("@/lib/trpc");
var spinner_1 = require("@/components/ui/spinner");
// Document type configurations
var DOC_CONFIG = {
    invoice: {
        label: "Invoice Templates",
        singular: "Invoice",
        parentLabel: "Invoices",
        parentHref: "/invoices",
        dashboardHref: "/crm/super-admin",
        variables: [
            { label: "Client Name", value: "{{client_name}}" },
            { label: "Client Email", value: "{{client_email}}" },
            { label: "Client Address", value: "{{client_address}}" },
            { label: "Invoice Number", value: "{{invoice_number}}" },
            { label: "Invoice Date", value: "{{invoice_date}}" },
            { label: "Due Date", value: "{{due_date}}" },
            { label: "Total Amount", value: "{{total_amount}}" },
            { label: "Sub Total", value: "{{sub_total}}" },
            { label: "Tax Amount", value: "{{tax_amount}}" },
            { label: "Discount", value: "{{discount}}" },
            { label: "Payment Terms", value: "{{payment_terms}}" },
            { label: "Items Table", value: "{{items_table}}" },
            { label: "Notes", value: "{{notes}}" },
            { label: "Company Name", value: "{{company_name}}" },
            { label: "Company Address", value: "{{company_address}}" },
            { label: "Company Phone", value: "{{company_phone}}" },
            { label: "Company Email", value: "{{company_email}}" },
            { label: "Logo URL", value: "{{logo_url}}" },
            { label: "Today's Date", value: "{{todays_date}}" },
        ]
    },
    estimate: {
        label: "Estimate Templates",
        singular: "Estimate",
        parentLabel: "Estimates",
        parentHref: "/estimates",
        dashboardHref: "/crm/super-admin",
        variables: [
            { label: "Client Name", value: "{{client_name}}" },
            { label: "Client Email", value: "{{client_email}}" },
            { label: "Client Address", value: "{{client_address}}" },
            { label: "Estimate Number", value: "{{estimate_number}}" },
            { label: "Estimate Date", value: "{{estimate_date}}" },
            { label: "Expiry Date", value: "{{expiry_date}}" },
            { label: "Total Amount", value: "{{total_amount}}" },
            { label: "Sub Total", value: "{{sub_total}}" },
            { label: "Tax Amount", value: "{{tax_amount}}" },
            { label: "Items Table", value: "{{items_table}}" },
            { label: "Notes", value: "{{notes}}" },
            { label: "Terms", value: "{{terms}}" },
            { label: "Company Name", value: "{{company_name}}" },
            { label: "Company Address", value: "{{company_address}}" },
            { label: "Logo URL", value: "{{logo_url}}" },
            { label: "Today's Date", value: "{{todays_date}}" },
        ]
    },
    quotation: {
        label: "Quotation Templates",
        singular: "Quotation",
        parentLabel: "Quotations",
        parentHref: "/quotations",
        dashboardHref: "/crm/super-admin",
        variables: [
            { label: "Client Name", value: "{{client_name}}" },
            { label: "Client Email", value: "{{client_email}}" },
            { label: "Client Address", value: "{{client_address}}" },
            { label: "Quotation Number", value: "{{quotation_number}}" },
            { label: "Quotation Date", value: "{{quotation_date}}" },
            { label: "Valid Until", value: "{{valid_until}}" },
            { label: "Total Amount", value: "{{total_amount}}" },
            { label: "Sub Total", value: "{{sub_total}}" },
            { label: "Tax Amount", value: "{{tax_amount}}" },
            { label: "Items Table", value: "{{items_table}}" },
            { label: "Terms & Conditions", value: "{{terms}}" },
            { label: "Notes", value: "{{notes}}" },
            { label: "Company Name", value: "{{company_name}}" },
            { label: "Company Address", value: "{{company_address}}" },
            { label: "Logo URL", value: "{{logo_url}}" },
            { label: "Today's Date", value: "{{todays_date}}" },
        ]
    },
    receipt: {
        label: "Receipt Templates",
        singular: "Receipt",
        parentLabel: "Receipts",
        parentHref: "/receipts",
        dashboardHref: "/crm/super-admin",
        variables: [
            { label: "Client Name", value: "{{client_name}}" },
            { label: "Receipt Number", value: "{{receipt_number}}" },
            { label: "Receipt Date", value: "{{receipt_date}}" },
            { label: "Payment Amount", value: "{{payment_amount}}" },
            { label: "Payment Method", value: "{{payment_method}}" },
            { label: "Payment Reference", value: "{{payment_reference}}" },
            { label: "Invoice Number", value: "{{invoice_number}}" },
            { label: "Balance Due", value: "{{balance_due}}" },
            { label: "Notes", value: "{{notes}}" },
            { label: "Company Name", value: "{{company_name}}" },
            { label: "Company Address", value: "{{company_address}}" },
            { label: "Logo URL", value: "{{logo_url}}" },
            { label: "Today's Date", value: "{{todays_date}}" },
        ]
    },
    purchase_order: {
        label: "Purchase Order Templates",
        singular: "Purchase Order",
        parentLabel: "Purchase Orders",
        parentHref: "/lpos",
        dashboardHref: "/crm/super-admin",
        variables: [
            { label: "Supplier Name", value: "{{supplier_name}}" },
            { label: "Supplier Email", value: "{{supplier_email}}" },
            { label: "Supplier Address", value: "{{supplier_address}}" },
            { label: "PO Number", value: "{{po_number}}" },
            { label: "PO Date", value: "{{po_date}}" },
            { label: "Delivery Date", value: "{{delivery_date}}" },
            { label: "Total Amount", value: "{{total_amount}}" },
            { label: "Sub Total", value: "{{sub_total}}" },
            { label: "Tax Amount", value: "{{tax_amount}}" },
            { label: "Items Table", value: "{{items_table}}" },
            { label: "Delivery Address", value: "{{delivery_address}}" },
            { label: "Payment Terms", value: "{{payment_terms}}" },
            { label: "Notes", value: "{{notes}}" },
            { label: "Company Name", value: "{{company_name}}" },
            { label: "Company Address", value: "{{company_address}}" },
            { label: "Logo URL", value: "{{logo_url}}" },
            { label: "Authorized By", value: "{{authorized_by}}" },
            { label: "Today's Date", value: "{{todays_date}}" },
        ]
    },
    credit_note: {
        label: "Credit Note Templates",
        singular: "Credit Note",
        parentLabel: "Credit Notes",
        parentHref: "/credit-notes",
        dashboardHref: "/crm/super-admin",
        variables: [
            { label: "Client Name", value: "{{client_name}}" },
            { label: "Client Email", value: "{{client_email}}" },
            { label: "Credit Note Number", value: "{{credit_note_number}}" },
            { label: "Credit Note Date", value: "{{credit_note_date}}" },
            { label: "Invoice Number", value: "{{invoice_number}}" },
            { label: "Total Amount", value: "{{total_amount}}" },
            { label: "Reason", value: "{{reason}}" },
            { label: "Items Table", value: "{{items_table}}" },
            { label: "Notes", value: "{{notes}}" },
            { label: "Company Name", value: "{{company_name}}" },
            { label: "Company Address", value: "{{company_address}}" },
            { label: "Logo URL", value: "{{logo_url}}" },
            { label: "Today's Date", value: "{{todays_date}}" },
        ]
    },
    debit_note: {
        label: "Debit Note Templates",
        singular: "Debit Note",
        parentLabel: "Debit Notes",
        parentHref: "/debit-notes",
        dashboardHref: "/crm/super-admin",
        variables: [
            { label: "Client Name", value: "{{client_name}}" },
            { label: "Client Email", value: "{{client_email}}" },
            { label: "Debit Note Number", value: "{{debit_note_number}}" },
            { label: "Debit Note Date", value: "{{debit_note_date}}" },
            { label: "Invoice Number", value: "{{invoice_number}}" },
            { label: "Total Amount", value: "{{total_amount}}" },
            { label: "Reason", value: "{{reason}}" },
            { label: "Items Table", value: "{{items_table}}" },
            { label: "Notes", value: "{{notes}}" },
            { label: "Company Name", value: "{{company_name}}" },
            { label: "Company Address", value: "{{company_address}}" },
            { label: "Logo URL", value: "{{logo_url}}" },
            { label: "Today's Date", value: "{{todays_date}}" },
        ]
    }
};
function DocumentTemplates(_a) {
    var type = _a.type;
    var config = DOC_CONFIG[type];
    if (!config)
        return react_1["default"].createElement("div", { className: "p-8 text-center text-muted-foreground" },
            "Unknown document type: ",
            type);
    var utils = trpc_1.trpc.useUtils();
    var _b = trpc_1.trpc.documentTemplates.list.useQuery({ type: type }), _c = _b.data, templates = _c === void 0 ? [] : _c, isLoading = _b.isLoading;
    var createMutation = trpc_1.trpc.documentTemplates.create.useMutation({
        onSuccess: function () { utils.documentTemplates.list.invalidate(); sonner_1.toast.success("Template created"); setView("list"); },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var updateMutation = trpc_1.trpc.documentTemplates.update.useMutation({
        onSuccess: function () { utils.documentTemplates.list.invalidate(); sonner_1.toast.success("Template updated"); setView("list"); },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var deleteMutation = trpc_1.trpc.documentTemplates["delete"].useMutation({
        onSuccess: function () { utils.documentTemplates.list.invalidate(); sonner_1.toast.success("Template deleted"); },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var duplicateMutation = trpc_1.trpc.documentTemplates.duplicate.useMutation({
        onSuccess: function () { utils.documentTemplates.list.invalidate(); sonner_1.toast.success("Template duplicated"); },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var setDefaultMutation = trpc_1.trpc.documentTemplates.setDefault.useMutation({
        onSuccess: function () { utils.documentTemplates.list.invalidate(); sonner_1.toast.success("Template set as default"); },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var unsetDefaultMutation = trpc_1.trpc.documentTemplates.unsetDefault.useMutation({
        onSuccess: function () { utils.documentTemplates.list.invalidate(); sonner_1.toast.success("Template default status removed"); },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var _d = react_1.useState(""), searchTerm = _d[0], setSearchTerm = _d[1];
    var _e = react_1.useState("list"), view = _e[0], setView = _e[1];
    var _f = react_1.useState(null), editingTemplate = _f[0], setEditingTemplate = _f[1];
    var _g = react_1.useState(null), previewTemplate = _g[0], setPreviewTemplate = _g[1];
    var _h = react_1.useState({ title: "", content: "", isDefault: false }), form = _h[0], setForm = _h[1];
    var _j = react_1.useState("block"), editorMode = _j[0], setEditorMode = _j[1];
    var filtered = templates.filter(function (t) {
        return t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.createdBy.toLowerCase().includes(searchTerm.toLowerCase());
    });
    var openEditor = function (template) {
        if (template) {
            setEditingTemplate(template);
            setForm({ title: template.title, content: template.content, isDefault: template.isDefault });
        }
        else {
            setEditingTemplate(null);
            setForm({ title: "", content: "", isDefault: false });
        }
        setView("editor");
    };
    var handleSave = function () {
        if (!form.title.trim()) {
            sonner_1.toast.error("Please enter a template title");
            return;
        }
        if (editingTemplate) {
            updateMutation.mutate({ id: editingTemplate.id, title: form.title, content: form.content, isDefault: form.isDefault });
        }
        else {
            createMutation.mutate({ type: type, title: form.title, content: form.content, isDefault: form.isDefault });
        }
    };
    var handleDelete = function (id) {
        if (confirm("Are you sure you want to delete this template?")) {
            deleteMutation.mutate(id);
        }
    };
    // Editor view
    if (view === "editor") {
        return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: editingTemplate ? "Edit " + config.singular + " Template" : "New " + config.singular + " Template", description: "Design a reusable " + config.singular.toLowerCase() + " template", icon: react_1["default"].createElement(lucide_react_1.FileText, { className: "h-5 w-5" }), breadcrumbs: [
                { label: "Dashboard", href: config.dashboardHref },
                { label: config.parentLabel, href: config.parentHref },
                { label: "Templates", href: config.parentHref + "/templates" },
                { label: editingTemplate ? "Edit" : "New Template" },
            ] },
            react_1["default"].createElement("div", { className: "space-y-4" },
                react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                    react_1["default"].createElement(button_1.Button, { variant: "ghost", onClick: function () { return setView("list"); } },
                        react_1["default"].createElement(lucide_react_1.ArrowLeft, { className: "h-4 w-4 mr-2" }),
                        "Back to Templates"),
                    react_1["default"].createElement(button_1.Button, { onClick: handleSave, disabled: createMutation.isPending || updateMutation.isPending },
                        editingTemplate ? "Update" : "Create",
                        " Template")),
                react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardContent, { className: "pt-6 space-y-4" },
                        react_1["default"].createElement("div", { className: "space-y-2" },
                            react_1["default"].createElement(label_1.Label, null, "Template Title *"),
                            react_1["default"].createElement(input_1.Input, { value: form.title, onChange: function (e) { return setForm(function (p) { return (__assign(__assign({}, p), { title: e.target.value })); }); }, placeholder: "e.g., Standard " + config.singular })),
                        react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                            react_1["default"].createElement(checkbox_1.Checkbox, { id: "isDefault", checked: form.isDefault, onCheckedChange: function (checked) { return setForm(function (p) { return (__assign(__assign({}, p), { isDefault: checked })); }); } }),
                            react_1["default"].createElement(label_1.Label, { htmlFor: "isDefault", className: "font-normal cursor-pointer" }, "Set as default template")),
                        react_1["default"].createElement("div", { className: "space-y-2" },
                            react_1["default"].createElement(label_1.Label, null, "Template Content"),
                            react_1["default"].createElement("p", { className: "text-sm text-gray-600" }, "Create rich content using blocks, HTML, or rich text editor. Choose the editor that best suits your workflow."),
                            react_1["default"].createElement(tabs_1.Tabs, { value: editorMode, onValueChange: function (val) { return setEditorMode(val); }, className: "w-full mt-4" },
                                react_1["default"].createElement(tabs_1.TabsList, { className: "grid w-full grid-cols-3" },
                                    react_1["default"].createElement(tabs_1.TabsTrigger, { value: "block", className: "flex gap-2" },
                                        react_1["default"].createElement(lucide_react_1.Code, { className: "h-4 w-4" }),
                                        "Blocks"),
                                    react_1["default"].createElement(tabs_1.TabsTrigger, { value: "richtext", className: "flex gap-2" },
                                        react_1["default"].createElement(lucide_react_1.Code, { className: "h-4 w-4" }),
                                        "Rich Text"),
                                    react_1["default"].createElement(tabs_1.TabsTrigger, { value: "html", className: "flex gap-2" },
                                        react_1["default"].createElement(lucide_react_1.Code, { className: "h-4 w-4" }),
                                        "HTML")),
                                react_1["default"].createElement(tabs_1.TabsContent, { value: "block", className: "mt-4" },
                                    react_1["default"].createElement(DocumentBlockEditor_1["default"], { value: form.content, onChange: function (val) { return setForm(function (p) { return (__assign(__assign({}, p), { content: val })); }); }, placeholder: "Design your " + config.singular.toLowerCase() + " template...", minHeight: "500px", variables: config.variables })),
                                react_1["default"].createElement(tabs_1.TabsContent, { value: "richtext", className: "mt-4" },
                                    react_1["default"].createElement(RichTextEditor_1.RichTextEditor, { value: form.content, onChange: function (val) { return setForm(function (p) { return (__assign(__assign({}, p), { content: val })); }); }, placeholder: "Design your " + config.singular.toLowerCase() + " template...", minHeight: "500px", enhanced: true, variables: config.variables })),
                                react_1["default"].createElement(tabs_1.TabsContent, { value: "html", className: "mt-4" },
                                    react_1["default"].createElement(HTMLEditor_1["default"], { value: form.content, onChange: function (val) { return setForm(function (p) { return (__assign(__assign({}, p), { content: val })); }); }, placeholder: "Design your " + config.singular.toLowerCase() + " template...", minHeight: "500px", height: "600px", variables: config.variables })))))))));
    }
    // List view
    if (isLoading) {
        return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: config.label, description: "Manage reusable " + config.singular.toLowerCase() + " templates", icon: react_1["default"].createElement(lucide_react_1.FileText, { className: "h-5 w-5" }) },
            react_1["default"].createElement("div", { className: "flex items-center justify-center py-20" },
                react_1["default"].createElement(spinner_1.Spinner, null))));
    }
    return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: config.label, description: "Manage reusable " + config.singular.toLowerCase() + " templates", icon: react_1["default"].createElement(lucide_react_1.FileText, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: config.dashboardHref },
            { label: config.parentLabel, href: config.parentHref },
            { label: "Templates" },
        ] },
        react_1["default"].createElement("div", { className: "space-y-6" },
            react_1["default"].createElement("div", { className: "flex items-center gap-4 flex-wrap" },
                react_1["default"].createElement("div", { className: "relative flex-1 min-w-[200px]" },
                    react_1["default"].createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
                    react_1["default"].createElement(input_1.Input, { placeholder: "Search templates...", value: searchTerm, onChange: function (e) { return setSearchTerm(e.target.value); }, className: "pl-9" })),
                react_1["default"].createElement(button_1.Button, { onClick: function () { return openEditor(); } },
                    react_1["default"].createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-2" }),
                    "New Template")),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardHeader, null,
                    react_1["default"].createElement(card_1.CardTitle, null, "Templates"),
                    react_1["default"].createElement(card_1.CardDescription, null,
                        filtered.length,
                        " template",
                        filtered.length !== 1 ? "s" : "")),
                react_1["default"].createElement(card_1.CardContent, null,
                    react_1["default"].createElement(table_1.Table, null,
                        react_1["default"].createElement(table_1.TableHeader, null,
                            react_1["default"].createElement(table_1.TableRow, null,
                                react_1["default"].createElement(table_1.TableHead, { className: "w-[300px]" }, "Title"),
                                react_1["default"].createElement(table_1.TableHead, null, "Default"),
                                react_1["default"].createElement(table_1.TableHead, null, "Date Created"),
                                react_1["default"].createElement(table_1.TableHead, null, "Created By"),
                                react_1["default"].createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                        react_1["default"].createElement(table_1.TableBody, null, filtered.length === 0 ? (react_1["default"].createElement(table_1.TableRow, null,
                            react_1["default"].createElement(table_1.TableCell, { colSpan: 5, className: "text-center py-8 text-muted-foreground" },
                                "No templates found. Create your first ",
                                config.singular.toLowerCase(),
                                " template."))) : (filtered.map(function (template) { return (react_1["default"].createElement(table_1.TableRow, { key: template.id, className: "group" },
                            react_1["default"].createElement(table_1.TableCell, { className: "font-medium" }, template.title),
                            react_1["default"].createElement(table_1.TableCell, null, template.isDefault ? (react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                                react_1["default"].createElement(lucide_react_1.Star, { className: "h-4 w-4 fill-yellow-500 text-yellow-500" }),
                                react_1["default"].createElement("span", { className: "text-sm font-medium text-yellow-600" }, "Default"))) : (react_1["default"].createElement("span", { className: "text-xs text-muted-foreground" }, "-"))),
                            react_1["default"].createElement(table_1.TableCell, { className: "text-sm text-muted-foreground" }, template.createdAt ? new Date(template.createdAt).toLocaleDateString() : "-"),
                            react_1["default"].createElement(table_1.TableCell, null,
                                react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                                    react_1["default"].createElement(avatar_1.Avatar, { className: "h-6 w-6" },
                                        react_1["default"].createElement(avatar_1.AvatarFallback, { className: "text-[10px]" }, template.createdBy.split(" ").map(function (n) { return n[0]; }).join(""))),
                                    react_1["default"].createElement("span", { className: "text-sm" }, template.createdBy))),
                            react_1["default"].createElement(table_1.TableCell, { className: "text-right" },
                                react_1["default"].createElement("div", { className: "flex justify-end gap-1" },
                                    react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return setPreviewTemplate(template); }, title: "Preview" },
                                        react_1["default"].createElement(lucide_react_1.Eye, { className: "h-4 w-4" })),
                                    react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return openEditor(template); }, title: "Edit" },
                                        react_1["default"].createElement(lucide_react_1.Edit2, { className: "h-4 w-4 text-green-600" })),
                                    template.isDefault ? (react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return unsetDefaultMutation.mutate(template.id); }, title: "Unset as default", disabled: unsetDefaultMutation.isPending },
                                        react_1["default"].createElement(lucide_react_1.Star, { className: "h-4 w-4 fill-yellow-500 text-yellow-500" }))) : (react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return setDefaultMutation.mutate(template.id); }, title: "Set as default", disabled: setDefaultMutation.isPending },
                                        react_1["default"].createElement(lucide_react_1.Star, { className: "h-4 w-4 text-gray-400" }))),
                                    react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return duplicateMutation.mutate(template.id); }, title: "Duplicate" },
                                        react_1["default"].createElement(lucide_react_1.Copy, { className: "h-4 w-4" })),
                                    react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleDelete(template.id); }, title: "Delete" },
                                        react_1["default"].createElement(lucide_react_1.Trash2, { className: "h-4 w-4 text-red-600" })))))); }))))))),
        react_1["default"].createElement(dialog_1.Dialog, { open: !!previewTemplate, onOpenChange: function () { return setPreviewTemplate(null); } },
            react_1["default"].createElement(dialog_1.DialogContent, { className: "max-w-3xl max-h-[90vh] overflow-y-auto" },
                react_1["default"].createElement(dialog_1.DialogHeader, null,
                    react_1["default"].createElement(dialog_1.DialogTitle, null, previewTemplate === null || previewTemplate === void 0 ? void 0 : previewTemplate.title),
                    react_1["default"].createElement(dialog_1.DialogDescription, null, "Template preview")),
                previewTemplate && (react_1["default"].createElement("div", { className: "border rounded-md p-4" },
                    react_1["default"].createElement("div", { className: "prose max-w-none", dangerouslySetInnerHTML: { __html: previewTemplate.content } }))),
                react_1["default"].createElement(dialog_1.DialogFooter, null,
                    react_1["default"].createElement(button_1.Button, { variant: "outline", onClick: function () { return setPreviewTemplate(null); } }, "Close"),
                    react_1["default"].createElement(button_1.Button, { onClick: function () { openEditor(previewTemplate); setPreviewTemplate(null); } }, "Edit"))))));
}
exports["default"] = DocumentTemplates;
