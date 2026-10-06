"use strict";
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
var trpc_1 = require("@/lib/trpc");
var useOrgPermission_1 = require("@/hooks/useOrgPermission");
var lucide_react_1 = require("lucide-react");
function StatusBadge(_a) {
    var _b;
    var status = _a.status;
    if (!status)
        return null;
    var map = {
        pending: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
        approved: "bg-green-500/20 text-green-300 border-green-500/30",
        rejected: "bg-red-500/20 text-red-300 border-red-500/30"
    };
    return (react_1["default"].createElement("span", { className: "inline-flex px-2 py-0.5 rounded text-xs font-medium border capitalize " + ((_b = map[status]) !== null && _b !== void 0 ? _b : "bg-white/10 text-white/60 border-white/20") }, status));
}
function OrgApprovalDetail() {
    var params = wouter_1.useParams();
    var slug = params.slug;
    var approvalId = params.id;
    var _a = wouter_1.useLocation(), setLocation = _a[1];
    var checkPermission = useOrgPermission_1.useOrgPermission().checkPermission;
    var _b = trpc_1.trpc.approvals.getById.useQuery(approvalId, {
        enabled: !!approvalId && checkPermission("workflow:approvals:view")
    }), approval = _b.data, isLoading = _b.isLoading;
    var handleEdit = function () {
        setLocation("/org/" + slug + "/approvals/" + approvalId + "/edit");
    };
    var handleBack = function () {
        setLocation("/org/" + slug + "/approvals");
    };
    if (isLoading) {
        return (react_1["default"].createElement(OrgLayout_1["default"], { slug: slug },
            react_1["default"].createElement("div", { className: "space-y-4 p-6" },
                react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-10 w-1/4" }),
                react_1["default"].createElement("div", { className: "space-y-2" }, __spreadArrays(Array(5)).map(function (_, i) { return (react_1["default"].createElement(skeleton_1.Skeleton, { key: i, className: "h-12 w-full" })); })))));
    }
    if (!approval) {
        return (react_1["default"].createElement(OrgLayout_1["default"], { slug: slug },
            react_1["default"].createElement("div", { className: "p-6" },
                react_1["default"].createElement("div", { className: "text-center text-red-400" }, "Approval request not found"))));
    }
    return (react_1["default"].createElement(OrgLayout_1["default"], { slug: slug },
        react_1["default"].createElement("div", { className: "p-6 space-y-6" },
            react_1["default"].createElement(OrgBreadcrumb_1["default"], { slug: slug, items: [
                    { label: "Approvals", href: "/org/" + slug + "/approvals" },
                    { label: "Approval #" + approvalId },
                ] }),
            react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                react_1["default"].createElement("div", { className: "flex items-center gap-3" },
                    react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "icon", onClick: handleBack },
                        react_1["default"].createElement(lucide_react_1.ArrowLeft, { className: "h-4 w-4" })),
                    react_1["default"].createElement("h1", { className: "text-3xl font-bold" }, "Approval Details")),
                checkPermission("workflow:approvals:edit") && (react_1["default"].createElement(button_1.Button, { onClick: handleEdit, className: "gap-2" },
                    react_1["default"].createElement(lucide_react_1.Edit2, { className: "h-4 w-4" }),
                    "Edit Approval"))),
            react_1["default"].createElement("div", { className: "grid gap-6 md:grid-cols-3" },
                react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, { className: "pb-2" },
                        react_1["default"].createElement(card_1.CardTitle, { className: "text-sm font-medium text-gray-400" }, "Title")),
                    react_1["default"].createElement(card_1.CardContent, null,
                        react_1["default"].createElement("p", { className: "text-sm font-medium" }, approval.title || "N/A"))),
                react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, { className: "pb-2" },
                        react_1["default"].createElement(card_1.CardTitle, { className: "text-sm font-medium text-gray-400" }, "Status")),
                    react_1["default"].createElement(card_1.CardContent, null,
                        react_1["default"].createElement(StatusBadge, { status: approval.status }))),
                react_1["default"].createElement(card_1.Card, null,
                    react_1["default"].createElement(card_1.CardHeader, { className: "pb-2" },
                        react_1["default"].createElement(card_1.CardTitle, { className: "text-sm font-medium text-gray-400" }, "Submitted Date")),
                    react_1["default"].createElement(card_1.CardContent, null,
                        react_1["default"].createElement("div", { className: "flex items-center gap-2" },
                            react_1["default"].createElement(lucide_react_1.Calendar, { className: "h-4 w-4 text-blue-500" }),
                            react_1["default"].createElement("span", { className: "text-sm" }, approval.submittedDate
                                ? new Date(approval.submittedDate).toLocaleDateString()
                                : "N/A"))))),
            react_1["default"].createElement(card_1.Card, null,
                react_1["default"].createElement(card_1.CardHeader, null,
                    react_1["default"].createElement(card_1.CardTitle, null, "Approval Information")),
                react_1["default"].createElement(card_1.CardContent, { className: "space-y-4" },
                    react_1["default"].createElement("div", { className: "grid gap-4" },
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("label", { className: "text-xs font-medium text-gray-400" }, "Description"),
                            react_1["default"].createElement("p", { className: "text-sm" }, approval.description || "N/A")),
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("label", { className: "text-xs font-medium text-gray-400" }, "Requested By"),
                            react_1["default"].createElement("p", { className: "text-sm" }, approval.requestedBy || "N/A")),
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("label", { className: "text-xs font-medium text-gray-400" }, "Approver"),
                            react_1["default"].createElement("p", { className: "text-sm" }, approval.approver || "N/A")),
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement("label", { className: "text-xs font-medium text-gray-400" }, "Comments"),
                            react_1["default"].createElement("p", { className: "text-sm" }, approval.comments || "No comments"))))))));
}
exports["default"] = OrgApprovalDetail;
