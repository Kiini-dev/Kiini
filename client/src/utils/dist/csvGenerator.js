"use strict";
/**
 * Client-side CSV Template Generator
 */
exports.__esModule = true;
exports.parseCSV = exports.getModuleKeys = exports.generateCSVTemplateFile = exports.generateCSVTemplate = exports.getAvailableModules = void 0;
var moduleDefinitions = {
    clients: {
        description: 'Import client companies and contacts',
        columns: [
            { key: 'companyName', label: 'Company Name', required: true, example: 'Acme Corp Ltd' },
            { key: 'contactPerson', label: 'Contact Person', example: 'John Smith' },
            { key: 'email', label: 'Email', example: 'john@acme.com' },
            { key: 'phone', label: 'Phone', example: '+254712345678' },
            { key: 'address', label: 'Address', example: '123 Main St' },
            { key: 'city', label: 'City', example: 'Nairobi' },
            { key: 'country', label: 'Country', example: 'Kenya' },
            { key: 'taxId', label: 'Tax ID / PIN', example: 'P051234567X' },
            { key: 'status', label: 'Status', example: 'active' },
            { key: 'industry', label: 'Industry', example: 'Technology' },
            { key: 'currency', label: 'Currency', example: 'KES' },
            { key: 'creditLimit', label: 'Credit Limit (cents)', example: '500000' },
            { key: 'paymentTerms', label: 'Payment Terms', example: 'net30' },
        ]
    },
    employees: {
        description: 'Import employee records',
        columns: [
            { key: 'employeeNumber', label: 'Employee Number', example: 'EMP001' },
            { key: 'firstName', label: 'First Name', required: true, example: 'Jane' },
            { key: 'lastName', label: 'Last Name', required: true, example: 'Doe' },
            { key: 'email', label: 'Email', required: true, example: 'jane.doe@company.com' },
            { key: 'phone', label: 'Phone', example: '+254712345678' },
            { key: 'gender', label: 'Gender', example: 'female' },
            { key: 'department', label: 'Department Name', example: 'Finance' },
            { key: 'position', label: 'Job Title', example: 'Accountant' },
            { key: 'employmentType', label: 'Employment Type', example: 'full_time' },
            { key: 'status', label: 'Status', example: 'active' },
            { key: 'hireDate', label: 'Hire Date (YYYY-MM-DD)', example: '2024-01-15' },
            { key: 'salary', label: 'Salary (cents)', example: '6000000' },
            { key: 'nationalId', label: 'National ID', example: '12345678' },
            { key: 'nhifNumber', label: 'NHIF Number', example: 'NHIF12345' },
            { key: 'nssfNumber', label: 'NSSF Number', example: 'NSSF12345' },
            { key: 'taxId', label: 'Tax ID (KRA PIN)', example: 'A012345678Z' },
            { key: 'bankName', label: 'Bank Name', example: 'KCB Bank' },
            { key: 'bankAccountNumber', label: 'Bank Account Number', example: '1234567890' },
        ]
    },
    departments: {
        description: 'Import department structure',
        columns: [
            { key: 'name', label: 'Department Name', required: true, example: 'Finance' },
            { key: 'description', label: 'Description', example: 'Handles financial operations' },
            { key: 'budget', label: 'Budget (cents)', example: '10000000' },
            { key: 'status', label: 'Status', example: 'active' },
            { key: 'defaultRole', label: 'Default Role', example: 'staff' },
        ]
    },
    jobGroups: {
        description: 'Import job/salary groups',
        columns: [
            { key: 'name', label: 'Job Group Name', required: true, example: 'Grade A' },
            { key: 'minimumGrossSalary', label: 'Min Gross Salary (cents)', required: true, example: '5000000' },
            { key: 'maximumGrossSalary', label: 'Max Gross Salary (cents)', required: true, example: '10000000' },
            { key: 'description', label: 'Description', example: 'Senior management grade' },
            { key: 'isActive', label: 'Is Active (yes/no)', example: 'yes' },
        ]
    },
    products: {
        description: 'Import product inventory',
        columns: [
            { key: 'name', label: 'Product Name', required: true, example: 'Office Chair' },
            { key: 'description', label: 'Description', example: 'Ergonomic office chair' },
            { key: 'sku', label: 'SKU', example: 'CHR-001' },
            { key: 'unitPrice', label: 'Unit Price (cents)', required: true, example: '2500000' },
            { key: 'stockQuantity', label: 'Stock Quantity', example: '50' },
            { key: 'category', label: 'Category', example: 'Furniture' },
            { key: 'isActive', label: 'Status (active/inactive)', example: 'active' },
        ]
    },
    services: {
        description: 'Import service catalog',
        columns: [
            { key: 'name', label: 'Service Name', required: true, example: 'Web Development' },
            { key: 'description', label: 'Description', example: 'Custom website development' },
            { key: 'category', label: 'Category', example: 'Technology' },
            { key: 'hourlyRate', label: 'Hourly Rate (cents)', example: '300000' },
            { key: 'fixedPrice', label: 'Fixed Price (cents)', example: '5000000' },
            { key: 'unit', label: 'Unit', example: 'hour' },
            { key: 'isActive', label: 'Status (active/inactive)', example: 'active' },
        ]
    },
    accounts: {
        description: 'Import chart of accounts',
        columns: [
            { key: 'accountCode', label: 'Account Code', required: true, example: '1001' },
            { key: 'accountName', label: 'Account Name', required: true, example: 'Cash & Cash Equivalents' },
            { key: 'accountType', label: 'Account Type', required: true, example: 'asset' },
            { key: 'description', label: 'Description', example: 'Primary cash account' },
            { key: 'isActive', label: 'Is Active (yes/no)', example: 'yes' },
        ]
    },
    bankAccounts: {
        description: 'Import bank account details',
        columns: [
            { key: 'accountName', label: 'Account Name', required: true, example: 'Main Operations Account' },
            { key: 'bankName', label: 'Bank Name', required: true, example: 'KCB Bank' },
            { key: 'accountNumber', label: 'Account Number', required: true, example: '1234567890' },
            { key: 'currency', label: 'Currency', example: 'KES' },
            { key: 'balance', label: 'Opening Balance (cents)', example: '100000000' },
            { key: 'isActive', label: 'Is Active (yes/no)', example: 'yes' },
        ]
    },
    expenses: {
        description: 'Import expense records',
        columns: [
            { key: 'category', label: 'Category', required: true, example: 'Office Supplies' },
            { key: 'amount', label: 'Amount (cents)', required: true, example: '50000' },
            { key: 'expenseDate', label: 'Expense Date (YYYY-MM-DD)', required: true, example: '2024-06-15' },
            { key: 'vendor', label: 'Vendor', example: 'Office World Ltd' },
            { key: 'description', label: 'Description', example: 'Monthly stationery supplies' },
            { key: 'paymentMethod', label: 'Payment Method', example: 'mpesa' },
            { key: 'status', label: 'Status', example: 'approved' },
        ]
    },
    suppliers: {
        description: 'Import supplier/vendor details',
        columns: [
            { key: 'companyName', label: 'Company Name', required: true, example: 'Best Supplies Ltd' },
            { key: 'contactPerson', label: 'Contact Person', example: 'Alice Mwangi' },
            { key: 'email', label: 'Email', example: 'alice@bestsupplies.com' },
            { key: 'phone', label: 'Phone', example: '+254722000000' },
            { key: 'address', label: 'Address', example: '45 Industrial Area' },
            { key: 'city', label: 'City', example: 'Nairobi' },
            { key: 'postalCode', label: 'Postal Code', example: '00100' },
            { key: 'taxIdPin', label: 'Tax ID / PIN', example: 'P051234567X' },
            { key: 'website', label: 'Website', example: 'https://bestsupplies.com' },
            { key: 'paymentTerms', label: 'Payment Terms', example: 'net30' },
            { key: 'notes', label: 'Notes', example: 'Preferred supplier' },
        ]
    },
    invoices: {
        description: 'Export invoice data (read-only template)',
        columns: [
            { key: 'invoiceNumber', label: 'Invoice Number', required: true, example: 'INV-2024-001' },
            { key: 'clientId', label: 'Client ID', required: true, example: 'uuid-here' },
            { key: 'title', label: 'Title', example: 'Web Development Services' },
            { key: 'status', label: 'Status', example: 'draft' },
            { key: 'issueDate', label: 'Issue Date (YYYY-MM-DD)', example: '2024-06-01' },
            { key: 'dueDate', label: 'Due Date (YYYY-MM-DD)', example: '2024-07-01' },
            { key: 'subtotal', label: 'Subtotal (cents)', example: '10000000' },
            { key: 'taxAmount', label: 'Tax Amount (cents)', example: '1600000' },
            { key: 'total', label: 'Total (cents)', example: '11600000' },
            { key: 'notes', label: 'Notes', example: 'Thank you for your business' },
        ]
    },
    estimates: {
        description: 'Export estimate/quote data (read-only template)',
        columns: [
            { key: 'estimateNumber', label: 'Estimate Number', required: true, example: 'EST-2024-001' },
            { key: 'clientId', label: 'Client ID', required: true, example: 'uuid-here' },
            { key: 'title', label: 'Title', example: 'IT Infrastructure Setup' },
            { key: 'status', label: 'Status', example: 'draft' },
            { key: 'issueDate', label: 'Issue Date (YYYY-MM-DD)', example: '2024-06-01' },
            { key: 'expiryDate', label: 'Expiry Date (YYYY-MM-DD)', example: '2024-07-01' },
            { key: 'subtotal', label: 'Subtotal (cents)', example: '5000000' },
            { key: 'taxAmount', label: 'Tax Amount (cents)', example: '800000' },
            { key: 'total', label: 'Total (cents)', example: '5800000' },
            { key: 'notes', label: 'Notes', example: 'Valid for 30 days' },
        ]
    },
    receipts: {
        description: 'Export receipt records (read-only template)',
        columns: [
            { key: 'receiptNumber', label: 'Receipt Number', required: true, example: 'RCP-2024-001' },
            { key: 'clientId', label: 'Client ID', required: true, example: 'uuid-here' },
            { key: 'amount', label: 'Amount (cents)', required: true, example: '11600000' },
            { key: 'paymentMethod', label: 'Payment Method', example: 'mpesa' },
            { key: 'receiptDate', label: 'Receipt Date (YYYY-MM-DD)', example: '2024-06-15' },
            { key: 'notes', label: 'Notes', example: 'Payment received in full' },
        ]
    },
    payroll: {
        description: 'Import payroll records',
        columns: [
            { key: 'employeeId', label: 'Employee ID', required: true, example: 'uuid-here' },
            { key: 'paymentDate', label: 'Payment Date (YYYY-MM-DD)', required: true, example: '2024-06-28' },
            { key: 'basicSalary', label: 'Basic Salary (cents)', required: true, example: '6000000' },
            { key: 'allowances', label: 'Allowances (cents)', example: '500000' },
            { key: 'deductions', label: 'Deductions (cents)', example: '200000' },
            { key: 'netSalary', label: 'Net Salary (cents)', example: '6300000' },
            { key: 'status', label: 'Status', example: 'processed' },
        ]
    }
};
/**
 * Get available modules for import/export
 */
