"use strict";
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var card_1 = require("@/components/ui/card");
var badge_1 = require("@/components/ui/badge");
var skeleton_1 = require("@/components/ui/skeleton");
var trpc_1 = require("@/lib/trpc");
var lucide_react_1 = require("lucide-react");
var ENTITY_TABS = [
    { key: "", label: "All" },
    { key: "invoice", label: "Invoices" },
    { key: "payment", label: "Payments" },
    { key: "client", label: "Clients" },
    { key: "project", label: "Projects" },
    { key: "expense", label: "Expenses" },
    { key: "employee", label: "Employees" },
    { key: "task", label: "Tasks" },
];
var ENTITY_COLORS = {
    invoice: "#3b82f6",
    payment: "#22c55e",
    expense: "#f59e0b",
    client: "#a855f7",
    project: "#06b6d4",
    employee: "#ec4899",
    task: "#f97316",
    projectTask: "#f97316",
    leave: "#8b5cf6",
    payroll: "#10b981"
};
var ACTION_ICONS = {
    created: "➕",
    create: "➕",
    updated: "✏️",
    update: "✏️",
    deleted: "🗑️",
    "delete": "🗑️",
    approved: "✅",
    rejected: "❌",
    exported: "📥",
    login: "🔐",
    logout: "🚪",
    payment_recorded: "💰",
    paid: "💰",
    sent: "📤",
    completed: "🏁",
    viewed: "👁️"
};
function getActionIcon(action) {
    var key = Object.keys(ACTION_ICONS).find(function (k) { return action.toLowerCase().includes(k); });
    return key ? ACTION_ICONS[key] : "📌";
}
function timeAgo(dateVal) {
    if (!dateVal)
        return "—";
    var date = new Date(dateVal);
    if (isNaN(date.getTime()))
        return "—";
    var seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60)
        return "just now";
    if (seconds < 3600)
        return Math.floor(seconds / 60) + "m ago";
    if (seconds < 86400)
        return Math.floor(seconds / 3600) + "h ago";
    if (seconds < 604800)
        return Math.floor(seconds / 86400) + "d ago";
    return date.toLocaleDateString("en", { day: "numeric", month: "short" });
}
function entityHref(entityType, entityId) {
    var map = {
        invoice: "/invoices",
        payment: "/payments",
        expense: "/expenses",
        client: "/clients",
        project: "/projects",
        employee: "/employees",
        leave: "/leave-management",
        payroll: "/payroll"
    };
    var base = map[entityType] || "";
    return base && entityId ? base + "/" + entityId : base || "#";
}
function ActivityPage() {
    var _a;
    var _b = wouter_1.useLocation(), setLocation = _b[1];
    var _c = react_1.useState(""), activeTab = _c[0], setActiveTab = _c[1];
    var _d = trpc_1.trpc.activityTrail.list.useQuery({
        limit: 100,
        entityType: activeTab || undefined
    }), data = _d.data, isLoading = _d.isLoading;
    var activities = Array.isArray(data) ? data : ((_a = data) === null || _a === void 0 ? void 0 : _a.activities) || [];
    return (react_1["default"].createElement(ModuleLayout_1.ModuleLayout, { title: "Activity", description: "System-wide activity timeline and event log", icon: react_1["default"].createElement(lucide_react_1.Activity, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Activity" },
        ] },
        react_1["default"].createElement("div", { className: "space-y-4" },
            react_1["default"].createElement("div", { className: "flex flex-wrap gap-2" }, ENTITY_TABS.map(function (tab) { return (react_1["default"].createElement("button", { key: tab.key, onClick: function () { return setActiveTab(tab.key); }, className: "px-3 py-1.5 rounded-full text-sm font-medium transition-colors " + (activeTab === tab.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/70") }, tab.label)); })),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardHeader, { className: "pb-3" },
                    react_1["default"].createElement(card_1.CardTitle, { className: "text-base font-semibold flex items-center gap-2" },
                        react_1["default"].createElement(lucide_react_1.Activity, { className: "h-4 w-4 text-primary" }),
                        "Recent Activity",
                        activities.length > 0 && (react_1["default"].createElement(badge_1.Badge, { variant: "secondary", className: "ml-auto text-xs" }, activities.length)))),
                react_1["default"].createElement(card_1.CardContent, null, isLoading ? (react_1["default"].createElement("div", { className: "space-y-4" }, Array.from({ length: 8 }).map(function (_, i) { return (react_1["default"].createElement("div", { key: i, className: "flex gap-3" },
                    react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-8 w-8 rounded-full shrink-0" }),
                    react_1["default"].createElement("div", { className: "space-y-1.5 flex-1" },
                        react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-4 w-3/4 rounded" }),
                        react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-3 w-1/3 rounded" })))); }))) : activities.length === 0 ? (react_1["default"].createElement("div", { className: "text-center py-12" },
                    react_1["default"].createElement(lucide_react_1.Activity, { className: "h-10 w-10 mx-auto mb-3 text-muted-foreground/30" }),
                    react_1["default"].createElement("p", { className: "text-muted-foreground text-sm" }, "No activities found"))) : (react_1["default"].createElement("div", { className: "relative" },
                    react_1["default"].createElement("div", { className: "absolute left-4 top-0 bottom-0 w-px bg-border" }),
                    react_1["default"].createElement("div", { className: "space-y-1" }, activities.map(function (activity, idx) {
                        var _a;
                        var color = ENTITY_COLORS[activity.entityType] || "#6b7280";
                        var icon = getActionIcon(activity.action || "");
                        var href = entityHref(activity.entityType, activity.entityId);
                        return (react_1["default"].createElement("div", { key: activity.id || idx, className: "relative flex gap-3 pl-9 pr-2 py-3 rounded-lg hover:bg-muted/50 transition-colors group" },
                            react_1["default"].createElement("div", { className: "absolute left-0 flex h-8 w-8 items-center justify-center rounded-full ring-2 ring-background text-base shrink-0", style: { background: color + "22" } }, icon),
                            react_1["default"].createElement("div", { className: "flex-1 min-w-0" },
                                react_1["default"].createElement("div", { className: "flex items-start justify-between gap-2" },
                                    react_1["default"].createElement("div", { className: "min-w-0" },
                                        react_1["default"].createElement("p", { className: "text-sm font-medium truncate" }, activity.description || activity.action + " " + activity.entityType),
                                        react_1["default"].createElement("div", { className: "flex flex-wrap items-center gap-2 mt-1" },
                                            activity.userName && (react_1["default"].createElement("span", { className: "text-xs text-muted-foreground" }, activity.userName)),
                                            react_1["default"].createElement(badge_1.Badge, { className: "text-[10px] px-1.5 py-0 capitalize", style: { background: color + "22", color: color, border: "none" } }, activity.entityType),
                                            react_1["default"].createElement(badge_1.Badge, { variant: "outline", className: "text-[10px] px-1.5 py-0 capitalize" }, (_a = activity.action) === null || _a === void 0 ? void 0 : _a.replace(/_/g, " ")))),
                                    react_1["default"].createElement("div", { className: "flex items-center gap-1 shrink-0" },
                                        react_1["default"].createElement("span", { className: "text-xs text-muted-foreground whitespace-nowrap" }, timeAgo(activity.timestamp || activity.createdAt)),
                                        href !== "#" && (react_1["default"].createElement("button", { onClick: function () { return setLocation(href); }, className: "opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-muted", title: "Go to record" },
                                            react_1["default"].createElement(lucide_react_1.ArrowRight, { className: "h-3.5 w-3.5 text-muted-foreground" }))))))));
                    })))))))));
}
exports["default"] = ActivityPage;
