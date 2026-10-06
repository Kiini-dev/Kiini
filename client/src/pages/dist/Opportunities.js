"use strict";
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
var react_1 = require("react");
var wouter_1 = require("wouter");
var trpc_1 = require("@/lib/trpc");
var communications_1 = require("@/lib/communications");
var mutationHelpers_1 = require("@/lib/mutationHelpers");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var table_1 = require("@/components/ui/table");
var badge_1 = require("@/components/ui/badge");
var select_1 = require("@/components/ui/select");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var export_utils_1 = require("@/lib/export-utils");
var ListPageToolbar_1 = require("@/components/list-page/ListPageToolbar");
var RowActionsMenu_1 = require("@/components/list-page/RowActionsMenu");
var TableColumnSettings_1 = require("@/components/list-page/TableColumnSettings");
var EnhancedBulkActions_1 = require("@/components/list-page/EnhancedBulkActions");
var checkbox_1 = require("@/components/ui/checkbox");
var alert_dialog_1 = require("@/components/ui/alert-dialog");
var stats_card_1 = require("@/components/ui/stats-card");
function Opportunities() {
    var _this = this;
    var _a = wouter_1.useLocation(), location = _a[0], navigate = _a[1];
    var _b = react_1.useState(""), searchQuery = _b[0], setSearchQuery = _b[1];
    var _c = react_1.useState("all"), stageFilter = _c[0], setStageFilter = _c[1];
    var _d = react_1.useState(false), deleteDialogOpen = _d[0], setDeleteDialogOpen = _d[1];
    var _e = react_1.useState(null), selectedOpportunityId = _e[0], setSelectedOpportunityId = _e[1];
    var _f = react_1.useState(new Set()), selectedOpportunities = _f[0], setSelectedOpportunities = _f[1];
    var oppColumns = [
        { key: "name", label: "Opportunity" },
        { key: "client", label: "Client" },
        { key: "value", label: "Value" },
        { key: "stage", label: "Stage" },
        { key: "probability", label: "Probability" },
        { key: "expectedCloseDate", label: "Expected Close" },
        { key: "owner", label: "Owner" },
        { key: "source", label: "Source" },
    ];
    var _g = TableColumnSettings_1.useColumnVisibility(oppColumns, "opportunities"), visibleColumns = _g.visibleColumns, toggleColumn = _g.toggleColumn, isVisible = _g.isVisible, pageSize = _g.pageSize, updatePageSize = _g.updatePageSize, reset = _g.reset;
    // Fetch real data from backend
    var _h = trpc_1.trpc.opportunities.list.useQuery(), _j = _h.data, data = _j === void 0 ? [] : _j, isLoading = _h.isLoading;
    var utils = trpc_1.trpc.useUtils();
    // Update mutation
    var updateOpportunityMutation = trpc_1.trpc.opportunities.update.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Opportunity updated");
            utils.opportunities.list.invalidate();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to update opportunity");
        }
    });
    // Delete mutation
    var deleteOpportunityMutation = trpc_1.trpc.opportunities["delete"].useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Opportunity deleted successfully");
            utils.opportunities.list.invalidate();
            setDeleteDialogOpen(false);
            setSelectedOpportunityId(null);
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to delete opportunity");
        }
    });
    // Transform backend data to display format
    var opportunities = data.map(function (opp) { return ({
        id: String(opp.id),
        name: opp.name || "Unknown Opportunity",
        client: opp.clientId ? "Client" : "Unknown",
        value: (opp.value || 0) / 100,
        stage: opp.stage || "prospecting",
        probability: opp.probability || 0,
        expectedCloseDate: opp.expectedCloseDate ? new Date(opp.expectedCloseDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        owner: opp.owner || "Unassigned",
        source: opp.source || "Unknown"
    }); });
    var filteredOpportunities = opportunities.filter(function (opp) {
        var matchesSearch = opp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            opp.client.toLowerCase().includes(searchQuery.toLowerCase());
        var matchesStage = stageFilter === "all" || opp.stage === stageFilter;
        return matchesSearch && matchesStage;
    });
    var getStageLabel = function (stage) {
        var labels = {
            prospecting: "Prospecting",
            qualification: "Qualification",
            proposal: "Proposal",
            negotiation: "Negotiation",
            closed_won: "Closed Won",
            closed_lost: "Closed Lost"
        };
        return labels[stage] || stage;
    };
    var getStageVariant = function (stage) {
        switch (stage) {
            case "closed_won":
                return "default";
            case "negotiation":
            case "proposal":
                return "secondary";
            case "closed_lost":
                return "destructive";
            default:
                return "outline";
        }
    };
    var totalValue = opportunities.reduce(function (sum, opp) { return sum + opp.value; }, 0);
    var weightedValue = opportunities.reduce(function (sum, opp) { return sum + (opp.value * opp.probability / 100); }, 0);
    var avgProbability = opportunities.reduce(function (sum, opp) { return sum + opp.probability; }, 0) / opportunities.length;
    var toggleSelectOpp = function (id) {
        setSelectedOpportunities(function (prev) {
            var next = new Set(prev);
            if (next.has(id))
                next["delete"](id);
            else
                next.add(id);
            return next;
        });
    };
    var toggleSelectAllOpps = function () {
        if (selectedOpportunities.size === filteredOpportunities.length) {
            setSelectedOpportunities(new Set());
        }
        else {
            setSelectedOpportunities(new Set(filteredOpportunities.map(function (o) { return o.id; })));
        }
    };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Sales Opportunities", description: "Track and manage your sales pipeline", icon: React.createElement(lucide_react_1.TrendingUp, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Sales", href: "/sales" },
            { label: "Opportunities" },
        ], actions: React.createElement(button_1.Button, { onClick: function () { return navigate("/opportunities/create"); } },
            React.createElement(lucide_react_1.Plus, { className: "mr-2 h-4 w-4" }),
            "New Opportunity") },
        React.createElement("div", { className: "space-y-6" },
            React.createElement("div", { className: "grid gap-4 md:grid-cols-4" },
                React.createElement(stats_card_1.StatsCard, { label: "Pipeline Value", value: React.createElement(React.Fragment, null,
                        "Ksh ",
                        totalValue.toLocaleString()), description: "Total opportunity value", icon: React.createElement(lucide_react_1.DollarSign, { className: "h-5 w-5" }), color: "border-l-orange-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Weighted Value", value: React.createElement(React.Fragment, null,
                        "Ksh ",
                        Math.round(weightedValue).toLocaleString()), description: "Probability-adjusted", icon: React.createElement(lucide_react_1.TrendingUp, { className: "h-5 w-5" }), color: "border-l-green-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Active Deals", value: opportunities.length, description: "In pipeline", icon: React.createElement(lucide_react_1.Target, { className: "h-5 w-5" }), color: "border-l-blue-500" }),
                React.createElement(stats_card_1.StatsCard, { label: "Avg Probability", value: React.createElement(React.Fragment, null,
                        Math.round(avgProbability),
                        "%"), description: "Win probability", icon: React.createElement(lucide_react_1.Users, { className: "h-5 w-5" }), color: "border-l-purple-500" })),
            React.createElement(ListPageToolbar_1.ListPageToolbar, { searchValue: searchQuery, onSearchChange: setSearchQuery, searchPlaceholder: "Search opportunities...", onCreateClick: function () { return navigate("/opportunities/create"); }, createLabel: "New Opportunity", onExportClick: function () { return export_utils_1.downloadCSV(filteredOpportunities.map(function (opp) { return ({ Name: opp.name, Client: opp.client, Value: opp.value, Stage: getStageLabel(opp.stage), Probability: opp.probability, ExpectedClose: opp.expectedCloseDate, Owner: opp.owner, Source: opp.source }); }), "opportunities"); }, onPrintClick: function () { return window.print(); }, showImport: false, filterContent: React.createElement(select_1.Select, { value: stageFilter, onValueChange: setStageFilter },
                    React.createElement(select_1.SelectTrigger, { className: "w-40" },
                        React.createElement(select_1.SelectValue, { placeholder: "All Stages" })),
                    React.createElement(select_1.SelectContent, null,
                        React.createElement(select_1.SelectItem, { value: "all" }, "All Stages"),
                        React.createElement(select_1.SelectItem, { value: "prospecting" }, "Prospecting"),
                        React.createElement(select_1.SelectItem, { value: "qualification" }, "Qualification"),
                        React.createElement(select_1.SelectItem, { value: "proposal" }, "Proposal"),
                        React.createElement(select_1.SelectItem, { value: "negotiation" }, "Negotiation"),
                        React.createElement(select_1.SelectItem, { value: "closed_won" }, "Closed Won"),
                        React.createElement(select_1.SelectItem, { value: "closed_lost" }, "Closed Lost"))) }),
            React.createElement(EnhancedBulkActions_1.EnhancedBulkActions, { selectedCount: selectedOpportunities.size, onClear: function () { return setSelectedOpportunities(new Set()); }, actions: [
                    { id: "updateStage", label: "Update Stage", icon: React.createElement(lucide_react_1.RefreshCw, { className: "h-3.5 w-3.5" }), onClick: function () { var stage = prompt("Enter new stage (prospecting, qualification, proposal, negotiation, closed_won, closed_lost):"); if (stage) {
                            selectedOpportunities.forEach(function (id) { return updateOpportunityMutation.mutate({ id: id, stage: stage }); });
                            setSelectedOpportunities(new Set());
                        } } },
                    EnhancedBulkActions_1.bulkExportAction(selectedOpportunities, opportunities, oppColumns, "opportunities"),
                    EnhancedBulkActions_1.bulkCopyIdsAction(selectedOpportunities),
                    EnhancedBulkActions_1.bulkEmailAction(navigate),
                    EnhancedBulkActions_1.bulkDeleteAction(selectedOpportunities, function (ids) { ids.forEach(function (id) { return deleteOpportunityMutation.mutate(id); }); setSelectedOpportunities(new Set()); }),
                ] }),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardContent, { className: "p-0" },
                    React.createElement("div", { className: "flex items-center justify-between px-4 py-3 border-b" },
                        React.createElement("span", { className: "text-sm text-muted-foreground" },
                            filteredOpportunities.length,
                            " opportunities"),
                        React.createElement(TableColumnSettings_1.TableColumnSettings, { columns: oppColumns, visibleColumns: visibleColumns, onToggleColumn: toggleColumn, onReset: reset, pageSize: pageSize, onPageSizeChange: updatePageSize })),
                    React.createElement("div", { className: "overflow-x-auto" },
                        React.createElement(table_1.Table, null,
                            React.createElement(table_1.TableHeader, null,
                                React.createElement(table_1.TableRow, null,
                                    React.createElement(table_1.TableHead, { className: "w-10" },
                                        React.createElement(checkbox_1.Checkbox, { checked: selectedOpportunities.size === filteredOpportunities.length && filteredOpportunities.length > 0, onCheckedChange: toggleSelectAllOpps })),
                                    isVisible("name") && React.createElement(table_1.TableHead, null, "Opportunity"),
                                    isVisible("client") && React.createElement(table_1.TableHead, null, "Client"),
                                    isVisible("value") && React.createElement(table_1.TableHead, null, "Value"),
                                    isVisible("stage") && React.createElement(table_1.TableHead, null, "Stage"),
                                    isVisible("probability") && React.createElement(table_1.TableHead, null, "Probability"),
                                    isVisible("expectedCloseDate") && React.createElement(table_1.TableHead, null, "Expected Close"),
                                    isVisible("owner") && React.createElement(table_1.TableHead, null, "Owner"),
                                    isVisible("source") && React.createElement(table_1.TableHead, null, "Source"),
                                    React.createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                            React.createElement(table_1.TableBody, null, filteredOpportunities.map(function (opp) { return (React.createElement(table_1.TableRow, { key: opp.id, className: selectedOpportunities.has(opp.id) ? "bg-primary/5" : "" },
                                React.createElement(table_1.TableCell, null,
                                    React.createElement(checkbox_1.Checkbox, { checked: selectedOpportunities.has(opp.id), onCheckedChange: function () { return toggleSelectOpp(opp.id); } })),
                                isVisible("name") && React.createElement(table_1.TableCell, { className: "font-medium" }, opp.name),
                                isVisible("client") && React.createElement(table_1.TableCell, null, opp.client),
                                isVisible("value") && React.createElement(table_1.TableCell, { className: "font-medium" },
                                    "Ksh ",
                                    (opp.value || 0).toLocaleString()),
                                isVisible("stage") && React.createElement(table_1.TableCell, null,
                                    React.createElement(badge_1.Badge, { variant: getStageVariant(opp.stage) }, getStageLabel(opp.stage))),
                                isVisible("probability") && React.createElement(table_1.TableCell, null,
                                    React.createElement("div", { className: "flex items-center gap-2" },
                                        React.createElement("div", { className: "w-16 h-2 bg-muted rounded-full overflow-hidden" },
                                            React.createElement("div", { className: "h-full bg-primary", style: { width: opp.probability + "%" } })),
                                        React.createElement("span", { className: "text-sm font-medium" },
                                            opp.probability,
                                            "%"))),
                                isVisible("expectedCloseDate") && React.createElement(table_1.TableCell, null,
                                    React.createElement("div", { className: "flex items-center gap-2 text-sm text-muted-foreground" },
                                        React.createElement(lucide_react_1.Calendar, { className: "h-3 w-3" }),
                                        new Date(opp.expectedCloseDate).toLocaleDateString())),
                                isVisible("owner") && React.createElement(table_1.TableCell, { className: "text-sm text-muted-foreground" }, opp.owner),
                                isVisible("source") && React.createElement(table_1.TableCell, { className: "text-sm text-muted-foreground" }, opp.source),
                                React.createElement(table_1.TableCell, { className: "text-right" },
                                    React.createElement(RowActionsMenu_1.RowActionsMenu, { primaryActions: [
                                            { label: "View", icon: RowActionsMenu_1.actionIcons.view, onClick: function () { return navigate("/opportunities/" + opp.id); } },
                                            { label: "Edit", icon: React.createElement(lucide_react_1.Pencil, { className: "h-4 w-4" }), onClick: function () { return navigate("/opportunities/" + opp.id + "/edit"); } },
                                            { label: "Delete", icon: RowActionsMenu_1.actionIcons["delete"], onClick: function () { setSelectedOpportunityId(opp.id); setDeleteDialogOpen(true); }, variant: "destructive" },
                                        ], menuActions: [
                                            { label: "Convert to Quote", icon: React.createElement(lucide_react_1.FileText, { className: "h-4 w-4" }), onClick: function () { return navigate("/quotes/new?fromOpportunity=" + opp.id); } },
                                            { label: "Duplicate", icon: RowActionsMenu_1.actionIcons.copy, onClick: function () { return navigate("/opportunities/create?clone=" + opp.id); }, separator: true },
                                            { label: "Send Email", icon: RowActionsMenu_1.actionIcons.email, onClick: function () { return navigate(communications_1.buildCommunicationComposePath(location, opp.clientEmail || "", "Regarding opportunity " + (opp.title || opp.name || opp.id))); } },
                                        ] })))); })))))),
            React.createElement(alert_dialog_1.AlertDialog, { open: deleteDialogOpen, onOpenChange: setDeleteDialogOpen },
                React.createElement(alert_dialog_1.AlertDialogContent, null,
                    React.createElement(alert_dialog_1.AlertDialogTitle, null, "Delete Opportunity"),
                    React.createElement(alert_dialog_1.AlertDialogDescription, null, "Are you sure you want to delete this opportunity? This action cannot be undone."),
                    React.createElement("div", { className: "flex gap-2 justify-end" },
                        React.createElement(alert_dialog_1.AlertDialogCancel, null, "Cancel"),
                        React.createElement(alert_dialog_1.AlertDialogAction, { onClick: function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (!selectedOpportunityId) return [3 /*break*/, 2];
                                            return [4 /*yield*/, mutationHelpers_1["default"](deleteOpportunityMutation, selectedOpportunityId)];
                                        case 1:
                                            _a.sent();
                                            _a.label = 2;
                                        case 2: return [2 /*return*/];
                                    }
                                });
                            }); }, className: "bg-red-600 hover:bg-red-700" }, "Delete")))))));
}
exports["default"] = Opportunities;
