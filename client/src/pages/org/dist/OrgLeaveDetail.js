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
        pending: "bg-amber-500/20 text-amber-300 border-amber-500/30",
        approved: "bg-green-500/20 text-green-300 border-green-500/30",
        rejected: "bg-red-500/20 text-red-300 border-red-500/30",
        cancelled: "bg-gray-500/20 text-gray-300 border-gray-500/30"
    };
    return (react_1["default"].createElement("span", { className: "inline-flex px-2 py-0.5 rounded text-xs font-medium border capitalize " + ((_b = map[status]) !== null && _b !== void 0 ? _b : "bg-white/10 text-white/60 border-white/20") }, status));
}
function OrgLeaveDetail() {
    var params = wouter_1.useParams();
    var slug = params.slug;
    var leaveId = params.id;
    var _a = wouter_1.useLocation(), setLocation = _a[1];
    var checkPermission = useOrgPermission_1.useOrgPermission().checkPermission;
    var _b = trpc_1.trpc.leaves.get.useQuery(leaveId, {
        enabled: !!leaveId && checkPermission("hr:leave:view")
    }), leave = _b.data, isLoading = _b.isLoading;
    if (isLoading) {
        return (react_1["default"].createElement(OrgLayout_1["default"], { title: "Leave Details", showOrgInfo: false },
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
    if (!leave) {
        return (react_1["default"].createElement(OrgLayout_1["default"], { title: "Leave Not Found", showOrgInfo: false },
            react_1["default"].createElement("div", { className: "text-center py-16" },
                react_1["default"].createElement(lucide_react_1.AlertCircle, { className: "h-12 w-12 text-white/20 mx-auto mb-4" }),
                react_1["default"].createElement("p", { className: "text-white/40" }, "Leave request not found or access denied."),
                react_1["default"].createElement(button_1.Button, { variant: "ghost", className: "mt-4 text-white/50 hover:text-white", onClick: function () { return setLocation("/org/" + slug + "/leave"); } }, "Back to Leave"))));
    }
    var startDate = leave.startDate ? new Date(leave.startDate) : null;
    var endDate = leave.endDate ? new Date(leave.endDate) : null;
    var daysCount = startDate && endDate ? Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1 : 0;
    return (react_1["default"].createElement(OrgLayout_1["default"], { title: "Leave: " + (leave.leaveType || "Request"), showOrgInfo: false },
        react_1["default"].createElement("div", { className: "space-y-6" },
            react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement(OrgBreadcrumb_1["default"], { slug: slug, items: [
                            { label: "Leave", href: "/org/" + slug + "/leave" },
                            { label: leave.leaveType || "Leave " + leave.id.slice(-8) },
                        ] })),
                react_1["default"].createElement("div", { className: "flex gap-2" },
                    checkPermission("hr:leave:edit") && leave.status === "pending" && (react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", className: "text-white border-white/20 hover:bg-white/5", onClick: function () { return setLocation("/org/" + slug + "/leave/" + leave.id + "/edit"); } },
                        react_1["default"].createElement(lucide_react_1.Edit2, { className: "h-4 w-4 mr-1" }),
                        " Edit")),
                    react_1["default"].createElement(button_1.Button, { size: "sm", variant: "outline", className: "text-white border-white/20 hover:bg-white/5", onClick: function () { return setLocation("/org/" + slug + "/leave"); } },
                        react_1["default"].createElement(lucide_react_1.ArrowLeft, { className: "h-4 w-4 mr-1" }),
                        " Back"))),
            react_1["default"].createElement("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6" },
                react_1["default"].createElement("div", { className: "lg:col-span-2 space-y-6" },
                    react_1["default"].createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
                        react_1["default"].createElement(card_1.CardHeader, null,
                            react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                                react_1["default"].createElement(card_1.CardTitle, { className: "text-white flex items-center gap-2" },
                                    react_1["default"].createElement(lucide_react_1.Calendar, { className: "h-5 w-5" }),
                                    "Leave Information"),
                                react_1["default"].createElement(StatusBadge, { status: leave.status }))),
                        react_1["default"].createElement(card_1.CardContent, null,
                            react_1["default"].createElement("div", { className: "grid grid-cols-2 gap-4" },
                                react_1["default"].createElement("div", null,
                                    react_1["default"].createElement("p", { className: "text-sm text-white/60" }, "Leave Type"),
                                    react_1["default"].createElement("p", { className: "text-white font-medium" }, leave.leaveType || "—")),
                                react_1["default"].createElement("div", null,
                                    react_1["default"].createElement("p", { className: "text-sm text-white/60" }, "Status"),
                                    react_1["default"].createElement("div", { className: "mt-1" },
                                        react_1["default"].createElement(StatusBadge, { status: leave.status }))),
                                react_1["default"].createElement("div", null,
                                    react_1["default"].createElement("p", { className: "text-sm text-white/60" }, "Start Date"),
                                    react_1["default"].createElement("p", { className: "text-white" }, (startDate === null || startDate === void 0 ? void 0 : startDate.toLocaleDateString()) || "—")),
                                react_1["default"].createElement("div", null,
                                    react_1["default"].createElement("p", { className: "text-sm text-white/60" }, "End Date"),
                                    react_1["default"].createElement("p", { className: "text-white" }, (endDate === null || endDate === void 0 ? void 0 : endDate.toLocaleDateString()) || "—")),
                                react_1["default"].createElement("div", { className: "col-span-2" },
                                    react_1["default"].createElement("p", { className: "text-sm text-white/60" }, "Duration"),
                                    react_1["default"].createElement("p", { className: "text-white font-medium" },
                                        daysCount,
                                        " day",
                                        daysCount !== 1 ? "s" : ""))))),
                    leave.reason && (react_1["default"].createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
                        react_1["default"].createElement(card_1.CardHeader, null,
                            react_1["default"].createElement(card_1.CardTitle, { className: "text-white flex items-center gap-2" },
                                react_1["default"].createElement(lucide_react_1.FileText, { className: "h-5 w-5" }),
                                "Reason for Leave")),
                        react_1["default"].createElement(card_1.CardContent, null,
                            react_1["default"].createElement("p", { className: "text-white text-sm" }, leave.reason)))),
                    leave.approverComments && (react_1["default"].createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
                        react_1["default"].createElement(card_1.CardHeader, null,
                            react_1["default"].createElement(card_1.CardTitle, { className: "text-white" }, "Approval Comments")),
                        react_1["default"].createElement(card_1.CardContent, null,
                            react_1["default"].createElement("p", { className: "text-white text-sm" }, leave.approverComments))))),
                react_1["default"].createElement("div", { className: "space-y-6" },
                    react_1["default"].createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
                        react_1["default"].createElement(card_1.CardHeader, null,
                            react_1["default"].createElement(card_1.CardTitle, { className: "text-white text-sm" }, "Leave Status")),
                        react_1["default"].createElement(card_1.CardContent, null,
                            react_1["default"].createElement("div", { className: "space-y-3" },
                                react_1["default"].createElement("div", null,
                                    react_1["default"].createElement("p", { className: "text-xs text-white/60 uppercase tracking-wide mb-2" }, "Approval Status"),
                                    react_1["default"].createElement(StatusBadge, { status: leave.status })),
                                react_1["default"].createElement("div", { className: "pt-3 border-t border-white/10" },
                                    react_1["default"].createElement("p", { className: "text-xs text-white/60 uppercase tracking-wide mb-2" }, "Total Days"),
                                    react_1["default"].createElement("p", { className: "text-sm font-semibold text-white" },
                                        daysCount,
                                        " days"))))),
                    leave.employeeId && (react_1["default"].createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
                        react_1["default"].createElement(card_1.CardHeader, null,
                            react_1["default"].createElement(card_1.CardTitle, { className: "text-white text-sm flex items-center gap-2" },
                                react_1["default"].createElement(lucide_react_1.User, { className: "h-4 w-4" }),
                                "Employee")),
                        react_1["default"].createElement(card_1.CardContent, null,
                            react_1["default"].createElement("p", { className: "text-sm text-white" }, leave.employeeId)))))))));
}
exports["default"] = OrgLeaveDetail;
