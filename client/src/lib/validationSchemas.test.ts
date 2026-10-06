import { describe, it, expect } from "vitest";
import {
  clientValidationSchema,
  projectValidationSchema,
  invoiceValidationSchema,
  estimateValidationSchema,
  receiptValidationSchema,
  paymentValidationSchema,
  productValidationSchema,
  expenseValidationSchema,
  validateForm,
  getFieldError,
} from "./validationSchemas";

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

    it("should reject client with short address", () => {
      const invalidClient = {
        companyName: "Acme Corp",
        email: "contact@acme.com",
        phone: "1234567890",
        physicalAddress: "123",
      };
      const result = clientValidationSchema.safeParse(invalidClient);
      expect(result.success).toBe(false);
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

    it("should reject invoice without client", () => {
      const invalidInvoice = {
        invoiceNumber: "INV-001",
        clientId: "",
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
    it("should validate a valid payment with canonical bank transfer value", () => {
      const validPayment = {
        invoiceId: "invoice-123",
        amount: 500,
        paymentMethod: "bank_transfer",
        paymentDate: "2024-01-01",
      };
      const result = paymentValidationSchema.safeParse(validPayment);
      expect(result.success).toBe(true);
    });

    it("should accept legacy bank transfer aliases for backward compatibility", () => {
      const validLegacyPayment = {
        invoiceId: "invoice-123",
        amount: 500,
        paymentMethod: "bank-transfer",
        paymentDate: "2024-01-01",
      };
      const result = paymentValidationSchema.safeParse(validLegacyPayment);
      expect(result.success).toBe(true);
    });

    it("should reject payment with negative amount", () => {
      const invalidPayment = {
        invoiceId: "invoice-123",
        amount: -100,
        paymentMethod: "bank_transfer",
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

  describe("validateForm helper function", () => {
    it("should return valid: true for valid data", () => {
      const validClient = {
        companyName: "Acme Corp",
        email: "contact@acme.com",
        phone: "1234567890",
        physicalAddress: "123 Main St",
      };
      const result = validateForm(clientValidationSchema, validClient);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it("should return valid: false and error messages for invalid data", () => {
      const invalidClient = {
        companyName: "A",
        email: "not-an-email",
        phone: "123",
        physicalAddress: "123",
      };
      const result = validateForm(clientValidationSchema, invalidClient);
      expect(result.valid).toBe(false);
      expect(Object.keys(result.errors).length).toBeGreaterThan(0);
    });

    it("should include specific error messages", () => {
      const invalidClient = {
        companyName: "A",
        email: "not-an-email",
        phone: "123",
        physicalAddress: "123",
      };
      const result = validateForm(clientValidationSchema, invalidClient);
      expect(result.errors.companyName).toBeDefined();
      expect(result.errors.email).toBeDefined();
      expect(result.errors.phone).toBeDefined();
      expect(result.errors.physicalAddress).toBeDefined();
    });
  });

  describe("getFieldError helper function", () => {
    it("should return error message for existing field", () => {
      const errors = {
        companyName: "Company name must be at least 2 characters",
        email: "Invalid email address",
      };
      const error = getFieldError(errors, "companyName");
      expect(error).toBe("Company name must be at least 2 characters");
    });

    it("should return undefined for non-existing field", () => {
      const errors = {
        companyName: "Company name must be at least 2 characters",
      };
      const error = getFieldError(errors, "email");
      expect(error).toBeUndefined();
    });
  });
});

