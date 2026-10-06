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
var card_1 = require("@/components/ui/card");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var RichTextEditor_1 = require("@/components/RichTextEditor");
var separator_1 = require("@/components/ui/separator");
var select_1 = require("@/components/ui/select");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("@/lib/trpc");
var sonner_1 = require("sonner");
var spinner_1 = require("@/components/ui/spinner");
function createEmptyItem() {
    return { id: crypto.randomUUID(), description: "", quantity: 1, rate: 0, taxRate: 0, amount: 0, taxAmount: 0 };
}
function EditCreditNote() {
    var _a;
    var id = wouter_1.useParams().id;
    var _b = wouter_1.useLocation(), setLocation = _b[1];
    var _c = react_1.useState(""), creditNoteNumber = _c[0], setCreditNoteNumber = _c[1];
    var _d = react_1.useState(""), issueDate = _d[0], setIssueDate = _d[1];
    var _e = react_1.useState(""), clientId = _e[0], setClientId = _e[1];
    var _f = react_1.useState(""), clientName = _f[0], setClientName = _f[1];
    var _g = react_1.useState(""), invoiceId = _g[0], setInvoiceId = _g[1];
    var _h = react_1.useState("other"), reason = _h[0], setReason = _h[1];
    var _j = react_1.useState(""), notes = _j[0], setNotes = _j[1];
    var _k = react_1.useState("draft"), status = _k[0], setStatus = _k[1];
    var _l = react_1.useState([createEmptyItem()]), items = _l[0], setItems = _l[1];
    var _m = react_1.useState(false), submitting = _m[0], setSubmitting = _m[1];
    var _o = trpc_1.trpc.creditNotes.get.useQuery({ id: id || "" }, { enabled: !!id }), creditNote = _o.data, isLoading = _o.isLoading;
    var clientsQuery = trpc_1.trpc.clients.list.useQuery({ page: 1, limit: 500 });
    var clients = ((_a = clientsQuery.data) === null || _a === void 0 ? void 0 : _a.clients) || clientsQuery.data || [];
    react_1.useEffect(function () {
        if (creditNote) {
            var cn = creditNote;
            setCreditNoteNumber(cn.creditNoteNumber || "");
            setIssueDate(cn.issueDate ? cn.issueDate.split("T")[0] : "");
            setClientId(cn.clientId || "");
            setClientName(cn.clientName || "");
            setInvoiceId(cn.invoiceId || "");
            setReason(cn.reason || "other");
            setNotes(cn.notes || "");
            setStatus(cn.status || "draft");
            if (cn.items && cn.items.length > 0) {
                setItems(cn.items.map(function (item) { return ({
                    id: item.id || crypto.randomUUID(),
                    description: item.description || "",
                    quantity: item.quantity || 1,
                    rate: Number(item.rate) / 100,
                    taxRate: item.taxRate || 0,
                    amount: Number(item.amount) / 100,
                    taxAmount: Number(item.taxAmount) / 100
                }); }));
            }
        }
    }, [creditNote]);
    var updateMut = trpc_1.trpc.creditNotes.update.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Credit note updated successfully");
            setLocation("/credit-notes");
        },
        onError: function (err) { return sonner_1.toast.error(err.message); },
        onSettled: function () { return setSubmitting(false); }
    });
    var updateItem = function (itemId, field, value) {
        setItems(function (prev) {
            return prev.map(function (item) {
                var _a;
                if (item.id !== itemId)
                    return item;
                var updated = __assign(__assign({}, item), (_a = {}, _a[field] = value, _a));
                updated.amount = updated.quantity * updated.rate;
                updated.taxAmount = Math.round(updated.amount * (updated.taxRate / 100) * 100) / 100;
                return updated;
            });
        });
    };
    var addItem = function () { return setItems(function (prev) { return __spreadArrays(prev, [createEmptyItem()]); }); };
    var removeItem = function (itemId) {
        if (items.length <= 1)
            return;
        setItems(function (prev) { return prev.filter(function (i) { return i.id !== itemId; }); });
    };
    var subtotal = items.reduce(function (s, i) { return s + i.amount; }, 0);
    var totalTax = items.reduce(function (s, i) { return s + i.taxAmount; }, 0);
    var total = subtotal + totalTax;
    var handleSubmit = function () {
        if (!creditNoteNumber || !clientId || !clientName || !reason) {
            sonner_1.toast.error("Please fill in all required fields");
            return;
        }
        if (items.some(function (i) { return !i.description || i.rate <= 0; })) {
            sonner_1.toast.error("Each line item must have a description and rate > 0");
            return;
        }
        setSubmitting(true);
        updateMut.mutate({
            id: id,
            creditNoteNumber: creditNoteNumber,
            issueDate: issueDate + "T00:00:00",
            clientId: clientId,
            clientName: clientName,
            invoiceId: invoiceId || undefined,
            reason: reason,
            items: items.map(function (i) { return ({
                description: i.description,
                quantity: i.quantity,
                rate: Math.round(i.rate * 100),
                amount: Math.round(i.amount * 100),
                taxRate: i.taxRate,
                taxAmount: Math.round(i.taxAmount * 100)
            }); }),
            subtotal: Math.round(subtotal * 100),
            taxAmount: Math.round(totalTax * 100),
            total: Math.round(total * 100),
            notes: notes || undefined,
            status: status
        });
    };
    if (isLoading) {
        return React.createElement("div", { className: "flex items-center justify-center h-screen" },
            React.createElement(spinner_1.Spinner, null));
    }
    return (React.createElement(ModuleLayout_1["default"], { title: "Edit Credit Note", description: "Update credit note details", icon: React.createElement(lucide_react_1.FileText, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Accounting", href: "/accounting" },
            { label: "Credit Notes", href: "/credit-notes" },
            { label: "Edit" },
        ] },
        React.createElement("div", { className: "max-w-5xl space-y-6" },
            React.createElement(card_1.Card, { className: "p-6" },
                React.createElement("div", { className: "grid gap-4" },
                    React.createElement("div", { className: "grid grid-cols-[140px_1fr] items-center gap-3" },
                        React.createElement(label_1.Label, { className: "text-right text-sm" }, "Client *"),
                        React.createElement(select_1.Select, { value: clientId, onValueChange: function (v) {
                                setClientId(v);
                                var c = clients.find(function (c) { return c.id === v; });
                                if (c)
                                    setClientName(c.companyName || c.name || "");
                            } },
                            React.createElement(select_1.SelectTrigger, null,
                                React.createElement(select_1.SelectValue, { placeholder: "Select client..." })),
                            React.createElement(select_1.SelectContent, null, clients.map(function (c) { return (React.createElement(select_1.SelectItem, { key: c.id, value: c.id }, c.companyName || c.name)); })))),
                    React.createElement("div", { className: "grid grid-cols-[140px_1fr] items-center gap-3" },
                        React.createElement(label_1.Label, { className: "text-right text-sm" }, "Number *"),
                        React.createElement(input_1.Input, { value: creditNoteNumber, onChange: function (e) { return setCreditNoteNumber(e.target.value); }, className: "max-w-xs" })),
                    React.createElement("div", { className: "grid grid-cols-[140px_1fr] items-center gap-3" },
                        React.createElement(label_1.Label, { className: "text-right text-sm" }, "Issue Date *"),
                        React.createElement(input_1.Input, { type: "date", value: issueDate, onChange: function (e) { return setIssueDate(e.target.value); }, className: "max-w-xs" })),
                    React.createElement("div", { className: "grid grid-cols-[140px_1fr] items-center gap-3" },
                        React.createElement(label_1.Label, { className: "text-right text-sm" }, "Reason *"),
                        React.createElement(select_1.Select, { value: reason, onValueChange: setReason },
                            React.createElement(select_1.SelectTrigger, { className: "max-w-xs" },
                                React.createElement(select_1.SelectValue, null)),
                            React.createElement(select_1.SelectContent, null,
                                React.createElement(select_1.SelectItem, { value: "goods-returned" }, "Goods Returned"),
                                React.createElement(select_1.SelectItem, { value: "service-cancelled" }, "Service Cancelled"),
                                React.createElement(select_1.SelectItem, { value: "discount" }, "Discount"),
                                React.createElement(select_1.SelectItem, { value: "quality-issue" }, "Quality Issue"),
                                React.createElement(select_1.SelectItem, { value: "error" }, "Billing Error"),
                                React.createElement(select_1.SelectItem, { value: "other" }, "Other")))),
                    React.createElement("div", { className: "grid grid-cols-[140px_1fr] items-center gap-3" },
                        React.createElement(label_1.Label, { className: "text-right text-sm" }, "Status"),
                        React.createElement(select_1.Select, { value: status, onValueChange: function (v) { return setStatus(v); } },
                            React.createElement(select_1.SelectTrigger, { className: "max-w-xs" },
                                React.createElement(select_1.SelectValue, null)),
                            React.createElement(select_1.SelectContent, null,
                                React.createElement(select_1.SelectItem, { value: "draft" }, "Draft"),
                                React.createElement(select_1.SelectItem, { value: "approved" }, "Approved")))),
                    React.createElement("div", { className: "grid grid-cols-[140px_1fr] items-center gap-3" },
                        React.createElement(label_1.Label, { className: "text-right text-sm" }, "Invoice"),
                        React.createElement(input_1.Input, { value: invoiceId, onChange: function (e) { return setInvoiceId(e.target.value); }, placeholder: "Related invoice (optional)", className: "max-w-xs" }))),
                React.createElement(separator_1.Separator, { className: "my-4" }),
                React.createElement("div", { className: "grid grid-cols-[140px_1fr] items-start gap-3" },
                    React.createElement(label_1.Label, { className: "text-right text-sm pt-2" }, "Notes"),
                    React.createElement(RichTextEditor_1.RichTextEditor, { value: notes, onChange: function (html) { return setNotes(html); }, minHeight: "100px", placeholder: "Additional notes..." }))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement("div", { className: "flex flex-wrap justify-between items-center gap-2" },
                        React.createElement(card_1.CardTitle, null, "Line Items"),
                        React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: addItem },
                            React.createElement(lucide_react_1.Plus, { className: "w-4 h-4 mr-1" }),
                            " Add Item"))),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "overflow-x-auto" },
                        React.createElement("div", { className: "min-w-[760px]" },
                            React.createElement("div", { className: "grid grid-cols-12 gap-2 mb-2 text-xs font-medium text-muted-foreground" },
                                React.createElement("div", { className: "col-span-4" }, "Description"),
                                React.createElement("div", { className: "col-span-1" }, "Qty"),
                                React.createElement("div", { className: "col-span-2" }, "Rate (KES)"),
                                React.createElement("div", { className: "col-span-1" }, "Tax %"),
                                React.createElement("div", { className: "col-span-2" }, "Amount"),
                                React.createElement("div", { className: "col-span-1" }, "Tax"),
                                React.createElement("div", { className: "col-span-1" })),
                            items.map(function (item) { return (React.createElement("div", { key: item.id, className: "grid grid-cols-12 gap-2 mb-2" },
                                React.createElement("div", { className: "col-span-4" },
                                    React.createElement(input_1.Input, { value: item.description, onChange: function (e) { return updateItem(item.id, "description", e.target.value); }, placeholder: "Description" })),
                                React.createElement("div", { className: "col-span-1" },
                                    React.createElement(input_1.Input, { type: "number", min: 1, value: item.quantity, onChange: function (e) { return updateItem(item.id, "quantity", Number(e.target.value)); } })),
                                React.createElement("div", { className: "col-span-2" },
                                    React.createElement(input_1.Input, { type: "number", min: 0, step: 0.01, value: item.rate, onChange: function (e) { return updateItem(item.id, "rate", Number(e.target.value)); } })),
                                React.createElement("div", { className: "col-span-1" },
                                    React.createElement(input_1.Input, { type: "number", min: 0, max: 100, value: item.taxRate, onChange: function (e) { return updateItem(item.id, "taxRate", Number(e.target.value)); } })),
                                React.createElement("div", { className: "col-span-2" },
                                    React.createElement(input_1.Input, { value: item.amount.toFixed(2), readOnly: true, className: "bg-muted" })),
                                React.createElement("div", { className: "col-span-1" },
                                    React.createElement(input_1.Input, { value: item.taxAmount.toFixed(2), readOnly: true, className: "bg-muted" })),
                                React.createElement("div", { className: "col-span-1 flex items-center" }, items.length > 1 && (React.createElement(button_1.Button, { type: "button", variant: "ghost", size: "icon", onClick: function () { return removeItem(item.id); } },
                                    React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4 text-destructive" })))))); }))),
                    React.createElement(separator_1.Separator, { className: "my-4" }),
                    React.createElement("div", { className: "space-y-1 text-right" },
                        React.createElement("p", { className: "text-sm" },
                            "Subtotal: KES ",
                            subtotal.toFixed(2)),
                        React.createElement("p", { className: "text-sm" },
                            "Tax: KES ",
                            totalTax.toFixed(2)),
                        React.createElement("p", { className: "text-lg font-bold" },
                            "Total: KES ",
                            total.toFixed(2))))),
            React.createElement("div", { className: "flex justify-end gap-3" },
                React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setLocation("/credit-notes"); } }, "Cancel"),
                React.createElement(button_1.Button, { onClick: handleSubmit, disabled: submitting },
                    submitting && React.createElement(spinner_1.Spinner, { className: "mr-2 h-4 w-4" }),
                    "Save Changes")))));
}
exports["default"] = EditCreditNote;
