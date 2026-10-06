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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var card_1 = require("@/components/ui/card");
var select_1 = require("@/components/ui/select");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
var const_1 = require("@/const");
var paymentMethods_1 = require("@/const/paymentMethods");
var permissions_1 = require("@/lib/permissions");
var spinner_1 = require("@/components/ui/spinner");
var useCompanyInfo_1 = require("@/hooks/useCompanyInfo");
function EditPayment() {
    var _this = this;
    var _a = permissions_1.useRequireFeature("accounting:payments:edit"), allowed = _a.allowed, isLoading = _a.isLoading;
    var companyInfo = useCompanyInfo_1.useCompanyInfo();
    var params = wouter_1.useParams();
    var paymentId = params.id;
    var _b = wouter_1.useLocation(), navigate = _b[1];
    var utils = trpc_1.trpc.useUtils();
    var _c = react_1.useState(false), isGeneratingPDF = _c[0], setIsGeneratingPDF = _c[1];
    var _d = react_1.useState({
        invoiceId: "",
        clientId: "",
        amount: "",
        paymentDate: new Date().toISOString().split("T")[0],
        paymentMethod: "cash",
        referenceNumber: "",
        notes: "",
        status: "pending"
    }), formData = _d[0], setFormData = _d[1];
    var _e = react_1.useState(true), isLoadingPaymentData = _e[0], setIsLoadingPaymentData = _e[1];
    // Fetch payment data
    var payment = trpc_1.trpc.payments.getById.useQuery(paymentId || "", {
        enabled: !!paymentId
    }).data;
    // Fetch related data
    var _f = trpc_1.trpc.invoices.list.useQuery({}).data, invoices = _f === void 0 ? [] : _f;
    var _g = trpc_1.trpc.clients.list.useQuery({}).data, clients = _g === void 0 ? [] : _g;
    // Update form when payment data loads
    react_1.useEffect(function () {
        if (payment) {
            setFormData({
                invoiceId: payment.invoiceId || "",
                clientId: payment.clientId || "",
                amount: (payment.amount / 100).toString(),
                paymentDate: payment.paymentDate
                    ? new Date(payment.paymentDate).toISOString().split("T")[0]
                    : new Date().toISOString().split("T")[0],
                paymentMethod: payment.paymentMethod || "cash",
                referenceNumber: payment.referenceNumber || "",
                notes: payment.notes || "",
                status: payment.status || "pending"
            });
            setIsLoadingPaymentData(false);
        }
    }, [payment]);
    var updatePaymentMutation = trpc_1.trpc.payments.update.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Payment updated successfully!");
            utils.payments.list.invalidate();
            utils.payments.getById.invalidate(paymentId || "");
            navigate("/payments");
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to update payment: " + error.message);
        }
    });
    var deletePaymentMutation = trpc_1.trpc.payments["delete"].useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Payment deleted successfully!");
            utils.payments.list.invalidate();
            navigate("/payments");
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to delete payment: " + error.message);
        }
    });
    var handleSubmit = function (e) {
        e.preventDefault();
        if (!formData.amount) {
            sonner_1.toast.error("Please fill in all required fields");
            return;
        }
        updatePaymentMutation.mutate({
            id: paymentId || "",
            amount: Math.round(parseFloat(formData.amount) * 100),
            paymentDate: new Date(formData.paymentDate).toISOString().split("T")[0],
            paymentMethod: formData.paymentMethod,
            referenceNumber: formData.referenceNumber || undefined,
            notes: formData.notes || undefined,
            status: formData.status
        });
    };
    var handleDelete = function () {
        if (confirm("Are you sure you want to delete this payment? This action cannot be undone.")) {
            deletePaymentMutation.mutate(paymentId || "");
        }
    };
    var handleDownloadPDF = react_1.useCallback(function () { return __awaiter(_this, void 0, void 0, function () {
        var printWindow, selectedClient, selectedInvoice, htmlContent;
        return __generator(this, function (_a) {
            setIsGeneratingPDF(true);
            try {
                printWindow = window.open('', '_blank');
                if (!printWindow) {
                    sonner_1.toast.error("Please allow popups to download PDF");
                    setIsGeneratingPDF(false);
                    return [2 /*return*/];
                }
                selectedClient = clients.find(function (c) { return c.id === formData.clientId; });
                selectedInvoice = invoices.find(function (i) { return i.id === formData.invoiceId; });
                htmlContent = "\n        <!DOCTYPE html>\n        <html>\n        <head>\n          <title>Payment Receipt - " + (formData.referenceNumber || paymentId) + "</title>\n          <style>\n            body { font-family: Arial, sans-serif; margin: 40px; color: #333; }\n            .header { display: flex; justify-content: space-between; margin-bottom: 30px; }\n            .company-info { text-align: right; font-size: 12px; }\n            .document-title { font-size: 28px; font-weight: bold; color: #2563eb; margin-bottom: 10px; }\n            .info-section { background: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 20px; }\n            .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }\n            .info-row:last-child { border-bottom: none; }\n            .label { font-weight: bold; color: #6b7280; }\n            .value { }\n            .amount { font-size: 24px; font-weight: bold; color: #2563eb; text-align: center; padding: 20px; background: #eff6ff; border-radius: 8px; margin: 20px 0; }\n            .notes { margin-top: 20px; padding: 15px; background: #f9fafb; border-radius: 8px; }\n            @media print { body { margin: 20px; } }\n          </style>\n        </head>\n        <body>\n          <div class=\"header\">\n            <div>\n              <div class=\"document-title\">PAYMENT RECEIPT</div>\n              <div><strong>" + (formData.referenceNumber || paymentId) + "</strong></div>\n            </div>\n            <div class=\"company-info\">\n              <strong>" + const_1.APP_TITLE + "</strong><br>\n              " + (companyInfo.address ? companyInfo.address + '<br>' : '') + "\n              " + (companyInfo.email ? companyInfo.email + '<br>' : '') + "\n              " + (companyInfo.phone || '') + "\n            </div>\n          </div>\n          \n          <div class=\"info-section\">\n            <div class=\"info-row\">\n              <span class=\"label\">Client:</span>\n              <span class=\"value\">" + ((selectedClient === null || selectedClient === void 0 ? void 0 : selectedClient.companyName) || 'N/A') + "</span>\n            </div>\n            <div class=\"info-row\">\n              <span class=\"label\">Invoice:</span>\n              <span class=\"value\">" + ((selectedInvoice === null || selectedInvoice === void 0 ? void 0 : selectedInvoice.invoiceNumber) || 'N/A') + "</span>\n            </div>\n            <div class=\"info-row\">\n              <span class=\"label\">Payment Date:</span>\n              <span class=\"value\">" + formData.paymentDate + "</span>\n            </div>\n            <div class=\"info-row\">\n              <span class=\"label\">Payment Method:</span>\n              <span class=\"value\">" + formData.paymentMethod.replace('_', ' ').toUpperCase() + "</span>\n            </div>\n            " + (formData.referenceNumber ? "\n            <div class=\"info-row\">\n              <span class=\"label\">Reference Number:</span>\n              <span class=\"value\">" + formData.referenceNumber + "</span>\n            </div>\n            " : '') + "\n          </div>\n          \n          <div class=\"amount\">\n            Amount Paid: KES " + parseFloat(formData.amount || '0').toLocaleString() + "\n          </div>\n          \n          " + (formData.notes ? "\n            <div class=\"notes\">\n              <strong>Notes:</strong><br>\n              " + formData.notes + "\n            </div>\n          " : '') + "\n          \n          <script>\n            window.onload = function() {\n              window.print();\n            }\n          </script>\n        </body>\n        </html>\n      ";
                printWindow.document.write(htmlContent);
                printWindow.document.close();
                sonner_1.toast.success("PDF download initiated");
            }
            catch (error) {
                console.error("PDF generation error:", error);
                sonner_1.toast.error("Failed to generate PDF");
            }
            finally {
                setIsGeneratingPDF(false);
            }
            return [2 /*return*/];
        });
    }); }, [formData, clients, invoices, paymentId]);
    if (isLoading)
        return React.createElement("div", { className: "flex items-center justify-center h-screen" },
            React.createElement(spinner_1.Spinner, { className: "size-8" }));
    if (!allowed)
        return null;
    if (isLoadingPaymentData) {
        return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Edit Payment", description: "Update payment details", icon: React.createElement(lucide_react_1.DollarSign, { className: "w-6 h-6" }), breadcrumbs: [
                { label: "Dashboard", href: "/crm-home" },
                { label: "Accounting", href: "/accounting" },
                { label: "Payments", href: "/payments" },
                { label: "Edit Payment" },
            ] },
            React.createElement("div", { className: "flex items-center justify-center p-8" },
                React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin" }))));
    }
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Edit Payment", description: "Update payment details", icon: React.createElement(lucide_react_1.DollarSign, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Accounting", href: "/accounting" },
            { label: "Payments", href: "/payments" },
            { label: "Edit Payment" },
        ] },
        React.createElement("div", { className: "max-w-2xl" },
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Edit Payment"),
                    React.createElement(card_1.CardDescription, null, "Update the payment details below")),
                React.createElement(card_1.CardContent, null,
                    React.createElement("form", { onSubmit: handleSubmit, className: "space-y-6" },
                        React.createElement("div", { className: "grid gap-4 md:grid-cols-2" },
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "clientId" }, "Client *"),
                                React.createElement(select_1.Select, { value: formData.clientId, onValueChange: function (value) {
                                        return setFormData(__assign(__assign({}, formData), { clientId: value }));
                                    }, disabled: true },
                                    React.createElement(select_1.SelectTrigger, null,
                                        React.createElement(select_1.SelectValue, { placeholder: "Select a client" })),
                                    React.createElement(select_1.SelectContent, null, Array.isArray(clients) && clients.map(function (client) { return (React.createElement(select_1.SelectItem, { key: client.id, value: client.id }, client.companyName || client.contactPerson)); })))),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "invoiceId" }, "Invoice *"),
                                React.createElement(select_1.Select, { value: formData.invoiceId, onValueChange: function (value) {
                                        return setFormData(__assign(__assign({}, formData), { invoiceId: value }));
                                    }, disabled: true },
                                    React.createElement(select_1.SelectTrigger, null,
                                        React.createElement(select_1.SelectValue, { placeholder: "Select an invoice" })),
                                    React.createElement(select_1.SelectContent, null, Array.isArray(invoices) && invoices.map(function (invoice) { return (React.createElement(select_1.SelectItem, { key: invoice.id, value: invoice.id }, invoice.invoiceNumber)); }))))),
                        React.createElement("div", { className: "grid gap-4 md:grid-cols-2" },
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "amount" }, "Amount (Ksh) *"),
                                React.createElement(input_1.Input, { id: "amount", type: "number", placeholder: "0.00", value: formData.amount, onChange: function (e) {
                                        return setFormData(__assign(__assign({}, formData), { amount: e.target.value }));
                                    }, step: "0.01", min: "0" })),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "paymentDate" }, "Payment Date *"),
                                React.createElement(input_1.Input, { id: "paymentDate", type: "date", value: formData.paymentDate, onChange: function (e) {
                                        return setFormData(__assign(__assign({}, formData), { paymentDate: e.target.value }));
                                    } }))),
                        React.createElement("div", { className: "grid gap-4 md:grid-cols-2" },
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "paymentMethod" }, "Payment Method *"),
                                React.createElement(select_1.Select, { value: formData.paymentMethod, onValueChange: function (value) {
                                        return setFormData(__assign(__assign({}, formData), { paymentMethod: value }));
                                    } },
                                    React.createElement(select_1.SelectTrigger, null,
                                        React.createElement(select_1.SelectValue, { placeholder: "Select payment method" })),
                                    React.createElement(select_1.SelectContent, null, paymentMethods_1.getPaymentMethodOptions().map(function (method) { return (React.createElement(select_1.SelectItem, { key: method.value, value: method.value }, method.label)); })))),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "referenceNumber" }, "Reference Number"),
                                React.createElement(input_1.Input, { id: "referenceNumber", placeholder: "e.g., TXN123456", value: formData.referenceNumber, onChange: function (e) {
                                        return setFormData(__assign(__assign({}, formData), { referenceNumber: e.target.value }));
                                    } }))),
                        React.createElement("div", { className: "space-y-2" },
                            React.createElement(label_1.Label, { htmlFor: "notes" }, "Notes"),
                            React.createElement(textarea_1.Textarea, { id: "notes", placeholder: "Add any additional notes about this payment", value: formData.notes, onChange: function (e) {
                                    return setFormData(__assign(__assign({}, formData), { notes: e.target.value }));
                                }, rows: 4 })),
                        React.createElement("div", { className: "flex gap-2 justify-between" },
                            React.createElement("div", { className: "flex gap-2" },
                                React.createElement(button_1.Button, { type: "button", variant: "destructive", onClick: handleDelete, disabled: deletePaymentMutation.isPending },
                                    deletePaymentMutation.isPending ? (React.createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" })) : (React.createElement(lucide_react_1.Trash2, { className: "mr-2 h-4 w-4" })),
                                    "Delete")),
                            React.createElement("div", { className: "flex gap-2" },
                                React.createElement(button_1.Button, { type: "button", variant: "outline", onClick: function () { return navigate("/payments"); } },
                                    React.createElement(lucide_react_1.ArrowLeft, { className: "mr-2 h-4 w-4" }),
                                    "Cancel"),
                                React.createElement(button_1.Button, { type: "button", variant: "outline", onClick: handleDownloadPDF, disabled: isGeneratingPDF },
                                    isGeneratingPDF ? (React.createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" })) : (React.createElement(lucide_react_1.Download, { className: "mr-2 h-4 w-4" })),
                                    "Download PDF"),
                                React.createElement(button_1.Button, { type: "submit", disabled: updatePaymentMutation.isPending },
                                    updatePaymentMutation.isPending && (React.createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" })),
                                    "Update Payment")))))))));
}
exports["default"] = EditPayment;
