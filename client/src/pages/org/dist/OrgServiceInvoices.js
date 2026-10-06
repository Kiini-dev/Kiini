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
var badge_1 = require("@/components/ui/badge");
var stats_card_1 = require("@/components/ui/stats-card");
var table_1 = require("@/components/ui/table");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var useOrgPermission_1 = require("@/hooks/useOrgPermission");
function OrgServiceInvoices() {
    var params = wouter_1.useParams();
    var slug = params.slug;
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var hasPermission = useOrgPermission_1.useOrgPermission().hasPermission;
    var canCreate = hasPermission("service_invoices");
    var canEdit = hasPermission("service_invoices");
    var canDelete = hasPermission("service_invoices");
    var _b = react_1.useState(""), searchQuery = _b[0], setSearchQuery = _b[1];
    var _c = react_1.useState("all"), statusFilter = _c[0], setStatusFilter = _c[1];
    var _d = trpc_1.trpc.serviceInvoices.list.useQuery(undefined), _e = _d.data, invoices = _e === void 0 ? [] : _e, isLoadingInvoices = _d.isLoading;
    var _f = trpc_1.trpc.clients.list.useQuery(undefined).data, clients = _f === void 0 ? [] : _f;
    var utils = trpc_1.trpc.useUtils();
    var deleteInvoiceMutation = trpc_1.trpc.serviceInvoices["delete"].useMutation({
        onSuccess: function () {
            var _a, _b;
            (_b = (_a = utils.serviceInvoices.list).invalidate) === null || _b === void 0 ? void 0 : _b.call(_a);
            sonner_1.toast.success("Service invoice deleted successfully");
        },
        onError: function (error) {
            sonner_1.toast.error((error === null || error === void 0 ? void 0 : error.message) || "Failed to delete invoice");
        }
    });
    var plainInvoices = Array.isArray(invoices)
        ? invoices.map(function (inv) { return JSON.parse(JSON.stringify(inv)); })
        : [];
    var rows = react_1.useMemo(function () {
        return plainInvoices.map(function (inv) {
            var client = clients.find(function (client) { return client.id === inv.clientId; });
            return {
                id: inv.id,
                number: inv.serviceInvoiceNumber || inv.invoiceNumber || "N/A",
                clientName: (client === null || client === void 0 ? void 0 : client.companyName) || inv.clientName || "Unknown",
                issueDate: inv.issueDate ? new Date(inv.issueDate).toLocaleDateString() : "N/A",
                dueDate: inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "N/A",
                total: inv.total || 0,
                status: inv.status || "draft"
            };
        });
    }, [plainInvoices, clients]);
    var filteredInvoices = react_1.useMemo(function () {
        return rows.filter(function (invoice) {
            var matchesSearch = invoice.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                invoice.clientName.toLowerCase().includes(searchQuery.toLowerCase());
            var matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [rows, searchQuery, statusFilter]);
    var stats = react_1.useMemo(function () {
        var totalAmount = rows.reduce(function (sum, invoice) { return sum + invoice.total; }, 0);
        var pending = rows.filter(function (invoice) { return invoice.status === "sent" || invoice.status === "accepted"; }).length;
        var paid = rows.filter(function (invoice) { return invoice.status === "paid"; }).length;
        return {
            count: rows.length,
            totalAmount: totalAmount,
            pending: pending,
            paid: paid
        };
    }, [rows]);
    var handleView = function (id) { return navigate("/org/" + slug + "/service-invoices/" + id); };
    var handleEdit = function (id) { return navigate("/org/" + slug + "/service-invoices/" + id + "/edit"); };
    var handleDelete = function (id) {
        if (confirm("Delete this service invoice?")) {
            deleteInvoiceMutation.mutate({ id: id });
        }
    };
    var handleNew = function () { return navigate("/org/" + slug + "/service-invoices/new"); };
    return (React.createElement(OrgLayout_1["default"], null,
        React.createElement(OrgBreadcrumb_1["default"], { slug: slug, items: [
                { label: "Dashboard", href: "/org/" + slug + "/dashboard" },
                { label: "Service Invoices", href: "/org/" + slug + "/service-invoices" },
            ] }),
        React.createElement("div", { className: "p-6 space-y-6" },
            React.createElement("div", { className: "flex items-center justify-between gap-4 flex-wrap" },
                React.createElement("div", null,
                    React.createElement("h1", { className: "text-3xl font-bold" }, "Service Invoices"),
                    React.createElement("p", { className: "text-muted-foreground mt-2" }, "Manage invoices for service delivery.")),
                canCreate && (React.createElement(button_1.Button, { onClick: handleNew },
                    React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-2" }),
                    "New Invoice"))),
            React.createElement("div", { className: "grid gap-4 md:grid-cols-4" },
                React.createElement(stats_card_1.StatsCard, { label: "Total Invoices", value: stats.count, color: "border-l-slate-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Total Value", value: "KSh " + (stats.totalAmount / 100).toLocaleString(), color: "border-l-emerald-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Pending", value: stats.pending, color: "border-l-blue-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Paid", value: stats.paid, color: "border-l-green-500" })),
            React.createElement("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" },
                React.createElement("div", { className: "relative flex-1 min-w-[220px]" },
                    React.createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
                    React.createElement(input_1.Input, { placeholder: "Search invoices or clients...", value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); }, className: "pl-9" })),
                React.createElement("div", { className: "min-w-[200px]" },
                    React.createElement("select", { "aria-label": "Filter invoice status", className: "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm", value: statusFilter, onChange: function (e) { return setStatusFilter(e.target.value); } },
                        React.createElement("option", { value: "all" }, "All statuses"),
                        React.createElement("option", { value: "draft" }, "Draft"),
                        React.createElement("option", { value: "sent" }, "Sent"),
                        React.createElement("option", { value: "accepted" }, "Accepted"),
                        React.createElement("option", { value: "paid" }, "Paid"),
                        React.createElement("option", { value: "cancelled" }, "Cancelled")))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Service Invoices"),
                    React.createElement("p", { className: "text-sm text-muted-foreground" },
                        filteredInvoices.length,
                        " invoices")),
                React.createElement(card_1.CardContent, null, isLoadingInvoices ? (React.createElement("div", { className: "flex justify-center py-10" },
                    React.createElement(lucide_react_1.Loader2, { className: "h-6 w-6 animate-spin text-muted-foreground" }))) : filteredInvoices.length === 0 ? (React.createElement("div", { className: "text-center py-10 text-muted-foreground" },
                    React.createElement(lucide_react_1.AlertCircle, { className: "h-8 w-8 mx-auto mb-2 opacity-50" }),
                    React.createElement("p", null, "No invoices match your current filters."))) : (React.createElement("div", { className: "overflow-x-auto" },
                    React.createElement(table_1.Table, null,
                        React.createElement(table_1.TableHeader, null,
                            React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableHead, null, "Invoice #"),
                                React.createElement(table_1.TableHead, null, "Client"),
                                React.createElement(table_1.TableHead, null, "Issue Date"),
                                React.createElement(table_1.TableHead, null, "Due Date"),
                                React.createElement(table_1.TableHead, null, "Total"),
                                React.createElement(table_1.TableHead, null, "Status"),
                                React.createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                        React.createElement(table_1.TableBody, null, filteredInvoices.map(function (invoice) { return (React.createElement(table_1.TableRow, { key: invoice.id },
                            React.createElement(table_1.TableCell, { className: "font-semibold" }, invoice.number),
                            React.createElement(table_1.TableCell, null, invoice.clientName),
                            React.createElement(table_1.TableCell, null, invoice.issueDate),
                            React.createElement(table_1.TableCell, null, invoice.dueDate),
                            React.createElement(table_1.TableCell, null,
                                "KSh ",
                                (invoice.total / 100).toLocaleString()),
                            React.createElement(table_1.TableCell, null,
                                React.createElement(badge_1.Badge, { variant: invoice.status === "paid" ? "default" : invoice.status === "draft" ? "secondary" : "outline" }, invoice.status)),
                            React.createElement(table_1.TableCell, { className: "text-right space-x-2" },
                                React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleView(invoice.id); }, title: "View" },
                                    React.createElement(lucide_react_1.Eye, { className: "h-4 w-4" })),
                                canEdit && (React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleEdit(invoice.id); }, title: "Edit" },
                                    React.createElement(lucide_react_1.Edit, { className: "h-4 w-4" }))),
                                canDelete && (React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleDelete(invoice.id); }, title: "Delete" },
                                    React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))))); }))))))))));
}
exports["default"] = OrgServiceInvoices;
