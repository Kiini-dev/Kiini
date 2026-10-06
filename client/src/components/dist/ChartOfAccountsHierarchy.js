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
exports.ChartOfAccountsHierarchy = void 0;
var react_1 = require("react");
var trpc_1 = require("@/lib/trpc");
var button_1 = require("@/components/ui/button");
var dialog_1 = require("@/components/ui/dialog");
var label_1 = require("@/components/ui/label");
var input_1 = require("@/components/ui/input");
var select_1 = require("@/components/ui/select");
exports.ChartOfAccountsHierarchy = function () {
    var _a = trpc_1.trpc.chartOfAccounts.getHierarchy.useQuery({}), hierarchy = _a.data, isLoading = _a.isLoading, refetch = _a.refetch;
    var summary = trpc_1.trpc.chartOfAccounts.getSummary.useQuery({}).data;
    var _b = react_1.useState(new Set()), expandedAccounts = _b[0], setExpandedAccounts = _b[1];
    var _c = react_1.useState(false), showEditModal = _c[0], setShowEditModal = _c[1];
    var _d = react_1.useState(null), editingAccount = _d[0], setEditingAccount = _d[1];
    var _e = react_1.useState(''), searchTerm = _e[0], setSearchTerm = _e[1];
    var _f = react_1.useState(0), editingLevel = _f[0], setEditingLevel = _f[1];
    var updateBalanceMutation = trpc_1.trpc.chartOfAccounts.updateBalance.useMutation({
        onSuccess: function () {
            refetch();
            setShowEditModal(false);
            setEditingAccount(null);
        }
    });
    var toggleExpand = function (accountId) {
        var newExpanded = new Set(expandedAccounts);
        if (newExpanded.has(accountId)) {
            newExpanded["delete"](accountId);
        }
        else {
            newExpanded.add(accountId);
        }
        setExpandedAccounts(newExpanded);
    };
    var filteredHierarchy = react_1.useMemo(function () {
        if (!hierarchy || !searchTerm)
            return hierarchy;
        var filterAccounts = function (accounts) {
            return accounts
                .filter(function (acc) {
                return acc.accountCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    acc.accountName.toLowerCase().includes(searchTerm.toLowerCase());
            })
                .map(function (acc) { return (__assign(__assign({}, acc), { children: acc.children ? filterAccounts(acc.children) : [] })); })
                .filter(function (acc) { return acc.children && acc.children.length > 0 || acc.accountCode.toLowerCase().includes(searchTerm.toLowerCase()); });
        };
        return filterAccounts(hierarchy);
    }, [hierarchy, searchTerm]);
    var handleEditBalance = function (account, level) {
        setEditingLevel(level);
        setEditingAccount({
            accountId: account.id,
            amount: Math.abs(account.balance),
            operation: 'set'
        });
        setShowEditModal(true);
    };
    var handleSaveBalance = function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!editingAccount)
                        return [2 /*return*/];
                    return [4 /*yield*/, updateBalanceMutation.mutateAsync({
                            accountId: editingAccount.accountId,
                            amount: editingAccount.amount,
                            operation: editingAccount.operation
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    var renderAccountNode = function (account, level) {
        if (level === void 0) { level = 0; }
        var isExpanded = expandedAccounts.has(account.id);
        var hasChildren = account.children && account.children.length > 0;
        var isParent = account.isParent;
        var paddingClass = level === 0 ? 'pl-4' : level === 1 ? 'pl-12' : level === 2 ? 'pl-20' : level === 3 ? 'pl-28' : 'pl-36';
        return (react_1["default"].createElement("div", { key: account.id, className: "border-b hover:bg-gray-50" },
            react_1["default"].createElement("div", { className: "flex items-center gap-2 px-4 py-3 " + paddingClass },
                hasChildren && (react_1["default"].createElement("button", { onClick: function () { return toggleExpand(account.id); }, className: "w-5 h-5 flex items-center justify-center text-gray-600 hover:text-gray-900" }, isExpanded ? '▼' : '▶')),
                !hasChildren && react_1["default"].createElement("div", { className: "w-5" }),
                react_1["default"].createElement("div", { className: "flex-1" },
                    react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                        react_1["default"].createElement("code", { className: "font-mono text-sm " + (isParent ? 'font-bold text-gray-900' : 'text-gray-700') }, account.accountCode),
                        react_1["default"].createElement("span", { className: "" + (isParent
                                ? 'font-bold text-gray-900'
                                : 'text-gray-700') }, account.accountName),
                        react_1["default"].createElement("span", { className: "text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded" }, account.accountType))),
                react_1["default"].createElement("div", { className: "text-right flex items-center gap-4" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement("div", { className: "font-mono font-semibold text-gray-900" },
                            "Ksh ",
                            (account.balance / 100).toLocaleString('en-KE', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })),
                        react_1["default"].createElement("div", { className: "text-xs text-gray-500" }, "Balance")),
                    react_1["default"].createElement("button", { onClick: function () { return handleEditBalance(account, level); }, className: "px-3 py-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded" }, "Edit"))),
            isExpanded && hasChildren && (react_1["default"].createElement("div", { className: "bg-gray-50" }, account.children.map(function (child) { return renderAccountNode(child, level + 1); })))));
    };
    if (isLoading) {
        return (react_1["default"].createElement("div", { className: "flex justify-center items-center h-64" },
            react_1["default"].createElement("div", { className: "text-gray-500" }, "Loading Chart of Accounts...")));
    }
    return (react_1["default"].createElement("div", { className: "space-y-6" },
        summary && (react_1["default"].createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4" },
            react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg shadow" },
                react_1["default"].createElement("div", { className: "text-sm text-gray-600" }, "Total Assets"),
                react_1["default"].createElement("div", { className: "text-2xl font-bold text-green-600" },
                    "Ksh ",
                    (summary.totalAssets / 100).toLocaleString('en-KE'))),
            react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg shadow" },
                react_1["default"].createElement("div", { className: "text-sm text-gray-600" }, "Total Liabilities"),
                react_1["default"].createElement("div", { className: "text-2xl font-bold text-red-600" },
                    "Ksh ",
                    (summary.totalLiabilities / 100).toLocaleString('en-KE'))),
            react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg shadow" },
                react_1["default"].createElement("div", { className: "text-sm text-gray-600" }, "Total Equity"),
                react_1["default"].createElement("div", { className: "text-2xl font-bold text-blue-600" },
                    "Ksh ",
                    (summary.totalEquity / 100).toLocaleString('en-KE'))),
            react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg shadow" },
                react_1["default"].createElement("div", { className: "text-sm text-gray-600" }, "Total Revenue"),
                react_1["default"].createElement("div", { className: "text-2xl font-bold text-purple-600" },
                    "Ksh ",
                    (summary.totalRevenue / 100).toLocaleString('en-KE'))),
            react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg shadow" },
                react_1["default"].createElement("div", { className: "text-sm text-gray-600" }, "Total Expenses"),
                react_1["default"].createElement("div", { className: "text-2xl font-bold text-orange-600" },
                    "Ksh ",
                    (summary.totalExpenses / 100).toLocaleString('en-KE'))),
            react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg shadow" },
                react_1["default"].createElement("div", { className: "text-sm text-gray-600" }, "Cost of Goods Sold"),
                react_1["default"].createElement("div", { className: "text-2xl font-bold text-purple-600" },
                    "Ksh ",
                    (summary.costofgoodssold / 100).toLocaleString('en-KE'))),
            react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg shadow" },
                react_1["default"].createElement("div", { className: "text-sm text-gray-600" }, "Operating Expense"),
                react_1["default"].createElement("div", { className: "text-2xl font-bold text-purple-600" },
                    "Ksh ",
                    (summary.operatingExpense / 100).toLocaleString('en-KE'))),
            react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg shadow" },
                react_1["default"].createElement("div", { className: "text-sm text-gray-600" }, "Capital Expenditure"),
                react_1["default"].createElement("div", { className: "text-2xl font-bold text-purple-600" },
                    "Ksh ",
                    (summary.capitalExpenditure / 100).toLocaleString('en-KE'))),
            react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg shadow" },
                react_1["default"].createElement("div", { className: "text-sm text-gray-600" }, "Other Income"),
                react_1["default"].createElement("div", { className: "text-2xl font-bold text-purple-600" },
                    "Ksh ",
                    (summary.otherIncome / 100).toLocaleString('en-KE'))),
            react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg shadow" },
                react_1["default"].createElement("div", { className: "text-sm text-gray-600" }, "Other Expense"),
                react_1["default"].createElement("div", { className: "text-2xl font-bold text-purple-600" },
                    "Ksh ",
                    (summary.otherExpense / 100).toLocaleString('en-KE'))))),
        react_1["default"].createElement("div", { className: "bg-white p-4 rounded-lg shadow" },
            react_1["default"].createElement("input", { type: "text", placeholder: "Search by code or name...", value: searchTerm, onChange: function (e) { return setSearchTerm(e.target.value); }, className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" })),
        react_1["default"].createElement("div", { className: "bg-white rounded-lg shadow overflow-hidden" },
            react_1["default"].createElement("div", { className: "bg-gray-100 px-4 py-3 border-b font-semibold text-gray-900" }, "Chart of Accounts Hierarchy"),
            react_1["default"].createElement("div", { className: "divide-y" }, filteredHierarchy && filteredHierarchy.length > 0 ? (filteredHierarchy.map(function (account) { return renderAccountNode(account); })) : (react_1["default"].createElement("div", { className: "px-4 py-8 text-center text-gray-500" }, "No accounts found matching your search.")))),
        showEditModal && editingAccount && (react_1["default"].createElement(dialog_1.Dialog, { open: showEditModal, onOpenChange: setShowEditModal },
            react_1["default"].createElement(dialog_1.DialogContent, null,
                react_1["default"].createElement(dialog_1.DialogHeader, null,
                    react_1["default"].createElement(dialog_1.DialogTitle, null, "Edit Account Balance"),
                    react_1["default"].createElement(dialog_1.DialogDescription, null, "Update the balance for this account")),
                react_1["default"].createElement("div", { className: "space-y-4" },
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement(label_1.Label, { htmlFor: "operation" }, "Operation"),
                        react_1["default"].createElement(select_1.Select, { value: editingAccount.operation, onValueChange: function (e) {
                                return setEditingAccount(__assign(__assign({}, editingAccount), { operation: e }));
                            } },
                            react_1["default"].createElement(select_1.SelectTrigger, { id: "operation", title: "Select operation" },
                                react_1["default"].createElement(select_1.SelectValue, null)),
                            react_1["default"].createElement(select_1.SelectContent, null,
                                react_1["default"].createElement(select_1.SelectItem, { value: "set" }, "Set Balance"),
                                react_1["default"].createElement(select_1.SelectItem, { value: "add" }, "Add Amount"),
                                react_1["default"].createElement(select_1.SelectItem, { value: "subtract" }, "Subtract Amount")))),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement(label_1.Label, { htmlFor: "amount" }, "Amount (in KES)"),
                        react_1["default"].createElement(input_1.Input, { id: "amount", type: "number", value: editingAccount.amount, onChange: function (e) {
                                return setEditingAccount(__assign(__assign({}, editingAccount), { amount: parseFloat(e.target.value) || 0 }));
                            }, placeholder: "Enter amount" }))),
                react_1["default"].createElement(dialog_1.DialogFooter, null,
                    react_1["default"].createElement(button_1.Button, { variant: "outline", onClick: function () { return setShowEditModal(false); } }, "Cancel"),
                    react_1["default"].createElement(button_1.Button, { onClick: handleSaveBalance, disabled: updateBalanceMutation.isPending }, updateBalanceMutation.isPending ? 'Saving...' : 'Save Balance')))))));
};
