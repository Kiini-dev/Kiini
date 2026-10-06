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
exports.QuoteTemplate = void 0;
var react_1 = require("react");
var wouter_1 = require("wouter");
var lucide_react_1 = require("lucide-react");
var trpc_1 = require("../utils/trpc");
var FormField_1 = require("../components/FormField");
var sonner_1 = require("sonner");
function QuoteTemplate() {
    var _this = this;
    var _a = wouter_1.useLocation(), navigate = _a[1];
    var _b = react_1.useState([]), templates = _b[0], setTemplates = _b[1];
    var _c = react_1.useState(false), showCreateForm = _c[0], setShowCreateForm = _c[1];
    var _d = react_1.useState(null), selectedTemplate = _d[0], setSelectedTemplate = _d[1];
    var _e = react_1.useState(""), templateName = _e[0], setTemplateName = _e[1];
    var _f = react_1.useState(""), templateDescription = _f[0], setTemplateDescription = _f[1];
    var _g = react_1.useState([
        { description: "", quantity: 1, unitPrice: 0, taxRate: 0 },
    ]), items = _g[0], setItems = _g[1];
    var listQuery = trpc_1.trpc.quotes.list.useQuery({
        limit: 100
    });
    react_1.useEffect(function () {
        if (listQuery.data) {
            var filtered = listQuery.data.filter(function (q) { return q.template === 1; });
            setTemplates(filtered);
        }
    }, [listQuery.data]);
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
    var handleCreateTemplate = function () { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!templateName.trim()) {
                        sonner_1.toast.error("Template name is required");
                        return [2 /*return*/];
                    }
                    if (items.length === 0 || items.some(function (i) { return !i.description || i.unitPrice === 0; })) {
                        sonner_1.toast.error("All items must have description and unit price");
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    sonner_1.toast.success("Template saved successfully");
                    setTemplateName("");
                    setTemplateDescription("");
                    setItems([{ description: "", quantity: 1, unitPrice: 0, taxRate: 0 }]);
                    setShowCreateForm(false);
                    return [4 /*yield*/, listQuery.refetch()];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    sonner_1.toast.error(error_1.message || "Failed to create template");
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    var handleUseTemplate = function (template) {
        setSelectedTemplate(template);
        navigate("/quotes/new?templateId=" + template.id);
    };
    var handleDeleteTemplate = function (templateId) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (!window.confirm("Delete this template?"))
                return [2 /*return*/];
            try {
                sonner_1.toast.success("Template deleted");
                setTemplates(templates.filter(function (t) { return t.id !== templateId; }));
            }
            catch (error) {
                sonner_1.toast.error(error.message || "Failed to delete template");
            }
            return [2 /*return*/];
        });
    }); };
    return (React.createElement("div", { className: "space-y-6" },
        React.createElement("div", { className: "flex items-center justify-between" },
            React.createElement("div", { className: "flex items-center gap-4" },
                React.createElement("button", { onClick: function () { return navigate("/quotes"); }, className: "p-2 hover:bg-gray-100 rounded-lg transition-colors" },
                    React.createElement(lucide_react_1.ArrowLeft, { size: 24, className: "text-gray-600" })),
                React.createElement("div", null,
                    React.createElement("h1", { className: "text-3xl font-bold text-gray-900" }, "Quote Templates"),
                    React.createElement("p", { className: "text-gray-600 mt-1" }, "Create and manage reusable quote templates"))),
            React.createElement("button", { onClick: function () { return setShowCreateForm(!showCreateForm); }, className: "flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors" },
                React.createElement(lucide_react_1.Plus, { size: 20 }),
                "New Template")),
        showCreateForm && (React.createElement("div", { className: "bg-white rounded-lg border border-gray-200 p-6 space-y-4" },
            React.createElement("h2", { className: "text-lg font-semibold text-gray-900" }, "Create Template"),
            React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                React.createElement(FormField_1.FormField, { label: "Template Name", required: true },
                    React.createElement("input", { type: "text", value: templateName, onChange: function (e) { return setTemplateName(e.target.value); }, placeholder: "e.g., Standard Service Quote", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" })),
                React.createElement(FormField_1.FormField, { label: "Description" },
                    React.createElement("input", { type: "text", value: templateDescription, onChange: function (e) { return setTemplateDescription(e.target.value); }, placeholder: "Template description", className: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" }))),
            React.createElement("div", { className: "border-t pt-4" },
                React.createElement("div", { className: "flex justify-between items-center mb-3" },
                    React.createElement("h3", { className: "font-semibold text-gray-900" }, "Default Line Items"),
                    React.createElement("button", { type: "button", onClick: handleAddItem, className: "flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors" },
                        React.createElement(lucide_react_1.Plus, { size: 18 }),
                        "Add Item")),
                React.createElement("div", { className: "space-y-3" }, items.map(function (item, index) { return (React.createElement("div", { key: index, className: "grid grid-cols-1 md:grid-cols-5 gap-3 p-4 border border-gray-200 rounded-lg" },
                    React.createElement("div", null,
                        React.createElement("label", { className: "text-xs font-semibold text-gray-600" }, "Description"),
                        React.createElement("input", { type: "text", value: item.description, onChange: function (e) {
                                return handleItemChange(index, "description", e.target.value);
                            }, placeholder: "Item description", className: "w-full px-2 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" })),
                    React.createElement("div", null,
                        React.createElement("label", { className: "text-xs font-semibold text-gray-600" }, "Qty"),
                        React.createElement("input", { type: "number", value: item.quantity, onChange: function (e) {
                                return handleItemChange(index, "quantity", parseFloat(e.target.value));
                            }, min: "1", step: "0.01", className: "w-full px-2 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" })),
                    React.createElement("div", null,
                        React.createElement("label", { className: "text-xs font-semibold text-gray-600" }, "Unit Price"),
                        React.createElement("input", { type: "number", value: item.unitPrice, onChange: function (e) {
                                return handleItemChange(index, "unitPrice", parseFloat(e.target.value));
                            }, min: "0", step: "0.01", className: "w-full px-2 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" })),
                    React.createElement("div", null,
                        React.createElement("label", { className: "text-xs font-semibold text-gray-600" }, "Tax %"),
                        React.createElement("input", { type: "number", value: item.taxRate, onChange: function (e) {
                                return handleItemChange(index, "taxRate", parseFloat(e.target.value));
                            }, min: "0", max: "100", className: "w-full px-2 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" })),
                    React.createElement("div", { className: "flex items-end justify-between" },
                        React.createElement("div", null,
                            React.createElement("label", { className: "text-xs font-semibold text-gray-600" }, "Total"),
                            React.createElement("div", { className: "text-sm font-semibold text-gray-900" },
                                "$",
                                (item.quantity * item.unitPrice).toFixed(2))),
                        React.createElement("button", { type: "button", onClick: function () { return handleRemoveItem(index); }, className: "p-2 text-red-600 hover:bg-red-50 rounded transition-colors" },
                            React.createElement(lucide_react_1.Trash2, { size: 18 }))))); })),
                React.createElement("div", { className: "mt-4 p-4 bg-blue-50 rounded-lg space-y-2" },
                    React.createElement("div", { className: "flex justify-between text-sm" },
                        React.createElement("span", null, "Subtotal:"),
                        React.createElement("span", null,
                            "$",
                            totals.subtotal.toFixed(2))),
                    React.createElement("div", { className: "flex justify-between text-sm" },
                        React.createElement("span", null, "Tax:"),
                        React.createElement("span", null,
                            "$",
                            totals.taxAmount.toFixed(2))),
                    React.createElement("div", { className: "border-t pt-2 flex justify-between font-semibold" },
                        React.createElement("span", null, "Total:"),
                        React.createElement("span", { className: "text-blue-600" },
                            "$",
                            totals.total.toFixed(2))))),
            React.createElement("div", { className: "flex gap-4 pt-4 border-t" },
                React.createElement("button", { onClick: handleCreateTemplate, className: "px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors" }, "Save Template"),
                React.createElement("button", { onClick: function () { return setShowCreateForm(false); }, className: "px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors" }, "Cancel")))),
        React.createElement("div", { className: "space-y-4" }, templates.length === 0 ? (React.createElement("div", { className: "bg-white rounded-lg border border-gray-200 p-12 text-center" },
            React.createElement("p", { className: "text-gray-600 mb-4" }, "No templates yet"),
            React.createElement("button", { onClick: function () { return setShowCreateForm(true); }, className: "text-blue-600 hover:underline font-semibold" }, "Create your first template"))) : (React.createElement("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" }, templates.map(function (template) {
            var _a;
            return (React.createElement("div", { key: template.id, className: "bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-shadow" },
                React.createElement("h3", { className: "font-semibold text-gray-900 mb-2" }, template.subject),
                React.createElement("p", { className: "text-sm text-gray-600 mb-4" }, template.description),
                React.createElement("div", { className: "mb-4 p-3 bg-blue-50 rounded" },
                    React.createElement("p", { className: "text-xs text-gray-600 mb-1" },
                        "Items: ",
                        ((_a = template.items) === null || _a === void 0 ? void 0 : _a.length) || 0),
                    React.createElement("p", { className: "font-semibold text-blue-600" },
                        "$",
                        template.total.toFixed(2))),
                React.createElement("div", { className: "flex gap-2" },
                    React.createElement("button", { onClick: function () { return handleUseTemplate(template); }, className: "flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors" }, "Use Template"),
                    React.createElement("button", { onClick: function () { return handleDeleteTemplate(template.id); }, className: "px-3 py-2 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors" }, "Delete"))));
        }))))));
}
exports.QuoteTemplate = QuoteTemplate;
