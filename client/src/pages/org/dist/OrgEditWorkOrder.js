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
function OrgEditWorkOrder() {
    var _this = this;
    var params = wouter_1.useParams();
    var slug = params.slug;
    var workOrderId = params.id;
    var _a = wouter_1.useLocation(), setLocation = _a[1];
    var _b = useOrgPermission_1.useOrgPermission(), checkPermission = _b.checkPermission, hasPermission = _b.hasPermission;
    var _c = trpc_1.trpc.workOrders.get.useQuery(workOrderId, {
        enabled: !!workOrderId && checkPermission("operations:work-orders:view")
    }), workOrder = _c.data, isLoadingWorkOrder = _c.isLoading;
    var _d = react_1.useState({
        workOrderNumber: "",
        issueDate: "",
        description: "",
        assignedTo: "",
        priority: "medium",
        startDate: "",
        targetEndDate: "",
        laborCost: "0",
        serviceCost: "0",
        notes: "",
        status: "draft"
    }), formData = _d[0], setFormData = _d[1];
    var _e = react_1.useState(false), isSubmitting = _e[0], setIsSubmitting = _e[1];
    react_1.useEffect(function () {
        var _a, _b;
        if (workOrder) {
            setFormData({
                workOrderNumber: workOrder.workOrderNumber || "",
                issueDate: workOrder.issueDate ? workOrder.issueDate.split("T")[0] : "",
                description: workOrder.description || "",
                assignedTo: workOrder.assignedTo || "",
                priority: workOrder.priority || "medium",
                startDate: workOrder.startDate ? workOrder.startDate.split("T")[0] : "",
                targetEndDate: workOrder.targetEndDate ? workOrder.targetEndDate.split("T")[0] : "",
                laborCost: String((_a = workOrder.laborCost) !== null && _a !== void 0 ? _a : "0"),
                serviceCost: String((_b = workOrder.serviceCost) !== null && _b !== void 0 ? _b : "0"),
                notes: workOrder.notes || "",
                status: workOrder.status || "draft"
            });
        }
    }, [workOrder]);
    var updateMutation = trpc_1.trpc.workOrders.update.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Work order updated", { description: "The work order has been updated successfully." });
            setLocation("/org/" + slug + "/work-orders/" + workOrderId);
        },
        onError: function (err) {
            sonner_1.toast.error("Failed to update work order", { description: err.message });
            setIsSubmitting(false);
        }
    });
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            e.preventDefault();
            if (!checkPermission("operations:work-orders:edit", "edit work orders")) {
                return [2 /*return*/];
            }
            if (!formData.workOrderNumber || !formData.issueDate || !formData.startDate || !formData.targetEndDate) {
                sonner_1.toast.error("Missing required fields", { description: "Work order number, dates, and assignment are required." });
                return [2 /*return*/];
            }
            setIsSubmitting(true);
            updateMutation.mutate({
                id: workOrderId,
                workOrderNumber: formData.workOrderNumber,
                issueDate: formData.issueDate,
                description: formData.description || undefined,
                assignedTo: formData.assignedTo || undefined,
                priority: formData.priority,
                startDate: formData.startDate,
                targetEndDate: formData.targetEndDate,
                laborCost: parseFloat(formData.laborCost) || 0,
                serviceCost: parseFloat(formData.serviceCost) || 0,
                notes: formData.notes || undefined,
                status: formData.status
            });
            return [2 /*return*/];
        });
    }); };
    if (isLoadingWorkOrder) {
        return (react_1["default"].createElement(OrgLayout_1["default"], { title: "Edit Work Order", showOrgInfo: false },
            react_1["default"].createElement("div", { className: "text-center py-12" }, "Loading...")));
    }
    if (!workOrder) {
        return (react_1["default"].createElement(OrgLayout_1["default"], { title: "Work Order Not Found", showOrgInfo: false },
            react_1["default"].createElement("div", { className: "text-center py-16" },
                react_1["default"].createElement("p", { className: "text-white/40" }, "Work order not found."),
                react_1["default"].createElement(button_1.Button, { variant: "ghost", className: "mt-4 text-white/50 hover:text-white", onClick: function () { return setLocation("/org/" + slug + "/work-orders"); } }, "Back to Work Orders"))));
    }
    if (!hasPermission("operations:work-orders:edit")) {
        return (react_1["default"].createElement(OrgLayout_1["default"], { title: "Edit Work Order", showOrgInfo: false },
            react_1["default"].createElement("div", { className: "space-y-6" },
                react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                    react_1["default"].createElement(OrgBreadcrumb_1["default"], { slug: slug, items: [
                            { label: "Work Orders", href: "/org/" + slug + "/work-orders" },
                            { label: "Edit Work Order" },
                        ] }),
                    react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", className: "text-white/50 hover:text-white", onClick: function () { return setLocation("/org/" + slug + "/dashboard"); } },
                        react_1["default"].createElement(lucide_react_1.ArrowLeft, { className: "h-4 w-4 mr-1" }),
                        " Back")),
                react_1["default"].createElement("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-10 text-center" },
                    react_1["default"].createElement(lucide_react_1.Pencil, { className: "mx-auto h-12 w-12 text-white/30" }),
                    react_1["default"].createElement("h2", { className: "mt-5 text-xl font-semibold text-white" }, "Access Denied"),
                    react_1["default"].createElement("p", { className: "mt-2 text-sm text-white/60" }, "You do not have permission to edit work orders.")))));
    }
    return (react_1["default"].createElement(OrgLayout_1["default"], { title: "Edit Work Order", showOrgInfo: false },
        react_1["default"].createElement("div", { className: "space-y-6" },
            react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement(OrgBreadcrumb_1["default"], { slug: slug, items: [
                            { label: "Work Orders", href: "/org/" + slug + "/work-orders" },
                            { label: workOrder.workOrderNumber || "Edit Work Order" },
                        ] })),
                react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", className: "text-white/50 hover:text-white", onClick: function () { return setLocation("/org/" + slug + "/work-orders/" + workOrderId); } },
                    react_1["default"].createElement(lucide_react_1.ArrowLeft, { className: "h-4 w-4 mr-1" }),
                    " Back")),
            react_1["default"].createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
                react_1["default"].createElement(card_1.CardHeader, null,
                    react_1["default"].createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                        react_1["default"].createElement(lucide_react_1.Pencil, { className: "h-5 w-5" }),
                        " Edit Work Order"),
                    react_1["default"].createElement(card_1.CardDescription, null, "Update work order details for your organization.")),
                react_1["default"].createElement(card_1.CardContent, null,
                    react_1["default"].createElement("form", { onSubmit: handleSubmit, className: "space-y-6" },
                        react_1["default"].createElement("div", { className: "grid gap-4 sm:grid-cols-2" },
                            react_1["default"].createElement("div", { className: "space-y-2" },
                                react_1["default"].createElement(label_1.Label, { htmlFor: "workOrderNumber" }, "Work Order Number *"),
                                react_1["default"].createElement(input_1.Input, { id: "workOrderNumber", value: formData.workOrderNumber, onChange: function (e) { return setFormData(function (f) { return (__assign(__assign({}, f), { workOrderNumber: e.target.value })); }); }, required: true })),
                            react_1["default"].createElement("div", { className: "space-y-2" },
                                react_1["default"].createElement(label_1.Label, { htmlFor: "issueDate" }, "Issue Date *"),
                                react_1["default"].createElement(input_1.Input, { id: "issueDate", type: "date", value: formData.issueDate, onChange: function (e) { return setFormData(function (f) { return (__assign(__assign({}, f), { issueDate: e.target.value })); }); }, required: true }))),
                        react_1["default"].createElement("div", { className: "grid gap-4 sm:grid-cols-2" },
                            react_1["default"].createElement("div", { className: "space-y-2" },
                                react_1["default"].createElement(label_1.Label, { htmlFor: "priority" }, "Priority"),
                                react_1["default"].createElement(select_1.Select, { value: formData.priority, onValueChange: function (value) { return setFormData(function (f) { return (__assign(__assign({}, f), { priority: value })); }); } },
                                    react_1["default"].createElement(select_1.SelectTrigger, null,
                                        react_1["default"].createElement(select_1.SelectValue, null)),
                                    react_1["default"].createElement(select_1.SelectContent, null,
                                        react_1["default"].createElement(select_1.SelectItem, { value: "low" }, "Low"),
                                        react_1["default"].createElement(select_1.SelectItem, { value: "medium" }, "Medium"),
                                        react_1["default"].createElement(select_1.SelectItem, { value: "high" }, "High"),
                                        react_1["default"].createElement(select_1.SelectItem, { value: "critical" }, "Critical")))),
                            react_1["default"].createElement("div", { className: "space-y-2" },
                                react_1["default"].createElement(label_1.Label, { htmlFor: "status" }, "Status"),
                                react_1["default"].createElement(select_1.Select, { value: formData.status, onValueChange: function (value) { return setFormData(function (f) { return (__assign(__assign({}, f), { status: value })); }); } },
                                    react_1["default"].createElement(select_1.SelectTrigger, null,
                                        react_1["default"].createElement(select_1.SelectValue, null)),
                                    react_1["default"].createElement(select_1.SelectContent, null,
                                        react_1["default"].createElement(select_1.SelectItem, { value: "draft" }, "Draft"),
                                        react_1["default"].createElement(select_1.SelectItem, { value: "open" }, "Open"),
                                        react_1["default"].createElement(select_1.SelectItem, { value: "in-progress" }, "In Progress"),
                                        react_1["default"].createElement(select_1.SelectItem, { value: "completed" }, "Completed"),
                                        react_1["default"].createElement(select_1.SelectItem, { value: "cancelled" }, "Cancelled"))))),
                        react_1["default"].createElement("div", { className: "grid gap-4 sm:grid-cols-2" },
                            react_1["default"].createElement("div", { className: "space-y-2" },
                                react_1["default"].createElement(label_1.Label, { htmlFor: "startDate" }, "Start Date *"),
                                react_1["default"].createElement(input_1.Input, { id: "startDate", type: "date", value: formData.startDate, onChange: function (e) { return setFormData(function (f) { return (__assign(__assign({}, f), { startDate: e.target.value })); }); }, required: true })),
                            react_1["default"].createElement("div", { className: "space-y-2" },
                                react_1["default"].createElement(label_1.Label, { htmlFor: "targetEndDate" }, "Target End Date *"),
                                react_1["default"].createElement(input_1.Input, { id: "targetEndDate", type: "date", value: formData.targetEndDate, onChange: function (e) { return setFormData(function (f) { return (__assign(__assign({}, f), { targetEndDate: e.target.value })); }); }, required: true }))),
                        react_1["default"].createElement("div", { className: "grid gap-4 sm:grid-cols-2" },
                            react_1["default"].createElement("div", { className: "space-y-2" },
                                react_1["default"].createElement(label_1.Label, { htmlFor: "assignedTo" }, "Assigned To"),
                                react_1["default"].createElement(input_1.Input, { id: "assignedTo", value: formData.assignedTo, onChange: function (e) { return setFormData(function (f) { return (__assign(__assign({}, f), { assignedTo: e.target.value })); }); } })),
                            react_1["default"].createElement("div", { className: "grid gap-4 sm:grid-cols-2" },
                                react_1["default"].createElement("div", { className: "space-y-2" },
                                    react_1["default"].createElement(label_1.Label, { htmlFor: "laborCost" }, "Labor Cost"),
                                    react_1["default"].createElement(input_1.Input, { id: "laborCost", type: "number", min: "0", step: "0.01", value: formData.laborCost, onChange: function (e) { return setFormData(function (f) { return (__assign(__assign({}, f), { laborCost: e.target.value })); }); } })),
                                react_1["default"].createElement("div", { className: "space-y-2" },
                                    react_1["default"].createElement(label_1.Label, { htmlFor: "serviceCost" }, "Service Cost"),
                                    react_1["default"].createElement(input_1.Input, { id: "serviceCost", type: "number", min: "0", step: "0.01", value: formData.serviceCost, onChange: function (e) { return setFormData(function (f) { return (__assign(__assign({}, f), { serviceCost: e.target.value })); }); } })))),
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement(label_1.Label, { htmlFor: "description" }, "Description"),
                            react_1["default"].createElement(textarea_1.Textarea, { id: "description", value: formData.description, onChange: function (e) { return setFormData(function (f) { return (__assign(__assign({}, f), { description: e.target.value })); }); }, rows: 4 })),
                        react_1["default"].createElement("div", null,
                            react_1["default"].createElement(label_1.Label, { htmlFor: "notes" }, "Notes"),
                            react_1["default"].createElement(textarea_1.Textarea, { id: "notes", value: formData.notes, onChange: function (e) { return setFormData(function (f) { return (__assign(__assign({}, f), { notes: e.target.value })); }); }, rows: 3 })),
                        react_1["default"].createElement("div", { className: "flex gap-4" },
                            react_1["default"].createElement(button_1.Button, { type: "submit", disabled: isSubmitting || updateMutation.isPending }, isSubmitting || updateMutation.isPending ? "Saving..." : "Save Changes"),
                            react_1["default"].createElement(button_1.Button, { type: "button", variant: "secondary", onClick: function () { return setLocation("/org/" + slug + "/work-orders/" + workOrderId); } }, "Cancel"))))))));
}
exports["default"] = OrgEditWorkOrder;
