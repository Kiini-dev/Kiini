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
var ModuleLayout_1 = require("@/components/ModuleLayout");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var spinner_1 = require("@/components/ui/spinner");
var permissions_1 = require("@/lib/permissions");
var select_1 = require("@/components/ui/select");
var table_1 = require("@/components/ui/table");
var dialog_1 = require("@/components/ui/dialog");
var tabs_1 = require("@/components/ui/tabs");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var lucide_react_1 = require("lucide-react");
var react_1 = require("react");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var wouter_1 = require("wouter");
var ChartOfAccountsHierarchy_1 = require("@/components/ChartOfAccountsHierarchy");
var stats_card_1 = require("@/components/ui/stats-card");
function ChartOfAccounts() {
    var _a = wouter_1.useLocation(), navigate = _a[1];
    // Call all hooks unconditionally at top level
    var _b = permissions_1.useRequireFeature("accounting:chart_of_accounts:view"), allowed = _b.allowed, permissionLoading = _b.isLoading;
    var _c = react_1.useState(""), searchTerm = _c[0], setSearchTerm = _c[1];
    var _d = react_1.useState("all"), typeFilter = _d[0], setTypeFilter = _d[1];
    var _e = react_1.useState(false), isCreateDialogOpen = _e[0], setIsCreateDialogOpen = _e[1];
    var _f = react_1.useState({
        accountCode: "",
        accountName: "",
        accountType: "asset",
        parentAccountId: null,
        description: "",
        balance: 0
    }), newAccount = _f[0], setNewAccount = _f[1];
    var utils = trpc_1.trpc.useUtils();
    var _g = trpc_1.trpc.chartOfAccounts.list.useQuery({}), _h = _g.data, accounts = _h === void 0 ? [] : _h, isLoading = _g.isLoading;
    var summaryData = trpc_1.trpc.chartOfAccounts.getSummary.useQuery({}).data;
    var createAccountMutation = trpc_1.trpc.chartOfAccounts.create.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Account created successfully!");
            utils.chartOfAccounts.list.invalidate();
            utils.chartOfAccounts.getSummary.invalidate();
            setIsCreateDialogOpen(false);
            setNewAccount({
                accountCode: "",
                accountName: "",
                accountType: "asset",
                parentAccountId: null,
                description: "",
                balance: 0
            });
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to create account: " + ((error === null || error === void 0 ? void 0 : error.message) || String(error)));
        }
    });
    var deleteAccountMutation = trpc_1.trpc.chartOfAccounts["delete"].useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Account deleted successfully!");
            utils.chartOfAccounts.list.invalidate();
            utils.chartOfAccounts.getSummary.invalidate();
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to delete account: " + ((error === null || error === void 0 ? void 0 : error.message) || String(error)));
        }
    });
    var getTypeColor = function (type) {
        var colors = {
            asset: "text-blue-600 bg-blue-100",
            liability: "text-red-600 bg-red-100",
            equity: "text-purple-600 bg-purple-100",
            revenue: "text-green-600 bg-green-100",
            expense: "text-orange-600 bg-orange-100"
        };
        return colors[type] || "text-gray-600 bg-gray-100";
    };
    var filteredAccounts = react_1.useMemo(function () {
        return accounts.filter(function (account) {
            var matchesSearch = account.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                account.accountCode.includes(searchTerm);
            var matchesType = typeFilter === "all" || account.accountType === typeFilter;
            return matchesSearch && matchesType;
        });
    }, [accounts, searchTerm, typeFilter]);
    var summary = react_1.useMemo(function () {
        if (summaryData)
            return summaryData;
        return {
            totalAssets: accounts.filter(function (a) { return a.accountType === "asset"; }).reduce(function (sum, a) { return sum + (a.balance || 0); }, 0),
            totalLiabilities: accounts.filter(function (a) { return a.accountType === "liability"; }).reduce(function (sum, a) { return sum + (a.balance || 0); }, 0),
            totalEquity: accounts.filter(function (a) { return a.accountType === "equity"; }).reduce(function (sum, a) { return sum + (a.balance || 0); }, 0),
            totalRevenue: accounts.filter(function (a) { return a.accountType === "revenue"; }).reduce(function (sum, a) { return sum + (a.balance || 0); }, 0),
            totalExpenses: accounts.filter(function (a) { return a.accountType === "expense"; }).reduce(function (sum, a) { return sum + (a.balance || 0); }, 0),
            totalCostOfGoodsSold: accounts.filter(function (a) { return a.accountType === "cost of goods sold"; }).reduce(function (sum, a) { return sum + (a.balance || 0); }, 0),
            totalOperatingExpenses: accounts.filter(function (a) { return a.accountType === "operating expense"; }).reduce(function (sum, a) { return sum + (a.balance || 0); }, 0),
            totalCapitalExpenditure: accounts.filter(function (a) { return a.accountType === "capital expenditure"; }).reduce(function (sum, a) { return sum + (a.balance || 0); }, 0),
            totalOtherIncome: accounts.filter(function (a) { return a.accountType === "other income"; }).reduce(function (sum, a) { return sum + (a.balance || 0); }, 0),
            totalOtherExpenses: accounts.filter(function (a) { return a.accountType === "other expense"; }).reduce(function (sum, a) { return sum + (a.balance || 0); }, 0)
        };
    }, [accounts, summaryData]);
    var handleCreateAccount = function (e) {
        e.preventDefault();
        if (!newAccount.accountCode || !newAccount.accountName) {
            sonner_1.toast.error("Account code and name are required");
            return;
        }
        createAccountMutation.mutate(__assign(__assign({}, newAccount), { balance: Number(newAccount.balance) * 100 }));
    };
    var handleDeleteAccount = function (id, code) {
        if (confirm("Are you sure you want to delete account " + code + "?")) {
            deleteAccountMutation.mutate(id);
        }
    };
    // Permission checks - safe to do after all hooks are called
    if (permissionLoading) {
        return (React.createElement("div", { className: "flex items-center justify-center h-screen" },
            React.createElement(spinner_1.Spinner, { className: "size-8" })));
    }
    if (!allowed) {
        return null;
    }
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Chart of Accounts", description: "Manage your accounting chart of accounts", icon: React.createElement(lucide_react_1.BookOpen, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Accounting", href: "/accounting" },
            { label: "Chart of Accounts", href: "/chart-of-accounts" },
        ] },
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "flex items-center justify-end" },
                React.createElement(dialog_1.Dialog, { open: isCreateDialogOpen, onOpenChange: setIsCreateDialogOpen },
                    React.createElement(dialog_1.DialogTrigger, { asChild: true },
                        React.createElement(button_1.Button, null,
                            React.createElement(lucide_react_1.Plus, { className: "mr-2 h-4 w-4" }),
                            "New Account")),
                    React.createElement(dialog_1.DialogContent, { className: "max-w-2xl" },
                        React.createElement("form", { onSubmit: handleCreateAccount },
                            React.createElement(dialog_1.DialogHeader, null,
                                React.createElement(dialog_1.DialogTitle, null, "Create New Account"),
                                React.createElement(dialog_1.DialogDescription, null, "Add a new account to your chart of accounts")),
                            React.createElement("div", { className: "grid gap-4 py-4" },
                                React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" },
                                    React.createElement("div", { className: "space-y-2" },
                                        React.createElement(label_1.Label, { htmlFor: "code" }, "Account Code"),
                                        React.createElement(input_1.Input, { id: "code", placeholder: "e.g., 1000", value: newAccount.accountCode, onChange: function (e) { return setNewAccount(__assign(__assign({}, newAccount), { accountCode: e.target.value })); }, required: true })),
                                    React.createElement("div", { className: "space-y-2" },
                                        React.createElement(label_1.Label, { htmlFor: "type" }, "Account Type"),
                                        React.createElement(select_1.Select, { value: newAccount.accountType, onValueChange: function (value) { return setNewAccount(__assign(__assign({}, newAccount), { accountType: value })); } },
                                            React.createElement(select_1.SelectTrigger, null,
                                                React.createElement(select_1.SelectValue, { placeholder: "Select type" })),
                                            React.createElement(select_1.SelectContent, null,
                                                React.createElement(select_1.SelectItem, { value: "asset" }, "Asset"),
                                                React.createElement(select_1.SelectItem, { value: "liability" }, "Liability"),
                                                React.createElement(select_1.SelectItem, { value: "equity" }, "Equity"),
                                                React.createElement(select_1.SelectItem, { value: "revenue" }, "Revenue"),
                                                React.createElement(select_1.SelectItem, { value: "expense" }, "Expense"),
                                                React.createElement(select_1.SelectItem, { value: "cost of goods sold" }, "Cost of Goods Sold"),
                                                React.createElement(select_1.SelectItem, { value: "operating expense" }, "Operating Expense"),
                                                React.createElement(select_1.SelectItem, { value: "capital expenditure" }, "Capital Expenditure"),
                                                React.createElement(select_1.SelectItem, { value: "other income" }, "Other Income"),
                                                React.createElement(select_1.SelectItem, { value: "other expense" }, "Other Expense"))))),
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement(label_1.Label, { htmlFor: "name" }, "Account Name"),
                                    React.createElement(input_1.Input, { id: "name", placeholder: "Enter account name", value: newAccount.accountName, onChange: function (e) { return setNewAccount(__assign(__assign({}, newAccount), { accountName: e.target.value })); }, required: true })),
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement(label_1.Label, { htmlFor: "parent" }, "Parent Account (Optional)"),
                                    React.createElement(select_1.Select, { value: newAccount.parentAccountId || "none", onValueChange: function (value) { return setNewAccount(__assign(__assign({}, newAccount), { parentAccountId: value === "none" ? null : value })); } },
                                        React.createElement(select_1.SelectTrigger, null,
                                            React.createElement(select_1.SelectValue, { placeholder: "Select parent account" })),
                                        React.createElement(select_1.SelectContent, null,
                                            React.createElement(select_1.SelectItem, { value: "none" }, "None (Top Level)"),
                                            accounts.map(function (account) { return (React.createElement(select_1.SelectItem, { key: account.id, value: account.id },
                                                account.accountCode,
                                                " - ",
                                                account.accountName)); })))),
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement(label_1.Label, { htmlFor: "description" }, "Description"),
                                    React.createElement(textarea_1.Textarea, { id: "description", placeholder: "Enter account description", rows: 3, value: newAccount.description, onChange: function (e) { return setNewAccount(__assign(__assign({}, newAccount), { description: e.target.value })); } })),
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement(label_1.Label, { htmlFor: "balance" }, "Opening Balance (Ksh)"),
                                    React.createElement(input_1.Input, { id: "balance", type: "number", placeholder: "0", value: newAccount.balance, onChange: function (e) { return setNewAccount(__assign(__assign({}, newAccount), { balance: Number(e.target.value) })); } }))),
                            React.createElement(dialog_1.DialogFooter, null,
                                React.createElement(button_1.Button, { type: "button", variant: "outline", onClick: function () { return setIsCreateDialogOpen(false); } }, "Cancel"),
                                React.createElement(button_1.Button, { type: "submit", disabled: createAccountMutation.isPending },
                                    createAccountMutation.isPending ? React.createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" }) : null,
                                    "Create Account")))))),
            React.createElement("div", { className: "grid gap-4 md:grid-cols-5" },
                React.createElement(stats_card_1.StatsCard, { label: "Total Assets", value: React.createElement(React.Fragment, null,
                        "Ksh ",
                        (summary.totalAssets / 100).toLocaleString()), icon: React.createElement(lucide_react_1.TrendingUp, { className: "h-5 w-5" }), color: "border-l-blue-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Total Liabilities", value: React.createElement(React.Fragment, null,
                        "Ksh ",
                        (summary.totalLiabilities / 100).toLocaleString()), icon: React.createElement(lucide_react_1.TrendingDown, { className: "h-5 w-5" }), color: "border-l-red-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Total Equity", value: React.createElement(React.Fragment, null,
                        "Ksh ",
                        (summary.totalEquity / 100).toLocaleString()), icon: React.createElement(lucide_react_1.BookOpen, { className: "h-5 w-5" }), color: "border-l-purple-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Total Revenue", value: React.createElement(React.Fragment, null,
                        "Ksh ",
                        (summary.totalRevenue / 100).toLocaleString()), icon: React.createElement(lucide_react_1.TrendingUp, { className: "h-5 w-5" }), color: "border-l-green-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Total Expenses", value: React.createElement(React.Fragment, null,
                        "Ksh ",
                        (summary.totalExpenses / 100).toLocaleString()), icon: React.createElement(lucide_react_1.TrendingDown, { className: "h-5 w-5" }), color: "border-l-orange-500" })),
            React.createElement(tabs_1.Tabs, { defaultValue: "list", className: "w-full" },
                React.createElement(tabs_1.TabsList, null,
                    React.createElement(tabs_1.TabsTrigger, { value: "list" }, "List View"),
                    React.createElement(tabs_1.TabsTrigger, { value: "hierarchy" }, "Hierarchy View")),
                React.createElement(tabs_1.TabsContent, { value: "hierarchy", className: "space-y-6" },
                    React.createElement(ChartOfAccountsHierarchy_1.ChartOfAccountsHierarchy, null)),
                React.createElement(tabs_1.TabsContent, { value: "list" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardHeader, null,
                            React.createElement(card_1.CardTitle, null, "All Accounts"),
                            React.createElement(card_1.CardDescription, null, "View and manage your chart of accounts")),
                        React.createElement(card_1.CardContent, null,
                            React.createElement("div", { className: "flex items-center gap-4 mb-6" },
                                React.createElement("div", { className: "relative flex-1" },
                                    React.createElement(lucide_react_1.Search, { className: "absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" }),
                                    React.createElement(input_1.Input, { placeholder: "Search accounts...", value: searchTerm, onChange: function (e) { return setSearchTerm(e.target.value); }, className: "pl-8" })),
                                React.createElement(select_1.Select, { value: typeFilter, onValueChange: setTypeFilter },
                                    React.createElement(select_1.SelectTrigger, { className: "w-48" },
                                        React.createElement(select_1.SelectValue, null)),
                                    React.createElement(select_1.SelectContent, null,
                                        React.createElement(select_1.SelectItem, { value: "all" }, "All Types"),
                                        React.createElement(select_1.SelectItem, { value: "asset" }, "Assets"),
                                        React.createElement(select_1.SelectItem, { value: "liability" }, "Liabilities"),
                                        React.createElement(select_1.SelectItem, { value: "equity" }, "Equity"),
                                        React.createElement(select_1.SelectItem, { value: "revenue" }, "Revenue"),
                                        React.createElement(select_1.SelectItem, { value: "expense" }, "Expenses")))),
                            React.createElement("div", { className: "rounded-md border" },
                                React.createElement(table_1.Table, null,
                                    React.createElement(table_1.TableHeader, null,
                                        React.createElement(table_1.TableRow, null,
                                            React.createElement(table_1.TableHead, null, "Code"),
                                            React.createElement(table_1.TableHead, null, "Account Name"),
                                            React.createElement(table_1.TableHead, null, "Type"),
                                            React.createElement(table_1.TableHead, { className: "text-right" }, "Balance"),
                                            React.createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                                    React.createElement(table_1.TableBody, null, isLoading ? (React.createElement(table_1.TableRow, null,
                                        React.createElement(table_1.TableCell, { colSpan: 5, className: "text-center py-8" },
                                            React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin mx-auto mb-2" }),
                                            "Loading accounts..."))) : filteredAccounts.length === 0 ? (React.createElement(table_1.TableRow, null,
                                        React.createElement(table_1.TableCell, { colSpan: 5, className: "text-center py-8 text-muted-foreground" }, "No accounts found"))) : (filteredAccounts.map(function (account) { return (React.createElement(table_1.TableRow, { key: account.id },
                                        React.createElement(table_1.TableCell, { className: "font-medium" }, account.accountCode),
                                        React.createElement(table_1.TableCell, null, account.accountName),
                                        React.createElement(table_1.TableCell, null,
                                            React.createElement("span", { className: "px-2 py-1 rounded-full text-xs font-medium " + getTypeColor(account.accountType) }, (account.accountType || 'asset').toUpperCase())),
                                        React.createElement(table_1.TableCell, { className: "text-right font-mono" },
                                            "Ksh ",
                                            (Number(account.balance || 0) / 100).toLocaleString()),
                                        React.createElement(table_1.TableCell, { className: "text-right" },
                                            React.createElement("div", { className: "flex justify-end gap-2" },
                                                React.createElement(button_1.Button, { variant: "ghost", size: "icon", title: "View", onClick: function () { return navigate("/chart-of-accounts/" + account.id); } },
                                                    React.createElement(lucide_react_1.Eye, { className: "h-4 w-4" })),
                                                React.createElement(button_1.Button, { variant: "ghost", size: "icon", onClick: function () { return navigate("/chart-of-accounts/" + account.id + "/edit"); } },
                                                    React.createElement(lucide_react_1.Edit, { className: "h-4 w-4" })),
                                                React.createElement(button_1.Button, { variant: "ghost", size: "icon", className: "text-red-600 hover:text-red-700 hover:bg-red-50", onClick: function () { return handleDeleteAccount(account.id, account.accountCode); } },
                                                    React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))))); }))))))))))));
}
exports["default"] = ChartOfAccounts;
