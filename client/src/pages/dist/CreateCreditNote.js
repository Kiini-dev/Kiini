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
var ModuleLayout_1 = require("@/components/ModuleLayout");
var react_1 = require("react");
var wouter_1 = require("wouter");
var trpc_1 = require("@/lib/trpc");
var button_1 = require("@/components/ui/button");
var card_1 = require("@/components/ui/card");
var separator_1 = require("@/components/ui/separator");
var collapsible_1 = require("@/components/ui/collapsible");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var RichTextEditor_1 = require("@/components/RichTextEditor");
var select_1 = require("@/components/ui/select");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
function createEmptyItem() {
    return { id: crypto.randomUUID(), description: "", quantity: 1, rate: 0, taxRate: 0, amount: 0, taxAmount: 0 };
}
function CreateCreditNote() {
    var _a;
    var _b = wouter_1.useLocation(), setLocation = _b[1];
    var _c = react_1.useState(""), creditNoteNumber = _c[0], setCreditNoteNumber = _c[1];
    var _d = react_1.useState(new Date().toISOString().split("T")[0]), issueDate = _d[0], setIssueDate = _d[1];
    var _e = react_1.useState(""), clientId = _e[0], setClientId = _e[1];
    var _f = react_1.useState(""), clientName = _f[0], setClientName = _f[1];
    var _g = react_1.useState(""), invoiceId = _g[0], setInvoiceId = _g[1];
    var _h = react_1.useState("other"), reason = _h[0], setReason = _h[1];
    var _j = react_1.useState(""), notes = _j[0], setNotes = _j[1];
    var _k = react_1.useState([createEmptyItem()]), items = _k[0], setItems = _k[1];
    var _l = react_1.useState(false), submitting = _l[0], setSubmitting = _l[1];
    var _m = react_1.useState("existing"), clientMode = _m[0], setClientMode = _m[1];
    var _o = react_1.useState(""), newClientName = _o[0], setNewClientName = _o[1];
    var _p = react_1.useState(""), newClientEmail = _p[0], setNewClientEmail = _p[1];
    var _q = react_1.useState(false), showAdditionalInfo = _q[0], setShowAdditionalInfo = _q[1];
    var nextNumberQuery = trpc_1.trpc.creditNotes.getNextNumber.useQuery(undefined, {
        onSuccess: function (num) { if (!creditNoteNumber)
            setCreditNoteNumber(num); }
    });
    var clientsQuery = trpc_1.trpc.clients.list.useQuery({ page: 1, limit: 500 });
    var clients = ((_a = clientsQuery.data) === null || _a === void 0 ? void 0 : _a.clients) || clientsQuery.data || [];
    var createMut = trpc_1.trpc.creditNotes.create.useMutation({
        onSuccess: function () {
            sonner_1.toast.success("Credit note created successfully");
            setLocation("/credit-notes");
        },
        onError: function (err) { return sonner_1.toast.error(err.message); },
        onSettled: function () { return setSubmitting(false); }
    });
    var updateItem = function (id, field, value) {
        setItems(function (prev) { return prev.map(function (item) {
            var _a;
            if (item.id !== id)
                return item;
            var updated = __assign(__assign({}, item), (_a = {}, _a[field] = value, _a));
            updated.amount = updated.quantity * updated.rate;
            updated.taxAmount = Math.round(updated.amount * (updated.taxRate / 100));
            return updated;
        }); });
    };
    var addItem = function () { return setItems(function (prev) { return __spreadArrays(prev, [createEmptyItem()]); }); };
    var removeItem = function (id) {
        if (items.length <= 1)
            return;
        setItems(function (prev) { return prev.filter(function (i) { return i.id !== id; }); });
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
        createMut.mutate({
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
            status: "draft"
        });
    };
    return (React.createElement(ModuleLayout_1["default"], { title: "Create Credit Note", description: "Issue a new credit note with line items", icon: React.createElement(lucide_react_1.FileText, { className: "w-6 h-6" }), breadcrumbs: [
            { label: "Dashboard", href: "/crm-home" },
            { label: "Accounting", href: "/accounting" },
            { label: "Credit Notes", href: "/credit-notes" },
            { label: "Create" },
        ] },
        React.createElement("div", { className: "max-w-5xl space-y-6" },
            React.createElement(card_1.Card, { className: "p-6" },
                React.createElement("div", { className: "space-y-4 mb-6" },
                    React.createElement("div", { className: "flex items-center justify-between" },
                        React.createElement(label_1.Label, { className: "text-base font-semibold" }, "Client"),
                        React.createElement("div", { className: "flex gap-1 text-sm" },
                            React.createElement("button", { type: "button", className: "px-3 py-1 rounded-l-md border text-xs font-medium transition-colors " + (clientMode === "existing" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"), onClick: function () { return setClientMode("existing"); } }, "Existing Client"),
                            React.createElement("button", { type: "button", className: "px-3 py-1 rounded-r-md border text-xs font-medium transition-colors " + (clientMode === "new" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"), onClick: function () { return setClientMode("new"); } }, "New Client"))),
                    clientMode === "existing" ? (React.createElement("div", { className: "grid gap-3" },
                        React.createElement("div", { className: "grid grid-cols-[140px_1fr] items-center gap-3" },
                            React.createElement(label_1.Label, { className: "text-right text-sm" }, "Client *"),
                            React.createElement(select_1.Select, { value: clientId, onValueChange: function (v) {
                                    setClientId(v);
                                    var c = clients.find(function (c) { return c.id === v; });
                                    if (c)
                                        setClientName(c.companyName || c.name || "");
                                } },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, { placeholder: "Search or select client..." })),
                                React.createElement(select_1.SelectContent, null, clients.map(function (c) { return (React.createElement(select_1.SelectItem, { key: c.id, value: c.id },
                                    React.createElement("span", { className: "flex items-center gap-2" },
                                        React.createElement(lucide_react_1.Building2, { className: "h-3 w-3 text-muted-foreground" }),
                                        c.companyName || c.name))); })))))) : (React.createElement("div", { className: "grid gap-3 p-4 bg-muted/30 rounded-lg border border-dashed" },
                        React.createElement("div", { className: "grid grid-cols-[140px_1fr] items-center gap-3" },
                            React.createElement(label_1.Label, { className: "text-right text-sm" }, "Name *"),
                            React.createElement(input_1.Input, { value: newClientName, onChange: function (e) { setNewClientName(e.target.value); setClientName(e.target.value); }, placeholder: "Client or company name" })),
                        React.createElement("div", { className: "grid grid-cols-[140px_1fr] items-center gap-3" },
                            React.createElement(label_1.Label, { className: "text-right text-sm" }, "Email"),
                            React.createElement(input_1.Input, { type: "email", value: newClientEmail, onChange: function (e) { return setNewClientEmail(e.target.value); }, placeholder: "Email address" }))))),
                React.createElement(separator_1.Separator, { className: "my-4" }),
                React.createElement("div", { className: "grid gap-4" },
                    React.createElement("div", { className: "grid grid-cols-[140px_1fr] items-center gap-3" },
                        React.createElement(label_1.Label, { className: "text-right text-sm" }, "Number *"),
                        React.createElement(input_1.Input, { value: creditNoteNumber, onChange: function (e) { return setCreditNoteNumber(e.target.value); }, placeholder: "CN-00001", className: "max-w-xs" })),
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
                        React.createElement(label_1.Label, { className: "text-right text-sm" }, "Invoice"),
                        React.createElement(input_1.Input, { value: invoiceId, onChange: function (e) { return setInvoiceId(e.target.value); }, placeholder: "Related invoice (optional)", className: "max-w-xs" }))),
                React.createElement(separator_1.Separator, { className: "my-4" }),
                React.createElement(collapsible_1.Collapsible, { open: showAdditionalInfo, onOpenChange: setShowAdditionalInfo },
                    React.createElement(collapsible_1.CollapsibleTrigger, { asChild: true },
                        React.createElement("button", { type: "button", className: "flex items-center justify-between w-full py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" },
                            React.createElement("span", null, "Additional Information"),
                            showAdditionalInfo ? React.createElement(lucide_react_1.ChevronUp, { className: "h-4 w-4" }) : React.createElement(lucide_react_1.ChevronDown, { className: "h-4 w-4" }))),
                    React.createElement(collapsible_1.CollapsibleContent, { className: "space-y-4 pt-3" },
                        React.createElement("div", { className: "grid grid-cols-[140px_1fr] items-start gap-3" },
                            React.createElement(label_1.Label, { className: "text-right text-sm pt-2" }, "Notes"),
                            React.createElement(RichTextEditor_1.RichTextEditor, { value: notes, onChange: function (html) { return setNotes(html); }, minHeight: "100px", placeholder: "Additional notes..." }))))),
            React.createElement(card_1.Card, null,
                React.createElement(card_1.CardHeader, null,
                    React.createElement("div", { className: "flex justify-between items-center" },
                        React.createElement(card_1.CardTitle, null, "Line Items"),
                        React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: addItem },
                            React.createElement(lucide_react_1.Plus, { className: "w-4 h-4 mr-1" }),
                            " Add Item"))),
                React.createElement(card_1.CardContent, null,
                    React.createElement("div", { className: "grid grid-cols-12 gap-2 mb-2 text-xs font-medium text-muted-foreground" },
                        React.createElement("div", { className: "col-span-4" }, "Description"),
                        React.createElement("div", { className: "col-span-1" }, "Qty"),
                        React.createElement("div", { className: "col-span-2" }, "Rate (KES)"),
                        React.createElement("div", { className: "col-span-1" }, "Tax %"),
                        React.createElement("div", { className: "col-span-2" }, "Amount"),
                        React.createElement("div", { className: "col-span-1" }, "Tax"),
                        React.createElement("div", { className: "col-span-1" })),
                    items.map(function (item) { return (React.createElement("div", { key: item.id, className: "grid grid-cols-12 gap-2 mb-2" },
                        React.createElement(input_1.Input, { className: "col-span-4", placeholder: "Description", value: item.description, onChange: function (e) { return updateItem(item.id, "description", e.target.value); } }),
                        React.createElement(input_1.Input, { className: "col-span-1", type: "number", min: "1", value: item.quantity, onChange: function (e) { return updateItem(item.id, "quantity", parseFloat(e.target.value) || 0); } }),
                        React.createElement(input_1.Input, { className: "col-span-2", type: "number", min: "0", step: "0.01", value: item.rate, onChange: function (e) { return updateItem(item.id, "rate", parseFloat(e.target.value) || 0); } }),
                        React.createElement(input_1.Input, { className: "col-span-1", type: "number", min: "0", max: "100", value: item.taxRate, onChange: function (e) { return updateItem(item.id, "taxRate", parseFloat(e.target.value) || 0); } }),
                        React.createElement("div", { className: "col-span-2 flex items-center text-sm font-medium" },
                            "Ksh ",
                            item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })),
                        React.createElement("div", { className: "col-span-1 flex items-center text-sm text-muted-foreground" }, item.taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })),
                        React.createElement("div", { className: "col-span-1 flex items-center" },
                            React.createElement(button_1.Button, { variant: "ghost", size: "icon", onClick: function () { return removeItem(item.id); }, disabled: items.length <= 1 },
                                React.createElement(lucide_react_1.Trash2, { className: "w-4 h-4 text-red-500" }))))); }),
                    React.createElement("div", { className: "border-t pt-4 mt-4 space-y-1 text-right" },
                        React.createElement("p", { className: "text-sm" },
                            "Subtotal: ",
                            React.createElement("span", { className: "font-medium" },
                                "Ksh ",
                                subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 }))),
                        React.createElement("p", { className: "text-sm" },
                            "Tax: ",
                            React.createElement("span", { className: "font-medium" },
                                "Ksh ",
                                totalTax.toLocaleString(undefined, { minimumFractionDigits: 2 }))),
                        React.createElement("p", { className: "text-lg font-bold" },
                            "Total: Ksh ",
                            total.toLocaleString(undefined, { minimumFractionDigits: 2 }))))),
            React.createElement("div", { className: "flex gap-3 justify-end" },
                React.createElement(button_1.Button, { variant: "outline", onClick: function () { return setLocation("/credit-notes"); } }, "Cancel"),
                React.createElement(button_1.Button, { onClick: handleSubmit, disabled: submitting }, submitting ? "Creating..." : "Create Credit Note")))));
}
exports["default"] = CreateCreditNote;
