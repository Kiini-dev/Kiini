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
var ModuleLayout_1 = require("@/components/ModuleLayout");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var badge_1 = require("@/components/ui/badge");
var separator_1 = require("@/components/ui/separator");
var RichTextEditor_1 = require("@/components/RichTextEditor");
var currency_1 = require("@/lib/currency");
var tabs_1 = require("@/components/ui/tabs");
var dialog_1 = require("@/components/ui/dialog");
var select_1 = require("@/components/ui/select");
var table_1 = require("@/components/ui/table");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var trpc_1 = require("@/lib/trpc");
// Workflow visualization component
function ProcurementWorkflow() {
    var steps = [
        {
            title: "Supplier Selection",
            description: "Choose qualified suppliers",
            icon: React.createElement(lucide_react_1.ShoppingCart, { className: "w-5 h-5" }),
            color: "bg-blue-100 text-blue-800"
        },
        {
            title: "Create LPO",
            description: "Generate purchase order",
            icon: React.createElement(lucide_react_1.FileText, { className: "w-5 h-5" }),
            color: "bg-purple-100 text-purple-800"
        },
        {
            title: "Track Delivery",
            description: "Monitor goods in transit",
            icon: React.createElement(lucide_react_1.Truck, { className: "w-5 h-5" }),
            color: "bg-orange-100 text-orange-800"
        },
        {
            title: "Receive Goods",
            description: "Create GRN & quality check",
            icon: React.createElement(lucide_react_1.Package, { className: "w-5 h-5" }),
            color: "bg-green-100 text-green-800"
        },
    ];
    return (React.createElement("div", { className: "space-y-6" },
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, null, "Procurement Workflow"),
                React.createElement(card_1.CardDescription, null, "End-to-end procurement process from order to receipt")),
            React.createElement(card_1.CardContent, null,
                React.createElement("div", { className: "flex items-center justify-between gap-2 flex-wrap md:flex-nowrap" }, steps.map(function (step, index) { return (React.createElement("div", { key: step.title, className: "flex flex-col items-center gap-2 flex-1" },
                    React.createElement("div", { className: "p-3 rounded-full " + step.color }, step.icon),
                    React.createElement("div", { className: "text-center" },
                        React.createElement("p", { className: "font-semibold text-sm" }, step.title),
                        React.createElement("p", { className: "text-xs text-gray-600" }, step.description)),
                    index < steps.length - 1 && (React.createElement("div", { className: "hidden md:block absolute ml-[10rem] w-16 h-0.5 bg-gray-300" })))); }))))));
}
// Key metrics dashboard
function ProcurementMetrics() {
    var _a, _b, _c;
    var _d = trpc_1.trpc.lpo.list.useQuery().data, lpos = _d === void 0 ? [] : _d;
    var _e = trpc_1.trpc.suppliers.list.useQuery({}).data, suppliers = _e === void 0 ? [] : _e;
    var _f = trpc_1.trpc.deliveryNotes.list.useQuery().data, deliveries = _f === void 0 ? [] : _f;
    var _g = trpc_1.trpc.grn.list.useQuery().data, grns = _g === void 0 ? [] : _g;
    var metrics = [
        {
            title: "Active Suppliers",
            value: ((_a = suppliers === null || suppliers === void 0 ? void 0 : suppliers.filter(function (s) { return s.isActive; })) === null || _a === void 0 ? void 0 : _a.length) || 0,
            icon: React.createElement(lucide_react_1.ShoppingCart, { className: "w-5 h-5" }),
            color: "bg-blue-50 text-blue-700"
        },
        {
            title: "Active LPOs",
            value: ((_b = lpos === null || lpos === void 0 ? void 0 : lpos.filter(function (l) { var _a; return !((_a = ["cancelled", "closed"]) === null || _a === void 0 ? void 0 : _a.includes(l.status)); })) === null || _b === void 0 ? void 0 : _b.length) || 0,
            icon: React.createElement(lucide_react_1.FileText, { className: "w-5 h-5" }),
            color: "bg-purple-50 text-purple-700"
        },
        {
            title: "Pending Deliveries",
            value: ((_c = deliveries === null || deliveries === void 0 ? void 0 : deliveries.filter(function (d) { return d.status === "in_transit"; })) === null || _c === void 0 ? void 0 : _c.length) || 0,
            icon: React.createElement(lucide_react_1.Truck, { className: "w-5 h-5" }),
            color: "bg-orange-50 text-orange-700"
        },
        {
            title: "Total GRNs",
            value: (grns === null || grns === void 0 ? void 0 : grns.length) || 0,
            icon: React.createElement(lucide_react_1.Package, { className: "w-5 h-5" }),
            color: "bg-green-50 text-green-700"
        },
    ];
    return (React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" }, metrics.map(function (metric) { return (React.createElement(card_1.Card, { key: metric.title },
        React.createElement(card_1.CardContent, { className: "p-6" },
            React.createElement("div", { className: "flex items-start justify-between" },
                React.createElement("div", null,
                    React.createElement("p", { className: "text-sm font-medium text-gray-600" }, metric.title),
                    React.createElement("p", { className: "text-2xl font-bold mt-2" }, metric.value)),
                React.createElement("div", { className: "p-2 rounded-lg " + metric.color }, metric.icon))))); })));
}
// LPO Management Table
function LPOTable() {
    var _a = wouter_1.useLocation(), setLocation = _a[1];
    var currencyCode = currency_1.useCurrencySettings().code;
    var _b = react_1.useState(false), isCreateOpen = _b[0], setIsCreateOpen = _b[1];
    var _c = react_1.useState(""), searchTerm = _c[0], setSearchTerm = _c[1];
    var _d = react_1.useState({
        vendorId: "",
        description: "",
        amount: 0,
        deliveryDate: "",
        deliveryLocation: "",
        notes: ""
    }), formData = _d[0], setFormData = _d[1];
    var _e = trpc_1.trpc.lpo.list.useQuery(), _f = _e.data, lpos = _f === void 0 ? [] : _f, refetch = _e.refetch;
    var _g = trpc_1.trpc.suppliers.list.useQuery({ limit: 100 }).data, suppliers = _g === void 0 ? [] : _g;
    var createMutation = trpc_1.trpc.lpo.create.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("LPO created successfully");
            setIsCreateOpen(false);
            setFormData({ vendorId: "", description: "", amount: 0, deliveryDate: "", deliveryLocation: "", notes: "" });
            refetch();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to create LPO");
        }
    });
    var handleCreateLPO = function () {
        if (!formData.vendorId) {
            sonner_1.toast.error("Please select a vendor");
            return;
        }
        if (formData.amount <= 0) {
            sonner_1.toast.error("Amount must be greater than 0");
            return;
        }
        createMutation.mutate({
            vendorId: formData.vendorId,
            description: formData.description,
            amount: formData.amount * 100,
            deliveryDate: formData.deliveryDate || undefined,
            deliveryLocation: formData.deliveryLocation || undefined,
            notes: formData.notes || undefined
        });
    };
    // Build a vendor lookup map
    var vendorMap = react_1.useMemo(function () {
        var map = {};
        suppliers.forEach(function (s) { map[s.id] = s.companyName || s.name || s.id; });
        return map;
    }, [suppliers]);
    var filteredLPOs = react_1.useMemo(function () {
        if (!searchTerm)
            return lpos;
        var term = searchTerm.toLowerCase();
        return lpos.filter(function (lpo) {
            var _a, _b, _c;
            return ((_a = lpo.lpoNumber) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(term)) || ((_b = (vendorMap[lpo.vendorId] || lpo.vendorId)) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(term)) || ((_c = lpo.description) === null || _c === void 0 ? void 0 : _c.toLowerCase().includes(term));
        });
    }, [lpos, searchTerm, vendorMap]);
    return (React.createElement("div", { className: "space-y-4" },
        React.createElement("div", { className: "flex justify-between items-center gap-4" },
            React.createElement("div", { className: "relative flex-1 max-w-sm" },
                React.createElement(lucide_react_1.Search, { className: "absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" }),
                React.createElement(input_1.Input, { placeholder: "Search LPOs...", value: searchTerm, onChange: function (e) { return setSearchTerm(e.target.value); }, className: "pl-8" })),
            React.createElement(dialog_1.Dialog, { open: isCreateOpen, onOpenChange: setIsCreateOpen },
                React.createElement(dialog_1.DialogTrigger, { asChild: true },
                    React.createElement(button_1.Button, null,
                        React.createElement(lucide_react_1.Plus, { className: "w-4 h-4 mr-2" }),
                        "New LPO")),
                React.createElement(dialog_1.DialogContent, { className: "max-w-2xl max-h-[85vh] overflow-y-auto" },
                    React.createElement(dialog_1.DialogHeader, null,
                        React.createElement(dialog_1.DialogTitle, null, "Create Local Purchase Order"),
                        React.createElement(dialog_1.DialogDescription, null, "Create a new purchase order for procurement")),
                    React.createElement("div", { className: "space-y-6" },
                        React.createElement(card_1.Card, null,
                            React.createElement(card_1.CardHeader, { className: "pb-4" },
                                React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                                    React.createElement(lucide_react_1.Building2, { className: "w-4 h-4 text-blue-600" }),
                                    "Vendor & Order Value")),
                            React.createElement(card_1.CardContent, { className: "space-y-4" },
                                React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                                    React.createElement("div", { className: "space-y-2" },
                                        React.createElement(label_1.Label, null, "Select Vendor *"),
                                        React.createElement(select_1.Select, { value: formData.vendorId, onValueChange: function (v) { return setFormData(__assign(__assign({}, formData), { vendorId: v })); } },
                                            React.createElement(select_1.SelectTrigger, null,
                                                React.createElement(select_1.SelectValue, { placeholder: "Choose a vendor" })),
                                            React.createElement(select_1.SelectContent, null, suppliers.map(function (s) { return (React.createElement(select_1.SelectItem, { key: s.id, value: s.id }, s.companyName || s.name)); })))),
                                    React.createElement("div", { className: "space-y-2" },
                                        React.createElement(label_1.Label, null,
                                            "Amount (",
                                            currencyCode,
                                            ") *"),
                                        React.createElement("div", { className: "relative" },
                                            React.createElement(lucide_react_1.Coins, { className: "absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" }),
                                            React.createElement(input_1.Input, { type: "number", value: formData.amount || "", onChange: function (e) { return setFormData(__assign(__assign({}, formData), { amount: parseFloat(e.target.value) || 0 })); }, placeholder: "0.00", step: "0.01", className: "pl-8" })))))),
                        React.createElement(card_1.Card, null,
                            React.createElement(card_1.CardHeader, { className: "pb-4" },
                                React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                                    React.createElement(lucide_react_1.Truck, { className: "w-4 h-4 text-orange-600" }),
                                    "Delivery Details")),
                            React.createElement(card_1.CardContent, { className: "space-y-4" },
                                React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                                    React.createElement("div", { className: "space-y-2" },
                                        React.createElement(label_1.Label, null, "Delivery Date"),
                                        React.createElement(input_1.Input, { type: "date", value: formData.deliveryDate, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { deliveryDate: e.target.value })); } })),
                                    React.createElement("div", { className: "space-y-2" },
                                        React.createElement(label_1.Label, null, "Delivery Location"),
                                        React.createElement("div", { className: "relative" },
                                            React.createElement(lucide_react_1.MapPin, { className: "absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" }),
                                            React.createElement(input_1.Input, { value: formData.deliveryLocation, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { deliveryLocation: e.target.value })); }, placeholder: "e.g., Warehouse A", className: "pl-8" })))))),
                        React.createElement(card_1.Card, null,
                            React.createElement(card_1.CardHeader, { className: "pb-4" },
                                React.createElement(card_1.CardTitle, { className: "text-base flex items-center gap-2" },
                                    React.createElement(lucide_react_1.StickyNote, { className: "w-4 h-4 text-purple-600" }),
                                    "Description & Notes")),
                            React.createElement(card_1.CardContent, { className: "space-y-4" },
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement(label_1.Label, null, "Description / Items"),
                                    React.createElement(RichTextEditor_1.RichTextEditor, { value: formData.description, onChange: function (html) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { description: html })); }); }, placeholder: "List items or services to be procured", minHeight: "100px" })),
                                React.createElement(separator_1.Separator, null),
                                React.createElement("div", { className: "space-y-2" },
                                    React.createElement(label_1.Label, null, "Additional Notes"),
                                    React.createElement(RichTextEditor_1.RichTextEditor, { value: formData.notes, onChange: function (html) { return setFormData(function (prev) { return (__assign(__assign({}, prev), { notes: html })); }); }, placeholder: "Additional notes or special instructions", minHeight: "80px" }))))),
                    React.createElement("div", { className: "flex justify-end gap-3 pt-2" },
                        React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setIsCreateOpen(false); } }, "Cancel"),
                        React.createElement(button_1.Button, { onClick: handleCreateLPO, disabled: createMutation.isPending },
                            createMutation.isPending && React.createElement(lucide_react_1.Loader2, { className: "w-4 h-4 mr-2 animate-spin" }),
                            "Create LPO"))))),
        React.createElement(table_1.Table, null,
            React.createElement(table_1.TableHeader, null,
                React.createElement(table_1.TableRow, null,
                    React.createElement(table_1.TableHead, null, "LPO Number"),
                    React.createElement(table_1.TableHead, null, "Vendor"),
                    React.createElement(table_1.TableHead, { className: "text-right" }, "Amount"),
                    React.createElement(table_1.TableHead, null, "Status"),
                    React.createElement(table_1.TableHead, null, "Date"),
                    React.createElement(table_1.TableHead, null, "Action"))),
            React.createElement(table_1.TableBody, null, filteredLPOs === null || filteredLPOs === void 0 ? void 0 :
                filteredLPOs.map(function (lpo) { return (React.createElement(table_1.TableRow, { key: lpo.id },
                    React.createElement(table_1.TableCell, { className: "font-medium" }, lpo.lpoNumber),
                    React.createElement(table_1.TableCell, null, vendorMap[lpo.vendorId] || lpo.vendorId),
                    React.createElement(table_1.TableCell, { className: "text-right" }, new Intl.NumberFormat("en-US", { style: "currency", currency: currencyCode }).format((lpo.amount || 0) / 100)),
                    React.createElement(table_1.TableCell, null,
                        React.createElement(badge_1.Badge, { variant: lpo.status === "approved"
                                ? "default"
                                : lpo.status === "draft"
                                    ? "secondary"
                                    : "outline" }, lpo.status)),
                    React.createElement(table_1.TableCell, null, new Date(lpo.createdAt).toLocaleDateString()),
                    React.createElement(table_1.TableCell, null,
                        React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return setLocation("/lpos/" + lpo.id); } }, "View")))); }),
                (!filteredLPOs || filteredLPOs.length === 0) && (React.createElement(table_1.TableRow, null,
                    React.createElement(table_1.TableCell, { colSpan: 6, className: "text-center py-8 text-gray-500" }, "No LPOs found. Create one to get started.")))))));
}
// Delivery Notes Table
function DeliveryNotesTable() {
    var _a = wouter_1.useLocation(), setLocation = _a[1];
    var _b = trpc_1.trpc.deliveryNotes.list.useQuery().data, deliveries = _b === void 0 ? [] : _b;
    var statusColors = {
        draft: "bg-gray-100 text-gray-800",
        in_transit: "bg-blue-100 text-blue-800",
        delivered: "bg-green-100 text-green-800",
        partially_delivered: "bg-yellow-100 text-yellow-800",
        failed: "bg-red-100 text-red-800"
    };
    return (React.createElement("div", { className: "space-y-4" },
        React.createElement("h3", { className: "text-lg font-semibold" }, "Delivery Tracking"),
        React.createElement(table_1.Table, null,
            React.createElement(table_1.TableHeader, null,
                React.createElement(table_1.TableRow, null,
                    React.createElement(table_1.TableHead, null, "DN Number"),
                    React.createElement(table_1.TableHead, null, "Supplier"),
                    React.createElement(table_1.TableHead, null, "Expected Delivery"),
                    React.createElement(table_1.TableHead, null, "Status"),
                    React.createElement(table_1.TableHead, null, "Items"),
                    React.createElement(table_1.TableHead, null, "Action"))),
            React.createElement(table_1.TableBody, null, deliveries === null || deliveries === void 0 ? void 0 :
                deliveries.map(function (dn) {
                    var _a;
                    return (React.createElement(table_1.TableRow, { key: dn.id },
                        React.createElement(table_1.TableCell, { className: "font-medium" }, dn.dnNo),
                        React.createElement(table_1.TableCell, null, dn.supplier),
                        React.createElement(table_1.TableCell, null, new Date(dn.deliveryDate).toLocaleDateString()),
                        React.createElement(table_1.TableCell, null,
                            React.createElement(badge_1.Badge, { className: statusColors[dn.status] || "" }, (_a = dn.status) === null || _a === void 0 ? void 0 : _a.replace(/_/g, " "))),
                        React.createElement(table_1.TableCell, null, dn.items),
                        React.createElement(table_1.TableCell, null,
                            React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return setLocation("/delivery-notes/" + dn.id); } }, "Track"))));
                }),
                (!deliveries || deliveries.length === 0) && (React.createElement(table_1.TableRow, null,
                    React.createElement(table_1.TableCell, { colSpan: 6, className: "text-center py-8 text-gray-500" }, "No deliveries found.")))))));
}
// GRN Table
function GRNTable() {
    var _a = wouter_1.useLocation(), setLocation = _a[1];
    var _b = trpc_1.trpc.grn.list.useQuery().data, grns = _b === void 0 ? [] : _b;
    return (React.createElement("div", { className: "space-y-4" },
        React.createElement("h3", { className: "text-lg font-semibold" }, "Goods Receipt Notes (GRN)"),
        React.createElement(table_1.Table, null,
            React.createElement(table_1.TableHeader, null,
                React.createElement(table_1.TableRow, null,
                    React.createElement(table_1.TableHead, null, "GRN Number"),
                    React.createElement(table_1.TableHead, null, "Supplier"),
                    React.createElement(table_1.TableHead, null, "Received Date"),
                    React.createElement(table_1.TableHead, null, "Status"),
                    React.createElement(table_1.TableHead, null, "Quality Status"),
                    React.createElement(table_1.TableHead, null, "Action"))),
            React.createElement(table_1.TableBody, null, grns === null || grns === void 0 ? void 0 :
                grns.map(function (grn) { return (React.createElement(table_1.TableRow, { key: grn.id },
                    React.createElement(table_1.TableCell, { className: "font-medium" }, grn.grnNo),
                    React.createElement(table_1.TableCell, null, grn.supplier),
                    React.createElement(table_1.TableCell, null, new Date(grn.receivedDate).toLocaleDateString()),
                    React.createElement(table_1.TableCell, null,
                        React.createElement(badge_1.Badge, { variant: "outline" }, grn.status)),
                    React.createElement(table_1.TableCell, null,
                        React.createElement(badge_1.Badge, { variant: grn.status === "accepted" ? "default" : "secondary" }, grn.status)),
                    React.createElement(table_1.TableCell, null,
                        React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return setLocation("/grn/" + grn.id); } }, "View")))); }),
                (!grns || grns.length === 0) && (React.createElement(table_1.TableRow, null,
                    React.createElement(table_1.TableCell, { colSpan: 6, className: "text-center py-8 text-gray-500" }, "No GRNs found.")))))));
}
function ProcurementManagement() {
    return (React.createElement(ModuleLayout_1.ModuleLayout, { breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Procurement Management", href: "/procurement/management" },
        ], title: "Procurement Management", description: "Complete procurement workflow management from supplier selection to goods receipt", icon: React.createElement(lucide_react_1.ShoppingCart, { className: "w-6 h-6" }) },
        React.createElement("div", { className: "space-y-8" },
            React.createElement(ProcurementWorkflow, null),
            React.createElement("div", null,
                React.createElement("h2", { className: "text-2xl font-bold mb-4" }, "Procurement Metrics"),
                React.createElement(ProcurementMetrics, null)),
            React.createElement(tabs_1.Tabs, { defaultValue: "lpos", className: "w-full" },
                React.createElement(tabs_1.TabsList, null,
                    React.createElement(tabs_1.TabsTrigger, { value: "lpos" }, "Purchase Orders"),
                    React.createElement(tabs_1.TabsTrigger, { value: "deliveries" }, "Deliveries"),
                    React.createElement(tabs_1.TabsTrigger, { value: "grns" }, "Goods Receipt")),
                React.createElement(tabs_1.TabsContent, { value: "lpos", className: "space-y-4" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardContent, { className: "p-6" },
                            React.createElement(LPOTable, null)))),
                React.createElement(tabs_1.TabsContent, { value: "deliveries", className: "space-y-4" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardContent, { className: "p-6" },
                            React.createElement(DeliveryNotesTable, null)))),
                React.createElement(tabs_1.TabsContent, { value: "grns", className: "space-y-4" },
                    React.createElement(card_1.Card, null,
                        React.createElement(card_1.CardContent, { className: "p-6" },
                            React.createElement(GRNTable, null))))),
            React.createElement(card_1.Card, { className: "border-blue-200 bg-blue-50" },
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: "text-lg" }, "Procurement Flow Reference")),
                React.createElement(card_1.CardContent, { className: "space-y-2 text-sm" },
                    React.createElement("div", { className: "flex gap-2" },
                        React.createElement("span", { className: "font-semibold min-w-fit" }, "1. Suppliers:"),
                        React.createElement("span", null, "Choose qualified suppliers and manage their information")),
                    React.createElement("div", { className: "flex gap-2" },
                        React.createElement("span", { className: "font-semibold min-w-fit" }, "2. Create LPO:"),
                        React.createElement("span", null, "Generate purchase orders for required items")),
                    React.createElement("div", { className: "flex gap-2" },
                        React.createElement("span", { className: "font-semibold min-w-fit" }, "3. Track Delivery:"),
                        React.createElement("span", null, "Monitor delivery status and update receipt information")),
                    React.createElement("div", { className: "flex gap-2" },
                        React.createElement("span", { className: "font-semibold min-w-fit" }, "4. Create GRN:"),
                        React.createElement("span", null, "Record goods receipt, perform quality checks, and update inventory")))))));
}
exports["default"] = ProcurementManagement;
