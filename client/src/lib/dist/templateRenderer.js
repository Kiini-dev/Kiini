"use strict";
/**
 * Template Renderer Utility
 * Handles loading, parsing, and rendering HTML templates with data binding
 */
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
exports.__esModule = true;
exports.DOCUMENT_TEMPLATES = exports.templateRenderer = void 0;
var TemplateRenderer = /** @class */ (function () {
    function TemplateRenderer() {
        this.templateCache = new Map();
    }
    /**
     * Load template HTML from public templates directory
     */
    TemplateRenderer.prototype.loadTemplate = function (templateType) {
        return __awaiter(this, void 0, Promise, function () {
            var response, html, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.templateCache.has(templateType)) {
                            return [2 /*return*/, this.templateCache.get(templateType)];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, fetch("/templates/" + templateType + "-template.html")];
                    case 2:
                        response = _a.sent();
                        if (!response.ok)
                            throw new Error("Template not found: " + templateType);
                        return [4 /*yield*/, response.text()];
                    case 3:
                        html = _a.sent();
                        this.templateCache.set(templateType, html);
                        return [2 /*return*/, html];
                    case 4:
                        error_1 = _a.sent();
                        console.error("Failed to load template: " + templateType, error_1);
                        throw error_1;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Bind data to template placeholders
     * Supports [PLACEHOLDER], ${field}, and data-field="fieldName" syntax
     */
    TemplateRenderer.prototype.bindData = function (html, data) {
        var _this = this;
        var result = html;
        // Replace ${companyInfo.field} placeholders
        if (data.companyInfo) {
            result = result.replace(/\$\{companyInfo\.(\w+)\}/g, function (_m, key) {
                var _a, _b;
                return String((_b = (_a = data.companyInfo) === null || _a === void 0 ? void 0 : _a[key]) !== null && _b !== void 0 ? _b : '');
            });
        }
        // Replace generic ${field} placeholders and nested paths
        result = result.replace(/\$\{([\w.]+)\}/g, function (_m, path) {
            var value = _this.resolvePath(data, path);
            return value !== undefined && value !== null ? String(value) : '';
        });
        // Replace [PLACEHOLDER] format with multiple possible key variants
        Object.entries(data).forEach(function (_a) {
            var key = _a[0], value = _a[1];
            var upperKey = key.toUpperCase();
            var spacedKey = key.replace(/([A-Z])/g, ' $1').trim().toUpperCase();
            var underscoreKey = spacedKey.replace(/\s+/g, '_');
            var dashKey = spacedKey.replace(/\s+/g, '-');
            var placeholders = [
                "[" + upperKey + "]",
                "[" + spacedKey + "]",
                "[" + underscoreKey + "]",
                "[" + dashKey + "]"
            ];
            placeholders.forEach(function (placeholder) {
                result = result.replace(new RegExp(placeholder, 'g'), String(value !== null && value !== void 0 ? value : ''));
            });
        });
        // Replace data-field bindings using HTML parsing
        var parser = new DOMParser();
        try {
            var doc = parser.parseFromString(result, 'text/html');
            this.bindDataAttributes(doc, data);
            result = doc.documentElement.outerHTML;
        }
        catch (error) {
            console.warn('Error parsing DOM for data-field bindings:', error);
        }
        return result;
    };
    TemplateRenderer.prototype.resolvePath = function (data, path) {
        return path.split('.').reduce(function (obj, key) {
            if (obj && typeof obj === 'object') {
                return obj[key];
            }
            return undefined;
        }, data);
    };
    /**
     * Bind data to elements with data-field attributes
     */
    TemplateRenderer.prototype.bindDataAttributes = function (doc, data) {
        var _this = this;
        var elements = doc.querySelectorAll('[data-field]');
        elements.forEach(function (element) {
            var fieldName = element.getAttribute('data-field');
            var value = fieldName ? _this.resolvePath(data, fieldName) : undefined;
            if (value === undefined || value === null)
                return;
            if (element.tagName === 'IMG') {
                element.setAttribute('src', String(value));
                return;
            }
            if (element.tagName === 'A') {
                element.setAttribute('href', String(value));
            }
            if (!element.children.length) {
                element.textContent = String(value);
            }
        });
    };
    /**
     * Render template with data and return as HTML string
     */
    TemplateRenderer.prototype.renderTemplate = function (templateType, data) {
        return __awaiter(this, void 0, Promise, function () {
            var template, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.loadTemplate(templateType)];
                    case 1:
                        template = _a.sent();
                        return [2 /*return*/, this.bindData(template, data)];
                    case 2:
                        error_2 = _a.sent();
                        console.error("Failed to render template: " + templateType, error_2);
                        throw error_2;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Render template into a DOM element
     */
    TemplateRenderer.prototype.renderToElement = function (templateType, data, targetElement) {
        return __awaiter(this, void 0, Promise, function () {
            var html, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.renderTemplate(templateType, data)];
                    case 1:
                        html = _a.sent();
                        targetElement.innerHTML = html;
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        console.error("Failed to render template to element:" + templateType, error_3);
                        throw error_3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Clear cache (useful for dev/testing)
     */
    TemplateRenderer.prototype.clearCache = function () {
        this.templateCache.clear();
    };
    /**
     * Get all cached templates
     */
    TemplateRenderer.prototype.getCachedTemplates = function () {
        return Array.from(this.templateCache.keys());
    };
    return TemplateRenderer;
}());
// Export singleton instance
exports.templateRenderer = new TemplateRenderer();
// Template registry - maps document types to template configurations
exports.DOCUMENT_TEMPLATES = {
    invoice: {
        type: 'invoice',
        label: 'Invoice',
        icon: 'FileText',
        fields: ['invoiceNumber', 'issueDate', 'dueDate', 'clientName', 'lineItems', 'total']
    },
    receipt: {
        type: 'receipt',
        label: 'Payment Receipt',
        icon: 'Receipt',
        fields: ['receiptNumber', 'issueDate', 'paymentMethod', 'payerName', 'amount']
    },
    estimate: {
        type: 'estimate',
        label: 'Quotation / Estimate',
        icon: 'FileText',
        fields: ['quoteNumber', 'issueDate', 'expiryDate', 'clientName', 'lineItems', 'total']
    },
    lpo: {
        type: 'lpo',
        label: 'Local Purchase Order',
        icon: 'ShoppingCart',
        fields: ['lpoNumber', 'issueDate', 'deliveryDate', 'supplierName', 'lineItems', 'total']
    },
    'delivery-note': {
        type: 'dn',
        label: 'Delivery Note',
        icon: 'Truck',
        fields: ['dnNumber', 'issueDate', 'poNumber', 'items', 'signatureDate']
    },
    grn: {
        type: 'grn',
        label: 'Goods Received Note',
        icon: 'CheckCircle',
        fields: ['grnNumber', 'issueDate', 'inspectionStatus', 'items', 'notes']
    },
    imprest: {
        type: 'imprest',
        label: 'Imprest Advance Request',
        icon: 'DollarSign',
        fields: ['imprestNumber', 'issueDate', 'employeeName', 'amount', 'purpose']
    },
    asset: {
        type: 'asset',
        label: 'Asset Allocation Receipt',
        icon: 'Package',
        fields: ['receiptNumber', 'issueDate', 'serialNumber', 'employeeName', 'assetDescription']
    },
    'purchase-order': {
        type: 'order',
        label: 'Purchase Order',
        icon: 'ShoppingCart',
        fields: ['poNumber', 'issueDate', 'deliveryDate', 'vendorName', 'lineItems', 'total']
    },
    rfq: {
        type: 'rfq',
        label: 'Request for Quotation',
        icon: 'FileText',
        fields: ['rfqNumber', 'issueDate', 'deadlineDate', 'vendorName', 'items']
    },
    'credit-note': {
        type: 'credit-note',
        label: 'Credit Note',
        icon: 'FileText',
        fields: ['creditNoteNumber', 'issueDate', 'reason', 'clientName', 'items', 'total']
    },
    'debit-note': {
        type: 'debit-note',
        label: 'Debit Note',
        icon: 'FileText',
        fields: ['debitNoteNumber', 'issueDate', 'reason', 'supplierName', 'items', 'total']
    },
    'service-invoice': {
        type: 'service-invoice',
        label: 'Service Invoice',
        icon: 'Wrench',
        fields: ['serviceInvoiceNumber', 'issueDate', 'dueDate', 'clientName', 'serviceItems', 'total']
    },
    'expense-claim': {
        type: 'expense-claim',
        label: 'Expense Claim',
        icon: 'DollarSign',
        fields: ['claimNumber', 'issueDate', 'employeeName', 'expenses', 'total']
    },
    'work-order': {
        type: 'work-order',
        label: 'Work Order',
        icon: 'Wrench',
        fields: ['workOrderNumber', 'issueDate', 'description', 'assignedTo', 'startDate', 'endDate']
    }
};
