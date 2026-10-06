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
exports.PaymentPlans = void 0;
var react_1 = require("react");
var trpc_1 = require("@/lib/trpc");
var currency_1 = require("@/lib/currency");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var dialog_1 = require("@/components/ui/dialog");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var select_1 = require("@/components/ui/select");
var badge_1 = require("@/components/ui/badge");
var table_1 = require("@/components/ui/table");
var textarea_1 = require("@/components/ui/textarea");
var alert_dialog_1 = require("@/components/ui/alert-dialog");
var sheet_1 = require("@/components/ui/sheet");
var utils_1 = require("@/lib/utils");
var lucide_react_1 = require("lucide-react");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var sonner_1 = require("sonner");
var stats_card_1 = require("@/components/ui/stats-card");
function PaymentPlans() {
    var _this = this;
    var formatMoney = currency_1.useCurrency().format;
    var _a = react_1.useState(false), isOpen = _a[0], setIsOpen = _a[1];
    var _b = react_1.useState(null), expandedPlan = _b[0], setExpandedPlan = _b[1];
    var _c = react_1.useState(null), deleteId = _c[0], setDeleteId = _c[1];
    var _d = react_1.useState({
        invoiceId: "",
        numInstallments: 3,
        frequencyDays: 30,
        notes: ""
    }), formData = _d[0], setFormData = _d[1];
    // Fetch data
    var _e = trpc_1.trpc.paymentPlans.list.useQuery({}), paymentPlansList = _e.data, refetchPlans = _e.refetch;
    var clients = trpc_1.trpc.clients.list.useQuery(undefined).data;
    var invoices = trpc_1.trpc.invoices.list.useQuery({ limit: 500 }).data;
    // Mutations
    var createMutation = trpc_1.trpc.paymentPlans.createFromInvoice.useMutation({
        onSuccess: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sonner_1.toast.success("Payment plan created successfully");
                        setIsOpen(false);
                        resetForm();
                        return [4 /*yield*/, refetchPlans()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to create payment plan");
        }
    });
    var deleteMutation = trpc_1.trpc.paymentPlans["delete"].useMutation({
        onSuccess: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sonner_1.toast.success("Payment plan deleted");
                        setDeleteId(null);
                        return [4 /*yield*/, refetchPlans()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to delete payment plan");
        }
    });
    var updateMutation = trpc_1.trpc.paymentPlans.update.useMutation({
        onSuccess: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sonner_1.toast.success("Payment plan updated");
                        return [4 /*yield*/, refetchPlans()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to update payment plan");
        }
    });
    // Handlers
    var resetForm = function () {
        setFormData({
            invoiceId: "",
            numInstallments: 3,
            frequencyDays: 30,
            notes: ""
        });
    };
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            e.preventDefault();
            if (!formData.invoiceId) {
                sonner_1.toast.error("Please select an invoice");
                return [2 /*return*/];
            }
            createMutation.mutate({
                invoiceId: formData.invoiceId,
                numInstallments: formData.numInstallments,
                frequencyDays: formData.frequencyDays,
                startDate: new Date().toISOString(),
                notes: formData.notes || undefined
            });
            return [2 /*return*/];
        });
    }); };
    var handleDelete = function (id) {
        deleteMutation.mutate(id);
    };
    var handleToggleStatus = function (plan) {
        var newStatus = plan.status === "active" ? "paused" : "active";
        updateMutation.mutate({
            id: plan.id,
            status: newStatus
        });
    };
    var getClientName = function (clientId) {
        var _a;
        return ((_a = clients === null || clients === void 0 ? void 0 : clients.find(function (c) { return c.id === clientId; })) === null || _a === void 0 ? void 0 : _a.companyName) || clientId;
    };
    var getInvoiceNumber = function (invoiceId) {
        var _a;
        return ((_a = invoices === null || invoices === void 0 ? void 0 : invoices.find(function (i) { return i.id === invoiceId; })) === null || _a === void 0 ? void 0 : _a.invoiceNumber) || invoiceId;
    };
    var getInvoiceTotal = function (invoiceId) {
        var _a;
        return ((_a = invoices === null || invoices === void 0 ? void 0 : invoices.find(function (i) { return i.id === invoiceId; })) === null || _a === void 0 ? void 0 : _a.total) || 0;
    };
    var stats = react_1.useMemo(function () {
        if (!paymentPlansList)
            return { total: 0, active: 0, completed: 0, paused: 0 };
        return {
            total: paymentPlansList.length,
            active: paymentPlansList.filter(function (p) { return p.status === "active"; }).length,
            completed: paymentPlansList.filter(function (p) { return p.status === "completed"; }).length,
            paused: paymentPlansList.filter(function (p) { return p.status === "paused"; }).length
        };
    }, [paymentPlansList]);
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Payment Plans", description: "Split invoices into installments", icon: React.createElement(lucide_react_1.Calendar, { className: "h-6 w-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/" },
            { label: "Finance", href: "/accounting" },
            { label: "Payment Plans" },
        ] },
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "flex justify-end" },
                React.createElement(dialog_1.Dialog, { open: isOpen, onOpenChange: function (open) {
                        setIsOpen(open);
                        if (!open)
                            resetForm();
                    } },
                    React.createElement(dialog_1.DialogTrigger, { asChild: true },
                        React.createElement(button_1.Button, null,
                            React.createElement(lucide_react_1.Plus, { className: "w-4 h-4 mr-2" }),
                            "New Payment Plan")),
                    React.createElement(dialog_1.DialogContent, { className: "w-full max-w-md" },
                        React.createElement(dialog_1.DialogHeader, null,
                            React.createElement(dialog_1.DialogTitle, null, "Create Payment Plan"),
                            React.createElement(dialog_1.DialogDescription, null, "Split an invoice into installments for easier payment")),
                        React.createElement("form", { onSubmit: handleSubmit, className: "space-y-4" },
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "invoice" }, "Invoice *"),
                                React.createElement(select_1.Select, { value: formData.invoiceId, onValueChange: function (value) {
                                        return setFormData(__assign(__assign({}, formData), { invoiceId: value }));
                                    } },
                                    React.createElement(select_1.SelectTrigger, null,
                                        React.createElement(select_1.SelectValue, { placeholder: "Select invoice" })),
                                    React.createElement(select_1.SelectContent, null, invoices === null || invoices === void 0 ? void 0 : invoices.filter(function (inv) { return inv.status !== "paid" && inv.status !== "cancelled"; }).map(function (invoice) { return (React.createElement(select_1.SelectItem, { key: invoice.id, value: invoice.id },
                                        invoice.invoiceNumber,
                                        " - ",
                                        formatMoney(invoice.total),
                                        " (",
                                        invoice.status,
                                        ")")); })))),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "numInstallments" }, "Number of Installments *"),
                                React.createElement(input_1.Input, { type: "number", min: "2", max: "24", value: formData.numInstallments, onChange: function (e) {
                                        return setFormData(__assign(__assign({}, formData), { numInstallments: parseInt(e.target.value) }));
                                    } }),
                                formData.invoiceId && (React.createElement("p", { className: "text-sm text-gray-600" },
                                    "Each installment: ",
                                    formatMoney(Math.ceil(getInvoiceTotal(formData.invoiceId) / formData.numInstallments))))),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "frequencyDays" }, "Days Between Installments *"),
                                React.createElement(select_1.Select, { value: formData.frequencyDays.toString(), onValueChange: function (value) {
                                        return setFormData(__assign(__assign({}, formData), { frequencyDays: parseInt(value) }));
                                    } },
                                    React.createElement(select_1.SelectTrigger, null,
                                        React.createElement(select_1.SelectValue, null)),
                                    React.createElement(select_1.SelectContent, null,
                                        React.createElement(select_1.SelectItem, { value: "7" }, "Weekly (7 days)"),
                                        React.createElement(select_1.SelectItem, { value: "14" }, "Bi-weekly (14 days)"),
                                        React.createElement(select_1.SelectItem, { value: "30" }, "Monthly (30 days)"),
                                        React.createElement(select_1.SelectItem, { value: "45" }, "45 days"),
                                        React.createElement(select_1.SelectItem, { value: "60" }, "60 days"),
                                        React.createElement(select_1.SelectItem, { value: "90" }, "Quarterly (90 days)")))),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, { htmlFor: "notes" }, "Notes (Optional)"),
                                React.createElement(textarea_1.Textarea, { value: formData.notes, onChange: function (e) {
                                        return setFormData(__assign(__assign({}, formData), { notes: e.target.value }));
                                    }, placeholder: "e.g., Payment terms, special instructions", rows: 3 })),
                            React.createElement(button_1.Button, { type: "submit", className: "w-full", disabled: createMutation.isPending }, "Create Payment Plan"))))),
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4" },
                React.createElement(stats_card_1.StatsCard, { label: "Total Plans", value: stats.total, color: "border-l-orange-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Active", value: stats.active, color: "border-l-purple-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Completed", value: stats.completed, color: "border-l-green-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Paused", value: stats.paused, color: "border-l-blue-500" })),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Payment Plans"),
                    React.createElement(card_1.CardDescription, null,
                        (paymentPlansList === null || paymentPlansList === void 0 ? void 0 : paymentPlansList.length) || 0,
                        " payment plans configured")),
                React.createElement(card_1.CardContent, null, !paymentPlansList || paymentPlansList.length === 0 ? (React.createElement("div", { className: "text-center py-8 text-gray-500" }, "No payment plans yet. Create one to split an invoice into installments.")) : (React.createElement("div", { className: "space-y-4" }, paymentPlansList.map(function (plan) { return (React.createElement("div", { key: plan.id, className: "border rounded-lg p-4 hover:bg-gray-50 transition" },
                    React.createElement("div", { className: "flex justify-between items-start" },
                        React.createElement("div", { className: "flex-1" },
                            React.createElement("div", { className: "flex items-center gap-3 mb-2" },
                                React.createElement("span", { className: "font-semibold" }, getInvoiceNumber(plan.invoiceId)),
                                React.createElement(badge_1.Badge, { variant: plan.status === "active" ? "default" : "secondary" }, plan.status),
                                React.createElement("span", { className: "text-sm text-gray-600" },
                                    plan.completedInstallments,
                                    " of ",
                                    plan.numInstallments,
                                    " paid")),
                            React.createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3" },
                                React.createElement("div", null,
                                    React.createElement("span", { className: "text-gray-600" }, "Client:"),
                                    React.createElement("p", { className: "font-medium" }, getClientName(plan.clientId))),
                                React.createElement("div", null,
                                    React.createElement("span", { className: "text-gray-600" }, "Installment Amount:"),
                                    React.createElement("p", { className: "font-medium" }, formatMoney(plan.installmentAmount))),
                                React.createElement("div", null,
                                    React.createElement("span", { className: "text-gray-600" }, "Next Due:"),
                                    React.createElement("p", { className: "font-medium" }, utils_1.formatDate(plan.nextInstallmentDue))),
                                React.createElement("div", null,
                                    React.createElement("span", { className: "text-gray-600" }, "Total Paid:"),
                                    React.createElement("p", { className: "font-medium" }, formatMoney(plan.totalPaid)))),
                            React.createElement("div", { className: "w-full bg-gray-200 rounded-full h-2 mb-2" },
                                React.createElement("div", { className: "bg-blue-600 h-2 rounded-full", style: {
                                        width: (plan.completedInstallments / plan.numInstallments) * 100 + "%"
                                    } }))),
                        React.createElement("div", { className: "flex gap-2 ml-4" },
                            React.createElement(sheet_1.Sheet, null,
                                React.createElement(sheet_1.SheetTrigger, { asChild: true },
                                    React.createElement(button_1.Button, { size: "sm", variant: "outline", onClick: function () { return setExpandedPlan(plan.id); } },
                                        React.createElement(lucide_react_1.ChevronDown, { className: "w-4 h-4" }))),
                                React.createElement(sheet_1.SheetContent, { className: "w-full max-w-2xl" },
                                    React.createElement(sheet_1.SheetHeader, null,
                                        React.createElement(sheet_1.SheetTitle, null,
                                            "Payment Plan - ",
                                            getInvoiceNumber(plan.invoiceId)),
                                        React.createElement(sheet_1.SheetDescription, null, "Installment details and payment history")),
                                    React.createElement(InstallmentsDetail, { planId: plan.id }))),
                            React.createElement(button_1.Button, { size: "sm", variant: "ghost", onClick: function () { return handleToggleStatus(plan); } },
                                React.createElement(lucide_react_1.Edit2, { className: "w-4 h-4" })),
                            React.createElement(button_1.Button, { size: "sm", variant: "ghost", onClick: function () { return setDeleteId(plan.id); } },
                                React.createElement(lucide_react_1.Trash2, { className: "w-4 h-4 text-red-600" })))))); }))))),
            React.createElement(alert_dialog_1.AlertDialog, { open: !!deleteId, onOpenChange: function (open) { return !open && setDeleteId(null); } },
                React.createElement(alert_dialog_1.AlertDialogContent, null,
                    React.createElement(alert_dialog_1.AlertDialogHeader, null,
                        React.createElement(alert_dialog_1.AlertDialogTitle, null, "Delete Payment Plan"),
                        React.createElement(alert_dialog_1.AlertDialogDescription, null, "This will delete the payment plan and all its installment records. This action cannot be undone.")),
                    React.createElement("div", { className: "flex justify-end gap-2" },
                        React.createElement(alert_dialog_1.AlertDialogCancel, null, "Cancel"),
                        React.createElement(alert_dialog_1.AlertDialogAction, { onClick: function () { return deleteId && handleDelete(deleteId); }, className: "bg-red-600" }, "Delete")))))));
}
exports.PaymentPlans = PaymentPlans;
/**
 * Detail view for installments
 */
