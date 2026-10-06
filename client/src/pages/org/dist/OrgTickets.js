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
var STATUS_STYLES = {
    open: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
    "in-progress": "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/30",
    in_progress: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/30",
    resolved: "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30",
    closed: "bg-slate-500/15 text-slate-600 dark:text-slate-300 border-slate-500/30",
    cancelled: "bg-slate-500/15 text-slate-600 dark:text-slate-300 border-slate-500/30"
};
var PRIORITY_STYLES = {
    low: "bg-slate-500/15 text-slate-600 dark:text-slate-300 border-slate-500/30",
    medium: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
    high: "bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/30",
    urgent: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30",
    critical: "bg-red-600/15 text-red-700 dark:text-red-400 border-red-600/30"
};
function StatusBadge(_a) {
    var _b;
    var status = _a.status;
    var s = (status !== null && status !== void 0 ? status : "open").toLowerCase();
    var label = s.replace("_", "-");
    return (react_1["default"].createElement(badge_1.Badge, { variant: "outline", className: "capitalize " + ((_b = STATUS_STYLES[s]) !== null && _b !== void 0 ? _b : "bg-muted text-muted-foreground") }, label));
}
function PriorityBadge(_a) {
    var _b;
    var priority = _a.priority;
    var p = (priority !== null && priority !== void 0 ? priority : "medium").toLowerCase();
    return (react_1["default"].createElement(badge_1.Badge, { variant: "outline", className: "capitalize " + ((_b = PRIORITY_STYLES[p]) !== null && _b !== void 0 ? _b : "bg-muted text-muted-foreground") }, p));
}
function OrgTickets() {
    var _a, _b, _c;
    var params = wouter_1.useParams();
    var slug = params.slug;
    var _d = wouter_1.useLocation(), navigate = _d[1];
    var _e = react_1.useState(""), search = _e[0], setSearch = _e[1];
    var _f = react_1.useState("all"), activeStatus = _f[0], setActiveStatus = _f[1];
    var myOrgData = trpc_1.trpc.multiTenancy.getMyOrg.useQuery(undefined, { staleTime: 300000 }).data;
    var featureMap = (_a = myOrgData === null || myOrgData === void 0 ? void 0 : myOrgData.featureMap) !== null && _a !== void 0 ? _a : {};
    var _g = trpc_1.trpc.tickets.list.useQuery({ limit: 100 }, { staleTime: 60000, enabled: !myOrgData || !!featureMap.tickets }), ticketsData = _g.data, isLoading = _g.isLoading;
    var accessGranted = !myOrgData || featureMap.tickets;
    var allTickets = Array.isArray(ticketsData) ? ticketsData : (_c = (_b = ticketsData) === null || _b === void 0 ? void 0 : _b.data) !== null && _c !== void 0 ? _c : [];
    var filtered = allTickets.filter(function (t) {
        var _a, _b, _c, _d, _e;
        var matchStatus = activeStatus === "all" ||
            ((_a = t.status) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === activeStatus ||
            ((_b = t.status) === null || _b === void 0 ? void 0 : _b.toLowerCase()) === activeStatus.replace("-", "_");
        var matchSearch = !search || ((_c = t.title) === null || _c === void 0 ? void 0 : _c.toLowerCase().includes(search.toLowerCase())) || ((_d = t.category) === null || _d === void 0 ? void 0 : _d.toLowerCase().includes(search.toLowerCase())) || ((_e = t.description) === null || _e === void 0 ? void 0 : _e.toLowerCase().includes(search.toLowerCase()));
        return matchStatus && matchSearch;
    });
    var total = allTickets.length;
    var open = allTickets.filter(function (t) { return t.status === "open"; }).length;
    var inProgress = allTickets.filter(function (t) { return ["in-progress", "in_progress"].includes(t.status); }).length;
    var resolved = allTickets.filter(function (t) { return t.status === "resolved"; }).length;
    var summaryStats = [
        { label: "Total Tickets", value: String(total), trend: undefined },
        { label: "Open", value: String(open), trend: undefined },
        { label: "In Progress", value: String(inProgress), trend: undefined },
        { label: "Resolved", value: String(resolved), trend: undefined },
    ];
    var handleView = function (id) {
        navigate("/org/" + slug + "/tickets/" + id);
    };
    var handleEdit = function (id) {
        navigate("/org/" + slug + "/tickets/" + id + "/edit");
    };
    var handleNewTicket = function () {
        navigate("/org/" + slug + "/tickets/create");
    };
    if (!accessGranted) {
        return (react_1["default"].createElement(OrgModuleLayout_1.OrgModuleLayout, { title: "Tickets", description: "Manage your organization support tickets", icon: lucide_react_1.Ticket, breadcrumbs: [
                { label: "Dashboard", href: "/org/" + slug + "/dashboard" },
                { label: "Tickets" },
            ], backLink: "/org/" + slug + "/dashboard", hasAccess: false, accessDeniedMessage: "Tickets feature is not enabled for your organization plan." },
            react_1["default"].createElement("div", { className: "flex flex-col items-center justify-center py-24 text-center" },
                react_1["default"].createElement(lucide_react_1.AlertCircle, { className: "h-16 w-16 text-muted-foreground mb-4" }),
                react_1["default"].createElement("p", { className: "text-muted-foreground" }, "Tickets feature is not available in your current plan."))));
    }
    return (react_1["default"].createElement(OrgModuleLayout_1.OrgModuleLayout, { title: "Tickets", description: "Manage your organization support tickets and issues", icon: lucide_react_1.Ticket, breadcrumbs: [
            { label: "Dashboard", href: "/org/" + slug + "/dashboard" },
            { label: "Tickets" },
        ], actions: react_1["default"].createElement(button_1.Button, { size: "sm", onClick: handleNewTicket },
            react_1["default"].createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-1" }),
            " New Ticket"), backLink: "/org/" + slug + "/dashboard", hasAccess: true },
        react_1["default"].createElement("div", { className: "space-y-6" },
            react_1["default"].createElement(SummaryStatCards_1.SummaryStatCards, { cards: summaryStats, isLoading: isLoading }),
            react_1["default"].createElement("div", { className: "flex flex-wrap gap-3 items-center" },
                react_1["default"].createElement("div", { className: "relative flex-1 max-w-sm" },
                    react_1["default"].createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
                    react_1["default"].createElement(input_1.Input, { placeholder: "Search tickets...", value: search, onChange: function (e) { return setSearch(e.target.value); }, className: "pl-9" })),
                react_1["default"].createElement(select_1.Select, { value: activeStatus, onValueChange: setActiveStatus },
                    react_1["default"].createElement(select_1.SelectTrigger, { className: "w-[140px]" },
                        react_1["default"].createElement(select_1.SelectValue, { placeholder: "Status" })),
                    react_1["default"].createElement(select_1.SelectContent, null,
                        react_1["default"].createElement(select_1.SelectItem, { value: "all" }, "All Statuses"),
                        react_1["default"].createElement(select_1.SelectItem, { value: "open" }, "Open"),
                        react_1["default"].createElement(select_1.SelectItem, { value: "in-progress" }, "In Progress"),
                        react_1["default"].createElement(select_1.SelectItem, { value: "resolved" }, "Resolved"),
                        react_1["default"].createElement(select_1.SelectItem, { value: "closed" }, "Closed")))),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardContent, { className: "p-0" }, isLoading ? (react_1["default"].createElement("div", { className: "p-6 space-y-3" }, Array.from({ length: 6 }).map(function (_, i) { return react_1["default"].createElement(skeleton_1.Skeleton, { key: i, className: "h-16 rounded" }); }))) : filtered.length === 0 ? (react_1["default"].createElement("div", { className: "py-16 text-center" },
                    react_1["default"].createElement(lucide_react_1.Ticket, { className: "h-10 w-10 text-muted-foreground/20 mx-auto mb-3" }),
                    react_1["default"].createElement("p", { className: "text-muted-foreground text-sm" }, search || activeStatus !== "all" ? "No tickets match your filters" : "No tickets yet"))) : (react_1["default"].createElement("div", { className: "overflow-x-auto" },
                    react_1["default"].createElement(table_1.Table, null,
                        react_1["default"].createElement(table_1.TableHeader, null,
                            react_1["default"].createElement(table_1.TableRow, null,
                                react_1["default"].createElement(table_1.TableHead, null, "Title"),
                                react_1["default"].createElement(table_1.TableHead, null, "Category"),
                                react_1["default"].createElement(table_1.TableHead, null, "Priority"),
                                react_1["default"].createElement(table_1.TableHead, null, "Status"),
                                react_1["default"].createElement(table_1.TableHead, null, "Created"),
                                react_1["default"].createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                        react_1["default"].createElement(table_1.TableBody, null, filtered.map(function (t) { return (react_1["default"].createElement(table_1.TableRow, { key: t.id, className: "hover:bg-muted/30" },
                            react_1["default"].createElement(table_1.TableCell, null,
                                react_1["default"].createElement("div", null,
                                    react_1["default"].createElement("p", { className: "font-semibold" }, t.title || "Untitled"),
                                    t.description && react_1["default"].createElement("p", { className: "text-sm text-muted-foreground truncate" }, t.description))),
                            react_1["default"].createElement(table_1.TableCell, null,
                                react_1["default"].createElement("p", { className: "text-sm capitalize" }, t.category || "—")),
                            react_1["default"].createElement(table_1.TableCell, null,
                                react_1["default"].createElement(PriorityBadge, { priority: t.priority })),
                            react_1["default"].createElement(table_1.TableCell, null,
                                react_1["default"].createElement(StatusBadge, { status: t.status })),
                            react_1["default"].createElement(table_1.TableCell, null,
                                react_1["default"].createElement("p", { className: "text-sm" }, t.createdAt ? new Date(t.createdAt).toLocaleDateString() : "—"),
                                t.requestedDueDate && (react_1["default"].createElement("p", { className: "text-xs text-muted-foreground" },
                                    "Due: ",
                                    new Date(t.requestedDueDate).toLocaleDateString()))),
                            react_1["default"].createElement(table_1.TableCell, { className: "text-right space-x-2" },
                                react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleView(t.id); }, title: "View" },
                                    react_1["default"].createElement(lucide_react_1.Eye, { className: "h-4 w-4" })),
                                react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleEdit(t.id); }, title: "Edit" },
                                    react_1["default"].createElement(lucide_react_1.Edit, { className: "h-4 w-4" }))))); }))))))))));
}
exports["default"] = OrgTickets;
