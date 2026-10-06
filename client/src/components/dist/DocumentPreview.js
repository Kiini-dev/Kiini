"use strict";
/**
 * Document Preview Component
 *
 * Displays document preview cards with hover effects and status timeline
 */
exports.__esModule = true;
exports.BulkDocumentActions = exports.StatusWorkflowTimeline = exports.DocumentPreview = void 0;
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var trpc_1 = require("@/lib/trpc");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var permissions_1 = require("@/lib/permissions");
var spinner_1 = require("@/components/ui/spinner");
function DocumentPreview(_a) {
    var documentType = _a.documentType, documentId = _a.documentId, onPreview = _a.onPreview, onDownload = _a.onDownload, onEmail = _a.onEmail;
    // ALL HOOKS MUST BE CALLED BEFORE CONDITIONAL RETURNS
    var _b = permissions_1.useRequireFeature("reports:export"), allowed = _b.allowed, isLoading = _b.isLoading;
    var _c = trpc_1.trpc.documentManagement.getDocumentPreview.useQuery({
        documentType: documentType,
        documentId: documentId
    }), preview = _c.data, isLoadingPreview = _c.isLoading;
    var _d = react_1.useState(false), showPreview = _d[0], setShowPreview = _d[1];
    // NOW SAFE TO CHECK CONDITIONAL RETURNS (ALL HOOKS ALREADY CALLED)
    if (isLoading)
        return React.createElement("div", { className: "flex items-center justify-center h-screen" },
            React.createElement(spinner_1.Spinner, { className: "size-8" }));
    if (!allowed)
        return null;
    if (isLoadingPreview) {
        return (React.createElement(card_1.Card, { className: "animate-pulse" },
            React.createElement(card_1.CardHeader, { className: "pb-3" },
                React.createElement("div", { className: "h-4 bg-gray-200 rounded w-1/2" })),
            React.createElement(card_1.CardContent, null,
                React.createElement("div", { className: "h-20 bg-gray-200 rounded" }))));
    }
    if (!preview) {
        return null;
    }
    var document = preview.document, lineItems = preview.lineItems, client = preview.client;
    var statusColors = {
        draft: "bg-gray-100 text-gray-800",
        sent: "bg-blue-100 text-blue-800",
        paid: "bg-green-100 text-green-800",
        issued: "bg-green-100 text-green-800",
        pending: "bg-yellow-100 text-yellow-800",
        overdue: "bg-red-100 text-red-800",
        cancelled: "bg-red-100 text-red-800"
    };
    return (React.createElement("div", { className: "group relative" },
        React.createElement(card_1.Card, { className: "cursor-pointer hover:shadow-lg transition-shadow" },
            React.createElement(card_1.CardHeader, { className: "pb-3" },
                React.createElement("div", { className: "flex items-start justify-between" },
                    React.createElement("div", null,
                        React.createElement(card_1.CardTitle, { className: "text-base" },
                            documentType === "invoice" && document.invoiceNumber,
                            documentType === "receipt" && document.receiptNumber,
                            documentType === "estimate" && document.estimateNumber),
                        React.createElement(card_1.CardDescription, { className: "text-xs" }, (client === null || client === void 0 ? void 0 : client.companyName) || "Unknown Client")),
                    React.createElement("span", { className: "px-2 py-1 rounded text-xs font-medium " + (statusColors[document.status] || "bg-gray-100") }, document.status))),
            React.createElement(card_1.CardContent, { className: "space-y-3" },
                React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm" },
                    React.createElement("div", null,
                        React.createElement("p", { className: "text-gray-600" }, "Amount"),
                        React.createElement("p", { className: "font-bold" },
                            "$",
                            parseFloat(document.total || 0).toFixed(2))),
                    React.createElement("div", null,
                        React.createElement("p", { className: "text-gray-600" }, "Items"),
                        React.createElement("p", { className: "font-bold" }, (lineItems === null || lineItems === void 0 ? void 0 : lineItems.length) || 0))),
                React.createElement("div", { className: "flex gap-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity" },
                    React.createElement(button_1.Button, { size: "sm", variant: "outline", className: "flex-1", onClick: function () {
                            setShowPreview(true);
                            onPreview === null || onPreview === void 0 ? void 0 : onPreview();
                        } },
                        React.createElement(lucide_react_1.Eye, { className: "w-4 h-4 mr-1" }),
                        "Preview"),
                    React.createElement(button_1.Button, { size: "sm", variant: "outline", className: "flex-1", onClick: onDownload },
                        React.createElement(lucide_react_1.Download, { className: "w-4 h-4 mr-1" }),
                        "Download"),
                    React.createElement(button_1.Button, { size: "sm", variant: "outline", className: "flex-1", onClick: onEmail },
                        React.createElement(lucide_react_1.Mail, { className: "w-4 h-4 mr-1" }),
                        "Email")))),
        showPreview && (React.createElement(DocumentPreviewModal, { document: preview, documentType: documentType, onClose: function () { return setShowPreview(false); } }))));
}
exports.DocumentPreview = DocumentPreview;
function DocumentPreviewModal(_a) {
    var document = _a.document, documentType = _a.documentType, onClose = _a.onClose;
    return (React.createElement("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" },
        React.createElement(card_1.Card, { className: "w-full max-w-2xl max-h-[90vh] overflow-y-auto" },
            React.createElement(card_1.CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-4 border-b" },
                React.createElement("div", null,
                    React.createElement(card_1.CardTitle, null, "Document Preview"),
                    React.createElement(card_1.CardDescription, null, documentType.toUpperCase())),
                React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: onClose }, "\u2715")),
            React.createElement(card_1.CardContent, { className: "pt-6" },
                React.createElement(DocumentPreviewContent, { document: document })))));
}
function DocumentPreviewContent(_a) {
    var document = _a.document;
    var doc = document.document, lineItems = document.lineItems, client = document.client;
    return (React.createElement("div", { className: "space-y-6" },
        React.createElement("div", { className: "border-b pb-4" },
            React.createElement("h2", { className: "text-2xl font-bold mb-2" }, doc.invoiceNumber || doc.receiptNumber || doc.estimateNumber),
            React.createElement("p", { className: "text-gray-600" }, (client === null || client === void 0 ? void 0 : client.companyName) || "Unknown Client")),
        lineItems && lineItems.length > 0 && (React.createElement("div", null,
            React.createElement("h3", { className: "font-semibold mb-3" }, "Items"),
            React.createElement("div", { className: "overflow-x-auto" },
                React.createElement("table", { className: "w-full text-sm" },
                    React.createElement("thead", null,
                        React.createElement("tr", { className: "border-b" },
                            React.createElement("th", { className: "text-left py-2" }, "Description"),
                            React.createElement("th", { className: "text-right py-2" }, "Qty"),
                            React.createElement("th", { className: "text-right py-2" }, "Unit Price"),
                            React.createElement("th", { className: "text-right py-2" }, "Total"))),
                    React.createElement("tbody", null, lineItems.map(function (item) { return (React.createElement("tr", { key: item.id || item.itemDescription, className: "border-b" },
                        React.createElement("td", { className: "py-2" }, item.itemDescription),
                        React.createElement("td", { className: "text-right" }, item.quantity),
                        React.createElement("td", { className: "text-right" },
                            "$",
                            parseFloat(item.unitPrice || 0).toFixed(2)),
                        React.createElement("td", { className: "text-right font-semibold" },
                            "$",
                            parseFloat(item.lineTotal || 0).toFixed(2)))); })))))),
        React.createElement("div", { className: "flex justify-end" },
            React.createElement("div", { className: "w-full max-w-xs space-y-2 border-t pt-4" },
                React.createElement("div", { className: "flex justify-between" },
                    React.createElement("span", null, "Subtotal:"),
                    React.createElement("span", null,
                        "$",
                        (parseFloat(doc.total || 0) - parseFloat(doc.tax || 0)).toFixed(2))),
                React.createElement("div", { className: "flex justify-between" },
                    React.createElement("span", null, "Tax:"),
                    React.createElement("span", null,
                        "$",
                        parseFloat(doc.tax || 0).toFixed(2))),
                React.createElement("div", { className: "flex justify-between font-bold text-lg border-t pt-2" },
                    React.createElement("span", null, "Total:"),
                    React.createElement("span", null,
                        "$",
                        parseFloat(doc.total || 0).toFixed(2)))))));
}
/**
 * Status Workflow Timeline
 */