function InstallmentsDetail(_a) {
    var planId = _a.planId;
    var formatMoney = currency_1.useCurrency().format;
    var plan = trpc_1.trpc.paymentPlans.getById.useQuery(planId).data;
    var invoices = trpc_1.trpc.invoices.list.useQuery({ limit: 500 }).data;
    if (!plan) {
        return React.createElement("div", { className: "text-center py-4" }, "Loading...");
    }
    var invoice = invoices === null || invoices === void 0 ? void 0 : invoices.find(function (i) { return i.id === plan.invoiceId; });
    return (React.createElement("div", { className: "space-y-4 mt-6" },
        React.createElement("div", { className: "grid grid-cols-2 gap-4 text-sm" },
            React.createElement("div", null,
                React.createElement("span", { className: "text-gray-600" }, "Invoice:"),
                React.createElement("p", { className: "font-semibold" }, (invoice === null || invoice === void 0 ? void 0 : invoice.invoiceNumber) || "No invoice")),
            React.createElement("div", null,
                React.createElement("span", { className: "text-gray-600" }, "Invoice Total:"),
                React.createElement("p", { className: "font-semibold" }, formatMoney((invoice === null || invoice === void 0 ? void 0 : invoice.total) || 0))),
            React.createElement("div", null,
                React.createElement("span", { className: "text-gray-600" }, "Status:"),
                React.createElement(badge_1.Badge, { className: "mt-1" }, plan.status)),
            React.createElement("div", null,
                React.createElement("span", { className: "text-gray-600" }, "Progress:"),
                React.createElement("p", { className: "font-semibold" },
                    plan.completedInstallments,
                    "/",
                    plan.numInstallments,
                    " paid"))),
        React.createElement("div", null,
            React.createElement("h3", { className: "font-semibold mb-2" }, "Installments"),
            React.createElement("div", { className: "overflow-x-auto" },
                React.createElement(table_1.Table, null,
                    React.createElement(table_1.TableHeader, null,
                        React.createElement(table_1.TableRow, null,
                            React.createElement(table_1.TableHead, null, "#"),
                            React.createElement(table_1.TableHead, null, "Due Date"),
                            React.createElement(table_1.TableHead, null, "Amount"),
                            React.createElement(table_1.TableHead, null, "Status"),
                            React.createElement(table_1.TableHead, null, "Paid Date"),
                            React.createElement(table_1.TableHead, null, "Paid Amount"))),
                    React.createElement(table_1.TableBody, null, Array.isArray(plan.installments) && plan.installments.map(function (inst) { return (React.createElement(table_1.TableRow, { key: inst.id },
                        React.createElement(table_1.TableCell, { className: "font-medium" }, inst.installmentNumber),
                        React.createElement(table_1.TableCell, null, utils_1.formatDate(inst.dueDate)),
                        React.createElement(table_1.TableCell, null, formatMoney(inst.amount)),
                        React.createElement(table_1.TableCell, null,
                            React.createElement(badge_1.Badge, { variant: inst.status === "paid"
                                    ? "default"
                                    : inst.status === "overdue"
                                        ? "destructive"
                                        : "secondary" }, inst.status)),
                        React.createElement(table_1.TableCell, null, inst.paidDate ? utils_1.formatDate(inst.paidDate) : "-"),
                        React.createElement(table_1.TableCell, null, inst.paidAmount
                            ? formatMoney(inst.paidAmount)
                            : "-"))); }))))),
        plan.notes && (React.createElement("div", { className: "bg-blue-50 p-3 rounded text-sm" },
            React.createElement("strong", null, "Notes:"),
            " ",
            plan.notes))));
}
exports["default"] = PaymentPlans;
