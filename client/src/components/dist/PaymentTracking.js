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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var react_1 = require("react");
var trpc_1 = require("@/lib/trpc");
var currency_1 = require("@/lib/currency");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var input_1 = require("@/components/ui/input");
var badge_1 = require("@/components/ui/badge");
var select_1 = require("@/components/ui/select");
var dialog_1 = require("@/components/ui/dialog");
var alert_dialog_1 = require("@/components/ui/alert-dialog");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var mutationHelpers_1 = require("@/lib/mutationHelpers");
var date_fns_1 = require("date-fns");
var paymentMethods_1 = require("@/const/paymentMethods");
var textarea_1 = require("@/components/ui/textarea");
function PaymentTracking(_a) {
    var _this = this;
    var invoiceId = _a.invoiceId, invoiceTotal = _a.invoiceTotal, invoiceStatus = _a.invoiceStatus, _b = _a.readonly, readonly = _b === void 0 ? false : _b;
    var currencyCode = currency_1.useCurrencySettings().code;
    var _c = react_1.useState(false), isDialogOpen = _c[0], setIsDialogOpen = _c[1];
    var _d = react_1.useState(false), isEditDialogOpen = _d[0], setIsEditDialogOpen = _d[1];
    var _e = react_1.useState(false), isDeleteOpen = _e[0], setIsDeleteOpen = _e[1];
    var _f = react_1.useState(null), selectedPayment = _f[0], setSelectedPayment = _f[1];
    var _g = react_1.useState(new Set()), bulkSelectedPayments = _g[0], setBulkSelectedPayments = _g[1];
    var _h = react_1.useState({
        paymentAmount: "",
        paymentDate: date_fns_1.format(new Date(), "yyyy-MM-dd"),
        paymentMethod: "bank_transfer",
        reference: "",
        notes: "",
        receiptId: "",
        accountId: ""
    }), formData = _h[0], setFormData = _h[1];
    var _j = trpc_1.trpc.invoices.payments.list.useQuery({ invoiceId: invoiceId }), _k = _j.data, payments = _k === void 0 ? [] : _k, isLoadingPayments = _j.isLoading, refetchPayments = _j.refetch;
    var paymentSummary = trpc_1.trpc.invoices.payments.getSummary.useQuery({
        invoiceId: invoiceId
    }).data;
    var _l = trpc_1.trpc.chartOfAccounts.list.useQuery({
        limit: 1000
    }).data, chartOfAccounts = _l === void 0 ? [] : _l;
    var createPaymentMutation = trpc_1.trpc.invoices.payments.create.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Payment recorded successfully");
            setIsDialogOpen(false);
            resetForm();
            refetchPayments();
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to record payment: " + error.message);
        }
    });
    var updatePaymentMutation = trpc_1.trpc.invoices.payments.update.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Payment updated successfully");
            setIsEditDialogOpen(false);
            setSelectedPayment(null);
            refetchPayments();
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to update payment: " + error.message);
        }
    });
    var deletePaymentMutation = trpc_1.trpc.invoices.payments["delete"].useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Payment deleted successfully");
            setIsDeleteOpen(false);
            setSelectedPayment(null);
            refetchPayments();
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to delete payment: " + error.message);
        }
    });
    var resetForm = function () {
        setFormData({
            paymentAmount: "",
            paymentDate: date_fns_1.format(new Date(), "yyyy-MM-dd"),
            paymentMethod: "bank_transfer",
            reference: "",
            notes: "",
            receiptId: "",
            accountId: ""
        });
    };
    var togglePaymentSelection = function (paymentId) {
        var newSelected = new Set(bulkSelectedPayments);
        if (newSelected.has(paymentId)) {
            newSelected["delete"](paymentId);
        }
        else {
            newSelected.add(paymentId);
        }
        setBulkSelectedPayments(newSelected);
    };
    var toggleSelectAll = function () {
        if (bulkSelectedPayments.size === payments.length) {
            setBulkSelectedPayments(new Set());
        }
        else {
            setBulkSelectedPayments(new Set(payments.map(function (p) { return p.id; })));
        }
    };
    var handleBulkDelete = function () { return __awaiter(_this, void 0, void 0, function () {
        var confirmDelete, successCount, failureCount, _i, bulkSelectedPayments_1, paymentId, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (bulkSelectedPayments.size === 0) {
                        sonner_1.toast.error("Please select payments to delete");
                        return [2 /*return*/];
                    }
                    confirmDelete = window.confirm("Are you sure you want to delete " + bulkSelectedPayments.size + " payment(s)?");
                    if (!confirmDelete)
                        return [2 /*return*/];
                    successCount = 0;
                    failureCount = 0;
                    _i = 0, bulkSelectedPayments_1 = bulkSelectedPayments;
                    _a.label = 1;
                case 1:
                    if (!(_i < bulkSelectedPayments_1.length)) return [3 /*break*/, 6];
                    paymentId = bulkSelectedPayments_1[_i];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 5]);
                    return [4 /*yield*/, mutationHelpers_1["default"](deletePaymentMutation, { id: paymentId })];
                case 3:
                    _a.sent();
                    successCount++;
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    failureCount++;
                    return [3 /*break*/, 5];
                case 5:
                    _i++;
                    return [3 /*break*/, 1];
                case 6:
                    sonner_1.toast.success("Deleted " + successCount + " payment(s)" + (failureCount > 0 ? " (" + failureCount + " failed)" : ""));
                    setBulkSelectedPayments(new Set());
                    refetchPayments();
                    return [2 /*return*/];
            }
        });
    }); };
    var handleBulkExport = function () {
        if (bulkSelectedPayments.size === 0) {
            sonner_1.toast.error("Please select payments to export");
            return;
        }
        var selectedPaymentsList = payments.filter(function (p) { return bulkSelectedPayments.has(p.id); });
        var headers = ["Date", "Amount (KES)", "Method", "Reference", "Notes"];
        var rows = selectedPaymentsList.map(function (p) { return [
            new Date(p.paymentDate).toLocaleDateString(),
            (p.paymentAmount / 100).toFixed(2),
            p.paymentMethod,
            p.reference || "",
            p.notes || "",
        ]; });
        var csv = __spreadArrays([
            headers.join(",")
        ], rows.map(function (row) { return row.map(function (cell) { return "\"" + cell + "\""; }).join(","); })).join("\n");
        var blob = new Blob([csv], { type: "text/csv" });
        var url = window.URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = "payments-export-" + new Date().toISOString().split('T')[0] + ".csv";
        a.click();
        window.URL.revokeObjectURL(url);
        sonner_1.toast.success("Exported " + bulkSelectedPayments.size + " payment(s)");
    };
    var formatCurrency = function (amount) {
        return new Intl.NumberFormat("en-KE", {
            style: "currency",
            currency: currencyCode
        }).format(amount / 100);
    };
    var handleAddPayment = function () { return __awaiter(_this, void 0, void 0, function () {
        var paymentAmountCents, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!formData.paymentAmount) {
                        sonner_1.toast.error("Please enter a payment amount");
                        return [2 /*return*/];
                    }
                    paymentAmountCents = Math.round(parseFloat(formData.paymentAmount) * 100);
                    if (paymentAmountCents > invoiceTotal - ((paymentSummary === null || paymentSummary === void 0 ? void 0 : paymentSummary.totalPaid) || 0)) {
                        sonner_1.toast.error("Payment amount exceeds remaining balance");
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, mutationHelpers_1["default"](createPaymentMutation, {
                            invoiceId: invoiceId,
                            paymentAmount: paymentAmountCents,
                            paymentDate: new Date(formData.paymentDate).toISOString(),
                            paymentMethod: formData.paymentMethod,
                            reference: formData.reference || undefined,
                            notes: formData.notes || undefined,
                            receiptId: formData.receiptId || undefined,
                            accountId: formData.accountId || undefined
                        })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    console.error("Error recording payment:", error_2);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleUpdatePayment = function () { return __awaiter(_this, void 0, void 0, function () {
        var paymentAmountCents, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!selectedPayment)
                        return [2 /*return*/];
                    if (!formData.paymentAmount) {
                        sonner_1.toast.error("Please enter a payment amount");
                        return [2 /*return*/];
                    }
                    paymentAmountCents = Math.round(parseFloat(formData.paymentAmount) * 100);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, mutationHelpers_1["default"](updatePaymentMutation, {
                            id: selectedPayment.id,
                            paymentAmount: paymentAmountCents,
                            paymentDate: new Date(formData.paymentDate).toISOString(),
                            paymentMethod: formData.paymentMethod,
                            reference: formData.reference || undefined,
                            notes: formData.notes || undefined,
                            accountId: formData.accountId || undefined
                        })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_3 = _a.sent();
                    console.error("Error updating payment:", error_3);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleDeletePayment = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!selectedPayment)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, mutationHelpers_1["default"](deletePaymentMutation, {
                            id: selectedPayment.id
                        })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_4 = _a.sent();
                    console.error("Error deleting payment:", error_4);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var openEditDialog = function (payment) {
        setSelectedPayment(payment);
        setFormData({
            paymentAmount: (payment.paymentAmount / 100).toString(),
            paymentDate: payment.paymentDate
                ? new Date(payment.paymentDate).toISOString().split("T")[0]
                : date_fns_1.format(new Date(), "yyyy-MM-dd"),
            paymentMethod: payment.paymentMethod || "bank_transfer",
            reference: payment.reference || "",
            notes: payment.notes || "",
            receiptId: payment.receiptId || "",
            accountId: payment.accountId || ""
        });
        setIsEditDialogOpen(true);
    };
    var getPaymentStatusColor = function (status) {
        switch (status) {
            case "paid":
                return "bg-green-500";
            case "partial":
                return "bg-blue-500";
            case "pending":
                return "bg-yellow-500";
            default:
                return "bg-gray-500";
        }
    };
    return (React.createElement(card_1.Card, null,
        React.createElement(card_1.CardHeader, null,
            React.createElement("div", { className: "flex items-center justify-between" },
                React.createElement("div", { className: "flex items-center gap-2" },
                    React.createElement(lucide_react_1.CreditCard, { className: "h-5 w-5" }),
                    React.createElement("div", null,
                        React.createElement(card_1.CardTitle, null, "Payment Status"),
                        React.createElement(card_1.CardDescription, null, "Track and manage payments received for this invoice"))),
                !readonly && (React.createElement(dialog_1.Dialog, { open: isDialogOpen, onOpenChange: setIsDialogOpen },
                    React.createElement(dialog_1.DialogTrigger, { asChild: true },
                        React.createElement(button_1.Button, { size: "sm" },
                            React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-2" }),
                            "Record Payment")),
                    React.createElement(dialog_1.DialogContent, { className: "sm:max-w-[500px]" },
                        React.createElement(dialog_1.DialogHeader, null,
                            React.createElement(dialog_1.DialogTitle, null, "Record Payment"),
                            React.createElement(dialog_1.DialogDescription, null,
                                "Record a payment received for this invoice. Remaining balance:",
                                " ",
                                React.createElement("span", { className: "font-semibold text-foreground" }, formatCurrency(((paymentSummary === null || paymentSummary === void 0 ? void 0 : paymentSummary.remainingBalance) || invoiceTotal) -
                                    Math.round(parseFloat(formData.paymentAmount || "0") * 100))))),
                        React.createElement("div", { className: "space-y-4" },
                            React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
                                React.createElement("div", null,
                                    React.createElement("label", { className: "text-sm font-medium mb-2 block" }, "Invoice Total"),
                                    React.createElement(input_1.Input, { disabled: true, value: formatCurrency(invoiceTotal) })),
                                React.createElement("div", null,
                                    React.createElement("label", { className: "text-sm font-medium mb-2 block" }, "Total Paid"),
                                    React.createElement(input_1.Input, { disabled: true, value: formatCurrency((paymentSummary === null || paymentSummary === void 0 ? void 0 : paymentSummary.totalPaid) || 0) }))),
                            React.createElement("div", null,
                                React.createElement("label", { className: "text-sm font-medium mb-2 block" }, "Payment Amount *"),
                                React.createElement(input_1.Input, { type: "number", placeholder: "0.00", step: "0.01", value: formData.paymentAmount, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { paymentAmount: e.target.value })); } })),
                            React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
                                React.createElement("div", null,
                                    React.createElement("label", { className: "text-sm font-medium mb-2 block" }, "Payment Date"),
                                    React.createElement(input_1.Input, { type: "date", value: formData.paymentDate, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { paymentDate: e.target.value })); } })),
                                React.createElement("div", null,
                                    React.createElement("label", { className: "text-sm font-medium mb-2 block" }, "Payment Method"),
                                    React.createElement(select_1.Select, { value: formData.paymentMethod, onValueChange: function (value) {
                                            return setFormData(__assign(__assign({}, formData), { paymentMethod: value }));
                                        } },
                                        React.createElement(select_1.SelectTrigger, null,
                                            React.createElement(select_1.SelectValue, null)),
                                        React.createElement(select_1.SelectContent, null, paymentMethods_1.getPaymentMethodOptions().map(function (method) { return (React.createElement(select_1.SelectItem, { key: method.value, value: method.value }, method.label)); }))))),
                            React.createElement("div", null,
                                React.createElement("label", { className: "text-sm font-medium mb-2 block" }, "Reference (Optional)"),
                                React.createElement(input_1.Input, { placeholder: "e.g., Check #, Transfer reference", value: formData.reference, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { reference: e.target.value })); } })),
                            React.createElement("div", null,
                                React.createElement("label", { className: "text-sm font-medium mb-2 block" }, "Chart of Accounts (Optional)"),
                                React.createElement(select_1.Select, { value: formData.accountId, onValueChange: function (value) {
                                        return setFormData(__assign(__assign({}, formData), { accountId: value }));
                                    } },
                                    React.createElement(select_1.SelectTrigger, null,
                                        React.createElement(select_1.SelectValue, { placeholder: "Select a chart of accounts..." })),
                                    React.createElement(select_1.SelectContent, null, chartOfAccounts && chartOfAccounts.map(function (coa) { return (React.createElement(select_1.SelectItem, { key: coa.id, value: coa.id },
                                        coa.accountCode,
                                        " - ",
                                        coa.accountName)); })))),
                            React.createElement("div", null,
                                React.createElement("label", { className: "text-sm font-medium mb-2 block" }, "Notes (Optional)"),
                                React.createElement(textarea_1.Textarea, { placeholder: "Additional payment notes", value: formData.notes, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { notes: e.target.value })); }, rows: 3 })),
                            React.createElement("div", { className: "flex justify-end gap-2 pt-4" },
                                React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setIsDialogOpen(false); } }, "Cancel"),
                                React.createElement(button_1.Button, { onClick: handleAddPayment, disabled: createPaymentMutation.isPending }, createPaymentMutation.isPending ? "Recording..." : "Record Payment")))))))),
        React.createElement(card_1.CardContent, null,
            React.createElement("div", { className: "grid gap-4 md:grid-cols-4 mb-6" },
                React.createElement(card_1.Card, { className: "bg-muted" },
                    React.createElement(card_1.CardHeader, { className: "pb-2" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Invoice Total")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "text-2xl font-bold" }, formatCurrency(invoiceTotal)))),
                React.createElement(card_1.Card, { className: "bg-muted" },
                    React.createElement(card_1.CardHeader, { className: "pb-2" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Total Paid")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "text-2xl font-bold text-green-600" }, formatCurrency((paymentSummary === null || paymentSummary === void 0 ? void 0 : paymentSummary.totalPaid) || 0)))),
                React.createElement(card_1.Card, { className: "bg-muted" },
                    React.createElement(card_1.CardHeader, { className: "pb-2" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Remaining Balance")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement("div", { className: "text-2xl font-bold text-orange-600" }, formatCurrency((paymentSummary === null || paymentSummary === void 0 ? void 0 : paymentSummary.remainingBalance) || 0)))),
                React.createElement(card_1.Card, { className: "bg-muted" },
                    React.createElement(card_1.CardHeader, { className: "pb-2" },
                        React.createElement(card_1.CardTitle, { className: "text-sm font-medium" }, "Status")),
                    React.createElement(card_1.CardContent, null,
                        React.createElement(badge_1.Badge, { className: getPaymentStatusColor((paymentSummary === null || paymentSummary === void 0 ? void 0 : paymentSummary.paymentStatus) || "pending") }, ((paymentSummary === null || paymentSummary === void 0 ? void 0 : paymentSummary.paymentStatus) || "pending").replace("_", " ").toUpperCase())))),
            !readonly && bulkSelectedPayments.size > 0 && (React.createElement("div", { className: "p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900/50 rounded-lg mb-4 flex items-center justify-between" },
                React.createElement("div", { className: "text-sm font-medium text-blue-900 dark:text-blue-100" },
                    bulkSelectedPayments.size,
                    " payment(s) selected"),
                React.createElement("div", { className: "flex gap-2" },
                    React.createElement(button_1.Button, { size: "sm", variant: "outline", onClick: handleBulkExport, className: "text-blue-600 hover:text-blue-700" }, "Export"),
                    React.createElement(button_1.Button, { size: "sm", variant: "destructive", onClick: handleBulkDelete }, "Delete")))),
            isLoadingPayments ? (React.createElement("div", { className: "text-center py-8 text-muted-foreground" }, "Loading payments...")) : payments.length === 0 ? (React.createElement("div", { className: "text-center py-8 text-muted-foreground" },
                React.createElement(lucide_react_1.AlertCircle, { className: "h-8 w-8 mx-auto mb-2 opacity-50" }),
                "No payments recorded yet")) : (React.createElement(React.Fragment, null,
                payments.length > 1 && !readonly && (React.createElement("div", { className: "flex items-center gap-3 p-3 border-b mb-3" },
                    React.createElement("input", { type: "checkbox", checked: bulkSelectedPayments.size === payments.length && payments.length > 0, onChange: toggleSelectAll, className: "h-4 w-4 rounded border-gray-300", title: "Select all payments" }),
                    React.createElement("span", { className: "text-xs text-muted-foreground" }, bulkSelectedPayments.size > 0 ? bulkSelectedPayments.size + " selected" : "Select all"))),
                React.createElement("div", { className: "space-y-3" }, payments.map(function (payment) { return (React.createElement("div", { key: payment.id, className: "flex items-start gap-3 p-4 border rounded-lg hover:bg-accent transition " + (bulkSelectedPayments.has(payment.id) ? "bg-blue-50 dark:bg-blue-900/20 border-blue-300" : "") },
                    !readonly && (React.createElement("input", { type: "checkbox", checked: bulkSelectedPayments.has(payment.id), onChange: function () { return togglePaymentSelection(payment.id); }, className: "h-4 w-4 rounded border-gray-300 mt-1" })),
                    React.createElement("div", { className: "flex-1" },
                        React.createElement("div", { className: "flex items-center gap-3 mb-2" },
                            React.createElement(lucide_react_1.CheckCircle2, { className: "h-5 w-5 text-green-600" }),
                            React.createElement("div", null,
                                React.createElement("div", { className: "font-medium" }, formatCurrency(payment.paymentAmount)),
                                React.createElement("div", { className: "text-sm text-muted-foreground" },
                                    payment.paymentMethod.replace("_", " ").toUpperCase(),
                                    payment.reference && " \u2022 " + payment.reference))),
                        React.createElement("div", { className: "flex flex-wrap gap-4 text-sm text-muted-foreground" },
                            payment.paymentDate && (React.createElement("div", { className: "flex items-center gap-1" },
                                React.createElement(lucide_react_1.Calendar, { className: "h-3 w-3" }),
                                date_fns_1.format(new Date(payment.paymentDate), "MMM dd, yyyy"))),
                            payment.notes && React.createElement("div", { className: "italic" }, payment.notes))),
                    !readonly && (React.createElement("div", { className: "flex gap-2 ml-4" },
                        React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return openEditDialog(payment); } },
                            React.createElement(lucide_react_1.Edit, { className: "h-4 w-4" })),
                        React.createElement(button_1.Button, { variant: "ghost", size: "sm", className: "text-red-500 hover:text-red-700 hover:bg-red-50", onClick: function () {
                                setSelectedPayment(payment);
                                setIsDeleteOpen(true);
                            } },
                            React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))))); }))))),
        React.createElement(dialog_1.Dialog, { open: isEditDialogOpen, onOpenChange: setIsEditDialogOpen },
            React.createElement(dialog_1.DialogContent, { className: "sm:max-w-[500px]" },
                React.createElement(dialog_1.DialogHeader, null,
                    React.createElement(dialog_1.DialogTitle, null, "Edit Payment"),
                    React.createElement(dialog_1.DialogDescription, null, "Update payment details")),
                React.createElement("div", { className: "space-y-4" },
                    React.createElement("div", null,
                        React.createElement("label", { className: "text-sm font-medium mb-2 block" }, "Payment Amount"),
                        React.createElement(input_1.Input, { type: "number", placeholder: "0.00", step: "0.01", value: formData.paymentAmount, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { paymentAmount: e.target.value })); } })),
                    React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
                        React.createElement("div", null,
                            React.createElement("label", { className: "text-sm font-medium mb-2 block" }, "Payment Date"),
                            React.createElement(input_1.Input, { type: "date", value: formData.paymentDate, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { paymentDate: e.target.value })); } })),
                        React.createElement("div", null,
                            React.createElement("label", { className: "text-sm font-medium mb-2 block" }, "Payment Method"),
                            React.createElement(select_1.Select, { value: formData.paymentMethod, onValueChange: function (value) {
                                    return setFormData(__assign(__assign({}, formData), { paymentMethod: value }));
                                } },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, null)),
                                React.createElement(select_1.SelectContent, null, paymentMethods_1.getPaymentMethodOptions().map(function (method) { return (React.createElement(select_1.SelectItem, { key: method.value, value: method.value }, method.label)); }))))),
                    React.createElement("div", null,
                        React.createElement("label", { className: "text-sm font-medium mb-2 block" }, "Reference (Optional)"),
                        React.createElement(input_1.Input, { placeholder: "e.g., Check #, Transfer reference", value: formData.reference, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { reference: e.target.value })); } })),
                    React.createElement("div", null,
                        React.createElement("label", { className: "text-sm font-medium mb-2 block" }, "Chart of Accounts (Optional)"),
                        React.createElement(select_1.Select, { value: formData.accountId, onValueChange: function (value) {
                                return setFormData(__assign(__assign({}, formData), { accountId: value }));
                            } },
                            React.createElement(select_1.SelectTrigger, null,
                                React.createElement(select_1.SelectValue, { placeholder: "Select a chart of accounts..." })),
                            React.createElement(select_1.SelectContent, null, chartOfAccounts && chartOfAccounts.map(function (coa) { return (React.createElement(select_1.SelectItem, { key: coa.id, value: coa.id },
                                coa.accountCode,
                                " - ",
                                coa.accountName)); })))),
                    React.createElement("div", null,
                        React.createElement("label", { className: "text-sm font-medium mb-2 block" }, "Notes (Optional)"),
                        React.createElement(textarea_1.Textarea, { placeholder: "Additional payment notes", value: formData.notes, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { notes: e.target.value })); }, rows: 3 })),
                    React.createElement("div", { className: "flex justify-end gap-2 pt-4" },
                        React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setIsEditDialogOpen(false); } }, "Cancel"),
                        React.createElement(button_1.Button, { onClick: handleUpdatePayment, disabled: updatePaymentMutation.isPending }, updatePaymentMutation.isPending ? "Saving..." : "Save Changes"))))),
        React.createElement(alert_dialog_1.AlertDialog, { open: isDeleteOpen, onOpenChange: setIsDeleteOpen },
            React.createElement(alert_dialog_1.AlertDialogContent, null,
                React.createElement(alert_dialog_1.AlertDialogTitle, null, "Delete Payment"),
                React.createElement(alert_dialog_1.AlertDialogDescription, null, "Are you sure you want to delete this payment record? This action cannot be undone."),
                React.createElement("div", { className: "flex justify-end gap-2" },
                    React.createElement(alert_dialog_1.AlertDialogCancel, null, "Cancel"),
                    React.createElement(alert_dialog_1.AlertDialogAction, { className: "bg-red-500 hover:bg-red-600", onClick: handleDeletePayment, disabled: deletePaymentMutation.isPending }, deletePaymentMutation.isPending ? "Deleting..." : "Delete"))))));
}
exports["default"] = PaymentTracking;