function StatusWorkflowTimeline(_a) {
    var documentType = _a.documentType, currentStatus = _a.currentStatus;
    var workflow = trpc_1.trpc.documentManagement.getDocumentWorkflow.useQuery({
        documentType: documentType,
        documentId: ""
    }).data;
    var possibleStatuses = (workflow === null || workflow === void 0 ? void 0 : workflow[currentStatus]) || [];
    var statusIcons = {
        draft: "📝",
        sent: "📤",
        paid: "✅",
        issued: "✅",
        overdue: "⏰",
        cancelled: "❌",
        pending: "⏳",
        accepted: "👍",
        rejected: "👎",
        expired: "⏱️"
    };
    return (React.createElement("div", { className: "flex items-center gap-2" },
        React.createElement("span", { className: "text-sm font-medium" },
            statusIcons[currentStatus],
            " ",
            currentStatus),
        possibleStatuses.length > 0 && (React.createElement(React.Fragment, null,
            React.createElement("span", { className: "text-gray-300" }, "\u2192"),
            React.createElement("div", { className: "flex gap-1" }, possibleStatuses.map(function (status) { return (React.createElement("span", { key: status, className: "text-xs px-2 py-1 bg-gray-100 rounded" },
                statusIcons[status],
                " ",
                status)); }))))));
}
exports.StatusWorkflowTimeline = StatusWorkflowTimeline;
/**
 * Bulk Document Actions
 */
