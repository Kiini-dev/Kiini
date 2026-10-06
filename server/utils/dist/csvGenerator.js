"use strict";
/**
 * CSV Template Generator for Import/Export
 * Generates blank CSV templates with properly labeled columns
 */
exports.__esModule = true;
exports.getAvailableModules = exports.parseCSV = exports.generateCSVTemplateFile = exports.generateCSVTemplate = void 0;
var moduleTemplates = {
    // Clients template
    clients: [
        { name: 'companyName', type: 'string', required: true, example: 'ABC Corporation', description: 'Company legal name' },
        { name: 'contactPerson', type: 'string', required: false, example: 'John Doe', description: 'Primary contact name' },
        { name: 'email', type: 'email', required: false, example: 'john@example.com', description: 'Contact email address' },
        { name: 'phone', type: 'string', required: false, example: '+254712345678', description: 'Contact phone number' },
        { name: 'address', type: 'string', required: false, example: '123 Main Street', description: 'Business address' },
        { name: 'city', type: 'string', required: false, example: 'Nairobi', description: 'City name' },
        { name: 'country', type: 'string', required: false, example: 'Kenya', description: 'Country name' },
        { name: 'postalCode', type: 'string', required: false, example: '00100', description: 'Postal code' },
        { name: 'taxId', type: 'string', required: false, example: 'PIN123456', description: 'Tax identification number' },
        { name: 'website', type: 'string', required: false, example: 'www.example.com', description: 'Company website' },
        { name: 'industry', type: 'string', required: false, example: 'Technology', description: 'Business industry' },
        { name: 'status', type: 'enum', required: false, example: 'active', "enum": ['active', 'inactive', 'prospect', 'archived'], description: 'Client status' },
        { name: 'businessType', type: 'string', required: false, example: 'Limited Company', description: 'Business registration type' },
        { name: 'registrationNumber', type: 'string', required: false, example: 'COMP123456', description: 'Business registration number' },
        { name: 'creditLimit', type: 'number', required: false, example: '100000', description: 'Credit limit in base currency' },
    ],
    // Employees template
    employees: [
        { name: 'employeeNumber', type: 'string', required: true, example: 'EMP001', description: 'Unique employee ID' },
        { name: 'firstName', type: 'string', required: true, example: 'Jane', description: 'First name' },
        { name: 'lastName', type: 'string', required: true, example: 'Smith', description: 'Last name' },
        { name: 'email', type: 'email', required: false, example: 'jane.smith@example.com', description: 'Work email' },
        { name: 'phone', type: 'string', required: false, example: '+254712345678', description: 'Contact phone' },
        { name: 'dateOfBirth', type: 'date', required: false, example: '1990-01-15', description: 'DOB format: YYYY-MM-DD' },
        { name: 'hireDate', type: 'date', required: true, example: '2023-01-01', description: 'Employment start date' },
        { name: 'department', type: 'string', required: false, example: 'Sales', description: 'Department name' },
        { name: 'position', type: 'string', required: false, example: 'Sales Manager', description: 'Job position' },
        { name: 'jobGroupId', type: 'string', required: false, example: 'JG001', description: 'Job group identifier' },
        { name: 'salary', type: 'number', required: false, example: '50000', description: 'Monthly salary' },
        { name: 'employmentType', type: 'enum', required: false, example: 'full_time', "enum": ['full_time', 'part_time', 'contract', 'intern'], description: 'Employment contract type' },
        { name: 'status', type: 'enum', required: false, example: 'active', "enum": ['active', 'on_leave', 'terminated', 'suspended'], description: 'Employment status' },
        { name: 'address', type: 'string', required: false, example: '456 Oak Avenue', description: 'Residential address' },
        { name: 'nationalId', type: 'string', required: false, example: '12345678', description: 'National ID number' },
        { name: 'bankAccountNumber', type: 'string', required: false, example: '1234567890', description: 'Bank account number' },
        { name: 'taxId', type: 'string', required: false, example: 'PIN123456', description: 'Tax identification number' },
    ],
    // Departments template
    departments: [
        { name: 'departmentName', type: 'string', required: true, example: 'Sales Department', description: 'Department name' },
        { name: 'code', type: 'string', required: false, example: 'SALES', description: 'Department code' },
        { name: 'description', type: 'string', required: false, example: 'Handles all client-facing sales', description: 'Department description' },
        { name: 'headOfDepartment', type: 'string', required: false, example: 'John Manager', description: 'Department head name' },
        { name: 'budget', type: 'number', required: false, example: '500000', description: 'Annual budget allocation' },
        { name: 'status', type: 'enum', required: false, example: 'active', "enum": ['active', 'inactive'], description: 'Department status' },
    ],
    // Job Groups template
    jobGroups: [
        { name: 'name', type: 'string', required: true, example: 'Senior Manager', description: 'Job group name' },
        { name: 'minimumGrossSalary', type: 'number', required: true, example: '80000', description: 'Minimum gross salary' },
        { name: 'maximumGrossSalary', type: 'number', required: true, example: '150000', description: 'Maximum gross salary' },
        { name: 'description', type: 'string', required: false, example: 'Senior management position', description: 'Job group description' },
        { name: 'isActive', type: 'boolean', required: false, example: 'true', description: 'Active status (true/false)' },
    ],
    // Products template
    products: [
        { name: 'productName', type: 'string', required: true, example: 'Laptop Pro', description: 'Product name' },
        { name: 'productCode', type: 'string', required: false, example: 'PROD001', description: 'Product SKU/code' },
        { name: 'description', type: 'string', required: false, example: 'High-performance laptop', description: 'Product description' },
        { name: 'category', type: 'string', required: false, example: 'Electronics', description: 'Product category' },
        { name: 'unitPrice', type: 'number', required: true, example: '150000', description: 'Unit price' },
        { name: 'taxRate', type: 'number', required: false, example: '16', description: 'Tax rate as percentage' },
        { name: 'quantity', type: 'number', required: false, example: '50', description: 'Stock quantity' },
        { name: 'reorderLevel', type: 'number', required: false, example: '10', description: 'Reorder threshold quantity' },
        { name: 'supplier', type: 'string', required: false, example: 'Tech Supplies Inc', description: 'Supplier name' },
        { name: 'status', type: 'enum', required: false, example: 'active', "enum": ['active', 'inactive', 'discontinued'], description: 'Product status' },
    ],
    // Services template
    services: [
        { name: 'serviceName', type: 'string', required: true, example: 'Web Development', description: 'Service name' },
        { name: 'serviceCode', type: 'string', required: false, example: 'SVC001', description: 'Service code' },
        { name: 'description', type: 'string', required: false, example: 'Custom web application development', description: 'Service description' },
        { name: 'category', type: 'string', required: false, example: 'IT Services', description: 'Service category' },
        { name: 'unitPrice', type: 'number', required: true, example: '5000', description: 'Unit price/hourly rate' },
        { name: 'taxRate', type: 'number', required: false, example: '16', description: 'Tax rate as percentage' },
        { name: 'unit', type: 'string', required: false, example: 'hour', description: 'Unit of measurement' },
        { name: 'status', type: 'enum', required: false, example: 'active', "enum": ['active', 'inactive'], description: 'Service status' },
    ],
    // Payments template
    payments: [
        { name: 'invoiceNumber', type: 'string', required: true, example: 'INV001', description: 'Invoice reference number' },
        { name: 'clientName', type: 'string', required: false, example: 'ABC Corporation', description: 'Client name' },
        { name: 'amount', type: 'number', required: true, example: '50000', description: 'Payment amount' },
        { name: 'paymentDate', type: 'date', required: true, example: '2024-03-01', description: 'Payment date (YYYY-MM-DD)' },
        { name: 'paymentMethod', type: 'enum', required: false, example: 'bank_transfer', "enum": ['cash', 'bank_transfer', 'cheque', 'card', 'other'], description: 'Payment method' },
        { name: 'reference', type: 'string', required: false, example: 'CHK123456', description: 'Payment reference/receipt number' },
        { name: 'description', type: 'string', required: false, example: 'Invoice payment received', description: 'Payment description' },
        { name: 'status', type: 'enum', required: false, example: 'completed', "enum": ['pending', 'completed', 'cancelled'], description: 'Payment status' },
    ],
    // Chart of Accounts template
    accounts: [
        { name: 'accountCode', type: 'string', required: true, example: '1000', description: 'Account code' },
        { name: 'accountName', type: 'string', required: true, example: 'Cash in Hand', description: 'Account name' },
        { name: 'accountType', type: 'enum', required: true, example: 'asset', "enum": ['asset', 'liability', 'equity', 'revenue', 'expense', 'cost of goods sold', 'operating expense', 'capital expenditure', 'other income', 'other expense'], description: 'Account classification' },
        { name: 'parentAccountCode', type: 'string', required: false, example: '1001', description: 'Parent account code for hierarchy' },
        { name: 'description', type: 'string', required: false, example: 'Cash held in office', description: 'Account description' },
        { name: 'isActive', type: 'boolean', required: false, example: 'true', description: 'Active status' },
    ],
    // Bank Accounts template
    bankAccounts: [
        { name: 'accountName', type: 'string', required: true, example: 'Main Operating Account', description: 'Bank account name' },
        { name: 'bankName', type: 'string', required: true, example: 'Kenya Commercial Bank', description: 'Bank name' },
        { name: 'accountNumber', type: 'string', required: true, example: '1234567890', description: 'Bank account number' },
        { name: 'currency', type: 'string', required: false, example: 'KES', description: 'Currency code (e.g., KES, USD)' },
        { name: 'branch', type: 'string', required: false, example: 'Nairobi Central', description: 'Bank branch name' },
        { name: 'bankCode', type: 'string', required: false, example: 'KCB001', description: 'Bank code' },
        { name: 'swiftCode', type: 'string', required: false, example: 'KCBLKENA', description: 'SWIFT code' },
        { name: 'isActive', type: 'boolean', required: false, example: 'true', description: 'Account active status' },
    ],
    // Expenses template
    expenses: [
        { name: 'description', type: 'string', required: true, example: 'Office supplies purchase', description: 'Expense description' },
        { name: 'category', type: 'string', required: true, example: 'Office Supplies', description: 'Expense category' },
        { name: 'vendor', type: 'string', required: false, example: 'Office Depot', description: 'Vendor/supplier name' },
        { name: 'amount', type: 'number', required: true, example: '15000', description: 'Expense amount' },
        { name: 'expenseDate', type: 'date', required: true, example: '2024-03-01', description: 'Expense date (YYYY-MM-DD)' },
        { name: 'paymentMethod', type: 'enum', required: false, example: 'cash', "enum": ['cash', 'bank_transfer', 'cheque', 'card', 'other'], description: 'Payment method used' },
        { name: 'account', type: 'string', required: false, example: '1000', description: 'Chart of account code' },
        { name: 'status', type: 'enum', required: false, example: 'pending', "enum": ['pending', 'approved', 'rejected', 'paid'], description: 'Expense approval status' },
    ],
    // Invoices template
    invoices: [
        { name: 'invoiceNumber', type: 'string', required: true, example: 'INV-2024-001', description: 'Invoice number' },
        { name: 'clientName', type: 'string', required: true, example: 'ABC Corporation', description: 'Client company name' },
        { name: 'issueDate', type: 'date', required: true, example: '2024-03-01', description: 'Invoice issue date (YYYY-MM-DD)' },
        { name: 'dueDate', type: 'date', required: true, example: '2024-04-01', description: 'Invoice due date (YYYY-MM-DD)' },
        { name: 'subtotal', type: 'number', required: true, example: '50000', description: 'Subtotal before tax' },
        { name: 'taxRate', type: 'number', required: false, example: '16', description: 'Tax rate as percentage' },
        { name: 'taxAmount', type: 'number', required: false, example: '8000', description: 'Tax amount' },
        { name: 'discountAmount', type: 'number', required: false, example: '5000', description: 'Discount amount' },
        { name: 'total', type: 'number', required: true, example: '53000', description: 'Invoice total' },
        { name: 'status', type: 'enum', required: false, example: 'draft', "enum": ['draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled'], description: 'Invoice status' },
        { name: 'notes', type: 'string', required: false, example: 'Payment terms: Net 30', description: 'Invoice notes' },
    ],
    // Users template
    users: [
        { name: 'email', type: 'email', required: true, example: 'user@example.com', description: 'User email address' },
        { name: 'firstName', type: 'string', required: true, example: 'John', description: 'User first name' },
        { name: 'lastName', type: 'string', required: true, example: 'Doe', description: 'User last name' },
        { name: 'role', type: 'enum', required: true, example: 'user', "enum": ['admin', 'manager', 'user', 'viewer'], description: 'User role/permission level' },
        { name: 'phone', type: 'string', required: false, example: '+254712345678', description: 'Phone number' },
        { name: 'department', type: 'string', required: false, example: 'Sales', description: 'User department' },
        { name: 'status', type: 'enum', required: false, example: 'active', "enum": ['active', 'inactive', 'suspended'], description: 'User account status' },
    ]
};
/**
 * Generate CSV content for a module template
 */
