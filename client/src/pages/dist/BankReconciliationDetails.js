"use strict";
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var separator_1 = require("@/components/ui/separator");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var DeleteConfirmationModal_1 = require("@/components/DeleteConfirmationModal");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var trpc_1 = require("@/lib/trpc");
var currency_1 = require("@/lib/currency");
function BankReconciliationDetails() {
    var id = wouter_1.useParams().id;
    var _a = wouter_1.useLocation(), setLocation = _a[1];
    var formatCurrency = currency_1.useCurrency().format;
    var _b = react_1.useState(false), showDeleteModal = _b[0], setShowDeleteModal = _b[1];
    var _c = react_1.useState(false), isDeleting = _c[0], setIsDeleting = _c[1];
    // Fetch real reconciliation data from backend
    var _d = trpc_1.trpc.bankReconciliation.getById.useQuery(id || "", {
        enabled: !!id
    }), reconciliation = _d.data, isLoading = _d.isLoading;
    var handleDelete = function () {
        sonner_1.toast.success("Bank reconciliation record deleted successfully");
        setShowDeleteModal(false);
        setLocation("/bank-reconciliation");
    };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Bank Reconciliation Details", icon: React.createElement(lucide_react_1.Building2, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/" },
            { label: "Finance", href: "/accounting" },
            { label: "Bank Reconciliation", href: "/bank-reconciliation" },
            { label: "Details" },
        ], backLink: { label: "Bank Reconciliation", href: "/bank-reconciliation" }, actions: React.createElement("div", { className: "flex gap-2" },
            React.createElement(button_1.Button, { variant: "outline", className: "gap-2", onClick: function () { return setLocation("/bank-reconciliation/" + id + "/edit"); } },
                React.createElement(lucide_react_1.Edit2, { className: "w-4 h-4" }),
                "Edit"),
            React.createElement(button_1.Button, { variant: "destructive", className: "gap-2", onClick: function () { return setShowDeleteModal(true); } },
                React.createElement(lucide_react_1.Trash2, { className: "w-4 h-4" }),
                "Delete")) },
        React.createElement("div", { className: "space-y-6" },
            isLoading ? (React.createElement(card_1.Card, null,
                React.createElement(card_1.CardContent, { className: "p-8" },
                    React.createElement("p", { className: "text-muted-foreground text-center" }, "Loading reconciliation data...")))) : !reconciliation ? (React.createElement(card_1.Card, null,
                React.createElement(card_1.CardContent, { className: "p-8" },
                    React.createElement("p", { className: "text-muted-foreground text-center" }, "Reconciliation not found")))) : (React.createElement("div", { className: "flex flex-col lg:flex-row gap-6" },
                React.createElement("div", { className: "lg:w-1/3 space-y-6" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement("div", { className: "flex items-center justify-between" },
                                React.createElement(card_1.CardTitle, { className: "text-lg" }, reconciliation.bankAccount || "Bank Account"),
                                React.createElement(badge_1.Badge, { variant: reconciliation.status === "Reconciled" ? "default" : "secondary" }, reconciliation.status))),
                        React.createElement(card_1.CardContent, { className: "space-y-4" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm text-muted-foreground" }, "Bank Balance"),
                                React.createElement("p", { className: "text-xl font-semibold" }, formatCurrency((reconciliation.bankBalance || 0)))),
                            React.createElement(separator_1.Separator, null),
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm text-muted-foreground" }, "Book Balance"),
                                React.createElement("p", { className: "text-xl font-semibold" }, formatCurrency((reconciliation.bookBalance || 0)))),
                            React.createElement(separator_1.Separator, null),
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm text-muted-foreground" }, "Difference"),
                                React.createElement("p", { className: "text-xl font-semibold " + (reconciliation.difference === 0 ? "text-green-600" : "text-orange-600") }, formatCurrency((reconciliation.difference || 0)))),
                            React.createElement(separator_1.Separator, null),
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-sm text-muted-foreground" }, "Reconciliation Date"),
                                React.createElement("p", { className: "font-semibold" }, reconciliation.reconciliationDate
                                    ? new Date(reconciliation.reconciliationDate).toLocaleDateString()
                                    : "N/A")),
                            reconciliation.period && (React.createElement(React.Fragment, null,
                                React.createElement(separator_1.Separator, null),
                                React.createElement("div", null,
                                    React.createElement("p", { className: "text-sm text-muted-foreground" }, "Period"),
                                    React.createElement("p", { className: "font-semibold" }, reconciliation.period))))))),
                React.createElement("div", { className: "lg:w-2/3 space-y-6" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, { className: "text-lg" }, "Transaction Summary")),
                        React.createElement(card_1.CardContent, { className: "space-y-4" }, reconciliation.matchedTransactions !== undefined ? (React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
                            React.createElement(card_1.Card, { className: "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900" },
                                React.createElement(card_1.CardContent, { className: "p-4 text-center" },
                                    React.createElement("p", { className: "text-sm text-muted-foreground" }, "Matched Transactions"),
                                    React.createElement("p", { className: "text-3xl font-bold text-green-600" }, reconciliation.matchedTransactions))),
                            React.createElement(card_1.Card, { className: "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900" },
                                React.createElement(card_1.CardContent, { className: "p-4 text-center" },
                                    React.createElement("p", { className: "text-sm text-muted-foreground" }, "Unmatched Transactions"),
                                    React.createElement("p", { className: "text-3xl font-bold text-orange-600" }, reconciliation.unmatchedTransactions))))) : (React.createElement("p", { className: "text-muted-foreground text-sm" }, "No transaction data available.")))),
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, { className: "text-lg" }, "Notes")),
                        React.createElement(card_1.CardContent, null,
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, reconciliation.notes || "No notes recorded for this reconciliation.")))))),
            React.createElement(DeleteConfirmationModal_1["default"], { isOpen: showDeleteModal, title: "Delete Reconciliation", description: "Are you sure you want to delete this bank reconciliation record? This action cannot be undone.", onConfirm: handleDelete, onCancel: function () { return setShowDeleteModal(false); }, isLoading: isDeleting }))));
}
exports["default"] = BankReconciliationDetails;
