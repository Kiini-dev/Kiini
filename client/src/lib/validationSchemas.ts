import { z } from "zod";

/**
 * Validation schemas for all CRM forms
 * Using Zod for type-safe validation
 */

const paymentMethodAliases: Record<string, string> = {
  cash: "cash",
  bank: "bank_transfer",
  bank_account: "bank_transfer",
  bank_transfer: "bank_transfer",
  "bank-transfer": "bank_transfer",
  "bank transfer": "bank_transfer",
  cheque: "cheque",
  check: "cheque",
  card: "card",
  credit_card: "card",
  "credit-card": "card",
  debit_card: "card",
  "debit-card": "card",
  mpesa: "mpesa",
  "m-pesa": "mpesa",
  mobile_money: "mpesa",
  "mobile-money": "mpesa",
  "mobile money": "mpesa",
  other: "other",
};

const normalizePaymentMethodValue = (value: unknown): unknown => {
  if (typeof value !== "string") return value;

  const normalized = value.trim().toLowerCase();
  if (paymentMethodAliases[normalized]) return paymentMethodAliases[normalized];

  return normalized.replace(/[\s-]+/g, "_");
};

// Client validation schema
export const clientValidationSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone must be at least 10 characters"),
  physicalAddress: z.string().min(5, "Address must be at least 5 characters"),
  postalAddress: z.string().optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  taxId: z.string().optional(),
  registrationNumber: z.string().optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export type ClientFormData = z.infer<typeof clientValidationSchema>;