function generateCSVTemplate(module) {
    var columns = moduleTemplates[module];
    if (!columns) {
        throw new Error("Unknown module: " + module);
    }
    // Create headers
    var headers = columns.map(function (col) {
        var required = col.required ? '*' : '';
        var type = " [" + col.type + "]";
        return "" + col.name + required + type;
    });
    // Create description line (commented)
    var descriptions = columns.map(function (col) { return col.description || ''; });
    // Create example line
    var examples = columns.map(function (col) { return col.example; });
    // Create type/enum hint line
    var hints = columns.map(function (col) {
        if (col["enum"]) {
            return "Values: " + col["enum"].join(' | ');
        }
        if (col.type === 'date') {
            return 'Format: YYYY-MM-DD';
        }
        if (col.type === 'boolean') {
            return 'Values: true | false';
        }
        if (col.type === 'number') {
            return 'Numeric value';
        }
        return '';
    });
    // Build CSV
    var lines = [
        '# Import Template for ' + module,
        '# Fields marked with * are required',
        '# Delete this entire row after review',
        '#',
        headers.join(','),
        descriptions.map(function (d) { return "# " + d; }).join('\n'),
        examples.join(','),
        hints.map(function (h) { return "# " + h; }).join('\n'),
    ];
    return lines.join('\n');
}
exports.generateCSVTemplate = generateCSVTemplate;
/**
 * Generate CSV template as downloadable file
 */
