"use strict";
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
function StatusBadge(_a) {
    var _b;
    var status = _a.status;
    if (!status)
        return null;
    var map = {
        active: "bg-green-500/20 text-green-300 border-green-500/30",
        inactive: "bg-gray-500/20 text-gray-300 border-gray-500/30",
        lead: "bg-blue-500/20 text-blue-300 border-blue-500/30",
        prospect: "bg-purple-500/20 text-purple-300 border-purple-500/30"
    };
    return (react_1["default"].createElement("span", { className: "inline-flex px-2 py-0.5 rounded text-xs font-medium border " + ((_b = map[status]) !== null && _b !== void 0 ? _b : "bg-white/10 text-white/60 border-white/20") }, status));
}
function OrgCRM() {
    var _a, _b, _c, _d;
    var params = wouter_1.useParams();
    var slug = params.slug;
    var _e = wouter_1.useLocation(), setLocation = _e[1];
    var myOrgData = trpc_1.trpc.multiTenancy.getMyOrg.useQuery(undefined, { staleTime: 300000 }).data;
    var featureMap = (_a = myOrgData === null || myOrgData === void 0 ? void 0 : myOrgData.featureMap) !== null && _a !== void 0 ? _a : {};
    var hasAccess = !myOrgData || featureMap.crm;
    var _f = react_1.useState(""), search = _f[0], setSearch = _f[1];
    var _g = trpc_1.trpc.clients.list.useQuery(undefined, {
        staleTime: 60000,
        enabled: !!hasAccess
    }), _h = _g.data, clients = _h === void 0 ? [] : _h, isLoading = _g.isLoading;
    var analytics = trpc_1.trpc.multiTenancy.getOrgAnalytics.useQuery(undefined, {
        staleTime: 60000
    }).data;
    var healthData = trpc_1.trpc.multiTenancy.getClientsHealthScores.useQuery(undefined, {
        staleTime: 120000,
        enabled: !!hasAccess
    }).data;
    var healthScores = (_b = healthData === null || healthData === void 0 ? void 0 : healthData.scores) !== null && _b !== void 0 ? _b : {};
    var filtered = clients.filter(function (c) {
        var _a, _b, _c;
        return !search || ((_a = c.name) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(search.toLowerCase())) || ((_b = c.email) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(search.toLowerCase())) || ((_c = c.company) === null || _c === void 0 ? void 0 : _c.toLowerCase().includes(search.toLowerCase()));
    });
    var kpis = analytics === null || analytics === void 0 ? void 0 : analytics.kpis;
    return (react_1["default"].createElement(OrgLayout_1["default"], { title: "CRM / Clients", showOrgInfo: false },
        react_1["default"].createElement("div", { className: "space-y-6" },
            react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                react_1["default"].createElement(OrgBreadcrumb_1["default"], { slug: slug, items: [{ label: "CRM / Clients" }] }),
                react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", className: "text-white/50 hover:text-white", onClick: function () { return setLocation("/org/" + slug + "/dashboard"); } },
                    react_1["default"].createElement(lucide_react_1.ArrowLeft, { className: "h-4 w-4 mr-1" }),
                    " Back")),
            !hasAccess && (react_1["default"].createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
                react_1["default"].createElement(card_1.CardContent, { className: "py-20 text-center" },
                    react_1["default"].createElement(lucide_react_1.Lock, { className: "h-12 w-12 text-white/20 mx-auto mb-4" }),
                    react_1["default"].createElement("p", { className: "text-white font-semibold text-lg mb-2" }, "Access Restricted"),
                    react_1["default"].createElement("p", { className: "text-white/50 text-sm mb-6" }, "CRM is not enabled for your organization plan."),
                    react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", className: "border-white/20 text-white/70 hover:text-white hover:bg-white/10", onClick: function () { return setLocation("/org/" + slug + "/dashboard"); } }, "Back to Dashboard")))),
            hasAccess && (react_1["default"].createElement(react_1["default"].Fragment, null,
                react_1["default"].createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4" }, [
                    { label: "Total Clients", value: String((_c = kpis === null || kpis === void 0 ? void 0 : kpis.totalClients) !== null && _c !== void 0 ? _c : clients.length), color: "from-blue-600/20 to-blue-600/5" },
                    { label: "Active Clients", value: String((_d = kpis === null || kpis === void 0 ? void 0 : kpis.activeClients) !== null && _d !== void 0 ? _d : 0), color: "from-green-600/20 to-green-600/5" },
                    { label: "Showing", value: String(filtered.length), color: "from-white/10 to-white/5" },
                    { label: "Leads", value: String(clients.filter(function (c) { return c.status === "lead" || c.type === "lead"; }).length), color: "from-purple-600/20 to-purple-600/5" },
                ].map(function (k) { return (react_1["default"].createElement(card_1.Card, { key: k.label, className: "bg-gradient-to-br " + k.color + " border-white/10" },
                    react_1["default"].createElement(card_1.CardHeader, { className: "pb-1 pt-4" },
                        react_1["default"].createElement(card_1.CardTitle, { className: "text-xs font-medium text-white/60" }, k.label)),
                    react_1["default"].createElement(card_1.CardContent, { className: "pb-4" },
                        react_1["default"].createElement("p", { className: "text-2xl font-bold text-white" }, k.value)))); })),
                react_1["default"].createElement("div", { className: "flex items-center gap-3" },
                    react_1["default"].createElement("div", { className: "relative flex-1 max-w-sm" },
                        react_1["default"].createElement(lucide_react_1.Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" }),
                        react_1["default"].createElement(input_1.Input, { value: search, onChange: function (e) { return setSearch(e.target.value); }, placeholder: "Search clients...", className: "pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/30" })),
                    react_1["default"].createElement(button_1.Button, { size: "sm", className: "bg-blue-600 hover:bg-blue-700 text-white", onClick: function () { return setLocation("/org/" + slug + "/crm/create"); } },
                        react_1["default"].createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-1" }),
                        " New Client")),
                react_1["default"].createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
                    react_1["default"].createElement(card_1.CardContent, { className: "p-0" }, isLoading ? (react_1["default"].createElement("div", { className: "p-6 space-y-3" }, Array.from({ length: 5 }).map(function (_, i) { return react_1["default"].createElement(skeleton_1.Skeleton, { key: i, className: "h-12 bg-white/5 rounded" }); }))) : filtered.length === 0 ? (react_1["default"].createElement("div", { className: "py-16 text-center" },
                        react_1["default"].createElement(lucide_react_1.Users, { className: "h-10 w-10 text-white/20 mx-auto mb-3" }),
                        react_1["default"].createElement("p", { className: "text-white/40 text-sm" }, search ? "No clients match your search" : "No clients yet"),
                        !search && (react_1["default"].createElement(button_1.Button, { size: "sm", className: "mt-4 bg-blue-600 hover:bg-blue-700", onClick: function () { return setLocation("/org/" + slug + "/crm/create"); } },
                            react_1["default"].createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-1" }),
                            " Add First Client")))) : (react_1["default"].createElement(react_1["default"].Fragment, null,
                        react_1["default"].createElement("div", { className: "hidden md:block divide-y divide-white/5" },
                            react_1["default"].createElement("div", { className: "grid grid-cols-12 px-6 py-3 text-xs font-medium text-white/40 uppercase tracking-wider" },
                                react_1["default"].createElement("div", { className: "col-span-3" }, "Client"),
                                react_1["default"].createElement("div", { className: "col-span-3" }, "Contact"),
                                react_1["default"].createElement("div", { className: "col-span-2" }, "Status"),
                                react_1["default"].createElement("div", { className: "col-span-2" }, "Health"),
                                react_1["default"].createElement("div", { className: "col-span-2 text-right" }, "Actions")),
                            filtered.map(function (client) {
                                var hs = healthScores[client.id];
                                return (react_1["default"].createElement("div", { key: client.id, className: "grid grid-cols-12 px-6 py-4 items-center hover:bg-white/5 transition-colors" },
                                    react_1["default"].createElement("div", { className: "col-span-3" },
                                        react_1["default"].createElement("div", { className: "flex items-center gap-3" },
                                            react_1["default"].createElement("div", { className: "h-8 w-8 rounded-full bg-blue-600/30 flex items-center justify-center" },
                                                react_1["default"].createElement("span", { className: "text-xs font-bold text-blue-300" }, (client.name || client.company || "?")[0].toUpperCase())),
                                            react_1["default"].createElement("div", null,
                                                react_1["default"].createElement("p", { className: "text-sm font-medium text-white" }, client.name || client.company || "Unknown"),
                                                client.company && client.name && (react_1["default"].createElement("p", { className: "text-xs text-white/40 flex items-center gap-1" },
                                                    react_1["default"].createElement(lucide_react_1.Building2, { className: "h-3 w-3" }),
                                                    " ",
                                                    client.company))))),
                                    react_1["default"].createElement("div", { className: "col-span-3" },
                                        client.email && (react_1["default"].createElement("p", { className: "text-xs text-white/60 flex items-center gap-1" },
                                            react_1["default"].createElement(lucide_react_1.Mail, { className: "h-3 w-3" }),
                                            " ",
                                            client.email)),
                                        client.phone && (react_1["default"].createElement("p", { className: "text-xs text-white/60 flex items-center gap-1 mt-0.5" },
                                            react_1["default"].createElement(lucide_react_1.Phone, { className: "h-3 w-3" }),
                                            " ",
                                            client.phone))),
                                    react_1["default"].createElement("div", { className: "col-span-2" },
                                        react_1["default"].createElement(StatusBadge, { status: client.status || "active" })),
                                    react_1["default"].createElement("div", { className: "col-span-2" }, hs ? (react_1["default"].createElement("div", { className: "flex items-center gap-1.5" },
                                        react_1["default"].createElement("div", { className: "h-1.5 w-12 rounded-full bg-white/10 overflow-hidden" },
                                            react_1["default"].createElement("div", { className: "h-full rounded-full transition-all", style: { width: hs.score + "%", background: hs.color } })),
                                        react_1["default"].createElement("span", { className: "text-[11px] font-medium", style: { color: hs.color } }, hs.label))) : (react_1["default"].createElement("span", { className: "text-white/20 text-xs" }, "\u2014"))),
                                    react_1["default"].createElement("div", { className: "col-span-2 flex justify-end gap-2" },
                                        react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", className: "text-white/50 hover:text-white h-7 px-2", onClick: function () { return setLocation("/org/" + slug + "/clients/" + client.id); } },
                                            react_1["default"].createElement(lucide_react_1.ExternalLink, { className: "h-3.5 w-3.5" })))));
                            })),
                        react_1["default"].createElement("div", { className: "md:hidden divide-y divide-white/5" }, filtered.map(function (client) { return (react_1["default"].createElement("div", { key: client.id, className: "flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors", onClick: function () { return setLocation("/org/" + slug + "/clients/" + client.id); } },
                            react_1["default"].createElement("div", { className: "h-10 w-10 rounded-full bg-blue-600/30 flex items-center justify-center shrink-0" },
                                react_1["default"].createElement("span", { className: "text-sm font-bold text-blue-300" }, (client.name || client.company || "?")[0].toUpperCase())),
                            react_1["default"].createElement("div", { className: "min-w-0 flex-1" },
                                react_1["default"].createElement("p", { className: "text-sm font-medium text-white truncate" }, client.name || client.company || "Unknown"),
                                react_1["default"].createElement("p", { className: "text-xs text-white/40 truncate" }, client.email || client.phone || client.company || "—")),
                            react_1["default"].createElement(StatusBadge, { status: client.status || "active" }))); })))))))))));
}
exports["default"] = OrgCRM;
