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
function EditInvoice() {
    // CALL ALL HOOKS UNCONDITIONALLY AT TOP LEVEL
    var _a = permissions_1.useRequireFeature("accounting:invoices:edit"), allowed = _a.allowed, isLoading = _a.isLoading;
    var _b = wouter_1.useLocation(), setLocation = _b[1];
    var params = wouter_1.useParams();
    var invoiceId = params.id || "";
    // Fetch invoice data from backend with line items
    var _c = trpc_1.trpc.invoices.getWithItems.useQuery(invoiceId), invoiceData = _c.data, isLoadingInvoiceData = _c.isLoading;
    var _d = trpc_1.trpc.clients.list.useQuery().data, clientsData = _d === void 0 ? [] : _d;
    var utils = trpc_1.trpc.useUtils();
    var updateInvoiceMutation = trpc_1.trpc.invoices.update.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Invoice updated successfully");
            utils.invoices.list.invalidate();
            utils.invoices.getById.invalidate(invoiceId);
            setLocation("/invoices");
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to update invoice");
        }
    });
    var deleteInvoiceMutation = trpc_1.trpc.invoices["delete"].useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Invoice deleted successfully");
            utils.invoices.list.invalidate();
            setLocation("/invoices");
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to delete invoice");
        }
    });
    // Get client info
    var client = invoiceData ? clientsData.find(function (c) { return c.id === invoiceData.clientId; }) : null;
    // Transform backend data to form format
    var formData = react_1.useMemo(function () { return invoiceData ? {
        id: invoiceId,
        documentNumber: invoiceData.invoiceNumber || "INV-" + invoiceId.slice(0, 8),
        clientId: invoiceData.clientId || "",
        clientName: (client === null || client === void 0 ? void 0 : client.companyName) || "",
        clientEmail: (client === null || client === void 0 ? void 0 : client.email) || "",
        clientAddress: (client === null || client === void 0 ? void 0 : client.address) || "",
        date: invoiceData.issueDate ? new Date(invoiceData.issueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        dueDate: invoiceData.dueDate ? new Date(invoiceData.dueDate).toISOString().split('T')[0] : "",
        lineItems: (invoiceData.lineItems || invoiceData.items || []).map(function (item, index) { return ({
            id: item.id || "" + index,
            sno: index + 1,
            description: item.description || "",
            uom: "Pcs",
            qty: item.quantity || 1,
            unitPrice: (item.unitPrice || 0) / 100,
            tax: item.taxRate || 0,
            total: (item.total || 0) / 100
        }); }) || [
            { id: "1", sno: 1, description: "", uom: "Pcs", qty: 1, unitPrice: 0, tax: 0, total: 0 }
        ],
        notes: invoiceData.notes || "",
        subtotal: (invoiceData.subtotal || 0) / 100,
        vat: (invoiceData.taxAmount || invoiceData.tax || 0) / 100,
        grandTotal: (invoiceData.total || 0) / 100,
        applyVAT: (invoiceData.taxAmount || 0) > 0,
        vatPercentage: (invoiceData.taxAmount || 0) > 0 && (invoiceData.subtotal || 0) > 0
            ? Math.round((invoiceData.taxAmount / invoiceData.subtotal) * 100)
            : 16,
        status: invoiceData.status || "draft"
    } : null; }, [invoiceData, invoiceId, client]);
    var handleSave = react_1.useCallback(function (data) {
        var _a;
        var subtotal = data.subtotal || 0;
        var taxAmount = data.vat || 0;
        var total = data.grandTotal || (subtotal + taxAmount);
        updateInvoiceMutation.mutate({
            id: invoiceId,
            invoiceNumber: data.documentNumber,
            clientId: data.clientId || undefined,
            title: data.clientName ? "Invoice for " + data.clientName : undefined,
            issueDate: data.date ? new Date(data.date) : undefined,
            dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
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
    }, [invoiceId]);
    var handleSend = react_1.useCallback(function (data) {
        var _a;
        if (!data.clientEmail) {
            sonner_1.toast.error("Client email is required to send invoice");
            return;
        }
        var subtotal = data.subtotal || 0;
        var taxAmount = data.vat || 0;
        var total = data.grandTotal || (subtotal + taxAmount);
        updateInvoiceMutation.mutate({
            id: invoiceId,
            invoiceNumber: data.documentNumber,
            clientId: data.clientId || undefined,
            title: data.clientName ? "Invoice for " + data.clientName : undefined,
            issueDate: data.date ? new Date(data.date) : undefined,
            dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
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
        sonner_1.toast.info("Invoice will be sent to " + data.clientEmail);
    }, [invoiceId]);
    var handleDelete = react_1.useCallback(function () {
        if (confirm("Are you sure you want to delete this invoice? This action cannot be undone.")) {
            deleteInvoiceMutation.mutate(invoiceId);
        }
    }, [invoiceId]);
    // NOW SAFE TO CHECK CONDITIONAL RETURNS (ALL HOOKS ALREADY CALLED)
    if (isLoading) {
        return (React.createElement("div", { className: "flex items-center justify-center h-screen" },
            React.createElement(spinner_1.Spinner, { className: "size-8" })));
    }
    if (!allowed) {
        return null;
    }
    if (!invoiceId) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Edit Invoice", icon: React.createElement(lucide_react_1.Edit, { className: "w-5 h-5" }), backLink: { label: "Invoices", href: "/invoices" }, breadcrumbs: [
                { label: "Dashboard", href: "/crm-home" },
                { label: "Invoices", href: "/invoices" },
                { label: "Edit" },
            ] },
            React.createElement("div", { className: "flex flex-col items-center justify-center h-64 gap-4" },
                React.createElement("p", null, "Invalid invoice ID"),
                React.createElement("button", { onClick: function () { return setLocation("/invoices"); }, className: "text-blue-500 hover:underline" }, "Back to Invoices"))));
    }
    if (!isLoadingInvoiceData && !formData) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Edit Invoice", icon: React.createElement(lucide_react_1.Edit, { className: "w-5 h-5" }), backLink: { label: "Invoices", href: "/invoices" }, breadcrumbs: [
                { label: "Dashboard", href: "/crm-home" },
                { label: "Invoices", href: "/invoices" },
                { label: "Edit" },
            ] },
            React.createElement("div", { className: "flex flex-col items-center justify-center h-64 gap-4" },
                React.createElement("p", null, "Invoice not found"),
                React.createElement("button", { onClick: function () { return setLocation("/invoices"); }, className: "text-blue-500 hover:underline" }, "Back to Invoices"))));
    }
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Edit Invoice", description: "Modify invoice details", icon: React.createElement(lucide_react_1.Edit, { className: "w-5 h-5" }), backLink: { label: "Invoices", href: "/invoices" }, breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Invoices", href: "/invoices" },
            { label: "Edit" },
        ] },
        React.createElement(DocumentForm_1["default"], { type: "invoice", mode: "edit", initialData: formData, onSave: handleSave, onSend: handleSend, onDelete: handleDelete, isLoading: isLoadingInvoiceData, isSaving: updateInvoiceMutation.isPending || deleteInvoiceMutation.isPending })));
}
exports["default"] = EditInvoice;
