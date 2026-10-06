"use strict";
exports.__esModule = true;
var ModuleLayout_1 = require("@/components/ModuleLayout");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var DocumentForm_1 = require("@/components/forms/DocumentForm");
var wouter_1 = require("wouter");
var permissions_1 = require("@/lib/permissions");
var spinner_1 = require("@/components/ui/spinner");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
function CreateReceipt() {
    // CALL ALL HOOKS UNCONDITIONALLY AT TOP LEVEL
    var _a = permissions_1.useRequireFeature("accounting:receipts:create"), allowed = _a.allowed, isLoading = _a.isLoading;
    var _b = wouter_1.useLocation(), setLocation = _b[1];
    var utils = trpc_1.trpc.useUtils();
    var _c = react_1.useState(""), receiptNumber = _c[0], setReceiptNumber = _c[1];
    var _d = react_1.useState(true), isLoadingNumber = _d[0], setIsLoadingNumber = _d[1];
    var getNextNumberMutation = trpc_1.trpc.settings.getNextDocumentNumber.useMutation();
    // Generate receipt number on component mount
    react_1.useEffect(function () {
        var isMounted = true;
        var generateNumber = function () {
            setIsLoadingNumber(true);
            getNextNumberMutation.mutate({ documentType: 'receipt' }, {
                onSuccess: function (result) {
                    if (isMounted)
                        setReceiptNumber(result.documentNumber || "REC-" + String(Math.random() * 1000000 | 0).padStart(6, '0'));
                },
                onError: function () {
                    if (isMounted) {
                        console.error('Failed to generate receipt number');
                        setReceiptNumber("REC-" + String(Math.random() * 1000000 | 0).padStart(6, '0'));
                    }
                },
                onSettled: function () {
                    if (isMounted)
                        setIsLoadingNumber(false);
                }
            });
        };
        generateNumber();
        return function () {
            isMounted = false;
        };
    }, []);
    var createReceiptMutation = trpc_1.trpc.receipts.create.useMutation({
        onSuccess: function (data) {
            sonner_1.toast.success("Receipt created successfully!");
            utils.receipts.list.invalidate();
            setLocation("/receipts");
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to create receipt: " + error.message);
        }
    });
    var handleSave = react_1.useCallback(function (data) {
        var _a, _b, _c, _d;
        if (!data.documentNumber) {
            sonner_1.toast.error("Receipt number is required");
            return;
        }
        var amount = data.grandTotal || 0;
        var subtotal = (_a = data.subtotal) !== null && _a !== void 0 ? _a : amount;
        var vat = (_b = data.vat) !== null && _b !== void 0 ? _b : 0;
        var lineDiscountAmount = data.lineDiscountTotal || 0;
        var rawLineSubtotal = ((_c = data.lineItems) === null || _c === void 0 ? void 0 : _c.reduce(function (sum, item) { return sum + ((item.qty || 0) * (item.unitPrice || 0)); }, 0)) || 0;
        var docDiscountAmount = ((rawLineSubtotal - lineDiscountAmount) * ((data.documentDiscount || 0) / 100)) || 0;
        var discountAmount = lineDiscountAmount + docDiscountAmount;
        var receiptData = {
            receiptNumber: data.documentNumber,
            clientId: data.clientId || "guest_" + Date.now(),
            paymentId: undefined,
            amount: Math.round(amount * 100),
            subtotal: Math.round(subtotal * 100),
            taxAmount: Math.round(vat * 100),
            discountAmount: Math.round(discountAmount * 100),
            paymentMethod: (data.paymentMethod || "cash"),
            receiptDate: new Date(data.date),
            notes: data.notes || "",
            lineItems: (_d = data.lineItems) === null || _d === void 0 ? void 0 : _d.map(function (item) { return ({
                description: item.description,
                quantity: item.qty,
                unitPrice: Math.round(item.unitPrice * 100),
                taxRate: item.tax || 0,
                total: Math.round(item.total * 100)
            }); })
        };
        createReceiptMutation.mutate(receiptData);
    }, [createReceiptMutation]);
    var handleSend = react_1.useCallback(function (data) {
        var _a, _b, _c, _d;
        if (!data.documentNumber) {
            sonner_1.toast.error("Receipt number is required");
            return;
        }
        if (!data.clientEmail) {
            sonner_1.toast.error("Client email is required to send receipt");
            return;
        }
        var amount = data.grandTotal || 0;
        var subtotal = (_a = data.subtotal) !== null && _a !== void 0 ? _a : amount;
        var vat = (_b = data.vat) !== null && _b !== void 0 ? _b : 0;
        var lineDiscountAmount = data.lineDiscountTotal || 0;
        var rawLineSubtotal = ((_c = data.lineItems) === null || _c === void 0 ? void 0 : _c.reduce(function (sum, item) { return sum + ((item.qty || 0) * (item.unitPrice || 0)); }, 0)) || 0;
        var docDiscountAmount = ((rawLineSubtotal - lineDiscountAmount) * ((data.documentDiscount || 0) / 100)) || 0;
        var discountAmount = lineDiscountAmount + docDiscountAmount;
        var receiptData = {
            receiptNumber: data.documentNumber,
            clientId: data.clientId || "guest_" + Date.now(),
            paymentId: undefined,
            amount: Math.round(amount * 100),
            subtotal: Math.round(subtotal * 100),
            taxAmount: Math.round(vat * 100),
            discountAmount: Math.round(discountAmount * 100),
            paymentMethod: (data.paymentMethod || "cash"),
            receiptDate: new Date(data.date),
            notes: data.notes || "",
            lineItems: (_d = data.lineItems) === null || _d === void 0 ? void 0 : _d.map(function (item) { return ({
                description: item.description,
                quantity: item.qty,
                unitPrice: Math.round(item.unitPrice * 100),
                taxRate: item.tax || 0,
                total: Math.round(item.total * 100)
            }); })
        };
        createReceiptMutation.mutate(receiptData);
        sonner_1.toast.info("Receipt will be sent to " + data.clientEmail);
    }, [createReceiptMutation]);
    // NOW SAFE TO CHECK CONDITIONAL RETURNS (ALL HOOKS ALREADY CALLED)
    if (isLoading) {
        return (react_1["default"].createElement("div", { className: "flex items-center justify-center h-screen" },
            react_1["default"].createElement(spinner_1.Spinner, { className: "size-8" })));
    }
    if (!allowed) {
        return null;
    }
    return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: "Create Receipt", description: "Create a new receipt", icon: react_1["default"].createElement(lucide_react_1.Plus, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Receipts", href: "/receipts" },
            { label: "Create" },
        ], backLink: { label: "Receipts", href: "/receipts" } },
        react_1["default"].createElement(DocumentForm_1["default"], { type: "receipt", mode: "create", initialData: { documentNumber: receiptNumber }, onSave: handleSave, onSend: handleSend, isLoading: isLoadingNumber, isSaving: createReceiptMutation.isPending })));
}
exports["default"] = CreateReceipt;
