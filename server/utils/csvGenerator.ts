/**
 * CSV Template Generator for Import/Export
 * Generates blank CSV templates with properly labeled columns
 */

export type ModuleType = 
  | 'clients' | 'employees' | 'departments' 
  | 'jobGroups' | 'products' | 'services' 
  | 'payments' | 'accounts' | 'bankAccounts' 
  | 'expenses' | 'invoices' | 'users';

interface ColumnDefinition {
  name: string;
  type: 'string' | 'number' | 'email' | 'date' | 'enum' | 'boolean';
  required: boolean;
  example: string;
  enum?: string[];
  description?: string;
}

const moduleTemplates: Record<ModuleType, ColumnDefinition[]> = {
  clients: [
    { name: 'organizationId', type: 'string', required: false, example: 'org_123', description: 'Organization ID for multi-tenant isolation' },
    { name: 'companyName', type: 'string', required: true, example: 'ABC Corporation', description: 'Company legal name' },
    { name: 'contactPerson', type: 'string', required: false, example: 'John Doe', description: 'Primary contact name' },
    { name: 'email', type: 'email', required: false, example: 'john@example.com', description: 'Contact email address' },
    { name: 'phone', type: 'string', required: false, example: '+254712345678', description: 'Primary phone number' },
    { name: 'secondaryPhone', type: 'string', required: false, example: '+254700000001', description: 'Secondary phone number' },
    { name: 'address', type: 'string', required: false, example: '123 Main Street', description: 'Business address' },
    { name: 'city', type: 'string', required: false, example: 'Nairobi', description: 'City name' },
    { name: 'country', type: 'string', required: false, example: 'Kenya', description: 'Country name' },
    { name: 'postalCode', type: 'string', required: false, example: '00100', description: 'Postal code' },
    { name: 'taxId', type: 'string', required: false, example: 'PIN123456', description: 'Tax identification number' },
    { name: 'website', type: 'string', required: false, example: 'https://www.example.com', description: 'Company website' },
    { name: 'industry', type: 'string', required: false, example: 'Technology', description: 'Business industry' },
    { name: 'status', type: 'enum', required: false, example: 'active', enum: ['active', 'inactive', 'prospect', 'archived'], description: 'Client status' },
    { name: 'assignedTo', type: 'string', required: false, example: 'user_123', description: 'User assigned to client' },
    { name: 'notes', type: 'string', required: false, example: 'Priority customer', description: 'Client notes' },
    { name: 'createdBy', type: 'string', required: false, example: 'user_123', description: 'Creator user ID' },
    { name: 'businessType', type: 'string', required: false, example: 'Limited Company', description: 'Business registration type' },
    { name: 'registrationNumber', type: 'string', required: false, example: 'COMP123456', description: 'Business registration number' },
    { name: 'bankName', type: 'string', required: false, example: 'KCB', description: 'Bank name' },
    { name: 'bankCode', type: 'string', required: false, example: '01', description: 'Bank code' },
    { name: 'branch', type: 'string', required: false, example: 'Nairobi Central', description: 'Bank branch' },
    { name: 'bankAccountNumber', type: 'string', required: false, example: '1234567890', description: 'Bank account number' },
    { name: 'creditLimit', type: 'number', required: false, example: '100000', description: 'Credit limit in base currency' },
    { name: 'paymentTerms', type: 'string', required: false, example: 'Net 30', description: 'Payment terms' },
    { name: 'numberOfEmployees', type: 'number', required: false, example: '25', description: 'Employee count' },
    { name: 'yearEstablished', type: 'number', required: false, example: '2018', description: 'Year company was established' },
    { name: 'businessLicense', type: 'string', required: false, example: 'BL-123456', description: 'Business license number' },
    { name: 'leadSource', type: 'string', required: false, example: 'Referral', description: 'Lead source' },
    { name: 'currency', type: 'string', required: false, example: 'KES', description: 'Preferred currency code' },
  ],

  employees: [
    { name: 'organizationId', type: 'string', required: false, example: 'org_123', description: 'Organization ID for multi-tenant isolation' },
    { name: 'userId', type: 'string', required: false, example: 'user_123', description: 'Linked user ID' },
    { name: 'employeeNumber', type: 'string', required: true, example: 'EMP001', description: 'Unique employee ID' },
    { name: 'firstName', type: 'string', required: true, example: 'Jane', description: 'First name' },
    { name: 'lastName', type: 'string', required: true, example: 'Smith', description: 'Last name' },
    { name: 'email', type: 'email', required: false, example: 'jane.smith@example.com', description: 'Work email' },
    { name: 'phone', type: 'string', required: false, example: '+254712345678', description: 'Contact phone' },
    { name: 'country', type: 'string', required: false, example: 'KE', description: 'Country code' },
    { name: 'gender', type: 'enum', required: false, example: 'female', enum: ['male', 'female', 'other'], description: 'Employee gender' },
    { name: 'maritalStatus', type: 'enum', required: false, example: 'single', enum: ['single', 'married', 'divorced', 'widowed'], description: 'Marital status' },
    { name: 'dateOfBirth', type: 'date', required: false, example: '1990-01-15', description: 'Date of birth (YYYY-MM-DD)' },
    { name: 'hireDate', type: 'date', required: true, example: '2023-01-01', description: 'Employment start date' },
    { name: 'probationEndDate', type: 'date', required: false, example: '2023-03-31', description: 'Probation end date' },
    { name: 'contractEndDate', type: 'date', required: false, example: '2025-12-31', description: 'Contract end date' },
    { name: 'department', type: 'string', required: false, example: 'Sales', description: 'Department name' },
    { name: 'position', type: 'string', required: false, example: 'Sales Manager', description: 'Job position' },
    { name: 'jobGroupId', type: 'string', required: true, example: 'job_group_123', description: 'Job group identifier' },
    { name: 'salary', type: 'number', required: false, example: '50000', description: 'Monthly salary' },
    { name: 'employmentType', type: 'enum', required: false, example: 'full_time', enum: ['full_time', 'part_time', 'contract', 'intern', 'contractual', 'hourly', 'wage', 'temporary', 'seasonal'], description: 'Employment type' },
    { name: 'status', type: 'enum', required: false, example: 'active', enum: ['active', 'on_leave', 'terminated', 'suspended'], description: 'Employment status' },
    { name: 'address', type: 'string', required: false, example: '456 Oak Avenue', description: 'Residential address' },
    { name: 'emergencyContactName', type: 'string', required: false, example: 'Mary Smith', description: 'Emergency contact name' },
    { name: 'emergencyContactRelationship', type: 'string', required: false, example: 'Spouse', description: 'Emergency contact relationship' },
    { name: 'emergencyContactPhone', type: 'string', required: false, example: '+254712345678', description: 'Emergency contact phone' },
    { name: 'emergencyContact', type: 'string', required: false, example: 'Spouse; Mary Smith', description: 'Emergency contact note' },
    { name: 'bankName', type: 'string', required: false, example: 'KCB', description: 'Bank name' },
    { name: 'bankBranch', type: 'string', required: false, example: 'Westlands', description: 'Bank branch' },
    { name: 'bankAccountNumber', type: 'string', required: false, example: '1234567890', description: 'Bank account number' },
    { name: 'nhifNumber', type: 'string', required: false, example: 'NHIF12345', description: 'NHIF number' },
    { name: 'nssfNumber', type: 'string', required: false, example: 'NSSF12345', description: 'NSSF number' },
    { name: 'taxId', type: 'string', required: false, example: 'PIN123456', description: 'Tax identification number' },
    { name: 'nationalId', type: 'string', required: false, example: '12345678', description: 'National ID number' },
    { name: 'photoUrl', type: 'string', required: false, example: 'https://...', description: 'Employee photo URL' },
    { name: 'createdBy', type: 'string', required: false, example: 'user_123', description: 'Creator user ID' },
  ],

  departments: [
    { name: 'organizationId', type: 'string', required: false, example: 'org_123', description: 'Organization ID for multi-tenant isolation' },
    { name: 'name', type: 'string', required: true, example: 'Sales Department', description: 'Department name' },
    { name: 'description', type: 'string', required: false, example: 'Handles all client-facing sales', description: 'Department description' },
    { name: 'headId', type: 'string', required: false, example: 'employee_123', description: 'Department head employee ID' },
    { name: 'budget', type: 'number', required: false, example: '500000', description: 'Department budget' },
    { name: 'salaryRangeMin', type: 'number', required: false, example: '40000', description: 'Minimum salary range' },
    { name: 'salaryRangeMax', type: 'number', required: false, example: '100000', description: 'Maximum salary range' },
    { name: 'status', type: 'enum', required: false, example: 'active', enum: ['active', 'inactive'], description: 'Department status' },
    { name: 'defaultRole', type: 'string', required: false, example: 'sales_manager', description: 'Default role for department' },
    { name: 'createdBy', type: 'string', required: false, example: 'user_123', description: 'Creator user ID' },
  ],

  jobGroups: [
    { name: 'organizationId', type: 'string', required: false, example: 'org_123', description: 'Organization ID for multi-tenant isolation' },
    { name: 'name', type: 'string', required: true, example: 'Senior Manager', description: 'Job group name' },
    { name: 'managerId', type: 'string', required: false, example: 'manager_123', description: 'Job group manager ID' },
    { name: 'minimumGrossSalary', type: 'number', required: true, example: '80000', description: 'Minimum gross salary' },
    { name: 'maximumGrossSalary', type: 'number', required: true, example: '150000', description: 'Maximum gross salary' },
    { name: 'defaultBasicSalary', type: 'number', required: false, example: '100000', description: 'Default basic salary in cents' },
    { name: 'defaultAnnualLeaveDays', type: 'number', required: false, example: '21', description: 'Default annual leave entitlement in days' },
    { name: 'defaultAllowances', type: 'string', required: false, example: '[{"type":"house","amount":500000,"frequency":"monthly"}]', description: 'JSON line items, amounts in cents' },
    { name: 'defaultDeductions', type: 'string', required: false, example: '[{"type":"pension","amount":100000,"frequency":"monthly"}]', description: 'JSON line items, amounts in cents' },
    { name: 'defaultBenefits', type: 'string', required: false, example: '[{"type":"medical","amount":0,"frequency":"monthly"}]', description: 'JSON line items, amounts in cents' },
    { name: 'description', type: 'string', required: false, example: 'Senior management position', description: 'Job group description' },
    { name: 'isActive', type: 'boolean', required: false, example: 'true', description: 'Active status (true/false)' },
  ],

  products: [
    { name: 'organizationId', type: 'string', required: false, example: 'org_123', description: 'Organization ID for multi-tenant isolation' },
    { name: 'name', type: 'string', required: true, example: 'Laptop Pro', description: 'Product name' },
    { name: 'description', type: 'string', required: false, example: 'High-performance laptop', description: 'Product description' },
    { name: 'sku', type: 'string', required: false, example: 'PROD001', description: 'Product SKU' },
    { name: 'category', type: 'string', required: false, example: 'Electronics', description: 'Product category' },
    { name: 'unitPrice', type: 'number', required: true, example: '150000', description: 'Unit price' },
    { name: 'costPrice', type: 'number', required: false, example: '120000', description: 'Cost price' },
    { name: 'stockQuantity', type: 'number', required: false, example: '50', description: 'Current stock quantity' },
    { name: 'minStockLevel', type: 'number', required: false, example: '10', description: 'Minimum stock threshold' },
    { name: 'unit', type: 'string', required: false, example: 'pcs', description: 'Unit of measurement' },
    { name: 'taxRate', type: 'number', required: false, example: '16', description: 'Tax rate percentage' },
    { name: 'isActive', type: 'boolean', required: false, example: 'true', description: 'Active product status' },
    { name: 'imageUrl', type: 'string', required: false, example: 'https://...', description: 'Product image URL' },
    { name: 'createdBy', type: 'string', required: false, example: 'user_123', description: 'Creator user ID' },
    { name: 'supplier', type: 'string', required: false, example: 'Tech Supplies Inc', description: 'Supplier name' },
    { name: 'reorderLevel', type: 'number', required: false, example: '10', description: 'Reorder threshold' },
    { name: 'reorderQuantity', type: 'number', required: false, example: '25', description: 'Reorder quantity' },
    { name: 'lastRestockDate', type: 'date', required: false, example: '2024-03-01', description: 'Last restock date' },
    { name: 'maxStockLevel', type: 'number', required: false, example: '200', description: 'Maximum stock level' },
    { name: 'location', type: 'string', required: false, example: 'Warehouse A', description: 'Storage location' },
  ],

  services: [
    { name: 'organizationId', type: 'string', required: false, example: 'org_123', description: 'Organization ID for multi-tenant isolation' },
    { name: 'name', type: 'string', required: true, example: 'Web Development', description: 'Service name' },
    { name: 'description', type: 'string', required: false, example: 'Custom web application development', description: 'Service description' },
    { name: 'category', type: 'string', required: false, example: 'IT Services', description: 'Service category' },
    { name: 'hourlyRate', type: 'number', required: false, example: '5000', description: 'Hourly rate' },
    { name: 'fixedPrice', type: 'number', required: false, example: '25000', description: 'Fixed price' },
    { name: 'unit', type: 'string', required: false, example: 'hour', description: 'Unit of measurement' },
    { name: 'taxRate', type: 'number', required: false, example: '16', description: 'Tax rate percentage' },
    { name: 'deliverables', type: 'string', required: false, example: 'Landing page design', description: 'Service deliverables' },
    { name: 'isActive', type: 'boolean', required: false, example: 'true', description: 'Service active status' },
    { name: 'createdBy', type: 'string', required: false, example: 'user_123', description: 'Creator user ID' },
  ],

  payments: [
    { name: 'organizationId', type: 'string', required: false, example: 'org_123', description: 'Organization ID for multi-tenant isolation' },
    { name: 'invoiceId', type: 'string', required: true, example: 'inv_123', description: 'Invoice ID associated with payment' },
    { name: 'clientId', type: 'string', required: true, example: 'client_123', description: 'Client ID associated with payment' },
    { name: 'accountId', type: 'string', required: false, example: 'acct_123', description: 'Bank account or chart account ID' },
    { name: 'amount', type: 'number', required: true, example: '50000', description: 'Payment amount in minor units' },
    { name: 'paymentDate', type: 'date', required: true, example: '2024-03-01', description: 'Payment date (YYYY-MM-DD)' },
    { name: 'paymentMethod', type: 'enum', required: true, example: 'bank_transfer', enum: ['cash', 'bank_transfer', 'cheque', 'mpesa', 'card', 'other'], description: 'Payment method' },
    { name: 'referenceNumber', type: 'string', required: false, example: 'REF123456', description: 'Reference or receipt number' },
    { name: 'chartOfAccountType', type: 'enum', required: false, example: 'debit', enum: ['debit', 'credit'], description: 'Account type for accounting entry' },
    { name: 'chartOfAccountId', type: 'number', required: false, example: '101', description: 'Chart of account numeric ID' },
    { name: 'notes', type: 'string', required: false, example: 'Invoice payment received', description: 'Payment notes' },
    { name: 'status', type: 'enum', required: false, example: 'completed', enum: ['pending', 'completed', 'failed', 'cancelled'], description: 'Payment status' },
    { name: 'approvedBy', type: 'string', required: false, example: 'user_123', description: 'Approver user ID' },
    { name: 'approvedAt', type: 'date', required: false, example: '2024-03-02', description: 'Approval timestamp' },
    { name: 'createdBy', type: 'string', required: false, example: 'user_123', description: 'Creator user ID' },
  ],

  accounts: [
    { name: 'organizationId', type: 'string', required: false, example: 'org_123', description: 'Organization ID for multi-tenant isolation' },
    { name: 'accountCode', type: 'string', required: true, example: '1000', description: 'Unique account code/number' },
    { name: 'accountName', type: 'string', required: true, example: 'Cash in Hand', description: 'Account name' },
    { name: 'accountType', type: 'enum', required: true, example: 'asset', enum: ['asset', 'liability', 'equity', 'revenue', 'expense', 'cost of goods sold', 'operating expense', 'capital expenditure', 'other income', 'other expense'], description: 'Account classification type' },
    { name: 'parentAccountId', type: 'string', required: false, example: '100', description: 'Parent account ID for hierarchical structure' },
    { name: 'balance', type: 'number', required: false, example: '0', description: 'Current account balance in minor units' },
    { name: 'isActive', type: 'boolean', required: false, example: 'true', description: 'Whether the account is active' },
    { name: 'description', type: 'string', required: false, example: 'Cash held in office', description: 'Account description and notes' },
    { name: 'createdAt', type: 'date', required: false, example: '2024-03-01', description: 'Creation timestamp' },
    { name: 'updatedAt', type: 'date', required: false, example: '2024-03-02', description: 'Last update timestamp' },
  ],

  bankAccounts: [
    { name: 'accountName', type: 'string', required: true, example: 'Main Operating Account', description: 'Bank account name' },
    { name: 'bankName', type: 'string', required: true, example: 'Kenya Commercial Bank', description: 'Bank name' },
    { name: 'accountNumber', type: 'string', required: true, example: '1234567890', description: 'Bank account number' },
    { name: 'currency', type: 'string', required: false, example: 'KES', description: 'Currency code (e.g., KES, USD)' },
    { name: 'balance', type: 'number', required: false, example: '500000', description: 'Current account balance' },
    { name: 'isActive', type: 'boolean', required: false, example: 'true', description: 'Account active status' },
  ],

  expenses: [
    { name: 'organizationId', type: 'string', required: false, example: 'org_123', description: 'Organization ID for multi-tenant isolation' },
    { name: 'expenseNumber', type: 'string', required: false, example: 'EXP-2024-001', description: 'Expense reference number' },
    { name: 'category', type: 'string', required: true, example: 'Office Supplies', description: 'Expense category' },
    { name: 'vendor', type: 'string', required: false, example: 'Office Depot', description: 'Vendor or supplier name' },
    { name: 'amount', type: 'number', required: true, example: '15000', description: 'Expense amount in minor units' },
    { name: 'expenseDate', type: 'date', required: true, example: '2024-03-01', description: 'Expense date (YYYY-MM-DD)' },
    { name: 'paymentMethod', type: 'enum', required: false, example: 'cash', enum: ['cash', 'bank_transfer', 'cheque', 'card', 'other'], description: 'Payment method used' },
    { name: 'receiptUrl', type: 'string', required: false, example: 'https://...', description: 'Receipt or document URL' },
    { name: 'description', type: 'string', required: false, example: 'Office supplies purchase', description: 'Expense description' },
    { name: 'accountId', type: 'string', required: false, example: 'acct_123', description: 'Related chart of accounts ID' },
    { name: 'budgetAllocationId', type: 'string', required: false, example: 'budget_123', description: 'Related budget allocation ID' },
    { name: 'status', type: 'enum', required: false, example: 'pending', enum: ['pending', 'approved', 'rejected', 'paid'], description: 'Expense approval status' },
    { name: 'createdBy', type: 'string', required: false, example: 'user_123', description: 'Creator user ID' },
    { name: 'approvedBy', type: 'string', required: false, example: 'user_123', description: 'Approver user ID' },
    { name: 'approvedAt', type: 'date', required: false, example: '2024-03-02', description: 'Approval date' },
    { name: 'chartOfAccountId', type: 'number', required: false, example: '101', description: 'Chart of account numeric ID' },
  ],

  invoices: [
    { name: 'organizationId', type: 'string', required: false, example: 'org_123', description: 'Organization ID for multi-tenant isolation' },
    { name: 'invoiceNumber', type: 'string', required: true, example: 'INV-2024-001', description: 'Invoice number' },
    { name: 'clientId', type: 'string', required: true, example: 'client_123', description: 'Client ID' },
    { name: 'estimateId', type: 'string', required: false, example: 'estimate_123', description: 'Related estimate ID' },
    { name: 'title', type: 'string', required: false, example: 'Website redesign', description: 'Invoice title' },
    { name: 'status', type: 'enum', required: false, example: 'draft', enum: ['draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled'], description: 'Invoice status' },
    { name: 'issueDate', type: 'date', required: true, example: '2024-03-01', description: 'Invoice issue date' },
    { name: 'dueDate', type: 'date', required: true, example: '2024-04-01', description: 'Invoice due date' },
    { name: 'subtotal', type: 'number', required: true, example: '50000', description: 'Subtotal before tax' },
    { name: 'taxAmount', type: 'number', required: false, example: '8000', description: 'Tax amount' },
    { name: 'discountAmount', type: 'number', required: false, example: '5000', description: 'Discount amount' },
    { name: 'total', type: 'number', required: true, example: '53000', description: 'Invoice total' },
    { name: 'paidAmount', type: 'number', required: false, example: '30000', description: 'Amount already paid' },
    { name: 'notes', type: 'string', required: false, example: 'Payment terms: Net 30', description: 'Invoice notes' },
    { name: 'terms', type: 'string', required: false, example: 'Payment due within 30 days', description: 'Invoice terms' },
    { name: 'createdBy', type: 'string', required: false, example: 'user_123', description: 'Creator user ID' },
    { name: 'paymentPlanId', type: 'string', required: false, example: 'plan_123', description: 'Payment plan ID' },
    { name: 'isAutoRecurring', type: 'boolean', required: false, example: 'false', description: 'Auto-recurring invoice flag' },
    { name: 'recurringInvoiceId', type: 'string', required: false, example: 'recurring_123', description: 'Recurring invoice ID' },
    { name: 'clientSubscriptionId', type: 'string', required: false, example: 'subscription_123', description: 'Client subscription ID' },
    { name: 'accountManagerId', type: 'string', required: false, example: 'manager_123', description: 'Account manager ID' },
  ],

  users: [
    { name: 'name', type: 'string', required: true, example: 'John Doe', description: 'User full name' },
    { name: 'email', type: 'email', required: true, example: 'user@example.com', description: 'User email address' },
    { name: 'emailVerified', type: 'date', required: false, example: '2024-03-01', description: 'Email verification timestamp' },
    { name: 'loginMethod', type: 'string', required: false, example: 'local', description: 'Login method' },
    { name: 'passwordHash', type: 'string', required: false, example: '$2b$10$...', description: 'Password hash' },
    { name: 'role', type: 'enum', required: false, example: 'user', enum: ['user', 'admin', 'staff', 'accountant', 'client', 'super_admin', 'project_manager', 'hr', 'ict_manager', 'procurement_manager', 'sales_manager'], description: 'User role' },
    { name: 'department', type: 'string', required: false, example: 'Sales', description: 'Department name' },
    { name: 'isActive', type: 'boolean', required: false, example: 'true', description: 'User active status' },
    { name: 'clientId', type: 'string', required: false, example: 'client_123', description: 'Associated client ID' },
    { name: 'permissions', type: 'string', required: false, example: '["finance:read"]', description: 'JSON permission list' },
    { name: 'phone', type: 'string', required: false, example: '+254712345678', description: 'Phone number' },
    { name: 'company', type: 'string', required: false, example: 'ABC Corporation', description: 'Company name' },
    { name: 'position', type: 'string', required: false, example: 'Manager', description: 'Job title' },
    { name: 'address', type: 'string', required: false, example: '123 Main Street', description: 'Address' },
    { name: 'city', type: 'string', required: false, example: 'Nairobi', description: 'City' },
    { name: 'country', type: 'string', required: false, example: 'Kenya', description: 'Country' },
    { name: 'photoUrl', type: 'string', required: false, example: 'https://...', description: 'Photo URL' },
    { name: 'organizationId', type: 'string', required: false, example: 'org_123', description: 'Organization ID' },
  ],
};

