"use strict";
exports.__esModule = true;
var ModuleLayout_1 = require("@/components/ModuleLayout");
var DocumentForm_1 = require("@/components/forms/DocumentForm");
var lucide_react_1 = require("lucide-react");
var wouter_1 = require("wouter");
var sonner_1 = require("sonner");
var permissions_1 = require("@/lib/permissions");
var spinner_1 = require("@/components/ui/spinner");
var trpc_1 = require("@/lib/trpc");
var react_1 = require("react");
function EditReceipt() {
    // CALL ALL HOOKS UNCONDITIONALLY AT TOP LEVEL
    var _a = permissions_1.useRequireFeature("accounting:receipts:edit"), allowed = _a.allowed, isLoading = _a.isLoading;
    var _b = wouter_1.useLocation(), setLocation = _b[1];
    var params = wouter_1.useParams();
    var receiptId = params.id || "";
    // Fetch receipt data from backend
    var _c = trpc_1.trpc.receipts.getWithItems.useQuery(receiptId, {
        enabled: !!receiptId
    }), receiptData = _c.data, isLoadingReceiptData = _c.isLoading;
    var _d = trpc_1.trpc.clients.list.useQuery().data, clientsData = _d === void 0 ? [] : _d;
    var utils = trpc_1.trpc.useUtils();
    var updateReceiptMutation = trpc_1.trpc.receipts.update.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Receipt updated successfully");
            utils.receipts.list.invalidate();
            utils.receipts.getById.invalidate(receiptId);
            setLocation("/receipts");
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to update receipt");
        }
    });
    var deleteReceiptMutation = trpc_1.trpc.receipts["delete"].useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Receipt deleted successfully");
            utils.receipts.list.invalidate();
            setLocation("/receipts");
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to delete receipt");
        }
    });
    // Get client info
    var client = receiptData ? clientsData.find(function (c) { return c.id === receiptData.clientId; }) : null;
    // Transform backend data to form format
    var formData = receiptData ? {
        id: receiptId,
        documentNumber: receiptData.receiptNumber || "RCP-" + receiptId.slice(0, 8),
        clientId: receiptData.clientId || "",
        clientName: (client === null || client === void 0 ? void 0 : client.companyName) || "",
        clientEmail: (client === null || client === void 0 ? void 0 : client.email) || "",
        clientAddress: (client === null || client === void 0 ? void 0 : client.address) || "",
        date: receiptData.receiptDate ? new Date(receiptData.receiptDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        paymentMethod: receiptData.paymentMethod || "cash",
        lineItems: (receiptData.lineItems || receiptData.items || []).map(function (item, index) { return ({
            id: item.id || "" + index,
            sno: index + 1,
            description: item.description || "",
            uom: "Pcs",
            qty: item.quantity || 1,
            unitPrice: (item.rate || item.unitPrice || 0) / 100,
            tax: item.taxRate || 0,
            total: (item.amount || item.total || 0) / 100
        }); }) || [
            { id: "1", sno: 1, description: "", uom: "Pcs", qty: 1, unitPrice: 0, tax: 0, total: 0 }
        ],
        notes: receiptData.notes || "",
        subtotal: (receiptData.amount || 0) / 100,
        vat: 0,
        grandTotal: (receiptData.amount || 0) / 100,
        applyVAT: false,
        vatPercentage: 16
    } : null;
    var handleSave = react_1.useCallback(function (data) {
        var _a;
        var amount = data.grandTotal || 0;
        updateReceiptMutation.mutate({
            id: receiptId,
            receiptNumber: data.documentNumber,
            clientId: data.clientId || undefined,
            amount: Math.round(amount * 100),
            paymentMethod: (data.paymentMethod || "cash"),
            receiptDate: data.date ? new Date(data.date) : undefined,
            notes: data.notes || "",
            lineItems: (_a = data.lineItems) === null || _a === void 0 ? void 0 : _a.map(function (item) { return ({
                description: item.description,
                quantity: item.qty,
                unitPrice: Math.round(item.unitPrice * 100),
                taxRate: item.tax,
                total: Math.round(item.total * 100)
            }); })
        });
    }, [receiptId, updateReceiptMutation]);
    var handleSend = react_1.useCallback(function (data) {
        var _a;
        if (!data.clientEmail) {
            sonner_1.toast.error("Client email is required to send receipt");
            return;
        }
        var amount = data.grandTotal || 0;
        updateReceiptMutation.mutate({
            id: receiptId,
            receiptNumber: data.documentNumber,
            clientId: data.clientId || undefined,
            amount: Math.round(amount * 100),
            paymentMethod: (data.paymentMethod || "cash"),
            receiptDate: data.date ? new Date(data.date) : undefined,
            notes: data.notes || "",
            lineItems: (_a = data.lineItems) === null || _a === void 0 ? void 0 : _a.map(function (item) { return ({
                description: item.description,
                quantity: item.qty,
                unitPrice: Math.round(item.unitPrice * 100),
                taxRate: item.tax,
                total: Math.round(item.total * 100)
            }); })
        });
        sonner_1.toast.info("Receipt will be sent to " + data.clientEmail);
    }, [receiptId, updateReceiptMutation]);
    var handleDelete = react_1.useCallback(function () {
        if (confirm("Are you sure you want to delete this receipt? This action cannot be undone.")) {
            deleteReceiptMutation.mutate(receiptId);
        }
    }, [receiptId, deleteReceiptMutation]);
    // NOW SAFE TO CHECK CONDITIONAL RETURNS (ALL HOOKS ALREADY CALLED)
    if (isLoading) {
        return (React.createElement("div", { className: "flex items-center justify-center h-screen" },
            React.createElement(spinner_1.Spinner, { className: "size-8" })));
    }
    if (!allowed) {
        return null;
    }
    if (!receiptId) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Edit Receipt", icon: React.createElement(lucide_react_1.Edit, { className: "w-5 h-5" }), backLink: { label: "Receipts", href: "/receipts" }, breadcrumbs: [
                { label: "Dashboard", href: "/crm-home" },
                { label: "Receipts", href: "/receipts" },
                { label: "Edit" },
            ] },
            React.createElement("div", { className: "flex flex-col items-center justify-center h-64 gap-4" },
                React.createElement("p", null, "Invalid receipt ID"),
                React.createElement("button", { onClick: function () { return setLocation("/receipts"); }, className: "text-blue-500 hover:underline" }, "Back to Receipts"))));
    }
    if (!isLoadingReceiptData && !formData) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Edit Receipt", icon: React.createElement(lucide_react_1.Edit, { className: "w-5 h-5" }), backLink: { label: "Receipts", href: "/receipts" }, breadcrumbs: [
                { label: "Dashboard", href: "/crm-home" },
                { label: "Receipts", href: "/receipts" },
                { label: "Edit" },
            ] },
            React.createElement("div", { className: "flex flex-col items-center justify-center h-64 gap-4" },
                React.createElement("p", null, "Receipt not found"),
                React.createElement("button", { onClick: function () { return setLocation("/receipts"); }, className: "text-blue-500 hover:underline" }, "Back to Receipts"))));
    }
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Edit Receipt", description: "Modify receipt details", icon: React.createElement(lucide_react_1.Edit, { className: "w-5 h-5" }), backLink: { label: "Receipts", href: "/receipts" }, breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Receipts", href: "/receipts" },
            { label: "Edit" },
        ] },
        React.createElement(DocumentForm_1["default"], { type: "receipt", mode: "edit", initialData: formData, onSave: handleSave, onSend: handleSend, onDelete: handleDelete, isLoading: isLoading, isSaving: updateReceiptMutation.isPending || deleteReceiptMutation.isPending })));
}
exports["default"] = EditReceipt;
