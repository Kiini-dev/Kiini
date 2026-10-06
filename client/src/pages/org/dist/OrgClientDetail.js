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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var OrgLayout_1 = require("@/components/OrgLayout");
var OrgBreadcrumb_1 = require("@/components/OrgBreadcrumb");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var skeleton_1 = require("@/components/ui/skeleton");
var dialog_1 = require("@/components/ui/dialog");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var RichTextEditor_1 = require("@/components/RichTextEditor");
var select_1 = require("@/components/ui/select");
var trpc_1 = require("@/lib/trpc");
var LocationSelects_1 = require("@/components/LocationSelects");
var PhoneInput_1 = require("@/components/PhoneInput");
var sonner_1 = require("sonner");
var healthScore_1 = require("@/lib/healthScore");
var lucide_react_1 = require("lucide-react");
function StatusBadge(_a) {
    var _b;
    var status = _a.status;
    if (!status)
        return null;
    var map = {
        active: "bg-green-500/20 text-green-300 border-green-500/30",
        inactive: "bg-gray-500/20 text-gray-300 border-gray-500/30",
        prospect: "bg-purple-500/20 text-purple-300 border-purple-500/30",
        archived: "bg-slate-500/20 text-slate-300 border-slate-500/30"
    };
    return (react_1["default"].createElement("span", { className: "inline-flex px-2 py-0.5 rounded text-xs font-medium border capitalize " + ((_b = map[status]) !== null && _b !== void 0 ? _b : "bg-white/10 text-white/60 border-white/20") }, status));
}
function InvoiceStatusBadge(_a) {
    var _b;
    var status = _a.status;
    if (!status)
        return null;
    var map = {
        paid: "bg-green-500/20 text-green-300 border-green-500/30",
        draft: "bg-slate-500/20 text-slate-300 border-slate-500/30",
        sent: "bg-blue-500/20 text-blue-300 border-blue-500/30",
        overdue: "bg-red-500/20 text-red-300 border-red-500/30",
        partial: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
        cancelled: "bg-gray-500/20 text-gray-300 border-gray-500/30"
    };
    return (react_1["default"].createElement("span", { className: "inline-flex px-2 py-0.5 rounded text-xs font-medium border " + ((_b = map[status]) !== null && _b !== void 0 ? _b : "bg-white/10 text-white/60 border-white/20") }, status));
}
function ProjectStatusBadge(_a) {
    var _b;
    var status = _a.status;
    var s = (status !== null && status !== void 0 ? status : "planning").toLowerCase();
    var map = {
        active: "bg-green-500/20 text-green-300 border-green-500/30",
        planning: "bg-blue-500/20 text-blue-300 border-blue-500/30",
        "on-hold": "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
        completed: "bg-slate-500/20 text-slate-300 border-slate-500/30",
        cancelled: "bg-red-500/20 text-red-300 border-red-500/30"
    };
    return (react_1["default"].createElement("span", { className: "inline-flex px-2 py-0.5 rounded text-xs font-medium border capitalize " + ((_b = map[s]) !== null && _b !== void 0 ? _b : "bg-white/10 text-white/60 border-white/20") }, s));
}
function formatCurrency(n) {
    if (n >= 1000000)
        return "KES " + (n / 1000000).toFixed(1) + "M";
    if (n >= 1000)
        return "KES " + (n / 1000).toFixed(1) + "K";
    return "KES " + n.toFixed(0);
}
function InfoRow(_a) {
    var Icon = _a.icon, label = _a.label, value = _a.value;
    if (!value)
        return null;
    return (react_1["default"].createElement("div", { className: "flex items-start gap-3" },
        react_1["default"].createElement(Icon, { className: "h-4 w-4 text-white/30 mt-0.5 shrink-0" }),
        react_1["default"].createElement("div", null,
            react_1["default"].createElement("p", { className: "text-[10px] text-white/40 uppercase tracking-wide" }, label),
            react_1["default"].createElement("p", { className: "text-sm text-white" }, value))));
}
function OrgClientDetail() {
    var _a, _b, _c, _d, _e;
    var params = wouter_1.useParams();
    var slug = params.slug;
    var clientId = params.id;
    var _f = wouter_1.useLocation(), setLocation = _f[1];
    var _g = react_1.useState(false), editOpen = _g[0], setEditOpen = _g[1];
    var _h = react_1.useState(null), editForm = _h[0], setEditForm = _h[1];
    var clientQuery = trpc_1.trpc.clients.getById.useQuery(clientId, { staleTime: 60000, enabled: !!clientId });
    var revenueQuery = trpc_1.trpc.clients.getRevenue.useQuery(clientId, { staleTime: 60000, enabled: !!clientId });
    var projectsQuery = trpc_1.trpc.clients.getProjects.useQuery(clientId, { staleTime: 60000, enabled: !!clientId });
    var updateMutation = trpc_1.trpc.clients.update.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Client updated");
            clientQuery.refetch();
            setEditOpen(false);
        },
        onError: function (e) { return sonner_1.toast.error(e.message || "Failed to update"); }
    });
    var client = clientQuery.data;
    var revenue = revenueQuery.data;
    var clientProjects = ((_a = projectsQuery.data) !== null && _a !== void 0 ? _a : []);
    var invoices = ((_b = revenue === null || revenue === void 0 ? void 0 : revenue.invoices) !== null && _b !== void 0 ? _b : []);
    var recentInvoices = __spreadArrays(invoices).sort(function (a, b) { return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime(); }).slice(0, 5);
    var openEdit = function () {
        setEditForm({
            companyName: (client === null || client === void 0 ? void 0 : client.companyName) || "",
            contactPerson: (client === null || client === void 0 ? void 0 : client.contactPerson) || "",
            email: (client === null || client === void 0 ? void 0 : client.email) || "",
            phone: (client === null || client === void 0 ? void 0 : client.phone) || "",
            address: (client === null || client === void 0 ? void 0 : client.address) || "",
            city: (client === null || client === void 0 ? void 0 : client.city) || "",
            country: (client === null || client === void 0 ? void 0 : client.country) || "",
            website: (client === null || client === void 0 ? void 0 : client.website) || "",
            industry: (client === null || client === void 0 ? void 0 : client.industry) || "",
            status: (client === null || client === void 0 ? void 0 : client.status) || "active",
            notes: (client === null || client === void 0 ? void 0 : client.notes) || ""
        });
        setEditOpen(true);
    };
    var handleSave = function () {
        if (!(editForm === null || editForm === void 0 ? void 0 : editForm.companyName)) {
            sonner_1.toast.error("Company name is required");
            return;
        }
        updateMutation.mutate(__assign({ id: clientId }, editForm));
    };
    // Progress ring component
    var collectionRate = revenue && revenue.totalRevenue > 0
        ? Math.round((revenue.paidRevenue / revenue.totalRevenue) * 100)
        : 0;
    // ── Client Health Score (shared algorithm) ────────────────────
    var health = (!revenueQuery.isLoading && !projectsQuery.isLoading)
        ? healthScore_1.computeHealthScore(invoices, clientProjects)
        : null;
    if (clientQuery.isLoading) {
        return (react_1["default"].createElement(OrgLayout_1["default"], { title: "Client Profile" },
            react_1["default"].createElement("div", { className: "space-y-4" },
                react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-8 w-48 bg-white/5" }),
                react_1["default"].createElement("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4" },
                    react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-64 bg-white/5 rounded-xl" }),
                    react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-64 md:col-span-2 bg-white/5 rounded-xl" })))));
    }
    if (!client) {
        return (react_1["default"].createElement(OrgLayout_1["default"], { title: "Client Not Found" },
            react_1["default"].createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
                react_1["default"].createElement(card_1.CardContent, { className: "py-16 text-center" },
                    react_1["default"].createElement(lucide_react_1.AlertCircle, { className: "h-10 w-10 text-white/20 mx-auto mb-3" }),
                    react_1["default"].createElement("p", { className: "text-white font-medium" }, "Client not found"),
                    react_1["default"].createElement(button_1.Button, { className: "mt-4", variant: "ghost", onClick: function () { return setLocation("/org/" + slug + "/crm"); } },
                        react_1["default"].createElement(lucide_react_1.ArrowLeft, { className: "h-4 w-4 mr-1" }),
                        " Back to CRM")))));
    }
    var displayName = client.companyName || client.name || "Unknown Client";
    var initials = displayName.split(" ").map(function (w) { return w[0]; }).slice(0, 2).join("").toUpperCase();
    return (react_1["default"].createElement(OrgLayout_1["default"], { title: displayName },
        react_1["default"].createElement("div", { className: "space-y-5" },
            react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                react_1["default"].createElement(OrgBreadcrumb_1["default"], { slug: slug, items: [
                        { label: "CRM", href: "/org/" + slug + "/crm" },
                        { label: displayName },
                    ] }),
                react_1["default"].createElement("div", { className: "flex gap-2" },
                    react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", className: "text-white/50 hover:text-white", onClick: function () { return setLocation("/org/" + slug + "/crm"); } },
                        react_1["default"].createElement(lucide_react_1.ArrowLeft, { className: "h-4 w-4 mr-1" }),
                        " Back"),
                    react_1["default"].createElement(button_1.Button, { size: "sm", className: "bg-blue-600 hover:bg-blue-700", onClick: openEdit },
                        react_1["default"].createElement(lucide_react_1.Edit2, { className: "h-4 w-4 mr-1" }),
                        " Edit"))),
            react_1["default"].createElement("div", { className: "flex items-center gap-5 p-5 rounded-xl bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-white/10" },
                react_1["default"].createElement("div", { className: "h-16 w-16 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-2xl font-bold text-blue-300 shrink-0" }, initials),
                react_1["default"].createElement("div", { className: "flex-1 min-w-0" },
                    react_1["default"].createElement("div", { className: "flex items-center gap-3 flex-wrap" },
                        react_1["default"].createElement("h1", { className: "text-xl font-bold text-white" }, displayName),
                        react_1["default"].createElement(StatusBadge, { status: client.status }),
                        client.industry && (react_1["default"].createElement("span", { className: "text-xs text-white/40 bg-white/5 border border-white/10 px-2 py-0.5 rounded" }, client.industry))),
                    client.contactPerson && (react_1["default"].createElement("p", { className: "text-sm text-white/50 mt-1" }, client.contactPerson)))),
            react_1["default"].createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3" },
                react_1["default"].createElement(card_1.Card, { className: "bg-blue-600/10 border-blue-500/20" },
                    react_1["default"].createElement(card_1.CardContent, { className: "pt-4 pb-3" },
                        react_1["default"].createElement("p", { className: "text-xs text-blue-300/70 uppercase tracking-wide" }, "Total Invoiced"),
                        react_1["default"].createElement("p", { className: "text-xl font-bold text-white mt-1" }, formatCurrency((_c = revenue === null || revenue === void 0 ? void 0 : revenue.totalRevenue) !== null && _c !== void 0 ? _c : 0)),
                        react_1["default"].createElement("p", { className: "text-[10px] text-white/30 mt-0.5" },
                            invoices.length,
                            " invoice",
                            invoices.length !== 1 ? "s" : ""))),
                react_1["default"].createElement(card_1.Card, { className: "bg-green-600/10 border-green-500/20" },
                    react_1["default"].createElement(card_1.CardContent, { className: "pt-4 pb-3" },
                        react_1["default"].createElement("p", { className: "text-xs text-green-300/70 uppercase tracking-wide" }, "Paid"),
                        react_1["default"].createElement("p", { className: "text-xl font-bold text-white mt-1" }, formatCurrency((_d = revenue === null || revenue === void 0 ? void 0 : revenue.paidRevenue) !== null && _d !== void 0 ? _d : 0)),
                        react_1["default"].createElement("p", { className: "text-[10px] text-white/30 mt-0.5" },
                            collectionRate,
                            "% collected"))),
                react_1["default"].createElement(card_1.Card, { className: "bg-yellow-600/10 border-yellow-500/20" },
                    react_1["default"].createElement(card_1.CardContent, { className: "pt-4 pb-3" },
                        react_1["default"].createElement("p", { className: "text-xs text-yellow-300/70 uppercase tracking-wide" }, "Outstanding"),
                        react_1["default"].createElement("p", { className: "text-xl font-bold text-white mt-1" }, formatCurrency((_e = revenue === null || revenue === void 0 ? void 0 : revenue.outstandingRevenue) !== null && _e !== void 0 ? _e : 0)),
                        react_1["default"].createElement("p", { className: "text-[10px] text-white/30 mt-0.5" }, "to collect"))),
                react_1["default"].createElement(card_1.Card, { className: "bg-purple-600/10 border-purple-500/20" },
                    react_1["default"].createElement(card_1.CardContent, { className: "pt-4 pb-3" },
                        react_1["default"].createElement("p", { className: "text-xs text-purple-300/70 uppercase tracking-wide" }, "Projects"),
                        react_1["default"].createElement("p", { className: "text-xl font-bold text-white mt-1" }, clientProjects.length),
                        react_1["default"].createElement("p", { className: "text-[10px] text-white/30 mt-0.5" }, "total projects")))),
            health && (react_1["default"].createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
                react_1["default"].createElement(card_1.CardContent, { className: "py-4 px-5" },
                    react_1["default"].createElement("div", { className: "flex items-center gap-4 flex-wrap" },
                        react_1["default"].createElement("div", { className: "relative h-14 w-14 shrink-0" },
                            react_1["default"].createElement("svg", { className: "h-14 w-14 -rotate-90", viewBox: "0 0 56 56" },
                                react_1["default"].createElement("circle", { cx: "28", cy: "28", r: "22", fill: "none", stroke: "rgba(255,255,255,0.06)", strokeWidth: "6" }),
                                react_1["default"].createElement("circle", { cx: "28", cy: "28", r: "22", fill: "none", stroke: health.color, strokeWidth: "6", strokeDasharray: "" + 2 * Math.PI * 22, strokeDashoffset: "" + 2 * Math.PI * 22 * (1 - health.score / 100), strokeLinecap: "round" })),
                            react_1["default"].createElement("span", { className: "absolute inset-0 flex items-center justify-center text-sm font-bold text-white" }, health.score)),
                        react_1["default"].createElement("div", { className: "flex-1 min-w-0" },
                            react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                                react_1["default"].createElement("span", { className: "text-base font-semibold", style: { color: health.color } }, health.label),
                                react_1["default"].createElement("span", { className: "text-xs text-white/30" }, "Client Health Score")),
                            react_1["default"].createElement("p", { className: "text-xs text-white/40 mt-0.5" },
                                "Based on payment history (",
                                collectionRate,
                                "% collection rate),\u00A0",
                                clientProjects.filter(function (p) { return p.status === "active"; }).length,
                                " active project",
                                clientProjects.filter(function (p) { return p.status === "active"; }).length !== 1 ? "s" : "",
                                ", and recent activity.")),
                        react_1["default"].createElement("div", { className: "hidden sm:flex flex-col gap-1 min-w-[160px]" }, health.breakdown.map(function (_a) {
                            var label = _a.label, value = _a.value, barColor = _a.color;
                            return (react_1["default"].createElement("div", { key: label, className: "flex items-center gap-2" },
                                react_1["default"].createElement("span", { className: "text-[10px] text-white/30 w-24 shrink-0" }, label),
                                react_1["default"].createElement("div", { className: "flex-1 h-1 rounded-full bg-white/10 overflow-hidden" },
                                    react_1["default"].createElement("div", { className: "h-full rounded-full", style: { width: value + "%", background: barColor } }))));
                        })))))),
            react_1["default"].createElement("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-4" },
                react_1["default"].createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
                    react_1["default"].createElement(card_1.CardHeader, { className: "pb-3" },
                        react_1["default"].createElement(card_1.CardTitle, { className: "text-sm text-white/70 uppercase tracking-wide" }, "Contact Details")),
                    react_1["default"].createElement(card_1.CardContent, { className: "space-y-4" },
                        react_1["default"].createElement(InfoRow, { icon: lucide_react_1.Mail, label: "Email", value: client.email }),
                        react_1["default"].createElement(InfoRow, { icon: lucide_react_1.Phone, label: "Phone", value: client.phone }),
                        react_1["default"].createElement(InfoRow, { icon: lucide_react_1.Globe, label: "Website", value: client.website }),
                        react_1["default"].createElement(InfoRow, { icon: lucide_react_1.Building2, label: "Industry", value: client.industry }),
                        react_1["default"].createElement(InfoRow, { icon: lucide_react_1.MapPin, label: "Location", value: [client.city, client.country].filter(Boolean).join(", ") }),
                        react_1["default"].createElement(InfoRow, { icon: lucide_react_1.User, label: "Contact Person", value: client.contactPerson }),
                        client.taxId && react_1["default"].createElement(InfoRow, { icon: lucide_react_1.FileText, label: "Tax ID", value: client.taxId }),
                        client.notes && (react_1["default"].createElement("div", { className: "pt-2 border-t border-white/5" },
                            react_1["default"].createElement("p", { className: "text-[10px] text-white/40 uppercase tracking-wide mb-1" }, "Notes"),
                            react_1["default"].createElement("p", { className: "text-xs text-white/60 leading-relaxed" }, client.notes))))),
                react_1["default"].createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
                    react_1["default"].createElement(card_1.CardHeader, { className: "pb-3 flex flex-row items-center justify-between" },
                        react_1["default"].createElement(card_1.CardTitle, { className: "text-sm text-white/70 uppercase tracking-wide" }, "Recent Invoices"),
                        react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", className: "text-white/40 hover:text-white text-xs h-7", onClick: function () { return setLocation("/org/" + slug + "/invoices"); } }, "View all")),
                    react_1["default"].createElement(card_1.CardContent, { className: "p-0" }, recentInvoices.length === 0 ? (react_1["default"].createElement("div", { className: "px-6 py-10 text-center" },
                        react_1["default"].createElement(lucide_react_1.FileText, { className: "h-8 w-8 text-white/10 mx-auto mb-2" }),
                        react_1["default"].createElement("p", { className: "text-xs text-white/30" }, "No invoices yet"))) : (react_1["default"].createElement("div", { className: "divide-y divide-white/5" }, recentInvoices.map(function (inv) {
                        var _a;
                        return (react_1["default"].createElement("div", { key: inv.id, className: "flex items-center justify-between px-6 py-3 hover:bg-white/5" },
                            react_1["default"].createElement("div", null,
                                react_1["default"].createElement("p", { className: "text-xs font-medium text-white" }, inv.invoiceNumber || "INV-" + ((_a = inv.id) === null || _a === void 0 ? void 0 : _a.slice(0, 8))),
                                react_1["default"].createElement("p", { className: "text-[10px] text-white/40 mt-0.5" }, inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("en-KE", { month: "short", day: "numeric", year: "numeric" }) : "—")),
                            react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                                react_1["default"].createElement(InvoiceStatusBadge, { status: inv.status }),
                                react_1["default"].createElement("span", { className: "text-xs font-semibold text-white" }, formatCurrency(Number(inv.total || 0))))));
                    }))))),
                react_1["default"].createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
                    react_1["default"].createElement(card_1.CardHeader, { className: "pb-3 flex flex-row items-center justify-between" },
                        react_1["default"].createElement(card_1.CardTitle, { className: "text-sm text-white/70 uppercase tracking-wide" }, "Projects"),
                        react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", className: "text-white/40 hover:text-white text-xs h-7", onClick: function () { return setLocation("/org/" + slug + "/projects"); } }, "View all")),
                    react_1["default"].createElement(card_1.CardContent, { className: "p-0" }, projectsQuery.isLoading ? (react_1["default"].createElement("div", { className: "p-4 space-y-2" }, Array.from({ length: 3 }).map(function (_, i) { return react_1["default"].createElement(skeleton_1.Skeleton, { key: i, className: "h-10 bg-white/5" }); }))) : clientProjects.length === 0 ? (react_1["default"].createElement("div", { className: "px-6 py-10 text-center" },
                        react_1["default"].createElement(lucide_react_1.Briefcase, { className: "h-8 w-8 text-white/10 mx-auto mb-2" }),
                        react_1["default"].createElement("p", { className: "text-xs text-white/30" }, "No projects yet"))) : (react_1["default"].createElement("div", { className: "divide-y divide-white/5" }, clientProjects.map(function (proj) {
                        var pct = Math.min(100, Math.max(0, Number(proj.progress || 0)));
                        return (react_1["default"].createElement("div", { key: proj.id, className: "px-6 py-3 hover:bg-white/5 cursor-pointer", onClick: function () { return setLocation("/org/" + slug + "/projects/" + proj.id); } },
                            react_1["default"].createElement("div", { className: "flex items-center justify-between mb-1" },
                                react_1["default"].createElement("p", { className: "text-xs font-medium text-white truncate max-w-[140px]" }, proj.name),
                                react_1["default"].createElement(ProjectStatusBadge, { status: proj.status })),
                            react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                                react_1["default"].createElement("div", { className: "flex-1 h-1 bg-white/10 rounded-full overflow-hidden" },
                                    react_1["default"].createElement("div", { className: "h-full bg-blue-500 rounded-full", style: { width: pct + "%" } })),
                                react_1["default"].createElement("span", { className: "text-[10px] text-white/40" },
                                    pct,
                                    "%"))));
                    }))))))),
        react_1["default"].createElement(dialog_1.Dialog, { open: editOpen, onOpenChange: setEditOpen },
            react_1["default"].createElement(dialog_1.DialogContent, { className: "max-w-lg bg-[#1a1f2e] border-white/10 max-h-[90vh] overflow-y-auto" },
                react_1["default"].createElement(dialog_1.DialogHeader, null,
                    react_1["default"].createElement(dialog_1.DialogTitle, { className: "text-white" }, "Edit Client")),
                editForm && (react_1["default"].createElement("div", { className: "space-y-3 mt-2" },
                    react_1["default"].createElement("div", { className: "grid grid-cols-2 gap-3" },
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement(label_1.Label, { className: "text-white/70 text-xs" }, "Company Name *"),
                            react_1["default"].createElement(input_1.Input, { className: "mt-1 bg-white/5 border-white/10 text-white", value: editForm.companyName, onChange: function (e) { return setEditForm(__assign(__assign({}, editForm), { companyName: e.target.value })); } })),
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement(label_1.Label, { className: "text-white/70 text-xs" }, "Contact Person"),
                            react_1["default"].createElement(input_1.Input, { className: "mt-1 bg-white/5 border-white/10 text-white", value: editForm.contactPerson, onChange: function (e) { return setEditForm(__assign(__assign({}, editForm), { contactPerson: e.target.value })); } }))),
                    react_1["default"].createElement("div", { className: "grid grid-cols-2 gap-3" },
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement(label_1.Label, { className: "text-white/70 text-xs" }, "Email"),
                            react_1["default"].createElement(input_1.Input, { type: "email", className: "mt-1 bg-white/5 border-white/10 text-white", value: editForm.email, onChange: function (e) { return setEditForm(__assign(__assign({}, editForm), { email: e.target.value })); } })),
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement(label_1.Label, { className: "text-white/70 text-xs" }, "Phone"),
                            react_1["default"].createElement(PhoneInput_1.PhoneInput, { className: "mt-1 bg-white/5 border-white/10 text-white", value: editForm.phone, onChange: function (v) { return setEditForm(__assign(__assign({}, editForm), { phone: v })); } }))),
                    react_1["default"].createElement("div", { className: "grid grid-cols-2 gap-3" },
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement(label_1.Label, { className: "text-white/70 text-xs" }, "City"),
                            react_1["default"].createElement(LocationSelects_1.CitySelect, { value: editForm.city, onChange: function (v) { return setEditForm(__assign(__assign({}, editForm), { city: v })); } })),
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement(label_1.Label, { className: "text-white/70 text-xs" }, "Country"),
                            react_1["default"].createElement(LocationSelects_1.CountrySelect, { value: editForm.country, onChange: function (v) { return setEditForm(__assign(__assign({}, editForm), { country: v })); } }))),
                    react_1["default"].createElement("div", { className: "grid grid-cols-2 gap-3" },
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement(label_1.Label, { className: "text-white/70 text-xs" }, "Industry"),
                            react_1["default"].createElement(LocationSelects_1.IndustrySelect, { value: editForm.industry, onChange: function (v) { return setEditForm(__assign(__assign({}, editForm), { industry: v })); } })),
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement(label_1.Label, { className: "text-white/70 text-xs" }, "Status"),
                            react_1["default"].createElement(select_1.Select, { value: editForm.status, onValueChange: function (v) { return setEditForm(__assign(__assign({}, editForm), { status: v })); } },
                                react_1["default"].createElement(select_1.SelectTrigger, { className: "mt-1 bg-white/5 border-white/10 text-white" },
                                    react_1["default"].createElement(select_1.SelectValue, null)),
                                react_1["default"].createElement(select_1.SelectContent, null, ["active", "inactive", "prospect", "archived"].map(function (s) { return (react_1["default"].createElement(select_1.SelectItem, { key: s, value: s, className: "capitalize" }, s)); }))))),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement(label_1.Label, { className: "text-white/70 text-xs" }, "Website"),
                        react_1["default"].createElement(input_1.Input, { className: "mt-1 bg-white/5 border-white/10 text-white", value: editForm.website, onChange: function (e) { return setEditForm(__assign(__assign({}, editForm), { website: e.target.value })); } })),
                    react_1["default"].createElement("div", null,
                        react_1["default"].createElement(label_1.Label, { className: "text-white/70 text-xs" }, "Notes"),
                        react_1["default"].createElement(RichTextEditor_1.RichTextEditor, { value: editForm.notes, onChange: function (html) { return setEditForm(__assign(__assign({}, editForm), { notes: html })); }, minHeight: "100px", className: "mt-1" })),
                    react_1["default"].createElement("div", { className: "flex justify-end gap-2 pt-2" },
                        react_1["default"].createElement(button_1.Button, { variant: "ghost", className: "text-white/50", onClick: function () { return setEditOpen(false); } }, "Cancel"),
                        react_1["default"].createElement(button_1.Button, { className: "bg-blue-600 hover:bg-blue-700", onClick: handleSave, disabled: updateMutation.isPending }, updateMutation.isPending ? "Saving..." : "Save Changes"))))))));
}
exports["default"] = OrgClientDetail;