function getAvailableModules() {
    return Object.keys(moduleDefinitions).map(function (id) { return ({
        id: id,
        label: id.charAt(0).toUpperCase() + id.slice(1).replace(/([A-Z])/g, ' $1'),
        description: moduleDefinitions[id].description,
        columns: moduleDefinitions[id].columns
    }); });
}
exports.getAvailableModules = getAvailableModules;
/**
 * Generate CSV template with headers and a sample row
 */
function generateCSVTemplate(moduleType) {
    var def = moduleDefinitions[moduleType];
    if (!def)
        return '';
    var headers = def.columns.map(function (c) { return c.label; });
    var sampleRow = def.columns.map(function (c) { return c.example; });
    return [
        headers.join(','),
        sampleRow.map(function (v) { return "\"" + v + "\""; }).join(','),
    ].join('\n');
}
exports.generateCSVTemplate = generateCSVTemplate;
/**
 * Generate CSV template as a downloadable Blob
 */
function generateCSVTemplateFile(moduleType) {
    var content = generateCSVTemplate(moduleType);
    return new Blob([content], { type: 'text/csv;charset=utf-8;' });
}
exports.generateCSVTemplateFile = generateCSVTemplateFile;
/**
 * Get column keys for a module (for CSV parsing)
 */
function getModuleKeys(moduleType) {
    var _a;
    return (((_a = moduleDefinitions[moduleType]) === null || _a === void 0 ? void 0 : _a.columns) || []).map(function (c) { return c.key; });
}
exports.getModuleKeys = getModuleKeys;
/**
 * Parse CSV content
 */
