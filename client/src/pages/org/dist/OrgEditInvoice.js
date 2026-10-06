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
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var card_1 = require("@/components/ui/card");
var select_1 = require("@/components/ui/select");
var trpc_1 = require("@/lib/trpc");
var useOrgPermission_1 = require("@/hooks/useOrgPermission");
var sonner_1 = require("sonner");
var lucide_react_1 = require("lucide-react");
var textarea_1 = require("@/components/ui/textarea");
var skeleton_1 = require("@/components/ui/skeleton");
function OrgEditInvoice() {
    var _this = this;
    var params = wouter_1.useParams();
    var slug = params.slug;
    var invoiceId = params.id;
    var _a = wouter_1.useLocation(), setLocation = _a[1];
    var _b = useOrgPermission_1.useOrgPermission(), checkPermission = _b.checkPermission, hasPermission = _b.hasPermission;
    var _c = react_1.useState({
        clientId: "",
        invoiceNumber: "",
        issueDate: "",
        dueDate: "",
        status: "draft",
        notes: "",
        lineItems: []
    }), form = _c[0], setForm = _c[1];
    var _d = react_1.useState(false), isSubmitting = _d[0], setIsSubmitting = _d[1];
    var _e = trpc_1.trpc.invoices.getWithItems.useQuery(invoiceId, {
        enabled: !!invoiceId && hasPermission("org:invoices:view")
    }), invoice = _e.data, isLoading = _e.isLoading;
    var _f = trpc_1.trpc.clients.list.useQuery(undefined, {
        enabled: hasPermission("org:clients:view"),
        staleTime: 60000
    }).data, clients = _f === void 0 ? [] : _f;
    var updateMutation = trpc_1.trpc.invoices.update.useMutation({
        onSuccess: function (data) {
            sonner_1.toast.success("Invoice updated", { description: "Invoice updated successfully." });
            setLocation("/org/" + slug + "/invoices/" + invoiceId);
        },
        onError: function (err) {
            sonner_1.toast.error("Failed to update invoice", { description: err.message });
            setIsSubmitting(false);
        }
    });
    // Load invoice data into form
    react_1.useEffect(function () {
        var _a;
        if (invoice) {
            setForm({
                clientId: invoice.clientId || "",
                invoiceNumber: invoice.invoiceNumber || "",
                issueDate: invoice.issueDate ? new Date(invoice.issueDate).toISOString().split("T")[0] : "",
                dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split("T")[0] : "",
                status: invoice.status || "draft",
                notes: invoice.notes || "",
                lineItems: ((_a = invoice.items) === null || _a === void 0 ? void 0 : _a.map(function (item, index) { return ({
                    id: item.id || "item-" + index,
                    description: item.description || "",
                    quantity: item.quantity || 1,
                    unitPrice: item.unitPrice || 0,
                    total: (item.quantity || 1) * (item.unitPrice || 0)
                }); })) || []
            });
        }
    }, [invoice]);
    var handleAddLineItem = function () {
        var newId = "new-" + Date.now();
        setForm(function (f) { return (__assign(__assign({}, f), { lineItems: __spreadArrays(f.lineItems, [{ id: newId, description: "", quantity: 1, unitPrice: 0, total: 0 }]) })); });
    };
    var handleRemoveLineItem = function (id) {
        setForm(function (f) { return (__assign(__assign({}, f), { lineItems: f.lineItems.filter(function (l) { return l.id !== id; }) })); });
    };
    var handleUpdateLineItem = function (id, updates) {
        setForm(function (f) { return (__assign(__assign({}, f), { lineItems: f.lineItems.map(function (l) { var _a, _b; return l.id === id ? __assign(__assign(__assign({}, l), updates), { total: ((_a = updates.quantity) !== null && _a !== void 0 ? _a : l.quantity) * ((_b = updates.unitPrice) !== null && _b !== void 0 ? _b : l.unitPrice) }) : l; }) })); });
    };
    var totalAmount = form.lineItems.reduce(function (sum, item) { return sum + item.total; }, 0);
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            e.preventDefault();
            if (!checkPermission("org:invoices:edit", "edit invoices")) {
                return [2 /*return*/];
            }
            if (!form.clientId) {
                sonner_1.toast.error("Missing required fields", { description: "Please select a client." });
                return [2 /*return*/];
            }
            if (form.lineItems.length === 0) {
                sonner_1.toast.error("Missing line items", { description: "Add at least one line item." });
                return [2 /*return*/];
            }
            setIsSubmitting(true);
            updateMutation.mutate({
                id: invoiceId,
                clientId: form.clientId,
                invoiceNumber: form.invoiceNumber,
                issueDate: form.issueDate ? new Date(form.issueDate) : undefined,
                dueDate: form.dueDate ? new Date(form.dueDate) : undefined,
                status: form.status,
                notes: form.notes || undefined,
                lineItems: form.lineItems.map(function (item) { return ({
                    description: item.description,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice
                }); }),
                total: totalAmount
            });
            return [2 /*return*/];
        });
    }); };
    if (isLoading) {
        return (react_1["default"].createElement(OrgLayout_1["default"], { title: "Edit Invoice", showOrgInfo: false },
            react_1["default"].createElement("div", { className: "space-y-6" },
                react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-6 w-48 bg-white/5" }),
                react_1["default"].createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
                    react_1["default"].createElement(card_1.CardContent, { className: "p-6" },
                        react_1["default"].createElement("div", { className: "space-y-4" },
                            react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-4 w-full bg-white/5" }),
                            react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-4 w-3/4 bg-white/5" }),
                            react_1["default"].createElement(skeleton_1.Skeleton, { className: "h-4 w-1/2 bg-white/5" })))))));
    }
    if (!hasPermission("org:invoices:edit")) {
        return (react_1["default"].createElement(OrgLayout_1["default"], { title: "Edit Invoice", showOrgInfo: false },
            react_1["default"].createElement("div", { className: "space-y-6" },
                react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                    react_1["default"].createElement(OrgBreadcrumb_1["default"], { slug: slug, items: [{ label: "Invoices", href: "/org/" + slug + "/invoices" }, { label: "Edit Invoice" }] }),
                    react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", className: "text-white/50 hover:text-white", onClick: function () { return setLocation("/org/" + slug + "/dashboard"); } },
                        react_1["default"].createElement(lucide_react_1.ArrowLeft, { className: "h-4 w-4 mr-1" }),
                        " Back")),
                react_1["default"].createElement("div", { className: "rounded-2xl border border-white/10 bg-white/5 p-10 text-center" },
                    react_1["default"].createElement(lucide_react_1.FileText, { className: "mx-auto h-12 w-12 text-white/30" }),
                    react_1["default"].createElement("h2", { className: "mt-5 text-xl font-semibold text-white" }, "Access Denied"),
                    react_1["default"].createElement("p", { className: "mt-2 text-sm text-white/60" }, "You do not have permission to edit invoices.")))));
    }
    if (!invoice) {
        return (react_1["default"].createElement(OrgLayout_1["default"], { title: "Invoice Not Found", showOrgInfo: false },
            react_1["default"].createElement("div", { className: "text-center py-16" },
                react_1["default"].createElement(lucide_react_1.AlertCircle, { className: "h-12 w-12 text-white/20 mx-auto mb-4" }),
                react_1["default"].createElement("p", { className: "text-white/40" }, "Invoice not found or access denied."),
                react_1["default"].createElement(button_1.Button, { variant: "ghost", className: "mt-4 text-white/50 hover:text-white", onClick: function () { return setLocation("/org/" + slug + "/invoices"); } }, "Back to Invoices"))));
    }
    return (react_1["default"].createElement(OrgLayout_1["default"], { title: "Edit Invoice", showOrgInfo: false },
        react_1["default"].createElement("div", { className: "space-y-6" },
            react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                react_1["default"].createElement("div", null,
                    react_1["default"].createElement(OrgBreadcrumb_1["default"], { slug: slug, items: [
                            { label: "Invoices", href: "/org/" + slug + "/invoices" },
                            { label: "Edit " + (invoice.invoiceNumber || "Invoice " + invoice.id.slice(-8)) },
                        ] })),
                react_1["default"].createElement(button_1.Button, { variant: "ghost", size: "sm", className: "text-white/50 hover:text-white", onClick: function () { return setLocation("/org/" + slug + "/invoices/" + invoiceId); } },
                    react_1["default"].createElement(lucide_react_1.ArrowLeft, { className: "h-4 w-4 mr-1" }),
                    " Back")),
            react_1["default"].createElement(card_1.Card, { className: "bg-white/5 border-white/10" },
                react_1["default"].createElement(card_1.CardHeader, null,
                    react_1["default"].createElement(card_1.CardTitle, { className: "flex items-center gap-2" },
                        react_1["default"].createElement(lucide_react_1.FileText, { className: "h-5 w-5" }),
                        "Edit Invoice"),
                    react_1["default"].createElement(card_1.CardDescription, null, "Update invoice details and line items")),
                react_1["default"].createElement(card_1.CardContent, null,
                    react_1["default"].createElement("form", { onSubmit: handleSubmit, className: "space-y-6" },
                        react_1["default"].createElement("div", { className: "grid gap-4 sm:grid-cols-2" },
                            react_1["default"].createElement("div", { className: "space-y-2" },
                                react_1["default"].createElement(label_1.Label, { htmlFor: "client" }, "Client *"),
                                react_1["default"].createElement(select_1.Select, { value: form.clientId, onValueChange: function (clientId) { return setForm(function (f) { return (__assign(__assign({}, f), { clientId: clientId })); }); } },
                                    react_1["default"].createElement(select_1.SelectTrigger, { className: "bg-white/5 border-white/10 text-white" },
                                        react_1["default"].createElement(select_1.SelectValue, { placeholder: "Select client" })),
                                    react_1["default"].createElement(select_1.SelectContent, null, clients.map(function (client) { return (react_1["default"].createElement(select_1.SelectItem, { key: client.id, value: client.id }, client.name)); })))),
                            react_1["default"].createElement("div", { className: "space-y-2" },
                                react_1["default"].createElement(label_1.Label, { htmlFor: "invoiceNumber" }, "Invoice Number"),
                                react_1["default"].createElement(input_1.Input, { id: "invoiceNumber", value: form.invoiceNumber, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { invoiceNumber: e.target.value })); }); }, className: "bg-white/5 border-white/10 text-white", placeholder: "Auto-generated if empty" })),
                            react_1["default"].createElement("div", { className: "space-y-2" },
                                react_1["default"].createElement(label_1.Label, { htmlFor: "issueDate" }, "Issue Date"),
                                react_1["default"].createElement(input_1.Input, { id: "issueDate", type: "date", value: form.issueDate, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { issueDate: e.target.value })); }); }, className: "bg-white/5 border-white/10 text-white" })),
                            react_1["default"].createElement("div", { className: "space-y-2" },
                                react_1["default"].createElement(label_1.Label, { htmlFor: "dueDate" }, "Due Date"),
                                react_1["default"].createElement(input_1.Input, { id: "dueDate", type: "date", value: form.dueDate, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { dueDate: e.target.value })); }); }, className: "bg-white/5 border-white/10 text-white" })),
                            react_1["default"].createElement("div", { className: "space-y-2" },
                                react_1["default"].createElement(label_1.Label, { htmlFor: "status" }, "Status"),
                                react_1["default"].createElement(select_1.Select, { value: form.status, onValueChange: function (value) { return setForm(function (f) { return (__assign(__assign({}, f), { status: value })); }); } },
                                    react_1["default"].createElement(select_1.SelectTrigger, { className: "bg-white/5 border-white/10 text-white" },
                                        react_1["default"].createElement(select_1.SelectValue, null)),
                                    react_1["default"].createElement(select_1.SelectContent, null,
                                        react_1["default"].createElement(select_1.SelectItem, { value: "draft" }, "Draft"),
                                        react_1["default"].createElement(select_1.SelectItem, { value: "sent" }, "Sent"),
                                        react_1["default"].createElement(select_1.SelectItem, { value: "paid" }, "Paid"),
                                        react_1["default"].createElement(select_1.SelectItem, { value: "partial" }, "Partial"),
                                        react_1["default"].createElement(select_1.SelectItem, { value: "overdue" }, "Overdue"),
                                        react_1["default"].createElement(select_1.SelectItem, { value: "cancelled" }, "Cancelled"))))),
                        react_1["default"].createElement("div", { className: "space-y-2" },
                            react_1["default"].createElement(label_1.Label, { htmlFor: "notes" }, "Notes"),
                            react_1["default"].createElement(textarea_1.Textarea, { id: "notes", value: form.notes, onChange: function (e) { return setForm(function (f) { return (__assign(__assign({}, f), { notes: e.target.value })); }); }, className: "bg-white/5 border-white/10 text-white", placeholder: "Additional notes...", rows: 3 })),
                        react_1["default"].createElement("div", { className: "space-y-4" },
                            react_1["default"].createElement("div", { className: "flex items-center justify-between" },
                                react_1["default"].createElement(label_1.Label, { className: "text-base font-medium" }, "Line Items"),
                                react_1["default"].createElement(button_1.Button, { type: "button", variant: "outline", size: "sm", onClick: handleAddLineItem, className: "text-white border-white/20 hover:bg-white/5" },
                                    react_1["default"].createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-1" }),
                                    "Add Item")),
                            react_1["default"].createElement("div", { className: "space-y-3" }, form.lineItems.map(function (item, index) { return (react_1["default"].createElement("div", { key: item.id, className: "flex gap-3 items-end p-4 bg-white/5 rounded-lg" },
                                react_1["default"].createElement("div", { className: "flex-1" },
                                    react_1["default"].createElement(label_1.Label, { htmlFor: "desc-" + item.id }, "Description"),
                                    react_1["default"].createElement(input_1.Input, { id: "desc-" + item.id, value: item.description, onChange: function (e) { return handleUpdateLineItem(item.id, { description: e.target.value }); }, className: "bg-white/5 border-white/10 text-white", placeholder: "Item description" })),
                                react_1["default"].createElement("div", { className: "w-20" },
                                    react_1["default"].createElement(label_1.Label, { htmlFor: "qty-" + item.id }, "Qty"),
                                    react_1["default"].createElement(input_1.Input, { id: "qty-" + item.id, type: "number", min: "1", value: item.quantity, onChange: function (e) { return handleUpdateLineItem(item.id, { quantity: parseInt(e.target.value) || 1 }); }, className: "bg-white/5 border-white/10 text-white" })),
                                react_1["default"].createElement("div", { className: "w-32" },
                                    react_1["default"].createElement(label_1.Label, { htmlFor: "price-" + item.id }, "Unit Price"),
                                    react_1["default"].createElement(input_1.Input, { id: "price-" + item.id, type: "number", min: "0", step: "0.01", value: item.unitPrice, onChange: function (e) { return handleUpdateLineItem(item.id, { unitPrice: parseFloat(e.target.value) || 0 }); }, className: "bg-white/5 border-white/10 text-white", placeholder: "0.00" })),
                                react_1["default"].createElement("div", { className: "w-24" },
                                    react_1["default"].createElement(label_1.Label, null, "Total"),
                                    react_1["default"].createElement("div", { className: "text-white font-medium p-2" },
                                        "KES ",
                                        item.total.toLocaleString())),
                                react_1["default"].createElement(button_1.Button, { type: "button", variant: "ghost", size: "sm", onClick: function () { return handleRemoveLineItem(item.id); }, className: "text-red-400 hover:text-red-300 hover:bg-red-500/10", disabled: form.lineItems.length === 1 },
                                    react_1["default"].createElement(lucide_react_1.Trash2, { className: "h-4 w-4" })))); })),
                            react_1["default"].createElement("div", { className: "flex justify-end p-4 bg-white/5 rounded-lg" },
                                react_1["default"].createElement("div", { className: "text-right" },
                                    react_1["default"].createElement("div", { className: "text-white/60" }, "Total Amount"),
                                    react_1["default"].createElement("div", { className: "text-xl font-bold text-white" },
                                        "KES ",
                                        totalAmount.toLocaleString())))),
                        react_1["default"].createElement("div", { className: "flex justify-end gap-3 pt-6" },
                            react_1["default"].createElement(button_1.Button, { type: "button", variant: "ghost", onClick: function () { return setLocation("/org/" + slug + "/invoices/" + invoiceId); }, className: "text-white/50 hover:text-white" }, "Cancel"),
                            react_1["default"].createElement(button_1.Button, { type: "submit", disabled: isSubmitting, className: "bg-blue-600 hover:bg-blue-700 text-white" }, isSubmitting ? "Updating..." : "Update Invoice"))))))));
}
exports["default"] = OrgEditInvoice;
