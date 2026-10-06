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
function OrgDebitNotes() {
    var params = wouter_1.useParams();
    var slug = params.slug;
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var hasPermission = useOrgPermission_1.useOrgPermission().hasPermission;
    var canCreate = hasPermission("debit_notes");
    var canEdit = hasPermission("debit_notes");
    var canDelete = hasPermission("debit_notes");
    var _b = react_1.useState(""), searchQuery = _b[0], setSearchQuery = _b[1];
    var _c = react_1.useState("all"), statusFilter = _c[0], setStatusFilter = _c[1];
    var _d = trpc_1.trpc.debitNotes.list.useQuery(undefined), _e = _d.data, debitNotes = _e === void 0 ? [] : _e, isLoadingDebitNotes = _d.isLoading;
    var _f = trpc_1.trpc.suppliers.list.useQuery(undefined).data, suppliers = _f === void 0 ? [] : _f;
    var utils = trpc_1.trpc.useUtils();
    var deleteDebitNoteMutation = trpc_1.trpc.debitNotes["delete"].useMutation({
        onSuccess: function () {
            var _a, _b;
            (_b = (_a = utils.debitNotes.list).invalidate) === null || _b === void 0 ? void 0 : _b.call(_a);
            sonner_1.toast.success("Debit note deleted successfully");
        },
        onError: function (error) {
            sonner_1.toast.error((error === null || error === void 0 ? void 0 : error.message) || "Failed to delete debit note");
        }
    });
    var plainDebitNotes = Array.isArray(debitNotes)
        ? debitNotes.map(function (note) { return JSON.parse(JSON.stringify(note)); })
        : [];
    var notes = react_1.useMemo(function () {
        return plainDebitNotes.map(function (note) {
            var supplier = suppliers.find(function (sup) { return sup.id === note.supplierId; });
            return {
                id: note.id,
                number: note.debitNoteNumber || note.number || "N/A",
                supplierName: (supplier === null || supplier === void 0 ? void 0 : supplier.companyName) || note.supplierName || "Unknown",
                issueDate: note.issueDate ? new Date(note.issueDate).toLocaleDateString() : "N/A",
                total: note.total || 0,
                status: note.status || "draft"
            };
        });
    }, [plainDebitNotes, suppliers]);
    var filteredNotes = react_1.useMemo(function () {
        return notes.filter(function (note) {
            var matchesSearch = note.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                note.supplierName.toLowerCase().includes(searchQuery.toLowerCase());
            var matchesStatus = statusFilter === "all" || note.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [notes, searchQuery, statusFilter]);
    var stats = react_1.useMemo(function () {
        var totalAmount = notes.reduce(function (sum, note) { return sum + note.total; }, 0);
        var approved = notes.filter(function (note) { return note.status === "approved"; }).length;
        var draft = notes.filter(function (note) { return note.status === "draft"; }).length;
        return {
            count: notes.length,
            totalAmount: totalAmount,
            approved: approved,
            draft: draft
        };
    }, [notes]);
    var handleView = function (id) { return navigate("/org/" + slug + "/debit-notes/" + id); };
    var handleEdit = function (id) { return navigate("/org/" + slug + "/debit-notes/" + id + "/edit"); };
    var handleDelete = function (id) {
        if (confirm("Delete this debit note?")) {
            deleteDebitNoteMutation.mutate({ id: id });
        }
    };
    var handleNew = function () { return navigate("/org/" + slug + "/debit-notes/new"); };
    return (React.createElement(OrgLayout_1["default"], null,
        React.createElement(OrgBreadcrumb_1["default"], { items: [
                { label: "Dashboard", href: "/org/" + slug + "/dashboard" },
                { label: "Debit Notes", href: "/org/" + slug + "/debit-notes" },
            ] }),
        React.createElement("div", { className: "p-6 space-y-6" },
            React.createElement("div", { className: "flex items-center justify-between gap-4 flex-wrap" },
                React.createElement("div", null,
                    React.createElement("h1", { className: "text-3xl font-bold" }, "Debit Notes"),
                    React.createElement("p", { className: "text-muted-foreground mt-2" }, "Manage supplier debit notes and adjustments.")),
                canCreate && (React.createElement(button_1.Button, { onClick: handleNew },
                    React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-2" }),
                    "New Debit Note"))),
            React.createElement("div", { className: "grid gap-4 md:grid-cols-4" },
                React.createElement(stats_card_1.StatsCard, { label: "Total Debit Notes", value: stats.count, color: "border-l-slate-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Total Amount", value: "KSh " + (stats.totalAmount / 100).toLocaleString(), color: "border-l-emerald-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Approved", value: stats.approved, color: "border-l-blue-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Draft", value: stats.draft, color: "border-l-orange-500" })),
            React.createElement("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" },
                React.createElement("div", { className: "relative flex-1 min-w-[220px]" },
                    React.createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
                    React.createElement(input_1.Input, { placeholder: "Search debit note number or supplier...", value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); }, className: "pl-9" })),
                React.createElement("div", { className: "min-w-[200px]" },
                    React.createElement("select", { "aria-label": "Filter debit note status", className: "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm", value: statusFilter, onChange: function (e) { return setStatusFilter(e.target.value); } },
                        React.createElement("option", { value: "all" }, "All statuses"),
                        React.createElement("option", { value: "draft" }, "Draft"),
                        React.createElement("option", { value: "approved" }, "Approved"),
                        React.createElement("option", { value: "settled" }, "Settled")))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Debit Notes"),
                    React.createElement("p", { className: "text-sm text-muted-foreground" },
                        filteredNotes.length,
                        " debit notes")),
                React.createElement(card_1.CardContent, null, isLoadingDebitNotes ? (React.createElement("div", { className: "flex justify-center py-10" },
                    React.createElement(lucide_react_1.Loader2, { className: "h-6 w-6 animate-spin text-muted-foreground" }))) : filteredNotes.length === 0 ? (React.createElement("div", { className: "text-center py-10 text-muted-foreground" },
                    React.createElement(lucide_react_1.AlertCircle, { className: "h-8 w-8 mx-auto mb-2 opacity-50" }),
                    React.createElement("p", null, "No debit notes found."))) : (React.createElement("div", { className: "overflow-x-auto" },
                    React.createElement(table_1.Table, null,
                        React.createElement(table_1.TableHeader, null,
                            React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableHead, null, "Debit Note #"),
                                React.createElement(table_1.TableHead, null, "Supplier"),
                                React.createElement(table_1.TableHead, null, "Issue Date"),
                                React.createElement(table_1.TableHead, null, "Total"),
                                React.createElement(table_1.TableHead, null, "Status"),
                                React.createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                        React.createElement(table_1.TableBody, null, filteredNotes.map(function (note) { return (React.createElement(table_1.TableRow, { key: note.id },
                            React.createElement(table_1.TableCell, { className: "font-semibold" }, note.number),
                            React.createElement(table_1.TableCell, null, note.supplierName),
                            React.createElement(table_1.TableCell, null, note.issueDate),
                            React.createElement(table_1.TableCell, null,
                                "KSh ",
                                (note.total / 100).toLocaleString()),
                            React.createElement(table_1.TableCell, null,
                                React.createElement(badge_1.Badge, { variant: note.status === "approved" ? "default" : note.status === "draft" ? "secondary" : "outline" }, note.status)),
                            React.createElement(table_1.TableCell, { className: "text-right space-x-2" },
                                React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleView(note.id); }, title: "View" },
                                    React.createElement(lucide_react_1.Eye, { className: "h-4 w-4" })),
                                canEdit && (React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleEdit(note.id); }, title: "Edit" },
                                    React.createElement(lucide_react_1.Edit, { className: "h-4 w-4" }))),
                                canDelete && (React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleDelete(note.id); }, title: "Delete" },
                                    React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))))); }))))))))));
}
exports["default"] = OrgDebitNotes;
