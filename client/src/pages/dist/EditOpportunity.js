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
var select_1 = require("@/components/ui/select");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
function EditOpportunity() {
    var params = wouter_1.useParams();
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var utils = trpc_1.trpc.useUtils();
    var opportunityId = params.id;
    var _b = react_1.useState({
        clientId: "",
        title: "",
        description: "",
        value: "",
        stage: "prospecting",
        probability: "",
        expectedCloseDate: "",
        source: "",
        notes: ""
    }), formData = _b[0], setFormData = _b[1];
    // Fetch opportunity data
    var _c = trpc_1.trpc.opportunities.getById.useQuery(opportunityId || "", {
        enabled: !!opportunityId
    }), opportunity = _c.data, isLoading = _c.isLoading;
    var _d = trpc_1.trpc.clients.list.useQuery().data, clients = _d === void 0 ? [] : _d;
    // Populate form when opportunity data loads
    react_1.useEffect(function () {
        if (opportunity) {
            setFormData({
                clientId: opportunity.clientId || "",
                title: opportunity.title || "",
                description: opportunity.description || "",
                value: opportunity.value ? (opportunity.value / 100).toString() : "",
                stage: opportunity.stage || "prospecting",
                probability: opportunity.probability ? opportunity.probability.toString() : "",
                expectedCloseDate: opportunity.expectedCloseDate ? new Date(opportunity.expectedCloseDate).toISOString().split("T")[0] : "",
                source: opportunity.source || "",
                notes: opportunity.notes || ""
            });
        }
    }, [opportunity]);
    var updateOpportunityMutation = trpc_1.trpc.opportunities.update.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Opportunity updated successfully!");
            utils.opportunities.list.invalidate();
            utils.opportunities.getById.invalidate(opportunityId || "");
            navigate("/opportunities");
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to update opportunity: " + error.message);
        }
    });
    var deleteOpportunityMutation = trpc_1.trpc.opportunities["delete"].useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Opportunity deleted successfully!");
            utils.opportunities.list.invalidate();
            navigate("/opportunities");
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to delete opportunity: " + error.message);
        }
    });
    var handleSubmit = function (e) {
        e.preventDefault();
        if (!formData.clientId || !formData.title || !formData.value) {
            sonner_1.toast.error("Please fill in all required fields");
            return;
        }
        if (!opportunityId) {
            sonner_1.toast.error("Opportunity ID is missing");
            return;
        }
        updateOpportunityMutation.mutate({
            id: opportunityId,
            clientId: formData.clientId,
            title: formData.title,
            description: formData.description || undefined,
            value: Math.round(parseFloat(formData.value) * 100),
            stage: formData.stage,
            probability: formData.probability ? parseInt(formData.probability) : undefined,
            expectedCloseDate: formData.expectedCloseDate ? new Date(formData.expectedCloseDate).toISOString().split("T")[0] : undefined,
            source: formData.source || undefined,
            notes: formData.notes || undefined
        });
    };
    var handleDelete = function () {
        if (confirm("Are you sure you want to delete this opportunity? This action cannot be undone.")) {
            deleteOpportunityMutation.mutate(opportunityId || "");
        }
    };
    if (isLoading) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Edit Opportunity", description: "Loading opportunity details...", icon: React.createElement(lucide_react_1.TrendingUp, { className: "w-6 h-6" }), breadcrumbs: [
                { label: "Dashboard", href: "/" },
                { label: "Sales", href: "/sales" },
                { label: "Opportunities", href: "/opportunities" },
                { label: "Edit Opportunity" },
            ] },
            React.createElement("div", { className: "flex items-center justify-center h-96" },
                React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin" }))));
    }
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Edit Opportunity", description: "Update opportunity details", icon: React.createElement(lucide_react_1.TrendingUp, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/" },
            { label: "Sales", href: "/sales" },
            { label: "Opportunities", href: "/opportunities" },
            { label: "Edit Opportunity" },
        ] },
        React.createElement("div", { className: "max-w-2xl" },
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Edit Opportunity"),
                    React.createElement(card_1.CardDescription, null, "Update the opportunity details below")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("form", { onSubmit: handleSubmit, className: "space-y-6" },
                        React.createElement("div", { className: "grid gap-4 md:grid-cols-2" },
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "clientId" }, "Client *"),
                                React.createElement(select_1.Select, { value: formData.clientId, onValueChange: function (value) { return setFormData(__assign(__assign({}, formData), { clientId: value })); } },
                                    React.createElement(select_1.SelectTrigger, null,
                                        React.createElement(select_1.SelectValue, { placeholder: "Select a client" })),
                                    React.createElement(select_1.SelectContent, null, clients.map(function (client) { return (React.createElement(select_1.SelectItem, { key: client.id, value: client.id }, client.companyName || client.name)); })))),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "title" }, "Opportunity Name *"),
                                React.createElement(input_1.Input, { id: "title", placeholder: "e.g., Website Redesign Project", value: formData.title, onChange: function (e) {
                                        return setFormData(__assign(__assign({}, formData), { title: e.target.value }));
                                    } }))),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "description" }, "Description"),
                            React.createElement(RichTextEditor_1.RichTextEditor, { value: formData.description, onChange: function (v) { return setFormData(__assign(__assign({}, formData), { description: v })); }, placeholder: "Enter opportunity description", minHeight: "120px" })),
                        React.createElement("div", { className: "grid gap-4 md:grid-cols-3" },
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "value" }, "Opportunity Value (Ksh) *"),
                                React.createElement(input_1.Input, { id: "value", type: "number", placeholder: "0.00", value: formData.value, onChange: function (e) {
                                        return setFormData(__assign(__assign({}, formData), { value: e.target.value }));
                                    }, step: "0.01", min: "0" })),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "probability" }, "Probability (%)"),
                                React.createElement(input_1.Input, { id: "probability", type: "number", placeholder: "0", value: formData.probability, onChange: function (e) {
                                        return setFormData(__assign(__assign({}, formData), { probability: e.target.value }));
                                    }, min: "0", max: "100" })),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "expectedCloseDate" }, "Expected Close Date"),
                                React.createElement(input_1.Input, { id: "expectedCloseDate", type: "date", value: formData.expectedCloseDate, onChange: function (e) {
                                        return setFormData(__assign(__assign({}, formData), { expectedCloseDate: e.target.value }));
                                    } }))),
                        React.createElement("div", { className: "grid gap-4 md:grid-cols-2" },
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "stage" }, "Stage"),
                                React.createElement(select_1.Select, { value: formData.stage, onValueChange: function (value) { return setFormData(__assign(__assign({}, formData), { stage: value })); } },
                                    React.createElement(select_1.SelectTrigger, null,
                                        React.createElement(select_1.SelectValue, null)),
                                    React.createElement(select_1.SelectContent, null,
                                        React.createElement(select_1.SelectItem, { value: "prospecting" }, "Prospecting"),
                                        React.createElement(select_1.SelectItem, { value: "qualification" }, "Qualification"),
                                        React.createElement(select_1.SelectItem, { value: "proposal" }, "Proposal"),
                                        React.createElement(select_1.SelectItem, { value: "negotiation" }, "Negotiation"),
                                        React.createElement(select_1.SelectItem, { value: "closed_won" }, "Closed Won"),
                                        React.createElement(select_1.SelectItem, { value: "closed_lost" }, "Closed Lost")))),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "source" }, "Source"),
                                React.createElement(input_1.Input, { id: "source", placeholder: "e.g., Referral, Website", value: formData.source, onChange: function (e) {
                                        return setFormData(__assign(__assign({}, formData), { source: e.target.value }));
                                    } }))),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "notes" }, "Notes"),
                            React.createElement(RichTextEditor_1.RichTextEditor, { value: formData.notes, onChange: function (v) { return setFormData(__assign(__assign({}, formData), { notes: v })); }, placeholder: "Enter any additional notes", minHeight: "100px" })),
                        React.createElement("div", { className: "flex gap-4 justify-between" },
                            React.createElement(button_1.Button, { type: "button", variant: "destructive", onClick: handleDelete, disabled: deleteOpportunityMutation.isPending },
                                deleteOpportunityMutation.isPending ? (React.createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" })) : (React.createElement(lucide_react_1.Trash2, { className: "mr-2 h-4 w-4" })),
                                "Delete Opportunity"),
                            React.createElement("div", { className: "flex gap-2" },
                                React.createElement(button_1.Button, { type: "button", variant: "outline", onClick: function () { return navigate("/opportunities"); } },
                                    React.createElement(lucide_react_1.ArrowLeft, { className: "mr-2 h-4 w-4" }),
                                    "Cancel"),
                                React.createElement(button_1.Button, { type: "submit", disabled: updateOpportunityMutation.isPending },
                                    updateOpportunityMutation.isPending ? (React.createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" })) : (React.createElement(lucide_react_1.Save, { className: "mr-2 h-4 w-4" })),
                                    "Update Opportunity")))))))));
}
exports["default"] = EditOpportunity;
