"use strict";
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var trpc_1 = require("@/lib/trpc");
var OrgModuleLayout_1 = require("@/components/OrgModuleLayout");
var SummaryStatCards_1 = require("@/components/list-page/SummaryStatCards");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var badge_1 = require("@/components/ui/badge");
var skeleton_1 = require("@/components/ui/skeleton");
var table_1 = require("@/components/ui/table");
var select_1 = require("@/components/ui/select");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var date_fns_1 = require("date-fns");
var useOrgPermission_1 = require("@/hooks/useOrgPermission");
var STATUS_STYLES = {
    draft: "bg-slate-500/15 text-slate-600 dark:text-slate-300 border-slate-500/30",
    sent: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
    accepted: "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30",
    rejected: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30",
    expired: "bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/30"
};
function StatusBadge(_a) {
    var _b;
    var status = _a.status;
    var s = (status !== null && status !== void 0 ? status : "draft").toLowerCase();
    return (react_1["default"].createElement(badge_1.Badge, { variant: "outline", className: "capitalize " + ((_b = STATUS_STYLES[s]) !== null && _b !== void 0 ? _b : "bg-muted text-muted-foreground") }, s));
}
function OrgEstimates() {
    var params = wouter_1.useParams();
    var slug = params.slug;
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var _b = react_1.useState(""), search = _b[0], setSearch = _b[1];
    var _c = react_1.useState("all"), statusFilter = _c[0], setStatusFilter = _c[1];
    var hasPermission = useOrgPermission_1.useOrgPermission().hasPermission;
    var utils = trpc_1.trpc.useUtils();
    var _d = trpc_1.trpc.multiTenancy.getOrgEstimates.useQuery({ slug: slug, search: search || undefined }, { keepPreviousData: true }), _e = _d.data, estimates = _e === void 0 ? [] : _e, isLoading = _d.isLoading;
    var updateStatusMutation = trpc_1.trpc.multiTenancy.updateOrgEstimateStatus.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Estimate status updated");
            utils.multiTenancy.getOrgEstimates.invalidate();
        },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var deleteMutation = trpc_1.trpc.multiTenancy.deleteOrgEstimate.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Estimate deleted");
            utils.multiTenancy.getOrgEstimates.invalidate();
        },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var filteredEstimates = estimates.filter(function (estimate) {
        if (statusFilter === "all")
            return true;
        return estimate.status === statusFilter;
    });
    var totalEstimates = estimates.length;
    var sentEstimates = estimates.filter(function (e) { return e.status === "sent"; }).length;
    var acceptedEstimates = estimates.filter(function (e) { return e.status === "accepted"; }).length;
    var totalValue = estimates.reduce(function (sum, e) { return sum + Number(e.total || 0); }, 0);
    var summaryStats = [
        { label: "Total Estimates", value: String(totalEstimates), trend: undefined },
        { label: "Sent", value: String(sentEstimates), trend: undefined },
        { label: "Accepted", value: String(acceptedEstimates), trend: undefined },
        { label: "Total Value", value: "KES " + totalValue.toLocaleString(), trend: undefined },
    ];
    var handleStatusChange = function (estimateId, status) {
        if (!hasPermission('estimates', 'update')) {
            sonner_1.toast.error("You don't have permission to update estimates");
            return;
        }
        updateStatusMutation.mutate({
            slug: slug,
            id: estimateId,
            status: status
        });
    };
    var handleDelete = function (id) {
        if (!hasPermission('estimates', 'delete')) {
            sonner_1.toast.error("You don't have permission to delete estimates");
            return;
        }
        if (confirm("Are you sure you want to delete this estimate?")) {
            deleteMutation.mutate({ slug: slug, id: id });
        }
    };
    var handleView = function (id) {
        navigate("/org/" + slug + "/estimates/" + id);
    };
    var handleEdit = function (id) {
        navigate("/org/" + slug + "/estimates/" + id + "/edit");
    };
    var handleNewEstimate = function () {
        navigate("/org/" + slug + "/estimates/create");
    };
    if (!hasPermission('estimates', 'read')) {
        return (react_1["default"].createElement(OrgModuleLayout_1.OrgModuleLayout, { title: "Estimates", description: "Manage your organization estimates", icon: lucide_react_1.FileText, breadcrumbs: [
                { label: "Dashboard", href: "/org/" + slug + "/dashboard" },
                { label: "Estimates" },
            ], backLink: "/org/" + slug + "/dashboard", hasAccess: false, accessDeniedMessage: "You don't have permission to view estimates." },
            react_1["default"].createElement("div", { className: "flex flex-col items-center justify-center py-24 text-center" },
                react_1["default"].createElement(lucide_react_1.AlertCircle, { className: "h-16 w-16 text-muted-foreground mb-4" }),
                react_1["default"].createElement("p", { className: "text-muted-foreground" }, "You don't have permission to view estimates."))));
    }
    return (react_1["default"].createElement(OrgModuleLayout_1.OrgModuleLayout, { title: "Estimates", description: "Manage your organization estimates and quotes", icon: lucide_react_1.FileText, breadcrumbs: [
            { label: "Dashboard", href: "/org/" + slug + "/dashboard" },
            { label: "Estimates" },
        ], actions: hasPermission('estimates', 'create') ? (react_1["default"].createElement(button_1.Button, { size: "sm", onClick: handleNewEstimate },
            react_1["default"].createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-1" }),
            " New Estimate")) : undefined, backLink: "/org/" + slug + "/dashboard", hasAccess: true },
        react_1["default"].createElement("div", { className: "space-y-6" },
            react_1["default"].createElement(SummaryStatCards_1.SummaryStatCards, { cards: summaryStats, isLoading: isLoading }),
            react_1["default"].createElement("div", { className: "flex flex-wrap gap-3 items-center" },
                react_1["default"].createElement("div", { className: "relative flex-1 max-w-sm" },
                    react_1["default"].createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
                    react_1["default"].createElement(input_1.Input, { placeholder: "Search estimates...", value: search, onChange: function (e) { return setSearch(e.target.value); }, className: "pl-9" })),
                react_1["default"].createElement(select_1.Select, { value: statusFilter, onValueChange: setStatusFilter },
                    react_1["default"].createElement(select_1.SelectTrigger, { className: "w-[140px]" },
                        react_1["default"].createElement(select_1.SelectValue, { placeholder: "Status" })),
                    react_1["default"].createElement(select_1.SelectContent, null,
                        react_1["default"].createElement(select_1.SelectItem, { value: "all" }, "All Statuses"),
                        react_1["default"].createElement(select_1.SelectItem, { value: "draft" }, "Draft"),
                        react_1["default"].createElement(select_1.SelectItem, { value: "sent" }, "Sent"),
                        react_1["default"].createElement(select_1.SelectItem, { value: "accepted" }, "Accepted"),
                        react_1["default"].createElement(select_1.SelectItem, { value: "rejected" }, "Rejected"),
                        react_1["default"].createElement(select_1.SelectItem, { value: "expired" }, "Expired")))),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardContent, { className: "p-0" }, isLoading ? (react_1["default"].createElement("div", { className: "p-6 space-y-3" }, Array.from({ length: 6 }).map(function (_, i) { return react_1["default"].createElement(skeleton_1.Skeleton, { key: i, className: "h-16 rounded" }); }))) : filteredEstimates.length === 0 ? (react_1["default"].createElement("div", { className: "py-16 text-center" },
                    react_1["default"].createElement(lucide_react_1.FileText, { className: "h-10 w-10 text-muted-foreground/20 mx-auto mb-3" }),
                    react_1["default"].createElement("p", { className: "text-muted-foreground text-sm" }, search || statusFilter !== "all"
                        ? "No estimates match your filters"
                        : "No estimates yet"),
                    hasPermission('estimates', 'create') && (react_1["default"].createElement(button_1.Button, { className: "mt-4", size: "sm", onClick: handleNewEstimate },
                        react_1["default"].createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-1" }),
                        " Create First Estimate")))) : (react_1["default"].createElement("div", { className: "overflow-x-auto" },
                    react_1["default"].createElement(table_1.Table, null,
                        react_1["default"].createElement(table_1.TableHeader, null,
                            react_1["default"].createElement(table_1.TableRow, null,
                                react_1["default"].createElement(table_1.TableHead, null, "Estimate #"),
                                react_1["default"].createElement(table_1.TableHead, null, "Client"),
                                react_1["default"].createElement(table_1.TableHead, null, "Amount"),
                                react_1["default"].createElement(table_1.TableHead, null, "Status"),
                                react_1["default"].createElement(table_1.TableHead, null, "Valid Until"),
                                react_1["default"].createElement(table_1.TableHead, null, "Created"),
                                react_1["default"].createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                        react_1["default"].createElement(table_1.TableBody, null, filteredEstimates.map(function (estimate) {
                            var _a, _b;
                            return (react_1["default"].createElement(table_1.TableRow, { key: estimate.id, className: "hover:bg-muted/30" },
                                react_1["default"].createElement(table_1.TableCell, null,
                                    react_1["default"].createElement("div", null,
                                        react_1["default"].createElement("p", { className: "font-semibold" }, estimate.estimateNumber || "EST-" + estimate.id.slice(-6)))),
                                react_1["default"].createElement(table_1.TableCell, null,
                                    react_1["default"].createElement("p", { className: "text-sm" }, ((_a = estimate.client) === null || _a === void 0 ? void 0 : _a.name) || "—")),
                                react_1["default"].createElement(table_1.TableCell, null,
                                    react_1["default"].createElement("div", { className: "flex items-center" },
                                        react_1["default"].createElement(lucide_react_1.DollarSign, { className: "w-4 h-4 mr-1" }),
                                        react_1["default"].createElement("p", { className: "font-semibold" }, ((_b = estimate.total) === null || _b === void 0 ? void 0 : _b.toLocaleString()) || "0"))),
                                react_1["default"].createElement(table_1.TableCell, null,
                                    react_1["default"].createElement(select_1.Select, { value: estimate.status || "draft", onValueChange: function (value) { return handleStatusChange(estimate.id, value); }, disabled: !hasPermission('estimates', 'update') },
                                        react_1["default"].createElement(select_1.SelectTrigger, { className: "w-32" },
                                            react_1["default"].createElement(select_1.SelectValue, null)),
                                        react_1["default"].createElement(select_1.SelectContent, null,
                                            react_1["default"].createElement(select_1.SelectItem, { value: "draft" }, "Draft"),
                                            react_1["default"].createElement(select_1.SelectItem, { value: "sent" }, "Sent"),
                                            react_1["default"].createElement(select_1.SelectItem, { value: "accepted" }, "Accepted"),
                                            react_1["default"].createElement(select_1.SelectItem, { value: "rejected" }, "Rejected"),
                                            react_1["default"].createElement(select_1.SelectItem, { value: "expired" }, "Expired")))),
                                react_1["default"].createElement(table_1.TableCell, null, estimate.validUntil ? (react_1["default"].createElement("div", { className: "flex items-center" },
                                    react_1["default"].createElement(lucide_react_1.Calendar, { className: "w-4 h-4 mr-1" }),
                                    react_1["default"].createElement("p", { className: "text-sm" }, date_fns_1.format(new Date(estimate.validUntil), "MMM dd, yyyy")))) : ("—")),
                                react_1["default"].createElement(table_1.TableCell, null,
                                    react_1["default"].createElement("p", { className: "text-sm" }, date_fns_1.format(new Date(estimate.createdAt), "MMM dd, yyyy"))),
                                react_1["default"].createElement(table_1.TableCell, { className: "text-right space-x-2" },
                                    react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleView(estimate.id); }, title: "View" },
                                        react_1["default"].createElement(lucide_react_1.Eye, { className: "h-4 w-4" })),
                                    hasPermission('estimates', 'update') && (react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleEdit(estimate.id); }, title: "Edit" },
                                        react_1["default"].createElement(lucide_react_1.Edit, { className: "h-4 w-4" }))),
                                    hasPermission('estimates', 'delete') && (react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleDelete(estimate.id); }, title: "Delete" },
                                        react_1["default"].createElement(lucide_react_1.Trash2, { className: "h-4 w-4" }))))));
                        }))))))))));
}
exports["default"] = OrgEstimates;
