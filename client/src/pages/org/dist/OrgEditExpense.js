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
var OrgLayout_1 = require("@/components/OrgLayout");
var OrgBreadcrumb_1 = require("@/components/OrgBreadcrumb");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var card_1 = require("@/components/ui/card");
var collapsible_1 = require("@/components/ui/collapsible");
var select_1 = require("@/components/ui/select");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
var paymentMethods_1 = require("@/const/paymentMethods");
var useOrgPermission_1 = require("@/hooks/useOrgPermission");
function createEmptyItem() {
    return { id: crypto.randomUUID(), description: "", quantity: 1, rate: 0, taxRate: 0, amount: 0, taxAmount: 0 };
}
function OrgEditExpense() {
    var _this = this;
    var params = wouter_1.useParams();
    var slug = params.slug;
    var expenseId = params.id;
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var hasPermission = useOrgPermission_1.useOrgPermission().hasPermission;
    var canEdit = hasPermission("expenses");
    var utils = trpc_1.trpc.useUtils();
    var _b = react_1.useState(false), isGeneratingPDF = _b[0], setIsGeneratingPDF = _b[1];
    var _c = react_1.useState(null), selectedBudgetAllocation = _c[0], setSelectedBudgetAllocation = _c[1];
    var _d = react_1.useState([createEmptyItem()]), lineItemsData = _d[0], setLineItemsData = _d[1];
    var _e = react_1.useState(false), useLineItems = _e[0], setUseLineItems = _e[1];
    var _f = react_1.useState(false), showAdditionalInfo = _f[0], setShowAdditionalInfo = _f[1];
    var _g = react_1.useState({
        expenseNumber: "",
        category: "",
        vendor: "",
        amount: "",
        expenseDate: new Date().toISOString().split("T")[0],
        paymentMethod: "cash",
        description: "",
        status: "pending",
        chartOfAccountId: "",
        budgetAllocationId: ""
    }), formData = _g[0], setFormData = _g[1];
    // Fetch expense data
    var _h = trpc_1.trpc.expenses.getById.useQuery(expenseId, {
        enabled: !!expenseId
    }), expense = _h.data, isLoadingExpenseData = _h.isLoading;
    // Fetch budget allocations
    var _j = trpc_1.trpc.expenses.getAvailableBudgetAllocations.useQuery(undefined).data, budgetAllocations = _j === void 0 ? [] : _j;
    // Fetch chart of accounts
    var _k = trpc_1.trpc.chartOfAccounts.list.useQuery(undefined).data, chartOfAccounts = _k === void 0 ? [] : _k;
    // Populate form when expense data loads
    react_1.useEffect(function () {
        var _a;
        if (expense) {
            setFormData({
                expenseNumber: expense.expenseNumber || "",
                category: expense.category || "",
                vendor: expense.vendor || "",
                amount: expense.amount ? (expense.amount / 100).toString() : "",
                expenseDate: expense.expenseDate ? new Date(expense.expenseDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
                paymentMethod: expense.paymentMethod || "cash",
                description: expense.description || "",
                status: expense.status || "pending",
                chartOfAccountId: ((_a = expense.chartOfAccountId) === null || _a === void 0 ? void 0 : _a.toString()) || "",
                budgetAllocationId: expense.budgetAllocationId || ""
            });
            // Show description section if it has content
            if (expense.description)
                setShowAdditionalInfo(true);
        }
    }, [expense]);
    var updateExpenseMutation = trpc_1.trpc.expenses.update.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Expense updated successfully!");
            utils.expenses.list.invalidate();
            utils.expenses.getById.invalidate(expenseId);
            navigate("/org/" + slug + "/expenses/" + expenseId);
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to update expense");
        }
    });
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var amount, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    if (!canEdit) {
                        sonner_1.toast.error("You don't have permission to edit expenses");
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    amount = parseFloat(formData.amount) * 100;
                    return [4 /*yield*/, updateExpenseMutation.mutateAsync({
                            id: expenseId,
                            expenseNumber: formData.expenseNumber || undefined,
                            category: formData.category || undefined,
                            vendor: formData.vendor || undefined,
                            amount: amount,
                            expenseDate: new Date(formData.expenseDate),
                            paymentMethod: formData.paymentMethod,
                            description: formData.description || undefined,
                            status: formData.status,
                            chartOfAccountId: formData.chartOfAccountId || undefined,
                            budgetAllocationId: formData.budgetAllocationId || undefined
                        })];
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
    var handleInputChange = function (field, value) {
        setFormData(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[field] = value, _a)));
        });
    };
    if (!canEdit) {
        return (react_1["default"].createElement(OrgLayout_1["default"], null,
            react_1["default"].createElement(OrgBreadcrumb_1["default"], { items: [
                    { label: "Dashboard", href: "/org/" + slug + "/dashboard" },
                    { label: "Expenses", href: "/org/" + slug + "/expenses" },
                    { label: "Access Denied" },
                ] }),
            react_1["default"].createElement("div", { className: "text-center py-12" },
                react_1["default"].createElement(lucide_react_1.AlertCircle, { className: "h-16 w-16 text-red-400 mx-auto mb-4" }),
                react_1["default"].createElement("h2", { className: "text-2xl font-bold text-white mb-2" }, "Access Denied"),
                react_1["default"].createElement("p", { className: "text-white/60 mb-6" }, "You don't have permission to edit expenses."),
                react_1["default"].createElement(button_1.Button, { onClick: function () { return navigate("/org/" + slug + "/expenses"); } },
                    react_1["default"].createElement(lucide_react_1.ArrowLeft, { className: "h-4 w-4 mr-2" }),
                    "Back to Expenses"))));
    }
    if (isLoadingExpenseData) {
        return (react_1["default"].createElement(OrgLayout_1["default"], null,
            react_1["default"].createElement(OrgBreadcrumb_1["default"], { items: [
                    { label: "Dashboard", href: "/org/" + slug + "/dashboard" },
                    { label: "Expenses", href: "/org/" + slug + "/expenses" },
                    { label: "Loading..." },
                ] }),
            react_1["default"].createElement("div", { className: "flex items-center justify-center py-12" },
                react_1["default"].createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin text-blue-500" }))));
    }
    return (react_1["default"].createElement(OrgLayout_1["default"], null,
        react_1["default"].createElement(OrgBreadcrumb_1["default"], { items: [
                { label: "Dashboard", href: "/org/" + slug + "/dashboard" },
                { label: "Expenses", href: "/org/" + slug + "/expenses" },
                { label: (expense === null || expense === void 0 ? void 0 : expense.expenseNumber) || "Expense #" + expenseId.slice(-8), href: "/org/" + slug + "/expenses/" + expenseId },
                { label: "Edit" },
            ] }),
        react_1["default"].createElement("div", { className: "max-w-4xl mx-auto space-y-6" },
            react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                react_1["default"].createElement("div", { className: "flex items-center gap-4" },
                    react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return navigate("/org/" + slug + "/expenses/" + expenseId); } },
                        react_1["default"].createElement(lucide_react_1.ArrowLeft, { className: "h-4 w-4 mr-2" }),
                        "Back"),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("h1", { className: "text-2xl font-bold text-white" }, "Edit Expense"),
                        react_1["default"].createElement("p", { className: "text-white/60" }, (expense === null || expense === void 0 ? void 0 : expense.expenseNumber) || "Expense #" + expenseId.slice(-8))))),
            react_1["default"].createElement("form", { onSubmit: handleSubmit, className: "space-y-6" },
                react_1["default"].createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
                    react_1["default"].createElement(card_1.CardHeader, null,
                        react_1["default"].createElement(card_1.CardTitle, { className: "text-white" }, "Expense Information"),
                        react_1["default"].createElement(card_1.CardDescription, null, "Update the expense details below.")),
                    react_1["default"].createElement(card_1.CardContent, { className: "space-y-6" },
                        react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                            react_1["default"].createElement("div", { className: "space-y-2" },
                                react_1["default"].createElement(label_1.Label, { htmlFor: "expenseNumber", className: "text-white" }, "Expense Number"),
                                react_1["default"].createElement(input_1.Input, { id: "expenseNumber", value: formData.expenseNumber, onChange: function (e) { return handleInputChange("expenseNumber", e.target.value); }, placeholder: "Auto-generated if empty", className: "bg-white/5 border-white/20 text-white" })),
                            react_1["default"].createElement("div", { className: "space-y-2" },
                                react_1["default"].createElement(label_1.Label, { htmlFor: "category", className: "text-white" }, "Category *"),
                                react_1["default"].createElement(input_1.Input, { id: "category", value: formData.category, onChange: function (e) { return handleInputChange("category", e.target.value); }, placeholder: "e.g., Office Supplies, Travel", required: true, className: "bg-white/5 border-white/20 text-white" })),
                            react_1["default"].createElement("div", { className: "space-y-2" },
                                react_1["default"].createElement(label_1.Label, { htmlFor: "vendor", className: "text-white" }, "Vendor *"),
                                react_1["default"].createElement(input_1.Input, { id: "vendor", value: formData.vendor, onChange: function (e) { return handleInputChange("vendor", e.target.value); }, placeholder: "Vendor or supplier name", required: true, className: "bg-white/5 border-white/20 text-white" })),
                            react_1["default"].createElement("div", { className: "space-y-2" },
                                react_1["default"].createElement(label_1.Label, { htmlFor: "amount", className: "text-white" }, "Amount (KES) *"),
                                react_1["default"].createElement(input_1.Input, { id: "amount", type: "number", step: "0.01", value: formData.amount, onChange: function (e) { return handleInputChange("amount", e.target.value); }, placeholder: "0.00", required: true, className: "bg-white/5 border-white/20 text-white" })),
                            react_1["default"].createElement("div", { className: "space-y-2" },
                                react_1["default"].createElement(label_1.Label, { htmlFor: "expenseDate", className: "text-white" }, "Expense Date *"),
                                react_1["default"].createElement(input_1.Input, { id: "expenseDate", type: "date", value: formData.expenseDate, onChange: function (e) { return handleInputChange("expenseDate", e.target.value); }, required: true, className: "bg-white/5 border-white/20 text-white" })),
                            react_1["default"].createElement("div", { className: "space-y-2" },
                                react_1["default"].createElement(label_1.Label, { htmlFor: "paymentMethod", className: "text-white" }, "Payment Method *"),
                                react_1["default"].createElement(select_1.Select, { value: formData.paymentMethod, onValueChange: function (value) { return handleInputChange("paymentMethod", value); } },
                                    react_1["default"].createElement(select_1.SelectTrigger, { className: "bg-white/5 border-white/20 text-white" },
                                        react_1["default"].createElement(select_1.SelectValue, null)),
                                    react_1["default"].createElement(select_1.SelectContent, null, paymentMethods_1.getPaymentMethodOptions().map(function (method) { return (react_1["default"].createElement(select_1.SelectItem, { key: method.value, value: method.value }, method.label)); })))),
                            react_1["default"].createElement("div", { className: "space-y-2" },
                                react_1["default"].createElement(label_1.Label, { htmlFor: "status", className: "text-white" }, "Status"),
                                react_1["default"].createElement(select_1.Select, { value: formData.status, onValueChange: function (value) { return handleInputChange("status", value); } },
                                    react_1["default"].createElement(select_1.SelectTrigger, { className: "bg-white/5 border-white/20 text-white" },
                                        react_1["default"].createElement(select_1.SelectValue, null)),
                                    react_1["default"].createElement(select_1.SelectContent, null,
                                        react_1["default"].createElement(select_1.SelectItem, { value: "pending" }, "Pending"),
                                        react_1["default"].createElement(select_1.SelectItem, { value: "approved" }, "Approved"),
                                        react_1["default"].createElement(select_1.SelectItem, { value: "rejected" }, "Rejected"))))),
                        react_1["default"].createElement("div", { className: "space-y-2" },
                            react_1["default"].createElement(label_1.Label, { htmlFor: "chartOfAccountId", className: "text-white" }, "Chart of Account"),
                            react_1["default"].createElement(select_1.Select, { value: formData.chartOfAccountId, onValueChange: function (value) { return handleInputChange("chartOfAccountId", value); } },
                                react_1["default"].createElement(select_1.SelectTrigger, { className: "bg-white/5 border-white/20 text-white" },
                                    react_1["default"].createElement(select_1.SelectValue, { placeholder: "Select account" })),
                                react_1["default"].createElement(select_1.SelectContent, null, chartOfAccounts.map(function (account) { return (react_1["default"].createElement(select_1.SelectItem, { key: account.id, value: account.id.toString() }, account.name)); })))),
                        react_1["default"].createElement("div", { className: "space-y-2" },
                            react_1["default"].createElement(label_1.Label, { htmlFor: "budgetAllocationId", className: "text-white" }, "Budget Allocation"),
                            react_1["default"].createElement(select_1.Select, { value: formData.budgetAllocationId, onValueChange: function (value) { return handleInputChange("budgetAllocationId", value); } },
                                react_1["default"].createElement(select_1.SelectTrigger, { className: "bg-white/5 border-white/20 text-white" },
                                    react_1["default"].createElement(select_1.SelectValue, { placeholder: "Select budget allocation" })),
                                react_1["default"].createElement(select_1.SelectContent, null, budgetAllocations.map(function (budget) { return (react_1["default"].createElement(select_1.SelectItem, { key: budget.id, value: budget.id }, budget.name)); })))),
                        react_1["default"].createElement(collapsible_1.Collapsible, { open: showAdditionalInfo, onOpenChange: setShowAdditionalInfo },
                            react_1["default"].createElement(collapsible_1.CollapsibleTrigger, { asChild: true },
                                react_1["default"].createElement(button_1.Button, { variant: "ghost", className: "flex items-center gap-2 text-white/60 hover:text-white" },
                                    showAdditionalInfo ? react_1["default"].createElement(lucide_react_1.ChevronUp, { className: "h-4 w-4" }) : react_1["default"].createElement(lucide_react_1.ChevronDown, { className: "h-4 w-4" }),
                                    "Additional Information")),
                            react_1["default"].createElement(collapsible_1.CollapsibleContent, { className: "space-y-4 mt-4" },
                                react_1["default"].createElement("div", { className: "space-y-2" },
                                    react_1["default"].createElement(label_1.Label, { htmlFor: "description", className: "text-white" }, "Description"),
                                    react_1["default"].createElement(textarea_1.Textarea, { id: "description", value: formData.description, onChange: function (e) { return handleInputChange("description", e.target.value); }, placeholder: "Additional details about the expense...", rows: 3, className: "bg-white/5 border-white/20 text-white" })))))),
                react_1["default"].createElement("div", { className: "flex items-center justify-end gap-4" },
                    react_1["default"].createElement(button_1.Button, { type: "button", variant: "outline", onClick: function () { return navigate("/org/" + slug + "/expenses/" + expenseId); } }, "Cancel"),
                    react_1["default"].createElement(button_1.Button, { type: "submit", disabled: updateExpenseMutation.isLoading, className: "bg-blue-600 hover:bg-blue-700" }, updateExpenseMutation.isLoading ? (react_1["default"].createElement(react_1["default"].Fragment, null,
                        react_1["default"].createElement(lucide_react_1.Loader2, { className: "h-4 w-4 mr-2 animate-spin" }),
                        "Saving...")) : (react_1["default"].createElement(react_1["default"].Fragment, null,
                        react_1["default"].createElement(lucide_react_1.Save, { className: "h-4 w-4 mr-2" }),
                        "Save Changes"))))))));
}
exports["default"] = OrgEditExpense;
