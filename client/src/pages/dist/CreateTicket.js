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
var spinner_1 = require("@/components/ui/spinner");
var lucide_react_1 = require("lucide-react");
function CreateTicket() {
    var _a = wouter_1.useLocation(), setLocation = _a[1];
    var _b = react_1.useState({
        clientId: "",
        title: "",
        description: "",
        category: "",
        priority: "medium",
        requestedDueDate: ""
    }), formData = _b[0], setFormData = _b[1];
    var _c = trpc_1.trpc.clients.list.useQuery({}).data, clients = _c === void 0 ? [] : _c;
    var createMutation = trpc_1.trpc.tickets.create.useMutation({
        onSuccess: function (data) {
            sonner_1.toast.success("Ticket created successfully!");
            setLocation("/tickets");
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to create ticket: " + error.message);
        }
    });
    var handleSubmit = function (e) {
        e.preventDefault();
        if (!formData.clientId || !formData.title) {
            sonner_1.toast.error("Client and title are required");
            return;
        }
        createMutation.mutate(__assign(__assign({}, formData), { description: formData.description || undefined, category: formData.category || undefined, requestedDueDate: formData.requestedDueDate || undefined }));
    };
    var update = function (field, value) {
        return setFormData(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[field] = value, _a)));
        });
    };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Create Ticket", icon: React.createElement(lucide_react_1.TicketPlus, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Tickets", href: "/tickets" },
            { label: "Create Ticket" },
        ], actions: React.createElement("div", { className: "flex gap-2" },
            React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setLocation("/tickets"); } }, "Cancel"),
            React.createElement(button_1.Button, { onClick: handleSubmit, disabled: createMutation.isPending },
                createMutation.isPending ? React.createElement(spinner_1.Spinner, { className: "mr-2 h-4 w-4" }) : null,
                "Create Ticket")) },
        React.createElement("form", { onSubmit: handleSubmit, className: "max-w-3xl space-y-6" },
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Ticket Details")),
                React.createElement(card_1.CardContent, { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                    React.createElement("div", { className: "md:col-span-2" },
                        React.createElement(label_1.Label, { htmlFor: "title" }, "Title *"),
                        React.createElement(input_1.Input, { id: "title", value: formData.title, onChange: function (e) { return update("title", e.target.value); }, required: true, placeholder: "Brief description of the issue" })),
                    React.createElement("div", null,
                        React.createElement(label_1.Label, { htmlFor: "clientId" }, "Client *"),
                        React.createElement("select", { id: "clientId", className: "w-full rounded-md border bg-background px-3 py-2 text-sm", value: formData.clientId, onChange: function (e) { return update("clientId", e.target.value); }, required: true },
                            React.createElement("option", { value: "" }, "Select client..."),
                            clients.map(function (c) { return (React.createElement("option", { key: c.id, value: c.id }, c.companyName || c.firstName + " " + c.lastName)); }))),
                    React.createElement("div", null,
                        React.createElement(label_1.Label, { htmlFor: "category" }, "Category"),
                        React.createElement(select_1.Select, { value: formData.category, onValueChange: function (v) { return update("category", v); } },
                            React.createElement(select_1.SelectTrigger, null,
                                React.createElement(select_1.SelectValue, { placeholder: "Select category" })),
                            React.createElement(select_1.SelectContent, null,
                                React.createElement(select_1.SelectItem, { value: "technical" }, "Technical"),
                                React.createElement(select_1.SelectItem, { value: "billing" }, "Billing"),
                                React.createElement(select_1.SelectItem, { value: "general" }, "General"),
                                React.createElement(select_1.SelectItem, { value: "feature-request" }, "Feature Request"),
                                React.createElement(select_1.SelectItem, { value: "bug" }, "Bug Report")))),
                    React.createElement("div", null,
                        React.createElement(label_1.Label, { htmlFor: "priority" }, "Priority"),
                        React.createElement(select_1.Select, { value: formData.priority, onValueChange: function (v) { return update("priority", v); } },
                            React.createElement(select_1.SelectTrigger, null,
                                React.createElement(select_1.SelectValue, null)),
                            React.createElement(select_1.SelectContent, null,
                                React.createElement(select_1.SelectItem, { value: "low" }, "Low"),
                                React.createElement(select_1.SelectItem, { value: "medium" }, "Medium"),
                                React.createElement(select_1.SelectItem, { value: "high" }, "High")))),
                    React.createElement("div", null,
                        React.createElement(label_1.Label, { htmlFor: "requestedDueDate" }, "Requested Due Date"),
                        React.createElement(input_1.Input, { id: "requestedDueDate", type: "date", value: formData.requestedDueDate, onChange: function (e) { return update("requestedDueDate", e.target.value); } })),
                    React.createElement("div", { className: "md:col-span-2" },
                        React.createElement(label_1.Label, { htmlFor: "description" }, "Description"),
                        React.createElement(RichTextEditor_1.RichTextEditor, { value: formData.description, onChange: function (html) { return update("description", html); }, minHeight: "150px", placeholder: "Detailed description of the issue..." })))))));
}
exports["default"] = CreateTicket;
