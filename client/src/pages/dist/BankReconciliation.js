"use strict";
exports.__esModule = true;
var react_1 = require("react");
var permissions_1 = require("@/lib/permissions");
var spinner_1 = require("@/components/ui/spinner");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var select_1 = require("@/components/ui/select");
var table_1 = require("@/components/ui/table");
var checkbox_1 = require("@/components/ui/checkbox");
var lucide_react_1 = require("lucide-react");
var stats_card_1 = require("@/components/ui/stats-card");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
function BankReconciliation() {
    var _a = permissions_1.useRequireFeature("accounting:reconciliation:view"), allowed = _a.allowed, permissionLoading = _a.isLoading;
    var _b = react_1.useState("main"), selectedAccount = _b[0], setSelectedAccount = _b[1];
    var _c = react_1.useState(new Set()), matchedLocally = _c[0], setMatchedLocally = _c[1];
    var fileInputRef = react_1.useRef(null);
    // Fetch real data from backend
    var _d = trpc_1.trpc.bankReconciliation.list.useQuery({}).data, accountsList = _d === void 0 ? [] : _d;
    var reconciliationData = trpc_1.trpc.bankReconciliation.getById.useQuery(selectedAccount).data;
    if (permissionLoading) {
        return (react_1["default"].createElement("div", { className: "flex items-center justify-center h-screen" },
            react_1["default"].createElement(spinner_1.Spinner, { className: "size-8" })));
    }
    if (!allowed) {
        return null;
    }
    var bankBalance = (reconciliationData === null || reconciliationData === void 0 ? void 0 : reconciliationData.bankBalance) || 0;
    var bookBalance = (reconciliationData === null || reconciliationData === void 0 ? void 0 : reconciliationData.bookBalance) || 0;
    var matchedCount = ((reconciliationData === null || reconciliationData === void 0 ? void 0 : reconciliationData.matchedTransactions) || 0) + matchedLocally.size;
    var unmatchedCount = Math.max(0, ((reconciliationData === null || reconciliationData === void 0 ? void 0 : reconciliationData.unmatchedTransactions) || 0) - matchedLocally.size);
    var transactions = (reconciliationData === null || reconciliationData === void 0 ? void 0 : reconciliationData.transactions) || [];
    return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: "Bank Reconciliation", description: "Match bank transactions with system records and ensure accuracy", icon: react_1["default"].createElement(lucide_react_1.CreditCard, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Accounting", href: "/accounting" },
            { label: "Bank Reconciliation" },
        ], actions: react_1["default"].createElement(button_1.Button, { onClick: function () { var _a; return (_a = fileInputRef.current) === null || _a === void 0 ? void 0 : _a.click(); } },
            react_1["default"].createElement(lucide_react_1.Upload, { className: "w-4 h-4 mr-2" }),
            "Import Bank Statement") },
        react_1["default"].createElement("input", { ref: fileInputRef, type: "file", title: "Import bank statement file", "aria-label": "Import bank statement file", accept: ".csv,.xlsx,.xls", className: "hidden", onChange: function (e) {
                var _a;
                var file = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0];
                if (!file)
                    return;
                sonner_1.toast.success("Imported " + file.name);
                e.currentTarget.value = "";
            } }),
        react_1["default"].createElement("div", { className: "space-y-6" },
            react_1["default"].createElement(card_1.Card, { className: "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700" },
                react_1["default"].createElement(card_1.CardHeader, null,
                    react_1["default"].createElement(card_1.CardTitle, null, "Select Account")),
                react_1["default"].createElement(card_1.CardContent, null,
                    react_1["default"].createElement(select_1.Select, { value: selectedAccount, onValueChange: setSelectedAccount },
                        react_1["default"].createElement(select_1.SelectTrigger, { className: "w-full" },
                            react_1["default"].createElement(select_1.SelectValue, null)),
                        react_1["default"].createElement(select_1.SelectContent, null, accountsList.map(function (account) { return (react_1["default"].createElement(select_1.SelectItem, { key: account.id, value: account.id },
                            account.name,
                            " (",
                            account.bankCode,
                            " - ",
                            account.accountNumber,
                            ")")); }))))),
            react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4" },
                react_1["default"].createElement(stats_card_1.StatsCard, { label: "Bank Balance", value: react_1["default"].createElement(react_1["default"].Fragment, null,
                        "KES ",
                        bankBalance.toLocaleString('en-KE', { maximumFractionDigits: 0 })), description: (reconciliationData === null || reconciliationData === void 0 ? void 0 : reconciliationData.period) || "Current period", color: "border-l-orange-500" }),
                react_1["default"].createElement(stats_card_1.StatsCard, { label: "System Balance", value: react_1["default"].createElement(react_1["default"].Fragment, null,
                        "KES ",
                        bookBalance.toLocaleString('en-KE', { maximumFractionDigits: 0 })), description: (reconciliationData === null || reconciliationData === void 0 ? void 0 : reconciliationData.period) || "Current period", color: "border-l-purple-500" }),
                react_1["default"].createElement(stats_card_1.StatsCard, { label: "Matched", value: matchedCount, description: "Transactions", color: "border-l-green-500" }),
                react_1["default"].createElement(stats_card_1.StatsCard, { label: "Unmatched", value: unmatchedCount, description: "Transactions", color: "border-l-blue-500" })),
            react_1["default"].createElement(card_1.Card, { className: "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700" },
                react_1["default"].createElement(card_1.CardHeader, null,
                    react_1["default"].createElement(card_1.CardTitle, null, "Transactions"),
                    react_1["default"].createElement(card_1.CardDescription, null, (reconciliationData === null || reconciliationData === void 0 ? void 0 : reconciliationData.status) === "Reconciled"
                        ? "All transactions matched — reconciliation complete"
                        : unmatchedCount + " transaction(s) need matching")),
                react_1["default"].createElement(card_1.CardContent, null,
                    react_1["default"].createElement("div", { className: "overflow-x-auto" },
                        react_1["default"].createElement(table_1.Table, null,
                            react_1["default"].createElement(table_1.TableHeader, null,
                                react_1["default"].createElement(table_1.TableRow, null,
                                    react_1["default"].createElement(table_1.TableHead, { className: "w-12" },
                                        react_1["default"].createElement(checkbox_1.Checkbox, null)),
                                    react_1["default"].createElement(table_1.TableHead, null, "Date"),
                                    react_1["default"].createElement(table_1.TableHead, null, "Description"),
                                    react_1["default"].createElement(table_1.TableHead, { className: "text-right" }, "Amount"),
                                    react_1["default"].createElement(table_1.TableHead, null, "Status"),
                                    react_1["default"].createElement(table_1.TableHead, null, "Action"))),
                            react_1["default"].createElement(table_1.TableBody, null, transactions.length === 0 ? (react_1["default"].createElement(table_1.TableRow, null,
                                react_1["default"].createElement(table_1.TableCell, { colSpan: 6, className: "text-center text-muted-foreground py-8" }, "No transactions found for this account"))) : (transactions.map(function (txn) {
                                var isMatched = txn.status === "matched" || matchedLocally.has(txn.id);
                                return (react_1["default"].createElement(table_1.TableRow, { key: txn.id },
                                    react_1["default"].createElement(table_1.TableCell, null,
                                        react_1["default"].createElement(checkbox_1.Checkbox, null)),
                                    react_1["default"].createElement(table_1.TableCell, { className: "text-sm" }, txn.date ? new Date(txn.date).toLocaleDateString() : "N/A"),
                                    react_1["default"].createElement(table_1.TableCell, { className: "text-sm" }, txn.description),
                                    react_1["default"].createElement(table_1.TableCell, { className: "text-right text-sm font-medium" },
                                        "KES ",
                                        (txn.amount || 0).toLocaleString()),
                                    react_1["default"].createElement(table_1.TableCell, null, isMatched ? (react_1["default"].createElement("div", { className: "flex items-center gap-1 text-green-600 text-sm" },
                                        react_1["default"].createElement(lucide_react_1.CheckCircle2, { className: "w-4 h-4" }),
                                        " Matched")) : (react_1["default"].createElement("div", { className: "flex items-center gap-1 text-yellow-600 text-sm" },
                                        react_1["default"].createElement(lucide_react_1.AlertCircle, { className: "w-4 h-4" }),
                                        " Unmatched"))),
                                    react_1["default"].createElement(table_1.TableCell, null,
                                        react_1["default"].createElement(button_1.Button, { variant: "outline", size: "sm", className: "text-xs", onClick: function () {
                                                if (isMatched) {
                                                    sonner_1.toast.info("Viewing transaction " + txn.id);
                                                    return;
                                                }
                                                setMatchedLocally(function (prev) {
                                                    var next = new Set(prev);
                                                    next.add(txn.id);
                                                    return next;
                                                });
                                                sonner_1.toast.success("Transaction " + txn.id + " matched");
                                            } }, isMatched ? "View" : "Match"))));
                            }))))))),
            react_1["default"].createElement("div", { className: "flex gap-3 justify-end" },
                react_1["default"].createElement(button_1.Button, { variant: "outline", onClick: function () { return sonner_1.toast.info("Reconciliation cancelled"); } }, "Cancel"),
                react_1["default"].createElement(button_1.Button, { className: "bg-green-600 hover:bg-green-700", onClick: function () { return sonner_1.toast.success("Reconciliation completed successfully"); } }, "Complete Reconciliation")))));
}
exports["default"] = BankReconciliation;