/**
 * Generate CSV content for a module template
 */
export function generateCSVTemplate(module: ModuleType): string {
  const columns = moduleTemplates[module];
  
  if (!columns) {
    throw new Error(`Unknown module: ${module}`);
  }

  // Create headers
  const headers = columns.map(col => {
    const required = col.required ? '*' : '';
    const type = ` [${col.type}]`;
    return `${col.name}${required}${type}`;
  });

  // Create description line (commented)
  const descriptions = columns.map(col => col.description || '');

  // Build CSV
  const lines = [
    '# Import Template for ' + module,
    '# Fields marked with * are required',
    '# Column descriptions: ' + descriptions.map((description, index) =>
      `${columns[index].name}=${description || columns[index].type}`
    ).join(' | '),
    headers.join(','),
  ];

  return lines.join('\n');
}

/**
 * Generate CSV template as downloadable file
 */
export function generateCSVTemplateFile(module: ModuleType): Blob {
  const csv = generateCSVTemplate(module);
  return new Blob([csv], { type: 'text/csv;charset=utf-8;' });
}

/**
 * Parse CSV content into array of objects
 */
export function parseCSV(csvContent: string): Record<string, any>[] {
  const lines = csvContent.split(/\r?\n/).filter(line => !line.trimStart().startsWith('#') && line.trim());
  
  if (lines.length < 2) {
    throw new Error('CSV file must have headers and at least one data row');
  }

  const headers = parseCSVLine(lines[0]).map(h => {
    const normalized = h.replace(/\[.*?\]/g, '').replace(/\*/g, '').trim();
    return legacyColumnAliases[normalized] ?? normalized;
  });

  const rows: Record<string, any>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row: Record<string, any> = {};

    headers.forEach((header, idx) => {
      let value = values[idx] || '';
      
      // Handle empty values
      if (value === '' || value === 'null' || value === 'undefined') {
        row[header] = null;
      } else if (value === 'true') {
        row[header] = true;
      } else if (value === 'false') {
        row[header] = false;
      } else if (!isNaN(Number(value)) && value !== '') {
        row[header] = Number(value);
      } else {
        row[header] = value;
      }
    });

    rows.push(row);
  }

  return rows;
}

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let value = '';
  let quoted = false;

  for (let index = 0; index < line.length; index++) {
    const char = line[index];
    const next = line[index + 1];
    if (char === '"' && quoted && next === '"') {
      value += '"';
      index++;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === ',' && !quoted) {
      values.push(value.trim());
      value = '';
    } else {
      value += char;
    }
  }
  values.push(value.trim());
  return values;
}

