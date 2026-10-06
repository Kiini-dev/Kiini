"use strict";
/**
 * Application-wide constants and enums
 */
exports.__esModule = true;
exports.FREQUENCY_OPTIONS = exports.APPROVAL_STATUSES = exports.DOCUMENT_STATUSES = exports.PAYMENT_METHOD_LABELS = exports.PAYMENT_METHODS = void 0;
// Standardized Payment Methods (used across all forms)
exports.PAYMENT_METHODS = [
    { value: 'card', label: 'Card', description: 'Credit/Debit Card' },
    { value: 'bank_transfer', label: 'Bank Transfer', description: 'Direct Bank Transfer' },
    { value: 'cash', label: 'Cash', description: 'Physical Cash Payment' },
    { value: 'mpesa', label: 'M-Pesa', description: 'M-Pesa Mobile Payment' },
    { value: 'cheque', label: 'Cheque', description: 'Cheque Payment' },
    { value: 'other', label: 'Other', description: 'Other Payment Method' },
];
exports.PAYMENT_METHOD_LABELS = {
    card: 'Card',
    bank_transfer: 'Bank Transfer',
    cash: 'Cash',
    mpesa: 'M-Pesa',
    cheque: 'Cheque',
    other: 'Other'
};
// Document Status
exports.DOCUMENT_STATUSES = [
    { value: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-800' },
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'approved', label: 'Approved', color: 'bg-green-100 text-green-800' },
    { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' },
    { value: 'sent', label: 'Sent', color: 'bg-blue-100 text-blue-800' },
    { value: 'paid', label: 'Paid', color: 'bg-green-100 text-green-800' },
];
// Approval Status
exports.APPROVAL_STATUSES = [
    { value: 'pending', label: 'Pending Review', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'approved', label: 'Approved', color: 'bg-green-100 text-green-800' },
    { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' },
    { value: 'withdrawn', label: 'Withdrawn', color: 'bg-gray-100 text-gray-800' },
];
// Frequencies for recurring items
exports.FREQUENCY_OPTIONS = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'biweekly', label: 'Bi-weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'annually', label: 'Annually' },
];
