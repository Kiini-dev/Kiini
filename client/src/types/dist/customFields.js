"use strict";
/**
 * Phase 10: Custom Fields Type Definitions
 * Used for form customization and field management
 */
exports.__esModule = true;
exports.VALIDATION_RULE_TYPES = exports.FIELD_TYPE_LABELS = exports.FIELD_TYPES = exports.ENTITY_TYPES = void 0;
exports.ENTITY_TYPES = ['Contact', 'Invoice', 'Project', 'Employee', 'Account', 'Opportunity', 'Service', 'Product', 'user'];
exports.FIELD_TYPES = ['text', 'number', 'date', 'select', 'multiSelect', 'checkbox', 'richText', 'file', 'currency', 'email', 'phone'];
exports.FIELD_TYPE_LABELS = {
    text: 'Text',
    number: 'Number',
    date: 'Date',
    select: 'Dropdown',
    multiSelect: 'Multi-select',
    checkbox: 'Checkbox',
    richText: 'Rich Text',
    file: 'File Upload',
    currency: 'Currency',
    email: 'Email',
    phone: 'Phone'
};
exports.VALIDATION_RULE_TYPES = [
    'required',
    'minLength',
    'maxLength',
    'pattern',
    'range',
    'email',
    'phone',
    'unique',
    'minimum',
    'maximum',
];
