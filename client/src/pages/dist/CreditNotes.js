"use strict";
exports.__esModule = true;
var ModuleLayout_1 = require("@/components/ModuleLayout");
var wouter_1 = require("wouter");
var permissions_1 = require("@/lib/permissions");
var trpc_1 = require("@/lib/trpc");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var spinner_1 = require("@/components/ui/spinner");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
function CreditNotes() {
    var _a = permissions_1.useRequireFeature("accounting:credit-notes:view"), allowed = _a.allowed, permLoading = _a.isLoading;
    var _b = wouter_1.useLocation(), setLocation = _b[1];
    var listQuery = trpc_1.trpc.creditNotes.list.useQuery({});
    var creditNotes = listQuery.data || [];
    var deleteMutation = trpc_1.trpc.creditNotes["delete"].useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Credit note deleted successfully");
            listQuery.refetch();
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to delete: " + error.message);
        }
    });
    var handleDelete = function (id) {
        if (confirm("Are you sure you want to delete this credit note?")) {
            deleteMutation.mutate({ id: id });
        }
    };
    if (permLoading)
        return React.createElement(spinner_1.Spinner, null);
    if (!allowed)
        return React.createElement("div", { className: "text-center py-10" }, "Access Denied");
    return (React.createElement(ModuleLayout_1["default"], { title: "Credit Notes", description: "Manage customer credit notes and adjustments", icon: React.createElement(lucide_react_1.FileText, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Accounting", href: "/accounting" },
            { label: "Credit Notes" },
        ] },
        React.createElement("div", { className: "flex justify-end mb-6" },
            React.createElement(button_1.Button, { onClick: function () { return setLocation("/credit-notes/create"); } },
                React.createElement(lucide_react_1.Plus, { className: "w-4 h-4 mr-2" }),
                "New Credit Note")),
        listQuery.isLoading ? (React.createElement("div", { className: "flex justify-center py-10" },
            React.createElement(spinner_1.Spinner, null))) : creditNotes.length === 0 ? (React.createElement(card_1.Card, null,
            React.createElement(card_1.CardContent, { className: "py-10 text-center text-gray-500" }, "No credit notes created yet. Click \"New Credit Note\" to create one."))) : (React.createElement("div", { className: "grid gap-4" }, creditNotes.map(function (cn) {
            var _a;
            return (React.createElement(card_1.Card, { key: cn.id, className: "hover:shadow-lg transition-shadow" },
                React.createElement(card_1.CardHeader, { className: "pb-3" },
                    React.createElement("div", { className: "flex justify-between items-start" },
                        React.createElement("div", null,
                            React.createElement(card_1.CardTitle, null, cn.creditNoteNumber),
                            React.createElement("p", { className: "text-sm text-gray-600" }, cn.clientName)),
                        React.createElement("span", { className: "px-3 py-1 rounded-full text-xs font-medium " + (cn.status === "draft" ? "bg-gray-100 text-gray-800" :
                                cn.status === "approved" ? "bg-green-100 text-green-800" :
                                    cn.status === "applied" ? "bg-blue-100 text-blue-800" :
                                        "bg-red-100 text-red-800") }, cn.status))),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "grid grid-cols-3 gap-4 mb-4" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-xs text-gray-600" }, "Issue Date"),
                            React.createElement("p", { className: "font-semibold" }, new Date(cn.issueDate).toLocaleDateString())),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-xs text-gray-600" }, "Reason"),
                            React.createElement("p", { className: "font-semibold text-sm capitalize" }, (_a = cn.reason) === null || _a === void 0 ? void 0 : _a.replace(/-/g, ' '))),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-xs text-gray-600" }, "Amount"),
                            React.createElement("p", { className: "font-bold" },
                                "KES ",
                                (cn.total / 100).toLocaleString()))),
                    React.createElement("div", { className: "flex gap-2" },
                        React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return setLocation("/credit-notes/" + cn.id); } },
                            React.createElement(lucide_react_1.Eye, { className: "w-4 h-4 mr-2" }),
                            "View"),
                        React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return handleDelete(cn.id); } },
                            React.createElement(lucide_react_1.Trash2, { className: "w-4 h-4 mr-2" }),
                            "Delete")))));
        })))));
}
exports["default"] = CreditNotes;
