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
var OrgLayout_1 = require("@/components/OrgLayout");
var OrgBreadcrumb_1 = require("@/components/OrgBreadcrumb");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var RichTextEditor_1 = require("@/components/RichTextEditor");
var card_1 = require("@/components/ui/card");
var select_1 = require("@/components/ui/select");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
var useOrgPermission_1 = require("@/hooks/useOrgPermission");
function OrgEditTicket() {
    var _a, _b;
    var params = wouter_1.useParams();
    var slug = params.slug;
    var ticketId = params.id;
    var _c = wouter_1.useLocation(), navigate = _c[1];
    var hasPermission = useOrgPermission_1.useOrgPermission().hasPermission;
    var canEdit = hasPermission("tickets");
    var _d = react_1.useState({
        title: "",
        description: "",
        category: "",
        priority: "medium",
        status: "new",
        assignedTo: "",
        requestedDueDate: ""
    }), formData = _d[0], setFormData = _d[1];
    var _e = trpc_1.trpc.tickets.getById.useQuery(ticketId, { enabled: !!ticketId }), ticket = _e.data, isLoadingTicket = _e.isLoading;
    var _f = trpc_1.trpc.clients.list.useQuery(undefined).data, clients = _f === void 0 ? [] : _f;
    var _g = trpc_1.trpc.users.list.useQuery(undefined).data, usersData = _g === void 0 ? [] : _g;
    var teamMembers = Array.isArray(usersData) ? usersData : (_b = (_a = usersData) === null || _a === void 0 ? void 0 : _a.users) !== null && _b !== void 0 ? _b : [];
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
            utils.tickets.getById.invalidate(ticketId);
            navigate("/org/" + slug + "/tickets/" + ticketId);
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to update ticket: " + error.message);
        }
    });
    var handleSubmit = function (e) {
        e.preventDefault();
        if (!canEdit) {
            sonner_1.toast.error("You don't have permission to edit tickets");
            return;
        }
        if (!formData.title) {
            sonner_1.toast.error("Title is required");
            return;
        }
        updateMutation.mutate({
            id: ticketId,
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
    if (!canEdit) {
        return (React.createElement(OrgLayout_1["default"], null,
            React.createElement(OrgBreadcrumb_1["default"], { items: [
                    { label: "Dashboard", href: "/org/" + slug + "/dashboard" },
                    { label: "Tickets", href: "/org/" + slug + "/tickets" },
                    { label: "Access Denied" },
                ] }),
            React.createElement("div", { className: "text-center py-12" },
                React.createElement(lucide_react_1.AlertCircle, { className: "h-16 w-16 text-red-400 mx-auto mb-4" }),
                React.createElement("h2", { className: "text-2xl font-bold text-white mb-2" }, "Access Denied"),
                React.createElement("p", { className: "text-white/60 mb-6" }, "You don't have permission to edit tickets."),
                React.createElement(button_1.Button, { onClick: function () { return navigate("/org/" + slug + "/tickets"); } },
                    React.createElement(lucide_react_1.ArrowLeft, { className: "h-4 w-4 mr-2" }),
                    "Back to Tickets"))));
    }
    if (isLoadingTicket) {
        return (React.createElement(OrgLayout_1["default"], null,
            React.createElement(OrgBreadcrumb_1["default"], { items: [
                    { label: "Dashboard", href: "/org/" + slug + "/dashboard" },
                    { label: "Tickets", href: "/org/" + slug + "/tickets" },
                    { label: "Loading..." },
                ] }),
            React.createElement("div", { className: "flex items-center justify-center py-12" },
                React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin text-blue-500" }))));
    }
    return (React.createElement(OrgLayout_1["default"], null,
        React.createElement(OrgBreadcrumb_1["default"], { items: [
                { label: "Dashboard", href: "/org/" + slug + "/dashboard" },
                { label: "Tickets", href: "/org/" + slug + "/tickets" },
                { label: (ticket === null || ticket === void 0 ? void 0 : ticket.title) || "Ticket", href: "/org/" + slug + "/tickets/" + ticketId },
                { label: "Edit" },
            ] }),
        React.createElement("div", { className: "max-w-4xl mx-auto space-y-6" },
            React.createElement("div", { className: "flex items-center justify-between" },
                React.createElement("div", { className: "flex items-center gap-4" },
                    React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return navigate("/org/" + slug + "/tickets/" + ticketId); } },
                        React.createElement(lucide_react_1.ArrowLeft, { className: "h-4 w-4 mr-2" }),
                        "Back"),
                    React.createElement("div", null,
                        React.createElement("h1", { className: "text-2xl font-bold text-white flex items-center gap-2" },
                            React.createElement(lucide_react_1.TicketCheck, { className: "h-6 w-6" }),
                            "Edit Ticket"),
                        React.createElement("p", { className: "text-white/60" }, (ticket === null || ticket === void 0 ? void 0 : ticket.ticketNumber) || "Ticket #" + ticketId.slice(-8))))),
            React.createElement("form", { onSubmit: handleSubmit, className: "space-y-6" },
                React.createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
                    React.createElement(card_1.CardHeader, null,
                        React.createElement(card_1.CardTitle, { className: "text-white" }, "Ticket Information")),
                    React.createElement(card_1.CardContent, { className: "space-y-6" },
                        React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "title", className: "text-white" }, "Title *"),
                                React.createElement(input_1.Input, { id: "title", value: formData.title, onChange: function (e) { return update("title", e.target.value); }, placeholder: "Enter ticket title", required: true, className: "bg-white/5 border-white/20 text-white" })),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "category", className: "text-white" }, "Category"),
                                React.createElement(input_1.Input, { id: "category", value: formData.category, onChange: function (e) { return update("category", e.target.value); }, placeholder: "e.g., Bug, Feature, Support", className: "bg-white/5 border-white/20 text-white" })),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "priority", className: "text-white" }, "Priority"),
                                React.createElement(select_1.Select, { value: formData.priority, onValueChange: function (value) { return update("priority", value); } },
                                    React.createElement(select_1.SelectTrigger, { className: "bg-white/5 border-white/20 text-white" },
                                        React.createElement(select_1.SelectValue, null)),
                                    React.createElement(select_1.SelectContent, null,
                                        React.createElement(select_1.SelectItem, { value: "low" }, "Low"),
                                        React.createElement(select_1.SelectItem, { value: "medium" }, "Medium"),
                                        React.createElement(select_1.SelectItem, { value: "high" }, "High")))),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "status", className: "text-white" }, "Status"),
                                React.createElement(select_1.Select, { value: formData.status, onValueChange: function (value) { return update("status", value); } },
                                    React.createElement(select_1.SelectTrigger, { className: "bg-white/5 border-white/20 text-white" },
                                        React.createElement(select_1.SelectValue, null)),
                                    React.createElement(select_1.SelectContent, null,
                                        React.createElement(select_1.SelectItem, { value: "new" }, "New"),
                                        React.createElement(select_1.SelectItem, { value: "open" }, "Open"),
                                        React.createElement(select_1.SelectItem, { value: "in_progress" }, "In Progress"),
                                        React.createElement(select_1.SelectItem, { value: "on_hold" }, "On Hold"),
                                        React.createElement(select_1.SelectItem, { value: "resolved" }, "Resolved"),
                                        React.createElement(select_1.SelectItem, { value: "closed" }, "Closed")))),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "assignedTo", className: "text-white" }, "Assigned To"),
                                React.createElement(select_1.Select, { value: formData.assignedTo, onValueChange: function (value) { return update("assignedTo", value); } },
                                    React.createElement(select_1.SelectTrigger, { className: "bg-white/5 border-white/20 text-white" },
                                        React.createElement(select_1.SelectValue, { placeholder: "Select assignee" })),
                                    React.createElement(select_1.SelectContent, null, teamMembers.map(function (user) { return (React.createElement(select_1.SelectItem, { key: user.id, value: user.id }, user.name || user.email)); })))),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "requestedDueDate", className: "text-white" }, "Due Date"),
                                React.createElement(input_1.Input, { id: "requestedDueDate", type: "date", value: formData.requestedDueDate, onChange: function (e) { return update("requestedDueDate", e.target.value); }, className: "bg-white/5 border-white/20 text-white" }))),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "description", className: "text-white" }, "Description"),
                            React.createElement(RichTextEditor_1.RichTextEditor, { value: formData.description, onChange: function (value) { return update("description", value); }, placeholder: "Enter ticket description...", className: "min-h-[120px]" })))),
                React.createElement("div", { className: "flex items-center justify-end gap-4" },
                    React.createElement(button_1.Button, { type: "button", variant: "outline", onClick: function () { return navigate("/org/" + slug + "/tickets/" + ticketId); } }, "Cancel"),
                    React.createElement(button_1.Button, { type: "submit", disabled: updateMutation.isLoading, className: "bg-blue-600 hover:bg-blue-700" }, updateMutation.isLoading ? (React.createElement(React.Fragment, null,
                        React.createElement(lucide_react_1.Loader2, { className: "h-4 w-4 mr-2 animate-spin" }),
                        "Saving...")) : (React.createElement(React.Fragment, null,
                        React.createElement(lucide_react_1.Save, { className: "h-4 w-4 mr-2" }),
                        "Save Changes"))))))));
}
exports["default"] = OrgEditTicket;
