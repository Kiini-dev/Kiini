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
function EditTicket() {
    var id = wouter_1.useParams().id;
    var _a = wouter_1.useLocation(), setLocation = _a[1];
    var _b = react_1.useState({
        title: "",
        description: "",
        category: "",
        priority: "medium",
        status: "new",
        assignedTo: "",
        requestedDueDate: ""
    }), formData = _b[0], setFormData = _b[1];
    var _c = trpc_1.trpc.tickets.getById.useQuery(id || "", { enabled: !!id }), ticket = _c.data, isLoadingTicket = _c.isLoading;
    var _d = trpc_1.trpc.clients.list.useQuery().data, clients = _d === void 0 ? [] : _d;
    var utils = trpc_1.trpc.useUtils();
    react_1.useEffect(function () {
        if (ticket) {
            setFormData({
                title: ticket.title || "",
                description: ticket.description || "",
                category: ticket.category || "",
                priority: ticket.priority || "medium",
                status: ticket.status || "new",
                assignedTo: ticket.assignedTo || "",
                requestedDueDate: ticket.requestedDueDate ? new Date(ticket.requestedDueDate).toISOString().split("T")[0] : ""
            });
        }
    }, [ticket]);
    var updateMutation = trpc_1.trpc.tickets.update.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Ticket updated successfully!");
            utils.tickets.list.invalidate();
            utils.tickets.getById.invalidate(id || "");
            setLocation("/tickets");
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to update ticket: " + error.message);
        }
    });
    var handleSubmit = function (e) {
        e.preventDefault();
        if (!formData.title) {
            sonner_1.toast.error("Title is required");
            return;
        }
        updateMutation.mutate({
            id: id || "",
            title: formData.title,
            description: formData.description || undefined,
            category: formData.category || undefined,
            priority: formData.priority,
            status: formData.status || undefined,
            assignedTo: formData.assignedTo || undefined,
            requestedDueDate: formData.requestedDueDate || undefined
        });
    };
    var update = function (field, value) {
        return setFormData(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[field] = value, _a)));
        });
    };
    if (isLoadingTicket) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Edit Ticket", icon: React.createElement(lucide_react_1.TicketCheck, { className: "h-5 w-5" }) },
            React.createElement("div", { className: "flex items-center justify-center py-12" },
                React.createElement(spinner_1.Spinner, { className: "h-8 w-8" }))));
    }
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Edit Ticket", icon: React.createElement(lucide_react_1.TicketCheck, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Tickets", href: "/tickets" },
            { label: "Edit Ticket" },
        ], actions: React.createElement("div", { className: "flex gap-2" },
            React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setLocation("/tickets"); } }, "Cancel"),
            React.createElement(button_1.Button, { onClick: handleSubmit, disabled: updateMutation.isPending },
                updateMutation.isPending ? React.createElement(spinner_1.Spinner, { className: "mr-2 h-4 w-4" }) : null,
                "Save Changes")) },
        React.createElement("form", { onSubmit: handleSubmit, className: "max-w-3xl space-y-6" },
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Ticket Details")),
                React.createElement(card_1.CardContent, { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                    React.createElement("div", { className: "md:col-span-2" },
                        React.createElement(label_1.Label, { htmlFor: "title" }, "Title *"),
                        React.createElement(input_1.Input, { id: "title", value: formData.title, onChange: function (e) { return update("title", e.target.value); }, required: true })),
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
                        React.createElement(label_1.Label, { htmlFor: "status" }, "Status"),
                        React.createElement(select_1.Select, { value: formData.status, onValueChange: function (v) { return update("status", v); } },
                            React.createElement(select_1.SelectTrigger, null,
                                React.createElement(select_1.SelectValue, null)),
                            React.createElement(select_1.SelectContent, null,
                                React.createElement(select_1.SelectItem, { value: "new" }, "New"),
                                React.createElement(select_1.SelectItem, { value: "open" }, "Open"),
                                React.createElement(select_1.SelectItem, { value: "in_progress" }, "In Progress"),
                                React.createElement(select_1.SelectItem, { value: "resolved" }, "Resolved"),
                                React.createElement(select_1.SelectItem, { value: "closed" }, "Closed")))),
                    React.createElement("div", null,
                        React.createElement(label_1.Label, { htmlFor: "requestedDueDate" }, "Requested Due Date"),
                        React.createElement(input_1.Input, { id: "requestedDueDate", type: "date", value: formData.requestedDueDate, onChange: function (e) { return update("requestedDueDate", e.target.value); } })),
                    React.createElement("div", { className: "md:col-span-2" },
                        React.createElement(label_1.Label, { htmlFor: "description" }, "Description"),
                        React.createElement(RichTextEditor_1.RichTextEditor, { value: formData.description, onChange: function (html) { return update("description", html); }, minHeight: "150px" })))))));
}
exports["default"] = EditTicket;
