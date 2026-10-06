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
var ModuleLayout_1 = require("@/components/ModuleLayout");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var badge_1 = require("@/components/ui/badge");
var tabs_1 = require("@/components/ui/tabs");
var dialog_1 = require("@/components/ui/dialog");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var trpc_1 = require("@/lib/trpc");
var useUserLookup_1 = require("@/hooks/useUserLookup");
// Delivery status timeline
function DeliveryTimeline(_a) {
    var _b;
    var delivery = _a.delivery;
    var timeline = [
        {
            status: "draft",
            label: "Created",
            icon: React.createElement(lucide_react_1.Package, { className: "w-4 h-4" }),
            color: "bg-gray-200"
        },
        {
            status: "in_transit",
            label: "In Transit",
            icon: React.createElement(lucide_react_1.Truck, { className: "w-4 h-4" }),
            color: "bg-blue-200"
        },
        {
            status: "delivered",
            label: "Delivered",
            icon: React.createElement(lucide_react_1.CheckCircle2, { className: "w-4 h-4" }),
            color: "bg-green-200"
        },
    ];
    return (React.createElement("div", { className: "space-y-4" },
        React.createElement("h4", { className: "font-semibold" }, "Delivery Progress"),
        React.createElement("div", { className: "flex items-center gap-2" }, timeline.map(function (step, index) { return (React.createElement("div", { key: step.status, className: "flex items-center gap-2" },
            React.createElement("div", { className: "p-2 rounded-full " + (delivery.status === step.status || delivery.status > step.status
                    ? step.color
                    : "bg-gray-100") }, step.icon),
            index < timeline.length - 1 && (React.createElement("div", { className: "w-8 h-1 " + (delivery.status === step.status || delivery.status > step.status
                    ? "bg-blue-400"
                    : "bg-gray-200") })))); })),
        React.createElement("p", { className: "text-sm text-gray-600 mt-2" },
            "Current Status: ",
            React.createElement("span", { className: "font-semibold" }, (_b = delivery.status) === null || _b === void 0 ? void 0 : _b.replace(/_/g, " ")))));
}
// Key metrics for deliveries
function DeliveryMetrics() {
    var _a, _b, _c;
    var _d = trpc_1.trpc.deliveryNotes.list.useQuery().data, deliveries = _d === void 0 ? [] : _d;
    var metrics = [
        {
            title: "On-Time Deliveries",
            value: ((_a = deliveries === null || deliveries === void 0 ? void 0 : deliveries.filter(function (d) { return d.status === "delivered"; })) === null || _a === void 0 ? void 0 : _a.length) || 0,
            icon: React.createElement(lucide_react_1.CheckCircle2, { className: "w-5 h-5" }),
            color: "text-green-600"
        },
        {
            title: "In Transit",
            value: ((_b = deliveries === null || deliveries === void 0 ? void 0 : deliveries.filter(function (d) { return d.status === "in_transit"; })) === null || _b === void 0 ? void 0 : _b.length) || 0,
            icon: React.createElement(lucide_react_1.Truck, { className: "w-5 h-5" }),
            color: "text-blue-600"
        },
        {
            title: "Delayed/Issues",
            value: ((_c = deliveries === null || deliveries === void 0 ? void 0 : deliveries.filter(function (d) { return d.status === "failed"; })) === null || _c === void 0 ? void 0 : _c.length) || 0,
            icon: React.createElement(lucide_react_1.AlertCircle, { className: "w-5 h-5" }),
            color: "text-red-600"
        },
        {
            title: "Total Deliveries",
            value: (deliveries === null || deliveries === void 0 ? void 0 : deliveries.length) || 0,
            icon: React.createElement(lucide_react_1.TrendingUp, { className: "w-5 h-5" }),
            color: "text-purple-600"
        },
    ];
    return (React.createElement("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4" }, metrics.map(function (metric) { return (React.createElement(card_1.Card, { key: metric.title },
        React.createElement(card_1.CardContent, { className: "p-4" },
            React.createElement("div", { className: "flex items-start justify-between" },
                React.createElement("div", null,
                    React.createElement("p", { className: "text-xs font-medium text-gray-600" }, metric.title),
                    React.createElement("p", { className: "text-2xl font-bold mt-1" }, metric.value)),
                React.createElement("span", { className: metric.color }, metric.icon))))); })));
}
// Delivery creation form
function CreateDeliveryDialog() {
    var _a = react_1.useState(false), isOpen = _a[0], setIsOpen = _a[1];
    var _b = react_1.useState({
        dnNo: "",
        supplier: "",
        orderId: "",
        deliveryDate: "",
        items: 0,
        notes: ""
    }), formData = _b[0], setFormData = _b[1];
    var refetch = trpc_1.trpc.deliveryNotes.list.useQuery().refetch;
    var createMutation = trpc_1.trpc.deliveryNotes.create.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Delivery note created successfully");
            setIsOpen(false);
            setFormData({
                dnNo: "",
                supplier: "",
                orderId: "",
                deliveryDate: "",
                items: 0,
                notes: ""
            });
            refetch();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to create delivery note");
        }
    });
    var handleCreate = function () {
        if (!formData.dnNo || !formData.supplier) {
            sonner_1.toast.error("DN Number and Supplier are required");
            return;
        }
        createMutation.mutate(formData);
    };
    return (React.createElement(dialog_1.Dialog, { open: isOpen, onOpenChange: setIsOpen },
        React.createElement(dialog_1.DialogTrigger, { asChild: true },
            React.createElement(button_1.Button, null,
                React.createElement(lucide_react_1.Plus, { className: "w-4 h-4 mr-2" }),
                "New Delivery")),
        React.createElement(dialog_1.DialogContent, null,
            React.createElement(dialog_1.DialogHeader, null,
                React.createElement(dialog_1.DialogTitle, null, "Create Delivery Note"),
                React.createElement(dialog_1.DialogDescription, null, "Record incoming delivery from supplier")),
            React.createElement("div", { className: "space-y-4" },
                React.createElement("div", null,
                    React.createElement(label_1.Label, null, "Delivery Note Number"),
                    React.createElement(input_1.Input, { value: formData.dnNo, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { dnNo: e.target.value })); }, placeholder: "DN-001" })),
                React.createElement("div", null,
                    React.createElement(label_1.Label, null, "Supplier"),
                    React.createElement(input_1.Input, { value: formData.supplier, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { supplier: e.target.value })); }, placeholder: "Supplier name or ID" })),
                React.createElement("div", null,
                    React.createElement(label_1.Label, null, "Expected Delivery Date"),
                    React.createElement(input_1.Input, { type: "date", value: formData.deliveryDate, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { deliveryDate: e.target.value })); } })),
                React.createElement("div", null,
                    React.createElement(label_1.Label, null, "Number of Items"),
                    React.createElement(input_1.Input, { type: "number", value: formData.items, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { items: parseInt(e.target.value) })); }, placeholder: "0" })),
                React.createElement("div", null,
                    React.createElement(label_1.Label, null, "Notes"),
                    React.createElement(input_1.Input, { value: formData.notes, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { notes: e.target.value })); }, placeholder: "Additional notes..." })),
                React.createElement(button_1.Button, { onClick: handleCreate, disabled: createMutation.isPending, className: "w-full" },
                    createMutation.isPending && React.createElement(lucide_react_1.Loader2, { className: "w-4 h-4 mr-2 animate-spin" }),
                    "Create Delivery Note")))));
}
// Main delivery tracking page
function DeliveryTracking() {
    var _a;
    var getUserName = useUserLookup_1.useUserLookup().getUserName;
    var _b = react_1.useState(null), selectedDelivery = _b[0], setSelectedDelivery = _b[1];
    var _c = trpc_1.trpc.deliveryNotes.list.useQuery().data, deliveries = _c === void 0 ? [] : _c;
    var statusColors = {
        draft: "bg-gray-100 text-gray-800",
        in_transit: "bg-blue-100 text-blue-800",
        delivered: "bg-green-100 text-green-800",
        partially_delivered: "bg-yellow-100 text-yellow-800",
        failed: "bg-red-100 text-red-800",
        cancelled: "bg-gray-100 text-gray-800"
    };
    var groupedByStatus = {
        in_transit: (deliveries === null || deliveries === void 0 ? void 0 : deliveries.filter(function (d) { return d.status === "in_transit"; })) || [],
        delivered: (deliveries === null || deliveries === void 0 ? void 0 : deliveries.filter(function (d) { return d.status === "delivered"; })) || [],
        draft: (deliveries === null || deliveries === void 0 ? void 0 : deliveries.filter(function (d) { return d.status === "draft"; })) || [],
        issues: (deliveries === null || deliveries === void 0 ? void 0 : deliveries.filter(function (d) { var _a; return (_a = ["failed", "partially_delivered"]) === null || _a === void 0 ? void 0 : _a.includes(d.status); })) || []
    };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Procurement", href: "/procurement" },
            { label: "Delivery Tracking", href: "/procurement/deliveries" },
        ], title: "Delivery Tracking", description: "Real-time monitoring of supplier deliveries and logistics", icon: React.createElement(lucide_react_1.Truck, { className: "w-6 h-6" }) },
        React.createElement("div", { className: "space-y-8" },
            React.createElement("div", null,
                React.createElement("h2", { className: "text-2xl font-bold mb-4" }, "Delivery Metrics"),
                React.createElement(DeliveryMetrics, null)),
            React.createElement("div", { className: "flex justify-end" },
                React.createElement(CreateDeliveryDialog, null)),
            React.createElement(tabs_1.Tabs, { defaultValue: "in_transit", className: "w-full" },
                React.createElement(tabs_1.TabsList, null,
                    React.createElement(tabs_1.TabsTrigger, { value: "in_transit" },
                        "In Transit (",
                        groupedByStatus.in_transit.length,
                        ")"),
                    React.createElement(tabs_1.TabsTrigger, { value: "delivered" },
                        "Delivered (",
                        groupedByStatus.delivered.length,
                        ")"),
                    React.createElement(tabs_1.TabsTrigger, { value: "draft" },
                        "Draft (",
                        groupedByStatus.draft.length,
                        ")"),
                    React.createElement(tabs_1.TabsTrigger, { value: "issues" },
                        "Issues (",
                        groupedByStatus.issues.length,
                        ")")),
                Object.entries(groupedByStatus).map(function (_a) {
                    var _b;
                    var status = _a[0], deliveriesInStatus = _a[1];
                    return (React.createElement(tabs_1.TabsContent, { key: status, value: status, className: "space-y-4" },
                        React.createElement("div", { className: "grid gap-4" }, (_b = deliveriesInStatus) === null || _b === void 0 ? void 0 :
                            _b.map(function (delivery) {
                                var _a;
                                return (React.createElement(card_1.Card, { key: delivery.id },
                                    React.createElement(card_1.CardContent, { className: "p-6" },
                                        React.createElement("div", { className: "flex items-start justify-between gap-4" },
                                            React.createElement("div", { className: "flex-1" },
                                                React.createElement("div", { className: "flex items-center gap-2 mb-2" },
                                                    React.createElement("h3", { className: "font-semibold text-lg" }, delivery.dnNo),
                                                    React.createElement(badge_1.Badge, { className: statusColors[delivery.status] }, (_a = delivery.status) === null || _a === void 0 ? void 0 : _a.replace(/_/g, " "))),
                                                React.createElement("p", { className: "text-sm text-gray-600" },
                                                    "Supplier: ",
                                                    React.createElement("span", { className: "font-medium" }, delivery.supplier)),
                                                React.createElement("p", { className: "text-sm text-gray-600 mt-1" },
                                                    delivery.items,
                                                    " items \u2022",
                                                    " ",
                                                    new Date(delivery.deliveryDate).toLocaleDateString()),
                                                delivery.notes && (React.createElement("p", { className: "text-sm text-gray-600 mt-2 italic" },
                                                    "Note: ",
                                                    delivery.notes))),
                                            React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setSelectedDelivery(delivery); } }, "View Details")))));
                            }),
                            (!deliveriesInStatus || deliveriesInStatus.length === 0) && (React.createElement(card_1.Card, null,
                                React.createElement(card_1.CardContent, { className: "p-6 text-center text-gray-500" }, "No deliveries in this status"))))));
                })),
            selectedDelivery && (React.createElement(dialog_1.Dialog, { open: !!selectedDelivery, onOpenChange: function () { return setSelectedDelivery(null); } },
                React.createElement(dialog_1.DialogContent, { className: "max-w-2xl" },
                    React.createElement(dialog_1.DialogHeader, null,
                        React.createElement(dialog_1.DialogTitle, null,
                            "Delivery Details: ",
                            selectedDelivery.dnNo),
                        React.createElement(dialog_1.DialogDescription, null, "Complete delivery information and tracking")),
                    React.createElement("div", { className: "space-y-6" },
                        React.createElement(DeliveryTimeline, { delivery: selectedDelivery }),
                        React.createElement("div", { className: "grid grid-cols-2 gap-4 text-sm" },
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-gray-600" }, "Supplier"),
                                React.createElement("p", { className: "font-semibold" }, selectedDelivery.supplier)),
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-gray-600" }, "Status"),
                                React.createElement("p", { className: "font-semibold" }, (_a = selectedDelivery.status) === null || _a === void 0 ? void 0 : _a.replace(/_/g, " "))),
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-gray-600" }, "Expected Delivery"),
                                React.createElement("p", { className: "font-semibold" }, new Date(selectedDelivery.deliveryDate).toLocaleDateString())),
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-gray-600" }, "Number of Items"),
                                React.createElement("p", { className: "font-semibold" }, selectedDelivery.items)),
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-gray-600" }, "Created"),
                                React.createElement("p", { className: "font-semibold" }, new Date(selectedDelivery.createdAt).toLocaleDateString())),
                            React.createElement("div", null,
                                React.createElement("p", { className: "text-gray-600" }, "Created By"),
                                React.createElement("p", { className: "font-semibold" }, getUserName(selectedDelivery.createdBy)))),
                        selectedDelivery.notes && (React.createElement("div", null,
                            React.createElement("p", { className: "text-gray-600 mb-2" }, "Notes"),
                            React.createElement("p", { className: "bg-gray-50 p-3 rounded text-sm" }, selectedDelivery.notes))))))),
            React.createElement(card_1.Card, { className: "border-blue-200 bg-blue-50" },
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: "text-lg" }, "Delivery Tracking Guide")),
                React.createElement(card_1.CardContent, { className: "space-y-2 text-sm" },
                    React.createElement("div", { className: "flex gap-2" },
                        React.createElement(badge_1.Badge, null, "Draft"),
                        React.createElement("span", null, "Delivery note created but not yet sent to logistics")),
                    React.createElement("div", { className: "flex gap-2" },
                        React.createElement(badge_1.Badge, { className: "bg-blue-100 text-blue-800" }, "In Transit"),
                        React.createElement("span", null, "Goods are on the way to warehouse")),
                    React.createElement("div", { className: "flex gap-2" },
                        React.createElement(badge_1.Badge, { className: "bg-green-100 text-green-800" }, "Delivered"),
                        React.createElement("span", null, "Goods received at warehouse")),
                    React.createElement("div", { className: "flex gap-2" },
                        React.createElement(badge_1.Badge, { className: "bg-yellow-100 text-yellow-800" }, "Partially Delivered"),
                        React.createElement("span", null, "Some items received, others pending")),
                    React.createElement("div", { className: "flex gap-2" },
                        React.createElement(badge_1.Badge, { className: "bg-red-100 text-red-800" }, "Failed"),
                        React.createElement("span", null, "Delivery failed or returned")))))));
}
exports["default"] = DeliveryTracking;
