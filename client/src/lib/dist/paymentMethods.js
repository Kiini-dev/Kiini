"use strict";
/**
 * Standardized payment method options used across all forms in the application
 * This ensures consistency across all payment-related features
 */
exports.__esModule = true;
exports.getPaymentMethodColor = exports.getPaymentMethodLabel = exports.PAYMENT_METHOD_VALUES = exports.PAYMENT_METHODS = void 0;
exports.PAYMENT_METHODS = [
    { value: "card", label: "Card", color: "bg-orange-500/10 text-orange-500" },
    { value: "bank_transfer", label: "Bank Transfer", color: "bg-blue-500/10 text-blue-500" },
    { value: "cash", label: "Cash", color: "bg-green-500/10 text-green-500" },
    { value: "mpesa", label: "M-Pesa", color: "bg-emerald-500/10 text-emerald-500" },
    { value: "cheque", label: "Cheque", color: "bg-purple-500/10 text-purple-500" },
    { value: "other", label: "Other", color: "bg-gray-500/10 text-gray-500" },
];
exports.PAYMENT_METHOD_VALUES = exports.PAYMENT_METHODS.map(function (m) { return m.value; });
exports.getPaymentMethodLabel = function (value) {
    var method = exports.PAYMENT_METHODS.find(function (m) { return m.value === value; });
    return (method === null || method === void 0 ? void 0 : method.label) || value;
};
exports.getPaymentMethodColor = function (value) {
    var method = exports.PAYMENT_METHODS.find(function (m) { return m.value === value; });
    return (method === null || method === void 0 ? void 0 : method.color) || "bg-gray-500/10 text-gray-500";
};
