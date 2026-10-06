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
var ModuleLayout_1 = require("@/components/ModuleLayout");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var RichTextEditor_1 = require("@/components/RichTextEditor");
var card_1 = require("@/components/ui/card");
var select_1 = require("@/components/ui/select");
var table_1 = require("@/components/ui/table");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var spinner_1 = require("@/components/ui/spinner");
var lucide_react_1 = require("lucide-react");
function CreateDebitNote() {
    var _a = wouter_1.useLocation(), setLocation = _a[1];
    // Auto-number from server
    var nextNumberData = trpc_1.trpc.debitNotes.getNextDebitNoteNumber.useQuery().data;
    var _b = react_1.useState({
        debitNoteNumber: "",
        issueDate: new Date().toISOString().split("T")[0],
        supplierId: "",
        supplierName: "",
        reason: "",
        notes: "",
        status: "draft"
    }), formData = _b[0], setFormData = _b[1];
    react_1.useEffect(function () {
        if ((nextNumberData === null || nextNumberData === void 0 ? void 0 : nextNumberData.debitNoteNumber) && !formData.debitNoteNumber) {
            setFormData(function (prev) { return (__assign(__assign({}, prev), { debitNoteNumber: nextNumberData.debitNoteNumber })); });
        }
    }, [nextNumberData]);
    var _c = react_1.useState([
        { id: "1", description: "", quantity: 1, unitPrice: 0, total: 0 },
    ]), items = _c[0], setItems = _c[1];
    var createMutation = trpc_1.trpc.debitNotes.create.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Debit note created successfully!");
            setLocation("/debit-notes");
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to create debit note: " + error.message);
        }
    });
    var updateItem = function (index, field, value) {
        setItems(function (prev) {
            var updated = __spreadArrays(prev);
            updated[index][field] = value;
            updated[index].total = updated[index].quantity * updated[index].unitPrice;
            return updated;
        });
    };
    var addItem = function () {
        return setItems(function (prev) { return __spreadArrays(prev, [{ id: String(Date.now()), description: "", quantity: 1, unitPrice: 0, total: 0 }]); });
    };
    var removeItem = function (index) {
        return setItems(function (prev) { return prev.filter(function (_, i) { return i !== index; }); });
    };
    var total = items.reduce(function (sum, item) { return sum + item.total; }, 0);
    var handleSubmit = function (e) {
        e.preventDefault();
        if (!formData.supplierName || !formData.reason) {
            sonner_1.toast.error("Supplier and reason are required");
            return;
        }
        createMutation.mutate({
            debitNoteNumber: formData.debitNoteNumber,
            issueDate: new Date(formData.issueDate).toISOString(),
            supplierId: formData.supplierId || "unknown",
            supplierName: formData.supplierName,
            reason: formData.reason,
            items: items.map(function (i) { return ({ description: i.description, quantity: i.quantity, unitPrice: i.unitPrice, total: i.total }); }),
            subtotal: total,
            total: total,
            notes: formData.notes || undefined,
            status: formData.status
        });
    };
    var update = function (field, value) {
        return setFormData(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[field] = value, _a)));
        });
    };
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Create Debit Note", icon: React.createElement(lucide_react_1.FileMinus, { className: "h-5 w-5" }), breadcrumbs: [
            { label: "Debit Notes", href: "/debit-notes" },
            { label: "Create Debit Note" },
        ], actions: React.createElement("div", { className: "flex gap-2" },
            React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setLocation("/debit-notes"); } }, "Cancel"),
            React.createElement(button_1.Button, { onClick: handleSubmit, disabled: createMutation.isPending },
                createMutation.isPending ? React.createElement(spinner_1.Spinner, { className: "mr-2 h-4 w-4" }) : null,
                "Create Debit Note")) },
        React.createElement("form", { onSubmit: handleSubmit, className: "max-w-4xl space-y-6" },
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Debit Note Details")),
                React.createElement(card_1.CardContent, { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                    React.createElement("div", null,
                        React.createElement(label_1.Label, { htmlFor: "debitNoteNumber" }, "Debit Note Number"),
                        React.createElement(input_1.Input, { id: "debitNoteNumber", value: formData.debitNoteNumber, onChange: function (e) { return update("debitNoteNumber", e.target.value); } })),
                    React.createElement("div", null,
                        React.createElement(label_1.Label, { htmlFor: "issueDate" }, "Issue Date"),
                        React.createElement(input_1.Input, { id: "issueDate", type: "date", value: formData.issueDate, onChange: function (e) { return update("issueDate", e.target.value); } })),
                    React.createElement("div", null,
                        React.createElement(label_1.Label, { htmlFor: "supplierName" }, "Supplier Name *"),
                        React.createElement(input_1.Input, { id: "supplierName", value: formData.supplierName, onChange: function (e) { return update("supplierName", e.target.value); }, required: true })),
                    React.createElement("div", null,
                        React.createElement(label_1.Label, { htmlFor: "reason" }, "Reason *"),
                        React.createElement(select_1.Select, { value: formData.reason, onValueChange: function (v) { return update("reason", v); } },
                            React.createElement(select_1.SelectTrigger, null,
                                React.createElement(select_1.SelectValue, { placeholder: "Select reason" })),
                            React.createElement(select_1.SelectContent, null,
                                React.createElement(select_1.SelectItem, { value: "quality-shortage" }, "Quality Shortage"),
                                React.createElement(select_1.SelectItem, { value: "price-adjustment" }, "Price Adjustment"),
                                React.createElement(select_1.SelectItem, { value: "damaged" }, "Damaged Goods"),
                                React.createElement(select_1.SelectItem, { value: "underdelivery" }, "Under-delivery"),
                                React.createElement(select_1.SelectItem, { value: "penalty" }, "Penalty")))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement("div", { className: "flex items-center justify-between" },
                        React.createElement(card_1.CardTitle, null, "Line Items"),
                        React.createElement(button_1.Button, { type: "button", variant: "outline", size: "sm", onClick: addItem },
                            React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-1" }),
                            " Add Item"))),
                React.createElement(card_1.CardContent, null,
                    React.createElement(table_1.Table, null,
                        React.createElement(table_1.TableHeader, null,
                            React.createElement(table_1.TableRow, null,
                                React.createElement(table_1.TableHead, { className: "w-[40%]" }, "Description"),
                                React.createElement(table_1.TableHead, null, "Qty"),
                                React.createElement(table_1.TableHead, null, "Unit Price"),
                                React.createElement(table_1.TableHead, null, "Total"),
                                React.createElement(table_1.TableHead, { className: "w-10" }))),
                        React.createElement(table_1.TableBody, null, items.map(function (item, idx) { return (React.createElement(table_1.TableRow, { key: item.id },
                            React.createElement(table_1.TableCell, null,
                                React.createElement(input_1.Input, { value: item.description, onChange: function (e) { return updateItem(idx, "description", e.target.value); }, placeholder: "Item description" })),
                            React.createElement(table_1.TableCell, null,
                                React.createElement(input_1.Input, { type: "number", min: 1, value: item.quantity, onChange: function (e) { return updateItem(idx, "quantity", Number(e.target.value)); }, className: "w-20" })),
                            React.createElement(table_1.TableCell, null,
                                React.createElement(input_1.Input, { type: "number", min: 0, step: 0.01, value: item.unitPrice, onChange: function (e) { return updateItem(idx, "unitPrice", Number(e.target.value)); }, className: "w-28" })),
                            React.createElement(table_1.TableCell, { className: "font-medium" }, item.total.toFixed(2)),
                            React.createElement(table_1.TableCell, null, items.length > 1 && (React.createElement(button_1.Button, { type: "button", variant: "ghost", size: "icon", onClick: function () { return removeItem(idx); } },
                                React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4 text-destructive" })))))); }))),
                    React.createElement("div", { className: "text-right mt-4 text-lg font-semibold" },
                        "Total: ",
                        total.toFixed(2)))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement(card_1.CardTitle, null, "Additional")),
                React.createElement(card_1.CardContent, null,
                    React.createElement(label_1.Label, { htmlFor: "notes" }, "Notes"),
                    React.createElement(RichTextEditor_1.RichTextEditor, { value: formData.notes, onChange: function (html) { return update("notes", html); }, minHeight: "100px" }))))));
}
exports["default"] = CreateDebitNote;
