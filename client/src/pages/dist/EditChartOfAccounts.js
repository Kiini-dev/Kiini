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
var textarea_1 = require("@/components/ui/textarea");
var card_1 = require("@/components/ui/card");
var select_1 = require("@/components/ui/select");
var alert_1 = require("@/components/ui/alert");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
function EditChartOfAccounts() {
    var _a;
    var id = wouter_1.useParams().id;
    var _b = wouter_1.useLocation(), navigate = _b[1];
    var utils = trpc_1.trpc.useUtils();
    var _c = react_1.useState({
        accountCode: "",
        accountName: "",
        accountType: "asset",
        parentAccountId: null,
        description: "",
        isActive: true
    }), formData = _c[0], setFormData = _c[1];
    var _d = react_1.useState(0), hierarchyLevel = _d[0], setHierarchyLevel = _d[1];
    var _e = trpc_1.trpc.chartOfAccounts.getById.useQuery({ id: id || "" }, { enabled: !!id }), chartOfAccounts = _e.data, isLoading = _e.isLoading;
    // Fetch all accounts to display as parent options
    var _f = trpc_1.trpc.chartOfAccounts.list.useQuery({}).data, allAccounts = _f === void 0 ? [] : _f;
    react_1.useEffect(function () {
        if (chartOfAccounts) {
            setFormData({
                accountCode: chartOfAccounts.accountCode || "",
                accountName: chartOfAccounts.accountName || "",
                accountType: chartOfAccounts.accountType || "asset",
                parentAccountId: chartOfAccounts.parentAccountId || null,
                description: chartOfAccounts.description || "",
                isActive: chartOfAccounts.isActive !== 0
            });
            // Calculate hierarchy level
            var level = 0;
            var currentAccountId_1 = chartOfAccounts.parentAccountId;
            var visited = new Set();
            while (currentAccountId_1 && !visited.has(currentAccountId_1)) {
                visited.add(currentAccountId_1);
                var parent = allAccounts.find(function (acc) { return acc.id === currentAccountId_1; });
                if (parent) {
                    level++;
                    currentAccountId_1 = parent.parentAccountId;
                }
                else {
                    break;
                }
            }
            setHierarchyLevel(level);
        }
    }, [chartOfAccounts, allAccounts]);
    var updateChartOfAccountsMutation = trpc_1.trpc.chartOfAccounts.update.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Chart of Accounts updated successfully!");
            utils.chartOfAccounts.list.invalidate();
            utils.chartOfAccounts.getById.invalidate({ id: id || "" });
            utils.chartOfAccounts.getSummary.invalidate();
            navigate("/chart-of-accounts");
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to update chart of accounts: " + error.message);
        }
    });
    var handleSubmit = function (e) {
        e.preventDefault();
        if (!formData.accountCode || !formData.accountName) {
            sonner_1.toast.error("Please fill in all required fields");
            return;
        }
        // Prevent circular hierarchy
        if (formData.parentAccountId === id) {
            sonner_1.toast.error("An account cannot be its own parent");
            return;
        }
        // Check for circular references
        var currentParentId = formData.parentAccountId;
        var visited = new Set();
        while (currentParentId && !visited.has(currentParentId)) {
            if (currentParentId === id) {
                sonner_1.toast.error("Creating this relationship would cause a circular hierarchy");
                return;
            }
            visited.add(currentParentId);
            var parent = allAccounts.find(function (acc) { return acc.id === currentParentId; });
            currentParentId = (parent === null || parent === void 0 ? void 0 : parent.parentAccountId) || null;
        }
        updateChartOfAccountsMutation.mutate({
            id: id || "",
            accountCode: formData.accountCode,
            accountName: formData.accountName,
            accountType: formData.accountType,
            parentAccountId: formData.parentAccountId,
            description: formData.description || undefined,
            isActive: formData.isActive
        });
    };
    if (isLoading) {
        return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: "Edit Chart of Accounts", description: "Update account details", icon: react_1["default"].createElement(lucide_react_1.BookOpen, { className: "w-6 h-6" }), breadcrumbs: [
                { label: "Dashboard", href: "/crm-home" },
                { label: "Accounting", href: "/accounting" },
                { label: "Chart of Accounts", href: "/chart-of-accounts" },
                { label: "Edit Account" },
            ] },
            react_1["default"].createElement("div", { className: "flex items-center justify-center p-8" },
                react_1["default"].createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin" }))));
    }
    return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: "Edit Chart of Accounts", description: "Update account details", icon: react_1["default"].createElement(lucide_react_1.BookOpen, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Accounting", href: "/accounting" },
            { label: "Chart of Accounts", href: "/chart-of-accounts" },
            { label: "Edit Account" },
        ] },
        react_1["default"].createElement("div", { className: "max-w-2xl" },
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardHeader, null,
                    react_1["default"].createElement(card_1.CardTitle, null, "Edit Chart of Accounts"),
                    react_1["default"].createElement(card_1.CardDescription, null, "Update the account details below")),
                react_1["default"].createElement(card_1.CardContent, null,
                    react_1["default"].createElement("form", { onSubmit: handleSubmit, className: "space-y-6" },
                        react_1["default"].createElement(alert_1.Alert, null,
                            react_1["default"].createElement(lucide_react_1.AlertCircle, { className: "h-4 w-4" }),
                            react_1["default"].createElement(alert_1.AlertDescription, null,
                                "Current hierarchy level: ",
                                react_1["default"].createElement("strong", null,
                                    "Level ",
                                    hierarchyLevel),
                                formData.parentAccountId && (react_1["default"].createElement(react_1["default"].Fragment, null,
                                    " ",
                                    " - Parent: ", (_a = allAccounts.find(function (acc) { return acc.id === formData.parentAccountId; })) === null || _a === void 0 ? void 0 :
                                    _a.accountName)))),
                        react_1["default"].createElement("div", { className: "grid gap-4 md:grid-cols-2" },
                            react_1["default"].createElement("div", { className: "space-y-2" },
                                react_1["default"].createElement(label_1.Label, { htmlFor: "accountCode" }, "Account Code *"),
                                react_1["default"].createElement(input_1.Input, { id: "accountCode", placeholder: "e.g., 1000", value: formData.accountCode, onChange: function (e) {
                                        return setFormData(__assign(__assign({}, formData), { accountCode: e.target.value }));
                                    } })),
                            react_1["default"].createElement("div", { className: "space-y-2" },
                                react_1["default"].createElement(label_1.Label, { htmlFor: "accountType" }, "Account Type *"),
                                react_1["default"].createElement(select_1.Select, { value: formData.accountType, onValueChange: function (value) {
                                        return setFormData(__assign(__assign({}, formData), { accountType: value }));
                                    } },
                                    react_1["default"].createElement(select_1.SelectTrigger, null,
                                        react_1["default"].createElement(select_1.SelectValue, { placeholder: "Select account type" })),
                                    react_1["default"].createElement(select_1.SelectContent, null,
                                        react_1["default"].createElement(select_1.SelectItem, { value: "asset" }, "Asset"),
                                        react_1["default"].createElement(select_1.SelectItem, { value: "liability" }, "Liability"),
                                        react_1["default"].createElement(select_1.SelectItem, { value: "equity" }, "Equity"),
                                        react_1["default"].createElement(select_1.SelectItem, { value: "revenue" }, "Revenue"),
                                        react_1["default"].createElement(select_1.SelectItem, { value: "expense" }, "Expense"),
                                        react_1["default"].createElement(select_1.SelectItem, { value: "cost of goods sold" }, "Cost of Goods Sold"),
                                        react_1["default"].createElement(select_1.SelectItem, { value: "operating expense" }, "Operating Expense"),
                                        react_1["default"].createElement(select_1.SelectItem, { value: "capital expenditure" }, "Capital Expenditure"),
                                        react_1["default"].createElement(select_1.SelectItem, { value: "other income" }, "Other Income"),
                                        react_1["default"].createElement(select_1.SelectItem, { value: "other expense" }, "Other Expense"))))),
                        react_1["default"].createElement("div", { className: "space-y-2" },
                            react_1["default"].createElement(label_1.Label, { htmlFor: "accountName" }, "Account Name *"),
                            react_1["default"].createElement(input_1.Input, { id: "accountName", placeholder: "e.g., Cash", value: formData.accountName, onChange: function (e) {
                                    return setFormData(__assign(__assign({}, formData), { accountName: e.target.value }));
                                } })),
                        react_1["default"].createElement("div", { className: "space-y-2" },
                            react_1["default"].createElement(label_1.Label, { htmlFor: "parentAccountId" }, "Parent Account (for Hierarchy)"),
                            react_1["default"].createElement(select_1.Select, { value: formData.parentAccountId || "", onValueChange: function (value) {
                                    return setFormData(__assign(__assign({}, formData), { parentAccountId: value === "__none__" ? null : value || null }));
                                } },
                                react_1["default"].createElement(select_1.SelectTrigger, null,
                                    react_1["default"].createElement(select_1.SelectValue, { placeholder: "Select parent account (optional)" })),
                                react_1["default"].createElement(select_1.SelectContent, null,
                                    react_1["default"].createElement(select_1.SelectItem, { value: "__none__" }, "No Parent (Top Level)"),
                                    allAccounts
                                        .filter(function (acc) { return acc.id !== id; }) // Don't show current account
                                        .map(function (acc) { return (react_1["default"].createElement(select_1.SelectItem, { key: acc.id, value: acc.id },
                                        acc.accountCode,
                                        " - ",
                                        acc.accountName,
                                        " (",
                                        acc.accountType,
                                        ")")); }))),
                            react_1["default"].createElement("p", { className: "text-sm text-slate-600 dark:text-slate-400" }, "Select a parent account to create a sub-account (e.g., \"Cash\" under \"Current Assets\")")),
                        react_1["default"].createElement("div", { className: "space-y-2" },
                            react_1["default"].createElement(label_1.Label, { htmlFor: "description" }, "Description"),
                            react_1["default"].createElement(textarea_1.Textarea, { id: "description", placeholder: "Enter account description", value: formData.description, onChange: function (e) {
                                    return setFormData(__assign(__assign({}, formData), { description: e.target.value }));
                                }, rows: 4 })),
                        react_1["default"].createElement("div", { className: "flex gap-2" },
                            react_1["default"].createElement(button_1.Button, { type: "submit", disabled: updateChartOfAccountsMutation.isPending },
                                updateChartOfAccountsMutation.isPending && (react_1["default"].createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" })),
                                "Update Account"),
                            react_1["default"].createElement(button_1.Button, { type: "button", variant: "outline", onClick: function () { return navigate("/chart-of-accounts"); } },
                                react_1["default"].createElement(lucide_react_1.ArrowLeft, { className: "mr-2 h-4 w-4" }),
                                "Cancel"))))))));
}
exports["default"] = EditChartOfAccounts;
