"use strict";
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var trpc_1 = require("@/lib/trpc");
var OrgLayout_1 = require("@/components/OrgLayout");
var OrgBreadcrumb_1 = require("@/components/OrgBreadcrumb");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var stats_card_1 = require("@/components/ui/stats-card");
var table_1 = require("@/components/ui/table");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var useOrgPermission_1 = require("@/hooks/useOrgPermission");
function OrgChartOfAccounts() {
    var params = wouter_1.useParams();
    var slug = params.slug;
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var hasPermission = useOrgPermission_1.useOrgPermission().hasPermission;
    var canCreate = hasPermission("chart_of_accounts");
    var canDelete = hasPermission("chart_of_accounts");
    var _b = react_1.useState(""), searchQuery = _b[0], setSearchQuery = _b[1];
    var _c = react_1.useState("all"), typeFilter = _c[0], setTypeFilter = _c[1];
    var _d = trpc_1.trpc.chartOfAccounts.list.useQuery(undefined), _e = _d.data, accounts = _e === void 0 ? [] : _e, isLoadingAccounts = _d.isLoading;
    var summaryData = trpc_1.trpc.chartOfAccounts.getSummary.useQuery().data;
    var utils = trpc_1.trpc.useUtils();
    var deleteMutation = trpc_1.trpc.chartOfAccounts["delete"].useMutation({
        onSuccess: function () {
            var _a, _b, _c, _d;
            (_b = (_a = utils.chartOfAccounts.list).invalidate) === null || _b === void 0 ? void 0 : _b.call(_a);
            (_d = (_c = utils.chartOfAccounts.getSummary).invalidate) === null || _d === void 0 ? void 0 : _d.call(_c);
            sonner_1.toast.success("Account deleted successfully");
        },
        onError: function (error) {
            sonner_1.toast.error((error === null || error === void 0 ? void 0 : error.message) || "Failed to delete account");
        }
    });
    var plainAccounts = Array.isArray(accounts) ? accounts.map(function (account) { return JSON.parse(JSON.stringify(account)); }) : [];
    var rows = react_1.useMemo(function () {
        return plainAccounts.map(function (account) { return ({
            id: account.id,
            code: account.accountCode || account.code || "",
            name: account.accountName || account.name || "Untitled",
            type: account.accountType || "other",
            balance: account.balance || 0,
            parentName: account.parentAccountName || account.parentName || "—",
            description: account.description || ""
        }); });
    }, [plainAccounts]);
    var filteredRows = react_1.useMemo(function () {
        return rows.filter(function (account) {
            var matchesSearch = account.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                account.name.toLowerCase().includes(searchQuery.toLowerCase());
            var matchesType = typeFilter === "all" || account.type === typeFilter;
            return matchesSearch && matchesType;
        });
    }, [rows, searchQuery, typeFilter]);
    var stats = react_1.useMemo(function () {
        var values = summaryData !== null && summaryData !== void 0 ? summaryData : {
            totalAssets: rows.filter(function (a) { return a.type === "asset"; }).reduce(function (sum, a) { return sum + a.balance; }, 0),
            totalLiabilities: rows.filter(function (a) { return a.type === "liability"; }).reduce(function (sum, a) { return sum + a.balance; }, 0),
            totalEquity: rows.filter(function (a) { return a.type === "equity"; }).reduce(function (sum, a) { return sum + a.balance; }, 0),
            totalRevenue: rows.filter(function (a) { return a.type === "revenue"; }).reduce(function (sum, a) { return sum + a.balance; }, 0),
            totalExpenses: rows.filter(function (a) { return a.type === "expense"; }).reduce(function (sum, a) { return sum + a.balance; }, 0)
        };
        return {
            totalAccounts: rows.length,
            totalAssets: values.totalAssets || 0,
            totalLiabilities: values.totalLiabilities || 0,
            totalEquity: values.totalEquity || 0
        };
    }, [rows, summaryData]);
    var handleView = function (id) { return navigate("/org/" + slug + "/chart-of-accounts/" + id); };
    var handleNew = function () { return navigate("/org/" + slug + "/chart-of-accounts/new"); };
    var handleDelete = function (id) {
        if (confirm("Delete this chart of accounts entry?")) {
            deleteMutation.mutate({ id: id });
        }
    };
    var typeBadge = function (type) {
        var _a;
        var mapping = {
            asset: "bg-blue-100 text-blue-800",
            liability: "bg-red-100 text-red-800",
            equity: "bg-purple-100 text-purple-800",
            revenue: "bg-emerald-100 text-emerald-800",
            expense: "bg-orange-100 text-orange-800",
            other: "bg-slate-100 text-slate-800"
        };
        return (_a = mapping[type]) !== null && _a !== void 0 ? _a : mapping.other;
    };
    return (React.createElement(OrgLayout_1["default"], null,
        React.createElement(OrgBreadcrumb_1["default"], { slug: slug, items: [
                { label: "Dashboard", href: "/org/" + slug + "/dashboard" },
                { label: "Chart of Accounts", href: "/org/" + slug + "/chart-of-accounts" },
            ] }),
        React.createElement("div", { className: "p-6 space-y-6" },
            React.createElement("div", { className: "flex items-center justify-between gap-4 flex-wrap" },
                React.createElement("div", null,
                    React.createElement("h1", { className: "text-3xl font-bold" }, "Chart of Accounts"),
                    React.createElement("p", { className: "text-muted-foreground mt-2" }, "Manage your organization\u2019s accounting structure.")),
                canCreate && (React.createElement(button_1.Button, { onClick: handleNew },
                    React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-2" }),
                    "New Account"))),
            React.createElement("div", { className: "grid gap-4 md:grid-cols-4" },
                React.createElement(stats_card_1.StatsCard, { label: "Total Accounts", value: stats.totalAccounts, color: "border-l-slate-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Total Assets", value: "KSh " + (stats.totalAssets / 100).toLocaleString(), color: "border-l-blue-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Total Liabilities", value: "KSh " + (stats.totalLiabilities / 100).toLocaleString(), color: "border-l-red-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Total Equity", value: "KSh " + (stats.totalEquity / 100).toLocaleString(), color: "border-l-purple-500" })),
            React.createElement("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" },
                React.createElement("div", { className: "relative flex-1 min-w-[220px]" },
                    React.createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
                    React.createElement(input_1.Input, { placeholder: "Search by account name or code...", value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); }, className: "pl-9" })),
                React.createElement("div", { className: "min-w-[200px]" },
                    React.createElement("select", { "aria-label": "Filter account type", className: "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm", value: typeFilter, onChange: function (e) { return setTypeFilter(e.target.value); } },
                        React.createElement("option", { value: "all" }, "All account types"),
                        React.createElement("option", { value: "asset" }, "Asset"),
                        React.createElement("option", { value: "liability" }, "Liability"),
                        React.createElement("option", { value: "equity" }, "Equity"),
                        React.createElement("option", { value: "revenue" }, "Revenue"),
                        React.createElement("option", { value: "expense" }, "Expense")))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Accounts"),
                    React.createElement("p", { className: "text-sm text-muted-foreground" },
                        filteredRows.length,
                        " accounts")),
                React.createElement(card_1.CardContent, null, isLoadingAccounts ? (React.createElement("div", { className: "flex justify-center py-10" },
                    React.createElement(lucide_react_1.Loader2, { className: "h-6 w-6 animate-spin text-muted-foreground" }))) : filteredRows.length === 0 ? (React.createElement("div", { className: "text-center py-10 text-muted-foreground" },
                    React.createElement(lucide_react_1.AlertCircle, { className: "h-8 w-8 mx-auto mb-2 opacity-50" }),
                    React.createElement("p", null, "No accounts found."))) : (React.createElement("div", { className: "overflow-x-auto" },
                    React.createElement(table_1.Table, null,
                        React.createElement(table_1.TableHeader, null,
                            React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableHead, null, "Code"),
                                React.createElement(table_1.TableHead, null, "Name"),
                                React.createElement(table_1.TableHead, null, "Type"),
                                React.createElement(table_1.TableHead, null, "Balance"),
                                React.createElement(table_1.TableHead, null, "Parent"),
                                React.createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                        React.createElement(table_1.TableBody, null, filteredRows.map(function (account) { return (React.createElement(table_1.TableRow, { key: account.id },
                            React.createElement(table_1.TableCell, { className: "font-semibold" }, account.code),
                            React.createElement(table_1.TableCell, null, account.name),
                            React.createElement(table_1.TableCell, null,
                                React.createElement("span", { className: "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium " + typeBadge(account.type) }, account.type)),
                            React.createElement(table_1.TableCell, null,
                                "KSh ",
                                (account.balance / 100).toLocaleString()),
                            React.createElement(table_1.TableCell, null, account.parentName),
                            React.createElement(table_1.TableCell, { className: "text-right space-x-2" },
                                React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleView(account.id); }, title: "View" },
                                    React.createElement(lucide_react_1.Eye, { className: "h-4 w-4" })),
                                canDelete && (React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleDelete(account.id); }, title: "Delete" },
                                    React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))))); }))))))))));
}
exports["default"] = OrgChartOfAccounts;