const legacyColumnAliases: Record<string, string> = {
  company_name: 'companyName',
  company: 'companyName',
  client_name: 'companyName',
  client_status: 'status',
  organization_id: 'organizationId',
  secondary_phone: 'secondaryPhone',
  assigned_to: 'assignedTo',
  created_by: 'createdBy',
  payment_terms: 'paymentTerms',
  number_of_employees: 'numberOfEmployees',
  year_established: 'yearEstablished',
  business_license: 'businessLicense',
  lead_source: 'leadSource',
  marital_status: 'maritalStatus',
  probation_end_date: 'probationEndDate',
  contract_end_date: 'contractEndDate',
  emergency_contact_name: 'emergencyContactName',
  emergency_contact_relationship: 'emergencyContactRelationship',
  emergency_contact_phone: 'emergencyContactPhone',
  bank_name: 'bankName',
  bank_branch: 'bankBranch',
  bank_account_number: 'bankAccountNumber',
  nhif_number: 'nhifNumber',
  nssf_number: 'nssfNumber',
  national_id: 'nationalId',
  photo_url: 'photoUrl',
  head_id: 'headId',
  salary_range_min: 'salaryRangeMin',
  salary_range_max: 'salaryRangeMax',
  default_role: 'defaultRole',
  minimum_gross_salary: 'minimumGrossSalary',
  maximum_gross_salary: 'maximumGrossSalary',
  is_active: 'isActive',
  cost_price: 'costPrice',
  stock_quantity: 'stockQuantity',
  min_stock_level: 'minStockLevel',
  tax_rate: 'taxRate',
  image_url: 'imageUrl',
  reorder_level: 'reorderLevel',
  reorder_quantity: 'reorderQuantity',
  last_restock_date: 'lastRestockDate',
  max_stock_level: 'maxStockLevel',
  payment_date: 'paymentDate',
  payment_method: 'paymentMethod',
  reference_number: 'referenceNumber',
  chart_of_account_type: 'chartOfAccountType',
  chart_of_account_id: 'chartOfAccountId',
  account_id: 'accountId',
  budget_allocation_id: 'budgetAllocationId',
  expense_number: 'expenseNumber',
  expense_date: 'expenseDate',
  receipt_url: 'receiptUrl',
  approved_by: 'approvedBy',
  approved_at: 'approvedAt',
  invoice_number: 'invoiceNumber',
  issue_date: 'issueDate',
  due_date: 'dueDate',
  tax_amount: 'taxAmount',
  discount_amount: 'discountAmount',
  paid_amount: 'paidAmount',
  payment_plan_id: 'paymentPlanId',
  is_auto_recurring: 'isAutoRecurring',
  recurring_invoice_id: 'recurringInvoiceId',
  client_subscription_id: 'clientSubscriptionId',
  email_verified: 'emailVerified',
  login_method: 'loginMethod',
  password_hash: 'passwordHash',
  custom_role_id: 'customRoleId',
  parent_account_code: 'parentAccountCode',
  parent_account_id: 'parentAccountId',
  account_code: 'accountCode',
  account_name: 'accountName',
  account_type: 'accountType',
  is_header_account: 'isHeaderAccount',
  productName: 'name',
};

/**
 * Get module templates list
 */
export function getAvailableModules(): Array<{ id: ModuleType; name: string; description: string }> {
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
