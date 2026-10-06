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
    active: "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30",
    planning: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
    "on-hold": "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/30",
    completed: "bg-slate-500/15 text-slate-600 dark:text-slate-300 border-slate-500/30",
    cancelled: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30"
};
var PRIORITY_STYLES = {
    low: "bg-slate-500/15 text-slate-600 dark:text-slate-300 border-slate-500/30",
    medium: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
    high: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30",
    critical: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30"
};
function StatusBadge(_a) {
    var _b;
    var status = _a.status;
    var s = (status !== null && status !== void 0 ? status : "planning").toLowerCase();
    return (react_1["default"].createElement(badge_1.Badge, { variant: "outline", className: "capitalize " + ((_b = STATUS_STYLES[s]) !== null && _b !== void 0 ? _b : "bg-muted text-muted-foreground") }, s));
}
function PriorityBadge(_a) {
    var _b;
    var priority = _a.priority;
    var p = (priority !== null && priority !== void 0 ? priority : "medium").toLowerCase();
    return (react_1["default"].createElement(badge_1.Badge, { variant: "outline", className: "capitalize " + ((_b = PRIORITY_STYLES[p]) !== null && _b !== void 0 ? _b : "bg-muted text-muted-foreground") }, p));
}
function ProgressBar(_a) {
    var value = _a.value;
    var pct = Math.min(100, Math.max(0, value));
    var color = pct === 100 ? "bg-green-500" : pct >= 60 ? "bg-blue-500" : pct >= 30 ? "bg-amber-500" : "bg-muted";
    return (react_1["default"].createElement("div", { className: "flex items-center gap-2" },
        react_1["default"].createElement("div", { className: "flex-1 h-1.5 bg-muted rounded-full overflow-hidden" },
            react_1["default"].createElement("div", { className: "h-full " + color + " rounded-full", style: { width: pct + "%" } })),
        react_1["default"].createElement("span", { className: "text-xs text-muted-foreground w-9 text-right" },
            pct,
            "%")));
}
function OrgProjects() {
    var _a;
    var params = wouter_1.useParams();
    var slug = params.slug;
    var _b = wouter_1.useLocation(), navigate = _b[1];
    var _c = react_1.useState(""), search = _c[0], setSearch = _c[1];
    var _d = react_1.useState("all"), activeStatus = _d[0], setActiveStatus = _d[1];
    var myOrgData = trpc_1.trpc.multiTenancy.getMyOrg.useQuery(undefined, { staleTime: 300000 }).data;
    var featureMap = (_a = myOrgData === null || myOrgData === void 0 ? void 0 : myOrgData.featureMap) !== null && _a !== void 0 ? _a : {};
    var _e = trpc_1.trpc.projects.list.useQuery({ limit: 100 }, { staleTime: 60000, enabled: !myOrgData || !!featureMap.projects }), _f = _e.data, projects = _f === void 0 ? [] : _f, isLoading = _e.isLoading;
    var accessGranted = !myOrgData || featureMap.projects;
    var filtered = projects.filter(function (p) {
        var _a, _b, _c, _d;
        var matchStatus = activeStatus === "all" || ((_a = p.status) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === activeStatus;
        var matchSearch = !search || ((_b = p.name) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(search.toLowerCase())) || ((_c = p.projectNumber) === null || _c === void 0 ? void 0 : _c.toLowerCase().includes(search.toLowerCase())) || ((_d = p.description) === null || _d === void 0 ? void 0 : _d.toLowerCase().includes(search.toLowerCase()));
        return matchStatus && matchSearch;
    });
    var active = projects.filter(function (p) { return p.status === "active"; }).length;
    var completed = projects.filter(function (p) { return p.status === "completed"; }).length;
    var totalBudget = projects.reduce(function (s, p) { return s + Number(p.budget || 0); }, 0);
    var avgProgress = projects.length > 0
        ? Math.round(projects.reduce(function (s, p) { return s + Number(p.progress || 0); }, 0) / projects.length)
        : 0;
    var summaryStats = [
        { label: "Total Projects", value: String(projects.length), trend: undefined },
        { label: "Active", value: String(active), trend: undefined },
        { label: "Completed", value: String(completed), trend: undefined },
        { label: "Avg. Progress", value: avgProgress + "%", trend: undefined },
    ];
    var handleView = function (id) {
        navigate("/org/" + slug + "/projects/" + id);
    };
    var handleEdit = function (id) {
        navigate("/org/" + slug + "/projects/" + id + "/edit");
    };
    var handleNewProject = function () {
        navigate("/org/" + slug + "/projects/new");
    };
    if (!accessGranted) {
        return (react_1["default"].createElement(OrgModuleLayout_1.OrgModuleLayout, { title: "Projects", description: "Manage your organization projects", icon: lucide_react_1.Briefcase, breadcrumbs: [
                { label: "Dashboard", href: "/org/" + slug + "/dashboard" },
                { label: "Projects" },
            ], backLink: "/org/" + slug + "/dashboard", hasAccess: false, accessDeniedMessage: "Projects feature is not enabled for your organization plan." },
            react_1["default"].createElement("div", { className: "flex flex-col items-center justify-center py-24 text-center" },
                react_1["default"].createElement(lucide_react_1.AlertCircle, { className: "h-16 w-16 text-muted-foreground mb-4" }),
                react_1["default"].createElement("p", { className: "text-muted-foreground" }, "Projects feature is not available in your current plan."))));
    }
    return (react_1["default"].createElement(OrgModuleLayout_1.OrgModuleLayout, { title: "Projects", description: "Manage your organization projects and track progress", icon: lucide_react_1.Briefcase, breadcrumbs: [
            { label: "Dashboard", href: "/org/" + slug + "/dashboard" },
            { label: "Projects" },
        ], actions: react_1["default"].createElement(button_1.Button, { size: "sm", onClick: handleNewProject },
            react_1["default"].createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-1" }),
            " New Project"), backLink: "/org/" + slug + "/dashboard", hasAccess: true },
        react_1["default"].createElement("div", { className: "space-y-6" },
            react_1["default"].createElement(SummaryStatCards_1.SummaryStatCards, { cards: summaryStats, isLoading: isLoading }),
            react_1["default"].createElement("div", { className: "flex flex-wrap gap-3 items-center" },
                react_1["default"].createElement("div", { className: "relative flex-1 max-w-sm" },
                    react_1["default"].createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
                    react_1["default"].createElement(input_1.Input, { placeholder: "Search projects...", value: search, onChange: function (e) { return setSearch(e.target.value); }, className: "pl-9" })),
                react_1["default"].createElement(select_1.Select, { value: activeStatus, onValueChange: setActiveStatus },
                    react_1["default"].createElement(select_1.SelectTrigger, { className: "w-[140px]" },
                        react_1["default"].createElement(select_1.SelectValue, { placeholder: "Status" })),
                    react_1["default"].createElement(select_1.SelectContent, null,
                        react_1["default"].createElement(select_1.SelectItem, { value: "all" }, "All Statuses"),
                        react_1["default"].createElement(select_1.SelectItem, { value: "active" }, "Active"),
                        react_1["default"].createElement(select_1.SelectItem, { value: "planning" }, "Planning"),
                        react_1["default"].createElement(select_1.SelectItem, { value: "on-hold" }, "On Hold"),
                        react_1["default"].createElement(select_1.SelectItem, { value: "completed" }, "Completed"),
                        react_1["default"].createElement(select_1.SelectItem, { value: "cancelled" }, "Cancelled")))),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardContent, { className: "p-0" }, isLoading ? (react_1["default"].createElement("div", { className: "p-6 space-y-3" }, Array.from({ length: 6 }).map(function (_, i) { return react_1["default"].createElement(skeleton_1.Skeleton, { key: i, className: "h-16 rounded" }); }))) : filtered.length === 0 ? (react_1["default"].createElement("div", { className: "py-16 text-center" },
                    react_1["default"].createElement(lucide_react_1.Briefcase, { className: "h-10 w-10 text-muted-foreground/20 mx-auto mb-3" }),
                    react_1["default"].createElement("p", { className: "text-muted-foreground text-sm" }, search || activeStatus !== "all" ? "No projects match your filters" : "No projects yet"),
                    react_1["default"].createElement(button_1.Button, { className: "mt-4", size: "sm", onClick: handleNewProject },
                        react_1["default"].createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-1" }),
                        " Create First Project"))) : (react_1["default"].createElement("div", { className: "overflow-x-auto" },
                    react_1["default"].createElement(table_1.Table, null,
                        react_1["default"].createElement(table_1.TableHeader, null,
                            react_1["default"].createElement(table_1.TableRow, null,
                                react_1["default"].createElement(table_1.TableHead, null, "Project"),
                                react_1["default"].createElement(table_1.TableHead, null, "Status"),
                                react_1["default"].createElement(table_1.TableHead, null, "Priority"),
                                react_1["default"].createElement(table_1.TableHead, null, "Progress"),
                                react_1["default"].createElement(table_1.TableHead, null, "Budget"),
                                react_1["default"].createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                        react_1["default"].createElement(table_1.TableBody, null, filtered.map(function (p) { return (react_1["default"].createElement(table_1.TableRow, { key: p.id, className: "hover:bg-muted/30" },
                            react_1["default"].createElement(table_1.TableCell, null,
                                react_1["default"].createElement("div", null,
                                    react_1["default"].createElement("p", { className: "font-semibold" }, p.name),
                                    react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" }, p.projectNumber || "PRJ-" + p.id.slice(0, 8)))),
                            react_1["default"].createElement(table_1.TableCell, null,
                                react_1["default"].createElement(StatusBadge, { status: p.status })),
                            react_1["default"].createElement(table_1.TableCell, null,
                                react_1["default"].createElement(PriorityBadge, { priority: p.priority })),
                            react_1["default"].createElement(table_1.TableCell, null,
                                react_1["default"].createElement(ProgressBar, { value: Number(p.progress || 0) })),
                            react_1["default"].createElement(table_1.TableCell, null,
                                react_1["default"].createElement("p", { className: "text-sm" }, p.budget ? (Number(p.budget) / 1000).toFixed(0) + "K" : "—")),
                            react_1["default"].createElement(table_1.TableCell, { className: "text-right space-x-2" },
                                react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleView(p.id); }, title: "View" },
                                    react_1["default"].createElement(lucide_react_1.Eye, { className: "h-4 w-4" })),
                                react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleEdit(p.id); }, title: "Edit" },
                                    react_1["default"].createElement(lucide_react_1.Edit, { className: "h-4 w-4" }))))); }))))))))));
}
exports["default"] = OrgProjects;
