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
exports.RecurringExpenses = void 0;
var react_1 = require("react");
var trpc_1 = require("@/lib/trpc");
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
var utils_1 = require("@/lib/utils");
var lucide_react_1 = require("lucide-react");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var sonner_1 = require("sonner");
var stats_card_1 = require("@/components/ui/stats-card");
var EXPENSE_CATEGORIES = [
    "Rent", "Utilities", "Internet", "Software Subscriptions", "Insurance",
    "Hosting & Cloud", "Marketing", "Office Supplies", "Salaries",
    "Telecommunications", "Maintenance", "Security", "Cleaning",
    "Transportation", "Professional Services", "Other",
];
function RecurringExpenses() {
    var _this = this;
    var _a = react_1.useState(false), isOpen = _a[0], setIsOpen = _a[1];
    var _b = react_1.useState(null), editingId = _b[0], setEditingId = _b[1];
    var _c = react_1.useState(null), deleteId = _c[0], setDeleteId = _c[1];
    var _d = react_1.useState(""), searchTerm = _d[0], setSearchTerm = _d[1];
    var _e = react_1.useState("all"), statusFilter = _e[0], setStatusFilter = _e[1];
    var _f = react_1.useState({
        category: "",
        vendor: "",
        amount: "",
        description: "",
        paymentMethod: "",
        frequency: "monthly",
        startDate: new Date().toISOString().split("T")[0],
        endDate: "",
        dayOfMonth: "1",
        reminderDaysBefore: "3"
    }), formData = _f[0], setFormData = _f[1];
    // Fetch data
    var _g = trpc_1.trpc.expenses.listRecurringExpenses.useQuery(), recurringList = _g.data, refetch = _g.refetch;
    // Mutations
    var createMutation = trpc_1.trpc.expenses.createRecurringExpense.useMutation({
        onSuccess: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sonner_1.toast.success("Recurring expense created");
                        setIsOpen(false);
                        resetForm();
                        return [4 /*yield*/, refetch()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); },
        onError: function (error) { return sonner_1.toast.error(error.message || "Failed to create recurring expense"); }
    });
    var updateMutation = trpc_1.trpc.expenses.updateRecurringExpense.useMutation({
        onSuccess: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sonner_1.toast.success("Recurring expense updated");
                        setIsOpen(false);
                        setEditingId(null);
                        resetForm();
                        return [4 /*yield*/, refetch()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); },
        onError: function (error) { return sonner_1.toast.error(error.message || "Failed to update recurring expense"); }
    });
    var deleteMutation = trpc_1.trpc.expenses.deleteRecurringExpense.useMutation({
        onSuccess: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sonner_1.toast.success("Recurring expense deleted");
                        setDeleteId(null);
                        return [4 /*yield*/, refetch()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); },
        onError: function (error) { return sonner_1.toast.error(error.message || "Failed to delete"); }
    });
    var toggleActiveMutation = trpc_1.trpc.expenses.toggleRecurringExpenseActive.useMutation({
        onSuccess: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sonner_1.toast.success("Status updated");
                        return [4 /*yield*/, refetch()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); },
        onError: function (error) { return sonner_1.toast.error(error.message || "Failed to update status"); }
    });
    var triggerMutation = trpc_1.trpc.expenses.triggerRecurringExpenseGeneration.useMutation({
        onSuccess: function (result) {
            sonner_1.toast.success("Expense " + result.expenseNumber + " generated");
            refetch();
        },
        onError: function (error) { return sonner_1.toast.error(error.message || "Failed to generate expense"); }
    });
    // Helpers
    var resetForm = function () {
        setFormData({
            category: "",
            vendor: "",
            amount: "",
            description: "",
            paymentMethod: "",
            frequency: "monthly",
            startDate: new Date().toISOString().split("T")[0],
            endDate: "",
            dayOfMonth: "1",
            reminderDaysBefore: "3"
        });
    };
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var amountCents;
        return __generator(this, function (_a) {
            e.preventDefault();
            if (!formData.category || !formData.amount) {
                sonner_1.toast.error("Please fill in all required fields");
                return [2 /*return*/];
            }
            amountCents = Math.round(parseFloat(formData.amount) * 100);
            if (isNaN(amountCents) || amountCents <= 0) {
                sonner_1.toast.error("Please enter a valid amount");
                return [2 /*return*/];
            }
            if (editingId) {
                updateMutation.mutate({
                    id: editingId,
                    amount: amountCents,
                    frequency: formData.frequency,
                    endDate: formData.endDate ? formData.endDate + "T00:00:00Z" : undefined,
                    reminderDaysBefore: parseInt(formData.reminderDaysBefore) || 3
                });
            }
            else {
                createMutation.mutate({
                    category: formData.category,
                    vendor: formData.vendor || undefined,
                    amount: amountCents,
                    description: formData.description || undefined,
                    paymentMethod: formData.paymentMethod || undefined,
                    frequency: formData.frequency,
                    startDate: formData.startDate + "T00:00:00Z",
                    endDate: formData.endDate ? formData.endDate + "T00:00:00Z" : undefined,
                    dayOfMonth: parseInt(formData.dayOfMonth) || 1,
                    reminderDaysBefore: parseInt(formData.reminderDaysBefore) || 3
                });
            }
            return [2 /*return*/];
        });
    }); };
    var handleEdit = function (rec) {
        var _a, _b, _c, _d;
        setFormData({
            category: rec.category,
            vendor: rec.vendor || "",
            amount: (rec.amount / 100).toString(),
            description: rec.description || "",
            paymentMethod: rec.paymentMethod || "",
            frequency: rec.frequency,
            startDate: ((_a = rec.startDate) === null || _a === void 0 ? void 0 : _a.split("T")[0]) || ((_b = rec.startDate) === null || _b === void 0 ? void 0 : _b.split(" ")[0]) || "",
            endDate: rec.endDate ? (rec.endDate.split("T")[0] || rec.endDate.split(" ")[0]) : "",
            dayOfMonth: String((_c = rec.dayOfMonth) !== null && _c !== void 0 ? _c : 1),
            reminderDaysBefore: String((_d = rec.reminderDaysBefore) !== null && _d !== void 0 ? _d : 3)
        });
        setEditingId(rec.id);
        setIsOpen(true);
    };
    var handleDelete = function (id) {
        deleteMutation.mutate({ id: id });
    };
    // Filtered + searched data
    var filteredList = react_1.useMemo(function () {
        if (!recurringList)
            return [];
        return recurringList.filter(function (rec) {
            if (statusFilter === "active" && !rec.isActive)
                return false;
            if (statusFilter === "inactive" && rec.isActive)
                return false;
            if (searchTerm) {
                var term = searchTerm.toLowerCase();
                return (rec.category.toLowerCase().includes(term) ||
                    (rec.vendor || "").toLowerCase().includes(term) ||
                    (rec.description || "").toLowerCase().includes(term));
            }
            return true;
        });
    }, [recurringList, statusFilter, searchTerm]);
    var stats = react_1.useMemo(function () {
        if (!recurringList)
            return { total: 0, active: 0, inactive: 0, monthlyTotal: 0 };
        var list = recurringList;
        var activeList = list.filter(function (r) { return r.isActive; });
        // Estimate monthly total from active recurring expenses
        var monthlyTotal = activeList.reduce(function (sum, r) {
            var multiplier = {
                weekly: 4.33, biweekly: 2.17, monthly: 1, quarterly: 0.33, annually: 0.083
            };
            return sum + r.amount * (multiplier[r.frequency] || 1);
        }, 0);
        return {
            total: list.length,
            active: activeList.length,
            inactive: list.length - activeList.length,
            monthlyTotal: monthlyTotal
        };
    }, [recurringList]);
    var isDueSoon = function (nextDueDate) {
        var due = new Date(nextDueDate);
        var now = new Date();
        var diffDays = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        return diffDays <= 3 && diffDays >= 0;
    };
    var isOverdue = function (nextDueDate) {
        return new Date(nextDueDate) < new Date();
    };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Recurring Expenses", description: "Manage automated recurring expense generation", icon: React.createElement(lucide_react_1.RefreshCw, { className: "h-6 w-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/" },
            { label: "Expenses", href: "/expenses" },
            { label: "Recurring" },
        ] },
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "flex items-center justify-between gap-4" },
                React.createElement("div", { className: "flex items-center gap-2 flex-1" },
                    React.createElement("div", { className: "relative flex-1 max-w-sm" },
                        React.createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" }),
                        React.createElement(input_1.Input, { placeholder: "Search by category, vendor...", value: searchTerm, onChange: function (e) { return setSearchTerm(e.target.value); }, className: "pl-9" })),
                    React.createElement(select_1.Select, { value: statusFilter, onValueChange: function (v) { return setStatusFilter(v); } },
                        React.createElement(select_1.SelectTrigger, { className: "w-[140px]" },
                            React.createElement(select_1.SelectValue, null)),
                        React.createElement(select_1.SelectContent, null,
                            React.createElement(select_1.SelectItem, { value: "all" }, "All Status"),
                            React.createElement(select_1.SelectItem, { value: "active" }, "Active"),
                            React.createElement(select_1.SelectItem, { value: "inactive" }, "Inactive")))),
                React.createElement(dialog_1.Dialog, { open: isOpen, onOpenChange: function (open) {
                        setIsOpen(open);
                        if (!open) {
                            setEditingId(null);
                            resetForm();
                        }
                    } },
                    React.createElement(dialog_1.DialogTrigger, { asChild: true },
                        React.createElement(button_1.Button, null,
                            React.createElement(lucide_react_1.Plus, { className: "w-4 h-4 mr-2" }),
                            "New Recurring Expense")),
                    React.createElement(dialog_1.DialogContent, { className: "w-full max-w-lg max-h-[90vh] overflow-y-auto" },
                        React.createElement(dialog_1.DialogHeader, null,
                            React.createElement(dialog_1.DialogTitle, null,
                                editingId ? "Edit" : "Create",
                                " Recurring Expense"),
                            React.createElement(dialog_1.DialogDescription, null, editingId
                                ? "Update the recurring expense settings"
                                : "Set up a new recurring expense that auto-generates expenses on schedule")),
                        React.createElement("form", { onSubmit: handleSubmit, className: "space-y-4" },
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null, "Category *"),
                                React.createElement(select_1.Select, { value: formData.category, onValueChange: function (v) { return setFormData(__assign(__assign({}, formData), { category: v })); }, disabled: !!editingId },
                                    React.createElement(select_1.SelectTrigger, null,
                                        React.createElement(select_1.SelectValue, { placeholder: "Select category" })),
                                    React.createElement(select_1.SelectContent, null, EXPENSE_CATEGORIES.map(function (cat) { return (React.createElement(select_1.SelectItem, { key: cat, value: cat }, cat)); })))),
                            !editingId && (React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null, "Vendor"),
                                React.createElement(input_1.Input, { value: formData.vendor, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { vendor: e.target.value })); }, placeholder: "e.g., Safaricom, Kenya Power" }))),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null, "Amount (KES) *"),
                                React.createElement(input_1.Input, { type: "number", min: "0", step: "0.01", value: formData.amount, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { amount: e.target.value })); }, placeholder: "e.g., 5000" })),
                            !editingId && (React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null, "Payment Method"),
                                React.createElement(select_1.Select, { value: formData.paymentMethod, onValueChange: function (v) { return setFormData(__assign(__assign({}, formData), { paymentMethod: v })); } },
                                    React.createElement(select_1.SelectTrigger, null,
                                        React.createElement(select_1.SelectValue, { placeholder: "Select method" })),
                                    React.createElement(select_1.SelectContent, null,
                                        React.createElement(select_1.SelectItem, { value: "cash" }, "Cash"),
                                        React.createElement(select_1.SelectItem, { value: "card" }, "Card"),
                                        React.createElement(select_1.SelectItem, { value: "bank_transfer" }, "Bank Transfer"),
                                        React.createElement(select_1.SelectItem, { value: "mpesa" }, "M-Pesa"),
                                        React.createElement(select_1.SelectItem, { value: "cheque" }, "Cheque"),
                                        React.createElement(select_1.SelectItem, { value: "other" }, "Other"),
                                        React.createElement(select_1.SelectItem, { value: "other" }, "Other"))))),
                            React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null, "Frequency *"),
                                React.createElement(select_1.Select, { value: formData.frequency, onValueChange: function (v) { return setFormData(__assign(__assign({}, formData), { frequency: v })); } },
                                    React.createElement(select_1.SelectTrigger, null,
                                        React.createElement(select_1.SelectValue, null)),
                                    React.createElement(select_1.SelectContent, null,
                                        React.createElement(select_1.SelectItem, { value: "weekly" }, "Weekly"),
                                        React.createElement(select_1.SelectItem, { value: "biweekly" }, "Bi-weekly"),
                                        React.createElement(select_1.SelectItem, { value: "monthly" }, "Monthly"),
                                        React.createElement(select_1.SelectItem, { value: "quarterly" }, "Quarterly"),
                                        React.createElement(select_1.SelectItem, { value: "annually" }, "Annually")))),
                            React.createElement("div", { className: "grid grid-cols-2 gap-4" },
                                !editingId && (React.createElement("div", { className: "space-y-2" },
                                    React.createElement(label_1.Label, null, "Start Date *"),
                                    React.createElement(input_1.Input, { type: "date", value: formData.startDate, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { startDate: e.target.value })); } }))),
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement(label_1.Label, null, "End Date"),
                                    React.createElement(input_1.Input, { type: "date", value: formData.endDate, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { endDate: e.target.value })); } }))),
                            React.createElement("div", { className: "grid grid-cols-2 gap-4" },
                                !editingId && (React.createElement("div", { className: "space-y-2" },
                                    React.createElement(label_1.Label, null, "Day of Month"),
                                    React.createElement(input_1.Input, { type: "number", min: "1", max: "28", value: formData.dayOfMonth, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { dayOfMonth: e.target.value })); } }))),
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement(label_1.Label, null, "Reminder (days before)"),
                                    React.createElement(input_1.Input, { type: "number", min: "0", max: "30", value: formData.reminderDaysBefore, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { reminderDaysBefore: e.target.value })); } }))),
                            !editingId && (React.createElement("div", { className: "space-y-2" },
                                React.createElement(label_1.Label, null, "Description"),
                                React.createElement(textarea_1.Textarea, { value: formData.description, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { description: e.target.value })); }, placeholder: "e.g., Monthly internet bill", rows: 2 }))),
                            React.createElement(button_1.Button, { type: "submit", className: "w-full", disabled: createMutation.isPending || updateMutation.isPending },
                                createMutation.isPending || updateMutation.isPending ? "Saving..." : (editingId ? "Update" : "Create"),
                                " Recurring Expense"))))),
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4" },
                React.createElement(stats_card_1.StatsCard, { label: "Total", value: stats.total, color: "border-l-purple-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Active", value: stats.active, color: "border-l-green-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Inactive", value: stats.inactive, color: "border-l-gray-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Est. Monthly", value: utils_1.formatCurrency(stats.monthlyTotal / 100), color: "border-l-blue-500" })),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Recurring Expense List"),
                    React.createElement(card_1.CardDescription, null,
                        filteredList.length,
                        " recurring expense",
                        filteredList.length !== 1 ? "s" : "",
                        " configured")),
                React.createElement(card_1.CardContent, null, filteredList.length === 0 ? (React.createElement("div", { className: "text-center py-8 text-muted-foreground" }, (recurringList === null || recurringList === void 0 ? void 0 : recurringList.length) ? "No matching results." : "No recurring expenses yet. Create one to get started.")) : (React.createElement("div", { className: "overflow-x-auto" },
                    React.createElement(table_1.Table, null,
                        React.createElement(table_1.TableHeader, null,
                            React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableHead, { className: "px-2 sm:px-3 text-xs sm:text-sm" }, "Category"),
                                React.createElement(table_1.TableHead, { className: "px-2 sm:px-3 text-xs sm:text-sm" }, "Vendor"),
                                React.createElement(table_1.TableHead, { className: "text-right px-2 sm:px-3 text-xs sm:text-sm" }, "Amount"),
                                React.createElement(table_1.TableHead, { className: "px-2 sm:px-3 text-xs sm:text-sm" }, "Frequency"),
                                React.createElement(table_1.TableHead, { className: "hidden md:table-cell px-2 sm:px-3 text-xs sm:text-sm" }, "Next Due"),
                                React.createElement(table_1.TableHead, { className: "hidden lg:table-cell px-2 sm:px-3 text-xs sm:text-sm" }, "Last Generated"),
                                React.createElement(table_1.TableHead, { className: "px-2 sm:px-3 text-xs sm:text-sm" }, "Status"),
                                React.createElement(table_1.TableHead, { className: "text-right px-2 sm:px-3" }, "Actions"))),
                        React.createElement(table_1.TableBody, null, filteredList.map(function (rec) { return (React.createElement(table_1.TableRow, { key: rec.id },
                            React.createElement(table_1.TableCell, { className: "px-2 sm:px-3 text-xs sm:text-sm font-medium" }, rec.category),
                            React.createElement(table_1.TableCell, { className: "px-2 sm:px-3 text-xs sm:text-sm text-muted-foreground" }, rec.vendor || "—"),
                            React.createElement(table_1.TableCell, { className: "text-right px-2 sm:px-3 text-xs sm:text-sm font-mono" }, utils_1.formatCurrency(rec.amount)),
                            React.createElement(table_1.TableCell, { className: "px-2 sm:px-3 text-xs sm:text-sm" },
                                React.createElement(badge_1.Badge, { variant: "outline", className: "capitalize" }, rec.frequency)),
                            React.createElement(table_1.TableCell, { className: "hidden md:table-cell px-2 sm:px-3 text-xs sm:text-sm" },
                                React.createElement("span", { className: isOverdue(rec.nextDueDate) ? "text-red-600 font-semibold" :
                                        isDueSoon(rec.nextDueDate) ? "text-orange-600 font-medium" : "" },
                                    utils_1.formatDate(rec.nextDueDate),
                                    isOverdue(rec.nextDueDate) && (React.createElement(badge_1.Badge, { variant: "destructive", className: "ml-2 text-xs" }, "Overdue")),
                                    !isOverdue(rec.nextDueDate) && isDueSoon(rec.nextDueDate) && (React.createElement(badge_1.Badge, { variant: "secondary", className: "ml-2 text-xs" }, "Due Soon")))),
                            React.createElement(table_1.TableCell, { className: "hidden lg:table-cell px-2 sm:px-3 text-xs sm:text-sm" }, rec.lastGeneratedDate ? utils_1.formatDate(rec.lastGeneratedDate) : "Never"),
                            React.createElement(table_1.TableCell, { className: "px-2 sm:px-3 text-xs sm:text-sm" },
                                React.createElement(badge_1.Badge, { variant: rec.isActive ? "default" : "secondary" }, rec.isActive ? "Active" : "Inactive")),
                            React.createElement(table_1.TableCell, null,
                                React.createElement("div", { className: "flex gap-1" },
                                    React.createElement(button_1.Button, { size: "sm", variant: "ghost", onClick: function () { return handleEdit(rec); }, title: "Edit" },
                                        React.createElement(lucide_react_1.Edit2, { className: "w-4 h-4" })),
                                    React.createElement(button_1.Button, { size: "sm", variant: "ghost", onClick: function () { return toggleActiveMutation.mutate({ id: rec.id, isActive: !rec.isActive }); }, title: rec.isActive ? "Deactivate" : "Activate" },
                                        React.createElement(lucide_react_1.Clock, { className: "w-4 h-4" })),
                                    React.createElement(button_1.Button, { size: "sm", variant: "ghost", onClick: function () { return triggerMutation.mutate(rec.id); }, disabled: triggerMutation.isPending, title: "Generate expense now" },
                                        React.createElement(lucide_react_1.Play, { className: "w-4 h-4" })),
                                    React.createElement(button_1.Button, { size: "sm", variant: "ghost", onClick: function () { return setDeleteId(rec.id); }, title: "Delete" },
                                        React.createElement(lucide_react_1.Trash2, { className: "w-4 h-4 text-red-600" })))))); }))))))),
            React.createElement(alert_dialog_1.AlertDialog, { open: !!deleteId, onOpenChange: function (open) { return !open && setDeleteId(null); } },
                React.createElement(alert_dialog_1.AlertDialogContent, null,
                    React.createElement(alert_dialog_1.AlertDialogHeader, null,
                        React.createElement(alert_dialog_1.AlertDialogTitle, null, "Delete Recurring Expense"),
                        React.createElement(alert_dialog_1.AlertDialogDescription, null, "This will permanently delete this recurring expense rule. Previously generated expenses will not be affected.")),
                    React.createElement("div", { className: "flex justify-end gap-2" },
                        React.createElement(alert_dialog_1.AlertDialogCancel, null, "Cancel"),
                        React.createElement(alert_dialog_1.AlertDialogAction, { onClick: function () { return deleteId && handleDelete(deleteId); }, className: "bg-red-600 hover:bg-red-700" }, "Delete")))))));
}
exports.RecurringExpenses = RecurringExpenses;
exports["default"] = RecurringExpenses;