function BulkDocumentActions(_a) {
    var documentType = _a.documentType, selectedIds = _a.selectedIds, onDownload = _a.onDownload, onEmail = _a.onEmail;
    var _b = permissions_1.useRequireFeature("reports:export"), allowed = _b.allowed, isLoading = _b.isLoading;
    if (isLoading)
        return React.createElement("div", { className: "flex items-center justify-center h-screen" },
            React.createElement(spinner_1.Spinner, { className: "size-8" }));
    if (!allowed)
        return null;
    var _c = trpc_1.trpc.documentManagement.getDocumentsForBulk.useQuery({
        documentType: documentType,
        ids: selectedIds
    }), documents = _c.data, isLoading = _c.isLoading;
    if (selectedIds.length === 0) {
        return null;
    }
    return (React.createElement(card_1.Card, { className: "bg-blue-50 border-blue-200" },
        React.createElement(card_1.CardContent, { className: "pt-6" },
            React.createElement("div", { className: "flex items-center justify-between" },
                React.createElement("p", { className: "text-sm font-medium" },
                    selectedIds.length,
                    " document",
                    selectedIds.length > 1 ? "s" : "",
                    " selected"),
                React.createElement("div", { className: "flex gap-2" },
                    React.createElement(button_1.Button, { size: "sm", variant: "outline", onClick: function () { return onDownload(selectedIds); }, disabled: isLoading },
                        React.createElement(lucide_react_1.Download, { className: "w-4 h-4 mr-1" }),
                        "Download All"),
                    React.createElement(button_1.Button, { size: "sm", variant: "outline", onClick: function () { return onEmail(selectedIds); }, disabled: isLoading },
                        React.createElement(lucide_react_1.Mail, { className: "w-4 h-4 mr-1" }),
                        "Email All"))))));
}
exports.BulkDocumentActions = BulkDocumentActions;
