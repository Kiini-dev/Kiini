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
function CreateServiceInvoice() {
    var _this = this;
    var _a = wouter_1.useLocation(), setLocation = _a[1];
    var _b = permissions_1.useRequireFeature("accounting:service-invoices:create"), allowed = _b.allowed, permLoading = _b.isLoading;
    var _c = react_1.useState(false), isLoading = _c[0], setIsLoading = _c[1];
    var _d = react_1.useState({
        serviceInvoiceNumber: "",
        issueDate: new Date().toISOString().split("T")[0],
        dueDate: new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        clientId: "",
        clientName: "",
        serviceDescription: "",
        taxAmount: "0",
        notes: "",
        status: "draft"
    }), formData = _d[0], setFormData = _d[1];
    var _e = react_1.useState([
        { description: "", quantity: "1", unitPrice: "0" },
    ]), serviceItems = _e[0], setServiceItems = _e[1];
    var _f = trpc_1.trpc.clients.list.useQuery({ page: 1, limit: 500 }).data, clientsData = _f === void 0 ? [] : _f;
    var getClientLabel = function (client) {
        return (client === null || client === void 0 ? void 0 : client.companyName) || (client === null || client === void 0 ? void 0 : client.contactPerson) || (((client === null || client === void 0 ? void 0 : client.firstName) || "") + " " + ((client === null || client === void 0 ? void 0 : client.lastName) || "")).trim() || (client === null || client === void 0 ? void 0 : client.name) || (client === null || client === void 0 ? void 0 : client.id) || "Client";
    };
    var createMutation = trpc_1.trpc.serviceInvoices.create.useMutation({
        onSuccess: function (data) {
            sonner_1.toast.success("Service invoice created successfully!");
            setLocation("/service-invoices/" + data.id);
        },
        onError: function (error) {
            sonner_1.toast.error("Failed to create service invoice: " + error.message);
        }
    });
    var calculateTotal = function () {
        var itemsTotal = serviceItems.reduce(function (sum, item) {
            var qty = parseFloat(item.quantity) || 0;
            var price = parseFloat(item.unitPrice) || 0;
            return sum + qty * price;
        }, 0);
        return itemsTotal + (parseFloat(formData.taxAmount) || 0);
    };
    var handleSubmit = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var total;
        return __generator(this, function (_a) {
            e.preventDefault();
            setIsLoading(true);
            try {
                total = calculateTotal();
                createMutation.mutate({
                    serviceInvoiceNumber: formData.serviceInvoiceNumber,
                    issueDate: new Date(formData.issueDate),
                    dueDate: new Date(formData.dueDate),
                    clientId: formData.clientId,
                    clientName: formData.clientName,
                    serviceDescription: formData.serviceDescription,
                    serviceItems: serviceItems.map(function (item) { return ({
                        description: item.description,
                        quantity: parseFloat(item.quantity) || 1,
                        unitPrice: parseFloat(item.unitPrice) || 0,
                        total: (parseFloat(item.quantity) || 1) * (parseFloat(item.unitPrice) || 0)
                    }); }),
                    total: total,
                    taxAmount: parseFloat(formData.taxAmount) || 0,
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
    var addServiceItem = function () {
        setServiceItems(__spreadArrays(serviceItems, [{ description: "", quantity: "1", unitPrice: "0" }]));
    };
    var removeServiceItem = function (index) {
        setServiceItems(serviceItems.filter(function (_, i) { return i !== index; }));
    };
    if (permLoading)
        return React.createElement(spinner_1.Spinner, null);
    if (!allowed)
        return React.createElement("div", { className: "text-center py-10" }, "Access Denied");
    return (React.createElement(ModuleLayout_1.ModuleLayout, { title: "Create Service Invoice", description: "Create a new service invoice", icon: React.createElement(lucide_react_1.Plus, { className: "w-5 h-5" }), breadcrumbs: [{ label: "Dashboard", href: "/crm-home" }, { label: "Service Invoices", href: "/service-invoices" }, { label: "Create" }], backLink: { label: "Service Invoices", href: "/service-invoices" } },
        React.createElement(card_1.Card, null,
            React.createElement(card_1.CardHeader, null,
                React.createElement(card_1.CardTitle, null, "New Service Invoice"),
                React.createElement(card_1.CardDescription, null, "Enter the details for the new service invoice")),
            React.createElement(card_1.CardContent, null,
                React.createElement("form", { onSubmit: handleSubmit, className: "space-y-6" },
                    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6" },
                        React.createElement("div", null,
                            React.createElement(label_1.Label, { htmlFor: "serviceInvoiceNumber" }, "Invoice Number *"),
                            React.createElement(input_1.Input, { id: "serviceInvoiceNumber", value: formData.serviceInvoiceNumber, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { serviceInvoiceNumber: e.target.value })); }, required: true, placeholder: "SI-2026-001" })),
                        React.createElement("div", null,
                            React.createElement(label_1.Label, { htmlFor: "status" }, "Status"),
                            React.createElement(select_1.Select, { value: formData.status, onValueChange: function (value) { return setFormData(__assign(__assign({}, formData), { status: value })); } },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, null)),
                                React.createElement(select_1.SelectContent, null,
                                    React.createElement(select_1.SelectItem, { value: "draft" }, "Draft"),
                                    React.createElement(select_1.SelectItem, { value: "sent" }, "Sent"),
                                    React.createElement(select_1.SelectItem, { value: "accepted" }, "Accepted"),
                                    React.createElement(select_1.SelectItem, { value: "paid" }, "Paid"),
                                    React.createElement(select_1.SelectItem, { value: "cancelled" }, "Cancelled")))),
                        React.createElement("div", null,
                            React.createElement(label_1.Label, { htmlFor: "issueDate" }, "Issue Date *"),
                            React.createElement(input_1.Input, { id: "issueDate", type: "date", value: formData.issueDate, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { issueDate: e.target.value })); }, required: true })),
                        React.createElement("div", null,
                            React.createElement(label_1.Label, { htmlFor: "dueDate" }, "Due Date *"),
                            React.createElement(input_1.Input, { id: "dueDate", type: "date", value: formData.dueDate, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { dueDate: e.target.value })); }, required: true })),
                        React.createElement("div", null,
                            React.createElement(label_1.Label, { htmlFor: "clientId" }, "Client"),
                            React.createElement(select_1.Select, { value: formData.clientId, onValueChange: function (value) {
                                    var selected = clientsData.find(function (client) { return client.id === value; });
                                    setFormData(__assign(__assign({}, formData), { clientId: value, clientName: selected ? getClientLabel(selected) : formData.clientName }));
                                } },
                                React.createElement(select_1.SelectTrigger, null,
                                    React.createElement(select_1.SelectValue, { placeholder: "Select client" })),
                                React.createElement(select_1.SelectContent, null, clientsData.map(function (client) { return (React.createElement(select_1.SelectItem, { key: client.id, value: client.id }, getClientLabel(client))); }))),
                            React.createElement(input_1.Input, { id: "clientId", value: formData.clientId, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { clientId: e.target.value })); }, placeholder: "Select or enter client ID" })),
                        React.createElement("div", null,
                            React.createElement(label_1.Label, { htmlFor: "clientName" }, "Client Name *"),
                            React.createElement(input_1.Input, { id: "clientName", value: formData.clientName, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { clientName: e.target.value })); }, placeholder: "Enter client name", required: true }))),
                    React.createElement("div", null,
                        React.createElement(label_1.Label, { htmlFor: "serviceDescription" }, "Service Description *"),
                        React.createElement(textarea_1.Textarea, { id: "serviceDescription", value: formData.serviceDescription, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { serviceDescription: e.target.value })); }, placeholder: "Describe the services provided", rows: 4, required: true })),
                    React.createElement("div", null,
                        React.createElement("div", { className: "flex justify-between items-center mb-4" },
                            React.createElement(label_1.Label, null, "Service Items"),
                            React.createElement(button_1.Button, { type: "button", variant: "outline", onClick: addServiceItem, disabled: serviceItems.length >= 50 },
                                React.createElement(lucide_react_1.Plus, { className: "w-4 h-4 mr-2" }),
                                "Add Item")),
                        React.createElement("div", { className: "space-y-2" }, serviceItems.map(function (item, index) { return (React.createElement("div", { key: index, className: "grid grid-cols-1 md:grid-cols-4 gap-2 items-end" },
                            React.createElement(input_1.Input, { placeholder: "Description", value: item.description, onChange: function (e) {
                                    var newItems = __spreadArrays(serviceItems);
                                    newItems[index].description = e.target.value;
                                    setServiceItems(newItems);
                                } }),
                            React.createElement(input_1.Input, { placeholder: "Quantity", type: "number", step: "0.01", value: item.quantity, onChange: function (e) {
                                    var newItems = __spreadArrays(serviceItems);
                                    newItems[index].quantity = e.target.value;
                                    setServiceItems(newItems);
                                } }),
                            React.createElement(input_1.Input, { placeholder: "Unit Price", type: "number", step: "0.01", value: item.unitPrice, onChange: function (e) {
                                    var newItems = __spreadArrays(serviceItems);
                                    newItems[index].unitPrice = e.target.value;
                                    setServiceItems(newItems);
                                } }),
                            React.createElement(button_1.Button, { type: "button", variant: "destructive", size: "sm", onClick: function () { return removeServiceItem(index); } },
                                React.createElement(lucide_react_1.Trash2, { className: "w-4 h-4" })))); }))),
                    React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6" },
                        React.createElement("div", null,
                            React.createElement(label_1.Label, { htmlFor: "taxAmount" }, "Tax Amount (KES)"),
                            React.createElement(input_1.Input, { id: "taxAmount", type: "number", step: "0.01", value: formData.taxAmount, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { taxAmount: e.target.value })); } })),
                        React.createElement("div", { className: "flex items-end" },
                            React.createElement("div", { className: "text-lg font-bold" },
                                "Total: KES ",
                                calculateTotal().toLocaleString("en-KE", { minimumFractionDigits: 2 })))),
                    React.createElement("div", null,
                        React.createElement(label_1.Label, { htmlFor: "notes" }, "Notes"),
                        React.createElement(textarea_1.Textarea, { id: "notes", value: formData.notes, onChange: function (e) { return setFormData(__assign(__assign({}, formData), { notes: e.target.value })); }, placeholder: "Additional notes and terms", rows: 3 })),
                    React.createElement("div", { className: "flex gap-4" },
                        React.createElement(button_1.Button, { type: "submit", disabled: isLoading || createMutation.isPending }, isLoading || createMutation.isPending ? "Creating..." : "Create Service Invoice"),
                        React.createElement(button_1.Button, { type: "button", variant: "outline", onClick: function () { return setLocation("/service-invoices"); }, disabled: isLoading }, "Cancel")))))));
}
exports["default"] = CreateServiceInvoice;
