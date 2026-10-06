"use strict";
exports.__esModule = true;
var wouter_1 = require("wouter");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var trpc_1 = require("@/lib/trpc");
var currency_1 = require("@/lib/currency");
var lucide_react_1 = require("lucide-react");
function QuotationDetails() {
    var _a;
    var params = wouter_1.useParams();
    var _b = wouter_1.useLocation(), setLocation = _b[1];
    var currencyCode = currency_1.useCurrencySettings().code;
    var _c = trpc_1.trpc.quotations.getById.useQuery(params.id, {
        enabled: !!params.id
    }), quotation = _c.data, isLoading = _c.isLoading;
    var statusColors = {
        draft: "bg-gray-100 text-gray-800",
        submitted: "bg-blue-100 text-blue-800",
        under_review: "bg-yellow-100 text-yellow-800",
        approved: "bg-green-100 text-green-800",
        rejected: "bg-red-100 text-red-800"
    };
    if (isLoading) {
        return (React.createElement("div", { className: "flex items-center justify-center min-h-[400px]" },
            React.createElement(lucide_react_1.Loader2, { className: "w-8 h-8 animate-spin text-muted-foreground" })));
    }
    if (!quotation) {
        return (React.createElement("div", { className: "flex flex-col items-center justify-center min-h-[400px] gap-4" },
            React.createElement("p", { className: "text-muted-foreground" }, "Quotation not found"),
            React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setLocation("/quotations"); } },
                React.createElement(lucide_react_1.ArrowLeft, { className: "w-4 h-4 mr-2" }),
                " Back to Quotations")));
    }
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "RFQ " + (quotation.rfqNo || ""), description: "Request for Quotation Details", icon: React.createElement(lucide_react_1.FileText, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Procurement", href: "/procurement" },
            { label: "Quotations", href: "/quotations" },
            { label: quotation.rfqNo || "Details" },
        ], actions: React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setLocation("/quotations"); } },
            React.createElement(lucide_react_1.ArrowLeft, { className: "w-4 h-4 mr-2" }),
            " Back") },
        React.createElement("div", { className: "w-full space-y-3 sm:space-y-4 md:space-y-6" },
            React.createElement("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4" },
                React.createElement(badge_1.Badge, { className: "text-xs sm:text-sm px-2 sm:px-3 py-1 w-fit " + (statusColors[quotation.status] || "bg-gray-100 text-gray-800") }, (_a = quotation.status) === null || _a === void 0 ? void 0 : _a.replace("_", " ").toUpperCase()),
                quotation.createdAt && (React.createElement("span", { className: "text-xs sm:text-sm text-muted-foreground" },
                    "Created ",
                    new Date(quotation.createdAt).toLocaleDateString()))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, { className: "py-3 sm:py-4 pb-2 sm:pb-4" },
                    React.createElement(card_1.CardTitle, { className: "text-sm sm:text-base flex items-center gap-2" },
                        React.createElement(lucide_react_1.Building2, { className: "w-3 sm:w-4 h-3 sm:h-4 text-blue-600" }),
                        "RFQ Information")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-xs sm:text-sm text-muted-foreground" }, "RFQ Number"),
                            React.createElement("p", { className: "text-sm sm:text-base font-medium" }, quotation.rfqNo || "—")),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-xs sm:text-sm text-muted-foreground" }, "Supplier"),
                            React.createElement("p", { className: "text-sm sm:text-base font-medium truncate" }, quotation.supplier || "—"))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, { className: "py-3 sm:py-4 pb-2 sm:pb-4" },
                    React.createElement(card_1.CardTitle, { className: "text-sm sm:text-base flex items-center gap-2" },
                        React.createElement(lucide_react_1.Coins, { className: "w-3 sm:w-4 h-3 sm:h-4 text-green-600" }),
                        "Financial & Schedule")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-xs sm:text-sm text-muted-foreground" }, "Amount"),
                            React.createElement("p", { className: "text-base sm:text-lg font-medium whitespace-nowrap" },
                                currencyCode,
                                " ",
                                ((quotation.amount || 0) / 100).toLocaleString())),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-xs sm:text-sm text-muted-foreground flex items-center gap-1" },
                                React.createElement(lucide_react_1.Calendar, { className: "w-3 h-3" }),
                                " Due Date"),
                            React.createElement("p", { className: "text-sm sm:text-base font-medium" }, quotation.dueDate ? new Date(quotation.dueDate).toLocaleDateString() : "—"))))),
            quotation.description && (React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, { className: "py-3 sm:py-4 pb-2 sm:pb-4" },
                    React.createElement(card_1.CardTitle, { className: "text-sm sm:text-base flex items-center gap-2" },
                        React.createElement(lucide_react_1.StickyNote, { className: "w-3 sm:w-4 h-3 sm:h-4 text-orange-600" }),
                        "Description")),
                React.createElement(card_1.CardContent, { className: "text-xs sm:text-sm" },
                    React.createElement("div", { className: "prose prose-sm max-w-none", dangerouslySetInnerHTML: { __html: quotation.description } })))))));
}
exports["default"] = QuotationDetails;
