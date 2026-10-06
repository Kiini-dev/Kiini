"use strict";
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var separator_1 = require("@/components/ui/separator");
var trpc_1 = require("@/lib/trpc");
var currency_1 = require("@/lib/currency");
var documentTemplate_1 = require("@/lib/documentTemplate");
var lucide_react_1 = require("lucide-react");
function LPODetails() {
    var _a;
    var params = wouter_1.useParams();
    var _b = wouter_1.useLocation(), setLocation = _b[1];
    var formatCurrency = currency_1.useCurrency().format;
    var _c = trpc_1.trpc.lpo.getById.useQuery(params.id, {
        enabled: !!params.id
    }), lpo = _c.data, isLoading = _c.isLoading;
    var _d = trpc_1.trpc.suppliers.list.useQuery({ limit: 100 }).data, suppliers = _d === void 0 ? [] : _d;
    var companyInfo = trpc_1.trpc.settings.getCompanyInfo.useQuery().data;
    var _e = trpc_1.trpc.documentTemplates.list.useQuery({ type: "purchase_order" }).data, docTemplatesList = _e === void 0 ? [] : _e;
    var defaultDocTemplate = docTemplatesList.find(function (t) { return t.isDefault; }) || docTemplatesList[0] || null;
    var vendorName = react_1.useMemo(function () {
        if (!(lpo === null || lpo === void 0 ? void 0 : lpo.vendorId))
            return "—";
        var supplier = suppliers.find(function (s) { return s.id === lpo.vendorId; });
        return (supplier === null || supplier === void 0 ? void 0 : supplier.companyName) || (supplier === null || supplier === void 0 ? void 0 : supplier.name) || lpo.vendorId;
    }, [lpo === null || lpo === void 0 ? void 0 : lpo.vendorId, suppliers]);
    var handlePrint = function () {
        var printWindow = window.open('', '_blank');
        if (!printWindow)
            return;
        var html = documentTemplate_1.generateDocumentHTML({
            documentType: 'purchase_order',
            documentNumber: (lpo === null || lpo === void 0 ? void 0 : lpo.lpoNumber) || 'LPO',
            documentDate: (lpo === null || lpo === void 0 ? void 0 : lpo.createdAt) ? new Date(lpo.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
            dueDate: (lpo === null || lpo === void 0 ? void 0 : lpo.deliveryDate) ? new Date(lpo.deliveryDate).toLocaleDateString() : undefined,
            companyName: companyInfo === null || companyInfo === void 0 ? void 0 : companyInfo.companyName,
            companyLogo: companyInfo === null || companyInfo === void 0 ? void 0 : companyInfo.companyLogo,
            companyPhone: companyInfo === null || companyInfo === void 0 ? void 0 : companyInfo.companyPhone,
            companyEmail: companyInfo === null || companyInfo === void 0 ? void 0 : companyInfo.companyEmail,
            companyWebsite: companyInfo === null || companyInfo === void 0 ? void 0 : companyInfo.companyWebsite,
            companyAddress: companyInfo === null || companyInfo === void 0 ? void 0 : companyInfo.companyAddress,
            clientName: vendorName,
            clientEmail: '',
            clientPhone: '',
            clientAddress: (lpo === null || lpo === void 0 ? void 0 : lpo.deliveryLocation) || '',
            items: [],
            subtotal: ((lpo === null || lpo === void 0 ? void 0 : lpo.amount) || 0) / 100,
            tax: 0,
            total: ((lpo === null || lpo === void 0 ? void 0 : lpo.amount) || 0) / 100,
            notes: (lpo === null || lpo === void 0 ? void 0 : lpo.notes) || (lpo === null || lpo === void 0 ? void 0 : lpo.description) || '',
            customTemplateHtml: (defaultDocTemplate === null || defaultDocTemplate === void 0 ? void 0 : defaultDocTemplate.content) || undefined
        });
        printWindow.document.write(html);
        printWindow.document.close();
    };
    var statusColors = {
        draft: "bg-gray-100 text-gray-800",
        submitted: "bg-blue-100 text-blue-800",
        approved: "bg-green-100 text-green-800",
        rejected: "bg-red-100 text-red-800",
        received: "bg-purple-100 text-purple-800"
    };
    if (isLoading) {
        return (React.createElement("div", { className: "flex items-center justify-center min-h-[400px]" },
            React.createElement(lucide_react_1.Loader2, { className: "w-8 h-8 animate-spin text-muted-foreground" })));
    }
    if (!lpo) {
        return (React.createElement("div", { className: "flex flex-col items-center justify-center min-h-[400px] gap-4" },
            React.createElement("p", { className: "text-muted-foreground" }, "LPO not found"),
            React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setLocation("/lpos"); } },
                React.createElement(lucide_react_1.ArrowLeft, { className: "w-4 h-4 mr-2" }),
                " Back to LPOs")));
    }
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "LPO " + (lpo.lpoNumber || ""), description: "Local Purchase Order Details", icon: React.createElement(lucide_react_1.ShoppingCart, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "LPOs", href: "/lpos" },
            { label: lpo.lpoNumber || "Details" },
        ], actions: React.createElement("div", { className: "flex gap-2" },
            React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setLocation("/lpos"); } },
                React.createElement(lucide_react_1.ArrowLeft, { className: "w-4 h-4 mr-2" }),
                " Back"),
            React.createElement(button_1.Button, { variant: "outline", onClick: handlePrint },
                React.createElement(lucide_react_1.Printer, { className: "w-4 h-4 mr-2" }),
                " Print"),
            React.createElement(button_1.Button, { onClick: function () { return setLocation("/lpos/" + params.id + "/edit"); } },
                React.createElement(lucide_react_1.Edit2, { className: "w-4 h-4 mr-2" }),
                " Edit")) },
        React.createElement("div", { className: "max-w-4xl space-y-6" },
            React.createElement("div", { className: "flex items-center justify-between" },
                React.createElement(badge_1.Badge, { className: "text-sm px-3 py-1 " + (statusColors[lpo.status] || "") }, (_a = lpo.status) === null || _a === void 0 ? void 0 : _a.toUpperCase()),
                React.createElement("span", { className: "text-sm text-muted-foreground" },
                    "Created ",
                    new Date(lpo.createdAt).toLocaleDateString())),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, { className: "pb-4" },
                    React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                        React.createElement(lucide_react_1.Building2, { className: "w-4 h-4 text-blue-600" }),
                        "Order Information")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "LPO Number"),
                            React.createElement("p", { className: "font-medium" }, lpo.lpoNumber || "—")),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Vendor"),
                            React.createElement("p", { className: "font-medium" }, vendorName))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, { className: "pb-4" },
                    React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                        React.createElement(lucide_react_1.Coins, { className: "w-4 h-4 text-green-600" }),
                        "Financial Details")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Amount"),
                            React.createElement("p", { className: "font-medium text-lg" }, lpo.amount
                                ? formatCurrency(lpo.amount)
                                : "—")),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Status"),
                            React.createElement("p", { className: "font-medium capitalize" }, lpo.status || "—"))))),
            (lpo.deliveryDate || lpo.deliveryLocation || lpo.requestedBy) && (React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, { className: "pb-4" },
                    React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                        React.createElement(lucide_react_1.Truck, { className: "w-4 h-4 text-orange-600" }),
                        "Delivery Details")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6" },
                        lpo.deliveryDate && (React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Delivery Date"),
                            React.createElement("p", { className: "font-medium" }, new Date(lpo.deliveryDate).toLocaleDateString()))),
                        lpo.deliveryLocation && (React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Delivery Location"),
                            React.createElement("p", { className: "font-medium" }, lpo.deliveryLocation))),
                        lpo.requestedBy && (React.createElement("div", null,
                            React.createElement("p", { className: "text-sm text-muted-foreground" }, "Requested By"),
                            React.createElement("p", { className: "font-medium" }, lpo.requestedBy))))))),
            (lpo.description || lpo.notes) && (React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, { className: "pb-4" },
                    React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                        React.createElement(lucide_react_1.StickyNote, { className: "w-4 h-4 text-purple-600" }),
                        "Description & Notes")),
                React.createElement(card_1.CardContent, { className: "space-y-4" },
                    lpo.description && (React.createElement("div", null,
                        React.createElement("p", { className: "text-sm text-muted-foreground mb-2" }, "Description"),
                        React.createElement("div", { className: "prose prose-sm max-w-none", dangerouslySetInnerHTML: { __html: lpo.description } }))),
                    lpo.description && lpo.notes && React.createElement(separator_1.Separator, null),
                    lpo.notes && (React.createElement("div", null,
                        React.createElement("p", { className: "text-sm text-muted-foreground mb-2" }, "Notes"),
                        React.createElement("div", { className: "prose prose-sm max-w-none", dangerouslySetInnerHTML: { __html: lpo.notes } })))))))));
}
exports["default"] = LPODetails;
