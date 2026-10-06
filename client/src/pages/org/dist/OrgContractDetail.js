"use strict";
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var OrgLayout_1 = require("@/components/OrgLayout");
var OrgBreadcrumb_1 = require("@/components/OrgBreadcrumb");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var skeleton_1 = require("@/components/ui/skeleton");
var trpc_1 = require("@/lib/trpc");
var useOrgPermission_1 = require("@/hooks/useOrgPermission");
var lucide_react_1 = require("lucide-react");
function StatusBadge(_a) {
    var _b;
    var status = _a.status;
    if (!status)
        return null;
    var map = {
        draft: "bg-slate-500/20 text-slate-300 border-slate-500/30",
        active: "bg-green-500/20 text-green-300 border-green-500/30",
        inactive: "bg-gray-500/20 text-gray-300 border-gray-500/30",
        completed: "bg-blue-500/20 text-blue-300 border-blue-500/30",
        terminated: "bg-red-500/20 text-red-300 border-red-500/30"
    };
    return (react_1["default"].createElement("span", { className: "inline-flex px-2 py-0.5 rounded text-xs font-medium border capitalize " + ((_b = map[status]) !== null && _b !== void 0 ? _b : "bg-white/10 text-white/60 border-white/20") }, status));
}
function OrgContractDetail() {
    var params = wouter_1.useParams();
    var slug = params.slug;
    var contractId = params.id;
    var _a = wouter_1.useLocation(), setLocation = _a[1];
    var checkPermission = useOrgPermission_1.useOrgPermission().checkPermission;
    var _b = trpc_1.trpc.contracts.get.useQuery(contractId, {
        enabled: !!contractId && checkPermission("contracts:view")
    }), contract = _b.data, isLoading = _b.isLoading;
    if (isLoading) {
        return (react_1["default"].createElement(OrgLayout_1["default"], { title: "Contract Details", showOrgInfo: false },
            react_1["default"].createElement("div", { className: "space-y-6" },
                react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                    react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-6 w-48 bg-white/5" }),
                    react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-8 w-24 bg-white/5" })),
                react_1["default"].createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
                    react_1["default"].createElement(card_1.CardHeader, null,
                        react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-6 w-32 bg-white/5" })),
                    react_1["default"].createElement(card_1.CardContent, null,
                        react_1["default"].createElement("div", { className: "space-y-4" },
                            react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-4 w-full bg-white/5" }),
                            react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-4 w-3/4 bg-white/5" }),
                            react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-4 w-1/2 bg-white/5" })))))));
    }
    if (!contract) {
        return (react_1["default"].createElement(OrgLayout_1["default"], { title: "Contract Not Found", showOrgInfo: false },
            react_1["default"].createElement("div", { className: "text-center py-16" },
                react_1["default"].createElement(lucide_react_1.AlertCircle, { className: "h-12 w-12 text-white/20 mx-auto mb-4" }),
                react_1["default"].createElement("p", { className: "text-white/40" }, "Contract not found or access denied."),
                react_1["default"].createElement(button_1.Button, { variant: "ghost", className: "mt-4 text-white/50 hover:text-white", onClick: function () { return setLocation("/org/" + slug + "/contracts"); } }, "Back to Contracts"))));
    }
    return (react_1["default"].createElement(OrgLayout_1["default"], { title: "Contract: " + contract.contractName, showOrgInfo: false },
        react_1["default"].createElement("div", { className: "space-y-6" },
            react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement(OrgBreadcrumb_1["default"], { slug: slug, items: [
                            { label: "Contracts", href: "/org/" + slug + "/contracts" },
                            { label: contract.contractName || "Contract " + contract.id.slice(-8) },
                        ] })),
                react_1["default"].createElement("div", { className: "flex gap-2" },
                    checkPermission("contracts:edit") && (react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", className: "text-white border-white/20 hover:bg-white/5", onClick: function () { return setLocation("/org/" + slug + "/contracts/" + contract.id + "/edit"); } },
                        react_1["default"].createElement(lucide_react_1.Edit2, { className: "h-4 w-4 mr-1" }),
                        " Edit")),
                    react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", className: "text-white border-white/20 hover:bg-white/5", onClick: function () { return setLocation("/org/" + slug + "/contracts"); } },
                        react_1["default"].createElement(lucide_react_1.ArrowLeft, { className: "h-4 w-4 mr-1" }),
                        " Back"))),
            react_1["default"].createElement("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6" },
                react_1["default"].createElement("div", { className: "lg:col-span-2 space-y-6" },
                    react_1["default"].createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
                        react_1["default"].createElement(card_1.CardHeader, null,
                            react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                                react_1["default"].createElement(card_1.CardTitle, { className: "text-white flex items-center gap-2" },
                                    react_1["default"].createElement(lucide_react_1.FileText, { className: "h-5 w-5" }),
                                    "Contract Information"),
                                react_1["default"].createElement(StatusBadge, { status: contract.status }))),
                        react_1["default"].createElement(card_1.CardContent, null,
                            react_1["default"].createElement("div", { className: "grid grid-cols-2 gap-4" },
                                react_1["default"].createElement("div", null,
                                    react_1["default"].createElement("p", { className: "text-sm text-white/60" }, "Contract Name"),
                                    react_1["default"].createElement("p", { className: "text-white font-medium" }, contract.contractName || "—")),
                                react_1["default"].createElement("div", null,
                                    react_1["default"].createElement("p", { className: "text-sm text-white/60" }, "Contract Type"),
                                    react_1["default"].createElement("p", { className: "text-white" }, contract.contractType || "—")),
                                react_1["default"].createElement("div", null,
                                    react_1["default"].createElement("p", { className: "text-sm text-white/60" }, "Party Name"),
                                    react_1["default"].createElement("p", { className: "text-white" }, contract.partyName || "—")),
                                react_1["default"].createElement("div", null,
                                    react_1["default"].createElement("p", { className: "text-sm text-white/60" }, "Status"),
                                    react_1["default"].createElement("div", { className: "mt-1" },
                                        react_1["default"].createElement(StatusBadge, { status: contract.status }))),
                                react_1["default"].createElement("div", null,
                                    react_1["default"].createElement("p", { className: "text-sm text-white/60" }, "Start Date"),
                                    react_1["default"].createElement("p", { className: "text-white" }, contract.startDate ? new Date(contract.startDate).toLocaleDateString() : "—")),
                                react_1["default"].createElement("div", null,
                                    react_1["default"].createElement("p", { className: "text-sm text-white/60" }, "End Date"),
                                    react_1["default"].createElement("p", { className: "text-white" }, contract.endDate ? new Date(contract.endDate).toLocaleDateString() : "—"))))),
                    react_1["default"].createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
                        react_1["default"].createElement(card_1.CardHeader, null,
                            react_1["default"].createElement(card_1.CardTitle, { className: "text-white flex items-center gap-2" },
                                react_1["default"].createElement(lucide_react_1.DollarSign, { className: "h-5 w-5" }),
                                "Contract Value")),
                        react_1["default"].createElement(card_1.CardContent, null,
                            react_1["default"].createElement("p", { className: "text-2xl font-bold text-white" },
                                "KES ",
                                Number(contract.value || 0).toLocaleString()))),
                    contract.terms && (react_1["default"].createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
                        react_1["default"].createElement(card_1.CardHeader, null,
                            react_1["default"].createElement(card_1.CardTitle, { className: "text-white" }, "Terms & Conditions")),
                        react_1["default"].createElement(card_1.CardContent, null,
                            react_1["default"].createElement("p", { className: "text-white text-sm whitespace-pre-wrap" }, contract.terms))))),
                react_1["default"].createElement("div", { className: "space-y-6" },
                    react_1["default"].createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
                        react_1["default"].createElement(card_1.CardHeader, null,
                            react_1["default"].createElement(card_1.CardTitle, { className: "text-white text-sm" }, "Contract Status")),
                        react_1["default"].createElement(card_1.CardContent, null,
                            react_1["default"].createElement("div", { className: "space-y-3" },
                                react_1["default"].createElement("div", null,
                                    react_1["default"].createElement("p", { className: "text-xs text-white/60 uppercase tracking-wide mb-2" }, "Status"),
                                    react_1["default"].createElement(StatusBadge, { status: contract.status })),
                                react_1["default"].createElement("div", { className: "pt-3 border-t border-white/10" },
                                    react_1["default"].createElement("p", { className: "text-xs text-white/60 uppercase tracking-wide mb-2" }, "Duration"),
                                    react_1["default"].createElement("p", { className: "text-sm text-white" }, contract.startDate && contract.endDate
                                        ? (new Date(contract.endDate).getTime() - new Date(contract.startDate).getTime()) / (1000 * 60 * 60 * 24) + " days"
                                        : "—"))))),
                    contract.partyName && (react_1["default"].createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
                        react_1["default"].createElement(card_1.CardHeader, null,
                            react_1["default"].createElement(card_1.CardTitle, { className: "text-white text-sm flex items-center gap-2" },
                                react_1["default"].createElement(lucide_react_1.Building2, { className: "h-4 w-4" }),
                                "Party Information")),
                        react_1["default"].createElement(card_1.CardContent, null,
                            react_1["default"].createElement("p", { className: "text-sm text-white" }, contract.partyName)))))))));
}
exports["default"] = OrgContractDetail;
