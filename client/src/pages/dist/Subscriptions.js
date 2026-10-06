"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var trpc_1 = require("@/lib/trpc");
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var badge_1 = require("@/components/ui/badge");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var select_1 = require("@/components/ui/select");
var dialog_1 = require("@/components/ui/dialog");
var table_1 = require("@/components/ui/table");
var stats_card_1 = require("@/components/ui/stats-card");
var lucide_react_1 = require("lucide-react");
var utils_1 = require("@/lib/utils");
var sonner_1 = require("sonner");
var STATUS_STYLES = {
    active: { label: "Active", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400", icon: React.createElement(lucide_react_1.CheckCircle2, { className: "h-3 w-3" }) },
    trial: { label: "Trial", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400", icon: React.createElement(lucide_react_1.Clock, { className: "h-3 w-3" }) },
    suspended: { label: "Suspended", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400", icon: React.createElement(lucide_react_1.AlertTriangle, { className: "h-3 w-3" }) },
    cancelled: { label: "Cancelled", className: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400", icon: React.createElement(lucide_react_1.XCircle, { className: "h-3 w-3" }) },
    expired: { label: "Expired", className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400", icon: React.createElement(lucide_react_1.XCircle, { className: "h-3 w-3" }) }
};
function StatusBadge(_a) {
    var status = _a.status;
    var s = STATUS_STYLES[status] || STATUS_STYLES.active;
    return (React.createElement(badge_1.Badge, { variant: "outline", className: utils_1.cn("gap-1 border-0 font-medium text-xs", s.className) },
        s.icon,
        " ",
        s.label));
}
// Demo/mock subscriptions data when backend has none
function Subscriptions() {
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var _b = react_1.useState(""), search = _b[0], setSearch = _b[1];
    var _c = react_1.useState("all"), statusFilter = _c[0], setStatusFilter = _c[1];
    var _d = react_1.useState("all"), cycleFilter = _d[0], setCycleFilter = _d[1];
    var _e = react_1.useState(false), createOpen = _e[0], setCreateOpen = _e[1];
    var _search = wouter_1.useSearch();
    react_1.useEffect(function () { if (new URLSearchParams(_search).get("action") === "create")
        setCreateOpen(true); }, []);
    var _f = react_1.useState(false), editOpen = _f[0], setEditOpen = _f[1];
    var _g = react_1.useState(false), viewOpen = _g[0], setViewOpen = _g[1];
    var _h = react_1.useState(null), selectedSub = _h[0], setSelectedSub = _h[1];
    var _j = react_1.useState({
        clientId: "",
        templateInvoiceId: "",
        frequency: "monthly",
        startDate: new Date().toISOString().split("T")[0],
        endDate: "",
        description: "",
        noteToInvoice: "",
        accountManagerId: ""
    }), form = _j[0], setForm = _j[1];
    // Load from recurringInvoices router (available in appRouter)
    var _k = trpc_1.trpc.recurringInvoices.list.useQuery({ activeOnly: false }), _l = _k.data, riData = _l === void 0 ? [] : _l, isLoading = _k.isLoading, refetch = _k.refetch;
    var _m = trpc_1.trpc.clients.list.useQuery({}).data, clients = _m === void 0 ? [] : _m;
    var _o = trpc_1.trpc.invoices.list.useQuery({}).data, invoicesList = _o === void 0 ? [] : _o;
    var _p = trpc_1.trpc.users.list.useQuery({}).data, users = _p === void 0 ? [] : _p;
    var accountManagerMap = react_1.useMemo(function () {
        var map = {};
        users.forEach(function (user) { map[user.id] = user.name || user.fullName || "Unknown"; });
        return map;
    }, [users]);
    var createMutation = trpc_1.trpc.recurringInvoices.create.useMutation({
        onSuccess: function () { sonner_1.toast.success("Subscription created"); setCreateOpen(false); refetch(); resetForm(); },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var updateMutation = trpc_1.trpc.recurringInvoices.update.useMutation({
        onSuccess: function () { sonner_1.toast.success("Subscription updated"); setEditOpen(false); refetch(); },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var deleteMutation = trpc_1.trpc.recurringInvoices["delete"].useMutation({
        onSuccess: function () { sonner_1.toast.success("Subscription deleted"); refetch(); },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var toggleMutation = trpc_1.trpc.recurringInvoices.toggleActive.useMutation({
        onSuccess: function () { sonner_1.toast.success("Status updated"); refetch(); },
        onError: function (e) { return sonner_1.toast.error(e.message); }
    });
    var resetForm = function () { return setForm({ clientId: "", frequency: "monthly", startDate: new Date().toISOString().split("T")[0], endDate: "", description: "", noteToInvoice: "", accountManagerId: "" }); };
    // Map recurring invoices to subscription shape
    var subs = react_1.useMemo(function () { return riData.map(function (ri) { return ({
        id: ri.id,
        clientId: ri.clientId,
        clientName: ri.clientName || "",
        planId: ri.id,
        planName: ri.description || ri.title || "Subscription",
        status: ri.isActive ? "active" : "cancelled",
        billingCycle: ri.frequency === "yearly" ? "annual" : "monthly",
        currentPrice: ri.amount || "0",
        startDate: ri.startDate,
        renewalDate: ri.nextDueDate,
        usersCount: 1,
        autoRenew: ri.isActive ? 1 : 0
    }); }); }, [riData]);
    var clientMap = react_1.useMemo(function () {
        var m = {};
        clients.forEach(function (c) { m[c.id] = c.name || c.businessName; });
        return m;
    }, [clients]);
    var enriched = react_1.useMemo(function () { return subs.map(function (s) { return (__assign(__assign({}, s), { clientName: s.clientName || clientMap[s.clientId] || "—" })); }); }, [subs, clientMap]);
    var filtered = react_1.useMemo(function () { return enriched.filter(function (s) {
        var _a;
        if (search && !((_a = s.clientName) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(search.toLowerCase())))
            return false;
        if (statusFilter !== "all" && s.status !== statusFilter)
            return false;
        if (cycleFilter !== "all" && s.billingCycle !== cycleFilter)
            return false;
        return true;
    }); }, [enriched, search, statusFilter, cycleFilter]);
    var stats = react_1.useMemo(function () {
        var active = subs.filter(function (s) { return s.status === "active"; }).length;
        var trial = subs.filter(function (s) { return s.status === "trial"; }).length;
        var suspended = subs.filter(function (s) { return s.status === "suspended" || s.status === "cancelled" || s.status === "expired"; }).length;
        var mrr = subs.filter(function (s) { return s.status === "active" && s.billingCycle === "monthly"; })
            .reduce(function (acc, s) { return acc + parseFloat(s.currentPrice || "0"); }, 0);
        var arr = subs.filter(function (s) { return s.status === "active" && s.billingCycle === "annual"; })
            .reduce(function (acc, s) { return acc + parseFloat(s.currentPrice || "0"); }, 0);
        return { active: active, trial: trial, suspended: suspended, mrr: mrr, arr: arr };
    }, [subs]);
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Subscriptions", description: "Manage client subscription plans and recurring billing", icon: React.createElement(lucide_react_1.Repeat2, { className: "h-5 w-5" }) },
        React.createElement("div", { className: "grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5" },
            React.createElement(stats_card_1.StatsCard, { label: "Active Subscriptions", value: stats.active, icon: React.createElement(lucide_react_1.CheckCircle2, { className: "h-4 w-4 text-emerald-500" }), color: "border-l-emerald-500" }),
            React.createElement(stats_card_1.StatsCard, { label: "Trial", value: stats.trial, icon: React.createElement(lucide_react_1.Clock, { className: "h-4 w-4 text-blue-500" }), color: "border-l-blue-500" }),
            React.createElement(stats_card_1.StatsCard, { label: "Monthly Recurring Revenue", value: "$" + stats.mrr.toLocaleString("en-US", { minimumFractionDigits: 0 }), icon: React.createElement(lucide_react_1.DollarSign, { className: "h-4 w-4 text-violet-500" }), color: "border-l-violet-500" }),
            React.createElement(stats_card_1.StatsCard, { label: "Suspended / Cancelled", value: stats.suspended, icon: React.createElement(lucide_react_1.AlertTriangle, { className: "h-4 w-4 text-amber-500" }), color: "border-l-amber-500" })),
        React.createElement("div", { className: "flex flex-wrap items-center gap-3 mb-4" },
            React.createElement("div", { className: "relative flex-1 min-w-[200px]" },
                React.createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
                React.createElement(input_1.Input, { placeholder: "Search client...", value: search, onChange: function (e) { return setSearch(e.target.value); }, className: "pl-9" })),
            React.createElement(select_1.Select, { value: statusFilter, onValueChange: setStatusFilter },
                React.createElement(select_1.SelectTrigger, { className: "w-36" },
                    React.createElement(lucide_react_1.Filter, { className: "h-4 w-4 mr-2" }),
                    React.createElement(select_1.SelectValue, { placeholder: "Status" })),
                React.createElement(select_1.SelectContent, null,
                    React.createElement(select_1.SelectItem, { value: "all" }, "All Statuses"),
                    React.createElement(select_1.SelectItem, { value: "active" }, "Active"),
                    React.createElement(select_1.SelectItem, { value: "trial" }, "Trial"),
                    React.createElement(select_1.SelectItem, { value: "suspended" }, "Suspended"),
                    React.createElement(select_1.SelectItem, { value: "cancelled" }, "Cancelled"),
                    React.createElement(select_1.SelectItem, { value: "expired" }, "Expired"))),
            React.createElement(select_1.Select, { value: cycleFilter, onValueChange: setCycleFilter },
                React.createElement(select_1.SelectTrigger, { className: "w-36" },
                    React.createElement(lucide_react_1.RefreshCw, { className: "h-4 w-4 mr-2" }),
                    React.createElement(select_1.SelectValue, { placeholder: "Cycle" })),
                React.createElement(select_1.SelectContent, null,
                    React.createElement(select_1.SelectItem, { value: "all" }, "All Cycles"),
                    React.createElement(select_1.SelectItem, { value: "monthly" }, "Monthly"),
                    React.createElement(select_1.SelectItem, { value: "annual" }, "Annual"))),
            React.createElement(button_1.Button, { className: "gap-2", onClick: function () { resetForm(); setCreateOpen(true); } },
                React.createElement(lucide_react_1.Plus, { className: "h-4 w-4" }),
                " New Subscription")),
        isLoading ? (React.createElement("div", { className: "flex items-center justify-center py-20" },
            React.createElement(lucide_react_1.Loader2, { className: "h-8 w-8 animate-spin text-muted-foreground" }))) : (React.createElement("div", { className: "border rounded-lg overflow-hidden" },
            React.createElement(table_1.Table, null,
                React.createElement(table_1.TableHeader, null,
                    React.createElement(table_1.TableRow, { className: "bg-muted/50" },
                        React.createElement(table_1.TableHead, null, "Client"),
                        React.createElement(table_1.TableHead, null, "Plan"),
                        React.createElement(table_1.TableHead, null, "Status"),
                        React.createElement(table_1.TableHead, null, "Billing Cycle"),
                        React.createElement(table_1.TableHead, { className: "text-right" }, "Amount"),
                        React.createElement(table_1.TableHead, null, "Renewal Date"),
                        React.createElement(table_1.TableHead, null, "Users"),
                        React.createElement(table_1.TableHead, null, "Auto-Renew"),
                        React.createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                React.createElement(table_1.TableBody, null, filtered.length === 0 ? (React.createElement(table_1.TableRow, null,
                    React.createElement(table_1.TableCell, { colSpan: 9, className: "text-center py-12 text-muted-foreground" },
                        React.createElement(lucide_react_1.Repeat2, { className: "h-8 w-8 mx-auto mb-2 opacity-30" }),
                        "No subscriptions found"))) : (filtered.map(function (sub) { return (React.createElement(table_1.TableRow, { key: sub.id, className: "hover:bg-muted/30 transition-colors cursor-pointer", onClick: function () { return navigate("/subscriptions/" + sub.id); } },
                    React.createElement(table_1.TableCell, { className: "font-medium text-blue-600 hover:underline" }, sub.clientName),
                    React.createElement(table_1.TableCell, null, sub.planName || sub.planId),
                    React.createElement(table_1.TableCell, null,
                        React.createElement(StatusBadge, { status: sub.status })),
                    React.createElement(table_1.TableCell, null,
                        React.createElement("span", { className: "flex items-center gap-1 text-sm" },
                            React.createElement(lucide_react_1.RefreshCw, { className: "h-3 w-3 text-muted-foreground" }),
                            sub.billingCycle === "annual" ? "Annual" : "Monthly")),
                    React.createElement(table_1.TableCell, { className: "text-right font-medium" }, parseFloat(sub.currentPrice || "0") === 0 ? (React.createElement("span", { className: "text-muted-foreground" }, "Free Trial")) : (React.createElement("span", null,
                        "$",
                        parseFloat(sub.currentPrice).toLocaleString("en-US", { minimumFractionDigits: 2 })))),
                    React.createElement(table_1.TableCell, null,
                        React.createElement("span", { className: "flex items-center gap-1 text-sm" },
                            React.createElement(lucide_react_1.CalendarClock, { className: "h-3.5 w-3.5 text-muted-foreground" }),
                            sub.renewalDate ? new Date(sub.renewalDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—")),
                    React.createElement(table_1.TableCell, null,
                        React.createElement("span", { className: "flex items-center gap-1 text-sm text-muted-foreground" },
                            React.createElement(lucide_react_1.Users, { className: "h-3 w-3" }),
                            " ",
                            sub.usersCount || 0)),
                    React.createElement(table_1.TableCell, null,
                        React.createElement(badge_1.Badge, { variant: "outline", className: utils_1.cn("text-xs border-0", sub.autoRenew ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40" : "bg-slate-100 text-slate-600 dark:bg-slate-800") }, sub.autoRenew ? "Yes" : "No")),
                    React.createElement(table_1.TableCell, null,
                        React.createElement("div", { className: "flex items-center justify-end gap-1" },
                            React.createElement(button_1.Button, { variant: "ghost", size: "icon", className: "h-8 w-8", onClick: function () { setSelectedSub(sub); setViewOpen(true); } },
                                React.createElement(lucide_react_1.Eye, { className: "h-4 w-4" })),
                            React.createElement(button_1.Button, { variant: "ghost", size: "icon", className: "h-8 w-8", onClick: function () {
                                    setSelectedSub(sub);
                                    setForm({
                                        clientId: sub.clientId || "",
                                        frequency: sub.billingCycle === "annual" ? "annually" : "monthly",
                                        startDate: sub.startDate ? new Date(sub.startDate).toISOString().split("T")[0] : "",
                                        endDate: sub.renewalDate ? new Date(sub.renewalDate).toISOString().split("T")[0] : "",
                                        description: sub.planName || "",
                                        noteToInvoice: ""
                                    });
                                    setEditOpen(true);
                                } },
                                React.createElement(lucide_react_1.Pencil, { className: "h-4 w-4" })),
                            React.createElement(button_1.Button, { variant: "ghost", size: "icon", className: "h-8 w-8 text-destructive", onClick: function () {
                                    if (confirm("Delete this subscription?"))
                                        deleteMutation.mutate(sub.id);
                                } },
                                React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))))); })))))),
        React.createElement(dialog_1.Dialog, { open: createOpen, onOpenChange: setCreateOpen },
            React.createElement(dialog_1.DialogContent, { className: "max-w-lg" },
                React.createElement(dialog_1.DialogHeader, null,
                    React.createElement(dialog_1.DialogTitle, null, "New Subscription"),
                    React.createElement(dialog_1.DialogDescription, null, "Create a recurring billing subscription for a client.")),
                React.createElement("div", { className: "space-y-4" },
                    React.createElement("div", null,
                        React.createElement(label_1.Label, null, "Client"),
                        React.createElement(select_1.Select, { value: form.clientId, onValueChange: function (v) { return setForm(function (f) { return (__assign(__assign({}, f), { clientId: v })); }); } },
                            React.createElement(select_1.SelectTrigger, null,
                                React.createElement(select_1.SelectValue, { placeholder: "Select client" })),
                            React.createElement(select_1.SelectContent, null, clients.map(function (c) { return (React.createElement(select_1.SelectItem, { key: c.id, value: c.id }, c.name || c.businessName)); })))),
                    React.createElement("div", null,
                        React.createElement(label_1.Label, null, "Frequency"),
                        React.createElement(select_1.Select, { value: form.frequency, onValueChange: function (v) { return setForm(function (f) { return (__assign(__assign({}, f), { frequency: v })); }); } },
                            React.createElement(select_1.SelectTrigger, null,
                                React.createElement(select_1.SelectValue, null)),
                            React.createElement(select_1.SelectContent, null,
                                React.createElement(select_1.SelectItem, { value: "weekly" }, "Weekly"),
                                React.createElement(select_1.SelectItem, { value: "biweekly" }, "Bi-weekly"),
                                React.createElement(select_1.SelectItem, { value: "monthly" }, "Monthly"),
                                React.createElement(select_1.SelectItem, { value: "quarterly" }, "Quarterly"),
                                React.createElement(select_1.SelectItem, { value: "annually" }, "Annually")))),
                    React.createElement("div", { className: "grid grid-cols-2 gap-3" },
                        React.createElement("div", null,
                            React.createElement(label_1.Label, null, "Start Date"),
                            React.createElement(input_1.Input, { type: "date", value: form.startDate, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { startDate: e.target.value })); }); } })),
                        React.createElement("div", null,
                            React.createElement(label_1.Label, null, "End Date (optional)"),
                            React.createElement(input_1.Input, { type: "date", value: form.endDate, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { endDate: e.target.value })); }); } }))),
                    React.createElement("div", null,
                        React.createElement(label_1.Label, null, "Description"),
                        React.createElement(input_1.Input, { value: form.description, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { description: e.target.value })); }); }, placeholder: "e.g. Monthly hosting plan" })),
                    React.createElement("div", null,
                        React.createElement(label_1.Label, null, "Account Manager"),
                        React.createElement(select_1.Select, { value: form.accountManagerId, onValueChange: function (v) { return setForm(function (f) { return (__assign(__assign({}, f), { accountManagerId: v })); }); } },
                            React.createElement(select_1.SelectTrigger, null,
                                React.createElement(select_1.SelectValue, { placeholder: "Select account manager" })),
                            React.createElement(select_1.SelectContent, null, users.map(function (user) { return (React.createElement(select_1.SelectItem, { key: user.id, value: user.id }, user.name || user.fullName || user.email || "User")); })))),
                    React.createElement("div", null,
                        React.createElement(label_1.Label, null, "Template Invoice (optional)"),
                        React.createElement(select_1.Select, { onValueChange: function (v) { return setForm(function (f) { return (__assign(__assign({}, f), { templateInvoiceId: v })); }); } },
                            React.createElement(select_1.SelectTrigger, null,
                                React.createElement(select_1.SelectValue, { placeholder: "Select an invoice as template" })),
                            React.createElement(select_1.SelectContent, null, invoicesList.slice(0, 50).map(function (inv) { return (React.createElement(select_1.SelectItem, { key: inv.id, value: inv.id },
                                inv.invoiceNumber,
                                " \u2014 ",
                                inv.clientName || "Client")); })))),
                    React.createElement("div", null,
                        React.createElement(label_1.Label, null, "Note to Invoice"),
                        React.createElement(textarea_1.Textarea, { value: form.noteToInvoice, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { noteToInvoice: e.target.value })); }); }, placeholder: "Optional note added to generated invoices", rows: 2 }))),
                React.createElement(dialog_1.DialogFooter, null,
                    React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setCreateOpen(false); } }, "Cancel"),
                    React.createElement(button_1.Button, { disabled: !form.clientId || createMutation.isPending, onClick: function () {
                            var templateId = form.templateInvoiceId;
                            if (!templateId) {
                                sonner_1.toast.error("Please select a template invoice");
                                return;
                            }
                            var extraNote = form.accountManagerId ? "Account Manager: " + (accountManagerMap[form.accountManagerId] || "Unknown") : undefined;
                            createMutation.mutate({
                                clientId: form.clientId,
                                templateInvoiceId: templateId,
                                frequency: form.frequency,
                                startDate: new Date(form.startDate).toISOString(),
                                endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
                                description: form.description || undefined,
                                noteToInvoice: [form.noteToInvoice, extraNote].filter(Boolean).join("\n") || undefined
                            });
                        } },
                        createMutation.isPending ? React.createElement(lucide_react_1.Loader2, { className: "h-4 w-4 animate-spin mr-2" }) : null,
                        "Create Subscription")))),
        React.createElement(dialog_1.Dialog, { open: editOpen, onOpenChange: setEditOpen },
            React.createElement(dialog_1.DialogContent, { className: "max-w-lg" },
                React.createElement(dialog_1.DialogHeader, null,
                    React.createElement(dialog_1.DialogTitle, null, "Edit Subscription"),
                    React.createElement(dialog_1.DialogDescription, null, "Update the subscription details.")),
                React.createElement("div", { className: "space-y-4" },
                    React.createElement("div", null,
                        React.createElement(label_1.Label, null, "Frequency"),
                        React.createElement(select_1.Select, { value: form.frequency, onValueChange: function (v) { return setForm(function (f) { return (__assign(__assign({}, f), { frequency: v })); }); } },
                            React.createElement(select_1.SelectTrigger, null,
                                React.createElement(select_1.SelectValue, null)),
                            React.createElement(select_1.SelectContent, null,
                                React.createElement(select_1.SelectItem, { value: "weekly" }, "Weekly"),
                                React.createElement(select_1.SelectItem, { value: "biweekly" }, "Bi-weekly"),
                                React.createElement(select_1.SelectItem, { value: "monthly" }, "Monthly"),
                                React.createElement(select_1.SelectItem, { value: "quarterly" }, "Quarterly"),
                                React.createElement(select_1.SelectItem, { value: "annually" }, "Annually")))),
                    React.createElement("div", null,
                        React.createElement(label_1.Label, null, "End Date"),
                        React.createElement(input_1.Input, { type: "date", value: form.endDate, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { endDate: e.target.value })); }); } })),
                    React.createElement("div", null,
                        React.createElement(label_1.Label, null, "Description"),
                        React.createElement(input_1.Input, { value: form.description, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { description: e.target.value })); }); } })),
                    React.createElement("div", null,
                        React.createElement(label_1.Label, null, "Status"),
                        React.createElement(select_1.Select, { value: (selectedSub === null || selectedSub === void 0 ? void 0 : selectedSub.status) === "active" ? "true" : "false", onValueChange: function (v) {
                                if (selectedSub)
                                    toggleMutation.mutate({ id: selectedSub.id, isActive: v === "true" });
                            } },
                            React.createElement(select_1.SelectTrigger, null,
                                React.createElement(select_1.SelectValue, null)),
                            React.createElement(select_1.SelectContent, null,
                                React.createElement(select_1.SelectItem, { value: "true" }, "Active"),
                                React.createElement(select_1.SelectItem, { value: "false" }, "Inactive"))))),
                React.createElement(dialog_1.DialogFooter, null,
                    React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setEditOpen(false); } }, "Cancel"),
                    React.createElement(button_1.Button, { disabled: updateMutation.isPending, onClick: function () {
                            if (!selectedSub)
                                return;
                            updateMutation.mutate({
                                id: selectedSub.id,
                                frequency: form.frequency,
                                endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
                                description: form.description || undefined
                            });
                        } },
                        updateMutation.isPending ? React.createElement(lucide_react_1.Loader2, { className: "h-4 w-4 animate-spin mr-2" }) : null,
                        "Save Changes")))),
        React.createElement(dialog_1.Dialog, { open: viewOpen, onOpenChange: setViewOpen },
            React.createElement(dialog_1.DialogContent, { className: "max-w-md" },
                React.createElement(dialog_1.DialogHeader, null,
                    React.createElement(dialog_1.DialogTitle, null, "Subscription Details")),
                selectedSub && (React.createElement("div", { className: "space-y-3 text-sm" },
                    React.createElement("div", { className: "flex justify-between" },
                        React.createElement("span", { className: "text-muted-foreground" }, "Client"),
                        React.createElement("span", { className: "font-medium" }, selectedSub.clientName)),
                    React.createElement("div", { className: "flex justify-between" },
                        React.createElement("span", { className: "text-muted-foreground" }, "Plan"),
                        React.createElement("span", { className: "font-medium" }, selectedSub.planName)),
                    React.createElement("div", { className: "flex justify-between" },
                        React.createElement("span", { className: "text-muted-foreground" }, "Status"),
                        React.createElement(StatusBadge, { status: selectedSub.status })),
                    React.createElement("div", { className: "flex justify-between" },
                        React.createElement("span", { className: "text-muted-foreground" }, "Billing Cycle"),
                        React.createElement("span", null, selectedSub.billingCycle === "annual" ? "Annual" : "Monthly")),
                    React.createElement("div", { className: "flex justify-between" },
                        React.createElement("span", { className: "text-muted-foreground" }, "Amount"),
                        React.createElement("span", { className: "font-medium" },
                            "$",
                            parseFloat(selectedSub.currentPrice || "0").toLocaleString("en-US", { minimumFractionDigits: 2 }))),
                    React.createElement("div", { className: "flex justify-between" },
                        React.createElement("span", { className: "text-muted-foreground" }, "Start Date"),
                        React.createElement("span", null, selectedSub.startDate ? new Date(selectedSub.startDate).toLocaleDateString() : "—")),
                    React.createElement("div", { className: "flex justify-between" },
                        React.createElement("span", { className: "text-muted-foreground" }, "Renewal Date"),
                        React.createElement("span", null, selectedSub.renewalDate ? new Date(selectedSub.renewalDate).toLocaleDateString() : "—")),
                    React.createElement("div", { className: "flex justify-between" },
                        React.createElement("span", { className: "text-muted-foreground" }, "Auto-Renew"),
                        React.createElement("span", null, selectedSub.autoRenew ? "Yes" : "No")))),
                React.createElement(dialog_1.DialogFooter, null,
                    React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setViewOpen(false); } }, "Close"))))));
}
exports["default"] = Subscriptions;
