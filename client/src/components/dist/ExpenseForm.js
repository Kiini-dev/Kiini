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
exports.ExpenseForm = void 0;
var react_1 = require("react");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var select_1 = require("@/components/ui/select");
var card_1 = require("@/components/ui/card");
var sonner_1 = require("sonner");
var trpc_1 = require("@/lib/trpc");
var lucide_react_1 = require("lucide-react");
var paymentMethods_1 = require("@/const/paymentMethods");
function ExpenseForm(_a) {
    var onSuccess = _a.onSuccess, onCancel = _a.onCancel, initialData = _a.initialData;
    var _b = react_1.useState({
        expenseDate: (initialData === null || initialData === void 0 ? void 0 : initialData.expenseDate) || new Date().toISOString().split("T")[0],
        category: (initialData === null || initialData === void 0 ? void 0 : initialData.category) || "",
        description: (initialData === null || initialData === void 0 ? void 0 : initialData.description) || "",
        amount: (initialData === null || initialData === void 0 ? void 0 : initialData.amount) || "",
        paymentMethod: (initialData === null || initialData === void 0 ? void 0 : initialData.paymentMethod) || "cash",
        status: (initialData === null || initialData === void 0 ? void 0 : initialData.status) || "pending",
        chartOfAccountId: (initialData === null || initialData === void 0 ? void 0 : initialData.chartOfAccountId) || "",
        budgetAllocationId: (initialData === null || initialData === void 0 ? void 0 : initialData.budgetAllocationId) || ""
    }), formData = _b[0], setFormData = _b[1];
    // Fetch Chart of Accounts
    var _c = trpc_1.trpc.chartOfAccounts.list.useQuery({}), chartOfAccounts = _c.data, isLoadingCOA = _c.isLoading;
    // Fetch Budget Allocations
    var _d = trpc_1.trpc.expenses.getAvailableBudgetAllocations.useQuery({}), budgetAllocations = _d.data, isLoadingBudgets = _d.isLoading;
    var createExpenseMutation = trpc_1.trpc.expenses.create.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Expense created successfully");
            setFormData({
                expenseDate: new Date().toISOString().split("T")[0],
                category: "",
                description: "",
                amount: "",
                paymentMethod: "cash",
                status: "pending",
                chartOfAccountId: ""
            });
            onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to create expense");
        }
    });
    var updateExpenseMutation = trpc_1.trpc.expenses.update.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Expense updated successfully");
            onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to update expense");
        }
    });
    var handleSubmit = function (e) {
        e.preventDefault();
        if (!formData.category || !formData.amount || !formData.chartOfAccountId) {
            sonner_1.toast.error("Please fill in all required fields including Chart of Account");
            return;
        }
        var expenseData = {
            expenseDate: new Date(formData.expenseDate).toISOString().split("T")[0],
            category: formData.category,
            description: formData.description,
            amount: Math.round(parseFloat(formData.amount) * 100),
            paymentMethod: formData.paymentMethod,
            status: formData.status,
            chartOfAccountId: parseInt(formData.chartOfAccountId),
            budgetAllocationId: formData.budgetAllocationId || undefined
        };
        if (initialData === null || initialData === void 0 ? void 0 : initialData.id) {
            updateExpenseMutation.mutate(__assign({ id: initialData.id }, expenseData));
        }
        else {
            createExpenseMutation.mutate(expenseData);
        }
    };
    var isLoading = createExpenseMutation.isPending || updateExpenseMutation.isPending;
    return (React.createElement(card_1.Card, null,
        React.createElement(card_1.CardHeader, null,
            React.createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                React.createElement(lucide_react_1.DollarSign, { className: "h-5 w-5" }),
                initialData ? "Edit Expense" : "Create New Expense"),
            React.createElement(card_1.CardDescription, null, initialData ? "Update expense details" : "Add a new expense to your records")),
        React.createElement(card_1.CardContent, null,
            React.createElement("form", { onSubmit: handleSubmit, className: "space-y-6" },
                React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, { htmlFor: "expenseDate" }, "Expense Date *"),
                        React.createElement(input_1.Input, { id: "expenseDate", type: "date", value: formData.expenseDate, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { expenseDate: e.target.value })); }, required: true })),
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, { htmlFor: "category" }, "Category *"),
                        React.createElement(input_1.Input, { id: "category", placeholder: "e.g., Office Supplies, Travel, Meals", value: formData.category, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { category: e.target.value })); }, required: true })),
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, { htmlFor: "chartOfAccount" }, "Chart of Account *"),
                        React.createElement(select_1.Select, { value: formData.chartOfAccountId, onValueChange: function (value) { return setFormData(__assign(__assign({}, formData), { chartOfAccountId: value })); }, disabled: isLoadingCOA },
                            React.createElement(select_1.SelectTrigger, { id: "chartOfAccount" },
                                React.createElement(select_1.SelectValue, { placeholder: "Select account" })),
                            React.createElement(select_1.SelectContent, null, Array.isArray(chartOfAccounts) && chartOfAccounts.map(function (account) { return (React.createElement(select_1.SelectItem, { key: account.id, value: account.id.toString() },
                                account.accountCode,
                                " - ",
                                account.accountName)); })))),
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, { htmlFor: "budgetAllocation" }, "Budget Allocation (Optional)"),
                        React.createElement(select_1.Select, { value: formData.budgetAllocationId, onValueChange: function (value) {
                                return setFormData(__assign(__assign({}, formData), { 
                                    // convert our "none" sentinel back to an empty string
                                    budgetAllocationId: value === "none" ? "" : value }));
                            }, disabled: isLoadingBudgets },
                            React.createElement(select_1.SelectTrigger, { id: "budgetAllocation" },
                                React.createElement(select_1.SelectValue, { placeholder: "Select budget allocation" })),
                            React.createElement(select_1.SelectContent, null,
                                React.createElement(select_1.SelectItem, { value: "none" }, "No Budget Allocation"),
                                Array.isArray(budgetAllocations) && budgetAllocations.map(function (budget) { return (React.createElement(select_1.SelectItem, { key: budget.id, value: budget.id },
                                    budget.categoryName,
                                    " - Ksh ",
                                    (budget.remaining / 100).toLocaleString('en-KE'))); }))),
                        formData.budgetAllocationId && budgetAllocations && (React.createElement("p", { className: "text-sm text-gray-600" }, (function () {
                            var alloc = budgetAllocations.find(function (b) { return b.id === formData.budgetAllocationId; });
                            return alloc ? "Remaining: Ksh " + (alloc.remaining / 100).toLocaleString('en-KE') : "";
                        })()))),
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, { htmlFor: "amount" }, "Amount (Ksh) *"),
                        React.createElement(input_1.Input, { id: "amount", type: "number", placeholder: "0.00", step: "0.01", min: "0", value: formData.amount, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { amount: e.target.value })); }, required: true })),
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, { htmlFor: "paymentMethod" }, "Payment Method"),
                        React.createElement(select_1.Select, { value: formData.paymentMethod, onValueChange: function (value) { return setFormData(__assign(__assign({}, formData), { paymentMethod: value })); } },
                            React.createElement(select_1.SelectTrigger, { id: "paymentMethod" },
                                React.createElement(select_1.SelectValue, null)),
                            React.createElement(select_1.SelectContent, null, paymentMethods_1.getPaymentMethodOptions().map(function (method) { return (React.createElement(select_1.SelectItem, { key: method.value, value: method.value }, method.label)); })))),
                    React.createElement("div", { className: "space-y-2" },
                        React.createElement(label_1.Label, { htmlFor: "status" }, "Status"),
                        React.createElement(select_1.Select, { value: formData.status, onValueChange: function (value) { return setFormData(__assign(__assign({}, formData), { status: value })); } },
                            React.createElement(select_1.SelectTrigger, { id: "status" },
                                React.createElement(select_1.SelectValue, null)),
                            React.createElement(select_1.SelectContent, null,
                                React.createElement(select_1.SelectItem, { value: "pending" }, "Pending"),
                                React.createElement(select_1.SelectItem, { value: "approved" }, "Approved"),
                                React.createElement(select_1.SelectItem, { value: "rejected" }, "Rejected"),
                                React.createElement(select_1.SelectItem, { value: "paid" }, "Paid"))))),
                React.createElement("div", { className: "space-y-2" },
                    React.createElement(label_1.Label, { htmlFor: "description" }, "Description"),
                    React.createElement(textarea_1.Textarea, { id: "description", placeholder: "Add any additional details about this expense...", value: formData.description, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { description: e.target.value })); }, rows: 4 })),
                React.createElement("div", { className: "flex gap-2 justify-end pt-4 border-t" },
                    onCancel && (React.createElement(button_1.Button, { type: "button", variant: "outline", onClick: onCancel, disabled: isLoading }, "Cancel")),
                    React.createElement(button_1.Button, { type: "submit", disabled: isLoading },
                        isLoading && React.createElement(lucide_react_1.Loader2, { className: "h-4 w-4 mr-2 animate-spin" }),
                        initialData ? "Update Expense" : "Create Expense"))))));
}
exports.ExpenseForm = ExpenseForm;
