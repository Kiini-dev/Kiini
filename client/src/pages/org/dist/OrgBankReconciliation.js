"use strict";
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var trpc_1 = require("@/lib/trpc");
var OrgLayout_1 = require("@/components/OrgLayout");
var OrgBreadcrumb_1 = require("@/components/OrgBreadcrumb");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var select_1 = require("@/components/ui/select");
var stats_card_1 = require("@/components/ui/stats-card");
var table_1 = require("@/components/ui/table");
var badge_1 = require("@/components/ui/badge");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var useOrgPermission_1 = require("@/hooks/useOrgPermission");
function OrgBankReconciliation() {
    var _a;
    var params = wouter_1.useParams();
    var slug = params.slug;
    var hasPermission = useOrgPermission_1.useOrgPermission().hasPermission;
    var canCreate = hasPermission("bank_reconciliation");
    var _b = react_1.useState(""), selectedAccount = _b[0], setSelectedAccount = _b[1];
    var _c = react_1.useState(new Set()), matchedLocally = _c[0], setMatchedLocally = _c[1];
    var _d = react_1.useState(""), fileName = _d[0], setFileName = _d[1];
    var _e = trpc_1.trpc.bankReconciliation.list.useQuery(undefined), _f = _e.data, accounts = _f === void 0 ? [] : _f, isLoadingAccounts = _e.isLoading;
    var _g = trpc_1.trpc.bankReconciliation.getById.useQuery(selectedAccount, {
        enabled: !!selectedAccount
    }), reconciliation = _g.data, isLoadingReconciliation = _g.isLoading;
    var accountOptions = react_1.useMemo(function () { return accounts || []; }, [accounts]);
    var currentAccount = accountOptions.find(function (account) { return account.id === selectedAccount; }) || accountOptions[0];
    var bankBalance = (reconciliation === null || reconciliation === void 0 ? void 0 : reconciliation.bankBalance) || 0;
    var bookBalance = (reconciliation === null || reconciliation === void 0 ? void 0 : reconciliation.bookBalance) || 0;
    var matchedCount = ((reconciliation === null || reconciliation === void 0 ? void 0 : reconciliation.matchedTransactions) || 0) + matchedLocally.size;
    var unmatchedCount = Math.max(0, ((reconciliation === null || reconciliation === void 0 ? void 0 : reconciliation.unmatchedTransactions) || 0) - matchedLocally.size);
    var transactions = (reconciliation === null || reconciliation === void 0 ? void 0 : reconciliation.transactions) || [];
    var handleMatch = function (txnId) {
        setMatchedLocally(function (prev) { return new Set(prev).add(txnId); });
        sonner_1.toast.success("Transaction matched successfully");
    };
    var uploadStatement = function (file) {
        if (!file)
            return;
        setFileName(file.name);
        sonner_1.toast.success("Imported " + file.name);
    };
    return (React.createElement(OrgLayout_1["default"], null,
        React.createElement(OrgBreadcrumb_1["default"], { slug: slug, items: [
                { label: "Dashboard", href: "/org/" + slug + "/dashboard" },
                { label: "Bank Reconciliation", href: "/org/" + slug + "/bank-reconciliation" },
            ] }),
        React.createElement("div", { className: "p-6 space-y-6" },
            React.createElement("div", { className: "flex items-center justify-between gap-4 flex-wrap" },
                React.createElement("div", null,
                    React.createElement("h1", { className: "text-3xl font-bold" }, "Bank Reconciliation"),
                    React.createElement("p", { className: "text-muted-foreground mt-2" }, "Compare bank transactions against your ledgers and close gaps.")),
                canCreate && (React.createElement("label", { htmlFor: "bank-statement-upload" },
                    React.createElement("input", { id: "bank-statement-upload", type: "file", accept: ".csv,.xlsx,.xls", className: "sr-only", onChange: function (event) { var _a, _b; return uploadStatement((_b = (_a = event.target.files) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : undefined); } }),
                    React.createElement(button_1.Button, null,
                        React.createElement(lucide_react_1.Upload, { className: "h-4 w-4 mr-2" }),
                        "Import Statement")))),
            React.createElement("div", { className: "grid gap-4 md:grid-cols-4" },
                React.createElement(stats_card_1.StatsCard, { label: "Bank Balance", value: "KSh " + bankBalance.toLocaleString(), color: "border-l-blue-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Book Balance", value: "KSh " + bookBalance.toLocaleString(), color: "border-l-purple-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Matched Transactions", value: matchedCount, color: "border-l-emerald-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Unmatched Transactions", value: unmatchedCount, color: "border-l-orange-500" })),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Reconciliation Account")),
                React.createElement(card_1.CardContent, null, isLoadingAccounts ? (React.createElement("div", { className: "flex justify-center py-10" },
                    React.createElement(lucide_react_1.Loader2, { className: "h-6 w-6 animate-spin text-muted-foreground" }))) : accountOptions.length === 0 ? (React.createElement("div", { className: "text-center py-10 text-muted-foreground" },
                    React.createElement(lucide_react_1.AlertCircle, { className: "h-8 w-8 mx-auto mb-2 opacity-50" }),
                    React.createElement("p", null, "No accounts available for reconciliation."))) : (React.createElement("div", { className: "flex flex-col gap-4 sm:flex-row sm:items-center" },
                    React.createElement("div", { className: "w-full sm:w-1/2" },
                        React.createElement(select_1.Select, { value: selectedAccount || (((_a = accountOptions[0]) === null || _a === void 0 ? void 0 : _a.id) || ""), onValueChange: function (value) { return setSelectedAccount(value); } },
                            React.createElement(select_1.SelectTrigger, null,
                                React.createElement(select_1.SelectValue, { placeholder: "Select bank account" })),
                            React.createElement(select_1.SelectContent, null, accountOptions.map(function (account) { return (React.createElement(select_1.SelectItem, { key: account.id, value: account.id },
                                account.name,
                                " \u2022 ",
                                account.accountNumber)); })))),
                    React.createElement("div", { className: "text-sm text-muted-foreground" }, fileName ? "Latest upload: " + fileName : "Upload a bank statement to begin reconciliation."))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Transactions"),
                    React.createElement("p", { className: "text-sm text-muted-foreground" },
                        transactions.length,
                        " transactions for this account")),
                React.createElement(card_1.CardContent, null, isLoadingReconciliation ? (React.createElement("div", { className: "flex justify-center py-10" },
                    React.createElement(lucide_react_1.Loader2, { className: "h-6 w-6 animate-spin text-muted-foreground" }))) : transactions.length === 0 ? (React.createElement("div", { className: "text-center py-10 text-muted-foreground" },
                    React.createElement(lucide_react_1.AlertCircle, { className: "h-8 w-8 mx-auto mb-2 opacity-50" }),
                    React.createElement("p", null, "No transactions available for reconciliation."))) : (React.createElement("div", { className: "overflow-x-auto" },
                    React.createElement(table_1.Table, null,
                        React.createElement(table_1.TableHeader, null,
                            React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableHead, null, "Date"),
                                React.createElement(table_1.TableHead, null, "Description"),
                                React.createElement(table_1.TableHead, { className: "text-right" }, "Amount"),
                                React.createElement(table_1.TableHead, null, "Status"),
                                React.createElement(table_1.TableHead, null, "Action"))),
                        React.createElement(table_1.TableBody, null, transactions.map(function (txn) {
                            var matched = txn.status === "matched" || matchedLocally.has(txn.id);
                            return (React.createElement(table_1.TableRow, { key: txn.id },
                                React.createElement(table_1.TableCell, null, txn.date ? new Date(txn.date).toLocaleDateString() : "N/A"),
                                React.createElement(table_1.TableCell, null, txn.description || "No description"),
                                React.createElement(table_1.TableCell, { className: "text-right" },
                                    "KSh ",
                                    (txn.amount || 0).toLocaleString()),
                                React.createElement(table_1.TableCell, null,
                                    React.createElement(badge_1.Badge, { variant: matched ? "default" : "secondary" }, matched ? "Matched" : "Unmatched")),
                                React.createElement(table_1.TableCell, null,
                                    React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return matched ? sonner_1.toast.info("Already matched") : handleMatch(txn.id); } }, matched ? React.createElement(lucide_react_1.CheckCircle2, { className: "h-4 w-4" }) : React.createElement(lucide_react_1.Plus, { className: "h-4 w-4" })))));
                        }))))))))));
}
exports["default"] = OrgBankReconciliation;
