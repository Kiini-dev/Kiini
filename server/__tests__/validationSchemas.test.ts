import { describe, it, expect } from "vitest";
import { z } from "zod";

const clientValidationSchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone must be at least 10 characters"),
  physicalAddress: z.string().min(5, "Address must be at least 5 characters"),
});

const invoiceValidationSchema = z.object({
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  clientId: z.string().min(1, "Client is required"),
  issueDate: z.string().min(1, "Issue date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  subtotal: z.number().min(0, "Subtotal must be positive"),
  total: z.number().min(0, "Total must be positive"),
});

const estimateValidationSchema = z.object({
  estimateNumber: z.string().min(1, "Estimate number is required"),
  clientId: z.string().min(1, "Client is required"),
  issueDate: z.string().min(1, "Issue date is required"),
  expiryDate: z.string().min(1, "Expiry date is required"),
  subtotal: z.number().min(0, "Subtotal must be positive"),
  total: z.number().min(0, "Total must be positive"),
});

const receiptValidationSchema = z.object({
  receiptNumber: z.string().min(1, "Receipt number is required"),
  clientId: z.string().min(1, "Client is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  paymentMethod: z.enum(["cash", "bank-transfer", "mpesa", "cheque", "card"]),
  receiptDate: z.string().min(1, "Receipt date is required"),
});

const paymentValidationSchema = z.object({
  invoiceId: z.string().min(1, "Invoice is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  paymentMethod: z.enum(["cash", "bank-transfer", "mpesa", "cheque", "card"]),
  paymentDate: z.string().min(1, "Payment date is required"),
});

const productValidationSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  sku: z.string().min(2, "SKU must be at least 2 characters"),
  category: z.string().min(1, "Category is required"),
  unitPrice: z.number().min(0, "Unit price must be positive"),
  quantity: z.number().min(0, "Quantity must be positive"),
});

const expenseValidationSchema = z.object({
  date: z.string().min(1, "Date is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(2, "Description must be at least 2 characters"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  vendor: z.string().min(2, "Vendor must be at least 2 characters"),
  paymentMethod: z.enum(["cash", "bank-transfer", "mpesa", "cheque", "card"]),
});

// new schemas for leave/payroll inputs
const leaveCreateSchema = z.object({
  employeeId: z.string(),
  leaveType: z.enum(["annual", "sick", "maternity", "paternity", "unpaid", "other"]),
  startDate: z.date(),
  endDate: z.date(),
  days: z.number().min(0, "Days must be zero or positive"),
  reason: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["pending", "approved", "rejected", "cancelled"]).optional(),
});

const payrollCreateSchema = z.object({
  employeeId: z.string(),
  month: z.union([z.string(), z.date()]).optional(),
  payPeriodStart: z.date().optional(),
  payPeriodEnd: z.date().optional(),
  notes: z.string().optional(),
  basicSalary: z.number(),
  allowances: z.number().optional(),
  deductions: z.number().optional(),
  tax: z.number().optional(),
  netSalary: z.number(),
  status: z.enum(["draft", "processed", "paid"]).optional(),
});

const accountTypeValues = ['asset', 'liability', 'equity', 'revenue', 'expense', 'cost of goods sold', 'operating expense', 'capital expenditure', 'other income', 'other expense'] as const;
const normalizeAccountType = (value: unknown): string => {
  if (typeof value !== 'string') return 'asset';
  const normalized = value.trim().toLowerCase().replace(/\s+/g, ' ');
  const aliasMap: Record<string, string> = {
    'cogs': 'cost of goods sold',
    'cost of goods sold': 'cost of goods sold',
    'opex': 'operating expense',
    'operating expense': 'operating expense',
    'capex': 'capital expenditure',
    'capital expenditure': 'capital expenditure',
  };
  return aliasMap[normalized] ?? normalized;
};

const csvAccountTypeSchema = z.preprocess((value) => normalizeAccountType(value), z.enum(accountTypeValues));

describe("Form Validation Schemas", () => {
  describe("clientValidationSchema", () => {
    it("should validate a valid client", () => {
      const validClient = {
        companyName: "Acme Corp",
        email: "contact@acme.com",
        phone: "1234567890",
        physicalAddress: "123 Main St",
      };
      const result = clientValidationSchema.safeParse(validClient);
      expect(result.success).toBe(true);
    });

    it("should reject client with short company name", () => {
      const invalidClient = {
        companyName: "A",
        email: "contact@acme.com",
        phone: "1234567890",
        physicalAddress: "123 Main St",
      };
      const result = clientValidationSchema.safeParse(invalidClient);
      expect(result.success).toBe(false);
    });

    it("should reject client with invalid email", () => {
      const invalidClient = {
        companyName: "Acme Corp",
        email: "not-an-email",
        phone: "1234567890",
        physicalAddress: "123 Main St",
      };
      const result = clientValidationSchema.safeParse(invalidClient);
      expect(result.success).toBe(false);
    });

    it("should reject client with short phone", () => {
      const invalidClient = {
        companyName: "Acme Corp",
        email: "contact@acme.com",
        phone: "123",
        physicalAddress: "123 Main St",
      };
      const result = clientValidationSchema.safeParse(invalidClient);
      expect(result.success).toBe(false);
    });
  });

  describe("CSV account type normalization", () => {
    it("accepts title-cased account type values from CSV imports", () => {
      const parsed = csvAccountTypeSchema.safeParse("Cost Of Goods Sold");
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data).toBe("cost of goods sold");
      }
    });

    it("accepts mixed-case operating expense values", () => {
      const parsed = csvAccountTypeSchema.safeParse("Operating Expense");
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data).toBe("operating expense");
      }
    });

    it("accepts exported shorthand aliases like cogs and opex", () => {
      expect(csvAccountTypeSchema.safeParse("cogs").success).toBe(true);
      expect(csvAccountTypeSchema.safeParse("opex").success).toBe(true);
      expect(csvAccountTypeSchema.safeParse("cogs").data).toBe("cost of goods sold");
      expect(csvAccountTypeSchema.safeParse("opex").data).toBe("operating expense");
    });
  });

  describe("invoiceValidationSchema", () => {
    it("should validate a valid invoice", () => {
      const validInvoice = {
        invoiceNumber: "INV-001",
        clientId: "client-123",
        issueDate: "2024-01-01",
        dueDate: "2024-02-01",
        subtotal: 1000,
        total: 1160,
      };
      const result = invoiceValidationSchema.safeParse(validInvoice);
      expect(result.success).toBe(true);
    });

    it("should reject invoice without invoice number", () => {
      const invalidInvoice = {
        invoiceNumber: "",
        clientId: "client-123",
        issueDate: "2024-01-01",
        dueDate: "2024-02-01",
        subtotal: 1000,
        total: 1160,
      };
      const result = invoiceValidationSchema.safeParse(invalidInvoice);
      expect(result.success).toBe(false);
    });

    it("should reject invoice with negative subtotal", () => {
      const invalidInvoice = {
        invoiceNumber: "INV-001",
        clientId: "client-123",
        issueDate: "2024-01-01",
        dueDate: "2024-02-01",
        subtotal: -100,
        total: 1160,
      };
      const result = invoiceValidationSchema.safeParse(invalidInvoice);
      expect(result.success).toBe(false);
    });
  });

  describe("estimateValidationSchema", () => {
    it("should validate a valid estimate", () => {
      const validEstimate = {
        estimateNumber: "EST-001",
        clientId: "client-123",
        issueDate: "2024-01-01",
        expiryDate: "2024-02-01",
        subtotal: 1000,
        total: 1160,
      };
      const result = estimateValidationSchema.safeParse(validEstimate);
      expect(result.success).toBe(true);
    });

    it("should reject estimate without estimate number", () => {
      const invalidEstimate = {
        estimateNumber: "",
        clientId: "client-123",
        issueDate: "2024-01-01",
        expiryDate: "2024-02-01",
        subtotal: 1000,
        total: 1160,
      };
      const result = estimateValidationSchema.safeParse(invalidEstimate);
      expect(result.success).toBe(false);
    });
  });

  describe("receiptValidationSchema", () => {
    it("should validate a valid receipt", () => {
      const validReceipt = {
        receiptNumber: "REC-001",
        clientId: "client-123",
        amount: 500,
        paymentMethod: "cash",
        receiptDate: "2024-01-01",
      };
      const result = receiptValidationSchema.safeParse(validReceipt);
      expect(result.success).toBe(true);
    });

    it("should reject receipt with zero amount", () => {
      const invalidReceipt = {
        receiptNumber: "REC-001",
        clientId: "client-123",
        amount: 0,
        paymentMethod: "cash",
        receiptDate: "2024-01-01",
      };
      const result = receiptValidationSchema.safeParse(invalidReceipt);
      expect(result.success).toBe(false);
    });

    it("should reject receipt with invalid payment method", () => {
      const invalidReceipt = {
        receiptNumber: "REC-001",
        clientId: "client-123",
        amount: 500,
        paymentMethod: "invalid",
        receiptDate: "2024-01-01",
      };
      const result = receiptValidationSchema.safeParse(invalidReceipt);
      expect(result.success).toBe(false);
    });
  });

  describe("paymentValidationSchema", () => {
    it("should validate a valid payment", () => {
      const validPayment = {
        invoiceId: "invoice-123",
        amount: 500,
        paymentMethod: "bank-transfer",
        paymentDate: "2024-01-01",
      };
      const result = paymentValidationSchema.safeParse(validPayment);
      expect(result.success).toBe(true);
    });

    it("should reject payment with negative amount", () => {
      const invalidPayment = {
        invoiceId: "invoice-123",
        amount: -100,
        paymentMethod: "bank-transfer",
        paymentDate: "2024-01-01",
      };
      const result = paymentValidationSchema.safeParse(invalidPayment);
      expect(result.success).toBe(false);
    });
  });

  describe("productValidationSchema", () => {
    it("should validate a valid product", () => {
      const validProduct = {
        name: "Widget",
        sku: "WID-001",
        category: "Electronics",
        unitPrice: 99.99,
        quantity: 100,
      };
      const result = productValidationSchema.safeParse(validProduct);
      expect(result.success).toBe(true);
    });

    it("should reject product with short name", () => {
      const invalidProduct = {
        name: "W",
        sku: "WID-001",
        category: "Electronics",
        unitPrice: 99.99,
        quantity: 100,
      };
      const result = productValidationSchema.safeParse(invalidProduct);
      expect(result.success).toBe(false);
    });
  });

  describe("expenseValidationSchema", () => {
    it("should validate a valid expense", () => {
      const validExpense = {
        date: "2024-01-01",
        category: "Office Supplies",
        description: "Printer paper",
        amount: 50,
        vendor: "Office Depot",
        paymentMethod: "card",
      };
      const result = expenseValidationSchema.safeParse(validExpense);
      expect(result.success).toBe(true);
    });

    it("should reject expense with zero amount", () => {
      const invalidExpense = {
        date: "2024-01-01",
        category: "Office Supplies",
        description: "Printer paper",
        amount: 0,
        vendor: "Office Depot",
        paymentMethod: "card",
      };
      const result = expenseValidationSchema.safeParse(invalidExpense);
      expect(result.success).toBe(false);
    });
  });

  // additional tests for leave/payroll
  describe("leaveCreateSchema", () => {
    it("should validate a valid leave request", () => {
      const validLeave = {
        employeeId: "emp1",
        leaveType: "annual",
        startDate: new Date("2024-06-01"),
        endDate: new Date("2024-06-05"),
        days: 5,
      };
      const result = leaveCreateSchema.safeParse(validLeave);
      expect(result.success).toBe(true);
    });

    it("should reject leave with negative days", () => {
      const invalidLeave = {
        employeeId: "emp1",
        leaveType: "annual",
        startDate: new Date("2024-06-01"),
        endDate: new Date("2024-06-05"),
        days: -3,
      };
      const result = leaveCreateSchema.safeParse(invalidLeave);
      expect(result.success).toBe(false);
    });
  });

  describe("payrollCreateSchema", () => {
    it("should validate a basic payroll record", () => {
      const validPayroll = {
        employeeId: "emp2",
        basicSalary: 50000,
        netSalary: 45000,
      };
      const result = payrollCreateSchema.safeParse(validPayroll);
      expect(result.success).toBe(true);
    });

    it("should reject payroll with missing net salary", () => {
      const invalidPayroll = {
        employeeId: "emp2",
        basicSalary: 50000,
      };
      const result = payrollCreateSchema.safeParse(invalidPayroll);
      expect(result.success).toBe(false);
    });
  });
});

