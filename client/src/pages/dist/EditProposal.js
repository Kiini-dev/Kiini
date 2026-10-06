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
var wouter_1 = require("wouter");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var RichTextEditor_1 = require("@/components/RichTextEditor");
var card_1 = require("@/components/ui/card");
var separator_1 = require("@/components/ui/separator");
var select_1 = require("@/components/ui/select");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
function EditProposal() {
    var id = wouter_1.useParams().id;
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var utils = trpc_1.trpc.useUtils();
    var _b = react_1.useState({
        proposalNumber: "",
        clientId: "",
        title: "",
        description: "",
        amount: "",
        validUntil: new Date().toISOString().split("T")[0],
        status: "draft",
        probability: 0,
        notes: ""
    }), formData = _b[0], setFormData = _b[1];
    var _c = react_1.useState(true), isLoading = _c[0], setIsLoading = _c[1];
    var proposal = trpc_1.trpc.opportunities.getById.useQuery(id || "", { enabled: !!id }).data;
    var _d = trpc_1.trpc.clients.list.useQuery().data, clients = _d === void 0 ? [] : _d;
    var _e = trpc_1.trpc.proposalTemplates.list.useQuery().data, proposalTemplatesList = _e === void 0 ? [] : _e;
    var _f = react_1.useState(""), selectedTemplateId = _f[0], setSelectedTemplateId = _f[1];
    react_1.useEffect(function () {
        if (proposal) {
            setFormData({
                proposalNumber: proposal.proposalNumber || "",
                clientId: proposal.clientId || "",
                title: proposal.title || "",
                description: proposal.description || "",
                amount: proposal.amount ? (proposal.amount / 100).toString() : "",
                validUntil: proposal.validUntil
                    ? new Date(proposal.validUntil).toISOString().split("T")[0]
                    : new Date().toISOString().split("T")[0],
                status: proposal.status || proposal.stage || "draft",
                probability: proposal.probability || 0,
                notes: proposal.notes || ""
            });
            setIsLoading(false);
        }
    }, [proposal]);
    var updateMutation = trpc_1.trpc.opportunities.update.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Opportunity updated successfully!");
            utils.opportunities.list.invalidate();
            utils.opportunities.getById.invalidate(id || "");
            navigate("/opportunities");
        },
        onError: function (error) { return sonner_1.toast.error("Failed to update: " + error.message); }
    });
    var handleSubmit = function (e) {
        e.preventDefault();
        if (!formData.proposalNumber || !formData.clientId || !formData.title || !formData.amount) {
            sonner_1.toast.error("Please fill in all required fields");
            return;
        }
        updateMutation.mutate({
            id: id || "",
            proposalNumber: formData.proposalNumber,
            clientId: formData.clientId,
            title: formData.title,
            description: formData.description || undefined,
            amount: Math.round(parseFloat(formData.amount) * 100),
            validUntil: new Date(formData.validUntil).toISOString().split("T")[0],
            status: formData.status,
            probability: formData.probability || undefined,
            notes: formData.notes || undefined
        });
    };
    var breadcrumbs = [
        { label: "Dashboard", href: "/crm-home" },
        { label: "Sales", href: "/sales" },
        { label: "Opportunities", href: "/opportunities" },
        { label: "Edit" },
    ];
    if (isLoading) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Edit Opportunity", description: "Update opportunity details", icon: React.createElement(lucide_react_1.FileText, { className: "w-6 h-6" }), breadcrumbs: breadcrumbs },
            React.createElement("div", { className: "flex items-center justify-center p-8" },
                React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin" }))));
    }
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Edit Opportunity", description: "Update opportunity details", icon: React.createElement(lucide_react_1.FileText, { className: "w-6 h-6" }), breadcrumbs: breadcrumbs },
        React.createElement("form", { onSubmit: handleSubmit, className: "max-w-4xl space-y-6 p-4 sm:p-6" },
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, { className: "pb-3" },
                    React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                        React.createElement(lucide_react_1.FileText, { className: "h-4 w-4 text-primary" }),
                        "Opportunity Details")),
                React.createElement(card_1.CardContent, { className: "space-y-4" },
                    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, null, "Opportunity Number *"),
                            React.createElement(input_1.Input, { value: formData.proposalNumber, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { proposalNumber: e.target.value })); }, placeholder: "e.g., PROP-001" })),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, null, "Status"),
                            React.createElement(select_1.Select, { value: formData.status, onValueChange: function (v) { return setFormData(__assign(__assign({}, formData), { status: v })); } },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, { placeholder: "Select status" })),
                                React.createElement(select_1.SelectContent, null,
                                    React.createElement(select_1.SelectItem, { value: "lead" }, "Lead"),
                                    React.createElement(select_1.SelectItem, { value: "qualified" }, "Qualified"),
                                    React.createElement(select_1.SelectItem, { value: "proposal" }, "Proposal"),
                                    React.createElement(select_1.SelectItem, { value: "negotiation" }, "Negotiation"),
                                    React.createElement(select_1.SelectItem, { value: "closed_won" }, "Closed Won"),
                                    React.createElement(select_1.SelectItem, { value: "closed_lost" }, "Closed Lost"))))),
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, null, "Opportunity Title *"),
                        React.createElement(input_1.Input, { value: formData.title, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { title: e.target.value })); }, placeholder: "e.g., Website Development Project" })))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, { className: "pb-3" },
                    React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                        React.createElement(lucide_react_1.Users, { className: "h-4 w-4 text-primary" }),
                        "Client")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "space-y-2 md:w-1/2" },
                        React.createElement(label_1.Label, null, "Client *"),
                        React.createElement(select_1.Select, { value: formData.clientId, onValueChange: function (v) { return setFormData(__assign(__assign({}, formData), { clientId: v })); } },
                            React.createElement(select_1.SelectTrigger, null,
                                React.createElement(select_1.SelectValue, { placeholder: "Select a client" })),
                            React.createElement(select_1.SelectContent, null, Array.isArray(clients) && clients.map(function (client) { return (React.createElement(select_1.SelectItem, { key: client.id, value: client.id }, client.companyName || client.contactPerson)); })))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, { className: "pb-3" },
                    React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                        React.createElement(lucide_react_1.DollarSign, { className: "h-4 w-4 text-primary" }),
                        "Financial Details")),
                React.createElement(card_1.CardContent, { className: "space-y-4" },
                    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4" },
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, null, "Amount (Ksh) *"),
                            React.createElement("div", { className: "relative" },
                                React.createElement(lucide_react_1.DollarSign, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
                                React.createElement(input_1.Input, { type: "number", value: formData.amount, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { amount: e.target.value })); }, placeholder: "0.00", step: "0.01", min: "0", className: "pl-9" }))),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, null, "Valid Until"),
                            React.createElement("div", { className: "relative" },
                                React.createElement(lucide_react_1.Calendar, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
                                React.createElement(input_1.Input, { type: "date", value: formData.validUntil, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { validUntil: e.target.value })); }, className: "pl-9" }))),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, null, "Win Probability (%)"),
                            React.createElement("div", { className: "relative" },
                                React.createElement(lucide_react_1.Target, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
                                React.createElement(input_1.Input, { type: "number", value: formData.probability, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { probability: parseInt(e.target.value) || 0 })); }, min: "0", max: "100", placeholder: "0", className: "pl-9" })))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, { className: "pb-3" },
                    React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                        React.createElement(lucide_react_1.ClipboardList, { className: "h-4 w-4 text-primary" }),
                        "Description & Notes")),
                React.createElement(card_1.CardContent, { className: "space-y-4" },
                    proposalTemplatesList.length > 0 && (React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, null, "Apply Template (optional)"),
                        React.createElement(select_1.Select, { value: selectedTemplateId, onValueChange: function (val) {
                                setSelectedTemplateId(val);
                                var tpl = proposalTemplatesList.find(function (t) { return t.id === val; });
                                if (tpl)
                                    setFormData(function (fd) { return (__assign(__assign({}, fd), { description: tpl.content })); });
                            } },
                            React.createElement(select_1.SelectTrigger, null,
                                React.createElement(select_1.SelectValue, { placeholder: "Select a template to pre-fill description..." })),
                            React.createElement(select_1.SelectContent, null, proposalTemplatesList.map(function (tpl) { return (React.createElement(select_1.SelectItem, { key: tpl.id, value: tpl.id }, tpl.title)); }))))),
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, null, "Description"),
                        React.createElement(RichTextEditor_1.RichTextEditor, { value: formData.description, onChange: function (v) { return setFormData(__assign(__assign({}, formData), { description: v })); }, placeholder: "Enter proposal description...", minHeight: "120px" })),
                    React.createElement(separator_1.Separator, null),
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, null, "Internal Notes"),
                        React.createElement(RichTextEditor_1.RichTextEditor, { value: formData.notes, onChange: function (v) { return setFormData(__assign(__assign({}, formData), { notes: v })); }, placeholder: "Add any internal notes...", minHeight: "100px" })))),
            React.createElement("div", { className: "flex gap-3 justify-end" },
                React.createElement(button_1.Button, { type: "button", variant: "outline", onClick: function () { return navigate("/opportunities"); } },
                    React.createElement(lucide_react_1.ArrowLeft, { className: "mr-2 h-4 w-4" }),
                    "Cancel"),
                React.createElement(button_1.Button, { type: "submit", disabled: updateMutation.isPending },
                    updateMutation.isPending ? React.createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : React.createElement(lucide_react_1.Save, { className: "mr-2 h-4 w-4" }),
                    updateMutation.isPending ? "Saving..." : "Save Changes")))));
}
exports["default"] = EditProposal;
