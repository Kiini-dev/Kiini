"use strict";
exports.__esModule = true;
var ModuleLayout_1 = require("@/components/ModuleLayout");
var DocumentForm_1 = require("@/components/forms/DocumentForm");
var lucide_react_1 = require("lucide-react");
var wouter_1 = require("wouter");
var sonner_1 = require("sonner");
var trpc_1 = require("@/lib/trpc");
var react_1 = require("react");
function EditEstimate() {
    var _a = wouter_1.useLocation(), setLocation = _a[1];
    var params = wouter_1.useParams();
    var estimateId = params.id || "";
    // Fetch estimate data from backend
    var _b = trpc_1.trpc.estimates.getWithItems.useQuery(estimateId, {
        enabled: !!estimateId
    }), estimateData = _b.data, isLoading = _b.isLoading;
    var _c = trpc_1.trpc.clients.list.useQuery().data, clientsData = _c === void 0 ? [] : _c;
    var utils = trpc_1.trpc.useUtils();
    var updateEstimateMutation = trpc_1.trpc.estimates.update.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Estimate updated successfully");
            utils.estimates.list.invalidate();
            utils.estimates.getById.invalidate(estimateId);
            setLocation("/estimates");
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to update estimate");
        }
    });
    var deleteEstimateMutation = trpc_1.trpc.estimates["delete"].useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Estimate deleted successfully");
            utils.estimates.list.invalidate();
            setLocation("/estimates");
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to delete estimate");
        }
    });
    // Get client info
    var client = estimateData ? clientsData.find(function (c) { return c.id === estimateData.clientId; }) : null;
    // Transform backend data to form format
    var formData = react_1.useMemo(function () { return estimateData ? {
        id: estimateId,
        documentNumber: estimateData.estimateNumber || "EST-" + estimateId.slice(0, 8),
        clientId: estimateData.clientId || "",
        clientName: (client === null || client === void 0 ? void 0 : client.companyName) || "",
        clientEmail: (client === null || client === void 0 ? void 0 : client.email) || "",
        clientAddress: (client === null || client === void 0 ? void 0 : client.address) || "",
        date: estimateData.issueDate ? new Date(estimateData.issueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        dueDate: estimateData.expiryDate ? new Date(estimateData.expiryDate).toISOString().split('T')[0] : "",
        lineItems: (estimateData.lineItems || estimateData.items || []).map(function (item, index) { return ({
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
        notes: estimateData.notes || "",
        subtotal: (estimateData.subtotal || 0) / 100,
        vat: (estimateData.taxAmount || 0) / 100,
        grandTotal: (estimateData.total || 0) / 100,
        applyVAT: (estimateData.taxAmount || 0) > 0,
        vatPercentage: (estimateData.taxAmount || 0) > 0 && (estimateData.subtotal || 0) > 0
            ? Math.round((estimateData.taxAmount / estimateData.subtotal) * 100)
            : 16,
        status: estimateData.status || "draft"
    } : null; }, [estimateData, estimateId, client]);
    var handleSave = react_1.useCallback(function (data) {
        var _a;
        var subtotal = data.subtotal || 0;
        var taxAmount = data.vat || 0;
        var total = data.grandTotal || (subtotal + taxAmount);
        updateEstimateMutation.mutate({
            id: estimateId,
            estimateNumber: data.documentNumber,
            clientId: data.clientId || undefined,
            title: data.clientName ? "Quotation for " + data.clientName : undefined,
            issueDate: data.date ? new Date(data.date) : undefined,
            expiryDate: data.dueDate ? new Date(data.dueDate) : undefined,
            subtotal: Math.round(subtotal * 100),
            taxAmount: Math.round(taxAmount * 100),
            discountAmount: 0,
            total: Math.round(total * 100),
            status: (data.status || "draft"),
            notes: data.notes || "",
            terms: "",
            lineItems: (_a = data.lineItems) === null || _a === void 0 ? void 0 : _a.map(function (item) { return ({
                itemType: 'custom',
                description: item.description,
                quantity: item.qty,
                unitPrice: Math.round(item.unitPrice * 100),
                taxRate: item.tax,
                discountPercent: 0,
                total: Math.round(item.total * 100)
            }); })
        });
    }, [estimateId]);
    var handleSend = react_1.useCallback(function (data) {
        var _a;
        if (!data.clientEmail) {
            sonner_1.toast.error("Client email is required to send estimate");
            return;
        }
        var subtotal = data.subtotal || 0;
        var taxAmount = data.vat || 0;
        var total = data.grandTotal || (subtotal + taxAmount);
        updateEstimateMutation.mutate({
            id: estimateId,
            estimateNumber: data.documentNumber,
            clientId: data.clientId || undefined,
            title: data.clientName ? "Quotation for " + data.clientName : undefined,
            issueDate: data.date ? new Date(data.date) : undefined,
            expiryDate: data.dueDate ? new Date(data.dueDate) : undefined,
            subtotal: Math.round(subtotal * 100),
            taxAmount: Math.round(taxAmount * 100),
            discountAmount: 0,
            total: Math.round(total * 100),
            status: "sent",
            notes: data.notes || "",
            terms: "",
            lineItems: (_a = data.lineItems) === null || _a === void 0 ? void 0 : _a.map(function (item) { return ({
                itemType: 'custom',
                description: item.description,
                quantity: item.qty,
                unitPrice: Math.round(item.unitPrice * 100),
                taxRate: item.tax,
                discountPercent: 0,
                total: Math.round(item.total * 100)
            }); })
        });
        sonner_1.toast.info("Estimate will be sent to " + data.clientEmail);
    }, [estimateId]);
    var handleDelete = react_1.useCallback(function () {
        if (confirm("Are you sure you want to delete this estimate? This action cannot be undone.")) {
            deleteEstimateMutation.mutate(estimateId);
        }
    }, [estimateId]);
    if (!estimateId) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Edit Estimate", icon: React.createElement(lucide_react_1.Edit, { className: "w-5 h-5" }), backLink: { label: "Estimates", href: "/estimates" }, breadcrumbs: [
                { label: "Dashboard", href: "/crm-home" },
                { label: "Estimates", href: "/estimates" },
                { label: "Edit" },
            ] },
            React.createElement("div", { className: "flex flex-col items-center justify-center h-64 gap-4" },
                React.createElement("p", null, "Invalid estimate ID"),
                React.createElement("button", { onClick: function () { return setLocation("/estimates"); }, className: "text-blue-500 hover:underline" }, "Back to Estimates"))));
    }
    if (!isLoading && !formData) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Edit Estimate", icon: React.createElement(lucide_react_1.Edit, { className: "w-5 h-5" }), backLink: { label: "Estimates", href: "/estimates" }, breadcrumbs: [
                { label: "Dashboard", href: "/crm-home" },
                { label: "Estimates", href: "/estimates" },
                { label: "Edit" },
            ] },
            React.createElement("div", { className: "flex flex-col items-center justify-center h-64 gap-4" },
                React.createElement("p", null, "Estimate not found"),
                React.createElement("button", { onClick: function () { return setLocation("/estimates"); }, className: "text-blue-500 hover:underline" }, "Back to Estimates"))));
    }
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Edit Estimate", description: "Modify estimate details", icon: React.createElement(lucide_react_1.Edit, { className: "w-5 h-5" }), backLink: { label: "Estimates", href: "/estimates" }, breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Estimates", href: "/estimates" },
            { label: "Edit" },
        ] },
        React.createElement(DocumentForm_1["default"], { type: "estimate", mode: "edit", initialData: formData, onSave: handleSave, onSend: handleSend, onDelete: handleDelete, isLoading: isLoading, isSaving: updateEstimateMutation.isPending || deleteEstimateMutation.isPending })));
}
exports["default"] = EditEstimate;
