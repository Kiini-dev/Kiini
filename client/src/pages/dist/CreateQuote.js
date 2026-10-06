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
exports.CreateQuote = void 0;
var react_1 = require("react");
var wouter_1 = require("wouter");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("../utils/trpc");
var zod_1 = require("zod");
var sonner_1 = require("sonner");
var card_1 = require("@/components/ui/card");
var button_1 = require("@/components/ui/button");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var textarea_1 = require("@/components/ui/textarea");
var separator_1 = require("@/components/ui/separator");
var collapsible_1 = require("@/components/ui/collapsible");
var select_1 = require("@/components/ui/select");
var quoteLineItemSchema = zod_1.z.object({
    description: zod_1.z.string().min(1, "Description required"),
    quantity: zod_1.z.number().positive("Quantity must be positive"),
    unitPrice: zod_1.z.number().positive("Unit price must be positive"),
    taxRate: zod_1.z.number().min(0).max(100).optional()
});
var createQuoteSchema = zod_1.z.object({
    clientId: zod_1.z.string().min(1, "Client required"),
    subject: zod_1.z.string().min(1, "Subject required"),
    description: zod_1.z.string().optional(),
    items: zod_1.z.array(quoteLineItemSchema).min(1, "At least one line item required"),
    notes: zod_1.z.string().optional(),
    expirationDays: zod_1.z.number().int().positive("Expiration must be positive")["default"](30)
});
function CreateQuote() {
    var _this = this;
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var _b = react_1.useState(""), clientId = _b[0], setClientId = _b[1];
    var _c = react_1.useState(""), subject = _c[0], setSubject = _c[1];
    var _d = react_1.useState(""), description = _d[0], setDescription = _d[1];
    var _e = react_1.useState(""), notes = _e[0], setNotes = _e[1];
    var _f = react_1.useState(30), expirationDays = _f[0], setExpirationDays = _f[1];
    var _g = react_1.useState([
        { description: "", quantity: 1, unitPrice: 0, taxRate: 0 },
    ]), items = _g[0], setItems = _g[1];
    var _h = react_1.useState({}), errors = _h[0], setErrors = _h[1];
    var _j = react_1.useState(false), loading = _j[0], setLoading = _j[1];
    var _k = react_1.useState([]), clients = _k[0], setClients = _k[1];
    var _l = react_1.useState(false), additionalInfoOpen = _l[0], setAdditionalInfoOpen = _l[1];
    // Get clients for dropdown
    var clientsQuery = trpc_1.trpc.clients.list.useQuery({ limit: 100 });
    react_1.useEffect(function () {
        if (clientsQuery.data) {
            setClients(clientsQuery.data);
        }
    }, [clientsQuery.data]);
    var createMutation = trpc_1.trpc.quotes.create.useMutation();
    // Calculate totals
    var calculateTotals = function () {
        var subtotal = 0;
        var taxAmount = 0;
        items.forEach(function (item) {
            var itemTotal = item.quantity * item.unitPrice;
            subtotal += itemTotal;
            taxAmount += itemTotal * (item.taxRate / 100);
        });
        return {
            subtotal: subtotal,
            taxAmount: taxAmount,
            total: subtotal + taxAmount
        };
    };
    var totals = calculateTotals();
    var handleAddItem = function () {
        setItems(__spreadArrays(items, [{ description: "", quantity: 1, unitPrice: 0, taxRate: 0 }]));
    };
    var handleRemoveItem = function (index) {
        setItems(items.filter(function (_, i) { return i !== index; }));
    };
    var handleItemChange = function (index, field, value) {
        var _a;
        var newItems = __spreadArrays(items);
        newItems[index] = __assign(__assign({}, newItems[index]), (_a = {}, _a[field] = value, _a));
        setItems(newItems);
    };
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var data, result, error_1, fieldErrors_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    e.preventDefault();
                    setErrors({});
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    data = {
                        clientId: clientId,
                        subject: subject,
                        description: description || undefined,
                        items: items.map(function (item) { return ({
                            description: item.description,
                            quantity: item.quantity,
                            unitPrice: item.unitPrice,
                            taxRate: item.taxRate
                        }); }),
                        notes: notes || undefined,
                        expirationDays: expirationDays
                    };
                    createQuoteSchema.parse(data);
                    setLoading(true);
                    return [4 /*yield*/, createMutation.mutateAsync(data)];
                case 2:
                    result = _a.sent();
                    setLoading(false);
                    sonner_1.toast.success("Quote " + result.quoteNumber + " created successfully");
                    navigate("/quotes/" + result.id);
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    setLoading(false);
                    if (error_1 instanceof zod_1.z.ZodError) {
                        fieldErrors_1 = {};
                        error_1.errors.forEach(function (err) {
                            var path = err.path.join(".");
                            fieldErrors_1[path] = err.message;
                        });
                        setErrors(fieldErrors_1);
                    }
                    else {
                        sonner_1.toast.error(error_1.message || "Failed to create quote");
                    }
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    return (React.createElement("div", { className: "space-y-6" },
        React.createElement("div", { className: "flex items-center gap-4" },
            React.createElement(button_1.Button, { variant: "outline", size: "sm", onClick: function () { return navigate("/quotes"); }, className: "gap-2" },
                React.createElement(lucide_react_1.ArrowLeft, { className: "w-4 h-4" }),
                "Back"),
            React.createElement("div", null,
                React.createElement("h1", { className: "text-3xl font-bold text-gray-900" }, "Create Quote"),
                React.createElement("p", { className: "text-gray-600 mt-1" }, "Create a new quote for a client"))),
        React.createElement("form", { onSubmit: handleSubmit, className: "space-y-6" },
            React.createElement(card_1.Card, { className: "p-6" },
                React.createElement("h2", { className: "text-lg font-semibold text-gray-900 mb-4" }, "Quote Details"),
                React.createElement("div", { className: "space-y-3" },
                    React.createElement("div", { className: "grid grid-cols-[140px_1fr] items-center gap-3" },
                        React.createElement(label_1.Label, { className: "text-sm font-medium" },
                            "Client ",
                            React.createElement("span", { className: "text-red-500" }, "*")),
                        React.createElement(select_1.Select, { value: clientId, onValueChange: setClientId },
                            React.createElement(select_1.SelectTrigger, null,
                                React.createElement(select_1.SelectValue, { placeholder: "Select a client" })),
                            React.createElement(select_1.SelectContent, null, clients.map(function (client) { return (React.createElement(select_1.SelectItem, { key: client.id, value: client.id }, client.name)); })))),
                    errors.clientId && React.createElement("p", { className: "text-red-500 text-sm ml-[152px]" }, errors.clientId),
                    React.createElement("div", { className: "grid grid-cols-[140px_1fr] items-center gap-3" },
                        React.createElement(label_1.Label, { className: "text-sm font-medium" },
                            "Subject ",
                            React.createElement("span", { className: "text-red-500" }, "*")),
                        React.createElement(input_1.Input, { value: subject, onChange: function (e) { return setSubject(e.target.value); }, placeholder: "Quote subject" })),
                    errors.subject && React.createElement("p", { className: "text-red-500 text-sm ml-[152px]" }, errors.subject),
                    React.createElement("div", { className: "grid grid-cols-[140px_1fr] items-start gap-3" },
                        React.createElement(label_1.Label, { className: "text-sm font-medium pt-2" }, "Description"),
                        React.createElement(textarea_1.Textarea, { value: description, onChange: function (e) { return setDescription(e.target.value); }, placeholder: "Quote description (optional)", rows: 3 })),
                    React.createElement("div", { className: "grid grid-cols-[140px_1fr] items-center gap-3" },
                        React.createElement(label_1.Label, { className: "text-sm font-medium" },
                            "Expiration Days ",
                            React.createElement("span", { className: "text-red-500" }, "*")),
                        React.createElement(input_1.Input, { type: "number", value: expirationDays, onChange: function (e) { return setExpirationDays(parseInt(e.target.value)); }, min: "1", className: "max-w-[200px]" })),
                    errors.expirationDays && React.createElement("p", { className: "text-red-500 text-sm ml-[152px]" }, errors.expirationDays)),
                React.createElement(separator_1.Separator, { className: "my-4" }),
                React.createElement(collapsible_1.Collapsible, { open: additionalInfoOpen, onOpenChange: setAdditionalInfoOpen },
                    React.createElement(collapsible_1.CollapsibleTrigger, { className: "flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900" },
                        additionalInfoOpen ? React.createElement(lucide_react_1.ChevronUp, { className: "w-4 h-4" }) : React.createElement(lucide_react_1.ChevronDown, { className: "w-4 h-4" }),
                        "Additional Information"),
                    React.createElement(collapsible_1.CollapsibleContent, { className: "mt-3 space-y-3" },
                        React.createElement("div", { className: "grid grid-cols-[140px_1fr] items-start gap-3" },
                            React.createElement(label_1.Label, { className: "text-sm font-medium pt-2" }, "Notes"),
                            React.createElement(textarea_1.Textarea, { value: notes, onChange: function (e) { return setNotes(e.target.value); }, placeholder: "Internal notes", rows: 3 }))))),
            React.createElement(card_1.Card, { className: "p-6" },
                React.createElement("div", { className: "flex justify-between items-center" },
                    React.createElement("h2", { className: "text-lg font-semibold text-gray-900" }, "Line Items"),
                    React.createElement(button_1.Button, { type: "button", variant: "outline", size: "sm", onClick: handleAddItem, className: "gap-2" },
                        React.createElement(lucide_react_1.Plus, { className: "w-4 h-4" }),
                        "Add Item")),
                React.createElement(separator_1.Separator, { className: "my-4" }),
                items.length === 0 && (React.createElement("div", { className: "flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800" },
                    React.createElement(lucide_react_1.AlertCircle, { size: 18 }),
                    React.createElement("span", null, "At least one line item is required"))),
                React.createElement("div", { className: "space-y-3" }, items.map(function (item, index) { return (React.createElement("div", { key: index, className: "grid grid-cols-1 md:grid-cols-5 gap-3 p-4 border border-gray-200 rounded-lg" },
                    React.createElement("div", { className: "space-y-1" },
                        React.createElement(label_1.Label, { className: "text-xs font-semibold text-gray-600" }, "Description"),
                        React.createElement(input_1.Input, { value: item.description, onChange: function (e) {
                                return handleItemChange(index, "description", e.target.value);
                            }, placeholder: "Item description" })),
                    React.createElement("div", { className: "space-y-1" },
                        React.createElement(label_1.Label, { className: "text-xs font-semibold text-gray-600" }, "Qty"),
                        React.createElement(input_1.Input, { type: "number", value: item.quantity, onChange: function (e) {
                                return handleItemChange(index, "quantity", parseFloat(e.target.value));
                            }, min: "1", step: "0.01" })),
                    React.createElement("div", { className: "space-y-1" },
                        React.createElement(label_1.Label, { className: "text-xs font-semibold text-gray-600" }, "Unit Price"),
                        React.createElement(input_1.Input, { type: "number", value: item.unitPrice, onChange: function (e) {
                                return handleItemChange(index, "unitPrice", parseFloat(e.target.value));
                            }, min: "0", step: "0.01" })),
                    React.createElement("div", { className: "space-y-1" },
                        React.createElement(label_1.Label, { className: "text-xs font-semibold text-gray-600" }, "Tax %"),
                        React.createElement(input_1.Input, { type: "number", value: item.taxRate, onChange: function (e) {
                                return handleItemChange(index, "taxRate", parseFloat(e.target.value));
                            }, min: "0", max: "100" })),
                    React.createElement("div", { className: "flex items-end justify-between" },
                        React.createElement("div", null,
                            React.createElement(label_1.Label, { className: "text-xs font-semibold text-gray-600" }, "Total"),
                            React.createElement("div", { className: "text-sm font-semibold text-gray-900" },
                                "Ksh ",
                                (item.quantity * item.unitPrice).toFixed(2))),
                        React.createElement(button_1.Button, { type: "button", variant: "ghost", size: "sm", onClick: function () { return handleRemoveItem(index); }, className: "text-red-600 hover:text-red-700 hover:bg-red-50" },
                            React.createElement(lucide_react_1.Trash2, { className: "w-4 h-4" }))))); }))),
            React.createElement(card_1.Card, { className: "p-6 bg-gradient-to-br from-blue-50 to-blue-100" },
                React.createElement("div", { className: "space-y-2" },
                    React.createElement("div", { className: "flex justify-between items-center text-gray-700" },
                        React.createElement("span", null, "Subtotal:"),
                        React.createElement("span", { className: "text-lg" },
                            "Ksh ",
                            totals.subtotal.toFixed(2))),
                    React.createElement("div", { className: "flex justify-between items-center text-gray-700" },
                        React.createElement("span", null, "Tax:"),
                        React.createElement("span", { className: "text-lg" },
                            "Ksh ",
                            totals.taxAmount.toFixed(2))),
                    React.createElement(separator_1.Separator, { className: "my-2" }),
                    React.createElement("div", { className: "flex justify-between items-center" },
                        React.createElement("span", { className: "font-semibold text-gray-900" }, "Total:"),
                        React.createElement("span", { className: "text-2xl font-bold text-blue-600" },
                            "Ksh ",
                            totals.total.toFixed(2))))),
            React.createElement("div", { className: "flex gap-4 justify-end" },
                React.createElement(button_1.Button, { type: "button", variant: "outline", onClick: function () { return navigate("/quotes"); } }, "Cancel"),
                React.createElement(button_1.Button, { type: "submit", variant: "outline", disabled: loading },
                    React.createElement(lucide_react_1.SaveIcon, { className: "w-4 h-4 mr-2" }),
                    "Save Draft"),
                React.createElement(button_1.Button, { type: "submit", disabled: loading }, loading ? "Creating..." : "Save & Continue")))));
}
exports.CreateQuote = CreateQuote;
exports["default"] = CreateQuote;
