"use strict";
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
var ModuleLayout_1 = require("@/components/ModuleLayout");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var currency_1 = require("@/lib/currency");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var select_1 = require("@/components/ui/select");
var table_1 = require("@/components/ui/table");
var dialog_1 = require("@/components/ui/dialog");
var alert_1 = require("@/components/ui/alert");
var badge_1 = require("@/components/ui/badge");
var lucide_react_1 = require("lucide-react");
var stats_card_1 = require("@/components/ui/stats-card");
function PaymentReconciliation() {
    var _this = this;
    var formatMoney = currency_1.useCurrency().format;
    var _a = react_1.useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        .toISOString()
        .split('T')[0]), dateFrom = _a[0], setDateFrom = _a[1];
    var _b = react_1.useState(new Date().toISOString().split('T')[0]), dateTo = _b[0], setDateTo = _b[1];
    var _c = react_1.useState('__all__'), paymentMethod = _c[0], setPaymentMethod = _c[1];
    var _d = react_1.useState(null), selectedPayment = _d[0], setSelectedPayment = _d[1];
    var _e = react_1.useState(false), reverseDialogOpen = _e[0], setReverseDialogOpen = _e[1];
    // Fetch payments within date range
    var _f = trpc_1.trpc.payments.list.useQuery({
        filters: {
            status: 'completed'
        }
    }), payments = _f.data, isLoading = _f.isLoading, refetch = _f.refetch;
    var reversalMutation = trpc_1.trpc.enhancedPayments.reversePayment.useMutation({
        onSuccess: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sonner_1.toast.success('Payment reversed successfully');
                        setReverseDialogOpen(false);
                        setSelectedPayment(null);
                        return [4 /*yield*/, refetch()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); },
        onError: function (error) {
            sonner_1.toast.error("Failed to reverse payment: " + error.message);
        }
    });
    // Filter payments by date and method
    var filteredPayments = (payments === null || payments === void 0 ? void 0 : payments.filter(function (payment) {
        if (!payment.paymentDate)
            return false;
        var paymentDate = new Date(payment.paymentDate).toISOString().split('T')[0];
        var dateMatch = true;
        if (dateFrom && paymentDate < dateFrom)
            dateMatch = false;
        if (dateTo && paymentDate > dateTo)
            dateMatch = false;
        var methodMatch = true;
        if (paymentMethod && paymentMethod !== '__all__' && payment.paymentMethod !== paymentMethod)
            methodMatch = false;
        return dateMatch && methodMatch;
    })) || [];
    // Calculate statistics
    var stats = {
        totalPayments: filteredPayments.length,
        totalAmount: filteredPayments.reduce(function (sum, p) { return sum + (p.amount || 0); }, 0),
        avgAmount: filteredPayments.length > 0
            ? filteredPayments.reduce(function (sum, p) { return sum + (p.amount || 0); }, 0) / filteredPayments.length
            : 0
    };
    // Breakdown by payment method
    var methodBreakdown = Object.groupBy(filteredPayments, function (p) { return p.paymentMethod || 'Other'; });
    var handleReversal = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!selectedPayment)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, reversalMutation.mutateAsync({ paymentId: selectedPayment })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var exportCSV = function () {
        var csv = __spreadArrays([
            ['Payment Date', 'Invoice', 'Client', 'Amount', 'Method', 'Reference', 'Account', 'Status'].join(',')
        ], filteredPayments.map(function (p) {
            return [
                p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : '',
                p.invoiceId || '',
                p.clientName || '',
                formatMoney(p.amount),
                p.paymentMethod || '',
                p.reference || '',
                p.chartOfAccountName || '',
                p.status || 'completed',
            ].join(',');
        })).join('\n');
        var blob = new Blob([csv], { type: 'text/csv' });
        var url = URL.createObjectURL(blob);
        var link = document.createElement('a');
        link.href = url;
        link.download = "payment-reconciliation-" + new Date().toISOString().split('T')[0] + ".csv";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        sonner_1.toast.success('Payment reconciliation exported');
    };
    var getPaymentMethodColor = function (method) {
        var colors = {
            'Cash': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
            'Bank Transfer': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
            'Cheque': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
            'MPesa': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
            'Card': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100'
        };
        return colors[method] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
    };
    var currentPayment = payments === null || payments === void 0 ? void 0 : payments.find(function (p) { return p.id === selectedPayment; });
    return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: "Payment Reconciliation", description: "View, reconcile, and reverse payments with Chart of Accounts tracking", icon: react_1["default"].createElement(lucide_react_1.TrendingUp, { className: "h-5 w-5" }), breadcrumbs: [{ label: "Dashboard", href: "/" }, { label: "Payments", href: "/payments" }, { label: "Reconciliation" }], backLink: { label: "Payments", href: "/payments" } },
        react_1["default"].createElement("div", { className: "space-y-6" },
            react_1["default"].createElement("div", { className: "hidden" },
                react_1["default"].createElement("h1", { className: "text-3xl font-bold" }, "Payment Reconciliation"),
                react_1["default"].createElement("p", { className: "text-gray-500 dark:text-gray-400 mt-1" }, "View, reconcile, and reverse payments with Chart of Accounts tracking")),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardHeader, null,
                    react_1["default"].createElement(card_1.CardTitle, { className: "text-lg" }, "Filters")),
                react_1["default"].createElement(card_1.CardContent, null,
                    react_1["default"].createElement("div", { className: "grid grid-cols-4 gap-4" },
                        react_1["default"].createElement("div", { className: "space-y-2" },
                            react_1["default"].createElement(label_1.Label, { htmlFor: "dateFrom" }, "Date From"),
                            react_1["default"].createElement(input_1.Input, { id: "dateFrom", type: "date", value: dateFrom, onChange: function (e) { return setDateFrom(e.target.value); } })),
                        react_1["default"].createElement("div", { className: "space-y-2" },
                            react_1["default"].createElement(label_1.Label, { htmlFor: "dateTo" }, "Date To"),
                            react_1["default"].createElement(input_1.Input, { id: "dateTo", type: "date", value: dateTo, onChange: function (e) { return setDateTo(e.target.value); } })),
                        react_1["default"].createElement("div", { className: "space-y-2" },
                            react_1["default"].createElement(label_1.Label, { htmlFor: "method" }, "Payment Method"),
                            react_1["default"].createElement(select_1.Select, { value: paymentMethod, onValueChange: setPaymentMethod },
                                react_1["default"].createElement(select_1.SelectTrigger, { id: "method" },
                                    react_1["default"].createElement(select_1.SelectValue, { placeholder: "All methods" })),
                                react_1["default"].createElement(select_1.SelectContent, null,
                                    react_1["default"].createElement(select_1.SelectItem, { value: "__all__" }, "All methods"),
                                    react_1["default"].createElement(select_1.SelectItem, { value: "cash" }, "Cash"),
                                    react_1["default"].createElement(select_1.SelectItem, { value: "card" }, "Card"),
                                    react_1["default"].createElement(select_1.SelectItem, { value: "bank_transfer" }, "Bank Transfer"),
                                    react_1["default"].createElement(select_1.SelectItem, { value: "mpesa" }, "M-Pesa"),
                                    react_1["default"].createElement(select_1.SelectItem, { value: "cheque" }, "Cheque"),
                                    react_1["default"].createElement(select_1.SelectItem, { value: "other" }, "Other")))),
                        react_1["default"].createElement("div", { className: "flex items-end" },
                            react_1["default"].createElement(button_1.Button, { onClick: exportCSV, variant: "outline", className: "w-full" },
                                react_1["default"].createElement(lucide_react_1.Download, { className: "w-4 h-4 mr-2" }),
                                "Export CSV"))))),
            react_1["default"].createElement("div", { className: "grid grid-cols-3 gap-4" },
                react_1["default"].createElement(stats_card_1.StatsCard, { label: "Total Payments", value: stats.totalPayments, color: "border-l-purple-500" }),
                react_1["default"].createElement(stats_card_1.StatsCard, { label: "Total Amount", value: formatMoney(stats.totalAmount), color: "border-l-green-500" }),
                react_1["default"].createElement(stats_card_1.StatsCard, { label: "Average Payment", value: formatMoney(stats.avgAmount), color: "border-l-blue-500" })),
            Object.keys(methodBreakdown).length > 0 && (react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardHeader, null,
                    react_1["default"].createElement(card_1.CardTitle, null, "Payment Method Breakdown")),
                react_1["default"].createElement(card_1.CardContent, null,
                    react_1["default"].createElement("div", { className: "space-y-3" }, Object.entries(methodBreakdown).map(function (_a) {
                        var method = _a[0], items = _a[1];
                        return (react_1["default"].createElement("div", { key: method, className: "flex items-center justify-between pb-2 border-b last:border-0" },
                            react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                                react_1["default"].createElement(badge_1.Badge, { className: getPaymentMethodColor(method) }, method),
                                react_1["default"].createElement("span", { className: "text-sm text-gray-500" },
                                    items.length,
                                    " payment",
                                    items.length !== 1 ? 's' : '')),
                            react_1["default"].createElement("span", { className: "font-semibold" }, formatMoney(items.reduce(function (sum, p) { return sum + (p.amount || 0); }, 0)))));
                    }))))),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardHeader, null,
                    react_1["default"].createElement(card_1.CardTitle, null, "Payment History"),
                    react_1["default"].createElement(card_1.CardDescription, null,
                        filteredPayments.length,
                        " payment",
                        filteredPayments.length !== 1 ? 's' : '',
                        " in selected period")),
                react_1["default"].createElement(card_1.CardContent, null, isLoading ? (react_1["default"].createElement("div", { className: "flex items-center justify-center py-8" },
                    react_1["default"].createElement(lucide_react_1.Loader2, { className: "h-6 w-6 animate-spin" }))) : filteredPayments.length > 0 ? (react_1["default"].createElement("div", { className: "overflow-x-auto" },
                    react_1["default"].createElement(table_1.Table, null,
                        react_1["default"].createElement(table_1.TableHeader, null,
                            react_1["default"].createElement(table_1.TableRow, null,
                                react_1["default"].createElement(table_1.TableHead, null, "Date"),
                                react_1["default"].createElement(table_1.TableHead, null, "Invoice"),
                                react_1["default"].createElement(table_1.TableHead, null, "Client"),
                                react_1["default"].createElement(table_1.TableHead, null, "Amount"),
                                react_1["default"].createElement(table_1.TableHead, null, "Method"),
                                react_1["default"].createElement(table_1.TableHead, null, "COA Account"),
                                react_1["default"].createElement(table_1.TableHead, null, "Reference"),
                                react_1["default"].createElement(table_1.TableHead, null, "Actions"))),
                        react_1["default"].createElement(table_1.TableBody, null, filteredPayments.map(function (payment) { return (react_1["default"].createElement(table_1.TableRow, { key: payment.id },
                            react_1["default"].createElement(table_1.TableCell, null, payment.paymentDate
                                ? new Date(payment.paymentDate).toLocaleDateString()
                                : '-'),
                            react_1["default"].createElement(table_1.TableCell, { className: "font-mono text-sm" }, payment.invoiceId || '-'),
                            react_1["default"].createElement(table_1.TableCell, null, payment.clientName || '-'),
                            react_1["default"].createElement(table_1.TableCell, { className: "font-semibold" }, formatMoney(payment.amount || 0)),
                            react_1["default"].createElement(table_1.TableCell, null,
                                react_1["default"].createElement(badge_1.Badge, { className: getPaymentMethodColor(payment.paymentMethod || '') }, payment.paymentMethod || 'Other')),
                            react_1["default"].createElement(table_1.TableCell, null,
                                react_1["default"].createElement("div", { className: "text-sm" },
                                    react_1["default"].createElement("p", { className: "font-medium" }, payment.chartOfAccountName || '-'),
                                    react_1["default"].createElement("p", { className: "text-xs text-gray-500" }, payment.chartOfAccountCode || ''))),
                            react_1["default"].createElement(table_1.TableCell, { className: "text-sm text-gray-500" }, payment.reference || '-'),
                            react_1["default"].createElement(table_1.TableCell, null,
                                react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", onClick: function () {
                                        setSelectedPayment(payment.id);
                                        setReverseDialogOpen(true);
                                    } },
                                    react_1["default"].createElement(lucide_react_1.Undo2, { className: "w-4 h-4" }))))); }))))) : (react_1["default"].createElement("div", { className: "text-center py-8" },
                    react_1["default"].createElement(lucide_react_1.AlertCircle, { className: "h-8 w-8 mx-auto mb-2 text-gray-400" }),
                    react_1["default"].createElement("p", { className: "text-gray-500" }, "No payments found in selected period"))))),
            react_1["default"].createElement(dialog_1.Dialog, { open: reverseDialogOpen, onOpenChange: setReverseDialogOpen },
                react_1["default"].createElement(dialog_1.DialogContent, null,
                    react_1["default"].createElement(dialog_1.DialogHeader, null,
                        react_1["default"].createElement(dialog_1.DialogTitle, null, "Reverse Payment"),
                        react_1["default"].createElement(dialog_1.DialogDescription, null, "This action will reverse the payment and credit the COA account")),
                    currentPayment && (react_1["default"].createElement("div", { className: "space-y-4" },
                        react_1["default"].createElement(alert_1.Alert, null,
                            react_1["default"].createElement(lucide_react_1.CheckCircle2, { className: "h-4 w-4" }),
                            react_1["default"].createElement(alert_1.AlertDescription, null,
                                "Payment ID: ",
                                currentPayment.id)),
                        react_1["default"].createElement("div", { className: "grid grid-cols-2 gap-4" },
                            react_1["default"].createElement("div", null,
                                react_1["default"].createElement("p", { className: "text-xs text-gray-500" }, "Client"),
                                react_1["default"].createElement("p", { className: "font-semibold" }, currentPayment.clientName || '-')),
                            react_1["default"].createElement("div", null,
                                react_1["default"].createElement("p", { className: "text-xs text-gray-500" }, "Amount"),
                                react_1["default"].createElement("p", { className: "font-semibold" }, formatMoney(currentPayment.amount || 0))),
                            react_1["default"].createElement("div", null,
                                react_1["default"].createElement("p", { className: "text-xs text-gray-500" }, "Payment Method"),
                                react_1["default"].createElement("p", { className: "font-semibold" }, currentPayment.paymentMethod || '-')),
                            react_1["default"].createElement("div", null,
                                react_1["default"].createElement("p", { className: "text-xs text-gray-500" }, "COA Account"),
                                react_1["default"].createElement("p", { className: "font-semibold" }, currentPayment.chartOfAccountName || '-'))),
                        react_1["default"].createElement(alert_1.Alert, { className: "bg-orange-50 border-orange-200 dark:bg-orange-900 dark:border-orange-800" },
                            react_1["default"].createElement(lucide_react_1.AlertCircle, { className: "h-4 w-4 text-orange-600 dark:text-orange-400" }),
                            react_1["default"].createElement(alert_1.AlertDescription, { className: "text-orange-800 dark:text-orange-100" },
                                "Reversing this payment will:",
                                react_1["default"].createElement("ul", { className: "list-disc list-inside mt-2 space-y-1" },
                                    react_1["default"].createElement("li", null, "Credit the COA account balance"),
                                    react_1["default"].createElement("li", null, "Update invoice payment status"),
                                    react_1["default"].createElement("li", null, "Mark this payment as cancelled")))))),
                    react_1["default"].createElement(dialog_1.DialogFooter, null,
                        react_1["default"].createElement(button_1.Button, { variant: "outline", onClick: function () { return setReverseDialogOpen(false); }, disabled: reversalMutation.isPending }, "Cancel"),
                        react_1["default"].createElement(button_1.Button, { variant: "destructive", onClick: handleReversal, disabled: reversalMutation.isPending }, reversalMutation.isPending ? (react_1["default"].createElement(react_1["default"].Fragment, null,
                            react_1["default"].createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
                            "Reversing...")) : (react_1["default"].createElement(react_1["default"].Fragment, null,
                            react_1["default"].createElement(lucide_react_1.Undo2, { className: "mr-2 h-4 w-4" }),
                            "Reverse Payment")))))))));
}
exports["default"] = PaymentReconciliation;
