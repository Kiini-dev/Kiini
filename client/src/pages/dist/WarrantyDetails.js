"use strict";
exports.__esModule = true;
var wouter_1 = require("wouter");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var spinner_1 = require("@/components/ui/spinner");
function WarrantyDetails() {
    var id = wouter_1.useParams().id;
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var _b = trpc_1.trpc.warranty.getById.useQuery(id || "", { enabled: !!id }), warranty = _b.data, isLoading = _b.isLoading;
    var deleteMutation = trpc_1.trpc.warranty["delete"].useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Warranty deleted");
            navigate("/warranty");
        },
        onError: function (err) { return sonner_1.toast.error(err.message); }
    });
    if (isLoading) {
        return React.createElement("div", { className: "flex items-center justify-center h-screen" },
            React.createElement(spinner_1.Spinner, null));
    }
    if (!warranty) {
        return (React.createElement("div", { className: "flex flex-col items-center justify-center h-96 gap-4" },
            React.createElement("p", { className: "text-muted-foreground" }, "Warranty not found"),
            React.createElement(button_1.Button, { variant: "outline", onClick: function () { return navigate("/warranty"); } }, "Back to Warranties")));
    }
    var w = warranty;
    var statusColor = function (status) {
        return status === "active" ? "default" : status === "expiring_soon" ? "secondary" : "destructive";
    };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: w.product || "Warranty Details", icon: React.createElement(lucide_react_1.Shield, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Warranties", href: "/warranty" },
            { label: w.product || "Details" },
        ], actions: React.createElement("div", { className: "flex gap-2" },
            React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return navigate("/warranty"); } },
                React.createElement(lucide_react_1.ArrowLeft, { className: "h-4 w-4 mr-2" }),
                " Back"),
            React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return navigate("/warranty/" + id + "/edit"); } },
                React.createElement(lucide_react_1.Edit, { className: "h-4 w-4 mr-2" }),
                " Edit"),
            React.createElement(button_1.Button, { variant: "destructive", size: "sm", onClick: function () {
                    if (confirm("Delete this warranty?"))
                        deleteMutation.mutate(id);
                } },
                React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4 mr-2" }),
                " Delete")) },
        React.createElement("div", { className: "max-w-3xl space-y-6" },
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement("div", { className: "flex justify-between items-center" },
                        React.createElement(card_1.CardTitle, null, "Warranty Information"),
                        React.createElement(badge_1.Badge, { variant: statusColor(w.status || "active") }, w.status || "active"))),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-xs text-muted-foreground" }, "Product"),
                            React.createElement("p", { className: "font-semibold" }, w.product)),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-xs text-muted-foreground" }, "Vendor"),
                            React.createElement("p", { className: "font-semibold" }, w.vendor)),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-xs text-muted-foreground" }, "Serial Number"),
                            React.createElement("p", { className: "font-semibold" }, w.serialNumber || "—")),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-xs text-muted-foreground" }, "Expiry Date"),
                            React.createElement("p", { className: "font-semibold" }, w.expiryDate || "—")),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-xs text-muted-foreground" }, "Coverage"),
                            React.createElement("p", { className: "font-semibold" }, w.coverage || "—"))))),
            (w.claimTerms || w.notes) && (React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Additional Information")),
                React.createElement(card_1.CardContent, { className: "space-y-4" },
                    w.claimTerms && (React.createElement("div", null,
                        React.createElement("p", { className: "text-xs text-muted-foreground mb-1" }, "Claim Terms"),
                        React.createElement("p", { className: "text-sm whitespace-pre-wrap" }, w.claimTerms))),
                    w.notes && (React.createElement("div", null,
                        React.createElement("p", { className: "text-xs text-muted-foreground mb-1" }, "Notes"),
                        React.createElement("p", { className: "text-sm whitespace-pre-wrap" }, w.notes)))))))));
}
exports["default"] = WarrantyDetails;
