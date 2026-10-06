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
var textarea_1 = require("@/components/ui/textarea");
var dialog_1 = require("@/components/ui/dialog");
var select_1 = require("@/components/ui/select");
var table_1 = require("@/components/ui/table");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var trpc_1 = require("@/lib/trpc");
// Quality Assessment Component
function QualityAssessment(_a) {
    var _b, _c;
    var grn = _a.grn;
    var _d = react_1.useState(false), isAssessing = _d[0], setIsAssessing = _d[1];
    var _e = react_1.useState({
        condition: "good",
        remarks: ""
    }), assessment = _e[0], setAssessment = _e[1];
    var qualityRatings = {
        good: { label: "Accepted", color: "bg-green-100 text-green-800" },
        partial: { label: "Partial Acceptance", color: "bg-yellow-100 text-yellow-800" },
        damaged: { label: "Damaged", color: "bg-red-100 text-red-800" },
        defective: { label: "Defective", color: "bg-red-100 text-red-800" }
    };
    return (React.createElement("div", { className: "space-y-4 p-4 bg-gray-50 rounded-lg" },
        React.createElement("h4", { className: "font-semibold text-sm" }, "Quality Assessment"),
        !grn.qualityStatus ? (React.createElement(React.Fragment, null,
            React.createElement("div", null,
                React.createElement(label_1.Label, null, "Inspection Result"),
                React.createElement(select_1.Select, { value: assessment.condition, onValueChange: function (value) {
                        return setAssessment(__assign(__assign({}, assessment), { condition: value }));
                    } },
                    React.createElement(select_1.SelectTrigger, null,
                        React.createElement(select_1.SelectValue, null)),
                    React.createElement(select_1.SelectContent, null,
                        React.createElement(select_1.SelectItem, { value: "good" }, "Accepted"),
                        React.createElement(select_1.SelectItem, { value: "partial" }, "Partial Acceptance"),
                        React.createElement(select_1.SelectItem, { value: "damaged" }, "Damaged"),
                        React.createElement(select_1.SelectItem, { value: "defective" }, "Defective")))),
            React.createElement("div", null,
                React.createElement(label_1.Label, null, "Assessment Remarks"),
                React.createElement(textarea_1.Textarea, { value: assessment.remarks, onChange: function (e) { return setAssessment(__assign(__assign({}, assessment), { remarks: e.target.value })); }, placeholder: "Enter quality assessment remarks...", rows: 3 })),
            React.createElement(button_1.Button, { size: "sm", className: "w-full", disabled: isAssessing },
                isAssessing && React.createElement(lucide_react_1.Loader2, { className: "w-4 h-4 mr-2 animate-spin" }),
                "Submit Assessment"))) : (React.createElement("div", { className: "space-y-2" },
            React.createElement("p", { className: "text-sm text-gray-600" }, "Assessment Status"),
            React.createElement(badge_1.Badge, { className: (_b = qualityRatings[grn.qualityStatus]) === null || _b === void 0 ? void 0 : _b.color }, (_c = qualityRatings[grn.qualityStatus]) === null || _c === void 0 ? void 0 : _c.label),
            grn.remarks && (React.createElement("div", null,
                React.createElement("p", { className: "text-sm text-gray-600" }, "Remarks"),
                React.createElement("p", { className: "text-sm" }, grn.remarks)))))));
}
// GRN Metrics
function GRNMetrics() {
    var _a, _b, _c;
    var _d = trpc_1.trpc.grn.list.useQuery().data, grns = _d === void 0 ? [] : _d;
    var metrics = [
        {
            title: "Total GRNs",
            value: (grns === null || grns === void 0 ? void 0 : grns.length) || 0,
            icon: React.createElement(lucide_react_1.Package, { className: "w-5 h-5" }),
            color: "text-blue-600"
        },
        {
            title: "Accepted",
            value: ((_a = grns === null || grns === void 0 ? void 0 : grns.filter(function (g) { return g.status === "accepted"; })) === null || _a === void 0 ? void 0 : _a.length) || 0,
            icon: React.createElement(lucide_react_1.CheckCircle2, { className: "w-5 h-5" }),
            color: "text-green-600"
        },
        {
            title: "Partial",
            value: ((_b = grns === null || grns === void 0 ? void 0 : grns.filter(function (g) { return g.status === "partial"; })) === null || _b === void 0 ? void 0 : _b.length) || 0,
            icon: React.createElement(lucide_react_1.AlertTriangle, { className: "w-5 h-5" }),
            color: "text-yellow-600"
        },
        {
            title: "Rejected",
            value: ((_c = grns === null || grns === void 0 ? void 0 : grns.filter(function (g) { return g.status === "rejected"; })) === null || _c === void 0 ? void 0 : _c.length) || 0,
            icon: React.createElement(lucide_react_1.AlertCircle, { className: "w-5 h-5" }),
            color: "text-red-600"
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
// Create GRN Dialog
function CreateGRNDialog() {
    var _a = react_1.useState(false), isOpen = _a[0], setIsOpen = _a[1];
    var _b = react_1.useState({
        grnNo: "",
        supplier: "",
        invNo: "",
        receivedDate: new Date().toISOString().split("T")[0],
        items: 0,
        value: 0,
        notes: ""
    }), formData = _b[0], setFormData = _b[1];
    var refetch = trpc_1.trpc.grn.list.useQuery().refetch;
    var createMutation = trpc_1.trpc.grn.create.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("GRN created successfully");
            setIsOpen(false);
            setFormData({
                grnNo: "",
                supplier: "",
                invNo: "",
                receivedDate: new Date().toISOString().split("T")[0],
                items: 0,
                value: 0,
                notes: ""
            });
            refetch();
        },
        onError: function (error) {
            sonner_1.toast.error(error.message || "Failed to create GRN");
        }
    });
    var handleCreate = function () {
        if (!formData.grnNo || !formData.supplier) {
            sonner_1.toast.error("GRN Number and Supplier are required");
            return;
        }
        createMutation.mutate(__assign(__assign({}, formData), { items: parseInt(formData.items.toString()), value: parseFloat(formData.value.toString()) }));
    };
    return (React.createElement(dialog_1.Dialog, { open: isOpen, onOpenChange: setIsOpen },
        React.createElement(dialog_1.DialogTrigger, { asChild: true },
            React.createElement(button_1.Button, null,
                React.createElement(lucide_react_1.Plus, { className: "w-4 h-4 mr-2" }),
                "New GRN")),
        React.createElement(dialog_1.DialogContent, null,
            React.createElement(dialog_1.DialogHeader, null,
                React.createElement(dialog_1.DialogTitle, null, "Create Goods Receipt Note"),
                React.createElement(dialog_1.DialogDescription, null, "Record incoming goods and perform quality assessment")),
            React.createElement("div", { className: "space-y-4" },
                React.createElement("div", null,
                    React.createElement(label_1.Label, null, "GRN Number"),
                    React.createElement(input_1.Input, { value: formData.grnNo, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { grnNo: e.target.value })); }, placeholder: "GRN-001" })),
                React.createElement("div", null,
                    React.createElement(label_1.Label, null, "Supplier"),
                    React.createElement(input_1.Input, { value: formData.supplier, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { supplier: e.target.value })); }, placeholder: "Supplier name or ID" })),
                React.createElement("div", null,
                    React.createElement(label_1.Label, null, "Invoice Number (Optional)"),
                    React.createElement(input_1.Input, { value: formData.invNo, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { invNo: e.target.value })); }, placeholder: "INV-001" })),
                React.createElement("div", null,
                    React.createElement(label_1.Label, null, "Received Date"),
                    React.createElement(input_1.Input, { type: "date", value: formData.receivedDate, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { receivedDate: e.target.value })); } })),
                React.createElement("div", { className: "grid grid-cols-2 gap-4" },
                    React.createElement("div", null,
                        React.createElement(label_1.Label, null, "Number of Items"),
                        React.createElement(input_1.Input, { type: "number", value: formData.items, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { items: parseInt(e.target.value) })); }, placeholder: "0" })),
                    React.createElement("div", null,
                        React.createElement(label_1.Label, null, "Total Value"),
                        React.createElement(input_1.Input, { type: "number", step: "0.01", value: formData.value, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { value: parseFloat(e.target.value) })); }, placeholder: "0.00" }))),
                React.createElement("div", null,
                    React.createElement(label_1.Label, null, "Notes"),
                    React.createElement(textarea_1.Textarea, { value: formData.notes, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { notes: e.target.value })); }, placeholder: "Additional notes...", rows: 3 })),
                React.createElement(button_1.Button, { onClick: handleCreate, disabled: createMutation.isPending, className: "w-full" },
                    createMutation.isPending && React.createElement(lucide_react_1.Loader2, { className: "w-4 h-4 mr-2 animate-spin" }),
                    "Create GRN")))));
}
// GRN Table with Details
function GRNTable() {
    var _a;
    var _b = react_1.useState(null), selectedGRN = _b[0], setSelectedGRN = _b[1];
    var _c = trpc_1.trpc.grn.list.useQuery().data, grns = _c === void 0 ? [] : _c;
    var statusColors = {
        pending: "bg-gray-100 text-gray-800",
        accepted: "bg-green-100 text-green-800",
        partial: "bg-yellow-100 text-yellow-800",
        rejected: "bg-red-100 text-red-800"
    };
    return (React.createElement("div", { className: "space-y-4" },
        React.createElement(table_1.Table, null,
            React.createElement(table_1.TableHeader, null,
                React.createElement(table_1.TableRow, null,
                    React.createElement(table_1.TableHead, null, "GRN Number"),
                    React.createElement(table_1.TableHead, null, "Supplier"),
                    React.createElement(table_1.TableHead, null, "Invoice"),
                    React.createElement(table_1.TableHead, null, "Items"),
                    React.createElement(table_1.TableHead, null, "Value"),
                    React.createElement(table_1.TableHead, null, "Status"),
                    React.createElement(table_1.TableHead, null, "Quality"),
                    React.createElement(table_1.TableHead, null, "Action"))),
            React.createElement(table_1.TableBody, null, grns === null || grns === void 0 ? void 0 :
                grns.map(function (grn) {
                    var _a;
                    return (React.createElement(table_1.TableRow, { key: grn.id },
                        React.createElement(table_1.TableCell, { className: "font-medium" }, grn.grnNo),
                        React.createElement(table_1.TableCell, null, grn.supplier),
                        React.createElement(table_1.TableCell, null, grn.invNo || "-"),
                        React.createElement(table_1.TableCell, null, grn.items),
                        React.createElement(table_1.TableCell, null,
                            "$",
                            ((_a = grn.value) === null || _a === void 0 ? void 0 : _a.toFixed(2)) || "0.00"),
                        React.createElement(table_1.TableCell, null,
                            React.createElement(badge_1.Badge, { className: statusColors[grn.status] || "" }, grn.status)),
                        React.createElement(table_1.TableCell, null, grn.status ? (React.createElement(badge_1.Badge, { variant: "outline" }, grn.status)) : (React.createElement("span", { className: "text-xs text-gray-500" }, "Pending"))),
                        React.createElement(table_1.TableCell, null,
                            React.createElement(button_1.Button, { variant: "ghost", size: "sm", onClick: function () { return setSelectedGRN(grn); } }, "View"))));
                }),
                (!grns || grns.length === 0) && (React.createElement(table_1.TableRow, null,
                    React.createElement(table_1.TableCell, { colSpan: 8, className: "text-center py-8 text-gray-500" }, "No GRNs found. Create one to get started."))))),
        selectedGRN && (React.createElement(dialog_1.Dialog, { open: !!selectedGRN, onOpenChange: function () { return setSelectedGRN(null); } },
            React.createElement(dialog_1.DialogContent, { className: "max-w-2xl" },
                React.createElement(dialog_1.DialogHeader, null,
                    React.createElement(dialog_1.DialogTitle, null,
                        "GRN Details: ",
                        selectedGRN.grnNo),
                    React.createElement(dialog_1.DialogDescription, null, "Complete Goods Receipt Note information and quality assessment")),
                React.createElement("div", { className: "space-y-6" },
                    React.createElement("div", { className: "grid grid-cols-2 gap-4 text-sm" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-gray-600" }, "Supplier"),
                            React.createElement("p", { className: "font-semibold" }, selectedGRN.supplier)),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-gray-600" }, "Status"),
                            React.createElement("p", { className: "font-semibold" }, selectedGRN.status)),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-gray-600" }, "Invoice Number"),
                            React.createElement("p", { className: "font-semibold" }, selectedGRN.invNo || "-")),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-gray-600" }, "Received Date"),
                            React.createElement("p", { className: "font-semibold" }, new Date(selectedGRN.receivedDate).toLocaleDateString()))),
                    React.createElement("div", { className: "grid grid-cols-3 gap-4 text-sm bg-blue-50 p-4 rounded-lg" },
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-gray-600" }, "Total Items"),
                            React.createElement("p", { className: "text-2xl font-bold" }, selectedGRN.items)),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-gray-600" }, "Total Value"),
                            React.createElement("p", { className: "text-2xl font-bold" },
                                "$", (_a = selectedGRN.value) === null || _a === void 0 ? void 0 :
                                _a.toFixed(2))),
                        React.createElement("div", null,
                            React.createElement("p", { className: "text-gray-600" }, "Per Item"),
                            React.createElement("p", { className: "text-2xl font-bold" },
                                "$",
                                (selectedGRN.value / selectedGRN.items).toFixed(2)))),
                    React.createElement(QualityAssessment, { grn: selectedGRN }),
                    selectedGRN.notes && (React.createElement("div", null,
                        React.createElement("p", { className: "text-gray-600 mb-2 text-sm" }, "Notes"),
                        React.createElement("p", { className: "bg-gray-50 p-3 rounded text-sm" }, selectedGRN.notes))),
                    React.createElement("div", { className: "flex gap-2 pt-4 border-t" },
                        React.createElement(button_1.Button, { variant: "outline", className: "flex-1", onClick: function () { window.print(); } }, "Print GRN"),
                        React.createElement(button_1.Button, { variant: "outline", className: "flex-1", onClick: function () { return sonner_1.toast.success("GRN loaded to inventory queue"); } }, "Load to Inventory"),
                        React.createElement(button_1.Button, { className: "flex-1", onClick: function () { return sonner_1.toast.success("Changes saved"); } }, "Save Changes"))))))));
}
function GRNManagement() {
    return (React.createElement(ModuleLayout_1.ModuleLayout, { breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Procurement", href: "/procurement" },
            { label: "GRN Management", href: "/procurement/grn" },
        ], title: "Goods Receipt Notes (GRN)", description: "Manage goods receipt, quality assessment, and warehouse intake", icon: React.createElement(lucide_react_1.Package, { className: "w-6 h-6" }) },
        React.createElement("div", { className: "space-y-8" },
            React.createElement("div", null,
                React.createElement("h2", { className: "text-2xl font-bold mb-4" }, "GRN Metrics"),
                React.createElement(GRNMetrics, null)),
            React.createElement("div", { className: "flex justify-end" },
                React.createElement(CreateGRNDialog, null)),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Goods Receipt Notes"),
                    React.createElement(card_1.CardDescription, null, "Complete list of received goods with quality assessment")),
                React.createElement(card_1.CardContent, null,
                    React.createElement(GRNTable, null))),
            React.createElement(card_1.Card, { className: "border-green-200 bg-green-50" },
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: "text-lg" }, "Quality Assessment Guide")),
                React.createElement(card_1.CardContent, { className: "space-y-3 text-sm" },
                    React.createElement("div", { className: "flex gap-2" },
                        React.createElement(badge_1.Badge, { className: "bg-green-100 text-green-800" }, "Accepted"),
                        React.createElement("span", null, "Goods meet specifications and are accepted into inventory")),
                    React.createElement("div", { className: "flex gap-2" },
                        React.createElement(badge_1.Badge, { className: "bg-yellow-100 text-yellow-800" }, "Partial"),
                        React.createElement("span", null, "Some items accepted, others require further inspection or return")),
                    React.createElement("div", { className: "flex gap-2" },
                        React.createElement(badge_1.Badge, { className: "bg-red-100 text-red-800" }, "Rejected"),
                        React.createElement("span", null, "Goods do not meet specifications and must be returned/replaced")),
                    React.createElement("div", { className: "flex gap-2" },
                        React.createElement(badge_1.Badge, { className: "bg-red-100 text-red-800" }, "Defective"),
                        React.createElement("span", null, "Quality issues detected requiring supplier remediation")))),
            React.createElement(card_1.Card, { className: "border-blue-200 bg-blue-50" },
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, { className: "text-lg" }, "Receipt Workflow")),
                React.createElement(card_1.CardContent, { className: "space-y-2 text-sm" },
                    React.createElement("p", null,
                        React.createElement("span", { className: "font-semibold" }, "1. Create GRN:"),
                        " Generate new GRN when goods arrive"),
                    React.createElement("p", null,
                        React.createElement("span", { className: "font-semibold" }, "2. Count Items:"),
                        " Verify item count matches LPO"),
                    React.createElement("p", null,
                        React.createElement("span", { className: "font-semibold" }, "3. Quality Check:"),
                        " Inspect goods for damage/defects"),
                    React.createElement("p", null,
                        React.createElement("span", { className: "font-semibold" }, "4. Assessment:"),
                        " Record quality status"),
                    React.createElement("p", null,
                        React.createElement("span", { className: "font-semibold" }, "5. Load Inventory:"),
                        " Update warehouse inventory post approval"))))));
}
exports["default"] = GRNManagement;
