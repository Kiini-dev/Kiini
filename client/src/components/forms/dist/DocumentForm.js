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
var button_1 = require("@/components/ui/button");
var const_1 = require("@/const");
var separator_1 = require("@/components/ui/separator");
var input_1 = require("@/components/ui/input");
var label_1 = require("@/components/ui/label");
var card_1 = require("@/components/ui/card");
var textarea_1 = require("@/components/ui/textarea");
var select_1 = require("@/components/ui/select");
var collapsible_1 = require("@/components/ui/collapsible");
var lucide_react_1 = require("lucide-react");
var sonner_1 = require("sonner");
var trpc_1 = require("@/lib/trpc");
var currency_1 = require("@/lib/currency");
var paymentMethods_1 = require("@/const/paymentMethods");
function DocumentForm(_a) {
    var _b, _c, _d, _e;
    var type = _a.type, _f = _a.mode, mode = _f === void 0 ? "create" : _f, onSave = _a.onSave, onSend = _a.onSend, initialData = _a.initialData, _g = _a.isLoading, isLoading = _g === void 0 ? false : _g, _h = _a.isSaving, isSaving = _h === void 0 ? false : _h;
    var _j = react_1.useState((initialData === null || initialData === void 0 ? void 0 : initialData.documentNumber) || ""), documentNumber = _j[0], setDocumentNumber = _j[1];
    // Update document number when initialData changes (e.g. after async fetch)
    react_1.useEffect(function () {
        if (initialData === null || initialData === void 0 ? void 0 : initialData.documentNumber) {
            setDocumentNumber(initialData.documentNumber);
        }
    }, [initialData === null || initialData === void 0 ? void 0 : initialData.documentNumber]);
    var _k = react_1.useState((initialData === null || initialData === void 0 ? void 0 : initialData.date) || new Date().toISOString().split('T')[0]), date = _k[0], setDate = _k[1];
    var _l = react_1.useState((initialData === null || initialData === void 0 ? void 0 : initialData.dueDate) || ""), dueDate = _l[0], setDueDate = _l[1];
    var _m = react_1.useState((initialData === null || initialData === void 0 ? void 0 : initialData.dueDate) ? "manual" : "auto"), dueDateMethod = _m[0], setDueDateMethod = _m[1];
    var _o = react_1.useState((_b = initialData === null || initialData === void 0 ? void 0 : initialData.dueDays) !== null && _b !== void 0 ? _b : 7), dueDays = _o[0], setDueDays = _o[1];
    var _p = react_1.useState("existing"), clientMode = _p[0], setClientMode = _p[1];
    var _q = react_1.useState((initialData === null || initialData === void 0 ? void 0 : initialData.clientId) || ""), clientId = _q[0], setClientId = _q[1];
    var _r = react_1.useState((initialData === null || initialData === void 0 ? void 0 : initialData.clientName) || ""), clientName = _r[0], setClientName = _r[1];
    var _s = react_1.useState((initialData === null || initialData === void 0 ? void 0 : initialData.clientEmail) || ""), clientEmail = _s[0], setClientEmail = _s[1];
    var _t = react_1.useState((initialData === null || initialData === void 0 ? void 0 : initialData.clientAddress) || ""), clientAddress = _t[0], setClientAddress = _t[1];
    var _u = react_1.useState(""), newClientFirstName = _u[0], setNewClientFirstName = _u[1];
    var _v = react_1.useState(""), newClientLastName = _v[0], setNewClientLastName = _v[1];
    var _w = react_1.useState(""), newClientCompany = _w[0], setNewClientCompany = _w[1];
    var _x = react_1.useState(""), newClientEmail = _x[0], setNewClientEmail = _x[1];
    var _y = react_1.useState((initialData === null || initialData === void 0 ? void 0 : initialData.projectId) || ""), projectId = _y[0], setProjectId = _y[1];
    var _z = react_1.useState((initialData === null || initialData === void 0 ? void 0 : initialData.category) || "default"), category = _z[0], setCategory = _z[1];
    var _0 = react_1.useState((initialData === null || initialData === void 0 ? void 0 : initialData.notes) || ""), notes = _0[0], setNotes = _0[1];
    var _1 = react_1.useState((initialData === null || initialData === void 0 ? void 0 : initialData.terms) || ""), terms = _1[0], setTerms = _1[1];
    var _2 = react_1.useState((initialData === null || initialData === void 0 ? void 0 : initialData.paymentDetails) || ""), paymentDetails = _2[0], setPaymentDetails = _2[1];
    var _3 = react_1.useState((_c = initialData === null || initialData === void 0 ? void 0 : initialData.applyVAT) !== null && _c !== void 0 ? _c : true), applyVAT = _3[0], setApplyVAT = _3[1];
    var _4 = react_1.useState((initialData === null || initialData === void 0 ? void 0 : initialData.taxType) || "exclusive"), taxType = _4[0], setTaxType = _4[1];
    var _5 = react_1.useState((_d = initialData === null || initialData === void 0 ? void 0 : initialData.vatPercentage) !== null && _d !== void 0 ? _d : 16), vatPercentage = _5[0], setVatPercentage = _5[1];
    var _6 = react_1.useState((initialData === null || initialData === void 0 ? void 0 : initialData.paymentMethod) || "mpesa"), paymentMethod = _6[0], setPaymentMethod = _6[1];
    var _7 = react_1.useState(false), showAdditionalInfo = _7[0], setShowAdditionalInfo = _7[1];
    var _8 = react_1.useState((_e = initialData === null || initialData === void 0 ? void 0 : initialData.documentDiscount) !== null && _e !== void 0 ? _e : 0), documentDiscount = _8[0], setDocumentDiscount = _8[1];
    var _9 = react_1.useState((initialData === null || initialData === void 0 ? void 0 : initialData.lineItems) || [
        { id: "1", sno: 1, description: "", uom: "Pcs", qty: 1, unitPrice: 0, tax: 0, discount: 0, total: 0 }
    ]), lineItems = _9[0], setLineItems = _9[1];
    var clientsData = trpc_1.trpc.clients.list.useQuery({}).data;
    var clients = react_1.useMemo(function () { return clientsData || []; }, [clientsData]);
    var projectsData = trpc_1.trpc.projects.list.useQuery({}).data;
    var clientProjects = react_1.useMemo(function () {
        if (!projectsData || !clientId)
            return [];
        return projectsData.filter(function (p) { return p.clientId === clientId; });
    }, [projectsData, clientId]);
    var companyInfo = trpc_1.trpc.settings.getCompanyInfo.useQuery({}).data;
    var bankDetails = trpc_1.trpc.settings.getBankDetails.useQuery({}).data;
    var taxSettings = trpc_1.trpc.settings.getByCategory.useQuery({ category: "tax_rates" }, { staleTime: 5 * 60 * 1000 }).data;
    var invoiceSettings = trpc_1.trpc.settings.getByCategory.useQuery({ category: "invoice_settings" }, { staleTime: 5 * 60 * 1000 }).data;
    // Apply default VAT rate from settings on mount (only in create mode)
    react_1.useEffect(function () {
        if (mode === 'create' && (taxSettings === null || taxSettings === void 0 ? void 0 : taxSettings.defaultRate)) {
            setVatPercentage(parseFloat(taxSettings.defaultRate) || 16);
        }
    }, [taxSettings, mode]);
    // Apply invoice settings (due days, terms) on mount (only in create mode)
    react_1.useEffect(function () {
        if (mode === 'create' && invoiceSettings) {
            if (invoiceSettings.defaultDueDays) {
                setDueDays(parseInt(invoiceSettings.defaultDueDays) || 7);
            }
            if (invoiceSettings.termsAndConditions && !terms) {
                setTerms(invoiceSettings.termsAndConditions);
            }
        }
    }, [invoiceSettings, mode]);
    // Auto-calculate due date when date or dueDays changes
    react_1.useEffect(function () {
        if (dueDateMethod === "auto" && date) {
            var d = new Date(date);
            d.setDate(d.getDate() + dueDays);
            setDueDate(d.toISOString().split('T')[0]);
        }
    }, [date, dueDays, dueDateMethod]);
    var _10 = currency_1.useCurrencySettings(), currencySymbol = _10.symbol, currencyPosition = _10.position;
    var cur = function (amount, decimals) {
        if (decimals === void 0) { decimals = 2; }
        return currency_1.formatAmount(amount, currencySymbol, currencyPosition, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    };
    react_1.useEffect(function () {
        if (clientId && clients.length > 0) {
            var selectedClient = clients.find(function (c) { return c.id === clientId; });
            if (selectedClient) {
                setClientName(selectedClient.companyName || "");
                setClientEmail(selectedClient.email || "");
                setClientAddress(selectedClient.address || "");
            }
        }
    }, [clientId, clients]);
    // Reset project when client changes
    react_1.useEffect(function () {
        if (clientId) {
            // Check if current project belongs to new client
            if (projectId && clientProjects.length > 0) {
                var belongsToClient = clientProjects.some(function (p) { return p.id === projectId; });
                if (!belongsToClient)
                    setProjectId("");
            }
        }
        else {
            setProjectId("");
        }
    }, [clientId]);
    // Handle terms and payment details updates when company info or bank details load
    react_1.useEffect(function () {
        if (mode === 'create' && companyInfo && bankDetails) {
            if (!terms && (initialData === null || initialData === void 0 ? void 0 : initialData.terms)) {
                setTerms(initialData.terms);
            }
            if (!paymentDetails && (initialData === null || initialData === void 0 ? void 0 : initialData.paymentDetails)) {
                setPaymentDetails(initialData.paymentDetails);
            }
        }
    }, [mode, companyInfo, bankDetails, initialData === null || initialData === void 0 ? void 0 : initialData.terms, initialData === null || initialData === void 0 ? void 0 : initialData.paymentDetails]);
    var calculateLineTotal = react_1.useCallback(function (qty, unitPrice, taxPercent, discountPercent) {
        if (discountPercent === void 0) { discountPercent = 0; }
        var lineSubtotal = qty * unitPrice;
        var discountAmt = (lineSubtotal * discountPercent) / 100;
        var afterDiscount = lineSubtotal - discountAmt;
        var taxAmount = (afterDiscount * taxPercent) / 100;
        return afterDiscount + taxAmount;
    }, []);
    var _11 = react_1.useMemo(function () {
        var rawSubtotal = lineItems.reduce(function (sum, item) { return sum + (item.qty * item.unitPrice); }, 0);
        var lineDiscountTotal = lineItems.reduce(function (sum, item) {
            var lineSub = item.qty * item.unitPrice;
            return sum + (lineSub * (item.discount || 0)) / 100;
        }, 0);
        var afterLineDiscounts = rawSubtotal - lineDiscountTotal;
        var docDiscountAmt = (afterLineDiscounts * documentDiscount) / 100;
        var afterAllDiscounts = afterLineDiscounts - docDiscountAmt;
        var subtotal = afterAllDiscounts;
        var vat = 0;
        var grandTotal = afterAllDiscounts;
        if (applyVAT) {
            if (taxType === "inclusive") {
                grandTotal = afterAllDiscounts;
                vat = afterAllDiscounts - (afterAllDiscounts / (1 + vatPercentage / 100));
                subtotal = grandTotal - vat;
            }
            else {
                subtotal = afterAllDiscounts;
                vat = (subtotal * vatPercentage) / 100;
                grandTotal = subtotal + vat;
            }
        }
        return { subtotal: subtotal, lineDiscountTotal: lineDiscountTotal, vat: vat, grandTotal: grandTotal };
    }, [lineItems, applyVAT, vatPercentage, taxType, documentDiscount]), subtotal = _11.subtotal, lineDiscountTotal = _11.lineDiscountTotal, vat = _11.vat, grandTotal = _11.grandTotal;
    var addLineItem = react_1.useCallback(function () {
        setLineItems(function (prev) { return __spreadArrays(prev, [{ id: Date.now().toString(), sno: prev.length + 1, description: "", uom: "Pcs", qty: 1, unitPrice: 0, tax: 0, discount: 0, total: 0 }]); });
    }, []);
    var updateLineItem = react_1.useCallback(function (id, field, value) {
        setLineItems(function (prev) { return prev.map(function (item) {
            var _a;
            if (item.id === id) {
                var updatedItem = __assign(__assign({}, item), (_a = {}, _a[field] = value, _a));
                if (field === 'qty' || field === 'unitPrice' || field === 'tax' || field === 'discount') {
                    updatedItem.total = calculateLineTotal(updatedItem.qty, updatedItem.unitPrice, updatedItem.tax, updatedItem.discount);
                }
                return updatedItem;
            }
            return item;
        }); });
    }, [calculateLineTotal]);
    var getFormData = react_1.useCallback(function () { return ({
        id: initialData === null || initialData === void 0 ? void 0 : initialData.id, documentNumber: documentNumber, type: type, date: date, dueDate: dueDate,
        clientId: clientMode === "new" ? undefined : clientId,
        clientName: clientMode === "new" ? (newClientFirstName + " " + newClientLastName).trim() : clientName,
        clientEmail: clientMode === "new" ? newClientEmail : clientEmail,
        clientAddress: clientAddress, projectId: projectId, category: category, lineItems: lineItems, subtotal: subtotal, vat: vat, grandTotal: grandTotal, documentDiscount: documentDiscount, lineDiscountTotal: lineDiscountTotal, notes: notes, terms: terms, paymentDetails: paymentDetails, applyVAT: applyVAT, taxType: taxType, vatPercentage: vatPercentage, paymentMethod: paymentMethod,
        newClient: clientMode === "new" ? { firstName: newClientFirstName, lastName: newClientLastName, companyName: newClientCompany, email: newClientEmail } : undefined
    }); }, [documentNumber, type, date, dueDate, clientId, clientMode, clientName, clientEmail, clientAddress, newClientFirstName, newClientLastName, newClientCompany, newClientEmail, projectId, category, lineItems, subtotal, vat, grandTotal, documentDiscount, lineDiscountTotal, notes, terms, paymentDetails, applyVAT, taxType, vatPercentage, paymentMethod, initialData === null || initialData === void 0 ? void 0 : initialData.id]);
    var handlePrint = function () {
        var printWindow = window.open('', '_blank');
        if (!printWindow) {
            sonner_1.toast.error("Please allow popups to print");
            return;
        }
        var title = type.toUpperCase();
        var logoHtml = (companyInfo === null || companyInfo === void 0 ? void 0 : companyInfo.companyLogo) ? "<img src=\"" + companyInfo.companyLogo + "\" style=\"max-height: 80px; margin-bottom: 15px;\" />"
            : "<div class=\"document-title\">" + title + "</div>";
        var html = "\n      <!DOCTYPE html>\n      <html>\n        <head>\n          <title>" + title + " " + documentNumber + "</title>\n          <style>\n            body { font-family: sans-serif; padding: 40px; color: #333; }\n            .header { display: flex; justify-content: space-between; margin-bottom: 40px; }\n            .company-info { max-width: 50%; }\n            .document-title { font-size: 24px; font-weight: bold; color: #2563eb; }\n            .doc-details { text-align: right; }\n            table { width: 100%; border-collapse: collapse; margin: 20px 0; }\n            th { background: #f3f4f6; text-align: left; padding: 12px; }\n            td { padding: 12px; border-bottom: 1px solid #e5e7eb; }\n            .text-right { text-align: right; }\n            .totals { width: 300px; margin-left: auto; margin-top: 20px; }\n            .total-row { display: flex; justify-content: space-between; padding: 8px 0; }\n            .grand-total { font-weight: bold; font-size: 1.2em; border-top: 2px solid #e5e7eb; margin-top: 8px; padding-top: 8px; }\n            .footer { margin-top: 60px; text-align: center; font-size: 0.8em; color: #888; border-top: 1px solid #eee; padding-top: 10px; }\n            .terms-section { margin-top: 40px; }\n            .section-title { font-weight: bold; margin-bottom: 8px; font-size: 0.95em; }\n            .section-content { white-space: pre-wrap; font-size: 0.9em; color: #444; margin-bottom: 20px; }\n            .two-column { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }\n            .column-box { border: 1px solid #e5e7eb; padding: 12px; border-radius: 4px; }\n          </style>\n        </head>\n        <body>\n          <div class=\"header\">\n            <div class=\"company-info\">\n              " + logoHtml + "\n              <p style=\"font-size: 0.9em; margin-top: 10px;\">\n                " + ((companyInfo === null || companyInfo === void 0 ? void 0 : companyInfo.companyAddress) || 'Nairobi, Kenya') + "<br>\n                " + ((companyInfo === null || companyInfo === void 0 ? void 0 : companyInfo.companyCity) || '') + " " + ((companyInfo === null || companyInfo === void 0 ? void 0 : companyInfo.companyCountry) || '') + "<br>\n                Email: " + ((companyInfo === null || companyInfo === void 0 ? void 0 : companyInfo.companyEmail) || '') + "<br>\n                Phone: " + ((companyInfo === null || companyInfo === void 0 ? void 0 : companyInfo.companyPhone) || '') + "\n              </p>\n            </div>\n            <div class=\"doc-details\">\n              <div class=\"document-title\">" + title + "</div>\n              <p><strong>Number:</strong> " + documentNumber + "</p>\n              <p><strong>Date:</strong> " + date + "</p>\n              " + (dueDate ? "<p><strong>Due Date:</strong> " + dueDate + "</p>" : '') + "\n            </div>\n          </div>\n          \n          <div style=\"margin-bottom: 30px\">\n            <div class=\"section-title\">Bill To:</div>\n            <div class=\"section-content\">" + clientName + "<br>" + clientAddress + "</div>\n          </div>\n\n          <table>\n            <thead>\n              <tr>\n                <th>Description</th>\n                <th class=\"text-right\">Qty</th>\n                <th class=\"text-right\">Rate</th>\n                <th class=\"text-right\">Disc %</th>\n                <th class=\"text-right\">Total</th>\n              </tr>\n            </thead>\n            <tbody>\n              " + lineItems.map(function (item) { return "\n                <tr>\n                  <td>" + item.description + "</td>\n                  <td class=\"text-right\">" + item.qty + "</td>\n                  <td class=\"text-right\">" + currencySymbol + " " + item.unitPrice.toLocaleString() + "</td>\n                  <td class=\"text-right\">" + (item.discount || 0) + "%</td>\n                  <td class=\"text-right\">" + currencySymbol + " " + (item.qty * item.unitPrice * (1 - (item.discount || 0) / 100)).toLocaleString() + "</td>\n                </tr>\n              "; }).join('') + "\n            </tbody>\n          </table>\n\n          <div class=\"totals\">\n            <div class=\"total-row\"><span>Subtotal:</span><span>" + currencySymbol + " " + lineItems.reduce(function (s, i) { return s + i.qty * i.unitPrice; }, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "</span></div>\n            " + (lineDiscountTotal > 0 ? "<div class=\"total-row\"><span>Line Discounts:</span><span>-" + currencySymbol + " " + lineDiscountTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "</span></div>" : '') + "\n            " + (documentDiscount > 0 ? "<div class=\"total-row\"><span>Discount (" + documentDiscount + "%):</span><span>-" + currencySymbol + " " + ((lineItems.reduce(function (s, i) { return s + i.qty * i.unitPrice; }, 0) - lineDiscountTotal) * documentDiscount / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "</span></div>" : '') + "\n            <div class=\"total-row\"><span>Net Amount:</span><span>" + currencySymbol + " " + subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "</span></div>\n            " + (applyVAT ? "<div class=\"total-row\"><span>VAT (" + vatPercentage + "%) " + (taxType === 'inclusive' ? '(Incl.)' : '(Excl.)') + ":</span><span>" + currencySymbol + " " + vat.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "</span></div>" : '') + "\n            <div class=\"total-row grand-total\"><span>Grand Total:</span><span>" + currencySymbol + " " + grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "</span></div>\n          </div>\n          \n          <div class=\"terms-section\">\n            <div class=\"two-column\">\n              <div class=\"column-box\">\n                <div class=\"section-title\">Terms & Conditions:</div>\n                <div class=\"section-content\">" + terms + "</div>\n              </div>\n              <div class=\"column-box\">\n                <div class=\"section-title\">Payment Details:</div>\n                <div class=\"section-content\">" + paymentDetails + "</div>\n              </div>\n            </div>\n            \n            " + (notes ? "<div class=\"section-title\">Notes:</div><div class=\"section-content\">" + notes + "</div>" : '') + "\n          </div>\n          \n          <div class=\"footer\">\n            This is a system generated " + type + " from " + ((companyInfo === null || companyInfo === void 0 ? void 0 : companyInfo.companyName) || const_1.APP_TITLE) + ".\n          </div>\n          \n          <script>\n            window.onload = () => {\n              setTimeout(() => {\n                window.print();\n                window.close();\n              }, 500);\n            };\n          </script>\n        </body>\n      </html>\n    ";
        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();
    };
    if (isLoading)
        return React.createElement("div", { className: "p-8 text-center" }, "Loading...");
    var typeLabel = type === "estimate" ? "Estimate" : type === "receipt" ? "Receipt" : type === "payment" ? "Payment" : "Invoice";
    var dateLabelMap = { invoice: "Invoice Date", estimate: "Estimate Date", receipt: "Receipt Date", payment: "Payment Date" };
    var dueDateLabelMap = { invoice: "Due Date", estimate: "Valid Until", receipt: "Date", payment: "Due Date" };
    return (React.createElement("div", { className: "max-w-7xl mx-auto p-6 space-y-6" },
        React.createElement(card_1.Card, { className: "p-6" },
            React.createElement("div", { className: "flex justify-between mb-6" },
                React.createElement("div", { className: "flex flex-col gap-2" },
                    (companyInfo === null || companyInfo === void 0 ? void 0 : companyInfo.companyLogo) ? (React.createElement("img", { src: companyInfo.companyLogo, alt: "Logo", className: "h-16 w-auto object-contain" })) : (React.createElement("h1", { className: "text-3xl font-bold text-primary" }, typeLabel)),
                    (companyInfo === null || companyInfo === void 0 ? void 0 : companyInfo.companyLogo) && React.createElement("h1", { className: "text-xl font-bold text-primary" }, typeLabel)),
                React.createElement("div", { className: "text-right" },
                    React.createElement("p", { className: "font-bold" }, (companyInfo === null || companyInfo === void 0 ? void 0 : companyInfo.companyName) || const_1.APP_TITLE),
                    React.createElement("p", { className: "text-sm text-muted-foreground" },
                        (companyInfo === null || companyInfo === void 0 ? void 0 : companyInfo.companyAddress) || 'Nairobi, Kenya',
                        React.createElement("br", null),
                        (companyInfo === null || companyInfo === void 0 ? void 0 : companyInfo.companyPhone) || ''))),
            React.createElement("div", { className: "space-y-4 mb-6" },
                React.createElement("div", { className: "flex items-center justify-between" },
                    React.createElement(label_1.Label, { className: "text-base font-semibold" }, "Client"),
                    React.createElement("div", { className: "flex gap-1 text-sm" },
                        React.createElement("button", { type: "button", className: "px-3 py-1 rounded-l-md border text-xs font-medium transition-colors " + (clientMode === "existing" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"), onClick: function () { return setClientMode("existing"); } }, "Existing Client"),
                        React.createElement("button", { type: "button", className: "px-3 py-1 rounded-r-md border text-xs font-medium transition-colors " + (clientMode === "new" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"), onClick: function () { return setClientMode("new"); } }, "New Client"))),
                clientMode === "existing" ? (React.createElement("div", { className: "grid gap-4" },
                    React.createElement("div", { className: "grid grid-cols-[140px_1fr] items-center gap-3" },
                        React.createElement(label_1.Label, { className: "text-right text-sm" }, "Client *"),
                        React.createElement(select_1.Select, { value: clientId, onValueChange: setClientId },
                            React.createElement(select_1.SelectTrigger, null,
                                React.createElement(select_1.SelectValue, { placeholder: "Search or select client..." })),
                            React.createElement(select_1.SelectContent, null, clients.map(function (c) { return (React.createElement(select_1.SelectItem, { key: c.id, value: c.id },
                                React.createElement("span", { className: "flex items-center gap-2" },
                                    React.createElement(lucide_react_1.Building2, { className: "h-3 w-3 text-muted-foreground" }),
                                    c.companyName || c.name || "Unknown Client"))); })))),
                    React.createElement("div", { className: "grid grid-cols-[140px_1fr] items-center gap-3" },
                        React.createElement(label_1.Label, { className: "text-right text-sm" }, "Project"),
                        React.createElement(select_1.Select, { value: projectId, onValueChange: setProjectId, disabled: !clientId },
                            React.createElement(select_1.SelectTrigger, null,
                                React.createElement(select_1.SelectValue, { placeholder: clientId ? "Select project (optional)" : "Select a client first" })),
                            React.createElement(select_1.SelectContent, null,
                                React.createElement(select_1.SelectItem, { value: "none" }, "No Project"),
                                clientProjects.map(function (p) { return (React.createElement(select_1.SelectItem, { key: p.id, value: p.id }, p.name || p.title)); })))))) : (React.createElement("div", { className: "grid gap-3 p-4 bg-muted/30 rounded-lg border border-dashed" },
                    React.createElement("div", { className: "grid grid-cols-[140px_1fr] items-center gap-3" },
                        React.createElement(label_1.Label, { className: "text-right text-sm" }, "Company Name"),
                        React.createElement(input_1.Input, { value: newClientCompany, onChange: function (e) { return setNewClientCompany(e.target.value); }, placeholder: "Company name (optional)" })),
                    React.createElement("div", { className: "grid grid-cols-[140px_1fr] items-center gap-3" },
                        React.createElement(label_1.Label, { className: "text-right text-sm" }, "First Name *"),
                        React.createElement(input_1.Input, { value: newClientFirstName, onChange: function (e) { return setNewClientFirstName(e.target.value); }, placeholder: "First name" })),
                    React.createElement("div", { className: "grid grid-cols-[140px_1fr] items-center gap-3" },
                        React.createElement(label_1.Label, { className: "text-right text-sm" }, "Last Name *"),
                        React.createElement(input_1.Input, { value: newClientLastName, onChange: function (e) { return setNewClientLastName(e.target.value); }, placeholder: "Last name" })),
                    React.createElement("div", { className: "grid grid-cols-[140px_1fr] items-center gap-3" },
                        React.createElement(label_1.Label, { className: "text-right text-sm" }, "Email *"),
                        React.createElement(input_1.Input, { type: "email", value: newClientEmail, onChange: function (e) { return setNewClientEmail(e.target.value); }, placeholder: "Email address" }))))),
            React.createElement(separator_1.Separator, { className: "my-4" }),
            React.createElement("div", { className: "grid gap-4" },
                React.createElement("div", { className: "grid grid-cols-[140px_1fr] items-center gap-3" },
                    React.createElement(label_1.Label, { className: "text-right text-sm" },
                        dateLabelMap[type] || "Date",
                        " *"),
                    React.createElement(input_1.Input, { type: "date", value: date, onChange: function (e) { return setDate(e.target.value); }, className: "max-w-xs" })),
                type !== 'receipt' && (React.createElement("div", { className: "grid grid-cols-[140px_1fr_auto] items-center gap-3" },
                    React.createElement(label_1.Label, { className: "text-right text-sm" },
                        dueDateLabelMap[type] || "Due Date",
                        " *"),
                    dueDateMethod === "auto" ? (React.createElement(input_1.Input, { value: (dateLabelMap[type] || "Date") + " + " + dueDays + " days", readOnly: true, className: "bg-muted cursor-not-allowed max-w-xs text-sm" })) : (React.createElement(input_1.Input, { type: "date", value: dueDate, onChange: function (e) { return setDueDate(e.target.value); }, className: "max-w-xs" })),
                    React.createElement(select_1.Select, { value: dueDateMethod, onValueChange: function (v) { return setDueDateMethod(v); } },
                        React.createElement(select_1.SelectTrigger, { className: "w-[170px]" },
                            React.createElement(select_1.SelectValue, null)),
                        React.createElement(select_1.SelectContent, null,
                            React.createElement(select_1.SelectItem, { value: "auto" }, "Set Automatically"),
                            React.createElement(select_1.SelectItem, { value: "manual" }, "Set Manually"))))),
                type === 'receipt' && (React.createElement("div", { className: "grid grid-cols-[140px_1fr] items-center gap-3" },
                    React.createElement(label_1.Label, { className: "text-right text-sm" }, "Payment Method"),
                    React.createElement(select_1.Select, { value: paymentMethod, onValueChange: setPaymentMethod },
                        React.createElement(select_1.SelectTrigger, { className: "max-w-xs" },
                            React.createElement(select_1.SelectValue, null)),
                        React.createElement(select_1.SelectContent, null, paymentMethods_1.getPaymentMethodOptions().map(function (method) { return (React.createElement(select_1.SelectItem, { key: method.value, value: method.value }, method.label)); }))))),
                React.createElement("div", { className: "grid grid-cols-[140px_1fr] items-center gap-3" },
                    React.createElement(label_1.Label, { className: "text-right text-sm" }, "Category *"),
                    React.createElement(select_1.Select, { value: category, onValueChange: setCategory },
                        React.createElement(select_1.SelectTrigger, { className: "max-w-xs" },
                            React.createElement(select_1.SelectValue, null)),
                        React.createElement(select_1.SelectContent, null,
                            React.createElement(select_1.SelectItem, { value: "default" }, "Default"),
                            React.createElement(select_1.SelectItem, { value: "services" }, "Services"),
                            React.createElement(select_1.SelectItem, { value: "products" }, "Products"),
                            React.createElement(select_1.SelectItem, { value: "consulting" }, "Consulting"),
                            React.createElement(select_1.SelectItem, { value: "maintenance" }, "Maintenance")))),
                React.createElement("div", { className: "grid grid-cols-[140px_1fr] items-center gap-3" },
                    React.createElement(label_1.Label, { className: "text-right text-sm" }, "Number"),
                    React.createElement(input_1.Input, { value: documentNumber, readOnly: true, className: "bg-muted cursor-not-allowed font-mono max-w-xs", placeholder: "Generating..." }))),
            React.createElement(separator_1.Separator, { className: "my-4" }),
            React.createElement(collapsible_1.Collapsible, { open: showAdditionalInfo, onOpenChange: setShowAdditionalInfo },
                React.createElement(collapsible_1.CollapsibleTrigger, { asChild: true },
                    React.createElement("button", { type: "button", className: "flex items-center justify-between w-full py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors" },
                        React.createElement("span", null, "Additional Information"),
                        showAdditionalInfo ? React.createElement(lucide_react_1.ChevronUp, { className: "h-4 w-4" }) : React.createElement(lucide_react_1.ChevronDown, { className: "h-4 w-4" }))),
                React.createElement(collapsible_1.CollapsibleContent, { className: "space-y-4 pt-3" },
                    React.createElement("div", { className: "grid grid-cols-[140px_1fr] items-start gap-3" },
                        React.createElement(label_1.Label, { className: "text-right text-sm pt-2" }, "Notes"),
                        React.createElement(textarea_1.Textarea, { value: notes, onChange: function (e) { return setNotes(e.target.value); }, rows: 3, placeholder: "Additional notes..." })),
                    React.createElement("div", { className: "grid grid-cols-[140px_1fr] items-start gap-3" },
                        React.createElement(label_1.Label, { className: "text-right text-sm pt-2" }, "Terms"),
                        React.createElement(textarea_1.Textarea, { value: terms, onChange: function (e) { return setTerms(e.target.value); }, rows: 4, placeholder: "Terms and conditions..." })),
                    React.createElement("div", { className: "grid grid-cols-[140px_1fr] items-start gap-3" },
                        React.createElement(label_1.Label, { className: "text-right text-sm pt-2" }, "Payment Details"),
                        React.createElement(textarea_1.Textarea, { value: paymentDetails, onChange: function (e) { return setPaymentDetails(e.target.value); }, rows: 4, placeholder: "Bank details, M-Pesa, etc..." }))))),
        React.createElement(card_1.Card, { className: "p-6" },
            React.createElement("div", { className: "flex justify-between mb-4" },
                React.createElement("h2", { className: "text-xl font-semibold" }, "Items"),
                React.createElement(button_1.Button, { onClick: addLineItem, size: "sm" },
                    React.createElement(lucide_react_1.Plus, { className: "h-4 w-4 mr-2" }),
                    "Add Item")),
            React.createElement("div", { className: "overflow-x-auto" },
                React.createElement("table", { className: "w-full border-collapse" },
                    React.createElement("thead", null,
                        React.createElement("tr", { className: "bg-muted" },
                            React.createElement("th", { className: "p-2 text-left" }, "Description"),
                            React.createElement("th", { className: "p-2 text-right w-24" }, "Qty"),
                            React.createElement("th", { className: "p-2 text-right w-32" }, "Rate"),
                            React.createElement("th", { className: "p-2 text-right w-24" }, "Disc %"),
                            React.createElement("th", { className: "p-2 text-right w-32" }, "Total"),
                            React.createElement("th", { className: "p-2 w-16" }))),
                    React.createElement("tbody", null, lineItems.map(function (item) { return (React.createElement("tr", { key: item.id },
                        React.createElement("td", { className: "p-2 border" },
                            React.createElement(input_1.Input, { value: item.description, onChange: function (e) { return updateLineItem(item.id, 'description', e.target.value); }, placeholder: "Item description" })),
                        React.createElement("td", { className: "p-2 border" },
                            React.createElement(input_1.Input, { type: "number", value: item.qty, onChange: function (e) { return updateLineItem(item.id, 'qty', parseInt(e.target.value) || 0); }, className: "text-right" })),
                        React.createElement("td", { className: "p-2 border" },
                            React.createElement(input_1.Input, { type: "number", value: item.unitPrice, onChange: function (e) { return updateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0); }, className: "text-right" })),
                        React.createElement("td", { className: "p-2 border" },
                            React.createElement(input_1.Input, { type: "number", value: item.discount, onChange: function (e) { return updateLineItem(item.id, 'discount', parseFloat(e.target.value) || 0); }, className: "text-right", min: 0, max: 100, placeholder: "0" })),
                        React.createElement("td", { className: "p-2 border text-right font-mono" }, cur(item.qty * item.unitPrice * (1 - (item.discount || 0) / 100))),
                        React.createElement("td", { className: "p-2 border" },
                            React.createElement(button_1.Button, { variant: "ghost", size: "icon", onClick: function () { return setLineItems(lineItems.filter(function (li) { return li.id !== item.id; })); }, className: "h-8 w-8" },
                                React.createElement(lucide_react_1.Trash2, { className: "h-4 w-4 text-destructive" }))))); })))),
            React.createElement("div", { className: "flex justify-end mt-6" },
                React.createElement("div", { className: "w-80 space-y-4" },
                    React.createElement("div", { className: "flex items-center justify-between p-2 bg-muted rounded-md" },
                        React.createElement(label_1.Label, { className: "text-sm font-medium" }, "Tax Type"),
                        React.createElement("div", { className: "flex gap-1" },
                            React.createElement(button_1.Button, { variant: taxType === "exclusive" ? "default" : "outline", size: "sm", onClick: function () { return setTaxType("exclusive"); }, className: "h-7 text-xs" }, "Exclusive"),
                            React.createElement(button_1.Button, { variant: taxType === "inclusive" ? "default" : "outline", size: "sm", onClick: function () { return setTaxType("inclusive"); }, className: "h-7 text-xs" }, "Inclusive"))),
                    React.createElement("div", { className: "space-y-2 px-2" },
                        React.createElement("div", { className: "flex justify-between text-sm" },
                            React.createElement("span", null, "Subtotal:"),
                            React.createElement("span", { className: "font-mono" }, cur(lineItems.reduce(function (sum, item) { return sum + (item.qty * item.unitPrice); }, 0)))),
                        lineDiscountTotal > 0 && (React.createElement("div", { className: "flex justify-between text-sm text-orange-600" },
                            React.createElement("span", null, "Line Discounts:"),
                            React.createElement("span", { className: "font-mono" },
                                "-",
                                cur(lineDiscountTotal)))),
                        React.createElement("div", { className: "flex items-center justify-between text-sm" },
                            React.createElement("span", { className: "flex items-center gap-2" },
                                "Discount %:",
                                React.createElement(input_1.Input, { type: "number", value: documentDiscount, onChange: function (e) { return setDocumentDiscount(parseFloat(e.target.value) || 0); }, className: "w-20 h-7 text-right text-xs", min: 0, max: 100, placeholder: "0" })),
                            documentDiscount > 0 && (React.createElement("span", { className: "font-mono text-orange-600" },
                                "-",
                                cur((lineItems.reduce(function (sum, item) { return sum + (item.qty * item.unitPrice); }, 0) - lineDiscountTotal) * documentDiscount / 100)))),
                        React.createElement("div", { className: "flex justify-between text-sm" },
                            React.createElement("span", null, "Net Amount:"),
                            React.createElement("span", { className: "font-mono" }, cur(subtotal))),
                        applyVAT && (React.createElement("div", { className: "flex justify-between text-sm text-muted-foreground" },
                            React.createElement("span", null,
                                "VAT (",
                                vatPercentage,
                                "%) ",
                                taxType === 'inclusive' ? '(Incl.)' : '(Excl.)',
                                ":"),
                            React.createElement("span", { className: "font-mono" }, cur(vat)))),
                        React.createElement(separator_1.Separator, null),
                        React.createElement("div", { className: "flex justify-between font-bold text-lg" },
                            React.createElement("span", null, "Grand Total:"),
                            React.createElement("span", { className: "font-mono" }, cur(grandTotal))))))),
        React.createElement("div", { className: "flex justify-between items-center" },
            React.createElement("p", { className: "text-xs text-muted-foreground" },
                React.createElement("strong", null, "* Required"),
                " \u00A0|\u00A0 Recurring options available after creation"),
            React.createElement("div", { className: "flex gap-2" },
                React.createElement(button_1.Button, { variant: "outline", onClick: handlePrint },
                    React.createElement(lucide_react_1.Printer, { className: "mr-2 h-4 w-4" }),
                    "Print"),
                React.createElement(button_1.Button, { variant: "outline", onClick: function () { return onSave === null || onSave === void 0 ? void 0 : onSave(__assign(__assign({}, getFormData()), { status: 'draft' })); }, disabled: isSaving },
                    React.createElement(lucide_react_1.Save, { className: "mr-2 h-4 w-4" }),
                    "Save Draft"),
                React.createElement(button_1.Button, { onClick: function () { return onSave === null || onSave === void 0 ? void 0 : onSave(getFormData()); }, disabled: isSaving },
                    isSaving && React.createElement(lucide_react_1.Loader2, { className: "mr-2 h-4 w-4 animate-spin" }),
                    "Save & Continue")))));
}
exports["default"] = DocumentForm;
