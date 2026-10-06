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
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var card_1 = require("@/components/ui/card");
var select_1 = require("@/components/ui/select");
var trpc_1 = require("@/lib/trpc");
var permissions_1 = require("@/lib/permissions");
var sonner_1 = require("sonner");
var spinner_1 = require("@/components/ui/spinner");
var lucide_react_1 = require("lucide-react");
function EditWorkOrder(_a) {
    var _this = this;
    var params = _a.params;
    var _b = wouter_1.useLocation(), setLocation = _b[1];
    var id = (params === null || params === void 0 ? void 0 : params.id) || "";
    var _c = permissions_1.useRequireFeature("operations:work-orders:edit"), allowed = _c.allowed, permLoading = _c.isLoading;
    var _d = react_1.useState(false), isLoading = _d[0], setIsLoading = _d[1];
    var _e = react_1.useState({
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
    }), formData = _e[0], setFormData = _e[1];
    var getQuery = trpc_1.trpc.workOrders.get.useQuery({ id: id });
    var updateMutation = trpc_1.trpc.workOrders.update.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Work order updated successfully!");
            setLocation("/work-orders");
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to update work order: " + error.message);
        }
    });
    react_1.useEffect(function () {
        var _a, _b;
        if (getQuery.data) {
            var wo = getQuery.data;
            setFormData({
                workOrderNumber: wo.workOrderNumber || "",
                issueDate: new Date(wo.issueDate).toISOString().split("T")[0],
                description: wo.description || "",
                assignedTo: wo.assignedTo || "",
                priority: wo.priority || "medium",
                startDate: new Date(wo.startDate).toISOString().split("T")[0],
                targetEndDate: new Date(wo.targetEndDate).toISOString().split("T")[0],
                laborCost: ((_a = wo.laborCost) === null || _a === void 0 ? void 0 : _a.toString()) || "0",
                serviceCost: ((_b = wo.serviceCost) === null || _b === void 0 ? void 0 : _b.toString()) || "0",
                notes: wo.notes || "",
                status: wo.status || "draft"
            });
        }
    }, [getQuery.data]);
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var laborCost, serviceCost, total;
        return __generator(this, function (_a) {
            e.preventDefault();
            setIsLoading(true);
            try {
                laborCost = parseFloat(formData.laborCost) || 0;
                serviceCost = parseFloat(formData.serviceCost) || 0;
                total = laborCost + serviceCost;
                updateMutation.mutate({
                    id: id,
                    workOrderNumber: formData.workOrderNumber,
                    issueDate: new Date(formData.issueDate),
                    description: formData.description,
                    assignedTo: formData.assignedTo,
                    priority: formData.priority,
                    startDate: new Date(formData.startDate),
                    targetEndDate: new Date(formData.targetEndDate),
                    laborCost: laborCost,
                    serviceCost: serviceCost,
                    total: total,
                    notes: formData.notes,
                    status: formData.status
                });
            }
            catch (error) {
                sonner_1.toast.error("Error: " + error.message);
            }
            finally {
                setIsLoading(false);
            }
            return [2 /*return*/];
        });
    }); };
    if (permLoading || getQuery.isLoading)
        return React.createElement(spinner_1.Spinner, null);
    if (!allowed)
        return React.createElement("div", { className: "text-center py-10" }, "Access Denied");
    if (getQuery.isError)
        return React.createElement("div", { className: "text-center py-10" }, "Work Order not found");
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Edit Work Order", description: "Update work order details", icon: React.createElement(lucide_react_1.Pencil, { className: "w-5 h-5" }), breadcrumbs: [{ label: "Dashboard", href: "/crm-home" }, { label: "Work Orders", href: "/work-orders" }, { label: "Edit" }], backLink: { label: "Work Orders", href: "/work-orders" } },
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, null, "Edit Work Order"),
                React.createElement(card_1.CardDescription, null, "Update the details for this work order")),
            React.createElement(card_1.CardContent, null,
                React.createElement("form", { onSubmit: handleSubmit, className: "space-y-6" },
                    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6" },
                        React.createElement("div", null,
                            React.createElement(label_1.Label, { htmlFor: "workOrderNumber" }, "Work Order Number *"),
                            React.createElement(input_1.Input, { id: "workOrderNumber", value: formData.workOrderNumber, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { workOrderNumber: e.target.value })); }, required: true })),
                        React.createElement("div", null,
                            React.createElement(label_1.Label, { htmlFor: "issueDate" }, "Issue Date *"),
                            React.createElement(input_1.Input, { id: "issueDate", type: "date", value: formData.issueDate, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { issueDate: e.target.value })); }, required: true })),
                        React.createElement("div", null,
                            React.createElement(label_1.Label, { htmlFor: "priority" }, "Priority"),
                            React.createElement(select_1.Select, { value: formData.priority, onValueChange: function (value) { return setFormData(__assign(__assign({}, formData), { priority: value })); } },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, null)),
                                React.createElement(select_1.SelectContent, null,
                                    React.createElement(select_1.SelectItem, { value: "low" }, "Low"),
                                    React.createElement(select_1.SelectItem, { value: "medium" }, "Medium"),
                                    React.createElement(select_1.SelectItem, { value: "high" }, "High"),
                                    React.createElement(select_1.SelectItem, { value: "critical" }, "Critical")))),
                        React.createElement("div", null,
                            React.createElement(label_1.Label, { htmlFor: "status" }, "Status"),
                            React.createElement(select_1.Select, { value: formData.status, onValueChange: function (value) { return setFormData(__assign(__assign({}, formData), { status: value })); } },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, null)),
                                React.createElement(select_1.SelectContent, null,
                                    React.createElement(select_1.SelectItem, { value: "draft" }, "Draft"),
                                    React.createElement(select_1.SelectItem, { value: "open" }, "Open"),
                                    React.createElement(select_1.SelectItem, { value: "in-progress" }, "In Progress"),
                                    React.createElement(select_1.SelectItem, { value: "completed" }, "Completed"),
                                    React.createElement(select_1.SelectItem, { value: "cancelled" }, "Cancelled")))),
                        React.createElement("div", null,
                            React.createElement(label_1.Label, { htmlFor: "startDate" }, "Start Date *"),
                            React.createElement(input_1.Input, { id: "startDate", type: "date", value: formData.startDate, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { startDate: e.target.value })); }, required: true })),
                        React.createElement("div", null,
                            React.createElement(label_1.Label, { htmlFor: "targetEndDate" }, "Target End Date *"),
                            React.createElement(input_1.Input, { id: "targetEndDate", type: "date", value: formData.targetEndDate, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { targetEndDate: e.target.value })); }, required: true })),
                        React.createElement("div", null,
                            React.createElement(label_1.Label, { htmlFor: "assignedTo" }, "Assigned To *"),
                            React.createElement(input_1.Input, { id: "assignedTo", value: formData.assignedTo, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { assignedTo: e.target.value })); }, required: true })),
                        React.createElement("div", null,
                            React.createElement(label_1.Label, { htmlFor: "laborCost" }, "Labor Cost (KES)"),
                            React.createElement(input_1.Input, { id: "laborCost", type: "number", step: "0.01", value: formData.laborCost, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { laborCost: e.target.value })); } })),
                        React.createElement("div", null,
                            React.createElement(label_1.Label, { htmlFor: "serviceCost" }, "Service Cost (KES)"),
                            React.createElement(input_1.Input, { id: "serviceCost", type: "number", step: "0.01", value: formData.serviceCost, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { serviceCost: e.target.value })); } }))),
                    React.createElement("div", null,
                        React.createElement(label_1.Label, { htmlFor: "description" }, "Description *"),
                        React.createElement(textarea_1.Textarea, { id: "description", value: formData.description, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { description: e.target.value })); }, rows: 4, required: true })),
                    React.createElement("div", null,
                        React.createElement(label_1.Label, { htmlFor: "notes" }, "Notes"),
                        React.createElement(textarea_1.Textarea, { id: "notes", value: formData.notes, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { notes: e.target.value })); }, rows: 3 })),
                    React.createElement("div", { className: "flex gap-4" },
                        React.createElement(button_1.Button, { type: "submit", disabled: isLoading || updateMutation.isPending }, isLoading || updateMutation.isPending ? "Saving..." : "Save Changes"),
                        React.createElement(button_1.Button, { type: "button", variant: "outline", onClick: function () { return setLocation("/work-orders"); }, disabled: isLoading }, "Cancel")))))));
}
exports["default"] = EditWorkOrder;
