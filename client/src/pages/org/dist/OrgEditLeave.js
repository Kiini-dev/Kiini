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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var react_1 = require("react");
var wouter_1 = require("wouter");
var OrgLayout_1 = require("@/components/OrgLayout");
var OrgBreadcrumb_1 = require("@/components/OrgBreadcrumb");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var card_1 = require("@/components/ui/card");
var select_1 = require("@/components/ui/select");
var trpc_1 = require("@/lib/trpc");
var useOrgPermission_1 = require("@/hooks/useOrgPermission");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
function OrgEditLeave() {
    var _this = this;
    var params = wouter_1.useParams();
    var slug = params.slug;
    var leaveId = params.id;
    var _a = wouter_1.useLocation(), setLocation = _a[1];
    var _b = useOrgPermission_1.useOrgPermission(), checkPermission = _b.checkPermission, hasPermission = _b.hasPermission;
    var _c = trpc_1.trpc.leaves.get.useQuery(leaveId, {
        enabled: !!leaveId && checkPermission("hr:leave:view")
    }), leave = _c.data, isLoadingLeave = _c.isLoading;
    var _d = react_1.useState({
        leaveType: "",
        startDate: "",
        endDate: "",
        reason: "",
        status: "pending",
        approverComments: ""
    }), form = _d[0], setForm = _d[1];
    var _e = react_1.useState(false), isSubmitting = _e[0], setIsSubmitting = _e[1];
    react_1.useEffect(function () {
        if (leave) {
            setForm({
                leaveType: leave.leaveType || "",
                startDate: leave.startDate ? leave.startDate.split('T')[0] : "",
                endDate: leave.endDate ? leave.endDate.split('T')[0] : "",
                reason: leave.reason || "",
                status: leave.status || "pending",
                approverComments: leave.approverComments || ""
            });
        }
    }, [leave]);
    var updateMutation = trpc_1.trpc.leaves.update.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Leave request updated", { description: "The leave request has been updated successfully." });
            setLocation("/org/" + slug + "/leave/" + leaveId);
        },
        onError: function (err) {
            sonner_1.toast.error("Failed to update leave request", { description: err.message });
            setIsSubmitting(false);
        }
    });
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            e.preventDefault();
            if (!checkPermission("hr:leave:edit", "edit leave requests")) {
                return [2 /*return*/];
            }
            if (!form.leaveType || !form.startDate || !form.endDate) {
                sonner_1.toast.error("Missing required fields", { description: "Leave type, start date, and end date are required." });
                return [2 /*return*/];
            }
            setIsSubmitting(true);
            updateMutation.mutate({
                id: leaveId,
                leaveType: form.leaveType,
                startDate: form.startDate,
                endDate: form.endDate,
                reason: form.reason || undefined,
                status: form.status,
                approverComments: form.approverComments || undefined
            });
            return [2 /*return*/];
        });
    }); };
    if (isLoadingLeave) {
        return (react_1["default"].createElement(OrgLayout_1["default"], { title: "Edit Leave", showOrgInfo: false },
            react_1["default"].createElement("div", { className: "text-center py-12" }, "Loading...")));
    }
    if (!leave) {
        return (react_1["default"].createElement(OrgLayout_1["default"], { title: "Leave Not Found", showOrgInfo: false },
            react_1["default"].createElement("div", { className: "text-center py-16" },
                react_1["default"].createElement("p", { className: "text-white/40" }, "Leave request not found."),
                react_1["default"].createElement(button_1.Button, { variant: "ghost", className: "mt-4 text-white/50 hover:text-white", onClick: function () { return setLocation("/org/" + slug + "/leave"); } }, "Back to Leave"))));
    }
    if (!hasPermission("hr:leave:edit")) {
        return (react_1["default"].createElement(OrgLayout_1["default"], { title: "Edit Leave", showOrgInfo: false },
            react_1["default"].createElement("div", { className: "space-y-6" },
                react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                    react_1["default"].createElement(OrgBreadcrumb_1["default"], { slug: slug, items: [{ label: "Leave", href: "/org/" + slug + "/leave" }, { label: "Edit Leave" }] }),
                    react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", className: "text-white/50 hover:text-white", onClick: function () { return setLocation("/org/" + slug + "/dashboard"); } },
                        react_1["default"].createElement(lucide_react_1.ArrowLeft, { className: "h-4 w-4 mr-1" }),
                        " Back")),
                react_1["default"].createElement("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-10 text-center" },
                    react_1["default"].createElement(lucide_react_1.Calendar, { className: "mx-auto h-12 w-12 text-white/30" }),
                    react_1["default"].createElement("h2", { className: "mt-5 text-xl font-semibold text-white" }, "Access Denied"),
                    react_1["default"].createElement("p", { className: "mt-2 text-sm text-white/60" }, "You do not have permission to edit leave requests.")))));
    }
    return (react_1["default"].createElement(OrgLayout_1["default"], { title: "Edit Leave Request", showOrgInfo: false },
        react_1["default"].createElement("div", { className: "space-y-6" },
            react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement(OrgBreadcrumb_1["default"], { slug: slug, items: [
                            { label: "Leave", href: "/org/" + slug + "/leave" },
                            { label: form.leaveType || "Edit Leave" },
                        ] })),
                react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", className: "text-white/50 hover:text-white", onClick: function () { return setLocation("/org/" + slug + "/leave/" + leaveId); } },
                    react_1["default"].createElement(lucide_react_1.ArrowLeft, { className: "h-4 w-4 mr-1" }),
                    " Back")),
            react_1["default"].createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
                react_1["default"].createElement(card_1.CardHeader, null,
                    react_1["default"].createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                        react_1["default"].createElement(lucide_react_1.Calendar, { className: "h-5 w-5" }),
                        "Edit Leave Request"),
                    react_1["default"].createElement(card_1.CardDescription, null, "Update your leave request details")),
                react_1["default"].createElement(card_1.CardContent, null,
                    react_1["default"].createElement("form", { onSubmit: handleSubmit, className: "space-y-6" },
                        react_1["default"].createElement("div", { className: "grid gap-4 sm:grid-cols-2" },
                            react_1["default"].createElement("div", { className: "space-y-2" },
                                react_1["default"].createElement(label_1.Label, { htmlFor: "leaveType" }, "Leave Type *"),
                                react_1["default"].createElement(select_1.Select, { value: form.leaveType, onValueChange: function (value) { return setForm(function (f) { return (__assign(__assign({}, f), { leaveType: value })); }); } },
                                    react_1["default"].createElement(select_1.SelectTrigger, null,
                                        react_1["default"].createElement(select_1.SelectValue, { placeholder: "Select leave type" })),
                                    react_1["default"].createElement(select_1.SelectContent, null,
                                        react_1["default"].createElement(select_1.SelectItem, { value: "annual" }, "Annual Leave"),
                                        react_1["default"].createElement(select_1.SelectItem, { value: "sick" }, "Sick Leave"),
                                        react_1["default"].createElement(select_1.SelectItem, { value: "maternity" }, "Maternity Leave"),
                                        react_1["default"].createElement(select_1.SelectItem, { value: "paternity" }, "Paternity Leave"),
                                        react_1["default"].createElement(select_1.SelectItem, { value: "unpaid" }, "Unpaid Leave"),
                                        react_1["default"].createElement(select_1.SelectItem, { value: "study" }, "Study Leave"),
                                        react_1["default"].createElement(select_1.SelectItem, { value: "compassionate" }, "Compassionate Leave"),
                                        react_1["default"].createElement(select_1.SelectItem, { value: "other" }, "Other")))),
                            react_1["default"].createElement("div", { className: "space-y-2" },
                                react_1["default"].createElement(label_1.Label, { htmlFor: "status" }, "Status"),
                                react_1["default"].createElement(select_1.Select, { value: form.status, onValueChange: function (status) { return setForm(function (f) { return (__assign(__assign({}, f), { status: status })); }); } },
                                    react_1["default"].createElement(select_1.SelectTrigger, null,
                                        react_1["default"].createElement(select_1.SelectValue, null)),
                                    react_1["default"].createElement(select_1.SelectContent, null,
                                        react_1["default"].createElement(select_1.SelectItem, { value: "pending" }, "Pending"),
                                        react_1["default"].createElement(select_1.SelectItem, { value: "approved" }, "Approved"),
                                        react_1["default"].createElement(select_1.SelectItem, { value: "rejected" }, "Rejected"),
                                        react_1["default"].createElement(select_1.SelectItem, { value: "cancelled" }, "Cancelled"))))),
                        react_1["default"].createElement("div", { className: "grid gap-4 sm:grid-cols-2" },
                            react_1["default"].createElement("div", { className: "space-y-2" },
                                react_1["default"].createElement(label_1.Label, { htmlFor: "startDate" }, "Start Date *"),
                                react_1["default"].createElement(input_1.Input, { id: "startDate", type: "date", value: form.startDate, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { startDate: e.target.value })); }); }, required: true })),
                            react_1["default"].createElement("div", { className: "space-y-2" },
                                react_1["default"].createElement(label_1.Label, { htmlFor: "endDate" }, "End Date *"),
                                react_1["default"].createElement(input_1.Input, { id: "endDate", type: "date", value: form.endDate, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { endDate: e.target.value })); }); }, required: true }))),
                        react_1["default"].createElement("div", { className: "space-y-2" },
                            react_1["default"].createElement(label_1.Label, { htmlFor: "reason" }, "Reason for Leave"),
                            react_1["default"].createElement(textarea_1.Textarea, { id: "reason", placeholder: "Provide details about your leave request...", value: form.reason, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { reason: e.target.value })); }); }, rows: 4 })),
                        react_1["default"].createElement("div", { className: "space-y-2" },
                            react_1["default"].createElement(label_1.Label, { htmlFor: "approverComments" }, "Approver Comments"),
                            react_1["default"].createElement(textarea_1.Textarea, { id: "approverComments", placeholder: "Comments from the approver...", value: form.approverComments, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { approverComments: e.target.value })); }); }, rows: 3 })),
                        react_1["default"].createElement("div", { className: "flex gap-2 pt-4" },
                            react_1["default"].createElement(button_1.Button, { type: "submit", disabled: isSubmitting || !form.leaveType || !form.startDate || !form.endDate, className: "bg-blue-600 hover:bg-blue-700" }, isSubmitting ? "Updating..." : "Update Leave Request"),
                            react_1["default"].createElement(button_1.Button, { type: "button", variant: "outline", onClick: function () { return setLocation("/org/" + slug + "/leave/" + leaveId); } }, "Cancel"))))))));
}
exports["default"] = OrgEditLeave;
