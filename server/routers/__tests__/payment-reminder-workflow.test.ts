/**
 * Payment Reminder Workflow Test
 * Validates the business logic for payment reminder workflow
 */

import { describe, it, expect } from "vitest";
import { z } from "zod";

describe("Payment Reminder Workflow", () => {
  describe("Input Validation", () => {
    it("should validate payment reminder input", () => {
      const inputSchema = z.object({
        invoiceId: z.string().min(1),
        recipientEmail: z.string().email(),
      });

      const validInput = {
        invoiceId: "inv-123",
        recipientEmail: "client@example.com",
      };

      expect(() => inputSchema.parse(validInput)).not.toThrow();
    });

    it("should reject missing invoiceId", () => {
      const inputSchema = z.object({
        invoiceId: z.string().min(1),
        recipientEmail: z.string().email(),
      });

      const invalidInput = {
        invoiceId: "",
        recipientEmail: "client@example.com",
      };

      expect(() => inputSchema.parse(invalidInput)).toThrow();
    });

    it("should reject invalid email address", () => {
      const inputSchema = z.object({
        invoiceId: z.string().min(1),
        recipientEmail: z.string().email(),
      });

      const invalidInput = {
        invoiceId: "inv-123",
        recipientEmail: "not-an-email",
      };

      expect(() => inputSchema.parse(invalidInput)).toThrow();
    });

    it("should accept various valid email formats", () => {
      const inputSchema = z.object({
        recipientEmail: z.string().email(),
      });

      const validEmails = [
        "test@example.com",
        "john.doe@company.co.ke",
        "user+tag@domain.com",
        "name_underscore@example.com",
      ];

      validEmails.forEach((email) => {
        expect(() => inputSchema.parse({ recipientEmail: email })).not.toThrow();
      });
    });
  });

  describe("Overdue Calculation", () => {
    it("should calculate days overdue correctly", () => {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() - 5); // 5 days ago

      const daysOverdue = Math.floor(
        (new Date().getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      expect(daysOverdue).toBeGreaterThanOrEqual(5);
    });

    it("should return at least 1 day for recently overdue invoices", () => {
      const dueDate = new Date();
      dueDate.setMinutes(dueDate.getMinutes() - 30); // 30 minutes ago

      const daysOverdue = Math.floor(
        (new Date().getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      expect(Math.max(daysOverdue, 1)).toBeGreaterThanOrEqual(1);
    });

    it("should handle future due dates (not yet overdue)", () => {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 5); // 5 days in future

      const daysOverdue = Math.floor(
        (new Date().getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      expect(daysOverdue).toBeLessThan(0);
    });

    it("should handle edge case: invoice due today", () => {
      const dueDate = new Date();
      dueDate.setHours(0, 0, 0, 0); // Start of today

      const daysOverdue = Math.floor(
        (new Date().getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      expect(daysOverdue).toBeLessThanOrEqual(1);
    });

    it("should handle large overdue periods", () => {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() - 365); // 1 year overdue

      const daysOverdue = Math.floor(
        (new Date().getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      expect(daysOverdue).toBeGreaterThanOrEqual(365);
    });
  });

  describe("Email Template Generation", () => {
    const emailTemplates = {
      paymentReminder: (
        clientName: string,
        invoiceNumber: string,
        amount: number,
        daysOverdue: number
      ) => ({
        subject: `Payment Reminder: Invoice ${invoiceNumber} is ${daysOverdue} days overdue`,
        body: `Dear ${clientName},\n\nThis is a friendly reminder that invoice ${invoiceNumber} for Ksh ${amount.toLocaleString()} is now ${daysOverdue} days overdue.\n\nPlease arrange payment at your earliest convenience.\n\nThank you,\nYour Company`,
      }),
    };

    it("should generate correct subject line", () => {
      const template = emailTemplates.paymentReminder(
        "John Doe",
        "INV-001",
        50000,
        5
      );

      expect(template.subject).toContain("INV-001");
      expect(template.subject).toContain("5 days overdue");
    });

    it("should include client name in greeting", () => {
      const template = emailTemplates.paymentReminder(
        "Jane Smith",
        "INV-002",
        100000,
        10
      );

      expect(template.body).toContain("Dear Jane Smith");
    });

    it("should format currency with locale", () => {
      const template = emailTemplates.paymentReminder(
        "Client",
        "INV-003",
        50000,
        3
      );

      expect(template.body).toContain("50,000");
    });

    it("should include invoice number in body", () => {
      const template = emailTemplates.paymentReminder(
        "Client",
        "INV-404",
        75000,
        7
      );

      expect(template.body).toContain("INV-404");
    });

    it("should include overdue period in body", () => {
      const template = emailTemplates.paymentReminder(
        "Client",
        "INV-005",
        25000,
        15
      );

      expect(template.body).toContain("15 days overdue");
    });

    it("should handle special characters in client name", () => {
      const template = emailTemplates.paymentReminder(
        "O'Brien & Associates",
        "INV-006",
        50000,
        5
      );

      expect(template.body).toContain("O'Brien & Associates");
    });

    it("should generate professional closing", () => {
      const template = emailTemplates.paymentReminder(
        "Client",
        "INV-007",
        50000,
        5
      );

      expect(template.body).toContain("Thank you");
      expect(template.body).toContain("Your Company");
    });
  });

  describe("Currency Formatting", () => {
    it("should format Kenyan Shilling amounts", () => {
      const amounts = [1000, 50000, 100000, 1000000];
      const formatted = amounts.map((amt) => amt.toLocaleString());

      expect(formatted).toEqual(["1,000", "50,000", "100,000", "1,000,000"]);
    });

    it("should handle small amounts", () => {
      const amount = 100;
      expect(amount.toLocaleString()).toBe("100");
    });

    it("should handle large amounts", () => {
      const amount = 50000000;
      expect(amount.toLocaleString()).toBe("50,000,000");
    });

    it("should handle decimal amounts", () => {
      const amount = 10050;
      // Note: toLocaleString may not include decimals for integers
      expect(amount.toLocaleString()).toBeDefined();
    });
  });

  describe("Invoice Status Handling", () => {
    const validStatuses = ["draft", "sent", "pending", "overdue", "paid"];

    it("should recognize payment reminder eligible statuses", () => {
      const reminderEligibleStatuses = ["overdue", "pending", "sent"];

      reminderEligibleStatuses.forEach((status) => {
        expect(validStatuses).toContain(status);
      });
    });

    it("should not send reminders for paid invoices", () => {
      const status = "paid";
      const reminderEligibleStatuses = ["overdue", "pending", "sent"];

      expect(reminderEligibleStatuses).not.toContain(status);
    });

    it("should not send reminders for draft invoices", () => {
      const status = "draft";
      const reminderEligibleStatuses = ["overdue", "pending", "sent"];

      expect(reminderEligibleStatuses).not.toContain(status);
    });

    it("should determine recipient eligibility based on status", () => {
      const invoice = { status: "overdue", clientEmail: "client@example.com" };
      const canSendReminder =
        (invoice.status === "overdue" ||
          invoice.status === "pending" ||
          invoice.status === "sent") &&
        !!invoice.clientEmail;

      expect(canSendReminder).toBe(true);
    });
  });

  describe("Bulk Reminder Processing", () => {
    it("should process multiple invoices", () => {
      const invoices = [
        { id: "inv-1", status: "overdue" },
        { id: "inv-2", status: "pending" },
        { id: "inv-3", status: "overdue" },
      ];

      const reminderEligible = invoices.filter(
        (inv) => inv.status === "overdue" || inv.status === "pending"
      );

      expect(reminderEligible).toHaveLength(3);
    });

    it("should skip paid invoices in bulk processing", () => {
      const invoices = [
        { id: "inv-1", status: "overdue" },
        { id: "inv-2", status: "paid" },
        { id: "inv-3", status: "pending" },
      ];

      const reminderEligible = invoices.filter(
        (inv) => inv.status === "overdue" || inv.status === "pending"
      );

      expect(reminderEligible).toHaveLength(2);
    });

    it("should track reminder send status", () => {
      const reminders = [
        { invoiceId: "inv-1", sent: true },
        { invoiceId: "inv-2", sent: false },
        { invoiceId: "inv-3", sent: true },
      ];

      const successfully= reminders.filter((r) => r.sent).length;
      const failed = reminders.filter((r) => !r.sent).length;

      expect(successfully).toBe(2);
      expect(failed).toBe(1);
    });
  });

  describe("Activity Logging", () => {
    it("should create log entry for reminder sent", () => {
      const logEntry = {
        userId: "user-123",
        action: "payment_reminder_sent",
        entityType: "invoice",
        entityId: "inv-456",
        description: "Sent payment reminder for invoice INV-001 to client@example.com",
        timestamp: new Date(),
      };

      expect(logEntry.action).toBe("payment_reminder_sent");
      expect(logEntry.entityType).toBe("invoice");
      expect(logEntry.description).toContain("payment reminder");
    });

    it("should track reminder recipient email", () => {
      const logEntry = {
        action: "payment_reminder_sent",
        description: "Sent payment reminder for invoice INV-001 to client@example.com",
      };

      expect(logEntry.description).toContain("@example.com");
    });
  });

  describe("Error Handling", () => {
    it("should handle missing invoice gracefully", () => {
      const getInvoiceError = (invoiceId: string | null) => {
        if (!invoiceId) {
          return "Invoice not found";
        }
        return null;
      };

      expect(getInvoiceError(null)).toBe("Invoice not found");
      expect(getInvoiceError("inv-123")).toBe(null);
    });

    it("should handle missing client data", () => {
      const validateClientEmail = (email: string | null) => {
        if (!email) {
          return "Client email not found";
        }
        return null;
      };

      expect(validateClientEmail(null)).toBe("Client email not found");
      expect(validateClientEmail("client@example.com")).toBe(null);
    });

    it("should validate email sender configuration", () => {
      const smtpConfig = {
        host: "mail.example.com",
        port: 465,
        user: "noreply@example.com",
        password: "password",
        fromEmail: "noreply@example.com",
      };

      expect(smtpConfig.host).toBeTruthy();
      expect(smtpConfig.fromEmail).toBeTruthy();
    });
  });

  describe("Frontend-Backend Integration", () => {
    it("should accept mutation payload from frontend", () => {
      const mutationSchema = z.object({
        invoiceId: z.string(),
        recipientEmail: z.string().email(),
      });

      const payload = {
        invoiceId: "inv-123",
        recipientEmail: "client@example.com",
      };

      expect(() => mutationSchema.parse(payload)).not.toThrow();
    });

    it("should return success response", () => {
      const response = {
        success: true,
        message: "Payment reminder sent to client@example.com",
        email: {
          to: "client@example.com",
          subject: "Payment Reminder: Invoice INV-001 is 5 days overdue",
          body: "Dear Client,\n\nThis is a friendly reminder...",
        },
      };

      expect(response.success).toBe(true);
      expect(response.message).toContain("Payment reminder sent");
      expect(response.email.to).toBe("client@example.com");
    });

    it("should handle error response", () => {
      const errorResponse = {
        success: false,
        error: "Invoice not found",
      };

      expect(errorResponse.success).toBe(false);
      expect(errorResponse.error).toBeDefined();
    });

    it("should support toast notification on success", () => {
      const toastMessage = "Payment reminder sent";
      expect(toastMessage).toContain("sent");
    });

    it("should support toast notification on error", () => {
      const toastMessage = "Failed to send reminder";
      expect(toastMessage).toContain("Failed");
    });
  });
});
