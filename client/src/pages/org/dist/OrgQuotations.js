"use strict";
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var trpc_1 = require("@/lib/trpc");
var OrgLayout_1 = require("@/components/OrgLayout");
var OrgBreadcrumb_1 = require("@/components/OrgBreadcrumb");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var input_1 = require("@/components/ui/input");
var stats_card_1 = require("@/components/ui/stats-card");
var table_1 = require("@/components/ui/table");
var select_1 = require("@/components/ui/select");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var useOrgPermission_1 = require("@/hooks/useOrgPermission");
var date_fns_1 = require("date-fns");
function OrgQuotations() {
    var params = wouter_1.useParams();
    var slug = params.slug;
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var hasPermission = useOrgPermission_1.useOrgPermission().hasPermission;
    var canCreate = hasPermission("quotations");
    var canEdit = hasPermission("quotations");
    var canDelete = hasPermission("quotations");
    var _b = react_1.useState(""), searchQuery = _b[0], setSearchQuery = _b[1];
    var _c = react_1.useState("all"), statusFilter = _c[0], setStatusFilter = _c[1];
    // Fetch quotations data
    var _d = trpc_1.trpc.quotations.list.useQuery(undefined), _e = _d.data, quotationsData = _e === void 0 ? [] : _e, isLoadingQuotations = _d.isLoading;
    var _f = trpc_1.trpc.clients.list.useQuery(undefined).data, clientsData = _f === void 0 ? [] : _f;
    var utils = trpc_1.trpc.useUtils();
    var deleteQuotationMutation = trpc_1.trpc.quotations["delete"].useMutation({
        onSuccess: function () {
            var _a, _b;
            (_b = (_a = utils.quotations.list).invalidate) === null || _b === void 0 ? void 0 : _b.call(_a);
            sonner_1.toast.success("Quotation deleted successfully");
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to delete quotation");
        }
    });
    // Transform data
    var plainQuotationsData = Array.isArray(quotationsData)
        ? quotationsData.map(function (q) { return JSON.parse(JSON.stringify(q)); })
        : [];
    var plainClientsData = Array.isArray(clientsData)
        ? clientsData.map(function (c) { return JSON.parse(JSON.stringify(c)); })
        : [];
    var clientMap = react_1.useMemo(function () {
        var map = {};
        plainClientsData.forEach(function (c) {
            map[c.id] = c.companyName || c.name || "Unknown";
        });
        return map;
    }, [plainClientsData]);
    var quotations = react_1.useMemo(function () {
        return plainQuotationsData.map(function (q) { return ({
            id: q.id,
            quotationNumber: q.quotationNumber || "QT-" + q.id.slice(0, 8),
            client: clientMap[q.clientId] || "Unknown",
            amount: (q.amount || 0) / 100,
            date: q.date ? date_fns_1.format(new Date(q.date), "yyyy-MM-dd") : new Date().toISOString().split("T")[0],
            status: q.status || "draft",
            validTill: q.validTill ? date_fns_1.format(new Date(q.validTill), "yyyy-MM-dd") : ""
        }); });
    }, [plainQuotationsData, clientMap]);
    var filtered = react_1.useMemo(function () {
        return quotations.filter(function (quotation) {
            var matchesSearch = quotation.quotationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                quotation.client.toLowerCase().includes(searchQuery.toLowerCase());
            var matchesStatus = statusFilter === "all" || quotation.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [quotations, searchQuery, statusFilter]);
    var stats = react_1.useMemo(function () {
        var draft = quotations.filter(function (q) { return q.status === "draft"; }).length;
        var sent = quotations.filter(function (q) { return q.status === "sent"; }).length;
        var accepted = quotations.filter(function (q) { return q.status === "accepted"; }).length;
        var totalValue = quotations.reduce(function (sum, q) { return sum + q.amount; }, 0);
        return { draft: draft, sent: sent, accepted: accepted, totalValue: totalValue, count: quotations.length };
    }, [quotations]);
    var handleView = function (id) {
        navigate("/org/" + slug + "/quotations/" + id);
    };
    var handleEdit = function (id) {
        navigate("/org/" + slug + "/quotations/" + id + "/edit");
    };
    var handleDelete = function (id) {
        if (confirm("Are you sure you want to delete this quotation?")) {
            deleteQuotationMutation.mutate(id);
        }
    };
    var handleNewQuotation = function () {
        navigate("/org/" + slug + "/quotations/new");
    };
    return (React.createElement(OrgLayout_1["default"], null,
        React.createElement(OrgBreadcrumb_1["default"], { items: [
                { label: "Dashboard", href: "/org/" + slug + "/dashboard" },
                { label: "Quotations", href: "/org/" + slug + "/quotations" },
            ] }),
        React.createElement("div", { className: "p-6 space-y-6" },
            React.createElement("div", { className: "flex items-center justify-between" },
                React.createElement("div", null,
                    React.createElement("h1", { className: "text-3xl font-bold" }, "Quotations"),
                    React.createElement("p", { className: "text-muted-foreground mt-2" }, "Create and manage customer quotations")),
                canCreate && (React.createElement(button_1.Button, { onClick: handleNewQuotation },
                    React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-2" }),
                    "New Quotation"))),
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4" },
                React.createElement(stats_card_1.StatsCard, { label: "Total Quotations", value: stats.count, icon: React.createElement(lucide_react_1.FileText, { className: "h-4 w-4 text-blue-500" }), color: "border-l-blue-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Draft", value: stats.draft, icon: React.createElement(lucide_react_1.AlertCircle, { className: "h-4 w-4 text-slate-500" }), color: "border-l-slate-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Accepted", value: stats.accepted, icon: React.createElement(lucide_react_1.CheckCircle2, { className: "h-4 w-4 text-emerald-500" }), color: "border-l-emerald-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Total Value", value: "Ksh " + stats.totalValue.toLocaleString(), icon: React.createElement(lucide_react_1.DollarSign, { className: "h-4 w-4 text-violet-500" }), color: "border-l-violet-500" })),
            React.createElement("div", { className: "flex flex-wrap gap-3 items-center" },
                React.createElement("div", { className: "relative flex-1 min-w-[200px]" },
                    React.createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
                    React.createElement(input_1.Input, { placeholder: "Search by quotation # or client...", value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); }, className: "pl-9" })),
                React.createElement(select_1.Select, { value: statusFilter, onValueChange: setStatusFilter },
                    React.createElement(select_1.SelectTrigger, { className: "w-[140px]" },
                        React.createElement(select_1.SelectValue, { placeholder: "Status" })),
                    React.createElement(select_1.SelectContent, null,
                        React.createElement(select_1.SelectItem, { value: "all" }, "All Statuses"),
                        React.createElement(select_1.SelectItem, { value: "draft" }, "Draft"),
                        React.createElement(select_1.SelectItem, { value: "sent" }, "Sent"),
                        React.createElement(select_1.SelectItem, { value: "accepted" }, "Accepted"),
                        React.createElement(select_1.SelectItem, { value: "declined" }, "Declined")))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Quotations List"),
                    React.createElement(card_1.CardDescription, null,
                        filtered.length,
                        " quotations")),
                React.createElement(card_1.CardContent, null, isLoadingQuotations ? (React.createElement("div", { className: "flex justify-center py-8" },
                    React.createElement(lucide_react_1.Loader2, { className: "h-6 w-6 animate-spin text-muted-foreground" }))) : filtered.length === 0 ? (React.createElement("div", { className: "flex flex-col items-center justify-center py-8 text-muted-foreground" },
                    React.createElement(lucide_react_1.AlertCircle, { className: "h-8 w-8 mb-2 opacity-50" }),
                    React.createElement("p", null, "No quotations found"))) : (React.createElement("div", { className: "overflow-x-auto" },
                    React.createElement(table_1.Table, null,
                        React.createElement(table_1.TableHeader, null,
                            React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableHead, null, "Quotation #"),
                                React.createElement(table_1.TableHead, null, "Client"),
                                React.createElement(table_1.TableHead, null, "Amount"),
                                React.createElement(table_1.TableHead, null, "Date"),
                                React.createElement(table_1.TableHead, null, "Valid Till"),
                                React.createElement(table_1.TableHead, null, "Status"),
                                React.createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                        React.createElement(table_1.TableBody, null, filtered.map(function (quotation) { return (React.createElement(table_1.TableRow, { key: quotation.id },
                            React.createElement(table_1.TableCell, { className: "font-mono text-sm" }, quotation.quotationNumber),
                            React.createElement(table_1.TableCell, null, quotation.client),
                            React.createElement(table_1.TableCell, { className: "font-semibold" },
                                "Ksh ",
                                quotation.amount.toLocaleString()),
                            React.createElement(table_1.TableCell, null, quotation.date),
                            React.createElement(table_1.TableCell, null, quotation.validTill || "-"),
                            React.createElement(table_1.TableCell, null,
                                React.createElement(badge_1.Badge, { variant: quotation.status === "accepted"
                                        ? "default"
                                        : quotation.status === "declined"
                                            ? "destructive"
                                            : "outline" }, quotation.status)),
                            React.createElement(table_1.TableCell, { className: "text-right space-x-2" },
                                React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleView(quotation.id); }, title: "View" },
                                    React.createElement(lucide_react_1.Eye, { className: "h-4 w-4" })),
                                canEdit && (React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleEdit(quotation.id); }, title: "Edit" },
                                    React.createElement(lucide_react_1.Edit, { className: "h-4 w-4" }))),
                                canDelete && (React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleDelete(quotation.id); }, title: "Delete" },
                                    React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))))); }))))))))));
}
exports["default"] = OrgQuotations;
