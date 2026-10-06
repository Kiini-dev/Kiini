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
var OrgLayout_1 = require("@/components/OrgLayout");
var OrgBreadcrumb_1 = require("@/components/OrgBreadcrumb");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var trpc_1 = require("@/lib/trpc");
var lucide_react_1 = require("lucide-react");
var skeleton_1 = require("@/components/ui/skeleton");
var STATUS_STYLES = {
    sent: "bg-green-500/20 text-green-300 border-green-500/30",
    pending: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    failed: "bg-red-500/20 text-red-300 border-red-500/30"
};
var TYPE_STYLES = {
    email: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    sms: "bg-teal-500/20 text-teal-300 border-teal-500/30"
};
function StatusBadge(_a) {
    var _b;
    var status = _a.status;
    var s = (status !== null && status !== void 0 ? status : "pending").toLowerCase();
    return (react_1["default"].createElement("span", { className: "inline-flex px-2 py-0.5 rounded text-xs font-medium border capitalize " + ((_b = STATUS_STYLES[s]) !== null && _b !== void 0 ? _b : "bg-white/10 text-white/60 border-white/20") }, s));
}
function TypeBadge(_a) {
    var _b;
    var type = _a.type;
    var t = (type !== null && type !== void 0 ? type : "email").toLowerCase();
    return (react_1["default"].createElement("span", { className: "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border capitalize " + ((_b = TYPE_STYLES[t]) !== null && _b !== void 0 ? _b : "bg-white/10 text-white/60 border-white/20") },
        t === "email" ? react_1["default"].createElement(lucide_react_1.Mail, { className: "h-2.5 w-2.5" }) : react_1["default"].createElement(lucide_react_1.Phone, { className: "h-2.5 w-2.5" }),
        t));
}
function AccessDenied(_a) {
    var slug = _a.slug;
    var _b = wouter_1.useLocation(), setLocation = _b[1];
    return (react_1["default"].createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
        react_1["default"].createElement(card_1.CardContent, { className: "py-20 text-center" },
            react_1["default"].createElement(lucide_react_1.Lock, { className: "h-12 w-12 text-white/20 mx-auto mb-4" }),
            react_1["default"].createElement("p", { className: "text-white font-semibold text-lg mb-2" }, "Access Restricted"),
            react_1["default"].createElement("p", { className: "text-white/50 text-sm mb-6" }, "Communications is not enabled for your organization plan."),
            react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", className: "border-white/20 text-white/70 hover:text-white hover:bg-white/10", onClick: function () { return setLocation("/org/" + slug + "/dashboard"); } }, "Back to Dashboard"))));
}
var STATUSES = ["all", "sent", "pending", "failed"];
var TYPES = ["all", "email", "sms"];
function OrgCommunications() {
    var _a, _b, _c, _d, _e;
    var params = wouter_1.useParams();
    var slug = params.slug;
    var _f = wouter_1.useLocation(), setLocation = _f[1];
    var _g = react_1.useState(""), search = _g[0], setSearch = _g[1];
    var _h = react_1.useState("all"), activeStatus = _h[0], setActiveStatus = _h[1];
    var _j = react_1.useState("all"), activeType = _j[0], setActiveType = _j[1];
    var myOrgData = trpc_1.trpc.multiTenancy.getMyOrg.useQuery(undefined, { staleTime: 300000 }).data;
    var featureMap = (_a = myOrgData === null || myOrgData === void 0 ? void 0 : myOrgData.featureMap) !== null && _a !== void 0 ? _a : {};
    var _k = trpc_1.trpc.communications.list.useQuery(__assign(__assign({ limit: 100, offset: 0 }, (activeStatus !== "all" ? { status: activeStatus } : {})), (activeType !== "all" ? { type: activeType } : {})), { staleTime: 60000, enabled: !myOrgData || !!featureMap.communications }), commData = _k.data, isLoading = _k.isLoading;
    var accessGranted = !myOrgData || featureMap.communications;
    var allComms = (_c = (_b = commData) === null || _b === void 0 ? void 0 : _b.communications) !== null && _c !== void 0 ? _c : [];
    var filtered = allComms.filter(function (c) {
        var _a, _b, _c, _d;
        return !search || ((_a = c.subject) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(search.toLowerCase())) || ((_b = c.recipient) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(search.toLowerCase())) || ((_c = c.recipientEmail) === null || _c === void 0 ? void 0 : _c.toLowerCase().includes(search.toLowerCase())) || ((_d = c.referenceType) === null || _d === void 0 ? void 0 : _d.toLowerCase().includes(search.toLowerCase()));
    });
    var total = (_e = (_d = commData) === null || _d === void 0 ? void 0 : _d.total) !== null && _e !== void 0 ? _e : allComms.length;
    var sent = allComms.filter(function (c) { return c.status === "sent"; }).length;
    var failed = allComms.filter(function (c) { return c.status === "failed"; }).length;
    var emails = allComms.filter(function (c) { return c.type === "email"; }).length;
    return (react_1["default"].createElement(OrgLayout_1["default"], { title: "Communications" },
        react_1["default"].createElement("div", { className: "space-y-6" },
            react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                react_1["default"].createElement(OrgBreadcrumb_1["default"], { slug: slug, items: [{ label: "Communications" }] }),
                react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", className: "text-white/50 hover:text-white", onClick: function () { return setLocation("/org/" + slug + "/dashboard"); } },
                    react_1["default"].createElement(lucide_react_1.ArrowLeft, { className: "h-4 w-4 mr-1" }),
                    " Back")),
            !accessGranted ? react_1["default"].createElement(AccessDenied, { slug: slug }) : (react_1["default"].createElement(react_1["default"].Fragment, null,
                react_1["default"].createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4" }, [
                    { label: "Total Messages", value: String(total), color: "from-blue-600/20 to-blue-600/5" },
                    { label: "Sent", value: String(sent), color: "from-green-600/20 to-green-600/5" },
                    { label: "Failed", value: String(failed), color: "from-red-600/20 to-red-600/5" },
                    { label: "Emails", value: String(emails), color: "from-indigo-600/20 to-indigo-600/5" },
                ].map(function (k) { return (react_1["default"].createElement(card_1.Card, { key: k.label, className: "bg-gradient-to-br " + k.color + " border-white/10" },
                    react_1["default"].createElement(card_1.CardHeader, { className: "pb-1 pt-4" },
                        react_1["default"].createElement(card_1.CardTitle, { className: "text-xs font-medium text-white/60" }, k.label)),
                    react_1["default"].createElement(card_1.CardContent, { className: "pb-4" },
                        react_1["default"].createElement("p", { className: "text-xl font-bold text-white" }, k.value)))); })),
                react_1["default"].createElement("div", { className: "space-y-3" },
                    react_1["default"].createElement("div", { className: "flex items-center gap-6" },
                        react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                            react_1["default"].createElement("span", { className: "text-xs text-white/40 uppercase tracking-wider" }, "Type:"),
                            TYPES.map(function (t) { return (react_1["default"].createElement(button_1.Button, { key: t, variant: "ghost", size: "sm", className: "capitalize text-xs " + (activeType === t ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70"), onClick: function () { return setActiveType(t); } }, t)); })),
                        react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                            react_1["default"].createElement("span", { className: "text-xs text-white/40 uppercase tracking-wider" }, "Status:"),
                            STATUSES.map(function (s) { return (react_1["default"].createElement(button_1.Button, { key: s, variant: "ghost", size: "sm", className: "capitalize text-xs " + (activeStatus === s ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70"), onClick: function () { return setActiveStatus(s); } }, s)); }))),
                    react_1["default"].createElement("div", { className: "relative max-w-sm" },
                        react_1["default"].createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" }),
                        react_1["default"].createElement(input_1.Input, { value: search, onChange: function (e) { return setSearch(e.target.value); }, placeholder: "Search by subject or recipient...", className: "pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30" }))),
                react_1["default"].createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
                    react_1["default"].createElement(card_1.CardContent, { className: "p-0" }, isLoading ? (react_1["default"].createElement("div", { className: "p-6 space-y-3" }, Array.from({ length: 8 }).map(function (_, i) { return react_1["default"].createElement(skeleton_1.Skeleton, { key: i, className: "h-12 bg-white/5 rounded" }); }))) : filtered.length === 0 ? (react_1["default"].createElement("div", { className: "py-16 text-center" },
                        react_1["default"].createElement(lucide_react_1.MessageSquare, { className: "h-10 w-10 text-white/20 mx-auto mb-3" }),
                        react_1["default"].createElement("p", { className: "text-white/40 text-sm" }, search || activeStatus !== "all" || activeType !== "all" ? "No communications match your filters" : "No communications yet"))) : (react_1["default"].createElement("div", { className: "divide-y divide-white/5" },
                        react_1["default"].createElement("div", { className: "grid grid-cols-12 px-6 py-3 text-xs font-medium text-white/40 uppercase tracking-wider" },
                            react_1["default"].createElement("div", { className: "col-span-1" }, "Type"),
                            react_1["default"].createElement("div", { className: "col-span-4" }, "Subject"),
                            react_1["default"].createElement("div", { className: "col-span-3" }, "Recipient"),
                            react_1["default"].createElement("div", { className: "col-span-2" }, "Sent At"),
                            react_1["default"].createElement("div", { className: "col-span-2" }, "Status")),
                        filtered.map(function (c) {
                            var _a;
                            return (react_1["default"].createElement("div", { key: c.id, className: "grid grid-cols-12 px-6 py-3 items-center hover:bg-white/5 transition-colors" },
                                react_1["default"].createElement("div", { className: "col-span-1" },
                                    react_1["default"].createElement(TypeBadge, { type: c.type })),
                                react_1["default"].createElement("div", { className: "col-span-4" },
                                    react_1["default"].createElement("p", { className: "text-sm font-medium text-white truncate" }, c.subject || ((_a = c.message) === null || _a === void 0 ? void 0 : _a.slice(0, 60)) || "—"),
                                    c.referenceType && react_1["default"].createElement("p", { className: "text-xs text-white/40 capitalize" }, c.referenceType)),
                                react_1["default"].createElement("div", { className: "col-span-3" },
                                    react_1["default"].createElement("p", { className: "text-sm text-white/70 truncate" }, c.recipient || c.recipientEmail || c.recipientPhone || "—")),
                                react_1["default"].createElement("div", { className: "col-span-2" },
                                    react_1["default"].createElement("p", { className: "text-xs text-white/60" }, c.sentAt || c.createdAt ? new Date(c.sentAt || c.createdAt).toLocaleString() : "—")),
                                react_1["default"].createElement("div", { className: "col-span-2" },
                                    react_1["default"].createElement(StatusBadge, { status: c.status }))));
                        }))))))))));
}
exports["default"] = OrgCommunications;
