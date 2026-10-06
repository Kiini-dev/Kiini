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
        open: "bg-blue-500/20 text-blue-300 border-blue-500/30",
        "in-progress": "bg-amber-500/20 text-amber-300 border-amber-500/30",
        completed: "bg-green-500/20 text-green-300 border-green-500/30",
        cancelled: "bg-red-500/20 text-red-300 border-red-500/30"
    };
    return (react_1["default"].createElement("span", { className: "inline-flex px-2 py-0.5 rounded text-xs font-medium border capitalize " + ((_b = map[status]) !== null && _b !== void 0 ? _b : "bg-white/10 text-white/60 border-white/20") }, status));
}
function PriorityBadge(_a) {
    var _b;
    var priority = _a.priority;
    if (!priority)
        return null;
    var map = {
        low: "bg-slate-500/20 text-slate-300 border-slate-500/30",
        medium: "bg-blue-500/20 text-blue-300 border-blue-500/30",
        high: "bg-amber-500/20 text-amber-300 border-amber-500/30",
        critical: "bg-red-500/20 text-red-300 border-red-500/30"
    };
    return (react_1["default"].createElement("span", { className: "inline-flex px-2 py-0.5 rounded text-xs font-medium border capitalize " + ((_b = map[priority]) !== null && _b !== void 0 ? _b : "bg-white/10 text-white/60 border-white/20") }, priority));
}
function OrgWorkOrderDetail() {
    var params = wouter_1.useParams();
    var slug = params.slug;
    var workOrderId = params.id;
    var _a = wouter_1.useLocation(), setLocation = _a[1];
    var checkPermission = useOrgPermission_1.useOrgPermission().checkPermission;
    var _b = trpc_1.trpc.workOrders.get.useQuery(workOrderId, {
        enabled: !!workOrderId && checkPermission("operations:work-orders:view")
    }), workOrder = _b.data, isLoading = _b.isLoading;
    if (isLoading) {
        return (react_1["default"].createElement(OrgLayout_1["default"], { title: "Work Order Details", showOrgInfo: false },
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
    if (!workOrder) {
        return (react_1["default"].createElement(OrgLayout_1["default"], { title: "Work Order Not Found", showOrgInfo: false },
            react_1["default"].createElement("div", { className: "text-center py-16" },
                react_1["default"].createElement(lucide_react_1.AlertCircle, { className: "h-12 w-12 text-white/20 mx-auto mb-4" }),
                react_1["default"].createElement("p", { className: "text-white/40" }, "Work order not found or access denied."),
                react_1["default"].createElement(button_1.Button, { variant: "ghost", className: "mt-4 text-white/50 hover:text-white", onClick: function () { return setLocation("/org/" + slug + "/work-orders"); } }, "Back to Work Orders"))));
    }
    var totalCost = (Number(workOrder.laborCost || 0) + Number(workOrder.serviceCost || 0));
    return (react_1["default"].createElement(OrgLayout_1["default"], { title: "Work Order " + workOrder.workOrderNumber, showOrgInfo: false },
        react_1["default"].createElement("div", { className: "space-y-6" },
            react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement(OrgBreadcrumb_1["default"], { slug: slug, items: [
                            { label: "Work Orders", href: "/org/" + slug + "/work-orders" },
                            { label: workOrder.workOrderNumber || "WO " + workOrder.id.slice(-8) },
                        ] })),
                react_1["default"].createElement("div", { className: "flex gap-2" },
                    checkPermission("operations:work-orders:edit") && (react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", className: "text-white border-white/20 hover:bg-white/5", onClick: function () { return setLocation("/org/" + slug + "/work-orders/" + workOrder.id + "/edit"); } },
                        react_1["default"].createElement(lucide_react_1.Edit2, { className: "h-4 w-4 mr-1" }),
                        " Edit")),
                    react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", className: "text-white border-white/20 hover:bg-white/5", onClick: function () { return setLocation("/org/" + slug + "/work-orders"); } },
                        react_1["default"].createElement(lucide_react_1.ArrowLeft, { className: "h-4 w-4 mr-1" }),
                        " Back"))),
            react_1["default"].createElement("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6" },
                react_1["default"].createElement("div", { className: "lg:col-span-2 space-y-6" },
                    react_1["default"].createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
                        react_1["default"].createElement(card_1.CardHeader, null,
                            react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                                react_1["default"].createElement(card_1.CardTitle, { className: "text-white flex items-center gap-2" },
                                    react_1["default"].createElement(lucide_react_1.Wrench, { className: "h-5 w-5" }),
                                    "Work Order Details"),
                                react_1["default"].createElement(StatusBadge, { status: workOrder.status }))),
                        react_1["default"].createElement(card_1.CardContent, null,
                            react_1["default"].createElement("div", { className: "grid grid-cols-2 gap-4" },
                                react_1["default"].createElement("div", null,
                                    react_1["default"].createElement("p", { className: "text-sm text-white/60" }, "Work Order Number"),
                                    react_1["default"].createElement("p", { className: "text-white font-medium" }, workOrder.workOrderNumber || "WO-" + workOrder.id.slice(-8))),
                                react_1["default"].createElement("div", null,
                                    react_1["default"].createElement("p", { className: "text-sm text-white/60" }, "Issue Date"),
                                    react_1["default"].createElement("p", { className: "text-white" }, workOrder.issueDate ? new Date(workOrder.issueDate).toLocaleDateString() : "—")),
                                react_1["default"].createElement("div", null,
                                    react_1["default"].createElement("p", { className: "text-sm text-white/60" }, "Priority"),
                                    react_1["default"].createElement("div", { className: "mt-1" },
                                        react_1["default"].createElement(PriorityBadge, { priority: workOrder.priority }))),
                                react_1["default"].createElement("div", null,
                                    react_1["default"].createElement("p", { className: "text-sm text-white/60" }, "Assigned To"),
                                    react_1["default"].createElement("p", { className: "text-white" }, workOrder.assignedTo || "—")),
                                react_1["default"].createElement("div", null,
                                    react_1["default"].createElement("p", { className: "text-sm text-white/60" }, "Start Date"),
                                    react_1["default"].createElement("p", { className: "text-white" }, workOrder.startDate ? new Date(workOrder.startDate).toLocaleDateString() : "—")),
                                react_1["default"].createElement("div", null,
                                    react_1["default"].createElement("p", { className: "text-sm text-white/60" }, "Target End Date"),
                                    react_1["default"].createElement("p", { className: "text-white" }, workOrder.targetEndDate ? new Date(workOrder.targetEndDate).toLocaleDateString() : "—"))),
                            workOrder.description && (react_1["default"].createElement("div", { className: "mt-4" },
                                react_1["default"].createElement("p", { className: "text-sm text-white/60 mb-1" }, "Description"),
                                react_1["default"].createElement("p", { className: "text-white text-sm" }, workOrder.description))),
                            workOrder.notes && (react_1["default"].createElement("div", { className: "mt-4" },
                                react_1["default"].createElement("p", { className: "text-sm text-white/60 mb-1" }, "Notes"),
                                react_1["default"].createElement("p", { className: "text-white text-sm" }, workOrder.notes))))),
                    react_1["default"].createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
                        react_1["default"].createElement(card_1.CardHeader, null,
                            react_1["default"].createElement(card_1.CardTitle, { className: "text-white flex items-center gap-2" },
                                react_1["default"].createElement(lucide_react_1.DollarSign, { className: "h-5 w-5" }),
                                "Cost Breakdown")),
                        react_1["default"].createElement(card_1.CardContent, null,
                            react_1["default"].createElement("div", { className: "space-y-3" },
                                react_1["default"].createElement("div", { className: "flex justify-between" },
                                    react_1["default"].createElement("p", { className: "text-white/60" }, "Labor Cost"),
                                    react_1["default"].createElement("p", { className: "text-white font-medium" },
                                        "KES ",
                                        Number(workOrder.laborCost || 0).toLocaleString())),
                                react_1["default"].createElement("div", { className: "flex justify-between" },
                                    react_1["default"].createElement("p", { className: "text-white/60" }, "Service Cost"),
                                    react_1["default"].createElement("p", { className: "text-white font-medium" },
                                        "KES ",
                                        Number(workOrder.serviceCost || 0).toLocaleString())),
                                react_1["default"].createElement("div", { className: "flex justify-between border-t border-white/10 pt-3" },
                                    react_1["default"].createElement("p", { className: "text-white font-semibold" }, "Total"),
                                    react_1["default"].createElement("p", { className: "text-white font-bold" },
                                        "KES ",
                                        totalCost.toLocaleString())))))),
                react_1["default"].createElement("div", { className: "space-y-6" },
                    react_1["default"].createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
                        react_1["default"].createElement(card_1.CardHeader, null,
                            react_1["default"].createElement(card_1.CardTitle, { className: "text-white text-sm" }, "Work Order Status")),
                        react_1["default"].createElement(card_1.CardContent, null,
                            react_1["default"].createElement("div", { className: "space-y-3" },
                                react_1["default"].createElement("div", null,
                                    react_1["default"].createElement("p", { className: "text-xs text-white/60 uppercase tracking-wide mb-2" }, "Current Status"),
                                    react_1["default"].createElement(StatusBadge, { status: workOrder.status })),
                                react_1["default"].createElement("div", { className: "pt-3 border-t border-white/10" },
                                    react_1["default"].createElement("p", { className: "text-xs text-white/60 uppercase tracking-wide mb-2" }, "Priority Level"),
                                    react_1["default"].createElement(PriorityBadge, { priority: workOrder.priority }))))),
                    workOrder.assignedTo && (react_1["default"].createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
                        react_1["default"].createElement(card_1.CardHeader, null,
                            react_1["default"].createElement(card_1.CardTitle, { className: "text-white text-sm" }, "Assignment")),
                        react_1["default"].createElement(card_1.CardContent, null,
                            react_1["default"].createElement("p", { className: "text-sm text-white" }, workOrder.assignedTo)))))))));
}
exports["default"] = OrgWorkOrderDetail;