// Project validation schema
export const projectValidationSchema = z.object({
  name: z.string().min(3, "Project name must be at least 3 characters"),
  clientId: z.string().min(1, "Client is required"),
  description: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  budget: z.number().min(0, "Budget must be positive"),
  status: z.enum(["active", "completed", "on-hold"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
});

export type ProjectFormData = z.infer<typeof projectValidationSchema>;

// Invoice validation schema
export const invoiceValidationSchema = z.object({
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  clientId: z.string().min(1, "Client is required"),
  issueDate: z.string().min(1, "Issue date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  subtotal: z.number().min(0, "Subtotal must be positive"),
  taxAmount: z.number().min(0, "Tax must be positive").optional(),
  discountAmount: z.number().min(0, "Discount must be positive").optional(),
  total: z.number().min(0, "Total must be positive"),
  notes: z.string().optional(),
  terms: z.string().optional(),
  status: z.enum(["draft", "sent", "paid", "partial", "overdue", "cancelled"]).optional(),
});

export type InvoiceFormData = z.infer<typeof invoiceValidationSchema>;

// Estimate validation schema
export const estimateValidationSchema = z.object({
  estimateNumber: z.string().min(1, "Estimate number is required"),
  clientId: z.string().min(1, "Client is required"),
  issueDate: z.string().min(1, "Issue date is required"),
  expiryDate: z.string().min(1, "Expiry date is required"),
  subtotal: z.number().min(0, "Subtotal must be positive"),
  taxAmount: z.number().min(0, "Tax must be positive").optional(),
  discountAmount: z.number().min(0, "Discount must be positive").optional(),
  total: z.number().min(0, "Total must be positive"),
  notes: z.string().optional(),
  terms: z.string().optional(),
  status: z.enum(["draft", "sent", "accepted", "rejected", "expired"]).optional(),
});

export type EstimateFormData = z.infer<typeof estimateValidationSchema>;

// Receipt validation schema
export const receiptValidationSchema = z.object({
  receiptNumber: z.string().min(1, "Receipt number is required"),
  clientId: z.string().min(1, "Client is required"),
  paymentId: z.string().optional(),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  paymentMethod: z.preprocess(normalizePaymentMethodValue, z.enum(["cash", "bank_transfer", "mpesa", "cheque", "card"])),
  receiptDate: z.string().min(1, "Receipt date is required"),
  notes: z.string().optional(),
  status: z.enum(["issued", "void"]).optional(),
});

export type ReceiptFormData = z.infer<typeof receiptValidationSchema>;

// Payment validation schema
export const paymentValidationSchema = z.object({
  invoiceId: z.string().min(1, "Invoice is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  paymentMethod: z.preprocess(normalizePaymentMethodValue, z.enum(["cash", "bank_transfer", "mpesa", "cheque", "card"])),
  paymentDate: z.string().min(1, "Payment date is required"),
  reference: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["completed", "pending", "failed"]).optional(),
});

export type PaymentFormData = z.infer<typeof paymentValidationSchema>;

// Product validation schema
export const productValidationSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  sku: z.string().min(2, "SKU must be at least 2 characters"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  unitPrice: z.number().min(0, "Unit price must be positive"),
  quantity: z.number().min(0, "Quantity must be positive"),
  reorderLevel: z.number().min(0, "Reorder level must be positive").optional(),
  status: z.enum(["active", "inactive", "discontinued"]).optional(),
});

export type ProductFormData = z.infer<typeof productValidationSchema>;

// Service validation schema
export const serviceValidationSchema = z.object({
  name: z.string().min(2, "Service name must be at least 2 characters"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  basePrice: z.number().min(0, "Base price must be positive"),
  billingType: z.enum(["hourly", "fixed", "retainer"]).optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export type ServiceFormData = z.infer<typeof serviceValidationSchema>;

// Expense validation schema
export const expenseValidationSchema = z.object({
  date: z.string().min(1, "Date is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(2, "Description must be at least 2 characters"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  vendor: z.string().min(2, "Vendor must be at least 2 characters"),
  paymentMethod: z.preprocess(normalizePaymentMethodValue, z.enum(["cash", "bank_transfer", "mpesa", "cheque", "card"])),
  status: z.enum(["pending", "approved", "rejected"]).optional(),
  receipt: z.string().optional(),
});

export type ExpenseFormData = z.infer<typeof expenseValidationSchema>;

// Employee validation schema
export const employeeValidationSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone must be at least 10 characters"),
  position: z.string().min(2, "Position must be at least 2 characters"),
  department: z.string().min(1, "Department is required"),
  hireDate: z.string().min(1, "Hire date is required"),
  salary: z.number().min(0, "Salary must be positive"),
  status: z.enum(["active", "inactive", "on-leave"]).optional(),
});

export type EmployeeFormData = z.infer<typeof employeeValidationSchema>;

// Department validation schema
export const departmentValidationSchema = z.object({
  name: z.string().min(2, "Department name must be at least 2 characters"),
  description: z.string().optional(),
  budget: z.number().min(0, "Budget must be positive").optional(),
  salaryRangeMin: z.number().min(0, "Minimum salary must be positive").optional().nullable(),
  salaryRangeMax: z.number().min(0, "Maximum salary must be positive").optional().nullable(),
  status: z.enum(["active", "inactive"]).optional(),
});

export type DepartmentFormData = z.infer<typeof departmentValidationSchema>;

// Opportunity validation schema
export const opportunityValidationSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  clientId: z.string().min(1, "Client is required"),
  value: z.number().min(0, "Value must be positive"),
  probability: z.number().min(0).max(100, "Probability must be between 0 and 100"),
  stage: z.enum(["lead", "qualified", "proposal", "negotiation", "won", "lost"]).optional(),
  expectedCloseDate: z.string().min(1, "Expected close date is required"),
  description: z.string().optional(),
  status: z.enum(["active", "closed", "lost"]).optional(),
});

export type OpportunityFormData = z.infer<typeof opportunityValidationSchema>;

// Line Item validation schema
export const lineItemValidationSchema = z.object({
  description: z.string().min(2, "Description must be at least 2 characters"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  unitPrice: z.number().min(0, "Unit price must be positive"),
  taxRate: z.number().min(0).max(100, "Tax rate must be between 0 and 100").optional(),
  discountPercent: z.number().min(0).max(100, "Discount must be between 0 and 100").optional(),
});

export type LineItemFormData = z.infer<typeof lineItemValidationSchema>;

// Helper function to validate and return errors
export const validateForm = <T>(schema: z.ZodSchema<T>, data: unknown): { valid: boolean; errors: Record<string, string> } => {
  try {
    schema.parse(data);
    return { valid: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      if (error.issues && Array.isArray(error.issues)) {
        error.issues.forEach((err: any) => {
          const path = Array.isArray(err.path) ? err.path.join(".") : String(err.path || "");
          errors[path] = err.message;
        });
      }
      return { valid: false, errors };
    }
    return { valid: false, errors: { general: "Validation failed" } };
  }
};

// Helper function to get field error message
export const getFieldError = (errors: Record<string, string>, fieldName: string): string | undefined => {
  return errors[fieldName];
};