function parseCSV(content) {
    var lines = content.trim().split('\n');
    if (lines.length < 2)
        return [];
    var headers = lines[0].split(',').map(function (h) { return h.trim(); });
    var rows = [];
    var _loop_1 = function (i) {
        if (!lines[i].trim())
            return "continue";
        var values = parseCSVLine(lines[i]);
        var row = {};
        headers.forEach(function (header, index) {
            row[header] = values[index] || '';
        });
        rows.push(row);
    };
    for (var i = 1; i < lines.length; i++) {
        _loop_1(i);
    }
    return rows;
}
exports.parseCSV = parseCSV;
/**
 * Parse a single CSV line handling quoted values
 */
function parseCSVLine(line) {
    var result = [];
    var current = '';
    var insideQuotes = false;
    for (var i = 0; i < line.length; i++) {
        var char = line[i];
        var nextChar = line[i + 1];
        if (char === '"') {
            if (insideQuotes && nextChar === '"') {
                // Escaped quote
                current += '"';
                i++;
            }
            else {
                // Toggle quote state
                insideQuotes = !insideQuotes;
            }
        }
        else if (char === ',' && !insideQuotes) {
            // End of field
            result.push(current.trim());
            current = '';
        }
        else {
            current += char;
        }
    }
    // Add last field
    result.push(current.trim());
    return result;
}
