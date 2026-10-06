"use strict";
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var card_1 = require("@/components/ui/card");
var select_1 = require("@/components/ui/select");
var label_1 = require("@/components/ui/label");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var currency_1 = require("@/lib/currency");
function CreateBudget() {
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var _b = react_1.useState(""), departmentId = _b[0], setDepartmentId = _b[1];
    var _c = react_1.useState(""), amount = _c[0], setAmount = _c[1];
    var _d = react_1.useState(new Date().getFullYear().toString()), fiscalYear = _d[0], setFiscalYear = _d[1];
    var departments = trpc_1.trpc.departments.list.useQuery({}).data;
    var currencyCode = currency_1.useCurrencySettings().code;
    var createBudgetMutation = trpc_1.trpc.budgets.create.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Budget created successfully");
            navigate("/budgets");
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to create budget");
        }
    });
    var handleSubmit = function (e) {
        e.preventDefault();
        if (!departmentId || !amount || !fiscalYear) {
            sonner_1.toast.error("Please fill in all required fields");
            return;
        }
        var parsedAmount = Math.round(parseFloat(amount));
        createBudgetMutation.mutate({
            departmentId: departmentId,
            amount: parsedAmount,
            remaining: parsedAmount,
            fiscalYear: parseInt(fiscalYear)
        });
    };
    var currentYear = new Date().getFullYear();
    var years = Array.from({ length: 5 }, function (_, i) { return currentYear - 2 + i; });
    return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: "Create Budget", description: "Set up a new departmental budget", icon: react_1["default"].createElement(lucide_react_1.Plus, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Budgets", href: "/budgets" },
            { label: "Create" },
        ], backLink: { label: "Budgets", href: "/budgets" } },
        react_1["default"].createElement("div", { className: "max-w-2xl" },
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardHeader, null,
                    react_1["default"].createElement(card_1.CardTitle, null, "Budget Details")),
                react_1["default"].createElement(card_1.CardContent, null,
                    react_1["default"].createElement("form", { onSubmit: handleSubmit, className: "space-y-6" },
                        react_1["default"].createElement("div", { className: "space-y-2" },
                            react_1["default"].createElement(label_1.Label, { htmlFor: "department" }, "Department *"),
                            react_1["default"].createElement(select_1.Select, { value: departmentId, onValueChange: setDepartmentId },
                                react_1["default"].createElement(select_1.SelectTrigger, { id: "department" },
                                    react_1["default"].createElement(select_1.SelectValue, { placeholder: "Select a department" })),
                                react_1["default"].createElement(select_1.SelectContent, null, departments === null || departments === void 0 ? void 0 : departments.map(function (dept) { return (react_1["default"].createElement(select_1.SelectItem, { key: dept.id, value: dept.id }, dept.name)); })))),
                        react_1["default"].createElement("div", { className: "space-y-2" },
                            react_1["default"].createElement(label_1.Label, { htmlFor: "amount" }, "Total Budget Amount (KES) *"),
                            react_1["default"].createElement(input_1.Input, { id: "amount", type: "number", placeholder: "e.g., 100000", value: amount, onChange: function (e) { return setAmount(e.target.value); }, min: "0", step: "0.01" }),
                            react_1["default"].createElement("p", { className: "text-sm text-gray-500" }, amount ? "\u2248 " + new Intl.NumberFormat("en-US", { style: "currency", currency: currencyCode }).format(parseFloat(amount)) : "Enter an amount")),
                        react_1["default"].createElement("div", { className: "space-y-2" },
                            react_1["default"].createElement(label_1.Label, { htmlFor: "year" }, "Fiscal Year *"),
                            react_1["default"].createElement(select_1.Select, { value: fiscalYear, onValueChange: setFiscalYear },
                                react_1["default"].createElement(select_1.SelectTrigger, { id: "year" },
                                    react_1["default"].createElement(select_1.SelectValue, null)),
                                react_1["default"].createElement(select_1.SelectContent, null, years.map(function (year) { return (react_1["default"].createElement(select_1.SelectItem, { key: year, value: year.toString() }, year)); })))),
                        react_1["default"].createElement("div", { className: "flex gap-4 pt-4" },
                            react_1["default"].createElement(button_1.Button, { type: "submit", disabled: createBudgetMutation.isPending }, createBudgetMutation.isPending ? "Creating..." : "Create Budget"),
                            react_1["default"].createElement(button_1.Button, { variant: "outline", onClick: function () { return navigate("/budgets"); }, disabled: createBudgetMutation.isPending }, "Cancel"))))))));
}
exports["default"] = CreateBudget;
