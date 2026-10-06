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
var lucide_react_1 = require("lucide-react");
var STATUS_STYLES = {
    completed: "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30",
    pending: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/30",
    failed: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30",
    refunded: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30"
};
function StatusBadge(_a) {
    var _b;
    var status = _a.status;
    var s = (status !== null && status !== void 0 ? status : "").toLowerCase();
    return (react_1["default"].createElement(badge_1.Badge, { variant: "outline", className: "capitalize " + ((_b = STATUS_STYLES[s]) !== null && _b !== void 0 ? _b : "bg-muted text-muted-foreground") }, s || "—"));
}
function OrgPayments() {
    var _a;
    var params = wouter_1.useParams();
    var slug = params.slug;
    var _b = wouter_1.useLocation(), navigate = _b[1];
    var _c = react_1.useState(""), search = _c[0], setSearch = _c[1];
    var orgData = trpc_1.trpc.multiTenancy.getMyOrg.useQuery(undefined, { staleTime: 300000 }).data;
    var featureMap = (_a = orgData === null || orgData === void 0 ? void 0 : orgData.featureMap) !== null && _a !== void 0 ? _a : {};
    var hasAccess = !orgData || featureMap.payments;
    var _d = trpc_1.trpc.payments.list.useQuery(undefined, {
        staleTime: 60000,
        enabled: !!hasAccess
    }), _e = _d.data, payments = _e === void 0 ? [] : _e, isLoading = _d.isLoading;
    var filtered = payments.filter(function (p) {
        var _a, _b, _c;
        return !search || ((_a = p.reference) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(search.toLowerCase())) || ((_b = p.invoiceNumber) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(search.toLowerCase())) || ((_c = p.method) === null || _c === void 0 ? void 0 : _c.toLowerCase().includes(search.toLowerCase()));
    });
    var totalReceived = payments.reduce(function (sum, p) { return sum + Number(p.amount || 0); }, 0);
    var completedCount = payments.filter(function (p) { return p.status === "completed"; }).length;
    var pendingCount = payments.filter(function (p) { return p.status === "pending"; }).length;
    var summaryStats = [
        { label: "Total Received", value: "KES " + totalReceived.toLocaleString(), trend: undefined },
        { label: "Total Payments", value: String(payments.length), trend: undefined },
        { label: "Completed", value: String(completedCount), trend: undefined },
        { label: "Pending", value: String(pendingCount), trend: undefined },
    ];
    var handleView = function (id) {
        navigate("/org/" + slug + "/payments/" + id);
    };
    if (!hasAccess) {
        return (react_1["default"].createElement(OrgModuleLayout_1.OrgModuleLayout, { title: "Payments", description: "Manage your organization payments", icon: lucide_react_1.DollarSign, breadcrumbs: [
                { label: "Dashboard", href: "/org/" + slug + "/dashboard" },
                { label: "Payments" },
            ], backLink: "/org/" + slug + "/dashboard", hasAccess: false, accessDeniedMessage: "Payments feature is not enabled for your organization plan." },
            react_1["default"].createElement("div", { className: "flex flex-col items-center justify-center py-24 text-center" },
                react_1["default"].createElement(lucide_react_1.AlertCircle, { className: "h-16 w-16 text-muted-foreground mb-4" }),
                react_1["default"].createElement("p", { className: "text-muted-foreground" }, "Payments feature is not available in your current plan."))));
    }
    return (react_1["default"].createElement(OrgModuleLayout_1.OrgModuleLayout, { title: "Payments", description: "Track and manage your organization payments", icon: lucide_react_1.DollarSign, breadcrumbs: [
            { label: "Dashboard", href: "/org/" + slug + "/dashboard" },
            { label: "Payments" },
        ], backLink: "/org/" + slug + "/dashboard", hasAccess: true },
        react_1["default"].createElement("div", { className: "space-y-6" },
            react_1["default"].createElement(SummaryStatCards_1.SummaryStatCards, { cards: summaryStats, isLoading: isLoading }),
            react_1["default"].createElement("div", { className: "flex flex-wrap gap-3 items-center" },
                react_1["default"].createElement("div", { className: "relative flex-1 max-w-sm" },
                    react_1["default"].createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
                    react_1["default"].createElement(input_1.Input, { placeholder: "Search payments...", value: search, onChange: function (e) { return setSearch(e.target.value); }, className: "pl-9" }))),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardContent, { className: "p-0" }, isLoading ? (react_1["default"].createElement("div", { className: "p-6 space-y-3" }, Array.from({ length: 6 }).map(function (_, i) { return react_1["default"].createElement(skeleton_1.Skeleton, { key: i, className: "h-16 rounded" }); }))) : filtered.length === 0 ? (react_1["default"].createElement("div", { className: "py-16 text-center" },
                    react_1["default"].createElement(lucide_react_1.CreditCard, { className: "h-10 w-10 text-muted-foreground/20 mx-auto mb-3" }),
                    react_1["default"].createElement("p", { className: "text-muted-foreground text-sm" }, search ? "No payments match your search" : "No payments recorded yet"))) : (react_1["default"].createElement("div", { className: "overflow-x-auto" },
                    react_1["default"].createElement(table_1.Table, null,
                        react_1["default"].createElement(table_1.TableHeader, null,
                            react_1["default"].createElement(table_1.TableRow, null,
                                react_1["default"].createElement(table_1.TableHead, null, "Reference"),
                                react_1["default"].createElement(table_1.TableHead, null, "Invoice"),
                                react_1["default"].createElement(table_1.TableHead, null, "Method"),
                                react_1["default"].createElement(table_1.TableHead, null, "Status"),
                                react_1["default"].createElement(table_1.TableHead, { className: "text-right" }, "Amount"),
                                react_1["default"].createElement(table_1.TableHead, { className: "text-right" }, "Actions"))),
                        react_1["default"].createElement(table_1.TableBody, null, filtered.map(function (p) {
                            var _a;
                            return (react_1["default"].createElement(table_1.TableRow, { key: p.id, className: "hover:bg-muted/30" },
                                react_1["default"].createElement(table_1.TableCell, null,
                                    react_1["default"].createElement("div", null,
                                        react_1["default"].createElement("p", { className: "font-semibold" }, p.reference || ((_a = p.id) === null || _a === void 0 ? void 0 : _a.toString().slice(0, 8)) || "—"),
                                        react_1["default"].createElement("p", { className: "text-sm text-muted-foreground" }, p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : "—"))),
                                react_1["default"].createElement(table_1.TableCell, null,
                                    react_1["default"].createElement("p", { className: "text-sm" }, p.invoiceNumber || "—")),
                                react_1["default"].createElement(table_1.TableCell, null,
                                    react_1["default"].createElement("p", { className: "text-sm capitalize" }, p.method || "—")),
                                react_1["default"].createElement(table_1.TableCell, null,
                                    react_1["default"].createElement(StatusBadge, { status: p.status })),
                                react_1["default"].createElement(table_1.TableCell, { className: "text-right" },
                                    react_1["default"].createElement("p", { className: "font-semibold" },
                                        "KES ",
                                        Number(p.amount || 0).toLocaleString())),
                                react_1["default"].createElement(table_1.TableCell, { className: "text-right" },
                                    react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return handleView(p.id); }, title: "View" },
                                        react_1["default"].createElement(lucide_react_1.Eye, { className: "h-4 w-4" })))));
                        }))))))))));
}
exports["default"] = OrgPayments;
