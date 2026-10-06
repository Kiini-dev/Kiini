/**
 * Client-side CSV Template Generator
 * Simplified version for client-side CSV operations
 */

export type ModuleType = 
  | 'clients' | 'employees' | 'departments' 
  | 'jobGroups' | 'products' | 'services' 
  | 'payments' | 'accounts' | 'bankAccounts' 
  | 'expenses' | 'invoices' | 'users';

// Module definitions with database-aligned column headers from the live schema.
const legacyHeaderAliases: Record<string, string> = {
  organization_id: 'organizationId',
  organizationId: 'organizationId',
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
  manager_id: 'managerId',
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
  serviceName: 'name',
  hourly_rate: 'hourlyRate',
  fixed_price: 'fixedPrice',
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
  client_id: 'clientId',
  estimate_id: 'estimateId',
  issue_date: 'issueDate',
  due_date: 'dueDate',
  tax_amount: 'taxAmount',
  discount_amount: 'discountAmount',
  paid_amount: 'paidAmount',
  payment_plan_id: 'paymentPlanId',
  is_auto_recurring: 'isAutoRecurring',
  recurring_invoice_id: 'recurringInvoiceId',
  client_subscription_id: 'clientSubscriptionId',
  account_manager_id: 'accountManagerId',
  email_verified: 'emailVerified',
  login_method: 'loginMethod',
  password_hash: 'passwordHash',
  custom_role_id: 'customRoleId',
  parent_account_code: 'parentAccountCode',
  parentAccountCode: 'parentAccountCode',
  account_code: 'accountCode',
  account_name: 'accountName',
  account_type: 'accountType',
  is_header_account: 'isHeaderAccount',
  invoiceId: 'invoiceId',
  clientId: 'clientId',
  productName: 'name',
  accountId: 'accountId',
  unitPrice: 'unitPrice',
  stockQuantity: 'stockQuantity',
  isActive: 'isActive',
  item_id: 'itemId',
  itemType: 'itemType',
};

const moduleColumns: Record<ModuleType, string[]> = {
  clients: ['organizationId','companyName','contactPerson','email','phone','secondaryPhone','address','city','country','postalCode','taxId','website','industry','status','assignedTo','notes','createdBy','businessType','registrationNumber','bankName','bankCode','branch','bankAccountNumber','creditLimit','paymentTerms','numberOfEmployees','yearEstablished','businessLicense','leadSource','currency'],
  employees: ['organizationId','userId','employeeNumber','firstName','lastName','email','phone','country','gender','maritalStatus','dateOfBirth','hireDate','probationEndDate','contractEndDate','department','position','jobGroupId','salary','employmentType','status','address','emergencyContactName','emergencyContactRelationship','emergencyContactPhone','emergencyContact','bankName','bankBranch','bankAccountNumber','nhifNumber','nssfNumber','taxId','nationalId','photoUrl','createdBy'],
  departments: ['organizationId','name','description','headId','budget','salaryRangeMin','salaryRangeMax','status','defaultRole','createdBy'],
  jobGroups: ['organizationId','name','managerId','minimumGrossSalary','maximumGrossSalary','description','isActive'],
  products: ['organizationId','name','description','sku','category','unitPrice','costPrice','stockQuantity','minStockLevel','unit','taxRate','isActive','imageUrl','createdBy','supplier','reorderLevel','reorderQuantity','lastRestockDate','maxStockLevel','location'],
  services: ['organizationId','name','description','category','hourlyRate','fixedPrice','unit','taxRate','deliverables','isActive','createdBy'],
  payments: ['organizationId','invoiceId','clientId','accountId','amount','paymentDate','paymentMethod','referenceNumber','chartOfAccountType','chartOfAccountId','notes','status','approvedBy','approvedAt','createdBy'],
  accounts: ['organizationId','accountCode','accountName','accountType','parentAccountId','balance','isActive','description'],
  bankAccounts: ['accountName','bankName','accountNumber','currency','balance','isActive'],
  expenses: ['organizationId','expenseNumber','category','vendor','amount','expenseDate','paymentMethod','receiptUrl','description','accountId','budgetAllocationId','status','createdBy','approvedBy','approvedAt','chartOfAccountId'],
  invoices: ['organizationId','invoiceNumber','clientId','estimateId','title','status','issueDate','dueDate','subtotal','taxAmount','discountAmount','total','paidAmount','notes','terms','createdBy','paymentPlanId','isAutoRecurring','recurringInvoiceId','clientSubscriptionId','accountManagerId'],
  users: ['name','email','emailVerified','loginMethod','passwordHash','role','department','isActive','clientId','permissions','phone','company','position','address','city','country','photoUrl','organizationId'],
};

/**
 * Get available modules for import
 */
export function getAvailableModules() {
  return Object.keys(moduleColumns).map(id => ({
    id,
    label: id.charAt(0).toUpperCase() + id.slice(1),
    description: `Import ${id} data`
  }));
}

/**
 * Generate CSV template file
 */
export function generateCSVTemplateFile(moduleType: ModuleType): Blob {
  const columns = moduleColumns[moduleType] || [];
  const header = columns.join(',');
  const content = header + '\n';
  
  return new Blob([content], { type: 'text/csv;charset=utf-8;' });
}

/**
 * Parse CSV content
 */
export function parseCSV(content: string): Record<string, any>[] {
  const lines = content.trim().split('\n');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim());
  const rows: Record<string, any>[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    const values = parseCSVLine(lines[i]);
    const row: Record<string, any> = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    rows.push(row);
  }
  
  return rows;
}

/**
 * Parse a single CSV line handling quoted values
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let insideQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        // Toggle quote state
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      // End of field
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add last field
  result.push(current.trim());
  
  return result;
}
