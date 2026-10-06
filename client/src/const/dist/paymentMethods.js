"use strict";
/**
 * Standardized payment methods across the application
 */
var _a;
exports.__esModule = true;
exports.getPaymentMethodOptions = exports.PAYMENT_METHOD_LABELS = exports.PAYMENT_METHODS = void 0;
exports.PAYMENT_METHODS = {
    CARD: "card",
    BANK_TRANSFER: "bank_transfer",
    CASH: "cash",
    MPESA: "mpesa",
    CHEQUE: "cheque",
    OTHER: "other"
};
exports.PAYMENT_METHOD_LABELS = (_a = {},
    _a[exports.PAYMENT_METHODS.CARD] = "Card",
    _a[exports.PAYMENT_METHODS.BANK_TRANSFER] = "Bank Transfer",
    _a[exports.PAYMENT_METHODS.CASH] = "Cash",
    _a[exports.PAYMENT_METHODS.MPESA] = "M-Pesa",
    _a[exports.PAYMENT_METHODS.CHEQUE] = "Cheque",
    _a[exports.PAYMENT_METHODS.OTHER] = "Other",
    _a);
/**
 * Get array of payment methods with labels for UI rendering
 */
exports.getPaymentMethodOptions = function () {
    return Object.entries(exports.PAYMENT_METHOD_LABELS).map(function (_a) {
        var value = _a[0], label = _a[1];
        return ({
            value: value,
            label: label
        });
    });
};
