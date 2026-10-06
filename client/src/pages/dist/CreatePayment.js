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
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var RichTextEditor_1 = require("@/components/RichTextEditor");
var card_1 = require("@/components/ui/card");
var separator_1 = require("@/components/ui/separator");
var select_1 = require("@/components/ui/select");
var collapsible_1 = require("@/components/ui/collapsible");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
var const_1 = require("@/const");
var paymentMethods_1 = require("@/const/paymentMethods");
var permissions_1 = require("@/lib/permissions");
var spinner_1 = require("@/components/ui/spinner");
function CreatePayment() {
    // CALL ALL HOOKS UNCONDITIONALLY AT TOP LEVEL
    var _a = permissions_1.useRequireFeature("accounting:payments:create"), allowed = _a.allowed, isLoading = _a.isLoading;
    var _b = wouter_1.useLocation(), navigate = _b[1];
    var utils = trpc_1.trpc.useUtils();
    var _c = react_1.useState({
        paymentNumber: "",
        invoiceId: "",
        clientId: "",
        amount: "",
        paymentDate: new Date().toISOString().split("T")[0],
        paymentMethod: "cash",
        referenceNumber: "",
        notes: "",
        status: "pending"
    }), formData = _c[0], setFormData = _c[1];
    var _d = react_1.useState("existing"), clientMode = _d[0], setClientMode = _d[1];
    var _e = react_1.useState(""), newClientName = _e[0], setNewClientName = _e[1];
    var _f = react_1.useState(""), newClientEmail = _f[0], setNewClientEmail = _f[1];
    var _g = react_1.useState(false), showAdditionalInfo = _g[0], setShowAdditionalInfo = _g[1];
    var _h = react_1.useState(true), isLoadingNumber = _h[0], setIsLoadingNumber = _h[1];
    var getNextNumberMutation = trpc_1.trpc.settings.getNextDocumentNumber.useMutation();
    // Generate payment number on component mount
    react_1.useEffect(function () {
        var isMounted = true;
        var generateNumber = function () {
            setIsLoadingNumber(true);
            getNextNumberMutation.mutate({ documentType: 'payment' }, {
                onSuccess: function (result) {
                    if (isMounted)
                        setFormData(function (prev) { return (__assign(__assign({}, prev), { paymentNumber: result.documentNumber || "PAY-" + String(Math.random() * 1000000 | 0).padStart(6, '0') })); });
                },
                onError: function () {
                    if (isMounted)
                        setFormData(function (prev) { return (__assign(__assign({}, prev), { paymentNumber: "PAY-" + String(Math.random() * 1000000 | 0).padStart(6, '0') })); });
                },
                onSettled: function () {
                    if (isMounted)
                        setIsLoadingNumber(false);
                }
            });
        };
        generateNumber();
        return function () { isMounted = false; };
    }, []);
    var _j = trpc_1.trpc.invoices.list.useQuery({}).data, invoices = _j === void 0 ? [] : _j;
    var _k = trpc_1.trpc.clients.list.useQuery({}).data, clients = _k === void 0 ? [] : _k;
    var createPaymentMutation = trpc_1.trpc.payments.create.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Payment recorded successfully!");
            utils.payments.list.invalidate();
            navigate("/payments");
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to record payment: " + error.message);
        }
    });
    // NOW SAFE TO CHECK CONDITIONAL RETURNS (ALL HOOKS ALREADY CALLED)
    if (isLoading) {
        return (react_1["default"].createElement("div", { className: "flex items-center justify-center h-screen" },
            react_1["default"].createElement(spinner_1.Spinner, { className: "size-8" })));
    }
    if (!allowed) {
        return null;
    }
    var handleSubmit = function (e) {
        e.preventDefault();
        if (!formData.invoiceId || !formData.clientId || !formData.amount) {
            sonner_1.toast.error("Please fill in all required fields");
            return;
        }
        createPaymentMutation.mutate({
            paymentNumber: formData.paymentNumber,
            invoiceId: formData.invoiceId,
            clientId: formData.clientId,
            amount: Math.round(parseFloat(formData.amount) * 100),
            paymentDate: new Date(formData.paymentDate).toISOString().split("T")[0],
            paymentMethod: formData.paymentMethod,
            referenceNumber: formData.referenceNumber || undefined,
            notes: formData.notes || undefined,
            status: formData.status
        });
    };
    var handlePrint = function () {
        var printWindow = window.open('', '_blank');
        if (!printWindow)
            return;
        var selectedClient = clients.find(function (c) { return c.id === formData.clientId; });
        var selectedInvoice = invoices.find(function (i) { return i.id === formData.invoiceId; });
        var html = "\n      <html>\n        <head><title>Receipt</title><style>body { font-family: sans-serif; padding: 40px; } .header { display: flex; justify-content: space-between; margin-bottom: 40px; } .document-title { font-size: 24px; font-weight: bold; }</style></head>\n        <body>\n          <div class=\"header\"><div><div class=\"document-title\">PAYMENT RECEIPT</div></div><div style=\"text-align: right\"><strong>" + const_1.APP_TITLE + "</strong></div></div>\n          <div style=\"margin-bottom: 20px\"><strong>Client:</strong> " + ((selectedClient === null || selectedClient === void 0 ? void 0 : selectedClient.companyName) || 'N/A') + "<br><strong>Invoice:</strong> " + ((selectedInvoice === null || selectedInvoice === void 0 ? void 0 : selectedInvoice.invoiceNumber) || 'N/A') + "</div>\n          <div style=\"font-size: 1.5em; font-weight: bold; margin: 20px 0; padding: 20px; background: #f0f7ff;\">Amount Paid: KES " + parseFloat(formData.amount || '0').toLocaleString() + "</div>\n          <div><strong>Method:</strong> " + (formData.paymentMethod || 'unknown').toUpperCase() + "<br><strong>Reference:</strong> " + (formData.referenceNumber || 'N/A') + "<br><strong>Date:</strong> " + formData.paymentDate + "</div>\n          <script>\n            window.onload = () => { \n              setTimeout(() => {\n                window.print();\n              }, 100);\n            };\n          </script>\n        </body>\n      </html>\n    ";
        printWindow.document.write(html);
        printWindow.document.close();
    };
    return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: "Record Payment", icon: react_1["default"].createElement(lucide_react_1.DollarSign, { className: "w-6 h-6" }), breadcrumbs: [{ label: "Payments", href: "/payments" }, { label: "Record Payment" }] },
        react_1["default"].createElement("div", { className: "max-w-3xl mx-auto space-y-6" },
            react_1["default"].createElement(card_1.Card, { className: "p-6" },
                react_1["default"].createElement("form", { onSubmit: handleSubmit },
                    react_1["default"].createElement("div", { className: "space-y-4 mb-6" },
                        react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                            react_1["default"].createElement(label_1.Label, { className: "text-base font-semibold" }, "Client"),
                            react_1["default"].createElement("div", { className: "flex gap-1 text-sm" },
                                react_1["default"].createElement("button", { type: "button", className: "px-3 py-1 rounded-l-md border text-xs font-medium transition-colors " + (clientMode === "existing" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"), onClick: function () { return setClientMode("existing"); } }, "Existing Client"),
                                react_1["default"].createElement("button", { type: "button", className: "px-3 py-1 rounded-r-md border text-xs font-medium transition-colors " + (clientMode === "new" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"), onClick: function () { return setClientMode("new"); } }, "New Client"))),
                        clientMode === "existing" ? (react_1["default"].createElement("div", { className: "grid gap-3" },
                            react_1["default"].createElement("div", { className: "grid grid-cols-[140px_1fr] items-center gap-3" },
                                react_1["default"].createElement(label_1.Label, { className: "text-right text-sm" }, "Client *"),
                                react_1["default"].createElement(select_1.Select, { value: formData.clientId, onValueChange: function (v) { return setFormData(__assign(__assign({}, formData), { clientId: v })); } },
                                    react_1["default"].createElement(select_1.SelectTrigger, null,
                                        react_1["default"].createElement(select_1.SelectValue, { placeholder: "Search or select client..." })),
                                    react_1["default"].createElement(select_1.SelectContent, null, Array.isArray(clients) && clients.map(function (c) { return (react_1["default"].createElement(select_1.SelectItem, { key: c.id, value: c.id },
                                        react_1["default"].createElement("span", { className: "flex items-center gap-2" },
                                            react_1["default"].createElement(lucide_react_1.Building2, { className: "h-3 w-3 text-muted-foreground" }),
                                            c.companyName || c.name || "Unnamed Client"))); })))))) : (react_1["default"].createElement("div", { className: "grid gap-3 p-4 bg-muted/30 rounded-lg border border-dashed" },
                            react_1["default"].createElement("div", { className: "grid grid-cols-[140px_1fr] items-center gap-3" },
                                react_1["default"].createElement(label_1.Label, { className: "text-right text-sm" }, "Name *"),
                                react_1["default"].createElement(input_1.Input, { value: newClientName, onChange: function (e) { return setNewClientName(e.target.value); }, placeholder: "Client name" })),
                            react_1["default"].createElement("div", { className: "grid grid-cols-[140px_1fr] items-center gap-3" },
                                react_1["default"].createElement(label_1.Label, { className: "text-right text-sm" }, "Email"),
                                react_1["default"].createElement(input_1.Input, { type: "email", value: newClientEmail, onChange: function (e) { return setNewClientEmail(e.target.value); }, placeholder: "Email address" }))))),
                    react_1["default"].createElement(separator_1.Separator, { className: "my-4" }),
                    react_1["default"].createElement("div", { className: "grid gap-4" },
                        react_1["default"].createElement("div", { className: "grid grid-cols-[140px_1fr] items-center gap-3" },
                            react_1["default"].createElement(label_1.Label, { className: "text-right text-sm" }, "Number"),
                            react_1["default"].createElement(input_1.Input, { value: formData.paymentNumber, readOnly: true, className: "bg-muted cursor-not-allowed font-mono max-w-xs", placeholder: isLoadingNumber ? "Generating..." : "" })),
                        react_1["default"].createElement("div", { className: "grid grid-cols-[140px_1fr] items-center gap-3" },
                            react_1["default"].createElement(label_1.Label, { className: "text-right text-sm" }, "Invoice *"),
                            react_1["default"].createElement(select_1.Select, { value: formData.invoiceId, onValueChange: function (v) { return setFormData(__assign(__assign({}, formData), { invoiceId: v })); } },
                                react_1["default"].createElement(select_1.SelectTrigger, { className: "max-w-xs" },
                                    react_1["default"].createElement(select_1.SelectValue, { placeholder: "Select an invoice" })),
                                react_1["default"].createElement(select_1.SelectContent, null, Array.isArray(invoices) && invoices.map(function (i) { return (react_1["default"].createElement(select_1.SelectItem, { key: i.id, value: i.id }, i.invoiceNumber || "Invoice")); })))),
                        react_1["default"].createElement("div", { className: "grid grid-cols-[140px_1fr] items-center gap-3" },
                            react_1["default"].createElement(label_1.Label, { className: "text-right text-sm" }, "Amount (KES) *"),
                            react_1["default"].createElement(input_1.Input, { type: "number", value: formData.amount, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { amount: e.target.value })); }, step: "0.01", className: "max-w-xs" })),
                        react_1["default"].createElement("div", { className: "grid grid-cols-[140px_1fr] items-center gap-3" },
                            react_1["default"].createElement(label_1.Label, { className: "text-right text-sm" }, "Date *"),
                            react_1["default"].createElement(input_1.Input, { type: "date", value: formData.paymentDate, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { paymentDate: e.target.value })); }, className: "max-w-xs" })),
                        react_1["default"].createElement("div", { className: "grid grid-cols-[140px_1fr] items-center gap-3" },
                            react_1["default"].createElement(label_1.Label, { className: "text-right text-sm" }, "Method *"),
                            react_1["default"].createElement(select_1.Select, { value: formData.paymentMethod, onValueChange: function (v) { return setFormData(__assign(__assign({}, formData), { paymentMethod: v })); } },
                                react_1["default"].createElement(select_1.SelectTrigger, { className: "max-w-xs" },
                                    react_1["default"].createElement(select_1.SelectValue, null)),
                                react_1["default"].createElement(select_1.SelectContent, null, paymentMethods_1.getPaymentMethodOptions().map(function (method) { return (react_1["default"].createElement(select_1.SelectItem, { key: method.value, value: method.value }, method.label)); })))),
                        react_1["default"].createElement("div", { className: "grid grid-cols-[140px_1fr] items-center gap-3" },
                            react_1["default"].createElement(label_1.Label, { className: "text-right text-sm" }, "Reference #"),
                            react_1["default"].createElement(input_1.Input, { value: formData.referenceNumber, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { referenceNumber: e.target.value })); }, className: "max-w-xs" }))),
                    react_1["default"].createElement(separator_1.Separator, { className: "my-4" }),
                    react_1["default"].createElement(collapsible_1.Collapsible, { open: showAdditionalInfo, onOpenChange: setShowAdditionalInfo },
                        react_1["default"].createElement(collapsible_1.CollapsibleTrigger, { asChild: true },
                            react_1["default"].createElement("button", { type: "button", className: "flex items-center justify-between w-full py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" },
                                react_1["default"].createElement("span", null, "Additional Information"),
                                showAdditionalInfo ? react_1["default"].createElement(lucide_react_1.ChevronUp, { className: "h-4 w-4" }) : react_1["default"].createElement(lucide_react_1.ChevronDown, { className: "h-4 w-4" }))),
                        react_1["default"].createElement(collapsible_1.CollapsibleContent, { className: "space-y-4 pt-3" },
                            react_1["default"].createElement("div", { className: "grid grid-cols-[140px_1fr] items-start gap-3" },
                                react_1["default"].createElement(label_1.Label, { className: "text-right text-sm pt-2" }, "Notes"),
                                react_1["default"].createElement(RichTextEditor_1.RichTextEditor, { value: formData.notes, onChange: function (html) { return setFormData(__assign(__assign({}, formData), { notes: html })); }, minHeight: "100px", placeholder: "Additional notes..." })))),
                    react_1["default"].createElement(separator_1.Separator, { className: "my-4" }),
                    react_1["default"].createElement("div", { className: "flex gap-2 justify-end" },
                        react_1["default"].createElement(button_1.Button, { type: "button", variant: "outline", onClick: handlePrint },
                            react_1["default"].createElement(lucide_react_1.Printer, { className: "mr-2 h-4 w-4" }),
                            "Print Receipt"),
                        react_1["default"].createElement(button_1.Button, { type: "submit", disabled: createPaymentMutation.isPending },
                            createPaymentMutation.isPending && react_1["default"].createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
                            "Record Payment")))))));
}
exports["default"] = CreatePayment;
