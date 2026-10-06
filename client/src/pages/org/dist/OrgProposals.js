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
var stageColor = {
    lead: "bg-gray-100 text-gray-800",
    qualified: "bg-blue-100 text-blue-800",
    proposal: "bg-purple-100 text-purple-800",
    negotiation: "bg-orange-100 text-orange-800",
    closed_won: "bg-emerald-100 text-emerald-800",
    closed_lost: "bg-red-100 text-red-800"
};
function OrgProposals() {
    var params = wouter_1.useParams();
    var slug = params.slug;
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var hasPermission = useOrgPermission_1.useOrgPermission().hasPermission;
    var canCreate = hasPermission("proposals");
    var canEdit = hasPermission("proposals");
    var canDelete = hasPermission("proposals");
    var _b = react_1.useState(""), searchQuery = _b[0], setSearchQuery = _b[1];
    var _c = react_1.useState("all"), statusFilter = _c[0], setStatusFilter = _c[1];
    var _d = trpc_1.trpc.opportunities.list.useQuery(undefined), _e = _d.data, opportunities = _e === void 0 ? [] : _e, isLoadingProposals = _d.isLoading;
    var _f = trpc_1.trpc.clients.list.useQuery(undefined).data, clients = _f === void 0 ? [] : _f;
    var utils = trpc_1.trpc.useUtils();
    var deleteProposalMutation = trpc_1.trpc.opportunities["delete"].useMutation({
        onSuccess: function () {
            var _a, _b;
            (_b = (_a = utils.opportunities.list).invalidate) === null || _b === void 0 ? void 0 : _b.call(_a);
            sonner_1.toast.success("Proposal deleted successfully");
        },
        onError: function (error) {
            sonner_1.toast.error((error === null || error === void 0 ? void 0 : error.message) || "Failed to delete proposal");
        }
    });
    var plainOpportunities = Array.isArray(opportunities)
        ? opportunities.map(function (p) { return JSON.parse(JSON.stringify(p)); })
        : [];
    var proposals = react_1.useMemo(function () {
        return plainOpportunities.map(function (opportunity) {
            var client = clients.find(function (client) { return client.id === opportunity.clientId; });
            return {
                id: opportunity.id,
                title: opportunity.title || "Untitled",
                clientName: (client === null || client === void 0 ? void 0 : client.companyName) || opportunity.clientName || "Unknown client",
                value: opportunity.value || 0,
                stage: opportunity.stage || "proposal",
                expectedClose: opportunity.expectedCloseDate ? new Date(opportunity.expectedCloseDate).toLocaleDateString() : "N/A"
            };
        });
    }, [plainOpportunities, clients]);
    var filteredProposals = react_1.useMemo(function () {
        return proposals.filter(function (proposal) {
            var matchesSearch = proposal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                proposal.clientName.toLowerCase().includes(searchQuery.toLowerCase());
            var matchesStatus = statusFilter === "all" || proposal.stage === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [proposals, searchQuery, statusFilter]);
    var stats = react_1.useMemo(function () {
        var totalValue = proposals.reduce(function (sum, item) { return sum + item.value; }, 0);
        var wonCount = proposals.filter(function (item) { return item.stage === "closed_won"; }).length;
        var activeCount = proposals.filter(function (item) { return item.stage !== "closed_won" && item.stage !== "closed_lost"; }).length;
        return {
            count: proposals.length,
            totalValue: totalValue,
            wonCount: wonCount,
            activeCount: activeCount
        };
    }, [proposals]);
    var handleView = function (id) { return navigate("/org/" + slug + "/proposals/" + id); };
    var handleEdit = function (id) { return navigate("/org/" + slug + "/proposals/" + id + "/edit"); };
    var handleDelete = function (id) {
        if (confirm("Are you sure you want to delete this proposal?")) {
            deleteProposalMutation.mutate(id);
        }
    };
    var handleNewProposal = function () { return navigate("/org/" + slug + "/proposals/new"); };
    return (React.createElement(OrgLayout_1["default"], null,
        React.createElement(OrgBreadcrumb_1["default"], { slug: slug, items: [
                { label: "Dashboard", href: "/org/" + slug + "/dashboard" },
                { label: "Proposals", href: "/org/" + slug + "/proposals" },
            ] }),
        React.createElement("div", { className: "p-6 space-y-6" },
            React.createElement("div", { className: "flex items-center justify-between gap-4 flex-wrap" },
                React.createElement("div", null,
                    React.createElement("h1", { className: "text-3xl font-bold" }, "Proposals"),
                    React.createElement("p", { className: "text-muted-foreground mt-2" }, "Manage your sales proposals and pipeline.")),
                canCreate && (React.createElement(button_1.Button, { onClick: handleNewProposal },
                    React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-2" }),
                    "New Proposal"))),
            React.createElement("div", { className: "grid gap-4 md:grid-cols-4" },
                React.createElement(stats_card_1.StatsCard, { label: "Total Proposals", value: stats.count, color: "border-l-slate-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Pipeline Value", value: "KSh " + (stats.totalValue / 100).toLocaleString(), color: "border-l-orange-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Won Proposals", value: stats.wonCount, color: "border-l-emerald-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Open Proposals", value: stats.activeCount, color: "border-l-blue-500" })),
            React.createElement("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" },
                React.createElement("div", { className: "relative flex-1 min-w-[220px]" },
                    React.createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
                    React.createElement(input_1.Input, { placeholder: "Search proposals or clients...", value: searchQuery, onChange: function (e) { return setSearchQuery(e.target.value); }, className: "pl-9" })),
                React.createElement("div", { className: "min-w-[200px]" },
                    React.createElement("select", { "aria-label": "Filter proposal stage", className: "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm", value: statusFilter, onChange: function (e) { return setStatusFilter(e.target.value); } },
                        React.createElement("option", { value: "all" }, "All stages"),
                        React.createElement("option", { value: "lead" }, "Lead"),
                        React.createElement("option", { value: "qualified" }, "Qualified"),
                        React.createElement("option", { value: "proposal" }, "Proposal"),
                        React.createElement("option", { value: "negotiation" }, "Negotiation"),
                        React.createElement("option", { value: "closed_won" }, "Closed Won"),
                        React.createElement("option", { value: "closed_lost" }, "Closed Lost")))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Proposals"),
                    React.createElement("p", { className: "text-sm text-muted-foreground" },
                        filteredProposals.length,
                        " proposals found")),
                React.createElement(card_1.CardContent, null, isLoadingProposals ? (React.createElement("div", { className: "flex justify-center py-10" },
                    React.createElement(lucide_react_1.Loader2, { className: "h-6 w-6 animate-spin text-muted-foreground" }))) : filteredProposals.length === 0 ? (React.createElement("div", { className: "text-center py-10 text-muted-foreground" },
                    React.createElement(lucide_react_1.AlertCircle, { className: "h-8 w-8 mx-auto mb-2 opacity-50" }),
                    React.createElement("p", null, "No proposals match your current filters."))) : (React.createElement("div", { className: "overflow-x-auto" },
                    React.createElement(table_1.Table, null,
                        React.createElement(table_1.TableHeader, null,
                            React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableHead, null, "Title"),
                                React.createElement(table_1.TableHead, null, "Client"),
                                React.createElement(table_1.TableHead, null, "Value"),
                                React.createElement(table_1.TableHead, null, "Stage"),
                                React.createElement(table_1.TableHead, null, "Expected Close"),
                                React.createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                        React.createElement(table_1.TableBody, null, filteredProposals.map(function (proposal) {
                            var _a;
                            return (React.createElement(table_1.TableRow, { key: proposal.id },
                                React.createElement(table_1.TableCell, { className: "font-semibold" }, proposal.title),
                                React.createElement(table_1.TableCell, null, proposal.clientName),
                                React.createElement(table_1.TableCell, null,
                                    "KSh ",
                                    (proposal.value / 100).toLocaleString()),
                                React.createElement(table_1.TableCell, null,
                                    React.createElement("span", { className: "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium " + ((_a = stageColor[proposal.stage]) !== null && _a !== void 0 ? _a : "bg-gray-100 text-gray-800") }, proposal.stage.replace(/_/g, " "))),
                                React.createElement(table_1.TableCell, null, proposal.expectedClose),
                                React.createElement(table_1.TableCell, { className: "text-right space-x-2" },
                                    React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleView(proposal.id); }, title: "View" },
                                        React.createElement(lucide_react_1.Eye, { className: "h-4 w-4" })),
                                    canEdit && (React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleEdit(proposal.id); }, title: "Edit" },
                                        React.createElement(lucide_react_1.Edit, { className: "h-4 w-4" }))),
                                    canDelete && (React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleDelete(proposal.id); }, title: "Delete" },
                                        React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" }))))));
                        }))))))))));
}
exports["default"] = OrgProposals;