function generateCSVTemplateFile(module) {
    var csv = generateCSVTemplate(module);
    return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
}
exports.generateCSVTemplateFile = generateCSVTemplateFile;
/**
 * Parse CSV content into array of objects
 */
function parseCSV(csvContent) {
    var lines = csvContent.split('\n').filter(function (line) { return !line.startsWith('#') && line.trim(); });
    if (lines.length < 2) {
        throw new Error('CSV file must have headers and at least one data row');
    }
    var headers = lines[0].split(',').map(function (h) {
        // Remove type hints and required markers
        return h.replace(/\[.*?\]/g, '').replace(/\*/g, '').trim();
    });
    var rows = [];
    var _loop_1 = function (i) {
        var values = lines[i].split(',').map(function (v) { return v.trim(); });
        var row = {};
        headers.forEach(function (header, idx) {
            var value = values[idx] || '';
            // Handle empty values
            if (value === '' || value === 'null' || value === 'undefined') {
                row[header] = null;
            }
            else if (value === 'true') {
                row[header] = true;
            }
            else if (value === 'false') {
                row[header] = false;
            }
            else if (!isNaN(Number(value)) && value !== '') {
                row[header] = Number(value);
            }
            else {
                row[header] = value;
            }
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
 * Get module templates list
 */
function getAvailableModules() {
    return [
        { id: 'clients', name: 'Clients', description: 'Import client information' },
        { id: 'employees', name: 'Employees', description: 'Import employee records' },
        { id: 'departments', name: 'Departments', description: 'Import department data' },
        { id: 'jobGroups', name: 'Job Groups', description: 'Import job classifications' },
        { id: 'products', name: 'Products', description: 'Import product inventory' },
        { id: 'services', name: 'Services', description: 'Import service offerings' },
        { id: 'payments', name: 'Payments', description: 'Import payment records' },
        { id: 'accounts', name: 'Chart of Accounts', description: 'Import account structure' },
        { id: 'bankAccounts', name: 'Bank Accounts', description: 'Import bank account information' },
        { id: 'expenses', name: 'Expenses', description: 'Import expense records' },
        { id: 'invoices', name: 'Invoices', description: 'Import invoice records' },
        { id: 'users', name: 'Users', description: 'Import user accounts' },
    ];
}
exports.getAvailableModules = getAvailableModules;
