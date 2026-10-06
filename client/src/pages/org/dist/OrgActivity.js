"use strict";
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var skeleton_1 = require("@/components/ui/skeleton");
var badge_1 = require("@/components/ui/badge");
var trpc_1 = require("@/lib/trpc");
var OrgLayout_1 = require("@/components/OrgLayout");
var OrgBreadcrumb_1 = require("@/components/OrgBreadcrumb");
var lucide_react_1 = require("lucide-react");
var ENTITY_TABS = [
    { id: "all", label: "All", icon: lucide_react_1.Activity },
    { id: "invoice", label: "Invoices", icon: lucide_react_1.FileText },
    { id: "payment", label: "Payments", icon: lucide_react_1.DollarSign },
    { id: "expense", label: "Expenses", icon: lucide_react_1.Receipt },
    { id: "project", label: "Projects", icon: lucide_react_1.Briefcase },
    { id: "client", label: "Clients", icon: lucide_react_1.Users },
    { id: "task", label: "Tasks", icon: lucide_react_1.CheckSquare },
];
var ENTITY_COLORS = {
    invoice: "#3b82f6",
    payment: "#22c55e",
    expense: "#f59e0b",
    project: "#06b6d4",
    client: "#a855f7",
    task: "#f97316",
    projectTask: "#f97316",
    employee: "#ec4899",
    leave: "#8b5cf6",
    payroll: "#10b981"
};
var ACTION_ICONS = {
    create: "➕",
    created: "➕",
    update: "✏️",
    updated: "✏️",
    "delete": "🗑️",
    deleted: "🗑️",
    paid: "💰",
    payment_recorded: "💰",
    sent: "📤",
    approved: "✅",
    rejected: "❌",
    completed: "🏁",
    exported: "📥",
    login: "🔐",
    logout: "🚪",
    viewed: "👁️"
};
function getActionIcon(action) {
    var key = Object.keys(ACTION_ICONS).find(function (k) { return action.toLowerCase().includes(k); });
    return key ? ACTION_ICONS[key] : "📌";
}
function timeAgo(dateStr) {
    if (!dateStr)
        return "—";
    var diff = Date.now() - new Date(dateStr).getTime();
    var secs = Math.floor(diff / 1000);
    if (secs < 60)
        return "just now";
    var mins = Math.floor(secs / 60);
    if (mins < 60)
        return mins + "m ago";
    var hrs = Math.floor(mins / 60);
    if (hrs < 24)
        return hrs + "h ago";
    var days = Math.floor(hrs / 24);
    if (days < 30)
        return days + "d ago";
    return new Date(dateStr).toLocaleDateString("en", { day: "numeric", month: "short", year: "2-digit" });
}
function entityHref(slug, entityType, entityId) {
    if (!entityType || !entityId)
        return null;
    var t = entityType.toLowerCase();
    if (t.includes("invoice"))
        return "/org/" + slug + "/invoices/" + entityId;
    if (t.includes("project"))
        return "/org/" + slug + "/projects/" + entityId;
    if (t.includes("client"))
        return "/org/" + slug + "/clients/" + entityId;
    if (t.includes("expense"))
        return "/org/" + slug + "/expenses";
    if (t.includes("payment"))
        return "/org/" + slug + "/payments";
    return null;
}
function OrgActivity() {
    var _a;
    var slug = wouter_1.useParams().slug;
    var _b = wouter_1.useLocation(), setLocation = _b[1];
    var _c = react_1.useState("all"), activeTab = _c[0], setActiveTab = _c[1];
    var _d = trpc_1.trpc.multiTenancy.getOrgActivity.useQuery({
        limit: 100,
        entityType: activeTab === "all" ? undefined : activeTab
    }, { staleTime: 30000 }), data = _d.data, isLoading = _d.isLoading, refetch = _d.refetch;
    var activities = (_a = data === null || data === void 0 ? void 0 : data.activities) !== null && _a !== void 0 ? _a : [];
    return (react_1["default"].createElement(OrgLayout_1["default"], { title: "Activity", showOrgInfo: false },
        react_1["default"].createElement("div", { className: "p-6 space-y-6 max-w-5xl mx-auto" },
            react_1["default"].createElement(OrgBreadcrumb_1["default"], { slug: slug, items: [{ label: "Activity" }] }),
            react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("h1", { className: "text-2xl font-bold text-white" }, "Activity Timeline"),
                    react_1["default"].createElement("p", { className: "text-white/50 text-sm mt-0.5" }, "All recent actions across your organization")),
                react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", className: "border-white/10 text-white/70 hover:text-white hover:bg-white/10", onClick: function () { return refetch(); } }, "Refresh")),
            react_1["default"].createElement("div", { className: "flex flex-wrap gap-2" }, ENTITY_TABS.map(function (tab) {
                var Icon = tab.icon;
                var active = activeTab === tab.id;
                return (react_1["default"].createElement("button", { key: tab.id, onClick: function () { return setActiveTab(tab.id); }, className: "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors " + (active
                        ? "bg-blue-600 text-white"
                        : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white") },
                    react_1["default"].createElement(Icon, { className: "h-3.5 w-3.5" }),
                    tab.label));
            })),
            react_1["default"].createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
                react_1["default"].createElement(card_1.CardHeader, { className: "pb-3" },
                    react_1["default"].createElement(card_1.CardTitle, { className: "text-white text-base font-semibold flex items-center gap-2" },
                        react_1["default"].createElement(lucide_react_1.Activity, { className: "h-4 w-4 text-blue-400" }),
                        activities.length,
                        " ",
                        activeTab === "all" ? "" : activeTab + " ",
                        activities.length === 1 ? "entry" : "entries")),
                react_1["default"].createElement(card_1.CardContent, { className: "p-0" }, isLoading ? (react_1["default"].createElement("div", { className: "p-4 space-y-4" }, Array.from({ length: 8 }).map(function (_, i) { return (react_1["default"].createElement("div", { key: i, className: "flex gap-3" },
                    react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-8 w-8 rounded-full bg-white/5 shrink-0" }),
                    react_1["default"].createElement("div", { className: "flex-1 space-y-2" },
                        react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-4 bg-white/5 rounded w-3/4" }),
                        react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-3 bg-white/5 rounded w-1/2" })))); }))) : activities.length === 0 ? (react_1["default"].createElement("div", { className: "py-16 text-center" },
                    react_1["default"].createElement(lucide_react_1.Activity, { className: "h-10 w-10 text-white/20 mx-auto mb-3" }),
                    react_1["default"].createElement("p", { className: "text-white/40 text-sm" }, "No activity recorded yet"))) : (react_1["default"].createElement("div", { className: "relative" },
                    react_1["default"].createElement("div", { className: "absolute left-10 top-0 bottom-0 w-px bg-white/5" }),
                    react_1["default"].createElement("div", { className: "divide-y divide-white/5" }, activities.map(function (act) {
                        var _a, _b, _c;
                        var entityColor = (_c = ENTITY_COLORS[(_b = (_a = act.entityType) === null || _a === void 0 ? void 0 : _a.toLowerCase()) !== null && _b !== void 0 ? _b : ""]) !== null && _c !== void 0 ? _c : "#6b7280";
                        var href = entityHref(slug !== null && slug !== void 0 ? slug : "", act.entityType, act.entityId);
                        return (react_1["default"].createElement("div", { key: act.id, className: "flex gap-4 px-4 py-4 hover:bg-white/5 transition-colors group" },
                            react_1["default"].createElement("div", { className: "relative z-10 h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-base", style: { background: entityColor + "22", border: "1px solid " + entityColor + "44" } }, getActionIcon(act.action)),
                            react_1["default"].createElement("div", { className: "flex-1 min-w-0" },
                                react_1["default"].createElement("div", { className: "flex items-start justify-between gap-2" },
                                    react_1["default"].createElement("div", { className: "min-w-0" },
                                        react_1["default"].createElement("p", { className: "text-sm font-medium text-white/90 truncate" }, act.description || act.action),
                                        react_1["default"].createElement("div", { className: "flex items-center gap-2 mt-1 flex-wrap" },
                                            react_1["default"].createElement("span", { className: "text-xs text-white/40" }, act.userName),
                                            act.entityType && (react_1["default"].createElement(badge_1.Badge, { className: "text-[10px] capitalize px-1.5 py-0", style: {
                                                    background: entityColor + "22",
                                                    color: entityColor,
                                                    border: "none"
                                                } }, act.entityType.replace(/([A-Z])/g, " $1").trim())))),
                                    react_1["default"].createElement("span", { className: "text-xs text-white/30 shrink-0 whitespace-nowrap" }, timeAgo(act.createdAt)))),
                            href && (react_1["default"].createElement("button", { onClick: function () { return setLocation(href); }, className: "shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity" },
                                react_1["default"].createElement(lucide_react_1.ArrowRight, { className: "h-4 w-4 text-white/40 hover:text-white" })))));
                    })))))))));
}
exports["default"] = OrgActivity;
