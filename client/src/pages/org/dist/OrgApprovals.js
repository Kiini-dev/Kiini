"use strict";
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var skeleton_1 = require("@/components/ui/skeleton");
var textarea_1 = require("@/components/ui/textarea");
var trpc_1 = require("@/lib/trpc");
var OrgLayout_1 = require("@/components/OrgLayout");
var OrgBreadcrumb_1 = require("@/components/OrgBreadcrumb");
var sonner_1 = require("sonner");
var currency_1 = require("@/lib/currency");
var useUserLookup_1 = require("@/hooks/useUserLookup");
var lucide_react_1 = require("lucide-react");
var TYPE_TABS = [
    { id: "all", label: "All", icon: lucide_react_1.CheckCircle },
    { id: "invoice", label: "Invoices", icon: lucide_react_1.FileText },
    { id: "expense", label: "Expenses", icon: lucide_react_1.Receipt },
    { id: "payment", label: "Payments", icon: lucide_react_1.DollarSign },
    { id: "leave_request", label: "Leave", icon: lucide_react_1.Calendar },
];
var TYPE_COLORS = {
    invoice: "#3b82f6",
    expense: "#f59e0b",
    payment: "#22c55e",
    leave_request: "#a855f7",
    purchase_order: "#06b6d4"
};
var STATUS_STYLES = {
    pending: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    approved: "bg-green-500/20 text-green-300 border-green-500/30",
    rejected: "bg-red-500/20 text-red-300 border-red-500/30"
};
function formatDate(s) {
    if (!s)
        return "—";
    return new Date(s).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
}
function OrgApprovals() {
    var _a;
    var currencyCode = currency_1.useCurrencySettings().code;
    var getUserName = useUserLookup_1.useUserLookup().getUserName;
    var slug = wouter_1.useParams().slug;
    var _b = wouter_1.useLocation(), setLocation = _b[1];
    var _c = react_1.useState("all"), typeFilter = _c[0], setTypeFilter = _c[1];
    var _d = react_1.useState("pending"), statusFilter = _d[0], setStatusFilter = _d[1];
    var _e = react_1.useState(null), expandedId = _e[0], setExpandedId = _e[1];
    var _f = react_1.useState(null), rejectingId = _f[0], setRejectingId = _f[1];
    var _g = react_1.useState(""), rejectionReason = _g[0], setRejectionReason = _g[1];
    var _h = trpc_1.trpc.multiTenancy.getOrgApprovals.useQuery(undefined, {
        staleTime: 30000
    }), data = _h.data, isLoading = _h.isLoading, refetch = _h.refetch;
    var approvals = ((_a = data === null || data === void 0 ? void 0 : data.approvals) !== null && _a !== void 0 ? _a : []);
    // ── mutations ──
    var approveInvoice = trpc_1.trpc.approvals.approveInvoice.useMutation({ onSuccess: function () { sonner_1.toast.success("Invoice approved"); refetch(); }, onError: function (e) { return sonner_1.toast.error(e.message); } });
    var rejectInvoice = trpc_1.trpc.approvals.rejectInvoice.useMutation({ onSuccess: function () { sonner_1.toast.success("Invoice rejected"); setRejectingId(null); refetch(); }, onError: function (e) { return sonner_1.toast.error(e.message); } });
    var approveExpense = trpc_1.trpc.approvals.approveExpense.useMutation({ onSuccess: function () { sonner_1.toast.success("Expense approved"); refetch(); }, onError: function (e) { return sonner_1.toast.error(e.message); } });
    var rejectExpense = trpc_1.trpc.approvals.rejectExpense.useMutation({ onSuccess: function () { sonner_1.toast.success("Expense rejected"); setRejectingId(null); refetch(); }, onError: function (e) { return sonner_1.toast.error(e.message); } });
    var approvePayment = trpc_1.trpc.approvals.approvePayment.useMutation({ onSuccess: function () { sonner_1.toast.success("Payment approved"); refetch(); }, onError: function (e) { return sonner_1.toast.error(e.message); } });
    var rejectPayment = trpc_1.trpc.approvals.rejectPayment.useMutation({ onSuccess: function () { sonner_1.toast.success("Payment rejected"); setRejectingId(null); refetch(); }, onError: function (e) { return sonner_1.toast.error(e.message); } });
    var approveLeave = trpc_1.trpc.approvals.approveLeaveRequest.useMutation({ onSuccess: function () { sonner_1.toast.success("Leave request approved"); refetch(); }, onError: function (e) { return sonner_1.toast.error(e.message); } });
    var rejectLeave = trpc_1.trpc.approvals.rejectLeaveRequest.useMutation({ onSuccess: function () { sonner_1.toast.success("Leave request rejected"); setRejectingId(null); refetch(); }, onError: function (e) { return sonner_1.toast.error(e.message); } });
    var isApproving = approveInvoice.isPending || approveExpense.isPending || approvePayment.isPending || approveLeave.isPending;
    var isRejecting = rejectInvoice.isPending || rejectExpense.isPending || rejectPayment.isPending || rejectLeave.isPending;
    var formatCurrency = function (n) {
        if (n === undefined || n === null)
            return "—";
        return new Intl.NumberFormat("en-KE", { style: "currency", currency: currencyCode, maximumFractionDigits: 0 }).format(n);
    };
    function handleApprove(item) {
        switch (item.type) {
            case "invoice": return approveInvoice.mutate({ id: item.referenceId });
            case "expense": return approveExpense.mutate({ id: item.referenceId });
            case "payment": return approvePayment.mutate({ id: item.referenceId });
            case "leave_request": return approveLeave.mutate({ id: item.referenceId });
            default: sonner_1.toast.error("Approval not supported for this type");
        }
    }
    function handleReject(item) {
        if (!rejectionReason.trim()) {
            sonner_1.toast.error("Please provide a rejection reason");
            return;
        }
        switch (item.type) {
            case "invoice": return rejectInvoice.mutate({ id: item.referenceId, reason: rejectionReason });
            case "expense": return rejectExpense.mutate({ id: item.referenceId, reason: rejectionReason });
            case "payment": return rejectPayment.mutate({ id: item.referenceId, reason: rejectionReason });
            case "leave_request": return rejectLeave.mutate({ id: item.referenceId, reason: rejectionReason });
            default: sonner_1.toast.error("Rejection not supported for this type");
        }
    }
    // filter
    var filtered = approvals.filter(function (a) {
        if (typeFilter !== "all" && a.type !== typeFilter)
            return false;
        if (statusFilter !== "all" && a.status !== statusFilter)
            return false;
        return true;
    });
    var stats = {
        pending: approvals.filter(function (a) { return a.status === "pending"; }).length,
        approved: approvals.filter(function (a) { return a.status === "approved"; }).length,
        rejected: approvals.filter(function (a) { return a.status === "rejected"; }).length
    };
    return (react_1["default"].createElement(OrgLayout_1["default"], { title: "Approvals", showOrgInfo: false },
        react_1["default"].createElement("div", { className: "p-6 space-y-6 max-w-6xl mx-auto" },
            react_1["default"].createElement(OrgBreadcrumb_1["default"], { slug: slug, items: [{ label: "Approvals" }] }),
            react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement("h1", { className: "text-2xl font-bold text-white" }, "Approvals"),
                    react_1["default"].createElement("p", { className: "text-white/50 text-sm mt-0.5" }, "Review and action pending requests")),
                react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", className: "border-white/10 text-white/70 hover:text-white hover:bg-white/10", onClick: function () { return refetch(); } }, "Refresh")),
            react_1["default"].createElement("div", { className: "grid grid-cols-3 gap-4" }, [
                { label: "Pending", value: stats.pending, color: "from-yellow-600/20 to-yellow-600/5", text: "text-yellow-300" },
                { label: "Approved", value: stats.approved, color: "from-green-600/20 to-green-600/5", text: "text-green-300" },
                { label: "Rejected", value: stats.rejected, color: "from-red-600/20 to-red-600/5", text: "text-red-300" },
            ].map(function (k) { return (react_1["default"].createElement(card_1.Card, { key: k.label, className: "bg-gradient-to-br " + k.color + " border-white/10" },
                react_1["default"].createElement(card_1.CardContent, { className: "pt-4 pb-3" },
                    react_1["default"].createElement("p", { className: "text-xs text-white/50 uppercase tracking-wide" }, k.label),
                    react_1["default"].createElement("p", { className: "text-2xl font-bold mt-1 " + k.text }, k.value)))); })),
            react_1["default"].createElement("div", { className: "flex flex-wrap gap-2" },
                TYPE_TABS.map(function (tab) {
                    var Icon = tab.icon;
                    var active = typeFilter === tab.id;
                    return (react_1["default"].createElement("button", { key: tab.id, onClick: function () { return setTypeFilter(tab.id); }, className: "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors " + (active ? "bg-blue-600 text-white" : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white") },
                        react_1["default"].createElement(Icon, { className: "h-3.5 w-3.5" }),
                        tab.label));
                }),
                react_1["default"].createElement("div", { className: "ml-auto flex gap-1" }, ["all", "pending", "approved", "rejected"].map(function (s) { return (react_1["default"].createElement("button", { key: s, onClick: function () { return setStatusFilter(s); }, className: "px-3 py-1.5 rounded-full text-xs capitalize transition-colors " + (statusFilter === s ? "bg-white/20 text-white" : "bg-white/5 text-white/40 hover:text-white") }, s)); }))),
            react_1["default"].createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
                react_1["default"].createElement(card_1.CardHeader, { className: "pb-3" },
                    react_1["default"].createElement(card_1.CardTitle, { className: "text-white text-base font-semibold" },
                        filtered.length,
                        " ",
                        statusFilter !== "all" ? statusFilter : "",
                        " ",
                        typeFilter !== "all" ? typeFilter.replace("_", " ") : "",
                        " item",
                        filtered.length !== 1 ? "s" : "")),
                react_1["default"].createElement(card_1.CardContent, { className: "p-0" }, isLoading ? (react_1["default"].createElement("div", { className: "p-6 space-y-3" }, Array.from({ length: 5 }).map(function (_, i) { return react_1["default"].createElement(skeleton_1.Skeleton, { key: i, className: "h-14 bg-white/5 rounded" }); }))) : filtered.length === 0 ? (react_1["default"].createElement("div", { className: "py-16 text-center" },
                    react_1["default"].createElement(lucide_react_1.CheckCircle, { className: "h-10 w-10 text-white/20 mx-auto mb-3" }),
                    react_1["default"].createElement("p", { className: "text-white/40 text-sm" }, "No items found"))) : (react_1["default"].createElement("div", { className: "divide-y divide-white/5" },
                    react_1["default"].createElement("div", { className: "hidden md:grid grid-cols-12 px-6 py-3 text-xs font-medium text-white/40 uppercase tracking-wider" },
                        react_1["default"].createElement("div", { className: "col-span-2" }, "Type"),
                        react_1["default"].createElement("div", { className: "col-span-2" }, "Ref #"),
                        react_1["default"].createElement("div", { className: "col-span-3" }, "Description"),
                        react_1["default"].createElement("div", { className: "col-span-1" }, "Amount"),
                        react_1["default"].createElement("div", { className: "col-span-1" }, "Status"),
                        react_1["default"].createElement("div", { className: "col-span-2" }, "Requested"),
                        react_1["default"].createElement("div", { className: "col-span-1 text-right" }, "Actions")),
                    filtered.map(function (item) {
                        var _a;
                        var typeColor = TYPE_COLORS[item.type] || "#6b7280";
                        var expanded = expandedId === item.id;
                        var rejecting = rejectingId === item.id;
                        return (react_1["default"].createElement("div", { key: item.id, className: "hover:bg-white/5 transition-colors" },
                            react_1["default"].createElement("div", { className: "grid grid-cols-12 px-6 py-4 items-center gap-2 cursor-pointer", onClick: function () { return setExpandedId(expanded ? null : item.id); } },
                                react_1["default"].createElement("div", { className: "col-span-2" },
                                    react_1["default"].createElement("span", { className: "text-[11px] font-medium px-2 py-0.5 rounded-full capitalize", style: { background: typeColor + "22", color: typeColor, border: "1px solid " + typeColor + "44" } }, item.type.replace("_", " "))),
                                react_1["default"].createElement("div", { className: "col-span-2" },
                                    react_1["default"].createElement("p", { className: "text-sm font-mono text-white/80" }, item.referenceNo)),
                                react_1["default"].createElement("div", { className: "col-span-3" },
                                    react_1["default"].createElement("p", { className: "text-sm text-white/70 truncate" }, item.description),
                                    react_1["default"].createElement("p", { className: "text-xs text-white/30 mt-0.5" }, getUserName(item.requestedBy))),
                                react_1["default"].createElement("div", { className: "col-span-1" },
                                    react_1["default"].createElement("p", { className: "text-sm text-white" }, formatCurrency(item.amount))),
                                react_1["default"].createElement("div", { className: "col-span-1" },
                                    react_1["default"].createElement("span", { className: "inline-flex px-2 py-0.5 rounded text-xs font-medium border capitalize " + ((_a = STATUS_STYLES[item.status]) !== null && _a !== void 0 ? _a : "bg-white/10 text-white/60 border-white/20") }, item.status)),
                                react_1["default"].createElement("div", { className: "col-span-2" },
                                    react_1["default"].createElement("p", { className: "text-xs text-white/40" }, formatDate(item.requestedAt))),
                                react_1["default"].createElement("div", { className: "col-span-1 flex justify-end" }, expanded
                                    ? react_1["default"].createElement(lucide_react_1.ChevronUp, { className: "h-4 w-4 text-white/30" })
                                    : react_1["default"].createElement(lucide_react_1.ChevronDown, { className: "h-4 w-4 text-white/30" }))),
                            expanded && (react_1["default"].createElement("div", { className: "px-6 pb-5 space-y-3 border-t border-white/5 pt-4" },
                                react_1["default"].createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3 text-xs" },
                                    react_1["default"].createElement("div", null,
                                        react_1["default"].createElement("p", { className: "text-white/30 uppercase tracking-wide mb-1" }, "Requested by"),
                                        react_1["default"].createElement("p", { className: "text-white/80" }, getUserName(item.requestedBy))),
                                    react_1["default"].createElement("div", null,
                                        react_1["default"].createElement("p", { className: "text-white/30 uppercase tracking-wide mb-1" }, "Requested at"),
                                        react_1["default"].createElement("p", { className: "text-white/80" }, formatDate(item.requestedAt))),
                                    item.approvedBy && (react_1["default"].createElement("div", null,
                                        react_1["default"].createElement("p", { className: "text-white/30 uppercase tracking-wide mb-1" }, "Reviewed by"),
                                        react_1["default"].createElement("p", { className: "text-white/80" }, getUserName(item.approvedBy)))),
                                    item.approvedAt && (react_1["default"].createElement("div", null,
                                        react_1["default"].createElement("p", { className: "text-white/30 uppercase tracking-wide mb-1" }, "Reviewed at"),
                                        react_1["default"].createElement("p", { className: "text-white/80" }, formatDate(item.approvedAt))))),
                                rejecting && item.status === "pending" && (react_1["default"].createElement("div", { className: "space-y-2" },
                                    react_1["default"].createElement("p", { className: "text-xs text-white/50" }, "Rejection reason (required)"),
                                    react_1["default"].createElement(textarea_1.Textarea, { value: rejectionReason, onChange: function (e) { return setRejectionReason(e.target.value); }, placeholder: "Explain why this is being rejected...", className: "bg-white/5 border-white/10 text-white placeholder:text-white/20 text-sm resize-none", rows: 2 }))),
                                item.status === "pending" && (react_1["default"].createElement("div", { className: "flex items-center gap-2 pt-1" }, !rejecting ? (react_1["default"].createElement(react_1["default"].Fragment, null,
                                    react_1["default"].createElement(button_1.Button, { size: "sm", className: "bg-green-600 hover:bg-green-700 text-white", disabled: isApproving, onClick: function (e) { e.stopPropagation(); handleApprove(item); } },
                                        react_1["default"].createElement(lucide_react_1.CheckCircle, { className: "h-3.5 w-3.5 mr-1" }),
                                        " Approve"),
                                    react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", className: "border-red-500/40 text-red-400 hover:bg-red-500/10 hover:text-red-300", onClick: function (e) { e.stopPropagation(); setRejectingId(item.id); setRejectionReason(""); } },
                                        react_1["default"].createElement(lucide_react_1.XCircle, { className: "h-3.5 w-3.5 mr-1" }),
                                        " Reject"))) : (react_1["default"].createElement(react_1["default"].Fragment, null,
                                    react_1["default"].createElement(button_1.Button, { size: "sm", className: "bg-red-600 hover:bg-red-700 text-white", disabled: isRejecting || !rejectionReason.trim(), onClick: function (e) { e.stopPropagation(); handleReject(item); } },
                                        react_1["default"].createElement(lucide_react_1.XCircle, { className: "h-3.5 w-3.5 mr-1" }),
                                        " Confirm Reject"),
                                    react_1["default"].createElement(button_1.Button, { size: "sm", variant: "ghost", className: "text-white/40 hover:text-white", onClick: function (e) { e.stopPropagation(); setRejectingId(null); setRejectionReason(""); } }, "Cancel")))))))));
                    }))))))));
}
exports["default"] = OrgApprovals;
