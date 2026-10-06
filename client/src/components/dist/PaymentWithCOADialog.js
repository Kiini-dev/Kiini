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
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var dialog_1 = require("@/components/ui/dialog");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var card_1 = require("@/components/ui/card");
var select_1 = require("@/components/ui/select");
var alert_1 = require("@/components/ui/alert");
var textarea_1 = require("@/components/ui/textarea");
var lucide_react_1 = require("lucide-react");
var paymentMethods_1 = require("@/const/paymentMethods");
function PaymentWithCOADialog(_a) {
    var _this = this;
    var invoiceId = _a.invoiceId, clientId = _a.clientId, invoiceTotal = _a.invoiceTotal, paidAmount = _a.paidAmount, open = _a.open, onOpenChange = _a.onOpenChange, onSuccess = _a.onSuccess;
    var _b = react_1.useState({
        amount: (invoiceTotal - paidAmount) / 100,
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'bank_transfer',
        accountId: '',
        referenceNumber: '',
        chartOfAccountType: 'debit',
        notes: ''
    }), formData = _b[0], setFormData = _b[1];
    var _c = react_1.useState(false), loading = _c[0], setLoading = _c[1];
    var _d = react_1.useState(null), coaBalance = _d[0], setCoaBalance = _d[1];
    // Fetch available COA accounts
    var coaAccounts = trpc_1.trpc.chartOfAccounts.list.useQuery({}).data;
    // Fetch COA balance when account is selected
    var getBalanceMutation = trpc_1.trpc.enhancedPayments.getAccountBalance.useMutation();
    // Create payment mutation
    var createPaymentMutation = trpc_1.trpc.enhancedPayments.createPaymentWithCOA.useMutation({
        onSuccess: function (data) {
            sonner_1.toast.success(data.message);
            onOpenChange(false);
            setFormData({
                amount: (invoiceTotal - paidAmount) / 100,
                paymentDate: new Date().toISOString().split('T')[0],
                paymentMethod: 'bank_transfer',
                accountId: '',
                referenceNumber: '',
                chartOfAccountType: 'debit',
                notes: ''
            });
            onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess();
        },
        onError: function (error) {
            sonner_1.toast.error("Payment failed: " + error.message);
        }
    });
    var handleAccountChange = function (accountId) { return __awaiter(_this, void 0, void 0, function () {
        var balance, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setFormData(function (prev) { return (__assign(__assign({}, prev), { accountId: accountId })); });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, getBalanceMutation.mutateAsync(accountId)];
                case 2:
                    balance = _a.sent();
                    setCoaBalance(balance.balance || 0);
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    sonner_1.toast.error('Failed to fetch account balance');
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleSubmit = function () { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!formData.accountId) {
                        sonner_1.toast.error('Please select a Chart of Accounts');
                        return [2 /*return*/];
                    }
                    if (formData.amount <= 0) {
                        sonner_1.toast.error('Payment amount must be greater than 0');
                        return [2 /*return*/];
                    }
                    if (formData.amount > (invoiceTotal - paidAmount) / 100) {
                        sonner_1.toast.error('Payment amount cannot exceed remaining invoice balance');
                        return [2 /*return*/];
                    }
                    setLoading(true);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, , 3, 4]);
                    return [4 /*yield*/, createPaymentMutation.mutateAsync({
                            invoiceId: invoiceId,
                            clientId: clientId,
                            accountId: formData.accountId,
                            amount: formData.amount,
                            paymentDate: formData.paymentDate,
                            paymentMethod: formData.paymentMethod,
                            referenceNumber: formData.referenceNumber || undefined,
                            chartOfAccountType: formData.chartOfAccountType,
                            notes: formData.notes || undefined
                        })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var remainingBalance = (invoiceTotal - paidAmount) / 100;
    var selectedAccount = coaAccounts === null || coaAccounts === void 0 ? void 0 : coaAccounts.find(function (acc) { return acc.id === formData.accountId; });
    return (react_1["default"].createElement(dialog_1.Dialog, { open: open, onOpenChange: onOpenChange },
        react_1["default"].createElement(dialog_1.DialogContent, { className: "max-w-md" },
            react_1["default"].createElement(dialog_1.DialogHeader, null,
                react_1["default"].createElement(dialog_1.DialogTitle, null, "Record Payment with COA"),
                react_1["default"].createElement(dialog_1.DialogDescription, null, "Record payment and update Chart of Accounts balance")),
            react_1["default"].createElement("div", { className: "space-y-4" },
                react_1["default"].createElement(card_1.Card, { className: "bg-blue-50 dark:bg-blue-950 border-blue-200" },
                    react_1["default"].createElement(card_1.CardContent, { className: "pt-4" },
                        react_1["default"].createElement("div", { className: "space-y-2" },
                            react_1["default"].createElement("div", { className: "flex justify-between text-sm" },
                                react_1["default"].createElement("span", { className: "text-gray-600" }, "Invoice Total:"),
                                react_1["default"].createElement("span", { className: "font-semibold" },
                                    "KES ",
                                    (invoiceTotal / 100).toLocaleString())),
                            react_1["default"].createElement("div", { className: "flex justify-between text-sm" },
                                react_1["default"].createElement("span", { className: "text-gray-600" }, "Already Paid:"),
                                react_1["default"].createElement("span", { className: "font-semibold" },
                                    "KES ",
                                    (paidAmount / 100).toLocaleString())),
                            react_1["default"].createElement("div", { className: "border-t pt-2 flex justify-between" },
                                react_1["default"].createElement("span", { className: "text-gray-600" }, "Remaining:"),
                                react_1["default"].createElement("span", { className: "font-bold text-red-600" },
                                    "KES ",
                                    remainingBalance.toLocaleString()))))),
                react_1["default"].createElement("div", { className: "space-y-2" },
                    react_1["default"].createElement(label_1.Label, { htmlFor: "amount" }, "Payment Amount (KES)"),
                    react_1["default"].createElement(input_1.Input, { id: "amount", type: "number", step: "0.01", min: "0", max: remainingBalance, value: formData.amount, onChange: function (e) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { amount: parseFloat(e.target.value) || 0 })); }); }, placeholder: "0.00" }),
                    formData.amount > remainingBalance && (react_1["default"].createElement(alert_1.Alert, { variant: "destructive" },
                        react_1["default"].createElement(lucide_react_1.AlertCircle, { className: "h-4 w-4" }),
                        react_1["default"].createElement(alert_1.AlertDescription, null, "Amount exceeds remaining balance")))),
                react_1["default"].createElement("div", { className: "space-y-2" },
                    react_1["default"].createElement(label_1.Label, { htmlFor: "paymentDate" }, "Payment Date"),
                    react_1["default"].createElement(input_1.Input, { id: "paymentDate", type: "date", value: formData.paymentDate, onChange: function (e) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { paymentDate: e.target.value })); }); } })),
                react_1["default"].createElement("div", { className: "space-y-2" },
                    react_1["default"].createElement(label_1.Label, { htmlFor: "paymentMethod" }, "Payment Method"),
                    react_1["default"].createElement(select_1.Select, { value: formData.paymentMethod, onValueChange: function (value) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { paymentMethod: value })); }); } },
                        react_1["default"].createElement(select_1.SelectTrigger, { id: "paymentMethod" },
                            react_1["default"].createElement(select_1.SelectValue, null)),
                        react_1["default"].createElement(select_1.SelectContent, null, paymentMethods_1.getPaymentMethodOptions().map(function (method) { return (react_1["default"].createElement(select_1.SelectItem, { key: method.value, value: method.value }, method.label)); })))),
                react_1["default"].createElement("div", { className: "space-y-2" },
                    react_1["default"].createElement(label_1.Label, { htmlFor: "accountId" }, "Chart of Accounts"),
                    react_1["default"].createElement(select_1.Select, { value: formData.accountId, onValueChange: handleAccountChange },
                        react_1["default"].createElement(select_1.SelectTrigger, { id: "accountId" },
                            react_1["default"].createElement(select_1.SelectValue, { placeholder: "Select COA account" })),
                        react_1["default"].createElement(select_1.SelectContent, null, coaAccounts === null || coaAccounts === void 0 ? void 0 : coaAccounts.map(function (acc) { return (react_1["default"].createElement(select_1.SelectItem, { key: acc.id, value: acc.id },
                            acc.accountCode,
                            " - ",
                            acc.accountName)); }))),
                    selectedAccount && coaBalance !== null && (react_1["default"].createElement(alert_1.Alert, null,
                        react_1["default"].createElement(lucide_react_1.CheckCircle2, { className: "h-4 w-4" }),
                        react_1["default"].createElement(alert_1.AlertDescription, null,
                            "Current Balance: KES ",
                            (coaBalance / 100).toLocaleString())))),
                react_1["default"].createElement("div", { className: "space-y-2" },
                    react_1["default"].createElement(label_1.Label, { htmlFor: "coaType" }, "COA Entry Type"),
                    react_1["default"].createElement(select_1.Select, { value: formData.chartOfAccountType, onValueChange: function (value) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { chartOfAccountType: value })); }); } },
                        react_1["default"].createElement(select_1.SelectTrigger, { id: "coaType" },
                            react_1["default"].createElement(select_1.SelectValue, null)),
                        react_1["default"].createElement(select_1.SelectContent, null,
                            react_1["default"].createElement(select_1.SelectItem, { value: "debit" }, "Debit (increase balance)"),
                            react_1["default"].createElement(select_1.SelectItem, { value: "credit" }, "Credit (decrease balance)")))),
                react_1["default"].createElement("div", { className: "space-y-2" },
                    react_1["default"].createElement(label_1.Label, { htmlFor: "referenceNumber" }, "Reference Number (Optional)"),
                    react_1["default"].createElement(input_1.Input, { id: "referenceNumber", value: formData.referenceNumber, onChange: function (e) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { referenceNumber: e.target.value })); }); }, placeholder: "Cheque #, Transaction ID, etc." })),
                react_1["default"].createElement("div", { className: "space-y-2" },
                    react_1["default"].createElement(label_1.Label, { htmlFor: "notes" }, "Notes (Optional)"),
                    react_1["default"].createElement(textarea_1.Textarea, { id: "notes", value: formData.notes, onChange: function (e) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { notes: e.target.value })); }); }, placeholder: "Add any notes about this payment...", rows: 3 }))),
            react_1["default"].createElement(dialog_1.DialogFooter, null,
                react_1["default"].createElement(button_1.Button, { variant: "outline", onClick: function () { return onOpenChange(false); }, disabled: loading }, "Cancel"),
                react_1["default"].createElement(button_1.Button, { onClick: handleSubmit, disabled: loading || !formData.accountId || formData.amount <= 0 }, loading ? (react_1["default"].createElement(react_1["default"].Fragment, null,
                    react_1["default"].createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
                    "Processing...")) : ('Record Payment'))))));
}
exports["default"] = PaymentWithCOADialog;
