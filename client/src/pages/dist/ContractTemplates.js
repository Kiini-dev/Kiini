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
var table_1 = require("@/components/ui/table");
var dialog_1 = require("@/components/ui/dialog");
var RichTextEditor_1 = require("@/components/RichTextEditor");
var DocumentBlockEditor_1 = require("@/components/DocumentBlockEditor");
var HTMLEditor_1 = require("@/components/HTMLEditor");
var tabs_1 = require("@/components/ui/tabs");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var avatar_1 = require("@/components/ui/avatar");
var trpc_1 = require("@/lib/trpc");
var DEFAULT_CONTRACT_TEMPLATES = [
    {
        id: "ct-1",
        title: "Default Template",
        content: "<h2>Service Contract Agreement</h2><p>This Service Contract Agreement (\"Agreement\") is entered into as of <strong>{{contract_date}}</strong> by and between:</p><p><strong>{{company_name}}</strong> (\"Service Provider\")<br>and<br><strong>{{client_name}}</strong> (\"Client\")</p><h3>1. Scope of Services</h3><p>The Service Provider agrees to provide the following services:</p><p>{{scope_of_work}}</p><h3>2. Term</h3><p>This Agreement shall commence on {{start_date}} and continue until {{end_date}}, unless terminated earlier in accordance with this Agreement.</p><h3>3. Compensation</h3><p>The Client agrees to pay the Service Provider <strong>{{contract_value}}</strong> for the services described herein.</p><h3>4. Payment Terms</h3><p>Payment shall be made according to the following schedule: {{payment_terms}}</p><h3>5. Confidentiality</h3><p>Both parties agree to maintain confidentiality of proprietary information shared during the course of this Agreement.</p><h3>6. Termination</h3><p>Either party may terminate this Agreement with 30 days written notice.</p><p>{{email_signature}}</p>",
        createdBy: "System",
        createdAt: "2023-07-01"
    },
    {
        id: "ct-2",
        title: "Maintenance Agreement",
        content: "<h2>Maintenance Service Agreement</h2><p>This Maintenance Agreement is made between <strong>{{company_name}}</strong> and <strong>{{client_name}}</strong>.</p><h3>Services Covered</h3><ul><li>Preventive maintenance visits</li><li>Emergency response within 24 hours</li><li>Parts and labor for covered equipment</li></ul><h3>Duration</h3><p>From {{start_date}} to {{end_date}}</p><h3>Monthly Fee</h3><p><strong>{{contract_value}}</strong> payable on the 1st of each month.</p><h3>SLA</h3><p>Response time: 4 hours for critical issues, 24 hours for non-critical.</p>",
        createdBy: "Admin",
        createdAt: "2024-03-15"
    },
    {
        id: "ct-3",
        title: "Software License Agreement",
        content: "<h2>Software License Agreement</h2><p>This Software License Agreement is entered into between <strong>{{company_name}}</strong> (\"Licensor\") and <strong>{{client_name}}</strong> (\"Licensee\").</p><h3>License Grant</h3><p>The Licensor grants the Licensee a non-exclusive, non-transferable license to use the software described herein.</p><h3>Term</h3><p>This license is valid from {{start_date}} to {{end_date}}.</p><h3>License Fee</h3><p>{{contract_value}} — payable annually.</p><h3>Restrictions</h3><ul><li>No reverse engineering</li><li>No sublicensing</li><li>No modification of source code</li></ul>",
        createdBy: "Admin",
        createdAt: "2024-06-20"
    },
];
var CONTRACT_VARIABLES = [
    { label: "Client Name", value: "{{client_name}}" },
    { label: "Client Email", value: "{{client_email}}" },
    { label: "Client Address", value: "{{client_address}}" },
    { label: "Contract ID", value: "{{contract_id}}" },
    { label: "Contract Date", value: "{{contract_date}}" },
    { label: "Contract Value", value: "{{contract_value}}" },
    { label: "Start Date", value: "{{start_date}}" },
    { label: "End Date", value: "{{end_date}}" },
    { label: "Scope of Work", value: "{{scope_of_work}}" },
    { label: "Payment Terms", value: "{{payment_terms}}" },
    { label: "Company Name", value: "{{company_name}}" },
    { label: "Company Address", value: "{{company_address}}" },
    { label: "Email Signature", value: "{{email_signature}}" },
    { label: "Today's Date", value: "{{todays_date}}" },
];
function ContractTemplates() {
    var utils = trpc_1.trpc.useUtils();
    var _a = trpc_1.trpc.contractTemplates.list.useQuery({}), _b = _a.data, templates = _b === void 0 ? [] : _b, isLoading = _a.isLoading;
    var createMutation = trpc_1.trpc.contractTemplates.create.useMutation({
        onSuccess: function () { utils.contractTemplates.list.invalidate(); sonner_1.toast.success("Template created"); setView("list"); },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var updateMutation = trpc_1.trpc.contractTemplates.update.useMutation({
        onSuccess: function () { utils.contractTemplates.list.invalidate(); sonner_1.toast.success("Template updated"); setView("list"); },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var deleteMutation = trpc_1.trpc.contractTemplates["delete"].useMutation({
        onSuccess: function () { utils.contractTemplates.list.invalidate(); sonner_1.toast.success("Template deleted"); },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var duplicateMutation = trpc_1.trpc.contractTemplates.duplicate.useMutation({
        onSuccess: function () { utils.contractTemplates.list.invalidate(); sonner_1.toast.success("Template duplicated"); },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var _c = react_1.useState(""), searchTerm = _c[0], setSearchTerm = _c[1];
    var _d = react_1.useState("list"), view = _d[0], setView = _d[1];
    var _e = react_1.useState(null), editingTemplate = _e[0], setEditingTemplate = _e[1];
    var _f = react_1.useState(null), previewTemplate = _f[0], setPreviewTemplate = _f[1];
    var _g = react_1.useState({
        id: "", title: "", content: "", createdBy: "Admin", createdAt: ""
    }), form = _g[0], setForm = _g[1];
    var _h = react_1.useState("block"), editorMode = _h[0], setEditorMode = _h[1];
    var filtered = templates.filter(function (t) {
        return t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.createdBy.toLowerCase().includes(searchTerm.toLowerCase());
    });
    var openEditor = function (template) {
        if (template) {
            setEditingTemplate(template);
            setForm(template);
        }
        else {
            setEditingTemplate(null);
            setForm({ id: "ct-" + Date.now(), title: "", content: "", createdBy: "Admin", createdAt: "" });
        }
        setView("editor");
    };
    var handleSave = function () {
        if (!form.title.trim()) {
            sonner_1.toast.error("Please enter a template title");
            return;
        }
        if (editingTemplate) {
            updateMutation.mutate({ id: editingTemplate.id, title: form.title, content: form.content });
        }
        else {
            createMutation.mutate({ title: form.title, content: form.content });
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
    // Editor view
    if (view === "editor") {
        return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: editingTemplate ? "Edit Contract Template" : "New Contract Template", description: "Design a reusable contract template", icon: react_1["default"].createElement(lucide_react_1.FileText, { className: "h-5 w-5" }), breadcrumbs: [
                { label: "Dashboard", href: "/crm/super-admin" },
                { label: "Contracts", href: "/contracts" },
                { label: "Templates", href: "/contracts/templates" },
                { label: editingTemplate ? "Edit" : "New Template" },
            ] },
            react_1["default"].createElement("div", { className: "space-y-4" },
                react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                    react_1["default"].createElement(button_1.Button, { variant: "ghost", onClick: function () { return setView("list"); } },
                        react_1["default"].createElement(lucide_react_1.ArrowLeft, { className: "h-4 w-4 mr-2" }),
                        "Back to Templates"),
                    react_1["default"].createElement(button_1.Button, { onClick: handleSave },
                        editingTemplate ? "Update" : "Create",
                        " Template")),
                react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardContent, { className: "pt-6 space-y-4" },
                        react_1["default"].createElement("div", { className: "space-y-2" },
                            react_1["default"].createElement(label_1.Label, null, "Template Title *"),
                            react_1["default"].createElement(input_1.Input, { value: form.title, onChange: function (e) { return setForm(function (p) { return (__assign(__assign({}, p), { title: e.target.value })); }); }, placeholder: "e.g., Standard Service Agreement" })),
                        react_1["default"].createElement("div", { className: "space-y-2" },
                            react_1["default"].createElement(label_1.Label, null, "Template Content"),
                            react_1["default"].createElement("p", { className: "text-sm text-gray-600" }, "Create rich content using blocks or traditional rich text editor. Choose the editor that best suits your workflow."),
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
                                    react_1["default"].createElement(DocumentBlockEditor_1["default"], { value: form.content, onChange: function (val) { return setForm(function (p) { return (__assign(__assign({}, p), { content: val })); }); }, placeholder: "Design your contract template...", minHeight: "500px", variables: CONTRACT_VARIABLES })),
                                react_1["default"].createElement(tabs_1.TabsContent, { value: "richtext", className: "mt-4" },
                                    react_1["default"].createElement(RichTextEditor_1.RichTextEditor, { value: form.content, onChange: function (val) { return setForm(function (p) { return (__assign(__assign({}, p), { content: val })); }); }, placeholder: "Design your contract template...", minHeight: "500px", enhanced: true, variables: CONTRACT_VARIABLES })),
                                react_1["default"].createElement(tabs_1.TabsContent, { value: "html", className: "mt-4" },
                                    react_1["default"].createElement(HTMLEditor_1["default"], { value: form.content, onChange: function (val) { return setForm(function (p) { return (__assign(__assign({}, p), { content: val })); }); }, placeholder: "Enter HTML contract template...", minHeight: "500px", height: "500px", variables: CONTRACT_VARIABLES })))))))));
    }
    // List view (Kiini: One Hub. Total Control style)
    return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: "Contract Templates", description: "Manage reusable contract templates", icon: react_1["default"].createElement(lucide_react_1.FileText, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm/super-admin" },
            { label: "Contracts", href: "/contracts" },
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
                                react_1["default"].createElement(table_1.TableHead, null, "Date Created"),
                                react_1["default"].createElement(table_1.TableHead, null, "Created By"),
                                react_1["default"].createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                        react_1["default"].createElement(table_1.TableBody, null, filtered.length === 0 ? (react_1["default"].createElement(table_1.TableRow, null,
                            react_1["default"].createElement(table_1.TableCell, { colSpan: 4, className: "text-center py-8 text-muted-foreground" }, "No templates found"))) : (filtered.map(function (template) { return (react_1["default"].createElement(table_1.TableRow, { key: template.id, className: "group" },
                            react_1["default"].createElement(table_1.TableCell, { className: "font-medium" }, template.title),
                            react_1["default"].createElement(table_1.TableCell, { className: "text-sm text-muted-foreground" }, template.createdAt ? new Date(template.createdAt).toLocaleDateString() : "—"),
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
                                    react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleDuplicate(template); }, title: "Duplicate" },
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
exports["default"] = ContractTemplates;
