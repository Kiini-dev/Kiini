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
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var card_1 = require("@/components/ui/card");
var tabs_1 = require("@/components/ui/tabs");
var table_1 = require("@/components/ui/table");
var dialog_1 = require("@/components/ui/dialog");
var RichTextEditor_1 = require("@/components/RichTextEditor");
var EmailBlockEditor_1 = require("@/components/EmailBlockEditor");
var HTMLEditor_1 = require("@/components/HTMLEditor");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var badge_1 = require("@/components/ui/badge");
var utils_1 = require("@/lib/utils");
var trpc_1 = require("@/lib/trpc");
var TEMPLATE_CATEGORIES = [
    "invoice", "proposal", "contract", "receipt", "payment", "estimate", "notification", "general",
];
var CATEGORY_COLORS = {
    invoice: "bg-blue-50 text-blue-700",
    proposal: "bg-purple-50 text-purple-700",
    contract: "bg-green-50 text-green-700",
    receipt: "bg-amber-50 text-amber-700",
    payment: "bg-emerald-50 text-emerald-700",
    estimate: "bg-cyan-50 text-cyan-700",
    notification: "bg-orange-50 text-orange-700",
    general: "bg-gray-50 text-gray-700"
};
// Template and general variables (modeled after Kiini: One Hub. Total Control)
var TEMPLATE_VARIABLES = [
    { label: "Client Name", value: "{{client_name}}" },
    { label: "Client Email", value: "{{client_email}}" },
    { label: "Client Phone", value: "{{client_phone}}" },
    { label: "Client Address", value: "{{client_address}}" },
    { label: "Invoice Number", value: "{{invoice_number}}" },
    { label: "Invoice Amount", value: "{{invoice_amount}}" },
    { label: "Invoice Due Date", value: "{{invoice_due_date}}" },
    { label: "Proposal Number", value: "{{proposal_number}}" },
    { label: "Contract ID", value: "{{contract_id}}" },
    { label: "Receipt Number", value: "{{receipt_number}}" },
    { label: "Payment Amount", value: "{{payment_amount}}" },
    { label: "Payment Date", value: "{{payment_date}}" },
    { label: "Payment Method", value: "{{payment_method}}" },
    { label: "Project Name", value: "{{project_name}}" },
    { label: "Valid Until", value: "{{valid_until}}" },
    { label: "Reference Number", value: "{{reference_number}}" },
];
var GENERAL_VARIABLES = [
    { label: "Company Name", value: "{{company_name}}" },
    { label: "Company Email", value: "{{company_email}}" },
    { label: "Company Phone", value: "{{company_phone}}" },
    { label: "Company Address", value: "{{company_address}}" },
    { label: "Today's Date", value: "{{todays_date}}" },
    { label: "Email Signature", value: "{{email_signature}}" },
    { label: "Email Footer", value: "{{email_footer}}" },
    { label: "Dashboard URL", value: "{{dashboard_url}}" },
    { label: "Logo URL", value: "{{logo_url}}" },
];
var ALL_VARIABLES = __spreadArrays(TEMPLATE_VARIABLES.map(function (v) { return (__assign(__assign({}, v), { group: "Template Variables" })); }), GENERAL_VARIABLES.map(function (v) { return (__assign(__assign({}, v), { group: "General Variables" })); }));
// Attachment types that can be auto-attached to emails
var ATTACHMENT_TYPES = [
    { type: "invoice_pdf", label: "Invoice PDF", category: "invoice" },
    { type: "estimate_pdf", label: "Estimate PDF", category: "estimate" },
    { type: "proposal_pdf", label: "Proposal PDF", category: "proposal" },
    { type: "receipt_pdf", label: "Receipt PDF", category: "receipt" },
    { type: "contract_pdf", label: "Contract PDF", category: "contract" },
    { type: "quotation_pdf", label: "Quotation PDF", category: "general" },
    { type: "purchase_order_pdf", label: "Purchase Order PDF", category: "general" },
    { type: "credit_note_pdf", label: "Credit Note PDF", category: "general" },
    { type: "debit_note_pdf", label: "Debit Note PDF", category: "general" },
    { type: "payment_receipt_pdf", label: "Payment Receipt PDF", category: "payment" },
    { type: "statement_pdf", label: "Statement PDF", category: "general" },
    { type: "custom_file", label: "Custom File Upload", category: "general" },
];
var DEFAULT_TEMPLATES = [
    {
        id: "invoice-default",
        name: "Invoice - Default",
        subject: "Invoice {{invoice_number}} from {{company_name}}",
        body: "<p>Dear {{client_name}},</p><p>Please find attached your invoice <strong>{{invoice_number}}</strong>.</p><p>Amount Due: <strong>{{invoice_amount}}</strong><br>Due Date: {{invoice_due_date}}</p><p>Thank you for your business!</p><p>{{email_signature}}</p>",
        category: "invoice",
        variables: ["{{client_name}}", "{{invoice_number}}", "{{invoice_amount}}", "{{invoice_due_date}}", "{{company_name}}"],
        createdAt: "2025-01-15",
        isDefault: true
    },
    {
        id: "proposal-default",
        name: "Proposal - Default",
        subject: "Proposal {{proposal_number}} - {{project_name}}",
        body: "<p>Dear {{client_name}},</p><p>We are pleased to submit our proposal for <strong>{{project_name}}</strong>.</p><p>Proposal Value: <strong>{{payment_amount}}</strong><br>Valid Until: {{valid_until}}</p><p>Please review and let us know if you have any questions.</p><p>{{email_signature}}</p>",
        category: "proposal",
        variables: ["{{client_name}}", "{{proposal_number}}", "{{project_name}}", "{{payment_amount}}", "{{valid_until}}"],
        createdAt: "2025-01-20",
        isDefault: true
    },
    {
        id: "payment-confirmation",
        name: "Payment - Confirmation",
        subject: "Payment Received - {{reference_number}}",
        body: "<p>Dear {{client_name}},</p><p>We have received your payment of <strong>{{payment_amount}}</strong> on {{payment_date}}.</p><p>Reference: {{reference_number}}<br>Payment Method: {{payment_method}}</p><p>Thank you!</p><p>{{email_signature}}</p>",
        category: "payment",
        variables: ["{{client_name}}", "{{payment_amount}}", "{{payment_date}}", "{{reference_number}}", "{{payment_method}}"],
        createdAt: "2025-02-01"
    },
    {
        id: "contract-default",
        name: "Contract - New Contract",
        subject: "Contract {{contract_id}} - {{project_name}}",
        body: "<p>Dear {{client_name}},</p><p>Please find details regarding your contract <strong>{{contract_id}}</strong> for {{project_name}}.</p><p>{{email_signature}}</p>",
        category: "contract",
        variables: ["{{client_name}}", "{{contract_id}}", "{{project_name}}"],
        createdAt: "2025-02-10"
    },
    {
        id: "receipt-default",
        name: "Receipt - Default",
        subject: "Receipt {{receipt_number}}",
        body: "<p>Dear {{client_name}},</p><p>Here is your receipt <strong>{{receipt_number}}</strong> for a payment of {{payment_amount}} received on {{payment_date}}.</p><p>Thank you!</p><p>{{email_signature}}</p>",
        category: "receipt",
        variables: ["{{client_name}}", "{{receipt_number}}", "{{payment_amount}}", "{{payment_date}}"],
        createdAt: "2025-02-15"
    },
];
function AdminEmailTemplates() {
    var utils = trpc_1.trpc.useUtils();
    var _a = trpc_1.trpc.emailTemplates.list.useQuery({}), _b = _a.data, templates = _b === void 0 ? [] : _b, isLoading = _a.isLoading;
    var createMutation = trpc_1.trpc.emailTemplates.create.useMutation({
        onSuccess: function () { utils.emailTemplates.list.invalidate(); sonner_1.toast.success("Template created"); setView("list"); },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var updateMutation = trpc_1.trpc.emailTemplates.update.useMutation({
        onSuccess: function () { utils.emailTemplates.list.invalidate(); sonner_1.toast.success("Template updated"); setView("list"); },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var deleteMutation = trpc_1.trpc.emailTemplates["delete"].useMutation({
        onSuccess: function () { utils.emailTemplates.list.invalidate(); sonner_1.toast.success("Template deleted"); },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var duplicateMutation = trpc_1.trpc.emailTemplates.duplicate.useMutation({
        onSuccess: function () { utils.emailTemplates.list.invalidate(); sonner_1.toast.success("Template duplicated"); },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var _c = react_1.useState(""), searchTerm = _c[0], setSearchTerm = _c[1];
    var _d = react_1.useState("all"), categoryFilter = _d[0], setCategoryFilter = _d[1];
    var _e = react_1.useState("list"), view = _e[0], setView = _e[1];
    var _f = react_1.useState(null), editingTemplate = _f[0], setEditingTemplate = _f[1];
    var _g = react_1.useState(null), previewTemplate = _g[0], setPreviewTemplate = _g[1];
    var _h = react_1.useState({
        id: "", name: "", subject: "", body: "", htmlBody: "", category: "general", variables: [], attachments: []
    }), form = _h[0], setForm = _h[1];
    var _j = react_1.useState("richtext"), editorMode = _j[0], setEditorMode = _j[1];
    var filteredTemplates = templates.filter(function (t) {
        var matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (t.category && t.category.toLowerCase().includes(searchTerm.toLowerCase()));
        var matchesCat = categoryFilter === "all" || t.category === categoryFilter;
        return matchesSearch && matchesCat;
    });
    var openBuilder = function (template) {
        if (template) {
            setEditingTemplate(template);
            setForm(template);
        }
        else {
            setEditingTemplate(null);
            setForm({ id: "template-" + Date.now(), name: "", subject: "", body: "", htmlBody: "", category: "general", variables: [], attachments: [] });
        }
        setView("builder");
    };
    var handleSave = function () {
        if (!form.name.trim() || !form.subject.trim()) {
            sonner_1.toast.error("Please fill in template name and subject");
            return;
        }
        if (editingTemplate) {
            updateMutation.mutate({ id: editingTemplate.id, name: form.name, subject: form.subject, body: form.body, htmlBody: form.htmlBody, category: form.category, variables: form.variables, attachments: form.attachments });
        }
        else {
            createMutation.mutate({ name: form.name, subject: form.subject, body: form.body, htmlBody: form.htmlBody, category: form.category, variables: form.variables, attachments: form.attachments });
        }
    };
    var handleDelete = function (id) {
        if (confirm("Are you sure you want to delete this template?")) {
            deleteMutation.mutate(id);
        }
    };
    var handleDuplicate = function (template) {
        duplicateMutation.mutate(template.id);
    };
    // Auto-detect variables from body
    var detectVariables = function (body) {
        var matches = body.match(/\{\{[a-z_]+\}\}/g) || [];
        return __spreadArrays(new Set(matches));
    };
    // Replace variables with sample data for preview
    var getPreviewHtml = function (template) {
        var sampleData = {
            "{{client_name}}": "John Doe",
            "{{client_email}}": "john@example.com",
            "{{client_phone}}": "+254 700 123 456",
            "{{client_address}}": "123 Main St, Nairobi",
            "{{invoice_number}}": "INV-2025-001",
            "{{invoice_amount}}": "KES 150,000",
            "{{invoice_due_date}}": "2025-04-30",
            "{{proposal_number}}": "PROP-2025-001",
            "{{contract_id}}": "CON-2025-001",
            "{{receipt_number}}": "RCT-2025-001",
            "{{payment_amount}}": "KES 150,000",
            "{{payment_date}}": "2025-04-12",
            "{{payment_method}}": "Bank Transfer",
            "{{project_name}}": "Website Redesign",
            "{{valid_until}}": "2025-05-15",
            "{{reference_number}}": "REF-2025-001",
            "{{company_name}}": "Kiini Solutions",
            "{{company_email}}": "info@kiini.africa",
            "{{company_phone}}": "+254 700 000 000",
            "{{company_address}}": "456 Tech Plaza, Nairobi",
            "{{todays_date}}": new Date().toLocaleDateString(),
            "{{email_signature}}": "<strong>Best Regards,</strong><br>Kiini Solutions Team",
            "{{email_footer}}": "© 2025 Kiini Solutions. All rights reserved.",
            "{{dashboard_url}}": "https://crm.kiini.africa",
            "{{logo_url}}": ""
        };
        var html = template.htmlBody || template.body;
        Object.entries(sampleData).forEach(function (_a) {
            var k = _a[0], v = _a[1];
            html = html.replace(new RegExp(k.replace(/[{}]/g, "\\$&"), "g"), v);
        });
        return html;
    };
    // Visual Builder view
    if (view === "builder") {
        return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: editingTemplate ? "Edit Email Template" : "Create Email Template", description: "Design your HTML email template with the visual builder", icon: react_1["default"].createElement(lucide_react_1.Mail, { className: "h-5 w-5" }), breadcrumbs: [
                { label: "Dashboard", href: "/crm/super-admin" },
                { label: "Administration", href: "/admin/management" },
                { label: "Email Templates", href: "/admin/email-templates" },
                { label: editingTemplate ? "Edit" : "New Template" },
            ] },
            react_1["default"].createElement("div", { className: "space-y-4" },
                react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                    react_1["default"].createElement(button_1.Button, { variant: "ghost", onClick: function () { return setView("list"); } },
                        react_1["default"].createElement(lucide_react_1.ArrowLeft, { className: "h-4 w-4 mr-2" }),
                        "Back to Templates"),
                    react_1["default"].createElement("div", { className: "flex gap-2" },
                        react_1["default"].createElement(button_1.Button, { variant: "outline", onClick: function () { return setPreviewTemplate(form); } },
                            react_1["default"].createElement(lucide_react_1.Eye, { className: "h-4 w-4 mr-2" }),
                            "Preview"),
                        react_1["default"].createElement(button_1.Button, { onClick: handleSave },
                            editingTemplate ? "Update" : "Create",
                            " Template"))),
                react_1["default"].createElement("div", { className: "grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4" },
                    react_1["default"].createElement("div", { className: "space-y-4" },
                        react_1["default"].createElement(card_1.Card, null,
                            react_1["default"].createElement(card_1.CardContent, { className: "pt-6 space-y-4" },
                                react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
                                    react_1["default"].createElement("div", { className: "space-y-2" },
                                        react_1["default"].createElement(label_1.Label, null, "Template Name *"),
                                        react_1["default"].createElement(input_1.Input, { value: form.name, onChange: function (e) { return setForm(function (p) { return (__assign(__assign({}, p), { name: e.target.value })); }); }, placeholder: "e.g., Invoice - Standard" })),
                                    react_1["default"].createElement("div", { className: "space-y-2" },
                                        react_1["default"].createElement(label_1.Label, null, "Category"),
                                        react_1["default"].createElement("select", { value: form.category || "general", onChange: function (e) { return setForm(function (p) { return (__assign(__assign({}, p), { category: e.target.value })); }); }, className: "w-full px-3 py-2 border rounded-md text-sm bg-background" }, TEMPLATE_CATEGORIES.map(function (cat) { return react_1["default"].createElement("option", { key: cat, value: cat }, cat.charAt(0).toUpperCase() + cat.slice(1)); })))),
                                react_1["default"].createElement("div", { className: "space-y-2" },
                                    react_1["default"].createElement(label_1.Label, null, "Subject *"),
                                    react_1["default"].createElement(input_1.Input, { value: form.subject, onChange: function (e) { return setForm(function (p) { return (__assign(__assign({}, p), { subject: e.target.value })); }); }, placeholder: "e.g., Invoice {{invoice_number}} from {{company_name}}" })))),
                        react_1["default"].createElement(card_1.Card, null,
                            react_1["default"].createElement(card_1.CardHeader, { className: "pb-3" },
                                react_1["default"].createElement(card_1.CardTitle, { className: "text-base" }, "Email Body"),
                                react_1["default"].createElement(card_1.CardDescription, null, "Choose your preferred editor: Email blocks for visual design, HTML for raw code, or Rich Text for formatting.")),
                            react_1["default"].createElement(card_1.CardContent, null,
                                react_1["default"].createElement(tabs_1.Tabs, { value: editorMode, onValueChange: function (val) { return setEditorMode(val); }, className: "w-full" },
                                    react_1["default"].createElement(tabs_1.TabsList, { className: "grid w-full grid-cols-3" },
                                        react_1["default"].createElement(tabs_1.TabsTrigger, { value: "richtext", className: "flex gap-2" },
                                            react_1["default"].createElement(lucide_react_1.Mail, { className: "h-4 w-4" }),
                                            "Rich Text"),
                                        react_1["default"].createElement(tabs_1.TabsTrigger, { value: "block", className: "flex gap-2" },
                                            react_1["default"].createElement(lucide_react_1.Code, { className: "h-4 w-4" }),
                                            "Blocks"),
                                        react_1["default"].createElement(tabs_1.TabsTrigger, { value: "html", className: "flex gap-2" },
                                            react_1["default"].createElement(lucide_react_1.Code, { className: "h-4 w-4" }),
                                            "HTML")),
                                    react_1["default"].createElement(tabs_1.TabsContent, { value: "richtext", className: "mt-4" },
                                        react_1["default"].createElement(RichTextEditor_1.RichTextEditor, { value: form.htmlBody || form.body, onChange: function (val) {
                                                var vars = detectVariables(val);
                                                setForm(function (p) { return (__assign(__assign({}, p), { body: val, htmlBody: val, variables: vars })); });
                                            }, placeholder: "Design your email template here...", minHeight: "400px", enhanced: true, variables: __spreadArrays(TEMPLATE_VARIABLES, GENERAL_VARIABLES) })),
                                    react_1["default"].createElement(tabs_1.TabsContent, { value: "block", className: "mt-4" },
                                        react_1["default"].createElement(EmailBlockEditor_1["default"], { value: form.htmlBody || form.body, onChange: function (val) {
                                                var vars = detectVariables(val);
                                                setForm(function (p) { return (__assign(__assign({}, p), { body: val, htmlBody: val, variables: vars })); });
                                            }, placeholder: "Design your email template using blocks...", minHeight: "400px", variables: __spreadArrays(TEMPLATE_VARIABLES, GENERAL_VARIABLES) })),
                                    react_1["default"].createElement(tabs_1.TabsContent, { value: "html", className: "mt-4" },
                                        react_1["default"].createElement(HTMLEditor_1["default"], { value: form.htmlBody || form.body, onChange: function (val) {
                                                var vars = detectVariables(val);
                                                setForm(function (p) { return (__assign(__assign({}, p), { body: val, htmlBody: val, variables: vars })); });
                                            }, placeholder: "Enter HTML email template...", minHeight: "400px", height: "500px", variables: __spreadArrays(TEMPLATE_VARIABLES, GENERAL_VARIABLES) }))))),
                        react_1["default"].createElement(card_1.Card, null,
                            react_1["default"].createElement(card_1.CardHeader, { className: "pb-3" },
                                react_1["default"].createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                                    react_1["default"].createElement(lucide_react_1.Paperclip, { className: "h-4 w-4" }),
                                    " Email Attachments"),
                                react_1["default"].createElement(card_1.CardDescription, null, "Select documents to auto-attach when this email is sent")),
                            react_1["default"].createElement(card_1.CardContent, { className: "space-y-3" },
                                form.attachments && form.attachments.length > 0 && (react_1["default"].createElement("div", { className: "flex flex-wrap gap-2" }, form.attachments.map(function (att, idx) { return (react_1["default"].createElement(badge_1.Badge, { key: idx, variant: "secondary", className: "text-xs flex items-center gap-1 py-1 px-2" },
                                    react_1["default"].createElement(lucide_react_1.Paperclip, { className: "h-3 w-3" }),
                                    att.label,
                                    react_1["default"].createElement("button", { type: "button", onClick: function () { return setForm(function (p) { var _a; return (__assign(__assign({}, p), { attachments: ((_a = p.attachments) === null || _a === void 0 ? void 0 : _a.filter(function (_, i) { return i !== idx; })) || [] })); }); }, className: "ml-1 hover:text-destructive" },
                                        react_1["default"].createElement(lucide_react_1.X, { className: "h-3 w-3" })))); }))),
                                react_1["default"].createElement("div", { className: "space-y-2" },
                                    react_1["default"].createElement(label_1.Label, { className: "text-xs text-muted-foreground" }, "Add attachment"),
                                    react_1["default"].createElement("select", { value: "", onChange: function (e) {
                                            var _a;
                                            var selected = ATTACHMENT_TYPES.find(function (a) { return a.type === e.target.value; });
                                            if (selected && !((_a = form.attachments) === null || _a === void 0 ? void 0 : _a.some(function (a) { return a.type === selected.type; }))) {
                                                setForm(function (p) { return (__assign(__assign({}, p), { attachments: __spreadArrays((p.attachments || []), [{ type: selected.type, label: selected.label }]) })); });
                                            }
                                        }, className: "w-full px-3 py-2 border rounded-md text-sm bg-background" },
                                        react_1["default"].createElement("option", { value: "" }, "Select document to attach..."),
                                        ATTACHMENT_TYPES
                                            .filter(function (a) { return a.category === "general" || a.category === form.category; })
                                            .filter(function (a) { var _a; return !((_a = form.attachments) === null || _a === void 0 ? void 0 : _a.some(function (att) { return att.type === a.type; })); })
                                            .map(function (a) { return react_1["default"].createElement("option", { key: a.type, value: a.type }, a.label); }))),
                                react_1["default"].createElement("p", { className: "text-[11px] text-muted-foreground" }, "Attached documents (e.g. Invoice PDF) will be auto-generated and included when sending emails with this template.")))),
                    react_1["default"].createElement("div", { className: "space-y-4" },
                        react_1["default"].createElement(card_1.Card, null,
                            react_1["default"].createElement(card_1.CardHeader, { className: "pb-2" },
                                react_1["default"].createElement(card_1.CardTitle, { className: "text-sm flex items-center gap-2" },
                                    react_1["default"].createElement(lucide_react_1.Variable, { className: "h-4 w-4" }),
                                    " Template Variables")),
                            react_1["default"].createElement(card_1.CardContent, { className: "space-y-1" }, TEMPLATE_VARIABLES.map(function (v) { return (react_1["default"].createElement("button", { key: v.value, type: "button", className: "w-full text-left px-2 py-1.5 text-sm rounded hover:bg-muted transition-colors flex items-center justify-between group", onClick: function () {
                                    var body = (form.htmlBody || form.body) + v.value;
                                    var vars = detectVariables(body);
                                    setForm(function (p) { return (__assign(__assign({}, p), { body: body, htmlBody: body, variables: vars })); });
                                }, title: "Click to copy: " + v.value },
                                react_1["default"].createElement("span", { className: "text-foreground" }, v.label),
                                react_1["default"].createElement("code", { className: "text-[10px] text-muted-foreground group-hover:text-foreground" }, v.value))); }))),
                        react_1["default"].createElement(card_1.Card, null,
                            react_1["default"].createElement(card_1.CardHeader, { className: "pb-2" },
                                react_1["default"].createElement(card_1.CardTitle, { className: "text-sm flex items-center gap-2" },
                                    react_1["default"].createElement(lucide_react_1.Variable, { className: "h-4 w-4" }),
                                    " General Variables")),
                            react_1["default"].createElement(card_1.CardContent, { className: "space-y-1" }, GENERAL_VARIABLES.map(function (v) { return (react_1["default"].createElement("button", { key: v.value, type: "button", className: "w-full text-left px-2 py-1.5 text-sm rounded hover:bg-muted transition-colors flex items-center justify-between group", onClick: function () {
                                    var body = (form.htmlBody || form.body) + v.value;
                                    var vars = detectVariables(body);
                                    setForm(function (p) { return (__assign(__assign({}, p), { body: body, htmlBody: body, variables: vars })); });
                                }, title: "Click to copy: " + v.value },
                                react_1["default"].createElement("span", { className: "text-foreground" }, v.label),
                                react_1["default"].createElement("code", { className: "text-[10px] text-muted-foreground group-hover:text-foreground" }, v.value))); }))),
                        form.variables && form.variables.length > 0 && (react_1["default"].createElement(card_1.Card, null,
                            react_1["default"].createElement(card_1.CardHeader, { className: "pb-2" },
                                react_1["default"].createElement(card_1.CardTitle, { className: "text-sm" },
                                    "Used Variables (",
                                    form.variables.length,
                                    ")")),
                            react_1["default"].createElement(card_1.CardContent, null,
                                react_1["default"].createElement("div", { className: "flex flex-wrap gap-1" }, form.variables.map(function (v) { return (react_1["default"].createElement(badge_1.Badge, { key: v, variant: "secondary", className: "text-[10px]" }, v)); })))))))),
            react_1["default"].createElement(dialog_1.Dialog, { open: !!previewTemplate, onOpenChange: function () { return setPreviewTemplate(null); } },
                react_1["default"].createElement(dialog_1.DialogContent, { className: "max-w-3xl max-h-[90vh] overflow-y-auto" },
                    react_1["default"].createElement(dialog_1.DialogHeader, null,
                        react_1["default"].createElement(dialog_1.DialogTitle, null, "Email Preview"),
                        react_1["default"].createElement(dialog_1.DialogDescription, null, "Preview with sample data substituted for variables")),
                    previewTemplate && (react_1["default"].createElement("div", { className: "space-y-4" },
                        react_1["default"].createElement("div", { className: "p-3 bg-muted/30 rounded-md" },
                            react_1["default"].createElement("div", { className: "text-xs text-muted-foreground mb-1" }, "Subject"),
                            react_1["default"].createElement("div", { className: "font-medium" }, getPreviewHtml(__assign(__assign({}, previewTemplate), { body: previewTemplate.subject, htmlBody: previewTemplate.subject })).replace(/<[^>]+>/g, ""))),
                        react_1["default"].createElement("div", { className: "border rounded-md p-4" },
                            react_1["default"].createElement("div", { className: "prose max-w-none", dangerouslySetInnerHTML: { __html: getPreviewHtml(previewTemplate) } }))))))));
    }
    // List view
    return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: "Email Templates", description: "Manage HTML email templates for system-wide use", icon: react_1["default"].createElement(lucide_react_1.Mail, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm/super-admin" },
            { label: "Administration", href: "/admin/management" },
            { label: "Email Templates" },
        ] },
        react_1["default"].createElement("div", { className: "space-y-6" },
            react_1["default"].createElement("div", { className: "flex items-center gap-4 flex-wrap" },
                react_1["default"].createElement("div", { className: "relative flex-1 min-w-[200px]" },
                    react_1["default"].createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
                    react_1["default"].createElement(input_1.Input, { placeholder: "Search templates...", value: searchTerm, onChange: function (e) { return setSearchTerm(e.target.value); }, className: "pl-9" })),
                react_1["default"].createElement("select", { value: categoryFilter, onChange: function (e) { return setCategoryFilter(e.target.value); }, className: "px-3 py-2 border rounded-md text-sm bg-background" },
                    react_1["default"].createElement("option", { value: "all" }, "All Categories"),
                    TEMPLATE_CATEGORIES.map(function (cat) { return react_1["default"].createElement("option", { key: cat, value: cat }, cat.charAt(0).toUpperCase() + cat.slice(1)); })),
                react_1["default"].createElement(button_1.Button, { onClick: function () { return openBuilder(); } },
                    react_1["default"].createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-2" }),
                    "New Template")),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardHeader, null,
                    react_1["default"].createElement(card_1.CardTitle, null, "Available Templates"),
                    react_1["default"].createElement(card_1.CardDescription, null,
                        filteredTemplates.length,
                        " template",
                        filteredTemplates.length !== 1 ? "s" : "",
                        " found")),
                react_1["default"].createElement(card_1.CardContent, null,
                    react_1["default"].createElement("div", { className: "overflow-x-auto" },
                        react_1["default"].createElement(table_1.Table, null,
                            react_1["default"].createElement(table_1.TableHeader, null,
                                react_1["default"].createElement(table_1.TableRow, null,
                                    react_1["default"].createElement(table_1.TableHead, { className: "w-[250px]" }, "Name"),
                                    react_1["default"].createElement(table_1.TableHead, null, "Category"),
                                    react_1["default"].createElement(table_1.TableHead, null, "Subject"),
                                    react_1["default"].createElement(table_1.TableHead, null, "Variables"),
                                    react_1["default"].createElement(table_1.TableHead, null, "Attachments"),
                                    react_1["default"].createElement(table_1.TableHead, null, "Created"),
                                    react_1["default"].createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                            react_1["default"].createElement(table_1.TableBody, null, filteredTemplates.length === 0 ? (react_1["default"].createElement(table_1.TableRow, null,
                                react_1["default"].createElement(table_1.TableCell, { colSpan: 7, className: "text-center py-8 text-muted-foreground" }, "No templates found"))) : (filteredTemplates.map(function (template) {
                                var _a, _b;
                                return (react_1["default"].createElement(table_1.TableRow, { key: template.id, className: "group" },
                                    react_1["default"].createElement(table_1.TableCell, null,
                                        react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                                            react_1["default"].createElement("div", null,
                                                react_1["default"].createElement("div", { className: "font-medium" }, template.name),
                                                template.isDefault && react_1["default"].createElement(badge_1.Badge, { variant: "outline", className: "text-[10px] mt-0.5" }, "Default")))),
                                    react_1["default"].createElement(table_1.TableCell, null,
                                        react_1["default"].createElement(badge_1.Badge, { variant: "secondary", className: utils_1.cn("text-xs", CATEGORY_COLORS[template.category || "general"]) }, template.category || "general")),
                                    react_1["default"].createElement(table_1.TableCell, { className: "max-w-xs truncate text-sm text-muted-foreground" }, template.subject),
                                    react_1["default"].createElement(table_1.TableCell, null, ((_a = template.variables) === null || _a === void 0 ? void 0 : _a.length) ? (react_1["default"].createElement(badge_1.Badge, { variant: "outline", className: "text-xs" },
                                        template.variables.length,
                                        " vars")) : react_1["default"].createElement("span", { className: "text-xs text-muted-foreground" }, "-")),
                                    react_1["default"].createElement(table_1.TableCell, null, ((_b = template.attachments) === null || _b === void 0 ? void 0 : _b.length) ? (react_1["default"].createElement(badge_1.Badge, { variant: "outline", className: "text-xs flex items-center gap-1 w-fit" },
                                        react_1["default"].createElement(lucide_react_1.Paperclip, { className: "h-3 w-3" }),
                                        template.attachments.length)) : react_1["default"].createElement("span", { className: "text-xs text-muted-foreground" }, "-")),
                                    react_1["default"].createElement(table_1.TableCell, { className: "text-xs text-muted-foreground" }, template.createdAt ? new Date(template.createdAt).toLocaleDateString() : "-"),
                                    react_1["default"].createElement(table_1.TableCell, { className: "text-right" },
                                        react_1["default"].createElement("div", { className: "flex justify-end gap-1" },
                                            react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return setPreviewTemplate(template); }, title: "Preview" },
                                                react_1["default"].createElement(lucide_react_1.Eye, { className: "h-4 w-4" })),
                                            react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return openBuilder(template); }, title: "Edit" },
                                                react_1["default"].createElement(lucide_react_1.Edit2, { className: "h-4 w-4" })),
                                            react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleDuplicate(template); }, title: "Duplicate" },
                                                react_1["default"].createElement(lucide_react_1.Copy, { className: "h-4 w-4" })),
                                            react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleDelete(template.id); }, className: "text-destructive", title: "Delete" },
                                                react_1["default"].createElement(lucide_react_1.Trash2, { className: "h-4 w-4" }))))));
                            })))))))),
        react_1["default"].createElement(dialog_1.Dialog, { open: !!previewTemplate, onOpenChange: function () { return setPreviewTemplate(null); } },
            react_1["default"].createElement(dialog_1.DialogContent, { className: "max-w-3xl max-h-[90vh] overflow-y-auto" },
                react_1["default"].createElement(dialog_1.DialogHeader, null,
                    react_1["default"].createElement(dialog_1.DialogTitle, null,
                        "Email Preview: ", previewTemplate === null || previewTemplate === void 0 ? void 0 :
                        previewTemplate.name),
                    react_1["default"].createElement(dialog_1.DialogDescription, null, "Preview with sample data substituted for variables")),
                previewTemplate && (react_1["default"].createElement("div", { className: "space-y-4" },
                    react_1["default"].createElement("div", { className: "p-3 bg-muted/30 rounded-md" },
                        react_1["default"].createElement("div", { className: "text-xs text-muted-foreground mb-1" }, "Subject"),
                        react_1["default"].createElement("div", { className: "font-medium" }, getPreviewHtml(__assign(__assign({}, previewTemplate), { body: previewTemplate.subject, htmlBody: previewTemplate.subject })).replace(/<[^>]+>/g, ""))),
                    react_1["default"].createElement("div", { className: "border rounded-md p-4" },
                        react_1["default"].createElement("div", { className: "prose max-w-none", dangerouslySetInnerHTML: { __html: getPreviewHtml(previewTemplate) } })))),
                react_1["default"].createElement(dialog_1.DialogFooter, null,
                    react_1["default"].createElement(button_1.Button, { variant: "outline", onClick: function () { return setPreviewTemplate(null); } }, "Close"),
                    react_1["default"].createElement(button_1.Button, { onClick: function () { openBuilder(previewTemplate); setPreviewTemplate(null); } }, "Edit Template"))))));
}
exports["default"] = AdminEmailTemplates;
